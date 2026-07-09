/* eslint-disable -- generated from TypeScript source; run npm run build:tavern */
import { saveSettingsDebounced } from "../../../../../../../script.js";
import { getPresetManager } from "../../../../../../preset-manager.js";
import { promptManager } from "../../../../../../openai.js";
function createFallbackTavernChatPromptPresetBundle() {
  return {
    id: "sillytavern-current-chat-prompt",
    name: "\u9152\u9986\u5F53\u524D\u804A\u5929\u9884\u8BBE",
    source: "sillytavern",
    selected: true,
    sections: []
  };
}
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function asArray(value) {
  return Array.isArray(value) ? value : [];
}
function cloneJson(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}
function normalizeText(value = "") {
  return String(value || "").trim();
}
function normalizeTavernChatPromptPresetBundle(input = {}) {
  const fallback = createFallbackTavernChatPromptPresetBundle();
  return {
    id: normalizeText(input.id) || fallback.id,
    name: normalizeText(input.name) || fallback.name,
    source: normalizeText(input.source) || "sillytavern",
    selected: input.selected !== false,
    promptManager: input.promptManager,
    systemPrompt: input.systemPrompt,
    contextTemplate: input.contextTemplate,
    instructTemplate: input.instructTemplate,
    sections: Array.isArray(input.sections) ? input.sections.filter((section) => normalizeText(section.content) || section.marker === true) : [],
    updatedAt: Number(input.updatedAt) || void 0
  };
}
function normalizePromptRole(value) {
  const role = normalizeText(value).toLowerCase();
  return role === "user" || role === "assistant" ? role : "system";
}
function resolvePromptPlacement(prompt) {
  const identifier = normalizeText(prompt.identifier || prompt.id).toLowerCase();
  if (identifier === "jailbreak") {
    return "afterHistory";
  }
  const injectionPosition = Number(prompt.injection_position);
  if (Number.isFinite(injectionPosition) && injectionPosition > 0) {
    return "afterHistory";
  }
  const position = normalizeText(prompt.position).toLowerCase();
  if (position.includes("after")) {
    return "afterHistory";
  }
  if (position.includes("depth") || Number.isFinite(Number(prompt.injection_depth))) {
    return "beforeHistory";
  }
  return "beforeHistory";
}
function buildPromptManagerSections(prompts = []) {
  const sections = [];
  prompts.forEach((item, index) => {
    const prompt = asRecord(item);
    const content = normalizeText(prompt.content);
    const marker = prompt.marker === true;
    if (!content && !marker || prompt.enabled === false || prompt.disabled === true) {
      return;
    }
    const identifier = normalizeText(prompt.identifier || prompt.id || `prompt-${index + 1}`);
    sections.push({
      id: `prompt-manager:${identifier}`,
      label: normalizeText(prompt.name || prompt.label || identifier),
      enabled: true,
      marker,
      role: normalizePromptRole(prompt.role),
      content,
      placement: resolvePromptPlacement(prompt),
      source: "promptManager"
    });
  });
  return sections;
}
function getSelectedPromptManagerPreset() {
  const manager = getRequiredPromptManager();
  const promptPresetName = normalizeText(manager?.getSelectedPresetName?.());
  if (!promptPresetName) {
    throw new Error("\u804A\u5929\u9884\u8BBE\u672A\u540C\u6B65\uFF1A\u9152\u9986\u5F53\u524D\u672A\u9009\u62E9 Prompt Manager \u9884\u8BBE\u3002");
  }
  const preset = asRecord(manager?.getCompletionPresetByName?.(promptPresetName));
  if (!Object.keys(preset).length) {
    throw new Error(`\u804A\u5929\u9884\u8BBE\u672A\u540C\u6B65\uFF1A\u65E0\u6CD5\u8BFB\u53D6\u9152\u9986\u5F53\u524D\u9884\u8BBE\u300C${promptPresetName}\u300D\u3002`);
  }
  if (!Array.isArray(preset.prompts)) {
    throw new Error("\u804A\u5929\u9884\u8BBE\u672A\u540C\u6B65\uFF1A\u5F53\u524D\u9884\u8BBE\u7F3A\u5C11 prompts\u3002");
  }
  if (!Array.isArray(preset.prompt_order)) {
    throw new Error("\u804A\u5929\u9884\u8BBE\u672A\u540C\u6B65\uFF1A\u5F53\u524D\u9884\u8BBE\u7F3A\u5C11 prompt_order\u3002");
  }
  return cloneJson(preset);
}
function getActivePromptManagerCharacterId() {
  const runtime = promptManager;
  return normalizeText(asRecord(runtime?.activeCharacter).id);
}
function replaceActivePromptOrder(existingPromptOrder, activeCharacterId, nextOrder = []) {
  const containers = asArray(existingPromptOrder).map((container) => ({ ...asRecord(container) }));
  const targetIndex = containers.findIndex((container) => normalizeText(container.character_id) === activeCharacterId);
  const target = targetIndex >= 0 ? containers[targetIndex] : { character_id: activeCharacterId };
  const replacement = {
    ...target,
    character_id: target?.character_id ?? activeCharacterId,
    order: cloneJson(nextOrder)
  };
  if (targetIndex >= 0) {
    containers[targetIndex] = replacement;
  } else {
    containers.push(replacement);
  }
  return containers;
}
function pickPromptManagerRuntimeFields(source = {}) {
  const result = {};
  if (Array.isArray(source.prompts)) {
    result.prompts = cloneJson(source.prompts);
  }
  if (Array.isArray(source.prompt_order)) {
    result.prompt_order = cloneJson(source.prompt_order);
  }
  return result;
}
function getRequiredPromptManager() {
  const manager = getPresetManager("openai");
  if (!manager) {
    throw new Error("\u672A\u8BFB\u53D6\u5230\u9152\u9986 Prompt Manager\u3002");
  }
  return manager;
}
function assertPromptManagerRuntimeReady(targetName = "") {
  const selectedName = normalizeText(getPresetManager("openai")?.getSelectedPresetName?.());
  const expectedName = normalizeText(targetName);
  if (expectedName && selectedName !== expectedName) {
    throw new Error(`\u804A\u5929\u9884\u8BBE\u5207\u6362\u5931\u8D25\uFF1A\u5F53\u524D\u4ECD\u662F\u300C${selectedName || "\u672A\u9009\u62E9"}\u300D\u3002`);
  }
  const serviceSettings = asRecord(promptManager?.serviceSettings);
  if (!Array.isArray(serviceSettings.prompts)) {
    throw new Error("\u804A\u5929\u9884\u8BBE\u5207\u6362\u5931\u8D25\uFF1A\u672A\u540C\u6B65 prompts\u3002");
  }
  if (!Array.isArray(serviceSettings.prompt_order)) {
    throw new Error("\u804A\u5929\u9884\u8BBE\u5207\u6362\u5931\u8D25\uFF1A\u672A\u540C\u6B65 prompt_order\u3002");
  }
}
function setPromptManagerSelectedPresetName(name = "") {
  const manager = getRequiredPromptManager();
  const presetName = normalizeText(name);
  if (!presetName) {
    throw new Error("\u804A\u5929\u9884\u8BBE\u540D\u79F0\u4E3A\u7A7A\u3002");
  }
  const value = manager.findPreset?.(presetName);
  if (value === void 0 || value === null) {
    throw new Error(`\u804A\u5929\u9884\u8BBE\u4E0D\u5B58\u5728\uFF1A${presetName}`);
  }
  if (typeof manager.selectPreset === "function") {
    manager.selectPreset(value);
  } else {
    manager.select?.val?.(value);
  }
  assertPromptManagerRuntimeReady(presetName);
}
function buildCurrentBundle() {
  const promptPresetName = normalizeText(getPresetManager("openai")?.getSelectedPresetName?.());
  const rawPreset = getSelectedPromptManagerPreset();
  const promptManagerRuntime = promptManager;
  const activeCharacter = asRecord(promptManagerRuntime?.activeCharacter);
  const activeCharacterId = activeCharacter.id;
  const activeOrder = Array.isArray(promptManagerRuntime?.getPromptOrderForCharacter?.(promptManagerRuntime.activeCharacter)) ? promptManagerRuntime.getPromptOrderForCharacter(promptManagerRuntime.activeCharacter) : [];
  const sections = [
    ...buildPromptManagerSections(asArray(rawPreset.prompts))
  ];
  return normalizeTavernChatPromptPresetBundle({
    id: promptPresetName || createFallbackTavernChatPromptPresetBundle().id,
    name: promptPresetName || createFallbackTavernChatPromptPresetBundle().name,
    source: "sillytavern",
    selected: true,
    promptManager: {
      name: promptPresetName,
      prompts: cloneJson(asArray(rawPreset.prompts)),
      promptOrder: cloneJson(rawPreset.prompt_order),
      rawPreset,
      activeCharacterId,
      activeOrder: cloneJson(activeOrder)
    },
    sections,
    updatedAt: Date.now()
  });
}
function getComponentNames() {
  return {
    promptManager: getPresetManager("openai")?.getAllPresets?.() || []
  };
}
function listTavernChatPresetBundles() {
  const active = buildCurrentBundle();
  return {
    active,
    bundles: [active],
    components: getComponentNames()
  };
}
function getTavernChatPresetBundle() {
  return buildCurrentBundle();
}
function stableJson(value) {
  return JSON.stringify(value ?? null);
}
function promptOrderForCharacter(promptOrder, characterId = "") {
  const targetId = normalizeText(characterId);
  if (!targetId) {
    return [];
  }
  const container = asArray(promptOrder).find((item) => normalizeText(asRecord(item).character_id) === targetId);
  return asArray(asRecord(container).order);
}
function assertSavedPromptManagerPreset(manager, name, patch, activeCharacterId, activeOrder) {
  const saved = asRecord(manager.getCompletionPresetByName?.(name));
  if (!Object.keys(saved).length) {
    throw new Error(`\u804A\u5929\u9884\u8BBE\u4FDD\u5B58\u540E\u65E0\u6CD5\u8BFB\u53D6\uFF1A${name}`);
  }
  if (Array.isArray(patch.prompts) && stableJson(saved.prompts) !== stableJson(patch.prompts)) {
    throw new Error("\u804A\u5929\u9884\u8BBE\u4FDD\u5B58\u5931\u8D25\uFF1Aprompts \u672A\u5199\u56DE\u9152\u9986\u3002");
  }
  if (Array.isArray(patch.prompt_order) && activeCharacterId && stableJson(promptOrderForCharacter(saved.prompt_order, activeCharacterId)) !== stableJson(activeOrder)) {
    throw new Error("\u804A\u5929\u9884\u8BBE\u4FDD\u5B58\u5931\u8D25\uFF1A\u5F53\u524D\u89D2\u8272 prompt_order \u672A\u5199\u56DE\u9152\u9986\u3002");
  }
}
async function savePromptManagerPreset(bundle) {
  const manager = getRequiredPromptManager();
  const name = normalizeText(bundle.promptManager?.name);
  if (!name) {
    throw new Error("\u804A\u5929\u9884\u8BBE\u540D\u79F0\u4E3A\u7A7A\u3002");
  }
  if (typeof manager.savePreset !== "function") {
    throw new Error("\u9152\u9986 Prompt Manager \u4E0D\u652F\u6301\u4FDD\u5B58\u9884\u8BBE\u3002");
  }
  const selectedName = normalizeText(manager.getSelectedPresetName?.());
  if (selectedName && selectedName !== name) {
    throw new Error("\u9152\u9986\u5F53\u524D\u9884\u8BBE\u5DF2\u5207\u6362\uFF0C\u8BF7\u5237\u65B0\u540E\u518D\u4FDD\u5B58\u3002");
  }
  const existing = cloneJson(manager.getCompletionPresetByName?.(name) || {});
  if (!Object.keys(asRecord(existing)).length) {
    throw new Error(`\u804A\u5929\u9884\u8BBE\u4E0D\u5B58\u5728\uFF1A${name}`);
  }
  const currentActiveCharacterId = getActivePromptManagerCharacterId();
  const submittedActiveCharacterId = normalizeText(bundle.promptManager?.activeCharacterId);
  if (!currentActiveCharacterId || !submittedActiveCharacterId || currentActiveCharacterId !== submittedActiveCharacterId) {
    throw new Error("\u672A\u53D6\u5F97\u5F53\u524D\u89D2\u8272\u987A\u5E8F\uFF0C\u8BF7\u5237\u65B0\u540E\u518D\u4FDD\u5B58\u3002");
  }
  const patch = { ...asRecord(existing) };
  if (Array.isArray(bundle.promptManager?.prompts)) {
    patch.prompts = cloneJson(bundle.promptManager.prompts);
  }
  if (Array.isArray(bundle.promptManager?.activeOrder)) {
    patch.prompt_order = replaceActivePromptOrder(
      asRecord(existing).prompt_order,
      currentActiveCharacterId,
      bundle.promptManager.activeOrder
    );
  }
  await manager.savePreset(name, patch);
  assertSavedPromptManagerPreset(manager, name, patch, currentActiveCharacterId, bundle.promptManager?.activeOrder || []);
  if (promptManager?.serviceSettings) {
    Object.assign(promptManager.serviceSettings, pickPromptManagerRuntimeFields(patch));
  }
  setPromptManagerSelectedPresetName(name);
  promptManager?.saveServiceSettings?.();
  promptManager?.render?.(false);
}
function applyPromptManagerPromptFieldsFromPreset(name = "") {
  const manager = getRequiredPromptManager();
  const presetName = normalizeText(name);
  if (!presetName) {
    throw new Error("\u804A\u5929\u9884\u8BBE\u540D\u79F0\u4E3A\u7A7A\u3002");
  }
  const preset = asRecord(manager.getCompletionPresetByName?.(presetName));
  if (!Object.keys(preset).length) {
    throw new Error(`\u804A\u5929\u9884\u8BBE\u4E0D\u5B58\u5728\uFF1A${presetName}`);
  }
  if (promptManager?.serviceSettings) {
    const promptFields = pickPromptManagerRuntimeFields(preset);
    if (!Array.isArray(promptFields.prompts) || !Array.isArray(promptFields.prompt_order)) {
      throw new Error(`\u804A\u5929\u9884\u8BBE\u7F3A\u5C11 prompts \u6216 prompt_order\uFF1A${presetName}`);
    }
    Object.assign(promptManager.serviceSettings, promptFields);
  }
  setPromptManagerSelectedPresetName(presetName);
  promptManager?.saveServiceSettings?.();
  promptManager?.render?.(false);
  return true;
}
async function saveTavernChatPresetBundle(input) {
  const bundle = normalizeTavernChatPromptPresetBundle(asRecord(input));
  await savePromptManagerPreset(bundle);
  saveSettingsDebounced?.();
  return buildCurrentBundle();
}
async function selectTavernChatPresetBundle(input) {
  const source = asRecord(input);
  const promptManagerName = normalizeText(source.promptManagerName || source.name);
  if (!promptManagerName) {
    throw new Error("\u804A\u5929\u9884\u8BBE\u540D\u79F0\u4E3A\u7A7A\u3002");
  }
  applyPromptManagerPromptFieldsFromPreset(promptManagerName);
  saveSettingsDebounced?.();
  return buildCurrentBundle();
}
export {
  getTavernChatPresetBundle,
  listTavernChatPresetBundles,
  saveTavernChatPresetBundle,
  selectTavernChatPresetBundle
};
