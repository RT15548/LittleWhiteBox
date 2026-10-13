// 保存契约回归：运行真实 Provider、预设组件与 StorageFile，仅替换宿主 I/O 和 HTTP。
// 防止一次切换分两次存盘、失败污染运行态，以及保存期间覆盖另一个 API 预设。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { parseHTML } from 'linkedom';
import { StorageFile } from '../../../../core/storage-file.js';
import { buildProviderFixture, fixtureProviderSettings, providerFixtures } from './fixtures/provider-runtime-fixture.mjs';
import { normalizeNovelApiConfig } from '../../providers/novelai/novel-api-config.js';

const sources = Object.fromEntries(await Promise.all(Object.keys(providerFixtures).map(async provider =>
    [provider, await buildProviderFixture(provider, { apiSettings: true })])));

function memoryFile(initial, key = 'settings') {
    const h = { disk: { [key]: structuredClone(initial) }, writes: [], fail: false, barrier: null };
    h.storage = new StorageFile('fixture.json', { fetch: async (_url, options = {}) => {
        if (options.method !== 'POST') return Response.json(h.disk);
        const next = JSON.parse(Buffer.from(JSON.parse(options.body).data, 'base64').toString('utf8'));
        h.writes.push(next);
        if (h.barrier) await h.barrier.promise;
        if (h.fail) return new Response('', { status: 500 });
        h.disk = next;
        return Response.json({});
    } });
    return h;
}

async function until(predicate) {
    for (let n = 0; n < 100; n++) {
        if (predicate()) return;
        await new Promise(resolve => setTimeout(resolve, 5));
    }
    assert.fail('API operation did not settle');
}

async function setup(provider) {
    const { folder, name } = providerFixtures[provider];
    const config = provider === 'novelai'
        ? normalizeNovelApiConfig({ apiKey: 'fixture-first', timeout: 60000 })
        : { host: 'https://first.invalid', auth: 'fixture-first', timeout: 60000, useImageBackendJobs: false,
            ...(provider === 'comfyui' ? { connectionMode: 'direct' } : {}) };
    const second = { ...config, timeout: 90000,
        ...(provider === 'novelai' ? { apiKey: 'fixture-second', apiBaseUrl: 'https://second.invalid' }
            : { host: 'https://second.invalid', auth: 'fixture-second' }) };
    const presets = [{ id: 'one', name: 'One', config }, { id: 'two', name: 'Two', config: second }];
    const settings = { ...fixtureProviderSettings(provider), ...config, apiPresets: presets, activeApiPresetId: 'one',
        characterTags: [{ id: 'person', name: 'Alice' }], cacheDays: 7 };
    const file = memoryFile(settings, provider === 'novelai' ? 'settings' : 'config');
    const shared = provider === 'novelai' ? file : memoryFile({ timeout: 120000, cacheDays: 7 });
    const html = provider === 'novelai' ? '<iframe id="xiaobaix-novel-draw-iframe"></iframe>'
        : await readFile(new URL(`../../providers/${folder}/${name}-draw.html`, import.meta.url), 'utf8');
    const { document, window } = parseHTML(html);
    for (const select of document.querySelectorAll('select')) Object.defineProperty(select, 'value', {
        configurable: true, get() { return this.querySelector('option[selected]')?.value || this.querySelector('option')?.value || ''; },
        set(value) { for (const option of this.querySelectorAll('option')) option.toggleAttribute('selected', option.value === value); },
    });
    const replies = [];
    Object.assign(globalThis, { document, window, requestAnimationFrame: () => 1, cancelAnimationFrame() {}, confirm: () => true,
        toastr: { success() {}, error() {}, warning() {}, info() {} },
        __review: { ctx: { chat: [] }, events: new Map(), states: [], replies,
            storages: { [provider]: file.storage, novelai: shared.storage } },
    });
    // eslint-disable-next-line no-unsanitized/method -- Locally built production test bundle; no user code.
    const api = await import('data:text/javascript;base64,' + Buffer.from(sources[provider]).toString('base64'));
    api.configureFixtureSettings(settings);
    await api.loadSharedDrawSettings();
    if (provider !== 'novelai') api.mountFixtureSettings({ contentDocument: document });
    return { api, file, shared, presets, config, second, document, window, replies, name };
}

