import { extension_settings, getContext, saveMetadataDebounced } from "../../../../extensions.js";
import {
    eventSource,
    event_types,
    chat_metadata,
    extension_prompts,
    extension_prompt_types,
    extension_prompt_roles,
} from "../../../../../script.js";

const EXT_ID = "LittleWhiteBox";
const SUMMARY_SESSION_ID = 'xb9';
const SUMMARY_PROMPT_KEY = 'LittleWhiteBox_StorySummary';
const extensionFolderPath = `scripts/extensions/third-party/${EXT_ID}`;
const iframePath = `${extensionFolderPath}/story-summary/story-summary.html`;

let summaryGenerating = false;
let overlayCreated = false;
let frameReady = false;
let currentMesId = null;
let pendingFrameMessages = [];

// ================== 工具函数 ==================

const sleep = ms => new Promise(r => setTimeout(r, ms));

function getStreamingGeneration() {
    const mod = window.xiaobaixStreamingGeneration;
    return mod?.xbgenrawCommand ? mod : null;
}

function getSettings() {
    const ext = extension_settings[EXT_ID] ||= {};
    ext.storySummary ||= { enabled: true };
    return ext;
}

function getSummaryStore(chatId = getContext().chatId) {
    if (!chatId) return null;
    const meta = chat_metadata[chatId] ||= {};
    meta.extensions ||= {};
    meta.extensions[EXT_ID] ||= {};
    meta.extensions[EXT_ID].storySummary ||= {};
    return meta.extensions[EXT_ID].storySummary;
}

function saveSummaryStore() {
    saveMetadataDebounced?.();
}

function b64UrlEncode(str) {
    const utf8 = new TextEncoder().encode(String(str));
    let bin = '';
    utf8.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function parseSummaryJson(raw) {
    if (!raw) return null;
    let cleaned = String(raw).trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    try { return JSON.parse(cleaned); } catch {}

    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
        try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
    }
    return null;
}

// ================== 状态管理 ==================

function setSummaryGenerating(flag) {
    summaryGenerating = !!flag;
    postToFrame({ type: "GENERATION_STATE", isGenerating: summaryGenerating });
}

function isSummaryGenerating() {
    return summaryGenerating;
}

// ================== iframe 通讯 ==================

function postToFrame(payload) {
    const iframe = document.getElementById("xiaobaix-story-summary-iframe");
    if (!iframe?.contentWindow || !frameReady) {
        pendingFrameMessages.push(payload);
        return;
    }
    iframe.contentWindow.postMessage({ source: "LittleWhiteBox", ...payload }, "*");
}

function flushPendingFrameMessages() {
    if (!frameReady) return;
    const iframe = document.getElementById("xiaobaix-story-summary-iframe");
    if (!iframe?.contentWindow) return;
    pendingFrameMessages.forEach(p =>
        iframe.contentWindow.postMessage({ source: "LittleWhiteBox", ...p }, "*")
    );
    pendingFrameMessages = [];
}

