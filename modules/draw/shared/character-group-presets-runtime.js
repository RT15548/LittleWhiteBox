// 角色分组预设的运行时：读取当前聊天的角色 / 群成员，监听聊天切换，命中预设时把分组开关写入共享设置。
// 纯逻辑在 ./character-group-presets.js；这里只做宿主交互。宿主依赖全部可注入（getContext / createEvents / settings 等），默认取真实宿主。
import { getContext as hostGetContext } from '../../../../../../extensions.js';
import { createModuleEvents, event_types as hostEventTypes } from '../../../core/event-manager.js';
import { normalizeGroupPresets, planPresetApplication } from './character-group-presets.js';
import { characterLibraryFromSettings } from './character-library.js';
import {
    getSharedDrawSettings,
    loadSharedDrawSettings,
    updateSharedDrawSettingsPersistent,
} from './draw-settings.js';

const MODULE_ID = 'drawGroupPresets';

function uniqueAvatarStrings(list) {
    const seen = new Set();
    for (const item of Array.isArray(list) ? list : []) {
        if (typeof item === 'string' && item) seen.add(item);
    }
    return [...seen];
}

function hasValue(value) {
    return value !== null && value !== undefined && value !== '';
}

/**
 * 从酒馆 context 取当前聊天涉及的角色卡 avatar 文件名。
 * 群聊（ctx.groupId 有值）：取 ctx.groups 中该群的 members（酒馆里 members 就是成员角色的 avatar 文件名数组；含被禁言成员）。
 * 单聊：ctx.characters[ctx.characterId].avatar。没有角色（characterId 为空且非群聊）或找不到则返回空数组。
 */
export function getAvatarsFromContext(ctx) {
    if (!ctx || typeof ctx !== 'object') return [];
    if (hasValue(ctx.groupId)) {
        const group = (Array.isArray(ctx.groups) ? ctx.groups : [])
            .find(item => String(item?.id) === String(ctx.groupId));
        return uniqueAvatarStrings(group?.members);
    }
    if (!hasValue(ctx.characterId)) return [];
    const index = Number(ctx.characterId);
    if (!Number.isInteger(index) || index < 0) return [];
    const avatar = Array.isArray(ctx.characters) ? ctx.characters[index]?.avatar : undefined;
    return uniqueAvatarStrings([avatar]);
}

/** 宿主已有角色列表（供绑定选择器用）：{ avatar, name }，按酒馆顺序，avatar 去重。本次只列角色，不含群组。 */
export function listCharactersFromContext(ctx) {
    const seen = new Set();
    const result = [];
    for (const character of Array.isArray(ctx?.characters) ? ctx.characters : []) {
        const avatar = character?.avatar;
        if (typeof avatar !== 'string' || !avatar || seen.has(avatar)) continue;
        seen.add(avatar);
        result.push({ avatar, name: typeof character.name === 'string' ? character.name : '' });
    }
    return result;
}

function defaultToast(message) {
    try {
        globalThis.toastr?.info?.(message);
    } catch { /* 提示失败不影响应用 */ }
}

function describe(plan, extra = {}) {
    return {
        status: plan.status,
        presetId: plan.preset?.id || '',
        presetName: plan.preset?.name || '',
        revision: plan.preset?.revision || 0,
        changed: Boolean(plan.changed),
        changedCount: plan.changedCount || 0,
        recordChanged: Boolean(plan.recordChanged),
        affected: plan.affected || [],
        saved: false,
        ...extra,
    };
}

/**
 * 创建运行时实例。deps 全部可选：
 *   getContext()                 返回酒馆 context
 *   createEvents(moduleId)       返回 { on(type, handler), cleanup() }，默认沿用仓库的 createModuleEvents
 *   eventTypes                   { CHAT_CHANGED, GROUP_UPDATED? }
 *   settings { load, get, update } 共享设置的读写，默认走 draw-settings.js 的 loadSharedDrawSettings / getSharedDrawSettings / updateSharedDrawSettingsPersistent
 *   now() / toast(message) / logger
 */
