import { normalizeThoughtBlocks } from '../../agent-core/runtime/protocol.js';
import { renderMarkdownToHtml } from '../../agent-core/ui/message-markdown.js';
import { buildAgentSettingsPanelMarkup } from '../../agent-core/ui/settings-markup.js';
import { escapeHtml, trimInlineText } from './text-utils.js';
import { formatDraftMetrics, formatTextMetrics } from './text-metrics.js';
import { estimateTokenCount } from '../../agent-core/runtime/context-tokens.js';
import { EBOOK_MAX_CONTEXT_TOKENS } from './history-compaction.js';
import { getMessageWindow } from '../../agent-core/ui/message-windowing.js';
import { isTavilyConfigured } from '../../agent-core/tavily-search.js';
import { getEbookToolDefinitions } from '../shared/tool-definitions.js';
import { buildBookContextPrompt, buildBookTurnContextPrompt, EBOOK_SYSTEM_PROMPT } from './prompts.js';

const STUDIO_FILE_SECTIONS = [
    {
        key: 'chapters',
        title: '正文',
        description: '阅读器只读取这里的章节。',
        badge: '阅读器',
        empty: '还没有正文。',
        basePath: 'book/chapters/',
        matches: (path) => path.startsWith('book/chapters/'),
    },
    {
        key: 'settings',
        title: '设定草稿',
        description: '它们是写作依据，不进阅读器。',
        badge: '草稿',
        empty: '还没有设定草稿。',
        basePath: 'book/',
        matches: (path) => (
            ['book/outline.md', 'book/style.md', 'book/characters.md', 'book/world.md', 'book/state.md', 'book/review-rules.md'].includes(path)
            || path.startsWith('book/reviews/')
            || path.startsWith('book/notes/')
            || path.startsWith('book/volumes/')
        ),
    },
    {
        key: 'sources',
        title: '导入资料',
        description: '从酒馆导入当前聊天全部楼层、角色信息、小白X剧情总结和世界书。',
        badge: '素材',
        empty: '还没有导入资料。',
        basePath: 'book/sources/',
        matches: (path) => path.startsWith('book/sources/'),
    },
];

const FILE_ORDER = [
    'book/chapters/',
    'book/outline.md',
    'book/style.md',
    'book/characters.md',
    'book/world.md',
    'book/state.md',
    'book/review-rules.md',
    'book/reviews/',
    'book/notes/',
    'book/volumes/',
    'book/sources/',
];

const TOOL_PREVIEW_PARSE_LIMIT = 24000;
const renderObjectIds = new WeakMap();
const renderSignatureCache = new WeakMap();
let nextRenderObjectId = 1;

function getRenderObjectId(value) {
    if (!value || typeof value !== 'object') return '0';
    if (!renderObjectIds.has(value)) {
        renderObjectIds.set(value, nextRenderObjectId);
        nextRenderObjectId += 1;
    }
    return renderObjectIds.get(value);
}

function hashString(value = '') {
    const text = String(value || '');
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}

function getCachedTextSignature(owner, key = '', value = '') {
    const text = String(value || '');
    if (!owner || typeof owner !== 'object') {
        return `${text.length}:${hashString(text)}`;
    }
    const cache = renderSignatureCache.get(owner) || {};
    if (cache[key]?.text === text) return cache[key].signature;
    const signature = `${text.length}:${hashString(text)}`;
    cache[key] = { text, signature };
    renderSignatureCache.set(owner, cache);
    return signature;
}

function getFileOrder(path = '') {
    const index = FILE_ORDER.findIndex((prefix) => path === prefix || path.startsWith(prefix));
    return index >= 0 ? index : FILE_ORDER.length;
}

function sortBookFiles(files = []) {
    return [...files].sort((left, right) => {
        const leftOrder = getFileOrder(left.path);
        const rightOrder = getFileOrder(right.path);
        if (leftOrder !== rightOrder) return leftOrder - rightOrder;
        return left.path.localeCompare(right.path, 'zh-CN');
    });
}

function getChapterFiles(files = []) {
    return sortBookFiles(files).filter((file) => /^book\/chapters\/.+\.md$/.test(file.path));
}

function getActiveChapter(state = {}) {
    const chapters = getChapterFiles(state.files);
    const activePath = chapters.some((file) => file.path === state.readerPath)
        ? state.readerPath
        : chapters[0]?.path || '';
    return {
        chapters,
        activePath,
        active: chapters.find((file) => file.path === activePath) || null,
        index: Math.max(0, chapters.findIndex((file) => file.path === activePath)),
    };
}

function formatChapterLabel(path = '') {
    const match = path.match(/^book\/chapters\/(.+)\.md$/);
    if (!match) return '';
    const raw = match[1];
    if (/^\d+$/.test(raw)) return `第 ${Number(raw)} 章`;
    return raw;
}

function formatVolumeLabel(path = '') {
    const match = String(path || '').match(/^book\/volumes\/(.+)\.md$/);
    if (!match) return '';
    const raw = match[1].split('/').pop() || match[1];
    if (/^\d+$/.test(raw)) return `第 ${Number(raw)} 卷规划`;
    return `${raw} 规划`;
}

