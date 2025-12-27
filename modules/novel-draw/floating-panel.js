// floating-panel.js
// Novel Draw 悬浮面板 - 冷却倒计时优化版（修复版）

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

// ═══════════════════════════════════════════════════════════════════════════
// 状态
// ═══════════════════════════════════════════════════════════════════════════

let floatEl = null;
let dragState = null;
let currentState = FloatState.IDLE;
let currentResult = { success: 0, total: 0, error: null, startTime: 0 };
let autoResetTimer = null;

// 冷却倒计时相关
let cooldownTimer = null;
let cooldownEndTime = 0;

// DOM 缓存
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
        autoDot: floatEl.querySelector('#nd-menu-auto-dot'),
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 样式
// ═══════════════════════════════════════════════════════════════════════════

const STYLES = `
:root {
    --nd-w: 74px; --nd-h: 34px;
    --nd-bg: rgba(28,28,32,0.96);
    --nd-border: rgba(255,255,255,0.12);
    --nd-accent: #d4a574;
    --nd-success: #3ecf8e;
    --nd-warning: #f0b429;
    --nd-error: #f87171;
    --nd-cooldown: #60a5fa;
}
.nd-float { position: fixed; z-index: 10000; user-select: none; }
.nd-capsule {
    width: var(--nd-w); height: var(--nd-h);
    background: var(--nd-bg);
    border: 1px solid var(--nd-border);
    border-radius: 17px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.35);
    position: relative; overflow: hidden;
    transition: all 0.25s ease;
    touch-action: none; cursor: grab;
}
.nd-capsule:active { cursor: grabbing; }
.nd-float:hover .nd-capsule {
    border-color: rgba(255,255,255,0.25);
    box-shadow: 0 6px 20px rgba(0,0,0,0.45);
    transform: translateY(-1px);
}

/* 状态边框 */
.nd-float.working .nd-capsule { border-color: rgba(240,180,41,0.5); }
.nd-float.cooldown .nd-capsule { border-color: rgba(96,165,250,0.6); background: rgba(96,165,250,0.08); }
.nd-float.success .nd-capsule { border-color: rgba(62,207,142,0.6); background: rgba(62,207,142,0.08); }
.nd-float.partial .nd-capsule { border-color: rgba(240,180,41,0.6); background: rgba(240,180,41,0.08); }
.nd-float.error .nd-capsule { border-color: rgba(248,113,113,0.6); background: rgba(248,113,113,0.08); }

/* 层叠 */
.nd-inner { display: grid; width: 100%; height: 100%; grid-template-areas: "s"; pointer-events: none; }
.nd-layer { grid-area: s; display: flex; align-items: center; width: 100%; height: 100%; transition: opacity 0.2s, transform 0.2s; pointer-events: auto; }
.nd-layer-idle { opacity: 1; transform: translateY(0); }
.nd-float.working .nd-layer-idle, .nd-float.cooldown .nd-layer-idle,
.nd-float.success .nd-layer-idle, .nd-float.partial .nd-layer-idle, 
.nd-float.error .nd-layer-idle {
    opacity: 0; transform: translateY(-100%); pointer-events: none;
}

/* 按钮 */
.nd-btn-draw {
    flex: 1; height: 100%; border: none; background: transparent;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    position: relative; color: rgba(255,255,255,0.9); transition: background 0.15s; 
    font-size: 16px;
    font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
}
.nd-btn-draw:hover { background: rgba(255,255,255,0.08); }
.nd-btn-draw:active { background: rgba(255,255,255,0.12); }

.nd-auto-dot {
    position: absolute; top: 7px; right: 6px; width: 6px; height: 6px;
    background: var(--nd-success); border-radius: 50%;
    box-shadow: 0 0 4px rgba(62,207,142,0.6);
    opacity: 0; transform: scale(0); transition: all 0.2s;
}
.nd-float.auto-on .nd-auto-dot { opacity: 1; transform: scale(1); }

.nd-sep { width: 1px; height: 14px; background: rgba(255,255,255,0.1); }

.nd-btn-menu {
    width: 28px; height: 100%; border: none; background: transparent;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.4); font-size: 8px; transition: all 0.15s;
}
.nd-btn-menu:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }

.nd-arrow { transition: transform 0.2s; }
.nd-float.expanded .nd-arrow { transform: rotate(180deg); }

/* 工作层 */
.nd-layer-active {
    opacity: 0; transform: translateY(100%);
    justify-content: center; gap: 6px;
    font-size: 14px;
    font-weight: 600; color: #fff;
    cursor: pointer; pointer-events: none;
    font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
}
.nd-float.working .nd-layer-active, .nd-float.cooldown .nd-layer-active,
.nd-float.success .nd-layer-active, .nd-float.partial .nd-layer-active, 
.nd-float.error .nd-layer-active {
    opacity: 1; transform: translateY(0); pointer-events: auto;
}
.nd-float.cooldown .nd-layer-active { color: var(--nd-cooldown); }
.nd-float.success .nd-layer-active { color: var(--nd-success); }
.nd-float.partial .nd-layer-active { color: var(--nd-warning); }
.nd-float.error .nd-layer-active { color: var(--nd-error); }

/* 🔧 修复1：旋转动画 */
.nd-spin { 
    display: inline-block;
    animation: nd-spin 1.5s linear infinite; 
}
@keyframes nd-spin { to { transform: rotate(360deg); } }

/* 倒计时数字 - 等宽显示 */
.nd-countdown { 
    font-variant-numeric: tabular-nums; 
    min-width: 36px;
    text-align: center;
}

/* 详情气泡 */
.nd-detail {
    position: absolute; bottom: calc(100% + 8px); left: 50%;
    transform: translateX(-50%) translateY(4px);
    background: rgba(20,20,24,0.98);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px; padding: 10px 14px;
    font-size: 11px; color: rgba(255,255,255,0.8);
    white-space: nowrap;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    opacity: 0; visibility: hidden;
    transition: all 0.15s ease; z-index: 10;
}
.nd-detail::after {
    content: ''; position: absolute; bottom: -5px; left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(20,20,24,0.98);
}
.nd-float.show-detail .nd-detail {
    opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0);
}
.nd-detail-row { display: flex; align-items: center; gap: 8px; padding: 2px 0; }
.nd-detail-row + .nd-detail-row {
    margin-top: 4px; padding-top: 6px;
    border-top: 1px solid rgba(255,255,255,0.08);
}
.nd-detail-icon { opacity: 0.6; }
.nd-detail-label { color: rgba(255,255,255,0.5); }
.nd-detail-value { margin-left: auto; font-weight: 600; }
.nd-detail-value.success { color: var(--nd-success); }
.nd-detail-value.warning { color: var(--nd-warning); }
.nd-detail-value.error { color: var(--nd-error); }

/* 菜单 */
.nd-menu {
    position: absolute; bottom: calc(100% + 8px); right: 0;
    width: 180px; background: rgba(28,28,32,0.98);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; padding: 6px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    opacity: 0; visibility: hidden;
    transform: translateY(6px) scale(0.98);
    transform-origin: bottom right;
    transition: all 0.15s cubic-bezier(0.34,1.56,0.64,1);
    z-index: 5;
}
.nd-float.expanded .nd-menu {
    opacity: 1; visibility: visible; transform: translateY(0) scale(1);
}
.nd-menu-header { 
    padding: 6px 10px 4px; 
    font-size: 10px; 
    color: rgba(255,255,255,0.35); 
}
.nd-menu-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 6px;
    cursor: pointer; color: rgba(255,255,255,0.75);
    font-size: 12px; transition: background 0.1s;
}
.nd-menu-item:hover { background: rgba(255,255,255,0.08); }
.nd-menu-item.active { color: var(--accent); }
.nd-item-icon { width: 14px; text-align: center; font-size: 10px; opacity: 0.5; }
.nd-menu-item.active .nd-item-icon { opacity: 1; }
.nd-menu-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 4px 0; }
.nd-menu-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,0.2); margin-left: auto; transition: all 0.2s;
}
.nd-menu-dot.active {
    background: var(--nd-success);
    box-shadow: 0 0 6px rgba(62,207,142,0.6);
}

/* 预设下拉框 */
.nd-preset-row { padding: 4px 10px 8px; }
.nd-preset-select {
    width: 100%; padding: 6px 8px;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 6px;
    color: rgba(255,255,255,0.9);
    font-size: 12px; cursor: pointer; outline: none;
    transition: border-color 0.15s;
}
.nd-preset-select:hover { border-color: rgba(255,255,255,0.25); }
.nd-preset-select:focus { border-color: var(--nd-accent); }
.nd-preset-select option { background: #1a1a1e; color: #fff; }
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
// 冷却倒计时
// ═══════════════════════════════════════════════════════════════════════════

function clearCooldownTimer() {
    if (cooldownTimer) {
        clearInterval(cooldownTimer);
        cooldownTimer = null;
    }
    cooldownEndTime = 0;
}

function startCooldownTimer(duration) {
    clearCooldownTimer();
    
    cooldownEndTime = Date.now() + duration;
    
    // 立即更新一次
    updateCooldownDisplay();
    
    // 🔧 修复3：每50ms更新一次，更流畅，且始终更新显示
    cooldownTimer = setInterval(() => {
        updateCooldownDisplay();
        
        // 倒计时结束后清理定时器（但不切换状态，等 novel-draw.js 来切换）
        if (cooldownEndTime - Date.now() <= -100) {
            clearCooldownTimer();
        }
    }, 50);
}

function updateCooldownDisplay() {
    const { statusIcon, statusText } = $cache;
    if (!statusIcon || !statusText) return;
    
    // 🔧 修复2 & 3：显示小数点后一位，最小显示0.0
    const remaining = Math.max(0, cooldownEndTime - Date.now());
    const seconds = (remaining / 1000).toFixed(1);
    
    statusText.textContent = `${seconds}s`;
    statusText.className = 'nd-countdown';
}

// ═══════════════════════════════════════════════════════════════════════════
// 状态管理
// ═══════════════════════════════════════════════════════════════════════════

// 🔧 修复1：spinning 设为 true
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
    
    // 清理自动重置定时器
    if (autoResetTimer) {
        clearTimeout(autoResetTimer);
        autoResetTimer = null;
    }
    
    // 非冷却状态时清理冷却定时器
    if (state !== FloatState.COOLDOWN) {
        clearCooldownTimer();
    }
    
    // 移除所有状态类
    floatEl.classList.remove('working', 'cooldown', 'success', 'partial', 'error', 'show-detail');
    
    const cfg = STATE_CONFIG[state];
    if (cfg.cls) floatEl.classList.add(cfg.cls);
    
    const { statusIcon, statusText } = $cache;
    if (!statusIcon || !statusText) return;
    
    // 🔧 修复1：根据 spinning 添加旋转类
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
            // 启动冷却倒计时
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
        }
        floatEl.classList.toggle('expanded');
    } else if (target.closest('#nd-layer-active')) {
        if ([FloatState.SUCCESS, FloatState.PARTIAL, FloatState.ERROR].includes(currentState)) {
            updateDetailPopup();
            floatEl.classList.toggle('show-detail');
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 核心操作
// ═══════════════════════════════════════════════════════════════════════════

async function handleDrawClick() {
    if (currentState !== FloatState.IDLE) return;
    
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
                    case 'llm': 
                        setState(FloatState.LLM); 
                        break;
                    case 'gen': 
                        setState(FloatState.GEN, data); 
                        break;
                    case 'progress': 
                        setState(FloatState.GEN, data);  // 用 GEN 状态显示进度
                        break;
                    case 'cooldown':
                        setState(FloatState.COOLDOWN, data);
                        break;
                    case 'success':
                        setState(data.success === data.total ? FloatState.SUCCESS : FloatState.PARTIAL, data);
                        break;
                }
            }
        });
    } catch (e) {
        console.error('[NovelDraw]', e);
        setState(FloatState.ERROR, { error: classifyError(e) });
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 预设管理
// ═══════════════════════════════════════════════════════════════════════════

function buildPresetOptions() {
    const settings = getSettings();
    const presets = settings.paramsPresets || [];
    const currentId = settings.selectedParamsPresetId;
    
    return presets.map(p => 
        `<option value="${p.id}"${p.id === currentId ? ' selected' : ''}>${p.name || '未命名'}</option>`
    ).join('');
}

function refreshPresetSelect() {
    if (!$cache.presetSelect) return;
    $cache.presetSelect.innerHTML = buildPresetOptions();
}

function handlePresetChange(e) {
    const presetId = e.target.value;
    if (!presetId) return;
    
    const settings = getSettings();
    settings.selectedParamsPresetId = presetId;
    saveSettings(settings);
}

export function updateAutoModeUI() {
    if (!floatEl) return;
    const isAuto = getSettings().mode === 'auto';
    floatEl.classList.toggle('auto-on', isAuto);
    
    const menuDot = floatEl.querySelector('#nd-menu-auto-dot');
    menuDot?.classList.toggle('active', isAuto);
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
        
        <div class="nd-menu">
            <div class="nd-menu-header">画风预设</div>
            <div class="nd-preset-row">
                <select class="nd-preset-select" id="nd-preset-select">
                    ${buildPresetOptions()}
                </select>
            </div>
            <div class="nd-menu-divider"></div>
            <div class="nd-menu-item" id="nd-menu-auto">
                <span class="nd-item-icon">🔄</span>
                <span>自动配图</span>
                <span class="nd-menu-dot${isAuto ? ' active' : ''}" id="nd-menu-auto-dot"></span>
            </div>
            <div class="nd-menu-divider"></div>
            <div class="nd-menu-item" id="nd-menu-settings">
                <span class="nd-item-icon">⚙️</span>
                <span>设置</span>
            </div>
        </div>
        
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
    
    floatEl.querySelector('#nd-menu-auto')?.addEventListener('click', handleAutoToggle);
    floatEl.querySelector('#nd-menu-settings')?.addEventListener('click', () => {
        floatEl.classList.remove('expanded');
        openNovelDrawSettings();
    });
    
    document.addEventListener('click', (e) => {
        if (!floatEl.contains(e.target)) {
            floatEl.classList.remove('expanded', 'show-detail');
        }
    });
}

export function destroyFloatingPanel() {
    clearCooldownTimer();
    
    if (autoResetTimer) {
        clearTimeout(autoResetTimer);
        autoResetTimer = null;
    }
    
    window.removeEventListener('resize', applyPosition);
    
    floatEl?.remove();
    floatEl = null;
    dragState = null;
    currentState = FloatState.IDLE;
    $cache = {};
}

// ═══════════════════════════════════════════════════════════════════════════
// 导出
// ═══════════════════════════════════════════════════════════════════════════

export { FloatState, setState, updateProgress, refreshPresetSelect };
