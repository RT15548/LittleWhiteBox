import fs from 'node:fs';
import path from 'node:path';

const pluginRoot = process.cwd();
const inputPath = path.join(pluginRoot, 'modules/assistant/references/sillytavern-javascript-api-reference.md');
const outputPath = path.join(pluginRoot, 'modules/assistant/st-jsapi-manifest.json');

function uniqueSorted(items) {
    return Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'en'));
}

const JSAPI_SEMANTICS = Object.freeze({
    READ: 'read',
    WRITE: 'write',
    UI: 'ui',
    NETWORK: 'network',
    EXEC: 'exec',
});

const CALLABLE_ST_EXTENSIONS = new Set([
    'getContext',
    'getApiUrl',
    'cancelDebouncedMetadataSave',
    'saveMetadataDebounced',
    'renderExtensionTemplate',
    'renderExtensionTemplateAsync',
    'runGenerationInterceptors',
    'writeExtensionField',
]);

const CALLABLE_ST_SLASH = new Set([
    'executeSlashCommands',
    'executeSlashCommandsWithOptions',
    'getSlashCommandsHelp',
    'registerSlashCommand',
]);

const EXACT_API_SEMANTICS = new Map([
    ['ctx.getCurrentChatId', JSAPI_SEMANTICS.READ],
    ['ctx.getCharacters', JSAPI_SEMANTICS.READ],
    ['ctx.getOneCharacter', JSAPI_SEMANTICS.READ],
    ['ctx.getCharacterCardFields', JSAPI_SEMANTICS.READ],
    ['ctx.getCharacterSource', JSAPI_SEMANTICS.READ],
    ['ctx.canPerformToolCalls', JSAPI_SEMANTICS.READ],
    ['ctx.isToolCallingSupported', JSAPI_SEMANTICS.READ],
    ['ctx.getTokenCountAsync', JSAPI_SEMANTICS.READ],
    ['ctx.getThumbnailUrl', JSAPI_SEMANTICS.READ],
    ['ctx.getTextTokens', JSAPI_SEMANTICS.READ],
    ['ctx.getTokenizerModel', JSAPI_SEMANTICS.READ],
    ['ctx.getCurrentLocale', JSAPI_SEMANTICS.READ],
    ['ctx.loadWorldInfo', JSAPI_SEMANTICS.READ],
    ['ctx.getWorldInfoPrompt', JSAPI_SEMANTICS.READ],
    ['ctx.getTextGenServer', JSAPI_SEMANTICS.READ],
    ['ctx.getPresetManager', JSAPI_SEMANTICS.READ],
    ['ctx.t', JSAPI_SEMANTICS.READ],
    ['ctx.translate', JSAPI_SEMANTICS.READ],
    ['ctx.renderExtensionTemplateAsync', JSAPI_SEMANTICS.READ],
    ['ctx.swipe.isAllowed', JSAPI_SEMANTICS.READ],
    ['ctx.swipe.state', JSAPI_SEMANTICS.READ],
    ['st.script.getRequestHeaders', JSAPI_SEMANTICS.READ],
    ['st.script.getCurrentChatId', JSAPI_SEMANTICS.READ],
    ['st.extensions.getApiUrl', JSAPI_SEMANTICS.READ],
    ['st.extensions.getContext', JSAPI_SEMANTICS.READ],
    ['st.extensions.renderExtensionTemplate', JSAPI_SEMANTICS.READ],
    ['st.extensions.renderExtensionTemplateAsync', JSAPI_SEMANTICS.READ],
    ['st.slash.getSlashCommandsHelp', JSAPI_SEMANTICS.READ],

    ['ctx.saveChat', JSAPI_SEMANTICS.WRITE],
    ['ctx.clearChat', JSAPI_SEMANTICS.WRITE],
    ['ctx.renameChat', JSAPI_SEMANTICS.WRITE],
    ['ctx.saveMetadata', JSAPI_SEMANTICS.WRITE],
    ['ctx.saveMetadataDebounced', JSAPI_SEMANTICS.WRITE],
    ['ctx.saveSettingsDebounced', JSAPI_SEMANTICS.WRITE],
    ['ctx.saveWorldInfo', JSAPI_SEMANTICS.WRITE],
    ['ctx.setExtensionPrompt', JSAPI_SEMANTICS.WRITE],
    ['ctx.addLocaleData', JSAPI_SEMANTICS.WRITE],
    ['ctx.addOneMessage', JSAPI_SEMANTICS.WRITE],
    ['ctx.deleteLastMessage', JSAPI_SEMANTICS.WRITE],
    ['ctx.deleteMessage', JSAPI_SEMANTICS.WRITE],
    ['ctx.registerFunctionTool', JSAPI_SEMANTICS.WRITE],
    ['ctx.unregisterFunctionTool', JSAPI_SEMANTICS.WRITE],
    ['st.script.saveSettingsDebounced', JSAPI_SEMANTICS.WRITE],
    ['st.script.saveCharacterDebounced', JSAPI_SEMANTICS.WRITE],
    ['st.extensions.saveMetadataDebounced', JSAPI_SEMANTICS.WRITE],
    ['st.extensions.cancelDebouncedMetadataSave', JSAPI_SEMANTICS.WRITE],
    ['st.extensions.writeExtensionField', JSAPI_SEMANTICS.WRITE],

    ['ctx.reloadCurrentChat', JSAPI_SEMANTICS.UI],
    ['ctx.selectCharacterById', JSAPI_SEMANTICS.UI],
    ['ctx.openCharacterChat', JSAPI_SEMANTICS.UI],
    ['ctx.openGroupChat', JSAPI_SEMANTICS.UI],
    ['ctx.openThirdPartyExtensionMenu', JSAPI_SEMANTICS.UI],
    ['ctx.reloadWorldInfoEditor', JSAPI_SEMANTICS.UI],
    ['ctx.updateWorldInfoList', JSAPI_SEMANTICS.UI],
    ['ctx.printMessages', JSAPI_SEMANTICS.UI],
    ['ctx.callGenericPopup', JSAPI_SEMANTICS.UI],
    ['ctx.swipe.left', JSAPI_SEMANTICS.UI],
    ['ctx.swipe.right', JSAPI_SEMANTICS.UI],
    ['ctx.swipe.to', JSAPI_SEMANTICS.UI],
    ['ctx.swipe.show', JSAPI_SEMANTICS.UI],
    ['ctx.swipe.hide', JSAPI_SEMANTICS.UI],
    ['ctx.swipe.refresh', JSAPI_SEMANTICS.UI],
    ['st.script.reloadMarkdownProcessor', JSAPI_SEMANTICS.UI],

    ['ctx.generate', JSAPI_SEMANTICS.NETWORK],
    ['ctx.generateQuietPrompt', JSAPI_SEMANTICS.NETWORK],
    ['ctx.generateRaw', JSAPI_SEMANTICS.NETWORK],
    ['ctx.generateRawData', JSAPI_SEMANTICS.NETWORK],
    ['ctx.sendGenerationRequest', JSAPI_SEMANTICS.NETWORK],
    ['ctx.sendStreamingRequest', JSAPI_SEMANTICS.NETWORK],
    ['ctx.importFromExternalUrl', JSAPI_SEMANTICS.NETWORK],

    ['ctx.stopGeneration', JSAPI_SEMANTICS.EXEC],
    ['ctx.convertCharacterBook', JSAPI_SEMANTICS.EXEC],
    ['ctx.createCharacterData', JSAPI_SEMANTICS.EXEC],
    ['st.extensions.runGenerationInterceptors', JSAPI_SEMANTICS.EXEC],
    ['st.slash.executeSlashCommands', JSAPI_SEMANTICS.EXEC],
    ['st.slash.executeSlashCommandsWithOptions', JSAPI_SEMANTICS.EXEC],
    ['st.slash.registerSlashCommand', JSAPI_SEMANTICS.EXEC],
]);

