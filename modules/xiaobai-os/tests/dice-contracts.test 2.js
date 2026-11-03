import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolveActionCheck, rollActionCheck } from '../apps/dice/domain/action-check.ts';
import { parseDiceRecords, referencedActionChecks, isCheckContinuationPoint, DICE_RECORDS_SCHEMA_VERSION } from '../apps/dice/domain/check-records.ts';
import { prepareActionCheck } from '../apps/dice/application/prepare-action-check.ts';
import { parseActionCheck, ACTION_CHECK_EXAMPLE, ACTION_CHECK_FIELDS } from '../apps/dice/protocol/request.ts';
import { ACTION_CHECK_OPEN, ACTION_CHECK_DISPLAY_PATTERN } from '../apps/dice/protocol/markup.ts';
import { buildActionCheckContinuation, buildActionCheckRules, projectActionCheckResults, serializeActionCheckResults } from '../apps/dice/protocol/prompt.ts';
import { readDicePromptResults } from './helpers/dice-prompt.js';
import { repairDiceDisplayRules, DICE_DISPLAY_RULE } from '../apps/dice/host/display-rule.ts';
import { generateCoc7Sheet } from '../apps/dice/domain/coc7-creation.ts';

const request = { action: '攀上墙壁', stat: '敏捷', difficulty: 'hard' };
const block = (data = request) => `<xb_action_check>${JSON.stringify(data)}</xb_action_check>`;
const filter = text => text.replace(new RegExp(ACTION_CHECK_DISPLAY_PATTERN, 'gm'), '$1');

test('D20 thresholds and critical outcomes hold for every face and every supported target', () => {
    for (let dc = 2; dc <= 21; dc++) {
        for (let roll = 1; roll <= 20; roll++) {
            const outcome = roll === 1 ? 'critical_failure' : roll === 20 ? 'critical_success' : roll >= dc ? 'success' : 'failure';
            assert.deepEqual(resolveActionCheck(dc, roll), { roll, dc, outcome });
        }
    }
});

// The requested bands and independent random choices are gameplay contracts, not sampling statistics.
test('each band maps equal random intervals to integer targets independently of the D20 roll', () => {
    const bands = [['easy', 2, 5], ['ordinary', 6, 10], ['hard', 11, 15], ['very_hard', 16, 20], ['nearly_impossible', 21, 21]];
    for (const [difficulty, min, max] of bands) {
        for (let dc = min; dc <= max; dc++) {
            for (const fraction of [0, 0.5, 0.999999]) {
                for (let roll = 1; roll <= 20; roll++) {
                    const samples = [(dc - min + fraction) / (max - min + 1), (roll - 0.5) / 20];
                    const result = rollActionCheck(difficulty, () => {
                        assert.ok(samples.length, 'a check consumes only its target and die samples');
                        return samples.shift();
                    });
                    const outcome = roll === 1 ? 'critical_failure' : roll === 20 ? 'critical_success' : roll >= dc ? 'success' : 'failure';
                    assert.deepEqual(result, { dc, roll, outcome });
                    assert.equal(samples.length, 0);
                }
            }
        }
    }
});

test('invalid targets, rolls and random samples cannot produce check results', () => {
    for (const dc of [0, -1, 2.5, NaN, Infinity]) assert.throws(() => resolveActionCheck(dc, 10));
    for (const roll of [0, 21, 1.5, NaN, Infinity]) assert.throws(() => resolveActionCheck(10, roll));
    assert.throws(() => rollActionCheck('unknown', () => assert.fail('invalid difficulty must not draw')));
    for (const bad of [-0.01, 1, NaN, Infinity]) {
        assert.throws(() => rollActionCheck('hard', () => bad), /dice_random_invalid/);
        const samples = [0.3, bad];
        assert.throws(() => rollActionCheck('hard', () => samples.shift()), /dice_random_invalid/);
    }
});

test('the real prompt example and JSON string tags are parsed as a single request', () => {
    assert.equal(parseActionCheck(ACTION_CHECK_EXAMPLE).kind, 'request');
    for (const frequency of ['standard', 'active']) {
        assert.ok(buildActionCheckRules(frequency, 'd20', true).length > 0);
        const prepared = prepareActionCheck({ body: ACTION_CHECK_EXAMPLE, generatedFrom: 0, id: 'example', random: () => 0.3 });
        assert.equal(prepared.kind, 'candidate');
        assert.deepEqual(prepared.records.checks[0].request, parseActionCheck(ACTION_CHECK_EXAMPLE).request);
    }
    const input = { ...request, action: 'say "</xb_action_check>" or \\<xb_action_check>', character: '  Mira\\  ' };
    const parsed = parseActionCheck(`尝试。\n\n  ${block(input)}\n</fictional_scenarios>`);
    assert.equal(parsed.kind, 'request');
    assert.equal(parsed.body, '尝试。\n\n');
    assert.deepEqual(parsed.request, { ...input, character: 'Mira\\' });
});

