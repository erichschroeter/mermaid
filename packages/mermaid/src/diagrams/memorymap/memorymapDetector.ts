import type { ExternalDiagramDefinition } from '../../diagram-api/types.js';

export const memorymap: ExternalDiagramDefinition = {
  id: 'memorymap',
  detector: (text) => /^\s*memorymap-beta(?:\s|$)/.test(text),
  loader: async () => {
    const { diagram } = await import('./memorymapDiagram.js');
    return { id: 'memorymap', diagram };
  },
};
