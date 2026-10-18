import { getRequestHeaders } from '../../../../../../../../script.js';
import type { XiaobaiOsAgentRunRequest } from '../../agent/browser-entry.js';

type UnknownRecord = Record<string, unknown>;

export interface XiaobaiOsAgentBridge {
    configureXiaobaiOsAgent?: (options: {
        requestHeadersProvider?: (() => Record<string, string>) | null;
    }) => void;
    runXiaobaiOsAgent: (request: XiaobaiOsAgentRunRequest) => Promise<UnknownRecord>;
    openXiaobaiOsAgentSession: (providerConfig: UnknownRecord) => {
        readonly supportsSessionToolLoop: boolean;
        run: (request: Omit<XiaobaiOsAgentRunRequest, 'providerConfig'>) => Promise<UnknownRecord>;
    };
    pullXiaobaiOsAgentModels: (
        providerConfig: UnknownRecord,
        options?: { signal?: AbortSignal },
    ) => Promise<string[]>;
    testXiaobaiOsAgentConnection: (
        providerConfig: UnknownRecord,
        options?: { signal?: AbortSignal },
    ) => Promise<{ provider: string; model: string; latencyMs: number }>;
}

let bridgePromise: Promise<XiaobaiOsAgentBridge> | null = null;

export function loadXiaobaiOsAgentBridge(): Promise<XiaobaiOsAgentBridge> {
    if (!bridgePromise) {
        bridgePromise = import('../../agent/browser-entry.js')
            .then((bridge: XiaobaiOsAgentBridge) => {
                bridge.configureXiaobaiOsAgent?.({
                    requestHeadersProvider: () => getRequestHeaders?.() || {},
                });
                return bridge;
            })
            .catch((error) => {
                bridgePromise = null;
                throw error;
            });
    }
    return bridgePromise;
}
