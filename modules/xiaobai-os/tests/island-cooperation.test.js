import assert from 'node:assert/strict';
import test from 'node:test';
import { PERSON_IDS } from '../apps/game/island/model.ts';
import { LANDSCAPE, RULES } from '../apps/game/island/content.ts';
import { newJourney } from '../apps/game/island/world.ts';
import { operate } from '../apps/game/island/operations.ts';
import { openScene, observe } from '../apps/game/island/scene.ts';
import { knownAgreements } from '../apps/game/island/cooperation.ts';
import { knownDeclarations, record } from '../apps/game/island/experience.ts';
import { chunks, readChunk, readExperience, recall } from '../apps/game/island/memory.ts';
import { createSceneWork } from '../apps/game/island/scene-work.ts';
import { AGENT_POLICY } from '../apps/game/island/agent/policy.ts';
import { ISLAND_PARTITION } from '../apps/game/island/partition.ts';

function start() {
    const w = newJourney('cooperation');
    for (const [i, id] of PERSON_IDS.entries()) w.people[id].position = { x: -700 + i * 90, y: 0 };
    w.people.lin.position = { x: -699, y: 0 };
    return w;
}
const act = (w, actor, operation) => operate(w, actor === 'player' ? { kind: 'player' }
    : { kind: 'gm', scene: openScene(w, actor, LANDSCAPE) }, actor, operation, LANDSCAPE);
const declare = (w, actor, text, choice) => act(w, actor, { kind: 'declare', text, choice });
const propose = w => declare(w, 'player', '我住林地，轮流取水；我提供容器，你帮我收集椰子。', { kind: 'proposal' });
const response = (w, actor, proposal, stance) => declare(w, actor, `这次回应：${stance}`, { kind: 'response', proposal, stance });
const relay = (w, actor, reference) => declare(w, actor, '转述这段原话。', { kind: 'relay', reference });
const data = w => ({ formatVersion: 1, revision: 1, active: w, last: { id: 'cooperation', fingerprint: '0'.repeat(64) } });

test('cooperation records individual choices without binding positions, support, possessions or other people', () => {
    let w = start();
    w = declare(w, 'player', '我支持林遥。', { kind: 'support', person: 'lin', stance: 'with' });
    w = declare(w, 'player', '住在里面。', { kind: 'residence', position: { x: -520, y: -35 } });
    const physical = structuredClone({ people: w.people, items: w.items, structures: w.structures, clock: w.clock });
    w = propose(w); const proposal = w.experiences.at(-1).sequence;
    assert.deepEqual(knownAgreements(w, 'player')[0].commitments.map(s => [s.actor, s.stance]), [['player', 'accept']]);
    assert.deepEqual(knownAgreements(w, 'zhou'), []);
    w = response(w, 'lin', proposal, 'accept');
    w = response(w, 'lin', proposal, 'decline');
    const agreements = knownAgreements(w, 'player');
    assert.deepEqual(agreements[0].commitments.map(s => [s.actor, s.stance]), [['player', 'accept'], ['lin', 'decline']]);
    assert.deepEqual({ people: w.people, items: w.items, structures: w.structures, clock: w.clock }, physical);
    assert.deepEqual(knownDeclarations(w, 'player').map(e => e.payload.choice.kind), ['support', 'residence']);
    assert.equal(w.experiences.filter(e => e.payload.kind === 'declaration' && e.payload.choice.kind === 'response').length, 2);
    assert.throws(() => response(w, 'zhou', proposal, 'accept'), { code: 'island_memory_unavailable' });
    assert.throws(() => relay(w, 'zhou', proposal), { code: 'island_memory_unavailable' });
});

test('separate camps retain stale expectations; relaying an old response cannot overwrite a newer known withdrawal', () => {
    let w = propose(start());
    w = response(w, 'lin', 1, 'accept'); const accepted = w.experiences.at(-1).sequence;
    w.people.lin.position = { x: -400, y: 0 };
    w = response(w, 'lin', 1, 'decline'); const withdrawn = w.experiences.at(-1).sequence;
    assert.equal(knownAgreements(w, 'player')[0].commitments.find(s => s.actor === 'lin').stance, 'accept');
    w.people.lin.position = { x: -699, y: 0 };
    assert.equal(knownAgreements(w, 'player')[0].commitments.find(s => s.actor === 'lin').stance, 'accept');
    w = relay(w, 'lin', withdrawn);
    w = relay(w, 'lin', accepted);
    const answer = knownAgreements(w, 'player')[0].commitments.find(s => s.actor === 'lin');
    assert.equal(answer.stance, 'decline'); assert.equal(answer.reference, withdrawn);
    assert.equal(answer.source, 4);
});

