---
title: Define styling, notes, and configuration
labels: [wayfinder:grilling]
state: open
assignees: []
parent: ../map.md
---

## Question

What customization contract makes memory sections and long notes useful without
breaking the agreed layouts?

Decide section fill and boundary styling, label and note presentation, explicit
line breaks, sizing controls, and configuration scope,
names, defaults, precedence, and invalid-value handling.

Use the contract from
[Choose layout and sizing in both orientations](02-layout-and-sizing.md).
Define controls for minimum section lengths, preferred cross-axis lane shares,
wrapping widths and readable minimums, explicit per-note font sizes, and hidden
borders that retain layout geometry. Resolve units, scope, and how literal
width/height controls relate to orientation-neutral controls; do not reinterpret
literal widths as heights. Automatic text shrinking and strict proportional
section sizes are not the chosen overflow policy.

Use
[Choose scrolling and export ownership](03-scrolling-and-export.md)
to specify the per-diagram YAML frontmatter placement and validation for
intrinsic versus responsive SVG sizing, following the `useMaxWidth` convention.
Keep this output-sizing control separate from section length and lane sizing.
Do not introduce a diagram-owned scrollable viewport.

Cover styling for containing sections and children, whether styles inherit,
and how overrides work. Text and notes do not automatically propagate from
parents to children; decide presentation for notes explicitly attached to a
group or section. Include optional entry labels at every section depth and
intentional blank sections. Sizing controls must not interpret label text as
numeric addresses.

Use a reserved section with a red background and the long developer notes in
the [boot memory map proposal](../examples/boot-memory-map.mmd) as acceptance
scenarios. Evaluate its `address.width`, `memory.width`, and `notes.col_width`
proposals against Mermaid's current configuration conventions and both
orientations; the example values and property names remain proposals.
Coordinate per-section style syntax with
[Define the memorymap syntax and diagnostics](04-syntax-and-diagnostics.md).

Keep the answer at specification level; do not implement rendering or schema
changes.

## Blocked by

- [Choose layout and sizing in both orientations](02-layout-and-sizing.md)
- [Choose scrolling and export ownership](03-scrolling-and-export.md)
