import { IgdbCatalogMethods } from './methods/catalog';

export class IgdbProvider extends IgdbCatalogMethods {}

export type { IgdbGame, IgdbPlatform, IgdbTimeToBeat } from './methods/core';

export const igdbProvider = new IgdbProvider();
