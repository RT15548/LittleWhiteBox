import fs from 'node:fs';
import path from 'node:path';

const pluginRoot = process.cwd();
const inputPath = path.join(pluginRoot, 'modules/assistant/references/sillytavern-javascript-api-reference.md');
const outputPath = path.join(pluginRoot, 'modules/assistant/st-jsapi-manifest.json');

function uniqueSorted(items) {
    return Array.from(new Set(Array.from(items || []).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'en'));
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

const SPECIAL_CTX_ALIASES = new Map([
    ['variables.get', ['ctx.variables.local.get']],
    ['variables.set', ['ctx.variables.local.set']],
    ['variables.del', ['ctx.variables.local.del']],
    ['variables.add', ['ctx.variables.local.add']],
    ['variables.inc', ['ctx.variables.local.inc']],
    ['variables.dec', ['ctx.variables.local.dec']],
    ['variables.has', ['ctx.variables.local.has']],
    ['global.get', ['ctx.variables.global.get']],
    ['global.set', ['ctx.variables.global.set']],
    ['global.del', ['ctx.variables.global.del']],
    ['global.add', ['ctx.variables.global.add']],
    ['global.inc', ['ctx.variables.global.inc']],
    ['global.dec', ['ctx.variables.global.dec']],
    ['global.has', ['ctx.variables.global.has']],
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

const REQUIRED_ALLOWED_PATHS = [
    'ctx.chatMetadata',
    'ctx.eventSource',
    'ctx.eventTypes',
    'st.extensions.getContext',
    'st.slash.executeSlashCommandsWithOptions',
    'st.script.getRequestHeaders',
];

function normalizeSourcePath(raw) {
    return String(raw || '')
        .trim()
        .replace(/\\/g, '/')
        .replace(/:\d+$/g, '')
        .toLowerCase();
}

function normalizeTypeText(raw) {
    return String(raw || '').trim().toLowerCase();
}

function stripCallSignature(raw) {
    return String(raw || '').trim().replace(/\([^)]*\)$/g, '');
}

function extractInlineBacktickValue(line) {
    const match = String(line || '').match(/`([^`]+)`/);
    return match ? match[1].trim() : '';
}

function readFencedCodeBlock(lines, startIndex) {
    let index = startIndex;
    while (index < lines.length && !lines[index].trim()) {
        index += 1;
    }
    if (index >= lines.length || !lines[index].trim().startsWith('```')) {
        return { content: '', nextIndex: startIndex };
    }

    const block = [];
    index += 1;
    while (index < lines.length && !lines[index].trim().startsWith('```')) {
        block.push(lines[index]);
        index += 1;
    }
    return {
        content: block.join('\n').trim(),
        nextIndex: index,
    };
}

function parseReferenceEntries(markdown) {
    const lines = String(markdown || '').split(/\r?\n/);
    const entries = [];

    for (let index = 0; index < lines.length; index += 1) {
        const headingMatch = lines[index].trim().match(/^### `(.+?)`$/);
        if (!headingMatch) continue;

        const entry = {
            name: headingMatch[1].trim(),
            source: '',
            type: '',
            signature: '',
            doc: '',
        };

        for (index += 1; index < lines.length; index += 1) {
            const trimmed = lines[index].trim();
            if (!trimmed || trimmed === '---') {
                if (trimmed === '---') break;
                continue;
            }
            if (trimmed.startsWith('### ')) {
                index -= 1;
                break;
            }
            if (trimmed.startsWith('**源文件**:')) {
                entry.source = extractInlineBacktickValue(trimmed);
                continue;
            }
            if (trimmed.startsWith('**类型**:')) {
                entry.type = trimmed.replace('**类型**:', '').trim();
                continue;
            }
            if (trimmed.startsWith('**签名**:')) {
                const block = readFencedCodeBlock(lines, index + 1);
                entry.signature = block.content;
                index = block.nextIndex;
                continue;
            }
            if (trimmed.startsWith('**说明**:') || trimmed.startsWith('**文档**:')) {
                const block = readFencedCodeBlock(lines, index + 1);
                entry.doc = block.content;
                index = block.nextIndex;
            }
        }

        entries.push(entry);
    }

    return entries;
}

function addAllowedPathWithParents(pathText, target) {
    const normalized = String(pathText || '').trim();
    if (!normalized) return;
    const segments = normalized.split('.').filter(Boolean);
    if (!segments.length) return;
    for (let index = 1; index <= segments.length; index += 1) {
        target.add(segments.slice(0, index).join('.'));
    }
}

function isCallableSignature(signatureText) {
    const normalized = String(signatureText || '').trim();
    if (!normalized) return false;
    return /\bexport\s+(?:async\s+)?function\b/.test(normalized)
        || /\bexport\s+default\s+(?:async\s+)?function\b/.test(normalized)
        || /=\s*(?:async\s*)?\([^)]*\)\s*=>/.test(normalized)
        || /=\s*(?:async\s*)?[a-zA-Z_$][\w$]*\s*=>/.test(normalized);
}