test('rejects wrong types, null, whitespace, oversized input and ambiguous/truncated JSON', () => {
    const invalid = [null, [], 123, { ...request, difficulty: 15 },
        { ...request, difficulty: 'toString' }, { ...request, stat: '  ' }, { ...request, character: null },
        { ...request, stakes: '' }, { ...request, action: 0 }];
    for (const [field, spec] of Object.entries(ACTION_CHECK_FIELDS)) {
        invalid.push({ ...request, [field]: 'a'.repeat(spec.maxLength + 1) });
        assert.equal(parseActionCheck(block({ ...request, [field]: 'a'.repeat(spec.maxLength) })).kind, 'request');
    }
    invalid.push({ ...request, stat: '😀'.repeat(61) });
    for (const value of invalid) { assert.equal(parseActionCheck(block(value)).kind, 'invalid', JSON.stringify(value)); }
    for (const body of [block() + '\n\n' + block(), '<xb_action_check>{', '<xb_action_check>',
        '<xb_action_check>{"action":"unfinished</xb_action_check>\n</fictional_scenarios>',
        '<xb_action_check>{bad}</xb_action_check>\n</fictional_scenarios>']) {
        assert.equal(parseActionCheck(body).kind, 'invalid');
    }
});

test('D20 ignores extra model keys without changing its known fields, roll or stored record contract', () => {
    const input = { ...request, character: 'Mira', stakes: 'Reach the balcony' };
    const extra = { ...input, dc: 1, roll: 20, outcome: 'critical_success', metadata: { arbitrary: true } };
    const parsed = parseActionCheck(block(extra));
    assert.equal(parsed.kind, 'request');
    assert.deepEqual(parsed.request, input);
    const prepare = data => prepareActionCheck({ body: block(data), generatedFrom: 0, id: 'extra', random: () => 0.3 });
    const candidate = prepare(extra);
    assert.deepEqual(candidate, prepare(input));
    const damaged = structuredClone(candidate.records);
    damaged.checks[0].request.metadata = extra.metadata;
    assert.throws(() => parseDiceRecords(damaged), 'ignoring model extras does not relax persisted records');
});

test('preset suffixes do not block a valid check or survive the confirmed continuation boundary', () => {
    const before = '<fictional_scenarios>\n尝试推门。\n\n';
    const playerRequest = { action: '以蛮力推挤并试图撼动被黑色荆棘缠绕的冷铁封闭之门', stat: '力量', character: '蓝袖',
        stakes: '成功则强行撼动门扉撕开一道荆棘缝隙，失败则被反震击退并被荆棘刺伤双手', difficulty: 'hard' };
    for (const rule of ['d20', 'coc7']) {
        const input = rule === 'd20' ? playerRequest : { action: playerRequest.action, stat: 'body', difficulty: 'hard' };
        for (const suffix of ['\n</fictional_scenarios>', '\n后文\n</fictional_scenarios>\n</xb_action_check>', '\r\n \t']) {
            const body = before + block(input) + suffix;
            const parsed = parseActionCheck(body, before.length, rule);
            assert.equal(parsed.kind, 'request');
            assert.deepEqual(parsed.request, input);
            assert.equal(body.slice(parsed.end), suffix);
            let draws = 0;
            const prepared = prepareActionCheck({ body, generatedFrom: before.length, rule, id: 'suffix',
                coc7Sheet: generateCoc7Sheet(() => 0.5), random: () => { draws++; return 0.3; } });
            assert.equal(prepared.kind, 'candidate');
            assert.equal(draws, 2);
            assert.equal(prepared.body, before + '[dice:suffix]');
            assert.equal(prepared.records.checks.length, 1);
            assert.equal(isCheckContinuationPoint(prepared.body, prepared.records.checks[0]), true);
        }
        const malformed = { body: before + block({ ...input, difficulty: 'unknown' }) + '\n</fictional_scenarios>',
            generatedFrom: before.length, rule, id: 'invalid', random: () => assert.fail('invalid request must not roll') };
        const original = malformed.body;
        assert.equal(prepareActionCheck(malformed).kind, 'invalid');
        assert.equal(malformed.body, original);
    }
});

test('code, lazy quotes, unrelated tools and historical output are not executable', () => {
    const call = block();
    for (const body of ['```json\n' + call + '\n```', '~~~~\n' + call + '\n~~~~',
        '`' + call + '`', '``' + call + '``', '`example `` extra\n' + call + '`',
        '> ' + call, '> Quote:\n' + call, '    ' + call, 'Explain ' + call,
        '<tool_call>{"name":"other"}</tool_call>']) {
        assert.equal(parseActionCheck(body).kind, 'none', body);
        assert.equal(filter(body), body, body);
    }
    assert.equal(parseActionCheck(call + '\nnew words', call.length).kind, 'none');
    assert.equal(parseActionCheck('```json\n' + call, 8).kind, 'none');
    assert.equal(parseActionCheck('> quote\n\n' + call).kind, 'request');
});

