import { ensureDrawVisuals } from '../../shared/draw-visuals.js';
import { mountThemeSwitch } from '../../shared/theme-switch.js';
import { getContext } from '../../../../../../../extensions.js';
import { registerToToolbar, removeFromToolbar } from '../../../../widgets/message-toolbar.js';
import { formatScenePlannerProgress } from '../../shared/draw-common.js';
import { DRAW_CAPSULE_COPY } from '../../shared/draw-capsule-copy.js';
import { FLOATING_POPOVER_STYLES, getFloatingViewport, mountFloatingPopovers } from '../../shared/floating-popovers.js';
import { pickPresetMaxImages } from '../../shared/max-images-override.js';
import {
    MAX_IMAGES_INPUT_CLASS,
    MAX_IMAGES_INPUT_CSS,
    createMaxImagesController,
} from '../../shared/max-images-input.js';
import {
    resolveCurrentDrawRunActivityTarget,
    subscribeDrawRunActivity,
} from '../../shared/draw-run-activity.js';
import {
    captureDrawCancellationTarget,
    isDrawCancellationTargetCurrent,
    getPendingDrawWorkState,
} from '../../shared/draw-run-controls.js';
import { isDrawRunPendingError } from '../../shared/draw-run-production.js';
import {
    formatDrawRunProgress,
    getDrawRunProgressIcon,
    hasDrawRunProgressDetail,
    resolveDrawRunActivityDetail,
    resolveDrawRunPendingDetail,
    resolveDrawRunUiState,
    runDrawCancellationAction,
} from '../../shared/draw-run-ui-state.js';
import {
    abortGeneration,
    generateAndInsertImages,
    getSettings,
    openSettings,
    updateSettingsPersistent,
    findLastAIMessageId,
    getGenerationState,
} from './sd-draw.js';

import { FloorImageBusyError } from '../../shared/floor-image-job.js';
import { DRAW_SLOT_COPY } from '../../shared/image-record.js';
import { observeBackgroundTask } from '../../../../shared/common/async-errors.js';


const FLOAT_POS_KEY = 'xb_sd_float_pos';
const AUTO_RESET_DELAY = 8000;
const DRAW_RUN_PROVIDER = 'sd-webui';

const FloatState = {
    IDLE: 'idle',
    SUBMITTING: 'submitting',
    ACCEPTED: 'accepted',
    UNCERTAIN: 'uncertain',
    QUEUED: 'queued',
    LLM: 'llm',
    GEN: 'gen',
    COOLDOWN: 'cooldown',
    RECONNECTING: 'reconnecting',
    CANCELLING: 'cancelling',
    SUCCESS: 'success',
    PARTIAL: 'partial',
    ERROR: 'error',
};

const SIZE_OPTIONS = [
    { value: 'default', label: '跟随预设', width: null, height: null },
    { value: '832x1216', label: '832 × 1216  竖图', width: 832, height: 1216 },
    { value: '1216x832', label: '1216 × 832  横图', width: 1216, height: 832 },
    { value: '1024x1024', label: '1024 × 1024  方图', width: 1024, height: 1024 },
    { value: '768x1280', label: '768 x 1280  大竖', width: 768, height: 1280 },
    { value: '1280x768', label: '1280 x 768  大横', width: 1280, height: 768 },
];

const panelMap = new Map();
const pendingCallbacks = new Map();
let floorObserver = null;

let floatingEl = null;
let floatingDragState = null;
let floatingState = FloatState.IDLE;
let floatingMessageId = null;
let floatingResult = { success: 0, total: 0, error: null, startTime: 0 };
let floatingAutoResetTimer = null;
let floatingCooldownRafId = null;
let floatingCooldownEndTime = 0;
let floatingCache = {};

let stylesInjected = false;
let drawRunActivityDispose = null;

