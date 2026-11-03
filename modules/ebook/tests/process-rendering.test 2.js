import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collectAgentRenderUnits, renderAgentMessages, countMessageWindowUnits } from '../app-src/renderer.js';
import { adoptAgentRenderUnits, applyAgentRenderUnits } from '../app-src/agent-render-dom.js';
import { bindEbookEvents } from '../app-src/ui-bindings.js';
import { shouldForceAgentScrollToBottom } from '../app-src/ebook-app.js';

function batch(index, count = 1, idPrefix = `call-${index}`) {
    const toolCalls = Array.from({ length: count }, (_, toolIndex) => ({
        id: `${idPrefix}-${toolIndex}`, name: 'Read', arguments: '{}',
    }));
    return {
        assistant: { role: 'assistant', content: `round-${index}\n\n${'完整播报。'.repeat(120)}`, toolCalls },
        results: toolCalls.map((call) => ({
            role: 'tool', toolCallId: call.id, toolName: call.name,
            content: JSON.stringify({ ok: true, summary: call.id, content: 'RAW-RESULT'.repeat(10000) }),
        })),
        traces: toolCalls.map((call) => ({
            id: call.id, name: call.name, status: 'running', summary: call.id,
        })),
    };
}

function harness(state, adopt = false) {
    const { document } = parseHTML('<html><body><main></main></body></html>');
    const container = document.querySelector('main');
    let cache = [];
    if (adopt) {
        // The production full-shell renderer supplies escaped markup.
        // eslint-disable-next-line no-unsanitized/property
        container.innerHTML = renderAgentMessages(state);
        cache = adoptAgentRenderUnits(container, collectAgentRenderUnits(state));
    }
    const render = () => { cache = applyAgentRenderUnits(container, cache, collectAgentRenderUnits(state)); };
    render();
    return { container, document, render };
}

function initialState() {
    return {
        messages: [{ role: 'user', content: 'request' }],
        isBusy: true, toolTrace: [], liveToolTurn: null,
        openToolTurnKeys: [], openThoughtKeys: [], agentAutoScroll: false,
    };
}

test('all 40 rounds remain readable and earlier narration nodes survive live progress and saving', () => {
    const state = initialState();
    const ui = harness(state);
    const mutations = new ui.document.defaultView.MutationObserver(() => {});
    mutations.observe(ui.container, { childList: true, subtree: true });
    let firstPreface;
    for (let round = 0; round < 40; round += 1) {
        const current = batch(round, 1, 'reused');
        state.liveToolTurn = current.assistant;
        ui.render(); // Narration is visible before the first tool has returned.
        firstPreface ||= ui.container.querySelector('.xb-tool-preface');
        state.toolTrace = current.traces;
        ui.render();
        current.traces[0].status = 'resolved';
        ui.render();
        state.messages.push(current.assistant, ...current.results);
        ui.render(); // The saved and live batch overlap while persistence is pending.
        state.liveToolTurn = null;
        state.toolTrace = [];
        ui.render();
        assert.equal(ui.container.querySelector('.xb-tool-preface'), firstPreface);
        assert.equal(mutations.takeRecords().some((record) => Array.from(record.removedNodes)
            .some((node) => node === firstPreface || node.contains?.(firstPreface))), false);
        assert.equal(ui.container.querySelectorAll('.xb-tool-round').length, round + 1);
        assert.equal(ui.container.querySelectorAll('details.xb-tool-turn').length, 0);
        assert.equal(ui.container.querySelectorAll('.xb-tool-turn').length, 1);
        assert.equal(ui.container.textContent.includes('RAW-RESULT'), false);
    }
    assert.equal(countMessageWindowUnits(state.messages), 2);
    assert.equal(firstPreface.textContent.replace(/\s/g, ''), batch(0).assistant.content.replace(/\s/g, ''));
});

test('a live batch renders every tool, including those before the last eight', () => {
    const state = initialState();
    const current = batch(0, 12);
    state.liveToolTurn = current.assistant;
    state.toolTrace = current.traces;
    const ui = harness(state);
    assert.equal(ui.container.querySelectorAll('.xb-tool').length, 12);
    assert.equal(ui.container.querySelectorAll('.is-running').length, 12);
    current.traces[0].status = 'resolved';
    current.traces[0].ok = false;
    ui.render();
    assert.equal(ui.container.querySelectorAll('.is-running').length, 11);
    assert.equal(ui.container.querySelectorAll('.is-error').length, 1);
});

