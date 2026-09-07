import type { LearningClassView } from './application/projection.js';
import type { LearningAction } from './agent/session.js';
import type { LearningDialogue } from './agent/context.js';
import type { LearningMediaState, LearningVoice } from './host/media-adapter.js';

export interface LearningClientState extends LearningClassView {
    chatIdentity: string;
    language: string;
    teacher: { name: string; note: string } | null;
    candidates: { name: string; aliases: string[] }[];
    storage: 'unloaded' | 'ready' | 'unconfirmed' | 'conflict';
    chatStorage: string;
    busy: boolean;
    message: string;
    reply: { text: string; action: LearningAction['kind']; exerciseId?: string } | null;
    conversation: { turns: LearningDialogue[]; pending: string | null; removedTurns: number };
    walletOpen: boolean;
    media: LearningMediaState;
    voices: { enabled: boolean; voices: LearningVoice[]; defaultVoice: string; message: string };
}
