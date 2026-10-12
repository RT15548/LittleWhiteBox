import { testOnlineService } from './utils/embedder.js';
import { createAbortError, throwIfSignalAborted } from '../../../shared/common/abort-utils.js';
import { SUMMARY_FEEDBACK_COPY } from '../feedback-copy.js';
import { xbLog } from '../../../core/debug-core.js';

const MODULE_ID = 'embedding-connection';
const apiIdentity = config => JSON.stringify([
    config.enabled, ...['provider', 'url', 'key', 'model'].map(field => config.embeddingApi?.[field]),
]);

// One transient initialization owns configuration synchronization, runtime
// preparation and the probe. Neither entry point is allowed to save settings.
export function createEmbeddingConnection({ synchronizeConfig, prepareRuntime, getVectorConfig, onStatus = () => {} }) {
    let active = null;
    let state = { status: 'idle', message: '' };
    let stateIdentity = null;
    const publish = (value, identity = apiIdentity(getVectorConfig())) => {
        state = value;
        stateIdentity = identity;
        onStatus(value);
    };
    const cancel = () => {
        active?.abort(createAbortError());
        publish({ status: 'idle', message: '' });
    };
    const getStatus = () => (active && !active.signal.aborted) || stateIdentity === apiIdentity(getVectorConfig())
        ? state : { status: 'idle', message: '' };

    async function test({ apiConfig = null, isCurrent = () => true } = {}) {
        cancel();
        const controller = new AbortController();
        active = controller;
        const publishTest = value => publish(value, apiConfig
            ? apiIdentity({ ...getVectorConfig(), embeddingApi: apiConfig }) : apiIdentity(getVectorConfig()));
        publishTest({ status: 'downloading', message: SUMMARY_FEEDBACK_COPY.connectionChecking });
        let identity = null;
        let stage = 'configuration';
        const assertCurrent = () => {
            throwIfSignalAborted(controller.signal);
            if (!isCurrent() || (identity !== null && identity !== apiIdentity(getVectorConfig()))) {
                throw createAbortError();
            }
        };
        const initialize = async () => {
            assertCurrent();
            const saved = await synchronizeConfig(assertCurrent);
            assertCurrent();
            const vectorConfig = saved.vector;
            if (!apiConfig && !vectorConfig.enabled) return null;
            identity = apiIdentity(vectorConfig);
            stage = 'runtime';
            await prepareRuntime(assertCurrent);
            assertCurrent();
            stage = 'embedding';
            // A manual draft is used only by this request, never installed as
            // the running configuration. Saved-settings probes are identical.
            const api = apiConfig || vectorConfig.embeddingApi;
            const result = await testOnlineService(api.provider, api, { signal: controller.signal });
            assertCurrent();
            return result;
        };
        let onAbort;
        const aborted = new Promise((_, reject) => {
            onAbort = () => reject(controller.signal.reason);
            controller.signal.addEventListener('abort', onAbort, { once: true });
        });
        try {
            // Shared storage/runtime calls may not accept a signal. Stop the
            // caller promptly; assertCurrent prevents their late publication.
            const result = await Promise.race([initialize(), aborted]);
            publishTest(result
                ? { status: 'success', message: SUMMARY_FEEDBACK_COPY.connectionReady(result.dims) }
                : { status: 'idle', message: '' });
            return result;
        } catch (cause) {
            assertCurrent();
            if (cause?.name === 'AbortError') throw cause;
            const error = new Error(`${SUMMARY_FEEDBACK_COPY.vectorInitialization[stage]} ${cause.message}`, { cause });
            error.code = 'VECTOR_INITIALIZATION_FAILED';
            error.stage = stage;
            publishTest({ status: 'error', stage, message: error.message });
            throw error;
        } finally {
            controller.signal.removeEventListener('abort', onAbort);
            if (active === controller) {
                active = null;
                if (state.status === 'downloading') publish({ status: 'idle', message: '' });
            }
        }
    }

    async function warmup({ isCurrent }) {
        // A background entry must not interrupt an explicit test or duplicate
        // an initialization already in progress for this chat.
        if (active) return null;
        try {
            return await test({ isCurrent });
        } catch (error) {
            if (error.name === 'AbortError') return null;
            console.warn(error.message, error);
            xbLog.warn(MODULE_ID, error.message, error);
            return null;
        }
    }

    return { test, warmup, cancel, getStatus };
}
