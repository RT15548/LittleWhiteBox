import type { AcceptedTurnSource } from '../../../capabilities/maintenance/accepted-turn-source.js';
import type {
    MaintenanceMode,
    MaintenanceCommitGuard,
    MaintenanceParticipantResult,
    MaintenanceSession,
} from '../../../capabilities/maintenance/registry.js';
import { jsonValuesEqual } from '../../../host/json-values-equal.js';
import type { MapService, MapServiceView } from '../application/service.js';
import { createEmptyMapDomain } from '../../../domains/map/state.js';
import type { MapDomainEdit } from '../../../domains/map/edit.js';
import type { MapDomainV1 } from '../../../domains/map/types.js';
import { compileAtlasIntent } from '../tools/atlas-intent-compiler.js';
import { buildMapAtlasDataMessage } from '../tools/atlas-data-message.js';
import { readAtlas } from '../tools/atlas-reader.js';
import { buildMapMaintenancePrompt } from './prompt.js';
import { mapToolResult, type MapToolItemReport, type MapToolResult } from '../tools/result.js';
import { compileSceneIntent } from '../tools/scene-intent-compiler.js';
import { resolveSceneKey, sceneForTool } from '../tools/scene-reader.js';
import { MAP_MAINTENANCE_TOOLS, MAP_MAINTENANCE_TOOL_NAMES } from '../tools/tool-contract.js';
import { intentId, isRecord } from '../tools/intent-common.js';

function mapContent(domain: MapDomainV1): Pick<MapDomainV1, 'atlas' | 'scenes'> {
    return { atlas: domain.atlas, scenes: domain.scenes };
}

export function createMapMaintenanceSession(
    map: MapService,
    source: AcceptedTurnSource,
    mode: MaintenanceMode,
): MaintenanceSession {
    const current = map.readCurrent().map;
    const expectedRevision = current?.revision ?? 0;
    const original = current || createEmptyMapDomain();
    let staged = mode === 'rebuild' ? createEmptyMapDomain() : structuredClone(original);
    const initialStaged = structuredClone(staged);
    const unresolvedFailures = new Map<string, string>();
    let invalidated = false;
    let committed = false;

    const assertActive = (): void => {
        if (invalidated) { throw new Error('map_maintenance_session_invalid'); }
        if (committed) { throw new Error('map_maintenance_session_committed'); }
    };
    const hasChanges = (): boolean => (
        !jsonValuesEqual(mapContent(staged), mapContent(initialStaged))
        && !jsonValuesEqual(mapContent(staged), mapContent(original))
    );
    const acceptCompile = (
        scope: 'atlas' | 'scene',
        contextId: string,
        compiled: { domain: MapDomainV1; edits: readonly MapDomainEdit[]; result: MapToolResult },
    ): MapToolResult => {
        const callFailureKey = (context: string): string => `${scope}:${context}:call:*`;
        const failureKey = (item: Pick<MapToolItemReport, 'collection' | 'id'>): string => {
            if (!item.collection || !item.id) { return callFailureKey(contextId); }
            const collection = scope === 'scene' && (item.collection === 'elements' || item.collection === 'remove')
                ? 'element'
                : item.collection;
            return `${scope}:${contextId}:${collection}:${item.id}`;
        };
        staged = compiled.domain;
        if (compiled.result.ok) {
            unresolvedFailures.delete(callFailureKey(contextId));
            if (contextId !== '*') { unresolvedFailures.delete(callFailureKey('*')); }
        }
        for (const item of compiled.result.applied) {
            if (item.id) { unresolvedFailures.delete(failureKey(item)); }
        }
        for (const item of compiled.result.skipped) {
            unresolvedFailures.set(failureKey(item), item.reason || 'map_intent_failed');
        }
        return compiled.result;
    };

    return Object.freeze({
        participantId: 'map',
        commitPolicy: mode === 'rebuild' ? 'complete-run' : 'staged',
        prompt: buildMapMaintenancePrompt(mode),
        dataMessages: Object.freeze([{ role: 'user' as const, content: buildMapAtlasDataMessage(initialStaged) }]),
        tools: MAP_MAINTENANCE_TOOLS,
        executeTool(name: string, args: unknown) {
            assertActive();
            if (name === MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ) {
                return readAtlas(staged, args);
            }
            if (name === MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ) {
                if (!isRecord(args)) { throw new TypeError('MapSceneRead expects an object.'); }
                const unknown = Object.keys(args).filter(key => key !== 'scene');
                if (unknown.length) { throw new TypeError(`MapSceneRead has unsupported fields: ${unknown.join(', ')}.`); }
                const key = intentId(args.scene);
                if (!key) { throw new TypeError('MapSceneRead.scene is required.'); }
                const keyForScene = resolveSceneKey(staged, key);
                const scene = staged.scenes[keyForScene];
                // Domain validation guarantees one owner. Use its key on readback
                // so a scene key cannot be mistaken for another location's key.
                const owner = staged.atlas.locations.find(location => location.sceneKey === keyForScene);
                return mapToolResult({ data: { revision: staged.revision, scene: scene && owner ? sceneForTool(scene, owner) : null } });
            }
            if (name === MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT) {
                return acceptCompile('atlas', 'world', compileAtlasIntent(staged, args, source.player));
            }
            if (name === MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT) {
                const requestedScene = isRecord(args) ? intentId(args.scene, '*') : '*';
                const scene = resolveSceneKey(staged, requestedScene);
                return acceptCompile('scene', scene, compileSceneIntent(staged, args, source.player));
            }
            throw new TypeError(`Unknown map maintenance tool: ${name}`);
        },
        canCommit: () => hasChanges() && (mode !== 'rebuild' || unresolvedFailures.size === 0),
        getResult() {
            const unresolved = unresolvedFailures.size > 0;
            const changed = hasChanges() && (mode !== 'rebuild' || !unresolved);
            return Object.freeze({
                status: unresolved ? (changed ? 'partial' : 'failed') : changed ? 'updated' : 'unchanged',
                changed,
            }) as MaintenanceParticipantResult;
        },
        async commit(beforeCommit: MaintenanceCommitGuard): Promise<MapServiceView | undefined> {
            assertActive();
            if (mode === 'rebuild' && unresolvedFailures.size) { throw new Error('map_rebuild_edits_unresolved'); }
            if (!hasChanges()) { return map.readCurrent(); }
            const guard = () => {
                if (invalidated) { throw new Error('map_maintenance_session_invalid'); }
                if (!beforeCommit()) { throw new Error('map_maintenance_commit_guard_rejected'); }
            };
            guard();
            try {
                const result = await map.replaceCurrent(staged, { expectedRevision, beforeCommit: guard });
                committed = true;
                return result;
            } catch (error) {
                const record = error !== null && typeof error === 'object'
                    ? error as { code?: unknown; uncertain?: unknown }
                    : null;
                if (record?.uncertain !== true && record?.code !== 'chat_changed') { throw error; }
                committed = true;
                if (record.uncertain === true) { throw error; }
                return undefined;
            }
        },
        invalidate() { invalidated = true; },
    });
}
