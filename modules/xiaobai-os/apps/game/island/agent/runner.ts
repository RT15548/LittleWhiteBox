import type { createSceneWork } from '../scene-work.js';
import { fail } from '../fault.js';
import { person } from '../validation.js';
import { buildGmPrompt, gmSceneMessage } from './prompt.js';
import { TOOLS } from './tool-contract.js';
import { knowledgeExecutor, type MemoryOptions } from './knowledge-tools.js';
import { runIslandToolLoop, type IslandAgentOptions } from './tool-loop.js';

export async function runIslandGm(work: ReturnType<typeof createSceneWork>, options: IslandAgentOptions & MemoryOptions) {
    const scope = work.scope();
    const knowledge = knowledgeExecutor(work, scope.journey, options);
    const initial = {
        scope: { clock: scope.clock, anchor: scope.anchor, actors: scope.actors, audience: scope.audience, mode: scope.mode },
        ...knowledge.initial, recent: work.recent(), due: work.due(), decisions: work.decisions(),
    };
    let changed = false;
    async function execute(name: string, args: Record<string, unknown>) {
        switch (name) {
            case 'Act': {
                const actor = person(args.actor); if (actor === 'player') { fail('authority'); }
                const result = work.act(actor, args.operation as Parameters<typeof work.act>[1]); changed = true; return result;
            }
            default: return knowledge.execute(name, args);
        }
    }
    await runIslandToolLoop({ ...options, prompt: buildGmPrompt(scope.actors, work.playerIdentity()), tools: TOOLS, initial, formatInitial: gmSceneMessage, execute,
        complete: () => changed && !work.due().length });
}
