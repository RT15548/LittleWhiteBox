import { getContext } from "../../../../../../extensions.js";
import {
    getDisplayPreviewForSlot,
    getPreviewsBySlot,
} from "./gallery-cache.js";
import { LLMServiceError } from "./scene-planner.js";

const PLACEHOLDER_REGEX = /\[image:([a-z0-9\-_]+)\]/gi;

export const ImageState = {
    PREVIEW: 'preview',
    SAVING: 'saving',
    SAVED: 'saved',
    REFRESHING: 'refreshing',
    FAILED: 'failed',
};

export const ErrorType = {
    NETWORK: { code: 'network', label: '网络', desc: '连接超时或网络不稳定' },
    AUTH: { code: 'auth', label: '认证', desc: '认证信息无效或过期' },
    QUOTA: { code: 'quota', label: '额度', desc: '额度不足' },
    BUSY: { code: 'busy', label: '繁忙', desc: '当前并发繁忙，请稍后重试' },
    PARSE: { code: 'parse', label: '解析失败', desc: 'LLM 输出未解析为图片任务' },
    LLM: { code: 'llm', label: 'LLM失败', desc: '场景分析失败' },
    LLM_EMPTY: { code: 'llm_empty', label: '空回', desc: 'LLM 未返回内容' },
    TIMEOUT: { code: 'timeout', label: '超时', desc: '请求超时' },
    UNKNOWN: { code: 'unknown', label: '错误', desc: '未知错误' },
    CACHE_LOST: { code: 'cache_lost', label: '缓存丢失', desc: '图片缓存已过期' },
};

