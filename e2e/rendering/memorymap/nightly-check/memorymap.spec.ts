import { expect, test } from '@playwright/test';
import { diagramSvg, renderGraph } from '../../../helpers/util';
import { expectCompleteBounds, expectContainedSections } from '../utils';
import type { Mermaid } from '../../../../packages/mermaid/src/mermaid.js';

for (const orientation of ['vertical', 'horizontal'] as const) {
  test(`1,000 sections and a depth-10 path: ${orientation}`, async ({
    page,
    browser,
  }, testInfo) => {
    const lines = [`memorymap-beta ${orientation}`, 'group "Scale check"'];
    for (let depth = 1; depth <= 10; depth++) {
      lines.push(`${' '.repeat(depth)}section "Depth ${depth}"`);
    }
    for (let index = 10; index < 1000; index++) {
      lines.push(` section "Section ${index}"`);
    }
    await renderGraph(page, testInfo, 'memorymap-beta\ngroup "Warmup"\n section', {
      screenshot: false,
    });
    // Keep generated input out of the viewer's query string and HTTP request-size limits.
    const elapsedMs = await page.evaluate(async (source) => {
      const { default: api }: { default: Mermaid } = await import(
        new URL('/mermaid.esm.mjs', location.href).href
      );
      api.initialize({ startOnLoad: false, maxTextSize: 100_000 });
      const started = performance.now();
      const { svg } = await api.render('scale-map', source);
      document.body.innerHTML = svg;
      return performance.now() - started;
    }, lines.join('\n'));
    await expect(page.locator('.memorymap-section')).toHaveCount(1000);
    await expect(page.locator('.memorymap-content').last()).toHaveText('Section 999');
    await expectCompleteBounds(page);
    await expectContainedSections(page);
    const geometry = await diagramSvg(page).evaluate((svg, vertical) => {
      const nodes = [...svg.querySelectorAll<SVGGElement>('.memorymap-section')];
      return {
        ordered: [...svg.querySelectorAll('.memorymap-body')].every((body) => {
          const children = [...body.querySelectorAll(':scope > .memorymap-section')];
          return children.every((node, index) => {
            if (!index) {
              return true;
            }
            const previous = children[index - 1].getBoundingClientRect();
            const current = node.getBoundingClientRect();
            return vertical
              ? current.top >= previous.bottom - 0.1
              : current.left >= previous.right - 0.1;
          });
        }),
        ids: nodes.map((node) => Number(node.dataset.memorymapId!.split('-')[1])),
        content: nodes.map(
          (node) => node.querySelector(':scope > .memorymap-body > .memorymap-content')?.textContent
        ),
        depth: Math.max(
          ...nodes.map((node) => {
            let depth = 0;
            let owner = node.parentElement;
            while (owner) {
              if (owner.classList.contains('memorymap-section')) {
                depth++;
              }
              owner = owner.parentElement;
            }
            return depth + 1;
          })
        ),
        fonts: [
          ...new Set(
            [...svg.querySelectorAll('text')].map((text) => getComputedStyle(text).fontFamily)
          ),
        ],
      };
    }, orientation === 'vertical');
    expect(geometry.depth).toBe(10);
    expect(geometry.ordered).toBe(true);
    expect(geometry.ids).toEqual(Array.from({ length: 1000 }, (_, index) => index + 1));
    expect(geometry.content).toEqual(
      Array.from({ length: 1000 }, (_, index) =>
        index < 10 ? `Depth ${index + 1}` : `Section ${index}`
      )
    );
    const measurement = {
      orientation,
      sections: 1000,
      depth: geometry.depth,
      elapsedMs,
      browser: browser.version(),
      platform: process.platform,
      arch: process.arch,
      fonts: geometry.fonts,
    };
    await testInfo.attach('scale-measurement', {
      body: JSON.stringify(measurement, null, 2),
      contentType: 'application/json',
    });
    console.info('memorymap scale measurement', JSON.stringify(measurement));
  });
}
