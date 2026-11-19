import { expect, type Page } from '@playwright/test';
import { diagramSvg } from '../../helpers/util';

export const expectCompleteBounds = async (page: Page): Promise<void> => {
  const failures = await diagramSvg(page).evaluate((element) => {
    const svg = element as SVGSVGElement;
    const view = svg.viewBox.baseVal;
    const failures: string[] = [];
    if (
      ![view.x, view.y, view.width, view.height].every(Number.isFinite) ||
      view.width <= 0 ||
      view.height <= 0
    ) {
      failures.push('non-finite or empty SVG');
    }
    const inverse = svg.getCTM()!.inverse();
    for (const item of svg.querySelectorAll<SVGGraphicsElement>('rect, text')) {
      const box = item.getBBox();
      const stroke =
        item.tagName === 'rect' ? Number.parseFloat(getComputedStyle(item).strokeWidth) / 2 : 0;
      const matrix = inverse.multiply(item.getCTM()!);
      for (const [x, y] of [
        [box.x - stroke, box.y - stroke],
        [box.x + box.width + stroke, box.y + box.height + stroke],
      ]) {
        const point = new DOMPoint(x, y).matrixTransform(matrix);
        if (
          !Number.isFinite(point.x) ||
          !Number.isFinite(point.y) ||
          point.x < view.x - 0.1 ||
          point.y < view.y - 0.1 ||
          point.x > view.x + view.width + 0.1 ||
          point.y > view.y + view.height + 0.1
        ) {
          failures.push(`${item.tagName}.${item.getAttribute('class')}: ${point.x}, ${point.y}`);
        }
      }
    }
    return failures;
  });
  expect(failures).toEqual([]);
};

export const expectContainedSections = async (page: Page): Promise<void> => {
  const failures = await diagramSvg(page).evaluate((svg) => {
    const failures: string[] = [];
    for (const section of svg.querySelectorAll<SVGGElement>('.memorymap-section')) {
      const parentBox = section.parentElement
        ?.querySelector(':scope > rect')
        ?.getBoundingClientRect();
      const child = section.getBoundingClientRect();
      if (
        !parentBox ||
        child.left < parentBox.left - 0.1 ||
        child.top < parentBox.top - 0.1 ||
        child.right > parentBox.right + 0.1 ||
        child.bottom > parentBox.bottom + 0.1
      ) {
        failures.push(section.dataset.memorymapId ?? 'missing section ID');
      }
    }
    return failures;
  });
  expect(failures).toEqual([]);
};
