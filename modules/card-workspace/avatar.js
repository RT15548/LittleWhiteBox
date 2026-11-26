import { getRequestHeaders, getThumbnailUrl } from '../../../../../../script.js';
import { readWorkspaceImage } from '../assistant/shared/workspace-images.js';
import { runWithAbortDeadline } from '../../shared/common/abort-utils.js';
import { currentCard } from './host.js';
import { COPY } from './copy.js';

function targetCard(avatar) {
    const card = currentCard();
    if (card.avatar !== avatar) throw new Error(COPY.changedCard);
    return card;
}

async function decodeAvatar(blob) {
    const bitmap = await createImageBitmap(blob);
    try {
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext('2d');
        context.drawImage(bitmap, 0, 0);
        return { canvas, pixels: context.getImageData(0, 0, canvas.width, canvas.height).data };
    } finally {
        bitmap.close();
    }
}

function sameAvatar(expected, saved) {
    if (expected.canvas.width !== saved.canvas.width || expected.canvas.height !== saved.canvas.height) return false;
    const actual = new Uint32Array(saved.pixels.buffer);
    return new Uint32Array(expected.pixels.buffer).every((pixel, index) => pixel === actual[index]);
}

const AVATAR_REFRESH_TIMEOUT_MS = 5000;

async function refreshAvatars(imageUrl, avatar, signal) {
    const thumbnailUrl = getThumbnailUrl('avatar', avatar);
    const response = await fetch(thumbnailUrl, { cache: 'reload', signal });
    if (!response.ok) throw new Error(COPY.avatarRefreshFailed);
    await response.blob(); // Finish replacing the browser's cached thumbnail before reloading elements.
    signal.throwIfAborted();
    const thumbnail = new URL(thumbnailUrl, location.origin);
    for (const image of document.querySelectorAll('img[src*="/thumbnail?"], img[src*="/characters/"]')) {
        const original = image.getAttribute('src');
        let src;
        try { src = new URL(original, location.href); } catch { continue; }
        if (src.origin !== location.origin) continue;
        if (src.pathname !== imageUrl && (src.pathname !== thumbnail.pathname
            || src.searchParams.get('type') !== thumbnail.searchParams.get('type')
            || src.searchParams.get('file') !== avatar)) continue;
        // SillyTavern's click-to-zoom reads the filename after the final "=".
        image.removeAttribute('src');
        image.setAttribute('src', original);
    }
}

export async function setCardAvatar(avatar, sourcePath, signal) {
    targetCard(avatar);
    // The host endpoint strips the first ".png", then appends the extension.
    if (avatar.replace('.png', '') + '.png' !== avatar) throw new Error(COPY.avatarUnsafeFileName);
    let image;
    try {
        image = await readWorkspaceImage(sourcePath);
    } catch (cause) {
        throw new Error(COPY.avatarImageMissing, { cause });
    }
    let expected, png;
    try {
        // Give the host a static PNG it can embed card data in, even for a WebP source.
        expected = await decodeAvatar(image.blob);
        png = await new Promise(resolve => expected.canvas.toBlob(resolve, 'image/png'));
        if (!png) throw new Error(COPY.avatarImageInvalid);
    } catch (cause) {
        throw new Error(COPY.avatarImageInvalid, { cause });
    }

    const form = new FormData();
    form.set('avatar_url', avatar);
    form.set('avatar', png, 'avatar.png');
    const name = targetCard(avatar).name;
    signal?.throwIfAborted();
    const imageUrl = '/characters/' + encodeURIComponent(avatar);
    try {
        const response = await fetch('/api/characters/edit-avatar', {
            method: 'POST', headers: getRequestHeaders({ omitContentType: true }), body: form, signal,
        });
        if (!response.ok) throw new Error(COPY.avatarSaveFailed(response.status));
    } catch (cause) {
        if (cause instanceof TypeError) throw new Error(COPY.avatarUnconfirmed, { cause });
        throw cause;
    }
    // The host may return 200 even when its internal image write failed.
    try {
        const response = await fetch(imageUrl, { cache: 'reload', signal });
        if (!response.ok || !sameAvatar(expected, await decodeAvatar(await response.blob()))) {
            throw new Error(COPY.avatarUnconfirmed);
        }
    } catch (cause) {
        throw new Error(COPY.avatarUnconfirmed, { cause });
    }
    const saved = { ok: true, avatar, name, sourcePath: image.file.path };
    try {
        await runWithAbortDeadline(refreshSignal => refreshAvatars(imageUrl, avatar, refreshSignal),
            { timeoutMs: AVATAR_REFRESH_TIMEOUT_MS });
    } catch (error) {
        console.warn('[LittleWhiteBox] Avatar refresh failed', error);
        return { ...saved, previewRefreshFailed: true };
    }
    return saved;
}
