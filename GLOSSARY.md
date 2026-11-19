# Memory Map Diagrams

Vocabulary for the static memory-map diagram planning effort.

## Language

**Memory map**:
A diagram of labelled groups and their dedicated sections, used to document a static memory layout without requiring numeric addresses.

**Group**:
A top-level collection of one or more dedicated sections, identified by a required entry label.

**Memory section**:
A dedicated section within a group or another section, such as a bootloader copy, reserved area, or bitmap storage. Its extent is not implied by an entry label.
_Avoid_: Separator (a separator marks a boundary between sections).

**Section content**:
Optional descriptive text belonging to a memory section, distinct from its entry label and note.
_Avoid_: Section label (ambiguous between entry label and section content).

**Section length**:
The drawn extent of a section along the map's growth direction: height in a vertical map and width in a horizontal map. It describes diagram geometry, not memory capacity.

**Entry label**:
Literal text identifying a group or optionally a section at any depth, such as `0x00000000`, `Boot area`, or `Bank A`. A numeric-looking label does not imply an address value, size, or boundary.
_Avoid_: Address entry (entry labels need not be addresses).

**Lane**:
A local band for entry labels, memory sections, or notes, arranged according to the map's orientation.

**Lane shares**:
Preferred relative allocations among active lanes, distinct from the drawn lengths of memory sections.
