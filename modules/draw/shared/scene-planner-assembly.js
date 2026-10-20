// 场景规划请求的"布局 -> 消息模板"纯函数：只依赖布局契约与工具说明标记，不碰宏展开与槽位。
// 输入是各内置块未展开的模板文本，输出是按角色合并后的消息模板；展开与槽位替换由调用方（scene-planner.js）完成。
import { TOOL_PROTOCOL_MARKER } from '../../agent-core/adapters/tool-protocol-marker.js';
import { BUILTIN_BLOCKS, normalizeLayout } from './scene-planner-layout.js';

const SEPARATOR = '\n\n';
const BUILTIN_ROLE_BY_ID = new Map(BUILTIN_BLOCKS.map(block => [block.id, block.role]));

// 标记只能由 tools 块产生：其余文本（含自定义块、预设文案）一律剔除，
// 否则一段恰好含标记的文字会让适配器把协议文本塞进错误的位置。
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

function blockRole(block) {
    return BUILTIN_ROLE_BY_ID.get(block.id) || block.role;
}

/**
 * @param {{ layout?: unknown, builtinTexts?: Record<string, string> }} input
 *   builtinTexts: opening/frame/guide/rules/worldInfo/content/limits 的未展开模板文本
 * @returns {{ legacy: boolean, templates: Array<{ role: 'system'|'user'|'assistant', template: string, blockIds: string[] }> }}
 */
export function planScenePlannerMessages({ layout, builtinTexts } = {}) {
    const texts = builtinTexts && typeof builtinTexts === 'object' ? builtinTexts : {};
    const { layout: normalized } = normalizeLayout(layout);

    const merged = [];
    for (const block of normalized.blocks) {
        const builtin = BUILTIN_ROLE_BY_ID.has(block.id);
        if (!builtin && block.enabled === false) continue;
        const text = blockText(block, texts);
        // 空块整体省略：后端拒绝空内容消息，且空块不能把本该合并的同角色消息隔开。
        if (!text) continue;
        const role = blockRole(block);
        const last = merged[merged.length - 1];
        if (last && last.role === role) {
            last.parts.push(text);
            last.blockIds.push(block.id);
        } else {
            merged.push({ role, parts: [text], blockIds: [block.id] });
        }
    }

    // 没有任何 user 内容时仍补一条空 user：与改造前一致（默认布局永远产出 [system, user]），
    // 非 legacy 时由调用方丢弃空结果。
    if (!merged.some(item => item.role === 'user')) {
        merged.push({ role: 'user', parts: [], blockIds: [] });
    }

    const templates = merged.map(item => ({
        role: item.role,
        template: item.parts.join(SEPARATOR),
        blockIds: item.blockIds,
    }));

    // legacy：恰好 [system, user]，标记（tools 块）在 system 末尾、user 里没有。
    // 此时剥掉末尾标记，请求与改造前的 system + 单条 user 完全一致，旧通道（含后台旧版校验）照常工作。
    const system = templates[0];
    const isLegacyShape = templates.length === 2
        && system.role === 'system'
        && templates[1].role === 'user'
        && system.template.endsWith(TOOL_PROTOCOL_MARKER)
        && !templates[1].template.includes(TOOL_PROTOCOL_MARKER);
    if (!isLegacyShape) return { legacy: false, templates };

    const withoutMarker = system.template === TOOL_PROTOCOL_MARKER
        ? ''
        : system.template.slice(0, system.template.length - TOOL_PROTOCOL_MARKER.length - SEPARATOR.length);
    return {
        legacy: true,
        templates: [{ ...system, template: withoutMarker }, templates[1]],
    };
}
