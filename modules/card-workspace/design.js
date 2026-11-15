import { getHostRequestHeaders } from '../../shared/host-request-headers.js';
import { sha256 } from '../../libs/js-sha256.mjs';
import { COPY } from './copy.js';

// One design document per character card, stored with the SillyTavern user's
// files: it follows the account across devices and is never part of a card export.
// The card avatar filename identifies the card; rename and delete follow the host events.
const fileName = avatar => `LittleWhiteBox_CardDesign_${sha256(avatar)}.md`;

function encode(content) {
    const bytes = new TextEncoder().encode(content);
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    return btoa(binary);
}

async function post(url, body, signal) {
    const response = await fetch(url, { method: 'POST', headers: await getHostRequestHeaders(), body: JSON.stringify(body), signal, cache: 'no-store' });
    if (response.status === 404 && url === '/api/files/delete') return;
    if (!response.ok) throw Object.assign(new Error(url === '/api/files/delete' ? COPY.designDeleteFailed : COPY.designWriteFailed), { status: response.status });
}

/** @returns {Promise<string | null>} null when the card has no design document. */
export async function readDesign(avatar, signal) {
    const response = await fetch(`/user/files/${fileName(avatar)}?v=${Date.now()}`, { headers: await getHostRequestHeaders(), signal, cache: 'no-store' });
    if (response.status === 404) return null;
    if (!response.ok) throw Object.assign(new Error(COPY.designReadFailed), { status: response.status });
    return response.text();
}

// The server rejects empty uploads; an emptied document means the card has none.
export async function writeDesign(avatar, content, signal) {
    if (!content.trim()) return post('/api/files/delete', { path: `user/files/${fileName(avatar)}` }, signal);
    return post('/api/files/upload', { name: fileName(avatar), data: encode(content) }, signal);
}
