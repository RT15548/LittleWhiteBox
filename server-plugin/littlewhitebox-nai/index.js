'use strict';

/**
 * LittleWhiteBox NovelAI 后端转发插件 (SillyTavern Server Plugin)
 *
 * 安装：把本文件夹整个放到 SillyTavern/plugins/littlewhitebox-nai/ ，
 *       在 config.yaml 中开启 enableServerPlugins: true ，然后重启 SillyTavern。
 */

const { generateImage, testConnection } = require('./novelai-client.js');

const PLUGIN_VERSION = '1.0.1';

const info = {
    id: 'littlewhitebox-nai',
    name: 'LittleWhiteBox NovelAI Backend Proxy',
    version: PLUGIN_VERSION,
    description: 'Backend passthrough for LittleWhiteBox NovelAI image generation (bypass CORS / self-signed cert).',
};

const MAX_TIMEOUT_MS = 0x7FFFFFFF;

function parseTimeout(value) {
    const timeout = Number(value);
    if (!Number.isFinite(timeout) || timeout <= 0) return null;
    return Math.min(Math.max(1, Math.round(timeout)), MAX_TIMEOUT_MS);
}

function createRequestAbortScope(req, res) {
    const controller = new AbortController();
    let cause = null;
    let timeoutId = null;
    const abort = (nextCause) => {
        if (nextCause === 'client' || cause === null) cause = nextCause;
        if (controller.signal.aborted) return;
        controller.abort();
    };
    const abortForClient = () => abort('client');
    const abortIfIncomplete = () => {
        if (!res.writableEnded) abortForClient();
    };

    req.once('aborted', abortForClient);
    res.once('close', abortIfIncomplete);
    if (req.aborted || req.destroyed || res.destroyed) abortForClient();

    return {
        signal: controller.signal,
        get cause() {
            return cause;
        },
        setDeadline(timeout) {
            timeoutId = setTimeout(() => abort('timeout'), timeout);
            timeoutId.unref?.();
        },
        dispose() {
            if (timeoutId !== null) clearTimeout(timeoutId);
            req.off('aborted', abortForClient);
            res.off('close', abortIfIncomplete);
        },
    };
}

function errorMessage(error) {
    return String(error?.message || error);
}

function sendRequestError(scope, res, error, label) {
    if (scope.cause === 'client') return;
    if (scope.cause === 'timeout') {
        return res.status(200).send({ ok: false, code: 'timeout', error: 'NovelAI request timed out' });
    }
    console.error(`[littlewhitebox-nai] ${label} error:`, error);
    return res.status(200).send({ ok: false, error: errorMessage(error) });
}

/**
 * @param {import('express').Router} router
 */
async function init(router) {
    router.get('/status', (_req, res) => {
        res.status(200).send({ ok: true, id: info.id, version: PLUGIN_VERSION });
    });

    router.post('/v1/generate-image', async (req, res) => {
        const scope = createRequestAbortScope(req, res);
        try {
            if (scope.signal.aborted) return;
            const body = req.body || {};
            const key = String(body.key || '').trim();
            const payload = body.payload;
            const timeout = parseTimeout(body.timeout);
            if (!key) return res.status(400).send({ ok: false, error: 'API key is required' });
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
                return res.status(400).send({ ok: false, error: 'payload is required' });
            }
            if (timeout === null) return res.status(400).send({ ok: false, error: 'timeout must be a positive number' });
            scope.setDeadline(timeout);

            const result = await generateImage({
                baseUrl: body.url,
                key,
                payload,
                insecure: body.insecure === true,
                signal: scope.signal,
            });

            if (!result.ok) {
                console.warn(`[littlewhitebox-nai] upstream ${result.status}: ${result.error.slice(0, 300)}`);
            }
            return res.status(200).send(result);
        } catch (error) {
            return sendRequestError(scope, res, error, 'generate-image');
        } finally {
            scope.dispose();
        }
    });

    router.post('/v1/test', async (req, res) => {
        const scope = createRequestAbortScope(req, res);
        try {
            if (scope.signal.aborted) return;
            const body = req.body || {};
            const key = String(body.key || '').trim();
            const timeout = parseTimeout(body.timeout);
            if (!key) return res.status(400).send({ ok: false, error: 'API key is required' });
            if (timeout === null) return res.status(400).send({ ok: false, error: 'timeout must be a positive number' });
            scope.setDeadline(timeout);

            const result = await testConnection({
                baseUrl: body.url,
                key,
                insecure: body.insecure === true,
                signal: scope.signal,
            });
            return res.status(200).send(result);
        } catch (error) {
            return sendRequestError(scope, res, error, 'test');
        } finally {
            scope.dispose();
        }
    });

    console.log('[littlewhitebox-nai] server plugin initialized (v' + PLUGIN_VERSION + ')');
}

module.exports = { info, init };
