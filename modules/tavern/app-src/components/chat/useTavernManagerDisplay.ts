import { computed, ref, type Ref } from 'vue';
import type { TavernManagerRunRecord } from '../../../shared/session-db';

interface TavernManagerDisplayOptions {
    managerRuns: Ref<TavernManagerRunRecord[]>;
    visibleRunLimit: number;
}

export interface TavernManagerToolTraceDisplayItem {
    id: string;
    round: number;
    name: string;
    status: string;
    ok: boolean;
    args: string;
    path: string;
    summary: string;
    error: string;
    preface: string;
    thoughts: Array<{ label?: string; text?: string }>;
    elapsedLabel: string;
}

function normalizeTraceThoughts(value: unknown): Array<{ label?: string; text?: string }> {
    const source = Array.isArray(value) ? value : [];
    return source
        .map((thought, index) => {
            const record = thought && typeof thought === 'object' ? thought as Record<string, unknown> : {};
            return {
                label: String(record.label || `思考 ${index + 1}`).trim() || `思考 ${index + 1}`,
                text: String(record.text || '').trim(),
            };
        })
        .filter((thought) => thought.text);
}

export function useTavernManagerDisplay(options: TavernManagerDisplayOptions) {
    const managerStatusClock = ref(Date.now());
    const latestManagerRun = computed(() => options.managerRuns.value[0] || null);
    const currentManagerWorkRun = computed(() => (
        options.managerRuns.value.find((run) => isManagerRunLive(run.status)) || latestManagerRun.value
    ));
    const archivedManagerRuns = computed(() => {
        const currentId = String(currentManagerWorkRun.value?.id || '');
        return options.managerRuns.value
            .filter((run) => String(run.id || '') !== currentId)
            .slice(0, options.visibleRunLimit);
    });
    const hiddenManagerRunCount = computed(() => {
        const currentCount = currentManagerWorkRun.value ? 1 : 0;
        return Math.max(0, options.managerRuns.value.length - currentCount - archivedManagerRuns.value.length);
    });
    const managerBusy = computed(() => options.managerRuns.value.some((run) => ['queued', 'running'].includes(run.status)));
    function formatDurationAgo(timestamp = 0) {
        const elapsed = Math.max(0, managerStatusClock.value - Number(timestamp || 0));
        if (!timestamp || elapsed < 3000) {return '刚刚';}
        return formatElapsedDuration(elapsed);
    }

    function formatElapsedDuration(elapsed = 0) {
        const seconds = Math.floor(elapsed / 1000);
        if (seconds < 60) {return `${seconds} 秒前`;}
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {return `${minutes} 分钟前`;}
        return `${Math.floor(minutes / 60)} 小时前`;
    }

    function formatRunningDuration(timestamp = 0) {
        const elapsed = Math.max(0, managerStatusClock.value - Number(timestamp || 0));
        if (!timestamp || elapsed < 3000) {return '刚开始';}
        return formatElapsedDuration(elapsed).replace(/前$/, '');
    }

    function isManagerRunLive(status = '') {
        return ['queued', 'running'].includes(String(status || ''));
    }

    function managerStatusLabel(status = '') {
        const labels: Record<string, string> = {
            pending: '待维护',
            queued: '排队',
            running: '运行中',
            completed: '完成',
            failed: '失败',
            cancelled: '已取消',
            superseded: '已作废',
            rolled_back: '未采用',
        };
        return labels[status] || status || '未知';
    }

    function managerRunTone(runOrStatus: TavernManagerRunRecord | string = '') {
        const status = typeof runOrStatus === 'string' ? runOrStatus : String(runOrStatus?.status || '');
        if (typeof runOrStatus !== 'string' && status === 'running') {
            const updatedAt = Number(runOrStatus.updatedAt) || Number(runOrStatus.createdAt) || 0;
            const silentMs = Math.max(0, managerStatusClock.value - updatedAt);
            if (silentMs > 30000) {return 'danger';}
            if (silentMs > 9000) {return 'warn';}
        }
        if (['failed', 'rolled_back'].includes(status)) {return 'danger';}
        if (['pending', 'cancelled', 'superseded'].includes(status)) {return 'muted';}
        if (['queued', 'running'].includes(status)) {return 'active';}
        if (status === 'completed') {return 'done';}
        return 'neutral';
    }

    function formatRunModelLine(run: TavernManagerRunRecord) {
        if (run.status === 'pending') {return '等待用户继续';}
        if (run.status === 'queued') {return '等待后台模型';}
        if (run.status === 'running') {return '后台模型运行中';}
        const provider = String(run.provider || '').trim();
        const model = String(run.model || '').trim();
        return [provider, model].filter(Boolean).join(' / ') || '未记录模型信息';
    }

    function formatRunActivityLine(run: TavernManagerRunRecord) {
        const status = String(run.status || '');
        const updatedAt = Number(run.updatedAt) || Number(run.createdAt) || 0;
        if (status === 'pending') {
            return `待用户继续后维护 · 建立于 ${formatDurationAgo(run.createdAt)}`;
        }
        if (status === 'queued') {
            return `等待开始 · 建立于 ${formatDurationAgo(run.createdAt)}`;
        }
        if (status === 'running') {
            const silentMs = Math.max(0, managerStatusClock.value - updatedAt);
            const runningFor = formatRunningDuration(run.createdAt);
            if (silentMs <= 9000) {return `还活着 · 已运行 ${runningFor} · 正在等 API/工具返回`;}
            if (silentMs <= 30000) {return `等待中 · 已运行 ${runningFor} · 上次心跳 ${formatDurationAgo(updatedAt)}`;}
            return `可能卡住 · 已运行 ${runningFor} · ${formatDurationAgo(updatedAt)}没有心跳`;
        }
        if (['completed', 'failed', 'cancelled', 'superseded', 'rolled_back'].includes(status)) {
            return `已结束 · ${formatDurationAgo(updatedAt)}`;
        }
        return updatedAt ? `最后更新 ${formatDurationAgo(updatedAt)}` : '';
    }

    function formatRunIssueLine(run: TavernManagerRunRecord) {
        const error = String(run.error || '').trim();
        const labels: Record<string, string> = {
            manager_memory_tool_required: '本轮没有完成必要的记忆维护，系统没有采用这次结果。',
            manager_aborted: '本次后台工作已停止，系统没有采用这次结果。',
            manager_source_messages_changed: '源楼层已失效，系统没有采用这次结果。',
            manager_epoch_expired: '后台工作已过期，系统没有采用这次结果。',
        };
        if (/工具轮次达到上限/.test(error)) {return `原因：${error} 系统没有采用这次结果。`;}
        if (error && labels[error]) {return `原因：${labels[error]}`;}
        if (run.status === 'rolled_back') {return '原因：本次结果已撤回，当前记忆、地图和事件保持上一版。';}
        if (error) {return `原因：${error}`;}
        return '';
    }

    function formatRunInputLine(run: TavernManagerRunRecord) {
        const assistantOrder = Number(run.assistantOrder);
        const userOrder = Number(run.userOrder);
        const roleTurn = Number.isInteger(assistantOrder) && assistantOrder >= 0
            ? `第 ${assistantOrder + 1} 楼`
            : `第 ${Math.max(0, Number(run.turn) || 0)} 次维护`;
        const source = Number.isInteger(userOrder) && userOrder >= 0 && Number.isInteger(assistantOrder) && assistantOrder >= 0
            ? `原文 ${userOrder + 1}-${assistantOrder + 1} 楼`
            : '';
        const trigger = ['accepted_turn', 'after_turn'].includes(run.trigger) ? '已接受回合维护' : run.trigger === 'manager_chat' ? '助手聊天' : String(run.trigger || '');
        return [roleTurn, source, trigger].filter(Boolean).join(' · ');
    }

    function formatRunMemoryLine(run: TavernManagerRunRecord) {
        const files = Array.isArray(run.changedFiles) ? run.changedFiles : [];
        if (run.status === 'pending') {return '记忆：等待用户继续后维护';}
        if (run.status === 'queued') {return '记忆：等待开始';}
        if (run.status === 'running') {return '记忆：正在整理';}
        if (run.status === 'failed') {return files.length ? `记忆：已写入 ${files.length} 份档案，但本轮失败` : '记忆：未完成';}
        if (['cancelled', 'superseded'].includes(run.status)) {return '记忆：已停止，未采用本轮结果';}
        if (run.status === 'rolled_back') {return '记忆：未采用，已撤回本轮写入';}
        if (!files.length) {return '记忆：没有写入文件';}
        return `记忆：已更新 ${files.length} 份档案`;
    }

    function formatRunMapLine(run: TavernManagerRunRecord) {
        const states = Array.isArray(run.changedStates) ? run.changedStates : [];
        if (run.status === 'pending') {return '地图：等待用户继续后维护';}
        if (run.status === 'queued') {return '地图：等待开始';}
        if (run.status === 'running') {return '地图：正在判断本轮有没有空间变化';}
        if (run.status === 'failed') {return states.length ? `地图：已写入 ${states.length} 份状态，但本轮失败` : '地图：未完成';}
        if (['cancelled', 'superseded'].includes(run.status)) {return '地图：已停止，未采用本轮结果';}
        if (run.status === 'rolled_back') {return '地图：未采用，已撤回本轮更新';}
        if (states.length) {return `地图：已更新 ${states.length} 份状态`;}
        return '地图：本轮没有明确空间变化，未更新';
    }

    function formatRunTaskLine(run: TavernManagerRunRecord) {
        const tasks = Array.isArray(run.changedTasks) ? run.changedTasks : [];
        if (run.status === 'pending') {return '事件：等待用户继续后维护';}
        if (run.status === 'queued') {return '事件：等待开始';}
        if (run.status === 'running') {return '事件：正在判断线索池';}
        if (run.status === 'failed') {return tasks.length ? `事件：已写入 ${tasks.length} 条线索，但本轮失败` : '事件：未完成';}
        if (['cancelled', 'superseded'].includes(run.status)) {return '事件：已停止，未采用本轮结果';}
        if (run.status === 'rolled_back') {return '事件：未采用，已撤回本轮更新';}
        if (tasks.length) {return `事件：已更新 ${tasks.length} 条线索`;}
        return '事件：本轮没有新线索';
    }

    function toolTraceSummary(value: unknown) {
        if (!value) {return '';}
        if (Array.isArray(value)) {
            const failed = value.filter((item) => item && typeof item === 'object' && (item as { ok?: unknown }).ok === false).length;
            const running = value.filter((item) => item && typeof item === 'object' && String((item as { status?: unknown }).status || '') === 'running').length;
            if (running) {return `工具调用 ${value.length} 次 · ${running} 个运行中`;}
            return failed ? `工具调用 ${value.length} 次 · ${failed} 次失败` : `工具调用 ${value.length} 次 · 全部成功`;
        }
        if (typeof value === 'object') {
            const record = value as Record<string, unknown>;
            const counts = ['calls', 'toolCalls', 'steps', 'trace']
                .map((key) => Array.isArray(record[key]) ? (record[key] as unknown[]).length : 0)
                .filter((count) => count > 0);
            if (counts.length) {return `工具调用 ${Math.max(...counts)} 次`;}
            const keys = Object.keys(record).length;
            return keys ? `工具记录 ${keys} 项` : '';
        }
        return '有工具记录';
    }

    function managerToolTraceItems(value: unknown): TavernManagerToolTraceDisplayItem[] {
        if (!Array.isArray(value)) {return [];}
        const seenPrefaces = new Set<string>();
        const seenThoughts = new Set<string>();
        return value
            .map((item, index) => {
                const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
                const name = String(record.name || '工具').trim() || '工具';
                const status = String(record.status || '').trim();
                const ok = record.ok !== false;
                const elapsedMs = Math.max(0, Number(record.elapsedMs) || (
                    Number(record.startedAt) && Number(record.finishedAt)
                        ? Number(record.finishedAt) - Number(record.startedAt)
                        : 0
                ));
                const round = Math.max(1, Number(record.round) || 1);
                const rawPreface = String(record.preface || '').trim();
                const prefaceKey = `${round}\n${rawPreface}`;
                const preface = rawPreface && !seenPrefaces.has(prefaceKey) ? rawPreface : '';
                if (rawPreface) {seenPrefaces.add(prefaceKey);}
                const rawThoughts = normalizeTraceThoughts(record.thoughts);
                const thoughtsKey = `${round}\n${JSON.stringify(rawThoughts)}`;
                const thoughts = rawThoughts.length && !seenThoughts.has(thoughtsKey) ? rawThoughts : [];
                if (rawThoughts.length) {seenThoughts.add(thoughtsKey);}
                return {
                    id: String(record.id || `${name}-${index}`),
                    round,
                    name,
                    status,
                    ok,
                    args: String(record.args || '').trim(),
                    path: String(record.path || '').trim(),
                    summary: String(record.summary || record.error || '').trim(),
                    error: String(record.error || '').trim(),
                    preface,
                    thoughts,
                    elapsedLabel: elapsedMs ? `${(elapsedMs / 1000).toFixed(1)}s` : '',
                };
            });
    }

    function managerToolStatusLabel(item: { status?: string; ok?: boolean }) {
        if (item.status === 'running') {return '运行中';}
        if (item.ok === false) {return '失败';}
        return '已返回';
    }

    function managerToolTone(item: { status?: string; ok?: boolean }) {
        if (item.status === 'running') {return 'is-running';}
        if (item.ok === false) {return 'is-error';}
        return 'is-resolved';
    }

    return {
        archivedManagerRuns,
        currentManagerWorkRun,
        formatRunActivityLine,
        formatRunIssueLine,
        formatRunInputLine,
        formatRunMapLine,
        formatRunMemoryLine,
        formatRunModelLine,
        formatRunTaskLine,
        hiddenManagerRunCount,
        isManagerRunLive,
        managerBusy,
        managerRunTone,
        managerStatusClock,
        managerStatusLabel,
        managerToolStatusLabel,
        managerToolTone,
        managerToolTraceItems,
        toolTraceSummary,
    };
}
