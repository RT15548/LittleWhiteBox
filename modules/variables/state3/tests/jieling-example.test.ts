import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { EventEmitter } from 'node:events';
import { parseHTML } from 'linkedom';
import { compileDefinition } from '../definition/compile.js';
import { initialize, settle } from '../engine/settle.js';
import { accepted } from './fixture.js';
import { variableBundleFromFiles } from '../definition/card-files.js';
import { createGuideFixture } from './guide-fixture.js';
import type { Bundle } from '../types.js';
import { parseItemDocument } from '../../../card-workspace/item-document.js';

// The example is a CardFiles workspace copy; it must install through the same projection.
const folder = fileURLToPath(new URL('../skill/references/examples/jieling/', import.meta.url));
const walk = (dir: string): string[] => readdirSync(dir).flatMap(name => statSync(join(dir, name)).isDirectory() ? walk(join(dir, name)) : [join(dir, name)]);
const files = walk(folder).map(path => ({ path: 'card/' + relative(folder, path).split(sep).join('/'), content: readFileSync(path, 'utf8') }));
const file = (path: string) => files.find(item => item.path === 'card/' + path)!.content;
const bundle: Bundle = variableBundleFromFiles('card/', files);

type Member = { age: number; job: string; kink: string; control: number; status: string; room: string; note: string; wants: string; is: string[]; hates: string[] };
type Club = { week: number; funds: number; reputation: number; exposure: number; waiting: number; phase: string;
    members: Record<string, Member>; incidents: { week: number; open: boolean; who: string[]; kind: string; summary: string }[];
    rooms: Record<string, { members: string[]; open: boolean; pairs: { a: string; b: string; relation: string }[] }>;
    lastWeek: null | { week: number; rooms: Record<string, string>; roomMembers: Record<string, string[]>; gains: Record<string, number>; graduated: string[]; quit: string[]; incidents: unknown[]; income: number; rent: number };
    flags: { firstGraduate: boolean } };

async function center(dice: () => number, setup?: (club: Club) => void) {
    const current = structuredClone(bundle);
    setup?.((current.definition.initial as { club: Club }).club);
    const fixture = await createGuideFixture(current, { authorize: async () => {}, context: () => ({}), passage: () => '' });
    const source = parseItemDocument('regex', file('regex/解铃会：最新一楼.md')).body.replace(/^```html\n|```\n?$/g, '');
    const { document } = parseHTML(source), lifecycle = new EventEmitter(), timers = new Map<number, () => void>();
    runInNewContext(document.querySelector('script')!.textContent!, {
        document,
        window: { parent: fixture.host, setInterval: (callback: () => void) => { timers.set(1, callback); return 1; },
            clearInterval: (id: number) => timers.delete(id), addEventListener: (event: string, callback: () => void) => lifecycle.once(event, callback) },
    });
    const element = (id: string) => document.getElementById(id) as HTMLElement & { disabled: boolean; value: string };
    const settled = async () => { for (let turn = 0; turn < 400 && element('feedback').getAttribute('aria-busy') === 'true'; turn++) {await new Promise<void>(resolve => setImmediate(resolve));} };
    // prepare rolls Math.random once per die; the sequence below is the week's dice in order.
    const random = () => (dice() - 1) / 6;
    return { ...fixture, element, random, club: () => (fixture.state() as { club: Club }).club,
        tick: () => timers.get(1)?.(), close: () => lifecycle.emit('pagehide'),
        async click(target: string | Element) { (typeof target === 'string' ? element(target) : target as HTMLElement).click(); await settled(); },
        // The player picks a member's seat, then the room it should move to.
        async assign(member: string, room: string) {
            (document.querySelector(`[data-pick="${member}"]`) as HTMLElement).click();
            await this.click(document.querySelector(`[data-to="${room}"]`)!);
        },
        // The update model's after-stage submission, settled as the updater would.
        model: (input: unknown) => fixture.service.apply(input, { stage: 'after', source: 'model:after' }),
        incidentButtons: () => [...document.querySelectorAll('#incident-list [data-act]')] as HTMLElement[] };
}

