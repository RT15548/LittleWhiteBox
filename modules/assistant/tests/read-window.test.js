import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_READ_RETURN_CHARS, MAX_READ_LINE_CHARS, headPreviewLines, sliceLinesWithBudget } from '../shared/read-window.js';

// Numbered content is the Read transport format; the remaining strings are fixture data.
const contentLines = page => page.content.split('\n').map(line => line.slice(line.indexOf('\t') + 1));

test('forward Read windows preserve line numbers, empty lines and continuation across the output budget', () => {
    const lines = Array.from({ length: 100 }, (_, index) => `${index}: ${'正文'.repeat(800)}`);
    lines.splice(12, 0, '');
    lines.push('');
    const collected = [];
    let startLine = 1;
    while (startLine <= lines.length) {
        const page = sliceLinesWithBudget(lines, startLine, lines.length);
        assert.equal(page.startLine, startLine);
        assert.equal(page.returnedLines, page.endLine - page.startLine + 1);
        assert.ok(page.content.length <= MAX_READ_RETURN_CHARS);
        assert.ok(page.endLine >= startLine);
        assert.equal(page.charLimited, page.endLine < lines.length);
        assert.deepEqual(page.content.split('\n').map(line => Number(line.split('\t')[0])),
            Array.from({ length: page.returnedLines }, (_, index) => startLine + index));
        collected.push(...contentLines(page));
        startLine = page.endLine + 1;
    }
    assert.deepEqual(collected, lines);
});

test('tail output keeps the actual last lines when either numbered or streamed text exceeds the budget', () => {
    for (const numbered of [true, false]) {
        for (const trailingNewline of [true, false]) {
            const lines = Array.from({ length: 100 }, (_, index) => `${index}: ${'x'.repeat(MAX_READ_LINE_CHARS - 10)}`);
            if (trailingNewline) lines.push('');
            const page = sliceLinesWithBudget(lines, 1, lines.length, { fromEnd: true, numbered });
            const returned = numbered ? contentLines(page) : page.content.split('\n');
            assert.deepEqual(returned, lines.slice(-page.returnedLines));
            assert.equal(page.endLine, lines.length);
            assert.equal(page.startLine, lines.length - page.returnedLines + 1);
            assert.ok(page.startLine > 1);
            assert.ok(page.returnedLines > 0);
            assert.equal(page.charLimited, true);
            assert.ok(page.content.length <= MAX_READ_RETURN_CHARS);
        }
    }
});

test('short tail windows keep their requested range without claiming output truncation', () => {
    const lines = ['before', 'middle', 'last'];
    const page = sliceLinesWithBudget(lines, 2, 3, { fromEnd: true });
    assert.deepEqual(contentLines(page), lines.slice(1));
    assert.equal(page.startLine, 2);
    assert.equal(page.endLine, 3);
    assert.equal(page.charLimited, false);
});

test('cancelled head previews leave partial and not-yet-started lines for continuation', () => {
    const longLine = 'x'.repeat(MAX_READ_RETURN_CHARS + MAX_READ_LINE_CHARS * 2);
    const secondLine = `${'p'.repeat(700)}remaining`, lastLine = 'last';
    const full = [longLine, secondLine, lastLine];
    for (const text of [`${longLine}\n${secondLine.slice(0, 700)}`, `${longLine}\n`, longLine]) {
        const preview = headPreviewLines({ text, truncated: true });
        const page = sliceLinesWithBudget(preview, 1, preview.length);
        assert.equal(page.returnedLines, 1);
        assert.equal(page.endLine, 1);
        const next = sliceLinesWithBudget(full, page.endLine + 1, full.length);
        assert.deepEqual(contentLines(next), [secondLine, lastLine]);
        assert.equal(next.endLine, full.length);
    }
});

test('head preview preserves completed blank lines and does not discard the last line at EOF', () => {
    assert.deepEqual(headPreviewLines({ text: '\nunfinished', truncated: true }), ['']);
    for (const text of ['one\nlast', 'one\n', '\n', 'one', '']) {
        assert.deepEqual(headPreviewLines({ text, truncated: false }), text === '' ? [] : text.split('\n'));
    }
});

test('empty windows and per-line display caps remain bounded in both directions', () => {
    for (const fromEnd of [true, false]) {
        const empty = sliceLinesWithBudget([], 1, 0, { fromEnd });
        assert.equal(empty.content, '');
        assert.equal(empty.returnedLines, 0);
        assert.equal(empty.startLine, 1);
        assert.equal(empty.endLine, 0);
        assert.equal(empty.charLimited, false);
        const line = 'x'.repeat(MAX_READ_RETURN_CHARS * 2);
        const page = sliceLinesWithBudget([line], 1, 1, { fromEnd });
        assert.equal(page.returnedLines, 1);
        assert.equal(page.startLine, 1);
        assert.equal(page.endLine, 1);
        assert.ok(page.content.length < MAX_READ_RETURN_CHARS);
        assert.ok(contentLines(page)[0].startsWith(line.slice(0, MAX_READ_LINE_CHARS)));
    }
});
