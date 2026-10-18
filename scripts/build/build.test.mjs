import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { transform } from 'esbuild';
import { root } from './browser-entries.mjs';
import { publishBuild } from './publish.mjs';
import { compareBuild } from './artifacts.mjs';
import os from 'node:os';
import { parseHTML } from 'linkedom';

test('total artifact comparison rejects stale, missing and obsolete outputs without changing installed files', t => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lwb-compare-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    const installed = path.join(directory, 'installed'), stage = path.join(directory, 'stage');
    const files = ['dist/entry.js', 'server/vendor/runtime.cjs', 'server/vendor/LICENSE.txt'];
    for (const location of [installed, stage]) for (const file of files) {
        fs.mkdirSync(path.dirname(path.join(location, file)), { recursive: true });
        fs.writeFileSync(path.join(location, file), 'current');
    }
    compareBuild(installed, stage);
    for (const file of files) {
        const target = path.join(installed, file);
        fs.writeFileSync(target, 'stale');
        assert.throws(() => compareBuild(installed, stage), { code: 'BUILD_ARTIFACT_STALE' });
        assert.equal(fs.readFileSync(target, 'utf8'), 'stale');
        fs.unlinkSync(target);
        assert.throws(() => compareBuild(installed, stage), { code: 'BUILD_ARTIFACT_STALE' });
        assert.equal(fs.existsSync(target), false);
        fs.writeFileSync(target, 'current');
    }
    fs.writeFileSync(path.join(installed, 'dist/obsolete.js'), 'obsolete');
    assert.throws(() => compareBuild(installed, stage), { code: 'BUILD_ARTIFACT_OBSOLETE' });
    assert.equal(fs.readFileSync(path.join(installed, 'dist/obsolete.js'), 'utf8'), 'obsolete');
});

test('a failed multi-target publication restores every installed output', t => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lwb-publish-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    const installed = path.join(directory, 'installed'), stage = path.join(directory, 'stage');
    for (const location of [installed, stage]) {
        fs.mkdirSync(path.join(location, 'dist'), { recursive: true });
        fs.writeFileSync(path.join(location, 'dist/entry.js'), location);
        fs.writeFileSync(path.join(location, 'identity.js'), location);
    }
    let failed = false;
    assert.throws(() => publishBuild(installed, stage, path.join(directory, 'previous'), ['dist', 'identity.js'], (a, b) => {
        if (!failed && a === path.join(stage, 'identity.js')) { failed = true; throw new Error('disk failure'); }
        fs.renameSync(a, b);
    }), /disk failure/);
    for (const file of ['dist/entry.js', 'identity.js']) assert.equal(fs.readFileSync(path.join(installed, file), 'utf8'), installed);
});

test('opening an application does not statically start the host or another application', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'dist/manifest.json')));
    const reachable = start => {
        const seen = new Set();
        const visit = file => { if (seen.has(file)) return; seen.add(file); manifest.resources[file]?.imports.forEach(visit); };
        visit(manifest.entries[start].file); return seen;
    };
    for (const app of ['apps/assistant', 'apps/ebook', 'apps/tavern', 'apps/xiaobai-os']) {
        const files = reachable(app);
        assert.equal(files.has(manifest.entries['host/plugin'].file), false, `${app} starts host`);
        for (const other of ['apps/assistant', 'apps/ebook', 'apps/tavern', 'apps/xiaobai-os']) {
            if (other !== app) assert.equal(files.has(manifest.entries[other].file), false, `${app} starts ${other}`);
        }
    }
});

test('resource loading uses the installed directory, shares manifest work, and surfaces failures', async () => {
    const savedFetch = globalThis.fetch;
    const savedLocation = globalThis.location;
    globalThis.location = { origin: 'http://test.local' };
    const source = fs.readFileSync(path.join(root, 'core/build-assets.js'), 'utf8');
    const result = await transform(source, { format: 'esm', define: { 'import.meta.url': JSON.stringify('http://test.local/scripts/extensions/third-party/Renamed/core/build-assets.js') } });
    // eslint-disable-next-line no-unsanitized/method -- Executes only this test's transformed local source fixture.
    const loader = await import(`data:text/javascript;base64,${Buffer.from(result.code).toString('base64')}`);
    let requests = 0;
    globalThis.fetch = async () => { requests++; return { ok: false, status: 503 }; };
    try {
        await assert.rejects(loader.readBuildManifest());
        globalThis.fetch = async url => {
            requests++;
            assert.match(url, /\/Renamed\/dist\/manifest.json$/);
            return { ok: true, json: async () => ({ entries: { app: { file: 'apps/app-hash.js', css: [] } } }) };
        };
        const [a, b] = await Promise.all([loader.buildEntry('app'), loader.buildEntry('app')]);
        assert.deepEqual(a, b);
        assert.equal(requests, 2);
        assert.equal(a.file, 'http://test.local/scripts/extensions/third-party/Renamed/dist/apps/app-hash.js');
        await assert.rejects(loader.buildEntry('missing'));
    } finally { globalThis.fetch = savedFetch; globalThis.location = savedLocation; }
});

test('stale running chunks reject a different build and a later explicit attempt can recover', async t => {
    const savedFetch = globalThis.fetch;
    t.after(() => { globalThis.fetch = savedFetch; });
    const source = fs.readFileSync(path.join(root, 'core/build-assets.js'), 'utf8');
    const result = await transform(source, { format: 'esm', define: { 'import.meta.url': JSON.stringify('http://test.local/scripts/extensions/third-party/Renamed/dist/shared/loader-old.js') } });
    // eslint-disable-next-line no-unsanitized/method -- Executes only this test's transformed local source fixture.
    const loader = await import(`data:text/javascript;base64,${Buffer.from(result.code).toString('base64')}`);
    globalThis.fetch = async () => Response.json({ resources: {} });
    await assert.rejects(loader.readBuildManifest());
    globalThis.fetch = async () => Response.json({ resources: { 'shared/loader-old.js': {} } });
    assert.ok((await loader.readBuildManifest()).resources['shared/loader-old.js']);
});

test('stylesheet failure is visible and retry reattaches a sheet before application startup', async t => {
    const savedFetch = globalThis.fetch, savedDocument = globalThis.document;
    t.after(() => { globalThis.fetch = savedFetch; globalThis.document = savedDocument; });
    const { document, Event } = parseHTML('<html><head></head><body></body></html>');
    globalThis.document = document;
    globalThis.fetch = async () => Response.json({ entries: { app: { file: 'apps/app.js', css: ['assets/app.css'] } } });
    const source = fs.readFileSync(path.join(root, 'core/build-assets.js'), 'utf8');
    const result = await transform(source, { format: 'esm', define: { 'import.meta.url': JSON.stringify('http://test.local/scripts/extensions/third-party/Styles/core/build-assets.js') } });
    // eslint-disable-next-line no-unsanitized/method -- Executes only this test's transformed local source fixture.
    const loader = await import(`data:text/javascript;base64,${Buffer.from(result.code).toString('base64')}`);
    const append = document.head.appendChild.bind(document.head);
    let event = 'error';
    document.head.appendChild = node => { const value = append(node); node.dispatchEvent(new Event(event)); return value; };
    await assert.rejects(loader.loadBuildStyles('app'));
    assert.equal(document.head.querySelectorAll('link').length, 0);
    event = 'load';
    await loader.loadBuildStyles('app');
    assert.equal(document.head.querySelectorAll('link').length, 1);
});
