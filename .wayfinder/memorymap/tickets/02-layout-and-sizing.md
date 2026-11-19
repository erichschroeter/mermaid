---
title: Choose layout and sizing in both orientations
labels: [wayfinder:grilling]
state: open
assignees: []
parent: ../map.md
---

## Question

How should the agreed group and nested-section model be laid out in vertical and horizontal
memory maps while keeping dedicated sections, boundaries, and notes readable?

Decide schematic or explicitly controlled section sizing, the meaning of
scaling, reading direction, minimum readable section dimensions, and the
placement of entry labels, section content, and notes in each orientation.
Preserve source order; never infer dimensions from numeric-looking labels.

Account for small sections with long labels or notes, and
the multiple dedicated XLDR sections in the
[boot memory map proposal](../examples/boot-memory-map.mmd). Determine how
percentage-based address, memory, and note widths should be interpreted, if
retained, especially when the orientation changes. Leave viewport ownership to
[Choose scrolling and export ownership](03-scrolling-and-export.md).

Decide how children visibly subdivide a parent, how parent content coexists
with child content, and how optional entry labels at every section depth align
with group labels. Cover group-level and section-level notes, intentional blank
sections, and deep nesting without introducing an arbitrary semantic depth
limit. Any visual sizing controls must be distinct from inferred memory sizes.

## Blocked by

- [Define addresses and dedicated memory sections](01-addresses-and-sections.md)
