import { listTavernCommunicationContacts } from '../../../../../shared/communications';
import {
    getCharacterNameFromMemoryPath,
    getTavernMemoryFile,
    isCharacterMemoryPath,
    listTavernMemoryFiles,
} from '../../../../../shared/memory-files';
import type {
    ActivatedWorldEntry,
    XbTavernContext,
} from '../../../../../shared/message-assembler';
import {
    getTavernSession,
    normalizeTavernSessionState,
} from '../../../../../shared/session-db';
import {
    normalizeTavernSessionContract,
    resolveTavernSessionContractRuntime,
} from '../../../../../shared/session-contract';
import { buildTavernStatusPanelYaml } from '../../../../../shared/status-prompt';
import { getTavernStatusStateForSession } from '../../../../../shared/status-state';
import { buildTavernSpatialStateDigest } from '../../../../../shared/structured-state';
import { listCurrentTavernTasks } from '../../../../../shared/tasks/task-service';
import { resolveTavernWorldbookAtStoryBoundary } from '../../../../runtime/anchored-worldbook';
import type { TavernGetNativeWorldInfoRuntime } from '../../../../runtime/run-once';

const TASK_KNOWN_NAME_TERMINAL_LIMIT = 12;

export interface TavernTaskPromptLayers {
    context: XbTavernContext;
    activatedWorldEntries: ActivatedWorldEntry[];
    stateMemory: string;
    status: string;
    map: string;
    knownNames: string[];
}

export async function buildTavernTaskPromptLayers(input: {
    sessionId: string;
    contextSnapshot: XbTavernContext;
    anchorOrder: number;
    getNativeWorldInfoRuntime: TavernGetNativeWorldInfoRuntime;
}): Promise<TavernTaskPromptLayers> {
    const session = await getTavernSession(input.sessionId);
    if (!session) {throw new Error('task_session_missing');}
    const sessionState = normalizeTavernSessionState(session.state || {});
    const runtime = resolveTavernSessionContractRuntime(normalizeTavernSessionContract(sessionState.contract));
    const [stateMemory, statusState, map, memoryFiles, contacts, liveTasks, terminalTasks, worldbook] = await Promise.all([
        runtime.includeMemoryFiles
            ? getTavernMemoryFile(input.sessionId, 'memory/state.md')
            : Promise.resolve(null),
        runtime.includeStatusStates
            ? getTavernStatusStateForSession(input.sessionId)
            : Promise.resolve(null),
        runtime.includeStructuredStates
            ? buildTavernSpatialStateDigest(input.sessionId)
            : Promise.resolve(''),
        runtime.includeMemoryFiles
            ? listTavernMemoryFiles(input.sessionId)
            : Promise.resolve([]),
        listTavernCommunicationContacts(input.sessionId),
        listCurrentTavernTasks(input.sessionId, { statuses: ['active', 'recruiting'] }),
        listCurrentTavernTasks(input.sessionId, {
            statuses: ['completed', 'failed', 'cancelled'],
            limit: TASK_KNOWN_NAME_TERMINAL_LIMIT,
        }),
        resolveTavernWorldbookAtStoryBoundary({
            sessionId: input.sessionId,
            contextSnapshot: input.contextSnapshot,
            throughOrder: input.anchorOrder - 1,
            getNativeWorldInfoRuntime: input.getNativeWorldInfoRuntime,
        }),
    ]);
    const knownNames = [
        input.contextSnapshot.user?.name,
        input.contextSnapshot.character?.name,
        ...contacts.map((contact) => contact.name),
        ...[...liveTasks, ...terminalTasks].flatMap((task) => [
            task.issuer.kind === 'world' ? task.issuer.name : '',
            task.assignee?.kind === 'world' ? task.assignee.name : '',
        ]),
        ...memoryFiles
            .filter((file) => isCharacterMemoryPath(file.path))
            .map((file) => getCharacterNameFromMemoryPath(file.path)),
    ].map((value) => String(value || '').trim()).filter(Boolean);
    return {
        context: input.contextSnapshot,
        activatedWorldEntries: worldbook.activatedWorldEntries,
        stateMemory: String(stateMemory?.content || ''),
        status: statusState ? buildTavernStatusPanelYaml(statusState.status) : '',
        map: String(map || ''),
        knownNames: [...new Set(knownNames)],
    };
}
