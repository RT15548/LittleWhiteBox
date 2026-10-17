import type {
    TaskCandidate,
    TaskCandidateDraft,
    TaskListingDraft,
} from '../../../domains/tasks/types.js';
import type {
    PromptContextInput,
    PromptContextSnapshot,
} from '../../../host/prompt-context/types.js';
import type { WorldContent } from '../../../domains/world/types.js';

export interface TaskGenerationContext extends PromptContextSnapshot {
    readonly mapContext: string;
    readonly worldContent: WorldContent | null;
}

export interface TaskGenerationContextInput extends PromptContextInput {
    readonly mapContext?: unknown;
    readonly worldContent?: WorldContent | null;
}

export type TaskGenerationBoundary =
    | {
        readonly kind: 'board';
        readonly chatIdentity: string;
        readonly contextSnapshot: TaskGenerationContext;
        readonly expectedBoardId: string | null;
    }
    | {
        readonly kind: 'candidates';
        readonly chatIdentity: string;
        readonly contextSnapshot: TaskGenerationContext;
        readonly taskId: string;
        readonly expectedTaskRevision: number;
        readonly expectedEventId: string;
    };

export interface RecruitingTaskPromptData {
    readonly issuer: { readonly displayName: string };
    readonly title: string;
    readonly objective: string;
    readonly requirements?: string;
    readonly location: string;
    readonly risk: string;
    readonly reward: number;
}

export interface TaskGenerationMessage {
    readonly role: 'system' | 'user';
    readonly name?: string;
    readonly content: string;
}

export interface TaskGenerationPrompt {
    readonly systemPrompt: string;
    readonly messages: readonly TaskGenerationMessage[];
    readonly tools: readonly [];
}

export type TaskCompileStatus = 'updated' | 'unchanged' | 'partial' | 'failed';

export type TaskCompileReason =
    | 'response_too_large'
    | 'response_truncated'
    | 'json_not_found'
    | 'root_must_be_object'
    | 'tasks_must_be_array'
    | 'candidates_must_be_array'
    | 'collection_exceeds_limit'
    | 'item_must_be_object'
    | 'required_field_missing'
    | 'field_type_invalid'
    | 'field_too_long'
    | 'tags_invalid'
    | 'direction_invalid'
    | 'direction_duplicate'
    | 'posture_invalid'
    | 'timing_invalid'
    | 'reward_invalid'
    | 'grade_invalid'
    | 'grade_reward_mismatch'
    | 'candidate_name_duplicate';

export interface TaskCompileItemReport {
    readonly collection: 'tasks' | 'candidates';
    readonly index: number;
    readonly id: string;
    readonly changed?: boolean;
    readonly reason?: TaskCompileReason;
    readonly hint?: string;
}

export interface TaskCompileResult<T> {
    readonly ok: boolean;
    readonly status: TaskCompileStatus;
    readonly changed: boolean;
    readonly applied: readonly TaskCompileItemReport[];
    readonly skipped: readonly TaskCompileItemReport[];
    readonly warnings: readonly string[];
    readonly hint?: string;
    readonly data?: T;
}

export type BoardCompileResult = TaskCompileResult<{
    readonly listings: readonly TaskListingDraft[];
}>;

export type CandidateCompileResult = TaskCompileResult<
    | { readonly mode: 'replace'; readonly candidates: readonly TaskCandidateDraft[] }
    | { readonly mode: 'unchanged'; readonly candidates: readonly TaskCandidate[] }
>;
