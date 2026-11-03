import assert from 'node:assert/strict';
import test from 'node:test';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { build } from 'esbuild';
import { formatStorySummaryL2Events } from '../../story-summary/prompt-events.js';
import { harness } from './helpers/messages-harness.js';
import { buildReplyPrompt } from '../apps/messages/prompt/reply-prompt.js';
import { DOMParser } from 'linkedom';

// Exercise the actual Messages -> common adapter -> Summary configuration/filter
// wiring. Only native host access and config persistence are replaced.
const compiled = await build({
    stdin: { contents: `export { createMessagesContext } from './modules/xiaobai-os/apps/messages/host/context-adapter.ts';
        export { createPromptContextAdapter } from './modules/xiaobai-os/host/prompt-context/adapter.ts';
        export { getSummaryPanelConfig, saveSummaryPanelConfig } from './modules/story-summary/data/config.js';
        export { host } from 'context-test-host';`, resolveDir: process.cwd() },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    plugins: [{ name: 'native-context-fixture', setup(builder) {
        builder.onResolve({ filter: /(?:^context-test-host$|\/(?:extensions|world-info|story-summary|debug-core|server-storage)\.js$)/ },
            () => ({ path: 'host', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `
            export const host = { context: null, eventReads: [], readEvents: () => '' };
            export const getContext = () => host.context;
            export const extension_settings = {};
            export const getWorldInfoSettings = () => ({ world_info_include_names: false });
            export const getStorySummaryCharacters = () => [];
            export const getStorySummaryL2EventText = options => { host.eventReads.push(options); return host.readEvents(options); };
            export const xbLog = { error() {} };
            export const CommonSettingStorage = { set: async () => {}, get: async () => null };
        ` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Repository code plus the fixed native fixture above, never user content.
const { createMessagesContext, createPromptContextAdapter, getSummaryPanelConfig, saveSummaryPanelConfig, host } = await import(
    `data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

test('Messages uses live default/custom Summary cleaning before 4000-character clipping and worldbook scanning, without changing other apps', async t => {
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() {} } });
    t.after(() => {if (previous) {Object.defineProperty(globalThis, 'localStorage', previous);} else {delete globalThis.localStorage;}});
    let scan;
    const raw = '<think>' + '思考'.repeat(3000) + '</think><custom>不能带入世界书</custom>门口放着两碗牛肉面。';
    host.context = { chatId: 'chat', characterId: 0, characters: [{ avatar: 'role.png', name: '林月' }],
        chat: [{ is_user: false, mes: raw }],
        getCharacterCardFields() {return { mesExamples: '' };},
        getWorldInfoPrompt: async messages => {scan = messages; return {
            worldInfoBefore: '', worldInfoAfter: '', worldInfoDepth: [], worldInfoExamples: [],
            anBefore: [], anAfter: [], outletEntries: {},
        };},
    };
    const adapter = createMessagesContext({ messages: () => host.context.chat }, () => []);
    const contact = { name: '林月', note: '' }; const incoming = { id: 'current', seq: 1, from: '我', payload: { type: 'text', text: '到家了' } };
    let result = await adapter.capture(contact, [], incoming);
    assert.equal(result.recentMessages[0].text, '<custom>不能带入世界书</custom>门口放着两碗牛肉面。');
    const config = getSummaryPanelConfig();
    saveSummaryPanelConfig({ ...config, textFilterRules: [...config.textFilterRules, { start: '<custom>', end: '</custom>' }] });
    result = await adapter.capture(contact, [], incoming);
    assert.equal(result.recentMessages[0].text, '门口放着两碗牛肉面。');
    assert.equal(scan.at(-1), '门口放着两碗牛肉面。');
    assert.equal(host.context.chat[0].mes, raw);
    const other = await createPromptContextAdapter().capture();
    assert.ok(other.contextSnapshot.recentMessages[0].text.startsWith('<think>'));
    assert.equal(scan.at(-1), raw);
    // Removing user rules takes effect on the same live adapter; no cached copy.
    saveSummaryPanelConfig({ ...config, textFilterRules: [] });
    result = await adapter.capture(contact, [], incoming);
    assert.ok(result.recentMessages[0].text.startsWith('<think>'));
});

test('Messages reads a cross-contact summary batch once at the capture boundary, without assigning event occurrence floors', async t => {
    const h = await harness();
    const story = () => ({ is_user: false, is_system: false, mes: 'ordinary story' });
    h.messages.push(...Array.from({ length: 10 }, story)); h.remote = structuredClone(h.messages);
    await h.send('甲', 'previous');
    h.messages.push(...Array.from({ length: 10 }, story)); h.remote = structuredClone(h.messages);
    // Summary stores the batch end on both events, even though they happened on opposite sides of the contact.
    const events = [{ title: 'early-event', summary: 'floor-2-event', _addedAt: 20 },
        { title: 'late-event', summary: 'floor-18-event', _addedAt: 20 }];
    host.eventReads = []; host.readEvents = options => formatStorySummaryL2Events(events, options);
    t.after(() => {host.readEvents = () => '';});
    host.context = { chatId: 'chat', characterId: 0, characters: [{ avatar: 'role.png', name: '甲' }], chat: h.messages,
        getCharacterCardFields() {return { mesExamples: '' };},
        getWorldInfoPrompt: async () => ({ worldInfoBefore: '', worldInfoAfter: '', worldInfoDepth: [], worldInfoExamples: [],
            anBefore: [], anAfter: [], outletEntries: {} }),
    };
    const state = h.service.current(); const contact = state.contacts[0];
    const history = state.messages.filter(message => message.contactId === contact.id);
    const incoming = { ...history[0], id: 'now', seq: state.nextSeq, payload: { type: 'text', text: 'current-input' } };
    const context = await createMessagesContext(h.chat, () => state.segments).capture(contact, history, incoming);
    assert.deepEqual(host.eventReads, [{ throughMessageIndex: 20, maxCharacters: 20_000 }]);
    assert.equal(context.chronology.at(-1).breakBefore.kind, 'story');
    const request = buildReplyPrompt({ contact, history, incoming, context, settings: h.deps.getSettings() });
    const document = new DOMParser().parseFromString(`<request>${request.messages.at(-1).content}</request>`, 'text/xml');
    assert.equal(document.querySelectorAll('story_events').length, 1);
    for (const event of events) {
        assert.ok(document.querySelector('story_events').textContent.includes(event.summary));
        assert.ok(!document.querySelector('current_communication').textContent.includes(event.summary));
    }
});
