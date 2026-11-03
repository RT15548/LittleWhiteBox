import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCoc7Request } from '../apps/dice/domain/coc7-request.ts';
import { COC7_CAPABILITIES, COC7_ATTRIBUTE_IDS, COC7_SKILL_IDS } from '../apps/dice/domain/coc7-catalog.ts';
import { parseCoc7Sheet, readCoc7Sheet, coc7StatValue, coc7RemainingPoints, coc7PointBudget, COC7_POINTS, COC7_POINT_GROUPS } from '../apps/dice/domain/coc7-sheet.ts';
import { emptyCoc7Draft, generateCoc7Sheet, adjustCoc7Stat, canAdjustCoc7Stat } from '../apps/dice/domain/coc7-creation.ts';
import { coc7Level, rollCoc7 } from '../apps/dice/domain/coc7.ts';
import { prepareActionCheck } from '../apps/dice/application/prepare-action-check.ts';
import { parseDiceRecords, MAX_ACTION_CHECKS } from '../apps/dice/domain/check-records.ts';
import { parseActionCheck } from '../apps/dice/protocol/request.ts';
import { COC7_EXAMPLE, coc7CapabilityProjection } from '../apps/dice/protocol/coc7-contract.ts';
import { buildActionCheckContinuation, buildActionCheckRules, projectActionCheckResults, serializeActionCheckResults } from '../apps/dice/protocol/prompt.ts';
import { readDicePromptResults } from './helpers/dice-prompt.js';

const skill = { action: 'Climb the wet wall', stat: 'athletics', difficulty: 'hard' };
const tagged = request => '<xb_action_check>' + JSON.stringify(request) + '</xb_action_check>';
const sequence = (...digits) => { let index = 0; return () => { assert.ok(index < digits.length); return (digits[index++] + 0.1) / 10; }; };
const sheet = () => parseCoc7Sheet({
    attributes: { body: 50, mind: 50, will: 50, appearance: 50 },
    skills: { ...Object.fromEntries(COC7_SKILL_IDS.map(id => [id, 40])), athletics: 60, melee: 20 },
});
const prepare = (request = skill, extra = {}) => prepareActionCheck({ body: tagged(request), rule: 'coc7', generatedFrom: 0, id: 'coc', coc7Sheet: sheet(), random: () => 0.3, ...extra });

test('random creation and persistence preserve separate budgets, bounds and capability coverage', () => {
    assert.equal(COC7_ATTRIBUTE_IDS.length, 4);
    assert.equal(COC7_SKILL_IDS.length, 12);
    for (const random of [() => 0, () => 0.5, () => 0.999999, Math.random]) {
        for (let i = 0; i < 20; i++) {
            const created = generateCoc7Sheet(random);
            for (const group of Object.keys(COC7_POINT_GROUPS)) {
                assert.equal(coc7RemainingPoints(created, group), 0);
                assert.deepEqual(Object.keys(created[group]), COC7_POINT_GROUPS[group].ids);
                assert.ok(Object.values(created[group]).every(n => n >= COC7_POINT_GROUPS[group].min && n <= COC7_POINTS.max && n % COC7_POINTS.step === 0));
            }
            const encoded = JSON.parse(JSON.stringify(created));
            const parsed = parseCoc7Sheet(encoded);
            assert.deepEqual(parsed, created);
            parsed.attributes.body = 999;
            parsed.skills.athletics = 999;
            assert.deepEqual(encoded, created, 'the persisted boundary returns detached data');
        }
    }
    for (const value of [1, -0.1, NaN, Infinity]) assert.throws(() => generateCoc7Sheet(() => value));
});

