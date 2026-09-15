import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareSummaryResult } from '../generate/summary-result.js';
import { parseEventRange } from '../vector/retrieval/temporal-turn-carrier.js';

const event = (fields = {}) => ({ title: '归还钥匙', summary: '小红归还了钥匙。 (#21-22)', ...fields });
const context = { existingEvents: [{ id: 'evt-12' }, { id: 'evt-7' }], startFloor: 21, endFloor: 25 };
const prepare = (batch, source = context) => prepareSummaryResult(batch, source);

test('code assigns sequential IDs and resolves existing and batch references without mutating inputs', () => {
    const batch = { events: [
        event({ id: 'evt-7', causedBy: ['evt-7', 'new-3'], _addedAt: -10 }),
        event({ id: 'evt-7', causedBy: ['new-1'] }),
        event({ id: { invalid: true }, causedBy: ['evt-12', 'evt-12'] }),
        event(),
    ] };
    const before = structuredClone(batch);
    const result = prepare(batch);
    assert.deepEqual(result.events.map(item => item.id), ['evt-13', 'evt-14', 'evt-15', 'evt-16']);
    assert.deepEqual(result.events.map(item => item.causedBy), [['evt-7', 'evt-15'], ['evt-13'], ['evt-12'], []]);
    assert.equal(Object.hasOwn(result.events[0], '_addedAt'), false);
    assert.deepEqual(batch, before);
    assert.deepEqual(context.existingEvents, [{ id: 'evt-12' }, { id: 'evt-7' }]);
    assert.equal(prepare({ events: [event()] }, { ...context, existingEvents: [] }).events[0].id, 'evt-1');
    const lastAvailable = { ...context, existingEvents: [{ id: `evt-${Number.MAX_SAFE_INTEGER - 1}` }] };
    assert.equal(prepare({ events: [event()] }, lastAvailable).events[0].id, `evt-${Number.MAX_SAFE_INTEGER}`);
    assert.throws(() => prepare({ events: [event(), event()] }, lastAvailable), /事件编号/);
});

test('dangling, guessed permanent, malformed and self causal references reject the batch', () => {
    for (const ref of ['evt-99', 'evt-14', 'new-0', 'new-3', 'new-1', 'new-1.5', 'evt-7x', 7, '']) {
        assert.throws(() => prepare({ events: [event({ causedBy: [ref] }), event()] }), /events\[0\]\.causedBy/, String(ref));
    }
    assert.throws(() => prepare({ events: [event({ causedBy: ['evt-7', 'evt-12', 'new-2'] }), event()] }), /causedBy/);
    assert.throws(() => prepare({ events: [event({ causedBy: 'evt-7' })] }), /causedBy/);
});

test('generated floor markers must map exactly to the supplied source, never clamped or reversed', () => {
    for (const marker of ['(#21)', '(#21-25)', '(#25-25)']) {
        const result = prepare({ events: [event({ summary: `正文 ${marker}` })] });
        const range = parseEventRange(result.events[0].summary);
        assert.equal(range.start, marker === '(#25-25)' ? 24 : 20);
        assert.equal(range.end, marker === '(#21)' ? 20 : 24);
    }
    for (const summary of ['无标注', '(#21-22)', '正文 (#0)', '正文 (#20-22)', '正文 (#21-26)',
        '正文 (#23-21)', '正文 (#999-1000)', '正文 (#21) 续文', '正文 (#21) (#22)', '正文 (#21.5-22)']) {
        assert.throws(() => prepare({ events: [event({ summary })] }), /events\[0\]\.summary/, summary);
    }
});

test('omitted update collections and empty events are legitimate; populated collections must be well formed', () => {
    assert.deepEqual(prepare({ events: [] }), {
        events: [], arcUpdates: [], factUpdates: [], keywords: [], newCharacters: [], characterAliasUpdates: [],
    });
    for (const field of ['events', 'arcUpdates', 'factUpdates', 'keywords', 'newCharacters', 'characterAliasUpdates']) {
        for (const value of [null, {}, '[]', [null]]) {
            assert.throws(() => prepare({ events: [], [field]: value }), error => error.message.startsWith(field));
        }
    }
    for (const fields of [{ title: '' }, { summary: {} }, { participants: [''] }, { memoryRole: 'unknown' }, { timeLabel: 2 }]) {
        assert.throws(() => prepare({ events: [event(fields)] }), /events\[0\]/);
    }
});

test('arc updates require complete trajectory and numeric progress, including legitimate zero', () => {
    const arc = { name: '小红', trajectory: '开始建立信任', progress: 0.7, newMoment: '归还了钥匙' };
    for (const fields of [{ trajectory: undefined }, { trajectory: '' }, { name: '' }, { progress: undefined },
        { progress: null }, { progress: '0.7' }, { progress: -0.1 }, { progress: 1.1 }, { progress: NaN }, { newMoment: {} }]) {
        assert.throws(() => prepare({ events: [], arcUpdates: [{ ...arc, ...fields }] }), /arcUpdates\[0\]/);
    }
    for (const progress of [0, 0.7, 1]) {
        assert.deepEqual(prepare({ events: [], arcUpdates: [{ ...arc, progress }] }).arcUpdates, [{ ...arc, progress }]);
    }
});

test('fact, character, keyword and alias updates project only valid update data', () => {
    const alias = { to: '李玄清', from: ['道长'], evidence: '#37 道长报出本名李玄清' };
    const result = prepare({
        events: [], newCharacters: [' 李玄清 '], keywords: [{ text: '钥匙', weight: '核心' }],
        factUpdates: [
            { s: ' 小红 ', p: '当前位置', o: '家中', isState: true, id: 'untrusted' },
            { s: '小红', p: '当前状态', retracted: true },
            { s: '小红', p: '对李玄清的看法', o: '信任', isState: true, trend: '投缘' },
        ],
        characterAliasUpdates: [alias],
    });
    assert.deepEqual(result.factUpdates, [
        { s: '小红', p: '位置', o: '家中', isState: true },
        { s: '小红', p: '状态', retracted: true },
        { s: '小红', p: '对李玄清的看法', o: '信任', isState: true, trend: '投缘' },
    ]);
    assert.deepEqual(result.characterAliasUpdates, [alias]);
    assert.deepEqual(result.newCharacters, ['李玄清']);
    assert.deepEqual(result.keywords, [{ text: '钥匙', weight: '核心' }]);
    for (const fact of [{ s: {}, p: '位置', o: '家' }, { s: '小红', p: '位置' },
        { s: '小红', p: '位置', o: '家', isState: 'false' }, { s: '小红', p: '位置', retracted: 'true' }]) {
        assert.throws(() => prepare({ events: [], factUpdates: [fact] }), /factUpdates\[0\]/);
    }
    assert.throws(() => prepare({ events: [], characterAliasUpdates: [{ ...alias, from: [] }] }), /characterAliasUpdates/);
});
