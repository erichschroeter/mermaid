---
title: Define the memorymap syntax and diagnostics
labels: [wayfinder:grilling]
state: open
assignees: []
parent: ../map.md
---

## Question

What source language should express the agreed literal-label and nested-section model
unambiguously, and what feedback should invalid diagrams receive?

Evaluate the [boot memory map proposal](../examples/boot-memory-map.mmd), rather
than treating it as an approved grammar. Cover `memorymap vertical` and
`memorymap horizontal`, labelled groups, recursive section declarations,
dedicated section delimiters, optional entry labels on sections, section
content, notes, style attachment, escaping, multiline text, and whitespace or
indentation rules. Distinguish an entry label from section content without
relying on a numeric-looking prefix.

Specify valid examples and meaningful error cases, including missing required
group labels, groups without sections, malformed nesting, and ambiguous
attachment of notes or styles. Support intentionally unlabelled sections
without silently accepting accidental empty declarations. Repeated labels and
nonnumeric labels are valid; missing numeric ranges are not errors.
Define explicit group-level and section-level note attachment, including
parents that have both their own content and children.
Decide whether external references in notes remain literal text or support
links; if links are supported, specify their source form and intended
interaction without assuming an interactive renderer or host.
Use current Mermaid parser guidance and shared conventions; do not implement
the parser. Coordinate configuration names with
[Define styling, notes, and configuration](05-styling-notes-and-configuration.md)
without duplicating that ticket's decisions.

## Blocked by

- [Define addresses and dedicated memory sections](01-addresses-and-sections.md)
