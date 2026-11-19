// cspell:ignore XLDR EBOOT
import type { DiagramMetadata } from '../types.js';

export default {
  id: 'memorymap',
  name: 'Memory Map',
  description:
    'Static memory layouts with literal entry labels, nested sections, and developer notes',
  examples: [
    {
      title: 'Boot storage',
      isDefault: true,
      code: String.raw`memorymap-beta vertical
  group "0x00000000"
    section "XLDR\nCopy 0"
      style "fill:#F4CCCC"
    section "XLDR\nCopy 1"
    section "XLDR\nCopy 2"
    section "XLDR\nCopy 3"
    note "Boot ROM requires four copies in the first four blocks."
  group "0x00080000"
    section "EBOOT"
      note "256K reserved. Unused space is filled with 0xFF."
  group "0x000C0000"
    section "Splash Screen\nBitmap"
      note "Must be a multiple of 128K and fit the largest splash screen."`,
    },
    {
      title: 'Nested horizontal layout',
      code: `memorymap-beta horizontal
  group "Bank A"
    section "Firmware"
      section "Boot"
        label "Primary"
      section "Application"
      note "The parent owns this note."
    section
      style "stroke:none"
      note "Reserved blank section."`,
    },
  ],
} satisfies DiagramMetadata;
