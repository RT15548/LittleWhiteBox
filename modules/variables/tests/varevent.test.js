import assert from 'node:assert/strict';
import test from 'node:test';
import { conditionGroups, executeCondition, joinConditions, macroExpression, parseCondition } from '../varevent/condition.js';
import { createEventDocument, newEventGroup, parseVareventEvents, serializeEventDocument } from '../varevent/document.js';
import { createEventRun, removeLegacyEventQueue } from '../varevent/run.js';

// Contracts: round trips must not lose rules/scripts; conditions must not select the wrong
// tier; only a successful current reply may dispatch actions (silent state corruption).
const evaluate = (source, variables = {}) => executeCondition(parseCondition(source), () => ({ chatMetadata: { variables } }));
const block = (id, display) => `<varevent>\r\n[event.${id}]\r\ndisplay: ${JSON.stringify(display)}\r\n</varevent>`;

test('condition grammar preserves quoted text, arbitrary JS and numeric/nullish ordering', () => {
    const vars = { zero: 0, nil: null, empty: '', negative: '-0.5', tiny: '9e-7', text: 'a"b\\c', obj: '{"x":null}' };
    for (const [source, expected] of [
        ['var("absent") >= val("85")', false], ['var("nil") < val("85")', false],
        ['var("obj.x") <= val("0")', false], ['var("zero") == val("0")', true],
        ['var("empty") == val("")', true], ['var("empty") === undefined', false],
        ['var("absent") === undefined', true], ['var("nil") === null', true],
        ['var("negative") < val("-0.1")', true], ['var("tiny") >= val("85")', false],
        ['val("beta") > val("alpha")', true], ['var("zero") < (4, 5)', true],
        ['!var("absent") && /var\\(/.test("var(")', true],
        ['(() => { const obj = { val(x) { return x; } }; return obj.val(2) === 2; })()', true],
        ['`var("x")` === \'var("x")\'', true],
        [`var('text') == ${macroExpression('val', vars.text)}`, true],
    ]) assert.equal(evaluate(source, vars), expected, source);
});

test('every projected condition has the same truth table; unsupported subtrees stay raw', () => {
    const a = 'var("a") == val("1")', b = 'var("b") == val("1")', c = 'var("c") == val("1")';
    for (const source of [`(${a} || ${b}) && ${c}`, `${a} || (${b} && ${c})`, `(${a} && ${b}) || (${b} && ${c})`]) {
        const groups = conditionGroups(source);
        assert.ok(groups);
        const rebuilt = groups.reduce((all, group) => joinConditions(all, group.operator, group.rows.reduce((text, row) =>
            joinConditions(text, row.lop, `${macroExpression('var', row.lhs)} ${row.op} ${macroExpression(row.rhsIsVar ? 'var' : 'val', row.rhs)}`), '')), '');
        for (let mask = 0; mask < 8; mask++) {
            const vars = { a: String(mask & 1), b: String((mask >> 1) & 1), c: String((mask >> 2) & 1) };
            assert.equal(evaluate(rebuilt, vars), evaluate(source, vars), source);
        }
    }
    for (const source of [`!(${a})`, `${a} && (() => true)()`, `${a} || (${b} && (${a} || ${c}))`]) assert.equal(conditionGroups(source), null);
});

test('all groups and raw fields survive no-op saves; deletion and edits are local', () => {
    const first = block('named', 'first'), second = block('二', 'second'), third = block('3', 'third');
    const original = `before\n${first}\nuntouched\n${second}\n${third}\nafter`;
    const doc = createEventDocument(original);
    assert.equal(serializeEventDocument(doc), original);
    doc.groups[2].events[0].values.display = 'changed';
    assert.equal(serializeEventDocument(doc), original.replace('"third"', '"changed"'));
    doc.groups[2].events[0].values.display = 'third';
    assert.equal(serializeEventDocument(doc), original);
    doc.groups.splice(1, 1);
    assert.equal(serializeEventDocument(doc), original.replace(second, ''));
    const added = newEventGroup(); doc.groups.push(added);
    assert.equal(serializeEventDocument(doc), original.replace(second, ''));
    added.events[0].values.js = 'setVar("n", 1)';
    assert.equal(createEventDocument(serializeEventDocument(doc)).groups.length, 3);
});

