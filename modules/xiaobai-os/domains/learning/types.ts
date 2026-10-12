import type { LearningProfile } from './profile.js';
import type { LearningNote } from './notes.js';

export const LEARNING_LIMITS = Object.freeze({
    materialText: 6000, prompt: 1200, explanation: 2000,
    answer: 4000, name: 80, goal: 800, itemChanges: 5, evidence: 3, options: 6, pairs: 8, gaps: 6,
    readDefault: 20, readMax: 50, dataMessage: 24000, paragraphChunk: 2000, acceptedForms: 12,
    annotations: 40, terms: 12, quote: 600, reviewItems: 20,
});
export const LEARNING_SKILLS = ['reading', 'listening', 'vocabulary', 'grammar', 'writing'] as const;
export type LearningSkill = typeof LEARNING_SKILLS[number];
export type LearningScope = { kind: 'public' } | { kind: 'story'; osId: string };
export type RewardTier = 'short' | 'regular' | 'deep';
export interface LearningReward { tier: RewardTier; amount: number }
export interface LearningParagraph { id: string; text: string }
export interface LearningMaterial {
    id: string;
    title: string;
    paragraphs: LearningParagraph[];
    transcriptRevealed: boolean;
    provenance: { kind: 'authored' } | { kind: 'original' | 'adapted'; url: string; title: string; retrievedAt: string };
}
export interface LearningOption { id: string; text: string }
export type LearningResponse =
    | { kind: 'choice'; options: LearningOption[]; multiple: boolean }
    | { kind: 'order'; options: LearningOption[] }
    | { kind: 'match'; left: LearningOption[]; right: LearningOption[] }
    | { kind: 'evidence'; materialId: string }
    | { kind: 'gaps'; slots: LearningOption[] }
    | { kind: 'text' };
export type LearningAnswer =
    | { kind: 'choice' | 'order' | 'evidence'; ids: string[] }
    | { kind: 'match'; pairs: { left: string; right: string }[] }
    | { kind: 'gaps'; values: { id: string; text: string }[] }
    | { kind: 'text'; text: string };
export type LearningRule =
    | { kind: 'semantic' }
    | { kind: 'exact'; answer: LearningAnswer; explanation: string }
    | { kind: 'gaps'; accepted: { id: string; forms: string[] }[]; caseSensitive: boolean; punctuationSensitive: boolean; explanation: string };
export interface LearningExercise {
    id: string;
    skill: LearningSkill;
    materialIds: string[];
    prompt: string;
    response: LearningResponse;
    rule: LearningRule;
    hint: string;
    /** Reading-writing summary: the one paragraph of `materialIds` it summarises. */
    paragraphId?: string;
    /** Review: the grammar/vocabulary item this question reviews. */
    itemId?: string;
}
export interface LearningHelp {
    answer: boolean; hint: boolean; feedback: boolean; transcript: boolean;
    replays: number; slowPlayback: boolean;
}
export interface LearningSpeechVoice { voiceId: string; language: string; speed: number }
export interface LearningListening {
    /** Origin of playback, not an exclusive owner of the material's hearing facts. */
    exerciseId: string; voice: LearningSpeechVoice; parts: { key: string; count: number }[]; slowPlayback: boolean;
}
/** Answer-time hearing facts, grouped by actual material span and synthesis voice. */
export interface LearningHeardPart {
    key: string; voice: LearningSpeechVoice; count: number; slowPlayback: boolean;
}
export interface LearningAttempt {
    id: string; exerciseId: string; answer: LearningAnswer; submittedAt: string; help: LearningHelp; scope: LearningScope;
    listening?: LearningHeardPart[];
    /** A reading-writing revision of this earlier draft of the same exercise. */
    revisesAttemptId?: string;
}
export const LEARNING_ANNOTATION_CATEGORIES = ['content', 'grammar', 'vocabulary', 'cohesion'] as const;
export interface LearningAnnotation {
    id: string;
    category: typeof LEARNING_ANNOTATION_CATEGORIES[number];
    severity: 'error' | 'improve' | 'alternative';
    /** Index into learningAnswerParagraphs(answer text). */
    paragraphIndex: number;
    quote: string; explanation: string; suggestion: string;
    itemId?: string;
}
export type LearningSignal = 'clean' | 'hesitant' | 'blank';
export interface LearningAssessment {
    attemptId: string;
    verdict: 'correct' | 'partial' | 'incorrect' | 'disputed';
    understanding: string;
    expression: string;
    guidance: string;
    scope: LearningScope;
    annotations?: LearningAnnotation[];
    resolvedAnnotationIds?: string[];
    signal?: LearningSignal;
}
export type LearningUnitKind = 'reading-writing' | 'review' | 'lesson';
export interface LearningTerm { text: string; note: string }
export interface LearningExplanation { materialId: string; paragraphId: string; explanation: string; terms: LearningTerm[] }
export interface LearningUnit {
    id: string; kind: LearningUnitKind; title: string; goal: string; scope: LearningScope;
    originOsId: string; reward: LearningReward;
    materials: LearningMaterial[]; exercises: LearningExercise[];
    attempts: LearningAttempt[]; assessments: LearningAssessment[];
    revealed: { answers: string[]; hints: string[] };
    listening?: LearningListening[];
    notes?: LearningNote[];
    /** Reading-writing only (present iff kind is reading-writing). */
    explanations?: LearningExplanation[];
    modelEssay?: { text: string; level: string } | null;
    skippedRevisionAttemptIds?: string[];
}
export interface LearningEvidence {
    unitId: string; scope: LearningScope;
    exercise: LearningExercise; materials: LearningMaterial[];
    attempt: LearningAttempt; assessment: LearningAssessment;
}
export interface LearningSchedule {
    ef: number; repetitions: number; intervalDays: number; dueAt: string; lastAttemptId: string | null;
    /** Quality of the advance that set this state; null for a new or reset item. */
    lastQuality: number | null;
}
export interface LearningItem {
    id: string; label: string; scope: LearningScope; skill: LearningSkill; evidence: LearningEvidence[];
    /** Present iff skill is grammar or vocabulary (the grammar and vocabulary books). */
    schedule?: LearningSchedule;
}
export interface LearningCompletion {
    unitId: string; completedAt: string; summary: string; scope: LearningScope; attemptIds: string[];
    reward: { originOsId: string; amount: number; title: string; note: string };
    receipt?: { transactionId: string; receivedAt: number };
}
export interface LearningLanguage extends LearningProfile {
    unit: LearningUnit | null; review: LearningUnit | null; items: LearningItem[]; completions: LearningCompletion[];
    voice?: LearningSpeechVoice;
}
export interface LearningData { profiles: LearningLanguage[] }

export function canReadLearningScope(scope: LearningScope, osId: string | null): boolean {
    return scope.kind === 'public' || scope.osId === osId;
}
