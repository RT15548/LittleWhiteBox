// tts-panel.js
/**
 * TTS 播放器面板 - 支持楼层按钮和悬浮按钮双模式
 */

import { registerToToolbar, removeFromToolbar } from '../../widgets/message-toolbar.js';

// ═══════════════════════════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════════════════════════

const FLOAT_POS_KEY = 'xb_tts_float_pos';
const INITIAL_RENDER_LIMIT = 1;

// ═══════════════════════════════════════════════════════════════════════════
// 状态
// ═══════════════════════════════════════════════════════════════════════════

// 楼层按钮
const panelMap = new Map();
const pendingCallbacks = new Map();
let floorObserver = null;

// 悬浮按钮
let floatingEl = null;
let floatingDragState = null;
let $floatingCache = {};

// 通用
let stylesInjected = false;

// 配置接口
let getConfigFn = null;
let saveConfigFn = null;
let openSettingsFn = null;
let clearQueueFn = null;
let getLastAIMessageIdFn = null;
let speakMessageFn = null;

export function setPanelConfigHandlers(handlers) {
    getConfigFn = handlers.getConfig;
    saveConfigFn = handlers.saveConfig;
    openSettingsFn = handlers.openSettings;
    clearQueueFn = handlers.clearQueue;
    getLastAIMessageIdFn = handlers.getLastAIMessageId;
    speakMessageFn = handlers.speakMessage;
}

export function clearPanelConfigHandlers() {
    getConfigFn = null;
    saveConfigFn = null;
    openSettingsFn = null;
    clearQueueFn = null;
    getLastAIMessageIdFn = null;
    speakMessageFn = null;
}

// ═══════════════════════════════════════════════════════════════════════════
// 样式
// ═══════════════════════════════════════════════════════════════════════════

const STYLES = `
.xb-tts-panel {
    --h: 34px;
    --bg: rgba(0, 0, 0, 0.55);
    --bg-solid: rgba(24, 24, 28, 0.98);
    --bg-hover: rgba(0, 0, 0, 0.7);
    --border: rgba(255, 255, 255, 0.08);
    --border-hover: rgba(255, 255, 255, 0.2);
    --text: rgba(255, 255, 255, 0.85);
    --text-sub: rgba(255, 255, 255, 0.45);
    --text-dim: rgba(255, 255, 255, 0.25);
    --success: rgba(62, 207, 142, 0.9);
    --error: rgba(239, 68, 68, 0.8);
    position: relative;
    display: inline-flex;
    flex-direction: column;
    z-index: 10;
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

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
    border-color: var(--border-hover);
}

.xb-tts-panel[data-auto="true"] .xb-tts-capsule {
    border-color: rgba(62, 207, 142, 0.25);
}
.xb-tts-panel[data-auto="true"]:hover .xb-tts-capsule {
    border-color: rgba(62, 207, 142, 0.4);
}

.xb-tts-panel[data-status="playing"] .xb-tts-capsule {
    border-color: rgba(255, 255, 255, 0.25);
}
.xb-tts-panel[data-status="error"] .xb-tts-capsule {
    border-color: var(--error);
}

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

.xb-tts-btn.stop-btn {
    color: var(--text-sub);
    font-size: 8px;
}
.xb-tts-btn.stop-btn:hover {
    color: var(--error);
    background: rgba(239, 68, 68, 0.1);
}

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

.xb-tts-sep {
    width: 1px;
    height: 12px;
    background: var(--border);
    margin: 0 2px;
    flex-shrink: 0;
}

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
    0%, 100% { transform: scaleY(0.4); opacity: 0.4; }
    50% { transform: scaleY(1); opacity: 0.85; }
}

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
.xb-tts-select:hover { border-color: rgba(255, 255, 255, 0.2); }
.xb-tts-select:focus { border-color: rgba(255, 255, 255, 0.3); }

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
.xb-tts-auto-toggle:hover .xb-tts-auto-text { color: var(--text); }
.xb-tts-auto-toggle.on .xb-tts-auto-text { color: rgba(62, 207, 142, 0.9); }

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

.xb-tts-floating-global {
    position: fixed;
    z-index: 10000;
    user-select: none;
    will-change: transform;
}

.xb-tts-floating-global .xb-tts-capsule {
    background: var(--bg-solid);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    touch-action: none;
    cursor: grab;
}

.xb-tts-floating-global .xb-tts-capsule:active { cursor: grabbing; }

.xb-tts-floating-global .xb-tts-menu {
    top: auto;
    bottom: calc(100% + 10px);
    transform: translateY(6px) scale(0.98);
    transform-origin: bottom left;
}

.xb-tts-floating-global.expanded .xb-tts-menu {
    transform: translateY(0) scale(1);
}

.xb-tts-floating-global .xb-tts-btn.expand-btn { transform: rotate(180deg); }
.xb-tts-floating-global.expanded .xb-tts-btn.expand-btn { transform: rotate(0deg); }

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
.xb-tts-tag:hover { color: rgba(255, 255, 255, 0.45); }
.xb-tts-tag-icon { font-style: normal; font-size: 10px; opacity: 0.7; }
.xb-tts-tag-dot { opacity: 0.4; }
.xb-tts-tag[data-has-params="true"] { color: rgba(255, 255, 255, 0.3); }
`;

