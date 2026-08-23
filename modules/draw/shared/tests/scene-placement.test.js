import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createSceneSource,
    hashSceneSource,
    normalizeMessageSceneSourceText,
    stripScenePointMarkers,
} from '../scene-source.js';
import {
    ScenePlacementError,
    assertSceneSourceUnchanged,
    commitRecoverableScenePlacements,
    commitSceneSlotReplacement,
    commitSceneSlotDelivery,
    commitSettledScenePlacements,
    getSceneSlotIds,
    insertScenePlacements,
    insertScenePlacementsPreservingSlots,
    isSceneSlotAlive,
    removeSceneSlotPlaceholders,
} from '../scene-placement.js';

test('scene source keeps original offsets while hiding image markers and filtered sections', () => {
    const source = createSceneSource(
        '第一段。[image:slot-a]\n<think>隐藏推理</think>第二段。[ebook-image:slot-b] 第三段。',
        { filterRules: [{ start: '<think>', end: '</think>' }] },
    );

    assert.equal(source.content, '第一段。\n第二段。 第三段。');
    assert.equal(source.points.length, 3);

    // Every point must reference the unfiltered original snapshot, not the view.
    assert.equal(source.sourceText.slice(0, source.points[0].offset).endsWith('第一段。'), true);
    assert.equal(source.sourceText.slice(source.points[1].offset).startsWith('第三段。'), true);
    assert.equal(source.sourceText.slice(0, source.points[2].offset).endsWith('第三段。'), true);
    assert.equal(source.numberedContent, '第一段。【插图点 1】\n第二段。 【插图点 2】第三段。【插图点 3】');
    assert.equal(stripScenePointMarkers(source.numberedContent), source.content);
});

test('scene source treats unterminated tail text as the final illustration point', () => {
    const source = createSceneSource('夜色降临\n\n她推开门');
    assert.equal(source.points.length, 2);
    // A paragraph point sits after the blank lines so the image lands between paragraphs.
    assert.equal(source.sourceText.slice(0, source.points[0].offset), '夜色降临\n\n');
    assert.equal(source.sourceText.slice(0, source.points[1].offset), '夜色降临\n\n她推开门');
    assert.equal(source.numberedContent, '夜色降临\n\n【插图点 1】她推开门【插图点 2】');
});

test('scene source hash follows the full snapshot including existing image markers', () => {
    const withMarker = createSceneSource('正文。[image:slot-1]');
    const withoutMarker = createSceneSource('正文。');
    assert.notEqual(withMarker.sourceHash, withoutMarker.sourceHash);
    assert.equal(withMarker.sourceHash, hashSceneSource('正文。[image:slot-1]'));
});

test('message Scene Source normalization removes only provider image placeholders', () => {
    assert.equal(
        normalizeMessageSceneSourceText('正文。[image:slot-1][ebook-image:keep][tavern-image:keep]'),
        '正文。[ebook-image:keep][tavern-image:keep]',
    );
});

test('scene source ignores punctuation that is not a safe illustration boundary', () => {
    const technical = createSceneSource('圆周率是 3.14。版本 v1.2.3 已发布。访问 https://example.com/path。');
    assert.equal(technical.points.length, 3);
    assert.equal(technical.numberedContent, '圆周率是 3.14。【插图点 1】版本 v1.2.3 已发布。【插图点 2】访问 https://example.com/path。【插图点 3】');

    const abbreviation = createSceneSource('Dr. Smith走了……然后呢?');
    assert.equal(abbreviation.points.length, 2);
    assert.equal(abbreviation.numberedContent.startsWith('Dr.【插图点'), false);

    const attribution = createSceneSource('“真的吗？”她问。');
    assert.equal(attribution.points.length, 1);
    assert.equal(attribution.numberedContent, '“真的吗？”她问。【插图点 1】');

    const punctuationOnly = createSceneSource('好。\n\n。\n\n真的。');
    assert.equal(punctuationOnly.points.length, 2);

    const roleplay = createSceneSource('*她缓缓转过身。* “你终于来了。” *他点了点头。* “等你很久了。”');
    assert.equal(roleplay.points.length, 4);
    assert.equal(
        roleplay.numberedContent,
        '*她缓缓转过身。* 【插图点 1】“你终于来了。” 【插图点 2】*他点了点头。* 【插图点 3】“等你很久了。”【插图点 4】',
    );

    const english = createSceneSource('He left. Next.');
    const englishInserted = insertScenePlacements(english.sourceText, [{
        placement: {
            mode: 'source',
            insertAfter: 1,
            offset: english.points[0].offset,
            sourceHash: english.sourceHash,
        },
        content: '[image:english]',
    }], { block: true });
    assert.equal(englishInserted, 'He left. \n[image:english]\nNext.');
});

