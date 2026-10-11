import type { XiaobaiOsAgentSession } from '../../../../capabilities/agent/gateway.js';
import { fault } from '../random.js';

/** Only the provider's structured capacity rejection can authorize a smaller replacement request. */
export async function runNarrativeRequest(session: XiaobaiOsAgentSession, request: Parameters<XiaobaiOsAgentSession['run']>[0]) {
    try { return await session.run(request); }
    catch (error) {
        if (request.signal?.aborted) { fault('cancelled', error); }
        const rejection = error as { code?: unknown; error?: { code?: unknown }; body?: unknown } | null;
        // Native SSE transport retains HTTP errors as a raw body rather than an SDK error object.
        let body: { error?: { code?: unknown } } | null = null;
        if (typeof rejection?.body === 'string') {
            try { body = JSON.parse(rejection.body); }
            catch { /* Non-JSON rejections retain the original provider failure below. */ }
        }
        if (rejection?.code === 'context_length_exceeded' || rejection?.error?.code === 'context_length_exceeded'
            || body?.error?.code === 'context_length_exceeded') { fault('context_capacity', error); }
        const status = error && typeof error === 'object' && 'status' in error ? error.status : null;
        fault(status === 401 || status === 403 ? 'agent_auth' : 'agent_failed', error);
    }
}
