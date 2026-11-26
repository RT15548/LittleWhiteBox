import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { parseHTML } from 'linkedom';
import ts from 'typescript';
import { COPY } from '../ui/copy.js';
import { element, resultLabel, resultStage } from '../ui/result.js';
import { createResultDialog } from '../ui/result-dialog.js';
import type { State3Api } from '../runtime/api.js';
import type { createState3Page } from '../ui/settings.js';
import type { Result, Success } from '../types.js';
import { createAuthorExtensions } from '../ui/author-extensions.js';
import { EXTENSION_COPY as EC } from '../extensions/copy.js';
import { DEFINITION_FILE } from '../definition/format.js';
import type { Draft } from '../definition/authoring.js';

function createPage(api: State3Api, document: Document, tasks: Promise<unknown>[], confirm: () => boolean, syncs: number[] = []) {
    const source = ts.transpileModule(readFileSync(new URL('../ui/settings.ts', import.meta.url), 'utf8'), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '').replaceAll('import.meta.url', "'controls-test'");
    const create = runInNewContext(source + '\ncreateState3Page', { document, AbortController, COPY, element, resultLabel, resultStage, confirm, createAuthorExtensions, EC, DEFINITION_FILE,
        errorText: String, notifyInfo() {},
        createResultDialog: (target: State3Api) => {
            const view = createResultDialog(target);
            return { ...view, sync(...args: Parameters<typeof view.sync>) { syncs.push(args[1]); view.sync(...args); } };
        }, styleText: '', controlsCss: '', observeBackgroundTask: (task: Promise<unknown>) => tasks.push(task),
    }) as typeof createState3Page;
    return create(api);
}

// U3: no saved result must not strand the latest player turn after reload/cancel;
// recovery targets only that turn and does not purchase an update by merely opening UI (cost / dead end).
test('U3: unsettled latest USER has direct settle/skip controls, UI cleanup does not cancel model work', async t => {
    const { document } = parseHTML('<html><head></head><body>' + [0, 1, 2, 3].map(index => `<div class="mes" mesid="${index}"><div class="mes_text"></div></div>`).join('') + '</body></html>');
    const previous = globalThis.document; globalThis.document = document; t.after(() => {globalThis.document = previous;});
    const settled: number[] = [], skipped: number[] = [], tasks: Promise<unknown>[] = [];
    let cancelled = 0;
    const api = { updateStatus: () => ({ busy: false, phase: 'ready' }),
        recomputeBefore: async (index: number) => {settled.push(index);}, skipBefore: async (index: number) => {skipped.push(index);},
        cancel: () => {cancelled++;},
    } as unknown as State3Api;
    const page = createPage(api, document, tasks, () => { throw new Error('First settlement must not ask for rollback confirmation'); });
    t.after(() => page.dispose());
    for (const updates of [['before'], ['before', 'after']] as ('before' | 'after')[][]) {
        page.mountControl(2, [], { updates, beforeIndex: 3, lastReceiptIndex: -1 });
        const group = document.querySelector('.lwb-state3-controls[data-floor="3"]'); assert.ok(group);
        const click = (label: string) => {const button = [...group.querySelectorAll('button')].find(node => node.textContent === label); assert.ok(button); button.click();};
        click(COPY.settle); await Promise.all(tasks.splice(0));
        click(COPY.skipBefore); await Promise.all(tasks.splice(0));
        assert.equal(document.querySelector('.lwb-state3-controls[data-floor="1"]'), null);
    }
    assert.deepEqual(settled, [3, 3]); assert.deepEqual(skipped, [3, 3]);
    page.mountControl(2, [], { updates: ['after'], beforeIndex: -1, lastReceiptIndex: -1 });
    assert.equal(document.querySelector('.lwb-state3-controls[data-floor="3"]'), null);
    page.mountControl(2, [], { updates: ['before'], beforeIndex: -1, lastReceiptIndex: -1 });
    assert.equal(document.querySelector('.lwb-state3-controls'), null);
    page.targetChanged(); assert.equal(cancelled, 0);
});

