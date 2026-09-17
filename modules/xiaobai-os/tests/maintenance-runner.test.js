import assert from 'node:assert/strict';
import test from 'node:test';

import { createMaintenanceRegistry } from '../capabilities/maintenance/registry.js';
import { createMaintenanceRunner } from '../capabilities/maintenance/runner.js';
import { aggregateMaintenanceStatus } from '../capabilities/maintenance/outcome.js';
import { createMapKernelHarness } from './map-kernel-harness.js';
import { createMapMaintenanceParticipant } from '../apps/map/host/maintenance-participant.js';
import { createEmptyMapDomain } from '../domains/map/state.js';

const user = mes => ({ is_user: true, is_system: false, mes, name: 'Alice' });
const assistant = mes => ({ is_user: false, is_system: false, mes, name: 'Narrator', swipe_id: 0 });
const surface = (messages = [user('U1'), assistant('A1')]) => ({
    identityKey: 'chat:one', messages, playerName: 'Alice', assistantName: 'Narrator',
});

function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
}

const flush = () => new Promise(resolve => globalThis.setTimeout(resolve, 0));

function runManual(runner, participantId = 'map') {
    const start = runner.startManual(participantId);
    if (start.status === 'busy') {throw new Error('maintenance unexpectedly busy');}
    return start.status === 'started' ? start.completion : Promise.resolve(start.outcome);
}

function unconfirmedMutationError(message) {
    return Object.assign(new Error(message), { mutationCommitted: true, uncertain: true });
}

function validConfig(provider = 'sillytavern-openai-compatible') {
    return {
        currentPresetName: 'maintenance',
        presets: {
            maintenance: {
                provider,
                modelConfigs: {
                    [provider]: { model: 'test-model', apiKey: provider.startsWith('sillytavern-') ? '' : 'test-key' },
                },
            },
        },
    };
}

function functionTool(name) {
    return { type: 'function', function: { name, parameters: { type: 'object', properties: {} } } };
}

function createParticipant(id, options = {}) {
    const records = { commits: 0, invalidations: [], sessions: [], toolCalls: [] };
    const participant = {
        id,
        isEnabled: options.isEnabled || (() => true),
        createSession(source, mode) {
            records.sessions.push({ source, mode });
            let staged = options.initiallyStaged === true;
            let failed = false;
            return {
                participantId: id,
                prompt: `Maintain ${id}.`,
                dataMessages: options.dataMessages || [],
                tools: options.tools || [],
                async executeTool(name, args) {
                    records.toolCalls.push({ name, args });
                    if (options.executeTool) {
                        const result = await options.executeTool(name, args);
                        if (result?.ok === false) {failed = true;} else {staged = options.stageOnTool !== false; failed = false;}
                        return result;
                    }
                    staged = options.stageOnTool !== false;
                    failed = false;
                    return { ok: true, status: staged ? 'updated' : 'unchanged', changed: staged };
                },
                canCommit: () => options.canCommit ? options.canCommit(staged, records) : staged,
                getResult: () => ({ status: failed ? (staged ? 'partial' : 'failed') : staged ? 'updated' : 'unchanged', changed: staged }),
                async commit(guard) {
                    if (!guard()) {throw new Error('stale source');}
                    if (options.commit) {await options.commit(guard, records);}
                    else {records.commits += 1;}
                },
                invalidate(reason) {records.invalidations.push(reason); staged = false;},
            };
        },
    };
    return { participant, records };
}

function createWriteGate(initial = 'ready') {
    let state = initial;
    const listeners = new Set();
    return {
        getState: () => state,
        subscribe(listener) {listeners.add(listener); return () => listeners.delete(listener);},
        set(next) {state = next; listeners.forEach(listener => listener(next));},
        notify(observed) {listeners.forEach(listener => listener(observed));},
    };
}

function createHarness({
    participants = [],
    chat = surface(),
    provider = 'sillytavern-openai-compatible',
    agent,
    gate = createWriteGate(),
    generationActive = false,
    captureBackground,
} = {}) {
    let currentSurface = chat;
    const calls = { loadConfig: 0, openSession: 0, run: 0, requests: [] };
    const resolvedAgent = agent || { supportsSessionToolLoop: false, async run() {return { text: 'no changes' };} };
    const gateway = {
        async loadConfig() {calls.loadConfig += 1; return validConfig(provider);},
        async openSession() {
            calls.openSession += 1;
            return {
                providerConfig: { provider },
                supportsSessionToolLoop: resolvedAgent.supportsSessionToolLoop === true,
                async run(request) {
                    calls.run += 1;
                    calls.requests.push(structuredClone({ ...request, signal: undefined }));
                    return await resolvedAgent.run(request, calls.run);
                },
            };
        },
    };
    const runner = createMaintenanceRunner({
        registry: createMaintenanceRegistry(participants),
        gateway,
        writeGate: gate,
        captureSurface: () => currentSurface,
        isGenerationActive: () => generationActive,
        ...(captureBackground ? { captureBackground } : {}),
        onError: () => undefined,
    });
    return { calls, gate, runner, setSurface: next => {currentSurface = next;} };
}

