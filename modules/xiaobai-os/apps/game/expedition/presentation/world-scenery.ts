import type { Group } from 'three';
import type { CourtyardFact, SceneDefinition } from '../content/world-types.js';
import type { SceneKit } from '../scene-kit.js';
import { sceneSpace, visibleInteractions } from '../world/exploration.js';
import { buildLandscape, type LandscapeScenery } from './landscape-scenery.js';
import { lamp } from './landscape-models.js';
import { LAND } from './world-palette.js';
import { person } from './world-people.js';
import { buildSentries } from './world-sentries.js';
import type { Point } from '../types.js';
import type { PeopleLocations } from '../world/people.js';
import { PERSON_IDS } from '../content/people.js';
import { PERSON_PLACES } from '../content/people-places.js';
import { COURTYARD } from '../content/courtyard.js';
import { PARLEY_ENEMIES, PARLEY_IDS } from '../content/parley.js';
import { parleyActor } from './world-parley.js';
import { buildLocalLife } from './local-people.js';
import type { EncounterSegment } from '../content/courtyard-encounters.js';

export interface ExplorableScenery extends LandscapeScenery {
    setFacts(facts: ReadonlySet<CourtyardFact>): void; setEncounterActive(active: boolean): void;
    animate(player: Point, now: number, reduced: boolean, inView: (point: Point) => boolean): boolean;
    people: ReturnType<typeof person>[];
    setPeople(people: PeopleLocations, now: number): boolean;
    parleyPeople: ReturnType<typeof parleyActor>[];
    setProgress(completed: readonly EncounterSegment[], objects: ReadonlySet<string>): boolean;
}

