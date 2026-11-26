import { observeBackgroundTask } from '../../../../shared/common/async-errors.js';
import { COPY, errorText, playerErrorText } from './copy.js';
import { element, showCheck, showResult, showDiagnostics, resultStage } from './result.js';
import { showExtensionDetails } from './extension-results.js';
import type { Definition, Result, UpdateStage } from '../types.js';
import type { Draft } from '../definition/authoring.js';
import { replayExtension } from '../extensions/replay.js';
import type { State3Api } from '../runtime/api.js';
import { EXTENSION_COPY } from '../extensions/copy.js';
import { DEFINITION_FILE } from '../definition/format.js';
import { isOpeningReceipt } from '../runtime/history.js';

export interface FloorResult { index: number; result: Result; stage?: UpdateStage; edited?: boolean }

/** The selected floor's current swipe, projected by the runtime; never a second history. */
export function createResultDialog(api: State3Api) {
    const dialog = element('dialog', undefined, 'lwb-state3-dialog lwb-state3-result-dialog');
    const header = element('header'), title = element('h2', COPY.result), main = element('main'), notice = element('output');
    notice.setAttribute('role', 'status');
    let results: FloorResult[] = [], selected: number | undefined, standalone: Result | undefined, definition: Definition | undefined, check = false;
    let busyIndex = -1, phase = '', beforeIndex = -1, latestIndex = -1, retryIndex = -1;
    let recheck: (() => Promise<Result>) | undefined;
    let author = false;
    let checkedDraft: (() => Promise<Draft>) | undefined;
    const editableDraft = () => author && checkedDraft ? checkedDraft() : api.openDraft();
    const isLatest = (index: number | undefined, stage?: UpdateStage) => index === undefined || index >= 0 && index === (stage === 'before' ? beforeIndex : latestIndex);
    const current = (index: number | undefined, stage?: UpdateStage) => dialog.open && selected === index && isLatest(index, stage);
    const button = (label: string, action: () => unknown | Promise<unknown>) => {
        const node = element('button', label, 'menu_button'); node.type = 'button';
        node.addEventListener('click', () => observeBackgroundTask((async () => {
            if (!node.isConnected) {return;}
            node.disabled = true; notice.textContent = '';
            try { await action(); }
            catch (error) { notice.textContent = (author ? errorText : playerErrorText)(error); }
            finally { node.disabled = false; }
        })(), { source: import.meta.url, operation: 'resultAction' }));
        return node;
    };
    function render() {
        main.replaceChildren();
        const item = results.find(item => item.index === selected);
        const result = selected === undefined ? standalone : item?.result;
        const displayedStage = resultStage(selected === busyIndex ? undefined : result, item?.stage);
        if (displayedStage) {main.dataset.stage = displayedStage;} else {delete main.dataset.stage;}
        title.textContent = selected !== undefined ? [COPY.floorResult(selected), displayedStage && COPY.stageNames[displayedStage], COPY.result].filter(Boolean).join(' · ') : check ? COPY.checkTitle : result?.ok && !result.committed ? COPY.previewTitle : COPY.result;
        if (selected === busyIndex) {main.append(element('p', COPY.phases[phase], 'lwb-state3-status'));}
        if (!result) { main.append(element('p', COPY.noResult)); return; }
        if (item?.edited) {main.append(element('p', COPY.beforeEdited));}
        const output = element('section');
        if (check) {showCheck(output, result);} else {showResult(output, result, definition, author);}
        main.append(output);
        if (author) {
            showExtensionDetails(output, result.extensions);
        }
        const actions = element('div', undefined, 'lwb-state3-actions');
        const recordedFailure = result.ok && result.receipt?.beforeUpdate?.outcome === 'failed' ? result.receipt.beforeUpdate : undefined;
        const issues = recordedFailure?.diagnostics ?? result.diagnostics;
        if (author && (!result.ok || recordedFailure || issues.some(issue => issue.code === 'extension-after-failed'))) {
            if (check && recheck) {actions.append(button(EXTENSION_COPY.again, async () => { standalone = await recheck!(); render(); }));}
            const failed = result.extensions?.calls.find(call => call.error);
            if (failed) {actions.append(button(EXTENSION_COPY.retest, async () => {
                const tested = await api.testExtension(await editableDraft(), replayExtension(failed));
                const retest = element('section');
                retest.append(element('p', tested.ok ? EXTENSION_COPY.testPassed : EXTENSION_COPY.testFailed));
                if (!tested.ok) {showDiagnostics(retest, tested.diagnostics, undefined, true);}
                else {retest.append(element('pre', JSON.stringify(tested.output, null, 2)));}
                showExtensionDetails(retest, tested.extensions); main.append(retest);
            }));}
            actions.append(button(EXTENSION_COPY.open, async () => {
                const draft = await editableDraft();
                const path = issues.find(issue => typeof issue.path === 'string')?.path;
                await api.openAssistant({ path: draft.root + (typeof path === 'string' ? path : DEFINITION_FILE), reveal: true }); dialog.close();
            }));
            actions.append(button(EXTENSION_COPY.repair, async () => {
                const draft = await editableDraft();
                const path = issues.find(issue => typeof issue.path === 'string')?.path;
                await api.openAssistant({ path: typeof path === 'string' ? draft.root + path : undefined,
                    message: EXTENSION_COPY.repairRequest, context: JSON.stringify(result) }); dialog.close();
            }));
        }
        const index = selected, stage = item?.stage;
        const latest = !author && isLatest(index, stage);
        const action = (label: string, run: () => unknown | Promise<unknown>, confirmation?: string) => {
            const node = button(label, () => {
                if (!current(index, stage) || confirmation && !globalThis.confirm(confirmation)) {return;}
                if (node.isConnected && current(index, stage)) {return run();}
            });
            return node;
        };
        if (latest && result.ok && result.saved === false) {
            actions.append(action(COPY.retrySave, async () => {
                notice.textContent = COPY.phases.saving;
                await api.retrySave();
                if (selected === undefined) {standalone = api.lastResult();}
                notice.textContent = ''; render();
            }));
        }
        if (latest && index !== undefined && stage === 'before' && busyIndex < 0 && !(result.ok && result.saved === false)) {
            actions.append(action(index === retryIndex ? COPY.retryCalculation : COPY.recompute, () => api.recomputeBefore(index), COPY.recomputeConfirm));
            if (index === retryIndex || result.ok && result.receipt?.beforeUpdate?.outcome === 'failed') {actions.append(action(COPY.skipBefore, () => api.skipBefore(index), COPY.undoConfirm));}
            else if (result.ok && result.receipt?.beforeUpdate?.outcome !== 'undone') {actions.append(action(COPY.undoReply, () => api.undoBefore(index), COPY.undoConfirm));}
        } else if (latest && index !== undefined && stage !== 'before' && result.ok && result.receipt && !isOpeningReceipt(result.receipt) && busyIndex < 0) {
            actions.append(action(COPY.undoReply, () => api.undo({ index, all: true }), COPY.undoConfirm));
        } else if (latest && index !== undefined && stage === 'after' && !result.ok && busyIndex < 0) {
            actions.append(action(COPY.retryCalculation, () => api.update()));
        }
        main.append(actions);
    }
    header.append(title, button(COPY.close, () => dialog.close()));
    dialog.append(header, main, notice); document.body.append(dialog);
    dialog.addEventListener('close', () => { if (!dialog.open) {main.replaceChildren(); standalone = undefined;} });
    return {
        sync(next: FloorResult[], index: number, status: ReturnType<State3Api['updateStatus']>, userIndex = -1, rules?: Definition) {
            results = next; latestIndex = index; busyIndex = status.busy ? status.index ?? index : -1; phase = status.phase; beforeIndex = userIndex; definition = rules; retryIndex = status.retryIndex ?? -1;
            if (dialog.open && selected !== undefined) {render();}
        },
        open(index: number) {
            selected = index; standalone = undefined; check = author = false; notice.textContent = ''; render();
            if (!dialog.open) {dialog.showModal();}
        },
        show(result: Result, rules?: Definition) {
            selected = undefined; standalone = result; definition = rules; check = author = false; notice.textContent = ''; render();
            if (!dialog.open) {dialog.showModal();}
        },
        showCheck(result: Result, retry?: () => Promise<Result>, draft?: () => Promise<Draft>) {
            author = true;
            recheck = retry; checkedDraft = draft;
            selected = undefined; standalone = result; definition = undefined; check = true; notice.textContent = ''; render();
            if (!dialog.open) {dialog.showModal();}
        },
        showAuthor(result: Result, draft: () => Promise<Draft>) {
            selected = undefined; standalone = result; author = true; check = false; checkedDraft = draft; recheck = undefined;
            notice.textContent = ''; render(); if (!dialog.open) {dialog.showModal();}
        },
        clear() { results = []; selected = undefined; standalone = undefined; definition = undefined; recheck = undefined; checkedDraft = undefined; main.replaceChildren(); if (dialog.open) {dialog.close();} },
        dispose() { results = []; standalone = undefined; definition = undefined; dialog.remove(); main.replaceChildren(); },
    };
}
