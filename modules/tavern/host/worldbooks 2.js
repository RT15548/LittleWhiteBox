/* eslint-disable -- generated from TypeScript source; run npm run build:tavern */
import {
  chat_metadata,
  characters,
  eventSource,
  getOneCharacter,
  name2,
  select_selected_character,
  setCharacterId,
  setCharacterName,
  extension_prompts,
  setExtensionPrompt,
  extension_prompt_types,
  this_chid,
  unshallowCharacter
} from "../../../../../../../script.js";
import * as stScript from "../../../../../../../script.js";
import { NOTE_MODULE_NAME } from "../../../../../../authors-note.js";
import { getContext } from "../../../../../../extensions.js";
import { power_user } from "../../../../../../power-user.js";
import { getCharaFilename } from "../../../../../../utils.js";
import * as nativeWorldInfo from "../../../../../../world-info.js";
import {
  charUpdatePrimaryWorld,
  checkWorldInfo,
  convertCharacterBook,
  getWorldInfoSettings,
  loadWorldInfo,
  METADATA_KEY,
  saveWorldInfo,
  selected_world_info,
  updateWorldInfoList,
  world_names
} from "../../../../../../world-info.js";
import {
  resolveXbTavernAuthorNoteState
} from "../shared/message-assembler.js";
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function getNativeMaxPromptTokens() {
  return Number(stScript.getMaxPromptTokens?.()) || Number(stScript.getMaxContextSize?.()) || Number(asRecord(getContext?.() || {}).maxContext) || 4096;
}
function applyGlobalWorldbookSelection(selected) {
  const settings = nativeWorldInfo.getWorldInfoSettings();
  if (typeof nativeWorldInfo.updateWorldInfoSettings === "function") {
    nativeWorldInfo.updateWorldInfoSettings(settings, selected);
    const worldInfo2 = asRecord(nativeWorldInfo.world_info);
    worldInfo2.globalSelect = [...selected];
    stScript.saveSettingsDebounced?.();
    return;
  }
  replaceSelectedWorldInfo(selected);
  const worldInfo = asRecord(nativeWorldInfo.world_info);
  worldInfo.globalSelect = [...selected];
  stScript.saveSettingsDebounced?.();
}
function normalizeText(value = "") {
  return String(value || "").trim();
}
function normalizeIdText(value = "") {
  return value === null || value === void 0 ? "" : String(value).trim();
}
function asEditableText(value = "") {
  return String(value ?? "");
}
function setValueByPath(target, path, value) {
  const parts = path.split(".").map((part) => part.trim()).filter(Boolean);
  if (!parts.length) {
    return;
  }
  let cursor = target;
  parts.slice(0, -1).forEach((part) => {
    const current = cursor[part];
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      cursor[part] = {};
    }
    cursor = cursor[part];
  });
  cursor[parts[parts.length - 1]] = cloneJson(value);
}
function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean);
  }
  const text = normalizeText(value);
  return text ? [text] : [];
}
function asRecordList(value) {
  return Array.isArray(value) ? value.map((item) => asRecord(item)).filter((item) => Object.keys(item).length > 0) : [];
}
function addUniqueWorldbookName(names, value) {
  normalizeStringList(value).forEach((name) => {
    if (!names.includes(name)) {
      names.push(name);
    }
  });
}
function normalizeFiniteNumber(value, fallback) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}
function normalizeNullableNumber(value) {
  if (value === "" || value === null || value === void 0) {
    return null;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}
function normalizeTriStateBoolean(value) {
  if (value === true || value === "true") {
    return true;
  }
  if (value === false || value === "false") {
    return false;
  }
  return null;
}
function normalizeDelayUntilRecursion(value) {
  if (value === true || value === "true") {
    return true;
  }
  if (value === false || value === "false" || value === "" || value === null || value === void 0) {
    return false;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? Math.floor(numberValue) : false;
}
function entryExtensionValue(entry, extensionKey, entryKey) {
  const extensions = asRecord(entry.extensions);
  return Object.prototype.hasOwnProperty.call(extensions, extensionKey) ? extensions[extensionKey] : entry[entryKey];
}
function normalizeWorldbookPosition(value) {
  if (normalizeText(value) === "after_char") {
    return 1;
  }
  if (normalizeText(value) === "before_char") {
    return 0;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}
function normalizeWorldbookDepth(position, depth) {
  return normalizeWorldbookPosition(position) === 4 ? normalizeNullableNumber(depth) ?? 4 : null;
}
function cloneJson(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}
function captureExtensionPrompts() {
  return Object.fromEntries(
    Object.entries(extension_prompts || {}).map(([key, value]) => [key, { ...asRecord(value) }])
  );
}
function restoreExtensionPrompts(snapshot) {
  Object.keys(extension_prompts || {}).forEach((key) => {
    delete extension_prompts[key];
  });
  Object.entries(snapshot).forEach(([key, value]) => {
    extension_prompts[key] = { ...value };
  });
}
function readWorldbookEntries(data) {
  const entries = asRecord(data).entries;
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
    return [];
  }
  return Object.values(entries).map((entry) => asRecord(entry)).filter((entry) => Object.keys(entry).length > 0);
}
function readWorldbookEntrySlots(data) {
  const entries = asRecord(data).entries;
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
    return [];
  }
  return Object.entries(entries).map(([key, entry], index) => ({
    key,
    index,
    entry: asRecord(entry)
  })).filter((slot) => Object.keys(slot.entry).length > 0);
}
function stableStringify(value) {
  if (value === void 0) {
    return "undefined";
  }
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const record = value;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}
function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
function buildWorldbookEntryHash(entry) {
  return hashString(stableStringify(entry));
}
function findWorldbookEntrySlot(data, uid) {
  const targetUid = normalizeIdText(uid);
  if (!targetUid) {
    return null;
  }
  return readWorldbookEntrySlots(data).find((slot) => normalizeIdText(slot.entry.uid ?? slot.entry.id ?? slot.index) === targetUid || normalizeIdText(slot.key) === targetUid) || null;
}
function buildWorldbookEntryDraft(name, slot) {
  const entry = slot.entry;
  const entryHash = buildWorldbookEntryHash(entry);
  const keysecondary = normalizeStringList(entry.keysecondary).length ? normalizeStringList(entry.keysecondary) : normalizeStringList(entry.secondary_keys);
  const position = normalizeWorldbookPosition(entryExtensionValue(entry, "position", "position"));
  const vectorized = entryExtensionValue(entry, "vectorized", "vectorized") === true;
  const probability = normalizeNullableNumber(entryExtensionValue(entry, "probability", "probability"));
  return {
    worldbookName: name,
    uid: normalizeIdText(entry.uid ?? entry.id ?? slot.index),
    comment: asEditableText(entry.comment),
    key: normalizeStringList(entry.key),
    keysecondary,
    secondary_keys: keysecondary,
    content: asEditableText(entry.content),
    disable: entry.disable === true,
    enabled: entry.disable !== true,
    constant: entry.constant === true,
    vectorized,
    order: Number.isFinite(Number(entry.order)) ? Number(entry.order) : 100,
    position,
    role: Math.floor(normalizeFiniteNumber(entryExtensionValue(entry, "role", "role"), 0)),
    depth: normalizeWorldbookDepth(position, entryExtensionValue(entry, "depth", "depth")),
    probability: probability ?? 100,
    useProbability: entryExtensionValue(entry, "useProbability", "useProbability") !== false && probability !== null,
    selective: entry.selective === true,
    selectiveLogic: Math.floor(normalizeFiniteNumber(entry.selectiveLogic, 0)),
    scanDepth: normalizeNullableNumber(entryExtensionValue(entry, "scan_depth", "scanDepth")),
    caseSensitive: normalizeTriStateBoolean(entryExtensionValue(entry, "case_sensitive", "caseSensitive")),
    matchWholeWords: normalizeTriStateBoolean(entryExtensionValue(entry, "match_whole_words", "matchWholeWords")),
    useGroupScoring: normalizeTriStateBoolean(entryExtensionValue(entry, "use_group_scoring", "useGroupScoring")),
    outletName: asEditableText(entryExtensionValue(entry, "outlet_name", "outletName")),
    automationId: asEditableText(entryExtensionValue(entry, "automation_id", "automationId")),
    ignoreBudget: entryExtensionValue(entry, "ignore_budget", "ignoreBudget") === true,
    excludeRecursion: entryExtensionValue(entry, "exclude_recursion", "excludeRecursion") === true,
    preventRecursion: entryExtensionValue(entry, "prevent_recursion", "preventRecursion") === true,
    delayUntilRecursion: normalizeDelayUntilRecursion(entryExtensionValue(entry, "delay_until_recursion", "delayUntilRecursion")),
    group: asEditableText(entryExtensionValue(entry, "group", "group")),
    groupOverride: entryExtensionValue(entry, "group_override", "groupOverride") === true,
    groupWeight: normalizeNullableNumber(entryExtensionValue(entry, "group_weight", "groupWeight")),
    sticky: normalizeNullableNumber(entryExtensionValue(entry, "sticky", "sticky")),
    cooldown: normalizeNullableNumber(entryExtensionValue(entry, "cooldown", "cooldown")),
    delay: normalizeNullableNumber(entryExtensionValue(entry, "delay", "delay")),
    triggers: normalizeStringList(entryExtensionValue(entry, "triggers", "triggers")),
    matchPersonaDescription: entryExtensionValue(entry, "match_persona_description", "matchPersonaDescription") === true,
    matchCharacterDescription: entryExtensionValue(entry, "match_character_description", "matchCharacterDescription") === true,
    matchCharacterPersonality: entryExtensionValue(entry, "match_character_personality", "matchCharacterPersonality") === true,
    matchCharacterDepthPrompt: entryExtensionValue(entry, "match_character_depth_prompt", "matchCharacterDepthPrompt") === true,
    matchScenario: entryExtensionValue(entry, "match_scenario", "matchScenario") === true,
    matchCreatorNotes: entryExtensionValue(entry, "match_creator_notes", "matchCreatorNotes") === true,
    entryHash,
    revision: entryHash
  };
}
function patchWorldbookEntry(entry, draft) {
  if ("comment" in draft) {
    entry.comment = asEditableText(draft.comment);
  }
  if ("key" in draft || "keys" in draft) {
    entry.key = normalizeStringList(draft.key ?? draft.keys);
  }
  if ("keysecondary" in draft || "secondaryKeys" in draft) {
    const keysecondary = normalizeStringList(draft.keysecondary);
    entry.keysecondary = keysecondary.length ? keysecondary : normalizeStringList(draft.secondary_keys ?? draft.secondaryKeys);
  }
  if ("secondary_keys" in entry && ("secondary_keys" in draft || "secondaryKeys" in draft)) {
    const keysecondary = normalizeStringList(draft.keysecondary);
    entry.secondary_keys = keysecondary.length ? keysecondary : normalizeStringList(draft.secondary_keys ?? draft.secondaryKeys);
  }
  if ("content" in draft) {
    entry.content = asEditableText(draft.content);
  }
  if ("disable" in draft) {
    entry.disable = draft.disable === true;
  }
  if ("enabled" in draft && !("disable" in draft)) {
    entry.disable = draft.enabled === false;
  }
  if ("constant" in draft) {
    entry.constant = draft.constant === true;
  }
  if ("vectorized" in draft) {
    entry.vectorized = draft.vectorized === true;
  }
  if (entry.constant === true) {
    entry.vectorized = false;
  }
  if (entry.vectorized === true) {
    entry.constant = false;
  }
  if ("order" in draft) {
    const order = Number(draft.order);
    if (Number.isFinite(order)) {
      entry.order = order;
    }
  }
  if ("position" in draft) {
    entry.position = normalizeWorldbookPosition(draft.position);
  }
  if ("role" in draft) {
    entry.role = Math.floor(normalizeFiniteNumber(draft.role, 0));
  }
  if ("depth" in draft) {
    entry.depth = normalizeNullableNumber(draft.depth);
  }
  entry.depth = normalizeWorldbookDepth(entry.position, entry.depth);
  if ("probability" in draft) {
    entry.probability = normalizeNullableNumber(draft.probability);
  }
  if ("useProbability" in draft) {
    entry.useProbability = draft.useProbability === true;
    if (entry.useProbability === false) {
      entry.probability = null;
    } else if (normalizeNullableNumber(entry.probability) === null) {
      entry.probability = 100;
    }
  }
  if ("selective" in draft) {
    entry.selective = draft.selective === true;
  }
  if ("selectiveLogic" in draft) {
    entry.selectiveLogic = Math.floor(normalizeFiniteNumber(draft.selectiveLogic, 0));
  }
  if ("scanDepth" in draft) {
    entry.scanDepth = normalizeNullableNumber(draft.scanDepth);
  }
  if ("caseSensitive" in draft) {
    entry.caseSensitive = normalizeTriStateBoolean(draft.caseSensitive);
  }
  if ("matchWholeWords" in draft) {
    entry.matchWholeWords = normalizeTriStateBoolean(draft.matchWholeWords);
  }
  if ("useGroupScoring" in draft) {
    entry.useGroupScoring = normalizeTriStateBoolean(draft.useGroupScoring);
  }
  if ("outletName" in draft) {
    entry.outletName = asEditableText(draft.outletName);
  }
  if ("automationId" in draft) {
    entry.automationId = asEditableText(draft.automationId);
  }
  if ("ignoreBudget" in draft) {
    entry.ignoreBudget = draft.ignoreBudget === true;
  }
  if ("excludeRecursion" in draft) {
    entry.excludeRecursion = draft.excludeRecursion === true;
  }
  if ("preventRecursion" in draft) {
    entry.preventRecursion = draft.preventRecursion === true;
  }
  if ("delayUntilRecursion" in draft) {
    entry.delayUntilRecursion = normalizeDelayUntilRecursion(draft.delayUntilRecursion);
  }
  if ("group" in draft) {
    entry.group = asEditableText(draft.group);
  }
  if ("groupOverride" in draft) {
    entry.groupOverride = draft.groupOverride === true;
  }
  if ("groupWeight" in draft) {
    entry.groupWeight = normalizeNullableNumber(draft.groupWeight);
  }
  if ("sticky" in draft) {
    entry.sticky = normalizeNullableNumber(draft.sticky);
  }
  if ("cooldown" in draft) {
    entry.cooldown = normalizeNullableNumber(draft.cooldown);
  }
  if ("delay" in draft) {
    entry.delay = normalizeNullableNumber(draft.delay);
  }
  if ("triggers" in draft) {
    entry.triggers = normalizeStringList(draft.triggers);
  }
  if ("matchPersonaDescription" in draft) {
    entry.matchPersonaDescription = draft.matchPersonaDescription === true;
  }
  if ("matchCharacterDescription" in draft) {
    entry.matchCharacterDescription = draft.matchCharacterDescription === true;
  }
  if ("matchCharacterPersonality" in draft) {
    entry.matchCharacterPersonality = draft.matchCharacterPersonality === true;
  }
  if ("matchCharacterDepthPrompt" in draft) {
    entry.matchCharacterDepthPrompt = draft.matchCharacterDepthPrompt === true;
  }
  if ("matchScenario" in draft) {
    entry.matchScenario = draft.matchScenario === true;
  }
  if ("matchCreatorNotes" in draft) {
    entry.matchCreatorNotes = draft.matchCreatorNotes === true;
  }
}
function syncWorldbookOriginalDataEntry(data, uid, entry) {
  const originalData = asRecord(data.originalData);
  const originalEntries = Array.isArray(originalData.entries) ? originalData.entries : [];
  if (!originalEntries.length) {
    return;
  }
  const originalEntry = originalEntries.map((item) => asRecord(item)).find((item) => normalizeIdText(item.uid) === uid || normalizeIdText(item.id) === uid);
  if (!originalEntry) {
    return;
  }
  const mappings = [
    ["comment", entry.comment],
    ["content", entry.content],
    ["keys", normalizeStringList(entry.key)],
    ["secondary_keys", normalizeStringList(entry.keysecondary)],
    ["insertion_order", Number.isFinite(Number(entry.order)) ? Number(entry.order) : 100],
    ["constant", entry.constant === true],
    ["enabled", entry.disable !== true],
    ["selective", entry.selective === true],
    ["selectiveLogic", Math.floor(normalizeFiniteNumber(entry.selectiveLogic, 0))],
    ["position", normalizeWorldbookPosition(entry.position) === 0 ? "before_char" : "after_char"],
    ["extensions.position", normalizeWorldbookPosition(entry.position)],
    ["extensions.role", Math.floor(normalizeFiniteNumber(entry.role, 0))],
    ["extensions.depth", normalizeWorldbookDepth(entry.position, entry.depth)],
    ["extensions.probability", entry.useProbability === false ? null : normalizeNullableNumber(entry.probability) ?? 100],
    ["extensions.useProbability", entry.useProbability !== false],
    ["extensions.vectorized", entry.vectorized === true],
    ["extensions.scan_depth", normalizeNullableNumber(entry.scanDepth)],
    ["extensions.case_sensitive", normalizeTriStateBoolean(entry.caseSensitive)],
    ["extensions.match_whole_words", normalizeTriStateBoolean(entry.matchWholeWords)],
    ["extensions.use_group_scoring", normalizeTriStateBoolean(entry.useGroupScoring)],
    ["extensions.outlet_name", asEditableText(entry.outletName)],
    ["extensions.automation_id", asEditableText(entry.automationId)],
    ["extensions.ignore_budget", entry.ignoreBudget === true],
    ["extensions.exclude_recursion", entry.excludeRecursion === true],
    ["extensions.prevent_recursion", entry.preventRecursion === true],
    ["extensions.delay_until_recursion", normalizeDelayUntilRecursion(entry.delayUntilRecursion)],
    ["extensions.group", asEditableText(entry.group)],
    ["extensions.group_override", entry.groupOverride === true],
    ["extensions.group_weight", normalizeNullableNumber(entry.groupWeight)],
    ["extensions.sticky", normalizeNullableNumber(entry.sticky)],
    ["extensions.cooldown", normalizeNullableNumber(entry.cooldown)],
    ["extensions.delay", normalizeNullableNumber(entry.delay)],
    ["extensions.triggers", normalizeStringList(entry.triggers)],
    ["extensions.match_persona_description", entry.matchPersonaDescription === true],
    ["extensions.match_character_description", entry.matchCharacterDescription === true],
    ["extensions.match_character_personality", entry.matchCharacterPersonality === true],
    ["extensions.match_character_depth_prompt", entry.matchCharacterDepthPrompt === true],
    ["extensions.match_scenario", entry.matchScenario === true],
    ["extensions.match_creator_notes", entry.matchCreatorNotes === true]
  ];
  mappings.forEach(([path, value]) => setValueByPath(originalEntry, path, value));
}
function previewEntryName(entry, index) {
  return normalizeText(entry.comment) || `\u6761\u76EE ${index + 1}`;
}
function readHistoryMessages(context = {}) {
  return Array.isArray(context.history) ? context.history : [];
}
function ensureTimedBucket(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const result = {};
  Object.entries(value).forEach(([key, item]) => {
    if (!key || !item || typeof item !== "object" || Array.isArray(item)) {
      return;
    }
    const source = item;
    const normalized = {};
    const hash = Number(source.hash);
    const start = Number(source.start);
    const end = Number(source.end);
    if (Number.isFinite(hash)) {
      normalized.hash = hash;
    }
    if (Number.isFinite(start)) {
      normalized.start = start;
    }
    if (Number.isFinite(end)) {
      normalized.end = end;
    }
    if (source.protected === true) {
      normalized.protected = true;
    }
    if (Object.keys(normalized).length) {
      result[key] = normalized;
    }
  });
  return result;
}
function normalizeTimedState(value) {
  const source = asRecord(value);
  return {
    sticky: ensureTimedBucket(source.sticky),
    cooldown: ensureTimedBucket(source.cooldown)
  };
}
function valuesToRecordList(value) {
  if (!value || typeof value !== "object") {
    return [];
  }
  const maybeValues = value.values;
  if (typeof maybeValues !== "function") {
    return [];
  }
  return Array.from(maybeValues.call(value)).map((entry) => asRecord(entry)).filter((entry) => Object.keys(entry).length > 0);
}
function replaceSelectedWorldInfo(names = []) {
  if (!Array.isArray(selected_world_info)) {
    return;
  }
  selected_world_info.splice(0, selected_world_info.length, ...names);
}
function liveSelectedGlobalWorldbookNames() {
  return Array.isArray(selected_world_info) ? selected_world_info.map((name) => normalizeText(name)).filter(Boolean) : [];
}
function liveCharacterWorldbookNames(context = {}) {
  const nativeCharacterId = normalizeIdText(context.character?.nativeCharacterId);
  const character = nativeCharacterId ? getCharacterRecordById(nativeCharacterId) : {};
  if (!Object.keys(character).length) {
    return null;
  }
  if (character.shallow === true || !normalizeText(character.json_data)) {
    return null;
  }
  const data = readCharacterData(character);
  const extensions = asRecord(data.extensions);
  const characterBook = readCharacterBook(character);
  const names = [];
  addUniqueWorldbookName(names, extensions.world);
  addUniqueWorldbookName(names, character.world);
  if (!hasCharacterBookEntries(characterBook)) {
    addUniqueWorldbookName(names, characterBook.name);
  }
  const characterLoreIds = [];
  addUniqueWorldbookName(characterLoreIds, character.avatar);
  addUniqueWorldbookName(characterLoreIds, data.avatar);
  try {
    addUniqueWorldbookName(characterLoreIds, getCharaFilename(nativeCharacterId));
  } catch {
  }
  const characterLoreIdSet = new Set(characterLoreIds);
  asRecordList(asRecord(nativeWorldInfo.world_info).charLore).forEach((entry) => {
    if (characterLoreIdSet.has(normalizeText(entry.name))) {
      addUniqueWorldbookName(names, entry.extraBooks);
    }
  });
  return new Set(names);
}
function dedupeSources(sources = []) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  sources.forEach((source, index) => {
    const name = normalizeText(source.name);
    if (!name || seen.has(name)) {
      return;
    }
    seen.add(name);
    result.push({
      name,
      ...source.sourceType ? { sourceType: source.sourceType } : {},
      ...Number.isFinite(Number(source.sourceIndex)) ? { sourceIndex: Number(source.sourceIndex) } : { sourceIndex: index }
    });
  });
  return result;
}
function isLittleWhiteBoxRuntimeWorldbookSource(source) {
  const sourceType = normalizeText(source?.sourceType);
  return sourceType === "character" || sourceType === "global";
}
function collectRuntimeSources(context = {}) {
  const sessionMeta = asRecord(context.sessionMeta);
  const liveGlobalNames = new Set(liveSelectedGlobalWorldbookNames());
  const liveCharacterNames = liveCharacterWorldbookNames(context);
  const liveGlobalSources = Array.from(liveGlobalNames).map((name, index) => ({
    name,
    sourceType: "global",
    sourceIndex: index
  }));
  const liveCharacterSources = liveCharacterNames === null ? [] : Array.from(liveCharacterNames).filter((name) => !liveGlobalNames.has(name)).map((name, index) => ({
    name,
    sourceType: "character",
    sourceIndex: index
  }));
  const keepLiveRuntimeSource = (source) => (source.sourceType !== "global" || liveGlobalNames.has(source.name)) && (source.sourceType !== "character" || liveCharacterNames === null || liveCharacterNames.has(source.name));
  const metaSources = Array.isArray(sessionMeta.worldbookSources) ? sessionMeta.worldbookSources.map((source, index) => {
    const record = asRecord(source);
    return {
      name: normalizeText(record.name),
      sourceType: normalizeText(record.sourceType),
      sourceIndex: Number.isFinite(Number(record.sourceIndex)) ? Number(record.sourceIndex) : index
    };
  }) : [];
  const legacyMetaSources = !metaSources.length && Array.isArray(sessionMeta.worldbookNames) ? sessionMeta.worldbookNames.map((name, index) => ({
    name: normalizeText(name),
    sourceType: "global",
    sourceIndex: index
  })) : [];
  const bookSources = Array.isArray(context.worldBooks) ? context.worldBooks.map((book, index) => ({
    name: normalizeText(book.name),
    sourceType: normalizeText(book.worldSourceType),
    sourceIndex: Number.isFinite(Number(book.worldSourceIndex)) ? Number(book.worldSourceIndex) : index
  })) : [];
  return dedupeSources(
    [...liveGlobalSources, ...liveCharacterSources, ...metaSources, ...legacyMetaSources, ...bookSources].filter(isLittleWhiteBoxRuntimeWorldbookSource).filter(keepLiveRuntimeSource)
  );
}
function buildHistoryScanLines(context = {}, currentUserMessage = "", includeNames = false) {
  const userName = normalizeText(context.user?.name) || "User";
  const characterName = normalizeText(context.character?.name) || "Assistant";
  const lines = readHistoryMessages(context).filter((message) => ["user", "assistant"].includes(normalizeText(message.role))).map((message) => {
    const role = normalizeText(message.role) === "user" || message.is_user === true ? "user" : "assistant";
    const content = normalizeText(message.content || message.mes || message.message);
    if (!content) {
      return "";
    }
    if (!includeNames) {
      return content;
    }
    const speaker = role === "user" ? normalizeText(message.name) || userName : normalizeText(message.name) || characterName;
    return `${speaker}: ${content}`;
  }).filter(Boolean);
  const current = normalizeText(currentUserMessage);
  if (current) {
    lines.push(includeNames ? `${userName}: ${current}` : current);
  }
  return lines.reverse();
}
function buildExplicitScanLines(scanText = "") {
  return String(scanText || "").split(/\r?\n/).map((line) => normalizeText(line)).filter(Boolean).reverse();
}
function buildGlobalScanData(input = {}) {
  const context = input.context || {};
  const character = context.character || {};
  const characterRecord = asRecord(character);
  const user = context.user || {};
  const data = asRecord(character.data);
  const extensions = asRecord(data.extensions);
  const depthPrompt = asRecord(extensions.depth_prompt);
  const legacyDepthPrompt = asRecord(data.depth_prompt);
  return {
    personaDescription: normalizeText(user.persona || user.description),
    characterDescription: normalizeText(character.description || data.description),
    characterPersonality: normalizeText(character.personality || data.personality),
    characterDepthPrompt: normalizeText(
      characterRecord.characterDepthPrompt || characterRecord.character_depth_prompt || depthPrompt.prompt || data.character_depth_prompt || legacyDepthPrompt.prompt || data.depth_prompt
    ),
    scenario: normalizeText(character.scenario || data.scenario),
    creatorNotes: normalizeText(character.creatorNotes || character.creator_notes || data.creator_notes),
    trigger: normalizeText(input.trigger || context.worldSettings?.trigger) || "normal"
  };
}
function describeActivationReason(entry) {
  if (entry.constant === true) {
    return "constant";
  }
  return "native";
}
function normalizePromptEntryRole(value) {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric;
  }
  return 0;
}
function buildActivatedPromptEntries(entries, sources) {
  const sourceByName = new Map(sources.map((source) => [normalizeText(source.name), source]));
  return entries.map((entry, index) => {
    const sourceWorldBook = normalizeText(entry.world || entry.sourceWorldBook);
    const source = sourceByName.get(sourceWorldBook);
    const uid = entry.uid ?? entry.id ?? index;
    return {
      uid,
      id: uid,
      key: normalizeStringList(entry.key),
      keysecondary: normalizeStringList(entry.keysecondary),
      secondary_keys: normalizeStringList(entry.secondary_keys),
      comment: normalizeText(entry.comment),
      title: normalizeText(entry.title),
      name: normalizeText(entry.name),
      content: normalizeText(entry.content),
      order: Number(entry.order ?? 100),
      position: Number(entry.position ?? 0),
      role: normalizePromptEntryRole(entry.role),
      depth: Number.isFinite(Number(entry.depth)) ? Number(entry.depth) : 0,
      constant: entry.constant === true,
      disable: entry.disable === true,
      enabled: entry.disable !== true,
      vectorized: entry.vectorized === true,
      decorators: Array.isArray(entry.decorators) ? cloneJson(entry.decorators) : [],
      selective: entry.selective === true,
      selectiveLogic: Number.isFinite(Number(entry.selectiveLogic)) ? Number(entry.selectiveLogic) : 0,
      scanDepth: Number.isFinite(Number(entry.scanDepth)) ? Number(entry.scanDepth) : null,
      caseSensitive: normalizeTriStateBoolean(entry.caseSensitive) ?? void 0,
      matchWholeWords: normalizeTriStateBoolean(entry.matchWholeWords) ?? void 0,
      ignoreBudget: entry.ignoreBudget === true,
      excludeRecursion: entry.excludeRecursion === true,
      preventRecursion: entry.preventRecursion === true,
      delayUntilRecursion: entry.delayUntilRecursion,
      characterFilter: cloneJson(entry.characterFilter),
      group: normalizeText(entry.group),
      groupOverride: entry.groupOverride === true,
      groupWeight: Number.isFinite(Number(entry.groupWeight)) ? Number(entry.groupWeight) : void 0,
      useGroupScoring: typeof entry.useGroupScoring === "boolean" ? entry.useGroupScoring : null,
      matchPersonaDescription: entry.matchPersonaDescription === true,
      matchCharacterDescription: entry.matchCharacterDescription === true,
      matchCharacterPersonality: entry.matchCharacterPersonality === true,
      matchCharacterDepthPrompt: entry.matchCharacterDepthPrompt === true,
      matchScenario: entry.matchScenario === true,
      matchCreatorNotes: entry.matchCreatorNotes === true,
      probability: Number.isFinite(Number(entry.probability)) ? Number(entry.probability) : void 0,
      useProbability: entry.useProbability !== false,
      sticky: entry.sticky,
      cooldown: Number.isFinite(Number(entry.cooldown)) ? Number(entry.cooldown) : void 0,
      delay: Number.isFinite(Number(entry.delay)) ? Number(entry.delay) : void 0,
      triggers: normalizeStringList(entry.triggers),
      outletName: normalizeText(entry.outletName),
      sourceWorldBook,
      worldSourceType: source?.sourceType,
      worldSourceIndex: source?.sourceIndex,
      extensions: {
        nativeActivationReason: describeActivationReason(entry)
      },
      activationReason: describeActivationReason(entry)
    };
  }).filter((entry) => !!normalizeText(entry.content));
}
function captureRuntimeState() {
  return {
    selectedWorldInfo: Array.isArray(selected_world_info) ? [...selected_world_info] : [],
    chatLore: normalizeText(chat_metadata?.[METADATA_KEY]),
    personaLore: normalizeText(power_user?.persona_description_lorebook),
    // Only capture ST's current native character pointer so temporary native switches can be restored.
    nativeCharacterId: normalizeText(this_chid),
    characterName: normalizeText(name2),
    timedState: normalizeTimedState(chat_metadata?.timedWorldInfo),
    extensionPrompts: captureExtensionPrompts(),
    emit: eventSource?.emit
  };
}
function applyRuntimeState(input) {
  const globalNames = input.sources.filter((source) => source.sourceType === "global").map((source) => normalizeText(source.name)).filter(Boolean);
  replaceSelectedWorldInfo(globalNames);
  const chatLore = input.sources.find((source) => source.sourceType === "chat")?.name || "";
  const personaLore = input.sources.find((source) => source.sourceType === "persona")?.name || "";
  if (chatLore) {
    chat_metadata[METADATA_KEY] = chatLore;
  } else {
    delete chat_metadata[METADATA_KEY];
  }
  power_user.persona_description_lorebook = personaLore || "";
  setCharacterId(normalizeText(input.context.character?.nativeCharacterId) || void 0);
  if (normalizeText(input.context.character?.name)) {
    setCharacterName(normalizeText(input.context.character?.name));
  }
  chat_metadata.timedWorldInfo = cloneJson(normalizeTimedState(input.timedState));
  if (eventSource && typeof eventSource.emit === "function") {
    eventSource.emit = async () => void 0;
  }
}
function applyAuthorNoteInjectScanPrompt(context = {}, currentUserMessage = "") {
  const state = resolveXbTavernAuthorNoteState(context, currentUserMessage);
  setExtensionPrompt(
    NOTE_MODULE_NAME,
    state.shouldAddPrompt ? state.prompt : "",
    state.shouldAddPrompt ? state.position : Number(extension_prompt_types.NONE),
    state.depth,
    state.shouldAddPrompt && state.scan,
    state.role
  );
}
function restoreRuntimeState(snapshot) {
  replaceSelectedWorldInfo(snapshot.selectedWorldInfo);
  if (snapshot.chatLore) {
    chat_metadata[METADATA_KEY] = snapshot.chatLore;
  } else {
    delete chat_metadata[METADATA_KEY];
  }
  power_user.persona_description_lorebook = snapshot.personaLore || "";
  setCharacterId(snapshot.nativeCharacterId || void 0);
  setCharacterName(snapshot.characterName || "");
  chat_metadata.timedWorldInfo = cloneJson(snapshot.timedState);
  restoreExtensionPrompts(snapshot.extensionPrompts);
  if (eventSource) {
    eventSource.emit = snapshot.emit;
  }
}
let tavernWorldbookStateQueue = Promise.resolve();
async function runTavernWorldbookStateExclusive(task) {
  const previous = tavernWorldbookStateQueue;
  let release = () => {
  };
  tavernWorldbookStateQueue = new Promise((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    return await task();
  } finally {
    release();
  }
}
function getCharacterRecordById(nativeCharacterId) {
  const normalizedId = normalizeIdText(nativeCharacterId);
  const numericId = Number(normalizedId);
  if (!normalizedId || !Number.isInteger(numericId) || numericId < 0) {
    return {};
  }
  const list = Array.isArray(characters) ? characters : [];
  return asRecord(list[numericId]);
}
async function hydrateCharacterRecordById(nativeCharacterId) {
  const normalizedId = normalizeIdText(nativeCharacterId);
  const numericId = Number(normalizedId);
  if (!Number.isInteger(numericId) || numericId < 0) {
    return {};
  }
  const character = getCharacterRecordById(normalizedId);
  const avatar = normalizeText(character.avatar);
  if (avatar && avatar !== "none" && (character.shallow === true || !normalizeText(character.json_data))) {
    if (character.shallow === true) {
      await unshallowCharacter(String(numericId));
    } else {
      await getOneCharacter(avatar);
    }
  }
  return getCharacterRecordById(normalizedId);
}
async function prepareCharacterEditorForWorldbookBinding(nativeCharacterId) {
  const normalizedId = normalizeIdText(nativeCharacterId);
  const numericId = Number(normalizedId);
  if (!Number.isInteger(numericId) || numericId < 0 || !Object.keys(getCharacterRecordById(normalizedId)).length) {
    throw new Error("\u5F53\u524D\u89D2\u8272\u672A\u627E\u5230\uFF0C\u65E0\u6CD5\u7ED1\u5B9A\u4E16\u754C\u4E66\u3002");
  }
  select_selected_character(numericId, { switchMenu: false });
  await Promise.resolve();
}
function getJQuery() {
  const candidate = globalThis.$;
  return typeof candidate === "function" ? candidate : null;
}
function readJQueryData(selector, key) {
  return getJQuery()?.(selector).data(key);
}
function captureCharacterEditorJQueryData() {
  const jq = getJQuery();
  if (!jq) {
    return [];
  }
  const slots = [
    { selector: ".open_alternate_greetings", key: "chid" },
    { selector: "#set_character_world", key: "chid" }
  ];
  return slots.flatMap((slot) => {
    const items = [];
    jq(slot.selector).each(function captureDataSlot() {
      const value = jq(this).data(slot.key);
      items.push({
        element: this,
        key: slot.key,
        value,
        hadValue: value !== void 0
      });
    });
    return items;
  });
}
function captureCharacterEditorSnapshot() {
  const form = document.querySelector("#form_create");
  const controls = Array.from(document.querySelectorAll(
    "#form_create input, #form_create select, #form_create textarea"
  )).filter((control) => !(control instanceof HTMLInputElement && control.type === "file")).map((control) => ({
    control,
    value: control.value,
    ...control instanceof HTMLInputElement && ["checkbox", "radio"].includes(control.type) ? { checked: control.checked } : {},
    ...control instanceof HTMLSelectElement && control.multiple ? { selectedValues: Array.from(control.selectedOptions).map((option) => option.value) } : {}
  }));
  return {
    actionType: form instanceof HTMLFormElement ? form.getAttribute("actiontype") : null,
    controls,
    jqueryData: captureCharacterEditorJQueryData()
  };
}
function restoreCharacterEditorSnapshot(snapshot) {
  if (!snapshot) {
    return;
  }
  const form = document.querySelector("#form_create");
  if (form instanceof HTMLFormElement) {
    if (snapshot.actionType === null) {
      form.removeAttribute("actiontype");
    } else {
      form.setAttribute("actiontype", snapshot.actionType);
    }
  }
  snapshot.controls.forEach((item) => {
    const control = item.control;
    if (!control.isConnected) {
      return;
    }
    if (control instanceof HTMLSelectElement && control.multiple && item.selectedValues) {
      Array.from(control.options).forEach((option) => {
        option.selected = item.selectedValues?.includes(option.value) === true;
      });
      return;
    }
    control.value = item.value;
    if (control instanceof HTMLInputElement && item.checked !== void 0) {
      control.checked = item.checked;
    }
  });
  const jq = getJQuery();
  if (!jq) {
    return;
  }
  snapshot.jqueryData.forEach((item) => {
    if (!item.element.isConnected) {
      return;
    }
    if (item.hadValue) {
      jq(item.element).data(item.key, item.value);
    } else {
      jq(item.element).removeData(item.key);
    }
  });
}
function isCharacterEditorFocusedOn(nativeCharacterId) {
  const targetId = normalizeIdText(nativeCharacterId);
  if (!targetId) {
    return false;
  }
  const form = document.querySelector("#form_create");
  if (form instanceof HTMLFormElement && form.getAttribute("actiontype") === "createcharacter") {
    return false;
  }
  const worldEditorId = normalizeIdText(readJQueryData("#set_character_world", "chid"));
  const greetingsEditorId = normalizeIdText(readJQueryData(".open_alternate_greetings", "chid"));
  return worldEditorId === targetId && greetingsEditorId === targetId;
}
async function bindCharacterWorldbookThroughEditor(nativeCharacterId, name) {
  const shouldPrepareEditor = !isCharacterEditorFocusedOn(nativeCharacterId);
  const snapshot = shouldPrepareEditor ? captureCharacterEditorSnapshot() : null;
  try {
    if (shouldPrepareEditor) {
      await prepareCharacterEditorForWorldbookBinding(nativeCharacterId);
    }
    await charUpdatePrimaryWorld(name);
  } finally {
    restoreCharacterEditorSnapshot(snapshot);
  }
  const state = await readCharacterWorldbookState(nativeCharacterId);
  if (state.boundWorldbookName !== name || state.boundExists !== true) {
    throw new Error(`\u89D2\u8272\u4E16\u754C\u4E66\u7ED1\u5B9A\u672A\u4FDD\u5B58\u6210\u529F\uFF1A${name}`);
  }
  return state;
}
function readWorldbookBindingState(character, names) {
  const characterData = readCharacterData(character);
  const extensions = asRecord(characterData.extensions);
  const boundWorldbookName = normalizeText(extensions.world);
  return {
    boundWorldbookName,
    boundExists: !!boundWorldbookName && names.includes(boundWorldbookName)
  };
}
function readEmbeddedWorldbookState(character) {
  const book = readCharacterBook(character);
  return {
    hasEmbeddedBook: hasCharacterBookEntries(book),
    embeddedBookName: characterBookName(character, book)
  };
}
function buildCharacterWorldbookState(requestedId, character, names, options) {
  const includeBinding = options?.includeBinding !== false;
  const includeEmbedded = options?.includeEmbedded !== false;
  const bindingState = includeBinding ? readWorldbookBindingState(character, names) : { boundWorldbookName: "", boundExists: false };
  const embeddedState = includeEmbedded ? readEmbeddedWorldbookState(character) : { hasEmbeddedBook: false, embeddedBookName: "" };
  const characterData = readCharacterData(character);
  return {
    nativeCharacterId: requestedId,
    characterName: normalizeText(character.name) || normalizeText(characterData.name),
    ...bindingState,
    ...embeddedState,
    worldbookOptions: names
  };
}
function readCharacterData(character) {
  return asRecord(character.data);
}
function readCharacterBook(character) {
  return asRecord(readCharacterData(character).character_book);
}
function hasCharacterBookEntries(book) {
  return Array.isArray(book.entries) && book.entries.length > 0;
}
function characterBookName(character, book) {
  const characterName = normalizeText(character.name) || normalizeText(readCharacterData(character).name) || "Character";
  return normalizeText(book.name) || `${characterName}'s Lorebook`;
}
async function readCharacterWorldbookState(nativeCharacterId) {
  const requestedId = normalizeIdText(nativeCharacterId);
  const names = await ensureWorldbookNames();
  const character = await hydrateCharacterRecordById(requestedId);
  return buildCharacterWorldbookState(requestedId, character, names, {
    includeBinding: true,
    includeEmbedded: true
  });
}
async function readGlobalWorldbooksState() {
  const options = await ensureWorldbookNames();
  const selected = liveSelectedGlobalWorldbookNames().filter((name) => options.includes(name));
  return { options, selected };
}
async function ensureWorldbookNames() {
  if (!Array.isArray(world_names) || !world_names.length) {
    await updateWorldInfoList();
  }
  return Array.isArray(world_names) ? [...world_names] : [];
}
async function listTavernWorldbookSources(_input = {}) {
  return runTavernWorldbookStateExclusive(async () => {
    const names = await ensureWorldbookNames();
    const globalNameSet = new Set(liveSelectedGlobalWorldbookNames());
    return {
      books: names.map((name) => ({
        name,
        globalActive: globalNameSet.has(name)
      }))
    };
  });
}
async function getTavernWorldbookPreview(input = {}) {
  return runTavernWorldbookStateExclusive(async () => {
    const payload = asRecord(input);
    const name = normalizeText(payload.name);
    if (!name) {
      throw new Error("\u7F3A\u5C11\u4E16\u754C\u4E66\u540D\u79F0\u3002");
    }
    const names = await ensureWorldbookNames();
    if (!names.includes(name)) {
      throw new Error(`\u627E\u4E0D\u5230\u4E16\u754C\u4E66\uFF1A${name}`);
    }
    const data = await loadWorldInfo(name);
    const entries = readWorldbookEntries(data);
    const limit = Math.max(1, Math.floor(Number(payload.limit) || 24));
    const previewEntries = entries.map((entry, index) => {
      const keys = normalizeStringList(entry.key);
      const secondaryKeys = normalizeStringList(entry.keysecondary || entry.secondary_keys);
      const content = normalizeText(entry.content);
      return {
        uid: normalizeIdText(entry.uid ?? entry.id ?? index),
        name: previewEntryName(entry, index),
        keys,
        secondaryKeys,
        contentPreview: content,
        enabled: entry.disable !== true,
        constant: entry.constant === true,
        vectorized: entryExtensionValue(entry, "vectorized", "vectorized") === true,
        order: Number.isFinite(Number(entry.order)) ? Number(entry.order) : 100,
        position: normalizeWorldbookPosition(entryExtensionValue(entry, "position", "position")),
        role: Math.floor(normalizeFiniteNumber(entryExtensionValue(entry, "role", "role"), 0)),
        depth: normalizeNullableNumber(entryExtensionValue(entry, "depth", "depth")),
        probability: normalizeNullableNumber(entryExtensionValue(entry, "probability", "probability"))
      };
    }).sort((a, b) => Number(b.order) - Number(a.order)).slice(0, limit);
    return {
      name,
      entryCount: entries.length,
      enabledCount: entries.filter((entry) => entry.disable !== true).length,
      constantCount: entries.filter((entry) => entry.constant === true).length,
      disabledCount: entries.filter((entry) => entry.disable === true).length,
      keywordCount: entries.reduce((sum, entry) => sum + normalizeStringList(entry.key).length + normalizeStringList(entry.keysecondary || entry.secondary_keys).length, 0),
      totalChars: entries.reduce((sum, entry) => sum + normalizeText(entry.content).length, 0),
      entries: previewEntries
    };
  });
}
async function getTavernWorldbookEntry(input = {}) {
  return runTavernWorldbookStateExclusive(async () => {
    const payload = asRecord(input);
    const name = normalizeText(payload.name || payload.worldbookName);
    const uid = normalizeIdText(payload.uid);
    if (!name) {
      throw new Error("\u7F3A\u5C11\u4E16\u754C\u4E66\u540D\u79F0\u3002");
    }
    if (!uid) {
      throw new Error("\u7F3A\u5C11\u4E16\u754C\u4E66\u6761\u76EE UID\u3002");
    }
    const names = await ensureWorldbookNames();
    if (!names.includes(name)) {
      throw new Error(`\u627E\u4E0D\u5230\u4E16\u754C\u4E66\uFF1A${name}`);
    }
    const data = await loadWorldInfo(name);
    const slot = findWorldbookEntrySlot(data, uid);
    if (!slot) {
      throw new Error(`\u627E\u4E0D\u5230\u4E16\u754C\u4E66\u6761\u76EE\uFF1A${uid}`);
    }
    return buildWorldbookEntryDraft(name, slot);
  });
}
async function saveTavernWorldbookEntry(input = {}) {
  return runTavernWorldbookStateExclusive(async () => {
    const payload = asRecord(input);
    const name = normalizeText(payload.name || payload.worldbookName);
    const uid = normalizeIdText(payload.uid);
    const entryHash = normalizeText(payload.entryHash || payload.revision);
    const draft = asRecord(payload.draft || payload.entry || payload);
    if (!name) {
      throw new Error("\u7F3A\u5C11\u4E16\u754C\u4E66\u540D\u79F0\u3002");
    }
    if (!uid) {
      throw new Error("\u7F3A\u5C11\u4E16\u754C\u4E66\u6761\u76EE UID\u3002");
    }
    if (!entryHash) {
      throw new Error("\u7F3A\u5C11\u4E16\u754C\u4E66\u6761\u76EE\u7248\u672C\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\u540E\u518D\u4FDD\u5B58\u3002");
    }
    const names = await ensureWorldbookNames();
    if (!names.includes(name)) {
      throw new Error(`\u627E\u4E0D\u5230\u4E16\u754C\u4E66\uFF1A${name}`);
    }
    const data = await loadWorldInfo(name);
    const slot = findWorldbookEntrySlot(data, uid);
    if (!slot) {
      throw new Error(`\u627E\u4E0D\u5230\u4E16\u754C\u4E66\u6761\u76EE\uFF1A${uid}`);
    }
    const currentHash = buildWorldbookEntryHash(slot.entry);
    if (currentHash !== entryHash) {
      throw new Error("\u8FD9\u4E2A\u4E16\u754C\u4E66\u6761\u76EE\u5DF2\u7ECF\u5728\u9152\u9986\u91CC\u88AB\u4FEE\u6539\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\u540E\u518D\u4FDD\u5B58\u3002");
    }
    patchWorldbookEntry(slot.entry, draft);
    syncWorldbookOriginalDataEntry(asRecord(data), uid, slot.entry);
    await saveWorldInfo(name, data, true);
    void updateWorldInfoList().catch((error) => {
      console.warn("[LittleWhiteBox/tavern] Failed to refresh worldbook list after entry save", name, error);
    });
    return buildWorldbookEntryDraft(name, slot);
  });
}
async function getTavernCharacterWorldbookState(input = {}) {
  return runTavernWorldbookStateExclusive(async () => {
    const payload = asRecord(input);
    return readCharacterWorldbookState(normalizeIdText(payload.nativeCharacterId));
  });
}
async function activateTavernCharacterWorldbook(input = {}) {
  return runTavernWorldbookStateExclusive(async () => {
    const payload = asRecord(input);
    const state = await readCharacterWorldbookState(normalizeIdText(payload.nativeCharacterId));
    if (state.boundWorldbookName && state.boundExists) {
      return { action: "selected", name: state.boundWorldbookName, state };
    }
    const character = await hydrateCharacterRecordById(state.nativeCharacterId);
    const book = readCharacterBook(character);
    if (hasCharacterBookEntries(book)) {
      const name = characterBookName(character, book);
      if (state.worldbookOptions.includes(name) && payload.confirmed !== true) {
        return { action: "needs_import_confirmation", name, state };
      }
      const convertedBook = convertCharacterBook(book);
      await saveWorldInfo(name, convertedBook, true);
      await updateWorldInfoList();
      const boundState = await bindCharacterWorldbookThroughEditor(state.nativeCharacterId, name);
      return {
        action: "imported",
        name,
        state: boundState
      };
    }
    return {
      action: "needs_selection",
      worldbookOptions: state.worldbookOptions,
      state
    };
  });
}
async function bindTavernCharacterWorldbook(input = {}) {
  return runTavernWorldbookStateExclusive(async () => {
    const payload = asRecord(input);
    const nativeCharacterId = normalizeIdText(payload.nativeCharacterId);
    const state = await readCharacterWorldbookState(nativeCharacterId);
    const name = normalizeText(payload.name);
    if (!name) {
      throw new Error("\u7F3A\u5C11\u8981\u7ED1\u5B9A\u7684\u4E16\u754C\u4E66\u540D\u79F0\u3002");
    }
    if (!state.worldbookOptions.includes(name)) {
      throw new Error(`\u627E\u4E0D\u5230\u4E16\u754C\u4E66\uFF1A${name}`);
    }
    return bindCharacterWorldbookThroughEditor(nativeCharacterId, name);
  });
}
async function getTavernGlobalWorldbooks() {
  return runTavernWorldbookStateExclusive(() => readGlobalWorldbooksState());
}
async function setTavernGlobalWorldbooks(input = {}) {
  return runTavernWorldbookStateExclusive(async () => {
    const payload = asRecord(input);
    const options = await ensureWorldbookNames();
    const selected = normalizeStringList(payload.selected).filter((name) => options.includes(name));
    applyGlobalWorldbookSelection(selected);
    await updateWorldInfoList();
    return readGlobalWorldbooksState();
  });
}
async function getTavernWorldbookRuntime(input = {}) {
  const payload = asRecord(input);
  const context = payload.context || {};
  const includeNames = context.worldSettings?.includeNames === true || getWorldInfoSettings().world_info_include_names === true;
  const chatLines = typeof context.worldSettings?.scanText === "string" ? buildExplicitScanLines(context.worldSettings.scanText) : buildHistoryScanLines(context, payload.currentUserMessage, includeNames);
  const globalScanData = buildGlobalScanData(payload);
  const maxContext = Math.max(
    1,
    Number(payload.maxContext) || getNativeMaxPromptTokens()
  );
  return runTavernWorldbookStateExclusive(async () => {
    const nativeCharacterId = normalizeIdText(context.character?.nativeCharacterId);
    if (nativeCharacterId) {
      try {
        await hydrateCharacterRecordById(nativeCharacterId);
      } catch (error) {
        console.warn("[LittleWhiteBox/tavern] Failed to hydrate character before worldbook runtime", nativeCharacterId, error);
      }
    }
    const sources = collectRuntimeSources(context);
    const snapshot = captureRuntimeState();
    applyRuntimeState({
      context,
      sources,
      timedState: normalizeTimedState(payload.timedState)
    });
    applyAuthorNoteInjectScanPrompt(context, payload.currentUserMessage || "");
    try {
      const activated = await checkWorldInfo(chatLines, maxContext, false, globalScanData);
      const activatedPromptEntries = buildActivatedPromptEntries(
        valuesToRecordList(activated.allActivatedEntries),
        sources
      );
      return {
        trigger: normalizeText(globalScanData.trigger),
        sourceNames: sources,
        activatedEntries: activatedPromptEntries,
        worldInfoBefore: normalizeText(activated.worldInfoBefore),
        worldInfoAfter: normalizeText(activated.worldInfoAfter),
        worldInfoExamples: Array.isArray(activated.EMEntries) ? activated.EMEntries.map((entry) => ({
          position: normalizeIdText(asRecord(entry).position),
          content: normalizeText(asRecord(entry).content)
        })).filter((entry) => entry.content) : [],
        worldInfoDepth: Array.isArray(activated.WIDepthEntries) ? activated.WIDepthEntries.map((entry) => ({
          depth: Number(asRecord(entry).depth),
          role: Number(asRecord(entry).role),
          entries: normalizeStringList(asRecord(entry).entries)
        })).filter((entry) => Array.isArray(entry.entries) && entry.entries.length) : [],
        anBefore: normalizeStringList(activated.ANBeforeEntries),
        anAfter: normalizeStringList(activated.ANAfterEntries),
        outlets: Object.fromEntries(
          Object.entries(asRecord(activated.outletEntries)).map(([key, value]) => [key, normalizeStringList(value)]).filter(([, value]) => value.length)
        ),
        timedState: normalizeTimedState(chat_metadata?.timedWorldInfo)
      };
    } finally {
      restoreRuntimeState(snapshot);
    }
  });
}
export {
  activateTavernCharacterWorldbook,
  bindTavernCharacterWorldbook,
  getTavernCharacterWorldbookState,
  getTavernGlobalWorldbooks,
  getTavernWorldbookEntry,
  getTavernWorldbookPreview,
  getTavernWorldbookRuntime,
  listTavernWorldbookSources,
  saveTavernWorldbookEntry,
  setTavernGlobalWorldbooks
};
