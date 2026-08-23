import { assembleCharacterPrompts, joinTags } from '../../shared/character-prompts.js';

export const COMFY_REQUEST_DELAY_MS = 1000;

const BUILTIN_WORKFLOW_TEMPLATE = {
    "3": {
        "inputs": {
            "seed": 0,
            "steps": 20,
            "cfg": 7,
            "sampler_name": "euler",
            "scheduler": "normal",
            "denoise": 1,
            "model": ["4", 0],
            "positive": ["6", 0],
            "negative": ["7", 0],
            "latent_image": ["5", 0]
        },
        "class_type": "KSampler"
    },
    "4": {
        "inputs": { "ckpt_name": "" },
        "class_type": "CheckpointLoaderSimple"
    },
    "5": {
        "inputs": { "width": 1024, "height": 1024, "batch_size": 1 },
        "class_type": "EmptyLatentImage"
    },
    "6": {
        "inputs": { "text": "", "clip": ["4", 1] },
        "class_type": "CLIPTextEncode"
    },
    "7": {
        "inputs": { "text": "", "clip": ["4", 1] },
        "class_type": "CLIPTextEncode"
    },
    "8": {
        "inputs": { "samples": ["3", 0], "vae": ["4", 2] },
        "class_type": "VAEDecode"
    },
    "9": {
        "inputs": {
            "filename_prefix": "LittleWhiteBox_Comfy",
            "images": ["8", 0]
        },
        "class_type": "SaveImage"
    }
};

function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
}

function clampNumber(value, fallback, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
}

function requireObject(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError(`${label}必须是对象`);
    }
    return value;
}

function requireFiniteNumber(value, label, { allowZero = true } = {}) {
    const number = Number(value);
    if (!Number.isFinite(number) || (allowZero ? number < 0 : number <= 0)) {
        throw new TypeError(`${label}必须是${allowZero ? '非负' : '正'}数`);
    }
    return number;
}

function normalizeSeed(value, index = 0) {
    const seed = Number(value);
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xFFFFFFFF) {
        throw new TypeError(`ComfyUI 第 ${index + 1} 项 seed 必须是 0～4294967295 的整数`);
    }
    return seed;
}

export function buildSimpleWorkflow({ model, sampler, scheduler, steps, cfg, width, height, positive, negative, seed }) {
    const workflow = cloneJson(BUILTIN_WORKFLOW_TEMPLATE);
    workflow["4"].inputs.ckpt_name = model;
    workflow["3"].inputs.sampler_name = sampler;
    workflow["3"].inputs.scheduler = scheduler;
    workflow["3"].inputs.steps = steps;
    workflow["3"].inputs.cfg = cfg;
    workflow["3"].inputs.seed = seed;
    workflow["5"].inputs.width = width;
    workflow["5"].inputs.height = height;
    workflow["6"].inputs.text = positive;
    workflow["7"].inputs.text = negative;
    return workflow;
}

export function parseComfyApiWorkflowJson(text) {
    let workflow;
    try {
        workflow = JSON.parse(String(text || '').replace(/^\uFEFF/, ''));
    } catch (error) {
        throw new Error(`JSON 格式错误：${error.message}`);
    }
    if (!workflow || Array.isArray(workflow) || typeof workflow !== 'object') {
        throw new Error('工作流格式错误：请导入 API Format workflow JSON。');
    }
    const hasApiNode = Object.values(workflow).some(node => (
        node && typeof node === 'object' && !Array.isArray(node)
        && typeof node.class_type === 'string'
        && node.inputs && typeof node.inputs === 'object' && !Array.isArray(node.inputs)
    ));
    if (!hasApiNode) {
        throw new Error('工作流格式错误：需要 API Format workflow JSON，请在 ComfyUI 使用 Save (API Format) 导出。');
    }
    return workflow;
}

function requireComfyNode(workflow, nodeId, label) {
    const id = String(nodeId || '').trim();
    if (!id) return null;
    const node = workflow?.[id];
    if (!node || typeof node !== 'object' || !node.inputs || typeof node.inputs !== 'object') {
        throw new Error(`${label}不存在：${id}`);
    }
    return node;
}

