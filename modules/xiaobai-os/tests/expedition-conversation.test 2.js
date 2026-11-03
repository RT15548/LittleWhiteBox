import assert from 'node:assert/strict';
import test from 'node:test';
import { traveler } from './fixtures/expedition-traveler.js';
import { readFile } from 'node:fs/promises';
import { createCampaign, recordFact } from '../apps/game/expedition/campaign/rules.ts';
import { buildConversationPrompt, conversationContext } from '../apps/game/expedition/narrative/prompt.ts';
import { generateConversation } from '../apps/game/expedition/narrative/conversation.ts';
import { applyReply } from '../apps/game/expedition/narrative/apply-reply.ts';
import { loadNarrativeCanon } from '../apps/game/expedition/narrative/canon.ts';
import { narrativeOptions, conversationMemory, loadCanon, narrativeReply, inspectNarrativePrompt, inspectHistoryMessage, promptBlock } from './fixtures/expedition-narrative.js';
import { PARTICIPANT_IDS, isPerson } from '../apps/game/expedition/content/participants.ts';
import { PARLEY_ENEMIES } from '../apps/game/expedition/content/parley.ts';
import { decodeNarrativeReply } from '../apps/game/expedition/narrative/response.ts';
import { OpenAICompatibleAdapter } from '../../agent-core/adapters/openai-compatible.js';
import { OpenAIResponsesAdapter } from '../../agent-core/adapters/openai-responses.js';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { DESTINATIONS } from '../apps/game/expedition/content/people-places.ts';
import { WORLD_COPY } from '../apps/game/expedition/content/world-copy.ts';
import { OUTFIT_COPY, WEAPON_COPY, errorText } from '../apps/game/expedition/copy.ts';
import { movePerson, tickPeople } from '../apps/game/expedition/world/people.ts';
import { TRAVELER_AGES, TRAVELER_AGE_IDS } from '../apps/game/expedition/content/traveler-ages.ts';
import { replayTurns, historyForSummary } from '../apps/game/expedition/narrative/history.ts';
import { HostRequestError } from '../shell/app-src/frame-bridge.ts';
const campaign = () => createCampaign('chapter', 7, 'blade', 'traveler', traveler);
const signal = () => new AbortController().signal;
const turn = (id, player = 'question', reply = 'answer', action = null) => ({ id, kind: 'dialogue', player, reply, action, facts: [], scene: 'camp' });
const agentFor = run => ({ loadConfig: async () => ({}), openSession: async () => ({ providerConfig: { model: 'fixture' }, run }) });

test('both residents and guards receive the saved traveler rather than a host persona', async () => {
    for (const gender of ['male', 'female']) for (const appearanceAge of [undefined, ...TRAVELER_AGE_IDS]) {
        const c = campaign(); c.traveler = { name: '江雪', gender, ...appearanceAge ? { appearanceAge } : {} };
        for (const person of ['sanniang', 'bajin']) {
            const prompt = buildConversationPrompt(c, person, 'hello', await loadCanon(person, signal()));
            const data = inspectNarrativePrompt(prompt);
            assert.deepEqual(data.player, { name: '江雪', gender, adult: true,
                ...appearanceAge ? { appearanceAge: TRAVELER_AGES[appearanceAge] } : {},
                outfit: OUTFIT_COPY[c.outfit].detail, equipment: WEAPON_COPY[c.weapon].equipment });
        }
    }
});

test('current equipment and movement reach the request without becoming player identity or persisted state', async () => {
    const c = campaign(), canon = await loadCanon('sanniang', signal());
    const context = () => inspectNarrativePrompt(buildConversationPrompt(c, 'sanniang', 'hello', canon));
    assert.deepEqual(context().story.movement, { mode: 'idle', destination: null, leader: null });
    movePerson(c, 'sanniang', 'follow');
    assert.deepEqual(context().story.movement, { mode: 'follow', destination: null, leader: c.traveler.name });
    movePerson(c, 'sanniang', 'go:clinic_back');
    assert.deepEqual(context().story.movement, { mode: 'travel', destination: DESTINATIONS.clinic_back.name, leader: null });
    const beforeTravel = structuredClone(c.people.sanniang.position);
    for (let i = 0; i < 3; i++) {
        assert.equal(context().story.map.find(place => place.id === 'clinic_back').personHere, false);
        assert.deepEqual(c.people.sanniang.position, beforeTravel);
    }
    for (let i = 0; i < 1000 && c.people.sanniang.mode === 'travel'; i++) tickPeople(c);
    assert.deepEqual(context().story.movement, { mode: 'idle', destination: null, leader: null });
    assert.equal(context().story.map.find(place => place.id === 'clinic_back').personHere, true);
    movePerson(c, 'sanniang', 'stay');
    assert.deepEqual(context().story.movement, { mode: 'idle', destination: null, leader: null });
    c.weapon = 'bow'; c.outfit = 'ranger';
    const before = structuredClone(c), data = context();
    assert.deepEqual(data.player, { ...c.traveler, adult: true, appearanceAge: TRAVELER_AGES[c.traveler.appearanceAge],
        outfit: OUTFIT_COPY.ranger.detail, equipment: WEAPON_COPY.bow.equipment });
    assert.equal(data.story.stage.name, undefined); assert.deepEqual(c, before);
});

