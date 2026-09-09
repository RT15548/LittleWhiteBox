import { buildFourthWallAgentRequest, counterMessages } from '../domain/agent-request.js';
import { buildMemoryRequest, formatMemoryMessage } from '../domain/memory-prompt.js';
import { CONTEXT_LIMIT, SUMMARY_TRIGGER, SUMMARY_OUTPUT_LIMIT, getArchiveEnd } from '../domain/context-policy.js';
import { resolveConversationTokens } from '../../../../agent-core/runtime/context-tokens.js';
import { normalizeAgentSettings } from '../../../../agent-core/config.js';
import { resolveActiveProviderConfig } from '../../../../agent-core/provider-resolution.js';
import type { XiaobaiOsAgentGateway } from '../../../capabilities/agent/gateway.js';
import type { FourthWallBuiltPrompt, FourthWallGenerationResult, FourthWallSession, FourthWallTaskPhase } from '../types.js';

type Request = ReturnType<typeof buildMemoryRequest>;
export interface FourthWallContextService {
    prepare(options: {
        session: FourthWallSession;
        buildPrompt: (session: FourthWallSession) => FourthWallBuiltPrompt;
        disableAssistantPrefill: boolean;
        config: unknown;
        signal: AbortSignal;
        manual?: boolean;
        onPhase?: (phase: FourthWallTaskPhase) => void;
        commit: (memory: string, archivedCount: number) => Promise<void>;
    }): Promise<FourthWallBuiltPrompt>;
}

function checkSignal(signal: AbortSignal): void {
    if (signal.aborted) { throw new DOMException('已取消', 'AbortError'); }
}

function safeEnd(text: string, end: number): number {
    const code = text.charCodeAt(end - 1);
    return code >= 0xD800 && code <= 0xDBFF ? end - 1 : end;
}

/** Fits a chronological prefix, including labeled continuations of oversized messages. */
function collectBatch(session: FourthWallSession, boundary: number, index: number, offset: number, characters: number) {
    const parts: string[] = [];
    let remaining = characters;
    while (index < boundary && remaining > 0) {
        const message = session.history[index];
        const end = safeEnd(message.content, Math.min(message.content.length, offset + remaining));
        if (end <= offset && message.content.length > offset) { break; }
        parts.push(formatMemoryMessage(message, index, message.content.slice(offset, end), offset));
        remaining -= Math.max(1, end - offset);
        offset = end;
        if (offset >= message.content.length) { index++; offset = 0; }
    }
    return { source: parts.join('\n\n'), index, offset };
}

export function createFourthWallContextService(deps: {
    count: (request: Request, config: unknown, signal: AbortSignal) => Promise<number>;
    summarize: (request: Request, config: unknown, signal: AbortSignal) => Promise<FourthWallGenerationResult>;
}): FourthWallContextService {
    return {
        async prepare(options) {
            const { session, config, signal, buildPrompt, onPhase, manual = false } = options;
            const countPrompt = (prompt: FourthWallBuiltPrompt) => deps.count(
                buildFourthWallAgentRequest(prompt, options.disableAssistantPrefill), config, signal,
            );
            onPhase?.('counting');
            const initialPrompt = buildPrompt(session);
            const initialTokens = await countPrompt(initialPrompt);
            checkSignal(signal);
            const boundary = getArchiveEnd(session);
            let next = session;
            if ((manual || initialTokens >= SUMMARY_TRIGGER) && boundary > session.archivedCount) {
                onPhase?.('summarizing');
                let memory = session.memory;
                let index = session.archivedCount;
                let offset = 0;
                while (index < boundary) {
                    checkSignal(signal);
                    let characters = SUMMARY_TRIGGER * 2;
                    let batch = collectBatch(session, boundary, index, offset, characters);
                    let request = buildMemoryRequest(memory, batch.source);
                    while (await deps.count(request, config, signal) > SUMMARY_TRIGGER) {
                        checkSignal(signal);
                        characters = Math.floor(characters / 2);
                        if (characters < 2) { throw new Error('现有记忆已超出总结预算，请先在记忆面板缩短内容'); }
                        batch = collectBatch(session, boundary, index, offset, characters);
                        request = buildMemoryRequest(memory, batch.source);
                    }
                    checkSignal(signal);
                    if (batch.index === index && batch.offset === offset) { throw new Error('无法在预算内读取下一段皮下记录'); }
                    const result = await deps.summarize(request, config, signal);
                    checkSignal(signal);
                    const text = String(result.text || '').trim();
                    const finishReason = String(result.finishReason || '').trim().toLowerCase();
                    if (result.refused === true || !text || (finishReason && !['stop', 'end_turn', 'stop_sequence', 'completed'].includes(finishReason))) {
                        throw new Error('总结未完整返回，原记忆与聊天保持不变，请重试');
                    }
                    memory = text;
                    index = batch.index;
                    offset = batch.offset;
                }
                next = { ...session, memory, archivedCount: boundary };
                const reduced = await countPrompt(buildPrompt(next));
                checkSignal(signal);
                if (!manual && reduced >= initialTokens) {
                    throw new Error('本次总结没有减少上下文占用，原记忆与聊天保持不变，请重试');
                }
                onPhase?.('saving');
                await options.commit(memory, boundary);
                checkSignal(signal);
            } else if (manual) {
                throw new Error('没有可总结的较早聊天，近期原文需要保留');
            }
            const prompt = buildPrompt(next);
            if (!manual && await countPrompt(prompt) > CONTEXT_LIMIT) {
                throw new Error('上下文仍超过 158k：请减少主剧情层数、缩短记忆或过长的近期消息；保留的近期对话不会自动删除');
            }
            checkSignal(signal);
            return prompt;
        },
    };
}

export function createGatewayContextService(gateway: XiaobaiOsAgentGateway): FourthWallContextService {
    return createFourthWallContextService({
        async count(request, config, signal) {
            const providerConfig = resolveActiveProviderConfig(normalizeAgentSettings(config || {}));
            return await resolveConversationTokens({ messages: counterMessages(request), providerConfig, signal });
        },
        async summarize(request, config, signal) {
            const result = await gateway.run({
                ...request, config, signal, temperature: 0.2, maxTokens: SUMMARY_OUTPUT_LIMIT,
                reasoning: { mode: 'inherit', output: 'hide' },
            });
            return { text: String(result.text || ''), finishReason: String(result.finishReason || ''), refused: result.refused === true };
        },
    });
}
