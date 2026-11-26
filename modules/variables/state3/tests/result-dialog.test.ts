import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { createResultDialog } from '../ui/result-dialog.js';
import { COPY } from '../ui/copy.js';
import { EXTENSION_COPY as EC } from '../extensions/copy.js';
import type { State3Api } from '../runtime/api.js';
import type { Success } from '../types.js';
import { OPENING_SOURCE, recordResult } from '../runtime/history.js';
import { modelSource } from '../definition/stages.js';

const result = (value: number, saved = true): Success => ({ ok: true, committed: true, saved,
    state: { coins: value }, changes: [{ path: ['coins'], before: 10, after: value, removed: false }],
    actions: [], provenance: [], diagnostics: [], receipt: { id: String(value), revision: 1, source: 'model', delta: null, actions: [] } });
const ready = { busy: false, phase: 'ready' } as ReturnType<State3Api['updateStatus']>;

test('opening-only results offer no gameplay undo, while subsequent gameplay can be undone', async t => {
    const { document } = parseHTML('<html><body></body></html>');
    const previous = globalThis.document; globalThis.document = document; t.after(() => { globalThis.document = previous; });
    const view = createResultDialog({} as State3Api), dialog = document.querySelector('dialog')!;
    dialog.showModal = () => { dialog.open = true; }; t.after(() => view.dispose());
    const start = result(15); start.receipt!.source = OPENING_SOURCE;
    for (const changes of [[], start.changes]) {
        view.sync([{ index: 0, stage: 'after', result: { ...start, changes } }], 0, ready); view.open(0);
        assert.equal(dialog.querySelector('main')!.dataset.stage, 'opening');
        assert.equal(dialog.querySelectorAll('main button').length, 0);
    }
    view.sync([{ index: 0, stage: 'after', result: result(18) }], 0, ready);
    assert.equal(dialog.querySelector('main')!.dataset.stage, 'after');
    assert.equal(dialog.querySelectorAll('main button').length, 1);
});

test('reusing the dialog across projected floors never carries opening identity into gameplay or empty results', t => {
    const { document } = parseHTML('<html><body></body></html>');
    const previous = globalThis.document; globalThis.document = document; t.after(() => { globalThis.document = previous; });
    const view = createResultDialog({} as State3Api), dialog = document.querySelector('dialog')!;
    dialog.showModal = () => { dialog.open = true; }; t.after(() => view.dispose());
    const opening = { ...result(10).receipt!, source: OPENING_SOURCE };
    const gameplay = { ...opening, id: 'gameplay', revision: 2, source: modelSource('after') };
    const records = [{ entries: [opening] }, { entries: [] }, { entries: [gameplay] }];
    const projected = recordResult({ coins: 10 }, records, 2)!;
    const entries = [{ index: 0, stage: 'after' as const, result: recordResult({ coins: 10 }, records, 0)! },
        { index: 2, stage: 'after' as const, result: projected }];
    view.sync(entries, 2, ready);
    for (const index of [0, 2, 0, 2]) {
        view.open(index);
        assert.equal(dialog.querySelector('main')!.dataset.stage, index === 0 ? 'opening' : 'after');
    }
    // Empty deltas remain gameplay; a failure or pending save also cannot inherit initialization.
    for (const next of [projected, { ...projected, saved: false }, { ok: false as const, diagnostics: [{ code: 'model-request', cause: { code: 'AGENT_PROVIDER_ERROR' } }] }]) {
        view.sync([{ index: 2, stage: 'after', result: next }], 2, ready);
        assert.equal(dialog.querySelector('main')!.dataset.stage, 'after');
    }
    view.sync([], 2, ready);
    assert.equal(dialog.querySelector('main')!.dataset.stage, undefined);
    // When the same floor has both initialization and gameplay, its newest gameplay owns the result.
    records[2].entries = [];
    records[0].entries.push(gameplay);
    view.sync([{ index: 0, stage: 'after', result: recordResult({ coins: 10 }, records, 0)! }], 0, ready); view.open(0);
    assert.equal(dialog.querySelector('main')!.dataset.stage, 'after');
});

