// Read-only, explicitly pinned prior captures. This is not a persistent cache:
// the map lives for one invocation, and original runs own response lifetimes.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const identity = (url, method, bodyHash) => JSON.stringify([url, method, bodyHash]);

async function readPinned(file, expected) {
    if (!/^[a-f0-9]{64}$/.test(expected || '')) throw new Error('Response archive requires a SHA256 pin');
    const bytes = await fs.readFile(file);
    if (hash(bytes) !== expected) throw new Error('Response archive hash changed');
    return bytes.toString('utf8');
}

export async function loadResponseArchive(sources = []) {
    if (!Array.isArray(sources)) throw new Error('Response archive must be a list of pinned manifests');
    const entries = new Map();
    let successfulRows = 0;
    let hits = 0;
    for (const source of sources) {
        const manifest = JSON.parse(await readPinned(source.path, source.sha256));
        if (manifest.status !== 'valid' || manifest.execution?.contract !== 'story-summary-computation-v1') {
            throw new Error('Response archive requires a valid current-contract capture');
        }
        const panel = manifest.config?.effectivePanel;
        const apis = [panel?.api, panel?.vector?.l0Api, panel?.vector?.embeddingApi, panel?.vector?.rerankApi];
        const tracePath = path.join(path.dirname(source.path), 'transport-trace.jsonl');
        const raw = await readPinned(tracePath, manifest.artifactHashes?.transportTrace);
        for (const [line, value] of raw.trim().split('\n').entries()) {
            const capture = JSON.parse(value);
            if (!Array.isArray(capture.production) || !Array.isArray(capture.preparation)) {
                throw new Error('Response archive requires preparation and production traces');
            }
            for (const section of ['preparation', 'production']) {
                for (const [index, row] of capture[section].entries()) {
                    if (!(row.status >= 200 && row.status < 300)) continue;
                    if (row.responseBody == null || hash(JSON.stringify(row.responseBody)) !== row.responseHash
                        || !/^[a-f0-9]{64}$/.test(row.requestHash || '') || row.method !== 'POST') {
                        throw new Error('Response archive contains an incomplete successful receipt');
                    }
                    const suffix = row.endpoint === 'embedding' ? '/embeddings'
                        : row.endpoint === 'rerank' ? '/rerank' : '/chat/completions';
                    const urls = apis.filter(api => api?.model === row.model).map(api => {
                        const base = new URL(api.url);
                        if (base.username || base.password || base.search || base.hash) throw new Error('Unsafe archive API URL');
                        return new URL(String(api.url).replace(/\/+$/, '') + suffix);
                    }).filter(url => url.host === row.host && url.pathname === row.path);
                    if (urls.length !== 1) throw new Error('Response archive API identity is ambiguous or changed');
                    const key = identity(urls[0].href, row.method, row.requestHash);
                    successfulRows++;
                    // Source-list order, then trace order, fixes the response when
                    // historical identical requests have multiple successes.
                    if (!entries.has(key)) entries.set(key, { row, reference: {
                        manifest: source.path, manifestSha256: source.sha256,
                        transportSha256: manifest.artifactHashes.transportTrace, line, section, index,
                    } });
                }
            }
        }
    }
    return {
        get stats() { return { sources: sources.length, successfulRows, uniqueRequests: entries.size, hits }; },
        match(input, init = {}) {
            if (input instanceof Request || typeof init.body !== 'string') return null;
            const url = new URL(String(input));
            if (url.username || url.password || url.search || url.hash) return null;
            init.signal?.throwIfAborted();
            const saved = entries.get(identity(url.href, (init.method || 'GET').toUpperCase(), hash(init.body)));
            if (!saved) return null;
            hits++;
            const response = Response.json(saved.row.responseBody, { status: saved.row.status });
            response.preparedReceipt = { source: 'archive', bodyHash: saved.row.responseHash, archive: saved.reference };
            return response;
        },
    };
}
