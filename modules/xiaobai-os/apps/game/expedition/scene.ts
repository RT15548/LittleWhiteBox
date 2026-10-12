import { Color, DirectionalLight, Fog, Group, HemisphereLight, NeutralToneMapping, OrthographicCamera, PCFSoftShadowMap, Scene,
    SRGBColorSpace, Vector3, WebGLRenderer } from 'three';
import type { Battle, Weapon, Outfit, Point } from './types.js';
import { createSceneKit } from './scene-kit.js';
import { buildWorld } from './scene-world.js';
import { createEnemyActor, createHero } from './scene-actors.js';
import { createBattleEffects } from './scene-effects.js';
import { CAMERA_EIGHTH_TURNS, PALETTES, WORLD_CAMERA } from './visuals.js';
import { RULES, isBoss } from './content.js';
import { createWardShell } from './scene-defense.js';
import { createWorldStatus } from './scene-status.js';
import { buildExplorableWorld, type ExplorableScenery } from './presentation/world-scenery.js';
import type { CourtyardFact, CourtyardScene, SceneDefinition } from './content/world-types.js';
import type { WorldLocation } from './world/exploration.js';
import { participantName } from './content/participants.js';
import { reachablePersonInteractions, type PeopleLocations } from './world/people.js';
import { parleyInteractions } from './campaign/parley.js';
import { WORLD_COPY } from './content/world-copy.js';
import type { Traveler } from './campaign/traveler.js';
import { createWorldTextures } from './presentation/world-textures.js';
import { COURTYARD_ENCOUNTERS, nextEncounter, type EncounterSegment } from './content/courtyard-encounters.js';
import { COMBAT_COPY } from './content/combat-copy.js';

export type SceneMode = 'camp' | 'battle' | 'between';
export interface ExplorationFrame { definition: SceneDefinition; location: WorldLocation; facts: ReadonlySet<CourtyardFact>; people: PeopleLocations;
    objects: ReadonlySet<string>; completedSegments: readonly EncounterSegment[]; engagement?: EncounterSegment }
