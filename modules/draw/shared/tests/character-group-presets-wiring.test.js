// 分组预设的接线层：SD / ComfyUI 草稿页的绑定（预设立即持久化、应用后同步草稿分组开关）与各入口的源码级接线断言。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';

import { bindGroupPresetPanel } from '../character-group-presets-draft-binding.js';
import { createCharacterLibraryUi } from '../character-library-ui.js';

const read = relative => readFileSync(new URL(relative, import.meta.url), 'utf8');

const PRESET = {
    id: 'p1', name: '校服', revision: 1, groupStates: { g1: false },
    bindings: [{ type: 'character', avatar: 'a.png', name: 'Alice' }],
};
const HOST = [{ avatar: 'a.png', name: 'Alice' }];

function mount({ presets = [PRESET], active = [] } = {}) {
    const { document, window } = parseHTML(
        '<!doctype html><html><body><div id="toolbar"></div><div id="list"></div><div id="presets"></div></body></html>',
    );
    const store = {
        characterGroups: [{ id: 'g1', name: '主线' }, { id: 'g2', name: '宠物' }],
        characterGroupPresets: presets,
        characterGroupPresetApplied: null,
    };
    const calls = { saves: [], applies: [], toasts: [] };
    const listeners = { applied: new Set(), context: new Set() };
    const live = { active };
    const runtime = {
        saveGroupPresets: async (next) => {
            calls.saves.push(next);
            store.characterGroupPresets = next;
            return { status: 'saved', saved: true };
        },
        applyGroupPresetForCurrentChat: async (options) => {
            calls.applies.push({ options, savesBefore: calls.saves.length });
            return { status: 'applied', changed: true, changedCount: 1 };
        },
        getActiveCharacterAvatars: () => live.active,
        listHostCharacters: () => HOST,
        onGroupPresetApplied: (callback) => { listeners.applied.add(callback); return () => listeners.applied.delete(callback); },
        onGroupPresetContextChanged: (callback) => { listeners.context.add(callback); return () => listeners.context.delete(callback); },
    };

    // 与 SD / ComfyUI 页面同构的草稿角色库：真实的 createCharacterLibraryUi，卡片只含名字输入框
    const ui = createCharacterLibraryUi({
        document,
        listElement: document.getElementById('list'),
        toolbarElement: document.getElementById('toolbar'),
        readCharacters: () => Array.from(document.querySelectorAll('.sd-char-card')).map(card => ({
            id: card.dataset.characterId, enabled: true, name: card.querySelector('input').value,
            aliases: [], type: 'girl', appearance: '', negativeTags: '', danbooruTag: '', outfits: [], dynamicStates: [],
        })),
        renderCard: ({ character }) => {
            const card = document.createElement('div');
            card.className = 'sd-char-card';
            card.dataset.characterId = character.id;
            const input = document.createElement('input');
            input.value = character.name;
            card.appendChild(input);
            return card;
        },
        renderEmpty: () => document.createElement('div'),
        getStorage: () => null,
    });
    ui.render({
        groups: store.characterGroups,
        characters: [{
            id: 'c1', enabled: true, name: '阿璃', aliases: [], type: 'girl', appearance: '',
            negativeTags: '', danbooruTag: '', outfits: [], dynamicStates: [], groupId: 'g1',
        }],
    });

    const binding = bindGroupPresetPanel({
        document,
        container: document.getElementById('presets'),
        getLibrary: () => ui.getLibrary(),
        syncGroupEnabled: (groups, ids) => ui.syncGroupEnabled(groups, ids),
        runtime,
        settings: { get: () => store },
        toast: (message, level) => calls.toasts.push({ message, level }),
    });
    const $ = selector => document.querySelector(selector);
    const $$ = selector => Array.from(document.querySelectorAll(selector));
    const click = node => node.dispatchEvent(new window.Event('click', { bubbles: true }));
    const button = (action) => {
        const node = $(`#presets [data-action="${action}"]`);
        assert.ok(node, `找不到按钮 ${action}`);
        return node;
    };
    return { binding, ui, store, calls, listeners, live, document, $, $$, click, button };
}

