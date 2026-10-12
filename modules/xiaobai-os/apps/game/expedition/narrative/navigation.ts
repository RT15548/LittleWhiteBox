import type { CourtyardScene, SceneExit } from '../content/world-types.js';
import { COURTYARD } from '../content/courtyard.js';
import { WORLD_COPY } from '../content/world-copy.js';

/** Present the exact scene-graph route used by movement, including each real exit. */
export function routeContext(from: CourtyardScene, route: readonly SceneExit[] | null) {
    if (!route) { return null; }
    let scene = from;
    return route.map(exit => {
        const step = { from: scene, exit: exit.id, to: exit.to, place: WORLD_COPY.scenes[exit.to], position: COURTYARD[scene].anchors[exit.anchor] };
        scene = exit.to; return step;
    });
}
