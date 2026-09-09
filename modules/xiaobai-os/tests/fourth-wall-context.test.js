import assert from 'node:assert/strict';
import test from 'node:test';
import { createDefaultFourthWallChatState, createDefaultFourthWallGlobalSettings } from '../apps/fourth-wall/domain/defaults.js';
import { getArchiveEnd } from '../apps/fourth-wall/domain/context-policy.js';
import { buildFourthWallPrompt } from '../apps/fourth-wall/domain/prompt.js';
import { buildFourthWallAgentRequest, counterMessages } from '../apps/fourth-wall/domain/agent-request.js';
import { createFourthWallAgentResponse } from '../apps/fourth-wall/host/agent-response.js';
import { createFourthWallContextService } from '../apps/fourth-wall/host/context-service.js';
import { createFourthWallHistoryView } from '../apps/fourth-wall/host/history-view.js';
import { clearSession, deleteMessage, editMessage, updateMemory, addSession, deleteSession } from '../apps/fourth-wall/domain/state.js';

const message = (role, content, ts, type) => ({ role, content, ts, ...(type ? { type } : {}) });
function sessionWithRounds(rounds) {
    const session = createDefaultFourthWallChatState(1).sessions[0];
    for (let i = 0; i < rounds; i++) {
        session.history.push(message('user', `user-${i}`, i * 2 + 2), message('ai', `reply-${i}`, i * 2 + 3));
    }
    return session;
}
function buildPrompt(session) {
    return buildFourthWallPrompt({ history: session.history.slice(session.archivedCount), memory: session.memory,
        userInput: '', settings: createDefaultFourthWallChatState().settings,
        globalSettings: createDefaultFourthWallGlobalSettings(),
        chatSnapshot: { userName: 'Writer', characterName: 'Partner', messages: [{ isUser: true, text: 'RP_ONLY', index: 1, name: 'Writer' }] },
    });
}
function harness(session, overrides = {}) {
    const counts = [], summaries = [], commits = [], phases = [];
    const controller = new AbortController();
    const service = createFourthWallContextService({
        count: async request => { counts.push(request); return overrides.count ? overrides.count(request) : 100; },
        summarize: async request => {
            summaries.push(request);
            return overrides.summarize ? overrides.summarize(request, summaries.length) : { text: '# 皮下人设\n甲\n# 长期记忆\n乙' };
        },
    });
    const options = { session, buildPrompt, config: {}, signal: controller.signal, disableAssistantPrefill: false,
        onPhase: phase => phases.push(phase),
        commit: async (memory, archivedCount) => { await overrides.commit?.(memory, archivedCount); commits.push({ memory, archivedCount }); },
    };
    return { counts, summaries, commits, phases, controller, options, run: patch => service.prepare({ ...options, ...patch }) };
}

test('archive retains five complete exchanges, ten originals and pending input; commentary is not a reply', () => {
    for (const rounds of [0, 1, 4, 5, 6, 20]) {
        const session = sessionWithRounds(rounds);
        assert.equal(getArchiveEnd(session), Math.max(0, (rounds - 5) * 2));
        session.history.push(message('user', 'pending', 100));
        assert.equal(getArchiveEnd(session), Math.max(0, (rounds - 5) * 2));
        session.history.push(message('ai', 'independent', 101, 'commentary'));
        assert.equal(getArchiveEnd(session), Math.max(0, (rounds - 5) * 2));
    }
    const mixed = sessionWithRounds(6);
    mixed.history.splice(5, 0, ...Array.from({ length: 12 }, (_, i) => message('ai', `aside-${i}`, 100 + i, 'commentary')));
    assert.equal(getArchiveEnd(mixed), 2);
    mixed.archivedCount = 2;
    assert.equal(getArchiveEnd(mixed), 2);
    const onlyCommentary = sessionWithRounds(0);
    onlyCommentary.history = Array.from({ length: 30 }, (_, i) => message('ai', `aside-${i}`, i, 'commentary'));
    assert.equal(getArchiveEnd(onlyCommentary), 20);
});

