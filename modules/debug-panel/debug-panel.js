// ═══════════════════════════════════════════════════════════════════════════
// 导入和常量
// ═══════════════════════════════════════════════════════════════════════════

import { extensionFolderPath } from "../../core/constants.js";
import { postToIframe, isTrustedMessage } from "../../core/iframe-messaging.js";

const STORAGE_EXPANDED_KEY = "xiaobaix_debug_panel_pos_v2";
const STORAGE_MINI_KEY = "xiaobaix_debug_panel_minipos_v2";

// ═══════════════════════════════════════════════════════════════════════════
// 状态变量
// ═══════════════════════════════════════════════════════════════════════════

let isOpen = false;
let isExpanded = false;
let panelEl = null;
let miniBtnEl = null;
let iframeEl = null;
let dragState = null;
let pollTimer = null;
let lastLogId = 0;
let frameReady = false;
let messageListenerBound = false;
let resizeHandler = null;

// ═══════════════════════════════════════════════════════════════════════════
// 性能监控状态
// ═══════════════════════════════════════════════════════════════════════════

let perfMonitorActive = false;
let originalFetch = null;
let longTaskObserver = null;
let fpsFrameId = null;
let lastFrameTime = 0;
let frameCount = 0;
let currentFps = 0;

const requestLog = [];
const longTaskLog = [];
const MAX_PERF_LOG = 50;
const SLOW_REQUEST_THRESHOLD = 500;

// ═══════════════════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════════════════

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const isMobile = () => window.innerWidth <= 768;
const countErrors = (logs) => (logs || []).filter(l => l?.level === "error").length;
const maxLogId = (logs) => (logs || []).reduce((m, l) => Math.max(m, Number(l?.id) || 0), 0);

// ═══════════════════════════════════════════════════════════════════════════
// 存储
// ═══════════════════════════════════════════════════════════════════════════

