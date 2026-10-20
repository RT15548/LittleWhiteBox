// 画图 API 配置预设：纯函数（api-presets.js）与共享预设栏组件（api-presets-ui.js）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import {
    MAX_API_PRESETS,
    MAX_API_PRESET_NAME_LENGTH,
    cloneApiPresets,
    createApiPreset,
    deleteApiPreset,
    hasUnsavedApiConfig,
    isSameApiConfig,
    normalizeActiveApiPresetId,
    normalizeApiPresetState,
    normalizeApiPresets,
    overwriteApiPreset,
    pickApiConfig,
    renameApiPreset,
    syncActiveApiPreset,
} from '../api-presets.js';
import { createApiPresetBar } from '../api-presets-ui.js';
import { createApiPresetPage } from '../api-preset-page.js';

const FIELDS = ['host', 'auth', 'timeout', 'delay'];
const OPTIONS = { fields: FIELDS };

function counterIds() {
    let n = 0;
    return prefix => `${prefix}-t${++n}`;
}

const CONFIG = { host: 'http://a', auth: 'u:p', timeout: 1000, delay: { min: 1, max: 2 } };

test('pickApiConfig keeps only whitelisted fields, deep-copies and ignores the input', () => {
    const input = { ...CONFIG, extra: 'x', apiPresets: [1], __proto__: { polluted: true } };
    const before = structuredClone(input);
    const picked = pickApiConfig(input, FIELDS);
    assert.deepEqual(picked, CONFIG);
    assert.notEqual(picked.delay, input.delay, '嵌套对象也是拷贝');
    picked.delay.min = 99;
    assert.equal(input.delay.min, 1);
    assert.deepEqual(input, before);
    assert.deepEqual(pickApiConfig({ host: 'h' }, FIELDS), { host: 'h' }, '缺少的字段不出现');
    assert.deepEqual(pickApiConfig(null, FIELDS), {});
    assert.deepEqual(pickApiConfig(CONFIG, []), {});
});

test('isSameApiConfig compares whitelisted fields only, regardless of key order', () => {
    assert.equal(isSameApiConfig(CONFIG, { ...CONFIG, other: 1, delay: { max: 2, min: 1 } }, FIELDS), true);
    assert.equal(isSameApiConfig(CONFIG, { ...CONFIG, timeout: 2 }, FIELDS), false);
});

test('createApiPreset appends a preset with whitelisted config and does not mutate the list', () => {
    const list = [];
    const result = createApiPreset(list, '  官方  ', { ...CONFIG, secretExtra: 1 }, { ...OPTIONS, makeId: counterIds() });
    assert.deepEqual(list, []);
    assert.equal(result.presets.length, 1);
    assert.deepEqual(result.presets[0], { id: 'apipreset-t1', name: '官方', config: CONFIG });
    assert.equal(result.presetId, 'apipreset-t1');
});

test('createApiPreset rejects empty, over-long and duplicate names (case-insensitive) and a full list', () => {
    const { presets } = createApiPreset([], 'Alpha', CONFIG, OPTIONS);
    assert.throws(() => createApiPreset(presets, '   ', CONFIG, OPTIONS), /不能为空/);
    assert.throws(() => createApiPreset(presets, 'a'.repeat(MAX_API_PRESET_NAME_LENGTH + 1), CONFIG, OPTIONS), /不能超过 40/);
    assert.doesNotThrow(() => createApiPreset(presets, 'a'.repeat(MAX_API_PRESET_NAME_LENGTH), CONFIG, OPTIONS));
    assert.throws(() => createApiPreset(presets, ' alpha ', CONFIG, OPTIONS), /已存在/);
    let full = [];
    for (let i = 0; i < MAX_API_PRESETS; i += 1) full = createApiPreset(full, `p${i}`, CONFIG, OPTIONS).presets;
    assert.equal(full.length, 30);
    assert.throws(() => createApiPreset(full, 'one-more', CONFIG, OPTIONS), /不能超过 30/);
    assert.equal(full.length, 30);
});

