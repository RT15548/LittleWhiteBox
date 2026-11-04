// Layout -> message templates. Dynamic documents are expanded by scene-planner.js before
// becoming JSON tool results; custom messages keep their roles and relative layout order.
import { TOOL_PROTOCOL_MARKER } from '../../agent-core/adapters/tool-protocol-marker.js';
import { BUILTIN_BLOCKS, projectScenePlannerLayout } from './scene-planner-layout.js';
import { SCENE_PLANNER_ACTION, buildScenePlannerExchange } from './scene-planner-handoff.js';

const SEPARATOR = '\n\n';
const BUILTIN_ROLE_BY_ID = new Map(BUILTIN_BLOCKS.map(block => [block.id, block.role]));

// Only the tools block may place the adapter's protocol instructions.
function removeMarker(text) {
    return String(text ?? '').split(TOOL_PROTOCOL_MARKER).join('');
}

function blockText(block, builtinTexts) {
    if (BUILTIN_ROLE_BY_ID.has(block.id)) {
        if (block.id === 'tools') return TOOL_PROTOCOL_MARKER;
        return removeMarker(builtinTexts[block.id]).trim();
    }
    return removeMarker(block.content).trim();
}

export function planScenePlannerMessages({ layout, builtinTexts } = {}) {
    const texts = builtinTexts && typeof builtinTexts === 'object' ? builtinTexts : {};
    const templates = [];
    function appendBlock(block) {
        const builtin = BUILTIN_ROLE_BY_ID.has(block.id);
        const template = blockText(block, texts);
        if (!template || (!builtin && block.enabled === false)) return;
        const role = BUILTIN_ROLE_BY_ID.get(block.id) || block.role;
        const last = templates.at(-1);
        if (last?.role === role && last.blockIds.length && !last.tool_calls) {
            last.template += SEPARATOR + template;
            last.blockIds.push(block.id);
        } else {
            templates.push({ role, template, blockIds: [block.id] });
        }
    }
    projectScenePlannerLayout(layout).forEach(stage => {
        if (stage.id === 'setup') stage.blocks.filter(block => stage.blockIds.includes(block.id)).forEach(appendBlock);
        else {
            if (stage.id === 'materials') templates.push({ role: 'user', template: SCENE_PLANNER_ACTION, blockIds: [] });
            const document = stage.blockIds.map(id => blockText({ id }, texts)).filter(Boolean).join(SEPARATOR);
            templates.push(...buildScenePlannerExchange(stage.id, document, stage.blockIds).map(item => ({ ...item, stageId: stage.id })));
        }
        stage.customBlocks.forEach(appendBlock);
    });
    templates.push(...buildScenePlannerExchange('approval').map(item => ({ ...item, stageId: 'approval' })));
    return { templates };
}
