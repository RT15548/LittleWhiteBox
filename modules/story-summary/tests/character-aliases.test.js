import test from 'node:test';
import assert from 'node:assert/strict';

import {
    applyAliasMigrationsForRollback,
    applyCharacterAliasUpdates,
    buildAliasResolver,
    canonicalizeIncrementalSummaryData,
    formatCharacterAliasTableForAI,
    mergeCharacterAliasEdges,
} from '../data/character-aliases.js';

function baseSummary() {
    return {
        events: [
            {
                id: 'evt-1',
                title: '山门相逢',
                summary: '道长在山门拦下众人，说自己只认信物。 (#1-20)',
                participants: ['道长', '大小姐'],
                _addedAt: 19,
            },
        ],
        characters: {
            main: [
                { name: '道长', _addedAt: 19 },
                { name: '大小姐', _addedAt: 19 },
            ],
        },
        arcs: [
            { name: '道长', trajectory: '守口如瓶', progress: 0.2, moments: [{ text: '拦下众人', _addedAt: 19 }], _addedAt: 19 },
            { name: '李玄清', trajectory: '表明身份', progress: 0.4, moments: [{ text: '报出本名', _addedAt: 39 }], _addedAt: 39 },
        ],
        facts: [
            { id: 'f-1', s: '道长', p: '身份', o: '守山人', _addedAt: 19 },
            { id: 'f-2', s: '大小姐', p: '对道长的看法', o: '觉得可疑', trend: '陌生', _addedAt: 19 },
        ],
    };
}

test('character alias update canonicalizes structured names and keeps natural summaries', () => {
    const json = baseSummary();
    const result = applyCharacterAliasUpdates(json, [
        { to: '李玄清', from: ['道长'], evidence: '#37 道长报出本名李玄清' },
    ], 39);

    assert.equal(result.aliasChanged, true);
    assert.deepEqual(json.characterAliases, [
        { from: '道长', to: '李玄清', evidence: '#37 道长报出本名李玄清', _addedAt: 39 },
    ]);
    assert.deepEqual(json.characters.main.map(item => item.name), ['李玄清', '大小姐']);
    assert.deepEqual(json.events[0].participants, ['李玄清', '大小姐']);
    assert.equal(json.events[0].summary.includes('道长在山门'), true);
    assert.deepEqual(json.arcs.map(arc => arc.name), ['李玄清']);
    assert.deepEqual(json.facts.map(fact => `${fact.s}::${fact.p}`), [
        '李玄清::身份',
        '大小姐::对李玄清的看法',
    ]);
    assert.ok(result.migration?.before?.eventParticipants?.length);
});

test('missing explicit bridge produces no alias change', () => {
    const json = baseSummary();
    const result = applyCharacterAliasUpdates(json, [], 39);

    assert.equal(result.aliasChanged, false);
    assert.equal(result.migration, null);
    assert.deepEqual(json.characters.main.map(item => item.name), ['道长', '大小姐']);
    assert.equal(json.characterAliases, undefined);
});

test('placeholder alias example is ignored', () => {
    const json = baseSummary();
    const result = applyCharacterAliasUpdates(json, [
        {
            to: '统一主名，仅明确揭示身份时输出',
            from: ['旧称呼/外号/代号/职称'],
            evidence: '当前批次里的短证据',
        },
    ], 39);

    assert.equal(result.aliasChanged, false);
    assert.equal(json.characterAliases, undefined);
});

test('alias resolver follows transitive identity reveals', () => {
    const json = {
        characterAliases: [
            { from: '花名', to: '柳卿', evidence: '#8 使用花名', _addedAt: 8 },
        ],
        events: [{ id: 'evt-1', participants: ['花名'], summary: '花名递上名帖。', _addedAt: 8 }],
        characters: { main: [{ name: '花名', _addedAt: 8 }, { name: '柳如是', _addedAt: 20 }] },
        arcs: [{ name: '花名', trajectory: '隐藏身份', progress: 0.2, moments: [], _addedAt: 8 }],
        facts: [{ id: 'f-1', s: '花名', p: '身份', o: '歌伎', _addedAt: 8 }],
    };

    applyCharacterAliasUpdates(json, [
        { to: '柳如是', from: ['柳卿'], evidence: '#21 柳卿承认本名柳如是' },
    ], 21);

    const resolver = buildAliasResolver(json.characterAliases);
    assert.equal(resolver.resolveName('花名'), '柳如是');
    assert.deepEqual(json.events[0].participants, ['柳如是']);
    assert.deepEqual(json.characters.main.map(item => item.name), ['柳如是']);
});