test('aggregate outcome reports partial only when some participant actually preserved a change', () => {
    const result = (participantId, status, changed = false) => ({ participantId, status, changed });
    assert.equal(aggregateMaintenanceStatus([
        result('map', 'failed'), result('tasks', 'skipped'),
    ]), 'failed');
    assert.equal(aggregateMaintenanceStatus([
        result('map', 'failed'), result('tasks', 'unchanged'),
    ]), 'failed');
    assert.equal(aggregateMaintenanceStatus([
        result('map', 'failed'), result('tasks', 'updated', true),
    ]), 'partial');
});

test('real Map rebuild replaces old content only after a complete successful run; incremental failure keeps valid additions', async t => {
    for (const mode of ['manual', 'rebuild']) {
        for (const ending of ['provider-error', 'unresolved', 'corrected', 'success', 'cancelled']) {
            await t.test(`${mode}/${ending}`, async () => {
                const original = createEmptyMapDomain();
                original.atlas.locations = ['home', 'city', 'gate'].map(key => ({ key, name: key, scale: 'room', status: 'visited' }));
                original.atlas.actors = [{ actorKey: 'player', displayName: 'Alice', locationKey: 'home' }];
                const kernel = createMapKernelHarness(original);
                const participant = createMapMaintenanceParticipant({ map: kernel.map, readSettings: () => ({ autoMaintenance: true }) });
                const h = createHarness({ participants: [participant], agent: {
                    async run(_request, round) {
                        if (round === 1) {
                            return { toolCalls: [{ id: 'new-place', name: 'MapAtlasEdit', arguments: JSON.stringify({
                                locations: [{ key: 'new', name: 'New' }, ...(['unresolved', 'corrected'].includes(ending) ? [{ key: 'broken', name: '' }] : [])],
                            }) }] };
                        }
                        if (ending === 'provider-error') {throw new Error('offline');}
                        if (ending === 'cancelled') {h.runner.cancelAll(); return { text: 'cancelled' };}
                        if (ending === 'corrected' && round === 2) {
                            return { toolCalls: [{ id: 'repair', name: 'MapAtlasEdit', arguments: JSON.stringify({ locations: [{ key: 'broken', name: 'Repaired' }] }) }] };
                        }
                        return { text: 'done' };
                    },
                } });
                const start = mode === 'rebuild' ? h.runner.startRebuild('map') : h.runner.startManual('map');
                const result = await start.completion;
                const success = ending === 'success' || ending === 'corrected';
                const saved = ending !== 'cancelled' && (mode === 'manual' || success);
                assert.equal(kernel.state.writes.length, saved ? 1 : 0);
                assert.deepEqual(result.committedParticipantIds, saved ? ['map'] : []);
                if (!saved) {
                    assert.deepEqual(kernel.state.persisted.partitions.map, original);
                    assert.equal(result.status, ending === 'cancelled' ? 'cancelled' : 'failed');
                } else {
                    const map = kernel.state.persisted.partitions.map;
                    assert.equal(map.atlas.locations.some(place => place.key === 'new'), true);
                    assert.equal(map.atlas.locations.some(place => place.key === 'home'), mode === 'manual');
                    assert.deepEqual(map.atlas.actors, mode === 'manual' ? original.atlas.actors : []);
                    assert.equal(result.status, success ? 'updated' : 'partial');
                }
                h.runner.stopBackground();
            });
        }
    }
});

test('registry and disabled automatic mode perform no capture-adjacent Agent work', async () => {
    const disabled = createParticipant('map', { isEnabled: mode => mode !== 'automatic' });
    const harness = createHarness({ participants: [disabled.participant] });
    assert.equal(harness.runner.handleMessageSent(1), false);
    await flush();
    assert.deepEqual(harness.calls, { loadConfig: 0, openSession: 0, run: 0, requests: [] });
    assert.throws(() => createMaintenanceRegistry([disabled.participant, disabled.participant]), /Duplicate/);
});

test('real Map manual and rebuild jobs persist after new turns, but not after their evidence or chat changes', async t => {
    for (const mode of ['manual', 'rebuild']) {
        for (const boundary of ['append', 'edit', 'chat']) {
            await t.test(`${mode}/${boundary}`, async () => {
                const original = createEmptyMapDomain();
                const kernel = createMapKernelHarness(original);
                const chat = surface();
                const staged = deferred(); const finish = deferred();
                const participant = createMapMaintenanceParticipant({ map: kernel.map, readSettings: () => ({ autoMaintenance: true }) });
                const h = createHarness({ chat, participants: [participant], agent: {
                    async run(_request, round) {
                        if (round === 1) { return { toolCalls: [{ id: 'place', name: 'MapAtlasEdit',
                            arguments: JSON.stringify({ locations: [{ key: 'harbor', name: 'Harbor' }] }) }] }; }
                        staged.resolve(); return finish.promise;
                    },
                } });
                const run = mode === 'manual' ? h.runner.startManual('map') : h.runner.startRebuild('map');
                await staged.promise;
                if (boundary === 'append') { chat.messages.push(user('U2'), assistant('A2')); }
                if (boundary === 'edit') { chat.messages[1].mes = 'changed evidence'; }
                if (boundary === 'chat') { h.setSurface({ ...chat, identityKey: 'chat:other' }); }
                finish.resolve({ text: 'Done.' });
                const outcome = await run.completion;
                assert.equal(outcome.status, boundary === 'append' ? 'updated' : 'cancelled');
                assert.equal(kernel.state.writes.length, boundary === 'append' ? 1 : 0);
                if (boundary === 'append') { assert.equal(kernel.state.persisted.partitions.map.atlas.locations[0].key, 'harbor'); }
                else { assert.deepEqual(kernel.state.persisted.partitions.map, original); }
                h.runner.stopBackground();
            });
        }
    }
});

