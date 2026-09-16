import test from 'node:test';
import assert from 'node:assert/strict';

import {
    applyCharacterAliasUpdates,
    buildAliasResolver,
    canonicalizeIncrementalSummaryData,
    formatCharacterAliasTableForAI,
    mergeCharacterAliasEdges,
    normalizeUserIdentityKey,
    replaceCharacterAliases,
    sanitizeCharacterAliasUpdates,
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
});

test('missing explicit bridge produces no alias change', () => {
    const json = baseSummary();
    const result = applyCharacterAliasUpdates(json, [], 39);

    assert.equal(result.aliasChanged, false);
    assert.deepEqual(json.characters.main.map(item => item.name), ['道长', '大小姐']);
    assert.equal(json.characterAliases, undefined);
});

test('current and saved-template alias placeholders are ignored', () => {
    const json = baseSummary();
    const currentResult = applyCharacterAliasUpdates(json, [
        {
            to: '既有总结中稳定使用的主名',
            from: ['称号/昵称/唯一缩写/不同语言或译名'],
            evidence: '简短的确认依据',
        },
    ], 39);
    const savedTemplateResult = applyCharacterAliasUpdates(json, [
        {
            to: '统一主名，仅明确揭示身份时输出',
            from: ['旧称呼/外号/代号/职称'],
            evidence: '当前批次里的短证据',
        },
    ], 39);

    assert.equal(currentResult.aliasChanged, false);
    assert.equal(savedTemplateResult.aliasChanged, false);
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

test('automatic aliases reject generic relationship forms of address', () => {
    const json = baseSummary();
    const updates = sanitizeCharacterAliasUpdates([
        { to: '李玄清', from: ['老婆', '道长'], evidence: '#37 的可靠身份依据' },
    ]);

    assert.deepEqual(updates, [
        { to: '李玄清', from: ['道长'], evidence: '#37 的可靠身份依据' },
    ]);
    assert.equal(applyCharacterAliasUpdates(json, updates, 39).aliasChanged, true);
    assert.deepEqual(json.characterAliases.map(alias => alias.from), ['道长']);
});

test('manual alias replacement keeps identity vocabulary outside historical content', () => {
    const json = baseSummary();
    const before = structuredClone(json);

    const result = replaceCharacterAliases(json, [
        { from: '李玄清', to: 'Gojo Satoru', evidence: '用户确认的不同语言名' },
        { from: '老婆', to: 'Gojo Satoru', evidence: '' },
    ], 100);

    assert.equal(result.aliasChanged, true);
    assert.deepEqual(json.characterAliases, [
        { from: '李玄清', to: 'Gojo Satoru', evidence: '用户确认的不同语言名', _addedAt: 100 },
        { from: '老婆', to: 'Gojo Satoru', evidence: '', _addedAt: 100 },
    ]);
    assert.deepEqual(
        { events: json.events, characters: json.characters, arcs: json.arcs, facts: json.facts },
        { events: before.events, characters: before.characters, arcs: before.arcs, facts: before.facts },
    );
});

test('manual alias replacement rejects conflicting and circular mappings', () => {
    assert.throws(() => replaceCharacterAliases(baseSummary(), [
        { from: '小悟', to: '五条悟' },
        { from: '小悟', to: '夏油杰' },
    ], 100), /重复指向/);
    assert.throws(() => replaceCharacterAliases(baseSummary(), [
        { from: '小悟', to: '五条悟' },
        { from: '五条悟', to: '小悟' },
    ], 100), /循环/);
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

test('USER identity normalization ignores internal whitespace and invisible characters', () => {
    const expected = normalizeUserIdentityKey('白帝');

    assert.equal(normalizeUserIdentityKey(' 白  帝 '), expected);
    assert.equal(normalizeUserIdentityKey('白\u200B帝'), expected);
    assert.equal(normalizeUserIdentityKey('ＢＬＵＥ'), normalizeUserIdentityKey('blue'));
});
