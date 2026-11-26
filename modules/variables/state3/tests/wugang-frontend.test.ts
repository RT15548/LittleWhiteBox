import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import { runInNewContext } from 'node:vm';
import { parseHTML } from 'linkedom';
import { parseItemDocument } from '../../../card-workspace/item-document.js';

type Exhibit = { id: string; name: string; source: string; custodian: string; authenticity: string; contamination: string; legalChain: boolean; sealed: boolean; destroyed: boolean; inspected: boolean; tested: string; testLabel: string };
type Docket = {
    clock: { minute: number; limit: number };
    exhibits: Record<string, Exhibit>;
    people: Record<string, { name: string; role: string; trust: number; testified: boolean }>;
    claims: Record<string, { id: string; speaker: string; topic: string; stance: string; text: string }>;
    leads: Record<string, { id: string; title: string; opened: boolean }>;
    verdict: { status: string; label: string; accused: string | null; evidenceUsed: string[]; reason: string };
};
const example = new URL('../skill/references/examples/wugang/', import.meta.url);
const item = parseItemDocument('regex', readFileSync(new URL('regex/雾港：最新一楼卷宗.md', example), 'utf8'));
const initial = () => structuredClone((JSON.parse(readFileSync(new URL('variables/definition.json', example), 'utf8')) as { initial: { docket: Docket } }).initial.docket);

// Execute the published replacement, not a separately copied frontend implementation.
// Only native context, local-variable reads and iframe lifecycle are simulated.
function panel(start: unknown = initial()) {
    const { document } = parseHTML(item.body.trim().replace(/^```html\r?\n|\r?\n```$/g, ''));
    const lifecycle = new EventEmitter(), timers = new Map<number, () => void>();
    const controls = { chatId: 'wugang-a', root: start, readError: '', available: true };
    const calls = { contexts: 0, reads: 0, submissions: 0, writes: 0, saves: 0, sends: 0 };
    const forbidden = (kind: 'submissions' | 'writes' | 'saves' | 'sends') => () => { calls[kind]++; throw new Error('Readonly violation: ' + kind); };
    const host = {
        SillyTavern: { getContext() {
            calls.contexts++;
            // A fresh context object on every read catches stale-context caching.
            return { chatId: controls.chatId, variables: { local: {
                get(root: string) {
                    calls.reads++;
                    assert.equal(root, 'docket');
                    if (controls.readError) { throw new Error(controls.readError); }
                    if (typeof controls.root === 'string' || controls.root === undefined || controls.root === null) { return controls.root; }
                    return JSON.stringify(controls.root);
                },
                set: forbidden('writes'), delete: forbidden('writes'),
            } }, generate: forbidden('sends') };
        } },
        LWB_StateV3: { apply: forbidden('submissions'), preview: forbidden('submissions'), enable: forbidden('writes'), retrySave: forbidden('saves') },
        document: { querySelector: forbidden('sends') },
        STscript: forbidden('sends'),
    };
    const frame = {
        get parent() { return controls.available ? host : undefined; },
        setInterval(callback: () => void, delay: number) { assert.ok(delay > 0); timers.set(1, callback); return 1; },
        clearInterval(id: number) { timers.delete(id); },
        addEventListener(event: string, callback: () => void) { lifecycle.once(event, callback); },
        removeEventListener(event: string, callback: () => void) { lifecycle.removeListener(event, callback); },
    };
    const scripts = [...document.querySelectorAll('script')];
    assert.equal(scripts.length, 1);
    for (const script of scripts) { runInNewContext(script.textContent!, { document, window: frame }); }
    const element = (selector: string) => {
        const node = document.querySelector(selector);
        assert.ok(node, selector);
        return node as HTMLElement;
    };
    return { document, controls, calls, element, timers, lifecycle,
        tick: () => timers.get(1)?.(), close: () => lifecycle.emit('pagehide'),
        current: () => element('#current'), error: () => element('#error'),
    };
}
function assertReadonly(p: ReturnType<typeof panel>) {
    assert.equal(p.document.querySelectorAll('button, input, select, textarea, form, [contenteditable], [role="button"], a[href]').length, 0);
    assert.deepEqual({ submissions: p.calls.submissions, writes: p.calls.writes, saves: p.calls.saves, sends: p.calls.sends }, { submissions: 0, writes: 0, saves: 0, sends: 0 });
}

