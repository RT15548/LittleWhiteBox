import { normalizeVibeEncodings as sanitizeSharedEncodings, clampVibeInfoExtracted as clampSharedInfoExtracted, clampVibeStrength as clampSharedStrength } from './vibe.js';
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

// ── 云端分享的 Vibe 内联（原图与各模型编码随文件走，换机免重花点数） ──
// 两种形态：
//   散装  vibe.references = [{ id, enabled, strength, item: single }]
//   组引用 vibe.group = { name, members: [{ enabled, strength, item: single }] }
// 导入方一律重新生成本地 id，single 合入自己的库，组则重建并让预设引用新组 id。
// Vibe 编码按「模型@信息提取值」组合键分别缓存（量化两位小数）。
// 单个内联项 → 本地 single（重新生成 id）；无原图且无任何编码时返回 null
function importInlineSingle(srcItem, generateVibeId) {
    if (!srcItem || typeof srcItem !== 'object' || Array.isArray(srcItem)) return null;
    const image = String(srcItem.image || '');
    const encodings = sanitizeSharedEncodings(srcItem.encodings, srcItem.infoExtracted);
    if (!image && Object.keys(encodings).length === 0) return null;
    return {
        single: {
            id: generateVibeId(),
            name: String(srcItem.name || '').slice(0, 60),
            image,
            thumbnail: String(srcItem.thumbnail || ''),
            infoExtracted: clampSharedInfoExtracted(srcItem.infoExtracted),
            encodings,
        },
    };
}

// 散装引用解析：同一分享内重复内联同一项只入库一次
function normalizeSharedVibeReferences(raw, generateVibeId) {
    const rawRefs = raw && typeof raw === 'object' && Array.isArray(raw.references) ? raw.references : [];
    const selections = [];
    const vibeImports = [];
    const seenShareIds = new Set();

    for (const entry of rawRefs) {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
        const srcItem = entry.item;
        const shareId = String(entry.id || srcItem?.id || '');
        if (shareId) {
            if (seenShareIds.has(shareId)) continue;
            seenShareIds.add(shareId);
        }
        const imported = importInlineSingle(srcItem, generateVibeId);
        if (!imported) continue;
        vibeImports.push(imported.single);
        selections.push({
            id: imported.single.id,
            enabled: entry.enabled !== false,
            strength: clampSharedStrength(entry.strength),
        });
    }

    return { selections, vibeImports };
}

// 组引用解析：成员 single 全部入库，并在本地重建同名组（组 id 也是新的）
function normalizeVibeGroup(rawGroup, generateVibeId) {
    const src = rawGroup && typeof rawGroup === 'object' && !Array.isArray(rawGroup) ? rawGroup : {};
    const rawMembers = Array.isArray(src.members) ? src.members : [];
    const vibeImports = [];
    const members = [];
    const seenShareIds = new Set();

    for (const entry of rawMembers) {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
        const srcItem = entry.item;
        const shareId = String(entry.id || srcItem?.id || '');
        if (shareId) {
            if (seenShareIds.has(shareId)) continue;
            seenShareIds.add(shareId);
        }
        const imported = importInlineSingle(srcItem, generateVibeId);
        if (!imported) continue;
        vibeImports.push(imported.single);
        members.push({
            id: imported.single.id,
            enabled: entry.enabled !== false,
            strength: clampSharedStrength(entry.strength),
        });
    }

    if (!members.length) return { vibeGroup: null, vibeImports };
    return {
        vibeGroup: {
            id: String(generateVibeId()).replace(/^vibe-/, 'vibegroup-'),
            name: String(src.name || '').slice(0, 60) || '导入的 Vibe 组',
            members,
        },
        vibeImports,
    };
}

