import * as T from 'three';
import type { IslandView } from '../service.js';
import type { Activity, ContactForm, NpcId, PersonId, WorkTask } from '../model.js';
import { CONTACTS } from '../interaction-content.js';
import { LANDSCAPE } from '../content.js';
import { COPY as c, activityText } from '../copy.js';
import { canTravel, distance } from '../space.js';
import { elevationAt } from '../terrain.js';
import { disposeGroup } from './meshes.js';
import { heldItemMesh, itemMesh } from './item-mesh.js';
import type { Foliage } from './foliage.js';
import type { CharacterRoster } from './character-loader.js';
import type { SurvivorVisual } from './survivor-visual.js';
import type { ConflictMotion } from './conflict-pose.js';
import { alignContactFaces } from './contact-pose.js';

type Observation = NonNullable<IslandView['player']>;
type Figure = { visual: SurvivorVisual; ring: T.Mesh<T.RingGeometry, T.MeshBasicMaterial> | null; label: HTMLElement | null; leader: SVGLineElement | null; signature: string; attachments: string;
    from: T.Vector3; to: T.Vector3; started: number; duration: number; activity: Activity['kind'] | null; work: WorkTask['kind'] | null; reducedMotion: boolean;
    contact: { partner: PersonId | null; active: boolean; weight: number; upper: boolean; form: ContactForm }; invitation: number;
    threat: PersonId | null; lastConflict: number; replay: { started: number; target: PersonId; kind: ConflictMotion['kind'] } | null };