/** Map geometry lives for one visit; a door or NPC change only rebuilds its small stateful layer. */
export function buildExplorableWorld(k: SceneKit, root: Group, definition: SceneDefinition, facts: ReadonlySet<CourtyardFact>): ExplorableScenery {
    const scenery = buildLandscape(k, root, definition.landscape), objects = k.group(root), residents = k.group(root);
    const sentries = buildSentries(k, root, definition, facts);
    const localLife = buildLocalLife(k, residents, definition.id);
    const caches = definition.objects.filter(o => o.kind === 'reward' || o.kind === 'rest').map(item => {
        const p = definition.anchors[item.anchor], model = k.group(root, [p.x, 0, p.y]);
        if (item.kind === 'reward') {
            k.mesh(model, 'box', LAND.wood, [.85, .45, .6], [0, .225, -.65]);
            for (const side of [-1, 1]) { k.mesh(model, 'box', LAND.brass, [.055, .48, .63], [side * .26, .24, -.65]); }
            k.mesh(model, 'rock', LAND.ember, [.15, .3, .15], [0, .68, -.65], true);
            k.ring(model, LAND.brass, .65, 0, 0, .35, true);
        } else {
            k.mesh(model, 'box', LAND.wood, [1.4, .12, .6], [0, .5, -.7]);
            for (const side of [-1, 1]) { k.mesh(model, 'box', LAND.timber, [.12, .45, .5], [side * .5, .22, -.7]); }
        }
        model.visible = false;
        return { id: item.id, model, dispose: k.bake(model) };
    });
    const people: ReturnType<typeof person>[] = [];
    const parleyPeople = PARLEY_IDS.filter(id => PARLEY_ENEMIES[id].scene === definition.id).map(id => parleyActor(k, residents, id, facts));
    let animatedAt = -1;
    let disposeObjects: (() => void) | null = null, factKey: string | null = null;
    function setFacts(next: ReadonlySet<CourtyardFact>) {
        const key = [...next].sort().join('/');
        if (key === factKey) { return; } factKey = key;
        parleyPeople.forEach(person => person.setFacts(next));
        disposeObjects?.();
        sentries.setFacts(next);
        for (const item of visibleInteractions(definition, next)) {
            const p = item.position;
            if (item.kind === 'exit') {
                if (!item.target.doorway) { for (const side of [-1, 1]) { lamp(k, objects, p.x + side * 1.7, p.y, 1.5); } }
                k.mesh(objects, 'box', LAND.brass, [3, .025, .35], [p.x, .12, p.y]).castShadow = false;
            } else if (item.target.kind === 'inspect' && item.target.passage === 'warning') {
                k.mesh(objects, 'box', LAND.timber, [.12, 1.8, .12], [p.x, .9, p.y]);
                k.mesh(objects, 'box', LAND.wood, [1.4, .7, .13], [p.x, 1.6, p.y]);
                k.mesh(objects, 'box', LAND.light, [.7, .4, .025], [p.x, 1.6, p.y + .08]);
            } else if (item.target.kind === 'inspect' && item.target.passage === 'orders') {
                k.mesh(objects, 'box', LAND.slate, [2.2, .8, 1.2], [p.x, .4, p.y - .8]);
                const panel = k.mesh(objects, 'box', LAND.light, [1.8, .08, .9], [p.x, .85, p.y - .8]); panel.rotation.x = .2;
                for (let i = -1; i <= 1; i++) {
                    k.mesh(objects, 'cylinder', LAND.brass, [.12, .12, .12], [p.x + i * .45, .95, p.y - .55]);
                }
            }
        }
        if (definition.id === 'camp') {
            const clinic = definition.landscape.features.find(f => f.kind === 'clinic')!.footprint;
            if (next.has('clinic_helped')) {
                const bench = definition.landscape.features.find(f => f.kind === 'bench')!.footprint;
                for (const side of [-1, 1]) {
                    k.mesh(objects, 'cylinder', '#ede3c9', [.16, .22, .16], [bench.x, .91, bench.z + side * .65]);
                    k.mesh(objects, 'cylinder', '#99704c', [.125, .012, .125], [bench.x, 1.024, bench.z + side * .65]);
                }
            }
            if (next.has('receiving_arranged')) {
                for (const side of [-1, 1]) {
                    // Folded stretchers and blankets rest against the existing clinic footprint.
                    const x = clinic.x + side * 2.4, z = clinic.z + clinic.depth / 2 - .2;
                    const stretcher = k.group(objects, [x, .2, z]); stretcher.rotation.x = -.16;
                    for (const edge of [-1, 1]) { k.mesh(stretcher, 'cylinder', LAND.timber, [.055, 2.9, .055], [edge * .42, 1.4, 0]); }
                    k.mesh(stretcher, 'box', next.has('captives_arrived') ? '#bdccc0' : '#eee7d1', [.76, 2.2, .09], [0, 1.4, .05]);
                    for (const y of [.7, 2.1]) { k.mesh(stretcher, 'box', LAND.timber, [.94, .055, .08], [0, y, .12]); }
                }
            }
            if (next.has('warden_defeated')) {
                const wagon = definition.landscape.features.find(f => f.kind === 'wagon')!.footprint;
                for (let i = 0; i < 4; i++) {
                    const crate = k.group(objects, [wagon.x + (i % 2 ? .65 : -.65), 1.4, wagon.z + (i < 2 ? -.9 : .6)]);
                    k.mesh(crate, 'box', LAND.wood, [1.1, .75, 1.2], [0, .375, 0]);
                    for (const edge of [-1, 1]) { k.mesh(crate, 'box', LAND.brass, [.08, .78, 1.22], [edge * .35, .38, 0]); }
                    k.mesh(crate, 'box', LAND.light, [.25, .025, .55], [0, .77, 0]);
                }
            }
        }
        // A used mechanism remains in the scene, with its new handle position.
        for (const item of definition.objects) {
            if (item.kind !== 'switch') { continue; }
            const p = definition.anchors[item.anchor], opened = next.has(item.fact), mechanism = k.group(objects, [p.x, 0, p.y]);
            k.mesh(mechanism, 'box', LAND.slate, [.7, .65, .7], [0, .325, 0]);
            k.mesh(mechanism, 'box', LAND.brass, [.5, .1, .5], [0, .7, 0]);
            const handle = k.group(mechanism, [0, .75, 0]); handle.rotation.z = opened ? .65 : -.65;
            k.mesh(handle, 'cylinder', LAND.brass, [.065, .7, .065], [0, .35, 0]);
            k.mesh(handle, 'cylinder', LAND.timber, [.09, .44, .09], [0, .73, 0]).rotation.z = Math.PI / 2;
        }
        const space = sceneSpace(definition, next);
        for (const gate of definition.landscape.gates) {
            const f = gate.footprint, alongX = f.width > f.depth, length = Math.max(f.width, f.depth);
            const model = k.group(objects, [f.x, 0, f.z]); if (!alongX) { model.rotation.y = Math.PI / 2; }
            for (const side of [-1, 1]) { k.mesh(model, 'box', LAND.stone, [.35, 3.2, .7], [side * length / 2, 1.6, 0]); }
            k.mesh(model, 'box', LAND.light, [length + .5, .35, .9], [0, 3.25, 0]);
            if (space.closedGates.has(gate.id)) {
                for (let x = -length / 2 + .2; x < length / 2; x += .4) { k.mesh(model, 'box', LAND.shadow, [.065, 3, .1], [x, 1.5, 0]); }
                for (const y of [.4, 2.5]) { k.mesh(model, 'box', LAND.brass, [length, .12, .15], [0, y, 0]); }
            } else {
                k.mesh(model, 'box', LAND.shadow, [length, .42, .16], [0, 3, 0]);
            }
        }
        for (const feature of definition.landscape.features) {
            if (feature.kind !== 'beacon' || next.has('alarm_silenced')) { continue; }
            const p = feature.footprint;
            const cord = k.mesh(objects, 'cylinder', LAND.timber, [.045, 4.8, .045], [p.x + 3.3, 2.7, p.z + 2.5]);
            cord.rotation.z = -.32;
            for (let i = 0; i < 5; i++) {
                k.mesh(objects, 'rock', i % 2 ? LAND.ember : LAND.cloth, [.55, 1.2 + i % 3 * .3, .55],
                    [p.x + Math.sin(i * 2) * .7, 5.4 + i % 3 * .3, p.z + Math.cos(i * 2) * .7], true);
            }
        }
        disposeObjects = k.bake(objects);
    }
    setFacts(facts);
    return { setFacts, people, parleyPeople,
        setProgress(completed, visible) {
            let changed = sentries.setProgress(completed);
            for (const cache of caches) {
                const show = visible.has(cache.id);
                if (cache.model.visible !== show) { cache.model.visible = show; changed = true; }
            }
            return changed;
        },
        setPeople(locations, now) {
            let changed = false;
            for (const id of PERSON_IDS) {
                const location = locations[id], home = PERSON_PLACES[id].station, homePoint = COURTYARD[home.scene].anchors[home.anchor];
                const seated = location.mode === 'idle' && (location.scene === 'cells' || location.scene === home.scene && Math.hypot(location.position.x - homePoint.x, location.position.y - homePoint.y) < 1);
                let model = people.find(p => p.id === id);
                if (model && (location.scene !== definition.id || model.seated !== seated)) { model.dispose(); people.splice(people.indexOf(model), 1); model = undefined; changed = true; }
                if (location.scene !== definition.id) { continue; }
                if (!model) { model = person(k, residents, id, location.position.x, location.position.y, new Set(factKey?.split('/') as CourtyardFact[]), seated); people.push(model); changed = true; }
                changed = model.locate(location, now) || changed;
            }
            return changed;
        }, setEncounterActive(active) { sentries.setEncounterActive(active); parleyPeople.forEach(person => { person.root.visible = !active; }); }, update: scenery.update,
        animate(player, now, reduced, inView) {
            const frame = Math.floor(now / 80);
            if (frame === animatedAt) { return false; } animatedAt = frame;
            let changed = sentries.animate(reduced);
            changed = localLife.animate(player, now, reduced, inView) || changed;
            for (const enemy of parleyPeople) { changed = enemy.update(player, reduced) || changed; }
            for (const person of people) {
                if (Math.hypot(person.position.x - player.x, person.position.y - player.y) < 22) {
                    person.update(player, now, reduced); changed = !reduced || changed;
                } else { person.ring.visible = false; }
            }
            return changed;
        },
        dispose() { caches.forEach(cache => { cache.dispose(); cache.model.removeFromParent(); }); localLife.dispose(); people.splice(0).forEach(person => person.dispose()); parleyPeople.forEach(person => person.dispose()); residents.removeFromParent(); disposeObjects?.(); sentries.dispose(); scenery.dispose(); } };
}