test('nullable no-work sessions skip without loading Agent configuration', async () => {
    let backgroundCaptures = 0;
    const participant = {
        id: 'map',
        isEnabled: () => true,
        async createSession() {return null;},
    };
    const harness = createHarness({
        participants: [participant],
        captureBackground() {backgroundCaptures += 1; return [];},
    });
    const outcome = await runManual(harness.runner);

    assert.equal(outcome.status, 'skipped');
    assert.equal(outcome.reason, 'no-work');
    assert.deepEqual(outcome.participantResults, [{
        participantId: 'map', status: 'skipped', changed: false, reason: 'no-work',
    }]);
    assert.deepEqual(harness.calls, { loadConfig: 0, openSession: 0, run: 0, requests: [] });
    assert.equal(backgroundCaptures, 0);
});

test('manual maintenance is admitted as a Host job and rejects duplicate starts while running', async () => {
    const response = deferred();
    const map = createParticipant('map');
    const harness = createHarness({
        participants: [map.participant],
        agent: { run: () => response.promise },
    });

    const started = harness.runner.startManual('map');
    assert.equal(started.status, 'started');
    assert.deepEqual(harness.runner.getStatus('map', 'chat:one'), {
        state: 'running', mode: 'manual', message: '', reason: '', lastRunAt: null,
    });
    assert.deepEqual(harness.runner.startManual('map'), {
        status: 'busy', mode: 'manual', reason: 'participant-busy',
    });

    response.resolve({ text: 'done' });
    const outcome = await started.completion;
    assert.equal(outcome.status, 'unchanged');
    assert.equal(harness.runner.getStatus('map', 'chat:one').state, 'idle');
});

test('maintenance status and notifications are isolated by chat identity', async () => {
    const response = deferred();
    const map = createParticipant('map');
    const harness = createHarness({
        participants: [map.participant],
        agent: { run: () => response.promise },
    });
    const notifications = [];
    harness.runner.subscribeStatus((participantId, chatIdentity, status) => {
        notifications.push({ participantId, chatIdentity, state: status.state, message: status.message });
    });

    const first = harness.runner.startManual('map');
    assert.equal(first.status, 'started');
    harness.setSurface({ ...surface(), identityKey: 'chat:two' });
    harness.runner.handleChatChanged();

    assert.equal(harness.runner.getStatus('map', 'chat:one').message, 'cancelled');
    assert.deepEqual(harness.runner.getStatus('map', 'chat:two'), {
        state: 'idle', mode: null, message: '', reason: '', lastRunAt: null,
    });
    assert.equal(notifications.every(item => item.chatIdentity === 'chat:one'), true);

    const second = harness.runner.startManual('map');
    assert.equal(second.status, 'started');
    assert.equal(harness.runner.getStatus('map', 'chat:two').state, 'running');
    assert.equal(notifications.at(-1).chatIdentity, 'chat:two');

    harness.runner.cancelAll('test-complete');
    response.resolve({ text: 'done' });
    await flush();
});

test('accepted turns captured while saving stay FIFO and do no config, adapter, or API work until ready', async () => {
    const gate = createWriteGate('saving');
    const first = createParticipant('map', { tools: [functionTool('map_edit')] });
    let round = 0;
    const harness = createHarness({
        participants: [first.participant],
        chat: surface([user('U1'), assistant('A1'), user('U2')]),
        gate,
        agent: { async run() {round += 1; return round === 1 ? { toolCalls: [{ id: 'one', name: 'map_edit', arguments: '{}' }] } : { text: 'done' }; } },
    });
    assert.equal(harness.runner.handleMessageSent(2), true);
    await flush();
    assert.equal(first.records.sessions.length, 0);
    assert.deepEqual(harness.calls, { loadConfig: 0, openSession: 0, run: 0, requests: [] });

    gate.set('ready');
    await flush();
    await flush();
    assert.equal(first.records.sessions.length, 1);
    assert.equal(first.records.commits, 1);
    assert.equal(harness.calls.openSession, 1);
    assert.equal(harness.calls.run, 2);
});

