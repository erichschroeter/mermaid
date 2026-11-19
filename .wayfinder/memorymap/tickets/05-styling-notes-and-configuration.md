---
title: Define styling, notes, and configuration
labels: [wayfinder:grilling]
state: closed
assignees: [erich-schroeter_brc1]
parent: ../map.md
---

## Question

What customization contract makes memory sections and long notes useful without
breaking the agreed layouts?

Decide section fill and boundary styling, label and note presentation, explicit
line breaks, sizing controls, and configuration scope,
names, defaults, precedence, and invalid-value handling.

Use the contract from
[Choose layout and sizing in both orientations](02-layout-and-sizing.md).
Define controls for minimum section lengths, preferred cross-axis lane shares,
wrapping widths and readable minimums, explicit per-note font sizes, and hidden
borders that retain layout geometry. Resolve units, scope, and how literal
width/height controls relate to orientation-neutral controls; do not reinterpret
literal widths as heights. Automatic text shrinking and strict proportional
section sizes are not the chosen overflow policy.

Use
[Choose scrolling and export ownership](03-scrolling-and-export.md)
to specify the per-diagram YAML frontmatter placement and validation for
intrinsic versus responsive SVG sizing, following the `useMaxWidth` convention.
Keep this output-sizing control separate from section length and lane sizing.
Do not introduce a diagram-owned scrollable viewport.

Cover styling for containing sections and children, whether styles inherit,
and how overrides work. Text and notes do not automatically propagate from
parents to children; decide presentation for notes explicitly attached to a
group or section. Include optional entry labels at every section depth and
intentional blank sections. Sizing controls must not interpret label text as
numeric addresses.

Use a reserved section with a red background and the long developer notes in
the [boot memory map proposal](../examples/boot-memory-map.mmd) as acceptance
scenarios. Evaluate its `address.width`, `memory.width`, and `notes.col_width`
proposals against Mermaid's current configuration conventions and both
orientations; the example values and property names remain proposals.
Use the local quoted `style` and `noteStyle` forms established by
[Define the memorymap syntax and diagnostics](04-syntax-and-diagnostics.md).
Finish their supported declaration grammar and property/value vocabulary,
including how source-level sizing is expressed, without reopening structural
ownership or requiring unique display labels. Unknown or invalid declarations
must produce useful diagnostics; the payload is not unrestricted CSS.
External references are literal note text, not clickable-link syntax.

Keep the answer at specification level; do not implement rendering or schema
changes.

## Blocked by

- [Choose layout and sizing in both orientations](02-layout-and-sizing.md)
- [Choose scrolling and export ownership](03-scrolling-and-export.md)
- [Define the memorymap syntax and diagnostics](04-syntax-and-diagnostics.md)

## Resolution comment

Confirmed by the user on 2026-11-19 after a live decision discussion, including
the trade-offs of arbitrary CSS and the existing YAML sanitization boundary.
This is a specification; no schema, validator, or renderer was implemented.

### Configuration shape and initial defaults

All diagram-specific configuration lives under `config.memorymap`, including
when supplied through per-diagram YAML frontmatter. Do not retain the original
top-level `address`, `memory`, or `notes` configuration proposal as aliases.

| Key            | Type and default                                                   | Meaning                                                                          |
| -------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `useMaxWidth`  | Boolean, `false`                                                   | Intrinsic SVG dimensions by default; `true` enables responsive fitting.          |
| `crossSize`    | Positive finite number, `600`                                      | Preferred root cross-axis extent: width vertically, height horizontally.         |
| `wrapWidth`    | Positive finite number, `240`                                      | Preferred maximum horizontal text line width in either orientation.              |
| `padding`      | Nonnegative finite number, `8`                                     | Content/lane insets, parent interior spacing, and separation between groups.     |
| `laneShares`   | Object with positive finite `label: 33`, `section: 33`, `note: 34` | Normalize active shares; they need not sum to 100.                               |
| `groupStyle`   | Typed visual-style object                                          | Diagram-wide defaults for group containers and their own entry labels.           |
| `sectionStyle` | Typed visual-style object, also containing `minLength: 80`         | Diagram-wide defaults for sections; minimum length follows the growth direction. |
| `noteStyle`    | Typed text-style object                                            | Independent defaults for every group or section note.                            |

These are agreed initial configurable defaults, not visually calibrated results.
Positive content and font minimums can require more space than preferred
allocations. Do not automatically shrink text to honor these numbers.

### Theme-derived visual defaults