test('overwriteApiPreset replaces the config only, keeps id and name, and returns the same array when nothing changes', () => {
    const { presets, presetId } = createApiPreset([], 'A', CONFIG, OPTIONS);
    const before = structuredClone(presets);
    const next = overwriteApiPreset(presets, presetId, { ...CONFIG, host: 'http://b', junk: 1 }, OPTIONS);
    assert.deepEqual(presets, before);
    assert.deepEqual(next[0], { id: presetId, name: 'A', config: { ...CONFIG, host: 'http://b' } });
    assert.equal(overwriteApiPreset(presets, presetId, { ...CONFIG }, OPTIONS), presets);
    assert.throws(() => overwriteApiPreset(presets, 'missing', CONFIG, OPTIONS), /不存在/);
});

test('renameApiPreset keeps config and id, rejects duplicates of other presets but allows its own name', () => {
    let list = createApiPreset([], 'A', CONFIG, OPTIONS).presets;
    const created = createApiPreset(list, 'B', { ...CONFIG, host: 'h2' }, OPTIONS);
    list = created.presets;
    const before = structuredClone(list);
    const renamed = renameApiPreset(list, created.presetId, ' C ');
    assert.deepEqual(list, before);
    assert.equal(renamed[1].name, 'C');
    assert.deepEqual(renamed[1].config, list[1].config);
    assert.throws(() => renameApiPreset(list, created.presetId, 'a'), /已存在/);
    assert.equal(renameApiPreset(list, created.presetId, 'B'), list, '同名返回原数组');
    assert.throws(() => renameApiPreset(list, 'missing', 'X'), /不存在/);
});

test('deleteApiPreset removes one preset without touching the input list', () => {
    const list = createApiPreset(createApiPreset([], 'A', CONFIG, OPTIONS).presets, 'B', CONFIG, OPTIONS).presets;
    const next = deleteApiPreset(list, list[0].id);
    assert.equal(list.length, 2);
    assert.deepEqual(next.map(p => p.name), ['B']);
    assert.throws(() => deleteApiPreset(list, 'missing'), /不存在/);
});

test('syncActiveApiPreset overwrites only the active preset and never creates one', () => {
    const list = createApiPreset(createApiPreset([], 'A', CONFIG, OPTIONS).presets, 'B', CONFIG, OPTIONS).presets;
    const synced = syncActiveApiPreset(list, list[1].id, { ...CONFIG, host: 'http://new' }, OPTIONS);
    assert.equal(synced[0], list[0]);
    assert.equal(synced[1].config.host, 'http://new');
    assert.equal(syncActiveApiPreset(list, null, CONFIG, OPTIONS), list);
    assert.equal(syncActiveApiPreset(list, 'gone', CONFIG, OPTIONS), list);
    assert.equal(syncActiveApiPreset([], 'x', CONFIG, OPTIONS).length, 0);
});

test('normalizeApiPresets repairs ids and names, filters config to the whitelist and caps the count', () => {
    const raw = [
        { id: 'a', name: 'Same', config: { ...CONFIG, leaked: 'x' } },
        { id: 'a', name: 'same', config: CONFIG },
        { name: '', config: null },
        null,
        'bad',
        { id: 'long', name: 'x'.repeat(80), config: {} },
    ];
    const snapshot = structuredClone(raw);
    const result = normalizeApiPresets(raw, { ...OPTIONS, makeId: counterIds() });
    assert.deepEqual(raw, snapshot);
    assert.equal(result.length, 4);
    assert.deepEqual(result.map(p => p.id), ['a', 'apipreset-t1', 'apipreset-t2', 'long']);
    assert.deepEqual(result.map(p => p.name).slice(0, 3), ['Same', 'same 2', '未命名预设']);
    assert.equal(Array.from(result[3].name).length, MAX_API_PRESET_NAME_LENGTH);
    assert.deepEqual(result[0].config, CONFIG, '不在白名单内的键被丢弃');
    assert.deepEqual(result[2].config, {});
    const many = Array.from({ length: 50 }, (_, i) => ({ id: `i${i}`, name: `n${i}`, config: {} }));
    assert.equal(normalizeApiPresets(many, OPTIONS).length, MAX_API_PRESETS);
    assert.deepEqual(normalizeApiPresets('nope', OPTIONS), []);
});

