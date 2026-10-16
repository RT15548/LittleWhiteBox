import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTextEdits } from '../tools/text-edit.js';

test('Shared applyTextEdits replaces short and multiline text fragments', () => {
    const result = applyTextEdits('她低头看杯子。\n杯沿还有水痕。\n她笑了。', [
        { oldString: '低头看', newString: '慢慢低头看' },
        { oldString: '杯沿还有水痕。\n她笑了。', newString: '杯沿那点水痕还没干。\n她笑了一下。' },
    ]);

    assert.equal(result.ok, true);
    assert.equal(result.content, '她慢慢低头看杯子。\n杯沿那点水痕还没干。\n她笑了一下。');
    assert.deepEqual(result.results.map((item) => item.replacements), [1, 1]);
});

test('Shared applyTextEdits reports multiple matches with line contexts unless replaceAll is set', () => {
    const content = [
        '他看着窗外那些珍稀动物，心里发沉。',
        '园里养着几只珍稀动物，每天有人喂食。',
        '保护这些珍稀动物是他们的职责。',
    ].join('\n');
    const failed = applyTextEdits(content, [
        { oldString: '珍稀动物', newString: '怪物' },
    ]);

    assert.equal(failed.ok, false);
    assert.equal(failed.results[0].error, 'multiple_matches');
    assert.match(failed.results[0].suggestion, /expand oldString/);
    assert.equal(failed.results[0].matches.length, 3);
    assert.equal(failed.results[0].matches[0].line, 1);
    assert.match(failed.results[0].matches[1].context, /园里养着/);

    const replaced = applyTextEdits(content, [
        { oldString: '珍稀动物', newString: '怪物', replaceAll: true },
    ]);
    assert.equal(replaced.ok, true);
    assert.equal((replaced.content.match(/怪物/g) || []).length, 3);
});

test('Shared applyTextEdits tolerates whitespace differences for long fragments', () => {
    const content = [
        '开头。',
        '第一段看见了光。',
        '',
        '  第二段，停在门口。',
        '第三段才慢慢回头。',
        '结尾。',
    ].join('\n');
    const result = applyTextEdits(content, [
        {
            oldString: '第一段看见了光。\n第二段,停在门口。\n\n第三段才慢慢回头。',
            newString: '第一段没有立刻说话。\n第二段把手收回去。',
        },
    ]);

    assert.equal(result.ok, true);
    assert.equal(result.results[0].matchedBy, 'flexible_whitespace');
    assert.equal(result.content, [
        '开头。',
        '第一段没有立刻说话。',
        '第二段把手收回去。',
        '结尾。',
    ].join('\n'));
});

test('Shared applyTextEdits replaces line ranges in descending order automatically', () => {
    const content = ['一', '二', '三', '四', '五', '六', '七', '八'].join('\n');
    const result = applyTextEdits(content, [
        { startLine: 2, endLine: 3, newString: '二三合并' },
        { startLine: 6, endLine: 7, newString: '6: 六改\n7: 七改\n8: 七后新增' },
    ]);

    assert.equal(result.ok, true);
    assert.equal(result.results[0].matchedBy, 'line_range');
    assert.match(result.results[1].oldPreview, /6: 六/);
    assert.match(result.results[1].newPreview, /6: 六改/);
    assert.equal(result.content, ['一', '二三合并', '四', '五', '六改', '七改', '七后新增', '八'].join('\n'));
});