test('nearby residents and guards use actual proximity rather than follow mode or scene membership', () => {
    const c = campaign();
    c.people.laobai.position = { ...c.people.sanniang.position };
    assert.deepEqual(conversationContext(c, 'sanniang').nearby, [WORLD_COPY.people.laobai]);
    c.people.laobai.position = { ...COURTYARD.camp.anchors.guard };
    assert.deepEqual(conversationContext(c, 'sanniang').nearby, []);
    c.people.laobai.position = { ...c.people.sanniang.position }; c.people.laobai.scene = 'cells';
    assert.deepEqual(conversationContext(c, 'sanniang').nearby, []);
    c.people.sanniang.scene = 'gate'; c.people.sanniang.position = { ...COURTYARD.gate.anchors.parley };
    assert.deepEqual(conversationContext(c, 'bajin').nearby, [WORLD_COPY.people.sanniang]);
    assert.deepEqual(conversationContext(c, 'sanniang').nearby, [PARLEY_ENEMIES.bajin.name]);
    c.people.anian.position = { x: -2, y: -20.5 }; c.people.kouzi.position = { x: 2, y: -20.5 };
    assert.deepEqual(conversationContext(c, 'anian').nearby, []);
    c.people.kouzi.position = { x: -2, y: -21 };
    assert.deepEqual(conversationContext(c, 'anian').nearby, [WORLD_COPY.people.kouzi]);
});

test('history locates event arrivals without altering speech, leaking later events or replaying receipts', () => {
    const turns = [turn('before'),
        { ...turn('invalid'), kind: 'receipt', facts: ['bajin_intel'], scene: 'gate' },
        { ...turn('rescue', 'A "quoted" question\nnext line'), facts: ['captives_released'], scene: 'cells' },
        { ...turn('same-place'), facts: ['captives_released'], scene: 'cells' },
        { ...turn('returned'), facts: ['captives_released', 'captives_arrived'] }];
    const replay = replayTurns(turns), before = inspectHistoryMessage(replay[0]), rescue = inspectHistoryMessage(replay[2]);
    assert.equal(before.scene.place, WORLD_COPY.scenes.camp); assert.equal(before.scene.newEvents, undefined);
    assert.equal(rescue.scene.place, WORLD_COPY.scenes.cells); assert.deepEqual(rescue.scene.newEvents, ['captives_released']);
    assert.equal(rescue.input, turns[2].player); assert.equal(inspectHistoryMessage(replay[4]).input, turns[3].player);
    assert.deepEqual(inspectHistoryMessage(replay[6]).scene, { place: WORLD_COPY.scenes.camp, newEvents: ['captives_arrived'] });
    const source = historyForSummary(turns.slice(0, 4));
    assert.deepEqual(source.events.map(event => event.id), ['captives_released']);
    assert.deepEqual(source.conversation, replay.slice(0, 6));
    assert.deepEqual(inspectHistoryMessage(replayTurns(turns.slice(3))[0]).scene.newEvents, ['captives_released']);
});

test('personal witnesses stay personal; returning to camp does not disclose unseen progress', () => {
    const c = campaign();
    recordFact(c, 'receiving_arranged', ['laobai']);
    c.location.scene = 'cells';
    recordFact(c, 'captives_released');
    c.location.scene = 'camp';
    assert.deepEqual(conversationContext(c, 'laobai').events.map(e => e.id), ['receiving_arranged']);
    assert.deepEqual(conversationContext(c, 'sanniang').events, []);
    for (const id of ['anian', 'kouzi']) assert.deepEqual(conversationContext(c, id).events.map(e => e.id), ['captives_released']);
});

