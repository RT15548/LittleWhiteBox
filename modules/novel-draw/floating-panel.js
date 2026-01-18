// floating-panel.js
/**
 * NovelDraw 画图按钮面板 - 支持楼层按钮和悬浮按钮双模式
 */

import {
    openNovelDrawSettings,
    generateAndInsertImages,
    getSettings,
    saveSettings,
    findLastAIMessageId,
    classifyError,
    isGenerating,
} from './novel-draw.js';
import { registerToToolbar, removeFromToolbar } from '../../widgets/message-toolbar.js';

// ═══════════════════════════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════════════════════════

const FLOAT_POS_KEY = 'xb_novel_float_pos';
const AUTO_RESET_DELAY = 8000;

const FloatState = {
    IDLE: 'idle',
    LLM: 'llm',
    GEN: 'gen',
    COOLDOWN: 'cooldown',
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

// ═══════════════════════════════════════════════════════════════════════════
// 状态
// ═══════════════════════════════════════════════════════════════════════════

// 楼层按钮状态
const panelMap = new Map();
const pendingCallbacks = new Map();
let floorObserver = null;

// 悬浮按钮状态
let floatingEl = null;
let floatingDragState = null;
let floatingState = FloatState.IDLE;
let floatingResult = { success: 0, total: 0, error: null, startTime: 0 };
let floatingAutoResetTimer = null;
let floatingCooldownRafId = null;
let floatingCooldownEndTime = 0;
let $floatingCache = {};

// 通用状态
let stylesInjected = false;

// ═══════════════════════════════════════════════════════════════════════════
// 样式 - 统一样式（楼层+悬浮共用）
// ═══════════════════════════════════════════════════════════════════════════

const STYLES = `
:root {
    --nd-h: 34px;
    --nd-bg: rgba(0, 0, 0, 0.55);
    --nd-bg-solid: rgba(24, 24, 28, 0.98);
    --nd-bg-hover: rgba(0, 0, 0, 0.7);
    --nd-bg-active: rgba(255, 255, 255, 0.1);
    --nd-border: rgba(255, 255, 255, 0.08);
    --nd-border-hover: rgba(255, 255, 255, 0.2);
    --nd-border-subtle: rgba(255, 255, 255, 0.08);
    --nd-text-primary: rgba(255, 255, 255, 0.85);
    --nd-text-secondary: rgba(255, 255, 255, 0.65);
    --nd-text-muted: rgba(255, 255, 255, 0.45);
    --nd-text-dim: rgba(255, 255, 255, 0.25);
    --nd-success: #3ecf8e;
    --nd-warning: #f0b429;
    --nd-error: #f87171;
    --nd-info: #60a5fa;
    --nd-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
    --nd-radius-sm: 6px;
    --nd-radius-md: 10px;
    --nd-radius-lg: 14px;
}

/* ═══════════════════════════════════════════════════════════════════════════
   楼层按钮样式
   ═══════════════════════════════════════════════════════════════════════════ */
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
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    position: relative;
    overflow: hidden;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.nd-float:hover .nd-capsule {
    background: var(--nd-bg-hover);
    border-color: var(--nd-border-hover);
}

.nd-float.working .nd-capsule { border-color: rgba(240, 180, 41, 0.5); }
.nd-float.cooldown .nd-capsule { border-color: rgba(96, 165, 250, 0.6); background: rgba(96, 165, 250, 0.1); }
.nd-float.success .nd-capsule { border-color: rgba(62, 207, 142, 0.6); background: rgba(62, 207, 142, 0.1); }
.nd-float.partial .nd-capsule { border-color: rgba(240, 180, 41, 0.6); background: rgba(240, 180, 41, 0.1); }
.nd-float.error .nd-capsule { border-color: rgba(248, 113, 113, 0.6); background: rgba(248, 113, 113, 0.1); }

.nd-inner {
    display: grid;
    width: 100%;
    height: 100%;
    grid-template-areas: "s";
    pointer-events: none;
}

.nd-layer {
    grid-area: s;
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
.nd-btn-draw:hover { background: rgba(255, 255, 255, 0.12); }
.nd-btn-draw:active { transform: scale(0.92); }

.nd-auto-dot {
    position: absolute;
    top: 7px;
    right: 6px;
    width: 6px;
    height: 6px;
    background: var(--nd-success);
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(62, 207, 142, 0.6);
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
.nd-btn-menu:hover { background: rgba(255, 255, 255, 0.12); color: var(--nd-text-muted); }

.nd-arrow { transition: transform 0.2s; }
.nd-float.expanded .nd-arrow { transform: rotate(180deg); }

.nd-layer-active {
    opacity: 0;
    transform: translateY(100%);
    justify-content: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    pointer-events: none;
}

.nd-float.working .nd-layer-active,
.nd-float.cooldown .nd-layer-active,
.nd-float.success .nd-layer-active,
.nd-float.partial .nd-layer-active,
.nd-float.error .nd-layer-active {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
}

.nd-float.cooldown .nd-layer-active { color: var(--nd-info); }
.nd-float.success .nd-layer-active { color: var(--nd-success); }
.nd-float.partial .nd-layer-active { color: var(--nd-warning); }
.nd-float.error .nd-layer-active { color: var(--nd-error); }

.nd-spin { display: inline-block; animation: nd-spin 1.5s linear infinite; }
@keyframes nd-spin { to { transform: rotate(360deg); } }

.nd-countdown { font-variant-numeric: tabular-nums; min-width: 36px; text-align: center; }

/* 详情弹窗 - 向下展开（楼层按钮用） */
.nd-detail {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: rgba(18, 18, 22, 0.98);
    border: 1px solid var(--nd-border);
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 12px;
    color: var(--nd-text-secondary);
    white-space: nowrap;
    box-shadow: var(--nd-shadow-lg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 100;
    transform: translateY(-6px) scale(0.96);
    transform-origin: top right;
}

.nd-float.show-detail .nd-detail {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
}

.nd-detail-row { display: flex; align-items: center; gap: 10px; padding: 3px 0; }
.nd-detail-row + .nd-detail-row { margin-top: 6px; padding-top: 8px; border-top: 1px solid var(--nd-border-subtle); }
.nd-detail-icon { opacity: 0.6; font-size: 13px; }
.nd-detail-label { color: var(--nd-text-muted); }
.nd-detail-value { margin-left: auto; font-weight: 600; color: var(--nd-text-primary); }
.nd-detail-value.success { color: var(--nd-success); }
.nd-detail-value.warning { color: var(--nd-warning); }
.nd-detail-value.error { color: var(--nd-error); }

/* 菜单 - 向下展开（楼层按钮用） */
.nd-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 190px;
    background: rgba(18, 18, 22, 0.96);
    border: 1px solid var(--nd-border);
    border-radius: 12px;
    padding: 10px;
    box-shadow: var(--nd-shadow-lg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-6px) scale(0.96);
    transform-origin: top right;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 100;
}

.nd-float.expanded .nd-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
}

.nd-card {
    background: transparent;
    border: none;
    border-radius: 0;
    overflow: visible;
}

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
    padding: 0;
}

.nd-select {
    flex: 1;
    min-width: 0;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--nd-border-subtle);
    color: var(--nd-text-primary);
    font-size: 11px;
    min-height: 32px;
    border-radius: 6px;
    padding: 6px 8px;
    margin: 0;
    box-sizing: border-box;
    outline: none;
    cursor: pointer;
    text-align: center;
    text-align-last: center;
    transition: border-color 0.2s;
    vertical-align: middle;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}
.nd-select:hover { border-color: rgba(255, 255, 255, 0.2); }
.nd-select:focus { border-color: rgba(255, 255, 255, 0.3); }
.nd-select option { background: #1a1a1e; color: #eee; text-align: left; }
.nd-select.size { font-family: "SF Mono", "Menlo", "Consolas", monospace; font-size: 11px; }

.nd-inner-sep { display: none; }

.nd-controls { display: flex; align-items: center; gap: 8px; margin-top: 10px; }

.nd-auto {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--nd-border-subtle);
    border-radius: var(--nd-radius-sm);
    cursor: pointer;
    transition: all 0.15s;
}
.nd-auto:hover { background: rgba(255, 255, 255, 0.08); }
.nd-auto.on { background: rgba(62, 207, 142, 0.08); border-color: rgba(62, 207, 142, 0.3); }

.nd-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.2s;
}
.nd-auto.on .nd-dot { background: var(--nd-success); box-shadow: 0 0 8px rgba(62, 207, 142, 0.5); }

.nd-auto-text { font-size: 12px; color: var(--nd-text-muted); }
.nd-auto:hover .nd-auto-text { color: var(--nd-text-secondary); }
.nd-auto.on .nd-auto-text { color: rgba(62, 207, 142, 0.95); }

.nd-gear {
    width: 36px;
    height: 36px;
    border: 1px solid var(--nd-border-subtle);
    border-radius: var(--nd-radius-sm);
    background: rgba(255, 255, 255, 0.03);
    color: var(--nd-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.15s;
}
.nd-gear:hover { background: rgba(255, 255, 255, 0.08); color: var(--nd-text-secondary); }

/* ═══════════════════════════════════════════════════════════════════════════
   悬浮按钮样式（固定定位，可拖拽）
   ═══════════════════════════════════════════════════════════════════════════ */
.nd-floating-global {
    position: fixed;
    z-index: 10000;
    user-select: none;
    will-change: transform;
}

.nd-floating-global .nd-capsule {
    background: var(--nd-bg-solid);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    touch-action: none;
    cursor: grab;
}

.nd-floating-global .nd-capsule:active { cursor: grabbing; }

/* 悬浮按钮的详情和菜单向上展开 */
.nd-floating-global .nd-detail {
    top: auto;
    bottom: calc(100% + 10px);
    transform: translateY(4px) scale(0.96);
    transform-origin: bottom right;
}

.nd-floating-global.show-detail .nd-detail {
    transform: translateY(0) scale(1);
}

.nd-floating-global .nd-detail::after {
    content: '';
    position: absolute;
    top: auto;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: rgba(18, 18, 22, 0.98);
    border-bottom-color: transparent;
}

.nd-floating-global .nd-menu {
    top: auto;
    bottom: calc(100% + 10px);
    transform: translateY(6px) scale(0.98);
    transform-origin: bottom right;
}

.nd-floating-global.expanded .nd-menu {
    transform: translateY(0) scale(1);
}

/* 悬浮按钮箭头向上 */
.nd-floating-global .nd-arrow { transform: rotate(180deg); }
.nd-floating-global.expanded .nd-arrow { transform: rotate(0deg); }
`;

function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;

    const el = document.createElement('style');
    el.id = 'nd-float-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
}

