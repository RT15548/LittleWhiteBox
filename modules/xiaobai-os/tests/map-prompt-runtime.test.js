import assert from 'node:assert/strict';
import test from 'node:test';

import { createMapPromptRuntime } from '../apps/map/host/prompt-runtime.js';

function currentMap() {
    return {
        schemaVersion: 1,
        revision: 3,
        atlas: {
            locations: [{
                key: 'hall',
                name: 'Hall <unsafe> {{macro}}',
                scale: 'room',
                status: 'visited',
                brief: 'A confirmed room.',
                sceneKey: 'hall-scene',
            }],
            links: [],
            actors: [{ actorKey: 'player', displayName: 'Player', locationKey: 'hall' }],
        },
        scenes: {
            'hall-scene': {
                key: 'hall-scene',
                name: 'Hall',
                status: 'active',
                viewBox: [0, 0, 400, 300],
                elements: [
                    { id: 'door', category: 'door', shape: 'icon', geometry: { x: 200, y: 280 }, label: 'South door' },
                    { id: 'counter', category: 'furniture', shape: 'rect', geometry: { x: 40, y: 60, width: 120, height: 40 }, label: 'Counter' },
                    { id: 'rumor', category: 'marker', shape: 'icon', geometry: { x: 300, y: 80 }, label: 'Rumored chest', certainty: 'unknown' },
                ],
            },
        },
    };
}

function createHarness() {
    let autoMaintenance = false;
    let map = currentMap();
    let handlers = null;
    let reads = 0;
    let subscriptions = 0;
    const prompts = [];
    const errors = [];
    const runtime = createMapPromptRuntime({
        readCurrentMap() {
            reads += 1;
            if (map instanceof Error) {throw map;}
            return structuredClone(map);
        },
        setPrompt: value => prompts.push(value),
        subscribe(next) {
            subscriptions += 1;
            handlers = next;
            return () => {handlers = null;};
        },
        onError: error => errors.push(error),
    });
    return {
        errors,
        get handlers() {return handlers;},
        get reads() {return reads;},
        get subscriptions() {return subscriptions;},
        prompts,
        runtime,
        setAutoMaintenance(value) {autoMaintenance = value;},
        get autoMaintenance() {return autoMaintenance;},
        setMap(value) {map = value;},
    };
}

test('main-generation interception installs only the safe current Map projection', () => {
    const harness = createHarness();
    harness.runtime.startBackground();
    assert.equal(harness.reads, 0);
    assert.deepEqual(harness.prompts, []);

    harness.handlers.intercept();
    assert.equal(harness.reads, 1);
    assert.equal(harness.prompts[0], '');
    assert.match(harness.prompts.at(-1), /<current_map>/);
    assert.match(harness.prompts.at(-1), /以下是当前世界地图，包含尚未到访的地点；/u);
    assert.match(harness.prompts.at(-1), /当前位置：Hall &lt;unsafe&gt; &#123;&#123;macro&#125;&#125;/u);
    assert.match(harness.prompts.at(-1), /可直接到达：暂无已记录路线。/u);
    assert.doesNotMatch(harness.prompts.at(-1), /South door|Counter|Rumored chest/);
    assert.doesNotMatch(harness.prompts.at(-1), /<current_location|scene|element|geometry|shape=|category=/i);
    assert.doesNotMatch(harness.prompts.at(-1), /<unsafe>|\{\{macro\}\}/);

    harness.handlers.requestBuilt();
    assert.equal(harness.prompts.at(-1), '');
    harness.handlers.intercept();
    harness.handlers.generationEnded();
    assert.equal(harness.prompts.at(-1), '');
    harness.handlers.intercept();
    harness.handlers.generationStopped();
    assert.equal(harness.prompts.at(-1), '');
});

test('settings-only activity does not read Map state or duplicate subscriptions', () => {
    const harness = createHarness();
    harness.runtime.startBackground();
    harness.runtime.startBackground();
    assert.equal(harness.subscriptions, 1);

    harness.setAutoMaintenance(true);
    assert.equal(harness.autoMaintenance, true);
    assert.equal(harness.reads, 0);
    assert.deepEqual(harness.prompts, []);

    assert.equal(harness.reads, 0);
    assert.deepEqual(harness.prompts, []);
});

test('every cancellation boundary clears a previously installed Map prompt', () => {
    const harness = createHarness();
    harness.runtime.startBackground();

    harness.handlers.intercept();
    harness.handlers.generationStarted();
    assert.equal(harness.prompts.at(-1), '');

    harness.handlers.intercept();
    harness.runtime.handleChatChanged();
    assert.equal(harness.prompts.at(-1), '');

    harness.handlers.intercept();
    harness.runtime.cancelAll('cancelled');
    assert.equal(harness.prompts.at(-1), '');

    harness.handlers.intercept();
    harness.runtime.stopBackground();
    assert.equal(harness.handlers, null);
    assert.equal(harness.prompts.at(-1), '');
});

test('read or projection failures cannot leave a stale prompt installed', () => {
    const harness = createHarness();
    const failure = new Error('map read failed');
    harness.runtime.startBackground();
    harness.handlers.intercept();
    assert.notEqual(harness.prompts.at(-1), '');

    harness.setMap(failure);
    harness.handlers.intercept();
    assert.equal(harness.prompts.at(-1), '');
    assert.deepEqual(harness.errors, [failure]);
});
