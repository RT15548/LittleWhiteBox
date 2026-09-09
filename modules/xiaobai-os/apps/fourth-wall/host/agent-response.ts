import type { XiaobaiOsAgentGateway } from '../../../capabilities/agent/gateway.js';
import type { FourthWallGenerationResult } from '../types.js';
import { buildFourthWallAgentRequest } from '../domain/agent-request.js';
import type { FourthWallGenerateOptions, FourthWallGenerateResponse } from './generation-runtime.js';

export function createFourthWallAgentResponse(
    gateway: XiaobaiOsAgentGateway,
): FourthWallGenerateResponse {
    return async (options: FourthWallGenerateOptions): Promise<FourthWallGenerationResult> => {
        const result = await gateway.run({
            config: options.config,
            ...buildFourthWallAgentRequest(options.builtPrompt, options.disableAssistantPrefill),
            signal: options.signal,
            onStreamProgress: options.stream
                ? (snapshot) => options.onStreamProgress?.(snapshot as FourthWallGenerationResult)
                : undefined,
        });
        return {
            text: String(result.text || ''),
            thoughts: Array.isArray(result.thoughts)
                ? result.thoughts as FourthWallGenerationResult['thoughts']
                : [],
            provider: String(result.provider || ''),
            model: String(result.model || ''),
            finishReason: String(result.finishReason || ''),
        };
    };
}
