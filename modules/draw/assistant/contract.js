import { DRAW_REQUEST_PROPERTIES } from '../shared/request-contract.js';
export const DRAW_IMAGE = 'DrawImage';
export const DRAW_PRESETS = 'DrawPresets';
export const SAVE_DRAW_IMAGES = 'SaveDrawImages';
export const DRAW_SKILL = Object.freeze({ id: 'builtin-drawing', title: '画图与图片制作',
    summary: 'Write drawing requests for the user\'s NovelAI, SD WebUI, ComfyUI, Gemini or GPT Image service, check the generated workspace images, and use them in any project.',
    path: 'modules/draw/assistant/SKILL.md', tools: [] });
// The model preset decides whether returned images reach the model; the description states that fact.
export function drawTools({ imageInput = true } = {}) {
    return [
    { type: 'function', function: { name: DRAW_IMAGE,
        description: [
            'Generate images with the user\'s configured NovelAI, SD WebUI, ComfyUI, Gemini or GPT Image service and save the original files in the workspace.',
            'Uses the selected connection and parameter presets unless overridden; supplied values affect only this request. Generated images are also added to the user\'s drawing gallery.',
            `Returns {ok, images:[{path,name,kind,mimeType,sizeBytes,blobId}], error?, field?, status?, receiptId?}. ${imageInput
                ? 'The images are shown to you and the user.'
                : 'The images are shown only to the user; image input is off for you, so their contents are known only from your request and what the user reports.'}`,
            'ok:false includes the failure reason. Images returned with a failure have been saved to the workspace.',
            'receiptId appears when images arrived but saving failed; SaveDrawImages saves them without generating again.',
        ].join('\n'),
        parameters: { type: 'object', properties: { ...DRAW_REQUEST_PROPERTIES, outputDir: { type: 'string', description: 'Workspace directory for uniquely named image files. Default local/images. Existing files are never overwritten.' } }, required: ['prompt'], additionalProperties: false } } },
    { type: 'function', function: { name: DRAW_PRESETS,
        description: 'List the drawing connection, parameter and ComfyUI workflow presets with their IDs and current selection. Free; credentials are not included. Returns {ok, provider, api:[{id,name,selected}], params:[{id,name,selected}], workflows:[{id,name,selected}]}.',
        parameters: { type: 'object', properties: { provider: DRAW_REQUEST_PROPERTIES.provider }, additionalProperties: false } } },
    { type: 'function', function: { name: SAVE_DRAW_IMAGES,
        description: [
            'Save images that DrawImage received but could not store. Free; it never generates again.',
            'With receiptId: saves that batch and returns the same result shape as DrawImage.',
            'Without receiptId: returns {ok, pending:[{receiptId,outputDir,prompt,receivedAt,receivedCount,saving}]}, including batches that arrived after the user stopped a run.',
            'Pending batches live in page memory until saved. Reloading the SillyTavern page removes them. The drawing panel\'s image manager contains only images successfully saved there.',
        ].join('\n'),
        parameters: { type: 'object', properties: { receiptId: { type: 'string', description: 'Batch to save. Omit to list pending batches.' }, outputDir: { type: 'string', description: 'Workspace directory under local/. Default: the directory given to DrawImage.' } }, additionalProperties: false } } },
    ];
}
const SAVE_LABEL = '保存已生成图片';
export const DRAW_COPY = Object.freeze({ generate: '生成图片', presets: '查看绘图预设', save: SAVE_LABEL, pending: '查看待保存图片',
    unavailable: '绘图功能尚未加载。请在小白X设置中确认插件已开启并选择绘图服务；若已开启，请重新加载页面。',
    saved: count => `已保存 ${count} 张图片`,
    savedAt: images => `已保存 ${images.length} 张图片到工作区：\n${images.map(image => image.path).join('\n')}`,
    saveBatch: (count, prompt) => `${SAVE_LABEL}（${count} 张${prompt ? ` · ${prompt.slice(0, 40)}` : ''}）`,
    saveFailed: `图片已生成，但尚未保存到工作区。请点击“${SAVE_LABEL}”重试保存。`,
    expired: '这批临时图片已不可用，可能已保存或页面已重新加载。请检查工作区，或绘图设置中的“图片管理”。',
    noImages: '绘图服务没有返回图片。', generating: '正在绘图', savingAction: '正在保存图片…', savedAction: '已保存到工作区',
    expiredAction: '临时图片已不可用',
    refreshFailed: `绘图结果已保留，但工作区列表刷新失败。请重新打开助手查看；尚未保存的图片仍可点击“${SAVE_LABEL}”。`,
    invalidDirectory: '请选择 local/ 里面的有效目录保存图片，路径不能包含上级目录跳转。',
    saving: '这批图片正在保存，请等待当前保存完成。',
    cancelled: '已停止等待绘图，已收到或稍后收到的图片仍会保存到工作区。',
});

// Assistant-facing explanations belong to drawing, not the shared media API.
export const DRAW_ERRORS = Object.freeze({
    drawing_unavailable: DRAW_COPY.unavailable,
    disabled: '绘图功能未启用。请在小白X设置中开启插件，并选择 NovelAI、SD WebUI、ComfyUI、Gemini 或 GPT Image 绘图服务。',
    not_configured: '绘图服务尚未配置完整。请打开所选服务的绘图设置 → API 配置，检查连接地址和密钥；使用 ComfyUI 时还需检查工作流配置。',
    partial_result: '只取得了部分图片，其余图片未能取得。',
    collection_failed: '图片已生成，但未能保存到“图片管理”。',
});
