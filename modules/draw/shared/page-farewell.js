const STORAGE_KEY = 'xb_image_job_page_farewells_v1';
const MAX_ENTRIES = 128;

export const PAGE_FAREWELL_MAX_AGE_MS = 120_000;
export const PAGE_FAREWELL_PREPARING_GRACE_MS = 20_000;

const trackedEntries = new Map();
let pagehideInstalled = false;

function normalizeText(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function entryKey(entry) {
    return `${entry.kind}\0${entry.id}\0${entry.leaseId || ''}`;
}

function normalizeFarewell(source) {
    const kind = source?.kind === 'job' || source?.kind === 'run' ? source.kind : '';
    const id = normalizeText(source?.id);
    const leaseId = normalizeText(source?.leaseId);
    const at = Number(source?.at);
    if (!kind || !id || !Number.isFinite(at) || at <= 0) return null;
    if (kind === 'job' && !leaseId) return null;
    return { kind, id, ...(leaseId ? { leaseId } : {}), at };
}

function resolveStorage(storage) {
    if (storage !== undefined) return storage;
    try {
        return globalThis.localStorage || null;
    } catch {
        return null;
    }
}

function readRaw(storage) {
    if (!storage) return [];
    try {
        const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.map(normalizeFarewell).filter(Boolean) : [];
    } catch {
        return [];
    }
}

function writeRaw(entries, storage) {
    if (!storage) return false;
    try {
        if (entries.length === 0) storage.removeItem(STORAGE_KEY);
        else storage.setItem(STORAGE_KEY, JSON.stringify(entries));
        return true;
    } catch {
        return false;
    }
}

function keepFresh(entries, now) {
    return entries.filter(entry => (
        entry.at <= now + PAGE_FAREWELL_MAX_AGE_MS
        && now - entry.at < PAGE_FAREWELL_MAX_AGE_MS
    ));
}

function installPagehideWriter() {
    if (pagehideInstalled || typeof globalThis.addEventListener !== 'function') return;
    globalThis.addEventListener('pagehide', (event) => {
        if (event?.persisted === true) return;
        persistTrackedPageFarewells();
    });
    pagehideInstalled = true;
}

export function trackPageJobLease(jobId, leaseId) {
    const entry = normalizeFarewell({ kind: 'job', id: jobId, leaseId, at: 1 });
    if (!entry) return false;
    trackedEntries.set(entryKey(entry), { kind: entry.kind, id: entry.id, leaseId: entry.leaseId });
    installPagehideWriter();
    return true;
}

export function untrackPageJobLease(jobId, leaseId) {
    const entry = normalizeFarewell({ kind: 'job', id: jobId, leaseId, at: 1 });
    return entry ? trackedEntries.delete(entryKey(entry)) : false;
}

export function trackPageDrawRun(runId) {
    const entry = normalizeFarewell({ kind: 'run', id: runId, at: 1 });
    if (!entry) return false;
    trackedEntries.set(entryKey(entry), { kind: entry.kind, id: entry.id });
    installPagehideWriter();
    return true;
}

export function untrackPageDrawRun(runId) {
    const entry = normalizeFarewell({ kind: 'run', id: runId, at: 1 });
    return entry ? trackedEntries.delete(entryKey(entry)) : false;
}

// pagehide 不能可靠等待 IndexedDB；这里只把当前页面持有的精确所有权 token
// 同步写进 localStorage。写失败时不改变任何 journal，恢复器自然退回原租约路径。
export function persistTrackedPageFarewells({ storage, now = Date.now() } = {}) {
    const target = resolveStorage(storage);
    if (!target || trackedEntries.size === 0) return false;
    const merged = new Map(keepFresh(readRaw(target), now).map(entry => [entryKey(entry), entry]));
    for (const tracked of trackedEntries.values()) {
        const entry = { ...tracked, at: now };
        merged.set(entryKey(entry), entry);
    }
    const entries = [...merged.values()]
        .sort((left, right) => left.at - right.at)
        .slice(-MAX_ENTRIES);
    return writeRaw(entries, target);
}

export function readPageFarewells({ storage, now = Date.now() } = {}) {
    const target = resolveStorage(storage);
    if (!target) return [];
    const raw = readRaw(target);
    const fresh = keepFresh(raw, now);
    if (fresh.length !== raw.length) writeRaw(fresh, target);
    return fresh;
}

export function consumePageFarewell(farewell, { storage } = {}) {
    const normalized = normalizeFarewell(farewell);
    const target = resolveStorage(storage);
    if (!normalized || !target) return false;
    const entries = readRaw(target);
    const remaining = entries.filter(entry => entryKey(entry) !== entryKey(normalized));
    if (remaining.length === entries.length) return false;
    return writeRaw(remaining, target);
}

export function findJobPageFarewell(farewells, jobId, leaseId) {
    const id = normalizeText(jobId);
    const lease = normalizeText(leaseId);
    return (Array.isArray(farewells) ? farewells : []).find(entry => (
        entry?.kind === 'job' && entry.id === id && entry.leaseId === lease
    )) || null;
}

export function findDrawRunPageFarewell(farewells, runId) {
    const id = normalizeText(runId);
    return (Array.isArray(farewells) ? farewells : []).find(entry => (
        entry?.kind === 'run' && entry.id === id
    )) || null;
}