export const DEFAULT_MESSAGE_FILTER_RULES = [
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

export function createPlaceholder(slotId) {
    return `[image:${slotId}]`;
}

export function joinTags(...parts) {
    return parts
        .filter(Boolean)
        .map(p => String(p).trim().replace(/[，、]/g, ',').replace(/^,+|,+$/g, ''))
        .filter(p => p.length > 0)
        .join(', ');
}

export function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeRegexChars(str) {
    return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function applyMessageFilterRules(text, rules) {
    if (!Array.isArray(rules) || !rules.length) return text;
    let result = String(text);
    for (const { start, end } of rules) {
        const s = (start || '').trim();
        const e = (end || '').trim();
        if (!s && !e) continue;
        if (s && e) {
            result = result.replace(new RegExp(escapeRegexChars(s) + '[\\s\\S]*?' + escapeRegexChars(e), 'gi'), '');
        } else if (s) {
            const idx = result.toLowerCase().indexOf(s.toLowerCase());
            if (idx >= 0) result = result.slice(0, idx);
        } else {
            const idx = result.toLowerCase().indexOf(e.toLowerCase());
            if (idx >= 0) result = result.slice(idx + e.length);
        }
    }
    return result.trim();
}

function normalizeCharacterOutfits(outfits = []) {
    return (Array.isArray(outfits) ? outfits : [])
        .map(outfit => ({
            name: String(outfit?.name || '').trim(),
            tags: String(outfit?.tags || '').trim(),
        }))
        .filter(outfit => outfit.name || outfit.tags);
}

function formatDanbooruTag(tag, options = {}) {
    const value = String(tag || '').trim();
    return options.preserveDanbooruCanonical ? value : value.replace(/_/g, ' ');
}

function buildKnownCharacterBasePrompt(character = {}, options = {}) {
    const danbooruTag = character.danbooruTag ? formatDanbooruTag(character.danbooruTag, options) : '';
    return joinTags(danbooruTag, character.type, character.appearance);
}

const GRID_COL = { A: 0.1, B: 0.3, C: 0.5, D: 0.7, E: 0.9 };
const GRID_ROW = { 1: 0.1, 2: 0.3, 3: 0.5, 4: 0.7, 5: 0.9 };

function gridToCoord(grid) {
    if (!grid || typeof grid !== 'string') return null;
    const match = grid.trim().toUpperCase().match(/^([A-E])([1-5])$/);
    if (!match) return null;
    return { x: GRID_COL[match[1]], y: GRID_ROW[match[2]] };
}

export function detectPresentCharacters(messageText, characterTags) {
    if (!messageText || !characterTags?.length) return [];
    const text = messageText.toLowerCase();
    const present = [];

    for (const char of characterTags) {
        if (!char.name) continue;
        const names = [char.name, ...(char.aliases || [])].filter(Boolean);
        const isPresent = names.some(name => {
            const lowerName = String(name).toLowerCase();
            return text.includes(lowerName) || new RegExp(`\\b${escapeRegexChars(lowerName)}\\b`, 'i').test(text);
        });

        if (isPresent) {
            present.push({
                name: char.name,
                aliases: char.aliases || [],
                type: char.type || 'girl',
                appearance: char.appearance || '',
                danbooruTag: char.danbooruTag || '',
                negativeTags: char.negativeTags || '',
                outfits: normalizeCharacterOutfits(char.outfits),
            });
        }
    }
    return present;
}

export function assembleCharacterPrompts(sceneChars, knownCharacters, options = {}) {
    return sceneChars.map(char => {
        const charLower = String(char.name || '').toLowerCase();
        const known = knownCharacters.find(k =>
            String(k.name || '').toLowerCase() === charLower
            || (k.aliases || []).some(a => String(a || '').toLowerCase() === charLower)
        );

        if (known) {
            return {
                name: known.name || char.name,
                prompt: joinTags(buildKnownCharacterBasePrompt(known, options), char.costume, char.action, char.interact),
                uc: joinTags(known.negativeTags, char.uc),
                center: gridToCoord(char.center) || { x: 0.5, y: 0.5 },
            };
        }

        const danbooruTag = char.danbooru ? formatDanbooruTag(char.danbooru, options) : '';
        return {
            name: char.name,
            prompt: joinTags(danbooruTag, char.type, char.appear, char.costume, char.action, char.interact),
            uc: char.uc || '',
            center: gridToCoord(char.center) || { x: 0.5, y: 0.5 },
        };
    });
}

export function findLastAIMessageId() {
    const ctx = getContext();
    const chat = ctx.chat || [];
    let id = chat.length - 1;
    while (id >= 0 && chat[id]?.is_user) id--;
    return id;
}

export function findAnchorPosition(mes, anchor) {
    if (!anchor || !mes) return -1;
    const a = anchor.trim();
    let idx = mes.indexOf(a);
    if (idx !== -1) return idx + a.length;
    if (a.length > 8) {
        const short = a.slice(-10);
        idx = mes.indexOf(short);
        if (idx !== -1) return idx + short.length;
    }
    const norm = s => String(s || '').replace(/[\s，。！？、""''：；…\-\n\r]/g, '');
    const normMes = norm(mes);
    const normA = norm(a);
    if (normA.length >= 4) {
        const key = normA.slice(-6);
        const normIdx = normMes.indexOf(key);
        if (normIdx !== -1) {
            let origIdx = 0;
            let nIdx = 0;
            while (origIdx < mes.length && nIdx < normIdx + key.length) {
                if (norm(mes[origIdx]) === normMes[nIdx]) nIdx++;
                origIdx++;
            }
            return origIdx;
        }
    }
    return -1;
}

export function findNearestSentenceEnd(mes, startPos) {
    if (startPos < 0 || !mes) return startPos;
    if (startPos >= mes.length) return mes.length;

    const maxLookAhead = 80;
    const endLimit = Math.min(mes.length, startPos + maxLookAhead);
    const basicEnders = new Set(['\u3002', '\uFF01', '\uFF1F', '!', '?', '\u2026']);
    const closingMarks = new Set(['\u201D', '\u201C', '\u2019', '\u2018', '\u300D', '\u300F', '\u3011', '\uFF09', ')', '"', "'", '*', '~', '\uFF5E', ']']);

    const eatClosingMarks = (pos) => {
        while (pos < mes.length && closingMarks.has(mes[pos])) pos++;
        return pos;
    };

    if (startPos > 0 && basicEnders.has(mes[startPos - 1])) {
        return eatClosingMarks(startPos);
    }

    for (let i = 0; i < maxLookAhead && startPos + i < endLimit; i++) {
        const pos = startPos + i;
        const char = mes[pos];
        if (char === '\n') return pos + 1;
        if (basicEnders.has(char)) return eatClosingMarks(pos + 1);
        if (char === '.' && mes.slice(pos, pos + 3) === '...') return eatClosingMarks(pos + 3);
    }

    return startPos;
}

export function classifyError(error) {
    if (error instanceof LLMServiceError) {
        const code = String(error.code || '').toUpperCase();
        const message = String(error.message || '').toLowerCase();
        if (code === 'EMPTY_OUTPUT' || message.includes('输出为空') || message.includes('未返回内容')) {
            return ErrorType.LLM_EMPTY;
        }
        if (code === 'PARSE_ERROR' || message.includes('无法解析') || message.includes('未解析到图片任务')) {
            return ErrorType.PARSE;
        }
        return ErrorType.LLM;
    }
    if (error?.errorType) return error.errorType;
    const msg = String(error?.message || error || '').toLowerCase();
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) return ErrorType.NETWORK;
    if (msg.includes('401') || msg.includes('key') || msg.includes('auth')) return ErrorType.AUTH;
    if (msg.includes('429') || msg.includes('too many requests') || msg.includes('rate limit') || msg.includes('请求频繁') || msg.includes('busy')) return ErrorType.BUSY;
    if (msg.includes('402') || msg.includes('anlas') || msg.includes('quota')) return ErrorType.QUOTA;
    if (msg.includes('timeout') || msg.includes('abort')) return ErrorType.TIMEOUT;
    if (msg.includes('输出为空') || msg.includes('empty_output') || msg.includes('未返回内容')) return ErrorType.LLM_EMPTY;
    if (msg.includes('parse') || msg.includes('json')) return ErrorType.PARSE;
    if (msg.includes('无法解析') || msg.includes('未解析到图片任务')) return ErrorType.PARSE;
    if (msg.includes('llm') || msg.includes('xbgenraw')) return ErrorType.LLM;
    return { ...ErrorType.UNKNOWN, desc: error?.message || '未知错误' };
}

export function ensureDrawImageStyles() {
    if (document.getElementById('xiaobaix-draw-image-styles')) return;
    const style = document.createElement('style');
    style.id = 'xiaobaix-draw-image-styles';
    style.textContent = `
.xb-nd-img{margin:0.8em 0;text-align:center;position:relative;display:block;width:100%;border-radius:14px;padding:4px}
.xb-nd-img[data-state="preview"]{border:1px dashed rgba(255,152,0,0.35)}
.xb-nd-img[data-state="failed"]{border:1px dashed rgba(248,113,113,0.5);background:rgba(248,113,113,0.05);padding:20px}
.xb-nd-img.busy img{opacity:0.5}
.xb-nd-img-wrap{position:relative;overflow:hidden;border-radius:10px;touch-action:pan-y pinch-zoom}
.xb-nd-img img{width:auto;height:auto;max-width:100%;border-radius:10px;cursor:pointer;box-shadow:0 3px 15px rgba(0,0,0,0.25);display:block;user-select:none;-webkit-user-drag:none;transition:transform 0.25s ease,opacity 0.2s ease;will-change:transform,opacity}
.xb-nd-img img.sliding-left{animation:ndSlideOutLeft 0.25s ease forwards}
.xb-nd-img img.sliding-right{animation:ndSlideOutRight 0.25s ease forwards}
.xb-nd-img img.sliding-in-left{animation:ndSlideInLeft 0.25s ease forwards}
.xb-nd-img img.sliding-in-right{animation:ndSlideInRight 0.25s ease forwards}
@keyframes ndSlideOutLeft{from{transform:translateX(0);opacity:1}to{transform:translateX(-30%);opacity:0}}
@keyframes ndSlideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(30%);opacity:0}}
@keyframes ndSlideInLeft{from{transform:translateX(30%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes ndSlideInRight{from{transform:translateX(-30%);opacity:0}to{transform:translateX(0);opacity:1}}
.xb-nd-nav-pill{position:absolute;bottom:10px;left:10px;display:inline-flex;align-items:center;gap:2px;background:rgba(0,0,0,0.75);border-radius:20px;padding:4px 6px;font-size:12px;color:rgba(255,255,255,0.9);font-weight:500;user-select:none;z-index:5;opacity:0.85;transition:opacity 0.2s}
.xb-nd-nav-arrow{width:24px;height:24px;border:none;background:transparent;color:rgba(255,255,255,0.8);cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:14px;transition:background 0.15s,color 0.15s;padding:0}
.xb-nd-nav-arrow:hover{background:rgba(255,255,255,0.15);color:#fff}
.xb-nd-nav-arrow:disabled{opacity:0.3;cursor:not-allowed}
.xb-nd-nav-text{min-width:36px;text-align:center;font-variant-numeric:tabular-nums;padding:0 2px}
.xb-nd-menu-wrap{position:absolute;top:8px;right:8px;z-index:10}
.xb-nd-menu-wrap.busy{pointer-events:none;opacity:0.3}
.xb-nd-menu-trigger{width:32px;height:32px;border-radius:50%;border:none;background:rgba(0,0,0,0.75);color:rgba(255,255,255,0.85);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all 0.15s;opacity:0.85}
.xb-nd-menu-wrap.open .xb-nd-dropdown{display:flex;opacity:1;visibility:visible;transform:translateY(0) scale(1);pointer-events:auto}
.xb-nd-dropdown{position:absolute;top:calc(100% + 4px);right:0;background:rgba(20,20,24,0.98);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:4px;display:none;flex-direction:column;gap:2px;opacity:0;visibility:hidden;transform:translateY(-4px) scale(0.96);transform-origin:top right;transition:all 0.15s ease;box-shadow:0 8px 24px rgba(0,0,0,0.4);pointer-events:none}
.xb-nd-dropdown button{width:32px;height:32px;border:none;background:transparent;color:rgba(255,255,255,0.85);cursor:pointer;font-size:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background 0.15s;padding:0;margin:0}
.xb-nd-indicator{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.85);padding:8px 16px;border-radius:8px;color:#fff;font-size:12px;z-index:10}
.xb-nd-edit{animation:nd-slide-up 0.2s ease-out}
.xb-nd-edit-scroll{max-height:250px;overflow-y:auto;margin-bottom:8px}
.xb-nd-edit-scroll::-webkit-scrollbar{width:4px}
.xb-nd-edit-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2);border-radius:2px}
.xb-nd-edit-group{margin-bottom:8px}
.xb-nd-edit-group:last-child{margin-bottom:0}
.xb-nd-edit-group-label{font-size:10px;color:rgba(255,255,255,0.58);margin-bottom:4px}
.xb-nd-edit-input{width:100%;min-height:60px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#fff;font-size:12px;padding:8px;resize:vertical;font-family:monospace}
.xb-nd-failed-icon{color:rgba(248,113,113,0.9);font-size:24px;margin-bottom:8px}
.xb-nd-failed-title{color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:4px}
.xb-nd-failed-desc{color:rgba(255,255,255,0.4);font-size:11px;margin-bottom:12px}
.xb-nd-failed-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.xb-nd-failed-btns button{padding:8px 16px;border-radius:8px;font-size:12px;cursor:pointer;transition:all 0.15s}
.xb-nd-retry-btn{border:1px solid rgba(212,165,116,0.5);background:rgba(212,165,116,0.2);color:#fff}
.xb-nd-edit-btn{border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:#fff}
.xb-nd-remove-btn{border:1px solid rgba(248,113,113,0.3);background:transparent;color:rgba(248,113,113,0.8)}
@keyframes nd-slide-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeInOut{0%{opacity:0;transform:translateX(-50%) translateY(-10px)}15%{opacity:1;transform:translateX(-50%) translateY(0)}85%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-10px)}}
`;
    document.head.appendChild(style);
}

export function buildImageHtml({ slotId, imgId, url, tags, positive, messageId, state = ImageState.PREVIEW, historyCount = 1, currentIndex = 0 }) {
    const escapedTags = escapeHtml(tags);
    const escapedPositive = escapeHtml(positive);
    const isPreview = state === ImageState.PREVIEW;
    const isBusy = state === ImageState.SAVING || state === ImageState.REFRESHING;
    let indicator = '';
    if (state === ImageState.SAVING) indicator = '<div class="xb-nd-indicator">💾 保存中...</div>';
    else if (state === ImageState.REFRESHING) indicator = '<div class="xb-nd-indicator">🔄 生成中...</div>';

    const border = isPreview ? 'border:1px dashed rgba(255,152,0,0.35);' : '';
    const lazyAttr = String(url || '').startsWith('data:') ? '' : 'loading="lazy"';
    const displayVersion = historyCount - currentIndex;
    const navPill = `<div class="xb-nd-nav-pill" data-total="${historyCount}" data-current="${currentIndex}">
        <button class="xb-nd-nav-arrow" data-action="nav-prev" title="上一版本" ${currentIndex >= historyCount - 1 ? 'disabled' : ''}>‹</button>
        <span class="xb-nd-nav-text">${displayVersion} / ${historyCount}</span>
        <button class="xb-nd-nav-arrow" data-action="nav-next" title="${currentIndex === 0 ? '重新生成' : '下一版本'}">›</button>
    </div>`;
    const menuBusy = isBusy ? ' busy' : '';
    const menuHtml = `<div class="xb-nd-menu-wrap${menuBusy}">
        <button class="xb-nd-menu-trigger" data-action="toggle-menu" title="操作">⋮</button>
        <div class="xb-nd-dropdown">
            ${isPreview ? '<button data-action="save-image" title="保存到服务器">⬇</button>' : ''}
            <button data-action="refresh-image" title="重新生成">⟳</button>
            <button data-action="edit-tags" title="编辑TAG">✐️</button>
            <button data-action="delete-image" title="删除">✕</button>
        </div>
    </div>`;

    return `<div class="xb-nd-img ${isBusy ? 'busy' : ''}" data-slot-id="${slotId}" data-img-id="${imgId}" data-tags="${escapedTags}" data-positive="${escapedPositive}" data-mesid="${messageId}" data-state="${state}" data-current-index="${currentIndex}" data-history-count="${historyCount}" style="margin:0.8em auto;position:relative;display:block;width:fit-content;max-width:100%;${border}border-radius:14px;padding:4px;">
${indicator}
<div class="xb-nd-img-wrap" data-total="${historyCount}">
    <img src="${escapeHtml(url)}" style="max-width:100%;width:auto;height:auto;border-radius:10px;cursor:pointer;box-shadow:0 3px 15px rgba(0,0,0,0.25);${isBusy ? 'opacity:0.5;' : ''}" data-action="open-gallery" ${lazyAttr}>
    ${navPill}
</div>
${menuHtml}
<div class="xb-nd-edit" style="display:none;position:absolute;bottom:8px;left:8px;right:8px;background:rgba(0,0,0,0.9);border-radius:10px;padding:10px;text-align:left;z-index:15;">
    <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:6px;">编辑 TAG（场景描述）</div>
    <textarea class="xb-nd-edit-input">${escapedTags}</textarea>
    <div style="display:flex;gap:6px;margin-top:8px;">
        <button data-action="save-tags" style="flex:1;padding:6px 12px;background:rgba(212,165,116,0.3);border:1px solid rgba(212,165,116,0.5);border-radius:6px;color:#fff;font-size:12px;cursor:pointer;">保存 TAG</button>
        <button data-action="cancel-edit" style="padding:6px 12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#fff;font-size:12px;cursor:pointer;">取消</button>
    </div>
</div>
</div>`;
}

function getMesTextElement(messageId) {
    if (!Number.isFinite(messageId)) return null;
    return document.querySelector(`#chat .mes[mesid="${messageId}"] .mes_text`);
}

function isMessageBeingEdited(messageId) {
    if (!Number.isFinite(messageId)) return false;
    const mesElement = document.querySelector(`.mes[mesid="${messageId}"]`);
    if (!mesElement) return false;
    return mesElement.querySelector('textarea.edit_textarea') !== null || mesElement.classList.contains('editing');
}

function createNodeFromHtml(html) {
    const template = document.createElement('template');
    // Template-only UI markup built locally.
    // eslint-disable-next-line no-unsanitized/property
    template.innerHTML = String(html || '').trim();
    return template.content.firstElementChild || null;
}

function extractSlotIds(mes) {
    const ids = new Set();
    if (!mes) return ids;
    let match;
    const regex = new RegExp(PLACEHOLDER_REGEX.source, 'gi');
    while ((match = regex.exec(mes)) !== null) ids.add(match[1]);
    return ids;
}

function getTrimmedText(value) {
    return String(value || '').replace(/\u200B/g, '').trim();
}

function findTopLevelFlowContainer(root, node) {
    let current = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (current && current.parentElement && current.parentElement !== root) {
        current = current.parentElement;
    }
    return current && current.parentElement === root ? current : null;
}

function removeIfEmptyFlowContainer(container) {
    if (!(container instanceof HTMLElement)) return;
    if (!['P', 'DIV', 'BLOCKQUOTE', 'LI'].includes(container.tagName)) return;
    if (container.querySelector('img, video, audio, canvas, iframe, .xb-nd-img')) return;
    if (getTrimmedText(container.textContent).length > 0) return;
    container.remove();
}

function replacePlaceholdersInDomBatch(root, replacements) {
    const pending = replacements.filter(item =>
        item?.slotId &&
        item?.html &&
        !root.querySelector(`.xb-nd-img[data-slot-id="${item.slotId}"]`)
    );
    if (pending.length === 0) return new Set();

    const placeholderMap = new Map(pending.map(item => [createPlaceholder(item.slotId), item]));
    const placeholderRegex = new RegExp(Array.from(placeholderMap.keys()).map(escapeRegexChars).join('|'), 'g');
    const resolvedSlotIds = new Set();
    const nodePlans = new Map();
    const groupedByContainer = new Map();
    const orderedContainers = [];

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            return node.parentElement?.closest('.xb-nd-img')
                ? NodeFilter.FILTER_REJECT
                : NodeFilter.FILTER_ACCEPT;
        },
    });

    let textNode;
    while ((textNode = walker.nextNode())) {
        const value = textNode.nodeValue || '';
        placeholderRegex.lastIndex = 0;
        let match;
        while ((match = placeholderRegex.exec(value))) {
            const patch = placeholderMap.get(match[0]);
            if (!patch || resolvedSlotIds.has(patch.slotId)) continue;
            const container = findTopLevelFlowContainer(root, textNode) || root;
            if (!groupedByContainer.has(container)) {
                groupedByContainer.set(container, []);
                orderedContainers.push(container);
            }
            groupedByContainer.get(container).push(patch);
            if (!nodePlans.has(textNode)) nodePlans.set(textNode, { text: value, removals: [] });
            nodePlans.get(textNode).removals.push({ start: match.index, end: match.index + match[0].length });
            resolvedSlotIds.add(patch.slotId);
        }
    }

    nodePlans.forEach((plan, node) => {
        let nextText = plan.text;
        plan.removals.sort((a, b) => b.start - a.start).forEach(removal => {
            nextText = nextText.slice(0, removal.start) + nextText.slice(removal.end);
        });
        if (nextText) node.nodeValue = nextText;
        else node.remove();
    });

    orderedContainers.forEach(container => {
        const patches = groupedByContainer.get(container) || [];
        let ref = container;
        patches.forEach(patch => {
            const node = createNodeFromHtml(patch.html);
            if (!node) return;
            if (container === root) {
                root.appendChild(node);
                ref = node;
                return;
            }
            ref.insertAdjacentElement('afterend', node);
            ref = node;
        });
        if (container !== root) removeIfEmptyFlowContainer(container);
    });

    return resolvedSlotIds;
}