function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    const el = document.createElement('style');
    el.id = 'xb-tts-panel-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
}

// ═══════════════════════════════════════════════════════════════════════════
// 通用工具
// ═══════════════════════════════════════════════════════════════════════════

function fillVoiceSelect(selectEl) {
    if (!selectEl) return;
    const config = getConfigFn?.();
    const mySpeakers = config?.volc?.mySpeakers || [];
    const currentSpeaker = config?.volc?.defaultSpeaker || '';

    selectEl.replaceChildren();

    if (mySpeakers.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = '暂无音色';
        opt.disabled = true;
        selectEl.appendChild(opt);
        return;
    }

    mySpeakers.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.value;
        opt.textContent = s.name || s.value;
        if (s.value === currentSpeaker) opt.selected = true;
        selectEl.appendChild(opt);
    });
}

function safeGetLastAIMessageId() {
    const id = getLastAIMessageIdFn?.();
    return typeof id === 'number' && id >= 0 ? id : -1;
}

function syncSpeedUI($cache) {
    const config = getConfigFn?.();
    const currentSpeed = config?.volc?.speechRate || 1.0;
    if ($cache.speedSlider) $cache.speedSlider.value = currentSpeed;
    if ($cache.speedVal) $cache.speedVal.textContent = currentSpeed.toFixed(1) + 'x';
}

// ═══════════════════════════════════════════════════════════════════════════
// DOM 构建（符合 ESLint 规范，不使用 innerHTML）
// ═══════════════════════════════════════════════════════════════════════════

function createWaveElement() {
    const wave = document.createElement('div');
    wave.className = 'xb-tts-wave';
    for (let i = 0; i < 4; i++) {
        const bar = document.createElement('div');
        bar.className = 'xb-tts-bar';
        wave.appendChild(bar);
    }
    return wave;
}

