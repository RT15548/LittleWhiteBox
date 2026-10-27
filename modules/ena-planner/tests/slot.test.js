import test from 'node:test';
import { setImmediate } from 'node:timers';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { createPlannerMarker, reservePlannerSlot } from '../ena-planner-slot.js';
import { createPlannerGeneration } from '../ena-planner-generation.js';

test('a retained release callback does not retain the native message after host return', () => {
    const moduleUrl = new URL('../ena-planner-slot.js', import.meta.url).href;
    const child = spawnSync(process.execPath, ['--expose-gc', '--input-type=module', '-e', `
        import assert from 'node:assert/strict';
        import { setImmediate } from 'node:timers/promises';
        import { reservePlannerSlot } from ${JSON.stringify(moduleUrl)};
        const { reference, release } = (() => {
            const source = {is_user:true,mes:'original'};
            const native = [{...source}];
            const release = reservePlannerSlot(native,source,'<identity>');
            return {reference:new WeakRef(native[0]),release};
        })();
        for(let i=0;i<20;i++) {
            await setImmediate();
            global.gc();
            if(!reference.deref()) break;
        }
        assert.equal(reference.deref(),undefined,'release callback retained the native message');
        assert.doesNotThrow(release);
        assert.doesNotThrow(release);
    `], { encoding: 'utf8', timeout: 10_000 });
    assert.equal(child.status, 0, child.stderr || String(child.error || 'GC fixture failed'));
});

// Contract: background generations cannot inherit the foreground's slot; WI
// sees the same text and names, and neither stored chat nor model requests keep
// a transport marker. These failures cause wrong context or unintended calls.
test('the slot changes only the supplied native copy and leaves WI scan text unchanged', () => {
    const source = { is_user: true, name: 'User', mes: ' input  ' };
    const foreground = [structuredClone(source)], background = [structuredClone(source)];
    const marker = createPlannerMarker();
    const release = reservePlannerSlot(foreground, source, marker);
    assert.equal(marker.trim(), '');
    assert.equal(foreground[0].mes.trim(), source.mes.trim());
    assert.equal(`${source.name}: ${foreground[0].mes}`.trim(), `${source.name}: ${source.mes}`.trim());
    assert.ok(foreground[0].mes.includes(marker));
    assert.deepEqual(background, [source]);
    release(); release();
    assert.deepEqual(foreground, [source]);
});

test('slot release cannot overwrite a later edit; the actual persistent message is rejected', () => {
    const source = { is_user: true, mes: 'input' }, native = [structuredClone(source)];
    const release = reservePlannerSlot(native, source, createPlannerMarker());
    native[0].mes = 'edited';
    release();
    assert.equal(native[0].mes, 'edited');
    assert.throws(() => reservePlannerSlot([source], source, createPlannerMarker()));
});

for (const before of [true, false]) test(`quiet native copy ${before ? 'before' : 'after'} foreground preparation cannot claim its run`, async () => {
    const source = { is_user: true, mes: 'input' }, actual = [source];
    const foreground = structuredClone(actual);
    let background = before ? structuredClone(actual) : null;
    let calls = 0, stops = 0;
    const runtime = createPlannerGeneration({
        chat: () => actual, identity: () => 'chat', enabled: () => true,
        createMarker: createPlannerMarker, reserveSlot: reservePlannerSlot,
        resolveApi: async () => ({}), orderHooks() {}, notice: () => () => {},
        stop: () => stops++, onError: error => { throw error; }, checkBudget: async () => {},
        plan: async context => { calls++; assert.equal(context[0].content, 'input\n\n'); return { filtered: '<plot>plan</plot>' }; },
        update() {},
    });
    await runtime.prepare(foreground, 1000, () => {}, 'normal');
    background ||= structuredClone(actual);
    await runtime.prepare(background, 1000, () => {}, 'quiet');
    const quiet = { type: 'quiet', prompt: background[0].mes }, normal = { prompt: foreground[0].mes };
    assert.equal(runtime.bindRequest(quiet, 'prompt'), false);
    await runtime.consume(quiet);
    assert.equal(runtime.bindRequest(normal, 'prompt'), true);
    const pending = runtime.consume(normal);
    await new Promise(resolve => setImmediate(resolve));
    await runtime.send();
    await pending;
    assert.equal(calls, 1); assert.equal(stops, 0);
    assert.equal(quiet.prompt, 'input');
    assert.equal(normal.prompt, 'input\n\n<plot>plan</plot>');
    assert.equal(foreground[0].mes, 'input');
});