test('every participant receives the same public cast, but only their own private card and opening', async () => {
    const documents = new Map(PARTICIPANT_IDS.map(id => [isPerson(id) ? id : PARLEY_ENEMIES[id].card,
        `<!-- public -->public-${id}<!-- /public -->\nprivate-${id}` + (isPerson(id) ? '' : `\n<!-- opening:${id}.initial -->opening-${id}<!-- /opening -->`)]));
    documents.set('openings', PARTICIPANT_IDS.filter(isPerson).map(id =>
        `<!-- opening:${id}.initial -->opening-${id}<!-- /opening --><!-- opening:${id}.returned -->returned-${id}<!-- /opening -->`).join('\n'));
    for (const person of PARTICIPANT_IDS) {
        const canon = await loadNarrativeCanon(person, signal(), name => documents.get(name)
            ?? readFile(new URL(`../docs/expedition-cards/${name}.md`, import.meta.url), 'utf8'));
        assert.equal(canon.npcs, PARTICIPANT_IDS.map(id => `public-${id}`).join('\n'));
        assert.equal(canon.character.trim(), `private-${person}`);
        assert.equal(canon.opening.initial, `opening-${person}`);
        const prompt = buildConversationPrompt(campaign(), person, 'hello', canon);
        assert.equal(promptBlock(prompt.systemPrompt, 'NPCs'), `${canon.npcs}\n\n${canon.character.trim()}`);
        assert.deepEqual(prompt.systemPrompt.match(/private-[a-z]+/g), [`private-${person}`]);
        assert.equal(inspectNarrativePrompt(prompt).story.opening, canon.opening.initial);
    }
});

test('preset framing preserves summary, witnessed events and chronological roles inside story', async () => {
    const c = campaign(), canon = await loadCanon('sanniang', signal());
    c.conversations.sanniang = [turn('old', 'archived question', 'archived answer'), turn('recent', 'recent question', 'recent answer', 'briefing')];
    c.memories.sanniang = { throughId: 'old', text: 'attributed summary' };
    recordFact(c, 'briefed', ['sanniang']);
    const input = 'A "quoted" question\nwith another line';
    const prompt = buildConversationPrompt(c, 'sanniang', input, canon), data = inspectNarrativePrompt(prompt);
    // These tags and message roles are the author-approved external prompt format, not UI copy.
    assert.deepEqual([...prompt.systemPrompt.matchAll(/^<(background|player|NPCs)>$/gm)].map(match => match[1]), ['background', 'player', 'NPCs']);
    assert.equal(prompt.systemPrompt.slice(0, prompt.systemPrompt.indexOf('<background>')).trim(), canon.system.trim());
    assert.equal(promptBlock(prompt.systemPrompt, 'background'), canon.world.trim());
    assert.equal(promptBlock(prompt.messages[0].content, 'meta_protocol').split('\n\n<operations>')[0], canon.protocol.trim());
    assert.deepEqual(prompt.messages.map(message => message.role), ['user', 'user', 'assistant', 'user']);
    assert.equal(data.story.memory, c.memories.sanniang.text);
    assert.deepEqual(data.story.events.map(event => event.id), ['briefed']);
    assert.equal(inspectHistoryMessage(prompt.messages[1]).input, 'recent question');
    assert.equal(decodeNarrativeReply(prompt.messages[2].content).reply, 'recent answer');
    assert.equal(data.input, input); assert.ok(data.instruction);
    assert.equal(data.story.player, undefined); assert.equal(data.story.performance, undefined);
    assert.equal(data.operations.memory, undefined);
});

test('history replays the actual action and only the current participant with chronological results', async () => {
    const c = campaign(); recordFact(c, 'briefed', ['sanniang']);
    c.conversations.sanniang = [turn('one', 'question', 'answer', 'briefing')];
    const prompt = buildConversationPrompt(c, 'sanniang', 'remember?', await loadCanon('sanniang', signal()));
    assert.equal(inspectHistoryMessage(prompt.messages[1]).input, 'question');
    assert.equal(decodeNarrativeReply(prompt.messages[2].content).controls.action, 'briefing');
    const first = buildConversationPrompt(c, 'laobai', 'hello', await loadCanon('laobai', signal()));
    assert.deepEqual(first.messages.map(message => message.role), ['user', 'assistant', 'user']);
    assert.ok(decodeNarrativeReply(first.messages[1].content).reply);
    assert.equal(decodeNarrativeReply(first.messages[1].content).controls.action, null);
    assert.ok(!conversationContext(c, 'sanniang').actions.includes('briefing'));
});

