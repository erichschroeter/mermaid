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

**Entry label**:
Literal text identifying a group or optionally a section at any depth, such as `0x00000000`, `Boot area`, or `Bank A`. A numeric-looking label does not imply an address value, size, or boundary.
_Avoid_: Address entry (entry labels need not be addresses).