const PREFIX_API_SEMANTICS = [
    ['ctx.variables.local.get', JSAPI_SEMANTICS.READ],
    ['ctx.variables.local.has', JSAPI_SEMANTICS.READ],
    ['ctx.variables.global.get', JSAPI_SEMANTICS.READ],
    ['ctx.variables.global.has', JSAPI_SEMANTICS.READ],
    ['ctx.variables.local.set', JSAPI_SEMANTICS.WRITE],
    ['ctx.variables.local.add', JSAPI_SEMANTICS.WRITE],
    ['ctx.variables.local.inc', JSAPI_SEMANTICS.WRITE],
    ['ctx.variables.local.dec', JSAPI_SEMANTICS.WRITE],
    ['ctx.variables.local.del', JSAPI_SEMANTICS.WRITE],
    ['ctx.variables.global.set', JSAPI_SEMANTICS.WRITE],
    ['ctx.variables.global.add', JSAPI_SEMANTICS.WRITE],
    ['ctx.variables.global.inc', JSAPI_SEMANTICS.WRITE],
    ['ctx.variables.global.dec', JSAPI_SEMANTICS.WRITE],
    ['ctx.variables.global.del', JSAPI_SEMANTICS.WRITE],
];

function stripCallSignature(raw) {
    return String(raw || '').trim().replace(/\([^)]*\)$/g, '');
}

