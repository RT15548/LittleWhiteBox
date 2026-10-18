import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { build } from 'vite';
import { createSourceAssetPlugin } from '../../../scripts/vite-source-assets.mjs';

function loadEntry(directory, version = '') {
    // eslint-disable-next-line no-unsanitized/method -- Only imports this test's locally built fixture, never user-supplied code.
    return import(`${pathToFileURL(path.join(directory, 'entry.mjs')).href}?build=${version}`);
}

async function fixture(t) {
    const root = await mkdtemp(path.join(os.tmpdir(), 'lwb-source-assets-'));
    t.after(() => rm(root, { recursive: true, force: true }));
    const media = path.join(root, 'feature', 'assets');
    await mkdir(media, { recursive: true });
    await mkdir(path.join(root, 'core'));
    await writeFile(path.join(root, 'core/build-assets.js'), `export const pluginAsset = value => new URL(value, ${JSON.stringify(pathToFileURL(root + path.sep).href)}).href;`);
    const image = path.join(media, '肖像 1.png'), model = path.join(media, 'person.glb');
    await writeFile(image, 'image bytes');
    await writeFile(model, 'model bytes');
    await writeFile(path.join(root, 'entry.js'), `import image from './feature/assets/肖像 1.png?url&no-inline'; export { image }; export const scene = () => import('./scene.js');`);
    await writeFile(path.join(root, 'scene.js'), `export const models = import.meta.glob('./feature/assets/*.glb', { eager: true, import: 'default', query: '?url&no-inline' });`);
    async function compile(outputDirectory) {
        return build({ configFile: false, root, logLevel: 'silent',
            plugins: [createSourceAssetPlugin({ root })],
            build: { outDir: outputDirectory, minify: false,
                lib: { entry: path.join(root, 'entry.js'), formats: ['es'], fileName: () => 'entry.mjs' },
                rollupOptions: { output: { chunkFileNames: '[name]-[hash].mjs' } } } });
    }
    return { root, image, model, compile };
}

test('production and lazy entry URLs read the original media without emitting copies, including relocated output', async t => {
    const f = await fixture(t);
    for (const out of ['dist', 'preview/nested/dist']) {
        const directory = path.join(f.root, out), result = await f.compile(directory);
        assert.ok(result.flatMap(bundle => bundle.output).every(item => item.type === 'chunk'));
        const entry = await loadEntry(directory);
        const { models } = await entry.scene();
        assert.equal(fileURLToPath(entry.image), f.image);
        assert.equal(await readFile(new URL(entry.image), 'utf8'), 'image bytes');
        const model = Object.values(models)[0];
        assert.equal(fileURLToPath(model), f.model);
        assert.equal(await readFile(new URL(model), 'utf8'), 'model bytes');
    }
});

test('changed media gets a new version URL while retaining the same source file', async t => {
    const f = await fixture(t), directory = path.join(f.root, 'dist');
    await f.compile(directory);
    const first = await loadEntry(directory, 'first');
    await writeFile(f.image, 'updated image bytes');
    await f.compile(directory);
    const second = await loadEntry(directory, 'second');
    assert.notEqual(first.image, second.image);
    assert.equal(fileURLToPath(first.image), fileURLToPath(second.image));
    assert.equal(await readFile(new URL(second.image), 'utf8'), 'updated image bytes');
});

test('a missing referenced asset fails the build instead of publishing a broken URL', async t => {
    const f = await fixture(t);
    await rm(f.image);
    await assert.rejects(f.compile(path.join(f.root, 'dist')));
});
