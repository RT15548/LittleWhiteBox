import {
    tavernMemoryFilesTable,
    tavernSessionsTable,
    tavernStateDocumentsTable,
    type TavernMemoryFileRecord,
    type TavernStructuredStateDocumentRecord,
} from '../../shared/session-db';
import { normalizeTavernMemoryPath, TAVERN_SOURCE_FILE_TOOL_NAMES } from '../../shared/memory-files';
import { TAVERN_STATE_TOOL_NAMES } from '../../shared/structured-state';
import { TAVERN_STATUS_DOC_ID, TAVERN_STATUS_DOC_TYPE, TAVERN_STATUS_TOOL_NAMES } from '../../shared/status-state';

type TavernStateWriteResource =
    | { kind: 'memory'; path: string }
    | { kind: 'state'; key: string }
    | { kind: 'state-domain'; key: 'structured-state' };

export interface TavernAcceptedStateToolWrite {
    changedFiles: string[];
    changedStates: string[];
}

function stableJson(value: unknown): string {
    if (Array.isArray(value)) {return `[${value.map(stableJson).join(',')}]`;}
    if (value && typeof value === 'object') {
        return `{${Object.entries(value as Record<string, unknown>)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
            .join(',')}}`;
    }
    return JSON.stringify(value) ?? String(value);
}

function memoryFingerprint(file: TavernMemoryFileRecord | null | undefined): string {
    if (!file) {return 'missing';}
    return stableJson({
        content: file.content,
        source: file.source,
        staleFromOrder: file.staleFromOrder,
        status: file.status,
        updatedAt: file.updatedAt,
    });
}

function stateFingerprint(document: TavernStructuredStateDocumentRecord | null | undefined): string {
    if (!document) {return 'missing';}
    return stableJson({
        digest: document.digest,
        revision: document.revision,
        status: document.status,
        updatedAt: document.updatedAt,
    });
}

function structuredStateDomainFingerprint(
    documents: TavernStructuredStateDocumentRecord[],
    activeMapDocId = '',
): string {
    return stableJson({
        activeMapDocId: String(activeMapDocId || 'main'),
        documents: documents
            .filter((document) => document.docType !== TAVERN_STATUS_DOC_TYPE)
            .map((document) => ({ key: normalizeStateKey(document.docType, document.docId), version: stateFingerprint(document) }))
            .sort((left, right) => left.key.localeCompare(right.key)),
    });
}

function normalizeStateKey(docType = '', docId = ''): string {
    const type = String(docType || '').trim();
    const id = String(docId || '').trim() || 'main';
    return `${type}/${id}`;
}

function resolveToolResources(toolName = '', args: Record<string, unknown> = {}): TavernStateWriteResource[] {
    const name = String(toolName || '').trim();
    if ([TAVERN_SOURCE_FILE_TOOL_NAMES.WRITE, TAVERN_SOURCE_FILE_TOOL_NAMES.EDIT].includes(name as never)) {
        return [{ kind: 'memory', path: normalizeTavernMemoryPath(args.filePath || args.path) }];
    }
    if (name === TAVERN_STATE_TOOL_NAMES.PATCH) {
        return [{ kind: 'state-domain', key: 'structured-state' }];
    }
    if (name === TAVERN_STATE_TOOL_NAMES.EDIT_SCENE) {
        return [{ kind: 'state-domain', key: 'structured-state' }];
    }
    if ([TAVERN_STATUS_TOOL_NAMES.INIT, TAVERN_STATUS_TOOL_NAMES.PATCH].includes(name as never)) {
        return [{ kind: 'state', key: normalizeStateKey(TAVERN_STATUS_DOC_TYPE, TAVERN_STATUS_DOC_ID) }];
    }
    return [];
}

export function resolveTavernAcceptedStateToolWrite(
    toolName = '',
    args: Record<string, unknown> = {},
): TavernAcceptedStateToolWrite {
    const resources = resolveToolResources(toolName, args);
    return {
        changedFiles: resources
            .filter((resource): resource is Extract<TavernStateWriteResource, { kind: 'memory' }> => resource.kind === 'memory')
            .map((resource) => resource.path),
        changedStates: resources
            .filter((resource): resource is Extract<TavernStateWriteResource, { kind: 'state' }> => resource.kind === 'state')
            .map((resource) => resource.key),
    };
}