test('manual point allocation needs no randomization, cannot overspend and keeps pools independent', () => {
    const empty = emptyCoc7Draft();
    assert.equal(readCoc7Sheet(empty).kind, 'ready');
    assert.ok(Object.values(empty.attributes).every(n => n === 20));
    assert.ok(Object.values(empty.skills).every(n => n === 20));
    let draft = empty;
    for (const [ids, target] of [[COC7_ATTRIBUTE_IDS, 50], [COC7_SKILL_IDS, 40]]) {
        for (const id of ids) while (coc7StatValue(draft, id) < target) draft = adjustCoc7Stat(draft, id, 1);
    }
    assert.deepEqual(parseCoc7Sheet(draft), draft);
    assert.equal(canAdjustCoc7Stat(draft, 'body', 1), false);
    draft = adjustCoc7Stat(draft, 'athletics', -1);
    assert.equal(canAdjustCoc7Stat(draft, 'body', 1), false, 'skill points cannot pay for attributes');
    assert.equal(canAdjustCoc7Stat(draft, 'concealment', 1), true);
    draft = adjustCoc7Stat(draft, 'concealment', 1);
    assert.equal(readCoc7Sheet(draft).kind, 'ready');
    assert.equal(coc7StatValue(draft, 'concealment'), 45);
    assert.throws(() => adjustCoc7Stat(empty, 'body', -1));
    assert.throws(() => adjustCoc7Stat(empty, 'intimacy', -1));
    let strong = empty;
    while (canAdjustCoc7Stat(strong, 'body', 1)) strong = adjustCoc7Stat(strong, 'body', 1);
    assert.equal(strong.attributes.body, COC7_POINTS.max);
    while (canAdjustCoc7Stat(strong, 'will', 1)) strong = adjustCoc7Stat(strong, 'will', 1);
    assert.equal(strong.attributes.will, 80);
    assert.equal(canAdjustCoc7Stat(strong, 'appearance', 1), false);
    assert.throws(() => adjustCoc7Stat(strong, 'body', 1));
    assert.throws(() => adjustCoc7Stat(empty, 'unknown', 1));
    assert.throws(() => adjustCoc7Stat(empty, 'body', 2));
    assert.equal(empty.attributes.body, 20, 'draft edits are immutable');
});

test('unspent points persist and execute checks, including the skill minimum at extreme difficulty', () => {
    const draft = adjustCoc7Stat(emptyCoc7Draft(), 'mind', 1);
    const saved = parseCoc7Sheet(JSON.parse(JSON.stringify(draft)));
    assert.deepEqual(saved, draft);
    assert.equal(coc7RemainingPoints(saved, 'attributes'), 115);
    assert.equal(coc7RemainingPoints(saved, 'skills'), 240);
    for (const [units, level, verdict] of [[1, 'critical', 'achieved'], [4, 'extreme', 'achieved'], [5, 'hard', 'not_achieved']]) {
        const candidate = prepare({ ...skill, stat: 'intimacy', difficulty: 'extreme' }, { coc7Sheet: saved, random: sequence(units, 0) });
        assert.equal(candidate.kind, 'candidate');
        const result = candidate.records.checks[0].result;
        assert.deepEqual([result.value, result.threshold, result.level, result.verdict], [20, 4, level, verdict]);
    }
});

test('attributes and skills are independent values with no derived bonus or resource fields', () => {
    const before = sheet();
    const after = parseCoc7Sheet({ ...before, attributes: { ...before.attributes, body: 80, will: 20 } });
    for (const id of COC7_SKILL_IDS) assert.equal(coc7StatValue(after, id), coc7StatValue(before, id));
    assert.equal(coc7StatValue(after, 'body'), 80);
    assert.equal(coc7StatValue(after, 'will'), 20);
    assert.deepEqual(Object.keys(after).sort(), ['attributes', 'skills']);
});

test('invalid points, pools and shapes are rejected without changing their input', () => {
    const valid = sheet();
    const missing = structuredClone(valid); delete missing.skills.concealment;
    const invalidSheets = [{}, missing, { ...valid, luck: 50 }, { ...valid, extra: 1 },
        ...[100, 10, 49, '50', NaN, Infinity].map(body => ({ ...valid, attributes: { ...valid.attributes, body } })),
        { ...valid, attributes: { ...valid.attributes, body: 55 } },
        { ...valid, attributes: { ...valid.attributes, body: 45 }, skills: { ...valid.skills, athletics: 65 } },
        ...[5, 10, 11, 15, 85].map(intimacy => ({ ...valid, skills: { ...valid.skills, intimacy } })),
        { ...valid, skills: { ...valid.skills, athletics: 65 } },
        { ...valid, skills: Object.fromEntries(COC7_SKILL_IDS.map(id => [id, 80])) }];
    for (const invalid of invalidSheets) {
        const original = structuredClone(invalid);
        assert.throws(() => parseCoc7Sheet(invalid));
        assert.equal(readCoc7Sheet(invalid).kind, 'invalid');
        assert.deepEqual(invalid, original);
    }
    assert.equal(coc7PointBudget('attributes'), 200);
    assert.equal(coc7PointBudget('skills'), 480);
});

