import { DOMPurify } from '../../../../../../../../lib.js';
import { normalizeMediaUrl } from '../../shared/media-url.js';
import { mountServerPluginGuide } from '../../../../shared/server-plugin/installation-guide.js';
import { NOVEL_API_DEFAULTS, NOVEL_API_FIELDS, normalizeNovelApiConfig } from './novel-api-config.js';
import { API_PRESET_COPY } from '../../shared/api-presets-copy.js';
// ═══════════════════════════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULTS = {
    ...NOVEL_API_DEFAULTS,
    cacheDays: 3,
    params: {
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
        decrisper: false
    }
};

const CHARACTER_TYPES = [
    { value: 'girl', label: 'girl (少女)' },
    { value: 'woman', label: 'woman (成年女性)' },
    { value: 'boy', label: 'boy (少年)' },
    { value: 'man', label: 'man (成年男性)' },
    { value: 'other', label: 'other (其他)' },
    { value: 'no_humans', label: 'no_humans (非人主体)' },
    { value: 'custom', label: '自定义...' }
];

// ═══════════════════════════════════════════════════════════════════════════
// 状态
// ═══════════════════════════════════════════════════════════════════════════

let state = {
    enabled: false,
    mode: 'manual',
    ...normalizeNovelApiConfig(),
    apiPresets: [],
    activeApiPresetId: null,
    cacheDays: DEFAULTS.cacheDays,
    cacheStats: { count: 0, sizeMB: '0' },
    selectedParamsPresetId: null,
    paramsPresets: [],
    characterTags: [],
    characterGroups: [],
    plannerMaxRetries: 3,
    autoLearnCharacters: false,
    autoLearnMode: 'new_only',
    autoLearnGroupId: '',
    danbooruLocalDB: false,
    showFloorButton: true,
    showFloatingButton: false,
    promptPresets: [],
    selectedPromptPresetId: null,
    modelGuideDefaults: {},
    modelCapabilities: {},
    backendPluginStatus: null,
    messageFilterRules: [],
    // 分组预设：预设与应用记录来自宿主 INIT_DATA（真实数据）；activeAvatars / hostCharacters 之后由 GROUP_PRESET_CONTEXT 刷新。
    characterGroupPresets: [],
    characterGroupPresetApplied: null,
    hostCharacters: null,
    activeAvatars: [],
};

let gallerySummary = {};
// 每个角色已加载的图组与分页状态，结构见“分批加载”一节。
let backendCopy;
let loadedCharPreviews = {};
// 图片管理分批加载：每批图组数、请求丢失的判定时间；每个角色同一时间只有一个在途的页请求。
const GALLERY_PAGE_SIZE = 24;
const GALLERY_REQUEST_TIMEOUT_MS = 15000;
const GALLERY_LOAD_COPY = Object.freeze({
    versionsLoading: '正在加载其他版本…',
    versionsFailed: '其他版本加载失败',
    pageFailed: '图组加载失败',
    retry: '重试',
});
const galleryPageRequests = new Map(); // charName -> { requestId, offset, limit, reload, timer }
let galleryRequestSeq = 0;
const galleryVersionRequests = new Map(); // `${charName}\n${slotId}` -> { requestId, timer }
const gallerySentinelObservers = new Map(); // charName -> { observer, sentinel }
// 图片管理里用户展开过的角色：头部点击时维护，重绘据此恢复。不从 DOM 反推——收到一次空摘要把列表画空之后，
// DOM 里就没有展开状态了，后到的真实摘要只能画出全折叠的列表。
const expandedGalleryChars = new Set();
let editingCharId = null;
// 正在编辑的卡片的表单内容快照：任何会重绘列表的操作（库操作、INIT_DATA 回包）前读回，重绘后恢复，
// 避免丢掉尚未点“保存”的输入。
let editingDraft = null;
// 点“添加角色”得到、尚未点“保存”的空白草稿（id → 角色对象）：只存在于本页，不写入持久化，
// 也不参与撤销快照 / 指纹 / 导出，直到用户保存。
const draftCharacters = new Map();
const saveBtnStates = new WeakMap();
const promptTextDraftsByPreset = new Map();
const modelGuideDraftsByPreset = new Map();
let promptChainRequestId = 0;
let charFilters = { query: '', type: 'all', status: 'all' };
let modalData = { slotId: null, images: [], currentIndex: 0, charName: null };

// ═══════════════════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════════════════

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const PARENT_ORIGIN = (() => {
    try { return new URL(document.referrer).origin; } catch { return window.location.origin; }
})();
function postToParent(payload) {
    window.parent.postMessage({ source: 'NovelDraw-Frame', ...payload }, PARENT_ORIGIN);
}

function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const previewObjectUrls = new Map();
// Preserve object-URL image previews as well as DOMPurify's standard safe URL schemes.
const GALLERY_HTML_SANITIZE_OPTIONS = {
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix|blob):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
};

function parsePreviewBase64(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;
    const match = raw.match(/^data:([^;]+);base64,(.*)$/i);
    return {
        mime: match?.[1] || 'image/png',
        data: match ? match[2] : raw,
    };
}

function base64ToObjectUrl(base64, mime) {
    const binary = atob(base64);
    const chunkSize = 8192;
    const chunks = [];
    for (let offset = 0; offset < binary.length; offset += chunkSize) {
        const slice = binary.slice(offset, offset + chunkSize);
        const bytes = new Uint8Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            bytes[i] = slice.charCodeAt(i);
        }
        chunks.push(bytes);
    }
    return URL.createObjectURL(new Blob(chunks, { type: mime }));
}

function getGalleryImageUrl(image = {}) {
    const savedUrl = normalizeMediaUrl(image.savedUrl);
    if (savedUrl) return savedUrl;
    const knownKey = String(image.imgId || '').trim();
    if (knownKey && previewObjectUrls.has(knownKey)) return previewObjectUrls.get(knownKey);
    const parsed = parsePreviewBase64(image.base64);
    if (!parsed?.data) return '';
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function' || typeof atob !== 'function') {
        return `data:${parsed.mime};base64,${parsed.data}`;
    }
    const key = String(image.imgId || '').trim() || `inline-${parsed.data.slice(0, 80)}`;
    const cached = previewObjectUrls.get(key);
    if (cached) return cached;
    try {
        const url = base64ToObjectUrl(parsed.data, parsed.mime);
        previewObjectUrls.set(key, url);
        // blob 已持有图片数据：页面里不必再留一份 base64（随着往下加载会越积越多）。blob URL 在图组被替换 / 删除时由 pruneGalleryObjectUrls 释放。
        if (knownKey) image.base64 = null;
        return url;
    } catch {
        return `data:${parsed.mime};base64,${parsed.data}`;
    }
}