// Public openings always go through center unchanged. These synthetic members belong
// only to progressed-club gameplay tests; they are not part of the published card.
function progressedCenter(dice: () => number, setup?: (club: Club) => void) {
    return center(dice, club => {
        club.members = {
            '周秀兰': { age: 52, job: '会计', kink: '年下', wants: '年下', is: ['年上', '温柔'], hates: ['粗暴'], control: 35, status: '在读', room: '一号室', note: '' },
            '林一舟': { age: 21, job: '学生', kink: '年上', wants: '年上', is: ['年下'], hates: [], control: 40, status: '在读', room: '一号室', note: '' },
            '陈默': { age: 34, job: '程序员', kink: '被支配', wants: '支配', is: ['被支配'], hates: ['露出'], control: 30, status: '在读', room: '二号室', note: '' },
            '苏曼': { age: 29, job: '教练', kink: '支配', wants: '被支配', is: ['支配', '露出'], hates: [], control: 45, status: '在读', room: '二号室', note: '' },
            '赵建国': { age: 47, job: '司机', kink: '窥视', wants: '露出', is: ['窥视'], hates: ['制服'], control: 50, status: '在读', room: '二号室', note: '' },
            '何小满': { age: 24, job: '骑手', kink: '足', wants: '足', is: ['年下'], hates: [], control: 25, status: '在读', room: '', note: '' },
        };
        setup?.(club);
    });
}

const admit = (name: string) => ({ action: 'admit', params: { name, age: 30, job: '职员', kink: '制服', wants: '制服', is: ['温柔'], hates: [], control: 40, note: '' } });

test('解铃会 installs from its CardFiles layout; every worldbook entry can enter a prompt', () => {
    const compiled = compileDefinition(bundle);
    assert.deepEqual(Object.keys(bundle.functions).sort(), Object.keys(compiled.bundle.definition.functions).sort());
    assert.deepEqual(Object.keys(bundle.scripts!), ['prepare']);
    assert.equal(JSON.parse(file('card.json')).world, '解铃会');
    for (const item of files.filter(entry => entry.path.startsWith('card/world_book/解铃会/'))) {
        const { settings } = parseItemDocument('world', item.content);
        assert.ok(settings.constant || settings.key.length, item.path);
    }
    for (const item of files.filter(entry => entry.path.startsWith('card/regex/'))) {parseItemDocument('regex', item.content);}
});

test('both public openings start with no members, incidents or occupied rooms', async () => {
    const compiled = compileDefinition(bundle);
    for (const [opening, funds, exposure] of [[0, 6000, 0], [1, 2400, 10]]) {
        const { club } = accepted(await initialize(compiled, { opening })).state as { club: Club };
        assert.equal(club.funds, funds);
        assert.equal(club.exposure, exposure);
        assert.equal(club.waiting, 2);
        assert.equal(club.week, 1);
        assert.equal(club.phase, '运营中');
        assert.equal(club.lastWeek, null);
        assert.deepEqual(club.members, {});
        assert.deepEqual(club.incidents, []);
        assert.deepEqual(club.rooms, Object.fromEntries(['一号室', '二号室', '三号室'].map(room => [room, { members: [], open: false, pairs: [] }])));
    }
});

test('an empty week in either public opening pays rent without invented sessions, members or incidents', async () => {
    const compiled = compileDefinition(bundle);
    for (const opening of [0, 1]) {
        const start = accepted(await initialize(compiled, { opening })).state;
        const before = (start as { club: Club }).club;
        const { club } = accepted(await settle(compiled, start, [{ action: 'endweek', params: {} }], { stage: 'before', prepared: { dice: [6] } })).state as { club: Club };
        assert.equal(club.week, 2);
        assert.equal(club.funds, before.funds - 2000);
        assert.equal(club.reputation, before.reputation);
        assert.equal(club.exposure, Math.max(0, before.exposure - 5));
        assert.equal(club.waiting, 1 + Math.floor(club.reputation / 25));
        assert.deepEqual(club.members, {});
        assert.deepEqual(club.incidents, []);
        assert.deepEqual(club.rooms, before.rooms);
        assert.deepEqual(club.lastWeek, {
            week: 1, rooms: { '一号室': '空', '二号室': '空', '三号室': '空' },
            roomMembers: { '一号室': [], '二号室': [], '三号室': [] },
            gains: {}, graduated: [], quit: [], incidents: [], income: 0, rent: 2000,
        });
    }
});

