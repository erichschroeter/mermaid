import { getConfig } from '../../config.js';
import type { ParserDefinition } from '../../diagram-api/types.js';
import * as common from '../common/commonDb.js';
import { parseMemoryMap } from './parser/memorymapParser.js';
import { resolveMemoryConfig } from './memorymapStyle.js';
import type { MemoryMap } from './memorymapTypes.js';

const emptyModel = (): MemoryMap => ({
  orientation: 'vertical',
  groups: [],
  accTitle: '',
  accDescription: '',
});
let model = emptyModel();
let config = resolveMemoryConfig({});

export const db = {
  preserveLiteralText: true,
  clear: (): void => {
    model = emptyModel();
    config = resolveMemoryConfig({});
    common.clear();
  },
  getModel: (): MemoryMap => model,
  getConfig: () => config,
  setDiagramTitle: common.setDiagramTitle,
  getDiagramTitle: common.getDiagramTitle,
  setAccTitle: common.setAccTitle,
  getAccTitle: common.getAccTitle,
  setAccDescription: common.setAccDescription,
  getAccDescription: common.getAccDescription,
};

export const parser: ParserDefinition = {
  // eslint-disable-next-line @typescript-eslint/require-await -- keep synchronous failures on the async parser path
  parse: async (source: string): Promise<void> => {
    const title = db.getDiagramTitle();
    db.clear();
    try {
      const nextConfig = resolveMemoryConfig(getConfig());
      const nextModel = parseMemoryMap(source);
      common.setDiagramTitle(title);
      common.setAccTitle(nextModel.accTitle);
      common.setAccDescription(nextModel.accDescription);
      model = nextModel;
      config = nextConfig;
    } catch (error) {
      db.clear();
      throw error;
    }
  },
};
