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
    style "fill:#f00; color:#f00; font-size:30; min-length:1000; text-align:center; vertical-align:bottom"
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
      expect(child.style.textAlign).toBe('left');
      expect(parent.content!.y).toBe(config.padding + parent.style.strokeWidth);
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

  for (const orientation of ['vertical', 'horizontal']) {
    it.each([
      ['left', 'top', 0],
      ['center', 'middle', 0.5],
      ['right', 'bottom', 1],
    ] as const)(
      `places %s/%s text in the final ${orientation} box`,
      (horizontal, vertical, fraction) => {
        const source = `memorymap-beta ${orientation}
group "A"
 section "Wide\\nI"
  style "text-align:${horizontal}; vertical-align:${vertical}; min-length:400"
  label "Entry"
  note "Note"
  noteStyle "text-align:${horizontal}; vertical-align:${vertical}"
 section "A wider neighboring section"`;
        const item = layoutMemoryMap(parseMemoryMap(source), config, measure).nodes[0].children[0];
        const inset = config.padding + item.style.strokeWidth;
        const content = item.content!;
        expect(content.x).toBeCloseTo(
          inset + (item.box.width - 2 * inset - content.width) * fraction
        );
        expect(content.y).toBeCloseTo(
          inset + (item.box.height - 2 * inset - content.height) * fraction
        );
        const label = item.label!;
        const note = item.note!;
        if (orientation === 'vertical') {
          expect(label.y).toBeCloseTo(
            config.padding + (item.height - 2 * config.padding - label.height) * fraction
          );
          expect(note.y).toBeCloseTo(
            config.padding + (item.height - 2 * config.padding - note.height) * fraction
          );
        } else {
          expect(label.x).toBeCloseTo(
            config.padding + (item.width - 2 * config.padding - label.width) * fraction
          );
          expect(note.x).toBeCloseTo(
            config.padding + (item.width - 2 * config.padding - note.width) * fraction
          );
        }
      }
    );
  }

  it('aligns leaf text after a tall note grows its owner', () => {
    const source = `memorymap-beta
group "A"
 section "Body"
  style "min-length:20; vertical-align:bottom"
  note "${'Long note. '.repeat(60)}"`;
    const item = layoutMemoryMap(parseMemoryMap(source), config, measure).nodes[0].children[0];
    expect(item.box.height).toBeGreaterThan(80);
    expect(item.content!.y + item.content!.height).toBeCloseTo(
      item.box.height - config.padding - item.style.strokeWidth
    );
  });

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
