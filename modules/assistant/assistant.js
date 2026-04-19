import { getRequestHeaders } from "../../../../../../script.js";
import { extensionFolderPath } from "../../core/constants.js";
import { isTrustedIframeEvent, postToIframe } from "../../core/iframe-messaging.js";
import { executeSlashCommand } from "../../core/slash-command.js";
import { AssistantStorage } from "../../core/server-storage.js";
import { TOOL_NAMES } from "./app-src/tooling.js";
import { normalizeSlashSkillTrigger } from "./app-src/slash-command-policy.js";
import {
    DEFAULT_PRESET_NAME,
    buildDefaultPreset,
    cloneDefaultModelConfigs,
    normalizePermissionMode,
    normalizeAssistantSettings,
    normalizePresetName,
} from "./shared/config.js";

const MODULE_ID = 'assistant';
const OVERLAY_ID = 'xiaobaix-assistant-overlay';
const MINIMIZED_STYLE_ID = 'xiaobaix-assistant-minimized-style';
const HTML_PATH = `${extensionFolderPath}/modules/assistant/assistant-overlay.html`;
const MANIFEST_PATH = `${extensionFolderPath}/modules/assistant/assistant-file-manifest.json`;
const TOOL_RESULT = 'xb-assistant:tool-result';
const TOOL_ERROR = 'xb-assistant:tool-error';
const CONFIG_SAVED = 'xb-assistant:config-saved';
const CONFIG_SAVE_ERROR = 'xb-assistant:config-save-error';
const SKILLS_UPDATED = 'xb-assistant:skills-updated';
const WORKSPACE_PREFIX = 'LittleWhiteBox_Assistant_';
const DEFAULT_WORKSPACE_FILE = `${WORKSPACE_PREFIX}Worklog.md`;
const DEFAULT_IDENTITY_FILE = `${WORKSPACE_PREFIX}Identity.md`;
const DEFAULT_SKILLS_FILE = `${WORKSPACE_PREFIX}Skills.json`;
const SKILL_FILE_PREFIX = `${WORKSPACE_PREFIX}Skill_`;
const DEFAULT_IDENTITY_CONTENT = '你默认叫“小白助手”，这里是你的身份设定，用于保持长期工作习惯和创作风格，请尽快引导用户设定你的身份';
const EMPTY_SKILLS_CATALOG = Object.freeze({
    version: 1,
    skills: [],
});
const MAX_SKILL_PROMPT_ITEMS = 20;
const MAX_CONTENT_CACHE_ENTRIES = 48;
const MAX_READ_FILE_BYTES = 100 * 1024;
const MAX_READ_RETURN_CHARS = 24_000;
const DEFAULT_AUTO_READ_LINES = 220;
const MAX_READ_RANGE_LINES = 400;
const SERVER_FILE_KEY = 'settings';
const CONFIG_VERSION = 1;

let overlay = null;
let manifestCache = null;
const contentCache = new Map();
const activeToolControllers = new Map();
const activeSkillProposalTokens = new Map();
let settingsCache = null;
let settingsLoaded = false;

function ensureMinimizedAssistantStyles() {
    if (document.getElementById(MINIMIZED_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = MINIMIZED_STYLE_ID;
    style.textContent = `
        @keyframes xbAssistantGlowPulse {
            0%, 100% { box-shadow: 0 4px 12px rgba(56, 189, 248, 0.30), inset 0 0 10px rgba(255, 255, 255, 0.10); }
            50% { box-shadow: 0 4px 20px rgba(56, 189, 248, 0.58), 0 0 0 3px rgba(56, 189, 248, 0.18), inset 0 0 15px rgba(255, 255, 255, 0.18); }
        }
        @keyframes xbAssistantHoverFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
        @keyframes xbAssistantFlamePulse {
            0%, 100% { transform: scaleY(1); opacity: 0.6; }
            50% { transform: scaleY(1.5); opacity: 1; }
        }
        @keyframes xbAssistantBlink {
            0%, 94%, 100% { transform: scaleY(1); }
            97% { transform: scaleY(0.1); }
        }
        @keyframes xbAssistantWaveFast {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-30deg); }
            75% { transform: rotate(30deg); }
        }
        @keyframes xbAssistantZzzFloat {
            0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
            40% { opacity: 1; transform: translate(2px, -3px) scale(1); }
            80% { opacity: 0; transform: translate(4px, -6px) scale(1.2); }
            100% { opacity: 0; transform: translate(4px, -6px) scale(1.2); }
        }
        .xb-assistant-minimized-icon {
            width: 36px;
            height: 36px;
            border: 2px solid rgba(255, 255, 255, 0.86);
            border-radius: 50%;
            padding: 0;
            display: none;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1e293b, #0f172a);
            cursor: pointer;
            overflow: visible;
            box-sizing: border-box;
            transition: transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.24s ease, background 0.24s ease, box-shadow 0.24s ease;
            animation: xbAssistantGlowPulse 3s ease-in-out infinite;
            pointer-events: auto;
        }
        .xb-assistant-minimized-icon svg {
            display: block;
            overflow: visible;
        }
        .xb-assistant-minimized-icon.is-visible {
            display: inline-flex;
        }
        .xb-assistant-minimized-icon .xb-bot-group { transform-origin: center; }
        .xb-assistant-minimized-icon .xb-flame {
            transform-origin: center top;
            opacity: 0;
        }
        .xb-assistant-minimized-icon .xb-eyes-normal {
            transform-origin: center;
            animation: xbAssistantBlink 4s infinite;
        }
        .xb-assistant-minimized-icon .xb-eyes-happy {
            opacity: 0;
            transition: opacity 0.2s;
        }
        .xb-assistant-minimized-icon .xb-arm-left {
            transform-origin: 7px 11px;
            transition: transform 0.2s;
        }
        .xb-assistant-minimized-icon .xb-zz1 {
            animation: xbAssistantZzzFloat 2.5s linear infinite;
        }
        .xb-assistant-minimized-icon .xb-zz2 {
            animation: xbAssistantZzzFloat 2.5s linear infinite 1.25s;
        }
        .xb-assistant-minimized-icon .xb-antenna-bulb {
            transition: fill 0.3s ease, filter 0.3s ease;
        }
        .xb-assistant-minimized-icon:hover {
            transform: scale(1.12) rotate(-5deg);
            border-color: #38bdf8;
            background: linear-gradient(135deg, #1b3758, #1e40af);
            box-shadow: 0 8px 25px rgba(56, 189, 248, 0.48);
        }
        .xb-assistant-minimized-icon:hover .xb-zz1,
        .xb-assistant-minimized-icon:hover .xb-zz2 {
            display: none;
        }
        .xb-assistant-minimized-icon:hover .xb-eyes-normal {
            opacity: 0;
            animation: none;
        }
        .xb-assistant-minimized-icon:hover .xb-eyes-happy {
            opacity: 1;
        }
        .xb-assistant-minimized-icon:hover .xb-arm-left {
            animation: xbAssistantWaveFast 0.5s ease-in-out infinite;
        }
        .xb-assistant-minimized-icon:hover .xb-antenna-bulb {
            fill: #38bdf8;
            filter: drop-shadow(0 0 2px #38bdf8);
        }
        .xb-assistant-minimized-icon:hover .xb-flame {
            animation-duration: 0.3s;
            transform: scaleY(2);
            fill: #60a5fa;
        }
    `;
    document.head.appendChild(style);
}

function isAssistantMobileDevice() {
    const mobileTypes = ['mobile', 'tablet'];
    try {
        const platformType = globalThis.Bowser?.parse?.(navigator.userAgent)?.platform?.type;
        if (mobileTypes.includes(platformType)) {
            return true;
        }
    } catch {
        // Fall back to pointer/screen heuristics below.
    }
    return window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(max-width: 900px)').matches;
}

function getAssistantMobileTopOffset() {
    const rawValue = getComputedStyle(document.documentElement).getPropertyValue('--topBarBlockSize').trim();
    const parsedValue = Number.parseFloat(rawValue);
    return Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : 0;
}

function getAssistantMobileViewportHeight() {
    return Math.max(240, window.innerHeight - getAssistantMobileTopOffset());
}

async function persistAssistantSettings(settings, { silent = true } = {}) {
    const next = normalizeAssistantSettings({
        ...settings,
        updatedAt: Date.now(),
        configVersion: CONFIG_VERSION,
    }, {
        defaultWorkspaceFileName: DEFAULT_WORKSPACE_FILE,
        normalizeWorkspaceName,
    });
    settingsCache = next;

    try {
        const data = await AssistantStorage.load();
        data[SERVER_FILE_KEY] = next;
        AssistantStorage._dirtyVersion = (AssistantStorage._dirtyVersion || 0) + 1;
        await AssistantStorage.saveNow({ silent });
        return { ok: true, settings: next };
    } catch (error) {
        return {
            ok: false,
            settings: next,
            error: error instanceof Error ? error.message : String(error || 'unknown_error'),
        };
    }
}

async function loadAssistantSettings() {
    if (settingsLoaded && settingsCache) return settingsCache;

    try {
        const saved = await AssistantStorage.get(SERVER_FILE_KEY, null);
        settingsCache = normalizeAssistantSettings(saved || {}, {
            defaultWorkspaceFileName: DEFAULT_WORKSPACE_FILE,
            normalizeWorkspaceName,
        });

        if (!saved || settingsCache.configVersion !== CONFIG_VERSION) {
            await persistAssistantSettings(settingsCache, { silent: true });
        }
    } catch {
        settingsCache = normalizeAssistantSettings({}, {
            defaultWorkspaceFileName: DEFAULT_WORKSPACE_FILE,
            normalizeWorkspaceName,
        });
    }

    settingsLoaded = true;
    return settingsCache;
}

function getAssistantSettings() {
    if (!settingsCache) {
        settingsCache = normalizeAssistantSettings({}, {
            defaultWorkspaceFileName: DEFAULT_WORKSPACE_FILE,
            normalizeWorkspaceName,
        });
    }
    return settingsCache;
}

function buildRuntimeConfig() {
    const settings = getAssistantSettings();
    const currentPreset = settings.presets?.[settings.currentPresetName] || buildDefaultPreset();
    return {
        enabled: !!settings.enabled,
        provider: currentPreset.provider || 'openai-compatible',
        workspaceFileName: settings.workspaceFileName || DEFAULT_WORKSPACE_FILE,
        modelConfigs: currentPreset.modelConfigs || cloneDefaultModelConfigs(),
        permissionMode: normalizePermissionMode(currentPreset.permissionMode),
        currentPresetName: settings.currentPresetName || DEFAULT_PRESET_NAME,
        presetNames: Object.keys(settings.presets || {}),
        presets: settings.presets || {},
        toolInfo: {
            readableSources: ['littlewhitebox', 'sillytavern-public'],
            writableWorkspacePrefix: WORKSPACE_PREFIX,
        },
    };
}

async function buildAssistantRuntimePayload(signal) {
    let fileCount = 0;
    try {
        const manifest = await loadManifest(signal);
        fileCount = Array.isArray(manifest.files) ? manifest.files.length : 0;
    } catch {
        fileCount = 0;
    }

    let identityContent = DEFAULT_IDENTITY_CONTENT;
    try {
        const identityFile = await ensureUserFile(DEFAULT_IDENTITY_FILE, DEFAULT_IDENTITY_CONTENT, { signal });
        identityContent = String(identityFile.content || '').trim() || DEFAULT_IDENTITY_CONTENT;
    } catch {
        identityContent = DEFAULT_IDENTITY_CONTENT;
    }

    try {
        await ensureUserFile(getAssistantSettings().workspaceFileName || DEFAULT_WORKSPACE_FILE, '', { signal });
    } catch {
        // Ignore auto-create failures so the assistant can still start.
    }

    const skillsRuntime = await readSkillsRuntimeData({ signal });
    return {
        moduleId: MODULE_ID,
        extensionPath: extensionFolderPath,
        indexedFileCount: fileCount,
        identityContent,
        ...skillsRuntime,
    };
}

function getCachedContent(cacheKey) {
    if (!contentCache.has(cacheKey)) return null;
    const cached = contentCache.get(cacheKey);
    contentCache.delete(cacheKey);
    contentCache.set(cacheKey, cached);
    return cached;
}

function setCachedContent(cacheKey, text) {
    if (contentCache.has(cacheKey)) {
        contentCache.delete(cacheKey);
    }
    contentCache.set(cacheKey, text);
    while (contentCache.size > MAX_CONTENT_CACHE_ENTRIES) {
        const oldestKey = contentCache.keys().next().value;
        if (!oldestKey) break;
        contentCache.delete(oldestKey);
    }
}

async function loadManifest(signal) {
    if (manifestCache) return manifestCache;
    const response = await fetch(MANIFEST_PATH, {
        cache: 'no-cache',
        signal,
    });
    if (!response.ok) {
        throw new Error(`manifest_load_failed:${response.status}`);
    }
    manifestCache = await response.json();
    return manifestCache;
}

function normalizeWorkspaceName(input) {
    const raw = String(input || DEFAULT_WORKSPACE_FILE).trim() || DEFAULT_WORKSPACE_FILE;
    const sanitized = raw.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^_+/, '');
    const prefixed = sanitized.startsWith(WORKSPACE_PREFIX) ? sanitized : `${WORKSPACE_PREFIX}${sanitized}`;
    return prefixed || DEFAULT_WORKSPACE_FILE;
}

function normalizeSkillSlug(input) {
    return String(input || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 64);
}

function normalizeSkillFileName(input) {
    const raw = String(input || '').trim();
    if (!raw) return '';
    const sanitized = raw.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^_+/, '');
    if (!sanitized) return '';
    const withoutExtension = sanitized.replace(/\.md$/i, '');
    const withPrefix = withoutExtension.startsWith(SKILL_FILE_PREFIX)
        ? withoutExtension
        : `${SKILL_FILE_PREFIX}${withoutExtension.replace(/^LittleWhiteBox_Assistant_/, '')}`;
    return `${withPrefix}.md`;
}

