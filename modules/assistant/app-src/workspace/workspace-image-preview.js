import { readWorkspaceImageById } from '../../shared/workspace-images.js';
import { WORKSPACE_COPY as C } from './workspace-copy.js';

const activePreviews = new WeakMap();

export function clearWorkspaceImagePreview(container) {
    const active = activePreviews.get(container);
    if (!active) return;
    activePreviews.delete(container);
    if (active.url) URL.revokeObjectURL(active.url);
}

export function showWorkspaceImagePreview(container, mount, file, displayName = file.name) {
    const previous = activePreviews.get(container);
    if (previous?.mount === mount && previous.id === file.blobId) {
        previous.displayName = displayName;
        const image = mount.querySelector('img');
        if (image) image.alt = displayName;
        return;
    }
    clearWorkspaceImagePreview(container);
    const active = { mount, id: file.blobId, url: '', displayName };
    activePreviews.set(container, active);

    const document = mount.ownerDocument;
    const notice = document.createElement('span');
    notice.setAttribute('role', 'status');
    notice.textContent = C.imageLoading;
    mount.replaceChildren(notice);
    const unavailable = () => {
        if (activePreviews.get(container) !== active) return;
        if (active.url) URL.revokeObjectURL(active.url);
        active.url = '';
        notice.textContent = C.imagePreviewFailed;
        mount.replaceChildren(notice);
    };
    const image = document.createElement('img');
    image.alt = displayName;
    image.onload = () => {
        if (activePreviews.get(container) !== active) return;
        image.hidden = false;
        mount.replaceChildren(image);
    };
    image.onerror = unavailable;
    void readWorkspaceImageById(file.blobId).then(blob => {
        if (activePreviews.get(container) !== active) return;
        active.url = URL.createObjectURL(blob);
        image.alt = active.displayName;
        // Connect before decode so supported WebViews load the image normally.
        image.hidden = true;
        mount.appendChild(image);
        image.src = active.url;
    }).catch(unavailable);
}