// ═══════════════════════════════════════════════════════════════════════════
// 通用工具函数
// ═══════════════════════════════════════════════════════════════════════════

function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
}

function fillPresetSelect(selectEl) {
    if (!selectEl) return;
    const settings = getSettings();
    const presets = settings.paramsPresets || [];
    const currentId = settings.selectedParamsPresetId;
    selectEl.replaceChildren();
    presets.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name || '未命名';
        if (p.id === currentId) opt.selected = true;
        selectEl.appendChild(opt);
    });
}

function fillSizeSelect(selectEl) {
    if (!selectEl) return;
    const settings = getSettings();
    const current = settings.overrideSize || 'default';
    selectEl.replaceChildren();
    SIZE_OPTIONS.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        if (opt.value === current) option.selected = true;
        selectEl.appendChild(option);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// ▼▼▼ 楼层按钮逻辑 ▼▼▼
// ═══════════════════════════════════════════════════════════════════════════

function createFloorPanelData(messageId) {
    return {
        messageId,
        root: null,
        state: FloatState.IDLE,
        result: { success: 0, total: 0, error: null, startTime: 0 },
        autoResetTimer: null,
        cooldownRafId: null,
        cooldownEndTime: 0,
        $cache: {},
        _cleanup: null,
    };
}

function createFloorPanelElement(messageId) {
    const settings = getSettings();
    const isAuto = settings.mode === 'auto';

    const root = document.createElement('div');
    root.className = `nd-float${isAuto ? ' auto-on' : ''}`;
    root.dataset.messageId = messageId;

    const capsule = createEl('div', 'nd-capsule');
    const inner = createEl('div', 'nd-inner');
    const layerIdle = createEl('div', 'nd-layer nd-layer-idle');
    const drawBtn = createEl('button', 'nd-btn-draw');
    drawBtn.title = '点击生成配图';
    drawBtn.appendChild(createEl('span', '', '🎨'));
    drawBtn.appendChild(createEl('span', 'nd-auto-dot'));
    const sep = createEl('div', 'nd-sep');
    const menuBtn = createEl('button', 'nd-btn-menu');
    menuBtn.title = '展开菜单';
    menuBtn.appendChild(createEl('span', 'nd-arrow', '▼'));
    layerIdle.append(drawBtn, sep, menuBtn);

    const layerActive = createEl('div', 'nd-layer nd-layer-active');
    layerActive.append(
        createEl('span', 'nd-status-icon', '⏳'),
        createEl('span', 'nd-status-text', '分析')
    );

    inner.append(layerIdle, layerActive);
    capsule.appendChild(inner);

    const detail = createEl('div', 'nd-detail');
    const detailRowResult = createEl('div', 'nd-detail-row');
    detailRowResult.append(
        createEl('span', 'nd-detail-icon', '📊'),
        createEl('span', 'nd-detail-label', '结果'),
        createEl('span', 'nd-detail-value nd-result', '-')
    );
    const detailRowError = createEl('div', 'nd-detail-row nd-error-row');
    detailRowError.style.display = 'none';
    detailRowError.append(
        createEl('span', 'nd-detail-icon', '💡'),
        createEl('span', 'nd-detail-label', '原因'),
        createEl('span', 'nd-detail-value error nd-error', '-')
    );
    const detailRowTime = createEl('div', 'nd-detail-row');
    detailRowTime.append(
        createEl('span', 'nd-detail-icon', '⏱'),
        createEl('span', 'nd-detail-label', '耗时'),
        createEl('span', 'nd-detail-value nd-time', '-')
    );
    detail.append(detailRowResult, detailRowError, detailRowTime);

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
    card.append(rowPreset, innerSep, rowSize);

    const controls = createEl('div', 'nd-controls');
    const autoToggle = createEl('div', `nd-auto${isAuto ? ' on' : ''} nd-auto-toggle`);
    autoToggle.append(
        createEl('span', 'nd-dot'),
        createEl('span', 'nd-auto-text', '自动配图')
    );
    const settingsBtn = createEl('button', 'nd-gear nd-settings-btn', '⚙');
    settingsBtn.title = '打开设置';
    controls.append(autoToggle, settingsBtn);

    menu.append(card, controls);

    root.append(capsule, detail, menu);
    return root;
}

function cacheFloorDOM(panelData) {
    const el = panelData.root;
    if (!el) return;

    panelData.$cache = {
        statusIcon: el.querySelector('.nd-status-icon'),
        statusText: el.querySelector('.nd-status-text'),
        result: el.querySelector('.nd-result'),
        errorRow: el.querySelector('.nd-error-row'),
        error: el.querySelector('.nd-error'),
        time: el.querySelector('.nd-time'),
        presetSelect: el.querySelector('.nd-preset-select'),
        sizeSelect: el.querySelector('.nd-size-select'),
        autoToggle: el.querySelector('.nd-auto-toggle'),
    };
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
    if (state !== FloatState.COOLDOWN && panelData.cooldownRafId) {
        cancelAnimationFrame(panelData.cooldownRafId);
        panelData.cooldownRafId = null;
        panelData.cooldownEndTime = 0;
    }

    el.classList.remove('working', 'cooldown', 'success', 'partial', 'error', 'show-detail');

    const { statusIcon, statusText } = panelData.$cache;

    switch (state) {
        case FloatState.IDLE:
            panelData.result = { success: 0, total: 0, error: null, startTime: 0 };
            break;
        case FloatState.LLM:
            el.classList.add('working');
            panelData.result.startTime = Date.now();
            if (statusIcon) { statusIcon.textContent = '⏳'; statusIcon.className = 'nd-status-icon nd-spin'; }
            if (statusText) statusText.textContent = '分析';
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
            startFloorCooldownTimer(panelData, data.duration);
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
            if (statusText) statusText.textContent = data.error?.label || '错误';
            panelData.result.error = data.error;
            panelData.autoResetTimer = setTimeout(() => setFloorState(messageId, FloatState.IDLE), AUTO_RESET_DELAY);
            break;
    }
}

function startFloorCooldownTimer(panelData, duration) {
    panelData.cooldownEndTime = Date.now() + duration;

    function tick() {
        if (!panelData.cooldownEndTime) return;
        const remaining = Math.max(0, panelData.cooldownEndTime - Date.now());
        const statusText = panelData.$cache?.statusText;
        if (statusText) {
            statusText.textContent = `${(remaining / 1000).toFixed(1)}s`;
            statusText.className = 'nd-status-text nd-countdown';
        }
        if (remaining <= 0) {
            panelData.cooldownRafId = null;
            panelData.cooldownEndTime = 0;
            return;
        }
        panelData.cooldownRafId = requestAnimationFrame(tick);
    }

    panelData.cooldownRafId = requestAnimationFrame(tick);
}

function updateFloorDetailPopup(messageId) {
    const panelData = panelMap.get(messageId);
    if (!panelData?.root) return;

    const { result: resultEl, errorRow, error: errorEl, time: timeEl } = panelData.$cache;
    const { result, state } = panelData;

    const elapsed = result.startTime
        ? ((Date.now() - result.startTime) / 1000).toFixed(1)
        : '-';

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
            resultEl.textContent = '生成失败';
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

    if (isGenerating()) {
        toastr?.info?.('已有任务进行中，请等待完成');
        return;
    }

    try {
        await generateAndInsertImages({
            messageId,
            onStateChange: (state, data) => {
                switch (state) {
                    case 'llm': setFloorState(messageId, FloatState.LLM); break;
                    case 'gen': setFloorState(messageId, FloatState.GEN, data); break;
                    case 'progress': setFloorState(messageId, FloatState.GEN, data); break;
                    case 'cooldown': setFloorState(messageId, FloatState.COOLDOWN, data); break;
                    case 'success':
                        if (data.aborted && data.success === 0) {
                            setFloorState(messageId, FloatState.IDLE);
                        } else if (data.aborted || data.success < data.total) {
                            setFloorState(messageId, FloatState.PARTIAL, data);
                        } else {
                            setFloorState(messageId, FloatState.SUCCESS, data);
                        }
                        break;
                }
            }
        });
    } catch (e) {
        console.error('[NovelDraw]', e);
        if (e.message === '已取消' || e.message?.includes('已有任务进行中')) {
            setFloorState(messageId, FloatState.IDLE);
            if (e.message?.includes('已有任务进行中')) toastr?.info?.(e.message);
        } else {
            setFloorState(messageId, FloatState.ERROR, { error: classifyError(e) });
        }
    }
}

async function handleFloorAbort(messageId) {
    try {
        const { abortGeneration } = await import('./novel-draw.js');
        if (abortGeneration()) {
            setFloorState(messageId, FloatState.IDLE);
            toastr?.info?.('已中止');
        }
    } catch (e) {
        console.error('[NovelDraw] 中止失败:', e);
    }
}

function bindFloorPanelEvents(panelData) {
    const { messageId, root: el } = panelData;

    el.querySelector('.nd-btn-draw')?.addEventListener('click', (e) => {
        e.stopPropagation();
        handleFloorDrawClick(messageId);
    });

    el.querySelector('.nd-btn-menu')?.addEventListener('click', (e) => {
        e.stopPropagation();
        el.classList.remove('show-detail');
        if (!el.classList.contains('expanded')) {
            refreshFloorPresetSelect(messageId);
            refreshFloorSizeSelect(messageId);
        }
        el.classList.toggle('expanded');
    });

    el.querySelector('.nd-layer-active')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const state = panelData.state;
        if ([FloatState.LLM, FloatState.GEN, FloatState.COOLDOWN].includes(state)) {
            handleFloorAbort(messageId);
        } else if ([FloatState.SUCCESS, FloatState.PARTIAL, FloatState.ERROR].includes(state)) {
            updateFloorDetailPopup(messageId);
            el.classList.toggle('show-detail');
        }
    });

    panelData.$cache.presetSelect?.addEventListener('change', (e) => {
        const settings = getSettings();
        settings.selectedParamsPresetId = e.target.value;
        saveSettings(settings);
        updateAllPresetSelects();
    });

    panelData.$cache.sizeSelect?.addEventListener('change', (e) => {
        const settings = getSettings();
        settings.overrideSize = e.target.value;
        saveSettings(settings);
        updateAllSizeSelects();
    });

    panelData.$cache.autoToggle?.addEventListener('click', () => {
        const settings = getSettings();
        settings.mode = settings.mode === 'auto' ? 'manual' : 'auto';
        saveSettings(settings);
        updateAutoModeUI();
    });

    el.querySelector('.nd-settings-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        el.classList.remove('expanded');
        openNovelDrawSettings();
    });

    const closeMenu = (e) => {
        if (!el.contains(e.target)) {
            el.classList.remove('expanded', 'show-detail');
        }
    };
    document.addEventListener('click', closeMenu, { passive: true });

    panelData._cleanup = () => {
        document.removeEventListener('click', closeMenu);
    };
}

