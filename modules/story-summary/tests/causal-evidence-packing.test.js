import assert from 'node:assert/strict';
import test from 'node:test';
import { packCausalEvidence } from '../generate/causal-evidence-packing.js';

function fixture() {
    const owners = ['a', 'b'].map(id => ({
        label: id, event: { id, causedBy: [1, 2, 3].map(n => `${id}${n}`) },
    }));
    const causes = new Map(owners.flatMap(owner => owner.event.causedBy.map(id => (
        [id, { id, summary: id }]
    ))));
    return { owners, causes };
}

test('causal owner and shared quotas admit their boundary cause, then stop that lane', () => {
    const { owners, causes } = fixture();
    const budget = { used: 0, max: 1000 };
    const result = packCausalEvidence(owners, causes, budget, () => 75);
    assert.deepEqual([...result.byEvent].map(([id, items]) => [id, items.map(item => item.eventId)]), [
        ['a', ['a1', 'a2']], ['b', ['b1']],
    ]);
    assert.equal(result.stats.tokens, 300);
    assert.equal(budget.used, result.stats.tokens);
    assert.ok(budget.used - 75 < result.stats.maxTokens);
});

test('a cause crossing the outer pool closes all owners, including later shorter references', () => {
    const { owners, causes } = fixture();
    const budget = { used: 995, max: 1000 };
    const result = packCausalEvidence(owners, causes, budget, () => 20);
    assert.equal(result.stats.links, 1);
    assert.equal(budget.used, 1035);
    assert.deepEqual([...result.byEvent.keys()], ['a']);
});

const event = (id, causedBy = [], summary = id) => ({ id, causedBy, summary });
function packGraph(events, roots, { max = 4000, used = 0, estimate = () => 1 } = {}) {
    const eventIndex = new Map(events.map(item => [item.id, item]));
    const owners = roots.map(id => ({ event: eventIndex.get(id), label: `main-${id}` }));
    const budget = { max, used };
    return { ...packCausalEvidence(owners, eventIndex, budget, estimate), budget, owners };
}

test('an admitted event brings its consequences without a second retrieval, but not remote causes or siblings', () => {
    const events = [event('g'), event('p', ['g']), event('r', ['p']), event('sibling', ['p']),
        event('eaten', ['r']), event('later', ['eaten'])];
    const result = packGraph(events, ['r']);
    const links = result.byEvent.get('r');
    assert.deepEqual(links.map(item => [item.direction, item.eventId]), [
        ['consequence', 'eaten'], ['cause', 'p'], ['consequence', 'later'],
    ]);
    assert.deepEqual(links.at(-1).path, ['r', 'eaten', 'later']);
    assert.equal(result.stats.causes, 1);
    assert.equal(result.stats.consequences, 2);
    assert.equal(packGraph(events, []).byEvent.size, 0);
});

test('tight budgets retain the intermediate outcome rather than jumping to a distant endpoint', () => {
    const result = packGraph([event('delivered'), event('eaten', ['delivered']),
        event('cancelled', ['eaten']), event('angry', ['cancelled'])], ['delivered'], { estimate: () => 200 });
    assert.deepEqual(result.byEvent.get('delivered').map(item => item.eventId), ['eaten', 'cancelled']);
    assert.equal(result.stats.tokens, 600);
});

test('a forward path cannot jump across a record with no body, but another admitted path can reach it', () => {
    const events = [event('root'), event('missing', ['root'], ''), event('bridge', ['root']),
        event('result', ['missing', 'bridge']), event('unlinked')];
    const result = packGraph(events, ['root']);
    assert.deepEqual(result.byEvent.get('root').map(item => item.path), [
        ['root', 'bridge'], ['root', 'bridge', 'result'],
    ]);
    assert.equal(result.candidates.find(item => item.eventId === 'missing').admitted, false);
});

test('forward traversal remains finite with cycles and shortcuts and honors the depth bound', () => {
    const chain = Array.from({ length: 15 }, (_, index) => event(`e${index}`, index ? [`e${index - 1}`] : ['e2']));
    const result = packGraph(chain, ['e0'], { max: 10000 });
    const forward = result.byEvent.get('e0').filter(item => item.direction === 'consequence');
    assert.deepEqual(forward.map(item => item.eventId), chain.slice(1, 11).map(item => item.id));
    assert.equal(result.stats.depth, 10);
    for (const item of forward) assert.equal(new Set(item.path).size, item.path.length);
    const shortcut = packGraph([event('a'), event('b', ['a']), event('c', ['b']), event('d', ['a', 'c'])], ['a']);
    assert.deepEqual(shortcut.byEvent.get('a').find(item => item.eventId === 'd').path, ['a', 'd']);
});

test('shared bodies have one global cap and every reference points to admitted text', () => {
    const result = packGraph([event('a'), event('b'),
        ...Array.from({ length: 40 }, (_, index) => event(`child-${index}`, ['a', 'b']))], ['a', 'b'], { max: 10000 });
    const links = [...result.byEvent.values()].flat();
    const bodies = links.filter(item => !item.reference);
    assert.equal(bodies.length, 30);
    assert.equal(new Set(bodies.map(item => item.eventId)).size, 30);
    assert.equal(result.stats.links, 60);
    const labels = new Set([...result.owners.map(owner => owner.label), ...bodies.map(item => item.label)]);
    for (const item of links) assert.ok(labels.has(item.label));
    const reused = packGraph([event('a'), event('b', ['a'])], ['a', 'b']);
    assert.equal(reused.stats.bodies, 0);
    assert.equal(reused.stats.links, 2);
    assert.ok([...reused.byEvent.values()].flat().every(item => item.reference));
});

test('the shared explanation and all references are charged once, and closed budgets emit neither', () => {
    const events = [event('a'), event('b'), event('c', ['a', 'b'])];
    const result = packGraph(events, ['a', 'b'], { estimate: text => text.length });
    const links = [...result.byEvent.values()].flat();
    assert.ok(result.introduction.length > 0);
    assert.equal(result.stats.tokens, result.introduction.length + links.reduce((sum, item) => sum + item.text.length, 0));
    assert.equal(result.budget.used, result.stats.tokens);
    const closed = packGraph(events, ['a'], { used: 4000 });
    assert.equal(closed.byEvent.size, 0);
    assert.equal(closed.introduction, '');
    assert.equal(closed.stats.tokens, 0);
});
