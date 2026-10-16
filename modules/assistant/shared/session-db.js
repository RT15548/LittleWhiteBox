import Dexie from '../../../libs/dexie.mjs';
import { migrateWorkspaceV3 } from './migrations/workspace-v3.js';

const db = new Dexie('LittleWhiteBox_Assistant');

db.version(1).stores({
    sessions: 'id, updatedAt',
    messages: '[sessionId+order], sessionId',
});

db.version(2).stores({
    sessions: 'id, updatedAt',
    messages: '[sessionId+order], sessionId',
    meta: 'key',
    plans: '[sessionId+id], sessionId, status, owner, priority, updatedAt, completedAt',
});

db.version(3).stores({
    workspace: 'id',
}).upgrade(migrateWorkspaceV3);

export const sessionsTable = db.sessions;
export const messagesTable = db.messages;
export const metaTable = db.meta;
export const plansTable = db.plans;
export const workspaceTable = db.workspace;
export default db;