test('a public empty club forms a room only from dynamically admitted members', async t => {
    const p = await center(() => 6);
    t.mock.method(Math, 'random', p.random);
    try {
        assert.deepEqual(p.club().members, {});
        assert.equal(p.element('pool').querySelectorAll('[data-pick]').length, 0, 'an empty club has no selectable members');
        assert.equal((await p.model([admit('应试甲'), admit('应试乙')])).ok, true);
        assert.equal(p.club().waiting, 0);
        assert.equal(p.club().funds, 7000);
        assert.deepEqual(p.club().rooms['一号室'].members, []);
        p.tick();
        assert.equal(p.element('pool').querySelectorAll('[data-pick]').length, 2, 'admissions become selectable without reloading the panel');
        await p.assign('应试甲', '一号室');
        await p.assign('应试乙', '一号室');
        assert.deepEqual(p.club().rooms['一号室'].members, ['应试甲', '应试乙']);
        assert.equal(p.club().rooms['一号室'].open, false);

        await p.click('endweek');
        assert.equal(p.club().lastWeek!.income, 0, 'two members cannot hold a session');
        assert.equal((await p.model([admit('应试丙')])).ok, true);
        p.tick();
        await p.assign('应试丙', '一号室');
        assert.deepEqual(p.club().rooms['一号室'].members, ['应试甲', '应试乙', '应试丙']);
        assert.equal(p.club().rooms['一号室'].open, true);
        const before = p.club();
        await p.click('endweek');
        assert.equal(p.club().lastWeek!.income, 3 * 300);
        assert.equal(p.club().funds, before.funds + 900 - 2000);
        assert.deepEqual(p.club().lastWeek!.roomMembers['一号室'], ['应试甲', '应试乙', '应试丙']);
    } finally { p.close(); }
});

test('the lower-fund public opening can fund its first two weeks through real admissions and sessions', async () => {
    const compiled = compileDefinition(bundle);
    let state = accepted(await initialize(compiled, { opening: 1 })).state;
    const apply = async (input: unknown, stage: 'before' | 'after') => {
        state = accepted(await settle(compiled, state, input, { stage, prepared: { dice: [6] } })).state;
        return (state as { club: Club }).club;
    };
    const admitted = await apply([admit('应试甲'), admit('应试乙')], 'after');
    assert.equal(admitted.funds, 3400);
    assert.equal(admitted.waiting, 0);
    const firstWeek = await apply([
        { action: 'assign', params: { member: '应试甲', room: '一号室' } },
        { action: 'assign', params: { member: '应试乙', room: '一号室' } },
        { action: 'endweek', params: {} },
    ], 'before');
    assert.equal(firstWeek.lastWeek!.income, 0, 'the first intake cannot fill a room');
    assert.equal(firstWeek.funds, 1400);
    assert.equal(firstWeek.exposure, 5);
    assert.equal(firstWeek.phase, '运营中');
    assert.equal(firstWeek.waiting, 2);

    await apply([admit('应试丙')], 'after');
    const ready = await apply([{ action: 'assign', params: { member: '应试丙', room: '一号室' } }], 'before');
    assert.equal(ready.rooms['一号室'].open, true);
    const secondWeek = await apply([{ action: 'endweek', params: {} }], 'before');
    assert.equal(secondWeek.week, 3);
    assert.equal(secondWeek.lastWeek!.income, 900);
    assert.equal(secondWeek.funds, 800);
    assert.equal(secondWeek.exposure, 0);
    assert.equal(secondWeek.phase, '运营中');
    assert.deepEqual(Object.keys(secondWeek.members), ['应试甲', '应试乙', '应试丙']);
    assert.deepEqual(secondWeek.incidents, []);
});

// The matching rule is the game: who is in a room decides whether it meets and how pairs relate.
test('rooms follow members: a room needs three, and pairs relate by what each wants, is and hates', async () => {
    const p = await progressedCenter(() => 6);
    try {
        const { rooms } = p.club();
        assert.deepEqual(rooms['一号室'].members, ['周秀兰', '林一舟']);
        assert.equal(rooms['一号室'].open, false);
        assert.equal(rooms['一号室'].pairs[0].relation, '相融', 'an older woman drawn to young men and a young man drawn to older women');
        assert.equal(rooms['二号室'].open, true);
        assert.equal(rooms['二号室'].pairs.find(pair => pair.a === '陈默' && pair.b === '苏曼')!.relation, '冲突', 'he cannot bear her exhibitionism');

        await p.assign('何小满', '一号室');
        assert.equal(p.club().members['何小满'].room, '一号室');
        assert.equal(p.club().rooms['一号室'].open, true, 'the third member opens the room');
        assert.equal(p.element('feedback').className, 'good');
    } finally { p.close(); }
});

