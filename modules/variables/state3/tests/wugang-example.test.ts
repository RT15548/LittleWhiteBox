import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import { compileDefinition } from '../definition/compile.js';
import { projectVariableFiles, variableBundleFromFiles } from '../definition/card-files.js';
import { initialize, settle } from '../engine/settle.js';
import { buildDescriptionView, buildUpdateView } from '../model/views.js';
import { getInputSchema } from '../model/tools.js';
import { buildUpdateTask } from '../model/prompts.js';
import { createSettlementService } from '../runtime/service.js';
import { beforeOutcome } from '../runtime/before-result.js';
import { accepted, fixture } from './fixture.js';
import { parseItemDocument } from '../../../card-workspace/item-document.js';
import type { Bundle, Json, JsonObject, UpdateStage } from '../types.js';

// Exercise the distributed CardFiles package, not a second handwritten test definition.
const folder = fileURLToPath(new URL('../skill/references/examples/wugang/', import.meta.url));
const walk = (dir: string): string[] => readdirSync(dir).flatMap(name => statSync(join(dir, name)).isDirectory() ? walk(join(dir, name)) : [join(dir, name)]);
const files = walk(folder).map(path => ({ path: 'card/' + relative(folder, path).split(sep).join('/'), content: readFileSync(path, 'utf8') }));
const bundle: Bundle = variableBundleFromFiles('card/', files), compiled = compileDefinition(bundle);
const action = (action: string, params: JsonObject = {}): JsonObject => ({ action, params });
const evidence = (name: string, id = 'EX-03') => action(name, { exhibitId: id });
const direct = (path: string[], value: Json): JsonObject => ({ op: 'set', path: ['docket', ...path], value });
const accuse = (ids = ['EX-03', 'EX-04'], suspectCode = 'suspect_b') => action('accuse', { suspectCode, evidence: ids });
const prepared = (roll = 0.1) => ({ rolls: Object.fromEntries(Object.keys(docket(bundle.definition.initial).exhibits).map(id => [id, roll])) });
interface Docket {
    clock: { minute: number; limit: number };
    exhibits: Record<string, { custodian: string; legalChain: boolean; contamination: string; sealed: boolean; inspected: boolean; tested: string; testLabel: string }>;
    people: Record<string, { trust: number; testified: boolean; name: string }>;
    claims: Record<string, { speaker: string; text: string; stance: string }>;
    leads: Record<string, { opened: boolean; title: string }>;
    verdict: { status: string; evidenceUsed: string[] };
}
const docket = (state: Json) => (state as unknown as { docket: Docket }).docket;
const start = async () => accepted(await initialize(compiled)).state;
async function trial(state: Json, input: JsonObject[], stage: UpdateStage = 'before', roll = 0.1) {
    return settle(compiled, state, input, { stage, prepared: prepared(roll) });
}
async function run(state: Json, input: JsonObject[], stage: UpdateStage = 'before', roll = 0.1) {
    return accepted(await trial(state, input, stage, roll)).state;
}
async function ready() {
    return run(await start(), [evidence('discover'), evidence('discover', 'EX-04'), evidence('inspect')]);
}
async function host() {
    const h = fixture(); h.setCard(bundle);
    const service = createSettlementService(h.adapter, { authorize: async () => {}, context: () => ({}), passage: () => '' });
    accepted(await service.enable());
    return { ...h, service };
}

test('the published package round-trips through CardFiles and starts with undisclosed clues and uncollected evidence', async () => {
    assert.deepEqual(variableBundleFromFiles('copy/', projectVariableFiles('copy/', bundle)), bundle);
    const card = JSON.parse(files.find(file => file.path === 'card/card.json')!.content);
    const world = files.filter(file => file.path.startsWith(`card/world_book/${card.world}/`)).map(file => parseItemDocument('world', file.content));
    assert.ok(world.length > 0);
    assert.equal(new Set(world.map(entry => entry.id)).size, world.length);
    assert.ok(world.every(entry => entry.settings.constant && !entry.settings.disable && entry.body.trim()));
    const state = await start(), d = docket(state);
    assert.deepEqual(Object.keys(state as JsonObject), ['docket']);
    assert.deepEqual(Object.keys(d).sort(), ['claims', 'clock', 'exhibits', 'leads', 'people', 'verdict']);
    assert.equal(d.clock.minute, 0);
    assert.ok(Object.values(d.exhibits).every(ex => ex.custodian === '' && ex.tested === 'none'));
    assert.ok(Object.values(d.leads).every(lead => !lead.opened && lead.title === ''));
    assert.deepEqual(d.claims, {});
    assert.equal(d.verdict.status, 'ongoing');
});

