import http from 'node:http';
import { buildProviderFixture, fixtureProviderSettings, providerFixtures, supplierResponse } from './provider-runtime-fixture.mjs';

// In-memory production bundles injected into a separately started, disposable
// SillyTavern profile. No production extension registration or settings writes.
const bundles = new Map();
for (const provider of Object.keys(providerFixtures)) bundles.set(provider,
    await buildProviderFixture(provider, { platform: 'browser', realHost: true }));
http.createServer(async (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:51961');
    const url = new URL(request.url, 'http://127.0.0.1:51962');
    const provider = url.searchParams.get('provider');
    if (url.pathname === '/text') {
        response.setHeader('Content-Type', 'text/event-stream');
        const source = url.searchParams.get('text') || '[img: riverside] and [img: flowers]';
        const first = source.split(' and ')[0];
        response.write('data: ' + JSON.stringify({ token: first.slice(0, 2) }) + '\n\n');
        setTimeout(() => response.write('data: ' + JSON.stringify({ token: first.slice(2) }) + '\n\n'), 250);
        setTimeout(() => { response.end('data: ' + JSON.stringify({ token: ' and ' + source.split(' and ').slice(1).join(' and ') }) + '\n\n'); }, 1500);
    } else if (url.pathname === '/bundle' && bundles.has(provider)) {
        response.setHeader('Content-Type', 'text/javascript');
        response.end(bundles.get(provider));
    } else if (url.pathname === '/settings' && bundles.has(provider)) {
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ ...fixtureProviderSettings(provider), showFloorButton: true }));
    } else if (url.pathname === '/supplier' && bundles.has(provider)) {
        const result = supplierResponse(provider, url.searchParams.get('path') || '');
        response.setHeader('Content-Type', result.headers.get('Content-Type'));
        response.end(new Uint8Array(await result.arrayBuffer()));
    } else { response.statusCode = 404; response.end(); }
}).listen(51962, '127.0.0.1', () => console.log('Production-provider browser fixture: http://127.0.0.1:51962'));
