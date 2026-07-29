import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { test } from 'node:test';
import { Script, createContext } from 'node:vm';
import type { Component } from 'vue';
import { defineTavernPhoneApps } from '../app-src/features/phone-os/phone-os-types';

const root = resolve(import.meta.dirname, '../../..');
const tavernRoot = resolve(root, 'modules/tavern');
const sourceExtensions = new Set(['.ts', '.vue']);
const ignoredPathParts = new Set(['dist', 'tests']);
const repositoryTextExtensions = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.vue', '.html', '.css', '.json', '.md', '.txt']);
const repositoryIgnoredDirNames = new Set(['.git', 'node_modules', 'coverage']);
const externalGoogleFontEndpointPattern = /fonts\.(?:googleapis|gstatic)/i;

function collectSourceFiles(dir: string): string[] {
    return readdirSync(dir)
        .flatMap((name) => {
            const path = join(dir, name);
            const stat = statSync(path);
            if (stat.isDirectory()) {
                return ignoredPathParts.has(name) ? [] : collectSourceFiles(path);
            }
            return sourceExtensions.has(path.slice(path.lastIndexOf('.'))) ? [path] : [];
        });
}

function collectRepositoryTextFiles(dir: string = root, files: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        const stat = statSync(path);
        if (stat.isDirectory()) {
            if (!repositoryIgnoredDirNames.has(name)) {
                collectRepositoryTextFiles(path, files);
            }
            continue;
        }
        const extension = path.slice(path.lastIndexOf('.')).toLowerCase();
        if (name.endsWith('.min.js') || !repositoryTextExtensions.has(extension)) {continue;}
        files.push(path);
    }
    return files;
}

function readRepoFile(path: string): string {
    return readFileSync(resolve(root, path), 'utf8');
}

function extractCssBlock(source: string, selector: string): string {
    const start = source.indexOf(selector);
    assert.notEqual(start, -1, `Missing CSS block: ${selector}`);
    const open = source.indexOf('{', start);
    assert.notEqual(open, -1, `Missing CSS block body: ${selector}`);
    let depth = 0;
    for (let index = open; index < source.length; index += 1) {
        const char = source[index];
        if (char === '{') {
            depth += 1;
        } else if (char === '}') {
            depth -= 1;
            if (depth === 0) {
                return source.slice(start, index + 1);
            }
        }
    }
    assert.fail(`Unclosed CSS block: ${selector}`);
}

function extractFunctionSource(source: string, signature: string): string {
    const start = source.indexOf(signature);
    assert.notEqual(start, -1, `Missing function: ${signature}`);
    const paramsEnd = source.indexOf(')', start);
    assert.notEqual(paramsEnd, -1, `Missing function params: ${signature}`);
    const open = source.indexOf('{', paramsEnd);
    assert.notEqual(open, -1, `Missing function body: ${signature}`);
    let depth = 0;
    for (let index = open; index < source.length; index += 1) {
        const char = source[index];
        if (char === '{') {
            depth += 1;
        } else if (char === '}') {
            depth -= 1;
            if (depth === 0) {
                return source.slice(start, index + 1);
            }
        }
    }
    assert.fail(`Unclosed function: ${signature}`);
}

function extractSourceBetween(source: string, startMarker: string, endMarker: string): string {
    const start = source.indexOf(startMarker);
    assert.notEqual(start, -1, `Missing source marker: ${startMarker}`);
    const end = source.indexOf(endMarker, start + startMarker.length);
    assert.notEqual(end, -1, `Missing source marker: ${endMarker}`);
    return source.slice(start, end);
}

const sourceFiles = collectSourceFiles(tavernRoot);

function sourceMatches(pattern: RegExp): Array<{ path: string; line: number; text: string }> {
    return sourceFiles.flatMap((path) => {
        const text = readFileSync(path, 'utf8');
        return text.split(/\r?\n/).flatMap((line, index) => (
            pattern.test(line)
                ? [{ path: relative(root, path).replace(/\\/g, '/'), line: index + 1, text: line.trim() }]
                : []
        ));
    });
}

test('tavern source does not depend on browser crypto APIs', () => {
    const browserCryptoReferences = sourceMatches(/globalThis\.crypto|crypto\.subtle|getRandomValues|randomUUID|crypto_subtle_unavailable/);

    assert.deepEqual(browserCryptoReferences, []);
});

test('plugin text resources do not reference Google-hosted font endpoints', () => {
    const matches = collectRepositoryTextFiles()
        .flatMap((path) => {
            const text = readFileSync(path, 'utf8');
            if (!externalGoogleFontEndpointPattern.test(text)) {return [];}
            return text.split(/\r?\n/).flatMap((line, index) => (
                externalGoogleFontEndpointPattern.test(line)
                    ? [{ path: relative(root, path).replace(/\\/g, '/'), line: index + 1, text: line.trim() }]
                    : []
            ));
        });

    assert.deepEqual(matches, []);
});

test('tavern source keeps cross-frame messages behind clone-safe wrappers', () => {
    const directPostMessages = sourceMatches(/postMessage\(/);
    assert.deepEqual(
        directPostMessages.map(({ path, text }) => ({ path, text })).sort((left, right) => left.path.localeCompare(right.path)),
        [
            {
                path: 'modules/tavern/app-src/components/chat/useTavernMarkdownTools.ts',
                text: 'window.parent?.postMessage(safePayload, window.location.origin);',
            },
            {
                path: 'modules/tavern/app-src/features/host-bridge/useTavernHostBridge.ts',
                text: "window.parent?.postMessage({ source: SOURCE_APP, type, payload: safePayload }, window.location.origin);",
            },
        ],
    );
    const bridgeSource = readRepoFile('modules/tavern/app-src/features/host-bridge/useTavernHostBridge.ts');
    const hostSource = readRepoFile('modules/tavern/tavern.ts');
    assert.match(bridgeSource, /function postToHost[\s\S]*const safePayload = clonePostMessagePayload\(payload\);[\s\S]*postMessage/);
    assert.match(hostSource, /function postToFrame[\s\S]*const message = cloneFramePayload\(\{ type, payload \}\);[\s\S]*postToIframe/);
});

test('tavern module is lazy-loaded so host import failures stay isolated', () => {
    const indexSource = readRepoFile('index.js');

    assert.doesNotMatch(indexSource, /^import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+["']\.\/modules\/tavern\/tavern\.js["'];?$/m);
    assert.doesNotMatch(indexSource, /^import\s+["']\.\/modules\/tavern\/tavern\.js["'];?$/m);
    assert.match(indexSource, /tavernModulePromise \|\|= import\(["']\.\/modules\/tavern\/tavern\.js["']\)/);
    assert.doesNotMatch(indexSource, /console\.error\(["']\[LittleWhiteBox\] 小白酒馆加载失败/);
    assert.match(indexSource, /async function initTavernSafely\(\) \{[\s\S]*try \{[\s\S]*await loadTavernModule\(\);[\s\S]*if \(!isXiaobaixEnabled\) return;[\s\S]*await tavern\.initTavern\?\.\(\);[\s\S]*\} catch \(error\) \{[\s\S]*markTavernUnavailable\(error\);[\s\S]*console\.warn\(["']\[LittleWhiteBox\] 小白酒馆不可用，其他功能继续运行["'], error\);[\s\S]*\}/);
    assert.match(indexSource, /async function openTavernSafely\(\) \{[\s\S]*await loadTavernModule\(\);[\s\S]*await tavern\.initTavern\?\.\(\);[\s\S]*await tavern\.openTavern\(\);[\s\S]*showTavernUnsupportedNotice\(error\);/);
    assert.match(indexSource, /async function cleanupTavernSafely\(\) \{[\s\S]*const tavern = tavernModule;[\s\S]*await tavern\?\.cleanupTavern\?\.\(\);/);
    assert.doesNotMatch(indexSource, /async function cleanupTavernSafely\(\)[\s\S]*loadTavernModule\(\)/);
    assert.match(indexSource, /void initTavernSafely\(\);/);
    assert.match(indexSource, /await openTavernSafely\(\);/);
});

test('tavern startup posts frame-ready before heavy app tasks and prewarms host config', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const chatRunSource = readRepoFile('modules/tavern/app-src/features/chat-run/useTavernChatRunController.ts');
    const hostBridgeSource = readRepoFile('modules/tavern/app-src/features/host-bridge/useTavernHostBridge.ts');
    const hostSource = readRepoFile('modules/tavern/tavern.ts');
    const htmlSource = readRepoFile('modules/tavern/tavern.html');
    const mountedIndex = appSource.indexOf('onMounted(async () => {');
    const readyIndex = appSource.indexOf("hostBridge.postToHost('xb-tavern:frame-ready');", mountedIndex);
    assert.notEqual(mountedIndex, -1);
    assert.notEqual(readyIndex, -1);
    const beforeReady = appSource.slice(mountedIndex, readyIndex);
    assert.doesNotMatch(beforeReady, /refreshPresets\(\)|refreshSessions\(\)|warmupMemoryTokenizer\(\)|preloadXbTavernMemoryTokenizer\(\)/);
    assert.match(appSource, /await nextTick\(\);\s*hostBridge\.postToHost\('xb-tavern:frame-ready'\);/);
    assert.doesNotMatch(appSource.slice(readyIndex, appSource.indexOf('onUnmounted', readyIndex)), /void runPostReadyStartupTasks\(\);/);
    assert.match(appSource, /if \(data\.type === 'xb-tavern:config'\) \{[\s\S]*applyHostPayload\(hostMessagePayload\(data\)\);[\s\S]*initialConfigApplied = true;[\s\S]*startPostReadyStartupTasksAfterInitialConfig\(\);/);
    assert.match(appSource, /function startPostReadyStartupTasksAfterInitialConfig\(\) \{[\s\S]*postReadyStartupStarted = true;[\s\S]*void runPostReadyStartupTasks\(\);/);
    assert.match(hostBridgeSource, /function reportStartupProgress\(percent: number, action: string\)[\s\S]*postToHost\('xb-tavern:startup-progress', \{ percent, action \}\)/);
    assert.match(appSource, /async function runPostReadyStartupTasks\(\) \{[\s\S]*reportStartupProgress\(92, 'refreshPresets'\);[\s\S]*Promise\.allSettled\(\[\s*refreshPresets\(\),\s*refreshSessions\(\),\s*\]\)[\s\S]*reportStartupProgress\(100, 'enterTavern'\);/);
    assert.doesNotMatch(appSource, /scheduleMemoryTokenizerWarmup|promoteMemoryTokenizerWarmup|preloadXbTavernMemoryTokenizer|getXbTavernMemoryTokenizerStatus/);
    assert.match(appSource, /const chatRunController = useTavernChatRunController\(\{/);
    assert.doesNotMatch(appSource, /async function runOnce[\s\S]*const controller = new AbortController\(\);[\s\S]*isRunning\.value = true;[\s\S]*const runtimeContext = await resolveRuntimeContextForSession/);
    assert.match(chatRunSource, /async function runOnce[\s\S]*const controller = new AbortController\(\);[\s\S]*state\.isRunning\.value = true;[\s\S]*const runtimeContext = await options\.resolveRuntimeContextForSession/);
    assert.match(chatRunSource, /const startingSessionId = String\(options\.selectedSessionId\.value \|\| ''\)\.trim\(\);[\s\S]*await options\.resolveSlashCommandMessageText\(messageText, runOptions\);[\s\S]*String\(options\.selectedSessionId\.value \|\| ''\)\.trim\(\) !== startingSessionId/);
    assert.match(htmlSource, /<span class="xb-frame-boot-percent">5%<\/span>/);
    assert.match(htmlSource, /<span class="xb-frame-boot-stage">等待启动<\/span>/);
    assert.match(htmlSource, /<div class="xb-frame-boot-fill"><\/div>/);
    assert.match(htmlSource, /首次加载需约30s/);
    assert.doesNotMatch(htmlSource, /xb-frame-boot-text|当前阶段|读取世界书/);
    assert.match(htmlSource, /const startupStageLabels = \{[\s\S]*loadTavernResources: '载入资源'[\s\S]*loadFrameSettings: '读取设置'[\s\S]*buildChatPreset: '整理预设'[\s\S]*frameConfigReady: '配置就绪'[\s\S]*sendInitialConfigToFrame: '同步配置'[\s\S]*enterTavern: '进入酒馆'/);
    assert.match(htmlSource, /progressPercent\.textContent = `\$\{roundedPercent\}%`/);
    assert.match(htmlSource, /progressStage\.textContent = stage/);
    assert.doesNotMatch(htmlSource, /#app:not\(:empty\) ~ #xb-frame-boot/);
    assert.match(htmlSource, /html\.tavern-ui-ready #xb-frame-boot/);
    assert.match(htmlSource, /let stylesheetReady = false;[\s\S]*let startupReady = false;[\s\S]*const revealTavernWhenReady = \(\) => \{[\s\S]*if \(!stylesheetReady \|\| !startupReady\) return;[\s\S]*classList\.add\('tavern-ui-ready'\)/);
    assert.match(htmlSource, /action === 'enterTavern' && percent >= 100[\s\S]*startupReady = true;[\s\S]*revealTavernWhenReady\(\)/);
    assert.match(htmlSource, /stylesheet\.addEventListener\('load',[\s\S]*stylesheetReady = true;[\s\S]*revealTavernWhenReady\(\)/);
    assert.match(htmlSource, /window\.addEventListener\('message'[\s\S]*data\.type !== 'xb-tavern:startup-progress'[\s\S]*applyStartupProgress\(data\.payload \|\| \{\}\)/);
    assert.match(htmlSource, /window\.parent\?\.postMessage\(\{[\s\S]*source: SOURCE_APP,[\s\S]*type: 'xb-tavern:boot-ready'/);
    assert.match(hostSource, /let initialConfigPromise: Promise<Record<string, unknown>> \| null = null;/);
    assert.match(hostSource, /let frameBootReady = false;/);
    assert.match(hostSource, /function postStartupProgress\(payload: Partial<TavernStartupProgressPayload> = \{\}\): boolean[\s\S]*type: 'xb-tavern:startup-progress'/);
    assert.match(hostSource, /function prepareInitialConfig\(\): void \{[\s\S]*initialConfigPromise = promise;/);
    assert.match(hostSource, /async function buildFrameConfigPayload\(options: Record<string, unknown> = \{\}\): Promise<Record<string, unknown>> \{[\s\S]*postStartupProgress\(\{ percent: 60, action: 'buildTavernFrameConfig' \}\);[\s\S]*onStartupProgress: postStartupProgress/);
    assert.match(hostSource, /async function sendInitialConfigToFrame\(\): Promise<void> \{[\s\S]*const configPayload = await promise;[\s\S]*postStartupProgress\(\{ percent: 84, action: 'sendInitialConfigToFrame' \}\);[\s\S]*postToFrame\('xb-tavern:config', configPayload\);/);
    assert.match(hostSource, /async function openTavern\(\): Promise<void> \{[\s\S]*installMessageHandler\(\);[\s\S]*await createOverlay\(\);[\s\S]*prepareInitialConfig\(\);/);
    assert.match(hostSource, /case 'xb-tavern:boot-ready':[\s\S]*frameBootReady = true;[\s\S]*postStartupProgress\(\{ percent: 15, action: 'loadTavernResources' \}\);/);
    assert.match(hostSource, /case 'xb-tavern:frame-ready':[\s\S]*postStartupProgress\(\{ percent: Math\.max\(latestStartupProgress\.percent, 20\), action: 'frameReady' \}\);[\s\S]*void sendInitialConfigToFrame\(\)\.catch\(\(error\) => \{[\s\S]*failed to send initial config[\s\S]*\}\)\.finally\(flushPendingMessages\);/);
});

test('tavern Material Symbols load from local vendor font only', () => {
    const agentConfigSource = readRepoFile('modules/tavern/host/agent-config.ts');
    const fontLoaderSource = readRepoFile('modules/tavern/app-src/features/material-symbol-font.ts');
    const statusPanelSource = readRepoFile('modules/tavern/app-src/components/TavernStatusPanel.vue');
    const statusCss = readRepoFile('modules/tavern/app-src/styles/chat/status-panel.css');
    const mapCss = readRepoFile('modules/tavern/app-src/styles/chat/map.css');

    assert.match(agentConfigSource, /extensionBasePath: `\/\$\{extensionFolderPath\}`/);
    assert.match(fontLoaderSource, /new FontFace\(MATERIAL_SYMBOL_FONT_FAMILY[\s\S]*display: 'block'[\s\S]*weight: '300'/);
    assert.match(fontLoaderSource, /libs\/material-symbols\/material-symbols-rounded\.woff2/);
    assert.match(statusPanelSource, /resolveStatusIconName/);
    assert.match(statusPanelSource, /if \(!props\.materialSymbolsReady\) \{return props\.materialSymbolsStatus === 'failed' \? '!' : '';\}/);
    assert.doesNotMatch(statusCss, /fonts\.googleapis|fonts\.gstatic/);
    assert.match(statusCss, /font-variation-settings: "FILL" 0, "wght" 300/);
    assert.match(statusCss, /\.tavern-status-panel\.is-symbol-font-failed \.material-symbols-rounded/);
    assert.doesNotMatch(mapCss, /fonts\.googleapis|fonts\.gstatic/);
    assert.match(mapCss, /font-variation-settings: "FILL" 0, "wght" 300/);
    assert.match(mapCss, /\.tavern-map-panel\.is-symbol-font-failed \.map-material-symbol/);
});

test('tavern mobile overlay viewport updates are frame-throttled', () => {
    const hostSource = readRepoFile('modules/tavern/tavern.ts');

    assert.match(hostSource, /let overlayResizeFrame = 0;/);
    assert.match(hostSource, /let overlayKeyboardSettleTimers: number\[\] = \[\];/);
    assert.match(hostSource, /let cachedTavernMobileTopOffset: number \| null = null;/);
    assert.match(hostSource, /function getTavernMobileTopOffset\(forceRefresh = false\): number \{[\s\S]*cachedTavernMobileTopOffset !== null[\s\S]*getComputedStyle\(document\.documentElement\)/);
    assert.match(hostSource, /function getTavernMobileViewportHeight\(topOffset = getTavernMobileTopOffset\(\)\): number \{[\s\S]*window\.visualViewport\?\.height[\s\S]*keyboardLooksOpen[\s\S]*Math\.max\(layoutHeight, visualHeight\)/);
    assert.match(hostSource, /const viewportHeight = getTavernMobileViewportHeight\(topOffset\);/);
    assert.match(hostSource, /function scheduleTavernOverlayViewport\(overlay: HTMLElement, forceTopOffsetRefresh = false\): void \{[\s\S]*window\.requestAnimationFrame\(\(\) => \{[\s\S]*applyTavernOverlayViewport\(overlay\);/);
    assert.match(hostSource, /function scheduleTavernOverlayViewportSettle\(overlay: HTMLElement, forceTopOffsetRefresh = false\): void \{[\s\S]*\[40, 120, 260, 520, 900, 1400\][\s\S]*scheduleTavernOverlayViewport\(overlay, true\);/);
    assert.match(hostSource, /overlayResizeHandler = \(\) => scheduleTavernOverlayViewport\(overlay, true\);/);
    assert.match(hostSource, /overlayKeyboardSettleHandler = \(\) => scheduleTavernOverlayViewportSettle\(overlay, true\);/);
    assert.match(hostSource, /case 'xb-tavern:viewport-settle':[\s\S]*scheduleTavernOverlayViewportSettle\(overlay, true\);/);
    assert.match(hostSource, /window\.cancelAnimationFrame\(overlayResizeFrame\);/);
    assert.match(hostSource, /clearOverlayKeyboardSettleTimers\(\);/);
    assert.doesNotMatch(hostSource, /overlayResizeHandler = \(\) => applyTavernOverlayViewport\(overlay\);/);

    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    assert.match(appSource, /function handleKeyboardViewportFocus\(event: FocusEvent\)[\s\S]*postToHost\('xb-tavern:viewport-settle'/);
    assert.match(appSource, /document\.addEventListener\('focusin', handleKeyboardViewportFocus, true\);[\s\S]*document\.addEventListener\('focusout', handleKeyboardViewportFocus, true\);/);
    assert.match(appSource, /document\.removeEventListener\('focusin', handleKeyboardViewportFocus, true\);[\s\S]*document\.removeEventListener\('focusout', handleKeyboardViewportFocus, true\);/);
});

test('tavern assistant preset settings expose state, character memory, and status rules', () => {
    const controllerSource = readRepoFile('modules/tavern/app-src/components/settings/useTavernSettingsController.ts');
    const sectionMatch = controllerSource.match(/const assistantPresetSections:[\s\S]*?];/);
    assert.ok(sectionMatch);
    const sectionSource = sectionMatch[0];
    assert.match(sectionSource, /key: 'statePrompt'/);
    assert.match(sectionSource, /key: 'characterPrompt'/);
    assert.match(sectionSource, /key: 'statusPrompt'/);
    assert.equal((sectionSource.match(/key:/g) || []).length, 3);
});

test('tavern worldbook bridge edits named entries through native save boundary', () => {
    const badSplits = sourceMatches(/split\(\s*\/\\r\?\\n\|,\//);
    assert.deepEqual(badSplits, []);
    const hostSource = readRepoFile('modules/tavern/host/worldbooks.ts');
    assert.match(hostSource, /export async function listTavernWorldbookSources/);
    assert.match(hostSource, /export async function getTavernWorldbookPreview/);
    assert.match(hostSource, /await loadWorldInfo\(name\)/);
    assert.match(hostSource, /export async function getTavernWorldbookEntry/);
    assert.match(hostSource, /export async function saveTavernWorldbookEntry/);
    assert.match(hostSource, /function normalizeIdText/);
    assert.match(hostSource, /uid: normalizeIdText\(entry\.uid \?\? entry\.id \?\? slot\.index\)/);
    assert.match(hostSource, /buildWorldbookEntryHash/);
    assert.match(hostSource, /patchWorldbookEntry/);
    assert.doesNotMatch(hostSource, /if \('name' in draft\)|if \('title' in draft\)|name: asEditableText\(entry\.name\)|title: asEditableText\(entry\.title\)/);
    assert.match(hostSource, /function syncWorldbookOriginalDataEntry/);
    assert.match(hostSource, /syncWorldbookOriginalDataEntry\(asRecord\(data\), uid, slot\.entry\);[\s\S]*await saveWorldInfo\(name, data, true\)/);
    assert.match(hostSource, /if \('secondary_keys' in entry && \('secondary_keys' in draft \|\| 'secondaryKeys' in draft\)\)/);
    assert.match(hostSource, /const keysecondary = normalizeStringList\(draft\.keysecondary\);[\s\S]*entry\.secondary_keys = keysecondary\.length \? keysecondary : normalizeStringList\(draft\.secondary_keys \?\? draft\.secondaryKeys\)/);
    assert.match(hostSource, /await saveWorldInfo\(name, data, true\)/);
    assert.match(hostSource, /export async function getTavernWorldbookRuntime/);
    assert.match(hostSource, /let tavernWorldbookStateQueue: Promise<void> = Promise\.resolve\(\);/);
    assert.match(hostSource, /function runTavernWorldbookStateExclusive/);
    assert.match(hostSource, /function isLittleWhiteBoxRuntimeWorldbookSource[\s\S]*sourceType === 'character' \|\| sourceType === 'global'/);
    assert.match(hostSource, /function liveSelectedGlobalWorldbookNames\(\): string\[\][\s\S]*selected_world_info\.map/);
    assert.match(hostSource, /function liveCharacterWorldbookNames\(context: XbTavernContext = \{\}\): Set<string> \| null[\s\S]*character\.shallow === true \|\| !normalizeText\(character\.json_data\)[\s\S]*nativeWorldInfo\.world_info[\s\S]*entry\.extraBooks/);
    assert.match(hostSource, /const liveGlobalNames = new Set\(liveSelectedGlobalWorldbookNames\(\)\);/);
    assert.match(hostSource, /const liveCharacterNames = liveCharacterWorldbookNames\(context\);/);
    assert.match(hostSource, /const liveGlobalSources = Array\.from\(liveGlobalNames\)\.map/);
    assert.match(hostSource, /const liveCharacterSources = liveCharacterNames === null[\s\S]*Array\.from\(liveCharacterNames\)[\s\S]*!liveGlobalNames\.has\(name\)/);
    assert.match(hostSource, /const keepLiveRuntimeSource = \(source: XbTavernNativeWorldInfoSource\): boolean => \([\s\S]*source\.sourceType !== 'global' \|\| liveGlobalNames\.has\(source\.name\)[\s\S]*source\.sourceType !== 'character' \|\| liveCharacterNames === null \|\| liveCharacterNames\.has\(source\.name\)[\s\S]*\);/);
    assert.match(hostSource, /return dedupeSources\(\s*\[\.{3}liveGlobalSources, \.{3}liveCharacterSources, \.{3}metaSources, \.{3}legacyMetaSources, \.{3}bookSources\][\s\S]*\.filter\(isLittleWhiteBoxRuntimeWorldbookSource\)[\s\S]*\.filter\(keepLiveRuntimeSource\),\s*\);/);
    assert.doesNotMatch(hostSource, /return dedupeSources\(\s*\[\.{3}metaSources, \.{3}legacyMetaSources, \.{3}bookSources\]\s*\)\s*\.filter/);
    assert.match(hostSource, /return runTavernWorldbookStateExclusive\(async \(\) => \{[\s\S]*try \{[\s\S]*await hydrateCharacterRecordById\(nativeCharacterId\);[\s\S]*catch \(error\) \{[\s\S]*console\.warn[\s\S]*const sources = collectRuntimeSources\(context\);[\s\S]*const snapshot = captureRuntimeState\(\);/);
    assert.match(hostSource, /return runTavernWorldbookStateExclusive\(async \(\) => \{[\s\S]*await checkWorldInfo\(chatLines, maxContext, false, globalScanData\)[\s\S]*restoreRuntimeState\(snapshot\);/);
    assert.match(hostSource, /export async function saveTavernWorldbookEntry[\s\S]*return runTavernWorldbookStateExclusive\(async \(\) => \{/);
    assert.match(hostSource, /export async function getTavernGlobalWorldbooks[\s\S]*return runTavernWorldbookStateExclusive\(\(\) => readGlobalWorldbooksState\(\)\);/);
    assert.match(hostSource, /characterDepthPrompt: normalizeText\([\s\S]*characterRecord\.characterDepthPrompt[\s\S]*depthPrompt\.prompt[\s\S]*legacyDepthPrompt\.prompt/);
    assert.doesNotMatch(hostSource, /openWorldInfoEditor/);
    assert.doesNotMatch(hostSource, /createWorldInfoEntry/);
    assert.match(hostSource, /export async function setTavernGlobalWorldbooks/);
    assert.match(hostSource, /function applyGlobalWorldbookSelection\(selected: string\[\]\): void/);
    assert.match(hostSource, /nativeWorldInfo\.updateWorldInfoSettings\(settings, selected\);[\s\S]*worldInfo\.globalSelect = \[\.\.\.selected\];[\s\S]*stScript\.saveSettingsDebounced\?\.\(\);[\s\S]*return;/);
    assert.match(hostSource, /replaceSelectedWorldInfo\(selected\);[\s\S]*worldInfo\.globalSelect = \[\.\.\.selected\];[\s\S]*stScript\.saveSettingsDebounced\?\.\(\)/);
    assert.doesNotMatch(hostSource, /setWorldInfoSettings\(settings,/);
});

test('tavern worldbook runtime filters stale sources before same-name dedupe', () => {
    const worldbookBuildSource = readRepoFile('modules/tavern/host/worldbooks.js');
    const sandbox = {} as {
        runCollect?: (context: Record<string, unknown>, selected: string[], liveCharacter: Record<string, unknown>, charLore?: unknown[]) => unknown;
    };
    const snippets = [
        extractFunctionSource(worldbookBuildSource, 'function normalizeStringList'),
        extractFunctionSource(worldbookBuildSource, 'function asRecordList'),
        extractFunctionSource(worldbookBuildSource, 'function addUniqueWorldbookName'),
        extractFunctionSource(worldbookBuildSource, 'function liveSelectedGlobalWorldbookNames'),
        extractFunctionSource(worldbookBuildSource, 'function liveCharacterWorldbookNames'),
        extractFunctionSource(worldbookBuildSource, 'function dedupeSources'),
        extractFunctionSource(worldbookBuildSource, 'function isLittleWhiteBoxRuntimeWorldbookSource'),
        extractFunctionSource(worldbookBuildSource, 'function collectRuntimeSources'),
        extractFunctionSource(worldbookBuildSource, 'function getCharacterRecordById'),
        extractFunctionSource(worldbookBuildSource, 'function readCharacterData'),
        extractFunctionSource(worldbookBuildSource, 'function readCharacterBook'),
        extractFunctionSource(worldbookBuildSource, 'function hasCharacterBookEntries'),
    ].join('\n\n');

    const vmContext = createContext(sandbox);
    new Script(`
        const normalizeText = (value) => String(value ?? '').trim();
        const normalizeIdText = (value) => value === null || value === undefined ? '' : String(value).trim();
        const asRecord = (value) => value && typeof value === 'object' ? value : {};
        const getCharaFilename = (value) => value === '0' ? 'aster.png' : '';
        const nativeWorldInfo = { world_info: { charLore: [] } };
        let characters = [];
        let selected_world_info = [];
        ${snippets}
        globalThis.runCollect = (context, selected, liveCharacter, charLore = []) => {
            characters = [liveCharacter];
            nativeWorldInfo.world_info.charLore = charLore;
            selected_world_info = selected;
            return collectRuntimeSources(context);
        };
    `).runInContext(vmContext);

    assert.equal(typeof sandbox.runCollect, 'function');
    const actual = JSON.parse(JSON.stringify(sandbox.runCollect?.({
        character: { nativeCharacterId: '0' },
        sessionMeta: {
            worldbookSources: [
                { name: 'A', sourceType: 'global', sourceIndex: 0 },
                { name: 'StaleCharacter', sourceType: 'character', sourceIndex: 1 },
            ],
        },
        worldBooks: [
            { name: 'A', worldSourceType: 'character', worldSourceIndex: 7 },
            { name: 'LiveCharacter', worldSourceType: 'character', worldSourceIndex: 8 },
        ],
    }, [], {
        avatar: 'aster.png',
        json_data: '{}',
        data: { extensions: { world: ['A', 'LiveCharacter'] } },
    })));
    assert.deepEqual(
        actual,
        [
            { name: 'A', sourceType: 'character', sourceIndex: 0 },
            { name: 'LiveCharacter', sourceType: 'character', sourceIndex: 1 },
        ],
    );

    const shallowFallback = JSON.parse(JSON.stringify(sandbox.runCollect?.({
        character: { nativeCharacterId: '0' },
        worldBooks: [
            { name: 'MaybeLiveCharacter', worldSourceType: 'character', worldSourceIndex: 2 },
        ],
    }, [], {
        avatar: 'aster.png',
        shallow: true,
    })));
    assert.deepEqual(
        shallowFallback,
        [
            { name: 'MaybeLiveCharacter', sourceType: 'character', sourceIndex: 2 },
        ],
    );

    const halfHydratedFallback = JSON.parse(JSON.stringify(sandbox.runCollect?.({
        character: { nativeCharacterId: '0' },
        worldBooks: [
            { name: 'MaybeLiveCharacter', worldSourceType: 'character', worldSourceIndex: 2 },
        ],
    }, [], {
        avatar: 'aster.png',
        shallow: false,
        json_data: '',
    })));
    assert.deepEqual(
        halfHydratedFallback,
        [
            { name: 'MaybeLiveCharacter', sourceType: 'character', sourceIndex: 2 },
        ],
    );

    const liveOnly = JSON.parse(JSON.stringify(sandbox.runCollect?.({
        character: { nativeCharacterId: '0' },
    }, ['LiveGlobal'], {
        avatar: 'aster.png',
        json_data: '{}',
        data: { extensions: { world: 'LiveCharacter' } },
    })));
    assert.deepEqual(
        liveOnly,
        [
            { name: 'LiveGlobal', sourceType: 'global', sourceIndex: 0 },
            { name: 'LiveCharacter', sourceType: 'character', sourceIndex: 0 },
        ],
    );
});

test('tavern mobile worldbook entry rows stay compact', () => {
    const worldbookSource = readRepoFile('modules/tavern/app-src/components/settings/TavernWorldbooksSettingsPanel.vue');
    const worldbookCss = readRepoFile('modules/tavern/app-src/styles/settings/worldbooks.css');
    const mobileCss = readRepoFile('modules/tavern/app-src/styles/settings/mobile.css');

    assert.match(worldbookSource, /function worldbookEntryStateLabel[\s\S]*return '×';[\s\S]*return '🔵';[\s\S]*return '🔗';[\s\S]*return '🟢';/);
    assert.doesNotMatch(worldbookSource, /return '🔵 常驻'|return '🔗 向量'|return '🟢 普通'/);
    assert.match(worldbookSource, /import TavernSaveStatusIconButton from '\.\/TavernSaveStatusIconButton\.vue';/);
    assert.match(worldbookSource, /class="worldbook-entry-editor-actions"[\s\S]*class="worldbook-row-open"[\s\S]*取消[\s\S]*<TavernSaveStatusIconButton[\s\S]*type="submit"[\s\S]*class="primary-action"[\s\S]*:status="worldbookEntrySaveFeedback\.status"[\s\S]*<\/div>\s*<\/div>\s*<div class="worldbook-entry-core-grid">/);
    assert.match(worldbookSource, /class="worldbook-entry-title-row"[\s\S]*>条目名<[\s\S]*class="worldbook-entry-active-toggle"[\s\S]*>启用</);
    assert.doesNotMatch(worldbookCss, /\.worldbook-entry-position\s*\{[^}]*grid-row:\s*2;/);
    assert.doesNotMatch(mobileCss, /\.worldbook-entry-position\s*\{[^}]*grid-row:\s*2;/);
    assert.doesNotMatch(worldbookCss, /padding: 2px 0 calc\(82px \+ env\(safe-area-inset-bottom, 0px\)\);/);
    assert.match(worldbookCss, /@media \(max-width: 560px\) \{[\s\S]*\.worldbook-entry-preview summary \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) auto auto 12px;/);
    assert.match(worldbookCss, /@media \(max-width: 560px\) \{[\s\S]*\.worldbook-entry-editor-head \{[\s\S]*display: contents;/);
    assert.match(worldbookCss, /@media \(max-width: 560px\) \{[\s\S]*\.worldbook-entry-editor-actions \{[\s\S]*position: sticky;[\s\S]*bottom: calc\(8px \+ env\(safe-area-inset-bottom, 0px\)\);[\s\S]*order: 100;[\s\S]*grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\);/);
    assert.match(worldbookCss, /@media \(max-width: 560px\) \{[\s\S]*\.worldbook-entry-active-toggle \{[\s\S]*grid-template-rows: 14px var\(--worldbook-entry-control-height\);[\s\S]*padding-top: 0;/);
    assert.match(worldbookCss, /@media \(max-width: 560px\) \{[\s\S]*\.worldbook-entry-core-grid \{[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);[\s\S]*align-items: stretch;/);
    assert.match(worldbookCss, /@media \(max-width: 560px\) \{[\s\S]*\.worldbook-entry-title-row \{[\s\S]*order: 1;[\s\S]*grid-column: 1 \/ -1;/);
    assert.match(worldbookCss, /@media \(max-width: 560px\) \{[\s\S]*\.worldbook-entry-position-field \{[\s\S]*order: 2;[\s\S]*\.worldbook-entry-state-field \{[\s\S]*order: 3;[\s\S]*\.worldbook-entry-depth-field \{[\s\S]*order: 4;/);
    assert.match(worldbookCss, /@media \(max-width: 560px\) \{[\s\S]*\.worldbook-entry-order-field \{[\s\S]*order: 5;[\s\S]*grid-column: 1;[\s\S]*\.worldbook-entry-probability-field \{[\s\S]*order: 6;[\s\S]*grid-column: 2;[\s\S]*\.worldbook-entry-scan-depth-field \{[\s\S]*order: 7;[\s\S]*grid-column: 3;/);
    assert.match(worldbookCss, /@media \(max-width: 560px\) \{[\s\S]*\.worldbook-entry-core-grid > label,[\s\S]*\.worldbook-entry-title-row > label:not\(\.worldbook-entry-active-toggle\),[\s\S]*\.worldbook-entry-key-grid > label,[\s\S]*\.worldbook-entry-key-grid \.worldbook-entry-logic-field,[\s\S]*\.worldbook-entry-advanced-grid > label \{[\s\S]*grid-template-rows: 14px var\(--worldbook-entry-control-height\);[\s\S]*align-self: stretch;/);
    assert.match(worldbookCss, /@media \(max-width: 560px\) \{[\s\S]*\.worldbook-entry-core-grid > label > span,[\s\S]*\.worldbook-entry-title-row > label:not\(\.worldbook-entry-active-toggle\) > span,[\s\S]*\.worldbook-entry-key-grid > label > span,[\s\S]*\.worldbook-entry-key-grid \.worldbook-entry-logic-field > span,[\s\S]*\.worldbook-entry-advanced-grid > label > span \{[\s\S]*height: 14px;[\s\S]*white-space: nowrap;/);
    assert.match(mobileCss, /\.settings-layout\.is-worldbooks-workspace \.worldbook-entry-preview summary \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) auto auto 12px;/);
    assert.match(mobileCss, /\.settings-layout\.is-worldbooks-workspace \.worldbook-entry-preview\[open\] \{[\s\S]*margin: 6px 0;[\s\S]*padding: 0 8px 8px;/);
    assert.match(mobileCss, /\.settings-layout\.is-worldbooks-workspace \.worldbook-entry-body \{[\s\S]*max-height: none;[\s\S]*overflow: visible;/);
});

test('tavern desktop worldbook editor keeps dense readable rows', () => {
    const worldbookSource = readRepoFile('modules/tavern/app-src/components/settings/TavernWorldbooksSettingsPanel.vue');
    const worldbookCss = readRepoFile('modules/tavern/app-src/styles/settings/worldbooks.css');

    assert.match(worldbookSource, /class="worldbook-entry-core-grid"[\s\S]*>条目名<[\s\S]*>状态<[\s\S]*>注入位置<[\s\S]*>触发概率<[\s\S]*>扫描深度<[\s\S]*<\/div>\s*<div class="worldbook-entry-key-grid">/);
    assert.match(worldbookSource, />关键词<[\s\S]*class="worldbook-entry-filter-controls"[\s\S]*>过滤逻辑<[\s\S]*<option value="off">[\s\S]*关闭[\s\S]*>可选过滤</);
    assert.match(worldbookSource, /function worldbookFilterLogicValue[\s\S]*return draft\.selective \? String\(Number\(draft\.selectiveLogic\) \|\| 0\) : 'off';/);
    assert.match(worldbookSource, /function updateWorldbookFilterLogic[\s\S]*value === 'off'[\s\S]*selective: false[\s\S]*selective: true/);
    assert.doesNotMatch(worldbookSource, /worldbook-entry-inline-check|worldbook-entry-filter-toggle|>启用过滤</);
    assert.doesNotMatch(worldbookSource, />Selective</);
    assert.doesNotMatch(worldbookSource, />Outlet Name<|>Scan Depth<|>Case-Sensitive<|>Whole Words<|>Group Scoring<|>Automation ID<|>Inclusion Group<|>Group Weight<|>Sticky<|>Cooldown<|>Delay<|>Use Probability<|>Ignore Budget<|>Exclude Recursion<|>Prevent Recursion<|>Prioritize Group<|>Delay Until Recursion<|>Recursion Level<|>Generation Triggers</);
    assert.match(worldbookSource, />注入出口<[\s\S]*>区分大小写<[\s\S]*>全词匹配<[\s\S]*>分组评分/);
    assert.doesNotMatch(worldbookSource, />注入出口<[\s\S]*>扫描深度<[\s\S]*>区分大小写/);
    assert.match(worldbookSource, />跟随全局<[\s\S]*>启用概率<[\s\S]*>忽略预算<[\s\S]*>生成触发</);
    assert.match(worldbookCss, /\.worldbook-entry-core-grid \{[\s\S]*grid-template-columns:[\s\S]*minmax\(180px, 220px\)[\s\S]*repeat\(4, minmax\(72px, 0\.38fr\)\);/);
    assert.match(worldbookCss, /\.worldbook-entry-core-grid > label,[\s\S]*\.worldbook-entry-title-row > label:not\(\.worldbook-entry-active-toggle\),[\s\S]*\.worldbook-entry-key-grid > label,[\s\S]*\.worldbook-entry-key-grid \.worldbook-entry-logic-field,[\s\S]*\.worldbook-entry-advanced-grid > label \{[\s\S]*grid-template-rows: 14px var\(--worldbook-entry-control-height\);[\s\S]*min-height: calc\(14px \+ 6px \+ var\(--worldbook-entry-control-height\)\);[\s\S]*align-self: stretch;/);
    assert.match(worldbookCss, /\.worldbook-entry-core-grid > label > span,[\s\S]*\.worldbook-entry-title-row > label:not\(\.worldbook-entry-active-toggle\) > span,[\s\S]*\.worldbook-entry-key-grid > label > span,[\s\S]*\.worldbook-entry-key-grid \.worldbook-entry-logic-field > span,[\s\S]*\.worldbook-entry-advanced-grid > label > span \{[\s\S]*height: 14px;[\s\S]*line-height: 14px;[\s\S]*white-space: nowrap;/);
    assert.match(worldbookCss, /\.worldbook-entry-key-grid \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) minmax\(132px, 170px\) minmax\(0, 1fr\);/);
    assert.match(worldbookCss, /\.worldbook-entry-filter-controls \{[\s\S]*display: contents;/);
    assert.match(worldbookCss, /\.worldbook-entry-logic-field \{[\s\S]*align-self: end;[\s\S]*width: 100%;/);
    assert.match(worldbookCss, /\.worldbook-entry-editor \{[\s\S]*--worldbook-entry-control-height: 38px;/);
    assert.match(worldbookCss, /\.worldbook-entry-editor input\[type="text"\],[\s\S]*\.worldbook-entry-editor input\[type="number"\],[\s\S]*\.worldbook-entry-editor select \{[\s\S]*height: var\(--worldbook-entry-control-height\);[\s\S]*min-height: var\(--worldbook-entry-control-height\);/);
    assert.match(worldbookCss, /\.worldbook-entry-editor input\[type="text"\],[\s\S]*\.worldbook-entry-editor input\[type="number"\],[\s\S]*\.worldbook-entry-editor select \{[\s\S]*appearance: none;[\s\S]*height: var\(--worldbook-entry-control-height\);/);
    assert.match(worldbookCss, /\.worldbook-entry-editor select \{[\s\S]*padding-right: 24px;[\s\S]*background-image:[\s\S]*linear-gradient\(45deg, transparent 50%, var\(--xb-text-muted\) 50%\)/);
    assert.match(worldbookSource, /const worldbookEntryKeywordText = ref\(''\);/);
    assert.match(worldbookSource, /const worldbookEntrySecondaryKeywordText = ref\(''\);/);
    assert.match(worldbookSource, /function updateWorldbookEntryKeywordText\(event: Event\)[\s\S]*worldbookEntryKeywordText\.value = text;[\s\S]*updateWorldbookEntryDraftPatch\(\{ key: listFromCommaText\(text\) \}\);/);
    assert.match(worldbookSource, /function updateWorldbookEntrySecondaryKeywordText\(event: Event\)[\s\S]*keysecondary: values,[\s\S]*secondary_keys: values,/);
    assert.match(worldbookSource, /<input[\s\S]*:value="worldbookEntryKeywordText"[\s\S]*@input="updateWorldbookEntryKeywordText"/);
    assert.match(worldbookSource, /<input[\s\S]*:value="worldbookEntrySecondaryKeywordText"[\s\S]*@input="updateWorldbookEntrySecondaryKeywordText"/);
    assert.doesNotMatch(worldbookSource, /:value="commaTextFromList\(worldbookEntryDraft\.key\)"/);
    assert.doesNotMatch(worldbookSource, /@input="updateWorldbookEntryDraftPatch\(\{ key: listFromCommaText\(\(\$event\.target as HTMLInputElement\)\.value\) \}\)"/);
    assert.match(worldbookSource, /class="worldbook-entry-editor-lines worldbook-entry-triggers-field"[\s\S]*<input[\s\S]*type="text"[\s\S]*listFromCommaText\(\(\$event\.target as HTMLInputElement\)\.value\)/);
    assert.match(worldbookCss, /@media \(max-width: 560px\) \{[\s\S]*\.worldbook-entry-editor \{[\s\S]*--worldbook-entry-control-height: 34px;/);
    assert.match(worldbookCss, /\.worldbook-entry-preview\[open\] \{[\s\S]*border-left: 3px solid var\(--xb-cyan\);[\s\S]*background:[\s\S]*box-shadow:/);
    assert.match(worldbookCss, /\.worldbook-entry-preview\[open\] summary \{[\s\S]*border-bottom: 1px solid var\(--xb-line\);/);
    assert.match(worldbookCss, /\.worldbook-entry-body \{[\s\S]*background: rgba\(0, 0, 0, 0\.08\);/);
    assert.match(worldbookCss, /@media \(max-width: 560px\) \{[\s\S]*\.worldbook-entry-body \{[\s\S]*max-height: none;[\s\S]*overflow: visible;/);
});

test('tavern character and global worldbook actions stay on native ST boundaries', () => {
    const hostSource = readRepoFile('modules/tavern/host/worldbooks.ts');
    const tavernSource = readRepoFile('modules/tavern/tavern.ts');
    const characterPanelSource = readRepoFile('modules/tavern/app-src/components/TavernCharacterWorkspacePanel.vue');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const worldbookSource = readRepoFile('modules/tavern/app-src/components/settings/TavernWorldbooksSettingsPanel.vue');
    const settingsControllerSource = readRepoFile('modules/tavern/app-src/components/settings/useTavernSettingsController.ts');

    assert.match(hostSource, /export async function getTavernCharacterWorldbookState/);
    assert.match(hostSource, /export async function activateTavernCharacterWorldbook/);
    assert.match(hostSource, /export async function bindTavernCharacterWorldbook/);
    assert.match(hostSource, /export async function getTavernGlobalWorldbooks/);
    assert.match(hostSource, /export async function setTavernGlobalWorldbooks/);
    assert.doesNotMatch(hostSource, /importEmbeddedWorldInfo/);
    assert.doesNotMatch(hostSource, /openWorldInfoEditor/);
    assert.doesNotMatch(`${hostSource}\n${appSource}\n${characterPanelSource}`, /not_current_character|只能给当前酒馆角色|请先切到当前角色/);
    assert.doesNotMatch(characterPanelSource, /isCurrentCharacter === false/);
    assert.match(hostSource, /function prepareCharacterEditorForWorldbookBinding/);
    assert.match(hostSource, /getOneCharacter/);
    assert.match(hostSource, /unshallowCharacter/);
    assert.match(hostSource, /await hydrateCharacterRecordById\(requestedId\)/);
    assert.match(hostSource, /select_selected_character\(numericId, \{ switchMenu: false \}\);/);
    assert.match(hostSource, /const character = await hydrateCharacterRecordById\(state\.nativeCharacterId\);[\s\S]*const book = readCharacterBook\(character\);/);
    assert.match(hostSource, /state\.worldbookOptions\.includes\(name\) && payload\.confirmed !== true[\s\S]*action: 'needs_import_confirmation'/);
    assert.match(hostSource, /function captureCharacterEditorSnapshot/);
    assert.match(hostSource, /function captureCharacterEditorJQueryData/);
    assert.match(hostSource, /function restoreCharacterEditorSnapshot/);
    assert.match(hostSource, /\.open_alternate_greetings/);
    assert.match(hostSource, /#set_character_world/);
    assert.match(hostSource, /function isCharacterEditorFocusedOn/);
    assert.match(hostSource, /return worldEditorId === targetId && greetingsEditorId === targetId;/);
    assert.match(hostSource, /async function bindCharacterWorldbookThroughEditor/);
    assert.match(hostSource, /const shouldPrepareEditor = !isCharacterEditorFocusedOn\(nativeCharacterId\);[\s\S]*if \(shouldPrepareEditor\) \{[\s\S]*await prepareCharacterEditorForWorldbookBinding\(nativeCharacterId\);[\s\S]*finally \{[\s\S]*restoreCharacterEditorSnapshot\(snapshot\);/);
    assert.match(hostSource, /const state = await readCharacterWorldbookState\(nativeCharacterId\);[\s\S]*state\.boundWorldbookName !== name \|\| state\.boundExists !== true[\s\S]*throw new Error\(`角色世界书绑定未保存成功：\$\{name\}`\);/);
    assert.match(hostSource, /const convertedBook = convertCharacterBook\(book\);[\s\S]*await saveWorldInfo\(name, convertedBook, true\);[\s\S]*await updateWorldInfoList\(\);[\s\S]*const boundState = await bindCharacterWorldbookThroughEditor\(state\.nativeCharacterId, name\);/);
    assert.match(hostSource, /if \(!name\) \{[\s\S]*throw new Error\('缺少要绑定的世界书名称。'\);[\s\S]*if \(!state\.worldbookOptions\.includes\(name\)\)/);
    assert.match(hostSource, /await prepareCharacterEditorForWorldbookBinding\(nativeCharacterId\);[\s\S]*await charUpdatePrimaryWorld\(name\);/);
    assert.match(hostSource, /export async function bindTavernCharacterWorldbook[\s\S]*return runTavernWorldbookStateExclusive\(async \(\) => \{[\s\S]*return bindCharacterWorldbookThroughEditor\(nativeCharacterId, name\);/);
    assert.match(hostSource, /export async function activateTavernCharacterWorldbook[\s\S]*return runTavernWorldbookStateExclusive\(async \(\) => \{[\s\S]*const boundState = await bindCharacterWorldbookThroughEditor/);
    assert.match(hostSource, /export async function setTavernGlobalWorldbooks[\s\S]*applyGlobalWorldbookSelection\(selected\);[\s\S]*await updateWorldInfoList\(\);/);
    assert.match(tavernSource, /case 'xb-tavern:get-character-worldbook-state':/);
    assert.match(tavernSource, /case 'xb-tavern:activate-character-worldbook':/);
    assert.match(tavernSource, /case 'xb-tavern:bind-character-worldbook':/);
    assert.match(tavernSource, /case 'xb-tavern:get-global-worldbooks':/);
    assert.match(tavernSource, /case 'xb-tavern:set-global-worldbooks':/);
    assert.doesNotMatch(tavernSource, /chat-worldbook/);
    assert.match(characterPanelSource, /const characterWorldbookBound = computed/);
    assert.match(characterPanelSource, /'is-bound': characterWorldbookBound[\s\S]*@click="openCharacterWorldbook"[\s\S]*会话档案[\s\S]*新建聊天/);
    assert.match(appSource, /requestHost\('xb-tavern:get-character-worldbook-state'/);
    assert.match(appSource, /requestHost\('xb-tavern:activate-character-worldbook'/);
    assert.match(appSource, /requestHost\('xb-tavern:bind-character-worldbook'/);
    assert.match(appSource, /action === 'needs_import_confirmation'/);
    assert.match(appSource, /payload: \{ nativeCharacterId, confirmed: true \}/);
    assert.match(settingsControllerSource, /function openWorldbookWorkspace\(name = ''\)/);
    assert.match(settingsControllerSource, /selectedWorldbookName\.value = targetName/);
    assert.match(settingsControllerSource, /openSettingsWorkspace\('worldbooks'\)/);
    assert.match(appSource, /openWorldbookWorkspace\(String\(payload\.name \|\| ''\)\)/);
    assert.match(appSource, /openWorldbookWorkspace\(targetName\)/);
    assert.match(appSource, /const currentNativeCharacterId = computed\(\(\) => \{[\s\S]*const characterKey = String\(selectedSession\.value\?\.characterKey \|\| effectiveContext\.value\.character\?\.characterKey \|\| ''\)\.trim\(\);[\s\S]*resolveCurrentNativeCharacterId\(characterKey, \{ optional: true \}\)/);
    assert.match(appSource, /const regexNativeCharacterId = computed\(\(\) => \{[\s\S]*selectedCharacterPreviewKey\.value[\s\S]*resolveCurrentNativeCharacterId\(previewKey, \{ optional: true \}\)[\s\S]*return previewNativeCharacterId \|\| currentNativeCharacterId\.value;/);
    assert.match(appSource, /useTavernSettingsController\(\{[\s\S]*effectiveContext,[\s\S]*currentNativeCharacterId,[\s\S]*regexNativeCharacterId,/);
    assert.match(settingsControllerSource, /async function syncWorldbooksForCurrentCharacter\(\)[\s\S]*const requestSerial = \+\+worldbookSyncRequestSerial;[\s\S]*options\.currentNativeCharacterId\.value[\s\S]*requestHost\('xb-tavern:get-character-worldbook-state'[\s\S]*requestSerial !== worldbookSyncRequestSerial[\s\S]*boundName && payload\.boundExists === true[\s\S]*syncWorldbooksFromHost\(\{ preferredName: boundName, requestSerial \}\)/);
    assert.match(settingsControllerSource, /async function syncWorldbooksFromHost\(syncOptions: TavernWorldbookSyncOptions = \{\}\)[\s\S]*const requestSerial = syncOptions\.requestSerial \|\| \+\+worldbookSyncRequestSerial;[\s\S]*if \(requestSerial !== worldbookSyncRequestSerial\) \{return;\}/);
    assert.match(settingsControllerSource, /const fallbackName = syncOptions\.selectFirst[\s\S]*: '';/);
    assert.doesNotMatch(settingsControllerSource, /worldbookOptions\.value\[0\]\?\.name[\s\S]*selectedWorldbookName\.value = syncOptions\.keepSelection/);
    assert.doesNotMatch(appSource, /action === 'opened'/);
    assert.doesNotMatch(appSource, /postToHost\('xb-tavern:close'\);[\s\S]*return;[\s\S]*action === 'imported'/);
    assert.match(worldbookSource, /class="worldbook-section worldbook-global-enable"[\s\S]*<h3>已启用的全局世界书<\/h3>[\s\S]*class="worldbook-section worldbook-main-section"[\s\S]*<h3>世界书操作<\/h3>[\s\S]*class="preset-command-bar worldbook-command-bar"[\s\S]*class="preset-source-select worldbook-source-select"/);
    assert.match(worldbookSource, /<option value="">\s*未选择\s*<\/option>/);
    assert.doesNotMatch(worldbookSource, /worldbook-section-kicker|全局区|操作区/);
    assert.match(worldbookSource, /:disabled="globalWorldbookSaving"/);
    assert.doesNotMatch(worldbookSource, /打开酒馆编辑器/);
    assert.doesNotMatch(worldbookSource, /worldbookSourceSummary/);
    assert.doesNotMatch(worldbookSource, /worldbookGlobalCount/);
    assert.doesNotMatch(worldbookSource, /聊天世界书/);
});

test('tavern chat preset bridge only writes native prompt fields, never API parameters', () => {
    const hostSource = readRepoFile('modules/tavern/host/chat-presets.ts');
    assert.match(hostSource, /function pickPromptManagerRuntimeFields/);
    assert.match(hostSource, /manager\.selectPreset\(value\)/);
    assert.match(hostSource, /assertPromptManagerRuntimeReady\(presetName\)/);
    assert.match(hostSource, /throw new Error\(`聊天预设不存在：\$\{presetName\}`\)/);
    assert.match(hostSource, /typeof manager\.savePreset !== 'function'[\s\S]*throw new Error\('酒馆 Prompt Manager 不支持保存预设。'\)/);
    assert.match(hostSource, /await manager\.savePreset\(name, patch\)/);
    assert.match(hostSource, /assertSavedPromptManagerPreset\(manager, name, patch, currentActiveCharacterId/);
    assert.match(hostSource, /replaceActivePromptOrder\([\s\S]*asRecord\(existing\)\.prompt_order,[\s\S]*currentActiveCharacterId,[\s\S]*bundle\.promptManager\.activeOrder/);
    assert.match(hostSource, /throw new Error\('聊天预设未同步：酒馆当前未选择 Prompt Manager 预设。'\)/);
    assert.doesNotMatch(hostSource, /Object\.keys\(preset\)\.length \? cloneJson\(preset\) : cloneJson\(asRecord\(promptManager\?\.serviceSettings\)\)/);
    assert.doesNotMatch(hostSource, /asArray\(rawPreset\.prompts\)\.length \? asArray\(rawPreset\.prompts\) : asArray\(promptSettings\.prompts\)/);
    assert.doesNotMatch(hostSource, /&& activeOrder\.length\s*&& stableJson\(promptOrderForCharacter/);
    assert.doesNotMatch(hostSource, /if \(!manager \|\| !presetName\) \{return false;\}/);
    assert.doesNotMatch(hostSource, /if \(!manager \|\| !name\) \{return;\}/);
    for (const forbidden of [
        'api_key',
        'reverse_proxy',
        'temperature',
        'top_p',
        'top_k',
        'max_tokens',
        'model',
        'streaming',
    ]) {
        assert.doesNotMatch(hostSource, new RegExp(`\\b${forbidden}\\b`));
    }
});

test('tavern runtime chat preset uses ST-confirmed active preset, never unsaved draft', () => {
    const controllerSource = readRepoFile('modules/tavern/app-src/components/settings/useTavernSettingsController.ts');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const chatRunSource = readRepoFile('modules/tavern/app-src/features/chat-run/useTavernChatRunController.ts');
    const nativeSource = readRepoFile('modules/tavern/host/native-prompt.ts');

    assert.match(controllerSource, /const runtimeChatPreset = computed\(\(\) => normalizeTavernChatPromptPresetBundle\(activeChatPreset\.value\)\)/);
    assert.doesNotMatch(controllerSource, /const runtimeChatPreset = computed\(\(\) => normalizeTavernChatPromptPresetBundle\(preset\.value\)\)/);
    assert.match(controllerSource, /async function syncChatPresetFromHost\(\)[\s\S]*applyActiveChatPreset\(payload\.active as Partial<TavernChatPromptPresetBundle>, \{[\s\S]*replaceDraft: !presetDirty\.value/);
    assert.match(controllerSource, /async function refreshRuntimeChatPresetFromHost\(\)[\s\S]*xb-tavern:get-chat-preset[\s\S]*applyActiveChatPreset\(payload, \{[\s\S]*replaceDraft: !presetDirty\.value/);
    assert.match(appSource, /const runtimePreset = await refreshRuntimeChatPresetFromHost\(\);[\s\S]*simulateXbTavernRequest\(\{[\s\S]*chatPreset: runtimePreset/);
    assert.match(chatRunSource, /const runtimePreset = await options\.refreshRuntimeChatPresetFromHost\(\);[\s\S]*runXbTavernTurn\(\{[\s\S]*chatPreset: runtimePreset/);
    assert.match(nativeSource, /throw new Error\('聊天预设未同步：缺少 prompts。'\)/);
    assert.match(nativeSource, /throw new Error\('聊天预设未同步：缺少 prompt_order。'\)/);
});

test('tavern map material symbols use shared font and keep visual icons separate from semantics', () => {
    const mapPanel = readRepoFile('modules/tavern/app-src/components/TavernMapPanel.vue');
    const mapCss = readRepoFile('modules/tavern/app-src/styles/chat/map.css');
    const mapSymbols = readRepoFile('modules/tavern/shared/map-material-symbols.ts');
    const stateSource = readRepoFile('modules/tavern/shared/structured-state.ts');
    const fillInKeyframes = extractCssBlock(mapCss, '@keyframes tavern-map-fill-in');
    const removeKeyframes = extractCssBlock(mapCss, '@keyframes tavern-map-remove');

    assert.match(stateSource, /icon\?: MaterialSymbolName;/);
    assert.match(stateSource, /kind\?: TavernMapElementKind;/);
    assert.match(stateSource, /TAVERN_MAP_ELEMENT_KINDS/);
    assert.match(stateSource, /shape:\s*\{\s*type: 'string',\s*enum: \['icon'\]/);
    assert.match(stateSource, /icon:\s*\{\s*type: 'string',\s*description: 'Visual Material Symbols official name[\s\S]*does not change geometry by itself/);
    assert.doesNotMatch(stateSource, /MAP_ICON_NAMES|TAVERN_MAP_ICON_NAMES|SCENE_MAP_PLACE_SCALE_ICONS|assertSceneMapIconAllowed/);
    assert.match(mapSymbols, /export const TAVERN_MAP_ELEMENT_KINDS = \[/);
    assert.match(mapSymbols, /door: 'door_open'/);
    assert.match(mapSymbols, /export function isMapExitSemantic/);
    assert.match(mapPanel, /symbolIcon\?: string/);
    assert.match(mapPanel, /resolveMapElementIconName\(element\.icon/);
    assert.match(mapPanel, /text: symbolIcon,[\s\S]*x: symbolX,[\s\S]*y: symbolY,[\s\S]*symbolIcon,/);
    assert.match(mapPanel, /const regularLineItems = computed\(\(\) => lineItems\.value\.filter\(\(item\) => !item\.symbolIcon\)\)/);
    assert.match(mapPanel, /const regularLineCasingItems = computed\(\(\) => regularLineItems\.value\.filter\(\(item\) => item\.role === 'line-casing'\)\)/);
    assert.match(mapPanel, /const regularLineCoreItems = computed\(\(\) => regularLineItems\.value\.filter\(\(item\) => item\.role !== 'line-casing'\)\)/);
    assert.match(mapPanel, /const symbolLineItems = computed\(\(\) => lineItems\.value\.filter\(\(item\) => item\.symbolIcon\)\)/);
    assert.match(mapPanel, /const regularRemovedLineItems = computed\(\(\) => removedLineItems\.value\.filter\(\(item\) => !item\.symbolIcon\)\)/);
    assert.match(mapPanel, /const symbolRemovedLineItems = computed\(\(\) => removedLineItems\.value\.filter\(\(item\) => item\.symbolIcon\)\)/);
    assert.match(mapPanel, /v-for="item in regularLineCasingItems"[\s\S]*v-for="item in regularLineCoreItems"[\s\S]*:transform="item\.transform"/);
    assert.match(mapPanel, /v-for="item in symbolLineItems"[\s\S]*materialSymbolGlyphText\(item\.symbolIcon\)/);
    assert.match(mapPanel, /v-for="item in regularRemovedLineItems"[\s\S]*:transform="item\.transform"/);
    assert.match(mapPanel, /v-for="item in symbolRemovedLineItems"[\s\S]*materialSymbolGlyphText\(item\.symbolIcon\)/);
    assert.doesNotMatch(mapPanel, /<path\s+v-for="item in lineItems"/);
    assert.doesNotMatch(mapPanel, /<path\s+v-for="item in removedLineItems"/);
    assert.match(mapCss, /\.tavern-chat\.xb-page \.map-material-symbol \{[\s\S]*font-family: "Material Symbols Rounded"[\s\S]*font-variation-settings: "FILL" 0, "wght" 300/);
    assert.match(mapCss, /\.tavern-chat\.xb-page \.map-material-symbol\.is-animated \{[\s\S]*tavern-map-fill-in/);
    assert.doesNotMatch(mapCss, new RegExp(['map-game-' + 'icon', 'map-game-' + 'icon-path'].join('|')));
    assert.doesNotMatch(fillInKeyframes, /transform:/);
    assert.doesNotMatch(removeKeyframes, /transform:/);
    assert.doesNotMatch(mapPanel, new RegExp(['gameIcon', 'glyphTransform', 'glyphScaleTransform', 'map-' + 'glyphs'].join('|')));
});

test('tavern request log is sourced from runtime request snapshots', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const chatRunSource = readRepoFile('modules/tavern/app-src/features/chat-run/useTavernChatRunController.ts');
    const runtimeSource = readRepoFile('modules/tavern/app-src/runtime/run-once.ts');
    const hostSource = readRepoFile('modules/tavern/tavern.ts');
    const nativePromptSource = readRepoFile('modules/tavern/host/native-prompt.ts');
    const conversationSource = readRepoFile('modules/tavern/app-src/components/chat/TavernConversationPanel.vue');
    const requestLogModalSource = readRepoFile('modules/tavern/app-src/components/TavernRequestLogModal.vue');
    const requestLogPreviewSource = readRepoFile('modules/tavern/app-src/utils/request-log-preview.ts');
    assert.match(appSource, /lastRequestSnapshot\.value\?\.rawRequestJson \|\| lastRequestSnapshot\.value\?\.rawMessagesJson/);
    assert.match(appSource, /simulateRequestJson\.value = result\.requestSnapshot\.rawRequestJson \|\| result\.requestSnapshot\.rawMessagesJson/);
    assert.match(requestLogModalSource, /buildRequestLogPreview/);
    assert.match(requestLogModalSource, />\s*美化\s*</);
    assert.match(requestLogModalSource, />\s*原始\s*</);
    assert.match(requestLogModalSource, /class="prompt-inspector-tools"/);
    assert.match(requestLogModalSource, /class="prompt-log-search"/);
    assert.match(requestLogModalSource, /class="prompt-preview-parameter-panel"/);
    assert.match(requestLogModalSource, /prompt-search-mark/);
    assert.doesNotMatch(requestLogModalSource, /v-html/);
    assert.doesNotMatch(requestLogModalSource, /prompt-inspector-summary/);
    assert.match(requestLogPreviewSource, /export function buildRequestLogPreview/);
    assert.match(requestLogPreviewSource, /\['request', 'body', 'messages'\]/);
    assert.match(appSource, /simulateXbTavernRequest\(\{[\s\S]*chatPreset: runtimePreset/);
    assert.match(chatRunSource, /runXbTavernTurn\(\{[\s\S]*chatPreset: runtimePreset/);
    assert.doesNotMatch(appSource, /simulateXbTavernRequest\(\{[\s\S]*chatPreset: activeChatPreset\.value/);
    assert.doesNotMatch(chatRunSource, /runXbTavernTurn\(\{[\s\S]*chatPreset: activeChatPreset\.value/);
    assert.match(chatRunSource, /runXbTavernTurn\(\{[\s\S]*buildNativeChatPrompt: options\.buildNativeChatPrompt,/);
    assert.match(appSource, /xb-tavern:build-native-chat-prompt[\s\S]*signal: input\.signal/);
    assert.doesNotMatch(appSource, /host_request_timeout|HOST_REQUEST_TIMEOUT_MS|const timeoutMs =/);
    const hostBridgeSource = readRepoFile('modules/tavern/app-src/features/host-bridge/useTavernHostBridge.ts');
    assert.match(hostBridgeSource, /postToHost\('xb-tavern:cancel-request', \{ requestId \}\);/);
    assert.match(chatRunSource, /state\.runtimePendingUserMessage\.value = messageText/);
    assert.match(conversationSource, /class="chat-bubble from-user pending-user"/);
    assert.match(runtimeSource, /async function applyNativeChatPromptBuild/);
    assert.match(runtimeSource, /stage: 'simulate_native_prompt_build'/);
    assert.match(runtimeSource, /stage: 'turn_native_prompt_build'/);
    assert.match(runtimeSource, /debugStage: input\.stage/);
    assert.match(runtimeSource, /signal: input\.signal/);
    assert.match(runtimeSource, /turn stage start/);
    assert.match(runtimeSource, /turn stage end/);
    assert.match(nativePromptSource, /nativePromptAbortControllers/);
    assert.match(nativePromptSource, /export function cancelTavernNativeChatPrompt/);
    assert.match(hostSource, /cancelTavernNativeChatPrompt\(requestId\)/);
    assert.match(runtimeSource, /const rawRequestJson = JSON\.stringify\(requestForJson, null, 2\)/);
    assert.match(runtimeSource, /rawRequestJson,/);
    assert.match(runtimeSource, /requestSnapshot = \(await inspectTavernRequest\(/);
});

test('tavern chat hot paths use message windows instead of full session scans', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const sessionSource = readRepoFile('modules/tavern/app-src/features/session/useTavernSessionController.ts');
    const runtimeSource = readRepoFile('modules/tavern/app-src/runtime/run-once.ts');
    const boundarySource = readRepoFile('modules/tavern/app-src/runtime/history-boundary-state.ts');
    const historyWindowSource = readRepoFile('modules/tavern/app-src/runtime/prompt-history-window.ts');
    const sessionDbSource = readRepoFile('modules/tavern/shared/session-db.ts');
    const simulateBody = runtimeSource.slice(
        runtimeSource.indexOf('export async function simulateXbTavernRequest'),
        runtimeSource.indexOf('function safeJsonParse'),
    );
    const runTurnBody = runtimeSource.slice(runtimeSource.indexOf('export async function runXbTavernTurn'));
    const listOrdersBody = sessionDbSource.slice(
        sessionDbSource.indexOf('export async function listTavernMessageOrdersFrom'),
        sessionDbSource.indexOf('export async function listLatestTavernUserMessages'),
    );
    const countBoundaryTurnsBody = sessionDbSource.slice(
        sessionDbSource.indexOf('export async function countCompletedTavernAssistantTurnsBefore'),
        sessionDbSource.indexOf('export async function countTavernMessages(sessionId'),
    );

    assert.match(appSource, /const sessionState = createTavernSessionState\(\);/);
    assert.doesNotMatch(appSource, /const loadedSessionMessages = ref<TavernMessageRecord\[\]>\(\[\]\);/);
    assert.match(sessionSource, /const loadedSessionMessages = ref<TavernMessageRecord\[\]>\(\[\]\);/);
    assert.match(sessionSource, /selectedSessionMessageTotal/);
    assert.match(sessionSource, /async function loadSelectedSessionMessageWindow/);
    assert.match(appSource, /const sessionController = useTavernSessionController\(sessionState,/);
    assert.doesNotMatch(appSource, /rebuildSelectedSessionRuntimeState|listSessionMessagesForReplay|deriveTavernSessionStateFromMessages/);
    assert.doesNotMatch(runtimeSource, /deriveTavernSessionStateFromMessages|listAllTavernMessagesInRangePaged/);
    assert.doesNotMatch(sessionDbSource, /replaceTavernSessionStateWithTurnSnapshots|TavernTimelineMessageIdentity/);
    assert.match(runtimeSource, /const rerollPreparation = input\.rerollLatestAssistant[\s\S]*prepareTavernLatestAssistantReroll\(baseSession\.id\)/);
    assert.match(runtimeSource, /commitTavernAssistantResponseWithPetForLatestUser\(/);
    assert.match(boundarySource, /countCompletedTavernAssistantTurnsBefore/);
    assert.match(boundarySource, /loadTavernPromptHistoryWindow/);
    assert.doesNotMatch(boundarySource, /buildXbTavernBrain|Worldbook|WorldInfoRuntime|applySubstituteParams|listTavernMessages/);
    assert.match(historyWindowSource, /const pageSize = Math\.max\(TAVERN_CONTEXT_WINDOW_MAX \* 3, 60\)/);
    assert.doesNotMatch(appSource, /async function selectSession[\s\S]{0,320}listTavernMessages\(/);
    assert.doesNotMatch(appSource, /async function refreshSessions[\s\S]{0,520}listTavernMessages\(/);
    assert.doesNotMatch(appSource, /async function deleteMessageTurn[\s\S]{0,900}listTavernMessages\(/);
    assert.match(appSource, /listTavernMessageOrdersFrom\(message\.sessionId, message\.order\)/);
    assert.match(appSource, /async function rerollLatestAssistant\(\) \{[\s\S]*await runOnce\(\{ rerollLatestAssistant: true \}\);/);
    assert.doesNotMatch(appSource, /resolveTavernRerunUserMessage|rerunFromMessage|tavern-rerun/);
    assert.doesNotMatch(simulateBody, /listTavernMessages\(/);
    assert.match(simulateBody, /loadTavernPromptHistoryWindow\(/);
    assert.doesNotMatch(runTurnBody, /listTavernMessages\(/);
    assert.match(runTurnBody, /loadTavernPromptHistoryWindow\(/);
    assert.doesNotMatch(runTurnBody, /truncateTavernMessagesAndReplaceSessionState/);
    assert.doesNotMatch(runTurnBody, /listTavernMessageOrdersFrom\(baseSession\.id, changedOrder\)/);
    assert.match(listOrdersBody, /\.primaryKeys\(\)/);
    assert.doesNotMatch(listOrdersBody, /\.toArray\(\)/);
    assert.match(countBoundaryTurnsBody, /\.each\(\(message\) =>/);
    assert.doesNotMatch(countBoundaryTurnsBody, /\.toArray\(\)/);
});

test('tavern RP reroll controls always target the database tail pair', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const contextSource = readRepoFile('modules/tavern/app-src/components/tavern-app-context.ts');
    const conversationSource = readRepoFile('modules/tavern/app-src/components/chat/TavernConversationPanel.vue');
    const assistantBubbleSource = readRepoFile('modules/tavern/app-src/components/chat/TavernAssistantBubble.vue');
    const runtimeSource = readRepoFile('modules/tavern/app-src/runtime/run-once.ts');
    const sessionDbSource = readRepoFile('modules/tavern/shared/session-db.ts');
    const combinedSource = [appSource, contextSource, conversationSource, assistantBubbleSource, runtimeSource].join('\n');

    assert.match(contextSource, /rerollLatestAssistant: TavernCommand<\[\], Promise<void>>;/);
    assert.match(appSource, /async function rerollLatestAssistant\(\) \{[\s\S]*await runOnce\(\{ rerollLatestAssistant: true \}\);/);
    assert.match(conversationSource, /title="重 roll 最后一轮"[\s\S]*aria-label="重 roll 最后一轮"[\s\S]*@click="rerollLatestAssistant\(\)"/);
    assert.match(assistantBubbleSource, /function rerunMessage\(\) \{[\s\S]*chat\.rerollLatestAssistant\(\);[\s\S]*title="重 roll 最后一轮"[\s\S]*aria-label="重 roll 最后一轮"/);
    assert.match(runtimeSource, /input\.rerollLatestAssistant[\s\S]*prepareTavernLatestAssistantReroll\(baseSession\.id\)/);
    assert.match(sessionDbSource, /const latestMessage = await getLatestTavernMessage\(id\);[\s\S]*\['user', 'assistant'\]\.includes\(latestMessage\.role\)[\s\S]*latestMessage\.role === 'user' \? 'reply_to_user' : 'replace_assistant'[\s\S]*getLatestTavernUserMessageAtOrBefore\(id, latestMessage\.order - 1\)/);
    assert.match(runtimeSource, /rerollPreparation\?\.mode === 'replace_assistant'[\s\S]*commitTavernLatestAssistantReroll\([\s\S]*commitTavernAssistantResponseWithPetForLatestUser\(/);
    assert.doesNotMatch(combinedSource, /reuseUserMessageOrder|resolveTavernRerunUserMessage|rerunFromMessage|canRerunMessage|tavern-rerun/);
});

test('tavern home only resumes an explicitly selected character session', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    assert.match(appSource, /const canResumeSelectedSession = computed/);
    assert.match(appSource, /String\(selectedSession\.value\.characterKey \|\| ''\)\.trim\(\)/);
    assert.match(appSource, /:has-session="canResumeSelectedSession"/);
    assert.match(appSource, /if \(canResumeSelectedSession\.value\) \{\s*openChatView\(\);/);
    assert.doesNotMatch(appSource, /selectedSessionId\.value = sessions\.value\[0\]\.id/);
    assert.doesNotMatch(appSource, /setSelectedTavernSessionId\(selectedSessionId\.value\)/);
});

test('tavern mobile character archive keeps the card list as the scroll container', () => {
    const layoutSource = readRepoFile('modules/tavern/app-src/styles/characters/layout.css');
    const cardsSource = readRepoFile('modules/tavern/app-src/styles/characters/cards.css');
    assert.match(layoutSource, /\.character-index-panel \{[\s\S]*min-height: 0;/);
    assert.match(cardsSource, /\.character-card-grid \{[\s\S]*flex: 1 1 auto;[\s\S]*min-height: 0;[\s\S]*overflow-y: auto;[\s\S]*-webkit-overflow-scrolling: touch;/);
    assert.match(cardsSource, /@media \(max-width: 640px\) \{[\s\S]*\.character-card-grid \{[\s\S]*touch-action: pan-y;/);
    assert.match(cardsSource, /@media \(max-width: 640px\) \{[\s\S]*\.character-card-option \{[\s\S]*content-visibility: visible;/);
});

test('tavern split UI keeps App-owned DOM refs explicitly wired', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const settingsControllerSource = readRepoFile('modules/tavern/app-src/components/settings/useTavernSettingsController.ts');
    const chatPageSource = readRepoFile('modules/tavern/app-src/components/chat/TavernChatPage.vue');
    const conversationPanelSource = readRepoFile('modules/tavern/app-src/components/chat/TavernConversationPanel.vue');
    const managerPanelSource = readRepoFile('modules/tavern/app-src/components/chat/TavernManagerPanel.vue');
    const apiPanelSource = readRepoFile('modules/tavern/app-src/components/settings/TavernApiSettingsPanel.vue');
    for (const refName of [
        'chatScrollRef',
        'chatComposeTextareaRef',
        'managerScrollRef',
        'managerComposeTextareaRef',
    ]) {
        assert.match(appSource, new RegExp(`\\b${refName},`));
    }
    assert.match(settingsControllerSource, /\bapiSettingsRootRef,/);
    assert.match(apiPanelSource, /function setApiSettingsRootRef/);
    assert.match(apiPanelSource, /:ref="setApiSettingsRootRef"/);
    assert.match(chatPageSource, /function setChatApiSettingsRootRef/);
    assert.match(chatPageSource, /:ref="setChatApiSettingsRootRef"/);
    assert.match(conversationPanelSource, /function setChatScrollRef/);
    assert.match(conversationPanelSource, /function setChatComposeTextareaRef/);
    assert.match(managerPanelSource, /function setManagerScrollRef/);
    assert.match(managerPanelSource, /function setManagerComposeTextareaRef/);
    assert.doesNotMatch(`${chatPageSource}\n${conversationPanelSource}\n${managerPanelSource}\n${apiPanelSource}`, /ref="(?:apiSettingsRootRef|chatScrollRef|chatComposeTextareaRef|managerScrollRef|managerComposeTextareaRef)"/);
});

test('agent API settings keep preset actions compact and model controls before temperature', () => {
    const markupSource = readRepoFile('modules/agent-core/ui/settings-markup.js');
    const panelSource = readRepoFile('modules/agent-core/ui/settings-panel.js');
    const apiCss = readRepoFile('modules/tavern/app-src/styles/settings/api.css');
    assert.match(markupSource, /function buildPresetActionIcon/);
    assert.match(markupSource, /function getAgentConfigSaveIconName/);
    assert.match(markupSource, /saving: '<path class="xb-assistant-save-spinner"/);
    assert.match(markupSource, /success: '<path d="M20 6 9 17l-5-5"/);
    assert.match(markupSource, /error: '<path d="M18 6 6 18"/);
    assert.match(markupSource, /class="xb-assistant-preset-row"[\s\S]*<select id="xb-assistant-preset-select" class="xb-assistant-preset-field" aria-label="已存预设"><\/select>[\s\S]*id="xb-assistant-new-preset"[\s\S]*buildPresetActionIcon\('add'\)[\s\S]*id="xb-assistant-rename-preset"[\s\S]*buildPresetActionIcon\('rename'\)[\s\S]*id="xb-assistant-save"[\s\S]*buildPresetActionIcon\(saveIcon\)[\s\S]*id="xb-assistant-delete-preset"[\s\S]*buildPresetActionIcon\('delete'\)/);
    assert.match(markupSource, /id="xb-assistant-delegate-preset-select"[\s\S]*id="xb-assistant-delegate-save"[\s\S]*buildPresetActionIcon\(saveIcon\)/);
    assert.doesNotMatch(markupSource, /<span>已存预设<\/span>/);
    assert.doesNotMatch(markupSource, />(?:➕|✏|💾|🗑)/u);
    assert.match(markupSource, /id="xb-assistant-model"[\s\S]*id="xb-assistant-model-pulled"[\s\S]*id="xb-assistant-temperature"/);
    assert.match(markupSource, /id="xb-assistant-delegate-model"[\s\S]*id="xb-assistant-delegate-model-pulled"[\s\S]*id="xb-assistant-delegate-temperature"/);
    assert.doesNotMatch(markupSource, /<span>预设名称<\/span>/);
    assert.doesNotMatch(markupSource, /class="xb-assistant-actions"/);
    assert.match(panelSource, /function createPresetFromForm/);
    assert.match(panelSource, /function renameCurrentPreset/);
    assert.match(panelSource, /#xb-assistant-new-preset/);
    assert.match(panelSource, /#xb-assistant-rename-preset/);
    assert.match(panelSource, /#xb-assistant-delegate-save/);
    assert.match(apiCss, /\.tavern-api-settings \.xb-assistant-preset-row \{[^}]*grid-template-columns: minmax\(0, 1fr\) auto;/);
    assert.match(apiCss, /xb-tavern-api-save-spin/);
    assert.doesNotMatch(apiCss, /\.tavern-api-settings \.xb-assistant-preset-row \{[^}]*grid-template-rows:/);
    assert.match(apiCss, /\.tavern-api-settings \.xb-assistant-preset-tools \{[^}]*grid-template-columns: repeat\(4, 40px\);/);
    assert.match(apiCss, /\.tavern-api-settings \.xb-assistant-icon-button \{[^}]*height: 40px;/);
    assert.match(apiCss, /\.tavern-api-settings \.xb-assistant-icon-button svg \{[\s\S]*stroke: currentColor;/);
});

test('tavern chat exposes local settings modals without leaving the session', () => {
    const cornerSource = readRepoFile('modules/tavern/app-src/components/TavernCornerActions.vue');
    const chatPageSource = readRepoFile('modules/tavern/app-src/components/chat/TavernChatPage.vue');
    const settingsPageSource = readRepoFile('modules/tavern/app-src/components/settings/TavernSettingsPage.vue');
    const chatLayoutCss = readRepoFile('modules/tavern/app-src/styles/chat/layout.css');
    const chatQuickSettingsCss = readRepoFile('modules/tavern/app-src/styles/chat/quick-settings.css');
    const settingsControllerSource = readRepoFile('modules/tavern/app-src/components/settings/useTavernSettingsController.ts');
    const assistantPresetPanelSource = readRepoFile('modules/tavern/app-src/components/settings/TavernAssistantPresetSettingsPanel.vue');
    const stylesSource = readRepoFile('modules/tavern/app-src/styles.css');

    assert.match(cornerSource, /includeApi\?: boolean/);
    assert.match(cornerSource, /includeChatPreset\?: boolean/);
    assert.match(cornerSource, /includeWorldbooks\?: boolean/);
    assert.match(cornerSource, /homeLast\?: boolean/);
    assert.match(cornerSource, /v-if="includeChatPreset"[\s\S]*class="home-icon-button page-chat-preset-button"[\s\S]*v-if="includeApi"[\s\S]*class="home-icon-button page-api-button"[\s\S]*v-if="includeWorldbooks"[\s\S]*class="home-icon-button page-worldbooks-button"[\s\S]*class="home-icon-button home-theme-button"[\s\S]*v-if="includeHome && homeLast"[\s\S]*class="home-icon-button page-home-button"/);
    assert.doesNotMatch(chatPageSource, /TavernCornerActions|include-api|include-chat-preset|include-worldbooks|openQuickSettingsModal/);
    assert.match(settingsPageSource, /<TavernCornerActions[\s\S]*include-home[\s\S]*home-last[\s\S]*@home="activeView = 'home'"[\s\S]*@toggle-theme="homeThemeDark = !homeThemeDark"/);
    assert.match(chatPageSource, /type ChatQuickWorkspace =[\s\S]*'characters'[\s\S]*'api'[\s\S]*'chatPreset'[\s\S]*'assistantPreset'[\s\S]*'worldbooks'[\s\S]*'regex'[\s\S]*'base';/);
    assert.match(chatPageSource, /const quickSettingsOpen = ref<ChatQuickWorkspace \| null>\(null\)/);
    assert.match(chatPageSource, /clearSelection: clearCharacterSelection,[\s\S]*refresh: refreshCharacterList,/);
    assert.match(chatPageSource, /class="home-corner-actions page-corner-actions chat-app-menu-shell"[\s\S]*title="首页"[\s\S]*class="home-icon-button chat-app-menu-button chat-app-menu-button-desktop"[\s\S]*title="酒馆操作菜单"/);
    assert.match(chatPageSource, /class="xb-sidebar settings-sidebar chat-character-sidebar"[\s\S]*class="chat-character-card"[\s\S]*@click="openChatAppWorkspace\('characters'\)"[\s\S]*v-for="item in chatAppMenuItems"[\s\S]*class="guide-step"[\s\S]*@click="openChatAppWorkspace\(item\.key\)"/);
    assert.match(chatPageSource, /class="chat-mobile-action-group"[\s\S]*title="契约"[\s\S]*📜[\s\S]*class="chat-mobile-icon-button chat-mobile-utility-button chat-app-menu-button"[\s\S]*title="酒馆操作菜单"/);
    assert.match(chatPageSource, /class="chat-app-menu-item chat-app-menu-return-home"[\s\S]*返回首页/);
    assert.doesNotMatch(chatPageSource, /class="chat-mobile-action-group"[\s\S]*title="首页"/);
    assert.doesNotMatch(chatPageSource, /class="chat-mobile-icon-button chat-mobile-utility-button"[\s\S]*title="聊天预设"[\s\S]*@click="openChatAppWorkspace\('chatPreset'\)"/);
    assert.doesNotMatch(chatPageSource, /class="chat-mobile-icon-button chat-mobile-utility-button"[\s\S]*title="API 配置"[\s\S]*@click="openChatAppWorkspace\('api'\)"/);
    assert.doesNotMatch(chatPageSource, /class="chat-mobile-icon-button chat-mobile-utility-button"[\s\S]*title="世界书"[\s\S]*@click="openChatAppWorkspace\('worldbooks'\)"/);
    assert.match(chatPageSource, /function openChatAppWorkspace\(workspace: ChatQuickWorkspace\)[\s\S]*closeChatAppMenu\(\);[\s\S]*closeMobileChatPanel\(\);[\s\S]*activeSettingsWorkspace\.value = workspace;[\s\S]*quickSettingsOpen\.value = workspace;[\s\S]*workspace === 'characters'[\s\S]*clearCharacterSelection\(\);[\s\S]*refreshCharacterList\(\)[\s\S]*workspace === 'chatPreset'[\s\S]*syncChatPresetFromHost\(\)[\s\S]*workspace === 'assistantPreset'[\s\S]*refreshPresets\(\)[\s\S]*workspace === 'worldbooks'[\s\S]*syncWorldbooksForCurrentCharacter\(\)[\s\S]*syncGlobalWorldbooksFromHost\(\)[\s\S]*workspace === 'regex'[\s\S]*refreshRegexFromHost\(\)[\s\S]*workspace === 'base'[\s\S]*loadTavernUsers\(\)/);
    assert.doesNotMatch(chatPageSource, /ref="chatAppMenuRef"|const chatAppMenuRef = ref/);
    assert.match(chatPageSource, /const desktopChatAppMenuRef = ref<HTMLElement \| null>\(null\);[\s\S]*const mobileChatAppMenuRef = ref<HTMLElement \| null>\(null\);/);
    assert.match(chatPageSource, /function handleChatAppMenuOutsidePointer[\s\S]*desktopChatAppMenuRef\.value\?\.contains\(target\)[\s\S]*mobileChatAppMenuRef\.value\?\.contains\(target\)[\s\S]*closeChatAppMenu\(\);/);
    assert.match(chatPageSource, /ref="desktopChatAppMenuRef"[\s\S]*class="home-corner-actions page-corner-actions chat-app-menu-shell"/);
    assert.match(chatPageSource, /ref="mobileChatAppMenuRef"[\s\S]*class="chat-app-menu-shell chat-app-menu-shell-mobile"/);
    assert.match(chatPageSource, /watch\(\(\) => selectedSessionId\.value, \(\) => \{[\s\S]*memoryDirectoryOpen\.value = false;[\s\S]*if \(quickSettingsOpen\.value === 'characters'\) \{[\s\S]*quickSettingsOpen\.value = null;/);
    assert.match(chatPageSource, /document\.addEventListener\('pointerdown', handleChatAppMenuOutsidePointer\)[\s\S]*document\.addEventListener\('keydown', handleChatAppMenuKeydown\)/);
    assert.doesNotMatch(chatPageSource, /syncWorldbooksFromHost\(\{ keepSelection: true \}\)/);
    assert.match(chatPageSource, /class="chat-quick-settings-overlay"[\s\S]*v-if="quickSettingsOpen === 'api'"[\s\S]*class="tavern-api-settings chat-quick-api-root"[\s\S]*v-else[\s\S]*class="settings-layout chat-quick-settings-layout"/);
    assert.match(chatPageSource, /<TavernCharacterWorkspacePanel[\s\S]*v-if="quickSettingsOpen === 'characters'"[\s\S]*\/>[\s\S]*<TavernChatPresetSettingsPanel[\s\S]*v-else-if="quickSettingsOpen === 'chatPreset'"[\s\S]*\/>[\s\S]*<TavernAssistantPresetSettingsPanel[\s\S]*v-else-if="quickSettingsOpen === 'assistantPreset'"[\s\S]*\/>[\s\S]*<TavernWorldbooksSettingsPanel[\s\S]*v-else-if="quickSettingsOpen === 'worldbooks'"[\s\S]*\/>[\s\S]*<TavernRegexSettingsPanel[\s\S]*v-else-if="quickSettingsOpen === 'regex'"[\s\S]*\/>[\s\S]*<TavernBaseSettingsPanel[\s\S]*v-else-if="quickSettingsOpen === 'base'"[\s\S]*\/>/);
    assert.match(chatPageSource, /class="chat-quick-settings-body"[\s\S]*:class="quickSettingsLayoutClass"/);
    assert.doesNotMatch(chatPageSource, /class="chat-quick-settings-overlay"[\s\S]*@click\.self="closeQuickSettingsModal"/);
    assert.match(chatPageSource, /class="chat-quick-settings-close"[\s\S]*@click="closeQuickSettingsModal"/);
    assert.match(chatPageSource, /function setChatApiSettingsRootRef[\s\S]*apiSettingsRootRef\.value = element instanceof HTMLElement \? element : null;/);
    assert.match(settingsControllerSource, /\(\) => apiSettingsRootRef\.value,[\s\S]*if \(apiSettingsRootRef\.value\) \{[\s\S]*nextTick\(renderApiSettingsPanel\)/);
    assert.match(chatLayoutCss, /\.chat-quick-settings-overlay \{[\s\S]*position: absolute;[\s\S]*backdrop-filter: blur\(16px\);/);
    assert.match(chatLayoutCss, /\.chat-quick-settings-dialog \{[\s\S]*max-height: min\(88vh, 900px\);/);
    assert.match(chatLayoutCss, /\.chat-quick-settings-dialog \{[\s\S]*grid-template-rows: auto minmax\(0, 1fr\);/);
    assert.match(chatPageSource, /class="chat-quick-settings-overlay"[\s\S]*:class="quickSettingsLayoutClass"[\s\S]*class="chat-quick-settings-dialog"[\s\S]*:class="quickSettingsLayoutClass"/);
    assert.match(chatLayoutCss, /@media \(max-width: 760px\) \{[\s\S]*\.tavern-chat\.xb-page \.chat-quick-settings-overlay\.is-characters-workspace \{[\s\S]*align-items: stretch;[\s\S]*padding: 0;[\s\S]*\.tavern-chat\.xb-page \.chat-quick-settings-dialog\.is-characters-workspace \{[\s\S]*height: 100%;[\s\S]*max-height: none;[\s\S]*border-radius: 0;/);
    assert.match(chatLayoutCss, /\.tavern-chat\.xb-page(?:,[\s\S]*?\.tavern-chat\.xb-page\.chat-focus-manager)? \{[\s\S]*grid-template-columns: 236px minmax\(520px, 0\.98fr\) minmax\(460px, 1\.02fr\);/);
    assert.match(chatLayoutCss, /\.tavern-chat\.xb-page \.chat-character-sidebar \{[\s\S]*border-right: 1px solid var\(--xb-line\);[\s\S]*background: var\(--xb-chat-sidebar-bg\);/);
    assert.match(chatLayoutCss, /\.tavern-chat\.xb-page \.chat-character-card \{[\s\S]*grid-template-columns: 58px minmax\(0, 1fr\);[\s\S]*border-radius: 14px;/);
    assert.match(chatLayoutCss, /\.tavern-chat\.xb-page \.chat-app-menu-button-desktop,[\s\S]*\.tavern-chat\.xb-page \.chat-app-menu-popover-desktop \{[\s\S]*display: none;/);
    assert.match(chatLayoutCss, /@media \(max-width: 1220px\) \{[\s\S]*\.tavern-chat\.xb-page \.chat-character-sidebar \{[\s\S]*display: none;[\s\S]*\.tavern-chat\.xb-page \.chat-app-menu-button-desktop \{[\s\S]*display: grid;[\s\S]*\.tavern-chat\.xb-page \.chat-app-menu-popover-desktop \{[\s\S]*display: grid;/);
    assert.match(chatLayoutCss, /\.tavern-chat\.xb-page \.chat-app-menu-popover \{[\s\S]*top: calc\(100% \+ 8px\);[\s\S]*right: 0;[\s\S]*display: grid;[\s\S]*width: 132px;/);
    assert.match(chatLayoutCss, /\.tavern-chat\.xb-page \.chat-app-menu-item \{[\s\S]*width: 100%;[\s\S]*min-height: 32px;/);
    assert.match(chatLayoutCss, /@media \(max-width: 760px\) \{[\s\S]*\.tavern-chat\.xb-page \.chat-app-menu-shell-mobile \{[\s\S]*position: relative;[\s\S]*\.tavern-chat\.xb-page \.chat-app-menu-shell-mobile \.chat-app-menu-popover \{[\s\S]*width: 108px;/);
    assert.match(chatLayoutCss, /--xb-chat-scroll-padding: 34px 0 0;/);
    assert.match(chatLayoutCss, /--xb-chat-scroll-padding: 22px 0 0;/);
    assert.match(chatLayoutCss, /--xb-chat-scroll-padding: 18px 0 0;/);
    assert.doesNotMatch(chatLayoutCss, /--xb-chat-scroll-padding:\s*\d+px\s+(?:8|10|12)px/);
    assert.match(stylesSource, /@import '\.\/styles\/settings\.css';\s*@import '\.\/styles\/chat\/quick-settings\.css';/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout \{[\s\S]*display: block;[\s\S]*grid-template-columns: none;[\s\S]*overflow: visible;/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout \{[\s\S]*--xb-settings-control-bg: var\(--xb-bg-card\);[\s\S]*--xb-settings-sheet-bg: var\(--xb-chat-pop-bg\);/);
    assert.match(chatQuickSettingsCss, /\.xb-os-shell\.theme-light \.settings-layout\.chat-quick-settings-layout \{[\s\S]*--xb-settings-control-bg: var\(--xb-paper-plain\);[\s\S]*--xb-settings-control-focus-bg: #ffffff;/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout \.xb-main \{[\s\S]*background: transparent;[\s\S]*padding: 0;/);
    assert.match(chatQuickSettingsCss, /\.chat-quick-settings-body\.is-characters-workspace \{[\s\S]*height: 100%;[\s\S]*display: grid;[\s\S]*overflow: hidden;/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout\.is-characters-workspace,[\s\S]*\.settings-layout\.chat-quick-settings-layout\.is-characters-workspace \.xb-main \{[\s\S]*height: 100%;[\s\S]*overflow: hidden;/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout\.is-characters-workspace \.character-workspace-panel \{[\s\S]*height: 100%;[\s\S]*min-height: 0;[\s\S]*overflow: hidden;/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout\.is-characters-workspace \.character-archive \{[\s\S]*flex: 1 1 auto;[\s\S]*overflow: hidden;/);
    assert.match(chatQuickSettingsCss, /@media \(max-width: 760px\) \{[\s\S]*\.settings-layout\.chat-quick-settings-layout\.is-characters-workspace \.character-preview-panel\.dossier-view \{[\s\S]*border-top: 0;[\s\S]*border-radius: 0;[\s\S]*box-shadow: none;[\s\S]*\.settings-layout\.chat-quick-settings-layout\.is-characters-workspace \.character-preview-panel\.dossier-view::before \{[\s\S]*display: none;/);
    assert.match(chatQuickSettingsCss, /\.chat-quick-settings-body\.is-chatPreset-workspace \{[\s\S]*height: 100%;[\s\S]*display: grid;[\s\S]*overflow: hidden;/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout\.is-chatPreset-workspace,[\s\S]*\.settings-layout\.chat-quick-settings-layout\.is-chatPreset-workspace \.xb-main,[\s\S]*\.settings-layout\.chat-quick-settings-layout\.is-chatPreset-workspace \.step-panel \{[\s\S]*height: 100%;[\s\S]*overflow: hidden;/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout\.is-chatPreset-workspace \.preset-workspace \{[\s\S]*height: 100%;[\s\S]*display: flex;[\s\S]*overflow: hidden;/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout\.is-chatPreset-workspace \.preset-studio \{[\s\S]*flex: 1 1 auto;[\s\S]*height: 100%;[\s\S]*overflow: hidden;/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout\.is-chatPreset-workspace \.prompt-sequence-panel \{[\s\S]*height: 100%;[\s\S]*overflow: hidden;/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout\.is-chatPreset-workspace \.prompt-manager-list \{[\s\S]*flex: 1 1 auto;[\s\S]*overflow: auto;/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout\.is-chatPreset-workspace \.prompt-edit-button \{[\s\S]*display: grid;/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout\.is-chatPreset-workspace \.preset-preview-panel \{[\s\S]*z-index: 1;[\s\S]*background: var\(--xb-settings-sheet-bg\);/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout\.is-chatPreset-workspace \.prompt-detail-form \{[\s\S]*flex: 1 1 auto;[\s\S]*overflow: auto;[\s\S]*background: var\(--xb-settings-sheet-bg\);/);
    assert.match(chatQuickSettingsCss, /@media \(max-width: 760px\) \{[\s\S]*\.settings-layout\.chat-quick-settings-layout\.is-chatPreset-workspace \.prompt-sequence-panel \{[\s\S]*overflow: hidden;[\s\S]*\.settings-layout\.chat-quick-settings-layout\.is-chatPreset-workspace \.prompt-manager-list \{[\s\S]*flex: 1 1 auto;[\s\S]*overflow: auto;[\s\S]*-webkit-overflow-scrolling: touch;[\s\S]*touch-action: pan-y;/);
    assert.match(chatQuickSettingsCss, /@media \(max-width: 760px\) \{[\s\S]*\.settings-layout\.chat-quick-settings-layout\.is-chatPreset-workspace \.preset-preview-panel\.prompt-editor-panel \{[\s\S]*position: fixed;[\s\S]*z-index: 180;[\s\S]*inset:[\s\S]*max\(10px, env\(safe-area-inset-top, 0px\)\)[\s\S]*overflow: hidden;[\s\S]*border-radius: 14px;/);
    assert.match(chatQuickSettingsCss, /@media \(max-width: 760px\) \{[\s\S]*\.settings-layout\.chat-quick-settings-layout\.is-chatPreset-workspace \.prompt-detail-form \{[\s\S]*flex: 1 1 auto;[\s\S]*overflow: auto;/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout\.is-worldbooks-workspace \.worldbook-entry-editor \{[\s\S]*z-index: 1;[\s\S]*background: var\(--xb-settings-sheet-bg\);/);
    assert.match(chatQuickSettingsCss, /\.settings-layout\.chat-quick-settings-layout\.is-worldbooks-workspace \.worldbook-entry-editor input\[type="text"\],[\s\S]*background-color: var\(--xb-settings-control-bg\);/);
    assert.doesNotMatch(settingsControllerSource, /activeView\.value !== 'settings' \|\| options\.activeSettingsWorkspace\.value !== 'worldbooks'/);
    assert.match(settingsControllerSource, /watch\(selectedWorldbookName, \(name\) => \{[\s\S]*activeSettingsWorkspace\.value !== 'worldbooks'[\s\S]*loadSelectedWorldbookPreview\(name\)/);
    assert.match(settingsControllerSource, /workspace === 'assistantPreset'[\s\S]*void refreshPresets\(\);/);
    assert.match(assistantPresetPanelSource, />维护规则</);
    assert.doesNotMatch(assistantPresetPanelSource, />记忆档案</);
});

test('tavern confirmation prompts use the shared centered app dialog', () => {
    const browserDialogs = sourceMatches(/window\.(confirm|alert|prompt)\(/);
    assert.deepEqual(browserDialogs, []);

    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const contextSource = readRepoFile('modules/tavern/app-src/components/tavern-app-context.ts');
    const dialogCss = readRepoFile('modules/tavern/app-src/styles/dialog.css');
    const stylesSource = readRepoFile('modules/tavern/app-src/styles.css');
    const settingsControllerSource = readRepoFile('modules/tavern/app-src/components/settings/useTavernSettingsController.ts');
    const markdownToolsSource = readRepoFile('modules/tavern/app-src/components/chat/useTavernMarkdownTools.ts');

    assert.match(contextSource, /confirmTavernDialog: TavernCommand<\[options: TavernDialogOptions \| string\], Promise<boolean>>;/);
    assert.match(contextSource, /alertTavernDialog: TavernCommand<\[options: TavernDialogOptions \| string\], Promise<void>>;/);
    assert.match(contextSource, /promptTavernDialog: TavernCommand<\[options: TavernDialogOptions \| string\], Promise<string \| null>>;/);
    assert.match(appSource, /<Teleport to="body">[\s\S]*class="tavern-dialog-overlay"[\s\S]*class="tavern-dialog"/);
    assert.match(appSource, /@click\.self="handleTavernDialogBackdropClick"/);
    assert.match(appSource, /@submit\.prevent="confirmOpenTavernDialog"/);
    assert.match(appSource, /ref="tavernDialogCancelRef"[\s\S]*ref="tavernDialogPrimaryRef"/);
    assert.match(appSource, /function focusInitialTavernDialogControl\(\)[\s\S]*dialog\.kind === 'alert'[\s\S]*tavernDialogPrimaryRef[\s\S]*tavernDialogCancelRef/);
    assert.match(appSource, /function handleTavernDialogTab\(event: KeyboardEvent\)/);
    assert.match(appSource, /function canCloseTavernDialogFromBackdrop[\s\S]*dialog\.kind === 'alert' \|\| \(dialog\.kind === 'confirm' && dialog\.tone === 'default'\)/);
    assert.match(stylesSource, /@import '\.\/styles\/dialog\.css';/);
    assert.match(dialogCss, /\.tavern-dialog-overlay \{[\s\S]*position: fixed;[\s\S]*z-index: 100200;[\s\S]*display: grid;[\s\S]*place-items: center;/);
    assert.match(dialogCss, /\.tavern-dialog-overlay\.theme-light \{/);
    assert.doesNotMatch(dialogCss, /bottom:\s*0/);
    assert.match(settingsControllerSource, /confirmDialog: \(options:/);
    assert.match(markdownToolsSource, /confirmDialog: \(options:/);
});

test('tavern map update badge stays collapsed until requested', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const contextSource = readRepoFile('modules/tavern/app-src/components/tavern-app-context.ts');
    const mapPanelSource = readRepoFile('modules/tavern/app-src/components/TavernMapPanel.vue');
    const mapCss = readRepoFile('modules/tavern/app-src/styles/chat/map.css');

    assert.match(mapPanelSource, /const mapBadgeExpanded = ref\(false\)/);
    assert.doesNotMatch(mapPanelSource, /mapBadgeExpanded\.value = true/);
    assert.match(mapPanelSource, /function toggleMapBadge\(\) \{[\s\S]*mapBadgeExpanded\.value = !mapBadgeExpanded\.value/);
    assert.match(mapPanelSource, /const mapPanOffset = ref<\[number, number\]>\(\[0, 0\]\)/);
    assert.match(mapPanelSource, /const mapZoom = ref\(1\)/);
    assert.match(mapPanelSource, /getTavernMapPresentationTransform\(activeMapDocument\.value\)/);
    assert.match(mapPanelSource, /function projectMapPoint\(point: \[number, number\]\)[\s\S]*projectTavernMapPresentationPoint\(point, presentationTransform\.value\)/);
    assert.match(mapPanelSource, /function mapBodyBounds\(\)[\s\S]*sourceBoundsForDerivedLabel\(item\)/);
    assert.match(mapPanelSource, /function sourceBoundsForDerivedLabel\(source: TavernMapElement\)[\s\S]*materialEntry\(source\.material\)\?\.layer === 'light'[\s\S]*const radius = 4;/);
    assert.match(mapPanelSource, /function derivedLabelPosition\(element: TavernMapElement\)[\s\S]*sourceCenterX = \(sourceBounds\.minX \+ sourceBounds\.maxX\) \/ 2[\s\S]*sourceBounds\.minY - actorGap/);
    assert.match(mapPanelSource, /if \(id\.startsWith\('__label__'\)\) \{return derivedLabelPosition\(element\) \|\| projectedAt;\}/);
    assert.match(mapPanelSource, /const zoomedWidth = width \/ zoom/);
    assert.match(mapPanelSource, /function setMapZoom\(nextZoom: number, anchor\?: \{ clientX: number; clientY: number \}\)/);
    const documentRevisionWatch = mapPanelSource.match(/watch\(\(\) => props\.document\?\.revision,[\s\S]*?\n\}\);/);
    assert.ok(documentRevisionWatch);
    assert.doesNotMatch(documentRevisionWatch[0], /resetMapPan/);
    const patchLengthWatch = mapPanelSource.match(/watch\(\(\) => selectedDocPatches\.value\.length,[\s\S]*?\n\}\);/);
    assert.ok(patchLengthWatch);
    assert.doesNotMatch(patchLengthWatch[0], /resetMapPan/);
    assert.match(mapPanelSource, /function handleMapWheel\(event: WheelEvent\)[\s\S]*event\.preventDefault\(\)[\s\S]*setMapZoom/);
    assert.match(mapPanelSource, /function handleMapPointerDown\(event: PointerEvent\)/);
    assert.match(mapPanelSource, /from '\.\.\/map-render-style';/);
    assert.match(mapPanelSource, /function elementFill\(element: TavernMapElement\)[\s\S]*return tavernMapElementFill\(element, mapVisualContext\(\)\);/);
    assert.match(mapPanelSource, /function elementColor\(element: TavernMapElement\)[\s\S]*return tavernMapElementColor\(element, mapVisualContext\(\)\);/);
    assert.match(mapPanelSource, /function strokeWidth\(element: TavernMapElement\)[\s\S]*return tavernMapElementStrokeWidth\(element\);/);
    assert.match(mapPanelSource, /const casing = forcedOpKind === 'remove' \? null : tavernMapElementLineCasing\(element\);/);
    assert.match(mapPanelSource, /const fill = forcedOpKind === 'remove'[\s\S]*hasAreaShape\(element\) \? 'rgba\(185, 64, 53, 0\.16\)' : 'none'[\s\S]*: elementFill\(element\);/);
    assert.match(mapPanelSource, /role: 'line-casing'/);
    assert.match(mapPanelSource, /role: 'line-core'/);
    assert.match(mapPanelSource, /const sceneSurfaceElement = computed\(\(\) => getTavernMapSceneSurfaceElement\(activeMapDocument\.value\)\)/);
    assert.match(mapPanelSource, /const visibleRenderItems = computed<MapRenderItem\[\]>\(\(\) => \{[\s\S]*sceneSurfaceElementId\.value[\s\S]*filter\(\(item\) => item\.element\.id !== surfaceId\)/);
    assert.match(mapPanelSource, /:class="\[`theme-\$\{theme\}`, `mode-\$\{replayMode\}`, \{ 'is-panning': mapDrag, 'has-scene-surface': sceneSurface \}\]"/);
    assert.match(mapPanelSource, /const svgDefsNonce = ref\(0\)/);
    assert.match(mapPanelSource, /function svgDefId\(id: string\)[\s\S]*return `\$\{svgLocalId\(id\)\}-r\$\{svgDefsNonce\.value\}`;/);
    assert.match(mapPanelSource, /function scopeSvgUrl\(value: string\)[\s\S]*replace\(\/url\\\(#\(\[\^\)\]\+\)\\\)\/g/);
    assert.match(mapPanelSource, /function redrawMapRenderLayer\(\)[\s\S]*svgDefsNonce\.value \+= 1;[\s\S]*replayKey\.value \+= 1;/);
    assert.match(mapPanelSource, /class="map-scene-surface"[\s\S]*:fill="sceneSurface\.fill"[\s\S]*:filter="svgUrl\('tavern-mat-texture'\)"[\s\S]*class="map-fill-layer"/);
    assert.match(mapPanelSource, /:id="svgDefId\('tavern-map-shadow'\)"[\s\S]*<feDropShadow[\s\S]*flood-opacity="0\.42"/);
    assert.match(mapPanelSource, /:id="svgDefId\('tavern-mat-texture'\)"[\s\S]*<feTurbulence[\s\S]*baseFrequency="0\.7"[\s\S]*<feBlend[\s\S]*mode="multiply"/);
    assert.match(mapPanelSource, /:id="svgDefId\('mat-wood'\)"[\s\S]*:id="svgDefId\('mat-stone'\)"[\s\S]*:id="svgDefId\('mat-tile'\)"[\s\S]*:id="svgDefId\('mat-carpet'\)"[\s\S]*:id="svgDefId\('mat-bed-sheet'\)"[\s\S]*:id="svgDefId\('mat-fabric'\)"[\s\S]*:id="svgDefId\('mat-tatami'\)"[\s\S]*:id="svgDefId\('mat-sand'\)"[\s\S]*:id="svgDefId\('mat-marble'\)"[\s\S]*:id="svgDefId\('mat-blood'\)"[\s\S]*:id="svgDefId\('mat-water'\)"[\s\S]*:id="svgDefId\('mat-grass'\)"[\s\S]*:id="svgDefId\('mat-dirt'\)"[\s\S]*:id="svgDefId\('mat-snow'\)"[\s\S]*:id="svgDefId\('mat-metal'\)"[\s\S]*:id="svgDefId\('mat-rune'\)"/);
    assert.match(mapPanelSource, /:id="svgDefId\('grad-warm'\)"[\s\S]*stop-color="#ffd9a0"[\s\S]*:id="svgDefId\('grad-cold'\)"[\s\S]*stop-color="#cfe4ff"/);
    assert.doesNotMatch(mapPanelSource, /id="(?:tavern-mat-texture|mat-metal|mood-cold|map-vignette-radial)"|filter="url\(#tavern-mat-texture\)"|filter="url\(#tavern-map-sketch\)"|filter="url\(#tavern-map-shadow\)"/);
    assert.doesNotMatch(mapPanelSource, /<g\s+class="map-fill-layer"[\s\S]{0,120}filter="url\(#tavern-mat-texture\)"/);
    assert.match(mapPanelSource, /class="map-line-layer"[\s\S]*:filter="svgUrl\('tavern-map-sketch'\)"[\s\S]*v-for="item in regularLineCasingItems"/);
    assert.match(mapPanelSource, /<g :filter="svgUrl\('tavern-map-shadow'\)">[\s\S]*v-for="item in symbolLineItems"/);
    assert.match(mapPanelSource, /class="map-avatar-layer"[\s\S]*:filter="svgUrl\('tavern-map-shadow'\)"/);
    assert.match(mapPanelSource, /class="tavern-map-redraw-button"[\s\S]*title="重绘地图渲染层"[\s\S]*@click="redrawMapRenderLayer"/);
    assert.match(mapPanelSource, /class="tavern-map-zoom-controls"[\s\S]*@click="zoomMapBy\(-0\.25\)"[\s\S]*{{ mapZoomLabel }}[\s\S]*@click="zoomMapBy\(0\.25\)"/);
    assert.match(mapPanelSource, /@pointerdown="handleMapPointerDown"[\s\S]*@pointermove="handleMapPointerMove"[\s\S]*@pointerup="handleMapPointerEnd"[\s\S]*@pointercancel="handleMapPointerEnd"[\s\S]*@wheel="handleMapWheel"/);
    assert.match(mapPanelSource, /function pickPenAnimationItem[\s\S]*!item\.symbolIcon[\s\S]*item\.layer !== 'label'[\s\S]*!!item\.path/);
    assert.match(mapPanelSource, /const animated = pickPenAnimationItem\(animatedItems\.value\)/);
    assert.doesNotMatch(mapPanelSource, /tavern-map-active-button|设为当前|activate-document/);
    assert.doesNotMatch(appSource, /activateMapDocument/);
    assert.doesNotMatch(contextSource, /activateMapDocument/);
    assert.match(mapCss, /\.tavern-chat\.xb-page \.tavern-map-canvas svg \{[\s\S]*cursor: grab;[\s\S]*touch-action: none;[\s\S]*user-select: none;/);
    assert.match(mapCss, /\.tavern-chat\.xb-page \.tavern-map-canvas\.is-panning svg \{[\s\S]*cursor: grabbing;/);
    assert.match(mapCss, /\.tavern-chat\.xb-page \.tavern-map-redraw-button \{[\s\S]*position: absolute;[\s\S]*left: 16px;[\s\S]*bottom: 16px;/);
    assert.match(mapCss, /\.tavern-chat\.xb-page \.tavern-map-canvas\.has-scene-surface::before \{/);
    assert.match(mapCss, /\.tavern-chat\.xb-page \.map-scene-surface,[\s\S]*\.tavern-chat\.xb-page \.map-light-layer,[\s\S]*\.tavern-chat\.xb-page \.map-mood-overlay,[\s\S]*\.tavern-chat\.xb-page \.map-vignette-overlay \{[\s\S]*pointer-events: none;/);
    assert.match(mapCss, /\.tavern-chat\.xb-page \.tavern-map-compact-controls\.is-floating \{[\s\S]*max-width: calc\(100% - 74px\);/);
    assert.match(mapCss, /\.tavern-chat\.xb-page \.tavern-map-zoom-controls \{[\s\S]*position: absolute;[\s\S]*right: 10px;[\s\S]*top: 10px;[\s\S]*grid-template-columns: 22px 34px 22px;/);
    assert.match(mapCss, /@media \(max-width: 640px\) \{[\s\S]*\.tavern-chat\.xb-page \.tavern-map-zoom-controls \{[\s\S]*right: 8px;[\s\S]*top: 8px;[\s\S]*grid-template-columns: 20px 30px 20px;/);
    assert.match(mapCss, /\.tavern-chat\.xb-page \.tavern-map-badge-shell \{[\s\S]*position: absolute;[\s\S]*top: 14px;[\s\S]*left: 16px;/);
    assert.match(mapCss, /\.tavern-chat\.xb-page \.tavern-map-timeline-control \{[\s\S]*position: absolute;[\s\S]*left: 54px;[\s\S]*bottom: 16px;/);
    assert.doesNotMatch(mapCss, /tavern-map-active-button/);
});

test('tavern scene map player marker uses current user identity instead of generic player label', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const contextSource = readRepoFile('modules/tavern/app-src/components/tavern-app-context.ts');
    const workspacePanelSource = readRepoFile('modules/tavern/app-src/components/chat/TavernWorkspacePanel.vue');
    const mapPanelSource = readRepoFile('modules/tavern/app-src/components/TavernMapPanel.vue');

    assert.match(contextSource, /export interface TavernWorkspaceContext[\s\S]*displayUserName: TavernReadable<string>;[\s\S]*visibleUserAvatar: TavernReadable<string>;/);
    assert.match(appSource, /const workspaceContext = \{[\s\S]*displayUserName: userName,[\s\S]*visibleUserAvatar,[\s\S]*\} satisfies TavernWorkspaceContext;/);
    assert.doesNotMatch(workspacePanelSource, /useTavernChatContext/);
    assert.match(workspacePanelSource, /const \{[\s\S]*chatWorkspacePanel,[\s\S]*displayUserName,[\s\S]*visibleUserAvatar,[\s\S]*\} = workspace;/);
    assert.match(workspacePanelSource, /if \(actorKey === 'player'\) \{\s*return String\(displayUserName\.value \|\| 'User'\)\.trim\(\) \|\| 'User';\s*\}/);
    assert.match(workspacePanelSource, /:player-display-name="displayUserName"[\s\S]*:player-avatar-url="visibleUserAvatar"/);
    assert.match(mapPanelSource, /playerDisplayName\?: string;[\s\S]*playerAvatarUrl\?: string;/);
    assert.match(mapPanelSource, /const normalizedPlayerDisplayName = computed\(\(\) => String\(props\.playerDisplayName \|\| ''\)\.trim\(\) \|\| 'User'\)/);
    assert.match(mapPanelSource, /const normalizedPlayerAvatarUrl = computed\(\(\) => String\(props\.playerAvatarUrl \|\| ''\)\.trim\(\)\)/);
    assert.match(mapPanelSource, /if \(isPlayer && normalizedPlayerAvatarUrl\.value && forcedOpKind !== 'remove'\) \{/);
    assert.match(mapPanelSource, /function sourceIconRadiusForDerivedLabel\(source: TavernMapElement\)[\s\S]*isPlayerActorElement\(source\) && normalizedPlayerAvatarUrl\.value[\s\S]*return 12;/);
    assert.match(mapPanelSource, /layer: 'avatar'/);
    assert.match(mapPanelSource, /dash: '3 2'/);
    assert.match(mapPanelSource, /id: `\$\{element\.id\}-avatar`,[\s\S]*layer: 'avatar',[\s\S]*fill: 'none'[\s\S]*avatarClipId,/);
    assert.match(mapPanelSource, /id: `\$\{element\.id\}-player-outline`,[\s\S]*layer: 'avatar',[\s\S]*dash: '3 2'/);
    assert.match(mapPanelSource, /id: `\$\{element\.id\}-symbol`,[\s\S]*layer: 'line',[\s\S]*symbolIcon,/);
    assert.match(mapPanelSource, /const avatarImageItems = computed<MapAvatarImageItem\[\]>/);
    assert.match(mapPanelSource, /<clipPath[\s\S]*v-for="item in avatarImageItems"[\s\S]*:id="svgDefId\(item\.avatarClipId\)"[\s\S]*<circle[\s\S]*:r="item\.avatarSize \/ 2"/);
    assert.match(mapPanelSource, /<image[\s\S]*v-for="item in avatarImageItems"[\s\S]*:clip-path="scopeSvgUrl\(`url\(#\$\{item\.avatarClipId\}\)`\)"[\s\S]*preserveAspectRatio="xMidYMid slice"/);
    assert.ok(
        mapPanelSource.indexOf('class="map-avatar-layer"') > mapPanelSource.indexOf('class="map-removed-layer"'),
        'player avatar layer must render after every map content layer',
    );
    assert.doesNotMatch(mapPanelSource, /#4ea1ff/);
});

test('tavern map icons use Material Symbols vendor licensing instead of runtime legacy attribution', () => {
    const mapPanelSource = readRepoFile('modules/tavern/app-src/components/TavernMapPanel.vue');
    const atlasPanelSource = readRepoFile('modules/tavern/app-src/components/TavernAtlasPanel.vue');
    const noticeSource = readRepoFile('docs/NOTICE');
    const licenseSource = readRepoFile('docs/LICENSE.md');

    assert.doesNotMatch(mapPanelSource, new RegExp(['TAVERN_MAP_ICON_' + 'ATTRIBUTION', 'map-' + 'glyphs'].join('|')));
    assert.doesNotMatch(atlasPanelSource, new RegExp(['TAVERN_MAP_ICON_' + 'ATTRIBUTION', 'map-' + 'glyphs'].join('|')));
    assert.match(noticeSource, /Material Symbols[\s\S]*Local license copy: libs\/material-symbols\/LICENSE/);
    assert.match(licenseSource, /libs\/\*/);
});

test('tavern atlas only opens scene maps that actually exist', () => {
    const atlasPanelSource = readRepoFile('modules/tavern/app-src/components/TavernAtlasPanel.vue');
    const workspacePanelSource = readRepoFile('modules/tavern/app-src/components/chat/TavernWorkspacePanel.vue');

    assert.match(atlasPanelSource, /const mapDocIds = computed\(\(\) => new Set\(props\.mapDocuments\.map\(\(document\) => document\.docId\)\)\)/);
    assert.match(atlasPanelSource, /function hasMapDocument\(location: TavernAtlasLocation \| null \| undefined\): boolean/);
    assert.match(atlasPanelSource, /'has-map': hasMapDocument\(location\)/);
    assert.doesNotMatch(atlasPanelSource, /查看场景图|viewSelectedMap|defineEmits/);
    assert.match(atlasPanelSource, /displayMode\?: 'full' \| 'graph' \| 'detail'/);
    assert.match(atlasPanelSource, /const showGraph = computed\(\(\) => props\.displayMode !== 'detail'\)/);
    assert.match(atlasPanelSource, /const showDetail = computed\(\(\) => props\.displayMode !== 'graph'\)/);
    assert.match(atlasPanelSource, /const atlasPanOffset = ref<\[number, number\]>\(\[0, 0\]\)/);
    assert.match(atlasPanelSource, /const atlasZoom = ref\(1\)/);
    assert.match(atlasPanelSource, /const atlasViewBoxArray = computed<\[number, number, number, number\]>/);
    assert.match(atlasPanelSource, /function setAtlasZoom\(nextZoom: number, anchor\?: \{ clientX: number; clientY: number \}\)/);
    assert.match(atlasPanelSource, /watch\(\(\) => \[props\.document\?\.docId, props\.displayMode\] as const, \(\) => \{[\s\S]*resetAtlasPan\(\);[\s\S]*\}\);/);
    assert.doesNotMatch(atlasPanelSource, /watch\(\(\) => \[props\.document\?\.docId, props\.document\?\.revision, props\.displayMode, atlas\.value\.locations\.length\]/);
    assert.match(atlasPanelSource, /function handleAtlasWheel\(event: WheelEvent\)[\s\S]*event\.preventDefault\(\)[\s\S]*setAtlasZoom/);
    assert.match(atlasPanelSource, /class="tavern-map-zoom-controls tavern-atlas-zoom-controls"[\s\S]*@click="zoomAtlasBy\(-0\.25\)"[\s\S]*{{ atlasZoomLabel }}[\s\S]*@click="zoomAtlasBy\(0\.25\)"/);
    assert.match(atlasPanelSource, /ref="atlasSvgRef"[\s\S]*:viewBox="atlasViewBox"[\s\S]*@pointerdown="handleAtlasPointerDown"[\s\S]*@wheel="handleAtlasWheel"/);
    assert.match(atlasPanelSource, /已关联 \$\{docId\}，地图未创建/);
    assert.match(workspacePanelSource, /if \(atlasDocument\.value\.activeLocationKey\) \{return atlasActiveMapDocId\.value;\}/);
    assert.match(workspacePanelSource, /return String\(activeMapDocId\.value \|\| 'main'\)\.trim\(\)/);
    assert.match(workspacePanelSource, /!!atlasDocument\.value\.activeLocationKey && !atlasActiveMapDocId\.value/);
});

test('tavern edit and delete route accepted rollback through its feature boundary', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const rollbackSource = readRepoFile('modules/tavern/app-src/features/accepted-rollback/accepted-rollback.ts');

    assert.match(appSource, /from '\.\/features\/accepted-rollback\/accepted-rollback'/);
    assert.match(appSource, /describeAcceptedStateRollbackImpact\(message\.sessionId, message\.order\)/);
    assert.match(appSource, /rollbackImpactLines\(impact\)/);
    assert.doesNotMatch(appSource, /async function describeAcceptedStateRollbackImpact/);
    assert.doesNotMatch(appSource, /function rollbackImpactLines\(impact: AcceptedStateRollbackImpact\)/);
    assert.doesNotMatch(appSource, /describeTavernMemoryRestoreImpact|restoreTavernMemoryToFloor|trimTavernMemorySnapshotsFromFloor/);
    assert.doesNotMatch(appSource, /describeXbTavernManagerRollbackImpactForMessageRange/);
    assert.match(rollbackSource, /export async function cancelAcceptedRollbackManagersBeforeMessage/);
    assert.match(rollbackSource, /export async function restoreAcceptedStateBeforeMessage/);
    assert.match(rollbackSource, /export async function describeAcceptedStateRollbackImpact/);
    assert.match(rollbackSource, /export function rollbackImpactLines/);
    assert.match(rollbackSource, /memory:[\s\S]*status:[\s\S]*managers:/);
    assert.match(rollbackSource, /describeTavernStatusRestoreImpact/);
    assert.match(rollbackSource, /restoreTavernStatusToFloor/);
    assert.match(rollbackSource, /trimTavernStatusSnapshotsFromFloor/);
    assert.match(rollbackSource, /willRollbackState:[\s\S]*willCancelWork:/);
    assert.doesNotMatch(rollbackSource, /export async function rollbackAcceptedStateBeforeMessage/);
    assert.doesNotMatch(appSource, /acceptedStateRollbackNoticeForFloor/);
    assert.doesNotMatch(appSource, /restoreMemoryStateBeforeMessage|memoryRollbackNoticeForFloor/);
});

test('tavern phone reply work participates in chat and archive lifecycle guards', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const phoneControllerSource = readRepoFile('modules/tavern/app-src/features/phone-os/apps/messages/useTavernMessagesController.ts');
    const communicationSource = readRepoFile('modules/tavern/shared/communications.ts');
    const conversationSource = readRepoFile('modules/tavern/app-src/components/phone-os/apps/messages/TavernMessagesConversation.vue');

    assert.match(appSource, /function isPhoneSendingForSession\(sessionId = selectedSessionId\.value\)/);
    assert.match(appSource, /phoneContext\.messages\.isSending\.value && phoneContext\.messages\.sendingSessionId\.value === id/);
    assert.match(appSource, /if \(isPhoneSendingForSession\(\)\) \{return '手机消息正在等待回复，稍后再开启对话分支。';\}/);
    assert.match(appSource, /async function backupSelectedCharacterArchive\(\) \{[\s\S]*if \(phoneContext\.messages\.isSending\.value\)/);
    assert.match(appSource, /async function restoreSelectedCharacterArchive\(\) \{[\s\S]*if \(phoneContext\.messages\.isSending\.value\)/);
    assert.match(appSource, /async function removeSession\(sessionId: string, event\?: Event\) \{[\s\S]*isPhoneSendingForSession\(sessionId\)/);
    assert.match(phoneControllerSource, /recoverInterruptedTavernCommunicationReplyRequests/);
    assert.match(phoneControllerSource, /isSending\.value && sendingSessionId\.value === sessionId && !active/);
    assert.match(phoneControllerSource, /interface TavernPhoneSendTask \{[\s\S]*sessionId: string;[\s\S]*contextSnapshot: XbTavernContext;[\s\S]*agentConfig: Record<string, unknown>;/);
    assert.match(phoneControllerSource, /contextSnapshot: cloneSerializable\(options\.effectiveContext\.value \|\| \{\}\)/);
    assert.match(phoneControllerSource, /sendingSessionId\.value = task\.sessionId/);
    assert.match(phoneControllerSource, /agentConfig: task\.agentConfig/);
    assert.match(phoneControllerSource, /messages: await buildPhoneMessages\(task, userMessage\)/);
    assert.match(phoneControllerSource, /sessionId: task\.sessionId/);
    assert.match(phoneControllerSource, /options\.memoryEditorMode\.value === 'edit'/);
    assert.match(phoneControllerSource, /options\.characterArchiveBusy\.value/);
    assert.doesNotMatch(phoneControllerSource, /appendPendingTavernCommunicationMessage|failTavernCommunicationMessage|retryFailedTavernCommunicationMessage/);
    assert.doesNotMatch(phoneControllerSource, /正在输入…/);
    assert.match(communicationSource, /thread\.replyRequest\?\.status === 'pending'[\s\S]*communication_reply_request_pending/);
    assert.match(communicationSource, /id: createId\('communication-reply-request'\)/);
    assert.match(communicationSource, /replyRequest\.id !== replyRequestId/);
    assert.match(communicationSource, /leaseExpiresAt: timestamp \+ TAVERN_COMMUNICATION_REPLY_LEASE_MS/);
    assert.match(communicationSource, /Number\(thread\.replyRequest\?\.leaseExpiresAt\) <= timestamp/);
    assert.match(phoneControllerSource, /touchTavernCommunicationReplyRequest/);
    assert.match(phoneControllerSource, /active\.replyRequestId/);
    assert.match(phoneControllerSource, /const completion = await completeTavernCommunicationReply[\s\S]*completion === null/);
    assert.match(conversationSource, /:disabled="!!retryBlockedReason"/);
    assert.match(conversationSource, /<small v-if="retryBlockedReason">/);
    assert.doesNotMatch(phoneControllerSource, /getTavernMemoryFile\(sessionId, 'memory\/state\.md'\)/);
});

test('tavern phone context keeps timeline-anchored main-story integration and media boundaries', () => {
    const phoneControllerSource = readRepoFile('modules/tavern/app-src/features/phone-os/apps/messages/useTavernMessagesController.ts');
    const phoneContextSource = readRepoFile('modules/tavern/app-src/features/phone-os/apps/messages/tavern-messages-context.ts');
    const phonePromptSource = readRepoFile('modules/tavern/app-src/features/phone-os/apps/messages/tavern-messages-prompt.ts');
    const phoneResponseSource = readRepoFile('modules/tavern/app-src/features/phone-os/apps/messages/tavern-messages-response.ts');
    const phoneShellSource = readRepoFile('modules/tavern/app-src/components/phone-os/TavernPhoneSystemBar.vue');
    const phoneConversationSource = readRepoFile('modules/tavern/app-src/components/phone-os/apps/messages/TavernMessagesConversation.vue');
    const phoneContactListSource = readRepoFile('modules/tavern/app-src/components/phone-os/apps/messages/TavernMessagesThreadList.vue');
    const phoneBubbleSource = readRepoFile('modules/tavern/app-src/components/phone-os/apps/messages/TavernMessagesBubble.vue');
    const phoneMediaSource = readRepoFile('modules/tavern/app-src/features/phone-os/apps/messages/tavern-message-media.ts');
    const communicationMessageSource = readRepoFile('modules/tavern/shared/communication-message.ts');
    const sessionDbSource = readRepoFile('modules/tavern/shared/session-db.ts');
    const tavernHostSource = readRepoFile('modules/tavern/tavern.ts');
    const fourthWallSource = readRepoFile('modules/fourth-wall/fourth-wall.js');
    const ttsSource = readRepoFile('modules/tts/tts.js');
    const ttsPlaybackSource = readRepoFile('modules/tts/tts-playback-runtime.js');
    const ebookSource = readRepoFile('modules/ebook/ebook.js');
    const fourthWallEnhancerSource = readRepoFile('modules/fourth-wall/fw-message-enhancer.js');
    const communicationSource = readRepoFile('modules/tavern/shared/communications.ts');
    const runOnceSource = readRepoFile('modules/tavern/app-src/runtime/run-once.ts');
    const managerSource = readRepoFile('modules/tavern/app-src/runtime/manager.ts');

    assert.match(phoneControllerSource, /buildTavernMessagesRequestMessages/);
    assert.match(phoneContextSource, /buildTavernPhonePromptMessages/);
    assert.match(phonePromptSource, /<role>/);
    assert.match(phonePromptSource, /<setting>/);
    assert.match(phonePromptSource, /<story_history>/);
    assert.match(phonePromptSource, /<current_state_and_memory>/);
    assert.match(phonePromptSource, /buildTavernPhoneThreadContextMessage/);
    assert.match(phonePromptSource, /isContactMemoryFile/);
    assert.match(phoneResponseSource, /findBalancedJsonObjectEnd/);
    assert.match(phoneResponseSource, /extractBalancedJsonObjects/);
    assert.match(phoneResponseSource, /for \(const parsed of extractBalancedJsonObjects\(value\)\)/);
    assert.match(phoneResponseSource, /JSON\.parse\(text\.slice\(start, end \+ 1\)\)/);
    assert.match(sessionDbSource, /TavernCommunicationMessagePayload =\s*\| \{ type: 'text'/);
    assert.match(sessionDbSource, /\| \{ type: 'voice'; transcript: string; emotion\?: string \}/);
    assert.match(sessionDbSource, /\| \{ type: 'image'; description: string; generationPrompt\?: string; assetRef\?: string \}/);
    assert.match(sessionDbSource, /const version12 = this\.version\(12\)/);
    assert.match(sessionDbSource, /version12\.upgrade[\s\S]*communicationContacts'\)\.clear\(\)[\s\S]*communicationThreads'\)\.clear\(\)[\s\S]*communicationMessages'\)\.clear\(\)[\s\S]*communicationSnapshots'\)\.clear\(\)/);
    assert.match(communicationMessageSource, /tavernCommunicationPayloadTypeLabel/);
    assert.match(phonePromptSource, /generationPrompt/);
    assert.match(phonePromptSource, /不得添加 description 中不存在的人物、地点、动作或事件/);
    assert.match(phoneControllerSource, /xb-tavern:voice-play/);
    assert.match(phoneControllerSource, /xb-tavern:inline-image-generate/);
    assert.match(phoneBubbleSource, /message\.payload\.type === 'voice'/);
    assert.match(phoneBubbleSource, /message\.payload\.type === 'image'/);
    assert.match(phoneBubbleSource, /new IntersectionObserver/);
    assert.match(phoneBubbleSource, /rootMargin: '320px 0px'/);
    assert.match(phoneBubbleSource, /onDeactivated[\s\S]*releaseImage\(\)/);
    assert.match(phoneBubbleSource, /watch\(imageExpanded[\s\S]*document\.addEventListener\('keydown', handleEscape, true\)/);
    assert.match(phoneBubbleSource, /event\.stopImmediatePropagation\(\)/);
    assert.match(phoneBubbleSource, /data-tavern-phone-modal="image-preview"/);
    assert.match(phoneBubbleSource, /ref="lightboxCloseButtonRef"/);
    assert.match(phoneControllerSource, /queueAhead: Math\.max\(0, Number\(payload\.ahead\)/);
    assert.match(phoneControllerSource, /releasedTavernMessageImageState\(current\)/);
    assert.match(phoneControllerSource, /shouldEnsureTavernMessageImage\(current, force\)/);
    assert.match(phoneMediaSource, /if \(current\.status === 'error'\) \{return current;\}/);
    assert.match(phoneMediaSource, /return force \|\| !current \|\| current\.status === 'idle';/);
    assert.match(tavernHostSource, /case 'xb-tavern:voice-play':/);
    assert.match(tavernHostSource, /window\.xiaobaixTts\?\.playTransient/);
    assert.doesNotMatch(tavernHostSource, /fourth-wall\/fw-voice-runtime|getFourthWallVoiceModule/);
    assert.match(tavernHostSource, /handleInlineImageGenerate/);
    assert.match(ttsSource, /playTransient: playTransientVoice/);
    assert.doesNotMatch(ttsSource, /stopTransient: stopTransientVoice/);
    assert.match(ttsPlaybackSource, /export function playTransientVoice/);
    assert.match(ttsPlaybackSource, /notify\?\.\('stopped'\)/);
    assert.doesNotMatch(ebookSource, /fourth-wall/);
    assert.match(ebookSource, /window\.xiaobaixTts\.playTransient/);
    assert.doesNotMatch(fourthWallSource, /\.stopTransient/);
    assert.doesNotMatch(fourthWallEnhancerSource, /\.stopTransient/);
    assert.match(fourthWallSource, /currentVoiceHandle\?\.stop\?\.\(\)/);
    assert.match(fourthWallEnhancerSource, /activeVoiceHandle\?\.stop\?\.\(\)/);
    assert.match(fourthWallSource, /if \(state === 'ended' \|\| state === 'stopped' \|\| state === 'error'\) \{[\s\S]*currentVoiceRequestId = null;/);
    const stopVoiceSource = fourthWallSource.match(/function handleStopVoice\(\)[\s\S]*?\n\}/)?.[0] || '';
    assert.ok(stopVoiceSource);
    assert.doesNotMatch(stopVoiceSource, /postToFrame/);
    assert.match(tavernHostSource, /function cancelTavernMediaRequests\(\): void \{[\s\S]*pendingDrawRequests\.forEach[\s\S]*pendingInlineImageRequests\.forEach[\s\S]*pendingVoiceRequests\.keys/);
    assert.match(tavernHostSource, /function closeTavern\(\): void \{\s*cancelTavernMediaRequests\(\);/);
    assert.doesNotMatch(communicationSource, /\[voice:|\[img:/);
    assert.doesNotMatch(phoneResponseSource, /indexOf\('\{'\)|lastIndexOf\('\}'\)|replace\(\/\^```/);
    assert.doesNotMatch(phonePromptSource, /12000|slice\(0, 12000\)/);
    assert.doesNotMatch(phoneContextSource, /contactProfile:\s*normalize|normalizeText\(input\.contactProfile/);
    assert.doesNotMatch(phoneControllerSource, /normalizeText\(contactMemory\?\.content/);
    assert.doesNotMatch(phoneContextSource, /buildNativeChatPrompt|refreshRuntimeChatPresetFromHost/);
    assert.doesNotMatch(phoneContextSource, /new Date|Date\.now|formatTimestamp|sent_at=/);
    assert.match(communicationSource, /anchorOrder/);
    assert.match(runOnceSource, /listTavernCommunicationTimelineEvents/);
    assert.doesNotMatch(runOnceSource, /buildTavernCommunicationPromptDigest/);
    assert.match(managerSource, /buildTavernCommunicationEvidenceAtAnchor/);
    assert.doesNotMatch(phoneShellSource, /new Date|setInterval|clockLabel/);
    assert.doesNotMatch(phoneConversationSource, /timeLabel|tavern-phone-conversation-date|今天/);
    assert.doesNotMatch(phoneContactListSource, /timeLabel|new Date/);
    assert.match(phoneContactListSource, /type="search"/);
    assert.match(phoneContactListSource, /搜索联系人和消息/);
    assert.match(phoneContactListSource, /thread\?\.replyRequest\?\.status === 'failed'/);
    assert.match(phoneContactListSource, /回复失败 · 轻触进入对话重试/);
});


test('tavern phone app definitions reject invalid registries and preserve deterministic order', () => {
    const component = { render: (): null => null } as Component;
    const apps = defineTavernPhoneApps([
        {
            id: 'map',
            name: '地图',
            shortName: '地图',
            iconComponent: component,
            accent: '#3f7f68',
            rootPath: '/atlas',
            order: 20,
            component,
        },
        {
            id: 'messages',
            name: '信息',
            shortName: '信息',
            iconComponent: component,
            accent: '#4b78ff',
            rootPath: '/threads',
            order: 10,
            component,
        },
    ]);

    assert.deepEqual(apps.map((app) => app.id), ['messages', 'map']);
    assert.equal(Object.isFrozen(apps), true);
    assert.throws(() => defineTavernPhoneApps([
        { ...apps[0], order: 10 },
        { ...apps[0], order: 20 },
    ]), /duplicate_phone_app_definition:messages/);
    assert.throws(() => defineTavernPhoneApps([
        { ...apps[0], id: 'broken', rootPath: 'threads' },
    ]), /invalid_phone_app_definition/);
});

test('tavern data rollback helpers keep paired state writes inside transactions', () => {
    const acceptedStateSource = readRepoFile('modules/tavern/shared/accepted-state.ts');
    const managerSource = readRepoFile('modules/tavern/app-src/runtime/manager.ts');
    const runOnceSource = readRepoFile('modules/tavern/app-src/runtime/run-once.ts');
    const sessionDbSource = readRepoFile('modules/tavern/shared/session-db.ts');
    const memorySource = readRepoFile('modules/tavern/shared/memory-files.ts');
    const memoryRetrievalSource = readRepoFile('modules/tavern/shared/memory-retrieval.ts');

    assert.match(acceptedStateSource, /db\.transaction\(\s*'rw'[\s\S]*async \(\) => \{\s*const floor = await resolveTavernAcceptedSnapshotFloor\(id, floorInput\);[\s\S]*saveTavernMemorySnapshot\(id, floor\)[\s\S]*saveTavernStatusSnapshot\(id, floor\)/);
    assert.match(memoryRetrievalSource, /export function cleanSourceTextForManager[\s\S]*tavern-image\|img\|图片[\s\S]*\\s\*:/);
    const managerCleanBody = memoryRetrievalSource.slice(
        memoryRetrievalSource.indexOf('export function cleanSourceTextForManager'),
        memoryRetrievalSource.indexOf('function memoryFileTitle'),
    );
    assert.doesNotMatch(managerCleanBody, /applyMemoryTextFilterRules|<state>|<status|tts/);
    assert.match(managerSource, /async function resolveCurrentManagerSourceMessages/);
    assert.match(managerSource, /const currentSourceMessages = await resolveCurrentManagerSourceMessages\(input\)/);
    assert.doesNotMatch(managerSource, /cleanSourceTextForManager\((?:userMessage|assistantMessage)\.content\) === cleanSourceTextForManager\(input\.(?:userMessage|assistantMessage)\.content\)/);
    assert.doesNotMatch(managerSource, /\.(?:content)\s*===\s*input\.(?:userMessage|assistantMessage)\.content/);
    assert.match(managerSource, /userMessage\?\.role === 'user'[\s\S]*userMessage\.error !== true/);
    assert.match(managerSource, /assistantMessage\?\.role === 'assistant'[\s\S]*assistantMessage\.error !== true[\s\S]*finishReason/);
    assert.doesNotMatch(managerSource, /function hasFailedTool|manager_memory_tool_failed/);
    assert.match(memorySource, /db\.transaction\(\s*'rw'[\s\S]*ensureTavernManagerMemorySnapshot\(\{ managerRunId: options\.managerRunId, sessionId: id, path \}\)[\s\S]*writeTavernMemoryFile\(id, path/);
    assert.match(memorySource, /updateTavernManagerMemorySnapshotAfter\(\{ managerRunId: options\.managerRunId, sessionId: id, path/);
    assert.match(runOnceSource, /prepareTavernLatestAssistantReroll\(baseSession\.id\)/);
    assert.match(runOnceSource, /commitTavernAssistantResponseWithPetForLatestUser\(/);
    assert.match(runOnceSource, /commitTavernLatestAssistantReroll\(/);
    assert.doesNotMatch(runOnceSource, /rollbackTavernManagerRun|restoreTavernMemorySnapshot|restoreTavernCommunicationSnapshot|restoreTavernStatusSnapshot|deleteAcceptedStateSnapshots/);
    assert.match(sessionDbSource, /export async function truncateTavernMessagesAndReplaceSessionState\([\s\S]*db\.transaction\('rw', tavernMessagesTable, tavernSessionsTable,[\s\S]*tavernMessagesTable\.bulkDelete\(messageKeys\)[\s\S]*tavernSessionsTable\.update\(id,/);
    const prepareRerollSource = sessionDbSource.slice(
        sessionDbSource.indexOf('export async function prepareTavernLatestAssistantReroll'),
        sessionDbSource.indexOf('export interface TavernAssistantResponseCommitOptions'),
    );
    const commitRerollSource = sessionDbSource.slice(
        sessionDbSource.indexOf('export async function commitTavernLatestAssistantReroll'),
        sessionDbSource.indexOf('export async function putTavernManagerCandidate'),
    );
    assert.match(prepareRerollSource, /db\.transaction\(\s*'r',[\s\S]*runtimeState: restoredState/);
    assert.doesNotMatch(prepareRerollSource, /\.delete\(|\.put\(|\.update\(/);
    assert.match(commitRerollSource, /db\.transaction\(\s*'rw',[\s\S]*isSameTavernMessageIdentity\(currentUser, expectedUser\)[\s\S]*isSameTavernMessageIdentity\(currentAssistant, expectedAssistant\)[\s\S]*tavernMessagesTable\.put\(assistantMessage\)[\s\S]*tavernManagerCandidatesTable\.(?:put|delete)[\s\S]*tavernSessionsTable\.update\([\s\S]*buildTavernAssistantSessionUpdate/);
    assert.match(sessionDbSource, /messageId: createId\('message'\)/);
    assert.match(sessionDbSource, /export interface TavernMessageRecord \{\s*messageId: string;/);
    assert.doesNotMatch(sessionDbSource, /export interface TavernMessageRecord \{\s*messageId\?: string;/);
    assert.match(sessionDbSource, /current\.messageId === expected\.messageId[\s\S]*Number\(current\.createdAt\) === Number\(expected\.createdAt\)/);
    assert.match(sessionDbSource, /this\.version\(16\)[\s\S]*messagesTable\.bulkPut\(messages\)[\s\S]*run\.sourceUserMessageId = userMessageId[\s\S]*run\.sourceAssistantMessageId = assistantMessageId[\s\S]*managerRunsTable\.bulkPut\(managerRuns\)/);
    assert.match(sessionDbSource, /appendTavernUserMessageAndConfirmManagerCandidate[\s\S]*sourceUserMessageId: sourceUser\.messageId[\s\S]*sourceAssistantMessageId: sourceAssistant\.messageId/);
    assert.match(managerSource, /assertTavernManagerRunSourceMessages\(expected, messages\)/);
    assert.match(managerSource, /const sourceIdentity = resolveExpectedManagerSourceIdentity\(input\)[\s\S]*createTavernManagerRun\(\{[\s\S]*\.\.\.sourceIdentity/);
    assert.match(acceptedStateSource, /db\.transaction\(\s*'rw',[\s\S]*tavernManagerRunsTable,[\s\S]*tavernMessagesTable,[\s\S]*assertTavernManagerRunSourceMessages\(run,/);
    assert.match(sessionDbSource, /managerRuns: 'id, sessionId, status, turn, assistantOrder, \[sessionId\+assistantOrder\], updatedAt'/);
    assert.match(sessionDbSource, /where\('\[sessionId\+assistantOrder\]'\)[\s\S]*\.count\(\) > 0/);
    assert.doesNotMatch(prepareRerollSource, /\.toArray\(\)/);
});

test('tavern UI context is grouped by page responsibility instead of one flat bag', () => {
    const contextSource = readRepoFile('modules/tavern/app-src/components/tavern-app-context.ts');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const chatPageSource = readRepoFile('modules/tavern/app-src/components/chat/TavernChatPage.vue');
    const characterPanelSource = readRepoFile('modules/tavern/app-src/components/TavernCharacterWorkspacePanel.vue');
    const conversationPanelSource = readRepoFile('modules/tavern/app-src/components/chat/TavernConversationPanel.vue');
    const managerPanelSource = readRepoFile('modules/tavern/app-src/components/chat/TavernManagerPanel.vue');
    const workspacePanelSource = readRepoFile('modules/tavern/app-src/components/chat/TavernWorkspacePanel.vue');
    const settingsPageSource = readRepoFile('modules/tavern/app-src/components/settings/TavernSettingsPage.vue');
    const settingsControllerSource = readRepoFile('modules/tavern/app-src/components/settings/useTavernSettingsController.ts');
    const characterContextType = extractSourceBetween(contextSource, 'export interface TavernCharacterContext', 'export interface TavernSessionContext');
    const sessionContextType = extractSourceBetween(contextSource, 'export interface TavernSessionContext', 'export interface TavernRegexScriptDraft');
    const chatContextType = extractSourceBetween(contextSource, 'export interface TavernChatContext', 'export interface TavernManagerContext');
    const workspaceContextType = extractSourceBetween(contextSource, 'export interface TavernWorkspaceContext', 'export interface TavernSettingsContext');
    const characterContextObject = extractSourceBetween(appSource, 'const characterContext = {', 'const chatContext = {');
    const sessionContextObject = extractSourceBetween(appSource, 'const sessionContext = {', 'const characterContext = {');
    const chatContextObject = extractSourceBetween(appSource, 'const chatContext = {', 'const managerContext = {');
    const workspaceContextObject = extractSourceBetween(appSource, 'const workspaceContext = {', 'const appUiContext = {');

    assert.doesNotMatch(contextSource, /TavernContextBucket/);
    assert.doesNotMatch(contextSource, /Record<string,\s*any>/);
    assert.doesNotMatch(contextSource, /\[key:\s*string\]:\s*any/);
    for (const bucket of ['Shell', 'Character', 'Session', 'Chat', 'Manager', 'Memory', 'Workspace', 'Settings']) {
        assert.match(contextSource, new RegExp(`interface Tavern${bucket}Context`));
    }
    for (const bucket of ['shell', 'character', 'session', 'chat', 'manager', 'memory', 'workspace']) {
        assert.match(contextSource, new RegExp(`${bucket}: Tavern${bucket[0].toUpperCase()}${bucket.slice(1)}Context`));
        assert.match(appSource, new RegExp(`const ${bucket}Context = \\{`));
        assert.match(appSource, new RegExp(`${bucket}: ${bucket}Context`));
    }
    assert.match(contextSource, /export function useTavernSessionContext\(\): TavernSessionContext/);
    assert.match(appSource, /const appUiContext = \{[\s\S]*session: sessionContext[\s\S]*\} satisfies/);
    assert.match(appSource, /provide\(TAVERN_APP_UI_CONTEXT, appUiContext\);/);
    assert.doesNotMatch(appSource, /provide\(TAVERN_APP_UI_CONTEXT, \{/);
    assert.match(contextSource, /settings: TavernSettingsContext/);
    assert.match(appSource, /useTavernSettingsController/);
    assert.match(appSource, /settings: settingsContext/);
    assert.match(contextSource, /jumpChatToBottom: TavernCommand/);
    assert.match(chatContextObject, /\bjumpChatToBottom\b/);
    assert.doesNotMatch(chatContextType, /scrollChatToBottom/);
    assert.doesNotMatch(chatContextObject, /scrollChatToBottom/);
    assert.match(settingsControllerSource, /settingsContext = \{/);
    assert.doesNotMatch(`${chatPageSource}\n${characterPanelSource}\n${conversationPanelSource}\n${managerPanelSource}\n${workspacePanelSource}\n${settingsPageSource}`, /useTavernAppUiContext\(/);
    assert.match(conversationPanelSource, /useTavernChatContext/);
    assert.match(`${chatPageSource}\n${characterPanelSource}\n${conversationPanelSource}\n${workspacePanelSource}`, /useTavernSessionContext/);
    assert.match(managerPanelSource, /useTavernManagerContext/);
    assert.match(workspacePanelSource, /useTavernWorkspaceContext/);
    assert.doesNotMatch(workspacePanelSource, /useTavernChatContext/);
    assert.match(settingsPageSource, /useTavernSettingsContext/);

    const chatSessionFields = [
        'createNewChatSession',
        'currentChatCharacterSessions',
        'chatMessages',
        'chatMessageWindow',
        'removeSession',
        'selectedSessionId',
        'selectSession',
        'sessionDisplayTitle',
        'sessionFloorLabel',
        'sessions',
        'visibleChatMessages',
    ];
    for (const field of chatSessionFields) {
        assert.match(sessionContextType, new RegExp(`\\b${field}\\b`));
        assert.match(sessionContextObject, new RegExp(`\\b${field}\\b`));
        assert.doesNotMatch(chatContextType, new RegExp(`\\b${field}\\b`));
        assert.doesNotMatch(chatContextObject, new RegExp(`\\b${field}\\b`));
    }

    for (const field of ['openSession', 'removeSession', 'selectedCharacterSessions', 'sessionFloorLabel']) {
        assert.doesNotMatch(characterContextType, new RegExp(`\\b${field}\\b`));
        assert.doesNotMatch(characterContextObject, new RegExp(`\\b${field}\\b`));
    }
    for (const field of ['removeSession', 'selectedCharacterSessions', 'sessionFloorLabel']) {
        assert.match(sessionContextType, new RegExp(`\\b${field}\\b`));
        assert.match(sessionContextObject, new RegExp(`\\b${field}\\b`));
    }

    for (const field of ['currentAssistantFloor', 'selectedSessionId']) {
        assert.match(sessionContextType, new RegExp(`\\b${field}\\b`));
        assert.match(sessionContextObject, new RegExp(`\\b${field}\\b`));
        assert.doesNotMatch(workspaceContextType, new RegExp(`\\b${field}\\b`));
        assert.doesNotMatch(workspaceContextObject, new RegExp(`\\b${field}\\b`));
    }
});

test('tavern character cards are available as a settings workspace', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const settingsPageSource = readRepoFile('modules/tavern/app-src/components/settings/TavernSettingsPage.vue');
    const settingsControllerSource = readRepoFile('modules/tavern/app-src/components/settings/useTavernSettingsController.ts');
    const characterPanelSource = readRepoFile('modules/tavern/app-src/components/TavernCharacterWorkspacePanel.vue');

    assert.equal(existsSync(resolve(root, 'modules/tavern/app-src/components/TavernCharacterSelectPage.vue')), false);
    assert.match(settingsControllerSource, /export type TavernSettingsWorkspaceKey = 'characters' \| 'api'/);
    assert.match(settingsControllerSource, /key: 'characters'[\s\S]*label: '角色卡'[\s\S]*mobileLabel: '角色卡'/);
    assert.match(settingsControllerSource, /key: 'worldbooks'[\s\S]*label: '世界书'[\s\S]*mobileLabel: '世界书'[\s\S]*key: 'assistantPreset'[\s\S]*label: '助手预设'[\s\S]*mobileLabel: '助手预设'[\s\S]*key: 'base'[\s\S]*label: '基础设定'[\s\S]*mobileLabel: '基础设定'/);
    assert.match(settingsControllerSource, /key === 'characters'/);
    assert.match(settingsControllerSource, /normalized === 'characters'/);
    assert.match(settingsPageSource, /<TavernCharacterWorkspacePanel[\s\S]*activeSettingsWorkspace === 'characters'/);
    assert.match(appSource, /function openCharacterSelect\(\)[\s\S]*openSettingsWorkspace\('characters'\)/);
    assert.match(appSource, /view === 'settings'[\s\S]*workspace === 'characters'[\s\S]*refreshCharacterList\(\)/);
    assert.doesNotMatch(appSource, /TavernCharacterSelectPage|activeView === 'characters'|activeView\.value = 'characters'|view === 'characters'/);
    assert.doesNotMatch(appSource, /document\.querySelectorAll<HTMLElement>\('\[data-character-card-id\]'\)/);
    assert.match(characterPanelSource, /const listRef = ref<HTMLElement \| null>\(null\)/);
    assert.match(characterPanelSource, /root\.querySelectorAll<HTMLElement>\('\[data-character-card-id\]'\)/);
    assert.match(characterPanelSource, /syncWorldbookState\(targetKey\)/);
    assert.doesNotMatch(characterPanelSource, /defineExpose/);
    assert.doesNotMatch(characterPanelSource, /TavernCornerActions|@toggle-theme|@back=/);
});

test('tavern settings controller owns settings page state and host sync', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const settingsControllerSource = readRepoFile('modules/tavern/app-src/components/settings/useTavernSettingsController.ts');
    const baseCss = readRepoFile('modules/tavern/app-src/styles/settings/base.css');

    assert.match(settingsControllerSource, /export function useTavernSettingsController/);
    for (const forbidden of [
        'function saveCurrentPreset',
        'function selectChatPresetFromHost',
        'function syncWorldbooksFromHost',
        'function refreshRegexFromHost',
        'function saveCurrentAssistantPreset',
        'function renderApiSettingsPanel',
    ]) {
        assert.doesNotMatch(appSource, new RegExp(forbidden));
        assert.match(settingsControllerSource, new RegExp(forbidden));
    }
    assert.match(appSource, /applyHostChatPreset\(payload\)/);
    assert.doesNotMatch(appSource, /chatPresetList\.value/);
    assert.doesNotMatch(appSource, /apiSettingsPanelState/);
    assert.match(baseCss, /\.base-settings-section \{[\s\S]*border-bottom: 2px solid var\(--xb-line-strong\);/);
    assert.match(baseCss, /\.base-setting-row input \{[\s\S]*text-align: center;/);
});

test('tavern settings pages let main workspace content fill the page width', () => {
    const layoutCss = readRepoFile('modules/tavern/app-src/styles/settings/layout.css');

    assert.match(layoutCss, /\.settings-layout \.xb-main \{[\s\S]*padding: 0;/);
});

test('tavern-only settings normalization stays out of agent core', () => {
    const agentCoreConfigSource = readRepoFile('modules/agent-core/config.js');
    const tavernSettingsSource = readRepoFile('modules/tavern/shared/settings.ts');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const settingsControllerSource = readRepoFile('modules/tavern/app-src/components/settings/useTavernSettingsController.ts');
    const hostAgentConfigSource = readRepoFile('modules/tavern/host/agent-config.ts');
    const hostDisplaySettingsSource = readRepoFile('modules/tavern/host/display-settings.ts');

    assert.doesNotMatch(agentCoreConfigSource, /normalizeTavernDisplaySettings|normalizeTavernUserSettings|normalizeTavernSettings/);
    assert.match(tavernSettingsSource, /export function normalizeTavernDisplaySettings/);
    assert.doesNotMatch(tavernSettingsSource, /normalizeTavernAgentConfig|normalizeTavernAgentSettings|mergeTavernSettings/);
    assert.match(appSource, /from '\.\.\/shared\/settings'/);
    assert.match(settingsControllerSource, /from '\.\.\/\.\.\/\.\.\/shared\/settings'/);
    assert.doesNotMatch(hostAgentConfigSource, /from '\.\.\/shared\/settings\.js'/);
    assert.match(hostDisplaySettingsSource, /tavern-display-settings/);
});

test('tavern base settings panel exposes a three-segment chat font size control that saves via display settings', () => {
    const panelSource = readRepoFile('modules/tavern/app-src/components/settings/TavernBaseSettingsPanel.vue');
    const settingsSource = readRepoFile('modules/tavern/shared/settings.ts');

    assert.match(settingsSource, /export type TavernChatFontSize = 'small' \| 'medium' \| 'large';/);
    assert.match(settingsSource, /export const TAVERN_CHAT_FONT_SIZES/);
    assert.match(settingsSource, /value === 'small' \|\| value === 'medium' \|\| value === 'large' \? value : 'large'/);

    assert.match(panelSource, /<h3>字体<\/h3>/);
    assert.match(panelSource, /class="xb-workspace-controller chat-font-size-controller"/);
    assert.match(panelSource, /v-for="size in TAVERN_CHAT_FONT_SIZES"/);
    assert.match(panelSource, /:class="\{ 'is-active': displaySettings\.chatFontSize === size \}"/);
    assert.match(panelSource, /selectChatFontSize\(size\)/);

    for (const label of ['小', '中', '大']) {
        assert.ok(panelSource.includes(`'${label}'`), `panel must render chat font size label ${label}`);
    }

    assert.match(panelSource, /updateDisplaySettingsPatch\(\{ chatFontSize: size \}\)/);
    assert.doesNotMatch(panelSource, /saveCurrentPreset|requestHost\(|postToHost\(/);
});

test('tavern user host bridge stays separate from context assembly', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const hostBridgeSource = readRepoFile('modules/tavern/app-src/features/host-bridge/useTavernHostBridge.ts');
    const contextSource = readRepoFile('modules/tavern/host/sillytavern-context.ts');
    const usersSource = readRepoFile('modules/tavern/host/users.ts');
    const tavernSource = readRepoFile('modules/tavern/tavern.ts');

    assert.match(appSource, /const hostBridge = useTavernHostBridge\(\{/);
    assert.doesNotMatch(appSource, /const pendingHostRequests|function requestHost|function postToHost|function resolveHostRequest/);
    assert.match(hostBridgeSource, /const pendingHostRequests = new Map<string, PendingHostRequest>\(\);/);
    assert.match(hostBridgeSource, /function requestHost\(type: string, payload: Record<string, unknown> = \{\}, requestOptions: \{ signal\?: AbortSignal; requestId\?: string \} = \{\}\)/);
    assert.match(hostBridgeSource, /function onHostMessage\(event: MessageEvent\) \{[\s\S]*if \(event\.origin !== window\.location\.origin\) \{return;\}[\s\S]*if \(data\.source !== SOURCE_HOST\) \{return;\}/);
    assert.match(hostBridgeSource, /if \(data\.type === 'xb-tavern:host-result'\) \{[\s\S]*resolveHostRequest\(data\.payload \|\| \{\}\);[\s\S]*return;/);
    assert.match(hostBridgeSource, /for \(const handler of messageHandlers\) \{[\s\S]*if \(handler\(data\)\) \{return;\}/);
    assert.match(hostBridgeSource, /function mount\(\) \{[\s\S]*window\.addEventListener\('message', onHostMessage\);[\s\S]*function dispose\(error: Error = new Error\('tavern_host_bridge_disposed'\)\) \{[\s\S]*window\.removeEventListener\('message', onHostMessage\);[\s\S]*pendingHostRequests\.forEach/);
    assert.match(appSource, /onMounted\(async \(\) => \{[\s\S]*hostBridge\.mount\(\);[\s\S]*hostBridge\.postToHost\('xb-tavern:frame-ready'\);[\s\S]*onUnmounted\(\(\) => \{[\s\S]*hostBridge\.dispose\(new Error\('tavern_unmounted'\)\);/);
    assert.match(appSource, /hostBridge\.addMessageHandler\(\(data\) => drawContext\.handleHostMessage\(data\)\);[\s\S]*hostBridge\.addMessageHandler\(handleInlineImageProgressHostMessage\);[\s\S]*hostBridge\.addMessageHandler\(handleConfigHostMessage\);/);
    assert.doesNotMatch(hostBridgeSource, /applyHostPayload|handleApiConfigSaved|TAVERN_INLINE_IMAGE_PROGRESS_EVENT|drawContext/);
    assert.doesNotMatch(contextSource, /getUserAvatars|setUserAvatar|listTavernUsers|switchTavernUser/);
    assert.match(usersSource, /getUserAvatars/);
    assert.match(usersSource, /setUserAvatar/);
    assert.match(usersSource, /typeof rawDescription === 'string'/);
    assert.match(usersSource, /export async function listTavernUsers/);
    assert.match(usersSource, /export async function switchTavernUser/);
    assert.match(contextSource, /import \{ user_avatar \} from/);
    assert.match(contextSource, /function readPersonaDescription/);
    assert.match(contextSource, /const personaId = normalizeText\(user_avatar\);/);
    assert.match(contextSource, /persona: readPersonaDescription\(personaId\) \|\| normalizeText\(ctx\.userPersona \|\| ctx\.persona\)/);
    assert.match(tavernSource, /from '\.\/host\/users\.js'/);
});

test('tavern manager display projection stays out of the app controller', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const managerDisplaySource = readRepoFile('modules/tavern/app-src/components/chat/useTavernManagerDisplay.ts');

    assert.match(appSource, /useTavernManagerDisplay/);
    for (const helper of [
        'formatRunActivityLine',
        'formatRunIssueLine',
        'formatRunInputLine',
        'formatRunMapLine',
        'formatRunMemoryLine',
        'formatRunModelLine',
        'managerRunTone',
        'managerToolTraceItems',
        'toolTraceSummary',
    ]) {
        assert.doesNotMatch(appSource, new RegExp(`function ${helper}`));
        assert.match(managerDisplaySource, new RegExp(`function ${helper}`));
    }
    assert.doesNotMatch(managerDisplaySource, /thoughtBlocks/);
    assert.doesNotMatch(managerDisplaySource, /managerStatusLine/);
});

test('tavern accepted-turn manager uses an unconfirmed candidate and a persistent ordered queue', () => {
    const chatRunSource = readRepoFile('modules/tavern/app-src/features/chat-run/useTavernChatRunController.ts');
    const sessionSource = readRepoFile('modules/tavern/app-src/features/session/useTavernSessionController.ts');
    const runOnceSource = readRepoFile('modules/tavern/app-src/runtime/run-once.ts');
    const managerSource = readRepoFile('modules/tavern/app-src/runtime/manager.ts');
    const sessionDbSource = readRepoFile('modules/tavern/shared/session-db.ts');
    const displaySource = readRepoFile('modules/tavern/app-src/components/chat/useTavernManagerDisplay.ts');
    const panelSource = readRepoFile('modules/tavern/app-src/components/chat/TavernManagerPanel.vue');
    const schedulerStart = runOnceSource.indexOf('function scheduleQueuedAcceptedTurnManager');
    const runTurnStart = runOnceSource.indexOf('export async function runXbTavernTurn');
    const schedulerSource = runOnceSource.slice(schedulerStart, runTurnStart);
    const runTurnSource = runOnceSource.slice(runTurnStart);
    const productionRunTurnCall = chatRunSource.match(/const result = await runXbTavernTurn\(\{[\s\S]*?runManager: true,[\s\S]*?onManagerRunSaved:[\s\S]*?\n[ ]{12}\}\);/);
    const removeSessionBody = sessionSource.match(/async function removeSession\(sessionId: string\) \{[\s\S]*?const removed = await deleteTavernSession\(id\);/);

    assert.match(runOnceSource, /commitTavernAssistantResponseWithPetForLatestUser/);
    assert.match(runOnceSource, /runNextQueuedAcceptedTurnManager/);
    assert.match(runOnceSource, /const queuedAcceptedTurnManagerWorkers = new Map<string, Promise<void>>\(\);/);
    assert.match(runOnceSource, /function scheduleQueuedAcceptedTurnManager/);
    assert.doesNotMatch(runOnceSource, /markPendingAcceptedTurnManagersFailed/);
    assert.doesNotMatch(runOnceSource, /listPendingAcceptedTurnManagerRuns/);
    assert.doesNotMatch(schedulerSource, /status: 'failed'/);
    assert.match(schedulerSource, /for \(;;\)[\s\S]*runNextQueuedAcceptedTurnManager\(\{/);
    assert.doesNotMatch(schedulerSource, /signal: input\.signal/);
    assert.doesNotMatch(runOnceSource, /scheduleXbTavernManagerAfterTurn/);
    assert.doesNotMatch(runTurnSource, /await runNextQueuedAcceptedTurnManager/);
    assert.match(runTurnSource, /appendTavernUserMessageAndConfirmManagerCandidate\([\s\S]*confirmManagerCandidate:[\s\S]*scheduleQueuedAcceptedTurnManager\(\{/);
    assert.match(schedulerSource, /completeAcceptedTurnManagerRunWithSnapshot\(\{[\s\S]*managerRunId: result\.managerRun\.id[\s\S]*leaseOwnerId:/);
    assert.match(schedulerSource, /recoverInterruptedAcceptedTurnManagerRuns/);
    assert.match(schedulerSource, /getAcceptedTurnManagerQueueState/);
    assert.doesNotMatch(schedulerSource, /targetManagerRunId/);
    assert.ok(productionRunTurnCall);
    assert.doesNotMatch(productionRunTurnCall[0], /executeManagerOnce/);
    assert.ok(removeSessionBody);
    assert.match(removeSessionBody[0], /await options\.cancelAndRollbackManagersForSession\(id\);[\s\S]*const removed = await deleteTavernSession\(id\);/);
    assert.doesNotMatch(removeSessionBody[0], /waitForQueuedAcceptedTurnManagers/);
    assert.match(runOnceSource, /await saveAcceptedStateSnapshot\(baseSession\.id\);/);
    assert.match(runTurnSource, /const commitOptions = \{[\s\S]*managerCandidate: \{[\s\S]*turn: nextTurn[\s\S]*commitTavernLatestAssistantReroll\([\s\S]*commitTavernAssistantResponseWithPetForLatestUser\(/);
    assert.match(managerSource, /const TAVERN_MANAGER_TIMEOUT_MS = 5 \* 60 \* 1000;/);
    assert.doesNotMatch(managerSource, /15 \* 60 \* 1000/);
    assert.match(managerSource, /await input\.onManagerRunSaved\?\.\(managerRun\);\s*try \{/);
    assert.match(managerSource, /async function rebuildTavernMemoryDerivedIndexForLiveSession\(sessionId = ''\): Promise<void> \{[\s\S]*getTavernSession\(id\)[\s\S]*rebuildTavernMemoryDerivedIndex\(id\);[\s\S]*\}/);
    assert.doesNotMatch(managerSource, /await rebuildTavernMemoryDerivedIndex\((?!id\))/);
    assert.match(managerSource, /const ACCEPTED_TURN_MANAGER_TRIGGER = 'accepted_turn';/);
    assert.doesNotMatch(managerSource, /scheduleXbTavernManagerAfterTurn|managerQueues|settleTavernManagersForSession/);
    assert.doesNotMatch(managerSource, /putTavernManagerCandidate/);
    assert.match(sessionDbSource, /export async function commitTavernAssistantResponseForLatestUser\([\s\S]*db\.transaction\([\s\S]*tavernMessagesTable,[\s\S]*tavernSessionsTable,[\s\S]*tavernManagerCandidatesTable,[\s\S]*tavernMessagesTable\.put\(assistantMessage\)[\s\S]*tavernManagerCandidatesTable\.put\(managerCandidate\)[\s\S]*tavernSessionsTable\.update\(id,/);
    assert.match(managerSource, /claimNextQueuedAcceptedTurnManagerRun/);
    assert.match(managerSource, /TAVERN_MANAGER_LEASE_DURATION_MS = 30000/);
    assert.match(managerSource, /assertRunningTavernManagerRunLease/);
    assert.doesNotMatch(managerSource, /getLatestTavernAssistantOrder|manager_timeline_advanced/);
    assert.match(sessionDbSource, /export async function rollbackManagerRunWrites\(/);
    assert.doesNotMatch(sessionDbSource, /clearTavernManagerRunSnapshots|rollbackManagerRunMemoryWrites|rollbackManagerRunStateWrites|rollbackManagerStateRunsForMessageRange/);
    assert.match(sessionDbSource, /managerCandidates: 'sessionId, assistantOrder, updatedAt'/);
    assert.match(sessionDbSource, /leaseOwnerId/);
    assert.match(sessionDbSource, /leaseExpiresAt/);
    assert.match(sessionDbSource, /appendTavernUserMessageAndConfirmManagerCandidate/);
    assert.match(sessionDbSource, /confirmedByUserOrder: order/);
    assert.match(displaySource, /queued: '排队中'/);
    assert.match(panelSource, /'已接受回合维护'/);
});

test('tavern markdown enhancement lives outside the app controller', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const markdownToolsSource = readRepoFile('modules/tavern/app-src/components/chat/useTavernMarkdownTools.ts');
    const contextSource = readRepoFile('modules/tavern/app-src/components/tavern-app-context.ts');
    const conversationSource = readRepoFile('modules/tavern/app-src/components/chat/TavernConversationPanel.vue');
    const managerSource = readRepoFile('modules/tavern/app-src/components/chat/TavernManagerPanel.vue');
    const hostSource = readRepoFile('modules/tavern/host/sillytavern-context.ts');
    const tavernHostSource = readRepoFile('modules/tavern/tavern.ts');
    const indexSource = readRepoFile('index.js');
    const markdownSource = readRepoFile('modules/agent-core/ui/message-markdown.js');
    const drawMarkdownImagesSource = readRepoFile('modules/tavern/app-src/features/draw/draw-markdown-images.ts');
    const sdDrawSource = readRepoFile('modules/draw/providers/sd-webui/sd-draw.js');
    const novelDrawSource = readRepoFile('modules/draw/providers/novelai/novel-draw.js');
    const novelRequestConfigSource = readRepoFile('modules/draw/providers/novelai/novel-request-config.js');
    const comfyDrawSource = readRepoFile('modules/draw/providers/comfyui/comfy-draw.js');
    const fourthWallSource = readRepoFile('modules/fourth-wall/fourth-wall.js');
    const fourthWallImageProtocolSource = readRepoFile('modules/fourth-wall/fw-image-protocol.js');
    const fourthWallEnhancerSource = readRepoFile('modules/fourth-wall/fw-message-enhancer.js');
    const generatedImageRuntimeSource = readRepoFile('modules/draw/shared/generated-image-runtime.js');
    const generationFingerprintSource = readRepoFile('modules/draw/shared/generation-fingerprint.js');
    const serialImageQueueSource = readRepoFile('modules/draw/shared/serial-image-request-queue.js');
    const fourthWallViteConfigSource = readRepoFile('vite.fourth-wall.config.mjs');
    assert.match(appSource, /useTavernMarkdownTools/);
    assert.doesNotMatch(appSource, /function renderChatMarkdown/);
    assert.doesNotMatch(appSource, /function enhanceChatMarkdown/);
    assert.match(markdownToolsSource, /function renderChatMarkdown/);
    assert.match(markdownToolsSource, /function enhanceChatMarkdown/);
    assert.match(markdownToolsSource, /function enhanceChatMarkdown\(\) \{[\s\S]*preserveChatScroll\(\(\) => \{/);
    assert.match(markdownToolsSource, /function enhanceActionCheckMarkers/);
    assert.match(markdownToolsSource, /createTavernDrawMarkdownImageEnhancer/);
    assert.match(markdownToolsSource, /drawImageEnhancer\.enhanceTavernImageMarkers\(node\)/);
    assert.match(markdownToolsSource, /drawImageEnhancer\.closeTavernImageGallery\(\)/);
    assert.match(markdownToolsSource, /function enhanceInlineImageTokens/);
    assert.match(markdownToolsSource, /function loadInlineImageSlot/);
    assert.match(markdownToolsSource, /xb-tavern:inline-image-generate/);
    assert.match(markdownToolsSource, /export const TAVERN_INLINE_IMAGE_PROGRESS_EVENT = 'xb-tavern:inline-image-progress';/);
    assert.match(markdownToolsSource, /TAVERN_INLINE_IMAGE_TOKEN_REGEX/);
    assert.match(markdownToolsSource, /function canEnhanceMarkdownRoot/);
    assert.match(markdownToolsSource, /function canAutoLoadInlineImageSlot/);
    assert.match(markdownToolsSource, /closest\('\[hidden\], \[aria-hidden="true"\]'\)/);
    assert.doesNotMatch(markdownToolsSource, /function renderLoadedTavernImageFigure/);
    assert.doesNotMatch(markdownToolsSource, /function renderUnavailableTavernImageFigure/);
    assert.doesNotMatch(markdownToolsSource, /function buildTavernImageEditPanel/);
    assert.doesNotMatch(markdownToolsSource, /xb-tavern:draw-image-select/);
    assert.doesNotMatch(markdownToolsSource, /xb-tavern:draw-image-gallery/);
    assert.doesNotMatch(drawMarkdownImagesSource, /TAVERN_INLINE_IMAGE_TOKEN_REGEX/);
    assert.doesNotMatch(drawMarkdownImagesSource, /xb-tavern:inline-image-generate/);
    assert.doesNotMatch(drawMarkdownImagesSource, /xb-tavern-inline-image/);
    assert.match(drawMarkdownImagesSource, /export function createTavernDrawMarkdownImageEnhancer/);
    assert.match(drawMarkdownImagesSource, /function enhanceTavernImageMarkers/);
    assert.match(drawMarkdownImagesSource, /function renderLoadedTavernImageFigure/);
    assert.match(drawMarkdownImagesSource, /function renderUnavailableTavernImageFigure/);
    assert.match(drawMarkdownImagesSource, /function buildTavernImageEditPanel/);
    assert.match(drawMarkdownImagesSource, /xb-tavern:draw-image-select/);
    assert.match(drawMarkdownImagesSource, /xb-tavern:draw-image-gallery/);
    assert.match(drawMarkdownImagesSource, /xb-tavern:draw-image-save/);
    assert.match(drawMarkdownImagesSource, /xb-tavern:draw-image-delete/);
    assert.match(drawMarkdownImagesSource, /xb-tavern:draw-image-refresh/);
    assert.match(drawMarkdownImagesSource, /xb-tavern:draw-image-edit/);
    assert.match(drawMarkdownImagesSource, /function removeAdjacentImageLineBreaks/);
    assert.match(drawMarkdownImagesSource, /node instanceof HTMLBRElement/);
    assert.match(drawMarkdownImagesSource, /xb-tavern-image-failed-actions/);
    assert.match(drawMarkdownImagesSource, /xb-tavern-image-failed-icon/);
    assert.match(drawMarkdownImagesSource, /xb-tavern-image-failed-title/);
    assert.match(drawMarkdownImagesSource, /xb-tavern-image-failed-desc/);
    assert.match(drawMarkdownImagesSource, /retryButton\.textContent = '⟳ 重新生成';/);
    assert.match(drawMarkdownImagesSource, /editButton\.textContent = '✐ 编辑TAG';/);
    assert.doesNotMatch(drawMarkdownImagesSource, /🔄 重新生成|✏️ 编辑TAG/);
    // Failed-state "保存并重试" persists edited tags then regenerates, and falls back to the
    // edited result when the regeneration transport rejects.
    assert.match(drawMarkdownImagesSource, /retryAfterSave: true/);
    assert.match(drawMarkdownImagesSource, /panelOptions\.retryAfterSave/);
    assert.match(drawMarkdownImagesSource, /catch \{\s*await refreshTavernImageFigure\(figure, slotId, editResponse\);/);
    // While the failed-state editor is open the outer action buttons stay keyboard-disabled,
    // surviving a busy lock clearing after an error.
    assert.match(drawMarkdownImagesSource, /button\.dataset\.editDisabled/);
    assert.match(drawMarkdownImagesSource, /button\.disabled = busy[\s\S]*button\.dataset\.editDisabled === 'true'/);
    assert.match(drawMarkdownImagesSource, /payload: \{ slotId, imgId \}/);
    assert.match(drawMarkdownImagesSource, /textarea\[data-type="scene"\]/);
    assert.match(drawMarkdownImagesSource, /textarea\[data-type="char"\]/);
    assert.match(drawMarkdownImagesSource, /characterPrompts/);
    assert.match(drawMarkdownImagesSource, /xb-tavern-image-gallery-overlay/);
    assert.match(drawMarkdownImagesSource, /xb-tavern-image-nav/);
    assert.match(drawMarkdownImagesSource, /xb-tavern-image-menu/);
    assert.match(drawMarkdownImagesSource, /newerButton\.title = currentIndex === 0 \? '重新生成' : '下一版本';/);
    assert.match(drawMarkdownImagesSource, /newerButton\.disabled = false;/);
    assert.match(drawMarkdownImagesSource, /if \(currentIndex > 0\) \{[\s\S]*void selectIndex\(currentIndex - 1\);[\s\S]*return;[\s\S]*\}[\s\S]*void refreshImage\(\);/);
    assert.match(drawMarkdownImagesSource, /removeAdjacentImageLineBreaks\(figure\)/);
    assert.match(tavernHostSource, /case 'xb-tavern:draw-image-select':/);
    assert.match(tavernHostSource, /case 'xb-tavern:draw-image-gallery':/);
    assert.match(tavernHostSource, /case 'xb-tavern:draw-image-save':/);
    assert.match(tavernHostSource, /case 'xb-tavern:draw-image-delete':/);
    assert.match(tavernHostSource, /case 'xb-tavern:draw-image-refresh':/);
    assert.match(tavernHostSource, /case 'xb-tavern:draw-image-edit':/);
    assert.match(tavernHostSource, /case 'xb-tavern:inline-image-generate':/);
    assert.doesNotMatch(tavernHostSource, /fourth-wall\/fw-image|getFourthWallImageModule/);
    assert.match(tavernHostSource, /window\.xiaobaixDraw\?\.generateSharedImage/);
    assert.match(tavernHostSource, /tags,\s*status: state,\s*ahead,\s*delay:/);
    assert.match(tavernHostSource, /buildPromptData/);
    assert.match(tavernHostSource, /getDrawPromptNegativeInput/);
    assert.match(tavernHostSource, /syncDrawSavedFromPreview/);
    assert.match(tavernHostSource, /syncDrawSavedAfterDeletion/);
    assert.match(tavernHostSource, /clearDrawSavedEntry/);
    assert.match(tavernHostSource, /storeFailedPlaceholder/);
    // handleDrawImageRefresh must persist a new failed placeholder and return ok on regeneration
    // failure (not reject), so the iframe re-renders the failed state with the attempted tags.
    assert.match(tavernHostSource, /function buildRefreshFailedDrawPlaceholder/);
    assert.match(tavernHostSource, /storeFailedPlaceholder\(\s*buildRefreshFailedDrawPlaceholder/);
    assert.match(tavernHostSource, /deleteFailedRecordsForSlot\(slotId\)/);
    assert.match(drawMarkdownImagesSource, /showTavernImageRefreshError\(error\)/);
    assert.match(appSource, /showToast: showTavernToast/);
    assert.match(tavernHostSource, /clearSlotSelection/);
    assert.match(tavernHostSource, /function getDrawPreviewStorageMessageId/);
    assert.match(tavernHostSource, /function buildDeletedDrawPlaceholder/);
    assert.match(tavernHostSource, /TAVERN_DRAW_DELETED_ERROR_MESSAGE/);
    assert.match(tavernHostSource, /preview\.source \|\| ''\)\.trim\(\) === 'tavern'/);
    assert.match(tavernHostSource, /messageId: getDrawPreviewStorageMessageId\(preview, slotId\)/);
    assert.doesNotMatch(tavernHostSource, /messageId:\s*Number\(preview\.messageId\)\s*\|\|\s*0/);
    assert.doesNotMatch(tavernHostSource, /messageId:\s*Number\(preview\.messageId\)/);
    assert.match(tavernHostSource, /characterPrompts/);
    assert.match(tavernHostSource, /deletedCurrentImage && !nextImgId/);
    assert.match(tavernHostSource, /await storeFailedPlaceholder\(buildDeletedDrawPlaceholder\(slotId, deletedPreview \|\| \{\}, current\)\);/);
    assert.match(indexSource, /buildDrawPromptData/);
    assert.match(indexSource, /characterPrompts: promptData\.characterPrompts/);
    assert.match(generatedImageRuntimeSource, /const inflightRequests = new Map\(\);/);
    assert.match(generatedImageRuntimeSource, /function subscribe\(entry, signal, onProgress\)/);
    assert.match(generatedImageRuntimeSource, /entry\.consumers\.size === 0/);
    assert.match(generatedImageRuntimeSource, /descriptor\.facade\.generateImage/);
    assert.match(generatedImageRuntimeSource, /facade\.prepareGeneration/);
    assert.match(generatedImageRuntimeSource, /generationPlan\?\.fingerprint/);
    assert.match(generatedImageRuntimeSource, /generationPlan\.execute\(runtimeOptions\)/);
    assert.match(generatedImageRuntimeSource, /const rawAhead = Number\(data\.ahead\);/);
    assert.match(generatedImageRuntimeSource, /rawPosition - 1/);
    assert.match(generatedImageRuntimeSource, /generation: generationFingerprint/);
    assert.doesNotMatch(generatedImageRuntimeSource, /fingerprint: descriptor\.fingerprint/);
    assert.match(generationFingerprintSource, /export function stableSerialize/);
    assert.match(generationFingerprintSource, /export function hashStableValue/);
    assert.match(indexSource, /function prepareDrawGeneration/);
    assert.match(indexSource, /cloneDrawGenerationValue\(buildDrawPromptData\(payload\)\)/);
    assert.match(indexSource, /getGenerationSnapshot/);
    assert.match(indexSource, /generationConfig,/);
    assert.match(indexSource, /void clearExpiredGeneratedImageCacheRuntime\(\);/);
    const drawFacadeSource = indexSource.match(/window\.xiaobaixDraw = \{[\s\S]*?\n[ ]{4}\};/)?.[0] || '';
    assert.ok(drawFacadeSource);
    assert.doesNotMatch(drawFacadeSource, /clearSharedImageRequests|clearExpiredGeneratedImageCache/);
    assert.match(fourthWallImageProtocolSource, /export const IMG_GUIDELINE/);
    assert.match(fourthWallImageProtocolSource, /getDrawFacade\(\)\.generateSharedImage/);
    assert.match(fourthWallImageProtocolSource, /export function cancelFourthWallImageRequests\(\)/);
    assert.match(fourthWallImageProtocolSource, /signal: controller\.signal/);
    assert.match(fourthWallSource, /function hideOverlay\(\)[\s\S]*cancelFourthWallImageRequests\(\);/);
    assert.doesNotMatch(fourthWallImageProtocolSource, /clearExpired/);
    assert.doesNotMatch(fourthWallSource, /clearExpiredImageCache|clearExpiredGeneratedImageCache/);
    assert.match(fourthWallEnhancerSource, /window\.xiaobaixDraw\?\.generateSharedImage/);
    assert.doesNotMatch(fourthWallEnhancerSource, /fw-image\.js|fw-voice-runtime\.js/);
    assert.match(serialImageQueueSource, /export function createSerialImageRequestQueue/);
    assert.match(serialImageQueueSource, /const cooldown = started \? normalizeCooldown\(getCooldownMs\(\)\) : 0;/);
    assert.match(serialImageQueueSource, /if \(error\) item\.reject\(error\);[\s\S]*else item\.resolve\(result\);[\s\S]*await waitForCooldown\(cooldown\)/);
    assert.match(fourthWallViteConfigSource, /normalize-partial-json-whitespace-scan/);
    assert.match(fourthWallViteConfigSource, /\[32, 10, 13, 9\]\.includes\(jsonString\.charCodeAt\(index\)\)/);
    assert.match(novelDrawSource, /getCooldownMs: \(\) => getNovelImageRequestDelay\(\)/);
    assert.match(novelDrawSource, /getGenerationSnapshot/);
    assert.match(sdDrawSource, /getGenerationSnapshot/);
    assert.match(comfyDrawSource, /getGenerationSnapshot/);
    const novelSnapshotSource = extractFunctionSource(novelDrawSource, 'function getGenerationSnapshot');
    const sdSnapshotSource = extractFunctionSource(sdDrawSource, 'function getGenerationSnapshot');
    const comfySnapshotSource = extractFunctionSource(comfyDrawSource, 'function getGenerationSnapshot');
    const sdFingerprintSource = sdSnapshotSource.match(/fingerprint:\s*\{[\s\S]*?\n[ ]{8}\},\n[ ]{8}execution,/)?.[0] || '';
    const comfyFingerprintSource = comfySnapshotSource.match(/fingerprint:\s*\{[\s\S]*?\n[ ]{8}\},\n[ ]{8}execution,/)?.[0] || '';
    assert.doesNotMatch(novelSnapshotSource, /apiKey|requestDelay|timeout/);
    assert.ok(sdFingerprintSource);
    assert.ok(comfyFingerprintSource);
    assert.doesNotMatch(sdFingerprintSource, /auth|apiKey|token/);
    assert.doesNotMatch(comfyFingerprintSource, /auth|apiKey|token/);
    assert.match(sdFingerprintSource, /endpointHash: hashStableValue/);
    assert.match(comfyFingerprintSource, /workflowHash: hashStableValue/);
    assert.match(novelDrawSource, /snapshotNovelRequestConfig\(getSettings\(\), generationConfig/);
    assert.match(novelRequestConfigSource, /generationConfig\?\.overrideSize/);
    assert.match(sdDrawSource, /generationConfig\?\.prepared === true \? params/);
    assert.match(sdDrawSource, /fetchSdProxy\('generate', body, \{ signal, generationConfig \}\)/);
    assert.match(comfyDrawSource, /generationConfig\?\.prepared === true \? params/);
    assert.match(comfyDrawSource, /requestComfyTransport\('generate', requestBody, \{[\s\S]*generationConfig: settings/);
    assert.match(comfyDrawSource, /fetchComfyDirectImageFromWorkflow\(workflow, \{[\s\S]*generationConfig: settings/);
    assert.match(novelDrawSource, /const requestDelay = getSettings\(\)\.requestDelay;/);
    assert.doesNotMatch(novelDrawSource, /if \(i < tasks\.length - 1\) \{[\s\S]{0,200}randomDelay\(settings\.requestDelay/);
    assert.match(sdDrawSource, /export async function generateSdImage\([\s\S]*sdImageRequestQueue\.enqueue\(/);
    assert.match(sdDrawSource, /async function requestSdImage/);
    assert.doesNotMatch(sdDrawSource, /export async function requestSdImage/);
    assert.match(comfyDrawSource, /export async function generateComfyImage\([\s\S]*comfyImageRequestQueue\.enqueue\(/);
    assert.match(comfyDrawSource, /async function requestComfyImage/);
    assert.doesNotMatch(comfyDrawSource, /export async function requestComfyImage/);
    assert.match(indexSource, /onQueueStateChange: payload\.onQueueStateChange/);
    assert.match(indexSource, /generateSharedImageRuntime\(input\)/);
    assert.match(indexSource, /checkGeneratedImageCacheRuntime\(input\)/);
    assert.match(tavernHostSource, /pendingInlineImageRequests/);
    assert.match(tavernHostSource, /generateSharedImage\(\{[\s\S]*signal: controller\.signal/);
    assert.match(tavernHostSource, /pendingInlineImageRequests\.get\(requestId\)\?\.abort\(\)/);
    assert.match(appSource, /TAVERN_INLINE_IMAGE_PROGRESS_EVENT/);
    assert.match(appSource, /window\.dispatchEvent\(new CustomEvent\(TAVERN_INLINE_IMAGE_PROGRESS_EVENT/);
    assert.doesNotMatch(tavernHostSource, /openGallery/);
    assert.match(sdDrawSource, /if \(source === 'tavern'\) \{/);
    assert.match(novelDrawSource, /if \(source === 'tavern'\) \{/);
    assert.match(comfyDrawSource, /if \(source === 'tavern'\) \{/);
    assert.match(sdDrawSource, /messageId: sessionId[\s\S]*`tavern:/);
    assert.match(novelDrawSource, /messageId: sessionId[\s\S]*`tavern:/);
    assert.match(comfyDrawSource, /messageId: sessionId[\s\S]*`tavern:/);
    assert.match(hostSource, /htmlRenderEnabled: isHtmlRenderEnabled\(\)/);
    assert.match(appSource, /const htmlRenderEnabled = ref\(true\);/);
    assert.match(appSource, /if \('context' in payload\) \{[\s\S]*const nextContext = payload\.context as XbTavernContext \|\| \{\};[\s\S]*if \(canApplyHostContext\(nextContext\)\) \{[\s\S]*context\.value = nextContext;/);
    assert.match(appSource, /htmlRenderEnabled\.value = payload\.htmlRenderEnabled !== false;/);
    assert.match(appSource, /htmlRenderEnabled,\s*htmlThemeDark: homeThemeDark,\s*alertDialog: alertTavernDialog,\s*confirmDialog: confirmTavernDialog,\s*requestHost,/);
    assert.match(contextSource, /htmlRenderEnabled: Ref<boolean>;/);
    assert.match(conversationSource, /htmlRenderEnabled\.value \? 'html-render:on' : 'html-render:off'/);
    assert.match(conversationSource, /homeThemeDark\.value \? 'theme:dark' : 'theme:light'/);
    assert.match(conversationSource, /pending-user:\$\{pendingUserRenderState\.signature\}/);
    assert.doesNotMatch(conversationSource, /live-assistant:\$\{liveAssistantRenderState\.signature\}/);
    assert.match(managerSource, /function managerMarkdownSignature/);
    assert.match(managerSource, /htmlRenderEnabled\.value \? 'html-render:on' : 'html-render:off'/);
    assert.match(managerSource, /homeThemeDark\.value \? 'theme:dark' : 'theme:light'/);
    assert.match(managerSource, /history-message:\$\{item\.key\}:\$\{managerMarkdownSignature\(item\.content\)\}/);
    assert.match(managerSource, /class="xb-tavern-markdown live-manager-draft"[\s\S]*\{\{ liveManagerAssistantDraft\.content \}\}/);
    assert.doesNotMatch(managerSource, /live-message:\$\{item\.key\}/);
    assert.match(appSource, /visibleManagerMarkdownSignature[\s\S]*htmlRenderEnabled\.value \? 'html-render:on' : 'html-render:off'/);
    assert.match(appSource, /visibleManagerMarkdownSignature[\s\S]*homeThemeDark\.value \? 'theme:dark' : 'theme:light'/);
    assert.match(appSource, /const liveManagerMarkdownSignature = computed\(\(\) => \{[\s\S]*\$\{draft\.sessionId\}:\$\{draft\.revision\}/);
    assert.doesNotMatch(appSource, /liveManagerMarkdownSignature[\s\S]*markdownSignature\(draft\.content\)/);
    assert.match(managerSource, /:key="`live-assistant:\$\{liveManagerAssistantDraft\.sessionId\}`"/);
    assert.doesNotMatch(managerSource, /liveManagerAssistantDraft\.revision/);
    assert.match(appSource, /watch\(\[[\s\S]*\(\) => htmlRenderEnabled\.value,[\s\S]*\(\) => homeThemeDark\.value,[\s\S]*enhanceChatMarkdown\(\);/);
    assert.match(appSource, /watch\(\(\) => liveManagerMarkdownSignature\.value, \(\) => \{[\s\S]*scrollManagerToBottom\(\);[\s\S]*updateManagerScrollButtons\(\)/);
    assert.match(markdownToolsSource, /htmlBlockMode: optionsOverride\.live[\s\S]*\? 'code'[\s\S]*: options\.htmlRenderEnabled\.value \? 'preview' : 'code'/);
    assert.match(markdownToolsSource, /htmlBlockMode: options\.htmlRenderEnabled\.value \? undefined : 'code'/);
    assert.match(markdownToolsSource, /window\.addEventListener\(TAVERN_INLINE_IMAGE_PROGRESS_EVENT/);
    assert.match(markdownToolsSource, /window\.removeEventListener\(TAVERN_INLINE_IMAGE_PROGRESS_EVENT/);
    assert.match(markdownToolsSource, /if \(!canEnhanceMarkdownRoot\(node\)\) \{return;\}/);
    assert.match(markdownSource, /if \(options\.htmlBlockMode === 'code'\) \{[\s\S]*return buildHtmlCodeView\(doc, code\);/);
    assert.match(tavernHostSource, /refreshRenderSettings: \(\) => void;/);
    assert.match(tavernHostSource, /function refreshRenderSettings\(\): void \{[\s\S]*htmlRenderEnabled: isHtmlRenderEnabled\(\),[\s\S]*\}/);
    assert.match(indexSource, /window\.xiaobaixTavern\?\.refreshRenderSettings\?\.\(\);/);
    assert.doesNotMatch(indexSource, /refreshContext\?\.\(\{ includeWorldbooks: false \}\)/);
});

test('tavern draw image refresh only stores failed placeholders for failed-card retries', async () => {
    const tavernHostBuildSource = readRepoFile('modules/tavern/tavern.js');
    const refreshFunction = extractFunctionSource(tavernHostBuildSource, 'async function handleDrawImageRefresh');
    const replies: Array<{ requestId: string; payload: Record<string, unknown> }> = [];
    const storedFailedPlaceholders: Array<Record<string, unknown>> = [];
    const storedPreviews: Array<Record<string, unknown>> = [];
    const selectedSlots: Array<{ slotId: string; imgId: string }> = [];
    const deletedFailedSlots: string[] = [];
    let currentDisplay: Record<string, unknown> = {};
    let failGeneration = true;
    const cloneHarnessValue = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

    const harnessContext = createContext({
        window: {
            xiaobaixDraw: {
                buildPromptData: ({ tags }: Record<string, unknown>) => ({ positive: tags }),
                generateImage: async () => {
                    if (failGeneration) {
                        throw new Error('provider failed');
                    }
                    return 'new-base64';
                },
            },
        },
        getDrawGalleryCacheModule: async () => ({
            getDisplayPreviewForSlot: async () => currentDisplay,
            storePreview: async (preview: Record<string, unknown>) => {
                const storedPreview = cloneHarnessValue(preview);
                storedPreviews.push(storedPreview);
                currentDisplay = { preview: storedPreview, hasData: true, isFailed: false };
            },
            setSlotSelection: async (slotId: string, imgId: string) => {
                selectedSlots.push({ slotId, imgId });
            },
            deleteFailedRecordsForSlot: async (slotId: string) => {
                deletedFailedSlots.push(slotId);
            },
            storeFailedPlaceholder: async (preview: Record<string, unknown>) => {
                storedFailedPlaceholders.push(cloneHarnessValue(preview));
            },
        }),
        getDrawCommonModule: async () => ({
            clearDrawSavedEntry: async () => false,
        }),
        buildDrawImageResult: async (slotId: string) => ({ slotId, resultFromDisplay: currentDisplay.isFailed ? 'failed' : 'success' }),
        replyHostResult: (requestId: string, payload: Record<string, unknown>) => {
            replies.push({ requestId, payload: cloneHarnessValue(payload) });
        },
        hostErrorPayload: (error: unknown, fallback: string) => ({
            ok: false,
            error: error instanceof Error ? error.message : String(error || fallback),
            fallback,
        }),
        buildRefreshFailedDrawPlaceholder: (slotId: string, preview: Record<string, unknown>, failedInfo: Record<string, unknown>, error: unknown) => ({
            slotId,
            tags: String(preview.tags || failedInfo.tags || ''),
            errorMessage: error instanceof Error ? error.message : String(error || ''),
            status: 'failed',
        }),
        getDrawPreviewCharacterPrompts: (): Array<Record<string, unknown>> => [],
        getDrawPromptNegativeInput: () => '',
        extractGeneratedImageBase64: (value: unknown) => String(value || ''),
        generateDrawImageId: () => 'img-new',
        getDrawPreviewStorageMessageId: () => 'message-id',
        getDrawPreviewMessageId: () => -1,
    });
    const harness = new Script(`${refreshFunction}; handleDrawImageRefresh;`)
        .runInContext(harnessContext) as (payload?: Record<string, unknown>) => Promise<void>;

    currentDisplay = {
        preview: { imgId: 'img-ok', slotId: 'slot-ok', tags: 'good prompt', base64: 'old-image' },
        hasData: true,
        isFailed: false,
    };
    await harness({ requestId: 'success-refresh', payload: { slotId: 'slot-ok' } });

    assert.equal(storedFailedPlaceholders.length, 0);
    assert.deepEqual(replies.at(-1), {
        requestId: 'success-refresh',
        payload: { ok: false, error: 'provider failed', fallback: 'image_refresh_failed' },
    });

    currentDisplay = {
        preview: { slotId: 'slot-failed', tags: 'retry prompt', status: 'failed' },
        failedInfo: { tags: 'retry prompt', errorMessage: 'old failure' },
        hasData: false,
        isFailed: true,
    };
    await harness({ requestId: 'failed-retry', payload: { slotId: 'slot-failed' } });

    assert.deepEqual(storedFailedPlaceholders, [{
        slotId: 'slot-failed',
        tags: 'retry prompt',
        errorMessage: 'provider failed',
        status: 'failed',
    }]);
    assert.deepEqual(replies.at(-1), {
        requestId: 'failed-retry',
        payload: { ok: true, result: { slotId: 'slot-failed', resultFromDisplay: 'failed' } },
    });

    failGeneration = false;
    currentDisplay = {
        preview: { slotId: 'slot-failed', tags: 'retry prompt', status: 'failed' },
        failedInfo: { tags: 'retry prompt', errorMessage: 'old failure' },
        hasData: false,
        isFailed: true,
    };
    await harness({ requestId: 'failed-retry-success', payload: { slotId: 'slot-failed' } });

    assert.deepEqual(deletedFailedSlots, ['slot-failed']);
    assert.deepEqual(selectedSlots.at(-1), { slotId: 'slot-failed', imgId: 'img-new' });
    assert.equal(storedPreviews.at(-1)?.slotId, 'slot-failed');
    assert.equal(storedPreviews.at(-1)?.base64, 'new-base64');
    assert.deepEqual(replies.at(-1), {
        requestId: 'failed-retry-success',
        payload: { ok: true, result: { slotId: 'slot-failed', resultFromDisplay: 'success' } },
    });
});

test('tavern roleplay html previews use stable code anchors and a local iframe bridge', () => {
    const markdownToolsSource = readRepoFile('modules/tavern/app-src/components/chat/useTavernMarkdownTools.ts');
    const markdownCss = readRepoFile('modules/tavern/app-src/styles/chat/markdown.css');
    const conversationSource = readRepoFile('modules/tavern/app-src/components/chat/TavernConversationPanel.vue');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const markdownSource = readRepoFile('modules/agent-core/ui/message-markdown.js');

    assert.match(markdownSource, /function preprocessMarkdownInput\(raw = '', options = \{\}\)/);
    assert.match(markdownSource, /function patchShowdownHtmlSpans\(\)[\s\S]*showdown\.subParser\('unhashHTMLSpans'/);
    assert.match(markdownSource, /patchShowdownHtmlSpans\(\);[\s\S]*markdownConverter = new showdown\.Converter/);
    assert.match(markdownSource, /const htmlFenceMode = options\.htmlFenceMode === 'code' \? 'code' : 'placeholder';/);
    assert.match(markdownSource, /const protectRawHtmlBoundaries = options\.protectRawHtmlBoundaries !== false;/);
    assert.match(markdownSource, /shouldFoldAsHtml && htmlFenceMode !== 'code'/);
    assert.match(markdownToolsSource, /renderOptions\.roleplay \? \{ htmlFenceMode: 'code' \} : \{\}/);
    assert.match(markdownToolsSource, /const TAVERN_HTML_CODE_LANGUAGES = new Set\(\['html', 'htm', 'xhtml', 'xml', 'svg', 'vue', 'svelte'\]\);/);
    assert.match(markdownToolsSource, /function enhanceTavernHtmlCodeBlocks\(root: HTMLElement\)/);
    assert.match(markdownToolsSource, /function isTavernHtmlCodeLanguage\(codeBlock: HTMLElement\)[\s\S]*TAVERN_HTML_CODE_LANGUAGES\.has\(normalized\);/);
    assert.match(markdownToolsSource, /function isRenderableTavernHtmlCodeBlock\(codeBlock: HTMLElement\) \{[\s\S]*return isTavernHtmlCodeLanguage\(codeBlock\)[\s\S]*\|\| looksLikeTavernHtmlFrameContent\(codeBlock\.textContent \|\| ''\);[\s\S]*\}/);
    assert.match(markdownToolsSource, /if \(!isRenderableTavernHtmlCodeBlock\(codeBlock\)\) \{[\s\S]*cleanupTavernHtmlPre\(pre\);[\s\S]*return;[\s\S]*\}/);
    assert.match(markdownToolsSource, /function extractTavernExternalHtmlUrl\(content = ''\)[\s\S]*\/\^https\?:\\\/\\\/\[\^\\s\]\+\$\/i[\s\S]*xb-src:/);
    assert.match(markdownToolsSource, /htmlThemeDark: Ref<boolean>;/);
    assert.match(markdownToolsSource, /function buildTavernHtmlThemeBootstrap\(theme: 'dark' \| 'light'\)[\s\S]*<meta name="color-scheme" content="\$\{theme\}">[\s\S]*r\.dataset\.xbTavernTheme='\$\{theme\}'[\s\S]*r\.style\.colorScheme='\$\{theme\}'/);
    assert.match(markdownToolsSource, /const injection = `\$\{themeBootstrap\}\$\{scripts\}\$\{headHints\}\$\{vhFix\}`;/);
    assert.match(markdownToolsSource, /<style>html,body\{margin:0;padding:0;background:transparent\}<\/style>/);
    assert.match(markdownToolsSource, /async function loadTavernExternalHtmlUrl\(iframe: HTMLIFrameElement, url: string\)[\s\S]*iframe\.srcdoc = '<!DOCTYPE html><html><body style="display:flex;justify-content:center;align-items:center;height:100px;color:#888;font-family:sans-serif;background:transparent">加载中\.\.\.<\/body><\/html>';[\s\S]*iframe\.src = url;[\s\S]*iframe\.style\.minHeight = '800px';[\s\S]*iframe\.setAttribute\('scrolling', 'auto'\);/);
    assert.match(markdownToolsSource, /async function replaceTavernHtmlRenderVariables\(html = ''\)[\s\S]*requestHost\('xb-tavern:replace-html-render-vars', \{ payload: \{ html: source \} \}\)/);
    assert.match(markdownToolsSource, /async function loadTavernHtmlIframeContent\(iframe: HTMLIFrameElement, html = ''\)[\s\S]*extractTavernExternalHtmlUrl\(source\)[\s\S]*await loadTavernExternalHtmlUrl\(iframe, externalUrl\);[\s\S]*await replaceTavernHtmlRenderVariables\(source\);/);
    assert.match(markdownToolsSource, /enhanceTavernHtmlCodeBlocks\(node\);[\s\S]*enhanceMarkdownContent\(node, \{[\s\S]*skipPreSelector: TAVERN_HTML_PRE_SELECTOR/);
    assert.match(markdownToolsSource, /className = 'xb-tavern-html-wrapper'/);
    assert.match(markdownCss, /\.xb-tavern-markdown \.xb-tavern-html-wrapper \{[\s\S]*margin: 0;/);
    assert.match(markdownToolsSource, /className = 'xb-tavern-html-iframe'/);
    assert.match(markdownToolsSource, /iframe\.style\.cssText = 'width:100%;border:none;background:transparent;overflow:hidden;height:0;margin:0;padding:0;display:block;contain:layout paint style;will-change:height;min-height:50px';/);
    assert.match(markdownToolsSource, /function applyTavernHtmlIframeHeight\(iframe: HTMLIFrameElement, height: unknown, force = false\)[\s\S]*if \(next < 1\) \{return;\}[\s\S]*window\.requestAnimationFrame/);
    assert.match(markdownToolsSource, /if \(typeof data\.height === 'number'\) \{[\s\S]*applyTavernHtmlIframeHeight\(iframe, data\.height, !!data\.force\);/);
    assert.match(markdownToolsSource, /iframe\.srcdoc = buildTavernWrappedHtml\(replaced, options\.htmlThemeDark\.value\);/);
    assert.match(markdownToolsSource, /if \(!externalUrl && same\) \{return;\}/);
    assert.match(markdownToolsSource, /window\.addEventListener\('message', handleTavernHtmlIframeMessage as EventListener\);/);
    assert.match(markdownToolsSource, /window\.removeEventListener\('message', handleTavernHtmlIframeMessage as EventListener\);/);
    assert.match(markdownToolsSource, /const htmlGenerateRelays = new Map/);
    assert.match(markdownToolsSource, /const TAVERN_HTML_GENERATE_RELAY_TIMEOUT_MS = 300_000;/);
    assert.match(markdownToolsSource, /function postToParentGenerateService\(payload: Record<string, unknown>\)[\s\S]*const safePayload = cloneTavernHtmlMessagePayload\(payload\);[\s\S]*window\.parent\?\.postMessage\(safePayload, window\.location\.origin\);/);
    assert.match(markdownToolsSource, /function deleteTavernHtmlGenerateRelay\(id: string\)[\s\S]*window\.clearTimeout\(relay\.timeoutId\);[\s\S]*htmlGenerateRelays\.delete\(id\);/);
    assert.match(markdownToolsSource, /function clearTavernHtmlGenerateRelaysForIframe\(iframe: HTMLIFrameElement\)[\s\S]*relay\.iframe === iframe[\s\S]*deleteTavernHtmlGenerateRelay\(id\);/);
    assert.match(markdownToolsSource, /function rememberTavernHtmlGenerateRelay\(id: string, iframe: HTMLIFrameElement, targetOrigin: string\)[\s\S]*window\.setTimeout\(\(\) => \{[\s\S]*htmlGenerateRelays\.delete\(id\);[\s\S]*TAVERN_HTML_GENERATE_RELAY_TIMEOUT_MS\);[\s\S]*htmlGenerateRelays\.set\(id, \{ iframe, targetOrigin, timeoutId \}\);/);
    assert.match(markdownToolsSource, /function releaseTavernHtmlIframeResources\(iframe: HTMLIFrameElement\)[\s\S]*releasedHtmlIframes\.add\(iframe\);[\s\S]*clearTavernHtmlGenerateRelaysForIframe\(iframe\);[\s\S]*clearTavernHtmlIframeProbeTimers\(iframe\);[\s\S]*cancelAnimationFrame\(frameId\);[\s\S]*htmlIframeHeights\.delete\(iframe\);/);
    assert.match(markdownToolsSource, /function isActiveTavernHtmlIframe\(iframe: HTMLIFrameElement\)[\s\S]*iframe\.isConnected !== false && !releasedHtmlIframes\.has\(iframe\)/);
    assert.match(markdownToolsSource, /async function loadTavernHtmlIframeContent\(iframe: HTMLIFrameElement, html = ''\)[\s\S]*if \(!isActiveTavernHtmlIframe\(iframe\)\) \{return;\}[\s\S]*await replaceTavernHtmlRenderVariables\(source\);[\s\S]*if \(!isActiveTavernHtmlIframe\(iframe\)\) \{return;\}/);
    assert.match(markdownToolsSource, /function removeTavernHtmlWrapper\(wrapper: Element \| null \| undefined\)[\s\S]*releaseTavernHtmlIframeResources\(iframe\);[\s\S]*wrapper\.remove\(\);/);
    assert.match(markdownToolsSource, /function releaseMarkdownRootResources\(root: HTMLElement\)[\s\S]*inlineImageObserver\?\.unobserve\(slot\);[\s\S]*releaseTavernHtmlIframeResources\(iframe\);/);
    assert.match(markdownToolsSource, /event\.source === window\.parent && isTavernGenerateRelayResponse\(topData\)/);
    assert.match(markdownToolsSource, /data\.type === 'generateRequest'[\s\S]*rememberTavernHtmlGenerateRelay\(id, iframe, replyOrigin\);[\s\S]*postToParentGenerateService\(\{[\s\S]*type: 'generateRequest',[\s\S]*options:/);
    assert.match(markdownToolsSource, /TAVERN_HTML_GENERATE_RESPONSE_TYPES = new Set\(\[[\s\S]*'generateStreamChunk'[\s\S]*'generateStreamComplete'[\s\S]*'generateResult'[\s\S]*'generateError'/);
    assert.match(markdownToolsSource, /postToTavernHtmlIframe\(relay\.iframe, data, relay\.targetOrigin\);/);
    assert.match(markdownToolsSource, /disposeMarkdownTools\(\) \{[\s\S]*clearAllTavernHtmlGenerateRelays\(\);/);
    assert.match(markdownToolsSource, /const replyOrigin = getTavernHtmlMessageTargetOrigin\(event\.origin\);[\s\S]*postToTavernHtmlIframe\(iframe, \{[\s\S]*type: 'avatars'[\s\S]*\}, replyOrigin\);/);
    assert.match(markdownToolsSource, /data\.type === 'getAvatars'[\s\S]*type: 'avatars'/);
    assert.match(markdownToolsSource, /data\.type === 'runCommand'[\s\S]*xb-tavern:run-slash-command/);
    assert.doesNotMatch(markdownToolsSource, /callGenerate is not available in Tavern HTML preview yet/);
    assert.match(appSource, /getHtmlFrameAvatarUrls: \(\) => \(\{[\s\S]*user: String\(effectiveContext\.value\.user\?\.avatar \|\| ''\),[\s\S]*char: String\(effectiveContext\.value\.character\?\.avatar \|\| ''\),/);
    assert.match(conversationSource, /function shouldIgnoreMessageActionTrayClick\(event: MouseEvent\)[\s\S]*closest\('summary, details, a, button, input, textarea, select, label, \.xb-tavern-html-wrapper'\)/);
    assert.match(conversationSource, /@click\.stop="toggleMessageActionTray\(message, \$event\)"/);
    assert.doesNotMatch(markdownToolsSource, /\bnew Blob\b|createObjectURL|useBlob/);
    assert.doesNotMatch(markdownToolsSource, /xiaobaix-iframe-wrapper|xiaobaix-iframe'/);
});

test('tavern live stream rendering is frame-batched without bypassing display regex', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const chatRunSource = readRepoFile('modules/tavern/app-src/features/chat-run/useTavernChatRunController.ts');
    const conversationSource = readRepoFile('modules/tavern/app-src/components/chat/TavernConversationPanel.vue');
    const assistantBubbleSource = readRepoFile('modules/tavern/app-src/components/chat/TavernAssistantBubble.vue');
    const messageMarkdownSource = readRepoFile('modules/tavern/app-src/components/chat/TavernMessageMarkdown.vue');
    const projectionSource = readRepoFile('modules/tavern/app-src/features/chat-render/useTavernRuntimeDisplayProjection.ts');
    const markdownToolsSource = readRepoFile('modules/tavern/app-src/components/chat/useTavernMarkdownTools.ts');
    const runtimeSource = readRepoFile('modules/tavern/app-src/runtime/run-once.ts');
    assert.doesNotMatch(markdownToolsSource, /function enhanceLiveChatMarkdown\(/);
    assert.match(markdownToolsSource, /function markPendingTavernHtmlPreviews\(root: HTMLElement\)[\s\S]*pre\.dataset\.xbTavernHtmlPending = 'true';/);
    assert.match(markdownToolsSource, /function cleanupTavernHtmlPre\(pre: HTMLPreElement\)[\s\S]*delete pre\.dataset\.xbTavernHtmlPending;/);
    assert.match(markdownToolsSource, /function renderTavernHtmlPre\(pre: HTMLPreElement, html = '', hash = ''\)[\s\S]*delete pre\.dataset\.xbTavernHtmlPending;/);
    assert.match(markdownToolsSource, /function enhanceStableMarkdownNode\(node: HTMLElement[\s\S]*if \(optionsOverride\.live\) \{[\s\S]*markPendingTavernHtmlPreviews\(node\);[\s\S]*\} else \{[\s\S]*enhanceTavernHtmlCodeBlocks\(node\);/);
    assert.match(markdownToolsSource, /function enhanceStableMarkdownNode\(node: HTMLElement[\s\S]*enhanceActionCheckMarkers\(node\);/);
    assert.match(messageMarkdownSource, /chat\.enhanceMarkdownRoot\(root, \{ live: props\.phase === 'live' \}\);/);
    assert.match(messageMarkdownSource, /data-markdown-managed="true"/);
    assert.match(markdownToolsSource, /function enhanceChatMarkdown\(\)[\s\S]*node\.dataset\.markdownManaged === 'true'[\s\S]*return;/);

    assert.doesNotMatch(appSource, /let runtimeStreamFrame = 0;/);
    assert.doesNotMatch(appSource, /let pendingRuntimeStreamSnapshot: TavernRunStreamSnapshot \| null = null;/);
    assert.match(chatRunSource, /let runtimeStreamFrame = 0;/);
    assert.match(chatRunSource, /let pendingRuntimeStreamSnapshot: TavernRunStreamSnapshot \| null = null;/);
    assert.match(chatRunSource, /function scheduleRuntimeStreamSnapshot\(snapshot: TavernRunStreamSnapshot\)[\s\S]*window\.requestAnimationFrame\(\(\) => \{[\s\S]*flushRuntimeStreamSnapshotNow\(\);/);
    assert.match(chatRunSource, /onStreamProgress: \(snapshot\) => \{[\s\S]*scheduleRuntimeStreamSnapshot\(snapshot\);[\s\S]*\},/);
    assert.match(chatRunSource, /runtimeStatusStartedAt: Ref<number>/);
    assert.match(chatRunSource, /runtimeStatusElapsedSeconds: Ref<number>/);
    assert.match(chatRunSource, /function setRuntimeStatusLabel\(label: TavernRunStatusLabel \| ''\)/);
    assert.match(chatRunSource, /if \(label && state\.runtimeStatusLabel\.value === label && state\.runtimeStatusStartedAt\.value\) \{[\s\S]*refreshRuntimeStatusElapsedSeconds\(\);[\s\S]*startRuntimeStatusTimer\(\);[\s\S]*return;/);
    assert.match(chatRunSource, /state\.runtimeStatusStartedAt\.value = Date\.now\(\);[\s\S]*state\.runtimeStatusElapsedSeconds\.value = 0;[\s\S]*startRuntimeStatusTimer\(\);/);
    assert.match(chatRunSource, /window\.setInterval\(\(\) => \{[\s\S]*refreshRuntimeStatusElapsedSeconds\(\);[\s\S]*\}, 1000\)/);
    assert.match(chatRunSource, /setRuntimeStatusLabel\('同步状态'\);/);
    assert.match(chatRunSource, /onRuntimeStatus: \(snapshot\) => \{[\s\S]*setRuntimeStatusLabel\(snapshot\.label\);[\s\S]*\},/);
    assert.doesNotMatch(appSource, /onStreamProgress: \(snapshot\) => \{[\s\S]{0,240}runtimeText\.value = snapshot\.text;/);
    assert.match(appSource, /function displayRuntimeRenderProjection/);
    assert.match(appSource, /const runtimeDisplayProjectionController = useTavernRuntimeDisplayProjection\(/);
    assert.match(appSource, /function syncRuntimeDisplayProjectionRequests\(\)[\s\S]*setMessageInput\(message\.request, message\.fallback\)[\s\S]*setThoughtInputs\(runtimeThoughtDisplayRequests\(\)\)/);
    assert.match(projectionSource, /function scheduleSlot\(slot: string, request: TavernRuntimeDisplayRegexRequest\)[\s\S]*pending\.latest = request;[\s\S]*return;/);
    assert.match(projectionSource, /current\.latest\.key !== request\.key[\s\S]*runSlot\(slot\);/);
    assert.doesNotMatch(projectionSource, /rememberDisplayRegexText|displayRegexCache/);
    assert.match(appSource, /function rememberDisplayRegexText\(key: string, text: string\)[\s\S]*enhanceChatMarkdown\(\);[\s\S]*updateChatScrollButtons\(\);/);
    assert.match(chatRunSource, /state\.isRunning\.value = false;[\s\S]*void nextTick\(\(\) => \{[\s\S]*options\.updateChatScrollButtons\(\);/);
    assert.doesNotMatch(chatRunSource, /state\.isRunning\.value = false;[\s\S]*options\.enhanceChatMarkdown\(\);/);
    assert.doesNotMatch(appSource, /enhanceLiveChatMarkdown/);
    assert.doesNotMatch(conversationSource, /:key="`live-assistant:\$\{liveAssistantRenderState\.signature\}`"/);
    assert.match(conversationSource, /import TavernAssistantBubble from '\.\/TavernAssistantBubble\.vue';/);
    assert.match(assistantBubbleSource, /const renderState = computed<AssistantRenderState>\(\(\) => \{[\s\S]*useRuntimePresentation\.value \|\| !message[\s\S]*chat\.displayRuntimeRenderProjection\(\)[\s\S]*chat\.displayMessageRenderProjection\(message\)/);
    assert.doesNotMatch(assistantBubbleSource, /runtimeText|runtimeActionCheckEvents|runtimeThoughts/);
    assert.match(assistantBubbleSource, /const renderHtml = computed\(\(\) => chat\.renderChatMarkdown\(renderState\.value\.text, roleplayMarkdownOptions\(\)\)\);/);
    assert.match(assistantBubbleSource, /<TavernMessageMarkdown[\s\S]*:phase="streaming \? 'live' : 'settled'"[\s\S]*:signature="renderState\.signature"/);
    assert.match(assistantBubbleSource, /const thoughtDefaultOpen = computed\(\(\) => props\.streaming && !contentVisible\.value\);/);
    assert.match(assistantBubbleSource, /const streamStarted = streaming && !wasStreaming;[\s\S]*thoughtDisclosure\.reset\(\);[\s\S]*const contentStarted = hasContent && \(!hadContent \|\| streamStarted\);[\s\S]*const streamFinished = wasStreaming && !streaming;[\s\S]*thoughtDisclosure\.setOpen\(thoughtDisclosureId\(\), false\);/);
    assert.doesNotMatch(assistantBubbleSource, /const thoughtDefaultOpen = ref\(props\.streaming\)/);
    assert.match(messageMarkdownSource, /:data-markdown-signature="signature"/);
    assert.match(messageMarkdownSource, /watch\([\s\S]*props\.html[\s\S]*props\.signature[\s\S]*props\.phase[\s\S]*renderMarkdown/);
    assert.match(assistantBubbleSource, /const statusLabel = computed\(\(\) => \{[\s\S]*chat\.runtimeStatusLabel\.value \|\| '同步状态'[\s\S]*chat\.runtimeStatusElapsedSeconds\.value/);
    assert.doesNotMatch(conversationSource, /生成中/);
    assert.match(runtimeSource, /export type TavernRunStatusLabel =[\s\S]*'同步状态'[\s\S]*'整理历史'[\s\S]*'构建请求'[\s\S]*'请求模型'[\s\S]*'接收回复'[\s\S]*'保存回复'/);
    assert.match(runtimeSource, /notifyRunStatus\(input\.onRuntimeStatus, '同步状态'\);[\s\S]*notifyRunStatus\(input\.onRuntimeStatus, '整理历史'\);[\s\S]*notifyRunStatus\(input\.onRuntimeStatus, '构建请求'\);[\s\S]*notifyRunStatus\(input\.onRuntimeStatus, '请求模型'\);[\s\S]*notifyRunStatus\(input\.onRuntimeStatus, '保存回复'\);/);
    assert.match(runtimeSource, /if \(!sawStreamProgress\) \{[\s\S]*notifyRunStatus\(input\.onRuntimeStatus, '接收回复'\);/);
    assert.doesNotMatch(runtimeSource, /整理上下文|请求就绪|连接模型|接收流式/);
});

test('tavern draw jobs are message-queued and route progress by host request', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const drawSource = readRepoFile('modules/tavern/app-src/features/draw/useTavernDrawController.ts');
    const chatRunSource = readRepoFile('modules/tavern/app-src/features/chat-run/useTavernChatRunController.ts');
    const sessionSource = readRepoFile('modules/tavern/app-src/features/session/useTavernSessionController.ts');
    const canDrawSource = drawSource.match(/function canDrawMessage\(message: TavernMessageRecord\) \{[\s\S]*?\n {4}\}/)?.[0] || '';
    const insertMarkersSource = drawSource.match(/function insertTavernImageMarkers\(content = '', images: unknown\[] = \[]\) \{[\s\S]*?\n\}\n\nfunction formatDrawProgress/)?.[0] || '';

    assert.match(appSource, /const drawContext = useTavernDrawController\(\{/);
    assert.match(appSource, /draw: drawContext,/);
    assert.doesNotMatch(appSource, /const drawJobs = ref<Record<string, TavernDrawJob>>\(\{\}\);/);
    assert.doesNotMatch(appSource, /const drawQueue = ref<string\[]>\(\[]\);/);
    assert.doesNotMatch(appSource, /const drawRequestJobKeys = new Map<string, string>\(\);/);
    assert.match(drawSource, /const drawJobs = ref<Record<string, TavernDrawJob>>\(\{\}\);/);
    assert.match(drawSource, /const drawQueue = ref<string\[]>\(\[]\);/);
    assert.match(drawSource, /const drawRequestJobKeys = new Map<string, string>\(\);/);
    assert.doesNotMatch(appSource, /drawProgressText/);
    assert.match(drawSource, /type TavernDrawJobStatus = 'queued' \| 'running' \| 'success' \| 'failed' \| 'cancelled';/);
    assert.match(drawSource, /sourceTextHash: string;/);
    assert.match(drawSource, /finishId: number;/);
    assert.doesNotMatch(appSource, /drawingMessageKey|drawStatusMessageKey/);

    const hostBridgeSource = readRepoFile('modules/tavern/app-src/features/host-bridge/useTavernHostBridge.ts');
    assert.match(hostBridgeSource, /function requestHost\(type: string, payload: Record<string, unknown> = \{\}, requestOptions: \{ signal\?: AbortSignal; requestId\?: string \} = \{\}\)/);
    assert.match(hostBridgeSource, /const requestId = String\(requestOptions\.requestId \|\| ''\)\.trim\(\) \|\| createHostRequestId\(\);/);
    assert.match(drawSource, /const requestId = options\.createHostRequestId\('draw'\);[\s\S]*drawRequestJobKeys\.set\(requestId, jobKey\);[\s\S]*options\.requestHost\('xb-tavern:draw-generate'[\s\S]*\{ signal: controller\.signal, requestId \}/);

    assert.match(drawSource, /function finishDrawJobStatus\(jobKey = '', patch: Partial<TavernDrawJob>, durationMs = 0\): void \{[\s\S]*const finishId = drawFinishSerial \+= 1;[\s\S]*current\.finishId !== finishId/);
    assert.match(drawSource, /function enqueueDrawMessageJob\(message: TavernMessageRecord\): void \{[\s\S]*status: 'queued'[\s\S]*drawQueue\.value = \[\.\.\.drawQueue\.value\.filter/);
    assert.match(drawSource, /async function processNextDrawJob\(\): Promise<void> \{[\s\S]*if \(runningDrawJobKey\(\)\) \{return;\}[\s\S]*await runDrawJob\(nextKey\);/);
    assert.match(drawSource, /async function runDrawJob\(jobKey = ''\): Promise<void> \{[\s\S]*const currentMessage = await options\.getTavernMessage\(job\.sessionId, job\.order\);[\s\S]*const sourceTextHash = options\.markdownSignature\(cleanText\);[\s\S]*setDrawJob\(jobKey, \{ sourceTextHash \}\);[\s\S]*const latestMessage = await options\.getTavernMessage\(job\.sessionId, job\.order\);[\s\S]*insertTavernImageMarkers\(latestMessage!\.content \|\| '', images\);/);
    assert.match(drawSource, /const latestMessage = await options\.getTavernMessage\(job\.sessionId, job\.order\);[\s\S]*if \(controller\.signal\.aborted\) \{[\s\S]*progressText: '配图已取消'[\s\S]*return;[\s\S]*const latestSourceTextHash = drawSourceTextHash\(latestMessage!\.content \|\| ''\);[\s\S]*progressText: '源楼层已变化'[\s\S]*const result = \(resultPayload\.result \|\| resultPayload\)/);
    assert.match(drawSource, /options\.flashMessageAction\(updated \|\| latestMessage!, 'draw', !allFailed && !!updated\);/);

    assert.match(drawSource, /function cancelJob\(jobKey = ''\): void \{[\s\S]*job\.controller\?\.abort\(\);[\s\S]*clearCooldownTimer\(\);/);
    assert.match(drawSource, /function cancelJobsForMessageRange\(sessionId = '', fromOrder = 0\): void \{[\s\S]*job\.sessionId === id && Number\(job\.order\) >= startOrder[\s\S]*cancelJob\(job\.key\);/);
    assert.match(drawSource, /function cancelJobsForSession\(sessionId = ''\): void \{[\s\S]*job\.sessionId === id[\s\S]*cancelJob\(job\.key\);/);
    assert.match(appSource, /cancelDrawJobsForSession: drawContext\.cancelJobsForSession/);
    assert.match(sessionSource, /async function removeSession\(sessionId: string\) \{[\s\S]*options\.cancelDrawJobsForSession\(id\);[\s\S]*await options\.cancelAndRollbackManagersForSession\(id\);/);
    assert.match(appSource, /async function deleteMessageTurn\(message: TavernMessageRecord\) \{[\s\S]*const fromOrder = Math\.min\(\.\.\.ordersToDelete\);[\s\S]*drawContext\.cancelJobsForMessageRange\(message\.sessionId, fromOrder\);/);
    assert.match(appSource, /async function rerollLatestAssistant\(\) \{[\s\S]*await runOnce\(\{ rerollLatestAssistant: true \}\);/);
    assert.match(appSource, /cancelDrawJobsForMessageRange: drawContext\.cancelJobsForMessageRange/);
    assert.match(chatRunSource, /onLatestAssistantRerollPrepared: async \(sessionId, message, previousAssistantMessage\) => \{[\s\S]*if \(previousAssistantMessage\) \{[\s\S]*rerollPreviousAssistantOrder = previousAssistantMessage\.order;[\s\S]*options\.pruneLoadedSessionMessagesFromOrder\(sessionId, previousAssistantMessage\.order\);/);
    assert.match(chatRunSource, /onAssistantMessageSaved: async \(sessionId, message\) => \{[\s\S]*rerollPreviousAssistantOrder !== null[\s\S]*options\.cancelDrawJobsForMessageRange\(sessionId, rerollPreviousAssistantOrder\);/);

    assert.ok(canDrawSource);
    assert.match(canDrawSource, /if \(isDrawingMessage\(message\)\) \{return true;\}/);
    assert.match(canDrawSource, /if \(options\.isEditingMessage\(message\) \|\| message\.error\) \{return false;\}/);
    assert.doesNotMatch(canDrawSource, /isRunning\.value|drawingMessageKey/);

    assert.ok(insertMarkersSource);
    assert.match(insertMarkersSource, /if \(!image\.slotId\) \{return;\}/);
    assert.doesNotMatch(insertMarkersSource, /success === false/);

    assert.match(drawSource, /let drawCooldownTimer: number \| null = null;/);
    assert.match(drawSource, /const DRAW_COOLDOWN_TICK_MS = 100;/);
    assert.match(drawSource, /function clearCooldownTimer\(\) \{[\s\S]*window\.clearInterval\(drawCooldownTimer\);/);
    assert.match(drawSource, /function startDrawCooldownCountdown\(jobKey: string, data: Record<string, unknown> = \{\}\) \{[\s\S]*const job = drawJobs\.value\[jobKey\];[\s\S]*remainingMs[\s\S]*formatDrawProgress\('cooldown'/);
    assert.match(drawSource, /const jobKey = drawRequestJobKeys\.get\(requestId\);[\s\S]*if \(jobKey && drawJobs\.value\[jobKey\]\) \{[\s\S]*startDrawCooldownCountdown\(jobKey, payload\.data[\s\S]*setDrawJob\(jobKey, \{[\s\S]*progressText: formatDrawProgress\(state, payload\.data/);
    assert.match(appSource, /onUnmounted\(\(\) => \{[\s\S]*drawContext\.clearCooldownTimer\(\);/);
    assert.match(appSource, /onUnmounted\(\(\) => \{[\s\S]*drawContext\.abortAllJobs\(\);/);
});

test('tavern draw capsule mirrors native capsule structure with in-app quick settings', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const drawSource = readRepoFile('modules/tavern/app-src/features/draw/useTavernDrawController.ts');
    const contextSource = readRepoFile('modules/tavern/app-src/components/tavern-app-context.ts');
    const capsuleSource = readRepoFile('modules/tavern/app-src/components/chat/TavernDrawCapsule.vue');
    const conversationSource = readRepoFile('modules/tavern/app-src/components/chat/TavernConversationPanel.vue');
    const chatPageSource = readRepoFile('modules/tavern/app-src/components/chat/TavernChatPage.vue');
    const layoutCss = readRepoFile('modules/tavern/app-src/styles/chat/layout.css');
    const tavernHostSource = readRepoFile('modules/tavern/tavern.ts');
    const indexSource = readRepoFile('index.js');
    const novelDrawSource = readRepoFile('modules/draw/providers/novelai/novel-draw.js');
    const sdDrawSource = readRepoFile('modules/draw/providers/sd-webui/sd-draw.js');
    const comfyDrawSource = readRepoFile('modules/draw/providers/comfyui/comfy-draw.js');

    const capsuleBlock = extractCssBlock(layoutCss, '.tavern-chat.xb-page .tavern-draw-capsule');
    assert.match(capsuleBlock, /width:\s*74px;/);
    assert.match(capsuleBlock, /min-width:\s*74px;/);
    assert.match(capsuleBlock, /height:\s*34px;/);
    assert.match(capsuleBlock, /min-height:\s*34px;/);
    assert.match(capsuleBlock, /border-radius:\s*17px;/);
    assert.match(capsuleBlock, /border:\s*1px solid var\(--xb-rule\);/);
    assert.doesNotMatch(capsuleBlock, /--xb-stamp|rgba\(0,\s*0,\s*0,\s*0\.55\)|rgba\(32,\s*28,\s*24,\s*0\.72\)|rgba\(128,\s*38,\s*38/);
    assert.match(layoutCss, /\.tavern-chat\.xb-page \.tavern-draw-menu-button \{[\s\S]*width:\s*24px;[\s\S]*min-width:\s*24px;[\s\S]*height:\s*100%;/);
    assert.match(layoutCss, /\.tavern-chat\.xb-page \.tavern-draw-divider \{[\s\S]*width:\s*1px;[\s\S]*height:\s*12px;/);
    assert.match(layoutCss, /\.tavern-chat\.xb-page \.tavern-draw-layer-active \{[\s\S]*gap:\s*6px;[\s\S]*overflow:\s*hidden;[\s\S]*flex-wrap:\s*nowrap;[\s\S]*white-space:\s*nowrap;[\s\S]*padding:\s*0 7px;/);
    assert.match(layoutCss, /\.tavern-chat\.xb-page \.tavern-draw-status-icon \{[\s\S]*flex:\s*0 0 auto;/);
    assert.match(layoutCss, /\.tavern-chat\.xb-page \.tavern-draw-status-text \{[\s\S]*min-width:\s*0;[\s\S]*max-width:\s*none;[\s\S]*white-space:\s*nowrap;/);
    assert.doesNotMatch(layoutCss, /\.tavern-chat\.xb-page \.tavern-draw-status-text \{[\s\S]*max-width:\s*48px;/);
    assert.match(layoutCss, /\.tavern-draw-popover-layer\.tavern-draw-menu \{[\s\S]*width:\s*198px;/);
    assert.match(layoutCss, /\.tavern-draw-popover-layer \.tavern-draw-auto-toggle/);
    assert.match(layoutCss, /\.tavern-draw-popover-layer\.tavern-draw-detail,[\s\S]*\.tavern-draw-popover-layer\.tavern-draw-menu \{[\s\S]*z-index:\s*100120;/);
    assert.match(layoutCss, /@media \(max-width: 760px\) \{[\s\S]*\.tavern-chat\.xb-page \.tavern-draw-float\.tavern-draw-capsule-mobile,[\s\S]*width:\s*68px;[\s\S]*height:\s*30px;/);
    assert.doesNotMatch(layoutCss, /\.xb-os-shell\.theme-light \.tavern-chat\.xb-page \.tavern-draw-capsule[\s\S]*rgba\(32,\s*28,\s*24,\s*0\.72\)/);

    assert.match(capsuleSource, /<Teleport to="body">[\s\S]*class="tavern-draw-detail"[\s\S]*class="tavern-draw-menu"/);
    assert.match(capsuleSource, /function anchoredPopoverStyle\(width: number, height: number\): Record<string, string> \{[\s\S]*getBoundingClientRect\(\)[\s\S]*position: 'fixed'/);
    assert.match(capsuleSource, /class="tavern-draw-layer tavern-draw-layer-idle"[\s\S]*class="tavern-draw-layer tavern-draw-layer-active"/);
    assert.match(capsuleSource, /const capsuleStatusText = computed\(\(\) => compactCapsuleStatusText/);
    assert.match(capsuleSource, /function compactCapsuleStatusText/);
    assert.match(capsuleSource, /前方\\s\*\(\\d\+\)/);
    assert.match(capsuleSource, /return `\$\{ratio\[1\]\}\/\$\{ratio\[2\]\}`;/);
    assert.match(capsuleSource, /class="tavern-draw-status-text">\{\{ capsuleStatusText \}\}/);
    assert.doesNotMatch(capsuleSource, /class="tavern-draw-status-text">\{\{ statusText \}\}/);
    assert.match(capsuleSource, /class="tavern-draw-menu-button"[\s\S]*class="tavern-draw-arrow"[\s\S]*>▼</);
    assert.match(capsuleSource, />预设<[\s\S]*>尺寸<[\s\S]*>自动配图</);
    assert.match(capsuleSource, /class="tavern-draw-gear"[\s\S]*画图设置/);
    assert.match(capsuleSource, /async function handleActiveLayerClick\(\) \{[\s\S]*if \(activeLayerCanCancel\.value\) \{[\s\S]*await drawLatestAssistantMessage\(\);[\s\S]*detailPinned\.value = !detailPinned\.value;/);
    assert.doesNotMatch(capsuleSource, /class="tavern-draw-layer tavern-draw-layer-active"[\s\S]{0,260}@click="drawLatestAssistantMessage"/);
    assert.doesNotMatch(capsuleSource, /tavern-draw-settings|draw-open-settings/);

    assert.match(contextSource, /draw: TavernDrawContext;/);
    assert.match(contextSource, /export function useTavernDrawContext\(\): TavernDrawContext/);
    assert.match(drawSource, /drawLatestAssistantMessage: \(\) => Promise<void>;/);
    assert.match(drawSource, /openTavernDrawSettings: \(\) => Promise<void>;/);
    assert.match(drawSource, /refreshTavernDrawQuickSettings: \(\) => Promise<TavernDrawQuickSettings>;/);
    assert.match(drawSource, /tavernDrawQuickSettings: Ref<TavernDrawQuickSettings>;/);
    assert.match(drawSource, /updateTavernDrawQuickSettings: \(patch\?: Record<string, unknown>\) => Promise<void>;/);
    assert.match(drawSource, /tavernDrawCapsuleVisible: ComputedRef<boolean>;/);
    assert.match(drawSource, /const latestDrawableAssistantMessage = computed\(\(\) => findLatestDrawableAssistantMessage\(\)\);/);
    assert.match(drawSource, /function findLatestDrawableAssistantMessage\(\): TavernMessageRecord \| null \{[\s\S]*message\.role === 'assistant'[\s\S]*canDrawMessage\(message\)/);
    assert.match(drawSource, /async function drawLatestAssistantMessage\(\): Promise<void> \{[\s\S]*options\.showToast\('没有可配图的回复'[\s\S]*if \(isDrawingMessage\(message\)\) \{[\s\S]*await drawMessage\(message\);[\s\S]*options\.showToast\('画图模块初始化中'/);
    assert.match(drawSource, /async function openTavernDrawSettings\(\): Promise<void> \{[\s\S]*options\.requestHost\('xb-tavern:draw-open-settings'/);
    assert.match(drawSource, /async function refreshTavernDrawQuickSettings\(\): Promise<TavernDrawQuickSettings> \{[\s\S]*options\.requestHost\('xb-tavern:draw-quick-settings'/);
    assert.match(drawSource, /async function updateTavernDrawQuickSettings\(patch: Record<string, unknown> = \{\}\): Promise<void> \{[\s\S]*options\.requestHost\('xb-tavern:draw-update-quick-settings'/);
    assert.match(drawSource, /function applyTavernDrawStatus\(payload: Record<string, unknown> = \{\}\) \{[\s\S]*provider: String\(payload\.provider \|\| 'disabled'\)[\s\S]*ready: payload\.ready === true/);
    assert.match(appSource, /hostBridge\.addMessageHandler\(\(data\) => drawContext\.handleHostMessage\(data\)\);/);
    assert.match(appSource, /hostBridge\.postToHost\('xb-tavern:frame-ready'\);[\s\S]*void drawContext\.refreshTavernDrawStatus\(\);/);

    assert.match(conversationSource, /import TavernDrawCapsule from '\.\/TavernDrawCapsule\.vue';/);
    assert.match(conversationSource, /useTavernDrawContext/);
    assert.match(conversationSource, /<div class="chat-head-actions">[\s\S]*<TavernDrawCapsule \/>[\s\S]*class="contract-trigger"/);
    assert.match(chatPageSource, /import TavernDrawCapsule from '\.\/TavernDrawCapsule\.vue';/);
    assert.match(chatPageSource, /class="chat-mobile-action-group">[\s\S]*<TavernDrawCapsule[\s\S]*v-if="chatFocus === 'chat'"[\s\S]*mobile[\s\S]*\/>[\s\S]*class="chat-mobile-icon-button chat-mobile-utility-button"/);
    assert.doesNotMatch(`${appSource}\n${conversationSource}\n${chatPageSource}\n${capsuleSource}`, /nd-capsule|nd-floating|floating-panel/);

    assert.match(tavernHostSource, /case 'xb-tavern:draw-open-settings':[\s\S]*void handleDrawOpenSettings\(data\.payload \|\| \{\}\);/);
    assert.match(tavernHostSource, /case 'xb-tavern:draw-quick-settings':[\s\S]*void handleDrawQuickSettings\(data\.payload \|\| \{\}\);/);
    assert.match(tavernHostSource, /case 'xb-tavern:draw-update-quick-settings':[\s\S]*void handleDrawUpdateQuickSettings\(data\.payload \|\| \{\}\);/);
    assert.match(tavernHostSource, /refreshDrawStatus: \(\) => void;/);
    assert.match(tavernHostSource, /function refreshDrawStatus\(\): void \{[\s\S]*postToFrame\('xb-tavern:draw-status-changed', getDrawStatus\(\)\);[\s\S]*\}/);
    assert.match(tavernHostSource, /window\.xiaobaixTavern = \{[\s\S]*refreshDrawStatus,/);
    const openSettingsSource = tavernHostSource.match(/async function handleDrawOpenSettings\(payload: Record<string, unknown> = \{\}\): Promise<void> \{[\s\S]*?\n\}\n\nasync function handleDrawQuickSettings/)?.[0] || '';
    assert.ok(openSettingsSource);
    assert.match(openSettingsSource, /getDrawProviderSettingsFacade\(provider\)/);
    assert.match(openSettingsSource, /await settingsFacade\.openSettings\(\);/);
    assert.doesNotMatch(openSettingsSource, /closeTavern|xb-tavern:close|querySelector|nd-capsule/);
    assert.match(tavernHostSource, /getQuickSettings\?: \(\) => Record<string, unknown> \| Promise<Record<string, unknown>>;/);
    assert.match(tavernHostSource, /updateQuickSettings\?: \(patch: Record<string, unknown>\) => Record<string, unknown> \| Promise<Record<string, unknown>>;/);
    assert.match(tavernHostSource, /xiaobaixNovelDraw\?: DrawProviderSettingsFacade;/);
    assert.match(tavernHostSource, /xiaobaixSdDraw\?: DrawProviderSettingsFacade;/);
    assert.match(tavernHostSource, /xiaobaixComfyDraw\?: DrawProviderSettingsFacade;/);
    assert.match(tavernHostSource, /key === 'sdwebui' \|\| key === 'sd-webui' \|\| key === 'sd' \|\| key === 'stable-diffusion'/);
    assert.match(indexSource, /function notifyTavernDrawStatusChanged\(\) \{[\s\S]*window\.xiaobaixTavern\?\.refreshDrawStatus\?\.\(\);[\s\S]*\}/);
    assert.match(indexSource, /await cleanupDrawProvider\(prev\);[\s\S]*settings\.drawProvider = next;[\s\S]*try \{[\s\S]*await initActiveDrawProvider\(\);[\s\S]*\} finally \{[\s\S]*notifyTavernDrawStatusChanged\(\);[\s\S]*\}/);
    assert.match(indexSource, /settings\.drawProvider = 'disabled';[\s\S]*extension_settings\[EXT_ID\]\.drawProvider = 'disabled';[\s\S]*notifyTavernDrawStatusChanged\(\);/);

    [novelDrawSource, sdDrawSource, comfyDrawSource].forEach((source) => {
        assert.match(source, /getQuickSettings/);
        assert.match(source, /updateQuickSettings/);
        assert.match(source, /selectedPresetId/);
        assert.match(source, /selectedSize/);
        assert.match(source, /mode = patch\.auto === true \? 'auto' : 'manual'|settings\.mode = patch\.auto === true \? 'auto' : 'manual'/);
    });
    assert.match(novelDrawSource, /z-index:100002!important/);
    assert.match(sdDrawSource, /z-index:100002!important/);
    assert.match(comfyDrawSource, /z-index:100002!important/);
});

test('tavern memory editor actions live outside the app controller', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const memoryWorkspaceSource = readRepoFile('modules/tavern/app-src/components/chat/useTavernMemoryWorkspace.ts');
    const contextSource = readRepoFile('modules/tavern/app-src/components/tavern-app-context.ts');
    assert.match(appSource, /useTavernMemoryWorkspace/);
    assert.doesNotMatch(appSource, /async function saveSelectedMemoryFile/);
    assert.doesNotMatch(appSource, /async function loadSelectedMemoryFileRecord/);
    assert.doesNotMatch(appSource, /function enterMemoryEditMode/);
    assert.match(memoryWorkspaceSource, /async function saveSelectedMemoryFile/);
    assert.match(memoryWorkspaceSource, /getLatestTavernUserMessageAtOrBefore\([\s\S]*Number\.POSITIVE_INFINITY[\s\S]*writeTavernMemoryFile\(options\.selectedSessionId\.value, file\.path[\s\S]*await options\.commitUserAcceptedState\(options\.selectedSessionId\.value, userAcceptedAnchorOrder\);[\s\S]*await options\.refreshRecords\(options\.selectedSessionId\.value\);/);
    assert.match(memoryWorkspaceSource, /async function loadSelectedMemoryFileRecord/);
    assert.match(memoryWorkspaceSource, /function enterMemoryEditMode/);
    assert.match(contextSource, /commitAcceptedState: TavernCommand<\[sessionId\?: string\], Promise<void>>/);
    assert.match(contextSource, /commitUserAcceptedState: TavernCommand<\[sessionId\?: string, userOrder\?: number\], Promise<void>>/);
    assert.match(appSource, /async function commitAcceptedState\(sessionId = selectedSessionId\.value\) \{[\s\S]*await saveAcceptedStateSnapshot\(id\);[\s\S]*\}/);
    assert.match(appSource, /async function commitUserAcceptedState\(sessionId = selectedSessionId\.value, userOrder\?: number\) \{[\s\S]*const explicitOrder = Number\(userOrder\);[\s\S]*getLatestTavernUserMessageAtOrBefore\(id, Number\.POSITIVE_INFINITY\)[\s\S]*await saveAcceptedStateSnapshot\(id, latestUserOrder \?\? -1\);[\s\S]*\}/);
    assert.match(appSource, /commitAcceptedState,/);
    assert.match(appSource, /commitUserAcceptedState,/);
});

test('tavern streaming action-check UI renders from live runtime events and keeps dark card styling aligned', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const chatRunSource = readRepoFile('modules/tavern/app-src/features/chat-run/useTavernChatRunController.ts');
    const sessionSource = readRepoFile('modules/tavern/app-src/features/session/useTavernSessionController.ts');
    const scrollPaneSource = readRepoFile('modules/tavern/app-src/components/chat/useTavernScrollPane.ts');
    const chatPageSource = readRepoFile('modules/tavern/app-src/components/chat/TavernChatPage.vue');
    const conversationPanelSource = readRepoFile('modules/tavern/app-src/components/chat/TavernConversationPanel.vue');
    const assistantBubbleSource = readRepoFile('modules/tavern/app-src/components/chat/TavernAssistantBubble.vue');
    const chatTimelineSource = readRepoFile('modules/tavern/app-src/components/chat/chat-timeline.ts');
    const messageMarkdownSource = readRepoFile('modules/tavern/app-src/components/chat/TavernMessageMarkdown.vue');
    const patchMarkdownSource = readRepoFile('modules/tavern/app-src/components/chat/patch-markdown-root.ts');
    const managerPanelSource = readRepoFile('modules/tavern/app-src/components/chat/TavernManagerPanel.vue');
    const markdownToolsSource = readRepoFile('modules/tavern/app-src/components/chat/useTavernMarkdownTools.ts');
    const workspacePanelSource = readRepoFile('modules/tavern/app-src/components/chat/TavernWorkspacePanel.vue');
    const contractModalSource = readRepoFile('modules/tavern/app-src/components/chat/TavernContractModal.vue');
    const sessionContractSource = readRepoFile('modules/tavern/shared/session-contract.ts');
    const contextSource = readRepoFile('modules/tavern/app-src/components/tavern-app-context.ts');
    const cssSource = readRepoFile('modules/tavern/app-src/styles/chat/messages.css');
    const markdownCssSource = readRepoFile('modules/tavern/app-src/styles/chat/markdown.css');
    const appBaseCss = readRepoFile('modules/tavern/app-src/styles/base.css');
    const layoutCss = readRepoFile('modules/tavern/app-src/styles/chat/layout.css');
    const composeCss = readRepoFile('modules/tavern/app-src/styles/chat/compose.css');
    const memoryCss = readRepoFile('modules/tavern/app-src/styles/chat/memory-editor.css');
    const mapCss = readRepoFile('modules/tavern/app-src/styles/chat/map.css');
    const managerCss = readRepoFile('modules/tavern/app-src/styles/chat/manager.css');
    const chatCss = readRepoFile('modules/tavern/app-src/styles/chat.css');
    const memoryEditorSource = readRepoFile('modules/tavern/app-src/components/TavernMemoryEditor.vue');
    assert.match(conversationPanelSource, /import TavernAssistantBubble from '\.\/TavernAssistantBubble\.vue';/);
    assert.match(conversationPanelSource, /import TavernMessageMarkdown from '\.\/TavernMessageMarkdown\.vue';/);
    assert.match(conversationPanelSource, /<TavernMessageMarkdown[\s\S]*:html="renderRoleplayMarkdown\(displayMessageContent\(message\)\)"[\s\S]*phase="settled"/);
    assert.match(assistantBubbleSource, /:html="renderHtml"[\s\S]*:phase="streaming \? 'live' : 'settled'"[\s\S]*:signature="renderState\.signature"/);
    assert.match(assistantBubbleSource, /:action-check-groups="renderState\.actionCheckGroups || undefined"/);
    assert.doesNotMatch(conversationPanelSource, /v-html="renderRoleplayMarkdown\(liveAssistantRenderState\.text\)"/);
    assert.match(messageMarkdownSource, /if \(html !== renderedHtml \|\| props\.signature !== renderedSignature \|\| props\.phase !== renderedPhase\) \{[\s\S]*releaseMarkdownRootResources\(root\)[\s\S]*patchTavernMarkdownRoot\(root, html\)[\s\S]*renderedSignature = props\.signature/);
    assert.match(messageMarkdownSource, /chat\.enhanceMarkdownRoot\(root, \{ live: props\.phase === 'live' \}\);/);
    assert.match(messageMarkdownSource, /onBeforeUnmount\([\s\S]*releaseMarkdownRootResources\(root\)/);
    assert.match(patchMarkdownSource, /if \(source\.isEqualNode\(target\)\) \{return;\}/);
    assert.match(patchMarkdownSource, /patchChildren\(root, template\.content\);/);
    assert.doesNotMatch(patchMarkdownSource, /Intl|Segmenter|SHOW_TEXT|xb-tavern-stream-segment/);
    assert.doesNotMatch(assistantBubbleSource, /chat\.runtimeActionCheckEvents\.value/);
    assert.match(markdownToolsSource, /function enhanceChatMarkdown\(\)[\s\S]*node\.closest\('\[data-chat-streaming="true"\]'\)[\s\S]*enhanceStableMarkdownNode\(node\);/);
    assert.match(contextSource, /runtimeUserMessageVisible: Ref<boolean>/);
    assert.match(contextSource, /runtimeAssistantMessageKey: Ref<string>/);
    assert.match(appSource, /const chatRunState = createTavernChatRunState\(\);/);
    assert.match(chatRunSource, /runtimeUserMessageVisible: ref\(false\)/);
    assert.match(chatRunSource, /runtimeAssistantMessageKey: ref\(''\)/);
    assert.doesNotMatch(chatRunSource, /runtimeFinalizedAssistantMessage/);
    assert.match(appSource, /const runtimeActionCheckSignature = computed\(\(\) => runtimeActionCheckEvents\.value[\s\S]*event\.character \|\| ''[\s\S]*event\.stat/);
    assert.match(appSource, /function actionCheckEventsCacheSignature\(events: TavernActionCheckRuntimeEvent\[\] = \[\]\): string \{[\s\S]*event\.character \|\| ''[\s\S]*event\.stat/);
    assert.doesNotMatch(chatPageSource, /runtimeActionCheckScrollSignature|streamingReadingLockSignature/);
    assert.match(markdownToolsSource, /const stakes = String\(event\.stakes \|\| ''\)\.trim\(\);/);
    assert.match(markdownToolsSource, /stakes \? `风险：\$\{stakes\}。` : ''/);
    assert.match(markdownToolsSource, /function actionCheckDifficultyLabel\(event: TavernActionCheckRuntimeEvent\)[\s\S]*event\.difficultyLabel === 'hard'[\s\S]*return '困难';/);
    assert.match(markdownToolsSource, /function actionCheckTitle\(event: TavernActionCheckRuntimeEvent\)[\s\S]*const character = String\(event\.character \|\| ''\)\.trim\(\)[\s\S]*event\.mode === 'statusGauge'[\s\S]*`\$\{stat\} \$\{statValue\}`[\s\S]*return character \? `\$\{character\} \$\{statLabel\}` : statLabel/);
    assert.match(markdownToolsSource, /label: '难度',[\s\S]*value: isStatusGauge \? actionCheckDifficultyLabel\(event\) : String\(event\.difficulty\)/);
    assert.doesNotMatch(markdownToolsSource, /label: hasThreshold \? '阈值' : '难度'/);
    assert.match(markdownToolsSource, /if \(event\.stakes\) \{[\s\S]*className = 'action-check-card-stakes'[\s\S]*textContent = event\.stakes/);
    assert.match(chatRunSource, /function clearRuntimeAssistantLiveState\(\) \{[\s\S]*state\.runtimeText\.value = '';[\s\S]*state\.runtimeThoughts\.value = \[\];[\s\S]*state\.runtimeActionCheckEvents\.value = \[\];[\s\S]*state\.runtimeUserMessageVisible\.value = false;/);
    assert.match(chatRunSource, /state\.runtimeUserMessageVisible\.value = false;[\s\S]*state\.runtimeProvider\.value = ''/);
    assert.match(appSource, /function upsertLoadedSessionMessage\(message: TavernMessageRecord\) \{[\s\S]*sessionController\.upsertLoadedSessionMessage\(message\);/);
    assert.match(sessionSource, /function upsertLoadedSessionMessage\(message: TavernMessageRecord\) \{[\s\S]*messageOrder >= tailOrder[\s\S]*state\.loadedSessionMessages\.value = \[\.\.\.currentMessages, message\];/);
    assert.match(appSource, /function pruneLoadedSessionMessagesFromOrder\(sessionId = '', fromOrder = Number\.POSITIVE_INFINITY\): number \{[\s\S]*return sessionController\.pruneLoadedSessionMessagesFromOrder\(sessionId, fromOrder\);/);
    assert.match(sessionSource, /function pruneLoadedSessionMessagesFromOrder\(sessionId = '', fromOrder = Number\.POSITIVE_INFINITY\): number \{[\s\S]*Number\(message\.order\) < firstRemovedOrder[\s\S]*state\.loadedSessionMessages\.value = remainingMessages;[\s\S]*state\.selectedSessionLatestAssistantOrder\.value = remainingMessages/);
    assert.match(sessionSource, /function compactLoadedSessionMessageWindow\(reservedTailSlots = 0\): number \{[\s\S]*const keepCount = Math\.max\(0, limit - reserved\);[\s\S]*currentMessages\.slice\(-keepCount\)[\s\S]*updateLoadedSessionMessageBounds\(nextMessages\);/);
    assert.match(appSource, /async function resetChatMessageWindowForUserTurn\(options: \{ rerollLatestAssistant\?: boolean \} = \{\}\) \{[\s\S]*selectedSessionMessageWindowOffsetFromEnd\.value !== 0[\s\S]*sessionController\.suppressNextChatWindowLimitReload\(\);[\s\S]*resetChatMessageWindowState\(\);[\s\S]*options\.rerollLatestAssistant !== true[\s\S]*await loadSelectedSessionMessageWindow/);
    assert.doesNotMatch(appSource, /\[\.\.\.loadedSessionMessages\.value, message\]\.sort\(\(left, right\) => left\.order - right\.order\)/);
    assert.doesNotMatch(appSource, /let suppressNextChatWindowLimitReload = false;/);
    assert.match(sessionSource, /let suppressNextChatWindowLimitReloadPending = false;/);
    assert.doesNotMatch(chatRunSource, /followRunAtBottom|setSuppressNextChatWindowLimitReload|options\.chatAutoScroll/);
    assert.match(chatRunSource, /const isRerollRun = runOptions\.rerollLatestAssistant === true;[\s\S]*await options\.resetChatMessageWindowForUserTurn\(\{ rerollLatestAssistant: isRerollRun \}\);[\s\S]*options\.compactLoadedSessionMessageWindow\(isRerollRun \? 1 : 2\);[\s\S]*onLatestAssistantRerollPrepared:[\s\S]*if \(previousAssistantMessage\)[\s\S]*options\.pruneLoadedSessionMessagesFromOrder/);
    assert.doesNotMatch(chatRunSource, /onLatestAssistantRerollPrepared:[\s\S]{0,700}loadSelectedSessionMessageWindow/);
    assert.match(chatRunSource, /catch \(error\) \{[\s\S]*if \(isRerollRun && options\.selectedSessionId\.value\)[\s\S]*loadSelectedSessionMessageWindow/);
    assert.match(appSource, /watch\(\[\s*\(\) => chatMessageWindowLimit\.value,[\s\S]*\(\) => selectedSessionMessageWindowOffsetFromEnd\.value,[\s\S]*sessionController\.handleChatMessageWindowStateChanged\(\);/);
    assert.match(sessionSource, /function handleChatMessageWindowStateChanged\(\) \{[\s\S]*if \(suppressNextChatWindowLimitReloadPending\) \{[\s\S]*suppressNextChatWindowLimitReloadPending = false;[\s\S]*return;[\s\S]*void loadSelectedSessionMessageWindow\(\);/);
    assert.doesNotMatch(chatRunSource, /options\.selectedSessionId\.value\s*=/);
    assert.doesNotMatch(appSource, /scrollChatToBottom/);
    assert.doesNotMatch(chatRunSource, /scrollChatToBottom|options\.scrollChatToBottom/);
    assert.match(appSource, /const placeChatAtBottomForNewContext = chatScrollPane\.placeAtBottomForNewContext;/);
    assert.doesNotMatch(appSource, /followChatStreamToBottomIfAtBottom/);
    assert.match(appSource, /const jumpChatToBottom = chatScrollPane\.jumpToBottom;/);
    assert.match(conversationPanelSource, /@bottom="jumpChatToBottom\(\{ collapseWindow: true, revealHelpers: true \}\)"/);
    assert.match(appSource, /watch\(\[\s*runtimeDisplayRenderProjection,\s*runtimeDisplayThoughtBlocks,[\s\S]*updateChatScrollButtons\(\);/);
    assert.doesNotMatch(appSource, /runtimeDisplayThoughtBlocks,[\s\S]{0,240}enhanceLiveChatMarkdown/);
    assert.doesNotMatch(appSource, /watch\(\[\s*\(\) => runtimeText\.value,[\s\S]*followStreamToBottomIfAtBottom|followChatStreamToBottomIfAtBottom/);
    assert.match(sessionSource, /placeChatAtBottomForNewContext: \(\) => void;/);
    assert.match(appSource, /useTavernSessionController\(sessionState, \{[\s\S]*placeChatAtBottomForNewContext: \(\) => placeChatAtBottomForNewContext\(\),/);
    assert.match(chatRunSource, /onUserMessageSaved:[\s\S]*options\.setSelectedSessionId\(sessionId\);[\s\S]*onAssistantMessageSaved:[\s\S]*options\.setSelectedSessionId\(sessionId\);[\s\S]*options\.setSelectedSessionId\(result\.sessionId\);/);
    assert.match(chatRunSource, /catch \(error\) \{[\s\S]*clearRuntimeAssistantLiveState\(\);[\s\S]*if \(isRerollRun && options\.selectedSessionId\.value\) \{[\s\S]*await options\.loadSelectedSessionMessageWindow\(\{ sessionId: options\.selectedSessionId\.value \}\);/);
    const userSavedCallback = chatRunSource.match(/onUserMessageSaved: async \(sessionId, message\) => \{[\s\S]*?\n[ ]{16}\},\n[ ]{16}onAssistantMessageSaved/);
    assert.ok(userSavedCallback);
    assert.match(userSavedCallback[0], /state\.runtimeAssistantMessageKey\.value = `\$\{message\.sessionId\}:\$\{Number\(message\.order\) \+ 1\}`;[\s\S]*options\.upsertLoadedSessionMessage\(message\);[\s\S]*options\.touchSessionLocally\(sessionId, message\.createdAt\);[\s\S]*state\.runtimePendingUserMessage\.value = '';[\s\S]*await options\.persistSelectedSessionId\(sessionId\)/);
    assert.doesNotMatch(userSavedCallback[0], /state\.currentUserMessage\.value = ''/);
    assert.doesNotMatch(userSavedCallback[0], /refreshSessions\(\)/);
    const assistantSavedCallback = chatRunSource.match(/onAssistantMessageSaved: async \(sessionId, message\) => \{[\s\S]*?\n[ ]{16}\},\n[ ]{16}onManagerRunSaved/);
    assert.ok(assistantSavedCallback);
    assert.match(assistantSavedCallback[0], /flushRuntimeStreamSnapshotNow\(\);[\s\S]*await options\.prepareAssistantMessageDisplay\(message\);[\s\S]*options\.touchSessionLocally\(sessionId, message\.createdAt\);[\s\S]*options\.preserveDetachedChatScroll\(\(\) => \{[\s\S]*options\.upsertLoadedSessionMessage\(message\);[\s\S]*clearRuntimeAssistantLiveState\(\);/);
    const clearLiveStateBlock = chatRunSource.match(/function clearRuntimeAssistantLiveState\(\) \{[\s\S]*?\n[ ]{4}\}/);
    assert.ok(clearLiveStateBlock);
    assert.match(clearLiveStateBlock[0], /state\.runtimeAssistantMessageKey\.value = '';/);
    assert.doesNotMatch(appSource, /clearRuntimeFinalizedAssistantMessageKey|runtimeFinalizedAssistantMessageKey/);
    const nonSelectedDeleteBlock = sessionSource.match(/if \(!isDeletingSelectedSession\) \{[\s\S]*?\n[ ]{8}\}/);
    assert.ok(nonSelectedDeleteBlock);
    assert.match(nonSelectedDeleteBlock[0], /await refreshSessions\(\);\s*return;/);
    assert.doesNotMatch(nonSelectedDeleteBlock[0], /placeChatAtBottomForNewContext|activeView|chatFocus/);
    const chatArchiveWindowWatcher = conversationPanelSource.match(/watch\(\s*\(\) => `\$\{selectedSessionId\.value\}:\$\{chatMessageWindow\.value\.startIndex\}:\$\{chatMessageWindow\.value\.visibleCount\}`,[\s\S]*?\n\);/);
    assert.ok(chatArchiveWindowWatcher);
    assert.doesNotMatch(chatArchiveWindowWatcher[0], /closeSessionArchive/);
    assert.doesNotMatch(assistantSavedCallback[0], /chatAutoScroll\.value === false/);
    assert.doesNotMatch(assistantSavedCallback[0], /scrollChatToBottom|placeChatAtBottomForNewContext|followChatStreamToBottomIfAtBottom|jumpChatToBottom/);
    assert.doesNotMatch(assistantSavedCallback[0], /refreshSessions\(\)/);
    assert.match(chatRunSource, /options\.setSelectedSessionId\(result\.sessionId\);[\s\S]*flushRuntimeStreamSnapshotNow\(\);[\s\S]*clearRuntimeAssistantLiveState\(\);[\s\S]*await options\.refreshSessionRecord\(result\.sessionId\);\s*options\.updateChatScrollButtons\(\);/);
    assert.doesNotMatch(chatRunSource, /refreshSessions/);
    assert.match(appSource, /async function refreshSessionRecord\(sessionId = ''\) \{[\s\S]*await getTavernSession\(id\);[\s\S]*sessionController\.updateSessionRecord\(session\);/);
    assert.doesNotMatch(chatRunSource, /resolveDeferredAssistantCommit|flushDeferredAssistantCommit|hasDeferredAssistantCommit|TavernDeferredAssistantResolutionOptions/);
    assert.match(appSource, /async function saveEditMessage\(message: TavernMessageRecord[\s\S]*await updateTavernMessage[\s\S]*if \(!updated\) \{[\s\S]*return;[\s\S]*if \(selectedSessionId\.value === message\.sessionId\) \{[\s\S]*await loadSelectedSessionMessageWindow/);
    assert.doesNotMatch(chatRunSource, /await options\.refreshSessions\(\);\s*await options\.refreshManagerRecords\(result\.sessionId\);/);
    assert.doesNotMatch(appSource, /onReturnToBottom|flushDeferredChatDomCommits|resolveDeferredAssistantCommit/);
    assert.match(conversationPanelSource, /const liveAssistantCanRender = computed\(\(\) => \([\s\S]*isRunning\.value && runtimeUserMessageVisible\.value && !!runtimeAssistantMessageKey\.value[\s\S]*\)\);/);
    assert.match(conversationPanelSource, /const chatTimelineItems = computed\(\(\) => buildTavernChatTimeline\(\{[\s\S]*messages: visibleChatMessages\.value,[\s\S]*messageKey,[\s\S]*liveAssistantVisible: liveAssistantCanRender\.value,[\s\S]*liveAssistantKey: runtimeAssistantMessageKey\.value,/);
    assert.match(chatTimelineSource, /if \(message\.role !== 'assistant'\) \{[\s\S]*return \{ kind: 'persisted', key, message \};[\s\S]*const streaming = hasLiveAssistant && key === liveAssistantKey;[\s\S]*return \{ kind: 'assistant', key, message, streaming \};/);
    assert.match(chatTimelineSource, /if \(hasLiveAssistant && !liveAssistantAlreadyPersisted\) \{[\s\S]*kind: 'assistant',[\s\S]*key: liveAssistantKey,[\s\S]*message: null,[\s\S]*streaming: true,/);
    assert.doesNotMatch(conversationPanelSource, /chatMessageItemDomKey/);
    assert.doesNotMatch(conversationPanelSource, /finalizedAssistantPresentation|runtimeFinalizedAssistantMessageKey|runtimeAssistantMessageItemDomKey/);
    assert.match(appSource, /async function prepareAssistantMessageDisplay\(message: TavernMessageRecord\)[\s\S]*messageDisplayProjectionSource\(message\)\.request[\s\S]*messageThoughtDisplaySources\(message\)[\s\S]*await Promise\.all/);
    assert.match(appSource, /const inFlightDisplayRegexRequests = new Map<string, Promise<void>>\(\);/);
    assert.match(appSource, /function resolveDisplayRegexText\(input: DisplayRegexTextRequest\): Promise<void> \{[\s\S]*const existing = inFlightDisplayRegexRequests\.get\(input\.key\);[\s\S]*if \(existing\) \{return existing;\}/);
    assert.doesNotMatch(appSource, /pendingDisplayRegexKeys/);
    assert.match(assistantBubbleSource, /const displayThoughts = computed\(\(\) => \{[\s\S]*useRuntimePresentation\.value \|\| !message[\s\S]*chat\.displayRuntimeThoughtBlocks\(\)[\s\S]*chat\.displayMessageThoughtBlocks\(message\)/);
    assert.match(assistantBubbleSource, /class="chat-bubble chat-bubble-stable from-assistant"/);
    assert.match(assistantBubbleSource, /:data-chat-streaming="streaming \? 'true' : undefined"/);
    assert.match(assistantBubbleSource, /v-if="!isEditing && contentVisible"[\s\S]*v-show="!isEditing && !contentVisible"/);
    assert.doesNotMatch(assistantBubbleSource, /hasBeenStreaming|animated=/);
    assert.match(assistantBubbleSource, /v-show="!isEditing && displayThoughts\.length"/);
    assert.match(conversationPanelSource, /v-for="item in chatTimelineItems"[\s\S]*:key="item\.key"[\s\S]*class="chat-message-item"[\s\S]*<TavernAssistantBubble[\s\S]*v-if="item\.kind === 'assistant'"[\s\S]*:message="item\.message"[\s\S]*:streaming="item\.streaming"[\s\S]*:anchor-key="item\.key"/);
    assert.doesNotMatch(conversationPanelSource, /v-if="liveAssistantCanRender"/);
    assert.doesNotMatch(chatPageSource, /watch\(streamingReadingLockSignature|watch\(chatScrollAnchorSignature|restoreChatScrollSnapshot|captureChatScrollSnapshot|pendingChatScrollSnapshot|pendingStreamingChatScrollSnapshot/);
    assert.match(scrollPaneSource, /const contentRef = ref<HTMLElement \| null>\(null\);/);
    assert.match(scrollPaneSource, /contentResizeObserver = new ResizeObserver\(\(\) => \{[\s\S]*handleContentChanged\(\);[\s\S]*\}\);/);
    assert.match(scrollPaneSource, /function handleContentChanged\(\) \{[\s\S]*if \(applyPrependCompensation\(\)\) \{return;\}[\s\S]*if \(autoScroll\.value\) \{[\s\S]*stickToBottom\(\);[\s\S]*return;[\s\S]*\}[\s\S]*updateScrollButtons\(\);/);
    assert.match(scrollPaneSource, /function applyPrependCompensation\(\) \{[\s\S]*const delta = Number\(node\.scrollHeight \|\| 0\) - snapshot\.scrollHeight;[\s\S]*node\.scrollTop = Math\.max\(0, snapshot\.scrollTop \+ delta\);/);
    assert.match(conversationPanelSource, /:ref="setChatScrollContentRef"[\s\S]*class="chat-scroll-content"/);
    assert.match(chatPageSource, /watch\(managerScrollAnchorSignature, \(\) => \{[\s\S]*pendingManagerScrollSnapshot = managerPaneVisible\.value[\s\S]*captureElementScrollState\(managerScrollRef\.value,[\s\S]*\}, \{ flush: 'sync' \}\);/);
    assert.match(chatPageSource, /watch\(managerScrollAnchorSignature, \(\) => \{[\s\S]*restoreElementScrollState\(managerScrollRef\.value, pendingManagerScrollSnapshot,[\s\S]*preserveScrollTop: true,[\s\S]*\}, \{ flush: 'post' \}\);/);
    assert.doesNotMatch(chatPageSource, /forceBottom|defaultToBottom|shouldAutoScrollChat|shouldAutoScrollManager/);
    assert.doesNotMatch(chatPageSource, /onBeforeUpdate|onUpdated|chatScrollAnchorDirty|managerScrollAnchorDirty/);
    assert.doesNotMatch(appSource, /restoreDetachedChatScrollAfterMarkdown|preserveDetachedChatScrollDuringMarkdown|chatScrollAnchorConfig/);
    assert.doesNotMatch(appSource, /runWithoutScrollPreservation/);
    assert.match(appSource, /function preserveChatViewportDuringMutation<T>\(mutation: \(\) => T\): T \{[\s\S]*return chatScrollPane\.preserveViewportDuringMutation\(mutation\);[\s\S]*\}/);
    assert.match(appSource, /preserveChatScroll: preserveChatViewportDuringMutation/);
    assert.match(appSource, /preserveDetachedChatScroll: preserveChatViewportDuringMutation/);
    assert.match(scrollPaneSource, /function preserveViewportDuringMutation<T>\(mutation: \(\) => T\): T \{[\s\S]*const snapshot = captureViewportPreservation\(\);[\s\S]*scheduleViewportPreservation\(snapshot\);[\s\S]*\}/);
    assert.doesNotMatch(conversationPanelSource, /v-if="isRunning && (?:!?)liveAssistantVisible"/);
    assert.match(conversationPanelSource, /useTavernMediaQuery\('\(max-width: 760px\)'\)/);
    assert.match(conversationPanelSource, /@click="handleChatMainClick"/);
    assert.match(conversationPanelSource, /function toggleMessageActionTray\(message: TavernMessageRecord, event\?: MouseEvent\) \{[\s\S]*const key = messageKey\(message\);[\s\S]*activeMessageActionsKey\.value = activeMessageActionsKey\.value === key \? '' : key;/);
    assert.match(conversationPanelSource, /'is-action-tray-open': isMessageActionTrayOpen\(message\)/);
    assert.match(conversationPanelSource, /@click\.stop="toggleMessageActionTray\(message, \$event\)"/);
    assert.match(conversationPanelSource, /class="bubble-identity"[\s\S]*class="bubble-nameplate"[\s\S]*class="message-floor-label"[\s\S]*class="bubble-time-tag"[\s\S]*v-if="!isEditingMessage\(message\)"[\s\S]*class="message-actions"/);
    assert.match(conversationPanelSource, /class="message-actions"[\s\S]*isDrawingMessage\(message\) \? '■' : '🎨'[\s\S]*@click="copyMessage\(message\)"[\s\S]*actionFeedback\(message, 'copy'\) === 'success' \? '✓' : actionFeedback\(message, 'copy'\) === 'error' \? '!' : '⧉'[\s\S]*<svg[\s\S]*viewBox="0 0 24 24"/);
    assert.match(conversationPanelSource, /<\/div>\s*<div\s+v-for="\(\s*event, eventIndex\s*\) in \(message\.role === 'user'/);
    assert.doesNotMatch(conversationPanelSource, /inline-runtime-event/);
    assert.doesNotMatch(cssSource, /\.chat-bubble \.chat-runtime-event/);
    assert.match(cssSource, /\.tavern-chat\.xb-page \.chat-message-item \{[\s\S]*display: contents;/);
    assert.match(cssSource, /\.bubble-identity \{[\s\S]*display: grid;[\s\S]*justify-items: start;/);
    assert.match(cssSource, /\.chat-bubble\.pending-user \{[\s\S]*contain: layout style;/);
    assert.match(cssSource, /\.chat-bubble\.chat-bubble-stable \{\s*contain: layout style;\s*\}/);
    assert.match(cssSource, /\.chat-bubble\.chat-bubble-stable\.thinking \{[\s\S]*border-left-color: var\(--xb-cyan\);/);
    assert.doesNotMatch(cssSource, /\.chat-bubble\.streaming/);
    assert.doesNotMatch(markdownCssSource, /xb-tavern-stream-segment|xb-tavern-stream-fade-in/);
    assert.doesNotMatch(cssSource, /\.chat-bubble\.(?:pending-user|streaming) \{[\s\S]*contain: layout style paint;/);
    assert.match(cssSource, /\.chat-bubble>\.message-actions \{[\s\S]*position: absolute;[\s\S]*top: -1px;[\s\S]*right: -1px;[\s\S]*border-radius: 0 10px 0 8px;[\s\S]*opacity: 0;/);
    assert.match(cssSource, /\.bubble-meta-line \{[\s\S]*display: inline-flex;[\s\S]*gap: 6px;/);
    assert.match(cssSource, /\.message-floor-label \{[\s\S]*padding: 3px 8px;/);
    assert.match(cssSource, /\.chat-bubble>\.message-actions button \{[\s\S]*width: 30px;[\s\S]*min-width: 30px;[\s\S]*height: 30px;[\s\S]*min-height: 30px;[\s\S]*border: 0;[\s\S]*padding: 0;/);
    assert.match(cssSource, /@media \(max-width: 760px\) \{[\s\S]*\.chat-bubble>\.message-actions \{[\s\S]*opacity: 0;[\s\S]*pointer-events: none;[\s\S]*\.chat-bubble\.is-action-tray-open>\.message-actions[\s\S]*opacity: 1;[\s\S]*pointer-events: auto;/);
    assert.doesNotMatch(cssSource, /\.message-actions \{[\s\S]*border-top: 1px solid rgba\(120, 112, 98, 0\.16\);/);
    assert.doesNotMatch(cssSource, /\.message-actions \{[\s\S]*border-bottom: 1px solid rgba\(120, 112, 98, 0\.14\);/);
    assert.match(cssSource, /\.tavern-chat\.xb-page \.chat-scroll \{[\s\S]*overflow: auto;[\s\S]*overflow-anchor: none;[\s\S]*scrollbar-width: none;[\s\S]*-ms-overflow-style: none;/);
    assert.match(cssSource, /\.tavern-chat\.xb-page \.chat-scroll \{[\s\S]*background: var\(--xb-chat-scroll-bg\);/);
    assert.doesNotMatch(cssSource, /\.tavern-chat\.xb-page \.chat-scroll \{[\s\S]*repeating-linear-gradient/);
    assert.match(cssSource, /\.tavern-chat\.xb-page \.chat-scroll::-webkit-scrollbar \{[\s\S]*width: 0;[\s\S]*height: 0;/);
    const chatComposeTextareaBlock = conversationPanelSource.match(/<textarea[\s\S]*?v-model="currentUserMessage"[\s\S]*?\/>/);
    assert.ok(chatComposeTextareaBlock);
    assert.match(chatComposeTextareaBlock[0], /rows="1"/);
    assert.doesNotMatch(chatComposeTextareaBlock[0], /:disabled="isRunning"/);
    assert.match(conversationPanelSource, /:aria-label="isCancellingRun \? '正在停止' : isRunning \? '停止' : '发送'"/);
    assert.match(appSource, /function handleComposeKeydown\(event: KeyboardEvent\) \{[\s\S]*if \(isRunning\.value \|\| isPhoneSendingForSession\(\)\) \{return;\}[\s\S]*event\.preventDefault\(\);[\s\S]*void runOnce\(\);/);
    assert.match(contextSource, /createNewChatSession: TavernCommand<\[\], Promise<void>>/);
    assert.match(appSource, /async function createNewChatSession\(\) \{[\s\S]*resolveRuntimeContextForSession\(selectedSessionId\.value\)[\s\S]*resetSessionPreviewState\(\);[\s\S]*await createSessionAndOpenChat\(\{ contextSnapshot: snapshotContext \}\);/);
    assert.doesNotMatch(chatCss, /sidebar\.css/);
    assert.doesNotMatch(chatPageSource, /TavernChatSidebar|chatSidePanel|shouldMountChatDirectory|openMobileSessionsPanel|mobileChatPanel = ref<'none' \| 'directory'|is-mobile-directory-open/);
    assert.doesNotMatch(appSource, /CHAT_SIDEBAR|chatSidebar|chatSidePanel|ChatSidePanel/);
    assert.doesNotMatch(contextSource, /CHAT_SIDEBAR|chatSidebar|chatSidePanel/);
    assert.match(layoutCss, /\.tavern-chat\.xb-page,[\s\S]*grid-template-columns: 236px minmax\(520px, 0\.98fr\) minmax\(460px, 1\.02fr\);/);
    assert.match(layoutCss, /\.tavern-chat\.xb-page \.chat-character-sidebar \{[\s\S]*overflow: hidden auto;[\s\S]*border-right: 1px solid var\(--xb-line\);/);
    assert.match(layoutCss, /@media \(max-width: 1220px\) \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) minmax\(0, 0\.86fr\);/);
    assert.doesNotMatch(layoutCss, /@media \(max-width: 980px\) \{[\s\S]*\.chat-head-actions button:last-child \{[\s\S]*display: none;/);
    assert.match(layoutCss, /\.chat-head \{[\s\S]*justify-content: space-between;/);
    assert.match(conversationPanelSource, /<header class="chat-head">[\s\S]*class="chat-head-main"[\s\S]*class="xb-workspace-controller chat-layout-controller"[\s\S]*chatLayout === 'chat'[\s\S]*chatLayout === 'balanced'[\s\S]*chatLayout === 'editor'[\s\S]*class="chat-head-actions"/);
    assert.match(chatPageSource, /class="chat-mobile-context-row"[\s\S]*title="地图"[\s\S]*>\s*地图\s*<\/button>[\s\S]*title="记忆"[\s\S]*>\s*记忆\s*<\/button>[\s\S]*title="档案"[\s\S]*>\s*档案\s*<\/button>/);
    assert.doesNotMatch(chatPageSource, /📓 记忆|🧭 事件|📋 档案/);
    assert.doesNotMatch(conversationPanelSource, /title="事件"/);
    assert.match(contractModalSource, /契约[\s\S]*玩家 — 代理人誓约[\s\S]*在故事里，定义你的代理人被允许做什么。[\s\S]*别忘记添加可执行工具的分身模型。/);
    assert.match(sessionContractSource, /key: 'memoryArchiving'[\s\S]*icon: '📓'[\s\S]*title: '记忆存档'/);
    assert.match(sessionContractSource, /key: 'statusPanel'[\s\S]*icon: '📋'[\s\S]*title: '角色档案'/);
    assert.doesNotMatch(sessionContractSource, /key: 'memoryArchiving'[\s\S]*icon: '🧠'|key: 'statusPanel'[\s\S]*icon: '档'/);
    assert.match(contractModalSource, /封印中\.\.\.[\s\S]*封存誓约[\s\S]*项授权已启用/);
    assert.doesNotMatch(chatPageSource, /class="chat-mobile-context-row"[\s\S]*title="请求日志"/);
    assert.doesNotMatch(chatPageSource, /class="chat-mobile-context-row"[\s\S]*>\s*会话\s*</);
    assert.match(contextSource, /export type TavernChatWorkspacePanelKey = 'map' \| 'status' \| 'memory';/);
    assert.match(appSource, /const chatWorkspacePanel = ref<TavernChatWorkspacePanelKey>\('map'\);/);
    assert.match(chatPageSource, /:class="\{ 'is-active': mobileChatPanel === 'workspace' && chatWorkspacePanel === 'map' \}"/);
    assert.match(chatPageSource, /:class="\{ 'is-active': mobileChatPanel === 'workspace' && chatWorkspacePanel === 'memory' \}"/);
    assert.match(chatPageSource, /:class="\{ 'is-active': mobileChatPanel === 'workspace' && chatWorkspacePanel === 'status' \}"/);
    assert.match(conversationPanelSource, /createNewChatSession,[\s\S]*const composeMenuOpen = ref\(false\)/);
    assert.match(conversationPanelSource, /const sessionArchiveOpen = ref\(false\)/);
    assert.doesNotMatch(conversationPanelSource, /open-session-archive/);
    assert.match(conversationPanelSource, /removeSession,/);
    assert.match(conversationPanelSource, /function deleteArchivedSession\(sessionId: string, event: Event\)[\s\S]*removeSession\(sessionId, event\)/);
    assert.match(conversationPanelSource, /v-for="archivedSession in currentChatCharacterSessions"[\s\S]*class="session-archive-open"[\s\S]*@click="openArchivedSession\(archivedSession\.id\)"[\s\S]*class="session-archive-delete"[\s\S]*aria-label="删除会话"[\s\S]*@click="deleteArchivedSession\(archivedSession\.id, \$event\)"/);
    assert.match(conversationPanelSource, /class="chat-compose-dock"[\s\S]*class="chat-compose-shell"[\s\S]*class="compose-menu-shell"[\s\S]*<form\s+class="chat-compose"/);
    assert.doesNotMatch(conversationPanelSource, /<form\s+class="chat-compose"[\s\S]*class="compose-menu-shell"/);
    assert.match(conversationPanelSource, /class="compose-menu-button"[\s\S]*aria-label="聊天操作"[\s\S]*aria-controls="xb-tavern-compose-menu"[\s\S]*@click\.stop="toggleComposeMenu"/);
    assert.match(conversationPanelSource, /class="compose-menu-button"[\s\S]*<svg[\s\S]*viewBox="0 0 24 24"[\s\S]*<path d="M4 6h16"/);
    assert.match(conversationPanelSource, /id="xb-tavern-compose-menu"[\s\S]*role="menu"[\s\S]*class="compose-menu-item"[\s\S]*新建会话[\s\S]*class="compose-menu-item"[\s\S]*会话档案[\s\S]*class="compose-menu-item"[\s\S]*玩家便签[\s\S]*class="compose-menu-item"[\s\S]*请求日志/);
    assert.match(conversationPanelSource, /defineEmits<\{[\s\S]*\(event: 'open-author-note'\): void;/);
    assert.match(conversationPanelSource, /function openAuthorNoteFromComposeMenu\(\) \{[\s\S]*closeComposeMenu\(\);[\s\S]*emit\('open-author-note'\);[\s\S]*\}/);
    assert.doesNotMatch(conversationPanelSource, /composeMenuView|isMobileAuthorNoteViewport|compose-author-note-panel|authorNoteDraft/);
    assert.match(chatPageSource, /<TavernConversationPanel[\s\S]*@open-author-note="openAuthorNoteModal"/);
    assert.match(chatPageSource, /function openAuthorNoteModal\(\) \{[\s\S]*authorNoteDraft\.value = normalizeXbTavernAuthorNote\(currentAuthorNote\.value\);[\s\S]*authorNoteModalOpen\.value = true;/);
    assert.match(chatPageSource, /v-if="authorNoteModalOpen"[\s\S]*class="compose-author-note-overlay"[\s\S]*role="dialog"[\s\S]*aria-modal="true"[\s\S]*class="compose-author-note-dialog compose-author-note-panel"/);
    assert.match(chatPageSource, /class="compose-author-note-dialog compose-author-note-panel"[\s\S]*玩家便签[\s\S]*只对当前会话生效。[\s\S]*class="compose-author-note-body"/);
    assert.match(chatPageSource, /便签内容/);
    assert.match(chatPageSource, /主提示词后[\s\S]*主提示词前[\s\S]*聊天内 @ Depth/);
    assert.match(chatPageSource, /Depth[\s\S]*插入频率[\s\S]*Role/);
    assert.match(chatPageSource, /System[\s\S]*User[\s\S]*Assistant/);
    assert.match(chatPageSource, /参与世界书扫描/);
    assert.match(chatPageSource, /v-model="authorNoteDraft\.prompt"/);
    assert.match(chatPageSource, /v-model\.number="authorNoteDraft\.depth"/);
    assert.match(chatPageSource, /v-model\.number="authorNoteDraft\.interval"/);
    assert.doesNotMatch(chatPageSource, /@input="updateAuthorNote(?:Prompt|Depth|Interval)"/);
    assert.match(contextSource, /currentAuthorNote: TavernReadable<XbTavernAuthorNote>/);
    assert.match(contextSource, /saveCurrentAuthorNote: TavernCommand<\[note: XbTavernAuthorNote\], Promise<void>>/);
    assert.match(appSource, /const currentAuthorNote = computed<XbTavernAuthorNote>\(\(\) => normalizeXbTavernAuthorNote\(selectedSession\.value\?\.contextSnapshot\?\.authorNote\)\)/);
    assert.match(appSource, /function buildSessionContextSnapshotBase\(session: TavernSessionRecord\): XbTavernContext \{[\s\S]*const snapshot = session\.contextSnapshot \|\| \{\};[\s\S]*characterKey = String\(snapshotCharacter\.characterKey \|\| session\.characterKey \|\| ''\)\.trim\(\);[\s\S]*name = String\(snapshotCharacter\.name \|\| session\.characterName \|\| ''\)\.trim\(\);/);
    assert.match(appSource, /const contextBase = buildSessionContextSnapshotBase\(session\);/);
    assert.doesNotMatch(appSource, /const contextBase = selectedSessionId\.value === sessionId[\s\S]*context\.value/);
    assert.match(appSource, /async function saveCurrentAuthorNote\(note: XbTavernAuthorNote\)[\s\S]*authorNote: normalized/);
    assert.match(appSource, /async function saveCurrentAuthorNote\(note: XbTavernAuthorNote\)[\s\S]*contextSnapshot: nextContext/);
    assert.match(appSource, /if \(selectedSessionId\.value !== sessionId\) \{return;\}[\s\S]*context\.value = nextContext/);
    assert.doesNotMatch(appSource, /const managerContextSnapshot = \(selectedSession\.value\?\.contextSnapshot \|\| context\.value/);
    assert.match(appSource, /async function rerunFromManagerMessage\([\s\S]*if \(selectedSessionId\.value !== managerSessionId\)[\s\S]*sendManagerQuestion\(managerSessionId/);
    assert.match(conversationPanelSource, /function openSessionArchiveFromComposeMenu\(\) \{[\s\S]*closeComposeMenu\(\);[\s\S]*sessionArchiveOpen\.value = true;[\s\S]*\}/);
    assert.match(contextSource, /currentChatCharacterSessions: TavernReadable<TavernSessionRecord\[\]>/);
    assert.match(appSource, /const currentChatCharacterSessions = computed<TavernSessionRecord\[\]>\(\(\) => \{[\s\S]*selectedSession\.value\?\.characterKey[\s\S]*effectiveContext\.value\.character\?\.characterKey[\s\S]*\.filter\(\(session\) => String\(session\.characterKey \|\| ''\)\.trim\(\) === characterKey\)/);
    assert.match(appSource, /watch\(\(\) => currentChatCharacterSessions\.value\.map\(\(session\) => session\.id\)\.join\('\|'\), \(\) => \{[\s\S]*refreshSessionLatestMessageOrdersForSessions\(currentChatCharacterSessions\.value\)/);
    assert.match(appSource, /const sessionContext = \{[\s\S]*currentChatCharacterSessions,/);
    assert.doesNotMatch(conversationPanelSource, /useTavernCharacterContext|selectedCharacterSessions/);
    assert.match(conversationPanelSource, /v-if="sessionArchiveOpen"[\s\S]*class="character-session-archive-overlay chat-session-archive-overlay"[\s\S]*v-for="archivedSession in currentChatCharacterSessions"[\s\S]*@click="openArchivedSession\(archivedSession\.id\)"/);
    assert.match(managerPanelSource, /v-model="managerInputDraft"[\s\S]*rows="1"/);
    assert.match(workspacePanelSource, /<button[\s\S]*chatWorkspacePanel === 'map'[\s\S]*>\s*地图\s*<\/button>/);
    assert.match(workspacePanelSource, /chatWorkspacePanel === 'map'[\s\S]*>\s*地图\s*<\/button>[\s\S]*chatWorkspacePanel === 'status'[\s\S]*>\s*状态\s*<\/button>[\s\S]*chatWorkspacePanel === 'memory'[\s\S]*>\s*记忆\s*<\/button>/);
    assert.match(workspacePanelSource, /<TavernStatusPanel[\s\S]*:document="statusStateDocument"[\s\S]*:field-deltas="statusFieldDeltas"[\s\S]*:enabled="sessionContract\.statusPanel"/);
    assert.match(workspacePanelSource, /class="tavern-map-viewport"[\s\S]*class="tavern-map-inline-switcher"[\s\S]*场景图[\s\S]*世界图/);
    assert.match(workspacePanelSource, /class="tavern-map-viewport"[\s\S]*<TavernAtlasPanel[\s\S]*display-mode="graph"/);
    assert.match(workspacePanelSource, /class="tavern-map-info"[\s\S]*<TavernAtlasPanel[\s\S]*display-mode="detail"/);
    assert.doesNotMatch(workspacePanelSource, /class="tavern-state-view-tabs"/);
    assert.doesNotMatch(workspacePanelSource, /回到当前位置|tavern-state-follow-button/);
    assert.match(workspacePanelSource, /class="tavern-map-info"/);
    assert.doesNotMatch(workspacePanelSource, /<span>\{\{ selectedMapRecord\.docId \}\}<\/span>|mapDigestLines|selectedMapRecord\.value\?\.digest/);
    assert.match(workspacePanelSource, /buildSeedLabelId\(''\)\.length/);
    assert.match(workspacePanelSource, /label: '出场人物'[\s\S]*values: mapActorNames\.value/);
    assert.match(workspacePanelSource, /label: '设施物件'[\s\S]*values: mapInteractiveNames\.value/);
    assert.doesNotMatch(workspacePanelSource, /tavern-current-state|stateMemoryFile|renderChatMarkdown\(currentState/);
    assert.match(composeCss, /--xb-compose-safe-space: 44px;/);
    assert.match(composeCss, /--xb-compose-safe-space: 40px;/);
    assert.match(composeCss, /\.tavern-chat\.xb-page \.chat-compose-shell \{[\s\S]*grid-template-columns: 48px minmax\(0, 1fr\);[\s\S]*border: 1px solid var\(--xb-rule\);[\s\S]*border-radius: 14px;[\s\S]*background: var\(--xb-chat-pop-bg\);/);
    assert.match(composeCss, /\.tavern-chat\.xb-page \.chat-compose \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) 36px;/);
    assert.match(composeCss, /\.compose-menu-button \{[\s\S]*min-height: 100%;[\s\S]*border: 0;[\s\S]*border-radius: 14px 0 0 14px;[\s\S]*background: transparent;/);
    assert.doesNotMatch(composeCss, /\.compose-menu-button \{[^}]*border-right:/);
    assert.match(composeCss, /\.compose-menu-button svg \{[\s\S]*width: 22px;[\s\S]*height: 22px;[\s\S]*stroke-width: 2;/);
    assert.match(composeCss, /\.compose-menu-popover \{[\s\S]*bottom: calc\(100% \+ 10px\);[\s\S]*min-width: 142px;/);
    assert.match(composeCss, /@media \(max-width: 980px\) \{[\s\S]*\.compose-menu-popover \{[\s\S]*position: absolute;[\s\S]*right: auto;[\s\S]*bottom: calc\(100% \+ 8px\);[\s\S]*left: 0;[\s\S]*width: min\(280px, calc\(100vw - 20px\)\);[\s\S]*max-height: calc\(100dvh - 82px - env\(safe-area-inset-top, 0px\) - env\(safe-area-inset-bottom, 0px\)\);/);
    assert.doesNotMatch(composeCss, /\.compose-menu-popover\.is-author-note/);
    assert.match(composeCss, /\.compose-author-note-overlay \{[\s\S]*position: absolute;[\s\S]*inset: 0;[\s\S]*z-index: 98;[\s\S]*place-items: center;/);
    assert.match(composeCss, /\.compose-author-note-dialog \{[\s\S]*width: min\(420px, 100%\);[\s\S]*max-height: min\(86vh, 680px\);[\s\S]*overflow: hidden;/);
    assert.match(composeCss, /\.compose-author-note-panel \{[\s\S]*grid-template-rows: auto minmax\(0, 1fr\) auto;[\s\S]*min-height: 0;/);
    assert.match(composeCss, /\.compose-author-note-body \{[\s\S]*display: grid;[\s\S]*min-height: 0;/);
    assert.match(composeCss, /@media \(max-width: 980px\) \{[\s\S]*\.compose-author-note-field textarea \{[\s\S]*resize: none;[\s\S]*max-height: min\(190px, 34vh\);/);
    assert.match(composeCss, /@media \(max-width: 980px\) \{[\s\S]*\.compose-author-note-overlay \{[\s\S]*inset: 0;[\s\S]*padding: 0;/);
    assert.match(composeCss, /@media \(max-width: 980px\) \{[\s\S]*\.compose-author-note-dialog \{[\s\S]*width: 100%;[\s\S]*height: 100%;[\s\S]*max-height: none;[\s\S]*border-radius: 0;[\s\S]*env\(safe-area-inset-top, 0px\)[\s\S]*env\(safe-area-inset-bottom, 0px\)/);
    assert.match(composeCss, /@media \(max-width: 980px\) \{[\s\S]*\.compose-author-note-dialog \.compose-author-note-body \{[\s\S]*min-height: 0;[\s\S]*overflow: auto;[\s\S]*overscroll-behavior: contain;/);
    assert.doesNotMatch(composeCss, /left: max\(-8px, calc\(48px - 100vw\)\)/);
    assert.match(composeCss, /\.compose-author-note-segments \{[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
    assert.match(composeCss, /\.compose-author-note-actions \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) auto;/);
    assert.match(composeCss, /\.chat-compose textarea \{[\s\S]*min-height: 32px;[\s\S]*max-height: 76px;[\s\S]*padding: 5px 6px 5px 12px;/);
    assert.match(composeCss, /\.chat-compose>button \{[\s\S]*justify-self: center;[\s\S]*width: 32px;[\s\S]*min-width: 32px;[\s\S]*height: 32px;[\s\S]*border: 0;[\s\S]*border-radius: 999px;/);
    assert.doesNotMatch(composeCss, /\.chat-compose>button \{[^}]*border-left:/);
    assert.match(appSource, /const tavernToast = ref<\{[\s\S]*tone: 'info' \| 'warning' \| 'danger';[\s\S]*function showTavernToast/);
    assert.match(appSource, /v-if="tavernToast"[\s\S]*class="tavern-toast"[\s\S]*aria-live="polite"/);
    assert.match(appBaseCss, /\.tavern-toast \{[\s\S]*position: fixed;[\s\S]*top: max\(18px, env\(safe-area-inset-top, 0px\)\);[\s\S]*pointer-events: none;/);
    assert.match(chatRunSource, /if \(!isRerollRun && !messageText\) \{[\s\S]*state\.runtimeError\.value = '先写一句话。';[\s\S]*options\.showToast\('先写一句话。', \{ tone: 'info', durationMs: 1800 \}\);[\s\S]*return;/);
    assert.match(chatRunSource, /if \(options\.selectedSessionCharacterError\.value\) \{[\s\S]*state\.runtimeError\.value = options\.selectedSessionCharacterError\.value;[\s\S]*options\.showToast\(options\.selectedSessionCharacterError\.value, \{ tone: 'warning', durationMs: 7000 \}\);[\s\S]*return;/);
    assert.match(appSource, /showTavernToast\('命令已执行，没有输出。', \{ tone: 'info', durationMs: 2200 \}\);/);
    assert.match(chatRunSource, /options\.showToast\(`命令执行失败：\$\{errorText\}`, \{ tone: 'warning', durationMs: 5000 \}\);/);
    assert.match(chatRunSource, /let assistantMessageSaved = false;[\s\S]*const result = await runXbTavernTurn[\s\S]*onAssistantMessageSaved: async \(sessionId, message\) => \{[\s\S]*assistantMessageSaved = true;[\s\S]*if \(!assistantMessageSaved\) \{[\s\S]*options\.showToast\(errorText, \{ tone: 'warning', durationMs: 6000 \}\);/);
    assert.doesNotMatch(appSource, /enteredTurn/);
    assert.doesNotMatch(chatRunSource, /state\.runtimeError\.value = result\.error \|\| '';[\s\S]{0,160}showToast/);
    assert.doesNotMatch(memoryEditorSource, /tavern-memory-directory-button|directoryOpen|directoryLabel|toggle-directory/);
    assert.match(workspacePanelSource, /class="tavern-memory-workspace"[\s\S]*:class="\{ 'is-memory-directory-open': memoryDirectoryOpen \}"[\s\S]*class="tavern-memory-selector"[\s\S]*:aria-expanded="memoryDirectoryOpen \? 'true' : 'false'"[\s\S]*aria-controls="xb-tavern-memory-directory"[\s\S]*@click="toggleMemoryDirectory"[\s\S]*id="xb-tavern-memory-directory"[\s\S]*class="tavern-memory-directory"[\s\S]*<TavernMemoryEditor/);
    assert.match(appSource, /const memoryDirectoryGroups = computed\(\(\) => \{[\s\S]*const sortedFiles = \[\.\.\.memoryFiles\.value\][\s\S]*key: 'all'/);
    assert.doesNotMatch(workspacePanelSource, /memory-file-group-title|group\.title/);
    assert.doesNotMatch(workspacePanelSource, /tavern-memory-directory-close|:directory-open="memoryDirectoryOpen"|@toggle-directory="toggleMemoryDirectory"/);
    assert.match(memoryCss, /\.tavern-chat\.xb-page \.tavern-memory-selector \{[\s\S]*grid-template-columns: auto minmax\(0, 1fr\) auto 18px;[\s\S]*border-bottom: 1px solid var\(--xb-rule\);/);
    assert.match(memoryCss, /\.tavern-chat\.xb-page \.tavern-memory-directory \{[\s\S]*max-height: 0;[\s\S]*overflow: hidden;[\s\S]*pointer-events: none;/);
    assert.match(memoryCss, /\.tavern-chat\.xb-page \.tavern-memory-workspace\.is-memory-directory-open \.tavern-memory-directory \{[\s\S]*max-height: min\(42vh, 380px\);[\s\S]*overflow: auto;[\s\S]*pointer-events: auto;/);
    assert.match(memoryCss, /\.tavern-chat\.xb-page \.tavern-memory-directory \.memory-file-group \{[\s\S]*display: grid;[\s\S]*gap: 6px;/);
    assert.doesNotMatch(memoryCss, /memory-file-group-title/);
    assert.match(memoryCss, /\.tavern-chat\.xb-page \.tavern-memory-directory \.memory-file-tree \{[\s\S]*display: flex;[\s\S]*flex-wrap: wrap;/);
    assert.match(memoryCss, /@media \(max-width: 760px\) \{[\s\S]*\.tavern-chat\.xb-page \.tavern-memory-directory \.memory-file-tree \{[\s\S]*display: grid;/);
    assert.doesNotMatch(memoryCss, /\.tavern-chat\.xb-page \.tavern-memory-directory \{[^}]*position: absolute;|top: 58px|max-height: min\(62vh, 460px\)/);
    assert.doesNotMatch(memoryCss, /tavern-mobile-memory-picker/);
    assert.doesNotMatch(memoryCss, /@media \(max-width: 760px\) \{[\s\S]*\.tavern-chat\.xb-page \.tavern-memory-selector span \{[\s\S]*display: none;/);
    assert.match(memoryCss, /@media \(max-width: 760px\) \{[\s\S]*\.tavern-chat\.xb-page \.tavern-workspace-tabs \{[\s\S]*display: none;/);
    assert.match(mapCss, /\.xb-os-shell\.theme-dark \.tavern-chat\.xb-page \.tavern-map-select \{[\s\S]*background: rgba\(255, 255, 255, 0\.055\);[\s\S]*color: var\(--xb-text-main\);/);
    assert.match(managerCss, /\.tavern-chat\.xb-page \.manager-compose \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) 36px;/);
    assert.doesNotMatch(managerCss, /\.tavern-chat\.xb-page \.manager-work-band \{[^}]*display: none;/);
    assert.match(managerCss, /\.tavern-chat\.xb-page \.manager-work-band-body \{[\s\S]*grid-template-columns: minmax\(0, 1fr\);/);
    assert.match(managerCss, /\.tavern-chat\.xb-page \.manager-work-status-grid \{[\s\S]*grid-template-columns: minmax\(0, 1fr\);/);
    assert.doesNotMatch(managerCss, /manager-work-band-body \{[\s\S]*grid-template-columns: minmax\(220px, 0\.8fr\) minmax\(260px, 1\.2fr\);/);
    assert.doesNotMatch(managerCss, /\.tavern-chat\.xb-page \.manager-compose button\.primary-action \{[^}]*min-width: 82px;/);
    assert.doesNotMatch(managerCss, /\.tavern-chat\.xb-page \.manager-compose button\.primary-action \{[^}]*min-height: 58px;/);
    assert.doesNotMatch(conversationPanelSource, /class="compose-error"/);
    assert.doesNotMatch(managerPanelSource, /class="compose-error"/);
    assert.doesNotMatch(appBaseCss, /\.compose-error/);
    assert.doesNotMatch(composeCss, /\.compose-error/);
    assert.doesNotMatch(cssSource, /\.chat-bubble\.from-assistant\s*\{[^}]*border-left:/);
    assert.match(cssSource, /\.xb-os-shell\.theme-dark \.action-check-card-grid>span/);
    assert.doesNotMatch(cssSource, /\.xb-os-shell\.theme-dark \.action-check-card-grid>div/);
    assert.match(cssSource, /\.action-check-card-stakes \{[\s\S]*font-size: calc\(var\(--xb-tavern-reading-font-size, 15px\) - 1px\);[\s\S]*line-height: var\(--xb-tavern-reading-line-height, 23px\);[\s\S]*overflow-wrap: anywhere;/);
    assert.match(cssSource, /\.xb-os-shell\.theme-dark \.action-check-card-stakes::before \{[\s\S]*color: #d9c89a;/);
});

test('tavern keeps the app exit button on home only', () => {
    const homeSource = readRepoFile('modules/tavern/app-src/components/TavernHomePage.vue');
    const aboutSource = readRepoFile('modules/tavern/app-src/components/TavernAboutPage.vue');
    const characterSource = readRepoFile('modules/tavern/app-src/components/TavernCharacterWorkspacePanel.vue');
    const chatSource = readRepoFile('modules/tavern/app-src/components/chat/TavernChatPage.vue');
    const settingsSource = readRepoFile('modules/tavern/app-src/components/settings/TavernSettingsPage.vue');

    assert.match(homeSource, /include-exit/);
    for (const source of [aboutSource, characterSource, chatSource, settingsSource]) {
        assert.doesNotMatch(source, /@exit=/);
        assert.doesNotMatch(source, /xb-tavern:close/);
        assert.doesNotMatch(source, /aria-label="退出"/);
    }
});

test('tavern memory workspace keeps session-scoped lazy file loading', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const editorSource = readRepoFile('modules/tavern/app-src/components/TavernMemoryEditor.vue');
    const memoryWorkspaceSource = readRepoFile('modules/tavern/app-src/components/chat/useTavernMemoryWorkspace.ts');
    assert.match(appSource, /selectedMemoryFileRecord\.value\?\.sessionId === selectedSessionId\.value/);
    assert.match(appSource, /watch\(\[[\s\S]*\(\) => String\(selectedSessionId\.value \|\| ''\)\.trim\(\),[\s\S]*\(\) => String\(selectedMemoryFileEntry\.value\?\.path \|\| ''\)\.trim\(\),[\s\S]*\(\) => Number\(selectedMemoryFileEntry\.value\?\.updatedAt\) \|\| 0,[\s\S]*\(\) => Number\(selectedMemoryFileEntry\.value\?\.contentLength\) \|\| 0,[\s\S]*\], async \(\[sessionId, nextPath\]\) => \{/);
    assert.match(appSource, /memoryEditorLoadedPath\.value === nextPath && \(memoryEditorMode\.value === 'edit' \|\| memoryEditorDirty\.value\)/);
    assert.doesNotMatch(appSource, /watch\(selectedMemoryFileEntry,/);
    assert.match(appSource, /const memoryEditorReadOnly = computed\(\(\) => \([\s\S]*isRunning\.value[\s\S]*managerBusy\.value[\s\S]*isManagerAssistantRunning\.value[\s\S]*isPhoneSendingForSession\(\)[\s\S]*\)\);/);
    assert.match(appSource, /watch\(memoryEditorReadOnly, \(readOnly\) => \{[\s\S]*memoryEditorMode\.value !== 'edit'[\s\S]*const wasDirty = memoryEditorDirty\.value;[\s\S]*discardMemoryDraft\(\);[\s\S]*if \(wasDirty\) \{[\s\S]*showTavernToast\('记忆正在维护，未保存修改已放弃', \{[\s\S]*tone: 'warning',[\s\S]*durationMs: 4000,[\s\S]*\}\);[\s\S]*\}[\s\S]*\}, \{ immediate: true \}\);/);
    assert.match(memoryWorkspaceSource, /memoryEditorReadOnly: ComputedRef<boolean>;/);
    assert.match(memoryWorkspaceSource, /if \(!options\.selectedSessionId\.value \|\| !file \|\| options\.memoryEditorReadOnly\.value\) \{return;\}/);
    assert.match(memoryWorkspaceSource, /if \(!options\.memoryEditorDocumentAvailable\.value \|\| options\.memoryEditorReadOnly\.value\) \{return;\}/);
    assert.doesNotMatch(memoryWorkspaceSource, /记忆已更新|覆盖保存|保留草稿|memory_write_conflict|expected:/);
    assert.match(editorSource, /:disabled="!documentAvailable \|\| readOnly"/);
    assert.match(editorSource, /:disabled="!hasSelectedFile \|\| !dirty \|\| readOnly"/);
    assert.match(editorSource, /:readonly="readOnly"/);
    assert.match(memoryWorkspaceSource, /function invalidateMemoryFileRecordLoad/);
});

test('tavern worldbook preview keeps summary lean and expanded content ephemeral', () => {
    const helperSource = readRepoFile('modules/tavern/app-src/components/useTavernEphemeralDisclosureScope.ts');
    const worldbookSource = readRepoFile('modules/tavern/app-src/components/settings/TavernWorldbooksSettingsPanel.vue');
    const worldbookCss = readRepoFile('modules/tavern/app-src/styles/settings/worldbooks.css');
    const worldbookHost = readRepoFile('modules/tavern/host/worldbooks.ts');
    const settingsControllerSource = readRepoFile('modules/tavern/app-src/components/settings/useTavernSettingsController.ts');
    const mobileCss = readRepoFile('modules/tavern/app-src/styles/settings/mobile.css');

    assert.match(helperSource, /export function useTavernEphemeralDisclosureScope/);
    assert.match(worldbookSource, /useTavernEphemeralDisclosureScope/);
    assert.match(worldbookSource, /aria-label="选择世界书"/);
    assert.doesNotMatch(worldbookSource, /筛选世界书|worldbookSearchText|worldbook-search-field/);
    assert.match(worldbookSource, />条目名</);
    assert.match(worldbookSource, />状态</);
    assert.match(worldbookSource, />注入位置</);
    assert.match(worldbookSource, />触发概率</);
    assert.match(worldbookSource, />可选过滤</);
    assert.match(worldbookSource, /worldbookEntryStateValue/);
    assert.match(worldbookSource, /worldbookPositionValue/);
    assert.match(worldbookSource, /depth: nextPosition === 4 \? worldbookEntryDraft\.value\?\.depth \?\? 4 : null/);
    assert.match(worldbookSource, /function listFromCommaText/);
    assert.match(worldbookSource, /key: listFromCommaText/);
    assert.match(worldbookSource, /keysecondary: values,[\s\S]*secondary_keys: values,/);
    assert.match(worldbookSource, /triggers', listFromCommaText/);
    assert.doesNotMatch(worldbookSource, /key: listFromLines/);
    assert.doesNotMatch(worldbookSource, /keysecondary: listFromLines/);
    assert.doesNotMatch(worldbookSource, /triggers', listFromLines/);
    assert.doesNotMatch(worldbookSource, />次级关键词</);
    assert.doesNotMatch(worldbookSource, /worldbookEntryDraft\.(?:name|title)|updateWorldbookEntryDraftPatch\(\{ (?:name|title):|>名称<\/span>|>标题<\/span>/);
    assert.doesNotMatch(worldbookSource, />检索世界书</);
    const worldbookSummaries = [...worldbookSource.matchAll(/<summary>[\s\S]*?<\/summary>/g)].map((match) => match[0]);
    assert.ok(worldbookSummaries.length > 0);
    for (const summary of worldbookSummaries) {
        assert.doesNotMatch(summary, /entry\.(?:keys|secondaryKeys)/);
    }
    assert.match(worldbookSource, /v-if="worldbookDisclosure\.isOpen[\s\S]*class="worldbook-entry-body"/);
    assert.match(worldbookSource, /worldbookDisclosure\.isOpen\(worldbookAdvancedDisclosureId/);
    assert.match(worldbookCss, /\.worldbook-entry-body \{[\s\S]*max-height: 560px;[\s\S]*overflow: auto;/);
    assert.match(worldbookCss, /\.worldbook-entry-content \{[\s\S]*white-space: pre-wrap;/);
    assert.doesNotMatch(worldbookHost, /truncatePreview/);
    assert.match(worldbookHost, /\['extensions\.position', normalizeWorldbookPosition\(entry\.position\)\]/);
    assert.match(worldbookHost, /function normalizeWorldbookDepth\(position: unknown, depth: unknown\): number \| null/);
    assert.match(worldbookHost, /return normalizeWorldbookPosition\(position\) === 4 \? normalizeNullableNumber\(depth\) \?\? 4 : null;/);
    assert.match(worldbookHost, /\['extensions\.depth', normalizeWorldbookDepth\(entry\.position, entry\.depth\)\]/);
    assert.match(settingsControllerSource, /depth: Number\(record\.position\) === 4 \? normalizeNullableNumber\(record\.depth\) \?\? 4 : null/);
    assert.match(worldbookHost, /\['extensions\.vectorized', entry\.vectorized === true\]/);
    assert.match(worldbookHost, /\['selectiveLogic', Math\.floor\(normalizeFiniteNumber\(entry\.selectiveLogic, 0\)\)\]/);
    assert.match(mobileCss, /\.settings-layout\.is-worldbooks-workspace \.worldbook-entry-preview summary \{[\s\S]*min-height: 42px;/);
});

test('tavern character archive separates new chat from existing session selection', () => {
    const contextSource = readRepoFile('modules/tavern/app-src/components/tavern-app-context.ts');
    const characterSource = readRepoFile('modules/tavern/app-src/components/TavernCharacterWorkspacePanel.vue');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const sessionSource = readRepoFile('modules/tavern/app-src/features/session/useTavernSessionController.ts');
    const previewCss = readRepoFile('modules/tavern/app-src/styles/characters/preview.css');
    const shellOverridesCss = readRepoFile('modules/tavern/app-src/styles/shell-overrides.css');
    const sessionDbSource = readRepoFile('modules/tavern/shared/session-db.ts');
    const characterContextObject = extractSourceBetween(appSource, 'const characterContext = {', 'const chatContext = {');

    assert.match(appSource, /const selectedCharacterSessions = computed<TavernSessionRecord\[\]>/);
    assert.match(appSource, /selectedCharacterSessions,/);
    assert.match(appSource, /sessionFloorLabel,/);
    assert.match(appSource, /function sessionFloorLabel\(session\?: TavernSessionRecord \| null\)[\s\S]*return sessionController\.sessionFloorLabel\(session\);/);
    assert.match(sessionSource, /function sessionFloorLabel\(session\?: TavernSessionRecord \| null\)[\s\S]*return '统计中'/);
    assert.match(appSource, /async function refreshSessionLatestMessageOrdersForSessions\(targetSessions: TavernSessionRecord\[\] = \[\]\)[\s\S]*sessionController\.refreshSessionLatestMessageOrdersForSessions\(targetSessions\);/);
    assert.match(sessionSource, /async function refreshSessionLatestMessageOrdersForSessions\(targetSessions: TavernSessionRecord\[\] = \[\]\)[\s\S]*getLatestTavernMessage\(id\)/);
    assert.match(appSource, /watch\(\(\) => selectedCharacterSessions\.value\.map\(\(session\) => session\.id\)\.join\('\|'\)[\s\S]*refreshSessionLatestMessageOrdersForSessions\(selectedCharacterSessions\.value\)/);
    assert.match(sessionDbSource, /export async function countTavernMessages[\s\S]*\.where\('sessionId'\)\.equals\(id\)\.count\(\)/);
    assert.doesNotMatch(sessionDbSource, /countTavernMessages[\s\S]*toArray\(\)\)\.length/);
    assert.doesNotMatch(characterContextObject, /openSession: selectSession/);
    assert.match(characterSource, /useTavernSessionContext/);
    assert.match(characterSource, /selectSession: openSessionById/);
    assert.match(characterSource, /function openSession\(sessionId: string\)[\s\S]*openSessionById\(id\)/);
    assert.match(characterSource, /selectedCharacterSessions,/);
    assert.match(characterSource, /sessionFloorLabel,/);
    assert.match(characterSource, /function sessionArchiveMeta\(session: TavernSessionRecord\)[\s\S]*sessionFloorLabel\(session\)/);
    assert.doesNotMatch(characterSource, /sessionArchiveMeta[\s\S]*chatPresetName|sessionArchiveMeta[\s\S]*presetName/);
    assert.match(appSource, /function clearCharacterArchiveSyncState\(\)[\s\S]*if \(characterArchiveSyncState\.value\.busy\) \{return;\}[\s\S]*createIdleCharacterArchiveSyncState\(\)/);
    assert.match(appSource, /const restoreSummary = await restoreTavernCharacterArchiveFromRecords[\s\S]*await refreshSessions\(\);[\s\S]*updateCharacterArchiveSyncState\(\{\s*busy: false,\s*phase: '完成'/);
    assert.doesNotMatch(appSource, /restoreSummary\.selectedSessionId[\s\S]{0,120}selectSession/);
    assert.match(contextSource, /clearCharacterArchiveSyncState: TavernCommand/);
    assert.match(characterContextObject, /clearCharacterArchiveSyncState,/);
    assert.match(characterSource, /function closeCharacterCloudSync\(\)[\s\S]*characterCloudSyncOpen\.value = false;[\s\S]*clearCharacterArchiveSyncState\(\);/);
    assert.match(characterSource, /function openCharacterCloudSync\(\)[\s\S]*state\.phase \|\| state\.percent \|\| state\.message \|\| state\.error \|\| state\.result[\s\S]*clearCharacterArchiveSyncState\(\);/);
    assert.match(characterSource, /class="dossier-summary"[\s\S]*selectedCharacter\.description[\s\S]*selectedCharacter\.personality[\s\S]*selectedCharacter\.scenario/);
    assert.doesNotMatch(characterSource, /class="data-section-title"/);
    assert.doesNotMatch(characterSource, /class="character-data-list"/);
    assert.match(characterSource, /class="os-system-act-btn character-definition-button"[\s\S]*aria-label="角色卡详情"[\s\S]*class="os-system-act-btn character-worldbook-button"/);
    assert.match(characterSource, /const greetingHeaderLabel = computed[\s\S]*`开场白 \$\{index \+ 1\} \/ \$\{total\} - \$\{greetingLabel\(index\)\}`/);
    assert.match(characterSource, /class="greeting-current-head"[\s\S]*class="greeting-other-button"[\s\S]*>\s*其他开场\s*<\/button>/);
    assert.match(characterSource, /if \(!hasMultipleGreetings\.value\) \{[\s\S]*alertTavernDialog[\s\S]*暂无备用开场白/);
    assert.doesNotMatch(characterSource, /<dt>开场白|v-if="greetingOptions\.length > 1"[\s\S]{0,180}class="greeting-other-button"/);
    assert.match(characterSource, /class="character-greeting-overlay"[\s\S]*aria-label="其他开场"[\s\S]*class="character-greeting-dialog"[\s\S]*class="character-greeting-list"/);
    assert.doesNotMatch(characterSource, /class="greeting-section-title"|class="data-section greeting-picker"|advancedDefinitionDisclosure/);
    assert.match(characterSource, /const characterDefinitionFields = computed[\s\S]*label: '性格摘要'[\s\S]*personality/);
    assert.match(characterSource, /const characterDefinitionFields = computed[\s\S]*label: '情景'[\s\S]*scenario/);
    assert.match(characterSource, /const characterDefinitionFields = computed[\s\S]*label: '角色备注'[\s\S]*characterDepthPrompt/);
    assert.match(characterSource, /const characterDefinitionFields = computed[\s\S]*label: '制作者备注'[\s\S]*creatorNotes/);
    assert.match(characterSource, /const characterDefinitionFields = computed[\s\S]*label: '示例对话'[\s\S]*mesExample/);
    assert.doesNotMatch(characterSource, /sys-mono|SYS_ERROR|SYS_WARN|ENTRIES|ACTIVE|LOADING|READING|AWAITING|UNKNOWN|数据库脱节|残卷/);
    assert.doesNotMatch(previewCss, /\.sys-mono/);
    assert.match(characterSource, /class="character-definition-overlay"[\s\S]*aria-label="角色卡详情"/);
    assert.match(characterSource, /v-for="field in characterDefinitionFields"/);
    assert.match(characterSource, />\s*会话档案\s*</);
    assert.match(characterSource, /新建中\.\.\.' : '新建聊天/);
    assert.match(characterSource, /class="character-session-archive-overlay"/);
    assert.match(characterSource, /class="session-archive-close"[\s\S]*aria-label="关闭会话档案"[\s\S]*\/>/);
    assert.doesNotMatch(characterSource, /class="session-archive-close"[\s\S]*×[\s\S]*<\/button>/);
    assert.match(characterSource, /removeSession,/);
    assert.match(characterSource, /function deleteArchivedSession\(sessionId: string, event: Event\)[\s\S]*removeSession\(sessionId, event\)/);
    assert.match(appSource, /class="worldbook-picker-close"[\s\S]*aria-label="关闭"[\s\S]*\/>/);
    assert.match(characterSource, /v-for="session in selectedCharacterSessions"/);
    assert.match(characterSource, /class="session-archive-open"[\s\S]*@click="openSession\(session\.id\)"[\s\S]*class="session-archive-delete"[\s\S]*aria-label="删除会话"[\s\S]*@click="deleteArchivedSession\(session\.id, \$event\)"/);
    assert.match(characterSource, /@click="enterSelected"/);
    assert.match(characterSource, /<main\s+v-if="!selectedCharacter"\s+class="character-preview-panel dossier-empty"/);
    assert.doesNotMatch(characterSource, /@dblclick="\$emit\('enter-character'/);
    assert.match(previewCss, /\.dossier-title-actions \{[\s\S]*display: flex;[\s\S]*gap: 8px;/);
    assert.match(previewCss, /\.character-cloud-button,\n\.character-definition-button,\n\.character-worldbook-button/);
    assert.match(previewCss, /\.session-archive-button/);
    assert.match(previewCss, /\.dossier-title-actions \.session-archive-button,\n\.dossier-title-actions \.enter-chat-button \{[\s\S]*padding-left: 12px;[\s\S]*padding-right: 12px;/);
    assert.match(previewCss, /\.character-definition-dialog \{[\s\S]*width: min\(560px, 100%\);/);
    assert.match(previewCss, /\.character-definition-section dd \{[\s\S]*white-space: pre-wrap;/);
    assert.match(previewCss, /\.character-session-archive \{[\s\S]*width: min\(520px, 100%\);/);
    assert.match(shellOverridesCss, /\.home-corner-actions,[\s\S]*\.page-corner-actions \{[\s\S]*z-index: 90;/);
    assert.match(previewCss, /\.character-definition-overlay,[\s\S]*\.character-cloud-sync-overlay,[\s\S]*\.character-greeting-overlay,[\s\S]*\.character-session-archive-overlay \{[\s\S]*position: fixed;[\s\S]*z-index: 100100;/);
    assert.match(previewCss, /@media \(max-width: 640px\) \{[\s\S]*\.character-definition-overlay,[\s\S]*\.character-greeting-overlay,[\s\S]*\.character-session-archive-overlay,[\s\S]*\.character-worldbook-picker-overlay \{[\s\S]*place-items: stretch;[\s\S]*padding: 0;[\s\S]*\.character-definition-dialog,[\s\S]*\.character-greeting-dialog,[\s\S]*\.character-session-archive,[\s\S]*\.character-worldbook-picker \{[\s\S]*width: 100%;[\s\S]*height: 100%;[\s\S]*max-height: none;[\s\S]*border-radius: 0;/);
    assert.match(previewCss, /grid-template-columns: 40px 40px 40px max-content max-content;/);
});

test('tavern deleting a selected chat never falls through to another character session', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const sessionSource = readRepoFile('modules/tavern/app-src/features/session/useTavernSessionController.ts');

    assert.match(appSource, /async function removeSession\(sessionId: string, event\?: Event\) \{[\s\S]*event\?\.stopPropagation\(\);[\s\S]*await sessionController\.removeSession\(sessionId\);/);
    assert.match(sessionSource, /const deletedCharacterKey = String\(session\?\.characterKey \|\| ''\)\.trim\(\);/);
    assert.match(sessionSource, /const nextSameCharacterSession = deletedCharacterKey[\s\S]*\.filter\(\(item\) => item\.id !== id && String\(item\.characterKey \|\| ''\)\.trim\(\) === deletedCharacterKey\)/);
    assert.match(sessionSource, /if \(nextSameCharacterSession\?\.id\) \{[\s\S]*await persistSelectedSessionId\(nextSameCharacterSession\.id\);[\s\S]*options\.activeView\.value = 'chat';/);
    assert.match(sessionSource, /state\.selectedSessionId\.value = '';[\s\S]*await persistSelectedSessionId\(''\);[\s\S]*options\.selectedCharacterPreviewKey\.value = deletedCharacterKey;[\s\S]*options\.openCharacterSettingsWorkspace\(\);[\s\S]*options\.activeView\.value = 'home';/);
});

test('tavern heavy disclosure details bind to ephemeral state instead of keeping bodies mounted', () => {
    const detailFiles = sourceFiles
        .filter((path) => path.includes(`${join('modules', 'tavern', 'app-src', 'components')}`))
        .map((path) => ({
            path: relative(root, path).replace(/\\/g, '/'),
            source: readFileSync(path, 'utf8'),
        }));
    const unboundDetails = detailFiles.flatMap(({ path, source }) => (
        [...source.matchAll(/<details\b[\s\S]*?>/g)]
            .filter((match) => !match[0].includes(':open='))
            .map((match) => ({ path, tag: match[0].replace(/\s+/g, ' ').trim() }))
    ));

    assert.deepEqual(unboundDetails, []);

    const characterSource = readRepoFile('modules/tavern/app-src/components/TavernCharacterWorkspacePanel.vue');
    const conversationSource = readRepoFile('modules/tavern/app-src/components/chat/TavernConversationPanel.vue');
    const managerSource = readRepoFile('modules/tavern/app-src/components/chat/TavernManagerPanel.vue');
    const assistantToolTurnSource = readRepoFile('modules/tavern/app-src/components/chat/TavernAssistantToolRun.vue');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const assistantChatLiveControllerSource = readRepoFile('modules/tavern/app-src/features/assistant-chat/useTavernAssistantChatLiveController.ts');
    const contextSource = readRepoFile('modules/tavern/app-src/components/tavern-app-context.ts');
    const markdownToolsSource = readRepoFile('modules/tavern/app-src/components/chat/useTavernMarkdownTools.ts');
    assert.doesNotMatch(characterSource, /useTavernEphemeralDisclosureScope|advancedDefinitionDisclosure|class="data-section greeting-picker"/);
    assert.match(characterSource, /const greetingHeaderLabel = computed[\s\S]*`开场白 \$\{index \+ 1\} \/ \$\{total\} - \$\{greetingLabel\(index\)\}`/);
    assert.match(characterSource, /class="greeting-current-head"[\s\S]*class="greeting-other-button"[\s\S]*>\s*其他开场\s*<\/button>/);
    assert.match(characterSource, /if \(!hasMultipleGreetings\.value\) \{[\s\S]*alertTavernDialog[\s\S]*暂无备用开场白/);
    assert.match(characterSource, /class="character-greeting-overlay"[\s\S]*class="character-greeting-list"/);
    assert.match(conversationSource, /useTavernEphemeralDisclosureScope/);
    assert.match(conversationSource, /class="tavern-thought-details"[\s\S]*:open="thoughtDisclosure\.isOpen/);
    assert.match(conversationSource, /v-if="thoughtDisclosure\.isOpen\(messageThoughtDisclosureId\(message\)\)"/);
    assert.match(managerSource, /useTavernEphemeralDisclosureScope/);
    assert.match(managerSource, /class="manager-work-band"[\s\S]*:open="managerWorkDisclosure\.isOpen/);
    assert.match(managerSource, /class="manager-work-band"[\s\S]*class="chat-scroll-shell manager-scroll-shell"/);
    assert.match(managerSource, /v-for="item in managerChatMessageItems"/);
    assert.doesNotMatch(managerSource, /class="manager-work-section manager-work-live-draft"/);
    assert.match(managerSource, /v-if="managerPendingUserMessage"[\s\S]*data-manager-anchor-key="pending:user"/);
    assert.match(managerSource, /isManagerAssistantRunning && !managerPendingUserMessage && !liveManagerToolRound && !liveManagerAssistantDraft/);
    assert.match(appSource, /managerPendingUserMessage: visibleManagerPendingUserMessage/);
    assert.match(managerSource, /function handleManagerWorkBandToggle[\s\S]*enhanceManagerMarkdown\(\)[\s\S]*updateManagerScrollButtons\(\)/);
    assert.match(appSource, /const managerWorkRef = ref<HTMLElement \| null>\(null\)/);
    assert.match(appSource, /managerWorkMarkdownSignature/);
    assert.match(markdownToolsSource, /managerWorkRef\?: Ref<HTMLElement \| null>/);
    assert.match(markdownToolsSource, /options\.managerScrollRef\.value, options\.managerWorkRef\?\.value/);
    assert.doesNotMatch(managerSource, /class="manager-work-drawer"/);
    assert.match(managerSource, /<TavernAssistantToolRun[\s\S]*:open="assistantChatDisclosure\.isOpen/);
    assert.match(managerSource, /class="manager-chat-log"[\s\S]*class="assistant-tool-run assistant-tool-run-live"/);
    assert.match(assistantToolTurnSource, /v-if="open"/);
    assert.match(managerSource, /liveManagerToolRound\.value\?\.calls\.slice\(-8\)/);
    assert.match(assistantChatLiveControllerSource, /function onStreamProgress\(snapshot: TavernManagerStreamSnapshot\)/);
    assert.match(assistantChatLiveControllerSource, /typeof patch\.content === 'string'/);
    assert.match(assistantChatLiveControllerSource, /typeof patch\.thoughtCount === 'number'/);
    assert.match(appSource, /managerAssistantLiveController\.startRun\(managerSessionId\)/);
    assert.doesNotMatch(contextSource, /managerToolTurnPreview|managerToolTurnSummary/);
    assert.doesNotMatch(appSource, /managerToolTurnPreview|managerToolTurnSummary/);
    assert.doesNotMatch(appSource, /liveManagerChatDisplayItems|createManagerStreamToolDraftState/);
    const managerCss = readRepoFile('modules/tavern/app-src/styles/chat/manager.css');
    assert.match(managerCss, /\.manager-chat-log \{[\s\S]*min-height: max-content;[\s\S]*display: flex;/);
    assert.match(managerCss, /\.manager-chat-log > \* \{[\s\S]*flex: 0 0 auto;/);
    assert.doesNotMatch(managerCss, /\.manager-tool-turn|overflow: clip/);
});

test('tavern maintenance and assistant chat keep separate persistence, runtime, and UI lifecycles', () => {
    const maintenanceSource = readRepoFile('modules/tavern/app-src/runtime/manager.ts');
    const assistantRunnerSource = readRepoFile('modules/tavern/app-src/runtime/assistant-chat-runner.ts');
    const assistantContextSource = readRepoFile('modules/tavern/app-src/runtime/assistant-chat-context.ts');
    const sessionDbSource = readRepoFile('modules/tavern/shared/session-db.ts');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const phoneSource = readRepoFile('modules/tavern/app-src/features/phone-os/apps/messages/useTavernMessagesController.ts');

    assert.doesNotMatch(maintenanceSource, /TavernAssistantChatMessage|appendTavernAssistantChat|listTavernAssistantChat|deleteTavernAssistantChat/);
    assert.doesNotMatch(assistantRunnerSource, /createTavernManagerRun|updateTavernManagerRun|managerRun:/);
    assert.match(assistantContextSource, /listTavernAssistantChatMessages/);
    assert.doesNotMatch(assistantContextSource, /deleteTavernAssistantChatMessages/);
    assert.match(assistantContextSource, /const fixedContext = await estimateAssistantChatContext\([\s\S]*history: \[\][\s\S]*TAVERN_ASSISTANT_CHAT_MAX_CONTEXT_TOKENS[\s\S]*canProceed: false/);
    assert.match(sessionDbSource, /version13\.stores\(\{[\s\S]*managerMessages: null,[\s\S]*assistantChatMessages:/);
    assert.match(sessionDbSource, /filter\(\(run\) => !\['accepted_turn', 'after_turn'\]\.includes/);
    assert.match(sessionDbSource, /throw new Error\('maintenance_run_trigger_invalid'\)/);
    assert.match(sessionDbSource, /replaceTavernAssistantChatMessages[\s\S]*db\.transaction\('rw'[\s\S]*bulkDelete[\s\S]*bulkPut/);
    assert.match(appSource, /appendTavernAssistantChatMessage\(managerSessionId[\s\S]*ensureTavernAssistantChatBudget/);
    assert.match(appSource, /onUnmounted\([\s\S]*clearManagerLiveProtocolState\(\)[\s\S]*clearManagerMessageFeedback\(\)/);
    assert.doesNotMatch(phoneSource, /managerBusy|isManagerAssistantRunning/);
});

test('tavern settings and chat pages reset ephemeral expanded DOM on scope changes', () => {
    const worldbookSource = readRepoFile('modules/tavern/app-src/components/settings/TavernWorldbooksSettingsPanel.vue');
    const chatPresetSource = readRepoFile('modules/tavern/app-src/components/settings/TavernChatPresetSettingsPanel.vue');
    const regexSource = readRepoFile('modules/tavern/app-src/components/settings/TavernRegexSettingsPanel.vue');
    const conversationSource = readRepoFile('modules/tavern/app-src/components/chat/TavernConversationPanel.vue');
    const managerSource = readRepoFile('modules/tavern/app-src/components/chat/TavernManagerPanel.vue');

    assert.match(worldbookSource, /watch\(\s*\[\s*activeSettingsWorkspace,\s*selectedWorldbookName/);
    assert.match(chatPresetSource, /const shouldMountPromptEditor = computed/);
    assert.match(chatPresetSource, /v-if="shouldMountPromptEditor"/);
    assert.match(chatPresetSource, /class="prompt-editor-close"[\s\S]*v-if="isMobileSettingsViewport"|v-if="isMobileSettingsViewport"[\s\S]*class="prompt-editor-close"/);
    assert.match(chatPresetSource, /watch\(activeSettingsWorkspace[\s\S]*workspace !== 'chatPreset'[\s\S]*mobileEditorOpen\.value = false/);
    assert.match(regexSource, /const shouldMountRegexEditor = computed/);
    assert.match(regexSource, /v-if="shouldMountRegexEditor"/);
    assert.match(regexSource, /watch\(activeSettingsWorkspace[\s\S]*workspace !== 'regex'[\s\S]*mobileRegexEditorOpen\.value = false/);
    assert.match(regexSource, /const selectedKeyAtRequest = selectedRegexKey\.value;[\s\S]*await saveCurrentRegexScript\(\);[\s\S]*selectedRegexKey\.value === selectedKeyAtRequest[\s\S]*closeRegexEditor\(\)/);
    assert.match(conversationSource, /watch\(\s*\[\s*activeView,\s*chatFocus,\s*selectedSessionId\s*\][\s\S]*thoughtDisclosure\.reset\(\)/);
    assert.match(managerSource, /watch\(\s*\[\s*activeView,\s*chatFocus\s*\][\s\S]*managerWorkDisclosure\.reset\(\)[\s\S]*assistantChatDisclosure\.reset\(\)/);
    assert.match(managerSource, /watch\(session\.selectedSessionId[\s\S]*managerWorkDisclosure\.reset\(\)[\s\S]*assistantChatDisclosure\.reset\(\)/);
});

test('tavern edited RP messages use native macro substitution before saving', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const editPanelSource = readRepoFile('modules/tavern/app-src/components/chat/TavernMessageEditPanel.vue');
    const contextSource = readRepoFile('modules/tavern/app-src/components/tavern-app-context.ts');

    assert.match(appSource, /function buildUiSubstituteParamsOptions/);
    assert.match(appSource, /async function substituteEditedMessageContent/);
    assert.match(contextSource, /saveEditMessage: TavernCommand<\[message: TavernMessageRecord, options\?: \{ rollbackState\?: boolean; content\?: string \}\], Promise<void>>;/);
    assert.match(editPanelSource, /event: 'save', options: \{ content: string; rollbackState\?: boolean \}/);
    assert.match(editPanelSource, /const draft = ref\(''\);/);
    assert.doesNotMatch(editPanelSource, /modelValue|update:modelValue|localStorage|IndexedDB/);
    assert.match(editPanelSource, /function scheduleAutoSizeEditor\(\)[\s\S]*requestAnimationFrame/);
    assert.match(editPanelSource, /if \(event\.key === 'Escape'\) \{[\s\S]*event\.preventDefault\(\);[\s\S]*event\.stopPropagation\(\);[\s\S]*emit\('cancel'\);[\s\S]*return;/);
    assert.match(editPanelSource, />\s*仅保存\s*<\/button>/);
    assert.match(editPanelSource, /@click="save\(\{ rollbackState: true \}\)"[\s\S]*>\s*回滚保存\s*<\/button>/);
    assert.doesNotMatch(editPanelSource, /重来/);
    assert.doesNotMatch(editPanelSource, /save\(\{ rerun: true \}\)/);
    assert.doesNotMatch(editPanelSource, /保存并从这里重来|保存修改/);
    assert.match(appSource, /const shouldRollbackState = options\.rollbackState === true;/);
    assert.match(appSource, /async function saveEditMessage\(message: TavernMessageRecord, options: \{ rollbackState\?: boolean; content\?: string \} = \{\}\) \{/);
    assert.doesNotMatch(appSource, /async function saveEditMessage\(message: TavernMessageRecord, options: \{ rerun\?: boolean/);
    assert.doesNotMatch(appSource, /shouldClearRuntimeEvents/);
    assert.doesNotMatch(appSource, /function rollbackImpactLines\(impact: AcceptedStateRollbackImpact\): string\[] \{/);
    assert.match(appSource, /rollbackImpactLines\(impact\)/);
    assert.match(appSource, /const impact = await describeAcceptedStateRollbackImpact\(message\.sessionId, message\.order\);[\s\S]*if \(impact\.willRollbackState \|\| impact\.willCancelWork\)/);
    assert.doesNotMatch(appSource, /回滚这一楼之后的记忆和事件状态/);
    assert.match(appSource, /applyTavernSubstituteParams\(\[\{\s*id: `edit:\$\{message\.sessionId\}:\$\{message\.order\}`,[\s\S]*buildUiSubstituteParamsOptions/);
    assert.match(appSource, /const substitutedContent = await substituteEditedMessageContent\(message, content\);[\s\S]*const regexedContent = await applyEditRegexToMessageContent\(message, substitutedContent\);[\s\S]*updateTavernMessage\(message\.sessionId, message\.order, \{\s*content: regexedContent,/);
    assert.doesNotMatch(appSource, /\.\.\.\(shouldClearRuntimeEvents \? \{ runtimeEvents: \[\] \} : \{\}\),/);
    assert.doesNotMatch(appSource, /\.\.\.\(message\.role === 'user' \? \{ runtimeEvents: \[\] \} : \{\}\)/);
    assert.match(appSource, /if \(editingMessageKey\.value === messageKey\(message\)\) \{[\s\S]*editingMessageKey\.value = '';[\s\S]*\}/);
    const saveEditBody = appSource.slice(
        appSource.indexOf('async function saveEditMessage'),
        appSource.indexOf('async function saveEditManagerMessage'),
    );
    assert.doesNotMatch(saveEditBody, /resolveTavernHistoryBoundaryState|replaceTavernSessionState|runtimeStateSnapshot|worldEntryStates/);
});

test('tavern RP display and edit save use native regex phases without slash command placement', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const chatRunSource = readRepoFile('modules/tavern/app-src/features/chat-run/useTavernChatRunController.ts');
    const contextSource = readRepoFile('modules/tavern/app-src/components/tavern-app-context.ts');
    const conversationSource = readRepoFile('modules/tavern/app-src/components/chat/TavernConversationPanel.vue');
    const assistantBubbleSource = readRepoFile('modules/tavern/app-src/components/chat/TavernAssistantBubble.vue');
    const chatTimelineSource = readRepoFile('modules/tavern/app-src/components/chat/chat-timeline.ts');
    const sharedRegexSource = readRepoFile('modules/tavern/shared/regex.ts');
    const runtimeProjectionSource = readRepoFile('modules/tavern/app-src/features/chat-render/useTavernRuntimeDisplayProjection.ts');

    assert.match(contextSource, /displayMessageContent: TavernCommand/);
    assert.match(contextSource, /displayMessageRenderProjection: TavernCommand/);
    assert.match(contextSource, /displayMessageThoughtBlocks: TavernCommand/);
    assert.doesNotMatch(contextSource, /displayRuntimeContent: TavernCommand/);
    assert.match(contextSource, /displayRuntimeRenderProjection: TavernCommand/);
    assert.match(contextSource, /displayRuntimeThoughtBlocks: TavernCommand/);
    assert.match(assistantBubbleSource, /chat\.displayMessageRenderProjection\(message\)/);
    assert.match(assistantBubbleSource, /injectActionCheckRenderMarkers\(projection\.text, projection\.actionCheckEvents\)/);
    assert.match(conversationSource, /v-for="rawThoughts in \[thoughtBlocks\(message\)\]"/);
    assert.match(assistantBubbleSource, /displayThoughts = computed\(\(\) => \{[\s\S]*useRuntimePresentation\.value \|\| !message/);
    assert.match(assistantBubbleSource, /v-for="\(thought, thoughtIndex\) in displayThoughts"/);
    assert.match(assistantBubbleSource, /chat\.displayRuntimeRenderProjection\(\)/);
    assert.match(assistantBubbleSource, /chat\.displayRuntimeThoughtBlocks\(\)/);
    assert.doesNotMatch(conversationSource, /runtimeText|runtimeThoughts|runtimeActionCheckEvents/);
    assert.doesNotMatch(conversationSource, /displayMessageThoughtBlocks\(message\)\.length/);
    assert.doesNotMatch(conversationSource, /displayRuntimeThoughtBlocks\(runtimeThoughts\)\.length/);
    assert.match(appSource, /function displayMessageContent\(message: TavernMessageRecord\): string/);
    assert.match(appSource, /function displayMessageRenderProjection\(message: TavernMessageRecord\): DisplayRegexProjection/);
    assert.doesNotMatch(appSource, /function displayRuntimeContent/);
    assert.match(appSource, /function displayRuntimeRenderProjection\(\): DisplayRegexProjection/);
    assert.match(appSource, /function runtimeMessageDisplayRequest\(\)[\s\S]*const actionCheckEvents = getActionCheckEvents\(runtimeActionCheckEvents\.value\);[\s\S]*if \(!text\) \{return \{ request: null, fallback \};\}/);
    assert.match(appSource, /injectActionCheckRegexMarkers\(text, actionCheckEvents\)/);
    assert.match(appSource, /toDisplayRegexProjection\(cached, request\)/);
    assert.match(appSource, /runtimeDisplayProjectionController\.setMessageInput\(message\.request, message\.fallback\)/);
    assert.doesNotMatch(appSource, /rememberDisplayRegexText\(key, text\)[\s\S]{0,120}runtimeDisplay/);
    assert.match(appSource, /const RUNTIME_DISPLAY_REGEX_THROTTLE_MS = 200/);
    assert.match(appSource, /function clearRuntimeDisplayRegexRequests\(\)[\s\S]*runtimeDisplayProjectionController\.clear\(\)/);
    assert.match(appSource, /function clearDisplayRegexCache\(\)[\s\S]*clearRuntimeDisplayRegexRequests\(\)/);
    assert.match(appSource, /clearRuntimeDisplayRegexRequests,/);
    assert.match(chatRunSource, /function clearRuntimeAssistantLiveState\(\) \{[\s\S]*options\.clearRuntimeDisplayRegexRequests\(\)/);
    assert.match(runtimeProjectionSource, /function scheduleSlot\(slot: string, request: TavernRuntimeDisplayRegexRequest\)/);
    assert.match(runtimeProjectionSource, /const pending = pendingSlots\.get\(slot\);[\s\S]*pending\.latest = request;[\s\S]*return;/);
    assert.match(runtimeProjectionSource, /current !== pending \|\| current\.latest\.key !== request\.key/);
    assert.match(runtimeProjectionSource, /current\.latest\.key !== request\.key[\s\S]*runSlot\(slot\)/);
    assert.match(runtimeProjectionSource, /\.catch\(\(error\) => \{[\s\S]*return request\.text;/);
    assert.doesNotMatch(runtimeProjectionSource, /displayRegexCache|rememberDisplayRegexText/);
    assert.match(appSource, /placement: 'reasoning'[\s\S]*options: \{\s*isMarkdown: true,\s*depth,/);
    assert.match(appSource, /options: \{\s*isMarkdown: true,\s*depth,\s*characterOverride,/);
    assert.match(appSource, /const messageDisplayDepthByKey = computed\(\(\) => \{[\s\S]*buildTavernMessageDisplayDepths\(\{[\s\S]*messages: loadedSessionMessages\.value,[\s\S]*liveAssistantKey: runtimeAssistantMessageKey\.value,[\s\S]*isDisplayMessage: isNormalRoleplayDisplayMessage,/);
    assert.match(chatTimelineSource, /const latestLogicalOrder = Math\.max\(latestPersistedOrder, liveAssistantOrder\);[\s\S]*Math\.max\(0, latestLogicalOrder - order\)/);
    assert.match(appSource, /function isNormalRoleplayDisplayMessage\(message: TavernMessageRecord\): boolean[\s\S]*&& !message\.error[\s\S]*String\(message\.content \|\| ''\)\.trim\(\)/);
    assert.match(appSource, /catch \(error\) \{[\s\S]{0,220}generation === displayRegexCacheGeneration[\s\S]*rememberDisplayRegexText\(input\.key, input\.text\)/);
    assert.match(appSource, /async function applyEditRegexToMessageContent/);
    assert.match(appSource, /options: \{\s*isEdit: true,\s*characterOverride: messageCharacterOverride\(message\),\s*\}/);
    assert.doesNotMatch(sharedRegexSource, /slash/i);
});

test('tavern native regex writes refresh SillyTavern regex UI and cache', () => {
    const hostSource = readRepoFile('modules/tavern/host/regex.ts');
    const envSource = readRepoFile('modules/tavern/env.d.ts');
    assert.doesNotMatch(hostSource, /RegexProvider,\s*[\r\n]/);
    assert.doesNotMatch(hostSource, /import\s*\{[\s\S]*RegexProvider[\s\S]*\}\s*from/);
    assert.match(hostSource, /import\s+\*\s+as\s+nativeRegexEngine/);
    assert.match(hostSource, /function syncNativeRegexUiAfterWrite/);
    assert.match(hostSource, /nativeRegexEngine\.RegexProvider\?\./);
    assert.match(envSource, /export const RegexProvider: \{ instance\?: \{ clear\?: \(\) => void \} \} \| undefined;/);
    assert.match(hostSource, /saveSettingsDebounced\?\.\(\)/);
    assert.match(hostSource, /event_types\?\.CHAT_CHANGED/);
    assert.match(hostSource, /await eventSource\.emit\(chatChangedEvent, chatId\)/);
    assert.doesNotMatch(hostSource, /reloadCurrentChat/);
    assert.match(hostSource, /export async function saveTavernRegexScript[\s\S]*await syncNativeRegexUiAfterWrite\(\)/);
    assert.match(hostSource, /export async function deleteTavernRegexScript[\s\S]*await syncNativeRegexUiAfterWrite\(\)/);
});

test('tavern host imports preserve SillyTavern 1.14 and 1.18 API parity', () => {
    const envSource = readRepoFile('modules/tavern/env.d.ts');
    const promptSource = readRepoFile('modules/tavern/host/native-prompt.ts');
    const worldbookSource = readRepoFile('modules/tavern/host/worldbooks.ts');

    assert.doesNotMatch(promptSource, /import\s*\{[^}]*persona_description_positions[^}]*\}\s*from\s*['"][^'"]*personas\.js['"]/);
    assert.match(promptSource, /import\s*\{[^}]*persona_description_positions[^}]*power_user[^}]*\}\s*from\s*['"][^'"]*power-user\.js['"]/);

    assert.doesNotMatch(worldbookSource, /import\s*\{[^}]*getMaxPromptTokens[^}]*\}\s*from\s*['"][^'"]*script\.js['"]/);
    assert.match(worldbookSource, /import\s+\*\s+as\s+stScript\s+from\s*['"][^'"]*script\.js['"]/);
    assert.match(worldbookSource, /function getNativeMaxPromptTokens\(\): number/);
    assert.match(envSource, /export const getMaxPromptTokens: \(\(overrideResponseLength\?: number \| null\) => number\) \| undefined;/);
    assert.match(envSource, /export const getMaxContextSize: \(\(\) => number\) \| undefined;/);
    assert.match(worldbookSource, /stScript\.getMaxPromptTokens\?\.\(\)/);
    assert.match(worldbookSource, /stScript\.getMaxContextSize\?\.\(\)/);

    assert.doesNotMatch(worldbookSource, /import\s*\{[^}]*updateWorldInfoSettings[^}]*\}\s*from\s*['"][^'"]*world-info\.js['"]/);
    assert.match(worldbookSource, /import\s+\*\s+as\s+nativeWorldInfo\s+from\s*['"][^'"]*world-info\.js['"]/);
    assert.match(worldbookSource, /function applyGlobalWorldbookSelection\(selected: string\[\]\): void/);
    assert.match(envSource, /export const updateWorldInfoSettings: \(\(settings: Record<string, unknown>, activeWorldInfo\?: string\[\]\) => void\) \| undefined;/);
    assert.match(worldbookSource, /typeof nativeWorldInfo\.updateWorldInfoSettings === 'function'/);
    assert.match(worldbookSource, /nativeWorldInfo\.updateWorldInfoSettings\(settings, selected\);[\s\S]*worldInfo\.globalSelect = \[\.\.\.selected\];[\s\S]*stScript\.saveSettingsDebounced\?\.\(\);[\s\S]*return;/);
    assert.match(worldbookSource, /replaceSelectedWorldInfo\(selected\);[\s\S]*worldInfo\.globalSelect = \[\.\.\.selected\];[\s\S]*stScript\.saveSettingsDebounced\?\.\(\)/);
    assert.doesNotMatch(worldbookSource, /setWorldInfoSettings\(settings,/);
});

test('tavern character identity uses stable keys and explicit native ids', () => {
    const hostSource = readRepoFile('modules/tavern/host/sillytavern-context.ts');
    const sharedContextSource = readRepoFile('modules/tavern/shared/sillytavern-context.ts');
    const messageAssemblerSource = readRepoFile('modules/tavern/shared/message-assembler.ts');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const settingsControllerSource = readRepoFile('modules/tavern/app-src/components/settings/useTavernSettingsController.ts');
    const sessionSource = readRepoFile('modules/tavern/shared/session-db.ts');
    const appSessionSource = readRepoFile('modules/tavern/app-src/features/session/useTavernSessionController.ts');
    const runtimeSource = readRepoFile('modules/tavern/app-src/runtime/run-once.ts');
    const worldbookSource = readRepoFile('modules/tavern/host/worldbooks.ts');
    const nativePromptSource = readRepoFile('modules/tavern/host/native-prompt.ts');
    const regexSource = readRepoFile('modules/tavern/host/regex.ts');

    assert.match(hostSource, /nativeCharacterId\?: string \| number/);
    assert.match(hostSource, /function buildCharacterKey/);
    assert.match(hostSource, /characterKey: buildCharacterKey\(character, nativeCharacterId\)/);
    assert.match(hostSource, /nativeCharacterId: String\(index\)/);
    assert.match(hostSource, /function resolveNativeCharacterId[\s\S]*return options\.nativeCharacterId;/);
    assert.match(hostSource, /if \(avatar\) \{[\s\S]*return `avatar:\$\{avatar\}`;[\s\S]*\}/);
    assert.doesNotMatch(hostSource, /return `avatar:\$\{avatar\}:\$\{name|return `avatar:\$\{avatar\}:[^`]*hash/);
    assert.doesNotMatch(hostSource, /options\.characterId|ctx\.characterId|ctx\.this_chid/);
    assert.match(sharedContextSource, /if \(avatar\) \{return `avatar:\$\{avatar\}`;\}/);
    assert.doesNotMatch(sharedContextSource, /return `avatar:\$\{avatar\}:\$\{name|return `avatar:\$\{avatar\}:[^`]*hash/);
    assert.doesNotMatch(sharedContextSource, /return `name:\$\{[^`]*nativeCharacterId/);
    const characterInterface = messageAssemblerSource.match(/export interface XbTavernCharacter \{[\s\S]*?\n\}/)?.[0] || '';
    assert.ok(characterInterface);
    assert.doesNotMatch(characterInterface, /\bid\?: string;/);

    assert.match(sessionSource, /characterKey\?: string;/);
    assert.match(sessionSource, /this\.version\(8\)\.stores\(\{[\s\S]*sessions: 'id, updatedAt, characterKey, characterName'/);
    assert.match(sessionSource, /characterKey: String\(input\.characterKey \|\| ''\)/);
    assert.match(sessionSource, /characterKey: 'characterKey' in patch/);
    assert.match(runtimeSource, /function resolveSessionContext\([\s\S]*sessionCharacterKey[\s\S]*fallbackCharacterKey[\s\S]*sessionCharacterKey !== fallbackCharacterKey[\s\S]*throw new Error\('会话角色身份不匹配，请重新选择对应角色会话。'\);/);

    assert.match(appSource, /const selectedCharacterPreviewKey = ref\(''\);/);
    assert.match(appSource, /const pendingCharacterSessionKey = ref\(''\);/);
    assert.match(appSource, /const selectedSessionCharacterError = ref\(''\);/);
    assert.match(appSource, /function resolveCurrentNativeCharacterId\(characterKey = ''/);
    assert.match(appSource, /throw new Error\('角色卡已不存在或文件名变化，请重新选择角色。'\);/);
    assert.match(appSource, /function canApplyHostContext\(nextContext: XbTavernContext = \{\}\): boolean \{[\s\S]*String\(nextContext\.character\?\.characterKey \|\| ''\)\.trim\(\) === selectedKey;/);
    assert.match(appSource, /function assertContextMatchesCharacterKey\(nextContext: XbTavernContext = \{\}, characterKey = ''\): void \{[\s\S]*actualKey !== expectedKey[\s\S]*throw new Error\('刷新到的角色卡与当前会话不一致，请重新选择角色。'\);/);
    assert.match(appSource, /function applyHostPayload\(payload: Record<string, unknown>\) \{[\s\S]*if \(canApplyHostContext\(nextContext\)\) \{[\s\S]*context\.value = nextContext;/);
    assert.match(appSource, /const nextContext = preserveSessionAuthorNote\(payload\.context as XbTavernContext \|\| context\.value, session\);[\s\S]*assertContextMatchesCharacterKey\(nextContext, targetCharacterKey\);[\s\S]*updateTavernSessionSnapshot/);
    assert.match(appSource, /async function refreshCharacterList\(\) \{[\s\S]*const payload = await getHostContext\(\{ includeHistory: false, includeWorldbooks: false \}\);[\s\S]*applyCharacterListPayload\(payload\);/);
    assert.match(appSource, /function applySessionSnapshotContext\(session\?: TavernSessionRecord \| null\): void[\s\S]*context\.value = preserveSessionAuthorNote\(session\.contextSnapshot \|\| \{\}, session\);/);
    assert.match(appSource, /async function syncSessionCharacterContextSafely[\s\S]*catch \(error\) \{[\s\S]*setSelectedSessionCharacterError\(error, targetSessionId\);/);
    assert.match(appSource, /applySessionSnapshotContext,/);
    assert.match(appSource, /syncSessionCharacterContextSafely,/);
    assert.match(appSessionSource, /async function selectSession\(sessionId: string\)[\s\S]*options\.applySessionSnapshotContext\(session\);[\s\S]*void options\.syncSessionCharacterContextSafely\(\{ sessionId: id, force: true \}\);/);
    assert.doesNotMatch(appSource, /void syncSessionCharacterContext\(\{/);
    assert.match(appSource, /\.filter\(\(session\) => String\(session\.characterKey \|\| ''\)\.trim\(\) === characterKey\)/);
    assert.match(appSource, /postToHost\('xb-tavern:refresh-context', \{ nativeCharacterId, includeHistory: false \}\)/);
    assert.doesNotMatch(appSource, /postToHost\('xb-tavern:refresh-context', \{\}\)/);
    assert.doesNotMatch(appSource, /selectedCharacterId|selectedCharacterPreviewId|pendingCharacterPreviewId|pendingCharacterSessionId|session\.characterId|payload: \{ characterId/);
    assert.match(settingsControllerSource, /function refreshCurrentHostContext\(\): void \{[\s\S]*const nativeCharacterId = String\(options\.currentNativeCharacterId\.value \|\| ''\)\.trim\(\);[\s\S]*options\.postToHost\('xb-tavern:refresh-context', \{ nativeCharacterId, includeHistory: false \}\);/);
    assert.doesNotMatch(settingsControllerSource, /postToHost\('xb-tavern:refresh-context', \{\}\)/);

    assert.match(worldbookSource, /payload\.nativeCharacterId/);
    assert.doesNotMatch(worldbookSource, /payload\.characterId|isCurrentCharacter|currentCharacterId/);
    assert.match(nativePromptSource, /context\.character\?\.nativeCharacterId/);
    assert.match(regexSource, /function currentCharacter\(nativeCharacterId: unknown\)/);
    assert.match(regexSource, /function hasCharacterExtensionContainer\(character: Record<string, unknown>\)[\s\S]*hasOwnProperty\.call\(data, 'extensions'\)/);
    assert.match(regexSource, /function characterJsonData\(character: Record<string, unknown>\)[\s\S]*JSON\.parse\(raw\)/);
    assert.match(regexSource, /function hasScopedRegexScripts\(value: Record<string, unknown>\)[\s\S]*extensions\.regex_scripts[\s\S]*rootExtensions\.regex_scripts/);
    assert.match(regexSource, /function shouldHydrateCharacterForRegex\(character: Record<string, unknown>\)[\s\S]*hasScopedRegexScripts\(characterJsonData\(character\)\) && !hasScopedRegexScripts\(character\)/);
    assert.match(regexSource, /avatar && avatar !== 'none' && shouldHydrateCharacterForRegex\(character\)/);
    assert.match(regexSource, /function readScopedScripts\(character: Record<string, unknown>\): TavernRegexScript\[\][\s\S]*extensions\.regex_scripts/);
    assert.match(regexSource, /await writeExtensionField\(nativeCharacterId, 'regex_scripts', scripts\)/);
    assert.match(regexSource, /runRegexScript\(script, current, \{ characterOverride: text\(options\.characterOverride\) \}\)/);
    assert.doesNotMatch(regexSource, /getRegexedString/);
    assert.doesNotMatch(regexSource, /getScriptsByType\(SCRIPT_TYPES\.SCOPED/);
    assert.doesNotMatch(regexSource, /saveScriptsByType\(scripts, SCRIPT_TYPES\.SCOPED/);
    assert.match(regexSource, /return \[\.\.\.globalScripts, \.\.\.presetScripts, \.\.\.scopedScripts\]/);
    assert.match(regexSource, /function runWithRegexCharacterContext/);
    assert.match(regexSource, /const originalCharacterId = this_chid/);
    assert.match(regexSource, /setCharacterId\(nativeCharacterId\);[\s\S]*setCharacterName\(text\(character\.name\)\);[\s\S]*return task\(\);[\s\S]*finally \{[\s\S]*setCharacterId\(originalCharacterId \?\? undefined\);[\s\S]*setCharacterName\(originalName \|\| ''\);/);
    assert.match(appSource, /const hasExplicitNativeCharacterId = Object\.prototype\.hasOwnProperty\.call\(options, 'nativeCharacterId'\);[\s\S]*const nativeCharacterId = String\(hasExplicitNativeCharacterId \? options\.nativeCharacterId \|\| '' : currentNativeCharacterId\.value \|\| ''\)\.trim\(\);[\s\S]*payload: \{[\s\S]*nativeCharacterId,[\s\S]*items,[\s\S]*\}/);
    assert.match(appSource, /String\(selectedSession\.value\?\.contextSnapshot\?\.character\?\.nativeCharacterId \|\| ''\)\.trim\(\)/);
    assert.match(appSource, /function applyTavernRegexForNativeCharacter\(nativeCharacterId = ''\)/);
    assert.match(appSource, /const runtimeApplyRegex = applyTavernRegexForNativeCharacter\(runtimeContext\.character\?\.nativeCharacterId\)/);
    assert.match(appSource, /message\.sessionId,[\s\S]*String\(currentNativeCharacterId\.value \|\| ''\),[\s\S]*String\(message\.order\)/);
    assert.match(settingsControllerSource, /let regexRefreshRequestSerial = 0;/);
    assert.match(settingsControllerSource, /let regexMutationRequestSerial = 0;/);
    assert.match(settingsControllerSource, /const requestSerial = \+\+regexRefreshRequestSerial;[\s\S]*options\.regexNativeCharacterId\.value[\s\S]*requestHost\('xb-tavern:list-regex-scripts'[\s\S]*requestSerial !== regexRefreshRequestSerial/);
    assert.match(settingsControllerSource, /const regexLoadedNativeCharacterId = ref\(''\);/);
    assert.match(settingsControllerSource, /function currentRegexNativeCharacterId\(\): string \{[\s\S]*options\.regexNativeCharacterId\.value/);
    assert.match(settingsControllerSource, /function regexDraftNativeCharacterId\(\): string \{[\s\S]*regexLoadedNativeCharacterId\.value \|\| currentRegexNativeCharacterId\(\)/);
    assert.match(settingsControllerSource, /async function refreshRegexAfterStaleMutation\(targetNativeCharacterId: string\)[\s\S]*targetNativeCharacterId === currentRegexNativeCharacterId\(\)[\s\S]*regexLoadedNativeCharacterId\.value = '';[\s\S]*regexList\.value = \{\};[\s\S]*refreshRegexFromHost\(\)/);
    assert.match(settingsControllerSource, /regexLoadedNativeCharacterId\.value = nativeCharacterId;[\s\S]*regexList\.value = \(result\.result \|\| result\)/);
    assert.match(settingsControllerSource, /const targetNativeCharacterId = regexDraftNativeCharacterId\(\);[\s\S]*const mutationSerial = \+\+regexMutationRequestSerial;[\s\S]*nativeCharacterId: targetNativeCharacterId,[\s\S]*scriptType,[\s\S]*script: regexDraft\.value[\s\S]*refreshRegexAfterStaleMutation\(targetNativeCharacterId\)/);
    assert.match(settingsControllerSource, /payload: \{ nativeCharacterId: targetNativeCharacterId, scriptType, id \}[\s\S]*refreshRegexAfterStaleMutation\(targetNativeCharacterId\)/);
    assert.match(settingsControllerSource, /options\.regexNativeCharacterId\.value[\s\S]*const regexCharacterChanged = regexWorkspaceActive && nativeCharacterId !== previousNativeCharacterId;[\s\S]*enteredRegexWorkspace \|\| regexCharacterChanged \|\| !regexGroups\.value\.length/);
});
