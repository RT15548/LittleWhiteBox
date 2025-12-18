import { extension_settings, getContext } from "../../../../../extensions.js";
import { appendMediaToMessage, getRequestHeaders, saveSettingsDebounced } from "../../../../../../script.js";
import { saveBase64AsFile } from "../../../../../utils.js";
import { secret_state, writeSecret, SECRET_KEYS } from "../../../../../secrets.js";
import { EXT_ID, extensionFolderPath } from "../../core/constants.js";
import { createModuleEvents, event_types } from "../../core/event-manager.js";

// ═══════════════════════════════════════════════════════════════════════════
// 常量与状态
// ═══════════════════════════════════════════════════════════════════════════

const MODULE_KEY = 'novelDraw';
const HTML_PATH = `${extensionFolderPath}/modules/novel-draw/novel-draw.html`;
const TAGS_SESSION_ID = 'xb_nd_tags';
const NOVELAI_IMAGE_API = 'https://image.novelai.net/ai/generate-image';
const REFERENCE_PIXEL_COUNT = 1011712;
const SIGMA_MAGIC_NUMBER = 19;
const SIGMA_MAGIC_NUMBER_V4_5 = 58;

const events = createModuleEvents(MODULE_KEY);

const DEFAULT_PRESET = {
    id: '',
    name: '默认',
    positivePrefix: 'masterpiece, best quality,',
    negativePrefix: 'lowres, bad anatomy, bad hands,',
    params: {
        model: 'nai-diffusion-4-full',
        sampler: 'k_dpmpp_2m',
        scheduler: 'karras',
        steps: 28,
        scale: 9,
        width: 832,
        height: 1216,
        seed: -1,
        sm: false,
        sm_dyn: false,
        decrisper: false,
        variety_boost: false,
        upscale_ratio: 1,
    },
};

const DEFAULT_SETTINGS = {
    enabled: false,
    mode: 'manual',
    selectedPresetId: null,
    presets: [],
    api: {
        mode: 'tavern',
        apiKey: '',
    },
};

let autoBusy = false;
let overlayCreated = false;
let frameReady = false;

// ═══════════════════════════════════════════════════════════════════════════
// 设置管理
// ═══════════════════════════════════════════════════════════════════════════

function getSettings() {
    const root = extension_settings[EXT_ID] ||= {};
    const s = root[MODULE_KEY] ||= { ...DEFAULT_SETTINGS };
    if (!Array.isArray(s.presets) || !s.presets.length) {
        const id = generateId();
        s.presets = [{ ...JSON.parse(JSON.stringify(DEFAULT_PRESET)), id }];
        s.selectedPresetId = id;
    }
    if (!s.selectedPresetId || !s.presets.find(p => p.id === s.selectedPresetId)) {
        s.selectedPresetId = s.presets[0]?.id ?? null;
    }
    if (!s.api) {
        s.api = { ...DEFAULT_SETTINGS.api };
    }
    return s;
}

function getActivePreset() {
    const s = getSettings();
    return s.presets.find(p => p.id === s.selectedPresetId) || s.presets[0];
}