test('NovelAI switches API, active preset and shared timeout in one confirmed write; failure changes none of them', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await setup('novelai');
    const change = { type: 'SAVE_API_PRESETS', requestId: 'switch', apiPresets: h.presets,
        activeApiPresetId: 'two', config: h.second };
    h.file.barrier = Promise.withResolvers();
    const switching = h.api.handleFrameMessage({ data: change });
    await until(() => h.file.writes.length === 1);
    assert.equal(h.api.getSettings().apiKey, h.config.apiKey);
    assert.equal(h.api.getSharedDrawSettings().timeout, h.config.timeout);
    h.file.barrier.resolve();
    await switching;
    assert.equal(h.file.writes.length, 1);
    assert.equal(h.file.disk.settings.apiKey, h.second.apiKey);
    assert.equal(h.file.disk.settings.timeout, h.second.timeout);
    assert.equal(h.api.getSharedDrawSettings().timeout, h.second.timeout);
    assert.equal(h.file.disk.settings.characterTags[0].id, 'person');
    assert.equal(h.file.disk.settings.cacheDays, 7);
    assert.equal(h.replies.at(-1).state, 'success');
    const before = structuredClone(h.file.disk);
    h.file.fail = true;
    await h.api.handleFrameMessage({ data: { ...change, activeApiPresetId: 'one', config: h.config } });
    assert.deepEqual(h.file.disk, before);
    assert.equal(h.api.getSettings().apiKey, h.second.apiKey);
    assert.equal(h.api.getSettings().activeApiPresetId, 'two');
    assert.equal(h.api.getSharedDrawSettings().timeout, h.second.timeout);
    assert.equal(h.replies.at(-1).state, 'error');
    h.file.fail = false;
    await h.api.handleFrameMessage({ data: { type: 'SAVE_API_CONFIG', requestId: 'save',
        ...h.second, apiKey: 'rotated', timeout: 110000, syncApiPreset: true } });
    assert.equal(h.file.writes.length, 3);
    assert.equal(h.file.disk.settings.apiPresets[1].config.apiKey, 'rotated');
    assert.equal(h.file.disk.settings.apiPresets[1].config.timeout, 110000);
    assert.equal(h.api.getSharedDrawSettings().timeout, 110000);
    assert.equal(h.replies.at(-1).requestId, 'save');
    await h.api.updateSharedDrawSettingsPersistent(settings => { settings.cacheDays = 9; });
    assert.equal(h.file.disk.settings.apiPresets[1].config.apiKey, 'rotated');
    assert.equal(h.file.disk.settings.activeApiPresetId, 'two');
});

for (const provider of ['sdwebui', 'comfyui']) {
    test(`${provider} API operations serialize, publish only after success and leave non-API drafts untouched`, async t => {
        t.mock.method(console, 'error', () => {});
        const h = await setup(provider);
        const field = id => h.document.getElementById(`${h.name}-${id}`);
        const select = h.document.querySelector(`#${h.name}-api-presets select`);
        const status = () => h.document.querySelector(`#${h.name}-api-presets [role="status"]`).dataset.state;
        const choose = id => {
            for (const option of select.children) option.toggleAttribute('selected', option.value === id);
            select.dispatchEvent(new h.window.Event('change', { bubbles: true }));
        };
        field('draw-width').value = '768';
        h.file.barrier = Promise.withResolvers();
        choose('two');
        await until(() => h.file.writes.length === 1);
        assert.equal(field('api-form').hasAttribute('disabled'), true);
        field('draw-save').click();
        await Promise.resolve();
        assert.equal(h.file.writes.length, 1);
        assert.equal(h.api.getSettings().host, h.config.host);
        h.file.barrier.resolve();
        await until(() => status() === 'success');
        assert.equal(h.api.getSettings().host, h.second.host);
        assert.equal(field('draw-host').value, h.second.host);
        assert.equal(field('draw-width').value, '768');
        assert.equal(h.shared.writes.length, 0);
        assert.equal(h.file.disk.config.apiPresets[1].config.auth, h.second.auth);
        h.file.fail = true;
        choose('one');
        await until(() => status() === 'error');
        assert.equal(h.api.getSettings().activeApiPresetId, 'two');
        assert.equal(select.value, 'two');
        assert.equal(field('draw-host').value, h.second.host);
        assert.equal(field('api-form').hasAttribute('disabled'), false);
        h.file.fail = false;
        field('draw-auth').value = 'rotated';
        field('draw-save').click();
        await until(() => status() === 'success');
        assert.equal(h.file.disk.config.apiPresets[1].config.auth, 'rotated');
        assert.equal(h.file.disk.config.presets[0].width, 512);
        assert.equal(field('draw-width').value, '768');
        assert.equal(h.shared.writes.length, 0);
    });
}
