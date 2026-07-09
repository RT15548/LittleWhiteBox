import test from 'node:test';
import assert from 'node:assert/strict';

import {
    computeStateSignature,
    extractStateBlocks,
    parseInlineValue,
    parseStateBlock,
} from '../state2/parser.js';

test('state2 parser extracts only valid closed state blocks and computes stable signatures', () => {
    const text = `
<statex>ignored</statex>
<state kind="first">
数据.A: 1
</state   >
middle
<state>
数据.B: 2
</state>
<state>
数据.C: 3
`;

    assert.deepEqual(extractStateBlocks(text), ['\n数据.A: 1\n', '\n数据.B: 2\n']);
    assert.equal(computeStateSignature(text), '<state kind="first">\n数据.A: 1\n</state   >\n---\n<state>\n数据.B: 2\n</state>');
    assert.equal(computeStateSignature('no state here'), '');
});

test('state2 parser handles empty and malformed schema blocks without losing data ops', () => {
    const emptySchema = parseStateBlock(`
$schema 数据

数据.值: 1
`);
    assert.deepEqual(emptySchema.rules, []);
    assert.deepEqual(emptySchema.ops, [{ path: '数据.值', op: 'set', value: 1 }]);

    const originalWarn = console.warn;
    const warnings = [];
    console.warn = (...args) => warnings.push(args.join(' '));
    let malformedSchema;
    try {
        malformedSchema = parseStateBlock(`
$schema 数据
  名称: [
数据.值: 2
`);
    } finally {
        console.warn = originalWarn;
    }
    assert.deepEqual(malformedSchema.rules, []);
    assert.deepEqual(malformedSchema.ops, [{ path: '数据.值', op: 'set', value: 2 }]);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /YAML parse failed/);
});

test('state2 parser distinguishes empty schema from unindented schema bodies', () => {
    const emptySchema = parseStateBlock(`
$schema 数据
数据.值: 1
`);
    assert.deepEqual(emptySchema.rules, []);
    assert.deepEqual(emptySchema.ops, [{ path: '数据.值', op: 'set', value: 1 }]);

    const unindentedSchema = parseStateBlock(`
$schema 数据
背包:
  - 名称: ""
    数量: 0
`);
    assert.deepEqual(unindentedSchema.ops, []);
    assert.deepEqual(
        unindentedSchema.rules.map(item => item.path),
        ['数据', '数据.背包', '数据.背包.[*]', '数据.背包.[*].名称', '数据.背包.[*].数量'],
    );
});

test('state2 parser emits rules for empty arrays and wildcard schemas', () => {
    const parsed = parseStateBlock(`
$schema 数据
  空列表: []
  自由对象: {}
  同行者:
    "*":
      HP: 0
    固定:
      HP: 0
`);

    assert.deepEqual(parsed.rules, [
        { path: '数据', rule: { typeLock: 'object', allowedKeys: ['空列表', '自由对象', '同行者'] } },
        { path: '数据.空列表', rule: { typeLock: 'array', arrayGrow: true } },
        { path: '数据.自由对象', rule: { typeLock: 'object', objectExt: true } },
        { path: '数据.同行者', rule: { typeLock: 'object', objectExt: true, hasWildcard: true } },
        { path: '数据.同行者.*', rule: { typeLock: 'object', allowedKeys: ['HP'] } },
        { path: '数据.同行者.*.HP', rule: { typeLock: 'number' } },
        { path: '数据.同行者.固定', rule: { typeLock: 'object', allowedKeys: ['HP'] } },
        { path: '数据.同行者.固定.HP', rule: { typeLock: 'number' } },
    ]);
});

test('state2 parser parses inline operation forms and malformed fallbacks', () => {
    assert.deepEqual(parseInlineValue('null'), { op: 'del' });
    assert.deepEqual(parseInlineValue('(12)'), { op: 'set', value: 12 });
    assert.deepEqual(parseInlineValue('+4'), { op: 'inc', delta: 4 });
    assert.deepEqual(parseInlineValue('-3'), { op: 'inc', delta: -3 });
    assert.deepEqual(parseInlineValue('+"a\\n b"'), { op: 'push', value: 'a\n b' });
    assert.deepEqual(parseInlineValue("+'a\\t b'"), { op: 'push', value: 'a\t b' });
    assert.deepEqual(parseInlineValue('+["a"]'), { op: 'push', value: ['a'] });
    assert.deepEqual(parseInlineValue('+{"a":1}'), { op: 'push', value: { a: 1 } });
    assert.deepEqual(parseInlineValue('-"a"'), { op: 'pop', value: 'a' });
    assert.deepEqual(parseInlineValue("-'a'"), { op: 'pop', value: 'a' });
    assert.deepEqual(parseInlineValue('-["a"]'), { op: 'pop', value: ['a'] });
    assert.deepEqual(parseInlineValue('-{"a":1}'), { op: 'pop', value: { a: 1 } });
    assert.deepEqual(parseInlineValue('12'), { op: 'set', value: 12 });
    assert.deepEqual(parseInlineValue('"a\\r b"'), { op: 'set', value: 'a\r b' });
    assert.deepEqual(parseInlineValue("'a\\\\b'"), { op: 'set', value: 'a\\b' });
    assert.deepEqual(parseInlineValue('true'), { op: 'set', value: true });
    assert.deepEqual(parseInlineValue('false'), { op: 'set', value: false });
    assert.deepEqual(parseInlineValue('{"a":1}'), { op: 'set', value: { a: 1 } });
    assert.deepEqual(parseInlineValue('[1]'), { op: 'set', value: [1] });

    assert.deepEqual(parseInlineValue('+[bad'), { op: 'set', value: '+[bad', warning: '+[] 解析失败' });
    assert.deepEqual(parseInlineValue('+{bad'), { op: 'set', value: '+{bad', warning: '+{} 解析失败' });
    assert.deepEqual(parseInlineValue('-[bad'), { op: 'set', value: '-[bad', warning: '-[] 解析失败' });
    assert.deepEqual(parseInlineValue('-{bad'), { op: 'set', value: '-{bad', warning: '-{} 解析失败' });
    assert.deepEqual(parseInlineValue('{bad'), { op: 'set', value: '{bad', warning: 'JSON 解析失败' });
    assert.deepEqual(parseInlineValue('plain text'), { op: 'set', value: 'plain text' });
});

test('state2 parser handles multiline yaml values and blank scalar assignments', () => {
    const parsed = parseStateBlock(`
数据.空:
数据.对象:
  标题: "A: B"
  列表:
    - 1
    - 2
`);

    assert.deepEqual(parsed.ops, [
        { path: '数据.空', op: 'set', value: '' },
        { path: '数据.对象', op: 'set', value: { 标题: 'A: B', 列表: [1, 2] } },
    ]);
});
