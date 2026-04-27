export const WORKSPACE_KERNEL_VERSION = '2026.04.24-v3';

export const WORKSPACE_MESSAGE_TYPES = Object.freeze({
    HYDRATE: 'xb-assistant:workspace-hydrate',
    UPDATED: 'xb-assistant:local-sources-updated',
});

export const WORKSPACE_SOURCES = Object.freeze({
    EDITOR: 'editor',
    UI_ACTION: 'ui-action',
    TOOL: 'tool',
    HYDRATE: 'hydrate',
});

export const INTERNAL_WORKSPACE_TOOL_NAMES = Object.freeze({
    CREATE_DIRECTORY: 'CreateDirectory',
    BATCH_WRITE_FILES: 'BatchWriteFiles',
});

export function isWorkspaceMutationTool(name = '') {
    return [
        'Write',
        'apply_patch',
        'Delete',
        'Move',
        INTERNAL_WORKSPACE_TOOL_NAMES.CREATE_DIRECTORY,
        INTERNAL_WORKSPACE_TOOL_NAMES.BATCH_WRITE_FILES,
    ].includes(String(name || '').trim());
}

export function isWorkspaceWriteLikeTool(name = '') {
    return [
        'Write',
        INTERNAL_WORKSPACE_TOOL_NAMES.CREATE_DIRECTORY,
        'Delete',
        'Move',
        'apply_patch',
        INTERNAL_WORKSPACE_TOOL_NAMES.BATCH_WRITE_FILES,
    ].includes(String(name || '').trim());
}

export function normalizeWorkspaceSource(value = '') {
    const normalized = String(value || '').trim();
    return Object.values(WORKSPACE_SOURCES).includes(normalized)
        ? normalized
        : WORKSPACE_SOURCES.TOOL;
}

export function buildWorkspaceOpMeta(meta = {}, fallback = {}) {
    const normalizedSource = normalizeWorkspaceSource(meta.source || fallback.source || WORKSPACE_SOURCES.TOOL);
    const opId = String(meta.opId || fallback.opId || '').trim();
    const baseVersion = Number.isFinite(Number(meta.baseVersion))
        ? Number(meta.baseVersion)
        : (Number.isFinite(Number(fallback.baseVersion)) ? Number(fallback.baseVersion) : 0);
    const path = typeof meta.path === 'string'
        ? meta.path
        : (typeof fallback.path === 'string' ? fallback.path : '');
    return {
        source: normalizedSource,
        opId,
        baseVersion,
        path: String(path || '').trim(),
    };
}

export function simpleHashText(value = '') {
    const text = String(value || '');
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}
