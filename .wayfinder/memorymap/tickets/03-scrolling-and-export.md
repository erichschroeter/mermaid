---
title: Choose scrolling and export ownership
labels: [wayfinder:grilling]
state: closed
assignees: [erich-schroeter_brc1]
parent: ../map.md
---

## Question

Where does responsibility for scrolling and fitting a large memory map belong:
inside Mermaid's rendered output, in the embedding host, or in a documented
combination?

The requirement is readable large maps extending vertically or horizontally;
the user has not required Mermaid to own a scrollable viewport.

Decide the contract for intrinsic dimensions, responsive fitting, clipping,
overflow, and host interaction without assuming that every consumer is an
interactive web page. Cover standalone SVG and static export behavior, and
identify which promises Mermaid can make independently of its host.

Use current repository rendering and embedding contracts as evidence. If a
decision needs information outside the repository, surface a research ticket
rather than guessing external viewer behavior.

## Blocked by

None.

## Resolution comment

Confirmed by the user on 2026-11-19 after a live decision discussion, informed
by the local repository's SVG sizing and embedding contracts.

### Diagram and host responsibilities

- Mermaid renders the complete memory map as SVG. The embedding host owns the
  viewport, scrolling, zooming, and overflow handling; the diagram does not add
  a bounded scrollable wrapper.
- Either axis may overflow. Vertical or horizontal orientation selects the
  primary growth direction, not a clipping boundary on the other axis.
- Mermaid cannot guarantee scrolling or readability in a host that overrides
  sizing or disallows overflow. Integration guidance must make that boundary
  explicit.

### Intrinsic and responsive modes

- Default to intrinsic, content-derived SVG dimensions.
- Support an author-selected responsive fit-to-width mode through the
  diagram's YAML frontmatter configuration, following the existing
  `useMaxWidth` convention. The exact configuration namespace remains for
  [Define styling, notes, and configuration](05-styling-notes-and-configuration.md).
- Responsive fitting scales the complete SVG rather than cropping its content
  or changing the underlying section layout to fit the host. Whole-SVG scaling
  is distinct from automatically changing font sizes during layout.
- SVG dimensions and the viewBox must encompass the complete rendered map with
  padding, not a browser viewport's visible subset.

### Standalone and static output

- Standalone SVG retains the entire map, even when larger than a screen or
  printed page. Do not intentionally clip output to an interactive viewport.
- The consuming viewer or exporter handles fitting, zooming, raster output
  dimensions, and pagination. This decision does not guarantee third-party
  export behavior or add a memory-map-specific export engine.

### Repository evidence

- [Shared SVG sizing helper](../../../packages/mermaid/src/setupGraphViewbox.js),
  lines 23-35 and 49-71: measured dimensions, padded bounds and viewBox, and
  responsive `width="100%"` with an intrinsic maximum width.
- [Shared renderer viewport helper](../../../packages/mermaid/src/rendering-util/setupViewPortForSVG.ts),
  lines 6-22: content-derived dimensions and viewBox using `useMaxWidth`.
- [Render result type](../../../packages/mermaid/src/types.ts), lines 151-177,
  and [render API](../../../packages/mermaid/src/mermaidAPI.ts), lines 638-690:
  output is SVG markup with diagram type and optional event binding, not a
  scroll-container result. Do not assume additional width/height return fields.
- [Embedding API guide](../../../packages/mermaid/src/docs/config/usage.md),
  lines 288-301 and 339-351: the site creator inserts returned SVG into a host
  element and optionally binds interactions.

The inspected repository paths establish SVG sizing and host insertion, not
universal static-export guarantees. No external research was needed.

### Remaining decisions

- [Define styling, notes, and configuration](05-styling-notes-and-configuration.md)
  specifies the frontmatter configuration placement and validation for choosing
  between the two modes.
- [Agree integration and acceptance criteria](06-integration-and-acceptance.md)
  must include host-owned overflow guidance and checks for both sizing modes,
  both orientations, and complete SVG bounds.

No new ticket was needed. No diagram, viewport, or export implementation was
performed.