test('single-check thresholds, degree and achievement remain distinct; stored facts are not rejudged', () => {
    const run = (value, difficulty, ...digits) => rollCoc7(value, difficulty, sequence(...digits));
    assert.deepEqual([run(65, 'hard', 7, 2).threshold, run(65, 'hard', 7, 2).level], [32, 'hard']);
    const missed = run(65, 'hard', 3, 4);
    assert.deepEqual([missed.level, missed.verdict], ['regular', 'not_achieved']);
    assert.equal(run(65, 'extreme', 3, 1).threshold, 13);
    assert.equal(run(150, 'regular', 5, 9).threshold, 150);
    for (const threshold of [49, 50]) for (const roll of [1, 95, 96, 99, 100]) {
        assert.equal(coc7Level(120, threshold, roll), roll === 1 ? 'critical' : roll === 100 || threshold < 50 && roll >= 96 ? 'fumble' : 'regular');
    }
    assert.equal(run(1, 'extreme', 1, 0).verdict, 'achieved');
    const faces = new Set();
    for (let units = 0; units < 10; units++) for (let tens = 0; tens < 10; tens++) faces.add(run(65, 'regular', units, tens).roll);
    assert.equal(faces.size, 100);
    assert.ok(faces.has(100)); assert.ok(!faces.has(0));
    const prepared = prepare();
    const historical = JSON.parse(JSON.stringify(prepared.records));
    historical.checks[0].result.verdict = 'achieved';
    assert.deepEqual(parseDiceRecords(historical), historical);
});

test('easy checks raise the ceiling up to 95 without changing other success degrees or special rolls', () => {
    for (const [value, roll, threshold, level, verdict] of [
        [20, 21, 40, 'easy', 'achieved'], [40, 50, 60, 'easy', 'achieved'],
        [40, 61, 60, 'failure', 'not_achieved'], [80, 95, 95, 'easy', 'achieved'],
        [80, 96, 95, 'failure', 'not_achieved'], [80, 100, 95, 'fumble', 'not_achieved'],
        [80, 1, 95, 'critical', 'achieved'],
    ]) {
        const result = rollCoc7(value, 'easy', sequence(roll % 10, Math.floor(roll / 10) % 10));
        assert.deepEqual([result.threshold, result.level, result.verdict], [threshold, level, verdict]);
    }
    const request = { ...skill, difficulty: 'easy' };
    assert.deepEqual(parseCoc7Request(request), request);
    const candidate = prepare(request, { coc7Sheet: emptyCoc7Draft(), random: sequence(1, 2) });
    assert.equal(candidate.kind, 'candidate');
    assert.deepEqual([candidate.records.checks[0].result.value, candidate.records.checks[0].result.threshold], [20, 40]);
    assert.deepEqual(parseDiceRecords(JSON.parse(JSON.stringify(candidate.records))), candidate.records);
    const untrained = prepare({ ...request, stat: '火系魔法' }, { random: sequence(0, 5) }).records.checks[0];
    assert.deepEqual([untrained.result.value, untrained.result.threshold, untrained.result.level, untrained.result.verdict],
        [40, 60, 'easy', 'achieved']);
});

test('malformed requests and unavailable sheets are rejected before sampling', () => {
    const invalid = [
        ...[undefined, null, 40, {}, [], '', '   ', 'x'.repeat(121)].map(stat => ({ ...skill, stat })),
        { ...skill, difficulty: 'ordinary' }, { ...skill, difficulty: undefined }, { ...skill, action: '' }];
    for (const request of invalid) {
        assert.equal(prepare(request, { random: () => assert.fail('invalid request sampled') }).kind, 'invalid');
    }
    for (const coc7Sheet of [null, {}, { ...sheet(), attributes: { ...sheet().attributes, body: '50' } }]) {
        assert.equal(prepare(skill, { coc7Sheet, random: () => assert.fail('missing or invalid sheet sampled') }).kind, 'invalid');
    }
    assert.deepEqual(parseCoc7Request(skill), skill);
    assert.equal(parseActionCheck(tagged({ ...skill, difficulty: 'regular' })).kind, 'invalid');
    const prepared = prepare();
    assert.equal(prepared.records.checks[0].result.value, 60);
    assert.deepEqual(parseDiceRecords(prepared.records), prepared.records);
});

