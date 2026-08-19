/* eslint-disable -- generated from TypeScript source; run npm run build:tavern */
import { AssistantStorage } from "../../../core/server-storage.js";
import { normalizeTavernDisplaySettings } from "../shared/settings.js";
const SERVER_FILE_KEY = "tavern-display-settings";
async function loadTavernDisplaySettings() {
  try {
    return normalizeTavernDisplaySettings(await AssistantStorage.get(SERVER_FILE_KEY, null) || {});
  } catch {
    return normalizeTavernDisplaySettings({});
  }
}
async function saveTavernDisplaySettings(patch = {}, options = {}) {
  const silent = options.silent !== false;
  const next = normalizeTavernDisplaySettings(patch);
  try {
    const saved = await AssistantStorage.setAndSave(SERVER_FILE_KEY, next, { silent });
    if (!saved) {
      throw new Error("\u5C0F\u767D\u9152\u9986\u663E\u793A\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25");
    }
    return { ok: true, displaySettings: next };
  } catch (error) {
    return {
      ok: false,
      displaySettings: next,
      error: error instanceof Error ? error.message : String(error || "unknown_error")
    };
  }
}
export {
  loadTavernDisplaySettings,
  saveTavernDisplaySettings
};