// Only replays observed, confirmed state. The asset never owns a person, inventory or world clock.
export function createPeopleLayer(scene: T.Scene, container: HTMLElement, select: (id: NpcId) => void, foliage: Foliage, characters: CharacterRoster) {
    let care: Observation['care'] = [];
    let lastFrame: number | null = null;
    const figures = new Map<PersonId, Figure>(), layer = new T.Group(), labels = document.createElement('div');
    labels.className = 'island-people-labels'; container.append(labels); scene.add(layer);
    const leaders = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    leaders.classList.add('island-people-leaders'); leaders.setAttribute('aria-hidden', 'true'); labels.append(leaders);
    function clearAttachments(figure: Figure) {
        for (const group of [figure.visual.hand, figure.visual.covering]) { disposeGroup(group, foliage.materials); group.clear(); }
    }
    function remove(figure: Figure) {
        layer.remove(figure.visual.root); clearAttachments(figure); figure.visual.dispose(); figure.label?.remove(); figure.leader?.remove();
        figure.ring?.geometry.dispose(); figure.ring?.material.dispose();
    }
    function update(next: Observation, reducedMotion: boolean) {
        care = next.care;
        const people = [{ id: next.observer, ...next.self }, ...next.people], visible = new Set(people.map(p => p.id));
        for (const [id, figure] of figures) { if (!visible.has(id)) { remove(figure); figures.delete(id); } }
        for (const person of people) {
            const clothing = next.items.filter(i => i.location.kind === 'worn' && i.location.person === person.id);
            const offer = next.offers.find(o => o.from === person.id), held = offer ?? next.using.find(item => item.person === person.id);
            const covers = next.items.filter(i => i.location.kind === 'covering' && i.location.person === person.id);
            const signature = JSON.stringify([person.identity, person.body.kind]), old = figures.get(person.id);
            let figure = old;
            if (!figure || figure.signature !== signature) {
                const previous = figure?.visual.root.position.clone(), direction = figure?.visual.root.rotation.y ?? 0; if (figure) { remove(figure); }
                const dead = person.body.kind === 'dead';
                const visual = characters.create(person.id, clothing, dead);
                visual.root.position.x = previous?.x ?? person.position.x; visual.root.position.z = previous?.z ?? person.position.y;
                visual.root.rotation.y = direction;
                let label: HTMLElement | null = null, leader: SVGLineElement | null = null;
                let ring: Figure['ring'] = null;
                leader = document.createElementNS('http://www.w3.org/2000/svg', 'line'); leaders.append(leader);
                if (person.id !== 'player') {
                    const id = person.id as NpcId, button = document.createElement('button'); button.textContent = person.identity.name;
                    button.setAttribute('aria-label', `${c.look} · ${person.identity.name}`); button.addEventListener('click', () => select(id)); label = button;
                } else {
                    // The player is named on the map too, but cannot be looked at like someone else.
                    label = document.createElement('span'); label.className = 'island-people-self'; label.textContent = person.identity.name;
                    ring = new T.Mesh(new T.RingGeometry(.4, .47, 36), new T.MeshBasicMaterial({ color: '#245d61', side: T.DoubleSide }));
                    ring.rotation.x = -Math.PI / 2; ring.position.y = .04; visual.root.add(ring);
                }
                labels.append(label);
                figure = { visual, ring, label, leader, signature, attachments: '', from: visual.root.position.clone(), to: visual.root.position.clone(),
                    started: 0, duration: 0, activity: null, work: null, reducedMotion,
                    contact: { partner: null, active: false, weight: 0, upper: false, form: 'embrace' }, invitation: 0, threat: null, lastConflict: 0, replay: null };
                figures.set(person.id, figure); layer.add(visual.root);
            }
            const attachments = JSON.stringify([held && [held.form, held.units, held.wetness], covers.map(i => [i.kind, i.quantity, i.wetness, i.cleanliness])]);
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
            figure.threat = next.threats.find(t => t.from === person.id)?.to ?? null;
            const latest = [...next.conflicts].reverse().find(e => e.actor === person.id || e.to === person.id && e.outcome === 'hit');
            if (latest && latest.sequence > figure.lastConflict) {
                figure.lastConflict = latest.sequence;
                figure.replay = { started: performance.now(), target: latest.actor === person.id ? latest.to : latest.actor,
                    kind: latest.actor === person.id ? latest.form : 'recoil' };
            }
            const pair = next.contacts.find(p => p.from === person.id || p.to === person.id);
            const partner = pair ? pair.from === person.id ? pair.to : pair.from : null;
            if (pair) { figure.contact.form = pair.form; }
            if (partner && figure.contact.partner !== partner) { figure.contact.weight = 0; figure.contact.partner = partner; }
            figure.contact.active = !!partner;
            figure.visual.dressings(next.items.flatMap(i => i.location.kind === 'dressing' && i.location.person === person.id
                ? [{ wound: i.location.wound, wetness: i.wetness, cleanliness: i.cleanliness }] : []));
            const care = next.care.find(pair => pair.from === person.id && pair.to !== person.id);
            const invitation = next.contactOffers.find(o => o.from === person.id);
            if (invitation) { figure.contact.form = invitation.form; }
            const recipient = people.find(p => p.id === (offer?.to ?? care?.to ?? invitation?.to));
            if (recipient && distance(person.position, recipient.position) > .01) {
                figure.visual.root.rotation.y = Math.atan2(recipient.position.x - person.position.x, recipient.position.y - person.position.y);
            }
            if (figure.label) { figure.label.title = person.body.kind === 'dead' ? c.remains : activityText(activity, figure.work); }
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
        const seconds = lastFrame === null ? 0 : Math.min(.08, Math.max(0, (time - lastFrame) / 1000)); lastFrame = time;
        let moving = false;
        for (const figure of figures.values()) {
            const fraction = figure.duration ? Math.min(1, Math.max(0, (time - figure.started) / figure.duration)) : 1;
            figure.visual.root.position.x = T.MathUtils.lerp(figure.from.x, figure.to.x, fraction);
            figure.visual.root.position.z = T.MathUtils.lerp(figure.from.z, figure.to.z, fraction);
            figure.visual.root.position.y = elevationAt({ x: figure.visual.root.position.x, y: figure.visual.root.position.z });
            let combat: ConflictMotion | null = null;
            const replay = figure.replay, targetId = replay?.target ?? figure.threat, target = targetId ? figures.get(targetId) : null;
            if (replay) {
                const progress = (time - replay.started) / 1100;
                if (progress >= 1 || figure.reducedMotion) { figure.replay = null; }
                else { combat = { kind: replay.kind, progress: Math.max(0, progress), target: target?.to.clone() ?? null }; }
            } else if (figure.threat || figure.activity === 'guard') { combat = { kind: 'guard', progress: .42, target: target?.to.clone() ?? null }; }
            if (target && (figure.threat || replay && replay.kind !== 'recoil')) {
                figure.visual.root.rotation.y = Math.atan2(target.to.x - figure.to.x, target.to.z - figure.to.z);
            }
            figure.visual.pose(figure.reducedMotion ? 0 : time / 160, fraction < 1, figure.activity, figure.work, combat); moving ||= fraction < 1;
        }
        for (const [id, figure] of figures) {
            const hug = figure.contact, partner = hug.partner ? figures.get(hug.partner) : null;
            const active = hug.active && !!partner, standing = figure.activity === null || figure.activity === 'contact' || figure.activity === 'offer_contact';
            if (!standing || !partner) { hug.weight = 0; }
            else {
                const close = figure.visual.root.position.distanceTo(partner.visual.root.position) < .75;
                const target = active ? close ? 1 : .25 : 0;
                hug.weight = figure.reducedMotion ? target : T.MathUtils.clamp(target, hug.weight - seconds / .8, hug.weight + seconds / 1.5);
                hug.upper = figure.visual.contact.height > partner.visual.contact.height
                    || figure.visual.contact.height === partner.visual.contact.height && id > hug.partner!;
                if (active) {
                    const delta = partner.visual.root.position.clone().sub(figure.visual.root.position);
                    const angle = Math.atan2(delta.x, delta.z) + (CONTACTS[hug.form].sideBySide ? id < hug.partner! ? Math.PI / 2 : -Math.PI / 2 : hug.form === 'embrace' ? .4 : .04);
                    const difference = Math.atan2(Math.sin(angle - figure.visual.root.rotation.y), Math.cos(angle - figure.visual.root.rotation.y));
                    figure.visual.root.rotation.y += difference * (figure.reducedMotion ? 1 : Math.min(1, seconds * 7));
                }
            }
            const inviting = figure.activity === 'offer_contact' && hug.form === 'embrace' ? .28 : 0;
            figure.invitation = !standing ? 0 : figure.reducedMotion ? inviting : T.MathUtils.clamp(inviting, figure.invitation - seconds, figure.invitation + seconds * .4);
            const weight = Math.max(hug.weight, figure.invitation);
            if (weight > 0) { figure.visual.contact.prepare(T.MathUtils.smoothstep(weight, 0, 1), hug.upper, hug.form, partner?.visual.contact.height ?? figure.visual.contact.height); }
        }
        // Both torsos are posed before either person reaches for the other's visible surface.
        for (const [id, figure] of figures) {
            const pair = figure.contact, partner = pair.partner ? figures.get(pair.partner) : null;
            if (pair.form !== 'kiss' || !partner || id > pair.partner! || !pair.weight) { continue; }
            alignContactFaces(figure.visual.contact, partner.visual.contact, Math.min(pair.weight, partner.contact.weight));
        }
        for (const figure of figures.values()) {
            const hug = figure.contact, partner = hug.partner ? figures.get(hug.partner) : null;
            if (partner && hug.weight > 0) { figure.visual.contact.reach(partner.visual.contact, hug.weight, hug.upper, hug.form); }
        }
        for (const pair of care) {
            const helper = figures.get(pair.from), patient = figures.get(pair.to);
            if (helper && patient) { helper.visual.care(patient.visual.careAnchor(pair.wound), helper.reducedMotion ? 0 : time / 600, pair.from === pair.to ? pair.wound : null); }
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
