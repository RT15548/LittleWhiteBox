import type { LearningDialogueView, LearningMessageView } from '../application/message-view.js';
import type { LearningResearchFailure } from '../application/research-feedback.js';

export interface LearningProcessMetadata {
    ok?: boolean; changed?: boolean; section?: string;
    resultsCount?: number; paragraphCount?: number; dataCount?: number; failedCount?: number;
    materialsCount?: number; exercisesCount?: number; errors?: { path: string; message: string }[];
    error?: LearningResearchFailure; httpStatus?: number;
}
export interface LearningProcessTool {
    id: string; name: string; status: 'preparing' | 'running' | 'done' | 'failed' | 'cancelled' | 'not-run';
    input: LearningProcessMetadata; result: LearningProcessMetadata;
}

function metadata(content: string): LearningProcessMetadata {
    // Partial argument streams deliberately project as a plain status rather than JSON.
    try { return JSON.parse(content); } catch { return {}; }
}

/** Both spaces consume the same published transcript; completed work remains inspectable. */
export function learningProcessRounds(turn: LearningDialogueView) {
    const groups: { message: LearningMessageView; results: LearningMessageView[] }[] = [];
    for (const message of turn.messages) {
        if (message.role === 'assistant') { groups.push({ message, results: [] }); }
        else if (message.role === 'tool') { groups.at(-1)?.results.push(message); }
    }
    return groups.map(({ message, results }, index) => ({
        index: index + 1,
        text: message.toolCalls?.length ? message.content : '',
        receivedChars: message.receivedChars,
        thinking: message.hasReasoning,
        streaming: !!message.streaming,
        tools: (message.toolCalls ?? []).map(call => {
            const response = results.find(result => result.toolCallId === call.id);
            const result = metadata(response?.content ?? '');
            const live = turn.status === 'running';
            const status: LearningProcessTool['status'] = response?.error || result.ok === false ? 'failed'
                : response?.content && !response.streaming ? 'done'
                    : !live || message.error ? response ? 'cancelled' : 'not-run' : response?.streaming ? 'running' : 'preparing';
            return { id: call.id, name: call.name, status, input: metadata(call.arguments), result };
        }),
    }));
}
