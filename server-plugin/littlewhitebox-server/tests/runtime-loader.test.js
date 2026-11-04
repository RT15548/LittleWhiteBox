'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs/promises');
const path = require('node:path');
const { tmpdir } = require('node:os');
const { generateKeyPairSync, createHash, sign } = require('node:crypto');
const { createRuntimeLoader } = require('../runtime-loader.js');

async function fixture(t) {
    const root = await fs.mkdtemp(path.join(tmpdir(), 'lwb-signed-runtime-'));
    t.after(() => fs.rm(root, { recursive: true, force: true }));
    const keys = generateKeyPairSync('ed25519');
    const directory = path.join(root, 'LittleWhiteBox/dist/server');
    await fs.mkdir(directory, { recursive: true });
    const loader = createRuntimeLoader({ publicKey: keys.publicKey, globalExtensions: root });
    t.after(() => loader.close());
    async function publish(version) {
        const bytes = Buffer.from(`module.exports={abi:1,createRuntime(){return {version:${JSON.stringify(version)}}}};`);
        const runtimeId = createHash('sha256').update(bytes).digest('hex');
        const signed = { abi: 1, runtimeId };
        const descriptor = { ...signed, signature: sign(null, Buffer.from(JSON.stringify(signed)), keys.privateKey).toString('base64') };
        await fs.writeFile(path.join(directory, `runtime-${runtimeId}.cjs`), bytes);
        await fs.writeFile(path.join(directory, 'runtime.json'), JSON.stringify(descriptor));
        return descriptor;
    }
    return { loader, directory, root, publish };
}

test('one frozen loader accepts A/B/C updates while retained executions stay on their verified bytes', async t => {
    const { loader, publish } = await fixture(t);
    const a = await publish('A');
    const old = await loader.load({}, a);
    old.retain();
    const b = await publish('B');
    await assert.rejects(loader.load({}, a), { code: 'runtime_build_changed' });
    assert.equal((await loader.load({}, b)).api.version, 'B');
    const c = await publish('C');
    assert.equal((await loader.load({}, c)).api.version, 'C');
    assert.equal(old.api.version, 'A');
    assert.equal(old.references, 1);
    old.release();
    assert.equal(old.references, 0);
    await assert.rejects(loader.load({}, a), { code: 'runtime_build_changed' });
});

test('unsigned, incomplete, foreign-ABI and path-traversal runtimes cannot execute', async t => {
    const { loader, directory, publish } = await fixture(t);
    const descriptor = await publish('valid');
    await fs.appendFile(path.join(directory, `runtime-${descriptor.runtimeId}.cjs`), '\nthrow new Error("must not execute");');
    await assert.rejects(loader.load({}, descriptor), { code: 'runtime_integrity_invalid' });
    const another = await publish('another');
    await fs.writeFile(path.join(directory, 'runtime.json'), JSON.stringify({ ...another, signature: Buffer.alloc(64).toString('base64') }));
    await assert.rejects(loader.load({}, another), { code: 'runtime_signature_invalid' });
    await fs.writeFile(path.join(directory, 'runtime.json'), JSON.stringify({ ...another, abi: 999 }));
    await assert.rejects(loader.load({}, another), { code: 'runtime_build_changed' });
    for (const extensionId of ['..', '../LittleWhiteBox', 'C:\\outside', 'x:stream']) {
        await assert.rejects(loader.load({}, { extensionId }), { code: 'runtime_extension_invalid' });
    }
});

test('a broken personal installation does not silently select the global runtime', async t => {
    const { loader, root, publish } = await fixture(t);
    await publish('global');
    const personal = path.join(root, 'personal');
    await fs.mkdir(path.join(personal, 'LittleWhiteBox'), { recursive: true });
    await assert.rejects(loader.load({ user: { directories: { extensions: personal } } }));
    assert.equal((await loader.load({})).api.version, 'global');
});

test('cached verified bytes keep old tasks alive but cannot admit new work from an incomplete installation', async t => {
    const { loader, directory, publish } = await fixture(t);
    const descriptor = await publish('accepted');
    const accepted = await loader.load({}, descriptor);
    accepted.retain();
    await fs.writeFile(path.join(directory, 'runtime.json'), JSON.stringify({ ...descriptor, signature: Buffer.alloc(64).toString('base64') }));
    await assert.rejects(loader.load({}, descriptor), { code: 'runtime_signature_invalid' });
    await fs.writeFile(path.join(directory, 'runtime.json'), JSON.stringify(descriptor));
    await fs.unlink(path.join(directory, `runtime-${descriptor.runtimeId}.cjs`));
    await assert.rejects(loader.load({}, descriptor), { code: 'ENOENT' });
    assert.equal(accepted.api.version, 'accepted');
    assert.equal(accepted.references, 1);
    accepted.release();
});
