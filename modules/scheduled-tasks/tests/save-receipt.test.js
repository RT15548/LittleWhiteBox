import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import { setImmediate } from 'node:timers';
import { parse } from 'acorn';
import { gzipSync, strFromU8, gunzipSync } from '../../../libs/fflate.mjs';
import { observeHostSettingsSave } from '../host-settings-save.js';

// Contracts: native 1.14/1.18 serializers and compressed requests must receive
// their own actual acknowledgement, never another autosave's (silent data loss).
// HTTP 200 without result:ok must fail; observing cannot alter the host's fetch
// promise, body, response, or a later wrapper (protocol corruption).
const settings = { tasks: { globalTasks: [{ id: 'task', scriptId: 'candidate' }] } };
const matches = payload => payload?.extension_settings?.test?.tasks?.globalTasks?.[0]?.scriptId === 'candidate';
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };

function hostSave(version, compressed) {
    const url = new URL(`../../../../../../../../../SillyTavern-${version}/public/script.js`, import.meta.url);
    const source = fs.readFileSync(url, 'utf8');
    const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
    const declaration = ast.body.find(node => node.type === 'ExportNamedDeclaration' && node.declaration?.id?.name === 'saveSettings').declaration;
    const context = {
        console, settingsReady: true, TempResponseLength: { isCustomized: () => false },
        accountStorage: { getState: () => ({}) }, getWorldInfoSettings: () => ({}), getRequestHeaders: () => ({}),
        extension_settings: { test: settings }, eventSource: { emit: async () => {} }, event_types: { SETTINGS_UPDATED: 'updated' },
        toastr: { error() {} }, t: parts => parts.join(''),
        fetch: (...args) => globalThis.fetch(...args),
        compressRequest: async request => compressed ? { ...request, headers: { 'Content-Encoding': 'gzip' }, body: gzipSync(new TextEncoder().encode(request.body)) } : request,
    };
    for (const name of ['firstRun', 'currentVersion', 'name1', 'active_character', 'active_group', 'user_avatar', 'amount_gen', 'max_context', 'main_api', 'textgen_settings', 'swipes', 'horde_settings', 'power_user', 'tags', 'tag_map', 'nai_settings', 'kai_settings', 'oai_settings', 'background_settings', 'proxies', 'selected_proxy']) context[name] = null;
    return vm.runInNewContext(`(${source.slice(declaration.start, declaration.end)})`, context);
}

test('actual supported host serializers are observed without a second request', async t => {
    for (const version of ['1.14.0', '1.18.0']) for (const compressed of version === '1.18.0' ? [false, true] : [false]) {
        await t.test(`${version}/${compressed}`, async t => {
            const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
            const calls = [];
            globalThis.fetch = (input, init) => {
                calls.push(input);
                const payload = typeof init.body === 'string' ? JSON.parse(init.body) : JSON.parse(strFromU8(gunzipSync(init.body)));
                assert.equal(matches(payload), true);
                assert.ok(Object.hasOwn(payload, 'accountStorage'));
                return Promise.resolve(Response.json({ result: 'ok' }));
            };
            await observeHostSettingsSave(hostSave(version, compressed), matches);
            assert.deepEqual(calls, ['/api/settings/save']);
        });
    }
});

test('unrelated failed requests cannot settle a matching save; original promise and response remain usable', async t => {
    const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
    const gate = deferred();
    globalThis.fetch = input => input === '/api/settings/save' ? gate.promise : Promise.reject(new TypeError('unrelated'));
    const fetch = globalThis.fetch;
    let returned;
    const saving = observeHostSettingsSave(async () => {
        await assert.rejects(globalThis.fetch('/api/unrelated'), /unrelated/);
        returned = globalThis.fetch('/api/settings/save', { body: JSON.stringify({ extension_settings: { test: settings } }) });
        assert.equal(returned, gate.promise);
    }, matches);
    await new Promise(resolve => setImmediate(resolve));
    const response = Response.json({ result: 'ok' }); gate.resolve(response);
    await saving;
    assert.equal(await returned, response);
    assert.deepEqual(await response.json(), { result: 'ok' });
    assert.equal(globalThis.fetch, fetch);
});

test('false-200 errors and unrelated successful autosaves cannot be accepted', async t => {
    const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
    globalThis.fetch = (_url, init) => Promise.resolve(Response.json(matches(JSON.parse(init.body)) ? { error: 'write failed' } : { result: 'ok' }));
    await assert.rejects(observeHostSettingsSave(async () => {
        await globalThis.fetch('/api/settings/save', { body: JSON.stringify({ extension_settings: { test: { tasks: { globalTasks: [] } } } }) });
        await globalThis.fetch('/api/settings/save', { body: JSON.stringify({ extension_settings: { test: settings } }) });
    }, matches), error => error.code === 'TASK_SAVE_HTTP_FAILURE');
});

test('Request bodies and wrappers installed during a save remain intact', async t => {
    const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
    globalThis.fetch = async request => {
        assert.equal(matches(await request.json()), true);
        return Response.json({ result: 'ok' });
    };
    let later;
    await observeHostSettingsSave(async () => {
        const observed = globalThis.fetch;
        later = (...args) => observed(...args);
        globalThis.fetch = later;
        await globalThis.fetch(new Request('http://localhost/api/settings/save', { method: 'POST', body: JSON.stringify({ extension_settings: { test: settings } }) }));
    }, matches);
    assert.equal(globalThis.fetch, later);
});
