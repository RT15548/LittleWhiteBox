import { computed, ref, type ComputedRef, type Ref } from 'vue';
import type { TavernMessageRecord } from '../../../shared/session-db';

type TavernToastTone = 'info' | 'warning' | 'danger';
type TavernDrawJobStatus = 'queued' | 'running' | 'success' | 'failed' | 'cancelled';

export interface TavernDrawQuickOption {
    value: string;
    label: string;
}

export interface TavernDrawQuickSettings {
    provider: string;
    providerLabel: string;
    available: boolean;
    auto: boolean;
    presets: TavernDrawQuickOption[];
    selectedPresetId: string;
    sizeOptions: TavernDrawQuickOption[];
    selectedSize: string;
}

interface TavernDrawStatus {
    provider: string;
    enabled: boolean;
    ready: boolean;
}

interface TavernDrawJob {
    key: string;
    sessionId: string;
    order: number;
    role: string;
    status: TavernDrawJobStatus;
    statusKind: 'running' | 'success' | 'error';
    progressText: string;
    requestId: string;
    sourceTextHash: string;
    queuedAt: number;
    startedAt: number;
    finishedAt: number;
    finishId: number;
    controller?: AbortController;
}

export interface TavernDrawControllerOptions {
    selectedSessionId: Ref<string>;
    loadedSessionMessages: Ref<TavernMessageRecord[]>;
    selectedSession: ComputedRef<{ characterName?: string } | null>;
    effectiveCharacterName: ComputedRef<string>;
    isEditingMessage: (message: TavernMessageRecord) => boolean;
    messageKey: (message: TavernMessageRecord) => string;
    roleLabel: (role?: string) => string;
    createHostRequestId: (prefix?: string) => string;
    requestHost: (type: string, payload?: Record<string, unknown>, options?: { signal?: AbortSignal; requestId?: string }) => Promise<Record<string, unknown>>;
    getTavernMessage: (sessionId?: string, order?: number) => Promise<TavernMessageRecord | null | undefined>;
    updateTavernMessage: (sessionId?: string, order?: number, patch?: Partial<TavernMessageRecord>) => Promise<TavernMessageRecord | null | undefined>;
    loadSelectedSessionMessageWindow: (options?: { reset?: boolean; sessionId?: string }) => Promise<void>;
    flashMessageAction: (message: TavernMessageRecord, action: string, ok: boolean) => void;
    showToast: (message: string, options?: { tone?: TavernToastTone; durationMs?: number }) => void;
    describeError: (error: unknown) => string;
    markdownSignature: (text?: string) => string;
    stripTavernImageMarkers: (text?: string) => string;
    enhanceChatMarkdown: () => void;
    nextTick: (callback?: () => void) => Promise<void>;
}

export interface TavernDrawContext {
    canDrawMessage: (message: TavernMessageRecord) => boolean;
    cancelJob: (jobKey?: string) => void;
    cancelJobsForMessageRange: (sessionId?: string, fromOrder?: number) => void;
    cancelJobsForSession: (sessionId?: string) => void;
    abortAllJobs: () => void;
    clearCooldownTimer: () => void;
    drawLatestAssistantMessage: () => Promise<void>;
    drawMessage: (message: TavernMessageRecord) => Promise<void>;
    drawMessageStatusClass: (message: TavernMessageRecord) => string;
    drawMessageStatusText: (message: TavernMessageRecord) => string;
    drawMessageTitle: (message: TavernMessageRecord) => string;
    handleHostMessage: (data: Record<string, unknown>) => boolean;
    isDrawingMessage: (message: TavernMessageRecord) => boolean;
    openTavernDrawSettings: () => Promise<void>;
    refreshTavernDrawQuickSettings: () => Promise<TavernDrawQuickSettings>;
    refreshTavernDrawStatus: () => Promise<TavernDrawStatus>;
    tavernDrawCapsuleIcon: ComputedRef<string>;
    tavernDrawCapsuleMainDisabled: ComputedRef<boolean>;
    tavernDrawCapsuleStatusClass: ComputedRef<string>;
    tavernDrawCapsuleStatusText: ComputedRef<string>;
    tavernDrawCapsuleTitle: ComputedRef<string>;
    tavernDrawCapsuleVisible: ComputedRef<boolean>;
    tavernDrawQuickSettings: Ref<TavernDrawQuickSettings>;
    tavernDrawQuickSettingsLoading: Ref<boolean>;
    updateTavernDrawQuickSettings: (patch?: Record<string, unknown>) => Promise<void>;
}

