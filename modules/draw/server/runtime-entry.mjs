import * as agentCore from '../../agent-core/node-entry.js';
import * as drawRuntime from '../node-entry.js';
import envelope from './draw-runs/envelope.js';
import imageService from './image-jobs/service.js';
import novelai from './providers/novelai/adapter.js';
import sdWebUi from './providers/sd-webui/adapter.js';
import comfyui from './providers/comfyui/adapter.js';
import transport from './transport.js';
import { createNodeToolHost } from './tools/host.mjs';
import hostContract from '../../../server-plugin/littlewhitebox-server/runtime-contract.js';
export { createNodeToolHost };

export { agentCore, drawRuntime };
export const abi = hostContract.RUNTIME_HOST_ABI;
export function createRuntime() {
    const adapters = Object.freeze({ novelai, 'sd-webui': sdWebUi, comfyui });
    const runtime = { ...drawRuntime,
        async executePreparedScenePlanner(prepared, options) {
            const sources = prepared.planner.customToolSources || [];
            if (!sources.length) return drawRuntime.executePreparedScenePlanner(prepared, options);
            const host = createNodeToolHost();
            try {
                const customTools = [];
                for (const source of sources) customTools.push(await host.define(source.blockId, source.code, { signal: options.signal }));
                return await drawRuntime.executePreparedScenePlanner({ ...prepared,
                    planner: { ...prepared.planner, customTools } }, { ...options, customToolHost: host });
            } finally { host.dispose(); }
        },
    };
    return Object.freeze({
        agentCore, runtime, adapters,
        envelopeValidator: envelope.createEnvelopeValidator(drawRuntime),
        normalizeImageJob: body => imageService.normalizeImageJobRequest(body, adapters),
        registerTransportRoutes: transport.registerTransportRoutes,
    });
}
