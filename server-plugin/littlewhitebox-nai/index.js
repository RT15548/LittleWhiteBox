'use strict';

/**
 * LittleWhiteBox NovelAI 后端转发插件 (SillyTavern Server Plugin)
 *
 * 作用：把 LittleWhiteBox 绘图模块的 NovelAI 图片生成请求交给 SillyTavern 后端（Node）代发，
 * 从而绕过浏览器的 CORS 限制与自签证书限制，支持第三方中转端点（如 touhounai.xyz）。
 *
 * 安装：把本文件夹整个放到 SillyTavern/plugins/littlewhitebox-nai/ ，
 *       在 config.yaml 中开启 enableServerPlugins: true ，然后重启 SillyTavern。
 *
 * 路由（由 ST 自动挂载到 /api/plugins/<id>）：
 *   GET  /api/plugins/littlewhitebox-nai/status
 *     resp: { ok:true, id, version }               —— 供前端检测插件是否就绪
 *   POST /api/plugins/littlewhitebox-nai/generate-image
 *     body: { url?, key, payload, insecure? }
 *     resp: { ok:true, base64 } 或 { ok:false, error, status }
 *   POST /api/plugins/littlewhitebox-nai/test
 *     body: { url?, key, insecure? }
 *     resp: { ok:true } 或 { ok:false, error, status }
 */

const PLUGIN_VERSION = '1.0.0';
const NOVELAI_DEFAULT_BASE_URL = 'https://image.novelai.net';

function resolveImageApi(baseUrl) {
    const raw = String(baseUrl || '').trim();
    if (!raw) return `${NOVELAI_DEFAULT_BASE_URL}/ai/generate-image`;
    const trimmed = raw.replace(/\/+$/, '');
    if (/\/ai\/generate-image$/i.test(trimmed)) return trimmed;
    return `${trimmed}/ai/generate-image`;
}

/**
 * 从 NovelAI 返回的 zip buffer 中取出第一张图片并转 base64。
 * 官方及大多数中转返回含单张 PNG 的 zip；若非 zip（个别中转直接返回裸图），退回原始二进制 base64。
 * 仅依赖 Node 内置 zlib，无第三方依赖。
 */
function extractImageBase64(buffer) {
    const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    const isZip = buf.length > 4 && buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04;
    if (!isZip) {
        return buf.toString('base64');
    }
    const zlib = require('node:zlib');
    let offset = 0;
    while (offset + 30 <= buf.length) {
        const sig = buf.readUInt32LE(offset);
        if (sig !== 0x04034b50) break;
        const method = buf.readUInt16LE(offset + 8);
        const compSize = buf.readUInt32LE(offset + 18);
        const nameLen = buf.readUInt16LE(offset + 26);
        const extraLen = buf.readUInt16LE(offset + 28);
        const nameStart = offset + 30;
        const name = buf.toString('utf8', nameStart, nameStart + nameLen).toLowerCase();
        const dataStart = nameStart + nameLen + extraLen;
        const isImage = /\.(png|jpe?g|webp)$/.test(name);
        if (isImage && compSize > 0) {
            const compData = buf.subarray(dataStart, dataStart + compSize);
            let raw;
            if (method === 0) {
                raw = compData;
            } else if (method === 8) {
                raw = zlib.inflateRawSync(compData);
            } else {
                throw new Error(`Unsupported zip compression method ${method}`);
            }
            return Buffer.from(raw).toString('base64');
        }
        if (compSize === 0) break;
        offset = dataStart + compSize;
    }
    throw new Error('No image entry found in NovelAI zip response');
}

async function doFetch(url, options, insecure) {
    // Node 18+ 自带全局 fetch。insecure=true 时临时放宽 TLS 校验（用于自签证书的第三方端点）。
    const prev = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    if (insecure) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    try {
        return await fetch(url, options);
    } finally {
        if (insecure) {
            if (prev === undefined) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
            else process.env.NODE_TLS_REJECT_UNAUTHORIZED = prev;
        }
    }
}

const info = {
    id: 'littlewhitebox-nai',
    name: 'LittleWhiteBox NovelAI Backend Proxy',
    version: PLUGIN_VERSION,
    description: 'Backend passthrough for LittleWhiteBox NovelAI image generation (bypass CORS / self-signed cert).',
};

/**
 * @param {import('express').Router} router
 */
async function init(router) {
    router.get('/status', (_req, res) => {
        res.status(200).send({ ok: true, id: info.id, version: PLUGIN_VERSION });
    });

    router.post('/generate-image', async (req, res) => {
        try {
            const body = req.body || {};
            const key = String(body.key || '').trim();
            const payload = body.payload;
            const insecure = body.insecure === true;
            if (!key) return res.status(400).send({ ok: false, error: 'API key is required' });
            if (!payload || typeof payload !== 'object') return res.status(400).send({ ok: false, error: 'payload is required' });

            const apiUrl = resolveImageApi(body.url);
            const upstream = await doFetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/zip, application/octet-stream, image/*, */*',
                },
                body: JSON.stringify(payload),
            }, insecure);

            if (!upstream.ok) {
                const text = await upstream.text().catch(() => '');
                console.warn(`[littlewhitebox-nai] upstream ${upstream.status}: ${String(text).slice(0, 300)}`);
                return res.status(200).send({ ok: false, status: upstream.status, error: text || `HTTP ${upstream.status}` });
            }

            const arrayBuf = await upstream.arrayBuffer();
            const base64 = extractImageBase64(Buffer.from(arrayBuf));
            return res.status(200).send({ ok: true, base64 });
        } catch (error) {
            console.error('[littlewhitebox-nai] generate-image error:', error);
            return res.status(200).send({ ok: false, error: String(error?.message || error) });
        }
    });

    router.post('/test', async (req, res) => {
        try {
            const body = req.body || {};
            const key = String(body.key || '').trim();
            const insecure = body.insecure === true;
            if (!key) return res.status(400).send({ ok: false, error: 'API key is required' });

            const apiUrl = resolveImageApi(body.url);
            const upstream = await doFetch(apiUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: 'test',
                    model: 'nai-diffusion-3',
                    action: 'generate',
                    parameters: { width: 64, height: 64, steps: 1, n_samples: 1 },
                }),
            }, insecure);

            // 400/402 视为“连通”（鉴权通过但参数/额度问题），401 视为 key 无效。
            if (upstream.status === 401) {
                return res.status(200).send({ ok: false, status: 401, error: 'API Key 无效' });
            }
            if (upstream.ok || upstream.status === 400 || upstream.status === 402) {
                return res.status(200).send({ ok: true });
            }
            const text = await upstream.text().catch(() => '');
            return res.status(200).send({ ok: false, status: upstream.status, error: text || `HTTP ${upstream.status}` });
        } catch (error) {
            console.error('[littlewhitebox-nai] test error:', error);
            return res.status(200).send({ ok: false, error: String(error?.message || error) });
        }
    });

    console.log('[littlewhitebox-nai] server plugin initialized (v' + PLUGIN_VERSION + ')');
}

module.exports = { info, init };