function handleFrameMessage(event) {
    const data = event.data;
    if (!data || data.source !== "LittleWhiteBox-StoryFrame") return;

    switch (data.type) {
        case "FRAME_READY":
            frameReady = true;
            flushPendingFrameMessages();
            setSummaryGenerating(summaryGenerating);
            break;

        case "SETTINGS_OPENED":
            $(".xb-ss-close-btn").hide();
            break;

        case "SETTINGS_CLOSED":
            $(".xb-ss-close-btn").show();
            break;

        case "REQUEST_GENERATE": {
            const ctx = getContext();
            currentMesId = (ctx.chat?.length ?? 1) - 1;
            runSummaryGeneration(currentMesId, data.config || {});
            break;
        }

        case "REQUEST_CANCEL": {
            getStreamingGeneration()?.cancel?.(SUMMARY_SESSION_ID);
            setSummaryGenerating(false);
            postToFrame({ type: "SUMMARY_STATUS", statusText: "已停止" });
            break;
        }

        case "REQUEST_CLEAR": {
            const { chatId, chat } = getContext();
            const store = getSummaryStore(chatId);
            if (store) {
                delete store.json;
                store.lastSummarizedMesId = -1;
                store.updatedAt = Date.now();
                saveSummaryStore();
            }
            clearSummaryExtensionPrompt();
            postToFrame({
                type: "SUMMARY_CLEARED",
                payload: { totalFloors: Array.isArray(chat) ? chat.length : 0 },
            });
            break;
        }

        case "CLOSE_PANEL":
            hideOverlay();
            break;

        case "UPDATE_SECTION": {
            const { chatId } = getContext();
            const store = getSummaryStore(chatId);
            if (!store) break;

            store.json ||= {};
            const section = data.section;

            if (section === 'keywords') {
                store.json.keywords = data.data;
            } else if (section === 'events') {
                store.json.events = data.data;
            } else if (section === 'characters') {
                store.json.characters = data.data;
            } else if (section === 'arcs') {
                store.json.arcs = data.data;
            }

            store.updatedAt = Date.now();
            saveSummaryStore();
            updateSummaryExtensionPrompt();
            break;
        }

        case "EDITOR_OPENED":
            $(".xb-ss-close-btn").hide();
            break;

        case "EDITOR_CLOSED":
            $(".xb-ss-close-btn").show();
            break;
    }
}

// ================== iframe overlay ==================

function createOverlay() {
    if (overlayCreated) return;
    overlayCreated = true;

    const $overlay = $(`
        <div id="xiaobaix-story-summary-overlay" style="
            position: fixed !important; inset: 0 !important;
            width: 100vw !important; height: 100vh !important;
            z-index: 99999 !important; display: none; overflow: hidden !important;
        ">
            <div class="xb-ss-backdrop" style="
                position: absolute !important; inset: 0 !important;
                background: rgba(0,0,0,.55) !important;
                backdrop-filter: blur(4px) !important;
            "></div>
            <div class="xb-ss-frame-wrap" style="
                position: absolute !important; inset: 12px !important; z-index: 1 !important;
            ">
                <iframe id="xiaobaix-story-summary-iframe" class="xiaobaix-iframe"
                    src="${iframePath}"
                    style="width:100% !important; height:100% !important; border:none !important;
                           border-radius:12px !important; box-shadow:0 0 30px rgba(0,0,0,.4) !important;
                           background:#fafafa !important;">
                </iframe>
            </div>
            <button class="xb-ss-close-btn" style="
                position: absolute !important; top: 20px !important; right: 20px !important;
                z-index: 2 !important; width: 36px !important; height: 36px !important;
                border-radius: 50% !important; border: none !important;
                background: rgba(0,0,0,.6) !important; color: #fff !important;
                font-size: 20px !important; cursor: pointer !important;
                display: flex !important; align-items: center !important;
                justify-content: center !important;
            ">✕</button>
        </div>
    `);

    $overlay.on("click", ".xb-ss-backdrop, .xb-ss-close-btn", hideOverlay);
    document.body.appendChild($overlay[0]);
    window.addEventListener("message", handleFrameMessage);
}

function showOverlay() {
    if (!overlayCreated) createOverlay();
    $("#xiaobaix-story-summary-overlay").show();
}

function hideOverlay() {
    $("#xiaobaix-story-summary-overlay").hide();
}

// ================== 楼层按钮 ==================

function createSummaryBtn(mesId) {
    const btn = document.createElement('div');
    btn.className = 'mes_btn xiaobaix-story-summary-btn';
    btn.title = '剧情总结';
    btn.dataset.mesid = mesId;
    btn.innerHTML = '<i class="fa-solid fa-chart-line"></i>';
    btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        if (!getSettings().storySummary?.enabled) return;
        currentMesId = Number(mesId);
        openPanelForMessage(currentMesId);
    });
    return btn;
}

