import type { IntentResult } from '../intent-work.js';
import type { observe } from '../scene.js';
import type { Point } from '../model.js';
import { COPY as c } from '../copy.js';
import { CAST } from '../content.js';
import { BLUEPRINTS, ITEMS, RECIPES, RESOURCE_RULES, WORK_NAMES } from '../survival-content.js';

export function actionPreview(result: Extract<IntentResult, { kind: 'action' }>, view: ReturnType<typeof observe>) {
    const fields: { label: string; value: string }[] = [], warnings: string[] = [];
    const field = (label: string, value: string) => fields.push({ label, value });
    const position = (point: Point) => c.actionCoordinates(point);
    const item = (id: string) => {
        const value = view.items.find(i => i.id === id)!, location = value.location;
        const where = location.kind === 'ground' ? `${c.ground} · ${position(location.position)}`
            : `${CAST[location.person].name} · ${location.kind === 'worn' ? c.worn : location.kind === 'covering' ? c.covering : c.carried}`;
        return c.actionItem(ITEMS[value.kind].name, `${where}${value.food ? ` · ${c.foodCondition[value.food]}` : ''}`);
    };
    const site = (id: string) => { const value = view.structures.find(s => s.id === id)!; return c.actionItem(BLUEPRINTS[value.kind].name, position(value.position)); };
    const source = (id: string) => {
        const resource = view.resources.find(r => r.id === id);
        return resource ? c.actionItem(RESOURCE_RULES[resource.kind].name, position(resource.position)) : site(id);
    };
    const op = result.operation;
    let title: string;
    switch (op.kind) {
        case 'say': title = c.speak; field(c.actionWords, op.text); break;
        case 'declare': {
            title = c.ownChoices;
            const choice = op.choice;
            switch (choice.kind) {
                case 'residence': field(c.residence, position(choice.position)); break;
                case 'support': field(c.actionTarget, `${c.stance[choice.stance]} · ${CAST[choice.person].name}`); break;
                case 'proposal': title = c.propose; break;
                case 'response': title = c.commitment[choice.stance]; field(c.actionTarget, c.actionReference(choice.proposal)); break;
                case 'relay': title = c.relayStatement; field(c.actionTarget, c.actionReference(choice.reference)); break;
            }
            field(c.actionWords, op.text); warnings.push(c.declarationNote); break;
        }
        case 'travel': case 'drag':
            title = op.kind === 'travel' ? c.goThere : c.dragBody;
            field(c.actionRoute, op.route.map(position).join(' → '));
            if (op.kind === 'drag') { field(c.actionTarget, CAST[op.subject].name); warnings.push(c.bodyHandlingNote); }
            break;
        case 'rest': title = c.active.rest; break;
        case 'cancel': title = c.pause; break;
        case 'take': case 'drop': case 'wear': case 'unwear': title = c[op.kind]; field(c.actionTarget, item(op.item)); break;
        case 'offer': title = c.offer; field(c.actionTarget, `${CAST[op.to].name} · ${item(op.item)} ${c.actionQuantity(op.units)}`); break;
        case 'accept': {
            title = c.receive;
            const offer = view.offers.find(o => o.from === op.from && o.to === 'player')!;
            field(c.actionTarget, `${CAST[op.from].name} · ${ITEMS[offer.form].name} ${c.actionQuantity(offer.units)}`);
            if (offer.food) { warnings.push(c.foodCondition[offer.food]); }
            if (offer.water?.food) { warnings.push(`${c.liquid} · ${c.foodCondition[offer.water.food]}`); }
            break;
        }
        case 'construct': title = c.work; field(c.actionTarget, site(op.site)); break;
        case 'work': {
            const task = op.task;
            title = WORK_NAMES[task.kind];
            if ('item' in task) { field(c.actionTarget, item(task.item)); }
            if ('subject' in task) { field(c.remains, CAST[task.subject].name); }
            if ('source' in task) { field(c.actionTarget, source(task.source)); }
            if ('container' in task) { field(c.waterContainer, item(task.container)); }
            if (task.kind === 'wash') { field(c.washSupply, task.supply.kind === 'container' ? item(task.supply.id) : source(task.supply.id)); warnings.push(c.washNote); }
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
