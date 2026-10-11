import assert from 'node:assert/strict';
import test from 'node:test';
import { traveler } from './fixtures/expedition-traveler.js';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { setImmediate } from 'node:timers/promises';
import { parseHTML } from 'linkedom';
import { parse, compileScript } from 'vue/compiler-sfc';
import { build } from 'esbuild';
import { createCampaign } from '../apps/game/expedition/campaign/rules.ts';
import { advanceExpedition, emptyExpedition } from '../apps/game/expedition/domain.ts';
import { DIALOGUE_COPY } from '../apps/game/expedition/content/dialogue-copy.ts';
import { CAMPAIGN_COPY } from '../apps/game/expedition/content/campaign-copy.ts';
import { JOURNEY_COPY } from '../apps/game/expedition/content/journey-copy.ts';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { startWorld } from '../apps/game/expedition/world/exploration.ts';
import { applyReply } from '../apps/game/expedition/narrative/apply-reply.ts';
import { rewindReply } from '../apps/game/expedition/campaign/reply-checkpoint.ts';

// Production entry, dialogue and maps. Visual-only renderers are replaced; the composer
// supplies draft edits here and is exercised with real sizing/keyboard APIs in the browser.
// Protects the UI boundary: optional meter loading must not unmount dialogue or its composer.
test('dialogue keeps drafts and reading position; failed meters never remove the composer', async t => {
    const { window } = parseHTML('<html><body><div id="app"></div></body></html>'), previous = new Map();
    let app;
    for (const key of ['window', 'document', 'Node', 'Element', 'HTMLElement', 'SVGElement', 'getComputedStyle', 'ResizeObserver']) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { value: key === 'ResizeObserver' ? class { observe() {} unobserve() {} disconnect() {} } : key === 'window' ? window : key === 'getComputedStyle' ? () => ({ visibility: 'visible' }) : window[key], configurable: true });
    }
    window.Element.prototype.getClientRects = () => [{}];
    t.after(async () => { app?.unmount(); await setImmediate(); for (const [key, descriptor] of previous) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    } });
    const { createApp, nextTick } = await import('vue');
    const compiled = await build({ entryPoints: [fileURLToPath(new URL('../apps/game/expedition/ExpeditionRoom.vue', import.meta.url))],
        bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent', loader: { '.css': 'empty' },
        plugins: [{ name: 'dialogue-components', setup(b) {
            b.onResolve({ filter: /^vue$/ }, () => ({ path: import.meta.resolve('vue'), external: true }));
            // This DOM test does not decode images; Vite's asset-URL boundary is exercised by the build/browser checks.
            b.onResolve({ filter: /\.webp\?url&no-inline$/ }, args => ({ path: args.path, namespace: 'image-url' }));
            b.onLoad({ filter: /.*/, namespace: 'image-url' }, args => ({ contents: `export default ${JSON.stringify(args.path)};`, loader: 'js' }));
            b.onLoad({ filter: /\.vue$/ }, args => {
                if (args.path.endsWith('DialogueComposer.vue')) return { contents: `import {h} from 'vue'; export default {
                    props:['modelValue','blocked','talking','canRegenerate','retrying','conclusion'],emits:['update:modelValue','send','regenerate','continue','cancel'],
                    setup(p,{emit}){return()=>h('form',{onSubmit:e=>{e.preventDefault();emit('send')}},[
                        h('button',{type:'button','data-regenerate':'',disabled:p.blocked||!p.canRegenerate,onClick:()=>emit('regenerate')}),
                        p.conclusion ? h('button',{type:'button',disabled:p.blocked,onClick:()=>emit('continue')},p.conclusion==='fight'?${JSON.stringify(DIALOGUE_COPY.fight)}:${JSON.stringify(DIALOGUE_COPY.continue)})
                        : h('textarea',{value:p.modelValue,onInput:e=>emit('update:modelValue',e.target.value)}),
                        h('button',{type:'submit','data-send':'',disabled:p.blocked})])}}`, loader: 'js' };
                if (args.path.endsWith('ExplorationField.vue')) return { contents: `import {h} from 'vue'; export default {props:['world','paused'],emits:['interact','input','ready','pause'],setup(p,ctx){ctx.expose({focus(){}});return()=>h('div',{'data-paused':p.paused},[...['sanniang','laobai',...p.world.definition.exits.map(e=>e.id)].map(id=>h('button',{'data-interact':id,onClick:()=>ctx.emit('interact',id)})),h('button',{'data-frame':'',onClick:()=>ctx.emit('ready',p.world.definition.id)}),h('button',{'data-background':'',onClick:()=>ctx.emit('pause')}),h('button',{'data-step':'',onClick:()=>ctx.emit('input',{move:1,dash:false,skill:false})})])}}`, loader: 'js' };
                if (['ExpeditionWardrobe.vue', 'WorldFrontispiece.vue', 'ExpeditionIcon.vue', 'DialogueActor.vue'].some(name => args.path.endsWith(name))) return { contents: 'export default {render(){return null}}', loader: 'js' };
                const { descriptor } = parse(readFileSync(args.path, 'utf8'), { filename: args.path });
                return { contents: compileScript(descriptor, { id: args.path, inlineTemplate: true }).content, loader: 'ts' };
            });
        } }],
    });
    // eslint-disable-next-line no-unsanitized/method -- Compiled repository components, not external input.
    const { default: Room } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
    let fail = true, fetches = 0;
    t.mock.method(globalThis, 'fetch', async url => {
        fetches++;
        if (fail) return { ok: false, status: 503 };
        const name = String(url).split('/').at(-1);
        return { ok: true, text: async () => readFileSync(new URL(`../docs/expedition-cards/${name}`, import.meta.url), 'utf8') };
    });
    const campaign = createCampaign('fixture', 7, 'blade', 'traveler', traveler); campaign.location.position = { ...campaign.people.sanniang.position };
    campaign.people.laobai.position = { ...campaign.location.position };
    const state = { data: { ...emptyExpedition(), active: campaign }, fileRevision: 0, balance: 0, ready: true, pending: false, writeState: 'ready', conversation: null, replyFailure: null, memories: {} };
    let notify, retriedMemory, replyAction = null, beforeAct = async () => {}, beforeTalk = async () => {};
    const bridge = { subscribe(listener) { notify = listener; return () => {}; }, async request(type, payload) {
        if (type === 'game/expedition/retry-memory') { retriedMemory = payload.person; state.memories[payload.person] = { status: 'running' }; }
        if (type === 'game/expedition/act') { await beforeAct(payload); state.data = advanceExpedition(state.data, payload.command, payload.actionId, 7); }
        if (type === 'game/expedition/talk' || type === 'game/expedition/regenerate') {
            await beforeTalk(payload);
            if (payload.turnId) state.data.active = rewindReply(state.data.active, payload.person, payload.turnId);
            applyReply(state.data.active, { ...payload, regenerate: payload.turnId }, { kind: 'dialogue', reply: payload.actionId, action: replyAction, affection: 'up' });
            state.data.revision++;
        }
        return { result: structuredClone(state) };
    } };
    app = createApp(Room, { bridge, chatIdentity: 'fixture', generationActive: false });
    const root = document.getElementById('app');
    app.mount(root);
    const settle = async () => { await setImmediate(); await nextTick(); };
    const button = label => [...root.querySelectorAll('button')].find(b => b.textContent.trim() === label);
    await settle(); button(CAMPAIGN_COPY.resume + '→').click(); await settle();
    root.querySelector('[data-interact=sanniang]').click(); await settle();
    assert.ok(root.querySelector('[role=dialog]'));
    assert.equal(root.querySelector('[role=alertdialog]'), null);
    assert.ok(root.querySelector('textarea'));
    assert.equal(root.querySelector('[data-choice]'), null);

    const editDraft = text => { const input = root.querySelector('textarea'); input.value = text; input.dispatchEvent(new window.Event('input')); };
    const leave = async () => { [...root.querySelector('[role=dialog]').querySelectorAll('button')].find(b => b.textContent === CAMPAIGN_COPY.close).click(); await settle(); };
    editDraft('I will ask Sanniang about her work.'); await settle();
    const log = root.querySelector('[role=log]');
    Object.defineProperties(log, { scrollHeight: { value: 1000 }, clientHeight: { value: 300 } });
    log.scrollTop = 120; log.dispatchEvent(new window.Event('scroll'));
    await leave(); assert.equal(root.querySelector('[role=dialog]'), null);
    root.querySelector('[data-interact=laobai]').click(); await settle();
    assert.equal(root.querySelector('textarea').value, '');
    editDraft('A different question for Laobai.'); await settle(); await leave();
    root.querySelector('[data-interact=sanniang]').click(); await settle();
    assert.equal(root.querySelector('textarea').value, 'I will ask Sanniang about her work.');
    assert.equal(root.querySelector('[role=log]').scrollTop, 120);

    notify({ type: 'game/expedition/error', payload: { chatIdentity: 'fixture', code: 'expedition_agent_not_configured' } }); await settle();
    assert.ok(root.querySelector('[role=alertdialog]')); assert.equal(root.querySelector('[role=log]'), null);
    root.querySelector('[role=alertdialog] button').click(); await settle();
    assert.equal(root.querySelector('textarea').value, 'I will ask Sanniang about her work.');
    assert.equal(root.querySelector('[role=log]').scrollTop, 120);

    const requestsAfterFailure = fetches;
    for (let i = 0; i < 3; i++) await settle();
    assert.equal(fetches, requestsAfterFailure);
    root.querySelector(`[aria-label="${DIALOGUE_COPY.context}"]`).click(); await settle();
    assert.ok(root.querySelector('[role=status]'));
    fail = false; [...root.querySelectorAll('button')].find(b => b.textContent === DIALOGUE_COPY.retry).click(); await settle();
    assert.equal(root.querySelector('[role=status]'), null);
    assert.ok(root.querySelector('.ember-meter-popover dl'));
    assert.equal(root.querySelector('textarea').value, 'I will ask Sanniang about her work.');

    await t.test('background memory status stays inside its meter and explicit retry targets that character without sending dialogue', async () => {
        const history = structuredClone(state.data.active.conversations);
        state.memories.sanniang = { status: 'failed', code: 'expedition_agent_failed' };
        notify({ type: 'game/expedition/state', payload: { chatIdentity: 'fixture', state: structuredClone(state) } }); await settle();
        assert.equal(root.querySelector('[role=alertdialog],.ember-conversation-notice,.ember-dialogue-issue'), null);
        const retry = button(DIALOGUE_COPY.memoryRetry); assert.ok(retry); retry.click(); await settle();
        assert.equal(retriedMemory, 'sanniang'); assert.equal(state.memories.sanniang.status, 'running');
        assert.equal(button(DIALOGUE_COPY.memoryRetry), undefined);
        assert.deepEqual(state.data.active.conversations, history);
        assert.equal(root.querySelector('textarea').value, 'I will ask Sanniang about her work.');
        state.memories = {}; notify({ type: 'game/expedition/state', payload: { chatIdentity: 'fixture', state: structuredClone(state) } }); await settle();
    });

    await t.test('sending moves text into the log immediately; replacement never duplicates the player turn or erases the next draft', async () => {
        let release;
        beforeTalk = () => new Promise(resolve => { release = resolve; });
        editDraft('one sent message'); await settle();
        root.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true })); await settle();
        assert.equal(root.querySelector('textarea').value, '');
        assert.equal(root.querySelectorAll('.ember-player-line').length, 1);
        assert.equal(root.querySelector('.ember-player-line').getAttribute('aria-busy'), 'true');
        editDraft('next draft'); await settle(); release(); await settle();
        assert.equal(root.querySelector('textarea').value, 'next draft');
        assert.equal(root.querySelectorAll('.ember-player-line').length, 1);
        const original = state.data.active.conversations.sanniang.at(-1).id;
        root.querySelector('[data-regenerate]').click(); await settle();
        assert.equal(state.data.active.conversations.sanniang.at(-1).id, original);
        assert.equal(root.querySelectorAll('.ember-player-line').length, 1);
        release(); await settle();
        assert.notEqual(state.data.active.conversations.sanniang.at(-1).id, original);
        assert.equal(root.querySelectorAll('.ember-player-line').length, 1);
        assert.equal(root.querySelector('textarea').value, 'next draft');
        beforeTalk = async () => { throw Object.assign(new Error('fixture'), { code: 'expedition_agent_failed' }); };
        root.querySelector('[data-regenerate]').click(); await settle();
        assert.ok(root.querySelector('[role=alertdialog]')); root.querySelector('[role=alertdialog] button').click(); await settle();
        assert.equal(root.querySelector('textarea').value, 'next draft');
        assert.equal(root.querySelectorAll('.ember-player-line').length, 1);
        beforeTalk = async () => {};
    });

    await t.test('speech styling preserves reply text and treats model markup as text, not HTML', async () => {
        const turn = state.data.active.conversations.sanniang.at(-1), original = turn.reply;
        const speech = ['「先坐。<img src=x onerror=alert(1)>」', '“别急。”', '"茶还热着。"', '『嗯。』'];
        turn.reply = `我放下药碗。\n${speech.join('\n')}\n<script>alert(1)</script>`;
        state.data.revision++;
        notify({ type: 'game/expedition/state', payload: { chatIdentity: 'fixture', state: structuredClone(state) } }); await settle();
        const line = [...root.querySelectorAll('.ember-npc-line')].at(-1);
        assert.equal(line.textContent, turn.reply);
        assert.deepEqual([...line.querySelectorAll('.ember-spoken')].map(el => el.textContent), speech);
        assert.equal(line.querySelector('img,script'), null);
        turn.reply = original; state.data.revision++;
        notify({ type: 'game/expedition/state', payload: { chatIdentity: 'fixture', state: structuredClone(state) } }); await settle();
        assert.equal([...root.querySelectorAll('.ember-npc-line')].at(-1).textContent, original);
        assert.equal([...root.querySelectorAll('.ember-npc-line')].at(-1).querySelector('.ember-spoken'), null);
    });

    await t.test('complete dialogue diagnostics do not interrupt reading or follow the player out of chat; actionable failures stay visible', async () => {
        const before = structuredClone(state.data.active);
        for (const issue of ['metadata_invalid', 'performance_rejected', 'action_rejected', 'reply_invalid', 'reply_incomplete']) {
            state.data.active = structuredClone(before);
            const turn = state.data.active.conversations.sanniang.at(-1);
            turn.issue = issue;
            turn.kind = issue.startsWith('reply_') ? 'receipt' : 'dialogue';
            const quiet = issue === 'metadata_invalid' || issue === 'performance_rejected';
            state.data.revision++;
            notify({ type: 'game/expedition/state', payload: { chatIdentity: 'fixture', state: structuredClone(state) } }); await settle();
            assert.equal(root.querySelectorAll('.ember-dialogue-issue').length, quiet ? 0 : 1);
            assert.ok(root.querySelector('[role=log]').textContent.includes(turn.reply));
            assert.equal(root.querySelector('[role=alertdialog]'), null);
            await leave();
            assert.equal(root.querySelector('.ember-conversation-notice'), null);
            root.querySelector('[data-interact=sanniang]').click(); await settle();
            assert.equal(root.querySelectorAll('.ember-dialogue-issue').length, quiet ? 0 : 1);
        }
        state.data.active = before; state.data.revision++;
        notify({ type: 'game/expedition/state', payload: { chatIdentity: 'fixture', state: structuredClone(state) } }); await settle();
    });

    await t.test('action feedback belongs to the committed reply, survives reopening and follows successful regeneration only', async () => {
        const baseline = structuredClone(state.data);
        const outcomes = () => [...root.querySelectorAll('.ember-action-feedback')].map(el => [el.dataset.action, el.dataset.phase]);
        let release;
        beforeTalk = () => new Promise(resolve => { release = resolve; });
        replyAction = 'briefing';
        editDraft('accept rescue'); await settle();
        root.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true })); await settle();
        assert.deepEqual(outcomes(), []);
        release(); await settle();
        assert.equal(state.data.active.facts.includes('briefed'), true);
        assert.deepEqual(outcomes(), [['briefing', 'applied']]);
        assert.equal(root.querySelectorAll('[role=dialog]').length, 1);
        assert.equal(root.querySelector('[role=alertdialog]'), null);
        assert.ok(root.querySelector('.ember-action-feedback').previousElementSibling.matches('.ember-npc-bubble'));

        replyAction = 'go:clinic_back';
        root.querySelector('[data-regenerate]').click(); await settle();
        assert.deepEqual(outcomes(), [['briefing', 'applied']]);
        release(); await settle();
        assert.equal(state.data.active.facts.includes('briefed'), false);
        assert.equal(state.data.active.people.sanniang.destination, 'clinic_back');
        assert.deepEqual(outcomes(), [['go:clinic_back', 'pending']]);
        beforeTalk = async () => { throw Object.assign(new Error('fixture'), { code: 'expedition_agent_failed' }); };
        root.querySelector('[data-regenerate]').click(); await settle();
        root.querySelector('[role=alertdialog] button').click(); await settle();
        assert.deepEqual(outcomes(), [['go:clinic_back', 'pending']]);

        beforeTalk = async () => {}; replyAction = null;
        root.querySelector('[data-regenerate]').click(); await settle();
        assert.deepEqual(outcomes(), []);
        assert.equal(state.data.active.people.sanniang.mode, baseline.active.people.sanniang.mode);
        replyAction = 'follow';
        root.querySelector('[data-regenerate]').click(); await settle();
        assert.deepEqual(outcomes(), [['follow', 'pending']]);
        replyAction = null;
        editDraft('continue ordinary conversation'); await settle();
        root.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true })); await settle();
        assert.deepEqual(outcomes(), [['follow', 'pending']]);
        assert.ok(root.querySelector('textarea'));
        assert.equal(root.querySelectorAll('[role=dialog]').length, 1);
        await leave();
        root.querySelector('[data-interact=laobai]').click(); await settle();
        assert.deepEqual(outcomes(), []); await leave();
        root.querySelector('[data-interact=sanniang]').click(); await settle();
        assert.deepEqual(outcomes(), [['follow', 'pending']]);
        const confirmed = structuredClone(state.data);
        app.unmount(); app = createApp(Room, { bridge, chatIdentity: 'fixture', generationActive: false }); app.mount(root); await settle();
        button(CAMPAIGN_COPY.resume + '→').click(); await settle();
        root.querySelector('[data-interact=sanniang]').click(); await settle();
        assert.deepEqual(outcomes(), [['follow', 'pending']]);
        assert.deepEqual(state.data, confirmed);
        replyAction = 'stay'; editDraft('wait here instead'); await settle();
        root.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true })); await settle();
        assert.deepEqual(outcomes(), [['follow', 'applied'], ['stay', 'applied']]);
        assert.equal(state.data.active.people.sanniang.mode, 'idle');
        assert.ok(root.querySelector('textarea'));
        replyAction = null;
        state.data = { ...baseline, revision: state.data.revision + 1 };
        notify({ type: 'game/expedition/state', payload: { chatIdentity: 'fixture', state: structuredClone(state) } }); await settle();
    });

    await t.test('a slow save cannot flash the old panel or reopen one that was closed', async () => {
        await leave();
        root.querySelector(`[aria-label="${CAMPAIGN_COPY.journal}"]`).click(); await settle(); await leave();
        let release;
        beforeAct = () => new Promise(resolve => { release = resolve; });
        root.querySelector('[data-step]').click();
        root.querySelector(`[aria-label="${CAMPAIGN_COPY.map}"]`).click(); await settle();
        assert.equal(root.querySelector('[role=dialog]').getAttribute('aria-label'), CAMPAIGN_COPY.map);
        assert.equal(typeof release, 'function');
        await leave(); assert.equal(root.querySelector('[role=dialog]'), null);
        release(); await settle(); assert.equal(root.querySelector('[role=dialog]'), null);
        beforeAct = async () => {};
    });

    await t.test('travel waits for saving and the first rendered frame without a pause menu, double travel or manual resume', async () => {
        const baseline = structuredClone(state.data);
        state.data.active.location.position = { ...COURTYARD.camp.anchors.clinic_front }; state.data.revision++;
        notify({ type: 'game/expedition/state', payload: { chatIdentity: 'fixture', state: structuredClone(state) } }); await settle();
        let release, calls = 0;
        beforeAct = () => { calls++; return new Promise(resolve => { release = resolve; }); };
        root.querySelector('[data-interact=clinic_front]').click(); await settle();
        assert.ok(root.querySelector('.ember-transition')); assert.equal(root.querySelector('[role=dialog]'), null);
        assert.equal(root.querySelector('[data-paused]').getAttribute('data-paused'), 'true');
        root.querySelector('[data-interact=clinic_front]').click(); await settle(); assert.equal(calls, 1);
        release(); await settle(); assert.equal(state.data.active.location.scene, 'clinic_front');
        assert.ok(root.querySelector('.ember-transition')); assert.equal(root.querySelector('[role=dialog]'), null);
        root.querySelector('[data-frame]').click(); await settle();
        assert.equal(root.querySelector('.ember-transition'), null); assert.equal(root.querySelector('[role=dialog]'), null);
        assert.equal(root.querySelector('[data-paused]').getAttribute('data-paused'), 'false');

        // A real background pause during the transaction is not erased by the completion callback.
        root.querySelector('[data-interact=south]').click(); await settle();
        root.querySelector('[data-background]').click(); await settle();
        release(); await settle(); root.querySelector('[data-frame]').click(); await settle();
        assert.equal(root.querySelector('[role=dialog]').getAttribute('aria-label'), CAMPAIGN_COPY.pause);
        assert.equal(root.querySelector('[data-paused]').getAttribute('data-paused'), 'true');
        await leave();
        beforeAct = async () => { throw Object.assign(new Error('save'), { code: 'expedition_save_failed' }); };
        root.querySelector('[data-interact=clinic_front]').click(); await settle();
        assert.equal(root.querySelector('.ember-transition'), null); assert.ok(root.querySelector('[role=alertdialog]'));
        assert.equal(state.data.active.location.scene, 'camp');
        beforeAct = async () => {};
        root.querySelector('[role=alertdialog] button').click(); await settle();
        assert.equal(root.querySelector('[role=alertdialog]'), null); assert.equal(state.data.active.location.scene, 'clinic_front');
        await leave();
        state.data = { ...baseline, revision: state.data.revision + 1 };
        notify({ type: 'game/expedition/state', payload: { chatIdentity: 'fixture', state: structuredClone(state) } }); await settle();
    });

    await t.test('new journey setup keeps choices while navigating, and only confirmation replaces the save', async () => {
        root.querySelector(`[aria-label="${CAMPAIGN_COPY.pause}"]`).click(); await settle();
        button(JOURNEY_COPY.title).click(); await settle();
        const priorId = state.data.active.id;
        button(JOURNEY_COPY.newJourney).click(); await settle();
        const name = root.querySelector('input[type=text], #ember-traveler-name');
        name.value = '江雪'; name.dispatchEvent(new window.Event('input'));
        const gender = root.querySelector('input[value=female]'); gender.checked = true; gender.dispatchEvent(new window.Event('change'));
        root.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true })); await settle();
        assert.equal(state.data.active.id, priorId);
        root.querySelector('.entry-sheet').scrollTop = 90;
        root.querySelector('.entry-chapter').click(); await settle();
        assert.equal(root.querySelector('.entry-sheet').scrollTop, 0);
        root.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true })); await settle();
        assert.equal(state.data.active.id, priorId);
        const checkbox = root.querySelector('input[type=checkbox]'); checkbox.checked = true; checkbox.dispatchEvent(new window.Event('change'));
        root.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true })); await settle();
        assert.notEqual(state.data.active.id, priorId);
        assert.deepEqual(state.data.active.traveler, { name: '江雪', gender: 'female' });
        assert.ok(root.querySelector('[role=dialog]'));
    });

    for (const decision of ['pass', 'attack']) await t.test(`continuing a saved ${decision} keeps the guard's last words pending`, async () => {
        app.unmount();
        const c = createCampaign('parley', 7, 'blade', 'traveler', traveler);
        c.location = startWorld(COURTYARD.gate, 'parley');
        c.pendingParley = { enemy: 'bajin', decision };
        c.conversations.bajin.push({ id: 'last', kind: 'dialogue', player: 'question', reply: 'last words', action: decision, facts: [], scene: 'gate' });
        state.data = { ...emptyExpedition(), active: c };
        app = createApp(Room, { bridge, chatIdentity: 'fixture', generationActive: false }); app.mount(root); await settle();
        button(CAMPAIGN_COPY.resume + '→').click(); await settle();
        assert.deepEqual(state.data.active.pendingParley, { enemy: 'bajin', decision });
        assert.ok(root.querySelector('[role=log]'));
        assert.equal(root.querySelector('.ember-action-feedback').dataset.action, decision);
        assert.equal(root.querySelector('.ember-action-feedback').dataset.phase, 'pending');
        assert.equal(root.querySelector('textarea'), null);
        assert.equal(!!button(CAMPAIGN_COPY.close), decision === 'pass');
        assert.equal(!!button(DIALOGUE_COPY.fight), decision === 'attack');
    });

    await t.test('first-time identity has no selected gender and incomplete setup cannot create a save', async () => {
        app.unmount(); state.data = emptyExpedition();
        app = createApp(Room, { bridge, chatIdentity: 'fixture', generationActive: false }); app.mount(root); await settle();
        button(JOURNEY_COPY.begin + '→').click(); await settle();
        assert.equal([...root.querySelectorAll('input[type=radio]')].some(input => input.checked), false);
        const name = root.querySelector('#ember-traveler-name'); name.value = '江雪'; name.dispatchEvent(new window.Event('input'));
        root.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true })); await settle();
        assert.ok(root.querySelector('#ember-traveler-name')); assert.equal(state.data.active, null);
    });
});
