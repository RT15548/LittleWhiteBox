import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { EventEmitter } from 'node:events';
import { parseHTML } from 'linkedom';
import { parseItemDocument } from './item-document.js';
import { variableBundleFromFiles } from '../variables/state3/definition/card-files.js';
import { compileDefinition } from '../variables/state3/definition/compile.js';
import { initialize, settle } from '../variables/state3/engine/settle.js';
import { accepted } from '../variables/state3/tests/fixture.js';
import { createGuideFixture } from '../variables/state3/tests/guide-fixture.js';
import type { Json } from '../variables/state3/types.js';

// Install the published CardFiles package, not the separate state3 weekly tutorial.
// Contracts: the complete package settles a day and sends after settlement (broken play);
// admission/renewal post each charge once (lost game progress); image and viewport
// bindings follow their real floor and mount lifetime (wrong image actions or leaks).
const folder = fileURLToPath(new URL('./skill/frontend/examples/jieling/', import.meta.url));
const walk = (directory: string): string[] => readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
});
const files = walk(folder).map(path => ({ path: 'card/' + relative(folder, path).split(sep).join('/'), content: readFileSync(path, 'utf8') }));
const file = (path: string) => {
    const found = files.find(item => item.path === 'card/' + path);
    assert.ok(found, path);
    return found.content;
};
const bundle = variableBundleFromFiles('card/', files);
const task = parseItemDocument('tasks', file('tasks/[解铃会] 一体界面.md'));
const commands = task.body.replace(/^<<taskjs>>\r?\n/, '').replace(/\r?\n<<\/taskjs>>\s*$/, '');

type ClubState = {
    club: { week: number; day: number; funds: number; acted: boolean; today: { audit: string; privates: number };
        members: Record<string, { room: string; classWeek: number; status: string; nextFeeWeek: number; nextFeeDay: number }>;
        applicants: { id: string; name: string; called: boolean }[];
        cashbook: { kind: string; amount: number; who: string[] }[];
        report: null | { week: number; day: number; income: number; expense: number; classes: { held: boolean; members: string[] }[] } };
    desk: { phase: string; cat: { price: Record<string, number>; rule: Record<string, number> };
        classes: Record<string, { members: string[]; tonight: boolean; open: boolean }>; matches: unknown[] };
};
const clubState = (value: Json) => value as unknown as ClubState;

