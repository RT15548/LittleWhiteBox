import { parseBase64Image } from '../../shared/preview-image-url.js';
import { QUICK_TEST_COPY, QUICK_TEST_PAGE_SIZE } from './quick-test-session.js';

import { createGalleryImageWindow } from '../../shared/gallery-image-window.js';

export function createQuickTestView(document, send, loadImage) {
    const el = id => document.getElementById(id);
    let items = [];
    let offset = 0;
    let hasMore = false;
    let active = true;
    const preview = el('nd_preview_img');
    const strip = el('nd_test_strip');
    const download = el('nd_test_download');
    const retry = el('nd_test_retry');
    const status = el('nd_test_storage');
    const previous = el('nd_test_previous');
    const next = el('nd_test_next');
    const reload = el('nd_test_reload');
    const imageWindow = createGalleryImageWindow({
        load: async (id, signal) => {
            const item = items.find(record => record.imgId === id);
            const record = item?.base64 || item?.savedUrl ? item : await loadImage(id, signal);
            if (item) item.mime = parseBase64Image(record?.base64)?.mime;
            return record;
        },
        onUrl: (element, url) => {
            if (element !== preview) return;
            if (!url) { download.removeAttribute('href'); return; }
            download.href = url;
            const mime = items.find(item => item.imgId === preview.dataset.imgId)?.mime;
            download.download = `${preview.dataset.imgId}.${mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : 'png'}`;
        },
    });
    const sync = () => imageWindow.sync(active ? [preview, ...strip.querySelectorAll('img')] : []);
    preview.setAttribute('data-gallery-pinned', '');
    download.textContent = QUICK_TEST_COPY.download;
    retry.textContent = QUICK_TEST_COPY.retry;
    previous.textContent = QUICK_TEST_COPY.previous;
    next.textContent = QUICK_TEST_COPY.next;
    reload.textContent = QUICK_TEST_COPY.reload;
    retry.addEventListener('click', () => send({ type: 'TEST_RETRY_SAVE', imgId: preview.dataset.imgId }));
    previous.addEventListener('click', () => send({ type: 'TEST_HISTORY', offset: Math.max(0, offset - QUICK_TEST_PAGE_SIZE) }));
    next.addEventListener('click', () => send({ type: 'TEST_HISTORY', offset: offset + QUICK_TEST_PAGE_SIZE }));
    reload.addEventListener('click', () => send({ type: 'TEST_HISTORY', offset }));

    function select(item) {
        preview.dataset.imgId = item.imgId;
        preview.dataset.galleryId = item.imgId;
        const temporary = item.persistence === 'saving' || item.persistence === 'unsaved';
        retry.hidden = !temporary;
        retry.disabled = item.persistence === 'saving';
        status.textContent = temporary ? QUICK_TEST_COPY[item.persistence] : '';
        status.hidden = !temporary;
        el('nd_open_gallery').classList.toggle('visible', !temporary);
        strip.querySelectorAll('.nd-thumb').forEach(thumb => thumb.classList.toggle('active', thumb.dataset.imgId === item.imgId));
        sync();
    }

    function render(selectedImgId) {
        const selected = items.find(item => item.imgId === (selectedImgId || preview.dataset.imgId)) || items[0];
        strip.replaceChildren();
        el('nd_preview').classList.toggle('visible', items.length > 0);
        el('nd_test_actions').hidden = !items.length;
        el('nd_test_pages').hidden = !offset && !hasMore;
        previous.disabled = !offset;
        next.disabled = !hasMore;
        for (const [index, item] of items.entries()) {
            const thumb = document.createElement('img');
            thumb.dataset.galleryId = item.imgId;
            thumb.className = 'nd-thumb';
            thumb.dataset.imgId = item.imgId;
            thumb.alt = '';
            thumb.tabIndex = 0;
            thumb.setAttribute('role', 'button');
            thumb.setAttribute('aria-label', QUICK_TEST_COPY.image(offset + index + 1));
            thumb.addEventListener('click', () => select(item));
            thumb.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(item); }
            });
            strip.append(thumb);
        }
        if (selected) select(selected);
        else {
            preview.removeAttribute('src');
            delete preview.dataset.imgId;
            delete preview.dataset.galleryId;
            download.removeAttribute('href');
            el('nd_open_gallery').classList.remove('visible');
            status.hidden = true;
        }
        sync();
    }

    return {
        handle(data) {
            if (data.type === 'TEST_STATE') el('nd_test_single').disabled = data.busy;
            else if (data.type === 'TEST_RETAINED') {
                const record = { ...data.record };
                if (record.persistence === 'saved') record.base64 = null;
                const updated = [record, ...items.filter(item => item.imgId !== record.imgId)];
                hasMore = hasMore || offset > 0 || updated.length > QUICK_TEST_PAGE_SIZE;
                items = updated.slice(0, QUICK_TEST_PAGE_SIZE);
                offset = 0;
                render(record.imgId);
            } else if (data.type === 'TEST_RESULT') {
                items = data.items || [];
                offset = data.offset || 0;
                hasMore = data.hasMore;
                reload.hidden = true;
                el('nd_test_history_error').hidden = true;
                render(data.selectedImgId);
            } else if (data.type === 'TEST_HISTORY_FAILED') {
                reload.hidden = false;
                el('nd_test_history_error').textContent = QUICK_TEST_COPY.historyFailed;
                el('nd_test_history_error').hidden = false;
            }
        },
        openGallery() {
            const record = items.find(item => item.imgId === preview.dataset.imgId);
            if (record && record.persistence !== 'unsaved' && record.persistence !== 'saving') {
                send({ type: 'OPEN_TEST_GALLERY', imgId: record.imgId });
            }
        },
        setActive(value) { active = value; sync(); },
        dispose() { imageWindow.dispose(); },
    };
}
