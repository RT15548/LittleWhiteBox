import { ensureDrawVisuals, drawIconHtml } from './draw-visuals.js';
import { getContext } from "../../../../../../extensions.js";
import { formatScenePlannerProgress, toScenePlannerProgress } from './draw-capsule-copy.js';

// 出场角色检测放在 present-characters.js（同样不依赖宿主模块，便于单测），这里保持原有导出位置。
export { detectPresentCharacters };
// 纯函数放在 draw-capsule-copy.js（不依赖酒馆宿主模块，便于单测），这里保持原有导出位置。
export { formatScenePlannerProgress, toScenePlannerProgress };
import {
    getDisplayPreviewForSlot,
    getPreviewsBySlot,
    getPreviewDisplayUrl,
    subscribeGalleryCacheChanges,
    warmSlotPreviewNeighbors,
    getPreview,
    storePreview,
    deletePreview,
} from "./gallery-cache.js";
import { patchImageCard, reportImageCardReadError } from './image-card-view.js';
import { installTextareaAutofit } from './textarea-autofit.js';
import { IMAGE_SAVE_BUTTON_HTML, IMAGE_SAVING_INDICATOR_HTML } from './image-save-ui.js';
import {
    ScenePlannerError,
} from "./scene-plan-contract.js";
import { ScenePlacementError } from './scene-placement.js';
import { getRenderedSceneSlotIds, replaceSceneSlotElements } from './scene-slot-dom.js';
import { getPendingImageJobSlots, PendingJobState } from './pending-image-jobs.js';
import { findImageJobDeliverySlot } from './image-job-delivery-target.js';
import { createDrawImageSlotRegex } from './image-marker-syntax.js';
import { hasPreviewImage, PreviewStatus, DRAW_SLOT_COPY, DRAW_SLOT_ERRORS } from './image-record.js';
import { getSlotActivity } from './slot-activity.js';
import { buildFailedActionsHtml, buildUngeneratedActionsHtml, installImageCardMenu } from './image-card-menu.js';
import { drawMessageViewport } from './draw-message-viewport.js';
import { classifyScenePlannerErrorForUi } from "./scene-planner-error-ui.js";

// 标题模式注入：draw-common 不直接 import draw-settings（会把宿主依赖链拉进各测试
// /轻量 bundle），由三个 provider 宿主在启动时注入读取函数；未注入时回退默认「不显示」。
const IMAGE_TITLE_MODES = ['none', 'overlay', 'collapse'];
let imageTitleSettingsProvider = null;
export function setImageTitleSettingsProvider(provider) {
    imageTitleSettingsProvider = typeof provider === 'function' ? provider : null;
}
function resolveImageTitleMode() {
    try {
        const mode = imageTitleSettingsProvider?.()?.imageTitleMode;
        return IMAGE_TITLE_MODES.includes(mode) ? mode : 'none';
    } catch { return 'none'; }
}
import { detectPresentCharacters } from './present-characters.js';
import { joinTags } from './character-prompts.js';
import { createModuleEvents, event_types } from "../../../core/event-manager.js";
import {
    GENERATE_INTERCEPTOR_ORDER,
    registerGenerateInterceptor,
    unregisterGenerateInterceptor,
} from "../../../shared/common/generate-interceptor.js";

const DRAW_IMAGE_HTML_REGEX = /<div\b[^>]*class=(["'])[^"']*\bxb-nd-img\b[^"']*\1[^>]*>[\s\S]*?<\/div>/gi;
const DRAW_SAVED_EXTRA_KEY = 'xiaobaixDrawSaved';
const LEGACY_NOVEL_SAVED_EXTRA_KEY = 'novelDrawSaved';
let drawPreviewRuntimeEvents = null;
let drawPreviewRuntimeRefs = 0;
let drawPreviewCacheSyncCleanup = null;
let drawPreviewViewCleanup = null;
const drawPreviewRenderQueues = new WeakMap();
const previewSlotContents = new Map();
const previewContentSlots = new Map();
const deferredPreviewSlots = new WeakMap();

export const ImageState = {
    PREVIEW: 'preview',
    SAVING: 'saving',
    SAVED: 'saved',
    REFRESHING: 'refreshing',
    FAILED: 'failed',
};

export const ErrorType = {
    INPUT: { code: 'input', label: '正文输入', desc: '正文没有可用的配图内容' },
    NETWORK: { code: 'network', label: '网络', desc: '连接超时或网络不稳定' },
    AUTH: { code: 'auth', label: '认证', desc: '认证信息无效或过期' },
    QUOTA: { code: 'quota', label: '额度', desc: '额度不足' },
    BUSY: { code: 'busy', label: '繁忙', desc: '当前并发繁忙，请稍后重试' },
    PARSE: { code: 'parse', label: '解析失败', desc: 'LLM 输出未解析为图片任务' },
    LLM: { code: 'llm', label: 'LLM失败', desc: '场景分析失败' },
    LLM_EMPTY: { code: 'llm_empty', label: '空回', desc: 'LLM 未返回内容' },
    TIMEOUT: { code: 'timeout', label: '超时', desc: '请求超时' },
    AGENT_CONFIG: { code: 'agent_config', label: 'Agent 配置', desc: '共享 Agent 主预设不可用' },
    PROMPT_EXPANSION: { code: 'prompt_expansion', label: 'Prompt 展开', desc: 'Prompt 宏展开失败，请检查提示词中的变量宏' },
    TOOL_PROTOCOL: { code: 'tool_protocol', label: 'Tool 协议', desc: '模型没有按要求调用场景规划 Tool' },
    SCENE_SCHEMA: { code: 'scene_schema', label: '计划校验', desc: '模型提交的场景计划不符合契约' },
    PROVIDER: { code: 'provider', label: 'Provider', desc: '模型 Provider 请求失败' },
    SCENE_PLACEMENT: { code: 'scene_placement', label: '插图位置', desc: '正文位置已变化，未写入图片' },
    ABORTED: { code: 'aborted', label: '已取消', desc: '场景规划已取消' },
    UNKNOWN: { code: 'unknown', label: '错误', desc: '未知错误' },
    JOB_EXPIRED: { code: 'job_expired', label: '后台任务已失效', desc: '后台任务已过期或被清理，可重新生成' },
    JOB_NOT_SUBMITTED: { code: 'job_not_submitted', label: '任务未提交', desc: '后台任务未提交成功，可重新生成' },
};

export const DEFAULT_MESSAGE_FILTER_RULES = [
    { start: '<think>',    end: '</think>' },
    { start: '<thinking>', end: '</thinking>' },
    { start: '<system>',   end: '</system>' },
    { start: '<meta>',     end: '</meta>' },
    { start: '<options>',  end: '</options>' },
    { start: '<WorldState>', end: '</WorldState>' },
    { start: '<state>',    end: '</state>' },
    { start: '<UpdateVariable>', end: '</UpdateVariable>' },
    { start: '<—',         end: '—>' },
    { start: '',           end: '</think>' },
];

export function createPlaceholder(slotId) {
    return `[image:${slotId}]`;
}

function stripDrawImageHtml(text) {
    const value = String(text || '');
    if (!value.includes('xb-nd-img')) return value;
    if (typeof document === 'undefined') return value.replace(DRAW_IMAGE_HTML_REGEX, '');

    const template = document.createElement('template');
    // eslint-disable-next-line no-unsanitized/property -- Local chat markup generated by the draw modules.
    template.innerHTML = value;
    template.content.querySelectorAll('.xb-nd-img').forEach(node => node.remove());
    return template.innerHTML || '';
}

export function stripDrawArtifactsFromMessage(text) {
    return stripDrawImageHtml(text).replace(createDrawImageSlotRegex(), '');
}

export function stripDrawArtifactsFromChat(chat) {
    if (!Array.isArray(chat)) return;
    for (const msg of chat) {
        if (!msg) continue;
        if (typeof msg.mes === 'string') {
            msg.mes = stripDrawArtifactsFromMessage(msg.mes);
        }
        if (typeof msg.content === 'string') {
            msg.content = stripDrawArtifactsFromMessage(msg.content);
        } else if (Array.isArray(msg.content)) {
            for (const part of msg.content) {
                if (part && typeof part.text === 'string') {
                    part.text = stripDrawArtifactsFromMessage(part.text);
                }
            }
        }
    }
}

export function setupDrawGenerateInterceptor(options = {}) {
    const shouldStrip = typeof options.shouldStrip === 'function' ? options.shouldStrip : () => true;
    registerGenerateInterceptor('draw', (chat) => {
        if (!shouldStrip()) return;
        stripDrawArtifactsFromChat(chat);
    }, GENERATE_INTERCEPTOR_ORDER.DRAW);
}

export function cleanupDrawGenerateInterceptor() {
    unregisterGenerateInterceptor('draw');
}

export { joinTags };

export function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function findLastAIMessageId() {
    const ctx = getContext();
    const chat = ctx.chat || [];
    let id = chat.length - 1;
    while (id >= 0 && chat[id]?.is_user) id--;
    return id;
}

export function classifyError(error) {
    if (error instanceof ScenePlannerError) {
        return classifyScenePlannerErrorForUi(error, ErrorType);
    }
    if (error instanceof ScenePlacementError) {
        return { ...ErrorType.SCENE_PLACEMENT, desc: error.message || ErrorType.SCENE_PLACEMENT.desc };
    }
    if (error?.errorType) return error.errorType;
    // 带 HTTP status 的后端错误优先按 status 分类：上游正文常常不写数字，靠 message 匹配会退化成未知错误。
    const status = Number(error?.status) || 0;
    if (status === 401 || status === 403) return ErrorType.AUTH;
    if (status === 402) return ErrorType.QUOTA;
    if (status === 429) return ErrorType.BUSY;
    if (status === 408 || status === 504) return ErrorType.TIMEOUT;
    const msg = String(error?.message || error || '').toLowerCase();
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) return ErrorType.NETWORK;
    if (msg.includes('401') || msg.includes('key') || msg.includes('auth')) return ErrorType.AUTH;
    if (msg.includes('429') || msg.includes('too many requests') || msg.includes('rate limit') || msg.includes('请求频繁') || msg.includes('busy')) return ErrorType.BUSY;
    if (msg.includes('402') || msg.includes('anlas') || msg.includes('quota')) return ErrorType.QUOTA;
    if (msg.includes('timeout') || msg.includes('abort')) return ErrorType.TIMEOUT;
    if (msg.includes('输出为空') || msg.includes('empty_output') || msg.includes('未返回内容')) return ErrorType.LLM_EMPTY;
    if (msg.includes('parse') || msg.includes('json')) return ErrorType.PARSE;
    if (msg.includes('无法解析') || msg.includes('未解析到图片任务')) return ErrorType.PARSE;
    if (msg.includes('llm') || msg.includes('xbgenraw')) return ErrorType.LLM;
    return { ...ErrorType.UNKNOWN, desc: error?.message || '未知错误' };
}

