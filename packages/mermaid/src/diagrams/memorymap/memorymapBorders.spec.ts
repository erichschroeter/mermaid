import { describe, expect, it } from 'vitest';
import { collapseBorders } from './memorymapBorders.js';
import type { PlacedNode, Rect } from './memorymapLayout.js';
import { resolveMemoryConfig } from './memorymapStyle.js';
import { parseMemoryMap } from './parser/memorymapParser.js';

const config = resolveMemoryConfig({});
const section = parseMemoryMap('memorymap-beta\ngroup "A"\n section').groups[0].children[0];
const box = (
  x: number,
  y: number,
  width = 100,
  height = 50,
  strokeWidth = 2,
  stroke = '#000'
): PlacedNode => ({
  x,
  y,
  width,
  height,
  box: { x: 0, y: 0, width, height },
  node: section,
  style: { ...config.sectionStyle, strokeWidth, stroke },
  children: [],
});
const painted = (parts: Rect[], x: number, y: number): boolean =>
  parts.some(
    (part) => x >= part.x && x < part.x + part.width && y >= part.y && y < part.y + part.height
  );

describe('memorymap shared borders', () => {
  it.each(['vertical', 'horizontal'])(
    'keeps one shared edge and all outer edges in %s',
    (orientation) => {
      const first = box(0, 0);
      const next = orientation === 'vertical' ? box(0, 50) : box(100, 0);
      const collapsed = collapseBorders([first, next]);
      expect(collapsed.has(next)).toBe(false);
      const parts = collapsed.get(first)!;
      expect(painted(parts, 1, 1)).toBe(true);
      expect(painted(parts, 1, 25)).toBe(true);
      expect(
        painted(parts, orientation === 'vertical' ? 50 : 99, orientation === 'vertical' ? 49 : 25)
      ).toBe(false);
    }
  );

  it('keeps the wider stroke even when the narrower neighbor is painted later', () => {
    const wide = box(0, 0, 100, 50, 6, '#f00');
    const thin = box(0, 50, 100, 50, 2, '#00f');
    const collapsed = collapseBorders([wide, thin]);
    expect(collapsed.has(wide)).toBe(false);
    expect(painted(collapsed.get(thin)!, 50, 1)).toBe(false);
    expect(painted(collapsed.get(thin)!, 50, 49)).toBe(true);
  });

  it('removes only the overlapping part of a shared edge', () => {
    const first = box(0, 0);
    const next = box(50, 50);
    const parts = collapseBorders([first, next]).get(first)!;
    expect(painted(parts, 25, 49)).toBe(true);
    expect(painted(parts, 75, 49)).toBe(false);
    expect(painted(parts, 99, 25)).toBe(true);
  });

  it('leaves separated, hidden, and zero-width borders unchanged', () => {
    for (const next of [box(0, 51), box(0, 50, 100, 50, 2, 'none'), box(0, 50, 100, 50, 0)]) {
      expect(collapseBorders([box(0, 0), next]).size).toBe(0);
    }
  });

  it('matches touching edges despite floating-point rounding error', () => {
    const first = box(0, 0.1, 100, 40.2);
    const next = box(0, 40.3);
    expect(collapseBorders([first, next]).has(first)).toBe(true);
  });

  it('finds shared edges across nested group transforms', () => {
    const child = box(5, 5, 50, 20);
    const parent = box(10, 20, 100, 50, 0, 'none');
    parent.box.x = 7;
    parent.box.y = 9;
    parent.children.push(child);
    const next = box(22, 54, 50, 20);
    const collapsed = collapseBorders([parent, next]);
    expect(collapsed.has(parent)).toBe(false);
    expect(painted(collapsed.get(child)!, 25, 19)).toBe(false);
  });
});
