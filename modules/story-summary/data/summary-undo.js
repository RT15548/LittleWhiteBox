const UNDO_VERSION = 1;

export function isLegacySummaryHistoryEntry(entry) {
    return entry?.format == null && entry?.undo == null && entry?.previousEndMesId == null;
}

function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function clone(value) {
    return structuredClone(value);
}

function sameJson(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
}

function normalizedName(value) {
    return String(value || '').trim().toLowerCase();
}

function eventKey(item) {
    return String(item?.id || '').trim();
}

function characterKey(item) {
    return normalizedName(typeof item === 'string' ? item : item?.name);
}

function arcKey(item) {
    return normalizedName(item?.name);
}

function factKey(item) {
    return String(item?.id || '').trim();
}

function hasUniqueKeys(items, getKey) {
    const keys = new Set();
    for (const item of items || []) {
        const key = getKey(item);
        if (!key || keys.has(key)) return false;
        keys.add(key);
    }
    return true;
}

function buildKeyedChanges(beforeItems, afterItems, getKey) {
    const before = new Map();
    const after = new Map();
    for (const [index, item] of beforeItems.entries()) {
        before.set(getKey(item), { index, item });
    }
    for (const item of afterItems) {
        after.set(getKey(item), item);
    }

    const changes = [];
    for (const key of new Set([...before.keys(), ...after.keys()])) {
        const previous = before.get(key);
        const generated = after.get(key);
        if (sameJson(previous?.item, generated)) continue;
        changes.push({
            key,
            index: previous?.index ?? -1,
            previous: previous ? clone(previous.item) : null,
            generated: generated === undefined ? null : clone(generated),
        });
    }
    return changes;
}

function recordCollection(
    undo,
    beforeItems,
    afterItems,
    { previousField, generatedField, changesField, getKey, forceSnapshot = false },
) {
    if (sameJson(beforeItems, afterItems)) return;
    if (!forceSnapshot && hasUniqueKeys(beforeItems, getKey) && hasUniqueKeys(afterItems, getKey)) {
        undo[changesField] = buildKeyedChanges(beforeItems, afterItems, getKey);
        return;
    }
    undo[previousField] = clone(beforeItems);
    undo[generatedField] = clone(afterItems);
}

export function buildSummaryUndo(beforeJson = {}, afterJson = {}, { aliasChanged = false } = {}) {
    const undo = { version: UNDO_VERSION };
    const beforeCharacters = Array.isArray(beforeJson?.characters?.main) ? beforeJson.characters.main : [];
    const afterCharacters = Array.isArray(afterJson?.characters?.main) ? afterJson.characters.main : [];

    recordCollection(undo, beforeJson.keywords || [], afterJson.keywords || [], {
        previousField: 'previousKeywords',
        generatedField: 'generatedKeywords',
        forceSnapshot: true,
    });
    recordCollection(undo, beforeJson.events || [], afterJson.events || [], {
        previousField: 'previousEvents',
        generatedField: 'generatedEvents',
        changesField: 'eventChanges',
        getKey: eventKey,
    });
    recordCollection(undo, beforeCharacters, afterCharacters, {
        previousField: 'previousMainCharacters',
        generatedField: 'generatedMainCharacters',
        changesField: 'mainCharacterChanges',
        getKey: characterKey,
        forceSnapshot: aliasChanged,
    });
    recordCollection(undo, beforeJson.arcs || [], afterJson.arcs || [], {
        previousField: 'previousArcs',
        generatedField: 'generatedArcs',
        changesField: 'arcChanges',
        getKey: arcKey,
        forceSnapshot: aliasChanged,
    });
    recordCollection(undo, beforeJson.facts || [], afterJson.facts || [], {
        previousField: 'previousFacts',
        generatedField: 'generatedFacts',
        changesField: 'factChanges',
        getKey: factKey,
        forceSnapshot: aliasChanged,
    });

    const beforeAliases = beforeJson.characterAliases || [];
    const afterAliases = afterJson.characterAliases || [];
    if (!sameJson(beforeAliases, afterAliases)) {
        undo.previousCharacterAliases = clone(beforeAliases);
        undo.generatedCharacterAliases = clone(afterAliases);
    }
    return undo;
}

