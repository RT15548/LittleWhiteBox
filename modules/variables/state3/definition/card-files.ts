import type { Bundle } from '../types.js';
export interface CardFile { path: string; content: string; originalContent?: string | null; originalGroupHash?: string }
import { CARD_EXTENSION, DEFINITION_FILE, FUNCTION_DIRECTORY, TOOL_DIRECTORY, SCRIPT_DIRECTORY, SCRIPT_PHASES } from './format.js';
import { digest } from './digest.js';

const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const json = (value: unknown) => JSON.stringify(value, null, 2);
export const CARD_FILES_COPY = Object.freeze({
    invalid: '变量定义需要是 JSON 对象，函数文件需要是文本。未写回角色卡。',
    missing: '请先在工作区创建 variables/definition.json。',
    conflict: '变量定义包已在酒馆中改变，未覆盖。请重新读取定义及函数文件后再修改。',
    invalidRules: '规则检查未通过，未写回角色卡。',
});

export function locateVariableFile(relative: string) {
    if (relative === DEFINITION_FILE) {return { kind: 'variables', settings: true as const };}
    for (const [collection, directory] of [['functions', FUNCTION_DIRECTORY], ['tools', TOOL_DIRECTORY], ['scripts', SCRIPT_DIRECTORY]] as const) {
        if (!relative.startsWith(directory)) {continue;}
        const match = relative.slice(directory.length).match(/^([a-zA-Z0-9_-]+)\.js$/);
        if (!match || collection === 'scripts' && !SCRIPT_PHASES.includes(match[1] as typeof SCRIPT_PHASES[number])) {return null;}
        return { kind: 'variables', settings: false as const, name: match[1], collection };
    }
    return null;
}

export function variableFileGroup<T extends { root: string; kind: string }>(root: string, files: CardFile[], locate: (path: string) => T | null) {
    return files.flatMap(file => {
        const target = locate(file.path);
        return target?.kind === 'variables' && target.root === root ? [{ target, file }] : [];
    });
}

export function variableGroupChanged(root: string, saved: { file: CardFile }[], files: CardFile[]) {
    const current = files.filter(file => file.path.startsWith(root) && locateVariableFile(file.path.slice(root.length)));
    return current.length !== saved.length || current.some(file => !saved.some(item => item.file.path === file.path && item.file.content === file.content));
}

function assertBundle(bundle: unknown): Bundle {
    if (!object(bundle) || !object(bundle.definition) || !object(bundle.functions)
        || Object.entries(bundle.functions).some(([name, source]) => !/^[a-zA-Z0-9_-]+$/.test(name) || typeof source !== 'string')) {
        throw new Error(CARD_FILES_COPY.invalid);
    }
    for (const key of ['tools', 'scripts']) {
        if (bundle[key] !== undefined && (!object(bundle[key]) || Object.values(bundle[key]).some(source => typeof source !== 'string'))) {throw new Error(CARD_FILES_COPY.invalid);}
    }
    return bundle as unknown as Bundle;
}

export function projectVariableFiles(root: string, stored: unknown): CardFile[] {
    if (stored === null || stored === undefined) {return [];}
    const bundle = decodeBundle(stored);
    return [{ path: root + DEFINITION_FILE, content: json(bundle.definition), originalGroupHash: digest(bundle) },
        ...Object.entries(bundle.functions).map(([name, content]) => ({ path: `${root}${FUNCTION_DIRECTORY}${name}.js`, content })),
        ...Object.entries(bundle.tools || {}).map(([name, content]) => ({ path: `${root}${TOOL_DIRECTORY}${name}.js`, content })),
        ...Object.entries(bundle.scripts || {}).map(([name, content]) => ({ path: `${root}${SCRIPT_DIRECTORY}${name}.js`, content }))];
}

export function variableBundleFromFiles(root: string, files: CardFile[]): Bundle {
    return readBundleFiles(root, files, 'content')!;
}
function readBundleFiles(root: string, files: CardFile[], field: 'content' | 'originalContent'): Bundle | null {
    const definition = files.find(file => file.path === root + DEFINITION_FILE);
    if (!definition || typeof definition[field] !== 'string') {
        if (field === 'originalContent') {return null;}
        throw new Error(CARD_FILES_COPY.missing);
    }
    const sources = (collection: string) => Object.fromEntries(files.flatMap(file => {
        if (!file.path.startsWith(root)) {return [];}
        const target = locateVariableFile(file.path.slice(root.length));
        return target && !target.settings && target.collection === collection && typeof file[field] === 'string' ? [[target.name, file[field]]] : [];
    }));
    const tools = sources('tools'), scripts = sources('scripts');
    return assertBundle({ definition: JSON.parse(definition[field]!), functions: sources('functions'),
        ...(Object.keys(tools).length ? { tools } : {}), ...(Object.keys(scripts).length ? { scripts } : {}) });
}

// Hash lives on the definition file's existing workspace baseline. Removing a
// function file therefore retains the identity of the complete imported bundle.
export function prepareVariableWrite(root: string, files: CardFile[], stored: unknown) {
    const actual = stored === null || stored === undefined ? null : decodeBundle(stored);
    const bundle = variableBundleFromFiles(root, files), hash = digest(bundle);
    if (actual !== null && digest(actual) === hash) {return { bundle, unchanged: true };}
    const definition = files.find(file => file.path === root + DEFINITION_FILE);
    if (actual === null && !definition?.originalGroupHash) {return { bundle, unchanged: false };}
    const baseline = definition?.originalGroupHash ?? digest(readBundleFiles(root, files, 'originalContent'));
    if (digest(actual ?? null) !== baseline) {throw new Error(CARD_FILES_COPY.conflict);}
    return { bundle, unchanged: false };
}

// One owned leaf is replaced. Other extensions are never read-modify-written.
export function variableExtensionWrite(card: { name: string; avatar: string }, bundle: unknown) {
    return { avatar: card.avatar, data: { extensions: { [CARD_EXTENSION]: JSON.stringify(assertBundle(bundle)) } } };
}

// Saved card leaves are JSON text; workspace projections also accept a parsed bundle.
export function decodeBundle(stored: unknown): Bundle {
    return assertBundle(typeof stored === 'string' ? JSON.parse(stored) : stored);
}
