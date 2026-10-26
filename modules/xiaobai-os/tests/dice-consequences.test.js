import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { CHECK_CONSEQUENCE_FIELDS } from '../apps/dice/domain/check-consequences.ts';
import { emptyCoc7Draft } from '../apps/dice/domain/coc7-creation.ts';
import { DICE_RECORDS_SCHEMA_VERSION, parseDiceRecords } from '../apps/dice/domain/check-records.ts';
import { rollCoc7 } from '../apps/dice/domain/coc7.ts';
import { resolveActionCheck } from '../apps/dice/domain/action-check.ts';
import { rerollCheck } from '../apps/dice/domain/reroll.ts';
import { applyResultOverride, createResultOverride } from '../apps/dice/domain/result-override.ts';
import { prepareActionCheck } from '../apps/dice/application/prepare-action-check.ts';
import { applyDiceCandidate, captureDiceTarget, clearDiceMessageData, readDiceRecords } from '../apps/dice/host/message-records.ts';
import { COC7_EXAMPLE } from '../apps/dice/protocol/coc7-contract.ts';
import { ACTION_CHECK_EXAMPLE, parseActionCheck } from '../apps/dice/protocol/request.ts';
import { buildActionCheckContinuation, serializeActionCheckResults } from '../apps/dice/protocol/prompt.ts';
import { createCheckCard } from '../apps/dice/ui/check-card.ts';
import { savedV1, savedV3 } from './fixtures/dice-v3.js';

// Acceptance contracts (cost):
// - Both executable examples retain separate consequences through adjudication (protocol mismatch).
// - Active swipe save/reload/continuation and rerolls retain both branches without changing odds (data loss).
// - Invalid supplied branches stop before rolling; omission never fabricates a consequence (broken chat).
// - Cards retain both branches through rolling and rerolls without presenting a pending verdict (misleading result).
// - Model text stays literal in cards and outgoing data (HTML/macro injection).
// - Supported saved formats preserve context, results and paid reroll receipts without guessing branches (data/money loss).
const consequences = { success: '避开守卫进入庭院。', failure: '弄出声响，引来巡查。' };
const request = { action: '翻过湿滑的围墙', stat: 'athletics', difficulty: 'hard' };
const wrap = value => `你抓住墙沿。\n\n<xb_action_check>${JSON.stringify(value)}</xb_action_check>`;
const prepare = (value, options = {}) => prepareActionCheck({ body: wrap(value), generatedFrom: 0,
    id: 'consequence-check', rule: 'coc7', coc7Sheet: emptyCoc7Draft(), random: () => .4, ...options });
const reload = records => parseDiceRecords(JSON.parse(JSON.stringify(records)));
function withDocument(run) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
    Object.defineProperty(globalThis, 'document', { configurable: true, value: parseHTML('<html><body></body></html>').document });
    try { run(); } finally {
        if (previous) { Object.defineProperty(globalThis, 'document', previous); }
        else { delete globalThis.document; }
    }
}

test('both model examples execute and retain their separate consequences', () => {
    for (const [rule, body] of [['coc7', COC7_EXAMPLE], ['d20', ACTION_CHECK_EXAMPLE]]) {
        const parsed = parseActionCheck(body, 0, rule);
        assert.equal(parsed.kind, 'request');
        for (const key of Object.keys(consequences)) { assert.ok(parsed.request[key].trim()); }
        const candidate = prepareActionCheck({ body, generatedFrom: 0, rule,
            id: `example-${rule}`, coc7Sheet: emptyCoc7Draft(), random: () => .4 });
        assert.equal(candidate.kind, 'candidate');
        for (const key of Object.keys(consequences)) {
            assert.equal(reload(candidate.records).checks[0].request[key], parsed.request[key]);
        }
    }
});