export function ensureDrawImageStyles() {
    ensureDrawVisuals();
    installImageCardMenu(document);
    if (document.getElementById('xiaobaix-draw-image-styles')) return;
    const style = document.createElement('style');
    style.id = 'xiaobaix-draw-image-styles';
    style.textContent = `
.xb-nd-img{margin:0.8em 0;text-align:center;position:relative;display:block;width:100%;border-radius:14px;padding:4px;box-sizing:border-box;color:var(--draw-text-primary)}
.xb-nd-img[data-state="preview"]{outline:1px dashed var(--draw-border-focus);outline-offset:-1px}
.xb-nd-img[data-state="failed"]{border:1px dashed var(--draw-danger);background:var(--draw-bg-secondary);padding:20px}
.xb-nd-img:is([data-state="pending"],[data-state="ungenerated"]){border:1px dashed var(--draw-border);background:var(--draw-bg-secondary);padding:18px;color:inherit}
.xb-nd-img.busy img{opacity:0.5}
.xb-nd-img-wrap{position:relative;overflow:hidden;border-radius:10px;touch-action:pan-y pinch-zoom}
.xb-nd-img img{width:auto;height:auto;max-width:100%;border-radius:10px;cursor:pointer;box-shadow:0 3px 15px rgba(0,0,0,0.25);display:block;user-select:none;-webkit-user-drag:none;transition:transform 0.25s ease,opacity 0.2s ease}
.xb-nd-img img.sliding-left{animation:ndSlideOutLeft 0.25s ease forwards;will-change:transform,opacity}
.xb-nd-img img.sliding-right{animation:ndSlideOutRight 0.25s ease forwards;will-change:transform,opacity}
.xb-nd-img img.sliding-in-left{animation:ndSlideInLeft 0.25s ease forwards;will-change:transform,opacity}
.xb-nd-img img.sliding-in-right{animation:ndSlideInRight 0.25s ease forwards;will-change:transform,opacity}
@keyframes ndSlideOutLeft{from{transform:translateX(0);opacity:1}to{transform:translateX(-30%);opacity:0}}
@keyframes ndSlideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(30%);opacity:0}}
@keyframes ndSlideInLeft{from{transform:translateX(30%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes ndSlideInRight{from{transform:translateX(-30%);opacity:0}to{transform:translateX(0);opacity:1}}
.xb-nd-nav-pill{position:absolute;bottom:10px;left:10px;display:inline-flex;align-items:center;gap:2px;background:var(--draw-bg-secondary);border-radius:20px;padding:4px 6px;font-size:12px;color:var(--draw-text-primary);font-weight:500;user-select:none;z-index:5;opacity:0.72;transition:opacity 0.2s}
.xb-nd-nav-pill:hover{opacity:0.92}
.xb-nd-nav-arrow{width:24px;height:24px;border:none;background:transparent;color:var(--draw-text-primary);cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:14px;transition:background 0.15s,color 0.15s;padding:0}
.xb-nd-nav-arrow:hover{background:var(--draw-accent-soft);color:var(--draw-text-primary)}
.xb-nd-nav-arrow:disabled{opacity:0.3;cursor:not-allowed}
.xb-nd-nav-text{min-width:36px;text-align:center;font-variant-numeric:tabular-nums;padding:0 2px}
@media(hover:none),(pointer:coarse){.xb-nd-nav-pill{opacity:0.78;padding:5px 8px}}
.xb-nd-menu-wrap{position:absolute;top:8px;right:8px;z-index:10}
.xb-nd-menu-wrap.busy{pointer-events:none;opacity:0.3}
.xb-nd-menu-trigger{width:32px;height:32px;border-radius:50%;border:none;background:var(--draw-bg-secondary);color:var(--draw-text-primary);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all 0.15s;opacity:0.85}
.xb-nd-menu-trigger:hover,.xb-nd-menu-wrap.open .xb-nd-menu-trigger{background:var(--draw-bg-tertiary);opacity:1}
.xb-nd-menu-wrap.open .xb-nd-dropdown{display:flex;opacity:1;visibility:visible;transform:translateY(0) scale(1);pointer-events:auto}
.xb-nd-dropdown{position:absolute;top:calc(100% + 4px);right:0;background:var(--draw-bg-secondary);border:1px solid var(--draw-border);border-radius:16px;padding:4px;display:none;flex-direction:column;gap:2px;opacity:0;visibility:hidden;transform:translateY(-4px) scale(0.96);transform-origin:top right;transition:all 0.15s ease;box-shadow:0 8px 24px rgba(0,0,0,0.4);pointer-events:none}
.xb-nd-dropdown button{width:32px;height:32px;border:none;background:transparent;color:var(--draw-text-primary);cursor:pointer;font-size:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background 0.15s;padding:0;margin:0}
.xb-nd-dropdown button:hover{background:var(--draw-accent-soft)}
.xb-nd-dropdown [data-action="delete-image"]{color:var(--draw-danger)}
.xb-nd-indicator{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--draw-bg-secondary);padding:8px 16px;border-radius:8px;color:var(--draw-text-primary);font-size:12px;z-index:10}
/* 圖片標題（overlay 模式）：懸停或 title-show 時浮現的圖頂細條 */
.xb-nd-title-bar{position:absolute;top:0;left:0;right:0;z-index:6;pointer-events:none;display:flex;align-items:center;min-height:22px;padding:3px 44px 3px 10px;background:rgba(0,0,0,0.55);font-size:13px;line-height:1.4;letter-spacing:0.02em;color:rgba(255,255,255,0.95);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px rgba(0,0,0,0.6);opacity:0;transition:opacity 0.2s ease}
.xb-nd-img-wrap:hover .xb-nd-title-bar,.xb-nd-img-wrap.title-show .xb-nd-title-bar{opacity:1}
@media(hover:none),(pointer:coarse){.xb-nd-title-bar{opacity:1}}
/* 圖片標題（collapse 模式）：details 收縮到內容寬並置中；摺疊標題列寬度吃 JS 量得的
   圖片實寬（--xb-img-w），變量未就緒時 auto 回退為貼文字的初始膠囊。 */
.xb-nd-details{width:fit-content;max-width:100%;margin:0 auto;border-radius:10px;overflow:hidden}
.xb-nd-summary{list-style:none;cursor:pointer;width:var(--xb-img-w,auto);max-width:100%;box-sizing:border-box;padding:4px 8px;background:#12151c;border:1px solid #fff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1.3;color:#fff;text-shadow:none;user-select:none}
.xb-nd-summary::-webkit-details-marker{display:none}
.xb-nd-summary span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:none}
/* 摺疊時懸浮的編輯彈窗必須隨之隱藏（JS 會把內聯 display 重置為 none，這條兜底防閃現） */
.xb-nd-details:not([open]) ~ .xb-nd-edit{display:none!important}
.xb-nd-status-overlay{position:absolute;inset:auto 8px 8px;z-index:11;padding:12px;border-radius:10px;background:var(--draw-bg-tertiary);color:var(--draw-text-primary);max-height:calc(100% - 16px);overflow:auto}
.xb-nd-status-overlay .xb-nd-indicator{position:static;transform:none;background:none;padding:0}
.xb-nd-view-notice{padding:12px;overflow-wrap:anywhere}
.xb-nd-view-notice button{margin-inline-start:8px;min-height:44px;padding:6px 12px;border:1px solid var(--draw-border);border-radius:8px;background:var(--draw-accent-soft);color:inherit;cursor:pointer}
.xb-nd-view-empty .xb-nd-img-wrap{padding:12px;border:1px solid var(--draw-border);background:var(--draw-bg-secondary)}
.xb-nd-view-empty img{display:none}
.xb-nd-view-empty .xb-nd-nav-pill{position:static;margin-inline-end:40px}
.xb-nd-view-empty .xb-nd-menu-wrap{top:16px;right:16px}
.xb-nd-view-empty .xb-nd-view-notice{padding:12px 0 0}
.xb-nd-view-empty .xb-nd-status-overlay{position:static;max-height:none}
.xb-nd-edit{animation:nd-slide-up 0.2s ease-out;box-sizing:border-box;flex-direction:column;max-height:calc(100dvh - 32px)}
.xb-nd-edit-overlay{max-height:min(calc(100% - 16px),calc(100dvh - 32px))}
.xb-nd-edit-scroll{min-height:0;overflow-y:auto;margin-bottom:8px}
.xb-nd-edit-scroll::-webkit-scrollbar{width:4px}
.xb-nd-edit-scroll::-webkit-scrollbar-thumb{background:var(--draw-border);border-radius:2px}
.xb-nd-edit-group{margin-bottom:8px}
.xb-nd-edit-group:last-child{margin-bottom:0}
.xb-nd-edit-group-label{font-size:11px;color:inherit;opacity:.8;margin-bottom:4px}
.xb-nd-edit-input{display:block;box-sizing:border-box;width:100%;background:var(--draw-bg-input);border:1px solid var(--draw-border);border-radius:6px;color:inherit;font-size:12px;padding:8px;resize:vertical;font-family:monospace}
.xb-nd-edit-actions{display:flex;flex-shrink:0;flex-wrap:wrap;gap:6px;margin-top:8px}
.xb-nd-edit-actions button{min-height:36px;padding:6px 12px;border:1px solid var(--draw-border);background:var(--draw-accent-soft);border-radius:6px;color:inherit;cursor:pointer;white-space:nowrap}
.xb-nd-edit-actions [data-action="save-tags"]{flex:1;background:var(--draw-accent-soft)}
.xb-nd-img button:focus-visible,.xb-nd-img summary:focus-visible,.xb-nd-edit-input:focus-visible{outline:2px solid currentColor;outline-offset:2px}
.xb-nd-failed-icon{display:inline-block;color:var(--draw-danger);font-size:14px;margin-inline-end:6px}
.xb-nd-failed-title{display:inline;color:inherit;font-size:13px}
.xb-nd-failed-desc{color:inherit;opacity:.75;font-size:12px;margin:8px 0 12px;overflow-wrap:anywhere}
.xb-nd-failed-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.xb-nd-failed-btns button{min-height:44px;padding:8px 16px;border-radius:8px;font-size:12px;cursor:pointer;transition:all 0.15s}
.xb-nd-failed-btns .xb-nd-more-btn{box-sizing:border-box;min-width:44px;padding:0 12px;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--draw-border);background:var(--draw-bg-input);color:inherit}
.xb-nd-more-btn svg{display:block;width:16px;height:16px;fill:currentColor}
.xb-nd-more-btn:hover,.xb-nd-more-btn[aria-expanded="true"]{background:var(--draw-accent-soft)}
.xb-nd-more{display:inline-flex}
.xb-nd-more-menu{position:fixed;z-index:1000;display:flex;flex-direction:column;gap:2px;min-width:148px;max-width:calc(100vw - 16px);padding:4px;box-sizing:border-box;overflow-y:auto;text-align:left;background:var(--draw-bg-secondary);color:var(--draw-text-primary);border:1px solid var(--draw-border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.4);backdrop-filter:blur(12px)}
.xb-nd-more-menu[hidden]{display:none}
.xb-nd-more-menu .xb-nd-more-item{display:flex;align-items:center;width:100%;min-height:36px;padding:7px 10px;box-sizing:border-box;border:0;border-radius:6px;background:none;color:inherit;font-size:13px;text-align:left;white-space:nowrap;cursor:pointer}
.xb-nd-more-menu .xb-nd-more-item:hover,.xb-nd-more-menu .xb-nd-more-item:focus-visible{background:var(--draw-accent-soft);outline:none}
.xb-nd-more-menu .xb-nd-more-item:focus-visible{outline:2px solid currentColor;outline-offset:-2px}
.xb-nd-more-menu .xb-nd-more-item.is-danger{color:var(--draw-danger)}
.xb-nd-more-sep{height:1px;margin:2px 4px;background:var(--draw-border)}
@media(hover:none),(pointer:coarse){.xb-nd-more-menu .xb-nd-more-item{min-height:44px}}
.xb-nd-tag-actions{display:inline-flex;margin-inline-start:12px;vertical-align:middle}
.xb-nd-tag-actions button{min-height:44px;min-width:64px}
.xb-nd-retry-btn{border:1px solid var(--draw-border-focus);background:var(--draw-accent-soft);color:inherit}
.xb-nd-img button[aria-busy="true"]{cursor:progress;opacity:.8}
.xb-nd-action-progress{display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap}
.xb-nd-action-spinner{display:inline-block;width:12px;height:12px;box-sizing:border-box;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:xb-nd-action-spin .8s linear infinite}
@keyframes xb-nd-action-spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.xb-nd-action-spinner{animation:none}}
.xb-nd-edit-btn{border:1px solid var(--draw-border);background:var(--draw-bg-input);color:inherit}
.xb-nd-remove-btn{border:1px solid var(--draw-border);background:transparent;color:var(--draw-danger)}
@media(prefers-reduced-motion:reduce){.xb-nd-img img,.xb-nd-edit{animation:none;transition:none}}
@keyframes nd-slide-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeInOut{0%{opacity:0;transform:translateX(-50%) translateY(-10px)}15%{opacity:1;transform:translateX(-50%) translateY(0)}85%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-10px)}}

.xb-nd-img[data-state="pending"] > .xb-nd-indicator{position:static;transform:none;display:inline-flex;align-items:center;gap:8px;background:none;padding:4px;color:var(--draw-text-secondary)}
.xb-nd-edit-overlay{background:var(--draw-bg-secondary);color:var(--draw-text-primary);border:1px solid var(--draw-border)}
`;
    document.head.appendChild(style);
}