function getComfyTextFieldCandidates(role) {
    return role === 'negative' ? ['text', 'negative', 'prompt'] : ['text', 'prompt', 'positive'];
}

function validateComfyTextNode(workflow, nodeId, label, { required = false, role = 'positive' } = {}) {
    const id = String(nodeId || '').trim();
    if (!id) {
        if (required) throw new Error(`请填写${label}`);
        return;
    }
    const node = requireComfyNode(workflow, id, label);
    const fields = getComfyTextFieldCandidates(role);
    if (!fields.some(key => key in node.inputs)) {
        throw new Error(`${label}需要填带 ${fields.join('/')} 输入的节点：${id}`);
    }
}

function validateComfyInputNode(workflow, nodeId, label, inputName, { required = false } = {}) {
    const id = String(nodeId || '').trim();
    if (!id) {
        if (required) throw new Error(`请填写${label}`);
        return;
    }
    const node = requireComfyNode(workflow, id, label);
    if (!(inputName in node.inputs)) throw new Error(`${label}节点没有 ${inputName} 输入：${id}`);
}

function validateComfySeedNode(workflow, nodeId, { required = false } = {}) {
    const id = String(nodeId || '').trim();
    if (!id) {
        if (required) throw new Error('请填写Seed 节点');
        return;
    }
    const node = requireComfyNode(workflow, id, 'Seed 节点');
    if (!('seed' in node.inputs) && !('noise_seed' in node.inputs)) {
        throw new Error(`Seed 节点需要带 seed 或 noise_seed 输入：${id}`);
    }
}

function normalizeComfyClassType(value) {
    return String(value || '').replace(/\s+/g, '').toLowerCase();
}

function validateComfySaveImageNode(workflow, nodeId, { required = false } = {}) {
    const id = String(nodeId || '').trim();
    if (!id) {
        if (required) throw new Error('请填写SaveImage 节点');
        return;
    }
    const node = requireComfyNode(workflow, id, 'SaveImage 节点');
    if (normalizeComfyClassType(node.class_type) !== 'saveimage') {
        throw new Error(`SaveImage 节点 ID 需要指向 SaveImage 节点：${id}`);
    }
}

export function validateComfyWorkflowNodeMap(workflow, nodeMap) {
    validateComfyTextNode(workflow, nodeMap.positive, '正向提示词节点', { required: true, role: 'positive' });
    validateComfyTextNode(workflow, nodeMap.negative, '负向提示词节点', { role: 'negative' });
    validateComfyInputNode(workflow, nodeMap.width, '宽度节点', 'width');
    validateComfyInputNode(workflow, nodeMap.height, '高度节点', 'height');
    validateComfySeedNode(workflow, nodeMap.seed);
    validateComfySaveImageNode(workflow, nodeMap.saveImage, { required: true });
}

function isComfyLink(value) {
    return Array.isArray(value) && value.length >= 2 && value[0] !== undefined && value[1] !== undefined;
}

function getComfyNodeTitle(node) {
    return String(node?._meta?.title || node?.title || '').trim().toLowerCase();
}

function getComfyOutputTitleScore(title) {
    if (/final|最终/i.test(title)) return 50;
    if (/output|result|输出|结果/i.test(title)) return 40;
    if (/save|保存/i.test(title)) return 35;
    return 0;
}

function extractComfyOutputAssets(output) {
    if (!output || typeof output !== 'object') return [];
    return [
        ...(Array.isArray(output.images) ? output.images : []),
        ...(Array.isArray(output.gifs) ? output.gifs : []),
    ];
}

function getReferencedComfyNodeIds(workflow) {
    const refs = new Set();
    Object.values(workflow || {}).forEach((node) => {
        Object.values(node?.inputs || {}).forEach((value) => {
            if (isComfyLink(value)) refs.add(String(value[0]));
        });
    });
    return refs;
}