test('the preset card mounts with the stored presets', () => {
    const view = mount();
    assert.equal(view.$$('#presets .lwb-gp-item').length, 1);
    assert.match(view.$('#presets .lwb-gp-name').textContent, /校服/);
    assert.equal(view.listeners.applied.size, 1);
    assert.equal(view.listeners.context.size, 1);
});

test('preset edits persist at once through the runtime and show up before the save finishes', async () => {
    const view = mount({ presets: [] });
    view.click(view.button('save-open'));
    view.click(view.button('save-confirm'));
    assert.equal(view.$$('#presets .lwb-gp-item').length, 1, 'optimistic row');
    await view.binding.idle();
    assert.equal(view.calls.saves.length, 1);
    assert.equal(view.calls.saves[0].length, 1);
    assert.equal(view.store.characterGroupPresets.length, 1);
    assert.equal(view.$$('#presets .lwb-gp-item').length, 1);
});

test('after a preset is applied the draft group switches follow it, other draft edits stay, and the card refreshes', () => {
    const view = mount();
    view.document.querySelector('.sd-char-card input').value = '未保存的新名字';
    // 预设（后台）把 g1 关掉并写进设置；页面草稿还是旧的
    view.store.characterGroups = [{ id: 'g1', name: '主线', enabled: false }, { id: 'g2', name: '宠物' }];
    for (const callback of [...view.listeners.applied]) {
        callback({ status: 'applied', presetId: 'p1', changed: true, affected: [{ key: 'g1', enabled: false }] });
    }
    assert.deepEqual(view.ui.getGroups(), [{ id: 'g1', name: '主线', enabled: false }, { id: 'g2', name: '宠物' }]);
    assert.equal(view.ui.getLibrary().characters[0].name, '未保存的新名字', 'unsaved card edit is kept');
    // 之后“保存角色”读到的分组开关已是最新值
    assert.equal(view.ui.getGroups().find(group => group.id === 'g1').enabled, false);
});

test('an apply result that touched no group leaves unsaved draft group switches alone', () => {
    const view = mount();
    // 用户在草稿里未保存地关掉了分组 g2；设置里 g2 仍是开启
    view.ui.syncGroupEnabled([{ id: 'g2', name: '宠物', enabled: false }], ['g2']);
    assert.equal(view.ui.getGroups().find(group => group.id === 'g2').enabled, false);
    // 预设只改了 g1；即使预设自带 g2 的开关，也不应该因此冲掉 g2 的草稿
    view.store.characterGroupPresets = [{ ...PRESET, groupStates: { g1: false, g2: true } }];
    view.store.characterGroups = [{ id: 'g1', name: '主线', enabled: false }, { id: 'g2', name: '宠物' }];
    for (const callback of [...view.listeners.applied]) {
        callback({ status: 'applied', presetId: 'p1', changed: true, affected: [{ key: 'g1', enabled: false }] });
    }
    assert.equal(view.ui.getGroups().find(group => group.id === 'g1').enabled, false);
    assert.equal(view.ui.getGroups().find(group => group.id === 'g2').enabled, false, 'unsaved g2 draft is kept');
    // 没有变化 / 没有受影响信息时一个分组都不同步
    for (const result of [{ status: 'applied', presetId: 'p1', changed: false, affected: [] }, { status: 'applied', presetId: 'p1' }]) {
        for (const callback of [...view.listeners.applied]) callback(result);
    }
    assert.equal(view.ui.getGroups().find(group => group.id === 'g2').enabled, false);
});

test('a chat change without an apply refreshes the match badge; destroy cancels both subscriptions', () => {
    const view = mount();
    assert.equal(view.$$('#presets .lwb-gp-badge-matched').length, 0);
    view.live.active = ['a.png'];
    for (const callback of [...view.listeners.context]) callback({ activeAvatars: ['a.png'] });
    assert.equal(view.$$('#presets .lwb-gp-badge-matched').length, 1);

    view.binding.destroy();
    assert.equal(view.listeners.applied.size, 0);
    assert.equal(view.listeners.context.size, 0);
    assert.equal(view.$$('#presets .lwb-gp').length, 0);
});

test('the apply button waits for pending saves and then forces the chosen preset', async () => {
    const view = mount({ presets: [] });
    view.click(view.button('save-open'));
    view.click(view.button('save-confirm'));
    view.click(view.button('apply'));
    await view.binding.idle();
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(view.calls.applies.length, 1);
    assert.equal(view.calls.applies[0].options.force, true);
    assert.ok(view.calls.applies[0].options.presetId);
    assert.equal(view.calls.applies[0].savesBefore, 1, 'saved before applying');
});

