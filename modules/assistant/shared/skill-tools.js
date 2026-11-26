import { DRAW_SKILL } from '../../draw/assistant/contract.js';
import { CARD_SKILL, FRONTEND_SKILL } from '../../card-workspace/assistant-contract.js';
import { LIVE_PAGE_SKILL } from '../../live-page-inspection/tool-contract.ts';
import { STATE2_SKILL } from '../../variables/state2/skill/contract.js';
import { STATE3_SKILL } from '../../variables/state3/skill/contract.ts';
import { PLANNING_SKILL, SKILL_MANAGEMENT_SKILL, COORDINATION_TOOLS } from '../skills/contract.js';

export const BUILTIN_SKILLS = Object.freeze([DRAW_SKILL, CARD_SKILL, FRONTEND_SKILL, STATE3_SKILL, STATE2_SKILL, LIVE_PAGE_SKILL, PLANNING_SKILL, SKILL_MANAGEMENT_SKILL]);
const skillsById = new Map(BUILTIN_SKILLS.map(skill => [skill.id, skill]));
const skillTools = new Set(BUILTIN_SKILLS.flatMap(skill => skill.tools));
const mainOnlyTools = new Set(Object.values(COORDINATION_TOOLS));

export function isSkillTool(name) { return skillTools.has(name); }

function parseResult(content) {
    try { return JSON.parse(content); } catch { return null; }
}

// Read receipts, not user text or model-written summaries, establish the selection.
// Calls are matched within their assistant group because providers may reuse IDs.
export function loadedSkillIds(messages = [], archivedSkillIds = []) {
    const selected = new Set(archivedSkillIds.filter(id => skillsById.has(id)));
    let calls = new Map();
    for (const message of messages) {
        if (message.role === 'assistant' || message.role === 'user') {
            calls = new Map((message.toolCalls || message.tool_calls || []).map(call => [call.id, call.name || call.function?.name]));
        }
        if (message.role !== 'tool') continue;
        const name = calls.get(message.toolCallId || message.tool_call_id);
        if (name !== 'ReadSkill') continue;
        const result = parseResult(message.content);
        if (result?.ok === true && result.builtin === true && skillsById.has(result.id)) selected.add(result.id);
    }
    return [...selected];
}

/**
 * @template {{ function: { name: string } }} T
 * @param {T[]} definitions
 * @param {string[]} skillIds
 * @param {{ role?: string }} options
 * @returns {T[]}
 */
export function filterSkillTools(definitions, skillIds = [], { role = 'main' } = {}) {
    const enabled = new Set(skillIds.flatMap(id => skillsById.get(id)?.tools || []));
    return definitions.filter(({ function: { name } }) =>
        (!skillTools.has(name) || enabled.has(name)) && (role !== 'delegate' || !mainOnlyTools.has(name)));
}

export function skillCatalogLine(skill) {
    return `- ${skill.title} | ${skill.summary} | ReadSkill id: ${skill.id} | tools: ${skill.tools.join(', ')}`;
}