test('normalizeApiPresets lets the provider normalize config values and re-filters the result', () => {
    const result = normalizeApiPresets([{ id: 'a', name: 'A', config: { host: '  h  ', timeout: 'abc' } }], {
        fields: FIELDS,
        normalizeConfig: c => ({ host: c.host.trim(), timeout: Number(c.timeout) || 60, injected: 'no' }),
    });
    assert.deepEqual(result[0].config, { host: 'h', timeout: 60 });
});

test('the active preset id must point to an existing preset', () => {
    const presets = [{ id: 'a', name: 'A', config: {} }];
    assert.equal(normalizeActiveApiPresetId('a', presets), 'a');
    assert.equal(normalizeActiveApiPresetId('b', presets), null);
    assert.equal(normalizeActiveApiPresetId(7, presets), null);
    assert.deepEqual(normalizeApiPresetState({ apiPresets: presets, activeApiPresetId: 'zzz' }, OPTIONS).activeApiPresetId, null);
    assert.deepEqual(normalizeApiPresetState({}, OPTIONS), { apiPresets: [], activeApiPresetId: null });
});

test('cloneApiPresets returns an independent deep copy', () => {
    const presets = [{ id: 'a', name: 'A', config: CONFIG }];
    const copy = cloneApiPresets(presets);
    copy[0].config.delay.min = 500;
    copy[0].name = 'changed';
    assert.equal(presets[0].config.delay.min, 1);
    assert.equal(presets[0].name, 'A');
});

test('hasUnsavedApiConfig flags edits, drift from the active preset and an unsaved current config', () => {
    const presets = [{ id: 'a', name: 'A', config: CONFIG }];
    const base = { presets, activeApiPresetId: 'a', formConfig: CONFIG, effectiveConfig: CONFIG, fields: FIELDS };
    assert.equal(hasUnsavedApiConfig(base), false);
    assert.equal(hasUnsavedApiConfig({ ...base, formConfig: { ...CONFIG, host: 'edited' } }), true, '表单有改动');
    assert.equal(hasUnsavedApiConfig({ ...base, formConfig: { ...CONFIG, host: 'x' }, effectiveConfig: { ...CONFIG, host: 'x' } }), true, '生效配置与预设不一致');
    const none = { ...base, activeApiPresetId: null };
    assert.equal(hasUnsavedApiConfig(none), false, '生效配置恰好等于某个预设');
    const stray = { ...none, formConfig: { ...CONFIG, host: 'y' }, effectiveConfig: { ...CONFIG, host: 'y' } };
    assert.equal(hasUnsavedApiConfig(stray), true, '没选预设，当前配置不在任何预设里');
    assert.equal(hasUnsavedApiConfig({ ...stray, defaults: { host: 'y', auth: '', timeout: 1000, delay: { min: 1, max: 2 } }, formConfig: { host: 'y', auth: 'u:p', timeout: 1000, delay: { min: 1, max: 2 } }, effectiveConfig: { host: 'y', auth: 'u:p', timeout: 1000, delay: { min: 1, max: 2 } } }), true);
    const blank = { host: '', auth: '', timeout: 1000, delay: { min: 1, max: 2 } };
    assert.equal(hasUnsavedApiConfig({ ...none, formConfig: blank, effectiveConfig: blank, defaults: blank }), false, '缺省配置没有东西可丢');
});

// ───────────── 预设栏组件 ─────────────