test('a write gate raised during session creation blocks all Agent work until ready', async () => {
    const gate = createWriteGate();
    const sessionGate = deferred();
    const map = createParticipant('map');
    const participant = {
        ...map.participant,
        async createSession(source, mode) {
            await sessionGate.promise;
            return map.participant.createSession(source, mode);
        },
    };
    const harness = createHarness({ participants: [participant], gate });
    const pending = runManual(harness.runner);

    await flush();
    gate.set('saving');
    sessionGate.resolve();
    await flush();
    assert.equal(harness.calls.loadConfig, 0);
    assert.equal(harness.calls.openSession, 0);
    assert.equal(harness.calls.run, 0);

    gate.set('ready');
    const outcome = await pending;
    assert.equal(outcome.status, 'unchanged');
    assert.equal(harness.calls.loadConfig, 1);
    assert.equal(harness.calls.openSession, 1);
    assert.equal(harness.calls.run, 1);
});

test('a write gate raised after a tool call pauses the next provider round', async () => {
    const gate = createWriteGate();
    const map = createParticipant('map', {
        tools: [functionTool('map_edit')],
        executeTool() {
            gate.set('saving');
            return { ok: true, status: 'updated', changed: true };
        },
    });
    const harness = createHarness({
        participants: [map.participant],
        gate,
        agent: {
            async run(_request, round) {
                return round === 1
                    ? { toolCalls: [{ id: 'edit', name: 'map_edit', arguments: '{}' }] }
                    : { text: 'done' };
            },
        },
    });
    const pending = runManual(harness.runner);
    await flush();
    assert.equal(harness.calls.run, 1);
    assert.equal(map.records.commits, 0);

    gate.set('ready');
    const outcome = await pending;
    assert.equal(outcome.status, 'updated');
    assert.equal(harness.calls.run, 2);
    assert.equal(map.records.commits, 1);
});

test('a ready notification for another identity cannot cross the current write gate', async () => {
    const gate = createWriteGate('saving');
    const map = createParticipant('map');
    const harness = createHarness({ participants: [map.participant], gate });
    const pending = runManual(harness.runner);
    await flush();

    gate.notify('ready');
    await flush();
    assert.equal(map.records.sessions.length, 0);
    assert.equal(harness.calls.loadConfig, 0);

    gate.set('ready');
    const outcome = await pending;
    assert.equal(outcome.status, 'unchanged');
    assert.equal(map.records.sessions.length, 1);
});

test('one job opens one adapter and ordinary providers receive complete assistant/tool history', async () => {
    const map = createParticipant('map', { tools: [functionTool('map_edit')] });
    const harness = createHarness({
        participants: [map.participant],
        agent: { async run(_request, round) {return round === 1 ? { toolCalls: [{ id: 'call-1', name: 'map_edit', arguments: '{"value":1}' }] } : { text: 'done' }; } },
    });
    const outcome = await runManual(harness.runner);
    assert.equal(outcome.status, 'updated');
    assert.deepEqual(outcome.committedParticipantIds, ['map']);
    assert.equal(harness.calls.openSession, 1);
    assert.equal(harness.calls.run, 2);
    assert.equal(harness.calls.requests[0].messages.length, 1);
    assert.equal(harness.calls.requests[1].messages[1].role, 'assistant');
    assert.equal(harness.calls.requests[1].messages[2].role, 'tool');
    assert.deepEqual(map.records.toolCalls, [{ name: 'map_edit', args: { value: 1 } }]);
});

test('session-capable providers continue with toolResponses on the same adapter', async () => {
    const map = createParticipant('map', { tools: [functionTool('map_edit')] });
    const harness = createHarness({
        participants: [map.participant],
        provider: 'google',
        agent: {
            supportsSessionToolLoop: true,
            async run(_request, round) {return round === 1 ? { toolCalls: [{ id: 'google-1', providerId: 'provider-1', name: 'map_edit', arguments: '{}' }] } : { text: 'done' };},
        },
    });
    const outcome = await runManual(harness.runner);
    assert.equal(outcome.status, 'updated');
    assert.equal(harness.calls.openSession, 1);
    assert.equal(harness.calls.requests[1].messages.length, 0);
    assert.deepEqual(harness.calls.requests[1].toolResponses, [{
        id: 'google-1', name: 'map_edit', providerId: 'provider-1', response: { ok: true, status: 'updated', changed: true },
    }]);
});

test('an empty session conclusion uses one finalAnswerReminderText continuation', async () => {
    const map = createParticipant('map', { tools: [functionTool('map_edit')] });
    const harness = createHarness({
        participants: [map.participant],
        provider: 'google',
        agent: {
            supportsSessionToolLoop: true,
            async run(request, round) {
                if (round === 1) {return { toolCalls: [{ id: 'google-1', name: 'map_edit', arguments: '{}' }] };}
                if (round === 2) {return {};}
                assert.match(request.finalAnswerReminderText, /finish this maintenance run/);
                assert.deepEqual(request.messages, []);
                return { text: 'done' };
            },
        },
    });
    const outcome = await runManual(harness.runner);
    assert.equal(outcome.status, 'updated');
    assert.equal(harness.calls.run, 3);
    assert.equal(harness.calls.openSession, 1);
});