for (const rule of ['d20', 'coc7']) {
    test(`${rule}: branches survive active swipe save, reload, continuation and cleanup`, () => {
        const candidate = prepare({ ...request, success: `  ${consequences.success}  `, failure: consequences.failure }, { rule });
        assert.equal(candidate.kind, 'candidate');
        const body = wrap({ ...request, ...consequences });
        const message = { mes: body, swipe_id: 1, swipes: ['另一候选', body],
            swipe_info: [{ extra: { unrelated: 'keep' } }, { extra: { note: 'keep' } }], extra: { note: 'keep' } };
        const source = { key: 'consequence-chat', chat: [message] };
        applyDiceCandidate(source, captureDiceTarget(source, 0, 0, rule, emptyCoc7Draft()), candidate);
        const saved = JSON.parse(JSON.stringify(message));
        const records = parseDiceRecords(readDiceRecords(saved));
        assert.deepEqual(records, candidate.records);
        assert.deepEqual(saved.swipe_info[1].extra.xiaobaiOsDice, records);
        assert.deepEqual(saved.swipe_info[0], { extra: { unrelated: 'keep' } });
        const continuation = buildActionCheckContinuation(saved.mes, records.checks, true);
        const [data] = JSON.parse(continuation.match(/```json\n([\s\S]*?)\n```/)[1]);
        for (const key of Object.keys(consequences)) { assert.equal(data[key], consequences[key]); }
        clearDiceMessageData([saved]);
        assert.equal(readDiceRecords(saved), undefined);
        assert.equal(saved.swipe_info[1].extra.xiaobaiOsDice, undefined);
        assert.equal(saved.swipes[0], '另一候选');
        assert.equal(saved.extra.note, 'keep');
    });

    test(`${rule}: optional branches do not change adjudication and invalid branches never roll`, () => {
        const baseline = reload(prepare(request, { rule }).records).checks[0];
        const enriched = reload(prepare({ ...request, ...consequences }, { rule }).records).checks[0];
        const { success, failure, ...rest } = enriched.request;
        assert.deepEqual({ success, failure }, consequences);
        assert.deepEqual({ ...enriched, request: rest }, baseline);
        for (const [key, spec] of Object.entries(CHECK_CONSEQUENCE_FIELDS)) {
            for (const value of [null, '', '  ', 42, false, [], {}, 'x'.repeat(spec.maxLength + 1)]) {
                let draws = 0;
                const result = prepare({ ...request, [key]: value }, { rule, random: () => { draws++; return .4; } });
                assert.equal(result.kind, 'invalid');
                assert.equal(draws, 0);
            }
            assert.equal(prepare({ ...request, [key]: 'x'.repeat(spec.maxLength) }, { rule }).kind, 'candidate');
        }
    });

    test(`${rule}: saved branches and rerolls preserve the request and fixed basis`, () => {
        const candidate = prepare({ ...request, ...consequences }, { rule });
        const original = reload(candidate.records).checks[0];
        const rerolled = rerollCheck(original, () => .8);
        assert.deepEqual(rerolled.request, original.request);
        if (rule === 'd20') { assert.equal(rerolled.dc, original.dc); }
        else { assert.equal(rerolled.result.threshold, original.result.threshold); }
        const overridden = applyResultOverride(original, createResultOverride(rerolled, 'reroll-consequences'));
        assert.deepEqual(reload({ ...candidate.records, checks: [overridden] }).checks[0], rerolled);
        for (const [key, spec] of Object.entries(CHECK_CONSEQUENCE_FIELDS)) {
            for (const value of [null, '', ' ', 42, {}, 'x'.repeat(spec.maxLength + 1)]) {
                const invalid = structuredClone(candidate.records);
                invalid.checks[0].request[key] = value;
                assert.throws(() => reload(invalid), TypeError);
            }
        }
        for (const key of ['action', 'stat', 'difficulty']) {
            const missing = structuredClone(candidate.records);
            delete missing.checks[0].request[key];
            assert.throws(() => reload(missing), TypeError);
        }
        const invalid = structuredClone(candidate.records);
        invalid.checks[0].request.extra = 'unknown';
        assert.throws(() => reload(invalid), TypeError);
    });

    test(`${rule}: card rerolls retain both branches and reveal only the verdict`, () => withDocument(() => {
        const original = reload(prepare({ ...request, ...consequences }, { rule }).records).checks[0];
        let draw = 0;
        const success = rerollCheck(original, rule === 'd20' ? () => .95 : () => draw++ === 0 ? .1 : 0);
        const failure = rerollCheck(original, () => .8);
        const failed = rule === 'd20' ? { ...failure, ...resolveActionCheck(failure.dc, 1) } : failure;
        const card = createCheckCard(success, true);
        const assertBranches = () => {
            assert.deepEqual([...card.element.querySelectorAll('.xb-dice-consequence')].map(node => node.textContent),
                [consequences.success, consequences.failure]);
            assert.equal(Boolean(card.element.querySelector('.xb-dice-copy').hidden), false);
        };
        assertBranches();
        assert.equal(card.element.dataset.outcome, undefined);
        card.settle();
        assertBranches();
        assert.equal(rule === 'coc7' ? card.element.dataset.verdict : card.element.dataset.outcome,
            rule === 'coc7' ? 'achieved' : 'critical_success');
        card.update(failed, true);
        assertBranches();
        assert.equal(card.element.dataset.outcome, undefined);
        card.settle();
        assertBranches();
        assert.equal(rule === 'coc7' ? card.element.dataset.verdict : card.element.dataset.outcome,
            rule === 'coc7' ? 'not_achieved' : 'critical_failure');
        card.update(success, false);
        assertBranches();
    }));

    test(`${rule}: cards show both available consequences and keep model text literal`, () => withDocument(() => {
        const literal = '<img src=x onerror="alert(1)"> {{getvar::secret}}\n后果。';
        const record = reload(prepare({ ...request, success: literal, failure: literal }, { rule }).records).checks[0];
        const card = createCheckCard(record, false);
        assert.deepEqual([...card.element.querySelectorAll('.xb-dice-consequence')].map(node => node.textContent), [literal, literal]);
        assert.equal(card.element.querySelector('img'), null);
        const serialized = serializeActionCheckResults([record]);
        assert.equal(serialized.includes('{{'), false);
        assert.equal(JSON.parse(serialized)[0].success, literal);
        assert.equal(JSON.parse(serialized)[0].failure, literal);
        for (const partial of [{}, { success: consequences.success }]) {
            const failed = reload(prepare({ ...request, ...partial }, { rule }).records).checks[0];
            assert.equal(createCheckCard(failed, false).element.querySelectorAll('.xb-dice-consequence').length,
                partial.success ? 1 : 0);
        }
    }));

}