test('scene source distinguishes user-authored illustration-point text from generated markers', () => {
    const source = createSceneSource('原文写着【插图点 1】，然后继续。');
    assert.equal(source.numberedContent, '原文写着【原文中的“插图点 1”字样】，然后继续。【插图点 1】');
    assert.equal(stripScenePointMarkers(source.numberedContent), source.content);
});

test('scene placement inserts all markers in one batch at original offsets', () => {
    const source = createSceneSource('第一段。第二段。第三段。');
    const placements = source.points.map((point) => ({
        mode: 'source',
        insertAfter: point.number,
        offset: point.offset,
        sourceHash: source.sourceHash,
    }));

    const result = insertScenePlacements(source.sourceText, [
        { placement: placements[0], content: '[image:a]' },
        { placement: placements[2], content: '[image:c]' },
    ]);
    assert.equal(result, '第一段。[image:a]第二段。第三段。[image:c]');

    // Two images may share the same point; request order is preserved at that offset.
    const shared = insertScenePlacements(source.sourceText, [
        { placement: placements[1], content: '[image:first]' },
        { placement: placements[1], content: '[image:second]' },
    ]);
    assert.equal(shared, '第一段。第二段。[image:first][image:second]第三段。');
});

test('recoverable placement stages new slots without removing existing image slots', () => {
    const source = createSceneSource('第一段。第二段。');
    const original = '第一段。[image:old-slot]第二段。';
    const result = insertScenePlacementsPreservingSlots(original, [{
        placement: {
            mode: 'source',
            offset: source.points[1].offset,
            sourceHash: source.sourceHash,
        },
        content: '[image:new-slot]',
    }], { block: true });

    assert.equal(result, '第一段。[image:old-slot]第二段。\n[image:new-slot]');
    assert.deepEqual(getSceneSlotIds(result), ['old-slot', 'new-slot']);
});

test('scene placement rejects changed text and foreign placements without a tail fallback', () => {
    const source = createSceneSource('原始正文。');
    const placement = {
        mode: 'source',
        insertAfter: 1,
        offset: source.points[0].offset,
        sourceHash: source.sourceHash,
    };

    assert.throws(
        () => insertScenePlacements('被改写的正文。', [{ placement, content: '[image:a]' }]),
        (error) => error instanceof ScenePlacementError && error.code === 'SCENE_SOURCE_CHANGED',
    );
    assert.throws(
        () => insertScenePlacements(source.sourceText, [{ placement: { ...placement, offset: 99 }, content: '[image:a]' }]),
        (error) => error instanceof ScenePlacementError,
    );
    assert.throws(
        () => assertSceneSourceUnchanged('别的正文', source.sourceHash),
        (error) => error.code === 'SCENE_SOURCE_CHANGED',
    );

    const tail = insertScenePlacements('手动正文。', [{
        placement: { mode: 'tail' },
        content: '[image:manual]',
    }]);
    assert.equal(tail, '手动正文。[image:manual]');
});

// 本地链路的排版提交：基准是规划文本，只剔掉没有任何结果的槽位。
// 失败也算有结果（要留下可重试的失败卡），所以只有从未产出的槽位才会被剔除。
// 注意结果不是「原文逐字复原」：block 插入时补的换行与正文原有的换行在文本上完全同形，
// 删除时只能折叠成一个换行，否则当占位符原本就位于两段之间时会把两段粘在一起。
test('local placement commit keeps every slot that produced a result and drops the rest', () => {
    const planned = '第一段。\n[image:a]\n第二段。\n[image:b]';
    assert.equal(commitSettledScenePlacements(planned, {
        allSlotIds: ['a', 'b'],
        settledSlotIds: [],
    }), '第一段。\n第二段。');
    assert.equal(commitSettledScenePlacements(planned, {
        allSlotIds: ['a', 'b'],
        settledSlotIds: ['a'],
    }), '第一段。\n[image:a]\n第二段。');
    assert.equal(commitSettledScenePlacements(planned, {
        allSlotIds: ['a', 'b'],
        settledSlotIds: ['a', 'b'],
    }), planned);
});

// 后台链路的结算跑在当前活着的正文上，用的就是这个原语。结算期间用户可能改过正文、
// 也可能有别的任务插入了自己的槽位，删除必须严格限定在指定的槽位上。
test('slot removal on live text never touches edits or slots that belong to someone else', () => {
    const edited = '用户改过的第一段。\n[image:a]\n用户新加的一句。\n[image:other-job]\n第二段。\n[image:b]';
    assert.equal(
        removeSceneSlotPlaceholders(edited, ['b']),
        '用户改过的第一段。\n[image:a]\n用户新加的一句。\n[image:other-job]\n第二段。',
    );
});

// 用户在生成期间手动删掉了某个槽位：任何清理都不得把它加回来，也不得影响同批其他槽位。
test('slot removal on live text does not resurrect a slot the user deleted', () => {
    const userDeletedB = '第一段。\n[image:a]\n第二段。';
    assert.equal(removeSceneSlotPlaceholders(userDeletedB, ['b']), userDeletedB);
});

