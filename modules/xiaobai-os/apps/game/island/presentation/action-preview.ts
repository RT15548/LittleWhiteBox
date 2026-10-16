import type { IntentResult } from '../intent-work.js';
import type { observe } from '../scene.js';
import type { PersonId, Point, Treatment, WashSupply } from '../model.js';
import { COPY as c, personName } from '../copy.js';
import { BLUEPRINTS, ITEMS, RECIPES, RESOURCE_RULES, WORK_NAMES } from '../survival-content.js';

export function actionPreview(result: Extract<IntentResult, { kind: 'action' }>, view: ReturnType<typeof observe>) {
    const name = (id: PersonId) => personName(id, view.self.identity.name);
    const fields: { label: string; value: string }[] = [], warnings: string[] = [];
    const field = (label: string, value: string) => fields.push({ label, value });
    const position = (point: Point) => c.actionCoordinates(point);
    const item = (id: string) => {
        const value = view.items.find(i => i.id === id)!, location = value.location;
        const where = location.kind === 'ground' ? `${c.ground} · ${position(location.position)}`
            : `${name(location.person)} · ${location.kind === 'worn' ? c.worn : location.kind === 'covering' ? c.covering : c.carried}`;
        return c.actionItem(ITEMS[value.kind].name, `${where}${value.food ? ` · ${c.foodCondition[value.food]}` : ''}`);
    };
    const site = (id: string) => { const value = view.structures.find(s => s.id === id)!; return c.actionItem(BLUEPRINTS[value.kind].name, position(value.position)); };
    const source = (id: string) => {
        const resource = view.resources.find(r => r.id === id);
        return resource ? c.actionItem(RESOURCE_RULES[resource.kind].name, position(resource.position)) : site(id);
    };
    const op = result.operation;
    const waterSupply = (s: WashSupply) => s.kind === 'sea' ? c.seaWater : s.kind === 'container' ? item(s.id) : source(s.id);
    const treatment = (t: Treatment) => {
        field(c.care, c.treatments[t.kind]);
        if (t.kind === 'rinse') { field(c.washSupply, waterSupply(t.supply)); field(c.actionWater, c.actionMl(t.millilitres)); }
        if (t.kind === 'dress') { field(c.careCloth, item(t.item)); }
        warnings.push(c.careNote);
    };
    let title: string;
    switch (op.kind) {
        case 'say': title = c.speak; field(c.actionWords, op.text); break;
        case 'declare': {
            title = c.ownChoices;
            const choice = op.choice;
            switch (choice.kind) {
                case 'residence': field(c.residence, position(choice.position)); break;
                case 'support': field(c.actionTarget, `${c.stance[choice.stance]} · ${name(choice.person)}`); break;
                case 'proposal': title = c.propose; break;
                case 'response': title = c.commitment[choice.stance]; field(c.actionTarget, c.actionReference(choice.proposal)); break;
                case 'relay': title = c.relayStatement; field(c.actionTarget, c.actionReference(choice.reference)); break;
            }
            field(c.actionWords, op.text); warnings.push(c.declarationNote); break;
        }
        case 'travel': case 'drag':
            title = op.kind === 'travel' ? c.goThere : c.dragBody;
            field(c.actionRoute, op.route.map(position).join(' → '));
            if (op.kind === 'drag') { field(c.actionTarget, name(op.subject)); warnings.push(c.bodyHandlingNote); }
            break;
        case 'rest': title = c.active.rest; break;
        case 'cancel': title = c.pause; break;
        case 'take': case 'drop': case 'wear': case 'unwear': title = c[op.kind]; field(c.actionTarget, item(op.item)); break;
        case 'offer': title = c.offer; field(c.actionTarget, `${name(op.to)} · ${item(op.item)} ${c.actionQuantity(op.units)}`); break;
        case 'offer_care': title = c.offerCare; field(c.actionTarget, `${name(op.to)} · ${c.wounds[op.wound]}`); treatment(op.treatment); warnings.push(c.careWaiting); break;
        case 'accept_care': case 'decline_care': title = op.kind === 'accept_care' ? c.acceptCare : c.declineCare; field(c.actionTarget, name(op.from)); break;
        case 'offer_contact': title = c.contactNames[op.form]; field(c.actionTarget, name(op.to)); warnings.push(c.contactWaiting); break;
        case 'accept_contact': case 'decline_contact': title = op.kind === 'accept_contact' ? c.acceptContact : c.declineContact; field(c.actionTarget, name(op.from)); break;
        case 'strike': title = c.strikeNames[op.form]; field(c.actionTarget, name(op.to)); warnings.push(c.strikeWarning); break;
        case 'guard': title = c.guard; break;
        case 'decline_offer': title = c.declineOffer; field(c.actionTarget, name(op.from)); break;
        case 'accept': {
            title = c.receive;
            const offer = view.offers.find(o => o.from === op.from && o.to === 'player')!;
            field(c.actionTarget, `${name(op.from)} · ${ITEMS[offer.form].name} ${c.actionQuantity(offer.units)}`);
            if (offer.food) { warnings.push(c.foodCondition[offer.food]); }
            if (offer.water?.food) { warnings.push(`${c.liquid} · ${c.foodCondition[offer.water.food]}`); }
            break;
        }
        case 'construct': title = c.work; field(c.actionTarget, site(op.site)); break;
        case 'work': {
            const task = op.task;
            title = WORK_NAMES[task.kind];
            if ('item' in task) { field(c.actionTarget, item(task.item)); }
            if ('tool' in task) { field(c.diggingTool, item(task.tool)); }
            if (task.kind === 'bury_body') { warnings.push(c.burialNote); }
            if (task.kind === 'exhume_body') { field(c.actionPosition, position(view.graves.find(g => g.grave === task.grave)!.position)); warnings.push(c.exhumationNote); }
            if ('subject' in task) { field(c.actionTarget, name(task.subject)); }
            if ('source' in task) { field(c.actionTarget, source(task.source)); }
            if ('container' in task) { field(c.waterContainer, item(task.container)); }
            if (task.kind === 'wash' || task.kind === 'wash_item') { field(c.washSupply, waterSupply(task.supply)); warnings.push(task.kind === 'wash' ? c.washNote : c.washingNote); }
            if (task.kind === 'tend') { field(c.woundPart, c.wounds[task.wound]); treatment(task.treatment); }
            if (task.kind === 'pour') { field(c.pourFrom, item(task.from)); }
            if ('millilitres' in task) { field(c.actionWater, c.actionMl(task.millilitres)); }
            if ('site' in task) { field(c.actionPosition, site(task.site)); }
            if ('materials' in task) {
                field(c.materials, task.materials.map(m => `${item(m.item)} ${c.actionQuantity(m.units)}`).join('\n'));
                warnings.push(c.actionMaterialsNote);
                const worn = task.materials.map(m => view.items.find(i => i.id === m.item)!).filter(i => i.location.kind === 'worn');
                if (worn.length) { warnings.push(c.dismantleWarning(worn.map(i => ITEMS[i.kind].name))); }
                if (task.materials.some(m => view.items.find(i => i.id === m.item)?.food === 'off_odor')) { warnings.push(c.spoiledCooking); }
            }
            if (task.kind === 'craft') { title = RECIPES[task.recipe].name; }
            if (task.kind === 'build') { title = BLUEPRINTS[task.blueprint].name; field(c.actionPosition, position(view.self.position)); }
            if (task.kind === 'gather') { field(c.quantity, c.actionQuantity(task.units)); }
            if (task.kind === 'ignite') { field(c.tools, item(task.drill)); field(c.materials, item(task.tinder)); }
            if (task.kind === 'relieve') { title = task.waste === 'urine' ? c.relieveUrine : c.relieveFeces; field(c.actionPosition, c.actionAtFeet); warnings.push(c.actionReliefNote); }
            if (task.kind === 'cover_waste') { field(c.actionPosition, position(view.waste.find(w => w.id === task.waste)!.position)); }
            if (task.kind === 'sip' || task.kind === 'drink' && view.items.find(i => i.id === task.container)?.water?.quality === 'untreated') { warnings.push(c.rawWaterRisk); }
            if (task.kind === 'drink' || task.kind === 'pour' || task.kind === 'boil') {
                const water = view.items.find(i => i.id === (task.kind === 'pour' ? task.from : task.container))?.water;
                if (water?.food) { warnings.push(`${c.liquid} · ${c.foodCondition[water.food]}`); }
            }
            if (task.kind === 'empty') { warnings.push(c.emptyLiquidNote); }
            break;
        }
    }
    if (result.seconds !== null) { field(c.actionTime, c.duration(result.seconds)); }
    return { title, fields, warnings };
}
