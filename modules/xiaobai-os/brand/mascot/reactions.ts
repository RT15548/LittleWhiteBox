import type { Group } from 'three';

export type MascotReaction = 'watch' | 'careful' | 'happy' | 'sad';

/** Non-verbal reactions; shapes and colours remain in the character's mother model. */
export function createMascotReactions(mascot: Group) {
    const home = mascot.position.clone(), scale = mascot.scale.clone();
    function rest() {
        mascot.position.copy(home); mascot.scale.copy(scale); mascot.rotation.set(0, 0, 0);
    }
    return {
        rest,
        pose(reaction: MascotReaction, progress: number, look: number) {
            rest();
            const t = Math.max(0, Math.min(1, progress));
            mascot.rotation.y = Math.max(-0.45, Math.min(0.45, look));
            if (reaction === 'watch') { mascot.rotation.x = -0.075; }
            if (reaction === 'careful') {
                mascot.rotation.z = -0.07; mascot.scale.y *= 0.95; mascot.position.y -= 0.015;
            }
            if (reaction === 'happy') {
                const hop = Math.sin(t * Math.PI);
                mascot.position.y += hop * 0.14;
                mascot.rotation.z = Math.sin(t * Math.PI * 2) * 0.08 * (1 - t);
            }
            if (reaction === 'sad') {
                mascot.rotation.x = 0.13; mascot.scale.y *= 0.91; mascot.position.y -= 0.035;
            }
        },
    };
}