test('a week settles sessions, rent and standing once; refusals change nothing and say why', async t => {
    const p = await progressedCenter(() => 6);
    t.mock.method(Math, 'random', p.random);
    try {
        await p.assign('何小满', '一号室');
        const before = p.club();
        await p.click('endweek');
        const after = p.club(), week = after.lastWeek!;
        assert.equal(after.week, 2);
        assert.equal(week.income, 6 * 300, 'two full rooms of three');
        assert.equal(after.funds, before.funds + week.income - week.rent);
        assert.equal(week.gains['周秀兰'], 1 + 4 + 1, 'base, complementary partner, neutral partner');
        assert.equal(week.gains['陈默'], 1 + 8 + 1, 'a high die turns conflict into a breakthrough');
        assert.equal(after.members['陈默'].control, before.members['陈默'].control + 10);
        assert.equal(after.waiting, 1 + Math.floor(after.reputation / 25));

        // Room full: a fourth member fits, a fifth is refused with the reason, and nothing changes.
        await p.model([{ action: 'admit', params: { name: '韩露', age: 31, job: '护士', kink: '迷恋制服。', wants: '制服', is: ['温柔'], hates: [], control: 40, note: '说话很轻。' } }]);
        await p.model([{ action: 'admit', params: { name: '吴桐', age: 27, job: '设计师', kink: '需要被支配。', wants: '支配', is: ['被支配'], hates: [], control: 30, note: '迟到了。' } }]);
        p.tick();
        await p.assign('韩露', '一号室');
        const full = p.club(), calls = p.controls.applyCalls;
        await p.assign('吴桐', '一号室');
        assert.equal(p.controls.applyCalls, calls + 1);
        assert.deepEqual(p.club(), full, 'a refused action changes nothing');
        assert.equal(p.element('feedback').className, 'bad');
        assert.equal(JSON.parse(p.element('diagnostic').textContent!)[0].action, 'assign');
    } finally { p.close(); }
});

test('weekly exposure counts existing and new incidents, and eases only with none open', async t => {
    for (const sample of [
        { existing: false, die: 1, added: 1, exposure: 25 },
        { existing: true, die: 6, added: 0, exposure: 30 },
        { existing: true, die: 1, added: 1, exposure: 35 },
        { existing: false, die: 6, added: 0, exposure: 15 },
    ]) {
        await t.test(`existing=${sample.existing}, die=${sample.die}`, async turn => {
            const p = await progressedCenter(() => sample.die, club => {
                club.exposure = 20;
                if (sample.existing) {club.incidents.push({ week: 1, who: ['苏曼'], kind: '外泄', summary: '工作单位知道了。', open: true });}
            });
            turn.mock.method(Math, 'random', p.random);
            try {
                await p.click('endweek');
                assert.equal(p.club().lastWeek!.incidents.length, sample.added);
                assert.equal(p.club().exposure, sample.exposure);
            } finally { p.close(); }
        });
    }
});

test('weekly control changes are the actual bounded differences, including graduation', async t => {
    await t.test('a slip at zero cannot report a loss that did not happen', async turn => {
        const p = await progressedCenter(() => 1, club => { club.members['陈默'].control = 0; });
        turn.mock.method(Math, 'random', p.random);
        try {
            await p.click('endweek');
            assert.equal(p.club().members['陈默'].control, 0);
            assert.equal(p.club().lastWeek!.gains['陈默'], 0);
        } finally { p.close(); }
    });
    await t.test('four conflicting members cap their breakthroughs at one hundred', async turn => {
        const p = await progressedCenter(() => 6, club => {
            for (const member of Object.values(club.members)) {
                member.control = 79;
                member.is = ['粗暴'];
                member.hates = ['粗暴'];
            }
        });
        turn.mock.method(Math, 'random', p.random);
        try {
            await p.assign('何小满', '二号室');
            const before = p.club();
            await p.click('endweek');
            const after = p.club();
            for (const name of before.rooms['二号室'].members) {
                assert.equal(after.members[name].control, 100);
                assert.equal(after.lastWeek!.gains[name], after.members[name].control - before.members[name].control);
                assert.equal(after.members[name].status, '结业');
            }
        } finally { p.close(); }
    });
});

