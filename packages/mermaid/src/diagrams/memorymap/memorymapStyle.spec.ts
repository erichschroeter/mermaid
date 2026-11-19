import { describe, expect, it } from 'vitest';
import { parseStyle, resolveMemoryConfig } from './memorymapStyle.js';

describe('memorymap styles', () => {
  it('converts source properties to typed values without cascading', () => {
    expect(
      parseStyle(
        'fill:none; stroke:#123456; stroke-width:0px; color:#ABC; font-family:Open Sans, monospace; font-size:12.5px; font-weight:700; min-length:120;',
        'section'
      )
    ).toEqual({
      fill: 'none',
      stroke: '#123456',
      strokeWidth: 0,
      color: '#ABC',
      fontFamily: 'Open Sans, monospace',
      fontSize: 12.5,
      fontWeight: 700,
      minLength: 120,
    });
  });

  it.each([
    '',
    ';',
    'fill:#fff;;stroke:#000',
    'fill:',
    'fill:#fff;fill:#000',
    'width:20',
    'fill:red',
    'fill:#1234',
    'fill:rgb(1,2,3)',
    'color:none',
    'stroke-width:-1',
    'font-size:0',
    'font-size:1em',
    'min-length:Infinity',
    'font-weight:550',
    'font-family:url(font)',
    'font-family:Arial,,serif',
    'font-family:"Open Sans"',
  ])('rejects unsafe or invalid source style %j', (payload) => {
    expect(() => parseStyle(payload, 'section')).toThrow();
  });

  it('enforces property targets', () => {
    expect(() => parseStyle('min-length:10', 'group')).toThrow(/min-length|section/);
    expect(() => parseStyle('fill:#fff', 'note')).toThrow(/fill|note/);
    expect(() => parseStyle('stroke-width:1', 'note')).toThrow(/strokeWidth|note/);
  });

  it('merges diagram defaults field-wise over theme defaults', () => {
    const config = resolveMemoryConfig({
      themeVariables: {
        primaryColor: '#112233',
        primaryBorderColor: '#445566',
        primaryTextColor: '#778899',
        noteTextColor: '#AABBCC',
        fontFamily: 'serif',
        fontSize: '18px',
      },
      memorymap: { sectionStyle: { fill: '#fff' }, laneShares: { label: 1, section: 2, note: 3 } },
    });
    expect(config.useMaxWidth).toBe(false);
    expect(config.crossSize).toBe(600);
    expect(config.groupStyle.fill).toBe('none');
    expect(config.sectionStyle).toMatchObject({
      fill: '#fff',
      stroke: '#445566',
      color: '#778899',
      minLength: 80,
      fontSize: 18,
    });
    expect(config.noteStyle.color).toBe('#AABBCC');
    expect(config.laneShares).toEqual({ label: 1, section: 2, note: 3 });
  });

  it.each([
    { crossSize: 0 },
    { crossSize: null },
    { wrapWidth: Infinity },
    { padding: -1 },
    { useMaxWidth: 'false' },
    { useMaxWidth: null },
    { laneShares: { note: 0 } },
    { laneShares: { label: null } },
    { laneShares: [] },
    { sectionStyle: { fontSize: '12px' } },
    { sectionStyle: { fontWeight: '700' } },
    { sectionStyle: { fill: 'red' } },
    { noteStyle: { stroke: '#fff' } },
    { groupStyle: { minLength: 12 } },
    { sectionStyle: null },
  ])('validates runtime configuration %j', (memorymap) => {
    // Exercise untrusted YAML values, independently of generated compile-time types.
    expect(() => resolveMemoryConfig({ memorymap })).toThrow(/memorymap/);
  });
});
