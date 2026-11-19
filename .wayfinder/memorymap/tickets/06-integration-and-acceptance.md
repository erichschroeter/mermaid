---
title: Agree integration and acceptance criteria
labels: [wayfinder:grilling]
state: open
assignees: []
parent: ../map.md
---

## Question

Given the preceding decisions, what integration boundaries and observable
acceptance criteria make the specification ready to hand to an implementer?

Use Mermaid's
[new-diagram guide](../../../packages/mermaid/src/docs/community/new-diagram.md)
and current local code as evidence. Identify the parser, database, renderer,
styles, detection and registration, configuration, and documentation touchpoints
at a planning level. Do not make implementation changes.

Agree the necessary parser and model tests, layout and visual examples, both
orientations, long notes, reserved-section fills, error cases, accessibility,
and scrolling/export checks that demonstrate the chosen behavior.

Include arbitrary and repeated entry labels, preserved source order, optional
section entry labels, recursive containment, parents with their own content
and notes, intentionally blank sections, and both note scopes. Check that
numeric-looking labels do not imply ranges, sizing, sorting, or overlap
validation. Cover missing required group structure and malformed nesting using
the agreed syntax diagnostics.

Determine whether any remaining choice prevents implementation without
guesswork. Surface that choice as a new decision ticket rather than using this
ticket to deliver the implementation or duplicate earlier resolutions. The
specification is the linked collection of resolutions; the map stays an index.

## Blocked by

- [Define the memorymap syntax and diagnostics](04-syntax-and-diagnostics.md)
- [Define styling, notes, and configuration](05-styling-notes-and-configuration.md)
- [Choose scrolling and export ownership](03-scrolling-and-export.md)
