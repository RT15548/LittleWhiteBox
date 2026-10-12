import assert from 'node:assert/strict';
import test from 'node:test';

import { toAbsoluteMediaUrl } from '../media-url.js';

const baseUri = 'http://127.0.0.1:8000/extensions/LittleWhiteBox/index.html';

test.beforeEach(() => {
    globalThis.document = { baseURI: baseUri };
});

test.afterEach(() => {
    delete globalThis.document;
});

test('根相对 /user 路径以 document.baseURI 补全为绝对地址', () => {
    assert.equal(
        toAbsoluteMediaUrl('/user/images/char/a.png'),
        'http://127.0.0.1:8000/user/images/char/a.png',
    );
});

test('无前导斜杠与 ../ 前缀的 user 路径先规范化为站点绝对路径', () => {
    assert.equal(toAbsoluteMediaUrl('user/images/a.png'), 'http://127.0.0.1:8000/user/images/a.png');
    assert.equal(toAbsoluteMediaUrl('../user/images/a.png'), 'http://127.0.0.1:8000/user/images/a.png');
});

test('绝对地址、data URL 与空值原样返回', () => {
    assert.equal(toAbsoluteMediaUrl('https://cdn.example.com/a.png'), 'https://cdn.example.com/a.png');
    assert.equal(toAbsoluteMediaUrl('data:image/png;base64,AAAA'), 'data:image/png;base64,AAAA');
    assert.equal(toAbsoluteMediaUrl(''), '');
});
