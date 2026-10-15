import { PERSON_IDS, PERSON_NAMES } from './people.js';
import { PARLEY_ENEMIES, PARLEY_IDS, type ParleyEnemy } from './parley.js';
import type { CourtyardPerson } from './world-types.js';
import { STORY_PEOPLE, STORY_PERSON_IDS, type StoryPerson } from './inner-city/people.js';

export type Participant = CourtyardPerson | ParleyEnemy | StoryPerson;
export const PARTICIPANT_IDS: Participant[] = [...PERSON_IDS, ...PARLEY_IDS, ...STORY_PERSON_IDS];
export function isPerson(id: Participant): id is CourtyardPerson { return Object.hasOwn(PERSON_NAMES, id); }
export function isParley(id: Participant): id is ParleyEnemy { return Object.hasOwn(PARLEY_ENEMIES, id); }
export function isStoryPerson(id: Participant): id is StoryPerson { return Object.hasOwn(STORY_PEOPLE, id); }
export function participantName(id: Participant): string { return isPerson(id) ? PERSON_NAMES[id] : isParley(id) ? PARLEY_ENEMIES[id].name : STORY_PEOPLE[id].name; }
