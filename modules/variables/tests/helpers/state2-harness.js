import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceRoot = path.resolve('modules/variables/state2');
const yamlModuleUrl = pathToFileURL(path.resolve('libs/js-yaml.mjs')).href;

function copySourceFile(tempDir, name, transform = source => source) {
    const source = readFileSync(path.join(sourceRoot, name), 'utf8');
    writeFileSync(path.join(tempDir, name), transform(source), 'utf8');
}

export async function createHarness() {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'lwb-state2-'));

    writeFileSync(path.join(tempDir, 'package.json'), '{"type":"module"}\n', 'utf8');
    writeFileSync(path.join(tempDir, 'mock-env.js'), `
export const state = {
  ctx: {
    chatId: 'test-chat',
    chat: [],
    chatMetadata: { variables: {}, extensions: {} },
    saveCount: 0,
    metadataSaveCount: 0,
    saveChat() { this.saveCount += 1; },
    saveMetadataDebounced() { this.metadataSaveCount += 1; },
  },
};

export function resetContext() {
  state.ctx.chatId = 'test-chat';
  state.ctx.chat = [];
  state.ctx.chatMetadata = { variables: {}, extensions: {} };
  state.ctx.saveCount = 0;
  state.ctx.metadataSaveCount = 0;
}
`, 'utf8');
    writeFileSync(path.join(tempDir, 'mock-extensions.js'), `
import { state } from './mock-env.js';
export function getContext() {
  return state.ctx;
}
`, 'utf8');
    writeFileSync(path.join(tempDir, 'mock-variables.js'), `
import { state } from './mock-env.js';

export function getLocalVariable(name) {
  const variables = state.ctx.chatMetadata.variables ||= {};
  const value = variables[name];
  if (value == null) return '';
  if (typeof value !== 'string') return value;
  return value.trim?.() === '' || isNaN(Number(value)) ? value : Number(value);
}

export function setLocalVariable(name, value) {
  if (!name) throw new Error('Variable name cannot be empty or undefined.');
  const variables = state.ctx.chatMetadata.variables ||= {};
  variables[name] = value;
  state.ctx.saveMetadataDebounced();
  return value;
}
`, 'utf8');

    copySourceFile(tempDir, 'parser.js', source => source
        .replace("import jsyaml from '../../../libs/js-yaml.mjs';", `import jsyaml from '${yamlModuleUrl}';`));
    for (const name of ['semantic.js', 'executor.js', 'json-input.js', 'records.js', 'checkpoints.js', 'rebuild.js', 'legacy-log.js', 'turn-state.js', 'index.js']) copySourceFile(tempDir, name);
    copySourceFile(tempDir, 'guard-core.js');
    copySourceFile(tempDir, 'guard.js', source => source
        .replace("import { getContext } from '../../../../../../extensions.js';", "import { getContext } from './mock-extensions.js';"));
    copySourceFile(tempDir, 'service.js', source => source
        .replace("import { getContext } from '../../../../../../extensions.js';", "import { getContext } from './mock-extensions.js';"));

    const envModuleUrl = pathToFileURL(path.join(tempDir, 'mock-env.js')).href;
    const executorModuleUrl = pathToFileURL(path.join(tempDir, 'index.js')).href;
    const guardModuleUrl = pathToFileURL(path.join(tempDir, 'guard.js')).href;
    // eslint-disable-next-line no-unsanitized/method -- Imports only this test's locally copied environment fixture.
    const env = await import(envModuleUrl);
    // eslint-disable-next-line no-unsanitized/method -- Imports only this test's locally copied executor fixture.
    const executor = await import(executorModuleUrl);
    // eslint-disable-next-line no-unsanitized/method -- Imports only this test's locally copied guard fixture.
    const guard = await import(guardModuleUrl);

    return {
        tempDir,
        env,
        executor,
        guard,
        reset() {
            executor.cleanupStateService();
            env.resetContext();
        },
        cleanup() {
            executor.cleanupStateService();
            rmSync(tempDir, { recursive: true, force: true });
        },
    };
}

