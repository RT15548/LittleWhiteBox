import assert from 'node:assert/strict';
import test from 'node:test';
import { decideEncounter, parseEncounterRecords } from '../apps/dice/domain/encounter.ts';
import { captureEncounterTarget, encounterReplyTarget, recentEncounterOutcomes } from '../apps/dice/host/encounter-records.ts';
import { buildEncounterPrompt } from '../apps/dice/protocol/encounter-prompt.ts';
import { projectionMarker } from '../apps/messages/application/projection.ts';

const records = outcome => ({schemaVersion:1,encounter:{outcome}});
const user = (outcome, mes='user') => ({is_user:true,is_system:false,name:'Player',mes,extra:{foreign:1,...(outcome ? {xiaobaiOsDice:records(outcome)} : {})}});
const ai = () => ({is_user:false,is_system:false,name:'Actor',mes:'reply',extra:{}});
const source = chat => ({key:'character:a:chat',chatId:'chat',avatar:'a',characterId:0,characterName:'Actor',chat});
const auxiliary = message => !!projectionMarker(message);

test('one mutually exclusive draw has exact 1/3/5/91 boundaries; two real user turns consume cooldown', () => {
    for (const [r, expected] of [[0,'high'],[0.009999,'high'],[0.01,'medium'],[0.039999,'medium'],[0.04,'low'],[0.089999,'low'],[0.09,'none'],[0.99999,'none']]) {
        let calls=0;
        assert.deepEqual(decideEncounter([],()=>{calls++;return r;}),records(expected)); assert.equal(calls,1);
    }
    for (const recent of [['high'],['low',undefined],['medium','cooldown']]) {
        assert.deepEqual(decideEncounter(recent,()=>{throw new Error('must not draw');}),records('cooldown'));
    }
    assert.deepEqual(decideEncounter(['high',undefined,undefined],()=>0.5),records('none'));
    const s=source([user('high'),ai(),user(undefined,'disabled turn'),ai(),user(undefined,'now')]);
    assert.deepEqual(recentEncounterOutcomes(captureEncounterTarget(s,4)),['high',undefined]);
    for(const r of [-1,1,NaN,Infinity]) assert.throws(()=>decideEncounter([],()=>r));
    for(const value of [{}, {schemaVersion:1,checks:[]}, {schemaVersion:1,encounter:{outcome:'surprise'}}, {schemaVersion:1,encounter:{outcome:{toString:()=> 'low'}}}]) assert.throws(()=>parseEncounterRecords(value));
});

test('the user owns the decision; only the first RP reply and its continuations receive it', () => {
    const s=source([ai(),user('medium')]);
    assert.equal(encounterReplyTarget(s,'regenerate',auxiliary).message,s.chat[1]);
    s.chat.push(ai());
    assert.equal(encounterReplyTarget(s,'normal',auxiliary),null);
    for(const type of ['continue','swipe']) assert.equal(encounterReplyTarget(s,type,auxiliary).message,s.chat[1]);
    s.chat.push(ai());
    assert.equal(encounterReplyTarget(s,'continue',auxiliary),null);
    s.chat.pop(); // Regenerating a later member must not reuse the first member's instruction.
    assert.equal(encounterReplyTarget(s,'regenerate',auxiliary),null);
});

test('private-message projections neither consume the first RP reply nor become its continuation target', () => {
    const player = user('medium');
    const privateFloor = { ...ai(), extra: { xiaobai_private_messages: {
        version: 1, segmentId: 'private-1', throughSeq: 1, digest: 'a'.repeat(64),
    } } };
    const s = source([player, privateFloor]);
    assert.equal(encounterReplyTarget(s, 'normal', auxiliary).message, player);
    for (const type of ['continue', 'swipe']) assert.equal(encounterReplyTarget(s, type, auxiliary), null);
    s.chat.push(ai());
    for (const type of ['continue', 'swipe']) assert.equal(encounterReplyTarget(s, type, auxiliary).message, player);
    s.chat.push(structuredClone(privateFloor));
    assert.equal(encounterReplyTarget(s, 'continue', auxiliary), null, 'a trailing projection is not the RP reply');
    s.chat.push(ai());
    assert.equal(encounterReplyTarget(s, 'continue', auxiliary), null, 'a second real reply is still excluded');
});

test('impact levels remain distinct across all four reference flag combinations', () => {
    const variants = { low: [], medium: [], high: [] };
    for (const world of [false, true]) for (const summary of [false, true]) {
        const prompts = Object.keys(variants).map(level => {
            const prompt = buildEncounterPrompt(level, { world, summary });
            variants[level].push(prompt);
            // world_background is the existing external injected-context tag, not an implementation spelling.
            assert.equal(prompt.includes('<world_background>'), world);
            return prompt;
        });
        assert.equal(new Set(prompts).size, 3);
    }
    for (const prompts of Object.values(variants)) assert.equal(new Set(prompts).size, 4);
});