test('new interviews use the final weekly reputation and do not refill during admissions', async t => {
    const p = await progressedCenter(() => 6, club => {
        club.reputation = 39;
        club.members['林一舟'].control = 79;
    });
    t.mock.method(Math, 'random', p.random);
    try {
        await p.assign('何小满', '一号室');
        await p.click('endweek');
        assert.equal(p.club().flags.firstGraduate, true);
        assert.equal(p.club().reputation, 58);
        assert.equal(p.club().waiting, 3, 'the donation crosses the next interview threshold');
        assert.equal((await p.model([{ action: 'admit', params: { name: '韩露', age: 31, job: '护士', kink: '迷恋制服。', wants: '制服', is: ['温柔'], hates: [], control: 40, note: '说话很轻。' } }])).ok, true);
        assert.equal((await p.model([{ action: 'decline', params: {} }])).ok, true);
        assert.equal(p.club().waiting, 1);
        assert.equal((await p.model([{ action: 'note', params: { member: '陈默', note: '愿意下周继续来。' } }])).ok, true);
        assert.equal((await p.model([])).ok, true);
        assert.equal(p.club().waiting, 1, 'ordinary same-week settlements preserve used interviews');
        p.tick();
        await p.click('endweek');
        assert.equal(p.club().waiting, 1 + Math.floor(p.club().reputation / 25));
    } finally { p.close(); }
});

test('two weekly actions in one before batch match separate weeks, including an immediate graduation rescue', async t => {
    for (const sample of [
        { name: 'ordinary weeks', graduate: false, funds: 6000 },
        { name: 'first graduation saves the next weekly action', graduate: true, funds: 50 },
    ]) {
        await t.test(sample.name, async turn => {
            const opening = (club: Club) => {
                club.funds = sample.funds;
                if (sample.graduate) {
                    club.reputation = 39;
                    club.members['林一舟'].control = 79;
                }
            };
            const batched = await progressedCenter(() => 6, opening), separate = await progressedCenter(() => 6, opening);
            turn.mock.method(Math, 'random', batched.random);
            try {
                await batched.assign('何小满', '一号室');
                await separate.assign('何小满', '一号室');
                const end = { action: 'endweek', params: {} };
                const result = await batched.service.apply([end, end], { stage: 'before' });
                assert.equal(result.ok, true);
                assert.equal((await separate.service.apply([end], { stage: 'before' })).ok, true);
                assert.equal((await separate.service.apply([end], { stage: 'before' })).ok, true);
                assert.deepEqual(batched.club(), separate.club());
                assert.equal(batched.club().week, 3);
                assert.equal(batched.club().flags.firstGraduate, sample.graduate);
                if (sample.graduate) {assert.equal(batched.club().funds, 750);}
            } finally { batched.close(); separate.close(); }
        });
    }
});

test('the settled room roster survives graduation and later room assignments', async t => {
    const p = await progressedCenter(() => 6, club => { club.members['林一舟'].control = 79; });
    t.mock.method(Math, 'random', p.random);
    try {
        await p.assign('何小满', '一号室');
        const roster = Object.fromEntries(Object.entries(p.club().rooms).map(([room, info]) => [room, info.members]));
        await p.click('endweek');
        assert.equal(p.club().members['林一舟'].status, '结业');
        assert.equal(p.club().members['林一舟'].room, '');
        assert.deepEqual(p.club().lastWeek!.roomMembers, roster);
        await p.assign('何小满', '二号室');
        assert.deepEqual(p.club().lastWeek!.roomMembers, roster, 'moving a member does not rewrite the settled week');
        assert.notDeepEqual(p.club().rooms['一号室'].members, roster['一号室']);
    } finally { p.close(); }
});

