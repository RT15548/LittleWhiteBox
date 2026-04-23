import Dexie from '../../../../libs/dexie.mjs';

const db = new Dexie('LittleWhiteBox_Assistant');

db.version(1).stores({
    sessions: 'id, updatedAt',
    messages: '[sessionId+order], sessionId',
});

export const sessionsTable = db.sessions;
export const messagesTable = db.messages;
export default db;