async function terminal(t: TestContext) {
    const fixture = await createGuideFixture(bundle, { authorize: async () => {}, context: () => ({}), passage: () => '' });
    accepted(fixture.host.LWB_StateV3.lastResult()!);
    const { document, window: dom } = parseHTML('<html><head></head><body><div id="chat"></div><textarea id="send_textarea"></textarea><button id="send_but" type="button"></button></body></html>');
    const previousDocument = globalThis.document;
    globalThis.document = document;
    const chat = [
        { mes: file('message/0.md'), name: bundle.definition.name },
        { mes: 'Hidden host context', is_system: true },
        { mes: '我先核对今天的面谈。', is_user: true },
        { mes: 'Hidden host metadata', is_system: true },
        { mes: '许棠把登记簿放到案头。[image:前台]', name: bundle.definition.name },
    ];
    const nativeChat = document.getElementById('chat')!;
    for (const [floor, message] of chat.entries()) {
        const node = document.createElement('div'), text = document.createElement('div');
        node.className = 'mes'; node.setAttribute('mesid', String(floor)); text.className = 'mes_text'; text.textContent = message.mes;
        node.append(text); nativeChat.append(node);
    }
    const formatted: { text: string; floor: number }[] = [], events = new EventEmitter(), windowEvents = new EventEmitter();
    const context = { ...fixture.host.SillyTavern.getContext(), chat, getCurrentChatId: () => fixture.controls.chatId,
        eventSource: events, eventTypes: { GENERATION_STARTED: 'generation-start', GENERATION_ENDED: 'generation-end', GENERATION_STOPPED: 'generation-stop' },
        messageFormatting(text: string, _name: string, _system: boolean, _user: boolean, floor: number) {
            formatted.push({ text, floor });
            const paragraph = document.createElement('p'); paragraph.textContent = text;
            return paragraph.outerHTML;
        } };
    const timeouts = new Map<number, () => void>(), intervals = new Map<number, () => void>(), frames = new Map<number, () => void>();
    let serial = 0;
    const schedule = (queue: Map<number, () => void>, callback: () => void) => { const id = ++serial; queue.set(id, callback); return id; };
    const flush = (queue: Map<number, () => void>) => {
        for (const [id, callback] of [...queue]) { if (queue.delete(id)) {callback();} }
    };
    const images: { element: HTMLElement; messageId: number; refreshes: number; destroys: number }[] = [];
    const cleanups: (() => void)[] = [];
    const viewportEvents = new EventEmitter();
    const topWindow = {
        ...fixture.host, SillyTavern: { getContext: () => context }, innerWidth: 1440, innerHeight: 860,
        setTimeout: (callback: () => void) => schedule(timeouts, callback), clearTimeout: (id: number) => timeouts.delete(id),
        setInterval: (callback: () => void) => schedule(intervals, callback), clearInterval: (id: number) => intervals.delete(id),
        requestAnimationFrame: (callback: () => void) => schedule(frames, callback), cancelAnimationFrame: (id: number) => frames.delete(id),
        matchMedia: (query: string) => ({ matches: query === '(prefers-reduced-motion: reduce)' || query === '(max-width:820px)' && topWindow.innerWidth <= 820 }),
        visualViewport: { width: 1440, height: 860, offsetLeft: 0, offsetTop: 0,
            addEventListener: (name: string, callback: () => void) => viewportEvents.on(name, callback),
            removeEventListener: (name: string, callback: () => void) => viewportEvents.off(name, callback) },
        addEventListener: (name: string, callback: () => void) => windowEvents.on(name, callback),
        removeEventListener: (name: string, callback: () => void) => windowEvents.off(name, callback),
        xiaobaixDraw: { getStatus: () => ({ ready: true }), mountMessageImages(options: { element: HTMLElement; messageId: number }) {
            const mounted = { ...options, refreshes: 0, destroys: 0 }; images.push(mounted);
            return { refresh: async () => { mounted.refreshes++; }, destroy: () => { mounted.destroys++; } };
        } },
    };
    const mount = () => runInNewContext(commands, { document, window: topWindow, Event: dom.Event, MutationObserver: dom.MutationObserver,
        onCleanup: (callback: () => void) => cleanups.push(callback) }, { filename: 'jieling-integrated-task.js' });
    const query = <T extends HTMLElement = HTMLElement>(selector: string): T => {
        const node = document.querySelector<T>(selector); assert.ok(node, selector); return node;
    };
    const state = () => clubState(fixture.state());
    const nativeInput = query<HTMLTextAreaElement>('#send_textarea');
    const dispatched: { event: string; text: string; acted: boolean }[] = [];
    nativeInput.addEventListener('input', () => dispatched.push({ event: 'input', text: nativeInput.value, acted: state().club.acted }));
    query('#send_but').addEventListener('click', () => {
        dispatched.push({ event: 'send', text: nativeInput.value, acted: state().club.acted });
        nativeInput.value = '';
    });
    const settleUi = async () => {
        // The real rule runner yields between operations; wait for this fixture's
        // completed submission rather than a wall-clock delay or a live request.
        for (let turn = 0; turn < 400 && query<HTMLButtonElement>('[data-a="send"]').disabled; turn++) {
            await new Promise<void>(resolve => setImmediate(resolve));
            if (dispatched.length || query('[data-r="toast"]').hidden === false) {break;}
        }
        assert.equal(query('[data-r="toast"]').hidden, true, 'submission must not fail behind a toast');
    };
    const nativeChanged = async () => { await new Promise<void>(resolve => setImmediate(resolve)); flush(frames); };
    const cleanup = () => cleanups.at(-1)!();
    t.after(() => { cleanup(); globalThis.document = previousDocument; });
    mount();
    return { ...fixture, document, dom, chat, context, formatted, images, query, state, dispatched, nativeInput, events, windowEvents,
        timeouts, intervals, frames, cleanups, mount, cleanup, viewportEvents,
        nativeChanged, tick: () => { for (const callback of intervals.values()) {callback();} },
        async open() { query('#jl-launcher button').click(); flush(timeouts); await nativeChanged(); },
        async send(text: string) {
            const input = query<HTMLTextAreaElement>('[data-r="input"]'); input.value = text;
            input.dispatchEvent(new dom.Event('input', { bubbles: true }));
            assert.equal(query<HTMLButtonElement>('[data-a="send"]').disabled, false);
            query('[data-a="send"]').click(); await settleUi();
        } };
}