// 导出散装模式：把预设勾选项对应的库内 single 内联（库中已删除 / 无原图跳过）
function collectVibeReferences(preset, vibeLibrary) {
    const selections = Array.isArray(preset?.vibe?.selections) ? preset.vibe.selections : [];
    const singles = vibeLibrary && Array.isArray(vibeLibrary.singles) ? vibeLibrary.singles : [];
    if (!selections.length || !singles.length) return [];

    const references = [];
    const seen = new Set();
    for (const sel of selections) {
        if (!sel || !sel.id || seen.has(sel.id)) continue;
        const item = singles.find(s => s.id === sel.id);
        if (!item || (!item.image && !Object.keys(item.encodings || {}).length)) continue;
        seen.add(sel.id);
        references.push({
            id: item.id,
            enabled: sel.enabled !== false,
            strength: clampSharedStrength(sel.strength),
            item: buildSharedSingle(item),
        });
    }
    return references;
}

// 分享的是预设当前选择，而不是来源组的旧快照。
export function collectPresetVibeExport(preset, vibeLibrary) {
    const references = collectVibeReferences(preset, vibeLibrary);
    return references.length ? { references } : null;
}

// collectPresetVibeExport 的逆向：把 vibe 片段解析成入库所需三件套
export function parsePresetVibeFragment(rawVibe, generateVibeId) {
    const emptyVibe = { groupId: '', selections: [] };
    if (!rawVibe || typeof rawVibe !== 'object') {
        return { vibe: emptyVibe, vibeImports: [], vibeGroup: null };
    }
    if (rawVibe.group && typeof rawVibe.group === 'object') {
        const result = normalizeVibeGroup(rawVibe.group, generateVibeId);
        return {
            vibe: result.vibeGroup
                ? { groupId: result.vibeGroup.id, selections: result.vibeGroup.members.map(m => ({ ...m })) }
                : emptyVibe,
            vibeImports: result.vibeImports,
            vibeGroup: result.vibeGroup,
        };
    }
    const result = normalizeSharedVibeReferences(rawVibe, generateVibeId);
    return { vibe: { groupId: '', selections: result.selections }, vibeImports: result.vibeImports, vibeGroup: null };
}

function buildSharedSingle(item) {
    return {
        id: item.id,
        name: String(item.name || '').slice(0, 60),
        image: item.image,
        thumbnail: String(item.thumbnail || ''),
        infoExtracted: clampSharedInfoExtracted(item.infoExtracted),
        encodings: sanitizeSharedEncodings(item.encodings, item.infoExtracted),
    };
}

export function parsePresetData(data, generateId, generateVibeId = generateId) {
    const version = requirePresetEnvelope(data);
    if (typeof generateId !== 'function') throw new TypeError('generateId must be a function');
    if (typeof generateVibeId !== 'function') throw new TypeError('generateVibeId must be a function');
    const warnings = [];
    const importedParams = normalizeImportedParams(data.preset.params, version, warnings);

    // Vibe：v1 旧分享没有该字段。v2 组模式内联 vibe.group，散装模式内联 vibe.references
    let vibeImports = [];
    let vibeGroup = null;
    let selections = [];
    if (version !== 1) {
        const rawVibe = data.preset.vibe;
        if (rawVibe && typeof rawVibe === 'object' && rawVibe.group && typeof rawVibe.group === 'object') {
            const groupResult = normalizeVibeGroup(rawVibe.group, generateVibeId);
            vibeGroup = groupResult.vibeGroup;
            vibeImports = groupResult.vibeImports;
        } else {
            const refsResult = normalizeSharedVibeReferences(rawVibe, generateVibeId);
            selections = refsResult.selections;
            vibeImports = refsResult.vibeImports;
        }
    }

    return {
        preset: {
            id: generateId(),
            name: String(data.name || data.preset.name || '云端预设'),
            positivePrefix: String(data.preset.positivePrefix || ''),
            negativePrefix: String(data.preset.negativePrefix || ''),
            // 还原分享时附带的缩略图（旧版本/无图时为空字符串）
            thumbnail: typeof data.preset.thumbnail === 'string' ? data.preset.thumbnail : '',
            // 组模式只存新组 id（组对象在 vibeGroup 里待父层入库）；散装存勾选快照
            vibe: vibeGroup
                ? { groupId: vibeGroup.id, selections: vibeGroup.members.map(m => ({ ...m })) }
                : { groupId: '', selections },
            maxImages: version === 1 ? 0 : Math.max(0, Number(data.preset.maxImages) || 0),
            maxCharactersPerImage: version === 1
                ? 0
                : Math.max(0, Number(data.preset.maxCharactersPerImage) || 0),
            overrideSize: data.preset.overrideSize === 'auto' ? 'auto' : 'default',
            params: importedParams,
        },
        warnings,
        vibeImports,
        vibeGroup,
    };
}

