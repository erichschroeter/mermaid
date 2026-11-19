---
title: Choose layout and sizing in both orientations
labels: [wayfinder:grilling]
state: closed
assignees: [erich-schroeter_brc1]
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

## Resolution comment

Confirmed by the user on 2026-11-19 after a live decision discussion.

### Orientation and lanes

- Vertical maps place groups and sibling sections top-to-bottom in source
  order, with entry labels to the left and notes to the right of sections.
- Horizontal maps place them left-to-right in source order, with entry labels
  above and notes below sections. All text remains upright.
- Label, section, and note lanes use preferred proportions across the growth
  direction: width shares vertically and height shares horizontally. Content
  minimums may enlarge the layout instead of obeying hard percentage caps.
- Exact configuration names, proportion values, and defaults are undecided.
  Literal width and height properties must not silently exchange meanings.

### Content-driven and explicit sizing

- Default sizing fits content with readable minimums. Wrap text, including
  long unbroken text where necessary, rather than automatically shrinking or
  clipping it.
- An explicit section length is a diagram-space minimum along the growth
  direction: height vertically and width horizontally. It is not a memory
  capacity and is never inferred from entry labels.
- Grow only the section needing additional space; explicitly requested length
  ratios are not guaranteed. There is no separate relative-weight sizing
  system in this decision.
- Lane sizing is separate from section length. Deep nesting may enlarge the
  map across either axis rather than squeeze content unreadably.

### Nested parents

- Draw enclosing parent boxes, with a local label/section/note arrangement at
  each depth.
- Parent text occupies a top header in both orientations. Omit an empty
  parent-text header when the parent has no text.
- A parent grows to contain its header, children, and other content. A parent
  length exceeding what its contents require leaves trailing interior padding;
  it does not invent an additional section or stretch children to fill it.
- Styling may hide section or parent borders without removing containment,
  spacing, or sizing behavior.

### Notes and the simplicity trade-off

- Notes remain aligned with their group or section in the local note lane and
  wrap to the available space. A long note may increase its section's required
  length, including when that exceeds an explicitly requested length.
- Authors can summarize long notes or point to information outside the diagram.
  Support explicit per-note font-size styling; do not shrink text automatically.
- No automatic displaced callouts or connectors, internally scrolling note
  panels, or automatic truncation is required.
- This explicitly relaxes the user's earlier preference against section growth
  caused by notes. Full visibility and non-overlap take precedence over fixed
  section lengths.
- External-reference syntax and interaction are not decided here.

### Remaining decisions

- [Define styling, notes, and configuration](05-styling-notes-and-configuration.md)
  defines control names, values, defaults, font-size and border styling,
  inheritance, and validation within this layout contract.
- [Define the memorymap syntax and diagnostics](04-syntax-and-diagnostics.md)
  defines source declarations and any external-reference syntax.
- [Agree integration and acceptance criteria](06-integration-and-acceptance.md)
  specifies observable checks for these choices.
- [Choose scrolling and export ownership](03-scrolling-and-export.md) remains
  independent and unresolved; map growth does not decide viewport ownership.

The previously unspecified nesting, sizing, and long-note trade-offs are now
covered by this decision and existing follow-up tickets. No new ticket or
diagram implementation was needed.