export function buildImageHtml({ slotId, imgId, url, tags, title = '', positive, messageId, state = ImageState.PREVIEW, historyCount = 1, currentIndex = 0 }) {
    const escapedTags = escapeHtml(tags);
    const escapedPositive = escapeHtml(positive);
    const isPreview = state === ImageState.PREVIEW;
    const isBusy = state === ImageState.SAVING || state === ImageState.REFRESHING;
    let indicator = '';
    if (state === ImageState.SAVING) indicator = IMAGE_SAVING_INDICATOR_HTML;
    else if (state === ImageState.REFRESHING) indicator = '<div class="xb-nd-indicator"><i class="fa-solid fa-rotate" aria-hidden="true"></i> 生成中...</div>';

    const lazyAttr = String(url || '').startsWith('data:') ? '' : 'loading="lazy"';
    // 标题只取 AI 生成的 title；缺省（旧数据/模型漏填）时宁可不显示，也不拿 TAG 充数。
    const rawTitle = String(title || '').trim();
    const titleMode = resolveImageTitleMode();
    const displayVersion = historyCount - currentIndex;
    const navPill = `<div class="xb-nd-nav-pill" data-total="${historyCount}" data-current="${currentIndex}">
        <button class="xb-nd-nav-arrow" data-action="nav-prev" title="上一版本" ${currentIndex >= historyCount - 1 ? 'disabled' : ''}>${drawIconHtml('chevron-left')}</button>
        <span class="xb-nd-nav-text">${displayVersion} / ${historyCount}</span>
        <button class="xb-nd-nav-arrow" data-action="nav-next" title="${currentIndex === 0 ? '重新生成' : '下一版本'}">${drawIconHtml('chevron-right')}</button>
    </div>`;
    const menuBusy = isBusy ? ' busy' : '';
    const menuHtml = `<div class="xb-nd-menu-wrap${menuBusy}">
        <button class="xb-nd-menu-trigger" data-action="toggle-menu" title="操作">${drawIconHtml('ellipsis')}</button>
        <div class="xb-nd-dropdown">
            ${isPreview ? IMAGE_SAVE_BUTTON_HTML : ''}
            <button data-action="refresh-image" title="重新生成">${drawIconHtml('rotate')}</button>
            <button data-action="edit-tags" title="编辑TAG">${drawIconHtml('pen')}</button>
            <button data-action="delete-image" title="删除">${drawIconHtml('xmark')}</button>
        </div>
    </div>`;

    const imageWrap = `<div class="xb-nd-img-wrap" data-total="${historyCount}">
    <img src="${escapeHtml(url)}" style="max-width:100%;width:auto;height:auto;border-radius:10px;cursor:pointer;box-shadow:0 3px 15px rgba(0,0,0,0.25);${isBusy ? 'opacity:0.5;' : ''}" data-action="open-gallery" ${lazyAttr}>
    ${titleMode === 'overlay' && rawTitle ? `<div class="xb-nd-title-bar" title="${escapeHtml(rawTitle)}">${escapeHtml(rawTitle)}</div>` : ''}
    ${indicator}
    ${navPill}
    ${menuHtml}
</div>`;
    // 摺疊標題列寬度由 JS 量得的圖片實寬寫入 --xb-img-w（見 syncCollapseTitleWidths）；
    // 摺疊後主圖被 details 隱藏也能保持與圖片同寬；變量未就緒時回退初始的文字膠囊。
    const imageFrame = (titleMode === 'collapse' && rawTitle)
        ? `<details class="xb-nd-details">
    <summary class="xb-nd-summary"><span>${escapeHtml(rawTitle.slice(0, 20))}</span></summary>
${imageWrap}
</details>`
        : imageWrap;

    return `<div class="xb-nd-img ${isBusy ? 'busy' : ''}" data-slot-id="${slotId}" data-img-id="${imgId}" data-tags="${escapedTags}" data-positive="${escapedPositive}" data-mesid="${messageId}" data-state="${state}" data-current-index="${currentIndex}" data-history-count="${historyCount}" style="margin:0.8em auto;position:relative;display:block;width:fit-content;max-width:100%;border-radius:14px;padding:4px;">
${imageFrame}
${buildTagEditor(tags, false)}
</div>`;
}