function safeJsonString(value) {
    return JSON.stringify(String(value ?? ''));
}

function getMissingGenerateSkillSaveFields(args = {}) {
    const requiredRequestFields = ['triggers', 'slashTriggers'];

    return requiredRequestFields.filter((field) => !Object.prototype.hasOwnProperty.call(args, field));
}

function normalizeSkillCatalogEntry(entry = {}) {
    if (!entry || typeof entry !== 'object') return null;
    const id = String(entry.id || '').trim();
    const title = String(entry.title || '').trim();
    const filename = normalizeSkillFileName(entry.filename || '');
    if (!id || !title || !filename) return null;
    const seenTriggers = new Set();
    const triggers = Array.isArray(entry.triggers)
        ? entry.triggers
            .map((item) => String(item || '').trim())
            .filter(Boolean)
            .filter((item) => {
                const lowered = item.toLowerCase();
                if (seenTriggers.has(lowered)) return false;
                seenTriggers.add(lowered);
                return true;
            })
        : [];
    const seenSlashTriggers = new Set();
    const slashTriggers = Array.isArray(entry.slashTriggers)
        ? entry.slashTriggers
            .map((item) => normalizeSlashSkillTrigger(item))
            .filter(Boolean)
            .filter((item) => {
                if (seenSlashTriggers.has(item)) return false;
                seenSlashTriggers.add(item);
                return true;
            })
        : [];
    return {
        id,
        title,
        summary: String(entry.summary || '').trim(),
        filename,
        triggers,
        slashTriggers,
        enabled: entry.enabled !== false,
        updatedAt: String(entry.updatedAt || '').trim() || new Date().toISOString(),
    };
}

function normalizeSkillsCatalog(catalog = {}) {
    const skills = Array.isArray(catalog.skills)
        ? catalog.skills.map(normalizeSkillCatalogEntry).filter(Boolean)
        : [];
    return {
        version: 1,
        skills,
    };
}

function serializeSkillsCatalog(catalog = EMPTY_SKILLS_CATALOG) {
    return `${JSON.stringify(normalizeSkillsCatalog(catalog), null, 2)}\n`;
}

function parseSkillsCatalog(text = '') {
    const parsed = JSON.parse(String(text || '{}'));
    return normalizeSkillsCatalog(parsed);
}

function buildSkillsPromptSummary(catalog = EMPTY_SKILLS_CATALOG) {
    const enabledSkills = (catalog.skills || []).filter((item) => item.enabled !== false);
    if (!enabledSkills.length) return '';
    const visibleSkills = enabledSkills.slice(0, MAX_SKILL_PROMPT_ITEMS);
    const lines = [
        '技能目录摘要：只注入目录，不注入正文；命中某项后先读目录，再按需读取对应 skill。',
    ];
    visibleSkills.forEach((skill) => {
        lines.push(`- ${skill.title}｜${skill.summary || '无摘要'}｜触发词: ${(skill.triggers || []).join(', ') || '无'}｜文件: ${skill.filename}`);
    });
    if (enabledSkills.length > visibleSkills.length) {
        lines.push(`- 其余 ${enabledSkills.length - visibleSkills.length} 条技能未注入；如需查看，请调用 ReadSkillsCatalog。`);
    }
    return lines.join('\n');
}

function buildSkillFileContent({
    id,
    title,
    summary,
    triggers,
    slashTriggers,
    whenToUse,
    enabled,
    createdAt,
    updatedAt,
    body,
}) {
    const triggerLines = Array.isArray(triggers) && triggers.length
        ? triggers.map((item) => `  - ${safeJsonString(item)}`).join('\n')
        : '  - "skill"';
    const slashTriggerLines = Array.isArray(slashTriggers) && slashTriggers.length
        ? slashTriggers.map((item) => `  - ${safeJsonString(item)}`).join('\n')
        : '';
    const normalizedBody = String(body || '').trim();
    return [
        '---',
        `id: ${safeJsonString(id)}`,
        `title: ${safeJsonString(title)}`,
        `summary: ${safeJsonString(summary)}`,
        'triggers:',
        triggerLines,
        ...(slashTriggerLines ? ['slash_triggers:', slashTriggerLines] : []),
        `when_to_use: ${safeJsonString(whenToUse)}`,
        `enabled: ${enabled !== false ? 'true' : 'false'}`,
        `created_at: ${safeJsonString(createdAt)}`,
        `updated_at: ${safeJsonString(updatedAt)}`,
        '---',
        '',
        normalizedBody,
        '',
    ].join('\n');
}

function parseStructuredSkillFile(content = '') {
    const text = String(content || '');
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match) return null;

    const frontmatter = match[1];
    const body = String(match[2] || '').replace(/\s+$/, '');
    const parsed = {
        body,
        triggers: [],
        slashTriggers: [],
    };

    const lines = frontmatter.split(/\r?\n/);
    let index = 0;
    while (index < lines.length) {
        const line = lines[index];
        if (!line) {
            index += 1;
            continue;
        }

        if (line.startsWith('triggers:') || line.startsWith('slash_triggers:')) {
            const targetKey = line.startsWith('slash_triggers:') ? 'slashTriggers' : 'triggers';
            index += 1;
            while (index < lines.length && /^\s*-\s+/.test(lines[index])) {
                const triggerValue = lines[index].replace(/^\s*-\s+/, '').trim();
                try {
                    parsed[targetKey].push(JSON.parse(triggerValue));
                } catch {
                    parsed[targetKey].push(triggerValue.replace(/^"+|"+$/g, ''));
                }
                index += 1;
            }
            continue;
        }

        const separatorIndex = line.indexOf(':');
        if (separatorIndex <= 0) {
            index += 1;
            continue;
        }

        const key = line.slice(0, separatorIndex).trim();
        const rawValue = line.slice(separatorIndex + 1).trim();
        if (!key) {
            index += 1;
            continue;
        }

        if (rawValue === 'true' || rawValue === 'false') {
            parsed[key] = rawValue === 'true';
        } else if (rawValue) {
            try {
                parsed[key] = JSON.parse(rawValue);
            } catch {
                parsed[key] = rawValue.replace(/^"+|"+$/g, '');
            }
        } else {
            parsed[key] = '';
        }
        index += 1;
    }

    return parsed;
}

function validateSkillBody(content = '') {
    const requiredSections = [
        '# Goal',
        '# When to Use',
        '# Inputs',
        '# Workflow',
        '# Pitfalls',
        '# Examples',
        '# References',
    ];
    const normalized = String(content || '');
    const missing = requiredSections.filter((section) => !normalized.includes(section));
    return {
        ok: missing.length === 0,
        missing,
    };
}