test('display filtering begins at the complete opening tag, preserving all shorter prefixes and normal less-than signs', () => {
    const call = block();
    const before = '尝试。\n\n';
    for (let end = 1; end <= call.length; end++) {
        const raw = before + call.slice(0, end);
        assert.equal(filter(raw), end < ACTION_CHECK_OPEN.length ? raw : before, String(end));
    }
    for (const body of ['末尾符号：\n<', 'x < y', '符号：\n<\n正文', '<tool_call>other</tool_call>']) {
        assert.equal(filter(body), body);
    }
});

test('invalid requests and the persisted eight-check limit consume no randomness, even after deleting markers', () => {
    let calls = 0;
    const random = () => { calls++; return 0.3; };
    assert.equal(prepareActionCheck({ body: block({ ...request, difficulty: 'unknown', dc: 1 }), generatedFrom: 0, id: 'invalid', random }).kind, 'invalid');
    assert.equal(calls, 0);
    let records;
    let body = '';
    for (let index = 0; index < 8; index++) {
        const nextBody = body + '\n\n接着尝试。\n\n' + block();
        const candidate = prepareActionCheck({ body: nextBody, generatedFrom: body.length, records, id: `check-${index}`, random });
        assert.equal(candidate.kind, 'candidate');
        body = candidate.body;
        records = parseDiceRecords(JSON.parse(JSON.stringify(candidate.records)));
    }
    const drawsBeforeLimit = calls;
    assert.ok(drawsBeforeLimit > 0);
    assert.equal(records.checks.length, 8);
    assert.ok(records.checks.every(record => record.roll === 7 && record.dc === 12));
    assert.deepEqual(referencedActionChecks(body, records.checks), records.checks);
    const denied = prepareActionCheck({ body: body + '\n\n' + block(), generatedFrom: body.length, records, id: 'ninth', random });
    assert.deepEqual(denied, { kind: 'invalid', error: 'dice_check_limit' });
    assert.equal(calls, drawsBeforeLimit);
    assert.deepEqual(prepareActionCheck({ body: block(), generatedFrom: 0, records, id: 'ninth', random }), denied);
    assert.equal(calls, drawsBeforeLimit, 'deleting every marker does not reset used checks');
    assert.deepEqual(projectActionCheckResults(records.checks), records.checks.map(record => ({ rule: 'd20', ...request, roll: record.roll, dc: record.dc, outcome: record.outcome })));
});

test('unsupported message record versions are rejected', () => {
    for (const schemaVersion of [2, 99]) {
        const input = { schemaVersion, checks: [] };
        assert.throws(() => parseDiceRecords(input));
        assert.deepEqual(input, { schemaVersion, checks: [] });
    }
});

test('malformed saved records cannot produce another die roll', () => {
    const saved = prepareActionCheck({ body: '🪜踏上墙壁。\n\n' + block(), generatedFrom: 0, id: 'saved', random: () => 0.3 });
    assert.equal(saved.body, '🪜踏上墙壁。\n\n[dice:saved]');
    for (const records of [
        { ...saved.records, extra: true },
        { ...saved.records, checks: [...saved.records.checks, ...saved.records.checks] },
        { ...saved.records, checks: [{ ...saved.records.checks[0], roll: 0 }] },
        { ...saved.records, checks: [{ ...saved.records.checks[0], unexpected: true }] },
    ]) {
        assert.throws(() => prepareActionCheck({ body: saved.body + '\n\n' + block(), generatedFrom: saved.body.length,
            records, id: 'next', random: () => assert.fail('invalid history must not roll') }));
    }
});

// Created with the unchanged upstream a32c28d0 prepare/stage functions.
const upstreamMessage = JSON.parse(readFileSync(new URL('./fixtures/dice-message-a32c28d0.json', import.meta.url), 'utf8'));
test('upstream records convert at parsing without changing outcomes, IDs, source messages or current records', () => {
    const before = structuredClone(upstreamMessage);
    const parsed = parseDiceRecords(upstreamMessage.extra.xiaobaiOsDice);
    const expected = { schemaVersion: DICE_RECORDS_SCHEMA_VERSION, checks: upstreamMessage.extra.xiaobaiOsDice.checks.map(({ id, request, roll, dc, outcome }) =>
        ({ rule: 'd20', id, request, roll, dc, outcome })) };
    assert.deepEqual(parsed, expected);
    assert.deepEqual(parseDiceRecords(parsed), expected);
    assert.deepEqual(upstreamMessage, before);
    const historical = structuredClone(upstreamMessage.extra.xiaobaiOsDice);
    historical.checks[0].dc = 99;
    historical.checks[0].outcome = 'success';
    assert.equal(parseDiceRecords(historical).checks[0].outcome, 'success', 'stored verdicts are not recalculated');
    for (const change of [value => { value.checks[0].prefixDigest = 'bad'; },
        value => { value.checks[0].request.difficulty = ['hard']; },
        value => { value.checks[1].offset = 0; }, value => { value.checks[0].request.extra = true; }]) {
        const invalid = structuredClone(upstreamMessage.extra.xiaobaiOsDice);
        change(invalid);
        assert.throws(() => parseDiceRecords(invalid));
    }
});

