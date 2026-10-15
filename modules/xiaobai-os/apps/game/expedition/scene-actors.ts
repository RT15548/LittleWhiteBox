import { Mesh, type Group, type Material } from 'three';
import { createTraveler } from './scene-traveler.js';
import type { Traveler } from './campaign/traveler.js';
import { ENEMIES, isBoss } from './content.js';
import type { Enemy, EnemyKind, Outfit, Player, Weapon } from './types.js';
import type { SceneKit } from './scene-kit.js';
import type { Palette } from './visuals.js';
import { dressHero } from './scene-outfits.js';
import { sculptBoss } from './scene-bosses.js';
import { createGuardShield } from './scene-defense.js';
import { createGrimoire } from './scene-grimoire.js';
import { createTravelerGait } from './traveler-gait.js';
import { wardenCarriesShield } from './content/combat-policy.js';
export type HeroPose = Pick<Player, 'x' | 'y' | 'facing' | 'dashTime' | 'swing' | 'shield' | 'guard' | 'resonance'>;

function addBow(k: SceneKit, parent: Group, scale = 1) {
    const bow = k.group(parent); bow.scale.setScalar(scale);
    k.shape(bow, [[.02, -.44], [.11, -.41], [.27, -.2], [.29, .12], [.18, .42], [.04, .51], [.1, .28], [.14, 0], [.08, -.25]], '#ceac6e', [0, 0, .06]);
    k.mesh(bow, 'box', '#f5f3dc', [.012, .94, .015], [.04, .03, .07]);
    k.mesh(bow, 'box', '#705444', [.09, .18, .09], [.12, 0, .06]);
}

