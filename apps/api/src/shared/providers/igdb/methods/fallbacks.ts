import type { IgdbGame } from '../types';
import { IgdbCoreMethods } from './core';

export class IgdbFallbackMethods extends IgdbCoreMethods {
  protected getFallbackGames(): IgdbGame[] {
    return [];
  }
}
