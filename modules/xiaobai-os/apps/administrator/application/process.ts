import type { AdministratorProcessRound, AdministratorTurn } from '../domain/types.js';
import { settledOperations } from '../domain/data.js';
import { administratorToolCallKey } from './identity.js';

function rounds(turn: AdministratorTurn) {
    return turn.toolMessages.flatMap((message, messageIndex) => message.role === 'assistant' ? [{ message, messageIndex }] : []);
}
export function administratorProcessCount(turn: AdministratorTurn): number {
    return rounds(turn).length || (turn.operations.length ? 1 : 0);
}
export function administratorProcess(turn: AdministratorTurn, running = false): AdministratorProcessRound[] {
    const groups = rounds(turn);
    const visibleOperations = running ? turn.operations : settledOperations(turn.operations);
    const projectOperation = ({ id, name, target, status }: AdministratorTurn['operations'][number]) => ({ id, name, target, status });
    // Operations also exist in imported histories with no retained tool messages.
    if (!groups.length) {
        return visibleOperations.length ? [{ index: 0, text: '', tools: visibleOperations.map(projectOperation) }] : [];
    }
    // Executor IDs are run ID + ':' + the loop's call key. Reused provider call IDs stay round-scoped.
    const operations = new Map(visibleOperations.map(operation => [operation.id.slice(operation.id.indexOf(':') + 1), operation]));
    return groups.map(({ message, messageIndex }, index): AdministratorProcessRound => {
        return { index, text: String(message.content),
            tools: message.toolCalls!.map((call, callIndex) => {
                const key = administratorToolCallKey(index + 1, call.id), operation = operations.get(key);
                if (operation) { return projectOperation(operation); }
                const result = JSON.parse(String(turn.toolMessages[messageIndex + callIndex + 1].content));
                return { id: key, name: call.name, target: '', status: result.code === 'tool_not_executed' ? (running ? 'queued' : 'not-executed') : result.status };
            }),
        };
    });
}
