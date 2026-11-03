import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from 'three';
import { blueprint, certifiedPlans } from '../apps/game/building/generation.ts';
import { inspect, placementIssue, refitted } from '../apps/game/building/rules.ts';
import { livingSpaces, sunny, lifeTour } from '../apps/game/building/spaces.ts';
import { houseParts } from '../apps/game/building/house.ts';
import { partKey } from '../apps/game/building/policy.ts';
import { routeTo, stairLinks } from '../apps/game/building/layout.ts';
import { parseCommand } from '../apps/game/building/partition.ts';
import { createHouseLife } from '../apps/game/building/scene/life.ts';
import { createResources } from '../apps/game/building/scene/resources.ts';
import { worldX } from '../apps/game/building/scene/models.ts';
const brief = blueprint(17, 'sunroom'), [downRooms, upRooms] = certifiedPlans(brief);
const downstairs = houseParts(brief, downRooms), upstairs = houseParts(brief, upRooms);

test('reading needs distance from the door horizontally and vertically', () => {
    assert.equal(livingSpaces(brief, upstairs).find(s => s.activity === 'read').issue, null);
    const noisyRooms = [{ kind: 'hall', x: brief.entrance, y: 0, z: brief.entryZ }, { kind: 'study', x: brief.entrance - 1, y: 0, z: brief.entryZ }];
    assert.equal(placementIssue(brief, noisyRooms), null);
    assert.equal(livingSpaces(brief, houseParts(brief, noisyRooms)).find(s => s.activity === 'read').issue, 'noisy');
    assert.equal(inspect(brief, noisyRooms).wishes.find(w => w.id === 'quietReading').met, false);
    const upstairsRooms = [...noisyRooms, { kind: 'study', x: brief.entrance, y: 1, z: brief.entryZ }];
    assert.equal(inspect(brief, upstairsRooms).wishes.find(w => w.id === 'quietReading').met, false);
    assert.equal(livingSpaces(brief, houseParts(brief, upstairsRooms)).find(s => s.part.y === 1).issue, 'noisy');
});

test('enclosing a quiet study blocks its side daylight; an outdoor neighbour restores it', () => {
    const b = { ...brief, width: 6, heights: Array(18).fill(2), entrance: 1, materials: 10, sunSide: 1 };
    const rooms = [{ kind: 'hall', x: 1, y: 0, z: brief.entryZ }, { kind: 'room', x: 2, y: 0, z: brief.entryZ }, { kind: 'study', x: 3, y: 0, z: brief.entryZ }];
    const check = rs => inspect(b, rs);
    assert.equal(check(rooms).wishes.find(w => w.id === 'quietReading').met, true);
    const enclosed = [...rooms, { kind: 'room', x: 4, y: 0, z: brief.entryZ }];
    assert.equal(placementIssue(b, enclosed), null);
    assert.equal(check(enclosed).wishes.find(w => w.id === 'quietReading').met, false);
    assert.equal(check(enclosed).spaces.find(s => s.activity === 'read').issue, 'window');
    assert.equal(check([...rooms, { kind: 'garden', x: 4, y: 0, z: brief.entryZ }]).wishes.find(w => w.id === 'quietReading').met, true);
});

test('sunlight follows the site direction and is blocked by same-level or higher sunward construction', () => {
    const terrace = downstairs.find(p => p.kind === 'terrace');
    assert.equal(sunny(brief, terrace, downstairs), true);
    for (const y of [terrace.y, terrace.y + 1]) {
        assert.equal(sunny(brief, terrace, [...downstairs, { kind: 'roof', x: terrace.x - 1, y, z: terrace.z }]), false);
    }
    assert.equal(sunny({ ...brief, sunSide: 1 }, terrace, downstairs), false);
    assert.equal(sunny(brief, terrace, [...downstairs, { kind: 'room', x: terrace.x - 1, y: 0, z: brief.entryZ }]), true);
});