const STYLES = `
.nd-float {
    position: relative;
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.nd-capsule {
    width: 74px;
    height: var(--nd-h);
    background: var(--nd-bg);
    border: 1px solid var(--nd-border);
    border-radius: 17px;
    position: relative;
    overflow: hidden;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.nd-float:hover .nd-capsule {
    background: var(--nd-bg-hover);
    border-color: var(--nd-border-hover);
}
.nd-float.working .nd-capsule { border-color: var(--nd-warning); }
.nd-float.cooldown .nd-capsule { border-color: var(--nd-info); background: color-mix(in srgb, var(--nd-info) 10%, var(--nd-bg)); }
.nd-float.success .nd-capsule { border-color: var(--nd-success); background: color-mix(in srgb, var(--nd-success) 10%, var(--nd-bg)); }
.nd-float.partial .nd-capsule { border-color: var(--nd-warning); background: color-mix(in srgb, var(--nd-warning) 10%, var(--nd-bg)); }
.nd-float.error .nd-capsule { border-color: var(--nd-error); background: color-mix(in srgb, var(--nd-error) 10%, var(--nd-bg)); }

/* 非空闲状态：胶囊右侧多出 24px，放常驻菜单按钮（生成中也能打开菜单/设置） */
.nd-float.working .nd-capsule,
.nd-float.cooldown .nd-capsule,
.nd-float.success .nd-capsule,
.nd-float.partial .nd-capsule,
.nd-float.error .nd-capsule { width: 98px; }
.nd-inner {
    display: grid;
    width: 100%;
    height: 100%;
    grid-template-areas: "s";
    grid-template-rows: minmax(0, 1fr);
    grid-template-columns: minmax(0, 1fr);
    pointer-events: none;
}
.nd-layer {
    grid-area: s;
    min-width: 0;
    min-height: 0;
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    transition: opacity 0.2s, transform 0.2s;
    pointer-events: auto;
}
.nd-layer-idle { opacity: 1; transform: translateY(0); }
.nd-float.working .nd-layer-idle,
.nd-float.cooldown .nd-layer-idle,
.nd-float.success .nd-layer-idle,
.nd-float.partial .nd-layer-idle,
.nd-float.error .nd-layer-idle {
    opacity: 0;
    transform: translateY(-100%);
    pointer-events: none;
}
.nd-btn-draw {
    flex: 1;
    height: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    color: var(--nd-text-primary);
    transition: background 0.15s;
    font-size: 16px;
}
.nd-btn-draw:hover { background: var(--nd-bg-active); }
.nd-btn-draw:active { transform: scale(0.92); }
.nd-auto-dot {
    position: absolute;
    top: 7px;
    right: 6px;
    width: 6px;
    height: 6px;
    background: var(--nd-success);
    border-radius: 50%;
    box-shadow: 0 0 6px var(--nd-success);
    opacity: 0;
    transform: scale(0);
    transition: all 0.2s;
}
.nd-float.auto-on .nd-auto-dot { opacity: 1; transform: scale(1); }
.nd-sep { width: 1px; height: 12px; background: var(--nd-border); }
.nd-btn-menu {
    width: 24px;
    height: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--nd-text-dim);
    font-size: 8px;
    opacity: 0.6;
    transition: opacity 0.25s, transform 0.25s;
}
.nd-float:hover .nd-btn-menu { opacity: 1; }
.nd-btn-menu:hover { background: var(--nd-bg-active); color: var(--nd-text-muted); }

/* 常驻菜单按钮：只在非空闲状态显示（空闲时由 idle 层自己的菜单按钮负责） */
.nd-btn-menu-persist {
    display: none;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    box-sizing: border-box;
    border-left: 1px solid var(--nd-border);
}
.nd-float.working .nd-btn-menu-persist,
.nd-float.cooldown .nd-btn-menu-persist,
.nd-float.success .nd-btn-menu-persist,
.nd-float.partial .nd-btn-menu-persist,
.nd-float.error .nd-btn-menu-persist { display: flex; }
.nd-arrow { transition: transform 0.2s; }
.nd-float.expanded .nd-arrow { transform: rotate(180deg); }
.nd-layer-active {
    box-sizing: border-box;
    padding: 0 6px;
    opacity: 0;
    transform: translateY(100%);
    justify-content: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--nd-text-primary);
    cursor: pointer;
    pointer-events: none;
    transition: opacity 0.2s, transform 0.2s, padding-right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.nd-float.working .nd-layer-active,
.nd-float.cooldown .nd-layer-active,
.nd-float.success .nd-layer-active,
.nd-float.partial .nd-layer-active,
.nd-float.error .nd-layer-active {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
    padding-right: 30px; /* 原 6px + 常驻菜单按钮 24px，文字区宽度保持不变 */
}
.nd-float.cooldown .nd-layer-active { color: var(--nd-info); }
.nd-float.success .nd-layer-active { color: var(--nd-success); }
.nd-float.partial .nd-layer-active { color: var(--nd-warning); }
.nd-float.error .nd-layer-active { color: var(--nd-error); }
.nd-spin { display: inline-block; animation: nd-spin 1.5s linear infinite; }
.nd-status-icon { flex-shrink: 0; }
.nd-status-text { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@keyframes nd-spin { to { transform: rotate(360deg); } }
.nd-countdown { font-variant-numeric: tabular-nums; min-width: 36px; text-align: center; }
.nd-detail {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--nd-bg-solid);
    border: 1px solid var(--nd-border);
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 12px;
    color: var(--nd-text-secondary);
    white-space: nowrap;
    box-shadow: var(--nd-shadow-lg);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s ease, visibility 0.15s;
    z-index: 100;
}
.nd-float.show-detail .nd-detail {
    opacity: 1;
    visibility: visible;
    transform: none;
}
.nd-detail-row { display: flex; align-items: center; gap: 10px; padding: 3px 0; }
.nd-detail-row + .nd-detail-row { margin-top: 6px; padding-top: 8px; border-top: 1px solid var(--nd-border-subtle); }
.nd-detail-icon { opacity: 0.6; font-size: 13px; }
.nd-detail-label { color: var(--nd-text-muted); }
.nd-detail-value { margin-left: auto; font-weight: 600; color: var(--nd-text-primary); }
.nd-detail-value.success { color: var(--nd-success); }
.nd-detail-value.warning { color: var(--nd-warning); }
.nd-detail-value.error { color: var(--nd-error); }
.nd-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 220px;
    background: var(--nd-bg-solid);
    border: 1px solid var(--nd-border);
    border-radius: 12px;
    padding: 10px;
    box-shadow: var(--nd-shadow-lg);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s ease, visibility 0.15s;
    z-index: 100;
}
.nd-float.expanded .nd-menu {
    opacity: 1;
    visibility: visible;
    transform: none;
}
.nd-card { background: transparent; border: none; border-radius: 0; overflow: visible; }
.nd-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 2px;
    min-height: 36px;
}
.nd-label {
    font-size: 11px;
    color: var(--nd-text-muted);
    width: 32px;
    flex-shrink: 0;
}
.nd-select {
    flex: 1;
    min-width: 0;
    background: var(--nd-bg-active);
    border: 1px solid var(--nd-border-subtle);
    color: var(--nd-text-primary);
    font-size: 11px;
    min-height: 32px;
    border-radius: 6px;
    padding: 6px 8px;
    box-sizing: border-box;
    outline: none;
    cursor: pointer;
    text-align: center;
    text-align-last: center;
    transition: border-color 0.2s;
    appearance: none;
}
.nd-select:hover { border-color: var(--nd-border-hover); }
.nd-select:focus { border-color: var(--nd-border-hover); }
.nd-select option { background: var(--nd-bg-solid); color: var(--nd-text-primary); text-align: left; }
.nd-select.size { font-family: "SF Mono", "Menlo", "Consolas", monospace; font-size: 11px; }
${MAX_IMAGES_INPUT_CSS}
.nd-inner-sep { display: none; }
.nd-controls { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.nd-auto {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    background: var(--nd-bg-active);
    border: 1px solid var(--nd-border-subtle);
    border-radius: var(--nd-radius-sm);
    cursor: pointer;
    transition: all 0.15s;
}
.nd-auto:hover { background: var(--nd-bg-active); }
.nd-auto.on { background: color-mix(in srgb, var(--nd-success) 8%, var(--nd-bg)); border-color: var(--nd-success); }
.nd-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--nd-border-hover);
    transition: all 0.2s;
}
.nd-auto.on .nd-dot { background: var(--nd-success); box-shadow: 0 0 8px var(--nd-success); }
.nd-auto-text { font-size: 12px; color: var(--nd-text-muted); }
.nd-auto:hover .nd-auto-text { color: var(--nd-text-secondary); }
.nd-auto.on .nd-auto-text { color: var(--nd-success); }
.nd-gear {
    width: 36px;
    height: 36px;
    border: 1px solid var(--nd-border-subtle);
    border-radius: var(--nd-radius-sm);
    background: var(--nd-bg-active);
    color: var(--nd-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.15s;
}
.nd-gear:hover { background: var(--nd-bg-active); color: var(--nd-text-secondary); }
.nd-floating-global {
    position: fixed;
    z-index: 10000;
    user-select: none;
}
.nd-floating-global .nd-capsule {
    background: var(--nd-bg-solid);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    touch-action: none;
    cursor: grab;
}
.nd-floating-global .nd-capsule:active { cursor: grabbing; }
${FLOATING_POPOVER_STYLES}
`;

function injectStyles() {
    ensureDrawVisuals();
    if (stylesInjected) return;
    stylesInjected = true;
    const el = document.createElement('style');
    el.id = 'xiaobaix-sd-floating-style';
    el.textContent = STYLES;
    document.head.appendChild(el);
}

function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
}

// 常驻菜单按钮：非空闲状态（生成中/成功/失败等）idle 层被隐藏时，仍可点开菜单与设置
function createPersistMenuBtn(arrow) {
    const btn = createEl('button', 'nd-btn-menu nd-btn-menu-persist');
    btn.title = '展开菜单';
    btn.appendChild(createEl('span', 'nd-arrow', arrow));
    return btn;
}

function fillPresetSelect(selectEl) {
    if (!selectEl) return;
    const settings = getSettings();
    const presets = settings.presets || [];
    const currentId = settings.selectedPresetId;
    selectEl.replaceChildren();
    presets.forEach((preset) => {
        const opt = document.createElement('option');
        opt.value = preset.id;
        opt.textContent = preset.name || '未命名';
        if (preset.id === currentId) opt.selected = true;
        selectEl.appendChild(opt);
    });
}

function fillSizeSelect(selectEl) {
    if (!selectEl) return;
    const settings = getSettings();
    const current = settings.overrideSize || 'default';
    selectEl.replaceChildren();
    SIZE_OPTIONS.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        if (opt.value === current) option.selected = true;
        selectEl.appendChild(option);
    });
}

const maxImages = createMaxImagesController({
    getOverride: () => getSettings().overrideMaxImages,
    getPresetMaxImages: () => {
        const settings = getSettings();
        return pickPresetMaxImages(settings.presets, settings.selectedPresetId);
    },
    persistOverride: (next, { okText }) => updateSettingsPersistent(
        (settings) => { settings.overrideMaxImages = next; },
        okText,
    ),
    listInputs: () => [...panelMap.values()].map((data) => data.cache?.maxImagesInput).concat(floatingCache.maxImagesInput),
    notify: (message) => globalThis.toastr?.warning?.(message),
});
function createFloorPanelData(messageId) {
    return {
        messageId,
        root: null,
        state: FloatState.IDLE,
        result: { success: 0, total: 0, error: null, startTime: 0 },
        autoResetTimer: null,
        cooldownRafId: null,
        cooldownEndTime: 0,
        cache: {},
        _cleanup: null,
    };
}

