// Local-only asset review. No game state, model providers, or private reference directories.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { REVIEW_COPY as c } from './review-copy.mjs';

const { values } = parseArgs({ options: { asset: { type: 'string' }, port: { type: 'string', default: '18949' } } });
if (!values.asset) throw new Error(c.assetRequired);
const directory = dirname(fileURLToPath(import.meta.url));
const asset = resolve(values.asset);
const vendor = resolve(dirname(fileURLToPath(import.meta.resolve('three'))), '..');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.glb': 'model/gltf-binary',
    '.png': 'image/png', '.jpg': 'image/jpeg' };
const files = new Map([['/', resolve(directory, 'review.html')], ['/review.js', resolve(directory, 'review.js')],
    ['/review.css', resolve(directory, 'review.css')], ['/review-copy.mjs', resolve(directory, 'review-copy.mjs')], ['/model.glb', asset]]);
const server = createServer(async (request, response) => {
    try {
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        let path = files.get(pathname);
        // Only the published, content-addressed sibling textures; never arbitrary asset-directory files.
        if (/^\/shared\/[a-f0-9]{64}\.(png|jpg)$/.test(pathname)) {
            path = resolve(dirname(asset), pathname.slice(1));
        }
        if (pathname.startsWith('/three/')) {
            const candidate = resolve(vendor, pathname.slice('/three/'.length));
            if (candidate.startsWith(vendor + sep)) path = candidate;
        }
        if (!path) { response.writeHead(404).end(); return; }
        const content = await readFile(path);
        response.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(content);
    } catch (error) {
        response.writeHead(error.code === 'ENOENT' ? 404 : 500).end(error.message);
    }
});
server.listen(Number(values.port), '127.0.0.1', () => console.info(`http://127.0.0.1:${server.address().port}/`));
