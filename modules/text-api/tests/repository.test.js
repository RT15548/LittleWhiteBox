import test from 'node:test';
import { Buffer } from 'node:buffer';
import assert from 'node:assert/strict';
import { StorageFile } from '../../../core/storage-file.js';
import { createTextApiRepository } from '../repository.js';
import { migrateLegacySettings } from '../migration.js';
import { applyPresetAction, resolveFeaturePreset, TEXT_API_SETTINGS_KEY as KEY, HOST_BINDING } from '../model.js';
import { assertPlannerPresetReady } from '../../ena-planner/ena-planner-api-config.js';
import { legacy, emptyPlanner } from './legacy-fixtures.js';

// Contracts: loss of settings, silent endpoint changes, or incorrect references
// are invisible to the user. Exercise storage outcomes, not UI wording.
function fixture(records = {}, localRecords = {}) {
    const files = structuredClone(records), locals = new Map(Object.entries(localRecords).map(([k, v]) => [k, JSON.stringify(v)]));
    let failedRead = '', failedWrite = '', writes = 0;
    const fetch = async (url, options = {}) => {
        if (url === '/api/files/upload') {
            const { name, data } = JSON.parse(options.body);
            if (name === failedWrite) return new Response('', { status: 503 });
            files[name] = JSON.parse(Buffer.from(data, 'base64').toString()); writes++;
            return new Response('{}');
        }
        const name = url.split('/').pop();
        if (name === failedRead) return new Response('', { status: 503 });
        return Object.hasOwn(files, name) ? new Response(JSON.stringify(files[name])) : new Response('', { status: 404 });
    };
    const create = () => {
        const options = { fetch, maxRetries: 0 };
        return createTextApiRepository({ common: new StorageFile('common', options), planner: new StorageFile('planner', options),
            outline: new StorageFile('outline', options), local: { getItem: key => locals.get(key) ?? null, setItem: (key, value) => locals.set(key, value) } });
    };
    return { create, files, locals, failRead: name => { failedRead = name; }, failWrite: name => { failedWrite = name; }, writes: () => writes };
}

test('all three legacy records keep provider identity, credentials, values and fixed numbers', () => {
    const settings = migrateLegacySettings(legacy);
    assert.deepEqual(settings.presets.map(p => [p.name, p.provider]), [
        ['默认1', 'sillytavern-google'], ['默认2', 'sillytavern-claude'], ['默认3', 'sillytavern-openai-compatible'],
    ]);
    assert.equal(settings.presets[0].temperature, 0);
    assert.equal(settings.presets[0].baseUrl, legacy.summary.api.url);
    assert.equal(settings.presets[1].customPrefix, '/v3');
    assert.equal(settings.presets[1].maxTokens, 4096);
    assert.deepEqual(settings.presets[1].sampling, { topP: { enabled: true, value: 1 } });
    assert.equal(settings.presets[2].apiKey, '');
});

test('unconfigured records do not create presets, partial records do and numbering never shifts', () => {
    const fresh = migrateLegacySettings({ planner: emptyPlanner });
    assert.equal(fresh.presets.length, 1);
    assert.equal(resolveFeaturePreset(fresh, 'summary').provider, 'sillytavern-current');
    assert.equal(fresh.bindings.outline, HOST_BINDING);
    const partial = migrateLegacySettings({ planner: emptyPlanner, outline: { globalSettings: { apiKey: 'incomplete' } } });
    assert.deepEqual(partial.presets.map(p => p.name), ['默认1', '默认3']);
    assert.equal(partial.presets[1].apiKey, 'incomplete');
    assert.equal(migrateLegacySettings({ planner: { api: { model: 'partial' } } }).presets[1].model, 'partial');
});

test('server records win over local and cleanup preserves business fields', async () => {
    const f = fixture({ common: { storySummaryPanelConfig: legacy.summary, other: 42 }, planner: { config: legacy.planner }, outline: { settings: legacy.outline } },
        { summary_panel_config: { api: { provider: 'openai', key: 'stale' }, ui: { hideSummarized: false } } });
    const settings = await f.create().load();
    assert.equal(settings.presets[0].apiKey, 'summary-key');
    assert.equal(f.files.common.other, 42);
    assert.equal(f.files.common.storySummaryPanelConfig.trigger.interval, 20);
    assert.equal(f.files.common.storySummaryPanelConfig.api, undefined);
    assert.equal(f.files.planner.config.api, undefined);
    assert.deepEqual(f.files.planner.config.promptBlocks, legacy.planner.promptBlocks);
    assert.deepEqual(f.files.outline.settings.globalSettings, { mode: 'assist' });
    assert.equal(JSON.parse(f.locals.get('summary_panel_config')).api, undefined);
    const writes = f.writes();
    assert.deepEqual(await f.create().load(), settings);
    assert.equal(f.writes(), writes);
});

