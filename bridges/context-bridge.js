// @ts-nocheck
import { event_types, user_avatar, getCurrentChatId } from "../../../../../script.js";
import { getContext } from "../../../../st-context.js";
import { power_user } from "../../../../power-user.js";
import { createModuleEvents } from "../core/event-manager.js";
import { xbLog } from "../core/debug-core.js";

const SOURCE_TAG = 'xiaobaix-host';

/**
 * Context Bridge — 模板 iframe 上下文桥接服务
 *
 * 功能：
 * 1. iframe 发送 iframe-ready / request-context → 插件推送上下文快照
 * 2. 酒馆事件实时转发到所有模板 iframe
 * 3. 延迟投递队列：iframe 销毁后的事件暂存，待下一个 iframe 连接时投递
 */
class ContextBridgeService {
    constructor() {
        this._attached = false;
        this._listener = null;
        this._previousChatId = null;
        /** @type {Array<{type: string, event: string, payload: object}>} */
        this._pendingEvents = [];
        this._events = createModuleEvents('contextBridge');
    }

    // ===== 生命周期 =====

    init() {
        if (this._attached) return;
        try { xbLog.info('contextBridge', 'init'); } catch {}

        try {
            this._previousChatId = getCurrentChatId();
        } catch {}

        const self = this;
        this._listener = function (event) {
            try {
                self._handleMessage(event);
            } catch (e) {
                try { xbLog.error('contextBridge', 'message handler error', e); } catch {}
            }
        };

        // eslint-disable-next-line no-restricted-syntax -- bridge listener for iframe-ready/request-context
        window.addEventListener('message', this._listener);
        this._attachEventForwarding();
        this._attached = true;
    }

    cleanup() {
        if (!this._attached) return;
        try { xbLog.info('contextBridge', 'cleanup'); } catch {}
        try { window.removeEventListener('message', this._listener); } catch {}
        this._listener = null;
        this._events.cleanup();
        this._pendingEvents.length = 0;
        this._previousChatId = null;
        this._attached = false;
    }

    // ===== 消息处理 =====

    _handleMessage(event) {
        const data = event && event.data;
        if (!data || typeof data !== 'object') return;
        const type = data.type;
        if (type !== 'iframe-ready' && type !== 'request-context') return;

        // 找到发送消息的 iframe 元素
        const iframe = this._findIframeBySource(event.source);
        if (!iframe) return;

        const msgIndex = this._getMsgIndexForIframe(iframe);
        if (msgIndex < 0) return;

        // iframe-ready 时先投递积压的延迟事件
        if (type === 'iframe-ready') {
            while (this._pendingEvents.length > 0) {
                const pending = this._pendingEvents.shift();
                // eslint-disable-next-line no-restricted-syntax -- delivering queued events to newly ready iframe
                try { event.source?.postMessage(pending, '*'); } catch {}
            }
        }

        // 推送上下文快照
        const snapshot = this._buildContextSnapshot(msgIndex);
        // eslint-disable-next-line no-restricted-syntax -- sending context snapshot to requesting iframe
        try { event.source?.postMessage(snapshot, '*'); } catch {}
    }

    /**
     * 遍历 DOM 查找 contentWindow 匹配的 iframe
     * @param {Window} source
     * @returns {HTMLIFrameElement|null}
     */
    _findIframeBySource(source) {
        if (!source) return null;
        const iframes = document.querySelectorAll('iframe.xiaobaix-iframe');
        for (const iframe of iframes) {
            try {
                if (iframe.contentWindow === source) return iframe;
            } catch {}
        }
        return null;
    }

    /**
     * 从 iframe 的 DOM 位置获取消息楼层索引
     * @param {HTMLIFrameElement} iframe
     * @returns {number}
     */
    _getMsgIndexForIframe(iframe) {
        const mesBlock = iframe.closest('.mes');
        if (!mesBlock) return -1;
        const mesid = mesBlock.getAttribute('mesid');
        if (mesid == null) return -1;
        return parseInt(mesid, 10);
    }

    // ===== 上下文快照 =====

    /**
     * @param {number} msgIndex
     * @returns {object}
     */
    _buildContextSnapshot(msgIndex) {
        const ctx = getContext();
        const chat = ctx.chat || [];
        const msg = chat[msgIndex];

        return {
            type: 'st-context',
            chatId: getCurrentChatId() || null,
            characterId: ctx.characterId ?? null,
            characterName: ctx.name2 || '',
            userName: ctx.name1 || '',
            userPersona: power_user?.persona_description || '',
            userAvatar: user_avatar || '',
            msgIndex: msgIndex,
            swipeId: msg?.swipe_id ?? 0,
            totalSwipes: msg?.swipes?.length ?? 1,
            totalMessages: chat.length,
            isGroupChat: !!ctx.groupId,
            groupId: ctx.groupId ?? null,
        };
    }

    // ===== 事件广播 =====

