import { computed, ref, toRaw } from 'vue';
import type { XiaobaiOsAppProps } from '../../../shell/app-contract.js';
import type { GameClientState, GameRecordPageView } from '../types.js';
import type { GameAction, GameSettlement } from './room-contract.js';

interface Request { endpoint: string; payload: Record<string, unknown>; action: GameAction }
function errorCode(error: unknown): string {return error && typeof error === 'object' && 'code' in error ? String(error.code) : '';}
function readableError(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('economy_insufficient_funds') || message.includes('cannot be overdrawn')) {return '小白币不够了，换个小一点的筹码吧。';}
    if (message.includes('game_dice_bid_not_higher')) {return '这次要叫得比对方更大一些。';}
    if (message.includes('game_revision_conflict') || message.includes('game_event_id_conflict')) {return '本局已有变化，请重新加载后继续。';}
    if (message.includes('game_main_generation_active')) {return '故事正在回复，等回复结束就能继续玩。';}
    if (message.includes('聊天已切换')) {return '聊天已切换，请重新打开游戏。';}
    if (message === 'host_request_timeout') {return '暂时没收到结果。可以重试这次操作，不会重复下注或重新抽取结果。';}
    return '这次操作没能完成，请重试。';
}

/** Shared connection and confirmed-result handoff. No game rules, page routing or reveal timers. */
export function createGameClient(bridge: XiaobaiOsAppProps['bridge'], initial: GameClientState) {
    const state = ref(structuredClone(toRaw(initial)));
    const settlement = ref<GameSettlement | null>(null);
    const heldFunds = ref<{ balance: number; lockedAmount: number } | null>(null);
    const inFlight = ref<GameAction | null>(null);
    const reading = ref(false);
    const loadingMore = ref(false);
    const error = ref('');
    const recordsError = ref('');
    const failed = ref<Request | null>(null);
    let disposed = false;
    let pushed = 0;
    let readSequence = 0;
    let bindingGeneration = 0;
    let actionSequence = 0;
    function actionId(): string {
        if (typeof globalThis.crypto?.randomUUID === 'function') {return 'game-ui:' + globalThis.crypto.randomUUID();}
        return 'game-ui:' + Date.now() + ':' + (++actionSequence);
    }
    const needsSave = computed(() => ['unconfirmed', 'save-failed'].includes(state.value.status));
    const busy = computed(() => reading.value || Boolean(inFlight.value));
    const disabledReason = computed(() => {
        if (busy.value) {return '上一项操作还在进行，请稍候。';}
        if (state.value.status !== 'ready') {return state.value.message || '游戏正在准备，请稍候。';}
        if (failed.value) {return '请先重试这次操作，或重新加载本局结果。';}
        if (state.value.generationActive) {return '故事正在回复，等回复结束就能继续玩。';}
        return '';
    });
    const funds = computed(() => heldFunds.value ?? { balance: state.value.balance, lockedAmount: state.value.lockedAmount });
    const refreshDisabled = computed(() => busy.value || needsSave.value || ['conflict', 'saving', 'loading'].includes(state.value.status));

    function apply(next: GameClientState): void {
        const previous = state.value;
        const changedChat = previous.chatIdentity !== next.chatIdentity;
        if (changedChat) {
            settlement.value = null; heldFunds.value = null; failed.value = null; inFlight.value = null; reading.value = false;
            readSequence += 1; bindingGeneration += 1;
        } else if (previous.activeGame && next.status === 'ready' && !next.activeGame) {
            const record = next.records.find(item => item.gameId === previous.activeGame!.id);
            if (record) {
                heldFunds.value = { balance: previous.balance, lockedAmount: previous.lockedAmount };
                settlement.value = { before: structuredClone(toRaw(previous.activeGame)), record: structuredClone(record), balanceAfter: next.balance };
            }
        }
        state.value = structuredClone(next);
        loadingMore.value = false; recordsError.value = '';
        error.value = '';
        failed.value = null;
    }
    function pendingSave(code: string): boolean {
        const status = code === 'game_save_pending' ? 'save-failed' : code === 'storage_unconfirmed' ? 'unconfirmed' : code === 'storage_conflict' ? 'conflict' : null;
        if (!status) {return false;}
        state.value = { ...state.value, status, message: status === 'save-failed' ? '这局还没保存好，请重试保存后继续。' : status === 'unconfirmed' ? '还不确定是否保存成功，请先检查保存。' : '服务器上的游戏记录与当前内容不同，请重新打开酒馆后继续。' };
        return true;
    }
    async function send(request: Request): Promise<boolean> {
        const identity = state.value.chatIdentity;
        const version = pushed;
        const generation = bindingGeneration;
        inFlight.value = request.action;
        failed.value = null; error.value = '';
        try {
            const reply = await bridge.request(request.endpoint, request.payload, 35_000) as { result: GameClientState };
            if (disposed || generation !== bindingGeneration || state.value.chatIdentity !== identity) {return false;}
            if (pushed === version) {apply(reply.result);}
            return true;
        } catch (cause) {
            if (!disposed && generation === bindingGeneration && pushed === version && state.value.chatIdentity === identity && !pendingSave(errorCode(cause))) {
                error.value = readableError(cause);
                if (state.value.status === 'ready') {failed.value = request;}
            }
            return false;
        } finally {if (!disposed && generation === bindingGeneration && state.value.chatIdentity === identity) {inFlight.value = null;}}
    }
    async function act(action: GameAction): Promise<boolean> {
        if (disposed || disabledReason.value) {return false;}
        return send({
            endpoint: action.endpoint, action: structuredClone(toRaw(action)),
            payload: { ...structuredClone(toRaw(action.payload || {})), chatIdentity: state.value.chatIdentity, expectedRevision: state.value.revision, expectedEventId: state.value.eventId, actionId: actionId() },
        });
    }
    async function retry(): Promise<boolean> {
        if (disposed || !failed.value || busy.value || state.value.status !== 'ready' || state.value.generationActive) {return false;}
        return send(structuredClone(toRaw(failed.value)));
    }
    async function read(confirm = false): Promise<void> {
        if (disposed || busy.value || (!confirm && refreshDisabled.value)) {return;}
        const identity = state.value.chatIdentity;
        const version = pushed;
        const sequence = ++readSequence;
        reading.value = true; error.value = '';
        try {
            const reply = await bridge.request(confirm ? 'game/confirm-save' : 'game/refresh', { chatIdentity: identity }, 35_000) as { result: GameClientState | { state: GameClientState } };
            if (disposed || sequence !== readSequence || state.value.chatIdentity !== identity) {return;}
            if (version === pushed) {apply('state' in reply.result ? reply.result.state : reply.result);}
            failed.value = null;
        } catch (cause) {
            if (!disposed && sequence === readSequence && version === pushed && state.value.chatIdentity === identity) {if (!pendingSave(errorCode(cause))) {error.value = readableError(cause);}}
        } finally {if (sequence === readSequence) {reading.value = false;}}
    }
    async function loadMore(): Promise<void> {
        if (disposed || !state.value.hasMore || loadingMore.value || busy.value || state.value.status !== 'ready') {return;}
        const version = pushed;
        const identity = state.value.chatIdentity;
        loadingMore.value = true; recordsError.value = '';
        try {
            const reply = await bridge.request('game/records/load-more', { chatIdentity: identity, offset: state.value.records.length }, 35_000) as { result: GameRecordPageView };
            if (disposed || version !== pushed || identity !== state.value.chatIdentity) {return;}
            const known = new Set(state.value.records.map(item => item.id));
            state.value.records.push(...reply.result.records.filter(item => !known.has(item.id)));
            state.value.total = reply.result.total;
            state.value.hasMore = reply.result.hasMore;
        } catch (cause) {if (!disposed && version === pushed && identity === state.value.chatIdentity) {recordsError.value = readableError(cause);}}
        finally {if (version === pushed) {loadingMore.value = false;}}
    }
    const unsubscribe = bridge.subscribe(message => {
        if (disposed) {return;}
        if (message.type === 'game/state') {pushed += 1; apply((message.payload as { state: GameClientState }).state);}
        else if (message.type === 'game/error') {error.value = '游戏暂时无法读取，请重新打开。';}
    });
    return {
        state, settlement, funds, inFlight, reading, loadingMore, busy, error, recordsError, failed,
        disabledReason, needsSave, refreshDisabled, act, retry, loadMore,
        refresh: () => read(), confirmSave: () => read(true),
        revealComplete: () => {heldFunds.value = null;},
        dismissSettlement: () => {settlement.value = null; heldFunds.value = null;},
        dispose: () => {disposed = true; readSequence += 1; unsubscribe();},
    };
}