function addSummaryBtnToMessage(mesId) {
    if (!getSettings().storySummary?.enabled) return;
    const msg = document.querySelector(`#chat .mes[mesid="${mesId}"]`);
    if (!msg || msg.querySelector('.xiaobaix-story-summary-btn')) return;

    const btn = createSummaryBtn(mesId);
    if (window.registerButtonToSubContainer?.(mesId, btn)) return;
    msg.querySelector('.flex-container.flex1.alignitemscenter')?.appendChild(btn);
}

function initButtonsForAll() {
    if (!getSettings().storySummary?.enabled) return;
    $("#chat .mes").each((_, el) => {
        const mesId = el.getAttribute("mesid");
        if (mesId != null) addSummaryBtnToMessage(mesId);
    });
}

// ================== 打开面板 ==================

function openPanelForMessage(mesId) {
    createOverlay();
    showOverlay();

    const { chat, chatId } = getContext();
    const store = getSummaryStore(chatId);
    const lastSummarized = store?.lastSummarizedMesId ?? -1;
    const totalFloors = chat.length;
    const eventsCount = store?.json?.events?.length || 0;

    postToFrame({
        type: "SUMMARY_BASE_DATA",
        stats: {
            totalFloors,
            summarizedUpTo: lastSummarized + 1,
            eventsCount,
            pendingFloors: totalFloors - lastSummarized - 1,
        },
    });

    if (store?.json) {
        postToFrame({
            type: "SUMMARY_FULL_DATA",
            payload: {
                keywords: store.json.keywords || [],
                events: store.json.events || [],
                characters: store.json.characters || { main: [], relationships: [] },
                arcs: store.json.arcs || [],
                lastSummarizedMesId: lastSummarized,
            },
        });
    } else {
        // 当前聊天没有任何总结数据，通知 iframe 清空自己的内存状态
        postToFrame({
            type: "SUMMARY_CLEARED",
            payload: { totalFloors },
        });
    }

    setSummaryGenerating(summaryGenerating);
}

// ================== 核心：增量总结生成 ==================

function buildIncrementalSlice(targetMesId, lastSummarizedMesId) {
    const { chat } = getContext();
    const start = Math.max(0, (lastSummarizedMesId ?? -1) + 1);
    const end = Math.min(targetMesId, chat.length - 1);

    if (start > end) return { text: "", count: 0, range: "" };

    const slice = chat.slice(start, end + 1);
    const text = slice.map((m, i) => {
        const who = m.is_user ? "【用户】" : `【${m.name || "角色"}】`;
        return `#${start + i + 1} ${who}\n${m.mes}`;
    }).join("\n\n");

    return { text, count: slice.length, range: `${start + 1}-${end + 1}楼`, startMesId: start, endMesId: end };
}

function formatExistingSummaryForAI(store) {
    if (!store?.json) return "（空白，这是首次总结）";

    const data = store.json;
    const parts = [];

    if (data.events?.length) {
        parts.push("【已记录事件】");
        data.events.forEach((ev, i) => parts.push(`${i + 1}. [${ev.timeLabel}] ${ev.title}：${ev.summary}`));
    }

    if (data.characters?.main?.length) {
        parts.push(`\n【主要角色】${data.characters.main.join("、")}`);
    }

    if (data.characters?.relationships?.length) {
        parts.push("【人物关系】");
        data.characters.relationships.forEach(r => parts.push(`- ${r.from} → ${r.to}：${r.label}（${r.trend}）`));
    }

    if (data.arcs?.length) {
        parts.push("【角色弧光】");
        data.arcs.forEach(a => parts.push(`- ${a.name}：${a.trajectory}（进度${Math.round(a.progress * 100)}%）`));
    }

    if (data.keywords?.length) {
        parts.push(`\n【关键词】${data.keywords.map(k => k.text).join("、")}`);
    }

    return parts.join("\n") || "（空白，这是首次总结）";
}