test('standard request guides expose before actions and only individual trust fields in after', async () => {
    const state = await start(), before = buildUpdateView(compiled, state, 'before'), after = buildUpdateView(compiled, state, 'after');
    assert.equal(before.actions.length, bundle.definition.actions.length);
    assert.deepEqual(before.writable, []);
    assert.ok(before.fields.filter(field => field.path.at(-1) === 'trust').every(field => field.write.length === 0 && !field.update));
    assert.deepEqual(after.actions, []);
    const expected = Object.keys(docket(state).people).map(code => ['docket', 'people', code, 'trust']);
    assert.deepEqual(after.writable.map(scope => scope.path), expected);
    const validate = new Ajv({ strict: false }).compile(getInputSchema(compiled, 'after'));
    const changes = [direct(['people', 'witness', 'trust'], 6)];
    assert.equal(validate(changes), true);
    const task = buildUpdateTask(compiled, state, { target: { floor: 1, swipeId: 0 }, messages: [] }, 'after');
    const guide = task.tools!.find(tool => tool.function.name === 'read_writing_guide')!;
    assert.ok(guide.function.description!.endsWith(JSON.stringify(after)));
    assert.ok(after.fields.filter(field => field.write.includes('direct')).every(field => field.update));
    const facts = buildDescriptionView(compiled, ['case']);
    assert.equal(facts.fields.some(field => Object.hasOwn(field, 'update')), false);
    const changed = docket(await run(state, changes, 'after'));
    assert.equal(changed.people.witness.trust, 6);
});

test('the guide trial executes as published and after changes only the witness trust', async () => {
    const guide = readFileSync(new URL('../skill/references/examples/wugang.md', import.meta.url), 'utf8');
    // Parse the documented user input as executable data, not a source-presence assertion.
    const input = JSON.parse(guide.match(/```json\n([\s\S]*?)\n```/)![1]);
    const before = accepted(await settle(compiled, await start(), input.before, { stage: 'before', prepared: input.prepared }));
    const after = accepted(await settle(compiled, before.state, input.after, { stage: 'after' }));
    assert.equal(docket(before.state).exhibits['EX-03'].tested, 'match');
    assert.ok(docket(before.state).claims['C-witness'].text);
    const expected = structuredClone(before.state) as unknown as { docket: Docket };
    expected.docket.people.witness.trust = 6;
    assert.deepEqual(after.state, expected);
});

test('stage and leaf permissions protect identities, testimony, and mechanical state while validating narrative bounds', async () => {
    const state = await start(), unchanged = structuredClone(state);
    for (const [stage, input] of [
        ['after', [evidence('discover')]], ['before', [direct(['people', 'witness', 'trust'], 6)]],
        ['after', [direct(['people', 'witness', 'name'], '另一个人')]],
        ['after', [direct(['people', 'witness', 'testified'], true)]],
        ['after', [direct(['clock', 'minute'], 10)]], ['after', [direct(['exhibits', 'EX-03', 'tested'], 'match')]],
        ['after', [direct(['people'], {})]], ['after', [direct(['people', 'witness', 'trust'], 11)]],
        ['after', [direct(['people', 'witness', 'trust'], -1)]],
    ] as [UpdateStage, JsonObject[]][]) {
        assert.equal((await trial(state, input, stage)).ok, false, JSON.stringify(input));
        assert.deepEqual(state, unchanged);
    }
    for (const trust of [0, 10]) {
        assert.equal(docket(await run(state, [direct(['people', 'witness', 'trust'], trust)], 'after')).people.witness.trust, trust);
    }
});

test('collection, sealing and inspection form a reachable ordered route; rejected batches publish no partial work', async () => {
    const state = await start();
    assert.equal((await trial(state, [evidence('inspect')])).ok, false);
    const result = accepted(await trial(state, [evidence('discover'), evidence('seal'), evidence('inspect')], 'before', 0.85));
    const d = docket(result.state);
    assert.equal(d.exhibits['EX-03'].custodian, 'clerk');
    assert.equal(d.exhibits['EX-03'].tested, 'match');
    assert.equal(d.leads['L-02'].opened, true);
    assert.ok(d.leads['L-02'].title.length > 0);
    for (const name of ['discover', 'seal', 'inspect']) {
        assert.equal((await trial(result.state, [evidence(name)])).ok, false);
    }
    const h = await host(), snapshot = h.saved();
    assert.equal((await h.service.apply([evidence('discover'), evidence('discover')], { stage: 'before' })).ok, false);
    assert.deepEqual(h.saved(), snapshot);
});