test('Wugang display item appends to latest assistant prose only, with current CardFiles metadata', () => {
    // These settings are the external regex item protocol, not implementation snapshots.
    assert.deepEqual(item.settings.placement, [2]);
    assert.equal(item.settings.markdownOnly, true);
    assert.equal(item.settings.promptOnly, false);
    assert.equal(item.settings.disabled, false);
    assert.equal(item.settings.runOnEdit, true);
    assert.equal(item.settings.maxDepth, 0);
    assert.equal(item.settings.minDepth, null);
    const match = /^\/(.*)\/([a-z]*)$/.exec(item.settings.findRegex);
    assert.ok(match);
    const prose = '调查官放下舱单。\n\n「请继续。」';
    const output = prose.replace(new RegExp(match[1], match[2]), item.body);
    assert.equal(output.slice(0, prose.length), prose, 'the dossier must not consume story prose or require a model marker');
    const { document } = parseHTML(output);
    assert.equal(document.querySelectorAll('main').length, 1);
});

test('mount, refresh and incidental interaction never submit, send, initialize or save', t => {
    const p = panel();
    t.after(p.close);
    assert.equal(p.error().hidden, true);
    assert.equal(p.current().querySelectorAll('[data-exhibit]').length, 5);
    assert.equal(p.current().querySelectorAll('[data-person]').length, 5);
    assert.equal(p.element('[data-exhibit="EX-01"]').dataset.collected, 'false');
    assert.deepEqual(p.element('.clock strong').textContent!.match(/\d+/g)!.map(Number), [initial().clock.minute, initial().clock.limit]);
    assert.equal(p.current().querySelectorAll('[data-lead], [data-claim]').length, 0);
    assertReadonly(p);
    const unchanged = p.current().textContent;
    p.tick();
    assert.equal(p.current().textContent, unchanged);
    p.current().click();
    p.current().dispatchEvent(new p.document.defaultView!.Event('keydown'));
    p.tick();
    assertReadonly(p);
});

test('native JSON refresh renders current trust thresholds, lead titles and full testimony safely', t => {
    const p = panel();
    t.after(p.close);
    const d = initial();
    d.clock.minute = 425;
    d.people.suspect_a.trust = 6;
    d.people.suspect_b.trust = 4;
    d.people.suspect_c.trust = 3;
    d.people.witness.name = '<img src=x onerror=alert(1)>';
    d.people.witness.role = '临时证人';
    d.people.witness.testified = true;
    d.exhibits['EX-01'].custodian = 'witness';
    d.exhibits['EX-01'].inspected = true;
    d.exhibits['EX-01'].tested = 'match';
    d.exhibits['EX-01'].testLabel = '与签押样本吻合 <script>bad()</script>';
    d.leads['L-01'] = { id: 'L-01', title: '舱单时序 <b>矛盾</b>', opened: true };
    d.claims['C-01'] = { id: 'C-01', speaker: 'witness', topic: '归档时间', stance: 'suspect_a', text: '我听见两次钟响。\n<img src=x onerror=alert(1)>' };
    p.controls.root = d;
    p.tick();
    assert.equal(p.element('.clock').dataset.urgency, 'low');
    assert.deepEqual(p.element('.clock strong').textContent!.match(/\d+/g)!.map(Number), [d.clock.minute, d.clock.limit]);
    for (const [id, band] of [['suspect_a', 'cooperative'], ['suspect_b', 'cautious'], ['suspect_c', 'guarded']]) {
        assert.equal(p.element(`[data-person="${id}"]`).dataset.trustBand, band);
        assert.ok(p.element(`[data-person="${id}"] .trust`).textContent!.includes(String(d.people[id].trust)));
    }
    assert.equal(p.element('[data-person="witness"] h3').textContent, d.people.witness.name);
    assert.equal(p.element('[data-person="witness"] .meta').textContent, d.people.witness.role);
    assert.equal(p.element('[data-exhibit="EX-01"]').dataset.collected, 'true');
    assert.ok(p.element('[data-exhibit="EX-01"]').textContent!.includes(d.exhibits['EX-01'].testLabel));
    assert.equal(p.element('[data-lead="L-01"] span:last-child').textContent, d.leads['L-01'].title);
    assert.equal(p.current().querySelectorAll('[data-lead]').length, 1);
    assert.equal(p.element('[data-claim="C-01"] p').textContent, d.claims['C-01'].text);
    assert.equal(p.element('[data-claim="C-01"] h3').textContent, d.people.witness.name);
    assert.ok(p.element('[data-claim="C-01"]').textContent!.includes(d.claims['C-01'].topic));
    assert.ok(p.element('[data-claim="C-01"]').textContent!.includes(d.people.suspect_a.name));
    assert.equal(p.current().querySelectorAll('img, script, b').length, 0, 'state strings remain text, never markup');

    // The native store serializes the current root afresh after a state change.
    d.clock.minute = 480;
    d.people.suspect_b.trust = 6;
    d.verdict = { status: 'right_accuse', label: '证据成立', accused: 'suspect_a', evidenceUsed: ['EX-01'], reason: '签押与证言相互印证。' };
    p.tick();
    assert.equal(p.element('.clock').dataset.urgency, 'out');
    assert.equal(p.element('[data-person="suspect_b"]').dataset.trustBand, 'cooperative');
    assert.equal(p.element('[data-status]').dataset.status, d.verdict.status);
    assert.equal(p.element('[data-status] h3').textContent, d.verdict.label);
    for (const value of [d.verdict.reason, d.people.suspect_a.name, d.exhibits['EX-01'].name]) {
        assert.ok(p.element('[data-status]').textContent!.includes(value));
    }
    assertReadonly(p);
});

