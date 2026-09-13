import { IgdbCatalogMethods } from './methods/catalog';

export class IgdbProvider extends IgdbCatalogMethods {}

export type { IgdbGame, IgdbPlatform, IgdbRawGame, IgdbTimeToBeat } from './types';

export const igdbProvider = new IgdbProvider();
