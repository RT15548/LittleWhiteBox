import type { createIntentWork, IntentClarification } from '../intent-work.js';
import { CAST } from '../content.js';
import { PERSON_IDS } from '../model.js';
import { BLUEPRINTS, ITEMS, RECIPES } from '../survival-content.js';
import { runIslandToolLoop, type IslandAgentOptions } from './tool-loop.js';
import { knowledgeExecutor, type MemoryOptions } from './knowledge-tools.js';
import { KNOWLEDGE_TOOLS, PLAYER_OPERATION_SCHEMA, tool } from './tool-contract.js';
import { INTENT_PROMPT } from './intent-prompt.js';
import { AGENT_POLICY as P } from './policy.js';

const INTENT_TOOLS = [...KNOWLEDGE_TOOLS,
    tool('ProposeAction', 'Propose one player operation for explicit confirmation. Checks the same authority and physical conditions as actual play. Returns ready:true on acceptance, ending this interpretation. It changes no world state, spends no island time and commits no action. An invalid proposal returns its action error so you can ask for a decision or correct an argument.', { operation: PLAYER_OPERATION_SCHEMA }),
    tool('AskPlayer', 'Return a clarification question or explain an unsupported action, without proposing or performing an operation. Returns ready:true and ends this interpretation. The text is shown directly to the player; write concise Chinese. Use when a meaningful choice is missing or the requested action cannot be represented.', { text: { type: 'string', minLength: 1, maxLength: P.questionCharacters } }),
];

export async function interpretPlayerIntent(work: ReturnType<typeof createIntentWork>, intent: string, options: IslandAgentOptions & MemoryOptions, clarifications: IntentClarification[] = []) {
    const read = knowledgeExecutor(work, work.journey, options);
    await runIslandToolLoop({ ...options, prompt: INTENT_PROMPT, tools: INTENT_TOOLS,
        initial: { intent, clarifications, observations: work.context(), recent: work.recent(),
            people: PERSON_IDS.map(id => ({ id, name: CAST[id].name })), materials: ITEMS, recipes: RECIPES, blueprints: BLUEPRINTS },
        async execute(name, args) {
            if (name === 'ProposeAction') { return work.propose(args.operation); }
            if (name === 'AskPlayer') { return work.ask(args.text); }
            return read(name, args);
        },
        complete: work.done, terminal: work.done,
    });
}
