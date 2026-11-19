# Memory Map Diagrams

Vocabulary for the static memory-map diagram planning effort.

## Language

**Memory map**:
A diagram documenting a static address space and the memory sections within it.

**Memory section**:
A dedicated portion of memory, such as a bootloader copy, reserved area, or bitmap storage. Multiple sections can belong beneath one address entry.
_Avoid_: Separator (a separator marks a boundary between sections).

**Address entry**:
An explicit address in the diagram source beneath which one or more memory sections are described.
