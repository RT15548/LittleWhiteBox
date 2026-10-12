import type { LearningClassView } from './application/projection.js';
import type { XiaobaiOsFileState } from '../../kernel/contracts.js';
import type { LearningDialogueView } from './application/message-view.js';
import type { LearningMediaState, LearningVoice } from './host/media-adapter.js';
import type { LearningApproval } from './application/approval.js';
import type { learningTaskView } from './application/delegation.js';
import type { createLearningTeaching } from './application/teaching.js';

export interface LearningClientState extends LearningClassView {
    chatIdentity: string;
    commitId: string | null;
    language: string;
    teacher: { name: string; note: string } | null;
    companionSessionId: string | null;
    candidates: { name: string; aliases: string[] }[];
    storage: 'unloaded' | 'invalid' | 'ready' | 'unconfirmed' | 'conflict';
    chatStorage: XiaobaiOsFileState;
    workbenchStorage: XiaobaiOsFileState;
    walletStorage: XiaobaiOsFileState;
    busy: boolean;
    approval: LearningApproval | null;
    sourceChoice: 'unconfigured' | 'unavailable' | null;
    preparation: { phase: 'article' | 'notes' | 'essay'; running: boolean; message: string; unitId?: string; source?: 'web' | 'authored' } | null;
    chatBusy: boolean;
    workbenchBusy: boolean;
    companionBusy: boolean;
    chatMessage: string;
    workbenchMessage: string;
    message: string;
    reply: ReturnType<ReturnType<typeof createLearningTeaching>['reply']>;
    companionReply: LearningClientState['reply'];
    delegatedTasks: ReturnType<typeof learningTaskView>[];
    /** A stage request the app started for a unit (grading, revision review, model essay, review preparation or grading). */
    pending: { purpose: 'grade' | 'revision-review' | 'model-essay' | 'review-assess' | 'review-prepare'; unitId?: string } | null;
    /** The companion's latest unprompted remark while reading; it is not saved. */
    remark: { text: string; materialId?: string; paragraphId?: string } | null;
    conversation: { turns: LearningDialogueView[]; removedTurns: number; summaryReviews: { attemptId: string; text: string }[] };
    workbenchConversation: LearningClientState['conversation'];
    walletOpen: boolean;
    media: LearningMediaState;
    voices: { enabled: boolean; voices: LearningVoice[]; defaultVoice: string; message: string };
}
