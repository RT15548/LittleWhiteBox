// SD WebUI / ComfyUI 设置页共用的“API 配置预设”接线：预设栏的创建与销毁、预设改动落盘、
// “保存”按钮把当前 API 配置同步回选中的预设。两个页面只提供各自的字段白名单、表单读写和页面选择器。
// （NovelAI 的设置页跑在 iframe 里，预设通过宿主消息落盘，不使用这个模块。）

import { createApiPresetBar } from './api-presets-ui.js';
import {
    normalizeApiPresetState,
    pickApiConfig,
    syncActiveApiPreset,
} from './api-presets.js';

/**
 * options:
 *  presetOptions                     Provider 定义的 API 字段白名单与规范化函数
 *  getSettings()                      当前已保存的设置
 *  getSettingsDocument(), querySettings(selector)   设置页的 document 与查询函数
 *  containerSelector                  预设栏挂载点（改动它自己的控件不触发预设栏刷新）
 *  panelSelector, formSelector        API 页容器及保存期间禁用的 fieldset
 *  readConfig(), fillConfig(config)   表单里现在的 API 配置 / 只把 API 配置字段填进表单
 *  persist(mutator)                   → Promise<boolean>，把 mutator 对设置草稿的修改落盘
 *  confirm / prompt                   可选，缺省用全局同名函数
 */
export function createApiPresetPage({
    presetOptions,
    getSettings,
    getSettingsDocument,
    querySettings,
    containerSelector,
    panelSelector,
    formSelector,
    readConfig,
    fillConfig,
    persist,
    confirm = message => globalThis.confirm(message),
    prompt = (message, fallback) => globalThis.prompt(message, fallback),
}) {
    const { fields, normalizeConfig } = presetOptions;
    let bar = null;

    const getEffectiveConfig = (settings = getSettings()) => pickApiConfig(normalizeConfig(settings), fields);

    async function commit(change) {
        const doc = getSettingsDocument();
        const incoming = normalizeApiPresetState(
            { apiPresets: change.apiPresets, activeApiPresetId: change.activeApiPresetId },
            presetOptions,
        );
        const applied = change.config ? normalizeConfig(change.config) : null;
        const ok = await persist((draft) => {
            draft.apiPresets = incoming.apiPresets;
            draft.activeApiPresetId = incoming.activeApiPresetId;
            if (applied) Object.assign(draft, applied);
        });
        if (ok && applied && getSettingsDocument() === doc) fillConfig(getEffectiveConfig());
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
            form: querySettings(formSelector),
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

    function runSave(operation) {
        const current = ensureBar();
        return current ? current.runSave(operation) : Promise.resolve(false);
    }

    return {
        ensureBar,
        render: () => bar?.render(),
        runSave,
        save() {
            return runSave(() => {
                const { apiPresets, activeApiPresetId } = getSettings();
                const config = readConfig();
                return commit({
                    reason: 'save',
                    activeApiPresetId,
                    config,
                    apiPresets: syncActiveApiPreset(apiPresets, activeApiPresetId, config, presetOptions),
                });
            });
        },
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
    };
}
