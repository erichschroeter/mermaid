import type { PlacedNode, Rect } from './memorymapLayout.js';

type Side = 'top' | 'bottom' | 'left' | 'right';
interface Edge {
  item: PlacedNode;
  side: Side;
  position: number;
  start: number;
  end: number;
  order: number;
}

// Tolerate arithmetic rounding error, not actual spacing between boxes.
const samePosition = (a: number, b: number): boolean =>
  Math.abs(a - b) <= Math.max(1, Math.abs(a), Math.abs(b)) * Number.EPSILON * 16;

export const collapseBorders = (nodes: PlacedNode[]): Map<PlacedNode, Rect[]> => {
  const horizontal: Edge[] = [];
  const vertical: Edge[] = [];
  const edges = new Map<PlacedNode, Edge[]>();
  const removed = new Map<Edge, [number, number][]>();
  let order = 0;
  const visit = (items: PlacedNode[], parentX: number, parentY: number): void => {
    for (const item of items) {
      const x = parentX + item.x + item.box.x;
      const y = parentY + item.y + item.box.y;
      const index = order++;
      if (item.style.stroke !== 'none' && item.style.strokeWidth > 0) {
        const top: Edge = {
          item,
          side: 'top',
          position: y,
          start: x,
          end: x + item.box.width,
          order: index,
        };
        const bottom: Edge = { ...top, side: 'bottom', position: y + item.box.height };
        const left: Edge = {
          item,
          side: 'left',
          position: x,
          start: y,
          end: y + item.box.height,
          order: index,
        };
        const right: Edge = { ...left, side: 'right', position: x + item.box.width };
        horizontal.push(top, bottom);
        vertical.push(left, right);
        edges.set(item, [top, bottom, left, right]);
      }
      visit(item.children, x, y);
    }
  };
  visit(nodes, 0, 0);

  for (const axis of [horizontal, vertical]) {
    axis.sort((a, b) => a.position - b.position);
    for (let start = 0; start < axis.length; ) {
      let end = start + 1;
      while (end < axis.length && samePosition(axis[start].position, axis[end].position)) {
        end++;
      }
      const facing = axis.slice(start, end);
      const before = facing
        .filter((edge) => edge.side === 'bottom' || edge.side === 'right')
        .sort((a, b) => a.start - b.start);
      const after = facing
        .filter((edge) => edge.side === 'top' || edge.side === 'left')
        .sort((a, b) => a.start - b.start);
      let first = 0;
      for (const a of before) {
        while (first < after.length && after[first].end <= a.start) {
          first++;
        }
        for (let index = first; index < after.length && after[index].start < a.end; index++) {
          const b = after[index];
          const low = Math.max(a.start, b.start);
          const high = Math.min(a.end, b.end);
          if (a.item === b.item || low >= high || !samePosition(a.position, b.position)) {
            continue;
          }
          const loser =
            a.item.style.strokeWidth > b.item.style.strokeWidth ||
            (a.item.style.strokeWidth === b.item.style.strokeWidth && a.order > b.order)
              ? b
              : a;
          const intervals = removed.get(loser) ?? [];
          intervals.push([low, high]);
          removed.set(loser, intervals);
        }
      }
      start = end;
    }
  }

  const result = new Map<PlacedNode, Rect[]>();
  // Only losing boxes need custom borders; keep each winning stroke inside its own box.
  for (const [item, sides] of edges) {
    if (!sides.some((edge) => removed.has(edge))) {
      continue;
    }
    const parts: Rect[] = [];
    for (const edge of sides) {
      const intervals = (removed.get(edge) ?? []).sort((a, b) => a[0] - b[0]);
      let cursor = edge.start;
      const append = (end: number): void => {
        if (end <= cursor) {
          return;
        }
        const horizontal = edge.side === 'top' || edge.side === 'bottom';
        const width = item.style.strokeWidth;
        parts.push({
          x: horizontal ? cursor - edge.start : edge.side === 'left' ? 0 : item.box.width - width,
          y: horizontal ? (edge.side === 'top' ? 0 : item.box.height - width) : cursor - edge.start,
          width: horizontal ? end - cursor : width,
          height: horizontal ? width : end - cursor,
        });
      };
      for (const [low, high] of intervals) {
        append(low);
        cursor = Math.max(cursor, high);
      }
      append(edge.end);
    }
    result.set(item, parts);
  }
  return result;
};