// ── 智绘姬互通文件导入 ──
// 智绘姬导出的预设文件结构：{ presets: { 名字: { fixedPrompt, fixedPrompt_end, negativePrompt,
// previewImageId? } }, images?: { id: dataURL } }。除 presets 外皆为可选扩展段：
// 顶层 vibes（本扩展导出时写入的 Vibe 单项/组）与 params（按预设名存的生图参数）存在则恢复，
// 智绘姬原生文件没有这两段，自然落默认；预览图一律不还原，仅计数提示。
export function parseChatu8PresetFile(data, generateId) {
    if (typeof generateId !== 'function') throw new TypeError('generateId must be a function');
    if (!data || typeof data !== 'object' || Array.isArray(data)
        || !data.presets || typeof data.presets !== 'object' || Array.isArray(data.presets)) {
        throw new Error('不是有效的智绘姬互通格式');
    }
    const entries = Object.entries(data.presets)
        .filter(([, value]) => value && typeof value === 'object' && !Array.isArray(value));
    if (!entries.length) throw new Error('文件中没有找到可导入的预设');

    // 顶层 vibes 段：校验结构并清洗（编码键/强度/信息提取值），供宿主入库后重映射 id
    const rawVibes = data.vibes && typeof data.vibes === 'object' && !Array.isArray(data.vibes) ? data.vibes : null;
    const vibeSingles = [];
    const singleIdSet = new Set();
    for (const raw of rawVibes && Array.isArray(rawVibes.singles) ? rawVibes.singles : []) {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.id == null) continue;
        const image = typeof raw.image === 'string' ? raw.image : '';
        const encodings = sanitizeSharedEncodings(raw.encodings, raw.infoExtracted);
        if (!image && !Object.keys(encodings).length) continue;
        const id = String(raw.id);
        singleIdSet.add(id);
        vibeSingles.push({
            id, name: String(raw.name || '').slice(0, 60), image,
            thumbnail: typeof raw.thumbnail === 'string' ? raw.thumbnail : '',
            infoExtracted: clampSharedInfoExtracted(raw.infoExtracted), encodings,
        });
    }
    const vibeGroups = [];
    const groupIdSet = new Set();
    for (const raw of rawVibes && Array.isArray(rawVibes.groups) ? rawVibes.groups : []) {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.id == null) continue;
        const members = (Array.isArray(raw.members) ? raw.members : [])
            .filter(m => m && typeof m === 'object' && m.id != null && singleIdSet.has(String(m.id)))
            .map(m => ({ id: String(m.id), enabled: m.enabled !== false, strength: clampSharedStrength(m.strength) }));
        if (!members.length) continue;
        const id = String(raw.id);
        groupIdSet.add(id);
        vibeGroups.push({ id, name: String(raw.name || '').slice(0, 60), members });
    }

    // 顶层 params 段：按预设名恢复生图参数（缺失则全默认）
    const rawParams = data.params && typeof data.params === 'object' && !Array.isArray(data.params) ? data.params : null;

    const presets = [];
    const warnings = [];
    let skippedPreviews = 0;
    let skippedVibes = 0;
    for (const [name, item] of entries) {
        // fixedPrompt_end 是智绘姬的后置正向（质量词位），与前置拼成完整固定正向
        const positivePrefix = [item.fixedPrompt, item.fixedPrompt_end]
            .map(v => (typeof v === 'string' ? v.trim() : ''))
            .filter(Boolean)
            .join(', ');
        if (item.previewImageId || (typeof item.thumbnail === 'string' && item.thumbnail)) skippedPreviews++;
        // vibe 引用：仅在顶层 vibes 段可解析时保留（id 待宿主入库后重映射）；
        // 引用了但段里找不到的计为跳过
        let vibe = { groupId: '', selections: [] };
        const rv = item.vibe;
        if (rv && typeof rv === 'object' && !Array.isArray(rv)) {
            const groupId = rv.groupId != null && groupIdSet.has(String(rv.groupId)) ? String(rv.groupId) : '';
            const selections = (Array.isArray(rv.selections) ? rv.selections : [])
                .filter(sel => sel && sel.id != null && singleIdSet.has(String(sel.id)))
                .map(sel => ({ id: String(sel.id), enabled: sel.enabled !== false, strength: clampSharedStrength(sel.strength) }));
            if (groupId || selections.length) {
                vibe = { groupId, selections };
            } else if (rv.groupId != null && rv.groupId !== ''
                || (Array.isArray(rv.selections) && rv.selections.length)) {
                skippedVibes++;
            }
        }
        presets.push({
            id: generateId(),
            name: String(name || '导入预设'),
            positivePrefix,
            negativePrefix: typeof item.negativePrompt === 'string' ? item.negativePrompt : '',
            thumbnail: '',
            vibe,
            maxImages: 0,
            maxCharactersPerImage: 0,
            overrideSize: 'default',
            params: rawParams && rawParams[name] && typeof rawParams[name] === 'object'
                ? normalizeImportedParams(rawParams[name], CURRENT_PRESET_VERSION, warnings)
                : { ...DEFAULT_PARAMS },
        });
    }
    return { presets, vibeSingles, vibeGroups, skippedPreviews, skippedVibes, warnings };
}

