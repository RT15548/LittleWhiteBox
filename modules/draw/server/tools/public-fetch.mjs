import http from 'node:http';
import https from 'node:https';
import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';

const blocked = new BlockList();
for (const [address, prefix] of [
    ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
    ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
    ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
    ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
]) blocked.addSubnet(address, prefix, 'ipv4');
for (const [address, prefix] of [['2001::', 23], ['2001:db8::', 32], ['2002::', 16], ['3fff::', 20]]) blocked.addSubnet(address, prefix, 'ipv6');
const globalV6 = new BlockList();
globalV6.addSubnet('2000::', 3, 'ipv6');
const MAX_BODY_BYTES = 4 * 1024 * 1024;
const forbiddenHeaders = new Set(['host', 'cookie', 'cookie2', 'connection', 'proxy-authorization', 'proxy-connection', 'content-length', 'transfer-encoding', 'upgrade']);

export function isPublicAddress(address) {
    const family = isIP(address);
    if (family === 4) return !blocked.check(address, 'ipv4');
    return family === 6 && globalV6.check(address, 'ipv6') && !blocked.check(address, 'ipv6');
}

export async function publicFetch(input, options = {}, { signal, resolve = lookup } = {}) {
    let url = new URL(String(input));
    let method = String(options.method || 'GET').toUpperCase();
    let body = options.body === undefined || options.body === null ? undefined : String(options.body);
    const headers = Object.fromEntries(Object.entries(options.headers || {}).map(([name, value]) => [name.toLowerCase(), String(value)]));
    if (Object.keys(headers).some(name => forbiddenHeaders.has(name))) throw new Error('Tool fetch cannot set privileged HTTP headers');
    headers['accept-encoding'] = 'identity';
    if (body && Buffer.byteLength(body) > MAX_BODY_BYTES) throw new Error('Tool fetch request is too large');
    for (let redirect = 0; redirect <= 5; redirect += 1) {
        signal?.throwIfAborted();
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Tool fetch requires a public HTTP(S) URL');
        const hostname = url.hostname.replace(/^\[|\]$/g, '');
        const addresses = isIP(hostname) ? [{ address: hostname, family: isIP(hostname) }] : await resolve(hostname, { all: true });
        if (!addresses.length || addresses.some(item => !isPublicAddress(item.address))) throw new Error('Tool fetch cannot access private or reserved networks');
        signal?.throwIfAborted();
        const selected = addresses[0];
        const response = await new Promise((resolveResponse, reject) => {
            const request = (url.protocol === 'https:' ? https : http).request(url, {
                method, headers, signal, agent: false,
                lookup(_host, lookupOptions, callback) {
                    if (lookupOptions?.all) callback(null, [selected]);
                    else callback(null, selected.address, selected.family);
                },
            }, resolveResponse);
            request.on('error', reject);
            request.end(body);
        });
        if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
            response.destroy();
            if (redirect === 5) throw new Error('Tool fetch exceeded the redirect limit');
            const next = new URL(response.headers.location, url);
            if (next.origin !== url.origin) delete headers.authorization;
            if (response.statusCode === 303 || ([301, 302].includes(response.statusCode) && method === 'POST')) {
                method = 'GET'; body = undefined; delete headers['content-type'];
            }
            url = next;
            continue;
        }
        const chunks = [];
        let bytes = 0;
        for await (const chunk of response) {
            bytes += chunk.length;
            if (bytes > MAX_BODY_BYTES) { response.destroy(); throw new Error('Tool fetch response is too large'); }
            chunks.push(chunk);
        }
        return { url: url.href, status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks).toString('utf8') };
    }
    throw new Error('Tool fetch exceeded the redirect limit');
}
