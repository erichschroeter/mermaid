import DEFAULT_CONFIG, { configKeys } from '../../defaultConfig.js';
import type { MemoryConfig, MemoryStyle, TextStyle } from './memorymapTypes.js';

type Target = 'group' | 'section' | 'note';

const sourceNames: Record<string, keyof MemoryStyle> = {
  fill: 'fill',
  stroke: 'stroke',
  'stroke-width': 'strokeWidth',
  color: 'color',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'text-align': 'textAlign',
  'vertical-align': 'verticalAlign',
  'min-length': 'minLength',
};

const record = (value: unknown, path: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path} (${String(value)}) must be an object`);
  }
  return value as Record<string, unknown>;
};

const number = (value: unknown, path: string, allowZero = false): number => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    (allowZero ? value < 0 : value <= 0)
  ) {
    throw new Error(
      `${path} (${String(value)}) must be a finite ${allowZero ? 'nonnegative' : 'positive'} number`
    );
  }
  return value;
};

const property = (key: string, value: unknown, target: Target, path: string): MemoryStyle => {
  if (
    (key === 'minLength' && target !== 'section') ||
    (target === 'note' && ['fill', 'stroke', 'strokeWidth'].includes(key))
  ) {
    throw new Error(`${path} (${String(value)}) is not allowed on ${target}`);
  }
  switch (key) {
    case 'textAlign':
      if (value !== 'left' && value !== 'center' && value !== 'right') {
        throw new Error(`${path} (${String(value)}) must be left, center or right`);
      }
      return { textAlign: value };
    case 'verticalAlign':
      if (value !== 'top' && value !== 'middle' && value !== 'bottom') {
        throw new Error(`${path} (${String(value)}) must be top, middle or bottom`);
      }
      return { verticalAlign: value };
    case 'fill':
    case 'stroke':
    case 'color':
      if (
        typeof value !== 'string' ||
        (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value) && !(key !== 'color' && value === 'none'))
      ) {
        throw new Error(
          `${path} (${String(value)}) must be a three- or six-digit hex color${key === 'color' ? '' : ' or none'}`
        );
      }
      return { [key]: value };
    case 'fontFamily':
      if (
        typeof value !== 'string' ||
        !value.split(',').every((name) => /^[\p{L}\p{N}_ -]+$/u.test(name.trim()))
      ) {
        throw new Error(
          `${path} (${String(value)}) must contain nonempty, unquoted comma-separated font names`
        );
      }
      return { fontFamily: value };
    case 'fontWeight':
      if (
        value !== 'normal' &&
        value !== 'bold' &&
        !(typeof value === 'number' && value >= 100 && value <= 900 && value % 100 === 0)
      ) {
        throw new Error(
          `${path} (${String(value)}) must be normal, bold or a numeric multiple of 100 from 100 to 900`
        );
      }
      return { fontWeight: value };
    case 'strokeWidth':
    case 'fontSize':
    case 'minLength':
      return { [key]: number(value, path, key === 'strokeWidth') };
    default:
      throw new Error(`Unknown memorymap style property ${path}`);
  }
};

export const parseStyle = (payload: string, target: Target): MemoryStyle => {
  const declarations = payload.trim().replace(/;$/, '').split(';');
  const result: MemoryStyle = {};
  const seen = new Set<string>();
  for (const declaration of declarations) {
    const pair = declaration.split(':').map((part) => part.trim());
    if (pair.length !== 2 || !pair[0] || !pair[1]) {
      throw new Error('Memorymap style requires nonempty property:value declarations');
    }
    const [name, rawValue] = pair;
    const key = Object.hasOwn(sourceNames, name) ? sourceNames[name] : undefined;
    if (!key || seen.has(key)) {
      throw new Error(
        `${seen.has(name) || (key && seen.has(key)) ? 'Duplicate' : 'Unknown'} memorymap style property ${name}`
      );
    }
    seen.add(key);
    let value: string | number = rawValue;
    if (['fontSize', 'strokeWidth', 'minLength'].includes(key)) {
      if (!/^(?:\d+(?:\.\d+)?|\.\d+)(?:px)?$/.test(rawValue)) {
        throw new Error(`memorymap ${name} requires a decimal number, optionally followed by px`);
      }
      value = Number(rawValue.replace(/px$/, ''));
    } else if (key === 'fontWeight' && /^\d+$/.test(rawValue)) {
      value = Number(rawValue);
    }
    Object.assign(result, property(key, value, target, `memorymap.${name}`));
  }
  return result;
};

const configStyle = (value: unknown, target: Target): MemoryStyle => {
  if (value === undefined) {
    return {};
  }
  const result: MemoryStyle = {};
  for (const [key, val] of Object.entries(record(value, `memorymap.${target}Style`))) {
    if (val !== undefined) {
      Object.assign(result, property(key, val, target, `memorymap.${target}Style.${key}`));
    }
  }
  return result;
};

export const validateMemorymapConfig = (value: unknown, secure: readonly string[] = []): void => {
  if (value === undefined || secure.includes('memorymap')) {
    return;
  }
  // Validate before shared merging can discard nulls or mismatched types. Keep
  // the existing unknown-key and protected-key policy without changing sanitization.
  const filter = (object: Record<string, unknown>): Record<string, unknown> =>
    Object.fromEntries(
      Object.entries(object)
        .filter(([key]) => configKeys.has(key) && key !== 'secure' && !secure.includes(key))
        .map(([key, val]) => [
          key,
          val && typeof val === 'object' && !Array.isArray(val) ? filter(record(val, key)) : val,
        ])
    );
  resolveMemoryConfig({ memorymap: filter(record(value, 'memorymap')) });
};

export const resolveMemoryConfig = (input: unknown): MemoryConfig => {
  const global = record(input, 'Mermaid config');
  const config = global.memorymap === undefined ? {} : record(global.memorymap, 'memorymap');
  const theme = {
    ...DEFAULT_CONFIG.themeVariables,
    ...(global.themeVariables === undefined ? {} : record(global.themeVariables, 'themeVariables')),
  };
  const fontSize = number(
    typeof theme.fontSize === 'string' ? Number(theme.fontSize.replace(/px$/, '')) : theme.fontSize,
    'themeVariables.fontSize'
  );
  const text: Required<TextStyle> = {
    color: theme.primaryTextColor as string,
    fontFamily: (global.fontFamily ?? theme.fontFamily) as string,
    fontSize,
    fontWeight: 'normal',
    textAlign: 'left',
    verticalAlign: 'top',
  };
  const shares =
    config.laneShares === undefined ? {} : record(config.laneShares, 'memorymap.laneShares');
  const useMaxWidth = config.useMaxWidth === undefined ? false : config.useMaxWidth;
  if (typeof useMaxWidth !== 'boolean') {
    throw new Error(`memorymap.useMaxWidth (${JSON.stringify(useMaxWidth)}) must be a boolean`);
  }
  return {
    useMaxWidth,
    crossSize: number(
      config.crossSize === undefined ? 600 : config.crossSize,
      'memorymap.crossSize'
    ),
    wrapWidth: number(
      config.wrapWidth === undefined ? 240 : config.wrapWidth,
      'memorymap.wrapWidth'
    ),
    padding: number(config.padding === undefined ? 8 : config.padding, 'memorymap.padding', true),
    laneShares: {
      label: number(shares.label === undefined ? 33 : shares.label, 'memorymap.laneShares.label'),
      section: number(
        shares.section === undefined ? 33 : shares.section,
        'memorymap.laneShares.section'
      ),
      note: number(shares.note === undefined ? 34 : shares.note, 'memorymap.laneShares.note'),
    },
    groupStyle: {
      ...text,
      fill: 'none',
      stroke: 'none',
      strokeWidth: 1,
      minLength: 0,
      ...configStyle(config.groupStyle, 'group'),
    },
    sectionStyle: {
      ...text,
      fill: theme.primaryColor as string,
      stroke: theme.primaryBorderColor as string,
      strokeWidth: 1,
      minLength: 80,
      ...configStyle(config.sectionStyle, 'section'),
    },
    noteStyle: {
      ...text,
      color: (theme.noteTextColor ?? theme.primaryTextColor) as string,
      ...configStyle(config.noteStyle, 'note'),
    },
  };
};
