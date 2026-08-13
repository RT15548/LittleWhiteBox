import test from 'node:test';
import assert from 'node:assert/strict';

import {
    parseJson,
    parseJsonResponse,
    repairUnescapedJsonStringQuotes,
} from '../vector/llm/json-response.js';

test('L0 JSON parser leaves valid responses unchanged', () => {
    const expected = {
        anchors: [{
            scene: '用户在“The Art Cube”遇见 Rachel Lee',
            edges: [{ s: '用户', t: 'Rachel Lee', r: '在开幕夜遇见' }],
            where: 'The Art Cube',
        }],
    };
    const source = JSON.stringify(expected);

    assert.deepEqual(parseJson(source), expected);
    assert.equal(repairUnescapedJsonStringQuotes(source), null);
});

test('L0 JSON parser recovers the observed unescaped title quotes without changing content', () => {
    const source = '{"anchors":[{"scene":"User在"The Art Cube"当代艺术画廊开幕夜遇见了策展人Rachel Lee，两人在展厅内交谈，User提及Rachel Lee对画廊和艺术家的愿景感兴趣","edges":[{"s":"User","t":"Rachel Lee","r":"提及策展人愿景"},{"s":"User","t":"The Art Cube","r":"在开幕夜遇见画廊"}],"where":"The Art Cube"}]}';

    assert.deepEqual(parseJson(source), {
        anchors: [{
            scene: 'User在"The Art Cube"当代艺术画廊开幕夜遇见了策展人Rachel Lee，两人在展厅内交谈，User提及Rachel Lee对画廊和艺术家的愿景感兴趣',
            edges: [
                { s: 'User', t: 'Rachel Lee', r: '提及策展人愿景' },
                { s: 'User', t: 'The Art Cube', r: '在开幕夜遇见画廊' },
            ],
            where: 'The Art Cube',
        }],
    });
    assert.equal(parseJsonResponse(source)?.repair, 'unescaped-string-quotes');
});

test('L0 JSON parser still accepts fenced or prose-wrapped valid objects', () => {
    const expected = { anchors: [] };

    assert.deepEqual(parseJson('```json\n{"anchors":[]}\n```'), expected);
    assert.deepEqual(parseJson('result follows: {"anchors":[]} done'), expected);
});

test('L0 JSON parser rejects structural corruption and truncation', () => {
    assert.equal(parseJson('{"anchors" [{"scene":"x"}]}'), null);
    assert.equal(parseJson('{"anchors":[{"scene":"unfinished'), null);
    assert.equal(parseJson('{"anchors":[{"scene":"x" "where":"y"}]}'), null);
});
