import { buildAliasResolver } from './character-aliases.js';

export function getArchiveCharacters(data) {
    const entries = new Map();
    for (const arc of data.arcs) entries.set(arc.name, { name: arc.name, id: arc.id || arc.name });
    const add = name => { if (name && !entries.has(name)) entries.set(name, { name, id: name }); };
    for (const item of data.characters.main) add(typeof item === 'string' ? item : item.name);
    for (const relation of data.characters.relationships) { add(relation.from); add(relation.to); }
    for (const alias of data.characterAliases) add(alias.to);
    for (const event of data.events) for (const name of event.participants || []) add(name);
    return [...entries.values()];
}

// Apply current aliases at read time: revealing an identity (or undoing the
// reveal) does not rewrite the user's original display choice.
export function relationGraph(data) {
    const people = getArchiveCharacters(data);
    const removed = data.removedGraphPeople || [];
    const relationships = data.characters.relationships;
    if (!removed.length) return { people, removed: [], relationships };
    const { resolveKey, resolveName } = buildAliasResolver(data.characterAliases);
    const hidden = new Map(removed.map(name => [resolveKey(name), resolveName(name)]));
    const visible = name => !hidden.has(resolveKey(name));
    return { people: people.filter(person => visible(person.name)), removed: [...hidden.values()],
        relationships: relationships.filter(r => visible(r.from) && visible(r.to)) };
}

// Only apply explicitly touched names against the latest confirmed chat.
// Unrelated choices made while the editor was open survive the save.
export function applyGraphChoices(store, data, changes) {
    const { resolveKey } = buildAliasResolver(data.characterAliases);
    const known = new Set(getArchiveCharacters(data).map(person => resolveKey(person.name)));
    const previous = store.removedGraphPeople || [];
    let removed = previous;
    for (const { name, visible } of changes) {
        const key = resolveKey(name);
        const matches = value => resolveKey(value) === key;
        if (!key || typeof visible !== 'boolean' || (!known.has(key) && !removed.some(matches))) {
            throw Object.assign(new Error('graph_person_missing'), { code: 'graph_person_missing' });
        }
        if (visible && removed.some(matches)) removed = removed.filter(value => !matches(value));
        if (!visible && !removed.some(matches)) removed = [...removed, name.trim()];
    }
    if (removed === previous) return false;
    if (removed.length) store.removedGraphPeople = removed;
    else delete store.removedGraphPeople;
    return true;
}
