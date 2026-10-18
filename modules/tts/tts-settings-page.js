import { DOMPurify } from '../../../../../../lib.js';
import { VOICE_DATA, inferResourceIdBySpeaker, isTts2Voice } from './tts-voices.js';
// Page entry; the host TTS runtime remains in tts.js.

// ═══════════════════════════════════════════════════════════════════════════
// 常量与状态
// ═══════════════════════════════════════════════════════════════════════════

const PARENT_ORIGIN = (() => {
    try { return new URL(document.referrer).origin; } catch { return window.location.origin; }
})();
const post = (type, payload) => parent.postMessage({ type, payload }, PARENT_ORIGIN);

let config = {};
let mySpeakers = [];
let selectedVoiceValue = '';
let selectedTrialVoiceValue = '';
let selectedAuthVoiceValue = '';
let editingVoiceValue = null;
let activeSaveBtn = null;
let pendingSaveRequest = null;

const TRIAL_VOICES = [
    { key: 'female_1',    name: '晓晓',   tag: '温暖百变', gender: 'female' },
    { key: 'female_2',    name: '晓伊',   tag: '清冷知性', gender: 'female' },
    { key: 'female_3',    name: '小北',   tag: '东北甜妹', gender: 'female' },
    { key: 'female_4',    name: '小妮',   tag: '陕西姑娘', gender: 'female' },
    { key: 'hk_female_1', name: '曉佳',   tag: '粤语女声', gender: 'female' },
    { key: 'hk_female_2', name: '曉曼',   tag: '粤语温柔', gender: 'female' },
    { key: 'hk_male_1',   name: '雲龍',   tag: '粤语男声', gender: 'male' },
    { key: 'tw_female_1', name: '曉臻',   tag: '台灣女聲', gender: 'female' },
    { key: 'tw_female_2', name: '曉雨',   tag: '台灣温柔', gender: 'female' },
    { key: 'tw_male_1',   name: '雲哲',   tag: '台灣男聲', gender: 'male' },
    { key: 'male_1',      name: '云希',   tag: '少年温暖', gender: 'male' },
    { key: 'male_2',      name: '云健',   tag: '阳刚有力', gender: 'male' },
    { key: 'male_3',      name: '云扬',   tag: '专业播报', gender: 'male' },
    { key: 'male_4',      name: '云夏',   tag: '少年活力', gender: 'male' },
    { key: 'en_female_1', name: 'Jenny',  tag: '美式甜美', gender: 'female' },
    { key: 'en_female_2', name: 'Aria',   tag: '美式知性', gender: 'female' },
    { key: 'en_female_3', name: 'Sonia',  tag: '英式优雅', gender: 'female' },
    { key: 'en_male_1',   name: 'Guy',    tag: '美式磁性', gender: 'male' },
    { key: 'en_male_2',   name: 'Ryan',   tag: '英式绅士', gender: 'male' },
    { key: 'ja_female_1', name: '七海',   tag: '日式温柔', gender: 'female' },
    { key: 'ja_male_1',   name: '圭太',   tag: '日式少年', gender: 'male' },
];
const TRIAL_VOICE_KEYS = new Set(TRIAL_VOICES.map(v => v.key));

const AUTH_VOICE_DATA = VOICE_DATA;

let authVoiceList = [];

// ═══════════════════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════════════════

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function switchView(viewId) {
    $$('.view').forEach(v => v.classList.remove('active'));
    $$('.nav-item, .mobile-nav-item').forEach(n => n.classList.remove('active'));
    $(`view-${viewId}`)?.classList.add('active');
    $$(`[data-view="${viewId}"]`).forEach(n => n.classList.add('active'));
}

function setSavingState(btn) {
    if (!btn) return;
    activeSaveBtn = btn;
    const i = btn.querySelector('i');
    if (i) { btn._origIcon = i.className; i.className = 'fa-solid fa-spinner fa-spin'; }
    btn.classList.add('saving');
}

function handleSaveResult(success) {
    if (!activeSaveBtn) return;
    const btn = activeSaveBtn;
    activeSaveBtn = null;
    btn.classList.remove('saving');
    const i = btn.querySelector('i');
    if (success && i) {
        i.className = 'fa-solid fa-check';
        btn.classList.add('save-success');
        setTimeout(() => { btn.classList.remove('save-success'); i.className = btn._origIcon || 'fa-solid fa-floppy-disk'; }, 1500);
    } else if (i) {
        i.className = btn._origIcon || 'fa-solid fa-floppy-disk';
    }
}