export function createGroupPresetRuntime(deps = {}) {
    const getContext = deps.getContext ?? hostGetContext;
    const createEvents = deps.createEvents ?? createModuleEvents;
    const eventTypes = deps.eventTypes ?? hostEventTypes;
    const settings = {
        load: loadSharedDrawSettings,
        get: getSharedDrawSettings,
        update: updateSharedDrawSettingsPersistent,
        ...deps.settings,
    };
    const now = deps.now ?? Date.now;
    const toast = deps.toast ?? defaultToast;
    const logger = deps.logger ?? console;
    const moduleId = deps.moduleId ?? MODULE_ID;

    const listeners = new Set();
    const contextListeners = new Set();
    let events = null;
    let watcherGeneration = 0;
    let queue = Promise.resolve();

    function enqueue(task) {
        const run = queue.then(task, task);
        queue = run.catch(() => {});
        return run;
    }

    function getActiveCharacterAvatars() {
        return getAvatarsFromContext(getContext());
    }

    function listHostCharacters() {
        return listCharactersFromContext(getContext());
    }

    /** 订阅“预设已应用”，返回取消订阅函数。面板据此刷新（重新下发 characterGroups / 预设）。 */
    function onGroupPresetApplied(callback) {
        if (typeof callback !== 'function') return () => {};
        listeners.add(callback);
        return () => listeners.delete(callback);
    }

    function emitApplied(result) {
        for (const callback of [...listeners]) {
            try {
                callback(result);
            } catch (error) {
                logger.error('[GroupPresets] 订阅回调出错:', error);
            }
        }
    }

    /**
     * 订阅“聊天上下文变化”（CHAT_CHANGED / GROUP_UPDATED 处理完之后触发，无论有没有应用预设），返回取消订阅函数。
     * 面板据此刷新“当前聊天命中…”这类依赖当前聊天角色的显示。回调参数 { activeAvatars }。
     */
    function onGroupPresetContextChanged(callback) {
        if (typeof callback !== 'function') return () => {};
        contextListeners.add(callback);
        return () => contextListeners.delete(callback);
    }

    function emitContextChanged() {
        if (!contextListeners.size) return;
        let payload;
        try {
            payload = { activeAvatars: getActiveCharacterAvatars() };
        } catch (error) {
            logger.error('[GroupPresets] 读取当前聊天角色失败:', error);
            payload = { activeAvatars: [] };
        }
        for (const callback of [...contextListeners]) {
            try {
                callback(payload);
            } catch (error) {
                logger.error('[GroupPresets] 上下文订阅回调出错:', error);
            }
        }
    }

    async function runApply({ force, presetId }) {
        await settings.load();
        const avatars = getActiveCharacterAvatars();
        const planFor = source => planPresetApplication({
            presets: source.characterGroupPresets,
            applied: source.characterGroupPresetApplied,
            library: characterLibraryFromSettings(source),
            activeAvatars: avatars,
            presetId,
            force,
            now: now(),
        });
        const plan = planFor(settings.get());
        if (plan.status !== 'applied' || (!plan.changed && !plan.recordChanged)) return describe(plan);

        // 以保存时的最新数据为准重新规划（面板可能刚改过分组），只改分组开关（characterGroups[].enabled）与应用记录，不碰 characterTags。
        let finalPlan = plan;
        const ok = await settings.update((draft) => {
            finalPlan = planFor(draft);
            if (finalPlan.status !== 'applied') return;
            if (finalPlan.changed) draft.characterGroups = finalPlan.library.groups;
            if (finalPlan.changed || finalPlan.recordChanged) draft.characterGroupPresetApplied = finalPlan.applied;
        }, '', { notify: false, silent: true });
        if (!ok) return describe(plan, { status: 'save-failed' });
        if (finalPlan.status !== 'applied' || (!finalPlan.changed && !finalPlan.recordChanged)) return describe(finalPlan);

        const result = describe(finalPlan, { saved: true, manual: Boolean(presetId), forced: Boolean(force || presetId) });
        // 只有自动触发才弹提示；手动 force / 指定预设由调用方（面板）自己反馈，避免重复提示。
        if (result.changed && !result.forced) {
            toast(`已应用分组预设“${result.presetName}”（${result.changedCount} 个分组开关变化）`);
        }
        emitApplied(result);
        return result;
    }

    /**
     * 按当前聊天应用分组预设。
     * 默认边沿触发：命中的预设与最近一次应用记录相同（id 与 revision 都一致）则不重复应用；没命中则不动。
     * force：对命中的预设忽略边沿触发，重新应用。presetId：直接应用指定预设（“立即应用”按钮，无视绑定）。
     * 永远 resolve（出错时 status 为 'error'）；调用被串行化，避免并发保存互相覆盖。
     */
    function applyGroupPresetForCurrentChat({ force = false, presetId = '' } = {}) {
        return enqueue(async () => {
            try {
                return await runApply({ force: Boolean(force), presetId: String(presetId || '') });
            } catch (error) {
                logger.error('[GroupPresets] 应用分组预设失败:', error);
                return { status: 'error', message: error?.message || String(error), changed: false, saved: false };
            }
        });
    }

    async function persistGroupPresets(raw) {
        if (!Array.isArray(raw)) return { status: 'invalid', message: '预设数据格式不正确', saved: false };
        await settings.load();
        const ok = await settings.update((draft) => {
            // 以保存时最新的分组为准规范化：指向已删除分组的键在这里被清理；只写预设，不碰其它键，应用记录由设置层按新预设校正。
            const groupIds = (Array.isArray(draft.characterGroups) ? draft.characterGroups : []).map(group => group.id);
            draft.characterGroupPresets = normalizeGroupPresets(raw, { groupIds });
        }, '', { notify: false, silent: true });
        if (!ok) return { status: 'save-failed', saved: false };
        return { status: 'saved', saved: true, presets: settings.get().characterGroupPresets };
    }

    /**
     * 校验、规范化并持久化预设数组（面板“存为预设 / 编辑 / 删除”的保存通道）。
     * 保存成功后默认再做一次非强制的 applyGroupPresetForCurrentChat：预设的绑定 / 开关刚变，revision 变化会让边沿触发重新应用。
     * 与应用任务共用一个队列，保存和应用不会交错。永远 resolve：{ status: 'saved' | 'save-failed' | 'invalid' | 'error', saved, presets?, apply?, message? }。
     */
    async function saveGroupPresets(raw, { apply = true } = {}) {
        let result;
        try {
            result = await enqueue(() => persistGroupPresets(raw));
        } catch (error) {
            logger.error('[GroupPresets] 保存分组预设失败:', error);
            return { status: 'error', message: error?.message || String(error), saved: false };
        }
        if (result.saved && apply) result.apply = await applyGroupPresetForCurrentChat();
        return result;
    }

    /** 开始监听聊天切换（以及群组成员变更）；重复调用无副作用。immediate 为 true 时立刻按当前聊天应用一次。 */
    function startGroupPresetWatcher({ immediate = true } = {}) {
        if (events) return false;
        const generation = ++watcherGeneration;
        events = createEvents(moduleId);
        const handler = () => {
            enqueue(async () => {
                if (generation !== watcherGeneration || !events) return { status: 'stopped' };
                try {
                    return await runApply({ force: false, presetId: '' });
                } catch (error) {
                    logger.error('[GroupPresets] 切换聊天时应用分组预设失败:', error);
                    return { status: 'error' };
                } finally {
                    // 没命中 / 已应用过时不会有 applied 事件：单独通知面板刷新“当前聊天”相关显示。
                    if (generation === watcherGeneration && events) emitContextChanged();
                }
            });
        };
        events.on(eventTypes.CHAT_CHANGED, handler);
        if (eventTypes.GROUP_UPDATED) events.on(eventTypes.GROUP_UPDATED, handler);
        if (immediate) handler();
        return true;
    }

    function stopGroupPresetWatcher() {
        if (!events) return false;
        watcherGeneration += 1;
        events.cleanup();
        events = null;
        return true;
    }

    return {
        applyGroupPresetForCurrentChat,
        getActiveCharacterAvatars,
        listHostCharacters,
        onGroupPresetApplied,
        onGroupPresetContextChanged,
        saveGroupPresets,
        startGroupPresetWatcher,
        stopGroupPresetWatcher,
        isWatching: () => Boolean(events),
        /** 等待已排队的应用任务完成（测试 / 关闭前使用）。 */
        idle: () => queue,
    };
}

const defaultRuntime = createGroupPresetRuntime();

export const applyGroupPresetForCurrentChat = defaultRuntime.applyGroupPresetForCurrentChat;
export const getActiveCharacterAvatars = defaultRuntime.getActiveCharacterAvatars;
export const listHostCharacters = defaultRuntime.listHostCharacters;
export const onGroupPresetApplied = defaultRuntime.onGroupPresetApplied;
export const onGroupPresetContextChanged = defaultRuntime.onGroupPresetContextChanged;
export const saveGroupPresets = defaultRuntime.saveGroupPresets;
export const startGroupPresetWatcher = defaultRuntime.startGroupPresetWatcher;
export const stopGroupPresetWatcher = defaultRuntime.stopGroupPresetWatcher;
