import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import 'fake-indexeddb/auto';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chatId = `runtime-check-${Date.now()}`;

function float32ToBuffer(values) {
    const arr = new Float32Array(values);
    return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
}

async function collectJsFiles(dir) {
    const out = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            out.push(...await collectJsFiles(full));
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            out.push(full);
        }
    }
    return out;
}

async function assertNoBusinessVectorCacheImports() {
    const files = await collectJsFiles(path.join(rootDir, 'modules', 'story-summary'));
    const offenders = [];
    for (const file of files) {
        if (file.endsWith(path.join('vector', 'storage', 'vector-cache.js'))) continue;
        const text = await fs.readFile(file, 'utf8');
        if (text.includes('vector-cache.js')) {
            offenders.push(path.relative(rootDir, file));
        }
    }
    return offenders;
}

async function main() {
    const [
        dbModule,
        runtimeModule,
    ] = await Promise.all([
        import('../modules/story-summary/data/db.js'),
        import('../modules/story-summary/vector/runtime/runtime.js'),
    ]);

    const {
        metaTable,
        chunksTable,
        chunkVectorsTable,
        eventVectorsTable,
        stateVectorsTable,
    } = dbModule;
    const {
        warmRecallRuntime,
        scoreRecallRuntimeL1,
        scoreRecallRuntimeAnchors,
        scoreRecallRuntimeEvents,
        getRecallRuntimeStats,
        clearRecallRuntime,
    } = runtimeModule;

    await Promise.all([
        metaTable.put({ chatId, fingerprint: 'runtime-check', lastChunkFloor: 2, updatedAt: Date.now() }),
        chunksTable.bulkPut([
            { chatId, chunkId: 'c-1-0', floor: 1, chunkIdx: 0, speaker: 'A', isUser: true, text: 'alpha memory', textHash: 'a' },
            { chatId, chunkId: 'c-1-1', floor: 1, chunkIdx: 1, speaker: 'B', isUser: false, text: 'beta memory', textHash: 'b' },
        ]),
        chunkVectorsTable.bulkPut([
            { chatId, chunkId: 'c-1-0', vector: float32ToBuffer([1, 0]), dims: 2, fingerprint: 'runtime-check' },
            { chatId, chunkId: 'c-1-1', vector: float32ToBuffer([0, 1]), dims: 2, fingerprint: 'runtime-check' },
        ]),
        eventVectorsTable.bulkPut([
            { chatId, eventId: 'evt-1', vector: float32ToBuffer([1, 0]), dims: 2, fingerprint: 'runtime-check' },
        ]),
        stateVectorsTable.bulkPut([
            { chatId, atomId: 'atom-1', floor: 1, vector: float32ToBuffer([1, 0]), rVector: float32ToBuffer([1, 0]), dims: 2, rDims: 2, fingerprint: 'runtime-check' },
        ]),
    ]);

    const warm = await warmRecallRuntime(chatId, { reason: 'runtime-check' });
    const l1 = await scoreRecallRuntimeL1(chatId, [1], [1, 0]);
    const anchors = await scoreRecallRuntimeAnchors(chatId, [1, 0]);
    const events = await scoreRecallRuntimeEvents(chatId, [1, 0]);
    const stats = getRecallRuntimeStats().find((item) => item.chatId === chatId) || getRecallRuntimeStats()[0] || {};
    const offenders = await assertNoBusinessVectorCacheImports();

    const l1Stats = l1._stats || {};
    const top = l1.get(1)?.[0] || null;

    const checks = [
        ['warm', !!warm?.ready],
        ['l1TopChunk', top?.chunkId === 'c-1-0'],
        ['l1DbFallback', Number(l1Stats.cacheFallbackDbTime || 0) === 0],
        ['anchorScore', anchors?.scores?.[0]?.atomId === 'atom-1'],
        ['eventScore', events?.scores?.[0]?.eventId === 'evt-1'],
        ['cacheOwner', ['worker', 'runtime-main'].includes(String(stats.owner || l1Stats.cacheOwner || ''))],
        ['noBusinessVectorCacheImports', offenders.length === 0],
    ];

    const failed = checks.filter(([, ok]) => !ok);
    const backend = stats.backend || l1Stats.backend || 'unknown';
    const cacheOwner = stats.owner || l1Stats.cacheOwner || 'unknown';
    const promptParity = top?.text === 'alpha memory' ? 'PASS' : 'FAIL';

    console.log('[story-summary-runtime]');
    console.log(`runtime backend=${backend}`);
    console.log(`warm result=${warm?.ready ? 'PASS' : 'FAIL'} status=${stats.status || 'unknown'}`);
    console.log(`L0/L1/L2 cache owner=${cacheOwner}`);
    console.log(`DB fallback count=${Number(l1Stats.cacheFallbackDbTime || 0) === 0 ? 0 : 1}`);
    console.log(`promptParity=${promptParity}`);
    console.log(`vectorCacheImports=${offenders.length ? `FAIL ${offenders.join(', ')}` : 'PASS'}`);
    console.log(`result=${failed.length ? 'FAIL' : 'PASS'}`);

    await clearRecallRuntime(chatId);

    if (failed.length) {
        console.error('failed checks:');
        for (const [name] of failed) console.error(`- ${name}`);
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error('[story-summary-runtime] failed');
    console.error(error?.stack || error?.message || error);
    process.exitCode = 1;
});
