---
title: Define addresses and dedicated memory sections
labels: [wayfinder:grilling]
state: closed
assignees: [erich-schroeter_brc1]
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

## Resolution comment

Confirmed by the user on 2026-11-19 after a live decision discussion.
The question's numeric-address premise is superseded by a literal-label model.

### Labels and ordering

- Entry labels are literal display text. Hexadecimal is an example convention,
  not a numeric type or a default conversion.
- Do not parse labels as addresses, infer units, calculate ranges or sizes,
  infer final endpoints, check numeric gaps or overlaps, or sort by label value.
- Groups and sibling sections retain source order. Repeated labels are valid;
  labels are not unique identifiers.

### Groups and nested sections

- A map contains groups. Each group requires a nonblank entry label and at
  least one section.
- Sections may contain child sections recursively. Children subdivide their
  parent's dedicated area, and each child belongs to exactly one parent.
  The model imposes no fixed nesting-depth limit; readable rendering is a
  separate layout decision.
- A section at any depth may have its own content, an optional literal entry
  label, notes, and children.
- Parent content and notes describe the containing section. They do not create
  an additional child or automatically propagate to descendants. Style
  inheritance is not decided here.
- Intentionally unlabelled sections are valid, including sections represented
  only by styling or a note. Missing required group labels or section structure
  is invalid; the source syntax must distinguish intentional blanks from
  accidental empty declarations.
- Notes may belong to a whole group or an individual section at any depth.
  Their exact syntax, placement, and wrapping remain separate decisions.

### Interpretation and remaining decisions

In the [boot memory map proposal](../examples/boot-memory-map.mmd),
`0x00000000` labels a group containing four dedicated XLDR sections. The `-`
markers express section boundaries, not empty memory or equal numeric sizes.
`0x00080000` labels a separate group containing EBOOT; it does not supply an
endpoint for the preceding group. The splash-screen group needs no inferred
final address.

The original source is preserved as a proposal, not a fully specified example
of nested-section or note-scoping syntax.

The [glossary](../../../GLOSSARY.md) captures the agreed terminology. Remaining
questions fit the existing tickets:

- [Choose layout and sizing in both orientations](02-layout-and-sizing.md):
  nested containment, label and note placement, and sizing without numeric
  inference.
- [Define the memorymap syntax and diagnostics](04-syntax-and-diagnostics.md):
  recursive structure, literal labels, explicit blanks, and note attachment.
- [Define styling, notes, and configuration](05-styling-notes-and-configuration.md):
  nested styles, inheritance, and scoped note presentation.
- [Agree integration and acceptance criteria](06-integration-and-acceptance.md):
  examples and checks for the agreed model.

No new ticket is needed from this resolution. Scrolling and export ownership
remain undecided, and no diagram implementation was performed.