// 版本切换时只换 img 不重建卡片，标题条/折叠摘要里的文字需要就地同步成新版本的 title。
export function syncImageTitleElements(container, title = '') {
    if (!container?.querySelector) return;
    const rawTitle = String(title || '').trim();
    const bar = container.querySelector('.xb-nd-title-bar');
    if (bar) {
        bar.textContent = rawTitle;
        bar.setAttribute('title', rawTitle);
    }
    const summary = container.querySelector('.xb-nd-summary span');
    if (summary) {
        summary.textContent = rawTitle ? rawTitle.slice(0, 20) : '';
    }
    // 版本切換換了主圖 src，摺疊標題列寬度需按新圖重測。
    syncCollapseTitleWidths(container);
}

// 把摺疊標題列寬度釘成圖片實寬（寫入 details 上的 --xb-img-w）。
// 摺疊時主圖被 details 隱藏、clientWidth=0：已量過就沿用展開時的實測值（摺疊瞬間若用
// 父行寬估算會把窄圖的標題列撐成整行寬）；只有從未量過時才用固有寬度兜底估算一次。
export function syncCollapseTitleWidths(scope = document) {
    if (!scope?.querySelectorAll) return;
    const detailsList = typeof scope.matches === 'function' && scope.matches('.xb-nd-details')
        ? [scope]
        : Array.from(scope.querySelectorAll('.xb-nd-details'));
    for (const details of detailsList) {
        const img = details.querySelector('.xb-nd-img-wrap img');
        if (!img) continue;
        const visibleWidth = img.clientWidth || 0;
        const measured = parseFloat(details.style.getPropertyValue('--xb-img-w')) || 0;
        if (visibleWidth > 0) {
            details.style.setProperty('--xb-img-w', `${Math.round(visibleWidth)}px`);
        } else if (!measured && img.naturalWidth) {
            const outer = details.parentElement;
            const available = outer?.clientWidth
                ? outer.clientWidth - 8 // summary 左右 padding
                : img.naturalWidth;
            details.style.setProperty('--xb-img-w', `${Math.max(0, Math.round(Math.min(img.naturalWidth, available)))}px`);
        }
    }
}

const tagEditorAutofit = new WeakMap();

/** Add a labelled tag field shared by the three drawing providers. */
export function appendTagEditGroup(container, { label, value, type, index = null }) {
    const group = document.createElement('div');
    group.className = 'xb-nd-edit-group';
    const labelEl = document.createElement('div');
    labelEl.className = 'xb-nd-edit-group-label';
    labelEl.textContent = label;
    const textarea = document.createElement('textarea');
    textarea.className = 'xb-nd-edit-input';
    textarea.setAttribute('aria-label', label);
    textarea.setAttribute('data-autofit', '');
    textarea.rows = 1;
    textarea.dataset.type = type;
    if (index !== null) textarea.dataset.index = String(index);
    textarea.value = value || '';
    group.append(labelEl, textarea);
    container.appendChild(group);
}