export function createHero(k: SceneKit, parent: Group, gender: Traveler['gender']) {
    const root = k.group(parent), traveler = createTraveler(k, root, gender), body = traveler.body;
    const shadow = k.ring(root, '#193f49', .6, 0, 0, .14, true);
    const equipment = k.group(body), hand = traveler.hand, clothing = k.group(equipment);
    const guardShield = createGuardShield(k, equipment);
    const gait = createTravelerGait();
    let grimoire: ReturnType<typeof createGrimoire> | null = null;
    let motionTime = -1, facing = Math.PI / 2;
    let wardrobe: ReturnType<typeof dressHero> | null = null, weapon: Weapon | null = null, outfit: Outfit | null = null;
    function equip(nextWeapon: Weapon, nextOutfit: Outfit) {
        if (nextWeapon === weapon && nextOutfit === outfit) { return; }
        weapon = nextWeapon; outfit = nextOutfit; clothing.clear(); hand.clear(); grimoire = null; wardrobe = dressHero(k, clothing, outfit);
        traveler.dress(outfit);
        if (weapon === 'blade') {
            k.mesh(hand, 'cylinder', '#624d42', [.035, .28, .035], [0, -.08, .06]);
            k.mesh(hand, 'box', '#d4b470', [.32, .05, .11], [0, .07, .06], false, 1, true);
            k.shape(hand, [[-.07, .1], [.07, .1], [.07, .65], [0, .83], [-.07, .65]], '#f5f8ef', [0, 0, .07], .018);
            k.shape(hand, [[0, .1], [.07, .1], [.07, .65], [0, .83]], '#9cc6ce', [0, 0, .094]);
        } else if (weapon === 'bow') {
            addBow(k, hand);
        } else if (weapon === 'staff') {
            k.mesh(hand, 'cylinder', '#796889', [.035, 1.12, .035], [0, .18, .04]);
            k.mesh(hand, 'torus', '#d8bc80', [.19, .24, .18], [0, .85, .04], false, 1, true);
            k.mesh(hand, 'rock', '#b9ecff', [.11, .18, .1], [0, .85, .04]);
        } else if (weapon === 'daggers') {
            for (const side of [-1, 1]) { const blade = k.group(hand, [side < 0 ? -.58 : 0, 0, 0]); k.mesh(blade, 'box', '#974953', [.07, .2, .07]); k.shape(blade, [[-.045, .1], [.05, .1], [.035, .34], [0, .47], [-.06, .27]], '#dce9ed', [0, 0, .03]); }
        } else if (weapon === 'grimoire') {
            grimoire = createGrimoire(k, hand);
        } else if (weapon === 'cannon') {
            const barrel = k.group(hand, [.02, .08, .17]); barrel.rotation.x = Math.PI / 2;
            k.mesh(barrel, 'cylinder', '#586e77', [.12, .55, .12], [0, .1, 0], false, 1, true);
            k.mesh(barrel, 'torus', '#d2a96c', [.15, .15, .15], [0, .39, 0], false, 1, true).rotation.x = Math.PI / 2;
            k.mesh(hand, 'box', '#906749', [.22, .16, .2], [0, -.1, .13]);
        }
    }
    return { root, resetMotion: gait.reset,
        get animating() { return gait.active; },
        update(p: HeroPose | null, nextWeapon: Weapon, nextOutfit: Outfit, time: number, seconds: number, reduced: boolean, portrait: boolean, casting = false) {
            equip(nextWeapon, nextOutfit);
            guardShield.update(nextWeapon, !!p?.shield, !!p?.guard, time, reduced);
            const blend = reduced || motionTime < 0 || time < motionTime ? 1 : 1 - Math.exp(-Math.min(4, time - motionTime) * .65); motionTime = time;
            const desiredFacing = portrait ? Math.PI / 2 + .23 : p?.facing ?? Math.PI / 2;
            facing += Math.atan2(Math.sin(desiredFacing - facing), Math.cos(desiredFacing - facing)) * blend;
            const motion = gait.update(portrait ? null : p, seconds, reduced), dash = !!p?.dashTime;
            root.position.set(p?.x ?? 0, portrait ? .3 : 0, p?.y ?? -8);
            root.scale.setScalar(portrait ? 1.65 : 1);
            traveler.pose(facing, motion.stride, motion.lift, dash, reduced, !!p?.swing || casting);
            wardrobe!.cape.rotation.x = !reduced ? -.21 - motion.amount * .44 - Math.sin(time * .15) * .12 : -.15;
            wardrobe!.animate(time, reduced);
            const swing = p?.swing && !reduced ? Math.sin(p.swing / (nextWeapon === 'cannon' ? 16 : 9) * Math.PI) : 0;
            hand.rotation.z += ((casting ? -.3 : -.2 - swing * 1.3) - hand.rotation.z) * blend;
            hand.rotation.x += ((casting ? -.25 : .1 + swing * .6) - hand.rotation.x) * blend;
            if (grimoire) {
                grimoire.update(!!p?.resonance, casting, time, reduced);
            }
            shadow.scale.set(.6 + (dash ? .25 : 0), .6, 1);
        },
        dispose() { traveler.dispose(); root.removeFromParent(); },
    };
}

