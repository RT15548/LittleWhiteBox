import { WORKSPACE_RECORD_ID } from '../workspace-state.js';

// Frozen v1/v2 session fields. Compatibility ends after the IndexedDB upgrade;
// ordinary workspace reads/writes never consult session records again.
const SESSION_WORKSPACE_FIELDS = [
    'localSources', 'isWorkspaceOpen', 'workspaceWidth', 'workspacePanelMode',
    'selectedSourceId', 'selectedFilePath', 'selectedTreePath', 'selectedSkillFilePath',
    'fileSearchQuery', 'showModifiedOnly', 'viewerMode', 'mobileWorkspacePane',
    'treeExpandedKeys', 'skillTreeExpandedKeys',
];

export async function migrateWorkspaceV3(transaction) {
    const sessions = transaction.table('sessions');
    const pointer = await transaction.table('meta').get('currentSessionId');
    const session = await sessions.get(String(pointer?.value || 'default'));
    if (session) {
        const workspace = { id: WORKSPACE_RECORD_ID, updatedAt: session.updatedAt };
        for (const field of SESSION_WORKSPACE_FIELDS) {
            if (Object.hasOwn(session, field)) workspace[field] = session[field];
        }
        if (workspace.workspacePanelMode === 'skills') workspace.workspacePanelMode = 'memory';
        await transaction.table('workspace').put(workspace);
        // Move, do not retain a second copy that could resurrect deleted files.
        for (const field of SESSION_WORKSPACE_FIELDS) delete session[field];
        await sessions.put(session);
    }
}