test('JSON and legacy multiline code retain literal escapes over repeated save/reopen', async () => {
    const code = 'const text = "a\\nb";\nreturn [text, "C:\\\\temp", \'"quote"\'];';
    let doc = createEventDocument(block('code', 'text'));
    doc.groups[0].events[0].values.js = code;
    for (let i = 0; i < 4; i++) {
        doc = createEventDocument(serializeEventDocument(doc));
        assert.equal(doc.groups[0].events[0].values.js, code);
        // eslint-disable-next-line no-new-func -- Test-owned code verifies executable round-trip semantics.
        assert.deepEqual(new Function(doc.groups[0].events[0].values.js)(), ['a\nb', 'C:\\temp', '"quote"']);
    }
    const legacy = `js_execute: '\nconst text = "a\\nb";\nreturn text;\n'`;
    assert.equal(parseVareventEvents(legacy)[0].js, '\nconst text = "a\\nb";\nreturn text;\n');
    const dup = createEventDocument('<varevent>[event.a]\ndisplay: old\ndisplay: new\n</varevent>');
    dup.groups[0].events[0].values.display = '';
    assert.equal(parseVareventEvents(createEventDocument(serializeEventDocument(dup)).groups[0].original.inner)[0].display, undefined);
});

function harness(execute) {
    const ctx = { chatId: 'one', chat: [{ mes: 'old', swipe_id: 0, gen_started: 'old' }], chatMetadata: {} };
    const calls = [], errors = [];
    const run = createEventRun({ getContext: () => ctx, execute: execute || (async code => calls.push(code)), report: (_event, error) => errors.push(error) });
    const action = () => run.enqueue({ id: 'a', js: 'action' });
    return { ctx, calls, errors, run, action };
}

test('each successful reply mode executes once with either host notification order', async () => {
    for (const type of ['normal', 'regenerate', 'swipe', 'continue']) for (const endFirst of [false, true]) {
        const { ctx, calls, run, action } = harness();
        run.begin(type); action();
        if (type === 'normal') ctx.chat.push({ mes: 'new', is_user: false });
        else { ctx.chat[0].mes += ' new'; ctx.chat[0].gen_started = 'new'; if (type === 'swipe') ctx.chat[0].swipe_id++; }
        if (endFirst) await run.ended();
        await run.received(ctx.chat.length - 1, type === 'regenerate' ? 'normal' : type === 'continue' ? 'appendFinal' : type);
        await run.ended(); await run.received(ctx.chat.length - 1); await run.flush();
        assert.deepEqual(calls, ['action'], `${type}/${endFirst}`);
    }
});

test('failure, aborted partial streaming, preview, auxiliary and unchanged continuation never dispatch', async () => {
    for (const mode of ['failure', 'unchanged', 'partial', 'stop', 'dryRun', 'quiet', 'delete']) {
        const { ctx, calls, run, action } = harness();
        run.begin(mode === 'quiet' ? 'quiet' : 'continue', {}, mode === 'dryRun'); action();
        if (!['failure', 'unchanged'].includes(mode)) ctx.chat[0].mes += ' partial';
        if (mode === 'partial') ctx.streamingProcessor = { isFinished: false, isStopped: true, abortController: { signal: { aborted: true } } };
        if (mode === 'stop') run.cancel();
        if (mode !== 'failure') await run.received(0);
        if (mode === 'delete') ctx.chat.length = 0;
        await run.ended(); await run.flush();
        assert.deepEqual(calls, [], mode);
    }
});

test('host regeneration removal before assembly is allowed, later user deletion cancels', async () => {
    for (const deleteAfterPrepare of [false, true]) {
        const { ctx, run, action, calls } = harness();
        run.begin('regenerate'); ctx.chat.pop(); run.changed('MESSAGE_DELETED', 0);
        run.prepare(); action();
        ctx.chat.push({ mes: 'regenerated' });
        if (deleteAfterPrepare) run.changed('MESSAGE_DELETED', 0);
        await run.received(0, 'normal'); await run.ended();
        assert.deepEqual(calls, deleteAfterPrepare ? [] : ['action']);
    }
});

