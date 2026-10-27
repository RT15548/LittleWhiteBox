import { DOMPurify } from '../../../../../../../../lib.js';
import { createGalleryImageWindow } from '../../shared/gallery-image-window.js';
import { createGalleryImageRequests } from './gallery-image-requests.js';
import { createGalleryFeedback } from './gallery-feedback.js';
import { mountServerPluginGuide } from '../../../../shared/server-plugin/installation-guide.js';
import { NOVEL_API_DEFAULTS, NOVEL_API_FIELDS, normalizeNovelApiConfig } from './novel-api-config.js';
import { API_PRESET_COPY } from '../../shared/api-presets-copy.js';
import { CHARACTER_LOCK_COPY } from '../../shared/character-lock-copy.js';
import { observeAsyncCallback, observeBackgroundTask } from '../../../../shared/common/async-errors.js';
import { createSandboxToolHost } from '../../shared/custom-tool-sandbox.js';
import { collectToolBlocks, normalizeToolDefinition } from '../../shared/custom-tools.js';
import { createQuickTestView } from './quick-test-view.js';
import { GALLERY_BATCH_COPY } from '../../shared/gallery-batch.js';
import { createGalleryZipDownload } from '../../shared/gallery-zip-download.js';
import { countEnabledNamedTags, normalizeNamedTagList } from '../../shared/named-tag-items.js';
import { formatFormTypeSummary, getCharacterForms, getEnabledCharacterForms, hasMultipleForms } from '../../shared/character-forms.js';
import { createGroupHeightController } from '../../shared/character-group-height.js';
import {
    FORM_COPY,
    FORM_MAX_COUNT,
    NAMED_TAG_EDITOR_KINDS,
    appendNamedTagEditorItem,
    collectFormModels,
    createBlankFormModel,
    createEditorSectionState,
    createFormSortable,
    createNamedTagSortables,
    draftToMultiForm,
    draftToSingleForm,
    duplicateFormModels,
    duplicateNamedTagEditorItem,
    formModelsFromCharacter,
    formRef,
    isFormHeaderToggleTarget,
    isNamedTagHeaderToggleTarget,
    namedTagKindOfRow,
    parseFormRef,
    readFormFields,
    refreshFormHeader,
    refreshFormTypeBadge,
    refreshNamedTagItemHeader,
    removeNamedTagEditorItem,
    renderCharacterFormSections,
    renderFormsSection,
    setEditorSectionCollapsed,
    syncFormList,
    syncNamedTagEditorList,
    toggleFormCard,
    toggleFormEnabled,
    toggleNamedTagItem,
    toggleNamedTagItemEnabled,
} from '../../shared/character-edit-form.js';
import { EXTRA_TAGS_COPY, renderCharacterEditorNote } from '../../shared/character-editor-copy.js';
import { installTextareaAutofit } from '../../shared/textarea-autofit.js';
import { createAutoSave, AUTO_SAVE_COPY } from '../../shared/auto-save.js';
import {
    applyCharacterEdit,
    isBlankCharacterEditor,
    isCharacterRowToggleTarget,
    readCharacterEditor,
    renderCharacterSaveStatus,
    setCharacterSaveStatus,
} from '../../shared/character-editor-autosave.js';
import { bindInlineRename } from '../../shared/inline-rename.js';
import { resolveInitialTab, saveLastTab } from '../../shared/last-tab.js';
import { renderCharacterActionIcon } from '../../shared/character-action-icons.js';

let quickTestView;

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

const CHARACTER_CARD_COPY = Object.freeze({
    more: '更多操作',
    duplicate: '复制人设',
    remove: '删除',
    removeGroup: '删除分组',
});

const CHARACTER_TYPES = [
    { value: 'girl', label: 'girl (少女)' },
    { value: 'woman', label: 'woman (成年女性)' },
    { value: 'boy', label: 'boy (少年)' },
    { value: 'man', label: 'man (成年男性)' },
    { value: 'other', label: 'other (其他)' },
    { value: 'no_humans', label: 'no_humans (非人主体)' },
    { value: 'custom', label: '自定义...' }
];

// 类型的短标签（摘要栏 / 形态头部的小徽标）：预设类型取下拉框文案的第一个词（girl），自定义类型取它自己的第一个词。
function shortCharType(type) {
    return (CHARACTER_TYPES.find(t => t.value === type)?.label || type || 'girl').split(' ')[0];
}

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
    imageTitleMode: 'none',
    saveAsJpeg: false,
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
    refreshHint: '建议先尝试刷新页面',
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
// 正在编辑的那张卡片的自动保存（同一时刻最多一张）：{ id, saver, status }，见下方“角色编辑区：展开 / 收起与自动保存”。
let charAutoSave = null;
// 正在编辑的卡片的表单内容快照：任何会重绘列表的操作（库操作、INIT_DATA 回包）前读回，重绘后恢复，
// 避免丢掉尚未点“保存”的输入。
let editingDraft = null;
// 编辑卡片里“固定外貌 / 服装 / 动态标签”三个分区的折叠状态：按角色 id 记在页面会话里，
// 保存 / 取消 / 重绘后再次编辑同一个角色时保持上次的样子（界面状态，不进入保存的数据）。
const editorSections = createEditorSectionState();
// 点“添加角色”得到、尚未点“保存”的空白草稿（id → 角色对象）：只存在于本页，不写入持久化，
// 也不参与撤销快照 / 指纹 / 导出，直到用户保存。
const draftCharacters = new Map();
const saveBtnStates = new WeakMap();
const promptTextDraftsByPreset = new Map();
const modelGuideDraftsByPreset = new Map();
// 请求结构的未保存草稿：presetId -> 布局。与上面两个不同，草稿与已保存版本一致时会被丢弃（见 pruneLayoutDrafts）。
const layoutDraftsByPreset = new Map();
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

const galleryImageRequests = createGalleryImageRequests(postToParent);
const galleryFeedback = createGalleryFeedback(document, postToParent);
const galleryImageWindow = createGalleryImageWindow({ load: galleryImageRequests.load });
function syncGalleryImages() {
    const root = modalData.slotId ? $('nd_gallery_modal') : $('view-gallery');
    galleryImageWindow.sync(root?.querySelectorAll('img[data-gallery-id]') || []);
}
// Preserve object-URL image previews as well as DOMPurify's standard safe URL schemes.
const GALLERY_HTML_SANITIZE_OPTIONS = {
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix|blob):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
};



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

// 页面刚打开、还没有人点过页签时，才用“打开方指定的（?view=）/ 上次记住的”页签；用户先点了就不再覆盖。
let viewChosen = false;

function restoreInitialView() {
    if (viewChosen) return;
    const tabs = Array.from($$('.nav-item'),item => item.dataset.view);
    const requested = new URLSearchParams(window.location.search).get('view');
    switchView(resolveInitialTab({ provider: 'novelai', tabs, requested, fallback: 'test' }));
}

