// Memory Database (Dexie schema)

import Dexie from '../../../libs/dexie.mjs';

const DB_NAME = 'LittleWhiteBox_Memory';
const DB_VERSION = 3;  // 升级版本

// Chunk parameters
export const CHUNK_MAX_TOKENS = 200;

const db = new Dexie(DB_NAME);

db.version(DB_VERSION).stores({
    meta: 'chatId',
    chunks: '[chatId+chunkId], chatId, [chatId+floor]',
    chunkVectors: '[chatId+chunkId], chatId',
    eventVectors: '[chatId+eventId], chatId',
    stateVectors: '[chatId+atomId], chatId, [chatId+floor]',  // L0 向量表
});

export { db };
export const metaTable = db.meta;
export const chunksTable = db.chunks;
export const chunkVectorsTable = db.chunkVectors;
export const eventVectorsTable = db.eventVectors;
export const stateVectorsTable = db.stateVectors;