const SNAPSHOT_PAIRS = [
    ['previousKeywords', 'generatedKeywords'],
    ['previousEvents', 'generatedEvents'],
    ['previousMainCharacters', 'generatedMainCharacters'],
    ['previousArcs', 'generatedArcs'],
    ['previousFacts', 'generatedFacts'],
    ['previousCharacterAliases', 'generatedCharacterAliases'],
];

const CHANGE_FIELDS = [
    ['eventChanges', eventKey],
    ['mainCharacterChanges', characterKey],
    ['arcChanges', arcKey],
    ['factChanges', factKey],
];

function normalizeChanges(value, getKey) {
    if (!Array.isArray(value)) return null;
    const keys = new Set();
    const normalized = [];
    for (const item of value) {
        const key = String(item?.key || '').trim();
        if (
            !isPlainObject(item)
            || !key
            || keys.has(key)
            || !Number.isInteger(item.index)
            || item.index < -1
            || !Object.hasOwn(item, 'previous')
            || !Object.hasOwn(item, 'generated')
            || item.previous === undefined
            || item.generated === undefined
            || (item.previous === null && item.generated === null)
            || (item.previous === null && item.index !== -1)
            || (item.previous !== null && item.index < 0)
            || (item.previous !== null && getKey(item.previous) !== key)
            || (item.generated !== null && getKey(item.generated) !== key)
        ) return null;
        keys.add(key);
        normalized.push(item);
    }
    return normalized;
}

export function normalizeSummaryUndo(value) {
    if (!isPlainObject(value) || value.version !== UNDO_VERSION) return null;
    const allowed = new Set(['version', ...CHANGE_FIELDS.map(([field]) => field), ...SNAPSHOT_PAIRS.flat()]);
    if (Object.keys(value).some(field => !allowed.has(field))) return null;

    for (const [previousField, generatedField] of SNAPSHOT_PAIRS) {
        const hasPrevious = Object.hasOwn(value, previousField);
        const hasGenerated = Object.hasOwn(value, generatedField);
        if (hasPrevious !== hasGenerated) return null;
        if (hasPrevious && (!Array.isArray(value[previousField]) || !Array.isArray(value[generatedField]))) {
            return null;
        }
    }
    for (const [field, getKey] of CHANGE_FIELDS) {
        if (Object.hasOwn(value, field) && !normalizeChanges(value[field], getKey)) return null;
    }
    for (const [snapshotField, changesField] of [
        ['generatedEvents', 'eventChanges'],
        ['generatedMainCharacters', 'mainCharacterChanges'],
        ['generatedArcs', 'arcChanges'],
        ['generatedFacts', 'factChanges'],
    ]) {
        if (Object.hasOwn(value, snapshotField) && Object.hasOwn(value, changesField)) return null;
    }
    return value;
}

function indexByKey(items, getKey) {
    const map = new Map();
    for (const [index, item] of items.entries()) {
        const key = getKey(item);
        if (!key || map.has(key)) return null;
        map.set(key, { index, item });
    }
    return map;
}

function changesMatch(items, changes, getKey) {
    const current = indexByKey(items, getKey);
    if (!current) return false;
    return changes.every((change) => {
        const found = current.get(change.key);
        return change.generated === null
            ? !found
            : !!found && sameJson(found.item, change.generated);
    });
}

function restoreChanges(items, changes, getKey) {
    const restored = clone(items);
    const deletedByBatch = [];

    for (const change of changes) {
        const index = restored.findIndex(item => getKey(item) === change.key);
        if (change.generated === null) {
            deletedByBatch.push(change);
        } else if (change.previous === null) {
            restored.splice(index, 1);
        } else {
            restored[index] = clone(change.previous);
        }
    }

    for (const change of deletedByBatch.sort((a, b) => a.index - b.index)) {
        const index = Math.max(0, Math.min(change.index, restored.length));
        restored.splice(index, 0, clone(change.previous));
    }
    return restored;
}

