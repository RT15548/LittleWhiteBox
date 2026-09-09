import { createSubmitScenePlanTool } from './scene-plan-tool.js';
import { normalizeScenePlannerProfile } from './scene-planner-profile.js';
import { spliceLiteral } from './scene-prompt-expansion.js';

/**
 * The fixed part of the planner request. It describes the world the model is in — what the
 * materials are and where its output goes — and is owned by code because it mirrors what the
 * compilers actually do. Everything a user may want to change (opening, guide, scene rules) is
 * injected around it.
 */

export const WORLD_INFO_TEMPLATE = `<worldInfo>
用户角色设定：
{{persona}}
---
世界/场景:
{{description}}
---
{$worldInfo}
</worldInfo>`;

export const CONTENT_TEMPLATE = `<content>
{{characterInfo}}
---
{{lastMessage}}
</content>`;

function joinBlocks(blocks) {
    return blocks.map((block) => String(block || '').trim()).filter(Boolean).join('\n\n');
}

export function buildScenePlannerFrameText(profile) {
    const { imageModelName } = normalizeScenePlannerProfile(profile);
    return `## 你收到的材料
- <worldInfo>：世界书。其中的 tag 组合、同人角色资料、姿势库是写 tag 时的参考来源；未知角色的外貌优先参考其中的数据。
- <content>：本次唯一的叙事来源。开头是【已录入角色】列表，这些角色的身份与外貌由角色库注入，你只写他们在本图中的状态；正文里每个可插图的位置已标为【插图点 N】。
- 消息末尾的数量约束：可用插图点数、images 数量、每图人数上限。

## 你的输出去哪
The app uses each image's scene and character fields, together with the character library and the user's generation settings, to build a request for ${imageModelName}. Field meanings and model-specific controls are described in submit_scene_plan.`;
}

export function buildScenePlannerSystemPrompt({ opening = '', guide = '', sceneRules = '', profile } = {}) {
    const effective = normalizeScenePlannerProfile(profile);
    const guideText = String(guide || '').trim();
    const rulesText = String(sceneRules || '').trim();
    return joinBlocks([
        opening,
        buildScenePlannerFrameText(effective),
        guideText ? `## ${effective.imageModelName} Tag 指南\n\n${guideText}` : '',
        rulesText ? `## 场景规则\n\n${rulesText}` : '',
    ]);
}

/** Slots are opaque tokens; the caller resolves them after macro expansion. */
export function buildScenePlannerUserTask({ worldInfoSlot, characterInfoSlot, lastMessageSlot, limitsLine = '' } = {}) {
    return joinBlocks([
        spliceLiteral(WORLD_INFO_TEMPLATE, '{$worldInfo}', worldInfoSlot),
        spliceLiteral(
            spliceLiteral(CONTENT_TEMPLATE, '{{characterInfo}}', characterInfoSlot),
            '{{lastMessage}}',
            lastMessageSlot,
        ),
        limitsLine,
    ]);
}

function flattenSchemaFields(schema, path, out) {
    if (!schema || typeof schema !== 'object') return out;
    if (schema.description) out.push({ path, description: schema.description });
    if (schema.type === 'object' && schema.properties) {
        for (const [key, child] of Object.entries(schema.properties)) {
            flattenSchemaFields(child, path ? `${path}.${key}` : key, out);
        }
    } else if (schema.type === 'array' && schema.items) {
        flattenSchemaFields(schema.items, `${path}[]`, out);
    }
    return out;
}

/** Field paths with their model-facing descriptions, for the read-only request preview. */
export function listScenePlanFieldDescriptions(profile) {
    const tool = createSubmitScenePlanTool({ profile });
    return flattenSchemaFields(tool.function.parameters, '', []);
}

/**
 * Read-only request structure for the prompt editor: one system, one user, one tool.
 * `editable` sections map onto the three user-editable textareas.
 */
export function buildScenePlannerChainPreview({ profile, hasTagGuide = true } = {}) {
    const effective = normalizeScenePlannerProfile(profile);
    return [
        {
            role: 'system',
            key: 'system',
            summary: 'system：规划器的身份、材料说明、指南与规则',
            sections: [
                { key: 'topSystem', editable: true, summary: '开场与视角' },
                { key: 'frame', summary: '材料说明与输出去向（内置）', content: buildScenePlannerFrameText(effective) },
                {
                    key: 'tagGuide',
                    editable: true,
                    summary: `${effective.imageModelName} Tag 指南${hasTagGuide ? '' : '（当前为空，不注入）'}`,
                },
                { key: 'sceneRules', editable: true, summary: '场景规则' },
            ],
        },
        {
            role: 'user',
            key: 'userTask',
            summary: 'user：本次材料',
            sections: [
                {
                    key: 'worldInfo',
                    summary: '世界书',
                    content: WORLD_INFO_TEMPLATE,
                    variables: ['{{persona}} — 用户角色设定', '{{description}} — 世界/场景', '{$worldInfo} — 世界书条目'],
                },
                {
                    key: 'content',
                    summary: '已录入角色 + 正文（含【插图点 N】）',
                    content: CONTENT_TEMPLATE,
                    variables: ['{{characterInfo}} — 已录入角色列表', '{{lastMessage}} — 正文'],
                },
                { key: 'limits', summary: '本次数量约束：可用插图点数、images 数量、每图人数上限' },
            ],
        },
        {
            role: 'tools',
            key: 'tools',
            summary: 'tools：submit_scene_plan 字段说明（模型读到的字段语义）',
            fields: listScenePlanFieldDescriptions(effective),
        },
    ];
}