test('integrated frontend CardFiles package compiles, initializes its desk and settles a real day', async () => {
    const compiled = compileDefinition(bundle);
    const initial = clubState(accepted(await initialize(compiled)).state);
    const members = Object.keys(initial.club.members);
    assert.ok(members.length > 0);
    assert.equal(initial.club.day, 1);
    assert.equal(initial.club.acted, false);
    const tonight = Object.values(initial.desk.classes).find(room => room.tonight && room.open);
    assert.ok(tonight);
    assert.deepEqual(tonight.members.sort(), members.filter(name => initial.club.members[name].room).sort());
    assert.ok(initial.desk.matches.length > 0);
    assert.equal(initial.desk.phase, '经营中');
    const next = clubState(accepted(await settle(compiled, initial as unknown as Json,
        [{ action: 'act', params: {} }, { action: 'closeday', params: {} }], { prepared: { panel: true, rolls: [100] } })).state);
    assert.equal(next.club.week, initial.club.week);
    assert.equal(next.club.day, initial.club.day + 1, '收工 advances a day, not the old tutorial week');
    assert.equal(next.club.acted, false);
    assert.deepEqual(next.club.today, { audit: '', privates: 0 });
    assert.ok(next.club.report);
    assert.equal(next.club.report.day, initial.club.day);
    assert.equal(next.club.report.income, tonight.members.length * initial.desk.cat.price['课费']);
    assert.equal(next.club.funds, initial.club.funds + next.club.report.income - next.club.report.expense);
    assert.deepEqual(next.club.report.classes.filter(room => room.held).flatMap(room => room.members).sort(), tonight.members.sort());
    assert.ok(tonight.members.every(name => next.club.members[name].classWeek === initial.club.week));
});

test('entry opens the integrated app, renders actual host chat and sends through native input after settlement', async t => {
    const p = await terminal(t);
    assert.equal(p.query('#jl-app').hidden, true);
    assert.equal(p.query('#jl-launcher').hidden, false);
    await p.open();
    assert.equal(p.query('#jl-app').hidden, false);
    assert.equal(p.query('#jl-launcher').hidden, true);
    assert.deepEqual([...p.document.querySelectorAll<HTMLElement>('#jl-app .flr')].map(node => Number(node.dataset.i)), [0, 2, 4]);
    for (const floor of [0, 4]) {
        assert.equal(p.query(`.flr[data-i="${floor}"] .txt p`).textContent, p.chat[floor].mes);
        assert.ok(p.formatted.some(call => call.floor === floor && call.text === p.chat[floor].mes));
    }
    assert.equal(p.query('.flr[data-i="2"] .txt').textContent, p.chat[2].mes);
    assert.equal(p.state().club.acted, false);
    const text = '先让来访者喝杯茶，我去核对档案。';
    await p.send(text);
    assert.equal(p.controls.applyCalls, 1);
    assert.equal(p.state().club.acted, true);
    assert.deepEqual(p.dispatched, [{ event: 'input', text, acted: true }, { event: 'send', text, acted: true }]);
    assert.equal(p.query<HTMLTextAreaElement>('[data-r="input"]').value, '');
    assert.equal(p.query<HTMLButtonElement>('[data-a="closer"]').disabled, false);
    assert.equal(p.nativeInput.value, '');
});

test('admission writes membership and both charges once, and renewal posts only on its due day', async () => {
    const compiled = compileDefinition(bundle);
    let state = accepted(await initialize(compiled)).state;
    const initial = clubState(state), applicant = initial.club.applicants[0];
    const perform = async (action: string, params: Record<string, Json> = {}) => {
        state = accepted(await settle(compiled, state, [{ action, params }], { prepared: { panel: true, rolls: [100] } })).state;
        return clubState(state);
    };
    const called = await perform('call', { applicant: applicant.id });
    const name = called.club.applicants.find(item => item.id === applicant.id)!.name;
    const admitted = await perform('admit', { applicant: applicant.id });
    const price = admitted.desk.cat.price;
    assert.equal(admitted.club.funds - initial.club.funds, price['入会费'] + price['会员月费']);
    assert.deepEqual(admitted.club.cashbook.map(item => ({ amount: item.amount, who: item.who })), [
        { amount: price['入会费'], who: [name] }, { amount: price['会员月费'], who: [name] },
    ]);
    assert.equal(admitted.club.members[name].nextFeeWeek, initial.club.week + admitted.desk.cat.rule['会费周期周数']);
    const duplicate = await settle(compiled, state, [{ action: 'admit', params: { applicant: applicant.id } }], { prepared: { panel: true, rolls: [100] } });
    assert.equal(duplicate.ok, false);
    assert.equal(clubState(state).club.cashbook.length, 2);

    // Start immediately before a known renewal, without simulating unrelated weeks.
    const dueState = structuredClone(clubState(state));
    for (const member of Object.values(dueState.club.members)) { member.nextFeeWeek += 10; }
    dueState.club.members[name].nextFeeWeek = dueState.club.week;
    dueState.club.members[name].nextFeeDay = dueState.club.day + 1;
    state = dueState as unknown as Json;
    const count = (value: ClubState) => value.club.cashbook.filter(item => item.kind === '会员月费' && item.who.includes(name)).length;
    const beforeDue = await perform('closeday');
    assert.equal(count(beforeDue), 1);
    await perform('act');
    const renewed = await perform('closeday');
    assert.equal(count(renewed), 2);
    await perform('act');
    assert.equal(count(await perform('closeday')), 2);
});