test('cancellation during an awaited script guards helpers and prevents remaining actions', async () => {
    for (const cancel of ['chat', 'stop', 'swipe', 'next']) {
        let release, started;
        const waiting = new Promise(resolve => { release = resolve; });
        const begun = new Promise(resolve => { started = resolve; });
        const calls = [];
        const { ctx, run, action, errors } = harness(async (code, assertCurrent) => {
            calls.push(code); started(); await waiting;
            assertCurrent(); calls.push('write');
        });
        run.begin('normal'); action(); action(); ctx.chat.push({ mes: 'new' });
        await run.received(1); const done = run.ended(); await begun;
        if (cancel === 'chat') { ctx.chatId = 'two'; ctx.chat = []; }
        else if (cancel === 'swipe') ctx.chat[1].swipe_id = 1;
        else if (cancel === 'next') run.begin('normal');
        else run.cancel();
        release(); await done;
        assert.deepEqual(calls, ['action'], cancel); assert.deepEqual(errors, []);
    }
});

test('legacy pending metadata is removed once without execution or migration state', () => {
    const ctx = { chatMetadata: { LWB_PENDING_VAREVENT_BLOCKS: ['old'], other: 1 }, saves: 0, saveMetadataDebounced() { this.saves++; } };
    removeLegacyEventQueue(ctx); removeLegacyEventQueue(ctx);
    assert.deepEqual(ctx.chatMetadata, { other: 1 }); assert.equal(ctx.saves, 1);
});

// Regression contracts: existing scripts/conditions must retain their meaning;
// malformed handwritten conditions must not disable unrelated rules (silent data loss).
test('legacy single-quoted scripts preserve JS escapes, including on one line', () => {
    for (const code of [String.raw`return "a\nb";`, String.raw`return "C:\\temp";`]) {
        const source = `<varevent>\n[event.old]\njs_execute: '${code}'\n</varevent>`;
        const doc = createEventDocument(source);
        assert.equal(doc.groups[0].events[0].values.js, code);
        assert.equal(serializeEventDocument(doc), source);
    }
});

test('root equality still uses the host numeric conversion, but missing/null remain distinct', () => {
    const variables = { number: '01', scientific: '1e2', decimal: '1.0', nil: null, empty: '', nested: '{"number":"01"}' };
    const getLocalVariable = key => {
        const value = variables[key];
        return value?.trim?.() === '' || isNaN(Number(value)) ? (value || '') : Number(value);
    };
    for (const [source, expected] of [
        ['var("number") == val("1")', true], ['var("scientific") == val("100")', true],
        ['var("decimal") != val("1")', false], ['var("nested.number") == val("01")', true],
        ['var("missing") === undefined', true], ['var("nil") === null', true], ['var("empty") == val("")', true],
    ]) assert.equal(executeCondition(parseCondition(source), () => ({ chatMetadata: { variables } }), getLocalVariable), expected, source);
});

test('nullish coalescing stays in raw editing, including nested groups', () => {
    const a = 'var("a") == val("1")', b = 'var("b") == val("1")';
    for (const source of [`(${a}) ?? (${b})`, `(${a}) && ((${a}) ?? (${b}))`]) assert.equal(conditionGroups(source), null);
});

test('an unterminated condition stays local and does not block other groups or no-op saves', () => {
    const source = '<varevent>\n[event.good]\ndisplay: keep\n[event.bad]\ncondition: "oops\ndisplay: invalid\n</varevent>\n'
        + block('other', 'untouched');
    const doc = createEventDocument(source);
    assert.equal(doc.groups.length, 2);
    assert.equal(doc.groups[0].events[0].values.display, 'keep');
    assert.throws(() => parseCondition(doc.groups[0].events[1].values.condition));
    assert.equal(serializeEventDocument(doc), source);
    doc.groups[1].events[0].values.display = 'edited';
    assert.ok(serializeEventDocument(doc).includes('condition: "oops'));
});