function createMenuElement(speed, isAuto) {
    const menu = document.createElement('div');
    menu.className = 'xb-tts-menu';

    // 音色行
    const voiceRow = document.createElement('div');
    voiceRow.className = 'xb-tts-row';
    const voiceLabel = document.createElement('span');
    voiceLabel.className = 'xb-tts-label';
    voiceLabel.textContent = '音色';
    voiceRow.appendChild(voiceLabel);
    const voiceSelect = document.createElement('select');
    voiceSelect.className = 'xb-tts-select voice-select';
    voiceRow.appendChild(voiceSelect);
    menu.appendChild(voiceRow);

    // 语速行
    const speedRow = document.createElement('div');
    speedRow.className = 'xb-tts-row';
    const speedLabel = document.createElement('span');
    speedLabel.className = 'xb-tts-label';
    speedLabel.textContent = '语速';
    speedRow.appendChild(speedLabel);
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.className = 'xb-tts-slider speed-slider';
    speedSlider.min = '0.5';
    speedSlider.max = '2.0';
    speedSlider.step = '0.1';
    speedSlider.value = String(speed);
    speedRow.appendChild(speedSlider);
    const speedVal = document.createElement('span');
    speedVal.className = 'xb-tts-val speed-val';
    speedVal.textContent = speed.toFixed(1) + 'x';
    speedRow.appendChild(speedVal);
    menu.appendChild(speedRow);

    // 工具栏
    const tools = document.createElement('div');
    tools.className = 'xb-tts-tools';

    const usage = document.createElement('span');
    usage.className = 'xb-tts-usage';
    usage.textContent = '-字';
    tools.appendChild(usage);

    const autoToggle = document.createElement('div');
    autoToggle.className = 'xb-tts-auto-toggle' + (isAuto ? ' on' : '');
    autoToggle.title = 'AI回复后自动朗读';
    const autoIndicator = document.createElement('span');
    autoIndicator.className = 'xb-tts-auto-indicator';
    autoToggle.appendChild(autoIndicator);
    const autoText = document.createElement('span');
    autoText.className = 'xb-tts-auto-text';
    autoText.textContent = '自动朗读';
    autoToggle.appendChild(autoText);
    tools.appendChild(autoToggle);

    const settingsBtn = document.createElement('span');
    settingsBtn.className = 'xb-tts-icon-btn settings-btn';
    settingsBtn.title = 'TTS 设置';
    settingsBtn.textContent = '⚙';
    tools.appendChild(settingsBtn);

    menu.appendChild(tools);

    return menu;
}

function createCapsuleElement(mode) {
    const capsule = document.createElement('div');
    capsule.className = 'xb-tts-capsule';

    const loading = document.createElement('div');
    loading.className = 'xb-tts-loading';
    capsule.appendChild(loading);

    const playBtn = document.createElement('button');
    playBtn.className = 'xb-tts-btn play-btn';
    playBtn.title = '播放';
    playBtn.textContent = '▶';
    const autoDot = document.createElement('span');
    autoDot.className = 'xb-tts-auto-dot';
    playBtn.appendChild(autoDot);
    capsule.appendChild(playBtn);

    const info = document.createElement('div');
    info.className = 'xb-tts-info';
    info.appendChild(createWaveElement());
    const statusText = document.createElement('span');
    statusText.className = 'xb-tts-status';
    statusText.textContent = '播放';
    info.appendChild(statusText);
    const badge = document.createElement('span');
    badge.className = 'xb-tts-badge';
    badge.textContent = '0/0';
    info.appendChild(badge);
    capsule.appendChild(info);

    const stopBtn = document.createElement('button');
    stopBtn.className = 'xb-tts-btn stop-btn';
    stopBtn.title = '停止';
    stopBtn.textContent = '■';
    stopBtn.style.display = 'none';
    capsule.appendChild(stopBtn);

    const sep = document.createElement('div');
    sep.className = 'xb-tts-sep';
    capsule.appendChild(sep);

    const expandBtn = document.createElement('button');
    expandBtn.className = 'xb-tts-btn expand-btn';
    expandBtn.title = '设置';
    expandBtn.textContent = mode === 'floating' ? '▲' : '▼';
    capsule.appendChild(expandBtn);

    const progress = document.createElement('div');
    progress.className = 'xb-tts-progress';
    const progressInner = document.createElement('div');
    progressInner.className = 'xb-tts-progress-inner';
    progress.appendChild(progressInner);
    capsule.appendChild(progress);

    return capsule;
}