function getPreferredComfySaveImageNodeIds(workflow) {
    return Object.entries(workflow || {})
        .filter(([, node]) => normalizeComfyClassType(node?.class_type) === 'saveimage')
        .map(([id, node]) => ({ id: String(id), score: getComfyOutputTitleScore(getComfyNodeTitle(node)) }))
        .sort((a, b) => b.score - a.score || Number(b.id) - Number(a.id))
        .map(item => item.id);
}

function pruneComfyOutputNodes(workflow, preferredSaveImageNodeId = '') {
    const preferredId = String(preferredSaveImageNodeId || '').trim();
    if (!preferredId && getPreferredComfySaveImageNodeIds(workflow).length === 0) return workflow;
    const refs = getReferencedComfyNodeIds(workflow);
    Object.entries(workflow || {}).forEach(([id, node]) => {
        if (refs.has(String(id))) return;
        const type = normalizeComfyClassType(node?.class_type);
        if (type !== 'previewimage' && type !== 'saveimage') return;
        if (preferredId) {
            if (String(id) !== preferredId) delete workflow[id];
        } else if (type === 'previewimage') {
            delete workflow[id];
        }
    });
    return workflow;
}

function pickComfyOutputAssetByNodeIds(item, nodeIds = []) {
    const outputs = item?.outputs || {};
    for (const nodeId of nodeIds) {
        const assets = extractComfyOutputAssets(outputs[String(nodeId)]);
        if (assets.length) return assets[0];
    }
    return null;
}

export function resolveComfyDirectOutputImage(item, workflow, preferredSaveImageNodeId = '') {
    const preferredNodeId = String(preferredSaveImageNodeId || '').trim();
    if (preferredNodeId) {
        const preferredAsset = pickComfyOutputAssetByNodeIds(item, [preferredNodeId]);
        if (preferredAsset) return preferredAsset;
    }
    return pickComfyOutputAssetByNodeIds(item, getPreferredComfySaveImageNodeIds(workflow)) || null;
}

function injectTextFieldIntoNode(nodeInputs, value, role) {
    for (const key of getComfyTextFieldCandidates(role)) {
        if (key in nodeInputs && typeof nodeInputs[key] === 'string') {
            nodeInputs[key] = value;
            return;
        }
    }
    nodeInputs.text = value;
}

function injectPromptIntoWorkflow(workflow, positive, negative, width, height, nodeMap, seed) {
    const result = cloneJson(workflow);
    validateComfyWorkflowNodeMap(result, nodeMap);
    if (nodeMap.positive && result[nodeMap.positive]) {
        injectTextFieldIntoNode(result[nodeMap.positive].inputs, positive, 'positive');
    }
    if (nodeMap.negative && result[nodeMap.negative]) {
        injectTextFieldIntoNode(result[nodeMap.negative].inputs, negative, 'negative');
    }
    if (nodeMap.width && width && result[nodeMap.width] && 'width' in result[nodeMap.width].inputs) {
        result[nodeMap.width].inputs.width = width;
    }
    if (nodeMap.height && height && result[nodeMap.height] && 'height' in result[nodeMap.height].inputs) {
        result[nodeMap.height].inputs.height = height;
    }
    if (nodeMap.seed && result[nodeMap.seed]) {
        const inputs = result[nodeMap.seed].inputs;
        if ('seed' in inputs) inputs.seed = seed;
        else if ('noise_seed' in inputs) inputs.noise_seed = seed;
    }
    return pruneComfyOutputNodes(result, nodeMap.saveImage);
}

