import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import db from '../shared/session-db.js';
import { writeWorkspaceImages } from '../shared/workspace-images.js';
import { clearWorkspaceImagePreview, showWorkspaceImagePreview } from '../app-src/workspace/workspace-image-preview.js';

// Display labels are transient UI input: task/key renames update a preview's
// accessible name without renaming files or reloading the same image bytes.
test('workspace preview updates derived names while pending and loaded without recreating URLs', async t => {
    const { document } = parseHTML('<html><body><main><section></section></main></body></html>');
    const container = document.querySelector('main'), mount = document.querySelector('section');
    const revoked = [], loaded = Promise.withResolvers();
    let created = 0;
    t.mock.method(URL, 'createObjectURL', () => { created++; loaded.resolve(); return 'blob:workspace-preview'; });
    t.mock.method(URL, 'revokeObjectURL', url => revoked.push(url));
    try {
        const [file] = await writeWorkspaceImages([{ path: 'local/previews/hash.png', blob: new Blob(['image'], { type: 'image/png' }) }]);
        const original = structuredClone(file);
        showWorkspaceImagePreview(container, mount, file, 'first association');
        showWorkspaceImagePreview(container, mount, file, 'pending association');
        await loaded.promise;
        const image = mount.querySelector('img');
        assert.equal(image.alt, 'pending association');
        image.onload();
        showWorkspaceImagePreview(container, mount, file, 'renamed association');
        assert.equal(image.alt, 'renamed association');
        assert.equal(image.hidden, false);
        assert.equal(created, 1);
        assert.deepEqual(file, original);
        clearWorkspaceImagePreview(container);
        assert.deepEqual(revoked, ['blob:workspace-preview']);
    } finally { clearWorkspaceImagePreview(container); await db.delete(); }
});
