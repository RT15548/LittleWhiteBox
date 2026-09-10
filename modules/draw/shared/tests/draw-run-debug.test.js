import assert from 'node:assert/strict';
import test from 'node:test';

import {
    logDrawRunPlannerDiagnostics,
    resetDrawRunPlannerFailureLogsForTests,
} from '../draw-run-debug.js';

test('new Planner validation failures enter the browser console once with the LLM result and schema error', () => {
    resetDrawRunPlannerFailureLogsForTests();
    const entries = [];
    const logger = {
        log(prefix, details) { entries.push({ prefix, details }); },
    };
    const run = {
        id: 'run-debug-1',
        progress: {
            validationFailures: [{
                attempt: 1,
                errorCode: 'TOOL_ARGUMENTS_SCHEMA_INVALID',
                errorMessage: 'images[0].characters must be an array',
                errorPath: 'images[0].characters',
                errorRule: 'must be an array',
                received: 'none',
                expected: [],
                modelOutput: '{"toolCalls":[{"name":"submit_scene_plan","arguments":"bad"}]}',
                modelOutputTruncated: false,
            }],
        },
    };

    assert.equal(logDrawRunPlannerDiagnostics(run, logger), 1);
    assert.equal(logDrawRunPlannerDiagnostics(run, logger), 0);
    assert.equal(entries.length, 1);
    assert.match(entries[0].prefix, /Tool 返回未通过校验/);
    assert.equal(entries[0].details.errorPath, 'images[0].characters');
    assert.equal(entries[0].details.errorRule, 'must be an array');
    assert.equal(entries[0].details.llmResult.toolCalls[0].name, 'submit_scene_plan');
    assert.equal(entries[0].details.llmResult.toolCalls[0].arguments, 'bad');
});

test('browser console logging does not require the DEBUG monitor to be enabled', () => {
    resetDrawRunPlannerFailureLogsForTests();
    const entries = [];
    const logger = {
        isEnabled: () => false,
        log(_prefix, details) { entries.push(details); },
    };
    const run = {
        id: 'run-debug-2',
        progress: {
            validationFailures: [{ attempt: 2, errorCode: 'TOOL_CALL_MISSING', modelOutput: '{"text":"plain answer"}' }],
        },
    };

    assert.equal(logDrawRunPlannerDiagnostics(run, logger), 1);
    assert.equal(entries[0].errorCode, 'TOOL_CALL_MISSING');
    assert.equal(entries[0].llmResult.text, 'plain answer');
});

test('backend recovery prints each round once with complete output and durations', () => {
    resetDrawRunPlannerFailureLogsForTests();
    const entries = [];
    const logger = { log: (_label, details) => entries.push(details) };
    const fullText = 'response'.repeat(4000);
    const run = {
        id: 'run-debug-rounds',
        progress: {
            model: 'model-name',
            attempts: [{ attempt: 1, durationMs: 25000 }],
            validationFailures: [{
                attempt: 1, durationMs: 25000, errorCode: 'TOOL_CALL_MISSING',
                modelOutput: JSON.stringify({ text: fullText }), modelOutputTruncated: false,
            }],
        },
    };
    logDrawRunPlannerDiagnostics(run, logger);
    logDrawRunPlannerDiagnostics(run, logger);
    run.progress.attempts.push({ attempt: 2, durationMs: 20000 });
    logDrawRunPlannerDiagnostics(run, logger);
    assert.equal(entries.length, 3);
    assert.equal(entries[1].llmResult.text, fullText);
    assert.deepEqual(entries.map(entry => entry.durationMs), [25000, 25000, 20000]);
    assert.ok(entries.every(entry => entry.runId === run.id && entry.model === 'model-name'));
});