test('confirmed server absence migrates local records but a read failure never substitutes local', async () => {
    const f = fixture({}, { summary_panel_config: legacy.summary, LittleWhiteBox_StoryOutline_GlobalSettings: legacy.outline.globalSettings,
        LittleWhiteBox_StoryOutline_CommSettings: legacy.outline.commSettings });
    f.failRead('common');
    const repository = f.create();
    await assert.rejects(repository.load());
    assert.equal(f.writes(), 0);
    assert.equal(JSON.parse(f.locals.get('summary_panel_config')).api.key, 'summary-key');
    f.failRead('');
    const saved = await repository.load();
    assert.deepEqual(saved.presets.map(p => p.name), ['默认1', '默认3']);
});

test('failed first write leaves all originals untouched and retry succeeds', async () => {
    const originals = { common: { storySummaryPanelConfig: legacy.summary }, planner: { config: legacy.planner }, outline: { settings: legacy.outline } };
    const f = fixture(originals); f.failWrite('common');
    const repository = f.create();
    await assert.rejects(repository.load()); assert.deepEqual(f.files, originals);
    f.failWrite(''); await repository.load(); assert.ok(f.files.common[KEY]);
});

test('restart after new entity saved resumes cleanup without reimporting deleted presets', async () => {
    const settings = migrateLegacySettings(legacy);
    const next = applyPresetAction(settings, 'summary', { type: 'delete', id: 'planner-default' });
    const f = fixture({ common: { [KEY]: next, storySummaryPanelConfig: legacy.summary }, planner: { config: legacy.planner }, outline: { settings: legacy.outline } });
    f.failWrite('planner'); await assert.rejects(f.create().load());
    assert.equal(f.files.planner.config.api.apiKey, 'planner-key');
    f.failWrite(''); const recovered = await f.create().load();
    assert.deepEqual(recovered, next);
    assert.deepEqual(recovered.presets.map(p => p.name), ['默认1', '默认3']);
});

test('rename and delete preserve IDs, remap every affected reference to one neighbor, never delete last', () => {
    const settings = migrateLegacySettings(legacy);
    settings.bindings.summary = settings.bindings.outline = 'planner-default';
    const renamed = applyPresetAction(settings, 'summary', { type: 'rename', id: 'planner-default', name: 'Gemini' });
    assert.deepEqual(renamed.bindings, settings.bindings);
    assert.equal(renamed.presets[1].apiKey, settings.presets[1].apiKey);
    assert.throws(() => applyPresetAction(renamed, 'summary', { type: 'rename', id: 'planner-default', name: '默认1' }));
    const deleted = applyPresetAction(renamed, 'summary', { type: 'delete', id: 'planner-default' });
    assert.deepEqual(Object.values(deleted.bindings), ['outline-default', 'outline-default', 'outline-default']);
    const last = applyPresetAction(deleted, 'outline', { type: 'delete', id: 'outline-default' });
    assert.deepEqual(Object.values(last.bindings), ['summary-default', 'summary-default', 'summary-default']);
    assert.throws(() => applyPresetAction(last, 'summary', { type: 'delete', id: 'summary-default' }));
    assert.deepEqual(settings.presets.map(p => p.name), ['默认1', '默认2', '默认3']);
});

test('selection saves only the binding; failed mutations do not publish, simultaneous changes serialize', async () => {
    const f = fixture({ common: { [KEY]: migrateLegacySettings(legacy) } });
    const repository = f.create(); const before = await repository.load();
    f.failWrite('common');
    await assert.rejects(repository.mutate('summary', { type: 'delete', id: 'summary-default' }));
    assert.deepEqual(await repository.load(), before);
    f.failWrite('');
    await Promise.all([
        repository.mutate('summary', { type: 'rename', id: 'planner-default', name: 'Shared' }),
        repository.mutate('summary', { type: 'select', id: 'planner-default' }),
    ]);
    const saved = await repository.load();
    assert.equal(saved.presets[1].name, 'Shared');
    assert.equal(saved.bindings.summary, 'planner-default');
});

test('planning alone rejects empty key, including after a valid neighbor replacement', () => {
    const settings = migrateLegacySettings(legacy);
    const next = applyPresetAction(settings, 'summary', { type: 'delete', id: 'planner-default' });
    const snapshot = resolveFeaturePreset(next, 'planner');
    assert.equal(snapshot.id, 'outline-default');
    assert.throws(() => assertPlannerPresetReady(snapshot));
    assert.doesNotThrow(() => assertPlannerPresetReady({ ...snapshot, apiKey: ' key ' }));
    assert.equal(resolveFeaturePreset(next, 'summary').id, 'summary-default');
});
