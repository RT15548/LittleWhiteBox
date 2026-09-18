/* global Buffer, process */
// Prepared-run receipts, not a cross-run cache. A request intent reserves budget
// before dispatch; its complete response is fsynced before the caller receives it.
// Missing receipts have unknown billing outcomes and NEVER permit automatic resend.
import fs from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import { createHash } from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const digest = value => hash(JSON.stringify(value));

function stopped(kind) {
    const error = new Error(`Prepared journal stopped: ${kind}; keep all artifacts, do not restart the batch`);
    error.goldFailure = { stage: 'request-journal', kind, transmitted: false };
    return error;
}

export function preparedJournalBinding(config, code) {
    // Build this BEFORE credentials are loaded. Runtime bookkeeping isn't input.
    const input = Object.fromEntries(Object.entries(config).filter(([key]) => !key.startsWith('__')));
    return digest({ input, code: {
        bundleHash: code.bundleHash, runnerHash: code.runnerHash,
        packageLockHash: code.packageLockHash, productionSourceHash: code.productionSourceHash,
        supportHash: code.supportHash,
        nodeVersion: code.nodeVersion, platform: code.platform, arch: code.arch,
    } });
}

async function acquireOwner(directory) {
    // OS-owned named pipe / Linux abstract socket, released even on hard process
    // death. No persistent lock, timeout or stale-owner deletion heuristic.
    const ownerId = hash(process.platform === 'win32' ? directory.toLowerCase() : directory);
    const address = process.platform === 'win32' ? { path: `\\\\.\\pipe\\lwb-prepared-${ownerId}` }
        : process.platform === 'linux' ? { path: `\0lwb-prepared-${ownerId}` }
            : { host: '127.0.0.1', port: 49152 + (Number.parseInt(ownerId.slice(0, 8), 16) % 16384), exclusive: true };
    const server = net.createServer(socket => socket.destroy());
    await new Promise((resolve, reject) => {
        server.once('error', () => reject(stopped('job-busy-or-port-unavailable')));
        server.listen(address, resolve);
    });
    return () => new Promise(resolve => server.close(resolve));
}

function safeHeaders(headers) {
    return Object.fromEntries([...headers].filter(([key]) =>
        /^(content-type|retry-after|(?:x-)?ratelimit[\w-]*|x-request-id)$/.test(key)));
}

