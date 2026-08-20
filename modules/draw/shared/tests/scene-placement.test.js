import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createSceneSource,
    hashSceneSource,
    stripScenePointMarkers,
} from '../scene-source.js';
import {
    ScenePlacementError,
    assertSceneSourceUnchanged,
    insertScenePlacements,
    settleSceneSlotPlaceholders,
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

test('scene placement cleanup restores an untouched message or keeps only completed slots', () => {
    const original = '第一段。第二段。';
    const withSlots = '第一段。\n[image:a]\n第二段。\n[image:b]';
    assert.equal(settleSceneSlotPlaceholders({
        currentText: withSlots,
        originalText: original,
        allSlotIds: ['a', 'b'],
        completedSlotIds: ['a'],
        successCount: 0,
    }), original);
    assert.equal(settleSceneSlotPlaceholders({
        currentText: withSlots,
        originalText: original,
        allSlotIds: ['a', 'b'],
        completedSlotIds: ['a'],
        successCount: 1,
    }), '第一段。\n[image:a]\n第二段。');
});
