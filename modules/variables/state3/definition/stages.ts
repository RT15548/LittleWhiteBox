import type { Definition, Diagnostic, Path, UpdateStage } from '../types.js';
import { contains, overlaps } from '../engine/data.js';
import { reject } from '../engine/diagnostics.js';

export const modelSource = (stage: UpdateStage) => `model:${stage}`;
export function allowsStage(definition: Definition, item: { stages?: UpdateStage[] }, stage?: UpdateStage): boolean {
    return stage === undefined || definition.updates.includes(stage) && (item.stages ?? definition.updates).includes(stage);
}
export function checkStages(definition: Definition) {
    const check = (item: { stages?: UpdateStage[] }, detail: { action?: string; path?: Path }) => {
        if (definition.updates.length > 1 && !item.stages) {reject('stage-missing', detail);}
        if (item.stages?.some(stage => !definition.updates.includes(stage))) {reject('stage-unknown', detail);}
    };
    definition.actions.forEach(action => check(action, { action: action.id }));
    definition.access.filter(entry => entry.direct).forEach(entry => check(entry, { path: entry.path }));
}
function directPolicy(definition: Definition, stage?: UpdateStage) {
    const blocked: { path: Path; code: string; rule?: string }[] = [
        ...definition.rules.filter(rule => rule.kind === 'derive').map(rule => ({ path: rule.path, rule: rule.id, code: 'derived-write' })),
        ...definition.access.filter(entry => !entry.direct || !allowsStage(definition, entry, stage))
            .map(entry => ({ path: entry.path, code: 'direct-not-allowed' })),
    ];
    return {
        allowed: definition.access.filter(entry => entry.direct && allowsStage(definition, entry, stage)),
        blocked,
    };
}
function permits(policy: ReturnType<typeof directPolicy>, path: Path) {
    return policy.allowed.some(entry => contains(entry.path, path)) && !policy.blocked.some(entry => overlaps(entry.path, path));
}
/** Permission scopes stay finite even when the state schema has dynamic or recursive fields. */
export function directWriteScopes(definition: Definition, stage?: UpdateStage): { path: Path; excluded: Path[] }[] {
    const policy = directPolicy(definition, stage);
    return policy.allowed.filter(entry => !policy.blocked.some(blocked => contains(blocked.path, entry.path)))
        .map(entry => ({ path: entry.path, excluded: policy.blocked.filter(blocked => contains(entry.path, blocked.path)).map(blocked => blocked.path) }));
}
// Tool exposure and staged input validation share the permission policy.
export function directWriteIssue(definition: Definition, path: Path, stage?: UpdateStage): Diagnostic | undefined {
    const policy = directPolicy(definition), blocked = policy.blocked.find(entry => overlaps(entry.path, path));
    if (blocked) {return { code: blocked.code, path, blockedPath: blocked.path, ...(blocked.rule === undefined ? {} : { rule: blocked.rule }) };}
    if (!permits(policy, path)) {return { code: 'direct-not-allowed', path };}
    if (stage && !permits(directPolicy(definition, stage), path)) {
        const allowedStages = definition.updates.filter(candidate => permits(directPolicy(definition, candidate), path));
        return { code: allowedStages.length ? 'direct-other-stage' : 'direct-not-allowed', path, stage, allowedStages };
    }
}
export function canWriteDirect(definition: Definition, path: Path, stage?: UpdateStage): boolean {
    return !directWriteIssue(definition, path, stage);
}
