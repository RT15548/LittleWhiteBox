import test from 'node:test';
import assert from 'node:assert/strict';
import { setHostRequestHeadersProvider } from '../../shared/host-request-headers.js';
import { readDesign, writeDesign } from './design.js';

// Contract (user's design notes): the document survives under a filename the
// SillyTavern files API accepts, follows a card rename and is removed with the card.
function server(t) {
    const files = new Map();
    setHostRequestHeadersProvider(() => ({}));
    t.mock.method(globalThis, 'fetch', async (url, options = {}) => {
        if (url === '/api/files/upload') {
            const { name, data } = JSON.parse(options.body);
            // validateAssetFileName in SillyTavern src/endpoints/assets.js
            if (!/^[a-zA-Z0-9_\-.]+$/.test(name)) return new Response('', { status: 400 });
            files.set(name, new TextDecoder().decode(Uint8Array.from(atob(data), char => char.charCodeAt(0))));
            return new Response('{}');
        }
        if (url === '/api/files/delete') {
            const name = JSON.parse(options.body).path.replace('user/files/', '');
            return new Response('', { status: files.delete(name) ? 200 : 404 });
        }
        const name = decodeURIComponent(new URL(url, 'http://host').pathname.replace('/user/files/', ''));
        return files.has(name) ? new Response(files.get(name)) : new Response('', { status: 404 });
    });
    return files;
}

test('design documents round-trip using accepted filenames and empty saves delete them', async t => {
    const files = server(t);
    const content = '# 解铃会\n- 已确认：两位机构女性员工 😀\n';
    assert.equal(await readDesign('解铃会.png'), null);
    await writeDesign('解铃会.png', content);
    await writeDesign('other.png', 'keep');
    assert.equal(await readDesign('解铃会.png'), content);

    await writeDesign('解铃会.png', '');
    assert.equal(await readDesign('解铃会.png'), null);
    assert.equal(await readDesign('other.png'), 'keep');
    assert.equal(files.size, 1);

    await writeDesign('other.png', '  \n');
    assert.equal(await readDesign('other.png'), null);
});
