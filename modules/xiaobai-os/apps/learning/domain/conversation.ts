import { learningRecord, learningText, parseLearningLanguageTag, parseTeacherPreference, type LearningTeacherPreference } from '../../../domains/learning/profile.js';
import { learningArray, learningId, learningInteger, parseLearningScope, requireLearning } from '../../../domains/learning/validation.js';
import type { LearningScope } from '../../../domains/learning/types.js';

export type LearningActor = 'workbench' | 'companion';
export interface LearningSavedExchange {
    id: string;
    user: string;
    reply: string;
    replyTo: string | null;
    summarized: boolean;
    references: string[];
    /** The exchange keeps its access boundary even after its source article is replaced. */
    scope: LearningScope;
}
export interface LearningConversationMemory {
    exchanges: LearningSavedExchange[];
    summary: string;
    summaryReferences: string[];
    summaryScope: LearningScope;
    archivedCount: number;
}
export interface LearningCompanionSession<Memory = LearningConversationMemory> {
    id: string;
    person: NonNullable<LearningTeacherPreference['teacher']>;
    memory: Memory;
}
export interface LearningCompanionState<Memory = LearningConversationMemory> {
    schemaVersion: 2;
    activeSessionId: string | null;
    sessions: LearningCompanionSession<Memory>[];
}
export interface LearningWorkbenchHistory<Memory = LearningConversationMemory> {
    /** Access-separated segments keep a private summary intact when another story continues this language. */
    conversations: { language: string; memories: Memory[] }[];
}

export const emptyLearningMemory = (): LearningConversationMemory => ({ exchanges: [], summary: '', summaryReferences: [], summaryScope: { kind: 'public' }, archivedCount: 0 });
export const emptyLearningCompanions = (): LearningCompanionState => ({ schemaVersion: 2, activeSessionId: null, sessions: [] });
export const selectedLearningCompanion = <Memory>(state: LearningCompanionState<Memory> | null | undefined) => state?.sessions.find(session => session.id === state.activeSessionId) ?? null;

export function parseLearningActor(value: unknown): LearningActor {
    requireLearning(value === 'workbench' || value === 'companion', 'target', 'Choose the learning assistant or companion');
    return value;
}
export function parseLearningMemory(value: unknown): LearningConversationMemory {
    const record = learningRecord(value, 'conversation', ['exchanges', 'summary', 'summaryReferences', 'summaryScope', 'archivedCount']);
    const references = (value: unknown) => learningArray(value, 'references', (id, path) => learningId(id, path));
    return {
        exchanges: learningArray(record.exchanges, 'exchanges', (raw, path) => {
            const turn = learningRecord(raw, path, ['id', 'user', 'reply', 'replyTo', 'summarized', 'references', 'scope']);
            requireLearning(typeof turn.summarized === 'boolean' && (!turn.summarized || turn.replyTo !== null), path, 'Only retained paragraph feedback can also belong to a summary');
            return { id: learningId(turn.id, `${path}.id`), user: learningText(turn.user, `${path}.user`, 12000, true),
                reply: learningText(turn.reply, `${path}.reply`, 100000), replyTo: turn.replyTo === null ? null : learningId(turn.replyTo, `${path}.replyTo`), summarized: turn.summarized, references: references(turn.references),
                scope: parseLearningScope(turn.scope, `${path}.scope`) };
        }),
        summary: learningText(record.summary, 'summary', 100000, true), summaryReferences: references(record.summaryReferences),
        summaryScope: parseLearningScope(record.summaryScope, 'summaryScope'),
        archivedCount: learningInteger(record.archivedCount, 'archivedCount'),
    };
}
export function parseLearningCompanions<Memory>(value: unknown, parseMemory: (value: unknown) => Memory): LearningCompanionState<Memory> {
    const record = learningRecord(value, 'companions', ['schemaVersion', 'activeSessionId', 'sessions']);
    requireLearning(record.schemaVersion === 2, 'schemaVersion', 'Expected current companion format');
    const sessions = learningArray(record.sessions, 'sessions', (raw, path) => {
        const session = learningRecord(raw, path, ['id', 'person', 'memory']);
        const person = parseTeacherPreference({ teacher: session.person }).teacher;
        requireLearning(person, `${path}.person`, 'A companion session has a selected person');
        return { id: learningId(session.id, `${path}.id`), person, memory: parseMemory(session.memory) };
    });
    requireLearning(new Set(sessions.map(session => session.id)).size === sessions.length, 'sessions', 'Session IDs must be unique');
    const activeSessionId = record.activeSessionId === null ? null : learningId(record.activeSessionId, 'activeSessionId');
    requireLearning(activeSessionId === null || sessions.some(session => session.id === activeSessionId), 'activeSessionId', 'Select an existing companion session');
    return { schemaVersion: 2, activeSessionId, sessions };
}
export function parseLearningWorkbenchHistory<Memory>(value: unknown, parseMemory: (value: unknown) => Memory): LearningWorkbenchHistory<Memory> {
    const record = learningRecord(value, 'workbench', ['conversations']);
    const conversations = learningArray(record.conversations, 'conversations', (raw, path) => {
        const conversation = learningRecord(raw, path, ['language', 'memories']);
        return { language: parseLearningLanguageTag(conversation.language, `${path}.language`),
            memories: learningArray(conversation.memories, `${path}.memories`, parseMemory) };
    });
    requireLearning(new Set(conversations.map(entry => entry.language)).size === conversations.length, 'conversations', 'One conversation per learning language');
    return { conversations };
}

/** Deleting an asset also retires conversations and compressed memory which refer to it. */
export function pruneLearningMemory(memory: LearningConversationMemory, references: ReadonlySet<string>): void {
    memory.exchanges = memory.exchanges.filter(exchange => !exchange.references.some(id => references.has(id)));
    if (memory.summaryReferences.some(id => references.has(id))) {
        memory.summary = ''; memory.summaryReferences = []; memory.summaryScope = { kind: 'public' }; memory.archivedCount = 0;
    }
}