test('D100 ignores model extras but still rejects malformed required fields without rolling', () => {
    const extra = { ...skill, character: 'Mira', stakes: { arbitrary: true }, value: 99, kind: 'skill', opponent: {},
        bonus: 2, penalty: 1, roll: 1, result: { verdict: 'achieved' } };
    const original = structuredClone(extra);
    const parsed = parseActionCheck(tagged(extra), 0, 'coc7');
    assert.equal(parsed.kind, 'request');
    assert.deepEqual(parsed.request, skill);
    const candidate = prepare(extra);
    assert.deepEqual(candidate, prepare(skill), 'extras affect neither the sheet lookup nor the recorded outcome');
    assert.deepEqual(extra, original);
    const missing = { ...extra }; delete missing.stat;
    for (const invalid of [missing, { ...extra, stat: {} }, { ...extra, difficulty: 'unknown' }, { ...extra, action: null }]) {
        const before = structuredClone(invalid);
        assert.equal(prepare(invalid, { random: () => assert.fail('bad known fields must not roll') }).kind, 'invalid');
        assert.deepEqual(invalid, before);
    }
    const damaged = structuredClone(candidate.records);
    damaged.checks[0].request.character = extra.character;
    assert.throws(() => parseDiceRecords(damaged), 'stored result requests still have a closed shape');
});

test('D100 resolves IDs, names, use terms and unique contained terms from the same catalog', () => {
    const low = emptyCoc7Draft();
    for (const [id, capability] of Object.entries(COC7_CAPABILITIES)) {
        for (const stat of [id, capability.label, ...capability.uses]) {
            const candidate = prepare({ ...skill, stat }, { coc7Sheet: low });
            assert.equal(candidate.kind, 'candidate', stat);
            const record = candidate.records.checks[0];
            assert.equal(record.request.stat, capability.label);
            assert.equal(record.result.value, coc7StatValue(low, id), 'a matched low skill must never be raised to the untrained value');
            assert.deepEqual(record.resolution, stat === id || stat === capability.label ? undefined : { kind: 'mapped', input: stat });
        }
    }
    for (const [stat, id] of [
        ['  「隐匿」  ', 'concealment'], ['（隐匿）', 'concealment'], ['【隐匿(潜行)】', 'concealment'],
        ['ＡＴＨＬＥＴＩＣＳ', 'athletics'], ['Athletics', 'athletics'], ['隐匿潜行', 'concealment'],
        ['潜行检定', 'concealment'], ['锁具维修', 'mechanics'], ['社交察言观色', 'social'],
    ]) {
        const record = prepare({ ...skill, stat }).records.checks[0];
        assert.equal(record.request.stat, COC7_CAPABILITIES[id].label);
        assert.equal(record.result.value, coc7StatValue(sheet(), id));
        assert.deepEqual(record.resolution, { kind: 'mapped', input: stat.trim() });
    }
});

test('unknown and ambiguous stats use one fixed basis and the ordinary percentile path', () => {
    for (const [stat, reason] of [
        ['火系魔法', 'unknown'], ['hpMax', 'unknown'], ['__proto__', 'unknown'], ['()', 'unknown'],
        ['运动与隐匿', 'ambiguous'], ['潜行和闪避', 'ambiguous'], ['隐匿与运动', 'ambiguous'],
    ]) {
        for (const [difficulty, threshold] of [['regular', 40], ['hard', 20], ['extreme', 8]]) {
            const request = { ...skill, stat, difficulty, value: 99 };
            const candidate = prepare(request, { random: sequence(8, 0) });
            assert.equal(candidate.kind, 'candidate');
            const record = candidate.records.checks[0];
            assert.deepEqual(record.result, rollCoc7(40, difficulty, sequence(8, 0)));
            assert.equal(record.result.threshold, threshold);
            assert.equal(record.request.stat, stat);
            assert.deepEqual(record.resolution, { kind: 'untrained', reason });
        }
    }
    for (const difficulty of ['regular', 'hard', 'extreme']) {
        for (const roll of [1, 8, 9, 20, 21, 40, 41, 96, 100]) {
            const record = prepare({ ...skill, stat: '火系魔法', difficulty }, { random: sequence(roll % 10, Math.floor(roll / 10) % 10) }).records.checks[0];
            assert.deepEqual(record.result, rollCoc7(40, difficulty, sequence(roll % 10, Math.floor(roll / 10) % 10)));
        }
    }
    for (const coc7Sheet of [null, {}]) {
        assert.equal(prepare({ ...skill, stat: '火系魔法' }, { coc7Sheet, random: () => assert.fail('unavailable sheet must not roll') }).kind, 'invalid');
    }
});

