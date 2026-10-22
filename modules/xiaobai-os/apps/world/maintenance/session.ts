import type { MaintenanceMode, MaintenanceSession } from '../../../capabilities/maintenance/registry.js';
import { editWorld } from '../../../domains/world/edit.js';
import { record } from '../../../domains/world/invariants.js';
import { worldContent } from '../../../domains/world/projection.js';
import { sameWorldContent, WORLD_LIMITS } from '../../../domains/world/types.js';
import type { WorldService } from '../application/service.js';
import { buildWorldDataMessage } from '../prompt-data.js';
import { buildWorldMaintenancePrompt } from './prompt.js';
import { WORLD_TOOLS } from '../tools/tool-contract.js';

// Failed atomic batches must be addressed; a read or unrelated edit cannot clear them.
function editScopes(args: unknown): string[] {
    if (!args || typeof args !== 'object' || Array.isArray(args)) { return ['call']; }
    const value = args as Record<string, unknown>;
    const scopes = 'overview' in value ? ['overview'] : [];
    const validId = (id: unknown): id is string => typeof id === 'string' && !!id.trim() && [...id].length <= WORLD_LIMITS.id;
    if (Array.isArray(value.upsert)) {
        for (const item of value.upsert) {
            if (item && validId(item.id)) { scopes.push(`news:${item.id}`); }
        }
    }
    if (Array.isArray(value.remove)) {
        for (const id of value.remove) { if (validId(id)) { scopes.push(`news:${id}`); } }
    }
    return scopes.length ? scopes : ['call'];
}

export function createWorldMaintenanceSession(world: WorldService, mode: MaintenanceMode): MaintenanceSession {
    const original = world.readCurrent();
    const expected = worldContent(original.world);
    let staged = structuredClone(expected);
    const failures = new Set<string>();
    let invalid = false;
    let committed = false;
    const active = () => {
        if (invalid || committed) { throw new Error('world_session_inactive'); }
    };
    const changed = () => !sameWorldContent(expected, staged);
    return {
        participantId: 'world',
        commitPolicy: 'complete-run',
        prompt: buildWorldMaintenancePrompt(mode),
        dataMessages: [{ role: 'user', content: buildWorldDataMessage(expected) }],
        tools: WORLD_TOOLS,
        executeTool(name, args) {
            active();
            if (name === 'WorldRead') { record(args, 'WorldRead', []); return worldContent(staged); }
            if (name !== 'WorldEdit') { throw new TypeError('Unknown world tool.'); }
            const result = editWorld(staged, args);
            const scopes = editScopes(args);
            if (result.ok) {
                staged = worldContent(result.data);
                if (scopes.some(scope => scope !== 'call')) { failures.delete('call'); }
                for (const scope of scopes) { if (scope !== 'call') { failures.delete(scope); } }
                result.errors = [...failures].map(scope => ({
                    path: 'WorldEdit',
                    message: scope === 'call'
                        ? 'An earlier failed edit still needs a valid correction before this publication can be saved.'
                        : scope === 'overview'
                            ? 'An earlier failed batch included overview. Resubmit the desired or unchanged overview in WorldEdit.'
                            : `An earlier failed batch included article ID ${scope.slice(5)}. Resolve it in WorldEdit with a complete upsert within the writing limits or remove (deletes it if present).`,
                }));
            } else { for (const scope of scopes) { failures.add(scope); } }
            return result;
        },
        canCommit: () => !invalid && !committed && !failures.size && changed(),
        getResult: () => ({ status: failures.size ? 'failed' : changed() ? 'updated' : 'unchanged', changed: !failures.size && changed() }),
        async commit(beforeCommit) {
            active();
            if (failures.size) { throw new Error('world_edits_unresolved'); }
            if (!changed()) { return; }
            const guard = () => !invalid && beforeCommit();
            const result = await world.replaceContent(original.identityKey, expected, staged, guard, mode === 'automatic' ? 'host' : 'immediate');
            committed = true;
            return result;
        },
        invalidate() { invalid = true; },
    };
}