function createFloorPanelElement(messageId) {
    const settings = getSettings();
    const isAuto = settings.mode === 'auto';
    const root = document.createElement('div');
    root.className = `nd-float${isAuto ? ' auto-on' : ''}`;
    root.dataset.messageId = String(messageId);

    const capsule = createEl('div', 'nd-capsule');
    const inner = createEl('div', 'nd-inner');
    const layerIdle = createEl('div', 'nd-layer nd-layer-idle');
    const drawBtn = createEl('button', 'nd-btn-draw');
    drawBtn.title = '点击生成配图';
    drawBtn.append(createEl('span', '', '🎨'), createEl('span', 'nd-auto-dot'));
    const sep = createEl('div', 'nd-sep');
    const menuBtn = createEl('button', 'nd-btn-menu');
    menuBtn.title = '展开菜单';
    menuBtn.append(createEl('span', 'nd-arrow', '▼'));
    layerIdle.append(drawBtn, sep, menuBtn);

    const layerActive = createEl('div', 'nd-layer nd-layer-active');
    layerActive.append(
        createEl('span', 'nd-status-icon', '⏳'),
        createEl('span', 'nd-status-text', DRAW_CAPSULE_COPY.analysis),
    );
    inner.append(layerIdle, layerActive);
    capsule.append(inner, createPersistMenuBtn('▼'));

    const detail = createDetailPopup();
    const menu = createMenu(isAuto);
    root.append(capsule, detail, menu);
    return root;
}

function createDetailPopup() {
    const detail = createEl('div', 'nd-detail');
    const detailRowResult = createEl('div', 'nd-detail-row');
    detailRowResult.append(
        createEl('span', 'nd-detail-icon', '📊'),
        createEl('span', 'nd-detail-label', '结果'),
        createEl('span', 'nd-detail-value nd-result', '-'),
    );
    const detailRowError = createEl('div', 'nd-detail-row nd-error-row');
    detailRowError.style.display = 'none';
    detailRowError.append(
        createEl('span', 'nd-detail-icon', '💡'),
        createEl('span', 'nd-detail-label', '原因'),
        createEl('span', 'nd-detail-value error nd-error', '-'),
    );
    const detailRowTime = createEl('div', 'nd-detail-row');
    detailRowTime.append(
        createEl('span', 'nd-detail-icon', '⏱'),
        createEl('span', 'nd-detail-label', '耗时'),
        createEl('span', 'nd-detail-value nd-time', '-'),
    );
    detail.append(detailRowResult, detailRowError, detailRowTime);
    return detail;
}

function createMenu(isAuto = false) {
    const menu = createEl('div', 'nd-menu');
    const card = createEl('div', 'nd-card');
    const rowPreset = createEl('div', 'nd-row');
    rowPreset.appendChild(createEl('span', 'nd-label', '预设'));
    const presetSelect = createEl('select', 'nd-select nd-preset-select');
    fillPresetSelect(presetSelect);
    rowPreset.appendChild(presetSelect);
    const innerSep = createEl('div', 'nd-inner-sep');
    const rowSize = createEl('div', 'nd-row');
    rowSize.appendChild(createEl('span', 'nd-label', '尺寸'));
    const sizeSelect = createEl('select', 'nd-select size nd-size-select');
    fillSizeSelect(sizeSelect);
    rowSize.appendChild(sizeSelect);
    card.append(rowPreset, innerSep, rowSize, maxImages.createRow());

    const controls = createEl('div', 'nd-controls');
    const autoToggle = createEl('div', `nd-auto${isAuto ? ' on' : ''} nd-auto-toggle`);
    autoToggle.append(
        createEl('span', 'nd-dot'),
        createEl('span', 'nd-auto-text', '自动配图'),
    );
    const settingsBtn = createEl('button', 'nd-gear nd-settings-btn', '⚙');
    settingsBtn.title = '打开设置';
    controls.append(autoToggle, settingsBtn);
    menu.append(card, controls);
    return menu;
}

function cachePanelDOM(panelData) {
    const el = panelData.root;
    if (!el) return;
    panelData.cache = {
        statusIcon: el.querySelector('.nd-status-icon'),
        statusText: el.querySelector('.nd-status-text'),
        result: el.querySelector('.nd-result'),
        errorRow: el.querySelector('.nd-error-row'),
        error: el.querySelector('.nd-error'),
        time: el.querySelector('.nd-time'),
        presetSelect: el.querySelector('.nd-preset-select'),
        sizeSelect: el.querySelector('.nd-size-select'),
        maxImagesInput: el.querySelector(`.${MAX_IMAGES_INPUT_CLASS}`),
        autoToggle: el.querySelector('.nd-auto-toggle'),
    };
}

function clearPanelCooldown(panelData) {
    if (panelData.cooldownRafId) {
        cancelAnimationFrame(panelData.cooldownRafId);
        panelData.cooldownRafId = null;
    }
    panelData.cooldownEndTime = 0;
}

async function syncDrawRunPanelState(messageId, detail = {}) {
    const local = getGenerationState(messageId);
    if (local) { setStateForMessage(messageId, local.state, local.data); return; }
    const target = captureDrawCancellationTarget(messageId);
    // 当前 swipe 最多只有一个 Draw Run；即使用户切换了图片 Provider，
    // 活动任务仍应在新面板可见并可取消。
    const markerState = await getPendingDrawWorkState(messageId).catch(() => null);
    if (!markerState) return;
    if (!isDrawCancellationTargetCurrent(target)) return;
    messageId = getContext().chat.indexOf(target.message);
    const current = getGenerationState(messageId);
    if (current) { setStateForMessage(messageId, current.state, current.data); return; }
    const ctx = getContext();
    const chatId = String(ctx?.chatId || '');
    const message = ctx?.chat?.[Number(messageId)];
    if (!chatId || !message) return;
    const activeSwipeIndex = Number.isInteger(message.swipe_id) ? message.swipe_id : 0;
    const swipeIndex = Number.isSafeInteger(markerState.swipeIndex)
        ? markerState.swipeIndex
        : activeSwipeIndex;
    const provider = markerState.provider || detail?.provider || DRAW_RUN_PROVIDER;
    const runId = markerState.runId || detail?.runId || '';
    const activityTarget = { chatId, messageId, swipeIndex, provider, runId };
    const matchedDetail = resolveDrawRunActivityDetail({
        detail,
        pending: markerState.pending,
        ...activityTarget,
    });
    const effectiveDetail = resolveDrawRunPendingDetail(matchedDetail, markerState, activityTarget);
    const panelData = panelMap.get(messageId);
    if (panelData) {
        const next = resolveDrawRunUiState({
            currentState: panelData.state,
            pending: markerState.pending,
            detail: effectiveDetail,
            ...activityTarget,
        });
        if (next !== panelData.state
            || (next === FloatState.ACCEPTED && hasDrawRunProgressDetail(matchedDetail))) {
            setFloorState(messageId, next, effectiveDetail);
        }
    }
    if (floatingEl && Number(messageId) === findLastAIMessageId()) {
        const next = resolveDrawRunUiState({
            currentState: floatingState,
            pending: markerState.pending,
            detail: effectiveDetail,
            ...activityTarget,
        });
        if (markerState.pending) floatingMessageId = Number(messageId);
        if (next !== floatingState
            || (next === FloatState.ACCEPTED && hasDrawRunProgressDetail(matchedDetail))) {
            setFloatingState(next, effectiveDetail);
        }
    }
}

function syncDrawRunActivity(detail = {}) {
    const currentTarget = resolveCurrentDrawRunActivityTarget(detail, getContext());
    if (!currentTarget) return;
    const lastMessageId = findLastAIMessageId();
    if (panelMap.has(currentTarget.messageId)
        || (floatingEl && currentTarget.messageId === lastMessageId)) {
        observeBackgroundTask(syncDrawRunPanelState(currentTarget.messageId, detail), { source: import.meta.url, operation: "syncDrawRunActivity" });
    }
}

