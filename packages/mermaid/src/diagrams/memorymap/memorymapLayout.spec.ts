import { describe, expect, it } from 'vitest';
import { parseMemoryMap } from './parser/memorymapParser.js';
import { resolveMemoryConfig } from './memorymapStyle.js';
import { layoutMemoryMap, wrapText } from './memorymapLayout.js';
import type { MeasureText } from './memorymapLayout.js';

const measure: MeasureText = (text, style) => ({
  width: [...text].length * style.fontSize * 0.6,
  ascent: style.fontSize * 0.8,
  descent: style.fontSize * 0.2,
  left: 0,
});
const config = resolveMemoryConfig({});

describe('memorymap layout', () => {
  it('wraps words and unbroken text without losing text or explicit line breaks', () => {
    const text = 'A long note with words\n' + 'x'.repeat(100);
    const wrapped = wrapText(text, 80, config.noteStyle, measure);
    expect(wrapped.lines.join('')).toBe(text.replace('\n', ''));
    expect(wrapped.lines.length).toBeGreaterThan(10);
    expect(wrapped.width).toBeLessThanOrEqual(80);
  });

  it('aligns sibling lanes, grows only the section needing space and abuts sections', () => {
    const model = parseMemoryMap(`memorymap-beta
group "A"
  section "First"
    label "Entry"
    note "${'Long note. '.repeat(60)}"
  section "Second"`);
    const [first, second] = layoutMemoryMap(model, config, measure).nodes[0].children;
    expect(first.box.x).toBe(second.box.x);
    expect(first.box.width).toBe(second.box.width);
    expect(first.box.height).toBeGreaterThan(second.box.height);
    expect(second.box.height).toBe(80);
    expect(second.y).toBe(first.y + first.height);
    expect(first.note!.height).toBeLessThan(first.height);
  });

  it.each(['vertical', 'horizontal'])(
    'encloses children below a parent header in %s',
    (orientation) => {
      const source = `memorymap-beta ${orientation}
group "A"
  section "Parent"
    style "fill:#f00; color:#f00; font-size:30; min-length:1000"
    note "Independent note"
    section "Child"
      note "Child note"
    section`;
      const parent = layoutMemoryMap(parseMemoryMap(source), config, measure).nodes[0].children[0];
      const [child, blank] = parent.children;
      expect(child.y).toBeGreaterThanOrEqual(parent.content!.y + parent.content!.height);
      expect(child.x).toBeGreaterThanOrEqual(0);
      expect(child.x + child.width).toBeLessThanOrEqual(parent.box.width);
      expect(child.y + child.height).toBeLessThanOrEqual(parent.box.height);
      expect(child.style.fill).toBe(config.sectionStyle.fill);
      expect(child.style.fontSize).toBe(config.sectionStyle.fontSize);
      expect(parent.note!.style.color).toBe(config.noteStyle.color);
      expect(blank.content).toBeUndefined();
      if (orientation === 'vertical') {
        expect(parent.box.height).toBe(1000);
        expect(child.box.height).toBe(80);
      } else {
        expect(parent.box.width).toBe(1000);
        expect(child.box.width).toBeLessThan(1000);
      }
    }
  );

  it('keeps geometry when borders are hidden or responsive fitting is enabled', () => {
    const source = 'memorymap-beta\ngroup "A"\n section "Body"';
    const plain = layoutMemoryMap(parseMemoryMap(source), config, measure);
    const hidden = layoutMemoryMap(
      parseMemoryMap(`${source}\n  style "stroke:none"`),
      { ...config, useMaxWidth: true },
      measure
    );
    expect([hidden.width, hidden.height]).toEqual([plain.width, plain.height]);
    expect(hidden.nodes[0].children[0].box).toEqual(plain.nodes[0].children[0].box);
  });
});
