import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { GALLERY_JPEG_COPY } from '../gallery-image-codec.js';

// Users must know this affects new gallery entries, not an existing-image or download conversion.
test('compression copy identifies its scope and tradeoff without a long checkbox label', () => {
    assert.equal(GALLERY_JPEG_COPY.label, '压缩新生成的图库图片');
    assert.match(GALLERY_JPEG_COPY.hint, /存入浏览器图库时/);
    assert.match(GALLERY_JPEG_COPY.hint, /JPEG/);
    assert.match(GALLERY_JPEG_COPY.hint, /已有图片不变/);
    assert.match(GALLERY_JPEG_COPY.warning, /有损/);
    assert.match(GALLERY_JPEG_COPY.warning, /透明背景变白/);
});

for (const [page, checkboxId] of [
    ['novelai/novel-draw', 'nd_save_as_jpeg'],
    ['sd-webui/sd-draw', 'sd-gallery-save-as-jpeg'],
    ['comfyui/comfy-draw', 'comfy-gallery-save-as-jpeg'],
]) {
    test(`${page}: compression has a short label and a separate accessible visible hint`, () => {
        const source = readFileSync(new URL(`../../providers/${page}.html`, import.meta.url), 'utf8');
        const { document } = parseHTML(source);
        const checkbox = document.getElementById(checkboxId);
        assert.equal(document.querySelectorAll(`#${checkboxId}`).length, 1);
        const label = checkbox.closest('label');
        assert.ok(label.querySelector('[data-gallery-jpeg-label]'));
        const hint = document.getElementById(checkbox.getAttribute('aria-describedby'));
        assert.ok(hint.hasAttribute('data-gallery-jpeg-hint'));
        assert.equal(hint.closest('[hidden]'), null);
        assert.equal(label.contains(hint), false);
        assert.ok(label.parentElement.contains(hint));
        assert.equal(document.querySelectorAll('[data-gallery-jpeg-hint]').length, 1);
    });
}
