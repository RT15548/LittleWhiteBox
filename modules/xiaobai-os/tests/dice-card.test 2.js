import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { createCheckCard } from '../apps/dice/ui/check-card.ts';
import { revealCheckCard, DICE_REVEAL_MS } from '../apps/dice/ui/reveal.ts';
import { prepareActionCheck } from '../apps/dice/application/prepare-action-check.ts';
import { rollCoc7 } from '../apps/dice/domain/coc7.ts';
import { emptyCoc7Draft } from '../apps/dice/domain/coc7-creation.ts';
import { parseDiceRecords } from '../apps/dice/domain/check-records.ts';

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
function coc7Record(roll = 43, difficulty = 'hard', value = 65) {
    const samples = [(roll % 10 + .1) / 10, (Math.floor(roll / 10) % 10 + .1) / 10];
    return { id: 'percentile', rule: 'coc7', request: { action: '越过断桥', stat: '运动', difficulty },
        result: rollCoc7(value, difficulty, () => samples.shift()) };
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
    for (const saved of [record(1), coc7Record(100)]) {
        for (const reason of ['abort', 'reduced', 'hidden', 'detached']) {
            dom.motion.matches = reason === 'reduced'; dom.document.hidden = reason === 'hidden';
            const card = createCheckCard(saved, true); dom.document.body.append(card.element);
            const controller = new AbortController();
            const operation = revealCheckCard(card, controller.signal);
            if (reason === 'abort') controller.abort();
            if (reason === 'detached') { card.element.remove(); dom.tick(100); }
            await operation;
            assert.equal(card.element.dataset.outcome, 'critical_failure');
            assert.equal(dom.frames.size, 0);
            card.element.remove();
        }
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
    for (const saved of [record(17), coc7Record()]) {
        const history = createCheckCard({ ...saved, id: 'history' }, false);
        const fresh = createCheckCard({ ...saved, id: 'fresh' }, true);
        dom.document.body.append(history.element, fresh.element);
        const ids = [...dom.document.querySelectorAll('svg [id]')].map(node => node.id);
        assert.equal(new Set(ids).size, ids.length, 'paint IDs must not alias a different die');
        history.element.remove();
        fresh.draw(.4);
        fresh.settle();
        for (const solid of fresh.element.querySelectorAll('svg')) {
            for (const node of solid.querySelectorAll('[fill], [filter]')) {
                for (const attribute of ['fill', 'filter']) {
                    const reference = node.getAttribute(attribute)?.match(/^url\(#(.+)\)$/);
                    if (!reference) continue;
                    assert.ok(solid.contains(dom.document.getElementById(reference[1])),
                        'removing a historical die must not break the remaining die\'s material');
                }
            }
        }
        fresh.element.remove();
    }
});

test('fresh D100 shows dice during the shared reveal and only reveals the verdict after landing', async t => {
    const dom = browser(t);
    const saved = coc7Record(); const before = structuredClone(saved);
    t.mock.method(Math, 'random', () => assert.fail('rendering cannot reroll'));
    const card = createCheckCard(saved, true); dom.document.body.append(card.element);
    for (const die of card.element.querySelectorAll('[data-place]')) {
        for (let node = die; node && node !== card.element; node = node.parentElement) { assert.notEqual(node.hidden, true); }
    }
    let finished = false;
    const operation = revealCheckCard(card, new AbortController().signal).then(() => { finished = true; });
    dom.tick(900); await Promise.resolve();
    assert.equal(card.element.dataset.verdict, undefined);
    assert.equal(card.element.querySelector('[data-result]').hidden, true);
    dom.tick(1750);
    assert.equal(card.element.dataset.verdict, saved.result.verdict);
    assert.equal(card.element.querySelector('[data-result]').hidden, false);
    assert.equal(finished, false);
    t.mock.timers.tick(DICE_REVEAL_MS); await operation;
    assert.equal(finished, true); assert.equal(dom.frames.size, 0); assert.deepEqual(saved, before);
});

test('D100 historical faces and displayed total preserve all 100 stored outcomes without rolling', t => {
    const dom = browser(t);
    t.mock.method(Math, 'random', () => assert.fail('rendering cannot reroll'));
    for (let roll = 1; roll <= 100; roll++) {
        const saved = coc7Record(roll), card = createCheckCard(saved, false);
        assert.equal(card.element.dataset.verdict, saved.result.verdict);
        assert.equal(Number(card.element.querySelector('[data-roll]').dataset.roll), roll);
        for (const place of ['tens', 'units']) {
            const die = card.element.querySelector(`[data-place="${place}"]`);
            const numeral = place === 'tens' ? String(saved.result.tens * 10).padStart(2, '0') : String(saved.result.units);
            // Visible numeral on the front face is the visual result contract, not decorative SVG structure.
            const facing = [...die.querySelectorAll('text')].find(text => text.textContent === numeral);
            assert.ok(Number(facing.getAttribute('opacity')) > .98);
            for (let node = facing; node && node !== die; node = node.parentElement) { assert.notEqual(node.style.display, 'none'); }
        }
    }
    assert.equal(dom.frames.size, 0);
});

test('D100 explains the required threshold, exact ties and special outcomes without rejudging history', t => {
    browser(t);
    for (const [roll, difficulty, value, comparison, verdict] of [
        [43, 'hard', 65, 'above', 'not_achieved'], [32, 'hard', 65, 'at_or_below', 'achieved'],
        [13, 'extreme', 65, 'at_or_below', 'achieved'], [27, 'extreme', 65, 'above', 'not_achieved'],
        [1, 'extreme', 1, 'critical', 'achieved'], [97, 'hard', 65, 'fumble', 'not_achieved'],
        [97, 'regular', 65, 'above', 'not_achieved'], [100, 'regular', 65, 'fumble', 'not_achieved'],
    ]) {
        const saved = coc7Record(roll, difficulty, value), card = createCheckCard(saved, false);
        assert.equal(card.element.dataset.verdict, verdict);
        assert.equal(card.element.querySelector('[data-comparison]').dataset.comparison, comparison);
        const basis = card.element.querySelector('[data-divisor]');
        assert.equal(Number(basis.dataset.value), value);
        assert.equal(Number(basis.dataset.threshold), saved.result.threshold);
    }
    const historical = coc7Record(); historical.result.verdict = 'achieved';
    assert.equal(createCheckCard(historical, false).element.dataset.verdict, 'achieved');
});

test('D100 easy cards show the bonus, cap and saved outcome without rerolling', t => {
    browser(t);
    for (const [value, roll, threshold, verdict] of [[40, 50, 60, 'achieved'], [80, 95, 95, 'achieved'], [80, 96, 95, 'not_achieved']]) {
        const saved = coc7Record(roll, 'easy', value);
        const record = parseDiceRecords({ schemaVersion: 3, checks: [saved] }).checks[0];
        const card = createCheckCard(record, false);
        assert.equal(card.element.dataset.verdict, verdict);
        const basis = card.element.querySelector('[data-bonus]');
        assert.equal(Number(basis.dataset.value), value);
        assert.equal(Number(basis.dataset.bonus), 20);
        assert.equal(Number(basis.dataset.cap), 95);
        assert.equal(Number(basis.dataset.threshold), threshold);
        assert.equal(card.element.querySelector('[data-comparison]').dataset.comparison,
            verdict === 'achieved' ? 'at_or_below' : 'above');
    }
});

test('D100 cards retain mapped inputs and untrained sources after history reload', t => {
    browser(t);
    for (const [stat, kind, value] of [['潜行', 'mapped', 20], ['隐匿潜行', 'mapped', 20], ['火系魔法', 'untrained', 40], ['运动与隐匿', 'untrained', 40]]) {
        const candidate = prepareActionCheck({ id: 'resolved', rule: 'coc7', generatedFrom: 0, coc7Sheet: emptyCoc7Draft(), random: () => .2,
            body: '<xb_action_check>' + JSON.stringify({ action: '尝试行动', stat, difficulty: 'hard' }) + '</xb_action_check>' });
        const history = parseDiceRecords(JSON.parse(JSON.stringify(candidate.records)));
        for (const pending of [true, false]) {
            const card = createCheckCard(history.checks[0], pending);
            const identity = card.element.querySelector('[data-resolution]');
            assert.equal(identity.dataset.resolution, kind);
            assert.ok(identity.textContent.includes(stat), 'the actual input is visible, not only a corrected name');
            assert.ok(identity.textContent.includes(history.checks[0].request.stat), 'the saved capability remains visible');
            card.settle();
            const basis = card.element.querySelector('[data-divisor]');
            assert.equal(Number(basis.dataset.value), value);
            assert.equal(Number(basis.dataset.threshold), value / 2);
            assert.ok(card.element.getAttribute('aria-label').includes(stat), 'assistive output also retains the input');
        }
    }
});