test('custody can return to the clerk, but neither rediscovery, sealing nor returning can clean a broken chain', async () => {
    let state = await run(await start(), [evidence('discover'), action('transfer', { exhibitId: 'EX-03', toCode: 'witness' })]);
    state = await run(state, [action('transfer', { exhibitId: 'EX-03', toCode: 'clerk' })]);
    assert.equal(docket(state).exhibits['EX-03'].legalChain, true);
    state = await run(state, [action('transfer', { exhibitId: 'EX-03', toCode: 'suspect_b' })]);
    const broken = docket(state).exhibits['EX-03'];
    assert.equal(broken.legalChain, false); assert.equal(broken.contamination, 'tainted');
    for (const name of ['discover', 'seal', 'inspect']) {
        assert.equal((await trial(state, [evidence(name)])).ok, false);
    }
    state = await run(state, [action('transfer', { exhibitId: 'EX-03', toCode: 'clerk' })]);
    assert.equal(docket(state).exhibits['EX-03'].legalChain, false);
    assert.equal(docket(state).exhibits['EX-03'].contamination, 'tainted');
    assert.equal((await trial(state, [evidence('inspect')])).ok, false);
});

test('two distinct valid submitted exhibits are required and verdicts do not borrow unsubmitted matches', async () => {
    const state = await ready();
    assert.equal((await trial(state, [accuse(['EX-03', 'EX-03'])])).ok, false);
    assert.equal(docket(await run(state, [accuse()])).verdict.status, 'right_accuse');
    assert.equal(docket(await run(state, [accuse(undefined, 'suspect_a')])).verdict.status, 'wrong_accuse');
    const other = await run(state, [evidence('discover', 'EX-01'), evidence('inspect', 'EX-01'), evidence('discover', 'EX-02')]);
    const unrelated = docket(await run(other, [accuse(['EX-01', 'EX-02'])])).verdict;
    assert.equal(unrelated.status, 'wrong_accuse');
    assert.deepEqual(unrelated.evidenceUsed, ['EX-01', 'EX-02']);
    const dirty = await run(state, [evidence('discover', 'EX-05'), action('transfer', { exhibitId: 'EX-05', toCode: 'suspect_a' })]);
    assert.equal((await trial(dirty, [accuse(['EX-03', 'EX-04', 'EX-05'])])).ok, false);
});

test('the same raw draw has the same sealing bonus in one batch and in successive batches', async () => {
    const state = await start();
    const combined = await run(state, [evidence('discover'), evidence('seal'), evidence('inspect')], 'before', 0.85);
    let separated = await run(state, [evidence('discover'), evidence('seal')]);
    separated = await run(separated, [evidence('inspect')], 'before', 0.85);
    assert.deepEqual(combined, separated);
    const unsealed = await run(state, [evidence('discover'), evidence('inspect')], 'before', 0.85);
    assert.equal(docket(combined).exhibits['EX-03'].tested, 'match');
    assert.equal(docket(unsealed).exhibits['EX-03'].tested, 'mismatch');
});

test('correction reuses one preparation even when the model changes the inspected exhibit', async t => {
    const random = t.mock.method(Math, 'random', () => 0.1), h = await host(), staged = await h.service.stage();
    const invalid = [evidence('discover', 'EX-01'), evidence('inspect', 'EX-01'), accuse()];
    const first = await staged.prepare(invalid, 'before'); assert.ok(first.ok);
    const rolls = structuredClone(first.prepared), calls = random.mock.callCount();
    assert.equal((await staged.run(invalid, { stage: 'before', prepared: rolls })).ok, false);
    const corrected = [evidence('discover'), evidence('inspect')], second = await staged.prepare(corrected, 'before');
    assert.ok(second.ok); assert.deepEqual(second.prepared, rolls); assert.equal(random.mock.callCount(), calls);
    const result = accepted(await staged.run(corrected, { stage: 'before', preview: false }));
    assert.equal(docket(result.state).exhibits['EX-03'].tested, 'match');
    assert.equal(random.mock.callCount(), calls);
});