    /**
     * 向所有活跃的模板 iframe 广播事件
     * @param {string} eventName
     * @param {object} payload
     */
    _broadcastToTemplateIframes(eventName, payload) {
        const iframes = document.querySelectorAll('.mes iframe.xiaobaix-iframe');
        const message = { type: 'st-event', source: SOURCE_TAG, event: eventName, payload };
        for (const iframe of iframes) {
            // eslint-disable-next-line no-restricted-syntax -- broadcasting event to template iframes
            try { iframe.contentWindow?.postMessage(message, '*'); } catch {}
        }
    }

    // ===== 事件转发注册 =====

    _attachEventForwarding() {
        const self = this;

        // ---- 消息级事件 ----

        // 消息删除（截断式）：原生 payload = chat.length（删除后剩余消息数）
        this._events.on(event_types.MESSAGE_DELETED, (remainingCount) => {
            self._broadcastToTemplateIframes('message_deleted', {
                fromIndex: remainingCount,
            });
        });

        // Swipe 切换：原生 payload = chat.length - 1（最后一条消息索引）
        this._events.on(event_types.MESSAGE_SWIPED, (msgIndex) => {
            const ctx = getContext();
            const msg = ctx.chat?.[msgIndex];
            self._broadcastToTemplateIframes('message_swiped', {
                msgIndex: msgIndex,
                newSwipeId: msg?.swipe_id ?? 0,
                totalSwipes: msg?.swipes?.length ?? 1,
            });
        });

        // 消息发送：原生 payload = insertAt（消息索引）
        this._events.on(event_types.MESSAGE_SENT, (msgIndex) => {
            self._broadcastToTemplateIframes('message_sent', { msgIndex });
        });

        // AI 回复完成：原生 payload = chat_id（消息索引）
        this._events.on(event_types.MESSAGE_RECEIVED, (msgIndex) => {
            self._broadcastToTemplateIframes('message_received', { msgIndex });
        });

        // 消息编辑：原生 payload = this_edit_mes_id（消息索引）
        this._events.on(event_types.MESSAGE_EDITED, (msgIndex) => {
            self._broadcastToTemplateIframes('message_edited', { msgIndex });
        });

        // ---- 聊天级事件 ----

        // 聊天切换：原生 payload = getCurrentChatId()
        this._events.on(event_types.CHAT_CHANGED, (newChatId) => {
            self._broadcastToTemplateIframes('chat_id_changed', {
                newChatId: newChatId,
                previousChatId: self._previousChatId,
            });
            self._previousChatId = newChatId;
        });

        // 新聊天创建（含分支检测）：原生 payload = 无
        this._events.on(event_types.CHAT_CREATED, () => {
            const ctx = getContext();
            const newLength = (ctx.chat || []).length;
            const isBranch = newLength > 1;

            self._broadcastToTemplateIframes('chat_created', {
                chatId: getCurrentChatId() || null,
                isBranch: isBranch,
                branchFromChatId: isBranch ? self._previousChatId : null,
                branchPointIndex: isBranch ? newLength - 1 : null,
            });
        });

        // ---- 延迟投递事件（入队，不广播）----

        // 聊天删除：原生 payload = 聊天文件名（不含 .jsonl）
        this._events.on(event_types.CHAT_DELETED, (chatFileName) => {
            self._pendingEvents.push({
                type: 'st-event',
                source: SOURCE_TAG,
                event: 'chat_deleted',
                payload: { chatId: chatFileName, timestamp: Date.now() },
            });
        });

        // 群聊删除
        this._events.on(event_types.GROUP_CHAT_DELETED, (chatFileName) => {
            self._pendingEvents.push({
                type: 'st-event',
                source: SOURCE_TAG,
                event: 'group_chat_deleted',
                payload: { chatId: chatFileName, timestamp: Date.now() },
            });
        });
    }
}

// ===== 模块级实例与导出 =====

const contextBridgeService = new ContextBridgeService();

export function initContextBridge() {
    contextBridgeService.init();
}

export function cleanupContextBridge() {
    contextBridgeService.cleanup();
}

// ===== 自初始化（与 call-generate-service.js 模式一致）=====

if (typeof window !== 'undefined') {
    window.LittleWhiteBox = window.LittleWhiteBox || {};
    window.LittleWhiteBox.contextBridge = contextBridgeService;

    try { initContextBridge(); } catch (e) {}

    try {
        window.addEventListener('xiaobaixEnabledChanged', (e) => {
            try {
                const enabled = e && e.detail && e.detail.enabled === true;
                if (enabled) initContextBridge(); else cleanupContextBridge();
            } catch {}
        });
        document.addEventListener('xiaobaixEnabledChanged', (e) => {
            try {
                const enabled = e && e.detail && e.detail.enabled === true;
                if (enabled) initContextBridge(); else cleanupContextBridge();
            } catch {}
        });
        window.addEventListener('beforeunload', () => {
            try { cleanupContextBridge(); } catch {}
        });
    } catch {}
}
