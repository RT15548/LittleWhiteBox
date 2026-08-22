// cloud-presets.js
// 云端预设管理模块 (保持大尺寸 + 分页搜索)

import { V5_QUALITY_IDS, V5_UC_IDS } from './novel-v5-request.js';

// ═══════════════════════════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════════════════════════

const CLOUD_PRESETS_API = 'https://draw.velure.top/';
const PLUGIN_KEY = 'xbaix';
const ITEMS_PER_PAGE = 8;
const PRESET_TYPE = 'novel-draw-preset';
const CURRENT_PRESET_VERSION = 2;
const LEGACY_UC_TO_V5 = Object.freeze({
    0: 'heavy',
    1: 'light',
    2: 'humanFocus',
    3: 'none',
});
const DEFAULT_PARAMS = Object.freeze({
    model: 'nai-diffusion-4-5-full',
    sampler: 'k_euler_ancestral',
    scheduler: 'karras',
    steps: 28,
    scale: 6,
    width: 1216,
    height: 832,
    seed: -1,
    qualityToggle: true,
    autoSmea: false,
    ucPreset: 0,
    cfg_rescale: 0,
    v5QualityPresetId: 'standard',
    v5UcPresetId: 'heavy',
    transparentBackground: false,
    variety_boost: false,
    sm: false,
    sm_dyn: false,
    decrisper: false,
});

// ═══════════════════════════════════════════════════════════════════════════
// 状态
// ═══════════════════════════════════════════════════════════════════════════

let modalElement = null;
let allPresets = [];
let filteredPresets = [];
let currentPage = 1;
let onImportCallback = null;

// ═══════════════════════════════════════════════════════════════════════════
// API 调用
// ═══════════════════════════════════════════════════════════════════════════

export async function fetchCloudPresets() {
    const response = await fetch(CLOUD_PRESETS_API, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'X-Plugin-Key': PLUGIN_KEY,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        },
        cache: 'no-store'
    });
    
    if (!response.ok) throw new Error(`HTTP错误: ${response.status}`);
    const data = await response.json();
    return data.items || [];
}

export async function downloadPreset(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`下载失败: ${response.status}`);
    
    const data = await response.json();
    
    return data;
}

// ═══════════════════════════════════════════════════════════════════════════
// 预设处理
// ═══════════════════════════════════════════════════════════════════════════

function requirePresetEnvelope(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)
        || data.type !== PRESET_TYPE
        || !data.preset || typeof data.preset !== 'object' || Array.isArray(data.preset)) {
        throw new Error('无效的预设文件格式');
    }
    const version = Number(data.version);
    if (version !== 1 && version !== CURRENT_PRESET_VERSION) {
        throw new Error(`不支持的参数预设版本：${data.version ?? '缺失'}`);
    }
    return version;
}

function normalizeImportedParams(rawParams, version, warnings) {
    const importedParams = rawParams && typeof rawParams === 'object' && !Array.isArray(rawParams)
        ? { ...rawParams }
        : {};
    const qualityToggle = importedParams.qualityToggle !== false;
    const legacyUcPreset = [0, 1, 2, 3].includes(Number(importedParams.ucPreset))
        ? Number(importedParams.ucPreset)
        : 0;

    if (version === 1) {
        importedParams.v5QualityPresetId = qualityToggle ? 'standard' : 'none';
        importedParams.v5UcPresetId = LEGACY_UC_TO_V5[legacyUcPreset];
        importedParams.transparentBackground = false;
        return { ...DEFAULT_PARAMS, ...importedParams };
    }

    if (importedParams.v5QualityPresetId != null
        && !V5_QUALITY_IDS.includes(importedParams.v5QualityPresetId)) {
        warnings.push('无法识别 V5 Quality，已使用 Standard');
        importedParams.v5QualityPresetId = 'standard';
    }
    if (importedParams.v5UcPresetId != null
        && !V5_UC_IDS.includes(importedParams.v5UcPresetId)) {
        warnings.push('无法识别 V5 UC，已使用 Heavy');
        importedParams.v5UcPresetId = 'heavy';
    }
    return { ...DEFAULT_PARAMS, ...importedParams };
}

