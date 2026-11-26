import { observeBackgroundTask } from '../../../../shared/common/async-errors.js';
import styleText from './styles.css?inline';
import controlsCss from '../../shared/update-controls.css?inline';
import { COPY, errorText } from './copy.js';
import { element, resultLabel, resultStage, showDiagnostics } from './result.js';
import { createResultDialog, type FloorResult } from './result-dialog.js';
import { notifyInfo } from './notifications.js';
import { DEFINITION_FILE } from '../definition/format.js';
import type { State3Api } from '../runtime/api.js';
import type { Draft } from '../definition/authoring.js';
import type { UpdateStage, Definition } from '../types.js';
import type { UpdaterSettings } from '../runtime/settings.js';
import { createAuthorExtensions } from './author-extensions.js';
import { EXTENSION_COPY as EC } from '../extensions/copy.js';
import { fieldName } from '../definition/schema-fields.js';

type Action = (signal: AbortSignal) => unknown | Promise<unknown>;
export function createState3Page(api: State3Api) {
    const style = element('style', styleText + controlsCss), dialog = element('dialog', undefined, 'lwb-state3-dialog');
    const header = element('header'), nav = element('nav'), main = element('main'), notice = element('output');
    const resultDialog = createResultDialog(api);
    notice.setAttribute('role', 'status');
    let page: 'play' | 'author' = 'play', draft: Draft | undefined, working = new Map<string, string>(), selectedFile = '';
    let authorTab: 'rules' | 'extensions' = 'rules', sourceOpen = false;
    const editing = new Map<string, { draft: Draft; working: Map<string, string>; selectedFile: string }>();
    let controller: AbortController | undefined, generation = 0;
    let latestAiIndex = -1, latestUserIndex = -1;
    const button = (label: string, action: Action) => {
        const node = element('button', label, 'menu_button'); node.type = 'button';
        node.addEventListener('click', () => { observeBackgroundTask(act(action, node), { source: import.meta.url, operation: 'pageAction' }); });
        return node;
    };
    function cancel() { generation++; controller?.abort(); }
    async function act(action: Action, node: HTMLButtonElement) {
        controller?.abort(); const turn = ++generation;
        controller = new AbortController(); node.disabled = true; notice.textContent = '';
        try { await action(controller.signal); }
        catch (error) { if (turn === generation) { notice.textContent = errorText(error); notifyInfo(errorText(error)); } }
        finally { node.disabled = false; }
    }
    const row = (...nodes: HTMLElement[]) => { const root = element('div', undefined, 'lwb-state3-actions'); root.append(...nodes); return root; };
    const label = (text: string, node: HTMLElement) => { const root = element('label', text); root.append(node); return root; };
    function currentDraft(): Draft {
        if (!draft) {throw new Error(COPY.notEnabled);}
        return { ...draft, files: [...working].map(([path, content]) => ({ ...draft!.files.find(file => file.path === path), path, content })) };
    }
    async function loadDraft() {
        const opened = await api.openDraft(), retained = editing.get(opened.avatar);
        if (retained) {
            ({ draft, working, selectedFile } = retained); editing.delete(opened.avatar); return;
        }
        draft = opened; working = new Map(draft.files.map(file => [file.path, file.content]));
        selectedFile = draft.root + DEFINITION_FILE;
        if (!working.has(selectedFile)) {working.set(selectedFile, '');}
    }
    async function saveWorking() {
        const baseline = currentDraftBaseline(), submitted = new Map(working);
        const saved = await api.saveDraft(baseline, [...submitted].map(([path, content]) => ({ path, content })));
        if (draft?.avatar !== baseline.avatar) {return;}
        const next = new Map(saved.files.map(file => [file.path, file.content]));
        for (const path of new Set([...submitted.keys(), ...working.keys()])) {
            if (submitted.get(path) !== working.get(path)) {
                if (working.has(path)) {next.set(path, working.get(path)!);} else {next.delete(path);}
            }
        }
        draft = saved; working = next;
    }
    async function syncDraft() {
        if (!draft) {return;}
        if (!hasEdits()) {await loadDraft();}
    }
    const hasEdits = () => Boolean(draft && (working.size !== draft.files.length || draft.files.some(file => working.get(file.path) !== file.content)));
    const authorExtensions = createAuthorExtensions({ draft: currentDraft,
        update(path, content) { if (content === undefined) {working.delete(path);} else {working.set(path, content);} }, button,
        async assistant(path, message) {
            await saveWorking();
            await api.openAssistant({ path, message }); dialog.close();
        } });
    async function renderAuthor() {
        if (!draft) {await loadDraft();}
        const tabs = element('nav', undefined, 'lwb-state3-author-tabs');
        for (const key of ['rules', 'extensions'] as const) {
            const tab = button(EC.tabs[key], async () => { authorTab = key; await render(); });
            tab.setAttribute('aria-selected', String(authorTab === key)); tabs.append(tab);
        }
        main.append(tabs);
        const rootPath = draft!.root;
        const select = element('select'), editor = element('textarea', undefined, 'lwb-state3-definition');
        editor.spellcheck = false; editor.setAttribute('aria-label', COPY.draft);
        function choose() {
            select.replaceChildren();
            for (const path of working.keys()) { const option = element('option', path.slice(rootPath.length)); option.value = path; select.append(option); }
            select.value = selectedFile; editor.value = working.get(selectedFile) || '';
        }
        select.addEventListener('change', () => { selectedFile = select.value; editor.value = working.get(selectedFile) || ''; });
        editor.addEventListener('input', () => working.set(selectedFile, editor.value));
        choose();
        const primary = row(button(COPY.assistant, async () => {
            await saveWorking();
            await api.openAssistant(); dialog.close();
        }), button(COPY.check, async signal => {
            resultDialog.showCheck(await api.checkDraft(currentDraft(), [], { signal, checkOnly: true }),
                () => api.checkDraft(currentDraft(), [], { checkOnly: true }), async () => { await saveWorking(); dialog.close(); return currentDraftBaseline(); });
        }),
            button(COPY.saveCard, async () => {
                await saveWorking();
                const result = await api.saveCardDraft(currentDraftBaseline());
                if (!('ok' in result) || !result.ok) {throw new Error('results' in result ? result.results.filter((item: { saved: boolean }) => !item.saved).map((item: { error: string }) => item.error).join('\n') : COPY.failed);}
                draft = await api.openDraft(); notice.textContent = COPY.savedCard;
            }));
        primary.classList.add('lwb-state3-primary'); main.append(primary);
        if (api.lastResult()) {main.append(button(EC.authorResult, () => resultDialog.showAuthor(api.lastResult()!, async () => {await saveWorking(); dialog.close(); return currentDraftBaseline();})));}
        if (authorTab === 'extensions') {
            const content = element('section'); main.append(content); authorExtensions.renderExtensions(content); return;
        }
        const summary = element('section', undefined, 'lwb-state3-rule-summary');
        try {
            const definition = JSON.parse(working.get(rootPath + DEFINITION_FILE) || '{}') as Definition;
            summary.append(element('h3', definition.name || COPY.noRules));
            for (const [title, items] of [[COPY.fields, definition.access?.map(item => fieldName(definition.schema, item.path))],
                [COPY.actions, definition.actions?.map(item => item.title)]] as const) {
                if (!items?.length) {continue;}
                const list = element('ul'); for (const text of items) {list.append(element('li', text));}
                summary.append(element('strong', title), list);
            }
        } catch {summary.append(element('p', EC.rulesInvalid));}
        main.append(summary);
        main.append(element('p', COPY.openingHelp));
        const code = element('details'); code.open = sourceOpen;
        code.addEventListener('toggle', () => {sourceOpen = code.open;});
        code.append(element('summary', COPY.editSource), label(COPY.file, select), editor,
            row(button(COPY.saveDraft, async () => {await saveWorking(); notice.textContent = COPY.savedDraft;}),
                button(COPY.newFunction, async () => {await saveWorking(); await api.openAssistant({ path: rootPath + DEFINITION_FILE, message: COPY.functionRequest }); dialog.close();})));
        main.append(code);
        const request = element('pre'); request.hidden = true;
        const requestStage = element('select');
        for (const stage of ['before', 'after'] as const) { const option = element('option', COPY.stageNames[stage]); option.value = stage; requestStage.append(option); }
        requestStage.value = 'after';
        code.append(row(button(COPY.previewRequest, async signal => {
            request.textContent = JSON.stringify(await api.previewRequest({ signal, stage: requestStage.value as UpdateStage }), null, 2); request.hidden = false;
        }), requestStage), request);
    }
    function currentDraftBaseline() { if (!draft) {throw new Error(COPY.notEnabled);} return draft; }
    async function renderPlay() {
        const status = await api.inspect();
        if (!status.ok) {
            const last = api.lastResult();
            if (last && !last.ok) {showDiagnostics(main, last.diagnostics);}
            main.append(element('p', COPY.notEnabled), button(COPY.enable, async signal => { const result = await api.enable({ signal }); await render(); resultDialog.show(result); }));
            return;
        }
        const stages = status.bundle.definition.updates, hasBefore = stages.includes('before'), hasAfter = stages.includes('after');
        main.append(element('h3', COPY.pluginUpdate), element('p', COPY.cardUpdateMode(COPY.updateModes[hasBefore && hasAfter ? 'both' : hasBefore ? 'before' : 'after'])));
        if (hasBefore) {main.append(element('p', COPY.beforeAuto));}
        const settings = element('section'), current = api.settings(), auto = element('input'), source = element('select');
        auto.type = 'checkbox'; auto.checked = current.auto;
        for (const [key, text] of Object.entries(COPY.sources)) { const option = element('option', text); option.value = key; source.append(option); }
        source.value = current.source;
        const save = () => api.saveSettings({ auto: auto.checked, source: source.value as UpdaterSettings['source'] });
        auto.addEventListener('change', save); source.addEventListener('change', save);
        const autoLabel = element('label', undefined, 'lwb-state3-check'); autoLabel.append(auto, COPY.auto);
        if (hasAfter) {settings.append(autoLabel, element('p', COPY.afterHelp, 'lwb-state3-help'));}
        settings.append(label(COPY.model, source));
        main.append(settings);
        const trust = api.extensionTrust();
        if (trust === 'allowed') {main.append(button(EC.revoke, async () => { api.revokeExtensionTrust(); await render(); notice.textContent = EC.revoked; }));}
        if (trust === 'required') {main.append(element('p', EC.trustRequired), button(EC.authorize, async signal => {await api.authorizeExtensions({ signal }); await render();}));}
    }
    async function render() {
        main.replaceChildren(); nav.replaceChildren();
        for (const [key, text] of [['play', COPY.play], ['author', COPY.author]] as const) {
            const tab = button(text, async () => { page = key; await render(); }); tab.setAttribute('aria-selected', String(key === page)); nav.append(tab);
        }
        if (page === 'author') {await renderAuthor();} else { await renderPlay(); return; }
        const picker = element('input'); picker.type = 'file'; picker.accept = '.json,application/json'; picker.hidden = true;
        const importButton = button(COPY.importRules, () => picker.click());
        picker.addEventListener('change', () => {
            const file = picker.files?.[0]; picker.value = ''; if (!file) {return;}
            observeBackgroundTask(act(async signal => {
                const prepared = await api.prepareRuleImport(await file.text(), { signal });
                signal.throwIfAborted();
                if (!globalThis.confirm(COPY.importConfirm)) {return;}
                await api.importRules(prepared, { signal });
                notice.textContent = COPY.importedRules;
            }, importButton), { source: import.meta.url, operation: 'importRules' });
        });
        const sharing = element('details'); sharing.append(element('summary', COPY.sharing), element('p', COPY.packageHelp, 'lwb-state3-help'));
        sharing.append(row(importButton,
            button(COPY.exportRules, async signal => {
                const bundle = await api.exportRules({ signal });
                const url = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' }));
                const link = element('a'); link.href = url; link.download = 'variables-3.0.json'; link.click();
                setTimeout(() => URL.revokeObjectURL(url), 0);
                notice.textContent = COPY.exportedRules;
            })), picker); main.append(sharing);
    }
    header.append(element('h2', COPY.title), button(COPY.close, () => dialog.close()));
    dialog.addEventListener('close', cancel); dialog.addEventListener('cancel', cancel);
    dialog.append(header, nav, main, notice); document.head.append(style); document.body.append(dialog);
    return {
        async open(nextPage: 'play' | 'author' = 'play', tab?: typeof authorTab, path?: string) {
            page = nextPage; await syncDraft();
            if (tab) {authorTab = tab;}
            if (path) {selectedFile = path; sourceOpen = true; authorExtensions.select(path);}
            await render(); if (!dialog.open) {dialog.showModal();}
        },
        targetChanged() {
            if (draft && hasEdits()) {editing.set(draft.avatar, { draft, working, selectedFile });}
            cancel(); authorExtensions.clear(); latestAiIndex = latestUserIndex = -1; resultDialog.clear(); draft = undefined; working = new Map(); if (dialog.open) {dialog.close();}
        },
        mountControl(index: number, results: FloorResult[], { updates, beforeIndex, lastReceiptIndex, definition }: { updates: UpdateStage[]; beforeIndex: number; lastReceiptIndex: number; definition?: Definition }) {
            document.querySelectorAll('.lwb-state3-controls').forEach(node => node.remove());
            latestAiIndex = index; latestUserIndex = beforeIndex;
            const status = api.updateStatus(), busyIndex = status.index ?? index;
            resultDialog.sync(results, index, status, beforeIndex, definition);
            const floors = new Set([...results.filter(item => item.index >= 0 && item.index === (item.stage === 'before' ? beforeIndex : index)).map(item => item.index),
                ...(updates.includes('after') && index >= 0 ? [index] : []), ...(beforeIndex >= 0 ? [beforeIndex] : [])]);
            for (const floor of floors) {
                const floorTarget = document.querySelector(`.mes[mesid="${floor}"] .mes_text`);
                if (floorTarget) {
                    const item = results.find(item => item.index === floor), last = item?.result;
                    const isBefore = floor === beforeIndex;
                    const busy = status.busy && floor === busyIndex;
                    const unsettled = !last || last.ok && !last.receipt;
                    const group = element('div', undefined, 'lwb-state3-controls lwb-variable-controls');
                    group.dataset.floor = String(floor);
                    const current = () => group.isConnected && floor === (isBefore ? latestUserIndex : latestAiIndex);
                    const control = (label: string, action: Action, confirmation?: string) => button(label, signal => {
                        if (!current() || confirmation && !globalThis.confirm(confirmation)) {return;}
                        if (current()) {return action(signal);}
                    });
                    const replacesResult = lastReceiptIndex >= floor;
                    const calculate = (label: string) => control(label, () => isBefore ? api.recomputeBefore(floor) : api.update(), replacesResult ? COPY.recomputeConfirm : undefined);
                    const skip = () => control(COPY.skipBefore, () => api.skipBefore(floor), replacesResult ? COPY.undoConfirm : undefined);
                    if (busy) {group.append(control(COPY.cancel, api.cancel));}
                    else if (last?.ok && last.saved === false) {group.append(control(COPY.retrySave, () => api.retrySave()));}
                    else if (status.retryIndex === floor) {
                        group.append(calculate(COPY.retryCalculation));
                        if (isBefore) {group.append(skip());}
                    }
                    else if (last && (!last.ok || last.receipt?.beforeUpdate?.outcome === 'failed')) {
                        group.append(calculate(COPY.retryCalculation)); if (isBefore) {group.append(skip());}
                    } else if (unsettled) {
                        group.append(calculate(COPY.settle)); if (isBefore) {group.append(skip());}
                    } else if (resultStage(last) !== 'opening' || updates.includes('after')) {group.append(calculate(resultStage(last) === 'opening' ? COPY.settle : COPY.recompute));}
                    if (last) {group.append(control(COPY.result, () => resultDialog.open(floor)));}
                    group.append(control(COPY.settings, () => this.open()));
                    const stage = resultStage(busy ? undefined : last, isBefore ? 'before' : 'after')!;
                    group.dataset.stage = stage;
                    const statusLabel = element('span', [COPY.stageNames[stage],
                        busy ? COPY.phases[status.phase] : item?.edited ? COPY.messageEdited : unsettled ? COPY.unsettled : last ? resultLabel(last) : COPY.unsettled].join(' · '));
                    statusLabel.setAttribute('role', 'status'); group.append(statusLabel);
                    floorTarget.after(group);
                }
            }
        },
        dispose() { cancel(); api.cancel(); resultDialog.dispose(); dialog.remove(); style.remove(); document.querySelectorAll('.lwb-state3-controls').forEach(node => node.remove()); },
    };
}