- Groups have `fill: none` and `stroke: none` by default.
- Sections use the effective Mermaid theme's `primaryColor`,
  `primaryBorderColor`, and `primaryTextColor` for fill, stroke, and own text.
- Notes use the theme's `noteTextColor`, falling back to `primaryTextColor`
  when the note-specific value is absent.
- Group entry labels use the effective theme's primary text color.
- Fonts use resolved Mermaid font-family and font-size settings, including
  applicable theme settings, rather than a hardcoded family or text color.
  Initial font weight is `normal`; initial stroke width is `1`.
- Explicit memory-map color overrides follow the restricted color grammar
  below; resolved theme output remains governed by Mermaid's theme system.
- A requested font need not be installed. Normal viewer font fallback applies;
  this contract does not embed fonts or guarantee identical metrics in every
  external viewer.

### Allowed style properties and targets

YAML style objects use camelCase keys; source declaration strings use the
corresponding kebab-case names.

| Source property  | YAML key        | Allowed targets and effect                                               |
| ---------------- | --------------- | ------------------------------------------------------------------------ |
| `fill`           | `fill`          | Group/section box fill, not label or note lane backgrounds.              |
| `stroke`         | `stroke`        | Group/section box border paint.                                          |
| `stroke-width`   | `strokeWidth`   | Group/section border width.                                              |
| `color`          | `color`         | Owner text and entry label, or note text in `noteStyle`.                 |
| `font-family`    | `fontFamily`    | Owner text and entry label, or note text in `noteStyle`.                 |
| `font-size`      | `fontSize`      | Owner text and entry label, or note text in `noteStyle`.                 |
| `font-weight`    | `fontWeight`    | Owner text and entry label, or note text in `noteStyle`.                 |
| `text-align`     | `textAlign`     | Owner text and entry label, or independent note text; left/center/right. |
| `vertical-align` | `verticalAlign` | Owner text and entry label, or independent note text; top/middle/bottom. |
| `min-length`     | `minLength`     | Sections only; minimum drawn length along the growth direction.          |

`groupStyle` and group-local `style` do not accept minimum section length.
`noteStyle` accepts only the six text properties. Notes have no independently
styled background or border box in the first version.

Implementation follow-up requested by the user: text alignment defaults to
left/top and may be configured diagram-wide or per owner. It changes placement,
not dimensions or wrapping, and uses screen directions in either orientation.
Each wrapped line aligns horizontally; the complete block aligns vertically
inside a leaf box or label/note lane. Parent content remains a top header above
children, with no inheritance to children or notes.

There are no arbitrary CSS declarations, selectors, functions, variables,
resource URLs, or extra per-section width/height controls. The allowlist can be
extended by a later deliberate change, not by accepting unrecognized properties.

### Values and declaration grammar

- YAML drawing sizes are numbers, not numeric strings or unit-bearing strings.
  Source size values are decimal numbers, optionally suffixed with `px`;
  unitless and `px` values mean the same diagram-space length.
- `crossSize`, `wrapWidth`, `minLength`, and `fontSize` must be finite and
  positive. `padding` and `strokeWidth` may be zero but not negative.
  Relative units, percentages, expressions, and nonfinite numbers are invalid.
- All lane shares must be finite and positive, and their normalization must
  produce finite proportions. Lane shares are not section-length weights.
- Explicit colors are `#RGB` or `#RRGGBB`, case-insensitive in the hexadecimal
  digits. `none` is additionally valid for fill and stroke, not text color.
  Named colors, alpha hexadecimal colors, and functional colors are not
  introduced in this version.
- Font weight is `normal`, `bold`, or an integer multiple of 100 from 100
  through 900. YAML uses a string for the named forms or a number for numeric
  weights; source declarations contain the corresponding literal value.
- Font family is a literal comma-separated list of nonempty family names,
  such as `Arial, sans-serif` or `Times New Roman, serif`. It is not a CSS
  expression or resource reference. Do not introduce CSS-level escaping or
  quoted-family syntax inside the already quoted declaration payload.
- After decoding its enclosing JSON string, a style payload contains
  semicolon-separated `property:value` pairs. Trim surrounding declaration,
  key, and value whitespace. A single final semicolon is allowed.
- Reject an empty payload, an empty interior declaration or value, malformed
  pairs, repeated properties, unknown properties, invalid values, and
  properties on the wrong target. Do not silently drop bad source styles or
  apply a last-value-wins rule.

For example, `style "fill:#F4CCCC; min-length:120"` and
`noteStyle "font-size:12px"` use the agreed contract.

### Precedence, ownership, and measurement

