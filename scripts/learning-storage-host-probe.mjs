import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { once } from 'node:events';
import { createSillyTavernUserJsonFilePort } from '../modules/xiaobai-os/storage/sillytavern-file-storage.js';
import { createLearningRepository } from '../modules/xiaobai-os/apps/learning/storage/repository.js';
import { LEARNING_FILENAME } from '../modules/xiaobai-os/apps/learning/storage/document.js';

// Explicit integration probe: run with --import tsx and an installed SillyTavern root.
// Uses its real upload/delete router, isolated fixture users, and loopback HTTP; never user data or credentials.
const hostRoot = path.resolve(process.argv[2] || '../../../../..');
const hostRequire = createRequire(path.join(hostRoot, 'package.json'));
function importHost(relativePath) {
    // eslint-disable-next-line no-unsanitized/method -- Explicit developer-selected local host code, never remote or model input.
    return import(pathToFileURL(path.join(hostRoot, relativePath)).href);
}
const { setConfigFilePath } = await importHost('src/util.js');
setConfigFilePath(path.join(hostRoot, 'default/config.yaml'));
const { router } = await importHost('src/endpoints/files.js');
const express = hostRequire('express');
const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'lwb-learning-host-probe-'));
globalThis.DATA_ROOT = fixtureRoot;
const { router: userRouter } = await importHost('src/users.js');
const app = express();
const users = {};
for (const name of ['a', 'b']) {
    const root = path.join(fixtureRoot, name);
    const files = path.join(root, 'user', 'files');
    await mkdir(files, { recursive: true });
    users[name] = { directories: { root, files }, profile: { handle: `probe-${name}` } };
}
let releaseUpload;
let afterUpload;
let uploadGate = null;
let uploads = 0;
app.use(express.json({ limit: '12mb' }));
app.use((request, _response, next) => { request.user = users[request.headers['x-probe-user'] || 'a']; next(); });
app.use(userRouter);
app.use('/api/files', async (request, response, next) => {
    if (request.path === '/upload') {
        uploads++;
        if (uploadGate) {
            const gate = uploadGate;
            uploadGate = null;
            await gate;
            // Resolve after the real router has synchronously replaced the file, even if the client disconnected.
            next();
            afterUpload?.();
            return;
        }
    }
    next();
});
app.use('/api/files', router);
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
let id = 0;
const repository = (user = 'a', timeout = 0) => createLearningRepository(createSillyTavernUserJsonFilePort({
    requestTimeoutMs: timeout,
    fetch: (url, options) => fetch(`${base}${url}`, options),
    getRequestHeaders: () => ({ 'X-Probe-User': user }),
}), { createId: () => `probe-${++id}` });
const profile = { language: 'en', explanationLanguage: 'zh-CN', selfAssessment: '初学',
    goal: { description: '阅读与表达', exam: null, targetLevel: null, targetDate: null }, unit: null, items: [], completions: [] };
try {
    const repo = repository();
    assert.equal((await repo.read()).document, null);
    const first = await repo.save(null, { profiles: [profile] }, () => true);
    assert.equal(first.status, 'confirmed');
    assert.deepEqual(JSON.parse(await readFile(path.join(users.a.directories.files, LEARNING_FILENAME), 'utf8')), first.document);
    assert.deepEqual((await repository().read()).document, first.document);
    assert.equal((await repository('b').read()).document, null);

    const delayed = repository('a', 50);
    await delayed.read();
    uploadGate = new Promise(resolve => { releaseUpload = resolve; });
    const landed = new Promise(resolve => { afterUpload = resolve; });
    const next = { profiles: [{ ...profile, selfAssessment: '更新自评' }] };
    assert.equal((await delayed.save(first.document, next, () => true)).status, 'unconfirmed');
    assert.equal((await delayed.read()).status, 'unconfirmed');
    assert.equal(uploads, 2);
    releaseUpload();
    await landed;
    assert.equal((await delayed.verify()).status, 'confirmed');
    assert.equal((await repository().read()).document.data.profiles[0].selfAssessment, '更新自评');

    await writeFile(path.join(users.b.directories.files, LEARNING_FILENAME), '{broken', 'utf8');
    const broken = repository('b');
    await assert.rejects(broken.read());
    await assert.rejects(broken.save(null, { profiles: [profile] }, () => true));
    assert.equal(uploads, 2);
    const deleted = await fetch(`${base}/api/files/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: `user/files/${LEARNING_FILENAME}` }) });
    assert.equal(deleted.status, 200);
    assert.equal((await repository().read()).document, null);
    console.log('Learning host probe passed: real upload/readback, fixture-user isolation, timeout/late write, reopen, corrupt-file protection, delete.');
} finally {
    releaseUpload?.();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    const absolute = path.resolve(fixtureRoot);
    assert.equal(path.dirname(absolute), path.resolve(tmpdir()), 'Refusing to clean outside the temporary directory');
    assert.match(path.basename(absolute), /^lwb-learning-host-probe-/, 'Refusing to clean an unexpected fixture directory');
    await rm(absolute, { recursive: true, force: true });
}