const DRAW_COMPLETION_NOTICE_TEXT = '配图已生成';
const DRAW_COOLDOWN_TICK_MS = 100;
const DEFAULT_TAVERN_DRAW_QUICK_SETTINGS: TavernDrawQuickSettings = {
    provider: 'disabled',
    providerLabel: '',
    available: false,
    auto: false,
    presets: [],
    selectedPresetId: '',
    sizeOptions: [],
    selectedSize: '',
};

function findAnchorPosition(content = '', anchor = '') {
    const text = String(content || '');
    const target = String(anchor || '').trim();
    if (!target) {return -1;}
    const direct = text.indexOf(target);
    if (direct >= 0) {return direct + target.length;}
    const compactTarget = target.replace(/\s+/g, '');
    if (!compactTarget) {return -1;}
    const compactText = text.replace(/\s+/g, '');
    const compactIndex = compactText.indexOf(compactTarget);
    if (compactIndex < 0) {return -1;}
    let compactSeen = 0;
    for (let index = 0; index < text.length; index += 1) {
        if (/\s/.test(text[index])) {continue;}
        compactSeen += 1;
        if (compactSeen >= compactIndex + compactTarget.length) {
            return index + 1;
        }
    }
    return -1;
}

function findNearestSentenceEnd(content = '', startPos = -1) {
    const text = String(content || '');
    if (startPos < 0 || !text) {return startPos;}
    if (startPos >= text.length) {return text.length;}
    const maxLookAhead = 80;
    const endLimit = Math.min(text.length, startPos + maxLookAhead);
    const basicEnders = new Set(['。', '！', '？', '!', '?', '…']);
    const closingMarks = new Set(['”', '“', '’', '‘', '」', '』', '】', '）', ')', '"', "'", '*', '~', '～', ']']);
    const eatClosingMarks = (position: number) => {
        let next = position;
        while (next < text.length && closingMarks.has(text[next])) {
            next += 1;
        }
        return next;
    };
    if (startPos > 0 && basicEnders.has(text[startPos - 1])) {
        return eatClosingMarks(startPos);
    }
    for (let offset = 0; offset < maxLookAhead && startPos + offset < endLimit; offset += 1) {
        const position = startPos + offset;
        const char = text[position];
        if (char === '\n') {return position + 1;}
        if (basicEnders.has(char)) {return eatClosingMarks(position + 1);}
        if (char === '.' && text.slice(position, position + 3) === '...') {
            return eatClosingMarks(position + 3);
        }
    }
    return startPos;
}

function insertTavernImageMarker(content = '', image: Record<string, unknown> = {}) {
    const slotId = String(image.slotId || '').trim();
    if (!slotId) {return { content, inserted: false, appended: false };}
    const marker = `[tavern-image:${slotId}]`;
    const text = String(content || '');
    if (text.includes(marker)) {return { content: text, inserted: false, appended: false };}
    let position = findAnchorPosition(text, String(image.anchor || ''));
    if (position >= 0) {
        position = findNearestSentenceEnd(text, position);
    }
    if (position >= 0) {
        const before = text.slice(0, position);
        const after = text.slice(position);
        let insertText = marker;
        if (before.length > 0 && !before.endsWith('\n')) {insertText = `\n${insertText}`;}
        if (after.length > 0 && !after.startsWith('\n')) {insertText = `${insertText}\n`;}
        return {
            content: `${before}${insertText}${after}`,
            inserted: true,
            appended: false,
        };
    }
    const needNewline = text.length > 0 && !text.endsWith('\n');
    return {
        content: `${text}${needNewline ? '\n' : ''}${marker}`,
        inserted: true,
        appended: true,
    };
}

function insertTavernImageMarkers(content = '', images: unknown[] = []) {
    let nextContent = String(content || '');
    let inserted = 0;
    let appended = 0;
    (Array.isArray(images) ? images : []).forEach((rawImage) => {
        const image = rawImage && typeof rawImage === 'object' ? rawImage as Record<string, unknown> : {};
        if (!image.slotId) {return;}
        const result = insertTavernImageMarker(nextContent, image);
        nextContent = result.content;
        if (result.inserted) {inserted += 1;}
        if (result.appended) {appended += 1;}
    });
    return { content: nextContent, inserted, appended };
}

