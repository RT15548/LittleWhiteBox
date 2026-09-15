import assert from 'node:assert/strict';
import { runSummaryGeneration } from '../../modules/story-summary/generate/generator.js';
import { getSummaryStore } from '../../modules/story-summary/data/store.js';
import { getContext, __setReplayContext } from './shims/extensions.js';
import { chat_metadata, __setChatMetadata } from './shims/script.js';

// Exercise the commit boundary: JSON errors and malformed event results must
// not consume source floors, save partial data, or invoke completion callbacks.
export async function runSummaryResponseCheck() {
    const previousContext = getContext();
    const previousMetadata = chat_metadata;
    const previousStreamingModule = globalThis.window.xiaobaixStreamingGeneration;
    const summary = floor => ({
        events: [{ title: '回家', summary: `两人一起吃牛肉面。 (#${floor})`,
            participants: [], causedBy: [], memoryRole: '具体经历' }],
        keywords: [], newCharacters: [], arcUpdates: [], factUpdates: [],
    });
    const nextSummary = JSON.stringify(summary(2));
    const invalid = [[], [summary(2)], 'text', '{}', 42, true, false, null];
    const invalidStructure = [
        {},
        { error: { message: 'quota exceeded' } },
        { message: 'upstream timeout', code: 502 },
        { events: null },
        { events: {} },
        { events: '[]' },
        ...[null, {}, 'event', [],
            { title: '回家' }, { summary: '两人一起吃面' },
            { title: ' \n ', summary: '两人一起吃面' },
            { title: '回家', summary: '\t' },
            { title: 123, summary: '两人一起吃面' },
            { title: '回家', summary: {} },
        ].map(event => ({ events: [event] })),
        { ...summary(2), events: [...summary(2).events, {}] },
        ...['正文 (#999-1000)', '正文 (#2-1)', '正文 (#1)', '没有来源标注'].map(value => ({
            events: [{ ...summary(2).events[0], summary: value }],
        })),
        { ...summary(2), arcUpdates: [{ name: '小红', newMoment: '接过碗' }] },
        { ...summary(2), factUpdates: [{ s: '小红', p: '位置' }] },
        { ...summary(2), events: [{ ...summary(2).events[0], causedBy: ['new-1'] }] },
        { ...summary(2), events: [{ ...summary(2).events[0], causedBy: ['evt-999'] }] },
        { ...summary(2), keywords: { text: '新关键词' } },
    ];
    const cases = [
        ...invalid.map(value => ({ raw: JSON.stringify(value), valid: false })),
        ...invalidStructure.map(value => ({ raw: JSON.stringify(value), valid: false, error: 'structure' })),
        { raw: '```json\n{"error":{"message":"quota exceeded"}}\n```', valid: false, error: 'structure' },
        { raw: nextSummary, valid: true },
        { raw: `\`\`\`json\n${nextSummary}\n\`\`\``, valid: true },
        { raw: `总结如下：\n${nextSummary}`, valid: true },
        { raw: '{"events":[]}', valid: true, eventIds: ['evt-1'] },
        { raw: JSON.stringify({ events: [], factUpdates: [{ s: '小红', p: '位置', o: '家中', isState: true }] }),
            valid: true, eventIds: ['evt-1'], factValue: '家中' },
        { raw: JSON.stringify({ events: [
            { ...summary(2).events[0], id: 'evt-1', causedBy: ['evt-1'] },
            { ...summary(2).events[0], id: 'evt-1', causedBy: ['new-1'] },
        ] }), valid: true, eventIds: ['evt-1', 'evt-2', 'evt-3'], causes: [['evt-1'], ['evt-2']] },
        { raw: JSON.stringify({ events: [], arcUpdates: [{ name: '小红', trajectory: '重新认识彼此', progress: 0 }] }),
            valid: true, eventIds: ['evt-1'], arcProgress: 0 },
        { raw: nextSummary, valid: false, saveFailure: true },
    ];
    const scenarios = [false, true].flatMap(useStream => cases.map(scenario => ({ ...scenario, useStream })));

    try {
        for (const [index, scenario] of scenarios.entries()) {
            const config = { api: { provider: 'st' }, trigger: { useStream: scenario.useStream, delayFloors: 0 } };
            const chatId = `summary-response-${index}`;
            const chat = [{ is_user: true, mes: '我拎着两碗牛肉面推开家门。' }];
            let saved = 0;
            let failSave = false;
            let responseText = JSON.stringify({ ...summary(1),
                arcUpdates: [{ name: '小红', trajectory: '开始建立信任', progress: 0.7 }],
                factUpdates: [{ s: '小红', p: '位置', o: '门口', isState: true }],
            });
            __setChatMetadata({});
            __setReplayContext({ chatId, chat, saveMetadata: async () => {
                if (failSave) throw new Error('simulated save failure');
                saved++;
            } });
            globalThis.window.xiaobaixStreamingGeneration = {
                async xbgenrawCommand(args) { return args.nonstream === 'true' ? responseText : 'response-session'; },
                getStatus() { return { isStreaming: false, text: responseText }; },
            };
            const seed = await runSummaryGeneration(0, config);
            assert.equal(seed.success, true);
            assert.equal(saved, 1);
            const before = structuredClone(getSummaryStore());
            saved = 0;
            failSave = !!scenario.saveFailure;
            chat.push({ is_user: false, mes: '小红接过碗，我们一起坐下。' });
            responseText = scenario.raw;
            let completed = false;
            let callbackIds;
            const errors = [];
            const result = await runSummaryGeneration(1, config, {
                onError: message => errors.push(message),
                onComplete: ({ newEventIds }) => { completed = true; callbackIds = newEventIds; },
            });

            assert.equal(result.success, scenario.valid, scenario.raw);
            assert.equal(completed, scenario.valid, scenario.raw);
            assert.equal(saved, scenario.valid ? 1 : 0, scenario.raw);
            if (scenario.valid) {
                assert.equal(errors.length, 0);
                assert.equal(getSummaryStore().lastSummarizedMesId, 1);
                assert.deepEqual(getSummaryStore().json.events.map(event => event.id), scenario.eventIds || ['evt-1', 'evt-2']);
                const generated = getSummaryStore().json.events.slice(1);
                assert.deepEqual(result.newEventIds, generated.map(event => event.id));
                assert.deepEqual(callbackIds, result.newEventIds);
                if (scenario.causes) assert.deepEqual(generated.map(event => event.causedBy), scenario.causes);
                const arc = getSummaryStore().json.arcs[0];
                assert.equal(arc.progress, scenario.arcProgress ?? 0.7);
                assert.equal(arc.trajectory, scenario.arcProgress === 0 ? '重新认识彼此' : '开始建立信任');
                if (scenario.factValue) {
                    assert.equal(getSummaryStore().json.facts.find(fact => fact.s === '小红' && fact.p === '位置')?.o, scenario.factValue);
                }
            } else {
                if (scenario.saveFailure) assert.match(result.error.message, /simulated save failure/);
                else assert.equal(result.error, scenario.error || 'parse');
                assert.equal(errors.length, 1);
                if (scenario.error === 'structure') assert.match(result.message, /events|arcUpdates|factUpdates|keywords/);
                assert.deepEqual(getSummaryStore(), before, scenario.raw);
                // A failed batch leaves the same floor and ID available to retry.
                failSave = false;
                responseText = nextSummary;
                const retry = await runSummaryGeneration(1, config);
                assert.equal(retry.success, true);
                assert.deepEqual(retry.newEventIds, ['evt-2']);
                assert.equal(getSummaryStore().lastSummarizedMesId, 1);
                assert.equal(saved, 1);
            }
        }
        return { passed: scenarios.length };
    } finally {
        __setReplayContext(previousContext);
        __setChatMetadata(previousMetadata);
        globalThis.window.xiaobaixStreamingGeneration = previousStreamingModule;
    }
}
