import { createSummaryBaseline } from './summary-history.js';
import { assignImportedFactIds } from './fact-identity.js';
import { MEMORY_DATA_COPY } from './memory-copy.js';

export const SUMMARY_MEMORY_PACKAGE = Object.freeze({ type: 'LittleWhiteBoxStorySummaryMemory', version: 1 });

export function readSummaryPackageData(raw) {
    const data = raw?.data;
    if (raw?.type !== SUMMARY_MEMORY_PACKAGE.type || raw?.version !== SUMMARY_MEMORY_PACKAGE.version
        || !data || typeof data !== 'object' || Array.isArray(data)
        || !Array.isArray(data.facts)
        || !data.facts.every(fact => ['人物名字', '种类', '描述'].every(key =>
            typeof fact?.[key] === 'string' && fact[key].trim()))) {
        throw Object.assign(new Error(MEMORY_DATA_COPY.unsupportedImport), { code: 'summary_import_unsupported' });
    }
    return data;
}

function stampImportedSummaryJson(json, boundary) {
    if (!json || typeof json !== "object" || !Number.isFinite(boundary) || boundary < 0) {
        return;
    }

    for (const item of (json.keywords || [])) {
        if (item && typeof item === "object") item._addedAt = boundary;
    }

    for (const item of (json.events || [])) {
        if (item && typeof item === "object") item._addedAt = boundary;
    }

    const mainCharacters = json.characters?.main || [];
    for (const item of mainCharacters) {
        if (item && typeof item === "object") item._addedAt = boundary;
    }

    for (const alias of (json.characterAliases || [])) {
        if (alias && typeof alias === "object") alias._addedAt = boundary;
    }

    for (const arc of (json.arcs || [])) {
        if (!arc || typeof arc !== "object") continue;
        arc._addedAt = boundary;
        for (const moment of (arc.moments || [])) {
            if (moment && typeof moment === "object") moment._addedAt = boundary;
        }
    }

    for (const fact of (json.facts || [])) {
        if (fact && typeof fact === "object") fact._addedAt = boundary;
    }
}

export function applyImportedSummaryBoundary(store, boundary) {
    if (!store?.json || !Number.isFinite(boundary) || boundary < 0) {
        return false;
    }

    stampImportedSummaryJson(store.json, boundary);
    store.lastSummarizedMesId = boundary;
    store.summaryHistory = [createSummaryBaseline(boundary)];
    delete store.pendingImportBoundary;
    store.updatedAt = Date.now();
    return true;
}

export function prepareImportedSummary(previous, json, boundary) {
    const next = structuredClone(previous);
    const store = next.storySummary;
    store.json = structuredClone(json);
    store.json.facts = assignImportedFactIds(store.json.facts);
    delete store.summaryInvalid;
    delete store.sourceInvalidFromFloor;
    if (boundary >= 0) applyImportedSummaryBoundary(store, boundary);
    else {
        store.lastSummarizedMesId = -1;
        store.summaryHistory = [];
        store.pendingImportBoundary = true;
    }
    store.updatedAt = Date.now();
    next.stateAtoms = [];
    next.l0Index = { version: 1, byFloor: {} };
    return next;
}