export function showDrawTagEditor(editPanel) {
    editPanel.style.display = 'flex';
    if (!tagEditorAutofit.has(editPanel)) tagEditorAutofit.set(editPanel, installTextareaAutofit(editPanel));
    tagEditorAutofit.get(editPanel).refit();
    editPanel.scrollIntoView({ block: 'nearest' });
    editPanel.querySelector('[data-type="scene"]')?.focus({ preventScroll: true });
}

function buildTagEditor(tags, failed) {
    return `<div class="xb-nd-edit${failed ? '' : ' xb-nd-edit-overlay'}" style="display:none;${failed ? 'margin-top:12px;' : 'position:absolute;bottom:8px;left:8px;right:8px;z-index:15;'}border-radius:10px;padding:10px;text-align:left;">
    <label data-draw-edit-label style="display:block;font-size:11px;margin-bottom:6px;">${DRAW_SLOT_COPY.editTags}</label>
    <textarea class="xb-nd-edit-input" data-autofit rows="1" aria-label="${DRAW_SLOT_COPY.editTags}">${escapeHtml(tags)}</textarea>
    <div class="xb-nd-edit-actions">
        <button data-action="save-tags">${DRAW_SLOT_COPY.saveTags}</button>
        ${failed ? `<button data-action="save-tags-retry">${DRAW_SLOT_COPY.saveAndRetry}</button>` : ''}
        <button data-action="cancel-edit">${DRAW_SLOT_COPY.cancelEdit}</button>
    </div>
</div>`;
}

// 未完成槽位的统一占位卡。label 由调用方按真实状态给出（等待生成 / 接回后台任务 /
// 等待重新连接…），绝不伪造进度：chat 正文里只持久化 [image:slotId] 这个排版事实，
// 状态文案永远是当前运行时和后端状态动态渲染出来的。
export function buildPendingImageHtml({ slotId, messageId, index = 0, total = 0, label = '等待生成', loading = false }) {
    const progress = total > 0 ? `${Math.max(1, Number(index) || 1)} / ${total}` : '';
    return `<div class="xb-nd-img" data-slot-id="${escapeHtml(slotId)}" data-mesid="${escapeHtml(messageId)}" data-state="pending"${loading ? ' data-xb-draw-loading' : ''}>
<div class="xb-nd-indicator">${drawIconHtml('clock')} ${escapeHtml(label)}${progress ? ` · ${progress}` : ''}</div>
</div>`;
}

function getMesTextElement(messageId) {
    const id = Number(messageId);
    if (!Number.isInteger(id) || id < 0) return null;
    return document.querySelector(`#chat .mes[mesid="${id}"] .mes_text`);
}

export function isMessageBeingEdited(messageId) {
    const id = Number(messageId);
    if (!Number.isInteger(id) || id < 0) return false;
    const mesElement = document.querySelector(`.mes[mesid="${id}"]`);
    if (!mesElement) return false;
    return mesElement.querySelector('textarea.edit_textarea') !== null || mesElement.classList.contains('editing');
}

export function isAnyMessageBeingEdited() {
    return document.querySelector('#chat .mes.editing, #chat .mes textarea.edit_textarea') !== null;
}

export function buildDrawSlotSelector(slotId) {
    const escaped = Array.from(String(slotId ?? '')).map((char) => {
        const code = char.codePointAt(0);
        if (char === '\0') return '\\fffd ';
        if ((code >= 1 && code <= 31) || code === 127) return `\\${code.toString(16)} `;
        if (char === '"' || char === '\\') return `\\${char}`;
        return char;
    }).join('');
    return `.xb-nd-img[data-slot-id="${escaped}"]`;
}

export function extractSlotIds(mes) {
    const ids = new Set();
    if (!mes) return ids;
    let match;
    const regex = createDrawImageSlotRegex();
    while ((match = regex.exec(mes)) !== null) ids.add(match[1]);
    return ids;
}

// Project an existing text slot immediately, before gallery I/O. This is only a
// loading surface: it cannot create slots, claim requests or rebuild host text.
function mountImageSlotShells(content, messageId, message) {
    const replacements = [...extractSlotIds(message.mes)]
        .filter(slotId => !content.querySelector(buildDrawSlotSelector(slotId)))
        .map(slotId => {
            const activity = getSlotActivity(slotId);
            return { slotId, html: buildPendingImageHtml({ slotId, messageId, loading: true,
                label: activity?.label || DRAW_SLOT_COPY.loading,
                index: activity ? activity.index + 1 : 0, total: activity?.total || 0 }) };
        });
    replaceSceneSlotElements(content, replacements, { shouldReplaceExisting: () => false });
}

async function persistChatSilently() {
    const ctx = getContext();
    if (!ctx?.saveChat) return;
    await Promise.resolve(ctx.saveChat());
}

function getSavedMap(message, key) {
    const savedMap = message?.extra?.[key];
    return savedMap && typeof savedMap === 'object' ? savedMap : null;
}

function ensureMessageExtra(message) {
    if (!message) return null;
    if (!message.extra || typeof message.extra !== 'object') {
        message.extra = {};
    }
    return message.extra;
}

function ensureSavedMap(message, key) {
    const extra = ensureMessageExtra(message);
    if (!extra) return null;
    if (!extra[key] || typeof extra[key] !== 'object') {
        extra[key] = {};
    }
    return extra[key];
}

function normalizeDrawSavedEntry(slotId, data = {}) {
    if (!slotId || !data?.savedUrl) return null;
    return {
        slotId,
        imgId: data.imgId || '',
        savedUrl: data.savedUrl,
        tags: data.tags || '',
        title: data.title || '',
        positive: data.positive || '',
        characterPrompts: data.characterPrompts ?? null,
        negativePrompt: data.negativePrompt ?? null,
        postPrompt: data.postPrompt ?? null,
        orientation: data.orientation ?? null,
        updatedAt: Number.isFinite(data.updatedAt) ? data.updatedAt : Date.now(),
    };
}

export function getDrawSavedEntry(message, slotId) {
    if (!slotId) return null;
    const current = normalizeDrawSavedEntry(slotId, getSavedMap(message, DRAW_SAVED_EXTRA_KEY)?.[slotId]);
    if (current) return current;
    return normalizeDrawSavedEntry(slotId, getSavedMap(message, LEGACY_NOVEL_SAVED_EXTRA_KEY)?.[slotId]);
}

export function getDrawSavedPreview(message, slotId, messageId, chatId) {
    const saved = getDrawSavedEntry(message, slotId);
    return saved ? { ...saved, imgId: saved.imgId || `saved-${slotId}`,
        messageId, chatId, characterName: message.name || '', status: PreviewStatus.SUCCESS } : null;
}

// A portable chat reference becomes a regular history version before an action
// can replace it. Editors and redraw delivery share this one materialization.
export async function materializeDrawSavedPreview(message, slotId, { messageId, chatId, expectedImgId } = {}) {
    const saved = getDrawSavedPreview(message, slotId, messageId, chatId);
    if (expectedImgId && saved?.imgId !== expectedImgId) throw new Error(DRAW_SLOT_COPY.missingRecord);
    if (!saved) return null;
    const sourceChat = getContext().chat;
    const stillSaved = () => {
        const current = getDrawSavedPreview(message, slotId, messageId, chatId);
        // Saved metadata may outlive a deletion (notably when saving then
        // switching chats). The original message/slot, including inactive
        // branches, owns archival authority; a portable URL alone does not.
        return sourceChat.includes(message) && findImageJobDeliverySlot([message], slotId)
            && current?.imgId === saved.imgId && current.savedUrl === saved.savedUrl;
    };
    if (!stillSaved()) throw new Error(DRAW_SLOT_COPY.sourceChanged);
    const existing = await getPreview(saved.imgId);
    if (!stillSaved()) throw new Error(DRAW_SLOT_COPY.sourceChanged);
    if (existing) {
        if (existing.slotId !== slotId) throw new Error(DRAW_SLOT_COPY.missingRecord);
        return existing;
    }
    await storePreview(saved);
    // Explicit deletion can finish while IndexedDB is yielding. An archive is
    // not an independent image purchase and must not resurrect that old image.
    if (!stillSaved()) {
        await deletePreview(saved.imgId);
        throw new Error(DRAW_SLOT_COPY.sourceChanged);
    }
    return saved;
}

