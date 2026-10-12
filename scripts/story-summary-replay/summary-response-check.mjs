import assert from 'node:assert/strict';
import { runSummaryGeneration } from '../../modules/story-summary/generate/generator.js';
import { getSummaryStore, extractRelationshipsFromFacts } from '../../modules/story-summary/data/store.js';
import { getContext, __setReplayContext } from './shims/extensions.js';
import { chat_metadata, __setChatMetadata } from './shims/script.js';
import { parseSummaryJson } from '../../modules/story-summary/generate/llm.js';
import { applySummaryUndo } from '../../modules/story-summary/data/summary-undo.js';
import { registerMemoryMaintenance } from '../../modules/story-summary/maintenance/notification.js';

// Exercise the commit boundary: JSON errors and malformed event results must
// not consume source floors, save partial data, or invoke completion callbacks.
export async function runSummaryResponseCheck() {
    // External JSON protocol: repairs must never rewrite string values.
    const text = 'Literal ,} and ,] and "quoted" and \\ path';
    const jsonWithTrailingCommas = '{"events":[],"text":' + JSON.stringify(text) + ',"nested":[1,2,],}';
    for (const raw of [jsonWithTrailingCommas, '```json\n' + jsonWithTrailingCommas + '\n```']) {
        assert.deepEqual(parseSummaryJson(raw), { events: [], text, nested: [1, 2] });
    }
    assert.equal(parseSummaryJson('{"events":['), null);
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
        ...['正文 (#999-1000)', '正文 (#2-1)', '正文 (#1)', '没有来源标注', '正文 (#2、#1)'].map(value => ({
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
        { raw: nextSummary, valid: true, completionFailure: true },
        ...['两人一起吃牛肉面。（＃２）', '（#2）两人一起吃牛肉面。', '两人一起吃牛肉面（#2）。'].map(value => ({
            raw: JSON.stringify({ events: [{ ...summary(2).events[0], summary: value }] }),
            valid: true,
            generatedSummary: value.startsWith('两人一起吃牛肉面。')
                ? '两人一起吃牛肉面。(#2)' : '两人一起吃牛肉面。 (#2)',
        })),
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
        { raw: JSON.stringify({ ...summary(2),
            arcUpdates: [{ name: '小红', trajectory: '重新认识彼此', progress: '75.9%' }],
            factUpdates: [{ s: '小红', p: '对小蓝的看法', o: '愿意共同承担责任', isState: true }],
        }), valid: true, arcProgress: 0.75, relationWithoutTrend: true },
        { raw: nextSummary, valid: false, saveFailure: true },
        ...[false, true].map(saveFailure => ({
            raw: JSON.stringify({ events: [{ ...summary(2).events[0], summary: '两人一起吃牛肉面。 (#2、#3)' }] }),
            valid: !saveFailure, saveFailure, extraFloor: true, generatedSummary: '两人一起吃牛肉面。 (#2-3)',
        })),
    ];
    const scenarios = [false, true].flatMap(useStream => cases.map(scenario => ({ ...scenario, useStream })));
    const commits = [];
    const unregister = registerMemoryMaintenance(batch => commits.push(batch));

    try {
        for (const [index, scenario] of scenarios.entries()) {
            const config = { api: { provider: 'st' }, trigger: { useStream: scenario.useStream, delayFloors: 0 } };
            const chatId = `summary-response-${index}`;
            const chat = [{ is_user: true, mes: '我拎着两碗牛肉面推开家门。' }];
            let saved = 0;
            let requests = 0;
            let failSave = false;
            let responseText = JSON.stringify({ ...summary(1),
                arcUpdates: [{ name: '小红', trajectory: '开始建立信任', progress: 70 }],
                factUpdates: [{ s: '小红', p: '位置', o: '门口', isState: true },
                    { s: '小红', p: '对小蓝的看法', o: '初次见面', isState: true, trend: '陌生' }],
            });
            __setChatMetadata({});
            __setReplayContext({ chatId, chat, saveMetadata: async () => {
                if (failSave) throw new Error('simulated save failure');
                saved++;
            } });
            globalThis.window.xiaobaixStreamingGeneration = {
                async startRawGeneration(args) {
                    requests++;
                    return { sessionId: args.id, completion: Promise.resolve(responseText) };
                },
                async xbgenrawCommand(args) {
                    requests++;
                    return args.nonstream === 'true' ? responseText : 'response-session';
                },
                getStatus() { return { isStreaming: false, text: responseText }; },
            };
            const seed = await runSummaryGeneration(0, config);
            assert.equal(seed.success, true);
            assert.equal(saved, 1);
            assert.deepEqual(commits.splice(0), [{ chatId, start: 0, cutoff: 0 }]);
            const before = structuredClone(getSummaryStore());
            saved = 0;
            requests = 0;
            failSave = !!scenario.saveFailure;
            chat.push({ is_user: false, mes: '小红接过碗，我们一起坐下。' });
            if (scenario.extraFloor) chat.push({ is_user: true, mes: '我说这家面馆味道不错。' });
            const targetFloor = chat.length - 1;
            responseText = scenario.raw;
            let completed = false;
            let callbackIds;
            const errors = [];
            const result = await runSummaryGeneration(targetFloor, config, {
                onError: message => errors.push(message),
                onComplete: ({ newEventIds }) => {
                    completed = true;
                    callbackIds = newEventIds;
                    // A failed post-save cleanup must not suppress or duplicate maintenance.
                    if (scenario.completionFailure) throw new Error('simulated cleanup failure');
                },
            });

            assert.equal(result.success, scenario.valid, scenario.raw);
            assert.equal(requests, 1, 'response handling must not buy another generation');
            assert.equal(completed, scenario.valid, scenario.raw);
            assert.equal(saved, scenario.valid ? 1 : 0, scenario.raw);
            assert.deepEqual(commits.splice(0), scenario.valid ? [{ chatId, start: 1, cutoff: targetFloor }] : []);
            if (scenario.valid) {
                assert.equal(errors.length, scenario.completionFailure ? 1 : 0);
                assert.equal(getSummaryStore().lastSummarizedMesId, targetFloor);
                assert.deepEqual(getSummaryStore().json.events.map(event => event.id), scenario.eventIds || ['evt-1', 'evt-2']);
                const generated = getSummaryStore().json.events.slice(1);
                if (scenario.generatedSummary) assert.equal(generated[0].summary, scenario.generatedSummary);
                assert.deepEqual(result.newEventIds, generated.map(event => event.id));
                assert.deepEqual(callbackIds, result.newEventIds);
                if (scenario.causes) assert.deepEqual(generated.map(event => event.causedBy), scenario.causes);
                const arc = getSummaryStore().json.arcs[0];
                assert.equal(arc.progress, scenario.arcProgress ?? 0.7);
                assert.equal(arc.trajectory, scenario.arcProgress !== undefined ? '重新认识彼此' : '开始建立信任');
                if (scenario.relationWithoutTrend) {
                    const fact = getSummaryStore().json.facts.find(f => f.p === '对小蓝的看法');
                    assert.equal(fact.o, '愿意共同承担责任');
                    assert.equal(Object.hasOwn(fact, 'trend'), false);
                    assert.equal(extractRelationshipsFromFacts([fact])[0].trend, '');
                    const store = getSummaryStore();
                    const restored = applySummaryUndo(store.json, store.summaryHistory.at(-1).undo);
                    assert.deepEqual(restored.arcs, before.json.arcs);
                    assert.deepEqual(restored.facts, before.json.facts);
                }
                if (scenario.factValue) {
                    assert.equal(getSummaryStore().json.facts.find(fact => fact.s === '小红' && fact.p === '位置')?.o, scenario.factValue);
                }
            } else {
                if (scenario.saveFailure) assert.equal(result.error.code, 'metadata_not_saved');
                else assert.equal(result.error, scenario.error || 'parse');
                assert.equal(errors.length, 1);
                if (scenario.error === 'structure') assert.match(result.message, /events|arcUpdates|factUpdates|keywords/);
                assert.deepEqual(getSummaryStore(), before, scenario.raw);
                // A failed batch leaves the same floor and ID available to retry.
                failSave = false;
                responseText = nextSummary;
                const retry = await runSummaryGeneration(targetFloor, config);
                assert.equal(retry.success, true);
                assert.deepEqual(retry.newEventIds, ['evt-2']);
                assert.equal(getSummaryStore().lastSummarizedMesId, targetFloor);
                assert.equal(saved, 1);
                assert.deepEqual(commits.splice(0), [{ chatId, start: 1, cutoff: targetFloor }]);
            }
            // Repeating an already committed boundary neither generates nor schedules work.
            const beforeRequests = requests;
            await runSummaryGeneration(targetFloor, config);
            assert.equal(requests, beforeRequests);
            assert.deepEqual(commits, []);
        }
        return { passed: scenarios.length };
    } finally {
        unregister();
        __setReplayContext(previousContext);
        __setChatMetadata(previousMetadata);
        globalThis.window.xiaobaixStreamingGeneration = previousStreamingModule;
    }
}
