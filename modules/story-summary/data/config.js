import { extension_settings } from "../../../../../../extensions.js";
import { EXT_ID } from "../../../core/constants.js";
import { xbLog } from "../../../core/debug-core.js";
import { CommonSettingStorage } from "../../../core/server-storage.js";

const MODULE_ID = "summaryConfig";
const SUMMARY_CONFIG_KEY = "storySummaryPanelConfig";

const DEFAULT_FILTER_RULES = [
    { start: "<think>", end: "</think>" },
    { start: "<thinking>", end: "</thinking>" },
    { start: "```", end: "```" },
];

export function getSettings() {
    const ext = (extension_settings[EXT_ID] ||= {});
    ext.storySummary ||= { enabled: true };
    return ext;
}

export function getSummaryPanelConfig() {
    const defaults = {
        api: { provider: "st", url: "", key: "", model: "", modelCache: [] },
        gen: { temperature: null, top_p: null, top_k: null, presence_penalty: null, frequency_penalty: null },
        trigger: {
            enabled: false,
            interval: 20,
            timing: "before_user",
            role: "system",
            useStream: true,
            maxPerRun: 100,
            wrapperHead: "",
            wrapperTail: "",
            forceInsertAtEnd: false,
        },
        textFilterRules: [...DEFAULT_FILTER_RULES],
        vector: null,
    };

    try {
        const raw = localStorage.getItem("summary_panel_config");
        if (!raw) return defaults;
        const parsed = JSON.parse(raw);

        const textFilterRules = Array.isArray(parsed.textFilterRules)
            ? parsed.textFilterRules
            : (Array.isArray(parsed.vector?.textFilterRules)
                ? parsed.vector.textFilterRules
                : defaults.textFilterRules);

        const result = {
            api: { ...defaults.api, ...(parsed.api || {}) },
            gen: { ...defaults.gen, ...(parsed.gen || {}) },
            trigger: { ...defaults.trigger, ...(parsed.trigger || {}) },
            textFilterRules,
            vector: parsed.vector || null,
        };

        if (result.trigger.timing === "manual") result.trigger.enabled = false;
        if (result.trigger.useStream === undefined) result.trigger.useStream = true;

        return result;
    } catch {
        return defaults;
    }
}

export function saveSummaryPanelConfig(config) {
    try {
        localStorage.setItem("summary_panel_config", JSON.stringify(config));
        CommonSettingStorage.set(SUMMARY_CONFIG_KEY, config);
    } catch (e) {
        xbLog.error(MODULE_ID, "保存面板配置失败", e);
    }
}

export function getVectorConfig() {
    try {
        const raw = localStorage.getItem("summary_panel_config");
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        const cfg = parsed.vector || null;
        if (!cfg) return null;

        // Keep vector side normalized to online + siliconflow.
        cfg.engine = "online";
        cfg.online = cfg.online || {};
        cfg.online.provider = "siliconflow";
        cfg.online.model = "BAAI/bge-m3";

        return cfg;
    } catch {
        return null;
    }
}

export function getTextFilterRules() {
    const cfg = getSummaryPanelConfig();
    return Array.isArray(cfg?.textFilterRules)
        ? cfg.textFilterRules
        : DEFAULT_FILTER_RULES;
}

export function saveVectorConfig(vectorCfg) {
    try {
        const raw = localStorage.getItem("summary_panel_config") || "{}";
        const parsed = JSON.parse(raw);

        parsed.vector = {
            enabled: !!vectorCfg?.enabled,
            engine: "online",
            online: {
                provider: "siliconflow",
                key: vectorCfg?.online?.key || "",
                model: "BAAI/bge-m3",
            },
        };

        localStorage.setItem("summary_panel_config", JSON.stringify(parsed));
        CommonSettingStorage.set(SUMMARY_CONFIG_KEY, parsed);
    } catch (e) {
        xbLog.error(MODULE_ID, "保存向量配置失败", e);
    }
}

export async function loadConfigFromServer() {
    try {
        const savedConfig = await CommonSettingStorage.get(SUMMARY_CONFIG_KEY, null);
        if (savedConfig) {
            localStorage.setItem("summary_panel_config", JSON.stringify(savedConfig));
            xbLog.info(MODULE_ID, "已从服务端加载面板配置");
            return savedConfig;
        }
    } catch (e) {
        xbLog.warn(MODULE_ID, "加载面板配置失败", e);
    }
    return null;
}
