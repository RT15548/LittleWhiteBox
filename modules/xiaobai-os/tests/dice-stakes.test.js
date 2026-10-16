import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { ACTION_CHECK_REQUEST_FIELDS } from '../apps/dice/domain/action-check.ts';
import { emptyCoc7Draft } from '../apps/dice/domain/coc7-creation.ts';
import { parseDiceRecords } from '../apps/dice/domain/check-records.ts';
import { rerollCheck } from '../apps/dice/domain/reroll.ts';
import { applyResultOverride, createResultOverride } from '../apps/dice/domain/result-override.ts';
import { prepareActionCheck } from '../apps/dice/application/prepare-action-check.ts';
import { applyDiceCandidate, captureDiceTarget, clearDiceMessageData, readDiceRecords } from '../apps/dice/host/message-records.ts';
import { COC7_EXAMPLE } from '../apps/dice/protocol/coc7-contract.ts';
import { ACTION_CHECK_EXAMPLE, parseActionCheck } from '../apps/dice/protocol/request.ts';
import { buildActionCheckContinuation, serializeActionCheckResults } from '../apps/dice/protocol/prompt.ts';
import { createCheckCard } from '../apps/dice/ui/check-card.ts';

// Acceptance contracts (cost):
// - Executable prompt examples keep their stakes through adjudication (protocol mismatch).
// - Saving/reloading and continuing the active swipe retain the same stakes (silent data loss).
// - Omitted stakes remain valid; invalid supplied stakes stop before rolling (broken chat/protocol).
// - Rerolls preserve stakes and adjudication basis; cleanup removes owned data (lost check history).
// - Model text stays literal in the card and outgoing result data (HTML/macro injection).
const stakes = '成功：避开守卫进入庭院；失败：弄出声响，引来巡查。';
const request = { action: '翻过湿滑的围墙', stat: 'athletics', difficulty: 'hard' };
const wrap = value => `你抓住墙沿。\n\n<xb_action_check>${JSON.stringify(value)}</xb_action_check>`;
const prepare = (value, options = {}) => prepareActionCheck({ body: wrap(value), generatedFrom: 0,
    id: 'stakes-check', rule: 'coc7', coc7Sheet: emptyCoc7Draft(), random: () => .4, ...options });
const reload = records => parseDiceRecords(JSON.parse(JSON.stringify(records)));

test('both model examples execute and retain their declared stakes', () => {
    for (const [rule, body] of [['coc7', COC7_EXAMPLE], ['d20', ACTION_CHECK_EXAMPLE]]) {
        const parsed = parseActionCheck(body, 0, rule);
        assert.equal(parsed.kind, 'request');
        assert.equal(typeof parsed.request.stakes, 'string');
        assert.ok(parsed.request.stakes.trim());
        const candidate = prepareActionCheck({ body, generatedFrom: 0, rule,
            id: `example-${rule}`, coc7Sheet: emptyCoc7Draft(), random: () => .4 });
        assert.equal(candidate.kind, 'candidate');
        assert.equal(reload(candidate.records).checks[0].request.stakes, parsed.request.stakes);
    }
});

test('D100 stakes survive the active swipe save, reload and continuation, without changing other swipes', () => {
    const candidate = prepare({ ...request, stakes: `  ${stakes}  ` });
    assert.equal(candidate.kind, 'candidate');
    assert.equal(candidate.records.checks[0].request.stakes, stakes);
    const message = { mes: wrap({ ...request, stakes }), swipe_id: 1,
        swipes: ['另一候选', wrap({ ...request, stakes })],
        swipe_info: [{ extra: { unrelated: 'keep' } }, { extra: { note: 'keep' } }], extra: { note: 'keep' } };
    const source = { key: 'stakes-chat', chat: [message] };
    const target = captureDiceTarget(source, 0, 0, 'coc7', emptyCoc7Draft());
    applyDiceCandidate(source, target, candidate);
    const saved = JSON.parse(JSON.stringify(message));
    const records = parseDiceRecords(readDiceRecords(saved));
    assert.deepEqual(records, candidate.records);
    assert.deepEqual(saved.swipe_info[1].extra.xiaobaiOsDice, records);
    assert.deepEqual(saved.swipe_info[0], { extra: { unrelated: 'keep' } });
    assert.equal(saved.swipes[0], '另一候选');
    assert.equal(saved.extra.note, 'keep');
    const continuation = buildActionCheckContinuation(saved.mes, records.checks, true);
    const data = JSON.parse(continuation.match(/```json\n([\s\S]*?)\n```/)[1]);
    assert.equal(data[0].stakes, stakes);
    assert.deepEqual(data[0].result, records.checks[0].result);
    clearDiceMessageData([saved]);
    assert.equal(readDiceRecords(saved), undefined);
    assert.equal(saved.swipe_info[1].extra.xiaobaiOsDice, undefined);
    assert.equal(saved.swipes[0], '另一候选');
    assert.equal(saved.extra.note, 'keep');
});

