---
title: Define addresses and dedicated memory sections
labels: [wayfinder:grilling]
state: open
assignees: []
parent: ../map.md
---

## Question

What address and memory-section model must the diagram express?

Use the [boot memory map proposal](../examples/boot-memory-map.mmd) to decide how
the four dedicated XLDR sections belong beneath `0x00000000`, how their individual
boundaries and sizes are established, and how the EBOOT and splash-screen
sections relate to subsequent addresses.

The user has confirmed that `-` marks a boundary between dedicated sections, not
an empty range. Do not assume that the source already gives those sections equal
sizes or explicit internal addresses.

Decide address formats and units, range endpoint conventions, explicit versus
inferred sizes, the last section's end, gaps, overlaps, ordering, and invalid or
incomplete input. Distinguish an address entry from the sections beneath it.
State the model precisely enough for layout and syntax decisions to proceed
without silently guessing physical memory boundaries.

## Blocked by

None.