// 交付前必须逐槽位确认它还在正文里：用户删掉的槽位是他对这张图的最终意见，
// 交付流程重建它就是在跟用户对抗。
test('slot liveness is checked per slot and never matches a different id', () => {
    const text = '第一段。\n[image:slot-a]\n第二段。';
    assert.equal(isSceneSlotAlive(text, 'slot-a'), true);
    assert.equal(isSceneSlotAlive(text, 'slot-b'), false);
    // 前缀不得误命中：slot-a 存在不代表 slot-a2 存在。
    assert.equal(isSceneSlotAlive(text, 'slot-a2'), false);
    assert.equal(isSceneSlotAlive('第一段。\n[image:slot-a2]', 'slot-a'), false);
    assert.equal(isSceneSlotAlive(text, ''), false);
});

test('recoverable placement save failure removes only this batch slots and preserves concurrent edits', async () => {
    const message = { mes: 'story\n[image:old-slot]' };
    const saveError = new Error('save failed');

    await assert.rejects(commitRecoverableScenePlacements({
        getCurrentChatId: () => 'chat-1',
        getCurrentMessage: () => message,
        expectedChatId: 'chat-1',
        messageId: 3,
        message,
        originalText: 'story\n[image:old-slot]',
        plannedText: 'story\n[image:old-slot]\n[image:ours]\n[image:other]',
        slotIds: ['ours'],
        persist() {
            message.mes += '\nuser edit';
            throw saveError;
        },
    }), error => error === saveError);

    assert.equal(message.mes, 'story\n[image:old-slot]\n[image:other]\nuser edit');
});

test('recoverable placement keeps the active swipe synchronized during commit and rollback', async () => {
    const message = { mes: 'story', swipe_id: 1, swipes: ['other', 'story'] };
    await assert.rejects(commitRecoverableScenePlacements({
        getCurrentChatId: () => 'chat-1',
        getCurrentMessage: () => message,
        expectedChatId: 'chat-1',
        messageId: 0,
        message,
        originalText: 'story',
        plannedText: 'story\n[image:ours]',
        slotIds: ['ours'],
        persist: async () => { throw new Error('save failed'); },
    }));

    assert.equal(message.mes, 'story');
    assert.deepEqual(message.swipes, ['other', 'story']);
});

test('local replacement persists the safe superset before deleting old slots', async () => {
    const message = { mes: 'story\n[image:old]' };
    const snapshots = [];
    await commitSceneSlotReplacement({
        message,
        stagedText: 'story\n[image:old]\n[image:new]',
        replacedSlotIds: ['old'],
        persist: () => { snapshots.push(message.mes); },
    });

    assert.deepEqual(snapshots, [
        'story\n[image:old]\n[image:new]',
        'story\n[image:new]',
    ]);
    assert.equal(message.mes, 'story\n[image:new]');
});

test('local replacement restores the safe superset when deleting old slots has an uncertain save result', async () => {
    const message = { mes: 'story\n[image:old]' };
    let saves = 0;
    await assert.rejects(commitSceneSlotReplacement({
        message,
        stagedText: 'story\n[image:old]\n[image:new]',
        replacedSlotIds: ['old'],
        persist: () => {
            if (++saves === 2) throw new Error('response lost');
        },
    }));

    assert.equal(message.mes, 'story\n[image:old]\n[image:new]');
});

test('scene slot delivery rolls back only its own facts when the slot is deleted mid-write', async () => {
    const order = [];
    let livenessChecks = 0;
    const committed = await commitSceneSlotDelivery({
        committedEarly: true,
        resolveTarget: () => ++livenessChecks === 1 ? {} : null,
        guard: async () => { order.push('fence'); },
        persist: async () => { order.push('store'); },
        rollbackPersisted: async () => { order.push('delete-image'); },
        select: async () => { order.push('select'); },
    });

    assert.equal(committed, false);
    assert.deepEqual(order, ['fence', 'store', 'fence', 'delete-image']);
});

test('scene slot delivery clears selection and image when deletion races with selection', async () => {
    const order = [];
    let livenessChecks = 0;
    const committed = await commitSceneSlotDelivery({
        committedEarly: true,
        resolveTarget: () => ++livenessChecks < 3 ? {} : null,
        guard: async () => { order.push('fence'); },
        persist: async () => { order.push('store'); },
        rollbackPersisted: async () => { order.push('delete-image'); },
        select: async () => { order.push('select'); },
        rollbackSelection: async () => { order.push('clear-selection'); },
    });

    assert.equal(committed, false);
    assert.deepEqual(order, [
        'fence', 'store', 'fence', 'select', 'fence', 'clear-selection', 'fence', 'delete-image',
    ]);
});
