import test from 'node:test';
import assert from 'node:assert/strict';
import Ajv from 'ajv';
import { compileDefinition } from '../definition/compile.js';
import { equipmentExample } from '../definition/example.js';
import { initialize, settle } from '../engine/settle.js';
import { buildDescriptionView, buildUpdateView } from '../model/views.js';
import { getInputSchema, getTools } from '../model/tools.js';
import { buildUpdateTask } from '../model/prompts.js';
import { APPROVAL, GUIDE_RESULT, HANDOFF, MANUSCRIPT_RESULT, REQUIREMENTS_RESULT, WORK_REQUIREMENTS } from '../../updater/handoff.js';
import { correctionTask } from '../../updater/correction.js';
import { accepted, fixture } from './fixture.js';
import { contains, overlaps } from '../engine/data.js';
import { canWriteDirect } from '../definition/stages.js';
import * as agentCore from '../../../agent-core/browser-entry.js';
import { createPublicAgentApi } from '../../../agent-core/public-api.js';
import type { Json, JsonObject } from '../types.js';

test('K9: V5 supplies four ordered exchanges with payloads mounted in tool descriptions; correction appends the rejected response and diagnostics to the same task', async () => {
    const compiled = compileDefinition(equipmentExample()), start = accepted(await initialize(compiled));
    const context = { target: { floor: 2, swipeId: 0 }, messages: [{ role: 'assistant', content: 'Completed passage.' }] };
    const task = buildUpdateTask(compiled, start.state, context);
    const exchanges = task.messages.filter(message => message.role === 'tool');
    assert.deepEqual(exchanges.map(message => message.toolName),
        [HANDOFF.manuscript, HANDOFF.guide, HANDOFF.requirements, HANDOFF.approval]);
    assert.deepEqual(exchanges.map(message => JSON.parse(String(message.content))), [
        { status: MANUSCRIPT_RESULT },
        { status: GUIDE_RESULT },
        { status: REQUIREMENTS_RESULT },
        { approval: APPROVAL },
    ]);
    assert.equal(task.toolChoice, 'auto');
    assert.deepEqual(task.tools!.map(tool => tool.function.name),
        [HANDOFF.manuscript, HANDOFF.guide, HANDOFF.requirements, HANDOFF.approval, HANDOFF.write]);
    assert.ok(task.tools![0].function.description!.endsWith(JSON.stringify(context)));
    assert.ok(task.tools![1].function.description!.endsWith(JSON.stringify(buildUpdateView(compiled, start.state))));
    assert.ok(task.tools![2].function.description!.endsWith(WORK_REQUIREMENTS));
    const submission = { text: '', toolCalls: [{ id: 'local', name: 'write', arguments: '{"state":[]}' }], completion: 'complete', truncated: false };
    const corrected = correctionTask(task, submission, [{ code: 'action-precondition' }], 'state');
    assert.deepEqual(corrected.messages.slice(0, -1), task.messages);
    const appended = corrected.messages.at(-1)!;
    assert.equal(appended.role, 'user');
    assert.deepEqual(JSON.parse(String(appended.content).slice(String(appended.content).indexOf('\n\n') + 2)), { submission, errors: [{ code: 'action-precondition' }] });
});