test('an empty provider response is a failure rather than a false unchanged result', async () => {
    const map = createParticipant('map');
    const harness = createHarness({
        participants: [map.participant],
        agent: { async run() {return {};} },
    });
    const outcome = await runManual(harness.runner);
    assert.equal(outcome.status, 'failed');
    assert.equal(outcome.participantResults[0].status, 'failed');
    assert.equal(harness.runner.getStatus('map', 'chat:one').reason, 'empty-provider-response');
    assert.equal(map.records.commits, 0);
});

test('a successful participant tool clears its earlier cross-tool transport failure', async () => {
    const map = createParticipant('map', { tools: [functionTool('map_edit'), functionTool('map_read')] });
    const harness = createHarness({
        participants: [map.participant],
        agent: {
            async run(request, round) {
                if (round === 1) {return { toolCalls: [{ id: 'bad', name: 'map_edit', arguments: '{bad json' }] };}
                if (round === 2) {
                    assert.match(request.messages.at(-1).content, /invalid_tool_arguments_json|Correct the arguments/);
                    return { toolCalls: [{ id: 'fixed', name: 'map_read', arguments: '{"fixed":true}' }] };
                }
                return { text: 'done' };
            },
        },
    });
    const outcome = await runManual(harness.runner);
    assert.equal(outcome.status, 'updated');
    assert.equal(outcome.reason, undefined);
    assert.equal(map.records.invalidations.length, 0);
    assert.deepEqual(map.records.toolCalls, [{ name: 'map_read', args: { fixed: true } }]);
    assert.equal(map.records.commits, 1);
});

test('a corrected domain result from another tool is not held partial by the provider loop', async () => {
    const map = createParticipant('map', {
        tools: [functionTool('map_edit'), functionTool('map_read')],
        executeTool(name) {
            return name === 'map_edit'
                ? { ok: false, status: 'failed', changed: false, error: 'bad intent' }
                : { ok: true, status: 'updated', changed: true };
        },
    });
    const harness = createHarness({
        participants: [map.participant],
        agent: {
            async run(_request, round) {
                if (round === 1) {return { toolCalls: [{ id: 'bad', name: 'map_edit', arguments: '{}' }] };}
                if (round === 2) {return { toolCalls: [{ id: 'fixed', name: 'map_read', arguments: '{}' }] };}
                return { text: 'done' };
            },
        },
    });

    const outcome = await runManual(harness.runner);
    assert.equal(outcome.status, 'updated');
    assert.equal(outcome.reason, undefined);
    assert.deepEqual(outcome.committedParticipantIds, ['map']);
});

test('an unknown tool is resolved only by a valid tool call in a later provider round', async () => {
    const map = createParticipant('map', { tools: [functionTool('map_edit')] });
    const harness = createHarness({
        participants: [map.participant],
        agent: {
            async run(request, round) {
                if (round === 1) {return { toolCalls: [{ id: 'wrong', name: 'unknown_map_tool', arguments: '{}' }] };}
                if (round === 2) {
                    assert.match(request.messages.at(-1).content, /unknown_tool/);
                    return { toolCalls: [{ id: 'fixed', name: 'map_edit', arguments: '{}' }] };
                }
                return { text: 'done' };
            },
        },
    });
    const outcome = await runManual(harness.runner);
    assert.equal(outcome.status, 'updated');
    assert.deepEqual(outcome.committedParticipantIds, ['map']);
    assert.equal(map.records.commits, 1);
});

test('an unrepaired tool argument error cannot be reported as unchanged', async () => {
    const map = createParticipant('map', { tools: [functionTool('map_edit')] });
    const harness = createHarness({
        participants: [map.participant],
        agent: {
            async run(_request, round) {
                return round === 1
                    ? { toolCalls: [{ id: 'bad', name: 'map_edit', arguments: '{bad json' }] }
                    : { text: 'cannot repair' };
            },
        },
    });
    const outcome = await runManual(harness.runner);
    assert.equal(outcome.status, 'failed');
    assert.equal(outcome.participantResults[0].status, 'failed');
    assert.equal(map.records.commits, 0);
});

test('three identical failures inject a brake and a fourth ends without a write', async () => {
    const map = createParticipant('map', { tools: [functionTool('map_edit')] });
    const harness = createHarness({
        participants: [map.participant],
        agent: {
            async run(request, round) {
                if (round === 4) {assert.match(request.messages.at(-1).content, /Repeated identical failure/);}
                return { toolCalls: [{ id: `bad-${round}`, name: 'map_edit', arguments: '{bad json' }] };
            },
        },
    });
    const outcome = await runManual(harness.runner);
    assert.equal(outcome.status, 'failed');
    assert.equal(harness.runner.getStatus('map', 'chat:one').reason, 'tool-errors-unresolved');
    assert.equal(harness.calls.run, 4);
    assert.equal(map.records.commits, 0);
});