test('explicit retelling teaches only the selected statement, supports onward retelling and never unlocks the private source', () => {
    let w = start();
    w = act(w, 'player', { kind: 'say', text: '不属于合作条款的私事。' });
    w = propose(w); const proposal = w.experiences.at(-1).sequence;
    w = response(w, 'lin', proposal, 'accept'); const answer = w.experiences.at(-1).sequence;
    w.people.player.position = { x: -400, y: -90 }; w.people.zhou.position = { x: -698, y: 0 };
    w = relay(w, 'lin', answer);
    assert.deepEqual(knownAgreements(w, 'zhou'), []);
    assert.throws(() => response(w, 'zhou', proposal, 'accept'), { code: 'island_memory_unavailable' });
    w = relay(w, 'lin', proposal); const source = w.experiences.at(-1).sequence;
    const statement = readExperience(w, ['zhou'], source);
    assert.equal(statement.shared.text, w.experiences[proposal - 1].payload.text);
    assert.deepEqual(Object.keys(statement.shared).sort(), ['actor', 'choice', 'reference', 'text']);
    for (const sequence of [1, proposal, answer]) assert.throws(() => readExperience(w, ['zhou'], sequence), { code: 'island_memory_unavailable' });
    const agreement = knownAgreements(w, 'zhou')[0];
    assert.equal(agreement.source, source); assert.equal(agreement.through, 'lin');
    assert.deepEqual(agreement.commitments.map(s => s.actor), ['player', 'lin']);
    w = response(w, 'zhou', proposal, 'accept');
    w.people.lin.position = { x: -400, y: 0 }; w.people.xu.position = { x: -697, y: 0 };
    w = relay(w, 'zhou', proposal);
    assert.equal(knownAgreements(w, 'xu')[0].terms, agreement.terms);
    assert.deepEqual(knownAgreements(w, 'xu')[0].commitments.map(s => s.actor), ['player']);
    assert.equal(knownAgreements(w, 'lin')[0].commitments.find(s => s.actor === 'zhou').stance, 'accept');
});

test('save reload derives agreements from the same originals and rejects unknown, future and non-cooperation references', () => {
    let w = propose(start()); w = response(w, 'lin', 1, 'accept');
    w.people.zhou.position = { x: -698, y: 0 }; w = relay(w, 'lin', 1);
    const saved = ISLAND_PARTITION.serialize(data(w)), loaded = ISLAND_PARTITION.parse(saved);
    assert.equal(loaded.ok, true); assert.deepEqual(saved, data(w));
    assert.deepEqual(observe(loaded.value.active, 'zhou', LANDSCAPE).agreements, knownAgreements(w, 'zhou'));
    for (const corrupt of [
        next => { next.active.experiences[1].payload.choice.proposal = 3; },
        next => { next.active.experiences[0].audience = ['player']; },
        next => { next.active.experiences[2].payload.choice.reference = 3; },
        next => { next.active.experiences[0].payload.choice = { kind: 'residence', position: { x: -700, y: 0 } }; },
    ]) { const changed = structuredClone(saved); corrupt(changed); assert.equal(ISLAND_PARTITION.parse(changed).ok, false); }
    assert.deepEqual(knownAgreements(newJourney('restart'), 'player'), []);
});

test('relayed terms are searchable under their new audience and source changes invalidate their derived vectors', () => {
    let w = propose(start()); w.people.player.position = { x: -400, y: -90 }; w.people.zhou.position = { x: -698, y: 0 };
    w = relay(w, 'lin', 1);
    const parts = chunks(w, 1000), relayed = parts.filter(p => p.sequence === 2);
    assert.equal(relayed.length, 1);
    const excerpt = readChunk(w, ['zhou'], relayed[0]);
    assert.equal(JSON.parse(excerpt.text.split('\n')[1]).text, w.experiences[0].payload.text);
    const index = { space: 'local-fixture', dimensions: 2, entries: parts.map(c => ({ chunk: c.id, digest: c.digest, vector: [1, 0] })) };
    const result = recall(w, ['zhou'], parts, index, { space: index.space, vector: [1, 0] }, 10);
    assert.deepEqual(result.hits.map(h => h.source), [2]);
    assert.deepEqual(result.hits[0].audience, ['lin', 'zhou']);
    w.experiences[0].payload.text = '原文改变';
    const changed = recall(w, ['zhou'], parts, index, { space: index.space, vector: [1, 0] }, 10);
    assert.equal(changed.complete, false); assert.equal(changed.hits.length, 0);
});

test('many long agreements stay bounded and all remain reachable through observation paging and readable sources', () => {
    const w = newJourney('many-agreements');
    for (let i = 0; i < 80; i++) record(w, { kind: 'declaration', actor: 'player', text: `${i}`.padEnd(RULES.maxSpeechCharacters, '约'), choice: { kind: 'proposal' } }, w.people.player.position, 'sound', LANDSCAPE, ['player']);
    const work = createSceneWork(w, 'player', LANDSCAPE), references = new Set();
    let offset = 0;
    for (let pageNumber = 0; pageNumber < 80; pageNumber++) {
        const page = work.context(offset);
        assert.ok(JSON.stringify(page).length <= AGENT_POLICY.observationCharacters);
        const observer = page.find(o => o.observer === 'lin');
        for (const agreement of observer.agreements) {
            references.add(agreement.proposal);
            assert.equal(agreement.termsTruncated, true);
            assert.ok(agreement.termsPreview.length <= AGENT_POLICY.statementPreviewCharacters);
            assert.equal(work.read(agreement.source).payload.text.length, RULES.maxSpeechCharacters);
        }
        if (observer.next === null) break;
        assert.ok(observer.next > offset); offset = observer.next;
    }
    assert.equal(references.size, 80);
});
