import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { createCheckCard } from '../apps/dice/ui/check-card.ts';
import { revealCheckCard, DICE_REVEAL_MS } from '../apps/dice/ui/reveal.ts';
import { prepareActionCheck } from '../apps/dice/application/prepare-action-check.ts';

function browser(t) {
    const { document } = parseHTML('<html><body></body></html>');
    const motion = new EventTarget(); motion.matches = false;
    let next = 0;
    const frames = new Map();
    const globals = { document, matchMedia: () => motion,
        requestAnimationFrame: fn => { frames.set(++next, fn); return next; },
        cancelAnimationFrame: id => frames.delete(id) };
    const previous = new Map();
    for (const [key, value] of Object.entries(globals)) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { value, configurable: true });
    }
    t.after(() => { for (const [key, descriptor] of previous) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    } });
    t.mock.timers.enable({ apis: ['setTimeout'] });
    t.mock.method(performance, 'now', () => 0);
    return { document, motion, frames,
        tick(now) { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(now)); } };
}
function record(roll = 17) {
    return prepareActionCheck({ id: 'fixed', generatedFrom: 0, random: () => (roll - .5) / 20,
        body: '尝试。\n\n<xb_action_check>{"action":"越过断桥","stat":"敏捷","difficulty":"hard"}</xb_action_check>' }).records.checks[0];
}

test('fresh card conceals the verdict, lands on the stored result, then releases its finite barrier', async t => {
    const dom = browser(t);
    const card = createCheckCard(record(), true); dom.document.body.append(card.element);
    let finished = false;
    const operation = revealCheckCard(card, new AbortController().signal).then(() => { finished = true; });
    assert.equal(card.element.dataset.outcome, undefined);
    assert.equal(card.element.querySelector('.xb-dice-verdict').hidden, true);
    assert.equal(card.element.querySelector('.xb-dice-outcome').textContent, '');
    dom.tick(900); await Promise.resolve();
    assert.equal(finished, false);
    assert.equal(card.element.dataset.outcome, undefined);
    dom.tick(1750);
    assert.equal(card.element.dataset.outcome, 'success');
    assert.match(card.element.getAttribute('aria-label'), /掷骰 17/);
    assert.equal(finished, false, 'the revealed card gets a reading beat before continuation');
    t.mock.timers.tick(DICE_REVEAL_MS); await operation;
    assert.equal(finished, true);
    assert.equal(dom.frames.size, 0);
});

test('cancellation, reduced motion, hidden page, and detached card all settle without hanging', async t => {
    const dom = browser(t);
    for (const reason of ['abort', 'reduced', 'hidden', 'detached']) {
        dom.motion.matches = reason === 'reduced'; dom.document.hidden = reason === 'hidden';
        const card = createCheckCard(record(1), true); dom.document.body.append(card.element);
        const controller = new AbortController();
        const operation = revealCheckCard(card, controller.signal);
        if (reason === 'abort') controller.abort();
        if (reason === 'detached') { card.element.remove(); dom.tick(100); }
        await operation;
        assert.equal(card.element.dataset.outcome, 'critical_failure');
        assert.equal(dom.frames.size, 0);
        card.element.remove();
    }
});

test('all twenty historical results are static, readable on the facing die, and never schedule animation', t => {
    const dom = browser(t);
    for (let roll = 1; roll <= 20; roll++) {
        const saved = record(roll);
        const card = createCheckCard(saved, false);
        assert.equal(card.element.dataset.state, 'settled');
        assert.match(card.element.getAttribute('aria-label'), new RegExp(`掷骰 ${roll}，`));
        assert.equal(card.element.querySelector('.xb-dice-comparison').textContent, `掷骰${roll}难度${saved.dc}`,
            'the stored roll and difficulty must be readable together outside the decorative die');
        const facing = [...card.element.querySelectorAll('svg text')].find(label => label.textContent === String(roll));
        for (let node = facing; node && node !== card.element; node = node.parentElement) {
            assert.notEqual(node.style.display, 'none');
        }
        assert.ok(Number(facing.getAttribute('opacity')) > .98, 'saved result must face the viewer');
        assert.equal(dom.frames.size, 0);
    }
});

test('coexisting dice own their SVG paint references even after another card is removed', t => {
    const dom = browser(t);
    const history = createCheckCard({ ...record(17), id: 'history' }, false);
    const fresh = createCheckCard({ ...record(8), id: 'fresh' }, true);
    dom.document.body.append(history.element, fresh.element);
    const ids = [...dom.document.querySelectorAll('svg [id]')].map(node => node.id);
    assert.equal(new Set(ids).size, ids.length, 'paint IDs must not alias a different die');
    history.element.remove();
    fresh.draw(.4);
    fresh.settle();
    const solid = fresh.element.querySelector('svg');
    for (const node of solid.querySelectorAll('[fill], [filter]')) {
        for (const attribute of ['fill', 'filter']) {
            const reference = node.getAttribute(attribute)?.match(/^url\(#(.+)\)$/);
            if (!reference) continue;
            assert.ok(solid.contains(dom.document.getElementById(reference[1])),
                'removing a historical die must not break the remaining die\'s material');
        }
    }
});
