import http from 'node:http';
import fs from 'node:fs/promises';

const server = http.createServer(async (request, response) => {
    if (request.url === '/favicon.ico') { response.writeHead(204); response.end(); return; }
    if (!['GET', 'HEAD'].includes(request.method) || !['/', '/index.html'].includes(request.url)) {
        response.writeHead(404); response.end('Not found'); return;
    }
    try {
        const content = await fs.readFile(new URL('./index.html', import.meta.url));
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        response.end(request.method === 'HEAD' ? undefined : content);
    } catch {
        response.writeHead(500); response.end('Build the demo first.');
    }
});
server.listen(0, '127.0.0.1', () => console.log(`Map demo: http://127.0.0.1:${server.address().port}`));
