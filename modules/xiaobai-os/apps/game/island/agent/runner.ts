import type { createSceneWork } from '../scene-work.js';
import { fail } from '../fault.js';
import { person } from '../validation.js';
import { estimateConversationTokens, estimateTokenCount } from '../../../../../agent-core/runtime/context-tokens.js';
import { buildGmPrompt, gmSceneMessage } from './prompt.js';
import { AGENT_POLICY as P } from './policy.js';
import { TOOLS } from './tool-contract.js';
import { knowledgeExecutor, type MemoryOptions } from './knowledge-tools.js';
import { runIslandToolLoop, type IslandAgentOptions } from './tool-loop.js';

type Options = IslandAgentOptions & MemoryOptions;

// What the GM is shown when a scene begins. The context ring measures exactly this, so the two cannot drift apart.
function sceneRequest(work: ReturnType<typeof createSceneWork>, options: MemoryOptions) {
    const scope = work.scope(), knowledge = knowledgeExecutor(work, scope.journey, options);
    const initial = {
        scope: { clock: scope.clock, anchor: scope.anchor, actors: scope.actors, audience: scope.audience, mode: scope.mode },
        ...knowledge.initial, recent: work.recent(), due: work.due(), decisions: work.decisions(),
    };
    return { knowledge, initial, prompt: buildGmPrompt(scope.actors, work.playerIdentity()) };
}

export async function runIslandGm(work: ReturnType<typeof createSceneWork>, options: Options) {
    const { knowledge, initial, prompt } = sceneRequest(work, options);
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
    await runIslandToolLoop({ ...options, prompt, tools: TOOLS, initial, formatInitial: gmSceneMessage, execute,
        complete: () => changed && !work.due().length });
}

/** How much of the GM's input budget the next scene request would use, and what it is made of. */
export async function measureGmContext(work: ReturnType<typeof createSceneWork>, options: Options) {
    const { initial, prompt } = sceneRequest(work, options);
    const session = await options.agent.openSession(await options.agent.loadConfig());
    const used = estimateConversationTokens({ messages: [{ role: 'system', content: prompt }, { role: 'user', content: gmSceneMessage(initial) }],
        tools: TOOLS, providerConfig: session.providerConfig });
    const system = estimateTokenCount(prompt), story = estimateTokenCount(JSON.stringify(initial));
    // Above `trim` the oldest recent entries are left out of the request; above `limit` the request cannot be made.
    return { used, limit: P.inputTokens, trim: P.inputTokens - P.outputTokens, system, story, rules: Math.max(0, used - system - story) };
}
export type GmContextUsage = Awaited<ReturnType<typeof measureGmContext>>;