function normalizeSimplePath(raw, prefix) {
    const value = stripCallSignature(raw);
    if (!value) return '';
    const parts = value.split('.');
    const normalizedParts = [];

    for (const part of parts) {
        const clean = String(part || '').trim();
        if (!clean) continue;
        if (clean.includes('/')) {
            normalizedParts.push(clean.split('/')[0]);
            break;
        }
        normalizedParts.push(clean);
    }

    return normalizedParts.length ? `${prefix}.${normalizedParts.join('.')}` : '';
}

function expandAlternatives(pathText) {
    const parts = String(pathText || '').split('.');
    const results = [];

    function walk(index, current) {
        if (index >= parts.length) {
            results.push(current.join('.'));
            return;
        }
        const part = parts[index];
        const alternatives = part.split('/').map((item) => item.trim()).filter(Boolean);
        if (!alternatives.length) {
            walk(index + 1, current);
            return;
        }
        alternatives.forEach((item) => walk(index + 1, [...current, item]));
    }

    walk(0, []);
    return results;
}

function parseCodeImportNames(line) {
    const match = line.match(/import\s*\{([^}]+)\}/);
    if (!match) return [];
    return match[1]
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => item.split(/\s+as\s+/i)[0].trim())
        .filter(Boolean);
}

function classifyApiSemantic(pathText) {
    const normalized = String(pathText || '').trim();
    if (!normalized) return '';
    if (EXACT_API_SEMANTICS.has(normalized)) {
        return EXACT_API_SEMANTICS.get(normalized);
    }
    for (const [prefix, semantic] of PREFIX_API_SEMANTICS) {
        if (normalized === prefix || normalized.startsWith(`${prefix}.`)) {
            return semantic;
        }
    }
    return '';
}

const markdown = fs.readFileSync(inputPath, 'utf8');
const lines = markdown.split(/\r?\n/);

const manifest = {
    generatedAt: new Date().toISOString(),
    version: 1,
    namespaces: {
        ctx: [],
        st: {
            script: [],
            extensions: [],
            slash: [],
        },
    },
    callablePaths: [],
    apiSemantics: {},
};

const callablePaths = new Set();

let section = '';
let subsection = '';
let inCodeBlock = false;