// DeepSeek thinking with tools rejects replayed calls without reasoning; the Agent layer
// derives it from each platform-supplied call's text, so V5 must be sendable with thinking.
test('K9: V5 exchanges are sendable to DeepSeek with provider-default thinking', async t => {
    const compiled = compileDefinition(equipmentExample()), start = accepted(await initialize(compiled));
    const task = buildUpdateTask(compiled, start.state, { target: { floor: 2, swipeId: 0 }, messages: [] });
    const bodies: { messages: { tool_calls?: unknown[], reasoning_content?: string }[] }[] = [];
    t.mock.method(globalThis, 'fetch', async (input: RequestInfo, init?: RequestInit) => {
        const request = new Request(input, init);
        assert.equal(new URL(request.url).hostname, 'offline.invalid');
        bodies.push(await request.json());
        return Response.json({ choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: 'done' } }] });
    });
    const settings = agentCore.normalizeAgentSettings({ currentPresetName: 'offline', presets: { offline: {
        provider: 'openai-compatible', model: 'deepseek-v4-flash', apiKey: 'offline-fixture', baseUrl: 'https://offline.invalid',
        toolMode: 'native', maxTokens: 64, reasoning: { mode: 'inherit' } } } });
    const { api } = createPublicAgentApi({ isEnabled: () => true, loadSettings: () => settings, loadCore: async () => agentCore });
    const session = await api.openSession();
    await session.chat(task);
    session.dispose();
    const replayed = bodies[0].messages.filter(message => message.tool_calls);
    assert.equal(replayed.length, 4);
    for (const message of replayed) {assert.ok(message.reasoning_content?.trim());}
});

// K2/K9: provider-compatible paths retain their shape; forbidden writes publish nothing
// and the update view identifies writable fields (protocol failure / state corruption).
test('K2/K9: path schemas avoid array enums, settlement enforces permissions and RP descriptions expose only facts', async () => {
    const compiled = compileDefinition(equipmentExample());
    const schema = getInputSchema(compiled), validate = new Ajv({ strict: false }).compile(schema);
    for (const variant of (schema.items as JsonObject).anyOf as JsonObject[]) {
        const path = (variant.properties as JsonObject).path as JsonObject | undefined;
        if (!path) {continue;}
        assert.equal(Object.hasOwn(path, 'enum'), false);
        assert.equal(path.type, 'array'); assert.deepEqual(path.items, { type: 'string' });
        assert.equal(path.minItems, 2); assert.equal(typeof path.description, 'string');
    }
    assert.equal(validate([{ op: 'set', path: ['hero', 'health'], value: 50, reason: 'healed', old: 40 }]), true);
    assert.equal(validate([{ op: 'set', path: ['hero'], value: 1 }]), false);
    assert.equal(validate([{ op: 'set', path: ['hero', 1], value: 1 }]), false);
    const host = fixture(); accepted(await host.service.enable(equipmentExample()));
    for (const path of [['hero'], ['hero', 'maxHealth'], ['hero', 'amulet'], ['hero', 'absent']]) {
        const before = host.saved();
        const result = await host.service.apply([{ op: 'set', path: ['hero', 'health'], value: 50 }, { op: 'set', path, value: 1 }]);
        assert.equal(result.ok, false); assert.deepEqual(host.saved(), before);
    }
    const view = buildDescriptionView(compiled, ['equipment']);
    assert.deepEqual(view.fields, [{ path: ['hero', 'amulet'], description: compiled.definition.access[2].description }]);
    for (const key of ['state', 'values', 'result']) {assert.equal(Object.hasOwn(view, key), false);}
    assert.ok(view.actions.every(item => typeof item === 'string'));
    assert.deepEqual(view.rules, [compiled.definition.rules[0].description]);
    assert.deepEqual(view.constraints, []);
    assert.deepEqual(buildDescriptionView(compiled, ['character']).constraints, [compiled.definition.constraints[0].description]);
    const facts = equipmentExample(), get = (...path: string[]) => ({ get: path }), unchanged = { type: 'object', additionalProperties: false, properties: {} };
    facts.definition.rules = []; facts.definition.constraints = [];
    facts.definition.actions.push({ id: 'heal', title: 'Heal', parameters: unchanged, conversions: [], description: 'A healing spell restores 10 health.', requires: { literal: true },
        effects: [{ path: ['hero', 'health'], value: { op: 'add', args: [get('hero', 'health'), { literal: 10 }] } }] });
    facts.definition.triggers = [
        { id: 'amulet-rest', description: 'Resting heals more while wearing the amulet.', when: { literal: false }, effects: [{ path: ['hero', 'health'], value: { op: 'if', args: [get('hero', 'amulet'), { literal: 20 }, { literal: 10 }] } }] },
        { id: 'earlier-amulet', description: 'Removing the amulet leaves a scar.', when: { literal: false }, effects: [{ path: ['hero', 'health'], value: { op: 'if', args: [{ before: ['hero', 'amulet'] }, { literal: 1 }, { literal: 2 }] } }] },
    ];
    const factView = (section: string) => buildDescriptionView(compileDefinition(facts), [section]);
    assert.ok(factView('character').actions.includes('A healing spell restores 10 health.'));
    assert.equal(factView('equipment').actions.includes('A healing spell restores 10 health.'), false);
    assert.deepEqual(factView('equipment').triggers, ['Resting heals more while wearing the amulet.', 'Removing the amulet leaves a scar.']);
    assert.equal(Object.hasOwn(view.sections[0], 'values'), false);
    const guide = buildUpdateView(compiled, accepted(await initialize(compiled)).state);
    assert.deepEqual(guide.writable.map(field => field.path), [['hero', 'health']]);
    assert.equal(guide.fields.find(field => field.path.join('.') === 'hero.health')?.update, compiled.definition.access[1].update);
    assert.equal(new Ajv({ strict: false }).compile(getTools(compiled)[0].function.parameters)({ state: [] }), true);
});