function formatDrawProgress(stateName = '', data: Record<string, unknown> = {}) {
    const current = Number(data.current) || 0;
    const total = Number(data.total) || 0;
    const countText = total ? ` ${current}/${total}` : '';
    switch (stateName) {
        case 'llm':
            return '正在分析画面';
        case 'gen':
            return total ? `准备生成 ${total} 张图` : '准备生成图片';
        case 'queued':
            return Number(data.ahead) > 0 ? `画图排队中，前方 ${Number(data.ahead)} 个任务` : `画图排队中${countText}`;
        case 'progress':
            return `正在生成图片${countText}`;
        case 'cooldown': {
            const remainingMs = Number.isFinite(Number(data.remainingMs))
                ? Number(data.remainingMs)
                : Number(data.duration);
            if (!Number.isFinite(remainingMs) || remainingMs <= 0) {return '等待画图冷却';}
            return `等待下一张图片${total ? ` ${data.nextIndex || current}/${total}` : ''}，剩余 ${(remainingMs / 1000).toFixed(1)}s`;
        }
        case 'success': {
            const success = Number(data.success) || 0;
            const finalTotal = total || success;
            if (finalTotal > 0 && success === 0) {
                return `画图结束，${finalTotal} 张都失败`;
            }
            return `画图完成 ${success}/${finalTotal}`;
        }
        default:
            return '正在处理画图';
    }
}

function normalizeDrawQuickOption(value: unknown): TavernDrawQuickOption | null {
    if (!value || typeof value !== 'object') {return null;}
    const source = value as Record<string, unknown>;
    const optionValue = String(source.value || '').trim();
    if (!optionValue) {return null;}
    return {
        value: optionValue,
        label: String(source.label || optionValue).trim() || optionValue,
    };
}