test('player failures cannot replay host code; author retesting preserves the original result', async t => {
    const {document}=parseHTML('<html><body></body></html>');
    const previous=globalThis.document; globalThis.document=document; t.after(()=>{globalThis.document=previous;});
    const settled=result(12); settled.diagnostics=[{code:'extension-after-failed',path:'variables/scripts/committed.js',message:'secret technical error'}];
    settled.extensions={calls:[{kind:'committed',name:'committed',path:'variables/scripts/committed.js',input:{},error:'secret technical error'}]};
    let runs=0;
    const api={testExtension:async()=>{runs++;return {ok:true,output:null,extensions:{calls:[]}};}} as unknown as State3Api;
    const view=createResultDialog(api), dialog=document.querySelector('dialog')!; dialog.showModal=()=>{dialog.open=true;}; t.after(()=>view.dispose());
    view.sync([{index:0,stage:'after',result:settled}],0,ready); view.open(0);
    assert.equal(dialog.querySelector('pre'),null);
    assert.equal([...dialog.querySelectorAll('button')].some(button=>([EC.retest,EC.open,EC.repair] as string[]).includes(button.textContent!)),false);
    view.showAuthor(settled,async()=>({root:'local/card/',avatar:'test.png',name:'Test',files:[]}));
    const original=dialog.querySelector('main>section')!;
    [...dialog.querySelectorAll('button')].find(button=>button.textContent===EC.retest)!.click();
    await new Promise(resolve=>setTimeout(resolve,0));
    assert.equal(runs,1); assert.equal(original.isConnected,true);
});

// U1: persistence retry never repeats settlement; old floors remain read-only,
// and closing the viewer never cancels an update (duplicate increments / invisible data loss).
test('U1: the shared result dialog retries only persistence and limits undo to the latest reply', async () => {
    const { document, Event } = parseHTML('<html><body></body></html>');
    const previous = globalThis.document, previousConfirm = globalThis.confirm;
    globalThis.document = document; globalThis.confirm = () => true;
    let retries = 0, cancelled = 0;
    const undone: number[] = [];
    const first = result(15), second = result(18, false);
    let current = second;
    const api = {
        retrySave: async () => { retries++; current = { ...current, saved: true }; view.sync([{ index: 0, result: first }, { index: 2, result: current }], 2, ready); },
        lastResult: () => current, undo: async ({ index }: { index: number }) => { undone.push(index); },
        cancel: () => { cancelled++; }, update: () => { throw new Error('Retry must not update'); },
    } as unknown as State3Api;
    const view = createResultDialog(api), dialog = document.querySelector('dialog')!;
    dialog.showModal = () => { dialog.open = true; };
    dialog.close = () => { dialog.open = false; dialog.dispatchEvent(new Event('close')); };
    const expand = () => {
        const group = dialog.querySelector('details')!;
        group.open = true; group.dispatchEvent(new Event('toggle'));
    };
    const click = async (label: string) => {
        const button = [...dialog.querySelectorAll('button')].find(node => node.textContent === label)!;
        assert.ok(button); button.click(); await new Promise(resolve => setTimeout(resolve, 0));
    };
    try {
        view.sync([{ index: 0, result: first }, { index: 2, result: second }], 2, ready);
        view.open(0); expand(); assert.match(dialog.querySelector('.lwb-state3-change')!.textContent!, /15/);
        assert.equal(dialog.querySelectorAll('main button').length, 0);
        view.open(2); await click(COPY.retrySave); assert.equal(retries, 1);
        assert.equal([...dialog.querySelectorAll('button')].some(node => node.textContent === COPY.retrySave), false);
        await click(COPY.undoReply); assert.deepEqual(undone, [2]);
        await click(COPY.close); assert.equal(cancelled, 0); assert.equal(dialog.open, false);
        assert.equal(dialog.querySelector('main')!.childElementCount, 0);
        view.open(2); view.clear(); assert.equal(dialog.open, false);
        view.sync([{ index: 2, result: result(25) }], 2, ready); view.open(2);
        expand();
        assert.match(dialog.querySelector('.lwb-state3-change')!.textContent!, /25/);
        assert.doesNotMatch(dialog.querySelector('.lwb-state3-change')!.textContent!, /18/);
    } finally { view.dispose(); globalThis.document = previous; globalThis.confirm = previousConfirm; }
});