// ── 源码级接线 ──

test('index.js starts the shared watcher once in a finally after the provider inits and stops it in the shared cleanup', () => {
    const source = read('../../../../index.js');
    assert.match(source, /import \{ startGroupPresetWatcher, stopGroupPresetWatcher \} from "\.\/modules\/draw\/shared\/character-group-presets-runtime\.js"/);
    const init = source.slice(source.indexOf('async function initActiveDrawProvider()'), source.indexOf('function notifyTavernDrawStatusChanged'));
    // 即使 provider 初始化抛错也要启动：启动调用必须在 finally 里（位于三个 init 之后）。
    assert.match(init, /try \{[\s\S]*await initComfyDraw\(\);[\s\S]*\} finally \{[\s\S]*startGroupPresetWatcher\(\)/, 'started in finally after the three inits');
    assert.equal(init.split('startGroupPresetWatcher()').length - 1, 1);
    const cleanup = source.slice(source.indexOf('async function cleanupDrawProvider('), source.indexOf('async function initActiveDrawProvider()'));
    assert.match(cleanup, /stopGroupPresetWatcher\(\)/);
    for (const file of ['novelai/novel-draw.js', 'sd-webui/sd-draw.js', 'comfyui/comfy-draw.js']) {
        assert.doesNotMatch(read(`../../providers/${file}`), /(start|stop)GroupPresetWatcher/, `${file} must not own the shared watcher`);
    }
});

test('NovelAI host: real preset data in INIT_DATA, save / apply messages, and refresh subscriptions tied to the overlay', () => {
    const source = read('../../providers/novelai/novel-draw.js');
    const init = source.slice(source.indexOf("type: 'INIT_DATA'"), source.indexOf('postToIframe(iframe, buildPayload()'));
    for (const field of ['characterGroupPresets:', 'characterGroupPresetApplied:', 'hostCharacters: listHostCharacters()', 'activeAvatars: getActiveCharacterAvatars()']) {
        assert.ok(init.includes(field), `INIT_DATA carries ${field}`);
    }
    assert.match(source, /case 'SAVE_GROUP_PRESETS': \{[\s\S]*?await saveGroupPresets\(data\.presets\)/);
    assert.match(source, /case 'APPLY_GROUP_PRESET': \{[\s\S]*?applyGroupPresetForCurrentChat\(\{ force: true, presetId:/);
    assert.match(source, /onGroupPresetApplied\(\(\) => \{ if \(frameReady\) void sendInitData\(\); \}\)/);
    assert.match(source, /type: 'GROUP_PRESET_CONTEXT'/);
    const create = source.slice(source.indexOf('function createOverlay()'), source.indexOf('function showOverlay()'));
    assert.match(create, /subscribeGroupPresetRefresh\(\)/);
    const hide = source.slice(source.indexOf('function hideOverlay()'), source.indexOf('async function sendInitData()'));
    assert.match(hide, /unsubscribeGroupPresetRefresh\(\)/);
});

test('SD and ComfyUI pages carry the preset card after the batch card, load its stylesheet and tear the binding down with the library', () => {
    for (const [html, js, prefix] of [
        ['../../providers/sd-webui/sd-draw.html', '../../providers/sd-webui/sd-draw.js', 'sd'],
        ['../../providers/comfyui/comfy-draw.html', '../../providers/comfyui/comfy-draw.js', 'comfy'],
    ]) {
        const page = read(html);
        assert.match(page, /href="\.\.\/\.\.\/shared\/character-group-presets-ui\.css"/, html);
        assert.ok(page.indexOf('批量操作') < page.indexOf(`id="${prefix}-group-preset-root"`), `${html}: card after 批量操作`);
        const source = read(js);
        assert.match(source, /bindGroupPresetPanel\(\{/, js);
        assert.match(source, /function destroyCharacterLibraryUi\(\) \{\s*destroyGroupPresetBinding\(\);/, js);
        assert.match(source, /renderCharacterTagList\([^)]*\);\s*ensureGroupPresetBinding\(\);/, js);
    }
});
