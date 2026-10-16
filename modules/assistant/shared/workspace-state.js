import { normalizeLocalSources } from './local-workspace-kernel.js';

export const WORKSPACE_RECORD_ID = 'main';

// The Assistant owns one workspace, independent of conversation IDs.
export function normalizeWorkspaceState(value = {}) {
    return {
        localSources: normalizeLocalSources(value.localSources),
        ...normalizeWorkspaceUiState(value),
    };
}

export function normalizeWorkspaceUiState(value = {}) {
    return {
        isWorkspaceOpen: !!value.isWorkspaceOpen,
        workspaceWidth: Number.isFinite(Number(value.workspaceWidth)) ? Number(value.workspaceWidth) : 520,
        workspacePanelMode: value.workspacePanelMode === 'memory' ? 'memory' : 'workspace',
        selectedSourceId: String(value.selectedSourceId || 'all'),
        selectedFilePath: String(value.selectedFilePath || ''),
        selectedTreePath: String(value.selectedTreePath || ''),
        selectedSkillFilePath: String(value.selectedSkillFilePath || ''),
        fileSearchQuery: String(value.fileSearchQuery || ''),
        showModifiedOnly: !!value.showModifiedOnly,
        viewerMode: String(value.viewerMode || 'current'),
        mobileWorkspacePane: value.mobileWorkspacePane === 'viewer' ? 'viewer' : 'tree',
        treeExpandedKeys: Array.isArray(value.treeExpandedKeys) ? value.treeExpandedKeys.map(item => String(item || '')).filter(Boolean) : [],
        skillTreeExpandedKeys: Array.isArray(value.skillTreeExpandedKeys) ? value.skillTreeExpandedKeys.map(item => String(item || '')).filter(Boolean) : [],
    };
}
