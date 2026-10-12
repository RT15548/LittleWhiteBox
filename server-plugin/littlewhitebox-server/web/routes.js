'use strict';

const { createRequestAbortScope } = require('../request-abort.js');
const { requestExaBackend, WebRequestError, EXA_BACKEND_PATH, EXA_BACKEND_CAPABILITY,
    WEB_BACKEND_ERROR_HEADER, WEB_REQUEST_BYTES } = require('./web-runtime.cjs');

function registerWebRoutes(router, { request = requestExaBackend } = {}) {
    router.post(`${EXA_BACKEND_PATH}/:operation`, async (req, res, next) => {
        res.setHeader('Cache-Control', 'no-store');
        const scope = createRequestAbortScope(req, res);
        try {
            if (scope.signal.aborted) return;
            if (!req.user?.profile?.handle) {
                throw new WebRequestError('web_backend_access_denied', { httpStatus: 403 });
            }
            if (Buffer.byteLength(JSON.stringify(req.body ?? null)) > WEB_REQUEST_BYTES) {
                throw new WebRequestError('web_backend_input_limit', { httpStatus: 413 });
            }
            const data = await request(req.params.operation, req.body, { signal: scope.signal });
            if (!scope.signal.aborted) res.status(200).send(data);
        } catch (error) {
            if (scope.signal.aborted) return;
            if (!(error instanceof WebRequestError)) return next(error);
            res.setHeader(WEB_BACKEND_ERROR_HEADER, '1');
            res.status(error.httpStatus || (error.code === 'web_backend_invalid_request' ? 400 : 502))
                .send({ code: error.code, httpStatus: error.httpStatus, detail: error.detail });
        } finally {
            scope.dispose();
        }
    });
}

module.exports = { registerWebRoutes, EXA_BACKEND_CAPABILITY };
