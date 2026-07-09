/* eslint-disable -- generated from TypeScript source; run npm run build:tavern */
import { getRequestHeaders } from "../../../../../../../script.js";
import { AssistantStorage } from "../../../core/server-storage.js";
import { extensionFolderPath } from "../../../core/constants.js";
import {
  AGENT_SETTINGS_CONFIG_VERSION,
  normalizeAgentSettings,
  normalizeJsApiPermission,
  normalizePresetName
} from "../../agent-core/config.js";
import { listTavernChatPresetBundles } from "./chat-presets.js";
import { loadTavernDisplaySettings } from "./display-settings.js";
const SERVER_FILE_KEY = "settings";
async function loadTavernAgentConfig() {
  try {
    return normalizeAgentSettings(await AssistantStorage.get(SERVER_FILE_KEY, null) || {});
  } catch {
    return normalizeAgentSettings({});
  }
}
async function saveTavernAgentConfig(patch = {}, options = {}) {
  const silent = options.silent !== false;
  let current = null;
  try {
    current = await AssistantStorage.get(SERVER_FILE_KEY, null);
  } catch {
    current = null;
  }
  const normalizedCurrent = normalizeAgentSettings(current || {});
  const next = normalizeAgentSettings({
    ...normalizedCurrent,
    workspaceFileName: String(normalizedCurrent.workspaceFileName || ""),
    jsApiPermission: normalizeJsApiPermission(patch.jsApiPermission ?? normalizedCurrent.jsApiPermission),
    tavilyApiKey: patch.tavilyApiKey ?? normalizedCurrent.tavilyApiKey,
    tavilyBaseUrl: patch.tavilyBaseUrl ?? normalizedCurrent.tavilyBaseUrl,
    currentPresetName: normalizePresetName(String(patch.currentPresetName || normalizedCurrent.currentPresetName || "")),
    delegatePresetName: normalizePresetName(String(
      patch.delegatePresetName || normalizedCurrent.delegatePresetName || patch.currentPresetName || normalizedCurrent.currentPresetName || ""
    )),
    delegateConfig: patch.delegateConfig && typeof patch.delegateConfig === "object" ? patch.delegateConfig : normalizedCurrent.delegateConfig,
    presets: patch.presets && typeof patch.presets === "object" ? patch.presets : normalizedCurrent.presets,
    updatedAt: Date.now(),
    configVersion: AGENT_SETTINGS_CONFIG_VERSION
  });
  try {
    const data = await AssistantStorage.load();
    data[SERVER_FILE_KEY] = next;
    AssistantStorage._dirtyVersion = (AssistantStorage._dirtyVersion || 0) + 1;
    await AssistantStorage.saveNow({ silent });
    return { ok: true, config: next };
  } catch (error) {
    return {
      ok: false,
      config: next,
      error: error instanceof Error ? error.message : String(error || "unknown_error")
    };
  }
}
async function buildTavernFrameConfig(contextPayload = {}, options = {}) {
  options.onStartupProgress?.({ percent: 62, action: "loadFrameSettings" });
  const [agentConfig, tavernDisplaySettings] = await Promise.all([
    loadTavernAgentConfig(),
    loadTavernDisplaySettings()
  ]);
  options.onStartupProgress?.({ percent: 68, action: "buildChatPreset" });
  const chatPresetList = listTavernChatPresetBundles();
  options.onStartupProgress?.({ percent: 74, action: "attachHostHeaders" });
  const hostRequestHeaders = getRequestHeaders?.() || {};
  options.onStartupProgress?.({ percent: 80, action: "frameConfigReady" });
  return {
    agentConfig,
    tavernDisplaySettings,
    extensionBasePath: `/${extensionFolderPath}`,
    chatPreset: chatPresetList.active,
    chatPresetList,
    hostRequestHeaders,
    ...contextPayload
  };
}
export {
  buildTavernFrameConfig,
  loadTavernAgentConfig,
  saveTavernAgentConfig
};