function refreshFloorPresetSelect(messageId) {
    const data = panelMap.get(messageId);
    const select = data?.$cache?.presetSelect;
    fillPresetSelect(select);
}

function refreshFloorSizeSelect(messageId) {
    const data = panelMap.get(messageId);
    const select = data?.$cache?.sizeSelect;
    fillSizeSelect(select);
}

function mountFloorPanel(messageEl, messageId) {
    if (panelMap.has(messageId)) {
        const existing = panelMap.get(messageId);
        if (existing.root?.isConnected) return existing;
        existing._cleanup?.();
        panelMap.delete(messageId);
    }

    injectStyles();

    const panelData = createFloorPanelData(messageId);
    const panel = createFloorPanelElement(messageId);
    panelData.root = panel;

    const success = registerToToolbar(messageId, panel, {
        position: 'right',
        id: `novel-draw-${messageId}`
    });

    if (!success) return null;

    cacheFloorDOM(panelData);
    bindFloorPanelEvents(panelData);

    panelMap.set(messageId, panelData);
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
                for (const { el, mid } of toMount) {
                    mountFloorPanel(el, mid);
                }
            });
        }
    }, { rootMargin: '300px' });
}

export function ensureNovelDrawPanel(messageEl, messageId, options = {}) {
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

    if (force) {
        return mountFloorPanel(messageEl, messageId);
    }

    const rect = messageEl.getBoundingClientRect();
    if (rect.top < window.innerHeight + 500 && rect.bottom > -500) {
        return mountFloorPanel(messageEl, messageId);
    }

    setupFloorObserver();
    pendingCallbacks.set(messageId, true);
    floorObserver.observe(messageEl);

    return null;
}

