import { DRAW_SLOT_COPY } from './image-record.js';

// View-only ownership. A detached card or a newer projection revokes a pending
// image load; neither image decoding nor an editor draft owns a drawing request.
const projections = new WeakMap();

function parseCard(document, html) {
    const template = document.createElement('template');
    // Only locally generated Draw card markup, never narrative/model HTML.
    // eslint-disable-next-line no-unsanitized/property
    template.innerHTML = html;
    // Template contents belong to an inert document. Decode requires an image
    // owned by the active document, even while it remains offscreen.
    return document.importNode(template.content.firstElementChild, true);
}

function syncAttributes(target, source) {
    for (const key of Object.keys(target.dataset)) if (!(key in source.dataset)) delete target.dataset[key];
    for (const [key, value] of Object.entries(source.dataset)) if (target.dataset[key] !== value) target.dataset[key] = value;
    for (const { name } of [...target.attributes]) if (!name.startsWith('data-') && !source.hasAttribute(name)) target.removeAttribute(name);
    for (const { name, value } of source.attributes) {
        if (!name.startsWith('data-') && target.getAttribute(name) !== value) target.setAttribute(name, value);
    }
}

function syncPart(parent, selector, next) {
    const current = parent.querySelector(selector);
    if (!next) { current?.remove(); return; }
    if (!current) { parent.append(next); return; }
    if (!current.isEqualNode(next)) current.replaceWith(next);
}

function statusCard(document, html, imageHtml) {
    const card = parseCard(document, html);
    if (!imageHtml) return card;
    const picture = parseCard(document, imageHtml);
    const surface = picture.querySelector('.xb-nd-img-wrap');
    const img = surface.querySelector('img');
    // A retained old picture is visual context, not the current attempt. No old
    // save/delete/navigation action may accidentally target the failed attempt.
    img.removeAttribute('data-action');
    surface.replaceChildren(img);
    const editor = card.querySelector('.xb-nd-edit');
    const status = document.createElement('div');
    status.className = 'xb-nd-status xb-nd-status-overlay';
    for (const child of [...card.childNodes]) if (child !== editor) status.append(child);
    card.style.cssText = picture.style.cssText;
    // Status-only CSS must not change the image's available width/intrinsic
    // height (even a new 1px border would move the reading anchor).
    card.style.border = picture.style.border || 'none';
    card.style.background = picture.style.background || 'none';
    // Status belongs to the picture, independently of the TAG editor layer.
    surface.append(status);
    card.prepend(surface);
    if (editor) editor.style.cssText = picture.querySelector('.xb-nd-edit').style.cssText;
    return card;
}

function commitCard(card, next, { replaceImage = false } = {}) {
    const editor = card.querySelector('.xb-nd-edit');
    const editing = editor && editor.style.display !== 'none';
    if (editing && editor.dataset.imgId === undefined) editor.dataset.imgId = card.dataset.imgId || '';
    syncAttributes(card, next);
    card.querySelector('[data-xb-image-view-error]')?.remove();
    const surface = card.querySelector('.xb-nd-img-wrap');
    const nextSurface = next.querySelector('.xb-nd-img-wrap');
    if (surface && nextSurface) {
        const img = surface.querySelector('img'), nextImg = nextSurface.querySelector('img');
        syncAttributes(surface, nextSurface);
        if (replaceImage) img.replaceWith(nextImg);
        else syncAttributes(img, nextImg);
        syncPart(surface, '.xb-nd-nav-pill', nextSurface.querySelector('.xb-nd-nav-pill'));
        syncPart(surface, '.xb-nd-status', nextSurface.querySelector('.xb-nd-status'));
    } else syncPart(card, '.xb-nd-img-wrap', nextSurface);

    const menu = card.querySelector('.xb-nd-menu-wrap');
    const nextMenu = next.querySelector('.xb-nd-menu-wrap');
    if (menu?.classList.contains('open') && nextMenu) nextMenu.classList.add('open');
    syncPart(card, '.xb-nd-menu-wrap', nextMenu);
    for (const selector of ['.xb-nd-indicator', '.xb-nd-status', '.xb-nd-failed-icon',
        '.xb-nd-failed-title', '.xb-nd-failed-desc', '.xb-nd-failed-btns']) {
        // Only top-level parts: failed controls can also belong to the status overlay.
        const oldPart = [...card.children].find(child => child.matches(selector));
        const newPart = [...next.children].find(child => child.matches(selector));
        if (!newPart) oldPart?.remove();
        else if (!oldPart) card.append(newPart);
        else if (!oldPart.isEqualNode(newPart)) oldPart.replaceWith(newPart);
    }
    const nextEditor = next.querySelector('.xb-nd-edit');
    if (editing) {
        // The open editor keeps both draft and target identity, even if this
        // slot changes version. Its save adapter checks that identity.
        syncPart(editor, '.xb-nd-edit-actions', nextEditor?.querySelector('.xb-nd-edit-actions')
            ?? editor.querySelector('.xb-nd-edit-actions'));
    } else if (nextEditor) {
        nextEditor.dataset.imgId = card.dataset.imgId || '';
        if (editor && editor.dataset.imgId === nextEditor.dataset.imgId
            && editor.querySelector('textarea')?.value === nextEditor.querySelector('textarea')?.value) {
            syncAttributes(editor, nextEditor);
        } else syncPart(card, '.xb-nd-edit', nextEditor);
    } else editor?.remove();
}