test('missing or invalid inspection randomness rejects rather than persisting an invented failed result', async () => {
    const state = await run(await start(), [evidence('discover')]);
    const preparations: (Json | undefined)[] = [undefined, {}, { rolls: {} }, { rolls: { 'EX-03': 1 } }, { rolls: { 'EX-03': -0.1 } }];
    for (const preparation of preparations) {
        const result = await settle(compiled, state, [evidence('inspect')], { stage: 'before', prepared: preparation });
        assert.equal(result.ok, false);
        assert.equal(docket(state).exhibits['EX-03'].tested, 'none');
    }
});

test('the deadline cannot be bypassed by an accusation later in the same batch', async () => {
    const state = await run(await ready(), [action('advance', { minutes: 240 }), action('advance', { minutes: 230 })]);
    assert.equal(docket(state).clock.minute, 470);
    assert.equal((await trial(state, [action('advance', { minutes: 20 }), accuse()])).ok, false);
    assert.equal(docket(state).clock.minute, 470);
    const timed = accepted(await trial(state, [action('advance', { minutes: 120 })]));
    assert.equal(docket(timed.state).clock.minute, 480);
    assert.equal(docket(timed.state).verdict.status, 'timeout');
    const elapsed = timed.changes.find(change => change.path.join('.') === 'docket.clock.minute')!;
    assert.equal(Number(elapsed.after) - Number(elapsed.before), 10);
    assert.equal((await trial(timed.state, [accuse()])).ok, false);
});

test('players can explicitly close without accusing, and every ending stops substantive actions', async () => {
    const state = await run(await start(), [action('close_case', { reason: '现有证据不足，暂不指控。' })]);
    assert.equal(docket(state).verdict.status, 'no_accuse');
    assert.equal((await trial(state, [evidence('discover')])).ok, false);
    assert.equal((await trial(state, [action('close_case', { reason: '重复结案' })])).ok, false);
    const after = docket(await run(state, [direct(['people', 'witness', 'trust'], 6)], 'after'));
    assert.equal(after.people.witness.trust, 6);
    assert.deepEqual(after.verdict, docket(state).verdict);
});

test('testimony text survives in state and the saved before outcome, and cannot be submitted twice', async () => {
    const h = await host();
    const result = accepted(await h.service.apply([action('testify', { personCode: 'witness' })], {
        stage: 'before', source: 'model:before', beforeUpdate: { outcome: 'applied', diagnostics: [], inputDigest: 'witness-testimony' },
    }));
    const claim = docket(result.state).claims['C-witness'];
    assert.ok(claim.text.length > 0);
    assert.equal(claim.stance, '', 'an unnamed figure in the testimony does not identify a suspect');
    const projected = beforeOutcome(result.receipt!);
    assert.equal(projected.changes.find(change => change.path.join('.') === 'docket.claims.C-witness.text')?.after, claim.text);
    assert.equal(docket(result.state).people.witness.testified, true);
    assert.equal((await h.service.apply([action('testify', { personCode: 'witness' })], { stage: 'before' })).ok, false);
    const idle = accepted(await trial(result.state, []));
    assert.deepEqual(idle.actions, []); assert.deepEqual(idle.changes, []);
    assert.equal(Object.hasOwn(docket(idle.state), 'events'), false);
});

test('restoration and undo reuse recorded results, while explicit replacement recomputes from the original floor', async t => {
    let roll = 0.1;
    const random = t.mock.method(Math, 'random', () => roll), h = await host();
    const input = [evidence('discover'), evidence('inspect')];
    const result = accepted(await h.service.apply(input, { stage: 'before' })), calls = random.mock.callCount();
    const receipt = result.receipt!, saved = h.saved();
    const removed = await h.service.restoreSelection([receipt], []); assert.ok(removed);
    const emptied = accepted(removed);
    assert.equal(docket(emptied.state).exhibits['EX-03'].custodian, '');
    const restored = await h.service.restoreSelection([], [receipt]); assert.ok(restored);
    assert.deepEqual(accepted(restored).state, result.state);
    const reloaded = fixture(); reloaded.load(saved);
    assert.deepEqual(accepted(await reloaded.service.inspect()).state, result.state);
    const undone = accepted(await h.service.undo());
    assert.equal(docket(undone.state).exhibits['EX-03'].tested, 'none');
    assert.equal(random.mock.callCount(), calls);
    accepted(await h.service.apply(input, { stage: 'before' }));
    roll = 0.99;
    const replaced = accepted(await h.service.apply(input, { stage: 'before', replace: true }));
    assert.equal(docket(replaced.state).exhibits['EX-03'].tested, 'mismatch');
    assert.equal(docket(replaced.state).leads['L-02'].opened, false);
});
