import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { diagramSvg, renderGraph } from '../../../helpers/util';
import { expectCompleteBounds, expectContainedSections } from '../utils';

const fixtures = join(import.meta.dirname, '../../..', 'diagrams/memorymap/pr-check');

for (const name of readdirSync(fixtures)
  .filter((file) => file.endsWith('.mmd'))
  .sort()) {
  test(`complete, contained geometry: ${name}`, async ({ page }, testInfo) => {
    const source = readFileSync(join(fixtures, name), 'utf8');
    await renderGraph(page, testInfo, source, { screenshot: false });
    if (name.startsWith('dark-')) {
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(63, 63, 63)');
    }
    await expectCompleteBounds(page);
    const sections = page.locator('.memorymap-section');
    expect(await sections.count()).toBe((source.match(/^\s*section(?:\s|$)/gm) ?? []).length);
    await expectContainedSections(page);
    await expect(diagramSvg(page)).toHaveAttribute('aria-roledescription', 'memorymap');
    await expect(diagramSvg(page).locator('title')).toHaveCount(1);
    await expect(diagramSvg(page).locator('foreignObject, a, b')).toHaveCount(0);
  });
}

for (const orientation of ['vertical', 'horizontal'] as const) {
  for (const target of ['section', 'group'] as const) {
    test(`touching groups paint a single ${target} border width: ${orientation}`, async ({
      page,
    }, testInfo) => {
      await renderGraph(
        page,
        testInfo,
        `memorymap-beta ${orientation}
group "A"
 section
group "B"
 section`,
        {
          screenshot: false,
          memorymap: {
            padding: 0,
            groupStyle: { stroke: '#000000', strokeWidth: target === 'group' ? 4 : 0 },
            sectionStyle: {
              fill: '#FFFFFF',
              stroke: '#000000',
              strokeWidth: target === 'section' ? 4 : 0,
              minLength: 60,
            },
          },
        }
      );
      const paintedWidths = await diagramSvg(page).evaluate(
        async (svg, { vertical, target }) => {
          const bodies = [
            ...svg.querySelectorAll<SVGGElement>(`.memorymap-${target} > .memorymap-body`),
          ];
          const box = bodies[0].querySelector<SVGRectElement>('.memorymap-box')!.getBBox();
          const points = bodies.map((body) =>
            new DOMPoint(
              vertical ? box.x + box.width / 2 : 0,
              vertical ? 0 : box.y + box.height / 2
            ).matrixTransform(body.getCTM()!)
          );
          const [, , width, height] = svg.getAttribute('viewBox')!.split(' ').map(Number);
          const clone = svg.cloneNode(true) as SVGSVGElement;
          clone.setAttribute('width', String(width));
          clone.setAttribute('height', String(height));
          const image = new Image();
          image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
          await image.decode();
          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil(width);
          canvas.height = Math.ceil(height);
          const context = canvas.getContext('2d')!;
          context.drawImage(image, 0, 0, width, height);
          const count = (point: DOMPoint) => {
            const { data } = context.getImageData(
              Math.floor(point.x) - (vertical ? 0 : 12),
              Math.floor(point.y) - (vertical ? 12 : 0),
              vertical ? 1 : 24,
              vertical ? 24 : 1
            );
            let pixels = 0;
            for (let index = 0; index < data.length; index += 4) {
              if (
                data[index] < 16 &&
                data[index + 1] < 16 &&
                data[index + 2] < 16 &&
                data[index + 3] > 240
              ) {
                pixels++;
              }
            }
            return pixels;
          };
          return { outer: count(points[0]), shared: count(points[1]) };
        },
        { vertical: orientation === 'vertical', target }
      );
      expect(paintedWidths).toEqual({ outer: 4, shared: 4 });
    });
  }

  test(`text alignment in section boxes: ${orientation}`, async ({ page }, testInfo) => {
    const alignments = [
      ['left', 'top'],
      ['center', 'middle'],
      ['right', 'bottom'],
    ];
    const source = [
      `memorymap-beta ${orientation}`,
      'group "Alignment"',
      ...alignments.flatMap(([horizontal, vertical]) => [
        ' section "WIDE\\ni\\nA longer line that automatically wraps into shorter lines"',
        `  style "text-align:${horizontal}; vertical-align:${vertical}; min-length:300"`,
        '  label "Entry"',
        '  note "Independent note"',
        `  noteStyle "text-align:${horizontal}; vertical-align:${vertical}"`,
      ]),
    ].join('\n');
    await renderGraph(page, testInfo, source, {
      screenshot: false,
      memorymap: { crossSize: 900, sectionStyle: { fontFamily: 'monospace' } },
    });
    const positions = await diagramSvg(page).evaluate((svg) =>
      [...svg.querySelectorAll<SVGGElement>('.memorymap-section')].map((section) => {
        const rect = section.querySelector<SVGRectElement>('.memorymap-box')!;
        const text = section.querySelector<SVGTextElement>('.memorymap-content')!;
        const bounds = rect.getBBox();
        const inset = Number.parseFloat(getComputedStyle(rect).strokeWidth) / 2 + 8;
        const content = text.getBBox();
        return {
          left: bounds.x + inset,
          top: bounds.y + inset,
          width: bounds.width - 2 * inset,
          height: bounds.height - 2 * inset,
          content: { y: content.y, height: content.height },
          lines: [...text.querySelectorAll('tspan')].map((line) => {
            const box = line.getBBox();
            return { x: box.x, width: box.width };
          }),
        };
      })
    );
    expect(positions).toHaveLength(3);
    for (const [index, position] of positions.entries()) {
      const fraction = index / 2;
      expect(position.lines.length).toBeGreaterThan(3);
      for (const line of position.lines) {
        expect(
          Math.abs(line.x - (position.left + (position.width - line.width) * fraction))
        ).toBeLessThan(2);
      }
      expect(
        Math.abs(
          position.content.y -
            (position.top + (position.height - position.content.height) * fraction)
        )
      ).toBeLessThan(5);
    }
    await expectCompleteBounds(page);
    await expectContainedSections(page);
  });

  test(`source order, owner-only styles, and host scrolling: ${orientation}`, async ({
    page,
  }, testInfo) => {
    const source = `memorymap-beta ${orientation}
accTitle: Complete layout
accDescr: Parent and children with literal labels and independent styles.
group "Bank A"
 section "Parent"
  style "fill:#ff0000; color:#ff0000; font-size:24; stroke-width:12"
  note "Parent note"
  section "First"
   label "Bank A"
   note "Child note"
  section "Second"
 section "Neighbor"
group "Bank B"
 section "Last"`;
    await renderGraph(page, testInfo, source, { screenshot: false });
    await expectCompleteBounds(page);
    const parent = page.locator('[data-memorymap-id="memorymap-1"]');
    const child = page.locator('[data-memorymap-id="memorymap-2"]');
    await expect(parent.locator(':scope > .memorymap-body > rect')).toHaveCSS(
      'fill',
      'rgb(255, 0, 0)'
    );
    await expect(child.locator(':scope > .memorymap-body > rect')).not.toHaveCSS(
      'fill',
      'rgb(255, 0, 0)'
    );
    await expect(child.locator(':scope > .memorymap-body > .memorymap-content')).toHaveCSS(
      'font-size',
      '16px'
    );
    await expect(parent.locator(':scope > .memorymap-note')).not.toHaveCSS(
      'fill',
      'rgb(255, 0, 0)'
    );
    const first = await child.boundingBox();
    const second = await page.locator('[data-memorymap-id="memorymap-3"]').boundingBox();
    expect(second![orientation === 'vertical' ? 'y' : 'x']).toBeGreaterThan(
      first![orientation === 'vertical' ? 'y' : 'x']
    );
    await expect(diagramSvg(page).locator('desc')).toHaveText(
      'Parent and children with literal labels and independent styles.'
    );
    const scroll = await diagramSvg(page).evaluate((svg) => {
      const host = document.createElement('div');
      host.style.cssText = 'width:200px;height:120px;overflow:auto';
      svg.parentElement!.append(host);
      host.append(svg);
      host.scrollTop = host.scrollHeight;
      host.scrollLeft = host.scrollWidth;
      return { x: host.scrollLeft, y: host.scrollTop };
    });
    expect(scroll[orientation === 'vertical' ? 'y' : 'x']).toBeGreaterThan(0);
  });

  test(`intrinsic and responsive SVG retain the same full layout: ${orientation}`, async ({
    page,
  }, testInfo) => {
    const source = `memorymap-beta ${orientation}
group "A"
 section "Content"
  note "A long reference: ${'unbroken'.repeat(30)}"
 section`;
    await renderGraph(page, testInfo, source, { screenshot: false });
    const svg = diagramSvg(page);
    const viewBox = await svg.getAttribute('viewBox');
    expect(Number(await svg.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(await svg.getAttribute('height'))).toBeGreaterThan(0);
    await renderGraph(page, testInfo, source, {
      screenshot: false,
      memorymap: { useMaxWidth: true },
    });
    await expect(svg).toHaveAttribute('width', '100%');
    await expect(svg).toHaveAttribute('viewBox', viewBox!);
    await expectCompleteBounds(page);
    const exported = await svg.evaluate((element) => {
      const serialized = new XMLSerializer().serializeToString(element);
      const standalone = new DOMParser().parseFromString(serialized, 'image/svg+xml');
      return {
        errors: standalone.querySelectorAll('parsererror').length,
        sections: standalone.querySelectorAll('.memorymap-section').length,
        text: standalone.querySelector('.memorymap-note')?.textContent,
      };
    });
    expect(exported.errors).toBe(0);
    expect(exported.sections).toBe(2);
    expect(exported.text).toBe(`A long reference: ${'unbroken'.repeat(30)}`);
  });
}

test('literal SVG text, explicit line breaks, theme fonts and a rendered title', async ({
  page,
}, testInfo) => {
  await renderGraph(
    page,
    testInfo,
    String.raw`---
title: Literal storage
config:
  memorymap:
    sectionStyle: {fontFamily: monospace, fontSize: 20}
---
memorymap-beta
accTitle: Accessible storage
group "A"
 section "<b>Literal</b>\n**not markdown** #123;"
  style "fill:#fff; stroke:#123; stroke-width:20;"
  note "https://example.invalid/path and C:\\firmware"
  noteStyle "font-size:10px"
`,
    { screenshot: false }
  );
  const content = diagramSvg(page).locator('.memorymap-content');
  await expect(content).toHaveCSS('font-family', 'monospace');
  await expect(content).toHaveCSS('font-size', '20px');
  await expect(content).toHaveText('<b>Literal</b>**not markdown** #123;');
  expect(await content.locator('tspan').count()).toBeGreaterThanOrEqual(2);
  await expect(diagramSvg(page).locator('.memorymap-title')).toHaveText('Literal storage');
  await expect(diagramSvg(page).locator('b, a, foreignObject')).toHaveCount(0);
  await expectCompleteBounds(page);
});

test('Dev Explorer lists the permanent memorymap fixtures', async ({ page }) => {
  await page.goto('/dev/?path=diagrams');
  await expect(page.getByText('memorymap', { exact: true })).toBeVisible();
  await page.goto('/dev/?path=diagrams/memorymap/pr-check');
  for (const name of [
    'boot-vertical',
    'boot-horizontal',
    'nested-vertical',
    'configured-horizontal',
    'long-notes-vertical',
  ]) {
    await expect(page.getByText(`${name}.mmd`, { exact: true })).toBeVisible();
  }
});