function getCharEmoji(name) {
    const emojis = ['👤','👩','👨','🧑','👧','👦','👸','🤴','🧙','🧝','🧛','🦸'];
    return emojis[String(name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % emojis.length];
}

function parseDelay(str) {
    const parts = String(str).split('-').map(s => parseInt(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return { min: Math.min(parts[0], parts[1]), max: Math.max(parts[0], parts[1]) };
    }
    const single = parseInt(str);
    if (!isNaN(single) && single > 0) return { min: single, max: single };
    return { ...DEFAULTS.requestDelay };
}

function shuffleCredits() {
    const authors = ['𝓡𝓸𝓻𝓸𝓵𝓵𝓵𝓷', '阡濯', '小白狐'];
    const shuffled = authors.sort(() => Math.random() - 0.5);
    const el = document.getElementById('nd_credits');
    if (el) {
        el.innerHTML = DOMPurify.sanitize(shuffled
            .map(name => `· <span class="credit-author">${name}</span>`)
            .join(' '));
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// UI 更新
// ═══════════════════════════════════════════════════════════════════════════

function switchView(viewId) {
    $$('.view').forEach(v => v.classList.remove('active'));
    $$('.nav-item, .mobile-nav-item').forEach(n => n.classList.remove('active'));
    $(`view-${viewId}`)?.classList.add('active');
    $$(`[data-view="${viewId}"]`).forEach(n => n.classList.add('active'));
    // 隐藏期间重绘的分组滚动区没法写入滚动位置：回到本视图、能显示了再补上。
    if (viewId === 'characters') {
        const charList = $('nd_char_list');
        if (charList) restoreGroupScroll(charList);
    }
    if (viewId === 'gallery') postToParent({ type: 'REFRESH_CACHE_STATS' });
    if (viewId === 'llm') {
        postToParent({ type: 'ENSURE_AGENT_SETTINGS' });
    }
    if (viewId === 'prompts') {
        requestPromptChainPreview();
        postToParent({ type: 'GET_LAST_LLM_REQUEST' });
    }
}

function requestPromptChainPreview() {
    const model = $('nd_model_sel')?.value === 'custom' ? $('nd_model')?.value : $('nd_model_sel')?.value;
    const requestId = ++promptChainRequestId;
    postToParent({
        type: 'GET_PROMPT_CHAIN',
        requestId,
        model: model || '',
        promptDraft: {
            topSystem: $('nd_prompt_system')?.value || '',
            sceneRules: $('nd_prompt_format')?.value || '',
            modelGuideOverrides: collectModelGuideOverridesFromForm(),
        },
    });
}

function updateModeButtons(mode) {
    $$('.header-mode button').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
}

function updateSendModeUI(mode) {
    const m = mode === 'backend' ? 'backend' : 'frontend';
    const group = $('nd_send_mode_group');
    if (group) {
        group.querySelectorAll('.nd-mode-btn').forEach(btn => {
            btn.classList.toggle('mode-active', btn.dataset.sendMode === m);
        });
    }
    state.sendMode = m;
    const usesBackend = m === 'backend';
    $('nd_backend_options')?.classList.toggle('hidden', !usesBackend);
    const panel = $('nd_backend_panel');
    if (panel) {
        panel.classList.toggle('hidden', !usesBackend);
        if (usesBackend) requestBackendPluginCheck();
    }
}

function requestBackendPluginCheck() {
    setBackendStatusUI('checking', backendCopy.checking);
    postToParent({ type: 'CHECK_BACKEND_PLUGIN' });
}

function setBackendStatusUI(state, text) {
    const dot = $('nd_backend_dot');
    const txt = $('nd_backend_status_text');
    if (dot) dot.className = 'nd-status-dot ' + (state === 'ok' ? 'ok' : state === 'bad' ? 'bad' : 'checking');
    if (txt) txt.textContent = text || '';
}

function isVersionAtLeast(version, minimum) {
    const current = String(version || '').split('.').map(part => Number.parseInt(part, 10) || 0);
    const required = String(minimum || '').split('.').map(part => Number.parseInt(part, 10) || 0);
    for (let index = 0; index < Math.max(current.length, required.length); index++) {
        if ((current[index] || 0) !== (required[index] || 0)) return (current[index] || 0) > (required[index] || 0);
    }
    return true;
}

function renderBackendPluginStatus() {
    const st = state.backendPluginStatus;
    if (!st) return;
    const copy = state.backendPluginCopy;
    if (!st.ready) {
        const reasonText = st.reason === 'outdated'
            ? copy.outdated
            : st.reason === 'unreachable'
                ? copy.unreachable
                : st.reason === 'not_installed'
                    ? copy.notInstalled
                    : copy.unavailable;
        setBackendStatusUI('bad', reasonText);
        return;
    }
    const model = $('nd_model_sel')?.value === 'custom' ? $('nd_model')?.value : $('nd_model_sel')?.value;
    const isV5 = getModelCapability(model).family === 'v5';
    const capabilities = Array.isArray(st.capabilities) ? st.capabilities : [];
    const usesBackgroundJobs = getSendMode() === 'backend' && $('nd_use_backend_jobs')?.checked === true;
    const supportsBackgroundJobs = isVersionAtLeast(st.version, st.minimumVersion)
        && capabilities.includes('image-batch-jobs-v1')
        && capabilities.includes('draw-runs-v1')
        && capabilities.includes('draw-run-runtime-v4')
        && (!isV5 || capabilities.includes('novelai-v5-final-image-v1'));
    if (usesBackgroundJobs && !supportsBackgroundJobs) {
        setBackendStatusUI('bad', copy.backgroundUnsupported);
        return;
    }
    const supportsV5 = isVersionAtLeast(st.version, st.minimumVersion)
        && capabilities.includes('v5-msgpack-stream');
    if (isV5 && !supportsV5) {
        setBackendStatusUI('bad', copy.v5Unsupported);
        return;
    }
    setBackendStatusUI('ok', copy.ready);
}

function getSendMode() {
    const active = $('nd_send_mode_group')?.querySelector('.nd-mode-btn.mode-active');
    return active?.dataset?.sendMode === 'backend' ? 'backend' : 'frontend';
}

function getModelCapability(model) {
    return state.modelCapabilities?.[String(model || '').trim()] || {
        family: 'legacy',
        promptGuide: 'v4.5',
        maxCharactersPerImage: 10,
        supportsV5Presets: false,
        supportsTransparentBackground: false,
    };
}

function updateBadge(enabled) {
    const b = $('nd_badge');
    b.className = 'header-badge' + (enabled ? ' on' : '');
    b.querySelector('span').textContent = enabled ? '已启用' : '未启用';
}

function updateStatus(el, st, text) {
    if (!el) return;
    el.textContent = text || '';
    el.className = 'status-text' + (st ? ' ' + st : '');
}

function setSavingState(btn) {
    if (!btn) return;
    saveBtnStates.set(btn, true);
    const i = btn.querySelector('i');
    if (i) { btn._origIcon = i.className; i.className = 'fa-solid fa-spinner fa-spin'; }
    btn.classList.add('saving');
}

function handleSaveResult(success, targetBtn) {
    const btn = targetBtn || Array.from(document.querySelectorAll('.saving')).find(b => saveBtnStates.has(b));
    if (!btn) return;
    saveBtnStates.delete(btn);
    btn.classList.remove('saving');
    const i = btn.querySelector('i');

    if (success && i) {
        i.className = 'fa-solid fa-check';
        btn.classList.add('save-success');
        setTimeout(() => {
            btn.classList.remove('save-success');
            i.className = btn._origIcon || 'fa-solid fa-floppy-disk';
        }, 1500);
    } else if (i) {
        i.className = 'fa-solid fa-xmark';
        btn.classList.add('save-failed');
        setTimeout(() => {
            btn.classList.remove('save-failed');
            i.className = btn._origIcon || 'fa-solid fa-floppy-disk';
        }, 2000);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 消息过滤规则
// ═══════════════════════════════════════════════════════════════════════════

const ND_DEFAULT_FILTER_RULES = [
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

function renderFilterRuleRow(rule, container) {
    const row = document.createElement('div');
    row.className = 'filter-rule-row';
    row.innerHTML = DOMPurify.sanitize(`<input type="text" class="fr-start" placeholder="起始（可空）" value="${escapeHtml(rule.start || '')}">` +
        `<span class="rule-arrow">→</span>` +
        `<input type="text" class="fr-end" placeholder="结束（可空）" value="${escapeHtml(rule.end || '')}">` +
        `<button class="btn-del-rule" title="删除">✕</button>`);
    row.querySelector('.btn-del-rule').onclick = () => row.remove();
    container.appendChild(row);
}

function renderFilterRules(rules) {
    const list = $('nd_filter_rules_list');
    if (!list) return;
    list.innerHTML = '';
    const arr = (Array.isArray(rules) && rules.length) ? rules : ND_DEFAULT_FILTER_RULES;
    arr.forEach(r => renderFilterRuleRow(r, list));
}

function collectFilterRules() {
    const rows = $$('#nd_filter_rules_list .filter-rule-row');
    const rules = [];
    rows.forEach(row => {
        const start = row.querySelector('.fr-start')?.value || '';
        const end = row.querySelector('.fr-end')?.value || '';
        if (start || end) rules.push({ start, end });
    });
    return rules;
}

// ═══════════════════════════════════════════════════════════════════════════
// 角色列表
// ═══════════════════════════════════════════════════════════════════════════

function normalizeCharType(type) {
    const knownTypes = new Set(CHARACTER_TYPES.filter(t => t.value !== 'custom').map(t => t.value));
    return knownTypes.has(type) ? type : 'custom';
}

// 有效启用 = 所在分组是开的 且 角色自己 enabled !== false（模块未加载时只看角色自己）。
function isCharacterEffectivelyEnabled(char, library = getCharacterLibrary()) {
    return CL ? CL.isCharacterEffectivelyEnabled(library, char) : char.enabled !== false;
}

// 角色所在分组是否关闭（未分组、分组不存在都算开）。
function isCharacterGroupClosed(char, library = getCharacterLibrary()) {
    return CL ? !CL.isGroupEnabled(library, char.groupId || '') : false;
}

function getFilteredCharacters(chars = []) {
    const query = String(charFilters.query || '').trim().toLowerCase();
    const typeFilter = charFilters.type || 'all';
    const statusFilter = charFilters.status || 'all';
    const library = getCharacterLibrary();

    return chars.filter(char => {
        if (query) {
            const haystack = [
                char.name,
                ...(char.aliases || []),
                char.type,
                char.appearance,
                char.negativeTags,
                char.danbooruTag,
                ...((char.outfits || []).flatMap(outfit => [outfit?.name, outfit?.tags])),
                ...((char.dynamicStates || []).flatMap(item => [item?.name, item?.tags])),
            ].filter(Boolean).join(' ').toLowerCase();

            if (!haystack.includes(query)) return false;
        }

        if (typeFilter !== 'all' && normalizeCharType(char.type || 'girl') !== typeFilter) {
            return false;
        }

        if (statusFilter === 'complete' && !char.appearance) return false;
        if (statusFilter === 'incomplete' && !!char.appearance) return false;
        if (statusFilter === 'danbooru' && !char.danbooruTag) return false;
        if (statusFilter === 'negative' && !char.negativeTags) return false;
        // “已启用”= 有效启用；“已停用”= 自己关了或所在分组关了。
        if (statusFilter === 'enabled' && !isCharacterEffectivelyEnabled(char, library)) return false;
        if (statusFilter === 'disabled' && isCharacterEffectivelyEnabled(char, library)) return false;

        return true;
    });
}

function updateCharacterPanelMeta(allChars, filteredChars) {
    // 顶部统计 / 500 上限提示 / 结果数只算已保存的角色：未保存的空白草稿（enabled 默认 true）不该被计入。
    allChars = allChars.filter(char => !draftCharacters.has(char.id));
    filteredChars = filteredChars.filter(char => !draftCharacters.has(char.id));
    const readyCount = allChars.filter(char => !!char.appearance).length;
    const missingCount = allChars.length - readyCount;
    const danbooruCount = allChars.filter(char => !!char.danbooruTag).length;
    const filtersActive = !!String(charFilters.query || '').trim() || charFilters.type !== 'all' || charFilters.status !== 'all';

    $('nd_char_stat_total').textContent = String(allChars.length);
    $('nd_char_stat_ready').textContent = String(readyCount);
    $('nd_char_stat_missing').textContent = String(missingCount);
    $('nd_char_stat_danbooru').textContent = String(danbooruCount);
    // 已启用 / 500 上限都按有效启用算：关闭分组里的角色不参与出图，也不计入后台请求的 knownCharacters。
    const enabledCount = CL
        ? CL.countEnabledCharacters({ characters: allChars, groups: state.characterGroups || [] })
        : allChars.filter(char => char.enabled !== false).length;
    $('nd_char_stat_enabled').textContent = String(enabledCount);
    $('nd_char_stat_groups').textContent = String((state.characterGroups || []).length);
    $('nd_char_limit_hint')?.classList.toggle('hidden', enabledCount <= (CL?.BACKEND_ENABLED_CHARACTER_LIMIT ?? 500));
    $('nd_char_result_count').textContent = `${filteredChars.length} / ${allChars.length}`;
    $('nd_char_filter_summary').textContent = filtersActive
        ? `筛选结果：显示 ${filteredChars.length} / ${allChars.length} 个角色`
        : `当前显示全部 ${allChars.length} 个角色`;
}

function resetCharacterFilters(render = true) {
    charFilters = { query: '', type: 'all', status: 'all' };
    if ($('nd_char_search')) $('nd_char_search').value = '';
    if ($('nd_char_filter_type')) $('nd_char_filter_type').value = 'all';
    if ($('nd_char_filter_status')) $('nd_char_filter_status').value = 'all';
    if (render) renderCharList();
}

function normalizeNamedTagListForUI(list = []) {
    return (Array.isArray(list) ? list : [])
        .map(item => ({
            name: String(item?.name || '').trim(),
            tags: String(item?.tags || '').trim(),
        }))
        .filter(item => item.name || item.tags);
}

const NAMED_TAG_EDITOR_KINDS = {
    outfit: {
        classPrefix: 'char-outfit',
        title: '服装',
        nameLabel: '服装名称',
        namePlaceholder: '如：常服、礼服、战斗服',
        tagsLabel: '服装 TAG',
        tagsPlaceholder: 'white shirt, black skirt, ribbon...',
        removeAction: 'remove-outfit',
    },
    dynstate: {
        classPrefix: 'char-dynstate',
        title: '状态',
        nameLabel: '状态名称',
        namePlaceholder: '如：睡觉、淋雨、害羞',
        tagsLabel: '状态 TAG',
        tagsPlaceholder: 'closed eyes, sleeping...',
        removeAction: 'remove-dynstate',
    },
};

function renderNamedTagEditorItem(item = {}, index = 0, kind = 'outfit') {
    const meta = NAMED_TAG_EDITOR_KINDS[kind] || NAMED_TAG_EDITOR_KINDS.outfit;
    return `
    <div class="${meta.classPrefix}-editor-item" data-index="${index}">
        <div class="${meta.classPrefix}-editor-header">
            <div class="${meta.classPrefix}-editor-title">${meta.title} ${index + 1}</div>
            <button class="btn btn-danger btn-sm" type="button" data-action="${meta.removeAction}" data-index="${index}"><i class="fa-solid fa-trash"></i> 删除</button>
        </div>
        <div class="form-group">
            <label class="form-label">${meta.nameLabel}</label>
            <input type="text" class="input ${meta.classPrefix}-name" value="${escapeHtml(item.name || '')}" placeholder="${meta.namePlaceholder}">
        </div>
        <div class="form-group">
            <label class="form-label">${meta.tagsLabel}</label>
            <textarea class="input ${meta.classPrefix}-tags" placeholder="${meta.tagsPlaceholder}">${escapeHtml(item.tags || '')}</textarea>
        </div>
    </div>`;
}

function syncNamedTagEditorList(list, kind = 'outfit') {
    if (!list) return;
    const meta = NAMED_TAG_EDITOR_KINDS[kind] || NAMED_TAG_EDITOR_KINDS.outfit;
    const rows = Array.from(list.querySelectorAll(`.${meta.classPrefix}-editor-item`));
    const empty = list.querySelector(`.${meta.classPrefix}-editor-empty`);
    if (empty) empty.style.display = rows.length ? 'none' : 'block';
    rows.forEach((row, index) => {
        row.dataset.index = String(index);
        row.querySelector(`.${meta.classPrefix}-editor-title`).textContent = `${meta.title} ${index + 1}`;
        const removeBtn = row.querySelector(`[data-action="${meta.removeAction}"]`);
        if (removeBtn) removeBtn.dataset.index = String(index);
    });
}

// keepEmpty：草稿保护时保留刚点“添加服装/状态”还没填内容的空行；保存时仍然过滤掉。
function collectNamedTagEditorValues(card, kind = 'outfit', { keepEmpty = false } = {}) {
    const meta = NAMED_TAG_EDITOR_KINDS[kind] || NAMED_TAG_EDITOR_KINDS.outfit;
    return Array.from(card.querySelectorAll(`.${meta.classPrefix}-editor-item`)).map(row => ({
        name: row.querySelector(`.${meta.classPrefix}-name`)?.value?.trim() || '',
        tags: row.querySelector(`.${meta.classPrefix}-tags`)?.value?.trim() || '',
    })).filter(item => keepEmpty || item.name || item.tags);
}

function renderCharacterActionIcon(name) {
    const paths = {
        enabled: '<rect x="3" y="3" width="18" height="18" rx="4" /><path d="m8 12 3 3 5-6" />',
        disabled: '<rect x="3" y="3" width="18" height="18" rx="4" />',
        edit: '<path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />',
        delete: '<path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />',
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ''}</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 角色分组
// ═══════════════════════════════════════════════════════════════════════════
// 分组 / 排序 / 批量逻辑在 shared/character-library.js（纯函数）；本页只负责渲染与交互。

let CL = null; // character-library.js 的模块命名空间，DOMContentLoaded 末尾动态引入
let CD = null; // character-library-dialog.js（导入对话框、导出文件名），与 CL 一同动态引入
let CS = null; // character-list-scroll.js（拖拽时的自动滚动），与 CL 一同动态引入
let GP = null; // character-group-presets-ui.js（分组预设面板组件），与 CL 一同动态引入
let GPM = null; // 分组预设领域操作，与角色库一起加载
const GROUP_COLLAPSE_KEY = 'lwb.draw.charGroupCollapsed';
let charGroupCollapsed = loadCharGroupCollapsed();

function loadCharGroupCollapsed() {
    try {
        const value = JSON.parse(localStorage.getItem(GROUP_COLLAPSE_KEY) || '{}');
        return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch {
        return {};
    }
}

function saveCharGroupCollapsed() {
    try { localStorage.setItem(GROUP_COLLAPSE_KEY, JSON.stringify(charGroupCollapsed)); } catch { /* 隐私模式等 */ }
}

function collapseKey(groupId) { return groupId || '__ungrouped__'; }

function charFiltersActive() {
    return !!String(charFilters.query || '').trim() || charFilters.type !== 'all' || charFilters.status !== 'all';
}

function getCharacterLibrary() {
    return { characters: state.characterTags || [], groups: state.characterGroups || [] };
}

// 已保存的角色：不含还没点“保存”的空白草稿。持久化、撤销快照、指纹、导出都只看这一份。
function persistedCharacters() {
    return (state.characterTags || []).filter(char => !draftCharacters.has(char.id));
}

function getPersistedLibrary() {
    return { characters: persistedCharacters(), groups: state.characterGroups || [] };
}

// 每次保存都带上完整的角色与分组快照：宿主按整表覆盖，不做按 id 的远程操作。
// 未保存的空白草稿不会被写进去（否则任何库操作都会把空名角色连同存盘，并计入启用数 / 后台配方）。
function saveCharacterLibrary(restorePresetReferences) {
    postToParent({ type: 'SAVE_CHARACTER_TAGS', characterTags: persistedCharacters(), characterGroups: state.characterGroups || [],
        ...(restorePresetReferences ? { restorePresetReferences } : {}) });
}

function registerDraftCharacter(char) {
    if (char?.id) draftCharacters.set(char.id, char);
}

// 整表被替换（撤销快照、宿主 INIT_DATA）后，把仍在编辑的空白草稿放回去；已经放弃的草稿直接丢掉。
function reattachDraftCharacters() {
    if (!draftCharacters.size) return;
    const existing = new Set((state.characterTags || []).map(char => char.id));
    const groupIds = new Set((state.characterGroups || []).map(group => group.id));
    for (const [id, char] of [...draftCharacters]) {
        if (existing.has(id)) continue;
        if (id !== editingCharId) { draftCharacters.delete(id); continue; }
        const restored = { ...char };
        if (restored.groupId && !groupIds.has(restored.groupId)) delete restored.groupId;
        state.characterTags = [...(state.characterTags || []), restored];
        draftCharacters.set(id, restored);
    }
}

function applyCharacterLibrary(library, { restoreDrafts = false, restorePresetReferences } = {}) {
    const presets = restorePresetReferences
        ? GPM.restoreGroupPresetReferences(state.characterGroupPresets || [], restorePresetReferences)
        : state.characterGroupPresets || [];
    state.characterGroupPresets = GPM.normalizeGroupPresets(presets, { groupIds: library.groups.map(group => group.id) });
    state.characterTags = library.characters;
    state.characterGroups = library.groups;
    if (restoreDrafts) reattachDraftCharacters();
    saveCharacterLibrary(restorePresetReferences);
    renderCharList();
    renderAutoLearnGroupOptions();
    renderGroupPresetPanel();
}

// ═══════════════════════════════════════════════════════════════════════════
// 分组预设
// ═══════════════════════════════════════════════════════════════════════════
// 预设保存 / 应用都经宿主（SAVE_GROUP_PRESETS / APPLY_GROUP_PRESET）；组件是受控的，数据从 state 读，
// 改动先乐观写进 state 再发给宿主。INIT_DATA 重绘只调 panel.render()，不销毁重建，展开状态与输入草稿由组件自己保留。
let groupPresetPanel = null;
let groupPresetSaveSeq = 0;
let groupPresetRequestSeq = 0;
const groupPresetPendingSaves = new Map(); // 已发出、宿主还没回执的保存序号 -> 超时计时器
const GROUP_PRESET_SAVE_RECEIPT_TIMEOUT_MS = 15000;
let groupPresetHostPresets = null; // 宿主最近一次下发的预设：回执丢失时用它重新对齐
const groupPresetApplyWaiters = new Map(); // requestId -> resolve(result)
let groupPresetStatusTimer = null;
const GROUP_PRESET_APPLY_TIMEOUT_MS = 15000;

function groupPresetToast(message, level = 'info') {
    const el = $('nd_gp_status');
    if (!el) return;
    updateStatus(el, level === 'error' ? 'error' : (level === 'success' ? 'success' : ''), message);
    clearTimeout(groupPresetStatusTimer);
    groupPresetStatusTimer = setTimeout(() => {
        if (el.textContent === String(message || '')) updateStatus(el, '', '');
    }, 6000);
}

// 以宿主最近一次下发的预设为准重新对齐本地显示（回执丢失 / 超时时用）。
function realignGroupPresetsWithHost() {
    if (Array.isArray(groupPresetHostPresets)) state.characterGroupPresets = groupPresetHostPresets;
    renderGroupPresetPanel();
}

function saveGroupPresetsToHost(presets) {
    state.characterGroupPresets = presets;
    const seq = ++groupPresetSaveSeq;
    // 回执一直不来（消息丢了 / 宿主出错）时不能让“保留本地预设”永远生效：超时就当作结束，不弹错误。
    const timer = setTimeout(() => {
        if (!groupPresetPendingSaves.delete(seq)) return;
        if (!groupPresetPendingSaves.size) realignGroupPresetsWithHost();
    }, GROUP_PRESET_SAVE_RECEIPT_TIMEOUT_MS);
    groupPresetPendingSaves.set(seq, timer);
    postToParent({ type: 'SAVE_GROUP_PRESETS', presets, seq });
}

function applyGroupPresetViaHost(presetId) {
    const requestId = `gp-apply-${++groupPresetRequestSeq}`;
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            groupPresetApplyWaiters.delete(requestId);
            resolve({ status: 'error', message: '宿主没有响应' });
        }, GROUP_PRESET_APPLY_TIMEOUT_MS);
        groupPresetApplyWaiters.set(requestId, (result) => {
            clearTimeout(timer);
            resolve(result || { status: 'error', message: '宿主没有返回结果' });
        });
        postToParent({ type: 'APPLY_GROUP_PRESET', presetId, requestId });
    });
}

function handleGroupPresetStatus(data) {
    if (data.requestId && groupPresetApplyWaiters.has(data.requestId)) {
        const resolve = groupPresetApplyWaiters.get(data.requestId);
        groupPresetApplyWaiters.delete(data.requestId);
        resolve(data.result);
        return;
    }
    if (data.seq) {
        clearTimeout(groupPresetPendingSaves.get(data.seq));
        groupPresetPendingSaves.delete(data.seq);
        // 保存成功：宿主带回规范化后的预设（已清理指向已删除分组的键等），所有保存都有回执后页面本地与之对齐。
        if (data.state === 'success' && Array.isArray(data.presets) && !groupPresetPendingSaves.size) {
            groupPresetHostPresets = data.presets;
            state.characterGroupPresets = data.presets;
            renderGroupPresetPanel();
        }
    }
    if (data.state === 'error') groupPresetToast(data.text || '分组预设操作失败', 'error');
}

function renderGroupPresetPanel() {
    if (!GP) return;
    if (groupPresetPanel) {
        groupPresetPanel.render();
        return;
    }
    const container = $('nd_group_preset_root');
    if (!container) return;
    groupPresetPanel = GP.createGroupPresetPanel({
        document,
        container,
        getLibrary: getPersistedLibrary,
        getPresets: () => state.characterGroupPresets || [],
        getApplied: () => state.characterGroupPresetApplied || null,
        getActiveAvatars: () => state.activeAvatars || [],
        listHostCharacters: () => {
            // 宿主角色列表还没到时抛错：组件据此不把已绑定的角色卡标成“不存在”。
            if (!Array.isArray(state.hostCharacters)) throw new Error('宿主角色列表未就绪');
            return state.hostCharacters;
        },
        onPresetsChange: presets => saveGroupPresetsToHost(presets),
        onApply: presetId => applyGroupPresetViaHost(presetId),
        toast: groupPresetToast,
    });
}

function runLibraryAction(action) {
    if (!CL) { alert('角色库模块未加载，分组功能不可用'); return; }
    try {
        action();
    } catch (error) {
        alert(error?.message || '操作失败');
    }
}

function renderAutoLearnGroupOptions() {
    const select = $('nd_auto_learn_group');
    if (!select) return;
    const groups = state.characterGroups || [];
    select.innerHTML = DOMPurify.sanitize(`<option value="">未分组</option>${groups.map(group =>
        `<option value="${escapeHtml(group.id)}">${escapeHtml(group.name)}${group.enabled === false ? '（已关闭）' : ''}</option>`).join('')}`);
    // 分组被删除后回落到未分组（宿主在学习时也会做同样的回落）。
    select.value = groups.some(group => group.id === state.autoLearnGroupId) ? state.autoLearnGroupId : '';
}

// 分组头的“自己开着数 / 总数”与分组开关（两态）外观；整体渲染与轻量刷新共用，保证两处一致。
// 分组开关是分组自己的状态，与组内各角色自己的 enabled 互相独立：有效启用 = 分组开 且 角色开。
const GROUP_SWITCH_TITLE_ON = '关闭分组：组内角色不再参与出图，各角色自己的开关保持不变';
const GROUP_SWITCH_TITLE_OFF = '开启分组：组内角色按各自的开关参与出图';

function describeGroupHeader(library, group) {
    const { own, total, enabled } = CL.getGroupSummary(library, group.id);
    return {
        enabled,
        // 窄栏里分组名优先：计数只写“自己开着数/总数”，完整含义放在 title / aria-label 里。
        countText: `${own}/${total}`,
        countTitle: `组内自己开着的角色 ${own} 个，共 ${total} 个${enabled ? '' : '；分组已关闭，组内角色当前都不参与出图'}`,
        switchTitle: enabled ? GROUP_SWITCH_TITLE_ON : GROUP_SWITCH_TITLE_OFF,
        switchIcon: enabled ? 'fa-toggle-on' : 'fa-toggle-off',
    };
}

// 卡片上的单个启用开关只改 DOM、不整体重绘（避免丢失其他卡片未保存的编辑），
// 所以顶部统计、500 上限提示、各分组头的计数要在这里单独刷新（分组开关本身不受角色开关影响）。
function refreshEnabledSummary() {
    const chars = state.characterTags || [];
    updateCharacterPanelMeta(chars, getFilteredCharacters(chars));
    if (!CL || !(state.characterGroups || []).length) return;
    const library = getCharacterLibrary();
    const sections = [...document.querySelectorAll('#nd_char_list .char-group')];
    CL.getGroupedView(library).forEach((group) => {
        const section = sections.find(node => (node.dataset.groupId || '') === group.id);
        if (!section) return;
        const info = describeGroupHeader(library, group);
        const count = section.querySelector('.char-group-count');
        if (count) {
            count.textContent = info.countText;
            count.title = info.countTitle;
        }
    });
}

function renderGroupedCharacterSections(filteredChars, renderCard) {
    const groups = state.characterGroups || [];
    if (!CL || !groups.length) return filteredChars.map(renderCard).join('');
    const filtering = charFiltersActive();
    const library = getCharacterLibrary();
    const view = CL.getGroupedView(library, { visibleIds: filteredChars.map(char => char.id) });
    return view.map((group) => {
        if (group.virtual && !group.total) return '';
        if (filtering && !group.characters.length) return '';
        const hasEditing = group.characters.some(char => char.id === editingCharId);
        const collapsed = !filtering && !hasEditing && charGroupCollapsed[collapseKey(group.id)] === true;
        const gid = escapeHtml(group.id);
        const gname = escapeHtml(group.name);
        const header = describeGroupHeader(library, group);
        // 分组开关只给真实分组：未分组没有开关，始终参与出图。
        const groupSwitch = group.virtual ? '' : `
                    <button type="button" class="char-action-button char-group-switch${header.enabled ? ' active' : ''}" data-group-action="toggle-enabled" data-group-id="${gid}" title="${header.switchTitle}" aria-label="${header.switchTitle} ${gname}" aria-pressed="${header.enabled}"><i class="fa-solid ${header.switchIcon}"></i></button>`;
        const manage = group.virtual ? '' : `
                    <button type="button" class="char-action-button" data-group-action="rename" data-group-id="${gid}" title="重命名分组" aria-label="重命名分组 ${gname}"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="char-action-button" data-group-action="delete" data-group-id="${gid}" title="删除分组" aria-label="删除分组 ${gname}"><i class="fa-solid fa-trash"></i></button>`;
        const body = group.characters.length
            ? group.characters.map(renderCard).join('')
            : '<div class="char-group-empty">本组暂无角色</div>';
        return `
        <section class="char-group${collapsed ? ' collapsed' : ''}${header.enabled ? '' : ' group-disabled'}" data-group-id="${gid}">
            <div class="char-group-header">
                <button type="button" class="char-group-collapse" data-group-action="collapse" data-group-id="${gid}" title="${collapsed ? '展开' : '折叠'}" aria-expanded="${!collapsed}" aria-label="${collapsed ? '展开' : '折叠'}分组 ${gname}"><i class="fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-down'}"></i></button>
                ${charSelectMode ? `<input type="checkbox" class="char-group-select" aria-label="选择分组 ${gname} 的全部角色">` : ''}
                ${!group.virtual && !filtering ? `<span class="char-drag-handle" role="button" tabindex="0" data-drag-group="${gid}" title="拖动调整分组顺序，也可聚焦后按 ↑ / ↓" aria-label="拖动调整分组 ${gname} 的顺序">⋮⋮</span>` : ''}
                <span class="char-group-name" title="${gname}">${gname}</span>
                <span class="char-group-count" title="${header.countTitle}">${header.countText}</span>
                <div class="char-group-actions">
${groupSwitch}
                    <button type="button" class="char-action-button" data-group-action="add" data-group-id="${gid}" title="在本组添加角色" aria-label="在 ${gname} 添加角色"><i class="fa-solid fa-plus"></i></button>${manage}
                </div>
            </div>
            <div class="char-group-body"${collapsed ? ' hidden' : ''}>${body}</div>
        </section>`;
    }).join('');
}

function handleGroupAction(action, groupId, trigger) {
    if (action === 'collapse') {
        // 只改 DOM，不重绘：避免丢失其他卡片里尚未保存的编辑。
        const section = trigger?.closest('.char-group');
        const collapsed = !section?.classList.contains('collapsed');
        charGroupCollapsed[collapseKey(groupId)] = collapsed;
        saveCharGroupCollapsed();
        section?.classList.toggle('collapsed', collapsed);
        section?.querySelector('.char-group-body')?.toggleAttribute('hidden', collapsed);
        trigger?.setAttribute('aria-expanded', String(!collapsed));
        const icon = trigger?.querySelector('i');
        if (icon) icon.className = `fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-down'}`;
        return;
    }
    runLibraryAction(() => {
        const library = getCharacterLibrary();
        const members = library.characters.filter(char => (char.groupId || '') === groupId);
        // 提示文案里的角色数只算已保存的角色（空白草稿不是“该分组的角色”）。
        const savedMembers = members.filter(char => !draftCharacters.has(char.id));
        if (action === 'toggle-enabled') {
            // 只切换分组自己的开关：不改任何角色的 enabled。
            applyCharacterLibrary(CL.setGroupEnabled(library, groupId, !CL.isGroupEnabled(library, groupId)));
        } else if (action === 'add') {
            const { library: next, id } = CL.addCharacter(library, { name: '' }, { groupId });
            state.characterTags = next.characters;
            registerDraftCharacter(next.characters.find(char => char.id === id));
            editingCharId = id;
            editingDraft = null;
            charGroupCollapsed[collapseKey(groupId)] = false;
            saveCharGroupCollapsed();
            resetCharacterFilters(false);
            renderCharList();
            revealEditingCard();
            setTimeout(() => document.querySelector('.char-edit-name')?.focus(), 50);
        } else if (action === 'rename') {
            const group = library.groups.find(item => item.id === groupId);
            const name = prompt('分组名称', group?.name || '');
            if (name === null) return;
            applyCharacterLibrary(CL.renameGroup(library, groupId, name));
        } else if (action === 'delete') {
            const group = library.groups.find(item => item.id === groupId);
            if (!confirm(`确定删除分组“${group?.name || ''}”？`)) return;
            let deleteCharacters = false;
            if (savedMembers.length) {
                deleteCharacters = confirm(`该分组有 ${savedMembers.length} 个角色。\n\n确定：连同角色一起删除（删除后 ${UNDO_WINDOW_MS / 1000} 秒内可点“撤销”恢复）\n取消：保留角色，移到“未分组”`);
            }
            const snapshot = cloneLibrary(library);
            snapshot.restorePresetReferences = GPM.captureGroupPresetReferences(state.characterGroupPresets || [], groupId);
            applyCharacterLibrary(CL.deleteGroup(library, groupId, { deleteCharacters }));
            showUndo(`已删除分组“${group?.name || ''}”${deleteCharacters ? `及其 ${savedMembers.length} 个角色` : ''}`, snapshot);
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 多选 / 批量操作 / 复制 / 撤销 / 拖拽排序
// ═══════════════════════════════════════════════════════════════════════════

let charSelectMode = false;
const selectedCharIds = new Set();
let undoState = null; // { snapshot, fingerprint, timer }
const UNDO_WINDOW_MS = 10000;

// 撤销快照只记已保存的角色：未保存的空白草稿不属于“操作前的库”，撤销时也不该把它带回来。
function cloneLibrary(library) {
    const characters = (library.characters || []).filter(char => !draftCharacters.has(char.id));
    return JSON.parse(JSON.stringify({ characters, groups: library.groups }));
}

function visibleCharacterIds() {
    return getFilteredCharacters(persistedCharacters()).map(char => char.id);
}

function pruneSelection() {
    const existing = new Set((state.characterTags || []).map(char => char.id));
    for (const id of [...selectedCharIds]) if (!existing.has(id)) selectedCharIds.delete(id);
}

function setCharSelectMode(on) {
    charSelectMode = !!on;
    if (!charSelectMode) selectedCharIds.clear();
    renderCharList();
}

function renderBatchBar() {
    const bar = $('nd_char_batch_bar');
    if (!bar) return;
    bar.classList.toggle('hidden', !charSelectMode);
    $('nd_char_select_toggle')?.classList.toggle('active', charSelectMode);
    $('nd_char_batch_count').textContent = `已选 ${selectedCharIds.size} 个`;
    const target = $('nd_batch_target');
    const previous = target.value;
    const groups = state.characterGroups || [];
    target.innerHTML = DOMPurify.sanitize(`<option value="">未分组</option>${groups.map(group =>
        `<option value="${escapeHtml(group.id)}">${escapeHtml(group.name)}</option>`).join('')}`);
    target.value = groups.some(group => group.id === previous) ? previous : '';
    const none = selectedCharIds.size === 0;
    bar.querySelectorAll('[data-needs-selection]').forEach(button => { button.disabled = none; });
}

// 重绘后把选中状态同步回复选框（含分组复选框的半选态）。
function syncSelectionCheckboxes() {
    const list = $('nd_char_list');
    list.querySelectorAll('.char-select').forEach((box) => { box.checked = selectedCharIds.has(box.dataset.selectChar); });
    list.querySelectorAll('.char-group-select').forEach((box) => {
        const section = box.closest('.char-group');
        const ids = [...section.querySelectorAll('.char-select')].map(item => item.dataset.selectChar);
        const picked = ids.filter(id => selectedCharIds.has(id)).length;
        box.checked = ids.length > 0 && picked === ids.length;
        box.indeterminate = picked > 0 && picked < ids.length;
        box.disabled = ids.length === 0;
    });
}

// 角色库完整内容的指纹（键名排序后序列化，不受对象键顺序影响）。
// 撤销是整表快照回写：只要库自“操作完成那一刻”起发生过任何变化（新增 / 编辑 / 启停 / 移动 / 改组名 /
// 宿主推来不同数据），回写快照就会连带抹掉这些修改，所以撤销必须失效。
function canonicalStringify(value) {
    if (Array.isArray(value)) return `[${value.map(canonicalStringify).join(',')}]`;
    if (value && typeof value === 'object') {
        return `{${Object.keys(value).sort().filter(key => value[key] !== undefined)
            .map(key => `${JSON.stringify(key)}:${canonicalStringify(value[key])}`).join(',')}}`;
    }
    return JSON.stringify(value) ?? 'null';
}

// 指纹对“规范化之后”的库计算：宿主存盘 / 回推 INIT_DATA 时会补全缺省字段（如 danbooruTag: ''）、
// 清理别名空白等，本页内存里的角色对象可能还没带这些字段。不先规范化的话，撤销窗口内收到一次
// 内容其实没变的 INIT_DATA（例如切换自动学习开关）就会让撤销被误判失效。真实内容变化仍然改变指纹。
// 默认只看已保存的角色，未保存的空白草稿不影响撤销。
function libraryFingerprint(library = getPersistedLibrary()) {
    const source = { characters: library.characters || [], groups: library.groups || [] };
    let normalized = source;
    if (CL?.normalizeCharacterLibrary) {
        try {
            const result = CL.normalizeCharacterLibrary(source);
            normalized = { characters: result.characters, groups: result.groups };
        } catch { /* 规范化失败时退回原始内容 */ }
    }
    return canonicalStringify(normalized);
}

let undoNoticeTimer = null;
const UNDO_NOTICE_MS = 5000;

// 必须在操作已应用到库之后调用：指纹记录的是“操作完成后”的库。
function showUndo(text, snapshot) {
    hideUndo();
    const timer = setTimeout(hideUndo, UNDO_WINDOW_MS);
    undoState = { snapshot, fingerprint: libraryFingerprint(), timer };
    $('nd_char_undo_text').textContent = text;
    $('nd_char_undo_btn')?.classList.remove('hidden');
    $('nd_char_undo').classList.remove('hidden');
}

function hideUndo() {
    if (undoState) clearTimeout(undoState.timer);
    undoState = null;
    if (undoNoticeTimer) { clearTimeout(undoNoticeTimer); undoNoticeTimer = null; }
    $('nd_char_undo')?.classList.add('hidden');
    $('nd_char_undo_btn')?.classList.remove('hidden');
}

// 撤销失效：收起撤销条，改为一条短暂的提示，不回写快照。
function expireUndo() {
    hideUndo();
    const bar = $('nd_char_undo');
    if (!bar) return;
    $('nd_char_undo_text').textContent = '数据已发生变化，无法撤销';
    $('nd_char_undo_btn')?.classList.add('hidden');
    bar.classList.remove('hidden');
    undoNoticeTimer = setTimeout(hideUndo, UNDO_NOTICE_MS);
}

function isUndoStale() {
    if (!undoState) return false;
    if (undoState.fingerprint !== libraryFingerprint()) return true;
    if (undoState.snapshot.restorePresetReferences) {
        try { GPM.restoreGroupPresetReferences(state.characterGroupPresets || [], undoState.snapshot.restorePresetReferences); }
        catch { return true; } // 相关预设变化：不允许用撤销覆盖新内容。
    }
    return false;
}

// 撤销窗口内库被改动过（本页其他操作，或宿主推来了不同内容，例如自动学习新增了角色）：快照已过期。
function clearUndoIfStale() {
    if (isUndoStale()) expireUndo();
}

function performUndo() {
    if (!undoState) return;
    if (isUndoStale()) { expireUndo(); return; }
    const { snapshot } = undoState;
    hideUndo();
    runLibraryAction(() => applyCharacterLibrary(snapshot, { restoreDrafts: true, restorePresetReferences: snapshot.restorePresetReferences }));
}

function deleteCharactersWithUndo(ids, text) {
    const snapshot = cloneLibrary(getCharacterLibrary());
    applyCharacterLibrary(CL.deleteCharacters(getCharacterLibrary(), ids));
    ids.forEach(id => selectedCharIds.delete(id));
    showUndo(text, snapshot);
    renderBatchBar();
}

// ── 导出 / 导入 ──────────────────────────────────────────────
// 导出范围 request 见 CL.exportCharacters；groupName 仅用于生成文件名。

function downloadJsonFile(fileName, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // 延后释放：部分浏览器在 click 返回时尚未开始读取 blob
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCharacterFile(request, groupName = '') {
    runLibraryAction(() => {
        if (!CD) throw new Error('角色库模块未加载，无法导出');
        const data = CL.exportCharacters(getPersistedLibrary(), request);
        downloadJsonFile(CD.buildCharacterExportFileName({ scope: request.scope, groupName }), data);
    });
}

let characterExportDialog = null;

// “导出”按钮：先让用户选导出范围（全部 / 某个分组 / 当前已选），确认后才真正下载；取消不导出。
// 库与已选都只取已保存的角色，空白草稿不会出现在计数里，也不会被导出。
function openCharacterExportChooser() {
    runLibraryAction(() => {
        if (!CD) throw new Error('角色库模块未加载，无法导出');
        if (!persistedCharacters().length) { alert('没有可导出的角色'); return; }
        characterExportDialog?.close();
        characterExportDialog = CD.openCharacterExportDialog({
            document,
            library: getPersistedLibrary,
            selectedIds: () => [...selectedCharIds].filter(id => !draftCharacters.has(id)),
            onConfirm: ({ request, groupName }) => exportCharacterFile(request, groupName),
            onClose: () => { characterExportDialog = null; },
        });
    });
}

let characterImportDialog = null;

// 读取并校验文件，通过后打开导入对话框；真正写入库发生在对话框点“导入”之后。
async function handleCharacterImportFile(file) {
    if (!CL || !CD) { alert('角色库模块未加载，无法导入'); return; }
    if (file.size > CL.MAX_IMPORT_FILE_BYTES) {
        const limitMb = CL.MAX_IMPORT_FILE_BYTES / 1024 / 1024;
        const sizeMb = Math.ceil(file.size / 1024 / 1024 * 10) / 10; // 向上取整，避免略超上限时显示成“5.0 MB”
        alert(`导入失败：文件过大（${sizeMb.toFixed(1)} MB），不能超过 ${limitMb} MB`);
        return;
    }
    let payload;
    try {
        payload = JSON.parse(await file.text());
    } catch {
        alert('导入失败：不是有效的 JSON 文件');
        return;
    }
    let parsed;
    try {
        parsed = CL.parseCharacterImport(payload);
    } catch (error) {
        alert(`导入失败：${error instanceof TypeError ? error.message : '无法识别的文件'}`);
        return;
    }
    characterImportDialog?.close();
    characterImportDialog = CD.openCharacterImportDialog({
        document,
        library: getPersistedLibrary,
        parsed,
        fileName: file.name,
        onConfirm: ({ plan }) => {
            const snapshot = cloneLibrary(getCharacterLibrary());
            const { added, replaced, keptBoth, groupsCreated } = plan.summary;
            applyCharacterLibrary(plan.library, { restoreDrafts: true });
            if (added + replaced + keptBoth + groupsCreated > 0) {
                const parts = [`新增 ${added}`, `替换 ${replaced}`];
                if (keptBoth) parts.push(`保留两者 ${keptBoth}`);
                if (groupsCreated) parts.push(`新建分组 ${groupsCreated}`);
                showUndo(`已导入：${parts.join('、')}`, snapshot);
            }
        },
        onClose: () => { characterImportDialog = null; },
    });
}

function runBatchAction(action) {
    runLibraryAction(() => {
        const library = getCharacterLibrary();
        const ids = [...selectedCharIds].filter(id => !draftCharacters.has(id));
        const target = $('nd_batch_target').value || '';
        if (action === 'select-all') {
            visibleCharacterIds().forEach(id => selectedCharIds.add(id));
            renderCharList();
            return;
        }
        if (action === 'exit') { setCharSelectMode(false); return; }
        if (!ids.length) return;
        if (action === 'enable' || action === 'disable') {
            applyCharacterLibrary(CL.setCharactersEnabled(library, ids, action === 'enable'));
        } else if (action === 'move') {
            applyCharacterLibrary(CL.moveCharacters(library, ids, { groupId: target }));
        } else if (action === 'copy' || action === 'copy-to') {
            const { library: next, newIds } = action === 'copy'
                ? CL.duplicateCharacters(library, ids)
                : CL.duplicateCharacters(library, ids, { toGroupId: target });
            selectedCharIds.clear();
            newIds.forEach(id => selectedCharIds.add(id));
            applyCharacterLibrary(next);
        } else if (action === 'export') {
            exportCharacterFile({ scope: 'selection', ids });
        } else if (action === 'delete') {
            if (!confirm(`确定删除选中的 ${ids.length} 个角色？`)) return;
            deleteCharactersWithUndo(ids, `已删除 ${ids.length} 个角色`);
        }
        renderBatchBar();
    });
}

// ── 拖拽排序（指针事件：鼠标与触屏通用）──────────────────────

let dragState = null;

function clearDropMarks() {
    document.querySelectorAll('.drop-before, .drop-after, .drop-into').forEach((node) => {
        node.classList.remove('drop-before', 'drop-after', 'drop-into');
    });
}

function startDrag(event, kind, id) {
    if (event.button !== undefined && event.button !== 0) return;
    if (!CL || charFiltersActive()) return;
    const ids = kind === 'char'
        ? (charSelectMode && selectedCharIds.has(id) && selectedCharIds.size > 1 ? [...selectedCharIds] : [id])
        : [id];
    dragState = { kind, ids, pointerId: event.pointerId, target: null, moved: false, startY: event.clientY };
    event.preventDefault();
    try { event.target.setPointerCapture?.(event.pointerId); } catch { /* 指针已失效时忽略，仍可用文档级监听完成拖拽 */ }
    document.body.classList.add('char-dragging');
    ids.forEach((dragId) => {
        const selector = kind === 'char' ? `.char-card[data-id="${CSS.escape(dragId)}"]` : `.char-group[data-group-id="${CSS.escape(dragId)}"]`;
        document.querySelector(selector)?.classList.add('dragging');
    });
}

function resolveDropTarget(event) {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    if (!element) return null;
    const library = getCharacterLibrary();
    if (dragState.kind === 'group') {
        const section = element.closest('.char-group');
        if (!section || !section.dataset.groupId || section.dataset.groupId === dragState.ids[0]) return null;
        const rect = section.getBoundingClientRect();
        const before = event.clientY < rect.top + rect.height / 2;
        const sections = [...document.querySelectorAll('#nd_char_list .char-group')].filter(node => node.dataset.groupId);
        const index = sections.indexOf(section);
        const beforeGroupId = before ? section.dataset.groupId : (sections[index + 1]?.dataset.groupId || '');
        return { node: section, mark: before ? 'drop-before' : 'drop-after', beforeGroupId };
    }
    const card = element.closest('.char-card');
    if (card && dragState.ids.includes(card.dataset.id)) {
        // 落在被拖集合自己的卡片上：被拖项不参与定位，只按指针 Y 与同组其余卡片比较求插入位（落在自己身上 = 原地不动），
        // 绝不能退化成“放进分组头”而把它们甩到组尾。
        const group = card.closest('.char-group');
        const groupId = group?.dataset.groupId || '';
        const others = [...card.parentElement.querySelectorAll(':scope > .char-card')]
            .filter(item => !dragState.ids.includes(item.dataset.id));
        if (!others.length) {
            const header = group?.querySelector('.char-group-header');
            return header ? { node: header, mark: 'drop-into', groupId } : null;
        }
        const next = others.find((item) => {
            const rect = item.getBoundingClientRect();
            return event.clientY < rect.top + rect.height / 2;
        });
        return next
            ? { node: next, mark: 'drop-before', beforeId: next.dataset.id, groupId }
            : { node: others[others.length - 1], mark: 'drop-after', groupId };
    }
    if (card) {
        const rect = card.getBoundingClientRect();
        const before = event.clientY < rect.top + rect.height / 2;
        const cards = [...card.parentElement.querySelectorAll(':scope > .char-card')];
        // “放到该卡之后” = 放到其后第一张【不在被拖集合里】的卡片之前；后面全是被拖项（或没有卡片）才是追加到组尾。
        const next = cards.slice(cards.indexOf(card) + 1).find(item => !dragState.ids.includes(item.dataset.id));
        const groupId = card.closest('.char-group')?.dataset.groupId || '';
        const target = before ? { beforeId: card.dataset.id, groupId } : (next
            ? { beforeId: next.dataset.id, groupId } : { groupId });
        return { node: card, mark: before ? 'drop-before' : 'drop-after', ...target };
    }
    const section = element.closest('.char-group');
    if (section && library.groups.length) {
        return { node: section.querySelector('.char-group-header') || section, mark: 'drop-into', groupId: section.dataset.groupId || '' };
    }
    return null;
}

function onDragMove(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    if (Math.abs(event.clientY - dragState.startY) > 3) dragState.moved = true;
    // 靠近滚动区上下缘时先自动滚动（最近的分组滚动区 → 外层容器 → 整页），再按滚动后的实时位置算落点。
    CS?.autoScrollForPointer({
        start: document.elementFromPoint(event.clientX, event.clientY) || $('nd_char_list'),
        pointerY: event.clientY,
        getStyle: element => getComputedStyle(element),
        getRect: element => element.getBoundingClientRect(),
        viewport: { top: 0, bottom: window.innerHeight },
        pageScroller: document.scrollingElement || document.documentElement,
        // 拖动“分组”时落点只看分组头，不依赖组内容：不去滚分组内部，直接带动外层 / 整页。
        skipContainer: dragState.kind === 'group' ? (element => element.classList?.contains('char-group-body')) : null,
    });
    clearDropMarks();
    dragState.target = resolveDropTarget(event);
    dragState.target?.node.classList.add(dragState.target.mark);
}

function endDrag(event, cancelled = false) {
    if (!dragState || (event && event.pointerId !== dragState.pointerId)) return;
    const { kind, ids, target, moved } = dragState;
    dragState = null;
    clearDropMarks();
    document.body.classList.remove('char-dragging');
    document.querySelectorAll('.dragging').forEach(node => node.classList.remove('dragging'));
    if (cancelled || !moved || !target) return;
    runLibraryAction(() => {
        const library = getCharacterLibrary();
        if (kind === 'group') {
            const next = CL.placeGroup(library, ids[0], target.beforeGroupId || '');
            if (libraryFingerprint(next) !== libraryFingerprint(library)) applyCharacterLibrary(next);
        } else {
            const next = CL.moveCharacters(library, ids, { groupId: target.groupId || '', beforeId: target.beforeId || '' });
            // 落点与现状一致（顺序和分组都没变）时不保存、不重绘。
            if (libraryFingerprint(next) !== libraryFingerprint(library)) applyCharacterLibrary(next);
        }
    });
}

// 拖动手柄的键盘排序：角色手柄在同组内上下移一位，分组手柄在分组之间上下移一位（边界处不动）。
function handleDragKeydown(event) {
    const charHandle = event.target.closest?.('[data-drag-char]');
    const groupHandle = charHandle ? null : event.target.closest?.('[data-drag-group]');
    const handle = charHandle || groupHandle;
    if (!handle || !CL || charFiltersActive() || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
    event.preventDefault();
    const delta = event.key === 'ArrowUp' ? -1 : 1;
    const id = charHandle ? handle.dataset.dragChar : handle.dataset.dragGroup;
    const attribute = charHandle ? 'data-drag-char' : 'data-drag-group';
    runLibraryAction(() => {
        // getCharacterLibrary() 每次返回新对象：必须先存变量再和 shiftCharacter / moveGroup 的返回值比较（边界处它们返回原对象）。
        const library = getCharacterLibrary();
        const next = charHandle ? CL.shiftCharacter(library, id, delta) : CL.moveGroup(library, id, delta);
        if (next === library) return;
        applyCharacterLibrary(next);
        // 重绘后把焦点还给同一个手柄，便于连续按键；被移动的卡 / 分组保持在可视范围内（分组滚动区内用 nearest，不强行居中）
        const handleNode = document.querySelector(`[${attribute}="${CSS.escape(id)}"]`);
        handleNode?.focus();
        handleNode?.closest(charHandle ? '.char-card' : '.char-group')?.scrollIntoView?.({ block: 'nearest' });
    });
}

function setupCharacterDragAndSelection() {
    const list = $('nd_char_list');
    list.addEventListener('pointerdown', (event) => {
        const charHandle = event.target.closest('[data-drag-char]');
        const groupHandle = event.target.closest('[data-drag-group]');
        if (charHandle) startDrag(event, 'char', charHandle.dataset.dragChar);
        else if (groupHandle) startDrag(event, 'group', groupHandle.dataset.dragGroup);
    });
    list.addEventListener('keydown', handleDragKeydown);
    list.addEventListener('change', (event) => {
        const box = event.target;
        if (box.classList?.contains('char-select')) {
            if (box.checked && !draftCharacters.has(box.dataset.selectChar)) selectedCharIds.add(box.dataset.selectChar); else selectedCharIds.delete(box.dataset.selectChar);
            syncSelectionCheckboxes();
            renderBatchBar();
        } else if (box.classList?.contains('char-group-select')) {
            const section = box.closest('.char-group');
            section.querySelectorAll('.char-select').forEach((item) => {
                if (box.checked && !draftCharacters.has(item.dataset.selectChar)) selectedCharIds.add(item.dataset.selectChar); else selectedCharIds.delete(item.dataset.selectChar);
            });
            syncSelectionCheckboxes();
            renderBatchBar();
        }
    });
    document.addEventListener('pointermove', onDragMove);
    document.addEventListener('pointerup', event => endDrag(event));
    document.addEventListener('pointercancel', event => endDrag(event, true));
    $('nd_char_select_toggle').addEventListener('click', () => setCharSelectMode(!charSelectMode));
    $('nd_char_batch_bar').addEventListener('click', (event) => {
        const button = event.target.closest('[data-batch]');
        if (button && !button.disabled) runBatchAction(button.dataset.batch);
    });
    $('nd_char_undo_btn').addEventListener('click', performUndo);
}

// 读出正在编辑的卡片的表单内容（包括刚点“添加服装/状态”还没填的空行）。
function readEditingDraft() {
    if (!editingCharId) return null;
    const card = Array.from(document.querySelectorAll('#nd_char_list .char-card.editing'))
        .find(node => node.dataset.id === editingCharId);
    if (!card) return null;
    const value = selector => card.querySelector(selector)?.value ?? '';
    return {
        id: editingCharId,
        // 所属分组下拉框（库里没有分组时不渲染 → undefined）。groupBase 是这张卡片渲染时的已保存分组（data-saved-group）：
        // 只有用户真的改动了下拉框（≠ groupBase）才算草稿，否则以库里最新的分组为准。
        groupId: card.querySelector('.char-edit-group')?.value,
        groupBase: card.querySelector('.char-edit-group')?.getAttribute('data-saved-group') ?? '',
        name: value('.char-edit-name'),
        type: value('.char-edit-type') || 'girl',
        typeCustom: value('.char-edit-type-custom'),
        aliases: value('.char-edit-aliases'),
        appearance: value('.char-edit-appearance'),
        negativeTags: value('.char-edit-neg'),
        outfits: collectNamedTagEditorValues(card, 'outfit', { keepEmpty: true }),
        dynamicStates: collectNamedTagEditorValues(card, 'dynstate', { keepEmpty: true }),
    };
}

// 重绘之前调用：把当前表单读回草稿；卡片不在 DOM 里（例如被筛选条件暂时隐藏）时保留已有草稿，
// 但草稿属于别的卡片时作废。
function captureEditingDraft() {
    const draft = readEditingDraft();
    if (draft) editingDraft = draft;
    else if (editingDraft && editingDraft.id !== editingCharId) editingDraft = null;
}

// 重绘前整理编辑状态：被删除 / 被替换掉的卡片不再处于编辑中；已放弃（切换去编辑别的卡片、取消）的空白草稿移除。
function reconcileEditingState() {
    const ids = new Set((state.characterTags || []).map(char => char.id));
    if (editingCharId && !ids.has(editingCharId)) editingCharId = null;
    for (const id of [...draftCharacters.keys()]) {
        if (!ids.has(id)) { draftCharacters.delete(id); continue; }
        if (id === editingCharId) continue;
        draftCharacters.delete(id);
        selectedCharIds.delete(id);
        state.characterTags = state.characterTags.filter(char => char.id !== id);
    }
    if (editingDraft && editingDraft.id !== editingCharId) editingDraft = null;
}

// 每个展开的分组有自己的滚动区（.char-group-body 的 max-height + overflow-y: auto）。整体重绘会换掉这些节点，
// 滚动位置随之归零：重绘前记下各组的 scrollTop，重绘后恢复（例如在大分组中间点一下启用开关，不应该跳回组顶）。
// 视图被隐藏（display:none，例如正在看“图片管理”时收到 INIT_DATA 触发重绘）时，元素的 scrollTop 读出来是 0、
// 也写不进去。所以只在分组滚动区可见（clientHeight 不为 0）时才更新记录，不可见就保留上一次记录的位置；
// 记录在 switchView 回到“角色标签”时再补写回去。
const groupScrollMemory = new Map();

function captureGroupScroll(list) {
    const present = new Set();
    list.querySelectorAll('.char-group').forEach((section) => {
        const key = section.dataset.groupId || '';
        const body = section.querySelector('.char-group-body');
        present.add(key);
        if (!body || body.clientHeight === 0) return; // 不可见：scrollTop 无意义，保留旧记录
        const top = Number(body.scrollTop) || 0;
        if (top > 0) groupScrollMemory.set(key, top);
        else groupScrollMemory.delete(key);
    });
    for (const key of Array.from(groupScrollMemory.keys())) {
        if (!present.has(key)) groupScrollMemory.delete(key); // 分组已不存在
    }
    return new Map(groupScrollMemory);
}

function restoreGroupScroll(list, positions = groupScrollMemory) {
    if (!positions.size) return;
    list.querySelectorAll('.char-group').forEach((section) => {
        const top = positions.get(section.dataset.groupId || '');
        const body = section.querySelector('.char-group-body');
        if (top && body && !(Number(body.scrollTop) > 0)) body.scrollTop = top; // 已有位置的（浏览器保留了的）不去改
    });
}

// 编辑中的卡片展开后可能很高，且位于分组滚动区内：展开 / 新建后把它滚进可视范围（滚动区内、再到整页）。
function revealEditingCard() {
    document.querySelector('#nd_char_list .char-card.editing')?.scrollIntoView?.({ block: 'nearest' });
}

// 保存 / 取消后编辑表单收起，卡片从很高变回一行，原来的滚动位置可能让它落到可视区外：把它滚回来（已不在列表里则什么也不做）。
function revealCharCard(id) {
    const card = Array.from(document.querySelectorAll('#nd_char_list .char-card')).find(node => node.dataset.id === id);
    card?.scrollIntoView?.({ block: 'nearest' });
}

// 角色卡摘要里的“关闭”标签：所在分组关闭优先显示“分组已关闭”（此时角色自己的开关仍可点），其次才是自己关闭的“停用”。
function characterOffLabel(char, library = getCharacterLibrary()) {
    if (isCharacterGroupClosed(char, library)) return '分组已关闭';
    return char.enabled === false ? '停用' : '';
}

function renderCharList() {
    const list = $('nd_char_list');
    const empty = $('nd_char_empty');
    captureEditingDraft();
    reconcileEditingState();
    const chars = state.characterTags || [];
    const groups = state.characterGroups || [];
    const filteredChars = getFilteredCharacters(chars);

    updateCharacterPanelMeta(chars, filteredChars);
    pruneSelection();
    renderBatchBar();

    // 空状态只在“既没有角色也没有分组”时出现：有分组但还没有角色时要渲染出空分组（可重命名 / 删除 / 组内添加 / 作为拖拽目标）。
    if (!chars.length && !groups.length) {
        list.innerHTML = '';
        list.style.display = 'none';
        empty.classList.remove('filtered');
        empty.innerHTML = `
            <i class="fa-solid fa-user-plus"></i>
            <strong>暂无角色配置</strong>
            <p>点击左侧“添加角色”，开始建立你的角色标签库</p>
        `;
        empty.style.display = 'block';
        return;
    }

    if (!filteredChars.length && (chars.length || charFiltersActive())) {
        list.innerHTML = '';
        list.style.display = 'none';
        empty.classList.add('filtered');
        empty.innerHTML = `
            <i class="fa-solid fa-filter-circle-xmark"></i>
            <strong>没有匹配的角色</strong>
            <p>试试调整搜索关键词或重置筛选条件</p>
        `;
        empty.style.display = 'block';
        return;
    }
    
    list.style.display = 'flex';
    empty.style.display = 'none';
    empty.classList.remove('filtered');
    
    const renderLibrary = getCharacterLibrary();
    const renderCard = c => {
        const isEditing = editingCharId === c.id;
        const isEnabled = c.enabled !== false;
        const groupClosed = isCharacterGroupClosed(c, renderLibrary);
        const charId = escapeHtml(c.id);
        const charName = escapeHtml(c.name || '新角色');
        const typeLabel = CHARACTER_TYPES.find(t => t.value === c.type)?.label || c.type || 'girl';
        const typeShort = typeLabel.split(' ')[0];
        const appearance = c.appearance || '';
        const outfits = normalizeNamedTagListForUI(c.outfits);
        const dynamicStates = normalizeNamedTagListForUI(c.dynamicStates);
        const statusParts = [];
        const offLabel = characterOffLabel(c, renderLibrary);
        if (offLabel) statusParts.push(offLabel);
        if (appearance) statusParts.push('固定外貌');
        if (c.negativeTags) statusParts.push('负向');
        if (c.danbooruTag) statusParts.push('DB');
        if (outfits.length) statusParts.push('服装');
        if (dynamicStates.length) statusParts.push('动态外貌');
        const toggleTitle = isEnabled ? '停用角色' : '启用角色';
        const canDrag = !!CL && !charFiltersActive() && !isEditing;
        const summary = `
            <div class="char-card-summary">
                ${canDrag ? `<span class="char-drag-handle" role="button" tabindex="0" data-drag-char="${charId}" title="拖动排序，也可聚焦后按 ↑ / ↓" aria-label="拖动排序 ${charName}">⋮⋮</span>` : ''}
                ${charSelectMode && !draftCharacters.has(c.id) ? `<input type="checkbox" class="char-select" data-select-char="${charId}" aria-label="选择 ${charName}">` : ''}
                <div class="char-identity">
                    <span class="char-name">${charName}</span>
                    <span class="char-type-badge">${escapeHtml(typeShort)}</span>
                </div>
                <span class="char-status">${statusParts.join(' · ')}</span>
                <div class="char-actions" aria-label="角色操作">
                    <button type="button" class="char-action-button char-enabled-control${isEnabled ? ' active' : ''}" data-action="toggle-enabled" data-id="${charId}" title="${toggleTitle}" aria-label="${toggleTitle} ${charName}" aria-pressed="${isEnabled}">${renderCharacterActionIcon(isEnabled ? 'enabled' : 'disabled')}</button>
                    <button type="button" class="char-action-button${isEditing ? ' active' : ''}" data-action="edit" data-id="${charId}" title="编辑" aria-label="编辑 ${charName}">${renderCharacterActionIcon('edit')}</button>
                    <button type="button" class="char-action-button" data-action="duplicate" data-id="${charId}" title="复制人设" aria-label="复制 ${charName}"><i class="fa-solid fa-clone"></i></button>
                    <button type="button" class="char-action-button" data-action="delete" data-id="${charId}" title="删除" aria-label="删除 ${charName}">${renderCharacterActionIcon('delete')}</button>
                </div>
            </div>`;

        if (isEditing) {
            // 重绘前读回的未保存输入（见 captureEditingDraft）优先于已保存的值。
            const draft = editingDraft && editingDraft.id === c.id ? editingDraft : null;
            // 分组下拉框：用户改动过就沿用草稿里的选择；该分组已被删除则回落为“未分组”。
            const draftTouchedGroup = !!draft && draft.groupId !== undefined && draft.groupId !== draft.groupBase;
            const wantedGroupId = draftTouchedGroup ? draft.groupId : (c.groupId || '');
            const selectedGroupId = (state.characterGroups || []).some(g => g.id === wantedGroupId) ? wantedGroupId : '';
            const groupSelectHtml = CL && (state.characterGroups || []).length
                ? `<div class="form-group"><label class="form-label">所属分组</label><select class="input char-edit-group" data-saved-group="${escapeHtml(c.groupId || '')}"><option value=""${selectedGroupId === '' ? ' selected' : ''}>未分组</option>${state.characterGroups.map(g => `<option value="${escapeHtml(g.id)}"${g.id === selectedGroupId ? ' selected' : ''}>${escapeHtml(g.name)}</option>`).join('')}</select></div>`
                : '';
            const savedType = c.type || 'girl';
            const selectedType = draft ? draft.type : normalizeCharType(savedType);
            const customTypeValue = draft ? draft.typeCustom : (selectedType === 'custom' ? savedType : '');
            const formName = draft ? draft.name : (c.name || '');
            const formAliases = draft ? draft.aliases : (c.aliases || []).join(', ');
            const formAppearance = draft ? draft.appearance : appearance;
            const formNegative = draft ? draft.negativeTags : (c.negativeTags || '');
            const formOutfits = draft ? draft.outfits : outfits;
            const formDynamicStates = draft ? draft.dynamicStates : dynamicStates;
            const typeOptions = CHARACTER_TYPES.map(t =>
                `<option value="${t.value}"${t.value === selectedType ? ' selected' : ''}>${t.label}</option>`
            ).join('');

            return `
            <div class="char-card editing${isEnabled ? '' : ' disabled'}${groupClosed ? ' group-closed' : ''}" data-id="${charId}">
                ${summary}
                <div class="char-edit-form">
                    <div class="char-edit-row">
                        <div class="form-group">
                            <label class="form-label">角色名称</label>
                            <input type="text" class="input char-edit-name" value="${escapeHtml(formName)}" placeholder="角色名称">
                        </div>
                        <div class="form-group">
                            <label class="form-label">类型</label>
                            <select class="input char-edit-type">${typeOptions}</select>
                            <input type="text" class="input char-edit-type-custom${selectedType === 'custom' ? '' : ' hidden'}" value="${escapeHtml(customTypeValue)}" placeholder="如: mature female" style="margin-top:4px;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">别名（逗号分隔）</label>
                        <input type="text" class="input char-edit-aliases" value="${escapeHtml(formAliases)}" placeholder="小名, 昵称, ...">
                    </div>
                    ${groupSelectHtml}
                    <div class="form-group">
                        <label class="form-label" style="display:flex;align-items:center;gap:8px;">
                            固定外貌 (appearance)
                            <button class="btn" data-action="search-danbooru" data-id="${charId}" style="padding:2px 8px;font-size:10px;"${!state.danbooruLocalDB ? ' disabled style="opacity:0.3"' : ''}>
                                <i class="fa-solid fa-magnifying-glass"></i> Danbooru
                            </button>
                        </label>
                        <textarea class="input char-edit-appearance" placeholder="long hair, blue eyes, white dress">${escapeHtml(formAppearance)}</textarea>
                        ${c.danbooruTag ? `<div class="form-hint" style="font-size:10px;color:var(--text-muted);margin:2px 0;">Danbooru: ${escapeHtml(c.danbooruTag.replace(/_/g, ' '))}</div>` : ''}
                        <div class="danbooru-panel hidden" data-char-id="${charId}"></div>
                        <p class="form-hint">静态外貌描述，LLM 只需补充动作</p>
                    </div>
                    <div class="form-group">
                        <label class="form-label">负向标签（可选）</label>
                        <textarea class="input char-edit-neg" placeholder="避免的特征...">${escapeHtml(formNegative)}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                            <span>服装列表（可选）</span>
                            <button class="btn btn-sm" type="button" data-action="add-outfit" data-id="${charId}"><i class="fa-solid fa-plus"></i> 添加服装</button>
                        </label>
                        <div class="char-outfit-editor-list">
                            <div class="char-outfit-editor-empty"${formOutfits.length ? ' style="display:none;"' : ''}>未配置服装时可留空；添加后会在生图规划时作为服装参考发送给 AI，由 AI 自行选择并按剧情改写当前服装 TAG。</div>
                            ${formOutfits.map((outfit, index) => renderNamedTagEditorItem(outfit, index, 'outfit')).join('')}
                        </div>
                        <p class="form-hint">示例：常服 / white shirt, pleated skirt；礼服 / evening dress, lace gloves</p>
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                            <span>动态外貌（可选）</span>
                            <button class="btn btn-sm" type="button" data-action="add-dynstate" data-id="${charId}"><i class="fa-solid fa-plus"></i> 添加状态</button>
                        </label>
                        <div class="char-dynstate-editor-list">
                            <div class="char-dynstate-editor-empty"${formDynamicStates.length ? ' style="display:none;"' : ''}>同服装，会随剧情变化的外观状态（如眼睛颜色——闭眼时不应出现），供 AI 参考按场景选用。</div>
                            ${formDynamicStates.map((item, index) => renderNamedTagEditorItem(item, index, 'dynstate')).join('')}
                        </div>
                        <p class="form-hint">示例：睡觉 / closed eyes, sleeping；害羞 / blush, embarrassed, looking away</p>
                    </div>
                    <div class="btn-group" style="margin-top:12px;">
                        <button class="btn btn-primary" data-action="save" data-id="${charId}"><i class="fa-solid fa-check"></i> 保存</button>
                        <button class="btn" data-action="cancel" data-id="${charId}">取消</button>
                    </div>
                </div>
            </div>`;
        }

        return `
        <div class="char-card${isEnabled ? '' : ' disabled'}${groupClosed ? ' group-closed' : ''}" data-id="${charId}">
            ${summary}
        </div>`;
    };
    const groupScroll = captureGroupScroll(list);
    list.innerHTML = DOMPurify.sanitize(renderGroupedCharacterSections(filteredChars, renderCard));
    restoreGroupScroll(list, groupScroll);

    list.querySelectorAll('.char-edit-type').forEach(sel => {
        sel.addEventListener('change', function() {
            const customInput = this.closest('.char-edit-form').querySelector('.char-edit-type-custom');
            if (customInput) customInput.classList.toggle('hidden', this.value !== 'custom');
        });
    });

    list.querySelectorAll('.char-outfit-editor-list').forEach(item => syncNamedTagEditorList(item, 'outfit'));
    list.querySelectorAll('.char-dynstate-editor-list').forEach(item => syncNamedTagEditorList(item, 'dynstate'));
    syncSelectionCheckboxes();
}

function handleCharAction(action, id, card, trigger) {
    if (action === 'toggle-enabled') {
        const char = state.characterTags.find(c => c.id === id);
        if (!char) return;
        char.enabled = char.enabled === false;
        saveCharacterLibrary();
        card?.classList.toggle('disabled', !char.enabled);
        const status = card?.querySelector('.char-status');
        if (status) {
            const parts = status.textContent.split(' · ').filter(part => part && part !== '停用' && part !== '分组已关闭');
            const offLabel = characterOffLabel(char);
            if (offLabel) parts.unshift(offLabel);
            status.textContent = parts.join(' · ');
        }
        if (trigger) {
            const toggleTitle = char.enabled ? '停用角色' : '启用角色';
            trigger.classList.toggle('active', char.enabled);
            trigger.title = toggleTitle;
            trigger.setAttribute('aria-label', `${toggleTitle} ${char.name || '新角色'}`);
            trigger.setAttribute('aria-pressed', String(char.enabled));
            trigger.innerHTML = DOMPurify.sanitize(renderCharacterActionIcon(char.enabled ? 'enabled' : 'disabled'));
        }
        refreshEnabledSummary();
    } else if (action === 'add-outfit' || action === 'add-dynstate') {
        const kind = action === 'add-outfit' ? 'outfit' : 'dynstate';
        const meta = NAMED_TAG_EDITOR_KINDS[kind];
        const list = card?.querySelector(`.${meta.classPrefix}-editor-list`);
        if (!list) return;
        list.insertAdjacentHTML('beforeend', DOMPurify.sanitize(renderNamedTagEditorItem({}, list.querySelectorAll(`.${meta.classPrefix}-editor-item`).length, kind)));
        syncNamedTagEditorList(list, kind);
    } else if (action === 'remove-outfit' || action === 'remove-dynstate') {
        const kind = action === 'remove-outfit' ? 'outfit' : 'dynstate';
        const meta = NAMED_TAG_EDITOR_KINDS[kind];
        const row = trigger?.closest(`.${meta.classPrefix}-editor-item`);
        const list = row?.closest(`.${meta.classPrefix}-editor-list`);
        row?.remove();
        syncNamedTagEditorList(list, kind);
    } else if (action === 'search-danbooru') {
        if (!state.danbooruLocalDB) { alert('请先启用 Danbooru 本地资源库'); return; }
        showLocalDanbooruFix(id);
    } else if (action === 'edit') {
        if (editingCharId === id) return;
        editingCharId = id;
        editingDraft = null;
        renderCharList();
        revealEditingCard();
    } else if (action === 'cancel') {
        editingCharId = null;
        editingDraft = null;
        renderCharList(); // 未保存的空白草稿在这里被移除
        revealCharCard(id);
    } else if (action === 'save') {
        const char = state.characterTags.find(c => c.id === id);
        if (!char) return;
        
        const name = card.querySelector('.char-edit-name')?.value?.trim();
        if (!name) { alert('请输入角色名称'); return; }
        
        const typeSelect = card.querySelector('.char-edit-type');
        const typeCustom = card.querySelector('.char-edit-type-custom');
        let type = typeSelect?.value || 'girl';
        if (type === 'custom' && typeCustom?.value?.trim()) type = typeCustom.value.trim();
        
        char.name = name;
        char.type = type;
        char.aliases = (card.querySelector('.char-edit-aliases')?.value || '').split(/[,，]/).map(s => s.trim()).filter(Boolean);
        char.appearance = card.querySelector('.char-edit-appearance')?.value?.trim() || '';
        char.negativeTags = card.querySelector('.char-edit-neg')?.value?.trim() || '';
        char.outfits = collectNamedTagEditorValues(card, 'outfit');
        char.dynamicStates = collectNamedTagEditorValues(card, 'dynstate');

        // 点了“保存”才算真正的角色：从未保存草稿里移出，之后才会随库一起存盘。
        draftCharacters.delete(id);
        editingDraft = null;
        editingCharId = null;
        const nextGroupId = card.querySelector('.char-edit-group')?.value;
        if (CL && nextGroupId !== undefined && nextGroupId !== (char.groupId || '')) {
            runLibraryAction(() => applyCharacterLibrary(CL.moveCharacters(getCharacterLibrary(), [id], { groupId: nextGroupId })));
            revealCharCard(id);
            return;
        }
        saveCharacterLibrary();
        renderCharList();
        revealCharCard(id);
    } else if (action === 'duplicate') {
        if (draftCharacters.has(id)) { alert('请先保存这个新角色，再复制'); return; }
        runLibraryAction(() => {
            const { library } = CL.duplicateCharacters(getCharacterLibrary(), [id]);
            applyCharacterLibrary(library);
        });
    } else if (action === 'delete') {
        if (draftCharacters.has(id)) {
            // 还没保存的新角色：直接放弃，不需要确认，也没有可撤销的内容。
            editingCharId = null;
            editingDraft = null;
            renderCharList();
            return;
        }
        const char = state.characterTags.find(c => c.id === id);
        if (!confirm(`确定删除角色“${char?.name || '未命名角色'}”？`)) return;
        if (CL) {
            runLibraryAction(() => deleteCharactersWithUndo([id], `已删除角色“${char?.name || '未命名角色'}”`));
            return;
        }
        state.characterTags = state.characterTags.filter(c => c.id !== id);
        saveCharacterLibrary();
        renderCharList();
    }
}

// ── Danbooru 搜索（本地 DB）─────────────────────────────────

function showLocalDanbooruFix(charId) {
    const panel = document.querySelector(`.danbooru-panel[data-char-id="${charId}"]`);
    if (!panel) return;

    const char = state.characterTags.find(c => c.id === charId);
    const defaultQuery = char?.danbooruTag || char?.name || '';

    panel.classList.remove('hidden');
    panel.innerHTML = DOMPurify.sanitize(`
        <div class="danbooru-search-row">
            <input type="text" class="input danbooru-query" value="${escapeHtml(defaultQuery)}" placeholder="角色名搜索（本地库）">
            <button class="btn btn-primary danbooru-search-btn"><i class="fa-solid fa-magnifying-glass"></i> 本地搜索</button>
            <button class="btn danbooru-close-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="danbooru-results"></div>
    `);

    const input = panel.querySelector('.danbooru-query');
    const searchBtn = panel.querySelector('.danbooru-search-btn');
    const closeBtn = panel.querySelector('.danbooru-close-btn');

    const doSearch = () => {
        const q = input.value.trim();
        if (!q) return;
        panel.querySelector('.danbooru-results').innerHTML =
            '<div class="danbooru-status"><i class="fa-solid fa-spinner fa-spin"></i> 本地搜索中...</div>';
        postToParent({ type: 'DANBOORU_LOCAL_SEARCH', query: q, charId });
    };

    searchBtn.addEventListener('click', doSearch);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    closeBtn.addEventListener('click', () => {
        panel.classList.add('hidden');
        panel.innerHTML = '';
    });

    if (defaultQuery) doSearch();
}

function renderLocalDanbooruResults(query, results, charId) {
    const panel = document.querySelector(`.danbooru-panel[data-char-id="${charId}"]`);
    if (!panel) return;
    const container = panel.querySelector('.danbooru-results');
    if (!container) return;

    if (!results?.length) {
        container.innerHTML = '<div class="danbooru-status">本地库未找到匹配角色</div>';
        return;
    }

    container.innerHTML = DOMPurify.sanitize(`
        <div class="danbooru-char-list">
            ${results.map(r => {
                const parsed = parseDanbooruCharName(r.name);
                const tagPreview = (r.tags || []).slice(0, 6).map(t => t.replace(/_/g, ' ')).join(', ');
                return `
                <div class="danbooru-char-item local-fix" data-tag="${escapeHtml(r.name)}" data-tags="${escapeHtml(JSON.stringify(r.tags || []))}">
                    <div class="danbooru-char-info">
                        <span class="danbooru-char-name">${escapeHtml(parsed.charName)}</span>
                        ${parsed.series ? `<span class="danbooru-char-series">${escapeHtml(parsed.series)}</span>` : ''}
                    </div>
                    ${tagPreview ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${escapeHtml(tagPreview)}</div>` : ''}
                </div>`;
            }).join('')}
        </div>
    `);

    container.querySelectorAll('.danbooru-char-item.local-fix').forEach(item => {
        item.addEventListener('click', () => {
            const tagName = item.dataset.tag;
            let appearanceTags = [];
            try { appearanceTags = JSON.parse(item.dataset.tags); } catch {}

            const char = state.characterTags.find(c => c.id === charId);
            if (!char) return;

            // 先把表单里其它尚未保存的输入读回草稿：选中 Danbooru 角色后编辑器保持打开、其它输入原样保留
            // （新建且未保存的角色关掉编辑器就等于被丢弃）。
            captureEditingDraft();
            char.danbooruTag = tagName;
            // 用本地库的 tag 替换角色外貌
            if (appearanceTags.length) {
                char.appearance = appearanceTags.map(t => t.replace(/_/g, ' ')).join(', ');
                if (editingDraft && editingDraft.id === charId) editingDraft.appearance = char.appearance;
            }

            saveCharacterLibrary();
            panel.classList.add('hidden');
            panel.innerHTML = '';
            renderCharList();
        });
    });
}

function parseDanbooruCharName(tagName) {
    const match = tagName.match(/^(.+?)_\((.+)\)$/);
    if (match) return { charName: match[1].replace(/_/g, ' '), series: match[2].replace(/_/g, ' ') };
    return { charName: tagName.replace(/_/g, ' '), series: '' };
}

// ═══════════════════════════════════════════════════════════════════════════
// 消息链可视化
// ═══════════════════════════════════════════════════════════════════════════

function renderPromptChain(chain) {
    const container = $('nd_prompt_chain');
    if (!container) return;

    const editableMap = {
        topSystem: 'nd_prompt_system',
        tagGuide: 'nd_prompt_guide',
        sceneRules: 'nd_prompt_format',
    };
    const sectionContent = new Map();
    const getPreviewContent = (key) => {
        const editableId = editableMap[key];
        const content = editableId
            ? ($(editableId)?.value.trim() || '(当前为空，不注入)')
            : (sectionContent.get(key) || '(运行时按本次请求生成)');
        return content.length > 1200 ? `${content.slice(0, 1200)}\n...(已截断)` : content;
    };

    container.innerHTML = DOMPurify.sanitize(chain.map((item, i) => {
        const sections = Array.isArray(item.sections) ? item.sections : [];
        const sectionsHtml = sections.map((section, sectionIndex) => {
            if (typeof section.content === 'string') sectionContent.set(section.key, section.content);
            const sectionVars = (section.variables || []).map(v => `<span>📎 ${escapeHtml(v)}</span>`).join(' ');
            const sectionEdit = section.editable
                ? ' <span class="chain-editable" data-edit-trigger title="可在上方编辑">✏️</span>'
                : '';
            return `
            <div class="chain-section" data-key="${escapeHtml(section.key)}" data-editable-id="${editableMap[section.key] || ''}">
                <div class="chain-section-summary">${sectionIndex + 1}. ${escapeHtml(section.summary)}${sectionEdit}</div>
                ${sectionVars ? `<div class="chain-variables">${sectionVars}</div>` : ''}
                <div class="chain-section-content"></div>
            </div>`;
        }).join('');
        const fields = Array.isArray(item.fields) ? item.fields : [];
        const fieldsHtml = fields.length
            ? `<div class="chain-fields">${fields.map(field => `
                <div class="chain-field">
                    <code>${escapeHtml(field.path)}</code>
                    <span>${escapeHtml(field.description)}</span>
                </div>`).join('')}</div>`
            : '';

        return `
        <div class="chain-item has-sections" data-key="${escapeHtml(item.key)}">
            <span class="chain-role ${item.role}">${item.role}</span>
            <div class="chain-summary">
                <div class="chain-summary-text"><span>${i + 1}. ${escapeHtml(item.summary)}</span></div>
                ${sectionsHtml ? `<div class="chain-sections">${sectionsHtml}</div>` : ''}
                ${fieldsHtml}
            </div>
        </div>`;
    }).join(''));

    container.querySelectorAll('.chain-section').forEach(el => {
        el.addEventListener('click', (event) => {
            event.stopPropagation();
            const preview = el.querySelector('.chain-section-content');
            const isExpanded = el.classList.toggle('expanded');
            if (isExpanded) preview.textContent = getPreviewContent(el.dataset.key);
        });
    });
    container.querySelectorAll('[data-edit-trigger]').forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            event.stopPropagation();
            const editableId = trigger.closest('.chain-section')?.dataset.editableId;
            const target = editableId ? $(editableId) : null;
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                target.focus();
            }
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 画廊
// ═══════════════════════════════════════════════════════════════════════════

// 宿主每次保存/删除图片后都会推一份新的统计；重绘画廊时要保留用户已展开的分组和滚动位置，
// 否则“保存到服务器”之后整个图片管理又全部折叠，得重新展开。
function findScrollParent(node) {
    for (let el = node && node.parentElement; el; el = el.parentElement) {
        const overflowY = getComputedStyle(el).overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) return el;
    }
    return document.scrollingElement || document.documentElement || null;
}

// 不含 totalSize：保存到服务器会丢掉 base64、让体积变小，但图片本身没变，已加载的预览不该因此作废。
// 保存只改变 savedUrl，页面已通过 GALLERY_IMAGE_SAVED 增量更新了本地缓存。
function gallerySignature(entry) {
    if (!entry) return '';
    return [entry.count || 0, entry.latestTimestamp || 0, Object.keys(entry.slots || {}).length].join('|');
}

// 换上新的统计：只丢弃数据已经变了（或已不存在）的角色的预览缓存，其余保留，避免已展开的分组被清空。
function applyGallerySummary(next) {
    const previous = gallerySummary || {};
    gallerySummary = next || {};
    let dropped = false;
    for (const charName of new Set([...Object.keys(loadedCharPreviews), ...galleryPageRequests.keys()])) {
        if (gallerySignature(previous[charName]) === gallerySignature(gallerySummary[charName])) continue;
        invalidateCharacterPreviews(charName);
        // 仍存在的角色保留旧画面，分批收齐先前已加载的范围后再替换。
        if (!gallerySummary[charName]) {
            delete loadedCharPreviews[charName];
            if (modalData.charName === charName) closeGalleryModal();
            disconnectGallerySentinel(charName);
            dropped = true;
        }
    }
    if (dropped) pruneGalleryObjectUrls();
    // 摘要里确实还有别的角色、唯独少了某个：它已被清空，展开记录一并作废。整份摘要为空时不动，
    // 万一是一次占位的空摘要，随后的真实摘要仍能恢复展开。
    if (Object.keys(gallerySummary).length) {
        for (const charName of Array.from(expandedGalleryChars)) {
            if (!gallerySummary[charName]) expandedGalleryChars.delete(charName);
        }
    }
}

function galleryStatsText(charData) {
    const slotCount = Object.keys(charData.slots || {}).length;
    const sizeMB = ((charData.totalSize || 0) / 1024 / 1024).toFixed(2);
    return `${charData.count || 0} 张 · ${slotCount} 组 · ${sizeMB} MB`;
}

function createGallerySection(charName) {
    const section = document.createElement('div');
    section.className = 'gallery-char-section collapsed';
    section.setAttribute('data-char', charName);
    section.innerHTML = DOMPurify.sanitize(`
        <div class="gallery-char-header">
            <div class="gallery-char-avatar">${getCharEmoji(charName)}</div>
            <span class="gallery-char-name">${escapeHtml(charName)}</span>
            <span class="gallery-char-stats"></span>
            <i class="fa-solid fa-chevron-down gallery-char-toggle"></i>
        </div>
        <div class="gallery-slots" data-char="${escapeHtml(charName)}">
            <div class="gallery-loading"><i class="fa-solid fa-spinner fa-spin"></i> 点击展开加载...</div>
        </div>`);
    section.querySelector('.gallery-char-header').addEventListener('click', () => {
        const wasCollapsed = section.classList.contains('collapsed');
        section.classList.toggle('collapsed');
        if (wasCollapsed) expandedGalleryChars.add(charName);
        else expandedGalleryChars.delete(charName);

        if (wasCollapsed) {
            if (!loadedCharPreviews[charName]) {
                section.querySelector('.gallery-slots').innerHTML = '<div class="gallery-loading"><i class="fa-solid fa-spinner fa-spin"></i> 加载中...</div>';
            }
            ensureCharacterPreviews(charName); // 只要第一批（或过期时重新加载）；已加载且没变就什么都不发
        }
    });
    return section;
}

// 就地对账而不是整体重建：已有的角色分组节点原样保留（展开状态、图片、滚动位置都不动），
// 只更新头部统计；新增 / 删除 / 换顺序才动 DOM。需要重新向宿主要预览的分组保留旧图片，等新数据到了再替换，
// 不先换成“加载中”占位（高度塌缩会把滚动位置夹回顶部）。
function renderGalleryView() {
    const container = $('nd_gallery_container');
    const empty = $('nd_gallery_empty');
    const chars = Object.keys(gallerySummary);

    if (!chars.length) {
        container.innerHTML = '';
        container.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    container.style.display = 'block';
    empty.style.display = 'none';

    chars.sort((a, b) => (gallerySummary[b].latestTimestamp || 0) - (gallerySummary[a].latestTimestamp || 0));

    const scroller = findScrollParent(container);
    const scrollTop = scroller ? scroller.scrollTop : 0;
    const stale = new Map(Array.from(container.children)
        .filter(node => node.classList?.contains('gallery-char-section'))
        .map(node => [node.getAttribute('data-char'), node]));
    let structureChanged = false;

    chars.forEach((charName, index) => {
        let section = stale.get(charName);
        const isNew = !section;
        if (isNew) section = createGallerySection(charName);
        stale.delete(charName);
        if (container.children[index] !== section) {
            container.insertBefore(section, container.children[index] || null);
            structureChanged = true;
        }
        section.querySelector('.gallery-char-stats').textContent = galleryStatsText(gallerySummary[charName]);
        const expanded = expandedGalleryChars.has(charName);
        section.classList.toggle('collapsed', !expanded);

        // 新建的分组：缓存还在就直接画（不论是否展开，之后展开才看得到图）；
        // 已展开但没有缓存 / 缓存已过期的分组向宿主要（过期的一次请求重新加载到先前数量），旧节点的图片留着直到新数据到达。
        const entry = loadedCharPreviews[charName];
        if (entry && isNew) renderCharacterSlots(charName);
        if (expanded) {
            if (!entry && isNew) section.querySelector('.gallery-slots').innerHTML = '<div class="gallery-loading"><i class="fa-solid fa-spinner fa-spin"></i> 加载中...</div>';
            ensureCharacterPreviews(charName);
        }
    });
    stale.forEach((section, charName) => { disconnectGallerySentinel(charName); section.remove(); structureChanged = true; });

    // 只有结构真的变了才校正滚动位置；什么都没变时一点都不碰。
    if (structureChanged && scroller) {
        scroller.scrollTop = scrollTop;
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => { if (scroller.scrollTop !== scrollTop) scroller.scrollTop = scrollTop; });
        }
    }
}

// ── 分批加载 ──────────────────────────────────────────────────────────────
// 一个角色可能有上千个图组，不能一次全部载入页面：宿主按“图组”分页（每页 GALLERY_PAGE_SIZE 个，每组只带最新一张），
// 页面往下滚动到底部哨兵时再要下一页并追加渲染；同组的其它版本只在打开大图时按需再要。
// loadedCharPreviews[charName] = {
//   order: [slotId…]（已加载图组，按每组最新图时间倒序，即宿主给的顺序）,
//   slots: { slotId: { images: [最新一张…或全部版本], count: 版本总数, hasSaved, versionsLoaded } },
//   total: 图组总数, hasMore, nextOffset: 下一页的起点（宿主已经消耗的图组数）,
//   stale: 数据已变、等待重新加载（旧内容先留着）, loadError: 最近一次请求失败或超时
// }

function galleryHasIntersectionObserver() {
    return typeof IntersectionObserver === 'function';
}

function getGallerySlotsContainer(charName) {
    return document.querySelector(`.gallery-slots[data-char="${CSS.escape(charName)}"]`);
}

function makeSlotInfo(images, meta) {
    const count = Math.max(Number(meta?.count) || 0, images.length);
    const hasSaved = meta ? !!meta.hasSaved || images.some(img => img.savedUrl) : images.some(img => img.savedUrl);
    return { images, count, hasSaved, versionsLoaded: count <= images.length };
}

// 宿主一页数据 → 图组表。没有 order（旧协议）时按每组最新图时间倒序。
function buildGalleryPage(data) {
    const raw = data.slots && typeof data.slots === 'object' ? data.slots : {};
    const usable = id => Array.isArray(raw[id]) && raw[id].length > 0;
    const order = Array.isArray(data.order)
        ? data.order.filter(usable)
        : Object.keys(raw).filter(usable).sort((a, b) => (raw[b][0]?.timestamp || 0) - (raw[a][0]?.timestamp || 0));
    const meta = data.slotMeta || {};
    const slots = {};
    for (const id of order) slots[id] = makeSlotInfo(raw[id], meta[id]);
    return { order, slots };
}

// 图组按“每组最新图的时间”倒序（宿主给出的 order），画廊卡片与大图左右切换共用这一顺序。
function sortedSlotEntries(entry) {
    return (entry?.order || []).filter(id => entry.slots[id]).map(id => [id, entry.slots[id].images]);
}

// 页面里已无人引用的图片，释放它们的 blob URL（重新加载 / 删除后）。
function pruneGalleryObjectUrls() {
    const keep = new Set();
    const add = img => { if (img?.imgId) keep.add(String(img.imgId)); };
    for (const entry of Object.values(loadedCharPreviews)) {
        for (const info of Object.values(entry.slots || {})) info.images.forEach(add);
    }
    (modalData.images || []).forEach(add);
    for (const [key, url] of Array.from(previewObjectUrls)) {
        if (keep.has(key)) continue;
        try { URL.revokeObjectURL(url); } catch { /* 已失效 */ }
        previewObjectUrls.delete(key);
    }
}

function slotBadgesHtml(info) {
    return `${info.count > 1 ? `<span class="gallery-slot-badge count">${info.count} 版</span>` : ''}${info.hasSaved || info.images.some(img => img.savedUrl) ? '<span class="gallery-slot-badge saved">✓</span>' : ''}`;
}

function slotCardHtml(charName, slotId, info) {
    const latest = info.images[0];
    const imgSrc = getGalleryImageUrl(latest);
    return `
        <div class="gallery-slot" data-slot="${escapeHtml(slotId)}" data-char="${escapeHtml(charName)}">
            <img class="gallery-slot-img" src="${escapeHtml(imgSrc)}" loading="lazy" decoding="async">
            <div class="gallery-slot-overlay">
                <div class="gallery-slot-actions">
                    <button class="btn btn-sm" data-action="view" data-slot="${escapeHtml(slotId)}" data-char="${escapeHtml(charName)}">
                        <i class="fa-solid fa-expand"></i> 查看
                    </button>
                </div>
            </div>
            <div class="gallery-slot-info">
                <span>${new Date(latest.timestamp).toLocaleDateString()}</span>
                <div class="gallery-slot-badges" style="display:flex;gap:4px;">${slotBadgesHtml(info)}</div>
            </div>
        </div>`;
}

function bindSlotCard(card) {
    const open = () => openGalleryModalFromCache(card.dataset.char, card.dataset.slot);
    card.querySelectorAll('[data-action="view"]').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); open(); });
    });
    card.addEventListener('click', e => { if (!e.target.closest('[data-action]')) open(); });
}

function findSlotCard(charName, slotId) {
    const container = getGallerySlotsContainer(charName);
    if (!container) return null;
    return Array.from(container.querySelectorAll('.gallery-slot')).find(node => node.getAttribute('data-slot') === slotId) || null;
}

// 整体渲染：首批 / 数据变化后重新加载。追加走 appendCharacterSlots，不会碰已有节点。
function renderCharacterSlots(charName) {
    const slotsContainer = getGallerySlotsContainer(charName);
    const entry = loadedCharPreviews[charName];
    if (!slotsContainer || !entry) return;
    disconnectGallerySentinel(charName);

    const slotEntries = sortedSlotEntries(entry);
    if (!slotEntries.length) {
        slotsContainer.innerHTML = '<div class="gallery-empty-hint">暂无图片</div>';
        return;
    }
    slotsContainer.innerHTML = DOMPurify.sanitize(slotEntries.map(([slotId]) => slotCardHtml(charName, slotId, entry.slots[slotId])).join(''), GALLERY_HTML_SANITIZE_OPTIONS);
    slotsContainer.querySelectorAll('.gallery-slot').forEach(bindSlotCard);
    syncGallerySentinel(charName);
}

// 追加新一页的卡片：已有卡片节点原样保留，哨兵挪到最后。
function appendCharacterSlots(charName, slotIds) {
    const slotsContainer = getGallerySlotsContainer(charName);
    const entry = loadedCharPreviews[charName];
    if (!slotsContainer || !entry || !slotIds.length) return;
    slotsContainer.querySelectorAll('.gallery-empty-hint, .gallery-end-hint').forEach(node => node.remove());
    const sentinel = slotsContainer.querySelector('.gallery-more');
    const holder = document.createElement('div');
    holder.innerHTML = DOMPurify.sanitize(slotIds.map(slotId => slotCardHtml(charName, slotId, entry.slots[slotId])).join(''), GALLERY_HTML_SANITIZE_OPTIONS);
    Array.from(holder.children).forEach(card => {
        slotsContainer.insertBefore(card, sentinel || null);
        bindSlotCard(card);
    });
    syncGallerySentinel(charName);
}

function rerenderSlotCard(charName, slotId) {
    const info = loadedCharPreviews[charName]?.slots[slotId];
    const card = findSlotCard(charName, slotId);
    if (!info || !card?.parentNode) return;
    const holder = document.createElement('div');
    holder.innerHTML = DOMPurify.sanitize(slotCardHtml(charName, slotId, info), GALLERY_HTML_SANITIZE_OPTIONS);
    const fresh = holder.firstElementChild;
    card.parentNode.replaceChild(fresh, card);
    bindSlotCard(fresh);
}

// 保存只改变某张图的 savedUrl：就地更新所在图组卡片的角标，不重建整个图片网格（避免整片图片重新加载闪一下）。
function refreshSlotBadges(charName, slotId) {
    const info = loadedCharPreviews[charName]?.slots[slotId];
    const badges = findSlotCard(charName, slotId)?.querySelector('.gallery-slot-badges');
    if (info && badges) badges.innerHTML = DOMPurify.sanitize(slotBadgesHtml(info));
}

// ── 往下拉再加载：哨兵 + IntersectionObserver ─────────────────────────────

function disconnectGallerySentinel(charName) {
    const held = gallerySentinelObservers.get(charName);
    if (held) { try { held.observer.disconnect(); } catch { /* 已断开 */ } }
    gallerySentinelObservers.delete(charName);
}

function updateGallerySentinel(charName) {
    const container = getGallerySlotsContainer(charName);
    const entry = loadedCharPreviews[charName];
    const sentinel = container?.querySelector('.gallery-more');
    if (!sentinel || !entry) return;
    const progress = `已加载 ${entry.order.length} / ${Math.max(entry.total, entry.order.length)} 组`;
    if (galleryPageRequests.has(charName)) {
        sentinel.innerHTML = DOMPurify.sanitize(`<i class="fa-solid fa-spinner fa-spin"></i> 加载中…（${progress}）`);
    } else if (entry.loadError) {
        sentinel.innerHTML = '加载失败 <button class="btn btn-sm" type="button" data-action="more">重试</button>';
    } else if (!galleryHasIntersectionObserver()) {
        sentinel.innerHTML = DOMPurify.sanitize(`<button class="btn btn-sm" type="button" data-action="more">加载更多</button> ${progress}`);
    } else {
        sentinel.textContent = `${progress}，向下滚动加载更多`;
    }
}

function observeGallerySentinel(charName, sentinel) {
    if (!galleryHasIntersectionObserver()) return;
    let held = gallerySentinelObservers.get(charName);
    if (!held || held.sentinel !== sentinel) {
        disconnectGallerySentinel(charName);
        const scroller = findScrollParent(sentinel);
        const pageScroller = document.scrollingElement || document.documentElement;
        const options = { rootMargin: '0px 0px 400px 0px', threshold: 0 };
        // 滚动容器是页面里实际的滚动祖先（不是整个视口）；文档本身滚动时用默认根。
        if (scroller && scroller !== pageScroller && scroller !== document.documentElement && scroller !== document.body) options.root = scroller;
        const observer = new IntersectionObserver(items => {
            if (!items.some(item => item.isIntersecting)) return;
            if (loadedCharPreviews[charName]?.loadError) return; // 失败后只由“重试”按钮重试，避免可见时无限重试
            loadMoreCharacterSlots(charName);
        }, options);
        held = { observer, sentinel };
        gallerySentinelObservers.set(charName, held);
    } else {
        held.observer.unobserve(sentinel); // 重新观察：哨兵挪到新卡片后面仍在视口内时也会再触发一次
    }
    held.observer.observe(sentinel);
}

// 保证容器末尾状态正确：还有更多（或失败待重试）→ 一个哨兵；没有更多 → 移除哨兵并显示总数。
function syncGallerySentinel(charName) {
    const container = getGallerySlotsContainer(charName);
    const entry = loadedCharPreviews[charName];
    if (!container || !entry) return;
    let sentinel = container.querySelector('.gallery-more');
    let endHint = container.querySelector('.gallery-end-hint');

    if (!(entry.hasMore || entry.loadError)) {
        sentinel?.remove();
        disconnectGallerySentinel(charName);
        if (entry.total > GALLERY_PAGE_SIZE) {
            if (!endHint) {
                endHint = document.createElement('div');
                endHint.className = 'gallery-end-hint';
            }
            endHint.textContent = `共 ${entry.total} 组`;
            container.appendChild(endHint);
        } else {
            endHint?.remove();
        }
        return;
    }

    endHint?.remove();
    if (!sentinel) {
        sentinel = document.createElement('div');
        sentinel.className = 'gallery-more';
        sentinel.addEventListener('click', e => {
            if (e.target.closest?.('[data-action="more"]')) retryCharacterSlots(charName);
        });
    }
    container.appendChild(sentinel);
    updateGallerySentinel(charName);
    observeGallerySentinel(charName, sentinel);
}

// ── 向宿主要数据（每个角色同一时间只有一个在途请求，15 秒没回视为丢失，可重试）──────────

function invalidateCharacterPreviews(charName) {
    const request = galleryPageRequests.get(charName);
    if (request) clearTimeout(request.timer);
    galleryPageRequests.delete(charName);
    if (loadedCharPreviews[charName]) loadedCharPreviews[charName].stale = true;
    for (const [key, pending] of galleryVersionRequests) {
        if (key.startsWith(`${charName}\n`)) { clearTimeout(pending.timer); galleryVersionRequests.delete(key); }
    }
}

function requestCharacterSlots(charName, { offset, limit, reload = null }) {
    if (galleryPageRequests.has(charName)) return false;
    const request = { requestId: ++galleryRequestSeq, offset, limit, reload, timer: null };
    request.timer = setTimeout(() => failCharacterRequest(charName, request.requestId), GALLERY_REQUEST_TIMEOUT_MS);
    galleryPageRequests.set(charName, request);
    const entry = loadedCharPreviews[charName];
    if (entry) entry.loadError = false;
    postToParent({ type: 'LOAD_CHARACTER_PREVIEWS', charName, offset, limit, requestId: request.requestId });
    updateGallerySentinel(charName);
    renderModalLoadStatus();
    return true;
}

function failCharacterRequest(charName, requestId) {
    const request = galleryPageRequests.get(charName);
    if (!request || request.requestId !== requestId) return;
    clearTimeout(request.timer);
    galleryPageRequests.delete(charName);
    const entry = loadedCharPreviews[charName];
    if (entry) {
        entry.loadError = true;
        syncGallerySentinel(charName);
        renderModalLoadStatus();
        return;
    }
    const container = getGallerySlotsContainer(charName);
    if (!container) return;
    container.innerHTML = '<div class="gallery-loading">加载失败 <button class="btn btn-sm" type="button" data-action="more">重试</button></div>';
    container.querySelector('[data-action="more"]').addEventListener('click', () => {
        container.innerHTML = '<div class="gallery-loading"><i class="fa-solid fa-spinner fa-spin"></i> 加载中...</div>';
        ensureCharacterPreviews(charName);
    });
}

// 刷新也遵守单页上限；临时收齐旧可见范围再替换，失败时仍保留旧卡片。
function ensureCharacterPreviews(charName) {
    const entry = loadedCharPreviews[charName];
    if (!entry) return requestCharacterSlots(charName, { offset: 0, limit: GALLERY_PAGE_SIZE });
    if (!entry.stale) return false;
    const target = Math.max(entry.nextOffset, entry.order.length, 1);
    return requestCharacterSlots(charName, { offset: 0, limit: Math.min(target, GALLERY_PAGE_SIZE),
        reload: { target, order: [], slots: {} } });
}

function loadMoreCharacterSlots(charName) {
    const entry = loadedCharPreviews[charName];
    if (!entry || entry.stale) return ensureCharacterPreviews(charName);
    if (!entry.hasMore) return false;
    return requestCharacterSlots(charName, { offset: entry.nextOffset, limit: GALLERY_PAGE_SIZE });
}

function retryCharacterSlots(charName) {
    const entry = loadedCharPreviews[charName];
    if (entry) entry.loadError = false;
    if (!loadMoreCharacterSlots(charName)) updateGallerySentinel(charName);
}

function handleCharacterPreviewsLoaded(data) {
    const charName = data.charName;
    if (!charName) return;
    const request = galleryPageRequests.get(charName);
    if (!request || request.requestId !== data.requestId) return;
    clearTimeout(request.timer);
    galleryPageRequests.delete(charName);

    const existing = loadedCharPreviews[charName];
    const offset = Math.max(0, Number(data.offset) || 0);
    // 后面几页：数据已变（或缓存已作废）时这一页属于旧数据，丢掉并按新数据重新加载。
    if (offset > 0 && !request.reload && (!existing || existing.stale)) { ensureCharacterPreviews(charName); return; }

    let page = buildGalleryPage(data);
    const total = Number.isFinite(Number(data.total)) ? Number(data.total) : page.order.length;
    const hasMore = data.hasMore === true;
    const nextOffset = Number.isFinite(Number(data.nextOffset)) ? Number(data.nextOffset) : offset + page.order.length;

    if (request.reload) {
        const reload = request.reload;
        for (const id of page.order) {
            if (!reload.slots[id]) reload.order.push(id);
            reload.slots[id] = page.slots[id];
        }
        if (hasMore && nextOffset < reload.target) {
            requestCharacterSlots(charName, { offset: nextOffset, limit: Math.min(GALLERY_PAGE_SIZE, reload.target - nextOffset), reload });
            return;
        }
        page = { order: reload.order, slots: reload.slots };
    }

    // 新数据替换 / 追加时记下滚动位置，万一高度瞬间变化把它夹走了就补回去（同一同步过程内，不会与用户滚动冲突）。
    const gallery = $('nd_gallery_container');
    const scroller = gallery ? findScrollParent(gallery) : null;
    const keepTop = scroller ? scroller.scrollTop : 0;
    const previousModalPosition = galleryModalPosition();

    if (offset > 0 && !request.reload) {
        if (offset > existing.nextOffset) { // 中间缺了一段，不能拼接
            existing.loadError = true;
            syncGallerySentinel(charName);
            return;
        }
        const added = page.order.filter(id => !existing.slots[id]);
        for (const id of added) { existing.order.push(id); existing.slots[id] = page.slots[id]; }
        existing.total = total;
        existing.hasMore = hasMore;
        existing.nextOffset = Math.max(existing.nextOffset, nextOffset);
        existing.loadError = false;
        appendCharacterSlots(charName, added);
        if (!added.length) syncGallerySentinel(charName);
    } else {
        loadedCharPreviews[charName] = { ...page, total, hasMore, nextOffset, stale: false, loadError: false };
        for (const [key, pending] of Array.from(galleryVersionRequests)) {
            if (key.startsWith(`${charName}\n`)) { clearTimeout(pending.timer); galleryVersionRequests.delete(key); }
        }
        renderCharacterSlots(charName);
        pruneGalleryObjectUrls();
    }
    if (scroller && scroller.scrollTop !== keepTop) scroller.scrollTop = keepTop;

    // 重排后当前组可能已移出加载范围：停在原位置的有效组，不为定位旧组读取整库。
    if (modalData.charName === charName) {
        const entry = loadedCharPreviews[charName];
        const info = entry.slots[modalData.slotId];
        if (!info) {
            const slotId = entry.order[Math.min(previousModalPosition?.index ?? 0, entry.order.length - 1)];
            if (slotId) openGalleryModalFromCache(charName, slotId);
            else closeGalleryModal();
            return;
        }
        if (request.reload || offset === 0) {
            const currentId = modalData.images[modalData.currentIndex]?.imgId;
            modalData.images = info.images;
            modalData.currentIndex = Math.max(0, info.images.findIndex(img => img.imgId === currentId));
            renderModalThumbs();
        }
        renderModalContent();
        requestSlotVersions(charName, modalData.slotId);
    }
}

// ── 版本按需加载 ──────────────────────────────────────────────────────────

function requestSlotVersions(charName, slotId) {
    const info = loadedCharPreviews[charName]?.slots[slotId];
    if (!info || info.versionsLoaded || info.count <= 1) return false;
    const key = `${charName}\n${slotId}`;
    if (galleryVersionRequests.has(key)) return false;
    const requestId = ++galleryRequestSeq;
    const timer = setTimeout(() => failSlotVersionsRequest(charName, slotId, requestId), GALLERY_REQUEST_TIMEOUT_MS);
    info.versionsError = false;
    galleryVersionRequests.set(key, { requestId, timer });
    postToParent({ type: 'LOAD_SLOT_VERSIONS', charName, slotId, requestId });
    renderModalLoadStatus();
    return true;
}

function settleSlotVersionsRequest(charName, slotId, requestId) {
    const key = `${charName}\n${slotId}`;
    const pending = galleryVersionRequests.get(key);
    if (!pending || pending.requestId !== requestId) return false;
    clearTimeout(pending.timer);
    galleryVersionRequests.delete(key);
    return true;
}

function handleSlotVersionsLoaded(data) {
    const { charName, slotId } = data;
    if (!settleSlotVersionsRequest(charName, slotId, data.requestId)) return;
    const info = loadedCharPreviews[charName]?.slots[slotId];
    const incoming = (Array.isArray(data.images) ? data.images : []).filter(img => img && img.imgId);
    if (!info) return;
    if (!incoming.length) {
        info.versionsError = true;
        renderModalLoadStatus();
        return;
    }
    const known = new Map(info.images.map(img => [img.imgId, img]));
    info.images = incoming.map(img => known.get(img.imgId) || img);
    info.count = info.images.length;
    info.hasSaved = info.images.some(img => img.savedUrl);
    info.versionsLoaded = true;
    info.versionsError = false;
    refreshSlotBadges(charName, slotId);
    if (modalData.charName === charName && modalData.slotId === slotId) {
        const currentId = modalData.images[modalData.currentIndex]?.imgId;
        modalData.images = info.images;
        const index = info.images.findIndex(img => img.imgId === currentId);
        modalData.currentIndex = index >= 0 ? index : 0;
        renderModalThumbs();
        renderModalContent();
    }
}

function failSlotVersionsRequest(charName, slotId, requestId) {
    if (!settleSlotVersionsRequest(charName, slotId, requestId)) return;
    const info = loadedCharPreviews[charName]?.slots[slotId];
    if (info) info.versionsError = true;
    renderModalLoadStatus();
}

function renderModalLoadStatus() {
    const status = $('nd_modal_load_status');
    const { charName, slotId } = modalData;
    const entry = loadedCharPreviews[charName];
    const info = entry?.slots[slotId];
    const position = galleryModalPosition();
    const pageFailed = entry?.loadError && (entry.stale || position?.index === position?.loaded - 1);
    const versionsLoading = galleryVersionRequests.has(`${charName}\n${slotId}`);
    const retry = pageFailed ? 'page' : info?.versionsError ? 'versions' : '';
    const message = pageFailed ? GALLERY_LOAD_COPY.pageFailed : info?.versionsError ? GALLERY_LOAD_COPY.versionsFailed
        : versionsLoading ? GALLERY_LOAD_COPY.versionsLoading : '';
    status.hidden = !message;
    status.dataset.state = retry ? 'error' : versionsLoading ? 'loading' : 'idle';
    status.innerHTML = DOMPurify.sanitize(escapeHtml(message) + (retry
        ? ` <button class="btn btn-sm" type="button" data-retry="${retry}">${GALLERY_LOAD_COPY.retry}</button>` : ''));
}

// ── 大图 ──────────────────────────────────────────────────────────────────

function openGalleryModalFromCache(charName, slotId) {
    const info = loadedCharPreviews[charName]?.slots[slotId];
    if (!info) return;
    modalData = { slotId, images: info.images, currentIndex: 0, charName };
    renderModalThumbs();
    renderModalContent();
    $('nd_gallery_modal').classList.add('visible');
    requestSlotVersions(charName, slotId);
    prefetchNextWhenAtLoadedEnd();
}

function closeGalleryModal() {
    $('nd_gallery_modal').classList.remove('visible');
    $('nd_modal_img').removeAttribute('data-img-id');
    modalData = { slotId: null, images: [], currentIndex: 0, charName: null };
}

function renderModalThumbs() {
    const { images, currentIndex } = modalData;
    if (!images.length) return;
    $('nd_modal_thumbs').innerHTML = DOMPurify.sanitize(images.map((img, i) => {
        const src = getGalleryImageUrl(img);
        const cls = ['gallery-modal-thumb'];
        if (i === currentIndex) cls.push('active');
        if (img.savedUrl) cls.push('saved');
        return `<img class="${cls.join(' ')}" src="${escapeHtml(src)}" data-index="${i}">`;
    }).join(''), GALLERY_HTML_SANITIZE_OPTIONS);

    $('nd_modal_thumbs').querySelectorAll('img').forEach(t => {
        t.addEventListener('click', () => { modalData.currentIndex = parseInt(t.dataset.index); renderModalContent(); });
    });
}

function updateModalThumbState() {
    $('nd_modal_thumbs').querySelectorAll('img').forEach(t => {
        const index = parseInt(t.dataset.index);
        const active = index === modalData.currentIndex;
        t.classList.toggle('active', active);
        t.classList.toggle('saved', !!modalData.images[index]?.savedUrl);
        if (active) t.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    });
}

// 当前图组在本角色已加载图组里的位置（顺序与画廊卡片一致）；total 是该角色图组总数（可能多于已加载的）。预览缓存缺失时返回 null。
function galleryModalPosition() {
    const entry = modalData.charName ? loadedCharPreviews[modalData.charName] : null;
    if (!entry || !modalData.slotId) return null;
    const entries = sortedSlotEntries(entry);
    const index = entries.findIndex(([slotId]) => slotId === modalData.slotId);
    return index < 0 ? null : { entries, index, loaded: entries.length, total: Math.max(entry.total, entries.length), hasMore: entry.hasMore };
}

// 走到已加载的最后一个图组、且宿主还有更多：自动要下一批，到了之后“下一张”才可继续。
function prefetchNextWhenAtLoadedEnd() {
    const position = galleryModalPosition();
    if (position && position.hasMore && position.index >= position.loaded - 1) {
        loadMoreCharacterSlots(modalData.charName);
        renderModalContent();
    }
}

// 在同一角色的图组之间前后切换：切到相邻图组的最新版本，该组的其它版本在需要时按需加载。
function stepGallerySlot(delta) {
    const position = galleryModalPosition();
    const target = position?.entries[position.index + delta];
    if (!target || !target[1].length) return;
    modalData = { slotId: target[0], images: target[1], currentIndex: 0, charName: modalData.charName };
    renderModalThumbs();
    renderModalContent();
    requestSlotVersions(modalData.charName, target[0]);
    prefetchNextWhenAtLoadedEnd();
}

function renderModalContent() {
    renderModalLoadStatus();
    const { images, currentIndex } = modalData;
    if (!images.length) return;
    const current = images[currentIndex];
    // 同一张图（例如保存后 savedUrl 变了）不重设 src，避免大图重新加载闪一下。
    const imgEl = $('nd_modal_img');
    const imgKey = String(current.imgId ?? '');
    if (!imgKey || imgEl.getAttribute('data-img-id') !== imgKey) {
        imgEl.src = getGalleryImageUrl(current);
        imgEl.setAttribute('data-img-id', imgKey);
    }
    updateModalThumbState();

    const position = galleryModalPosition();
    $('nd_modal_prev').disabled = !position || position.index <= 0;
    $('nd_modal_next').disabled = !position || position.index >= position.loaded - 1;

    const saveBtn = $('nd_modal_save');
    if (current.savedUrl) {
        saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> 已保存';
        saveBtn.disabled = true;
    } else {
        saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 保存到服务器';
        saveBtn.disabled = false;
    }

    const loadingMore = position && position.index >= position.loaded - 1 && galleryPageRequests.has(modalData.charName);
    const slotText = position && position.total > 1 ? `图组 ${position.index + 1} / ${position.total}${loadingMore ? '（加载更多中…）' : ''} · ` : '';
    // 版本总数以图组统计为准：版本列表还没回来时，缩略图条只有最新一张，但总数已知。
    const versionTotal = Math.max(images.length, loadedCharPreviews[modalData.charName]?.slots[modalData.slotId]?.count || 0);
    $('nd_modal_info').textContent = `${slotText}版本 ${currentIndex + 1} / ${versionTotal} · ${new Date(current.timestamp).toLocaleString()}`;
}

// 删除一张图后的本地处理：移除对应的图组 / 版本，并让随后到的 CACHE_DATA（张数少一）不被当成“数据变了”而整体重载。
function applyGalleryImageDeleted(imgId) {
    const charName = modalData.charName;
    const entry = charName ? loadedCharPreviews[charName] : null;
    if (!entry) return;
    const slotId = entry.order.find(id => entry.slots[id].images.some(img => img.imgId === imgId));
    if (slotId === undefined) return;
    const info = entry.slots[slotId];
    const latestDeleted = info.images[0]?.imgId === imgId;
    const pendingVersions = galleryVersionRequests.get(`${charName}\n${slotId}`);
    if (pendingVersions) settleSlotVersionsRequest(charName, slotId, pendingVersions.requestId);
    info.images = info.images.filter(img => img.imgId !== imgId);
    info.count = Math.max(0, info.count - 1);
    const slotGone = info.count === 0;
    // 最新版本决定图组排序；旧 offset 和在途页面都不再对应同一段数据。
    if ((!slotGone && latestDeleted) || galleryPageRequests.has(charName)) invalidateCharacterPreviews(charName);

    const summary = gallerySummary[charName];
    if (summary) {
        summary.count = Math.max(0, (summary.count || 0) - 1);
        if (slotGone) delete summary.slots?.[slotId];
        else if (summary.slots?.[slotId]) summary.slots[slotId].count = Math.max(0, (summary.slots[slotId].count || 0) - 1);
        // 删掉的若是全角色最新的一张，新的“最新时间”未知：latestTimestamp 保持原样，随后的 CACHE_DATA 会触发重新加载。
    }

    if (slotGone) {
        entry.order = entry.order.filter(id => id !== slotId);
        delete entry.slots[slotId];
        entry.total = Math.max(0, entry.total - 1);
        entry.nextOffset = Math.max(0, entry.nextOffset - 1);
        findSlotCard(charName, slotId)?.remove();
        if (!entry.order.length && !entry.hasMore) {
            delete loadedCharPreviews[charName];
            delete gallerySummary[charName];
            expandedGalleryChars.delete(charName);
            disconnectGallerySentinel(charName);
            renderGalleryView();
        } else {
            syncGallerySentinel(charName); // 补页：还有更多且哨兵仍在视口内时，重新观察会再触发加载
        }
    } else if (!info.images.length) {
        entry.stale = true; // 最新一张没了、其余版本还没加载：只能重新加载这个角色
    } else {
        info.hasSaved = info.images.some(img => img.savedUrl);
        rerenderSlotCard(charName, slotId);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 提示词模板始终可见
// ═══════════════════════════════════════════════════════════════════════════

function applyAdvancedMode() {
    state.advancedMode = true;
    document.body.classList.add('advanced-mode');

    // 世界书
    const wb = state.worldbooks || {};
    $('nd_use_worldinfo').checked = state.useWorldInfo === true;
    $('nd_wb_enabled').checked = wb.enabled === true;
    $('nd_wb_filter_mode').value = wb.keywordFilterMode || 'auto';
    renderUploadedBooks(wb.uploadedBooks || []);
}

/** 解析上传的世界书 JSON 文件 */
function parseWorldbookJson(jsonText, fileName) {
    const data = JSON.parse(jsonText);
    if (!data.entries || typeof data.entries !== 'object') {
        throw new Error('不是有效的世界书文件（缺少 entries 字段）');
    }
    const rawEntries = data.entries;
    const entries = [];
    for (const [uid, e] of Object.entries(rawEntries)) {
        if (!e || typeof e !== 'object') continue;
        const content = (e.content || '').trim();
        if (!content) continue;
        entries.push({
            uid: Number(uid),
            comment: e.comment || '',
            key: Array.isArray(e.key) ? e.key : (e.key ? [e.key] : []),
            keysecondary: Array.isArray(e.keysecondary) ? e.keysecondary : [],
            constant: !!e.constant,
            disable: !!e.disable,
            content,
            order: e.order ?? 100,
        });
    }
    if (!entries.length) throw new Error('世界书中无有效条目（所有条目缺少 content）');
    return { name: fileName, uploadedAt: Date.now(), entries };
}

/** 处理文件上传（支持多选） */
async function handleWorldbookFiles(files) {
    const uploaded = state.worldbooks?.uploadedBooks || [];
    let added = 0;
    const errors = [];

    for (const file of files) {
        if (!file.name.endsWith('.json')) {
            errors.push(`${file.name}: 不是 .json 文件`);
            continue;
        }
        try {
            const text = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error);
                reader.readAsText(file);
            });
            const book = parseWorldbookJson(text, file.name);
            // 同名替换
            const idx = uploaded.findIndex(b => b.name === book.name);
            if (idx >= 0) uploaded[idx] = book;
            else uploaded.push(book);
            added++;
        } catch (e) {
            errors.push(`${file.name}: ${e.message}`);
        }
    }

    if (added > 0) {
        state.worldbooks = { ...state.worldbooks, uploadedBooks: uploaded };
        renderUploadedBooks(uploaded);
        updateStatus($('nd_wb_status'), 'success', `已读取 ${added} 个世界书，请点击保存配置`);
    }

    if (errors.length) {
        const container = $('nd_wb_entries');
        container.innerHTML = DOMPurify.sanitize(`<p class="form-hint" style="color:var(--danger);">${errors.map(escapeHtml).join('<br>')}</p>`);
        updateStatus($('nd_wb_status'), 'error', `有 ${errors.length} 个文件读取失败`);
    }
}

function renderUploadedBooks(books) {
    const container = $('nd_wb_uploaded_list');
    if (!books.length) {
        container.innerHTML = '<p class="form-hint">尚未上传世界书</p>';
        return;
    }
    container.innerHTML = DOMPurify.sanitize(books.map((b, i) => {
        const activeCount = b.entries.filter(e => !e.disable).length;
        return `<div class="wb-book-item" data-index="${i}">
            <span class="wb-book-name">${escapeHtml(b.name)}</span>
            <span class="wb-book-count">${activeCount}/${b.entries.length} 条目</span>
            <button class="wb-book-delete" data-index="${i}" title="移除"><i class="fa-solid fa-xmark"></i></button>
        </div>`;
    }).join(''));

    // 点击预览条目
    container.querySelectorAll('.wb-book-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.wb-book-delete')) return;
            const idx = Number(item.dataset.index);
            const book = books[idx];
            if (book) renderWorldbookEntriesLocal(book);
        });
    });

    // 删除按钮
    container.querySelectorAll('.wb-book-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = Number(btn.dataset.index);
            const uploaded = state.worldbooks?.uploadedBooks || [];
            uploaded.splice(idx, 1);
            state.worldbooks = { ...state.worldbooks, uploadedBooks: uploaded };
            renderUploadedBooks(uploaded);
            $('nd_wb_entries').innerHTML = '<p class="form-hint">请先上传世界书</p>';
            updateStatus($('nd_wb_status'), '', '已移除，请点击保存配置');
        });
    });
}

function renderLastLlmRequest(snapshot) {
    const preview = $('nd_llm_request_preview');
    if (!preview) return;
    preview.textContent = snapshot
        ? JSON.stringify(snapshot, null, 2)
        : '暂无请求记录，请先触发一次画图分析。';
}

function renderWorldbookEntriesLocal(book) {
    const container = $('nd_wb_entries');
    const entries = book.entries || [];
    if (!entries.length) {
        container.innerHTML = DOMPurify.sanitize(`<p class="form-hint">${escapeHtml(book.name)}: 无条目</p>`);
        return;
    }
    const lampIcon = { constant: 'constant', normal: 'normal', disabled: 'disabled' };
    const lampLabel = { constant: '常驻', normal: '关键词触发', disabled: '已禁用' };
    container.innerHTML = DOMPurify.sanitize(`<p class="form-hint" style="margin-bottom:8px;">${escapeHtml(book.name)} (${entries.length} 条)</p>` +
        entries.map(e => {
            let ls = 'normal';
            if (e.disable) ls = 'disabled';
            else if (e.constant) ls = 'constant';
            const keys = (e.key || []).filter(Boolean).join(', ');
            return `<div class="wb-entry-item">
                <div class="wb-lamp ${lampIcon[ls]}" title="${lampLabel[ls]}"></div>
                <div class="wb-entry-info">
                    <div class="wb-entry-title">${escapeHtml(e.comment || '(未命名)')}</div>
                    ${keys ? `<div class="wb-entry-keys">关键词: ${escapeHtml(keys)}</div>` : ''}
                    <div class="wb-entry-preview">${escapeHtml((e.content || '').slice(0, 200))}</div>
                </div>
            </div>`;
        }).join(''));
}

// ═══════════════════════════════════════════════════════════════════════════
// 预设与设置
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// API 配置预设
// ═══════════════════════════════════════════════════════════════════════════
// 预设栏组件在 shared/api-presets-ui.js（纯函数在 api-presets.js），宿主（novel-draw.js）负责规范化与落盘。
// 预设里含 API Key：与 apiKey 同样只存本地，这里不把它写进日志 / 提示。

let AP_UI = null;
let apiPresetBar = null;
let apiSettingsReady = false;
let apiSavePending = null;
let apiSaveSequence = 0;
const API_SAVE_SLOW_MS = 15000;

function readApiConfigFromForm() {
    return normalizeNovelApiConfig({
        apiKey: $('nd_api_key').value,
        apiBaseUrl: $('nd_api_base_url').value,
        sendMode: getSendMode(),
        useImageBackendJobs: $('nd_use_backend_jobs').checked,
        insecureTLS: $('nd_insecure_tls').checked,
        timeout: Number($('nd_timeout').value) * 1000,
        requestDelay: parseDelay($('nd_delay').value),
    });
}

function getEffectiveApiConfig() {
    return normalizeNovelApiConfig(state);
}

function fillApiConfigForm(config) {
    const next = normalizeNovelApiConfig(config);
    $('nd_api_key').value = next.apiKey;
    $('nd_api_base_url').value = next.apiBaseUrl;
    $('nd_use_backend_jobs').checked = next.useImageBackendJobs;
    $('nd_insecure_tls').checked = next.insecureTLS;
    $('nd_timeout').value = next.timeout / 1000;
    $('nd_delay').value = `${next.requestDelay.min}-${next.requestDelay.max}`;
    updateSendModeUI(next.sendMode);
    renderBackendPluginStatus();
}

function renderApiPresetBar() {
    if (!AP_UI || !apiSettingsReady) return;
    if (apiPresetBar) {
        apiPresetBar.render();
        return;
    }
    apiPresetBar = AP_UI.createApiPresetBar({
        document,
        container: $('nd_api_presets'),
        form: $('nd_api_form'),
        fields: NOVEL_API_FIELDS,
        defaults: NOVEL_API_DEFAULTS,
        getState: () => ({ apiPresets: state.apiPresets, activeApiPresetId: state.activeApiPresetId }),
        readConfig: readApiConfigFromForm,
        getEffectiveConfig: getEffectiveApiConfig,
        onCommit: change => requestApiSave('SAVE_API_PRESETS', change, Boolean(change.config)),
        confirm: message => confirm(message),
        prompt: (message, fallback) => prompt(message, fallback),
    });
}

// 超时只表示尚未收到结果，不代表存储失败；保留请求及互斥直到真实回执到达。
// requestId 跨 iframe 实例唯一，关闭重开后的迟到回执不能改写新页面。
function requestApiSave(type, payload, applyForm) {
    return new Promise(resolve => {
        const requestId = `api-${Date.now()}-${Math.random().toString(36).slice(2)}-${++apiSaveSequence}`;
        const timer = setTimeout(() => {
            apiPresetBar.setStatus('pending', API_PRESET_COPY.awaitingReceipt);
        }, API_SAVE_SLOW_MS);
        apiSavePending = { requestId, resolve, timer, applyForm };
        postToParent({ type, ...payload, requestId });
    });
}

function submitApiConfig(syncApiPreset = false) {
    if (!apiPresetBar || apiPresetBar.isBusy()) return;
    void apiPresetBar.runSave(() => requestApiSave('SAVE_API_CONFIG', {
        ...readApiConfigFromForm(), syncApiPreset,
    }, true), () => {
        const active = syncApiPreset && state.apiPresets.find(item => item.id === state.activeApiPresetId);
        return active ? API_PRESET_COPY.synced(active.name) : API_PRESET_COPY.saved;
    });
}

function handleApiSaveStatus(data) {
    const pending = apiSavePending;
    if (!pending || pending.requestId !== data.requestId || !['success', 'error'].includes(data.state)) return;
    clearTimeout(pending.timer);
    apiSavePending = null;
    state.apiPresets = data.apiPresets;
    state.activeApiPresetId = data.activeApiPresetId;
    Object.assign(state, normalizeNovelApiConfig(data.config));
    const ok = data.state === 'success';
    if (ok && pending.applyForm) fillApiConfigForm(data.config);
    if (data.target === 'api') updateStatus($('nd_api_status'), data.state, data.text);
    pending.resolve(ok);
}

function applyStateToUI() {
    console.log('[ND-UI] applyStateToUI: autoLearn=%s, advMode=%s, presets=%d',
        state.autoLearnCharacters, state.advancedMode, state.promptPresets?.length);
    try {
        updateBadge(state.enabled);
        updateModeButtons(state.mode);
        $('nd_show_floor').checked = state.showFloorButton !== false;
        $('nd_show_floating').checked = state.showFloatingButton === true;

        if (!apiSavePending) fillApiConfigForm(state);
        renderApiPresetBar();
        $('nd_cache_days').value = state.cacheDays >= 1 ? state.cacheDays : DEFAULTS.cacheDays;
        $('nd_cache_count').textContent = state.cacheStats?.count || 0;
        $('nd_cache_size').textContent = (state.cacheStats?.sizeMB || 0) + ' MB';

        const pSel = $('nd_params_preset');
        pSel.innerHTML = DOMPurify.sanitize((state.paramsPresets || []).map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name || p.id)}</option>`).join(''));
        pSel.value = state.selectedParamsPresetId || '';

        applyParamsPreset();

        // 提示词预设下拉框 — 与参数预设完全一致的填充模式
        const ppSel = $('nd_prompt_preset');
        const presets = state.promptPresets || [];
        ppSel.innerHTML = DOMPurify.sanitize(presets.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name || p.id)}</option>`).join(''));
        ppSel.value = state.selectedPromptPresetId || '';
        applyPromptPreset();

        renderCharList();
        renderGroupPresetPanel();
        renderGalleryView();
        // auto-learn
        $('nd_auto_learn').checked = !!state.autoLearnCharacters;
        $('nd_auto_learn_update').checked = (state.autoLearnMode || 'new_only') === 'auto_update';
        $('nd_auto_learn_sub').classList.toggle('hidden', !state.autoLearnCharacters);
        renderAutoLearnGroupOptions();
        if ($('nd_planner_retries') && document.activeElement !== $('nd_planner_retries')) {
            $('nd_planner_retries').value = String(state.plannerMaxRetries ?? 3);
        }
        $('nd_danbooru_local').checked = !!state.danbooruLocalDB;
        $('nd_danbooru_local_sub').classList.toggle('hidden', !state.danbooruLocalDB);
        $('nd_danbooru_local_status').textContent = state.danbooruLocalDB ? '已加载' : '未加载';
        renderFilterRules(state.messageFilterRules);
    } catch (e) {
        console.error('[ND-UI] applyStateToUI 部分失败:', e);
    }
    // applyAdvancedMode 必须执行，不受上面异常影响
    try {
        applyAdvancedMode();
    } catch (e) {
        console.error('[ND-UI] applyAdvancedMode 失败:', e);
    }
}

function applyParamsPreset() {
    const p = state.paramsPresets.find(x => x.id === state.selectedParamsPresetId) || state.paramsPresets[0];
    if (!p) return;

    $('nd_positive').value = p.positivePrefix || '';
    $('nd_negative').value = p.negativePrefix || '';
    $('nd_max_images').value = p.maxImages || 0;
    $('nd_max_chars').value = p.maxCharactersPerImage || 0;
    
    const pm = p.params || {};
    const dp = DEFAULTS.params;
    
    setSelectOrCustom('model', pm.model || dp.model);
    setSelectOrCustom('sampler', pm.sampler || dp.sampler);
    setSelectOrCustom('scheduler', pm.scheduler || dp.scheduler);
    
    $('nd_steps').value = pm.steps ?? dp.steps;
    $('nd_scale').value = pm.scale ?? dp.scale;
    $('nd_seed').value = pm.seed ?? dp.seed;
    $('nd_width').value = pm.width ?? dp.width;
    $('nd_height').value = pm.height ?? dp.height;
    updateSizePreset();
    
    $('nd_quality_toggle').value = (pm.qualityToggle ?? dp.qualityToggle) ? 'true' : 'false';
    $('nd_v5_quality').value = pm.v5QualityPresetId || dp.v5QualityPresetId;
    $('nd_v5_uc').value = pm.v5UcPresetId || dp.v5UcPresetId;
    $('nd_transparent_background').checked = pm.transparentBackground === true;
    $('nd_auto_smea').value = (pm.autoSmea ?? dp.autoSmea) ? 'true' : 'false';
    $('nd_uc_preset').value = pm.ucPreset ?? dp.ucPreset;
    $('nd_cfg_rescale').value = pm.cfg_rescale ?? dp.cfg_rescale;
    $('nd_variety_boost').checked = pm.variety_boost ?? dp.variety_boost;
    $('nd_sm').checked = pm.sm ?? dp.sm;
    $('nd_sm_dyn').checked = pm.sm_dyn ?? dp.sm_dyn;
    $('nd_decrisper').checked = pm.decrisper ?? dp.decrisper;
    
    updateModelOptions();
}

/** 纯本地：从当前选中的提示词预设加载 textarea 内容（对标 applyParamsPreset） */
function applyPromptPreset() {
    const active = getActivePromptPresetForForm() || {};
    const drafts = active.id ? promptTextDraftsByPreset.get(active.id) : null;
    $('nd_prompt_system').value = drafts?.has('topSystem')
        ? drafts.get('topSystem')
        : active.topSystem ?? '';
    $('nd_prompt_format').value = drafts?.has('sceneRules')
        ? drafts.get('sceneRules')
        : active.sceneRules ?? '';
    applyModelGuideForCurrentModel();
}

function getActivePromptPresetForForm() {
    const presets = state.promptPresets || [];
    const active = presets.find(preset => preset.id === state.selectedPromptPresetId)
        || presets[0]
        || null;
    if (active && state.selectedPromptPresetId !== active.id) {
        state.selectedPromptPresetId = active.id;
        if ($('nd_prompt_preset')) $('nd_prompt_preset').value = active.id;
    }
    return active;
}

function setCurrentPromptTextDraft(key, content) {
    const active = getActivePromptPresetForForm();
    if (!active?.id) return;
    let drafts = promptTextDraftsByPreset.get(active.id);
    if (!drafts) {
        drafts = new Map();
        promptTextDraftsByPreset.set(active.id, drafts);
    }
    drafts.set(key, String(content ?? ''));
}

/** 当前指南以用户眼前的 textarea 为准；其他模型草稿沿用本页临时状态。 */
function collectModelGuideOverridesFromForm() {
    const active = getActivePromptPresetForForm();
    const source = active?.modelGuideOverrides && typeof active.modelGuideOverrides === 'object'
        && !Array.isArray(active.modelGuideOverrides)
        ? active.modelGuideOverrides
        : {};
    const overrides = { ...source };
    const defaults = state.modelGuideDefaults && typeof state.modelGuideDefaults === 'object'
        ? state.modelGuideDefaults
        : {};
    const drafts = active?.id ? modelGuideDraftsByPreset.get(active.id) : null;
    const applyDraft = (guideId, content) => {
        if (typeof defaults[guideId] === 'string' && content === defaults[guideId]) {
            delete overrides[guideId];
        } else {
            overrides[guideId] = content;
        }
    };
    drafts?.forEach((content, guideId) => applyDraft(guideId, content));

    const guideId = getCurrentModelGuideId();
    const textarea = $('nd_prompt_guide');
    if (textarea) {
        applyDraft(guideId, textarea.value);
    }
    return overrides;
}

function setCurrentModelGuideDraft(content) {
    const active = getActivePromptPresetForForm();
    if (!active?.id) return;
    const guideId = getCurrentModelGuideId();
    let drafts = modelGuideDraftsByPreset.get(active.id);
    if (!drafts) {
        drafts = new Map();
        modelGuideDraftsByPreset.set(active.id, drafts);
    }
    drafts.set(guideId, String(content ?? ''));
}

function getCurrentModelGuideId() {
    const model = $('nd_model_sel')?.value === 'custom' ? $('nd_model')?.value : $('nd_model_sel')?.value;
    return getModelCapability(model).promptGuide || 'v4.5';
}

function applyModelGuideForCurrentModel() {
    const guideId = getCurrentModelGuideId();
    const defaults = state.modelGuideDefaults && typeof state.modelGuideDefaults === 'object'
        ? state.modelGuideDefaults
        : {};
    const defaultContent = typeof defaults[guideId] === 'string'
        ? defaults[guideId]
        : '';
    const active = getActivePromptPresetForForm() || {};
    const overrides = active.modelGuideOverrides && typeof active.modelGuideOverrides === 'object'
        ? active.modelGuideOverrides
        : {};
    const drafts = active.id ? modelGuideDraftsByPreset.get(active.id) : null;
    const content = drafts?.has(guideId)
        ? drafts.get(guideId)
        : Object.prototype.hasOwnProperty.call(overrides, guideId)
            && typeof overrides[guideId] === 'string'
            ? overrides[guideId]
            : defaultContent;

    $('nd_prompt_guide').value = content;
}

function setSelectOrCustom(kind, value) {
    const sel = $(`nd_${kind}_sel`);
    const input = $(`nd_${kind}`);
    const has = [...sel.options].some(o => o.value === value);
    sel.value = has ? value : 'custom';
    input.classList.toggle('hidden', sel.value !== 'custom');
    input.value = value || '';
}

function updateSizePreset() {
    const w = $('nd_width').value;
    const h = $('nd_height').value;
    const val = `${w}x${h}`;
    const sel = $('nd_size_preset');
    const has = [...sel.options].some(o => o.value === val);
    sel.value = has ? val : 'custom';
    $('nd_custom_size').classList.toggle('hidden', sel.value !== 'custom');
}

function updateModelOptions() {
    const model = $('nd_model_sel').value === 'custom' ? $('nd_model').value : $('nd_model_sel').value;
    const capability = getModelCapability(model);
    const isV3 = model.includes('nai-diffusion-3') || model.includes('furry-3');
    const isV5 = capability.family === 'v5';
    $('nd_v3_opts').classList.toggle('hidden', !isV3);
    $('nd_legacy_enhancement').classList.toggle('hidden', isV5);
    $('nd_v5_enhancement').classList.toggle('hidden', capability.supportsV5Presets !== true);
    $('nd_transparent_background_group').classList.toggle(
        'hidden',
        capability.supportsTransparentBackground !== true,
    );
    $('nd_auto_smea_group').classList.toggle('hidden', isV5);
    $('nd_variety_boost_group').classList.toggle('hidden', isV5);
    const characterLimit = capability.maxCharactersPerImage || 10;
    $('nd_max_chars').max = String(characterLimit);
    applyModelGuideForCurrentModel();
    requestPromptChainPreview();
    renderBackendPluginStatus();
}

function collectParamsPreset() {
    const p = state.paramsPresets.find(x => x.id === state.selectedParamsPresetId);
    if (!p) return;

    p.positivePrefix = $('nd_positive').value;
    p.negativePrefix = $('nd_negative').value;
    p.maxImages = Math.max(0, Number($('nd_max_images').value) || 0);
    const model = $('nd_model_sel').value === 'custom' ? $('nd_model').value : $('nd_model_sel').value;
    const characterLimit = getModelCapability(model).maxCharactersPerImage || 10;
    p.maxCharactersPerImage = Math.min(characterLimit, Math.max(0, Number($('nd_max_chars').value) || 0));
    p.params = p.params || {};
    p.params.model = model.trim();
    p.params.sampler = $('nd_sampler_sel').value === 'custom' ? $('nd_sampler').value : $('nd_sampler_sel').value;
    p.params.scheduler = $('nd_scheduler_sel').value === 'custom' ? $('nd_scheduler').value : $('nd_scheduler_sel').value;
    p.params.steps = Number($('nd_steps').value) || 23;
    p.params.scale = Number($('nd_scale').value) || 5;
    const seed = $('nd_seed').value.trim();
    p.params.seed = seed === '' ? -1 : Number(seed);
    p.params.width = Number($('nd_width').value) || 832;
    p.params.height = Number($('nd_height').value) || 1216;
    p.params.qualityToggle = $('nd_quality_toggle').value === 'true';
    p.params.v5QualityPresetId = $('nd_v5_quality').value;
    p.params.v5UcPresetId = $('nd_v5_uc').value;
    p.params.transparentBackground = $('nd_transparent_background').checked;
    p.params.autoSmea = $('nd_auto_smea').value === 'true';
    p.params.ucPreset = Number($('nd_uc_preset').value) || 0;
    p.params.cfg_rescale = Number($('nd_cfg_rescale').value) || 0;
    p.params.variety_boost = $('nd_variety_boost').checked;
    p.params.sm = $('nd_sm').checked;
    p.params.sm_dyn = $('nd_sm_dyn').checked;
    p.params.decrisper = $('nd_decrisper').checked;
}

// ═══════════════════════════════════════════════════════════════════════════
// 消息处理
// ═══════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line no-restricted-syntax -- Rejects both foreign origins and windows before reading data.
window.addEventListener('message', event => {
    if (event.origin !== PARENT_ORIGIN || event.source !== window.parent) return;
    const data = event.data;
    if (!data || data.source !== 'LittleWhiteBox-NovelDraw') return;

    switch (data.type) {
        case 'INIT_DATA': {
            backendCopy = data.backendCopy;
            console.log('[ND-UI] INIT_DATA received — autoLearn=%s, advMode=%s, promptPresets:',
                data.settings?.autoLearnCharacters, data.settings?.advancedMode,
                JSON.stringify((data.settings?.promptPresets || []).map(p => p.name)));
            // 还有预设保存没收到回执时，页面里的预设比宿主推来的新：保留本地版本（回执之后宿主推来的才是最终结果）。
            const incoming = { ...data.settings };
            if (Array.isArray(incoming.characterGroupPresets)) groupPresetHostPresets = incoming.characterGroupPresets;
            if (groupPresetPendingSaves.size) delete incoming.characterGroupPresets;
            state = { ...state, ...incoming, cacheStats: data.cacheStats || state.cacheStats };
            apiSettingsReady = true;
            // 宿主推来的是已保存的角色表，不含本页还没保存的空白草稿；编辑中的草稿放回去，
            // 表单内容由 renderCharList 重绘前读回并恢复。
            reattachDraftCharacters();
            if (data.defaultPrompts) state._defaultPrompts = data.defaultPrompts;
            // 宿主的先行 INIT_DATA 不带统计（要等 IndexedDB 算完由 CACHE_DATA 送来）：没带就保持画廊状态不动。
            if (data.gallerySummary) applyGallerySummary(data.gallerySummary);
            applyStateToUI();
            clearUndoIfStale();
            shuffleCredits();
            break;
        }

        case 'GROUP_PRESET_CONTEXT':
            // 聊天切换后宿主推来的轻量更新：只刷新“当前聊天”相关的数据，不动其它状态。
            if (Array.isArray(data.activeAvatars)) state.activeAvatars = data.activeAvatars;
            if (Array.isArray(data.hostCharacters)) state.hostCharacters = data.hostCharacters;
            renderGroupPresetPanel();
            break;

        case 'CACHE_DATA':
            state.cacheStats = data.cacheStats || state.cacheStats;
            if (data.gallerySummary) applyGallerySummary(data.gallerySummary);
            if ($('nd_cache_count')) $('nd_cache_count').textContent = state.cacheStats?.count || 0;
            if ($('nd_cache_size')) $('nd_cache_size').textContent = (state.cacheStats?.sizeMB || 0) + ' MB';
            renderGalleryView();
            break;

        case 'CHARACTER_PREVIEWS_LOADED':
            handleCharacterPreviewsLoaded(data);
            break;

        case 'CHARACTER_PREVIEWS_FAILED':
            failCharacterRequest(data.charName, data.requestId);
            break;

        case 'SLOT_VERSIONS_LOADED':
            handleSlotVersionsLoaded(data);
            break;

        case 'SLOT_VERSIONS_FAILED':
            failSlotVersionsRequest(data.charName, data.slotId, data.requestId);
            break;
            
        case 'TEST_RESULT':
            $('nd_preview_img').src = data.url;
            $('nd_preview').classList.add('visible');
            break;

        case 'BACKEND_PLUGIN_STATUS': {
            state.backendPluginStatus = data.status || {};
            state.backendPluginCopy = data.copy;
            renderBackendPluginStatus();
            break;
        }

            
        case 'STATUS':
            if (data.target === 'group-presets') {
                handleGroupPresetStatus(data);
                break;
            }
            if (data.target === 'api-presets' || (data.target === 'api' && data.requestId)) {
                handleApiSaveStatus(data);
                break;
            }
            if (data.target === 'worldbook') {
                updateStatus($('nd_wb_status'), data.state, data.text);
                if (data.state === 'success' || data.state === 'error') handleSaveResult(data.state === 'success');
                break;
            }
            if (data.target === 'api') {
                updateStatus($('nd_api_status'), data.state, data.text);
            } else if (data.target === 'params') {
                updateStatus($('nd_params_status'), data.state, data.text);
            } else if (data.target === 'prompt-preset') {
                updateStatus($('nd_prompt_preset_status'), data.state, data.text);
            } else if (data.target === 'prompts') {
                updateStatus($('nd_prompts_status'), data.state, data.text);
            } else if (data.target === 'filter') {
                updateStatus($('nd_filter_status'), data.state, data.text);
            } else if (data.target === 'gallery') {
                updateStatus($('nd_gallery_status'), data.state, data.text);
            } else {
                updateStatus($('nd_status'), data.state, data.text);
            }
            if (data.state === 'success' || data.state === 'error') handleSaveResult(data.state === 'success');
            break;
            
        case 'GALLERY_IMAGE_DELETED':
            applyGalleryImageDeleted(data.imgId);
            if (modalData.slotId) {
                modalData.images = modalData.images.filter(img => img.imgId !== data.imgId);
                if (modalData.images.length === 0) closeGalleryModal();
                else {
                    if (modalData.currentIndex >= modalData.images.length) modalData.currentIndex = modalData.images.length - 1;
                    renderModalThumbs();
                    renderModalContent();
                }
            }
            pruneGalleryObjectUrls();
            postToParent({ type: 'REFRESH_CACHE_STATS' });
            break;

        case 'GALLERY_IMAGE_SAVED':
            if (modalData.charName && loadedCharPreviews[modalData.charName]) {
                const entry = loadedCharPreviews[modalData.charName];
                for (const slotId of entry.order) {
                    const info = entry.slots[slotId];
                    const img = info.images.find(i => i.imgId === data.imgId);
                    if (img) {
                        img.savedUrl = data.savedUrl;
                        img.base64 = null; // 已保存的图以服务器地址显示，不再需要页面里的 base64
                        info.hasSaved = true;
                        refreshSlotBadges(modalData.charName, slotId);
                        break;
                    }
                }
            }
            // 保存后模态框保持打开、停在当前这张图：只更新“已保存”按钮与缩略图角标，不重载大图。
            if (modalData.slotId) {
                const img = modalData.images.find(i => i.imgId === data.imgId);
                if (img) { img.savedUrl = data.savedUrl; renderModalContent(); }
            }
            break;

        case 'DANBOORU_LOCAL_SEARCH_RESULTS':
            renderLocalDanbooruResults(data.query, data.results || [], data.charId);
            break;

        case 'PROMPT_CHAIN_DATA':
            if (Number(data.requestId) !== promptChainRequestId) break;
            renderPromptChain(data.chain || []);
            break;

        case 'LAST_LLM_REQUEST_DATA':
            renderLastLlmRequest(data.snapshot || null);
            break;

        case 'SYNC_SUMMARY_FILTER_RESULT': {
            const incoming = Array.isArray(data.rules) ? data.rules : [];
            if (!incoming.length) { alert('总结模块没有找到过滤规则'); break; }
            const current = collectFilterRules();
            const exists = new Set(current.map(r => `${r.start}\x00${r.end}`));
            let added = 0;
            const list = $('nd_filter_rules_list');
            for (const r of incoming) {
                const key = `${r.start || ''}\x00${r.end || ''}`;
                if (!exists.has(key)) {
                    renderFilterRuleRow({ start: r.start || '', end: r.end || '' }, list);
                    exists.add(key);
                    added++;
                }
            }
            alert(added ? `已同步 ${added} 条新规则（需点保存生效）` : '没有新规则需要同步');
            break;
        }
    }
});

window.addEventListener('beforeunload', () => {
    for (const url of previewObjectUrls.values()) {
        try { URL.revokeObjectURL(url); } catch {}
    }
    previewObjectUrls.clear();
});

// ═══════════════════════════════════════════════════════════════════════════
// 初始化
// ═══════════════════════════════════════════════════════════════════════════

function initializePage() {
    mountServerPluginGuide(document.getElementById('nd_backend_guide'), 'nd-backend');
    shuffleCredits();
    // ═══════════════════════════════════════════════════════════════════════
    // 导航切换
    // ═══════════════════════════════════════════════════════════════════════
    $$('.nav-item, .mobile-nav-item').forEach(item => item.addEventListener('click', () => switchView(item.dataset.view)));
    
    // ═══════════════════════════════════════════════════════════════════════
    // 模式切换
    // ═══════════════════════════════════════════════════════════════════════
    $$('.header-mode button').forEach(btn => btn.addEventListener('click', () => {
        state.mode = btn.dataset.mode;
        updateModeButtons(state.mode);
        postToParent({ type: 'SAVE_MODE', mode: state.mode });
    }));

    $('nd_show_floor').addEventListener('change', () => {
        postToParent({
            type: 'SAVE_BUTTON_MODE',
            showFloorButton: $('nd_show_floor').checked,
            showFloatingButton: $('nd_show_floating').checked
        });
    });

    $('nd_show_floating').addEventListener('change', () => {
        postToParent({
            type: 'SAVE_BUTTON_MODE',
            showFloorButton: $('nd_show_floor').checked,
            showFloatingButton: $('nd_show_floating').checked
        });
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // 关闭按钮
    // ═══════════════════════════════════════════════════════════════════════
    $('nd_close').addEventListener('click', () => postToParent({ type: 'CLOSE' }));
    
    // ═══════════════════════════════════════════════════════════════════════
    // API 配置
    // ═══════════════════════════════════════════════════════════════════════
    $('nd_toggle_key').addEventListener('click', () => {
        const i = $('nd_api_key');
        const ic = $('nd_toggle_key').querySelector('i');
        if (i.type === 'password') { i.type = 'text'; ic.className = 'fa-solid fa-eye-slash'; }
        else { i.type = 'password'; ic.className = 'fa-solid fa-eye'; }
    });
    
    $('nd_reset_base_url').addEventListener('click', () => {
        if (apiPresetBar?.isBusy()) return;
        $('nd_api_base_url').value = '';
        submitApiConfig();
    });

    $('nd_send_mode_group').querySelectorAll('.nd-mode-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (apiPresetBar?.isBusy()) return;
            updateSendModeUI(btn.dataset.sendMode);
            submitApiConfig();
        });
    });

    $('nd_insecure_tls').addEventListener('change', () => submitApiConfig());
    $('nd_use_backend_jobs').addEventListener('change', () => {
        if (apiPresetBar?.isBusy()) return;
        updateSendModeUI(getSendMode());
        renderBackendPluginStatus();
        submitApiConfig();
    });
    $('nd_backend_recheck').addEventListener('click', () => requestBackendPluginCheck());
    $('nd_save_api').addEventListener('click', () => submitApiConfig(true));

    // API 配置页里任何改动都刷新预设栏的“与预设一致 / 不一致”状态（预设栏自己的操作除外）。
    ['input', 'change', 'click'].forEach((type) => {
        $('view-api').addEventListener(type, (event) => {
            if (event.target?.closest?.('#nd_api_presets')) return;
            apiPresetBar?.refresh();
        });
    });
    
    $('nd_test_api').addEventListener('click', () => postToParent({
        type: 'TEST_API',
        apiKey: $('nd_api_key').value.trim(),
        apiBaseUrl: $('nd_api_base_url').value.trim(),
        sendMode: getSendMode(),
        insecureTLS: $('nd_insecure_tls').checked,
        timeout: Number($('nd_timeout').value) * 1000 || DEFAULTS.timeout,
        model: $('nd_model_sel').value === 'custom' ? $('nd_model').value : $('nd_model_sel').value,
    }));
    
    $('nd_test_single').addEventListener('click', () => postToParent({ type: 'TEST_SINGLE', tags: $('nd_test_tags').value }));
    
    // ═══════════════════════════════════════════════════════════════════════
    // 模型/采样器/调度器选择
    // ═══════════════════════════════════════════════════════════════════════
    ['model', 'sampler', 'scheduler'].forEach(k => {
        $(`nd_${k}_sel`).addEventListener('change', function() {
            $(`nd_${k}`).classList.toggle('hidden', this.value !== 'custom');
            if (k === 'model') updateModelOptions();
        });
    });
    $('nd_model').addEventListener('change', updateModelOptions);
    
    // ═══════════════════════════════════════════════════════════════════════
    // 尺寸预设
    // ═══════════════════════════════════════════════════════════════════════
    $('nd_size_preset').addEventListener('change', function() {
        if (this.value === 'custom') {
            $('nd_custom_size').classList.remove('hidden');
        } else {
            const [w, h] = this.value.split('x');
            $('nd_width').value = w;
            $('nd_height').value = h;
            $('nd_custom_size').classList.add('hidden');
        }
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // 参数预设管理
    // ═══════════════════════════════════════════════════════════════════════
    $('nd_params_preset').addEventListener('change', () => { 
        state.selectedParamsPresetId = $('nd_params_preset').value; 
        applyParamsPreset(); 
    });
    
    $('nd_params_save').addEventListener('click', () => {
        setSavingState($('nd_params_save'));
        collectParamsPreset();
        postToParent({ type: 'SAVE_PARAMS_PRESET', selectedParamsPresetId: state.selectedParamsPresetId, paramsPresets: state.paramsPresets });
    });
    
    $('nd_params_add').addEventListener('click', () => postToParent({ type: 'ADD_PARAMS_PRESET' }));
    
    $('nd_params_del').addEventListener('click', () => { 
        if (confirm('确定删除当前参数预设？')) postToParent({ type: 'DEL_PARAMS_PRESET' }); 
    });
    
    $('nd_params_rename').addEventListener('click', () => {
        const p = state.paramsPresets.find(x => x.id === state.selectedParamsPresetId);
        if (!p) return;
        const name = prompt('输入新名称：', p.name || '');
        if (name && name.trim()) {
            p.name = name.trim();
            postToParent({ type: 'SAVE_PARAMS_PRESET', selectedParamsPresetId: state.selectedParamsPresetId, paramsPresets: state.paramsPresets });
        }
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // 云端预设（新增）
    // ═══════════════════════════════════════════════════════════════════════
    $('nd_params_cloud').addEventListener('click', () => {
        postToParent({ type: 'OPEN_CLOUD_PRESETS' });
    });
    
    $('nd_params_export').addEventListener('click', () => {
        postToParent({ type: 'EXPORT_CURRENT_PRESET', presetId: state.selectedParamsPresetId });
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // 角色标签
    // ═══════════════════════════════════════════════════════════════════════
    $('nd_char_search').addEventListener('input', e => {
        charFilters.query = e.target.value || '';
        renderCharList();
    });

    $('nd_char_filter_type').addEventListener('change', e => {
        charFilters.type = e.target.value || 'all';
        renderCharList();
    });

    $('nd_char_filter_status').addEventListener('change', e => {
        charFilters.status = e.target.value || 'all';
        renderCharList();
    });

    $('nd_char_filter_reset').addEventListener('click', () => {
        resetCharacterFilters();
    });
    
    $('nd_char_add').addEventListener('click', () => {
        const nc = { id: `char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, enabled: true, name: '', aliases: [], type: 'girl', appearance: '', negativeTags: '', outfits: [], dynamicStates: [] };
        state.characterTags.push(nc);
        registerDraftCharacter(nc);
        editingCharId = nc.id;
        editingDraft = null;
        resetCharacterFilters(false);
        renderCharList();
        switchView('characters');
        revealEditingCard();
        setTimeout(() => document.querySelector('.char-edit-name')?.focus(), 50);
    });
    
    $('nd_char_list').addEventListener('click', e => {
        const groupBtn = e.target.closest('[data-group-action]');
        if (groupBtn) {
            handleGroupAction(groupBtn.dataset.groupAction, groupBtn.dataset.groupId ?? '', groupBtn);
            return;
        }
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const card = btn.closest('.char-card');
        const id = btn.dataset.id || card?.dataset.id;
        if (id) handleCharAction(btn.dataset.action, id, card, btn);
    });

    // auto-learn (toggle + subordinate checkbox)
    $('nd_auto_learn').addEventListener('change', () => {
        const enabled = $('nd_auto_learn').checked;
        state.autoLearnCharacters = enabled; // 乐观更新，与 danbooruLocalDB 一致
        $('nd_auto_learn_sub').classList.toggle('hidden', !enabled);
        const mode = enabled && $('nd_auto_learn_update').checked ? 'auto_update' : 'new_only';
        postToParent({ type: 'SAVE_AUTO_LEARN', autoLearnCharacters: enabled, autoLearnMode: mode, autoLearnGroupId: state.autoLearnGroupId || '' });
    });
    $('nd_auto_learn_update').addEventListener('change', () => {
        const mode = $('nd_auto_learn_update').checked ? 'auto_update' : 'new_only';
        postToParent({ type: 'SAVE_AUTO_LEARN', autoLearnCharacters: $('nd_auto_learn').checked, autoLearnMode: mode, autoLearnGroupId: state.autoLearnGroupId || '' });
    });
    $('nd_auto_learn_group').addEventListener('change', () => {
        state.autoLearnGroupId = $('nd_auto_learn_group').value || '';
        const mode = $('nd_auto_learn_update').checked ? 'auto_update' : 'new_only';
        postToParent({ type: 'SAVE_AUTO_LEARN', autoLearnCharacters: $('nd_auto_learn').checked, autoLearnMode: mode, autoLearnGroupId: state.autoLearnGroupId });
    });
    setupCharacterDragAndSelection();
    $('nd_planner_retries').addEventListener('change', () => {
        const raw = String($('nd_planner_retries').value).trim();
        const parsed = raw === '' ? Number.NaN : Math.floor(Number(raw));
        // 留空或非法时恢复上一次的值，而不是当成 0（那样会悄悄关闭重试）。
        const value = Number.isFinite(parsed) ? Math.min(10, Math.max(0, parsed)) : (state.plannerMaxRetries ?? 3);
        $('nd_planner_retries').value = String(value);
        state.plannerMaxRetries = value;
        postToParent({ type: 'SAVE_PLANNER_RETRY', plannerMaxRetries: value });
    });
    $('nd_group_add').addEventListener('click', () => {
        runLibraryAction(() => {
            const name = prompt('新分组名称');
            if (name === null) return;
            applyCharacterLibrary(CL.createGroup(getCharacterLibrary(), name).library);
        });
    });

    $('nd_danbooru_local').addEventListener('change', () => {
        const enabled = $('nd_danbooru_local').checked;
        state.danbooruLocalDB = enabled; // 乐观更新，避免 toggle → 点击修正 之间的窗口期
        $('nd_danbooru_local_sub').classList.toggle('hidden', !enabled);
        if (enabled) $('nd_danbooru_local_status').textContent = '加载中...';
        renderCharList(); // 立即刷新修正按钮状态
        postToParent({ type: 'SAVE_DANBOORU_LOCAL_DB', enabled });
    });

    // clear all characters
    $('nd_char_clear').addEventListener('click', () => {
        const savedCount = persistedCharacters().length;
        if (!savedCount) { alert('没有角色可清除'); return; }
        if (!confirm(`确定清除全部 ${savedCount} 个角色？清除后 ${UNDO_WINDOW_MS / 1000} 秒内可点“撤销”恢复。`)) return;
        const snapshot = cloneLibrary(getCharacterLibrary());
        state.characterTags = [];
        saveCharacterLibrary();
        renderCharList();
        showUndo(`已清除 ${snapshot.characters.length} 个角色`, snapshot);
    });
    
    $('nd_char_export').addEventListener('click', () => openCharacterExportChooser());

    $('nd_char_import').addEventListener('change', async (event) => {
        const input = event.target;
        const file = input.files?.[0];
        try {
            if (file) await handleCharacterImportFile(file);
        } finally {
            input.value = ''; // 清空以便重复选择同一个文件
        }
    });

    $('nd_llm_request_refresh').addEventListener('click', () => {
        postToParent({ type: 'GET_LAST_LLM_REQUEST' });
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 消息过滤规则
    // ═══════════════════════════════════════════════════════════════════════
    $('nd_filter_add').addEventListener('click', () => {
        renderFilterRuleRow({ start: '', end: '' }, $('nd_filter_rules_list'));
    });
    $('nd_filter_save').addEventListener('click', () => {
        setSavingState($('nd_filter_save'));
        const rules = collectFilterRules();
        state.messageFilterRules = rules;
        postToParent({ type: 'SAVE_MESSAGE_FILTER_RULES', rules });
    });
    $('nd_filter_sync').addEventListener('click', () => {
        postToParent({ type: 'SYNC_SUMMARY_FILTER_RULES' });
    });
    $('nd_filter_reset').addEventListener('click', () => {
        if (!confirm('确定恢复为默认过滤规则？当前未保存的修改将丢失。')) return;
        renderFilterRules(ND_DEFAULT_FILTER_RULES);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 图片管理
    // ═══════════════════════════════════════════════════════════════════════
    $('nd_save_cache_days').addEventListener('click', () => {
        setSavingState($('nd_save_cache_days'));
        postToParent({ type: 'SAVE_CACHE_DAYS', cacheDays: Number($('nd_cache_days').value) || 3 });
    });
    
    $('nd_clear_expired').addEventListener('click', () => postToParent({ type: 'CLEAR_EXPIRED_CACHE' }));
    
    $('nd_clear_all').addEventListener('click', () => { 
        if (confirm('确定清空全部图片记录？已保存到服务器的文件不会被删除。')) postToParent({ type: 'CLEAR_ALL_CACHE' }); 
    });
    
    $('nd_refresh_stats').addEventListener('click', () => postToParent({ type: 'REFRESH_CACHE_STATS' }));
    
    // ═══════════════════════════════════════════════════════════════════════
    // 画廊弹窗
    // ═══════════════════════════════════════════════════════════════════════
    $('nd_modal_close').addEventListener('click', closeGalleryModal);
    $('nd_modal_load_status').addEventListener('click', event => {
        const retry = event.target.closest?.('[data-retry]')?.dataset.retry;
        if (retry === 'versions') requestSlotVersions(modalData.charName, modalData.slotId);
        if (retry === 'page') retryCharacterSlots(modalData.charName);
    });

    $('nd_modal_prev').addEventListener('click', () => stepGallerySlot(-1));
    $('nd_modal_next').addEventListener('click', () => stepGallerySlot(1));

    document.addEventListener('keydown', e => {
        if (!$('nd_gallery_modal').classList.contains('visible')) return;
        if (e.key === 'Escape') { closeGalleryModal(); return; }
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
        const tag = String(e.target?.tagName || '').toUpperCase();
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return;
        e.preventDefault();
        stepGallerySlot(e.key === 'ArrowLeft' ? -1 : 1);
    });

    $('nd_gallery_modal').addEventListener('click', e => {
        if (e.target.id === 'nd_gallery_modal') closeGalleryModal();
    });
    
    $('nd_modal_use').addEventListener('click', () => {
        if (!modalData.slotId || !modalData.images.length) return;
        const c = modalData.images[modalData.currentIndex];
        postToParent({ type: 'USE_GALLERY_IMAGE', slotId: modalData.slotId, imgId: c.imgId });
        closeGalleryModal();
    });
    
    $('nd_modal_save').addEventListener('click', () => {
        if (!modalData.images.length) return;
        const c = modalData.images[modalData.currentIndex];
        if (c.savedUrl) return;
        postToParent({ type: 'SAVE_GALLERY_IMAGE', imgId: c.imgId });
    });
    
    $('nd_modal_delete').addEventListener('click', () => {
        if (!modalData.images.length) return;
        const c = modalData.images[modalData.currentIndex];
        const msg = c.savedUrl ? '确定删除这条记录吗？服务器上的图片文件不会被删除。' : '确定删除这张图片吗？';
        if (confirm(msg)) postToParent({ type: 'DELETE_GALLERY_IMAGE', imgId: c.imgId });
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // 提示词预设管理 — 切换立即持久化，模板正文仍由保存按钮提交
    $('nd_prompt_preset').addEventListener('change', () => {
        state.selectedPromptPresetId = $('nd_prompt_preset').value;
        applyPromptPreset();
        requestPromptChainPreview();
        postToParent({ type: 'SELECT_PROMPT_PRESET', id: state.selectedPromptPresetId });
    });

    $('nd_prompt_preset_save').addEventListener('click', () => {
        setSavingState($('nd_prompt_preset_save'));
        getActivePromptPresetForForm();
        postToParent({ type: 'SAVE_PROMPT_PRESET', selectedPromptPresetId: state.selectedPromptPresetId, promptDraft: {
            topSystem: $('nd_prompt_system').value,
            sceneRules: $('nd_prompt_format').value,
            modelGuideOverrides: collectModelGuideOverridesFromForm(),
        }, statusTarget: 'prompt-preset' });
    });

    $('nd_prompt_add').addEventListener('click', () => postToParent({
        type: 'ADD_PROMPT_PRESET',
        sourcePresetId: state.selectedPromptPresetId,
    }));

    $('nd_prompt_del').addEventListener('click', () => {
        if (confirm('确定删除当前提示词预设？')) {
            postToParent({ type: 'DEL_PROMPT_PRESET', id: state.selectedPromptPresetId });
        }
    });

    $('nd_prompt_rename').addEventListener('click', () => {
        const p = (state.promptPresets || []).find(x => x.id === state.selectedPromptPresetId);
        if (!p) return;
        const name = prompt('输入新名称：', p.name || '');
        if (name && name.trim()) {
            postToParent({ type: 'RENAME_PROMPT_PRESET', id: state.selectedPromptPresetId, name: name.trim() });
        }
    });

    // 提示词模板保存（底部按钮，等同于预设栏保存）
    $('nd_prompts_save').addEventListener('click', () => {
        setSavingState($('nd_prompts_save'));
        getActivePromptPresetForForm();
        postToParent({ type: 'SAVE_PROMPT_PRESET', selectedPromptPresetId: state.selectedPromptPresetId, promptDraft: {
            topSystem: $('nd_prompt_system').value,
            sceneRules: $('nd_prompt_format').value,
            modelGuideOverrides: collectModelGuideOverridesFromForm(),
        }, statusTarget: 'prompts' });
    });

    // 恢复默认只改表单；点保存才落盘
    const refreshChainIfOpen = () => { if ($('nd_prompt_chain_details').open) requestPromptChainPreview(); };
    $('nd_prompt_reset_system').addEventListener('click', () => {
        const activePreset = (state.promptPresets || []).find(p => p.id === state.selectedPromptPresetId);
        const isPov = ['默认-第一人称完整规则', '新版-第一人称完整规则'].includes(activePreset?.name);
        const defaultTopSystem = isPov ? (state._defaultPrompts?.topSystemPov || '') : (state._defaultPrompts?.topSystem || '');
        $('nd_prompt_system').value = defaultTopSystem;
        setCurrentPromptTextDraft('topSystem', defaultTopSystem);
        refreshChainIfOpen();
    });
    $('nd_prompt_reset_format').addEventListener('click', () => {
        const defaultSceneRules = state._defaultPrompts?.sceneRules || '';
        $('nd_prompt_format').value = defaultSceneRules;
        setCurrentPromptTextDraft('sceneRules', defaultSceneRules);
        refreshChainIfOpen();
    });
    $('nd_prompt_reset_guide').addEventListener('click', () => {
        const defaultContent = state.modelGuideDefaults?.[getCurrentModelGuideId()] ?? '';
        $('nd_prompt_guide').value = defaultContent;
        setCurrentModelGuideDraft(defaultContent);
        refreshChainIfOpen();
    });
    $('nd_prompts_reset_all').addEventListener('click', () => {
        if (!confirm('确认将当前预设的全部提示词恢复为默认值？（需点击保存才会生效）')) return;
        const defaults = state._defaultPrompts || {};
        const activePreset = getActivePromptPresetForForm();
        if (!activePreset) {
            alert('没有可恢复的提示词预设');
            return;
        }
        const isPov = ['默认-第一人称完整规则', '新版-第一人称完整规则'].includes(activePreset.name);
        const topSystemVal = isPov ? (defaults.topSystemPov || '') : (defaults.topSystem || '');
        const sceneRulesVal = defaults.sceneRules || '';
        $('nd_prompt_system').value = topSystemVal;
        $('nd_prompt_format').value = sceneRulesVal;
        promptTextDraftsByPreset.set(activePreset.id, new Map([
            ['topSystem', topSystemVal],
            ['sceneRules', sceneRulesVal],
        ]));
        modelGuideDraftsByPreset.set(activePreset.id, new Map(
            Object.entries(state.modelGuideDefaults || {})
                .filter(([, content]) => typeof content === 'string'),
        ));
        applyModelGuideForCurrentModel();
        refreshChainIfOpen();
    });

    $('nd_prompt_preset_export').addEventListener('click', () => {
        const activePreset = getActivePromptPresetForForm() || {};
        const data = {
            _type: 'novel-draw-prompt-template',
            _version: 3,
            name: activePreset.name || '',
            topSystem: $('nd_prompt_system').value,
            sceneRules: $('nd_prompt_format').value,
            modelGuideOverrides: collectModelGuideOverridesFromForm(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${activePreset.name || '提示词预设'}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    });

    $('nd_prompt_preset_import').addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            postToParent({
                type: 'IMPORT_PROMPT_PRESET',
                payload: data,
                fallbackName: file.name.replace(/\.json$/i, '').trim()
                    || `导入的预设-${(state.promptPresets || []).length + 1}`,
            });
        } catch (err) {
            alert('导入失败: ' + err.message);
        }
        e.target.value = '';
    });

    $('nd_prompt_chain_details').addEventListener('toggle', (event) => {
        if (event.currentTarget.open) requestPromptChainPreview();
    });
    ['nd_prompt_system', 'nd_prompt_format'].forEach((id) => {
        $(id).addEventListener('input', () => {
            setCurrentPromptTextDraft(id === 'nd_prompt_system' ? 'topSystem' : 'sceneRules', $(id).value);
            if ($('nd_prompt_chain_details').open) requestPromptChainPreview();
        });
    });
    $('nd_prompt_guide').addEventListener('input', () => {
        setCurrentModelGuideDraft($('nd_prompt_guide').value);
        if ($('nd_prompt_chain_details').open) requestPromptChainPreview();
        else promptChainRequestId += 1;
    });

    // 世界书上传
    const dropzone = $('nd_wb_dropzone');
    const fileInput = $('nd_wb_file_input');

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleWorldbookFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) handleWorldbookFiles(fileInput.files);
        fileInput.value = '';
    });

    $('nd_wb_save').addEventListener('click', () => {
        setSavingState($('nd_wb_save'));
        const uploaded = state.worldbooks?.uploadedBooks || [];
        postToParent({ type: 'SAVE_WORLDBOOK_CONFIG', worldbooks: {
            enabled: $('nd_wb_enabled').checked,
            uploadedBooks: uploaded,
            keywordFilterMode: $('nd_wb_filter_mode').value || 'auto',
        }, useWorldInfo: $('nd_use_worldinfo').checked });
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 通知父窗口准备就绪
    // ═══════════════════════════════════════════════════════════════════════
    // 角色库模块先于 FRAME_READY 加载：INIT_DATA 只会在 FRAME_READY 之后到达，渲染时 CL 一定可用。
    Promise.all([
        Promise.all([import('../../shared/character-library.js'), import('../../shared/character-group-presets.js')])
            .then(([library, presets]) => { CL = library; GPM = presets; })
            .catch((error) => { console.error('[ND-UI] 角色库模块加载失败，分组功能不可用:', error); }),
        import('../../shared/character-library-dialog.js')
            .then((module) => { CD = module; })
            .catch((error) => { console.error('[ND-UI] 角色导入对话框加载失败，导入导出不可用:', error); }),
        import('../../shared/character-list-scroll.js')
            .then((module) => { CS = module; })
            .catch((error) => { console.error('[ND-UI] 拖拽自动滚动模块加载失败，拖拽时不会自动滚动:', error); }),
        import('../../shared/character-group-presets-ui.js')
            .then((module) => { GP = module; })
            .catch((error) => { console.error('[ND-UI] 分组预设模块加载失败，分组预设不可用:', error); }),
        import('../../shared/api-presets-ui.js')
            .then((module) => { AP_UI = module; renderApiPresetBar(); })
            .catch((error) => { console.error('[ND-UI] API 预设模块加载失败，API 配置预设不可用:', error); }),
    ]).finally(() => postToParent({ type: 'FRAME_READY' }));
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializePage, { once: true });
else initializePage();
