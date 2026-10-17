import type { Declaration, EventPayload, Journey, Landscape, NpcId, Operation, PersonId, Treatment, WashSupply, WorkTask } from './model.js';
import { isFault } from './fault.js';
import { invitationSequence } from './invitation.js';
import { operate } from './operations.js';
import { openScene } from './scene.js';

/** Candidate-local identities, in creation order within each namespace. Never part of a Journey. */
export interface SceneGenerated {
    experiences: { sequence: number; kind: EventPayload['kind'] }[];
    items: string[];
    structures: string[];
}
export interface SceneStep {
    actor: NpcId;
    operation: Operation;
    generated: SceneGenerated;
    /** The particular invitation answered by this operation, not just its sender or form. */
    invitation: number | null;
}

function generatedSince(before: Journey, after: Journey): SceneGenerated {
    return {
        experiences: after.experiences.slice(before.experiences.length).map(event => ({ sequence: event.sequence, kind: event.payload.kind })),
        // Domain-created item-/site- keys preserve insertion order, including depleted items.
        items: Object.keys(after.items).filter(id => !Object.hasOwn(before.items, id)),
        structures: Object.keys(after.structures).filter(id => !Object.hasOwn(before.structures, id)),
    };
}

/** Record a successful candidate operation without adding replay state to its world or model protocol. */
export function recordSceneStep(before: Journey, after: Journey, actor: NpcId, operation: Operation): SceneStep {
    return { actor, operation: structuredClone(operation), generated: generatedSince(before, after),
        invitation: invitationSequence(before, actor, operation) };
}

interface References {
    experience: (sequence: number) => number;
    item: (id: string) => string;
    structure: (id: string) => string;
}
function translateSupply(supply: WashSupply, references: References): WashSupply {
    switch (supply.kind) {
        case 'sea': return supply;
        case 'container': return { ...supply, id: references.item(supply.id) };
        case 'source': return { ...supply, id: references.structure(supply.id) };
    }
}
function translateTreatment(treatment: Treatment, references: References): Treatment {
    switch (treatment.kind) {
        case 'uncover': return treatment;
        case 'dress': return { ...treatment, item: references.item(treatment.item) };
        case 'rinse': return { ...treatment, supply: translateSupply(treatment.supply, references) };
    }
}
function translateDeclaration(choice: Declaration, references: References): Declaration {
    switch (choice.kind) {
        case 'residence': case 'support': case 'proposal': return choice;
        case 'response': return { ...choice, proposal: references.experience(choice.proposal) };
        case 'relay': return { ...choice, reference: references.experience(choice.reference) };
    }
}
function translateTask(task: WorkTask, references: References): WorkTask {
    switch (task.kind) {
        // Resources, waste and people are not created by scene operations.
        case 'gather': case 'relieve': case 'cover_waste': return task;
        // Water sources may be structures rather than the island's fixed resources.
        case 'fill': return { ...task, source: references.structure(task.source), container: references.item(task.container) };
        case 'sip': return { ...task, source: references.structure(task.source) };
        case 'pour': return { ...task, from: references.item(task.from), container: references.item(task.container) };
        case 'empty': case 'drink': return { ...task, container: references.item(task.container) };
        case 'eat': case 'cover_body': return { ...task, item: references.item(task.item) };
        case 'craft': case 'build': return { ...task, materials: task.materials.map(use => ({ ...use, item: references.item(use.item) })) };
        case 'wash': return { ...task, supply: translateSupply(task.supply, references) };
        case 'wash_item': return { ...task, item: references.item(task.item), supply: translateSupply(task.supply, references) };
        case 'tend': return { ...task, treatment: translateTreatment(task.treatment, references) };
        case 'bury_body': return { ...task, tool: references.item(task.tool) };
        case 'exhume_body': return { ...task, grave: references.experience(task.grave), tool: references.item(task.tool) };
        case 'ignite': return { ...task, site: references.structure(task.site), tinder: references.item(task.tinder), drill: references.item(task.drill) };
        case 'fuel': return { ...task, site: references.structure(task.site), materials: task.materials.map(use => ({ ...use, item: references.item(use.item) })) };
        case 'boil': return { ...task, site: references.structure(task.site), container: references.item(task.container) };
    }
}
function translateOperation(operation: Operation, references: References): Operation {
    switch (operation.kind) {
        case 'declare': return { ...operation, choice: translateDeclaration(operation.choice, references) };
        case 'take': case 'drop': case 'offer': case 'wear': case 'unwear': return { ...operation, item: references.item(operation.item) };
        case 'offer_care': return { ...operation, treatment: translateTreatment(operation.treatment, references) };
        case 'work': return { ...operation, task: translateTask(operation.task, references) };
        case 'construct': return { ...operation, site: references.structure(operation.site) };
        case 'say': case 'intend': case 'travel': case 'drag': case 'rest': case 'accept': case 'decline_offer':
        case 'accept_care': case 'decline_care': case 'offer_contact': case 'accept_contact': case 'decline_contact':
        case 'strike': case 'guard': case 'cancel': return operation;
    }
}

/** Commit only the legal, identity-preserving prefix against the current live world. */
export function replayScene(source: Journey, anchor: PersonId, operations: readonly SceneStep[], land: Landscape): { world: Journey; applied: number; dropped: number } {
    let world = source, applied = 0;
    const experiences = new Map<number, number>(), items = new Map<string, string>(), structures = new Map<string, string>();
    const references: References = {
        experience: sequence => experiences.get(sequence) ?? sequence,
        item: id => items.get(id) ?? id,
        structure: id => structures.get(id) ?? id,
    };
    for (const step of operations) {
        try {
            const operation = translateOperation(step.operation, references);
            const invitation = step.invitation === null ? null : references.experience(step.invitation);
            if (invitationSequence(world, step.actor, operation) !== invitation) { break; }
            // operate() clones its source. Publish only after generated identities and event kinds agree.
            const candidate = operate(world, { kind: 'gm', scene: openScene(world, anchor, land) }, step.actor, operation, land);
            const generated = generatedSince(world, candidate), recorded = step.generated;
            if (generated.experiences.length !== recorded.experiences.length || generated.items.length !== recorded.items.length
                || generated.structures.length !== recorded.structures.length
                || recorded.experiences.some((event, i) => event.kind !== generated.experiences[i].kind)) { break; }
            recorded.experiences.forEach((event, i) => experiences.set(event.sequence, generated.experiences[i].sequence));
            recorded.items.forEach((id, i) => items.set(id, generated.items[i]));
            recorded.structures.forEach((id, i) => structures.set(id, generated.structures[i]));
            world = candidate; applied++;
        } catch (error) {
            if (!isFault(error)) { throw error; }
            break;
        }
    }
    return { world, applied, dropped: operations.length - applied };
}
