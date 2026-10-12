import type { CourtyardFact, CourtyardPerson, CourtyardScene } from '../content/world-types.js';
import type { Battle, Outfit, Relic, RelicStack, Weapon } from '../types.js';
import type { WorldLocation } from '../world/exploration.js';
import type { NarrativeAction } from '../narrative/actions.js';
import type { Relationship } from './relationships.js';
import type { PeopleLocations } from '../world/people.js';
import type { Participant } from '../content/participants.js';
import type { PendingParley } from './parley.js';
import type { Traveler } from './traveler.js';
import type { ChapterId } from '../content/chapters.js';
import type { Performance } from '../performance/catalog.js';
import type { ClothingChange } from '../content/clothing.js';
import type { EncounterSegment } from '../content/courtyard-encounters.js';
import type { RewardNode } from '../content/campaign-rewards.js';

export interface ConversationTurn {
    id: string; kind: 'greeting' | 'dialogue' | 'receipt' | 'player'; player: string; reply: string;
    action: NarrativeAction | null; facts: CourtyardFact[]; scene: CourtyardScene;
    affectionDelta?: number;
    performance?: Performance;
    clothing?: ClothingChange;
    regeneratedFrom?: string;
    issue?: 'action_rejected' | 'clothing_rejected' | 'performance_rejected' | 'metadata_invalid' | 'reply_invalid' | 'reply_incomplete';
}
export interface ConversationMemory { throughId: string; text: string }
export type DialogueEffects = Pick<Campaign, 'seed' | 'facts' | 'knowledge' | 'relationships' | 'people' | 'pendingParley'>;
export interface ReplyCheckpoint { person: Participant; turnId: string; before: DialogueEffects }
export interface Campaign {
    id: string;
    traveler: Traveler;
    chapter: ChapterId;
    seed: number;
    weapon: Weapon;
    outfit: Outfit;
    location: WorldLocation;
    facts: CourtyardFact[];
    hp: number;
    collection: RelicStack[];
    equipped: Relic[];
    rewards: Partial<Record<RewardNode, { scene: CourtyardScene; offers: RelicStack[] }>>;
    rewardNode: RewardNode | null;
    completedSegments: EncounterSegment[];
    engagement: { id: EncounterSegment; reinforcement: boolean } | null;
    phase: 'exploration' | 'battle' | 'reward' | 'lost';
    battle: Battle | null;
    checkpoint: Battle | null;
    relationships: Record<CourtyardPerson, Relationship>;
    people: PeopleLocations;
    pendingParley: PendingParley | null;
    lastReply?: ReplyCheckpoint;
    evidence: { dispatchNoteSeen: boolean };
    conversations: Record<Participant, ConversationTurn[]>;
    memories: Record<Participant, ConversationMemory | null>;
    knowledge: Record<Participant, CourtyardFact[]>;
}