function collectRenderedTextSegments(root) {
    const segments = [];
    let text = '';
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node;
                if (el.classList?.contains('xb-nd-img')) return NodeFilter.FILTER_REJECT;
                if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return NodeFilter.FILTER_REJECT;
                if (el.tagName === 'BR') return NodeFilter.FILTER_ACCEPT;
                return NodeFilter.FILTER_SKIP;
            }
            return node.parentElement?.closest('.xb-nd-img')
                ? NodeFilter.FILTER_REJECT
                : NodeFilter.FILTER_ACCEPT;
        },
    });

    let node;
    while ((node = walker.nextNode())) {
        const chunk = node.nodeType === Node.TEXT_NODE ? node.nodeValue : '\n';
        if (!chunk) continue;
        const start = text.length;
        text += chunk;
        segments.push({ node, start, end: text.length, text: chunk });
    }
    return { text, segments };
}

function insertPreviewByAnchor(root, slotId, anchor, html) {
    if (!root || !slotId || !anchor) return false;
    if (root.querySelector(`.xb-nd-img[data-slot-id="${slotId}"]`)) return true;
    const { text, segments } = collectRenderedTextSegments(root);
    if (!text || !segments.length) return false;
    let position = findAnchorPosition(text, anchor);
    if (position < 0) return false;
    position = findNearestSentenceEnd(text, position);
    const segment = segments.find(item => item.end >= position) || segments[segments.length - 1];
    const replacementNode = createNodeFromHtml(html);
    if (!segment || !replacementNode) return false;
    const topLevelContainer = findTopLevelFlowContainer(root, segment.node);
    if (topLevelContainer) {
        let ref = topLevelContainer;
        while (ref.nextElementSibling?.classList?.contains('xb-nd-img')) {
            ref = ref.nextElementSibling;
        }
        ref.insertAdjacentElement('afterend', replacementNode);
        return true;
    }
    root.appendChild(replacementNode);
    return true;
}