export async function setDrawSavedEntry(messageId, slotId, data) {
    const ctx = getContext();
    const message = ctx.chat?.[messageId];
    const entry = normalizeDrawSavedEntry(slotId, data);
    if (!message || !entry) return false;

    const savedMap = ensureSavedMap(message, DRAW_SAVED_EXTRA_KEY);
    if (!savedMap) return false;

    const previous = savedMap[slotId];
    const unchanged = previous &&
        previous.imgId === entry.imgId &&
        previous.savedUrl === entry.savedUrl &&
        previous.tags === entry.tags &&
        previous.title === entry.title &&
        previous.positive === entry.positive &&
        previous.negativePrompt === entry.negativePrompt &&
        previous.postPrompt === entry.postPrompt &&
        previous.orientation === entry.orientation &&
        JSON.stringify(previous.characterPrompts) === JSON.stringify(entry.characterPrompts);
    const legacyMap = getSavedMap(message, LEGACY_NOVEL_SAVED_EXTRA_KEY);
    const hasLegacyEntry = !!legacyMap?.[slotId];
    if (unchanged && !hasLegacyEntry) return true;

    savedMap[slotId] = entry;
    if (hasLegacyEntry) {
        delete legacyMap[slotId];
        if (Object.keys(legacyMap).length === 0) {
            delete message.extra[LEGACY_NOVEL_SAVED_EXTRA_KEY];
        }
    }
    await persistChatSilently();
    return true;
}

// Synchronous message edit for callers that already own the subsequent save.
export function removeDrawSavedEntry(message, slotId) {
    if (!message?.extra || !slotId) return false;

    let changed = false;
    for (const key of [DRAW_SAVED_EXTRA_KEY, LEGACY_NOVEL_SAVED_EXTRA_KEY]) {
        const savedMap = getSavedMap(message, key);
        if (!savedMap?.[slotId]) continue;
        delete savedMap[slotId];
        changed = true;
        if (Object.keys(savedMap).length === 0) delete message.extra[key];
    }

    return changed;
}

export async function clearDrawSavedEntry(messageId, slotId) {
    if (!removeDrawSavedEntry(getContext().chat?.[messageId], slotId)) return false;
    await persistChatSilently();
    return true;
}

export async function syncDrawSavedFromPreview(messageId, preview, overrides = {}) {
    const slotId = overrides.slotId || preview?.slotId;
    if (!slotId) return false;

    return setDrawSavedEntry(messageId, slotId, { ...preview, ...overrides });
}

export async function syncDrawSavedAfterDeletion(messageId, slotId, deletedImgId, remainingPreviews = []) {
    const message = getContext().chat?.[messageId];
    const currentSaved = getDrawSavedEntry(message, slotId);
    if (!currentSaved) return false;
    if (deletedImgId && currentSaved.imgId && currentSaved.imgId !== deletedImgId) return false;

    const replacement = remainingPreviews.find(item => item?.savedUrl);
    if (replacement) return syncDrawSavedFromPreview(messageId, replacement, { slotId });
    return clearDrawSavedEntry(messageId, slotId);
}

export function insertPreviewIntoRenderedMessage({ messageId, slotId, html }) {
    const mesTextEl = getMesTextElement(messageId);
    if (!mesTextEl || !slotId || !html) return false;
    const insertedSlotIds = replaceSceneSlotElements(mesTextEl, [{ slotId, html }]);
    if (insertedSlotIds.has(slotId)) return true;
    return mesTextEl.querySelector(buildDrawSlotSelector(slotId)) !== null;
}

async function resolveRenderPreviewForSlot(message, messageId, slotId) {
    const display = await getDisplayPreviewForSlot(slotId);
    const savedEntry = getDrawSavedPreview(message, slotId, messageId);
    // The gallery selection is the explicit choice, also after a detached
    // delivery or recovery. A chat's saved URL is only a portable fallback; it
    // must not overrule a newer choice (including a selected failed attempt).
    if (savedEntry?.savedUrl && (!display.selectedImgId || display.selectedImgId === savedEntry.imgId)) {
        const previews = await getPreviewsBySlot(slotId);
        const successPreviews = previews.filter(hasPreviewImage);
        const selectedIndex = successPreviews.findIndex(p => p.imgId === savedEntry.imgId);
        const matchedPreview = selectedIndex >= 0 ? successPreviews[selectedIndex] : null;

        return {
            preview: {
                ...matchedPreview,
                slotId,
                imgId: savedEntry.imgId,
                savedUrl: savedEntry.savedUrl,
                tags: savedEntry.tags ?? matchedPreview?.tags ?? '',
                positive: savedEntry.positive ?? matchedPreview?.positive ?? '',
                messageId,
            },
            historyCount: selectedIndex >= 0 ? successPreviews.length : 1,
            currentIndex: selectedIndex >= 0 ? selectedIndex : 0,
            hasData: true,
            isFailed: false,
        };
    }

    return display;
}

function buildUngeneratedImageHtml({ slotId, imgId, messageId, tags, positive }) {
    return `<div class="xb-nd-img" data-slot-id="${escapeHtml(slotId)}" data-img-id="${escapeHtml(imgId)}" data-tags="${escapeHtml(tags)}" data-positive="${escapeHtml(positive)}" data-mesid="${messageId}" data-state="ungenerated" style="margin:0.8em 0;text-align:center;position:relative;padding:12px;">
<div class="xb-nd-failed-title">${DRAW_SLOT_COPY.unclaimed}</div>
${buildUngeneratedActionsHtml()}
${buildTagEditor(tags, true)}
</div>`;
}

export function buildFailedPlaceholderHtml({ slotId, imgId = '', messageId, tags, positive, errorType, errorMessage, historyCount = 0 }) {
    const escapedTags = escapeHtml(tags);
    const escapedPositive = escapeHtml(positive);
    return `<div class="xb-nd-img" data-slot-id="${slotId}" data-img-id="${escapeHtml(imgId)}" data-tags="${escapedTags}" data-positive="${escapedPositive}" data-mesid="${messageId}" data-state="failed">
<div class="xb-nd-failed-icon" aria-hidden="true">${drawIconHtml('triangle-exclamation')}</div>
<div class="xb-nd-failed-title">${escapeHtml(errorType || DRAW_SLOT_COPY.generationFailed)}</div>
<div class="xb-nd-failed-desc">${escapeHtml(errorMessage || '')}</div>
${buildFailedActionsHtml({ historyCount })}
${buildTagEditor(tags, true)}
</div>`;
}

// 整条重写楼层 DOM 会销毁其它扩展（如酒馆助手）挂在 <pre> 上已渲染的 iframe，而它们只在楼层事件时才重新处理。
// 重写完成后补发 MESSAGE_UPDATED 让它们重新渲染该楼层。楼层里没有 <pre> 时没有可被渲染器挂载的对象，
// 重写不会破坏什么，就不通知，避免无谓地打扰其它监听方。
export async function notifyMessageRewritten(messageId) {
    try {
        if (!getMesTextElement(messageId)?.querySelector('pre')) return;
        const eventSource = getContext()?.eventSource;
        if (eventSource?.emit && event_types?.MESSAGE_UPDATED) {
            await eventSource.emit(event_types.MESSAGE_UPDATED, messageId);
        }
    } catch (error) {
        console.warn('[DrawCommon] 通知楼层重写失败:', error);
    }
}