test('round limit commits legal staging as partial and fails when nothing legal was staged', async () => {
    const staged = createParticipant('map', { tools: [functionTool('map_edit')] });
    const partialHarness = createHarness({
        participants: [staged.participant],
        agent: { async run(_request, round) {return { toolCalls: [{ id: `call-${round}`, name: 'map_edit', arguments: `{"round":${round}}` }] };} },
    });
    const partial = await runManual(partialHarness.runner);
    assert.equal(partialHarness.calls.run, 12);
    assert.equal(partial.status, 'partial');
    assert.equal(partialHarness.runner.getStatus('map', 'chat:one').reason, 'round-limit');
    assert.equal(staged.records.commits, 1);

    const readOnly = createParticipant('map', { tools: [functionTool('map_read')], stageOnTool: false });
    const failedHarness = createHarness({
        participants: [readOnly.participant],
        agent: { async run(_request, round) {return { toolCalls: [{ id: `read-${round}`, name: 'map_read', arguments: '{}' }] };} },
    });
    const failed = await runManual(failedHarness.runner);
    assert.equal(failed.status, 'failed');
    assert.equal(readOnly.records.commits, 0);
});

test('provider failure after a legal tool result commits that staging as partial', async () => {
    const map = createParticipant('map', { tools: [functionTool('map_edit')] });
    const harness = createHarness({
        participants: [map.participant],
        agent: {
            async run(_request, round) {
                if (round === 1) {return { toolCalls: [{ id: 'edit', name: 'map_edit', arguments: '{}' }] };}
                throw new Error('provider unavailable');
            },
        },
    });
    const outcome = await runManual(harness.runner);
    assert.equal(outcome.status, 'partial');
    assert.equal(harness.runner.getStatus('map', 'chat:one').reason, 'provider-failed');
    assert.equal(map.records.commits, 1);
});

test('failed tool results participate in the repeated-failure brake', async () => {
    const map = createParticipant('map', {
        tools: [functionTool('map_edit')],
        executeTool: () => ({ ok: false, status: 'failed', changed: false, error: 'bad intent' }),
    });
    const harness = createHarness({
        participants: [map.participant],
        agent: {
            async run(request, round) {
                if (round === 4) {assert.match(request.messages.at(-1).content, /Repeated identical failure/);}
                return { toolCalls: [{ id: `bad-${round}`, name: 'map_edit', arguments: '{}' }] };
            },
        },
    });
    const outcome = await runManual(harness.runner);
    assert.equal(outcome.status, 'failed');
    assert.equal(harness.runner.getStatus('map', 'chat:one').reason, 'tool-errors-unresolved');
    assert.equal(harness.calls.run, 4);
    assert.equal(map.records.commits, 0);
});

test('commit errors are classified as storage failures without leaking raw errors into status', async () => {
    const map = createParticipant('map', {
        initiallyStaged: true,
        commit() { throw new Error('secret-storage-url-and-token'); },
    });
    const harness = createHarness({ participants: [map.participant] });
    const outcome = await runManual(harness.runner);
    assert.equal(outcome.status, 'failed');
    assert.equal(harness.runner.getStatus('map', 'chat:one').reason, 'save-failed');
    assert.doesNotMatch(JSON.stringify(outcome), /secret-storage/);
    assert.deepEqual(outcome.committedParticipantIds, []);
});

test('chat changes and explicit-request cancellation discard active staging', async () => {
    let enabled = true;
    const response = deferred();
    const map = createParticipant('map', {
        tools: [functionTool('map_edit')],
        isEnabled: () => enabled,
    });
    const harness = createHarness({ participants: [map.participant], agent: { run: () => response.promise } });
    const pending = runManual(harness.runner);
    await flush();
    enabled = false;
    harness.runner.cancelRequested('map', 'route-left');
    response.resolve({ toolCalls: [{ id: 'late', name: 'map_edit', arguments: '{}' }] });
    const outcome = await pending;
    assert.equal(outcome.status, 'cancelled');
    assert.equal(map.records.toolCalls.length, 0);
    assert.equal(map.records.commits, 0);
});

test('a cancellation after persistence starts preserves the committed outcome', async () => {
    const persistenceStarted = deferred();
    const persistenceFinished = deferred();
    const map = createParticipant('map', {
        initiallyStaged: true,
        async commit(guard, records) {
            if (!guard()) {throw new Error('stale source');}
            persistenceStarted.resolve();
            await persistenceFinished.promise;
            records.commits += 1;
        },
    });
    const harness = createHarness({ participants: [map.participant] });
    const pending = runManual(harness.runner);
    await persistenceStarted.promise;

    harness.runner.handleChatChanged();
    persistenceFinished.resolve();
    const outcome = await pending;

    assert.equal(map.records.commits, 1);
    assert.equal(outcome.status, 'updated');
    assert.deepEqual(outcome.committedParticipantIds, ['map']);
    assert.equal(outcome.reason, 'cancelled-after-commit');
});

