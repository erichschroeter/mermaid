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

Derive layout checks from
[Choose layout and sizing in both orientations](02-layout-and-sizing.md):
transposed local lanes with upright text, wrapping without overlap or automatic
shrinking, content exceeding requested section lengths, parents containing their
children, trailing parent padding, omitted empty parent-text headers, borderless
sections retaining geometry, and per-note font-size customization. Include long
unbroken text and nesting that requires additional space. External references
remain literal text; do not assume clickable-link behavior.

Derive sizing and embedding checks from
[Choose scrolling and export ownership](03-scrolling-and-export.md).
Cover default intrinsic dimensions and configurable responsive fitting in both
orientations, full padded SVG bounds, and overflow on either axis. Specify a
host-owned scroll-container example and verify that SVG output is independent
of the host's currently visible viewport. Distinguish renderer guarantees from
external viewer/exporter fitting, raster sizing, and pagination; do not promise
unverified behavior across third-party tools.

Derive language checks from
[Define the memorymap syntax and diagnostics](04-syntax-and-diagnostics.md)
and its linked planning examples. Cover the default orientation, recursive
indentation, bare and explicitly empty sections, property interleaving and
ownership, quoted-string escaping, comments, frontmatter, and accessibility
metadata. Include malformed structure, invalid strings, duplicate properties,
and note styles without notes. Require useful body-relative line/column
diagnostics with source context and no partial rendering. Do not treat the
preserved original shorthand example as valid grammar or claim these assets
have passed a parser that has not been implemented.

Derive customization checks from
[Define styling, notes, and configuration](05-styling-notes-and-configuration.md)
and its configured example. Cover actual frontmatter ingestion and registered
key survival, site/frontmatter/local field-level precedence, theme defaults,
owner-only overrides, and note isolation. Check normalized active lane shares,
unused-lane removal, preferred root versus nested cross-axis allocation,
wrapping widths, padding, and minimum lengths in both orientations.

Include valid/invalid units, finite numeric ranges, supported hexadecimal
colors, text-only note styles, wrong-target properties, and malformed or
duplicate source declarations. Test font changes before measurement and
borderless paint without geometry changes. Distinguish invalid registered
values from unknown YAML keys that the shared sanitizer may discard. The
agreed numeric defaults have not yet been visually calibrated; any unresolved
readability concern must be surfaced, not silently treated as a tested result.

Determine whether any remaining choice prevents implementation without
guesswork. Surface that choice as a new decision ticket rather than using this
ticket to deliver the implementation or duplicate earlier resolutions. The
specification is the linked collection of resolutions; the map stays an index.

## Blocked by

- [Define the memorymap syntax and diagnostics](04-syntax-and-diagnostics.md)
- [Define styling, notes, and configuration](05-styling-notes-and-configuration.md)
- [Choose scrolling and export ownership](03-scrolling-and-export.md)
