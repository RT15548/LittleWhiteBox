import { Group, Vector3 } from 'three';
import { createMascotWalker, createMascotPoses, type MascotPosture } from '../../../../brand/mascot/performance.js';
import { CELL, partKey, type Blueprint, type Part } from '../policy.js';
import { routeTo, connected } from '../layout.js';
import { lifeTour, livingSpaces, type LivingSpace, type SpaceActivity } from '../spaces.js';
import { worldX, worldZ } from './models.js';
import { PALETTE as C } from './palette.js';
import type { Resources } from './resources.js';

export interface LifeMoment { phase: 'walking' | 'using'; space: LivingSpace }
const POSTURES: Record<SpaceActivity, MascotPosture> = { read: 'reading', sunbathe: 'reclining', rest: 'sleeping', relax: 'sipping', garden: 'looking' };
const ACTIVITY_MS = 3600;

/** Finite, room-derived visits. This actor owns no saved needs, timers or progression. */
export function createHouseLife(r: Resources, mascot: Group, footOffset: number, onMoment: (moment: LifeMoment | null) => void) {
    const walker = createMascotWalker(mascot), poses = createMascotPoses(mascot);
    const book = new Group(); book.position.set(0, -.01, .39); book.rotation.x = -.35; mascot.add(book);
    for (const side of [-1, 1]) {
        const cover = r.mesh(book, 'box', C.mint, [.25, .035, .33], [side * .126, 0, 0]); cover.rotation.z = side * -.16;
        const paper = r.mesh(book, 'box', C.porcelain, [.22, .032, .30], [side * .12, .03, 0]); paper.rotation.z = side * -.16;
    }
    const page = r.mesh(book, 'box', C.milk, [.22, .01, .29], [.12, .056, 0]);
    const cup = new Group(); cup.position.set(.15, .03, .36); mascot.add(cup);
    r.mesh(cup, 'rod', C.porcelain, [.09, .15, .09], [0, 0, 0]);
    r.mesh(cup, 'rod', C.timber, [.071, .008, .071], [0, .078, 0]);
    book.visible = false; cup.visible = false;
    let brief: Blueprint, parts: Part[] = [], cell: Pick<Part, 'x' | 'y' | 'z'> | null = null;
    let queue: LivingSpace[] = [], moment: LifeMoment | null = null, running = false, elapsed = 0, invited = false;
    let path: Vector3[] = [], anchor = new Vector3();
    const point = (p: Pick<Part, 'x' | 'y' | 'z'>) => new Vector3(worldX(brief, p.x), p.y * CELL.height + .14 + footOffset, worldZ(brief, p.z) + .39);
    function emit(next: LifeMoment | null) { moment = next; onMoment(next); }
    function home() { cell = null; mascot.position.set(worldX(brief, brief.entrance), .05 + footOffset, worldZ(brief, brief.entryZ) + .72); }
    function hideProps() { book.visible = false; cup.visible = false; poses.reset(); }
    function configure(nextBrief: Blueprint, nextParts: Part[], reset: boolean) {
        brief = nextBrief; parts = nextParts; queue = []; invited = false; running = false; hideProps();
        if (reset || !cell || !connected(brief, parts).has(partKey(cell))) { home(); }
        else { mascot.position.copy(point(cell)); }
        emit(null);
    }
    function activityAnchor(space: LivingSpace) {
        const destination = point(space.part);
        if (space.activity === 'read') { destination.x -= .18; destination.z = worldZ(brief, space.part.z) + .06; destination.y += .15; }
        if (space.activity === 'sunbathe') { destination.x -= .31; destination.z = worldZ(brief, space.part.z) + .03; destination.y += .18; }
        if (space.activity === 'rest') { destination.z = worldZ(brief, space.part.z) - .13; destination.y = space.part.y * CELL.height + .68; }
        if (space.activity === 'relax') { destination.x += .20; destination.z = worldZ(brief, space.part.z) + .10; destination.y += .23; }
        return destination;
    }
    function pose(reduced: boolean) {
        const space = moment!.space;
        book.visible = space.activity === 'read'; cup.visible = space.activity === 'relax';
        poses.pose(POSTURES[space.activity], anchor, elapsed, reduced);
        const turn = reduced ? 0 : Math.max(0, Math.sin(elapsed / 470));
        page.rotation.z = -turn * Math.PI; page.position.x = .12 * Math.cos(turn * Math.PI);
        cup.position.y = .03 + (reduced ? .035 : Math.sin(elapsed / 650) * .035);
    }
    function arrive(reduced: boolean) {
        const space = moment!.space; cell = { x: space.part.x, y: space.part.y, z: space.part.z };
        elapsed = 0; emit({ phase: 'using', space }); pose(reduced);
    }
    function next(reduced: boolean) {
        const space = queue.shift(); if (!space) { running = false; return; }
        const route = routeTo(brief, parts, space.part, cell ?? undefined);
        if (!route.length) { throw new Error('building_life_route'); }
        hideProps(); anchor = activityAnchor(space); path = [mascot.position.clone()];
        route.forEach((p, i) => {
            const previous = route[i - 1];
            if (previous && previous.y !== p.y) {
                const direction = Math.sign(p.y - previous.y);
                const from = point(previous), to = point(p); from.x -= .43 * direction; to.x += .43 * direction;
                path.push(from, to);
            }
            path.push(point(p));
        });
        path.push(anchor.clone()); elapsed = 0; running = !reduced;
        emit({ phase: 'walking', space });
        if (reduced) { queue = []; arrive(true); }
    }
    function visit(destination?: Pick<Part, 'x' | 'y' | 'z'>, reduced = false) {
        const spaces = destination ? livingSpaces(brief, parts).filter(s => !s.issue && partKey(s.part) === partKey(destination)) : lifeTour(brief, parts);
        if (!spaces.length) { return; }
        queue = spaces; invited = true;
        // A new choice waits for the current route to reach its room instead of teleporting mid-stair.
        if (!running || reduced || moment?.phase === 'using') { invited = false; next(reduced); }
    }
    function tick(delta: number) {
        if (!running || !moment) { return false; }
        elapsed += delta;
        if (moment.phase === 'walking') { if (!walker.walk(path, elapsed)) { arrive(false); if (invited) { invited = false; next(false); } } }
        else { pose(false); if (elapsed >= ACTIVITY_MS) { next(false); } }
        return running;
    }
    function reduce() {
        queue = []; running = false;
        if (moment) { anchor = activityAnchor(moment.space); arrive(true); }
    }
    return { configure, visit, tick, reduce };
}