// ── 智绘姬互通文件导出（批量）──
// 结构对齐智绘姬原生导出：图片集中放顶层 images（dataURL），预设用 previewImageId 引用；
// 被引用到的 Vibe 单项/组放顶层 vibes 段（智绘姬会忽略未知字段，回导时可恢复）。
// 同名预设以名称为键，后者覆盖前者（与智绘姬语义一致）。
export function buildChatu8PresetFile(paramsPresets, vibeLibrary = null) {
    const file = { presets: {}, images: {} };
    const singles = vibeLibrary && Array.isArray(vibeLibrary.singles) ? vibeLibrary.singles : [];
    const groups = vibeLibrary && Array.isArray(vibeLibrary.groups) ? vibeLibrary.groups : [];
    const singlesById = new Map(singles.map(item => [item.id, item]));
    const groupsById = new Map(groups.map(group => [group.id, group]));
    const neededSingleIds = new Set();
    const neededGroupIds = new Set();
    for (const p of Array.isArray(paramsPresets) ? paramsPresets : []) {
        if (p?.vibe?.groupId && groupsById.has(p.vibe.groupId)) {
            neededGroupIds.add(p.vibe.groupId);
            groupsById.get(p.vibe.groupId).members?.forEach(m => neededSingleIds.add(m.id));
        }
        p?.vibe?.selections?.forEach(sel => { if (sel && singlesById.has(sel.id)) neededSingleIds.add(sel.id); });
    }

    (Array.isArray(paramsPresets) ? paramsPresets : []).forEach((p, i) => {
        const entry = {
            fixedPrompt: p.positivePrefix || '',
            fixedPrompt_end: '',
            negativePrompt: p.negativePrefix || '',
        };
        // 缩略图只存一份（images 段引用），不内嵌，避免文件体积翻倍
        if (typeof p.thumbnail === 'string' && p.thumbnail) {
            const imageId = `preset-thumb-${i + 1}`;
            file.images[imageId] = p.thumbnail;
            entry.previewImageId = imageId;
        }
        if (p.vibe && (neededGroupIds.has(p.vibe.groupId) || p.vibe.selections?.length)) {
            entry.vibe = {
                groupId: neededGroupIds.has(p.vibe.groupId) ? p.vibe.groupId : '',
                selections: (p.vibe.selections || [])
                    .filter(sel => sel && neededSingleIds.has(sel.id))
                    .map(sel => ({ id: sel.id, enabled: sel.enabled !== false, strength: clampSharedStrength(sel.strength) })),
            };
            if (!entry.vibe.groupId && !entry.vibe.selections.length) delete entry.vibe;
        }
        file.presets[p.name || '未命名'] = entry;
        // 顶层 params 段：按预设名存生图参数（智绘姬忽略未知字段；回导时按名恢复）
        if (p.params && typeof p.params === 'object' && !Array.isArray(p.params)) {
            (file.params ||= {})[p.name || '未命名'] = p.params;
        }
    });

    if (neededSingleIds.size || neededGroupIds.size) {
        file.vibes = {
            singles: [...neededSingleIds].map(id => singlesById.get(id)).filter(Boolean).map(item => ({
                id: item.id, name: item.name || '', image: item.image || '',
                thumbnail: item.thumbnail || '', infoExtracted: clampSharedInfoExtracted(item.infoExtracted),
                encodings: item.encodings || {},
            })),
            groups: [...neededGroupIds].map(id => groupsById.get(id)).filter(Boolean).map(group => ({
                id: group.id, name: group.name || '',
                members: (group.members || []).map(m => ({ id: m.id, enabled: m.enabled !== false, strength: clampSharedStrength(m.strength) })),
            })),
        };
    }
    // 没有任何缩略图时不输出空 images，保持与智绘姬导出文件结构一致
    if (!Object.keys(file.images).length) delete file.images;
    return file;
}


