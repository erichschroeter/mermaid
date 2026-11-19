import type { DiagramDefinition } from '../../diagram-api/types.js';
import { db, parser } from './memorymapDb.js';
import { renderer } from './memorymapRenderer.js';
import styles from './styles.js';

export const diagram: DiagramDefinition = { db, parser, renderer, styles };
