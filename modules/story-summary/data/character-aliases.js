// Story Summary - Character aliases
// Pure helpers for identity reveal handling and deterministic canonicalization.

function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function clone(value) {
    return value == null ? value : structuredClone(value);
}

function sameJson(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

export function normalizeAliasNameKey(name) {
    return String(name || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .toLowerCase();
}

export function normalizeUserIdentityKey(name) {
    return String(name || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .replace(/\s+/gu, '')
        .toLowerCase();
}

function cleanName(name) {
    return String(name || '').normalize('NFKC').trim();
}

function cleanEvidence(evidence) {
    return String(evidence || '').trim().slice(0, 120);
}

function isAliasPlaceholder(text) {
    const value = String(text || '').trim();
    return !value
        || value.includes('统一主名')
        || value.includes('旧称呼')
        || value.includes('当前批次里的短证据')
        || value.includes('仅明确揭示身份时输出');
}

function dedupeByKey(items, getKey) {
    const out = [];
    const seen = new Set();
    for (const item of items || []) {
        const key = getKey(item);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(item);
    }
    return out;
}

export function normalizeCharacterAliases(value, defaultAddedAt = 0) {
    if (!Array.isArray(value)) return [];

    const out = [];
    for (const item of value) {
        if (!isPlainObject(item)) continue;
        const from = cleanName(item.from);
        const to = cleanName(item.to);
        const fromKey = normalizeAliasNameKey(from);
        const toKey = normalizeAliasNameKey(to);
        if (!fromKey || !toKey || fromKey === toKey) continue;

        const addedAt = Number(item._addedAt);
        out.push({
            from,
            to,
            evidence: cleanEvidence(item.evidence),
            _addedAt: Number.isFinite(addedAt) ? Math.trunc(addedAt) : defaultAddedAt,
        });
    }

    return out;
}

export function sanitizeCharacterAliasUpdates(updates) {
    if (!Array.isArray(updates)) return [];

    const out = [];
    for (const item of updates) {
        if (!isPlainObject(item)) continue;
        const to = cleanName(item.to);
        const evidence = cleanEvidence(item.evidence);
        if (isAliasPlaceholder(to) || isAliasPlaceholder(evidence)) continue;
        const fromList = Array.isArray(item.from) ? item.from : [item.from];
        const from = dedupeByKey(
            fromList
                .map(cleanName)
                .filter(Boolean)
                .filter(name => !isAliasPlaceholder(name))
                .filter(name => normalizeAliasNameKey(name) !== normalizeAliasNameKey(to)),
            normalizeAliasNameKey,
        );
        if (!to || !from.length || !evidence) continue;
        out.push({ to, from, evidence });
    }

    return out;
}

export function mergeCharacterAliasEdges(existingAliases, updates, floor) {
    const aliases = normalizeCharacterAliases(existingAliases, floor);
    const byFrom = new Map();
    const order = [];

    for (const alias of aliases) {
        const fromKey = normalizeAliasNameKey(alias.from);
        if (!fromKey) continue;
        if (!byFrom.has(fromKey)) order.push(fromKey);
        byFrom.set(fromKey, alias);
    }

    const accepted = [];
    const conflicts = [];
    const currentAliases = () => order.map(key => byFrom.get(key)).filter(Boolean);
    for (const update of sanitizeCharacterAliasUpdates(updates)) {
        for (const rawFrom of update.from) {
            const from = cleanName(rawFrom);
            const resolver = buildAliasResolver(currentAliases());
            const to = resolver.resolveName(update.to);
            const fromKey = normalizeAliasNameKey(from);
            const toKey = normalizeAliasNameKey(to);
            if (!fromKey || !toKey || fromKey === toKey) continue;

            const existing = byFrom.get(fromKey);
            if (existing) {
                const existingToKey = resolver.resolveKey(existing.to);
                if (existingToKey === toKey) continue;
                conflicts.push({
                    from,
                    existingTo: resolver.resolveName(existing.to) || existing.to,
                    rejectedTo: to,
                    evidence: update.evidence,
                    _addedAt: floor,
                });
                continue;
            }

            const next = {
                from,
                to,
                evidence: update.evidence,
                _addedAt: floor,
            };
            if (!byFrom.has(fromKey)) order.push(fromKey);
            byFrom.set(fromKey, next);
            accepted.push(next);
        }
    }

    return {
        aliases: order.map(key => byFrom.get(key)).filter(Boolean),
        accepted,
        conflicts,
    };
}

export function canonicalizeIncrementalSummaryData(parsed, aliases) {
    if (!parsed || !normalizeCharacterAliases(aliases).length) return parsed;

    const resolver = buildAliasResolver(aliases);

    for (const event of (parsed.events || [])) {
        if (!isPlainObject(event)) continue;
        if (Array.isArray(event.participants)) {
            event.participants = canonicalizeNameList(event.participants, resolver);
        }
    }

    if (Array.isArray(parsed.newCharacters)) {
        parsed.newCharacters = canonicalizeNameList(
            parsed.newCharacters.map(item => (typeof item === 'string' ? item : item?.name)),
            resolver,
        );
    }

    for (const update of (parsed.arcUpdates || [])) {
        if (!isPlainObject(update)) continue;
        update.name = resolver.resolveName(update.name);
    }

    for (const update of (parsed.factUpdates || [])) {
        if (!isPlainObject(update)) continue;
        update.s = resolver.resolveName(update.s);
        update.p = canonicalizeRelationPredicate(update.p, resolver);
    }

    return parsed;
}

export function buildAliasResolver(aliases) {
    const normalized = normalizeCharacterAliases(aliases);
    const edgeByFrom = new Map();
    const displayByKey = new Map();

    for (const alias of normalized) {
        const fromKey = normalizeAliasNameKey(alias.from);
        const toKey = normalizeAliasNameKey(alias.to);
        if (!fromKey || !toKey || fromKey === toKey) continue;
        edgeByFrom.set(fromKey, { fromKey, toKey, from: alias.from, to: alias.to });
        displayByKey.set(fromKey, alias.from);
        displayByKey.set(toKey, alias.to);
    }

    const resolving = new Map();
    const resolveKey = (rawKey) => {
        const start = normalizeAliasNameKey(rawKey);
        if (!start) return '';
        if (resolving.has(start)) return resolving.get(start);

        const seen = new Set();
        let current = start;
        while (edgeByFrom.has(current)) {
            if (seen.has(current)) break;
            seen.add(current);
            const next = edgeByFrom.get(current)?.toKey;
            if (!next || next === current) break;
            current = next;
        }
        resolving.set(start, current);
        return current;
    };

    const resolveName = (rawName) => {
        const name = cleanName(rawName);
        const key = normalizeAliasNameKey(name);
        if (!key) return '';
        const finalKey = resolveKey(key);
        if (!finalKey || finalKey === key) return name;
        return displayByKey.get(finalKey) || name;
    };

    const isAlias = (rawName) => {
        const key = normalizeAliasNameKey(rawName);
        return !!key && resolveKey(key) !== key;
    };

    return {
        resolveKey,
        resolveName,
        isAlias,
        aliases: normalized,
    };
}

function canonicalizeRelationPredicate(predicate, resolver) {
    const p = String(predicate || '').trim();
    const opinion = p.match(/^对(.+)的看法$/);
    if (opinion) {
        const name = resolver.resolveName(opinion[1]);
        return name ? `对${name}的看法` : p;
    }

    const relation = p.match(/^与(.+)的关系$/);
    if (relation) {
        const name = resolver.resolveName(relation[1]);
        return name ? `与${name}的关系` : p;
    }

    return p;
}

function canonicalizeNameList(names, resolver) {
    const out = [];
    const seen = new Set();
    for (const raw of names || []) {
        const name = resolver.resolveName(raw);
        const key = normalizeAliasNameKey(name);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(name);
    }
    return out;
}

function normalizeAddedAt(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function getItemName(item) {
    return cleanName(typeof item === 'string' ? item : item?.name);
}

function mergeCharacters(main, resolver) {
    const byKey = new Map();
    const order = [];

    for (const item of main || []) {
        const originalName = getItemName(item);
        const name = resolver.resolveName(originalName);
        const key = normalizeAliasNameKey(name);
        if (!key) continue;

        const next = typeof item === 'string' ? { name } : { ...item, name };
        const addedAt = normalizeAddedAt(next._addedAt, 0);
        next._addedAt = addedAt;

        const existing = byKey.get(key);
        if (!existing) {
            byKey.set(key, next);
            order.push(key);
            continue;
        }

        byKey.set(key, {
            ...existing,
            ...next,
            name,
            _addedAt: Math.min(normalizeAddedAt(existing._addedAt, addedAt), addedAt),
        });
    }

    return order.map(key => byKey.get(key));
}

function arcLatestAt(arc) {
    let latest = normalizeAddedAt(arc?._addedAt, 0);
    for (const moment of (arc?.moments || [])) {
        if (isPlainObject(moment)) {
            latest = Math.max(latest, normalizeAddedAt(moment._addedAt, latest));
        }
    }
    return latest;
}

function mergeMoments(a = [], b = []) {
    return dedupeByKey([...a, ...b], (moment) => {
        if (typeof moment === 'string') return `s:${moment}`;
        return `o:${String(moment?.text || '').trim()}@${moment?._addedAt ?? ''}`;
    });
}

function mergeArcs(arcs, resolver) {
    const byKey = new Map();
    const order = [];

    for (const arc of arcs || []) {
        if (!isPlainObject(arc)) continue;
        const name = resolver.resolveName(arc.name);
        const key = normalizeAliasNameKey(name);
        if (!key) continue;

        const next = { ...arc, name, moments: Array.isArray(arc.moments) ? [...arc.moments] : [] };
        const existing = byKey.get(key);
        if (!existing) {
            byKey.set(key, next);
            order.push(key);
            continue;
        }

        const existingLatest = arcLatestAt(existing);
        const nextLatest = arcLatestAt(next);
        const winner = nextLatest >= existingLatest ? next : existing;
        byKey.set(key, {
            ...existing,
            ...winner,
            name,
            moments: mergeMoments(existing.moments, next.moments),
            _addedAt: Math.min(normalizeAddedAt(existing._addedAt, next._addedAt ?? 0), normalizeAddedAt(next._addedAt, existing._addedAt ?? 0)),
        });
    }

    return order.map(key => byKey.get(key));
}

function factKey(fact) {
    return `${fact?.s || ''}::${fact?.p || ''}`;
}

function factLatestAt(fact) {
    return Math.max(normalizeAddedAt(fact?._addedAt, 0), normalizeAddedAt(fact?.since, 0));
}

function mergeFactsByCanonicalKey(facts, resolver) {
    const byKey = new Map();
    const order = [];

    for (const fact of facts || []) {
        if (!isPlainObject(fact)) continue;
        const s = resolver.resolveName(fact.s);
        const p = canonicalizeRelationPredicate(fact.p, resolver);
        if (!s || !p) continue;

        const next = { ...fact, s, p };
        const key = factKey(next);
        const existing = byKey.get(key);
        if (!existing) {
            byKey.set(key, next);
            order.push(key);
            continue;
        }

        const winner = factLatestAt(next) >= factLatestAt(existing) ? next : existing;
        byKey.set(key, {
            ...existing,
            ...winner,
            s,
            p,
            _addedAt: Math.min(normalizeAddedAt(existing._addedAt, winner._addedAt ?? 0), normalizeAddedAt(next._addedAt, winner._addedAt ?? 0)),
        });
    }

    return order.map(key => byKey.get(key));
}

function applyCanonicalization(json, resolver) {
    const before = {};
    let changed = false;

    json.characters ||= {};
    json.characters.main ||= [];
    const oldMain = clone(json.characters.main);
    const newMain = mergeCharacters(json.characters.main, resolver);
    if (!sameJson(oldMain, newMain)) {
        before.charactersMain = oldMain;
        json.characters.main = newMain;
        changed = true;
    }

    const eventParticipants = [];
    for (let index = 0; index < (json.events || []).length; index += 1) {
        const event = json.events[index];
        if (!isPlainObject(event)) continue;
        const oldParticipants = Array.isArray(event.participants) ? [...event.participants] : [];
        const nextParticipants = canonicalizeNameList(oldParticipants, resolver);
        if (sameJson(oldParticipants, nextParticipants)) continue;
        eventParticipants.push({
            id: String(event.id || ''),
            index,
            participants: oldParticipants,
        });
        event.participants = nextParticipants;
        changed = true;
    }
    if (eventParticipants.length) {
        before.eventParticipants = eventParticipants;
    }

    const oldArcs = clone(json.arcs || []);
    const newArcs = mergeArcs(json.arcs || [], resolver);
    if (!sameJson(oldArcs, newArcs)) {
        before.arcs = oldArcs;
        json.arcs = newArcs;
        changed = true;
    }

    const oldFacts = clone(json.facts || []);
    const newFacts = mergeFactsByCanonicalKey(json.facts || [], resolver);
    if (!sameJson(oldFacts, newFacts)) {
        before.facts = oldFacts;
        json.facts = newFacts;
        changed = true;
    }

    return { changed, before };
}

function migrationId(floor, edges) {
    const text = JSON.stringify(edges.map(e => [e.from, e.to]));
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
        hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    return `alias-${floor}-${Math.abs(hash)}`;
}

export function applyCharacterAliasUpdates(json, updates, floor) {
    const beforeAliases = normalizeCharacterAliases(json?.characterAliases, floor);
    const { aliases, accepted } = mergeCharacterAliasEdges(beforeAliases, updates, floor);
    if (!accepted.length) {
        if (!sameJson(json.characterAliases || [], beforeAliases)) {
            json.characterAliases = beforeAliases;
        }
        return { json, aliasChanged: false, migration: null };
    }

    json.characterAliases = aliases;
    const resolver = buildAliasResolver(aliases);
    const canonicalized = applyCanonicalization(json, resolver);

    const before = {
        characterAliases: beforeAliases,
        ...canonicalized.before,
    };

    return {
        json,
        aliasChanged: true,
        migration: {
            id: migrationId(floor, accepted),
            _addedAt: floor,
            edges: accepted.map(({ from, to }) => ({ from, to })),
            before,
        },
    };
}

export function applyAliasMigrationsForRollback(json, migrations, targetEndMesId) {
    if (!json || !Array.isArray(migrations)) return json;

    const pending = migrations
        .filter(migration => normalizeAddedAt(migration?._addedAt, -1) > targetEndMesId)
        .sort((a, b) => normalizeAddedAt(b._addedAt, 0) - normalizeAddedAt(a._addedAt, 0));

    for (const migration of pending) {
        const before = migration?.before || {};
        if (Array.isArray(before.characterAliases)) {
            json.characterAliases = clone(before.characterAliases);
        }
        if (Array.isArray(before.charactersMain)) {
            json.characters ||= {};
            json.characters.main = clone(before.charactersMain);
        }
        if (Array.isArray(before.arcs)) {
            json.arcs = clone(before.arcs);
        }
        if (Array.isArray(before.facts)) {
            json.facts = clone(before.facts);
        }
        if (Array.isArray(before.eventParticipants)) {
            for (const patch of before.eventParticipants) {
                const byId = patch.id
                    ? (json.events || []).find(event => String(event?.id || '') === patch.id)
                    : null;
                const event = byId || (json.events || [])[patch.index];
                if (event && isPlainObject(event)) {
                    event.participants = clone(patch.participants || []);
                }
            }
        }
    }

    return json;
}

export function normalizeAliasMigrations(value) {
    if (!Array.isArray(value)) return [];
    return value
        .filter(isPlainObject)
        .map(item => ({
            id: String(item.id || '').trim(),
            _addedAt: normalizeAddedAt(item._addedAt, 0),
            edges: Array.isArray(item.edges)
                ? item.edges
                    .filter(isPlainObject)
                    .map(edge => ({ from: cleanName(edge.from), to: cleanName(edge.to) }))
                    .filter(edge => edge.from && edge.to)
                : [],
            before: isPlainObject(item.before) ? item.before : {},
        }))
        .filter(item => item.id && item.edges.length);
}

export function formatCharacterAliasTableForAI(json) {
    const aliases = normalizeCharacterAliases(json?.characterAliases);
    if (!aliases.length) return '';

    const resolver = buildAliasResolver(aliases);
    const grouped = new Map();
    for (const alias of aliases) {
        const canonical = resolver.resolveName(alias.from) || alias.to;
        const canonicalKey = normalizeAliasNameKey(canonical);
        const fromKey = normalizeAliasNameKey(alias.from);
        if (!canonicalKey || !fromKey || canonicalKey === fromKey) continue;
        const group = grouped.get(canonicalKey) || { canonical, aliases: [] };
        group.aliases.push(alias.from);
        grouped.set(canonicalKey, group);
    }

    return Array.from(grouped.values())
        .map(group => {
            const names = dedupeByKey(group.aliases, normalizeAliasNameKey);
            return names.length ? `- ${group.canonical}：${names.join('、')}` : '';
        })
        .filter(Boolean)
        .join('\n');
}
