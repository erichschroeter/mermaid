---
title: Define the memorymap syntax and diagnostics
labels: [wayfinder:grilling]
state: closed
assignees: [erich-schroeter_brc1]
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

## Resolution comment

Confirmed by the user on 2026-11-19 after a live decision discussion.
This defines the structural language, not an implemented parser.

### Header and root scope

- The header is `memorymap`, optionally followed by `vertical` or `horizontal`.
  Omission means vertical. Keywords and orientation values are case-sensitive.
  Unknown values are errors.
- The diagram requires one or more `group "label"` declarations. A group's
  label is a nonblank quoted string, and every group contains at least one
  section. Groups cannot nest.
- Diagram-level accessibility metadata is allowed at root scope alongside
  groups, using standard `accTitle: ...`, `accDescr: ...`, and
  `accDescr { ... }` forms. Title and description are each single-value metadata.
- Root statements share a consistent baseline indentation, which may be zero
  or a positive number of spaces beneath the header. Accessibility metadata
  shares that root baseline; its description block is metadata text, not a
  section hierarchy.

### Sections, properties, and ownership

- A section declaration is `section "content"` or bare `section`. Both bare
  `section` and `section ""` may create an entirely blank section with no note,
  styling, or children. They also support note-only or container sections.
- A group contains sections; a section may recursively contain sections.
  Display labels are literal and may repeat. Preserve declaration order.
- A section may have one `label "text"` property for its optional entry label.
  This is distinct from its section content. Groups receive entry labels only
  through their declarations.
- Groups and sections may each have at most one `note "text"`,
  `style "declarations"`, and `noteStyle "declarations"` property.
  `noteStyle` requires a note on that same owner.
- Properties and child declarations may interleave. Ownership is determined by
  direct indentation beneath a group or section, not by the most recently
  encountered child. A property does not itself open a section scope.
- Duplicating a single-value property is an error, even if its value is
  unchanged. Do not silently overwrite or merge repeated directives.
- This explicitly supersedes the earlier assumption that an unlabelled section
  requires `""` or that a bare section is accidental empty input. The keyword
  itself is an intentional declaration; a group without sections remains invalid.

### Strings and statement boundaries

- Values for group labels, section content when supplied, section entry labels,
  notes, and style payloads use double-quoted JSON-style strings.
- Decode JSON string escapes, including `\"`, `\\`, and `\n`. Reject invalid
  escapes, unclosed strings, and raw physical newlines inside strings.
- Display strings are plain text. Do not introduce Markdown, HTML, automatic
  link recognition, or clickable-link declarations. URLs may appear literally
  in notes as references for the reader.
- Statements occupy separate physical lines; a line ending or EOF terminates a
  statement. There are no semicolon-separated diagram statements. Punctuation
  inside a quoted style payload belongs to that payload.
- Standard unquoted accessibility directives are exceptions to the
  quoted-display-string rule. Their description block is also the supported
  metadata-specific multiline form; display strings use `\n` instead.
- Style and note-style payloads are quoted declaration strings, not permission
  to inject arbitrary CSS. Supported declarations, values, units, validation,
  and source-level sizing controls are decided in
  [Define styling, notes, and configuration](05-styling-notes-and-configuration.md).

### Indentation, comments, and preprocessing

- Use spaces only for structural indentation. Siblings align; children indent
  beyond their owner; dedents return to a previously established level. Do not
  require a fixed indentation width. Reject tab-indented statements.
- Blank lines and full-line `%%` comments do not change nesting. Do not
  introduce inline `%%` comments.
- YAML frontmatter and existing Mermaid directives remain handled by shared
  preprocessing before the diagram parser. This language does not redefine
  that processing or promise quote protection from shared preprocessing.
- The original bare-label and `-` shorthand is not automatically accepted as a
  compatibility grammar.

### Diagnostics

Reject malformed input without a partially rendered best guess. Report a concise
explanation, line and column, offending source context, and the expected form
where useful. A stack trace is not a substitute for that user-facing diagnostic.

Locations refer to the parser-visible diagram body, including its header.
Clearly identify them as body coordinates: shared preprocessing can remove
frontmatter, directives, or comment lines, so these are not guaranteed original
file coordinates.

Required error cases include:

- Unknown orientation or keyword, unquoted display text, invalid escapes,
  unclosed strings, or multiple statements on one line.
- Missing or blank group labels, groups without sections, or a diagram without
  groups.
- Root-level sections or owner properties, nested groups, invalid indentation,
  or child statements beneath a property.
- Repeated owner properties or accessibility metadata, and `noteStyle` without
  a note on the same owner.

Bare sections, repeated display labels, nonnumeric labels, and missing numeric
ranges are not errors.

### Planning assets

- [Translated boot memory map](../examples/boot-memory-map-syntax.mmd) expresses
  the original acceptance scenario in the agreed structural language. The
  four-copy requirement is explicitly a group note.
- [Nested horizontal syntax example](../examples/nested-memory-map-syntax.mmd)
  illustrates recursive sections, optional entry labels, property interleaving,
  blank sections, repeated group labels, escaping, and both note scopes.
- [Original boot memory map proposal](../examples/boot-memory-map.mmd) remains
  unchanged as historical input, not accepted shorthand.

The new assets are specification examples, not executable validation. The
memory-map parser does not exist yet, and their illustrative style vocabulary
awaits the customization decision.

### Repository evidence and follow-up

- [New-diagram guide](../../../packages/mermaid/src/docs/community/new-diagram.md),
  lines 83-110 and 241-247, recommends a co-located Chevrotain parser, positioned
  errors, and common accessibility support. Its opening Langium description
  conflicts with that detailed recommendation; the actual reference below
  uses Chevrotain.
- [Reference parser](../../../packages/mermaid/src/diagrams/usecase/parser/usecase.parser.ts),
  lines 134-151 and 177-200, and
  [reference tokens](../../../packages/mermaid/src/diagrams/usecase/parser/usecase.tokens.ts),
  lines 25-79 and 133-145, demonstrate diagram-specific statements, comments,
  and accessibility forms, not a shared indentation grammar.
- [Shared preprocessing](../../../packages/mermaid/src/preprocess.ts),
  lines 58-65,
  [frontmatter extraction](../../../packages/mermaid/src/diagram-api/frontmatter.ts),
  lines 52-68, and
  [comment cleanup](../../../packages/mermaid/src/diagram-api/comments.ts),
  lines 1-7, establish preprocessing before diagram-specific string handling.
- [Parse helper](../../../packages/mermaid/src/diagrams/common/parser/runChevrotainParse.ts),
  lines 15-38, supplies useful lexer location data; parser errors must also meet
  the diagnostic contract above.

Update
[Define styling, notes, and configuration](05-styling-notes-and-configuration.md)
to finish the style payload and configuration contract, and
[Agree integration and acceptance criteria](06-integration-and-acceptance.md)
to specify the positive and negative checks. No new ticket or implementation
was needed.
