import { advance } from '../../apps/game/building/domain.ts';
import { stock } from '../../apps/game/building/supply.ts';

// Legal random outcomes, injected only at the entropy boundary of tests.
export const testOffers = () => [['study', 'garden'], ['wide', 'terrace'], ['garden', 'room', 'room']];
export function chooseFor(supply, rooms) {
    const missing = stock(supply, rooms);
    const scores = supply.offers.map(pack => [...new Set(pack)].reduce((sum, kind) => sum + Math.min(Math.max(0, -missing[kind]), pack.filter(k => k === kind).length), 0));
    return Math.max(...scores) === 0 ? 2 : scores.indexOf(Math.max(...scores));
}
export function fundBuilding(state, rooms) {
    for (;;) {
        const supply = state.projects.find(p => p.id === state.activeId).supply;
        if (!supply.remaining) return state;
        state = advance(state, { type: 'choose', choice: chooseFor(supply, rooms) }, 'supply-' + state.revision, { offers: testOffers() });
    }
}