test('128k triggers summary; 158k without archivable messages is allowed but larger input is blocked', async () => {
    const low = harness(sessionWithRounds(6), { count: () => 127999 });
    await low.run();
    assert.equal(low.summaries.length, 0);
    for (const tokens of [128000, 158000, 158001]) {
        const h = harness(sessionWithRounds(5), { count: () => tokens });
        if (tokens > 158000) { await assert.rejects(h.run(), /158k/); }
        else { await h.run(); }
        assert.equal(h.summaries.length, 0);
        await assert.rejects(h.run({ manual: true }), /没有可总结/);
    }
    let calls = 0;
    const high = harness(sessionWithRounds(6), { count: () => ++calls === 1 ? 128000 : 100 });
    await high.run();
    assert.equal(high.commits[0].archivedCount, 2);
    assert.deepEqual(high.phases, ['counting', 'summarizing', 'saving']);
});

test('memory is replaced once, summarizes only departing originals and is adjacent to retained history', async () => {
    const session = sessionWithRounds(7);
    session.memory = 'OLD_MEMORY';
    session.archivedCount = 2;
    session.history[2].thinking = 'SECRET_THINKING';
    const h = harness(session);
    const prompt = await h.run({ manual: true });
    assert.equal(h.commits.length, 1);
    assert.equal(h.commits[0].archivedCount, 4);
    const material = h.summaries[0].messages[0].content;
    // These assertions inspect the actual model-bound data, not source-code strings.
    for (const included of ['OLD_MEMORY', 'user-1', 'reply-1', 'User', 'timestamp 4']) { assert.ok(material.includes(included)); }
    for (const excluded of ['SECRET_THINKING', 'RP_ONLY', 'user-0', 'user-2']) { assert.ok(!material.includes(excluded)); }
    const memoryEnd = prompt.msg3.indexOf('</meta_memory>') + '</meta_memory>'.length;
    assert.equal(prompt.msg3.slice(memoryEnd).trimStart().indexOf('<meta_history>'), 0);
    assert.ok(!prompt.msg3.includes('user-1'));
    assert.ok(prompt.msg3.includes('user-2'));
    assert.ok(prompt.msg3.includes('RP_ONLY'));
    assert.equal(session.memory, 'OLD_MEMORY');
    assert.equal(session.history.length, 14);
    const next = { ...session, ...h.commits[0], history: [...session.history, message('user', 'later', 99), message('ai', 'answer', 100)] };
    const second = harness(next);
    await second.run({ manual: true });
    assert.ok(second.summaries[0].messages[0].content.includes(h.commits[0].memory));
    assert.ok(!second.summaries[0].messages[0].content.includes('user-1'));
});

test('huge originals are summarized in bounded ordered Unicode-safe batches and committed only at the end', async () => {
    const session = sessionWithRounds(6);
    session.history[0].content = '😀'.repeat(160000);
    session.memory = 'BASE';
    const pieces = [];
    const h = harness(session, {
        count: request => counterMessages(request).reduce((sum, item) => sum + item.content.length, 0),
        summarize: (request, index) => {
            assert.ok(counterMessages(request).reduce((sum, item) => sum + item.content.length, 0) <= 128000);
            const source = request.messages[0].content.split('Older private chat:\n')[1];
            assert.ok(source.isWellFormed());
            const content = source.split('\n').slice(1).join('\n').split('\n\n[Message 2;')[0];
            pieces.push(content);
            assert.equal(h.commits.length, 0);
            if (index > 1) { assert.ok(request.messages[0].content.includes(`memory-${index - 1}`)); }
            return { text: `memory-${index}` };
        },
    });
    await h.run();
    assert.ok(h.summaries.length > 2);
    assert.equal(pieces.join(''), session.history[0].content);
    assert.equal(h.commits.length, 1);
    assert.equal(h.commits[0].memory, `memory-${h.summaries.length}`);
});

test('empty, refused, truncated, failed, cancelled and unconfirmed summaries never release a prepared reply', async t => {
    for (const failure of ['empty', 'refusal', 'length', 'MAX_TOKENS', 'max_output_tokens', 'incomplete', 'content_filter', 'SAFETY', 'tool_use', 'pause_turn', 'unknown', 'network', 'cancel', 'save']) {
        await t.test(failure, async () => {
            const session = sessionWithRounds(6), before = structuredClone(session);
            const h = harness(session, {
                summarize: () => {
                    if (failure === 'network') { throw new Error('network'); }
                    if (failure === 'cancel') { h.controller.abort(); }
                    return { text: failure === 'empty' ? '  ' : 'candidate', finishReason: ['empty', 'cancel', 'save'].includes(failure) ? 'stop' : failure };
                },
                commit: () => { if (failure === 'save') { throw new Error('save unconfirmed'); } },
            });
            await assert.rejects(h.run({ manual: true }));
            assert.deepEqual(session, before);
            assert.equal(h.commits.length, 0);
        });
    }
    const long = sessionWithRounds(6);
    long.history[0].content = 'x'.repeat(300000);
    const failedBatch = harness(long, { summarize: (_, index) => {
        if (index === 2) { throw new Error('second batch failed'); }
        return { text: 'temporary' };
    } });
    await assert.rejects(failedBatch.run({ manual: true }), /second batch/);
    assert.equal(failedBatch.commits.length, 0);
    const noReduction = harness(sessionWithRounds(6), { count: () => 128000 });
    await assert.rejects(noReduction.run(), /没有减少/);
    assert.equal(noReduction.commits.length, 0);
});

