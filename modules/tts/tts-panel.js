// tts-panel.js
/**
 * TTS 播放器面板 - 极简胶囊版 v4
 * 新增：自动朗读快捷开关，支持双向同步
 */

import { registerToToolbar, removeFromToolbar } from '../../widgets/message-toolbar.js';

// ═══════════════════════════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════════════════════════

const INITIAL_RENDER_LIMIT = 1;

// ═══════════════════════════════════════════════════════════════════════════
// 状态
// ═══════════════════════════════════════════════════════════════════════════

let stylesInjected = false;
const panelMap = new Map();
const pendingCallbacks = new Map();
let observer = null;

// 配置接口
let getConfigFn = null;
let saveConfigFn = null;
let openSettingsFn = null;
let clearQueueFn = null;

export function setPanelConfigHandlers({ getConfig, saveConfig, openSettings, clearQueue }) {
    getConfigFn = getConfig;
    saveConfigFn = saveConfig;
    openSettingsFn = openSettings;
    clearQueueFn = clearQueue;
}

export function clearPanelConfigHandlers() {
    getConfigFn = null;
    saveConfigFn = null;
    openSettingsFn = null;
    clearQueueFn = null;
}

// ═══════════════════════════════════════════════════════════════════════════
// 样式
// ═══════════════════════════════════════════════════════════════════════════

