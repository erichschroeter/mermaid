import { beforeEach, describe, expect, it } from 'vitest';
import mermaid from '../../mermaid.js';
import { reset } from '../../config.js';
import { db, parser } from './memorymapDb.js';
import { memorymap } from './memorymapDetector.js';

describe('native memorymap integration', () => {
  beforeEach(() => {
    mermaid.initialize({ startOnLoad: false });
    reset();
    db.clear();
  });

  it('requires the complete case-sensitive memorymap-beta keyword', () => {
    expect(memorymap.detector(' memorymap-beta vertical\n')).toBe(true);
    expect(memorymap.detector('memorymap-beta')).toBe(true);
    expect(memorymap.detector('memorymap')).toBe(false);
    expect(memorymap.detector('memorymap vertical')).toBe(false);
    expect(memorymap.detector('memorymap-beta-extra')).toBe(false);
    expect(memorymap.detector('memorymapper')).toBe(false);
    expect(memorymap.detector('Memorymap-beta')).toBe(false);
  });

  it('preserves literal strings and quoted style separators through the public parse path', async () => {
    await mermaid.parse(`memorymap-beta
group "A"
 section "<b>literal</b> #123; **not markdown** https://example.invalid"
  style "fill:#fff; stroke:#123; font-size:12;"
  note "#copy; & literal"`);
    expect(db.getModel().groups[0].children[0]).toMatchObject({
      content: '<b>literal</b> #123; **not markdown** https://example.invalid',
      style: { fill: '#fff', stroke: '#123', fontSize: 12 },
      note: '#copy; & literal',
    });
  });

  it('retains all registered configuration keys and merges frontmatter field-wise', async () => {
    mermaid.initialize({
      startOnLoad: false,
      memorymap: { sectionStyle: { fill: '#abc', color: '#123', fontWeight: 700 } },
    });
    await mermaid.parse(`---
title: Boot map
config:
  memorymap:
    crossSize: 720
    wrapWidth: 180
    padding: 12
    useMaxWidth: true
    laneShares: {label: 1, section: 2, note: 3}
    groupStyle: {fill: '#fff', stroke: '#abc', strokeWidth: 3}
    sectionStyle: {minLength: 140, strokeWidth: 4, fontFamily: 'Arial, serif', fontSize: 18}
    noteStyle: {color: '#456', fontSize: 11, fontFamily: serif, fontWeight: bold}
---
memorymap-beta
group "A"
 section "Boot"`);
    expect(db.getConfig()).toMatchObject({
      crossSize: 720,
      wrapWidth: 180,
      padding: 12,
      useMaxWidth: true,
      laneShares: { label: 1, section: 2, note: 3 },
      groupStyle: { fill: '#fff', stroke: '#abc', strokeWidth: 3 },
      sectionStyle: {
        fill: '#abc',
        color: '#123',
        fontWeight: 700,
        minLength: 140,
        strokeWidth: 4,
        fontFamily: 'Arial, serif',
        fontSize: 18,
      },
      noteStyle: { color: '#456', fontSize: 11, fontFamily: 'serif', fontWeight: 'bold' },
    });
  });

  it('reports invalid registered YAML values instead of using defaults', async () => {
    await expect(
      mermaid.parse(`---
config:
  memorymap:
    sectionStyle: {fontSize: 0}
---
memorymap-beta
group "A"
 section`)
    ).rejects.toThrow(/memorymap.sectionStyle.fontSize/);
  });

  it.each([
    ['null', /memorymap/],
    ['{crossSize: null}', /memorymap.crossSize/],
    ['{sectionStyle: wrong}', /memorymap.sectionStyle/],
    ['{laneShares: []}', /memorymap.laneShares/],
    ['{sectionStyle: {fontFamily: 12}}', /memorymap.sectionStyle.fontFamily/],
  ])('validates raw values before shared merging can discard them: %s', async (value, path) => {
    await expect(
      mermaid.parse(`---
config:
  memorymap: ${value}
---
memorymap-beta
group "A"
 section`)
    ).rejects.toThrow(path);
  });

  it('retains shared unknown-key and protected-key behavior', async () => {
    mermaid.initialize({
      startOnLoad: false,
      secure: ['memorymap'],
      memorymap: { crossSize: 720 },
    });
    await mermaid.parse(`---
config:
  memorymap: {crossSize: null}
---
memorymap-beta
group "A"
 section`);
    expect(db.getConfig().crossSize).toBe(720);
    mermaid.initialize({
      startOnLoad: false,
      secure: ['fontSize'],
      memorymap: { sectionStyle: { fontSize: 18 } },
    });
    await mermaid.parse(`---
config:
  memorymap:
    sectionStyle: {fontSize: null}
---
memorymap-beta
group "A"
 section`);
    expect(db.getConfig().sectionStyle.fontSize).toBe(18);
    mermaid.initialize({ startOnLoad: false });
    await mermaid.parse(`---
config:
  memorymap:
    sectionStyle: {notARegisteredOption: ignored}
---
memorymap-beta
group "A"
 section`);
    expect(db.getConfig().sectionStyle.minLength).toBe(80);
  });

  it('validates raw initialization options before cloning discards invalid values', () => {
    expect(() => mermaid.initialize(JSON.parse('{"memorymap":null}'))).toThrow(/memorymap/);
    expect(() => mermaid.initialize(JSON.parse('{"memorymap":{"sectionStyle":"wrong"}}'))).toThrow(
      /memorymap.sectionStyle/
    );
  });

  it('resets model and accessibility state after success and failure', async () => {
    await parser.parse('memorymap-beta horizontal\naccTitle: Old\ngroup "A"\n section "Old"');
    await expect(parser.parse('memorymap-beta\ngroup "broken"')).rejects.toThrow();
    expect(db.getModel().groups).toEqual([]);
    expect(db.getAccTitle()).toBe('');
    await parser.parse('memorymap-beta\ngroup "new"\n section');
    expect(db.getModel().orientation).toBe('vertical');
    expect(db.getModel().groups[0].label).toBe('new');
    expect(db.getAccTitle()).toBe('');
  });
});
