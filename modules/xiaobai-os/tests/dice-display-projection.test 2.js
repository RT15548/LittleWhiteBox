import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { prepareActionCheck } from '../apps/dice/application/prepare-action-check.ts';
import { checkDisplayProjection } from '../apps/dice/host/check-display-projection.ts';
import { showDiceDisplayRule } from '../apps/dice/host/managed-rule-display.ts';
import { DICE_DISPLAY_RULE } from '../apps/dice/host/display-rule.ts';
import { parseDiceRecords } from '../apps/dice/domain/check-records.ts';
import { readFileSync } from 'node:fs';

const call = '<xb_action_check>{"action":"Climb","stat":"Agility","difficulty":"hard"}</xb_action_check>';
test('a pending native translation projects the confirmed marker without changing either stored text', () => {
    const candidate = prepareActionCheck({ body: 'Before.\n\n' + call, generatedFrom: 0, id: 'one', random: () => .3 });
    const message = { mes: candidate.body, extra: { display_text: '译文。\n\n' + call + '\n</fictional_scenarios>' } };
    const original = structuredClone(message);
    assert.equal(checkDisplayProjection(message, candidate.records.checks), '译文。\n\n[dice:one]');
    assert.deepEqual(message, original);
    assert.equal(checkDisplayProjection(message, []), message.extra.display_text);
    message.mes = 'Edited prose, same retained result. [dice:one]';
    assert.equal(checkDisplayProjection(message, candidate.records.checks), '译文。\n\n[dice:one]');
    message.mes += '\nAfter.';
    assert.equal(checkDisplayProjection(message, candidate.records.checks), message.extra.display_text, 'stale translations do not reposition historical cards');
    message.extra.display_text = '译文。\n\n[dice:one]\n后文。';
    assert.equal(checkDisplayProjection(message, candidate.records.checks), message.extra.display_text);
});

test('a stale translated request cannot be assigned to a different retained marker', () => {
    const message = JSON.parse(readFileSync(new URL('./fixtures/dice-message-a32c28d0.json', import.meta.url), 'utf8'));
    const records = parseDiceRecords(message.extra.xiaobaiOsDice);
    const [wall, door] = records.checks;
    message.mes = 'Edited approach. [dice:wall]';
    message.extra.display_text = '译文。\n\n<xb_action_check>' + JSON.stringify(door.request) + '</xb_action_check>';
    assert.equal(checkDisplayProjection(message, records.checks), message.extra.display_text);
    message.extra.display_text = '译文。\n\n<xb_action_check>' + JSON.stringify(wall.request) + '</xb_action_check>';
    assert.equal(checkDisplayProjection(message, records.checks), '译文。\n\n[dice:wall]');
    message.mes = 'No retained markers.';
    assert.equal(checkDisplayProjection(message, records.checks), message.extra.display_text);
});

test('the registered managed rule is immediately visible without disturbing other native rows', () => {
    const { document } = parseHTML('<html><body><div id="saved_regex_scripts"><div id="user-rule">User rule</div></div></body></html>');
    const userRow = document.getElementById('user-rule');
    let clicks = 0;
    userRow.addEventListener('click', () => clicks++);
    showDiceDisplayRule(document);
    showDiceDisplayRule(document);
    const list = document.getElementById('saved_regex_scripts');
    assert.equal(list.children.length, 2);
    assert.equal(list.firstElementChild.id, DICE_DISPLAY_RULE.id);
    assert.equal(list.firstElementChild.querySelector('.regex_script_name').textContent, DICE_DISPLAY_RULE.scriptName);
    assert.equal(list.lastElementChild, userRow);
    userRow.click(); assert.equal(clicks, 1);
});
