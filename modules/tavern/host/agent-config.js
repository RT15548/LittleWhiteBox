/* eslint-disable -- generated from TypeScript source; run npm run build:tavern */
import { getRequestHeaders } from "../../../../../../../script.js";
import { AssistantStorage } from "../../../core/server-storage.js";
import { extensionFolderPath } from "../../../core/constants.js";
import {
  loadSharedAgentSettings,
  saveSharedAgentSettings
} from "../../agent-core/settings-repository.js";
import { listTavernChatPresetBundles } from "./chat-presets.js";
import { loadTavernDisplaySettings } from "./display-settings.js";
async function loadTavernAgentConfig() {
  return await loadSharedAgentSettings({ storage: AssistantStorage });
}
async function loadTavernAgentConfigPayload() {
  try {
    return {
      agentConfig: await loadTavernAgentConfig(),
      agentConfigLoadError: ""
    };
  } catch (error) {
    return {
      agentConfig: null,
      agentConfigLoadError: `\u5171\u4EAB Agent API \u914D\u7F6E\u8BFB\u53D6\u5931\u8D25\uFF1A${error instanceof Error ? error.message : String(error || "unknown_error")}`
    };
  }
}
async function saveTavernAgentConfig(patch = {}, options = {}) {
  return await saveSharedAgentSettings(patch, {
    storage: AssistantStorage,
    silent: options.silent !== false,
    source: "tavern"
  });
}
async function buildTavernFrameConfig(contextPayload = {}, options = {}) {
  options.onStartupProgress?.({ percent: 62, action: "loadFrameSettings" });
  const [agentConfigPayload, tavernDisplaySettings] = await Promise.all([
    loadTavernAgentConfigPayload(),
    loadTavernDisplaySettings()
  ]);
  options.onStartupProgress?.({ percent: 68, action: "buildChatPreset" });
  const chatPresetList = listTavernChatPresetBundles();
  options.onStartupProgress?.({ percent: 74, action: "attachHostHeaders" });
  const hostRequestHeaders = getRequestHeaders?.() || {};
  options.onStartupProgress?.({ percent: 80, action: "frameConfigReady" });
  return {
    ...agentConfigPayload,
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
  loadTavernAgentConfigPayload,
  saveTavernAgentConfig
};
