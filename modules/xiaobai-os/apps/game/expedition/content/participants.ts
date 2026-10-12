import { PERSON_IDS, PERSON_NAMES } from './people.js';
import { PARLEY_ENEMIES, PARLEY_IDS, type ParleyEnemy } from './parley.js';
import type { CourtyardPerson } from './world-types.js';

export type Participant = CourtyardPerson | ParleyEnemy;
export const PARTICIPANT_IDS: Participant[] = [...PERSON_IDS, ...PARLEY_IDS];
export function isPerson(id: Participant): id is CourtyardPerson { return Object.hasOwn(PERSON_NAMES, id); }
export function participantName(id: Participant): string { return isPerson(id) ? PERSON_NAMES[id] : PARLEY_ENEMIES[id].name; }
