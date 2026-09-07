import type { XiaobaiOsAgentGateway } from '../../../capabilities/agent/gateway.js';
import type { LearningSelection } from '../../../domains/learning/notes.js';
import { classifyProviderFailure } from '../../../capabilities/agent/provider-failure.js';
import { learningText, LearningValidationError, type LearningTeacherPreference } from '../../../domains/learning/profile.js';
import { buildLearningContext, type LearningDialogue, type LearningTeacherContext } from '../agent/context.js';
import { createLearningBackground, learningBackgroundTool } from '../agent/background.js';
import type { LearningTurn } from '../agent/history.js';
import { buildLearningSystemPrompt } from '../agent/prompt.js';
import { runLearningProviderLoop } from '../agent/provider-loop.js';
import { learningResearchTools } from '../agent/research-tools.js';
import { createLearningSession, type LearningAction } from '../agent/session.js';
import { learningTools } from '../agent/tool-contract.js';
import { createLearningSourceRegistry } from '../materials/lesson-sources.js';
import { createLearningResearch, createLearningResearchCache } from '../materials/research.js';
import { LearningStorageError } from '../storage/repository.js';
import { sameLearningDocument } from '../storage/document.js';
import { confirmedLearning, type LearningRepository } from './service.js';
import { reportLearningFailure, type LearningFailureDetails, type LearningProgress } from './feedback.js';

export interface LearningClassroom {
    language: string; osId: string; chatIdentity: string;
    teacher: NonNullable<LearningTeacherPreference['teacher']>;
}
export type LearningTeachingResult =
    | { status: 'finished'; text: string; changed: boolean; appliedTools: string[] }
    | { status: 'unconfirmed' | 'conflict' | 'cancelled' | 'busy' }
    | { status: 'failed'; reason: string; message: string };
interface TeachingRequest {
    action: LearningAction; message: string; exerciseId?: string; displayMessage?: string; selection?: LearningSelection | null;
}