function injectStyles() {
    if (stylesInjected) return;
    const css = `
/* ═══════════════════════════════════════════════════════════════
   TTS 播放器 - 极简胶囊
   ═══════════════════════════════════════════════════════════════ */

.xb-tts-panel {
    --h: 34px;
    --bg: rgba(0, 0, 0, 0.55);
    --bg-hover: rgba(0, 0, 0, 0.7);
    --border: rgba(255, 255, 255, 0.08);
    --border-active: rgba(255, 255, 255, 0.2);
    --text: rgba(255, 255, 255, 0.85);
    --text-sub: rgba(255, 255, 255, 0.45);
    --text-dim: rgba(255, 255, 255, 0.25);
    --success: rgba(62, 207, 142, 0.9);
    --success-soft: rgba(62, 207, 142, 0.12);
    --error: rgba(239, 68, 68, 0.8);
    
    position: relative;
    display: inline-flex;
    flex-direction: column;
    z-index: 10;
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ═══════════════════════════════════════════════════════════════
   胶囊主体
   ═══════════════════════════════════════════════════════════════ */

.xb-tts-capsule {
    display: flex;
    align-items: center;
    height: var(--h);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 17px;
    padding: 0 3px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    width: fit-content;
    gap: 1px;
}

.xb-tts-panel:hover .xb-tts-capsule {
    background: var(--bg-hover);
    border-color: var(--border-active);
}

/* 自动朗读开启时的边框提示 */
.xb-tts-panel[data-auto="true"] .xb-tts-capsule {
    border-color: rgba(62, 207, 142, 0.25);
}
.xb-tts-panel[data-auto="true"]:hover .xb-tts-capsule {
    border-color: rgba(62, 207, 142, 0.4);
}

/* 状态边框 */
.xb-tts-panel[data-status="playing"] .xb-tts-capsule {
    border-color: rgba(255, 255, 255, 0.25);
}
.xb-tts-panel[data-status="error"] .xb-tts-capsule {
    border-color: var(--error);
}

/* ═══════════════════════════════════════════════════════════════
   按钮
   ═══════════════════════════════════════════════════════════════ */

.xb-tts-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    border-radius: 50%;
    font-size: 11px;
    transition: all 0.25s ease;
    flex-shrink: 0;
    position: relative;
}

.xb-tts-btn:hover {
    background: rgba(255, 255, 255, 0.12);
}

.xb-tts-btn:active {
    transform: scale(0.92);
}

/* 播放按钮的自动朗读指示点 */
.xb-tts-auto-dot {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 6px;
    height: 6px;
    background: var(--success);
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(62, 207, 142, 0.6);
    opacity: 0;
    transform: scale(0);
    transition: all 0.25s ease;
}
.xb-tts-panel[data-auto="true"] .xb-tts-auto-dot {
    opacity: 1;
    transform: scale(1);
}

/* 停止按钮 */
.xb-tts-btn.stop-btn {
    color: var(--text-sub);
    font-size: 8px;
}
.xb-tts-btn.stop-btn:hover {
    color: var(--error);
    background: rgba(239, 68, 68, 0.1);
}

/* 展开按钮 */
.xb-tts-btn.expand-btn {
    width: 24px;
    height: 24px;
    font-size: 8px;
    color: var(--text-dim);
    opacity: 0.6;
    transition: opacity 0.25s, transform 0.25s;
}
.xb-tts-panel:hover .xb-tts-btn.expand-btn {
    opacity: 1;
}
.xb-tts-panel.expanded .xb-tts-btn.expand-btn {
    transform: rotate(180deg);
}

/* ═══════════════════════════════════════════════════════════════
   分隔线
   ═══════════════════════════════════════════════════════════════ */

.xb-tts-sep {
    width: 1px;
    height: 12px;
    background: var(--border);
    margin: 0 2px;
    flex-shrink: 0;
}

/* ═══════════════════════════════════════════════════════════════
   信息区
   ═══════════════════════════════════════════════════════════════ */

.xb-tts-info {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 6px;
    min-width: 50px;
}

.xb-tts-status {
    font-size: 11px;
    color: var(--text-sub);
    white-space: nowrap;
    transition: color 0.25s;
}
.xb-tts-panel[data-status="playing"] .xb-tts-status {
    color: var(--text);
}
.xb-tts-panel[data-status="error"] .xb-tts-status {
    color: var(--error);
}

/* 队列徽标 */
.xb-tts-badge {
    display: none;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    color: var(--text);
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
}
.xb-tts-panel[data-has-queue="true"] .xb-tts-badge {
    display: flex;
}

/* ═══════════════════════════════════════════════════════════════
   波形动画
   ═══════════════════════════════════════════════════════════════ */

.xb-tts-wave {
    display: none;
    align-items: center;
    gap: 2px;
    height: 14px;
    padding: 0 4px;
}

.xb-tts-panel[data-status="playing"] .xb-tts-wave {
    display: flex;
}
.xb-tts-panel[data-status="playing"] .xb-tts-status {
    display: none;
}

.xb-tts-bar {
    width: 2px;
    background: var(--text);
    border-radius: 1px;
    animation: xb-tts-wave 1.6s infinite ease-in-out;
    opacity: 0.7;
}
.xb-tts-bar:nth-child(1) { height: 4px; animation-delay: 0.0s; }
.xb-tts-bar:nth-child(2) { height: 10px; animation-delay: 0.2s; }
.xb-tts-bar:nth-child(3) { height: 6px; animation-delay: 0.4s; }
.xb-tts-bar:nth-child(4) { height: 8px; animation-delay: 0.6s; }

@keyframes xb-tts-wave {
    0%, 100% {
        transform: scaleY(0.4);
        opacity: 0.4;
    }
    50% {
        transform: scaleY(1);
        opacity: 0.85;
    }
}

/* ═══════════════════════════════════════════════════════════════
   加载动画
   ═══════════════════════════════════════════════════════════════ */

.xb-tts-loading {
    display: none;
    width: 12px;
    height: 12px;
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    border-top-color: var(--text);
    border-radius: 50%;
    animation: xb-tts-spin 1s linear infinite;
    margin: 0 4px;
}

.xb-tts-panel[data-status="sending"] .xb-tts-loading,
.xb-tts-panel[data-status="queued"] .xb-tts-loading {
    display: block;
}
.xb-tts-panel[data-status="sending"] .play-btn,
.xb-tts-panel[data-status="queued"] .play-btn {
    display: none;
}

@keyframes xb-tts-spin {
    to { transform: rotate(360deg); }
}

/* ═══════════════════════════════════════════════════════════════
   底部进度条
   ═══════════════════════════════════════════════════════════════ */

.xb-tts-progress {
    position: absolute;
    bottom: 0;
    left: 8px;
    right: 8px;
    height: 2px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 1px;
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.3s;
}

.xb-tts-panel[data-status="playing"] .xb-tts-progress,
.xb-tts-panel[data-has-queue="true"] .xb-tts-progress {
    opacity: 1;
}

.xb-tts-progress-inner {
    height: 100%;
    background: rgba(255, 255, 255, 0.6);
    width: 0%;
    transition: width 0.4s ease-out;
    border-radius: 1px;
}

/* ═══════════════════════════════════════════════════════════════
   展开菜单
   ═══════════════════════════════════════════════════════════════ */

.xb-tts-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    background: rgba(18, 18, 22, 0.96);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 10px;
    min-width: 220px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-6px) scale(0.96);
    transform-origin: top left;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 100;
}

.xb-tts-panel.expanded .xb-tts-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
}

.xb-tts-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 2px;
}

.xb-tts-label {
    font-size: 11px;
    color: var(--text-sub);
    width: 32px;
    flex-shrink: 0;
}

.xb-tts-select {
    flex: 1;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 11px;
    border-radius: 6px;
    padding: 6px 8px;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
}
.xb-tts-select:hover {
    border-color: rgba(255, 255, 255, 0.2);
}
.xb-tts-select:focus {
    border-color: rgba(255, 255, 255, 0.3);
}

.xb-tts-slider {
    flex: 1;
    height: 4px;
    accent-color: #fff;
    cursor: pointer;
}

.xb-tts-val {
    font-size: 11px;
    color: var(--text);
    width: 32px;
    text-align: right;
    font-variant-numeric: tabular-nums;
}

/* ═══════════════════════════════════════════════════════════════
   工具栏（包含自动朗读开关）
   ═══════════════════════════════════════════════════════════════ */

.xb-tts-tools {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 6px;
}

.xb-tts-usage {
    font-size: 10px;
    color: var(--text-dim);
    flex-shrink: 0;
    min-width: 32px;
}

/* 自动朗读开关 - flex:1 填满剩余空间 */
.xb-tts-auto-toggle {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}
.xb-tts-auto-toggle:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
}
.xb-tts-auto-toggle.on {
    background: rgba(62, 207, 142, 0.08);
    border-color: rgba(62, 207, 142, 0.25);
}

.xb-tts-auto-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.25s ease;
    flex-shrink: 0;
}
.xb-tts-auto-toggle.on .xb-tts-auto-indicator {
    background: var(--success);
    box-shadow: 0 0 6px rgba(62, 207, 142, 0.5);
}

.xb-tts-auto-text {
    font-size: 11px;
    color: var(--text-sub);
    transition: color 0.2s;
}
.xb-tts-auto-toggle:hover .xb-tts-auto-text {
    color: var(--text);
}
.xb-tts-auto-toggle.on .xb-tts-auto-text {
    color: rgba(62, 207, 142, 0.9);
}

.xb-tts-icon-btn {
    color: var(--text-sub);
    cursor: pointer;
    font-size: 13px;
    padding: 4px 6px;
    border-radius: 4px;
    transition: all 0.2s;
    flex-shrink: 0;
}
.xb-tts-icon-btn:hover {
    color: var(--text);
    background: rgba(255, 255, 255, 0.08);
}

/* ═══════════════════════════════════════════════════════════════
   TTS 指令块样式
   ═══════════════════════════════════════════════════════════════ */

.xb-tts-tag {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    color: rgba(255, 255, 255, 0.25);
    font-size: 11px;
    font-style: italic;
    vertical-align: baseline;
    user-select: none;
    transition: color 0.3s ease;
}
.xb-tts-tag:hover {
    color: rgba(255, 255, 255, 0.45);
}
.xb-tts-tag-icon {
    font-style: normal;
    font-size: 10px;
    opacity: 0.7;
}
.xb-tts-tag-dot {
    opacity: 0.4;
}
.xb-tts-tag[data-has-params="true"] {
    color: rgba(255, 255, 255, 0.3);
}
`;
    const style = document.createElement('style');
    style.id = 'xb-tts-panel-styles';
    style.textContent = css;
    document.head.appendChild(style);
    stylesInjected = true;
}

