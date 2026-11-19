---
title: Choose layout and sizing in both orientations
labels: [wayfinder:grilling]
state: open
assignees: []
parent: ../map.md
---

## Question

How should the agreed address model be laid out in vertical and horizontal
memory maps while keeping dedicated sections, boundaries, and notes readable?

Decide proportional versus schematic sizing, the meaning of scaling, address
ordering and reading direction, minimum readable section dimensions, and the
placement of addresses, section labels, and notes in each orientation.

Account for small sections with long labels or notes, large address gaps, and
the multiple dedicated XLDR sections in the
[boot memory map proposal](../examples/boot-memory-map.mmd). Determine how
percentage-based address, memory, and note widths should be interpreted, if
retained, especially when the orientation changes. Leave viewport ownership to
[Choose scrolling and export ownership](03-scrolling-and-export.md).

## Blocked by

- [Define addresses and dedicated memory sections](01-addresses-and-sections.md)