async function rebuildRenderedMessageFromState(messageId, {
    chatId,
    expectedMessage,
} = {}) {
    const ctx = getContext();
    const message = ctx.chat?.[messageId];
    if (!message || (chatId !== undefined && String(ctx.chatId || '') !== String(chatId || ''))
        || (expectedMessage && message !== expectedMessage) || isMessageBeingEdited(messageId)) return false;
    const { messageFormatting } = await import('../../../../../../../script.js');
    const live = getContext();
    if (String(live.chatId || '') !== String(ctx.chatId || '')
        || live.chat?.[messageId] !== message || isMessageBeingEdited(messageId)) return false;
    const mesTextEl = getMesTextElement(messageId);
    if (!mesTextEl) return false;
    const formatted = messageFormatting(
        message.mes,
        message.name,
        message.is_system,
        message.is_user,
        messageId,
    );
    // eslint-disable-next-line no-unsanitized/property -- Host-generated message markup.
    mesTextEl.innerHTML = formatted;
    mountImageSlotShells(mesTextEl, messageId, message);
    await notifyMessageRewritten(messageId);
    return true;
}

async function renderPreviewsForMessageNow(messageId, {
    refreshSlotIds = [],
    expectedChatId,
    expectedMessage,
    content,
    signal,
} = {}) {
    if (signal?.aborted) return;
    const ctx = getContext();
    const message = ctx.chat?.[messageId];
    const mesTextEl = getMesTextElement(messageId);
    if (!mesTextEl || (content && content !== mesTextEl)) return;
    if (!drawMessageViewport.isActive(mesTextEl)) {
        const deferred = deferredPreviewSlots.get(mesTextEl) || new Set();
        for (const slotId of refreshSlotIds) deferred.add(slotId);
        deferredPreviewSlots.set(mesTextEl, deferred);
        drawMessageViewport.invalidate(mesTextEl);
        return;
    }
    if (!message?.mes
        || String(ctx.chatId || '') !== String(expectedChatId || '')
        || message !== expectedMessage) return;

    const sourceText = message.mes;
    const swipeIndex = message.swipe_id ?? 0;
    const slotIds = extractSlotIds(sourceText);
    const refreshSlots = new Set((Array.isArray(refreshSlotIds) ? refreshSlotIds : [])
        .map(slotId => String(slotId || '').trim())
        .filter(Boolean));
    for (const slotId of refreshSlots) {
        if (!slotIds.has(slotId)) mesTextEl.querySelector(buildDrawSlotSelector(slotId))?.remove();
    }
    if (slotIds.size === 0) return;
    // Projection observes the host's DOM, including filtered/hidden markers.
    // Only an explicit text commit may request a whole-message rebuild.
    const renderedSlots = getRenderedSceneSlotIds(mesTextEl);

    const replacements = [];
    // 待接回的后台任务槽位：只在真的需要判定时读一次，避免每条消息都白跑一次 IndexedDB。
    let pendingSlotsPromise = null;
    const resolvePendingSlot = async (slotId) => {
        pendingSlotsPromise ??= getPendingImageJobSlots();
        return (await pendingSlotsPromise).get(slotId) || null;
    };
    for (const slotId of slotIds) {
        if (!renderedSlots.has(slotId)) continue;
        const existing = mesTextEl.querySelector(buildDrawSlotSelector(slotId));
        if (!refreshSlots.has(slotId) && existing && !existing.hasAttribute('data-xb-draw-loading')) continue;
        let replacementHtml, imageHtml;
        try {
            const displayData = await resolveRenderPreviewForSlot(message, messageId, slotId);
            const activity = getSlotActivity(slotId);
            const pendingSlot = await resolvePendingSlot(slotId);
            if (activity || pendingSlot || displayData.isFailed) {
                const versions = displayData.hasData ? [] : await getPreviewsBySlot(slotId);
                const visibleUrl = existing?.querySelector('img')?.getAttribute('src');
                const retained = displayData.hasData ? displayData.preview
                    : versions.find(item => hasPreviewImage(item) && getPreviewDisplayUrl(item) === visibleUrl)
                        ?? versions.find(hasPreviewImage)
                        ?? getDrawSavedPreview(message, slotId, messageId, String(ctx.chatId));
                if (retained) imageHtml = buildImageHtml({ slotId, imgId: retained.imgId,
                    url: getPreviewDisplayUrl(retained), tags: retained.tags || '', title: retained.title || '', positive: retained.positive || '',
                    messageId, state: retained.savedUrl ? ImageState.SAVED : ImageState.PREVIEW });
            }
            if (activity || pendingSlot) {
                replacementHtml = buildPendingImageHtml({
                    slotId,
                    messageId,
                    index: (activity || pendingSlot).index + 1,
                    total: (activity || pendingSlot).total,
                    label: activity?.label || (pendingSlot.state === PendingJobState.CANCELLING ? '正在取消' : DRAW_SLOT_COPY.generating),
                });
            } else if (displayData.isUngenerated) {
                replacementHtml = buildUngeneratedImageHtml({ slotId, messageId,
                    imgId: displayData.preview.imgId, tags: displayData.preview.tags || '',
                    positive: displayData.preview.positive || '' });
            } else if (displayData.isFailed) {
                const interrupted = displayData.isPending
                    ? (displayData.preview?.status === PreviewStatus.UNKNOWN
                        ? DRAW_SLOT_ERRORS.unknown : DRAW_SLOT_ERRORS.interrupted) : null;
                replacementHtml = buildFailedPlaceholderHtml({
                    slotId,
                    imgId: displayData.preview?.imgId,
                    historyCount: displayData.historyCount,
                    messageId,
                    tags: displayData.failedInfo?.tags || '',
                    positive: displayData.failedInfo?.positive || '',
                    errorType: interrupted?.label || displayData.failedInfo?.errorType || DRAW_SLOT_ERRORS.unavailable.label,
                    errorMessage: displayData.failedInfo?.errorMessage || interrupted?.desc || DRAW_SLOT_ERRORS.unavailable.desc,
                });
            } else if (displayData.hasData && displayData.preview) {
                const url = getPreviewDisplayUrl(displayData.preview);
                replacementHtml = buildImageHtml({
                    slotId,
                    imgId: displayData.preview.imgId,
                    url,
                    tags: displayData.preview.tags || '',
                    title: displayData.preview.title || '',
                    positive: displayData.preview.positive || '',
                    messageId,
                    state: displayData.preview.savedUrl ? ImageState.SAVED : ImageState.PREVIEW,
                    historyCount: displayData.historyCount,
                    currentIndex: displayData.currentIndex ?? 0,
                });
                void warmSlotPreviewNeighbors(slotId, displayData.currentIndex ?? 0).catch((caughtError) => { console.warn({ source: import.meta.url, operation: "renderPreviewsForMessageNow" }, caughtError); });
            } else {
                replacementHtml = buildFailedPlaceholderHtml({
                    slotId,
                    messageId,
                    tags: '',
                    positive: '',
                    errorType: DRAW_SLOT_ERRORS.unavailable.label,
                    errorMessage: DRAW_SLOT_ERRORS.unavailable.desc,
                });
            }
        } catch (error) {
            console.error(`[DrawCommon] 渲染 ${slotId} 失败:`, error);
            replacements.push({ slotId, error });
            continue;
        }
        replacements.push({ slotId, html: replacementHtml, imageHtml });
    }

    if (replacements.length === 0) return;
    const isMounted = () => {
        const live = getContext();
        return !(signal?.aborted || String(live.chatId || '') !== String(ctx.chatId || '')
        || live.chat?.[messageId] !== message
        || (message.swipe_id ?? 0) !== swipeIndex
        || getMesTextElement(messageId) !== mesTextEl
        || isMessageBeingEdited(messageId));
    };
    const isCurrent = () => isMounted() && message.mes === sourceText;
    if (!isCurrent()) return;
    for (const replacement of replacements) {
        const card = mesTextEl.querySelector(buildDrawSlotSelector(replacement.slotId));
        if (!card) continue;
        const retry = () => {
            // A continuation invalidates the old snapshot, not this mounted
            // slot. Re-read current facts; never let the stale load paint them.
            if (isMounted() && extractSlotIds(message.mes).has(replacement.slotId)) {
                void renderPreviewsForMessage(messageId, { refreshSlotIds: [replacement.slotId], content: mesTextEl, signal })
                    .catch(error => console.error(DRAW_SLOT_COPY.renderFailed, error));
            }
        };
        if (replacement.error) reportImageCardReadError(card, replacement.error, retry);
        else patchImageCard(card, replacement, { isCurrent, retry });
    }
}