function mountBar({ presets = [], activeApiPresetId = null, commitResult = true, form = { ...CONFIG }, effective = { ...CONFIG } } = {}) {
    const { document, window } = parseHTML('<!doctype html><html><body><div id="bar" class="preset-bar"></div></body></html>');
    const store = { apiPresets: presets, activeApiPresetId };
    const live = { form, effective, commits: [], confirms: [], prompts: [], answers: { confirm: [], prompt: [] } };
    const bar = createApiPresetBar({
        document,
        container: document.getElementById('bar'),
        fields: FIELDS,
        getState: () => store,
        readConfig: () => live.form,
        getEffectiveConfig: () => live.effective,
        onCommit: async (change) => {
            live.commits.push(change);
            if (commitResult) {
                store.apiPresets = change.apiPresets;
                store.activeApiPresetId = change.activeApiPresetId;
                if (change.config) live.effective = change.config;
            }
            return commitResult;
        },
        confirm: (message) => { live.confirms.push(message); return live.answers.confirm.length ? live.answers.confirm.shift() : true; },
        prompt: (message, fallback) => { live.prompts.push({ message, fallback }); return live.answers.prompt.length ? live.answers.prompt.shift() : null; },
    });
    const $ = selector => document.querySelector(selector);
    const click = action => $(`[data-action="${action}"]`).dispatchEvent(new window.Event('click', { bubbles: true }));
    const choose = (id) => {
        const select = $('select');
        for (const option of select.children) option.removeAttribute('selected');
        Array.from(select.children).find(option => option.getAttribute('value') === id).setAttribute('selected', '');
        select.dispatchEvent(new window.Event('change', { bubbles: true }));
    };
    const settle = () => new Promise(resolve => setTimeout(resolve, 0));
    return { bar, store, live, $, click, choose, settle, document };
}

const TWO = [
    { id: 'p1', name: '一号', config: CONFIG },
    { id: 'p2', name: '二号', config: { ...CONFIG, host: 'http://other' } },
];

test('the bar lists the presets, shows "未保存为预设" and disables buttons that need a selection', () => {
    const view = mountBar({ presets: TWO });
    assert.deepEqual(Array.from(view.document.querySelectorAll('option')).map(o => o.textContent), ['未保存为预设', '一号', '二号']);
    for (const action of ['overwrite', 'rename', 'delete']) assert.ok(view.$(`[data-action="${action}"]`).hasAttribute('disabled'), action);
    assert.ok(!view.$('[data-action="save-as"]').hasAttribute('disabled'));
    assert.match(view.$('.status-text').textContent, /未选择预设/);
});

test('save-as commits a new preset built from the form and selects it', async () => {
    const view = mountBar({ presets: [] });
    assert.match(view.$('.status-text').textContent, /尚未保存预设/);
    view.live.answers.prompt.push(' 我的预设 ');
    view.click('save-as');
    await view.settle();
    const [change] = view.live.commits;
    assert.equal(change.reason, 'create');
    assert.equal(change.apiPresets[0].name, '我的预设');
    assert.deepEqual(change.apiPresets[0].config, CONFIG);
    assert.equal(change.activeApiPresetId, change.apiPresets[0].id);
    assert.deepEqual(change.config, CONFIG);
    assert.equal(view.$('select').value, change.apiPresets[0].id);
    assert.match(view.$('.status-text').textContent, /已另存为预设「我的预设」/);
});

test('save-as reports an empty or duplicate name without committing; cancelling is silent', async () => {
    const view = mountBar({ presets: TWO });
    view.live.answers.prompt.push('   ');
    view.click('save-as');
    await view.settle();
    assert.match(view.$('.status-text').textContent, /不能为空/);
    view.live.answers.prompt.push('一号');
    view.click('save-as');
    await view.settle();
    assert.match(view.$('.status-text').textContent, /已存在/);
    view.live.answers.prompt.push(null);
    view.click('save-as');
    await view.settle();
    assert.equal(view.live.commits.length, 0);
});

test('overwrite writes the form config into the active preset and into the effective config', async () => {
    const view = mountBar({ presets: TWO, activeApiPresetId: 'p1', form: { ...CONFIG, host: 'http://changed' } });
    assert.match(view.$('.status-text').textContent, /与预设不一致/);
    view.click('overwrite');
    await view.settle();
    const [change] = view.live.commits;
    assert.equal(change.reason, 'overwrite');
    assert.equal(change.apiPresets[0].config.host, 'http://changed');
    assert.equal(change.apiPresets[1], TWO[1]);
    assert.equal(change.config.host, 'http://changed');
    assert.equal(TWO[0].config.host, 'http://a', '入参预设不被修改');
});