function buildIncrementalSummaryTop64(existingSummary, newHistoryText, historyRange) {
    const msg1 = `你是剧情记录员。你的任务是根据新的对话内容，更新剧情总结表。

规则：
- 只关注新对话中发生的事件，追加到已有记录中
- 不要删除或修改已有的事件记录，追加时只关注新的重要时间节点事件，不琐碎
- 时间标签用简短中文描述（如：开场、片刻后、当晚、翌日、数日后、一周后）
- 根据剧情发展更新角色弧光的进度和描述`;

    const msg2 = `明白。请提供历史总结和新的对话内容。`;

    const msg3 = `<历史总结记表>
${existingSummary}
</历史总结记表>

<新对话内容>（${historyRange}）
${newHistoryText}
</新对话内容>

请输出更新后的完整JSON，格式如下：
{
  "keywords": [{ "text": "关键词", "weight": "核心|重要|一般" }],
  "events": [
    {
      "id": "evt-序号",
      "title": "事件标题",
      "timeLabel": "时间标签",
      "summary": "一句话描述",
      "participants": ["角色名"],
      "type": "冲突|揭示|转折|发展|解决|铺垫|日常",
      "impact": "高|中|低"
    }
  ],
  "characters": {
    "main": ["主要角色"],
    "relationships": [
      { "from": "A", "to": "B", "label": "关系，8个字内", "trend": "亲近|疏远|不变|新建|破裂" }
    ]
  },
  "arcs": [
    {
      "name": "角色名",
      "trajectory": "当前状态描述",
      "progress": 0.0-1.0,
      "moments": ["关键时刻"]
    }
  ]
}

注意：
- events 数组要包含所有已有事件 + 新增事件，按时间顺序排列
- 新增事件的 id 从已有最大序号继续编号
- 只输出JSON，无其他文字`;

    const msg4 = `好的，输出更新后的JSON：`;

    return b64UrlEncode(`user={${msg1}};assistant={${msg2}};user={${msg3}};assistant={${msg4}}`);
}

function getSummaryPanelConfig() {
    const defaults = {
        api: { provider: 'st', url: '', key: '', model: '', modelCache: [], stream: true },
        gen: { temperature: null, top_p: null, top_k: null, presence_penalty: null, frequency_penalty: null },
        trigger: { enabled: false, interval: 20, timing: 'after_ai' },
    };

    try {
        const raw = localStorage.getItem('summary_panel_config');
        if (!raw) return defaults;
        const parsed = JSON.parse(raw);
        return {
            api: { ...defaults.api, ...(parsed.api || {}) },
            gen: { ...defaults.gen, ...(parsed.gen || {}) },
            trigger: { ...defaults.trigger, ...(parsed.trigger || {}) },
        };
    } catch {
        return defaults;
    }
}