test('K9: optional objects, dynamic keys, arrays and composite schemas remain writable through the model interface', async () => {
    const bundle = equipmentExample();
    bundle.definition.schema = { type: 'object', additionalProperties: false, properties: {
        profile: { type: 'object', required: ['name'], additionalProperties: false, properties: { name: { anyOf: [{ type: 'string' }, { type: 'null' }] } } },
        bag: { type: 'array', items: { type: 'string' } },
        people: { type: 'object', additionalProperties: { type: 'number' } },
    } };
    bundle.definition.initial = {}; bundle.definition.rules = []; bundle.definition.actions = []; bundle.definition.constraints = [];
    bundle.definition.access = ['profile', 'bag', 'people'].map(key => ({ path: [key], direct: true, description: key }));
    const compiled = compileDefinition(bundle), validate = new Ajv({ strict: false }).compile(getInputSchema(compiled));
    const inputs = [
        [{ op: 'set', path: ['profile'], value: { name: 'Alice' } }],
        [{ op: 'set', path: ['bag'], value: [] }, { op: 'set', path: ['bag', '0'], value: 'map' }],
        [{ op: 'set', path: ['people'], value: {} }, { op: 'set', path: ['people', 'Lv.3'], value: 3 }],
    ];
    let state: Json = {};
    for (const input of inputs) {
        assert.equal(validate(input), true, JSON.stringify(validate.errors));
        state = accepted(await settle(compiled, state, input)).state;
    }
});

