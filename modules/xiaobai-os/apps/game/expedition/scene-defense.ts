import { Color, Mesh, ShaderMaterial, type Group } from 'three';
import type { SceneKit } from './scene-kit.js';
import type { Player, Weapon } from './types.js';
import { DEFENSE_COLORS as C } from './visuals.js';

/** A held shield is distinct from the full-body, consumable ward shell. Resources belong to the scene kit. */
export function createGuardShield(k: SceneKit, body: Group) {
    const arm = k.group(body), shield = k.group(arm);
    const outline: [number, number][] = [[0, .35], [.16, .32], [.26, .22], [.25, -.02], [.19, -.18], [.09, -.29], [0, -.34], [-.09, -.29], [-.19, -.18], [-.25, -.02], [-.26, .22], [-.16, .32]];
    const rim = k.shape(shield, outline, C.block, [0, 0, 0], .055);
    const face = k.shape(shield, outline, C.enamel, [0, 0, .057], .025); face.scale.set(.87, .87, 1);
    const back = k.shape(shield, outline, C.enamel, [0, 0, -.018]); back.scale.set(.87, .87, 1);
    // A narrow crest, not an emissive cross; both sides remain readable as the hero turns.
    for (const z of [-.025, .09]) {
        k.shape(shield, [[0, .24], [.08, .12], [.045, -.07], [0, -.2], [-.045, -.07], [-.08, .12]], C.silver, [0, 0, z]);
        k.mesh(shield, 'rock', C.block, [.035, .06, .015], [0, .075, z + Math.sign(z) * .014], false, 1, true);
    }
    let raised = 0, lastTime = -1;
    arm.visible = false;
    return { update(weapon: Weapon, blocking: boolean, perfect: boolean, time: number, reduced: boolean) {
        const target = blocking ? 1 : 0, delta = Math.max(0, Math.min(4, time - lastTime));
        raised = reduced || lastTime < 0 || time < lastTime ? target : raised + (target - raised) * (1 - Math.exp(-delta * .85)); lastTime = time;
        arm.visible = weapon === 'blade' || blocking || raised > .04;
        arm.position.set(-.4 + raised * .12, -.1 + raised * .3, .17 + raised * .25);
        arm.rotation.set(.12 - raised * .22, .15 - raised * .3, -.16 + raised * .22);
        shield.scale.setScalar(.94 + raised * .07);
        rim.material = k.material(perfect ? C.parry : weapon === 'blade' ? C.block : C.ward, false, 1, true);
        face.material = k.material(blocking ? '#617f99' : C.enamel);
    } };
}

export function createWardShell(k: SceneKit, parent: Group) {
    const root = k.group(parent);
    // Fresnel falloff makes a continuous glass-like shell, without two thick hoops hiding the hero.
    const material = new ShaderMaterial({ transparent: true, depthWrite: false,
        uniforms: { tint: { value: new Color(C.ward) }, impact: { value: 0 } },
        vertexShader: `varying vec3 surfaceNormal; varying vec3 viewDirection;
            void main() { vec4 p = modelViewMatrix * vec4(position, 1.0); surfaceNormal = normalMatrix * normal;
                viewDirection = -p.xyz; gl_Position = projectionMatrix * p; }`,
        fragmentShader: `uniform vec3 tint; uniform float impact; varying vec3 surfaceNormal; varying vec3 viewDirection;
            void main() { float rim = pow(1.0 - abs(dot(normalize(surfaceNormal), normalize(viewDirection))), 2.2);
                gl_FragColor = vec4(mix(tint, vec3(1.0), rim * .4 + impact * .3), .045 + rim * .65 + impact * .16);
                #include <tonemapping_fragment>
                #include <colorspace_fragment>
            }`,
    });
    const shell = new Mesh(k.geometries.sphere, material); shell.scale.set(1.12, 1.4, 1.12); shell.position.y = 1.3; root.add(shell);
    root.visible = false;
    return { update(p: Player | null, impact: number) {
        root.visible = !!p && p.ward > 0;
        if (!p || !root.visible) { return; }
        root.position.set(p.x, 0, p.y);
        // Full absorption must look like a hit on the shell, not a wound on the traveler.
        material.uniforms.impact.value = impact;
        root.scale.setScalar(1 + impact * .035);
    }, dispose() { material.dispose(); root.removeFromParent(); } };
}