export function insertPreviewIntoRenderedMessage({ messageId, slotId, html, anchor = '' }) {
    const mesTextEl = getMesTextElement(messageId);
    if (!mesTextEl || !slotId || !html) return false;
    const insertedSlotIds = replacePlaceholdersInDomBatch(mesTextEl, [{ slotId, html, anchor }]);
    if (insertedSlotIds.has(slotId)) return true;
    if (mesTextEl.querySelector(`.xb-nd-img[data-slot-id="${slotId}"]`)) return true;
    return insertPreviewByAnchor(mesTextEl, slotId, anchor, html);
}

function getNovelDrawSavedMap(message) {
    const savedMap = message?.extra?.novelDrawSaved;
    return savedMap && typeof savedMap === 'object' ? savedMap : null;
}

function getNovelDrawSavedEntry(message, slotId) {
    if (!slotId) return null;
    return getNovelDrawSavedMap(message)?.[slotId] || null;
}

async function resolveRenderPreviewForSlot(message, messageId, slotId) {
    const savedEntry = getNovelDrawSavedEntry(message, slotId);
    if (savedEntry?.savedUrl) {
        const previews = await getPreviewsBySlot(slotId).catch(() => []);
        const successPreviews = previews.filter(p => p.status !== 'failed' && (p.base64 || p.savedUrl));
        const selectedIndex = successPreviews.findIndex(p => p.imgId === savedEntry.imgId);
        const matchedPreview = selectedIndex >= 0 ? successPreviews[selectedIndex] : null;

        return {
            preview: {
                ...matchedPreview,
                slotId,
                imgId: savedEntry.imgId || matchedPreview?.imgId || `saved-${slotId}`,
                savedUrl: savedEntry.savedUrl,
                tags: savedEntry.tags ?? matchedPreview?.tags ?? '',
                positive: savedEntry.positive ?? matchedPreview?.positive ?? '',
                anchor: savedEntry.anchor ?? matchedPreview?.anchor ?? '',
                messageId,
            },
            historyCount: selectedIndex >= 0 ? successPreviews.length : 1,
            currentIndex: selectedIndex >= 0 ? selectedIndex : 0,
            hasData: true,
            isFailed: false,
        };
    }

    const displayData = await getDisplayPreviewForSlot(slotId);
    return { ...displayData, currentIndex: 0 };
}

