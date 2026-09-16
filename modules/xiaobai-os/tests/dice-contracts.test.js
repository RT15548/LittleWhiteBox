import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveActionCheck, rollActionCheck } from '../apps/dice/domain/action-check.ts';
import { DICE_PARTITION } from '../apps/dice/partition.ts';
import { parseDiceRecords, hasValidCheckAnchor } from '../apps/dice/domain/check-records.ts';
import { prepareActionCheck } from '../apps/dice/application/prepare-action-check.ts';
import { parseActionCheck, ACTION_CHECK_EXAMPLE, ACTION_CHECK_FIELDS } from '../apps/dice/protocol/request.ts';
import { ACTION_CHECK_OPEN, ACTION_CHECK_DISPLAY_PATTERN } from '../apps/dice/protocol/markup.ts';
import { buildActionCheckPrompt, projectActionCheckResults, serializeActionCheckResults } from '../apps/dice/protocol/prompt.ts';
import { repairDiceDisplayRules, DICE_DISPLAY_RULE } from '../apps/dice/host/display-rule.ts';

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
    for (const dc of [1, 22, 2.5, NaN, Infinity]) assert.throws(() => resolveActionCheck(dc, 10));
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
    const input = { ...request, action: 'say </xb_action_check> or <xb_action_check>', character: '  Mira  ' };
    const parsed = parseActionCheck(`尝试。\n\n${block(input)}\n`);
    assert.equal(parsed.kind, 'request');
    assert.equal(parsed.body, '尝试。\n\n');
    assert.deepEqual(parsed.request, { ...input, character: 'Mira' });
});