export function useTavernDrawController(options: TavernDrawControllerOptions): TavernDrawContext {
    const tavernDrawStatus = ref<TavernDrawStatus>({ provider: 'disabled', enabled: false, ready: false });
    const tavernDrawQuickSettings = ref<TavernDrawQuickSettings>({ ...DEFAULT_TAVERN_DRAW_QUICK_SETTINGS });
    const tavernDrawQuickSettingsLoading = ref(false);
    const drawJobs = ref<Record<string, TavernDrawJob>>({});
    const drawQueue = ref<string[]>([]);
    const drawRequestJobKeys = new Map<string, string>();
    let drawCooldownTimer: number | null = null;
    let drawFinishSerial = 0;

    function drawJobForMessage(message: TavernMessageRecord): TavernDrawJob | null {
        return drawJobs.value[options.messageKey(message)] || null;
    }

    function isActiveDrawJob(job?: TavernDrawJob | null): boolean {
        return job?.status === 'queued' || job?.status === 'running';
    }

    function runningDrawJobKey(): string {
        return Object.values(drawJobs.value).find((job) => job.status === 'running')?.key || '';
    }

    function setDrawJob(jobKey = '', patch: Partial<TavernDrawJob>): void {
        const key = String(jobKey || '').trim();
        if (!key) {return;}
        const existing = drawJobs.value[key];
        if (!existing) {return;}
        drawJobs.value = {
            ...drawJobs.value,
            [key]: {
                ...existing,
                ...patch,
            },
        };
    }

    function removeDrawJob(jobKey = ''): void {
        const key = String(jobKey || '').trim();
        if (!key || !drawJobs.value[key]) {return;}
        const next = { ...drawJobs.value };
        delete next[key];
        drawJobs.value = next;
    }

    function clearCooldownTimer() {
        if (drawCooldownTimer) {
            window.clearInterval(drawCooldownTimer);
            drawCooldownTimer = null;
        }
    }

    function finishDrawJobStatus(jobKey = '', patch: Partial<TavernDrawJob>, durationMs = 0): void {
        const key = String(jobKey || '').trim();
        if (!key) {return;}
        const finishedAt = Date.now();
        const finishId = drawFinishSerial += 1;
        setDrawJob(key, {
            ...patch,
            finishedAt,
            finishId,
            controller: undefined,
        });
        if (durationMs > 0) {
            window.setTimeout(() => {
                const current = drawJobs.value[key];
                if (!current || ['queued', 'running'].includes(current.status) || current.finishId !== finishId) {return;}
                removeDrawJob(key);
            }, durationMs);
        }
    }

    function updateQueuedDrawJobStatuses(): void {
        drawQueue.value.forEach((key, index) => {
            const job = drawJobs.value[key];
            if (!job || job.status !== 'queued') {return;}
            setDrawJob(key, {
                progressText: index > 0 ? `排队中，前方 ${index} 个任务` : '排队中',
                statusKind: 'running',
            });
        });
    }

    function startDrawCooldownCountdown(jobKey: string, data: Record<string, unknown> = {}) {
        clearCooldownTimer();
        const duration = Math.max(0, Number(data.duration) || 0);
        const endsAt = Date.now() + duration;
        const updateCountdown = () => {
            const job = drawJobs.value[jobKey];
            if (!job || job.status !== 'running') {
                clearCooldownTimer();
                return;
            }
            const remainingMs = Math.max(0, endsAt - Date.now());
            setDrawJob(jobKey, {
                statusKind: 'running',
                progressText: formatDrawProgress('cooldown', {
                    ...data,
                    remainingMs,
                }),
            });
            if (remainingMs <= 0) {
                clearCooldownTimer();
            }
        };
        updateCountdown();
        if (duration > 0) {
            drawCooldownTimer = window.setInterval(updateCountdown, DRAW_COOLDOWN_TICK_MS);
        }
    }

    function applyTavernDrawStatus(payload: Record<string, unknown> = {}) {
        tavernDrawStatus.value = {
            provider: String(payload.provider || 'disabled'),
            enabled: payload.enabled === true,
            ready: payload.ready === true,
        };
        if (!tavernDrawStatus.value.enabled || tavernDrawStatus.value.provider === 'disabled') {
            tavernDrawQuickSettings.value = { ...DEFAULT_TAVERN_DRAW_QUICK_SETTINGS };
        }
    }

    const latestDrawableAssistantMessage = computed(() => findLatestDrawableAssistantMessage());
    const tavernDrawCapsuleVisible = computed(() => (
        tavernDrawStatus.value.enabled === true
        && String(tavernDrawStatus.value.provider || 'disabled') !== 'disabled'
    ));
    const tavernDrawCapsuleStatusText = computed(() => {
        const message = latestDrawableAssistantMessage.value;
        return message ? drawMessageStatusText(message) : '';
    });
    const tavernDrawCapsuleStatusClass = computed(() => {
        const message = latestDrawableAssistantMessage.value;
        return message ? drawMessageStatusClass(message) : '';
    });
    const tavernDrawCapsuleWorking = computed(() => {
        const message = latestDrawableAssistantMessage.value;
        return !!message && isDrawingMessage(message);
    });
    const tavernDrawCapsuleMainDisabled = computed(() => (
        tavernDrawCapsuleVisible.value
        && !tavernDrawStatus.value.ready
        && !tavernDrawCapsuleWorking.value
    ));
    const tavernDrawCapsuleTitle = computed(() => {
        const message = latestDrawableAssistantMessage.value;
        if (message) {
            const statusText = tavernDrawCapsuleStatusText.value;
            if (statusText) {return statusText;}
            if (tavernDrawCapsuleWorking.value) {return drawMessageTitle(message);}
        }
        if (!tavernDrawStatus.value.ready) {return '画图模块初始化中';}
        return message ? '为最新回复画图' : '没有可配图的回复';
    });
    const tavernDrawCapsuleIcon = computed(() => {
        if (tavernDrawCapsuleWorking.value) {return '■';}
        const statusClass = tavernDrawCapsuleStatusClass.value;
        if (statusClass.includes('success')) {return '✓';}
        if (statusClass.includes('error')) {return '!';}
        return '🎨';
    });

    async function refreshTavernDrawStatus() {
        try {
            const result = await options.requestHost('xb-tavern:draw-status', {});
            applyTavernDrawStatus(result);
            if (tavernDrawCapsuleVisible.value) {
                void refreshTavernDrawQuickSettings();
            }
        } catch {
            applyTavernDrawStatus({ provider: 'disabled', enabled: false, ready: false });
        }
        return tavernDrawStatus.value;
    }

    function normalizeTavernDrawQuickSettings(payload: Record<string, unknown> = {}): TavernDrawQuickSettings {
        const source = payload.result && typeof payload.result === 'object'
            ? payload.result as Record<string, unknown>
            : payload;
        const presets = Array.isArray(source.presets)
            ? source.presets.map(normalizeDrawQuickOption).filter((item): item is TavernDrawQuickOption => !!item)
            : [];
        const sizeOptions = Array.isArray(source.sizeOptions)
            ? source.sizeOptions.map(normalizeDrawQuickOption).filter((item): item is TavernDrawQuickOption => !!item)
            : [];
        const selectedPresetId = String(source.selectedPresetId || presets[0]?.value || '').trim();
        const selectedSize = String(source.selectedSize || sizeOptions[0]?.value || '').trim();
        return {
            provider: String(source.provider || tavernDrawStatus.value.provider || 'disabled'),
            providerLabel: String(source.providerLabel || '').trim(),
            available: source.available === true && presets.length > 0 && sizeOptions.length > 0,
            auto: source.auto === true,
            presets,
            selectedPresetId,
            sizeOptions,
            selectedSize,
        };
    }

    async function refreshTavernDrawQuickSettings(): Promise<TavernDrawQuickSettings> {
        if (!tavernDrawCapsuleVisible.value) {
            tavernDrawQuickSettings.value = { ...DEFAULT_TAVERN_DRAW_QUICK_SETTINGS };
            return tavernDrawQuickSettings.value;
        }
        tavernDrawQuickSettingsLoading.value = true;
        try {
            const result = await options.requestHost('xb-tavern:draw-quick-settings', {});
            tavernDrawQuickSettings.value = normalizeTavernDrawQuickSettings(result);
        } catch {
            tavernDrawQuickSettings.value = {
                ...DEFAULT_TAVERN_DRAW_QUICK_SETTINGS,
                provider: tavernDrawStatus.value.provider,
            };
        } finally {
            tavernDrawQuickSettingsLoading.value = false;
        }
        return tavernDrawQuickSettings.value;
    }

    async function updateTavernDrawQuickSettings(patch: Record<string, unknown> = {}): Promise<void> {
        if (!tavernDrawCapsuleVisible.value || tavernDrawQuickSettingsLoading.value) {return;}
        tavernDrawQuickSettingsLoading.value = true;
        try {
            const result = await options.requestHost('xb-tavern:draw-update-quick-settings', { payload: patch });
            tavernDrawQuickSettings.value = normalizeTavernDrawQuickSettings(result);
        } catch (error) {
            options.showToast(`画图快捷设置保存失败：${options.describeError(error)}`, { tone: 'warning', durationMs: 3600 });
        } finally {
            tavernDrawQuickSettingsLoading.value = false;
        }
    }

    function isDrawingMessage(message: TavernMessageRecord) {
        return isActiveDrawJob(drawJobForMessage(message));
    }

    function drawMessageStatusText(message: TavernMessageRecord) {
        return drawJobForMessage(message)?.progressText || '';
    }

    function drawMessageStatusClass(message: TavernMessageRecord) {
        const job = drawJobForMessage(message);
        return job ? `is-${job.statusKind}` : '';
    }

    function canDrawMessage(message: TavernMessageRecord) {
        if (isDrawingMessage(message)) {return true;}
        if (options.isEditingMessage(message) || message.error) {return false;}
        if (!['user', 'assistant'].includes(message.role)) {return false;}
        return !!options.stripTavernImageMarkers(message.content || '');
    }

    function findLatestDrawableAssistantMessage(): TavernMessageRecord | null {
        const messages = [...options.loadedSessionMessages.value].sort((left, right) => right.order - left.order);
        return messages.find((message) => (
            message.sessionId === options.selectedSessionId.value
            && message.role === 'assistant'
            && canDrawMessage(message)
        )) || null;
    }

    function drawSourceTextHash(content = ''): string {
        return options.markdownSignature(options.stripTavernImageMarkers(content));
    }

    function drawMessageTitle(message: TavernMessageRecord) {
        const job = drawJobForMessage(message);
        if (job?.status === 'queued') {
            return drawMessageStatusText(message) || '取消画图';
        }
        if (job?.status === 'running') {
            return drawMessageStatusText(message) || '停止画图';
        }
        if (!canDrawMessage(message)) {
            return '这条消息暂不能画图';
        }
        if (tavernDrawStatus.value.enabled && tavernDrawStatus.value.ready) {
            return '为这条消息画图';
        }
        return '为这条消息画图';
    }

    async function drawLatestAssistantMessage(): Promise<void> {
        if (!tavernDrawCapsuleVisible.value) {return;}
        const message = latestDrawableAssistantMessage.value;
        if (!message) {
            options.showToast('没有可配图的回复', { tone: 'info', durationMs: 2200 });
            return;
        }
        if (isDrawingMessage(message)) {
            await drawMessage(message);
            return;
        }
        if (!tavernDrawStatus.value.ready) {
            const status = await refreshTavernDrawStatus();
            if (!status.ready) {
                options.showToast('画图模块初始化中', { tone: 'info', durationMs: 2200 });
                return;
            }
        }
        await drawMessage(message);
    }

    async function openTavernDrawSettings(): Promise<void> {
        try {
            await options.requestHost('xb-tavern:draw-open-settings', {});
            void refreshTavernDrawStatus();
        } catch (error) {
            options.showToast(`打开画图设置失败：${options.describeError(error)}`, { tone: 'warning', durationMs: 4200 });
        }
    }

    function cancelJob(jobKey = ''): void {
        const key = String(jobKey || '').trim();
        const job = drawJobs.value[key];
        if (!job || !isActiveDrawJob(job)) {return;}
        if (job.status === 'queued') {
            drawQueue.value = drawQueue.value.filter((item) => item !== key);
            updateQueuedDrawJobStatuses();
            finishDrawJobStatus(key, {
                status: 'cancelled',
                statusKind: 'error',
                progressText: '配图已取消',
            }, 1800);
            return;
        }
        job.controller?.abort();
        clearCooldownTimer();
        setDrawJob(key, {
            progressText: '正在停止画图',
            statusKind: 'running',
        });
    }

    function cancelJobsForMessageRange(sessionId = '', fromOrder = 0): void {
        const id = String(sessionId || '').trim();
        const startOrder = Number(fromOrder);
        if (!id || !Number.isFinite(startOrder)) {return;}
        Object.values(drawJobs.value).forEach((job) => {
            if (job.sessionId === id && Number(job.order) >= startOrder) {
                cancelJob(job.key);
            }
        });
    }

    function cancelJobsForSession(sessionId = ''): void {
        const id = String(sessionId || '').trim();
        if (!id) {return;}
        Object.values(drawJobs.value).forEach((job) => {
            if (job.sessionId === id) {
                cancelJob(job.key);
            }
        });
    }

    function abortAllJobs(): void {
        Object.values(drawJobs.value).forEach((job) => {
            job.controller?.abort();
        });
        drawQueue.value = [];
        drawRequestJobKeys.clear();
    }

    function enqueueDrawMessageJob(message: TavernMessageRecord): void {
        const key = options.messageKey(message);
        const now = Date.now();
        drawJobs.value = {
            ...drawJobs.value,
            [key]: {
                key,
                sessionId: message.sessionId,
                order: message.order,
                role: message.role,
                status: 'queued',
                statusKind: 'running',
                progressText: '排队中',
                requestId: '',
                sourceTextHash: '',
                queuedAt: now,
                startedAt: 0,
                finishedAt: 0,
                finishId: 0,
            },
        };
        drawQueue.value = [...drawQueue.value.filter((item) => item !== key), key];
        updateQueuedDrawJobStatuses();
        void processNextDrawJob();
    }

    async function processNextDrawJob(): Promise<void> {
        if (runningDrawJobKey()) {return;}
        const nextKey = drawQueue.value.find((key) => drawJobs.value[key]?.status === 'queued') || '';
        if (!nextKey) {return;}
        drawQueue.value = drawQueue.value.filter((key) => key !== nextKey);
        updateQueuedDrawJobStatuses();
        await runDrawJob(nextKey);
    }

    function validateDrawableMessage(message: TavernMessageRecord | null | undefined, job: TavernDrawJob): string {
        if (!message) {return '消息已不存在';}
        if (message.sessionId !== job.sessionId || message.order !== job.order || message.role !== job.role) {return '消息已变化';}
        if (message.error) {return '错误消息不能画图';}
        if (!['user', 'assistant'].includes(message.role)) {return '这条消息暂不能画图';}
        if (!options.stripTavernImageMarkers(message.content || '')) {return '消息正文为空';}
        return '';
    }

    async function runDrawJob(jobKey = ''): Promise<void> {
        const job = drawJobs.value[jobKey];
        if (!job || job.status !== 'queued') {return;}
        const requestId = options.createHostRequestId('draw');
        const controller = new AbortController();
        setDrawJob(jobKey, {
            status: 'running',
            statusKind: 'running',
            progressText: '正在准备画图',
            requestId,
            controller,
            startedAt: Date.now(),
        });
        drawRequestJobKeys.set(requestId, jobKey);
        try {
            const currentMessage = await options.getTavernMessage(job.sessionId, job.order);
            const currentError = validateDrawableMessage(currentMessage, job);
            if (currentError) {
                finishDrawJobStatus(jobKey, {
                    status: 'cancelled',
                    statusKind: 'error',
                    progressText: currentError,
                }, 2600);
                return;
            }
            const status = await refreshTavernDrawStatus();
            if (!status.enabled || !status.ready) {
                finishDrawJobStatus(jobKey, {
                    status: 'failed',
                    statusKind: 'error',
                    progressText: '请开启小白X画图模块',
                }, 3200);
                options.flashMessageAction(currentMessage!, 'draw', false);
                return;
            }
            const cleanText = options.stripTavernImageMarkers(currentMessage!.content || '');
            const sourceTextHash = options.markdownSignature(cleanText);
            setDrawJob(jobKey, { sourceTextHash });
            const resultPayload = await options.requestHost('xb-tavern:draw-generate', {
                payload: {
                    source: 'tavern',
                    text: cleanText,
                    title: options.roleLabel(currentMessage!.role),
                    sessionId: currentMessage!.sessionId,
                    messageOrder: currentMessage!.order,
                    role: currentMessage!.role,
                    characterName: options.selectedSession.value?.characterName || options.effectiveCharacterName.value || '',
                },
            }, { signal: controller.signal, requestId });
            if (controller.signal.aborted) {
                finishDrawJobStatus(jobKey, {
                    status: 'cancelled',
                    statusKind: 'error',
                    progressText: '配图已取消',
                }, 1800);
                options.flashMessageAction(currentMessage!, 'draw', false);
                return;
            }
            const latestMessage = await options.getTavernMessage(job.sessionId, job.order);
            const latestError = validateDrawableMessage(latestMessage, job);
            if (latestError) {
                finishDrawJobStatus(jobKey, {
                    status: 'cancelled',
                    statusKind: 'error',
                    progressText: latestError,
                }, 2600);
                options.flashMessageAction(currentMessage!, 'draw', false);
                return;
            }
            if (controller.signal.aborted) {
                finishDrawJobStatus(jobKey, {
                    status: 'cancelled',
                    statusKind: 'error',
                    progressText: '配图已取消',
                }, 1800);
                options.flashMessageAction(latestMessage!, 'draw', false);
                return;
            }
            const latestSourceTextHash = drawSourceTextHash(latestMessage!.content || '');
            if (latestSourceTextHash !== sourceTextHash) {
                finishDrawJobStatus(jobKey, {
                    status: 'cancelled',
                    statusKind: 'error',
                    progressText: '源楼层已变化',
                }, 2600);
                options.flashMessageAction(latestMessage!, 'draw', false);
                return;
            }
            const result = (resultPayload.result || resultPayload) as Record<string, unknown>;
            const images = Array.isArray(result.images) ? result.images : [];
            const insertion = insertTavernImageMarkers(latestMessage!.content || '', images);
            if (!insertion.inserted) {
                const success = Number(result.success) || 0;
                const total = Number(result.total) || images.length;
                const text = total > 0 && success === 0
                    ? `画图任务结束：${total} 张都失败了，未插入图片。`
                    : success > 0
                        ? `画图完成 ${success}/${total || success}，但没有返回可用图片占位。`
                        : '画图任务结束，但没有返回可用图片。';
                finishDrawJobStatus(jobKey, {
                    status: 'failed',
                    statusKind: 'error',
                    progressText: text,
                }, 4200);
                options.flashMessageAction(latestMessage!, 'draw', false);
                return;
            }
            const updated = await options.updateTavernMessage(latestMessage!.sessionId, latestMessage!.order, { content: insertion.content });
            if (updated && options.selectedSessionId.value === latestMessage!.sessionId) {
                await options.loadSelectedSessionMessageWindow({ sessionId: latestMessage!.sessionId });
            }
            const success = Number(result.success) || 0;
            const total = Number(result.total) || images.length;
            const allFailed = total > 0 && success === 0;
            const fallbackText = insertion.appended ? `，${insertion.appended} 张追加到末尾` : '';
            const failureText = total > 0 ? `配图失败：${total} 张都失败了` : '配图失败';
            finishDrawJobStatus(jobKey, {
                status: allFailed ? 'failed' : 'success',
                statusKind: allFailed ? 'error' : 'success',
                progressText: allFailed ? failureText : `${DRAW_COMPLETION_NOTICE_TEXT}${fallbackText}`,
            }, allFailed ? 4200 : 2600);
            options.flashMessageAction(updated || latestMessage!, 'draw', !allFailed && !!updated);
            void options.nextTick(options.enhanceChatMarkdown);
        } catch (error) {
            const current = await options.getTavernMessage(job.sessionId, job.order).catch((): null => null);
            const text = options.describeError(error);
            if (/abort|已取消|request_aborted/i.test(text)) {
                finishDrawJobStatus(jobKey, {
                    status: 'cancelled',
                    statusKind: 'error',
                    progressText: '配图已取消',
                }, 1800);
            } else {
                finishDrawJobStatus(jobKey, {
                    status: 'failed',
                    statusKind: 'error',
                    progressText: `配图失败：${text}`,
                }, 4200);
            }
            if (current) {
                options.flashMessageAction(current, 'draw', false);
            }
        } finally {
            drawRequestJobKeys.delete(requestId);
            const current = drawJobs.value[jobKey];
            if (current?.controller === controller) {
                setDrawJob(jobKey, { controller: undefined });
            }
            void processNextDrawJob();
        }
    }

    async function drawMessage(message: TavernMessageRecord) {
        const existing = drawJobForMessage(message);
        if (isActiveDrawJob(existing)) {
            cancelJob(existing!.key);
            return;
        }
        if (!canDrawMessage(message)) {
            options.flashMessageAction(message, 'draw', false);
            return;
        }
        enqueueDrawMessageJob(message);
    }

    function handleHostMessage(data: Record<string, unknown>) {
        if (data.type === 'xb-tavern:draw-status-changed') {
            applyTavernDrawStatus(data.payload as Record<string, unknown> || {});
            if (tavernDrawCapsuleVisible.value) {
                void refreshTavernDrawQuickSettings();
            }
            return true;
        }
        if (data.type === 'xb-tavern:draw-progress') {
            const payload = data.payload && typeof data.payload === 'object' ? data.payload as Record<string, unknown> : {};
            const requestId = String(payload.requestId || '').trim();
            const jobKey = drawRequestJobKeys.get(requestId);
            if (jobKey && drawJobs.value[jobKey]) {
                const state = String(payload.state || '');
                if (payload.state === 'cooldown') {
                    startDrawCooldownCountdown(jobKey, payload.data as Record<string, unknown> || {});
                } else {
                    clearCooldownTimer();
                    setDrawJob(jobKey, {
                        statusKind: state === 'success' ? 'success' : 'running',
                        progressText: formatDrawProgress(state, payload.data as Record<string, unknown> || {}),
                    });
                }
            }
            return true;
        }
        return false;
    }

    return {
        canDrawMessage,
        cancelJob,
        cancelJobsForMessageRange,
        cancelJobsForSession,
        abortAllJobs,
        clearCooldownTimer,
        drawLatestAssistantMessage,
        drawMessage,
        drawMessageStatusClass,
        drawMessageStatusText,
        drawMessageTitle,
        handleHostMessage,
        isDrawingMessage,
        openTavernDrawSettings,
        refreshTavernDrawQuickSettings,
        refreshTavernDrawStatus,
        tavernDrawCapsuleIcon,
        tavernDrawCapsuleMainDisabled,
        tavernDrawCapsuleStatusClass,
        tavernDrawCapsuleStatusText,
        tavernDrawCapsuleTitle,
        tavernDrawCapsuleVisible,
        tavernDrawQuickSettings,
        tavernDrawQuickSettingsLoading,
        updateTavernDrawQuickSettings,
    };
}