test('complete summary outcomes from supported providers replace memory, including omitted stop metadata', async () => {
    for (const finishReason of [undefined, '', 'stop', 'STOP', 'end_turn', 'stop_sequence', 'completed']) {
        const h = harness(sessionWithRounds(6), { summarize: () => ({ text: 'complete memory', finishReason }) });
        await h.run({ manual: true });
        assert.deepEqual(h.commits, [{ memory: 'complete memory', archivedCount: 2 }]);
    }
});

test('counting and generation use the same final request with either Prefill mode', async () => {
    for (const disableAssistantPrefill of [false, true]) {
        const h = harness(sessionWithRounds(3));
        const builtPrompt = await h.run({ disableAssistantPrefill });
        let sent;
        await createFourthWallAgentResponse({ run: async request => { sent = request; return {}; } })({
            config: {}, builtPrompt, disableAssistantPrefill, stream: false, signal: h.controller.signal,
        });
        assert.deepEqual(h.counts.at(-1), buildFourthWallAgentRequest(builtPrompt, disableAssistantPrefill));
        assert.deepEqual(counterMessages(h.counts.at(-1)), counterMessages(sent));
        assert.deepEqual(sent.tools, []);
    }
});

test('bounded history pages navigate both directions and reject stale or shifted edits', () => {
    const state = createDefaultFourthWallChatState(1);
    state.sessions[0] = sessionWithRounds(100);
    const view = createFourthWallHistoryView();
    let page = view.project(state);
    assert.equal(page.messages.length, 20);
    assert.equal(page.start, 180);
    for (let i = 0; i < 12; i++) {
        page = view.page(state, 'earlier', page.revision);
        assert.ok(page.messages.length <= 20);
        assert.ok(view.project(state, false).messages.length <= 60);
    }
    assert.equal(page.start, 0);
    view.assertMessage(state, 0, page.revision);
    assert.throws(() => view.assertMessage(deleteMessage(state, 'default', 0), 0, page.revision), /消息已变化/);
    for (let i = 0; i < 12; i++) {
        page = view.page(state, 'later', page.revision);
        assert.ok(page.messages.length <= 20);
        assert.ok(view.project(state, false).messages.length <= 60);
    }
    page = view.page(state, 'latest', page.revision);
    assert.equal(page.messages.length, 20);
    const oldRevision = page.revision;
    view.project(state);
    assert.throws(() => view.page(state, 'earlier', oldRevision), /已变化/);
});

test('clearing and editing memory never resurrect archived originals; deletions maintain the boundary', () => {
    let state = createDefaultFourthWallChatState(1);
    state.sessions[0] = { ...sessionWithRounds(6), memory: 'remember', archivedCount: 2 };
    state = updateMemory(state, 'default', '');
    assert.equal(state.sessions[0].archivedCount, 2);
    state = updateMemory(state, 'default', 'edited');
    state = editMessage(state, 'default', 0, 'corrected');
    assert.equal(state.sessions[0].memory, 'edited');
    state = deleteMessage(state, 'default', 0);
    assert.equal(state.sessions[0].archivedCount, 1);
    assert.equal(state.sessions[0].memory, 'edited');
    const cleared = clearSession(state, 'default');
    assert.deepEqual(cleared.sessions[0], { ...state.sessions[0], history: [], archivedCount: 0 });
    assert.equal(clearSession(state, 'default', true).sessions[0].memory, '');
    state = addSession(state, { id: 'other', name: 'other', createdAt: 2 });
    assert.equal(deleteSession(state, 'default').sessions.length, 1);
    assert.equal(deleteSession(state, 'default').sessions[0].memory, '');
});
