import assert from 'node:assert/strict';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const review = new URL('../apps/game/island/production/characters/review-server.mjs', import.meta.url);

test('local review serves built-in decoder and only content-addressed sibling shared images', { timeout: 15000 }, async t => {
    const directory = await mkdtemp(join(tmpdir(), 'island-character-review-'));
    const asset = join(directory, 'person.glb'), hash = 'a'.repeat(64), other = 'b'.repeat(64);
    await mkdir(join(directory, 'shared'));
    await writeFile(asset, 'GLB fixture');
    await writeFile(join(directory, 'shared', `${hash}.png`), 'PNG bytes');
    await writeFile(join(directory, 'shared', `${other}.jpg`), 'JPEG bytes');
    await writeFile(join(directory, 'shared', 'private.png'), 'not published');
    await writeFile(join(directory, 'private.txt'), 'not published');
    const child = spawn(process.execPath, [fileURLToPath(review), '--asset', asset, '--port', '0'], { stdio: ['ignore', 'pipe', 'pipe'] });
    const exited = once(child, 'exit');
    t.after(async () => { if (child.exitCode === null && child.signalCode === null) child.kill(); await exited; await rm(directory, { recursive: true, force: true }); });
    const base = await new Promise((resolve, reject) => {
        let output = '', errors = '';
        child.stdout.on('data', data => { output += data; const match = output.match(/http:\/\/127\.0\.0\.1:\d+\//); if (match) resolve(match[0]); });
        child.stderr.on('data', data => { errors += data; });
        child.once('error', reject); child.once('exit', code => reject(new Error(`review server exited ${code}: ${errors}`)));
    });
    for (const [resource, mime, bytes] of [['model.glb', 'model/gltf-binary', 'GLB fixture'], [`shared/${hash}.png`, 'image/png', 'PNG bytes'], [`shared/${other}.jpg`, 'image/jpeg', 'JPEG bytes']]) {
        const response = await fetch(new URL(resource, base));
        assert.equal(response.status, 200); assert.equal(response.headers.get('content-type'), mime); assert.equal(await response.text(), bytes);
    }
    const decoder = await fetch(new URL('three/examples/jsm/libs/meshopt_decoder.module.js', base));
    assert.equal(decoder.status, 200); assert.match(await decoder.text(), /MeshoptDecoder/);
    const reviewJs = await fetch(new URL('review.js', base)); assert.match(await reviewJs.text(), /setMeshoptDecoder\(MeshoptDecoder\)/);
    for (const resource of ['shared/private.png', 'private.txt', 'shared/%2e%2e/private.txt', `shared/${hash}.txt`, `shared/${'c'.repeat(64)}.png`]) {
        assert.equal((await fetch(new URL(resource, base))).status, 404, resource);
    }
});