test('optional stakes leave D100 and D20 adjudication unchanged and create no empty data', () => {
    for (const rule of ['coc7', 'd20']) {
        const without = prepare(request, { rule });
        const withStakes = prepare({ ...request, stakes }, { rule });
        assert.equal(without.kind, 'candidate');
        assert.equal(withStakes.kind, 'candidate');
        const baseline = reload(without.records).checks[0];
        const enriched = reload(withStakes.records).checks[0];
        assert.equal(Object.hasOwn(baseline.request, 'stakes'), false);
        assert.equal(enriched.request.stakes, stakes);
        const rest = { ...enriched.request };
        delete rest.stakes;
        assert.deepEqual({ ...enriched, request: rest }, baseline);
        assert.equal(Object.hasOwn(JSON.parse(serializeActionCheckResults([baseline]))[0], 'stakes'), false);
    }
});

test('invalid supplied D100 stakes are rejected before any random draw', () => {
    for (const value of [null, '', '  ', 42, false, [], {}, 'x'.repeat(ACTION_CHECK_REQUEST_FIELDS.stakes.maxLength + 1)]) {
        let draws = 0;
        const result = prepare({ ...request, stakes: value }, { random: () => { draws++; return .4; } });
        assert.equal(result.kind, 'invalid');
        assert.equal(draws, 0);
    }
    assert.equal(prepare({ ...request, stakes: 'x'.repeat(ACTION_CHECK_REQUEST_FIELDS.stakes.maxLength) }).kind, 'candidate');
});

test('record reads preserve stakes exactly and reject malformed or unknown fields', () => {
    const candidate = prepare({ ...request, stakes });
    assert.equal(candidate.kind, 'candidate');
    const records = structuredClone(candidate.records);
    records.checks[0].request.stakes = ` ${stakes} `;
    assert.deepEqual(reload(records), records);
    for (const value of [null, '', ' ', 42, {}, 'x'.repeat(ACTION_CHECK_REQUEST_FIELDS.stakes.maxLength + 1)]) {
        const invalid = structuredClone(records);
        invalid.checks[0].request.stakes = value;
        assert.throws(() => parseDiceRecords(invalid), TypeError);
    }
    const invalid = structuredClone(records);
    invalid.checks[0].request.extra = 'not part of the record';
    assert.throws(() => parseDiceRecords(invalid), TypeError);
    for (const key of ['action', 'stat', 'difficulty']) {
        const missing = structuredClone(records);
        delete missing.checks[0].request[key];
        assert.throws(() => parseDiceRecords(missing), TypeError);
    }
});

test('D100 rerolls and persisted overrides keep the original stakes and fixed basis', () => {
    const candidate = prepare({ ...request, stakes });
    assert.equal(candidate.kind, 'candidate');
    const original = reload(candidate.records).checks[0];
    assert.equal(original.request.stakes, stakes);
    const rerolled = rerollCheck(original, () => .8);
    assert.deepEqual(rerolled.request, original.request);
    assert.equal(rerolled.result.threshold, original.result.threshold);
    const overridden = applyResultOverride(original, createResultOverride(rerolled, 'reroll-stakes'));
    assert.deepEqual(overridden, rerolled);
    assert.deepEqual(reload({ ...candidate.records, checks: [overridden] }).checks[0], overridden);
});

test('cards and continuation preserve model text as data, with no empty stakes section', () => {
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const { document } = parseHTML('<html><body></body></html>');
    Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
    try {
        const literal = '<img src=x onerror="alert(1)"> {{getvar::secret}}\n失败则惊动守卫。';
        for (const rule of ['coc7', 'd20']) {
            const candidate = prepare({ ...request, stakes: literal }, { rule });
            assert.equal(candidate.kind, 'candidate');
            const record = reload(candidate.records).checks[0];
            const card = createCheckCard(record, false);
            assert.equal(card.element.querySelector('.xb-dice-action').textContent, request.action);
            assert.equal(card.element.querySelector('.xb-dice-stakes-text')?.textContent, literal);
            assert.equal(card.element.querySelector('img'), null);
            const serialized = serializeActionCheckResults([record]);
            assert.equal(serialized.includes('{{'), false);
            assert.equal(JSON.parse(serialized)[0].stakes, literal);
            const without = prepare(request, { rule });
            assert.equal(createCheckCard(reload(without.records).checks[0], false).element.querySelector('.xb-dice-stakes'), null);
        }
    } finally {
        if (previous) { Object.defineProperty(globalThis, 'document', previous); }
        else { delete globalThis.document; }
    }
});