test('Shared applyTextEdits ignores stray optional mode fields from model tool arguments', () => {
    const content = ['一', '二', '三', '四'].join('\n');
    const lineRange = applyTextEdits(content, [
        {
            oldString: '二',
            startLine: 2,
            endLine: 3,
            insertAtLine: 2,
            newString: '二三合并',
        },
    ]);
    assert.equal(lineRange.ok, true);
    assert.equal(lineRange.results[0].matchedBy, 'line_range');
    assert.equal(lineRange.content, ['一', '二三合并', '四'].join('\n'));

    const insertion = applyTextEdits(content, [
        {
            oldString: '三',
            startLine: null,
            endLine: null,
            insertAtLine: 3,
            newString: '插入行',
        },
    ]);
    assert.equal(insertion.ok, true);
    assert.equal(insertion.results[0].matchedBy, 'line_insert');
    assert.equal(insertion.content, ['一', '二', '插入行', '三', '四'].join('\n'));

    const oldString = applyTextEdits(content, [
        {
            oldString: '二',
            startLine: null,
            endLine: null,
            insertAtLine: '',
            newString: '二三合并',
        },
    ]);
    assert.equal(oldString.ok, true);
    assert.equal(oldString.results[0].matchedBy, 'exact');
    assert.equal(oldString.content, ['一', '二三合并', '三', '四'].join('\n'));
});

test('Shared applyTextEdits accepts JSON-stringified edits with a warning and rejects invalid edit types', () => {
    const content = ['一', '二', '三'].join('\n');
    const parsed = applyTextEdits(content, JSON.stringify([
        { startLine: 2, endLine: 3, newString: '二三合并成一行' },
    ]));

    assert.equal(parsed.ok, true);
    assert.match(parsed.warning, /模型把 edits 发成了字符串/);
    assert.equal(parsed.content, ['一', '二三合并成一行'].join('\n'));

    const invalidString = applyTextEdits(content, '[{]');
    assert.equal(invalidString.ok, false);
    assert.equal(invalidString.results[0].error, 'invalid_edits_json_string');
    assert.match(invalidString.results[0].message, /received a string/);
    assert.match(invalidString.results[0].suggestion, /Do not JSON-stringify edits/);

    const objectValue = applyTextEdits(content, { startLine: 1, endLine: 1, newString: '甲' });
    assert.equal(objectValue.ok, false);
    assert.equal(objectValue.results[0].error, 'edits_must_be_array');
    assert.match(objectValue.results[0].message, /received object/);

    const missingValue = applyTextEdits(content);
    assert.equal(missingValue.ok, false);
    assert.equal(missingValue.results[0].error, 'missing_edits_array');
    assert.match(missingValue.results[0].message, /it was missing/);
});

test('Shared applyTextEdits repairs malformed JSON-like stringified line edits', () => {
    const content = ['一', '二', '三', '四'].join('\n');
    const malformed = '[{"startLine":2,"endLine":3,"newString":"她说："回来。"\n三也留下"}]';
    const result = applyTextEdits(content, malformed);

    assert.equal(result.ok, true);
    assert.match(result.warning, /不是标准 JSON/);
    assert.equal(result.content, ['一', '她说："回来。"', '三也留下', '四'].join('\n'));

    const multi = applyTextEdits(content, '[{"startLine":2,"endLine":2,"newString":"二："改""},{"insertAtLine":4,"newString":"四之前"}]');
    assert.equal(multi.ok, true);
    assert.equal(multi.content, ['一', '二："改"', '三', '四之前', '四'].join('\n'));

    const keyLikeText = applyTextEdits(content, '[{"startLine":2,"endLine":2,"newString":"正文里写着 "startLine":999，但这只是内容"}]');
    assert.equal(keyLikeText.ok, true);
    assert.equal(keyLikeText.content, ['一', '正文里写着 "startLine":999，但这只是内容', '三', '四'].join('\n'));

    const newStringFirst = applyTextEdits(content, '[{"newString":"二三合并成一行","startLine":2,"endLine":3}]');
    assert.equal(newStringFirst.ok, true);
    assert.equal(newStringFirst.content, ['一', '二三合并成一行', '四'].join('\n'));

    const newStringFirstWithKeyLikeText = applyTextEdits(content, '[{"newString":"正文里写着 "startLine":999，但这只是内容","startLine":2,"endLine":2}]');
    assert.equal(newStringFirstWithKeyLikeText.ok, true);
    assert.equal(newStringFirstWithKeyLikeText.content, ['一', '正文里写着 "startLine":999，但这只是内容', '三', '四'].join('\n'));

    const oldStringKeyLikeText = applyTextEdits(content, '[{"startLine":2,"endLine":2,"newString":"正文里写着 "oldString":假字段，但这只是内容"}]');
    assert.equal(oldStringKeyLikeText.ok, true);
    assert.equal(oldStringKeyLikeText.content, ['一', '正文里写着 "oldString":假字段，但这只是内容', '三', '四'].join('\n'));

    const braceSplitLikeText = applyTextEdits(content, '[{"startLine":2,"endLine":2,"newString":"文本 },{ "startLine":999 还在正文"}]');
    assert.equal(braceSplitLikeText.ok, true);
    assert.equal(braceSplitLikeText.content, ['一', '文本 },{ "startLine":999 还在正文', '三', '四'].join('\n'));
});