test('complete dialogue and optional JSON fences preserve a paid response even when action is omitted', async () => {
    for (const text of ['<dialogue>ok</dialogue>\n{"action":null}', '<dialogue>ok</dialogue>\n```json\n{"action":"briefing"}\n```',
        '```xml\n<dialogue>ok</dialogue>\n{}\n```', '```json\n<dialogue>ok</dialogue>\n{"action":"briefing"}\n```']) {
        let calls = 0, received;
        const result = await generateConversation(agentFor(async () => { calls++; return { text }; }), campaign(), 'sanniang', 'hello', signal(),
            { ...narrativeOptions, received: value => { received = value; } });
        assert.equal(result.reply, 'ok'); assert.equal(calls, 1); assert.equal(received.text, text);
        assert.equal(result.issue, undefined);
    }
});

test('responses without a usable body remain raw receipts and never manufacture game changes', async () => {
    for (const response of [{ text: '{' }, { text: '<dialogue></dialogue>\n{"action":"briefing"}' },
        { text: '{"reply":"x","action":"briefing","affection":"up"}', truncated: true }]) {
        let received;
        const c = campaign();
        const result = await generateConversation(agentFor(async () => response), c, 'sanniang', 'hello', signal(),
            { ...narrativeOptions, received: value => { received = value; } });
        assert.equal(result.kind, 'receipt'); assert.equal(result.reply, response.text);
        assert.equal(result.action, null); assert.equal(result.affection, null);
        assert.equal(result.issue, response.truncated ? 'reply_incomplete' : 'reply_invalid');
        assert.deepEqual(received, response); assert.deepEqual(c.facts, []);
    }
});

test('surrounded operations pass validation and update movement, clothing, affection and performance once', async () => {
    const c = campaign();
    const text = '前言。\n```php-template\n<dialogue>我脱下外套，跟你走。</dialogue>\n补充说明。\n```json\n'
        + JSON.stringify({ action: 'follow', clothing: { outer: null }, affection: 'up', performance: { expression: 'serious', gesture: 'gesture' } })
        + '\n```\n收尾。\n```';
    let calls = 0;
    const result = await generateConversation(agentFor(async () => { calls++; return { text }; }), c, 'sanniang', '走吧', signal(), narrativeOptions);
    assert.equal(result.issue, undefined);
    applyReply(c, { actionId: 'surrounded', person: 'sanniang', text: '走吧' }, result);
    const saved = c.conversations.sanniang.at(-1);
    assert.equal(calls, 1); assert.equal(c.people.sanniang.mode, 'follow');
    assert.equal(saved.reply, '我脱下外套，跟你走。'); assert.equal(saved.action, 'follow');
    assert.deepEqual(saved.clothing, { outer: null });
    assert.deepEqual(saved.performance, { expression: 'serious', gesture: 'gesture' });
    assert.ok(saved.affectionDelta > 0); assert.equal(c.relationships.sanniang.affection, saved.affectionDelta);
});

test('optional action errors keep valid dialogue without guessing or executing unavailable actions', async () => {
    for (const action of ['', 'none', 'invented', 'finish', [], {}, 1, undefined, null, 'follow ']) {
        let calls = 0;
        const result = await generateConversation(agentFor(async () => { calls++; return { text: narrativeReply({ reply: 'body', action }) }; }),
            campaign(), 'sanniang', 'hello', signal(), narrativeOptions);
        assert.equal(result.kind, 'dialogue'); assert.equal(result.reply, 'body'); assert.equal(calls, 1);
        assert.equal(result.action, action === 'follow ' ? 'follow' : null);
        assert.equal(result.issue, action == null || action === 'follow ' ? undefined : 'action_rejected');
    }
});

test('complete plain dialogue is usable, but does not invent affection, actions or performance', async () => {
    const text = '（她放下药碗，点了点头。）\n坐下吧，先暖暖手。';
    const result = await generateConversation(agentFor(async () => ({ text })), campaign(), 'sanniang', 'hello', signal(), narrativeOptions);
    assert.deepEqual(result, { kind: 'dialogue', reply: text, action: null, affection: null, issue: 'metadata_invalid' });
});

