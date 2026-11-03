import assert from 'node:assert/strict';
import test from 'node:test';
import { traveler } from './fixtures/expedition-traveler.js';
import { createCampaign, advanceCampaign } from '../apps/game/expedition/campaign/rules.ts';
import { applyReply } from '../apps/game/expedition/narrative/apply-reply.ts';
import { dialogueActionFeedback } from '../apps/game/expedition/presentation/action-feedback.ts';
import { DESTINATIONS } from '../apps/game/expedition/content/people-places.ts';
import { PARLEY_ENEMIES } from '../apps/game/expedition/content/parley.ts';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { startWorld } from '../apps/game/expedition/world/exploration.ts';
import { tickPeople } from '../apps/game/expedition/world/people.ts';

const fixture = () => createCampaign('feedback', 7, 'blade', 'traveler', traveler);
const turn = action => ({ id: 'reply', kind: 'dialogue', player: 'fixture', reply: 'fixture', action, facts: [], scene: 'camp' });

test('saved ordinary actions have outcomes; prose, greetings, diagnostics and visual performances alone do not', () => {
    const c = fixture();
    for (const action of ['briefing', 'receiving', 'clinic', 'share_secret', 'follow', 'stay', ...Object.keys(DESTINATIONS).map(id => `go:${id}`)]) {
        const feedback = dialogueActionFeedback(c, 'sanniang', turn(action));
        assert.equal(feedback.action, action);
        assert.equal(feedback.phase, 'applied');
        assert.ok(feedback.text.length > 0);
    }
    for (const variant of [
        { reply: '我已经跟上你了。' }, { kind: 'greeting' }, { kind: 'receipt', issue: 'reply_incomplete' },
        { issue: 'metadata_invalid' }, { issue: 'action_rejected' }, { performance: { expression: 'smile', gesture: 'nod' } },
    ]) assert.equal(dialogueActionFeedback(c, 'sanniang', { ...turn(null), ...variant }), null);
    assert.equal(dialogueActionFeedback(c, 'sanniang', { ...turn('briefing'), issue: 'performance_rejected' }).phase, 'applied');
});

test('only the current movement order stays pending across further dialogue; stopping or arriving retires its reminder', () => {
    const c = fixture();
    const accept = (id, action) => {
        applyReply(c, { actionId: id, person: 'sanniang', text: 'fixture' }, { kind: 'dialogue', reply: 'fixture', action, affection: null });
        return c.conversations.sanniang.at(-1);
    };
    const phase = reply => dialogueActionFeedback(c, 'sanniang', reply)?.phase;
    const start = structuredClone(c.people.sanniang.position), first = accept('first-trip', 'go:clinic_back');
    assert.equal(phase(first), 'pending');
    accept('still-talking', null);
    assert.equal(phase(first), 'pending');
    assert.deepEqual(c.people.sanniang.position, start);
    const stop = accept('stay', 'stay');
    assert.equal(phase(first), 'applied'); assert.equal(phase(stop), 'applied');
    const next = accept('second-trip', 'go:clinic_back');
    assert.equal(phase(first), 'applied'); assert.equal(phase(next), 'pending');
    for (let i = 0; i < 1000 && c.people.sanniang.mode === 'travel'; i++) tickPeople(c);
    assert.equal(c.people.sanniang.mode, 'idle');
    assert.equal(phase(next), 'applied');
    const follow = accept('follow', 'follow');
    accept('ordinary', null);
    assert.equal(phase(follow), 'pending');
    const followAgain = accept('follow-again', 'follow');
    assert.equal(phase(follow), 'applied'); assert.equal(phase(followAgain), 'pending');
    accept('stop-following', 'stay');
    assert.equal(phase(followAgain), 'applied');
});

// Decisions are persisted before acknowledgement; the UI must not report the deferred world effect as completed.
test('pass and attack remain pending until the player acknowledges, then remain as historical outcomes', () => {
    for (const person of ['bajin', 'changyounian']) for (const action of ['pass', 'attack']) {
        const c = fixture(), spec = PARLEY_ENEMIES[person];
        c.location = startWorld(COURTYARD[spec.scene], 'parley');
        applyReply(c, { actionId: 'decision', person, text: 'fixture' }, { kind: 'dialogue', reply: 'fixture', action, affection: null });
        const reply = c.conversations[person].at(-1);
        assert.equal(dialogueActionFeedback(c, person, reply).phase, 'pending');
        assert.equal(c.facts.includes(spec.complete), false);
        advanceCampaign(c, { type: 'resolve_parley' });
        assert.equal(dialogueActionFeedback(c, person, reply).phase, 'applied');
        assert.equal(action === 'pass' ? c.facts.includes(spec.persuaded) : c.phase === 'battle', true);
        c.conversations[person].push({ ...turn(null), id: 'later' });
        assert.equal(dialogueActionFeedback(c, person, reply).phase, 'applied');
    }
});

test('a saved chapter-ending reply is not a completed chapter until continuation is accepted', () => {
    const c = fixture();
    c.location.position = { ...c.people.sanniang.position };
    c.facts.push('captives_arrived', 'supplies_secured', 'warden_defeated');
    applyReply(c, { actionId: 'ending', person: 'sanniang', text: 'fixture' }, { kind: 'dialogue', reply: 'fixture', action: 'finish', affection: null });
    const reply = c.conversations.sanniang.at(-1);
    assert.equal(dialogueActionFeedback(c, 'sanniang', reply).phase, 'pending');
    assert.equal(c.facts.includes('chapter_completed'), false);
    advanceCampaign(c, { type: 'accept_reply' });
    assert.equal(c.facts.includes('chapter_completed'), true);
    assert.equal(dialogueActionFeedback(c, 'sanniang', reply).phase, 'applied');
});