test('Shared applyTextEdits inserts text before, inside, and after line-numbered content', () => {
    const content = ['一', '二', '三'].join('\n');
    const result = applyTextEdits(content, [
        { insertAtLine: 1, newString: '开头' },
        { insertAtLine: 3, newString: '3: 中间甲\n4: 中间乙' },
        { insertAtLine: 4, newString: '结尾' },
    ]);

    assert.equal(result.ok, true);
    assert.equal(result.results[0].matchedBy, 'line_insert');
    assert.match(result.results[1].newPreview, /3: 中间甲/);
    assert.equal(result.content, ['开头', '一', '二', '中间甲', '中间乙', '三', '结尾'].join('\n'));

    const empty = applyTextEdits('', [
        { insertAtLine: 1, newString: '第一行' },
    ]);
    assert.equal(empty.ok, true);
    assert.equal(empty.content, '第一行');
});

test('Shared applyTextEdits deletes words, sentences, and line ranges with empty newString', () => {
    const oldStringDelete = applyTextEdits('她慢慢抬头。她没有说话。', [
        { oldString: '慢慢', newString: '' },
        { oldString: '她没有说话。', newString: '' },
    ]);

    assert.equal(oldStringDelete.ok, true);
    assert.equal(oldStringDelete.content, '她抬头。');

    const lineRangeDelete = applyTextEdits(['一', '二', '三', '四'].join('\n'), [
        { startLine: 2, endLine: 3, newString: '' },
    ]);

    assert.equal(lineRangeDelete.ok, true);
    assert.equal(lineRangeDelete.results[0].matchedBy, 'line_range');
    assert.equal(lineRangeDelete.content, ['一', '四'].join('\n'));
});

test('Shared applyTextEdits rejects oldString mixed with line-number modes and partially applies valid line ranges', () => {
    const content = ['一', '二', '三', '四', '五'].join('\n');
    const dirtyLineRangeItem = applyTextEdits(content, [
        { oldString: '一', startLine: 1, endLine: 1, newString: '一改' },
    ]);
    assert.equal(dirtyLineRangeItem.ok, true);
    assert.equal(dirtyLineRangeItem.content, ['一改', '二', '三', '四', '五'].join('\n'));
    assert.equal(dirtyLineRangeItem.results[0].matchedBy, 'line_range');

    const mixed = applyTextEdits(content, [
        { startLine: 1, endLine: 1, newString: '一改' },
        { oldString: '二', newString: '二改' },
    ]);
    assert.equal(mixed.ok, false);
    assert.equal(mixed.content, content);
    assert.equal(mixed.results[0].error, 'mixed_edit_modes');

    const overlapping = applyTextEdits(content, [
        { startLine: 2, endLine: 4, newString: '中段' },
        { startLine: 3, endLine: 5, newString: '后段' },
    ]);
    assert.equal(overlapping.ok, false);
    assert.equal(overlapping.content, content);
    assert.equal(overlapping.results[1].error, 'overlapping_line_ranges');

    const partial = applyTextEdits(content, [
        { startLine: 1, endLine: 1, newString: '一改' },
        { startLine: 9, endLine: 9, newString: '越界' },
        { startLine: 5, endLine: 5, newString: '五改' },
    ]);
    assert.equal(partial.ok, false);
    assert.equal(partial.partial, true);
    assert.equal(partial.results[1].index, 1);
    assert.equal(partial.results[1].mode, 'line_range');
    assert.equal(partial.results[1].startLine, 9);
    assert.equal(partial.results[1].endLine, 9);
    assert.equal(partial.results[1].error, 'line_range_out_of_bounds');
    assert.equal(partial.content, ['一改', '二', '三', '四', '五改'].join('\n'));
});