export function buildComfyImageRequest({ prompt, negativePrompt = '', params = {}, recipe = {}, seed } = {}) {
    const effective = requireObject(params, 'ComfyUI params');
    const generationRecipe = requireObject(recipe, 'ComfyUI generationRecipe');
    const normalizedSeed = normalizeSeed(seed);
    const positive = String(prompt || '').trim();
    const negative = String(negativePrompt || '').trim();
    if (!positive) throw new Error('Prompt 不能为空');
    const width = clampNumber(effective.width, 1024, 64, 2048);
    const height = clampNumber(effective.height, 1024, 64, 2048);

    if (generationRecipe.workflowMode === 'custom' && generationRecipe.customWorkflow?.json) {
        const custom = generationRecipe.customWorkflow;
        const workflow = parseComfyApiWorkflowJson(custom.json);
        const nodeMap = {
            positive: custom.nodePositive || '',
            negative: custom.nodeNegative || '',
            width: custom.nodeWidth || '',
            height: custom.nodeHeight || '',
            seed: custom.nodeSeed || '',
            saveImage: custom.nodeSaveImage || '',
        };
        return {
            workflow: injectPromptIntoWorkflow(workflow, positive, negative, width, height, nodeMap, normalizedSeed),
            preferredSaveImageNodeId: String(custom.nodeSaveImage || '').trim(),
        };
    }

    const model = String(effective.model || '').trim();
    if (!model) throw new Error('请先在「模型配置」中选择模型');
    return {
        workflow: buildSimpleWorkflow({
            model,
            sampler: effective.sampler || 'euler',
            scheduler: effective.scheduler || 'normal',
            steps: effective.steps || 20,
            cfg: effective.cfg || 7,
            width,
            height,
            positive,
            negative,
            seed: normalizedSeed,
        }),
        preferredSaveImageNodeId: '',
    };
}

export function compileComfyPromptForTask(task, recipe = {}) {
    const characterPrompts = Array.isArray(task?.characterPrompts)
        ? task.characterPrompts.filter(Boolean)
        : assembleCharacterPrompts(task?.chars || [], recipe.knownCharacters || [], {
            preserveDanbooruCanonical: true,
        });
    const promptOverride = String(recipe.promptOverride || '').trim();
    const negativeOverride = String(recipe.negativePromptOverride || '').trim();
    if (promptOverride) {
        return {
            positive: joinTags(recipe.positivePrefix, promptOverride),
            negative: joinTags(recipe.negativePrefix, negativeOverride),
            characterPrompts,
        };
    }
    const charPositive = characterPrompts.map(item => item.prompt).filter(Boolean).join(', ');
    const charNegative = characterPrompts.map(item => item.uc).filter(Boolean).join(', ');
    return {
        positive: joinTags(recipe.positivePrefix, task?.scene, charPositive),
        negative: joinTags(recipe.negativePrefix, negativeOverride, charNegative),
        characterPrompts,
    };
}

export function compile(scenePlan, generationRecipe) {
    const recipe = requireObject(generationRecipe, 'ComfyUI generationRecipe');
    const tasks = Array.isArray(scenePlan) ? scenePlan : scenePlan?.tasks;
    if (!Array.isArray(tasks) || tasks.length === 0) throw new TypeError('ComfyUI scenePlan 必须包含图片任务');
    if (!Array.isArray(recipe.seeds) || recipe.seeds.length !== tasks.length) {
        throw new TypeError('ComfyUI generationRecipe.seeds 必须与图片任务一一对应');
    }
    const params = requireObject(recipe.params, 'ComfyUI generationRecipe.params');
    const timeout = requireFiniteNumber(recipe.timeout, 'ComfyUI generationRecipe.timeout', { allowZero: false });
    const delay = requireFiniteNumber(recipe.delayMs, 'ComfyUI generationRecipe.delayMs');
    const artifacts = tasks.map((task) => ({
        task,
        promptData: compileComfyPromptForTask(task, recipe),
        tags: task?.scene || recipe.promptOverride || '',
    }));
    return {
        provider: 'comfyui',
        context: { url: String(recipe.host || '').trim(), auth: String(recipe.auth || '') },
        delay: { min: delay, max: delay },
        items: artifacts.map(({ promptData }, index) => ({
            request: buildComfyImageRequest({
                prompt: promptData.positive,
                negativePrompt: promptData.negative,
                params,
                recipe,
                seed: normalizeSeed(recipe.seeds[index], index),
            }),
            timeout,
        })),
        artifacts,
    };
}