function generateId() {
    return `xb-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════════════════

function joinTags(prefix, scene) {
    const a = String(prefix || '').trim().replace(/[，、]/g, ',');
    const b = String(scene || '').trim().replace(/[，、]/g, ',');
    if (!a) return b;
    if (!b) return a;
    return `${a.replace(/,+\s*$/g, '')}, ${b.replace(/^,+\s*/g, '')}`;
}

function b64UrlEncode(str) {
    const utf8 = new TextEncoder().encode(String(str));
    let bin = '';
    utf8.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function normalizeSceneTags(raw) {
    if (!raw) return '';
    return String(raw).trim()
        .replace(/^```[\s\S]*?\n/i, '').replace(/```$/i, '')
        .replace(/^\s*(tags?\s*[:：]\s*)/i, '')
        .replace(/\r?\n+/g, ', ')
        .replace(/[，、]/g, ',')
        .replace(/\s*,\s*/g, ', ')
        .replace(/,+\s*$/g, '').replace(/^\s*,+/g, '')
        .trim();
}

function getChatCharacterName() {
    const ctx = getContext();
    if (ctx.groupId) return String(ctx.groups?.[ctx.groupId]?.id ?? 'group');
    return String(ctx.characters?.[ctx.characterId]?.name || 'character');
}

function calculateSkipCfgAboveSigma(width, height, modelName) {
    const magicConstant = modelName?.includes('nai-diffusion-4-5') ? SIGMA_MAGIC_NUMBER_V4_5 : SIGMA_MAGIC_NUMBER;
    const pixelCount = width * height;
    return Math.pow(pixelCount / REFERENCE_PIXEL_COUNT, 0.5) * magicConstant;
}

// ═══════════════════════════════════════════════════════════════════════════
// 场景 TAG 生成
// ═══════════════════════════════════════════════════════════════════════════

function buildSceneTagPrompt({ lastAssistantText, positivePrefix, negativePrefix }) {
    const msg1 = `你是"NovelAI 场景TAG生成器"。只输出一行逗号分隔的英文tag（场景/构图/光照/氛围/动作/镜头），不要解释，不要换行，不要加代码块。25-60个tag。`;
    const msg2 = `明白，我只输出一行逗号分隔的场景TAG。`;
    const msg3 = `<正向固定词>\n${positivePrefix}\n</正向固定词>\n<负向固定词>\n${negativePrefix}\n</负向固定词>\n<对话上下文>\n{$history20}\n</对话上下文>\n<最后AI回复>\n${lastAssistantText}\n</最后AI回复>\n请基于"最后AI回复"生成场景TAG：`;
    const msg4 = `场景TAG：`;
    return b64UrlEncode(`user={${msg1}};assistant={${msg2}};user={${msg3}};assistant={${msg4}}`);
}

async function generateSceneTagsFromChat({ messageId }) {
    const preset = getActivePreset();
    if (!preset) throw new Error('未找到预设');
    const ctx = getContext();
    const chat = ctx.chat || [];
    const lastAssistantText = String(chat[messageId]?.mes || '').trim();
    const top64 = buildSceneTagPrompt({
        lastAssistantText,
        positivePrefix: preset.positivePrefix,
        negativePrefix: preset.negativePrefix,
    });
    const mod = window?.xiaobaixStreamingGeneration;
    if (!mod?.xbgenrawCommand) throw new Error('xbgenraw 不可用');
    const raw = await mod.xbgenrawCommand({ as: 'user', nonstream: 'true', top64, id: TAGS_SESSION_ID }, '');
    const tags = normalizeSceneTags(raw);
    if (!tags) throw new Error('AI 未返回有效场景TAG');
    return tags;
}

// ═══════════════════════════════════════════════════════════════════════════
// API Key 管理
// ═══════════════════════════════════════════════════════════════════════════

async function ensureApiKeyInSecrets(apiKey) {
    if (!apiKey) throw new Error('API Key 不能为空');
    await writeSecret(SECRET_KEYS.NOVEL, apiKey);
}

function hasApiKeyInSecrets() {
    return !!secret_state[SECRET_KEYS.NOVEL];
}

// ═══════════════════════════════════════════════════════════════════════════
// 连接测试
// ═══════════════════════════════════════════════════════════════════════════

async function testApiConnection(apiKey, mode) {
    if (!apiKey) throw new Error('请填写 API Key');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        if (mode === 'direct') {
            const res = await fetch(NOVELAI_IMAGE_API, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: 'test',
                    model: 'nai-diffusion-3',
                    action: 'generate',
                    parameters: { width: 64, height: 64, steps: 1 }
                }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (res.status === 401) throw new Error('API Key 无效');
            if (res.status === 400 || res.status === 402 || res.ok) {
                return { success: true, message: '连接成功' };
            }
            throw new Error(`NovelAI 返回: ${res.status}`);

        } else {
            await ensureApiKeyInSecrets(apiKey);
            const res = await fetch('/api/novelai/status', {
                method: 'POST',
                headers: getRequestHeaders(),
                body: JSON.stringify({}),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error(`酒馆后端返回错误: ${res.status}`);
            const data = await res.json();
            if (data.error) throw new Error('API Key 无效或已过期');
            return data;
        }
    } catch (e) {
        clearTimeout(timeoutId);
        if (e.name === 'AbortError') {
            throw new Error(mode === 'direct' ? '连接超时，请检查网络或开启代理' : '连接超时，酒馆服务器可能无法访问 NovelAI');
        }
        if (e.message?.includes('Failed to fetch')) {
            throw new Error(mode === 'direct' ? '无法连接 NovelAI，请检查网络或开启代理' : '无法连接酒馆后端');
        }
        throw e;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// ZIP 解析
// ═══════════════════════════════════════════════════════════════════════════

async function extractImageFromZip(zipData) {
    const JSZip = window.JSZip;
    if (!JSZip) throw new Error('缺少 JSZip 库，请使用酒馆模式');

    const zip = await JSZip.loadAsync(zipData);
    const imageFile = Object.values(zip.files).find(f => f.name.endsWith('.png') || f.name.endsWith('.webp'));
    if (!imageFile) throw new Error('无法从返回数据中提取图片');

    return await imageFile.async('base64');
}

// ═══════════════════════════════════════════════════════════════════════════
// 图片生成（核心）
// ═══════════════════════════════════════════════════════════════════════════

async function generateNovelImageBase64({ prompt, negativePrompt, params, signal }) {
    const settings = getSettings();
    const apiMode = settings.api?.mode || 'tavern';
    const apiKey = settings.api?.apiKey || '';

    const width = params?.width ?? 832;
    const height = params?.height ?? 1216;
    const seed = (params?.seed >= 0) ? params.seed : Math.floor(Math.random() * 9999999999);
    const promptText = String(prompt || '');
    const negativeText = String(negativePrompt || '');
    const modelName = params?.model ?? 'nai-diffusion-4-full';

    if (apiMode === 'direct') {
        if (!apiKey) throw new Error('官网直连模式需要填写 API Key');

        const skipCfgAboveSigma = params?.variety_boost ? calculateSkipCfgAboveSigma(width, height, modelName) : null;

        const requestBody = {
            action: 'generate',
            input: promptText,
            model: modelName,
            parameters: {
                params_version: 3,
                prefer_brownian: true,
                width: width,
                height: height,
                scale: params?.scale ?? 9,
                seed: seed,
                sampler: params?.sampler ?? 'k_dpmpp_2m',
                noise_schedule: params?.scheduler ?? 'karras',
                steps: params?.steps ?? 28,
                n_samples: 1,
                negative_prompt: negativeText,
                ucPreset: 0,
                qualityToggle: false,
                add_original_image: false,
                controlnet_strength: 1,
                deliberate_euler_ancestral_bug: false,
                dynamic_thresholding: params?.decrisper ?? false,
                legacy: false,
                legacy_v3_extend: false,
                sm: params?.sm ?? false,
                sm_dyn: params?.sm_dyn ?? false,
                uncond_scale: 1,
                skip_cfg_above_sigma: skipCfgAboveSigma,
                use_coords: false,
                characterPrompts: [],
                reference_image_multiple: [],
                reference_information_extracted_multiple: [],
                reference_strength_multiple: [],
                v4_prompt: {
                    caption: {
                        base_caption: promptText,
                        char_captions: [],
                    },
                    use_coords: false,
                    use_order: true,
                },
                v4_negative_prompt: {
                    caption: {
                        base_caption: negativeText,
                        char_captions: [],
                    },
                },
            },
        };

        const res = await fetch(NOVELAI_IMAGE_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            signal,
            body: JSON.stringify(requestBody),
        });

        if (!res.ok) {
            if (res.status === 401) throw new Error('API Key 无效');
            if (res.status === 402) throw new Error('点数不足，请充值');
            const errText = await res.text().catch(() => res.statusText);
            throw new Error(`NovelAI 请求失败: ${errText}`);
        }

        const zipData = await res.arrayBuffer();
        return await extractImageFromZip(zipData);

    } else {
        if (apiKey) {
            await ensureApiKeyInSecrets(apiKey);
        } else if (!hasApiKeyInSecrets()) {
            throw new Error('请先填写 API Key');
        }

        const body = {
            prompt: promptText,
            negative_prompt: negativeText,
            model: modelName,
            sampler: params?.sampler ?? 'k_dpmpp_2m',
            scheduler: params?.scheduler ?? 'karras',
            steps: params?.steps ?? 28,
            scale: params?.scale ?? 9,
            width: width,
            height: height,
            seed: seed,
            upscale_ratio: params?.upscale_ratio ?? 1,
            decrisper: params?.decrisper ?? false,
            variety_boost: params?.variety_boost ?? false,
            sm: params?.sm ?? false,
            sm_dyn: params?.sm_dyn ?? false,
        };

        const res = await fetch('/api/novelai/generate-image', {
            method: 'POST',
            headers: getRequestHeaders(),
            signal,
            body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error(await res.text() || res.statusText || 'Novel 画图失败');
        return String(await res.text());
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 生成并附加到消息
// ═══════════════════════════════════════════════════════════════════════════

async function generateAndAttachToMessage({ messageId, sceneTags }) {
    if (!Number.isInteger(messageId) || messageId < 0) throw new Error('messageId 无效');
    const preset = getActivePreset();
    if (!preset) throw new Error('未找到预设');
    const positive = joinTags(preset.positivePrefix, sceneTags);
    const negative = String(preset.negativePrefix || '');
    const base64 = await generateNovelImageBase64({ prompt: positive, negativePrompt: negative, params: preset.params || {} });
    const url = await saveBase64AsFile(base64, getChatCharacterName(), `novel_${Date.now()}`, 'png');
    const ctx = getContext();
    const message = ctx.chat?.[messageId];
    if (!message) throw new Error('找不到对应楼层消息');
    message.extra ||= {};
    message.extra.media ||= [];
    message.extra.media.push({ url, type: 'image', title: positive, negative, generation_type: 'xb_novel_draw', source: 'generated' });
    message.extra.media_index = message.extra.media.length - 1;
    message.extra.media_display ||= 'gallery';
    message.extra.inline_image = false;
    const el = document.querySelector(`#chat .mes[mesid="${messageId}"]`);
    if (el) appendMediaToMessage(message, el);
    await ctx.saveChat();
    return { url, prompt: positive, negative, messageId };
}