test('a cancellation before a later participant commit preserves earlier committed results', async () => {
    const laterCommitCheckStarted = deferred();
    const releaseLaterCommitCheck = deferred();
    const map = createParticipant('map', { initiallyStaged: true });
    const tasks = createParticipant('tasks', {
        initiallyStaged: true,
        async canCommit(staged) {
            laterCommitCheckStarted.resolve();
            await releaseLaterCommitCheck.promise;
            return staged;
        },
    });
    const harness = createHarness({
        participants: [map.participant, tasks.participant],
        chat: surface([user('U1'), assistant('A1'), user('U2')]),
    });
    assert.equal(harness.runner.handleMessageSent(2), true);
    await laterCommitCheckStarted.promise;

    harness.runner.handleChatChanged();
    releaseLaterCommitCheck.resolve();
    await flush();
    await flush();

    assert.equal(map.records.commits, 1);
    assert.equal(tasks.records.commits, 0);
    assert.equal(harness.runner.getStatus('map', 'chat:one').message, 'updated');
    assert.equal(harness.runner.getStatus('tasks', 'chat:one').message, 'cancelled');
    assert.notEqual(harness.runner.getStatus('map', 'chat:one').lastRunAt, null);
    assert.equal(harness.runner.getStatus('tasks', 'chat:one').lastRunAt, null);
});

test('an automatic participant excluded during session creation cannot revive after its switch is re-enabled', async () => {
    let enabled = true;
    const sessionGate = deferred();
    const map = createParticipant('map', {
        tools: [functionTool('map_edit')],
        isEnabled: mode => mode !== 'automatic' || enabled,
    });
    const participant = {
        ...map.participant,
        async createSession(source, mode) {
            await sessionGate.promise;
            return map.participant.createSession(source, mode);
        },
    };
    const harness = createHarness({
        participants: [participant],
        chat: surface([user('U1'), assistant('A1'), user('U2')]),
    });

    assert.equal(harness.runner.handleMessageSent(2), true);
    await flush();
    enabled = false;
    harness.runner.invalidateAutomatic('map', 'automatic-disabled');
    enabled = true;
    sessionGate.resolve();
    await flush();
    await flush();

    assert.equal(map.records.commits, 0);
    assert.equal(harness.calls.loadConfig, 0);
    assert.equal(harness.calls.openSession, 0);
    assert.equal(harness.calls.run, 0);
});

test('enabled domains share one Agent session while keeping user data, tools, staging, and commits separate', async () => {
    const map = createParticipant('map', {
        dataMessages: [{ role: 'user', content: 'MAP_DYNAMIC_DATA' }],
        tools: [functionTool('map_edit')],
    });
    const tasks = createParticipant('tasks', {
        dataMessages: [{ role: 'user', content: 'TASKS_DYNAMIC_DATA' }],
        tools: [functionTool('tasks_edit')],
    });
    let round = 0;
    let backgroundCaptures = 0;
    const harness = createHarness({
        participants: [map.participant, tasks.participant],
        chat: surface([user('U1'), assistant('A1'), user('U2')]),
        captureBackground(source) {
            backgroundCaptures += 1;
            assert.equal(source.trigger.text, 'U2');
            return [
                { role: 'system', content: '<setting>SETTING</setting>' },
                { role: 'system', content: '<current_state>STATE</current_state>' },
            ];
        },
        agent: {
            async run() {
                round += 1;
                return round === 1 ? { toolCalls: [
                    { id: 'm', name: 'map_edit', arguments: '{}' },
                    { id: 't', name: 'tasks_edit', arguments: '{}' },
                ] } : { text: 'done' };
            },
        },
    });
    assert.equal(harness.runner.handleMessageSent(2), true);
    await flush();
    await flush();
    assert.equal(harness.calls.loadConfig, 1);
    assert.equal(harness.calls.openSession, 1);
    assert.equal(backgroundCaptures, 1);
    assert.match(harness.calls.requests[0].systemPrompt, /Maintain map\./);
    assert.match(harness.calls.requests[0].systemPrompt, /Maintain tasks\./);
    assert.doesNotMatch(harness.calls.requests[0].systemPrompt, /Alice|MAP_DYNAMIC_DATA|TASKS_DYNAMIC_DATA|U1|A1/);
    assert.deepEqual(harness.calls.requests[0].tools.map(tool => tool.function.name), ['map_edit', 'tasks_edit']);
    assert.deepEqual(harness.calls.requests[0].messages.slice(0, 4), [
        { role: 'system', content: '<setting>SETTING</setting>' },
        { role: 'system', content: '<current_state>STATE</current_state>' },
        { role: 'user', content: 'MAP_DYNAMIC_DATA' },
        { role: 'user', content: 'TASKS_DYNAMIC_DATA' },
    ]);
    assert.equal(harness.calls.requests[0].messages[4].role, 'user');
    assert.match(harness.calls.requests[0].messages[4].content, /<accepted_turn>/);
    assert.match(harness.calls.requests[0].messages[4].content, /Alice/);
    assert.match(harness.calls.requests[0].messages[4].content, /A1/);
    assert.equal(harness.calls.run, 2);
    assert.equal(map.records.commits, 1);
    assert.equal(tasks.records.commits, 1);
    assert.deepEqual(map.records.toolCalls, [{ name: 'map_edit', args: {} }]);
    assert.deepEqual(tasks.records.toolCalls, [{ name: 'tasks_edit', args: {} }]);
});

