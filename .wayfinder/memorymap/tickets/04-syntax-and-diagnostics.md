---
title: Define the memorymap syntax and diagnostics
labels: [wayfinder:grilling]
state: open
assignees: []
parent: ../map.md
---

## Question

What source language should express the agreed address and section model
unambiguously, and what feedback should invalid diagrams receive?

Evaluate the [boot memory map proposal](../examples/boot-memory-map.mmd), rather
than treating it as an approved grammar. Cover `memorymap vertical` and
`memorymap horizontal`, address entries, dedicated section delimiters, section
labels, notes, style attachment, escaping, multiline text, and whitespace or
indentation rules.

Specify valid examples and meaningful error cases, including missing range
information and ambiguous attachment of notes or styles to dedicated sections.
Use current Mermaid parser guidance and shared conventions; do not implement
the parser. Coordinate configuration names with
[Define styling, notes, and configuration](05-styling-notes-and-configuration.md)
without duplicating that ticket's decisions.

## Blocked by

- [Define addresses and dedicated memory sections](01-addresses-and-sections.md)
