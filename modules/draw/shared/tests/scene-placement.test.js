import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
    createSceneSource,
    hashSceneSource,
    normalizeMessageSceneSourceText,
    stripScenePointMarkers,
} from '../scene-source.js';
import {
    ScenePlacementError,
    assertSceneSourceUnchanged,
    commitSceneSlotDelivery,
    insertScenePlacements,
    insertScenePlacementsPreservingSlots,
    isSceneSlotAlive,
    removeSceneSlotPlaceholders,
    setActiveMessageText,
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

// draw-common.js pulls in SillyTavern-only modules, so read the real default
// rule list out of its source instead of importing it.
const DEFAULT_MESSAGE_FILTER_RULES = Array.from(
    readFileSync(new URL('../draw-common.js', import.meta.url), 'utf8')
        .match(/export const DEFAULT_MESSAGE_FILTER_RULES = \[[\s\S]*?\n\];/)[0]
        .matchAll(/start:\s*'([^']*)',\s*end:\s*'([^']*)'/g),
    ([, start, end]) => ({ start, end }),
);

const NESTED_BLOCK_RULES = [
    { start: '<think>', end: '</think>' },
    { start: '<UpdateVariable>', end: '</UpdateVariable>' },
    { start: '<state>', end: '</state>' },
    { start: '<konatan_planning~>', end: '</konatan_planning~>' },
    { start: '<tucao>', end: '</tucao>' },
];

test('scene source removes a block that mentions the start tag of an earlier rule', () => {
    const storyOne = '她推开门，雨还在下。';
    const storyTwo = '“你来了。”他说。';
    const original = [
        '<konatan_planning~>先想想要不要写 <UpdateVariable> 这个标签。</konatan_planning~>',
        '<tucao>吐槽一下。</tucao>',
        storyOne,
        storyTwo,
        '<UpdateVariable>_.set(\'hp\', 1);</UpdateVariable>',
    ].join('\n');

    const source = createSceneSource(original, { filterRules: NESTED_BLOCK_RULES });

    assert.equal(source.content, `${storyOne}\n${storyTwo}`);
    assert.equal(source.content.includes('konatan'), false);
    assert.equal(source.content.includes('tucao'), false);
    assert.equal(source.content.includes('UpdateVariable'), false);
    assert.equal(source.points.length, 2);
    assert.equal(original.slice(0, source.points[0].offset).endsWith(storyOne), true);
    assert.equal(original.slice(0, source.points[1].offset).endsWith(storyTwo), true);
    assert.equal(original.slice(source.points[1].offset).startsWith('\n<UpdateVariable>'), true);
});

test('scene source keeps a start tag without an end tag and still applies later rules', () => {
    const original = '前文 <state> 没有结束的标签。<think>隐藏</think>后文。';
    const source = createSceneSource(original, {
        filterRules: [
            { start: '<state>', end: '</state>' },
            { start: '<think>', end: '</think>' },
        ],
    });

    assert.equal(source.content, '前文 <state> 没有结束的标签。后文。');
});

test('scene source applies default one-sided rules in list order after block rules', () => {
    const original = '<think>推理里提到 <UpdateVariable> 标签</think>正文一。<options>A</options>正文二。';
    const source = createSceneSource(original, { filterRules: DEFAULT_MESSAGE_FILTER_RULES });
    assert.equal(source.content, '正文一。正文二。');

    // The trailing `'' -> </think>` rule drops everything up to a dangling closing tag.
    const dangling = createSceneSource('推理残留</think>正文。<state>x</state>', { filterRules: DEFAULT_MESSAGE_FILTER_RULES });
    assert.equal(dangling.content, '正文。');

    const truncating = createSceneSource('正文。<cut>后面的都丢弃。', {
        filterRules: [{ start: '<cut>', end: '' }, { start: '<think>', end: '</think>' }],
    });
    assert.equal(truncating.content, '正文。');
});

test('scene source applies block rules before one-sided rules regardless of list order', () => {
    const original = '<a>1<cut>2</a>3<a>4</a>';
    const block = { start: '<a>', end: '</a>' };
    const cut = { start: '<cut>', end: '' };

    assert.equal(createSceneSource(original, { filterRules: [block, cut] }).content, '3');
    assert.equal(createSceneSource(original, { filterRules: [cut, block] }).content, '3');
});

const FRIEND_RULES = [
    { start: '<think>', end: '</think>' },
    { start: '<thinking>', end: '</thinking>' },
    { start: '<system>', end: '</system>' },
    { start: '<meta>', end: '</meta>' },
    { start: '<options>', end: '</options>' },
    { start: '<WorldState>', end: '</WorldState>' },
    { start: '<state>', end: '</state>' },
    { start: '<UpdateVariable>', end: '</UpdateVariable>' },
    { start: '<—', end: '—>' },
    { start: '', end: '<think>' },
    { start: '<konatan_planning~>', end: '</konatan_planning~>' },
    { start: '【', end: '”' },
    { start: '<tucao>', end: '</tucao>' },
    { start: '<rule_world_core>', end: '</rule_world_core>' },
];

test('scene source keeps a planning block intact when a one-sided rule sits mid-list', () => {
    const storyOne = 'Story sentence one。';
    const storyTwo = 'Story sentence two。';
    const original = [
        '<konatan_planning~>',
        ' thinking that mentions <rule_check> <options> <UpdateVariable> ',
        '</konatan_planning~>',
        '<tucao>t</tucao>',
        `${storyOne}${storyTwo}`,
        '<options>real options</options>',
        '<UpdateVariable>real</UpdateVariable>',
    ].join('\n');

    const source = createSceneSource(original, { filterRules: FRIEND_RULES });

    assert.equal(source.content, `${storyOne}${storyTwo}`);
    assert.equal(source.points.length, 2);
    assert.equal(original.slice(0, source.points[0].offset).endsWith(storyOne), true);
    assert.equal(original.slice(0, source.points[1].offset).endsWith(storyTwo), true);
    assert.equal(original.slice(source.points[1].offset).startsWith('\n<options>real options'), true);
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
    assert.equal(normalizeMessageSceneSourceText('正文。[image : slot-1]'), '正文。');
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

test('adding two images keeps existing slots and synchronizes only the active swipe', () => {
    const original = '第一段。[image:old-1]第二段。[image:old-2]第三段。[image:old-3]尾声。';
    const source = createSceneSource(normalizeMessageSceneSourceText(original));
    const planned = insertScenePlacementsPreservingSlots(original, ['new-1', 'new-2'].map(slotId => ({
        placement: { mode: 'source', offset: source.points[1].offset, sourceHash: source.sourceHash },
        content: `[image:${slotId}]`,
    })));
    assert.equal(planned, '第一段。[image:old-1]第二段。[image:old-2][image:new-1][image:new-2]第三段。[image:old-3]尾声。');

    const message = { mes: original, swipe_id: 1, swipes: ['另一版本', original] };
    setActiveMessageText(message, planned);
    assert.equal(removeSceneSlotPlaceholders(message.mes, ['new-1', 'new-2']), original);
    assert.deepEqual(message.swipes, ['另一版本', planned]);
});

test('tail additions follow existing trailing slots, including an image-only message', () => {
    for (const original of ['正文。\n[image:old-1][image:old-2]', '[image:old-1][image:old-2]']) {
        assert.equal(insertScenePlacementsPreservingSlots(original, [
            { placement: { mode: 'tail' }, content: '[image:new-1]' },
            { placement: { mode: 'tail' }, content: '[image:new-2]' },
        ], { block: true }), `${original}\n[image:new-1]\n[image:new-2]`);
    }
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

test('a closing tag whose opening tag is missing drops the text before it, for tag-pair rules', () => {
    const rules = [{ start: '<konatan_planning~>', end: '</konatan_planning~>' }, { start: '<options>', end: '</options>' }];
    const dangling = createSceneSource('推理残留。第二句。</konatan_planning~>\n正文一。<options>A</options>正文二。', { filterRules: rules });
    assert.equal(dangling.content, '正文一。正文二。');
    assert.ok(dangling.points.every(point => point.offset > '推理残留。第二句。</konatan_planning~>'.length));

    // A complete block behaves as before, and an unclosed opener is left alone (no closing tag to drop up to).
    assert.equal(createSceneSource('<konatan_planning~>推理</konatan_planning~>正文。', { filterRules: rules }).content, '正文。');
    assert.equal(
        createSceneSource('前文<konatan_planning~>没写完', { filterRules: rules }).content,
        '前文<konatan_planning~>没写完',
    );
    // Non-tag rules (such as 【 … ”) never get this treatment: a lone ” is ordinary dialogue punctuation.
    assert.equal(createSceneSource('他说：“好。”然后走了。', { filterRules: [{ start: '【', end: '”' }] }).content, '他说：“好。”然后走了。');
});

test('a lost opening tag whose thinking mentions another rule tag does not hand the story to that rule', () => {
    const rules = [
        { start: '<UpdateVariable>', end: '</UpdateVariable>' },
        { start: '<konatan_planning~>', end: '</konatan_planning~>' },
        { start: '<options>', end: '</options>' },
    ];
    const story = '雨停了。她推开门，说：“我回来了。”\n';
    const message = `先写 <UpdateVariable> 再引用“她推开门”这句。</konatan_planning~>\n${story}<options>A</options><UpdateVariable>x</UpdateVariable>`;
    const source = createSceneSource(message, { filterRules: rules });
    assert.equal(source.content, story.trim());
    // Every scene point lies in the story, i.e. after the dangling closing tag.
    const storyStart = message.indexOf(story);
    assert.ok(source.points.length > 0 && source.points.every(point => point.offset >= storyStart));
    // The anchor sentence also appears inside the thinking; placement still lands in the story.
    const inserted = insertScenePlacements(message, [{ placement: { mode: 'source', offset: source.points[0].offset, sourceHash: source.sourceHash }, content: '[image:slot-a]' }]);
    assert.ok(inserted.indexOf('[image:slot-a]') >= storyStart);
});