export function refreshDrawRunUiState() {
    const messageId = findLastAIMessageId();
    if (floatingEl) {
        const generation = messageId >= 0 ? getGenerationState(messageId) : null;
        if (generation) {
            floatingMessageId = messageId;
            setFloatingState(generation.state, generation.data);
        } else {
            setFloatingState(FloatState.IDLE);
        }
    }
    if (messageId >= 0) observeBackgroundTask(syncDrawRunPanelState(messageId), { source: import.meta.url, operation: "refreshDrawRunUiState" });
}

function resolveCooldownEndTime({ cooldownUntil, duration } = {}) {
    const absolute = Number(cooldownUntil);
    if (Number.isFinite(absolute) && absolute > 0) return absolute;
    return Date.now() + Math.max(0, Number(duration) || 0);
}

function startFloorCooldownTimer(panelData, data) {
    clearPanelCooldown(panelData);
    panelData.cooldownEndTime = resolveCooldownEndTime(data);
    function tick() {
        if (!panelData.cooldownEndTime) return;
        const remaining = Math.max(0, panelData.cooldownEndTime - Date.now());
        const statusText = panelData.cache?.statusText;
        if (statusText) {
            statusText.textContent = `${(remaining / 1000).toFixed(1)}s`;
            statusText.className = 'nd-status-text nd-countdown';
        }
        if (remaining <= 0) {
            clearPanelCooldown(panelData);
            return;
        }
        panelData.cooldownRafId = requestAnimationFrame(tick);
    }
    panelData.cooldownRafId = requestAnimationFrame(tick);
}

function setFloorState(messageId, state, data = {}) {
    const panelData = panelMap.get(messageId);
    if (!panelData?.root) return;

    const el = panelData.root;
    panelData.state = state;
    if (panelData.autoResetTimer) {
        clearTimeout(panelData.autoResetTimer);
        panelData.autoResetTimer = null;
    }
    if (state !== FloatState.COOLDOWN) {
        clearPanelCooldown(panelData);
    }

    el.classList.remove('working', 'cooldown', 'success', 'partial', 'error', 'show-detail');
    const { statusIcon, statusText } = panelData.cache;
    if (statusText) statusText.className = 'nd-status-text';

    switch (state) {
        case FloatState.IDLE:
            panelData.result = { success: 0, total: 0, error: null, startTime: 0 };
            break;
        case FloatState.SUBMITTING:
            el.classList.add('working');
            if (!panelData.result.startTime) panelData.result.startTime = Date.now();
            if (statusIcon) { statusIcon.textContent = '↥'; statusIcon.className = 'nd-status-icon nd-spin'; }
            if (statusText) statusText.textContent = DRAW_CAPSULE_COPY.submitting;
            break;
        case FloatState.ACCEPTED:
            el.classList.add('working');
            if (!panelData.result.startTime) panelData.result.startTime = Date.now();
            if (statusIcon) { statusIcon.textContent = getDrawRunProgressIcon(data); statusIcon.className = 'nd-status-icon nd-spin'; }
            if (statusText) statusText.textContent = formatDrawRunProgress(data);
            break;
        case FloatState.UNCERTAIN:
            el.classList.add('working');
            if (!panelData.result.startTime) panelData.result.startTime = Date.now();
            if (statusIcon) { statusIcon.textContent = '↻'; statusIcon.className = 'nd-status-icon nd-spin'; }
            if (statusText) statusText.textContent = DRAW_CAPSULE_COPY.uncertain;
            break;
        case FloatState.QUEUED:
            el.classList.add('working');
            if (!panelData.result.startTime) panelData.result.startTime = Date.now();
            if (statusIcon) { statusIcon.textContent = '⌛'; statusIcon.className = 'nd-status-icon'; }
            if (statusText) statusText.textContent = DRAW_CAPSULE_COPY.queued;
            panelData.result.total = data.total || panelData.result.total || 0;
            break;
        case FloatState.LLM:
            el.classList.add('working');
            if (!panelData.result.startTime) panelData.result.startTime = Date.now();
            if (statusIcon) { statusIcon.textContent = '⏳'; statusIcon.className = 'nd-status-icon nd-spin'; }
            if (statusText) statusText.textContent = formatScenePlannerProgress(data);
            break;
        case FloatState.GEN:
            el.classList.add('working');
            if (statusIcon) { statusIcon.textContent = '🎨'; statusIcon.className = 'nd-status-icon nd-spin'; }
            if (statusText) statusText.textContent = `${data.current || 0}/${data.total || 0}`;
            panelData.result.total = data.total || 0;
            break;
        case FloatState.COOLDOWN:
            el.classList.add('cooldown');
            if (statusIcon) { statusIcon.textContent = '⏳'; statusIcon.className = 'nd-status-icon nd-spin'; }
            startFloorCooldownTimer(panelData, data);
            break;
        case FloatState.RECONNECTING:
            el.classList.add('working');
            if (statusIcon) { statusIcon.textContent = '↻'; statusIcon.className = 'nd-status-icon nd-spin'; }
            if (statusText) statusText.textContent = DRAW_CAPSULE_COPY.reconnecting;
            break;
        case FloatState.CANCELLING:
            el.classList.add('working');
            if (statusIcon) { statusIcon.textContent = '⏳'; statusIcon.className = 'nd-status-icon nd-spin'; }
            if (statusText) statusText.textContent = DRAW_CAPSULE_COPY.cancelling;
            break;
        case FloatState.SUCCESS:
            el.classList.add('success');
            if (statusIcon) { statusIcon.textContent = '✓'; statusIcon.className = 'nd-status-icon'; }
            if (statusText) statusText.textContent = `${data.success}/${data.total}`;
            panelData.result.success = data.success;
            panelData.result.total = data.total;
            panelData.autoResetTimer = setTimeout(() => setFloorState(messageId, FloatState.IDLE), AUTO_RESET_DELAY);
            break;
        case FloatState.PARTIAL:
            el.classList.add('partial');
            if (statusIcon) { statusIcon.textContent = '⚠'; statusIcon.className = 'nd-status-icon'; }
            if (statusText) statusText.textContent = `${data.success}/${data.total}`;
            panelData.result.success = data.success;
            panelData.result.total = data.total;
            panelData.autoResetTimer = setTimeout(() => setFloorState(messageId, FloatState.IDLE), AUTO_RESET_DELAY);
            break;
        case FloatState.ERROR:
            el.classList.add('error');
            if (statusIcon) { statusIcon.textContent = '✗'; statusIcon.className = 'nd-status-icon'; }
            if (statusText) statusText.textContent = data.unknown ? DRAW_CAPSULE_COPY.unknown : DRAW_CAPSULE_COPY.error;
            panelData.result.error = data.error;
            panelData.autoResetTimer = setTimeout(() => setFloorState(messageId, FloatState.IDLE), AUTO_RESET_DELAY);
            break;
    }
}

function updateFloorDetailPopup(messageId) {
    const panelData = panelMap.get(messageId);
    if (!panelData?.root) return;
    const { result: resultEl, errorRow, error: errorEl, time: timeEl } = panelData.cache;
    const { result, state } = panelData;
    const elapsed = result.startTime ? ((Date.now() - result.startTime) / 1000).toFixed(1) : '-';
    if (state === FloatState.SUCCESS || state === FloatState.PARTIAL) {
        if (resultEl) {
            resultEl.textContent = `${result.success}/${result.total} 成功`;
            resultEl.className = `nd-detail-value ${state === FloatState.SUCCESS ? 'success' : 'warning'}`;
        }
        if (errorRow) errorRow.style.display = state === FloatState.PARTIAL ? 'flex' : 'none';
        if (errorEl && state === FloatState.PARTIAL) {
            errorEl.textContent = `${result.total - result.success} 张失败`;
        }
    } else if (state === FloatState.ERROR) {
        if (resultEl) {
            resultEl.textContent = result.error?.label || DRAW_SLOT_COPY.redrawFailed;
            resultEl.className = 'nd-detail-value error';
        }
        if (errorRow) errorRow.style.display = 'flex';
        if (errorEl) errorEl.textContent = result.error?.desc || '未知错误';
    }
    if (timeEl) timeEl.textContent = `${elapsed}s`;
}

