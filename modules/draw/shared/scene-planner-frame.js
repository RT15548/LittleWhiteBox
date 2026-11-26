import { createSubmitScenePlanTool } from './scene-plan-tool.js';
import { normalizeScenePlannerProfile } from './scene-planner-profile.js';
import { spliceLiteral } from './scene-prompt-expansion.js';
import { planScenePlannerMessages } from './scene-planner-assembly.js';
import { SCENE_PLANNER_DOCUMENT_FIELDS, createScenePlannerHandoffTools, renderScenePlannerMessage } from './scene-planner-handoff.js';
import { PREBUILT_MESSAGE_LABELS, PROMPT_ROLE_LABELS, SCENE_PLANNER_STAGES, TOOL_DEFINITIONS_LABEL, normalizeLayout } from './scene-planner-layout.js';

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

export function buildScenePlannerFrameText(profile) {
    const { imageModelName, promptStyle } = normalizeScenePlannerProfile(profile);
    if (promptStyle === 'natural') return `## Source material
- <worldInfo> contains setting and character reference information.
- <content> contains character references followed by the narrative. Each available image placement is marked 【插图点 N】.
- Generation requirements provide style preferences and image-count limits.

## Where your output goes
Each scene is the complete description sent to ${imageModelName}. Include the relevant character appearance and style in that description. Reference material informs the depiction; it is not appended to the image request. Placement fields keep their shared meanings in submit_scene_plan.`;
    return `## 你收到的材料
- <worldInfo>：世界书。其中的 tag 组合、同人角色资料、姿势库是写提示词时的参考来源；未知角色的外貌优先参考其中的数据。
- <content>：本次唯一的叙事来源。开头是【已录入角色】列表；固定外貌由角色库自动写入，你只写本图中的状态，不要重复固定外貌里已有的 tag；正文里每个可插图的位置已标为【插图点 N】。
- 绘图要求中的数量约束：可用插图点数、images 数量、每图人数上限。

## 你的输出去哪
The app uses each image's scene and character fields, together with the character library and the user's generation settings, to build a request for ${imageModelName}. Field meanings and model-specific controls are described in submit_scene_plan.`;
}

// 指南 / 规则单独成段：布局组装需要把它们当作独立的块（空文本 = 整块省略）。
export function buildScenePlannerGuideSection(guide = '', profile) {
    const { imageModelName, promptStyle } = normalizeScenePlannerProfile(profile);
    const guideText = String(guide || '').trim();
    return guideText ? `## ${imageModelName} ${promptStyle === 'natural' ? 'Drawing guidance' : 'Tag 指南'}\n\n${guideText}` : '';
}

export function buildScenePlannerRulesSection(rules = '') {
    const rulesText = String(rules || '').trim();
    return rulesText ? `## 场景规则\n\n${rulesText}` : '';
}

// 世界书 / 正文的未展开模板；槽位值在宏展开后原样插入。
export function buildScenePlannerWorldInfoBlock(worldInfoSlot) {
    return spliceLiteral(WORLD_INFO_TEMPLATE, '{$worldInfo}', worldInfoSlot);
}

