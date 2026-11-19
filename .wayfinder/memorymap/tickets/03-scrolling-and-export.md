---
title: Choose scrolling and export ownership
labels: [wayfinder:grilling]
state: open
assignees: []
parent: ../map.md
---

## Question

Where does responsibility for scrolling and fitting a large memory map belong:
inside Mermaid's rendered output, in the embedding host, or in a documented
combination?

The requirement is readable large maps extending vertically or horizontally;
the user has not required Mermaid to own a scrollable viewport.

Decide the contract for intrinsic dimensions, responsive fitting, clipping,
overflow, and host interaction without assuming that every consumer is an
interactive web page. Cover standalone SVG and static export behavior, and
identify which promises Mermaid can make independently of its host.

Use current repository rendering and embedding contracts as evidence. If a
decision needs information outside the repository, surface a research ticket
rather than guessing external viewer behavior.

## Blocked by

None.