// A retained dialog/button must not mutate a reply once a newer turn becomes current,
// including when update work belongs to an older index than the latest AI reply.
test('latest USER/AI result actions confirm rollback and reject stale dialog buttons', async t => {
    const { document } = parseHTML('<html><body></body></html>');
    const previous = globalThis.document, previousConfirm = globalThis.confirm;
    globalThis.document = document;
    t.after(() => { globalThis.document = previous; globalThis.confirm = previousConfirm; });
    const undone: number[] = [], beforeUndone: number[] = [], recomputed: number[] = [];
    let confirmations = 0, accepted = false;
    globalThis.confirm = () => { confirmations++; return accepted; };
    const api = {
        undo: async ({ index }: { index: number }) => { undone.push(index); },
        undoBefore: async (index: number) => { beforeUndone.push(index); },
        recomputeBefore: async (index: number) => { recomputed.push(index); },
    } as unknown as State3Api;
    const view = createResultDialog(api), dialog = document.querySelector('dialog')!;
    t.after(() => view.dispose());
    dialog.showModal = () => { dialog.open = true; };
    const find = (label: string) => [...dialog.querySelectorAll('button')].find(node => node.textContent === label);
    const click = async (node: HTMLButtonElement | undefined) => { assert.ok(node); node.click(); await new Promise(resolve => setTimeout(resolve, 0)); };
    const before = result(12); before.receipt!.beforeUpdate = { inputDigest: 'user', outcome: 'applied', diagnostics: [] };
    const entries = [{ index: 0, stage: 'before' as const, result: before }, { index: 1, stage: 'after' as const, result: result(15) }];
    view.sync(entries, 1, ready, 0); view.open(0);
    await click(find(COPY.recompute)); await click(find(COPY.undoReply));
    assert.equal(confirmations, 2); assert.deepEqual(recomputed, []); assert.deepEqual(beforeUndone, []);
    accepted = true;
    await click(find(COPY.recompute)); await click(find(COPY.undoReply));
    assert.deepEqual(recomputed, [0]); assert.deepEqual(beforeUndone, [0]);
    const oldBeforeUndo = find(COPY.undoReply);
    view.sync(entries, 1, ready, 2);
    assert.equal(dialog.querySelectorAll('main button').length, 0);
    await click(oldBeforeUndo); assert.deepEqual(beforeUndone, [0]);
    view.open(1); const oldAiUndo = find(COPY.undoReply);
    view.sync(entries, 3, { ...ready, busy: true, phase: 'requesting', index: 1 }, 2);
    assert.equal(dialog.querySelectorAll('main button').length, 0);
    await click(oldAiUndo); assert.deepEqual(undone, []);
    view.sync(entries, 3, ready, 2);
    assert.equal(dialog.querySelectorAll('main button').length, 0);
    const currentEntries = [...entries, { index: 3, stage: 'after' as const, result: result(19) }];
    view.sync(currentEntries, 3, { ...ready, busy: true, phase: 'requesting', index: 1 }, 2); view.open(3);
    assert.equal(find(COPY.undoReply), undefined);
    view.sync(currentEntries, 3, ready, 2);
    accepted = false;
    await click(find(COPY.undoReply)); assert.deepEqual(undone, []);
    globalThis.confirm = () => { view.sync(entries, 5, ready, 4); return true; };
    await click(find(COPY.undoReply)); assert.deepEqual(undone, []);
    assert.equal(dialog.querySelectorAll('main button').length, 0);
    view.sync([], 5, ready, 4);
    assert.equal(dialog.querySelector('.lwb-state3-change'), null);
});