export function parsePresetData(data, generateId) {
    const version = requirePresetEnvelope(data);
    if (typeof generateId !== 'function') throw new TypeError('generateId must be a function');
    const warnings = [];
    const importedParams = normalizeImportedParams(data.preset.params, version, warnings);
    return {
        preset: {
            id: generateId(),
            name: String(data.name || data.preset.name || '云端预设'),
            positivePrefix: String(data.preset.positivePrefix || ''),
            negativePrefix: String(data.preset.negativePrefix || ''),
            maxImages: version === 1 ? 0 : Math.max(0, Number(data.preset.maxImages) || 0),
            maxCharactersPerImage: version === 1
                ? 0
                : Math.max(0, Number(data.preset.maxCharactersPerImage) || 0),
            params: importedParams,
        },
        warnings,
    };
}

export function exportPreset(preset) {
    const author = prompt("请输入你的作者名:", "") || "";
    const description = prompt("简介 (画风介绍):", "") || "";
    
    return {
        type: PRESET_TYPE,
        version: CURRENT_PRESET_VERSION,
        exportDate: new Date().toISOString(),
        name: preset.name,
        author: author,
        简介: description,
        preset: {
            positivePrefix: preset.positivePrefix,
            negativePrefix: preset.negativePrefix,
            maxImages: preset.maxImages || 0,
            maxCharactersPerImage: preset.maxCharactersPerImage || 0,
            params: { ...preset.params }
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 样式 - 保持原始大尺寸
// ═══════════════════════════════════════════════════════════════════════════

function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function ensureStyles() {
    if (document.getElementById('cloud-presets-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'cloud-presets-styles';
    style.textContent = `
/* ═══════════════════════════════════════════════════════════════════════════
   云端预设弹窗 - 保持大尺寸，接近 iframe 的布局
   ═══════════════════════════════════════════════════════════════════════════ */

.cloud-presets-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 100001 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: rgba(0, 0, 0, 0.85) !important;
    touch-action: none;
    -webkit-overflow-scrolling: touch;
    animation: cloudFadeIn 0.2s ease;
}

@keyframes cloudFadeIn { 
    from { opacity: 0; } 
    to { opacity: 1; } 
}

/* ═══════════════════════════════════════════════════════════════════════════
   弹窗主体 - 桌面端 80% 高度，宽度增加以适应网格
   ═══════════════════════════════════════════════════════════════════════════ */
.cloud-presets-modal {
    background: #161b22;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    
    /* 大尺寸 - 比原来更宽以适应网格 */
    width: calc(100vw - 48px);
    max-width: 800px;
    height: 80vh;
    
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

/* ═══════════════════════════════════════════════════════════════════════════
   手机端 - 接近全屏（和 iframe 一样）
   ═══════════════════════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
    .cloud-presets-modal {
        width: 100vw;
        height: 100vh;
        max-width: none;
        border-radius: 0;
        border: none;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   头部
   ═══════════════════════════════════════════════════════════════════════════ */
.cp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    flex-shrink: 0;
    background: #0d1117;
}

.cp-title {
    font-size: 16px;
    font-weight: 600;
    color: #e6edf3;
    display: flex;
    align-items: center;
    gap: 10px;
}

.cp-title i { color: #d4a574; }

.cp-close {
    width: 40px; 
    height: 40px;
    min-width: 40px;
    border: none;
    background: rgba(255,255,255,0.1);
    color: #e6edf3;
    cursor: pointer;
    border-radius: 8px;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    -webkit-tap-highlight-color: transparent;
}

.cp-close:hover,
.cp-close:active { 
    background: rgba(255,255,255,0.2); 
}

/* ═══════════════════════════════════════════════════════════════════════════
   搜索栏
   ═══════════════════════════════════════════════════════════════════════════ */
.cp-search {
    padding: 12px 20px;
    background: #161b22;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    flex-shrink: 0;
}

.cp-search-input {
    width: 100%;
    background: #0d1117;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 12px 16px;
    color: #e6edf3;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s;
}

.cp-search-input::placeholder { color: #484f58; }
.cp-search-input:focus { border-color: rgba(212,165,116,0.5); }

/* ═══════════════════════════════════════════════════════════════════════════
   内容区域 - 填满剩余空间
   ═══════════════════════════════════════════════════════════════════════════ */
.cp-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    -webkit-overflow-scrolling: touch;
    background: #0d1117;
}

/* ═══════════════════════════════════════════════════════════════════════════
   网格布局
   ═══════════════════════════════════════════════════════════════════════════ */
.cp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
}

@media (max-width: 500px) {
    .cp-grid {
        grid-template-columns: 1fr;
        gap: 12px;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   卡片样式
   ═══════════════════════════════════════════════════════════════════════════ */
.cp-card {
    background: #21262d;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: all 0.2s;
}

.cp-card:hover {
    border-color: rgba(212,165,116,0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.cp-card-head {
    display: flex;
    align-items: center;
    gap: 12px;
}

.cp-icon {
    width: 44px;
    height: 44px;
    background: rgba(212,165,116,0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
}

.cp-meta {
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.cp-name {
    font-weight: 600;
    font-size: 14px;
    color: #e6edf3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
}

.cp-author {
    font-size: 12px;
    color: #8b949e;
    display: flex;
    align-items: center;
    gap: 5px;
}

.cp-author i { font-size: 10px; opacity: 0.7; }

.cp-desc {
    font-size: 12px;
    color: #6e7681;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 36px;
}

.cp-btn {
    width: 100%;
    padding: 10px 14px;
    margin-top: auto;
    border: 1px solid rgba(212,165,116,0.4);
    background: rgba(212,165,116,0.12);
    color: #d4a574;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    -webkit-tap-highlight-color: transparent;
}

.cp-btn:hover {
    background: #d4a574;
    color: #0d1117;
    border-color: #d4a574;
}

.cp-btn:active {
    transform: scale(0.98);
}

.cp-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.cp-btn.success {
    background: #238636;
    border-color: #238636;
    color: #fff;
}

.cp-btn.error {
    background: #da3633;
    border-color: #da3633;
    color: #fff;
}

/* ═══════════════════════════════════════════════════════════════════════════
   分页控件
   ═══════════════════════════════════════════════════════════════════════════ */
.cp-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 16px 20px;
    border-top: 1px solid rgba(255,255,255,0.1);
    background: #161b22;
    flex-shrink: 0;
}

.cp-page-btn {
    padding: 10px 18px;
    min-height: 40px;
    background: #21262d;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: #e6edf3;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
    -webkit-tap-highlight-color: transparent;
}

.cp-page-btn:hover:not(:disabled) {
    background: #30363d;
    border-color: rgba(255,255,255,0.2);
}

.cp-page-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

.cp-page-info {
    font-size: 14px;
    color: #8b949e;
    min-width: 70px;
    text-align: center;
    font-variant-numeric: tabular-nums;
}

/* ═══════════════════════════════════════════════════════════════════════════
   状态提示
   ═══════════════════════════════════════════════════════════════════════════ */
.cp-loading, .cp-load-error, .cp-empty {
    text-align: center;
    padding: 60px 20px;
    color: #8b949e;
}

.cp-loading i {
    font-size: 36px;
    color: #d4a574;
    margin-bottom: 16px;
    display: block;
}

.cp-empty i {
    font-size: 48px;
    opacity: 0.4;
    margin-bottom: 16px;
    display: block;
}

.cp-empty p {
    font-size: 12px;
    margin-top: 8px;
    opacity: 0.6;
}

.cp-load-error, .cp-import-error {
    color: #f85149;
}

.cp-import-error {
    margin: 12px 20px 0;
    padding: 10px 12px;
    border: 1px solid rgba(248, 81, 73, 0.35);
    border-radius: 8px;
    background: rgba(248, 81, 73, 0.08);
}

/* ═══════════════════════════════════════════════════════════════════════════
   触摸优化
   ═══════════════════════════════════════════════════════════════════════════ */
@media (hover: none) and (pointer: coarse) {
    .cp-close { width: 44px; height: 44px; }
    .cp-search-input { min-height: 48px; padding: 14px 16px; }
    .cp-btn { min-height: 48px; padding: 12px 16px; }
    .cp-page-btn { min-height: 44px; padding: 12px 20px; }
}
`;
    document.head.appendChild(style);
}

// ═══════════════════════════════════════════════════════════════════════════
// UI 逻辑
// ═══════════════════════════════════════════════════════════════════════════

function createModal() {
    ensureStyles();
    
    const overlay = document.createElement('div');
    overlay.className = 'cloud-presets-overlay';
    
    // Template-only UI markup.
    // eslint-disable-next-line no-unsanitized/property
    overlay.innerHTML = `
        <div class="cloud-presets-modal">
            <div class="cp-header">
                <div class="cp-title">
                    <i class="fa-solid fa-cloud-arrow-down"></i>
                    云端绘图预设
                </div>
                <button class="cp-close" type="button">✕</button>
            </div>
            
            <div class="cp-search">
                <input type="text" class="cp-search-input" placeholder="🔍 搜索预设名称、作者或简介...">
            </div>

            <div class="cp-body">
                <div class="cp-loading">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <div>正在获取云端数据...</div>
                </div>
                <div class="cp-load-error" style="display:none"></div>
                <div class="cp-import-error" style="display:none"></div>
                <div class="cp-empty" style="display:none">
                    <i class="fa-solid fa-box-open"></i>
                    <div>没有找到相关预设</div>
                    <p>试试其他关键词？</p>
                </div>
                <div class="cp-grid" style="display:none"></div>
            </div>
            
            <div class="cp-pagination" style="display:none">
                <button class="cp-page-btn" id="cp-prev">
                    <i class="fa-solid fa-chevron-left"></i> 上一页
                </button>
                <span class="cp-page-info" id="cp-info">1 / 1</span>
                <button class="cp-page-btn" id="cp-next">
                    下一页 <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
    
    // 事件绑定
    overlay.querySelector('.cp-close').onclick = closeModal;
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
    overlay.querySelector('.cloud-presets-modal').onclick = (e) => e.stopPropagation();
    overlay.querySelector('.cp-search-input').oninput = (e) => handleSearch(e.target.value);
    overlay.querySelector('#cp-prev').onclick = () => changePage(-1);
    overlay.querySelector('#cp-next').onclick = () => changePage(1);
    
    return overlay;
}

function handleSearch(query) {
    const q = query.toLowerCase().trim();
    filteredPresets = allPresets.filter(p => 
        (p.name || '').toLowerCase().includes(q) || 
        (p.author || '').toLowerCase().includes(q) ||
        (p.简介 || p.description || '').toLowerCase().includes(q)
    );
    currentPage = 1;
    renderPage();
}

function changePage(delta) {
    const maxPage = Math.ceil(filteredPresets.length / ITEMS_PER_PAGE) || 1;
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= maxPage) {
        currentPage = newPage;
        renderPage();
    }
}

function renderPage() {
    const grid = modalElement.querySelector('.cp-grid');
    const pagination = modalElement.querySelector('.cp-pagination');
    const empty = modalElement.querySelector('.cp-empty');
    const loading = modalElement.querySelector('.cp-loading');
    const importError = modalElement.querySelector('.cp-import-error');
    
    loading.style.display = 'none';
    importError.style.display = 'none';
    
    if (filteredPresets.length === 0) {
        grid.style.display = 'none';
        pagination.style.display = 'none';
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    grid.style.display = 'grid';
    
    const maxPage = Math.ceil(filteredPresets.length / ITEMS_PER_PAGE);
    pagination.style.display = maxPage > 1 ? 'flex' : 'none';
    
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filteredPresets.slice(start, start + ITEMS_PER_PAGE);
    
    // Escaped fields are used in the template.
    // eslint-disable-next-line no-unsanitized/property
    grid.innerHTML = pageItems.map(p => `
        <div class="cp-card">
            <div class="cp-card-head">
                <div class="cp-icon">🎨</div>
                <div class="cp-meta">
                    <div class="cp-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name || '未命名')}</div>
                    <div class="cp-author"><i class="fa-solid fa-user"></i> ${escapeHtml(p.author || '匿名')}</div>
                </div>
            </div>
            <div class="cp-desc">${escapeHtml(p.简介 || p.description || '暂无简介')}</div>
            <button class="cp-btn" type="button" data-url="${escapeHtml(p.url)}">
                <i class="fa-solid fa-download"></i> 导入预设
            </button>
        </div>
    `).join('');
    
    // 绑定导入按钮
    grid.querySelectorAll('.cp-btn').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const url = btn.dataset.url;
            if (!url || btn.disabled) return;
            
            btn.disabled = true;
            const errorElement = modalElement.querySelector('.cp-import-error');
            errorElement.style.display = 'none';
            errorElement.textContent = '';
            const origHtml = btn.innerHTML;
            // Template-only UI markup.
            // eslint-disable-next-line no-unsanitized/property
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 导入中';
            
            try {
                const data = await downloadPreset(url);
                if (onImportCallback) await onImportCallback(data);
                btn.classList.add('success');
                // Template-only UI markup.
                // eslint-disable-next-line no-unsanitized/property
                btn.innerHTML = '<i class="fa-solid fa-check"></i> 成功';
                setTimeout(() => {
                    btn.classList.remove('success');
                    // Template-only UI markup.
                    // eslint-disable-next-line no-unsanitized/property
                    btn.innerHTML = origHtml;
                    btn.disabled = false;
                }, 2000);
            } catch (err) {
                console.error('[CloudPresets]', err);
                const message = String(err?.message || '未知错误');
                errorElement.textContent = `导入失败：${message}`;
                errorElement.style.display = 'block';
                btn.title = message;
                btn.classList.add('error');
                // Template-only UI markup.
                // eslint-disable-next-line no-unsanitized/property
                btn.innerHTML = '<i class="fa-solid fa-xmark"></i> 失败';
                setTimeout(() => {
                    btn.classList.remove('error');
                    // Template-only UI markup.
                    // eslint-disable-next-line no-unsanitized/property
                    btn.innerHTML = origHtml;
                    btn.disabled = false;
                }, 2000);
            }
        };
    });
    
    // 更新分页信息
    modalElement.querySelector('#cp-info').textContent = `${currentPage} / ${maxPage}`;
    modalElement.querySelector('#cp-prev').disabled = currentPage === 1;
    modalElement.querySelector('#cp-next').disabled = currentPage === maxPage;
}

// ═══════════════════════════════════════════════════════════════════════════
// 公开接口
// ═══════════════════════════════════════════════════════════════════════════

export async function openCloudPresetsModal(importCallback) {
    onImportCallback = importCallback;
    
    if (!modalElement) modalElement = createModal();
    document.body.appendChild(modalElement);
    
    // 重置状态
    currentPage = 1;
    allPresets = [];
    filteredPresets = [];
    modalElement.querySelector('.cp-loading').style.display = 'block';
    modalElement.querySelector('.cp-grid').style.display = 'none';
    modalElement.querySelector('.cp-pagination').style.display = 'none';
    modalElement.querySelector('.cp-empty').style.display = 'none';
    const loadError = modalElement.querySelector('.cp-load-error');
    const importError = modalElement.querySelector('.cp-import-error');
    const searchInput = modalElement.querySelector('.cp-search-input');
    loadError.style.display = 'none';
    loadError.textContent = '';
    importError.style.display = 'none';
    importError.textContent = '';
    searchInput.value = '';
    searchInput.disabled = true;
    
    try {
        allPresets = await fetchCloudPresets();
        filteredPresets = [...allPresets];
        searchInput.disabled = false;
        renderPage();
    } catch (e) {
        console.error('[CloudPresets]', e);
        modalElement.querySelector('.cp-loading').style.display = 'none';
        const errEl = modalElement.querySelector('.cp-load-error');
        errEl.style.display = 'block';
        errEl.textContent = '加载失败: ' + e.message;
    }
}

export function closeModal() {
    modalElement?.remove();
}

export function downloadPresetAsFile(preset) {
    const data = exportPreset(preset);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${preset.name || 'preset'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function destroyCloudPresets() {
    closeModal();
    modalElement = null;
    allPresets = [];
    filteredPresets = [];
    document.getElementById('cloud-presets-styles')?.remove();
}