function readJSON(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function writeJSON(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ═══════════════════════════════════════════════════════════════════════════
// 页面统计
// ═══════════════════════════════════════════════════════════════════════════

function getPageStats() {
    try {
        return {
            domCount: document.querySelectorAll('*').length,
            messageCount: document.querySelectorAll('.mes').length,
            imageCount: document.querySelectorAll('img').length
        };
    } catch {
        return { domCount: 0, messageCount: 0, imageCount: 0 };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 性能监控：Fetch 拦截
// ═══════════════════════════════════════════════════════════════════════════

function startFetchInterceptor() {
    if (originalFetch) return;
    originalFetch = window.fetch;
    window.fetch = async function(input, init) {
        const url = typeof input === 'string' ? input : input?.url || '';
        const method = init?.method || 'GET';
        const startTime = performance.now();
        const timestamp = Date.now();
        try {
            const response = await originalFetch.apply(this, arguments);
            const duration = performance.now() - startTime;
            if (url.includes('/api/') && duration >= SLOW_REQUEST_THRESHOLD) {
                requestLog.push({ url, method, duration: Math.round(duration), timestamp, status: response.status });
                if (requestLog.length > MAX_PERF_LOG) requestLog.shift();
            }
            return response;
        } catch (err) {
            const duration = performance.now() - startTime;
            requestLog.push({ url, method, duration: Math.round(duration), timestamp, status: 'error' });
            if (requestLog.length > MAX_PERF_LOG) requestLog.shift();
            throw err;
        }
    };
}

function stopFetchInterceptor() {
    if (originalFetch) {
        window.fetch = originalFetch;
        originalFetch = null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 性能监控：长任务检测
// ═══════════════════════════════════════════════════════════════════════════

function startLongTaskObserver() {
    if (longTaskObserver) return;
    try {
        if (typeof PerformanceObserver === 'undefined') return;
        longTaskObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration >= 200) {
                    let source = '主页面';
                    try {
                        const attr = entry.attribution?.[0];
                        if (attr) {
                            if (attr.containerType === 'iframe') {
                                source = 'iframe';
                                if (attr.containerSrc) {
                                    const url = new URL(attr.containerSrc, location.href);
                                    source += `: ${url.pathname.split('/').pop() || url.pathname}`;
                                }
                            } else if (attr.containerName) {
                                source = attr.containerName;
                            }
                        }
                    } catch {}
                    longTaskLog.push({ 
                        duration: Math.round(entry.duration), 
                        timestamp: Date.now(),
                        source
                    });
                    if (longTaskLog.length > MAX_PERF_LOG) longTaskLog.shift();
                }
            }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch {}
}

function stopLongTaskObserver() {
    if (longTaskObserver) {
        try { longTaskObserver.disconnect(); } catch {}
        longTaskObserver = null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 性能监控：FPS 计算
// ═══════════════════════════════════════════════════════════════════════════

function startFpsMonitor() {
    if (fpsFrameId) return;
    lastFrameTime = performance.now();
    frameCount = 0;
    const loop = (now) => {
        frameCount++;
        if (now - lastFrameTime >= 1000) {
            currentFps = frameCount;
            frameCount = 0;
            lastFrameTime = now;
        }
        fpsFrameId = requestAnimationFrame(loop);
    };
    fpsFrameId = requestAnimationFrame(loop);
}

function stopFpsMonitor() {
    if (fpsFrameId) {
        cancelAnimationFrame(fpsFrameId);
        fpsFrameId = null;
    }
    currentFps = 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// 性能监控：内存
// ═══════════════════════════════════════════════════════════════════════════

function getMemoryInfo() {
    if (typeof performance === 'undefined' || !performance.memory) return null;
    const mem = performance.memory;
    return {
        used: mem.usedJSHeapSize,
        total: mem.totalJSHeapSize,
        limit: mem.jsHeapSizeLimit
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 性能监控：生命周期
// ═══════════════════════════════════════════════════════════════════════════

function startPerfMonitor() {
    if (perfMonitorActive) return;
    perfMonitorActive = true;
    startFetchInterceptor();
    startLongTaskObserver();
    startFpsMonitor();
}

function stopPerfMonitor() {
    if (!perfMonitorActive) return;
    perfMonitorActive = false;
    stopFetchInterceptor();
    stopLongTaskObserver();
    stopFpsMonitor();
    requestLog.length = 0;
    longTaskLog.length = 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// 样式注入
// ═══════════════════════════════════════════════════════════════════════════

function ensureStyle() {
    if (document.getElementById("xiaobaix-debug-style")) return;
    const style = document.createElement("style");
    style.id = "xiaobaix-debug-style";
    style.textContent = `
#xiaobaix-debug-btn {
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
}
#xiaobaix-debug-btn .dbg-light {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #555;
    flex-shrink: 0;
    transition: background 0.2s, box-shadow 0.2s;
}
#xiaobaix-debug-btn .dbg-light.on {
    background: #4ade80;
    box-shadow: 0 0 6px #4ade80;
}
#xiaobaix-debug-mini {
    position: fixed;
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(28, 28, 32, 0.96);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    color: rgba(255,255,255,0.9);
    font-size: 12px;
    cursor: pointer;
    user-select: none;
    touch-action: none;
    box-shadow: 0 4px 14px rgba(0,0,0,0.35);
    transition: box-shadow 0.2s;
}
#xiaobaix-debug-mini:hover {
    box-shadow: 0 6px 18px rgba(0,0,0,0.45);
}
#xiaobaix-debug-mini .badge {
    padding: 2px 6px;
    border-radius: 999px;
    background: rgba(255,80,80,0.18);
    border: 1px solid rgba(255,80,80,0.35);
    color: #fca5a5;
    font-size: 10px;
}
#xiaobaix-debug-mini .badge.hidden { display: none; }
#xiaobaix-debug-mini.flash {
    animation: xbdbg-flash 0.35s ease-in-out 2;
}
@keyframes xbdbg-flash {
    0%,100% { box-shadow: 0 4px 14px rgba(0,0,0,0.35); }
    50% { box-shadow: 0 0 0 4px rgba(255,80,80,0.4); }
}
#xiaobaix-debug-panel {
    position: fixed;
    z-index: 10001;
    background: rgba(22,22,26,0.97);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 10px;
    box-shadow: 0 12px 36px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
@media (min-width: 769px) {
    #xiaobaix-debug-panel {
        resize: both;
        min-width: 320px;
        min-height: 260px;
    }
}
@media (max-width: 768px) {
    #xiaobaix-debug-panel {
        left: 0 !important;
        right: 0 !important;
        top: 0 !important;
        width: 100% !important;
        border-radius: 0;
        resize: none;
    }
}
#xiaobaix-debug-titlebar {
    user-select: none;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background: rgba(30,30,34,0.98);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
}
@media (min-width: 769px) {
    #xiaobaix-debug-titlebar { cursor: move; }
}
#xiaobaix-debug-titlebar .left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: rgba(255,255,255,0.88);
}
#xiaobaix-debug-titlebar .right {
    display: flex;
    align-items: center;
    gap: 6px;
}
.xbdbg-btn {
    width: 28px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.85);
    cursor: pointer;
    font-size: 12px;
    transition: background 0.15s;
}
.xbdbg-btn:hover { background: rgba(255,255,255,0.12); }
#xiaobaix-debug-frame {
    flex: 1;
    border: 0;
    width: 100%;
    background: transparent;
}
`;
    document.head.appendChild(style);
}

// ═══════════════════════════════════════════════════════════════════════════
// 定位计算
// ═══════════════════════════════════════════════════════════════════════════

function getAnchorRect() {
    const anchor = document.getElementById("nonQRFormItems");
    if (anchor) return anchor.getBoundingClientRect();
    return { top: window.innerHeight - 60, right: window.innerWidth, left: 0, width: window.innerWidth };
}

function getDefaultMiniPos() {
    const rect = getAnchorRect();
    const btnW = 90, btnH = 32, margin = 8;
    return { left: rect.right - btnW - margin, top: rect.top - btnH - margin };
}

function applyMiniPosition() {
    if (!miniBtnEl) return;
    const saved = readJSON(STORAGE_MINI_KEY);
    const def = getDefaultMiniPos();
    const pos = saved || def;
    const w = miniBtnEl.offsetWidth || 90;
    const h = miniBtnEl.offsetHeight || 32;
    miniBtnEl.style.left = `${clamp(pos.left, 0, window.innerWidth - w)}px`;
    miniBtnEl.style.top = `${clamp(pos.top, 0, window.innerHeight - h)}px`;
}

function saveMiniPos() {
    if (!miniBtnEl) return;
    const r = miniBtnEl.getBoundingClientRect();
    writeJSON(STORAGE_MINI_KEY, { left: Math.round(r.left), top: Math.round(r.top) });
}

function applyExpandedPosition() {
    if (!panelEl) return;
    if (isMobile()) {
        const rect = getAnchorRect();
        panelEl.style.left = "0";
        panelEl.style.top = "0";
        panelEl.style.width = "100%";
        panelEl.style.height = `${rect.top}px`;
        return;
    }
    const saved = readJSON(STORAGE_EXPANDED_KEY);
    const defW = 480, defH = 400;
    const w = saved?.width >= 320 ? saved.width : defW;
    const h = saved?.height >= 260 ? saved.height : defH;
    const left = saved?.left != null ? clamp(saved.left, 0, window.innerWidth - w) : 20;
    const top = saved?.top != null ? clamp(saved.top, 0, window.innerHeight - h) : 80;
    panelEl.style.left = `${left}px`;
    panelEl.style.top = `${top}px`;
    panelEl.style.width = `${w}px`;
    panelEl.style.height = `${h}px`;
}

function saveExpandedPos() {
    if (!panelEl || isMobile()) return;
    const r = panelEl.getBoundingClientRect();
    writeJSON(STORAGE_EXPANDED_KEY, { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) });
}

// ═══════════════════════════════════════════════════════════════════════════
// 数据获取与通信
// ═══════════════════════════════════════════════════════════════════════════

async function getDebugSnapshot() {
    const { xbLog, CacheRegistry } = await import("../../core/debug-core.js");
    const { EventCenter } = await import("../../core/event-manager.js");
    const pageStats = getPageStats();
    return {
        logs: xbLog.getAll(),
        events: EventCenter.getEventHistory?.() || [],
        eventStatsDetail: EventCenter.statsDetail?.() || {},
        caches: CacheRegistry.getStats(),
        performance: {
            requests: requestLog.slice(),
            longTasks: longTaskLog.slice(),
            fps: currentFps,
            memory: getMemoryInfo(),
            domCount: pageStats.domCount,
            messageCount: pageStats.messageCount,
            imageCount: pageStats.imageCount
        }
    };
}

function postToFrame(msg) {
    try { postToIframe(iframeEl, { ...msg }, "LittleWhiteBox-fork-DebugHost"); } catch {}
}

async function sendSnapshotToFrame() {
    if (!frameReady) return;
    const snapshot = await getDebugSnapshot();
    postToFrame({ type: "XB_DEBUG_DATA", payload: snapshot });
    updateMiniBadge(snapshot.logs);
}

async function handleAction(action) {
    const { xbLog, CacheRegistry } = await import("../../core/debug-core.js");
    const { EventCenter } = await import("../../core/event-manager.js");
    switch (action?.action) {
        case "refresh": await sendSnapshotToFrame(); break;
        case "clearLogs": xbLog.clear(); await sendSnapshotToFrame(); break;
        case "clearEvents": EventCenter.clearHistory?.(); await sendSnapshotToFrame(); break;
        case "clearCache": if (action.moduleId) CacheRegistry.clear(action.moduleId); await sendSnapshotToFrame(); break;
        case "clearAllCaches": CacheRegistry.clearAll(); await sendSnapshotToFrame(); break;
        case "clearRequests": requestLog.length = 0; await sendSnapshotToFrame(); break;
        case "clearTasks": longTaskLog.length = 0; await sendSnapshotToFrame(); break;
        case "cacheDetail":
            postToFrame({ type: "XB_DEBUG_CACHE_DETAIL", payload: { moduleId: action.moduleId, detail: CacheRegistry.getDetail(action.moduleId) } });
            break;
        case "exportLogs":
            postToFrame({ type: "XB_DEBUG_EXPORT", payload: { text: xbLog.export() } });
            break;
    }
}

function bindMessageListener() {
    if (messageListenerBound) return;
    messageListenerBound = true;
    // eslint-disable-next-line no-restricted-syntax
    window.addEventListener("message", async (e) => {
        // Guarded by isTrustedMessage (origin + source).
        if (!isTrustedMessage(e, iframeEl, "LittleWhiteBox-fork-DebugFrame")) return;
        const msg = e?.data;
        if (msg.type === "FRAME_READY") { frameReady = true; await sendSnapshotToFrame(); }
        else if (msg.type === "XB_DEBUG_ACTION") await handleAction(msg);
        else if (msg.type === "CLOSE_PANEL") closeDebugPanel();
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// UI 更新
// ═══════════════════════════════════════════════════════════════════════════

function updateMiniBadge(logs) {
    if (!miniBtnEl) return;
    const badge = miniBtnEl.querySelector(".badge");
    if (!badge) return;
    const errCount = countErrors(logs);
    badge.classList.toggle("hidden", errCount <= 0);
    badge.textContent = errCount > 0 ? String(errCount) : "";
    const newMax = maxLogId(logs);
    if (newMax > lastLogId && !isExpanded) {
        miniBtnEl.classList.remove("flash");
        // Force reflow to restart animation.
        // eslint-disable-next-line no-unused-expressions
        miniBtnEl.offsetWidth;
        miniBtnEl.classList.add("flash");
    }
    lastLogId = newMax;
}

function updateSettingsLight() {
    const light = document.querySelector("#xiaobaix-debug-btn .dbg-light");
    if (light) light.classList.toggle("on", isOpen);
}

// ═══════════════════════════════════════════════════════════════════════════
// 拖拽：最小化按钮
// ═══════════════════════════════════════════════════════════════════════════

function onMiniDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    dragState = {
        startX: e.clientX, startY: e.clientY,
        startLeft: miniBtnEl.getBoundingClientRect().left,
        startTop: miniBtnEl.getBoundingClientRect().top,
        pointerId: e.pointerId, moved: false
    };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    e.preventDefault();
}

function onMiniMove(e) {
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    const dx = e.clientX - dragState.startX, dy = e.clientY - dragState.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragState.moved = true;
    const w = miniBtnEl.offsetWidth || 90, h = miniBtnEl.offsetHeight || 32;
    miniBtnEl.style.left = `${clamp(dragState.startLeft + dx, 0, window.innerWidth - w)}px`;
    miniBtnEl.style.top = `${clamp(dragState.startTop + dy, 0, window.innerHeight - h)}px`;
    e.preventDefault();
}

function onMiniUp(e) {
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    const wasMoved = dragState.moved;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    dragState = null;
    saveMiniPos();
    if (!wasMoved) expandPanel();
}

// ═══════════════════════════════════════════════════════════════════════════
// 拖拽：展开面板标题栏
// ═══════════════════════════════════════════════════════════════════════════

function onTitleDown(e) {
    if (isMobile()) return;
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target?.closest?.(".xbdbg-btn")) return;
    dragState = {
        startX: e.clientX, startY: e.clientY,
        startLeft: panelEl.getBoundingClientRect().left,
        startTop: panelEl.getBoundingClientRect().top,
        pointerId: e.pointerId
    };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    e.preventDefault();
}

function onTitleMove(e) {
    if (!dragState || isMobile() || dragState.pointerId !== e.pointerId) return;
    const dx = e.clientX - dragState.startX, dy = e.clientY - dragState.startY;
    const w = panelEl.offsetWidth, h = panelEl.offsetHeight;
    panelEl.style.left = `${clamp(dragState.startLeft + dx, 0, window.innerWidth - w)}px`;
    panelEl.style.top = `${clamp(dragState.startTop + dy, 0, window.innerHeight - h)}px`;
    e.preventDefault();
}

function onTitleUp(e) {
    if (!dragState || isMobile() || dragState.pointerId !== e.pointerId) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    dragState = null;
    saveExpandedPos();
}

// ═══════════════════════════════════════════════════════════════════════════
// 轮询与 resize
// ═══════════════════════════════════════════════════════════════════════════

function startPoll() {
    stopPoll();
    pollTimer = setInterval(async () => {
        if (!isOpen) return;
        try { await sendSnapshotToFrame(); } catch {}
    }, 1500);
}

function stopPoll() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}

function onResize() {
    if (!isOpen) return;
    if (isExpanded) applyExpandedPosition();
    else applyMiniPosition();
}

// ═══════════════════════════════════════════════════════════════════════════
// 面板生命周期
// ═══════════════════════════════════════════════════════════════════════════

function createMiniButton() {
    if (miniBtnEl) return;
    miniBtnEl = document.createElement("div");
    miniBtnEl.id = "xiaobaix-debug-mini";
    miniBtnEl.innerHTML = `<span>监控</span><span class="badge hidden"></span>`;
    document.body.appendChild(miniBtnEl);
    applyMiniPosition();
    miniBtnEl.addEventListener("pointerdown", onMiniDown, { passive: false });
    miniBtnEl.addEventListener("pointermove", onMiniMove, { passive: false });
    miniBtnEl.addEventListener("pointerup", onMiniUp, { passive: false });
    miniBtnEl.addEventListener("pointercancel", onMiniUp, { passive: false });
}

function removeMiniButton() {
    miniBtnEl?.remove();
    miniBtnEl = null;
}

function createPanel() {
    if (panelEl) return;
    panelEl = document.createElement("div");
    panelEl.id = "xiaobaix-debug-panel";
    const titlebar = document.createElement("div");
    titlebar.id = "xiaobaix-debug-titlebar";
    titlebar.innerHTML = `
        <div class="left"><span>小白X改 监控台</span></div>
        <div class="right">
            <button class="xbdbg-btn" id="xbdbg-min" title="最小化" type="button">—</button>
            <button class="xbdbg-btn" id="xbdbg-close" title="关闭" type="button">×</button>
        </div>
    `;
    iframeEl = document.createElement("iframe");
    iframeEl.id = "xiaobaix-debug-frame";
    iframeEl.src = `${extensionFolderPath}/modules/debug-panel/debug-panel.html`;
    panelEl.appendChild(titlebar);
    panelEl.appendChild(iframeEl);
    document.body.appendChild(panelEl);
    applyExpandedPosition();
    titlebar.addEventListener("pointerdown", onTitleDown, { passive: false });
    titlebar.addEventListener("pointermove", onTitleMove, { passive: false });
    titlebar.addEventListener("pointerup", onTitleUp, { passive: false });
    titlebar.addEventListener("pointercancel", onTitleUp, { passive: false });
    panelEl.querySelector("#xbdbg-min")?.addEventListener("click", collapsePanel);
    panelEl.querySelector("#xbdbg-close")?.addEventListener("click", closeDebugPanel);
    if (!isMobile()) {
        panelEl.addEventListener("mouseup", saveExpandedPos);
        panelEl.addEventListener("mouseleave", saveExpandedPos);
    }
    frameReady = false;
}

function removePanel() {
    panelEl?.remove();
    panelEl = null;
    iframeEl = null;
    frameReady = false;
}

function expandPanel() {
    if (isExpanded) return;
    isExpanded = true;
    if (miniBtnEl) miniBtnEl.style.display = "none";
    if (panelEl) {
        panelEl.style.display = "";
    } else {
        createPanel();
    }
}

function collapsePanel() {
    if (!isExpanded) return;
    isExpanded = false;
    saveExpandedPos();
    if (panelEl) panelEl.style.display = "none";
    if (miniBtnEl) {
        miniBtnEl.style.display = "";
        applyMiniPosition();
    }
}

async function openDebugPanel() {
    if (isOpen) return;
    isOpen = true;
    ensureStyle();
    bindMessageListener();
    const { enableDebugMode } = await import("../../core/debug-core.js");
    enableDebugMode();
    startPerfMonitor();
    createMiniButton();
    startPoll();
    updateSettingsLight();
    if (!resizeHandler) { resizeHandler = onResize; window.addEventListener("resize", resizeHandler); }
    try { window.registerModuleCleanup?.("debugPanel", closeDebugPanel); } catch {}
}

async function closeDebugPanel() {
    if (!isOpen) return;
    isOpen = false;
    isExpanded = false;
    stopPoll();
    stopPerfMonitor();
    frameReady = false;
    lastLogId = 0;
    try { const { disableDebugMode } = await import("../../core/debug-core.js"); disableDebugMode(); } catch {}
    removePanel();
    removeMiniButton();
    updateSettingsLight();
}

// ═══════════════════════════════════════════════════════════════════════════
// 导出
// ═══════════════════════════════════════════════════════════════════════════

export async function toggleDebugPanel() {
    if (isOpen) await closeDebugPanel();
    else await openDebugPanel();
}

export { openDebugPanel as openDebugPanelExplicit, closeDebugPanel as closeDebugPanelExplicit };

if (typeof window !== "undefined") {
    window.xbDebugPanelToggle = toggleDebugPanel;
    window.xbDebugPanelClose = closeDebugPanel;
}