// 同一楼层只允许一个异步投影在运行。图片落库、恢复状态变化和消息事件可能在同一时刻
// 发起刷新；串行执行保证较早读取的旧事实一定先完成，最后留在 DOM 的总是较新的投影。
// 队列只绑定当前 message 对象，聊天切换或宿主替换消息对象后，旧任务会被上面的身份守卫丢弃。
export function renderPreviewsForMessage(messageId, { refreshSlotIds = [], content, signal } = {}) {
    const ctx = getContext();
    const message = ctx.chat?.[messageId];
    if (!message) return Promise.resolve();
    const expectedChatId = ctx.chatId;

    const root = getMesTextElement(messageId);
    if (signal?.aborted || !root || (content && content !== root) || isMessageBeingEdited(messageId)) return Promise.resolve();
    const requestedSlots = new Set(deferredPreviewSlots.get(root));
    for (const slotId of refreshSlotIds) requestedSlots.add(slotId);
    if (!drawMessageViewport.isActive(root)) {
        deferredPreviewSlots.set(root, requestedSlots);
        drawMessageViewport.invalidate(root);
        return Promise.resolve();
    }
    deferredPreviewSlots.delete(root);
    if (!message.mes) return Promise.resolve();
    indexPreviewSlots(root, extractSlotIds(message.mes));
    drawMessageViewport.write(() => mountImageSlotShells(root, messageId, message));

    let queue = drawPreviewRenderQueues.get(message);
    if (!queue) {
        queue = { tail: Promise.resolve() };
        drawPreviewRenderQueues.set(message, queue);
    }
    const render = queue.tail.then(() => renderPreviewsForMessageNow(messageId, {
        refreshSlotIds: [...requestedSlots],
        expectedChatId,
        expectedMessage: message,
        content,
        signal,
    }));
    const tail = render.catch((caughtError) => { console.warn({ source: import.meta.url, operation: "tail" }, caughtError); });
    queue.tail = tail;
    void tail.then(() => {
        if (queue.tail === tail) drawPreviewRenderQueues.delete(message);
    });
    return render;
}

// Draw Run adoption 会在酒馆完成楼层渲染之后才把 slots 写进 message.mes。
// 仅替换已有 DOM 锚点不够，必须先按宿主规则重建活动楼层，再把 slots 渲染成 pending/图片卡。
export async function syncRenderedMessageFromState(messageId, { chatId, expectedMessage, insertedSlotIds = [] } = {}) {
    // A validated placement commit may already have synchronously handed its
    // slots to the mounted chat view. Do not format that content a second time.
    const ctx = getContext();
    const rendered = getRenderedSceneSlotIds(getMesTextElement(messageId));
    if (insertedSlotIds.length && insertedSlotIds.every(id => rendered.has(id))) {
        if (String(ctx.chatId) !== String(chatId) || ctx.chat?.[messageId] !== expectedMessage) return false;
        await renderPreviewsForMessage(messageId);
        return true;
    }
    const rebuilt = await rebuildRenderedMessageFromState(messageId, { chatId, expectedMessage });
    if (!rebuilt) return false;
    await renderPreviewsForMessage(messageId);
    return true;
}

export async function renderAllDrawPreviews() {
    drawMessageViewport.refresh();
    for (const content of drawMessageViewport.activeContents()) {
        const id = Number(content.closest('.mes')?.getAttribute('mesid'));
        await renderPreviewsForMessage(id, { content });
    }
}

function handleDrawPreviewMessageRendered(data) {
    const messageId = typeof data === 'number' ? data : data?.messageId ?? data?.mesId;
    if (messageId !== undefined) drawMessageViewport.invalidate(getMesTextElement(messageId));
}

function handleDrawPreviewMessageModified(data) {
    const raw = typeof data === 'object' ? (data?.messageId ?? data?.mesId) : data;
    const messageId = parseInt(raw, 10);
    if (Number.isNaN(messageId)) return;
    drawMessageViewport.invalidate(getMesTextElement(messageId));
}

function releasePreviewContent(content) {
    for (const slotId of previewContentSlots.get(content) || []) {
        const owners = previewSlotContents.get(slotId);
        owners?.delete(content);
        if (!owners?.size) previewSlotContents.delete(slotId);
    }
    previewContentSlots.delete(content);
    deferredPreviewSlots.delete(content);
}

function indexPreviewSlots(content, slots) {
    releasePreviewContent(content);
    previewContentSlots.set(content, slots);
    for (const slotId of slots) {
        const owners = previewSlotContents.get(slotId) || new Set();
        owners.add(content);
        previewSlotContents.set(slotId, owners);
    }
}

export function invalidateDrawPreviews({ slotIds = null } = {}) {
    // Only previously admitted views have an index. Unvisited history reads the
    // current cache when it enters the viewport, not on every image write.
    for (const slotId of slotIds === null ? previewSlotContents.keys() : slotIds || []) {
        for (const content of previewSlotContents.get(slotId) || []) {
            const pending = deferredPreviewSlots.get(content) || new Set();
            pending.add(slotId);
            deferredPreviewSlots.set(content, pending);
            drawMessageViewport.invalidate(content);
        }
    }
}

export function startSharedDrawPreviewRuntime() {
    drawPreviewRuntimeRefs++;
    if (drawPreviewRuntimeEvents) return;

    drawPreviewRuntimeEvents = createModuleEvents('drawPreviewRuntime');
    drawPreviewViewCleanup = drawMessageViewport.subscribe({
        refresh: (content, messageId) => {
            void renderPreviewsForMessage(messageId, { content })
                .catch(error => console.error(DRAW_SLOT_COPY.renderFailed, error));
        },
        release: releasePreviewContent,
    });
    drawPreviewRuntimeEvents.on(event_types.CHARACTER_MESSAGE_RENDERED, handleDrawPreviewMessageRendered);
    drawPreviewRuntimeEvents.on(event_types.USER_MESSAGE_RENDERED, handleDrawPreviewMessageRendered);
    drawPreviewRuntimeEvents.on(event_types.CHAT_CHANGED, () => {
        for (const content of previewContentSlots.keys()) releasePreviewContent(content);
        drawMessageViewport.refresh();
        drawMessageViewport.invalidateAll();
    });
    drawPreviewRuntimeEvents.on(event_types.MORE_MESSAGES_LOADED, () => drawMessageViewport.refresh());
    drawPreviewRuntimeEvents.on(event_types.MESSAGE_EDITED, handleDrawPreviewMessageModified);
    drawPreviewRuntimeEvents.on(event_types.MESSAGE_UPDATED, handleDrawPreviewMessageModified);
    drawPreviewRuntimeEvents.on(event_types.MESSAGE_SWIPED, handleDrawPreviewMessageModified);
    drawPreviewCacheSyncCleanup = subscribeGalleryCacheChanges(invalidateDrawPreviews);
}

export function stopSharedDrawPreviewRuntime() {
    drawPreviewRuntimeRefs = Math.max(0, drawPreviewRuntimeRefs - 1);
    if (drawPreviewRuntimeRefs > 0) return;

    drawPreviewRuntimeEvents?.cleanup();
    drawPreviewRuntimeEvents = null;
    drawPreviewCacheSyncCleanup?.();
    drawPreviewCacheSyncCleanup = null;
    drawPreviewViewCleanup?.();
    drawPreviewViewCleanup = null;
}
