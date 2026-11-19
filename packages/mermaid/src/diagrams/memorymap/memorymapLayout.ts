import type {
  MemoryConfig,
  MemoryMap,
  MemoryNode,
  MemoryStyle,
  TextStyle,
} from './memorymapTypes.js';

export interface TextMetrics {
  width: number;
  ascent: number;
  descent: number;
  left: number;
}
export type MeasureText = (text: string, style: Required<TextStyle>) => TextMetrics;

export interface TextBlock {
  lines: string[];
  metrics: TextMetrics[];
  width: number;
  height: number;
  lineHeight: number;
  baseline: number;
  style: Required<TextStyle>;
  x: number;
  y: number;
}
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface PlacedNode extends Rect {
  node: MemoryNode;
  box: Rect;
  style: Required<MemoryStyle>;
  label?: TextBlock;
  note?: TextBlock;
  content?: TextBlock;
  children: PlacedNode[];
}
interface Band {
  nodes: PlacedNode[];
  width: number;
  height: number;
}
export interface MemoryLayout extends Band {
  title?: TextBlock;
}

export const wrapText = (
  value: string,
  width: number,
  style: Required<TextStyle>,
  measure: MeasureText
): TextBlock => {
  const lines: string[] = [];
  for (const paragraph of value.split(/\r\n|\n|\r/)) {
    const characters = [...paragraph];
    if (!characters.length) {
      lines.push('');
    }
    let start = 0;
    while (start < characters.length) {
      let low = start + 1;
      let high = characters.length;
      let end = low;
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        if (measure(characters.slice(start, middle).join(''), style).width <= width) {
          end = middle;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }
      if (end < characters.length) {
        for (let index = end - 1; index > start; index--) {
          if (/\s/u.test(characters[index])) {
            end = index + 1;
            break;
          }
        }
      }
      lines.push(characters.slice(start, end).join(''));
      start = end;
    }
  }
  const metrics = lines.map((line) => measure(line, style));
  const sample = measure('Mg', style);
  const ascent = Math.max(sample.ascent, ...metrics.map((metric) => metric.ascent));
  const descent = Math.max(sample.descent, ...metrics.map((metric) => metric.descent));
  const lineHeight = Math.max(style.fontSize * 1.25, ascent + descent);
  return {
    lines,
    metrics,
    width: Math.max(0, ...metrics.map((metric) => metric.width)),
    height: lines.length * lineHeight,
    baseline: ascent + (lineHeight - ascent - descent) / 2,
    lineHeight,
    style,
    x: 0,
    y: 0,
  };
};