// ═══════════════════════════════════════════════════════════════════════════
// 面板创建
// ═══════════════════════════════════════════════════════════════════════════

function createPanel(messageId) {
    const config = getConfigFn?.() || {};
    const currentSpeed = config?.volc?.speechRate || 1.0;
    const isAutoSpeak = config?.autoSpeak !== false;
    
    const div = document.createElement('div');
    div.className = 'xb-tts-panel';
    div.dataset.messageId = messageId;
    div.dataset.status = 'idle';
    div.dataset.hasQueue = 'false';
    div.dataset.auto = isAutoSpeak ? 'true' : 'false';
    
    // Template-only UI markup built locally.
    // eslint-disable-next-line no-unsanitized/property
    div.innerHTML = `
        <div class="xb-tts-capsule">
            <div class="xb-tts-loading"></div>
            <button class="xb-tts-btn play-btn" title="播放">
                ▶
                <span class="xb-tts-auto-dot"></span>
            </button>
            
            <div class="xb-tts-info">
                <div class="xb-tts-wave">
                    <div class="xb-tts-bar"></div>
                    <div class="xb-tts-bar"></div>
                    <div class="xb-tts-bar"></div>
                    <div class="xb-tts-bar"></div>
                </div>
                <span class="xb-tts-status">播放</span>
                <span class="xb-tts-badge">0/0</span>
            </div>
            
            <button class="xb-tts-btn stop-btn" title="停止">■</button>
            
            <div class="xb-tts-sep"></div>
            
            <button class="xb-tts-btn expand-btn" title="设置">▼</button>
            
            <div class="xb-tts-progress">
                <div class="xb-tts-progress-inner"></div>
            </div>
        </div>
        
        <div class="xb-tts-menu">
            <div class="xb-tts-row">
                <span class="xb-tts-label">音色</span>
                <select class="xb-tts-select voice-select"></select>
            </div>
            <div class="xb-tts-row">
                <span class="xb-tts-label">语速</span>
                <input type="range" class="xb-tts-slider speed-slider" min="0.5" max="2.0" step="0.1" value="${currentSpeed}">
                <span class="xb-tts-val speed-val">${currentSpeed.toFixed(1)}x</span>
            </div>
            <div class="xb-tts-tools">
                <span class="xb-tts-usage">-字</span>
                <div class="xb-tts-auto-toggle${isAutoSpeak ? ' on' : ''}" title="AI回复后自动朗读">
                    <span class="xb-tts-auto-indicator"></span>
                    <span class="xb-tts-auto-text">自动朗读</span>
                </div>
                <span class="xb-tts-icon-btn settings-btn" title="TTS 设置">⚙</span>
            </div>
        </div>
    `;
    
    return div;
}