test('quotes, braces, literal markup and line breaks in dialogue do not become JSON controls', async () => {
    const reply = '她说："别把我说的 \'随便\' 当真。"\n& <b>也只是字</b>，{"action":"attack"}。\n```json\n{"action":"pass"}\n```';
    const text = `<dialogue>\n${reply}\n</dialogue>\n{"action":"briefing","affection":"up","performance":{"expression":"serious","gesture":"gesture"}}`;
    const result = await generateConversation(agentFor(async () => ({ text })), campaign(), 'sanniang', 'hello', signal(), narrativeOptions);
    assert.equal(result.kind, 'dialogue'); assert.equal(result.reply, reply); assert.equal(result.action, 'briefing');
    assert.equal(result.affection, 'up'); assert.deepEqual(result.performance, { expression: 'serious', gesture: 'gesture' });
});

test('missing, damaged or ambiguous trailing controls cannot erase a complete body or commit any changes', async () => {
    for (const suffix of ['', '{"action":"briefing"', '[]', 'null', '{"action":"briefing"}\n{"action":"attack"}', '<dialogue>second</dialogue>\n{"action":"briefing"}']) {
        const text = '<dialogue>这句话已经收到。</dialogue>\n' + suffix;
        const result = await generateConversation(agentFor(async () => ({ text })), campaign(), 'sanniang', 'hello', signal(), narrativeOptions);
        assert.deepEqual(result, { kind: 'dialogue', reply: '这句话已经收到。', action: null, affection: null, issue: 'metadata_invalid' });
    }
});

test('unclosed dialogue and provider truncation preserve received body without committing complete-looking controls', async () => {
    for (const response of [{ text: '<dialogue>她刚开口："先等' },
        { text: '<dialogue>她刚开口："先等</dialogue>\n{"action":"briefing","affection":"up"}', truncated: true }]) {
        const result = await generateConversation(agentFor(async () => response), campaign(), 'sanniang', 'hello', signal(), narrativeOptions);
        assert.deepEqual(result, { kind: 'receipt', reply: '她刚开口："先等', action: null, affection: null, issue: 'reply_incomplete' });
    }
});

test('real adapters preserve incomplete streamed text as a receipt, without a second request or invented action', async t => {
    for (const protocol of ['chat', 'responses']) {
        let calls = 0;
        const text = '<dialogue>received</dialogue>\n{"action":"briefing","affection":"up"}';
        const incomplete = { id: 'resp-fixture', object: 'response', status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' },
            output: [{ id: 'message-fixture', type: 'message', role: 'assistant', content: [{ type: 'output_text', text, annotations: [] }] }] };
        const events = protocol === 'chat' ? [
            { choices: [{ index: 0, delta: { role: 'assistant', content: text }, finish_reason: null }] },
            { choices: [{ index: 0, delta: {}, finish_reason: 'length' }] },
        ] : [
            { type: 'response.created', response: { ...incomplete, status: 'in_progress', output: [] } },
            { type: 'response.output_item.added', output_index: 0, item: incomplete.output[0] },
            { type: 'response.output_item.done', output_index: 0, item: incomplete.output[0] },
            { type: 'response.incomplete', response: incomplete },
        ];
        t.mock.method(globalThis, 'fetch', async () => {
            calls++;
            return new Response(events.map(data => `${data.type ? `event: ${data.type}\n` : ''}data: ${JSON.stringify(data)}\n\n`).join(''),
                { headers: { 'content-type': 'text/event-stream' } });
        });
        const adapter = protocol === 'chat'
            ? new OpenAICompatibleAdapter({ apiKey: 'fixture', model: 'fixture' })
            : new OpenAIResponsesAdapter({ apiKey: 'fixture', model: 'fixture' });
        const c = campaign(), result = await generateConversation(agentFor(request => adapter.chat(request)), c, 'sanniang', 'hello', signal(), narrativeOptions);
        assert.deepEqual(result, { kind: 'receipt', reply: 'received', action: null, affection: null, issue: 'reply_incomplete' });
        assert.equal(calls, 1); assert.deepEqual(c.facts, []);
        c.conversations.sanniang.push({ ...turn('receipt', 'hello', text), kind: result.kind, issue: result.issue });
        const prompt = buildConversationPrompt(c, 'sanniang', 'next', await loadCanon('sanniang', signal()));
        assert.equal(prompt.messages.length, 2); assert.ok(inspectNarrativePrompt(prompt).story.opening);
    }
});

