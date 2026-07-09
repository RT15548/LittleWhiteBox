import type { XbTavernMessage } from '../../shared/message-assembler';

export type TavernToolLoopResponse = { id?: string; name?: string; response?: unknown };

export type TavernToolLoopRequestMode =
    | 'full_prompt_round'
    | 'session_tool_response_round'
    | 'session_final_reminder_round';

export interface TavernToolLoopRequestPlan<TMessage = XbTavernMessage> {
    mode: TavernToolLoopRequestMode;
    requestMessages: TMessage[];
    toolResponses: TavernToolLoopResponse[];
    finalAnswerReminderText: string;
    supportsSessionToolLoop: boolean;
}

export function resolveTavernToolLoopRequestPlan<TMessage = XbTavernMessage>(input: {
    supportsSessionToolLoop?: boolean;
    messages?: TMessage[];
    toolResponses?: TavernToolLoopResponse[] | null;
    finalAnswerReminderText?: string;
}): TavernToolLoopRequestPlan<TMessage> {
    const supportsSessionToolLoop = input.supportsSessionToolLoop === true;
    const messages = Array.isArray(input.messages) ? input.messages : [];
    const toolResponses = Array.isArray(input.toolResponses) ? input.toolResponses : [];
    const finalAnswerReminderText = String(input.finalAnswerReminderText || '').trim();
    if (supportsSessionToolLoop && toolResponses.length) {
        return {
            mode: 'session_tool_response_round',
            requestMessages: [],
            toolResponses,
            finalAnswerReminderText: '',
            supportsSessionToolLoop,
        };
    }
    if (supportsSessionToolLoop && finalAnswerReminderText) {
        return {
            mode: 'session_final_reminder_round',
            requestMessages: [],
            toolResponses: [],
            finalAnswerReminderText,
            supportsSessionToolLoop,
        };
    }
    return {
        mode: 'full_prompt_round',
        requestMessages: messages,
        toolResponses: [],
        finalAnswerReminderText: '',
        supportsSessionToolLoop,
    };
}

export function applyTavernToolLoopRequestPlan(
    task: Record<string, unknown>,
    plan: TavernToolLoopRequestPlan<unknown>,
): Record<string, unknown> {
    delete task.messages;
    delete task.toolResponses;
    delete task.finalAnswerReminderText;
    if (plan.mode === 'full_prompt_round') {
        task.messages = plan.requestMessages;
        return task;
    }
    if (plan.mode === 'session_tool_response_round') {
        task.toolResponses = plan.toolResponses;
        return task;
    }
    if (plan.mode === 'session_final_reminder_round') {
        task.finalAnswerReminderText = plan.finalAnswerReminderText;
    }
    return task;
}

export function buildGoogleSessionToolLoopSendPayload(
    plan: TavernToolLoopRequestPlan<unknown>,
): { message: unknown } | null {
    if (plan.mode === 'session_tool_response_round') {
        return {
            message: {
                role: 'user',
                parts: plan.toolResponses
                    .filter((item) => item && item.name)
                    .map((item) => ({
                        functionResponse: {
                            name: String(item.name || ''),
                            response: item.response || {},
                        },
                    })),
            },
        };
    }
    if (plan.mode === 'session_final_reminder_round') {
        return {
            message: [{ text: plan.finalAnswerReminderText }],
        };
    }
    return null;
}
