import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
    buildAutoLearnCreateOp,
    buildAutoLearnUpdateOp,
    mergeAutoLearnOps,
    snapshotAutoLearnFields,
} from '../auto-learn-merge.js';
import { resolveAutoLearnCharacter } from '../../providers/novelai/novel-character-learning.js';

function person(id, name, extra = {}) {
    return { id, enabled: true, name, aliases: [], type: 'girl', appearance: '', negativeTags: '', danbooruTag: '', outfits: [], dynamicStates: [], ...extra };
}

// 与学习规则里“补空字段”同构的最小实现，只用于测试注入。
function fillExisting(found, candidate) {
    if (!found.appearance && candidate.appear) {
        found.appearance = candidate.appear;
        return true;
    }
    return false;
}

const options = { mode: 'auto_update', resolve: resolveAutoLearnCharacter, fillExisting };

test('create op is appended to the latest library and keeps edits made during the run', () => {
    const learned = person('slot-1', '新人', { type: 'woman', appearance: 'red hair' });
    const ops = [buildAutoLearnCreateOp({ ...learned, groupId: 'g-old' }, { groupId: 'g1', candidate: { name: '新人', type: 'woman', appear: 'red hair' } })];
    // 学习期间用户新增了 B，并把 A 移进分组 g1
    const latest = {
        characters: [person('a', 'A', { groupId: 'g1' }), person('b', 'B')],
        groups: [{ id: 'g1', name: '组一' }],
    };
    const result = mergeAutoLearnOps(latest, ops, options);
    assert.equal(result.changed, true);
    assert.deepEqual(result.created, ['新人']);
    assert.deepEqual(result.characters.slice(0, 2), latest.characters);
    assert.equal(result.characters[2].id, 'slot-1');
    assert.equal(result.characters[2].groupId, 'g1');
    assert.equal(latest.characters.length, 2);
    // 目标分组已被删除：放未分组
    const noGroup = mergeAutoLearnOps({ characters: [person('b', 'B')], groups: [] }, ops, options);
    assert.equal('groupId' in noGroup.characters[1], false);
});

test('update op does not resurrect a deleted character and never overwrites a field the user changed', () => {
    const before = snapshotAutoLearnFields(person('a', 'A'));
    const learnedA = { ...person('a', 'A'), appearance: 'blue eyes', danbooruTag: 'a_(x)' };
    const op = buildAutoLearnUpdateOp(learnedA, before);
    assert.deepEqual(op.changes, { appearance: 'blue eyes', danbooruTag: 'a_(x)' });

    const deleted = mergeAutoLearnOps({ characters: [person('b', 'B')], groups: [] }, [op], options);
    assert.equal(deleted.changed, false);
    assert.deepEqual(deleted.characters.map(c => c.id), ['b']);

    const edited = mergeAutoLearnOps({
        characters: [person('a', 'A', { appearance: '用户写的', enabled: false })],
        groups: [],
    }, [op], options);
    assert.equal(edited.characters[0].appearance, '用户写的');
    assert.equal(edited.characters[0].danbooruTag, 'a_(x)');
    assert.equal(edited.characters[0].enabled, false);
});

test('create op whose character appeared during the run is skipped, or turned into a fill-only update', () => {
    const learned = person('slot-2', '阿璃', { type: 'girl', appearance: 'silver hair' });
    const op = buildAutoLearnCreateOp(learned, { candidate: { name: '阿璃', type: 'girl', appear: 'silver hair' } });
    // 同 id：跳过
    assert.equal(mergeAutoLearnOps({ characters: [person('slot-2', '别名')], groups: [] }, [op], options).changed, false);
    // 用户导入了同名角色（外貌为空）：只补空字段，不新增
    const imported = mergeAutoLearnOps({ characters: [person('imp', '阿璃')], groups: [] }, [op], options);
    assert.equal(imported.characters.length, 1);
    assert.equal(imported.characters[0].appearance, 'silver hair');
    assert.deepEqual(imported.updated, ['阿璃']);
    // 同名但已停用：与学习规则一致，跳过
    assert.equal(mergeAutoLearnOps({ characters: [person('imp', '阿璃', { enabled: false })], groups: [] }, [op], options).changed, false);
    // new_only 模式：已存在则什么都不写
    assert.equal(mergeAutoLearnOps({ characters: [person('imp', '阿璃')], groups: [] }, [op], { ...options, mode: 'new_only' }).changed, false);
});

test('novel-draw writes auto-learn results through the merge instead of overwriting the whole table', () => {
    const source = readFileSync(new URL('../../providers/novelai/novel-draw.js', import.meta.url), 'utf8');
    const start = source.indexOf('async function maybeAutoLearnFromTasks(');
    const end = source.indexOf('export async function applyNovelDrawRunAutoLearn');
    const body = source.slice(start, end);
    assert.ok(start > 0 && end > start);
    assert.match(body, /mergeAutoLearnOps\(characterLibraryFromSettings\(draft\)/);
    assert.doesNotMatch(body, /draft\.characterTags = tagsCopy/);
    assert.doesNotMatch(source, /draft\.characterTags = tagsCopy/);
});
