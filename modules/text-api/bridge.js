import { listTextModels, testTextConnection, connectionError } from './runtime.js';
import { TEXT_API_COPY as COPY } from './copy.js';

// Only request-local work lives here. Each owner authenticates the sending frame.
export function createTextApiRequestHandler({ getRepository, generateHost, prepare = () => {} }) {
    const running = new Map();
    return async (data, feature, reply) => {
        if (data?.type !== 'TEXT_API_REQUEST') return false;
        if (data.action === 'cancel') {
            running.get(`${feature}:${data.targetRequestId}`)?.abort();
            return true;
        }
        const key = `${feature}:${data.requestId}`;
        const controller = new AbortController();
        running.set(key, controller);
        try {
            prepare();
            let result;
            switch (data.action) {
                case 'load': result = await (await getRepository()).load(); break;
                case 'mutate': result = await (await getRepository()).mutate(feature, data.mutation); break;
                case 'models': result = await listTextModels(data.preset, { signal: controller.signal }); break;
                case 'test': result = await testTextConnection(data.preset, { signal: controller.signal }, { generateHost }); break;
                default: throw new Error(COPY.invalid);
            }
            reply({ type: 'TEXT_API_RESULT', requestId: data.requestId, result });
        } catch (error) {
            reply({ type: 'TEXT_API_RESULT', requestId: data.requestId,
                error: connectionError(error, data.preset || data.mutation?.preset).message });
        } finally { running.delete(key); }
        return true;
    };
}
