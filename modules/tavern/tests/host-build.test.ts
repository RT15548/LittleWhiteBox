import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../..');

function readRepoFile(path: string): string {
    return readFileSync(resolve(root, path), 'utf8');
}

function cssRuleBlock(source: string, selector: string): string {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return [...source.matchAll(new RegExp(`${escaped}\\s*\\{[^}]*\\}`, 'g'))].at(-1)?.[0] || '';
}

function cssDeclarationValues(rule: string, property: string): string[] {
    const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return [...rule.matchAll(new RegExp(`${escaped}:\\s*([^;]+);`, 'g'))].map((match) => String(match[1] || '').trim());
}

test('tavern host build script compiles every host module imported by tavern.ts', () => {
    const tavernSource = readRepoFile('modules/tavern/tavern.ts');
    const buildSource = readRepoFile('scripts/build-tavern-host.mjs');
    const hostImports = [...tavernSource.matchAll(/from ['"]\.\/host\/([^'"]+)\.js['"]/g)]
        .map((match) => `modules/tavern/host/${match[1]}.ts`)
        .sort();
    const entryPoints = [...buildSource.matchAll(/['"](modules\/tavern\/host\/[^'"]+\.ts)['"]/g)]
        .map((match) => match[1])
        .sort();

    assert.deepEqual(
        hostImports.filter((path) => !entryPoints.includes(path)),
        [],
    );
});

test('tavern host build script compiles shared runtime modules imported by host modules', () => {
    const buildSource = readRepoFile('scripts/build-tavern-host.mjs');
    const hostSources = readdirSync(resolve(root, 'modules/tavern/host'))
        .filter((name) => name.endsWith('.ts'))
        .map((name) => readRepoFile(`modules/tavern/host/${name}`));
    const sharedImports = hostSources.flatMap((source) => [...source.matchAll(/^\s*import\s+(?!type)[^;]*?from ['"]\.\.\/shared\/([^'"]+)\.js['"];?/gm)]
        .map((match) => `modules/tavern/shared/${match[1]}.ts`))
        .sort();
    const entryPoints = [...buildSource.matchAll(/['"](modules\/tavern\/(?:host|shared)\/[^'"]+\.ts)['"]/g)]
        .map((match) => match[1])
        .sort();

    assert.deepEqual(
        sharedImports.filter((path) => !entryPoints.includes(path)),
        [],
    );
});

