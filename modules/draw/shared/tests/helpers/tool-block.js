import { createCustomBlock } from '../../scene-planner-layout.js';

/** 测试里造“附带了工具的自定义消息块”的简写：说明消息默认用 system 角色。 */
export function createToolBlock({ role = 'system', name = '', content = '', code = '', enabled = true } = {}, existingIds = [], random = Math.random) {
    return createCustomBlock({ role, name, content, enabled, tool: { code } }, existingIds, random);
}
