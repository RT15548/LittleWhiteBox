import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { ATTACHMENT_COPY, createAttachmentsManager } from '../app-src/attachments.js';
import { createChatUi } from '../app-src/ui/chat-ui.js';

const image = { kind: 'image', name: 'portrait.png', type: 'image/png', size: 7, dataUrl: 'data:image/png;base64,Zml4dHVyZQ==' };
const acceptedImageMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

test('disabled uploads retain user text, context and filenames without modifying the original attachments', () => {
    const manager = createAttachmentsManager({ acceptedImageMimeTypes });
    const message = { content: 'Check this portrait.', contextPrefix: 'Selected text.', attachments: [image] };
    const original = structuredClone(message);
    const enabled = manager.buildUserContentParts(message);
    const disabled = manager.buildUserContentParts(message, { imageInput: false });
    assert.equal(enabled.filter(part => part.type === 'image_url').length, 1);
    assert.ok(disabled.every(part => part.type === 'text'));
    assert.equal(disabled[0].text, enabled[0].text);
    assert.ok(disabled.some(part => part.text.includes(image.name)));
    // Image bytes are forbidden in every part of a disabled request, not just image_url.
    assert.equal(JSON.stringify(disabled).includes(image.dataUrl), false);
    assert.deepEqual(message, original);
    assert.deepEqual(manager.buildUserContentParts(message), enabled);
    assert.deepEqual(manager.buildUserContentParts({ content: message.content }, { imageInput: false }),
        manager.buildUserContentParts({ content: message.content }));
    const metadataOnly = manager.buildUserContentParts({ attachments: [{ ...image, dataUrl: '' }] }, { imageInput: false });
    assert.ok(metadataOnly.some(part => part.text.includes(image.name)));
});

test('draft and cached chat previews update the disabled notice without hiding or deleting images', t => {
    const { document } = parseHTML('<html><body><main></main><section></section></body></html>');
    const previousDocument = globalThis.document;
    globalThis.document = document;
    document.getSelection = () => ({ isCollapsed: true });
    t.after(() => { globalThis.document = previousDocument; });
    let imageInput = true;
    const state = { messages: [{ role: 'user', content: '', attachments: [image] }], draftAttachments: [image], editingMessageIndex: -1 };
    const original = structuredClone(state.messages);
    const isImageInputEnabled = () => imageInput;
    const manager = createAttachmentsManager({ state, acceptedImageMimeTypes, isImageInputEnabled });
    const ui = createChatUi({ state, normalizeAttachments: manager.normalizeAttachments, normalizeThoughtBlocks: value => value || [],
        renderAttachmentGallery: manager.renderAttachmentGallery, isImageInputEnabled });
    const chat = document.querySelector('main'), draft = document.querySelector('section');
    for (const enabled of [true, false, true]) {
        imageInput = enabled;
        manager.renderAttachmentGallery(draft, state.draftAttachments, { onRemove: index => state.draftAttachments.splice(index, 1) });
        ui.renderMessages(chat);
        for (const container of [draft, chat]) {
            assert.equal(container.querySelector('img').src, image.dataUrl);
            assert.equal(container.querySelector('img').alt, image.name);
            const notice = container.querySelector('[role="note"]');
            assert.equal(Boolean(notice), !enabled);
            if (notice) assert.equal(notice.textContent, ATTACHMENT_COPY.imageInputDisabled);
        }
        assert.deepEqual(state.messages, original);
    }
    draft.querySelector('button').click();
    imageInput = false;
    manager.renderAttachmentGallery(draft, state.draftAttachments);
    assert.equal(draft.children.length, 0);
    assert.equal(draft.style.display, 'none');
});