function requestSaveConfig(form, btn = null) {
    const requestId = `tts_save_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (pendingSaveRequest?.timer) clearTimeout(pendingSaveRequest.timer);
    if (btn) setSavingState(btn);

    pendingSaveRequest = {
        requestId,
        timer: setTimeout(() => {
            if (!pendingSaveRequest || pendingSaveRequest.requestId !== requestId) return;
            pendingSaveRequest = null;
            handleSaveResult(false);
            post('xb-tts:toast', { type: 'error', message: '保存超时（3秒）' });
        }, 3000),
    };

    post('xb-tts:save-config', { requestId, patch: form });
}

function setTestStatus(elId, status, text) {
    const el = $(elId);
    if (!el) return;
    el.textContent = text;
    el.className = 'test-voice-status' + (status ? ' ' + status : '');
}

function getVoiceSource(value) {
    if (!value) return 'free';
    if (TRIAL_VOICE_KEYS.has(value)) return 'free';
    return 'auth';
}

function isAuthConfigured() {
    return !!(config?.volc?.appId && config?.volc?.accessKey);
}

function isInMyList(value) {
    return mySpeakers.some(s => s.value === value);
}

// ═══════════════════════════════════════════════════════════════════════════
// 规则编辑器
// ═══════════════════════════════════════════════════════════════════════════

function renderRulesList(listEl, rules, type) {
    if (!rules?.length) {
        listEl.innerHTML = `<div class="rules-empty">暂无规则</div>`;
        return;
    }
    listEl.innerHTML = DOMPurify.sanitize(rules.map((rule, idx) => `
        <div class="rule-item" data-idx="${idx}">
            <input type="text" class="rule-input rule-start" value="${escapeHtml(rule.start || '')}" placeholder="起始（可为空）">
            <span class="rule-arrow">→</span>
            <input type="text" class="rule-input rule-end" value="${escapeHtml(rule.end || '')}" placeholder="结束（可为空）">
            <button class="rule-delete" data-type="${type}" data-idx="${idx}"><i class="fa-solid fa-times"></i></button>
        </div>
    `).join(''));
}

function collectRules(listEl) {
    const rules = [];
    listEl.querySelectorAll('.rule-item').forEach(item => {
        const start = item.querySelector('.rule-start')?.value?.trim() || '';
        const end = item.querySelector('.rule-end')?.value?.trim() || '';
        if (start || end) rules.push({ start, end });
    });
    return rules;
}

function initRulesEditors() {
    $('addSkipRule').addEventListener('click', () => {
        const rules = collectRules($('skipRulesList'));
        rules.push({ start: '', end: '' });
        renderRulesList($('skipRulesList'), rules, 'skip');
    });
    $('addReadRule').addEventListener('click', () => {
        const rules = collectRules($('readRulesList'));
        rules.push({ start: '', end: '' });
        renderRulesList($('readRulesList'), rules, 'read');
    });
    document.addEventListener('click', e => {
        const deleteBtn = e.target.closest('.rule-delete');
        if (!deleteBtn) return;
        const type = deleteBtn.dataset.type;
        const idx = parseInt(deleteBtn.dataset.idx);
        const listEl = type === 'skip' ? $('skipRulesList') : $('readRulesList');
        const rules = collectRules(listEl);
        rules.splice(idx, 1);
        renderRulesList(listEl, rules, type);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 音色处理
// ═══════════════════════════════════════════════════════════════════════════

function detectGenderByValue(value) {
    const v = String(value || '').toLowerCase();
    if (v.includes('female')) return 'female';
    if (v.includes('male')) return 'male';
    return 'other';
}

function detectModel(value) { return isTts2Voice(value) ? 'tts2' : 'tts1'; }

function detectTags(value, model) {
    const tags = [];
    if (model === 'tts2') tags.push('2.0');
    if (model === 'tts1') tags.push('1.0');
    if (String(value).includes('emo')) tags.push('多情感');
    return tags;
}

function buildAuthVoiceList() {
    authVoiceList = AUTH_VOICE_DATA.map(item => {
        const value = item.value;
        const name = item.name || value;
        const gender = detectGenderByValue(value);
        const genderLabel = gender === 'female' ? '女' : gender === 'male' ? '男' : '其他';
        const model = detectModel(value);
        const scene = String(item.scene || '').trim();
        const tags = detectTags(value, model);
        if (scene && !tags.includes(scene)) tags.push(scene);
        
        let language;
        if (model === 'tts2') {
            language = 'multi';
        } else if (value.startsWith('en_')) {
            language = 'en';
        } else if (value.startsWith('multi_')) {
            language = 'other';
        } else {
            language = 'zh';
        }
        
        return { value, name, gender, genderLabel, model, language, scene, tags };
    });
}

function formatTagLabel(tags) { return tags.length ? ` [${tags.join('/')}]` : ''; }

// ═══════════════════════════════════════════════════════════════════════════
// UI 更新
// ═══════════════════════════════════════════════════════════════════════════

function updateApiStatus() {
    const configured = isAuthConfigured();
    const box = $('apiStatusBox');
    const icon = box.querySelector('.api-status-icon i');
    const title = box.querySelector('.api-status-title');
    const desc = box.querySelector('.api-status-desc');
    const badge = $('badge_auth');
    
    if (configured) {
        box.className = 'api-status-box configured';
        icon.className = 'fa-solid fa-link';
        title.textContent = '已配置';
        desc.textContent = '可使用预设音色库和复刻音色';
        badge.className = 'header-badge active';
        $('authVoiceNotice').style.display = 'none';
    } else {
        box.className = 'api-status-box not-configured';
        icon.className = 'fa-solid fa-link-slash';
        title.textContent = '未配置';
        desc.textContent = '配置后可使用预设音色库和复刻音色';
        badge.className = 'header-badge';
        $('authVoiceNotice').style.display = 'flex';
    }
}

function updateCurrentVoiceDisplay() {
    const nameEl = $('currentVoiceName');
    const sourceEl = $('currentVoiceSource');
    
    if (!selectedVoiceValue) {
        nameEl.innerHTML = '未选择';
        sourceEl.textContent = '请在下方选择音色';
        return;
    }
    
    const myVoice = mySpeakers.find(s => s.value === selectedVoiceValue);
    const source = myVoice?.source || getVoiceSource(selectedVoiceValue);
    const sourceBadge = source === 'free' 
        ? '<span class="source-badge trial">试用</span>' 
        : '<span class="source-badge auth">鉴权</span>';
    
    if (myVoice) {
        nameEl.innerHTML = DOMPurify.sanitize(`${escapeHtml(myVoice.name)} ${sourceBadge}`);
        sourceEl.textContent = '我的音色';
    } else if (source === 'free') {
        const tv = TRIAL_VOICES.find(v => v.key === selectedVoiceValue);
        nameEl.innerHTML = DOMPurify.sanitize(`${escapeHtml(tv?.name || selectedVoiceValue)} ${sourceBadge}`);
        sourceEl.textContent = tv?.tag || '试用音色';
    } else {
        const av = authVoiceList.find(v => v.value === selectedVoiceValue);
        nameEl.innerHTML = DOMPurify.sanitize(`${escapeHtml(av?.name || selectedVoiceValue)} ${sourceBadge}`);
        sourceEl.textContent = '预设音色（建议先添加到我的音色）';
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 渲染音色列表
// ═══════════════════════════════════════════════════════════════════════════

function renderMyVoiceList() {
    const listEl = $('myVoiceList');
    const emptyEl = $('myVoiceEmpty');
    $('myVoiceCount').textContent = mySpeakers.length;
    
    if (!mySpeakers.length) {
        listEl.innerHTML = '';
        listEl.style.display = 'none';
        emptyEl.style.display = 'block';
        return;
    }
    
    listEl.style.display = 'flex';
    emptyEl.style.display = 'none';
    
    const authOk = isAuthConfigured();
    
    listEl.innerHTML = DOMPurify.sanitize(mySpeakers.map(s => {
        const isSelected = s.value === selectedVoiceValue;
        const isEditing = s.value === editingVoiceValue;
        const source = s.source || getVoiceSource(s.value);
        const canPlay = source === 'free' || authOk;
        const sourceBadge = source === 'free' 
            ? '<span class="source-badge trial">试用</span>' 
            : '<span class="source-badge auth">鉴权</span>';
        
        return `
        <div class="voice-item${isSelected ? ' selected' : ''}${isEditing ? ' editing' : ''}${!canPlay ? ' disabled' : ''}" 
             data-value="${escapeHtml(s.value)}" data-source="${escapeHtml(source)}">
            <div class="voice-item-radio"></div>
            <div class="voice-item-info">
                <div class="voice-item-name">${escapeHtml(s.name || s.value)} ${sourceBadge}</div>
                <div class="voice-item-meta">${!canPlay ? '需配置鉴权' : escapeHtml(s.value.slice(0, 25))}</div>
                <div class="voice-item-edit-form">
                    <input type="text" class="input voice-edit-input" value="${escapeHtml(s.name || '')}" placeholder="输入新名称">
                    <button class="btn btn-xs btn-primary voice-edit-save"><i class="fa-solid fa-check"></i></button>
                    <button class="btn btn-xs voice-edit-cancel"><i class="fa-solid fa-times"></i></button>
                </div>
            </div>
            <div class="voice-item-actions">
                <button class="btn btn-xs voice-rename-btn" data-value="${escapeHtml(s.value)}" title="改名">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-xs btn-danger voice-delete-btn" data-value="${escapeHtml(s.value)}" title="删除">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>`;
    }).join(''));
    
    bindMyVoiceEvents(listEl);
}