test('fold and cleanup retain native controls and release viewport and generation listeners', async t => {
    const p = await terminal(t);
    const nativeFloor = p.query('.mes[mesid="4"]');
    const original = p.document.createElement('button');
    let nativeClicks = 0;
    original.addEventListener('click', () => nativeClicks++);
    nativeFloor.append(original);
    await p.open();
    assert.equal(original.parentElement, nativeFloor);
    p.query('[data-a="fold"]').click();
    assert.equal(original.parentElement, nativeFloor);
    await p.open();
    p.cleanup();
    assert.equal(original.parentElement, nativeFloor);
    original.click();
    assert.equal(nativeClicks, 1);
    assert.equal(p.document.querySelector('#jl-app'), null);
    assert.equal(p.document.querySelector('#jl-launcher'), null);
    assert.equal(p.document.querySelector('#jl-style'), null);
    assert.equal(p.intervals.size, 0); assert.equal(p.frames.size, 0);
    assert.equal(p.events.listenerCount('generation-start'), 0);
    assert.equal(p.events.listenerCount('generation-end'), 0);
    assert.equal(p.events.listenerCount('generation-stop'), 0);
    assert.equal(p.windowEvents.listenerCount('resize'), 0);
    assert.equal(p.viewportEvents.listenerCount('resize'), 0);
    assert.equal(p.viewportEvents.listenerCount('scroll'), 0);
});

test('image mounts use real floor IDs, dispose on redraw/removal and cleanup, and remount without duplicates', async t => {
    const p = await terminal(t);
    await p.open();
    const active = () => p.images.filter(image => image.destroys === 0);
    assert.deepEqual(active().map(image => image.messageId), [0, 4]);
    for (const image of active()) {
        assert.equal(image.element, p.query(`.flr[data-i="${image.messageId}"] .ai .txt`));
        assert.equal(image.refreshes, 1);
    }
    const opening = active().find(image => image.messageId === 0)!, oldLast = active().find(image => image.messageId === 4)!;
    const count = p.images.length;
    p.tick(); p.tick();
    assert.equal(p.images.length, count, 'unchanged floors must not mount again');
    p.chat[4].mes += '\n她又翻开一页。[image:登记簿]'; p.tick();
    assert.equal(oldLast.destroys, 1);
    assert.equal(opening.destroys, 0, 'an unchanged floor retains its mounted images');
    const redrawn = active().find(image => image.messageId === 4)!;
    assert.notEqual(redrawn, oldLast);
    assert.deepEqual(active().map(image => image.messageId), [0, 4]);
    p.chat.splice(4, 1); p.tick();
    assert.equal(redrawn.destroys, 1);
    assert.deepEqual(active().map(image => image.messageId), [0]);
    const firstCleanup = p.cleanups[0];
    p.mount(); await p.nativeChanged();
    assert.equal(opening.destroys, 1);
    for (const id of ['jl-app', 'jl-style', 'jl-launcher']) {assert.equal(p.document.querySelectorAll('#' + id).length, 1);}
    assert.equal(p.intervals.size, 1);
    assert.equal(p.events.listenerCount('generation-start'), 1);
    assert.equal(p.windowEvents.listenerCount('resize'), 1);
    assert.deepEqual(active().map(image => image.messageId), [0]);
    firstCleanup();
    assert.ok(p.document.querySelector('#jl-app'), 'stale cleanup must not tear down a later mount');
    p.cleanup();
    assert.equal(active().length, 0);
    assert.ok(p.images.every(image => image.destroys === 1));
    assert.equal(p.intervals.size, 0); assert.equal(p.frames.size, 0); assert.equal(p.timeouts.size, 0);
    assert.equal(p.viewportEvents.listenerCount('resize'), 0);
    assert.equal(p.viewportEvents.listenerCount('scroll'), 0);
});