/** Owns presentation lifetime only: camera, meshes and transient damage labels. */
export function createExpeditionScene(host: HTMLElement, onError: () => void, options: { traveler: Traveler; world?: boolean; invalidate?: () => void; sceneReady?: (scene: CourtyardScene) => void; artworkStatus?: (failed: number, pending: number) => void }) {
    const renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: options.world ? 'default' : 'high-performance' });
    renderer.outputColorSpace = SRGBColorSpace; renderer.toneMapping = NeutralToneMapping; renderer.toneMappingExposure = 1;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, options.world ? 1.4 : 1.8)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = PCFSoftShadowMap;
    host.append(renderer.domElement);
    const labels = document.createElement('div'); labels.className = 'exp-world-labels'; labels.setAttribute('aria-hidden', 'true'); host.append(labels);
    const scene = new Scene(), camera = new OrthographicCamera(-10, 10, 10, -10, .1, 180), k = createSceneKit();
    scene.add(new HemisphereLight('#effbff', '#74918a', 2));
    const sun = new DirectionalLight('#fff4e5', 1.9); sun.position.set(-12, 25, 13); sun.castShadow = true;
    const shadowSize = options.world ? 1024 : 1536;
    sun.shadow.mapSize.set(shadowSize, shadowSize); Object.assign(sun.shadow.camera, { left: -23, right: 23, top: 24, bottom: -24, far: 80 });
    sun.shadow.bias = -.0004; sun.shadow.normalBias = .035; sun.shadow.radius = 3; scene.add(sun);
    const rim = new DirectionalLight('#c3edff', 1.1); rim.position.set(7, 8, -15); scene.add(rim);
    const environment = new Group(), actors = new Group(), effects = new Group(); scene.add(environment, actors, effects);
    const hero = createHero(k, actors, options.traveler.gender), fx = createBattleEffects(k, effects);
    const ward = createWardShell(k, effects), status = createWorldStatus(labels);
    const enemies = new Map<number, { actor: ReturnType<typeof createEnemyActor>; hp: number; death: number | null; marker: HTMLElement }>();
    const nameplates = new Map<string, HTMLElement>();
    const floaters: { element: HTMLElement; position: Vector3; born: number }[] = [];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)'), target = new Vector3(), projection = new Vector3();
    let disposeWorld: (() => void) | null = null, worldKey = '', lastMode = '', lastAppearance = '', lastBattle: Battle | null = null;
    let worldScenery: ExplorableScenery | null = null;
    let shownWorld: CourtyardScene | null = null;
    let worldX = NaN, worldY = NaN, worldFacing = NaN, drawnFacts: ReadonlySet<CourtyardFact> | null = null, draws = 0, submitMs = 0;
    let width = 1, height = 1, dirty = true, disposed = false, failed = false, lastFrame = 0, lastTick = -1, lastHp = 0, cameraReady = false;
    const worldTextures = options.world ? createWorldTextures(() => { worldKey = ''; dirty = true; options.invalidate?.(); }, (failed, pending) => options.artworkStatus?.(failed, pending)) : null;
    function resize() {
        const rect = host.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height);
        renderer.setSize(width, height, false); dirty = true; cameraReady = false; options.invalidate?.();
    }
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    function contextLost(event: Event) { event.preventDefault(); failed = true; onError(); }
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    function label(amount: number, x: number, z: number, tick: number, hurt = false) {
        if (Math.abs(amount) < 1) { return; }
        const element = document.createElement('span'); element.className = hurt ? 'exp-damage is-player' : amount < 0 ? 'exp-damage is-heal' : 'exp-damage';
        element.textContent = `${amount < 0 ? '+' : ''}${Math.ceil(Math.abs(amount))}`; labels.append(element);
        floaters.push({ element, position: new Vector3(x, 2, z), born: tick });
    }
    function clearActors() { for (const entry of enemies.values()) { actors.remove(entry.actor.root); entry.marker.remove(); } enemies.clear(); floaters.splice(0).forEach(f => f.element.remove()); }
    function inView(point: Point) {
        if (!cameraReady) { return true; }
        projection.set(point.x, 1, point.y).project(camera);
        return Math.abs(projection.x) < 1.15 && Math.abs(projection.y) < 1.15;
    }
    return {
        draw(battle: Battle | null, loadout: { weapon: Weapon; outfit: Outfit }, zone: number, mode: SceneMode = 'battle', now = 0, world?: ExplorationFrame) {
            if (disposed || failed) { return; }
            const started = performance.now();
            const b = mode === 'battle' ? battle : null, time = b?.tick ?? (reduced.matches ? 0 : now * .025), tickChanged = (b?.tick ?? -1) !== lastTick;
            const appearance = `${loadout.weapon}/${loadout.outfit}/${zone}`;
            if (!world && !dirty && mode === lastMode && appearance === lastAppearance && b === lastBattle
                && (!tickChanged && b || !b && (mode === 'between' || reduced.matches || now - lastFrame < 40))) { return; }
            lastFrame = now; const c = PALETTES[zone];
            const nextWorld = world ? world.definition.id : `${zone}:${b?.boss ?? false}:${!!b}`;
            if (nextWorld !== worldKey) {
                hero.resetMotion();
                nameplates.forEach(label => label.remove()); nameplates.clear();
                disposeWorld?.();
                if (world) {
                    const worldKit = createSceneKit(worldTextures?.maps);
                    worldScenery = buildExplorableWorld(worldKit, environment, world.definition, world.facts);
                    const scenery = worldScenery;
                    disposeWorld = () => { scenery.dispose(); worldKit.dispose(); };
                } else { worldScenery = null; disposeWorld = buildWorld(k, environment, zone, b); }
                cameraReady = false; worldKey = nextWorld;
                scene.background = new Color(c.sky); scene.fog = new Fog(c.haze, 42, 95);
            } else if (world && drawnFacts !== world.facts) {
                worldScenery?.setFacts(world.facts);
            }
            // A confirmed input batch replaces the snapshot, not the encounter or camera.
            if (!!b !== !!lastBattle || b && lastBattle && b.tick < lastTick) {
                hero.resetMotion();
                clearActors(); lastHp = b?.player.hp ?? 0;
            }
            const portrait = !world && mode !== 'battle', mobile = width < 600, compact = mobile || height < 400, aspect = width / height;
            const room = world?.definition.landscape.vista === 'room';
            const horizontal = room ? (mobile ? 20 : Math.max(30, aspect * (height < 400 ? 19 : 25))) : world ? (mobile ? WORLD_CAMERA.mobileWidth : Math.max(WORLD_CAMERA.minimumWidth, aspect * (height < 400 ? WORLD_CAMERA.shortSpan : WORLD_CAMERA.tallSpan))) * (world.definition.safe && !b ? WORLD_CAMERA.settlementScale : 1)
                : portrait ? mobile ? 13 : 28 : mobile ? 18.5 : Math.max(27, aspect * (height < 400 ? 14 : 23));
            const pan = Math.max(0, RULES.arena - horizontal / 2 + .5);
            const desiredX = world ? world.location.position.x * (room ? .4 : 1) : b ? compact ? b.player.x * .62 : Math.max(-pan, Math.min(pan, b.player.x * .62)) : mobile ? 0 : 5.5;
            const desiredZ = world ? room ? world.location.position.y * .4 - 1 : world.location.position.y - WORLD_CAMERA.lead : b ? b.player.y * (compact ? .62 : .2) - .4 : mobile ? -4.2 : -11.8;
            if (world && Math.hypot(worldX - world.location.position.x, worldY - world.location.position.y) > 8) { cameraReady = false; }
            const cameraSettled = Math.abs(target.x - desiredX) + Math.abs(target.z - desiredZ) < .015;
            const peopleMoved = world && worldScenery?.setPeople(world.people, now);
            const progressChanged = world && worldScenery?.setProgress(world.completedSegments, world.objects);
            const npcChanged = world && worldScenery?.animate(world.location.position, now, reduced.matches, inView);
            if (world && !dirty && cameraReady && cameraSettled && appearance === lastAppearance && b === lastBattle && !tickChanged
                && worldX === world.location.position.x && worldY === world.location.position.y
                && worldFacing === world.location.facing && drawnFacts === world.facts && !npcChanged && !peopleMoved && !progressChanged && !hero.animating) { return; }
            if (!cameraReady || reduced.matches) { target.set(desiredX, 0, desiredZ); cameraReady = true; }
            else { target.x += (desiredX - target.x) * .14; target.z += (desiredZ - target.z) * .14; }
            camera.left = -horizontal / 2; camera.right = horizontal / 2; camera.top = horizontal / aspect / 2; camera.bottom = -camera.top;
            const bearing = portrait ? 0 : CAMERA_EIGHTH_TURNS * Math.PI / 4;
            const cameraDistance = world ? WORLD_CAMERA.distance : 25;
            camera.position.set(target.x + Math.sin(bearing) * cameraDistance, world ? WORLD_CAMERA.height : 28, target.z + Math.cos(bearing) * cameraDistance); camera.lookAt(target.x, 0, target.z); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
            if (world) { worldScenery?.setEncounterActive(!!b); worldScenery?.update(world.location.position, bearing); }
            nameplates.forEach(label => { label.hidden = true; });
            if (world && !b) {
                for (const object of world.definition.objects) {
                    if (object.kind !== 'reward' || !world.objects.has(object.id)) { continue; }
                    const id = `reward/${object.id}`, p = world.definition.anchors[object.anchor];
                    let label = nameplates.get(id);
                    if (!label) { label = document.createElement('span'); label.className = 'exp-person-name'; label.textContent = `◇ ${COMBAT_COPY.cache}`; labels.append(label); nameplates.set(id, label); }
                    projection.set(p.x, 1.4, p.y).project(camera);
                    const x = Math.max(65, Math.min(width - 65, (projection.x * .5 + .5) * width));
                    const y = Math.max(105, Math.min(height - 145, (-projection.y * .5 + .5) * height));
                    label.hidden = false; label.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`;
                }
            }
            const speakers = new Set(world && !b ? [
                ...reachablePersonInteractions(world.definition, world.location.position, world.facts, world.people),
                ...parleyInteractions(world.definition.id, world.location.position, world.facts),
            ].map(item => item.target.id) : []);
            for (const person of [...worldScenery?.people ?? [], ...worldScenery?.parleyPeople ?? []]) {
                if (b || !world || Math.hypot(person.position.x - world.location.position.x, person.position.y - world.location.position.y) > 10) { continue; }
                let label = nameplates.get(person.id);
                if (!label) { label = document.createElement('span'); label.className = 'exp-person-name'; label.textContent = participantName(person.id); labels.append(label); nameplates.set(person.id, label); }
                label.textContent = speakers.has(person.id) ? `${participantName(person.id)} · ${WORLD_COPY.actions.talk}` : participantName(person.id);
                projection.set(person.position.x, 2.9 + person.root.position.y, person.position.y).project(camera);
                const x = (projection.x * .5 + .5) * width, y = (-projection.y * .5 + .5) * height;
                label.hidden = x < 30 || x > width - 30 || y < 20 || y > height - 20;
                label.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`;
            }
            if (options.world) {
                sun.position.set(target.x - 12, 25, target.z + 13); sun.target.position.set(target.x, 0, target.z);
                sun.target.updateMatrixWorld();
            }
            const explorer = world ? { ...world.location.position, facing: world.location.facing, dashTime: 0, swing: 0, shield: 0, guard: 0, resonance: 0 } : null;
            hero.update(b?.player ?? explorer, loadout.weapon, loadout.outfit, time, now / 1000, reduced.matches, portrait, !!b?.effects.some(e => e.kind === 'resonance'));
            for (const e of b?.enemies ?? []) {
                let entry = enemies.get(e.id);
                if (!entry) {
                    const marker = document.createElement('i'); marker.className = isBoss(e.kind) ? 'exp-threat is-boss' : 'exp-threat'; labels.append(marker);
                    entry = { actor: createEnemyActor(k, actors, e.kind, c), hp: e.hp, death: null, marker }; enemies.set(e.id, entry);
                }
                if (entry.hp > e.hp && tickChanged) { label(entry.hp - e.hp, e.x, e.y, b!.tick); }
                entry.hp = e.hp; entry.actor.update(e, b!.tick, reduced.matches, !!world); entry.actor.bar.quaternion.copy(camera.quaternion);
                projection.set(e.x, 1.2, e.y).project(camera);
                const sx = (projection.x * .5 + .5) * width, sy = (-projection.y * .5 + .5) * height;
                const marginX = Math.min(18, width / 2), top = Math.min(mobile ? 132 : 95, height * .3), bottom = Math.max(top, height - Math.min(130, height * .3));
                const mx = Math.max(marginX, Math.min(width - marginX, sx)), my = Math.max(top, Math.min(bottom, sy));
                entry.marker.hidden = Math.abs(sx - mx) + Math.abs(sy - my) < 10;
                entry.marker.style.transform = `translate(${mx}px,${my}px) rotate(${Math.atan2(sy - my, sx - mx) + Math.PI / 2}rad)`;
            }
            for (const [id, entry] of enemies) {
                if (b?.enemies.some(e => e.id === id)) { continue; }
                if (entry.death === null) { entry.death = b?.tick ?? 0; if (b && entry.hp > 0) { label(entry.hp, entry.actor.root.position.x, entry.actor.root.position.z, b.tick); } }
                const t = ((b?.tick ?? 0) - entry.death) / 12; entry.actor.bar.visible = false; entry.marker.hidden = true; entry.actor.root.scale.setScalar(Math.max(0, 1 - t));
                if (t >= 1 || !b || reduced.matches) { actors.remove(entry.actor.root); entry.marker.remove(); enemies.delete(id); }
            }
            if (b && tickChanged) { if (lastHp !== b.player.hp) { label(lastHp - b.player.hp, b.player.x, b.player.y, b.tick, lastHp > b.player.hp); } lastHp = b.player.hp; }
            const segment = world && (world.engagement ?? nextEncounter(world.definition.id, world.facts, world.completedSegments));
            fx.update(b, reduced.matches, segment ? COURTYARD_ENCOUNTERS[segment].bounds : undefined);
            const wardHit = b?.effects.filter(e => e.kind === 'ward-hit').at(-1);
            ward.update(b?.player ?? null, wardHit ? Math.max(0, (wardHit.life - 5) / 10) : 0);
            status.update(b, camera, width, height);
            for (let i = floaters.length - 1; i >= 0; i--) {
                const f = floaters[i], age = ((b?.tick ?? 0) - f.born) / 27;
                if (age >= 1 || !b) { f.element.remove(); floaters.splice(i, 1); continue; }
                projection.copy(f.position); projection.y += reduced.matches ? 0 : age * .9; projection.project(camera);
                f.element.style.transform = `translate(${(projection.x * .5 + .5) * width}px,${(-projection.y * .5 + .5) * height}px)`;
                f.element.style.opacity = String(Math.min(1, (1 - age) * 3));
            }
            renderer.render(scene, camera); draws++; submitMs += performance.now() - started;
            if (world && shownWorld !== world.definition.id) { shownWorld = world.definition.id; options.sceneReady?.(shownWorld); }
            dirty = false; lastMode = mode; lastAppearance = appearance; lastBattle = b; lastTick = b?.tick ?? -1;
            if (world) { worldX = world.location.position.x; worldY = world.location.position.y; worldFacing = world.location.facing; drawnFacts = world.facts; }
        },
        invalidate() { dirty = true; options.invalidate?.(); },
        retryArtwork() { worldTextures?.retry(); },
        stats() { return { draws, submitMs, calls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
            geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures }; },
        dispose() {
            disposed = true; observer.disconnect(); renderer.domElement.removeEventListener('webglcontextlost', contextLost);
            clearActors(); hero.dispose(); status.dispose(); ward.dispose(); disposeWorld?.(); worldTextures?.dispose(); sun.shadow.dispose(); k.dispose(); scene.clear(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); labels.remove();
        },
    };
}
