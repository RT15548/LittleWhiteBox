import { getArchiveCharacters } from './data/relation-graph.js';
import { buildAliasResolver } from './data/character-aliases.js';
import { isRelationFact, parseRelationTarget } from './data/fact-predicates.js';

// Read-only projection. Unclassified subjects stay accessible in World; no name
// guessing, stored category, or changes to the summary/recall model.
export function buildDossierModel(data) {
    const resolver = buildAliasResolver(data.characterAliases);
    const key = resolver.resolveKey;
    const userKey = key(data.userName);
    const peopleByKey = new Map();
    const add = person => {
        const id = key(person.name);
        if (id && !peopleByKey.has(id)) peopleByKey.set(id, {
            ...person, name: resolver.resolveName(person.name), protagonist: id === userKey,
        });
    };
    if (userKey) add({ name: data.userName, id: resolver.resolveName(data.userName) });
    getArchiveCharacters(data).forEach(add);
    const facts = data.facts.filter(fact => !fact.retracted);
    const people = [...peopleByKey.values()];
    return {
        people, key,
        worldFacts: facts.filter(fact => !isRelationFact(fact) && !peopleByKey.has(key(fact.s))),
        states: name => facts.filter(fact => !isRelationFact(fact) && key(fact.s) === key(name)),
        relations: name => facts.filter(fact => isRelationFact(fact)
            && (key(fact.s) === key(name) || key(parseRelationTarget(fact.p)) === key(name))),
        arc: name => data.arcs.find(arc => key(arc.name) === key(name)),
        events: name => data.events.filter(event => event.participants?.some(person => key(person) === key(name))).reverse(),
        aliases: name => data.characterAliases.filter(alias => key(alias.to) === key(name)),
    };
}