- Start with the initial and effective theme-derived defaults, apply site
  memory-map configuration, then diagram frontmatter configuration, then
  owner-local source styles. Existing Mermaid protected configuration rules
  remain in force.
- Merge typed style defaults field by field; a local property overrides only
  that property, not the entire style object.
- A parent's local override affects only that owner, never its descendants.
  Every child starts from diagram defaults plus its own override. Do not
  accidentally implement local style propagation through SVG/CSS inheritance.
- Parent fill may remain visible behind children, but its declared fill is not
  copied into them.
- An owner's `style` does not alter its note. All notes, including parent
  notes, use diagram `noteStyle` defaults plus their own local `noteStyle`.
- Resolve geometry-affecting values before measuring and wrapping text.
  Preserve complete bounds, including painted borders. Hiding a border with
  `stroke:none` changes paint, not containment, padding, or sizing behavior.

### Lane allocation and spacing

- Apply `crossSize` at the root. Nested local arrangements use space available
  inside their parent, not a new independent `crossSize` allocation at every
  depth. Content minimums may expand the parent and overall diagram.
- Preferred lane shares apply to widths vertically and heights horizontally.
  Literal horizontal text wrapping still uses `wrapWidth` in both orientations.
- At each local sibling set, omit an entry-label or note lane only if no
  sibling uses it. Otherwise retain that lane consistently for the siblings.
  Renormalize shares among active lanes.
- Padding applies inside content areas and lanes and between a parent and
  its child layout. Adjacent sibling section boxes abut; separation between
  groups uses padding. Preserve the previously agreed trailing parent padding
  when requested parent length exceeds its contents' requirements.
- These controls do not override the prior content-growth, parent-header,
  or simple wrapped-note decisions.

### Validation boundary

Registered memory-map values require explicit runtime type/range validation.
Do not assume JSON Schema generation alone validates runtime options, and do
not silently coerce invalid supplied values into success-shaped defaults.
Report invalid source styles with the positioned diagnostics already agreed.
Configuration errors must identify the offending configuration path and value.

Unknown YAML keys retain Mermaid's existing shared sanitizer behavior and may
be removed before memory-map validation. This is an explicitly accepted
limitation, not a promise of typo detection. Do not broaden shared unknown-key
policy or protected configuration behavior for this feature.

The implementation must register every supported configuration key in the
schema/generated configuration mechanism so valid settings survive sanitization,
then verify the real frontmatter path rather than just calling a validator
directly.

### Planning assets and evidence

- [Configured memory map](../examples/configured-memory-map-syntax.mmd) shows
  frontmatter controls, typed style defaults, parent/note isolation, and local
  length/font overrides.
- [Translated boot memory map](../examples/boot-memory-map-syntax.mmd) and
  [nested horizontal syntax example](../examples/nested-memory-map-syntax.mmd)
  now use the agreed style vocabulary. They remain planning examples, not
  implemented or visually tested diagrams.
- [Configuration schema](../../../packages/mermaid/src/schemas/config.schema.yaml),
  lines 302, 439-461, and 507-520, establishes diagram namespaces, common font
  settings, and base responsive behavior. Memory maps intentionally override
  the common `useMaxWidth: true` default with the prior decision's `false`.
- [Configuration resolution](../../../packages/mermaid/src/config.ts),
  lines 74-86 and 274-290, and
  [directive sanitization](../../../packages/mermaid/src/utils/sanitizeDirective.ts),
  lines 16-28 and 44-88, establish precedence and filtering before rendering.
- [Preprocessing](../../../packages/mermaid/src/preprocess.ts), lines 61-64,
  [API configuration path](../../../packages/mermaid/src/mermaidAPI.ts),
  lines 74-86, and
  [frontmatter extraction](../../../packages/mermaid/src/diagram-api/frontmatter.ts),
  lines 31-64, show why raw unknown YAML keys may not reach a renderer.
- [Default theme](../../../packages/mermaid/src/themes/theme-default.js),
  lines 12-37 and 54-67, and
  [theme entry points](../../../packages/mermaid/src/themes/index.js),
  lines 1-45, provide the theme-variable mechanism.
- [Quadrant style parsing](../../../packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts),
  lines 64-88, demonstrates explicit property validation; its
  [hexadecimal validator](../../../packages/mermaid/src/diagrams/quadrant-chart/utils.ts),
  lines 8-10, provides prior art for three/six-digit hexadecimal checks.
  The memory-map contract additionally requires the leading `#`.

The remaining
[Agree integration and acceptance criteria](06-integration-and-acceptance.md)
ticket must turn these choices into concrete checks and integration boundaries.
No new decision ticket was needed.