test('the update model records new members: interviews and fees are consumed once, and writes are bounded', async () => {
    const p = await center(() => 6);
    try {
        const start = p.club();
        assert.deepEqual(start.members, {});
        const admitted = await p.model([{ action: 'admit', params: { name: '韩露', age: 31, job: '护士', kink: '迷恋制服，在医院更衣室被同事撞见过。', wants: '制服', is: ['温柔'], hates: ['粗暴'], control: 40, note: '说话很轻。' } }]);
        assert.equal(admitted.ok, true);
        assert.equal(p.club().waiting, start.waiting - 1);
        assert.equal(p.club().funds, start.funds + 500);
        assert.equal(p.club().members['韩露'].room, '');
        assert.deepEqual(p.club().rooms['一号室'].members, []);
        const firstAdmission = p.club();
        assert.equal((await p.model([admit('韩露')])).ok, false, 'a duplicate cannot charge another admission fee');
        const outOfBounds = admit('无效申请人');
        outOfBounds.params.control = 61;
        assert.equal((await p.model([outOfBounds])).ok, false, 'the model cannot exceed the arrival control cap');
        assert.deepEqual(p.club(), firstAdmission);

        // The model cannot settle what belongs to the panel or set numbers directly.
        const direct = await p.model([{ op: 'set', path: ['club', 'funds'], value: 99999 }]);
        assert.equal(direct.ok, false);
        const panelAction = await p.model([{ action: 'endweek', params: {} }]);
        assert.equal(panelAction.ok, false);
        assert.equal(p.club().funds, start.funds + 500);

        assert.equal((await p.model([{ action: 'admit', params: { name: '吴桐', age: 27, job: '设计师', kink: '需要被支配。', wants: '支配', is: ['被支配'], hates: [], control: 30, note: '迟到了。' } }])).ok, true);
        assert.equal(p.club().waiting, 0);
        assert.equal(p.club().funds, start.funds + 1000);
        const noInterviews = p.club();
        const noInterview = await p.model([admit('第三个')]);
        assert.equal(noInterview.ok, false, 'no interviews left this week');
        assert.equal((await p.model([{ action: 'decline', params: {} }])).ok, false);
        assert.deepEqual(p.club(), noInterviews);
        const updated = await p.model([{ action: 'note', params: { member: '韩露', note: '第一次主动开口讲了公司那件事。' } }]);
        assert.equal(updated.ok, true);
        assert.equal(p.club().members['韩露'].note, '第一次主动开口讲了公司那件事。');

        const leak = await p.model([{ action: 'report', params: { who: ['韩露'], kind: '外泄', summary: '学员在健身房说出了她来这里的事。' } }]);
        assert.equal(leak.ok, true);
        assert.equal(p.club().exposure, start.exposure + 25);
        p.tick();
        const [button] = p.incidentButtons();
        await p.click(button);
        assert.equal(p.club().incidents[0].open, false);
        assert.equal(p.club().exposure, start.exposure + 15);
        assert.equal(p.club().funds, noInterviews.funds - 600);
        const handled = p.club();
        await p.click(button);
        assert.deepEqual(p.club(), handled, 'a handled incident cannot be paid for twice');
    } finally { p.close(); }
});

test('the first graduate brings a once-only donation, and the season ends when money runs out', async t => {
    const p = await progressedCenter(() => 6);
    t.mock.method(Math, 'random', p.random);
    try {
        await p.assign('何小满', '一号室');
        let donations = 0;
        while (p.club().phase === '运营中') {
            const before = p.club();
            await p.click('endweek');
            const after = p.club();
            if (!before.flags.firstGraduate && after.flags.firstGraduate) {
                donations++;
                assert.equal(after.funds, before.funds + after.lastWeek!.income - after.lastWeek!.rent + 2000);
            }
        }
        assert.equal(donations, 1);
        const end = p.club();
        assert.ok(['季末', '资金断裂'].includes(end.phase));
        assert.equal(p.element('ending').hidden, false);
        assert.equal(p.element('assign').hidden, true);
        const calls = p.controls.applyCalls;
        p.element('endweek').click();
        assert.equal(p.controls.applyCalls, calls, 'a finished season accepts no action');
    } finally { p.close(); }
});

test('the panel follows undo without replaying the week', async t => {
    const p = await progressedCenter(() => 1);
    t.mock.method(Math, 'random', p.random);
    try {
        const start = p.club();
        await p.click('endweek');
        assert.equal(p.club().week, 2);
        await p.undo();
        const calls = p.controls.applyCalls;
        p.tick();
        assert.deepEqual(p.club(), start);
        assert.equal(p.element('week').textContent, '第 1 / 12 周', 'the open panel shows the restored week');
        assert.equal(p.controls.applyCalls, calls);
    } finally { p.close(); }
});