test('long history compresses before dialogue, retains five full exchanges and commits memory only after complete reduction', async () => {
    const c = campaign();
    c.conversations.sanniang = Array.from({ length: 130 }, (_, i) => ({
        ...turn('t' + i, 'a'.repeat(2000), 'b'.repeat(8000)), scene: i < 125 ? 'cells' : 'camp',
        facts: i < 125 ? ['captives_released'] : ['captives_released', 'captives_arrived'],
    }));
    recordFact(c, 'captives_released', ['sanniang']); recordFact(c, 'captives_arrived', ['sanniang']);
    let summaries = 0, dialogue = 0, saved = null;
    const agent = agentFor(async request => {
        if (request.maxTokens === undefined) {
            summaries++;
            const source = JSON.parse(request.messages[0].content);
            assert.equal(source.person, WORLD_COPY.people.sanniang);
            assert.deepEqual(source.player, { ...c.traveler, adult: true, appearanceAge: TRAVELER_AGES[c.traveler.appearanceAge] });
            assert.deepEqual(source.events.map(event => event.id), ['captives_released']);
            assert.equal(inspectHistoryMessage(source.conversation[0]).scene.place, WORLD_COPY.scenes.cells);
            return { text: 'Retained attributable promise and preference.', finishReason: 'STOP' };
        }
        dialogue++;
        assert.ok(saved); assert.equal(inspectNarrativePrompt(request).input, 'pending');
        assert.equal(inspectNarrativePrompt(request).story.memory, saved.text);
        assert.equal(request.messages.filter(m => m.role === 'assistant').length, 5);
        assert.equal(inspectHistoryMessage(request.messages[1]).scene.place, WORLD_COPY.scenes.camp);
        assert.deepEqual(inspectNarrativePrompt(request).story.events.map(event => event.id), ['captives_released', 'captives_arrived']);
        return { text: narrativeReply({ reply: 'ok' }) };
    });
    await generateConversation(agent, c, 'sanniang', 'pending', signal(), { ...narrativeOptions, memory: conversationMemory(c, async memory => { saved = memory; }) });
    assert.ok(summaries >= 1); assert.equal(dialogue, 1); assert.equal(saved.throughId, 't124');
    assert.equal(c.conversations.sanniang.length, 130);
});

test('failed summary never advances the memory boundary or buys a dialogue response', async () => {
    const c = campaign();
    c.conversations.sanniang = Array.from({ length: 130 }, (_, i) => turn('t' + i, 'a'.repeat(2000), 'b'.repeat(8000)));
    let saves = 0, calls = 0;
    const agent = agentFor(async () => { calls++; return { text: 'partial', finishReason: 'length', truncated: true }; });
    await assert.rejects(generateConversation(agent, c, 'sanniang', 'pending', signal(),
        { ...narrativeOptions, memory: conversationMemory(c, async () => { saves++; }) }), { code: 'expedition_memory_incomplete' });
    assert.equal(saves, 0); assert.equal(calls, 1); assert.equal(c.memories.sanniang, null);
});

test('provider failures retain their cause and never automatically retry', async () => {
    for (const status of [401, 403, 429, 500, undefined]) {
        const cause = Object.assign(new Error(`HTTP ${status}\nrequest_id: fixture-request\nprovider diagnostic`), { status }); let calls = 0;
        const agent = agentFor(async () => { calls++; throw cause; });
        await assert.rejects(generateConversation(agent, campaign(), 'sanniang', 'hello', signal(), narrativeOptions), error => {
            assert.equal(error.code, status === 401 || status === 403 ? 'expedition_agent_auth' : 'expedition_agent_failed');
            assert.equal(error.cause, cause);
            // Provider diagnostics are transported data, not a UI copy contract.
            assert.equal(error.message, cause.message);
            const transported = new HostRequestError(JSON.parse(JSON.stringify({ error: error.code, message: error.message })));
            assert.equal(errorText(transported), cause.message); return true;
        });
        assert.equal(calls, 1);
    }
});