test('refurnishing keeps footprint and supports and obeys the single budget', () => {
    const study = downstairs.find(p => p.kind === 'study'), bedroom = refitted(downRooms, study, 'room');
    assert.equal(placementIssue(brief, bedroom), null);
    assert.deepEqual(bedroom.filter(p => p !== bedroom.find(p => p.x === study.x && p.y === study.y)), downRooms.filter(p => partKey(p) !== partKey(study)));
    const restored = refitted(bedroom, study, 'study');
    assert.deepEqual(restored, downRooms);
    assert.equal(placementIssue({ ...brief, materials: inspect(brief, bedroom).materials }, restored), 'materials');
    assert.equal(refitted(downRooms, downRooms.find(p => p.kind === 'hall'), 'study'), null);
    assert.throws(() => parseCommand({ type: 'refit', x: 1, y: 0, z: brief.entryZ , kind: 'roof' }));
});

test('life routes start at the current room and cross floors only through actual stairs', () => {
    const terrace = downstairs.find(p => p.kind === 'terrace'), study = downstairs.find(p => p.kind === 'study');
    const route = routeTo(brief, downstairs, study, terrace);
    assert.deepEqual(route[0], { x: terrace.x, y: terrace.y, z: brief.entryZ });
    assert.deepEqual(route.at(-1), { x: study.x, y: study.y, z: brief.entryZ });
    for (let i = 1; i < route.length; i++) {
        const a = route[i - 1], b = route[i];
        assert.equal(Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z), 1);
        if (a.y !== b.y) { assert.ok(stairLinks(brief, downstairs).has(partKey({ x: a.x, y: Math.min(a.y, b.y), z: a.z }))); }
    }
});

test('a living tour uses actual available spaces, finishes, and reduced motion goes directly to a static activity', () => {
    const r = createResources(), mascot = new Group(), events = [];
    try {
        const life = createHouseLife(r, mascot, .2, moment => { if (moment) { events.push([moment.phase, moment.space.activity]); } });
        life.configure(brief, downstairs, true); life.visit();
        let frames = 0;
        while (life.tick(64) && frames < 3000) { frames++; }
        assert.ok(frames < 3000);
        assert.deepEqual(events.filter(e => e[0] === 'using').map(e => e[1]), lifeTour(brief, downstairs).map(s => s.activity));
        const parked = mascot.position.clone(); assert.equal(life.tick(64), false); assert.deepEqual(mascot.position, parked);
        life.configure(brief, downstairs, true);
        const study = downstairs.find(p => p.kind === 'study'); life.visit(study, true);
        assert.deepEqual(events.at(-1), ['using', 'read']); assert.equal(life.tick(64), false);
        assert.ok(Math.abs(mascot.position.x - worldX(brief, study.x)) < .5);
        const before = mascot.position.clone(); life.visit({ x: 99, y: 99, z: brief.entryZ }, true); assert.deepEqual(mascot.position, before);
    } finally { r.dispose(); }
});

test('sunlight does not let an unrelated depth row shade a terrace', () => {
    const terrace = downstairs.find(p => p.kind === 'terrace');
    assert.equal(sunny(brief, terrace, [...downstairs, { kind: 'room', x: terrace.x + brief.sunSide, y: terrace.y + 1, z: terrace.z - 1 }]), true);
});
test('a room invitation interrupts the current activity immediately without resetting the actor position', () => {
    const r = createResources(), mascot = new Group(), events = [];
    try {
        const life = createHouseLife(r, mascot, .2, moment => { if (moment) { events.push(moment); } });
        life.configure(brief, downstairs, true);
        const study = downstairs.find(p => p.kind === 'study'), terrace = downstairs.find(p => p.kind === 'terrace');
        life.visit(study);
        for (let i = 0; i < 1000 && events.at(-1)?.phase !== 'using'; i++) { life.tick(64); }
        assert.equal(events.at(-1).phase, 'using');
        const position = mascot.position.clone();
        life.visit(terrace);
        assert.equal(events.at(-1).phase, 'walking');
        assert.equal(events.at(-1).space.activity, 'sunbathe');
        assert.deepEqual(mascot.position, position);
        life.reduce(); assert.equal(life.tick(64), false);
    } finally { r.dispose(); }
});
