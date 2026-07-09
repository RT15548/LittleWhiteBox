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
    const data = await AssistantStorage.load();
    data[SERVER_FILE_KEY] = next;
    AssistantStorage._dirtyVersion = (AssistantStorage._dirtyVersion || 0) + 1;
    await AssistantStorage.saveNow({ silent });
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