for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
    }

    if (trimmed.startsWith('## ')) {
        section = trimmed;
        subsection = '';
        continue;
    }

    if (trimmed.startsWith('### ')) {
        subsection = trimmed;
        continue;
    }

    if (inCodeBlock && section === '## 5. 斜杠命令模块') {
        const importNames = parseCodeImportNames(trimmed);
        importNames.forEach((name) => {
            const normalized = normalizeSimplePath(name, 'st.slash');
            if (normalized) {
                manifest.namespaces.st.slash.push(normalized);
            }
        });
        continue;
    }

    if (!trimmed.startsWith('| `')) continue;
    const cells = trimmed.split('|').map((item) => item.trim()).filter(Boolean);
    if (!cells.length) continue;
    const rawCell = cells[0].replace(/^`|`$/g, '').trim();
    if (!rawCell) continue;

    if (section === '## 1. 全局上下文 getContext()') {
        const normalized = stripCallSignature(rawCell).replace(/^context\./, 'ctx.');
        const expanded = expandAlternatives(normalized);
        expanded.forEach((item) => {
            if (item.startsWith('ctx.')) {
                manifest.namespaces.ctx.push(item);
            }
        });
        if (rawCell.includes('(') || section === '## 1. 全局上下文 getContext()' && subsection === '### 1.5 `context.variables`') {
            expanded.forEach((item) => callablePaths.add(item));
        }
        continue;
    }

    if (section === '## 2. 主模块导出 (script.js)') {
        const normalized = normalizeSimplePath(rawCell, 'st.script');
        if (normalized) {
            manifest.namespaces.st.script.push(normalized);
            if (subsection === '### 2.4 函数') {
                callablePaths.add(normalized);
            }
        }
        continue;
    }

    if (section === '## 3. 扩展模块导出 (extensions.js)') {
        const normalized = normalizeSimplePath(rawCell, 'st.extensions');
        if (normalized) {
            manifest.namespaces.st.extensions.push(normalized);
            if (CALLABLE_ST_EXTENSIONS.has(rawCell)) {
                callablePaths.add(normalized);
            }
        }
        continue;
    }

    if (section === '## 5. 斜杠命令模块') {
        if (subsection === '### 5.1 参数类型') {
            const baseName = rawCell.split('.')[0];
            const normalized = normalizeSimplePath(baseName, 'st.slash');
            if (normalized) {
                manifest.namespaces.st.slash.push(normalized);
            }
            continue;
        }

        if (subsection === '### 5.3 运行时辅助') {
            const normalized = normalizeSimplePath(rawCell, 'st.slash');
            if (normalized) {
                manifest.namespaces.st.slash.push(normalized);
                if (CALLABLE_ST_SLASH.has(rawCell)) {
                    callablePaths.add(normalized);
                }
            }
        }
    }
}

manifest.namespaces.ctx = uniqueSorted(manifest.namespaces.ctx);
manifest.namespaces.st.script = uniqueSorted(manifest.namespaces.st.script);
manifest.namespaces.st.extensions = uniqueSorted(manifest.namespaces.st.extensions);
manifest.namespaces.st.slash = uniqueSorted(manifest.namespaces.st.slash);
manifest.allowedPaths = uniqueSorted([
    ...manifest.namespaces.ctx,
    ...manifest.namespaces.st.script,
    ...manifest.namespaces.st.extensions,
    ...manifest.namespaces.st.slash,
]);
manifest.callablePaths = uniqueSorted([
    ...callablePaths,
    ...Array.from(EXACT_API_SEMANTICS.keys()),
    ...PREFIX_API_SEMANTICS.map(([prefix]) => prefix),
]);
manifest.apiSemantics = Object.fromEntries(
    manifest.callablePaths
        .map((item) => [item, classifyApiSemantic(item)])
        .filter(([, semantic]) => semantic),
);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Assistant JS API manifest written to ${path.relative(pluginRoot, outputPath)}`);