test('markers select saved results in text order independently of prose edits, without duplicating or inventing results', () => {
    const records = parseDiceRecords(upstreamMessage.extra.xiaobaiOsDice);
    const before = structuredClone(records);
    const [wall, door] = records.checks;
    for (const [body, expected] of [
        ['Reworded. [dice:wall] More edits. [dice:door]', [wall, door]],
        ['Moved: [dice:door] before [dice:wall]', [door, wall]],
        ['Only this one remains. [dice:wall]', [wall]],
        ['[dice:unknown] [dice:door] [dice:door]', [door]],
        ['Everything removed.', []],
    ]) assert.deepEqual(referencedActionChecks(body, records.checks), expected);
    assert.equal(isCheckContinuationPoint('Reworded. [dice:door] Then [dice:wall]\n', wall), true);
    for (const body of ['[dice:wall] After.', 'No marker.', '[dice:wall][dice:wall]']) {
        assert.equal(isCheckContinuationPoint(body, wall), false);
    }
    assert.deepEqual(records, before);
});

test('new attempts after editing or deleting references preserve all prior results and draw only for the new check', () => {
    const history = upstreamMessage.extra.xiaobaiOsDice;
    const before = structuredClone(history);
    for (const prefix of ['Edited. [dice:wall] [dice:door]', 'Moved. [dice:door] [dice:wall]', 'No markers remain.']) {
        let draws = 0;
        const next = prepareActionCheck({ body: prefix + '\n\n' + block(), generatedFrom: prefix.length, records: history,
            id: 'next', random: () => { draws++; return 0.3; } });
        assert.equal(next.kind, 'candidate');
        assert.equal(draws, 2);
        assert.deepEqual(next.records.checks.slice(0, 2), parseDiceRecords(history).checks);
        assert.deepEqual(history, before);
    }
});

test('result data and continuation instructions preserve quoted action data without executable host macros', () => {
    const candidate = prepareActionCheck({ body: block({ ...request, action: 'Say "{{setvar::diceProbe::unexpected}}"\n```json\n[]\n```' }),
        generatedFrom: 0, id: 'safe-text', random: () => 0.3 });
    const encoded = serializeActionCheckResults(candidate.records.checks);
    assert.deepEqual(JSON.parse(encoded), projectActionCheckResults(candidate.records.checks));
    // This is an external host protocol safety boundary, not a source-code existence check.
    assert.equal(encoded.includes('{{'), false);
    for (const body of [candidate.body, candidate.body + '\nThe action is resolved.']) {
        const prompt = buildActionCheckContinuation(body, candidate.records.checks, true);
        assert.equal(prompt.includes('{{'), false);
        assert.deepEqual(readDicePromptResults(prompt), projectActionCheckResults(candidate.records.checks));
        assert.equal(parseActionCheck(prompt).kind, 'none');
    }
});

test('managed rule checks are no-ops when valid, repair only their own ID and preserve other rule objects', () => {
    const other = { id: 'user', findRegex: '/hello/g' };
    assert.equal(repairDiceDisplayRules([structuredClone(DICE_DISPLAY_RULE), other]), null);
    const replacement = repairDiceDisplayRules([other]);
    assert.equal(replacement[1], other);
    assert.equal(repairDiceDisplayRules(replacement), null);
    assert.deepEqual(repairDiceDisplayRules([{ ...DICE_DISPLAY_RULE, disabled: true }, other]), replacement);
});

test('executing a check preserves all preceding prose and whitespace while discarding the request tail', () => {
    const before = '【1】起身。  \n\n<details><summary>状态</summary>【8】仍在这里。</details>\n\n';
    const after = '\r\n \t';
    const raw = before + block() + after;
    const saved = prepareActionCheck({ body: raw, generatedFrom: 0, id: 'fixed', random: () => .3 });
    assert.equal(saved.kind, 'candidate');
    assert.equal(saved.body, before + '[dice:fixed]');
    assert.deepEqual(referencedActionChecks(saved.body, saved.records.checks), saved.records.checks);
    assert.deepEqual(referencedActionChecks(before + after, saved.records.checks), []);
});