test('resolution history round-trips and projects without reinterpreting names or values', () => {
    for (const stat of ['潜行', '隐匿潜行', '火系魔法', '运动与隐匿', '{{setvar::secret::value}}', '{{setvar::secret::隐匿}}']) {
        const candidate = prepare({ ...skill, stat });
        const encoded = JSON.stringify(candidate.records);
        const history = JSON.parse(encoded);
        assert.deepEqual(parseDiceRecords(history), candidate.records);
        const projected = projectActionCheckResults(history.checks)[0];
        assert.deepEqual(projected.resolution, history.checks[0].resolution);
        assert.deepEqual(JSON.parse(serializeActionCheckResults(history.checks))[0], projected);
        // External SillyTavern macro syntax must be neutralized in all model data.
        assert.equal(serializeActionCheckResults(history.checks).includes('{{'), false);
        history.checks[0].request.stat = 'Historical capability';
        history.checks[0].result.value = 31;
        assert.deepEqual(parseDiceRecords(history), history, 'history is not looked up or adjudicated again');
        const parsed = parseDiceRecords(JSON.parse(encoded));
        parsed.checks[0].resolution.kind = 'changed';
        assert.equal(JSON.stringify(candidate.records), encoded, 'returned metadata does not alias saved data');
    }
    for (const resolution of [null, {}, { kind: 'mapped', input: '' }, { kind: 'mapped', input: 'x'.repeat(121) },
        { kind: 'mapped', input: '潜行', value: 99 }, { kind: 'untrained', reason: 'anything' }, { kind: 'untrained', reason: 'unknown', extra: true }]) {
        const history = structuredClone(prepare().records);
        history.checks[0].resolution = resolution;
        assert.throws(() => parseDiceRecords(history), 'stored metadata remains a closed, validated shape');
    }
});

test('model capabilities include both independent attributes and skills, never values; the injected example really executes', () => {
    const capabilities = coc7CapabilityProjection();
    assert.deepEqual(capabilities.map(item => item.id), Object.keys(COC7_CAPABILITIES));
    for (const item of capabilities) {
        // Check the model-facing data boundary, not human-readable descriptions or menu layout.
        assert.deepEqual(Object.keys(item).sort(), ['id', 'name', 'use']);
        assert.ok(Object.values(item).every(value => typeof value === 'string' && value.length > 0));
        const prepared = prepare({ ...skill, stat: item.id });
        assert.equal(prepared.kind, 'candidate');
        assert.equal(prepared.records.checks[0].result.value, coc7StatValue(sheet(), item.id));
    }
    const prompt = buildActionCheckRules('standard', 'coc7', true);
    assert.ok(prompt.length > 0);
    assert.equal(prepareActionCheck({ body: COC7_EXAMPLE, rule: 'coc7', coc7Sheet: sheet(), generatedFrom: 0, id: 'example' }).kind, 'candidate');
    assert.equal(buildActionCheckRules('standard', 'coc7', false), '');
    assert.equal(buildActionCheckRules('active', 'coc7', true), prompt, 'D20 frequency never changes CoC instructions');
    const prepared = prepare();
    const recovery = buildActionCheckContinuation(prepared.body, prepared.records.checks, false);
    assert.deepEqual(readDicePromptResults(recovery), projectActionCheckResults(prepared.records.checks));
    const { level, verdict } = readDicePromptResults(recovery)[0].result;
    assert.deepEqual({ level, verdict }, { level: 'regular', verdict: 'not_achieved' });
    assert.equal(parseActionCheck(recovery, 0, 'coc7').kind, 'none');
});

test('mixed history shares its existing limit; result serialization preserves data and neutralizes host macros', () => {
    let records;
    for (let index = 0; index < MAX_ACTION_CHECKS; index++) {
        const rule = index % 2 ? 'coc7' : 'd20';
        const request = rule === 'coc7' ? skill : { action: 'Climb', stat: 'Agility', difficulty: 'hard' };
        const prepared = prepare(request, { rule, records, id: 'mixed-' + index });
        assert.equal(prepared.kind, 'candidate'); records = prepared.records;
    }
    assert.deepEqual(prepare(skill, { records, random: () => assert.fail('limit sampled') }), { kind: 'invalid', error: 'dice_check_limit' });
    const body = records.checks.map(record => `[dice:${record.id}]`).join('\n');
    for (const rule of ['d20', 'coc7']) {
        const prompt = buildActionCheckContinuation(body, records.checks, true);
        assert.deepEqual(readDicePromptResults(prompt), projectActionCheckResults(records.checks));
        assert.equal(parseActionCheck(prompt, 0, rule).kind, 'none', 'exhausted replies offer no executable request example');
    }
    const prepared = prepare({ ...skill, action: 'Say "{{setvar::secret::value}}" and {{char}}' });
    const encoded = serializeActionCheckResults(prepared.records.checks);
    assert.deepEqual(JSON.parse(encoded), projectActionCheckResults(prepared.records.checks));
    // External SillyTavern macro syntax is a security boundary, not prose wording.
    assert.equal(encoded.includes('{{'), false);
});
