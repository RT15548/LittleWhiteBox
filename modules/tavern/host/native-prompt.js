/* eslint-disable -- generated from TypeScript source; run npm run build:tavern */
import {
  baseChatReplace,
  depth_prompt_depth_default,
  depth_prompt_role_default,
  extension_prompt_roles,
  extension_prompt_types,
  extension_prompts,
  name2,
  parseMesExamples,
  setExtensionPrompt
} from "../../../../../../../script.js";
import { NOTE_MODULE_NAME } from "../../../../../../authors-note.js";
import { inject_ids } from "../../../../../../constants.js";
import { parseExampleIntoIndividual, prepareOpenAIMessages, promptManager } from "../../../../../../openai.js";
import { persona_description_positions, power_user } from "../../../../../../power-user.js";
import {
  resolveXbTavernAuthorNoteState
} from "../shared/message-assembler.js";
let nativePromptQueue = Promise.resolve();
const nativePromptAbortControllers = /* @__PURE__ */ new Map();
const NATIVE_PROMPT_DRY_RUN_CONTEXT_TOKENS = 2e5;
const NATIVE_PROMPT_DRY_RUN_RESPONSE_TOKENS = 4096;
function nowMs() {
  return typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
}
function createNativePromptTrace(input = {}, queuedAt = nowMs(), signal) {
  return {
    id: `native-prompt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    stage: normalizeText(input.debugStage || "native_prompt_build"),
    queuedAt,
    startedAt: nowMs(),
    steps: [],
    input,
    signal
  };
}
function nativePromptTraceMeta(trace) {
  const context = trace.input.context || {};
  const runtime = context.nativeWorldInfo || {};
  return {
    id: trace.id,
    stage: trace.stage,
    generationType: normalizeText(trace.input.generationType || "normal"),
    historyCount: Array.isArray(context.history) ? context.history.length : 0,
    currentUserChars: normalizeText(trace.input.currentUserMessage || "").length,
    memoryChars: normalizeText(trace.input.memoryPrompt || "").length,
    chanceChars: normalizeText(trace.input.chancePrompt || "").length,
    actionCheckChars: normalizeText(trace.input.actionCheckPrompt || "").length,
    runtimeDepthPromptChars: (Array.isArray(trace.input.runtimeDepthPrompts) ? trace.input.runtimeDepthPrompts : []).reduce((total, entry) => total + normalizeText(entry?.content).length, 0),
    worldBeforeChars: normalizeText(runtime.worldInfoBefore).length,
    worldAfterChars: normalizeText(runtime.worldInfoAfter).length,
    depthEntries: Array.isArray(runtime.worldInfoDepth) ? runtime.worldInfoDepth.length : 0,
    authorNoteChars: [
      ...Array.isArray(runtime.anBefore) ? runtime.anBefore : [],
      ...Array.isArray(runtime.anAfter) ? runtime.anAfter : [],
      asRecord(context.authorNote).prompt
    ].map((item) => normalizeText(item).length).reduce((total, value) => total + value, 0)
  };
}
function logNativePromptTrace(event, trace, extra = {}) {
  console.info(`[\u5C0F\u767D\u9152\u9986] native prompt ${event}`, {
    ...nativePromptTraceMeta(trace),
    ...extra
  });
}
function createNativePromptAbortError() {
  try {
    return new DOMException("native_prompt_cancelled", "AbortError");
  } catch {
    const error = new Error("native_prompt_cancelled");
    error.name = "AbortError";
    return error;
  }
}
function assertNativePromptNotCancelled(trace) {
  if (trace.signal?.aborted) {
    throw createNativePromptAbortError();
  }
}
async function traceNativePromptStep(trace, name, task) {
  assertNativePromptNotCancelled(trace);
  const startedAt = nowMs();
  logNativePromptTrace(`${name}:start`, trace);
  try {
    const result = await task();
    assertNativePromptNotCancelled(trace);
    const ms = Math.round(nowMs() - startedAt);
    trace.steps.push({ name, ms });
    logNativePromptTrace(`${name}:end`, trace, { ms });
    return result;
  } catch (error) {
    const ms = Math.round(nowMs() - startedAt);
    trace.steps.push({ name, ms });
    logNativePromptTrace(`${name}:failed`, trace, {
      ms,
      error: error instanceof Error ? error.message : String(error || "unknown_error")
    });
    throw error;
  }
}
function normalizeText(value = "") {
  return String(value || "").replace(/\r/g, "").trim();
}
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeRole(value) {
  if (value === "user" || value === true || value === 1) {
    return "user";
  }
  if (value === "system" || value === "sys" || value === 0) {
    return "system";
  }
  if (value === "tool") {
    return "tool";
  }
  return "assistant";
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
function flushNativeWorldInfoInjections() {
  const depthPrefix = inject_ids.CUSTOM_WI_DEPTH;
  const outletPrefix = inject_ids.CUSTOM_WI_OUTLET("");
  Object.keys(extension_prompts || {}).forEach((key) => {
    if (key.startsWith(depthPrefix) || key.startsWith(outletPrefix)) {
      delete extension_prompts[key];
    }
  });
}
function capturePersonaPrompt() {
  return {
    description: power_user?.persona_description,
    position: power_user?.persona_description_position
  };
}
function restorePersonaPrompt(snapshot) {
  power_user.persona_description = snapshot.description;
  power_user.persona_description_position = snapshot.position;
}
function capturePromptManager() {
  const runtime = asRecord(promptManager);
  const serviceSettings = asRecord(runtime.serviceSettings);
  return {
    activeCharacter: runtime.activeCharacter,
    prompts: cloneJson(serviceSettings.prompts),
    promptOrder: cloneJson(serviceSettings.prompt_order),
    hasOpenAiMaxContext: Object.prototype.hasOwnProperty.call(serviceSettings, "openai_max_context"),
    openAiMaxContext: serviceSettings.openai_max_context,
    hasOpenAiMaxTokens: Object.prototype.hasOwnProperty.call(serviceSettings, "openai_max_tokens"),
    openAiMaxTokens: serviceSettings.openai_max_tokens
  };
}
function restorePromptManager(snapshot) {
  const runtime = asRecord(promptManager);
  const serviceSettings = asRecord(runtime.serviceSettings);
  if ("activeCharacter" in runtime) {
    runtime.activeCharacter = snapshot.activeCharacter;
  }
  serviceSettings.prompts = cloneJson(snapshot.prompts);
  serviceSettings.prompt_order = cloneJson(snapshot.promptOrder);
  if (snapshot.hasOpenAiMaxContext) {
    serviceSettings.openai_max_context = snapshot.openAiMaxContext;
  } else {
    delete serviceSettings.openai_max_context;
  }
  if (snapshot.hasOpenAiMaxTokens) {
    serviceSettings.openai_max_tokens = snapshot.openAiMaxTokens;
  } else {
    delete serviceSettings.openai_max_tokens;
  }
}
function cloneJson(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}
function positiveInteger(value) {
  const numeric = Math.floor(Number(value));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}
function firstPositiveInteger(values) {
  for (const value of values) {
    const numeric = positiveInteger(value);
    if (numeric !== null) {
      return numeric;
    }
  }
  return null;
}
function applyNativeDryRunTokenBudget(chatPreset = {}) {
  if (!promptManager?.serviceSettings || typeof promptManager.serviceSettings !== "object") {
    return;
  }
  const serviceSettings = promptManager.serviceSettings;
  const preset = asRecord(chatPreset.promptManager);
  const rawPreset = asRecord(preset.rawPreset);
  const contextTokens = Math.max(
    NATIVE_PROMPT_DRY_RUN_CONTEXT_TOKENS,
    firstPositiveInteger([
      preset.openai_max_context,
      rawPreset.openai_max_context,
      serviceSettings.openai_max_context
    ]) || 0
  );
  const responseTokens = Math.min(
    contextTokens - 1,
    firstPositiveInteger([
      preset.openai_max_tokens,
      rawPreset.openai_max_tokens,
      serviceSettings.openai_max_tokens
    ]) || NATIVE_PROMPT_DRY_RUN_RESPONSE_TOKENS
  );
  serviceSettings.openai_max_context = contextTokens;
  serviceSettings.openai_max_tokens = Math.max(1, responseTokens);
}
function roleNumber(role) {
  if (typeof role === "number" && Number.isFinite(role)) {
    return role;
  }
  if (role === "user") {
    return Number(extension_prompt_roles.USER) || 1;
  }
  if (role === "assistant") {
    return Number(extension_prompt_roles.ASSISTANT) || 2;
  }
  return Number(extension_prompt_roles.SYSTEM) || 0;
}
function buildOpenAiMessages(context = {}, currentUserMessage = "") {
  const characterName = normalizeText(context.character?.name || name2);
  const userName = normalizeText(context.user?.name) || "User";
  const history = Array.isArray(context.history) ? context.history : [];
  const messages = history.map((item) => {
    const role = normalizeRole(item.role ?? item.is_user);
    const content = normalizeText(item.content || item.mes || item.message);
    if (!content) {
      return null;
    }
    return {
      role,
      content,
      ...item.name ? { name: normalizeText(item.name) } : {}
    };
  }).filter(Boolean);
  const userText = normalizeText(currentUserMessage);
  if (userText) {
    messages.push({
      role: "user",
      content: userText,
      name: userName
    });
  }
  const prepared = messages.map((message) => ({
    ...message,
    name: message.name || (message.role === "user" ? userName : message.role === "assistant" ? characterName : void 0)
  }));
  return prepared.reduce((result, message, index) => {
    result[prepared.length - 1 - index] = message;
    return result;
  }, []);
}
function createCurrentUserBoundaryMarker() {
  return `
__LWB_CURRENT_USER_BOUNDARY_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}__`;
}
function countMatchedMessages(sourceMessages = [], targetMessages = []) {
  const remaining = /* @__PURE__ */ new Map();
  targetMessages.forEach((message) => {
    const key = `${message.role}
${normalizeText(message.content)}`;
    if (!normalizeText(message.content)) {
      return;
    }
    remaining.set(key, (remaining.get(key) || 0) + 1);
  });
  let count = 0;
  let chars = 0;
  sourceMessages.forEach((message) => {
    const content = normalizeText(message.content);
    if (!content) {
      return;
    }
    const key = `${message.role}
${content}`;
    const left = remaining.get(key) || 0;
    if (left <= 0) {
      return;
    }
    remaining.set(key, left - 1);
    count += 1;
    chars += content.length;
  });
  return { count, chars };
}
function buildMessageExamples(context = {}) {
  const character = context.character || {};
  const data = asRecord(character.data);
  const runtime = context.nativeWorldInfo || {};
  const examples = parseMesExamples(
    baseChatReplace(character.mesExample || character.mes_example || data.mes_example || ""),
    false
  );
  const worldExamples = Array.isArray(runtime.worldInfoExamples) ? runtime.worldInfoExamples : [];
  worldExamples.forEach((entry) => {
    const content = normalizeText(entry?.content);
    if (!content) {
      return;
    }
    const parsed = parseMesExamples(baseChatReplace(content), false);
    const position = String(entry?.position ?? "").toLowerCase();
    if (position === "before" || position === "0") {
      examples.unshift(...parsed);
    } else {
      examples.push(...parsed);
    }
  });
  return examples.map((example) => parseExampleIntoIndividual(
    String(example || "").replace(/<START>/i, "{Example Dialogue:}").replace(/\r/gm, ""),
    true
  ));
}
function addInChatPrompt(key, content, depth, role) {
  const value = normalizeText(content);
  if (!value) {
    return;
  }
  setExtensionPrompt(
    key,
    value,
    Number(extension_prompt_types.IN_CHAT) || 1,
    Math.max(0, Math.floor(Number(depth) || 0)),
    false,
    roleNumber(role)
  );
}
function addRuntimeDepthPrompts(entries = []) {
  (Array.isArray(entries) ? entries : []).forEach((entry, index) => {
    const label = normalizeText(entry?.label || entry?.layer || `runtime-${index + 1}`).toLocaleLowerCase("en").replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || `runtime-${index + 1}`;
    addInChatPrompt(
      `xb_tavern_runtime_depth_${index}_${label}`,
      entry?.content,
      Number.isFinite(Number(entry?.depth)) ? Math.max(0, Number(entry.depth)) : 1,
      entry?.role || "system"
    );
  });
}
function getUserPersonaPrompt(context = {}) {
  return normalizeText(context.user?.persona || context.user?.description);
}
function applyUserPersonaPrompt(context = {}) {
  const persona = getUserPersonaPrompt(context);
  power_user.persona_description = persona;
  power_user.persona_description_position = persona_description_positions.IN_PROMPT;
  return persona;
}
function readCharacterDepthPrompt(context = {}) {
  const character = context.character || {};
  const data = asRecord(character.data);
  const extensions = asRecord(data.extensions);
  const depthPrompt = asRecord(extensions.depth_prompt);
  const legacyDepthPrompt = asRecord(data.depth_prompt);
  const content = normalizeText(
    character.characterDepthPrompt || character.character_depth_prompt || depthPrompt.prompt || data.character_depth_prompt || legacyDepthPrompt.prompt || (typeof data.depth_prompt === "string" ? data.depth_prompt : "")
  );
  return {
    content,
    depth: Number(depthPrompt.depth ?? depth_prompt_depth_default),
    role: depthPrompt.role ?? depth_prompt_role_default
  };
}
function addCharacterDepthPrompt(context = {}) {
  const prompt = readCharacterDepthPrompt(context);
  if (!prompt.content) {
    return prompt;
  }
  addInChatPrompt(
    "xb_tavern_character_depth_prompt",
    prompt.content,
    prompt.depth,
    prompt.role
  );
  return prompt;
}
function addNativeWorldInfoDepth(runtime = {}) {
  (Array.isArray(runtime.worldInfoDepth) ? runtime.worldInfoDepth : []).forEach((entry, index) => {
    const entries = Array.isArray(entry.entries) ? entry.entries.map(normalizeText).filter(Boolean) : [];
    if (!entries.length) {
      return;
    }
    addInChatPrompt(
      `xb_tavern_wi_depth_${Math.max(0, Number(entry.depth) || 0)}_${roleNumber(entry.role)}_${index}`,
      entries.join("\n"),
      Number(entry.depth) || 0,
      entry.role
    );
  });
}
function addNativeWorldInfoOutlets(runtime = {}) {
  const outlets = asRecord(runtime.outlets);
  Object.entries(outlets).forEach(([rawName, rawEntries]) => {
    const outletName = normalizeText(rawName);
    const entries = Array.isArray(rawEntries) ? rawEntries.map(normalizeText).filter(Boolean) : [];
    const value = entries.join("\n");
    if (!outletName || !value) {
      return;
    }
    setExtensionPrompt(
      inject_ids.CUSTOM_WI_OUTLET(outletName),
      value,
      Number(extension_prompt_types.NONE ?? 0),
      0
    );
  });
}
function characterPromptManagerIdentity(context = {}) {
  const character = context.character || {};
  const nativeCharacterId = normalizeText(character.nativeCharacterId);
  if (!nativeCharacterId) {
    return null;
  }
  return {
    ...asRecord(character.data),
    ...character,
    id: nativeCharacterId,
    nativeCharacterId,
    name: normalizeText(character.name)
  };
}
function replacePromptOrderForCharacter(existingPromptOrder, nativeCharacterId = "", nextOrder = []) {
  const containers = (Array.isArray(existingPromptOrder) ? existingPromptOrder : []).map((container) => ({ ...asRecord(container) }));
  const targetId = normalizeText(nativeCharacterId);
  const targetIndex = containers.findIndex((container) => normalizeText(container.character_id) === targetId);
  const target = targetIndex >= 0 ? containers[targetIndex] : { character_id: targetId };
  const replacement = {
    ...target,
    character_id: normalizeText(target.character_id) || targetId,
    order: cloneJson(nextOrder)
  };
  if (targetIndex >= 0) {
    containers[targetIndex] = replacement;
  } else {
    containers.push(replacement);
  }
  return containers;
}
function applyChatPresetPromptManager(chatPreset = {}, context = {}) {
  const preset = asRecord(chatPreset.promptManager);
  const rawPreset = asRecord(preset.rawPreset);
  if (!promptManager?.serviceSettings || typeof promptManager.serviceSettings !== "object") {
    throw new Error("\u804A\u5929\u9884\u8BBE\u672A\u540C\u6B65\uFF1A\u672A\u8BFB\u53D6\u5230 Prompt Manager \u8BBE\u7F6E\u3002");
  }
  const serviceSettings = promptManager.serviceSettings;
  const prompts = Array.isArray(preset.prompts) ? preset.prompts : Array.isArray(rawPreset.prompts) ? rawPreset.prompts : null;
  if (!prompts?.length) {
    throw new Error("\u804A\u5929\u9884\u8BBE\u672A\u540C\u6B65\uFF1A\u7F3A\u5C11 prompts\u3002");
  }
  serviceSettings.prompts = cloneJson(prompts);
  let promptOrder = Array.isArray(preset.promptOrder) ? cloneJson(preset.promptOrder) : Array.isArray(rawPreset.prompt_order) ? cloneJson(rawPreset.prompt_order) : void 0;
  const activeOrder = Array.isArray(preset.activeOrder) ? preset.activeOrder : [];
  const nativeCharacterId = normalizeText(context.character?.nativeCharacterId);
  if (nativeCharacterId && activeOrder.length) {
    promptOrder = replacePromptOrderForCharacter(promptOrder, nativeCharacterId, activeOrder);
  }
  if (!Array.isArray(promptOrder)) {
    throw new Error("\u804A\u5929\u9884\u8BBE\u672A\u540C\u6B65\uFF1A\u7F3A\u5C11 prompt_order\u3002");
  }
  serviceSettings.prompt_order = promptOrder;
}
function applyPromptManagerActiveCharacter(context = {}) {
  const character = characterPromptManagerIdentity(context);
  if (!character || !promptManager) {
    return;
  }
  promptManager.activeCharacter = character;
}
function applyAuthorNotePrompt(context = {}, currentUserMessage = "", runtime = {}) {
  const state = resolveXbTavernAuthorNoteState(context, currentUserMessage);
  const before = (Array.isArray(runtime.anBefore) ? runtime.anBefore : []).map(normalizeText).filter(Boolean);
  const after = (Array.isArray(runtime.anAfter) ? runtime.anAfter : []).map(normalizeText).filter(Boolean);
  const value = state.shouldAddPrompt ? [...before, state.prompt, ...after].filter(Boolean).join("\n") : "";
  setExtensionPrompt(
    NOTE_MODULE_NAME,
    value,
    state.shouldAddPrompt ? state.position : Number(extension_prompt_types.NONE),
    state.depth,
    state.shouldAddPrompt && state.scan,
    state.role
  );
}
function toXbMessage(message) {
  const record = asRecord(message);
  const role = normalizeRole(record.role);
  const content = typeof record.content === "string" ? record.content : record.content === null || record.content === void 0 ? "" : JSON.stringify(record.content);
  if (!content) {
    return null;
  }
  return {
    role,
    content,
    ...record.name ? { name: normalizeText(record.name) } : {},
    ...Array.isArray(record.tool_calls) ? { tool_calls: record.tool_calls } : {},
    ...record.tool_call_id ? { tool_call_id: normalizeText(record.tool_call_id) } : {}
  };
}
function getCharacterField(context = {}, key, camelKey) {
  const character = context.character || {};
  const data = asRecord(character.data);
  return baseChatReplace(character[camelKey] || data[key] || "");
}
async function buildNativePromptNow(input = {}, queuedAt = nowMs(), signal) {
  const trace = createNativePromptTrace(input, queuedAt, signal);
  const context = input.context || {};
  const character = context.character || {};
  const data = asRecord(character.data);
  const runtime = context.nativeWorldInfo || {};
  const snapshot = captureExtensionPrompts();
  const personaSnapshot = capturePersonaPrompt();
  const promptManagerSnapshot = capturePromptManager();
  logNativePromptTrace("start", trace, {
    queuedMs: Math.round(trace.startedAt - trace.queuedAt)
  });
  try {
    assertNativePromptNotCancelled(trace);
    await traceNativePromptStep(trace, "apply_prompt_manager", () => {
      applyChatPresetPromptManager(input.chatPreset, context);
      applyNativeDryRunTokenBudget(input.chatPreset);
      applyPromptManagerActiveCharacter(context);
    });
    await traceNativePromptStep(trace, "apply_persona", () => applyUserPersonaPrompt(context));
    await traceNativePromptStep(trace, "inject_runtime_prompts", () => {
      flushNativeWorldInfoInjections();
      addInChatPrompt("xb_tavern_memory_d1", input.memoryPrompt, 1, "system");
      addInChatPrompt("xb_tavern_chance_d1", input.chancePrompt, 1, "system");
      addInChatPrompt("xb_tavern_action_check_d0", input.actionCheckPrompt, 0, "system");
      addRuntimeDepthPrompts(input.runtimeDepthPrompts);
      addCharacterDepthPrompt(context);
      addNativeWorldInfoDepth(runtime);
      addNativeWorldInfoOutlets(runtime);
      applyAuthorNotePrompt(context, input.currentUserMessage || "", runtime);
    });
    const currentUserMessage = normalizeText(input.currentUserMessage || "");
    const currentUserBoundaryMarker = currentUserMessage ? createCurrentUserBoundaryMarker() : "";
    const messages = await traceNativePromptStep(trace, "build_chat_messages", () => buildOpenAiMessages(
      context,
      `${currentUserMessage}${currentUserBoundaryMarker}`
    ));
    const messageExamples = await traceNativePromptStep(trace, "build_examples", () => buildMessageExamples(context));
    const nativeInputHistory = Array.isArray(context.history) ? context.history : [];
    const nativeInputHistoryMessages = nativeInputHistory.map((item) => ({
      role: normalizeRole(item.role ?? item.is_user),
      content: normalizeText(item.content || item.mes || item.message)
    })).filter((message) => message.content);
    const [prepared] = await traceNativePromptStep(trace, "prepare_openai_messages", () => prepareOpenAIMessages({
      name2: normalizeText(character.name || name2),
      charDescription: getCharacterField(context, "description", "description"),
      charPersonality: getCharacterField(context, "personality", "personality"),
      scenario: getCharacterField(context, "scenario", "scenario"),
      worldInfoBefore: normalizeText(runtime.worldInfoBefore),
      worldInfoAfter: normalizeText(runtime.worldInfoAfter),
      extensionPrompts: extension_prompts,
      bias: "",
      type: normalizeText(input.generationType) || "normal",
      quietPrompt: "",
      quietImage: null,
      cyclePrompt: "",
      systemPromptOverride: baseChatReplace(data.system_prompt || ""),
      jailbreakPromptOverride: baseChatReplace(data.post_history_instructions || ""),
      messages,
      messageExamples
    }, true));
    const preparedMessages = (Array.isArray(prepared) ? prepared : []).map(toXbMessage).filter(Boolean);
    const currentUserMessageIndex = currentUserBoundaryMarker ? preparedMessages.findIndex((message) => message.role === "user" && String(message.content || "").includes(currentUserBoundaryMarker)) : -1;
    if (currentUserBoundaryMarker && currentUserMessageIndex < 0) {
      throw new Error("native_prompt_current_user_boundary_missing");
    }
    const normalizedMessages = preparedMessages.map((message, index) => index === currentUserMessageIndex ? { ...message, content: String(message.content || "").replace(currentUserBoundaryMarker, "") } : message);
    const messagesForDiagnostics = currentUserBoundaryMarker ? messages.map((message) => message.role === "user" && String(message.content || "").includes(currentUserBoundaryMarker) ? { ...message, content: String(message.content || "").replace(currentUserBoundaryMarker, "") } : message) : messages;
    const matchedHistory = countMatchedMessages(nativeInputHistoryMessages, normalizedMessages);
    const matchedConversation = countMatchedMessages(messagesForDiagnostics, normalizedMessages);
    const nativeDiagnostics = {
      nativeInputHistoryCount: nativeInputHistoryMessages.length,
      nativeInputHistoryChars: nativeInputHistoryMessages.reduce((sum, message) => sum + normalizeText(message.content).length, 0),
      nativeBuiltConversationMessageCount: messagesForDiagnostics.length,
      nativeBuiltConversationChars: messagesForDiagnostics.reduce((sum, message) => sum + normalizeText(message.content).length, 0),
      nativePreparedMessageCount: Array.isArray(prepared) ? prepared.length : 0,
      nativePreparedMessageChars: normalizedMessages.reduce((sum, message) => sum + normalizeText(message.content).length, 0),
      nativeMatchedHistoryCount: matchedHistory.count,
      nativeMatchedHistoryChars: matchedHistory.chars,
      nativeMatchedConversationCount: matchedConversation.count,
      nativeMatchedConversationChars: matchedConversation.chars,
      nativeBudgetContext: positiveInteger(promptManager.serviceSettings?.openai_max_context),
      nativeBudgetResponse: positiveInteger(promptManager.serviceSettings?.openai_max_tokens)
    };
    logNativePromptTrace("complete", trace, {
      totalMs: Math.round(nowMs() - trace.startedAt),
      queuedMs: Math.round(trace.startedAt - trace.queuedAt),
      preparedCount: Array.isArray(prepared) ? prepared.length : 0,
      messageCount: normalizedMessages.length,
      nativeDiagnostics,
      steps: trace.steps
    });
    return {
      messages: normalizedMessages,
      currentUserMessageIndex: currentUserMessageIndex >= 0 ? currentUserMessageIndex : null,
      source: "sillytavern-prepareOpenAIMessages",
      promptMessageCount: normalizedMessages.length,
      diagnostics: nativeDiagnostics
    };
  } catch (error) {
    logNativePromptTrace("failed", trace, {
      totalMs: Math.round(nowMs() - trace.startedAt),
      queuedMs: Math.round(trace.startedAt - trace.queuedAt),
      steps: trace.steps,
      error: error instanceof Error ? error.message : String(error || "unknown_error")
    });
    throw error;
  } finally {
    restorePromptManager(promptManagerSnapshot);
    restorePersonaPrompt(personaSnapshot);
    restoreExtensionPrompts(snapshot);
  }
}
function runNativePromptExclusive(task) {
  const run = nativePromptQueue.then(task, task);
  nativePromptQueue = run.catch(() => void 0);
  return run;
}
async function buildTavernNativeChatPrompt(input = {}) {
  const queuedAt = nowMs();
  const record = asRecord(input);
  const requestId = normalizeText(record.requestId || "");
  const controller = new AbortController();
  if (requestId) {
    nativePromptAbortControllers.set(requestId, controller);
  }
  try {
    return await runNativePromptExclusive(() => buildNativePromptNow(record, queuedAt, controller.signal));
  } finally {
    if (requestId && nativePromptAbortControllers.get(requestId) === controller) {
      nativePromptAbortControllers.delete(requestId);
    }
  }
}
function cancelTavernNativeChatPrompt(requestId = "") {
  const key = normalizeText(requestId);
  if (!key) {
    return;
  }
  nativePromptAbortControllers.get(key)?.abort();
}
export {
  buildTavernNativeChatPrompt,
  cancelTavernNativeChatPrompt
};
