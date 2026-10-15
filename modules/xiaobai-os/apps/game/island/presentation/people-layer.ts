import * as T from 'three';
import type { IslandView } from '../service.js';
import type { Activity, NpcId, PersonId, WorkTask } from '../model.js';
import { CAST, LANDSCAPE } from '../content.js';
import { COPY as c } from '../copy.js';
import { canTravel, distance } from '../space.js';
import { elevationAt } from '../terrain.js';
import { disposeGroup } from './meshes.js';
import { survivor } from './survivor.js';
import { heldItemMesh, itemMesh } from './item-mesh.js';
import type { Foliage } from './foliage.js';
import type { CharacterAsset } from './character-asset.js';
import type { SurvivorVisual } from './survivor-visual.js';

type Observation = NonNullable<IslandView['player']>;
type Figure = { visual: SurvivorVisual; label: HTMLButtonElement | null; leader: SVGLineElement | null; signature: string; attachments: string;
    from: T.Vector3; to: T.Vector3; started: number; duration: number; activity: Activity['kind'] | null; work: WorkTask['kind'] | null; reducedMotion: boolean };

// Only replays observed, confirmed state. The asset never owns a person, inventory or world clock.
export function createPeopleLayer(scene: T.Scene, container: HTMLElement, select: (id: NpcId) => void, foliage: Foliage, characters: CharacterAsset) {
    const figures = new Map<PersonId, Figure>(), layer = new T.Group(), labels = document.createElement('div');
    labels.className = 'island-people-labels'; container.append(labels); scene.add(layer);
    const leaders = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    leaders.classList.add('island-people-leaders'); leaders.setAttribute('aria-hidden', 'true'); labels.append(leaders);
    function clearAttachments(figure: Figure) {
        for (const group of [figure.visual.hand, figure.visual.covering]) { disposeGroup(group, foliage.materials); group.clear(); }
    }
    function remove(figure: Figure) {
        layer.remove(figure.visual.root); clearAttachments(figure); figure.visual.dispose(); figure.label?.remove(); figure.leader?.remove();
    }
    function update(next: Observation, reducedMotion: boolean) {
        const people = [{ id: next.observer, ...next.self }, ...next.people], visible = new Set(people.map(p => p.id));
        for (const [id, figure] of figures) { if (!visible.has(id)) { remove(figure); figures.delete(id); } }
        for (const person of people) {
            const clothing = next.items.filter(i => i.location.kind === 'worn' && i.location.person === person.id), worn = clothing.map(i => i.kind);
            const offer = next.offers.find(o => o.from === person.id), held = offer ?? next.using.find(item => item.person === person.id);
            const covers = next.items.filter(i => i.location.kind === 'covering' && i.location.person === person.id);
            const signature = JSON.stringify([person.id === 'ye' ? null : worn, person.body.kind]), old = figures.get(person.id);
            let figure = old;
            if (!figure || figure.signature !== signature) {
                const previous = figure?.visual.root.position.clone(), direction = figure?.visual.root.rotation.y ?? 0; if (figure) { remove(figure); }
                const dead = person.body.kind === 'dead';
                const visual = person.id === 'ye' ? characters.create(clothing, dead) : survivor(person.id, worn, dead);
                visual.root.position.x = previous?.x ?? person.position.x; visual.root.position.z = previous?.z ?? person.position.y;
                visual.root.rotation.y = direction;
                let label: HTMLButtonElement | null = null, leader: SVGLineElement | null = null;
                if (person.id !== 'player') {
                    const id = person.id as NpcId; label = document.createElement('button'); label.textContent = CAST[id].name;
                    label.setAttribute('aria-label', `${c.look} · ${CAST[id].name}`); label.addEventListener('click', () => select(id)); labels.append(label);
                    leader = document.createElementNS('http://www.w3.org/2000/svg', 'line'); leaders.append(leader);
                } else {
                    const ring = new T.Mesh(new T.RingGeometry(.4, .47, 36), new T.MeshBasicMaterial({ color: '#245d61', side: T.DoubleSide }));
                    ring.rotation.x = -Math.PI / 2; ring.position.y = .04; visual.root.add(ring);
                }
                figure = { visual, label, leader, signature, attachments: '', from: visual.root.position.clone(), to: visual.root.position.clone(),
                    started: 0, duration: 0, activity: null, work: null, reducedMotion };
                figures.set(person.id, figure); layer.add(visual.root);
            }
            const attachments = JSON.stringify([held && [held.form, held.units, held.wetness], covers.map(i => [i.kind, i.quantity, i.wetness])]);
            if (figure.attachments !== attachments) {
                clearAttachments(figure); let coverLayer = 0;
                for (const material of covers) {
                    for (let part = 0; part < material.quantity && coverLayer < 8; part++, coverLayer++) {
                        const cover = itemMesh({ ...material, quantity: 1 }, foliage, characters);
                        cover.position.set((coverLayer % 2 - .5) * .08, coverLayer * .015, -.25 + coverLayer % 3 * .22);
                        figure.visual.covering.add(cover);
                    }
                }
                if (held) { figure.visual.hand.add(heldItemMesh({ kind: held.form, quantity: held.units, wetness: held.wetness }, foliage, characters)); }
                figure.attachments = attachments;
            }
            const activity = (typeof person.activity === 'object' ? person.activity?.kind : person.activity) ?? null;
            figure.work = typeof person.activity === 'object' ? person.activity?.kind === 'work' ? person.activity.task.kind : null : 'work' in person ? person.work : null;
            figure.activity = activity; figure.reducedMotion = reducedMotion; figure.visual.wetness(clothing);
            const recipient = offer && people.find(p => p.id === offer.to);
            if (recipient && distance(person.position, recipient.position) > .01) {
                figure.visual.root.rotation.y = Math.atan2(recipient.position.x - person.position.x, recipient.position.y - person.position.y);
            }
            if (figure.label) { figure.label.title = person.body.kind === 'dead' ? c.remains : activity ? c.active[activity] : c.idle; }
            const destination = new T.Vector3(person.position.x, 0, person.position.y);
            if (destination.x !== figure.to.x || destination.z !== figure.to.z) {
                const from = { x: figure.visual.root.position.x, y: figure.visual.root.position.z };
                figure.from.set(from.x, 0, from.y); figure.to.copy(destination); figure.started = performance.now();
                figure.duration = !reducedMotion && canTravel(from, person.position, LANDSCAPE) ? Math.min(1000, Math.max(260, distance(from, person.position) * 45)) : 0;
                if (figure.duration) { figure.visual.root.rotation.y = Math.atan2(destination.x - from.x, destination.z - from.y); }
            }
        }
    }
    function animate(time: number) {
        let moving = false;
        for (const figure of figures.values()) {
            const fraction = figure.duration ? Math.min(1, Math.max(0, (time - figure.started) / figure.duration)) : 1;
            figure.visual.root.position.x = T.MathUtils.lerp(figure.from.x, figure.to.x, fraction);
            figure.visual.root.position.z = T.MathUtils.lerp(figure.from.z, figure.to.z, fraction);
            figure.visual.root.position.y = elevationAt({ x: figure.visual.root.position.x, y: figure.visual.root.position.z });
            figure.visual.pose(figure.reducedMotion ? 0 : time / 160, fraction < 1, figure.activity, figure.work); moving ||= fraction < 1;
        }
        return moving;
    }
    function project(camera: T.Camera) {
        const width = container.clientWidth, height = container.clientHeight, occupied: { x: number; y: number }[] = [];
        const projections = [...figures.values()].filter(f => f.label).map(figure => ({ figure,
            p: figure.visual.headAnchor.getWorldPosition(new T.Vector3()).add(new T.Vector3(0, .18, 0)).project(camera) })).sort((a, b) => a.p.y - b.p.y);
        for (const { figure, p } of projections) {
            const label = figure.label!, leader = figure.leader!; leader.style.display = 'none';
            label.hidden = Math.abs(p.x) > .96 || Math.abs(p.y) > .9;
            if (label.hidden) { continue; }
            const x = (p.x + 1) * width / 2, head = (1 - p.y) * height / 2; let y = head;
            while (occupied.some(q => Math.abs(q.x - x) < 46 && Math.abs(q.y - y) < 24)) { y -= 24; }
            occupied.push({ x, y }); label.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`;
            if (y < head) {
                leader.style.display = ''; leader.setAttribute('x1', String(x)); leader.setAttribute('x2', String(x));
                leader.setAttribute('y1', String(y)); leader.setAttribute('y2', String(head));
            }
        }
    }
    return { update, animate, project, player: () => figures.get('player')?.visual.root.position,
        pick(raycaster: T.Raycaster): NpcId | null {
            let nearest = Infinity, person: NpcId | null = null;
            for (const [id, figure] of figures) {
                if (id === 'player') { continue; }
                const meshes: T.Mesh[] = [];
                figure.visual.root.traverseVisible(object => {
                    if (object instanceof T.SkinnedMesh) { object.computeBoundingSphere(); object.computeBoundingBox(); }
                    if (object instanceof T.Mesh) { meshes.push(object); }
                });
                const hit = raycaster.intersectObjects(meshes, false)[0];
                if (hit && hit.distance < nearest) { nearest = hit.distance; person = id; }
            }
            return person;
        },
        dispose() { for (const f of figures.values()) { remove(f); } figures.clear(); scene.remove(layer); labels.remove(); } };
}
