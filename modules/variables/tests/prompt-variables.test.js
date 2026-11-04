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
// - Undefined variable paths never satisfy ordering conditions on either side (wrong event or script activation).
// - Defined values and independent conditions still select and execute the intended event (wrong model input or variable updates).
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

async function emit(type, ...args) {
    for (const handler of [...(host.handlers.get(type) || [])]) await handler(...args);
}

async function succeed() {
    ctx().chat.push({ mes: 'new reply', is_user: false });
    await emit('MESSAGE_RECEIVED', ctx().chat.length - 1);
    await emit('GENERATION_ENDED');
}

test.before(async () => {
    h = await createHarness();
    writeFileSync(path.join(h.tempDir, 'mock-prompt-events.js'), `
export const handlers = new Map();
export const event_types = Object.fromEntries(['CHAT_COMPLETION_PROMPT_READY', 'CHAT_COMPLETION_SETTINGS_READY', 'TEXT_COMPLETION_SETTINGS_READY', 'GENERATE_AFTER_COMBINE_PROMPTS', 'GENERATE_AFTER_DATA', 'GENERATION_ENDED', 'GENERATION_STARTED', 'GENERATION_STOPPED', 'MESSAGE_RECEIVED', 'CHAT_CHANGED', 'MESSAGE_SWIPED', 'MESSAGE_SWIPE_DELETED', 'MESSAGE_DELETED', 'MESSAGE_EDITED'].map(key => [key, key]));
export function on(key, handler) {
    if (!handlers.has(key)) handlers.set(key, []);
    handlers.get(key).push(handler);
}
export function removeListener(key, handler) { handlers.set(key, (handlers.get(key) || []).filter(fn => fn !== handler)); }
export const createModuleEvents = () => {
    const owned = [];
    return { on: (key, handler) => { owned.push([key, handler]); on(key, handler); }, cleanup: () => { owned.forEach(([key, handler]) => removeListener(key, handler)); owned.length = 0; } };
};
`, 'utf8');
    writeFileSync(path.join(h.tempDir, 'mock-slash-abort.js'), `
export class SlashCommandAbortController {
    signal = { aborted: false };
    abort(reason, isQuiet) { Object.assign(this.signal, { aborted: true, reason, isQuiet }); }
}
`, 'utf8');
    writeFileSync(path.join(h.tempDir, 'slash-command.js'), readFileSync(path.resolve('core/slash-command.js'), 'utf8')
        .replace('../../../../extensions.js', './mock-extensions.js')
        .replace('../../../../slash-commands/SlashCommandAbortController.js', './mock-slash-abort.js'));
    for (const name of ['var-commands.js', 'varevent-editor.js']) {
        const sourceFile = path.resolve('modules/variables', name);
        const source = readFileSync(sourceFile, 'utf8').replace(/from (["'])([^"']+)\1/g, (_match, quote, specifier) => {
            const replacement = specifier === '../../../../../extensions.js' ? './mock-extensions.js'
                : specifier === '../../../../../variables.js' ? './mock-variables.js'
                    : specifier === '../../core/event-manager.js' ? './mock-prompt-events.js'
                        : specifier === '../../core/slash-command.js' ? './slash-command.js'
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
    ctx().eventSource = { makeLast: host.on, removeListener: host.removeListener };
    runtime.initVareventEditor();
});

test.beforeEach(() => {
    h.reset();
    ctx().event_types = host.event_types;
    ctx().eventSource = { makeLast: host.on, removeListener: host.removeListener };
    ctx().chat = [{ mes: 'init', swipe_id: 0 }, { mes: 'prose', swipe_id: 0 }];
    ctx().actionCount = 0;
    ctx().substituteParams = text => text;
    h.executor.applyStateForMessage(0, `<state>西厢: ${JSON.stringify(value)}</state>`);
});

test.after(() => { runtime.cleanupVareventEditor(); h.cleanup(); });

test('missing roots and null leaves cannot pass ordering, while scientific numbers compare numerically', () => {
    ctx().chatMetadata.variables.data = JSON.stringify({ nil: null, tiny: 9e-7, text: 'a"b' });
    for (const expression of ['var(`missing`) < val(`85`)', 'var(`data.nil`) < val(`85`)', 'var(`data.tiny`) >= val(`85`)']) {
        assert.equal(runtime.evaluateCondition(expression), false, expression);
    }
    assert.equal(runtime.evaluateCondition('var("data.tiny") < val("85")'), true);
    assert.equal(runtime.evaluateCondition('var(`data.text`) == val(`a"b`)'), true);
});

test('editor-encoded multiline scripts decode to executable original source', () => {
    const js = 'ctx.actionCount += 1;\nctx.path = "C:\\\\temp";';
    const parsed = runtime.parseVareventEvents(`[event.script]\njs_execute: ${JSON.stringify(js)}`);
    assert.equal(parsed[0].js, js);
});

test('undefined variable paths fail every ordering comparison on either side', () => {
    ctx().chatMetadata.variables['坏数据'] = 'not JSON';
    for (const path of ['不存在.好感度', '西厢.缺失', '西厢.背包[9].数量', '坏数据.好感度']) {
        for (const op of ['>', '>=', '<', '<=']) {
            for (const operands of [
                [`var(\`${path}\`)`, 'val(`85`)'],
                ['val(`85`)', `var(\`${path}\`)`],
                [`var(\`${path}\`)`, 'var(`不存在.另一个值`)'],
            ]) {
                const expression = `${operands[0]} ${op} ${operands[1]}`;
                assert.equal(runtime.evaluateCondition(expression), false, expression);
            }
        }
    }
});

test('defined values and independent branches keep their condition semantics', () => {
    for (const [expression, expected] of [
        ['var(`西厢.好感度`) < val(`85`)', true],
        ['var(`西厢.好感度`) >= val(`85`)', false],
        ['var(`西厢.好感度`) >= val(`20`)', true],
        ['var(`西厢.好感度`) <= val(`20`)', true],
        ['val(`85`) > var(`西厢.好感度`)', true],
        ['val(`beta`) > val(`alpha`)', true],
        ['val(`alpha`) >= val(`beta`)', false],
        ['var(`不存在.好感度`) === undefined', true],
        ['var(`不存在.好感度`) >= val(`85`) || var(`西厢.好感度`) < val(`85`)', true],
        ['var(`不存在.好感度`) >= val(`85`) && var(`西厢.好感度`) < val(`85`)', false],
    ]) {
        assert.equal(runtime.evaluateCondition(expression), expected, expression);
    }
});

test('missing paths select neither tier nor script, then valid values activate the matching event', async () => {
    const inner = [
        '[event.low]',
        'condition: var(`角色.好感度`) < val(`85`)',
        'display: low',
        'js_execute: ctx.selectedTier = "low";',
        '[event.high]',
        'condition: var(`角色.好感度`) >= val(`85`)',
        'display: high',
        'js_execute: ctx.selectedTier = "high";',
    ].join('\n');
    const block = `<varevent>\n${inner}\n</varevent>`;
    for (const [root, expected] of [[undefined, ''], ['{}', ''], ['{"好感度":20}', 'low'], ['{"好感度":90}', 'high'], [undefined, '']]) {
        if (root === undefined) delete ctx().chatMetadata.variables['角色'];
        else ctx().chatMetadata.variables['角色'] = root;
        ctx().selectedTier = '';
        assert.equal(await runtime.replaceVareventInString(block, true), expected);
        assert.equal(ctx().selectedTier, '');
        assert.equal(await runtime.replaceVareventInString(block, false, true), expected);
        assert.equal(ctx().selectedTier, expected);
        ctx().selectedTier = '';
        await emit('GENERATION_STARTED', 'normal');
        runtime.enqueuePendingVareventBlock(inner, 'test');
        await succeed();
        assert.equal(ctx().selectedTier, expected);
    }
});

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
        await emit('GENERATION_STARTED', 'normal');
        await emit(carrier.event, data);
        await emit('GENERATE_AFTER_DATA', { prompt: data.chat || data.prompt }, false);
        assert.equal(ctx().actionCount, 0);
        assert.equal(ctx().chatMetadata.LWB_PENDING_VAREVENT_BLOCKS, undefined);
        await emit('GENERATION_ENDED');
        assert.equal(ctx().actionCount, 0);
        await succeed();
        assert.equal(ctx().actionCount, 1);
        await emit('GENERATION_ENDED');
        assert.equal(ctx().actionCount, 1);
        ctx().actionCount = 0;
    }
});

test('display and script use the selected tier even when variables change before reply', async () => {
    for (const highScript of ['', 'ctx.selectedTier = "high";']) {
        const data = { chat: [{ content: `<varevent>\n[event.low]\ndisplay: low\njs_execute: ctx.selectedTier = "low";\n[event.high]\ncondition: var("rank") >= val("85")\ndisplay: high\njs_execute: ${highScript}\n</varevent>` }] };
        ctx().chatMetadata.variables.rank = 90; ctx().selectedTier = '';
        await emit('GENERATION_STARTED', 'normal'); await emit('CHAT_COMPLETION_PROMPT_READY', data);
        await emit('GENERATE_AFTER_DATA', { prompt: data.chat }, false);
        assert.equal(data.chat[0].content, 'high');
        ctx().chatMetadata.variables.rank = 1;
        await succeed();
        assert.equal(ctx().selectedTier, highScript ? 'high' : '');
    }
});

test('switching chats while a script awaits rejects supplied helpers and skips the next script', async () => {
    let release, started;
    ctx().wait = new Promise(resolve => { release = resolve; });
    const begun = new Promise(resolve => { started = resolve; });
    ctx().started = started;
    await emit('GENERATION_STARTED', 'normal');
    runtime.enqueuePendingVareventBlock('[event.a]\njs_execute: ctx.started(); await ctx.wait; setVar("wrong", 1);', 'test');
    runtime.enqueuePendingVareventBlock('[event.b]\njs_execute: setVar("later", 1);', 'test');
    ctx().chat.push({ mes: 'reply' }); await emit('MESSAGE_RECEIVED', ctx().chat.length - 1);
    const done = emit('GENERATION_ENDED'); await begun;
    ctx().chatId = 'other'; ctx().chat = []; ctx().chatMetadata = { variables: {} };
    await emit('CHAT_CHANGED'); release(); await done;
    assert.deepEqual(ctx().chatMetadata.variables, {});
});

test('repeated disable/enable removes owned and makeLast listeners without touching other modules', async () => {
    let foreign = 0;
    const listener = () => foreign++;
    host.on('CHAT_COMPLETION_PROMPT_READY', listener);
    const count = () => [...host.handlers.values()].reduce((sum, handlers) => sum + handlers.length, 0);
    const initial = count();
    for (let i = 0; i < 3; i++) {
        await emit('GENERATION_STARTED', 'normal');
        runtime.enqueuePendingVareventBlock('js_execute: ctx.actionCount++;', 'test');
        runtime.cleanupVareventEditor();
        const data = { chat: [{ content: eventBlock }] };
        await emit('CHAT_COMPLETION_PROMPT_READY', data); await succeed();
        assert.equal(data.chat[0].content, eventBlock); assert.equal(ctx().actionCount, 0);
        assert.equal(count(), 1);
        runtime.initVareventEditor(); assert.equal(count(), initial);
    }
    assert.equal(foreign, 3); host.removeListener('CHAT_COMPLETION_PROMPT_READY', listener);
});

test('host helper returning after cancellation rejects before the script resumes', async () => {
    let release, started, controller;
    const wait = new Promise(resolve => { release = resolve; });
    const begun = new Promise(resolve => { started = resolve; });
    ctx().executeSlashCommands = async (...args) => { controller = args[5]; started(); await wait; return 'finished'; };
    await emit('GENERATION_STARTED', 'normal');
    runtime.enqueuePendingVareventBlock('js_execute: await STscript("/fixture"); ctx.actionCount++;', 'test');
    ctx().chat.push({ mes: 'reply' }); await emit('MESSAGE_RECEIVED', ctx().chat.length - 1);
    const done = emit('GENERATION_ENDED'); await begun;
    assert.equal(controller.signal.aborted, false);
    await emit('GENERATION_STOPPED');
    assert.equal(controller.signal.aborted, true);
    release(); await done;
    assert.equal(ctx().actionCount, 0);
});

test('event STscript preserves the host result instead of parsing its pipe', async () => {
    const result = { pipe: '123', isAborted: false };
    ctx().executeSlashCommands = async () => result;
    assert.equal(await runtime.runJS('return await STscript("/echo 123");'), result);
});

// Integration contracts: auxiliary assembly cannot replace the real request's actions;
// normal macro finalization cannot cancel actions; supplied host helpers must settle
// before later scripts start (wrong-chat writes or silently missing variable changes).
test('interleaved raw requests cannot clear or contribute to the real generation queue', async () => {
    for (const carrier of carriers) for (const when of ['before', 'after']) {
        ctx().actionCount = 0;
        await emit('GENERATION_STARTED', 'normal');
        const real = { ...carrier.make(eventBlock), dryRun: false };
        const auxiliary = { ...carrier.make(eventBlock.replace('+= 1', '+= 100')), dryRun: false };
        await emit(carrier.event, real);
        if (when === 'before') await emit(carrier.event, auxiliary);
        const final = { prompt: real.chat || real.prompt };
        await emit('GENERATE_AFTER_DATA', final, false);
        if (when === 'after') await emit(carrier.event, auxiliary);
        if (auxiliary.chat) {
            await emit('CHAT_COMPLETION_SETTINGS_READY', { type: 'quiet', messages: auxiliary.chat });
            assert.equal(carrier.read(auxiliary), 'shown');
        }
        await succeed();
        assert.equal(ctx().actionCount, 1, `${carrier.event}/${when}`);
        assert.ok(!JSON.stringify(final.prompt).includes('<varevent>'));
    }
});

test('a malformed condition reports its event and still selects the valid fallback', async () => {
    const input = '<varevent>\n[event.good]\ndisplay: fallback\n[event.bad]\ncondition: "oops\ndisplay: invalid\n</varevent>';
    assert.equal(await runtime.replaceVareventInString(input, true), 'fallback');
});

test('normal reply macro writeback does not invalidate an awaited event', async () => {
    let release, started;
    ctx().wait = new Promise(resolve => { release = resolve; });
    const begun = new Promise(resolve => { started = resolve; }); ctx().started = started;
    await emit('GENERATION_STARTED', 'normal');
    runtime.enqueuePendingVareventBlock('js_execute: ctx.started(); await ctx.wait; setVar("afterMacro", 1);');
    runtime.enqueuePendingVareventBlock('js_execute: ctx.actionCount++;');
    ctx().chat.push({ mes: 'place: {{xbgetvar::西厢.地点}}' });
    const id = ctx().chat.length - 1;
    await emit('MESSAGE_RECEIVED', id); const done = emit('GENERATION_ENDED'); await begun;
    commands.applyXbGetVarForMessage(id, true);
    release(); await done;
    assert.equal(ctx().chatMetadata.variables.afterMacro, 1);
    assert.equal(ctx().actionCount, 1);
});

test('existing unawaited STscript actions finish before the next event dispatches', async () => {
    let release, started;
    const waiting = new Promise(resolve => { release = resolve; });
    const begun = new Promise(resolve => { started = resolve; });
    ctx().executeSlashCommands = async () => { started(); await waiting; ctx().actionCount++; return 'ok'; };
    await emit('GENERATION_STARTED', 'normal');
    runtime.enqueuePendingVareventBlock('js_execute: STscript(`/setvar key=count 1`);');
    runtime.enqueuePendingVareventBlock('js_execute: ctx.countSeen = ctx.actionCount;');
    ctx().chat.push({ mes: 'reply' }); await emit('MESSAGE_RECEIVED', ctx().chat.length - 1);
    const done = emit('GENERATION_ENDED'); await begun;
    await new Promise(resolve => setTimeout(resolve, 5));
    const beforeRelease = ctx().countSeen;
    release(); await done;
    assert.equal(beforeRelease, undefined);
    assert.equal(ctx().countSeen, 1);
    delete ctx().countSeen;
});

// The real /xbgenraw and native text raw requests do not emit GENERATE_AFTER_DATA.
// They must send selected prose, never event conditions or executable source.
test('auxiliary chat and text payloads expand prose without acquiring actions', async () => {
    const chat = { chat: [{ content: eventBlock }], dryRun: false };
    await emit('CHAT_COMPLETION_PROMPT_READY', chat);
    assert.equal(chat.chat[0].content, 'shown');
    const text = { prompt: eventBlock };
    await emit('TEXT_COMPLETION_SETTINGS_READY', text);
    assert.equal(text.prompt, 'shown');
    await succeed();
    assert.equal(ctx().actionCount, 0);
});

test('identical expanded prose cannot attach another request actions to the real reply', async () => {
    for (const textMode of [false, true]) for (const auxiliaryFirst of [false, true]) {
        ctx().actionCount = 0;
        await emit('GENERATION_STARTED', 'normal');
        const make = code => textMode ? { prompt: code } : { chat: [{ content: code }], dryRun: false };
        const actual = make(eventBlock), auxiliary = make(eventBlock.replace('+= 1', '+= 100'));
        const event = textMode ? 'TEXT_COMPLETION_SETTINGS_READY' : 'CHAT_COMPLETION_PROMPT_READY';
        for (const request of auxiliaryFirst ? [auxiliary, actual] : [actual, auxiliary]) await emit(event, request);
        await emit('GENERATE_AFTER_DATA', textMode ? actual : { prompt: actual.chat }, false);
        await succeed();
        assert.equal(ctx().actionCount, 1);
    }
});