test('rename and delete commit without a config; delete asks first and clears the selection', async () => {
    const view = mountBar({ presets: TWO, activeApiPresetId: 'p2' });
    view.live.answers.prompt.push('新名字');
    view.click('rename');
    await view.settle();
    assert.equal(view.live.commits[0].reason, 'rename');
    assert.equal(view.live.commits[0].config, null);
    assert.equal(view.store.apiPresets[1].name, '新名字');
    assert.equal(view.live.prompts[0].fallback, '二号');

    view.live.answers.confirm.push(false);
    view.click('delete');
    await view.settle();
    assert.equal(view.live.commits.length, 1, '取消删除不提交');
    view.live.answers.confirm.push(true);
    view.click('delete');
    await view.settle();
    assert.equal(view.live.commits[1].reason, 'delete');
    assert.equal(view.live.commits[1].activeApiPresetId, null);
    assert.equal(view.store.apiPresets.length, 1);
    assert.equal(view.$('select').value, '');
    assert.ok(!view.live.confirms.concat(view.live.prompts.map(p => p.message)).join('').includes('http://'), '对话框不含配置内容');
});

test('selecting a preset applies its config at once; unsaved edits need a confirmation first', async () => {
    const view = mountBar({ presets: TWO, activeApiPresetId: 'p1' });
    view.choose('p2');
    await view.settle();
    assert.equal(view.live.confirms.length, 0, '没有未保存的修改：不询问');
    assert.equal(view.live.commits[0].reason, 'select');
    assert.equal(view.live.commits[0].activeApiPresetId, 'p2');
    assert.deepEqual(view.live.commits[0].config, TWO[1].config);

    view.live.form = { ...TWO[1].config, host: 'http://dirty' };
    view.live.answers.confirm.push(false);
    view.choose('p1');
    await view.settle();
    assert.equal(view.live.confirms.length, 1);
    assert.equal(view.live.commits.length, 1, '拒绝后不切换');
    assert.equal(view.$('select').value, 'p2', '下拉恢复到原选择');
    view.live.answers.confirm.push(true);
    view.choose('p1');
    await view.settle();
    assert.equal(view.live.commits.at(-1).activeApiPresetId, 'p1');
});

test('deselecting keeps the current config; a failed commit is reported and the selection reverts', async () => {
    const view = mountBar({ presets: TWO, activeApiPresetId: 'p1' });
    view.choose('');
    await view.settle();
    assert.equal(view.live.commits[0].reason, 'deselect');
    assert.equal(view.live.commits[0].config, null);

    const failing = mountBar({ presets: TWO, activeApiPresetId: 'p1', commitResult: false });
    failing.choose('p2');
    await failing.settle();
    assert.match(failing.$('.status-text').textContent, /保存失败/);
    assert.equal(failing.$('select').value, 'p1');
});

// ───────────── 页面接线（SD WebUI / ComfyUI 共用）─────────────

function mountPage({ presets = [], activeApiPresetId = null, persistResult = true } = {}) {
    const { document, window } = parseHTML('<!doctype html><html><body><div id="panel"><div id="bar" class="preset-bar"></div><input id="host"></div></body></html>');
    const live = { settings: { apiPresets: presets, activeApiPresetId, ...CONFIG }, filled: [], persists: 0 };
    const normalizeConfig = (raw = {}) => ({
        host: String(raw.host || ''), auth: String(raw.auth || ''), timeout: Number(raw.timeout) || 1000, delay: raw.delay || { min: 1, max: 2 },
    });
    const page = createApiPresetPage({
        fields: FIELDS,
        normalizeConfig,
        getSettings: () => live.settings,
        getSettingsDocument: () => document,
        querySettings: selector => document.querySelector(selector),
        containerSelector: '#bar',
        panelSelector: '#panel',
        readConfig: () => normalizeConfig({ ...live.settings, host: document.getElementById('host').value || live.settings.host }),
        fillConfig: config => live.filled.push(config),
        persist: async (mutator) => {
            live.persists += 1;
            if (!persistResult) return false;
            const draft = structuredClone(live.settings);
            mutator(draft);
            live.settings = draft;
            return true;
        },
        confirm: () => true,
        prompt: () => null,
    });
    const choose = (id) => {
        const select = document.querySelector('select');
        for (const option of select.children) option.removeAttribute('selected');
        Array.from(select.children).find(option => option.getAttribute('value') === id).setAttribute('selected', '');
        select.dispatchEvent(new window.Event('change', { bubbles: true }));
    };
    const settle = () => new Promise(resolve => setTimeout(resolve, 0));
    return { page, live, document, window, choose, settle };
}