async function handleFloorDrawClick(messageId) {
    const panelData = panelMap.get(messageId);
    if (!panelData || panelData.state !== FloatState.IDLE) return;
    const resolvedMessageId = resolvePanelMessageId(panelData) ?? messageId;
    if (resolvedMessageId !== messageId) {
        console.warn('[SdDraw] 楼层面板 messageId 与 DOM 不一致，已按 DOM 楼层生成:', { state: messageId, dom: resolvedMessageId });
        panelMap.delete(messageId);
        panelData.messageId = resolvedMessageId;
        panelData.root.dataset.messageId = String(resolvedMessageId);
        panelMap.set(resolvedMessageId, panelData);
    }
    try {
        await generateAndInsertImages({
            messageId: resolvedMessageId,
            onStateChange: (state, data, liveId) => {
                setStateForMessage(liveId, state, data);
            },
        });
    } catch (error) {
        if (error.drawTaskReported) return;
        if (error instanceof FloorImageBusyError || isDrawRunPendingError(error)) {
            toastr?.info?.(error.message);
        } else {
            console.error(error);
            toastr?.error?.(error.message);
        }
    }
}

function resolvePanelMessageId(panelData) {
    const raw = panelData?.root?.closest?.('.mes')?.getAttribute?.('mesid');
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
}

async function handleFloorAbort(messageId) {
    const target = captureDrawCancellationTarget(messageId);
    try {
        const aborted = await runDrawCancellationAction({
            cancel: () => abortGeneration(messageId, { target }),
            isCurrent: () => isDrawCancellationTargetCurrent(target),
            getState: () => panelMap.get(getContext().chat.indexOf(target.message))?.state,
            setState: state => setFloorState(getContext().chat.indexOf(target.message), state),
        });
        if (aborted && isDrawCancellationTargetCurrent(target)) {
            toastr?.info?.('正在中止');
        }
        if (isDrawCancellationTargetCurrent(target)) {
            const liveId = getContext().chat.indexOf(target.message);
            await syncDrawRunPanelState(liveId);
        }
    } catch (error) {
        console.error('[SdDraw] 中止失败:', error);
        toastr?.error?.(DRAW_SLOT_COPY.cancelFailed);
    }
}

function bindFloorPanelEvents(panelData) {
    const { messageId, root: el } = panelData;
    el.querySelector('.nd-btn-draw')?.addEventListener('click', (e) => {
        e.stopPropagation();
        observeBackgroundTask(handleFloorDrawClick(messageId), { source: import.meta.url, operation: "callback" });
    });
    // idle 层的菜单按钮 + 非空闲状态常驻的菜单按钮，行为完全一致
    el.querySelectorAll('.nd-btn-menu').forEach((menuBtn) => menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        el.classList.remove('show-detail');
        if (!el.classList.contains('expanded')) {
            refreshFloorPresetSelect(messageId);
            refreshFloorSizeSelect(messageId);
            refreshFloorMaxImagesInput(messageId);
        }
        el.classList.toggle('expanded');
    }));
    el.querySelector('.nd-layer-active')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if ([FloatState.SUBMITTING, FloatState.ACCEPTED, FloatState.UNCERTAIN, FloatState.QUEUED, FloatState.LLM, FloatState.GEN, FloatState.COOLDOWN, FloatState.RECONNECTING].includes(panelData.state)) {
            observeBackgroundTask(handleFloorAbort(messageId), { source: import.meta.url, operation: "callback" });
        } else if ([FloatState.SUCCESS, FloatState.PARTIAL, FloatState.ERROR].includes(panelData.state)) {
            updateFloorDetailPopup(messageId);
            el.classList.toggle('show-detail');
        }
    });
    panelData.cache.presetSelect?.addEventListener('change', async (e) => {
        await setQuickPreset(e.target.value);
    });
    panelData.cache.sizeSelect?.addEventListener('change', async (e) => {
        await setQuickSize(e.target.value);
    });
    const maxImagesBinding = maxImages.bind(panelData.cache.maxImagesInput);
    panelData.cache.autoToggle?.addEventListener('click', async () => {
        await toggleQuickAutoMode();
    });
    el.querySelector('.nd-settings-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        el.classList.remove('expanded');
        observeBackgroundTask(openSettings(), { source: import.meta.url, operation: "callback" });
    });
    const closeMenu = (e) => {
        if (!el.contains(e.target)) {
            el.classList.remove('expanded', 'show-detail');
        }
    };
    document.addEventListener('click', closeMenu, { passive: true });
    const themeSwitch = mountThemeSwitch({ document, container: el.querySelector('.nd-controls') });
    panelData._cleanup = () => {
        themeSwitch?.destroy();
        maxImagesBinding.destroy();
        document.removeEventListener('click', closeMenu);
    };
}

function refreshFloorPresetSelect(messageId) {
    fillPresetSelect(panelMap.get(messageId)?.cache?.presetSelect);
}

function refreshFloorSizeSelect(messageId) {
    fillSizeSelect(panelMap.get(messageId)?.cache?.sizeSelect);
}

function refreshFloorMaxImagesInput(messageId) {
    maxImages.fill(panelMap.get(messageId)?.cache?.maxImagesInput);
}

async function persistQuickSetting(mutator, afterSave, okText) {
    const ok = await updateSettingsPersistent(mutator, okText);
    if (ok && typeof afterSave === 'function') afterSave();
    return ok;
}

async function setQuickPreset(value) {
    return persistQuickSetting((settings) => {
        settings.selectedPresetId = value;
    }, updateAllPresetSelects);
}

async function setQuickSize(value) {
    return persistQuickSetting((settings) => {
        settings.overrideSize = value;
    }, updateAllSizeSelects);
}

async function toggleQuickAutoMode() {
    const current = getSettings();
    const nextMode = current.mode === 'auto' ? 'manual' : 'auto';
    return persistQuickSetting((settings) => {
        settings.mode = nextMode;
    }, updateAutoModeUI);
}

function mountFloorPanel(messageEl, messageId) {
    if (panelMap.has(messageId)) {
        const existing = panelMap.get(messageId);
        if (existing.root?.isConnected) {
            observeBackgroundTask(syncDrawRunPanelState(messageId), { source: import.meta.url, operation: "mountFloorPanel" });
            return existing;
        }
        existing._cleanup?.();
        panelMap.delete(messageId);
    }
    injectStyles();
    const panelData = createFloorPanelData(messageId);
    const panel = createFloorPanelElement(messageId);
    panelData.root = panel;
    const success = registerToToolbar(messageId, panel, {
        position: 'right',
        id: `sd-draw-${messageId}`,
    });
    if (!success) return null;
    cachePanelDOM(panelData);
    bindFloorPanelEvents(panelData);
    panelMap.set(messageId, panelData);
    observeBackgroundTask(syncDrawRunPanelState(messageId), { source: import.meta.url, operation: "mountFloorPanel" });
    return panelData;
}

function setupFloorObserver() {
    if (floorObserver) return;
    floorObserver = new IntersectionObserver((entries) => {
        const toMount = [];
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target;
            const mid = Number(el.getAttribute('mesid'));
            if (pendingCallbacks.has(mid)) {
                toMount.push({ el, mid });
                pendingCallbacks.delete(mid);
                floorObserver.unobserve(el);
            }
        }
        if (toMount.length > 0) {
            requestAnimationFrame(() => {
                toMount.forEach(({ el, mid }) => mountFloorPanel(el, mid));
            });
        }
    }, { rootMargin: '300px' });
}