export function buildScenePlannerContentBlock(characterInfoSlot, lastMessageSlot, continuitySlot = '') {
    return spliceLiteral(
        spliceLiteral(CONTENT_TEMPLATE, '{{characterInfo}}', [characterInfoSlot, continuitySlot].filter(Boolean).join('\n\n')),
        '{{lastMessage}}',
        lastMessageSlot,
    );
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

/** Field paths with their model-facing descriptions, for the request preview. */
export function listScenePlanFieldDescriptions(profile, descriptions = {}) {
    const tool = createSubmitScenePlanTool({ profile, descriptions });
    return flattenSchemaFields(tool.function.parameters, '', []);
}

/** Preview is a projection of the actual assembly, including the current custom-message draft. */
export function buildScenePlannerChainPreview({ profile, descriptions = {}, layout, builtinTexts = {} } = {}) {
    const effective = normalizeScenePlannerProfile(profile);
    const submit = createSubmitScenePlanTool({ profile: effective, descriptions }).function;
    const sections = {
        opening: { key: 'topSystem', editable: true, summary: '开场与视角' },
        frame: { key: 'frame', summary: '材料说明与输出去向', content: buildScenePlannerFrameText(effective) },
        tools: { key: 'toolDeclaration', summary: '工具配置' },
        worldInfo: { key: 'worldInfo', summary: '世界书', content: WORLD_INFO_TEMPLATE },
        content: { key: 'content', summary: '角色与正文', content: CONTENT_TEMPLATE },
        guide: { key: 'tagGuide', editable: true, summary: `${effective.imageModelName} ${effective.promptStyle === 'natural' ? '绘图指南' : 'Tag 指南'}` },
        rules: { key: 'sceneRules', editable: true, summary: '场景规则' },
        limits: { key: 'limits', summary: '本次数量约束：可用插图点数、images 数量、每图人数上限' },
    };
    for (const [id, section] of Object.entries(sections)) {
        if (id !== 'tools' && Object.hasOwn(builtinTexts, id)) section.content = builtinTexts[id];
    }
    if (Object.hasOwn(builtinTexts, 'guide')) sections.guide.content = buildScenePlannerGuideSection(builtinTexts.guide, effective);
    if (Object.hasOwn(builtinTexts, 'rules')) sections.rules.content = buildScenePlannerRulesSection(builtinTexts.rules);
    const texts = Object.fromEntries(Object.entries(sections).map(([id, section]) => [id, Object.hasOwn(section, 'content') ? section.content : (id === 'opening' ? id : '')]));
    for (const block of normalizeLayout(layout).layout.blocks) {
        if (!sections[block.id]) sections[block.id] = { key: block.id, summary: block.name || '自定义消息', content: block.content };
    }
    const { templates, documents } = planScenePlannerMessages({ layout, builtinTexts: texts });
    const documentTexts = Object.fromEntries(documents.flatMap(({ blocks }) => blocks.map(({ id, template }) => [id, template])));
    const handoffs = createScenePlannerHandoffTools({ documents: documentTexts }).map(tool => tool.function);
    const describeTool = ({ name, description }) => ({ key: name, summary: name, content: description });
    const handoffSections = Object.values(SCENE_PLANNER_DOCUMENT_FIELDS).flatMap((fields, index) => {
        const tool = handoffs[index];
        const parameters = Object.entries(fields).flatMap(([id, field]) => {
            const parameter = tool.parameters.properties[field];
            const section = sections[id];
            // Quantity limits may depend on the next request rather than the settings draft.
            if (!parameter && !(id === 'limits' && !Object.hasOwn(section, 'content'))) return [];
            return [{
                key: section?.key ?? `${tool.name}.${field}`,
                summary: section ? `${section.summary} · ${field}` : field,
                parameter: field,
                ...(section?.editable ? { editable: true } : {}),
                ...(parameter ? { content: parameter.description } : {}),
            }];
        });
        return [describeTool(tool), ...parameters];
    });
    return [
        ...templates.map((item, index) => {
            const roleLabel = item.stageId
                ? PREBUILT_MESSAGE_LABELS[item.tool_calls ? 'call' : 'result']
                : PROMPT_ROLE_LABELS[item.role];
            const items = item.blockIds.map(id => sections[id]);
            const key = `message-${index}`;
            const summary = items.length ? items.map(section => section.summary).join('、')
                : SCENE_PLANNER_STAGES.find(stage => stage.id === item.stageId)?.label
                    || ({ requirements: '工作要求', approval: item.approved ? '确认提交' : '申请提交' })[item.stageId]
                    || '执行步骤';
            return { role: item.role, roleLabel, key, summary,
                sections: items.length ? items : [{ key, summary, content: renderScenePlannerMessage(item, item.template).content }],
                ...(item.tool_calls ? { tool_calls: item.tool_calls } : {}),
                ...(item.tool_call_id ? { tool_call_id: item.tool_call_id } : {}),
            };
        }),
        {
            role: 'tools',
            roleLabel: PROMPT_ROLE_LABELS.tools,
            key: 'tools',
            summary: TOOL_DEFINITIONS_LABEL,
            name: submit.name,
            sections: [describeTool(submit)],
            fields: flattenSchemaFields(submit.parameters, '', []),
        },
        {
            role: 'tools',
            roleLabel: PROMPT_ROLE_LABELS.tools,
            key: 'handoffTools',
            summary: '绘图交接工具说明',
            sections: handoffSections,
        },
    ];
}