// Opening receipts initialize state; they are not a prior model settlement.
test('opening-only controls retain initialization identity and only allow an enabled manual after update', async t => {
    const { document } = parseHTML('<html><head></head><body><div class="mes" mesid="0"><div class="mes_text"></div></div></body></html>');
    const previous = globalThis.document; globalThis.document = document; t.after(() => { globalThis.document = previous; });
    const tasks: Promise<unknown>[] = [];
    let updates = 0;
    const api = { updateStatus: () => ({ busy: false, phase: 'ready' }), cancel() {}, update: async () => { updates++; } } as unknown as State3Api;
    const page = createPage(api, document, tasks, () => { throw new Error('Initialization must not require undoing a model settlement'); });
    t.after(() => page.dispose());
    const initialized: Success = { ok: true, committed: true, saved: true, state: { count: 0 }, changes: [], actions: [], provenance: [], diagnostics: [],
        receipt: { id: 'opening', revision: 1, source: 'opening', delta: null, actions: [] } };
    const entries = [{ index: 0, result: initialized, stage: 'after' as const }];
    page.mountControl(0, entries, { updates: ['after'], beforeIndex: -1, lastReceiptIndex: -1 });
    let group = document.querySelector<HTMLElement>('.lwb-state3-controls')!;
    assert.equal(group.dataset.stage, 'opening');
    assert.equal(group.querySelectorAll('button').length, 3);
    assert.equal(updates, 0);
    group.querySelector('button')!.click(); await Promise.all(tasks.splice(0));
    assert.equal(updates, 1);
    page.mountControl(0, entries, { updates: ['before'], beforeIndex: -1, lastReceiptIndex: -1 });
    group = document.querySelector<HTMLElement>('.lwb-state3-controls')!;
    assert.equal(group.dataset.stage, 'opening');
    assert.equal(group.querySelectorAll('button').length, 2);
    const dialog = document.querySelector<HTMLDialogElement>('.lwb-state3-result-dialog')!;
    dialog.showModal = () => { dialog.open = true; };
    group.querySelector('button')!.click(); await Promise.all(tasks.splice(0));
    assert.equal(dialog.open, true);
    assert.equal(dialog.querySelector('main')!.dataset.stage, 'opening');
    assert.equal(updates, 1);
});

// Authoring failure must hand over exactly what was checked, preserving conflicts
// and allowing help while source is invalid (lost work / repairing the wrong code).
test('invalid draft can be checked and handed to assistant without dropping edits', async t => {
    const { document } = parseHTML('<html><head></head><body></body></html>');
    const previous=globalThis.document; globalThis.document=document; t.after(()=>{globalThis.document=previous;});
    const proto=document.createElement('dialog');
    Object.getPrototypeOf(proto).showModal=function(){this.open=true;};
    Object.getPrototypeOf(proto).close=function(){this.open=false;};
    const path='local/cards/draft.png/'+DEFINITION_FILE;
    let stored: Draft={root:'local/cards/draft.png/',avatar:'draft.png',name:'Draft',files:[{path,content:'{}'}]};
    const tasks:Promise<unknown>[]=[], checked:string[]=[], handed:string[]=[];
    let saved=0;
    const api={openDraft:async()=>structuredClone(stored),cancel(){},lastResult:()=>undefined,
        saveDraft:async(_draft:Draft,files:Draft['files'])=>{saved++; stored={...stored,files:structuredClone(files)};return structuredClone(stored);},
        checkDraft:async(draft:Draft)=>{checked.push(draft.files[0].content);return {ok:false,diagnostics:[{code:'definition-schema'}]} as Result;},
        openAssistant:async()=>{handed.push(stored.files[0].content);},
    } as unknown as State3Api;
    const page=createPage(api,document,tasks,()=>true); t.after(()=>page.dispose());
    await page.open('author');
    const editor=document.querySelector<HTMLTextAreaElement>('textarea')!;
    editor.value='{broken current draft'; editor.dispatchEvent(new document.defaultView!.Event('input'));
    const click=async(root:Element,label:string)=>{const button=[...root.querySelectorAll('button')].find(node=>node.textContent===label)!;assert.ok(button);button.click();await Promise.all(tasks.splice(0));};
    await click(document.querySelector('.lwb-state3-dialog:not(.lwb-state3-result-dialog)')!,COPY.check);
    assert.deepEqual(checked,['{broken current draft']);
    await click(document.querySelector('.lwb-state3-result-dialog')!,EC.repair);
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(saved,1); assert.deepEqual(handed,checked);
});