export function ensureSdDrawPanel(messageEl, messageId, options = {}) {
    const settings = getSettings();
    if (settings.showFloorButton === false) return null;
    const { force = false } = options;
    injectStyles();
    if (panelMap.has(messageId)) {
        const existing = panelMap.get(messageId);
        if (existing.root?.isConnected) return existing;
        existing._cleanup?.();
        panelMap.delete(messageId);
    }
    if (force) return mountFloorPanel(messageEl, messageId);
    const rect = messageEl.getBoundingClientRect();
    if (rect.top < window.innerHeight + 500 && rect.bottom > -500) {
        return mountFloorPanel(messageEl, messageId);
    }
    setupFloorObserver();
    pendingCallbacks.set(messageId, true);
    floorObserver.observe(messageEl);
    return null;
}

export function releaseSdDrawPanel(messageEl, messageId) {
    floorObserver?.unobserve(messageEl);
    pendingCallbacks.delete(messageId);
    const panelData = panelMap.get(messageId);
    if (!panelData || !messageEl.contains(panelData.root)) return;
    if (panelData.autoResetTimer) clearTimeout(panelData.autoResetTimer);
    if (panelData.cooldownRafId) cancelAnimationFrame(panelData.cooldownRafId);
    panelData._cleanup?.();
    removeFromToolbar(messageId, panelData.root);
    panelMap.delete(messageId);
}

export function setStateForMessage(messageId, state, data = {}) {
    let panelData = panelMap.get(messageId);
    if (!panelData?.root?.isConnected) {
        const messageEl = document.querySelector(`.mes[mesid="${messageId}"]`);
        if (messageEl) {
            panelData = ensureSdDrawPanel(messageEl, messageId, { force: true });
        }
    }
    if (panelData) {
        setFloorState(messageId, state, data);
    }
    if (floatingEl && messageId === findLastAIMessageId()) {
        floatingMessageId = messageId;
        setFloatingState(state, data);
    }
}

function getFloatingPosition() {
    try {
        const raw = localStorage.getItem(FLOAT_POS_KEY);
        if (raw) return JSON.parse(raw);
    } catch (caughtError) { console.warn({ source: import.meta.url, operation: "getFloatingPosition" }, caughtError); }
    const debug = document.getElementById('xiaobaix-debug-mini');
    if (debug) {
        const r = debug.getBoundingClientRect();
        return { left: r.left, top: r.bottom + 8 };
    }
    return { left: window.innerWidth - 110, top: window.innerHeight - 80 };
}

function saveFloatingPosition() {
    if (!floatingEl) return;
    const r = floatingEl.getBoundingClientRect();
    try {
        localStorage.setItem(FLOAT_POS_KEY, JSON.stringify({
            left: Math.round(r.left),
            top: Math.round(r.top),
        }));
    } catch (caughtError) { console.warn({ source: import.meta.url, operation: "saveFloatingPosition" }, caughtError); }
}

// 胶囊宽度有 0.35s 过渡，夹取位置要用过渡结束后的目标宽度（空闲 74px / 非空闲 98px，含边框）
const FLOATING_WIDTH_IDLE = 77;
const FLOATING_WIDTH_ACTIVE = 101;

function applyFloatingPosition() {
    if (!floatingEl) return;
    const pos = getFloatingPosition();
    const view = getFloatingViewport();
    const w = floatingState === FloatState.IDLE ? FLOATING_WIDTH_IDLE : FLOATING_WIDTH_ACTIVE;
    const h = floatingEl.offsetHeight || 34;
    floatingEl.style.left = `${Math.max(view.left, Math.min(pos.left, view.right - w))}px`;
    floatingEl.style.top = `${Math.max(view.top, Math.min(pos.top, view.bottom - h))}px`;
}

function clearFloatingCooldownTimer() {
    if (floatingCooldownRafId) {
        cancelAnimationFrame(floatingCooldownRafId);
        floatingCooldownRafId = null;
    }
    floatingCooldownEndTime = 0;
}

function startFloatingCooldownTimer(data) {
    clearFloatingCooldownTimer();
    floatingCooldownEndTime = resolveCooldownEndTime(data);
    function tick() {
        if (!floatingCooldownEndTime) return;
        const remaining = Math.max(0, floatingCooldownEndTime - Date.now());
        const statusText = floatingCache.statusText;
        if (statusText) {
            statusText.textContent = `${(remaining / 1000).toFixed(1)}s`;
            statusText.className = 'nd-status-text nd-countdown';
        }
        if (remaining <= 0) {
            clearFloatingCooldownTimer();
            return;
        }
        floatingCooldownRafId = requestAnimationFrame(tick);
    }
    floatingCooldownRafId = requestAnimationFrame(tick);
}

export function setFloatingState(state, data = {}) {
    if (!floatingEl) return;
    const wasIdle = floatingState === FloatState.IDLE;
    floatingState = state;
    // 空闲 <-> 非空闲切换会改变胶囊宽度，贴边时重新夹取位置，避免被挤出屏幕
    if (wasIdle !== (state === FloatState.IDLE)) applyFloatingPosition();
    if (floatingAutoResetTimer) {
        clearTimeout(floatingAutoResetTimer);
        floatingAutoResetTimer = null;
    }
    if (state !== FloatState.COOLDOWN) clearFloatingCooldownTimer();
    floatingEl.classList.remove('working', 'cooldown', 'success', 'partial', 'error', 'show-detail');
    const { statusIcon, statusText } = floatingCache;
    if (!statusIcon || !statusText) return;
    statusText.className = 'nd-status-text';
    switch (state) {
        case FloatState.IDLE:
            floatingMessageId = null;
            floatingResult = { success: 0, total: 0, error: null, startTime: 0 };
            break;
        case FloatState.SUBMITTING:
            floatingEl.classList.add('working');
            if (!floatingResult.startTime) floatingResult.startTime = Date.now();
            statusIcon.textContent = '↥';
            statusIcon.className = 'nd-status-icon nd-spin';
            statusText.textContent = DRAW_CAPSULE_COPY.submitting;
            break;
        case FloatState.ACCEPTED:
            floatingEl.classList.add('working');
            if (!floatingResult.startTime) floatingResult.startTime = Date.now();
            statusIcon.textContent = getDrawRunProgressIcon(data);
            statusIcon.className = 'nd-status-icon nd-spin';
            statusText.textContent = formatDrawRunProgress(data);
            break;
        case FloatState.UNCERTAIN:
            floatingEl.classList.add('working');
            if (!floatingResult.startTime) floatingResult.startTime = Date.now();
            statusIcon.textContent = '↻';
            statusIcon.className = 'nd-status-icon nd-spin';
            statusText.textContent = DRAW_CAPSULE_COPY.uncertain;
            break;
        case FloatState.QUEUED:
            floatingEl.classList.add('working');
            if (!floatingResult.startTime) floatingResult.startTime = Date.now();
            statusIcon.textContent = '⌛';
            statusIcon.className = 'nd-status-icon';
            statusText.textContent = DRAW_CAPSULE_COPY.queued;
            break;
        case FloatState.LLM:
            floatingEl.classList.add('working');
            if (!floatingResult.startTime) floatingResult.startTime = Date.now();
            statusIcon.textContent = '⏳';
            statusIcon.className = 'nd-status-icon nd-spin';
            statusText.textContent = formatScenePlannerProgress(data);
            break;
        case FloatState.GEN:
            floatingEl.classList.add('working');
            statusIcon.textContent = '🎨';
            statusIcon.className = 'nd-status-icon nd-spin';
            statusText.textContent = `${data.current || 0}/${data.total || 0}`;
            floatingResult.total = data.total || 0;
            break;
        case FloatState.COOLDOWN:
            floatingEl.classList.add('cooldown');
            statusIcon.textContent = '⏳';
            statusIcon.className = 'nd-status-icon nd-spin';
            startFloatingCooldownTimer(data);
            break;
        case FloatState.RECONNECTING:
            floatingEl.classList.add('working');
            statusIcon.textContent = '↻';
            statusIcon.className = 'nd-status-icon nd-spin';
            statusText.textContent = DRAW_CAPSULE_COPY.reconnecting;
            break;
        case FloatState.CANCELLING:
            floatingEl.classList.add('working');
            statusIcon.textContent = '⏳';
            statusIcon.className = 'nd-status-icon nd-spin';
            statusText.textContent = DRAW_CAPSULE_COPY.cancelling;
            break;
        case FloatState.SUCCESS:
            floatingEl.classList.add('success');
            statusIcon.textContent = '✓';
            statusIcon.className = 'nd-status-icon';
            statusText.textContent = `${data.success}/${data.total}`;
            floatingResult.success = data.success;
            floatingResult.total = data.total;
            floatingAutoResetTimer = setTimeout(() => setFloatingState(FloatState.IDLE), AUTO_RESET_DELAY);
            break;
        case FloatState.PARTIAL:
            floatingEl.classList.add('partial');
            statusIcon.textContent = '⚠';
            statusIcon.className = 'nd-status-icon';
            statusText.textContent = `${data.success}/${data.total}`;
            floatingResult.success = data.success;
            floatingResult.total = data.total;
            floatingAutoResetTimer = setTimeout(() => setFloatingState(FloatState.IDLE), AUTO_RESET_DELAY);
            break;
        case FloatState.ERROR:
            floatingEl.classList.add('error');
            statusIcon.textContent = '✗';
            statusIcon.className = 'nd-status-icon';
            statusText.textContent = data.unknown ? DRAW_CAPSULE_COPY.unknown : DRAW_CAPSULE_COPY.error;
            floatingResult.error = data.error;
            floatingAutoResetTimer = setTimeout(() => setFloatingState(FloatState.IDLE), AUTO_RESET_DELAY);
            break;
    }
}

