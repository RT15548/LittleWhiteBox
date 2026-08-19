export const LOOKUP_SCOPE_PROJECT = 'project';
export const LOOKUP_SCOPE_LOCAL = 'local';

export function normalizeLookupScope(rawScope = '') {
    const normalized = String(rawScope || '').trim().toLowerCase();
    if (!normalized) return LOOKUP_SCOPE_PROJECT;
    if (normalized === LOOKUP_SCOPE_PROJECT || normalized === LOOKUP_SCOPE_LOCAL) return normalized;
    throw new Error('invalid_lookup_scope');
}

export function isLocalLookupTarget(rawPath = '') {
    const normalized = String(rawPath || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
    return normalized === 'local' || normalized.startsWith('local/');
}

export function filterLookupFilesByPath(files = [], rawPath = '') {
    const normalizedPath = String(rawPath || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
    if (!normalizedPath) return files;

    const exactFile = files.filter((entry) => String(entry?.publicPath || '') === normalizedPath);
    if (exactFile.length) return exactFile;

    const directoryPath = normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`;
    return files.filter((entry) => String(entry?.publicPath || '').startsWith(directoryPath));
}

export function assertLookupScopePath(rawPath = '', scope = LOOKUP_SCOPE_PROJECT) {
    const normalized = String(rawPath || '').trim();
    if (!normalized) return;
    if (isLocalLookupTarget(normalized)) {
        if (scope !== LOOKUP_SCOPE_LOCAL) {
            throw new Error('workspace_scope_local_required');
        }
        return;
    }
    if (scope === LOOKUP_SCOPE_LOCAL) {
        throw new Error('workspace_scope_local_only');
    }
}

export function assertLookupScopePattern(rawPattern = '', scope = LOOKUP_SCOPE_PROJECT) {
    const normalized = String(rawPattern || '').trim().replace(/\\/g, '/').replace(/^\/+/, '');
    if (!normalized) return;
    if (normalized === 'local' || normalized.startsWith('local/')) {
        if (scope !== LOOKUP_SCOPE_LOCAL) {
            throw new Error('workspace_scope_local_required');
        }
        return;
    }
    if (scope === LOOKUP_SCOPE_LOCAL && normalized.startsWith('scripts/')) {
        throw new Error('workspace_scope_local_only');
    }
}