// M1: referencing the same field structure preserves model permissions and required fields,
// including nested/shared references (cost: omitted updates or forbidden writes).
test('referenced state schemas expose the same writable fields and stage restrictions as expanded schemas', async () => {
    const expanded = equipmentExample();
    expanded.definition.updates = ['before', 'after'];
    expanded.definition.actions.forEach(action => {action.stages = ['before'];});
    expanded.definition.access.filter(entry => entry.direct).forEach(entry => {entry.stages = ['after'];});
    const schema = structuredClone(expanded.definition.schema) as JsonObject;
    const hero = (schema.properties as JsonObject).hero as JsonObject;
    const health = (hero.properties as JsonObject).health;
    const shapes = [
        { $ref: '#/$defs/state', $defs: { state: schema } },
        { ...schema, properties: { hero: { $ref: '#/$defs/hero', title: 'Hero' } }, $defs: { hero } },
        { ...schema, properties: { hero: { type: 'object', $ref: '#/$defs/hero', properties: { amulet: { type: 'boolean' } } } }, $defs: { hero } },
        { ...schema, properties: { hero: { type: 'object', allOf: [hero, { properties: { amulet: { type: 'boolean' } } }] } } },
        { ...schema, properties: { hero: { ...hero, properties: { ...hero.properties as JsonObject, health: { $ref: '#/$defs/health' } } } }, $defs: { health } },
    ];
    for (const shape of shapes) {
        const bundle = structuredClone(expanded); bundle.definition.schema = shape;
        const compiled = compileDefinition(bundle), baseline = compileDefinition(expanded);
        const state = accepted(await initialize(compiled)).state;
        for (const stage of ['before', 'after'] as const) {
            const guide = buildUpdateView(compiled, state, stage);
            assert.deepEqual(guide.writable, buildUpdateView(baseline, state, stage).writable);
            assert.deepEqual(getInputSchema(compiled, stage), getInputSchema(baseline, stage));
            for (const path of [['hero', 'health'], ['hero', 'maxHealth'], ['hero', 'amulet']]) {
                const input = [{ op: 'set', path, value: 20 }];
                assert.equal((await settle(compiled, state, input, { stage })).ok,
                    stage === 'after' && path[1] === 'health');
            }
        }
    }
    const recursive = equipmentExample();
    recursive.definition = { ...recursive.definition, initial: { head: { value: 1 }, backup: { value: 2 } }, rules: [], actions: [], constraints: [],
        access: ['head', 'backup'].map(key => ({ path: [key], direct: true, description: key })),
        schema: { type: 'object', properties: { head: { $ref: '#/$defs/node' }, backup: { $ref: '#/$defs/node' } },
            $defs: { node: { type: 'object', required: ['value'], properties: { value: { type: 'number' }, next: { $ref: '#/$defs/node' } } } } } };
    const compiled = compileDefinition(recursive), state = accepted(await initialize(compiled)).state;
    const writable = buildUpdateView(compiled, state, 'after').writable;
    for (const root of ['head', 'backup']) {
        assert.ok(writable.some(scope => contains(scope.path, [root, 'next', 'next', 'value'])));
        const removal = await settle(compiled, state, [{ op: 'remove', path: [root, 'value'] }], { stage: 'after' });
        assert.equal(removal.ok, false); assert.equal(removal.diagnostics[0].code, 'state-schema');
    }
    const result = accepted(await settle(compiled, state, [{ op: 'set', path: ['head', 'next'], value: { value: 3 } }], { stage: 'after' }));
    assert.deepEqual(result.state, { head: { value: 1, next: { value: 3 } }, backup: { value: 2 } });
});

// M1: scope grants and exclusions must match execution for nested and staged paths.
// Cost: omitted legitimate updates or model submissions rejected by the engine.
test('model scope permissions match execution including protected descendants and stage overlaps', async () => {
    const bundle = equipmentExample();
    const paths = [['hero'], ['hero', 'health'], ['hero', 'maxHealth'], ['hero', 'locked'], ['hero', 'locked', 'value'], ['hero', 'free'], ['other']];
    for (let mask = 0; mask < 16; mask++) {
        bundle.definition.updates = ['before', 'after'];
        bundle.definition.actions.forEach(action => {action.stages = ['before'];});
        bundle.definition.access = paths.slice(0, 4).map((path, index) => ({ path, direct: Boolean(mask & (1 << index)),
            stages: index % 2 ? ['after'] : ['before', 'after'], description: 'Scope' }));
        const compiled = compileDefinition(bundle), state = accepted(await initialize(compiled)).state;
        for (const stage of [undefined, 'before', 'after'] as const) {
            const guide = buildUpdateView(compiled, state, stage);
            for (const path of paths) {
                const exposed = guide.writable.some(scope => contains(scope.path, path) && !scope.excluded.some(excluded => overlaps(excluded, path)));
                assert.equal(exposed, canWriteDirect(bundle.definition, path, stage));
            }
        }
    }
});
