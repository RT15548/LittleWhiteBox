import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeMediaUrl } from '../media-url.js';

// Frozen upload response formats from SillyTavern 1.14/1.18 clientRelativePath
// and TauriTavern v2.3.0 UserMediaService. These are host URL contracts.
test('both supported upload response formats address the host image from a nested gallery document', () => {
    const panel = 'http://localhost:8000/scripts/extensions/third-party/LittleWhiteBox/modules/draw/providers/novelai/novel-draw.html';
    for (const path of ['/user/images/AB/badname.png', 'user/images/AB/badname.png']) {
        assert.equal(new URL(normalizeMediaUrl(path), panel).href, 'http://localhost:8000/user/images/AB/badname.png');
        assert.equal(normalizeMediaUrl(normalizeMediaUrl(path)), normalizeMediaUrl(path));
    }
});

test('external, root-relative and in-memory image URLs are not rewritten', () => {
    for (const path of ['https://cdn.example.com/a.png', '/user/images/a%20b.png',
        'data:image/png;base64,AAAA', 'blob:http://localhost:8000/fixture', '']) {
        assert.equal(normalizeMediaUrl(path), path);
    }
    assert.equal(normalizeMediaUrl(null), '');
});
