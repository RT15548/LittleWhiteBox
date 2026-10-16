import type { createAgentKnowledge } from '../agent-knowledge.js';
import { agentObservations } from './observations.js';

// Pages live only for this tool session. Updates compare authorized projections,
// never the world, and replace whole fields (including empty arrays and null).
export function createObservationReader(context: ReturnType<typeof createAgentKnowledge>['context']) {
    const initial = agentObservations(context());
    const pages = new Map([[0, initial]]);
    return {
        initial,
        read(offset: number) {
            const current = agentObservations(context(offset)), previous = pages.get(offset);
            pages.set(offset, current);
            if (!previous) { return { mode: 'snapshot', offset, ...current }; }
            const observations = current.observations.flatMap(view => {
                const before = previous.observations.find(v => v.observer === view.observer)!;
                const changed = Object.fromEntries(Object.entries(view).filter(([key, value]) =>
                    JSON.stringify(value) !== JSON.stringify(before[key as keyof typeof before])));
                return Object.keys(changed).length ? [{ observer: view.observer, ...changed }] : [];
            });
            return { mode: 'update', offset, observations,
                ...(JSON.stringify(current.identities) !== JSON.stringify(previous.identities) ? { identities: current.identities } : {}) };
        },
    };
}