export function setStateForMessage(messageId, state, data = {}) {
    let panelData = panelMap.get(messageId);

    if (!panelData?.root?.isConnected) {
        const messageEl = document.querySelector(`.mes[mesid="${messageId}"]`);
        if (messageEl) {
            panelData = ensureNovelDrawPanel(messageEl, messageId, { force: true });
        }
    }

    if (panelData) {
        setFloorState(messageId, state, data);
    }

    if (floatingEl && messageId === findLastAIMessageId()) {
        setFloatingState(state, data);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// ▼▼▼ 悬浮按钮逻辑 ▼▼▼
// ═══════════════════════════════════════════════════════════════════════════

function getFloatingPosition() {
    try {
        const raw = localStorage.getItem(FLOAT_POS_KEY);
        if (raw) return JSON.parse(raw);
    } catch {}

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
            top: Math.round(r.top)
        }));
    } catch {}
}

function applyFloatingPosition() {
    if (!floatingEl) return;
    const pos = getFloatingPosition();
    const w = floatingEl.offsetWidth || 77;
    const h = floatingEl.offsetHeight || 34;
    floatingEl.style.left = `${Math.max(0, Math.min(pos.left, window.innerWidth - w))}px`;
    floatingEl.style.top = `${Math.max(0, Math.min(pos.top, window.innerHeight - h))}px`;
}