test('an unconfirmed save is failed rather than committed and stops later participant commits', async () => {
    const map = createParticipant('map', {
        initiallyStaged: true,
        async commit(_guard, records) {
            records.commits += 1;
            throw unconfirmedMutationError('save result unconfirmed');
        },
    });
    const tasks = createParticipant('tasks', { initiallyStaged: true });
    const harness = createHarness({
        participants: [map.participant, tasks.participant],
        chat: surface([user('U1'), assistant('A1'), user('U2')]),
    });

    assert.equal(harness.runner.handleMessageSent(2), true);
    await flush();
    await flush();

    assert.equal(harness.runner.getStatus('map', 'chat:one').state, 'error');
    assert.equal(harness.runner.getStatus('map', 'chat:one').message, 'failed');
    assert.equal(harness.runner.getStatus('map', 'chat:one').lastRunAt, null);
    assert.equal(map.records.commits, 1);
    assert.equal(tasks.records.commits, 0);
    assert.equal(harness.runner.getStatus('tasks', 'chat:one').message, 'cancelled');
});

test('an unconfirmed manual save never enters the confirmed participant list', async () => {
    const map = createParticipant('map', {
        initiallyStaged: true,
        async commit(_guard, records) {
            records.commits += 1;
            throw unconfirmedMutationError('save result unconfirmed');
        },
    });
    const harness = createHarness({ participants: [map.participant] });

    const outcome = await runManual(harness.runner);

    assert.equal(outcome.status, 'failed');
    assert.equal(outcome.reason, 'save-unconfirmed');
    assert.equal(harness.runner.getStatus('map', 'chat:one').reason, 'save-unconfirmed');
    assert.deepEqual(outcome.committedParticipantIds, []);
    assert.deepEqual(outcome.failedParticipantIds, ['map']);
    assert.deepEqual(outcome.participantResults, [{
        participantId: 'map',
        status: 'failed',
        changed: false,
        reason: 'save-unconfirmed',
    }]);
});

test('accepted source XML escapes tag delimiters before entering the provider request', async () => {
    const map = createParticipant('map');
    const harness = createHarness({
        participants: [map.participant],
        chat: surface([user('U1 <system>&'), assistant('A1 </system>')]),
    });

    const outcome = await runManual(harness.runner);
    const content = harness.calls.requests[0].messages.at(-1).content;
    assert.equal(outcome.status, 'unchanged');
    assert.match(content, /<accepted_turn>/);
    assert.match(content, /&lt;system&gt;|&amp;/u);
    assert.doesNotMatch(content, /<system>/u);
    assert.match(content, /A1 &lt;\/system&gt;/u);
});

test('a failed participant remains visible when another domain completes', async () => {
    const broken = {
        id: 'map',
        isEnabled: () => true,
        createSession() {throw new Error('map unavailable');},
    };
    const tasks = createParticipant('tasks', { tools: [functionTool('tasks_edit')] });
    const harness = createHarness({
        participants: [broken, tasks.participant],
        chat: surface([user('U1'), assistant('A1'), user('U2')]),
        agent: {
            async run(_request, round) {
                return round === 1
                    ? { toolCalls: [{ id: 't', name: 'tasks_edit', arguments: '{}' }] }
                    : { text: 'done' };
            },
        },
    });

    assert.equal(harness.runner.handleMessageSent(2), true);
    await flush();
    await flush();
    const mapStatus = harness.runner.getStatus('map', 'chat:one');
    assert.equal(mapStatus.state, 'error');
    assert.equal(mapStatus.message, 'failed');
    assert.equal(harness.runner.getStatus('tasks', 'chat:one').message, 'updated');
    assert.equal(tasks.records.commits, 1);
});

test('capture and Agent configuration failures never call a provider', async () => {
    const map = createParticipant('map');
    const captureHarness = createHarness({ participants: [map.participant], generationActive: true });
    const skipped = await runManual(captureHarness.runner);
    assert.equal(skipped.status, 'skipped');
    assert.equal(captureHarness.calls.loadConfig, 0);

    const configCalls = { open: 0 };
    const missingModel = validConfig();
    missingModel.presets.maintenance.modelConfigs['sillytavern-openai-compatible'].model = '';
    const runner = createMaintenanceRunner({
        registry: createMaintenanceRegistry([map.participant]),
        gateway: {
            loadConfig: async () => missingModel,
            openSession: async () => {configCalls.open += 1; throw new Error('must not open');},
        },
        captureSurface: () => surface(),
        isGenerationActive: () => false,
    });
    const failed = await runManual(runner);
    assert.equal(failed.status, 'failed');
    assert.equal(configCalls.open, 0);
    assert.deepEqual(failed.failedParticipantIds, ['map']);
});

test('legacy disabled Agent settings do not block configured maintenance', async () => {
    const map = createParticipant('map');
    let openCount = 0;
    const runner = createMaintenanceRunner({
        registry: createMaintenanceRegistry([map.participant]),
        gateway: {
            loadConfig: async () => ({ ...validConfig(), enabled: false }),
            async openSession() {
                openCount += 1;
                return { providerConfig: { provider: 'sillytavern-openai-compatible' }, async run() {return { text: 'done' };} };
            },
        },
        captureSurface: () => surface(),
        isGenerationActive: () => false,
    });

    const outcome = await runManual(runner);
    assert.equal(outcome.status, 'unchanged');
    assert.equal(openCount, 1);
});