test('tavern generated shared host runtime files are packaged for assistant lookup', () => {
    const buildSource = readRepoFile('scripts/build-tavern-host.mjs');
    const manifest = JSON.parse(readRepoFile('modules/assistant/assistant-file-manifest.json')) as { files?: Array<{ relativePath?: string }> };
    const generatedPath = 'modules/tavern/shared/message-assembler.js';

    assert.match(buildSource, /['"]modules\/tavern\/shared\/message-assembler\.ts['"]/);
    assert.equal(existsSync(resolve(root, generatedPath)), true);
    assert.equal(
        (manifest.files || []).some((file) => file.relativePath === generatedPath),
        true,
    );
});

test('tavern host replies sanitize payload before postMessage', () => {
    const tavernSource = readRepoFile('modules/tavern/tavern.ts');
    assert.match(tavernSource, /function cloneFramePayload/);
    assert.match(tavernSource, /const message = cloneFramePayload\(\{ type, payload \}\);/);
});

test('tavern host can return a fresh live context on demand', () => {
    const tavernSource = readRepoFile('modules/tavern/tavern.ts');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const markdownToolsSource = readRepoFile('modules/tavern/app-src/components/chat/useTavernMarkdownTools.ts');
    assert.match(tavernSource, /async function handleContextRequest/);
    assert.match(tavernSource, /case 'xb-tavern:get-context':/);
    assert.match(tavernSource, /case 'xb-tavern:run-slash-command':/);
    assert.match(tavernSource, /case 'xb-tavern:replace-html-render-vars':/);
    assert.match(tavernSource, /replaceXbGetVarInString/);
    assert.match(appSource, /requestHost\('xb-tavern:get-context'/);
    assert.match(appSource, /requestHost\('xb-tavern:run-slash-command'/);
    assert.match(markdownToolsSource, /requestHost\('xb-tavern:replace-html-render-vars'/);
});

test('tavern app requests sanitize payload before postMessage', () => {
    const bridgeSource = readRepoFile('modules/tavern/app-src/features/host-bridge/useTavernHostBridge.ts');
    assert.match(bridgeSource, /function clonePostMessagePayload/);
    assert.match(bridgeSource, /const safePayload = clonePostMessagePayload\(payload\);/);
});

test('tavern chat typography follows host SillyTavern font metrics inside the iframe', () => {
    const hostSource = readRepoFile('modules/tavern/host/sillytavern-context.ts');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const conversationPanelSource = readRepoFile('modules/tavern/app-src/components/chat/TavernConversationPanel.vue');
    const managerPanelSource = readRepoFile('modules/tavern/app-src/components/chat/TavernManagerPanel.vue');
    const markdownSource = readRepoFile('modules/agent-core/ui/message-markdown.js');
    const markdownToolsSource = readRepoFile('modules/tavern/app-src/components/chat/useTavernMarkdownTools.ts');
    const baseCss = readRepoFile('modules/tavern/app-src/styles/base.css');
    const markdownCss = readRepoFile('modules/tavern/app-src/styles/chat/markdown.css');
    const composeCss = readRepoFile('modules/tavern/app-src/styles/chat/compose.css');
    const managerCss = readRepoFile('modules/tavern/app-src/styles/chat/manager.css');
    const messagesCss = readRepoFile('modules/tavern/app-src/styles/chat/messages.css');
    const memoryCss = readRepoFile('modules/tavern/app-src/styles/chat/memory-editor.css');
    const tavernPreRule = cssRuleBlock(markdownCss, '.xb-tavern-markdown pre');
    const tavernPreCodeRule = cssRuleBlock(markdownCss, '.xb-tavern-markdown pre code');

    assert.match(hostSource, /function getHostTypographyMetrics/);
    assert.match(hostSource, /hostMainFontSizePx/);
    assert.match(hostSource, /hostProseLineHeightPx/);
    assert.match(appSource, /const hostMainFontSizePx = ref\('15px'\);/);
    assert.match(appSource, /const hostProseLineHeightPx = ref\('23px'\);/);
    assert.match(appSource, /--xb-host-main-font-size/);
    assert.match(appSource, /--xb-host-prose-line-height/);
    assert.match(conversationPanelSource, /copyMessage,/);
    assert.match(conversationPanelSource, /@click="copyMessage\(message\)"[\s\S]*actionFeedback\(message, 'copy'\) === 'success' \? '✓' : actionFeedback\(message, 'copy'\) === 'error' \? '!' : '⧉'/);
    assert.match(managerPanelSource, /@click="copyManagerMessage\(item\.message\)"[\s\S]*managerActionFeedback\(item\.message, 'copy'\) === 'success' \? '✓' : managerActionFeedback\(item\.message, 'copy'\) === 'error' \? '!' : '⧉'/);
    assert.match(markdownCss, /font-size: var\(--xb-tavern-reading-font-size, 15px\);/);
    assert.match(markdownCss, /\.xb-tavern-markdown pre \{[\s\S]*background: rgba\(26, 26, 26, 0\.035\);/);
    assert.match(tavernPreRule, /display: block;/);
    assert.match(tavernPreRule, /width: 100%;/);
    assert.match(tavernPreRule, /height: auto;/);
    assert.match(tavernPreRule, /max-height: none;/);
    assert.match(tavernPreRule, /overflow: visible;/);
    assert.match(tavernPreRule, /white-space: pre-wrap;/);
    assert.match(tavernPreRule, /overflow-wrap: anywhere;/);
    assert.match(tavernPreRule, /word-break: break-all;/);
    assert.match(tavernPreCodeRule, /display: inline;/);
    assert.match(tavernPreCodeRule, /max-height: none;/);
    assert.match(tavernPreCodeRule, /overflow: visible;/);
    assert.match(tavernPreCodeRule, /font: inherit;/);
    assert.doesNotMatch(tavernPreRule, /overflow-x: auto;/);
    assert.doesNotMatch(tavernPreRule, /white-space: pre;/);
    assert.deepEqual(cssDeclarationValues(tavernPreRule, 'max-height'), ['none']);
    assert.doesNotMatch(tavernPreCodeRule, /overflow-x: auto;/);
    assert.doesNotMatch(tavernPreCodeRule, /display: contents;/);
    assert.doesNotMatch(markdownCss, /\.xb-tavern-markdown pre \{[\s\S]*background: rgba\(10, 12, 18, 0\.28\);/);
    assert.match(baseCss, /\.xb-tavern-codeblock \{[\s\S]*max-height: none;[\s\S]*overflow: visible;/);
    assert.doesNotMatch(baseCss, /\.xb-tavern-codeblock pre \{[\s\S]*padding-top: 34px;/);
    assert.match(baseCss, /\.xb-tavern-code-copy \{[\s\S]*z-index: 2;[\s\S]*width: 24px;[\s\S]*height: 24px;[\s\S]*min-height: 24px;[\s\S]*border-radius: 7px;[\s\S]*touch-action: manipulation;/);
    assert.match(baseCss, /\.xb-tavern-code-copy\.is-copied \{[\s\S]*color: var\(--xb-ok\);/);
    assert.match(baseCss, /\.xb-tavern-code-copy\.is-failed \{[\s\S]*color: var\(--xb-danger\);/);
    assert.match(markdownSource, /async function copyText\(text = '', ownerDocument = null\)/);
    assert.match(markdownSource, /const doc = ownerDocument\?\.createElement \? ownerDocument : globalThis\.document;/);
    assert.match(markdownSource, /const flattenPreCode = options\.flattenPreCode === true;/);
    assert.match(markdownSource, /if \(flattenPreCode && codeNode\) \{[\s\S]*pre\.insertBefore\(codeNode\.firstChild, codeNode\);[\s\S]*codeNode\.remove\(\);/);
    assert.match(markdownToolsSource, /flattenPreCode: true,/);
    assert.match(markdownSource, /textarea\.style\.fontSize = '16px';[\s\S]*textarea\.focus\(\{ preventScroll: true \}\);[\s\S]*textarea\.focus\(\);/);
    assert.ok(
        markdownSource.indexOf("doc.execCommand?.('copy')") >= 0
        && markdownSource.indexOf("doc.execCommand?.('copy')") < markdownSource.indexOf('win.navigator?.clipboard?.writeText'),
        'markdown code copy should try the synchronous DOM clipboard path before async Clipboard API fallback',
    );
    assert.match(markdownSource, /copyButton\.addEventListener\('pointerdown', \(event\) => \{[\s\S]*event\.stopPropagation\(\);[\s\S]*\}\);/);
    assert.match(markdownSource, /copyButton\.addEventListener\('pointerup', \(event\) => \{[\s\S]*event\.stopPropagation\(\);[\s\S]*\}\);/);
    assert.match(markdownSource, /copyButton\.addEventListener\('touchstart', \(event\) => \{[\s\S]*event\.stopPropagation\(\);[\s\S]*\}, \{ passive: true \}\);/);
    assert.match(markdownSource, /copyButton\.addEventListener\('touchend', \(event\) => \{[\s\S]*event\.stopPropagation\(\);[\s\S]*\}, \{ passive: true \}\);/);
    assert.match(markdownSource, /copyButton\.addEventListener\('click', async \(event\) => \{[\s\S]*event\.preventDefault\(\);[\s\S]*event\.stopPropagation\(\);/);
    assert.match(markdownSource, /const copied = await copyText\(codeText, doc\);/);
    assert.match(markdownSource, /copyButton\.classList\.toggle\('is-copied', copied\);/);
    assert.match(messagesCss, /\.chat-bubble \{[\s\S]*--xb-chat-bubble-x: clamp\(5px, 0\.9vw, 10px\);[\s\S]*padding: 38px var\(--xb-chat-bubble-x\) var\(--xb-chat-bubble-x\);/);
    assert.match(messagesCss, /\.chat-bubble>\.xb-tavern-markdown \{\r?\n\s+margin: 0;\r?\n\s+padding-bottom: 0;/);
    assert.match(messagesCss, /@media \(max-width: 760px\) \{[\s\S]*\.chat-bubble \{[\s\S]*--xb-chat-bubble-x: 7px;[\s\S]*padding-top: 36px;/);
    assert.match(messagesCss, /\.chat-bubble>\.message-actions \{[\s\S]*position: absolute;[\s\S]*top: -1px;[\s\S]*right: -1px;[\s\S]*border-radius: 0 10px 0 8px;[\s\S]*opacity: 0;/);
    assert.match(messagesCss, /\.chat-bubble>\.message-actions button \{[\s\S]*width: 30px;[\s\S]*min-width: 30px;[\s\S]*height: 30px;[\s\S]*min-height: 30px;[\s\S]*padding: 0;/);
    assert.match(messagesCss, /@media \(max-width: 760px\) \{[\s\S]*\.chat-bubble>\.message-actions \{[\s\S]*opacity: 0;[\s\S]*pointer-events: none;[\s\S]*\.chat-bubble\.is-action-tray-open>\.message-actions[\s\S]*opacity: 1;[\s\S]*pointer-events: auto;/);
    assert.doesNotMatch(messagesCss, /\.message-actions \{[\s\S]*border-top: 1px solid rgba\(120, 112, 98, 0\.16\);/);
    assert.doesNotMatch(messagesCss, /\.message-actions \{[\s\S]*border-bottom: 1px solid rgba\(120, 112, 98, 0\.14\);/);
    assert.match(messagesCss, /\.tavern-chat\.xb-page \.chat-scroll \{[\s\S]*background: var\(--xb-chat-scroll-bg\);/);
    assert.doesNotMatch(messagesCss, /\.tavern-chat\.xb-page \.chat-scroll \{[\s\S]*repeating-linear-gradient/);
    assert.match(composeCss, /line-height: var\(--xb-tavern-reading-line-height, 23px\);/);
    assert.match(messagesCss, /font-size: var\(--xb-tavern-reading-font-size, 15px\);/);
    assert.match(memoryCss, /line-height: var\(--xb-host-prose-line-height, 23px\);/);
    assert.doesNotMatch(managerCss, /p:has\(\+ ul\)|p:has\(\+ ol\)|p \+ ul|p \+ ol|li > p/);
    assert.doesNotMatch(markdownCss, /\.manager-message \.xb-tavern-markdown p \+ ul|\.manager-message \.xb-tavern-markdown p \+ ol/);
    assert.doesNotMatch(markdownCss, /\.chat-bubble\.from-assistant \.xb-tavern-markdown li > p/);
    assert.match(markdownCss, /\.xb-tavern-markdown li \{[\s\S]*font-size: inherit;[\s\S]*line-height: inherit;[\s\S]*white-space: normal;/);
    assert.match(markdownCss, /\.xb-tavern-markdown li > p \{\r?\n\s+margin: 0;[\s\S]*?white-space: pre-wrap;/);
    assert.match(markdownCss, /\.xb-tavern-markdown li > ul,\r?\n\.xb-tavern-markdown li > ol \{\r?\n\s+margin-top: 2px;\r?\n\s+margin-bottom: 2px;/);
});

test('tavern chat font size preference scales reading typography relative to host metrics', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const markdownCss = readRepoFile('modules/tavern/app-src/styles/chat/markdown.css');
    const composeCss = readRepoFile('modules/tavern/app-src/styles/chat/compose.css');
    const messagesCss = readRepoFile('modules/tavern/app-src/styles/chat/messages.css');
    const memoryCss = readRepoFile('modules/tavern/app-src/styles/chat/memory-editor.css');

    assert.match(appSource, /:data-chat-font-size="tavernDisplaySettings\.chatFontSize"/);

    assert.match(markdownCss, /\[data-chat-font-size\] \{[\s\S]*--xb-tavern-reading-font-size: calc\(var\(--xb-host-main-font-size, 15px\) \+ var\(--xb-tavern-reading-font-offset, 0px\)\);[\s\S]*--xb-tavern-reading-line-height: calc\(var\(--xb-host-prose-line-height, 23px\) \+ var\(--xb-tavern-reading-line-offset, 0px\)\);/);
    assert.match(markdownCss, /\[data-chat-font-size='small'\] \{[\s\S]*--xb-tavern-reading-font-offset: 1px;[\s\S]*--xb-tavern-reading-line-offset: 2px;/);
    assert.match(markdownCss, /\[data-chat-font-size='medium'\] \{[\s\S]*--xb-tavern-reading-font-offset: 2px;[\s\S]*--xb-tavern-reading-line-offset: 4px;/);
    assert.match(markdownCss, /\[data-chat-font-size='large'\] \{[\s\S]*--xb-tavern-reading-font-offset: 3px;[\s\S]*--xb-tavern-reading-line-offset: 6px;/);

    assert.match(markdownCss, /\.xb-tavern-markdown \{[\s\S]*font-size: var\(--xb-tavern-reading-font-size, 15px\);[\s\S]*line-height: var\(--xb-tavern-reading-line-height, 23px\);/);
    assert.match(markdownCss, /\.xb-tavern-markdown p \{[\s\S]*font-size: inherit;[\s\S]*line-height: inherit;[\s\S]*white-space: pre-wrap;/);
    assert.match(markdownCss, /\.xb-tavern-markdown li \{[\s\S]*font-size: inherit;[\s\S]*line-height: inherit;[\s\S]*white-space: normal;/);
    assert.match(markdownCss, /\.xb-tavern-markdown strong,[\s\S]*\.xb-tavern-markdown b \{[\s\S]*font-size: inherit;[\s\S]*line-height: inherit;/);
    assert.match(composeCss, /\.chat-compose textarea \{[\s\S]*font-size: var\(--xb-tavern-reading-font-size, 15px\);[\s\S]*line-height: var\(--xb-tavern-reading-line-height, 23px\);/);
    assert.match(messagesCss, /\.action-check-card-copy \{[\s\S]*font-size: var\(--xb-tavern-reading-font-size, 15px\);[\s\S]*line-height: var\(--xb-tavern-reading-line-height, 23px\);/);
    assert.match(messagesCss, /\.action-check-card-stakes \{[\s\S]*font-size: calc\(var\(--xb-tavern-reading-font-size, 15px\) - 1px\);[\s\S]*line-height: var\(--xb-tavern-reading-line-height, 23px\);[\s\S]*overflow-wrap: anywhere;/);
    assert.match(messagesCss, /\.message-edit-box \{[\s\S]*font-size: var\(--xb-tavern-reading-font-size, 15px\);[\s\S]*line-height: var\(--xb-tavern-reading-line-height, 23px\);/);

    assert.doesNotMatch(markdownCss, /font-size: var\(--xb-host-main-font-size/);
    assert.doesNotMatch(composeCss, /font-size: var\(--xb-host-main-font-size/);
    assert.doesNotMatch(memoryCss, /--xb-tavern-reading-font-size|--xb-tavern-reading-line-height/);
    assert.match(memoryCss, /font-size: var\(--xb-host-main-font-size, 15px\);/);
});

test('tavern markdown blockquotes do not render showdown formatting whitespace as blank lines', () => {
    const markdownCss = readRepoFile('modules/tavern/app-src/styles/chat/markdown.css');

    assert.match(markdownCss, /\.xb-tavern-markdown p \{[\s\S]*font-size: inherit;[\s\S]*line-height: inherit;[\s\S]*white-space: pre-wrap;/);
    assert.match(markdownCss, /\.xb-tavern-markdown li \{[\s\S]*font-size: inherit;[\s\S]*line-height: inherit;[\s\S]*white-space: normal;/);
    assert.match(markdownCss, /\.xb-tavern-markdown li > p \{[\s\S]*?white-space: pre-wrap;/);
    assert.doesNotMatch(markdownCss, /\.xb-tavern-markdown blockquote[^{]*\{[^}]*white-space:\s*pre-wrap/);
    assert.match(markdownCss, /\.xb-tavern-markdown blockquote \{[\s\S]*?white-space: normal;[\s\S]*?\n\}/);
});

test('tavern worldbook settings page edits existing named entries without whole-book endpoints', () => {
    const panelSource = readRepoFile('modules/tavern/app-src/components/settings/TavernWorldbooksSettingsPanel.vue');
    assert.doesNotMatch(panelSource, /打开酒馆编辑器/);
    assert.doesNotMatch(panelSource, /openSelectedWorldbookEditor/);
    assert.match(panelSource, /worldbook-entry-preview-list/);
    assert.match(panelSource, /showMoreWorldbookPreviewEntries/);
    assert.match(panelSource, /startWorldbookEntryEdit/);
    assert.match(panelSource, /saveWorldbookEntryDraft/);
    assert.match(panelSource, /worldbookPreview\.entryCount/);
    assert.doesNotMatch(panelSource, /secondary_keys: listFromLines/);
    assert.doesNotMatch(panelSource, /酒馆世界书/);
    assert.doesNotMatch(panelSource, /xb-tavern:save-worldbook['"]/);
    assert.doesNotMatch(panelSource, /xb-tavern:create-worldbook-entry/);
    assert.doesNotMatch(panelSource, /xb-tavern:save-worldbook-settings/);
    assert.doesNotMatch(panelSource, /xb-tavern:set-worldbook-active/);
});

test('tavern character workspace keeps a dense index and selected-card preview', () => {
    const panelSource = readRepoFile('modules/tavern/app-src/components/TavernCharacterWorkspacePanel.vue');
    const layoutCss = readRepoFile('modules/tavern/app-src/styles/characters/layout.css');
    const cardsCss = readRepoFile('modules/tavern/app-src/styles/characters/cards.css');
    const previewCss = readRepoFile('modules/tavern/app-src/styles/characters/preview.css');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    assert.equal(existsSync(resolve(root, 'modules/tavern/app-src/components/TavernCharacterSelectPage.vue')), false);
    assert.match(panelSource, /class="character-index-panel"/);
    assert.match(panelSource, /character-preview-panel dossier-view/);
    assert.match(panelSource, /class="character-preview-panel dossier-empty"/);
    assert.match(panelSource, /class="os-search-bar"/);
    assert.match(panelSource, /class="card-focus-indicator"/);
    assert.match(panelSource, /class="dossier-header"/);
    assert.match(panelSource, /class="character-greeting-list"/);
    assert.match(panelSource, /备用 \$\{index\}/);
    assert.match(cardsCss, /content-visibility: auto/);
    assert.match(layoutCss, /width: 360px/);
    assert.match(previewCss, /\.dossier-header/);
    assert.match(appSource, /activeView === 'home' \|\| activeView === 'about'/);
    assert.match(appSource, /const previewKey = String\(selectedCharacterPreviewKey\.value \|\| ''\)\.trim\(\);/);
    assert.match(appSource, /async function selectCharacterForPreview/);
    assert.match(appSource, /getHostContext\(\s*\{\s*nativeCharacterId,\s*includeHistory: false,\s*includeWorldbooks: false\s*\}/);
    assert.doesNotMatch(appSource, /CHARACTER_CONTEXT_TIMEOUT_MS|host_request_timeout/);
    assert.match(appSource, /function hasCharacterPreviewDetails/);
    assert.match(appSource, /pendingCharacterPreviewKey/);
    assert.match(appSource, /function openCharacterSelect\(\)[\s\S]*openSettingsWorkspace\('characters'\)/);
    assert.doesNotMatch(appSource, /TavernCharacterSelectPage|activeView === 'characters'|activeView\.value = 'characters'|view === 'characters'/);
    assert.doesNotMatch(appSource, /document\.querySelectorAll<HTMLElement>\('\[data-character-card-id\]'\)/);
    assert.match(panelSource, /const listRef = ref<HTMLElement \| null>\(null\)/);
    assert.match(panelSource, /root\.querySelectorAll<HTMLElement>\('\[data-character-card-id\]'\)/);
    assert.doesNotMatch(panelSource, /刷新列表/);
    assert.doesNotMatch(panelSource, /这里不重写角色卡/);
    assert.doesNotMatch(panelSource, /archive-toolbar/);
    assert.doesNotMatch(panelSource, /character-archive-browser/);
    assert.doesNotMatch(layoutCss, /linear-gradient\(90deg, transparent 50%, var\(--xb-theme-split-bg\) 50%\)/);
});

test('tavern character list merges native character records when extension context is sparse', () => {
    const hostSource = readRepoFile('modules/tavern/host/sillytavern-context.ts');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    assert.match(hostSource, /characters as sillyTavernCharacters/);
    assert.match(hostSource, /getOneCharacter/);
    assert.match(hostSource, /unshallowCharacter/);
    assert.match(hostSource, /shallow: boolean/);
    assert.match(hostSource, /shallow: character\.shallow === true/);
    assert.match(hostSource, /function hydrateCharacterAt/);
    assert.match(hostSource, /normalizeText\(character\.json_data\)/);
    assert.match(hostSource, /await hydrateSelectedCharacter\(ctx, options\);/);
    assert.doesNotMatch(hostSource, /hydrateAvailableCharacters/);
    assert.match(hostSource, /function mergeCharacterRecord/);
    assert.match(hostSource, /const runtimeCharacters = asArray<Record<string, unknown>>\(sillyTavernCharacters\);/);
    assert.match(hostSource, /Math\.max\(contextCharacters\.length, runtimeCharacters\.length\)/);
    assert.match(hostSource, /mergeCharacterRecord\(asRecord\(runtimeCharacters\[index\]\), asRecord\(contextCharacters\[index\]\)\)/);
    assert.match(appSource, /current && current\.shallow !== true && hasCharacterPreviewDetails\(current\)/);
});

test('tavern chat creation waits for hydrated character context before adding greetings', () => {
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const assemblerSource = readRepoFile('modules/tavern/shared/message-assembler.ts');
    assert.match(appSource, /async function selectCharacterAndCreateSession\(characterKey: string\)/);
    assert.match(appSource, /pendingCharacterSessionKey\.value = targetKey/);
    assert.match(appSource, /postToHost\('xb-tavern:refresh-context', \{ nativeCharacterId, includeHistory: false \}\)/);
    assert.match(appSource, /function applyHostPayload/);
    assert.match(appSource, /finishPendingCharacterSession\(\)/);
    assert.match(appSource, /await createSessionAndOpenChat\(\{ greetingIndex \}\)/);
    assert.match(appSource, /function getCharacterGreetingOptions/);
    assert.match(appSource, /character\.firstMessage \|\| character\.first_mes/);
    assert.match(appSource, /character\.alternateGreetings \|\| character\.alternate_greetings/);
    assert.match(appSource, /await appendFirstMessageIfPresent\(session\.id, snapshotContext, options\.greetingIndex\)/);
    assert.match(assemblerSource, /\['Description', character\.description/);
    assert.match(assemblerSource, /\['Personality', character\.personality/);
});

test('tavern worldbook sync uses native source overview with current context', () => {
    const settingsControllerSource = readRepoFile('modules/tavern/app-src/components/settings/useTavernSettingsController.ts');
    const contextSource = readRepoFile('modules/tavern/host/sillytavern-context.ts');
    const contextBuildSource = readRepoFile('modules/tavern/host/sillytavern-context.js');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const sessionSource = readRepoFile('modules/tavern/app-src/features/session/useTavernSessionController.ts');
    const worldbookSource = readRepoFile('modules/tavern/host/worldbooks.ts');
    assert.match(
        settingsControllerSource,
        /requestHost\('xb-tavern:list-worldbook-sources', \{\s*payload: \{\s*context: options\.effectiveContext\.value,/,
    );
    assert.match(settingsControllerSource, /requestHost\('xb-tavern:get-worldbook-preview'/);
    assert.match(settingsControllerSource, /requestHost\('xb-tavern:get-worldbook-entry'/);
    assert.match(settingsControllerSource, /requestHost\('xb-tavern:save-worldbook-entry'/);
    assert.match(settingsControllerSource, /worldbookEntryLoadRequestSerial/);
    assert.match(settingsControllerSource, /worldbookEntryLoadRequestKey !== requestToken/);
    assert.match(settingsControllerSource, /limit: worldbookPreviewVisibleLimit\.value/);
    assert.match(settingsControllerSource, /function showMoreWorldbookPreviewEntries/);
    assert.doesNotMatch(settingsControllerSource, /async function openSelectedWorldbookEditor/);
    assert.doesNotMatch(settingsControllerSource, /requestHost\('xb-tavern:open-worldbook-editor'/);
    assert.match(contextSource, /const worldbookSources = collectWorldbookSources\(ctx, options\);/);
    assert.match(contextSource, /addUnique\(globalNames, selected_world_info\);/);
    assert.doesNotMatch(contextSource, /addUnique\(globalNames, worldInfo\.globalSelect\)/);
    assert.doesNotMatch(contextSource, /METADATA_KEY/);
    assert.doesNotMatch(contextSource, /chat_metadata\?\.\[METADATA_KEY\]/);
    assert.doesNotMatch(contextSource, /metadata_keys/);
    assert.doesNotMatch(contextSource, /authors-note\.js/);
    assert.doesNotMatch(contextSource, /chat_metadata\?\.\[metadata_keys/);
    assert.doesNotMatch(contextBuildSource, /metadata_keys/);
    assert.doesNotMatch(contextBuildSource, /authors-note\.js/);
    assert.doesNotMatch(contextBuildSource, /chat_metadata\?\.\[metadata_keys/);
    assert.doesNotMatch(contextSource, /isCurrentCharacterSelection/);
    assert.doesNotMatch(contextSource, /persona_description_lorebook/);
    assert.doesNotMatch(contextSource, /sourceType: 'chat'/);
    assert.doesNotMatch(contextSource, /sourceType: 'persona'/);
    assert.match(contextSource, /const characterLoreIdSet = new Set\(characterLoreIds\);[\s\S]*characterLoreIdSet\.has\(normalizeText\(entry\?\.name\)\)/);
    assert.doesNotMatch(contextSource, /!avatar \|\| normalizeText\(entry\?\.name\) === avatar/);
    assert.match(contextSource, /historySource: 'littlewhitebox-session'/);
    assert.match(contextSource, /function normalizeAuthorNote/);
    assert.match(contextSource, /prompt: normalizeText\(noteSettings\.default\)/);
    assert.match(contextSource, /interval: Number\(noteSettings\.defaultInterval \?\? 0\)/);
    assert.match(contextSource, /position: Number\(noteSettings\.defaultPosition \?\? 1\)/);
    assert.match(contextSource, /depth: Number\(noteSettings\.defaultDepth \?\? 4\)/);
    assert.match(contextSource, /role: Number\(noteSettings\.defaultRole \?\? 0\)/);
    assert.match(contextSource, /authorNote: normalizeAuthorNote\(ctx, options\)/);
    assert.match(appSource, /function preserveSessionAuthorNote/);
    assert.match(appSource, /const nextContext = preserveSessionAuthorNote\(payload\.context as XbTavernContext \|\| context\.value, session\);/);
    assert.match(worldbookSource, /function applyAuthorNoteInjectScanPrompt/);
    assert.match(worldbookSource, /setExtensionPrompt\(\s*NOTE_MODULE_NAME/);
    assert.match(worldbookSource, /state\.shouldAddPrompt && state\.scan/);
    assert.match(worldbookSource, /applyAuthorNoteInjectScanPrompt\(context, payload\.currentUserMessage \|\| ''\)/);
    assert.match(worldbookSource, /function captureExtensionPrompts\(\): ExtensionPromptSnapshot \{[\s\S]*\{ \.\.\.asRecord\(value\) \}/);
    assert.match(worldbookSource, /function restoreExtensionPrompts\(snapshot: ExtensionPromptSnapshot\): void \{[\s\S]*extension_prompts\[key\] = \{ \.\.\.value \};/);
    assert.match(worldbookSource, /extensionPrompts: captureExtensionPrompts\(\)/);
    assert.match(worldbookSource, /restoreExtensionPrompts\(snapshot\.extensionPrompts\)/);
    assert.doesNotMatch(worldbookSource, /extensionPrompts: cloneJson\(extension_prompts/);
    assert.doesNotMatch(worldbookSource, /extension_prompts\[key\] = cloneJson\(value\)/);
    assert.match(contextSource, /worldbookSources,/);
    assert.match(contextSource, /worldbookSourcesSynced: true/);
    assert.match(appSource, /syncSessionCharacterContextSafely,/);
    assert.match(sessionSource, /options\.syncSessionCharacterContextSafely\(\{ sessionId: state\.selectedSessionId\.value \}\)/);
    assert.match(sessionSource, /options\.syncSessionCharacterContextSafely\(\{ sessionId: id, force: true \}\)/);
});

test('tavern worldbook host bridge exposes named entry edit endpoints and native runtime result', () => {
    const hostSource = readRepoFile('modules/tavern/host/worldbooks.ts');
    const tavernSource = readRepoFile('modules/tavern/tavern.ts');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    assert.match(hostSource, /export async function listTavernWorldbookSources/);
    assert.match(hostSource, /export async function getTavernWorldbookPreview/);
    assert.match(hostSource, /await loadWorldInfo\(name\)/);
    assert.match(hostSource, /Number\(payload\.limit\)/);
    assert.match(hostSource, /export async function getTavernWorldbookEntry/);
    assert.match(hostSource, /export async function saveTavernWorldbookEntry/);
    assert.match(hostSource, /export async function getTavernCharacterWorldbookState/);
    assert.match(hostSource, /export async function activateTavernCharacterWorldbook/);
    assert.match(hostSource, /export async function bindTavernCharacterWorldbook/);
    assert.match(hostSource, /export async function getTavernGlobalWorldbooks/);
    assert.match(hostSource, /export async function setTavernGlobalWorldbooks/);
    assert.match(hostSource, /function normalizeIdText/);
    assert.match(hostSource, /function syncWorldbookOriginalDataEntry/);
    assert.match(hostSource, /'secondary_keys' in entry && \('secondary_keys' in draft \|\| 'secondaryKeys' in draft\)/);
    assert.match(hostSource, /const keysecondary = normalizeStringList\(draft\.keysecondary\);[\s\S]*entry\.secondary_keys = keysecondary\.length \? keysecondary : normalizeStringList\(draft\.secondary_keys \?\? draft\.secondaryKeys\)/);
    assert.match(hostSource, /await saveWorldInfo\(name, data, true\)/);
    assert.match(hostSource, /void updateWorldInfoList\(\)\.catch/);
    assert.doesNotMatch(hostSource, /not_current_character|只能给当前酒馆角色/);
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
    assert.match(hostSource, /return bindCharacterWorldbookThroughEditor\(nativeCharacterId, name\);/);
    assert.match(hostSource, /applyGlobalWorldbookSelection\(selected\);[\s\S]*await updateWorldInfoList\(\);/);
    assert.match(hostSource, /nativeWorldInfo\.updateWorldInfoSettings\(settings, selected\);[\s\S]*worldInfo\.globalSelect = \[\.\.\.selected\];[\s\S]*stScript\.saveSettingsDebounced\?\.\(\);[\s\S]*return;/);
    assert.doesNotMatch(hostSource, /importEmbeddedWorldInfo/);
    assert.doesNotMatch(hostSource, /createWorldInfoEntry/);
    assert.match(hostSource, /export async function getTavernWorldbookRuntime/);
    assert.doesNotMatch(hostSource, /export function openTavernWorldbookEditor/);
    assert.match(hostSource, /sessionMeta\.worldbookSources/);
    assert.match(hostSource, /sessionMeta\.worldbookNames/);
    assert.doesNotMatch(hostSource, /function isNativeRuntimeSource/);
    assert.doesNotMatch(hostSource, /sourceType\) !== 'embedded'/);
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
    assert.match(hostSource, /const globalNameSet = new Set\(liveSelectedGlobalWorldbookNames\(\)\);[\s\S]*globalActive: globalNameSet\.has\(name\)/);
    assert.match(hostSource, /runTavernWorldbookStateExclusive\(async \(\) => \{[\s\S]*await checkWorldInfo\(chatLines, maxContext, false, globalScanData\)/);
    assert.match(hostSource, /tavernWorldbookStateQueue = new Promise<void>/);
    assert.match(hostSource, /worldInfoBefore:/);
    assert.match(hostSource, /worldInfoAfter:/);
    assert.match(hostSource, /worldInfoExamples:/);
    assert.match(hostSource, /worldInfoDepth:/);
    assert.match(hostSource, /anBefore:/);
    assert.match(hostSource, /anAfter:/);
    assert.match(hostSource, /outlets:/);
    assert.match(tavernSource, /case 'xb-tavern:list-worldbook-sources':/);
    assert.match(tavernSource, /case 'xb-tavern:get-worldbook-preview':/);
    assert.match(tavernSource, /case 'xb-tavern:get-worldbook-entry':/);
    assert.match(tavernSource, /case 'xb-tavern:save-worldbook-entry':/);
    assert.match(tavernSource, /case 'xb-tavern:get-character-worldbook-state':/);
    assert.match(tavernSource, /case 'xb-tavern:activate-character-worldbook':/);
    assert.match(tavernSource, /case 'xb-tavern:bind-character-worldbook':/);
    assert.match(tavernSource, /case 'xb-tavern:get-global-worldbooks':/);
    assert.match(tavernSource, /case 'xb-tavern:set-global-worldbooks':/);
    assert.match(tavernSource, /case 'xb-tavern:get-worldbook-runtime':/);
    assert.match(appSource, /action === 'needs_import_confirmation'/);
    assert.match(appSource, /await confirmTavernDialog\(\{[\s\S]*message: `世界书「\$\{name\}」已存在，导入角色内嵌世界书会覆盖它。继续？`/);
    assert.match(appSource, /payload: \{ nativeCharacterId, confirmed: true \}/);
    assert.doesNotMatch(tavernSource, /case 'xb-tavern:open-worldbook-editor':/);
    assert.doesNotMatch(tavernSource, /case 'xb-tavern:list-worldbooks':/);
    assert.doesNotMatch(tavernSource, /case 'xb-tavern:get-worldbook':/);
    assert.doesNotMatch(tavernSource, /case 'xb-tavern:save-worldbook':/);
    assert.doesNotMatch(tavernSource, /chat-worldbook/);
});

test('tavern native prompt builder injects LittleWhiteBox state without host chat fallbacks', () => {
    const nativeSource = readRepoFile('modules/tavern/host/native-prompt.ts');
    assert.match(nativeSource, /function getUserPersonaPrompt[\s\S]*normalizeText\(context\.user\?\.persona \|\| context\.user\?\.description\)/);
    assert.doesNotMatch(nativeSource, /substituteParams\('\{\{persona\}\}'\)/);
    assert.match(nativeSource, /import\s*\{[^}]*persona_description_positions[^}]*power_user[^}]*\}\s*from\s*['"][^'"]*power-user\.js['"]/);
    assert.doesNotMatch(nativeSource, /import\s*\{[^}]*persona_description_positions[^}]*\}\s*from\s*['"][^'"]*personas\.js['"]/);
    assert.match(nativeSource, /power_user\.persona_description = persona;/);
    assert.match(nativeSource, /power_user\.persona_description_position = persona_description_positions\.IN_PROMPT;/);
    assert.match(nativeSource, /function capturePromptManager/);
    assert.match(nativeSource, /prompts: cloneJson\(serviceSettings\.prompts\)/);
    assert.match(nativeSource, /function applyPromptManagerActiveCharacter/);
    assert.match(nativeSource, /function applyChatPresetPromptManager/);
    assert.match(nativeSource, /serviceSettings\.prompts = cloneJson\(prompts\);/);
    assert.match(nativeSource, /replacePromptOrderForCharacter\(promptOrder, nativeCharacterId, activeOrder\)/);
    assert.match(nativeSource, /const NATIVE_PROMPT_DRY_RUN_CONTEXT_TOKENS = 200000;/);
    assert.match(nativeSource, /function applyNativeDryRunTokenBudget\(chatPreset: TavernChatPromptPresetBundle = \{\}\): void/);
    assert.match(nativeSource, /serviceSettings\.openai_max_context = contextTokens;/);
    assert.match(nativeSource, /serviceSettings\.openai_max_tokens = Math\.max\(1, responseTokens\);/);
    assert.match(nativeSource, /applyChatPresetPromptManager\(input\.chatPreset, context\);[\s\S]*applyNativeDryRunTokenBudget\(input\.chatPreset\);[\s\S]*applyPromptManagerActiveCharacter\(context\);/);
    assert.match(nativeSource, /hasOpenAiMaxContext: Object\.prototype\.hasOwnProperty\.call\(serviceSettings, 'openai_max_context'\)/);
    assert.match(nativeSource, /delete serviceSettings\.openai_max_context;/);
    assert.match(nativeSource, /activeCharacter = character;/);
    assert.doesNotMatch(nativeSource, /promptOrder\.push\(\{[\s\S]*character_id: character\.id/);
    assert.doesNotMatch(nativeSource, /ensurePromptOrderForActiveCharacter/);
    assert.match(nativeSource, /restorePromptManager\(promptManagerSnapshot\);[\s\S]*restorePersonaPrompt\(personaSnapshot\);[\s\S]*restoreExtensionPrompts\(snapshot\);/);
    assert.match(nativeSource, /function readCharacterDepthPrompt[\s\S]*depthPrompt\.prompt[\s\S]*depth_prompt_depth_default[\s\S]*depth_prompt_role_default/);
    assert.match(nativeSource, /const legacyDepthPrompt = asRecord\(data\.depth_prompt\);/);
    assert.match(nativeSource, /\|\| legacyDepthPrompt\.prompt[\s\S]*\|\| \(typeof data\.depth_prompt === 'string' \? data\.depth_prompt : ''\)/);
    assert.match(nativeSource, /function addCharacterDepthPrompt[\s\S]*const prompt = readCharacterDepthPrompt\(context\)/);
    assert.match(nativeSource, /addInChatPrompt\(\s*'xb_tavern_character_depth_prompt'/);
    assert.match(nativeSource, /resolveXbTavernAuthorNoteState/);
    assert.doesNotMatch(nativeSource, /function resolveAuthorNoteState/);
    assert.doesNotMatch(nativeSource, /const note = asRecord\(context\.authorNote\)/);
    assert.doesNotMatch(nativeSource, /function countUserMessages/);
    assert.match(nativeSource, /state\.shouldAddPrompt[\s\S]*\[\.\.\.before, state\.prompt, \.\.\.after\]/);
    assert.match(nativeSource, /setExtensionPrompt\(\s*NOTE_MODULE_NAME/);
    assert.doesNotMatch(nativeSource, /setFloatingPrompt/);
    assert.match(nativeSource, /import\s*\{[^}]*inject_ids[^}]*\}\s*from\s*['"][^'"]*constants\.js['"]/);
    assert.doesNotMatch(nativeSource, /import\s*\{[^}]*inject_ids[^}]*\}\s*from\s*['"][^'"]*script\.js['"]/);
    assert.match(nativeSource, /function flushNativeWorldInfoInjections\(\): void/);
    assert.match(nativeSource, /const depthPrefix = inject_ids\.CUSTOM_WI_DEPTH;/);
    assert.match(nativeSource, /const outletPrefix = inject_ids\.CUSTOM_WI_OUTLET\(''\);/);
    assert.match(nativeSource, /key\.startsWith\(depthPrefix\) \|\| key\.startsWith\(outletPrefix\)[\s\S]*delete extension_prompts\[key\];/);
    assert.match(nativeSource, /function addNativeWorldInfoOutlets\(runtime: XbTavernNativeWorldInfoRuntime = \{\}\): void/);
    assert.match(nativeSource, /const outletName = normalizeText\(rawName\);/);
    assert.match(nativeSource, /const entries = Array\.isArray\(rawEntries\) \? rawEntries\.map\(normalizeText\)\.filter\(Boolean\) : \[\];/);
    assert.match(nativeSource, /const value = entries\.join\('\\n'\);/);
    assert.match(nativeSource, /setExtensionPrompt\(\s*inject_ids\.CUSTOM_WI_OUTLET\(outletName\),\s*value,\s*Number\(extension_prompt_types\.NONE \?\? 0\),\s*0,\s*\);/);
    assert.match(nativeSource, /flushNativeWorldInfoInjections\(\);[\s\S]*addNativeWorldInfoDepth\(runtime\);[\s\S]*addNativeWorldInfoOutlets\(runtime\);[\s\S]*applyAuthorNotePrompt\(context, input\.currentUserMessage \|\| '', runtime\);[\s\S]*prepareOpenAIMessages/);
    const buildOpenAiMessagesSource = nativeSource.match(/function buildOpenAiMessages[\s\S]*?\n\}/)?.[0] || '';
    assert.ok(buildOpenAiMessagesSource);
    assert.match(buildOpenAiMessagesSource, /messages\.push\(\{[\s\S]*role: 'user'[\s\S]*content: userText/);
    assert.match(buildOpenAiMessagesSource, /prepared\.reduce<XbTavernMessage\[\]>\(\(result, message, index\) => \{/);
    assert.match(buildOpenAiMessagesSource, /result\[prepared\.length - 1 - index\] = message;/);
    assert.doesNotMatch(buildOpenAiMessagesSource, /return prepared;/);
    const outletFunction = nativeSource.match(/function addNativeWorldInfoOutlets[\s\S]*?\n\}/)?.[0] || '';
    assert.ok(outletFunction);
    assert.doesNotMatch(outletFunction, /addInChatPrompt|extension_prompt_types\.IN_CHAT/);
    assert.doesNotMatch(nativeSource, /\{\{outlet::/);
    assert.doesNotMatch(nativeSource, /chat_metadata/);
    assert.doesNotMatch(nativeSource, /extension_settings/);
    assert.doesNotMatch(nativeSource, /xb:tavern:nativePromptDebug/);
    assert.doesNotMatch(nativeSource, /__xbTavernLastNativePromptDebug/);
    assert.doesNotMatch(nativeSource, /promptContains/);
});

test('tavern slash command bridge executes through native SillyTavern STscript', () => {
    const tavernSource = readRepoFile('modules/tavern/tavern.ts');
    const slashSource = readRepoFile('modules/tavern/host/slash-commands.ts');
    const appSource = readRepoFile('modules/tavern/app-src/App.vue');
    const chatRunSource = readRepoFile('modules/tavern/app-src/features/chat-run/useTavernChatRunController.ts');

    assert.match(tavernSource, /runTavernSlashCommand/);
    assert.match(slashSource, /executeSlashCommandsWithOptions/);
    assert.match(slashSource, /source: 'littlewhitebox-tavern'/);
    assert.match(slashSource, /pipe/);
    assert.match(appSource, /function shouldRunTavernSlashCommand/);
    assert.match(appSource, /async function resolveSlashCommandMessageText/);
    assert.match(appSource, /reuseUserMessageOrder/);
    assert.match(chatRunSource, /messageText = await options\.resolveSlashCommandMessageText\(messageText, runOptions\);/);
    assert.match(chatRunSource, /reuseUserMessageOrder/);
});

test('tavern message assembler can render native worldbook prompt blocks directly', () => {
    const assemblerSource = readRepoFile('modules/tavern/shared/message-assembler.ts');
    assert.match(assemblerSource, /function buildNativePromptEntries/);
    assert.match(assemblerSource, /worldInfoBefore\?: string;/);
    assert.match(assemblerSource, /worldInfoAfter\?: string;/);
    assert.match(assemblerSource, /worldInfoExamples\?: Array/);
    assert.match(assemblerSource, /worldInfoDepth\?: Array/);
    assert.match(assemblerSource, /anBefore\?: string\[\];/);
    assert.match(assemblerSource, /anAfter\?: string\[\];/);
    assert.match(assemblerSource, /outlets\?: Record<string, string\[\]>;/);
    assert.match(assemblerSource, /const localWorldEntries = context\.nativeWorldInfo\s*\? \[\]\s*: allWorldEntries;/);
    assert.doesNotMatch(assemblerSource, /allWorldEntries\.filter\(\(entry\) => normalizeText\(entry\.worldSourceType\) === 'embedded'\)/);
    assert.doesNotMatch(assemblerSource, /sourceType === 'embedded'/);
    assert.doesNotMatch(assemblerSource, /'global' \| 'embedded'/);
    assert.match(assemblerSource, /\.\.\.nativeWorldEntries,[\s\S]*\.\.\.localActivatedWorldEntries/);
});