function updateFloatingDetailPopup() {
    const { detailResult, detailErrorRow, detailError, detailTime } = floatingCache;
    if (!detailResult) return;
    const elapsed = floatingResult.startTime ? ((Date.now() - floatingResult.startTime) / 1000).toFixed(1) : '-';
    if (floatingState === FloatState.SUCCESS || floatingState === FloatState.PARTIAL) {
        detailResult.textContent = `${floatingResult.success}/${floatingResult.total} 成功`;
        detailResult.className = `nd-detail-value ${floatingState === FloatState.SUCCESS ? 'success' : 'warning'}`;
        detailErrorRow.style.display = floatingState === FloatState.PARTIAL ? 'flex' : 'none';
        if (floatingState === FloatState.PARTIAL) {
            detailError.textContent = `${floatingResult.total - floatingResult.success} 张失败`;
        }
    } else if (floatingState === FloatState.ERROR) {
        detailResult.textContent = floatingResult.error?.label || DRAW_SLOT_COPY.redrawFailed;
        detailResult.className = 'nd-detail-value error';
        detailErrorRow.style.display = 'flex';
        detailError.textContent = floatingResult.error?.desc || '未知错误';
    }
    detailTime.textContent = `${elapsed}s`;
}

function onFloatingPointerDown(e) {
    if (e.button !== 0 || !floatingEl) return;
    floatingDragState = {
        startX: e.clientX,
        startY: e.clientY,
        startLeft: floatingEl.getBoundingClientRect().left,
        startTop: floatingEl.getBoundingClientRect().top,
        pointerId: e.pointerId,
        moved: false,
        originalTarget: e.target,
    };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "onFloatingPointerDown" }, caughtError); }
    e.preventDefault();
}

function onFloatingPointerMove(e) {
    if (!floatingDragState || floatingDragState.pointerId !== e.pointerId || !floatingEl) return;
    const dx = e.clientX - floatingDragState.startX;
    const dy = e.clientY - floatingDragState.startY;
    if (!floatingDragState.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        floatingDragState.moved = true;
    }
    if (floatingDragState.moved) {
        const view = getFloatingViewport();
        const w = floatingEl.offsetWidth || 88;
        const h = floatingEl.offsetHeight || 36;
        floatingEl.style.left = `${Math.max(view.left, Math.min(floatingDragState.startLeft + dx, view.right - w))}px`;
        floatingEl.style.top = `${Math.max(view.top, Math.min(floatingDragState.startTop + dy, view.bottom - h))}px`;
    }
    e.preventDefault();
}

function onFloatingPointerUp(e) {
    if (!floatingDragState || floatingDragState.pointerId !== e.pointerId) return;
    const { moved, originalTarget } = floatingDragState;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "onFloatingPointerUp" }, caughtError); }
    floatingDragState = null;
    if (moved) {
        saveFloatingPosition();
    } else {
        routeFloatingClick(originalTarget);
    }
}

function routeFloatingClick(target) {
    if (target.closest('.nd-btn-draw')) {
        observeBackgroundTask(handleFloatingDrawClick(), { source: import.meta.url, operation: "routeFloatingClick" });
    } else if (target.closest('.nd-btn-menu')) {
        floatingEl.classList.remove('show-detail');
        if (!floatingEl.classList.contains('expanded')) {
            refreshFloatingPresetSelect();
            refreshFloatingSizeSelect();
            refreshFloatingMaxImagesInput();
        }
        floatingEl.classList.toggle('expanded');
    } else if (target.closest('.nd-layer-active')) {
        if ([FloatState.SUBMITTING, FloatState.ACCEPTED, FloatState.UNCERTAIN, FloatState.QUEUED, FloatState.LLM, FloatState.GEN, FloatState.COOLDOWN, FloatState.RECONNECTING].includes(floatingState)) {
            observeBackgroundTask(handleFloatingAbort(), { source: import.meta.url, operation: "routeFloatingClick" });
        } else if ([FloatState.SUCCESS, FloatState.PARTIAL, FloatState.ERROR].includes(floatingState)) {
            updateFloatingDetailPopup();
            floatingEl.classList.toggle('show-detail');
        }
    }
}

async function handleFloatingDrawClick() {
    if (floatingState !== FloatState.IDLE) return;
    const messageId = findLastAIMessageId();
    if (messageId < 0) {
        toastr?.warning?.('没有可配图的AI消息');
        return;
    }
    floatingMessageId = messageId;
    try {
        await generateAndInsertImages({
            messageId,
            onStateChange: (state, data, liveId) => {
                setStateForMessage(liveId, state, data);
            },
        });
    } catch (error) {
        if (error.drawTaskReported) return;
        if (error instanceof FloorImageBusyError || isDrawRunPendingError(error)) {
            toastr?.info?.(error.message);
        } else {
            console.error(error);
            toastr?.error?.(error.message);
        }
    }
}

async function handleFloatingAbort() {
    const messageId = floatingMessageId;
    const target = captureDrawCancellationTarget(messageId);
    try {
        const aborted = messageId >= 0 && await runDrawCancellationAction({
            cancel: () => abortGeneration(messageId, { target }),
            isCurrent: () => isDrawCancellationTargetCurrent(target) && floatingMessageId === getContext().chat.indexOf(target.message),
            getState: () => floatingState,
            setState: setFloatingState,
        });
        if (aborted && isDrawCancellationTargetCurrent(target)) {
            toastr?.info?.('正在中止');
        }
        if (messageId >= 0 && isDrawCancellationTargetCurrent(target)) {
            const liveId = getContext().chat.indexOf(target.message);
            await syncDrawRunPanelState(liveId);
        }
    } catch (error) {
        console.error('[SdDraw] 中止失败:', error);
        toastr?.error?.(DRAW_SLOT_COPY.cancelFailed);
    }
}

function refreshFloatingPresetSelect() {
    fillPresetSelect(floatingCache.presetSelect);
}

function refreshFloatingSizeSelect() {
    fillSizeSelect(floatingCache.sizeSelect);
}

function refreshFloatingMaxImagesInput() {
    maxImages.fill(floatingCache.maxImagesInput);
}