function bindMyVoiceEvents(listEl) {
    listEl.querySelectorAll('.voice-item').forEach(item => {
        item.addEventListener('click', e => {
            if (e.target.closest('button') || e.target.closest('input')) return;
            if (item.classList.contains('disabled')) {
                post('xb-tts:toast', { type: 'error', message: '请先配置鉴权 API' });
                return;
            }
            if (editingVoiceValue) return;
            selectedVoiceValue = item.dataset.value;
            renderMyVoiceList();
            updateCurrentVoiceDisplay();
        });
    });
    
    listEl.querySelectorAll('.voice-rename-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            editingVoiceValue = btn.dataset.value;
            renderMyVoiceList();
            listEl.querySelector('.voice-edit-input')?.focus();
        });
    });
    
    listEl.querySelectorAll('.voice-edit-save').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const item = mySpeakers.find(s => s.value === editingVoiceValue);
            const input = btn.closest('.voice-item').querySelector('.voice-edit-input');
            if (item && input?.value?.trim()) {
                item.name = input.value.trim();
                requestSaveConfig(collectForm());
            }
            editingVoiceValue = null;
            renderMyVoiceList();
            updateCurrentVoiceDisplay();
        });
    });
    
    listEl.querySelectorAll('.voice-edit-cancel').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            editingVoiceValue = null;
            renderMyVoiceList();
        });
    });
    
    listEl.querySelectorAll('.voice-delete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const value = btn.dataset.value;
            const item = mySpeakers.find(s => s.value === value);
            if (confirm(`删除「${item?.name || value}」？`)) {
                mySpeakers = mySpeakers.filter(s => s.value !== value);
                if (selectedVoiceValue === value) {
                    selectedVoiceValue = mySpeakers[0]?.value || '';
                }
                renderMyVoiceList();
                renderTrialVoiceList();
                renderAuthVoiceList();
                updateCurrentVoiceDisplay();
                requestSaveConfig(collectForm());
            }
        });
    });
}

