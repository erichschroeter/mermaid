export interface TextStyle {
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
}

export interface MemoryStyle extends TextStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  minLength?: number;
}

export interface SourceLocation {
  line: number;
  column: number;
}

export interface MemoryNode {
  id: string;
  kind: 'group' | 'section';
  content: string;
  label?: string;
  note?: string;
  style: MemoryStyle;
  noteStyle: TextStyle;
  children: MemoryNode[];
  location: SourceLocation;
}

export interface MemoryMap {
  orientation: 'vertical' | 'horizontal';
  groups: MemoryNode[];
  accTitle: string;
  accDescription: string;
}

export interface MemoryConfig {
  useMaxWidth: boolean;
  crossSize: number;
  wrapWidth: number;
  padding: number;
  laneShares: { label: number; section: number; note: number };
  groupStyle: Required<MemoryStyle>;
  sectionStyle: Required<MemoryStyle>;
  noteStyle: Required<TextStyle>;
}