test('existing alias table canonicalizes later incremental data without a new alias update', () => {
    const parsed = {
        events: [{ id: 'evt-2', participants: ['道长', '大小姐'], summary: '道长收下信物。' }],
        newCharacters: ['道长'],
        arcUpdates: [{ name: '道长', trajectory: '收下信物', progress: 0.5 }],
        factUpdates: [
            { s: '道长', p: '身份', o: '守山人', isState: true },
            { s: '大小姐', p: '对道长的看法', o: '稍微信任', isState: true, trend: '投缘' },
        ],
    };

    canonicalizeIncrementalSummaryData(parsed, [
        { from: '道长', to: '李玄清', evidence: '#37', _addedAt: 39 },
    ]);

    assert.deepEqual(parsed.events[0].participants, ['李玄清', '大小姐']);
    assert.deepEqual(parsed.newCharacters, ['李玄清']);
    assert.equal(parsed.arcUpdates[0].name, '李玄清');
    assert.deepEqual(parsed.factUpdates.map(fact => `${fact.s}::${fact.p}`), [
        '李玄清::身份',
        '大小姐::对李玄清的看法',
    ]);
});

test('alias update target can point to an existing alias and still stores the canonical name', () => {
    const result = mergeCharacterAliasEdges([
        { from: '道长', to: '李玄清', evidence: '#37', _addedAt: 39 },
    ], [
        { to: '道长', from: ['某某先生'], evidence: '#42 某某先生就是道长' },
    ], 42);

    assert.deepEqual(result.accepted, [
        { from: '某某先生', to: '李玄清', evidence: '#42 某某先生就是道长', _addedAt: 42 },
    ]);
});

test('conflicting alias update does not rebind an existing alias source', () => {
    const result = mergeCharacterAliasEdges([
        { from: '道长', to: '李玄清', evidence: '#37 道长报出本名李玄清', _addedAt: 39 },
    ], [
        { to: '王玄清', from: ['道长'], evidence: '#45 模型误把道长写成王玄清' },
    ], 45);

    assert.deepEqual(result.accepted, []);
    assert.deepEqual(result.aliases, [
        { from: '道长', to: '李玄清', evidence: '#37 道长报出本名李玄清', _addedAt: 39 },
    ]);
    assert.deepEqual(result.conflicts, [
        {
            from: '道长',
            existingTo: '李玄清',
            rejectedTo: '王玄清',
            evidence: '#45 模型误把道长写成王玄清',
            _addedAt: 45,
        },
    ]);
});

test('alias migration restores pre-reveal structures on rollback', () => {
    const json = baseSummary();
    const result = applyCharacterAliasUpdates(json, [
        { to: '李玄清', from: ['道长'], evidence: '#37 道长报出本名李玄清' },
    ], 39);

    applyAliasMigrationsForRollback(json, [result.migration], 19);
    json.events = json.events.filter(event => (event._addedAt ?? 0) <= 19);
    json.arcs = json.arcs.filter(arc => (arc._addedAt ?? 0) <= 19);
    json.facts = json.facts.filter(fact => (fact._addedAt ?? 0) <= 19);
    json.characterAliases = (json.characterAliases || []).filter(alias => (alias._addedAt ?? 0) <= 19);

    assert.deepEqual(json.events[0].participants, ['道长', '大小姐']);
    assert.deepEqual(json.characters.main.map(item => item.name), ['道长', '大小姐']);
    assert.deepEqual(json.arcs.map(arc => arc.name), ['道长']);
    assert.deepEqual(json.facts.map(fact => `${fact.s}::${fact.p}`), [
        '道长::身份',
        '大小姐::对道长的看法',
    ]);
    assert.deepEqual(json.characterAliases, []);
});

test('alias table formats canonical groups for prompt context', () => {
    const text = formatCharacterAliasTableForAI({
        characterAliases: [
            { from: '道长', to: '李玄清', evidence: '#37', _addedAt: 39 },
            { from: '某某先生', to: '李玄清', evidence: '#42', _addedAt: 42 },
        ],
    });

    assert.equal(text, '- 李玄清：道长、某某先生');
});
