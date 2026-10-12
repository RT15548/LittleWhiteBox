import { createAdministratorWebTools } from './web-tools.js';
import { managementReadError, type ManagementParticipant, type ManagementRegistry, type ManagementResult, type ManagementSession, type ManagementTool } from '../../../capabilities/management/index.js';
import { MANAGEMENT_READ_CHARS, textPage } from '../../../capabilities/management/read-page.js';
import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import type { AdministratorOperation } from '../domain/types.js';
import type { createAdministratorChatReader } from '../host/chat-reader.js';
import { ADMINISTRATOR_CHAT_TOOLS } from './chat-tools.js';
import { administratorError, ADMINISTRATOR_COPY } from '../ui/copy.js';
import { createAdministratorToolResults } from './tool-results.js';
import { createAdministratorId } from '../application/identity.js';
import type { AdministratorEnvironmentReader } from '../domain/environment.js';
import { ADMINISTRATOR_OS_INSPECT, OS_INSPECT } from './os-tools.js';
import { ADMINISTRATOR_RESULT_READ } from './result-tools.js';
import { createAdministratorToolLoader, TOOLS_LOAD, TOOL_NOT_LOADED } from './tool-loader.js';
import { ADMINISTRATOR_REFERENCE_TEXT } from './reference-data.js';
import { requireToolArgumentsObject, ToolArgumentsError } from '../../../capabilities/agent/tool-arguments.js';