function isSlashSource(sourcePath) {
    return sourcePath === 'scripts/slash-commands.js' || sourcePath.startsWith('scripts/slash-commands/');
}

function getDerivedPaths(entry) {
    const sourcePath = normalizeSourcePath(entry.source);
    const paths = {
        ctx: [],
        script: [],
        extensions: [],
        slash: [],
    };

    if (!isSlashSource(sourcePath)) {
        const aliased = SPECIAL_CTX_ALIASES.get(entry.name);
        paths.ctx = Array.isArray(aliased) ? aliased : [`ctx.${entry.name}`];
    }

    if (sourcePath === 'script.js') {
        paths.script.push(`st.script.${entry.name}`);
    }

    if (sourcePath === 'scripts/extensions.js') {
        paths.extensions.push(`st.extensions.${entry.name}`);
    }

    if (isSlashSource(sourcePath)) {
        paths.slash.push(`st.slash.${entry.name}`);
    }

    return paths;
}

function shouldTreatAsCallable(entry, pathText) {
    const normalizedPath = String(pathText || '').trim();
    if (!normalizedPath) return false;
    if (EXACT_API_SEMANTICS.has(normalizedPath)) return true;
    if (PREFIX_API_SEMANTICS.some(([prefix]) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}.`))) {
        return true;
    }

    const normalizedType = normalizeTypeText(entry.type);
    if (normalizedPath.startsWith('st.extensions.') && CALLABLE_ST_EXTENSIONS.has(entry.name)) return true;
    if (normalizedPath.startsWith('st.slash.') && CALLABLE_ST_SLASH.has(entry.name)) return true;
    if (normalizedType.includes('函数')) return true;
    if (normalizedType.includes('变量')) return false;
    return isCallableSignature(entry.signature);
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
    const leafName = normalized.split('.').at(-1)?.toLowerCase() || '';
    const fullName = normalized.toLowerCase();

    if (
        leafName.startsWith('execute')
        || leafName.startsWith('run')
        || leafName.startsWith('stop')
        || leafName.startsWith('convert')
        || leafName.startsWith('create')
    ) {
        return JSAPI_SEMANTICS.EXEC;
    }

    if (leafName.startsWith('generate') || leafName.startsWith('send')) {
        return JSAPI_SEMANTICS.NETWORK;
    }

    if (
        leafName.startsWith('open')
        || leafName.startsWith('show')
        || leafName.startsWith('hide')
        || leafName.startsWith('scroll')
        || leafName.startsWith('print')
        || leafName.startsWith('call')
        || leafName.startsWith('activate')
        || leafName.startsWith('deactivate')
        || leafName.startsWith('select')
        || leafName.endsWith('ui')
        || leafName.endsWith('block')
        || leafName.endsWith('list')
        || fullName.includes('.swipe.')
    ) {
        return JSAPI_SEMANTICS.UI;
    }

    if (
        leafName.startsWith('save')
        || leafName.startsWith('set')
        || leafName.startsWith('add')
        || leafName.startsWith('delete')
        || leafName.startsWith('append')
        || leafName.startsWith('rename')
        || leafName.startsWith('register')
        || leafName.startsWith('unregister')
        || leafName.startsWith('write')
        || leafName.startsWith('clear')
        || leafName.startsWith('update')
        || leafName.startsWith('import')
    ) {
        return JSAPI_SEMANTICS.WRITE;
    }

    if (
        leafName.startsWith('get')
        || leafName.startsWith('find')
        || leafName.startsWith('load')
        || leafName.startsWith('parse')
        || leafName.startsWith('extract')
        || leafName.startsWith('ensure')
        || leafName.startsWith('translate')
        || leafName.startsWith('substitute')
        || leafName.startsWith('humanized')
        || leafName.startsWith('timestamp')
        || leafName.startsWith('uuid')
        || leafName.startsWith('render')
        || leafName.startsWith('should')
        || leafName.startsWith('is')
        || leafName.startsWith('can')
        || leafName.startsWith('has')
        || leafName.startsWith('messageformatting')
        || leafName.startsWith('unshallow')
    ) {
        return JSAPI_SEMANTICS.READ;
    }

    return '';
}

function buildManifest(entries) {
    const ctxPaths = new Set();
    const scriptPaths = new Set();
    const extensionPaths = new Set();
    const slashPaths = new Set();
    const allowedPaths = new Set();
    const callablePaths = new Set();

    entries.forEach((entry) => {
        const derivedPaths = getDerivedPaths(entry);
        derivedPaths.ctx.forEach((item) => {
            ctxPaths.add(item);
            addAllowedPathWithParents(item, allowedPaths);
            if (shouldTreatAsCallable(entry, item)) {
                callablePaths.add(item);
            }
        });
        derivedPaths.script.forEach((item) => {
            scriptPaths.add(item);
            addAllowedPathWithParents(item, allowedPaths);
            if (shouldTreatAsCallable(entry, item)) {
                callablePaths.add(item);
            }
        });
        derivedPaths.extensions.forEach((item) => {
            extensionPaths.add(item);
            addAllowedPathWithParents(item, allowedPaths);
            if (shouldTreatAsCallable(entry, item)) {
                callablePaths.add(item);
            }
        });
        derivedPaths.slash.forEach((item) => {
            slashPaths.add(item);
            addAllowedPathWithParents(item, allowedPaths);
            if (shouldTreatAsCallable(entry, item)) {
                callablePaths.add(item);
            }
        });
    });

    Array.from(EXACT_API_SEMANTICS.keys()).forEach((item) => {
        addAllowedPathWithParents(item, allowedPaths);
        callablePaths.add(item);
    });
    PREFIX_API_SEMANTICS.forEach(([prefix]) => {
        addAllowedPathWithParents(prefix, allowedPaths);
        callablePaths.add(prefix);
    });

    const manifest = {
        generatedAt: new Date().toISOString(),
        version: 1,
        sourceEntryCount: entries.length,
        namespaces: {
            ctx: uniqueSorted([...ctxPaths, ...Array.from(allowedPaths).filter((item) => item.startsWith('ctx.'))]),
            st: {
                script: uniqueSorted([...scriptPaths, ...Array.from(allowedPaths).filter((item) => item.startsWith('st.script.'))]),
                extensions: uniqueSorted([...extensionPaths, ...Array.from(allowedPaths).filter((item) => item.startsWith('st.extensions.'))]),
                slash: uniqueSorted([...slashPaths, ...Array.from(allowedPaths).filter((item) => item.startsWith('st.slash.'))]),
            },
        },
        callablePaths: uniqueSorted(callablePaths),
        apiSemantics: {},
        allowedPaths: uniqueSorted(allowedPaths),
    };

    manifest.apiSemantics = Object.fromEntries(
        manifest.callablePaths
            .map((item) => [item, classifyApiSemantic(item)])
            .filter(([, semantic]) => semantic),
    );

    return manifest;
}

function validateManifest(manifest) {
    const allowed = new Set(Array.isArray(manifest.allowedPaths) ? manifest.allowedPaths : []);
    const callable = new Set(Array.isArray(manifest.callablePaths) ? manifest.callablePaths : []);

    if (!allowed.size) {
        throw new Error('Generated JS API manifest has an empty allowedPaths set.');
    }

    const missingRequiredPaths = REQUIRED_ALLOWED_PATHS.filter((item) => !allowed.has(item));
    if (missingRequiredPaths.length) {
        throw new Error(`Generated JS API manifest is missing required allowed paths: ${missingRequiredPaths.join(', ')}`);
    }

    const missingCallableAllowances = Array.from(callable).filter((item) => !allowed.has(item));
    if (missingCallableAllowances.length) {
        throw new Error(`Generated JS API manifest has callable paths outside allowedPaths: ${missingCallableAllowances.join(', ')}`);
    }
}

const markdown = fs.readFileSync(inputPath, 'utf8');
const entries = parseReferenceEntries(markdown);
const manifest = buildManifest(entries);

validateManifest(manifest);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Assistant JS API manifest written to ${path.relative(pluginRoot, outputPath)} (${entries.length} entries parsed)`);
