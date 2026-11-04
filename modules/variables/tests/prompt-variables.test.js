import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseHTML } from 'linkedom';
import yaml from '../../../libs/js-yaml.mjs';
import { createHarness, readStoredValue } from './helpers/state2-harness.js';

// Acceptance contracts:
// - Every prompt carrier expands JSON/YAML reads to the current, rolled-back state (wrong model input).
// - Repeated dry runs never queue, execute or persist varevent actions (invisible data corruption).
// - Real generation still queues actions and executes them after the turn (lost variable updates).
// - Indexed YAML preserves multiline strings, keys and scalar types (silent prompt data corruption).
// - YAML formatting preserves subpath selection, scalar-leaf output and array indices (wrong model input).
let h, runtime, host, commands;
const ctx = () => h.env.state.ctx;
const macros = ['xbgetvar', 'xbgetvar_yaml', 'xbgetvar_yaml_idx'];
const value = { 地点: '庭院', 好感度: 20, 背包: [{ 名称: '纸条"编号一"', 数量: 1 }] };
const eventBlock = '<varevent>\n[event.test]\ndisplay: shown\njs_execute: ctx.actionCount += 1;\n</varevent>';

const carriers = [
    { event: 'CHAT_COMPLETION_PROMPT_READY', make: text => ({ chat: [{ content: text }] }), read: data => data.chat[0].content },
    { event: 'CHAT_COMPLETION_PROMPT_READY', make: text => ({ chat: [{ content: [{ type: 'text', text }, { type: 'image_url', image_url: { url: 'test-image' } }] }] }), read: data => data.chat[0].content[0].text },
    { event: 'CHAT_COMPLETION_PROMPT_READY', make: text => ({ chat: [{ mes: text }] }), read: data => data.chat[0].mes },
    { event: 'GENERATE_AFTER_COMBINE_PROMPTS', make: text => ({ prompt: text }), read: data => data.prompt },
];

async function emit(type, data) {
    for (const handler of host.handlers.get(type) || []) await handler(data);
}