type Reader = ReturnType<typeof createAdministratorChatReader>;
const STORY_EVIDENCE_CHANGED = 'The story floors listed in floors changed after you read them. This write was not executed; earlier successful writes are unaffected.';
const STORY_EVIDENCE_RECOVERY = {
    changed: 'Read those floors again with ChatRead from the start of each floor, then decide from the new text whether the change is still wanted before retrying.',
    missing: 'Floors listed in missingFloors no longer exist, so their earlier evidence cannot be refreshed in this run. Tell the user to send a new request based on the current story.',
};
export interface AdministratorConfirmation { messageIndex: number; result: ManagementResult & { receipt: AdministratorOperation } }
export async function createAdministratorToolExecutor(options: {
    registry: ManagementRegistry; reader: Reader; operations: AdministratorOperation[];
    webConfig?: Record<string, unknown>; signal?: AbortSignal;
    readEnvironment: AdministratorEnvironmentReader;
    guard(): boolean; onChange(): void; saveReceipts(confirmation?: AdministratorConfirmation): Promise<void>;
}) {
    const runId = createAdministratorId();
    const routes = new Map<string, { appId: string; tool: ManagementTool; participant: ManagementParticipant | null }>();
    const sessions = new Map<string, ManagementSession>();
    const domains: { id: string; label: string; prompt: string; data: unknown; tools: readonly ManagementTool[] }[] = [];
    const readErrors: { id: string; code: string; message: string }[] = [];
    const evidence = createAdministratorToolResults();
    let pending: { id: string; operation: AdministratorOperation; session: ManagementSession; messageIndex: number; confirmation?: AdministratorConfirmation } | null = null;
    function register(tool: ManagementTool, appId: string, participant: ManagementParticipant | null) {
        const name = tool.definition.function.name;
        if (routes.has(name)) { throw new Error('administrator_duplicate_tool'); }
        routes.set(name, { appId, tool, participant });
    }
    for (const participant of options.registry.list()) {
        let data: unknown;
        try {
            const session = await participant.open();
            sessions.set(participant.id, session);
            data = session.initial;
        } catch (error) {
            options.reader.assertCurrent();
            const failure = { id: participant.id, ...managementReadError(error) };
            readErrors.push(failure);
            data = { error: failure };
        }
        const initial = safePromptJson(data);
        domains.push({ id: participant.id, label: participant.label, tools: participant.tools, prompt: participant.prompt,
            data: initial.length <= MANAGEMENT_READ_CHARS ? data : { ...textPage(initial), detail: ADMINISTRATOR_REFERENCE_TEXT.initialPage } });
        for (const tool of participant.tools) { register(tool, participant.id, participant); }
    }
    const web = createAdministratorWebTools(options.webConfig, options.signal);
    const common = [...ADMINISTRATOR_CHAT_TOOLS, ADMINISTRATOR_OS_INSPECT, ADMINISTRATOR_RESULT_READ, ...web.tools];
    for (const tool of common) { register(tool, ADMINISTRATOR_CHAT_TOOLS.includes(tool) ? 'story' : 'administrator', null); }
    const loader = createAdministratorToolLoader(domains, common);
    register(loader.tool, 'administrator', null);
    function inspectEnvironment() {
        options.reader.assertCurrent();
        try {
            const data = options.readEnvironment(options.reader.identity);
            return { ok: true, status: 'read' as const, data };
        } catch (error) {
            if ((error as Error)?.message === 'administrator_context_changed' || (error as Error)?.name === 'AbortError') { throw error; }
            return { ok: false, status: 'failed' as const, code: 'administrator_environment_unavailable' };
        } finally { options.reader.assertCurrent(); }
    }
    function complete(operation: AdministratorOperation, result: ManagementResult, tool?: ManagementTool, summary?: string) {
        operation.status = result.status;
        const report = result.data && typeof result.data === 'object' ? result.data as { applied?: unknown[]; skipped?: unknown[] } : null;
        operation.summary = summary ?? (result.data && typeof result.data === 'object' && 'message' in result.data && !result.ok
            ? String(result.data.message).slice(0, 350) : undefined) ?? (report?.applied || report?.skipped
            ? ADMINISTRATOR_COPY.itemReport(report.applied?.length ?? 0, report.skipped?.length ?? 0) : ADMINISTRATOR_COPY.operations[result.status]);
        const projected = tool === ADMINISTRATOR_RESULT_READ ? result
            : evidence.project(operation.id, result, {
                sourcePaged: tool !== undefined && ADMINISTRATOR_CHAT_TOOLS.includes(tool),
                boundedSource: tool !== undefined && web.tools.includes(tool),
            });
        const output = { ...projected, receipt: { ...operation } };
        options.onChange();
        return output;
    }
    return {
        getTools: loader.getTools,
        prompt: domains.map(domain => domain.prompt).join('\n\n'),
        data: { environment: inspectEnvironment(), story: options.reader.info, apps: domains.map(({ id, data }) => ({ id, data })), readErrors },
        evidence: evidence.read,
        async confirmSaved() {
            if (!pending) { return; }
            const inspection = pending.confirmation ? { status: 'confirmed' as const, result: pending.confirmation.result } : await pending.session.confirmSaved();
            if (!inspection || inspection.status !== 'confirmed') { return inspection; }
            const confirmation = pending.confirmation ??= { messageIndex: pending.messageIndex, result: complete(pending.operation, inspection.result) };
            await options.saveReceipts(confirmation);
            pending = null;
            return inspection;
        },
        async execute(name: string, raw: unknown, callId: string, messageIndex: number): Promise<unknown> {
            const id = `${runId}:${callId}`;
            const route = routes.get(name);
            if (!route) { return { ok: false, status: 'failed', code: 'tool_unavailable' }; }
            if (!loader.getTools().some(tool => tool.function.name === name)) { return TOOL_NOT_LOADED; }
            let args: Record<string, unknown>;
            try { args = requireToolArgumentsObject(raw); }
            catch (error) {
                if (!(error instanceof ToolArgumentsError)) { throw error; }
                return error.result();
            }
            if (name === OS_INSPECT && Object.keys(args).length) { return { ok: false, status: 'failed', code: 'arguments_must_be_empty' }; }
            if (route.tool.effect === 'write') {
                const stale = options.reader.staleEvidence();
                if (stale.floors.length) {
                    const recovery = stale.missingFloors.length ? STORY_EVIDENCE_RECOVERY.missing : STORY_EVIDENCE_RECOVERY.changed;
                    return { ok: false, status: 'failed', code: 'story_evidence_changed', data: { ...stale, message: `${STORY_EVIDENCE_CHANGED} ${recovery}` } };
                }
            }
            const operation: AdministratorOperation = {
                id, appId: route.appId, name: route.tool.label, target: route.tool.target(args).slice(0, 160),
                status: route.tool.effect === 'write' ? 'saving' as const : 'reading' as const, elapsedMs: 0, summary: '',
            };
            options.operations.push(operation);
            const started = performance.now(); options.onChange();
            try {
                // Record the attempted write before dispatch, so reload cannot present it as a confirmed success.
                if (route.tool.effect === 'write') { await options.saveReceipts(); }
                let result: ManagementResult;
                if (route.participant) {
                    options.reader.assertCurrent();
                    let session = sessions.get(route.appId);
                    if (!session) { session = await route.participant.open(); sessions.set(route.appId, session); }
                    options.reader.assertCurrent();
                    try { result = await session.execute(name, args, options.guard); }
                    catch (error) { if (route.tool.effect === 'write') { pending = { id, operation, session, messageIndex }; } throw error; }
                    if (route.tool.effect === 'read') { options.reader.assertCurrent(); }
                } else if (web.owns(name)) {
                    options.reader.assertCurrent();
                    result = await web.execute(name, args);
                    options.reader.assertCurrent();
                } else if (name === TOOLS_LOAD) {
                    options.reader.assertCurrent();
                    result = loader.load(args);
                } else if (name === OS_INSPECT) {
                    result = inspectEnvironment();
                } else {
                    const data = name === 'ChatRead' ? await options.reader.read(args) : name === 'ChatSearch' ? await options.reader.search(args) : evidence.page(id, String(args.reference), args.offset);
                    result = { ok: true, status: 'read', data };
                }
                operation.elapsedMs += Math.round(performance.now() - started);
                // The loop saves this result and its receipt together before any further dispatch.
                return complete(operation, result, route.tool, name === TOOLS_LOAD && result.ok ? ADMINISTRATOR_COPY.toolsLoaded
                    : name === OS_INSPECT && !result.ok ? administratorError(new Error('administrator_environment_unavailable')) : undefined);
            } catch (error) {
                operation.status = pending?.id === id && (error as { uncertain?: boolean })?.uncertain ? 'unconfirmed' : 'failed';
                operation.elapsedMs += Math.round(performance.now() - started);
                operation.summary = String(error instanceof Error ? error.message : error).slice(0, 350);
                options.onChange();
                if (route.tool.effect === 'read' && (error as Error).name !== 'AbortError' && (error as Error).message !== 'administrator_context_changed') {
                    return { ok: false, status: 'failed', code: (error as { code?: string })?.code ?? (error as Error).message, receipt: { ...operation } };
                }
                throw error;
            }
        },
        preview(names: string[]): AdministratorOperation[] {
            return names.slice(0, 6).flatMap((name, index) => {
                const route = routes.get(name);
                return route ? [{ id: `preview-${index}`, appId: route.appId, name: route.tool.label, target: '', status: 'preparing' as const, elapsedMs: 0, summary: '' }] : [];
            });
        },
    };
}
export type AdministratorToolExecutor = Awaited<ReturnType<typeof createAdministratorToolExecutor>>;
