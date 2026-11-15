import type { Compiled, Definition, Expression, Json, Path, UpdateStage } from '../types.js';
import { allowsStage, directWriteScopes } from '../definition/stages.js';
import { reject } from '../engine/diagnostics.js';
import { clone, contains, overlaps } from '../engine/data.js';
import { references } from '../engine/expressions.js';

const authoredRules = (definition: Definition) => definition.rules.map(({ id, kind, path, description }) => ({ id, kind, path: clone(path), description }));
const authoredConstraints = (definition: Definition) => definition.constraints.map(({ id, description }) => ({ id, description }));
const authoredScripts = (definition: Definition) => Object.entries(definition.extensions?.scripts || {})
    .filter(([, entry]) => entry.enabled).map(([phase, { description }]) => ({ phase, description }));

// How the world works around the selected fields: the RP model narrates with
// these facts, while submission instructions stay in the update view.
function worldFacts(definition: Definition, paths: Path[]) {
    const touches = (items: Path[]) => items.some(item => paths.some(path => overlaps(path, item)));
    const effects = (items: { path: Path; value: Expression }[]) => items.flatMap(effect => [effect.path, ...references(effect.value, definition)]);
    return {
        rules: definition.rules.filter(rule => touches([rule.path, ...references(rule.value, definition)])).map(({ description }) => description),
        actions: definition.actions.filter(action => touches([...references(action.requires, definition), ...effects(action.effects), ...effects(action.conversions)]))
            .map(({ description }) => description),
        triggers: (definition.triggers || []).filter(trigger => touches([...references(trigger.when, definition), ...effects(trigger.effects)]))
            .map(({ description }) => description),
        constraints: definition.constraints.filter(constraint => touches(references(constraint.test, definition))).map(({ description }) => description),
        ...(authoredScripts(definition).length ? { scripts: authoredScripts(definition) } : {}),
    };
}

export function buildDescriptionView(compiled: Compiled, sections = Object.keys(compiled.definition.views)) {
    const definition = compiled.definition;
    if (sections.some(id => !Object.hasOwn(definition.views, id))) {reject('view-selection');}
    const paths = sections.flatMap(id => definition.views[id].paths);
    return { name: definition.name,
        sections: sections.map(id => ({ id, description: definition.views[id].description, paths: clone(definition.views[id].paths) })),
        fields: definition.access.filter(entry => paths.some(path => overlaps(path, entry.path)))
            .map(({ path, description }) => ({ path: clone(path), description })),
        ...worldFacts(definition, paths),
    };
}

export function buildUpdateView(compiled: Compiled, state: Json, stage?: UpdateStage) {
    const definition = compiled.definition, scopes = directWriteScopes(definition, stage);
    const actions = definition.actions.filter(action => allowsStage(definition, action, stage));
    return { name: definition.name, state: clone(state), schema: clone(definition.schema),
        writable: clone(scopes),
        actions: actions.map(({ id, description, parameters }) => ({ id, description, parameters: clone(parameters) })),
        fields: definition.access.map(entry => {
            const write = [
                ...(scopes.some(scope => contains(scope.path, entry.path) && !scope.excluded.some(path => contains(path, entry.path))) ? ['direct'] : []),
                ...actions.filter(action => action.effects.some(effect => overlaps(effect.path, entry.path))).map(action => action.id),
            ];
            return { path: clone(entry.path), write, description: entry.description, ...(write.length && entry.update ? { update: entry.update } : {}) };
        }),
        triggers: (definition.triggers || []).map(({ id, description, timing }) => ({ id, description, timing: timing || 'batch' })),
        rules: authoredRules(definition), constraints: authoredConstraints(definition),
        functions: Object.entries(definition.functions).map(([id, fn]) => ({ id, description: fn.description })),
        ...(authoredScripts(definition).length ? { scripts: authoredScripts(definition) } : {}),
    };
}
