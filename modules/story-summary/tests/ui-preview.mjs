// Isolated real-UI fixture; no SillyTavern server, user chat, or model API is used.
// Run from the repository root: node modules/story-summary/tests/ui-preview.mjs
import http from 'node:http';
import { readFileSync } from 'node:fs';

const types = { html: 'text/html', css: 'text/css', js: 'text/javascript', mjs: 'text/javascript' };
const origin = 'http://127.0.0.1:18893';
http.createServer((request, response) => {
    const pathname = new URL(request.url, origin).pathname;
    if (pathname === '/') {
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end('<!doctype html><html><body style="margin:0"><iframe id="summary" src="/modules/story-summary/story-summary.html" style="display:block;border:0;width:100vw;height:100vh"></iframe><script type="module" src="/modules/story-summary/tests/maintenance-preview-host.js"></script></body></html>');
        return;
    }
    if (pathname === '/favicon.ico') {
        response.writeHead(204).end();
        return;
    }
    if ((!/^\/modules\/story-summary\/[a-zA-Z0-9_./-]+$/.test(pathname)
        && !['/core/iframe-messaging.js', '/libs/js-sha256.mjs', '/modules/agent-core/ui/dist/message-markdown.js'].includes(pathname)) || pathname.includes('..')) {
        response.writeHead(404).end();
        return;
    }
    try {
        const content = readFileSync(new URL(`../../..${pathname}`, import.meta.url));
        response.setHeader('Content-Type', `${types[pathname.split('.').at(-1)] || 'application/octet-stream'}; charset=utf-8`);
        response.end(content);
    } catch (error) {
        if (error.code !== 'ENOENT') console.error(error);
        response.writeHead(error.code === 'ENOENT' ? 404 : 500).end();
    }
}).listen(18893, '127.0.0.1', () => console.log(origin));