function buildFailedPlaceholderHtml({ slotId, messageId, tags, positive, errorType, errorMessage }) {
    const escapedTags = escapeHtml(tags);
    const escapedPositive = escapeHtml(positive);
    return `<div class="xb-nd-img" data-slot-id="${slotId}" data-tags="${escapedTags}" data-positive="${escapedPositive}" data-mesid="${messageId}" data-state="failed" style="margin:0.8em 0;text-align:center;position:relative;display:block;width:100%;border:1px dashed rgba(248,113,113,0.5);border-radius:14px;padding:20px;background:rgba(248,113,113,0.05);">
<div class="xb-nd-failed-icon">⚠️</div>
<div class="xb-nd-failed-title">${escapeHtml(errorType || '生成失败')}</div>
<div class="xb-nd-failed-desc">${escapeHtml(errorMessage || '点击重试')}</div>
<div class="xb-nd-failed-btns">
    <button class="xb-nd-retry-btn" data-action="retry-image">🔄 重新生成</button>
    <button class="xb-nd-edit-btn" data-action="edit-tags">✏️ 编辑TAG</button>
    <button class="xb-nd-remove-btn" data-action="remove-placeholder">🗑️ 移除</button>
</div>
</div>`;
}

export async function renderPreviewsForMessage(messageId) {
    const ctx = getContext();
    const message = ctx.chat?.[messageId];
    if (!message?.mes) return;

    const slotIds = extractSlotIds(message.mes);
    if (slotIds.size === 0) return;

    const mesTextEl = getMesTextElement(messageId);
    if (!mesTextEl) return;

    const replacements = [];
    for (const slotId of slotIds) {
        if (mesTextEl.querySelector(`.xb-nd-img[data-slot-id="${slotId}"]`)) continue;
        let replacementHtml;
        let anchor = '';
        try {
            const displayData = await resolveRenderPreviewForSlot(message, messageId, slotId);
            anchor = displayData.preview?.anchor || '';
            if (displayData.isFailed) {
                replacementHtml = buildFailedPlaceholderHtml({
                    slotId,
                    messageId,
                    tags: displayData.failedInfo?.tags || '',
                    positive: displayData.failedInfo?.positive || '',
                    errorType: displayData.failedInfo?.errorType || ErrorType.CACHE_LOST.label,
                    errorMessage: displayData.failedInfo?.errorMessage || ErrorType.CACHE_LOST.desc,
                });
            } else if (displayData.hasData && displayData.preview) {
                const url = displayData.preview.savedUrl || `data:image/png;base64,${displayData.preview.base64}`;
                replacementHtml = buildImageHtml({
                    slotId,
                    imgId: displayData.preview.imgId,
                    url,
                    tags: displayData.preview.tags || '',
                    positive: displayData.preview.positive || '',
                    messageId,
                    state: displayData.preview.savedUrl ? ImageState.SAVED : ImageState.PREVIEW,
                    historyCount: displayData.historyCount,
                    currentIndex: displayData.currentIndex ?? 0,
                });
            } else {
                replacementHtml = buildFailedPlaceholderHtml({
                    slotId,
                    messageId,
                    tags: '',
                    positive: '',
                    errorType: ErrorType.CACHE_LOST.label,
                    errorMessage: ErrorType.CACHE_LOST.desc,
                });
            }
        } catch (error) {
            console.error(`[DrawCommon] 渲染 ${slotId} 失败:`, error);
            replacementHtml = buildFailedPlaceholderHtml({
                slotId,
                messageId,
                tags: '',
                positive: '',
                errorType: ErrorType.UNKNOWN.label,
                errorMessage: error?.message || '未知错误',
            });
        }
        replacements.push({ slotId, html: replacementHtml, anchor });
    }

    if (replacements.length === 0) return;
    const insertedSlotIds = replacePlaceholdersInDomBatch(mesTextEl, replacements);
    const pendingFallback = replacements.filter(item => !insertedSlotIds.has(item.slotId));
    if (pendingFallback.length === 0) return;

    let html = mesTextEl.innerHTML;
    let fallbackReplaced = false;
    for (const item of pendingFallback) {
        const placeholder = createPlaceholder(item.slotId);
        const escapedPlaceholder = placeholder.replace(/[[\]]/g, '\\$&');
        if (!new RegExp(escapedPlaceholder).test(html)) continue;
        html = html.replace(new RegExp(escapedPlaceholder, 'g'), item.html);
        fallbackReplaced = true;
    }

    let anchorInserted = false;
    if (!fallbackReplaced) {
        pendingFallback.forEach(item => {
            if (insertPreviewByAnchor(mesTextEl, item.slotId, item.anchor || '', item.html)) {
                anchorInserted = true;
            }
        });
    }

    if (fallbackReplaced && !anchorInserted && !isMessageBeingEdited(messageId)) {
        // Template-only UI markup built locally.
        // eslint-disable-next-line no-unsanitized/property
        mesTextEl.innerHTML = html;
    }
}