// Historical receipts and busy indices never create controls; retained buttons must
// recheck current USER/AI boundaries, and an existing result requires rollback consent.
test('only latest USER/AI controls remain and recomputation requires current rollback consent', async t => {
    const { document } = parseHTML('<html><head></head><body>' + [0, 1, 2, 3, 4, 5].map(index => `<div class="mes" mesid="${index}"><div class="mes_text"></div></div>`).join('') + '</body></html>');
    const previous = globalThis.document; globalThis.document = document; t.after(() => {globalThis.document = previous;});
    const settled: number[] = [], tasks: Promise<unknown>[] = [], syncs: number[] = [];
    let updated = 0, confirmations = 0, accepted = false;
    let status = { busy: false, phase: 'ready', index: 0 } as ReturnType<State3Api['updateStatus']>;
    const api = { updateStatus: () => status, cancel() {},
        recomputeBefore: async (index: number) => { settled.push(index); }, update: async () => { updated++; },
    } as unknown as State3Api;
    const page = createPage(api, document, tasks, () => { confirmations++; return accepted; }, syncs);
    t.after(() => page.dispose());
    const result: Success = { ok: true, committed: true, saved: true, state: {}, changes: [], actions: [], provenance: [], diagnostics: [],
        receipt: { id: 'settled', revision: 1, source: 'model', delta: null, actions: [], beforeUpdate: { inputDigest: 'user', outcome: 'applied', diagnostics: [] } } };
    const entries = [0, 1, 2, 3].map(index => ({ index, stage: index % 2 ? 'after' as const : 'before' as const, result, edited: index === 2 }));
    const mount = (ai: number, user: number) => page.mountControl(ai, entries, { updates: ['before', 'after'], beforeIndex: user, lastReceiptIndex: 3 });
    const find = (floor: number, label: string) => [...document.querySelectorAll<HTMLButtonElement>(`.lwb-state3-controls[data-floor="${floor}"] button`)].find(node => node.textContent === label);
    const click = async (node: HTMLButtonElement | undefined) => { assert.ok(node); node.click(); await Promise.all(tasks.splice(0)); };
    mount(3, 2);
    assert.deepEqual([...document.querySelectorAll<HTMLElement>('.lwb-state3-controls')].map(node => Number(node.dataset.floor)).sort(), [2, 3]);
    assert.equal(updated, 0); assert.deepEqual(settled, []);
    await click(find(2, COPY.recompute)); await click(find(3, COPY.recompute));
    assert.equal(confirmations, 2); assert.equal(updated, 0); assert.deepEqual(settled, []);
    accepted = true;
    await click(find(2, COPY.recompute)); await click(find(3, COPY.recompute));
    assert.equal(updated, 1); assert.deepEqual(settled, [2]);
    const oldBefore = find(2, COPY.recompute), oldAfter = find(3, COPY.recompute), oldResult = find(3, COPY.result);
    status = { ...status, busy: true, phase: 'requesting', index: 0 };
    mount(5, 4);
    assert.equal(syncs.at(-1), 5);
    assert.deepEqual([...document.querySelectorAll<HTMLElement>('.lwb-state3-controls')].map(node => Number(node.dataset.floor)).sort(), [4, 5]);
    await click(oldBefore); await click(oldAfter); await click(oldResult);
    assert.equal(confirmations, 4); assert.equal(updated, 1); assert.deepEqual(settled, [2]);
    assert.equal(document.querySelector('.lwb-state3-result-dialog')!.hasAttribute('open'), false);
    // No selected receipt is visible, but an alternative AI reply has old effects.
    status = { ...status, busy: false, phase: 'ready' }; accepted = false;
    page.mountControl(5, [], { updates: ['before', 'after'], beforeIndex: 4, lastReceiptIndex: 5 });
    await click(find(4, COPY.settle));
    assert.equal(confirmations, 5); assert.deepEqual(settled, [2]);
    accepted = true; await click(find(4, COPY.settle));
    assert.deepEqual(settled, [2, 4]);
});