function cacheFloatingDOM() {
    if (!floatingEl) return;
    floatingCache = {
        capsule: floatingEl.querySelector('.nd-capsule'),
        statusIcon: floatingEl.querySelector('.nd-status-icon'),
        statusText: floatingEl.querySelector('.nd-status-text'),
        detailResult: floatingEl.querySelector('.nd-result'),
        detailErrorRow: floatingEl.querySelector('.nd-error-row'),
        detailError: floatingEl.querySelector('.nd-error'),
        detailTime: floatingEl.querySelector('.nd-time'),
        presetSelect: floatingEl.querySelector('.nd-preset-select'),
        sizeSelect: floatingEl.querySelector('.nd-size-select'),
        maxImagesInput: floatingEl.querySelector(`.${MAX_IMAGES_INPUT_CLASS}`),
        autoToggle: floatingEl.querySelector('.nd-auto-toggle'),
    };
}

function handleFloatingOutsideClick(e) {
    if (floatingEl && !floatingEl.contains(e.target)) {
        floatingEl.classList.remove('expanded', 'show-detail');
    }
}

function createFloatingButton() {
    if (floatingEl) return;
    const settings = getSettings();
    if (settings.showFloatingButton === false) return;
    injectStyles();
    const isAuto = settings.mode === 'auto';
    floatingEl = document.createElement('div');
    floatingEl.className = `nd-float nd-floating-global${isAuto ? ' auto-on' : ''}`;
    floatingEl.id = 'nd-floating-global';

    const detail = createDetailPopup();
    const menu = createMenu(isAuto);

    const capsule = createEl('div', 'nd-capsule');
    const inner = createEl('div', 'nd-inner');
    const layerIdle = createEl('div', 'nd-layer nd-layer-idle');
    const drawBtn = createEl('button', 'nd-btn-draw');
    drawBtn.title = '点击为最后一条AI消息生成配图';
    drawBtn.append(createEl('span', '', '🎨'), createEl('span', 'nd-auto-dot'));
    const sep = createEl('div', 'nd-sep');
    const menuBtn = createEl('button', 'nd-btn-menu');
    menuBtn.title = '展开菜单';
    menuBtn.append(createEl('span', 'nd-arrow', '▼'));
    layerIdle.append(drawBtn, sep, menuBtn);
    const layerActive = createEl('div', 'nd-layer nd-layer-active');
    layerActive.append(
        createEl('span', 'nd-status-icon', '⏳'),
        createEl('span', 'nd-status-text', DRAW_CAPSULE_COPY.analysis),
    );
    inner.append(layerIdle, layerActive);
    capsule.append(inner, createPersistMenuBtn('▼'));

    floatingEl.append(detail, menu, capsule);
    document.body.appendChild(floatingEl);
    cacheFloatingDOM();
    applyFloatingPosition();

    const capsuleEl = floatingCache.capsule;
    if (capsuleEl) {
        capsuleEl.addEventListener('pointerdown', onFloatingPointerDown, { passive: false });
        capsuleEl.addEventListener('pointermove', onFloatingPointerMove, { passive: false });
        capsuleEl.addEventListener('pointerup', onFloatingPointerUp, { passive: false });
        capsuleEl.addEventListener('pointercancel', onFloatingPointerUp, { passive: false });
    }

    floatingCache.presetSelect?.addEventListener('change', async (e) => {
        await setQuickPreset(e.target.value);
    });
    floatingCache.sizeSelect?.addEventListener('change', async (e) => {
        await setQuickSize(e.target.value);
    });
    floatingCache.maxImagesBinding = maxImages.bind(floatingCache.maxImagesInput);
    floatingCache.themeSwitch = mountThemeSwitch({ document, container: floatingEl.querySelector('.nd-controls') });
    floatingCache.popovers = mountFloatingPopovers(floatingEl, applyFloatingPosition);
    floatingCache.autoToggle?.addEventListener('click', async () => {
        await toggleQuickAutoMode();
    });
    floatingEl.querySelector('.nd-settings-btn')?.addEventListener('click', () => {
        floatingEl.classList.remove('expanded');
        observeBackgroundTask(openSettings(), { source: import.meta.url, operation: "callback" });
    });
    document.addEventListener('click', handleFloatingOutsideClick, { passive: true });
    const messageId = findLastAIMessageId();
    if (messageId >= 0) observeBackgroundTask(syncDrawRunPanelState(messageId), { source: import.meta.url, operation: "createFloatingButton" });
}

function destroyFloatingButton() {
    floatingCache.popovers?.destroy();
    floatingCache.themeSwitch?.destroy();
    floatingCache.maxImagesBinding?.destroy();
    clearFloatingCooldownTimer();
    if (floatingAutoResetTimer) {
        clearTimeout(floatingAutoResetTimer);
        floatingAutoResetTimer = null;
    }
    document.removeEventListener('click', handleFloatingOutsideClick);
    floatingEl?.remove();
    floatingEl = null;
    floatingDragState = null;
    floatingState = FloatState.IDLE;
    floatingCache = {};
}

function updateAllPresetSelects() {
    panelMap.forEach((data) => fillPresetSelect(data.cache?.presetSelect));
    fillPresetSelect(floatingCache.presetSelect);
    // “数目”输入框的提示里带当前预设的出图数，切换预设后一并刷新。
    updateAllMaxImagesInputs();
}

function updateAllSizeSelects() {
    panelMap.forEach((data) => fillSizeSelect(data.cache?.sizeSelect));
    fillSizeSelect(floatingCache.sizeSelect);
}

function updateAllMaxImagesInputs() {
    maxImages.updateAll();
}

export function updateAutoModeUI() {
    const isAuto = getSettings().mode === 'auto';
    panelMap.forEach((data) => {
        if (!data.root) return;
        data.root.classList.toggle('auto-on', isAuto);
        data.cache.autoToggle?.classList.toggle('on', isAuto);
    });
    if (floatingEl) {
        floatingEl.classList.toggle('auto-on', isAuto);
        floatingCache.autoToggle?.classList.toggle('on', isAuto);
    }
}

export function refreshPresetSelect() {
    updateAllPresetSelects();
}

export function updateButtonVisibility(showFloor, showFloating) {
    if (showFloating && !floatingEl) {
        createFloatingButton();
    } else if (!showFloating && floatingEl) {
        destroyFloatingButton();
    }
    if (!showFloor) {
        panelMap.forEach((data, messageId) => {
            if (data.autoResetTimer) clearTimeout(data.autoResetTimer);
            clearPanelCooldown(data);
            data._cleanup?.();
            if (data.root) removeFromToolbar(messageId, data.root);
        });
        panelMap.clear();
        pendingCallbacks.clear();
        floorObserver?.disconnect();
        floorObserver = null;
    }
}

export function initFloatingPanel() {
    drawRunActivityDispose ??= subscribeDrawRunActivity(syncDrawRunActivity);
    if (getSettings().showFloatingButton !== false) {
        createFloatingButton();
    }
}

export function destroyFloatingPanel() {
    drawRunActivityDispose?.();
    drawRunActivityDispose = null;
    panelMap.forEach((data, messageId) => {
        if (data.autoResetTimer) clearTimeout(data.autoResetTimer);
        clearPanelCooldown(data);
        data._cleanup?.();
        if (data.root) removeFromToolbar(messageId, data.root);
    });
    panelMap.clear();
    pendingCallbacks.clear();
    floorObserver?.disconnect();
    floorObserver = null;
    destroyFloatingButton();
}

export function destroySdDrawPanels() {
    destroyFloatingPanel();
    document.getElementById('xiaobaix-sd-floating-style')?.remove();
    stylesInjected = false;
}

export {
    FloatState,
    SIZE_OPTIONS,
    updateAllPresetSelects,
    updateAllSizeSelects,
    updateAllMaxImagesInputs,
    createFloatingButton,
    destroyFloatingButton,
};
