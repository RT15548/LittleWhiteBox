import { CITY_PASSAGES, type CityPassage } from './inner-city/passages.js';
import { FURNACE_PASSAGES, type FurnacePassage } from './furnace/passages.js';

export type StoryPassage = CityPassage | FurnacePassage;
export const STORY_PASSAGES = { ...CITY_PASSAGES, ...FURNACE_PASSAGES };
export type StoryPassageId = keyof typeof STORY_PASSAGES;
export function findStoryPassage(id: string): StoryPassage | null {
    return Object.hasOwn(STORY_PASSAGES, id) ? STORY_PASSAGES[id as StoryPassageId] : null;
}