export interface TavernStateWriteCasTracker {
    assertCurrent(toolName: string, args: Record<string, unknown>): Promise<void>;
    acceptCurrent(toolName: string, args: Record<string, unknown>): Promise<void>;
}

export async function createTavernStateWriteCasTrackerInCurrentTransaction(
    sessionId = '',
): Promise<TavernStateWriteCasTracker> {
    const id = String(sessionId || '').trim();
    const memoryVersions = new Map<string, string>();
    const stateVersions = new Map<string, string>();
    let structuredStateDomainVersion = '';

    async function readMemoryVersion(path: string): Promise<string> {
        return memoryFingerprint(await tavernMemoryFilesTable.get([id, path]) || null);
    }

    async function readStateVersion(key: string): Promise<string> {
        const [docType, ...docIdParts] = key.split('/');
        const docId = docIdParts.join('/');
        return stateFingerprint(await tavernStateDocumentsTable.get([id, docType, docId]) || null);
    }

    async function readStructuredStateDomainVersion(): Promise<string> {
        const [documents, session] = await Promise.all([
            tavernStateDocumentsTable.where('sessionId').equals(id).toArray(),
            tavernSessionsTable.get(id),
        ]);
        return structuredStateDomainFingerprint(documents, session?.state?.activeMapDocId);
    }

    if (id) {
        const [memoryFiles, stateDocuments, session] = await Promise.all([
            tavernMemoryFilesTable.where('sessionId').equals(id).toArray(),
            tavernStateDocumentsTable.where('sessionId').equals(id).toArray(),
            tavernSessionsTable.get(id),
        ]);
        memoryFiles.forEach((file) => memoryVersions.set(file.path, memoryFingerprint(file)));
        stateDocuments.forEach((document) => stateVersions.set(normalizeStateKey(document.docType, document.docId), stateFingerprint(document)));
        structuredStateDomainVersion = structuredStateDomainFingerprint(stateDocuments, session?.state?.activeMapDocId);
    }

    async function assertResource(resource: TavernStateWriteResource): Promise<void> {
        if (resource.kind === 'memory') {
            const expected = memoryVersions.get(resource.path) || 'missing';
            if (await readMemoryVersion(resource.path) !== expected) {
                throw new Error(`manager_resource_revision_conflict:memory/${resource.path}`);
            }
            return;
        }
        if (resource.kind === 'state') {
            const expected = stateVersions.get(resource.key) || 'missing';
            if (await readStateVersion(resource.key) !== expected) {
                throw new Error(`manager_resource_revision_conflict:${resource.key}`);
            }
            return;
        }
        if (resource.kind === 'state-domain') {
            if (await readStructuredStateDomainVersion() !== structuredStateDomainVersion) {
                throw new Error('manager_resource_revision_conflict:structured-state');
            }
            return;
        }
    }

    async function acceptResource(resource: TavernStateWriteResource): Promise<void> {
        if (resource.kind === 'memory') {
            memoryVersions.set(resource.path, await readMemoryVersion(resource.path));
            return;
        }
        if (resource.kind === 'state') {
            stateVersions.set(resource.key, await readStateVersion(resource.key));
            return;
        }
        if (resource.kind === 'state-domain') {
            const documents = await tavernStateDocumentsTable.where('sessionId').equals(id).toArray();
            stateVersions.clear();
            documents.forEach((document) => stateVersions.set(normalizeStateKey(document.docType, document.docId), stateFingerprint(document)));
            structuredStateDomainVersion = await readStructuredStateDomainVersion();
            return;
        }
    }

    return {
        async assertCurrent(toolName, args) {
            for (const resource of resolveToolResources(toolName, args)) {
                await assertResource(resource);
            }
        },
        async acceptCurrent(toolName, args) {
            for (const resource of resolveToolResources(toolName, args)) {
                await acceptResource(resource);
            }
        },
    };
}

export async function createTavernStateWriteCasTracker(sessionId = ''): Promise<TavernStateWriteCasTracker> {
    return await createTavernStateWriteCasTrackerInCurrentTransaction(sessionId);
}
