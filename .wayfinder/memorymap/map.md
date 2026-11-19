---
title: Chart native Mermaid memory map support
labels: [wayfinder:map]
state: open
---

## Destination

An implementation-ready specification for a native, static Mermaid `memorymap`
diagram with vertical and horizontal layouts, readable large maps, configurable
section styling, and wrapping notes. No diagram implementation is included.

## Notes

- Scope: static memory-layout documentation, including firmware, flash, RAM, and
  reserved memory. Both orientations, customizable section fills, and wrapping
  long developer notes are required.
- [Boot memory map proposal](examples/boot-memory-map.mmd) is the user-supplied
  acceptance scenario, not an accepted grammar or configuration schema.
  Its syntax and percentage-based widths are proposals.
- Viewport ownership, section sizing,
  configuration shape, and exact syntax remain open.
- Consult the `wayfinder`, `grilling`, and `domain-modeling` skills each session.
  All initial tickets are human-in-the-loop conversations.
- Use the [memory map glossary](../../GLOSSARY.md) for confirmed terminology.
- Repository integration reference:
  [Adding a new diagram](../../packages/mermaid/src/docs/community/new-diagram.md).
  It covers parser, database, renderer, styles, definition, registration,
  configuration, tests, and documentation. Verify current guidance when working
  the integration decision.
- Tracker: local Markdown only; do not publish GitHub issues. Each ticket file
  is a local child issue, identified by its relative path. Front matter holds
  its title, labels, state, assignees, and parent. Refer to tickets by linked
  title, not by filename or number.
- Wayfinding operations: discover children by `parent: ../map.md`; select
  `state: open` tickets with `assignees: []` whose **Blocked by** links all point
  to closed tickets. Choose the first eligible filename in lexical order.
  Markdown has no native dependencies, so **Blocked by** is the fallback
  dependency relationship.
- Before working a ticket, claim it by setting `assignees` to
  `[erich-schroeter_brc1]`. Claiming does not resolve it. Re-read shared files
  before updates because other sessions may be working concurrently.
- Resolve at most one non-research ticket per session. Record its answer in an
  appended `## Resolution comment`, link any assets there, set `state: closed`,
  then append a linked-title gist to **Decisions so far**. Keep the full
  decision only in its ticket.
- After resolution, create newly specifiable child tickets, then wire their
  dependencies in a second pass. Remove graduated fog. Close any mis-scoped
  ticket and link it under **Out of scope**, not **Decisions so far**.

## Decisions so far

<!-- One linked-title gist per resolved ticket; the full answer lives there. -->

- [Define addresses and dedicated memory sections](tickets/01-addresses-and-sections.md):
  literal labels identify source-ordered groups and recursively nested sections;
  labels imply no numeric ranges or sizes.

## Not yet specified

- Further constraints or trade-offs exposed by combining nested dedicated sections,
  the eventual sizing model, and long annotations. Specific follow-on questions
  cannot yet be distinguished from concerns the initial decisions will settle.

## Out of scope

- Implementing the diagram, renderer, parser, configuration schema, tests, or
  documentation changes: this effort ends at an agreed specification.
- Runtime allocations, ownership tracking, and changing memory contents:
  this effort documents static memory layouts.
- Treating the proposed syntax or percentage widths as already approved.