test.before(async () => {
    h = await createHarness();
    writeFileSync(path.join(h.tempDir, 'mock-prompt-events.js'), `
export const handlers = new Map();
export const event_types = Object.fromEntries(['CHAT_COMPLETION_PROMPT_READY', 'GENERATE_AFTER_COMBINE_PROMPTS', 'GENERATION_ENDED'].map(key => [key, key]));
export function on(key, handler) {
    if (!handlers.has(key)) handlers.set(key, []);
    handlers.get(key).push(handler);
}
export const createModuleEvents = () => ({ on, cleanup: () => handlers.clear() });
`, 'utf8');
    for (const name of ['var-commands.js', 'varevent-editor.js']) {
        const sourceFile = path.resolve('modules/variables', name);
        const source = readFileSync(sourceFile, 'utf8').replace(/from (["'])([^"']+)\1/g, (_match, quote, specifier) => {
            const replacement = specifier === '../../../../../extensions.js' ? './mock-extensions.js'
                : specifier === '../../../../../variables.js' ? './mock-variables.js'
                    : specifier === '../../core/event-manager.js' ? './mock-prompt-events.js'
                        : specifier === './var-commands.js' ? specifier
                            : pathToFileURL(path.resolve(path.dirname(sourceFile), specifier)).href;
            return `from ${quote}${replacement}${quote}`;
        });
        writeFileSync(path.join(h.tempDir, name), source, 'utf8');
    }
    // eslint-disable-next-line no-unsanitized/method -- Imports only test-owned local copies and host adapters.
    host = await import(pathToFileURL(path.join(h.tempDir, 'mock-prompt-events.js')).href);
    // eslint-disable-next-line no-unsanitized/method -- Actual runtime source with only host import paths redirected.
    runtime = await import(pathToFileURL(path.join(h.tempDir, 'varevent-editor.js')).href);
    // eslint-disable-next-line no-unsanitized/method -- Actual macro source with only host import paths redirected.
    commands = await import(pathToFileURL(path.join(h.tempDir, 'var-commands.js')).href);
    const dom = parseHTML('<html><head></head><body></body></html>');
    globalThis.document = dom.document;
    globalThis.MutationObserver = dom.window.MutationObserver;
    ctx().event_types = host.event_types;
    ctx().eventSource = { makeLast: host.on };
    runtime.initVareventEditor();
});

test.beforeEach(() => {
    h.reset();
    ctx().chat = [{ mes: 'init', swipe_id: 0 }, { mes: 'prose', swipe_id: 0 }];
    ctx().actionCount = 0;
    h.executor.applyStateForMessage(0, `<state>西厢: ${JSON.stringify(value)}</state>`);
});

test.after(() => { runtime.cleanupVareventEditor(); h.cleanup(); });

test('indexed YAML round-trips multiline strings, special keys and ambiguous scalar types', () => {
    const strings = [
        '第一行\n第二行', '第一行\r\n第二行\n', '\n缩进\n  保留\n\n',
        '引号"与反斜杠\\', '制表\t与控制\0\u001b', 'a\u0085b\u2028c\u2029d',
        '', 'true', 'false', 'null', '~', '1e3', '0x10', '2026-11-02',
        'a: b', 'a # comment', '[x]', '{"字":"值"}', '  前后空格  ',
    ];
    const specialKeys = ['', 'a: b', '首行\n次行', 'a # b', '~', '引号"\\', '[键]'];
    const fixtures = [
        strings,
        { 人物: [{ 姓名: strings[0], 台词: strings }, {}, [], [null, false, 0, 1.5]] },
        Object.fromEntries(specialKeys.map(key => [key, strings])),
        specialKeys.map(key => ({ [key]: strings[0], 后续字段: strings[1] })),
        [{ 首字段: {}, 余项: [] }, [[], {}, [strings[0]]]],
    ];
    for (const fixture of fixtures) {
        ctx().chatMetadata.variables['西厢'] = JSON.stringify(fixture);
        const before = structuredClone(ctx().chatMetadata);
        for (const name of ['replaceXbGetVarYamlInString', 'replaceXbGetVarYamlIdxInString']) {
            const macro = name === 'replaceXbGetVarYamlInString' ? 'xbgetvar_yaml' : 'xbgetvar_yaml_idx';
            assert.deepEqual(yaml.load(commands[name](`{{${macro}::西厢}}`)), fixture);
        }
        assert.deepEqual(ctx().chatMetadata, before);
    }
});

test('YAML macros preserve object, array and quoted-key subpaths, and raw scalar leaves', () => {
    const person = { 姓名: '苏晚\n小名"晚晚"', 年龄: 0, 出场: false, 称呼: 'true', 空名: '' };
    const root = { 人物: [person], '档案.旧版': { '人物: 名册': [person] } };
    ctx().chatMetadata.variables['西厢'] = JSON.stringify(root);
    const paths = [
        ['西厢', root], ['西厢.人物', root.人物], ['西厢.人物[0]', person],
        ['西厢["档案.旧版"]["人物: 名册"][0]', person],
    ];
    for (const [path, expected] of paths) {
        assert.deepEqual(JSON.parse(commands.replaceXbGetVarInString(`{{xbgetvar::${path}}}`)), expected);
        assert.deepEqual(yaml.load(commands.replaceXbGetVarYamlInString(`{{xbgetvar_yaml::${path}}}`)), expected);
        assert.deepEqual(yaml.load(commands.replaceXbGetVarYamlIdxInString(`{{xbgetvar_yaml_idx::${path}}}`)), expected);
    }
    for (const [path, expected] of [
        ['西厢.人物[0].姓名', person.姓名], ['西厢.人物[0].年龄', '0'],
        ['西厢.人物[0].出场', 'false'], ['西厢.人物[0].称呼', 'true'],
        ['西厢.人物[0].空名', ''], ['西厢.人物[9].姓名', ''], ['不存在.人物', ''],
    ]) {
        assert.equal(commands.replaceXbGetVarInString(`{{xbgetvar::${path}}}`), expected);
        assert.equal(commands.replaceXbGetVarYamlInString(`{{xbgetvar_yaml::${path}}}`), expected);
        assert.equal(commands.replaceXbGetVarYamlIdxInString(`{{xbgetvar_yaml_idx::${path}}}`), expected);
    }
});

test('indexed YAML retains each nested array index without consuming multiline content', () => {
    const fixture = ['首行\n次行', { 台词: ['甲\n乙', '丙'] }, ['丁\n戊']];
    ctx().chatMetadata.variables['西厢'] = JSON.stringify(fixture);
    const text = commands.replaceXbGetVarYamlIdxInString('{{xbgetvar_yaml_idx::西厢}}');
    assert.deepEqual(yaml.load(text), fixture);
    const indices = [...text.matchAll(/# \[(\d+)\]$/gm)].map(match => Number(match[1]));
    assert.deepEqual(indices, [0, 1, 0, 1, 2, 0]);
});

test('all prompt carriers read JSON and YAML values during dry run and real generation', async () => {
    for (const carrier of carriers) {
        for (const dryRun of [true, false]) {
            for (const macro of macros) {
                const data = { ...carrier.make(`{{${macro}::西厢}}`), dryRun };
                await emit(carrier.event, data);
                const read = carrier.read(data);
                assert.deepEqual(macro === 'xbgetvar' ? JSON.parse(read) : yaml.load(read), value);
                if (Array.isArray(data.chat?.[0].content)) {
                    assert.equal(data.chat[0].content[1].image_url.url, 'test-image');
                }
            }
        }
    }
});

test('dry-run reads reflect this floor rollback, without rolling back a preceding floor', async () => {
    const api = h.executor.createStateApi();
    const begin = () => api.beginTurn({ floor: ctx().chat.length - 1, swipeId: 0 });
    const update = { ops: [{ op: 'inc', path: '西厢.好感度', delta: 5 }] };
    begin().commit(update);
    assert.equal(readStoredValue(ctx(), '西厢').好感度, 25);
    const turn = begin();
    for (const macro of macros) {
        const data = { chat: [{ content: `{{${macro}::西厢}}` }], dryRun: true };
        await emit('CHAT_COMPLETION_PROMPT_READY', data);
        assert.equal(yaml.load(data.chat[0].content).好感度, 20);
    }
    turn.commit(update);
    ctx().chat.push({ mes: 'next prose', swipe_id: 0 });
    begin();
    const data = { chat: [{ content: '{{xbgetvar_yaml::西厢}}' }], dryRun: true };
    await emit('CHAT_COMPLETION_PROMPT_READY', data);
    assert.equal(yaml.load(data.chat[0].content).好感度, 25);
});

test('dry runs leave varevent actions and saved state untouched; real turns still execute once', async () => {
    for (const carrier of carriers) {
        const before = structuredClone(ctx().chatMetadata);
        const saves = ctx().metadataSaveCount;
        for (let i = 0; i < 3; i++) {
            const data = { ...carrier.make(`{{xbgetvar::西厢}}\n${eventBlock}`), dryRun: true };
            await emit(carrier.event, data);
            const text = carrier.read(data);
            assert.deepEqual(ctx().chatMetadata, before);
            assert.equal(ctx().metadataSaveCount, saves);
            assert.equal(ctx().actionCount, 0);
            assert.deepEqual(JSON.parse(text.split('\n')[0]), value);
            assert.equal(text.slice(text.indexOf('\n') + 1), eventBlock);
        }
        await emit('GENERATION_ENDED');
        assert.equal(ctx().actionCount, 0);

        const data = { ...carrier.make(eventBlock), dryRun: false };
        await emit(carrier.event, data);
        assert.equal(ctx().actionCount, 0);
        assert.equal(ctx().chatMetadata.LWB_PENDING_VAREVENT_BLOCKS.length, 1);
        await emit('GENERATION_ENDED');
        assert.equal(ctx().actionCount, 1);
        await emit('GENERATION_ENDED');
        assert.equal(ctx().actionCount, 1);
        ctx().actionCount = 0;
    }
});