export function readStoredValue(ctx, root) {
    const raw = ctx.chatMetadata.variables?.[root];
    if (typeof raw !== 'string') return raw;
    try { return JSON.parse(raw); } catch { return raw; }
}

export function lwbMeta(ctx) {
    return ctx.chatMetadata.extensions?.LittleWhiteBox || {};
}

export async function loadVariablesCore(harness) {
    const variablePathUrl = pathToFileURL(path.resolve('core/variable-path.js')).href;
    writeFileSync(path.join(harness.tempDir, 'mock-core-host.js'), `
export { getContext } from './mock-extensions.js';
export { getLocalVariable, setLocalVariable } from './mock-variables.js';
export * from '${variablePathUrl}';
export const extension_settings = { LittleWhiteBox: { variablesMode: '2.0' } };
export const handlers = new Map();
export const event_types = Object.fromEntries(['MESSAGE_SENT', 'MESSAGE_RECEIVED', 'USER_MESSAGE_RENDERED', 'CHARACTER_MESSAGE_RENDERED', 'GENERATION_ENDED', 'MESSAGE_UPDATED', 'MESSAGE_EDITED', 'MESSAGE_SWIPED', 'MESSAGE_SWIPE_DELETED', 'MESSAGE_DELETED', 'GENERATION_STARTED', 'CHAT_CHANGED'].map(key => [key, key]));
export const createModuleEvents = () => ({ on: (key, handler) => handlers.set(key, handler), cleanup: () => handlers.clear() });
export const xbLog = { info() {}, warn() {} };
export const CacheRegistry = { register() {} };
export const afterAi = { ready: async () => true, afterTurn: async () => {}, waits: [], hints: [], handler: null, xbCalls: [], vareventCalls: 0 };
export const initAfterAiGate = () => {};
export const notifyAfterAiHint = hint => afterAi.hints.push(hint);
export const waitForAfterAiReady = (chatId, signal) => { afterAi.waits.push({ chatId, signal }); return afterAi.ready(chatId, signal); };
export const registerAfterAiHandler = (_moduleId, handler) => { afterAi.handler = handler; return () => { afterAi.handler = null; }; };
export const updateMessageBlock = () => {};
export const parseDirectivesTokenList = () => [];
export const applyXbGetVarForMessage = (...args) => afterAi.xbCalls.push(args);
export const parseValueForSet = value => value;
export const preprocessBumpAliases = value => value;
export const executeQueuedVareventJsAfterTurn = async () => { afterAi.vareventCalls += 1; await afterAi.afterTurn(); };
export const stripYamlInlineComment = value => value;
export const OP_MAP = {};
export const TOP_OP_RE = /never/;
export const observeAsyncCallback = callback => callback;
export const observeBackgroundTask = promise => promise;
`, 'utf8');
    const source = readFileSync(path.resolve('modules/variables/variables-core.js'), 'utf8')
        .replace(/from (["'])([^"']+)\1/g, (match, quote, specifier) => specifier === './state2/index.js'
            ? "from './index.js'" : "from './mock-core-host.js'")
        .replaceAll("import('./state2/index.js')", "import('./index.js')");
    writeFileSync(path.join(harness.tempDir, 'variables-core.js'), source, 'utf8');
    const hostUrl = pathToFileURL(path.join(harness.tempDir, 'mock-core-host.js')).href;
    const coreUrl = pathToFileURL(path.join(harness.tempDir, 'variables-core.js')).href;
    // eslint-disable-next-line no-unsanitized/method -- Test-owned host adapter in the isolated harness.
    const host = await import(hostUrl);
    // eslint-disable-next-line no-unsanitized/method -- Actual variables core copied into the isolated harness.
    const core = await import(coreUrl);
    return { core, host };
}
