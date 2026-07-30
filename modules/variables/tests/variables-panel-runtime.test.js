import assert from 'node:assert/strict';
import test from 'node:test';

import { createVariablesPanelRuntime } from '../variables-panel-runtime.js';

test('Variables Panel runtime reuses one initialization and one instance', async () => {
    let createCount = 0;
    let disposeCount = 0;
    let finishInitialization;
    const initialization = new Promise(resolve => { finishInitialization = resolve; });
    const panel = { init: () => initialization };
    const runtime = createVariablesPanelRuntime({
        createPanel() { createCount += 1; return panel; },
        disposePanel(instance) { assert.equal(instance, panel); disposeCount += 1; },
    });

    const first = runtime.init();
    const second = runtime.init();
    assert.equal(createCount, 1);
    finishInitialization();

    const [firstInstance, secondInstance] = await Promise.all([first, second]);
    assert.equal(firstInstance, panel);
    assert.equal(secondInstance, panel);
    assert.equal(await runtime.init(), panel);
    assert.equal(createCount, 1);

    runtime.dispose();
    assert.equal(disposeCount, 1);
    assert.equal(runtime.getInstance(), null);
});

test('Variables Panel runtime keeps replacement initialization isolated from a disposed round', async () => {
    const initializations = [];
    const panels = [];
    const disposed = [];
    const runtime = createVariablesPanelRuntime({
        createPanel() {
            let finishInitialization;
            const initialization = new Promise(resolve => { finishInitialization = resolve; });
            const panel = { init: () => initialization };
            initializations.push(finishInitialization);
            panels.push(panel);
            return panel;
        },
        disposePanel(instance) { disposed.push(instance); },
    });

    const firstInit = runtime.init();
    runtime.dispose();
    const replacementInit = runtime.init();

    initializations[0]();
    await firstInit;
    assert.equal(runtime.isInitializing(), true);
    assert.equal(runtime.getInstance(), panels[1]);

    const concurrentInit = runtime.init();
    initializations[1]();
    assert.equal(await replacementInit, panels[1]);
    assert.equal(await concurrentInit, panels[1]);
    assert.deepEqual(disposed, [panels[0]]);
});
