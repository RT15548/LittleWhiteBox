import { isRelationFact, parseRelationTarget } from './data/fact-predicates.js';

const text = value => typeof value === 'string' ? value.trim() : '';
const key = value => text(value).normalize('NFKC').toLocaleLowerCase();
// The current Story Summary format permits editor entries without _addedAt.
// They belong to the current snapshot, not to a fabricated historical floor.
const at = (item, through) => item?._addedAt === undefined
    || (Number.isSafeInteger(item._addedAt) && item._addedAt >= 0 && item._addedAt <= through);

/**
 * Current, bounded character projection. Arc trajectories and facts are mutable;
 * _addedAt is not their last revision. Only expose the current chat snapshot;
 * even a cutoff after lastSummarizedMesId may precede a manual character edit.
 */
export function projectStoryCharacters(store, { throughMessageIndex, currentMessageIndex, name = '', maxCharacters = 8000, maxPeople = 200 } = {}) {
    if (!store?.json || store.summaryInvalid || !Number.isSafeInteger(throughMessageIndex)
        || throughMessageIndex !== currentMessageIndex
        || throughMessageIndex < 0 || !Number.isSafeInteger(store.lastSummarizedMesId)
        || store.lastSummarizedMesId > throughMessageIndex) return [];
    const json = store.json;
    const budget = Math.min(8000, Math.max(0, Number(maxCharacters) || 0));
    const peopleLimit = Math.min(200, Math.max(0, Number(maxPeople) || 0));
    // Identity vocabulary is a current, durable lookup table. Unlike story
    // facts, it is neither a historical assertion nor subject to a content
    // rollback boundary.
    const aliases = json.characterAliases || [];
    const selectedName = key(name);
    let remaining = budget;
    const people = [];
    for (const person of json.characters?.main || []) {
        const personName = text(typeof person === 'string' ? person : person?.name);
        if (!at(person, throughMessageIndex) || !personName) continue;
        const names = aliases.filter(item => key(item.to) === key(personName)).map(item => text(item.from)).filter(Boolean);
        if (selectedName && selectedName !== key(personName) && !names.some(alias => key(alias) === selectedName)) continue;
        const related = value => [key(personName), ...names.map(key)].includes(key(value));
        const arc = selectedName && (json.arcs || []).find(item => related(item.name) && at(item, throughMessageIndex));
        const lines = [];
        if (arc) {
            if (text(arc.trajectory)) lines.push(`人物弧光：${text(arc.trajectory)}`);
            for (const moment of arc.moments || []) {
                const momentText = text(typeof moment === 'string' ? moment : moment?.text);
                if (at(moment, throughMessageIndex) && momentText) lines.push(momentText);
            }
        }
        for (const fact of selectedName ? json.facts || [] : []) {
            if (!fact.retracted && at(fact, throughMessageIndex)
                && (related(fact.s) || related(fact.o) || related(parseRelationTarget(fact.p)))) {
                const trend = isRelationFact(fact) ? text(fact.trend) : '';
                const updated = Number.isSafeInteger(fact.since) && fact.since >= 0
                    ? `｜事实更新：第${fact.since + 1}楼` : '';
                lines.push(`${text(fact.s)}｜${text(fact.p)}｜${text(fact.o)}${trend ? `｜关系状态：${trend}` : ''}${updated}`);
            }
        }
        const headerCost = personName.length + names.join('、').length;
        if (remaining < headerCost || people.length >= peopleLimit) break;
        remaining -= headerCost;
        const detail = [];
        for (const line of lines) {
            if (line.length + 1 > remaining) break;
            detail.push(line); remaining -= line.length + 1;
        }
        people.push({ name: personName, aliases: names, text: detail.join('\n') });
    }
    return people;
}