function buildVoiceOptions(select, config) {
    const mySpeakers = config?.volc?.mySpeakers || [];
    const current = config?.volc?.defaultSpeaker || '';
    
    if (mySpeakers.length === 0) {
        select.textContent = '';
        const opt = document.createElement('option');
        opt.value = '';
        opt.disabled = true;
        opt.textContent = '暂无音色';
        select.appendChild(opt);
        select.selectedIndex = -1;
        return;
    }
    
    const isMyVoice = current && mySpeakers.some(s => s.value === current);
    
    select.textContent = '';
    mySpeakers.forEach((s) => {
        const opt = document.createElement('option');
        opt.value = s.value;
        opt.textContent = s.name || s.value;
        if (isMyVoice && s.value === current) opt.selected = true;
        select.appendChild(opt);
    });
    
    if (!isMyVoice) {
        select.selectedIndex = -1;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// IntersectionObserver 管理
// ═══════════════════════════════════════════════════════════════════════════

function setupObserver() {
    if (observer) return;
    
    observer = new IntersectionObserver((entries) => {
        const toMount = [];
        
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            
            const el = entry.target;
            const mid = Number(el.getAttribute('mesid'));
            const cb = pendingCallbacks.get(mid);
            
            if (cb) {
                toMount.push({ el, mid, cb });
                pendingCallbacks.delete(mid);
                observer.unobserve(el);
            }
        }
        
        if (toMount.length > 0) {
            requestAnimationFrame(() => {
                for (const { el, mid, cb } of toMount) {
                    mountPanel(el, mid, cb);
                }
            });
        }
    }, { 
        rootMargin: '300px',
        threshold: 0 
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 面板挂载
// ═══════════════════════════════════════════════════════════════════════════

function mountPanel(messageEl, messageId, onPlay) {
    // 已存在且有效
    if (panelMap.has(messageId)) {
        const existing = panelMap.get(messageId);
        if (existing.root?.isConnected) return existing;
        existing._cleanup?.();
        panelMap.delete(messageId);
    }
    
    const panel = createPanel(messageId);
    
    // 使用工具栏管理器注册
    const success = registerToToolbar(messageId, panel, { 
        position: 'left',
        id: `tts-${messageId}`
    });
    
    if (!success) return null;
    
    const ui = {
        root: panel,
        playBtn: panel.querySelector('.play-btn'),
        stopBtn: panel.querySelector('.stop-btn'),
        statusText: panel.querySelector('.xb-tts-status'),
        badge: panel.querySelector('.xb-tts-badge'),
        progressInner: panel.querySelector('.xb-tts-progress-inner'),
        voiceSelect: panel.querySelector('.voice-select'),
        speedSlider: panel.querySelector('.speed-slider'),
        speedVal: panel.querySelector('.speed-val'),
        usageText: panel.querySelector('.xb-tts-usage'),
        autoToggle: panel.querySelector('.xb-tts-auto-toggle'),
    };
    
    // 事件绑定
    ui.playBtn.onclick = (e) => {
        e.stopPropagation();
        onPlay(messageId);
    };
    
    ui.stopBtn.onclick = (e) => {
        e.stopPropagation();
        clearQueueFn?.(messageId);
    };
    
    panel.querySelector('.expand-btn').onclick = (e) => {
        e.stopPropagation();
        panel.classList.toggle('expanded');
        if (panel.classList.contains('expanded')) {
            buildVoiceOptions(ui.voiceSelect, getConfigFn?.());
            // 同步当前语速
            const config = getConfigFn?.();
            const currentSpeed = config?.volc?.speechRate || 1.0;
            ui.speedSlider.value = currentSpeed;
            ui.speedVal.textContent = currentSpeed.toFixed(1) + 'x';
        }
    };
    
    panel.querySelector('.settings-btn').onclick = (e) => {
        e.stopPropagation();
        panel.classList.remove('expanded');
        openSettingsFn?.();
    };
    
    // 自动朗读开关
    ui.autoToggle.onclick = async (e) => {
        e.stopPropagation();
        const config = getConfigFn?.();
        if (!config) return;
        
        const newValue = config.autoSpeak === false ? true : false;
        config.autoSpeak = newValue;
        
        // 保存配置
        await saveConfigFn?.({ autoSpeak: newValue });
        
        // 更新所有面板的自动朗读状态
        updateAutoSpeakAll();
    };
    
    ui.voiceSelect.onchange = async (e) => {
        const config = getConfigFn?.();
        if (config?.volc) {
            config.volc.defaultSpeaker = e.target.value;
            await saveConfigFn?.({ volc: config.volc });
        }
    };
    
    ui.speedSlider.oninput = (e) => {
        ui.speedVal.textContent = Number(e.target.value).toFixed(1) + 'x';
    };
    
    ui.speedSlider.onchange = async (e) => {
        const config = getConfigFn?.();
        if (config?.volc) {
            config.volc.speechRate = Number(e.target.value);
            await saveConfigFn?.({ volc: config.volc });
            // 同步所有面板的语速显示
            updateSpeedAll();
        }
    };
    
    const closeMenu = (e) => {
        if (!panel.contains(e.target)) {
            panel.classList.remove('expanded');
        }
    };
    document.addEventListener('click', closeMenu, { passive: true });
    
    ui._cleanup = () => {
        document.removeEventListener('click', closeMenu);
        removeFromToolbar(messageId, panel);
    };
    
    panelMap.set(messageId, ui);
    return ui;
}

// ═══════════════════════════════════════════════════════════════════════════
// 全局同步更新
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 更新所有面板的自动朗读状态
 */
export function updateAutoSpeakAll() {
    const config = getConfigFn?.();
    const isAutoSpeak = config?.autoSpeak !== false;
    
    panelMap.forEach((ui) => {
        if (!ui.root) return;
        
        // 更新 data-auto 属性（控制播放按钮上的绿点）
        ui.root.dataset.auto = isAutoSpeak ? 'true' : 'false';
        
        // 更新菜单内的开关状态
        if (ui.autoToggle) {
            ui.autoToggle.classList.toggle('on', isAutoSpeak);
        }
    });
}

/**
 * 更新所有面板的语速显示
 */
export function updateSpeedAll() {
    const config = getConfigFn?.();
    const currentSpeed = config?.volc?.speechRate || 1.0;
    
    panelMap.forEach((ui) => {
        if (!ui.root) return;
        if (ui.speedSlider) ui.speedSlider.value = currentSpeed;
        if (ui.speedVal) ui.speedVal.textContent = currentSpeed.toFixed(1) + 'x';
    });
}

/**
 * 更新所有面板的音色选择
 */
export function updateVoiceAll() {
    const config = getConfigFn?.();
    panelMap.forEach((ui) => {
        if (!ui.root || !ui.voiceSelect) return;
        buildVoiceOptions(ui.voiceSelect, config);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 对外接口
// ═══════════════════════════════════════════════════════════════════════════

export function initTtsPanelStyles() {
    injectStyles();
}

function observeForLazyMount(messageEl, messageId, onPlay) {
    if (panelMap.has(messageId) && panelMap.get(messageId).root?.isConnected) {
        return;
    }
    
    if (pendingCallbacks.has(messageId)) {
        return;
    }
    
    setupObserver();
    pendingCallbacks.set(messageId, onPlay);
    observer.observe(messageEl);
}

export function ensureTtsPanel(messageEl, messageId, onPlay) {
    injectStyles();
    
    if (panelMap.has(messageId)) {
        const existing = panelMap.get(messageId);
        if (existing.root?.isConnected) return existing;
        existing._cleanup?.();
        panelMap.delete(messageId);
    }
    
    observeForLazyMount(messageEl, messageId, onPlay);
    return null;
}

export function renderPanelsForChat(chat, getMessageElement, onPlay) {
    injectStyles();
    
    let immediateCount = 0;
    
    for (let i = chat.length - 1; i >= 0; i--) {
        const message = chat[i];
        if (!message || message.is_user) continue;
        
        const messageEl = getMessageElement(i);
        if (!messageEl) continue;
        
        if (panelMap.has(i) && panelMap.get(i).root?.isConnected) {
            continue;
        }
        
        if (immediateCount < INITIAL_RENDER_LIMIT) {
            mountPanel(messageEl, i, onPlay);
            immediateCount++;
        } else {
            observeForLazyMount(messageEl, i, onPlay);
        }
    }
}

export function updateTtsPanel(messageId, state) {
    const ui = panelMap.get(messageId);
    if (!ui || !state) return;

    const status = state.status || 'idle';
    const current = state.currentSegment || 0;
    const total = state.totalSegments || 0;
    const hasQueue = total > 1;
    
    ui.root.dataset.status = status;
    ui.root.dataset.hasQueue = hasQueue ? 'true' : 'false';
    
    let statusText = '';
    let playIcon = '▶';
    let showStop = false;
    
    switch (status) {
        case 'idle':
            statusText = '播放';
            playIcon = '▶';
            break;
        case 'sending':
        case 'queued':
            statusText = hasQueue ? `${current}/${total}` : '准备';
            playIcon = '■';
            showStop = true;
            break;
        case 'cached':
            statusText = hasQueue ? `${current}/${total}` : '缓存';
            playIcon = '▶';
            break;
        case 'playing':
            statusText = hasQueue ? `${current}/${total}` : '';
            playIcon = '⏸';
            showStop = true;
            break;
        case 'paused':
            statusText = hasQueue ? `${current}/${total}` : '暂停';
            playIcon = '▶';
            showStop = true;
            break;
        case 'ended':
            statusText = '完成';
            playIcon = '↻';
            break;
        case 'blocked':
            statusText = '受阻';
            playIcon = '▶';
            break;
        case 'error':
            statusText = (state.error || '失败').slice(0, 8);
            playIcon = '↻';
            break;
        default:
            statusText = '播放';
            playIcon = '▶';
    }
    
    // 更新播放按钮（保留自动朗读指示点）
    const playBtnContent = ui.playBtn.querySelector('.xb-tts-auto-dot');
    ui.playBtn.textContent = playIcon;
    if (playBtnContent) {
        ui.playBtn.appendChild(playBtnContent);
    } else {
        const dot = document.createElement('span');
        dot.className = 'xb-tts-auto-dot';
        ui.playBtn.appendChild(dot);
    }
    
    ui.statusText.textContent = statusText;
    
    if (hasQueue && current > 0) {
        ui.badge.textContent = `${current}/${total}`;
    }
    
    ui.stopBtn.style.display = showStop ? '' : 'none';
    
    if (hasQueue && total > 0) {
        const pct = Math.min(100, (current / total) * 100);
        ui.progressInner.style.width = `${pct}%`;
    } else if (state.progress && state.duration) {
        const pct = Math.min(100, (state.progress / state.duration) * 100);
        ui.progressInner.style.width = `${pct}%`;
    } else {
        ui.progressInner.style.width = '0%';
    }
    
    if (state.textLength && ui.usageText) {
        ui.usageText.textContent = `${state.textLength} 字`;
    }
}

export function removeTtsPanel(messageId) {
    const ui = panelMap.get(messageId);
    if (ui) {
        ui._cleanup?.();
        panelMap.delete(messageId);
    }
    pendingCallbacks.delete(messageId);
}

export function removeAllTtsPanels() {
    panelMap.forEach((ui) => {
        ui._cleanup?.();
    });
    panelMap.clear();
    pendingCallbacks.clear();
    
    observer?.disconnect();
    observer = null;
}

export function getPanelMap() {
    return panelMap;
}