function createPanelElement(speed, isAuto, mode = 'floor') {
    const div = document.createElement('div');
    div.className = 'xb-tts-panel';
    div.dataset.status = 'idle';
    div.dataset.hasQueue = 'false';
    div.dataset.auto = isAuto ? 'true' : 'false';

    const menu = createMenuElement(speed, isAuto);
    const capsule = createCapsuleElement(mode);

    if (mode === 'floating') {
        div.appendChild(menu);
        div.appendChild(capsule);
    } else {
        div.appendChild(capsule);
        div.appendChild(menu);
    }

    return div;
}

function cachePanelDOM(el) {
    return {
        capsule: el.querySelector('.xb-tts-capsule'),
        playBtn: el.querySelector('.play-btn'),
        stopBtn: el.querySelector('.stop-btn'),
        statusText: el.querySelector('.xb-tts-status'),
        badge: el.querySelector('.xb-tts-badge'),
        progressInner: el.querySelector('.xb-tts-progress-inner'),
        voiceSelect: el.querySelector('.voice-select'),
        speedSlider: el.querySelector('.speed-slider'),
        speedVal: el.querySelector('.speed-val'),
        usageText: el.querySelector('.xb-tts-usage'),
        autoToggle: el.querySelector('.xb-tts-auto-toggle'),
        expandBtn: el.querySelector('.expand-btn'),
        settingsBtn: el.querySelector('.settings-btn'),
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 共用事件绑定
// ═══════════════════════════════════════════════════════════════════════════

function bindCommonEvents($cache, parentEl = null) {
    $cache.autoToggle?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const config = getConfigFn?.();
        if (!config) return;
        const newValue = config.autoSpeak === false;
        config.autoSpeak = newValue;
        await saveConfigFn?.({ autoSpeak: newValue });
        updateAutoSpeakAll();
    });
    $cache.voiceSelect?.addEventListener('change', async (e) => {
        const config = getConfigFn?.();
        if (config?.volc) {
            config.volc.defaultSpeaker = e.target.value;
            await saveConfigFn?.({ volc: config.volc });
        }
    });
    $cache.speedSlider?.addEventListener('input', (e) => {
        if ($cache.speedVal) {
            $cache.speedVal.textContent = Number(e.target.value).toFixed(1) + 'x';
        }
    });
    $cache.speedSlider?.addEventListener('change', async (e) => {
        const config = getConfigFn?.();
        if (config?.volc) {
            config.volc.speechRate = Number(e.target.value);
            await saveConfigFn?.({ volc: config.volc });
            updateSpeedAll();
        }
    });
    $cache.settingsBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        // ★ 关闭所有菜单
        panelMap.forEach(data => data.root?.classList.remove('expanded'));
        floatingEl?.classList.remove('expanded');
        openSettingsFn?.();
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 楼层面板
// ═══════════════════════════════════════════════════════════════════════════

function createFloorPanel(messageId) {
    const config = getConfigFn?.() || {};
    const currentSpeed = config?.volc?.speechRate || 1.0;
    const isAutoSpeak = config?.autoSpeak !== false;

    const div = createPanelElement(currentSpeed, isAutoSpeak, 'floor');
    div.dataset.messageId = messageId;

    return div;
}

function bindFloorPanelEvents(panelData, onPlay) {
    const { messageId, root: el, $cache } = panelData;

    $cache.playBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        onPlay(messageId);
    });

    $cache.stopBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        clearQueueFn?.(messageId);
    });

    $cache.expandBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        el.classList.toggle('expanded');
        if (el.classList.contains('expanded')) {
            fillVoiceSelect($cache.voiceSelect);
            syncSpeedUI($cache);
        }
    });

    bindCommonEvents($cache);

    const closeMenu = (e) => {
        if (!el.contains(e.target)) {
            el.classList.remove('expanded');
        }
    };
    document.addEventListener('click', closeMenu, { passive: true });

    panelData._cleanup = () => {
        document.removeEventListener('click', closeMenu);
        removeFromToolbar(messageId, el);
    };
}

