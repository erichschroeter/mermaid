import { describe, expect, it } from 'vitest';
import { parseMemoryMap } from './memorymapParser.js';

describe('memorymap parser', () => {
  it('preserves literal labels, blanks, recursive sections and property ownership', () => {
    const model = parseMemoryMap(String.raw`memorymap-beta horizontal
  %% Comments and blank lines do not establish indentation.
  accTitle: Storage
  accDescr {
    Literal entry labels, not calculated addresses.
  }
  group "Bank A"
    note "A group note"
    section "Parent\nheader"
      style "fill:#F4CCCC; min-length:120px;"
      section
      note "Parent note after a child"
      section "Child \"two\""
        label "0x0000"
        note "C:\\boot, <b>literal</b>, #123;"
        noteStyle "font-size:12; color:#123"
    section ""
  group "Bank A"
    section "Repeated labels are valid"`);
    expect(model.orientation).toBe('horizontal');
    expect(model.accTitle).toBe('Storage');
    expect(model.accDescription).toContain('Literal entry labels');
    expect(model.groups.map((group) => group.label)).toEqual(['Bank A', 'Bank A']);
    const parent = model.groups[0].children[0];
    expect(parent.content).toBe('Parent\nheader');
    expect(parent.style).toEqual({ fill: '#F4CCCC', minLength: 120 });
    expect(parent.note).toBe('Parent note after a child');
    expect(parent.children[0].content).toBe('');
    expect(parent.children[1]).toMatchObject({
      content: 'Child "two"',
      label: '0x0000',
      note: 'C:\\boot, <b>literal</b>, #123;',
      noteStyle: { fontSize: 12, color: '#123' },
    });
    expect(model.groups[0].note).toBe('A group note');
    expect(model.groups[0].children[1].content).toBe('');
    expect(new Set(model.groups.map((group) => group.id)).size).toBe(2);
  });

  it.each(['', ' vertical', ' horizontal'])(
    'accepts orientation %j and a zero baseline',
    (suffix) => {
      const model = parseMemoryMap(`memorymap-beta${suffix}\ngroup "start"\n section`);
      expect(model.orientation).toBe(suffix.trim() || 'vertical');
    }
  );

  it.each([
    ['memorymap-beta', /group/i],
    ['memorymap\ngroup "A"\n section', /expect/i],
    ['memorymap-beta diagonal\ngroup "A"\n section', /orientation/i],
    ['memorymap-beta\ngroup "A"', /section/i],
    ['memorymap-beta\ngroup ""\n section', /nonblank/i],
    ['memorymap-beta\ngroup "   "\n section', /nonblank/i],
    ['memorymap-beta\nsection "orphan"', /group|root/i],
    ['memorymap-beta\ngroup "A"\n group "B"\n  section', /group|root/i],
    ['memorymap-beta\ngroup "A"\n section\n   note "one"\n  note "bad dedent"', /indent/i],
    ['memorymap-beta\ngroup "A"\n section\n  note "one"\n   style "fill:#fff"', /indent/i],
    ['memorymap-beta\ngroup "A"\n\tsection', /spaces|character/i],
    ['memorymap-beta\ngroup "A"\n section\n  label "a"\n  label "b"', /duplicate/i],
    ['memorymap-beta\ngroup "A"\n note "a"\n section\n note "b"', /duplicate/i],
    ['memorymap-beta\ngroup "A"\n label "not allowed"\n section', /label/i],
    ['memorymap-beta\ngroup "A"\n section\n  noteStyle "color:#123"', /notestyle.*note/i],
    ['memorymap-beta\ngroup "A"\n section\n  accTitle: nested', /root|baseline/i],
    ['memorymap-beta\naccTitle: A\naccTitle: B\ngroup "A"\n section', /duplicate/i],
    ['memorymap-beta\naccDescr: A\naccDescr { B }\ngroup "A"\n section', /duplicate/i],
    ['memorymap-beta\ngroup "A"\n section unquoted', /quoted|expect/i],
    ['memorymap-beta\ngroup "A"\n section "bad\\q"', /json|escape/i],
    ['memorymap-beta\ngroup "A"\n section "unterminated', /character|quoted/i],
    ['memorymap-beta\ngroup "A"\n section "text" %% inline', /expect|inline/i],
    ['memorymap-beta\ngroup "A"\n section\n  style "fill:red"', /color|hex/i],
    ['memorymap-beta\ngroup "A"\n section\n  nonsense "unknown"', /expect|unknown/i],
    ['memorymap-beta\ngroup "A"\n section\nmemorymap-beta', /header/i],
    ['memorymap-beta\n0x00000000\n -', /expect|unknown/i],
  ])('rejects malformed input with body-relative source context: %j', (source, explanation) => {
    expect(() => parseMemoryMap(source)).toThrow(explanation);
    expect(() => parseMemoryMap(source)).toThrow(/body line \d+, column \d+[\S\s]*\^/);
  });
});
