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

Decide section fill and boundary styling, label and note presentation, wrapping
versus scaling, explicit line breaks, sizing controls, and configuration scope,
names, defaults, precedence, and invalid-value handling.

Use a reserved section with a red background and the long developer notes in
the [boot memory map proposal](../examples/boot-memory-map.mmd) as acceptance
scenarios. Evaluate its `address.width`, `memory.width`, and `notes.col_width`
proposals against Mermaid's current configuration conventions and both
orientations. Coordinate per-section style syntax with
[Define the memorymap syntax and diagnostics](04-syntax-and-diagnostics.md).

Keep the answer at specification level; do not implement rendering or schema
changes.

## Blocked by

- [Choose layout and sizing in both orientations](02-layout-and-sizing.md)