test('only turn completion folds the process; manual expansion survives ordinary updates', () => {
    const state = initialState();
    const current = batch(0);
    state.messages.push(current.assistant, ...current.results);
    const ui = harness(state);
    state.messages.push({ role: 'assistant', content: 'answer', streaming: true });
    ui.render();
    assert.equal(ui.container.querySelectorAll('details.xb-tool-turn').length, 0);
    state.messages.at(-1).streaming = false;
    ui.render(); // A final message alone is not the turn-end signal.
    assert.equal(ui.container.querySelectorAll('details.xb-tool-turn').length, 0);
    state.isBusy = false;
    ui.render();
    let details = ui.container.querySelector('details.xb-tool-turn');
    assert.equal(details.hasAttribute('open'), false);
    assert.equal(details.children.length, 1);
    assert.equal(details.querySelector('.xb-tool-preface'), null);

    let partialRenders = 0;
    state.agentAutoScroll = true;
    bindEbookEvents({
        root: ui.container, state,
        render() { assert.fail('process toggling must not rebuild the whole app'); },
        renderAgentSurface() {
            assert.equal(shouldForceAgentScrollToBottom(state, { nearBottom: true }), false);
            partialRenders += 1;
            ui.render();
        },
        postToHost() {}, bookController: {}, agentRunner: {},
    });
    details.open = true;
    details.dispatchEvent(new ui.document.defaultView.Event('toggle', { bubbles: true }));
    assert.equal(partialRenders, 1);
    details = ui.container.querySelector('details.xb-tool-turn');
    assert.ok(details.hasAttribute('open'));
    const preface = details.querySelector('.xb-tool-preface');
    state.messages = JSON.parse(JSON.stringify(state.messages));
    ui.render();
    assert.equal(ui.container.querySelector('details.xb-tool-turn'), details);
    assert.equal(details.querySelector('.xb-tool-preface'), preface);
    assert.equal(ui.container.textContent.includes('RAW-RESULT'), false);
    details.open = false;
    details.dispatchEvent(new ui.document.defaultView.Event('toggle', { bubbles: true }));
    assert.equal(partialRenders, 2);
    assert.equal(ui.container.querySelector('.xb-tool-preface'), null);
});

test('closed processes never access tool result bodies', () => {
    const state = initialState();
    const current = batch(0);
    Object.defineProperty(current.results[0], 'content', { get() { return assert.fail('closed payload was read'); } });
    state.messages.push(current.assistant, ...current.results);
    state.isBusy = false;
    const ui = harness(state);
    ui.render();
    assert.equal(ui.container.querySelector('details.xb-tool-turn').children.length, 1);
});

test('initial shell adoption and earlier-history removal preserve current process nodes', () => {
    const state = initialState();
    const current = batch(0);
    state.messages.unshift({ role: 'user', content: 'old request' }, { role: 'assistant', content: 'old answer' });
    state.messages.push(current.assistant, ...current.results);
    const { document } = parseHTML(renderAgentMessages(state));
    assert.equal(document.querySelectorAll('.xb-tool-round').length, 1);
    const ui = harness(state, true);
    const preface = ui.container.querySelector('.xb-tool-preface');
    state.messages = state.messages.slice(2); // Context compaction rebases message indices.
    ui.render();
    assert.equal(ui.container.querySelector('.xb-tool-preface'), preface);
    assert.equal(ui.container.querySelector('details.xb-tool-turn'), null);
});

test('reused provider call IDs across tasks neither hide live narration nor couple completed processes', () => {
    const state = initialState();
    const first = batch(0, 1, 'reused');
    const second = batch(1, 1, 'reused');
    state.messages.push(first.assistant, ...first.results, { role: 'assistant', content: 'first answer' },
        { role: 'user', content: 'next task' });
    state.uiMessageWindowLimit = 20;
    state.liveToolTurn = second.assistant;
    state.toolTrace = second.traces;
    const ui = harness(state);
    assert.equal(ui.container.querySelectorAll('.xb-tool-turn').length, 2);
    assert.ok(ui.container.querySelector('.xb-tool-turn-live').textContent.includes('round-1'));
    // An equivalent history snapshot and the live batch can overlap during saving.
    state.messages.push(second.assistant, ...second.results);
    state.messages = JSON.parse(JSON.stringify(state.messages));
    ui.render();
    assert.equal(ui.container.querySelectorAll('.xb-tool-turn').length, 2);
    state.liveToolTurn = null;
    state.toolTrace = [];
    state.isBusy = false;
    ui.render();
    const processes = [...ui.container.querySelectorAll('details.xb-tool-turn')];
    assert.equal(new Set(processes.map((node) => node.dataset.toolTurnKey)).size, 2);
    state.openToolTurnKeys = [processes[0].dataset.toolTurnKey];
    ui.render();
    assert.equal(ui.container.querySelectorAll('details.xb-tool-turn[open]').length, 1);
    assert.ok(ui.container.querySelector('details.xb-tool-turn[open]').textContent.includes('round-0'));
    state.openToolTurnKeys = processes.map((node) => node.dataset.toolTurnKey);
    ui.render();
    ui.render();
    assert.equal(ui.container.querySelectorAll('.xb-tool-turn').length, 2);
    assert.equal(ui.container.querySelectorAll('.xb-tool-preface').length, 2);
    const prefaces = [...ui.container.querySelectorAll('.xb-tool-preface')];
    state.messages = state.messages.slice(4);
    ui.render();
    assert.equal(ui.container.querySelector('.xb-tool-preface'), prefaces[1]);
});