function collections(json) {
    return {
        keywords: Array.isArray(json.keywords) ? json.keywords : [],
        events: Array.isArray(json.events) ? json.events : [],
        mainCharacters: Array.isArray(json.characters?.main) ? json.characters.main : [],
        arcs: Array.isArray(json.arcs) ? json.arcs : [],
        facts: Array.isArray(json.facts) ? json.facts : [],
        characterAliases: Array.isArray(json.characterAliases) ? json.characterAliases : [],
    };
}

export function applySummaryUndo(json = {}, rawUndo) {
    const undo = normalizeSummaryUndo(rawUndo);
    if (!undo) return null;
    const current = collections(json);
    const snapshots = [
        ['previousKeywords', 'generatedKeywords', 'keywords'],
        ['previousEvents', 'generatedEvents', 'events'],
        ['previousMainCharacters', 'generatedMainCharacters', 'mainCharacters'],
        ['previousArcs', 'generatedArcs', 'arcs'],
        ['previousFacts', 'generatedFacts', 'facts'],
        ['previousCharacterAliases', 'generatedCharacterAliases', 'characterAliases'],
    ];
    for (const [, generatedField, collection] of snapshots) {
        if (Object.hasOwn(undo, generatedField) && !sameJson(current[collection], undo[generatedField])) {
            return null;
        }
    }

    const changeSets = [
        ['eventChanges', 'events', eventKey],
        ['mainCharacterChanges', 'mainCharacters', characterKey],
        ['arcChanges', 'arcs', arcKey],
        ['factChanges', 'facts', factKey],
    ];
    for (const [field, collection, getKey] of changeSets) {
        if (undo[field] && !changesMatch(current[collection], undo[field], getKey)) return null;
    }

    const restored = clone(json);
    restored.characters ||= {};
    for (const [previousField, generatedField, collection] of snapshots) {
        if (!Object.hasOwn(undo, generatedField)) continue;
        if (collection === 'mainCharacters') restored.characters.main = clone(undo[previousField]);
        else restored[collection] = clone(undo[previousField]);
    }
    for (const [field, collection, getKey] of changeSets) {
        if (!undo[field]) continue;
        const next = restoreChanges(current[collection], undo[field], getKey);
        if (collection === 'mainCharacters') restored.characters.main = next;
        else restored[collection] = next;
    }
    return restored;
}

function failedResult(json, currentEndMesId) {
    return {
        json: clone(json || {}),
        crossedLegacyHistory: false,
        historyDiscontinuous: true,
        restoredEndMesId: currentEndMesId,
    };
}

export function applyExactSummaryHistoryUndo(json, history, targetEndMesId, currentEndMesId) {
    const entriesByEnd = new Map();
    for (const entry of Array.isArray(history) ? history : []) {
        const endMesId = Number(entry?.endMesId);
        entriesByEnd.set(endMesId, entriesByEnd.has(endMesId) ? null : entry);
    }

    let expectedEndMesId = Number(currentEndMesId);
    if (!Number.isInteger(expectedEndMesId) || expectedEndMesId < targetEndMesId) {
        return failedResult(json, currentEndMesId);
    }

    const rollbackEntries = [];
    let crossedLegacyHistory = false;
    while (expectedEndMesId > targetEndMesId) {
        const entry = entriesByEnd.get(expectedEndMesId);
        if (!entry) return failedResult(json, currentEndMesId);
        if (isLegacySummaryHistoryEntry(entry)) {
            crossedLegacyHistory = true;
            break;
        }

        const undo = entry.format === 1 ? normalizeSummaryUndo(entry.undo) : null;
        const previousEndMesId = Number(entry.previousEndMesId);
        if (
            !undo
            || !Number.isInteger(previousEndMesId)
            || previousEndMesId >= expectedEndMesId
            || previousEndMesId < targetEndMesId
        ) return failedResult(json, currentEndMesId);
        rollbackEntries.push({ undo, previousEndMesId });
        expectedEndMesId = previousEndMesId;
    }

    let restored = clone(json || {});
    for (const entry of rollbackEntries) {
        const next = applySummaryUndo(restored, entry.undo);
        if (!next) return failedResult(json, currentEndMesId);
        restored = next;
    }
    return {
        json: restored,
        crossedLegacyHistory,
        historyDiscontinuous: false,
        restoredEndMesId: expectedEndMesId,
    };
}
