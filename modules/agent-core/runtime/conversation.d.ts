/** In-memory message shape used by the shared stream controller and history protocol. */
export interface AgentMessage extends Record<string, unknown> {
    role: string;
    content: string;
    thoughts?: { label: string; text: string }[];
    toolCalls?: { id: string; name: string; arguments: string; providerId?: string }[];
    toolCallId?: string;
    toolName?: string;
    providerPayload?: Record<string, unknown>;
    streaming?: boolean;
    error?: boolean;
}
