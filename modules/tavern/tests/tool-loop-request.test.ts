import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildGoogleSessionToolLoopSendPayload,
    resolveTavernToolLoopRequestPlan,
} from '../app-src/runtime/tool-loop-request';

test('tool loop request plan keeps full prompt rounds on non-session providers', () => {
    const messages = [{ role: 'user', content: 'hello' }];
    const plan = resolveTavernToolLoopRequestPlan({
        supportsSessionToolLoop: false,
        messages,
        toolResponses: [{ id: 'read-1', name: 'Read', response: { ok: true } }],
        finalAnswerReminderText: 'finish now',
    });

    assert.equal(plan.mode, 'full_prompt_round');
    assert.equal(plan.requestMessages, messages);
    assert.equal(plan.toolResponses.length, 0);
    assert.equal(plan.finalAnswerReminderText, '');
});

test('tool loop request plan strips replay messages from session tool-response rounds', () => {
    const plan = resolveTavernToolLoopRequestPlan({
        supportsSessionToolLoop: true,
        messages: [{ role: 'user', content: 'hello' }],
        toolResponses: [{ id: 'check-1', name: 'ActionCheck', response: { ok: true } }],
    });

    assert.equal(plan.mode, 'session_tool_response_round');
    assert.deepEqual(plan.requestMessages, []);
    assert.equal(plan.toolResponses.length, 1);
    assert.equal(plan.finalAnswerReminderText, '');
});

test('tool loop request plan strips replay messages from session final-reminder rounds', () => {
    const plan = resolveTavernToolLoopRequestPlan({
        supportsSessionToolLoop: true,
        messages: [{ role: 'user', content: 'hello' }],
        finalAnswerReminderText: 'finish now',
    });

    assert.equal(plan.mode, 'session_final_reminder_round');
    assert.deepEqual(plan.requestMessages, []);
    assert.equal(plan.toolResponses.length, 0);
    assert.equal(plan.finalAnswerReminderText, 'finish now');
});

test('tool loop request plan builds google follow-up payloads from actual send shape', () => {
    const toolResponsePayload = buildGoogleSessionToolLoopSendPayload(resolveTavernToolLoopRequestPlan({
        supportsSessionToolLoop: true,
        toolResponses: [{ id: 'check-1', name: 'ActionCheck', response: { ok: true, roll: 17 } }],
    }));
    assert.deepEqual(toolResponsePayload, {
        message: {
            role: 'user',
            parts: [{
                functionResponse: {
                    name: 'ActionCheck',
                    response: { ok: true, roll: 17 },
                },
            }],
        },
    });

    const reminderPayload = buildGoogleSessionToolLoopSendPayload(resolveTavernToolLoopRequestPlan({
        supportsSessionToolLoop: true,
        finalAnswerReminderText: 'finish now',
    }));
    assert.deepEqual(reminderPayload, {
        message: [{ text: 'finish now' }],
    });
});
