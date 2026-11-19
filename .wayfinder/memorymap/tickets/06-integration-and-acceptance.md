---
title: Agree integration and acceptance criteria
labels: [wayfinder:grilling]
state: closed
assignees: [erich-schroeter_brc1]
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

## Resolution comment

Confirmed by the user on 2026-11-19 after a live decision discussion.
The map is ready for implementation handoff: no known product decisions or
unspecified in-scope questions remain. Closing it means the specification is
agreed, not that any diagram code or future acceptance test has been completed.

### Native integration boundaries

Use the current repository's native-diagram structure and shared mechanisms.
The paths below identify integration boundaries; new `memorymap` files are
proposed implementation paths, not files created during planning.

| Area                            | Required integration                                                                                                                                                                                                                                                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parser, model, renderer, styles | Add a co-located implementation under `packages/mermaid/src/diagrams/memorymap/`, with a Chevrotain lexer/parser and visitor, recursive group/section model, explicit style validation, renderer, definition, and styles. Reuse shared text measurement, SVG sizing, theme, and accessibility mechanisms where applicable. |
| Detection and loading           | Add a detector/lazy loader and register it in the existing diagram orchestration. Test header detection without stealing unrelated diagram names; retain existing diagram behavior.                                                                                                                                        |
| Configuration                   | Extend the YAML schema, runtime default assembly, and supported-key mechanism for `memorymap`. Every valid nested option must survive the real frontmatter path. Generate TypeScript configuration types; do not hand-edit them or change shared unknown-key/protected-config policy.                                      |
| Accessibility                   | Reuse common title/description state and SVG accessible labeling. Support the agreed source metadata and literal text output without adding interactive navigation or bespoke narration.                                                                                                                                   |
| Documentation and demos         | Add `packages/mermaid/src/docs/syntax/memorymap.md`, a source sidebar entry, `demos/memorymap.html` and demo index entry, and an examples module/registration under `packages/examples/src/`. Do not manually edit generated top-level documentation.                                                                      |
| Browser fixtures and specs      | Add discoverable `.mmd` examples under `e2e/diagrams/memorymap/pr-check/`, focused browser assertions under `e2e/rendering/memorymap/pr-check/`, and generated-input stress checks under `e2e/rendering/memorymap/nightly-check/`. Follow current tier/name conventions and existing test helpers.                         |

Use the current guide's concrete Chevrotain recommendation and actual native
reference, not its conflicting opening Langium wording. The current snapshot
runner's tiered fixture structure takes precedence over the guide's unqualified
fixture-directory example.

Configuration generation has an important distinction: `types:build-config`
generates `config.type.ts` only. Runtime defaults are loaded from schema YAML
through the build plugin and assembled in `defaultConfig.ts`, which also derives
`configKeys`. Generating types alone does not register valid runtime settings or
provide runtime type/range validation.

### Required automated evidence

The prior tickets remain the source of each behavioral decision. This matrix
defines how to demonstrate them without replacing their contracts.

| Contract                                                                          | Acceptance evidence                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Define addresses and dedicated memory sections](01-addresses-and-sections.md)    | Focused parser/model tests for source order, repeated and nonnumeric labels, recursive ownership, parent content, both note scopes, and blank sections. No address arithmetic, inferred capacity, or label-based IDs/ordering.                                                                                                                     |
| [Define the memorymap syntax and diagnostics](04-syntax-and-diagnostics.md)       | Positive and negative cases for headers, indentation, quoting/escaping, local properties, interleaving, metadata, comments, and frontmatter. Invalid input produces positioned body-relative diagnostics and no success-shaped partial map. Valid renders after invalid input must not inherit stale model state.                                  |
| [Define styling, notes, and configuration](05-styling-notes-and-configuration.md) | Test actual site/frontmatter/local field-level precedence, registered key survival, theme defaults, owner-only overrides, and note isolation. Cover accepted/rejected types, units, values, declarations, targets, duplicates, and normalized active shares. Do not expect unknown YAML keys to be errors when the shared sanitizer discards them. |
| [Choose layout and sizing in both orientations](02-layout-and-sizing.md)          | Browser-level geometry assertions for nested containment, source order along the correct axis, header placement/omission, trailing padding, sibling alignment, unused lanes, wrapping, and content exceeding minimum requests. Resolve font changes before measurement; verify border hiding preserves layout.                                     |
| [Choose scrolling and export ownership](03-scrolling-and-export.md)               | Test intrinsic and responsive modes in both orientations, complete padded bounds including painted borders, and host-owned overflow on either axis. SVG content must not depend on the host's currently visible viewport.                                                                                                                          |

