// story-summary-ui.js
// iframe 内 UI 逻辑

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // DOM Helpers
    // ═══════════════════════════════════════════════════════════════════════════

    const $ = id => document.getElementById(id);
    const $$ = sel => document.querySelectorAll(sel);
    const h = v => String(v ?? '').replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
    const setHtml = (el, html) => {
        if (!el) return;
        const range = document.createRange();
        range.selectNodeContents(el);
        // eslint-disable-next-line no-unsanitized/method
        const fragment = range.createContextualFragment(String(html ?? ''));
        el.replaceChildren(fragment);
    };
    const setSelectOptions = (select, items, placeholderText) => {
        if (!select) return;
        select.replaceChildren();
        if (placeholderText != null) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = placeholderText;
            select.appendChild(option);
        }
        (items || []).forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            select.appendChild(option);
        });
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // Constants
    // ═══════════════════════════════════════════════════════════════════════════

    const PARENT_ORIGIN = (() => {
        try { return new URL(document.referrer).origin; }
        catch { return window.location.origin; }
    })();

    const PROVIDER_DEFAULTS = {
        st: { url: '', needKey: false, canFetch: false, needManualModel: false },
        openai: { url: 'https://api.openai.com', needKey: true, canFetch: true, needManualModel: false },
        google: { url: 'https://generativelanguage.googleapis.com', needKey: true, canFetch: false, needManualModel: true },
        claude: { url: 'https://api.anthropic.com', needKey: true, canFetch: false, needManualModel: true },
        custom: { url: '', needKey: true, canFetch: true, needManualModel: false }
    };

    const SECTION_META = {
        keywords: { title: '编辑关键词', hint: '每行一个关键词，格式：关键词|权重（核心/重要/一般）' },
        events: { title: '编辑事件时间线', hint: '编辑时，每个事件要素都应完整' },
        characters: { title: '编辑人物关系', hint: '编辑时，每个要素都应完整' },
        arcs: { title: '编辑角色弧光', hint: '编辑时，每个要素都应完整' },
        world: { title: '编辑世界状态', hint: '每行一条：category|topic|content。清除用：category|topic|（留空）或 category|topic|cleared' }
    };

    const TREND_COLORS = {
        '破裂': '#444444', '厌恶': '#8b0000', '反感': '#cd5c5c',
        '陌生': '#888888', '投缘': '#4a9a7e', '亲密': '#d87a7a', '交融': '#c71585'
    };

    const TREND_CLASS = {
        '破裂': 'trend-broken', '厌恶': 'trend-hate', '反感': 'trend-dislike',
        '陌生': 'trend-stranger', '投缘': 'trend-click', '亲密': 'trend-close', '交融': 'trend-merge'
    };

    const LOCAL_MODELS_INFO = {
        'bge-small-zh': { desc: '手机/低配适用' },
        'bge-base-zh': { desc: 'PC 推荐，效果更好' },
        'e5-small': { desc: '非中文用户' }
    };

    const ONLINE_PROVIDERS_INFO = {
        siliconflow: {
            url: 'https://api.siliconflow.cn',
            models: ['BAAI/bge-m3', 'BAAI/bge-large-zh-v1.5', 'BAAI/bge-small-zh-v1.5'],
            hint: '💡 <a href="https://siliconflow.cn" target="_blank">硅基流动</a> 注册即送额度，推荐 BAAI/bge-m3',
            canFetch: false, urlEditable: false
        },
        cohere: {
            url: 'https://api.cohere.ai',
            models: ['embed-multilingual-v3.0', 'embed-english-v3.0'],
            hint: '💡 <a href="https://cohere.com" target="_blank">Cohere</a> 提供免费试用额度',
            canFetch: false, urlEditable: false
        },
        openai: {
            url: '',
            models: [],
            hint: '💡 可用 Hugging Face Space 免费自建<br><button class="btn btn-sm" id="btn-hf-guide" style="margin-top:6px">查看部署指南</button>',
            canFetch: true, urlEditable: true
        }
    };

    const DEFAULT_FILTER_RULES = [
        { start: '<think>', end: '</think>' },
        { start: '<thinking>', end: '</thinking>' },
    ];

    // ═══════════════════════════════════════════════════════════════════════════
    // State
    // ═══════════════════════════════════════════════════════════════════════════

    const config = {
        api: { provider: 'st', url: '', key: '', model: '', modelCache: [] },
        gen: { temperature: null, top_p: null, top_k: null, presence_penalty: null, frequency_penalty: null },
        trigger: { enabled: false, interval: 20, timing: 'before_user', role: 'system', useStream: true, maxPerRun: 100, wrapperHead: '', wrapperTail: '', forceInsertAtEnd: false },
        vector: { enabled: false, engine: 'online', local: { modelId: 'bge-small-zh' }, online: { provider: 'siliconflow', url: '', key: '', model: '' } }
    };

    let summaryData = { keywords: [], events: [], characters: { main: [], relationships: [] }, arcs: [], world: [] };
    let localGenerating = false;
    let vectorGenerating = false;
    let relationChart = null;
    let relationChartFullscreen = null;
    let currentEditSection = null;
    let currentCharacterId = null;
    let allNodes = [];
    let allLinks = [];
    let activeRelationTooltip = null;
    let lastRecallLogText = '';

    // ═══════════════════════════════════════════════════════════════════════════
    // Messaging
    // ═══════════════════════════════════════════════════════════════════════════

    function postMsg(type, data = {}) {
        window.parent.postMessage({ source: 'LittleWhiteBox-StoryFrame', type, ...data }, PARENT_ORIGIN);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Config Management
    // ═══════════════════════════════════════════════════════════════════════════

    function loadConfig() {
        try {
            const s = localStorage.getItem('summary_panel_config');
            if (s) {
                const p = JSON.parse(s);
                Object.assign(config.api, p.api || {});
                Object.assign(config.gen, p.gen || {});
                Object.assign(config.trigger, p.trigger || {});
                if (p.vector) config.vector = p.vector;
                if (config.trigger.timing === 'manual' && config.trigger.enabled) {
                    config.trigger.enabled = false;
                    saveConfig();
                }
            }
        } catch { }
    }

    function applyConfig(cfg) {
        if (!cfg) return;
        Object.assign(config.api, cfg.api || {});
        Object.assign(config.gen, cfg.gen || {});
        Object.assign(config.trigger, cfg.trigger || {});
        if (cfg.vector) config.vector = cfg.vector;
        if (config.trigger.timing === 'manual') config.trigger.enabled = false;
        localStorage.setItem('summary_panel_config', JSON.stringify(config));
    }

    function saveConfig() {
        try {
            const settingsOpen = $('settings-modal')?.classList.contains('active');
            if (settingsOpen) config.vector = getVectorConfig();
            if (!config.vector) {
                config.vector = { enabled: false, engine: 'online', local: { modelId: 'bge-small-zh' }, online: { provider: 'siliconflow', url: '', key: '', model: '' } };
            }
            localStorage.setItem('summary_panel_config', JSON.stringify(config));
            postMsg('SAVE_PANEL_CONFIG', { config });
        } catch (e) {
            console.error('saveConfig error:', e);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Vector Config UI
    // ═══════════════════════════════════════════════════════════════════════════

    function getVectorConfig() {
        const safeVal = (id, fallback) => {
            const el = $(id);
            if (!el) return fallback;
            return el.type === 'checkbox' ? el.checked : (el.value?.trim() || fallback);
        };
        const safeRadio = (name, fallback) => {
            const el = document.querySelector(`input[name="${name}"]:checked`);
            return el?.value || fallback;
        };
        const modelSelect = $('vector-model-select');
        const modelCache = [];
        if (modelSelect) {
            for (const opt of modelSelect.options) {
                if (opt.value) modelCache.push(opt.value);
            }
        }
        const result = {
            enabled: safeVal('vector-enabled', false),
            engine: safeRadio('vector-engine', 'online'),
            local: { modelId: safeVal('local-model-select', 'bge-small-zh') },
            online: {
                provider: safeVal('online-provider', 'siliconflow'),
                url: safeVal('vector-api-url', ''),
                key: safeVal('vector-api-key', ''),
                model: safeVal('vector-model-select', ''),
                modelCache
            }
        };

        // 收集过滤规则
        result.textFilterRules = collectFilterRules();
        return result;
    }

    function loadVectorConfig(cfg) {
        if (!cfg) return;
        $('vector-enabled').checked = !!cfg.enabled;
        $('vector-config-area').classList.toggle('hidden', !cfg.enabled);

        const engine = cfg.engine || 'online';
        const engineRadio = document.querySelector(`input[name="vector-engine"][value="${engine}"]`);
        if (engineRadio) engineRadio.checked = true;

        $('local-engine-area').classList.toggle('hidden', engine !== 'local');
        $('online-engine-area').classList.toggle('hidden', engine !== 'online');

        if (cfg.local?.modelId) {
            $('local-model-select').value = cfg.local.modelId;
            updateLocalModelDesc(cfg.local.modelId);
        }
        if (cfg.online) {
            const provider = cfg.online.provider || 'siliconflow';
            $('online-provider').value = provider;
            updateOnlineProviderUI(provider);
            if (cfg.online.url) $('vector-api-url').value = cfg.online.url;
            if (cfg.online.key) $('vector-api-key').value = cfg.online.key;
            if (cfg.online.modelCache?.length) {
                setSelectOptions($('vector-model-select'), cfg.online.modelCache);
            }
            if (cfg.online.model) $('vector-model-select').value = cfg.online.model;
        }

        // 加载过滤规则
        renderFilterRules(cfg?.textFilterRules || DEFAULT_FILTER_RULES);
    }

    function updateLocalModelDesc(modelId) {
        const info = LOCAL_MODELS_INFO[modelId];
        $('local-model-desc').textContent = info?.desc || '';
    }

    function updateOnlineProviderUI(provider) {
        const info = ONLINE_PROVIDERS_INFO[provider];
        if (!info) return;

        const urlInput = $('vector-api-url');
        const urlRow = $('online-url-row');
        if (info.urlEditable) {
            urlInput.value = urlInput.value || '';
            urlInput.disabled = false;
            urlRow.style.display = '';
        } else {
            urlInput.value = info.url;
            urlInput.disabled = true;
            urlRow.style.display = 'none';
        }

        const modelSelect = $('vector-model-select');
        const fetchBtn = $('btn-fetch-models');
        if (info.canFetch) {
            fetchBtn.style.display = '';
            setHtml(modelSelect, '<option value="">点击拉取或手动输入</option>');
        } else {
            fetchBtn.style.display = 'none';
            setSelectOptions(modelSelect, info.models);
        }

        setHtml($('provider-hint'), info.hint);
        const guideBtn = $('btn-hf-guide');
        if (guideBtn) guideBtn.onclick = e => { e.preventDefault(); openHfGuide(); };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Filter Rules UI
    // ═══════════════════════════════════════════════════════════════════════════

    function renderFilterRules(rules) {
        const list = $('filter-rules-list');
        if (!list) return;

        const items = rules?.length ? rules : [];

        setHtml(list, items.map((r, i) => `
            <div class="filter-rule-item" data-idx="${i}">
                <div class="filter-rule-inputs">
                    <input type="text" class="filter-rule-start" placeholder="起始（可空）" value="${h(r.start || '')}">
                    <span class="rule-arrow">⬇</span>
                    <input type="text" class="filter-rule-end" placeholder="结束（可空）" value="${h(r.end || '')}">
                </div>
                <button class="btn-del-rule">✕</button>
            </div>
        `).join(''));

        // 绑定删除
        list.querySelectorAll('.btn-del-rule').forEach(btn => {
            btn.onclick = () => {
                btn.closest('.filter-rule-item')?.remove();
            };
        });
    }

    function collectFilterRules() {
        const list = $('filter-rules-list');
        if (!list) return [];

        const rules = [];
        list.querySelectorAll('.filter-rule-item').forEach(item => {
            const start = item.querySelector('.filter-rule-start')?.value?.trim() || '';
            const end = item.querySelector('.filter-rule-end')?.value?.trim() || '';
            if (start || end) {
                rules.push({ start, end });
            }
        });
        return rules;
    }

    function addFilterRule() {
        const list = $('filter-rules-list');
        if (!list) return;

        const idx = list.querySelectorAll('.filter-rule-item').length;
        const div = document.createElement('div');
        div.className = 'filter-rule-item';
        div.dataset.idx = idx;
        setHtml(div, `
            <div class="filter-rule-inputs">
                <input type="text" class="filter-rule-start" placeholder="起始（可空）" value="">
                <span class="rule-arrow">⬇</span>
                <input type="text" class="filter-rule-end" placeholder="结束（可空）" value="">
            </div>
            <button class="btn-del-rule">✕</button>
        `);
        div.querySelector('.btn-del-rule').onclick = () => div.remove();
        list.appendChild(div);
    }

    function updateLocalModelStatus(status, message) {
        const dot = $('local-model-status').querySelector('.status-dot');
        const text = $('local-model-status').querySelector('.status-text');
        dot.className = 'status-dot ' + status;
        text.textContent = message;

        const btnDownload = $('btn-download-model');
        const btnCancel = $('btn-cancel-download');
        const btnDelete = $('btn-delete-model');
        const progress = $('local-model-progress');

        btnDownload.style.display = (status === 'not_downloaded' || status === 'cached' || status === 'error') ? '' : 'none';
        btnCancel.style.display = (status === 'downloading') ? '' : 'none';
        btnDelete.style.display = (status === 'ready' || status === 'cached') ? '' : 'none';
        progress.classList.toggle('hidden', status !== 'downloading');

        btnDownload.textContent = status === 'cached' ? '加载模型' : status === 'error' ? '重试下载' : '下载模型';
    }

    function updateLocalModelProgress(percent) {
        const progress = $('local-model-progress');
        progress.classList.remove('hidden');
        progress.querySelector('.progress-inner').style.width = percent + '%';
        progress.querySelector('.progress-text').textContent = percent + '%';
    }

    function updateOnlineStatus(status, message) {
        const dot = $('online-api-status').querySelector('.status-dot');
        const text = $('online-api-status').querySelector('.status-text');
        dot.className = 'status-dot ' + status;
        text.textContent = message;
    }

    function updateOnlineModels(models) {
        const select = $('vector-model-select');
        const current = select.value;
        setSelectOptions(select, models);
        if (current && models.includes(current)) select.value = current;
        if (!config.vector) config.vector = { enabled: false, engine: 'online', local: {}, online: {} };
        if (!config.vector.online) config.vector.online = {};
        config.vector.online.modelCache = [...models];
    }

    function updateVectorStats(stats) {
        $('vector-event-count').textContent = stats.eventVectors || 0;
        if ($('vector-event-total')) $('vector-event-total').textContent = stats.eventCount || 0;
        if ($('vector-chunk-count')) $('vector-chunk-count').textContent = stats.chunkCount || 0;
        if ($('vector-chunk-floors')) $('vector-chunk-floors').textContent = stats.builtFloors || 0;
        if ($('vector-chunk-total')) $('vector-chunk-total').textContent = stats.totalFloors || 0;
        if ($('vector-message-count')) $('vector-message-count').textContent = stats.totalMessages || 0;
    }

    function updateVectorGenProgress(phase, current, total) {
        const progressId = phase === 'L1' ? 'vector-gen-progress-l1' : 'vector-gen-progress-l2';
        const progress = $(progressId);
        const btnGen = $('btn-gen-vectors');
        const btnCancel = $('btn-cancel-vectors');
        const btnClear = $('btn-clear-vectors');

        if (current < 0) {
            progress.classList.add('hidden');
            const l1Hidden = $('vector-gen-progress-l1').classList.contains('hidden');
            const l2Hidden = $('vector-gen-progress-l2').classList.contains('hidden');
            if (l1Hidden && l2Hidden) {
                btnGen.classList.remove('hidden');
                btnCancel.classList.add('hidden');
                btnClear.classList.remove('hidden');
                vectorGenerating = false;
            }
            return;
        }

        vectorGenerating = true;
        progress.classList.remove('hidden');
        btnGen.classList.add('hidden');
        btnCancel.classList.remove('hidden');
        btnClear.classList.add('hidden');

        const percent = total > 0 ? Math.round(current / total * 100) : 0;
        progress.querySelector('.progress-inner').style.width = percent + '%';
        progress.querySelector('.progress-text').textContent = `${current}/${total}`;
    }

    function showVectorMismatchWarning(show) {
        $('vector-mismatch-warning').classList.toggle('hidden', !show);
    }

    function initVectorUI() {
        $('vector-enabled').onchange = e => {
            $('vector-config-area').classList.toggle('hidden', !e.target.checked);
        };
        document.querySelectorAll('input[name="vector-engine"]').forEach(radio => {
            radio.onchange = e => {
                const isLocal = e.target.value === 'local';
                $('local-engine-area').classList.toggle('hidden', !isLocal);
                $('online-engine-area').classList.toggle('hidden', isLocal);
            };
        });
        $('local-model-select').onchange = e => {
            updateLocalModelDesc(e.target.value);
            postMsg('VECTOR_CHECK_LOCAL_MODEL', { modelId: e.target.value });
        };
        $('online-provider').onchange = e => updateOnlineProviderUI(e.target.value);
        $('btn-download-model').onclick = () => postMsg('VECTOR_DOWNLOAD_MODEL', { modelId: $('local-model-select').value });
        $('btn-cancel-download').onclick = () => postMsg('VECTOR_CANCEL_DOWNLOAD');
        $('btn-delete-model').onclick = () => {
            if (confirm('确定删除本地模型缓存？')) postMsg('VECTOR_DELETE_MODEL', { modelId: $('local-model-select').value });
        };
        $('btn-fetch-models').onclick = () => {
            postMsg('VECTOR_FETCH_MODELS', { config: { url: $('vector-api-url').value.trim(), key: $('vector-api-key').value.trim() } });
        };
        $('btn-test-vector-api').onclick = () => {
            postMsg('VECTOR_TEST_ONLINE', {
                provider: $('online-provider').value,
                config: { url: $('vector-api-url').value.trim(), key: $('vector-api-key').value.trim(), model: $('vector-model-select').value.trim() }
            });
        };

        // 过滤规则：添加按钮
        $('btn-add-filter-rule').onclick = addFilterRule;

        $('btn-gen-vectors').onclick = () => {
            if (vectorGenerating) return;
            postMsg('VECTOR_GENERATE', { config: getVectorConfig() });
        };
        $('btn-clear-vectors').onclick = () => {
            if (confirm('确定清除当前聊天的向量数据？')) postMsg('VECTOR_CLEAR');
        };
        $('btn-cancel-vectors').onclick = () => postMsg('VECTOR_CANCEL_GENERATE');

        // 导入导出
        $('btn-export-vectors').onclick = () => {
            $('btn-export-vectors').disabled = true;
            $('vector-io-status').textContent = '导出中...';
            postMsg('VECTOR_EXPORT');
        };

        $('btn-import-vectors').onclick = () => {
            // 让 parent 处理文件选择，避免 iframe 传大文件
            $('btn-import-vectors').disabled = true;
            $('vector-io-status').textContent = '导入中...';
            postMsg('VECTOR_IMPORT_PICK');
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // Settings Modal
    // ═══════════════════════════════════════════════════════════════════════════

    function updateProviderUI(provider) {
        const pv = PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.custom;
        const isSt = provider === 'st';

        $('api-url-row').classList.toggle('hidden', isSt);
        $('api-key-row').classList.toggle('hidden', !pv.needKey);
        $('api-model-manual-row').classList.toggle('hidden', isSt || !pv.needManualModel);
        $('api-model-select-row').classList.toggle('hidden', isSt || pv.needManualModel || !config.api.modelCache.length);
        $('api-connect-row').classList.toggle('hidden', isSt || !pv.canFetch);

        const urlInput = $('api-url');
        if (!urlInput.value && pv.url) urlInput.value = pv.url;
    }

    function openSettings() {
        $('api-provider').value = config.api.provider;
        $('api-url').value = config.api.url;
        $('api-key').value = config.api.key;
        $('api-model-text').value = config.api.model;
        $('gen-temp').value = config.gen.temperature ?? '';
        $('gen-top-p').value = config.gen.top_p ?? '';
        $('gen-top-k').value = config.gen.top_k ?? '';
        $('gen-presence').value = config.gen.presence_penalty ?? '';
        $('gen-frequency').value = config.gen.frequency_penalty ?? '';
        $('trigger-enabled').checked = config.trigger.enabled;
        $('trigger-interval').value = config.trigger.interval;
        $('trigger-timing').value = config.trigger.timing;
        $('trigger-role').value = config.trigger.role || 'system';
        $('trigger-stream').checked = config.trigger.useStream !== false;
        $('trigger-max-per-run').value = config.trigger.maxPerRun || 100;
        $('trigger-wrapper-head').value = config.trigger.wrapperHead || '';
        $('trigger-wrapper-tail').value = config.trigger.wrapperTail || '';
        $('trigger-insert-at-end').checked = !!config.trigger.forceInsertAtEnd;

        const en = $('trigger-enabled');
        if (config.trigger.timing === 'manual') {
            en.checked = false;
            en.disabled = true;
            en.parentElement.style.opacity = '.5';
        } else {
            en.disabled = false;
            en.parentElement.style.opacity = '1';
        }

        if (config.api.modelCache.length) {
            setHtml($('api-model-select'), config.api.modelCache.map(m =>
                `<option value="${m}"${m === config.api.model ? ' selected' : ''}>${m}</option>`
            ).join(''));
        }

        updateProviderUI(config.api.provider);
        if (config.vector) loadVectorConfig(config.vector);

        // Initialize sub-options visibility
        const autoSummaryOptions = $('auto-summary-options');
        if (autoSummaryOptions) {
            autoSummaryOptions.classList.toggle('hidden', !config.trigger.enabled);
        }
        const insertWrapperOptions = $('insert-wrapper-options');
        if (insertWrapperOptions) {
            insertWrapperOptions.classList.toggle('hidden', !config.trigger.forceInsertAtEnd);
        }

        $('settings-modal').classList.add('active');

        // Default to first tab
        $$('.settings-tab').forEach(t => t.classList.remove('active'));
        $$('.settings-tab[data-tab="tab-summary"]').forEach(t => t.classList.add('active'));
        $$('.tab-pane').forEach(p => p.classList.remove('active'));
        $('tab-summary').classList.add('active');

        postMsg('SETTINGS_OPENED');
    }

    function closeSettings(save) {
        if (save) {
            const pn = id => { const v = $(id).value; return v === '' ? null : parseFloat(v); };
            const provider = $('api-provider').value;
            const pv = PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.custom;

            config.api.provider = provider;
            config.api.url = $('api-url').value;
            config.api.key = $('api-key').value;
            config.api.model = provider === 'st' ? '' : pv.needManualModel ? $('api-model-text').value : $('api-model-select').value;

            config.gen.temperature = pn('gen-temp');
            config.gen.top_p = pn('gen-top-p');
            config.gen.top_k = pn('gen-top-k');
            config.gen.presence_penalty = pn('gen-presence');
            config.gen.frequency_penalty = pn('gen-frequency');

            const timing = $('trigger-timing').value;
            config.trigger.timing = timing;
            config.trigger.role = $('trigger-role').value || 'system';
            config.trigger.enabled = timing === 'manual' ? false : $('trigger-enabled').checked;
            config.trigger.interval = Math.max(1, Math.min(30, parseInt($('trigger-interval').value) || 20));
            config.trigger.useStream = $('trigger-stream').checked;
            config.trigger.maxPerRun = parseInt($('trigger-max-per-run').value) || 100;
            config.trigger.wrapperHead = $('trigger-wrapper-head').value;
            config.trigger.wrapperTail = $('trigger-wrapper-tail').value;
            config.trigger.forceInsertAtEnd = $('trigger-insert-at-end').checked;

            config.vector = getVectorConfig();
            saveConfig();
        }

        $('settings-modal').classList.remove('active');
        postMsg('SETTINGS_CLOSED');
    }

    async function fetchModels() {
        const btn = $('btn-connect');
        const provider = $('api-provider').value;

        if (!PROVIDER_DEFAULTS[provider]?.canFetch) {
            alert('当前渠道不支持自动拉取模型');
            return;
        }

        let baseUrl = $('api-url').value.trim().replace(/\/+$/, '');
        const apiKey = $('api-key').value.trim();

        if (!apiKey) {
            alert('请先填写 API KEY');
            return;
        }

        btn.disabled = true;
        btn.textContent = '连接中...';

        try {
            const tryFetch = async url => {
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' }
                });
                return res.ok ? (await res.json())?.data?.map(m => m?.id).filter(Boolean) || null : null;
            };

            if (baseUrl.endsWith('/v1')) baseUrl = baseUrl.slice(0, -3);

            let models = await tryFetch(`${baseUrl}/v1/models`);
            if (!models) models = await tryFetch(`${baseUrl}/models`);
            if (!models?.length) throw new Error('未获取到模型列表');

            config.api.modelCache = [...new Set(models)];
            const sel = $('api-model-select');
            setSelectOptions(sel, config.api.modelCache);
            $('api-model-select-row').classList.remove('hidden');

            if (!config.api.model && models.length) {
                config.api.model = models[0];
                sel.value = models[0];
            } else if (config.api.model) {
                sel.value = config.api.model;
            }

            saveConfig();
            alert(`成功获取 ${models.length} 个模型`);
        } catch (e) {
            alert('连接失败：' + (e.message || '请检查 URL 和 KEY'));
        } finally {
            btn.disabled = false;
            btn.textContent = '连接 / 拉取模型列表';
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Rendering Functions
    // ═══════════════════════════════════════════════════════════════════════════

    function renderKeywords(kw) {
        summaryData.keywords = kw || [];
        const wc = { '核心': 'p', '重要': 's', high: 'p', medium: 's' };
        setHtml($('keywords-cloud'), kw.length
            ? kw.map(k => `<span class="tag ${wc[k.weight] || wc[k.level] || ''}">${h(k.text)}</span>`).join('')
            : '<div class="empty">暂无关键词</div>');
    }

    function renderTimeline(ev) {
        summaryData.events = ev || [];
        const c = $('timeline-list');
        if (!ev?.length) {
            setHtml(c, '<div class="empty">暂无事件记录</div>');
            return;
        }
        setHtml(c, ev.map(e => {
            const participants = (e.participants || e.characters || []).map(h).join('、');
            return `<div class="tl-item${e.weight === '核心' || e.weight === '主线' ? ' crit' : ''}">
                <div class="tl-dot"></div>
                <div class="tl-head">
                    <div class="tl-title">${h(e.title || '')}</div>
                    <div class="tl-time">${h(e.timeLabel || '')}</div>
                </div>
                <div class="tl-brief">${h(e.summary || e.brief || '')}</div>
                <div class="tl-meta">
                    <span>人物：${participants || '—'}</span>
                    <span class="imp">${h(e.type || '')}${e.type && e.weight ? ' · ' : ''}${h(e.weight || '')}</span>
                </div>
            </div>`;
        }).join(''));
    }

    function getCharName(c) {
        return typeof c === 'string' ? c : c.name;
    }

    function hideRelationTooltip() {
        if (activeRelationTooltip) {
            activeRelationTooltip.remove();
            activeRelationTooltip = null;
        }
    }

    function showRelationTooltip(from, to, fromLabel, toLabel, fromTrend, toTrend, x, y, container) {
        hideRelationTooltip();
        const tip = document.createElement('div');
        const mobile = innerWidth <= 768;
        const fc = TREND_COLORS[fromTrend] || '#888';
        const tc = TREND_COLORS[toTrend] || '#888';

        setHtml(tip, `<div style="line-height:1.8">
            ${fromLabel ? `<div><small>${h(from)}→${h(to)}：</small> <span style="color:${fc}">${h(fromLabel)}</span> <span style="font-size:10px;color:${fc}">[${h(fromTrend)}]</span></div>` : ''}
            ${toLabel ? `<div><small>${h(to)}→${h(from)}：</small> <span style="color:${tc}">${h(toLabel)}</span> <span style="font-size:10px;color:${tc}">[${h(toTrend)}]</span></div>` : ''}
        </div>`);

        tip.style.cssText = mobile
            ? 'position:absolute;left:8px;bottom:8px;background:#fff;color:#333;padding:10px 14px;border:1px solid #ddd;border-radius:6px;font-size:12px;z-index:100;box-shadow:0 2px 12px rgba(0,0,0,.15);max-width:calc(100% - 16px)'
            : `position:absolute;left:${Math.max(80, Math.min(x, container.clientWidth - 80))}px;top:${Math.max(60, y)}px;transform:translate(-50%,-100%);background:#fff;color:#333;padding:10px 16px;border:1px solid #ddd;border-radius:6px;font-size:12px;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,.15);max-width:280px`;

        container.style.position = 'relative';
        container.appendChild(tip);
        activeRelationTooltip = tip;
    }

    function renderRelations(data) {
        summaryData.characters = data || { main: [], relationships: [] };
        const dom = $('relation-chart');
        if (!relationChart) relationChart = echarts.init(dom);

        const rels = data?.relationships || [];
        const allNames = new Set((data?.main || []).map(getCharName));
        rels.forEach(r => { if (r.from) allNames.add(r.from); if (r.to) allNames.add(r.to); });

        const degrees = {};
        rels.forEach(r => {
            degrees[r.from] = (degrees[r.from] || 0) + 1;
            degrees[r.to] = (degrees[r.to] || 0) + 1;
        });

        const nodeColors = { main: '#d87a7a', sec: '#f1c3c3', ter: '#888888', qua: '#b8b8b8' };
        const sortedDegs = Object.values(degrees).sort((a, b) => b - a);
        const getPercentile = deg => {
            if (!sortedDegs.length || deg === 0) return 100;
            const rank = sortedDegs.filter(d => d > deg).length;
            return (rank / sortedDegs.length) * 100;
        };

        allNodes = Array.from(allNames).map(name => {
            const deg = degrees[name] || 0;
            const pct = getPercentile(deg);
            let col, fontWeight;
            if (pct < 30) { col = nodeColors.main; fontWeight = '600'; }
            else if (pct < 60) { col = nodeColors.sec; fontWeight = '500'; }
            else if (pct < 90) { col = nodeColors.ter; fontWeight = '400'; }
            else { col = nodeColors.qua; fontWeight = '400'; }
            return {
                id: name, name, symbol: 'circle',
                symbolSize: Math.min(36, Math.max(16, deg * 3 + 12)),
                draggable: true,
                itemStyle: { color: col, borderColor: '#fff', borderWidth: 2, shadowColor: 'rgba(0,0,0,.1)', shadowBlur: 6, shadowOffsetY: 2 },
                label: { show: true, position: 'right', distance: 5, color: '#333', fontSize: 11, fontWeight },
                degree: deg
            };
        });

        const relMap = new Map();
        rels.forEach(r => {
            const k = [r.from, r.to].sort().join('|||');
            if (!relMap.has(k)) relMap.set(k, { from: r.from, to: r.to, fromLabel: '', toLabel: '', fromTrend: '', toTrend: '' });
            const e = relMap.get(k);
            if (r.from === e.from) { e.fromLabel = r.label || r.type || ''; e.fromTrend = r.trend || ''; }
            else { e.toLabel = r.label || r.type || ''; e.toTrend = r.trend || ''; }
        });

        allLinks = Array.from(relMap.values()).map(r => {
            const fc = TREND_COLORS[r.fromTrend] || '#b8b8b8';
            const tc = TREND_COLORS[r.toTrend] || '#b8b8b8';
            return {
                source: r.from, target: r.to, fromName: r.from, toName: r.to,
                fromLabel: r.fromLabel, toLabel: r.toLabel, fromTrend: r.fromTrend, toTrend: r.toTrend,
                lineStyle: { width: 1, color: '#d8d8d8', curveness: 0, opacity: 1 },
                label: {
                    show: true, position: 'middle', distance: 0,
                    formatter: '{a|◀}{b|▶}',
                    rich: { a: { color: fc, fontSize: 10 }, b: { color: tc, fontSize: 10 } },
                    align: 'center', verticalAlign: 'middle', offset: [0, -0.1]
                },
                emphasis: { lineStyle: { width: 1.5, color: '#aaa' }, label: { fontSize: 11 } }
            };
        });

        if (!allNodes.length) { relationChart.clear(); return; }

        const updateChart = (nodes, links, focusId = null) => {
            const fadeOpacity = 0.2;
            const processedNodes = focusId ? nodes.map(n => {
                const rl = links.filter(l => l.source === focusId || l.target === focusId);
                const rn = new Set([focusId]);
                rl.forEach(l => { rn.add(l.source); rn.add(l.target); });
                const isRelated = rn.has(n.id);
                return { ...n, itemStyle: { ...n.itemStyle, opacity: isRelated ? 1 : fadeOpacity }, label: { ...n.label, opacity: isRelated ? 1 : fadeOpacity } };
            }) : nodes;

            const processedLinks = focusId ? links.map(l => {
                const isRelated = l.source === focusId || l.target === focusId;
                return { ...l, lineStyle: { ...l.lineStyle, opacity: isRelated ? 1 : fadeOpacity }, label: { ...l.label, opacity: isRelated ? 1 : fadeOpacity } };
            }) : links;

            relationChart.setOption({
                backgroundColor: 'transparent',
                tooltip: { show: false },
                hoverLayerThreshold: Infinity,
                series: [{
                    type: 'graph', layout: 'force', roam: true, draggable: true,
                    animation: true, animationDuration: 800, animationDurationUpdate: 300, animationEasingUpdate: 'cubicInOut',
                    progressive: 0, hoverAnimation: false,
                    data: processedNodes, links: processedLinks,
                    force: { initLayout: 'circular', repulsion: 350, edgeLength: [80, 160], gravity: .12, friction: .6, layoutAnimation: true },
                    label: { show: true }, edgeLabel: { show: true, position: 'middle' },
                    emphasis: { disabled: true }
                }]
            });
        };

        updateChart(allNodes, allLinks);
        setTimeout(() => relationChart.resize(), 0);

        relationChart.off('click');
        relationChart.on('click', p => {
            if (p.dataType === 'node') {
                hideRelationTooltip();
                const id = p.data.id;
                selectCharacter(id);
                updateChart(allNodes, allLinks, id);
            } else if (p.dataType === 'edge') {
                const d = p.data;
                const e = p.event?.event;
                if (e) {
                    const rect = dom.getBoundingClientRect();
                    showRelationTooltip(d.fromName, d.toName, d.fromLabel, d.toLabel, d.fromTrend, d.toTrend,
                        e.offsetX || (e.clientX - rect.left), e.offsetY || (e.clientY - rect.top), dom);
                }
            }
        });

        relationChart.getZr().on('click', p => {
            if (!p.target) {
                hideRelationTooltip();
                updateChart(allNodes, allLinks);
            }
        });
    }

    function selectCharacter(id) {
        currentCharacterId = id;
        const txt = $('sel-char-text');
        const opts = $('char-sel-opts');
        if (opts && id) {
            opts.querySelectorAll('.sel-opt').forEach(o => {
                if (o.dataset.value === id) {
                    o.classList.add('sel');
                    if (txt) txt.textContent = o.textContent;
                } else {
                    o.classList.remove('sel');
                }
            });
        } else if (!id && txt) {
            txt.textContent = '选择角色';
        }
        renderCharacterProfile();
        if (relationChart && id) {
            const opt = relationChart.getOption();
            const idx = opt?.series?.[0]?.data?.findIndex(n => n.id === id || n.name === id);
            if (idx >= 0) relationChart.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: idx });
        }
    }

    function updateCharacterSelector(arcs) {
        const opts = $('char-sel-opts');
        const txt = $('sel-char-text');
        if (!opts) return;
        if (!arcs?.length) {
            setHtml(opts, '<div class="sel-opt" data-value="">暂无角色</div>');
            if (txt) txt.textContent = '暂无角色';
            currentCharacterId = null;
            return;
        }
        setHtml(opts, arcs.map(a => `<div class="sel-opt" data-value="${h(a.id || a.name)}">${h(a.name || '角色')}</div>`).join(''));
        opts.querySelectorAll('.sel-opt').forEach(o => {
            o.onclick = e => {
                e.stopPropagation();
                if (o.dataset.value) {
                    selectCharacter(o.dataset.value);
                    $('char-sel').classList.remove('open');
                }
            };
        });
        if (currentCharacterId && arcs.some(a => (a.id || a.name) === currentCharacterId)) {
            selectCharacter(currentCharacterId);
        } else if (arcs.length) {
            selectCharacter(arcs[0].id || arcs[0].name);
        }
    }

    function renderCharacterProfile() {
        const c = $('profile-content');
        const arcs = summaryData.arcs || [];
        const rels = summaryData.characters?.relationships || [];

        if (!currentCharacterId || !arcs.length) {
            setHtml(c, '<div class="empty">暂无角色数据</div>');
            return;
        }

        const arc = arcs.find(a => (a.id || a.name) === currentCharacterId);
        if (!arc) {
            setHtml(c, '<div class="empty">未找到角色数据</div>');
            return;
        }

        const name = arc.name || '角色';
        const moments = (arc.moments || arc.beats || []).map(m => typeof m === 'string' ? m : m.text);
        const outRels = rels.filter(r => r.from === name);
        const inRels = rels.filter(r => r.to === name);

        setHtml(c, `
            <div class="prof-arc">
                <div>
                    <div class="prof-name">${h(name)}</div>
                    <div class="prof-traj">${h(arc.trajectory || arc.phase || '')}</div>
                </div>
                <div class="prof-prog-wrap">
                    <div class="prof-prog-lbl">
                        <span>弧光进度</span>
                        <span>${Math.round((arc.progress || 0) * 100)}%</span>
                    </div>
                    <div class="prof-prog">
                        <div class="prof-prog-inner" style="width:${(arc.progress || 0) * 100}%"></div>
                    </div>
                </div>
                ${moments.length ? `
                    <div class="prof-moments">
                        <div class="prof-moments-title">关键时刻</div>
                        ${moments.map(m => `<div class="prof-moment">${h(m)}</div>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="prof-rels">
                <div class="rels-group">
                    <div class="rels-group-title">${h(name)}对别人的羁绊：</div>
                    ${outRels.length ? outRels.map(r => `
                        <div class="rel-item">
                            <span class="rel-target">对${h(r.to)}：</span>
                            <span class="rel-label">${h(r.label || '—')}</span>
                            ${r.trend ? `<span class="rel-trend ${TREND_CLASS[r.trend] || ''}">${h(r.trend)}</span>` : ''}
                        </div>
                    `).join('') : '<div class="empty" style="padding:16px">暂无关系记录</div>'}
                </div>
                <div class="rels-group">
                    <div class="rels-group-title">别人对${h(name)}的羁绊：</div>
                    ${inRels.length ? inRels.map(r => `
                        <div class="rel-item">
                            <span class="rel-target">${h(r.from)}：</span>
                            <span class="rel-label">${h(r.label || '—')}</span>
                            ${r.trend ? `<span class="rel-trend ${TREND_CLASS[r.trend] || ''}">${h(r.trend)}</span>` : ''}
                        </div>
                    `).join('') : '<div class="empty" style="padding:16px">暂无关系记录</div>'}
                </div>
            </div>
        `);
    }

    function renderArcs(arcs) {
        summaryData.arcs = arcs || [];
        updateCharacterSelector(arcs || []);
        renderCharacterProfile();
    }

    function updateStats(s) {
        if (!s) return;
        $('stat-summarized').textContent = s.summarizedUpTo ?? 0;
        $('stat-events').textContent = s.eventsCount ?? 0;
        const p = s.pendingFloors ?? 0;
        $('stat-pending').textContent = p;
        $('pending-warning').classList.toggle('hidden', p !== -1);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Modals
    // ═══════════════════════════════════════════════════════════════════════════

    function openRelationsFullscreen() {
        $('rel-fs-modal').classList.add('active');
        const dom = $('relation-chart-fullscreen');
        if (!relationChartFullscreen) relationChartFullscreen = echarts.init(dom);

        if (!allNodes.length) {
            relationChartFullscreen.clear();
            return;
        }

        relationChartFullscreen.setOption({
            tooltip: { show: false },
            hoverLayerThreshold: Infinity,
            series: [{
                type: 'graph', layout: 'force', roam: true, draggable: true,
                animation: true, animationDuration: 800, animationDurationUpdate: 300, animationEasingUpdate: 'cubicInOut',
                progressive: 0, hoverAnimation: false,
                data: allNodes.map(n => ({
                    ...n,
                    symbolSize: Array.isArray(n.symbolSize) ? [n.symbolSize[0] * 1.3, n.symbolSize[1] * 1.3] : n.symbolSize * 1.3,
                    label: { ...n.label, fontSize: 14 }
                })),
                links: allLinks.map(l => ({ ...l, label: { ...l.label, fontSize: 18 } })),
                force: { repulsion: 700, edgeLength: [150, 280], gravity: .06, friction: .6, layoutAnimation: true },
                label: { show: true }, edgeLabel: { show: true, position: 'middle' },
                emphasis: { disabled: true }
            }]
        });

        setTimeout(() => relationChartFullscreen.resize(), 100);
        postMsg('FULLSCREEN_OPENED');
    }

    function closeRelationsFullscreen() {
        $('rel-fs-modal').classList.remove('active');
        postMsg('FULLSCREEN_CLOSED');
    }

    function openHfGuide() {
        $('hf-guide-modal').classList.add('active');
        renderHfGuideContent();
        postMsg('FULLSCREEN_OPENED');
    }

    function closeHfGuide() {
        $('hf-guide-modal').classList.remove('active');
        postMsg('FULLSCREEN_CLOSED');
    }

    function renderHfGuideContent() {
        const body = $('hf-guide-body');
        if (!body || body.innerHTML.trim()) return;

        setHtml(body, `
            <div class="hf-guide">
                <div class="hf-section hf-intro">
                    <div class="hf-intro-text"><strong>免费自建 Embedding 服务</strong>，10 分钟搞定</div>
                    <div class="hf-intro-badges">
                        <span class="hf-badge">🆓 完全免费</span>
                        <span class="hf-badge">⚡ 速度不快</span>
                        <span class="hf-badge">🔐 数据私有</span>
                    </div>
                </div>
                <div class="hf-section">
                    <div class="hf-step-header"><span class="hf-step-num">1</span><span class="hf-step-title">创建 Space</span></div>
                    <div class="hf-step-content">
                        <p>访问 <a href="https://huggingface.co/new-space" target="_blank">huggingface.co/new-space</a>，登录后创建：</p>
                        <ul class="hf-checklist">
                            <li>Space name: 随便取（如 <code>my-embedding</code>）</li>
                            <li>SDK: 选 <strong>Docker</strong></li>
                            <li>Hardware: 选 <strong>CPU basic (Free)</strong></li>
                        </ul>
                    </div>
                </div>
                <div class="hf-section">
                    <div class="hf-step-header"><span class="hf-step-num">2</span><span class="hf-step-title">上传 3 个文件</span></div>
                    <div class="hf-step-content">
                        <p>在 Space 的 Files 页面，依次创建以下文件：</p>
                        <div class="hf-file">
                            <div class="hf-file-header"><span class="hf-file-icon">📄</span><span class="hf-file-name">requirements.txt</span></div>
                            <pre class="hf-code"><code>fastapi
uvicorn
sentence-transformers
torch</code><button class="copy-btn">复制</button></pre>
                        </div>
                        <div class="hf-file">
                            <div class="hf-file-header"><span class="hf-file-icon">🐍</span><span class="hf-file-name">app.py</span><span class="hf-file-note">主程序</span></div>
                            <pre class="hf-code"><code>import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import torch
torch.set_num_threads(1)

import threading
from functools import lru_cache
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

ACCESS_KEY = os.environ.get("ACCESS_KEY", "")
MODEL_ID = "BAAI/bge-m3"

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@lru_cache(maxsize=1)
def get_model():
    return SentenceTransformer(MODEL_ID, trust_remote_code=True)

class EmbedRequest(BaseModel):
    input: List[str]
    model: Optional[str] = "bge-m3"

@app.post("/v1/embeddings")
async def embed(req: EmbedRequest, authorization: Optional[str] = Header(None)):
    if ACCESS_KEY and (authorization or "").replace("Bearer ", "").strip() != ACCESS_KEY:
        raise HTTPException(401, "Unauthorized")
    embeddings = get_model().encode(req.input, normalize_embeddings=True)
    return {"data": [{"embedding": e.tolist(), "index": i} for i, e in enumerate(embeddings)]}

@app.get("/v1/models")
async def models():
    return {"data": [{"id": "bge-m3"}]}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.on_event("startup")
async def startup():
    threading.Thread(target=get_model, daemon=True).start()</code><button class="copy-btn">复制</button></pre>
                        </div>
                        <div class="hf-file">
                            <div class="hf-file-header"><span class="hf-file-icon">🐳</span><span class="hf-file-name">Dockerfile</span></div>
                            <pre class="hf-code"><code>FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py ./
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-m3', trust_remote_code=True)"
EXPOSE 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "2"]</code><button class="copy-btn">复制</button></pre>
                        </div>
                    </div>
                </div>
                <div class="hf-section">
                    <div class="hf-step-header"><span class="hf-step-num">3</span><span class="hf-step-title">等待构建</span></div>
                    <div class="hf-step-content">
                        <p>上传完成后自动开始构建，约需 <strong>10 分钟</strong>（下载模型）。</p>
                        <p>成功后状态变为 <span class="hf-status-badge">Running</span></p>
                    </div>
                </div>
                <div class="hf-section">
                    <div class="hf-step-header"><span class="hf-step-num">4</span><span class="hf-step-title">在插件中配置</span></div>
                    <div class="hf-step-content">
                        <div class="hf-config-table">
                            <div class="hf-config-row"><span class="hf-config-label">服务渠道</span><span class="hf-config-value">OpenAI 兼容</span></div>
                            <div class="hf-config-row"><span class="hf-config-label">API URL</span><span class="hf-config-value"><code>https://用户名-空间名.hf.space</code></span></div>
                            <div class="hf-config-row"><span class="hf-config-label">API Key</span><span class="hf-config-value">随便填</span></div>
                            <div class="hf-config-row"><span class="hf-config-label">模型</span><span class="hf-config-value">点"拉取" → 选 <code>bge-m3</code></span></div>
                        </div>
                    </div>
                </div>
                <div class="hf-section hf-faq">
                    <div class="hf-faq-title">💡 小提示</div>
                    <ul>
                        <li>URL 格式：<code>https://用户名-空间名.hf.space</code>（减号连接，非斜杠）</li>
                        <li>免费 Space 一段时间无请求会休眠，首次唤醒需等 20-30 秒</li>
                        <li>如需保持常驻，可用 <a href="https://cron-job.org" target="_blank">cron-job.org</a> 每 5 分钟 ping <code>/health</code></li>
                        <li>如需密码，在 Space Settings 设置 <code>ACCESS_KEY</code> 环境变量</li>
                    </ul>
                </div>
            </div>
        `);

        // Add copy button handlers
        body.querySelectorAll('.copy-btn').forEach(btn => {
            btn.onclick = async () => {
                const code = btn.previousElementSibling?.textContent || '';
                try {
                    await navigator.clipboard.writeText(code);
                    btn.textContent = '已复制';
                    setTimeout(() => btn.textContent = '复制', 1200);
                } catch {
                    const ta = document.createElement('textarea');
                    ta.value = code;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    ta.remove();
                    btn.textContent = '已复制';
                    setTimeout(() => btn.textContent = '复制', 1200);
                }
            };
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Recall Log
    // ═══════════════════════════════════════════════════════════════════════════

    function setRecallLog(text) {
        lastRecallLogText = text || '';
        updateRecallLogDisplay();
    }

    function updateRecallLogDisplay() {
        const content = $('recall-log-content');
        if (!content) return;
        if (lastRecallLogText) {
            content.textContent = lastRecallLogText;
            content.classList.remove('recall-empty');
        } else {
            setHtml(content, '<div class="recall-empty">暂无召回日志<br><br>当 AI 生成回复时，系统会自动进行记忆召回。<br>召回日志将显示：<br>• 查询文本<br>• L1 片段匹配结果<br>• L2 事件召回详情<br>• 耗时统计</div>');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Editor
    // ═══════════════════════════════════════════════════════════════════════════

    function preserveAddedAt(n, o) {
        if (o?._addedAt != null) n._addedAt = o._addedAt;
        return n;
    }

    function createDelBtn() {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn btn-sm btn-del';
        b.textContent = '删除';
        return b;
    }

    function addDeleteHandler(item) {
        const del = createDelBtn();
        (item.querySelector('.struct-actions') || item).appendChild(del);
        del.onclick = () => item.remove();
    }

    function renderEventsEditor(events) {
        const list = events?.length ? events : [{ id: 'evt-1', title: '', timeLabel: '', summary: '', participants: [], type: '日常', weight: '点睛' }];
        let maxId = 0;
        list.forEach(e => {
            const m = e.id?.match(/evt-(\d+)/);
            if (m) maxId = Math.max(maxId, +m[1]);
        });

        const es = $('editor-struct');
        setHtml(es, list.map(ev => {
            const id = ev.id || `evt-${++maxId}`;
            return `<div class="struct-item event-item" data-id="${h(id)}">
                <div class="struct-row">
                    <input type="text" class="event-title" placeholder="事件标题" value="${h(ev.title || '')}">
                    <input type="text" class="event-time" placeholder="时间标签" value="${h(ev.timeLabel || '')}">
                </div>
                <div class="struct-row">
                    <textarea class="event-summary" rows="2" placeholder="一句话描述">${h(ev.summary || '')}</textarea>
                </div>
                <div class="struct-row">
                    <input type="text" class="event-participants" placeholder="人物（顿号分隔）" value="${h((ev.participants || []).join('、'))}">
                </div>
                <div class="struct-row">
                    <select class="event-type">${['相遇', '冲突', '揭示', '抉择', '羁绊', '转变', '收束', '日常'].map(t => `<option ${ev.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
                    <select class="event-weight">${['核心', '主线', '转折', '点睛', '氛围'].map(t => `<option ${ev.weight === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
                </div>
                <div class="struct-actions"><span>ID：${h(id)}</span></div>
            </div>`;
        }).join('') + '<div style="margin-top:8px"><button type="button" class="btn btn-sm" id="event-add">＋ 新增事件</button></div>');

        es.querySelectorAll('.event-item').forEach(addDeleteHandler);

        $('event-add').onclick = () => {
            let nmax = maxId;
            es.querySelectorAll('.event-item').forEach(it => {
                const m = it.dataset.id?.match(/evt-(\d+)/);
                if (m) nmax = Math.max(nmax, +m[1]);
            });
            const nid = `evt-${nmax + 1}`;
            const div = document.createElement('div');
            div.className = 'struct-item event-item';
            div.dataset.id = nid;
            setHtml(div, `
                <div class="struct-row"><input type="text" class="event-title" placeholder="事件标题"><input type="text" class="event-time" placeholder="时间标签"></div>
                <div class="struct-row"><textarea class="event-summary" rows="2" placeholder="一句话描述"></textarea></div>
                <div class="struct-row"><input type="text" class="event-participants" placeholder="人物（顿号分隔）"></div>
                <div class="struct-row">
                    <select class="event-type">${['相遇', '冲突', '揭示', '抉择', '羁绊', '转变', '收束', '日常'].map(t => `<option>${t}</option>`).join('')}</select>
                    <select class="event-weight">${['核心', '主线', '转折', '点睛', '氛围'].map(t => `<option>${t}</option>`).join('')}</select>
                </div>
                <div class="struct-actions"><span>ID：${h(nid)}</span></div>
            `);
            addDeleteHandler(div);
            es.insertBefore(div, $('event-add').parentElement);
        };
    }

    function renderCharactersEditor(data) {
        const d = data || { main: [], relationships: [] };
        const main = (d.main || []).map(getCharName);
        const rels = d.relationships || [];
        const trendOpts = ['破裂', '厌恶', '反感', '陌生', '投缘', '亲密', '交融'];

        const es = $('editor-struct');
        setHtml(es, `
            <div class="struct-item">
                <div class="struct-row"><strong>角色列表</strong></div>
                <div id="char-main-list">
                    ${(main.length ? main : ['']).map(n => `<div class="struct-row char-main-item"><input type="text" class="char-main-name" placeholder="角色名" value="${h(n || '')}"></div>`).join('')}
                </div>
                <div style="margin-top:8px"><button type="button" class="btn btn-sm" id="char-main-add">＋ 新增角色</button></div>
            </div>
            <div class="struct-item">
                <div class="struct-row"><strong>人物关系</strong></div>
                <div id="char-rel-list">
                    ${(rels.length ? rels : [{ from: '', to: '', label: '', trend: '陌生' }]).map(r => `
                        <div class="struct-row char-rel-item">
                            <input type="text" class="char-rel-from" placeholder="角色 A" value="${h(r.from || '')}">
                            <input type="text" class="char-rel-to" placeholder="角色 B" value="${h(r.to || '')}">
                            <input type="text" class="char-rel-label" placeholder="关系" value="${h(r.label || '')}">
                            <select class="char-rel-trend">${trendOpts.map(t => `<option ${r.trend === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top:8px"><button type="button" class="btn btn-sm" id="char-rel-add">＋ 新增关系</button></div>
            </div>
        `);

        es.querySelectorAll('.char-main-item,.char-rel-item').forEach(addDeleteHandler);

        $('char-main-add').onclick = () => {
            const div = document.createElement('div');
            div.className = 'struct-row char-main-item';
            setHtml(div, '<input type="text" class="char-main-name" placeholder="角色名">');
            addDeleteHandler(div);
            $('char-main-list').appendChild(div);
        };

        $('char-rel-add').onclick = () => {
            const div = document.createElement('div');
            div.className = 'struct-row char-rel-item';
            setHtml(div, `
                <input type="text" class="char-rel-from" placeholder="角色 A">
                <input type="text" class="char-rel-to" placeholder="角色 B">
                <input type="text" class="char-rel-label" placeholder="关系">
                <select class="char-rel-trend">${trendOpts.map(t => `<option>${t}</option>`).join('')}</select>
            `);
            addDeleteHandler(div);
            $('char-rel-list').appendChild(div);
        };
    }

    function renderArcsEditor(arcs) {
        const list = arcs?.length ? arcs : [{ name: '', trajectory: '', progress: 0, moments: [] }];
        const es = $('editor-struct');

        setHtml(es, `
            <div id="arc-list">
                ${list.map((a, i) => `
                    <div class="struct-item arc-item" data-index="${i}">
                        <div class="struct-row"><input type="text" class="arc-name" placeholder="角色名" value="${h(a.name || '')}"></div>
                        <div class="struct-row"><textarea class="arc-trajectory" rows="2" placeholder="当前状态描述">${h(a.trajectory || '')}</textarea></div>
                        <div class="struct-row">
                            <label style="font-size:.75rem;color:var(--txt3)">进度：<input type="number" class="arc-progress" min="0" max="100" value="${Math.round((a.progress || 0) * 100)}" style="width:64px;display:inline-block"> %</label>
                        </div>
                        <div class="struct-row"><textarea class="arc-moments" rows="3" placeholder="关键时刻，一行一个">${h((a.moments || []).map(m => typeof m === 'string' ? m : m.text).join('\n'))}</textarea></div>
                        <div class="struct-actions"><span>角色弧光 ${i + 1}</span></div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top:8px"><button type="button" class="btn btn-sm" id="arc-add">＋ 新增角色弧光</button></div>
        `);

        es.querySelectorAll('.arc-item').forEach(addDeleteHandler);

        $('arc-add').onclick = () => {
            const listEl = $('arc-list');
            const idx = listEl.querySelectorAll('.arc-item').length;
            const div = document.createElement('div');
            div.className = 'struct-item arc-item';
            div.dataset.index = idx;
            setHtml(div, `
                <div class="struct-row"><input type="text" class="arc-name" placeholder="角色名"></div>
                <div class="struct-row"><textarea class="arc-trajectory" rows="2" placeholder="当前状态描述"></textarea></div>
                <div class="struct-row">
                    <label style="font-size:.75rem;color:var(--txt3)">进度：<input type="number" class="arc-progress" min="0" max="100" value="0" style="width:64px;display:inline-block"> %</label>
                </div>
                <div class="struct-row"><textarea class="arc-moments" rows="3" placeholder="关键时刻，一行一个"></textarea></div>
                <div class="struct-actions"><span>角色弧光 ${idx + 1}</span></div>
            `);
            addDeleteHandler(div);
            listEl.appendChild(div);
        };
    }

    function openEditor(section) {
        currentEditSection = section;
        const meta = SECTION_META[section];
        const es = $('editor-struct');
        const ta = $('editor-ta');

        $('editor-title').textContent = meta.title;
        $('editor-hint').textContent = meta.hint;
        $('editor-err').classList.remove('visible');
        $('editor-err').textContent = '';
        es.classList.add('hidden');
        ta.classList.remove('hidden');

        if (section === 'keywords') {
            ta.value = summaryData.keywords.map(k => `${k.text}|${k.weight || '一般'}`).join('\n');
        } else if (section === 'world') {
            ta.value = (summaryData.world || [])
                .map(w => `${w.category || ''}|${w.topic || ''}|${w.content || ''}`)
                .join('\n');
        } else {
            ta.classList.add('hidden');
            es.classList.remove('hidden');
            if (section === 'events') renderEventsEditor(summaryData.events || []);
            else if (section === 'characters') renderCharactersEditor(summaryData.characters || { main: [], relationships: [] });
            else if (section === 'arcs') renderArcsEditor(summaryData.arcs || []);
        }

        $('editor-modal').classList.add('active');
        postMsg('EDITOR_OPENED');
    }

    function closeEditor() {
        $('editor-modal').classList.remove('active');
        currentEditSection = null;
        postMsg('EDITOR_CLOSED');
    }

    function saveEditor() {
        const section = currentEditSection;
        const es = $('editor-struct');
        const ta = $('editor-ta');
        let parsed;

        try {
            if (section === 'keywords') {
                const oldMap = new Map((summaryData.keywords || []).map(k => [k.text, k]));
                parsed = ta.value.trim().split('\n').filter(l => l.trim()).map(line => {
                    const [text, weight] = line.split('|').map(s => s.trim());
                    return preserveAddedAt({ text: text || '', weight: weight || '一般' }, oldMap.get(text));
                });
            } else if (section === 'events') {
                const oldMap = new Map((summaryData.events || []).map(e => [e.id, e]));
                parsed = Array.from(es.querySelectorAll('.event-item')).map(it => {
                    const id = it.dataset.id;
                    return preserveAddedAt({
                        id,
                        title: it.querySelector('.event-title').value.trim(),
                        timeLabel: it.querySelector('.event-time').value.trim(),
                        summary: it.querySelector('.event-summary').value.trim(),
                        participants: it.querySelector('.event-participants').value.trim().split(/[,、，]/).map(s => s.trim()).filter(Boolean),
                        type: it.querySelector('.event-type').value,
                        weight: it.querySelector('.event-weight').value
                    }, oldMap.get(id));
                }).filter(e => e.title || e.summary);
            } else if (section === 'characters') {
                const oldMainMap = new Map((summaryData.characters?.main || []).map(m => [getCharName(m), m]));
                const mainNames = Array.from(es.querySelectorAll('.char-main-name')).map(i => i.value.trim()).filter(Boolean);
                const main = mainNames.map(n => preserveAddedAt({ name: n }, oldMainMap.get(n)));

                const oldRelMap = new Map((summaryData.characters?.relationships || []).map(r => [`${r.from}->${r.to}`, r]));
                const rels = Array.from(es.querySelectorAll('.char-rel-item')).map(it => {
                    const from = it.querySelector('.char-rel-from').value.trim();
                    const to = it.querySelector('.char-rel-to').value.trim();
                    return preserveAddedAt({
                        from, to,
                        label: it.querySelector('.char-rel-label').value.trim(),
                        trend: it.querySelector('.char-rel-trend').value
                    }, oldRelMap.get(`${from}->${to}`));
                }).filter(r => r.from && r.to);

                parsed = { main, relationships: rels };
            } else if (section === 'arcs') {
                const oldArcMap = new Map((summaryData.arcs || []).map(a => [a.name, a]));
                parsed = Array.from(es.querySelectorAll('.arc-item')).map(it => {
                    const name = it.querySelector('.arc-name').value.trim();
                    const oldArc = oldArcMap.get(name);
                    const oldMomentMap = new Map((oldArc?.moments || []).map(m => [typeof m === 'string' ? m : m.text, m]));
                    const momentsRaw = it.querySelector('.arc-moments').value.trim();
                    const moments = momentsRaw ? momentsRaw.split('\n').map(s => s.trim()).filter(Boolean).map(t => preserveAddedAt({ text: t }, oldMomentMap.get(t))) : [];
                    return preserveAddedAt({
                        name,
                        trajectory: it.querySelector('.arc-trajectory').value.trim(),
                        progress: Math.max(0, Math.min(1, (parseFloat(it.querySelector('.arc-progress').value) || 0) / 100)),
                        moments
                    }, oldArc);
                }).filter(a => a.name || a.trajectory || a.moments?.length);
            } else if (section === 'world') {
                const oldWorldMap = new Map((summaryData.world || []).map(w => [`${w.category}|${w.topic}`, w]));
                parsed = ta.value
                    .split('\n')
                    .map(l => l.trim())
                    .filter(Boolean)
                    .map(line => {
                        const parts = line.split('|').map(s => s.trim());
                        const category = parts[0];
                        const topic = parts[1];
                        const content = parts.slice(2).join('|').trim();
                        if (!category || !topic) return null;
                        if (!content || content.toLowerCase() === 'cleared') return null;
                        const key = `${category}|${topic}`;
                        return preserveAddedAt({ category, topic, content }, oldWorldMap.get(key));
                    })
                    .filter(Boolean);
            }
        } catch (e) {
            $('editor-err').textContent = `格式错误: ${e.message}`;
            $('editor-err').classList.add('visible');
            return;
        }

        postMsg('UPDATE_SECTION', { section, data: parsed });

        if (section === 'keywords') renderKeywords(parsed);
        else if (section === 'events') { renderTimeline(parsed); $('stat-events').textContent = parsed.length; }
        else if (section === 'characters') renderRelations(parsed);
        else if (section === 'arcs') renderArcs(parsed);
        else if (section === 'world') renderWorldState(parsed);

        closeEditor();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Message Handler
    // ═══════════════════════════════════════════════════════════════════════════

    function handleParentMessage(e) {
        if (e.origin !== PARENT_ORIGIN || e.source !== window.parent) return;

        const d = e.data;
        if (!d || d.source !== 'LittleWhiteBox') return;

        const btn = $('btn-generate');

        switch (d.type) {
            case 'GENERATION_STATE':
                localGenerating = !!d.isGenerating;
                btn.textContent = localGenerating ? '停止' : '总结';
                break;

            case 'SUMMARY_BASE_DATA':
                if (d.stats) {
                    updateStats(d.stats);
                    $('summarized-count').textContent = d.stats.hiddenCount ?? 0;
                }
                if (d.hideSummarized !== undefined) $('hide-summarized').checked = d.hideSummarized;
                if (d.keepVisibleCount !== undefined) $('keep-visible-count').value = d.keepVisibleCount;
                break;

            case 'SUMMARY_FULL_DATA':
                if (d.payload) {
                    const p = d.payload;
                    if (p.keywords) renderKeywords(p.keywords);
                    if (p.events) renderTimeline(p.events);
                    if (p.characters) renderRelations(p.characters);
                    if (p.arcs) renderArcs(p.arcs);
                    if (p.world) renderWorldState(p.world);
                    $('stat-events').textContent = p.events?.length || 0;
                    if (p.lastSummarizedMesId != null) $('stat-summarized').textContent = p.lastSummarizedMesId + 1;
                    if (p.stats) updateStats(p.stats);
                }
                break;

            case 'SUMMARY_ERROR':
                console.error('Summary error:', d.message);
                break;

            case 'SUMMARY_CLEARED': {
                const t = d.payload?.totalFloors || 0;
                $('stat-events').textContent = 0;
                $('stat-summarized').textContent = 0;
                $('stat-pending').textContent = t;
                $('summarized-count').textContent = 0;
                summaryData = { keywords: [], events: [], characters: { main: [], relationships: [] }, arcs: [], world: [] };
                renderKeywords([]);
                renderTimeline([]);
                renderRelations(null);
                renderArcs([]);
                renderWorldState([]);
                break;
            }

            case 'LOAD_PANEL_CONFIG':
                if (d.config) applyConfig(d.config);
                break;

            case 'VECTOR_CONFIG':
                if (d.config) loadVectorConfig(d.config);
                break;

            case 'VECTOR_LOCAL_MODEL_STATUS':
                updateLocalModelStatus(d.status, d.message);
                break;

            case 'VECTOR_LOCAL_MODEL_PROGRESS':
                updateLocalModelProgress(d.percent);
                break;

            case 'VECTOR_ONLINE_STATUS':
                updateOnlineStatus(d.status, d.message);
                break;

            case 'VECTOR_ONLINE_MODELS':
                updateOnlineModels(d.models || []);
                break;

            case 'VECTOR_STATS':
                updateVectorStats(d.stats);
                if (d.mismatch !== undefined) showVectorMismatchWarning(d.mismatch);
                break;

            case 'VECTOR_GEN_PROGRESS':
                updateVectorGenProgress(d.phase, d.current, d.total);
                break;

            case 'VECTOR_EXPORT_RESULT':
                $('btn-export-vectors').disabled = false;
                if (d.success) {
                    $('vector-io-status').textContent = `导出成功: ${d.filename} (${(d.size / 1024 / 1024).toFixed(2)}MB)`;
                } else {
                    $('vector-io-status').textContent = '导出失败: ' + (d.error || '未知错误');
                }
                break;

            case 'VECTOR_IMPORT_RESULT':
                $('btn-import-vectors').disabled = false;
                if (d.success) {
                    let msg = `导入成功: ${d.chunkCount} 片段, ${d.eventCount} 事件`;
                    if (d.warnings?.length) {
                        msg += '\n⚠️ ' + d.warnings.join('\n⚠️ ');
                    }
                    $('vector-io-status').textContent = msg;
                    // 刷新统计
                    postMsg('REQUEST_VECTOR_STATS');
                } else {
                    $('vector-io-status').textContent = '导入失败: ' + (d.error || '未知错误');
                }
                break;

            case 'RECALL_LOG':
                setRecallLog(d.text || '');
                break;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Event Bindings
    // ═══════════════════════════════════════════════════════════════════════════

    function bindEvents() {
        // Section edit buttons
        $$('.sec-btn[data-section]').forEach(b => b.onclick = () => openEditor(b.dataset.section));

        // Editor modal
        $('editor-backdrop').onclick = closeEditor;
        $('editor-close').onclick = closeEditor;
        $('editor-cancel').onclick = closeEditor;
        $('editor-save').onclick = saveEditor;

        // Settings modal
        $('btn-settings').onclick = openSettings;
        $('settings-backdrop').onclick = () => closeSettings(false);
        $('settings-close').onclick = () => closeSettings(false);
        $('settings-cancel').onclick = () => closeSettings(false);
        $('settings-save').onclick = () => closeSettings(true);

        // Settings tabs
        $$('.settings-tab').forEach(tab => {
            tab.onclick = () => {
                const targetId = tab.dataset.tab;
                if (!targetId) return;

                // Update tab active state
                $$('.settings-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update pane active state
                $$('.tab-pane').forEach(p => p.classList.remove('active'));
                $(targetId).classList.add('active');

                // If switching to debug tab, refresh log
                if (targetId === 'tab-debug') {
                    postMsg('REQUEST_RECALL_LOG');
                }
            };
        });

        // API provider change
        $('api-provider').onchange = e => {
            const pv = PROVIDER_DEFAULTS[e.target.value];
            $('api-url').value = '';
            if (!pv.canFetch) config.api.modelCache = [];
            updateProviderUI(e.target.value);
        };

        $('btn-connect').onclick = fetchModels;
        $('api-model-select').onchange = e => { config.api.model = e.target.value; };

        // Trigger timing
        $('trigger-timing').onchange = e => {
            const en = $('trigger-enabled');
            if (e.target.value === 'manual') {
                en.checked = false;
                en.disabled = true;
                en.parentElement.style.opacity = '.5';
            } else {
                en.disabled = false;
                en.parentElement.style.opacity = '1';
            }
        };

        // 总结间隔范围校验
        $('trigger-interval').onchange = e => {
            let val = parseInt(e.target.value) || 20;
            val = Math.max(1, Math.min(30, val));
            e.target.value = val;
        };

        // Main actions
        $('btn-clear').onclick = () => postMsg('REQUEST_CLEAR');
        $('btn-generate').onclick = () => {
            const btn = $('btn-generate');
            if (!localGenerating) {
                localGenerating = true;
                btn.textContent = '停止';
                postMsg('REQUEST_GENERATE', { config: { api: config.api, gen: config.gen, trigger: config.trigger } });
            } else {
                localGenerating = false;
                btn.textContent = '总结';
                postMsg('REQUEST_CANCEL');
            }
        };

        // Hide summarized
        $('hide-summarized').onchange = e => postMsg('TOGGLE_HIDE_SUMMARIZED', { enabled: e.target.checked });
        $('keep-visible-count').onchange = e => {
            const c = Math.max(0, Math.min(50, parseInt(e.target.value) || 3));
            e.target.value = c;
            postMsg('UPDATE_KEEP_VISIBLE', { count: c });
        };

        // Fullscreen relations
        $('btn-fullscreen-relations').onclick = openRelationsFullscreen;
        $('rel-fs-backdrop').onclick = closeRelationsFullscreen;
        $('rel-fs-close').onclick = closeRelationsFullscreen;

        // HF guide
        $('hf-guide-backdrop').onclick = closeHfGuide;
        $('hf-guide-close').onclick = closeHfGuide;

        // Character selector
        $('char-sel-trigger').onclick = e => {
            e.stopPropagation();
            $('char-sel').classList.toggle('open');
        };

        document.onclick = e => {
            const cs = $('char-sel');
            if (cs && !cs.contains(e.target)) cs.classList.remove('open');
        };

        // Vector UI
        initVectorUI();

        // Gen params collapsible
        const genParamsToggle = $('gen-params-toggle');
        const genParamsContent = $('gen-params-content');
        if (genParamsToggle && genParamsContent) {
            genParamsToggle.onclick = () => {
                const collapse = genParamsToggle.closest('.settings-collapse');
                collapse.classList.toggle('open');
                genParamsContent.classList.toggle('hidden');
            };
        }

        // Auto summary sub-options toggle
        const triggerEnabled = $('trigger-enabled');
        const autoSummaryOptions = $('auto-summary-options');
        if (triggerEnabled && autoSummaryOptions) {
            triggerEnabled.onchange = () => {
                autoSummaryOptions.classList.toggle('hidden', !triggerEnabled.checked);
            };
        }

        // Force insert sub-options toggle
        const triggerInsertAtEnd = $('trigger-insert-at-end');
        const insertWrapperOptions = $('insert-wrapper-options');
        if (triggerInsertAtEnd && insertWrapperOptions) {
            triggerInsertAtEnd.onchange = () => {
                insertWrapperOptions.classList.toggle('hidden', !triggerInsertAtEnd.checked);
            };
        }


        // Resize
        window.onresize = () => {
            relationChart?.resize();
            relationChartFullscreen?.resize();
        };

        // Parent messages
        window.onmessage = handleParentMessage;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Init
    // ═══════════════════════════════════════════════════════════════════════════

    function init() {
        loadConfig();

        // Initial state
        $('stat-events').textContent = '—';
        $('stat-summarized').textContent = '—';
        $('stat-pending').textContent = '—';
        $('summarized-count').textContent = '0';

        renderKeywords([]);
        renderTimeline([]);
        renderArcs([]);
        renderWorldState([]);

        bindEvents();

        // Notify parent
        postMsg('FRAME_READY');
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }


    function renderWorldState(world) {
        summaryData.world = world || [];

        const container = $('world-state-list');
        if (!container) return;

        if (!world?.length) {
            setHtml(container, '<div class="empty">暂无世界状态</div>');
            return;
        }

        const labels = {
            status: '状态',
            inventory: '物品',
            knowledge: '认知',
            relation: '关系',
            rule: '规则'
        };

        const categoryOrder = ['status', 'inventory', 'relation', 'knowledge', 'rule'];

        const grouped = {};
        world.forEach(w => {
            const cat = w.category || 'other';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(w);
        });

        const html = categoryOrder
            .filter(cat => grouped[cat]?.length)
            .map(cat => {
                const items = grouped[cat].sort((a, b) => (b.floor || 0) - (a.floor || 0));
                return `
                    <div class="world-group">
                        <div class="world-group-title">${labels[cat] || cat}</div>
                        ${items.map(w => `
                            <div class="world-item">
                                <span class="world-topic">${h(w.topic)}</span>
                                <span class="world-content">${h(w.content)}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }).join('');

        setHtml(container, html || '<div class="empty">暂无世界状态</div>');
    }
})();
