import type { Bundle, Json, Result, RunOptions } from '../types.js';
export interface Draft { root: string; avatar: string; name: string; files: CardFile[] }
import { runCardFiles } from '../../../card-workspace/service.js';
import { currentCard, readCharacter, replaceVariableBundle } from '../../../card-workspace/host.js';
import { readFiles } from '../../../card-workspace/workspace.js';
import { workspaceRepository } from '../../../assistant/shared/workspace-repository.js';
import { upsertLocalSourceFile, removeLocalSourcePath } from '../../../assistant/shared/local-workspace-kernel.js';
import { buildWorkspacePreconditions } from '../../../assistant/shared/workspace-preconditions.js';
import { CARD_EXTENSION, DEFINITION_FILE } from './format.js';
import { variableBundleFromFiles, decodeBundle, type CardFile } from './card-files.js';
import { digest } from './digest.js';
import { compileDefinition } from './compile.js';
import { checkOpenings, initialize, settle } from '../engine/settle.js';
import { diagnostic, reject } from '../engine/diagnostics.js';

export async function openDraft(): Promise<Draft> {
    const opened = await runCardFiles({ action: 'open' });
    if (!('root' in opened)) {reject('definition-missing');}
    const files = (await readFiles()).filter(file => file.kind !== 'image')
        .filter(file => file.path.startsWith(`${opened.root}variables/`));
    return { ...opened, files };
}

export async function saveDraft(draft: Draft, updates: CardFile[]): Promise<Draft> {
    if (currentCard().avatar !== draft.avatar) {reject('stale-target');}
    const args = { path: `${draft.root}variables/` };
    const sources = (await workspaceRepository.readWorkspace()).localSources;
    const observed = buildWorkspacePreconditions('Delete', args, sources);
    const removed = draft.files.filter(file => !updates.some(update => update.path === file.path));
    const currentFiles = new Map((await readFiles()).map(file => [file.path, file]));
    // The editor's observed contents, not a fresh read, protect assistant edits
    // made while this page was open. Imports/save receipts alone advance baseline.
    for (const file of [...updates, ...removed]) {
        if (!file.path.startsWith(args.path)) {reject('draft-conflict', { path: file.path });}
        const current = currentFiles.get(file.path);
        if (current?.kind === 'image') {reject('draft-conflict', { path: file.path });}
        const original = draft.files.find(item => item.path === file.path);
        if ((current?.content ?? null) !== (original?.content ?? null) && current?.content !== file.content) {reject('draft-conflict', { path: file.path });}
    }
    const result = await workspaceRepository.commitWorkspaceMutation({
        name: 'Delete', args, preconditions: observed,
        signal: undefined, retryContent: undefined,
        execute: async (sources: Awaited<ReturnType<typeof workspaceRepository.readWorkspace>>['localSources']) => {
            let nextSources: Parameters<typeof upsertLocalSourceFile>[0] = sources;
            for (const file of removed) {nextSources = removeLocalSourcePath(nextSources, file.path).nextSources;}
            for (const file of updates) {nextSources = upsertLocalSourceFile(nextSources, file.path, file.content).nextSources;}
            return { result: { ok: true }, nextSources };
        },
    });
    if (!result.committed) {reject('draft-conflict');}
    return openDraft();
}

export function draftBundle(draft: Draft) { return variableBundleFromFiles(draft.root, draft.files); }
export async function checkDraft(draft: Draft, input: unknown = [], { signal, state, stage, prepared, opening, checkOnly = false }: RunOptions & { state?: Json; opening?: number; checkOnly?: boolean } = {}): Promise<Result> {
    try {
        const compiled = compileDefinition(draftBundle(draft));
        if (checkOnly) {return checkOpenings(compiled, { signal });}
        if (state !== undefined) {return settle(compiled, state, input, { signal, stage, prepared });}
        const initial = await initialize(compiled, { signal, opening });
        if (!initial.ok) {return initial;}
        return settle(compiled, initial.state, input, { signal, stage, prepared });
    } catch (error) {return { ok: false, diagnostics: [diagnostic(error)] };}
}
export async function saveCardDraft(draft: Draft) {
    if (currentCard().avatar !== draft.avatar) {reject('stale-target');}
    return runCardFiles({ action: 'save', paths: [draft.root + DEFINITION_FILE] });
}
export async function readCardBundle(signal?: AbortSignal) {
    const selected = currentCard();
    const card = await readCharacter(selected.avatar, signal);
    if (currentCard().avatar !== selected.avatar) {reject('stale-target');}
    const bundle = card.data.extensions?.[CARD_EXTENSION];
    if (!bundle) {reject('definition-missing');}
    return decodeBundle(bundle);
}

export async function exportRules({ signal }: RunOptions = {}): Promise<Bundle> {
    return compileDefinition(await readCardBundle(signal)).bundle;
}
export async function prepareRuleImport(text: string, { signal }: RunOptions = {}) {
    const bundle = compileDefinition(JSON.parse(text)).bundle;
    const avatar = currentCard().avatar;
    const card = await readCharacter(avatar, signal);
    if (currentCard().avatar !== avatar) {reject('stale-target');}
    return { bundle, avatar, previous: digest(card.data.extensions?.[CARD_EXTENSION] ?? null) };
}
export async function importRules(prepared: Awaited<ReturnType<typeof prepareRuleImport>>, { signal }: RunOptions = {}) {
    if (currentCard().avatar !== prepared.avatar) {reject('stale-target');}
    await replaceVariableBundle(prepared.avatar, prepared.bundle, prepared.previous, signal);
    // Existing workspace/editor drafts remain drafts. Their card baseline detects
    // this replacement on save; importing a rule pack never discards author edits.
    return { ok: true as const };
}