function mountFloorPanel(messageEl, messageId, onPlay) {
    if (panelMap.has(messageId)) {
        const existing = panelMap.get(messageId);
        if (existing.root?.isConnected) return existing;
        existing._cleanup?.();
        panelMap.delete(messageId);
    }

    injectStyles();

    const panel = createFloorPanel(messageId);
    const panelData = { messageId, root: panel, $cache: cachePanelDOM(panel) };

    const success = registerToToolbar(messageId, panel, {
        position: 'left',
        id: `tts-${messageId}`
    });

    if (!success) return null;

    bindFloorPanelEvents(panelData, onPlay);
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
            const cb = pendingCallbacks.get(mid);

            if (cb) {
                toMount.push({ el, mid, cb });
                pendingCallbacks.delete(mid);
                floorObserver.unobserve(el);
            }
        }

        if (toMount.length > 0) {
            requestAnimationFrame(() => {
                for (const { el, mid, cb } of toMount) {
                    mountFloorPanel(el, mid, cb);
                }
            });
        }
    }, { rootMargin: '300px', threshold: 0 });
}

// ═══════════════════════════════════════════════════════════════════════════
// 悬浮按钮
// ═══════════════════════════════════════════════════════════════════════════

function getFloatingPosition() {
    try {
        const raw = localStorage.getItem(FLOAT_POS_KEY);
        if (raw) return JSON.parse(raw);
    } catch {}
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
    const w = floatingEl.offsetWidth || 88;
    const h = floatingEl.offsetHeight || 36;
    floatingEl.style.left = `${Math.max(0, Math.min(pos.left, window.innerWidth - w))}px`;
    floatingEl.style.top = `${Math.max(0, Math.min(pos.top, window.innerHeight - h))}px`;
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
    if (target.closest('.play-btn')) {
        handleFloatingPlayClick();
    } else if (target.closest('.stop-btn')) {
        const messageId = safeGetLastAIMessageId();
        if (messageId >= 0) clearQueueFn?.(messageId);
    } else if (target.closest('.expand-btn')) {
        floatingEl.classList.toggle('expanded');
        if (floatingEl.classList.contains('expanded')) {
            fillVoiceSelect($floatingCache.voiceSelect);
            syncSpeedUI($floatingCache);
        }
    }
}

function handleFloatingPlayClick() {
    const messageId = safeGetLastAIMessageId();
    if (messageId < 0) {
        if (typeof toastr !== 'undefined') {
            toastr.warning('没有可朗读的AI消息');
        }
        return;
    }
    speakMessageFn?.(messageId);
}

function handleFloatingOutsideClick(e) {
    if (floatingEl && !floatingEl.contains(e.target)) {
        floatingEl.classList.remove('expanded');
    }
}

function createFloatingButton() {
    if (floatingEl) return;

    const config = getConfigFn?.();
    if (!config || config.showFloatingButton !== true) return;

    injectStyles();

    const isAutoSpeak = config.autoSpeak !== false;
    const currentSpeed = config.volc?.speechRate || 1.0;

    floatingEl = createPanelElement(currentSpeed, isAutoSpeak, 'floating');
    floatingEl.classList.add('xb-tts-floating-global');
    floatingEl.id = 'xb-tts-floating-global';

    document.body.appendChild(floatingEl);

    $floatingCache = cachePanelDOM(floatingEl);

    applyFloatingPosition();

    // 拖拽事件
    const capsuleEl = $floatingCache.capsule;
    if (capsuleEl) {
        capsuleEl.addEventListener('pointerdown', onFloatingPointerDown, { passive: false });
        capsuleEl.addEventListener('pointermove', onFloatingPointerMove, { passive: false });
        capsuleEl.addEventListener('pointerup', onFloatingPointerUp, { passive: false });
        capsuleEl.addEventListener('pointercancel', onFloatingPointerUp, { passive: false });
    }

    bindCommonEvents($floatingCache);

    document.addEventListener('click', handleFloatingOutsideClick, { passive: true });
    window.addEventListener('resize', applyFloatingPosition);
}

