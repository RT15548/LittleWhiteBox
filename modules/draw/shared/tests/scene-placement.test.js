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
    assert.equal(source.sourceText.slice(0, source.points[1].offset).endsWith('第二段。'), true);
    assert.equal(source.sourceText.slice(0, source.points[2].offset).endsWith('第三段。'), true);
    assert.equal(source.numberedContent, '第一段。【插图点 1】\n第二段。【插图点 2】 第三段。【插图点 3】');
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
