import assert from 'node:assert/strict';
import test from 'node:test';
import { unzipSync } from '../../../../libs/fflate.mjs';
import { deleteGalleryImages, exportGalleryZipPart } from '../gallery-batch.js';

// Contracts: export preserves exact selected bytes, including server files;
// parts read only their members (browser OOM); partial deletion reports exact
// committed IDs so failed records stay selected (data loss / false success).
test('ZIP includes cache and saved-URL images once, with safe unique paths', async () => {
    const reads = [];
    const result = await exportGalleryZipPart(['local', 'server', 'local', 'missing'], {
        readPreview: async id => {
            reads.push(id);
            return id === 'missing' ? null : { imgId: id, characterName: '../unsafe/name',
                ...(id === 'local' ? { base64: 'data:image/png;base64,AQID' } : { savedUrl: '/user/images/a.jpg' }) };
        },
        fetchImage: async url => {
            assert.equal(url, '/user/images/a.jpg');
            return new Response(new Uint8Array([4, 5, 6]), { headers: { 'Content-Type': 'image/jpeg' } });
        },
    });
    assert.deepEqual(reads, ['local', 'server', 'missing']);
    assert.deepEqual(result.exportedIds, ['local', 'server']);
    assert.deepEqual(result.failures.map(f => f.id), ['missing']);
    const files = unzipSync(new Uint8Array(await result.blob.arrayBuffer()));
    assert.equal(Object.keys(files).length, 2);
    assert.ok(Object.keys(files).every(name => !name.includes('/')));
    assert.deepEqual(Object.values(files).map(bytes => [...bytes]), [[1, 2, 3], [4, 5, 6]]);
});

test('a bounded part never reads originals from later parts', async () => {
    const reads = [];
    const options = { partBytes: 4, readPreview: async id => {
        reads.push(id); return { imgId: id, base64: 'AQID' };
    } };
    const first = await exportGalleryZipPart(['a', 'b', 'c', 'd'], options);
    assert.deepEqual(reads, ['a', 'b']);
    assert.deepEqual(first.remainingIds, ['c', 'd']);
    const second = await exportGalleryZipPart(first.remainingIds, options);
    assert.deepEqual(second.exportedIds, ['c', 'd']);
    assert.deepEqual(second.remainingIds, []);
});

test('oversized server response is cancelled without exporting a truncated file', async () => {
    let cancelled = false;
    const result = await exportGalleryZipPart(['large'], {
        maxImageBytes: 2, readPreview: async () => ({ savedUrl: '/image.png' }),
        fetchImage: async () => new Response(new ReadableStream({
            start(controller) { controller.enqueue(new Uint8Array([1, 2, 3])); },
            cancel() { cancelled = true; },
        }), { headers: { 'Content-Type': 'image/png' } }),
    });
    assert.equal(cancelled, true);
    assert.equal(result.blob, null);
    assert.equal(result.failures[0].id, 'large');
});

test('cancelled export cannot read the next original or offer a partial archive', async () => {
    const controller = new AbortController();
    const reads = [];
    await assert.rejects(exportGalleryZipPart(['a', 'b'], {
        signal: controller.signal,
        readPreview: async id => { reads.push(id); controller.abort(); return { base64: 'AQID' }; },
    }), { name: 'AbortError' });
    assert.deepEqual(reads, ['a']);
});

test('partial deletion reports only committed records and continues after failure', async () => {
    const attempts = [];
    const result = await deleteGalleryImages(['a', 'b', 'a', 'c'], async id => {
        attempts.push(id); if (id === 'b') throw new Error('write failed');
    });
    assert.deepEqual(attempts, ['a', 'b', 'c']);
    assert.deepEqual(result.deletedIds, ['a', 'c']);
    assert.deepEqual(result.failures.map(f => f.id), ['b']);
});
