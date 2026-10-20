// SD WebUI / ComfyUI 设置页共用的“API 配置预设”接线：预设栏的创建与销毁、预设改动落盘、
// “保存”按钮把当前 API 配置同步回选中的预设。两个页面只提供各自的字段白名单、表单读写和页面选择器。
// （NovelAI 的设置页跑在 iframe 里，预设通过宿主消息落盘，不使用这个模块。）

import { createApiPresetBar } from './api-presets-ui.js';
import {
    findApiPreset,
    normalizeApiPresetState,
    pickApiConfig,
    syncActiveApiPreset,
} from './api-presets.js';

/**
 * options:
 *  fields, normalizeConfig            API 配置字段白名单与规范化函数
 *  getSettings()                      当前已保存的设置
 *  getSettingsDocument(), querySettings(selector)   设置页的 document 与查询函数
 *  containerSelector                  预设栏挂载点（改动它自己的控件不触发预设栏刷新）
 *  panelSelector                      “API 配置”页的容器（里面任何改动都刷新预设栏）
 *  readConfig(), fillConfig(config)   表单里现在的 API 配置 / 只把 API 配置字段填进表单
 *  persist(mutator)                   → Promise<boolean>，把 mutator 对设置草稿的修改落盘
 *  confirm / prompt                   可选，缺省用全局同名函数
 */
export function createApiPresetPage({
    fields,
    normalizeConfig,
    getSettings,
    getSettingsDocument,
    querySettings,
    containerSelector,
    panelSelector,
    readConfig,
    fillConfig,
    persist,
    confirm = message => globalThis.confirm(message),
    prompt = (message, fallback) => globalThis.prompt(message, fallback),
}) {
    const options = Object.freeze({ fields, normalizeConfig });
    let bar = null;

    const getEffectiveConfig = (settings = getSettings()) => pickApiConfig(normalizeConfig(settings), fields);

    async function commit(change) {
        const incoming = normalizeApiPresetState(
            { apiPresets: change.apiPresets, activeApiPresetId: change.activeApiPresetId },
            options,
        );
        const applied = change.config ? normalizeConfig(change.config) : null;
        const ok = await persist((draft) => {
            draft.apiPresets = incoming.apiPresets;
            draft.activeApiPresetId = incoming.activeApiPresetId;
            if (applied) Object.assign(draft, applied);
        });
        if (ok && change.reason === 'select') fillConfig(getEffectiveConfig());
        return ok;
    }

    function ensureBar() {
        const doc = getSettingsDocument();
        const container = querySettings(containerSelector);
        if (!doc || !container) return null;
        if (bar?.document === doc) {
            bar.render();
            return bar;
        }
        bar?.destroy();
        bar = createApiPresetBar({
            document: doc,
            container,
            fields,
            defaults: normalizeConfig({}),
            getState: () => {
                const { apiPresets, activeApiPresetId } = getSettings();
                return { apiPresets, activeApiPresetId };
            },
            readConfig,
            getEffectiveConfig: () => getEffectiveConfig(),
            onCommit: commit,
            confirm,
            prompt,
        });
        return bar;
    }

    const activeName = (settings = getSettings()) => findApiPreset(settings.apiPresets, settings.activeApiPresetId)?.name || '';

    return {
        options,
        getEffectiveConfig,
        ensureBar,
        render: () => bar?.render(),
        refresh: () => bar?.refresh(),
        destroy() {
            bar?.destroy();
            bar = null;
        },
        /** “API 配置”页里任何改动都刷新预设栏的“与预设一致 / 不一致”状态（预设栏自己的操作除外）。 */
        bindFormRefresh() {
            ['input', 'change', 'click'].forEach((type) => {
                querySettings(panelSelector)?.addEventListener(type, (event) => {
                    if (event.target?.closest?.(containerSelector)) return;
                    bar?.refresh();
                });
            });
        },
        activeName,
        /** “保存”按钮的成功提示：同步了预设时带上预设名，否则用 fallback。 */
        savedText(syncApiPreset, fallback) {
            const name = syncApiPreset ? activeName() : '';
            return name ? `已保存，并同步到 API 预设「${name}」` : fallback;
        },
        /** “保存”按钮：选中了 API 预设时，把这次保存的 API 配置同步回该预设。 */
        withSynced(form) {
            const active = findApiPreset(form.apiPresets, form.activeApiPresetId);
            if (!active) return form;
            return {
                ...form,
                apiPresets: syncActiveApiPreset(form.apiPresets, active.id, normalizeConfig(form), options),
            };
        },
    };
}