export function formatFileTitle(path = '') {
    const known = {
        'book/outline.md': '大纲',
        'book/style.md': '文风规则',
        'book/characters.md': '角色设定',
        'book/world.md': '世界设定',
        'book/state.md': '状态追踪',
        'book/review-rules.md': '审稿规则',
        'book/notes/revision-plan.md': '修订计划',
        'book/sources/chat.md': '当前聊天资料',
        'book/sources/character.md': '角色资料',
        'book/sources/story-summary.md': '剧情总结资料',
        'book/sources/worldbook.md': '世界书资料',
    };
    if (known[path]) return known[path];
    const chapterLabel = formatChapterLabel(path);
    if (chapterLabel) return chapterLabel;
    const volumeLabel = formatVolumeLabel(path);
    if (volumeLabel) return volumeLabel;
    if (path.startsWith('book/sources/')) return path.replace(/^book\/sources\//, '').replace(/\.md$/, '').split('/').pop() || path;
    if (path.startsWith('book/reviews/')) return `审稿 ${path.replace(/^book\/reviews\//, '').replace(/\.md$/, '').split('/').pop() || ''}`;
    if (path.startsWith('book/notes/')) return path.replace(/^book\/notes\//, '').replace(/\.md$/, '').split('/').pop() || path;
    return path.replace(/^book\//, '');
}

function isChapterPath(path = '') {
    return /^book\/chapters\/.+\.md$/.test(String(path || ''));
}

function stripEbookImageMarkers(content = '') {
    return String(content || '').replace(/\[ebook-image:[a-z0-9\-_]+\]/gi, '').trim();
}

function formatBookDate(timestamp = 0) {
    const date = Number(timestamp) ? new Date(Number(timestamp)) : null;
    if (!date || Number.isNaN(date.getTime())) return '暂无更新时间';
    return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function renderProviderReadiness(providerConfig = {}) {
    const provider = String(providerConfig.provider || '');
    const missing = [];
    if (!String(providerConfig.model || '').trim()) missing.push('模型');
    if (provider !== 'sillytavern-openai-compatible' && !String(providerConfig.apiKey || '').trim()) missing.push('API Key');
    if (provider === 'openai-compatible' && !String(providerConfig.baseUrl || '').trim()) missing.push('URL');
    if (missing.length) {
        return {
            canRun: false,
            level: 'error',
            text: `还不能发送：请先补好 ${missing.join(' / ')}。`,
        };
    }
    if ((provider === 'openai-compatible' || provider === 'sillytavern-openai-compatible') && providerConfig.toolMode !== 'tagged-json') {
        return {
            canRun: true,
            level: 'warn',
            text: '这套模型有时不太稳定，写作过程中可能会中断。',
        };
    }
    return {
        canRun: true,
        level: 'ok',
        text: '写作助手只会读写这本书。',
    };
}

function formatContextMeterCount(tokens = 0) {
    return `${Math.max(0, Math.round((Number(tokens) || 0) / 1000))}k`;
}

function createContextMeterHasher() {
    let hashA = 2166136261;
    let hashB = 2166136261 ^ 0x9e3779b9;
    let charCount = 0;
    let chunkCount = 0;

    function addText(value = '') {
        const text = String(value ?? '');
        chunkCount += 1;
        charCount += text.length;
        for (let index = 0; index < text.length; index += 1) {
            const code = text.charCodeAt(index);
            hashA ^= code;
            hashA = Math.imul(hashA, 16777619);
            hashB ^= code + 0x9e3779b9 + (hashB << 6) + (hashB >>> 2);
            hashB = Math.imul(hashB, 1597334677);
        }
    }

    function addField(name, value = '') {
        addText('\u001e');
        addText(name);
        addText('\u001f');
        addText(value);
    }

    function digest() {
        return [
            charCount,
            chunkCount,
            (hashA >>> 0).toString(36),
            (hashB >>> 0).toString(36),
        ].join(':');
    }

    return {
        addField,
        digest,
    };
}

export function buildConversationContextMeterStateKey(state = {}, providerConfig = {}) {
    const hasher = createContextMeterHasher();
    hasher.addField('book-id', state.book?.id || '');
    hasher.addField('provider', providerConfig?.provider || '');
    hasher.addField('model', providerConfig?.model || '');
    hasher.addField('tool-mode', providerConfig?.toolMode || '');
    const files = Array.isArray(state.files) ? state.files : [];
    hasher.addField('file-count', files.length);
    files.forEach((file, index) => {
        hasher.addField(`file:${index}:path`, file?.path || '');
        hasher.addField(`file:${index}:content`, file?.content || '');
    });

    const messages = Array.isArray(state.messages) ? state.messages : [];
    hasher.addField('message-count', messages.length);
    messages.forEach((message, index) => {
        hasher.addField(`message:${index}:role`, message?.role || '');
        hasher.addField(`message:${index}:content`, message?.content || '');
        hasher.addField(`message:${index}:error`, message?.error ? '1' : '0');
        hasher.addField(`message:${index}:tool-call-id`, message?.toolCallId || '');
        hasher.addField(`message:${index}:tool-name`, message?.toolName || '');
        const toolCalls = Array.isArray(message?.toolCalls) ? message.toolCalls : [];
        hasher.addField(`message:${index}:tool-call-count`, toolCalls.length);
        toolCalls.forEach((toolCall, toolCallIndex) => {
            hasher.addField(`message:${index}:tool-call:${toolCallIndex}:id`, toolCall?.id || '');
            hasher.addField(`message:${index}:tool-call:${toolCallIndex}:name`, toolCall?.name || '');
            hasher.addField(`message:${index}:tool-call:${toolCallIndex}:arguments`, toolCall?.arguments || '');
        });
    });

    return hasher.digest();
}

function resolveContextStatsForState(state = {}, providerConfig = {}) {
    const stats = state.contextStats && typeof state.contextStats === 'object' ? state.contextStats : null;
    if (!stats) return null;
    const stateKey = buildConversationContextMeterStateKey(state, providerConfig);
    if (stats.stateKey !== stateKey && !(state.isBusy && stats.source === 'resolved')) return null;
    const usedTokens = Number(stats.usedTokens);
    if (!Number.isFinite(usedTokens)) return null;
    return {
        ...stats,
        usedTokens,
    };
}

export function estimateConversationContextTokens(state = {}, providerConfig = {}) {
    const contextPrompt = buildBookContextPrompt({
        book: state.book,
        files: state.files,
    });
    const turnContextPrompt = buildBookTurnContextPrompt({
        book: state.book,
        files: state.files,
    });
    const lines = [];
    lines.push(`[System]\n${EBOOK_SYSTEM_PROMPT}`);
    lines.push(`[Stable context]\n${contextPrompt}`);
    lines.push(`[Turn context]\n${turnContextPrompt}`);
    lines.push(`[Tools]\n${JSON.stringify(getEbookToolDefinitions({
        webSearchEnabled: isTavilyConfigured(providerConfig),
    }))}`);
    (state.messages || []).forEach((message) => {
        if (!message || !['user', 'assistant', 'tool'].includes(message.role)) return;
        const roleLabel = message.role === 'user'
            ? '用户'
            : message.role === 'tool'
                ? `工具:${message.toolName || message.toolCallId || ''}`
                : '电纸书';
        const toolCalls = message.role === 'assistant' && Array.isArray(message.toolCalls) && message.toolCalls.length
            ? message.toolCalls.map((toolCall) => `${toolCall.name} ${toolCall.arguments || '{}'}`).join('\n')
            : '';
        lines.push(`${roleLabel}: ${[message.content || '', toolCalls].filter(Boolean).join('\n')}`);
    });
    return estimateTokenCount(lines.join('\n\n'));
}

export function renderConversationContextMeterLabel(state = {}, providerConfig = {}) {
    const stats = resolveContextStatsForState(state, providerConfig);
    const used = stats ? stats.usedTokens : estimateConversationContextTokens(state, providerConfig);
    return `${formatContextMeterCount(used)}/${formatContextMeterCount(EBOOK_MAX_CONTEXT_TOKENS)}`;
}

export function renderConversationContextMeterTitle(state = {}, providerConfig = {}) {
    const stats = resolveContextStatsForState(state, providerConfig);
    const source = String(stats?.source || '').trim();
    const prefix = source === 'resolved'
        ? '最近一次发模上下文 / 188k'
        : '当前估算送模上下文 / 188k';
    return prefix;
}

function renderCompactionOverlay(state = {}) {
    const overlay = state.compactionOverlay || {};
    if (!overlay.active) return '';
    const current = formatContextMeterCount(overlay.currentTokens);
    const target = Number(overlay.yieldTokens) > 0 ? formatContextMeterCount(overlay.yieldTokens) : '....';
    const status = String(overlay.status || '').trim() || '正在释放较早对话...';
    return `
        <div class="xb-distillation-layer${overlay.resolved ? ' resolved' : ''}" role="status" aria-live="polite">
            <div class="xb-distillation-backdrop"></div>
            <div class="xb-distillation-aura"></div>
            <section class="xb-distillation-plaque" aria-label="上下文释放">
                <div class="xb-distillation-title">CONTEXT DISTILLATION</div>
                <div class="xb-distillation-status">${escapeHtml(status)}</div>
                <div class="xb-distillation-metrics">
                    <div class="xb-distillation-metric">
                        <strong>${escapeHtml(current)}</strong>
                        <span>Current Load</span>
                    </div>
                    <div class="xb-distillation-divider" aria-hidden="true"></div>
                    <div class="xb-distillation-metric">
                        <strong class="xb-distillation-yield">${escapeHtml(target)}</strong>
                        <span>Yield</span>
                    </div>
                </div>
            </section>
            <div class="xb-distillation-ripple" aria-hidden="true"></div>
        </div>
    `;
}

function renderProtocolNotice(state = {}) {
    const notice = state.protocolNotice || {};
    const message = String(notice.message || '').trim();
    if (!message) return '';
    return `
        <div class="xb-protocol-notice" role="status" aria-live="polite">
            <span>${escapeHtml(message)}</span>
        </div>
    `;
}

function renderThoughtDetails(message = {}, options = {}) {
    const thoughts = normalizeThoughtBlocks(message.thoughts);
    if (!thoughts.length) return '';
    const thoughtKey = String(options.key || '').trim();
    const autoOpen = !!message.streaming;
    const isOpen = autoOpen
        || (thoughtKey && Array.isArray(options.openThoughtKeys) && options.openThoughtKeys.includes(thoughtKey));
    const label = thoughts.length > 1
        ? `${message.streaming ? '正在思考' : '展开思考块'}（${thoughts.length} 段）`
        : (message.streaming ? '正在思考' : '展开思考块');
    const thoughtKeyAttr = thoughtKey ? ` data-thought-key="${escapeHtml(thoughtKey)}"` : '';
    const autoOpenAttr = autoOpen ? ' data-auto-open-thought="true"' : '';
    const openAttr = isOpen ? ' open' : '';
    return `
        <details class="xb-thought-details"${thoughtKeyAttr}${autoOpenAttr}${openAttr}>
            <summary>${escapeHtml(label)}</summary>
            ${thoughts.map((item) => `
                <div class="xb-thought-block">
                    <div class="xb-thought-label">${escapeHtml(item.label)}</div>
                    <pre>${escapeHtml(item.text)}</pre>
                </div>
            `).join('')}
        </details>
    `;
}

function buildToolTurnKey(batches = [], fallbackIndex = 0) {
    const ids = [];
    batches.forEach((batch) => {
        (batch.assistantMessage?.toolCalls || []).forEach((toolCall) => {
            const id = String(toolCall?.id || '').trim();
            if (id) ids.push(id);
        });
    });
    return ids.length
        ? `tool-turn:${ids.join('|')}`
        : `tool-turn:fallback:${fallbackIndex}`;
}

function shouldAutoOpenActiveToolTurn(state = {}, startIndex = -1) {
    return !!(
        state.isBusy
        && Number.isInteger(state.activeTurnStartIndex)
        && state.activeTurnStartIndex >= 0
        && startIndex > state.activeTurnStartIndex
    );
}

function parseToolContent(content = '') {
    try {
        const parsed = JSON.parse(String(content || '{}'));
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function extractJsonStringField(jsonText = '', field = '') {
    const text = String(jsonText || '');
    const marker = `"${field}"`;
    const markerIndex = text.indexOf(marker);
    if (markerIndex < 0) return '';
    const colonIndex = text.indexOf(':', markerIndex + marker.length);
    if (colonIndex < 0) return '';
    let quoteIndex = colonIndex + 1;
    while (quoteIndex < text.length && /\s/.test(text[quoteIndex])) quoteIndex += 1;
    if (text[quoteIndex] !== '"') return '';
    let endIndex = quoteIndex + 1;
    let escaped = false;
    while (endIndex < text.length) {
        const char = text[endIndex];
        if (escaped) {
            escaped = false;
        } else if (char === '\\') {
            escaped = true;
        } else if (char === '"') {
            try {
                return JSON.parse(text.slice(quoteIndex, endIndex + 1));
            } catch {
                return '';
            }
        }
        endIndex += 1;
    }
    return '';
}

function parseToolPreviewContent(content = '', options = {}) {
    const text = String(content || '');
    if (options.forceParse || text.length <= TOOL_PREVIEW_PARSE_LIMIT) {
        return parseToolContent(text);
    }
    const message = extractJsonStringField(text, 'summary')
        || extractJsonStringField(text, 'message')
        || extractJsonStringField(text, 'error');
    return {
        __previewOnly: true,
        ok: /"ok"\s*:\s*false/.test(text) ? false : undefined,
        summary: message,
        message,
        error: extractJsonStringField(text, 'error'),
    };
}

function isPlanToolName(name = '') {
    return ['PlanCreate', 'PlanUpdate', 'PlanList', 'PlanGet'].includes(String(name || ''));
}

function formatPlanStatusLabel(status = '') {
    switch (String(status || '').trim()) {
        case 'pending':
            return '待办';
        case 'in_progress':
            return '进行中';
        case 'blocked':
            return '阻塞';
        case 'completed':
            return '已完成';
        case 'failed':
            return '失败';
        case 'cancelled':
            return '已取消';
        default:
            return status || '未知';
    }
}

function formatPlanMark(status = '') {
    const normalized = String(status || '').trim();
    if (normalized === 'completed') return '✓';
    if (normalized === 'failed' || normalized === 'cancelled') return '×';
    return '';
}

function formatPlanSummary(parsed = {}, toolName = '') {
    const plan = parsed.plan && typeof parsed.plan === 'object' ? parsed.plan : null;
    const plans = Array.isArray(parsed.plans) ? parsed.plans : [];
    if (parsed.ok === false) {
        return parsed.error ? `计划工具失败：${parsed.error}` : '计划工具失败';
    }
    if (toolName === 'PlanList') {
        return `计划列表：${Number(parsed.count) || plans.length || 0} 项`;
    }
    if (toolName === 'PlanGet') {
        return plan ? `计划：${plan.title || '未命名计划'}`.trim() : '计划不存在';
    }
    if (toolName === 'PlanCreate') {
        return `计划已创建：${plan?.title || '未命名计划'}`.trim();
    }
    if (toolName === 'PlanUpdate') {
        return `计划已更新：${plan?.title || '未命名计划'}`.trim();
    }
    return parsed.summary || '计划已返回';
}

function renderPlanItem(plan = {}) {
    const title = String(plan.title || '未命名计划').trim();
    const status = String(plan.status || '').trim();
    const blockerCount = Array.isArray(plan.blockedBy) ? plan.blockedBy.length : 0;
    const meta = [
        status ? `状态：${formatPlanStatusLabel(status)}` : '',
        plan.priority ? `优先级：${plan.priority}` : '',
        blockerCount ? `依赖：${blockerCount} 项` : '',
    ].filter(Boolean).join('，');
    const detail = [
        meta,
        plan.result ? `结果：${trimInlineText(plan.result, 180)}` : '',
        plan.error ? `错误：${trimInlineText(plan.error, 180)}` : '',
    ].filter(Boolean).join('\n');
    return `
        <div class="xb-tool-plan-item">
            <span class="xb-tool-plan-box">${escapeHtml(formatPlanMark(status))}</span>
            <p>
                <strong>${escapeHtml(title)}</strong>
                ${detail ? `<small>${escapeHtml(detail)}</small>` : ''}
            </p>
        </div>
    `;
}

function renderPlanToolBody(toolMessage = {}, parsed = parseToolContent(toolMessage.content)) {
    if (!isPlanToolName(toolMessage.toolName)) return '';
    const plan = parsed.plan && typeof parsed.plan === 'object' ? parsed.plan : null;
    const plans = Array.isArray(parsed.plans) ? parsed.plans : [];
    const blockers = Array.isArray(parsed.blockers)
        ? parsed.blockers.filter((item) => item && typeof item === 'object')
        : [];
    const items = plans.length ? plans : (plan ? [plan] : []);
    const hasPlanPayload = plan || plans.length || blockers.length || parsed.ok === false || parsed.summary || parsed.message || parsed.error;
    if (!hasPlanPayload) return '';
    const blockerItems = blockers.map((item) => ({
        id: item.id,
        title: item.title || item.id,
        status: item.status || 'blocked',
    }));
    const summary = formatPlanSummary(parsed, toolMessage.toolName);
    return `
        <div class="xb-tool-plan">
            <small>${escapeHtml(summary || '计划已返回')}</small>
            ${items.length ? `<div class="xb-tool-plan-list">${items.map(renderPlanItem).join('')}</div>` : ''}
            ${blockerItems.length ? `
                <div class="xb-tool-plan-blockers">
                    <span>阻塞项</span>
                    <div class="xb-tool-plan-list">${blockerItems.map(renderPlanItem).join('')}</div>
                </div>
            ` : ''}
            ${parsed.ok === false && parsed.message ? `<small>${escapeHtml(parsed.message)}</small>` : ''}
        </div>
    `;
}

function formatToolSummary(message = {}, parsedOverride = null) {
    const parsed = parsedOverride && typeof parsedOverride === 'object'
        ? parsedOverride
        : parseToolContent(message.content);
    const fallback = parsed.__previewOnly
        ? `${message.toolName || '工具'} 已返回结果。`
        : String(message.content || '');
    return trimInlineText(
        parsed.summary
        || parsed.message
        || parsed.error
        || fallback,
        220,
    ) || '工具已返回结果。';
}

function formatElapsedMs(ms = 0) {
    const value = Number(ms) || 0;
    if (!value) return '';
    return `${(value / 1000).toFixed(1)}s`;
}

function renderLiveToolPayload(item = {}) {
    const payload = Array.isArray(item.payload) ? item.payload : [];
    if (!payload.length) return '';
    return `
        <div class="xb-tool-payload">
            ${payload.map((entry) => `
                <div class="xb-tool-payload-row">
                    <span>${escapeHtml(entry.label || '')}</span>
                    <p>${escapeHtml(trimInlineText(entry.text || '', 260))}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function renderLiveToolProgress(item = {}) {
    const progress = Array.isArray(item.progress) ? item.progress : [];
    if (!progress.length) return '';
    return `
        <div class="xb-tool-progress">
            ${progress.map((entry) => `
                <div class="xb-tool-progress-row">
                    <span>${escapeHtml(entry.label || '')}</span>
                    <p>${escapeHtml(trimInlineText(entry.text || '', 260))}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function renderLiveToolTraceItem(item = {}) {
    const hasStatus = item.status === 'running' || item.status === 'resolved';
    const isRunning = item.status === 'running';
    const payloadHtml = renderLiveToolPayload(item);
    const progressHtml = renderLiveToolProgress(item);
    const hasPayload = !!payloadHtml;
    const statusText = !hasStatus
        ? ''
        : isRunning
        ? '运行中'
        : (item.ok === false ? '失败' : '已返回');
    const elapsed = hasStatus && !isRunning ? formatElapsedMs(item.elapsedMs) : '';
    const statusSuffix = elapsed ? ` · ${elapsed}` : '';
    const summary = trimInlineText(item.summary, 220) || (isRunning ? '工具已发起，等待返回。' : '工具已返回结果。');
    const classes = [
        'xb-tool',
        hasPayload ? 'has-payload' : '',
        hasStatus ? (isRunning ? 'is-running' : 'is-resolved') : '',
        item.ok === false ? 'is-error' : '',
    ].filter(Boolean).join(' ');
    const headHtml = `
        <div class="xb-tool-head">
            <span>${escapeHtml(item.title || item.name || '工具调用')}</span>
            ${statusText ? `<em>${escapeHtml(`${statusText}${statusSuffix}`)}</em>` : ''}
        </div>
    `;
    const resultHtml = `
        ${headHtml}
        <small>${escapeHtml(summary)}</small>
    `;
    return `
        <div class="${escapeHtml(classes)}">
            ${hasPayload ? `
                ${payloadHtml}
                ${progressHtml}
                <div class="xb-tool-result">${resultHtml}</div>
            ` : `${progressHtml}${resultHtml}`}
        </div>
    `;
}

function renderStoredToolMessage(toolMessage = {}) {
    const parsed = parseToolContent(toolMessage.content);
    const planBody = renderPlanToolBody(toolMessage, parsed);
    const display = toolMessage.toolDisplay && typeof toolMessage.toolDisplay === 'object'
        ? toolMessage.toolDisplay
        : null;
    if (!display) {
        return `
            <div class="xb-tool ${parsed.ok === false ? 'is-error' : ''}">
                <div class="xb-tool-plain-title">${escapeHtml(toolMessage.toolName || '工具结果')}</div>
                ${planBody || `<small>${escapeHtml(formatToolSummary(toolMessage))}</small>`}
            </div>
        `;
    }
    if (planBody) {
        return `
            <div class="xb-tool ${parsed.ok === false ? 'is-error' : 'is-resolved'}">
                <div class="xb-tool-head">
                    <span>${escapeHtml(display.title || toolMessage.toolName || '工具结果')}</span>
                    <em>${escapeHtml(display.status === 'running' ? '运行中' : '已返回')}</em>
                </div>
                ${planBody}
            </div>
        `;
    }
    return renderLiveToolTraceItem({
        name: toolMessage.toolName || '工具结果',
        title: display.title || toolMessage.toolName || '工具结果',
        ok: parsed.ok !== false,
        status: display.status || 'resolved',
        summary: formatToolSummary(toolMessage),
        payload: Array.isArray(display.payload) ? display.payload : [],
        elapsedMs: Number(display.elapsedMs) || 0,
    });
}

function renderStoredToolPreview(toolMessage = {}) {
    const isPlanTool = isPlanToolName(toolMessage.toolName);
    const parsed = parseToolPreviewContent(toolMessage.content, {
        forceParse: isPlanTool,
    });
    const planBody = isPlanTool ? renderPlanToolBody(toolMessage, parsed) : '';
    const display = toolMessage.toolDisplay && typeof toolMessage.toolDisplay === 'object'
        ? toolMessage.toolDisplay
        : null;
    if (display) {
        const statusText = display.status === 'running'
            ? '运行中'
            : (parsed.ok === false ? '失败' : '已返回');
        return `
            <div class="xb-tool ${parsed.ok === false ? 'is-error' : 'is-resolved'}">
                <div class="xb-tool-head">
                    <span>${escapeHtml(display.title || toolMessage.toolName || '工具结果')}</span>
                    <em>${escapeHtml(statusText)}</em>
                </div>
                ${planBody || `<small>${escapeHtml(formatToolSummary(toolMessage, parsed))}</small>`}
            </div>
        `;
    }
    return `
        <div class="xb-tool ${parsed.ok === false ? 'is-error' : ''}">
            <div class="xb-tool-plain-title">${escapeHtml(toolMessage.toolName || '工具结果')}</div>
            ${planBody || `<small>${escapeHtml(formatToolSummary(toolMessage, parsed))}</small>`}
        </div>
    `;
}

function renderToolPrefacePreview(assistantMessage = {}) {
    const content = trimInlineText(String(assistantMessage.content || '').trim(), 260);
    if (!content) return '';
    return `<div class="xb-tool-preface-preview">${escapeHtml(content)}</div>`;
}

function renderMessageMarkdownHtml(text = '') {
    return renderMarkdownToHtml(String(text || '').trim());
}

function renderReaderInlineMarkdown(text = '') {
    return escapeHtml(text)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
}

function renderReaderMarkdownFallback(text = '') {
    const raw = String(text || '').trim();
    if (!raw) return '';
    const heading = raw.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
        const level = Math.min(3, heading[1].length);
        return `<h${level}>${renderReaderInlineMarkdown(heading[2])}</h${level}>`;
    }
    if (/^>\s?/.test(raw)) {
        const quoteText = raw.split('\n').map((line) => line.replace(/^>\s?/, '')).join('\n');
        return `<blockquote>${renderReaderInlineMarkdown(quoteText).replace(/\n/g, '<br>')}</blockquote>`;
    }
    return `<p>${renderReaderInlineMarkdown(raw).replace(/\n/g, '<br>')}</p>`;
}

function renderReaderMarkdownBlock(text = '', paragraphIndex = 0) {
    const raw = String(text || '').trim();
    let html = renderMarkdownToHtml(raw);
    if (html === escapeHtml(raw).replace(/\n/g, '<br>')) {
        html = renderReaderMarkdownFallback(raw);
    }
    if (!html) return '';
    return `<div class="xb-reader-md${paragraphIndex === 0 ? ' xb-reader-drop' : ''}" data-reader-block-key="reader-block:${paragraphIndex}">${html}</div>`;
}

function renderBookCards(state = {}) {
    if (state.isShelfLoading) {
        return `<div class="xb-empty xb-library-empty">${escapeHtml(state.status || '正在打开书架...')}</div>`;
    }
    if (state.shelfLoadError) {
        return `
            <div class="xb-empty xb-library-empty">
                <p>${escapeHtml(state.status || '书架加载失败')}</p>
                <button id="xb-library-retry-shelf" class="xb-shelf-action" type="button">重试打开书架</button>
            </div>
        `;
    }
    if (!state.books.length) {
        return '<div class="xb-empty xb-library-empty">书架上还没有书。</div>';
    }
    const deleteMode = !!state.isDeleteBookOpen;
    return state.books.map((book) => {
        const active = book.id === state.book?.id ? ' is-active' : '';
        const modeClass = deleteMode ? ' is-delete-target' : '';
        const dataAttr = deleteMode
            ? `data-delete-book-id="${escapeHtml(book.id)}"`
            : `data-book-id="${escapeHtml(book.id)}"`;
        const chapterCount = getBookChapterCount(book, state);
        return `
            <button class="xb-library-book${active}${modeClass}" ${dataAttr} ${state.isBusy || state.isShelfLoading || state.shelfLoadError ? 'disabled' : ''}>
                <span class="xb-book-spine"></span>
                <span class="xb-library-book-main">
                    <strong>${escapeHtml(book.title || '未命名书稿')}</strong>
                    <small>${deleteMode ? '点击删除这本书' : `已创作 ${chapterCount} 章`}</small>
                </span>
                <span class="xb-library-book-foot">
                    <em>${deleteMode ? 'DELETE' : `${chapterCount}章`}</em>
                    <small>${escapeHtml(formatBookDate(book.updatedAt))}</small>
                </span>
            </button>
        `;
    }).join('');
}

function getBookChapterCount(book = {}, state = {}) {
    const count = Number(book.chapterCount);
    if (Number.isFinite(count) && count >= 0) return Math.floor(count);
    if (book.id && book.id === state.book?.id) {
        return getChapterFiles(state.files).filter((file) => {
            const content = String(file.content || '').trim();
            return content && content !== '从这里开始写正文。';
        }).length;
    }
    return 0;
}

function renderLibraryShelfActions(state = {}, bookCount = 0) {
    const deleteMode = !!state.isDeleteBookOpen;
    const shelfBusy = !!state.isShelfLoading || !!state.shelfLoadError;
    const canDelete = bookCount > 0 && !state.isBusy && !shelfBusy;
    return `
        <div class="xb-shelf-actions" aria-label="书架操作">
            <button id="xb-library-new-book" class="xb-shelf-action" type="button" title="新建书稿" aria-label="新建书稿" ${state.isBusy || shelfBusy ? 'disabled' : ''}>
                <span class="xb-shelf-action-ring" aria-hidden="true">+</span>
                <strong>新建书稿</strong>
            </button>
            ${deleteMode ? `
                <button id="xb-delete-book-close" class="xb-shelf-action xb-shelf-action-danger is-active" type="button" title="退出删除模式" aria-label="退出删除模式">
                    <span class="xb-shelf-action-ring" aria-hidden="true">-</span>
                    <strong>退出删除</strong>
                </button>
            ` : `
                <button id="xb-library-delete-book" class="xb-shelf-action xb-shelf-action-danger" type="button" title="删除书稿" aria-label="删除书稿" ${canDelete ? '' : 'disabled'}>
                    <span class="xb-shelf-action-ring" aria-hidden="true">-</span>
                    <strong>删除书稿</strong>
                </button>
            `}
        </div>
    `;
}

function renderExitIcon() {
    return `
        <svg class="xb-exit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <path d="M16 17l5-5-5-5"></path>
            <path d="M21 12H9"></path>
        </svg>
    `;
}

function renderImportIcon() {
    return `
        <svg class="xb-theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3v12"></path>
            <path d="m7 10 5 5 5-5"></path>
            <path d="M5 21h14"></path>
            <path d="M5 17v4"></path>
            <path d="M19 17v4"></path>
        </svg>
    `;
}

function renderExportIcon() {
    return `
        <svg class="xb-theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 21V9"></path>
            <path d="m7 14 5-5 5 5"></path>
            <path d="M5 3h14"></path>
            <path d="M5 3v4"></path>
            <path d="M19 3v4"></path>
        </svg>
    `;
}

function renderTransferTrayIcon() {
    return `
        <svg class="xb-theme-icon xb-transfer-tray-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3v10"></path>
            <path d="m8 9 4 4 4-4"></path>
            <path d="M5 14.5v3.2c0 1 .8 1.8 1.8 1.8h10.4c1 0 1.8-.8 1.8-1.8v-3.2"></path>
            <path d="M8 16.5h8"></path>
        </svg>
    `;
}

export function renderThemeToggleIcon(colorTheme = 'dark') {
    const isLight = colorTheme === 'light';
    if (isLight) {
        return '<span class="xb-theme-glyph" aria-hidden="true">☾</span>';
    }
    return `
        <svg class="xb-theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
        </svg>
    `;
}

function renderBookTransferMenuDialog(state = {}) {
    if (!state.isBookTransferMenuOpen) return '';
    const bookCount = Array.isArray(state.books) ? state.books.length : 0;
    const transferActive = !!state.bookTransferProgress;
    const disabled = state.isBusy || transferActive || state.isShelfLoading || state.shelfLoadError;
    return `
        <div class="xb-ebook-delete-overlay xb-ebook-transfer-menu-overlay" id="xb-book-transfer-menu-overlay">
            <div class="xb-ebook-delete-dialog xb-ebook-transfer-menu-dialog" role="dialog" aria-modal="true" aria-labelledby="xb-book-transfer-menu-title">
                <div class="xb-ebook-delete-head">
                    <div>
                        <h2 id="xb-book-transfer-menu-title">书籍传输</h2>
                    </div>
                    <button id="xb-book-transfer-menu-close" class="xb-icon-button" type="button" title="关闭" aria-label="关闭">×</button>
                </div>
                <div class="xb-book-transfer-menu-list">
                    <button class="xb-book-transfer-menu-choice" type="button" id="xb-book-transfer-download" ${disabled || !bookCount ? 'disabled' : ''}>
                        <span>${renderExportIcon()}</span>
                        <strong>下载书籍</strong>
                    </button>
                    <button class="xb-book-transfer-menu-choice" type="button" id="xb-book-transfer-upload" ${disabled ? 'disabled' : ''}>
                        <span>${renderImportIcon()}</span>
                        <strong>上传书籍</strong>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderBookExportDialog(state = {}) {
    if (!state.isBookExportOpen) return '';
    const books = Array.isArray(state.books) ? state.books : [];
    const transferActive = !!state.bookTransferProgress;
    const list = books.length
        ? books.map((book) => `
            <button class="xb-ebook-export-book" type="button" data-export-book-id="${escapeHtml(book.id)}" ${state.isBusy || transferActive ? 'disabled' : ''}>
                <span>
                    <strong>${escapeHtml(book.title || '未命名书稿')}</strong>
                    <small>${escapeHtml(formatBookDate(book.updatedAt))}</small>
                </span>
                <em>导出</em>
            </button>
        `).join('')
        : '<div class="xb-ebook-delete-note">书架上还没有可导出的书。</div>';
    return `
        <div class="xb-ebook-delete-overlay xb-ebook-export-overlay" id="xb-book-export-overlay">
            <div class="xb-ebook-delete-dialog xb-ebook-export-dialog" role="dialog" aria-modal="true" aria-labelledby="xb-book-export-title">
                <div class="xb-ebook-delete-head">
                    <div>
                        <h2 id="xb-book-export-title">导出作品包</h2>
                        <p class="xb-ebook-export-note">选择一本书，导出书稿文件和已引用的阅读器配图。</p>
                    </div>
                    <button id="xb-book-export-close" class="xb-icon-button" type="button" title="关闭" aria-label="关闭">×</button>
                </div>
                <div class="xb-ebook-delete-list xb-ebook-export-list">
                    ${list}
                </div>
            </div>
        </div>
    `;
}

function renderBookTransferOverlay(state = {}) {
    const progress = state.bookTransferProgress;
    if (!progress) return '';
    const mode = progress.mode === 'import' ? '导入作品包' : '导出作品包';
    const title = String(progress.title || '').trim();
    const detail = String(progress.detail || '').trim() || '正在处理作品包...';
    return `
        <div class="xb-ebook-transfer-overlay" role="status" aria-live="polite">
            <div class="xb-ebook-transfer-panel">
                <div class="xb-ebook-transfer-orbit" aria-hidden="true">
                    <span></span>
                    <span></span>
                </div>
                <div class="xb-ebook-transfer-copy">
                    <strong>${escapeHtml(mode)}</strong>
                    ${title ? `<small>${escapeHtml(title)}</small>` : ''}
                    <p>${escapeHtml(detail)}</p>
                </div>
                <div class="xb-ebook-transfer-bar" aria-hidden="true"><span></span></div>
            </div>
        </div>
    `;
}

function renderLibraryShell(options = {}) {
    const state = options.state || {};
    const bookCount = Array.isArray(state.books) ? state.books.length : 0;
    const themeClass = state.colorTheme === 'light' ? 'theme-light' : 'theme-dark';
    const themeToggleIcon = renderThemeToggleIcon(state.colorTheme);
    const themeToggleTitle = state.colorTheme === 'light' ? '切换为深色视觉' : '切换为白底黑字';
    const transferActive = !!state.bookTransferProgress;
    const shelfBusy = !!state.isShelfLoading || !!state.shelfLoadError;
    const shelfStatus = String(state.status || '').trim();
    const metaText = state.isShelfLoading || state.shelfLoadError
        ? shelfStatus || '正在打开书架...'
        : (bookCount ? `${bookCount} 本书稿 · 本地书架` : '本地书架 · 等待第一本书稿');
    return `
        <div class="xb-ebook-screen xb-library-screen ${escapeHtml(themeClass)}${state.isDeleteBookOpen ? ' is-delete-mode' : ''}">
            <div class="xb-ambient-aurora"></div>
            <header class="xb-archive-header">
                <div class="xb-archive-title-block">
                    <h1>小白电纸书</h1>
                    <p class="xb-archive-subtitle">Agent 沉浸式创作与阅读平台</p>
                    <div class="xb-archive-meta">${escapeHtml(metaText)}</div>
                </div>
                <div class="xb-global-actions">
                    <button id="xb-library-transfer-book" class="xb-glass-button xb-transfer-button" type="button" title="书籍传输" aria-label="书籍传输" ${state.isBusy || transferActive || shelfBusy ? 'disabled' : ''}>${renderTransferTrayIcon()}</button>
                    <button id="xb-theme-toggle" class="xb-glass-button xb-theme-button" type="button" title="${escapeHtml(themeToggleTitle)}" aria-label="${escapeHtml(themeToggleTitle)}">${themeToggleIcon}</button>
                    <button id="xb-close" class="xb-glass-button xb-exit-button" type="button" title="退出电纸书" aria-label="退出电纸书">${renderExitIcon()}</button>
                </div>
            </header>
            <main class="xb-shelf-container">
                ${state.isDeleteBookOpen ? '<div class="xb-delete-mode-note">删除模式：点击一本书会清除书稿内容和写作记录。</div>' : ''}
                <section class="xb-library-grid${bookCount ? '' : ' is-empty'}" aria-label="书籍列表">
                    ${renderBookCards(state)}
                    ${renderLibraryShelfActions(state, bookCount)}
                </section>
            </main>
            ${renderBookTransferMenuDialog(state)}
            ${renderBookExportDialog(state)}
            ${renderBookTransferOverlay(state)}
            ${state.toast ? `<div class="xb-toast">${escapeHtml(state.toast)}</div>` : ''}
        </div>
    `;
}

function renderBookEntryShell(options = {}) {
    const state = options.state || {};
    const themeClass = state.colorTheme === 'light' ? 'theme-light' : 'theme-dark';
    const themeToggleIcon = renderThemeToggleIcon(state.colorTheme);
    const themeToggleTitle = state.colorTheme === 'light' ? '切换为深色视觉' : '切换为白底黑字';
    return `
        <div class="xb-ebook-screen xb-entry-screen ${escapeHtml(themeClass)}">
            <div class="xb-ambient-aurora"></div>
            <button class="xb-portal-close" id="xb-library-link" title="返回书架" aria-label="返回书架">×</button>
            <button class="xb-portal-theme" id="xb-theme-toggle" type="button" title="${escapeHtml(themeToggleTitle)}" aria-label="${escapeHtml(themeToggleTitle)}">${themeToggleIcon}</button>
            <main class="xb-entry-portal" aria-label="书本入口">
                <section class="xb-entry-actions">
                    <button class="xb-entry-action is-studio" data-entry-action="studio">
                        <strong>创作台</strong>
                        <span>agent写作平台</span>
                    </button>
                    <button class="xb-entry-action is-reader" data-entry-action="reader">
                        <strong>阅读</strong>
                        <span>沉浸式阅读器</span>
                    </button>
                </section>
            </main>
            ${state.toast ? `<div class="xb-toast">${escapeHtml(state.toast)}</div>` : ''}
        </div>
    `;
}

function getFileGroup(path = '') {
    return STUDIO_FILE_SECTIONS.find((group) => group.matches(path)) || {
        key: 'other',
        title: '其他',
        description: '当前书里的其他文件',
        badge: '文件',
        empty: '没有其他文件。',
        matches: () => false,
    };
}

function getStudioFileSignature(file = {}) {
    // Structural identity only — path + title. The active/selected state is intentionally
    // excluded so that changing the selected file doesn't alter the signature (which would
    // force the whole .xb-file-tree to be rebuilt and reset scroll). Selection is synced as a
    // class toggle in syncFileGroupFiles instead.
    const title = formatFileTitle(file.path);
    return [
        file.path,
        title,
    ].join(':');
}

function renderSectionFiles(section = {}, files = [], state = {}) {
    if (!files.length) {
        return `<div class="xb-file-tree" data-file-tree-signature="empty"><div class="xb-section-empty" data-file-group-empty="true">${escapeHtml(section.empty || '这里还没有文件。')}</div></div>`;
    }
    const base = section.basePath || '';
    const rows = [];
    let lastDirectory = '';
    files.forEach((file) => {
        const relativePath = base && file.path.startsWith(base) ? file.path.slice(base.length) : file.path.replace(/^book\//, '');
        const directory = relativePath.includes('/') ? relativePath.split('/').slice(0, -1).join('/') : '';
        if (directory && directory !== lastDirectory) {
            rows.push(`<div class="xb-file-directory">${escapeHtml(directory)}</div>`);
            lastDirectory = directory;
        }
        const active = file.path === state.selectedPath ? ' is-active' : '';
        const signature = getStudioFileSignature(file);
        rows.push(`
            <button class="xb-file${active}" data-path="${escapeHtml(file.path)}" data-file-signature="${escapeHtml(signature)}">
                <span class="xb-file-main">${escapeHtml(formatFileTitle(file.path))}</span>
            </button>
        `);
    });
    const treeSignature = files.map((file) => getStudioFileSignature(file)).join('|');
    return `<div class="xb-file-tree" data-file-tree-signature="${escapeHtml(treeSignature)}">${rows.join('')}</div>`;
}

function renderFileGroupBadge(group = {}, state = {}) {
    if (group.key === 'chapters') {
        const descending = !!state.chapterSortDescending;
        const label = descending ? '正序' : '倒序';
        const title = descending ? '按章节正序显示' : '按章节倒序显示';
        return `<button class="xb-file-sort-toggle${descending ? ' is-descending' : ''}" type="button" data-chapter-sort-toggle title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}">${escapeHtml(label)}</button>`;
    }
    return `<em>${escapeHtml(group.badge)}</em>`;
}

function renderImportActions(disabledAttr = '') {
    return `
        <div class="xb-section-subtitle">可导入</div>
        <div class="xb-imports">
            <button data-import="chat" title="导入当前聊天的全部楼层" ${disabledAttr}>聊天记录</button>
            <button data-import="character" ${disabledAttr}>角色信息</button>
            <button data-import="summary" title="导入小白X剧情总结模块里的当前总结" ${disabledAttr}>剧情总结</button>
            <button data-import="worldbook" title="导入当前角色/聊天关联世界书的启用条目" ${disabledAttr}>世界书</button>
        </div>
    `;
}

export function collectStudioFileSectionModels(state = {}, options = {}) {
    const files = sortBookFiles(state.files);
    if (!files.length) {
        return {
            emptyHtml: '<div class="xb-empty">还没有书稿文件</div>',
            groups: [],
        };
    }
    const grouped = new Map();
    files.forEach((file) => {
        const group = getFileGroup(file.path);
        if (!grouped.has(group.key)) {
            grouped.set(group.key, {
                key: group.key,
                title: group.title,
                description: group.description,
                badge: group.badge,
                basePath: group.basePath,
                files: [],
            });
        }
        grouped.get(group.key).files.push(file);
    });

    const primarySections = STUDIO_FILE_SECTIONS.map((section) => ({
        ...section,
        files: grouped.get(section.key)?.files || [],
    }));
    const knownKeys = new Set(STUDIO_FILE_SECTIONS.map((section) => section.key));
    const otherSections = [...grouped.values()].filter((group) => !knownKeys.has(group.key));
    const writeActionAttr = options.writeActionAttr || '';

    return {
        emptyHtml: '',
        groups: [...primarySections, ...otherSections].map((group) => {
            const displayFiles = group.key === 'chapters' && state.chapterSortDescending
                ? [...group.files].reverse()
                : group.files;
            const staticSignature = [
                group.key,
                group.title,
                group.description,
                group.badge,
                group.key === 'chapters' && state.chapterSortDescending ? 'desc' : 'asc',
                group.key === 'sources' ? writeActionAttr : '',
            ].join(':');
            const badgeHtml = renderFileGroupBadge(group, state);
            const filesHtml = renderSectionFiles(group, displayFiles, state);
            const fileModels = displayFiles.map((file) => {
                const active = file.path === state.selectedPath;
                const title = formatFileTitle(file.path);
                const signature = getStudioFileSignature(file);
                return {
                    path: file.path,
                    title,
                    active,
                    signature,
                    html: `
                        <button class="xb-file${active ? ' is-active' : ''}" data-path="${escapeHtml(file.path)}" data-file-signature="${escapeHtml(signature)}">
                            <span class="xb-file-main">${escapeHtml(title)}</span>
                        </button>
                    `,
                };
            });
            return {
                key: group.key,
                title: group.title,
                description: group.description,
                badge: group.badge,
                staticSignature,
                scaffoldHtml: `
                    <div class="xb-file-group" data-file-group-key="${escapeHtml(group.key)}" data-file-static-signature="${escapeHtml(staticSignature)}">
                        <div class="xb-file-group-title">
                            <span>${escapeHtml(group.title)}</span>
                            ${badgeHtml}
                        </div>
                        <div class="xb-file-group-desc">${escapeHtml(group.description)}</div>
                        ${group.key === 'sources' ? renderImportActions(writeActionAttr) : ''}
                        ${group.key === 'sources' ? '<div class="xb-section-subtitle">已导入</div>' : ''}
                    </div>
                `,
                emptyHtml: `<div class="xb-section-empty" data-file-group-empty="true">${escapeHtml(group.empty || '这里还没有文件。')}</div>`,
                treeHtml: filesHtml,
                files: fileModels,
                html: `
                    <div class="xb-file-group" data-file-group-key="${escapeHtml(group.key)}" data-file-static-signature="${escapeHtml(staticSignature)}">
                        <div class="xb-file-group-title">
                            <span>${escapeHtml(group.title)}</span>
                            ${badgeHtml}
                        </div>
                        <div class="xb-file-group-desc">${escapeHtml(group.description)}</div>
                        ${group.key === 'sources' ? renderImportActions(writeActionAttr) : ''}
                        ${group.key === 'sources' ? '<div class="xb-section-subtitle">已导入</div>' : ''}
                        ${filesHtml}
                    </div>
                `,
            };
        }),
    };
}

export function renderStudioFileSections(state = {}, options = {}) {
    const model = collectStudioFileSectionModels(state, options);
    if (model.emptyHtml) return model.emptyHtml;
    return model.groups.map((group) => group.html).join('');
}

function createAgentRenderUnit(key = '', signature = '', buildHtml = undefined) {
    const htmlFallback = String(buildHtml === undefined ? signature : buildHtml || '');
    const build = typeof buildHtml === 'function' ? buildHtml : () => htmlFallback;
    return {
        key: String(key || ''),
        signature: `${String(key || '')}:${String(signature || '')}`,
        buildHtml: build,
        get html() {
            return build();
        },
    };
}

function withAgentRenderUnitKey(html = '', key = '') {
    const safeKey = escapeHtml(key);
    const text = String(html || '');
    if (!safeKey || /^\s*<[a-zA-Z][^>]*\sdata-agent-unit-key=/.test(text)) return text;
    if (/^\s*<details\b/.test(text)) {
        return text.replace(/(<summary\b(?![^>]*\sdata-agent-unit-key=)[^>]*)(>)/, `$1 data-agent-unit-key="${safeKey}"$2`);
    }
    return text.replace(/^(\s*<[a-zA-Z][^>]*?)(\s*\/?>)/, `$1 data-agent-unit-key="${safeKey}"$2`);
}

function getThoughtsSignature(message = {}) {
    const thoughts = Array.isArray(message.thoughts) ? message.thoughts : [];
    if (!thoughts.length) return 'thoughts:0';
    const text = thoughts.map((item) => [
        item?.kind || '',
        item?.summary || '',
        item?.text || '',
        item?.content || '',
    ].join('|')).join('\n');
    return `thoughts:${thoughts.length}:${getCachedTextSignature(message, 'thoughts', text)}`;
}

function getMessageRenderSignature(message = {}, messageIndex = 0, state = {}) {
    const content = String(message.content || '');
    const isEditing = ['user', 'assistant'].includes(message.role) && state.editingMessageIndex === messageIndex;
    const feedback = state.messageActionFeedback || {};
    const feedbackSignature = [
        feedback[`copy:${messageIndex}`] || '',
        feedback[`edit:${messageIndex}`] || '',
        feedback[`reroll:${messageIndex}`] || '',
        feedback[`delete:${messageIndex}`] || '',
    ].join(',');
    return [
        getRenderObjectId(message),
        message.role || '',
        message.streaming ? 'streaming' : 'done',
        message.error ? 'error' : '',
        isEditing ? 'editing' : '',
        getCachedTextSignature(message, 'content', content),
        getThoughtsSignature(message),
        Array.isArray(state.openThoughtKeys) ? state.openThoughtKeys.join('|') : '',
        feedbackSignature,
    ].join(':');
}

function getToolRunSignature(batches = [], turnKey = '', state = {}, isOpen = false, autoOpen = false) {
    const parts = batches.map((batch) => {
        const assistantMessage = batch.assistantMessage || {};
        const toolMessages = Array.isArray(batch.toolMessages) ? batch.toolMessages : [];
        return [
            getMessageRenderSignature(assistantMessage, 0, state),
            toolMessages.map((message) => [
                getRenderObjectId(message),
                message.toolName || '',
                getCachedTextSignature(message, 'content', message.content || ''),
                getCachedTextSignature(message, 'toolDisplay', JSON.stringify(message.toolDisplay || null)),
            ].join(':')).join(','),
        ].join('|');
    }).join('||');
    return [
        turnKey,
        isOpen ? 'open' : 'folded',
        autoOpen ? 'auto' : 'manual',
        Array.isArray(state.openThoughtKeys) ? state.openThoughtKeys.join('|') : '',
        parts,
    ].join(':');
}

export function collectAgentRenderUnits(state = {}) {
    const messages = Array.isArray(state.messages) ? state.messages : [];
    const units = [];

    const renderMessageActions = (message = {}, messageIndex = 0) => {
        const canAct = ['user', 'assistant'].includes(message.role)
            && !message.streaming
            && String(message.content || '').trim()
            && !(Array.isArray(message.toolCalls) && message.toolCalls.length);
        if (!canAct) return '';
        const isEditing = state.editingMessageIndex === messageIndex;
        const actionFeedback = state.messageActionFeedback || {};
        const actionDefs = isEditing
            ? [
                { action: 'save-edit', label: '✓', title: '保存这条消息的修改' },
                { action: 'cancel-edit', label: '✕', title: '取消本次修改' },
            ]
            : [
                {
                    action: 'copy',
                    label: actionFeedback[`copy:${messageIndex}`] === 'success'
                        ? '✓'
                        : actionFeedback[`copy:${messageIndex}`] === 'error'
                            ? '!'
                            : '⧉',
                    title: '复制整条消息',
                },
                { action: 'edit', label: '✎', title: '编辑这条消息' },
                { action: 'reroll', label: '↻', title: '从这里重新生成后续回复' },
                { action: 'delete', label: '🗑', title: '删除这条消息' },
            ];
        return `
            <div class="xb-msg-actions">
                ${actionDefs.map((item) => `
                    <button type="button" class="xb-msg-action" data-message-action="${escapeHtml(item.action)}" data-message-index="${messageIndex}" title="${escapeHtml(item.title)}" aria-label="${escapeHtml(item.title)}">${escapeHtml(item.label)}</button>
                `).join('')}
            </div>
        `;
    };

    const renderPlainMessage = (message = {}, messageIndex = 0) => {
        const isEditing = ['user', 'assistant'].includes(message.role) && state.editingMessageIndex === messageIndex;
        const content = String(message.content || '').trim();
        return `
            <div class="xb-msg xb-msg-${escapeHtml(message.role)}${message.error ? ' is-error' : ''}${message.streaming ? ' is-streaming' : ''}${isEditing ? ' is-editing' : ''}" data-message-index="${messageIndex}">
                <div class="xb-msg-head">
                    <div class="xb-msg-role">${message.role === 'user' ? '你' : '电纸书'}</div>
                    ${renderMessageActions(message, messageIndex)}
                </div>
                ${isEditing ? '' : renderThoughtDetails(message, {
                    key: `thought-message:${messageIndex}`,
                    openThoughtKeys: state.openThoughtKeys,
                })}
                ${isEditing ? `
                    <div class="xb-msg-editor-wrap">
                        <textarea class="xb-msg-editor" data-message-editor="${messageIndex}" rows="${Math.min(Math.max(content.split('\n').length, 4), 14)}">${escapeHtml(content)}</textarea>
                    </div>
                ` : (content ? `<div class="xb-msg-content xb-msg-markdown xb-assistant-markdown">${renderMessageMarkdownHtml(content)}</div>` : '')}
            </div>
        `;
    };

    const renderToolRun = (startIndex = 0) => {
        const batches = [];
        let index = startIndex;
        while (
            index < messages.length
            && messages[index]?.role === 'assistant'
            && Array.isArray(messages[index].toolCalls)
            && messages[index].toolCalls.length
        ) {
            const assistantMessage = messages[index];
            const toolMessages = [];
            let nextIndex = index + 1;
            while (nextIndex < messages.length && messages[nextIndex]?.role === 'tool') {
                toolMessages.push(messages[nextIndex]);
                nextIndex += 1;
            }
            batches.push({ assistantMessage, toolMessages });
            index = nextIndex;
        }
        const turnKey = buildToolTurnKey(batches, startIndex);
        const autoOpen = shouldAutoOpenActiveToolTurn(state, startIndex);
        const isOpen = autoOpen
            || (Array.isArray(state.openToolTurnKeys) && state.openToolTurnKeys.includes(turnKey));
        const autoOpenAttr = autoOpen ? ' data-auto-open-tool-turn="true"' : '';
        const lazyAttr = isOpen ? '' : ' data-lazy-tool-turn="true"';
        const openAttr = isOpen ? ' open' : '';
        const toolCount = batches.reduce((sum, batch) => (
            sum + (batch.toolMessages.length || batch.assistantMessage.toolCalls.length || 0)
        ), 0);
        const buildToolBodyHtml = () => {
            const previewHtml = batches.map((batch) => [
                renderToolPrefacePreview(batch.assistantMessage),
                batch.toolMessages.map((toolMessage) => renderStoredToolPreview(toolMessage)).join(''),
            ].filter(Boolean).join('')).join('');
            return isOpen
                ? `
                    <div class="xb-tool-trace-body" data-tool-detail-mode="full">
                        ${batches.map((batch, batchIndex) => `
                            <div class="xb-tool-round">
                                <div class="xb-tool-round-title">第 ${batchIndex + 1} 轮 · ${batch.toolMessages.length || batch.assistantMessage.toolCalls.length} 个工具</div>
                                ${renderThoughtDetails(batch.assistantMessage, {
                                    key: `${turnKey}:thought:${batchIndex + 1}`,
                                    openThoughtKeys: state.openThoughtKeys,
                                })}
                                ${String(batch.assistantMessage.content || '').trim() ? `<div class="xb-tool-preface xb-tool-preface-markdown xb-assistant-markdown">${renderMessageMarkdownHtml(batch.assistantMessage.content)}</div>` : ''}
                                ${batch.toolMessages.map((toolMessage) => renderStoredToolMessage(toolMessage)).join('')}
                            </div>
                        `).join('')}
                    </div>
                `
                : `
                    <div class="xb-tool-trace-body xb-tool-trace-preview" data-tool-detail-mode="preview">
                        ${previewHtml || `<div class="xb-tool-lazy-note">展开查看 ${toolCount || 0} 个工具结果</div>`}
                        <div class="xb-tool-lazy-note">展开查看思考、说明和完整工具轮次</div>
                    </div>
                `;
        };
        return {
            unit: createAgentRenderUnit(
                `tool:${turnKey}`,
                getToolRunSignature(batches, turnKey, state, isOpen, autoOpen),
                () => `
                    <details class="xb-tool-trace xb-tool-turn" data-tool-turn-key="${escapeHtml(turnKey)}"${autoOpenAttr}${lazyAttr}${openAttr}>
                        <summary><span>已创作 ${batches.length || 1} 轮</span><span class="xb-tool-fold-indicator" aria-hidden="true"></span></summary>
                        ${buildToolBodyHtml()}
                    </details>
                `,
            ),
            nextIndex: index,
        };
    };

    for (let index = 0; index < messages.length; index += 1) {
        const message = messages[index];
        if (!message || !['user', 'assistant', 'tool'].includes(message.role)) continue;
        if (message.role === 'assistant' && Array.isArray(message.toolCalls) && message.toolCalls.length) {
            const unit = renderToolRun(index);
            units.push(unit.unit);
            index = unit.nextIndex - 1;
            continue;
        }
        if (message.role === 'tool') continue;
        units.push(createAgentRenderUnit(
            `message:${index}`,
            getMessageRenderSignature(message, index, state),
            () => renderPlainMessage(message, index),
        ));
    }

    const hasLiveToolTurn = !!(state.isBusy && Array.isArray(state.toolTrace) && state.toolTrace.length);
    if (!units.length && !hasLiveToolTurn) {
        return [
            createAgentRenderUnit('empty', '<div class="xb-agent-empty">这里是写作助手记录。可以先导入资料，也可以直接说“我想试试写一本书”。</div>'),
        ].filter(Boolean);
    }
    const messageWindow = getMessageWindow(state, units.length, {
        preserveStartOnGrow: state.agentAutoScroll === false,
    });
    const historyGate = messageWindow.hiddenBefore
        ? createAgentRenderUnit(
            `history-gate:${messageWindow.hiddenBefore}`,
            `<div class="xb-agent-history-gate">较早记录 ${messageWindow.hiddenBefore} 条</div>`,
        )
        : null;
    const liveTraceSignature = hasLiveToolTurn
        ? getCachedTextSignature(state, 'liveToolTurn', JSON.stringify({
            trace: (state.toolTrace || []).slice(-8),
            live: state.liveToolTurn || null,
            openThoughtKeys: state.openThoughtKeys || [],
        }))
        : '';
    const liveToolTurn = hasLiveToolTurn
        ? createAgentRenderUnit('live-tool-turn', liveTraceSignature, () => renderLiveToolTurn(state))
        : null;
    return [
        historyGate,
        ...units.slice(messageWindow.startIndex),
        liveToolTurn,
    ].filter(Boolean);
}

export function renderAgentMessages(state = {}) {
    return collectAgentRenderUnits(state).map((unit) => withAgentRenderUnitKey(unit.html, unit.key)).join('');
}

export function countMessageWindowUnits(messages = []) {
    let count = 0;
    for (let index = 0; index < messages.length; index += 1) {
        const message = messages[index];
        if (!message || !['user', 'assistant', 'tool'].includes(message.role)) continue;
        if (message.role === 'assistant' && Array.isArray(message.toolCalls) && message.toolCalls.length) {
            count += 1;
            let nextIndex = index;
            while (
                nextIndex < messages.length
                && messages[nextIndex]?.role === 'assistant'
                && Array.isArray(messages[nextIndex].toolCalls)
                && messages[nextIndex].toolCalls.length
            ) {
                nextIndex += 1;
                while (nextIndex < messages.length && messages[nextIndex]?.role === 'tool') {
                    nextIndex += 1;
                }
            }
            index = nextIndex - 1;
            continue;
        }
        if (message.role === 'tool') continue;
        count += 1;
    }
    return count;
}

function renderLiveToolTurn(state = {}) {
    const traceItems = Array.isArray(state.toolTrace) ? state.toolTrace.slice(-8) : [];
    if (!traceItems.length) return '';
    const assistantMessage = state.liveToolTurn && typeof state.liveToolTurn === 'object'
        ? state.liveToolTurn
        : {
            role: 'assistant',
            content: '',
            thoughts: [],
            toolCalls: traceItems.map((item, index) => ({
                id: String(item.id || `live-tool-${index}`),
                name: String(item.name || ''),
                arguments: '{}',
            })),
        };
    const rounds = new Set(state.toolTrace.map((item) => Number(item.round) || 1)).size || 1;
    const turnKey = buildToolTurnKey([{ assistantMessage }], 'live');
    return `
        <details class="xb-tool-trace xb-tool-turn xb-tool-turn-live" data-tool-turn-key="${escapeHtml(turnKey)}" data-auto-open-tool-turn="true" open>
            <summary><span>正在创作 ${rounds} 轮</span><span class="xb-tool-fold-indicator" aria-hidden="true"></span></summary>
            <div class="xb-tool-trace-body">
                <div class="xb-tool-round">
                    <div class="xb-tool-round-title">当前工具轮</div>
                    ${renderThoughtDetails(assistantMessage, {
                        key: `${turnKey}:thought:live`,
                        openThoughtKeys: state.openThoughtKeys,
                    })}
                    ${String(assistantMessage.content || '').trim() ? `<div class="xb-tool-preface xb-tool-preface-markdown xb-assistant-markdown">${renderMessageMarkdownHtml(assistantMessage.content)}</div>` : ''}
                    ${traceItems.map((item) => renderLiveToolTraceItem(item)).join('')}
                </div>
            </div>
        </details>
    `;
}

function renderDraftStats(state = {}) {
    return formatDraftMetrics(state.editorContent || '');
}

export function renderSettingsDialog(state = {}) {
    if (!state.isSettingsOpen) return '';
    return `
        <div class="xb-ebook-settings-overlay" id="xb-agent-settings-overlay">
            <div class="xb-ebook-settings-dialog" role="dialog" aria-modal="true" aria-labelledby="xb-agent-settings-title">
                <div class="xb-ebook-settings-head">
                    <div>
                        <h2 id="xb-agent-settings-title">API配置</h2>
                        <p>在这里填写 API 和模型。</p>
                    </div>
                    <button id="xb-agent-settings-close" type="button" title="关闭配置" aria-label="关闭配置">关闭</button>
                </div>
                <div class="xb-ebook-settings-body">
                    ${buildAgentSettingsPanelMarkup({
                        configSave: state.configSave,
                        runtimeText: '',
                        showInlineToast: false,
                        showAssistantPermissions: false,
                        activePage: state.configPage,
                        delegatePresetHint: '电纸书审稿分身会使用这里的独立 API 配置；可以和主助手使用不同 Provider、Base URL、模型和 Tool 调用格式。',
                        isBusy: state.isBusy,
                        canDeletePreset: (state.config?.presetNames || []).length > 1,
                    })}
                </div>
            </div>
        </div>
    `;
}

function renderStudioShell(options = {}) {
    const state = options.state || {};
    const providerConfig = options.providerConfig || {};
    const dirty = !!options.dirty;
    const readiness = renderProviderReadiness(providerConfig);
    const writeActionAttr = state.isBusy ? 'disabled' : '';
    const agentActionAttr = (state.isBusy || !readiness.canRun) ? 'disabled' : '';
    const agentInputAttr = (!state.isBusy && !readiness.canRun) ? 'disabled' : '';
    const sendButtonAttr = state.isCancellingRun || (!state.isBusy && !readiness.canRun) ? 'disabled' : '';
    const agentInputDraft = String(state.agentInputDraft || '');
    const canClearConversation = !!state.messages?.length;
    const layoutClass = ['focus-editor', 'focus-agent'].includes(state.studioLayout)
        ? state.studioLayout
        : 'balanced';
    const themeClass = state.colorTheme === 'light' ? 'theme-light' : 'theme-dark';
    const themeToggleIcon = renderThemeToggleIcon(state.colorTheme);
    const themeToggleTitle = state.colorTheme === 'light' ? '切换为深色视觉' : '切换为白底黑字';
    const drawStatus = state.drawStatus || {};
    const drawIsChapter = isChapterPath(state.selectedPath);
    const drawReady = !!drawStatus.enabled && !!drawStatus.ready;
    const canDrawChapter = !!(state.isDrawingChapter || (
        !state.isBusy
        && drawIsChapter
        && drawReady
        && stripEbookImageMarkers(state.editorContent)
    ));
    const drawDisabledAttr = canDrawChapter ? '' : 'disabled';
    const drawTitle = state.isDrawingChapter
        ? '停止当前章节配图'
        : !drawIsChapter
        ? '只有正文章节可以配图'
        : !drawReady
            ? '画图后端未启用'
            : !stripEbookImageMarkers(state.editorContent)
                ? '当前章节没有正文'
                : '为当前章节生成配图';
    const drawButtonText = state.isDrawingChapter ? '停止' : '配图';
    const drawProgressText = state.drawProgressText ? ` · ${state.drawProgressText}` : '';

    return `
        <div class="xb-ebook-shell xb-studio-shell ${escapeHtml(layoutClass)} ${escapeHtml(themeClass)}">
            <header class="xb-mobile-studio-topbar">
                <div class="xb-mobile-segment" aria-label="工作台视图">
                    <span class="xb-mobile-segment-slider"></span>
                    <button type="button" class="xb-mobile-segment-button${layoutClass !== 'focus-agent' ? ' is-active' : ''}" data-studio-layout="focus-editor">编辑</button>
                    <button type="button" class="xb-mobile-segment-button${layoutClass === 'focus-agent' ? ' is-active' : ''}" data-studio-layout="focus-agent">助手</button>
                </div>
                <div class="xb-mobile-agent-actions">
                    <button type="button" class="xb-mobile-agent-action" data-entry-link title="返回书本入口" aria-label="返回书本入口">↩</button>
                    <button type="button" class="xb-mobile-agent-action" data-theme-toggle title="${escapeHtml(themeToggleTitle)}" aria-label="${escapeHtml(themeToggleTitle)}">${themeToggleIcon}</button>
                    <button type="button" class="xb-mobile-agent-action" id="xb-agent-close-mobile" title="退出电纸书" aria-label="退出电纸书">${renderExitIcon()}</button>
                </div>
            </header>
            <button class="xb-mobile-file-drawer-scrim" type="button" data-mobile-file-drawer-close title="收起目录" aria-label="收起目录"></button>
            <aside class="xb-sidebar">
                <button class="xb-mobile-drawer-handle" type="button" data-mobile-file-drawer-close title="收起目录" aria-label="收起目录"></button>
                <div class="xb-brand">
                    <div class="xb-title-row">
                        <h1>${escapeHtml(state.book?.title || '未命名书稿')}</h1>
                        <button class="xb-icon-button" data-book-rename title="修改书名" aria-label="修改书名" ${state.isBusy ? 'disabled' : ''}>✎</button>
                    </div>
                    <div class="xb-workspace-controller">
                        <button type="button" class="xb-layout-button${layoutClass === 'focus-editor' ? ' is-active' : ''}" data-studio-layout="focus-editor">编辑</button>
                        <button type="button" class="xb-layout-button${layoutClass === 'balanced' ? ' is-active' : ''}" data-studio-layout="balanced">平衡</button>
                        <button type="button" class="xb-layout-button${layoutClass === 'focus-agent' ? ' is-active' : ''}" data-studio-layout="focus-agent">助手</button>
                    </div>
                </div>
                <section class="xb-panel xb-files-panel">
                    <div class="xb-files">${renderStudioFileSections(state, { writeActionAttr })}</div>
                </section>
            </aside>
            <section class="xb-studio-workbench">
                <main class="xb-editor">
                    <header class="xb-editor-head">
                        <button id="xb-mobile-file-picker" class="xb-mobile-file-picker" type="button" title="打开文件目录" aria-label="打开文件目录">
                            <span aria-hidden="true">☰</span>
                            <strong>${escapeHtml(formatFileTitle(state.selectedPath || 'book/chapters/001.md'))}</strong>
                            <em aria-hidden="true">⌄</em>
                        </button>
                        <div class="xb-path">${escapeHtml(formatFileTitle(state.selectedPath || 'book/chapters/001.md'))}</div>
                        <div class="xb-editor-actions">
                            <button id="xb-reader-link">阅读器</button>
                            <button id="xb-library-link">书架</button>
                            <button id="xb-draw-chapter" title="${escapeHtml(drawTitle)}" ${drawDisabledAttr}>${escapeHtml(drawButtonText)}</button>
                            <button id="xb-save" ${dirty && !state.isBusy ? '' : 'disabled'}>保存</button>
                        </div>
                    </header>
                    <div class="xb-editor-body">
                        <textarea id="xb-editor-text" spellcheck="false" ${state.isBusy ? 'disabled' : ''}>${escapeHtml(state.editorContent)}</textarea>
                    </div>
                    <footer class="xb-editor-foot">
                        <div class="xb-meta" id="xb-editor-meta">${dirty ? '有未保存修改' : '已保存到书库'} · ${renderDraftStats(state)}${escapeHtml(drawProgressText)}</div>
                    </footer>
                </main>
                <aside class="xb-agent">
                    <div class="xb-agent-aurora"></div>
                    <header class="xb-agent-head">
                        <div class="xb-agent-head-main">
                            <div class="xb-agent-global-actions">
                                <button id="xb-theme-toggle" type="button" title="${escapeHtml(themeToggleTitle)}" aria-label="${escapeHtml(themeToggleTitle)}">${themeToggleIcon}</button>
                                <button id="xb-entry-link" type="button" data-entry-link title="返回书本入口" aria-label="返回书本入口">↩</button>
                                <button id="xb-agent-close" class="xb-exit-button" type="button" title="退出电纸书" aria-label="退出电纸书">${renderExitIcon()}</button>
                            </div>
                        </div>
                        <div class="xb-agent-toolbar">
                            <div class="xb-agent-context-meter" title="${escapeHtml(renderConversationContextMeterTitle(state, providerConfig))}">${escapeHtml(renderConversationContextMeterLabel(state, providerConfig))}</div>
                            <button id="xb-agent-clear" type="button" ${state.isBusy || !canClearConversation ? 'disabled' : ''}>清空对话</button>
                            <button id="xb-agent-open-settings" type="button">API配置</button>
                        </div>
                    </header>
                    <div class="xb-agent-chat-wrap">
                        <div class="xb-agent-main${state.isBusy ? ' is-busy' : ''}">
                            <details class="xb-actions-panel">
                                <summary>创作入口</summary>
                                <div class="xb-actions">
                                    <button data-action="start-book" ${agentActionAttr}>聊新书</button>
                                    <button data-action="spine" ${agentActionAttr}>建书脊</button>
                                    <button data-action="style-plan" ${agentActionAttr}>定写法</button>
                                    <button data-action="organize" ${agentActionAttr}>整理资料</button>
                                    <button data-action="outline" ${agentActionAttr}>搭大纲</button>
                                    <button data-action="volume-plan" ${agentActionAttr}>定当前卷</button>
                                    <button data-action="next-chapter" ${agentActionAttr}>按指挥写</button>
                                    <button data-action="opening-options" ${agentActionAttr}>试写开场</button>
                                </div>
                            </details>
                            <div class="xb-agent-log">${renderAgentMessages(state)}</div>
                        </div>
                        <div class="xb-agent-scroll-helpers" id="xb-agent-scroll-helpers">
                            <button id="xb-agent-scroll-top" type="button" class="xb-agent-scroll-btn" title="回到顶部" aria-label="回到顶部">▲</button>
                            <button id="xb-agent-scroll-bottom" type="button" class="xb-agent-scroll-btn" title="回到底部" aria-label="回到底部">▼</button>
                        </div>
                        ${renderProtocolNotice(state)}
                        ${renderCompactionOverlay(state)}
                    </div>
                    <form id="xb-agent-form" class="xb-agent-form">
                        <div class="xb-agent-compose-row">
                            <div class="xb-agent-compose-main">
                                <textarea id="xb-agent-input" placeholder="${readiness.canRun ? '写作指令，例如：把当前段落改得更克制一点，或者先列三种开场方案' : '先补好 API 和模型信息'}" ${agentInputAttr}>${escapeHtml(agentInputDraft)}</textarea>
                                <div class="xb-compose-hint" id="xb-compose-hint">Enter 发送 · Shift+Enter 换行</div>
                            </div>
                            <div class="xb-agent-compose-actions">
                                <button type="submit" class="${state.isBusy ? 'is-busy' : ''}" title="${state.isCancellingRun ? '正在停止' : state.isBusy ? '停止' : '发送'}" aria-label="${state.isCancellingRun ? '正在停止' : state.isBusy ? '停止' : '发送'}" ${sendButtonAttr}>${state.isCancellingRun ? '…' : state.isBusy ? '■' : '➤'}</button>
                            </div>
                        </div>
                    </form>
                </aside>
            </section>
            ${renderSettingsDialog(state)}
            ${state.toast ? `<div class="xb-toast">${escapeHtml(state.toast)}</div>` : ''}
        </div>
    `;
}

function renderReaderChapterButtons(chapters = [], activePath = '') {
    if (!chapters.length) return '<div class="xb-empty">还没有正文</div>';
    return chapters.map((chapter, chapterIndex) => `
        <button class="xb-reader-chapter${chapter.path === activePath ? ' is-active' : ''}" data-reader-path="${escapeHtml(chapter.path)}">
            <span>${escapeHtml(formatFileTitle(chapter.path))}</span>
            <small>${chapterIndex + 1}</small>
        </button>
    `).join('');
}

function normalizeReaderHeadingText(text = '') {
    return String(text || '')
        .replace(/[*_`~]/g, '')
        .replace(/[《》「」『』“”"'\s]/g, '')
        .replace(/[。.!！?？：:；;、，,]+$/g, '')
        .replace(/^第0*(\d+)章$/i, '第$1章')
        .trim();
}

function isDuplicateReaderChapterHeading(block = '', chapterTitle = '') {
    const match = String(block || '').match(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/);
    if (!match) return false;
    const heading = normalizeReaderHeadingText(match[1]);
    const title = normalizeReaderHeadingText(chapterTitle);
    return !!heading && !!title && heading === title;
}

function renderReaderTextContent(content = '', options = {}) {
    const normalized = String(content || '').trim();
    if (!normalized) return '';
    const markerRegex = /\[ebook-image:([a-z0-9\-_]+)\]/gi;
    const parts = [];
    let lastIndex = 0;
    let paragraphIndex = 0;

    const pushText = (text = '') => {
        String(text || '')
            .split(/\n{2,}/)
            .map((block) => block.trim())
            .filter(Boolean)
            .forEach((block) => {
                if (paragraphIndex === 0 && isDuplicateReaderChapterHeading(block, options.chapterTitle)) return;
                parts.push(renderReaderMarkdownBlock(block, paragraphIndex));
                paragraphIndex += 1;
            });
    };

    let match;
    while ((match = markerRegex.exec(normalized)) !== null) {
        pushText(normalized.slice(lastIndex, match.index));
        const slotId = match[1] || '';
        parts.push(`
            <figure class="xb-reader-image" data-ebook-image-slot="${escapeHtml(slotId)}">
                <div class="xb-reader-image-placeholder">配图加载中</div>
            </figure>
        `);
        lastIndex = markerRegex.lastIndex;
    }
    pushText(normalized.slice(lastIndex));
    return parts.join('');
}

function renderReaderShell(options = {}) {
    const state = options.state || {};
    const { chapters, active, activePath, index } = getActiveChapter(state);
    const hasChapters = chapters.length > 0;
    const previous = index > 0 ? chapters[index - 1] : null;
    const next = index < chapters.length - 1 ? chapters[index + 1] : null;
    const progress = hasChapters ? `第 ${index + 1} / ${chapters.length} 章` : '暂无章节';
    const content = active?.content || '';
    const chapterProgress = hasChapters ? Math.round(((index + 1) / chapters.length) * 100) : 0;
    const themeClass = state.colorTheme === 'light' ? 'theme-light' : 'theme-dark';
    const themeToggleIcon = renderThemeToggleIcon(state.colorTheme);
    const themeToggleTitle = state.colorTheme === 'light' ? '切换为深色视觉' : '切换为白底黑字';
    const ttsStatus = state.readerTtsStatus || {};
    const ttsPlayback = state.readerTtsPlayback || {};
    const ttsActive = ['loading', 'playing'].includes(String(ttsPlayback.status || ''));
    const ttsReady = !!ttsStatus.enabled && !!ttsStatus.ready;
    const ttsCanClick = ttsActive || (hasChapters && ttsReady);
    const ttsDisabledAttr = ttsCanClick ? '' : 'disabled';
    const ttsTitle = ttsActive
        ? '停止朗读'
        : !hasChapters
            ? '还没有可朗读章节'
            : !ttsReady
                ? 'TTS 语音模块未启用'
                : '播放当前章节';
    const ttsLabel = ttsActive ? '■' : '▶';

    return `
        <div class="xb-ebook-screen xb-reader-screen ${escapeHtml(themeClass)}">
            <div class="xb-reader-backlight"></div>
            <nav class="xb-reader-edge" aria-label="阅读器操作">
                <div class="xb-reader-edge-actions">
                    <button class="xb-reader-edge-button" id="xb-entry-link" title="返回入口" aria-label="返回入口">←</button>
                    <button class="xb-reader-edge-button xb-reader-index-toggle" id="xb-reader-index-toggle" type="button" title="目录" aria-label="目录">☰</button>
                    <button class="xb-reader-edge-button xb-reader-tts-toggle${ttsActive ? ' is-active' : ''}" id="xb-reader-tts-toggle" type="button" title="${escapeHtml(ttsTitle)}" aria-label="${escapeHtml(ttsTitle)}" ${ttsDisabledAttr}>${escapeHtml(ttsLabel)}</button>
                    <button class="xb-reader-edge-button xb-reader-theme-toggle" id="xb-theme-toggle" type="button" title="${escapeHtml(themeToggleTitle)}" aria-label="${escapeHtml(themeToggleTitle)}">${themeToggleIcon}</button>
                </div>
                <div class="xb-reader-progress" title="${escapeHtml(progress)}" style="--xb-reader-progress:${chapterProgress}%"><span></span></div>
            </nav>
            <main class="xb-reader-main">
                <aside class="xb-reader-nav">
                    <div class="xb-reader-index-title">目录</div>
                    <div class="xb-reader-chapters">
                        ${renderReaderChapterButtons(chapters, activePath)}
                    </div>
                </aside>
                <article class="xb-reader-paper">
                    ${hasChapters ? `
                        <header class="xb-reader-head">
                            <div>
                                <div class="xb-kicker">${escapeHtml(state.book?.title || '未命名书稿')} · ${escapeHtml(progress)}</div>
                                <h2>${escapeHtml(formatFileTitle(activePath))}</h2>
                                <p>${escapeHtml(formatTextMetrics(content))}</p>
                            </div>
                        </header>
                        <div class="xb-reader-content">${renderReaderTextContent(content, { chapterTitle: formatFileTitle(activePath) })}</div>
                        <footer class="xb-reader-foot">
                            <button data-reader-path="${escapeHtml(previous?.path || '')}" ${previous ? '' : 'disabled'}>上一章</button>
                            <button data-reader-path="${escapeHtml(next?.path || '')}" ${next ? '' : 'disabled'}>下一章</button>
                        </footer>
                    ` : `
                        <div class="xb-reader-empty">
                            <h2>还没有正文</h2>
                            <p>去创作台写下第一章，再回来阅读。</p>
                            <button id="xb-studio-empty-link">去创作台</button>
                        </div>
                    `}
                </article>
            </main>
            <button class="xb-reader-toc-scrim" id="xb-reader-index-scrim" type="button" title="收起目录" aria-label="收起目录"></button>
            <aside class="xb-reader-toc-sheet" aria-label="章节目录">
                <button class="xb-reader-toc-handle" id="xb-reader-index-close" type="button" title="收起目录" aria-label="收起目录"></button>
                <div class="xb-reader-index-title">目录</div>
                <div class="xb-reader-chapters">
                    ${renderReaderChapterButtons(chapters, activePath)}
                </div>
            </aside>
            ${state.toast ? `<div class="xb-toast">${escapeHtml(state.toast)}</div>` : ''}
        </div>
    `;
}

export function renderEbookShell(options = {}) {
    const state = options.state || {};
    switch (state.viewMode) {
        case 'book-entry':
            return renderBookEntryShell(options);
        case 'studio':
            return renderStudioShell(options);
        case 'reader':
            return renderReaderShell(options);
        case 'library':
        default:
            return renderLibraryShell(options);
    }
}
