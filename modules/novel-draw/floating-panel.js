// floating-panel.js

import { 
    openNovelDrawSettings,
    generateAndInsertImages,
    getSettings,
    saveSettings,
    isModuleEnabled,
    findLastAIMessageId,
    classifyError,
    ErrorType,
} from './novel-draw.js';

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

// 尺寸预设
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

let floatEl = null;
let dragState = null;
let currentState = FloatState.IDLE;
let currentResult = { success: 0, total: 0, error: null, startTime: 0 };
let autoResetTimer = null;
let cooldownRafId = null;
let cooldownEndTime = 0;

let $cache = {};

function cacheDOM() {
    if (!floatEl) return;
    $cache = {
        capsule: floatEl.querySelector('.nd-capsule'),
        statusIcon: floatEl.querySelector('#nd-status-icon'),
        statusText: floatEl.querySelector('#nd-status-text'),
        detailResult: floatEl.querySelector('#nd-detail-result'),
        detailErrorRow: floatEl.querySelector('#nd-detail-error-row'),
        detailError: floatEl.querySelector('#nd-detail-error'),
        detailTime: floatEl.querySelector('#nd-detail-time'),
        presetSelect: floatEl.querySelector('#nd-preset-select'),
        sizeSelect: floatEl.querySelector('#nd-size-select'),
        autoToggle: floatEl.querySelector('#nd-auto-toggle'),
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 样式 - 精致简约
// ═══════════════════════════════════════════════════════════════════════════

const STYLES = `
/* ═══════════════════════════════════════════════════════════════════════════
   设计令牌 (Design Tokens)
   ═══════════════════════════════════════════════════════════════════════════ */
:root {
    /* 胶囊尺寸 */
    --nd-w: 74px;
    --nd-h: 34px;
    
    /* 颜色系统 */
    --nd-bg-solid: rgba(24, 24, 28, 0.98);
    --nd-bg-card: rgba(0, 0, 0, 0.35);
    --nd-bg-hover: rgba(255, 255, 255, 0.06);
    --nd-bg-active: rgba(255, 255, 255, 0.1);
    
    --nd-border-subtle: rgba(255, 255, 255, 0.08);
    --nd-border-default: rgba(255, 255, 255, 0.12);
    --nd-border-hover: rgba(255, 255, 255, 0.2);
    
    --nd-text-primary: rgba(255, 255, 255, 0.92);
    --nd-text-secondary: rgba(255, 255, 255, 0.65);
    --nd-text-muted: rgba(255, 255, 255, 0.5);
    
    /* 语义色 */
    --nd-accent: #d4a574;
    --nd-success: #3ecf8e;
    --nd-warning: #f0b429;
    --nd-error: #f87171;
    --nd-info: #60a5fa;
    
    /* 阴影 */
    --nd-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.25);
    --nd-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.35);
    --nd-shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.5);
    
    /* 圆角 */
    --nd-radius-sm: 6px;
    --nd-radius-md: 10px;
    --nd-radius-lg: 14px;
    --nd-radius-full: 9999px;
    
    /* 过渡 */
    --nd-transition-fast: 0.15s ease;
    --nd-transition-normal: 0.25s ease;
}

/* ═══════════════════════════════════════════════════════════════════════════
   悬浮容器
   ═══════════════════════════════════════════════════════════════════════════ */
.nd-float { 
    position: fixed; 
    z-index: 10000; 
    user-select: none;
    will-change: transform;
    contain: layout style;
}

/* ═══════════════════════════════════════════════════════════════════════════
   胶囊主体
   ═══════════════════════════════════════════════════════════════════════════ */
.nd-capsule {
    width: var(--nd-w);
    height: var(--nd-h);
    background: var(--nd-bg-solid);
    border: 1px solid var(--nd-border-default);
    border-radius: 17px;
    box-shadow: var(--nd-shadow-md);
    position: relative;
    overflow: hidden;
    transition: border-color var(--nd-transition-normal), 
                box-shadow var(--nd-transition-normal),
                background var(--nd-transition-normal);
    touch-action: none;
    cursor: grab;
}

.nd-capsule:active { cursor: grabbing; }

.nd-float:hover .nd-capsule {
    border-color: var(--nd-border-hover);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
}

/* 状态边框 */
.nd-float.working .nd-capsule { 
    border-color: rgba(240, 180, 41, 0.5); 
}
.nd-float.cooldown .nd-capsule { 
    border-color: rgba(96, 165, 250, 0.6); 
    background: rgba(96, 165, 250, 0.06); 
}
.nd-float.success .nd-capsule { 
    border-color: rgba(62, 207, 142, 0.6); 
    background: rgba(62, 207, 142, 0.06); 
}
.nd-float.partial .nd-capsule { 
    border-color: rgba(240, 180, 41, 0.6); 
    background: rgba(240, 180, 41, 0.06); 
}
.nd-float.error .nd-capsule { 
    border-color: rgba(248, 113, 113, 0.6); 
    background: rgba(248, 113, 113, 0.06); 
}

/* ═══════════════════════════════════════════════════════════════════════════
   胶囊内层
   ═══════════════════════════════════════════════════════════════════════════ */
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

/* 绘制按钮 */
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
    transition: background var(--nd-transition-fast);
    font-size: 16px;
}
.nd-btn-draw:hover { background: var(--nd-bg-hover); }
.nd-btn-draw:active { background: var(--nd-bg-active); }

/* 自动模式指示点 */
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
.nd-float.auto-on .nd-auto-dot { 
    opacity: 1; 
    transform: scale(1); 
}

/* 分隔线 */
.nd-sep { 
    width: 1px; 
    height: 14px; 
    background: var(--nd-border-subtle); 
}

/* 菜单按钮 */
.nd-btn-menu {
    width: 28px;
    height: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--nd-text-muted);
    font-size: 8px;
    transition: all var(--nd-transition-fast);
}
.nd-btn-menu:hover { 
    background: var(--nd-bg-hover); 
    color: var(--nd-text-secondary); 
}

.nd-arrow { transition: transform 0.2s; }
.nd-float.expanded .nd-arrow { transform: rotate(180deg); }

/* ═══════════════════════════════════════════════════════════════════════════
   工作状态层
   ═══════════════════════════════════════════════════════════════════════════ */
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

.nd-spin { 
    display: inline-block;
    animation: nd-spin 1.5s linear infinite;
    will-change: transform;
}
@keyframes nd-spin { to { transform: rotate(360deg); } }

.nd-countdown { 
    font-variant-numeric: tabular-nums; 
    min-width: 36px;
    text-align: center;
}

/* ═══════════════════════════════════════════════════════════════════════════
   详情气泡
   ═══════════════════════════════════════════════════════════════════════════ */
.nd-detail {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    background: var(--nd-bg-solid);
    border: 1px solid var(--nd-border-default);
    border-radius: var(--nd-radius-md);
    padding: 12px 16px;
    font-size: 12px;
    color: var(--nd-text-secondary);
    white-space: nowrap;
    box-shadow: var(--nd-shadow-lg);
    opacity: 0;
    visibility: hidden;
    transition: opacity var(--nd-transition-fast), transform var(--nd-transition-fast);
    z-index: 10;
}

.nd-detail::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: var(--nd-bg-solid);
}

.nd-float.show-detail .nd-detail {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
}

.nd-detail-row { 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    padding: 3px 0; 
}
.nd-detail-row + .nd-detail-row {
    margin-top: 6px;
    padding-top: 8px;
    border-top: 1px solid var(--nd-border-subtle);
}

.nd-detail-icon { opacity: 0.6; font-size: 13px; }
.nd-detail-label { color: var(--nd-text-muted); }
.nd-detail-value { margin-left: auto; font-weight: 600; color: var(--nd-text-primary); }
.nd-detail-value.success { color: var(--nd-success); }
.nd-detail-value.warning { color: var(--nd-warning); }
.nd-detail-value.error { color: var(--nd-error); }

/* ═══════════════════════════════════════════════════════════════════════════
   菜单面板 - 核心重构
   ═══════════════════════════════════════════════════════════════════════════ */
.nd-menu {
    position: absolute;
    bottom: calc(100% + 10px);
    right: 0;
    width: 190px;
    background: var(--nd-bg-solid);
    border: 1px solid var(--nd-border-default);
    border-radius: var(--nd-radius-lg);
    padding: 10px;
    box-shadow: var(--nd-shadow-lg);
    opacity: 0;
    visibility: hidden;
    transform: translateY(6px) scale(0.98);
    transform-origin: bottom right;
    transition: opacity var(--nd-transition-fast), 
                transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), 
                visibility var(--nd-transition-fast);
    z-index: 5;
}

.nd-float.expanded .nd-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
}

/* ═══════════════════════════════════════════════════════════════════════════
   参数卡片
   ═══════════════════════════════════════════════════════════════════════════ */
.nd-card {
    background: var(--nd-bg-card);
    border: 1px solid var(--nd-border-subtle);
    border-radius: var(--nd-radius-md);
    overflow: hidden;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.nd-row {
    display: flex;
    align-items: center;
    padding: 2px 0;
}

/* 标签 - 提升可读性 */
.nd-label {
    width: 36px;
    padding-left: 10px;
    font-size: 10px;
    font-weight: 500;
    color: var(--nd-text-muted);
    letter-spacing: 0.2px;
    flex-shrink: 0;
}

/* 选择框 - 统一风格 */
.nd-select {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    color: var(--nd-text-primary);
    font-size: 12px;
    padding: 10px 8px;
    outline: none;
    cursor: pointer;
    transition: color var(--nd-transition-fast);
    text-align: center;
    text-align-last: center;
    margin: 0;
    line-height: 1.2;
}

.nd-select:hover { color: #fff; }
.nd-select:focus { color: #fff; }

.nd-select option {
    background: #1a1a1e;
    color: #eee;
    padding: 8px;
    text-align: left;
}

/* 尺寸选择框 - 等宽字体，白色文字 */
.nd-select.size {
    font-family: "SF Mono", "Menlo", "Consolas", "Liberation Mono", monospace;
    font-size: 11px;
    letter-spacing: -0.2px;
}

/* 内部分隔线 */
.nd-inner-sep {
    height: 1px;
    background: linear-gradient(
        90deg, 
        transparent 8px, 
        var(--nd-border-subtle) 8px, 
        var(--nd-border-subtle) calc(100% - 8px), 
        transparent calc(100% - 8px)
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   控制栏
   ═══════════════════════════════════════════════════════════════════════════ */
.nd-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
}

/* 自动开关 */
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
    transition: all var(--nd-transition-fast);
}

.nd-auto:hover {
    background: var(--nd-bg-hover);
    border-color: var(--nd-border-default);
}

.nd-auto.on {
    background: rgba(62, 207, 142, 0.08);
    border-color: rgba(62, 207, 142, 0.3);
}

.nd-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.2s;
    flex-shrink: 0;
}

.nd-auto.on .nd-dot {
    background: var(--nd-success);
    box-shadow: 0 0 8px rgba(62, 207, 142, 0.5);
}

.nd-auto-text {
    font-size: 12px;
    color: var(--nd-text-muted);
    transition: color var(--nd-transition-fast);
}

.nd-auto:hover .nd-auto-text {
    color: var(--nd-text-secondary);
}

.nd-auto.on .nd-auto-text {
    color: rgba(62, 207, 142, 0.95);
}

/* 设置按钮 */
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
    transition: all var(--nd-transition-fast);
    flex-shrink: 0;
}

.nd-gear:hover {
    background: var(--nd-bg-hover);
    border-color: var(--nd-border-default);
    color: var(--nd-text-secondary);
}

.nd-gear:active {
    background: var(--nd-bg-active);
}
`;

function injectStyles() {
    if (document.getElementById('nd-float-styles')) return;
    const el = document.createElement('style');
    el.id = 'nd-float-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
}

// ═══════════════════════════════════════════════════════════════════════════
// 位置管理
// ═══════════════════════════════════════════════════════════════════════════

function getPosition() {
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

function savePosition() {
    if (!floatEl) return;
    const r = floatEl.getBoundingClientRect();
    try {
        localStorage.setItem(FLOAT_POS_KEY, JSON.stringify({ 
            left: Math.round(r.left), 
            top: Math.round(r.top) 
        }));
    } catch {}
}

function applyPosition() {
    if (!floatEl) return;
    const pos = getPosition();
    const w = floatEl.offsetWidth || 77;
    const h = floatEl.offsetHeight || 34;
    floatEl.style.left = `${Math.max(0, Math.min(pos.left, window.innerWidth - w))}px`;
    floatEl.style.top = `${Math.max(0, Math.min(pos.top, window.innerHeight - h))}px`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 倒计时
// ═══════════════════════════════════════════════════════════════════════════

function clearCooldownTimer() {
    if (cooldownRafId) {
        cancelAnimationFrame(cooldownRafId);
        cooldownRafId = null;
    }
    cooldownEndTime = 0;
}

function startCooldownTimer(duration) {
    clearCooldownTimer();
    cooldownEndTime = Date.now() + duration;
    
    function tick() {
        if (!cooldownEndTime) return;
        updateCooldownDisplay();
        const remaining = cooldownEndTime - Date.now();
        if (remaining <= -100) {
            clearCooldownTimer();
            return;
        }
        cooldownRafId = requestAnimationFrame(tick);
    }
    
    cooldownRafId = requestAnimationFrame(tick);
}

function updateCooldownDisplay() {
    const { statusText } = $cache;
    if (!statusText) return;
    const remaining = Math.max(0, cooldownEndTime - Date.now());
    const seconds = (remaining / 1000).toFixed(1);
    statusText.textContent = `${seconds}s`;
    statusText.className = 'nd-countdown';
}

// ═══════════════════════════════════════════════════════════════════════════
// 状态管理
// ═══════════════════════════════════════════════════════════════════════════

const STATE_CONFIG = {
    [FloatState.IDLE]: { cls: '', icon: '', text: '', spinning: false },
    [FloatState.LLM]: { cls: 'working', icon: '⏳', text: '分析', spinning: true },
    [FloatState.GEN]: { cls: 'working', icon: '🎨', text: '', spinning: true },
    [FloatState.COOLDOWN]: { cls: 'cooldown', icon: '⏳', text: '', spinning: true },
    [FloatState.SUCCESS]: { cls: 'success', icon: '✓', text: '', spinning: false },
    [FloatState.PARTIAL]: { cls: 'partial', icon: '⚠', text: '', spinning: false },
    [FloatState.ERROR]: { cls: 'error', icon: '✗', text: '', spinning: false },
};

function setState(state, data = {}) {
    if (!floatEl) return;
    
    currentState = state;
    
    if (autoResetTimer) {
        clearTimeout(autoResetTimer);
        autoResetTimer = null;
    }
    
    if (state !== FloatState.COOLDOWN) {
        clearCooldownTimer();
    }
    
    floatEl.classList.remove('working', 'cooldown', 'success', 'partial', 'error', 'show-detail');
    
    const cfg = STATE_CONFIG[state];
    if (cfg.cls) floatEl.classList.add(cfg.cls);
    
    const { statusIcon, statusText } = $cache;
    if (!statusIcon || !statusText) return;
    
    statusIcon.textContent = cfg.icon;
    statusIcon.className = cfg.spinning ? 'nd-spin' : '';
    statusText.className = '';
    
    switch (state) {
        case FloatState.IDLE:
            currentResult = { success: 0, total: 0, error: null, startTime: 0 };
            break;
        case FloatState.LLM:
            currentResult.startTime = Date.now();
            statusText.textContent = cfg.text;
            break;
        case FloatState.GEN:
            statusText.textContent = `${data.current || 0}/${data.total || 0}`;
            currentResult.total = data.total || 0;
            break;
        case FloatState.COOLDOWN:
            startCooldownTimer(data.duration);
            break;
        case FloatState.SUCCESS:
        case FloatState.PARTIAL:
            statusText.textContent = `${data.success}/${data.total}`;
            currentResult.success = data.success;
            currentResult.total = data.total;
            autoResetTimer = setTimeout(() => setState(FloatState.IDLE), AUTO_RESET_DELAY);
            break;
        case FloatState.ERROR:
            statusText.textContent = data.error?.label || '错误';
            currentResult.error = data.error;
            autoResetTimer = setTimeout(() => setState(FloatState.IDLE), AUTO_RESET_DELAY);
            break;
    }
}

function updateProgress(current, total) {
    if (currentState !== FloatState.GEN || !$cache.statusText) return;
    $cache.statusText.textContent = `${current}/${total}`;
}

function updateDetailPopup() {
    const { detailResult, detailErrorRow, detailError, detailTime } = $cache;
    if (!detailResult) return;
    
    const elapsed = currentResult.startTime 
        ? ((Date.now() - currentResult.startTime) / 1000).toFixed(1) 
        : '-';
    
    const isSuccess = currentState === FloatState.SUCCESS;
    const isPartial = currentState === FloatState.PARTIAL;
    const isError = currentState === FloatState.ERROR;
    
    if (isSuccess || isPartial) {
        detailResult.textContent = `${currentResult.success}/${currentResult.total} 成功`;
        detailResult.className = `nd-detail-value ${isSuccess ? 'success' : 'warning'}`;
        detailErrorRow.style.display = isPartial ? 'flex' : 'none';
        if (isPartial) detailError.textContent = `${currentResult.total - currentResult.success} 张失败`;
    } else if (isError) {
        detailResult.textContent = '生成失败';
        detailResult.className = 'nd-detail-value error';
        detailErrorRow.style.display = 'flex';
        detailError.textContent = currentResult.error?.desc || '未知错误';
    }
    
    detailTime.textContent = `${elapsed}s`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 拖拽与点击
// ═══════════════════════════════════════════════════════════════════════════

function onPointerDown(e) {
    if (e.button !== 0) return;
    
    dragState = {
        startX: e.clientX,
        startY: e.clientY,
        startLeft: floatEl.getBoundingClientRect().left,
        startTop: floatEl.getBoundingClientRect().top,
        pointerId: e.pointerId,
        moved: false,
        originalTarget: e.target
    };
    
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    e.preventDefault();
}

function onPointerMove(e) {
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    
    if (!dragState.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        dragState.moved = true;
    }
    
    if (dragState.moved) {
        const w = floatEl.offsetWidth || 88;
        const h = floatEl.offsetHeight || 36;
        floatEl.style.left = `${Math.max(0, Math.min(dragState.startLeft + dx, window.innerWidth - w))}px`;
        floatEl.style.top = `${Math.max(0, Math.min(dragState.startTop + dy, window.innerHeight - h))}px`;
    }
    
    e.preventDefault();
}

function onPointerUp(e) {
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    
    const { moved, originalTarget } = dragState;
    
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    dragState = null;
    
    if (moved) {
        savePosition();
    } else {
        routeClick(originalTarget);
    }
}

function routeClick(target) {
    if (target.closest('#nd-btn-draw')) {
        handleDrawClick();
    } else if (target.closest('#nd-btn-menu')) {
        floatEl.classList.remove('show-detail');
        if (!floatEl.classList.contains('expanded')) {
            refreshPresetSelect();
            refreshSizeSelect();
        }
        floatEl.classList.toggle('expanded');
    } else if (target.closest('#nd-layer-active')) {

        if ([FloatState.LLM, FloatState.GEN, FloatState.COOLDOWN].includes(currentState)) {

            handleAbort();
        } else if ([FloatState.SUCCESS, FloatState.PARTIAL, FloatState.ERROR].includes(currentState)) {

            updateDetailPopup();
            floatEl.classList.toggle('show-detail');
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 核心操作
// ═══════════════════════════════════════════════════════════════════════════

async function handleDrawClick() {
    if (currentState !== FloatState.IDLE) return;  // 非空闲状态不处理
    
    const messageId = findLastAIMessageId();
    if (messageId < 0) {
        toastr?.warning?.('没有可配图的AI消息');
        return;
    }
    
    try {
        await generateAndInsertImages({
            messageId,
            onStateChange: (state, data) => {
                switch (state) {
                    case 'llm': setState(FloatState.LLM); break;
                    case 'gen': setState(FloatState.GEN, data); break;
                    case 'progress': setState(FloatState.GEN, data); break;
                    case 'cooldown': setState(FloatState.COOLDOWN, data); break;
                    case 'success':
                        // ▼ 修改：中止时也显示结果
                        if (data.aborted && data.success === 0) {
                            setState(FloatState.IDLE);
                        } else if (data.aborted || data.success < data.total) {
                            setState(FloatState.PARTIAL, data);
                        } else {
                            setState(FloatState.SUCCESS, data);
                        }
                        break;
                }
            }
        });
    } catch (e) {
        console.error('[NovelDraw]', e);
        // ▼ 修改：中止不显示错误
        if (e.message === '已取消') {
            setState(FloatState.IDLE);
        } else {
            setState(FloatState.ERROR, { error: classifyError(e) });
        }
    }
}

async function handleAbort() {
    try {
        const { abortGeneration } = await import('./novel-draw.js');
        if (abortGeneration()) {
            setState(FloatState.IDLE);
            toastr?.info?.('已中止');
        }
    } catch (e) {
        console.error('[NovelDraw] 中止失败:', e);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 预设与尺寸管理
// ═══════════════════════════════════════════════════════════════════════════

function buildPresetOptions() {
    const settings = getSettings();
    const presets = settings.paramsPresets || [];
    const currentId = settings.selectedParamsPresetId;
    return presets.map(p => 
        `<option value="${p.id}"${p.id === currentId ? ' selected' : ''}>${p.name || '未命名'}</option>`
    ).join('');
}

function buildSizeOptions() {
    const settings = getSettings();
    const current = settings.overrideSize || 'default';
    return SIZE_OPTIONS.map(opt => 
        `<option value="${opt.value}"${opt.value === current ? ' selected' : ''}>${opt.label}</option>`
    ).join('');
}

function refreshPresetSelect() {
    if (!$cache.presetSelect) return;
    $cache.presetSelect.innerHTML = buildPresetOptions();
}

function refreshSizeSelect() {
    if (!$cache.sizeSelect) return;
    $cache.sizeSelect.innerHTML = buildSizeOptions();
}

function handlePresetChange(e) {
    const presetId = e.target.value;
    if (!presetId) return;
    const settings = getSettings();
    settings.selectedParamsPresetId = presetId;
    saveSettings(settings);
}

function handleSizeChange(e) {
    const value = e.target.value;
    const settings = getSettings();
    settings.overrideSize = value;
    saveSettings(settings);
}

export function updateAutoModeUI() {
    if (!floatEl) return;
    const isAuto = getSettings().mode === 'auto';
    floatEl.classList.toggle('auto-on', isAuto);
    $cache.autoToggle?.classList.toggle('on', isAuto);
}

function handleAutoToggle() {
    const settings = getSettings();
    settings.mode = settings.mode === 'auto' ? 'manual' : 'auto';
    saveSettings(settings);
    updateAutoModeUI();
}

// ═══════════════════════════════════════════════════════════════════════════
// 创建与销毁
// ═══════════════════════════════════════════════════════════════════════════

export function createFloatingPanel() {
    if (floatEl) return;
    
    injectStyles();
    
    const settings = getSettings();
    const isAuto = settings.mode === 'auto';
    
    floatEl = document.createElement('div');
    floatEl.className = `nd-float${isAuto ? ' auto-on' : ''}`;
    floatEl.id = 'nd-floating-panel';
    
    floatEl.innerHTML = `
        <!-- 详情气泡 -->
        <div class="nd-detail">
            <div class="nd-detail-row">
                <span class="nd-detail-icon">📊</span>
                <span class="nd-detail-label">结果</span>
                <span class="nd-detail-value" id="nd-detail-result">-</span>
            </div>
            <div class="nd-detail-row" id="nd-detail-error-row" style="display:none">
                <span class="nd-detail-icon">💡</span>
                <span class="nd-detail-label">原因</span>
                <span class="nd-detail-value error" id="nd-detail-error">-</span>
            </div>
            <div class="nd-detail-row">
                <span class="nd-detail-icon">⏱</span>
                <span class="nd-detail-label">耗时</span>
                <span class="nd-detail-value" id="nd-detail-time">-</span>
            </div>
        </div>
        
        <!-- 菜单面板 -->
        <div class="nd-menu">
            <!-- 参数卡片 -->
            <div class="nd-card">
                <div class="nd-row">
                    <span class="nd-label">预设</span>
                    <select class="nd-select" id="nd-preset-select">
                        ${buildPresetOptions()}
                    </select>
                </div>
                <div class="nd-inner-sep"></div>
                <div class="nd-row">
                    <span class="nd-label">尺寸</span>
                    <select class="nd-select size" id="nd-size-select">
                        ${buildSizeOptions()}
                    </select>
                </div>
            </div>
            
            <!-- 控制栏 -->
            <div class="nd-controls">
                <div class="nd-auto${isAuto ? ' on' : ''}" id="nd-auto-toggle">
                    <span class="nd-dot"></span>
                    <span class="nd-auto-text">自动配图</span>
                </div>
                <button class="nd-gear" id="nd-settings-btn" title="打开设置">⚙</button>
            </div>
        </div>
        
        <!-- 胶囊主体 -->
        <div class="nd-capsule">
            <div class="nd-inner">
                <div class="nd-layer nd-layer-idle">
                    <button class="nd-btn-draw" id="nd-btn-draw" title="点击生成配图">
                        <span>🎨</span>
                        <span class="nd-auto-dot"></span>
                    </button>
                    <div class="nd-sep"></div>
                    <button class="nd-btn-menu" id="nd-btn-menu" title="展开菜单">
                        <span class="nd-arrow">▲</span>
                    </button>
                </div>
                <div class="nd-layer nd-layer-active" id="nd-layer-active">
                    <span id="nd-status-icon">⏳</span>
                    <span id="nd-status-text">分析</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(floatEl);
    cacheDOM();
    applyPosition();
    bindEvents();
    
    window.addEventListener('resize', applyPosition);
}

function bindEvents() {
    const capsule = $cache.capsule;
    if (!capsule) return;
    
    capsule.addEventListener('pointerdown', onPointerDown, { passive: false });
    capsule.addEventListener('pointermove', onPointerMove, { passive: false });
    capsule.addEventListener('pointerup', onPointerUp, { passive: false });
    capsule.addEventListener('pointercancel', onPointerUp, { passive: false });
    
    $cache.presetSelect?.addEventListener('change', handlePresetChange);
    $cache.sizeSelect?.addEventListener('change', handleSizeChange);
    $cache.autoToggle?.addEventListener('click', handleAutoToggle);
    
    floatEl.querySelector('#nd-settings-btn')?.addEventListener('click', () => {
        floatEl.classList.remove('expanded');
        openNovelDrawSettings();
    });
    
    document.addEventListener('click', handleOutsideClick, { passive: true });
}

function handleOutsideClick(e) {
    if (floatEl && !floatEl.contains(e.target)) {
        floatEl.classList.remove('expanded', 'show-detail');
    }
}

export function destroyFloatingPanel() {
    clearCooldownTimer();
    
    if (autoResetTimer) {
        clearTimeout(autoResetTimer);
        autoResetTimer = null;
    }
    
    window.removeEventListener('resize', applyPosition);
    document.removeEventListener('click', handleOutsideClick);
    
    floatEl?.remove();
    floatEl = null;
    dragState = null;
    currentState = FloatState.IDLE;
    $cache = {};
}

// ═══════════════════════════════════════════════════════════════════════════
// 导出
// ═══════════════════════════════════════════════════════════════════════════

export { FloatState, setState, updateProgress, refreshPresetSelect, SIZE_OPTIONS };
