import type * as T from 'three';
import type { Activity } from '../model.js';

const thigh = .42, shin = .4, ankle = .065, headY = .69, headRadius = .15;
export const BODY = { thigh, shin, ankle, hipY: thigh + shin + ankle, headY, headRadius,
    stature: thigh + shin + ankle + headY + headRadius, upperArm: .28, forearm: .24 };
export interface Limb { base: T.Group; bend: T.Group; end: T.Group }
export interface SurvivorRig { hips: T.Group; spine: T.Group; head: T.Group; legs: Limb[]; arms: Limb[] }

// Pose changes only the articulated body beneath its stable world anchor.
export function poseSurvivor(rig: SurvivorRig, phase: number, moving: boolean, activity: Activity['kind'] | null, dead: boolean) {
    const { hips, spine, head, legs, arms } = rig;
    hips.position.set(0, BODY.hipY, 0); hips.rotation.set(0, 0, 0); spine.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0);
    for (const limb of [...legs, ...arms]) { limb.base.rotation.set(0, 0, 0); limb.bend.rotation.set(0, 0, 0); limb.end.rotation.set(0, 0, 0); }
    if (dead) {
        hips.position.y = .16; hips.rotation.x = -Math.PI / 2;
        legs.forEach((leg, i) => { leg.base.rotation.z = (i ? -1 : 1) * .07; leg.bend.rotation.x = .08; });
        arms.forEach((arm, i) => { arm.base.rotation.z = (i ? 1 : -1) * .18; arm.bend.rotation.x = -.2; });
        head.rotation.y = .15; return;
    }
    if (moving) {
        legs.forEach((leg, i) => {
            const stride = Math.sin(phase + i * Math.PI); leg.base.rotation.x = stride * .42;
            leg.bend.rotation.x = Math.max(0, -stride) * .5; leg.end.rotation.x = -leg.base.rotation.x - leg.bend.rotation.x;
        });
        arms.forEach((arm, i) => { arm.base.rotation.x = -Math.sin(phase + i * Math.PI) * .26; arm.bend.rotation.x = -.12; });
        if (activity === 'drag') { spine.rotation.x = -.16; arms.forEach(arm => { arm.base.rotation.x = .4; }); }
    } else if (activity === 'rest') {
        hips.position.y = .13; spine.rotation.x = .13;
        const thighAngle = -1.95, shinAngle = -Math.acos((hips.position.y - BODY.thigh * Math.cos(thighAngle) - BODY.ankle) / BODY.shin);
        legs.forEach(leg => { leg.base.rotation.x = thighAngle; leg.bend.rotation.x = shinAngle - thighAngle; leg.end.rotation.x = -shinAngle; });
        arms.forEach(arm => { arm.base.rotation.x = -.45; arm.bend.rotation.x = -.65; });
        head.rotation.x = -.08;
    } else if (activity === 'work' || activity === 'take') {
        hips.position.y = .55; spine.rotation.x = .42; head.rotation.x = .16;
        legs.forEach(leg => { leg.base.rotation.x = -1; leg.bend.rotation.x = 1.9; leg.end.rotation.x = -.9; });
        arms.forEach((arm, i) => { arm.base.rotation.x = -1.15; arm.bend.rotation.x = -.35 + Math.sin(phase * .6 + i) * .08; });
    } else if (activity === 'construct') {
        hips.position.y = BODY.hipY - .05; spine.rotation.x = .3;
        legs.forEach(leg => { leg.base.rotation.x = -.2; leg.bend.rotation.x = .4; leg.end.rotation.x = -.2; });
        arms.forEach((arm, i) => { arm.base.rotation.x = -.8; arm.bend.rotation.x = -.5 + Math.sin(phase * .7 + i) * .15; });
    } else {
        spine.rotation.x = Math.sin(phase * .2) * .008;
        arms.forEach((arm, i) => { arm.base.rotation.z = (i ? 1 : -1) * .07; arm.bend.rotation.x = -.06; });
    }
    if (activity === 'offer') {
        arms[1].base.rotation.set(-1.05, 0, .08); arms[1].bend.rotation.x = -.45;
    }
    // At least one sole stays on the ground; a gait must not float both feet.
    if (activity !== 'rest' || moving) {
        hips.position.y = BODY.ankle + Math.max(...legs.map(leg => BODY.thigh * Math.cos(leg.base.rotation.x)
            + BODY.shin * Math.cos(leg.base.rotation.x + leg.bend.rotation.x)));
    }
}
