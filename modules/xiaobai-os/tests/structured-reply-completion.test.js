import assert from 'node:assert/strict';
import test from 'node:test';
import { readResponseCompletion } from '../../agent-core/runtime/response-completion.js';
import { compileReplies, compileSummary } from '../apps/messages/prompt/reply-compiler.js';
import { compileTaskBoardResponse, compileTaskCandidateResponse } from '../apps/tasks/generation/response-compiler.js';
import { createFourthWallContextService } from '../apps/fourth-wall/host/context-service.js';
import { summarizeAdministrator } from '../apps/administrator/agent/history.js';

// Acceptance contracts (cost: lost paid replies, unintended state changes, lost memory):
// - Complete XML messages / JSON summaries and tasks are checked by their content,
//   not rejected by provider completion flags.
// - Broken envelopes and invalid task fields cannot produce applied state.
// - Plain-text summaries keep their original format despite abnormal transport endings.
const listing = { grade: 'C', tags: ['接触'], posture: '易介入', title: '带路', hook: '门前有人等你。',
    objective: '带她去码头', location: '码头', timing: '任意时候', risk: '注意脚下', reward: 50 };
const candidate = { name: '引路人', description: '熟悉城门', pitch: '我知道路。', capability: '认路', risk: '路滑' };

for (const reason of ['stop', 'length', undefined]) {
    test(`structured replies remain usable after ${reason ?? 'missing completion'}`, () => {
        const metadata = readResponseCompletion('openai', reason);
        const body = '「I said "yes"，不是“no”。」';
        const reply = { ...metadata, text: `<in_character>我有些期待。</in_character><msg>${body}</msg>` };
        assert.deepEqual(compileReplies(reply), [{ type: 'text', text: body }]);
        const summary = { ...metadata, text: JSON.stringify({ summary: '两人约好明天在码头见。' }) };
        assert.equal(compileSummary(summary), '两人约好明天在码头见。');
        const boardResponse = { ...metadata, text: JSON.stringify({ tasks: [listing] }) };
        const board = compileTaskBoardResponse(boardResponse.text);
        assert.equal(board.changed, true);
        assert.deepEqual(board.data.listings, [listing]);
        const candidateResponse = { ...metadata, text: JSON.stringify({ candidates: [candidate] }) };
        const candidates = compileTaskCandidateResponse(candidateResponse.text);
        assert.equal(candidates.changed, true);
        assert.deepEqual(candidates.data.candidates, [candidate]);
    });
}

test('incomplete XML/JSON and invalid fields cannot become messages or task updates', () => {
    assert.throws(() => compileReplies({ text: '<msg>Complete.</msg><msg>unfinished' }));
    assert.throws(() => compileSummary({ text: '{"summary":"unfinished' }));
    const partialBoard = compileTaskBoardResponse(`{"tasks":[${JSON.stringify(listing)}`);
    assert.equal(partialBoard.changed, false);
    assert.equal(partialBoard.data, undefined);
    const invalid = compileTaskBoardResponse(JSON.stringify({ tasks: [{ ...listing, reward: '50' }] }));
    assert.equal(invalid.changed, false);
    assert.equal(invalid.data, undefined);
    const partialCandidates = compileTaskCandidateResponse(`{"candidates":[${JSON.stringify(candidate)}`);
    assert.equal(partialCandidates.changed, false);
    assert.equal(partialCandidates.data, undefined);
});

test('fourth-wall adopts plain-text memory despite an abnormal ending', async () => {
    const session = { id: 'offline', name: 'offline', createdAt: 0, memory: '原有记忆', archivedCount: 0,
        history: Array.from({ length: 24 }, (_, i) => ({ role: i % 2 ? 'ai' : 'user', content: `事件${i}`, ts: i })) };
    const original = structuredClone(session);
    const commits = [];
    const context = createFourthWallContextService({ count: async () => 100,
        summarize: async () => ({ ...readResponseCompletion('openai', 'length'), text: '两人约好明天见。' }) });
    await context.prepare({ session, config: {}, manual: true, signal: new AbortController().signal,
        buildPrompt: () => ({ protocol: '', msg1: '', msg2: '', msg3: '', msg4: '' }), commit: async (text, count) => { commits.push({ text, count }); } });
    assert.deepEqual(commits, [{ text: '两人约好明天见。', count: 14 }]);
    assert.deepEqual(session, original);
});

test('administrator adopts plain-text memory despite a missing completion marker', async () => {
    const summary = '原有记忆';
    const gateway = { openSession: async () => ({
        run: async () => ({ ...readResponseCompletion('openai', undefined), text: '两人约好明天见。' }),
    }) };
    assert.equal(await summarizeAdministrator({ gateway, config: {}, summary,
        messages: [{ role: 'user', content: 'older exchange '.repeat(20) }], signal: new AbortController().signal }), '两人约好明天见。');
});