function createSkillProposalToken(payload = {}) {
    const token = `skill-proposal-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    activeSkillProposalTokens.set(token, {
        ...payload,
        createdAt: Date.now(),
    });
    return token;
}

function getSkillProposalToken(token) {
    const normalized = String(token || '').trim();
    if (!normalized) return null;
    return activeSkillProposalTokens.get(normalized) || null;
}

function deleteSkillProposalToken(token) {
    const normalized = String(token || '').trim();
    if (!normalized) return;
    activeSkillProposalTokens.delete(normalized);
}

function ensureNotAborted(signal) {
    if (signal?.aborted) {
        throw new Error('tool_aborted');
    }
}

async function readTextFile(publicPath, options = {}) {
    const cacheKey = String(publicPath || '').trim();
    if (!cacheKey) throw new Error('empty_path');
    const cached = getCachedContent(cacheKey);
    if (cached !== null) return cached;

    const response = await fetch(`/${cacheKey}`, {
        cache: 'no-cache',
        signal: options.signal,
    });
    if (!response.ok) {
        throw new Error(`file_read_failed:${response.status}`);
    }
    const text = await response.text();
    setCachedContent(cacheKey, text);
    return text;
}

function escapeRegExp(text) {
    return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizePathForMatch(value) {
    return String(value || '').replace(/\\/g, '/');
}

function escapeCharClass(text) {
    return String(text || '').replace(/\\/g, '\\\\').replace(/\]/g, '\\]');
}

function findMatchingToken(text, startIndex, openChar, closeChar) {
    let depth = 0;
    for (let index = startIndex; index < text.length; index += 1) {
        const char = text[index];
        if (char === '\\') {
            index += 1;
            continue;
        }
        if (char === openChar) depth += 1;
        if (char === closeChar) {
            depth -= 1;
            if (depth === 0) return index;
        }
    }
    return -1;
}

function splitTopLevel(text, separator = ',') {
    const parts = [];
    let depth = 0;
    let current = '';
    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        if (char === '\\') {
            current += char;
            if (index + 1 < text.length) {
                current += text[index + 1];
                index += 1;
            }
            continue;
        }
        if (char === '{' || char === '[' || char === '(') depth += 1;
        if (char === '}' || char === ']' || char === ')') depth = Math.max(0, depth - 1);
        if (char === separator && depth === 0) {
            parts.push(current);
            current = '';
            continue;
        }
        current += char;
    }
    parts.push(current);
    return parts;
}

function globFragmentToRegex(pattern) {
    let regexText = '';
    for (let index = 0; index < pattern.length; index += 1) {
        const char = pattern[index];
        const nextChar = pattern[index + 1];

        if (char === '\\') {
            if (index + 1 < pattern.length) {
                regexText += escapeRegExp(pattern[index + 1]);
                index += 1;
            } else {
                regexText += '\\\\';
            }
            continue;
        }

        if (char === '*') {
            if (nextChar === '*') {
                const afterNext = pattern[index + 2];
                if (afterNext === '/') {
                    regexText += '(?:.*\\/)?';
                    index += 2;
                } else {
                    regexText += '.*';
                    index += 1;
                }
            } else {
                regexText += '[^/]*';
            }
            continue;
        }

        if (char === '?') {
            regexText += '[^/]';
            continue;
        }

        if (char === '[') {
            const closingIndex = pattern.indexOf(']', index + 1);
            if (closingIndex === -1) {
                regexText += '\\[';
                continue;
            }
            const rawClass = pattern.slice(index + 1, closingIndex);
            const negated = rawClass.startsWith('!');
            const classBody = negated ? rawClass.slice(1) : rawClass;
            regexText += `[${negated ? '^' : ''}${escapeCharClass(classBody)}]`;
            index = closingIndex;
            continue;
        }

        if (char === '{') {
            const closingIndex = findMatchingToken(pattern, index, '{', '}');
            if (closingIndex === -1) {
                regexText += '\\{';
                continue;
            }
            const rawGroup = pattern.slice(index + 1, closingIndex);
            const alternatives = splitTopLevel(rawGroup).filter(Boolean);
            if (alternatives.length > 1) {
                regexText += `(?:${alternatives.map((item) => globFragmentToRegex(item)).join('|')})`;
            } else {
                regexText += `\\{${escapeRegExp(rawGroup)}\\}`;
            }
            index = closingIndex;
            continue;
        }

        regexText += escapeRegExp(char);
    }
    return regexText;
}

function compileGlobPattern(pattern) {
    const normalized = normalizePathForMatch(pattern).trim();
    if (!normalized) {
        throw new Error('glob_pattern_required');
    }

    const regex = new RegExp(`^${globFragmentToRegex(normalized)}$`, 'i');
    const basenameRegex = normalized.includes('/')
        ? null
        : new RegExp(`^${globFragmentToRegex(normalized)}$`, 'i');

    return {
        pattern: normalized,
        regex,
        basenameRegex,
    };
}

function matchesGlob(publicPath, relativePath, matcher) {
    const fullPath = normalizePathForMatch(publicPath);
    const shortPath = normalizePathForMatch(relativePath);
    if (matcher.regex.test(fullPath) || matcher.regex.test(shortPath)) {
        return true;
    }
    if (matcher.basenameRegex) {
        const fullName = fullPath.split('/').pop() || '';
        const shortName = shortPath.split('/').pop() || '';
        return matcher.basenameRegex.test(fullName) || matcher.basenameRegex.test(shortName);
    }
    return false;
}

async function globFiles(args = {}, options = {}) {
    const manifest = await loadManifest(options.signal);
    const pattern = String(args.pattern || '').trim();
    const matcher = compileGlobPattern(pattern);
    const limit = Math.max(1, Math.min(Number(args.limit) || 50, 100));
    const files = Array.isArray(manifest.files) ? manifest.files : [];
    const matched = files
        .filter((entry) => matchesGlob(entry.publicPath, entry.relativePath, matcher))
        .sort((a, b) => String(a.publicPath || '').localeCompare(String(b.publicPath || ''), 'zh-CN'));

    return {
        pattern,
        total: matched.length,
        items: matched.slice(0, limit),
        truncated: matched.length > limit,
    };
}

async function listDirectory(args = {}, options = {}) {
    const manifest = await loadManifest(options.signal);
    const rawPath = String(args.path || '').trim();
    if (!rawPath) {
        throw new Error('directory_path_required');
    }

    const directoryPath = rawPath.endsWith('/') ? rawPath : `${rawPath}/`;
    const normalizedPrefix = directoryPath.toLowerCase();
    const limit = Math.max(1, Math.min(Number(args.limit) || 50, 100));
    const files = Array.isArray(manifest.files) ? manifest.files : [];
    const entryMap = new Map();

    files.forEach((entry) => {
        const publicPath = String(entry.publicPath || '');
        const normalizedPath = publicPath.toLowerCase();
        if (!normalizedPath.startsWith(normalizedPrefix)) return;

        const remainder = publicPath.slice(directoryPath.length);
        if (!remainder) return;

        const slashIndex = remainder.indexOf('/');
        const childName = slashIndex === -1 ? remainder : remainder.slice(0, slashIndex);
        const isDirectory = slashIndex !== -1;
        const childPath = isDirectory ? `${directoryPath}${childName}/` : `${directoryPath}${childName}`;
        const existing = entryMap.get(childPath);

        if (existing) {
            existing.descendantFileCount += 1;
            if (isDirectory) existing.type = 'directory';
            return;
        }

        entryMap.set(childPath, {
            publicPath: childPath,
            source: entry.source,
            type: isDirectory ? 'directory' : 'file',
            descendantFileCount: 1,
        });
    });

    const items = Array.from(entryMap.values()).sort((a, b) => a.publicPath.localeCompare(b.publicPath, 'zh-CN'));
    return {
        directoryPath,
        total: items.length,
        items: items.slice(0, limit),
        truncated: items.length > limit,
    };
}

function clampLineNumber(value, fallback, totalLines) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(Math.max(1, Math.trunc(numeric)), Math.max(totalLines, 1));
}

function formatLineNumberedContent(lines, startLine, totalLines) {
    const width = String(Math.max(totalLines, startLine)).length;
    return lines.map((line, index) => `${String(startLine + index).padStart(width, ' ')}\t${line}`);
}

function sliceLinesWithBudget(lines, startLine, requestedEndLine, maxChars) {
    const totalLines = lines.length;
    const safeEndLine = Math.min(Math.max(startLine, requestedEndLine), Math.max(totalLines, 1));
    const selected = [];
    let totalChars = 0;
    let endLine = startLine - 1;
    let charLimited = false;

    for (let lineNumber = startLine; lineNumber <= safeEndLine; lineNumber += 1) {
        const line = lines[lineNumber - 1] ?? '';
        const numberedLine = formatLineNumberedContent([line], lineNumber, totalLines)[0];
        const addition = selected.length ? numberedLine.length + 1 : numberedLine.length;
        if (selected.length && totalChars + addition > maxChars) {
            charLimited = true;
            break;
        }
        if (!selected.length && addition > maxChars) {
            selected.push(numberedLine.slice(0, maxChars));
            totalChars = maxChars;
            endLine = lineNumber;
            charLimited = true;
            break;
        }
        selected.push(numberedLine);
        totalChars += addition;
        endLine = lineNumber;
    }

    if (!selected.length && totalLines === 0) {
        return {
            content: '',
            endLine: 0,
            charLimited: false,
        };
    }

    return {
        content: selected.join('\n'),
        endLine,
        charLimited,
    };
}

async function readFile(args = {}, options = {}) {
    const manifest = await loadManifest(options.signal);
    const targetPath = String(args.path || '').trim();
    const entry = (manifest.files || []).find((item) => item.publicPath === targetPath);
    if (!entry) {
        throw new Error('file_not_indexed');
    }
    const content = await readTextFile(entry.publicPath, options);
    const lines = content === '' ? [] : content.split('\n');
    const totalLines = lines.length;
    const sizeBytes = new TextEncoder().encode(content).length;
    const hasRange = Number.isFinite(Number(args.startLine)) || Number.isFinite(Number(args.endLine));

    if (totalLines === 0) {
        return {
            path: entry.publicPath,
            source: entry.source,
            sizeBytes,
            totalLines: 0,
            startLine: 1,
            endLine: 0,
        returnedLines: 0,
        hasMoreBefore: false,
        hasMoreAfter: false,
        nextStartLine: null,
        nextEndLine: null,
        truncated: false,
        autoChunked: false,
        charLimited: false,
        limitReason: null,
        contentFormat: 'numbered_lines',
        content: '',
    };
}

    const startLine = clampLineNumber(args.startLine, 1, totalLines);
    let requestedEndLine;
    let autoChunked = false;

    if (hasRange) {
        requestedEndLine = clampLineNumber(
            args.endLine,
            Math.min(totalLines, startLine + DEFAULT_AUTO_READ_LINES - 1),
            totalLines,
        );
    } else if (sizeBytes > MAX_READ_FILE_BYTES || content.length > MAX_READ_RETURN_CHARS) {
        requestedEndLine = Math.min(totalLines, startLine + DEFAULT_AUTO_READ_LINES - 1);
        autoChunked = true;
    } else {
        requestedEndLine = totalLines;
    }

    requestedEndLine = Math.min(requestedEndLine, startLine + MAX_READ_RANGE_LINES - 1, totalLines);
    const slice = sliceLinesWithBudget(lines, startLine, requestedEndLine, MAX_READ_RETURN_CHARS);
    const endLine = slice.endLine || requestedEndLine;
    const hasMoreBefore = startLine > 1;
    const hasMoreAfter = endLine < totalLines;

    return {
        path: entry.publicPath,
        source: entry.source,
        sizeBytes,
        totalLines,
        startLine,
        endLine,
        returnedLines: endLine >= startLine ? (endLine - startLine + 1) : 0,
        hasMoreBefore,
        hasMoreAfter,
        nextStartLine: hasMoreAfter ? endLine + 1 : null,
        nextEndLine: hasMoreAfter ? Math.min(totalLines, endLine + DEFAULT_AUTO_READ_LINES) : null,
        truncated: hasMoreBefore || hasMoreAfter || slice.charLimited || autoChunked,
        autoChunked,
        charLimited: slice.charLimited,
        limitReason: autoChunked
            ? 'auto_chunked'
            : slice.charLimited
                ? 'output_budget'
                : (hasMoreBefore || hasMoreAfter)
                    ? 'requested_range'
                    : null,
        contentFormat: 'numbered_lines',
        content: slice.content,
    };
}

async function grepFiles(args = {}, options = {}) {
    const manifest = await loadManifest(options.signal);
    const pattern = String(args.pattern || '').trim();
    if (!pattern) throw new Error('empty_query');

    const useRegex = 'useRegex' in args ? !!args.useRegex : true;
    const outputMode = ['content', 'files_with_matches', 'count'].includes(String(args.outputMode || ''))
        ? String(args.outputMode)
        : 'files_with_matches';
    const limit = Math.max(1, Math.min(Number(args.limit) || 10, 50));
    const offset = Math.max(0, Math.trunc(Number(args.offset) || 0));
    const contextLines = Math.max(0, Math.min(Number(args.contextLines) || 0, 5));
    const glob = String(args.glob || '').trim();
    const files = Array.isArray(manifest.files) ? manifest.files : [];
    const fileMatcher = glob ? compileGlobPattern(glob) : null;
    const candidateFiles = fileMatcher
        ? files.filter((entry) => matchesGlob(entry.publicPath, entry.relativePath, fileMatcher))
        : files;

    let regex = null;
    if (useRegex) {
        try {
            regex = new RegExp(pattern, 'i');
        } catch (error) {
            throw new Error(`invalid_regex:${error.message}`);
        }
    }
    const loweredPattern = useRegex ? null : pattern.toLowerCase();

    const results = [];
    let scannedFiles = 0;
    let truncated = false;
    let matchedFiles = 0;
    for (const entry of candidateFiles) {
        ensureNotAborted(options.signal);
        scannedFiles += 1;

        try {
            const text = await readTextFile(entry.publicPath, options);
            const lines = text.split('\n');
            const matches = [];

            lines.forEach((line, lineIndex) => {
                const isMatch = useRegex
                    ? regex.test(line)
                    : line.toLowerCase().includes(loweredPattern);

                if (!isMatch) return;

                const lineNumber = lineIndex + 1;
                const contextStart = Math.max(0, lineIndex - contextLines);
                const contextEnd = Math.min(lines.length, lineIndex + contextLines + 1);
                const contextText = lines.slice(contextStart, contextEnd)
                    .map((contextLine, contextIndex) => {
                        const num = contextStart + contextIndex + 1;
                        const prefix = num === lineNumber ? '>' : ' ';
                        return `${prefix} ${num}: ${contextLine}`;
                    })
                    .join('\n');

                matches.push({
                    line: lineNumber,
                    text: line.trim(),
                    context: contextLines > 0 ? contextText : null,
                });
            });

            if (!matches.length) continue;
            matchedFiles += 1;
            if (matchedFiles <= offset) continue;

            if (outputMode === 'count') {
                results.push({
                    path: entry.publicPath,
                    source: entry.source,
                    matchCount: matches.length,
                });
            } else if (outputMode === 'files_with_matches') {
                results.push({
                    path: entry.publicPath,
                    source: entry.source,
                    matchCount: matches.length,
                });
            } else {
                results.push({
                    path: entry.publicPath,
                    source: entry.source,
                    matchCount: matches.length,
                    matches: matches.slice(0, 10),
                });
            }
            if (results.length >= limit) {
                truncated = matchedFiles < candidateFiles.length || scannedFiles < candidateFiles.length;
                break;
            }
        } catch {
            continue;
        }
    }

    return {
        pattern,
        useRegex,
        outputMode,
        glob: glob || '',
        limit,
        offset,
        contextLines,
        total: truncated ? null : matchedFiles,
        returned: results.length,
        matchedFilesSeen: matchedFiles,
        items: results,
        truncated,
        scannedFiles,
        candidateFiles: candidateFiles.length,
        indexedFiles: files.length,
        searchComplete: !truncated && scannedFiles >= candidateFiles.length,
        nextOffset: offset + results.length,
    };
}

function encodeBase64Utf8(value) {
    return btoa(String.fromCharCode(...new TextEncoder().encode(value)));
}

async function writeUserFile(name, content, options = {}) {
    const response = await fetch('/api/files/upload', {
        method: 'POST',
        signal: options.signal,
        headers: {
            ...getRequestHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            data: encodeBase64Utf8(content),
        }),
    });

    if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(`workspace_write_failed:${response.status}:${message}`);
    }

    const data = await response.json();
    return {
        name,
        path: data.path || `user/files/${name}`,
    };
}

async function deleteUserFile(name, options = {}) {
    const response = await fetch('/api/files/delete', {
        method: 'POST',
        signal: options.signal,
        headers: {
            ...getRequestHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            path: `user/files/${name}`,
        }),
    });

    if (response.status === 404) {
        return {
            name,
            deleted: false,
            exists: false,
            path: `user/files/${name}`,
        };
    }

    if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(`workspace_delete_failed:${response.status}:${message}`);
    }

    return {
        name,
        deleted: true,
        exists: true,
        path: `user/files/${name}`,
    };
}

async function readUserFile(name, options = {}) {
    const response = await fetch(`/user/files/${encodeURIComponent(name)}`, {
        cache: 'no-cache',
        signal: options.signal,
        headers: {
            ...getRequestHeaders(),
        },
    });

    if (response.status === 404) {
        return {
            name,
            exists: false,
            content: '',
        };
    }

    if (!response.ok) {
        throw new Error(`workspace_read_failed:${response.status}`);
    }

    return {
        name,
        exists: true,
        content: await response.text(),
    };
}

async function ensureUserFile(name, defaultContent = '', options = {}) {
    const existing = await readUserFile(name, options);
    if (existing.exists) {
        return {
            ...existing,
            created: false,
        };
    }

    await writeUserFile(name, defaultContent, options);
    return {
        name,
        exists: true,
        content: defaultContent,
        created: true,
    };
}

async function ensureSkillsCatalogFile(options = {}) {
    return ensureUserFile(DEFAULT_SKILLS_FILE, serializeSkillsCatalog(EMPTY_SKILLS_CATALOG), options);
}

async function readSkillsCatalogData(options = {}) {
    const file = await ensureSkillsCatalogFile(options);
    try {
        const catalog = parseSkillsCatalog(file.content || '');
        return {
            ok: true,
            name: file.name,
            catalog,
            summaryText: buildSkillsPromptSummary(catalog),
            content: serializeSkillsCatalog(catalog),
        };
    } catch (error) {
        return {
            ok: false,
            name: file.name,
            error: 'skills_catalog_invalid',
            message: error instanceof Error ? error.message : String(error || 'invalid_json'),
            catalog: normalizeSkillsCatalog(EMPTY_SKILLS_CATALOG),
            summaryText: '',
            content: String(file.content || ''),
        };
    }
}

async function writeSkillsCatalogData(catalog, options = {}) {
    const normalized = normalizeSkillsCatalog(catalog);
    const content = serializeSkillsCatalog(normalized);
    const file = await writeUserFile(DEFAULT_SKILLS_FILE, content, options);
    return {
        name: file.name,
        path: file.path,
        catalog: normalized,
        content,
        summaryText: buildSkillsPromptSummary(normalized),
    };
}

function createUniqueSkillIdentity(title, catalog = EMPTY_SKILLS_CATALOG) {
    const baseSlug = normalizeSkillSlug(title) || `skill-${Date.now()}`;
    const existingIds = new Set((catalog.skills || []).map((item) => item.id));
    const existingFiles = new Set((catalog.skills || []).map((item) => item.filename));
    let slug = baseSlug;
    let suffix = 1;
    let id = `skill-${slug}`;
    let filename = `${SKILL_FILE_PREFIX}${slug}.md`;
    while (existingIds.has(id) || existingFiles.has(filename)) {
        slug = `${baseSlug}-${suffix}`;
        id = `skill-${slug}`;
        filename = `${SKILL_FILE_PREFIX}${slug}.md`;
        suffix += 1;
    }
    return { id, filename, slug };
}

async function readSkillsCatalogTool(_args = {}, options = {}) {
    const result = await readSkillsCatalogData(options);
    if (!result.ok) {
        return {
            ok: false,
            name: result.name,
            error: result.error,
            message: `Skills.json 解析失败：${result.message}`,
            details: String(result.content || ''),
        };
    }
    return {
        ok: true,
        name: result.name,
        version: result.catalog.version,
        total: result.catalog.skills.length,
        enabledCount: result.catalog.skills.filter((item) => item.enabled !== false).length,
        skills: result.catalog.skills,
        summaryText: result.summaryText,
        content: result.content,
    };
}

async function readSkillTool(args = {}, options = {}) {
    const byId = String(args.id || '').trim();
    const byFilename = normalizeSkillFileName(args.filename || '');
    if (!byId && !byFilename) {
        return {
            ok: false,
            error: 'skill_identifier_required',
            message: '必须提供 id 或 filename 其中之一。',
        };
    }

    const catalogResult = await readSkillsCatalogData(options);
    if (!catalogResult.ok) {
        return {
            ok: false,
            error: catalogResult.error,
            message: `Skills.json 解析失败：${catalogResult.message}`,
        };
    }

    const skill = byId
        ? catalogResult.catalog.skills.find((item) => item.id === byId)
        : catalogResult.catalog.skills.find((item) => item.filename === byFilename);

    if (!skill) {
        return {
            ok: false,
            error: 'skill_not_found',
            message: byId ? `目录里找不到 id 为 ${byId} 的 skill。` : `目录里找不到文件 ${byFilename} 对应的 skill。`,
        };
    }

    const file = await readUserFile(skill.filename, options);
    if (!file.exists) {
        return {
            ok: false,
            error: 'skill_file_not_found',
            message: `skill 文件不存在：${skill.filename}`,
            id: skill.id,
            filename: skill.filename,
        };
    }

    return {
        ok: true,
        id: skill.id,
        title: skill.title,
        summary: skill.summary,
        filename: skill.filename,
        triggers: skill.triggers,
        slashTriggers: skill.slashTriggers,
        enabled: skill.enabled,
        updatedAt: skill.updatedAt,
        content: String(file.content || ''),
    };
}

async function updateSkillTool(args = {}, options = {}) {
    const byId = String(args.id || '').trim();
    const byFilename = normalizeSkillFileName(args.filename || '');
    if (!byId && !byFilename) {
        return {
            ok: false,
            error: 'skill_identifier_required',
            message: '必须提供 id 或 filename 其中之一。',
        };
    }

    const catalogResult = await readSkillsCatalogData(options);
    if (!catalogResult.ok) {
        return {
            ok: false,
            error: catalogResult.error,
            message: `Skills.json 解析失败：${catalogResult.message}`,
        };
    }

    const skill = byId
        ? catalogResult.catalog.skills.find((item) => item.id === byId)
        : catalogResult.catalog.skills.find((item) => item.filename === byFilename);

    if (!skill) {
        return {
            ok: false,
            error: 'skill_not_found',
            message: byId ? `目录里找不到 id 为 ${byId} 的 skill。` : `目录里找不到文件 ${byFilename} 对应的 skill。`,
        };
    }

    const file = await readUserFile(skill.filename, options);
    if (!file.exists) {
        return {
            ok: false,
            error: 'skill_file_not_found',
            message: `skill 文件不存在：${skill.filename}`,
            id: skill.id,
            filename: skill.filename,
        };
    }

    const parsedFile = parseStructuredSkillFile(file.content || '');
    if (!parsedFile) {
        return {
            ok: false,
            error: 'skill_file_invalid',
            message: `skill 文件格式无效，无法更新：${skill.filename}`,
            id: skill.id,
            filename: skill.filename,
        };
    }

    const title = String(args.title || '').trim() || skill.title;
    const summary = String(args.summary || '').trim() || skill.summary;
    const whenToUse = String(args.when_to_use || '').trim() || String(parsedFile.when_to_use || '').trim();
    const content = String(args.content || '').trim() || String(parsedFile.body || '').trim();
    const enabled = typeof args.enabled === 'boolean' ? args.enabled : skill.enabled !== false;
    const createdAt = String(parsedFile.created_at || '').trim() || new Date().toISOString();
    const seenTriggers = new Set();
    const rawTriggers = Array.isArray(args.triggers)
        ? args.triggers
        : (Array.isArray(parsedFile.triggers) && parsedFile.triggers.length ? parsedFile.triggers : skill.triggers);
    const triggers = rawTriggers
        .map((item) => String(item || '').trim())
        .filter(Boolean)
        .filter((item) => {
            const lowered = item.toLowerCase();
            if (seenTriggers.has(lowered)) return false;
            seenTriggers.add(lowered);
            return true;
        });
    const seenSlashTriggers = new Set();
    const rawSlashTriggers = Array.isArray(args.slashTriggers)
        ? args.slashTriggers
        : (Array.isArray(parsedFile.slashTriggers) && parsedFile.slashTriggers.length ? parsedFile.slashTriggers : skill.slashTriggers);
    const slashTriggers = rawSlashTriggers
        .map((item) => normalizeSlashSkillTrigger(item))
        .filter(Boolean)
        .filter((item) => {
            if (seenSlashTriggers.has(item)) return false;
            seenSlashTriggers.add(item);
            return true;
        });

    if (!title) {
        return {
            ok: false,
            error: 'skill_title_required',
            message: '更新 skill 时 title 不能为空。',
        };
    }
    if (!summary) {
        return {
            ok: false,
            error: 'skill_summary_required',
            message: '更新 skill 时 summary 不能为空。',
        };
    }
    if (!whenToUse) {
        return {
            ok: false,
            error: 'skill_when_to_use_required',
            message: '更新 skill 时 when_to_use 不能为空。',
        };
    }
    if (!content) {
        return {
            ok: false,
            error: 'skill_content_required',
            message: '更新 skill 时正文不能为空。',
        };
    }

    const validation = validateSkillBody(content);
    if (!validation.ok) {
        return {
            ok: false,
            error: 'skill_sections_missing',
            message: `skill 正文缺少必填章节：${validation.missing.join('、')}`,
        };
    }

    const now = new Date().toISOString();
    const fileContent = buildSkillFileContent({
        id: skill.id,
        title,
        summary,
        triggers,
        slashTriggers,
        whenToUse,
        enabled,
        createdAt,
        updatedAt: now,
        body: content,
    });
    await writeUserFile(skill.filename, fileContent, options);

    const nextCatalog = normalizeSkillsCatalog({
        ...catalogResult.catalog,
        skills: catalogResult.catalog.skills.map((item) => item.id === skill.id
            ? {
                ...item,
                title,
                summary,
                triggers,
                slashTriggers,
                enabled,
                updatedAt: now,
            }
            : item),
    });
    await writeSkillsCatalogData(nextCatalog, options);

    return {
        ok: true,
        id: skill.id,
        title,
        filename: skill.filename,
        enabled,
        updatedAt: now,
        note: '技能正文和 Skills.json 已更新，当前会话技能目录会立即刷新。',
    };
}

async function generateSkillTool(args = {}, options = {}) {
    const action = String(args.action || '').trim();
    if (action !== 'propose' && action !== 'save') {
        return {
            ok: false,
            error: 'skill_action_required',
            message: 'GenerateSkill 必须提供 action=propose 或 action=save。',
        };
    }

    const catalogResult = await readSkillsCatalogData(options);
    if (!catalogResult.ok) {
        return {
            ok: false,
            error: catalogResult.error,
            message: `Skills.json 解析失败：${catalogResult.message}`,
        };
    }

    if (action === 'propose') {
        const title = String(args.title || '').trim();
        const reason = String(args.reason || '').trim();
        const sourceSummary = String(args.sourceSummary || '').trim();
        if (!title) {
            return {
                ok: false,
                error: 'skill_title_required',
                message: 'propose 阶段必须提供 title。',
            };
        }
        if (!reason) {
            return {
                ok: false,
                error: 'skill_reason_required',
                message: 'propose 阶段必须提供 reason。',
            };
        }
        if (!sourceSummary) {
            return {
                ok: false,
                error: 'skill_source_summary_required',
                message: 'propose 阶段必须提供 sourceSummary。',
            };
        }
        const suggestion = createUniqueSkillIdentity(title, catalogResult.catalog);
        const approvalToken = createSkillProposalToken({
            id: suggestion.id,
            filename: suggestion.filename,
            title,
        });
        return {
            ok: true,
            action: 'propose',
            approved: true,
            approvalToken,
            id: suggestion.id,
            filename: suggestion.filename,
            title,
            reason,
            sourceSummary,
            instructions: [
                '请把刚才完成的任务过程沉淀成一条可复用 skill。',
                '重点总结：关键步骤、分支判断、踩坑与恢复方式、适用边界。',
                '正文不要包含 frontmatter；只提交 markdown 正文，并严格包含这些章节：# Goal、# When to Use、# Inputs、# Workflow、# Pitfalls、# Examples、# References。',
                '准备好后，再调用 GenerateSkill action="save" 写入 skill。',
            ].join('\n'),
            template: {
                requiredSections: ['# Goal', '# When to Use', '# Inputs', '# Workflow', '# Pitfalls', '# Examples', '# References'],
            },
        };
    }

    const approvalToken = String(args.approvalToken || '').trim();
    const proposal = getSkillProposalToken(approvalToken);
    if (!proposal) {
        return {
            ok: false,
            error: 'skill_approval_token_invalid',
            message: 'approvalToken 无效、已过期，或已经被使用过。',
        };
    }

    const id = String(args.id || '').trim();
    if (id !== proposal.id) {
        return {
            ok: false,
            error: 'skill_id_mismatch',
            message: `save 阶段必须使用 propose 返回的 id：${proposal.id}`,
        };
    }

    const title = String(args.title || '').trim() || proposal.title;
    const summary = String(args.summary || '').trim();
    const whenToUse = String(args.when_to_use || '').trim();
    const content = String(args.content || '');
    const enabled = args.enabled !== false;
    const seenTriggers = new Set();
    const triggers = Array.isArray(args.triggers)
        ? args.triggers
            .map((item) => String(item || '').trim())
            .filter(Boolean)
            .filter((item) => {
                const lowered = item.toLowerCase();
                if (seenTriggers.has(lowered)) return false;
                seenTriggers.add(lowered);
                return true;
            })
        : [];
    const seenSlashTriggers = new Set();
    const slashTriggers = Array.isArray(args.slashTriggers)
        ? args.slashTriggers
            .map((item) => normalizeSlashSkillTrigger(item))
            .filter(Boolean)
            .filter((item) => {
                if (seenSlashTriggers.has(item)) return false;
                seenSlashTriggers.add(item);
                return true;
            })
        : [];

    if (!title) {
        return {
            ok: false,
            error: 'skill_title_required',
            message: 'save 阶段必须提供 title。',
        };
    }
    if (!summary) {
        return {
            ok: false,
            error: 'skill_summary_required',
            message: 'save 阶段必须提供 summary。',
        };
    }
    if (!whenToUse) {
        return {
            ok: false,
            error: 'skill_when_to_use_required',
            message: 'save 阶段必须提供 when_to_use。',
        };
    }
    if (!content.trim()) {
        return {
            ok: false,
            error: 'skill_content_required',
            message: 'save 阶段必须提供 skill 正文。',
        };
    }

    const validation = validateSkillBody(content);
    if (!validation.ok) {
        return {
            ok: false,
            error: 'skill_sections_missing',
            message: `skill 正文缺少必填章节：${validation.missing.join('、')}`,
        };
    }

    if (catalogResult.catalog.skills.some((item) => item.id === id || item.filename === proposal.filename)) {
        return {
            ok: false,
            error: 'skill_already_exists',
            message: `技能已存在：${id}`,
        };
    }

    const now = new Date().toISOString();
    const fileContent = buildSkillFileContent({
        id,
        title,
        summary,
        triggers,
        slashTriggers,
        whenToUse,
        enabled,
        createdAt: now,
        updatedAt: now,
        body: content,
    });
    await writeUserFile(proposal.filename, fileContent, options);

    const nextCatalog = normalizeSkillsCatalog({
        ...catalogResult.catalog,
        skills: [
            ...catalogResult.catalog.skills,
            {
                id,
                title,
                summary,
                filename: proposal.filename,
                triggers,
                slashTriggers,
                enabled,
                updatedAt: now,
            },
        ],
    });
    await writeSkillsCatalogData(nextCatalog, options);
    deleteSkillProposalToken(approvalToken);

    const missingFields = getMissingGenerateSkillSaveFields(args);
    const missingFieldsNotice = missingFields.length
        ? `本次未传关键字段：${missingFields.join('、')}。必须继续调用 UpdateSkill 补齐。`
        : '';

    return {
        ok: true,
        action: 'save',
        id,
        title,
        filename: proposal.filename,
        enabled,
        updatedAt: now,
        note: '技能正文和 Skills.json 已写入，当前会话技能目录会立即刷新。',
        ...(missingFields.length
            ? {
                missingFields,
                followUpRequired: true,
                followUpTool: TOOL_NAMES.UPDATE_SKILL,
                warning: missingFieldsNotice,
            }
            : {}),
    };
}

async function deleteSkillTool(args = {}, options = {}) {
    const byId = String(args.id || '').trim();
    const byFilename = normalizeSkillFileName(args.filename || '');
    if (!byId && !byFilename) {
        return {
            ok: false,
            error: 'skill_identifier_required',
            message: '必须提供 id 或 filename 其中之一。',
        };
    }

    const catalogResult = await readSkillsCatalogData(options);
    if (!catalogResult.ok) {
        return {
            ok: false,
            error: catalogResult.error,
            message: `Skills.json 解析失败：${catalogResult.message}`,
        };
    }

    const skill = byId
        ? catalogResult.catalog.skills.find((item) => item.id === byId)
        : catalogResult.catalog.skills.find((item) => item.filename === byFilename);

    if (!skill) {
        return {
            ok: false,
            error: 'skill_not_found',
            message: byId ? `目录里找不到 id 为 ${byId} 的 skill。` : `目录里找不到文件 ${byFilename} 对应的 skill。`,
        };
    }

    const deleteResult = await deleteUserFile(skill.filename, options);
    const nextCatalog = normalizeSkillsCatalog({
        ...catalogResult.catalog,
        skills: catalogResult.catalog.skills.filter((item) => item.id !== skill.id),
    });
    await writeSkillsCatalogData(nextCatalog, options);

    return {
        ok: true,
        id: skill.id,
        title: skill.title,
        filename: skill.filename,
        fileDeleted: deleteResult.deleted === true,
        note: deleteResult.deleted === true
            ? '技能正文文件和 Skills.json 已删除，当前会话技能目录会立即刷新。'
            : '技能目录项已删除；原 skill 文件本就不存在，当前会话技能目录会立即刷新。',
    };
}

async function readSkillsRuntimeData(options = {}) {
    const catalogResult = await readSkillsCatalogData(options);
    if (!catalogResult.ok) {
        return {
            skillsCatalog: normalizeSkillsCatalog(EMPTY_SKILLS_CATALOG),
            skillsPromptSummary: '',
            skillsCatalogError: catalogResult.message,
        };
    }
    return {
        skillsCatalog: catalogResult.catalog,
        skillsPromptSummary: catalogResult.summaryText,
        skillsCatalogError: '',
    };
}

async function readIdentityNote(_args = {}, options = {}) {
    return readUserFile(DEFAULT_IDENTITY_FILE, options);
}

async function writeIdentityNote(args = {}, options = {}) {
    const content = String(args.content || '');
    return writeUserFile(DEFAULT_IDENTITY_FILE, content, options);
}

async function writeWorkspaceNote(args = {}, options = {}) {
    const settings = getAssistantSettings();
    const name = normalizeWorkspaceName(args.name || settings.workspaceFileName || DEFAULT_WORKSPACE_FILE);
    const content = String(args.content || '');
    return writeUserFile(name, content, options);
}

async function readWorkspaceNote(_args = {}, options = {}) {
    const settings = getAssistantSettings();
    const name = normalizeWorkspaceName(settings.workspaceFileName || DEFAULT_WORKSPACE_FILE);
    return readUserFile(name, options);
}

async function runSlashCommand(args = {}, options = {}) {
    ensureNotAborted(options.signal);

    let command = String(args.command || '').trim();
    if (!command) {
        return {
            ok: false,
            command: '',
            error: 'slash_command_required',
            note: '必须提供要执行的斜杠命令。',
        };
    }

    if (!command.startsWith('/')) {
        command = `/${command}`;
    }

    try {
        const result = await executeSlashCommand(command);
        ensureNotAborted(options.signal);
        const normalizedError = result && typeof result === 'object'
            ? (result.ok === false
                ? String(result.error || result.message || 'slash_command_failed')
                : (result.error ? String(result.error) : ''))
            : '';

        if (normalizedError) {
            return {
                ok: false,
                command,
                error: normalizedError,
                result,
            };
        }

        return {
            ok: true,
            command,
            result,
        };
    } catch (error) {
        ensureNotAborted(options.signal);
        return {
            ok: false,
            command,
            error: error instanceof Error ? error.message : String(error || 'unknown_error'),
            raw: error instanceof Error ? (error.stack || error.message) : String(error || 'unknown_error'),
        };
    }
}

async function executeToolCall(name, args, options = {}) {
    switch (name) {
        case TOOL_NAMES.LS:
            return await listDirectory(args, options);
        case TOOL_NAMES.GLOB:
            return await globFiles(args, options);
        case TOOL_NAMES.GREP:
            return await grepFiles(args, options);
        case TOOL_NAMES.READ:
            return await readFile(args, options);
        case TOOL_NAMES.RUN_SLASH_COMMAND:
            return await runSlashCommand(args, options);
        case TOOL_NAMES.READ_IDENTITY:
            return await readIdentityNote(args, options);
        case TOOL_NAMES.WRITE_IDENTITY:
            return await writeIdentityNote(args, options);
        case TOOL_NAMES.READ_WORKLOG:
            return await readWorkspaceNote(args, options);
        case TOOL_NAMES.WRITE_WORKLOG:
            return await writeWorkspaceNote(args, options);
        case TOOL_NAMES.READ_SKILLS_CATALOG:
            return await readSkillsCatalogTool(args, options);
        case TOOL_NAMES.READ_SKILL:
            return await readSkillTool(args, options);
        case TOOL_NAMES.UPDATE_SKILL:
            return await updateSkillTool(args, options);
        case TOOL_NAMES.GENERATE_SKILL:
            return await generateSkillTool(args, options);
        case TOOL_NAMES.DELETE_SKILL:
            return await deleteSkillTool(args, options);
        default:
            throw new Error(`unsupported_tool:${name}`);
    }
}

function openAssistant() {
    if (document.getElementById(OVERLAY_ID)) return;
    ensureMinimizedAssistantStyles();

    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: ${window.innerHeight}px;
        padding: 0;
        box-sizing: border-box;
        z-index: 99999;
        overflow: hidden;
        pointer-events: none;
    `;

    const updateOverlayHeight = () => {
        if (overlay && overlay.style.display !== 'none') {
            if (isAssistantMobileDevice()) {
                const topOffset = getAssistantMobileTopOffset();
                const viewportHeight = getAssistantMobileViewportHeight();
                overlay.style.top = `${topOffset}px`;
                overlay.style.height = `${viewportHeight}px`;
                shell.style.height = `${viewportHeight}px`;
                shell.style.maxHeight = `${viewportHeight}px`;
                shell.style.minHeight = `${viewportHeight}px`;
            } else {
                overlay.style.top = '0';
                overlay.style.height = `${window.innerHeight}px`;
                if (quickLayoutMode !== QUICK_LAYOUT_MODE.FREE) {
                    applyQuickLayout(quickLayoutMode);
                } else {
                    applyShellBounds(shellMetrics.width || shell.getBoundingClientRect().width, shellMetrics.height || shell.getBoundingClientRect().height);
                }
            }
        }
    };

    const shell = document.createElement('div');
    shell.style.cssText = `
        position: absolute;
        width: min(1200px, calc(100vw - 200px));
        height: min(800px, calc(100vh - 200px));
        max-width: calc(100vw - 96px);
        max-height: calc(100vh - 96px);
        min-width: 320px;
        min-height: 400px;
        overflow: hidden;
        border-radius: 22px;
        box-shadow: 0 28px 80px rgba(6, 17, 32, 0.22);
        border: 1px solid rgba(255, 255, 255, 0.55);
        background: rgba(238, 243, 248, 0.96);
        pointer-events: auto;
    `;

    const titleBar = document.createElement('div');
    titleBar.setAttribute('aria-label', '拖动小白助手窗口');
    titleBar.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 52px;
        display: flex;
        align-items: center;
        padding: 0 16px 0 18px;
        box-sizing: border-box;
        background: linear-gradient(180deg, rgba(248, 250, 253, 0.96), rgba(238, 243, 248, 0.88));
        border-bottom: 1px solid rgba(27, 55, 88, 0.12);
        cursor: move;
        user-select: none;
        touch-action: none;
        z-index: 2;
    `;

    const titleText = document.createElement('div');
    titleText.textContent = '小白助手';
    titleText.style.cssText = `
        color: #142033;
        font: 700 14px/1.2 "Microsoft YaHei", sans-serif;
        letter-spacing: 0.02em;
    `;
    titleBar.appendChild(titleText);

    const minimizedIcon = document.createElement('button');
    minimizedIcon.type = 'button';
    minimizedIcon.className = 'xb-assistant-minimized-icon';
    minimizedIcon.setAttribute('aria-label', '恢复小白助手');
    minimizedIcon.title = '唤醒小白助手';
    minimizedIcon.innerHTML = `
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <g class="xb-bot-group">
                <path class="xb-flame" d="M10 18 L12 23 L14 18 Z" fill="#38bdf8" />
                <path d="M6.5 13 C6.5 17 8 19 12 19 C16 19 17.5 17 17.5 13 Z" fill="#94a3b8"/>
                <path d="M6 12 C6 17 7.5 18 12 18 C16.5 18 18 17 18 12 Z" fill="#f8fafc"/>
                <rect class="xb-arm-left" x="3" y="10" width="3.5" height="7" rx="1.75" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.5"/>
                <rect x="17.5" y="10" width="3.5" height="7" rx="1.75" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.5"/>
                <rect x="4" y="4" width="16" height="11" rx="3.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.5"/>
                <rect x="5.5" y="5.5" width="13" height="7" rx="2" fill="#0f172a"/>
                <g class="xb-eyes-normal">
                    <circle cx="9" cy="9" r="1.5" fill="#38bdf8"/>
                    <circle cx="15" cy="9" r="1.5" fill="#38bdf8"/>
                </g>
                <g class="xb-eyes-happy">
                    <path d="M7.5 9.5 Q9 7 10.5 9.5" stroke="#38bdf8" stroke-width="1.2" stroke-linecap="round" fill="none"/>
                    <path d="M13.5 9.5 Q15 7 16.5 9.5" stroke="#38bdf8" stroke-width="1.2" stroke-linecap="round" fill="none"/>
                </g>
                <line x1="12" y1="4" x2="12" y2="1.5" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round"/>
                <circle class="xb-antenna-bulb" cx="12" cy="1" r="1.5" fill="#facc15"/>
            </g>
            <g class="xb-zzz-group">
                <text x="17" y="5" font-family="Arial" font-size="4" font-weight="bold" fill="#94a3b8" class="xb-zz1">z</text>
                <text x="19" y="3" font-family="Arial" font-size="5" font-weight="bold" fill="#cbd5e1" class="xb-zz2">Z</text>
            </g>
        </svg>
    `;
    titleBar.appendChild(minimizedIcon);

    const titleActions = document.createElement('div');
    titleActions.style.cssText = `
        position: absolute;
        top: 8px;
        right: 14px;
        z-index: 3;
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    const createTitleActionButton = (label, title) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.setAttribute('aria-label', title);
        button.title = title;
        button.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            padding: 0;
            border: 1px solid rgba(20, 32, 51, 0.12);
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.76);
            color: #203249;
            cursor: pointer;
            font: 700 16px/1 "Segoe UI Symbol", "Noto Sans Symbols 2", "Microsoft YaHei", sans-serif;
            box-shadow: 0 8px 18px rgba(17, 31, 51, 0.10);
            transition: background 0.16s ease, color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
        `;
        button.addEventListener('mouseenter', () => {
            if (button.getAttribute('data-active') === 'true') return;
            button.style.transform = 'translateY(-1px)';
            button.style.boxShadow = '0 12px 24px rgba(17, 31, 51, 0.14)';
        });
        button.addEventListener('mouseleave', () => {
            if (button.getAttribute('data-active') === 'true') return;
            button.style.transform = '';
            button.style.boxShadow = '0 8px 18px rgba(17, 31, 51, 0.10)';
        });
        return button;
    };

    const minimizeButton = createTitleActionButton('─', '最小化');
    const sidebarLayoutButton = createTitleActionButton('⊟', '侧边栏布局');
    const fullscreenButton = createTitleActionButton('⛶', '全屏布局');
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '关闭';
    closeButton.setAttribute('aria-label', '关闭小白助手');
    closeButton.style.cssText = `
        position: static;
        border: none;
        border-radius: 999px;
        padding: 10px 14px;
        background: rgba(20, 32, 51, 0.88);
        color: #fff;
        cursor: pointer;
        font: 600 13px/1 "Microsoft YaHei", sans-serif;
        box-shadow: 0 10px 24px rgba(6, 17, 32, 0.22);
    `;
    closeButton.addEventListener('click', () => closeAssistant());
    titleActions.append(minimizeButton, sidebarLayoutButton, fullscreenButton, closeButton);

    const resizeHint = document.createElement('div');
    resizeHint.setAttribute('aria-hidden', 'true');
    resizeHint.title = '可拖动右下角调整大小';
    resizeHint.style.cssText = `
        position: absolute;
        right: 0;
        bottom: 0;
        width: 32px;
        height: 32px;
        z-index: 2;
        border-radius: 0 0 22px 0;
        cursor: nwse-resize;
        touch-action: none;
        background:
            linear-gradient(135deg, transparent 46%, rgba(27, 55, 88, 0.18) 46%, rgba(27, 55, 88, 0.18) 56%, transparent 56%),
            linear-gradient(135deg, transparent 62%, rgba(27, 55, 88, 0.28) 62%, rgba(27, 55, 88, 0.28) 72%, transparent 72%),
            linear-gradient(135deg, transparent 78%, rgba(27, 55, 88, 0.42) 78%);
    `;

    const iframe = document.createElement('iframe');
    iframe.src = HTML_PATH;
    iframe.style.cssText = `
        position: absolute;
        top: 52px;
        left: 0;
        display: block;
        width: 100%;
        height: calc(100% - 52px);
        border: none;
        border-radius: 0 0 22px 22px;
        background: #eef3f8;
    `;

    const resizeMask = document.createElement('div');
    resizeMask.setAttribute('aria-hidden', 'true');
    resizeMask.style.cssText = `
        position: absolute;
        top: 52px;
        left: 0;
        width: 100%;
        height: calc(100% - 52px);
        display: none;
        pointer-events: none;
        border-radius: 0 0 22px 22px;
        background:
            linear-gradient(180deg, rgba(248, 250, 253, 0.9), rgba(238, 243, 248, 0.9)),
            repeating-linear-gradient(
                -45deg,
                rgba(27, 55, 88, 0.04) 0 12px,
                rgba(27, 55, 88, 0.08) 12px 24px
            );
    `;

    shell.append(titleBar, titleActions, resizeHint, iframe, resizeMask);
    overlay.appendChild(shell);
    document.body.appendChild(overlay);

    let shellMetrics = {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
    };
    const QUICK_LAYOUT_MODE = Object.freeze({
        FREE: 'free',
        MINIMIZED: 'minimized',
        FULLSCREEN: 'fullscreen',
        SIDEBAR: 'sidebar',
    });
    let quickLayoutMode = QUICK_LAYOUT_MODE.FREE;
    let minimizedRestoreSnapshot = null;
    let layoutFrame = 0;
    let pendingLayout = null;

    const clampShellPosition = (left, top, width = shellMetrics.width, height = shellMetrics.height) => {
        const maxLeft = Math.max(0, window.innerWidth - width);
        const maxTop = Math.max(0, window.innerHeight - height);
        return {
            left: Math.max(0, Math.min(left, maxLeft)),
            top: Math.max(0, Math.min(top, maxTop)),
        };
    };

    const flushShellLayout = () => {
        layoutFrame = 0;
        if (!pendingLayout) return;
        const next = {
            width: pendingLayout.width ?? shellMetrics.width,
            height: pendingLayout.height ?? shellMetrics.height,
            left: pendingLayout.left ?? shellMetrics.left,
            top: pendingLayout.top ?? shellMetrics.top,
        };
        shellMetrics = next;
        shell.style.width = `${next.width}px`;
        shell.style.height = `${next.height}px`;
        shell.style.left = `${next.left}px`;
        shell.style.top = `${next.top}px`;
        pendingLayout = null;
    };

    const scheduleShellLayout = (patch) => {
        pendingLayout = {
            ...(pendingLayout || {}),
            ...patch,
        };
        if (!layoutFrame) {
            layoutFrame = requestAnimationFrame(flushShellLayout);
        }
    };

    const centerShell = () => {
        const width = shell.getBoundingClientRect().width;
        const height = shell.getBoundingClientRect().height;
        const nextLeft = Math.max(0, Math.round((window.innerWidth - width) / 2));
        const nextTop = Math.max(0, Math.round((window.innerHeight - height) / 2));
        shellMetrics = {
            width,
            height,
            left: nextLeft,
            top: nextTop,
        };
        shell.style.left = `${nextLeft}px`;
        shell.style.top = `${nextTop}px`;
    };

    const applyShellChrome = () => {
        shell.style.background = 'rgba(238, 243, 248, 0.96)';
        shell.style.overflow = 'hidden';
        titleBar.style.height = '52px';
        titleBar.style.padding = '0 16px 0 18px';
        titleBar.style.justifyContent = 'flex-start';
        titleBar.style.background = 'linear-gradient(180deg, rgba(248, 250, 253, 0.96), rgba(238, 243, 248, 0.88))';
        titleBar.style.borderBottom = '1px solid rgba(27, 55, 88, 0.12)';
        titleBar.style.cursor = 'move';
        titleBar.style.pointerEvents = 'auto';
        titleText.style.color = '#142033';
        titleText.style.font = '700 14px/1.2 "Microsoft YaHei", sans-serif';
        titleText.style.display = 'block';
        iframe.style.display = 'block';
        iframe.style.top = '52px';
        iframe.style.height = 'calc(100% - 52px)';
        titleActions.style.display = 'flex';
        minimizedIcon.classList.remove('is-visible');
        resizeHint.style.display = '';
        resizeMask.style.top = '52px';
        resizeMask.style.height = 'calc(100% - 52px)';
        if (quickLayoutMode === QUICK_LAYOUT_MODE.FULLSCREEN) {
            shell.style.borderRadius = '0';
            shell.style.border = 'none';
            shell.style.boxShadow = 'none';
            iframe.style.borderRadius = '0';
            resizeMask.style.borderRadius = '0';
            resizeHint.style.borderRadius = '0';
            return;
        }
        if (quickLayoutMode === QUICK_LAYOUT_MODE.MINIMIZED) {
            shell.style.borderRadius = '0';
            shell.style.border = 'none';
            shell.style.boxShadow = 'none';
            shell.style.background = 'transparent';
            shell.style.overflow = 'visible';
            titleBar.style.height = '100%';
            titleBar.style.padding = '0';
            titleBar.style.justifyContent = 'center';
            titleBar.style.background = 'transparent';
            titleBar.style.borderBottom = 'none';
            titleBar.style.cursor = 'default';
            titleBar.style.pointerEvents = 'none';
            titleText.style.display = 'none';
            iframe.style.display = 'none';
            titleActions.style.display = 'none';
            minimizedIcon.classList.add('is-visible');
            resizeHint.style.display = 'none';
            resizeMask.style.display = 'none';
            return;
        }
        if (quickLayoutMode === QUICK_LAYOUT_MODE.SIDEBAR) {
            shell.style.borderRadius = '0 22px 22px 0';
            shell.style.border = '1px solid rgba(255, 255, 255, 0.55)';
            shell.style.boxShadow = '0 28px 80px rgba(6, 17, 32, 0.22)';
            iframe.style.borderRadius = '0 0 22px 0';
            resizeMask.style.borderRadius = '0 0 22px 0';
            resizeHint.style.borderRadius = '0 0 22px 0';
            return;
        }
        shell.style.borderRadius = '22px';
        shell.style.border = '1px solid rgba(255, 255, 255, 0.55)';
        shell.style.boxShadow = '0 28px 80px rgba(6, 17, 32, 0.22)';
        iframe.style.borderRadius = '0 0 22px 22px';
        resizeMask.style.borderRadius = '0 0 22px 22px';
        resizeHint.style.borderRadius = '0 0 22px 0';
    };

    const updateQuickLayoutButtons = () => {
        const setButtonState = (button, active) => {
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
            button.setAttribute('data-active', active ? 'true' : 'false');
            button.style.background = active ? 'rgba(20, 32, 51, 0.88)' : 'rgba(255, 255, 255, 0.76)';
            button.style.color = active ? '#fff' : '#203249';
            button.style.boxShadow = active
                ? '0 10px 24px rgba(6, 17, 32, 0.22)'
                : '0 8px 18px rgba(17, 31, 51, 0.10)';
            button.style.transform = '';
        };
        setButtonState(minimizeButton, quickLayoutMode === QUICK_LAYOUT_MODE.MINIMIZED);
        setButtonState(fullscreenButton, quickLayoutMode === QUICK_LAYOUT_MODE.FULLSCREEN);
        setButtonState(sidebarLayoutButton, quickLayoutMode === QUICK_LAYOUT_MODE.SIDEBAR);
    };

    const getShellSnapshot = (mode = quickLayoutMode) => {
        const rect = shell.getBoundingClientRect();
        return {
            mode,
            width: pendingLayout?.width ?? shellMetrics.width ?? rect.width,
            height: pendingLayout?.height ?? shellMetrics.height ?? rect.height,
            left: pendingLayout?.left ?? shellMetrics.left ?? rect.left,
            top: pendingLayout?.top ?? shellMetrics.top ?? rect.top,
        };
    };

    const getMinimizedLayout = () => {
        const width = 36;
        const height = 36;
        const anchor = document.querySelector('.fa-solid.fa-bars.interactable');
        const anchorRect = anchor?.getBoundingClientRect?.();
        if (anchorRect) {
            const left = Math.max(
                8,
                Math.min(
                    Math.round(anchorRect.left + ((anchorRect.width - width) / 2)),
                    window.innerWidth - width - 8,
                ),
            );
            const top = Math.max(8, Math.round(anchorRect.top - height));
            return { width, height, left, top };
        }
        return {
            width,
            height,
            left: 12,
            top: Math.max(8, window.innerHeight - height - 72),
        };
    };

    const getSidebarLayoutWidth = () => {
        const viewportWidth = window.innerWidth;
        const chatRect = document.querySelector('#chat')?.getBoundingClientRect?.();
        const chatLeft = Number.isFinite(chatRect?.left) ? chatRect.left : 0;
        if (chatLeft > 320) {
            return Math.min(viewportWidth, Math.round(chatLeft));
        }
        return Math.max(360, Math.round(viewportWidth * 0.42));
    };

    const applyQuickLayout = (mode) => {
        quickLayoutMode = mode;
        applyShellChrome();
        updateQuickLayoutButtons();
        if (mode === QUICK_LAYOUT_MODE.FULLSCREEN) {
            applyShellBounds(window.innerWidth, window.innerHeight, { left: 0, top: 0 });
            return;
        }
        if (mode === QUICK_LAYOUT_MODE.SIDEBAR) {
            applyShellBounds(getSidebarLayoutWidth(), window.innerHeight, { left: 0, top: 0 });
            return;
        }
        if (mode === QUICK_LAYOUT_MODE.MINIMIZED) {
            const minimizedLayout = getMinimizedLayout();
            applyShellBounds(minimizedLayout.width, minimizedLayout.height, minimizedLayout);
        }
    };

    const exitQuickLayout = () => {
        if (quickLayoutMode === QUICK_LAYOUT_MODE.FREE) return;
        quickLayoutMode = QUICK_LAYOUT_MODE.FREE;
        applyShellChrome();
        updateQuickLayoutButtons();
    };

    const applyShellBounds = (width, height, position = null) => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const maxWidth = Math.max(320, viewportWidth);
        const maxHeight = Math.max(240, viewportHeight);
        const minWidth = quickLayoutMode === QUICK_LAYOUT_MODE.MINIMIZED ? 36 : 220;
        const minHeight = quickLayoutMode === QUICK_LAYOUT_MODE.MINIMIZED ? 36 : 140;
        const nextWidth = Math.max(minWidth, Math.min(width, maxWidth));
        const nextHeight = Math.max(minHeight, Math.min(height, maxHeight));
        shell.style.maxWidth = 'none';
        shell.style.maxHeight = 'none';
        shell.style.minWidth = '0';
        shell.style.minHeight = '0';
        const currentLeft = position?.left ?? pendingLayout?.left ?? shellMetrics.left;
        const currentTop = position?.top ?? pendingLayout?.top ?? shellMetrics.top;
        const clamped = clampShellPosition(currentLeft, currentTop, nextWidth, nextHeight);
        scheduleShellLayout({
            width: nextWidth,
            height: nextHeight,
            left: clamped.left,
            top: clamped.top,
        });
    };

    centerShell();
    applyShellChrome();
    updateQuickLayoutButtons();

    let dragState = null;
    let resizeState = null;
    const setResizePreviewActive = (active) => {
        iframe.style.visibility = active ? 'hidden' : '';
        iframe.style.pointerEvents = active ? 'none' : '';
        resizeMask.style.display = active ? 'block' : 'none';
    };
    const stopDrag = () => {
        dragState = null;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        shell.style.willChange = '';  // 清除 will-change
        window.removeEventListener('pointermove', onDragPointerMove);
        window.removeEventListener('pointerup', stopDrag);
        window.removeEventListener('pointercancel', stopDrag);
    };
    const onDragPointerMove = (event) => {
        if (!dragState) return;
        event.preventDefault();
        const nextLeft = dragState.startLeft + (event.clientX - dragState.startX);
        const nextTop = dragState.startTop + (event.clientY - dragState.startY);
        const clamped = clampShellPosition(nextLeft, nextTop, shellMetrics.width, shellMetrics.height);
        scheduleShellLayout({ left: clamped.left, top: clamped.top });
    };
    const stopResize = () => {
        if (layoutFrame) {
            cancelAnimationFrame(layoutFrame);
            flushShellLayout();
        }
        resizeState = null;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        shell.style.willChange = '';  // 清除 will-change
        setResizePreviewActive(false);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', stopResize);
        window.removeEventListener('pointercancel', stopResize);
    };
    const onPointerMove = (event) => {
        if (!resizeState) return;
        event.preventDefault();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const deltaX = event.clientX - resizeState.startX;
        const deltaY = event.clientY - resizeState.startY;
        let nextWidth = resizeState.startWidth + deltaX;
        let nextHeight = resizeState.startHeight + deltaY;
        let nextLeft = resizeState.startLeft;
        let nextTop = resizeState.startTop;

        // 鼠标碰到右/下边缘后，继续利用左/上的空白把窗口放大到贴边，
        // 避免桌面端“明明还能更大，但拖不下去”的观感。
        if (deltaX > 0 && event.clientX >= (viewportWidth - 2)) {
            const extraWidth = Math.min(
                resizeState.startLeft,
                Math.max(0, viewportWidth - nextWidth),
            );
            nextWidth += extraWidth;
            nextLeft -= extraWidth;
        }
        if (deltaY > 0 && event.clientY >= (viewportHeight - 2)) {
            const extraHeight = Math.min(
                resizeState.startTop,
                Math.max(0, viewportHeight - nextHeight),
            );
            nextHeight += extraHeight;
            nextTop -= extraHeight;
        }

        applyShellBounds(nextWidth, nextHeight, {
            left: nextLeft,
            top: nextTop,
        });
    };
    titleBar.addEventListener('pointerdown', (event) => {
        if (isAssistantMobileDevice()) return;
        if (event.target.closest('button')) return;
        if (quickLayoutMode === QUICK_LAYOUT_MODE.MINIMIZED) return;
        event.preventDefault();
        exitQuickLayout();
        const rect = shell.getBoundingClientRect();
        dragState = {
            startX: event.clientX,
            startY: event.clientY,
            startLeft: shellMetrics.left || rect.left,
            startTop: shellMetrics.top || rect.top,
        };
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'move';
        shell.style.willChange = 'left, top';  // 提示浏览器优化
        window.addEventListener('pointermove', onDragPointerMove);
        window.addEventListener('pointerup', stopDrag);
        window.addEventListener('pointercancel', stopDrag);
    });
    resizeHint.addEventListener('pointerdown', (event) => {
        if (isAssistantMobileDevice()) return;
        event.preventDefault();
        event.stopPropagation();
        exitQuickLayout();
        resizeState = {
            startX: event.clientX,
            startY: event.clientY,
            startWidth: shellMetrics.width || shell.getBoundingClientRect().width,
            startHeight: shellMetrics.height || shell.getBoundingClientRect().height,
            startLeft: shellMetrics.left || shell.getBoundingClientRect().left,
            startTop: shellMetrics.top || shell.getBoundingClientRect().top,
        };
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'nwse-resize';
        shell.style.willChange = 'width, height, left, top';  // 提示浏览器优化
        setResizePreviewActive(true);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', stopResize);
        window.addEventListener('pointercancel', stopResize);
    });

    minimizedIcon.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (quickLayoutMode !== QUICK_LAYOUT_MODE.MINIMIZED) return;
        if (minimizedRestoreSnapshot?.mode && minimizedRestoreSnapshot.mode !== QUICK_LAYOUT_MODE.FREE) {
            applyQuickLayout(minimizedRestoreSnapshot.mode);
            return;
        }
        quickLayoutMode = QUICK_LAYOUT_MODE.FREE;
        applyShellChrome();
        updateQuickLayoutButtons();
        applyShellBounds(
            minimizedRestoreSnapshot?.width || 980,
            minimizedRestoreSnapshot?.height || 720,
            {
                left: minimizedRestoreSnapshot?.left ?? Math.max(0, Math.round((window.innerWidth - 980) / 2)),
                top: minimizedRestoreSnapshot?.top ?? Math.max(0, Math.round((window.innerHeight - 720) / 2)),
            },
        );
    });

    minimizeButton.addEventListener('click', () => {
        if (isAssistantMobileDevice()) return;
        minimizedRestoreSnapshot = getShellSnapshot(quickLayoutMode);
        applyQuickLayout(QUICK_LAYOUT_MODE.MINIMIZED);
    });
    fullscreenButton.addEventListener('click', () => {
        if (isAssistantMobileDevice()) return;
        applyQuickLayout(QUICK_LAYOUT_MODE.FULLSCREEN);
    });
    sidebarLayoutButton.addEventListener('click', () => {
        if (isAssistantMobileDevice()) return;
        applyQuickLayout(QUICK_LAYOUT_MODE.SIDEBAR);
    });

    window.addEventListener('resize', updateOverlayHeight);
    window.visualViewport?.addEventListener('resize', updateOverlayHeight);
    overlay._cleanup = () => {
        stopDrag();
        stopResize();
        if (layoutFrame) {
            cancelAnimationFrame(layoutFrame);
            layoutFrame = 0;
            pendingLayout = null;
        }
        window.removeEventListener('resize', updateOverlayHeight);
        window.visualViewport?.removeEventListener('resize', updateOverlayHeight);
    };

    if (isAssistantMobileDevice()) {
        const topOffset = getAssistantMobileTopOffset();
        const viewportHeight = getAssistantMobileViewportHeight();
        overlay.style.padding = '0';
        overlay.style.top = `${topOffset}px`;
        overlay.style.height = `${viewportHeight}px`;
        titleBar.style.height = '56px';
        titleBar.style.padding = '0 16px';
        titleBar.style.cursor = 'default';
        titleBar.style.display = 'none';
        titleActions.style.display = 'none';
        shell.style.width = '100%';
        shell.style.height = `${viewportHeight}px`;
        shell.style.maxWidth = '100%';
        shell.style.maxHeight = `${viewportHeight}px`;
        shell.style.minWidth = '100%';
        shell.style.minHeight = `${viewportHeight}px`;
        shell.style.left = '0';
        shell.style.top = '0';
        shell.style.borderRadius = '0';
        shell.style.border = 'none';
        shell.style.boxShadow = 'none';
        shell.style.background = 'rgba(238, 243, 248, 0.98)';
        closeButton.style.display = 'none';
        resizeHint.style.display = 'none';
        iframe.style.top = '0';
        iframe.style.height = '100%';
        iframe.style.borderRadius = '0';
        resizeMask.style.top = '0';
        resizeMask.style.height = '100%';
        resizeMask.style.borderRadius = '0';
    }

    // Guarded inside handleIframeMessage via isTrustedIframeEvent.
    // eslint-disable-next-line no-restricted-syntax
    window.addEventListener('message', handleIframeMessage);
}

function closeAssistant() {
    window.removeEventListener('message', handleIframeMessage);
    const overlayEl = document.getElementById(OVERLAY_ID);
    if (overlayEl) {
        overlayEl._cleanup?.();
        overlayEl.remove();
    }
    overlay = null;
}

async function handleIframeMessage(event) {
    const iframe = overlay?.querySelector('iframe');
    if (!isTrustedIframeEvent(event, iframe)) return;
    if (!event.data?.type?.startsWith('xb-assistant:')) return;

    const { type, payload } = event.data;

    switch (type) {
        case 'xb-assistant:ready': {
            await loadAssistantSettings();
            const config = buildRuntimeConfig();
            postToIframe(iframe, {
                type: 'xb-assistant:config',
                payload: {
                    config,
                    runtime: await buildAssistantRuntimePayload(),
                },
            });
            break;
        }
        case 'xb-assistant:close':
            closeAssistant();
            break;
        case 'xb-assistant:save-config': {
            const patch = payload && typeof payload === 'object' ? payload : {};
            const requestId = String(patch.requestId || '');
            const current = getAssistantSettings();
            const next = normalizeAssistantSettings({
                ...current,
                workspaceFileName: normalizeWorkspaceName(patch.workspaceFileName || current.workspaceFileName),
                currentPresetName: normalizePresetName(patch.currentPresetName || current.currentPresetName),
                presets: patch.presets && typeof patch.presets === 'object'
                    ? patch.presets
                    : current.presets,
            }, {
                defaultWorkspaceFileName: DEFAULT_WORKSPACE_FILE,
                normalizeWorkspaceName,
            });

            const result = await persistAssistantSettings(next, { silent: false });
            if (result.ok) {
                postToIframe(iframe, {
                    type: CONFIG_SAVED,
                    payload: {
                        requestId,
                        config: buildRuntimeConfig(),
                    },
                });
            } else {
                postToIframe(iframe, {
                    type: CONFIG_SAVE_ERROR,
                    payload: {
                        requestId,
                        error: result.error || '保存失败',
                        config: buildRuntimeConfig(),
                    },
                });
            }
            break;
        }
        case 'xb-assistant:tool-call': {
            const requestId = payload?.requestId || '';
            const toolName = payload?.name || '';
            const args = payload?.arguments || {};
            const controller = new AbortController();
            activeToolControllers.set(requestId, controller);
            try {
                let result = await executeToolCall(toolName, args, { signal: controller.signal });
                if (toolName === TOOL_NAMES.WRITE_IDENTITY) {
                    const identityFile = await readIdentityNote({}, { signal: controller.signal });
                    result = {
                        ...result,
                        hotUpdated: true,
                    };
                    postToIframe(iframe, {
                        type: 'xb-assistant:identity-updated',
                        payload: {
                            identityContent: String(identityFile.content || '').trim() || DEFAULT_IDENTITY_CONTENT,
                        },
                    });
                }
                if ((toolName === TOOL_NAMES.GENERATE_SKILL && result?.ok && result.action === 'save')
                    || (toolName === TOOL_NAMES.UPDATE_SKILL && result?.ok)
                    || (toolName === TOOL_NAMES.DELETE_SKILL && result?.ok)) {
                    postToIframe(iframe, {
                        type: SKILLS_UPDATED,
                        payload: await readSkillsRuntimeData({ signal: controller.signal }),
                    });
                }
                postToIframe(iframe, {
                    type: TOOL_RESULT,
                    payload: { requestId, name: toolName, result },
                });
            } catch (error) {
                postToIframe(iframe, {
                    type: TOOL_ERROR,
                    payload: {
                        requestId,
                        name: toolName,
                        error: error instanceof Error ? error.message : String(error || 'unknown_error'),
                    },
                });
            } finally {
                activeToolControllers.delete(requestId);
            }
            break;
        }
        case 'xb-assistant:tool-abort': {
            const requestId = payload?.requestId || '';
            activeToolControllers.get(requestId)?.abort();
            break;
        }
        default:
            break;
    }
}

export async function initAssistant() {
    await loadAssistantSettings();
    window.xiaobaixAssistant = {
        openSettings: openAssistant,
        closeSettings: closeAssistant,
        getSettings: () => ({ ...getAssistantSettings() }),
    };
}

export function cleanupAssistant() {
    closeAssistant();
    delete window.xiaobaixAssistant;
}