function destroyFloatingButton() {
    if (!floatingEl) return;
    window.removeEventListener('resize', applyFloatingPosition);
    document.removeEventListener('click', handleFloatingOutsideClick);
    // ★ 显式移除 pointer 事件
    const capsuleEl = $floatingCache.capsule;
    if (capsuleEl) {
        capsuleEl.removeEventListener('pointerdown', onFloatingPointerDown);
        capsuleEl.removeEventListener('pointermove', onFloatingPointerMove);
        capsuleEl.removeEventListener('pointerup', onFloatingPointerUp);
        capsuleEl.removeEventListener('pointercancel', onFloatingPointerUp);
    }
    floatingEl.remove();
    floatingEl = null;
    floatingDragState = null;
    $floatingCache = {};
}

// ═══════════════════════════════════════════════════════════════════════════
// 状态更新
// ═══════════════════════════════════════════════════════════════════════════

function updatePanelStateCore($cache, el, state) {
    if (!el || !state) return;

    const status = state.status || 'idle';
    const current = state.currentSegment || 0;
    const total = state.totalSegments || 0;
    const hasQueue = total > 1;

    el.dataset.status = status;
    el.dataset.hasQueue = hasQueue ? 'true' : 'false';

    let statusText = '';
    let playIcon = '▶';
    let showStop = false;

    switch (status) {
        case 'idle':
            statusText = '播放';
            break;
        case 'sending':
        case 'queued':
            statusText = hasQueue ? `${current}/${total}` : '准备';
            playIcon = '■';
            showStop = true;
            break;
        case 'cached':
            statusText = hasQueue ? `${current}/${total}` : '缓存';
            break;
        case 'playing':
            statusText = hasQueue ? `${current}/${total}` : '';
            playIcon = '⏸';
            showStop = true;
            break;
        case 'paused':
            statusText = hasQueue ? `${current}/${total}` : '暂停';
            showStop = true;
            break;
        case 'ended':
            statusText = '完成';
            playIcon = '↻';
            break;
        case 'blocked':
            statusText = '受阻';
            break;
        case 'error':
            statusText = (state.error || '失败').slice(0, 8);
            playIcon = '↻';
            break;
    }

    if ($cache.playBtn) {
        const existingDot = $cache.playBtn.querySelector('.xb-tts-auto-dot');
        $cache.playBtn.textContent = playIcon;
        if (existingDot) {
            $cache.playBtn.appendChild(existingDot);
        } else {
            const newDot = document.createElement('span');
            newDot.className = 'xb-tts-auto-dot';
            $cache.playBtn.appendChild(newDot);
        }
    }

    if ($cache.statusText) $cache.statusText.textContent = statusText;
    if ($cache.badge && hasQueue && current > 0) $cache.badge.textContent = `${current}/${total}`;
    if ($cache.stopBtn) $cache.stopBtn.style.display = showStop ? '' : 'none';

    if ($cache.progressInner) {
        if (hasQueue && total > 0) {
            $cache.progressInner.style.width = `${Math.min(100, (current / total) * 100)}%`;
        } else if (state.progress && state.duration) {
            $cache.progressInner.style.width = `${Math.min(100, (state.progress / state.duration) * 100)}%`;
        } else {
            $cache.progressInner.style.width = '0%';
        }
    }

    if (state.textLength && $cache.usageText) {
        $cache.usageText.textContent = `${state.textLength} 字`;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 全局同步
// ═══════════════════════════════════════════════════════════════════════════

export function updateAutoSpeakAll() {
    const config = getConfigFn?.();
    const isAutoSpeak = config?.autoSpeak !== false;

    panelMap.forEach((data) => {
        if (!data.root) return;
        data.root.dataset.auto = isAutoSpeak ? 'true' : 'false';
        data.$cache?.autoToggle?.classList.toggle('on', isAutoSpeak);
    });

    if (floatingEl) {
        floatingEl.dataset.auto = isAutoSpeak ? 'true' : 'false';
        $floatingCache.autoToggle?.classList.toggle('on', isAutoSpeak);
    }
}

export function updateSpeedAll() {
    panelMap.forEach((data) => {
        if (!data.root) return;
        syncSpeedUI(data.$cache);
    });

    if (floatingEl) {
        syncSpeedUI($floatingCache);
    }
}

export function updateVoiceAll() {
    panelMap.forEach((data) => {
        if (!data.root || !data.$cache?.voiceSelect) return;
        fillVoiceSelect(data.$cache.voiceSelect);
    });

    if (floatingEl && $floatingCache.voiceSelect) {
        fillVoiceSelect($floatingCache.voiceSelect);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 对外接口
// ═══════════════════════════════════════════════════════════════════════════

export function initTtsPanelStyles() {
    injectStyles();
}

export function ensureTtsPanel(messageEl, messageId, onPlay) {
    const config = getConfigFn?.();
    if (config?.showFloorButton === false) return null;

    injectStyles();

    if (panelMap.has(messageId)) {
        const existing = panelMap.get(messageId);
        if (existing.root?.isConnected) return existing;
        existing._cleanup?.();
        panelMap.delete(messageId);
    }

    const rect = messageEl.getBoundingClientRect();
    if (rect.top < window.innerHeight + 300 && rect.bottom > -300) {
        return mountFloorPanel(messageEl, messageId, onPlay);
    }

    setupFloorObserver();
    pendingCallbacks.set(messageId, onPlay);
    floorObserver.observe(messageEl);

    return null;
}

export function renderPanelsForChat(chat, getMessageElement, onPlay) {
    const config = getConfigFn?.();
    if (config?.showFloorButton === false) return;

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
            mountFloorPanel(messageEl, i, onPlay);
            immediateCount++;
        } else {
            setupFloorObserver();
            pendingCallbacks.set(i, onPlay);
            floorObserver.observe(messageEl);
        }
    }
}

export function updateTtsPanel(messageId, state) {
    const panelData = panelMap.get(messageId);
    if (panelData?.root && state) {
        updatePanelStateCore(panelData.$cache, panelData.root, state);
    }

    if (floatingEl && messageId === safeGetLastAIMessageId()) {
        updatePanelStateCore($floatingCache, floatingEl, state);
    }
}

export function resetFloatingState() {
    if (!floatingEl) return;

    floatingEl.dataset.status = 'idle';
    floatingEl.dataset.hasQueue = 'false';

    if ($floatingCache.statusText) $floatingCache.statusText.textContent = '播放';
    if ($floatingCache.badge) $floatingCache.badge.textContent = '0/0';
    if ($floatingCache.progressInner) $floatingCache.progressInner.style.width = '0%';
    if ($floatingCache.stopBtn) $floatingCache.stopBtn.style.display = 'none';
    if ($floatingCache.usageText) $floatingCache.usageText.textContent = '-字';

    if ($floatingCache.playBtn) {
        const dot = $floatingCache.playBtn.querySelector('.xb-tts-auto-dot');
        $floatingCache.playBtn.textContent = '▶';
        if (dot) $floatingCache.playBtn.appendChild(dot);
    }
}

export function removeTtsPanel(messageId) {
    const data = panelMap.get(messageId);
    if (data) {
        data._cleanup?.();
        panelMap.delete(messageId);
    }
    pendingCallbacks.delete(messageId);
}

export function removeAllTtsPanels() {
    panelMap.forEach((data) => data._cleanup?.());
    panelMap.clear();
    pendingCallbacks.clear();

    floorObserver?.disconnect();
    floorObserver = null;
}

export function initFloatingPanel() {
    if (!getConfigFn) return;
    createFloatingButton();
}

export function destroyFloatingPanel() {
    destroyFloatingButton();
}

export function updateButtonVisibility(showFloor, showFloating) {
    if (showFloating && !floatingEl) {
        createFloatingButton();
    } else if (!showFloating && floatingEl) {
        destroyFloatingButton();
    }

    if (!showFloor) {
        removeAllTtsPanels();
    }
}

export function getPanelMap() {
    return panelMap;
}