test('Shared applyTextEdits mixes line ranges and insertions using original Read line numbers', () => {
    const content = ['一', '二', '三', '四', '五'].join('\n');
    const result = applyTextEdits(content, [
        { insertAtLine: 5, newString: '五之前' },
        { startLine: 2, endLine: 3, newString: '二三合并' },
        { insertAtLine: 2, newString: '二之前' },
    ]);

    assert.equal(result.ok, true);
    assert.equal(result.results[0].matchedBy, 'line_insert');
    assert.equal(result.results[1].matchedBy, 'line_range');
    assert.equal(result.results[2].matchedBy, 'line_insert');
    assert.equal(result.content, ['一', '二之前', '二三合并', '四', '五之前', '五'].join('\n'));

    const ambiguous = applyTextEdits(content, [
        { startLine: 2, endLine: 4, newString: '中段' },
        { insertAtLine: 3, newString: '插在被替换范围内部' },
        { insertAtLine: 5, newString: '五之前' },
    ]);

    assert.equal(ambiguous.ok, false);
    assert.equal(ambiguous.partial, true);
    assert.equal(ambiguous.results[0].error, 'insert_inside_line_range');
    assert.equal(ambiguous.results[1].error, 'insert_inside_line_range');
    assert.equal(ambiguous.results[2].matchedBy, 'line_insert');
    assert.equal(ambiguous.content, ['一', '二', '三', '四', '五之前', '五'].join('\n'));
});

test('Shared applyTextEdits protects later edits from matching newly inserted text', () => {
    const result = applyTextEdits('他走过来。', [
        { oldString: '他', newString: '他慢慢' },
        { oldString: '慢慢', newString: '缓缓' },
    ]);

    assert.equal(result.ok, false);
    assert.equal(result.partial, true);
    assert.equal(result.content, '他慢慢走过来。');
    assert.equal(result.results[1].error, 'old_string_matches_previous_new_string');
    assert.match(result.results[1].suggestion, /Merge overlapping changes/);
});

test('Shared applyTextEdits reports not found, no changes, and adapts common punctuation', () => {
    const missing = applyTextEdits('她说：“回来，快点。”', [
        { oldString: '不存在', newString: '存在' },
    ]);
    assert.equal(missing.results[0].error, 'not_found');
    assert.equal(missing.results[0].index, 0);
    assert.equal(missing.results[0].mode, 'old_string');
    assert.equal(missing.results[0].oldPreview, '不存在');
    assert.match(missing.results[0].suggestion, /Read the current file/);

    const noChange = applyTextEdits('原文', [
        { oldString: '原文', newString: '原文' },
    ]);
    assert.equal(noChange.results[0].error, 'no_changes');
    assert.match(noChange.results[0].suggestion, /remove this edit/);

    const smart = applyTextEdits('她说：“回来，快点。”', [
        { oldString: '"回来,快点."', newString: '"别走,等我."' },
    ]);
    assert.equal(smart.ok, true);
    assert.equal(smart.content, '她说：“别走，等我。”');
});

test('Shared applyTextEdits guards against matching style-adapted inserted text', () => {
    const result = applyTextEdits('她说：“回来，快点。”', [
        { oldString: '"回来,快点."', newString: '"别走,等我."' },
        { oldString: '别走，', newString: '留下，' },
    ]);

    assert.equal(result.ok, false);
    assert.equal(result.partial, true);
    assert.equal(result.content, '她说：“别走，等我。”');
    assert.equal(result.results[1].error, 'old_string_matches_previous_new_string');
});