/** Each enemy has a recognisable silhouette and articulated anticipation, independent of its collision body. */
export function createEnemyActor(k: SceneKit, parent: Group, kind: EnemyKind, c: Palette) {
    const { mesh, group } = k, root = group(parent), body = group(root), weapon = group(body), head = group(body), limbs: Group[] = [];
    const boss = isBoss(kind), radius = ENEMIES[kind].radius;
    let armorShield: Group | null = null;
    k.ring(root, '#1d3540', radius * 1.15, 0, 0, .16, true);
    const gold = '#cfad70', eye = '#fff0b0', armor = c.dark;
    function leg(x: number, z: number, height: number) {
        const g = group(body, [x, height, z]); mesh(g, 'box', armor, [.32, height, .42], [0, -height / 2, 0]);
        mesh(g, 'box', c.stone, [.38, .22, .55], [0, -height + .11, .1]); limbs.push(g);
    }
    function sword(parent: Group, length: number, color = '#d9e8df') {
        mesh(parent, 'box', gold, [.55, .1, .24], [0, .25, 0], false, 1, true);
        mesh(parent, 'box', armor, [.11, .4, .11]);
        mesh(parent, 'box', color, [.2, length, .13], [0, length / 2 + .35, 0], false, 1, true);
        mesh(parent, 'cone', color, [.15, .4, .13], [0, length + .5, 0]);
    }
    if (kind === 'charger') {
        mesh(body, 'rock', c.stone, [.58, .58, .9], [0, .7, 0]);
        mesh(head, 'rock', armor, [.43, .45, .46], [0, .73, .7]);
        for (const x of [-.27, .27]) {
            const horn = mesh(head, 'cone', gold, [.15, .7, .15], [x, 1.15, .9]); horn.rotation.x = .55;
            mesh(head, 'sphere', eye, [.05, .04, .06], [x, .82, 1.02], true);
            leg(x, -.42, .45); leg(x, .45, .45);
        }
        for (let i = 0; i < 3; i++) { mesh(body, 'cone', c.accent, [.2, .45, .25], [0, 1.25, -.5 + i * .4]); }
    } else if (kind === 'weaver') {
        mesh(body, 'cone', '#63689d', [1.45, 3, 1.2], [0, 2.1, 0]);
        mesh(body, 'cone', c.light, [.8, 1.8, .65], [0, 2.65, .3]);
        mesh(head, 'sphere', armor, [.6, .72, .45], [0, 4, 0]);
        const moon = mesh(head, 'crescent', gold, [1.35, 1.35, .8], [0, 4.35, -.3], false, 1, true); moon.rotation.z = .87;
        for (const x of [-.23, .23]) { mesh(head, 'sphere', '#e4e3ff', [.09, .055, .05], [x, 4.08, .45], true); }
        for (const side of [-1, 1]) {
            const arm = group(body, [side * .8, 3.3, 0]); arm.rotation.z = side * .65;
            mesh(arm, 'cone', '#757caf', [.5, 1.8, .45], [0, -.65, 0]);
            mesh(arm, 'sphere', c.light, [.22, .25, .22], [0, -1.45, .1]); limbs.push(arm);
        }
        for (let i = 0; i < 5; i++) {
            const t = i / 5 * Math.PI * 2;
            const star = mesh(weapon, 'rock', c.accent, [.2, .34, .2], [Math.cos(t) * 1.95, 3.3 + Math.sin(t) * 1.1, -.3]); star.rotation.z = t;
        }
    } else if (kind === 'king') {
        leg(-.5, 0, .8); leg(.5, 0, .8);
        mesh(body, 'cone', '#7c4550', [1.8, 3.6, .8], [0, 2, -.3]);
        mesh(body, 'box', armor, [1.6, 1.7, 1], [0, 2.1, 0]);
        mesh(body, 'rock', gold, [.5, .9, .3], [0, 2.25, .62]);
        for (const side of [-1, 1]) { mesh(body, 'rock', c.stone, [.85, .5, .7], [side * .95, 2.95, 0]); }
        mesh(head, 'sphere', armor, [.65, .8, .5], [0, 3.6, 0]);
        mesh(head, 'box', eye, [.48, .08, .09], [0, 3.7, .51], true);
        mesh(head, 'torus', gold, [.86, .86, .86], [0, 4.6, 0], false, 1, true).rotation.x = Math.PI / 2;
        for (let i = 0; i < 7; i++) { const t = i * Math.PI * 2 / 7; mesh(head, 'cone', gold, [.17, .85, .17], [Math.cos(t) * .78, 4.85, Math.sin(t) * .78]); }
        weapon.position.set(1.55, 1.35, .2); weapon.rotation.z = -.3; sword(weapon, 3.4, '#f6dc9f');
        mesh(body, 'box', c.stone, [.5, 1.2, .5], [-1.15, 2, .1]);
    } else if (kind === 'warden' || kind === 'keeper') {
        if (kind === 'keeper') { body.scale.setScalar(.72); }
        leg(-.65, .05, .85); leg(.65, .05, .85);
        mesh(body, 'cylinder', armor, [1.1, 1.85, .8], [0, 1.9, 0]);
        mesh(body, 'box', c.stone, [1.1, 1.45, .35], [0, 2, .72]);
        mesh(body, 'rock', c.accent, [.28, .4, .14], [0, 2.1, .94]);
        for (const side of [-1, 1]) {
            mesh(body, 'rock', c.stone, [.83, .6, .7], [side * 1.03, 2.7, 0]);
            mesh(body, 'box', gold, [.7, .1, .8], [side * 1.08, 2.45, .1], false, 1, true);
        }
        mesh(head, 'sphere', c.stone, [.73, .77, .63], [0, 3.2, 0]);
        mesh(head, 'box', armor, [1.12, .33, .2], [0, 3.22, .54]);
        mesh(head, 'box', eye, [.74, .095, .05], [0, 3.22, .66], true);
        mesh(head, 'cone', c.foliage, [.27, 1.1, .5], [0, 4, -.2]);
        const shield = group(body, [-1.32, 1.5, .6]);
        armorShield = shield;
        mesh(shield, 'box', armor, [1.2, 1.8, .25]); mesh(shield, 'box', gold, [1, 1.58, .28]); mesh(shield, 'box', c.foliage, [.85, 1.42, .31]);
        mesh(shield, 'rock', c.light, [.28, .4, .1], [0, .1, .22]);
        weapon.position.set(1.5, 1.8, .25);
        mesh(weapon, 'cylinder', '#766450', [.1, 2.5, .1]); mesh(weapon, 'box', armor, [1.25, .9, .9], [0, 1.4, 0]);
        mesh(weapon, 'box', gold, [.24, .96, .94], [0, 1.4, 0], false, 1, true);
        mesh(weapon, 'box', c.light, [.22, .77, .74], [.65, 1.4, 0]);
    } else if (isBoss(kind)) {
        sculptBoss(k, body, head, weapon, kind, c);
    } else if (kind === 'wisp') {
        mesh(body, 'rock', c.accent, [.35, .6, .35], [0, 1, 0]);
        mesh(head, 'torus', gold, [.48, .6, .4], [0, 1, 0]);
        mesh(head, 'sphere', '#f7f5e8', [.12, .13, .1], [0, 1.05, .31], true);
        mesh(body, 'cone', c.light, [.16, .6, .16], [0, .35, 0]).rotation.z = Math.PI;
    } else if (kind === 'stalker') {
        mesh(body, 'sphere', c.dark, [.4, .35, .65], [0, .55, 0]); mesh(head, 'rock', c.foliage, [.33, .38, .32], [0, .75, .5]);
        for (const side of [-1, 1]) { leg(side * .27, -.25, .35); mesh(head, 'cone', gold, [.09, .35, .09], [side * .21, 1.09, .42]); mesh(head, 'sphere', eye, [.05, .04, .035], [side * .15, .8, .77], true); mesh(weapon, 'cone', c.light, [.09, .38, .08], [side * .37, .3, .5]).rotation.x = Math.PI / 2; }
    } else if (kind === 'bomber') {
        leg(-.22, 0, .45); leg(.22, 0, .45); mesh(body, 'sphere', '#85654c', [.5, .6, .4], [0, .95, 0]);
        mesh(head, 'sphere', c.stone, [.35, .38, .31], [0, 1.62, 0]);
        mesh(head, 'box', c.dark, [.63, .15, .08], [0, 1.69, .3]);
        mesh(body, 'cylinder', '#ac7b54', [.3, .75, .3], [0, 1.05, -.4]);
        mesh(weapon, 'sphere', '#404c57', [.25, .25, .25], [.56, 1.1, .18]); mesh(weapon, 'cone', '#ffca88', [.07, .3, .07], [.56, 1.41, .18]);
    } else {
        const priest = kind === 'priest', guard = kind === 'guard';
        if (priest) { mesh(body, 'cone', '#767da5', [.55, 1.5, .5], [0, .95, 0]); }
        else { leg(-.22, 0, .5); leg(.22, 0, .5); mesh(body, 'box', armor, [.72, .85, .52], [0, .92, 0]); }
        mesh(body, 'box', c.stone, [.5, .55, .15], [0, 1, .3]);
        mesh(head, 'sphere', c.stone, [.43, .45, .38], [0, 1.63, 0]);
        mesh(head, 'box', armor, [.68, .17, .12], [0, 1.65, .32]); mesh(head, 'box', eye, [.39, .045, .05], [0, 1.65, .39], true);
        if (priest) {
            mesh(head, 'cone', '#626a9c', [.55, .8, .5], [0, 2.14, 0]);
            weapon.position.set(.52, 1, .1); mesh(weapon, 'cylinder', gold, [.04, 1.6, .04]);
            mesh(weapon, 'rock', '#d1dcff', [.22, .32, .22], [0, .95, 0]);
        } else {
            mesh(head, 'box', c.foliage, [.12, .38, .55], [0, 2, -.07]);
            for (const side of [-1, 1]) { mesh(body, 'rock', c.stone, [.28, .23, .3], [side * .45, 1.22, 0]); }
            weapon.position.set(.54, 1, .2);
            if (kind === 'archer') { addBow(k, weapon, 1.3); }
            else { weapon.rotation.z = -.3; sword(weapon, .75); }
            if (guard) { mesh(body, 'box', gold, [.85, 1.1, .18], [-.4, .95, .46]); mesh(body, 'box', c.foliage, [.72, .92, .22], [-.4, .95, .47]); }
        }
    }
    const bar = group(root, [0, boss ? 5.5 : kind === 'charger' ? 1.7 : 2.45, 0]);
    mesh(bar, 'box', '#233f48', [1.06, .105, .02], [0, 0, 0], true);
    const fill = mesh(bar, 'box', '#f0ba83', [1, .055, .03], [0, 0, .02], true);
    const originals: { mesh: Mesh; material: Material | Material[] }[] = [];
    body.traverse(o => { if (o instanceof Mesh) { originals.push({ mesh: o, material: o.material }); } });
    let previousWindup = 0, struckAt = -100, previousX = 0, previousY = 0;
    const baseWeaponZ = weapon.rotation.z;
    return { root, bar,
        update(e: Enemy, tick: number, reduced: boolean, chapter = false) {
            const moving = Math.abs(e.x - previousX) + Math.abs(e.y - previousY) > .005;
            previousX = e.x; previousY = e.y;
            if (previousWindup && !e.windup) { struckAt = tick; } previousWindup = e.windup;
            const anticipation = e.windup ? 1 - e.windup / ENEMIES[e.kind].windup : 0, strike = Math.max(0, 1 - (tick - struckAt) / 10);
            root.position.set(e.x, 0, e.y); body.rotation.y = Math.PI / 2 - e.angle;
            body.position.y = !reduced ? (kind === 'weaver' || kind === 'priest' ? .13 + Math.sin(tick * .055) * .1 : moving ? Math.abs(Math.sin(tick * .3)) * .055 : 0) : 0;
            body.rotation.x = reduced ? 0 : -anticipation * .16 + strike * .2;
            head.rotation.z = !reduced && kind === 'king' ? Math.sin(tick * .035) * .08 : 0;
            weapon.rotation.x = reduced ? 0 : anticipation * -1.3 + strike * 1.4;
            weapon.rotation.z = baseWeaponZ + (reduced ? 0 : anticipation * -.35);
            if (armorShield && chapter) {
                armorShield.visible = kind !== 'warden' || wardenCarriesShield(e.phase);
                armorShield.rotation.x = e.exposed ? -Math.PI / 3 : 0;
            }
            for (let i = 0; i < limbs.length; i++) { limbs[i].rotation.x = !reduced && moving ? Math.sin(tick * .32 + i * Math.PI) * .28 : 0; }
            for (const o of originals) { o.mesh.material = e.marked > 2 && !reduced ? k.material('#fff6dd') : o.material; }
            bar.visible = !boss && e.hp < e.maxHp;
            fill.scale.x = e.hp / e.maxHp; fill.position.x = (e.hp / e.maxHp - 1) * .5;
        },
    };
}
