import type { AgentMessage } from '../../../../agent-core/runtime/conversation.js';

export interface AdministratorImage { name: string; path: string }
export type OperationStatus = 'preparing' | 'reading' | 'saving' | 'read' | 'saved' | 'unchanged' | 'partial' | 'failed' | 'unconfirmed';
export interface AdministratorOperation {
    id: string;
    appId: string;
    name: string;
    target: string;
    status: OperationStatus;
    elapsedMs: number;
    summary: string;
}
export interface AdministratorTurn {
    id: string;
    createdAt: number;
    user: { text: string; image?: AdministratorImage } | null;
    assistant: string | null;
    assistantPayload?: Record<string, unknown>;
    toolMessages: AgentMessage[];
    operations: AdministratorOperation[];
    status: 'finished' | 'interrupted' | 'failed';
    error: string;
}
export interface AdministratorSummary { text: string; throughId: string; throughToolMessage: number | null }
export interface AdministratorData {
    schemaVersion: 2;
    revision: number;
    turns: AdministratorTurn[];
    summary: AdministratorSummary | null;
}
export interface AdministratorContextUsage { used: number; limit: number; trigger: number; history: number; rules: number; tools: number; images: number; runtime: number }
export interface AdministratorProcessRound {
    index: number; text: string;
    tools: { id: string; name: string; target: string; status: OperationStatus | 'queued' | 'not-executed' }[];
}
export interface AdministratorUnsavedProcess { turnId: string; rounds: AdministratorProcessRound[] }
export interface AdministratorRow {
    revision: number;
    id: string; turnId: string; role: 'user' | 'assistant'; text: string; totalChars: number;
    image?: AdministratorImage; processCount: number;
    status: AdministratorTurn['status']; error: string; canRegenerate: boolean;
}
export interface AdministratorPage { rows: AdministratorRow[]; start: number; total: number; revision: number }
export interface AdministratorLive {
    turnId: string; text: string; totalChars: number; process: AdministratorProcessRound[]; preview: AdministratorOperation[];
    startedAt: number;
    phase: 'preparing' | 'waiting' | 'thinking' | 'replying' | 'tools' | 'summarizing' | 'saving' | 'stopping';
}
export interface AdministratorState {
    chatIdentity: string; page: AdministratorPage; live: AdministratorLive | null; unsavedProcess: AdministratorUnsavedProcess | null;
    context: AdministratorContextUsage; error: string; corrupted: boolean; unsaved: boolean;
    submission: { id: string; turnId: string; accepted: boolean } | null;
    conflict: boolean;
}