test('Shared applyTextEdits guards against equivalent punctuation in edit chains', () => {
    const result = applyTextEdits('她说：“回来，快点。”', [
        { oldString: '"回来,快点."', newString: '"别走,等我."' },
        { oldString: '别走,', newString: '留下,' },
    ]);

    assert.equal(result.ok, false);
    assert.equal(result.partial, true);
    assert.equal(result.content, '她说：“别走，等我。”');
    assert.equal(result.results[1].error, 'old_string_matches_previous_new_string');
});

test('Shared applyTextEdits treats oldString edits covered by a previous replacement as successful', () => {
    const oldFragment = '旧句A要替换并保留足够上下文。';
    const newFragment = '新的长句已经到位，并且带有足够具体的目标文本。';
    const overlapped = applyTextEdits(`开头。\n${oldFragment}\n结尾。`, [
        {
            oldString: `开头。\n${oldFragment}\n结尾。`,
            newString: `开头。\n${newFragment}\n结尾。`,
        },
        {
            oldString: oldFragment,
            newString: newFragment,
        },
    ]);

    assert.equal(overlapped.ok, true);
    assert.equal(overlapped.content, `开头。\n${newFragment}\n结尾。`);
    assert.equal(overlapped.results[1].matchedBy, 'already_satisfied');
    assert.equal(overlapped.results[1].satisfied, true);
    assert.equal(overlapped.results[1].previousError, 'not_found');

    const idempotent = applyTextEdits(`开头。\n${newFragment}\n结尾。`, [
        {
            oldString: oldFragment,
            newString: newFragment,
        },
    ]);

    assert.equal(idempotent.ok, false);
    assert.equal(idempotent.content, `开头。\n${newFragment}\n结尾。`);
    assert.equal(idempotent.results[0].error, 'not_found');
    assert.equal(idempotent.results[0].uncertain, true);
    assert.equal(idempotent.results[0].possibleAlreadyApplied, true);

    const exactShortDuplicate = applyTextEdits('甲', [
        { oldString: '甲', newString: '乙' },
        { oldString: '甲', newString: '乙' },
    ]);

    assert.equal(exactShortDuplicate.ok, true);
    assert.equal(exactShortDuplicate.content, '乙');
    assert.equal(exactShortDuplicate.results[1].matchedBy, 'already_satisfied');
});

test('Shared applyTextEdits does not let later replacements satisfy earlier failures', () => {
    const result = applyTextEdits('marker\nreal old-to-change text here', [
        {
            oldString: 'marker',
            newString: 'marker old-to-change text',
        },
        {
            oldString: 'old-to-change text',
            newString: 'desired text',
        },
        {
            oldString: 'real old-to-change text here',
            newString: 'real desired text here',
        },
    ]);

    assert.equal(result.ok, false);
    assert.equal(result.partial, true);
    assert.equal(result.content, 'marker old-to-change text\nreal desired text here');
    assert.equal(result.results[1].error, 'old_string_matches_previous_new_string');
    assert.notEqual(result.results[1].matchedBy, 'already_satisfied');
});

test('Shared applyTextEdits does not treat failed line edits as successful just because target text exists elsewhere', () => {
    const target = '这一整段目标文本已经非常具体，足够判断它不是偶然重复。';
    const result = applyTextEdits(['一', '旧段落', '三'].join('\n'), [
        { startLine: 2, endLine: 2, newString: target },
        { startLine: 9, endLine: 9, newString: target },
    ]);

    assert.equal(result.ok, false);
    assert.equal(result.partial, true);
    assert.equal(result.content, ['一', target, '三'].join('\n'));
    assert.equal(result.results[1].error, 'line_range_out_of_bounds');
});

test('Shared applyTextEdits returns original content for empty edits', () => {
    const result = applyTextEdits('原文', []);

    assert.equal(result.ok, false);
    assert.equal(result.content, '原文');
    assert.equal(result.results[0].error, 'invalid_edits');
    assert.match(result.results[0].suggestion, /non-empty edits array/);
});
