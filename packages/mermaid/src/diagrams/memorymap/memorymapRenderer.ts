import type { DiagramRenderer, SVGGroup } from '../../diagram-api/types.js';
import type { Selection } from 'd3';
import { configureSvgSize } from '../../setupGraphViewbox.js';
import { selectSvgElement } from '../../rendering-util/selectSvgElement.js';
import { db } from './memorymapDb.js';
import { collapseBorders } from './memorymapBorders.js';
import { alignmentOffset, layoutMemoryMap } from './memorymapLayout.js';
import type { MeasureText, PlacedNode, Rect, TextBlock, TextMetrics } from './memorymapLayout.js';
import type { TextStyle } from './memorymapTypes.js';

const textStyle = (
  element: Selection<SVGTextElement, unknown, Element | null, unknown>,
  style: Required<TextStyle>
): void => {
  element
    .style('fill', style.color)
    .style('stroke', 'none')
    .style('font-family', style.fontFamily)
    .style('font-size', `${style.fontSize}px`)
    .style('font-weight', style.fontWeight)
    .style('text-anchor', 'start')
    .style('white-space', 'pre');
};

const drawText = (parent: SVGGroup, block: TextBlock | undefined, className: string): void => {
  if (!block) {
    return;
  }
  const text = parent.append('text').attr('class', className);
  textStyle(text, block.style);
  block.lines.forEach((line, index) => {
    text
      .append('tspan')
      .attr(
        'x',
        block.x +
          block.metrics[index].left +
          alignmentOffset(block.style.textAlign, block.width - block.metrics[index].width)
      )
      .attr('y', block.y + block.baseline + index * block.lineHeight)
      .text(line);
  });
};

const drawNode = (parent: SVGGroup, item: PlacedNode, collapsed: Map<PlacedNode, Rect[]>): void => {
  const group = parent
    .append('g')
    .attr('class', `memorymap-${item.node.kind}`)
    .attr('data-memorymap-id', item.node.id)
    .attr('transform', `translate(${item.x},${item.y})`);
  const box = group
    .append('g')
    .attr('class', 'memorymap-body')
    .attr('transform', `translate(${item.box.x},${item.box.y})`);
  const borders = collapsed.get(item);
  const stroke = borders ? 0 : item.style.strokeWidth;
  box
    .append('rect')
    .attr('class', 'memorymap-box')
    .attr('x', stroke / 2)
    .attr('y', stroke / 2)
    .attr('width', Math.max(0, item.box.width - stroke))
    .attr('height', Math.max(0, item.box.height - stroke))
    .style('fill', item.style.fill)
    .style('stroke', borders ? 'none' : item.style.stroke)
    .style('stroke-width', stroke);
  if (borders?.length) {
    box
      .append('path')
      .attr('class', 'memorymap-border')
      .attr(
        'd',
        borders
          .map(({ x, y, width, height }) => `M${x},${y}h${width}v${height}h${-width}Z`)
          .join('')
      )
      .style('fill', item.style.stroke)
      .style('stroke', 'none')
      .style('stroke-width', 0);
  }
  drawText(box, item.content, 'memorymap-content');
  for (const child of item.children) {
    drawNode(box, child, collapsed);
  }
  drawText(group, item.label, 'memorymap-label');
  drawText(group, item.note, 'memorymap-note');
};

export const renderer: DiagramRenderer = {
  draw: (_text, id) => {
    const svg = selectSvgElement(id);
    const root = svg.select<SVGGElement>('g').attr('class', 'memorymap');
    const probe = root.append('text');
    const cache = new Map<string, TextMetrics>();
    const measure: MeasureText = (text, style) => {
      const key = JSON.stringify([text, style.fontFamily, style.fontSize, style.fontWeight]);
      const cached = cache.get(key);
      if (cached) {
        return cached;
      }
      // Measure literal SVG text, not the shared HTML/Markdown label pipeline.
      textStyle(probe, style);
      probe.text(text);
      const element = probe.node()!;
      const bounds = element.getBBox();
      const left = Math.max(0, -bounds.x);
      const metrics = {
        width: Math.max(element.getComputedTextLength(), bounds.x + bounds.width) + left,
        ascent: Math.max(0, -bounds.y),
        descent: Math.max(0, bounds.y + bounds.height),
        left,
      };
      cache.set(key, metrics);
      return metrics;
    };
    let layout;
    try {
      layout = layoutMemoryMap(db.getModel(), db.getConfig(), measure, db.getDiagramTitle());
    } finally {
      probe.remove();
    }
    drawText(root, layout.title, 'memorymap-title');
    const collapsed = collapseBorders(layout.nodes);
    for (const node of layout.nodes) {
      drawNode(root, node, collapsed);
    }
    svg.attr('viewBox', `0 0 ${layout.width} ${layout.height}`);
    configureSvgSize(svg, layout.height, layout.width, db.getConfig().useMaxWidth);
  },
};