test('summary provider or persistence failures leave history untouched and do not buy a dialogue request', async () => {
    for (const failure of ['auth', 'save']) {
        const c = campaign();
        c.conversations.sanniang = Array.from({ length: 130 }, (_, i) => turn('t' + i, 'a'.repeat(2000), 'b'.repeat(8000)));
        const before = structuredClone(c); let dialogue = 0, saves = 0;
        const agent = agentFor(async request => {
            if (request.maxTokens !== undefined) { dialogue++; }
            if (failure === 'auth') { throw Object.assign(new Error('unauthorized'), { status: 401 }); }
            return { text: 'Attributable promise.', finishReason: 'stop' };
        });
        await assert.rejects(generateConversation(agent, c, 'sanniang', 'pending', signal(), {
            ...narrativeOptions, memory: conversationMemory(c, async () => { saves++; throw Object.assign(new Error('save'), { code: 'expedition_save_failed' }); }),
        }), { code: failure === 'auth' ? 'expedition_agent_auth' : 'expedition_save_failed' });
        assert.equal(dialogue, 0); assert.equal(saves, failure === 'auth' ? 0 : 1); assert.deepEqual(c, before);
    }
});

test('explicit provider capacity rejection compresses below the policy threshold, splits rejected summary batches and retries dialogue once', async () => {
    const c = campaign();
    c.conversations.sanniang = Array.from({ length: 13 }, (_, i) => turn('t' + i, 'a'.repeat(500), 'b'.repeat(1500)));
    let dialogue = 0, summaries = 0, saved;
    const agent = agentFor(async request => {
        if (request.maxTokens === undefined) {
            summaries++;
            const source = JSON.parse(request.messages[0].content);
            if (source.conversation.length > 8) { throw { code: 'context_length_exceeded' }; }
            return { text: 'Retained events with attribution.', finishReason: 'stop' };
        }
        dialogue++;
        if (dialogue === 1) { throw { error: { code: 'context_length_exceeded' } }; }
        assert.equal(request.messages.filter(m => m.role === 'assistant').length, 5);
        assert.equal(inspectNarrativePrompt(request).input, 'pending');
        return { text: narrativeReply({ reply: 'ok' }) };
    });
    await generateConversation(agent, c, 'sanniang', 'pending', signal(), { ...narrativeOptions, memory: conversationMemory(c, async value => { saved = value; }) });
    assert.equal(dialogue, 2); assert.equal(summaries, 3); assert.equal(saved.throughId, 't7');
    assert.equal(c.memories.sanniang, null); assert.equal(c.conversations.sanniang.length, 13);
});

test('capacity rejection with no archivable prefix stops without replaying the same paid request', async () => {
    let calls = 0;
    const cause = Object.assign(new Error('Maximum context length exceeded: requested 32769 tokens; limit 32768'), { code: 'context_length_exceeded' });
    await assert.rejects(generateConversation(agentFor(async () => { calls++; throw cause; }),
        campaign(), 'sanniang', 'pending', signal(), narrativeOptions), error => {
        assert.equal(error.code, 'expedition_context_capacity'); assert.equal(errorText(error), cause.message); return true;
    });
    assert.equal(calls, 1);
});

test('incomplete forced summary is not a character reply and never advances memory or retries dialogue', async t => {
    const c = campaign();
    c.conversations.sanniang = Array.from({ length: 13 }, (_, i) => turn('t' + i, 'a'.repeat(500), 'b'.repeat(1500)));
    const before = structuredClone(c);
    let calls = 0, saves = 0, receipts = 0;
    t.mock.method(globalThis, 'fetch', async () => {
        calls++;
        return new Response(JSON.stringify({ error: { code: 'context_length_exceeded', message: 'maximum context length exceeded' } }),
            { status: 400, headers: { 'content-type': 'application/json' } });
    });
    const adapter = new OpenAICompatibleAdapter({ apiKey: 'fixture', model: 'fixture' });
    adapter.client.chat.completions.create = async () => {
        calls++;
        return { choices: [{ message: { role: 'assistant', content: 'unfinished memory' }, finish_reason: 'length' }] };
    };
    await assert.rejects(generateConversation(agentFor(request => adapter.chat(request)), c, 'sanniang', 'pending', signal(), {
        ...narrativeOptions, memory: conversationMemory(c, async () => { saves++; }), received: () => { receipts++; },
    }), { code: 'expedition_agent_failed' });
    assert.equal(calls, 2); assert.equal(saves, 0); assert.equal(receipts, 0); assert.deepEqual(c, before);
});
