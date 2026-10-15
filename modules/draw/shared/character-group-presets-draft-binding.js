// 分组预设面板在“草稿式”角色库页面（SD WebUI / ComfyUI）里的接线。
// 这两个页面的角色库是草稿（点“保存角色”才持久化），而预设不属于角色草稿：对预设的修改立即经共享设置持久化。
// 本模块只做数据通道，宿主依赖（运行时 / 设置读取 / 草稿同步 / 提示）全部注入，便于单测；
// 页面里只需要在打开设置、渲染角色库之后创建，关闭设置时 destroy。
//
// 防旧副本覆盖：预设自动应用只改 characterGroups[].enabled。已打开的页面持有旧草稿，之后“保存角色”会把分组开关写回旧值，
// 所以订阅 onGroupPresetApplied，把草稿里受影响分组的开关同步成最新值（只改分组开关，其它草稿编辑不动）并刷新预设面板；
// 订阅 onGroupPresetContextChanged 让“当前聊天命中…”随聊天切换刷新。

import { createGroupPresetPanel } from './character-group-presets-ui.js';

function groupIdsOf(groups) {
    return (Array.isArray(groups) ? groups : []).map(group => group?.id).filter(Boolean);
}

/**
 * @param {object} options
 * @param {Document} options.document 页面（设置 iframe）的 document
 * @param {Element} options.container 放预设面板的容器
 * @param {function} options.getLibrary () => 当前草稿库 { characters, groups }（用户所见，含未保存编辑）
 * @param {function} [options.syncGroupEnabled] (latestGroups, groupIds?) => 把草稿里这些分组的开关同步成最新值并重绘
 * @param {object} options.runtime character-group-presets-runtime 的接口：
 *        saveGroupPresets / applyGroupPresetForCurrentChat / getActiveCharacterAvatars / listHostCharacters /
 *        onGroupPresetApplied / onGroupPresetContextChanged
 * @param {object} options.settings { get() } 共享设置读取（characterGroupPresets / characterGroupPresetApplied / characterGroups）
 * @param {function} [options.toast] (message, level) => 提示
 */
export function bindGroupPresetPanel(options = {}) {
    const { document, container, getLibrary, syncGroupEnabled, runtime, settings, toast } = options;
    if (!document || !container || !runtime || !settings) throw new TypeError('bindGroupPresetPanel 缺少必要参数');

    let destroyed = false;
    let panel = null;
    // 乐观显示：面板在 onPresetsChange 之后立刻同步重绘，保存是异步的，所以保存期间先显示用户刚改的版本。
    let optimistic = null;
    let pendingSaves = 0;
    let saveChain = Promise.resolve();

    const notify = (message, level = 'info') => {
        try { toast?.(message, level); } catch { /* 提示失败不影响功能 */ }
    };
    const readPresets = () => {
        if (optimistic) return optimistic;
        const list = settings.get()?.characterGroupPresets;
        return Array.isArray(list) ? list : [];
    };
    const refresh = () => { if (!destroyed) panel?.render(); };

    function warnUnsavedGroups(reason) {
        if (!['create', 'overwrite-states', 'group-state'].includes(reason)) return;
        let draftIds = [];
        try { draftIds = groupIdsOf(getLibrary?.()?.groups); } catch { /* 读取失败时不提示 */ }
        const saved = new Set(groupIdsOf(settings.get()?.characterGroups));
        if (draftIds.some(id => !saved.has(id))) {
            notify('有尚未保存的新分组：它的开关不会进入预设，请先点“保存角色”，再回来覆盖或编辑预设', 'warning');
        }
    }

    function queueSave(presets) {
        pendingSaves += 1;
        saveChain = saveChain.then(async () => {
            let ok = false;
            let message = '';
            try {
                const result = await runtime.saveGroupPresets(presets);
                ok = result?.saved === true;
                message = result?.message || '';
            } catch (error) {
                message = error?.message || String(error);
            }
            pendingSaves -= 1;
            if (!ok) notify(`分组预设保存失败${message ? `：${message}` : ''}`, 'error');
            // 所有保存都结束后改回读取已持久化的版本（失败时即回滚显示）。
            if (pendingSaves === 0) optimistic = null;
            refresh();
        });
        return saveChain;
    }

    function handlePresetsChange(next, meta = {}) {
        optimistic = next;
        warnUnsavedGroups(meta.reason);
        void queueSave(next);
    }

    async function handleApply(presetId) {
        await saveChain; // 先等未完成的保存落盘，再按持久化的预设应用
        return runtime.applyGroupPresetForCurrentChat({ force: true, presetId });
    }

    function handleApplied(result) {
        if (destroyed) return;
        const current = settings.get() || {};
        // 只同步这次应用真正改动的分组；没有改动（或没有受影响信息）就不碰草稿里的分组开关，避免冲掉用户未保存的切换。
        const ids = new Set();
        if (result?.changed) {
            for (const item of (Array.isArray(result.affected) ? result.affected : [])) {
                if (item?.key) ids.add(item.key);
            }
        }
        if (ids.size) {
            try {
                syncGroupEnabled?.(current.characterGroups || [], [...ids]);
            } catch (error) {
                console.warn('[GroupPresets] 同步草稿分组开关失败:', error);
            }
        }
        refresh();
    }

    panel = createGroupPresetPanel({
        document,
        container,
        getLibrary,
        getPresets: readPresets,
        getApplied: () => settings.get()?.characterGroupPresetApplied ?? null,
        getActiveAvatars: () => runtime.getActiveCharacterAvatars(),
        listHostCharacters: () => runtime.listHostCharacters(),
        onPresetsChange: handlePresetsChange,
        onApply: handleApply,
        toast: notify,
    });

    const unsubscribers = [
        runtime.onGroupPresetApplied(handleApplied),
        runtime.onGroupPresetContextChanged(refresh),
    ];

    return {
        document,
        panel,
        render: refresh,
        /** 等待已提交的保存全部完成（测试 / 关闭前使用）。 */
        idle: () => saveChain,
        destroy() {
            if (destroyed) return;
            destroyed = true;
            unsubscribers.splice(0).forEach((off) => { try { off?.(); } catch { /* 取消订阅失败可忽略 */ } });
            panel?.destroy();
            panel = null;
        },
    };
}