test('rejects unknown fields, wrong types, null, whitespace, oversized input and ambiguous/truncated JSON', () => {
    const invalid = [null, [], 123, { ...request, dc: 12 }, { ...request, difficulty: 15 },
        { ...request, difficulty: 'toString' }, { ...request, stat: '  ' }, { ...request, character: null },
        { ...request, stakes: '' }, { ...request, action: 0 }];
    for (const [field, spec] of Object.entries(ACTION_CHECK_FIELDS)) {
        invalid.push({ ...request, [field]: 'a'.repeat(spec.maxLength + 1) });
        assert.equal(parseActionCheck(block({ ...request, [field]: 'a'.repeat(spec.maxLength) })).kind, 'request');
    }
    invalid.push({ ...request, stat: '😀'.repeat(61) });
    for (const value of invalid) { assert.equal(parseActionCheck(block(value)).kind, 'invalid', JSON.stringify(value)); }
    for (const body of [block() + '后文', block() + '\n\n' + block(), '<xb_action_check>{', '<xb_action_check>']) {
        assert.equal(parseActionCheck(body).kind, 'invalid');
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

test('invalid requests and the persisted eight-check limit consume no randomness; valid appended checks retain anchors', () => {
    let calls = 0;
    const random = () => { calls++; return 0.3; };
    assert.equal(prepareActionCheck({ body: block({ ...request, dc: 1 }), generatedFrom: 0, id: 'invalid', random }).kind, 'invalid');
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
    assert.ok(records.checks.every(record => record.roll === 7 && record.dc === 12 && hasValidCheckAnchor(body, record)));
    const denied = prepareActionCheck({ body: body + '\n\n' + block(), generatedFrom: body.length, records, id: 'ninth', random });
    assert.deepEqual(denied, { kind: 'invalid', error: 'dice_check_limit' });
    assert.equal(calls, drawsBeforeLimit);
    assert.equal(hasValidCheckAnchor('changed' + body, records.checks[0]), false);
    assert.equal(hasValidCheckAnchor(body + '\n后文', records.checks[0]), true);
    assert.deepEqual(projectActionCheckResults(records.checks), records.checks.map(record => ({ ...request, roll: record.roll, dc: record.dc, outcome: record.outcome })));
});

test('new preferences default off, unsupported data is rejected without a legacy fallback', () => {
    assert.deepEqual(DICE_PARTITION.createInitial(), { schemaVersion: 1, actionChecksEnabled: false, encountersEnabled: false });
    assert.equal(DICE_PARTITION.parse({ schemaVersion: 1, actionChecksEnabled: true, encountersEnabled: false }).ok, true);
    assert.equal(DICE_PARTITION.parse({ schemaVersion: 1, actionChecksEnabled: true, encounters: false }).ok, false);
    assert.throws(() => parseDiceRecords({ schemaVersion: 99, checks: [] }));
});

test('malformed saved records and edited prefixes cannot produce another die roll', () => {
    const saved = prepareActionCheck({ body: '🪜踏上墙壁。\n\n' + block(), generatedFrom: 0, id: 'saved', random: () => 0.3 });
    assert.equal(saved.body, '🪜踏上墙壁。\n\n[dice:saved]');
    for (const records of [
        { ...saved.records, extra: true },
        { ...saved.records, checks: [...saved.records.checks, ...saved.records.checks] },
        { ...saved.records, checks: [{ ...saved.records.checks[0], roll: 0 }] },
        { ...saved.records, checks: [{ ...saved.records.checks[0], prefixDigest: 'bad' }] },
    ]) {
        assert.throws(() => prepareActionCheck({ body: saved.body + '\n\n' + block(), generatedFrom: saved.body.length,
            records, id: 'next', random: () => assert.fail('invalid history must not roll') }));
    }
    assert.deepEqual(prepareActionCheck({ body: '改写前文。\n\n' + block(), generatedFrom: 0,
        records: saved.records, id: 'next', random: () => assert.fail('edited history must not roll') }),
    { kind: 'invalid', error: 'dice_body_changed' });
});

test('result data round-trips macro-like action text without emitting executable host macros', () => {
    const candidate = prepareActionCheck({ body: block({ ...request, action: '{{setvar::diceProbe::unexpected}}' }),
        generatedFrom: 0, id: 'safe-text', random: () => 0.3 });
    const encoded = serializeActionCheckResults(candidate.records.checks);
    assert.deepEqual(JSON.parse(encoded), projectActionCheckResults(candidate.records.checks));
    // This is an external host protocol safety boundary, not a source-code existence check.
    assert.equal(encoded.includes('{{'), false);
});

test('action-check prompt states genuine uncertainty, stakes, and natural no-check situations', () => {
    const prompt = buildActionCheckPrompt();
    assert.match(prompt, /genuinely go either way/);
    assert.match(prompt, /outcome changes what happens next/);
    assert.match(prompt, /overwhelming advantage, position, or common sense/);
    assert.match(prompt, /without stakes, risk, or resistance/);
    assert.match(prompt, /consensual intimacy/);
    assert.match(prompt, /adds no numeric modifier/);
});

test('continuation prompt resumes directly without preset opening material', () => {
    const prompt = buildActionCheckPrompt([{ request, roll: 12, dc: 12, outcome: 'success', id: 'x', prefixDigest: 'digest' }]);
    assert.match(prompt, /established fact/);
    assert.match(prompt, /exact point where the attempted action paused/);
    assert.match(prompt, /next in-character prose sentence/);
    assert.match(prompt, /thinking or reasoning block/);
    assert.match(prompt, /instructional preamble/);
    assert.match(prompt, /title, header, speaker label, status panel/);
    assert.match(prompt, /do not mention the dice/);
    assert.ok(prompt.includes('"roll":12'));
    assert.ok(prompt.includes('"outcome":"success"'));
});

test('managed rule checks are no-ops when valid, repair only their own ID and preserve other rule objects', () => {
    const other = { id: 'user', findRegex: '/hello/g' };
    assert.equal(repairDiceDisplayRules([structuredClone(DICE_DISPLAY_RULE), other]), null);
    const replacement = repairDiceDisplayRules([other]);
    assert.equal(replacement[1], other);
    assert.equal(repairDiceDisplayRules(replacement), null);
    assert.deepEqual(repairDiceDisplayRules([{ ...DICE_DISPLAY_RULE, disabled: true }, other]), replacement);
});

test('executing a check replaces only its request, preserving surrounding prose and whitespace byte for byte', () => {
    const before = '【1】起身。  \n\n<details><summary>状态</summary>【8】仍在这里。</details>\n\n';
    const after = '\r\n \t';
    const raw = before + block() + after;
    const saved = prepareActionCheck({ body: raw, generatedFrom: 0, id: 'fixed', random: () => .3 });
    assert.equal(saved.kind, 'candidate');
    assert.equal(saved.body, before + '[dice:fixed]' + after);
    assert.ok(hasValidCheckAnchor(saved.body, saved.records.checks[0]));
    assert.equal(hasValidCheckAnchor(before + after, saved.records.checks[0]), false);
});