async function runSummaryGeneration(mesId, configFromFrame) {
    if (isSummaryGenerating()) {
        postToFrame({ type: "SUMMARY_STATUS", statusText: "上一轮总结仍在进行中..." });
        return false;
    }

    setSummaryGenerating(true);

    const cfg = configFromFrame || {};
    const { chatId } = getContext();
    const store = getSummaryStore(chatId);
    const lastSummarized = store?.lastSummarizedMesId ?? -1;
    const slice = buildIncrementalSlice(mesId, lastSummarized);

    if (slice.count === 0) {
        postToFrame({ type: "SUMMARY_STATUS", statusText: "没有新的对话需要总结" });
        setSummaryGenerating(false);
        return true;
    }

    postToFrame({ type: "SUMMARY_STATUS", statusText: `正在总结 ${slice.range}（${slice.count}楼新内容）...` });

    const existingSummary = formatExistingSummaryForAI(store);
    const top64 = buildIncrementalSummaryTop64(existingSummary, slice.text, slice.range);

    const args = { as: "user", nonstream: "true", top64, id: SUMMARY_SESSION_ID };

    const apiCfg = cfg.api || {};
    const genCfg = cfg.gen || {};

    const providerMap = {
        openai: "openai", google: "gemini", gemini: "gemini",
        claude: "claude", anthropic: "claude",
        deepseek: "deepseek", cohere: "cohere", custom: "custom"
    };
    const mappedApi = providerMap[String(apiCfg.provider || "").toLowerCase()];
    if (mappedApi) {
        args.api = mappedApi;
        if (apiCfg.url) args.apiurl = apiCfg.url;
        if (apiCfg.key) args.apipassword = apiCfg.key;
        if (apiCfg.model) args.model = apiCfg.model;
    }

    if (genCfg.temperature != null) args.temperature = genCfg.temperature;
    if (genCfg.top_p != null) args.top_p = genCfg.top_p;
    if (genCfg.top_k != null) args.top_k = genCfg.top_k;

    const streamingGen = getStreamingGeneration();
    if (!streamingGen) {
        postToFrame({ type: "SUMMARY_ERROR", message: "生成模块未加载" });
        setSummaryGenerating(false);
        return false;
    }

    let raw;
    try {
        raw = await streamingGen.xbgenrawCommand(args, "");
    } catch (err) {
        postToFrame({ type: "SUMMARY_ERROR", message: err?.message || "生成失败" });
        setSummaryGenerating(false);
        return false;
    }

    if (!raw?.trim()) {
        postToFrame({ type: "SUMMARY_ERROR", message: "AI返回为空" });
        setSummaryGenerating(false);
        return false;
    }

    const parsed = parseSummaryJson(raw);
    if (!parsed) {
        console.error("[LittleWhiteBox] JSON解析失败", raw);
        postToFrame({ type: "SUMMARY_ERROR", message: "AI未返回有效JSON" });
        setSummaryGenerating(false);
        return false;
    }

    store.lastSummarizedMesId = slice.endMesId;
    store.json = parsed;
    store.updatedAt = Date.now();
    saveSummaryStore();

    postToFrame({
        type: "SUMMARY_FULL_DATA",
        payload: {
            keywords: parsed.keywords || [],
            events: parsed.events || [],
            characters: parsed.characters || { main: [], relationships: [] },
            arcs: parsed.arcs || [],
            lastSummarizedMesId: slice.endMesId,
        },
    });

    postToFrame({
        type: "SUMMARY_STATUS",
        statusText: `已更新至 ${slice.endMesId + 1} 楼 · ${parsed.events?.length || 0} 个事件`,
    });

    const { chat } = getContext();
    const totalFloors = Array.isArray(chat) ? chat.length : 0;
    postToFrame({
        type: "SUMMARY_BASE_DATA",
        stats: {
            totalFloors,
            summarizedUpTo: slice.endMesId + 1,
            eventsCount: parsed.events?.length || 0,
            pendingFloors: totalFloors - slice.endMesId - 1,
        },
    });

    updateSummaryExtensionPrompt();
    setSummaryGenerating(false);
    return true;
}

// ================== 自动触发总结 ==================

async function maybeAutoRunSummary(reason) {
    const { chatId, chat } = getContext();
    if (!chatId || !Array.isArray(chat)) return;
    if (!getSettings().storySummary?.enabled) return;

    const cfgAll = getSummaryPanelConfig();
    const trig = cfgAll.trigger || {};
    if (!trig.enabled) return;
    if (trig.timing === 'after_ai' && reason !== 'after_ai') return;
    if (trig.timing === 'before_user' && reason !== 'before_user') return;
    if (trig.timing === 'manual') return;
    if (isSummaryGenerating()) return;

    const store = getSummaryStore(chatId);
    const lastSummarized = store?.lastSummarizedMesId ?? -1;
    const pending = chat.length - lastSummarized - 1;
    if (pending < (trig.interval || 1)) return;

    console.log(`[LittleWhiteBox] 自动触发剧情总结: reason=${reason}, pending=${pending}, interval=${trig.interval}`);
    await autoRunSummaryWithRetry(chat.length - 1, { api: cfgAll.api, gen: cfgAll.gen, trigger: trig });
}