function clearFloatingCooldownTimer() {
    if (floatingCooldownRafId) {
        cancelAnimationFrame(floatingCooldownRafId);
        floatingCooldownRafId = null;
    }
    floatingCooldownEndTime = 0;
}

function startFloatingCooldownTimer(duration) {
    clearFloatingCooldownTimer();
    floatingCooldownEndTime = Date.now() + duration;

    function tick() {
        if (!floatingCooldownEndTime) return;
        const remaining = Math.max(0, floatingCooldownEndTime - Date.now());
        const statusText = $floatingCache.statusText;
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

function setFloatingState(state, data = {}) {
    if (!floatingEl) return;

    floatingState = state;

    if (floatingAutoResetTimer) {
        clearTimeout(floatingAutoResetTimer);
        floatingAutoResetTimer = null;
    }

    if (state !== FloatState.COOLDOWN) {
        clearFloatingCooldownTimer();
    }

    floatingEl.classList.remove('working', 'cooldown', 'success', 'partial', 'error', 'show-detail');

    const { statusIcon, statusText } = $floatingCache;
    if (!statusIcon || !statusText) return;

    switch (state) {
        case FloatState.IDLE:
            floatingResult = { success: 0, total: 0, error: null, startTime: 0 };
            break;
        case FloatState.LLM:
            floatingEl.classList.add('working');
            floatingResult.startTime = Date.now();
            statusIcon.textContent = '⏳';
            statusIcon.className = 'nd-status-icon nd-spin';
            statusText.textContent = '分析';
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
            startFloatingCooldownTimer(data.duration);
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
            statusText.textContent = data.error?.label || '错误';
            floatingResult.error = data.error;
            floatingAutoResetTimer = setTimeout(() => setFloatingState(FloatState.IDLE), AUTO_RESET_DELAY);
            break;
    }
}

function updateFloatingDetailPopup() {
    const { detailResult, detailErrorRow, detailError, detailTime } = $floatingCache;
    if (!detailResult) return;

    const elapsed = floatingResult.startTime
        ? ((Date.now() - floatingResult.startTime) / 1000).toFixed(1)
        : '-';

    if (floatingState === FloatState.SUCCESS || floatingState === FloatState.PARTIAL) {
        detailResult.textContent = `${floatingResult.success}/${floatingResult.total} 成功`;
        detailResult.className = `nd-detail-value ${floatingState === FloatState.SUCCESS ? 'success' : 'warning'}`;
        detailErrorRow.style.display = floatingState === FloatState.PARTIAL ? 'flex' : 'none';
        if (floatingState === FloatState.PARTIAL) {
            detailError.textContent = `${floatingResult.total - floatingResult.success} 张失败`;
        }
    } else if (floatingState === FloatState.ERROR) {
        detailResult.textContent = '生成失败';
        detailResult.className = 'nd-detail-value error';
        detailErrorRow.style.display = 'flex';
        detailError.textContent = floatingResult.error?.desc || '未知错误';
    }

    detailTime.textContent = `${elapsed}s`;
}

function onFloatingPointerDown(e) {
    if (e.button !== 0) return;

    floatingDragState = {
        startX: e.clientX,
        startY: e.clientY,
        startLeft: floatingEl.getBoundingClientRect().left,
        startTop: floatingEl.getBoundingClientRect().top,
        pointerId: e.pointerId,
        moved: false,
        originalTarget: e.target
    };

    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    e.preventDefault();
}

function onFloatingPointerMove(e) {
    if (!floatingDragState || floatingDragState.pointerId !== e.pointerId) return;

    const dx = e.clientX - floatingDragState.startX;
    const dy = e.clientY - floatingDragState.startY;

    if (!floatingDragState.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        floatingDragState.moved = true;
    }

    if (floatingDragState.moved) {
        const w = floatingEl.offsetWidth || 88;
        const h = floatingEl.offsetHeight || 36;
        floatingEl.style.left = `${Math.max(0, Math.min(floatingDragState.startLeft + dx, window.innerWidth - w))}px`;
        floatingEl.style.top = `${Math.max(0, Math.min(floatingDragState.startTop + dy, window.innerHeight - h))}px`;
    }

    e.preventDefault();
}

function onFloatingPointerUp(e) {
    if (!floatingDragState || floatingDragState.pointerId !== e.pointerId) return;

    const { moved, originalTarget } = floatingDragState;

    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    floatingDragState = null;

    if (moved) {
        saveFloatingPosition();
    } else {
        routeFloatingClick(originalTarget);
    }
}

function routeFloatingClick(target) {
    if (target.closest('.nd-btn-draw')) {
        handleFloatingDrawClick();
    } else if (target.closest('.nd-btn-menu')) {
        floatingEl.classList.remove('show-detail');
        if (!floatingEl.classList.contains('expanded')) {
            refreshFloatingPresetSelect();
            refreshFloatingSizeSelect();
        }
        floatingEl.classList.toggle('expanded');
    } else if (target.closest('.nd-layer-active')) {
        if ([FloatState.LLM, FloatState.GEN, FloatState.COOLDOWN].includes(floatingState)) {
            handleFloatingAbort();
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

    if (isGenerating()) {
        toastr?.info?.('已有任务进行中，请等待完成');
        return;
    }

    try {
        await generateAndInsertImages({
            messageId,
            onStateChange: (state, data) => {
                switch (state) {
                    case 'llm': setFloatingState(FloatState.LLM); break;
                    case 'gen': setFloatingState(FloatState.GEN, data); break;
                    case 'progress': setFloatingState(FloatState.GEN, data); break;
                    case 'cooldown': setFloatingState(FloatState.COOLDOWN, data); break;
                    case 'success':
                        if (data.aborted && data.success === 0) {
                            setFloatingState(FloatState.IDLE);
                        } else if (data.aborted || data.success < data.total) {
                            setFloatingState(FloatState.PARTIAL, data);
                        } else {
                            setFloatingState(FloatState.SUCCESS, data);
                        }
                        break;
                }
            }
        });
    } catch (e) {
        console.error('[NovelDraw]', e);
        if (e.message === '已取消' || e.message?.includes('已有任务进行中')) {
            setFloatingState(FloatState.IDLE);
            if (e.message?.includes('已有任务进行中')) toastr?.info?.(e.message);
        } else {
            setFloatingState(FloatState.ERROR, { error: classifyError(e) });
        }
    }
}

async function handleFloatingAbort() {
    try {
        const { abortGeneration } = await import('./novel-draw.js');
        if (abortGeneration()) {
            setFloatingState(FloatState.IDLE);
            toastr?.info?.('已中止');
        }
    } catch (e) {
        console.error('[NovelDraw] 中止失败:', e);
    }
}

function refreshFloatingPresetSelect() {
    fillPresetSelect($floatingCache.presetSelect);
}

function refreshFloatingSizeSelect() {
    fillSizeSelect($floatingCache.sizeSelect);
}

function cacheFloatingDOM() {
    if (!floatingEl) return;
    $floatingCache = {
        capsule: floatingEl.querySelector('.nd-capsule'),
        statusIcon: floatingEl.querySelector('.nd-status-icon'),
        statusText: floatingEl.querySelector('.nd-status-text'),
        detailResult: floatingEl.querySelector('.nd-result'),
        detailErrorRow: floatingEl.querySelector('.nd-error-row'),
        detailError: floatingEl.querySelector('.nd-error'),
        detailTime: floatingEl.querySelector('.nd-time'),
        presetSelect: floatingEl.querySelector('.nd-preset-select'),
        sizeSelect: floatingEl.querySelector('.nd-size-select'),
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
    if (settings.showFloatingButton !== true) return;

    injectStyles();

    const isAuto = settings.mode === 'auto';

    floatingEl = document.createElement('div');
    floatingEl.className = `nd-float nd-floating-global${isAuto ? ' auto-on' : ''}`;
    floatingEl.id = 'nd-floating-global';

    const detail = createEl('div', 'nd-detail');
    const detailRowResult = createEl('div', 'nd-detail-row');
    detailRowResult.append(
        createEl('span', 'nd-detail-icon', '📊'),
        createEl('span', 'nd-detail-label', '结果'),
        createEl('span', 'nd-detail-value nd-result', '-')
    );
    const detailRowError = createEl('div', 'nd-detail-row nd-error-row');
    detailRowError.style.display = 'none';
    detailRowError.append(
        createEl('span', 'nd-detail-icon', '💡'),
        createEl('span', 'nd-detail-label', '原因'),
        createEl('span', 'nd-detail-value error nd-error', '-')
    );
    const detailRowTime = createEl('div', 'nd-detail-row');
    detailRowTime.append(
        createEl('span', 'nd-detail-icon', '⏱'),
        createEl('span', 'nd-detail-label', '耗时'),
        createEl('span', 'nd-detail-value nd-time', '-')
    );
    detail.append(detailRowResult, detailRowError, detailRowTime);

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
    card.append(rowPreset, innerSep, rowSize);

    const controls = createEl('div', 'nd-controls');
    const autoToggle = createEl('div', `nd-auto${isAuto ? ' on' : ''} nd-auto-toggle`);
    autoToggle.append(
        createEl('span', 'nd-dot'),
        createEl('span', 'nd-auto-text', '自动配图')
    );
    const settingsBtn = createEl('button', 'nd-gear nd-settings-btn', '⚙');
    settingsBtn.title = '打开设置';
    controls.append(autoToggle, settingsBtn);
    menu.append(card, controls);

    const capsule = createEl('div', 'nd-capsule');
    const inner = createEl('div', 'nd-inner');
    const layerIdle = createEl('div', 'nd-layer nd-layer-idle');
    const drawBtn = createEl('button', 'nd-btn-draw');
    drawBtn.title = '点击为最后一条AI消息生成配图';
    drawBtn.appendChild(createEl('span', '', '🎨'));
    drawBtn.appendChild(createEl('span', 'nd-auto-dot'));
    const sep = createEl('div', 'nd-sep');
    const menuBtn = createEl('button', 'nd-btn-menu');
    menuBtn.title = '展开菜单';
    menuBtn.appendChild(createEl('span', 'nd-arrow', '▲'));
    layerIdle.append(drawBtn, sep, menuBtn);
    const layerActive = createEl('div', 'nd-layer nd-layer-active');
    layerActive.append(
        createEl('span', 'nd-status-icon', '⏳'),
        createEl('span', 'nd-status-text', '分析')
    );
    inner.append(layerIdle, layerActive);
    capsule.appendChild(inner);

    floatingEl.append(detail, menu, capsule);

    document.body.appendChild(floatingEl);
    cacheFloatingDOM();
    applyFloatingPosition();

    const capsuleEl = $floatingCache.capsule;
    if (capsuleEl) {
        capsuleEl.addEventListener('pointerdown', onFloatingPointerDown, { passive: false });
        capsuleEl.addEventListener('pointermove', onFloatingPointerMove, { passive: false });
        capsuleEl.addEventListener('pointerup', onFloatingPointerUp, { passive: false });
        capsuleEl.addEventListener('pointercancel', onFloatingPointerUp, { passive: false });
    }

    $floatingCache.presetSelect?.addEventListener('change', (e) => {
        const settings = getSettings();
        settings.selectedParamsPresetId = e.target.value;
        saveSettings(settings);
        updateAllPresetSelects();
    });

    $floatingCache.sizeSelect?.addEventListener('change', (e) => {
        const settings = getSettings();
        settings.overrideSize = e.target.value;
        saveSettings(settings);
        updateAllSizeSelects();
    });

    $floatingCache.autoToggle?.addEventListener('click', () => {
        const settings = getSettings();
        settings.mode = settings.mode === 'auto' ? 'manual' : 'auto';
        saveSettings(settings);
        updateAutoModeUI();
    });

    floatingEl.querySelector('.nd-settings-btn')?.addEventListener('click', () => {
        floatingEl.classList.remove('expanded');
        openNovelDrawSettings();
    });

    document.addEventListener('click', handleFloatingOutsideClick, { passive: true });
    window.addEventListener('resize', applyFloatingPosition);
}

function destroyFloatingButton() {
    clearFloatingCooldownTimer();

    if (floatingAutoResetTimer) {
        clearTimeout(floatingAutoResetTimer);
        floatingAutoResetTimer = null;
    }

    window.removeEventListener('resize', applyFloatingPosition);
    document.removeEventListener('click', handleFloatingOutsideClick);

    floatingEl?.remove();
    floatingEl = null;
    floatingDragState = null;
    floatingState = FloatState.IDLE;
    $floatingCache = {};
}

// ═══════════════════════════════════════════════════════════════════════════
// 全局更新函数
// ═══════════════════════════════════════════════════════════════════════════

function updateAllPresetSelects() {
    panelMap.forEach((data) => {
        fillPresetSelect(data.$cache?.presetSelect);
    });
    fillPresetSelect($floatingCache.presetSelect);
}

function updateAllSizeSelects() {
    panelMap.forEach((data) => {
        fillSizeSelect(data.$cache?.sizeSelect);
    });
    fillSizeSelect($floatingCache.sizeSelect);
}

export function updateAutoModeUI() {
    const isAuto = getSettings().mode === 'auto';

    panelMap.forEach((data) => {
        if (!data.root) return;
        data.root.classList.toggle('auto-on', isAuto);
        data.$cache.autoToggle?.classList.toggle('on', isAuto);
    });

    if (floatingEl) {
        floatingEl.classList.toggle('auto-on', isAuto);
        $floatingCache.autoToggle?.classList.toggle('on', isAuto);
    }
}

export function refreshPresetSelectAll() {
    updateAllPresetSelects();
}

// ═══════════════════════════════════════════════════════════════════════════
// 按钮显示控制
// ═══════════════════════════════════════════════════════════════════════════

export function updateButtonVisibility(showFloor, showFloating) {
    if (showFloating && !floatingEl) {
        createFloatingButton();
    } else if (!showFloating && floatingEl) {
        destroyFloatingButton();
    }

    if (!showFloor) {
        panelMap.forEach((data, messageId) => {
            if (data.autoResetTimer) clearTimeout(data.autoResetTimer);
            if (data.cooldownRafId) cancelAnimationFrame(data.cooldownRafId);
            data._cleanup?.();
            if (data.root) removeFromToolbar(messageId, data.root);
        });
        panelMap.clear();
        pendingCallbacks.clear();
        floorObserver?.disconnect();
        floorObserver = null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 初始化与清理
// ═══════════════════════════════════════════════════════════════════════════

export function initFloatingPanel() {
    const settings = getSettings();

    if (settings.showFloatingButton === true) {
        createFloatingButton();
    }
}

export function destroyFloatingPanel() {
    panelMap.forEach((data, messageId) => {
        if (data.autoResetTimer) clearTimeout(data.autoResetTimer);
        if (data.cooldownRafId) cancelAnimationFrame(data.cooldownRafId);
        data._cleanup?.();
        if (data.root) removeFromToolbar(messageId, data.root);
    });
    panelMap.clear();
    pendingCallbacks.clear();

    floorObserver?.disconnect();
    floorObserver = null;

    destroyFloatingButton();
}

// ═══════════════════════════════════════════════════════════════════════════
// 导出
// ═══════════════════════════════════════════════════════════════════════════

export {
    FloatState,
    refreshPresetSelectAll as refreshPresetSelect,
    SIZE_OPTIONS,
    createFloatingButton,
    destroyFloatingButton,
    setFloatingState,
};