Specific geometry checks must distinguish intentional parent/child containment
and shared section boundaries from unintended overlapping text or notes.
Check actual text and layout bounds, not only screenshot equality. Use the
existing harness's font readiness and measurement practices; font-dependent
rounding is not a reason to require fragile exact coordinates.

Use representative screenshot baselines alongside semantic assertions.
Snapshots must be reviewed against the source and agreed behavior, not
automatically accepted merely because a renderer produced an image.
Include default and dark themes and literal markup/URL text without HTML or
clickable-link interpretation.

Repeated rendering with different diagrams/configuration, including a failure
between successful renders, must not leak tree data, styles, notes, or accessible
metadata into the next result. Standard Mermaid error presentation may remain;
it must not be mistaken for a successfully rendered partial memory map.

### Permanent local examples

Implementation must provide the following focused collection in
`e2e/diagrams/memorymap/pr-check/`, with descriptive filenames and metadata:

- Boot storage example in vertical and horizontal orientations.
- Nested sections in vertical and horizontal orientations.
- Configured styling, blank sections, and borderless sections in both
  orientations.
- Long-note wrapping in vertical and horizontal orientations.
- Representative dark-theme variants covering both orientations.

The eight core example/orientation combinations are required, not just
illustrative suggestions. Reuse/adapt the accepted planning examples; the
preserved original shorthand is not valid grammar. Invalid-input cases belong
in targeted tests, not in this successful-render fixture collection.

No separate Dev Explorer registration or manifest is needed. With its default
`e2e` root, browse `diagrams`, then `memorymap`, then `pr-check` from:

```text
http://localhost:9000/dev/?path=diagrams
```

Or open the collection directly:

```text
http://localhost:9000/dev/?path=diagrams/memorymap/pr-check
```

The `path` parameter opens a directory, not a recursive flat listing. A `file`
parameter can open a specific fixture relative to the explorer root.

For the requested local port, run from the intended checkout:

```bash
MERMAID_DEV_PORT=9000 pnpm dev
```

Wait for the build/listening confirmation before reviewing fixtures.
Do not set `MERMAID_DEV_EXPLORER_ROOT` to `.wayfinder` for this acceptance
workflow: the examples must be part of the ordinary repository fixture tree.
If port 9000 belongs to another process, use an available port and update the
URL rather than disturbing that process.

These are requirements for the implementation. No runtime fixtures were added
during planning, because no memory-map parser exists to render them yet.

### Manual visual gate

Review the eight core example/orientation combinations locally for readable
text, intended grouping, nesting, notes, reserved-section fill, blank/borderless
sections, wrapping, and content-driven growth. Include additional default/dark
theme checks in both orientations.

Confirm that the configured examples affect only their intended owners and that
intrinsic output can be scrolled by a host while responsive output fits without
cropping. Review and document a host-owned overflow-container example rather
than adding a viewport inside the diagram.

Record the browser, viewport, theme, and relevant font environment used for
review. The agreed numeric defaults are initial planning values, not previously
calibrated visual results. Readability problems must be addressed before
implementation acceptance; do not call the values visually tested now.

### Scale gate

Generate representative input with approximately 1,000 sections in total and
a nesting path 10 levels deep. Run both orientations and verify:

- Successful layout with finite geometry and complete SVG bounds.
- All source sections represented in the model/layout and all expected text
  retained, with no silent truncation.
- Correct containment and ordering, including the nested path.
- Recorded test environment and observed elapsed time.

Use targeted browser geometry/content smoke checks, not giant full-size
screenshot baselines. This avoids conflating screenshot-dimension limits with
layout failures. Keep large input generation in the targeted test rather than
adding enormous visual-baseline fixtures.

There is no fixed performance timing threshold without a measured baseline.
The stress target is not a supported-size ceiling or a semantic nesting limit;
it also does not promise unbounded resources in every browser or viewer.

### Compatibility and accessibility boundary

Follow Mermaid's existing browser policy, common SVG title/description
mechanism, and plain-text behavior. Verify `accTitle` and `accDescr`, and
document author-supplied descriptions rather than requiring bespoke automatic
screen-reader narration.

The current Playwright configuration uses Desktop Chrome/Chromium settings and
does not define a cross-browser projects matrix. Its passing results are not
proof that all supported browsers were exercised. Record the browsers actually
tested; do not introduce a new cross-browser tooling project or claim universal
host/exporter certification.

Standalone SVG must contain the complete map. Fitting, pagination, raster
dimensions, external viewer behavior, and custom host styling remain at the
previously agreed boundary.

### Future validation commands

These are required implementation handoff commands, verified against existing
script/runner syntax. New `memorymap` test paths and fixtures must first be
implemented. Every command below is **not run during planning**; no feature
test pass, build result, or visual result is claimed here.

