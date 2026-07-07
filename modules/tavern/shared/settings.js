/* eslint-disable -- generated from TypeScript source; run npm run build:tavern */
const TAVERN_CHAT_FONT_SIZES = ["small", "medium", "large"];
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function clampInteger(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.floor(number)));
}
function normalizeLoadBatchSize(value, fallback = 20) {
  return clampInteger(value, fallback, 1, 50);
}
function normalizeChatFontSize(value) {
  return value === "small" || value === "medium" || value === "large" ? value : "large";
}
function normalizeTavernDisplaySettings(value = {}) {
  const settings = asRecord(value);
  return {
    hiddenOutsideCount: clampInteger(settings.hiddenOutsideCount, 5, 1, 20),
    loadBatchSize: normalizeLoadBatchSize(settings.loadBatchSize, 20),
    chatFontSize: normalizeChatFontSize(settings.chatFontSize)
  };
}
export {
  TAVERN_CHAT_FONT_SIZES,
  normalizeTavernDisplaySettings
};