test('D100 uses achievement, even when a rolled success degree is below the requested difficulty', () => withDocument(() => {
    const base = reload(prepare({ ...request, ...consequences }).records).checks[0];
    const samples = [
        [60, 'hard', [.5, .4], 'regular', 'not_achieved'],
        [60, 'extreme', [.5, .2], 'hard', 'not_achieved'],
        [60, 'regular', [.5, .4], 'regular', 'achieved'],
        [60, 'extreme', [.1, 0], 'critical', 'achieved'],
        [60, 'hard', [.6, .9], 'fumble', 'not_achieved'],
    ];
    for (const [value, difficulty, digits, level, verdict] of samples) {
        let index = 0;
        const result = rollCoc7(value, difficulty, () => digits[index++]);
        assert.equal(result.level, level); assert.equal(result.verdict, verdict);
        const card = createCheckCard({ ...base, result }, false);
        assert.deepEqual([...card.element.querySelectorAll('.xb-dice-consequence')].map(node => node.textContent),
            [consequences.success, consequences.failure]);
    }
}));

test('release-produced V3 records preserve background and paid overrides without inventing branches', () => withDocument(() => {
    for (const fixture of savedV3) {
        const before = structuredClone(fixture.records);
        const records = reload(before);
        assert.equal(records.schemaVersion, DICE_RECORDS_SCHEMA_VERSION);
        const record = records.checks[0];
        assert.equal(record.context, before.checks[0].request.stakes);
        assert.equal(record.basis, fixture.override.basis);
        assert.equal(Object.hasOwn(record.request, 'stakes'), false);
        assert.deepEqual(reload(records), records);
        assert.deepEqual(before, fixture.records);
        const overridden = applyResultOverride(record, fixture.override);
        assert.equal(overridden.rule === 'd20' ? overridden.roll : overridden.result.roll, fixture.override.result.roll);
        const card = createCheckCard(overridden, false);
        assert.equal(card.element.querySelector('.xb-dice-consequence'), null);
        assert.equal(card.element.querySelector('details').hasAttribute('open'), false);
        assert.equal(card.element.querySelector('.xb-dice-context-text').textContent, record.context);
        assert.equal(JSON.parse(serializeActionCheckResults([record]))[0].context, record.context);
        assert.equal(Object.hasOwn(JSON.parse(serializeActionCheckResults([record]))[0], 'basis'), false);
    }
}));

test('V1 converts directly and unsupported or malformed historical formats fail without guessing', () => {
    const record = reload(savedV1).checks[0];
    assert.equal(record.context, savedV1.checks[0].request.stakes);
    assert.equal(record.basis, savedV3[0].override.basis);
    assert.equal(Object.hasOwn(record, 'offset'), false);
    assert.equal(Object.hasOwn(record, 'prefixDigest'), false);
    for (const version of [2, 5]) { assert.throws(() => reload({ ...savedV1, schemaVersion: version }), TypeError); }
    for (const fixture of savedV3) {
        for (const request of [{ ...fixture.records.checks[0].request, stakes: null },
            { ...fixture.records.checks[0].request, success: 'not a V3 field' }]) {
            const invalid = structuredClone(fixture.records);
            invalid.checks[0].request = request;
            assert.throws(() => reload(invalid), TypeError);
        }
    }
});