| Purpose                                   | Command                                                                                                             | Planning status |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------- |
| Generate configuration types              | `pnpm run --filter mermaid types:build-config`                                                                      | Not run         |
| Focused parser/model/config tests         | `pnpm vitest run packages/mermaid/src/diagrams/memorymap`                                                           | Not run         |
| Representative snapshot fixtures          | `MERMAID_PORT=9000 MERMAID_E2E_FIXTURE_TIER=pr-check pnpm e2e e2e/rendering/mmd-snapshots.spec.ts --grep memorymap` | Not run         |
| Focused browser geometry/embedding checks | `MERMAID_PORT=9000 MERMAID_E2E_FIXTURE_TIER=pr-check pnpm e2e e2e/rendering/memorymap/pr-check`                     | Not run         |
| Generated-input stress checks             | `MERMAID_PORT=9000 MERMAID_E2E_FIXTURE_TIER=nightly-check pnpm e2e e2e/rendering/memorymap/nightly-check`           | Not run         |
| Repository lint/format checks             | `pnpm lint`                                                                                                         | Not run         |
| Type checking                             | `pnpm test:check:tsc`                                                                                               | Not run         |
| Build                                     | `pnpm build`                                                                                                        | Not run         |

The snapshot spec has no diagram-specific environment filter: `--grep memorymap`
selects fixture names containing the directory segment. Tier selection uses
`MERMAID_E2E_FIXTURE_TIER`.

Playwright auto-starts `pnpm dev` when needed. `MERMAID_PORT=9000` sets its
base URL and is propagated to the dev server as `MERMAID_DEV_PORT=9000`.
Outside CI it may reuse an existing server; ensure that server belongs to the
intended checkout. In CI existing-server reuse is disabled.

Use installed project dependencies and Chromium. If a browser installation is
missing, the existing `pnpm playwright:install` script installs Chromium; it
was not run during planning. Record exact commands and their results during
implementation validation. Identify unrelated baseline failures separately,
without silently counting them as passes or fixing unrelated code.

### Repository evidence

- [New-diagram guide](../../../packages/mermaid/src/docs/community/new-diagram.md),
  lines 83-125, 154-185, 214-221, and 249-290, establishes native integration,
  configuration, tests, and source documentation expectations.
- [Diagram orchestration](../../../packages/mermaid/src/diagram-api/diagram-orchestration.ts),
  lines 31 and 90-124, and the existing
  [detector](../../../packages/mermaid/src/diagrams/usecase/usecaseDetector.ts)
  and [definition](../../../packages/mermaid/src/diagrams/usecase/usecaseDiagram.ts)
  provide registration/reference boundaries.
- [Type generator](../../../packages/mermaid/scripts/create-types-from-json-schema.mts),
  lines 84-90 and 139-160,
  [schema-default plugin](../../../.vite/jsonSchemaPlugin.ts), lines 7-21, and
  [runtime default assembly](../../../packages/mermaid/src/defaultConfig.ts),
  lines 9, 18-20, and 362, distinguish generated types from runtime defaults
  and supported keys.
- [Shared database](../../../packages/mermaid/src/diagrams/common/commonDb.ts)
  and [SVG accessibility](../../../packages/mermaid/src/accessibility.ts),
  line 22 onward, supply common metadata support.
- [Source sidebar](../../../packages/mermaid/src/docs/.vitepress/config.ts),
  line 165, and [examples registry](../../../packages/examples/src/index.ts),
  line 1 onward, identify discoverability integration.
- [Snapshot runner](../../../e2e/rendering/mmd-snapshots.spec.ts), lines 14-23,
  [fixture helper](../../../e2e/helpers/mmd-snapshots.ts), line 9 onward, and
  [scope classifier](../../../scripts/e2e-diagram-scope.mjs) establish current
  fixture naming, tier, and test discovery.
- [Dev server](../../../.esbuild/server.ts), lines 26-54, 169, 378-405, and 554,
  [explorer app](../../../.esbuild/dev-explorer/explorer-app.ts), lines 21-27,
  and [file explorer](../../../.esbuild/dev-explorer/file-explorer.ts),
  lines 81-90, establish the local browser root and query behavior.
- [Playwright configuration](../../../playwright.config.ts), lines 6-27 and
  54-85, establishes port propagation, browser configuration, and server reuse.
- [Root scripts](../../../package.json) and
  [Mermaid package scripts](../../../packages/mermaid/package.json), line 50,
  establish the validation command entry points.

The linked resolutions are the specification, not a second duplicated spec
file. No new decision ticket is needed. Close this ticket and the map, then
hand off: implementation, runtime examples, visual calibration, and executing
the future acceptance checks remain to be done.