test('the page controller mounts one bar per document and removes it on destroy', () => {
    const view = mountPage({ presets: TWO });
    const bar = view.page.ensureBar();
    assert.ok(bar);
    assert.equal(view.page.ensureBar(), bar, '同一个 document 复用同一个预设栏');
    assert.equal(view.document.querySelectorAll('option').length, 3);
    view.page.destroy();
    assert.equal(view.document.getElementById('bar').children.length, 0);
    assert.equal(view.page.render(), undefined, '销毁后 render / refresh 不报错');
});

test('selecting a preset persists the list and the applied API fields, then fills the form with the effective config', async () => {
    const view = mountPage({ presets: TWO, activeApiPresetId: 'p1' });
    view.page.ensureBar();
    view.choose('p2');
    await view.settle();
    assert.equal(view.live.settings.activeApiPresetId, 'p2');
    assert.equal(view.live.settings.host, 'http://other', '选中的预设配置成为生效配置');
    assert.deepEqual(view.live.filled.map(config => config.host), ['http://other']);
});

test('non-select changes persist the list without touching the effective config or the form', async () => {
    const view = mountPage({ presets: TWO, activeApiPresetId: 'p1' });
    view.page.ensureBar();
    view.document.querySelector('[data-action="delete"]').dispatchEvent(new view.window.Event('click', { bubbles: true }));
    await view.settle();
    assert.deepEqual(view.live.settings.apiPresets.map(preset => preset.id), ['p2']);
    assert.equal(view.live.settings.activeApiPresetId, null);
    assert.equal(view.live.settings.host, CONFIG.host);
    assert.deepEqual(view.live.filled, []);
});

test('a failed persist does not fill the form', async () => {
    const view = mountPage({ presets: TWO, activeApiPresetId: 'p1', persistResult: false });
    view.page.ensureBar();
    view.choose('p2');
    await view.settle();
    assert.deepEqual(view.live.filled, []);
    assert.equal(view.live.settings.activeApiPresetId, 'p1');
});

test('the Save helpers name the synced preset and write the form config back into it', () => {
    const view = mountPage({ presets: TWO, activeApiPresetId: 'p1' });
    assert.equal(view.page.activeName(), '一号');
    assert.equal(view.page.savedText(true, '默认提示'), '已保存，并同步到 API 预设「一号」');
    assert.equal(view.page.savedText(false, '默认提示'), '默认提示', '没要求同步时用默认提示');
    const synced = view.page.withSynced({ ...view.live.settings, host: 'http://edited' });
    assert.equal(synced.apiPresets[0].config.host, 'http://edited');
    assert.equal(synced.apiPresets[1].config.host, 'http://other', '其它预设不动');

    const none = mountPage({ presets: TWO, activeApiPresetId: null });
    assert.equal(none.page.activeName(), '');
    assert.equal(none.page.savedText(true, '默认提示'), '默认提示');
    const form = { ...none.live.settings };
    assert.equal(none.page.withSynced(form), form, '没选预设时原样返回');
});

test('edits inside the API panel refresh the bar status, but the bar own controls do not', () => {
    const view = mountPage({ presets: TWO, activeApiPresetId: 'p1' });
    view.page.ensureBar();
    view.page.bindFormRefresh();
    const status = () => view.document.querySelector('.status-text').textContent;
    assert.doesNotMatch(status(), /不一致/);
    view.live.settings = { ...view.live.settings, host: 'http://drifted' };
    view.document.querySelector('[data-action="save-as"]').dispatchEvent(new view.window.Event('click', { bubbles: true }));
    assert.doesNotMatch(status(), /不一致/, '预设栏自己的点击不触发刷新');
    view.document.getElementById('host').dispatchEvent(new view.window.Event('input', { bubbles: true }));
    assert.match(status(), /不一致/);
});