import type { Declaration, Experience, Journey, PersonId } from './model.js';
import { fail } from './fault.js';

type StatementChoice = Extract<Declaration, { kind: 'proposal' | 'response' }>;
export interface CooperationStatement { reference: number; actor: PersonId; text: string; choice: StatementChoice }
export type ExperienceView = Experience & { shared?: CooperationStatement };
interface KnownStatement extends CooperationStatement { source: number; learnedAt: number; through: PersonId }

function statement(event: Experience): CooperationStatement | null {
    const p = event.payload;
    return p.kind === 'declaration' && (p.choice.kind === 'proposal' || p.choice.kind === 'response')
        ? { reference: event.sequence, actor: p.actor, text: p.text, choice: p.choice } : null;
}

// A relay quotes one immutable statement, not the original event's place, audience or neighbours.
export function experienceView(world: Pick<Journey, 'experiences'>, event: Experience): ExperienceView {
    const result: ExperienceView = structuredClone(event), p = event.payload;
    if (p.kind === 'declaration' && p.choice.kind === 'relay') {
        const original = world.experiences[p.choice.reference - 1], shared = original && statement(original);
        if (!shared || original.sequence >= event.sequence) { fail('invalid'); }
        result.shared = structuredClone(shared);
    }
    return result;
}

// Temporary chronological projection, also used while validating a save in one pass.
export function cooperationHistory(events: readonly Experience[] = []) {
    const known = new Map<PersonId, Map<number, KnownStatement>>();
    function check(actor: PersonId, choice: Declaration) {
        if (choice.kind !== 'response' && choice.kind !== 'relay') { return; }
        const reference = choice.kind === 'response' ? choice.proposal : choice.reference;
        const entry = known.get(actor)?.get(reference);
        if (!entry || choice.kind === 'response' && entry.choice.kind !== 'proposal') { fail('memory_unavailable'); }
    }
    function remember(event: Experience) {
        const p = event.payload;
        if (p.kind !== 'declaration') { return; }
        check(p.actor, p.choice);
        const shared = statement(event) ?? (p.choice.kind === 'relay' ? known.get(p.actor)!.get(p.choice.reference)! : null);
        if (!shared) { return; }
        for (const observer of event.audience) {
            let entries = known.get(observer);
            if (!entries) { entries = new Map(); known.set(observer, entries); }
            if (!entries.has(shared.reference)) {
                entries.set(shared.reference, { reference: shared.reference, actor: shared.actor, text: shared.text, choice: shared.choice,
                    source: event.sequence, learnedAt: event.at, through: p.actor });
            }
        }
    }
    for (const event of events) { remember(event); }
    return { check, remember, known: (observer: PersonId) => [...(known.get(observer)?.values() ?? [])] };
}

export function knownAgreements(world: Pick<Journey, 'experiences'>, observer: PersonId) {
    const statements = cooperationHistory(world.experiences).known(observer);
    const replies = new Map<number, Map<PersonId, KnownStatement>>();
    for (const s of statements) {
        if (s.choice.kind !== 'response') { continue; }
        let responses = replies.get(s.choice.proposal);
        if (!responses) { responses = new Map(); replies.set(s.choice.proposal, responses); }
        // Hearing an older acceptance again does not erase a newer known withdrawal.
        if ((responses.get(s.actor)?.reference ?? 0) < s.reference) { responses.set(s.actor, s); }
    }
    return statements.filter(s => s.choice.kind === 'proposal').map(proposal => {
        const commitments = new Map<PersonId, { actor: PersonId; stance: 'accept' | 'decline'; reference: number; source: number; learnedAt: number; through: PersonId; text: string | null }>();
        commitments.set(proposal.actor, { actor: proposal.actor, stance: 'accept', reference: proposal.reference,
            source: proposal.source, learnedAt: proposal.learnedAt, through: proposal.through, text: null });
        for (const s of replies.get(proposal.reference)?.values() ?? []) {
            if (s.choice.kind !== 'response') { continue; }
            commitments.set(s.actor, { actor: s.actor, stance: s.choice.stance, reference: s.reference,
                source: s.source, learnedAt: s.learnedAt, through: s.through, text: s.text });
        }
        return { proposal: proposal.reference, proposer: proposal.actor, terms: proposal.text, source: proposal.source,
            learnedAt: proposal.learnedAt, through: proposal.through, commitments: [...commitments.values()] };
    }).reverse();
}
