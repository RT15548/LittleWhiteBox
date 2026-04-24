import {
    INTERNAL_WORKSPACE_TOOL_NAMES,
    WORKSPACE_SOURCES,
    isWorkspaceMutationTool,
    normalizeWorkspaceSource,
} from './workspace-protocol.js';

function normalizeWorkspacePathText(value = '') {
    return String(value || '').trim().replace(/\\/g, '/');
}

export function getWorkspaceMutationPermissionError(name = '', meta = {}, args = {}) {
    const toolName = String(name || '').trim();
    if (!isWorkspaceMutationTool(toolName)) return '';

    const source = normalizeWorkspaceSource(meta.source || WORKSPACE_SOURCES.TOOL);
    if (source === WORKSPACE_SOURCES.TOOL || source === WORKSPACE_SOURCES.UI_ACTION) {
        return '';
    }

    if (source !== WORKSPACE_SOURCES.EDITOR) {
        return 'workspace_source_permission_denied';
    }

    if (toolName === 'Write') {
        const targetPath = normalizeWorkspacePathText(args?.path);
        const metaPath = normalizeWorkspacePathText(meta.path);
        return targetPath && metaPath && targetPath === metaPath
            ? ''
            : 'workspace_source_permission_denied';
    }

    if (toolName === INTERNAL_WORKSPACE_TOOL_NAMES.BATCH_WRITE_FILES) {
        const files = Array.isArray(args?.files) ? args.files : [];
        if (!files.length) {
            return 'workspace_source_permission_denied';
        }

        const seenPaths = new Set();
        for (const entry of files) {
            const targetPath = normalizeWorkspacePathText(entry?.path);
            if (!targetPath || seenPaths.has(targetPath)) {
                return 'workspace_source_permission_denied';
            }
            seenPaths.add(targetPath);
        }
        return '';
    }

    return 'workspace_source_permission_denied';
}