export const layoutMemoryMap = (
  model: MemoryMap,
  config: MemoryConfig,
  measure: MeasureText,
  diagramTitle = ''
): MemoryLayout => {
  const vertical = model.orientation === 'vertical';
  const { padding: gap } = config;
  const styles = new Map(
    allNodes(model.groups).map((node) => [
      node,
      { ...(node.kind === 'group' ? config.groupStyle : config.sectionStyle), ...node.style },
    ])
  );
  const result: MemoryLayout = siblings(model.groups, config.crossSize);
  if (diagramTitle) {
    result.title = wrapText(diagramTitle, config.wrapWidth, config.groupStyle, measure);
    result.title.x = gap;
    result.title.y = gap;
    result.width = Math.max(result.width, result.title.width);
    result.height += result.title.height + gap;
  }
  for (const node of result.nodes) {
    node.x += gap;
    node.y += gap + (result.title ? result.title.height + gap : 0);
  }
  result.width += 2 * gap;
  result.height += 2 * gap;
  if (![result.width, result.height].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error('Memorymap geometry exceeds finite SVG dimensions; reduce drawing sizes');
  }
  return result;

  function text(
    value: string | undefined,
    cross: number,
    style: Required<TextStyle>
  ): TextBlock | undefined {
    if (!value) {
      return undefined;
    }
    // Keep deeply nested text readable even when its preferred lane becomes very narrow.
    const preferred = vertical ? Math.min(config.wrapWidth, cross - 2 * gap) : config.wrapWidth;
    return wrapText(
      value,
      Math.max(Math.min(config.wrapWidth, style.fontSize * 6), preferred),
      style,
      measure
    );
  }

  function siblings(nodes: MemoryNode[], available: number): Band {
    if (!nodes.length) {
      return { nodes: [], width: 0, height: 0 };
    }
    const hasLabel = nodes.some((node) => Boolean(node.label));
    const hasNote = nodes.some((node) => Boolean(node.note));
    const active: (keyof MemoryConfig['laneShares'])[] = [
      'section',
      ...(hasLabel ? ['label' as const] : []),
      ...(hasNote ? ['note' as const] : []),
    ];
    const maxShare = Math.max(...active.map((lane) => config.laneShares[lane]));
    const total = active.reduce((sum, lane) => sum + config.laneShares[lane] / maxShare, 0);
    const space = Math.max(0, available - gap * (active.length - 1));
    const preferred = (lane: keyof MemoryConfig['laneShares']) =>
      (config.laneShares[lane] / maxShare / total) * space;
    const boxes = nodes.map((node) => box(node, preferred('section')));
    const labels = nodes.map((node) => text(node.label, preferred('label'), styles.get(node)!));
    const notes = nodes.map((node) =>
      text(node.note, preferred('note'), { ...config.noteStyle, ...node.noteStyle })
    );
    const extent = (blocks: (TextBlock | undefined)[]) =>
      Math.max(
        0,
        ...blocks.map((block) => (block ? (vertical ? block.width : block.height) + 2 * gap : 0))
      );
    const labelSize = hasLabel ? Math.max(preferred('label'), extent(labels)) : 0;
    const noteSize = hasNote ? Math.max(preferred('note'), extent(notes)) : 0;
    const sectionSize = Math.max(
      preferred('section'),
      ...boxes.map((item) => (vertical ? item.width : item.height))
    );
    const bodyOffset = hasLabel ? labelSize + gap : 0;
    const noteOffset = bodyOffset + sectionSize + gap;
    const cross = bodyOffset + sectionSize + (hasNote ? gap + noteSize : 0);
    let cursor = 0;
    const placed = nodes.map((node, index): PlacedNode => {
      if (index && node.kind === 'group') {
        cursor += gap;
      }
      const item = boxes[index];
      const label = labels[index];
      const note = notes[index];
      const length = Math.max(
        vertical ? item.height : item.width,
        ...[label, note].map((block) =>
          block ? (vertical ? block.height : block.width) + 2 * gap : 0
        )
      );
      if (label) {
        label.x = gap;
        label.y = gap;
      }
      if (note) {
        note.x = vertical ? noteOffset + gap : gap;
        note.y = vertical ? gap : noteOffset + gap;
      }
      const placedNode: PlacedNode = {
        ...item,
        node,
        style: styles.get(node)!,
        x: vertical ? 0 : cursor,
        y: vertical ? cursor : 0,
        width: vertical ? cross : length,
        height: vertical ? length : cross,
        box: {
          x: vertical ? bodyOffset : 0,
          y: vertical ? 0 : bodyOffset,
          width: vertical ? sectionSize : length,
          height: vertical ? length : sectionSize,
        },
        label,
        note,
      };
      cursor += length;
      return placedNode;
    });
    return { nodes: placed, width: vertical ? cross : cursor, height: vertical ? cursor : cross };
  }

  function box(
    node: MemoryNode,
    available: number
  ): {
    width: number;
    height: number;
    content?: TextBlock;
    children: PlacedNode[];
  } {
    const style = styles.get(node)!;
    // Box dimensions include the entire painted stroke, including when paint is hidden.
    const inset = gap + style.strokeWidth;
    const content = text(node.content, available - 2 * style.strokeWidth, style);
    const header = content ? content.height + (node.children.length ? gap : 0) : 0;
    const children = siblings(
      node.children,
      Math.max(0, available - 2 * inset - (vertical ? 0 : header))
    );
    if (content) {
      content.x = inset;
      content.y = inset;
    }
    for (const child of children.nodes) {
      child.x += inset;
      child.y += inset + header;
    }
    const width = Math.max(
      2 * inset + Math.max(content?.width ?? 0, children.width),
      vertical ? available : style.minLength
    );
    const height = Math.max(
      2 * inset + header + children.height,
      vertical ? style.minLength : available
    );
    return { width, height, content, children: children.nodes };
  }
};

function allNodes(nodes: MemoryNode[]): MemoryNode[] {
  const result: MemoryNode[] = [];
  const pending = [...nodes];
  while (pending.length) {
    const node = pending.pop()!;
    result.push(node);
    pending.push(...node.children);
  }
  return result;
}