/** One active teaching action per classroom. Reading/opening never enters this function. */
export function createLearningTeaching(options: {
    repository: LearningRepository; gateway: XiaobaiOsAgentGateway;
    current: () => LearningClassroom | null;
    capture: (name: string, chatIdentity: string) => Promise<LearningTeacherContext>;
    createId?: () => string; now?: () => string;
    onProgress?: (progress: LearningProgress) => void;
    onConversation?: () => void;
}) {
    let active: AbortController | null = null;
    let dialogueKey = '';
    let turns: LearningTurn[] = [];
    let pending: string | null = null;
    let removedTurns = 0;
    let historySummary = '';
    // An uncertain upload owns this reply until its exact commit is confirmed or explicitly abandoned.
    let awaitingSave: { commitId: string; turn: LearningTurn; result: Extract<LearningTeachingResult, { status: 'finished' }>;
        request: TeachingRequest } | null = null;
    let sources = createLearningSourceRegistry();
    let cache = createLearningResearchCache();
    function reset() {
        active?.abort(); active = null; turns = []; pending = null; dialogueKey = ''; removedTurns = 0; historySummary = ''; awaitingSave = null;
        sources = createLearningSourceRegistry(); cache = createLearningResearchCache();
    }
    return {
        cancel() { active?.abort(); active = null; pending = null; },
        reset,
        recoverConfirmed() {
            const saved = options.repository.snapshot();
            if (!awaitingSave || saved.status !== 'ready') { return null; }
            const recovered = awaitingSave;
            awaitingSave = null;
            if (saved.document?.commitId !== recovered.commitId || dialogueKey !== JSON.stringify(options.current())) { return null; }
            turns.push(recovered.turn);
            options.onConversation?.();
            return { result: recovered.result, request: recovered.request };
        },
        conversation(): { turns: LearningDialogue[]; pending: string | null; removedTurns: number } {
            return dialogueKey === JSON.stringify(options.current())
                ? { turns: turns.map(({ user, teacher, presentation }) => ({ user, teacher, ...(presentation ? { presentation } : {}) })), pending, removedTurns }
                : { turns: [], pending: null, removedTurns: 0 };
        },
        async run(input: TeachingRequest): Promise<LearningTeachingResult> {
            if (active) { return { status: 'busy' }; }
            const classroom = structuredClone(options.current());
            if (!classroom?.chatIdentity || !classroom.osId) { return { status: 'cancelled' }; }
            const key = JSON.stringify(classroom);
            if (key !== dialogueKey) { reset(); dialogueKey = key; }
            const controller = new AbortController();
            active = controller;
            const guard = () => active === controller && !controller.signal.aborted && JSON.stringify(options.current()) === key;
            let draft: ReturnType<typeof createLearningSession> | null = null;
            let progress: LearningProgress = { stage: 'context' };
            const advance = (next: LearningProgress) => {
                if (guard()) { progress = next; options.onProgress?.(next); }
            };
            const failure = (reason: string, details: LearningFailureDetails = progress): LearningTeachingResult => ({
                status: 'failed', reason, message: reportLearningFailure(input.action.kind, reason, details),
            });
            try {
                advance(progress);
                const request = structuredClone(input);
                learningText(request.message, 'message', 4000);
                const storage = options.repository.snapshot();
                if (storage.status === 'unconfirmed' || storage.status === 'conflict') { return { status: storage.status }; }
                if (storage.status === 'unloaded') { return failure('learning_read_failed'); }
                const baseline = confirmedLearning(options.repository);
                pending = request.displayMessage ?? request.message; options.onConversation?.();
                const context = await options.capture(classroom.teacher.name, classroom.chatIdentity);
                if (!guard()) { return { status: 'cancelled' }; }
                const asOf = options.now?.() ?? new Date().toISOString();
                const { prefix, messages, turn } = buildLearningContext({ ...classroom, ...request, context, asOf,
                    data: baseline?.data ?? { profiles: [] } });
                const background = createLearningBackground(context);
                advance({ stage: 'config' });
                const config = await options.gateway.loadConfig();
                if (!guard()) { return { status: 'cancelled' }; }
                advance({ stage: 'session' });
                const agent = await options.gateway.openSession(config);
                if (!guard()) { return { status: 'cancelled' }; }
                if (!sameLearningDocument(baseline, confirmedLearning(options.repository))) { return { status: 'conflict' }; }
                const research = createLearningResearch(config, { sources, cache, signal: controller.signal, createId: options.createId, now: options.now });
                // One story-aware teacher for every action, including web research. Free-form derivatives retain this story scope.
                draft = createLearningSession(options.repository, { ...classroom, action: request.action,
                    inputScope: { kind: 'story', osId: classroom.osId }, sources, learnerMessage: request.message, createId: options.createId, now: options.now, asOf });
                const session = draft;
                if (request.exerciseId && request.action.kind === 'explain') { session.markExplained(request.exerciseId); }
                const outcome = await runLearningProviderLoop({ agent, systemPrompt: buildLearningSystemPrompt(classroom.teacher.name), prefix, messages,
                    history: turns, historySummary, reopen: () => options.gateway.openSession(config),
                    onCompact: (count, summary) => { turns.splice(0, count); removedTurns += count; historySummary = summary; options.onConversation?.(); },
                    tools: [...learningTools(), learningBackgroundTool, ...(research.available ? learningResearchTools() : [])],
                    signal: controller.signal, guard, onProgress: advance, executeTool: (name, args) => name === 'LearningSearch' || name === 'LearningExtract'
                        ? research.executeTool(name, args) : name === 'LearningContextRead' ? background.execute(args) : session.executeTool(name, args) });
                if (outcome.status === 'cancelled') { return outcome; }
                if (outcome.status === 'failed') { return failure(outcome.reason, { ...outcome.details, issues: session.unresolvedErrors() }); }
                if (session.unresolvedErrors().length) {
                    return failure('learning_unresolved_proposals', { ...progress, stage: 'tools', issues: session.unresolvedErrors() });
                }
                const appliedTools = session.appliedTools();
                if (session.missingMessageAssessment() || request.action.kind === 'assess' && !session.hasAssessment(request.action.attemptId)) { return failure('learning_assessment_missing'); }
                advance({ stage: 'save' });
                const saved = await session.commit(guard);
                const presentation = session.presentation();
                const completedTurn: LearningTurn = { user: request.displayMessage ?? request.message, teacher: outcome.text,
                    ...(presentation ? { presentation } : {}), messages: [turn, ...outcome.messages] };
                const result = { status: 'finished' as const, text: outcome.text, changed: saved.status !== 'unchanged', appliedTools };
                const commitId = saved.commitId;
                if (commitId && dialogueKey === key && (saved.status === 'unconfirmed' || saved.status === 'conflict' || !guard())) {
                    awaitingSave = { commitId, turn: completedTurn, result, request };
                }
                if (!guard()) { return { status: 'cancelled' }; }
                if (saved.status !== 'confirmed' && saved.status !== 'unchanged') { return { status: saved.status }; }
                turns.push(completedTurn);
                return result;
            } catch (error) {
                if (!guard()) { return { status: 'cancelled' }; }
                const details = { ...progress, cause: error };
                if (error instanceof LearningStorageError) { return failure(error.code, details); }
                if (error instanceof LearningValidationError) {
                    return failure('learning_input_invalid', details);
                }
                const reason = progress.stage === 'provider' ? classifyProviderFailure(error)
                    : progress.stage === 'context' ? 'learning_context_failed' : progress.stage === 'config' ? 'learning_config_failed'
                        : progress.stage === 'save' ? 'learning_save_failed' : 'learning_session_failed';
                return failure(reason, details);
            } finally {
                draft?.invalidate();
                if (active === controller) { active = null; pending = null; options.onConversation?.(); }
            }
        },
    };
}