function notice(card, text, retry, role) {
    let node = card.querySelector('[data-xb-image-view-error]');
    if (!node) {
        node = card.ownerDocument.createElement('div');
        node.dataset.xbImageViewError = '';
        (card.querySelector('.xb-nd-img-wrap') || card).append(node);
    }
    const img = card.querySelector('img');
    const hasImage = img?.naturalWidth > 0;
    card.classList.toggle('xb-nd-view-empty', Boolean(img) && !hasImage);
    node.className = hasImage
        ? 'xb-nd-view-notice xb-nd-status-overlay' : 'xb-nd-view-notice';
    node.setAttribute('role', role);
    node.textContent = text;
    if (retry) {
        const button = card.ownerDocument.createElement('button');
        button.type = 'button'; button.textContent = DRAW_SLOT_COPY.reloadImage;
        button.onclick = retry;
        node.append(button);
    }
}

function reportImageCardError(card, text, retry) {
    projections.get(card)?.dispose?.();
    projections.delete(card);
    // Reading failed, not the drawing request. Settle initial hydration before
    // changing the DOM, or its observer will keep retrying this same failure.
    if (card.hasAttribute('data-xb-draw-loading') && !card.querySelector('img')) {
        card.querySelector('.xb-nd-indicator')?.remove();
    }
    card.removeAttribute('data-xb-draw-loading');
    notice(card, text, retry, 'alert');
}

export function reportImageCardReadError(card, error, retry) {
    reportImageCardError(card, `${DRAW_SLOT_COPY.imageReadFailed} ${error?.message || ''}`, retry);
}

/** Patch Draw-owned parts, never the host text or a live editor. */
export function patchImageCard(card, { html, imageHtml }, { isCurrent, retry,
    loadImage = img => img.decode() } = {}) {
    const previous = projections.get(card);
    // A repeated projection has no authority over view-local menu/edit/save
    // state. Compare only Draw's last generated input, not mutable editor HTML.
    if (previous?.html === html && previous.imageHtml === imageHtml
        && previous.imgId === card.dataset.imgId && (!previous.isCurrent || previous.isCurrent())) return;
    previous?.dispose?.();
    const next = statusCard(card.ownerDocument, html, imageHtml);
    const token = { html, imageHtml, imgId: card.dataset.imgId, isCurrent };
    projections.set(card, token);
    const current = () => {
        if (!card.isConnected || projections.get(card) !== token || card.dataset.imgId !== token.imgId) return false;
        if (!isCurrent || isCurrent()) return true;
        // Keep hydration pending for a new mounted projection (or a resumed
        // lease after editing). Only its fresh read may complete the exchange.
        projections.delete(card);
        retry?.();
        return false;
    };
    const img = card.querySelector('img'), nextImg = next.querySelector('img');
    const loadFailed = card.querySelector('[data-xb-image-view-error]');
    // A retained picture is optional context for the current attempt. Its load
    // failure must not hold task state or recovery controls behind decoding.
    if (imageHtml || !nextImg || (!loadFailed && (!img || img.getAttribute('src') === nextImg.getAttribute('src')))) {
        commitCard(card, next);
        token.imgId = card.dataset.imgId;
        // Initial mounting keeps native lazy loading. Observe the actual node,
        // including cached failures, without eagerly fetching an entire chat.
        const mounted = card.querySelector('img');
        if (mounted) {
            const failed = () => {
                if (!current()) return;
                if (imageHtml) card.classList.add('xb-nd-view-empty');
                else reportImageCardError(card, DRAW_SLOT_COPY.imageLoadFailed, retry);
            };
            mounted.addEventListener('error', failed, { once: true });
            token.dispose = () => mounted.removeEventListener('error', failed);
            if (mounted.complete && mounted.naturalWidth === 0) failed();
        }
        return;
    }
    // Never await this from result delivery/ACK. Keep the old image's intrinsic
    // dimensions until the replacement has decoded, with a separate load status.
    nextImg.loading = 'eager';
    card.setAttribute('data-xb-draw-loading', '');
    notice(card, DRAW_SLOT_COPY.loading, null, 'status');
    void Promise.resolve().then(() => loadImage(nextImg)).then(() => {
        if (current()) {
            // A successful offscreen retry does not reload an already broken
            // DOM image at the same URL. Install the decoded node in that case.
            commitCard(card, next, { replaceImage: img?.complete && img.naturalWidth === 0 });
            token.imgId = card.dataset.imgId;
        }
    }).catch(error => {
        if (!current()) return;
        console.error(DRAW_SLOT_COPY.imageLoadFailed, error);
        reportImageCardError(card, DRAW_SLOT_COPY.imageLoadFailed, retry);
    });
}