function switchView(viewId) {
    viewChosen = true;
    saveLastTab('novelai', viewId);
    $$('.view').forEach(v => v.classList.remove('active'));
    $$('.nav-item, .mobile-nav-item').forEach(n => n.classList.remove('active'));
    $(`view-${viewId}`)?.classList.add('active');
    $$(`[data-view="${viewId}"]`).forEach(n => n.classList.add('active'));
    // 隐藏期间重绘的分组滚动区没法写入滚动位置：回到本视图、能显示了再补上。
    if (viewId === 'characters') {
        const charList = $('nd_char_list');
        if (charList) restoreGroupScroll(charList);
    }
    if (viewId !== 'gallery' && modalData.slotId) closeGalleryModal();
    if (viewId !== 'gallery') galleryFeedback.clear();
    syncGalleryImages();
    quickTestView?.setActive(viewId === 'test');
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

// 角色所在分组是否上锁（未分组、分组不存在、模块未加载都算未锁）。
function isCharacterGroupLocked(char, library = getCharacterLibrary()) {
    return CL ? CL.isGroupLocked(library, char.groupId || '') : false;
}

// 角色摘要里的上锁标签：自己上锁优先显示“已上锁”，只有分组上锁显示“分组已上锁”。
function characterLockLabel(char, library = getCharacterLibrary()) {
    if (!CL) return '';
    if (char.locked === true) return CHARACTER_LOCK_COPY.ownLabel;
    return isCharacterGroupLocked(char, library) ? CHARACTER_LOCK_COPY.groupLabel : '';
}

// 角色卡上锁按钮的外观；按钮的 active / aria-pressed 只反映角色自己的锁（继承自分组的锁不算）。
function describeCharacterLock(char, library = getCharacterLibrary()) {
    const own = char.locked === true;
    return {
        own,
        title: own ? CHARACTER_LOCK_COPY.characterLockedTitle : (isCharacterGroupLocked(char, library) ? CHARACTER_LOCK_COPY.characterInheritedTitle : CHARACTER_LOCK_COPY.characterUnlockedTitle),
        icon: own ? 'fa-lock' : 'fa-lock-open',
    };
}

function getFilteredCharacters(chars = []) {
    const query = String(charFilters.query || '').trim().toLowerCase();
    const typeFilter = charFilters.type || 'all';
    const statusFilter = charFilters.status || 'all';
    const library = getCharacterLibrary();

    return chars.filter(char => {
        // 多形态角色：搜索覆盖每个形态的名称与内容，类型 / 状态筛选按形态汇总（没有额外形态时就是角色自己的字段）。
        const forms = getCharacterForms(char);
        if (query) {
            const haystack = [
                char.name,
                ...(char.aliases || []),
                ...forms.flatMap(form => [
                    form.name,
                    form.type,
                    form.appearance,
                    form.negativeTags,
                    form.danbooruTag,
                    ...((form.outfits || []).flatMap(outfit => [outfit?.name, outfit?.tags])),
                    ...((form.dynamicStates || []).flatMap(item => [item?.name, item?.tags])),
                ]),
            ].filter(Boolean).join(' ').toLowerCase();

            if (!haystack.includes(query)) return false;
        }

        if (typeFilter !== 'all' && !forms.some(form => normalizeCharType(form.type || 'girl') === typeFilter)) {
            return false;
        }

        // “完整”= 每个形态都有固定外貌；“缺外貌”= 至少一个形态没有。
        const allHaveAppearance = forms.every(form => !!form.appearance);
        if (statusFilter === 'complete' && !allHaveAppearance) return false;
        if (statusFilter === 'incomplete' && allHaveAppearance) return false;
        if (statusFilter === 'danbooru' && !forms.some(form => !!form.danbooruTag)) return false;
        if (statusFilter === 'negative' && !forms.some(form => !!form.negativeTags)) return false;
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
    const readyCount = allChars.filter(char => getCharacterForms(char).every(form => !!form.appearance)).length;
    const missingCount = allChars.length - readyCount;
    const danbooruCount = allChars.filter(char => getCharacterForms(char).some(form => !!form.danbooruTag)).length;
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

// ═══════════════════════════════════════════════════════════════════════════
// 角色分组
// ═══════════════════════════════════════════════════════════════════════════
// 分组 / 排序 / 批量逻辑在 shared/character-library.js（纯函数）；本页只负责渲染与交互。

let CL = null; // character-library.js 的模块命名空间，DOMContentLoaded 末尾动态引入
let CD = null; // character-library-dialog.js（导入对话框、导出文件名），与 CL 一同动态引入
let CS = null; // character-list-scroll.js（拖拽时的自动滚动），与 CL 一同动态引入
let GP = null; // character-group-presets-ui.js（分组预设面板组件），与 CL 一同动态引入
let GPM = null; // 分组预设领域操作，与角色库一起加载
let CM = null; // character-card-menu.js（角色卡“更多操作”下拉菜单的开关与定位），与 CL 一同动态引入
let cardMenu = null; // 菜单控制器：第一次打开菜单时才创建（它会在 document 上挂监听）
function getCardMenu() {
    if (!cardMenu && CM) cardMenu = CM.createCardMenuController({ document });
    return cardMenu;
}
let groupHeights = null; // 分组高度控制器，setupCharacterDragAndSelection 里创建
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
    try { localStorage.setItem(GROUP_COLLAPSE_KEY, JSON.stringify(charGroupCollapsed)); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "saveCharGroupCollapsed" }, caughtError); }
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
function saveCharacterLibrary(restorePresetReferences, requestId = '') {
    postToParent({ type: 'SAVE_CHARACTER_TAGS', characterTags: persistedCharacters(), characterGroups: state.characterGroups || [],
        ...(restorePresetReferences ? { restorePresetReferences } : {}), ...(requestId ? { requestId } : {}) });
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
const GROUP_SWITCH_TITLE_ON = '已开启。点击关闭分组：组内角色不再参与出图，各角色自己的开关保持不变';
const GROUP_SWITCH_TITLE_OFF = '已关闭。点击开启分组：组内角色按各自的开关参与出图';
const GROUP_SWITCH_STATE_TEXT = Object.freeze({ on: '已开启', off: '已关闭' });

function describeGroupHeader(library, group) {
    const { own, total, enabled, locked } = CL.getGroupSummary(library, group.id);
    return {
        enabled,
        locked,
        lockTitle: locked ? CHARACTER_LOCK_COPY.groupLockedTitle : CHARACTER_LOCK_COPY.groupUnlockedTitle,
        lockIcon: locked ? 'fa-lock' : 'fa-lock-open',
        // 窄栏里分组名优先：计数只写“自己开着数/总数”，完整含义放在 title / aria-label 里。
        countText: `${own}/${total}`,
        countTitle: `组内自己开着的角色 ${own} 个，共 ${total} 个${enabled ? '' : '；分组已关闭，组内角色当前都不参与出图'}`,
        switchTitle: enabled ? GROUP_SWITCH_TITLE_ON : GROUP_SWITCH_TITLE_OFF,
        switchIcon: enabled ? 'fa-toggle-on' : 'fa-toggle-off',
        switchText: enabled ? GROUP_SWITCH_STATE_TEXT.on : GROUP_SWITCH_STATE_TEXT.off,
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
                    <button type="button" class="char-action-button char-group-switch${header.enabled ? ' active' : ''}" data-group-action="toggle-enabled" data-group-id="${gid}" title="${header.switchTitle}" aria-label="${header.switchTitle} ${gname}" aria-pressed="${header.enabled}"><i class="fa-solid ${header.switchIcon}" aria-hidden="true"></i><span class="char-switch-text">${header.switchText}</span></button>`;
        // 分组头只留开关 / 添加（分组名是就地改名输入框）；上锁分组与删除分组收进最右边的“…”菜单（与角色卡同一套菜单，同一时间只开一个）。
        const lockActionLabel = header.locked ? CHARACTER_LOCK_COPY.unlockAction : CHARACTER_LOCK_COPY.lockAction;
        const manage = group.virtual ? '' : `
                    <span class="char-menu-wrap" data-card-menu>
                        <button type="button" class="char-action-button char-menu-button" data-group-action="menu" data-group-id="${gid}" title="${CHARACTER_CARD_COPY.more}" aria-label="${CHARACTER_CARD_COPY.more} ${gname}" aria-haspopup="menu" aria-expanded="false"><i class="fa-solid fa-ellipsis" aria-hidden="true"></i></button>
                        <div class="char-menu" role="menu" aria-label="${CHARACTER_CARD_COPY.more} ${gname}" hidden>
                            <button type="button" role="menuitem" class="char-menu-item char-group-lock${header.locked ? ' active' : ''}" data-group-action="toggle-lock" data-group-id="${gid}" title="${header.lockTitle}" aria-label="${lockActionLabel}分组 ${gname}" aria-pressed="${header.locked}"><i class="fa-solid ${header.lockIcon}" aria-hidden="true"></i><span class="char-menu-label">${lockActionLabel}</span></button>
                            <button type="button" role="menuitem" class="char-menu-item danger" data-group-action="delete" data-group-id="${gid}" title="${CHARACTER_CARD_COPY.removeGroup}" aria-label="${CHARACTER_CARD_COPY.removeGroup} ${gname}"><i class="fa-solid fa-trash" aria-hidden="true"></i><span class="char-menu-label">${CHARACTER_CARD_COPY.removeGroup}</span></button>
                        </div>
                    </span>`;
        const body = group.characters.length
            ? group.characters.map(renderCard).join('')
            : '<div class="char-group-empty">本组暂无角色</div>';
        return `
        <section class="char-group${collapsed ? ' collapsed' : ''}${header.enabled ? '' : ' group-disabled'}" data-group-id="${gid}">
            <div class="char-group-header">
                <button type="button" class="char-group-collapse" data-group-action="collapse" data-group-id="${gid}" title="${collapsed ? '展开' : '折叠'}" aria-expanded="${!collapsed}" aria-label="${collapsed ? '展开' : '折叠'}分组 ${gname}"><i class="fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-down'}"></i></button>
                ${charSelectMode ? `<input type="checkbox" class="char-group-select" aria-label="选择分组 ${gname} 的全部角色">` : ''}
                ${!group.virtual && !filtering ? `<span class="char-drag-handle" role="button" tabindex="0" data-drag-group="${gid}" title="拖动调整分组顺序，也可聚焦后按 ↑ / ↓" aria-label="拖动调整分组 ${gname} 的顺序">⋮⋮</span>` : ''}
                ${group.virtual ? `<span class="char-group-name" title="${gname}">${gname}</span>` : `<input type="text" class="char-group-name inline-name" data-group-id="${gid}" value="${gname}" placeholder="分组名称" title="点一下改名（Enter 确认，Esc 还原）" aria-label="分组名称 ${gname}" autocomplete="off">`}
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

// 分组名就地改名：校验沿用 CL.renameGroup（空名 / 重名 / 过长由它拒绝），被拒绝时返回 false，输入框还原成原名。
function renameGroupInline(input, name) {
    let renamed = false;
    runLibraryAction(() => {
        applyCharacterLibrary(CL.renameGroup(getCharacterLibrary(), input.dataset.groupId, name));
        renamed = true;
    });
    return renamed;
}

function handleGroupAction(action, groupId, trigger) {
    if (action === 'menu') {
        if (trigger) getCardMenu()?.toggle(trigger);
        return;
    }
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
    // 新建角色会展开新的编辑区：先把正在编辑的那张保存好（保存不了就留在原处，不新建）。
    if (action === 'add' && editingCharId) {
        runEditorTask(leaveCharacterEditor().then((left) => { if (left) handleGroupAction(action, groupId, trigger); }));
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
        } else if (action === 'toggle-lock') {
            applyCharacterLibrary(CL.setGroupLocked(library, groupId, !CL.isGroupLocked(library, groupId)));
        } else if (action === 'add') {
            const { library: next, id } = CL.addCharacter(library, { name: '' }, { groupId });
            state.characterTags = next.characters;
            registerDraftCharacter(next.characters.find(char => char.id === id));
            charGroupCollapsed[collapseKey(groupId)] = false;
            saveCharGroupCollapsed();
            resetCharacterFilters(false);
            runEditorTask(openCharacterEditor(id, { fresh: true }));
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
        } catch (caughtError) { console.warn({ source: import.meta.url, operation: "libraryFingerprint" }, caughtError); }
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
    try { event.target.setPointerCapture?.(event.pointerId); } catch (caughtError) { console.debug({ source: import.meta.url, operation: "startDrag" }, caughtError); }
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
    // 编辑卡片里服装 / 动态标签条目的拖拽排序（复用 sortable-list.js，与预设列表同一套指针 + 键盘交互）。
    createNamedTagSortables({ container: list, document, autoScroll: event => presetListKit?.autoScroll(event, list) });
    // 多形态角色的形态卡片：同一套拖拽 + 键盘排序。
    createFormSortable({ container: list, document, autoScroll: event => presetListKit?.autoScroll(event, list) });
    // 分组滚动区高度：用户可在分组下沿拖动调整，存本机 localStorage（见 character-group-height.js）。
    groupHeights = createGroupHeightController({ list, document, groupSelector: '.char-group', bodySelector: '.char-group-body' });
    list.addEventListener('pointerdown', (event) => {
        const charHandle = event.target.closest('[data-drag-char]');
        const groupHandle = event.target.closest('[data-drag-group]');
        if (charHandle) startDrag(event, 'char', charHandle.dataset.dragChar);
        else if (groupHandle) startDrag(event, 'group', groupHandle.dataset.dragGroup);
    });
    list.addEventListener('keydown', handleDragKeydown);
    bindCharacterAutoSave(list);
    bindInlineRename(list, { selector: '.char-group-name.inline-name', onCommit: renameGroupInline });
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
    // 编辑卡片里的服装 / 动态标签条目：标签输入时同步折叠头里的预览（名称输入框本身就在头部）。
    list.addEventListener('input', (event) => {
        const input = event.target;
        // 形态的自定义类型：头部的类型徽标跟着输入走。
        if (input.matches?.('.char-form .char-edit-type-custom')) refreshFormTypeBadge(input.closest('.char-form'), shortCharType);
        if (!input.matches?.('.char-outfit-tags, .char-dynstate-tags')) return;
        const row = input.closest('.named-tag-item');
        refreshNamedTagItemHeader(row, namedTagKindOfRow(row));
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

// ── 角色编辑区：展开 / 收起与自动保存 ──────────────────────────────────
// 点角色行展开 / 收起编辑区（同一时刻只开一张）；没有手动保存 / 取消：改动停下来等一小会儿后自动落盘，失焦 / 收起 / 切换 / 关页时立刻落盘。
// 保存只改角色对象并发给宿主，不重绘、不碰表单节点，输入中的焦点和光标不受影响；保存一个接一个（见 auto-save.js）。
const CHAR_SAVE_ACK_TIMEOUT_MS = 10000;
let charSavePending = null; // { requestId, resolve, timer }：已发给宿主、等回执的那次保存
let charEditorBusy = false; // 正在保存后切换，忽略重复点击
let charTouchQueued = false;

function editingCardOf(id) {
    return Array.from(document.querySelectorAll('#nd_char_list .char-card.editing')).find(node => node.dataset.id === id) || null;
}

// 发出保存并等宿主回执（STATUS，target: 'char-tags'）；失败或超时返回 false。
function saveCharacterLibraryAcked() {
    return new Promise((resolve) => {
        const requestId = `char-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const timer = setTimeout(() => {
            if (charSavePending?.requestId !== requestId) return;
            charSavePending = null;
            resolve(false);
        }, CHAR_SAVE_ACK_TIMEOUT_MS);
        charSavePending = { requestId, resolve, timer };
        saveCharacterLibrary(undefined, requestId);
    });
}

function handleCharSaveStatus(data) {
    if (!charSavePending || charSavePending.requestId !== data.requestId || !['success', 'error'].includes(data.state)) return;
    const { resolve, timer } = charSavePending;
    clearTimeout(timer);
    charSavePending = null;
    resolve(data.state === 'success');
}

// 保存后只轻量刷新摘要行与计数（名字、类型徽标、状态、分组计数）：不重绘，正在输入的表单原样保留。
function refreshCharSummary(card, char) {
    if (!card) return;
    const name = card.querySelector('.char-name');
    if (name) name.textContent = char.name || '新角色';
    const identity = card.querySelector('.char-identity');
    let badge = identity?.querySelector('.char-type-badge');
    const typeShort = formatFormTypeSummary(char, shortCharType);
    if (!typeShort) badge?.remove();
    else if (identity) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'char-type-badge';
            identity.appendChild(badge);
        }
        badge.textContent = typeShort;
    }
    const status = card.querySelector('.char-status');
    if (status) setCharStatus(status, char);
    refreshEnabledSummary();
}

// 把读出的表单写回角色并存盘；点过“保存”才算真正的角色，所以第一次保存时把它从未保存草稿里移出（失败再放回去）。
async function saveEditedCharacter(id, value) {
    const char = state.characterTags.find(item => item.id === id);
    if (!char) return { ok: false, error: '角色已不存在' };
    applyCharacterEdit(char, value);
    const wasDraft = draftCharacters.delete(id);
    const ok = await saveCharacterLibraryAcked();
    if (!ok) {
        if (wasDraft) registerDraftCharacter(char);
        return { ok: false, error: '保存失败' };
    }
    refreshCharSummary(editingCardOf(id), char);
    return { ok: true };
}

function startCharAutoSave(id, { fresh = false } = {}) {
    discardCharacterAutoSave();
    const session = { id, saver: null, status: { state: 'saved', text: AUTO_SAVE_COPY.saved } };
    let lastRead = null;
    session.saver = createAutoSave({
        // 卡片暂时不在 DOM 里（例如被筛选条件隐藏）时沿用上一次读到的内容。
        read: () => {
            const card = editingCardOf(id);
            if (card) lastRead = readCharacterEditor(card);
            return lastRead || { error: '' };
        },
        save: value => saveEditedCharacter(id, value),
        onStatus: (status, text) => {
            session.status = { state: status, text };
            setCharacterSaveStatus(editingCardOf(id), status, text);
        },
    });
    charAutoSave = session;
    // 已有角色：打开时的内容就是“已保存”的基线；新建的角色还没存过，状态栏先提示要填名称。
    const opened = editingCardOf(id) ? readCharacterEditor(editingCardOf(id)) : null;
    if (!fresh && opened && !opened.error) session.saver.setBaseline(opened.key);
    session.saver.touch();
}

function discardCharacterAutoSave() {
    charAutoSave?.saver.dispose();
    charAutoSave = null;
}

function scheduleCharAutoSaveTouch() {
    if (!charAutoSave || charTouchQueued) return;
    charTouchQueued = true;
    setTimeout(() => { charTouchQueued = false; charAutoSave?.saver.touch(); }, 0);
}

// 离开当前编辑区之前把改动存好：空白的新建草稿直接丢掉；存不了（名称为空、宿主保存失败）就留在原处，状态栏写明原因。返回是否可以离开。
async function leaveCharacterEditor() {
    const id = editingCharId;
    if (!id) return true;
    const card = editingCardOf(id);
    if (charAutoSave?.id === id && !(card && draftCharacters.has(id) && isBlankCharacterEditor(card))) {
        const result = await charAutoSave.saver.flush();
        if (!result.ok) {
            editingCardOf(id)?.querySelector('.char-edit-name')?.focus();
            return false;
        }
    }
    discardCharacterAutoSave();
    editingCharId = null;
    editingDraft = null;
    return true;
}

let panelClosing = false;
async function requestPanelClose() {
    if (panelClosing) return;
    panelClosing = true;
    try {
        if (await leaveCharacterEditor()) postToParent({ type: 'CLOSE' });
    } finally {
        panelClosing = false;
    }
}

// 展开某张角色卡的编辑区（先收起并保存别的）；fresh：刚新建的草稿。
async function openCharacterEditor(id, { fresh = false } = {}) {
    if (editingCharId === id || charEditorBusy) return;
    charEditorBusy = true;
    try {
        if (!(await leaveCharacterEditor())) return;
        editingCharId = id;
        editingDraft = null;
        renderCharList();
        startCharAutoSave(id, { fresh });
        revealEditingCard();
        if (fresh) setTimeout(() => editingCardOf(id)?.querySelector('.char-edit-name')?.focus(), 50);
    } finally {
        charEditorBusy = false;
    }
}

async function closeCharacterEditor() {
    const id = editingCharId;
    if (!id || charEditorBusy) return;
    charEditorBusy = true;
    try {
        if (!(await leaveCharacterEditor())) return;
        renderCharList(); // 空白的新建草稿在这里被移除
        revealCharCard(id);
    } finally {
        charEditorBusy = false;
    }
}

function toggleCharacterEditor(id) {
    return editingCharId === id ? closeCharacterEditor() : openCharacterEditor(id);
}

// 点击 / 键盘触发的展开、收起、新建不关心结果（存不了时状态栏已写明原因），这里只保证不留下未处理的 Promise。
function runEditorTask(task) {
    task.catch((caughtError) => { console.warn({ source: import.meta.url, operation: 'character-editor' }, caughtError); });
}

function bindCharacterAutoSave(list) {
    // 表单改动（输入、下拉、增删 / 排序 / 启停条目等点击与拖动）之后重新判断要不要保存；内容没变时什么也不做。
    for (const type of ['input', 'change', 'click', 'pointerup', 'keyup']) {
        list.addEventListener(type, (event) => { if (event.target.closest?.('.char-card.editing')) scheduleCharAutoSaveTouch(); });
    }
    // 焦点离开输入框（换到别的输入框、按钮或页面其它地方）就立刻保存。
    list.addEventListener('focusout', (event) => {
        if (event.target.closest?.('.char-card.editing')) charAutoSave?.saver.flush();
    });
    // Browser navigation cannot await acknowledgements. Ordinary panel close
    // uses requestPanelClose; navigation warns while an edit is still unsaved.
    window.addEventListener('beforeunload', event => {
        const card = editingCardOf(editingCharId);
        if (!charAutoSave || !card || (draftCharacters.has(editingCharId) && isBlankCharacterEditor(card))) return;
        if (!charAutoSave.saver.dirty && !charAutoSave.saver.pending) return;
        event.preventDefault();
        event.returnValue = '';
    });
    window.addEventListener('pagehide', () => charAutoSave?.saver.flush());
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') charAutoSave?.saver.flush(); });
    list.addEventListener('keydown', (event) => {
        const toggle = event.target.closest?.('[data-char-toggle]');
        if (!toggle || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        runEditorTask(toggleCharacterEditor(toggle.closest('.char-card')?.dataset.id));
    });
}

// 读出正在编辑的卡片的表单内容（包括刚点“添加服装/动态标签”还没填的空行）。
function readEditingDraft() {
    if (!editingCharId) return null;
    const card = Array.from(document.querySelectorAll('#nd_char_list .char-card.editing'))
        .find(node => node.dataset.id === editingCharId);
    if (!card) return null;
    const value = selector => card.querySelector(selector)?.value ?? '';
    const base = {
        id: editingCharId,
        name: value('.char-edit-name'),
        aliases: value('.char-edit-aliases'),
    };
    // 多形态布局：每个形态卡片读成一个编辑模型（折叠 / 展开状态一并带上，重绘后恢复）。
    const forms = collectFormModels(card, { keepEmpty: true, withUiState: true });
    if (forms) return { ...base, multi: true, forms };
    // withUiState：条目的展开 / 折叠也带进草稿，重绘后恢复。
    return {
        ...base,
        formName: value('.char-edit-form-name'),
        ...readFormFields(card, { keepEmpty: true, withUiState: true }),
    };
}

// 类型下拉框的值 ←→ 保存的类型文本：不在预设列表里的类型显示为“自定义”并把原文放进自定义输入框。
function splitCharType(savedType) {
    const selected = normalizeCharType(savedType || 'girl');
    return { type: selected, typeCustom: selected === 'custom' ? String(savedType || '') : '' };
}

// 类型下拉框 + 自定义输入框（单形态布局与每张形态卡片共用）。
function renderCharTypeFields(model) {
    const typeOptions = CHARACTER_TYPES.map(t =>
        `<option value="${t.value}"${t.value === model.type ? ' selected' : ''}>${t.label}</option>`
    ).join('');
    return `
                        <div class="form-group">
                            <label class="form-label">类型</label>
                            <select class="input char-edit-type">${typeOptions}</select>
                            <input type="text" class="input char-edit-type-custom${model.type === 'custom' ? '' : ' hidden'}" value="${escapeHtml(model.typeCustom || '')}" placeholder="如: mature female" style="margin-top:4px;">
                        </div>`;
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
    editorSections.prune(ids);
    if (editingCharId && !ids.has(editingCharId)) editingCharId = null;
    for (const id of [...draftCharacters.keys()]) {
        if (!ids.has(id)) { draftCharacters.delete(id); continue; }
        if (id === editingCharId) continue;
        draftCharacters.delete(id);
        selectedCharIds.delete(id);
        state.characterTags = state.characterTags.filter(char => char.id !== id);
    }
    if (editingDraft && editingDraft.id !== editingCharId) editingDraft = null;
    if (charAutoSave && charAutoSave.id !== editingCharId) discardCharacterAutoSave(); // 卡片被删除 / 放弃：它的自动保存也随之结束
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

const CHARACTER_STATUS_COPY = Object.freeze({
    groupDisabled: '分组已关闭', disabled: '停用', appearance: '固定外貌', negative: '负向',
    danbooru: 'DB', outfits: '服装', dynamicStates: EXTRA_TAGS_COPY.title,
    forms: (total, enabled = total) => (enabled === total ? `${total} 个形态` : `${enabled}/${total} 个形态`),
});

function characterStatusParts(char, library = getCharacterLibrary()) {
    const parts = [];
    const add = (key, text) => parts.push({ key, text });
    if (isCharacterGroupClosed(char, library)) add('group-disabled', CHARACTER_STATUS_COPY.groupDisabled);
    else if (char.enabled === false) add('disabled', CHARACTER_STATUS_COPY.disabled);
    const lockLabel = characterLockLabel(char, library);
    if (lockLabel) add(char.locked === true ? 'own-lock' : 'group-lock', lockLabel);
    // 多形态角色：芯片按全部形态汇总（任一形态有就算有），另加“N 个形态”。
    // 停用的形态不会发给 AI：内容芯片只看启用的形态，形态数在有停用时写成“启用/总数”。
    const allForms = getCharacterForms(char);
    const forms = getEnabledCharacterForms(char);
    if (allForms.length > 1) add('forms', CHARACTER_STATUS_COPY.forms(allForms.length, forms.length));
    if (forms.some(form => form.appearance)) add('appearance', CHARACTER_STATUS_COPY.appearance);
    if (forms.some(form => form.negativeTags)) add('negative', CHARACTER_STATUS_COPY.negative);
    if (forms.some(form => form.danbooruTag)) add('danbooru', CHARACTER_STATUS_COPY.danbooru);
    // 只数启用的条目：全部停用的服装 / 动态标签不算“有”，因为规划器看不到它们。
    if (forms.some(form => countEnabledNamedTags(form.outfits))) add('outfits', CHARACTER_STATUS_COPY.outfits);
    if (forms.some(form => countEnabledNamedTags(form.dynamicStates))) add('dynamic-states', CHARACTER_STATUS_COPY.dynamicStates);
    return parts;
}

function renderCharStatusHtml(parts) {
    return parts.map(({ key, text }) => `<span data-character-status="${key}"${key === 'own-lock' ? ' class="char-lock-label"' : ''}>${escapeHtml(text)}</span>`).join(' · ');
}

function setCharStatus(statusEl, char, library = getCharacterLibrary()) {
    statusEl.replaceChildren();
    characterStatusParts(char, library).forEach(({ key, text }, index) => {
        if (index) statusEl.appendChild(document.createTextNode(' · '));
        const label = document.createElement('span');
        label.dataset.characterStatus = key;
        if (key === 'own-lock') label.className = 'char-lock-label';
        label.textContent = text;
        statusEl.appendChild(label);
    });
}

// keepDraft：调用方刚刚改过 editingDraft（添加 / 删除形态、Danbooru 修正），草稿已是权威内容；
// 此时不能再把旧 DOM 读回草稿，否则会把刚做的改动覆盖掉（重绘出来的还是旧布局）。
function renderCharList({ keepDraft = false } = {}) {
    const list = $('nd_char_list');
    const empty = $('nd_char_empty');
    cardMenu?.close();
    if (!keepDraft) captureEditingDraft();
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
        // 多形态角色列出每个形态的类型（按形态顺序，逗号连接）；单形态就是它自己的类型。
        const typeShort = formatFormTypeSummary(c, shortCharType);
        const appearance = c.appearance || '';
        const outfits = normalizeNamedTagList(c.outfits);
        const dynamicStates = normalizeNamedTagList(c.dynamicStates);
        const statusParts = characterStatusParts(c, renderLibrary);
        const toggleTitle = isEnabled ? '停用角色' : '启用角色';
        const lockInfo = describeCharacterLock(c, renderLibrary);
        // 上锁项需要角色库模块（锁的读写都在 character-library.js），模块未加载时不渲染。
        const lockActionLabel = lockInfo.own ? CHARACTER_LOCK_COPY.unlockAction : CHARACTER_LOCK_COPY.lockAction;
        const lockItem = CL
            ? `
                        <button type="button" role="menuitem" class="char-menu-item char-lock-control${lockInfo.own ? ' active' : ''}" data-action="toggle-lock" data-id="${charId}" title="${lockInfo.title}" aria-label="${lockActionLabel} ${charName}" aria-pressed="${lockInfo.own}"><i class="fa-solid ${lockInfo.icon}" aria-hidden="true"></i><span class="char-menu-label">${lockActionLabel}</span></button>`
            : '';
        // 编辑中：自动保存的状态（已保存 / 保存中… / 未保存：原因）和“添加形态”放在吸顶的摘要行里，长表单滚动时始终看得到；没有手动保存 / 取消。
        const saveStatus = charAutoSave?.id === c.id ? charAutoSave.status : { state: 'saved', text: AUTO_SAVE_COPY.saved };
        const editButtons = isEditing
            ? `${renderCharacterSaveStatus(saveStatus.state, saveStatus.text, escapeHtml)}
                    <button type="button" class="btn btn-sm char-edit-add-form" data-action="add-form" data-id="${charId}" title="${escapeHtml(FORM_COPY.hint)}" aria-label="${FORM_COPY.addAction} ${charName}"><i class="fa-solid fa-plus" aria-hidden="true"></i><span>${FORM_COPY.addAction}</span></button>`
            : '';
        const canDrag = !!CL && !charFiltersActive() && !isEditing;
        const summary = `
            <div class="char-card-summary">
                ${canDrag ? `<span class="char-drag-handle" role="button" tabindex="0" data-drag-char="${charId}" title="拖动排序，也可聚焦后按 ↑ / ↓" aria-label="拖动排序 ${charName}">⋮⋮</span>` : ''}
                ${charSelectMode && !draftCharacters.has(c.id) ? `<input type="checkbox" class="char-select" data-select-char="${charId}" aria-label="选择 ${charName}">` : ''}
                <div class="char-identity" role="button" tabindex="0" aria-expanded="${isEditing}" aria-label="${isEditing ? '收起' : '展开'}编辑 ${charName}" data-char-toggle>
                    <span class="char-name">${charName}</span>
                    ${typeShort ? `<span class="char-type-badge">${escapeHtml(typeShort)}</span>` : ''}
                </div>
                <span class="char-status">${renderCharStatusHtml(statusParts)}</span>
                <div class="char-actions" aria-label="角色操作">
                    ${editButtons}
                    <button type="button" class="char-action-button char-enabled-control${isEnabled ? ' active' : ''}" data-action="toggle-enabled" data-id="${charId}" title="${toggleTitle}" aria-label="${toggleTitle} ${charName}" aria-pressed="${isEnabled}">${renderCharacterActionIcon(isEnabled ? 'enabled' : 'disabled')}</button>
                    <span class="char-menu-wrap" data-card-menu>
                        <button type="button" class="char-action-button char-menu-button" data-action="menu" data-id="${charId}" title="${CHARACTER_CARD_COPY.more}" aria-label="${CHARACTER_CARD_COPY.more} ${charName}" aria-haspopup="menu" aria-expanded="false"><i class="fa-solid fa-ellipsis" aria-hidden="true"></i></button>
                        <div class="char-menu" role="menu" aria-label="${CHARACTER_CARD_COPY.more} ${charName}" hidden>${lockItem}
                            <button type="button" role="menuitem" class="char-menu-item" data-action="duplicate" data-id="${charId}" title="${CHARACTER_CARD_COPY.duplicate}"><i class="fa-solid fa-clone" aria-hidden="true"></i><span class="char-menu-label">${CHARACTER_CARD_COPY.duplicate}</span></button>
                            <button type="button" role="menuitem" class="char-menu-item danger" data-action="delete" data-id="${charId}" title="${CHARACTER_CARD_COPY.remove}"><i class="fa-solid fa-trash" aria-hidden="true"></i><span class="char-menu-label">${CHARACTER_CARD_COPY.remove}</span></button>
                        </div>
                    </span>
                </div>
            </div>`;

        if (isEditing) {
            // 重绘前读回的未保存输入（见 captureEditingDraft）优先于已保存的值。
            const draft = editingDraft && editingDraft.id === c.id ? editingDraft : null;
            const formName = draft ? draft.name : (c.name || '');
            const formAliases = draft ? draft.aliases : (c.aliases || []).join(', ');
            const isMulti = draft ? draft.multi === true : hasMultipleForms(c);
            const sectionCtx = { charId: c.id, escapeHtml, danbooruEnabled: !!state.danbooruLocalDB };
            const nameHtml = `
                        <div class="form-group">
                            <label class="form-label">角色名称</label>
                            <input type="text" class="input char-edit-name" value="${escapeHtml(formName)}" placeholder="角色名称">
                        </div>`;
            const aliasesHtml = `
                    <div class="form-group">
                        <label class="form-label">别名（逗号分隔）</label>
                        <input type="text" class="input char-edit-aliases" value="${escapeHtml(formAliases)}" placeholder="小名, 昵称, ...">
                    </div>`;
            let formsHtml;
            let nameRowHtml;
            if (isMulti) {
                // ≥2 个形态：类型与三个分区都在各自的形态卡片里。
                const models = draft ? draft.forms : formModelsFromCharacter(c, splitCharType);
                nameRowHtml = nameHtml;
                formsHtml = renderFormsSection(models, {
                    ...sectionCtx,
                    renderTypeFields: renderCharTypeFields,
                    typeShort: shortCharType,
                    isSectionCollapsed: (formKey, sectionKey) => editorSections.isCollapsed(formRef(c.id, formKey), sectionKey),
                });
            } else {
                // 单形态：与加入形态之前的编辑卡片相同（“添加形态”按钮在吸顶摘要行里）；形态名称（删到只剩一个形态时留下的）放在隐藏输入框里随草稿 / 保存带着走。
                const single = draft
                    ? { ...draft }
                    : { ...splitCharType(c.type), appearance, negativeTags: c.negativeTags || '', danbooruTag: c.danbooruTag || '', outfits, dynamicStates, formName: c.formName || '' };
                nameRowHtml = `
                    <div class="char-edit-row">
                        ${nameHtml}
                        ${renderCharTypeFields(single)}
                    </div>`;
                formsHtml = `
                    <input type="hidden" class="char-edit-form-name" value="${escapeHtml(single.formName || '')}">
                    ${renderCharacterFormSections(single, {
                        ...sectionCtx,
                        isSectionCollapsed: key => editorSections.isCollapsed(c.id, key),
                    })}`;
            }

            return `
            <div class="char-card editing${isEnabled ? '' : ' disabled'}${groupClosed ? ' group-closed' : ''}" data-id="${charId}">
                ${summary}
                <div class="char-edit-form">
                    ${nameRowHtml}
                    ${aliasesHtml}
                    ${formsHtml}
                    ${renderCharacterEditorNote()}
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
    groupHeights?.apply({ validGroupIds: groups.map(group => group.id) });

    list.querySelectorAll('.char-edit-type').forEach(sel => {
        sel.addEventListener('change', function() {
            const customInput = (this.closest('.char-form') || this.closest('.char-edit-form')).querySelector('.char-edit-type-custom');
            if (customInput) customInput.classList.toggle('hidden', this.value !== 'custom');
            refreshFormTypeBadge(this.closest('.char-form'), shortCharType);
        });
    });

    list.querySelectorAll('.char-outfit-editor-list').forEach(item => syncNamedTagEditorList(item, 'outfit'));
    list.querySelectorAll('.char-dynstate-editor-list').forEach(item => syncNamedTagEditorList(item, 'dynstate'));
    list.querySelectorAll('.char-form-list').forEach(item => syncFormList(item));
    syncSelectionCheckboxes();
}

// 分区折叠状态按“角色 id”记；形态卡片里的分区按“角色 id#形态 key”记（同一角色的各形态互不影响）。
function sectionStateId(charId, trigger) {
    const form = trigger?.closest?.('.char-form');
    return form ? formRef(charId, form.dataset.formKey) : charId;
}

// 形态的增删都走草稿：先把表单读回草稿，改草稿里的形态列表，再整体重绘（输入框里未保存的内容不丢）。
function addCharacterForm(id) {
    captureEditingDraft();
    let draft = editingDraft && editingDraft.id === id ? editingDraft : null;
    if (!draft) return;
    if (!draft.multi) {
        draft = draftToMultiForm(draft, splitCharType);
    } else if (draft.forms.length >= FORM_MAX_COUNT) {
        alert(FORM_COPY.limit);
        return;
    } else {
        draft = { ...draft, forms: [...draft.forms, createBlankFormModel(splitCharType)] };
    }
    editingDraft = draft;
    renderCharList({ keepDraft: true });
    const added = Array.from(document.querySelectorAll('#nd_char_list .char-card.editing .char-form')).pop();
    added?.scrollIntoView?.({ block: 'nearest' });
    added?.querySelector('.char-form-name')?.focus();
}

// 复制形态也走草稿：副本紧跟在原形态后面，展开、启用、名称加“副本”。
function duplicateCharacterForm(formKey) {
    captureEditingDraft();
    const draft = editingDraft && editingDraft.id === editingCharId ? editingDraft : null;
    if (!draft?.multi) return;
    if (draft.forms.length >= FORM_MAX_COUNT) {
        alert(FORM_COPY.limit);
        return;
    }
    const { models, copyKey } = duplicateFormModels(draft.forms, formKey);
    if (!copyKey) return;
    editingDraft = { ...draft, forms: models };
    renderCharList({ keepDraft: true });
    const copy = Array.from(document.querySelectorAll('#nd_char_list .char-card.editing .char-form'))
        .find(node => node.dataset.formKey === copyKey);
    copy?.scrollIntoView?.({ block: 'nearest' });
    copy?.querySelector('.char-form-name')?.focus();
}

function removeCharacterForm(formKey) {
    captureEditingDraft();
    const draft = editingDraft && editingDraft.id === editingCharId ? editingDraft : null;
    if (!draft?.multi) return;
    const target = draft.forms.find(form => form.key === formKey);
    if (!target) return;
    const hasContent = target.name || target.appearance || target.negativeTags || target.outfits?.length || target.dynamicStates?.length;
    if (hasContent && !confirm(`确定删除形态“${target.name || '未命名形态'}”？`)) return;
    const next = { ...draft, forms: draft.forms.filter(form => form.key !== formKey) };
    // 只剩一个形态：回到普通布局（剩下的形态成为角色自己的字段）。
    editingDraft = next.forms.length < 2 ? draftToSingleForm(next) : next;
    renderCharList({ keepDraft: true });
}

// 编辑卡片里的条目 / 搜索面板放在可折叠的分区里：分区折叠着时里面的新内容看不见，先展开它（记录与 DOM 一起改）。
function revealEditorSection(section, id, trigger) {
    if (!section?.classList.contains('is-collapsed')) return;
    editorSections.setCollapsed(sectionStateId(id, trigger), section.dataset.section, false);
    setEditorSectionCollapsed(section, false);
}

// 条目编辑器（character-edit-form.js）不直接写 innerHTML，由页面 sanitize 后插入。
const insertSanitizedHtml = (target, html, position = 'beforeend') => target.insertAdjacentHTML(position, DOMPurify.sanitize(html));

function handleCharAction(action, id, card, trigger, event) {
    if (action === 'menu') {
        if (trigger) getCardMenu()?.toggle(trigger);
    } else if (action === 'toggle-enabled') {
        const char = state.characterTags.find(c => c.id === id);
        if (!char) return;
        char.enabled = char.enabled === false;
        saveCharacterLibrary();
        card?.classList.toggle('disabled', !char.enabled);
        const status = card?.querySelector('.char-status');
        if (status) setCharStatus(status, char);
        if (trigger) {
            const toggleTitle = char.enabled ? '停用角色' : '启用角色';
            trigger.classList.toggle('active', char.enabled);
            trigger.title = toggleTitle;
            trigger.setAttribute('aria-label', `${toggleTitle} ${char.name || '新角色'}`);
            trigger.setAttribute('aria-pressed', String(char.enabled));
            trigger.innerHTML = DOMPurify.sanitize(renderCharacterActionIcon(char.enabled ? 'enabled' : 'disabled'));
        }
        refreshEnabledSummary();
    } else if (action === 'toggle-lock') {
        const char = state.characterTags.find(c => c.id === id);
        if (!char || !CL) return;
        // 与启用开关一样只改这一张卡的 DOM、不整体重绘，其他卡片里尚未保存的编辑不受影响。
        // 结果由纯函数算出，再原地写回现有对象（未保存的空白草稿仍指向同一个对象）；锁只在为 true 时保留该键。
        runLibraryAction(() => {
            const next = CL.setCharactersLocked(getCharacterLibrary(), [id], char.locked !== true)
                .characters.find(c => c.id === id);
            if (next?.locked === true) char.locked = true; else delete char.locked;
            saveCharacterLibrary();
            const library = getCharacterLibrary();
            const status = card?.querySelector('.char-status');
            if (status) setCharStatus(status, char, library);
            if (trigger) {
                const info = describeCharacterLock(char, library);
                trigger.classList.toggle('active', info.own);
                const actionLabel = info.own ? CHARACTER_LOCK_COPY.unlockAction : CHARACTER_LOCK_COPY.lockAction;
                trigger.title = info.title;
                trigger.setAttribute('aria-label', `${actionLabel} ${char.name || '新角色'}`);
                trigger.setAttribute('aria-pressed', String(info.own));
                const icon = trigger.querySelector('i');
                if (icon) icon.className = `fa-solid ${info.icon}`;
                const labelNode = trigger.querySelector('.char-menu-label');
                if (labelNode) labelNode.textContent = actionLabel;
            }
        });
    } else if (action === 'toggle-section') {
        // 只改 DOM 与会话记录，不重绘：其他输入框里尚未保存的内容不受影响。
        const section = trigger?.closest('.char-edit-section');
        const key = trigger?.dataset.section;
        if (!section || !key) return;
        setEditorSectionCollapsed(section, editorSections.toggle(sectionStateId(id, trigger), key));
    } else if (action === 'toggle-named-item') {
        // 折叠头整行都是触发区；点名称输入框 / 开关 / 拖动手柄是在操作它们，不切换折叠。
        if (!isNamedTagHeaderToggleTarget(event?.target)) return;
        const row = trigger?.closest('.named-tag-item');
        toggleNamedTagItem(row, namedTagKindOfRow(row));
    } else if (action === 'toggle-named-enabled') {
        // 菜单里的“停用 / 启用”：只改这一条的 DOM，草稿 / 保存时照样按行上的状态读。
        toggleNamedTagItemEnabled(trigger?.closest('.named-tag-item'));
    } else if (action === 'duplicate-named-item') {
        const row = trigger?.closest('.named-tag-item');
        const copy = duplicateNamedTagEditorItem(row, namedTagKindOfRow(row), {
            escapeHtml,
            insertHtml: insertSanitizedHtml,
        });
        copy?.scrollIntoView?.({ block: 'nearest' });
        copy?.querySelector('.named-tag-name')?.focus();
    } else if (action === 'add-outfit' || action === 'add-dynstate') {
        const kind = action === 'add-outfit' ? 'outfit' : 'dynstate';
        const meta = NAMED_TAG_EDITOR_KINDS[kind];
        // 多形态时按钮属于哪个形态卡片就操作哪个形态的列表。
        const list = (trigger?.closest('.char-form') || card)?.querySelector(`.${meta.classPrefix}-editor-list`);
        if (!list) return;
        revealEditorSection(list.closest('.char-edit-section'), id, trigger);
        const row = appendNamedTagEditorItem(list, kind, { escapeHtml, insertHtml: insertSanitizedHtml });
        row?.scrollIntoView?.({ block: 'nearest' });
        row?.querySelector(`.${meta.classPrefix}-name`)?.focus();
    } else if (action === 'remove-outfit' || action === 'remove-dynstate') {
        const kind = action === 'remove-outfit' ? 'outfit' : 'dynstate';
        const meta = NAMED_TAG_EDITOR_KINDS[kind];
        removeNamedTagEditorItem(trigger?.closest(`.${meta.classPrefix}-editor-item`), kind);
    } else if (action === 'search-danbooru') {
        if (!state.danbooruLocalDB) { alert('请先启用 Danbooru 本地资源库'); return; }
        // 搜索面板在“固定外貌”分区正文里。
        const formCard = trigger?.closest('.char-form');
        revealEditorSection((formCard || card)?.querySelector('.char-edit-section[data-section="appearance"]'), id, trigger);
        showLocalDanbooruFix(formRef(id, formCard?.dataset.formKey || ''));
    } else if (action === 'toggle-form') {
        // 形态头部整行都是触发区；点名称输入框 / 拖动手柄是在操作它们，不切换折叠。
        if (!isFormHeaderToggleTarget(event?.target)) return;
        toggleFormCard(trigger?.closest('.char-form'));
    } else if (action === 'toggle-form-enabled') {
        toggleFormEnabled(trigger?.closest('.char-form'));
    } else if (action === 'duplicate-form') {
        duplicateCharacterForm(trigger?.closest('.char-form')?.dataset.formKey);
    } else if (action === 'add-form') {
        addCharacterForm(id);
    } else if (action === 'remove-form') {
        removeCharacterForm(trigger?.dataset.formKey);
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

// ref 是“角色 id”或“角色 id#形态 key”（见 formRef）：多形态时每个形态各有自己的搜索面板和 Danbooru 标签。
function showLocalDanbooruFix(ref) {
    const charId = ref;
    const panel = document.querySelector(`.danbooru-panel[data-char-id="${ref}"]`);
    if (!panel) return;

    const char = state.characterTags.find(c => c.id === parseFormRef(ref).charId);
    const formDanbooru = panel.closest('.char-form, .char-edit-form')?.querySelector('.char-form-danbooru')?.value;
    const defaultQuery = formDanbooru || char?.danbooruTag || char?.name || '';

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
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') doSearch();
        else if (e.key === 'Escape') { e.preventDefault(); closeBtn.click(); } // Esc 先收起这个搜索面板，不关整个设置页
    });
    closeBtn.addEventListener('click', () => {
        panel.classList.add('hidden');
        panel.innerHTML = '';
    });

    if (defaultQuery) doSearch();
}

function renderLocalDanbooruResults(query, results, ref) {
    const panel = document.querySelector(`.danbooru-panel[data-char-id="${ref}"]`);
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
            try { appearanceTags = JSON.parse(item.dataset.tags); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "renderLocalDanbooruResults" }, caughtError); }

            const { charId: realCharId, formKey } = parseFormRef(ref);
            if (formKey) {
                // 形态卡片：只改这个形态的表单（隐藏的 Danbooru 标签、提示行、外貌），点保存才写入数据；不重绘，其它输入原样保留。
                const formCard = panel.closest('.char-form');
                if (!formCard) return;
                const hidden = formCard.querySelector('.char-form-danbooru');
                if (hidden) hidden.value = tagName;
                const hint = formCard.querySelector('.char-danbooru-hint');
                if (hint) {
                    hint.textContent = `Danbooru: ${tagName.replace(/_/g, ' ')}`;
                    hint.removeAttribute('hidden');
                }
                if (appearanceTags.length) {
                    const appearanceInput = formCard.querySelector('.char-edit-appearance');
                    if (appearanceInput) appearanceInput.value = appearanceTags.map(t => t.replace(/_/g, ' ')).join(', ');
                }
                refreshFormHeader(formCard);
                panel.classList.add('hidden');
                panel.innerHTML = '';
                return;
            }
            const char = state.characterTags.find(c => c.id === realCharId);
            if (!char) return;

            // 先把表单里其它尚未保存的输入读回草稿：选中 Danbooru 角色后编辑器保持打开、其它输入原样保留
            // （新建且未保存的角色关掉编辑器就等于被丢弃）。
            captureEditingDraft();
            char.danbooruTag = tagName;
            if (editingDraft && editingDraft.id === realCharId) editingDraft.danbooruTag = tagName;
            // 用本地库的 tag 替换角色外貌
            if (appearanceTags.length) {
                char.appearance = appearanceTags.map(t => t.replace(/_/g, ' ')).join(', ');
                if (editingDraft && editingDraft.id === realCharId) editingDraft.appearance = char.appearance;
            }

            saveCharacterLibrary();
            panel.classList.add('hidden');
            panel.innerHTML = '';
            renderCharList({ keepDraft: true });
            scheduleCharAutoSaveTouch();
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
            const sectionVars = (section.variables || []).map(v => `<span>${escapeHtml(v)}</span>`).join(' ');
            const sectionEdit = section.editable
                ? ' <button type="button" class="chain-editable" data-edit-trigger aria-label="编辑此内容"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>'
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
                const blockId = target.closest('[data-prompt-editor]')?.dataset.promptEditor;
                if (blockId) getLayoutEditor()?.openBuiltin(blockId);
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
            <div class="gallery-char-avatar"><i class="fa-solid fa-user-group" aria-hidden="true"></i></div>
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

function pruneGalleryObjectUrls() {
    syncGalleryImages();
}

// ═══════════════════════════════════════════════════════════════════════════
// 批量管理：不打開獨立彈窗，在 slot 卡與彈窗縮略圖上疊 checkbox
// ═══════════════════════════════════════════════════════════════════════════
let batchMode = false;
const batchSelectedIds = new Set();
let batchDeleteRequestId = null;
const galleryZipDownload = createGalleryZipDownload({ document, container: $('nd_zip_output'), send: postToParent,
    status: galleryFeedback.show });

function toggleBatchMode() {
    batchMode = !batchMode;
    const bar = $('nd_batch_bar');
    const btn = $('nd_batch');
    if (batchMode) {
        bar.style.display = 'flex';
        btn.classList.add('btn-primary');
        btn.querySelector('i').className = 'fa-solid fa-check';
    } else {
        bar.style.display = 'none';
        btn.classList.remove('btn-primary');
        btn.querySelector('i').className = 'fa-solid fa-check';
        batchSelectedIds.clear();
        galleryZipDownload.dispose();
    }
    updateBatchCount();
    renderGalleryView();
    for (const charName of Object.keys(loadedCharPreviews)) renderCharacterSlots(charName);
    if (modalData.charName) renderModalThumbs();
    syncGalleryImages();
}

function slotLatestImgId(card) {
    const entry = loadedCharPreviews[card.dataset.char];
    const images = entry?.slots?.[card.dataset.slot]?.images;
    return images?.[0]?.imgId || null;
}

function toggleSlotSelection(card) {
    const imgId = slotLatestImgId(card);
    if (!imgId) return;
    if (batchSelectedIds.has(imgId)) batchSelectedIds.delete(imgId);
    else batchSelectedIds.add(imgId);
    syncBatchSelection();
    updateBatchCount();
}

function updateBatchCount() {
    const count = batchSelectedIds.size;
    const el = $('nd_batch_count');
    if (!el) return;
    el.textContent = batchMode
        ? GALLERY_BATCH_COPY.selected(count)
        : '';
}

function setBatchCheckedAll(checked) {
    if (!batchMode) return;
    if (!checked) {
        batchSelectedIds.clear();
    } else {
        // 全選：只選當前 DOM 已渲染的卡片與彈窗縮略圖（與 fork 版一致，避免誤選未加載的）
        document.querySelectorAll('.gallery-slot').forEach(slot => {
            const imgId = slotLatestImgId(slot);
            if (imgId) batchSelectedIds.add(imgId);
        });
        document.querySelectorAll('#nd_modal_thumbs [data-imgid]').forEach(thumb => {
            batchSelectedIds.add(thumb.dataset.imgid);
        });
    }
    syncBatchSelection();
    updateBatchCount();
}

function syncBatchSelection() {
    document.querySelectorAll('.gallery-slot').forEach(slot => {
        const imgId = slotLatestImgId(slot);
        const selected = !!imgId && batchSelectedIds.has(imgId);
        slot.classList.toggle('batch-checked', selected);
        const cb = slot.querySelector(':scope > .batch-cb');
        if (cb) cb.checked = selected;
    });
    document.querySelectorAll('#nd_modal_thumbs [data-imgid]').forEach(thumb => {
        const selected = batchSelectedIds.has(thumb.dataset.imgid);
        thumb.classList.toggle('batch-checked', selected);
        const cb = thumb.querySelector('.batch-cb');
        if (cb) cb.checked = selected;
    });
    updateBatchCount();
}

function batchDeleteSelected() {
    if (!batchSelectedIds.size || batchDeleteRequestId) return;
    if (!confirm(GALLERY_BATCH_COPY.deleteConfirm(batchSelectedIds.size))) return;
    batchDeleteRequestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    $('nd_batch_delete').disabled = true;
    postToParent({ type: 'BATCH_DELETE', ids: [...batchSelectedIds], requestId: batchDeleteRequestId });
}

function batchDownloadSelected() {
    if (!batchSelectedIds.size) return;
    galleryZipDownload.start([...batchSelectedIds]);
}

function slotBadgesHtml(info) {
    return `${info.count > 1 ? `<span class="gallery-slot-badge count">${info.count} 版</span>` : ''}${info.hasSaved || info.images.some(img => img.savedUrl) ? '<span class="gallery-slot-badge saved" title="已保存到服务器" aria-label="已保存到服务器">✓</span>' : ''}`;
}

function slotCardHtml(charName, slotId, info) {
    const latest = info.images[0];
    const checkboxHtml = batchMode
        ? `<input type="checkbox" class="batch-cb" aria-label="选择最新版本" ${latest?.imgId && batchSelectedIds.has(latest.imgId) ? 'checked' : ''}>`
        : '';
    const checkedCls = batchMode && latest?.imgId && batchSelectedIds.has(latest.imgId) ? ' batch-checked' : '';
    return `
        <div class="gallery-slot${checkedCls}" data-slot="${escapeHtml(slotId)}" data-char="${escapeHtml(charName)}">
            ${checkboxHtml}
            <div class="gallery-slot-media">
                <img class="gallery-slot-img" data-gallery-id="${escapeHtml(latest.imgId)}" decoding="async">
                <div class="gallery-slot-overlay">
                    <div class="gallery-slot-actions">
                        <button class="btn btn-sm" type="button" data-action="view" data-slot="${escapeHtml(slotId)}" data-char="${escapeHtml(charName)}">
                            <i class="fa-solid fa-expand"></i> 查看
                        </button>
                    </div>
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
    card.addEventListener('click', e => {
        if (e.target.closest('.batch-cb')) { e.stopPropagation(); toggleSlotSelection(card); return; }
        if (batchMode) { toggleSlotSelection(card); return; }
        if (!e.target.closest('[data-action]')) open();
    });
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
    syncGalleryImages();
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
    syncGalleryImages();
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
    syncGalleryImages();
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
    if (held) { try { held.observer.disconnect(); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "disconnectGallerySentinel" }, caughtError); } }
    gallerySentinelObservers.delete(charName);
}

function galleryLoadFailureHtml(message, retryAction = '') {
    const action = retryAction ? `data-retry="${retryAction}"` : 'data-action="more"';
    return `<div class="gallery-load-error"><span>${escapeHtml(message)}</span>
        <span class="gallery-load-hint">${GALLERY_LOAD_COPY.refreshHint}</span>
        <button class="btn btn-sm" type="button" ${action}>${GALLERY_LOAD_COPY.retry}</button></div>`;
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
        sentinel.innerHTML = DOMPurify.sanitize(galleryLoadFailureHtml(GALLERY_LOAD_COPY.pageFailed));
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
    container.innerHTML = DOMPurify.sanitize(`<div class="gallery-loading">${galleryLoadFailureHtml(GALLERY_LOAD_COPY.pageFailed)}</div>`);
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
    status.innerHTML = DOMPurify.sanitize(retry ? galleryLoadFailureHtml(message, retry) : escapeHtml(message));
}

// ── 大图 ──────────────────────────────────────────────────────────────────

function openGalleryModalFromCache(charName, slotId) {
    const info = loadedCharPreviews[charName]?.slots[slotId];
    if (!info) return;
    modalData = { slotId, images: info.images, currentIndex: 0, charName };
    renderModalThumbs();
    renderModalContent();
    if (!$('nd_gallery_modal').classList.contains('visible')) galleryModalOpener = document.activeElement;
    $('nd_gallery_modal').classList.add('visible');
    syncGalleryImages();
    $('nd_modal_close').focus({ preventScroll: true });
    requestSlotVersions(charName, slotId);
    prefetchNextWhenAtLoadedEnd();
}

let galleryModalOpener = null;
function closeGalleryModal() {
    $('nd_gallery_modal').classList.remove('visible');
    galleryModalOpener?.focus?.({ preventScroll: true });
    galleryModalOpener = null;
    $('nd_modal_img').removeAttribute('data-img-id');
    $('nd_modal_img').removeAttribute('data-gallery-id');
    $('nd_modal_img').removeAttribute('src');
    $('nd_modal_thumbs').replaceChildren();
    modalData = { slotId: null, images: [], currentIndex: 0, charName: null };
    syncGalleryImages();
}

function renderModalThumbs() {
    const { images, currentIndex } = modalData;
    if (!images.length) return;
    const total = Math.max(images.length, loadedCharPreviews[modalData.charName]?.slots[modalData.slotId]?.count || 0);
    $('nd_modal_thumbs').hidden = images.length < 2 && !batchMode;
    $('nd_modal_thumbs').innerHTML = DOMPurify.sanitize(images.map((img, i) => {
        const cls = ['gallery-modal-thumb'];
        if (i === currentIndex) cls.push('active');
        if (img.savedUrl) cls.push('saved');
        const thumb = `<button type="button" class="${cls.join(' ')}" data-index="${i}" aria-label="版本 ${i + 1} / ${total}${img.savedUrl ? '，已保存' : ''}"${i === currentIndex ? ' aria-current="true"' : ''}><img data-gallery-id="${escapeHtml(img.imgId)}" alt=""></button>`;
        if (!batchMode) return thumb;
        const checked = batchSelectedIds.has(img.imgId);
        return `<div class="gallery-modal-thumb-wrap${checked ? ' batch-checked' : ''}" data-imgid="${escapeHtml(img.imgId)}"><input type="checkbox" class="batch-cb" aria-label="选择版本 ${i + 1}" ${checked ? 'checked' : ''}>${thumb}</div>`;
    }).join(''), GALLERY_HTML_SANITIZE_OPTIONS);

    $('nd_modal_thumbs').querySelectorAll('.gallery-modal-thumb-wrap .batch-cb').forEach(cb => {
        cb.addEventListener('click', e => { e.stopPropagation(); toggleModalThumbSelection(cb.parentElement); });
    });
    $('nd_modal_thumbs').querySelectorAll('.gallery-modal-thumb').forEach(t => {
        t.addEventListener('click', () => { modalData.currentIndex = parseInt(t.dataset.index); renderModalContent(); });
    });
}

function toggleModalThumbSelection(wrap) {
    const imgId = wrap.dataset.imgid;
    if (!imgId) return;
    if (batchSelectedIds.has(imgId)) batchSelectedIds.delete(imgId);
    else batchSelectedIds.add(imgId);
    syncBatchSelection();
    updateBatchCount();
}

function updateModalThumbState() {
    $('nd_modal_thumbs').querySelectorAll('.gallery-modal-thumb').forEach(t => {
        const index = parseInt(t.dataset.index);
        const active = index === modalData.currentIndex;
        t.classList.toggle('active', active);
        if (active) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
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
        imgEl.dataset.galleryId = imgKey;
        imgEl.setAttribute('data-img-id', imgKey);
    }
    updateModalThumbState();
    syncGalleryImages();

    const position = galleryModalPosition();
    $('nd_modal_prev').disabled = !position || position.index <= 0;
    $('nd_modal_next').disabled = !position || position.index >= position.loaded - 1;

    const saveBtn = $('nd_modal_save');
    if (current.savedUrl) {
        saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> 已保存';
        saveBtn.title = '这个版本已经保存在服务器上';
        saveBtn.disabled = true;
    } else {
        saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 保存到服务器';
        saveBtn.title = '把这个版本保存成服务器上的图片文件';
        saveBtn.disabled = false;
    }
    saveBtn.classList.toggle('is-saved', !!current.savedUrl);

    const loadingMore = position && position.index >= position.loaded - 1 && galleryPageRequests.has(modalData.charName);
    const slotText = position && position.total > 1 ? `图组 ${position.index + 1} / ${position.total}${loadingMore ? '（加载更多中…）' : ''} · ` : '';
    // 版本总数以图组统计为准：版本列表还没回来时，缩略图条只有最新一张，但总数已知。
    const versionTotal = Math.max(images.length, loadedCharPreviews[modalData.charName]?.slots[modalData.slotId]?.count || 0);
    $('nd_modal_counter').textContent = `${slotText}版本 ${currentIndex + 1} / ${versionTotal}`;
    const when = new Date(current.timestamp);
    $('nd_modal_date').textContent = when.toLocaleString();
    if (Number.isFinite(when.getTime())) $('nd_modal_date').dateTime = when.toISOString();
}

// 删除一张图后的本地处理：移除对应的图组 / 版本，并让随后到的 CACHE_DATA（张数少一）不被当成“数据变了”而整体重载。
function applyGalleryImageDeleted(imgId) {
    const charName = Object.keys(loadedCharPreviews).find(name =>
        Object.values(loadedCharPreviews[name].slots).some(info => info.images.some(img => img.imgId === imgId)));
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

let LRV = null; // llm-records-view.js（最近请求记录查看器），与角色库模块一同动态引入
let llmRecordsView = null;
let lastLlmRecords = [];

function renderLastLlmRequest(records) {
    lastLlmRecords = Array.isArray(records) ? records : [];
    const container = $('nd_llm_request_preview');
    if (!container || !LRV) return;
    if (!llmRecordsView) {
        llmRecordsView = LRV.createLlmRecordsView({ document, container, getRecords: () => lastLlmRecords });
        return;
    }
    llmRecordsView.render(lastLlmRecords);
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
    if (!AP_UI || !presetListKit || !apiSettingsReady) return;
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
        createListView: createPresetListView, // 与参数 / 提示词预设列表共用同一份接线（函数声明，已提升）
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
let PO = null; // preset-order.js（预设排序的纯函数），与角色库模块一同动态引入
let presetListKit = null; // preset-list-kit.js 建出的接线（预设列表视图 + 排序 / 菜单 / 键盘移动 / 边缘滚动），参数 / 提示词 / API 配置预设共用，与角色库模块一同动态引入
let PLE = null; // prompt-layout-editor.js（请求结构编辑器，另外转出布局契约的纯函数），与角色库模块一同动态引入

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
        const titleModeSel = $('nd_image_title_mode');
        $('nd_save_as_jpeg').checked = state.saveAsJpeg === true;
        if (titleModeSel) titleModeSel.value = ['none', 'overlay', 'collapse'].includes(state.imageTitleMode)
            ? state.imageTitleMode : 'none';

        renderParamsPresetList();
        applyParamsPreset();

        pruneLayoutDrafts();
        renderPromptPresetList();
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

// ── 参数预设列表 ─────────────────────────────────────────────
// 每个预设一行：拖动手柄 + 名称（点选）+ “…”菜单。点选只在页面里切换（和保存前的下拉框一样不通知宿主），
// 新建 / 删除 / 导出等操作都带上被点的那一行的 id，不依赖宿主记的选中项。

// 当前真正显示的预设 id：选中项找不到时 applyParamsPreset 会退回第一个，列表高亮跟它保持一致。
function currentParamsPresetId() {
    const presets = state.paramsPresets || [];
    return (presets.find(p => p.id === state.selectedParamsPresetId) || presets[0])?.id ?? null;
}

// 行标记、点击委托、拖拽排序、折叠都在 shared/preset-list-view.js，接线（排序 / 菜单 / 键盘移动 / 边缘滚动）在 shared/preset-list-kit.js；
// 参数 / 提示词 / API 配置三个列表各建一份视图，只有数据来源和动作处理不同。菜单控制器与角色卡共用同一个（同一时间只开一个菜单）。
// 视图在第一次用到时才创建（模块是动态引入的，晚于页面脚本）。
function createPresetListView(options) {
    return presetListKit.createPresetListView({ document, ...options });
}

let paramsListView = null;
function getParamsListView() {
    if (!paramsListView && presetListKit) {
        paramsListView = createPresetListView({
            listId: 'novel-params',
            getToggle: () => $('nd_params_collapse'),
            getList: () => $('nd_params_list'),
            getPresets: () => state.paramsPresets || [],
            getCurrentId: currentParamsPresetId,
            noun: '参数预设',
            onSelect: id => selectParamsPreset(id),
            onAction: handleParamsPresetAction,
            onRename: renameParamsPreset,
            onReorder: reorderParamsPresets,
        });
    }
    return paramsListView;
}

function renderParamsPresetList() {
    getParamsListView()?.render();
}

// 只改高亮，不重绘：被点的按钮留在原处，键盘焦点不丢。
function syncParamsPresetSelection() {
    getParamsListView()?.syncSelection();
}

function selectParamsPreset(id) {
    if (!id || id === state.selectedParamsPresetId) return; // 再点已选中的一行不重填表单，免得冲掉未保存的编辑
    state.selectedParamsPresetId = id;
    applyParamsPreset();
    syncParamsPresetSelection();
}

// 排序：本地先重排并重绘列表（不重填表单，未保存的编辑保留），宿主只收到新的 id 顺序。
function reorderParamsPresets(orderedIds) {
    if (!PO) return;
    state.paramsPresets = PO.reorderPresetsByIds(state.paramsPresets, orderedIds);
    renderParamsPresetList();
    postToParent({ type: 'REORDER_PARAMS_PRESETS', order: orderedIds });
}

// 名称输入框提交（已 trim、非空、确实改了）：改本地再整份保存。
function renameParamsPreset(id, name, preset) {
    preset.name = name;
    postToParent({ type: 'SAVE_PARAMS_PRESET', selectedParamsPresetId: state.selectedParamsPresetId, paramsPresets: state.paramsPresets });
}

// 菜单项的动作：点选、改名与“…”按钮由视图处理，这里只收 duplicate / export / delete。
function handleParamsPresetAction(action, id, preset) {
    if (action === 'duplicate') {
        postToParent({ type: 'ADD_PARAMS_PRESET', baseId: id, name: `${preset.name || preset.id} 副本` });
    } else if (action === 'export') {
        postToParent({ type: 'EXPORT_CURRENT_PRESET', presetId: id });
    } else if (action === 'delete') {
        if (confirm(`确定删除参数预设“${preset.name || preset.id}”？`)) postToParent({ type: 'DEL_PARAMS_PRESET', presetId: id });
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
    if (p.overrideSize === 'auto') {
        $('nd_size_preset').value = 'auto';
        $('nd_custom_size').classList.add('hidden');
    } else {
        updateSizePreset();
    }

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
    refreshLayoutSummaries(); // “数量约束”块的摘要读的是当前参数预设
}

/** 纯本地：从当前选中的提示词预设加载 textarea 内容（对标 applyParamsPreset）；collapseLayout=切换预设时收起布局里展开的消息块 */
function applyPromptPreset({ collapseLayout = false } = {}) {
    const active = getActivePromptPresetForForm() || {};
    const drafts = active.id ? promptTextDraftsByPreset.get(active.id) : null;
    $('nd_prompt_system').value = drafts?.has('topSystem')
        ? drafts.get('topSystem')
        : active.topSystem ?? '';
    $('nd_prompt_format').value = drafts?.has('sceneRules')
        ? drafts.get('sceneRules')
        : active.sceneRules ?? '';
    applyModelGuideForCurrentModel();
    renderLayoutEditor({ collapse: collapseLayout });
}

// ── 提示词预设列表 ───────────────────────────────────────────
// 和参数预设列表同一套视图。区别在于：点选立即通知宿主持久化（SELECT_PROMPT_PRESET，沿用旧下拉框的行为），
// 排序只重绘列表、不重填三个文本框（它们里面可能有未保存的编辑），宿主只收到新的 id 顺序。

// 当前真正显示的预设 id：和 getActivePromptPresetForForm 的回退一致，但不改 state。
function currentPromptPresetId() {
    const presets = state.promptPresets || [];
    return (presets.find(p => p.id === state.selectedPromptPresetId) || presets[0])?.id ?? null;
}

// 预设行的“…”菜单：通用的复制 / 导出 / 删除，外加“全部恢复默认”（原先在页面底部的独立按钮）。
const PROMPT_PRESET_MENU_ITEMS = Object.freeze([
    { action: 'duplicate', label: '复制', icon: 'fa-clone' },
    { action: 'export', label: '导出', icon: 'fa-share-from-square' },
    { action: 'reset-defaults', label: '全部恢复默认', icon: 'fa-rotate-left' },
    { action: 'delete', label: '删除', icon: 'fa-trash', danger: true },
]);

/**
 * 把当前正在编辑的提示词预设的全部文本（开场、场景规则、各模型指南）与请求结构恢复为默认值。
 * 只改表单与草稿，点保存才落盘。
 */
function resetActivePromptPresetToDefaults() {
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
    // 布局草稿一并回到默认（与已保存的默认布局一致时 setPromptLayoutDraft 会直接丢草稿）。
    if (layoutSupported()) setPromptLayoutDraft(activePreset, PLE.createDefaultLayout());
    renderLayoutEditor({ collapse: true });
    refreshLayoutSummaries();
    if ($('nd_prompt_chain_details').open) requestPromptChainPreview();
}

let promptListView = null;
function getPromptListView() {
    if (!promptListView && presetListKit) {
        promptListView = createPresetListView({
            listId: 'novel-prompts',
            defaultCollapsed: true,
            getToggle: () => $('nd_prompt_collapse'),
            getList: () => $('nd_prompt_list'),
            getPresets: () => state.promptPresets || [],
            getCurrentId: currentPromptPresetId,
            noun: '提示词预设',
            onSelect: id => selectPromptPreset(id),
            onAction: handlePromptPresetAction,
            onRename: (id, name, preset) => {
                preset.name = name; // 先在本页显示新名字；宿主保存后回传的 INIT_DATA 是最终结果
                postToParent({ type: 'RENAME_PROMPT_PRESET', id, name });
            },
            onReorder: reorderPromptPresets,
            menuItems: PROMPT_PRESET_MENU_ITEMS,
        });
    }
    return promptListView;
}

function renderPromptPresetList() {
    getPromptListView()?.render();
}

function selectPromptPreset(id) {
    if (!id || id === currentPromptPresetId()) return; // 再点已选中的一行什么也不做
    state.selectedPromptPresetId = id;
    applyPromptPreset({ collapseLayout: true });
    getPromptListView()?.syncSelection();
    requestPromptChainPreview();
    postToParent({ type: 'SELECT_PROMPT_PRESET', id });
}

function reorderPromptPresets(orderedIds) {
    if (!PO) return;
    state.promptPresets = PO.reorderPresetsByIds(state.promptPresets, orderedIds);
    renderPromptPresetList();
    postToParent({ type: 'REORDER_PROMPT_PRESETS', order: orderedIds });
}

function handlePromptPresetAction(action, id, preset) {
    const label = preset.name || preset.id;
    if (action === 'duplicate') {
        postToParent({ type: 'ADD_PROMPT_PRESET', sourcePresetId: id, name: `${label} 副本` });
    } else if (action === 'export') {
        exportPromptPreset(preset);
    } else if (action === 'reset-defaults') {
        if (!confirm(`确认将提示词预设“${label}”的全部提示词（含请求结构）恢复为默认值？（需点击保存才会生效）`)) return;
        // 恢复的是正在编辑的表单：不是当前预设时先切过去（与点选这一行一样）。
        if (id !== currentPromptPresetId()) selectPromptPreset(id);
        resetActivePromptPresetToDefaults();
    } else if (action === 'delete') {
        if (confirm(`确定删除提示词预设“${label}”？`)) postToParent({ type: 'DEL_PROMPT_PRESET', id });
    }
}

/**
 * 导出一个提示词预设为 JSON 文件。正在编辑的那个按文本框里的内容导出（含未保存的编辑）；
 * 其它预设按已保存内容加上本页对它的未保存草稿导出，不碰当前表单。
 */
function exportPromptPreset(preset) {
    const isActive = preset.id === getActivePromptPresetForForm()?.id;
    const drafts = promptTextDraftsByPreset.get(preset.id);
    // 默认布局仍导出 V3（旧版本能导入）；带自定义布局导出 V4，旧版本会明确拒绝而不是悄悄丢掉布局。
    // 版本规则与 novel-prompt-import.js 的 promptTemplateExportVersion 一致（panel 测试会对账）。
    const layout = promptLayoutForExport(preset);
    const data = {
        _type: 'novel-draw-prompt-template',
        _version: layout ? 4 : 3,
        name: preset.name || '',
        topSystem: isActive ? $('nd_prompt_system').value : (drafts?.has('topSystem') ? drafts.get('topSystem') : preset.topSystem ?? ''),
        sceneRules: isActive ? $('nd_prompt_format').value : (drafts?.has('sceneRules') ? drafts.get('sceneRules') : preset.sceneRules ?? ''),
        modelGuideOverrides: collectModelGuideOverrides(preset, { fromForm: isActive }),
    };
    if (layout) data.layout = layout;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${preset.name || '提示词预设'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
}

function getActivePromptPresetForForm() {
    const presets = state.promptPresets || [];
    const active = presets.find(preset => preset.id === state.selectedPromptPresetId)
        || presets[0]
        || null;
    if (active && state.selectedPromptPresetId !== active.id) {
        state.selectedPromptPresetId = active.id;
    }
    return active;
}

// ── 请求结构（共享编辑器 shared/prompt-layout-editor.js）─────────────────────────
// 布局跟着提示词预设走：已保存的在 preset.layout（缺省 = 默认布局），未保存的修改放在 layoutDraftsByPreset。
// 生效布局 = 草稿 ?? 已保存 ?? 默认。编辑器只改草稿；保存按钮把生效布局随 promptDraft.layout 交给宿主。
// 页面是普通脚本，布局契约的纯函数（指纹 / 默认判断 / 规范化）经 PLE 转出。

const LAYOUT_UNSUPPORTED_REASON = '当前酒馆端的 LittleWhiteBox 版本还不支持请求结构，请刷新酒馆页面后再试。';
const LAYOUT_TEXT_TARGETS = { opening: 'nd_prompt_system', guide: 'nd_prompt_guide', rules: 'nd_prompt_format' };

/** 宿主认识 layout 字段、且编辑器模块已加载：此时才允许读写 / 保存布局。 */
function layoutSupported() {
    return Boolean(PLE) && state.promptLayoutSupported === true;
}

function getSavedPromptLayout(preset) {
    return PLE.normalizeLayout(preset?.layout).layout; // 没有 layout 字段 = 默认布局
}

function getEffectivePromptLayout(preset) {
    if (!PLE) return null;
    const draft = preset?.id ? layoutDraftsByPreset.get(preset.id) : null;
    return draft || getSavedPromptLayout(preset);
}

/** 记下编辑器给出的新布局；与已保存的一致就直接丢草稿，这样“未保存”徽标与保存后的清理都不用特殊处理。 */
function setPromptLayoutDraft(preset, layout) {
    if (!PLE || !preset?.id) return;
    if (PLE.layoutFingerprint(layout) === PLE.layoutFingerprint(getSavedPromptLayout(preset))) layoutDraftsByPreset.delete(preset.id);
    else layoutDraftsByPreset.set(preset.id, layout);
}

/** 宿主推来新数据后：草稿与已保存一致（保存成功）或预设已不存在的草稿丢弃，其余保留（保存失败 / 还在编辑）。 */
function pruneLayoutDrafts() {
    if (!PLE) return;
    for (const [presetId, draft] of Array.from(layoutDraftsByPreset)) {
        const preset = (state.promptPresets || []).find(item => item.id === presetId);
        if (!preset || PLE.layoutFingerprint(draft) === PLE.layoutFingerprint(getSavedPromptLayout(preset))) {
            layoutDraftsByPreset.delete(presetId);
        }
    }
}

/**
 * 保存时附带的 layout 字段：生效布局是默认 -> null（宿主删掉已存的 layout），否则是规范化后的对象。
 * 编辑器不可用时一个字段都不带——宿主把“键缺席”当作不动，避免旧宿主 / 加载失败时误删已存布局。
 */
function layoutFieldForSave() {
    if (!layoutSupported()) return {};
    const layout = getEffectivePromptLayout(getActivePromptPresetForForm());
    return { layout: PLE.layoutForStorage(layout) ?? null };
}

function savePromptPreset(buttonId, statusTarget, statusId) {
    getActivePromptPresetForForm();
    let layoutFields;
    try {
        layoutFields = layoutFieldForSave();
    } catch (error) {
        updateStatus($(statusId), 'error', error.message);
        return;
    }
    setSavingState($(buttonId));
    postToParent({ type: 'SAVE_PROMPT_PRESET', selectedPromptPresetId: state.selectedPromptPresetId, promptDraft: {
        topSystem: $('nd_prompt_system').value,
        sceneRules: $('nd_prompt_format').value,
        modelGuideOverrides: collectModelGuideOverridesFromForm(),
        ...layoutFields,
    }, statusTarget });
}

/** 导出用的布局：默认 / 没有 -> null（导出 V3，旧版本照常能导入）；否则规范化后的对象（导出 V4）。 */
function promptLayoutForExport(preset) {
    // 编辑器没加载时拿不到草稿，但已保存的布局不能在导出里悄悄丢掉。
    if (!PLE) return preset.layout && typeof preset.layout === 'object' ? preset.layout : null;
    const layout = getEffectivePromptLayout(preset);
    return PLE.isDefaultLayout(layout) ? null : PLE.normalizeLayout(layout).layout;
}

function summarizeLayoutText(value, emptyText) {
    const text = String(value ?? '');
    if (!text.trim()) return emptyText;
    const flat = text.replace(/\s+/g, ' ').trim();
    const chars = Array.from(flat);
    const head = chars.length > 60 ? `${chars.slice(0, 60).join('')}…` : flat;
    return `${head}（共 ${text.length} 字）`;
}

function describeBuiltinBlock(id) {
    switch (id) {
        case 'opening':
            return { summary: summarizeLayoutText($('nd_prompt_system')?.value, '（当前为空，不注入）'), action: 'edit' };
        case 'guide':
            return { label: '模型TAG指南', summary: summarizeLayoutText($('nd_prompt_guide')?.value, '（当前为空，不注入）'), action: 'edit' };
        case 'rules':
            return { summary: summarizeLayoutText($('nd_prompt_format')?.value, '（当前为空，不注入）'), action: 'edit' };
        case 'frame':
            return { summary: '固定文本：说明下面提供了哪些材料，以及结果要通过工具交回（程序生成，不可编辑）', action: 'view' };
        case 'tools':
            return { summary: '固定工具：submit_scene_plan 及各字段说明（程序生成，不可编辑）', action: 'view' };
        case 'worldInfo':
            return { summary: state.useWorldInfo === true ? '世界书注入已开启：命中的条目放在这里' : '世界书注入未开启（在世界书页面开启）', action: 'edit' };
        case 'content': {
            const chars = Array.isArray(state.characterTags) ? state.characterTags : [];
            const enabled = chars.filter(char => char.enabled !== false).length;
            return { summary: `最近的聊天正文与角色标签（共 ${chars.length} 个角色，启用 ${enabled} 个）`, action: 'edit' };
        }
        case 'limits': {
            const presets = state.paramsPresets || [];
            const params = presets.find(item => item.id === state.selectedParamsPresetId) || presets[0] || {};
            const images = Number(params.maxImages) || 0;
            const perImage = Number(params.maxCharactersPerImage) || 0;
            return { summary: `每次最多 ${images || '不限'} 张图，每张图最多 ${perImage || '不限'} 个角色`, action: 'edit' };
        }
        default:
            return { summary: '', action: null };
    }
}

/** 内置块的“去编辑 / 查看”：文本类跳到对应文本框，其余切到数据所在的页面。 */
function editBuiltinBlock(id) {
    const textTarget = LAYOUT_TEXT_TARGETS[id] && $(LAYOUT_TEXT_TARGETS[id]);
    if (textTarget) {
        getLayoutEditor()?.openBuiltin(id);
        textTarget.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        textTarget.focus?.();
    } else if (id === 'worldInfo') {
        switchView('worldbook');
    } else if (id === 'content') {
        switchView('characters');
    } else if (id === 'limits') {
        switchView('params');
        const input = $('nd_max_images');
        input?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        input?.focus?.();
    } else if (id === 'frame' || id === 'tools') {
        const details = $('nd_prompt_chain_details');
        if (details) {
            details.open = true;
            details.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
        }
    }
}

async function testBlockTool(block) {
    const host = createSandboxToolHost({ document });
    try {
        const definition = normalizeToolDefinition(await host.define(block.id, block.tool?.code ?? ''));
        const names = Object.keys(definition.parameters.properties || {});
        return {
            ok: true,
            message: `可用：工具名 ${definition.name}；参数 ${names.length ? names.join('、') : '无'}${definition.stealth ? '；调用不记入工具记录' : ''}`,
        };
    } catch (error) {
        return { ok: false, message: String(error?.message || '读取工具定义失败') };
    } finally {
        host.dispose();
    }
}

let layoutEditor = null;
function getLayoutEditor() {
    if (!layoutEditor && PLE) {
        const container = $('nd_prompt_layout');
        if (!container) return null;
        layoutEditor = PLE.createPromptLayoutEditor({
            document,
            container,
            getOwnerKey: currentPromptPresetId,
            getLayout: () => getEffectivePromptLayout(getActivePromptPresetForForm()),
            getSavedLayout: () => getSavedPromptLayout(getActivePromptPresetForForm()),
            onChange: layout => setPromptLayoutDraft(getActivePromptPresetForForm(), layout),
            describeBuiltin: describeBuiltinBlock,
            onEditBuiltin: editBuiltinBlock,
            builtinEditors: Object.fromEntries(Array.from(document.querySelectorAll('[data-prompt-editor]'), node => [node.dataset.promptEditor, node])),
            editorParking: $('nd_prompt_editors'),
            confirm: message => confirm(message),
            autoScroll: (event, list) => presetListKit?.autoScroll(event, list),
            getDisabledReason: () => (state.promptLayoutSupported === true ? '' : LAYOUT_UNSUPPORTED_REASON),
            onTestTool: testBlockTool,
            collapseId: 'prompt-layout',
        });
    }
    return layoutEditor;
}

function renderLayoutEditor(options) {
    getLayoutEditor()?.render(options);
}

/** 文本框 / 参数预设变化后刷新内置块摘要：原地改字，不重绘列表。 */
function refreshLayoutSummaries() {
    layoutEditor?.refreshSummaries();
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
    return collectModelGuideOverrides(getActivePromptPresetForForm(), { fromForm: true });
}

/** 某个预设的指南覆盖：已保存的覆盖 + 本页草稿；fromForm 时再叠上当前模型指南文本框（只对正在编辑的预设有意义）。 */
function collectModelGuideOverrides(active, { fromForm }) {
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

    if (fromForm) {
        const guideId = getCurrentModelGuideId();
        const textarea = $('nd_prompt_guide');
        if (textarea) {
            applyDraft(guideId, textarea.value);
        }
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
    refreshLayoutSummaries();
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
    $('nd_max_chars').value = Math.min(characterLimit, Math.max(0, Number($('nd_max_chars').value) || 0));
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
    p.overrideSize = $('nd_size_preset').value === 'auto' ? 'auto' : 'default';
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
            restoreInitialView();
            break;
        }

        case 'GROUP_PRESET_CONTEXT':
            // 聊天切换后宿主推来的轻量更新：只刷新“当前聊天”相关的数据，不动其它状态。
            if (Array.isArray(data.activeAvatars)) state.activeAvatars = data.activeAvatars;
            if (Array.isArray(data.hostCharacters)) state.hostCharacters = data.hostCharacters;
            renderGroupPresetPanel();
            break;

        case 'CACHE_DATA':
            galleryFeedback.receive(data);
            state.cacheStats = data.cacheStats || state.cacheStats;
            if (data.gallerySummary) applyGallerySummary(data.gallerySummary);
            if ($('nd_cache_count')) $('nd_cache_count').textContent = state.cacheStats?.count || 0;
            if ($('nd_cache_size')) $('nd_cache_size').textContent = state.cacheStats?.sizeMB || 0 + ' MB';
            renderGalleryView();
            break;

        case 'BATCH_DELETED': {
            if (data.requestId !== batchDeleteRequestId) break;
            batchDeleteRequestId = null;
            $('nd_batch_delete').disabled = false;
            const ids = data.deletedIds || [];
            for (const id of ids) {
                applyGalleryImageDeleted(id);
                batchSelectedIds.delete(id);
            }
            if (modalData.slotId) {
                modalData.images = modalData.images.filter(img => !ids.includes(img.imgId));
                if (!modalData.images.length) closeGalleryModal();
                else {
                    modalData.currentIndex = Math.min(modalData.currentIndex, modalData.images.length - 1);
                    renderModalThumbs();
                    renderModalContent();
                }
            }
            updateBatchCount();
            syncBatchSelection();
            pruneGalleryObjectUrls();
            galleryFeedback.show(data.failures?.length ? 'error' : 'success',
                GALLERY_BATCH_COPY.deleted(ids.length, data.failures?.length || 0));
            break;
        }

        case 'BATCH_DOWNLOADED':
            galleryZipDownload.handle(data);
            break;

        case 'CHARACTER_PREVIEWS_LOADED':
            handleCharacterPreviewsLoaded(data);
            break;

        case 'CHARACTER_PREVIEWS_FAILED':
            failCharacterRequest(data.charName, data.requestId);
            break;

        case 'GALLERY_IMAGE_LOADED':
            galleryImageRequests.receive(data);
            break;

        case 'SLOT_VERSIONS_LOADED':
            handleSlotVersionsLoaded(data);
            break;

        case 'SLOT_VERSIONS_FAILED':
            failSlotVersionsRequest(data.charName, data.slotId, data.requestId);
            break;
            
        case 'TEST_RESULT':
        case 'TEST_RETAINED':
        case 'TEST_STATE':
        case 'TEST_HISTORY_FAILED':
            quickTestView?.handle(data);
            break;

        case 'BACKEND_PLUGIN_STATUS': {
            state.backendPluginStatus = data.status || {};
            state.backendPluginCopy = data.copy;
            renderBackendPluginStatus();
            break;
        }

            
        case 'STATUS':
            if (data.target === 'jpeg') {
                state.saveAsJpeg = data.saveAsJpeg === true;
                $('nd_save_as_jpeg').checked = state.saveAsJpeg;
                $('nd_save_as_jpeg').disabled = false;
                galleryFeedback.show(data.state, data.text);
                break;
            }
            if (data.target === 'group-presets') {
                handleGroupPresetStatus(data);
                break;
            }
            if (data.target === 'char-tags') {
                handleCharSaveStatus(data);
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
            } else if (data.target === 'prompt-preset' || data.target === 'prompts') {
                // 保存按钮只剩预设栏里的一个；宿主对旧目标名 prompts 的回执也落在同一行状态上。
                updateStatus($('nd_prompt_preset_status'), data.state, data.text);
            } else if (data.target === 'filter') {
                updateStatus($('nd_filter_status'), data.state, data.text);
            } else if (data.target === 'gallery') {
                galleryFeedback.show(data.state, data.text);
            } else {
                updateStatus($('nd_status'), data.state, data.text);
            }
            if (data.state === 'success' || data.state === 'error') handleSaveResult(data.state === 'success');
            break;

        case 'REQUEST_CLOSE':
            runEditorTask(requestPanelClose());
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
            renderLastLlmRequest(data.history);
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

window.addEventListener('pagehide', event => {
    if (!event.persisted) { quickTestView?.dispose(); galleryZipDownload.dispose(); galleryFeedback.destroy(); }
});
window.addEventListener('beforeunload', () => {
    cardMenu?.destroy();
    cardMenu = null;
    galleryImageWindow.dispose();


});

// ═══════════════════════════════════════════════════════════════════════════
// 初始化
// ═══════════════════════════════════════════════════════════════════════════

function initializePage() {
    quickTestView = createQuickTestView(document, postToParent, galleryImageRequests.load);
    mountServerPluginGuide(document.getElementById('nd_backend_guide'), 'nd-backend');
    shuffleCredits();
    postToParent({ type: 'TEST_HISTORY' });
    const openTestGallery = () => quickTestView.openGallery();
    $('nd_open_gallery').addEventListener('click', openTestGallery);
    $('nd_preview_img').addEventListener('click', openTestGallery);
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
    $('nd_close').addEventListener('click', () => runEditorTask(requestPanelClose()));
    
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
        } else if (this.value === 'auto') {
            // AI 自动不写死宽高，沿用预设里保存的兜底值；生成时由 compiler 按构图方向覆盖。
            $('nd_custom_size').classList.add('hidden');
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
    // 列表里的点击（点选 / “…”菜单）由 preset-list-view.js 在第一次绘制时挂上委托。
    $('nd_params_save').addEventListener('click', () => {
        setSavingState($('nd_params_save'));
        collectParamsPreset();
        postToParent({ type: 'SAVE_PARAMS_PRESET', selectedParamsPresetId: state.selectedParamsPresetId, paramsPresets: state.paramsPresets });
    });
    
    // 宿主只在“保存”时才知道页面选中了哪个预设，所以新建要带上页面当前显示的那个作为底板。
    $('nd_params_add').addEventListener('click', () => postToParent({ type: 'ADD_PARAMS_PRESET', baseId: state.selectedParamsPresetId }));
    
    // ═══════════════════════════════════════════════════════════════════════
    // 云端预设（新增）
    // ═══════════════════════════════════════════════════════════════════════
    $('nd_params_cloud').addEventListener('click', () => {
        postToParent({ type: 'OPEN_CLOUD_PRESETS' });
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
    
    $('nd_char_add').addEventListener('click', () => runEditorTask(addCharacterDraft()));
    async function addCharacterDraft() {
        if (editingCharId && !(await leaveCharacterEditor())) return; // 先保存正在编辑的那张；保存不了就留在原处
        const nc = { id: `char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, enabled: true, name: '', aliases: [], type: 'girl', appearance: '', negativeTags: '', outfits: [], dynamicStates: [] };
        state.characterTags.push(nc);
        registerDraftCharacter(nc);
        resetCharacterFilters(false);
        switchView('characters');
        await openCharacterEditor(nc.id, { fresh: true });
    }
    
    // 角色编辑卡里的文本框（外貌 / 条目标签）随内容长高；折叠 / 展开、重绘、宽度变化后自动补量。
    installTextareaAutofit($('nd_char_list'));
    $('nd_char_list').addEventListener('click', e => {
        const groupBtn = e.target.closest('[data-group-action]');
        if (groupBtn) {
            if (groupBtn.closest('[role="menu"]')) cardMenu?.close({ restoreFocus: true });
            handleGroupAction(groupBtn.dataset.groupAction, groupBtn.dataset.groupId ?? '', groupBtn);
            return;
        }
        const btn = e.target.closest('[data-action]');
        if (!btn) {
            // 点角色行（摘要）本身：展开 / 收起编辑区；启用开关、“…”菜单、勾选框、拖动手柄各管各的，不触发。
            if (isCharacterRowToggleTarget(e.target)) runEditorTask(toggleCharacterEditor(e.target.closest('.char-card')?.dataset.id));
            return;
        }
        const card = btn.closest('.char-card');
        const id = btn.dataset.id || card?.dataset.id;
        if (btn.closest('[role="menu"]')) cardMenu?.close({ restoreFocus: true });
        if (id) handleCharAction(btn.dataset.action, id, card, btn, e);
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

    $('nd_char_import').addEventListener('change', observeAsyncCallback(async (event) => {
        const input = event.target;
        const file = input.files?.[0];
        try {
            if (file) await handleCharacterImportFile(file);
        } finally {
            input.value = ''; // 清空以便重复选择同一个文件
        }
    }, { source: import.meta.url, operation: "callback" }));

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

    // 图片标题显示模式：切换即保存（所有 provider 共用）
    $('nd_image_title_mode')?.addEventListener('change', () => {
        const mode = $('nd_image_title_mode').value;
        state.imageTitleMode = mode;
        postToParent({ type: 'SAVE_IMAGE_TITLE_MODE', imageTitleMode: mode });
    });

    // JPEG applies to new images only; wait for the host receipt before re-enabling the control.
    $('nd_save_as_jpeg')?.addEventListener('change', () => {
        $('nd_save_as_jpeg').disabled = true;
        postToParent({ type: 'SAVE_JPEG', saveAsJpeg: $('nd_save_as_jpeg').checked });
    });

    // 批量管理
    $('nd_batch').addEventListener('click', toggleBatchMode);
    $('nd_batch_select_all').addEventListener('click', () => setBatchCheckedAll(true));
    $('nd_batch_select_none').addEventListener('click', () => setBatchCheckedAll(false));
    $('nd_batch_download').addEventListener('click', batchDownloadSelected);
    $('nd_batch_delete').addEventListener('click', batchDeleteSelected);
    $('nd_batch_done').addEventListener('click', toggleBatchMode);

    $('nd_clear_expired').addEventListener('click', () => postToParent({ type: 'CLEAR_EXPIRED_CACHE' }));
    
    $('nd_clear_all').addEventListener('click', () => { 
        if (confirm('确定清空全部图片记录？已保存到服务器的文件不会被删除。')) postToParent({ type: 'CLEAR_ALL_CACHE' }); 
    });
    
    
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
        if (e.target.id === 'nd_gallery_modal' || e.target.classList.contains('gallery-modal-stage')) closeGalleryModal();
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
    // 提示词预设管理 — 切换立即持久化，模板正文仍由保存按钮提交；
    // 列表里的点选 / “…”菜单由 preset-list-view.js 在第一次绘制时挂上委托（selectPromptPreset / handlePromptPresetAction）。
    $('nd_prompt_preset_save').addEventListener('click', () => {
        savePromptPreset('nd_prompt_preset_save', 'prompt-preset', 'nd_prompt_preset_status');
    });

    $('nd_prompt_add').addEventListener('click', () => postToParent({
        type: 'ADD_PROMPT_PRESET',
        sourcePresetId: state.selectedPromptPresetId,
    }));

    // 恢复默认只改表单；点保存才落盘
    const refreshChainIfOpen = () => { if ($('nd_prompt_chain_details').open) requestPromptChainPreview(); };
    $('nd_prompt_reset_system').addEventListener('click', () => {
        const activePreset = (state.promptPresets || []).find(p => p.id === state.selectedPromptPresetId);
        const isPov = ['默认-第一人称完整规则', '新版-第一人称完整规则'].includes(activePreset?.name);
        const defaultTopSystem = isPov ? (state._defaultPrompts?.topSystemPov || '') : (state._defaultPrompts?.topSystem || '');
        $('nd_prompt_system').value = defaultTopSystem;
        setCurrentPromptTextDraft('topSystem', defaultTopSystem);
        refreshLayoutSummaries();
        refreshChainIfOpen();
    });
    $('nd_prompt_reset_format').addEventListener('click', () => {
        const defaultSceneRules = state._defaultPrompts?.sceneRules || '';
        $('nd_prompt_format').value = defaultSceneRules;
        setCurrentPromptTextDraft('sceneRules', defaultSceneRules);
        refreshLayoutSummaries();
        refreshChainIfOpen();
    });
    $('nd_prompt_reset_guide').addEventListener('click', () => {
        const defaultContent = state.modelGuideDefaults?.[getCurrentModelGuideId()] ?? '';
        $('nd_prompt_guide').value = defaultContent;
        setCurrentModelGuideDraft(defaultContent);
        refreshLayoutSummaries();
        refreshChainIfOpen();
    });
    $('nd_prompt_preset_import').addEventListener('change', observeAsyncCallback(async (e) => {
        const input = e.target; // await 之后事件对象可能已被重置，先留住输入框
        const file = input.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            const hasEnabledToolCode = collectToolBlocks(data?.layout).length > 0;
            const keepToolBlocks = hasEnabledToolCode
                ? confirm('这份模板含自定义工具代码，可在浏览器中执行并联网。是否启用？取消则导入但先关闭带工具的消息。只启用你信任的模板。')
                : false;
            postToParent({
                type: 'IMPORT_PROMPT_PRESET',
                payload: data,
                fallbackName: file.name.replace(/\.json$/i, '').trim()
                    || `导入的预设-${(state.promptPresets || []).length + 1}`,
                ...(hasEnabledToolCode ? { keepToolBlocks } : {}),
            });
        } catch (err) {
            alert('导入失败: ' + err.message);
        }
        input.value = '';
    }, { source: import.meta.url, operation: "callback" }));

    $('nd_prompt_chain_details').addEventListener('toggle', (event) => {
        if (event.currentTarget.open) requestPromptChainPreview();
    });
    ['nd_prompt_system', 'nd_prompt_format'].forEach((id) => {
        $(id).addEventListener('input', () => {
            setCurrentPromptTextDraft(id === 'nd_prompt_system' ? 'topSystem' : 'sceneRules', $(id).value);
            refreshLayoutSummaries();
            if ($('nd_prompt_chain_details').open) requestPromptChainPreview();
        });
    });
    $('nd_prompt_guide').addEventListener('input', () => {
        setCurrentModelGuideDraft($('nd_prompt_guide').value);
        refreshLayoutSummaries();
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
        if (e.dataTransfer.files.length) observeBackgroundTask(handleWorldbookFiles(e.dataTransfer.files), { source: import.meta.url, operation: "callback" });
    });
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) observeBackgroundTask(handleWorldbookFiles(fileInput.files), { source: import.meta.url, operation: "callback" });
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
    observeBackgroundTask(Promise.all([
        Promise.all([import('../../shared/character-library.js'), import('../../shared/character-group-presets.js')])
            .then(([library, presets]) => { CL = library; GPM = presets; })
            .catch((error) => { console.error('[ND-UI] 角色库模块加载失败，分组功能不可用:', error); }),
        import('../../shared/character-library-dialog.js')
            .then((module) => { CD = module; })
            .catch((error) => { console.error('[ND-UI] 角色导入对话框加载失败，导入导出不可用:', error); }),
        import('../../shared/character-card-menu.js')
            .then((module) => { CM = module; })
            .catch((error) => { console.error('[ND-UI] 角色卡菜单模块加载失败，“更多操作”菜单不可用:', error); }),
        import('../../shared/character-list-scroll.js')
            .then((module) => { CS = module; })
            .catch((error) => { console.error('[ND-UI] 拖拽自动滚动模块加载失败，拖拽时不会自动滚动:', error); }),
        import('../../shared/character-group-presets-ui.js')
            .then((module) => { GP = module; })
            .catch((error) => { console.error('[ND-UI] 分组预设模块加载失败，分组预设不可用:', error); }),
        import('../../shared/api-presets-ui.js')
            .then((module) => { AP_UI = module; renderApiPresetBar(); })
            .catch((error) => { console.error('[ND-UI] API 预设模块加载失败，API 配置预设不可用:', error); }),
        import('../../shared/preset-order.js')
            .then((module) => { PO = module; })
            .catch((error) => { console.error('[ND-UI] 预设排序模块加载失败，参数预设无法排序:', error); }),
        import('../../shared/preset-list-kit.js')
            .then((module) => {
                presetListKit = module.createPresetListKit({ escapeHtml, shareMenu: { get: () => getCardMenu(), peek: () => cardMenu } });
                renderApiPresetBar();
            })
            .catch((error) => { console.error('[ND-UI] 预设列表模块加载失败，预设列表无法显示或排序:', error); }),
        import('../../shared/prompt-layout-editor.js')
            .then((module) => { PLE = module; })
            .catch((error) => { console.error('[ND-UI] 请求结构编辑器加载失败，请求结构不可用:', error); }),
        import('../../shared/llm-records-view.js')
            .then((module) => { LRV = module; renderLastLlmRequest(lastLlmRecords); })
            .catch((error) => { console.error('[ND-UI] 请求记录查看器加载失败，最近请求不可用:', error); }),
    ]).finally(() => postToParent({ type: 'FRAME_READY' })), { source: import.meta.url, operation: "initializePage" });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializePage, { once: true });
else initializePage();