async function autoGenerateAndAttachToLastAI() {
    const s = getSettings();
    if (!s.enabled || s.mode !== 'auto' || autoBusy) return null;
    const ctx = getContext();
    const chat = ctx.chat || [];
    if (!chat.length) return null;
    let messageId = chat.length - 1;
    while (messageId >= 0 && chat[messageId]?.is_user) messageId--;
    if (messageId < 0) return null;
    const msg = chat[messageId];
    msg.extra ||= {};
    if (msg.extra.xb_novel_draw?.auto_done) return null;
    autoBusy = true;
    try {
        const sceneTags = await generateSceneTagsFromChat({ messageId });
        const result = await generateAndAttachToMessage({ messageId, sceneTags });
        msg.extra.xb_novel_draw = { auto_done: true, at: Date.now(), sceneTags };
        await ctx.saveChat();
        return result;
    } finally {
        autoBusy = false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Overlay 管理
// ═══════════════════════════════════════════════════════════════════════════

function createOverlay() {
    if (overlayCreated) return;
    overlayCreated = true;

    const isMobile = window.innerWidth <= 768;
    const frameInset = isMobile ? '0px' : '12px';
    const iframeRadius = isMobile ? '0px' : '12px';

    const $overlay = $(`
        <div id="xiaobaix-novel-draw-overlay" style="
            position: fixed !important; inset: 0 !important;
            width: 100vw !important; height: 100vh !important; height: 100dvh !important;
            z-index: 99999 !important; display: none; overflow: hidden !important;
            background: #000 !important;
        ">
            <div class="nd-backdrop" style="
                position: absolute !important; inset: 0 !important;
                background: rgba(0,0,0,.55) !important;
                backdrop-filter: blur(4px) !important;
            "></div>
            <div class="nd-frame-wrap" style="
                position: absolute !important; inset: ${frameInset} !important; z-index: 1 !important;
            ">
                <iframe id="xiaobaix-novel-draw-iframe"
                    src="${HTML_PATH}"
                    style="width:100% !important; height:100% !important; border:none !important;
                           border-radius:${iframeRadius} !important; box-shadow:0 0 30px rgba(0,0,0,.4) !important;
                           background:#1a1a2e !important;">
                </iframe>
            </div>
        </div>
    `);

    $overlay.on('click', '.nd-backdrop', hideOverlay);
    document.body.appendChild($overlay[0]);
    window.addEventListener('message', handleFrameMessage);
}

function showOverlay() {
    if (!overlayCreated) createOverlay();
    document.getElementById('xiaobaix-novel-draw-overlay').style.display = 'block';
    if (frameReady) sendInitData();
}

function hideOverlay() {
    const overlay = document.getElementById('xiaobaix-novel-draw-overlay');
    if (overlay) overlay.style.display = 'none';
}

function sendInitData() {
    const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
    if (!iframe?.contentWindow) return;
    const settings = getSettings();
    iframe.contentWindow.postMessage({
        source: 'LittleWhiteBox-NovelDraw',
        type: 'INIT_DATA',
        settings: {
            enabled: settings.enabled,
            mode: settings.mode,
            selectedPresetId: settings.selectedPresetId,
            presets: settings.presets,
            api: {
                mode: settings.api?.mode || 'tavern',
                apiKey: settings.api?.apiKey || '',
            },
        }
    }, '*');
}

// ═══════════════════════════════════════════════════════════════════════════
// iframe 通讯
// ═══════════════════════════════════════════════════════════════════════════

function handleFrameMessage(event) {
    const data = event.data;
    if (!data || data.source !== 'NovelDraw-Frame') return;

    const settings = getSettings();

    switch (data.type) {
        case 'FRAME_READY':
            frameReady = true;
            sendInitData();
            break;

        case 'CLOSE':
            hideOverlay();
            break;

        case 'SAVE_MODE':
            settings.mode = data.mode;
            saveSettingsDebounced();
            break;

        case 'SAVE_API_CONFIG':
            settings.api = {
                mode: data.apiMode || 'tavern',
                apiKey: data.apiKey || '',
            };
            saveSettingsDebounced();
            postStatus('success', 'API 设置已保存');
            break;

        case 'TEST_API_CONNECTION':
            handleTestConnection(data);
            break;

        case 'SAVE_PRESET':
            settings.selectedPresetId = data.selectedPresetId;
            settings.presets = data.presets;
            saveSettingsDebounced();
            break;

        case 'ADD_PRESET': {
            const id = generateId();
            const base = getActivePreset();
            const copy = base ? JSON.parse(JSON.stringify(base)) : { ...DEFAULT_PRESET };
            copy.id = id;
            copy.name = data.name || `新预设-${settings.presets.length + 1}`;
            settings.presets.push(copy);
            settings.selectedPresetId = id;
            saveSettingsDebounced();
            sendInitData();
            break;
        }

        case 'DUP_PRESET': {
            const base = getActivePreset();
            if (!base) break;
            const id = generateId();
            const copy = JSON.parse(JSON.stringify(base));
            copy.id = id;
            copy.name = `${base.name || '预设'}-副本`;
            settings.presets.push(copy);
            settings.selectedPresetId = id;
            saveSettingsDebounced();
            sendInitData();
            break;
        }

        case 'DEL_PRESET': {
            if (settings.presets.length <= 1) break;
            const idx = settings.presets.findIndex(p => p.id === settings.selectedPresetId);
            if (idx >= 0) settings.presets.splice(idx, 1);
            settings.selectedPresetId = settings.presets[0]?.id ?? null;
            saveSettingsDebounced();
            sendInitData();
            break;
        }

        case 'TEST_PREVIEW':
            handleTestPreview(data);
            break;

        case 'ATTACH_LAST':
            handleAttachLast(data);
            break;

        case 'AI_TAGS_ATTACH':
            handleAiTagsAttach();
            break;
    }
}

async function handleTestConnection(data) {
    try {
        postStatus('loading', '测试连接中...');
        await testApiConnection(data.apiKey, data.apiMode);
        postStatus('success', '连接成功');
    } catch (e) {
        postStatus('error', e?.message || '连接失败');
    }
}

async function handleTestPreview(data) {
    const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
    try {
        postStatus('loading', '生成中...');
        const preset = getActivePreset();
        const positive = joinTags(preset?.positivePrefix, data.sceneTags);
        const base64 = await generateNovelImageBase64({
            prompt: positive,
            negativePrompt: preset?.negativePrefix || '',
            params: preset?.params || {}
        });
        const url = await saveBase64AsFile(base64, getChatCharacterName(), `novel_preview_${Date.now()}`, 'png');
        iframe?.contentWindow?.postMessage({ source: 'LittleWhiteBox-NovelDraw', type: 'PREVIEW_RESULT', url }, '*');
        postStatus('success', '完成');
    } catch (e) {
        postStatus('error', e?.message || '失败');
    }
}

async function handleAttachLast(data) {
    try {
        postStatus('loading', '生成并追加中...');
        const ctx = getContext();
        const chat = ctx.chat || [];
        let messageId = chat.length - 1;
        while (messageId >= 0 && chat[messageId]?.is_user) messageId--;
        if (messageId < 0) throw new Error('没有可追加的AI楼层');
        await generateAndAttachToMessage({ messageId, sceneTags: data.sceneTags || '' });
        postStatus('success', `已追加到楼层 ${messageId + 1}`);
    } catch (e) {
        postStatus('error', e?.message || '失败');
    }
}

async function handleAiTagsAttach() {
    const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
    try {
        postStatus('loading', '生成场景TAG中...');
        const ctx = getContext();
        const chat = ctx.chat || [];
        let messageId = chat.length - 1;
        while (messageId >= 0 && chat[messageId]?.is_user) messageId--;
        if (messageId < 0) throw new Error('没有可追加的AI楼层');
        const tags = await generateSceneTagsFromChat({ messageId });
        iframe?.contentWindow?.postMessage({ source: 'LittleWhiteBox-NovelDraw', type: 'AI_TAGS_RESULT', tags }, '*');
        postStatus('loading', '出图并追加中...');
        await generateAndAttachToMessage({ messageId, sceneTags: tags });
        postStatus('success', `已追加到楼层 ${messageId + 1}`);
    } catch (e) {
        postStatus('error', e?.message || '失败');
    }
}

function postStatus(state, text) {
    const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
    iframe?.contentWindow?.postMessage({ source: 'LittleWhiteBox-NovelDraw', type: 'STATUS', state, text }, '*');
}

// ═══════════════════════════════════════════════════════════════════════════
// 初始化与清理
// ═══════════════════════════════════════════════════════════════════════════

export function openNovelDrawSettings() {
    showOverlay();
}

export function initNovelDraw() {
    if (window?.isXiaobaixEnabled === false) return;
    getSettings();
    events.on(event_types.GENERATION_ENDED, async () => {
        try { await autoGenerateAndAttachToLastAI(); } catch {}
    });
    window.xiaobaixNovelDraw = {
        getSettings,
        generateNovelImageBase64,
        generateAndAttachToMessage,
        generateSceneTagsFromChat,
        autoGenerateAndAttachToLastAI,
        openSettings: openNovelDrawSettings,
    };
    window.registerModuleCleanup?.(MODULE_KEY, cleanupNovelDraw);
}

export function cleanupNovelDraw() {
    events.cleanup();
    hideOverlay();
    overlayCreated = false;
    frameReady = false;
    window.removeEventListener('message', handleFrameMessage);
    document.getElementById('xiaobaix-novel-draw-overlay')?.remove();
    delete window.xiaobaixNovelDraw;
}