test('rewind/external restore removes old facts, while missing state clears and can recover the identical value', t => {
    const d = initial();
    d.claims.C1 = { id: 'C1', speaker: 'witness', topic: '晚间', stance: '', text: '只存在于旧证言' };
    d.leads['L-01'] = { id: 'L-01', title: '只存在于旧线索', opened: true };
    const p = panel(d);
    t.after(p.close);
    p.controls.root = initial();
    p.tick();
    assert.equal(p.current().querySelectorAll('[data-claim], [data-lead]').length, 0);
    const restored = p.current().textContent;
    for (const missing of ['', undefined, null]) {
        p.controls.root = missing;
        p.tick();
        assert.equal(p.error().dataset.error, 'missing-state');
        assert.equal(p.error().hidden, false);
        assert.equal(p.current().childElementCount, 0, 'no stale clock, person, evidence or verdict survives');
        p.controls.root = initial();
        p.tick();
        assert.equal(p.error().hidden, true);
        assert.equal(p.current().textContent, restored, 'recover even when restored JSON equals the previous successful read');
    }
    assertReadonly(p);
});

test('invalid JSON/root and native read errors are visible, clear stale values and recover', t => {
    const p = panel();
    t.after(p.close);
    for (const invalid of ['{', 'null', '[]', '42', '{}']) {
        p.controls.root = invalid;
        p.tick();
        assert.equal(p.error().dataset.error, 'invalid-state');
        assert.equal(p.error().hidden, false);
        assert.ok(p.error().textContent!.length > 0);
        assert.equal(p.current().childElementCount, 0);
        p.controls.root = initial();
        p.tick();
        assert.equal(p.error().hidden, true);
    }
    p.controls.readError = 'native store unavailable';
    p.tick();
    assert.equal(p.error().dataset.error, 'read-failed');
    assert.ok(p.error().textContent!.includes(p.controls.readError), 'surface the host failure, do not silently swallow it');
    assert.equal(p.current().childElementCount, 0);
    p.controls.readError = '';
    p.tick();
    assert.equal(p.error().hidden, true);
    assertReadonly(p);
});

test('host unavailability clears stale state and can recover without remounting', t => {
    const p = panel();
    t.after(p.close);
    p.controls.available = false;
    p.tick();
    assert.equal(p.error().dataset.error, 'host-unavailable');
    assert.equal(p.error().hidden, false);
    assert.equal(p.current().childElementCount, 0);
    p.controls.available = true;
    p.tick();
    assert.equal(p.error().hidden, true);
    assert.equal(p.current().querySelectorAll('[data-exhibit]').length, 5);
    assertReadonly(p);
});

test('chat change clears and retires the old iframe before reading another chat, including identical native JSON', () => {
    const p = panel();
    const retainedTick = p.timers.get(1)!;
    const reads = p.calls.reads;
    p.controls.chatId = 'wugang-b';
    p.tick();
    assert.equal(p.error().dataset.error, 'chat-changed');
    assert.equal(p.error().hidden, false);
    assert.equal(p.current().childElementCount, 0);
    assert.equal(p.calls.reads, reads, 'do not read a new chat into a retained old-floor iframe');
    assert.equal(p.timers.size, 0);
    assert.equal(p.lifecycle.listenerCount('pagehide'), 0);
    p.controls.chatId = 'wugang-a';
    retainedTick();
    assert.equal(p.calls.reads, reads, 'a disposed callback cannot resume old state');
    assertReadonly(p);
    p.close();
});

test('pagehide releases its own timer/listener and queued refreshes do nothing', () => {
    const p = panel();
    const queuedRefresh = p.timers.get(1)!;
    assert.equal(p.lifecycle.listenerCount('pagehide'), 1);
    p.close();
    assert.equal(p.timers.size, 0);
    assert.equal(p.lifecycle.listenerCount('pagehide'), 0);
    const contexts = p.calls.contexts, reads = p.calls.reads;
    p.controls.root = initial();
    queuedRefresh();
    p.close();
    assert.equal(p.calls.contexts, contexts);
    assert.equal(p.calls.reads, reads);
    assertReadonly(p);
});