function renderTrialVoiceList() {
    const listEl = $('trialVoiceList');
    listEl.innerHTML = DOMPurify.sanitize(TRIAL_VOICES.map(v => {
        const isSelected = v.key === selectedTrialVoiceValue;
        const inMy = isInMyList(v.key);
        return `
        <div class="voice-item${isSelected ? ' selected' : ''}${inMy ? ' in-my-list' : ''}" data-value="${v.key}">
            <div class="voice-item-radio"></div>
            <div class="voice-item-info">
                <div class="voice-item-name">${escapeHtml(v.name)}${inMy ? ' <span class="source-badge trial">已添加</span>' : ''}</div>
                <div class="voice-item-meta">${escapeHtml(v.tag)} · ${v.gender === 'female' ? '女' : '男'}</div>
            </div>
        </div>`;
    }).join(''));
    
    listEl.querySelectorAll('.voice-item').forEach(item => {
        item.addEventListener('click', () => {
            selectedTrialVoiceValue = item.dataset.value;
            renderTrialVoiceList();
        });
    });
}

function renderAuthVoiceList() {
    const gender = $('voiceGenderFilter')?.value || 'all';
    const model = $('voiceModelFilter')?.value || 'all';
    const language = $('voiceLangFilter')?.value || 'all';
    const scene = $('voiceSceneFilter')?.value || 'all';
    const search = ($('voiceSearchInput')?.value || '').toLowerCase().trim();

    const list = authVoiceList.filter(item => {
        if (gender !== 'all' && item.gender !== gender) return false;
        if (model !== 'all' && item.model !== model) return false;
        if (language !== 'all' && item.language !== language) return false;
        if (scene !== 'all' && item.scene !== scene) return false;
        if (search && !item.name.toLowerCase().includes(search) && !item.value.toLowerCase().includes(search)) return false;
        return true;
    }).sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));

    const listEl = $('authVoiceList');
    if (!list.length) {
        listEl.innerHTML = '<div class="rules-empty">没有匹配的音色</div>';
        return;
    }

    listEl.innerHTML = DOMPurify.sanitize(list.map(item => {
        const isSelected = item.value === selectedAuthVoiceValue;
        const inMy = isInMyList(item.value);
        return `
        <div class="voice-item${isSelected ? ' selected' : ''}${inMy ? ' in-my-list' : ''}" data-value="${escapeHtml(item.value)}">
            <div class="voice-item-radio"></div>
            <div class="voice-item-info">
                <div class="voice-item-name">${escapeHtml(item.name)}${inMy ? ' <span class="source-badge auth">已添加</span>' : ''}</div>
                <div class="voice-item-meta">${escapeHtml(item.genderLabel)}${formatTagLabel(item.tags)}</div>
            </div>
        </div>`;
    }).join(''));

    listEl.querySelectorAll('.voice-item').forEach(item => {
        item.addEventListener('click', () => {
            selectedAuthVoiceValue = item.dataset.value;
            renderAuthVoiceList();
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 数据处理
// ═══════════════════════════════════════════════════════════════════════════

function normalizeMySpeakers(list) {
    if (!Array.isArray(list)) return [];
    return list.map(item => ({
        name: String(item?.name || '').trim(),
        value: String(item?.value || '').trim(),
        source: item?.source || getVoiceSource(item?.value || ''),
        resourceId: item?.resourceId || null,
    })).filter(item => {
        if (!item.value) return false;
        // Keep UI behavior aligned with runtime: remove unsupported legacy free voices.
        if (item.source === 'free' && !TRIAL_VOICE_KEYS.has(item.value)) return false;
        return true;
    });
}

function applyCacheStats(stats = {}) {
    $('cacheCount').textContent = stats.count ?? 0;
    $('cacheSize').textContent = `${stats.sizeMB ?? 0} MB`;
    $('cacheHits').textContent = stats.hits ?? 0;
    $('cacheMisses').textContent = stats.misses ?? 0;
}

function fillForm(cfg) {
    config = cfg || {};
    mySpeakers = normalizeMySpeakers(cfg.volc?.mySpeakers);
    selectedVoiceValue = cfg.volc?.defaultSpeaker || '';
    
    $('appId').value = cfg.volc?.appId || '';
    $('accessKey').value = cfg.volc?.accessKey || '';
    $('autoSpeak').checked = cfg.autoSpeak !== false;
    
    const speechRate = Number.isFinite(cfg.volc?.speechRate) ? cfg.volc.speechRate : 1.0;
    $('speechRate').value = speechRate;
    $('speechRateValue').textContent = `${speechRate.toFixed(1)}x`;
    
    renderRulesList($('skipRulesList'), cfg.skipRanges || [], 'skip');
    renderRulesList($('readRulesList'), cfg.readRanges || [], 'read');
    $('readRangesEnabled').checked = cfg.readRangesEnabled === true;

    $('usageReturn').checked = cfg.volc?.usageReturn === true;
    $('serverCacheEnabled').checked = cfg.volc?.serverCacheEnabled === true;
    $('disableMarkdownFilter').checked = cfg.volc?.disableMarkdownFilter !== false;
    $('useTts11').checked = cfg.volc?.useTts11 !== false;
    $('disableEmojiFilter').checked = cfg.volc?.disableEmojiFilter === true;
    $('enableLanguageDetector').checked = cfg.volc?.enableLanguageDetector === true;
    $('explicitLanguage').value = cfg.volc?.explicitLanguage || '';
    $('maxLengthToFilterParenthesis').value = cfg.volc?.maxLengthToFilterParenthesis ?? 100;
    $('postProcessPitch').value = cfg.volc?.postProcessPitch ?? 0;
    $('cacheDays').value = cfg.volc?.cacheDays ?? 7;
    $('cacheMaxEntries').value = cfg.volc?.cacheMaxEntries ?? 200;
    $('cacheMaxMB').value = cfg.volc?.cacheMaxMB ?? 200;
    applyCacheStats(cfg.cacheStats || {});

    $('showFloorButton').checked = cfg.showFloorButton !== false;
    $('showFloatingButton').checked = cfg.showFloatingButton === true;
    
    updateApiStatus();
    renderMyVoiceList();
    renderTrialVoiceList();
    renderAuthVoiceList();
    updateCurrentVoiceDisplay();
}

function collectForm() {
    const speaker = selectedVoiceValue;
    const source = getVoiceSource(speaker);
    const speakerItem = mySpeakers.find(item => item.value === speaker);
    
    return {
        volc: {
            appId: $('appId').value.trim(),
            accessKey: $('accessKey').value.trim(),
            defaultResourceId: source === 'auth' ? inferResourceIdBySpeaker(speaker, speakerItem?.resourceId) : '',
            defaultSpeaker: speaker,
            mySpeakers: mySpeakers,
            usageReturn: $('usageReturn').checked,
            serverCacheEnabled: $('serverCacheEnabled').checked,
            disableMarkdownFilter: $('disableMarkdownFilter').checked,
            useTts11: $('useTts11').checked,
            disableEmojiFilter: $('disableEmojiFilter').checked,
            enableLanguageDetector: $('enableLanguageDetector').checked,
            explicitLanguage: $('explicitLanguage').value.trim(),
            maxLengthToFilterParenthesis: Number($('maxLengthToFilterParenthesis').value) || 0,
            postProcessPitch: Number($('postProcessPitch').value) || 0,
            speechRate: Number($('speechRate').value) || 1.0,
            localCacheEnabled: true,
            cacheDays: Math.max(1, Number($('cacheDays').value) || 7),
            cacheMaxEntries: Math.max(10, Number($('cacheMaxEntries').value) || 200),
            cacheMaxMB: Math.max(10, Number($('cacheMaxMB').value) || 200),
        },
        autoSpeak: $('autoSpeak').checked,
        skipRanges: collectRules($('skipRulesList')),
        readRanges: collectRules($('readRulesList')),
        readRangesEnabled: $('readRangesEnabled').checked,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 试听功能
// ═══════════════════════════════════════════════════════════════════════════

function doTestVoice(speaker, source, textElId, statusElId) {
    const text = $(textElId)?.value?.trim() || '你好，这是一段测试语音。';
    
    if (!speaker) {
        setTestStatus(statusElId, 'error', '请先选择一个音色');
        return;
    }
    
    if (source === 'auth' && !isAuthConfigured()) {
        setTestStatus(statusElId, 'error', '请先配置鉴权 API');
        return;
    }
    
    setTestStatus(statusElId, 'playing', '正在合成...');
    
    const speakerItem = mySpeakers.find(s => s.value === speaker);
    const resolvedResourceId = speakerItem?.resourceId;

    post('xb-tts:test-speak', {
        text,
        speaker,
        source,
        resourceId: source === 'auth' ? (resolvedResourceId || inferResourceIdBySpeaker(speaker)) : '',
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 消息处理
// ═══════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line no-restricted-syntax -- Rejects both foreign origins and windows before reading data.
window.addEventListener('message', ev => {
    if (ev.origin !== PARENT_ORIGIN || ev.source !== parent) return;
    if (!ev.data?.type?.startsWith('xb-tts:')) return;
    const { type, payload } = ev.data;

    switch (type) {
        case 'xb-tts:config':
            fillForm(payload);
            break;
        case 'xb-tts:config-saved':
            if (pendingSaveRequest?.requestId && payload?.requestId && pendingSaveRequest.requestId !== payload.requestId) break;
            if (pendingSaveRequest?.timer) clearTimeout(pendingSaveRequest.timer);
            pendingSaveRequest = null;
            fillForm(payload);
            handleSaveResult(true);
            post('xb-tts:toast', { type: 'success', message: '配置已保存' });
            break;
        case 'xb-tts:config-save-error':
            if (pendingSaveRequest?.requestId && payload?.requestId && pendingSaveRequest.requestId !== payload.requestId) break;
            if (pendingSaveRequest?.timer) clearTimeout(pendingSaveRequest.timer);
            pendingSaveRequest = null;
            if (payload?.config) fillForm(payload.config);
            handleSaveResult(false);
            post('xb-tts:toast', { type: 'error', message: payload?.message || '保存失败' });
            break;
        case 'xb-tts:button-mode-saved':
            $('showFloorButton').checked = payload?.showFloorButton !== false;
            $('showFloatingButton').checked = payload?.showFloatingButton === true;
            break;
        case 'xb-tts:button-mode-save-error':
            $('showFloorButton').checked = payload?.showFloorButton !== false;
            $('showFloatingButton').checked = payload?.showFloatingButton === true;
            post('xb-tts:toast', { type: 'error', message: payload?.message || '显示设置保存失败' });
            break;
        case 'xb-tts:test-done':
            ['testMyStatus', 'testTrialStatus', 'testAuthStatus'].forEach(id => setTestStatus(id, 'playing', '播放中...'));
            setTimeout(() => ['testMyStatus', 'testTrialStatus', 'testAuthStatus'].forEach(id => setTestStatus(id, '', '')), 3000);
            break;
        case 'xb-tts:test-error': {
            const errMsg = '失败: ' + (payload || '未知错误');
            ['testMyStatus', 'testTrialStatus', 'testAuthStatus'].forEach(id => setTestStatus(id, 'error', errMsg));
            break;
        }
        case 'xb-tts:cache-stats':
            applyCacheStats(payload || {});
            break;
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// 初始化
// ═══════════════════════════════════════════════════════════════════════════

function initializePage() {
    buildAuthVoiceList();
    initRulesEditors();
    
    const scenes = new Set();
    authVoiceList.forEach(item => { if (item.scene) scenes.add(item.scene); });
    $('voiceSceneFilter').innerHTML = DOMPurify.sanitize('<option value="all">全部场景</option>' + 
        Array.from(scenes).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN')).map(s => `<option value="${s}">${s}</option>`).join(''));

    $$('.nav-item, .mobile-nav-item').forEach(item => item.addEventListener('click', () => switchView(item.dataset.view)));
    $('tts_close').addEventListener('click', () => post('xb-tts:close'));
    $('showFloorButton').addEventListener('change', () => {
        post('xb-tts:save-button-mode', {
            showFloorButton: $('showFloorButton').checked,
            showFloatingButton: $('showFloatingButton').checked
        });
    });
    $('showFloatingButton').addEventListener('change', () => {
        post('xb-tts:save-button-mode', {
            showFloorButton: $('showFloorButton').checked,
            showFloatingButton: $('showFloatingButton').checked
        });
    });

    $('toggleKey').addEventListener('click', () => {
        const input = $('accessKey');
        const icon = $('toggleKey').querySelector('i');
        input.type = input.type === 'password' ? 'text' : 'password';
        icon.className = input.type === 'password' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
    });

    ['appId', 'accessKey'].forEach(id => {
        $(id).addEventListener('input', () => {
            config.volc = config.volc || {};
            config.volc.appId = $('appId').value.trim();
            config.volc.accessKey = $('accessKey').value.trim();
            updateApiStatus();
            renderMyVoiceList();
        });
    });

    $('speechRate').addEventListener('input', e => {
        $('speechRateValue').textContent = `${Number(e.target.value).toFixed(1)}x`;
    });

    ['voiceGenderFilter', 'voiceModelFilter', 'voiceLangFilter', 'voiceSceneFilter'].forEach(id => {
        $(id)?.addEventListener('change', renderAuthVoiceList);
    });
    $('voiceSearchInput')?.addEventListener('input', renderAuthVoiceList);

    $$('.voice-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            $$('.voice-tab').forEach(t => t.classList.remove('active'));
            $$('.voice-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            $(`panel-${tab.dataset.panel}`)?.classList.add('active');
        });
    });

    $('testMyVoiceBtn').addEventListener('click', () => {
        const my = mySpeakers.find(s => s.value === selectedVoiceValue);
        const source = my?.source || getVoiceSource(selectedVoiceValue);
        doTestVoice(selectedVoiceValue, source, 'testTextMy', 'testMyStatus');
    });
    $('testTrialVoiceBtn').addEventListener('click', () => {
        doTestVoice(selectedTrialVoiceValue, 'free', 'testTextTrial', 'testTrialStatus');
    });
    $('testAuthVoiceBtn').addEventListener('click', () => {
        doTestVoice(selectedAuthVoiceValue, 'auth', 'testTextAuth', 'testAuthStatus');
    });

    $('saveToMyVoiceTrialBtn').addEventListener('click', () => {
        if (!selectedTrialVoiceValue) { post('xb-tts:toast', { type: 'error', message: '请先选择一个音色' }); return; }
        const tv = TRIAL_VOICES.find(v => v.key === selectedTrialVoiceValue);
        const name = $('saveAsNameTrial').value.trim() || tv?.name || selectedTrialVoiceValue;
        
        if (!isInMyList(selectedTrialVoiceValue)) {
            mySpeakers.push({ name, value: selectedTrialVoiceValue, source: 'free' });
        }
        selectedVoiceValue = selectedTrialVoiceValue;
        $('saveAsNameTrial').value = '';
        
        renderMyVoiceList();
        renderTrialVoiceList();
        updateCurrentVoiceDisplay();
        
        $$('.voice-tab').forEach(t => t.classList.remove('active'));
        $$('.voice-panel').forEach(p => p.classList.remove('active'));
        $$('.voice-tab')[0].classList.add('active');
        $('panel-myVoice').classList.add('active');
        
        requestSaveConfig(collectForm());
        post('xb-tts:toast', { type: 'success', message: `已添加：${name}` });
    });

    $('saveToMyVoiceAuthBtn').addEventListener('click', () => {
        if (!selectedAuthVoiceValue) { post('xb-tts:toast', { type: 'error', message: '请先选择一个音色' }); return; }
        const av = authVoiceList.find(v => v.value === selectedAuthVoiceValue);
        const name = $('saveAsNameAuth').value.trim() || av?.name || selectedAuthVoiceValue;
        
        if (!isInMyList(selectedAuthVoiceValue)) {
            mySpeakers.push({ name, value: selectedAuthVoiceValue, source: 'auth' });
        }
        selectedVoiceValue = selectedAuthVoiceValue;
        $('saveAsNameAuth').value = '';
        
        renderMyVoiceList();
        renderAuthVoiceList();
        updateCurrentVoiceDisplay();
        
        $$('.voice-tab').forEach(t => t.classList.remove('active'));
        $$('.voice-panel').forEach(p => p.classList.remove('active'));
        $$('.voice-tab')[0].classList.add('active');
        $('panel-myVoice').classList.add('active');
        
        requestSaveConfig(collectForm());
        post('xb-tts:toast', { type: 'success', message: `已添加：${name}` });
    });

    $('addMySpeakerBtn').addEventListener('click', () => {
        const id = $('newVoiceId').value.trim();
        const name = $('newVoiceName').value.trim();
        const resourceId = $('newVoiceResourceId').value;
        if (!id) { post('xb-tts:toast', { type: 'error', message: '请输入音色ID' }); return; }
        
        if (!isInMyList(id)) {
            mySpeakers.push({ name: name || id, value: id, source: 'auth', resourceId });
        }
        selectedVoiceValue = id;
        $('newVoiceId').value = '';
        $('newVoiceName').value = '';
        
        renderMyVoiceList();
        updateCurrentVoiceDisplay();
        requestSaveConfig(collectForm());
        post('xb-tts:toast', { type: 'success', message: `已添加：${name || id}` });
    });

    ['saveConfigBtn', 'saveVoiceBtn', 'saveAdvancedBtn', 'saveCacheBtn'].forEach(id => {
        $(id)?.addEventListener('click', () => { requestSaveConfig(collectForm(), $(id)); });
    });

    $('cacheRefreshBtn').addEventListener('click', () => post('xb-tts:cache-refresh'));
    $('cacheClearExpiredBtn').addEventListener('click', () => post('xb-tts:cache-clear-expired'));
    $('cacheClearAllBtn').addEventListener('click', () => post('xb-tts:cache-clear-all'));

    post('xb-tts:ready');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializePage, { once: true });
else initializePage();
