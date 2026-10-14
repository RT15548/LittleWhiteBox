import type { createSceneWork } from '../scene-work.js';
import { CAST } from '../content.js';
import { BLUEPRINTS, ITEMS, RECIPES, SURVIVAL } from '../survival-content.js';
import { fail } from '../fault.js';
import { person } from '../validation.js';
import { GM_PROMPT } from './prompt.js';
import { TOOLS } from './tool-contract.js';
import { knowledgeExecutor, type MemoryOptions } from './knowledge-tools.js';
import { runIslandToolLoop, type IslandAgentOptions } from './tool-loop.js';

export async function runIslandGm(work: ReturnType<typeof createSceneWork>, options: IslandAgentOptions & MemoryOptions) {
    const scope = work.scope(), initial = {
        scope: { clock: scope.clock, anchor: scope.anchor, actors: scope.actors, audience: scope.audience, mode: scope.mode },
        cast: scope.actors.map(id => ({ id, ...CAST[id] })), observations: work.context(), recent: work.recent(), due: work.due(),
        materials: ITEMS, recipes: RECIPES, blueprints: BLUEPRINTS, physiology: SURVIVAL,
    };
    const read = knowledgeExecutor(work, scope.journey, options);
    let changed = false;
    async function execute(name: string, args: Record<string, unknown>) {
        switch (name) {
            case 'Act': {
                const actor = person(args.actor); if (actor === 'player') { fail('authority'); }
                const result = work.act(actor, args.operation as Parameters<typeof work.act>[1]); changed = true; return result;
            }
            default: return read(name, args);
        }
    }
    await runIslandToolLoop({ ...options, prompt: GM_PROMPT, tools: TOOLS, initial, execute,
        complete: () => changed && !work.due().length });
}