async function autoRunSummaryWithRetry(targetMesId, configForRun) {
    for (let attempt = 1; attempt <= 3; attempt++) {
        if (await runSummaryGeneration(targetMesId, configForRun)) return;
        if (attempt < 3) await sleep(1000);
    }

    if (typeof STscript === 'function') {
        try { await STscript('/echo severity=error 剧情总结失败（已自动重试 3 次）。请稍后再试。'); } catch {}
    }
}

// ================== extension_prompts 注入 ==================

function formatSummaryForPrompt(store) {
    const data = store.json || {};
    const parts = [];

    if (data.keywords?.length) {
        parts.push(`关键词：${data.keywords.map(k => k.text).join(" / ")}`);
    }

    if (data.events?.length) {
        const lines = data.events.map(ev => `- [${ev.timeLabel}] ${ev.title}：${ev.summary}`).join("\n");
        parts.push(`事件：\n${lines}`);
    }

    if (data.arcs?.length) {
        const lines = data.arcs.map(a => `- ${a.name}：${a.trajectory}`).join("\n");
        parts.push(`角色状态：\n${lines}`);
    }

    return `<剧情总结>\n${parts.join("\n\n")}\n</剧情总结>`;
}

function updateSummaryExtensionPrompt() {
    if (!getSettings().storySummary?.enabled) {
        delete extension_prompts[SUMMARY_PROMPT_KEY];
        return;
    }

    const { chatId, chat } = getContext();
    const store = getSummaryStore(chatId);
    if (!store?.json) {
        delete extension_prompts[SUMMARY_PROMPT_KEY];
        return;
    }

    const text = formatSummaryForPrompt(store);
    if (!text.trim()) {
        delete extension_prompts[SUMMARY_PROMPT_KEY];
        return;
    }

    const lastIdx = store.lastSummarizedMesId ?? 0;
    const length = Array.isArray(chat) ? chat.length : 0;
    let depth = length - lastIdx - 1;
    if (!Number.isFinite(depth) || depth < 0) depth = 0;

    extension_prompts[SUMMARY_PROMPT_KEY] = {
        value: text,
        position: extension_prompt_types.IN_CHAT,
        depth,
        role: extension_prompt_roles.ASSISTANT,
    };
}

function clearSummaryExtensionPrompt() {
    delete extension_prompts[SUMMARY_PROMPT_KEY];
}

// ================== 事件绑定 ==================

function registerEvents() {
    initButtonsForAll();

    eventSource.on(event_types.CHAT_CHANGED, () => {
        setTimeout(() => {
            initButtonsForAll();
            updateSummaryExtensionPrompt();
        }, 80);
    });

    eventSource.on(event_types.MESSAGE_RECEIVED, () => setTimeout(() => maybeAutoRunSummary('after_ai'), 1000));
    eventSource.on(event_types.MESSAGE_SENT, () => setTimeout(() => maybeAutoRunSummary('before_user'), 1000));

    const buttonHandler = data => {
        setTimeout(() => {
            const mesId = data?.element ? $(data.element).attr("mesid") : data?.messageId;
            mesId == null ? initButtonsForAll() : addSummaryBtnToMessage(mesId);
        }, 50);
    };

    [
        event_types.USER_MESSAGE_RENDERED,
        event_types.CHARACTER_MESSAGE_RENDERED,
        event_types.MESSAGE_RECEIVED,
        event_types.MESSAGE_UPDATED,
        event_types.MESSAGE_SWIPED,
        event_types.MESSAGE_EDITED,
    ].forEach(t => eventSource.on(t, buttonHandler));

    $(document).on("xiaobaix:storySummary:toggle", (_e, enabled) => {
        if (enabled) {
            initButtonsForAll();
            updateSummaryExtensionPrompt();
        } else {
            $(".xiaobaix-story-summary-btn").remove();
            hideOverlay();
            clearSummaryExtensionPrompt();
        }
    });
}

// ================== 初始化 ==================

jQuery(() => {
    if (!getSettings().storySummary?.enabled) {
        clearSummaryExtensionPrompt();
        return;
    }
    registerEvents();
    updateSummaryExtensionPrompt();
});