export async function openRequestJournal({ directory, binding, maxRequests, resume = false, retryUnknown = null, transition = null, readOnly = false }) {
    directory = path.resolve(directory);
    if (!/^[a-f0-9]{64}$/.test(binding) || !Number.isSafeInteger(maxRequests) || maxRequests < 1) {
        throw stopped('invalid-binding-or-budget');
    }
    // Different spellings/junction paths to the same job must share one owner.
    await fs.mkdir(path.dirname(directory), { recursive: true });
    try { directory = await fs.realpath(directory); }
    catch (error) {
        if (error.code !== 'ENOENT') throw error;
        directory = path.join(await fs.realpath(path.dirname(directory)), path.basename(directory));
    }
    const release = await acquireOwner(directory);
    let handle;
    try {
        if (!resume) {
            await fs.mkdir(path.dirname(directory), { recursive: true });
            try { await fs.mkdir(directory); }
            catch (error) { if (error.code === 'EEXIST') throw stopped('job-already-started'); throw error; }
        }
        const journalPath = path.join(directory, 'request-journal.jsonl');
        const scopes = [];
        const intents = new Map();
        let previousHash = '';
        let sequence = 0;
        let complete = false;
        let activeScope = null;
        let effectiveBinding = binding;
        let authorizationToAppend = null;
        if ((retryUnknown || transition || readOnly) && !resume) throw stopped('retry-requires-resume');
        if (retryUnknown && transition) throw stopped('conflicting-approvals');
        if (resume) {
            let raw;
            try { raw = await fs.readFile(journalPath, 'utf8'); }
            catch { throw stopped('journal-missing'); }
            if (!raw.endsWith('\n')) throw stopped('journal-truncated');
            const prefixHash = createHash('sha256');
            for (const line of raw.trimEnd().split('\n')) {
                let record;
                try { record = JSON.parse(line); } catch { throw stopped('journal-corrupt'); }
                const { checksum, ...row } = record;
                if (row.sequence !== sequence++ || row.previousHash !== previousHash || digest(row) !== checksum || complete) {
                    throw stopped('journal-corrupt');
                }
                previousHash = checksum;
                if (row.type === 'header' && row.sequence === 0) {
                    if (row.version !== 1 || !/^[a-f0-9]{64}$/.test(row.binding) || row.maxRequests !== maxRequests) throw stopped('binding-changed');
                    effectiveBinding = row.binding;
                } else if (row.sequence === 0) throw stopped('journal-header-missing');
                else if (row.type === 'scope') {
                    if (activeScope || typeof row.name !== 'string' || scopes.some(item => item.name === row.name)) throw stopped('journal-scope-corrupt');
                    activeScope = { name: row.name, entries: [], complete: false };
                    scopes.push(activeScope);
                } else if (row.type === 'intent') {
                    if (!activeScope || row.scope !== activeScope.name || row.id !== intents.size + 1
                        || !/^[a-f0-9]{64}$/.test(row.identity || '')) throw stopped('journal-intent-corrupt');
                    const entry = { ...row, receipt: null, consumed: false };
                    if (row.retryOf != null) {
                        const original = intents.get(row.retryOf);
                        if (!original?.retryAuthorized || original.replacementId || original.receipt
                            || original.scope !== row.scope || original.identity !== row.identity) throw stopped('invalid-authorized-retry');
                        original.replacementId = row.id;
                        original.consumed = true;
                    }
                    intents.set(row.id, entry);
                    activeScope.entries.push(entry);
                } else if (row.type === 'response') {
                    const intent = intents.get(row.id);
                    if (!intent || intent.receipt || !activeScope || intent.scope !== activeScope.name
                        || !Number.isInteger(row.status) || row.status < 200 || row.status > 599
                        || typeof row.body !== 'string' || Buffer.from(row.body, 'base64').toString('base64') !== row.body
                        || hash(Buffer.from(row.body, 'base64')) !== row.bodyHash
                        || !Number.isFinite(row.receivedAt) || row.receivedAt < 0
                        || !row.headers || typeof row.headers !== 'object') throw stopped('journal-response-corrupt');
                    intent.receipt = row;
                } else if (row.type === 'retry-unknown') {
                    const original = intents.get(row.id);
                    if (!original || original.receipt || original.retryAuthorized || !activeScope
                        || original.scope !== activeScope.name || original.identity !== row.identity
                        || row.fromBinding !== effectiveBinding || !/^[a-f0-9]{64}$/.test(row.toBinding)
                        || !/^[a-f0-9]{64}$/.test(row.sourceManifestSha256)
                        || row.journalSha256 !== prefixHash.copy().digest('hex')) throw stopped('invalid-retry-authorization');
                    original.retryAuthorized = true;
                    effectiveBinding = row.toBinding;
                } else if (row.type === 'transition') {
                    if (row.fromBinding !== effectiveBinding || !/^[a-f0-9]{64}$/.test(row.toBinding)
                        || row.journalSha256 !== prefixHash.copy().digest('hex')
                        || !/^[a-f0-9]{64}$/.test(row.sourceManifestSha256)
                        || !/^[a-f0-9]{64}$/.test(row.sourceProfileSha256)
                        || !activeScope || activeScope.name !== `before-user:${row.summaryFromFloor - 1}`
                        || [...intents.values()].some(entry => !(entry.receipt || intents.get(entry.replacementId)?.receipt))) {
                        throw stopped('invalid-continuation');
                    }
                    effectiveBinding = row.toBinding;
                } else if (row.type === 'scope-end') {
                    if (!activeScope || row.name !== activeScope.name || activeScope.entries.some(entry =>
                        !entry.receipt && !intents.get(entry.replacementId)?.receipt)) throw stopped('journal-scope-corrupt');
                    activeScope.complete = true;
                    activeScope = null;
                } else if (row.type === 'complete') {
                    if (activeScope) throw stopped('journal-scope-corrupt');
                    complete = true;
                } else throw stopped('journal-record-unknown');
                prefixHash.update(`${line}\n`);
            }
            if (complete) throw stopped('job-complete');
            if (intents.size > maxRequests) throw stopped('journal-budget-corrupt');
            if (transition) {
                if (hash(raw) !== transition.journalSha256 || effectiveBinding !== transition.previousBinding
                    || !activeScope || activeScope.name !== `before-user:${transition.summaryFromFloor - 1}`
                    || !/^[a-f0-9]{64}$/.test(transition.sourceManifestSha256)
                    || !/^[a-f0-9]{64}$/.test(transition.sourceProfileSha256)) throw stopped('continuation-stale');
                if ([...intents.values()].some(entry => !(entry.receipt || intents.get(entry.replacementId)?.receipt))) {
                    throw stopped('unknown-request-outcome');
                }
                authorizationToAppend = { ...transition, previousBinding: undefined, type: 'transition',
                    fromBinding: effectiveBinding, toBinding: binding };
                effectiveBinding = binding;
            }
            if (retryUnknown) {
                const original = intents.get(retryUnknown.id);
                if (hash(raw) !== retryUnknown.journalSha256 || effectiveBinding !== retryUnknown.previousBinding
                    || !/^[a-f0-9]{64}$/.test(retryUnknown.sourceManifestSha256)) throw stopped('retry-authorization-stale');
                if (!original || original.receipt || original.retryAuthorized || !activeScope
                    || original.scope !== activeScope.name || original.retryOf != null) throw stopped('retry-target-not-unknown');
                if (intents.size >= maxRequests) throw stopped('request-budget');
                authorizationToAppend = { type: 'retry-unknown', id: original.id, identity: original.identity,
                    fromBinding: effectiveBinding, toBinding: binding,
                    journalSha256: retryUnknown.journalSha256, sourceManifestSha256: retryUnknown.sourceManifestSha256 };
                original.retryAuthorized = true;
                effectiveBinding = binding;
            }
            if (effectiveBinding !== binding) throw stopped('binding-changed');
            if ([...intents.values()].some(entry => !entry.receipt && !entry.retryAuthorized)) throw stopped('unknown-request-outcome');
        }

        if (!readOnly) handle = await fs.open(journalPath, resume ? 'a' : 'wx');
        let fatal = null;
        let writeFailure = null;
        let writeTail = Promise.resolve();
        const append = value => {
            if (readOnly) return Promise.resolve();
            const operation = writeTail.then(async () => {
                if (writeFailure) throw writeFailure;
                const row = { ...value, sequence, previousHash };
                const checksum = digest(row);
                try {
                    await handle.writeFile(`${JSON.stringify({ ...row, checksum })}\n`, 'utf8');
                    await handle.sync();
                } catch { writeFailure = stopped('journal-write-failed'); fatal ||= writeFailure; throw writeFailure; }
                sequence++;
                previousHash = checksum;
            });
            writeTail = operation.catch(() => {});
            return operation;
        };
        if (!resume) await append({ type: 'header', version: 1, binding, maxRequests });
        if (authorizationToAppend) await append(authorizationToAppend);
        const historyLength = scopes.length;
        const priorRequests = intents.size;
        const context = new AsyncLocalStorage();
        const pending = new Set();
        let cursor = 0;
        let used = intents.size;
        let replayedResponses = 0;
        let runningScope = false;
        const guard = (kind, details = {}) => {
            fatal ||= stopped(kind);
            Object.assign(fatal.goldFailure, details);
            throw fatal;
        };
        const respond = (receipt, source) => {
            const response = new Response([204, 205, 304].includes(receipt.status) ? null : Buffer.from(receipt.body, 'base64'), {
                status: receipt.status, headers: receipt.headers,
            });
            response.preparedReceipt = { source, id: receipt.id, journalPath, bodyHash: receipt.bodyHash, receivedAt: receipt.receivedAt };
            return response;
        };
        return {
            descriptor: { journalPath, binding, resumed: resume, priorRequests, maxRequests, readOnly,
                priorResponses: [...intents.values()].filter(entry => entry.receipt).length,
                continuation: transition || null,
                authorizedUnknownRequests: [...intents.values()].filter(entry => entry.retryAuthorized).map(entry => entry.id) },
            get usedRequests() { return used; },
            get replayedResponses() { return replayedResponses; },
            get replaying() { return cursor < historyLength; },
            async runScope(name, operation) {
                if (fatal) throw fatal;
                if (runningScope || context.getStore()) return guard('overlapping-scopes');
                runningScope = true;
                let scope = scopes[cursor];
                try {
                    if (scope && scope.name !== name) return guard('scope-drift');
                    if (!scope) {
                        if (scopes.some(item => item.name === name)) return guard('duplicate-scope');
                        await append({ type: 'scope', name });
                        scope = { name, entries: [], complete: false };
                        scopes.push(scope);
                    }
                    const value = await context.run(scope, operation);
                    await Promise.allSettled([...pending]);
                    if (fatal) {
                        // Product L0 maintenance can catch the fetch error and return
                        // a status. Keep its completed collector when this scope stops.
                        if (value?.transportTrace) {
                            fatal.externalTrace = value.transportTrace;
                            fatal.externalCalls = value.externalCalls;
                            fatal.externalRequests = value.externalRequests;
                        }
                        throw fatal;
                    }
                    if (scope.entries.some(entry => !entry.consumed)) return guard('unused-receipts');
                    if (!scope.complete) {
                        await append({ type: 'scope-end', name });
                        scope.complete = true;
                    }
                    cursor++;
                    return value;
                } catch (error) {
                    // Product maintenance may turn the deliberate no-network
                    // boundary into a generic stage failure. Preserve the exact
                    // receipt-check stop reason without changing live errors.
                    if (readOnly && fatal?.goldFailure?.kind === 'replay-boundary') throw fatal;
                    // Only a NEW explicit invocation may reconstruct a failed
                    // scope; an upper-layer loop must not redispatch its successes.
                    fatal ||= stopped('scope-failed');
                    throw error;
                } finally { runningScope = false; }
            },
            dispatch(input, init = {}, send) {
                let transmitted = false;
                const task = (async () => {
                    if (fatal) throw fatal;
                    const scope = context.getStore();
                    if (!scope) return guard('request-outside-scope');
                    if (input instanceof Request || (init.body != null && typeof init.body !== 'string')) return guard('unreplayable-request');
                    const url = new URL(String(input));
                    if (url.username || url.password || url.search) return guard('credential-bearing-url');
                    init.signal?.throwIfAborted();
                    const identity = digest([url.href, (init.method || 'GET').toUpperCase(), init.body ?? null]);
                    const saved = scope.entries.find(entry => !entry.consumed && entry.identity === identity);
                    if (saved?.receipt) {
                        saved.consumed = true;
                        replayedResponses++;
                        return respond(saved.receipt, 'journal');
                    }
                    const retryOf = saved?.retryAuthorized ? saved.id : null;
                    if (scope.complete || scope.entries.some(entry => !entry.consumed && entry !== saved)) return guard('request-drift');
                    if (scope.entries.some(entry => entry.retryOf != null && entry.identity === identity)) return guard('authorized-retry-exhausted');
                    if (readOnly) return guard('replay-boundary', { scope: scope.name, replayedResponses });
                    if (used >= maxRequests) return guard('request-budget');
                    if (retryOf != null) saved.consumed = true;
                    const id = ++used;
                    // Mark consumed synchronously so concurrent identical requests
                    // are separate occurrences, not accidental cache hits.
                    const retryFields = retryOf == null ? {} : { retryOf };
                    const intent = { type: 'intent', id, scope: scope.name, identity, ...retryFields, consumed: true, receipt: null };
                    scope.entries.push(intent);
                    intents.set(id, intent);
                    if (retryOf != null) saved.replacementId = id;
                    await append({ type: 'intent', id, scope: scope.name, identity, ...retryFields });
                    let response;
                    let bytes;
                    try {
                        transmitted = true;
                        response = await send(input, { ...init, redirect: 'error' });
                        bytes = Buffer.from(await response.arrayBuffer());
                    } catch (error) {
                        // Preserve only bounded diagnostic categories, not arbitrary
                        // provider messages which can contain credentials or content.
                        const timeout = init.signal?.aborted === true;
                        return guard('unknown-request-outcome', { transmitted: true, requestId: id,
                            scope: scope.name, identity, signalAborted: timeout,
                            transportError: timeout ? 'aborted' : error?.name === 'TypeError' ? 'network' : 'response-read',
                            transportCode: /^UND_ERR_[A-Z_]+$|^E(?:CONNRESET|TIMEDOUT|PIPE|CONNREFUSED)$/.test(error?.cause?.code || '')
                                ? error.cause.code : null });
                    }
                    const receipt = { type: 'response', id, status: response.status, receivedAt: Date.now(),
                        headers: safeHeaders(response.headers), body: bytes.toString('base64'), bodyHash: hash(bytes) };
                    await append(receipt);
                    intent.receipt = receipt;
                    return respond(receipt, 'network');
                })().catch(error => {
                    if (!error.goldFailure) throw error;
                    const failure = new Error(error.message, { cause: error });
                    failure.goldFailure = { ...error.goldFailure, transmitted };
                    throw failure;
                });
                pending.add(task);
                task.then(() => pending.delete(task), () => pending.delete(task));
                return task;
            },
            async finish() {
                if (fatal) throw fatal;
                if (runningScope || cursor !== scopes.length || pending.size) return guard('unfinished-replay');
                await append({ type: 'complete' });
            },
            async close() {
                await Promise.allSettled([...pending]);
                await writeTail;
                try { await handle?.close(); } finally { await release(); }
            },
        };
    } catch (error) {
        try { await handle?.close(); } finally { await release(); }
        throw error;
    }
}