export function exportPreset(preset, vibeLibrary = null, { interactive = true } = {}) {
    // 云端分享才需要询问作者名/简介；本地完整备份直接跳过 prompt
    const author = interactive ? (prompt("请输入你的作者名:", "") || "") : "";
    const description = interactive ? (prompt("简介 (画风介绍):", "") || "") : "";
    // 导出预设当前选择及所需编码，不把来源组的旧配置覆盖回来。
    const vibe = collectPresetVibeExport(preset, vibeLibrary);
    
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
            // 缩略图（dataURL）随云端预设一起分享；无图则省略
            ...(preset.thumbnail ? { thumbnail: preset.thumbnail } : {}),
            ...(vibe ? { vibe } : {}),
            overrideSize: preset.overrideSize === 'auto' ? 'auto' : 'default',
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
    
    // eslint-disable-next-line no-unsanitized/property -- Escaped fields are used in the template.
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
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 导入中';
            
            try {
                const data = await downloadPreset(url);
                if (onImportCallback) await onImportCallback(data);
                btn.classList.add('success');
                // Template-only UI markup.
                btn.innerHTML = '<i class="fa-solid fa-check"></i> 成功';
                setTimeout(() => {
                    btn.classList.remove('success');
                    // eslint-disable-next-line no-unsanitized/property -- Template-only UI markup.
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
                btn.innerHTML = '<i class="fa-solid fa-xmark"></i> 失败';
                setTimeout(() => {
                    btn.classList.remove('error');
                    // eslint-disable-next-line no-unsanitized/property -- Template-only UI markup.
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
    // 导出时把全局 Vibe 库一起传入：被勾选的 single（或整组）内联进分享文件
    const data = exportPreset(preset, getVibeLibrary());
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

// 批量导出全部参数预设为智绘姬互通文件（缩略图进 images 段，被引用 Vibe 进 vibes 段）
export function downloadChatu8PresetsFile(paramsPresets) {
    const data = buildChatu8PresetFile(paramsPresets, getVibeLibrary());
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nai-presets-chatu8.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 从宿主注入的回调（避免 cloud-presets 直接依赖 settings 存储）
let vibeLibraryProvider = null;
export function setVibeLibraryProvider(fn) {
    vibeLibraryProvider = typeof fn === 'function' ? fn : null;
}
function getVibeLibrary() {
    try {
        return vibeLibraryProvider?.() ?? null;
    } catch {
        return null;
    }
}

export function destroyCloudPresets() {
    closeModal();
    modalElement = null;
    allPresets = [];
    filteredPresets = [];
    document.getElementById('cloud-presets-styles')?.remove();
}
