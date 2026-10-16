import type { createAgentKnowledge } from '../agent-knowledge.js';
import type { PersonId } from '../model.js';
import type { NpcIdentity, PlayerAppearance, PersonIdentity } from '../characters.js';

type PublicIdentity = PlayerAppearance | Omit<NpcIdentity, 'heightMetres'>;
type IdentityView = (PublicIdentity | Pick<PublicIdentity, 'name'>) & {
    id: PersonId; observers: PersonId[]; rememberedBy: { observer: PersonId; source: number }[];
};
function withoutIdentity<T extends { identity: PersonIdentity }>(person: T) {
    const { identity: _identity, ...state } = person;
    return state;
}

// Transport projection only: current sight and remembered names retain separate evidence.
// Never reads the world or cast; callers supply their already-authorized observations.
export function agentObservations(views: ReturnType<ReturnType<typeof createAgentKnowledge>['context']>) {
    const identities = new Map<PersonId, IdentityView>();
    function seen(id: PersonId, identity: PersonIdentity, observer: PersonId) {
        let entry = identities.get(id);
        if (!entry) {
            const publicIdentity = 'appearanceAge' in identity ? { ...identity }
                : { name: identity.name, gender: identity.gender, age: identity.age };
            entry = { id, ...publicIdentity, observers: [], rememberedBy: [] }; identities.set(id, entry);
        }
        if (!entry.observers.includes(observer)) { entry.observers.push(observer); }
    }
    const observations = views.map(({ knownNames: _knownNames, ...view }) => {
        seen(view.observer, view.self.identity, view.observer);
        for (const person of view.people) { seen(person.id, person.identity, view.observer); }
        return { ...view, self: withoutIdentity(view.self), people: view.people.map(withoutIdentity) };
    });
    for (const view of views) {
        for (const remembered of view.knownNames) {
            let entry = identities.get(remembered.id);
            if (!entry) {
                entry = { id: remembered.id, name: remembered.name, observers: [], rememberedBy: [] };
                identities.set(remembered.id, entry);
            }
            if (!entry.observers.includes(view.observer)) {
                entry.rememberedBy.push({ observer: view.observer, source: remembered.source });
            }
        }
    }
    return { identities: [...identities.values()], observations };
}
