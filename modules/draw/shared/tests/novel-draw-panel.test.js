// NovelAI 设置页 (novel-draw.html) 的内联脚本没有单独的模块文件，这里把它原样取出、
// 放进 vm 里跑在 linkedom 解析出的真实页面 DOM 上，只通过末尾追加的一个只读钩子访问内部状态。
// 覆盖角色库面板的几条回归：空库有分组、库操作不丢编辑草稿、空白草稿不被持久化、撤销指纹对规范化免疫。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';

import * as CL from '../character-library.js';
import * as CD from '../character-library-dialog.js';
import * as CS from '../character-list-scroll.js';
import * as GP from '../character-group-presets-ui.js';
import * as GPM from '../character-group-presets.js';
import * as APUI from '../api-presets-ui.js';
import * as CM from '../character-card-menu.js';
import * as PO from '../preset-order.js';
import * as SL from '../sortable-list.js';
import * as PLV from '../preset-list-view.js';
import * as PLE from '../prompt-layout-editor.js';
import { addBlock, createCustomBlock, createDefaultLayout, moveBlock } from '../scene-planner-layout.js';
import { parseNovelPromptPresetImport, promptTemplateExportVersion } from '../../providers/novelai/novel-prompt-import.js';
import { normalizeSharedDrawSettings } from '../draw-settings.js';

// 页面脚本跑在 vm 的另一个 realm 里，数组原型不同：按 JSON 内容比较。
const sameJson = (actual, expected, message) => assert.deepStrictEqual(JSON.parse(JSON.stringify(actual)), expected, message);

const PAGE = new URL('../../providers/novelai/novel-draw.html', import.meta.url);

const HOOK = `
;globalThis.__nd = {
    renderCharList, handleCharAction, handleGroupAction, applyCharacterLibrary, saveCharacterLibrary,
    showUndo, performUndo, libraryFingerprint, isUndoStale, runBatchAction, cloneLibrary,
    getCharacterLibrary, getPersistedLibrary, persistedCharacters, deleteCharactersWithUndo,
    getState: () => state,
    setCL: (module) => { CL = module; },
    setCD: (module) => { CD = module; },
    setCS: (module) => { CS = module; },
    setGP: (module) => { GP = module; },
    setGPM: (module) => { GPM = module; },
    setAPUI: (module) => { AP_UI = module; },
    setCM: (module) => { CM = module; },
    setPO: (module) => { PO = module; },
    setSL: (module) => { SL = module; },
    setPLV: (module) => { PLV = module; },
    setPLE: (module) => { PLE = module; },
    layoutDraftsByPreset,
    renderApiPresetBar, readApiConfigFromForm,
    exportCharacterFile, visibleCharacterIds, switchView,
    getEditingCharId: () => editingCharId,
    setSelectMode: (on) => { charSelectMode = !!on; },
    selectedCharIds,
    draftCharacters,
    messageHandler: (event) => window.__messageHandlers.forEach(handler => handler(event)),
    getUndoState: () => undoState,
    getModalData: () => modalData,
};
`;

function loadPanel(t, { characters = [], groups = [], intersection = false } = {}) {
    const html = fs.readFileSync(PAGE, 'utf8');
    const { document } = parseHTML(html);
    const script = html.match(/<script>\n([\s\S]*?)<\/script>/)[1];
    const posted = [];
    const errors = [];
    const dialogs = { alerts: [], confirms: [], prompts: [] };
    const answers = { confirm: [], prompt: [] };
    const requests = new Map();
    const host = { postMessage(message) {
        posted.push(message);
        if (message.requestId) requests.set(`${message.type}:${message.charName}:${message.slotId || ''}`, message.requestId);
    } };
    const timers = new Set();
    const win = {
        __messageHandlers: [],
        addEventListener(type, handler) { if (type === 'message') this.__messageHandlers.push(handler); },
        parent: host,
        location: { origin: 'http://host.test' },
        innerHeight: 800,
    };
    const store = new Map();
    // 导出走 Blob + URL.createObjectURL：记录每个 Blob 的文本内容，测试里才能断言“导出了什么”。
    const blobs = [];
    class RecordingBlob {
        constructor(parts = []) { this.text = parts.map(String).join(''); blobs.push(this.text); }
    }
    const RecordingURL = Object.assign(function RecordingURL(...args) { return new URL(...args); }, {
        createObjectURL: () => 'blob:test', revokeObjectURL() {},
    });
    const sandbox = {
        document,
        window: win,
        console: { log() {}, warn() {}, error: (...args) => errors.push(args.map(String).join(' ')), info() {}, debug() {} },
        setTimeout: (fn, ms) => { const id = setTimeout(fn, ms); timers.add(id); return id; },
        clearTimeout,
        localStorage: { getItem: key => (store.has(key) ? store.get(key) : null), setItem: (key, value) => store.set(key, String(value)) },
        alert: message => dialogs.alerts.push(String(message)),
        confirm: (message) => { dialogs.confirms.push(String(message)); return answers.confirm.length ? answers.confirm.shift() : true; },
        prompt: (message) => { dialogs.prompts.push(String(message)); return answers.prompt.length ? answers.prompt.shift() : null; },
        CSS: { escape: value => String(value) },
        getComputedStyle: element => ({ overflowY: element?.testOverflowY || 'visible' }), // 测试里给节点挂 testOverflowY 来假装它是滚动容器
        URL: RecordingURL, Blob: RecordingBlob, structuredClone, JSON, Math, Date, Map, Set, Array, Object, String, Number, Promise, RegExp, Error, TypeError,
    };
    sandbox.globalThis = sandbox;
    // 画廊的“往下拉再加载”哨兵：默认没有 IntersectionObserver（走“加载更多”按钮），intersection: true 时换成可手动触发的假实现。
    const observers = [];
    if (intersection) {
        sandbox.IntersectionObserver = class FakeIntersectionObserver {
            constructor(callback, options) { this.callback = callback; this.options = options; this.targets = new Set(); this.disconnected = false; observers.push(this); }
            observe(node) { this.targets.add(node); }
            unobserve(node) { this.targets.delete(node); }
            disconnect() { this.targets.clear(); this.disconnected = true; }
            trigger(isIntersecting = true) { for (const target of Array.from(this.targets)) this.callback([{ isIntersecting, target }]); }
        };
    }
    vm.createContext(sandbox);
    vm.runInContext(script + HOOK, sandbox, { filename: 'novel-draw.inline.js' });
    t.after(() => { for (const id of timers) clearTimeout(id); });
    const nd = sandbox.__nd;
    nd.setCL(CL);
    // 触发页面自己的 DOMContentLoaded 初始化（注册所有按钮监听）；动态 import 在 vm 里不可用，角色库模块改为手动注入。
    document.dispatchEvent(new document.defaultView.Event('DOMContentLoaded'));
    nd.setCL(CL);
    nd.setCD(CD);
    nd.setCS(CS);
    nd.setGP(GP);
    nd.setGPM(GPM);
    nd.setAPUI(APUI);
    nd.setCM(CM);
    nd.setPO(PO);
    nd.setSL(SL);
    nd.setPLV(PLV);
    nd.setPLE(PLE);
    const state = nd.getState();
    state.characterTags = characters;
    state.characterGroups = groups;
    nd.renderCharList();
    posted.length = 0;
    const lastSave = () => posted.filter(message => message.type === 'SAVE_CHARACTER_TAGS').at(-1);
    return {
        nd, document, posted, errors, blobs, dialogs, answers, lastSave, host, observers, state: () => nd.getState(),
        initData(settings, extra = {}) {
            win.__messageHandlers.forEach(handler => handler({
                origin: 'http://host.test',
                source: host,
                data: { source: 'LittleWhiteBox-NovelDraw', type: 'INIT_DATA', settings, ...extra },
            }));
        },
        send(type, payload = {}) {
            const requestType = type.startsWith('CHARACTER_PREVIEWS_') ? 'LOAD_CHARACTER_PREVIEWS'
                : type.startsWith('SLOT_VERSIONS_') ? 'LOAD_SLOT_VERSIONS' : null;
            const requestId = requests.get(`${requestType}:${payload.charName}:${payload.slotId || ''}`);
            win.__messageHandlers.forEach(handler => handler({
                origin: 'http://host.test',
                source: host,
                data: { source: 'LittleWhiteBox-NovelDraw', type, requestId, ...payload },
            }));
        },
        $: selector => document.querySelector(selector),
        $$: selector => Array.from(document.querySelectorAll(selector)),
        click(node) { node.dispatchEvent(new document.defaultView.Event('click', { bubbles: true })); },
    };
}

function person(id, name, extra = {}) {
    return {
        id, enabled: true, name, aliases: [], type: 'girl', appearance: `${name} look`, negativeTags: '',
        danbooruTag: '', outfits: [], dynamicStates: [], ...extra,
    };
}

const GROUPS = [{ id: 'g1', name: '主角' }, { id: 'g2', name: '配角' }];

function startEditing(panel, id) {
    panel.nd.handleCharAction('edit', id, null, null);
    return panel.$(`.char-card.editing[data-id="${id}"]`);
}

// ── 第 2 条：空库但有分组 ─────────────────────────────────

test('an empty library that still has groups renders the empty groups instead of the empty state', (t) => {
    const panel = loadPanel(t, { characters: [], groups: GROUPS });
    const sections = panel.$$('#nd_char_list .char-group');
    sameJson(sections.map(section => section.dataset.groupId), ['g1', 'g2']);
    assert.equal(panel.$('#nd_char_list').style.display, 'flex');
    assert.equal(panel.$('#nd_char_empty').style.display, 'none');
    // 空分组仍带管理按钮：重命名 / 删除 / 组内添加
    for (const action of ['rename', 'delete', 'add']) {
        assert.ok(sections[0].querySelector(`[data-group-action="${action}"]`), action);
    }
    // 上移 / 下移 / 导出本组已从分组头移除
    for (const action of ['up', 'down', 'export']) {
        assert.equal(sections[0].querySelector(`[data-group-action="${action}"]`), null, action);
    }
    assert.match(sections[0].textContent, /本组暂无角色/);
});

test('without characters and groups the empty state is still shown', (t) => {
    const panel = loadPanel(t, { characters: [], groups: [] });
    assert.equal(panel.$('#nd_char_list').style.display, 'none');
    assert.equal(panel.$('#nd_char_empty').style.display, 'block');
    assert.match(panel.$('#nd_char_empty').textContent, /暂无角色配置/);
});

test('adding a character into an empty group works from the group header', (t) => {
    const panel = loadPanel(t, { characters: [], groups: GROUPS });
    panel.nd.handleGroupAction('add', 'g2', null);
    assert.equal(panel.$$('#nd_char_list .char-group[data-group-id="g2"] .char-card.editing').length, 1);
});

// ── 第 3 条：库操作不丢编辑草稿 ───────────────────────────

test('a library operation redraws without losing what was typed into the editing card', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃', { groupId: 'g1' }), person('c2', '小猫', { groupId: 'g1' }), person('c3', '路人')],
        groups: GROUPS,
    });
    const card = startEditing(panel, 'c1');
    card.querySelector('.char-edit-name').value = '阿璃（改）';
    card.querySelector('.char-edit-aliases').value = '小璃, 阿离';
    card.querySelector('.char-edit-appearance').value = 'long hair, edited';
    card.querySelector('.char-edit-neg').value = 'bad hands';
    panel.click(card.querySelector('[data-action="add-outfit"]'));
    card.querySelector('.char-outfit-name').value = '礼服';
    card.querySelector('.char-outfit-tags').value = 'evening dress';
    panel.click(card.querySelector('[data-action="add-dynstate"]')); // 还没填内容的空行也要保留

    // 对其它角色做一次库操作：停用 c2（会重绘整个列表）、新建分组、移动 c3
    panel.nd.applyCharacterLibrary(CL.setCharactersEnabled(panel.nd.getCharacterLibrary(), ['c2'], false));
    panel.nd.applyCharacterLibrary(CL.createGroup(panel.nd.getCharacterLibrary(), '新组').library);
    panel.nd.applyCharacterLibrary(CL.moveCharacters(panel.nd.getCharacterLibrary(), ['c3'], { groupId: 'g2' }));

    const after = panel.$('.char-card.editing[data-id="c1"]');
    assert.ok(after, '仍处于编辑状态');
    assert.equal(after.querySelector('.char-edit-name').value, '阿璃（改）');
    assert.equal(after.querySelector('.char-edit-aliases').value, '小璃, 阿离');
    assert.equal(after.querySelector('.char-edit-appearance').value, 'long hair, edited');
    assert.equal(after.querySelector('.char-edit-neg').value, 'bad hands');
    assert.equal(after.querySelectorAll('.char-outfit-editor-item').length, 1);
    assert.equal(after.querySelector('.char-outfit-name').value, '礼服');
    assert.equal(after.querySelector('.char-outfit-tags').value, 'evening dress');
    assert.equal(after.querySelectorAll('.char-dynstate-editor-item').length, 1, '空的状态行没有被吞掉');
    // 草稿没有被写进库：已保存的 c1 仍是原样，要点“保存”才生效
    assert.equal(panel.state().characterTags.find(char => char.id === 'c1').name, '阿璃');
    assert.equal(panel.lastSave().characterTags.find(char => char.id === 'c1').name, '阿璃');
    // 保存时取到的是恢复后的表单内容
    panel.nd.handleCharAction('save', 'c1', after, null);
    const saved = panel.state().characterTags.find(char => char.id === 'c1');
    assert.equal(saved.name, '阿璃（改）');
    sameJson(saved.outfits, [{ name: '礼服', tags: 'evening dress' }]);
    sameJson(saved.dynamicStates, [], '空行在保存时被过滤');
});

test('cancel discards the draft and switching to another card does not carry the old draft over', (t) => {
    const panel = loadPanel(t, { characters: [person('c1', '阿璃'), person('c2', '小猫')], groups: GROUPS });
    let card = startEditing(panel, 'c1');
    card.querySelector('.char-edit-name').value = '临时名';
    panel.nd.applyCharacterLibrary(CL.createGroup(panel.nd.getCharacterLibrary(), '新组').library);
    panel.nd.handleCharAction('cancel', 'c1', null, null);
    card = startEditing(panel, 'c1');
    assert.equal(card.querySelector('.char-edit-name').value, '阿璃');
    startEditing(panel, 'c2');
    assert.equal(panel.$('.char-card.editing[data-id="c2"] .char-edit-name').value, '小猫');
});

test('the draft also survives an INIT_DATA push from the host (for example after toggling auto-learn)', (t) => {
    const panel = loadPanel(t, { characters: [person('c1', '阿璃')], groups: GROUPS });
    const card = startEditing(panel, 'c1');
    card.querySelector('.char-edit-appearance').value = 'unsaved appearance';
    // 宿主回推的是已保存的角色表
    panel.initData({ characterTags: [person('c1', '阿璃')], characterGroups: GROUPS });
    assert.equal(panel.$('.char-card.editing[data-id="c1"] .char-edit-appearance').value, 'unsaved appearance');
});

// ── 第 4 条：空白草稿不被持久化 ───────────────────────────

test('a blank new-character draft is never persisted by a later library operation', (t) => {
    const panel = loadPanel(t, { characters: [person('c1', '阿璃'), person('c2', '小猫')], groups: GROUPS });
    panel.click(panel.$('#nd_char_add')); // 顶部“添加角色”
    panel.nd.handleGroupAction('add', 'g1', null); // 再从分组头添加：前一个空白草稿被放弃
    const draftId = panel.nd.getEditingCharId();
    assert.ok(draftId);
    assert.equal(panel.nd.draftCharacters.has(draftId), true);
    assert.equal(panel.state().characterTags.some(char => char.id === draftId), true, '草稿在页面里可见');

    panel.nd.applyCharacterLibrary(CL.setCharactersEnabled(panel.nd.getCharacterLibrary(), ['c1'], false));
    const saved = panel.lastSave();
    sameJson(saved.characterTags.map(char => char.id), ['c1', 'c2'], '存盘内容里没有空名草稿');
    assert.equal(saved.characterTags.some(char => char.name === ''), false);
    assert.equal(panel.$$('#nd_char_list .char-card.editing').length, 1, '草稿卡片仍在编辑');
});

test('saving the draft makes it a real character; cancelling or leaving it removes it', (t) => {
    const panel = loadPanel(t, { characters: [person('c1', '阿璃')], groups: GROUPS });
    panel.nd.handleGroupAction('add', 'g1', null);
    const draftId = panel.nd.getEditingCharId();
    let card = panel.$(`.char-card.editing[data-id="${draftId}"]`);
    card.querySelector('.char-edit-name').value = '新角色甲';
    panel.nd.handleCharAction('save', draftId, card, null);
    assert.equal(panel.nd.draftCharacters.has(draftId), false);
    sameJson(panel.lastSave().characterTags.map(char => char.name), ['阿璃', '新角色甲']);

    panel.nd.handleGroupAction('add', 'g2', null);
    const second = panel.nd.getEditingCharId();
    panel.nd.handleCharAction('cancel', second, null, null);
    assert.equal(panel.state().characterTags.some(char => char.id === second), false, '取消后空白草稿被移除');

    panel.nd.handleGroupAction('add', 'g2', null);
    const third = panel.nd.getEditingCharId();
    startEditing(panel, 'c1'); // 转去编辑别的卡片 = 放弃草稿
    assert.equal(panel.state().characterTags.some(char => char.id === third), false);
    assert.equal(panel.nd.draftCharacters.size, 0);
});

test('a blank draft is excluded from undo snapshots, the fingerprint, exports and batch actions', (t) => {
    const panel = loadPanel(t, { characters: [person('c1', '阿璃'), person('c2', '小猫')], groups: GROUPS });
    const before = panel.nd.libraryFingerprint();
    panel.nd.handleGroupAction('add', 'g1', null);
    const draftId = panel.nd.getEditingCharId();
    assert.equal(panel.nd.libraryFingerprint(), before, '新增草稿不改变指纹，因此不会让撤销失效');
    sameJson(panel.nd.cloneLibrary(panel.nd.getCharacterLibrary()).characters.map(char => char.id), ['c1', 'c2']);
    sameJson(panel.nd.getPersistedLibrary().characters.map(char => char.id), ['c1', 'c2']);

    // 删除一个角色并撤销：草稿保持存在且仍未持久化
    panel.nd.deleteCharactersWithUndo(['c2'], '已删除');
    assert.equal(panel.lastSave().characterTags.some(char => char.name === ''), false);
    panel.nd.performUndo();
    sameJson(panel.lastSave().characterTags.map(char => char.id), ['c1', 'c2']);
    assert.equal(panel.state().characterTags.some(char => char.id === draftId), true, '撤销后草稿仍在页面里');
    assert.equal(panel.nd.getEditingCharId(), draftId);

    // 批量操作不碰草稿
    panel.nd.selectedCharIds.add(draftId);
    panel.nd.selectedCharIds.add('c1');
    panel.nd.runBatchAction('copy');
    const names = Array.from(panel.lastSave().characterTags, char => char.name);
    assert.equal(names.length, 3, '只复制了 c1（共 3 个），没有复制空白草稿');
    assert.equal(names.includes(''), false);
    assert.ok(names.some(name => name.includes('阿璃') && name !== '阿璃'), '复制出的是 c1 的副本');
});

// ── 导出：“导出”按钮弹出范围对话框 ─────────────────────────

const exportDialog = panel => panel.$('[data-role="dialog"]');
const exportRole = (panel, role) => panel.$(`[data-role="${role}"]`);

function pickExportGroup(panel, groupId) {
    const select = exportRole(panel, 'group-select');
    Array.from(select.querySelectorAll('option')).find(option => option.value === groupId).selected = true;
    select.dispatchEvent(new panel.document.defaultView.Event('change', { bubbles: true }));
}

function pressKey(panel, node, key) {
    const event = new panel.document.defaultView.Event('keydown', { bubbles: true, cancelable: true });
    event.key = key;
    node.dispatchEvent(event);
    return event;
}

test('the export button opens a scope dialog instead of downloading, and cancelling exports nothing', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃'), person('c2', '芙蕾雅', { groupId: 'g1' }), person('c3', '路人甲', { groupId: 'g1' })],
        groups: GROUPS,
    });
    panel.click(panel.$('#nd_char_export'));
    assert.ok(exportDialog(panel), '弹出对话框');
    assert.equal(panel.blobs.length, 0, '点“导出”本身不下载');
    assert.equal(exportRole(panel, 'scope-all').checked, true, '无多选时默认“全部”');
    assert.equal(exportRole(panel, 'scope-all-label').textContent, '全部（3 个角色）');
    assert.equal(exportRole(panel, 'scope-selection').disabled, true, '无多选时“当前已选”禁用');
    const labels = Array.from(exportRole(panel, 'group-select').querySelectorAll('option')).map(option => option.textContent);
    assert.deepEqual(labels, ['未分组（1 个）', '主角（2 个）', '配角（0 个，无可导出）']);

    panel.click(exportRole(panel, 'cancel'));
    assert.equal(exportDialog(panel), null);
    assert.equal(panel.blobs.length, 0, '取消不导出');
    assert.deepEqual(panel.dialogs.alerts, []);

    // Esc 与点遮罩同样不导出
    panel.click(panel.$('#nd_char_export'));
    panel.document.dispatchEvent(Object.assign(new panel.document.defaultView.Event('keydown', { cancelable: true }), { key: 'Escape' }));
    assert.equal(exportDialog(panel), null);
    panel.click(panel.$('#nd_char_export'));
    panel.click(exportRole(panel, 'overlay'));
    assert.equal(exportDialog(panel), null);
    assert.equal(panel.blobs.length, 0);
    assert.deepEqual(panel.errors, []);
});

test('export scopes: all, one group and the current selection produce the matching file content', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃'), person('c2', '芙蕾雅', { groupId: 'g1' }), person('c3', '路人甲', { groupId: 'g1' }), person('c4', '小猫', { groupId: 'g2' })],
        groups: GROUPS,
    });
    const last = () => JSON.parse(panel.blobs.at(-1));

    // 全部
    panel.click(panel.$('#nd_char_export'));
    panel.click(exportRole(panel, 'confirm'));
    assert.equal(panel.blobs.length, 1);
    assert.equal(last().scope, 'all');
    sameJson(last().characters.map(char => char.id), ['c1', 'c2', 'c3', 'c4']);
    assert.equal(exportDialog(panel), null, '导出后对话框关闭');

    // 某个分组：不含其它组的角色，文件里只带该分组
    panel.click(panel.$('#nd_char_export'));
    pickExportGroup(panel, 'g1');
    panel.click(exportRole(panel, 'confirm'));
    assert.equal(panel.blobs.length, 2);
    assert.equal(last().scope, 'group');
    sameJson(last().characters.map(char => char.id), ['c2', 'c3']);
    sameJson(last().groups.map(group => group.id), ['g1']);

    // 未分组
    panel.click(panel.$('#nd_char_export'));
    pickExportGroup(panel, '');
    panel.click(exportRole(panel, 'confirm'));
    sameJson(last().characters.map(char => char.id), ['c1']);

    // 当前已选：进入多选后默认“当前已选”
    panel.click(panel.$('#nd_char_select_toggle'));
    panel.nd.selectedCharIds.add('c1');
    panel.nd.selectedCharIds.add('c4');
    panel.click(panel.$('#nd_char_export'));
    assert.equal(exportRole(panel, 'scope-selection').checked, true, '有多选时默认“当前已选”');
    assert.equal(exportRole(panel, 'scope-selection-label').textContent, '当前已选（2 个）');
    panel.click(exportRole(panel, 'confirm'));
    assert.equal(panel.blobs.length, 4);
    assert.equal(last().scope, 'selection');
    sameJson(last().characters.map(char => char.id), ['c1', 'c4']);
    assert.deepEqual(panel.errors, []);
});

test('exports never contain the unsaved blank draft (whole library, a group, a selection)', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃', { groupId: 'g1' }), person('c2', '小猫', { groupId: 'g1' })],
        groups: GROUPS,
    });
    panel.nd.handleGroupAction('add', 'g1', null); // 草稿和已保存角色同在 g1
    const draftId = panel.nd.getEditingCharId();
    assert.equal(panel.nd.draftCharacters.has(draftId), true);
    const exportedIds = () => JSON.parse(panel.blobs.at(-1)).characters.map(char => char.id);

    panel.blobs.length = 0;
    panel.click(panel.$('#nd_char_export')); // 全部导出：计数只算已保存的角色
    assert.equal(exportRole(panel, 'scope-all-label').textContent, '全部（2 个角色）');
    panel.click(exportRole(panel, 'confirm'));
    sameJson(exportedIds(), ['c1', 'c2']);

    panel.click(panel.$('#nd_char_export')); // 分组导出
    pickExportGroup(panel, 'g1');
    assert.match(Array.from(exportRole(panel, 'group-select').querySelectorAll('option')).find(option => option.value === 'g1').textContent, /（2 个）/);
    panel.click(exportRole(panel, 'confirm'));
    sameJson(exportedIds(), ['c1', 'c2']);

    // 选中里夹带草稿：对话框的“已选”不算草稿，导出也不含草稿
    panel.nd.selectedCharIds.add(draftId);
    panel.nd.selectedCharIds.add('c1');
    panel.click(panel.$('#nd_char_export'));
    assert.equal(exportRole(panel, 'scope-selection-label').textContent, '当前已选（1 个）');
    panel.click(exportRole(panel, 'confirm'));
    sameJson(exportedIds(), ['c1']);

    // 批量条里的“导出所选”保持直接下载
    panel.nd.runBatchAction('export');
    sameJson(exportedIds(), ['c1']);
    assert.equal(panel.blobs.length, 4);
});

test('the batch bar export-selected button still downloads directly; the batch-card export button never does', (t) => {
    const panel = loadPanel(t, { characters: [person('c1', '阿璃'), person('c2', '小猫')], groups: GROUPS });
    panel.click(panel.$('#nd_char_select_toggle'));
    panel.nd.selectedCharIds.add('c2');
    panel.nd.renderCharList(); // 重绘并刷新批量条（有选中项才启用按钮）
    panel.click(panel.$('[data-batch="export"]'));
    assert.equal(exportDialog(panel), null, '导出所选不弹对话框');
    assert.equal(panel.blobs.length, 1);
    sameJson(JSON.parse(panel.blobs[0]).characters.map(char => char.id), ['c2']);

    panel.click(panel.$('#nd_char_export'));
    assert.ok(exportDialog(panel));
    assert.equal(panel.blobs.length, 1, '“导出”只弹对话框，不会再下载');
});

test('exporting an empty library alerts instead of opening a dialog', (t) => {
    const panel = loadPanel(t, { characters: [], groups: GROUPS });
    panel.click(panel.$('#nd_char_export'));
    assert.equal(exportDialog(panel), null);
    assert.equal(panel.blobs.length, 0);
    assert.match(panel.dialogs.alerts.at(-1), /没有可导出的角色/);
});

// ── 分组头：按钮精简、手柄可聚焦、键盘排序、窄栏布局 ───────────────

test('the group header has no up/down/export buttons and its drag handle is a focusable button', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃'), person('c2', '芙蕾雅', { groupId: 'g1' })],
        groups: GROUPS,
    });
    const sections = panel.$$('#nd_char_list .char-group');
    sameJson(sections.map(section => section.dataset.groupId), ['', 'g1', 'g2']);
    for (const section of sections.slice(1)) {
        const actions = Array.from(section.querySelectorAll('[data-group-action]')).map(node => node.dataset.groupAction);
        sameJson(actions, ['collapse', 'toggle-enabled', 'add', 'rename', 'menu', 'toggle-lock', 'delete']); // toggle-enabled / toggle-lock 是分组自己的开关与锁；锁与删除在“…”菜单里
        const handle = section.querySelector('[data-drag-group]');
        assert.equal(handle.getAttribute('role'), 'button');
        assert.equal(handle.getAttribute('tabindex'), '0');
        assert.match(handle.getAttribute('title'), /↑ \/ ↓/);
    }
    sameJson(
        Array.from(sections[0].querySelectorAll('[data-group-action]')).map(node => node.dataset.groupAction),
        ['collapse', 'add'],
    );
    assert.equal(sections[0].querySelector('[data-drag-group]'), null, '未分组没有手柄');
    assert.equal(sections[0].querySelector('[data-group-action="toggle-enabled"]'), null, '未分组没有开关');
    // 已删除的分支不再被处理：伪造的 up / down / export 动作什么也不做
    const before = panel.nd.libraryFingerprint();
    for (const action of ['up', 'down', 'export']) panel.nd.handleGroupAction(action, 'g2', null);
    assert.equal(panel.nd.libraryFingerprint(), before);
    assert.equal(panel.blobs.length, 0);
});

test('keyboard: arrow keys on a group handle reorder the groups and stop at the edges', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃', { groupId: 'g1' }), person('c2', '芙蕾雅', { groupId: 'g2' })],
        groups: [...GROUPS, { id: 'g3', name: '路人' }],
    });
    const handleOf = id => panel.$(`#nd_char_list [data-drag-group="${id}"]`);
    const order = () => panel.state().characterGroups.map(group => group.id);
    const sectionOrder = () => panel.$$('#nd_char_list .char-group').map(section => section.dataset.groupId);
    sameJson(order(), ['g1', 'g2', 'g3']);

    const up = pressKey(panel, handleOf('g2'), 'ArrowUp');
    assert.equal(up.defaultPrevented, true);
    sameJson(order(), ['g2', 'g1', 'g3']);
    sameJson(sectionOrder(), ['g2', 'g1', 'g3'], '没有未分组角色时不渲染未分组区');
    assert.equal(panel.lastSave().characterGroups.map(group => group.id).join(), 'g2,g1,g3', '排序已保存');
    sameJson(panel.state().characterTags.map(char => [char.id, char.groupId]), [['c1', 'g1'], ['c2', 'g2']], '角色的分组归属不变');

    // 顶部再按 ↑、底部再按 ↓：不动，也不保存
    panel.posted.length = 0;
    pressKey(panel, handleOf('g2'), 'ArrowUp');
    sameJson(order(), ['g2', 'g1', 'g3']);
    pressKey(panel, handleOf('g3'), 'ArrowDown');
    sameJson(order(), ['g2', 'g1', 'g3']);
    assert.equal(panel.lastSave(), undefined, '边界处没有保存');

    pressKey(panel, handleOf('g2'), 'ArrowDown');
    sameJson(order(), ['g1', 'g2', 'g3']);
    // 其他按键不拦截
    const other = pressKey(panel, handleOf('g2'), 'a');
    assert.equal(other.defaultPrevented, false);
    sameJson(order(), ['g1', 'g2', 'g3']);
    assert.deepEqual(panel.errors, []);
});

test('the group count is compact and keeps the full meaning in its title, including after a toggle', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃', { groupId: 'g1' }), person('c2', '芙蕾雅', { groupId: 'g1', enabled: false })],
        groups: GROUPS,
    });
    const count = id => panel.$(`#nd_char_list .char-group[data-group-id="${id}"] .char-group-count`);
    assert.equal(count('g1').textContent, '1/2');
    assert.equal(count('g1').getAttribute('title'), '组内自己开着的角色 1 个，共 2 个');
    assert.equal(panel.$('#nd_char_list .char-group[data-group-id="g1"] .char-group-name').getAttribute('title'), '主角');
    // 切换分组开关不改计数（计数是“自己开着的数”），只在 title 里补一句分组已关闭
    panel.nd.handleGroupAction('toggle-enabled', 'g1', null);
    assert.equal(count('g1').textContent, '1/2');
    assert.equal(count('g1').getAttribute('title'), '组内自己开着的角色 1 个，共 2 个；分组已关闭，组内角色当前都不参与出图');
    // 卡片自己的开关改变计数
    panel.click(panel.$('#nd_char_list .char-card[data-id="c2"] [data-action="toggle-enabled"]'));
    assert.equal(count('g1').textContent, '2/2');
    assert.equal(count('g1').getAttribute('title'), '组内自己开着的角色 2 个，共 2 个；分组已关闭，组内角色当前都不参与出图');
});

test('the group header gives the name a minimum width and lets the buttons wrap instead of squeezing it out', () => {
    const html = fs.readFileSync(PAGE, 'utf8');
    const rule = selector => html.match(new RegExp(`${selector.replace(/[.]/g, '\\.')}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
    assert.match(rule('.char-group-name'), /min-width:\s*6em/);
    assert.match(rule('.char-group-name'), /text-overflow:\s*ellipsis/);
    assert.match(rule('.char-group-header'), /flex-wrap:\s*wrap/);
    assert.match(rule('.char-group-actions'), /margin-left:\s*auto/);
    assert.match(rule('.char-group-count'), /flex-shrink:\s*0/);
});

// ── 第 8 条：撤销指纹对规范化免疫 ─────────────────────────

test('the undo fingerprint ignores normalization differences but still detects real changes', (t) => {
    // 页面里的角色缺少宿主规范化时会补全的字段（danbooruTag、outfits 等）
    const sparse = { id: 'c1', enabled: true, name: '阿璃', aliases: [' 小璃 '], type: 'girl', appearance: 'a' };
    const panel = loadPanel(t, { characters: [sparse, person('c2', '小猫')], groups: GROUPS });
    panel.nd.deleteCharactersWithUndo(['c2'], '已删除');
    assert.equal(panel.nd.isUndoStale(), false);

    // 宿主回推同样内容但已规范化的版本：不应使撤销失效
    const normalized = CL.normalizeCharacterLibrary({ characters: [sparse], groups: GROUPS });
    assert.notDeepEqual(normalized.characters[0], sparse, '前提：规范化确实改变了对象形态');
    panel.state().characterTags = normalized.characters;
    panel.state().characterGroups = normalized.groups;
    assert.equal(panel.nd.isUndoStale(), false, '规范化差异不应让撤销失效');

    // 真实内容变化（改名）仍然使撤销失效
    panel.state().characterTags = [{ ...normalized.characters[0], name: '阿璃二号' }];
    assert.equal(panel.nd.isUndoStale(), true);
});

test('an INIT_DATA push with the same content in normalized form keeps the undo available; changed content expires it', (t) => {
    const sparse = { id: 'c1', enabled: true, name: '阿璃', aliases: [], type: 'girl', appearance: 'a' };
    const panel = loadPanel(t, { characters: [sparse, person('c2', '小猫')], groups: GROUPS });
    panel.nd.deleteCharactersWithUndo(['c2'], '已删除小猫');
    const undoBar = () => panel.$('#nd_char_undo');
    assert.equal(undoBar().classList.contains('hidden'), false);

    const normalized = CL.normalizeCharacterLibrary({ characters: [sparse], groups: GROUPS });
    panel.initData({ characterTags: normalized.characters, characterGroups: normalized.groups });
    assert.ok(panel.nd.getUndoState(), '内容没变的 INIT_DATA 不使撤销失效');
    assert.equal(undoBar().classList.contains('hidden'), false);

    panel.initData({ characterTags: [{ ...normalized.characters[0], name: '被自动学习改名' }], characterGroups: normalized.groups });
    assert.equal(panel.nd.getUndoState(), null, '内容真的变了：撤销失效');
    assert.match(panel.$('#nd_char_undo_text').textContent, /无法撤销/);
});

test('the delete-group prompt does not claim the deletion is irreversible, because an undo bar follows', (t) => {
    const panel = loadPanel(t, { characters: [person('c1', '阿璃', { groupId: 'g1' })], groups: GROUPS });
    panel.answers.confirm.push(true, true); // 确认删除分组；并连同角色一起删除
    panel.nd.handleGroupAction('delete', 'g1', null);
    assert.equal(panel.dialogs.confirms.length, 2);
    assert.doesNotMatch(panel.dialogs.confirms[1], /不可撤销/);
    assert.match(panel.dialogs.confirms[1], /撤销/);
    assert.equal(panel.$('#nd_char_undo').classList.contains('hidden'), false, '删除后确实提供了撤销条');
    panel.nd.performUndo();
    assert.equal(panel.state().characterTags.length, 1);
    assert.equal(panel.state().characterGroups.length, 2);
});

test('an INIT_DATA push does not make a half-typed new character vanish', (t) => {
    const panel = loadPanel(t, { characters: [person('c1', '阿璃')], groups: GROUPS });
    panel.click(panel.$('#nd_char_add'));
    const draftId = panel.nd.getEditingCharId();
    panel.$(`.char-card.editing[data-id="${draftId}"] .char-edit-name`).value = '写了一半的名字';
    // 宿主的 INIT_DATA 里没有这个未保存的角色
    panel.initData({ characterTags: [person('c1', '阿璃')], characterGroups: GROUPS });
    const card = panel.$(`.char-card.editing[data-id="${draftId}"]`);
    assert.ok(card, '草稿卡片还在');
    assert.equal(card.querySelector('.char-edit-name').value, '写了一半的名字');
    assert.equal(panel.nd.draftCharacters.has(draftId), true);
    // 仍然没有被持久化
    panel.nd.applyCharacterLibrary(CL.setCharactersEnabled(panel.nd.getCharacterLibrary(), ['c1'], false));
    sameJson(Array.from(panel.lastSave().characterTags, char => char.id), ['c1']);
});

// ── 第二轮审核：拖拽落在自己身上 / 编辑草稿的分组下拉框 / 草稿不计入显示数 ──

// linkedom 没有布局：给每张卡片一个固定高度的矩形（自上而下，每张 100px），并让 elementFromPoint 返回指定节点。
function layoutCards(panel) {
    let top = 0;
    for (const card of panel.$$('#nd_char_list .char-card')) {
        const rect = { top, bottom: top + 100, height: 100, left: 0, right: 300, width: 300 };
        card.getBoundingClientRect = () => rect;
        top += 100;
    }
}

function dragCharacter(panel, { handleId, overId, startY = 10, moveY, endY = moveY }) {
    layoutCards(panel);
    const Event = panel.document.defaultView.Event;
    const fire = (target, type, props) => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.assign(event, { button: 0, pointerId: 1, clientX: 20, ...props });
        target.dispatchEvent(event);
    };
    const handle = panel.$(`[data-drag-char="${handleId}"]`);
    const over = panel.$(`.char-card[data-id="${overId}"] .char-identity`) || panel.$(`.char-card[data-id="${overId}"]`);
    panel.document.elementFromPoint = () => over;
    fire(handle, 'pointerdown', { clientY: startY });
    fire(panel.document, 'pointermove', { clientY: moveY });
    fire(panel.document, 'pointerup', { clientY: endY });
}

// linkedom 的 <select>.value 只有 getter：用 selected 属性模拟“用户在下拉框里选了某项”。
function chooseOption(select, value) {
    for (const option of select.querySelectorAll('option')) {
        if (option.getAttribute('value') === value) option.setAttribute('selected', ''); else option.removeAttribute('selected');
    }
}

const idsOfGroup = (panel, groupId) => panel.state().characterTags.filter(char => (char.groupId || '') === groupId).map(char => char.id);
const threeInG1 = () => [person('c1', '阿璃', { groupId: 'g1' }), person('c2', '小猫', { groupId: 'g1' }), person('c3', '路人', { groupId: 'g1' })];

test('dropping a dragged card onto itself leaves the order alone instead of sending it to the end of the group', (t) => {
    // 对照：落在别的卡片下半区确实会移动（说明拖拽测试装置有效）
    const control = loadPanel(t, { characters: threeInG1(), groups: GROUPS });
    dragCharacter(control, { handleId: 'c1', overId: 'c3', moveY: 290 });
    sameJson(idsOfGroup(control, 'g1'), ['c2', 'c3', 'c1']);
    assert.ok(control.lastSave(), '对照组：真实移动会保存');

    const panel = loadPanel(t, { characters: threeInG1(), groups: GROUPS });
    // c1 位于 0-100：指针在 c1 自己身上，且在其余卡片（c2 中线 150）之前
    dragCharacter(panel, { handleId: 'c1', overId: 'c1', moveY: 50 });
    sameJson(idsOfGroup(panel, 'g1'), ['c1', 'c2', 'c3'], '原地不动');
    assert.equal(panel.lastSave(), undefined, '没有变化就不保存');
});

test('dropping a multi-selection onto one of its own members keeps the order', (t) => {
    const panel = loadPanel(t, { characters: threeInG1(), groups: GROUPS });
    panel.nd.setSelectMode(true);
    panel.nd.selectedCharIds.add('c1');
    panel.nd.selectedCharIds.add('c2');
    panel.nd.renderCharList();
    dragCharacter(panel, { handleId: 'c1', overId: 'c2', moveY: 150 });
    sameJson(idsOfGroup(panel, 'g1'), ['c1', 'c2', 'c3']);
    assert.equal(panel.lastSave(), undefined);
});

test('a dragged card over itself is placed by the pointer position among the remaining cards of its group', (t) => {
    const panel = loadPanel(t, { characters: threeInG1(), groups: GROUPS });
    // 指针在 c1 身上但已越过 c2 的中线（150）、没越过 c3 的中线（250）：插到 c3 之前
    dragCharacter(panel, { handleId: 'c1', overId: 'c1', moveY: 200 });
    sameJson(idsOfGroup(panel, 'g1'), ['c2', 'c1', 'c3']);
});

test('the group select in the editing card keeps the unsaved choice across redraws and falls back when the group is deleted', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃', { groupId: 'g1' }), person('c2', '小猫')],
        groups: GROUPS,
    });
    const select = () => panel.$('.char-card.editing[data-id="c1"] .char-edit-group');
    startEditing(panel, 'c1');
    assert.equal(select().value, 'g1');
    chooseOption(select(), 'g2');
    // 对别的角色做库操作会整体重绘：下拉框仍是用户选的 g2
    panel.nd.applyCharacterLibrary(CL.setCharactersEnabled(panel.nd.getCharacterLibrary(), ['c2'], false));
    assert.equal(select().value, 'g2');
    assert.equal(panel.state().characterTags.find(char => char.id === 'c1').groupId, 'g1', '没点保存之前库里仍是 g1');
    panel.nd.handleCharAction('save', 'c1', panel.$('.char-card.editing[data-id="c1"]'), null);
    assert.equal(panel.state().characterTags.find(char => char.id === 'c1').groupId, 'g2');

    // 选了 g1 但随后把 g1 删掉：回落为“未分组”，而不是指向不存在的分组
    startEditing(panel, 'c1');
    chooseOption(select(), 'g1');
    panel.nd.applyCharacterLibrary(CL.deleteGroup(panel.nd.getCharacterLibrary(), 'g1'));
    assert.equal(select().value, '');
});

test('an untouched group select follows the character when its saved group is changed from elsewhere', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃', { groupId: 'g1' }), person('c2', '小猫')],
        groups: GROUPS,
    });
    const select = () => panel.$('.char-card.editing[data-id="c1"] .char-edit-group');
    startEditing(panel, 'c1');
    panel.nd.applyCharacterLibrary(CL.moveCharacters(panel.nd.getCharacterLibrary(), ['c1'], { groupId: 'g2' }));
    assert.equal(select().value, 'g2', '用户没碰过下拉框：以库里最新的分组为准');
});

test('an unsaved draft is not counted in the stats, the 500 hint or select-all', (t) => {
    const many = Array.from({ length: CL.BACKEND_ENABLED_CHARACTER_LIMIT }, (_, index) => person(`m${index}`, `角色${index}`));
    const panel = loadPanel(t, { characters: many, groups: GROUPS });
    assert.equal(panel.$('#nd_char_limit_hint').classList.contains('hidden'), true, '前提：恰好 500 个不提示');
    panel.nd.handleGroupAction('add', 'g1', null); // 空白草稿默认 enabled=true
    const draftId = panel.nd.getEditingCharId();
    assert.equal(panel.$('#nd_char_stat_total').textContent, '500');
    assert.equal(panel.$('#nd_char_stat_enabled').textContent, '500');
    assert.equal(panel.$('#nd_char_stat_missing').textContent, '0');
    assert.equal(panel.$('#nd_char_limit_hint').classList.contains('hidden'), true, '草稿不会触发 500 上限提示');
    assert.equal(panel.$('#nd_char_result_count').textContent, '500 / 500');

    // 全选只选已保存的角色
    panel.nd.runBatchAction('select-all');
    assert.equal(panel.nd.selectedCharIds.has(draftId), false);
    assert.equal(panel.nd.selectedCharIds.size, 500);
    assert.equal(panel.nd.visibleCharacterIds().includes(draftId), false);

    // 草稿卡片不渲染选择框；其所在分组的复选框也不会把草稿选进去
    panel.nd.selectedCharIds.clear();
    panel.nd.setSelectMode(true);
    panel.nd.renderCharList();
    assert.equal(panel.$(`.char-card.editing[data-id="${draftId}"] .char-select`), null, '草稿卡片没有选择框');
    const groupBox = panel.$('.char-group[data-group-id="g1"] .char-group-select');
    assert.equal(groupBox.disabled, true, '只含草稿的分组，分组复选框不可用');
    groupBox.checked = true;
    groupBox.dispatchEvent(new panel.document.defaultView.Event('change', { bubbles: true }));
    assert.equal(panel.nd.selectedCharIds.has(draftId), false);
});

test('in multi-select mode a group holding saved characters plus an unsaved draft can still be checked and unchecked as a whole', (t) => {
    const panel = loadPanel(t, {
        characters: [person('a', '甲', { groupId: 'g1' }), person('b', '乙', { groupId: 'g1' }), person('c', '丙', { groupId: 'g2' })],
        groups: GROUPS,
    });
    panel.nd.handleGroupAction('add', 'g1', null); // g1 里多出一张未保存草稿
    const draftId = panel.nd.getEditingCharId();
    assert.equal(panel.nd.draftCharacters.has(draftId), true);
    panel.nd.setSelectMode(true);
    panel.nd.renderCharList();
    const section = () => panel.$('.char-group[data-group-id="g1"]');
    const groupBox = () => section().querySelector('.char-group-select');
    const fire = (box) => box.dispatchEvent(new panel.document.defaultView.Event('change', { bubbles: true }));
    assert.equal(section().querySelectorAll('.char-select').length, 2, '只有 2 个已保存角色带选择框');

    groupBox().checked = true;
    fire(groupBox());
    sameJson([...panel.nd.selectedCharIds].sort(), ['a', 'b']);
    assert.equal(groupBox().checked, true, '分组复选框全选态');
    assert.equal(groupBox().indeterminate, false);

    groupBox().checked = false;
    fire(groupBox());
    assert.equal(panel.nd.selectedCharIds.size, 0);
    assert.equal(groupBox().checked, false);
    assert.equal(groupBox().indeterminate, false);
});

test('the delete-group prompt counts saved characters only, and skips the prompt for a group holding just a draft', (t) => {
    const panel = loadPanel(t, { characters: [person('c1', '阿璃', { groupId: 'g1' })], groups: GROUPS });
    panel.nd.handleGroupAction('add', 'g1', null);
    panel.answers.confirm.push(true, true);
    panel.nd.handleGroupAction('delete', 'g1', null);
    assert.match(panel.dialogs.confirms[1], /该分组有 1 个角色/);

    const onlyDraft = loadPanel(t, { characters: [], groups: GROUPS });
    onlyDraft.nd.handleGroupAction('add', 'g1', null);
    onlyDraft.answers.confirm.push(true);
    onlyDraft.nd.handleGroupAction('delete', 'g1', null);
    assert.equal(onlyDraft.dialogs.confirms.length, 1, '只有未保存草稿的分组不再追问“有 N 个角色”');
});

// ── 图片管理：保存/删除之后不能把已展开的分组重新折叠 ─────────────────

const GALLERY_SUMMARY = (extra = {}) => ({
    苍玄界: { count: 2, totalSize: 100, latestTimestamp: 5, slots: { s1: { count: 2 } }, ...extra },
});
const GALLERY_SLOTS = () => ({
    s1: [
        { imgId: 'a', slotId: 's1', timestamp: 5, savedUrl: '/img/a.png' },
        { imgId: 'b', slotId: 's1', timestamp: 4, savedUrl: '/img/b.png' },
    ],
});

const NO_SETTINGS = () => ({ characterTags: [], characterGroups: [] });

// 宿主真实顺序（novel-draw.js sendInitData）：先发不带统计的 INIT_DATA，IndexedDB 算完后再发带真实摘要的 CACHE_DATA。
function openGallerySection(panel, slots = GALLERY_SLOTS()) {
    panel.initData(NO_SETTINGS());
    panel.send('CACHE_DATA', { cacheStats: { count: 2, sizeMB: 1 }, gallerySummary: GALLERY_SUMMARY() });
    panel.click(panel.$('.gallery-char-header'));
    assert.ok(panel.posted.some(message => message.type === 'LOAD_CHARACTER_PREVIEWS' && message.charName === '苍玄界'));
    panel.send('CHARACTER_PREVIEWS_LOADED', { charName: '苍玄界', slots });
    assert.equal(panel.$$('.gallery-slot').length, 1, '展开后画出了图片组');
    panel.posted.length = 0;
}

const requestedPreviews = panel => panel.posted.filter(message => message.type === 'LOAD_CHARACTER_PREVIEWS');

test('host order after saving an image: INIT_DATA without stats, then CACHE_DATA, keeps the group expanded with its images', (t) => {
    const panel = loadPanel(t);
    openGallerySection(panel);

    // 先行的 INIT_DATA 不带 cacheStats / gallerySummary：画廊与统计都保持原状
    panel.initData(NO_SETTINGS());
    let section = panel.$('.gallery-char-section');
    assert.equal(section.classList.contains('collapsed'), false, '先行的 INIT_DATA 不应折叠已展开的分组');
    assert.equal(panel.$$('.gallery-slot').length, 1, '图片组仍在');
    assert.equal(panel.$('#nd_cache_count').textContent, '2', '没带统计就保持上一次的统计');
    assert.equal(requestedPreviews(panel).length, 0);

    // 随后到的 CACHE_DATA 数据没变：同样不重新要
    panel.send('CACHE_DATA', { cacheStats: { count: 2, sizeMB: 1 }, gallerySummary: GALLERY_SUMMARY() });
    section = panel.$('.gallery-char-section');
    assert.equal(section.classList.contains('collapsed'), false);
    assert.equal(panel.$$('.gallery-slot').length, 1);
    assert.equal(requestedPreviews(panel).length, 0, '数据没变就不必重新向宿主要');
});

test('a CACHE_DATA refresh that changed the character\'s images keeps the group open and reloads its previews without a loading placeholder', (t) => {
    const panel = loadPanel(t);
    openGallerySection(panel);
    const slotNode = panel.$('.gallery-slot');

    panel.initData(NO_SETTINGS());
    panel.send('CACHE_DATA', { cacheStats: { count: 3, sizeMB: 2 }, gallerySummary: GALLERY_SUMMARY({ count: 3, totalSize: 150 }) });

    assert.equal(panel.$('.gallery-char-section').classList.contains('collapsed'), false, '分组仍展开');
    assert.ok(requestedPreviews(panel).some(message => message.charName === '苍玄界'), '数据变了（张数变了），向宿主重新要预览');
    assert.equal(panel.$('.gallery-loading'), null, '新数据到达前保留旧图片，不换成加载占位');
    assert.equal(panel.$('.gallery-slot'), slotNode, '旧图片节点原样保留');
    panel.send('CHARACTER_PREVIEWS_LOADED', { charName: '苍玄界', slots: GALLERY_SLOTS() });
    assert.equal(panel.$$('.gallery-slot').length, 1);
    assert.notEqual(panel.$('.gallery-slot'), slotNode, '新数据到达后才替换');
});

test('saving an image: the stats-only CACHE_DATA that follows (smaller totalSize, same count) rebuilds nothing, reloads nothing, and keeps the scroll position', (t) => {
    const panel = loadPanel(t);
    // 还没保存的两张图（只有 base64）
    openGallerySection(panel, { s1: [{ imgId: 'a', slotId: 's1', timestamp: 5, base64: 'AAAA' }, { imgId: 'b', slotId: 's1', timestamp: 4, base64: 'BBBB' }] });
    panel.send('CACHE_DATA', { gallerySummary: GALLERY_SUMMARY({ totalSize: 4 * 1024 * 1024 }) });
    assert.match(panel.$('.gallery-char-stats').textContent, /4\.00 MB/);

    const page = panel.$('#view-gallery');
    page.testOverflowY = 'auto';
    page.scrollHeight = 5000;
    page.clientHeight = 600;
    page.scrollTop = 1830;
    const section = panel.$('.gallery-char-section');
    const slotsNode = panel.$('.gallery-slots');
    const slotNode = panel.$('.gallery-slot');

    panel.click(slotNode); // 打开大图，再在大图里保存
    assert.ok(panel.$('#nd_gallery_modal').classList.contains('visible'));
    assert.equal(panel.$('#nd_modal_save').disabled, false);
    const shownSrc = panel.$('#nd_modal_img').getAttribute('src');
    panel.send('GALLERY_IMAGE_SAVED', { imgId: 'a', savedUrl: '/img/a-saved.png' });
    // 宿主随后只发统计：保存把 base64 丢了，体积变小，张数没变
    panel.send('CACHE_DATA', { cacheStats: { count: 2, sizeMB: 1 }, gallerySummary: GALLERY_SUMMARY({ totalSize: 1024 * 1024 }) });

    assert.equal(requestedPreviews(panel).length, 0, '没有再向宿主要预览');
    assert.equal(panel.$('.gallery-char-section'), section, '分组节点没有被重建');
    assert.equal(panel.$('.gallery-slots'), slotsNode);
    assert.equal(panel.$('.gallery-slot'), slotNode, '图片卡片没有被重建');
    assert.equal(section.classList.contains('collapsed'), false, '分组仍展开');
    assert.equal(panel.$('.gallery-loading'), null);
    assert.equal(page.scrollTop, 1830, '滚动位置保持');
    assert.match(panel.$('.gallery-char-stats').textContent, /2 张 · 1 组 · 1\.00 MB/, '头部统计就地更新');
    assert.ok(panel.$('#nd_gallery_modal').classList.contains('visible'), '大图保持打开');
    assert.equal(panel.nd.getModalData().slotId, 's1', '仍停在当前这张图');
    assert.equal(panel.$('#nd_modal_save').disabled, true);
    assert.equal(panel.$('#nd_modal_img').getAttribute('src'), shownSrc, '大图不因保存而重新加载');
    assert.ok(slotNode.querySelector('.gallery-slot-badge.saved'), '卡片角标就地更新为已保存');
    assert.deepEqual(panel.posted, [], '页面没有再向宿主发任何消息');
});

// ── 大图左右切换 ────────────────────────────────────────────────

const arrowSlots = () => ({
    s1: [{ imgId: 'a1', slotId: 's1', timestamp: 5000, savedUrl: '/img/a1.png' }, { imgId: 'a2', slotId: 's1', timestamp: 4000, savedUrl: '/img/a2.png' }],
    s2: [{ imgId: 'b1', slotId: 's2', timestamp: 9000, savedUrl: '/img/b1.png' }],
    s3: [{ imgId: 'c1', slotId: 's3', timestamp: 1000, savedUrl: '/img/c1.png' }, { imgId: 'c2', slotId: 's3', timestamp: 900, savedUrl: '/img/c2.png' }],
});

test('gallery modal arrows step between the slots of one character in card order, disable at both ends, and also work from the keyboard', (t) => {
    const panel = loadPanel(t);
    openGallerySection(panel); // 单图组
    panel.click(panel.$('.gallery-slot'));
    assert.equal(panel.$('#nd_modal_prev').disabled, true, '只有 1 个图组：两个箭头都禁用');
    assert.equal(panel.$('#nd_modal_next').disabled, true);
    assert.doesNotMatch(panel.$('#nd_modal_info').textContent, /图组/, '单图组省略图组位置');
    assert.match(panel.$('#nd_modal_info').textContent, /^版本 1 \/ 2 · /);
    panel.click(panel.$('#nd_modal_close'));

    panel.send('CACHE_DATA', { gallerySummary: GALLERY_SUMMARY({ count: 5, latestTimestamp: 9000,
        slots: { s1: { count: 2 }, s2: { count: 1 }, s3: { count: 2 } } }) });
    panel.send('CHARACTER_PREVIEWS_LOADED', { charName: '苍玄界', slots: arrowSlots() });
    // 卡片顺序按每组最新图时间倒序：s2(9000) s1(5000) s3(1000)
    sameJson(panel.$$('.gallery-slot').map(card => card.dataset.slot), ['s2', 's1', 's3']);
    panel.click(panel.$$('.gallery-slot')[1]); // 打开中间的 s1
    panel.posted.length = 0;
    const info = () => panel.$('#nd_modal_info').textContent;
    assert.equal(info(), `图组 2 / 3 · 版本 1 / 2 · ${new Date(5000).toLocaleString()}`);
    assert.equal(panel.$('#nd_modal_prev').disabled, false);
    assert.equal(panel.$('#nd_modal_next').disabled, false);

    panel.click(panel.$('#nd_modal_next')); // s3，最后一个
    let modal = panel.nd.getModalData();
    assert.equal(modal.slotId, 's3');
    assert.equal(modal.currentIndex, 0);
    assert.equal(modal.charName, '苍玄界');
    sameJson(modal.images.map(image => image.imgId), ['c1', 'c2']);
    assert.equal(panel.$('#nd_modal_img').getAttribute('src'), '/img/c1.png');
    assert.equal(info(), `图组 3 / 3 · 版本 1 / 2 · ${new Date(1000).toLocaleString()}`);
    assert.equal(panel.$('#nd_modal_next').disabled, true, '最后一个图组：下一张禁用');
    assert.equal(panel.$$('#nd_modal_thumbs img').length, 2, '缩略图条换成新图组的版本');

    panel.click(panel.$('#nd_modal_next')); // 禁用时点击无效，不循环
    assert.equal(panel.nd.getModalData().slotId, 's3');

    pressKey(panel, panel.document, 'ArrowLeft');
    pressKey(panel, panel.document, 'ArrowLeft');
    modal = panel.nd.getModalData();
    assert.equal(modal.slotId, 's2');
    assert.equal(panel.$('#nd_modal_img').getAttribute('src'), '/img/b1.png');
    assert.equal(panel.$('#nd_modal_prev').disabled, true, '第一个图组：上一张禁用');
    pressKey(panel, panel.document, 'ArrowLeft'); // 到头不循环
    assert.equal(panel.nd.getModalData().slotId, 's2');
    pressKey(panel, panel.document, 'ArrowRight');
    assert.equal(panel.nd.getModalData().slotId, 's1');
    pressKey(panel, panel.$('#nd_api_key'), 'ArrowRight'); // 输入框聚焦时不拦截
    assert.equal(panel.nd.getModalData().slotId, 's1');
    assert.deepEqual(panel.posted, [], '切换不向宿主发任何消息');

    panel.click(panel.$('#nd_modal_close'));
    pressKey(panel, panel.document, 'ArrowRight'); // 模态框关闭后不响应
    assert.equal(panel.nd.getModalData().slotId, null);
});

test('defensive: a placeholder empty gallerySummary in INIT_DATA does not lose the expanded state for the real CACHE_DATA', (t) => {
    const panel = loadPanel(t);
    openGallerySection(panel);

    panel.initData(NO_SETTINGS(), { cacheStats: { count: 0, sizeMB: 0 }, gallerySummary: {} });
    assert.equal(panel.$$('.gallery-char-section').length, 0, '占位的空摘要把列表画空了');

    panel.send('CACHE_DATA', { cacheStats: { count: 2, sizeMB: 1 }, gallerySummary: GALLERY_SUMMARY() });
    const section = panel.$('.gallery-char-section');
    assert.ok(section, '真实摘要重新画出角色分组');
    assert.equal(section.classList.contains('collapsed'), false, '展开状态由模块变量恢复，而不是从被清空的 DOM 反推');
    assert.ok(requestedPreviews(panel).some(message => message.charName === '苍玄界'), '预览缓存被空摘要作废了：重新向宿主要');
    panel.send('CHARACTER_PREVIEWS_LOADED', { charName: '苍玄界', slots: GALLERY_SLOTS() });
    assert.equal(panel.$$('.gallery-slot').length, 1, '图片组回来了');
});

test('collapsing a group by hand is remembered too, and a group that vanished from a non-empty summary is forgotten', (t) => {
    const panel = loadPanel(t);
    openGallerySection(panel);

    panel.click(panel.$('.gallery-char-header')); // 手动折叠
    panel.send('CACHE_DATA', { cacheStats: { count: 2, sizeMB: 1 }, gallerySummary: GALLERY_SUMMARY() });
    assert.equal(panel.$('.gallery-char-section').classList.contains('collapsed'), true, '手动折叠后重绘仍折叠');

    panel.click(panel.$('.gallery-char-header')); // 再展开
    panel.send('CACHE_DATA', { gallerySummary: { 别人: { count: 1, totalSize: 1, latestTimestamp: 9, slots: { x: { count: 1 } } } } });
    sameJson(panel.$$('.gallery-char-section').map(section => section.dataset.char), ['别人']);
    panel.send('CACHE_DATA', { gallerySummary: GALLERY_SUMMARY() });
    const section = panel.$$('.gallery-char-section').find(node => node.dataset.char === '苍玄界');
    assert.equal(section.classList.contains('collapsed'), true, '该角色的图片确实清空过，再出现时不应自动展开');
});

test('a section that was never expanded stays collapsed, and one that disappeared is dropped', (t) => {
    const panel = loadPanel(t);
    panel.initData(NO_SETTINGS());
    panel.send('CACHE_DATA', { gallerySummary: GALLERY_SUMMARY() });
    assert.equal(panel.$('.gallery-char-section').classList.contains('collapsed'), true);

    panel.send('CACHE_DATA', { gallerySummary: {} });
    assert.equal(panel.$$('.gallery-char-section').length, 0);
});

test('host source: the first INIT_DATA carries no cacheStats / gallerySummary placeholders; only CACHE_DATA does', () => {
    const source = fs.readFileSync(new URL('../../providers/novelai/novel-draw.js', import.meta.url), 'utf8');
    const body = source.slice(source.indexOf('async function sendInitData()'));
    const fn = body.slice(0, body.indexOf('function postStatus('));
    const init = fn.slice(fn.indexOf("type: 'INIT_DATA'"), fn.indexOf("postToIframe(iframe, buildPayload()"));
    assert.ok(init.length > 200, '截取到了 INIT_DATA 载荷');
    assert.doesNotMatch(init, /cacheStats|gallerySummary/, '先行的 INIT_DATA 不带占位统计');
    assert.match(fn, /postToIframe\(iframe, buildPayload\(\)/);
    const cache = fn.slice(fn.indexOf("type: 'CACHE_DATA'"));
    assert.match(cache, /cacheData\.cacheStats = await getCacheStats\(\)/);
    assert.match(cache, /cacheData\.gallerySummary = await getGallerySummary\(\)/);
});

test('host source: saving / deleting a gallery image and refreshing stats send only CACHE_DATA, never the whole INIT_DATA', () => {
    const source = fs.readFileSync(new URL('../../providers/novelai/novel-draw.js', import.meta.url), 'utf8');
    const caseBody = (name) => {
        const start = source.indexOf(`case '${name}'`);
        assert.ok(start >= 0, name);
        const end = source.indexOf("\n        case '", start + 1);
        return source.slice(start, end);
    };
    for (const name of ['SAVE_GALLERY_IMAGE', 'DELETE_GALLERY_IMAGE', 'REFRESH_CACHE_STATS', 'USE_GALLERY_IMAGE']) {
        const body = caseBody(name);
        assert.doesNotMatch(body, /sendInitData\(/, `${name} 不再整份重发 INIT_DATA`);
        assert.match(body, /sendCacheData\(\)/, `${name} 只发统计`);
    }
    const fn = source.slice(source.indexOf('async function sendCacheData()'), source.indexOf('function postStatus('));
    assert.match(fn, /type: 'CACHE_DATA'/);
    assert.doesNotMatch(fn, /INIT_DATA/);
});

// ── 分组内部滚动（每个展开的分组自带滚动区，分组头留在外面）──────────────

const PAGE_CSS = fs.readFileSync(PAGE, 'utf8').match(/<style>([\s\S]*?)<\/style>/)[1].replace(/\/\*[\s\S]*?\*\//g, '');
const pageRule = (css, selector) => css.match(new RegExp(`(?:^|\\n)[ \\t]*${selector.replace(/[.>*[\]]/g, '\\$&')}\\s*\\{([^}]*)\\}`))?.[1] ?? '';

test('each expanded group scrolls inside its own body; the header stays outside and the page keeps scrolling at the end', (t) => {
    const rule = pageRule(PAGE_CSS, '.char-group-body');
    assert.match(rule, /max-height:\s*max\(320px,\s*60vh\)/);
    assert.match(rule, /overflow-y:\s*auto/);
    assert.doesNotMatch(PAGE_CSS, /overscroll-behavior/, '滚到头要能带动整页');
    assert.match(pageRule(PAGE_CSS, '.char-group-body > .char-card'), /flex-shrink:\s*0/);
    // 收起的分组不受影响
    assert.match(pageRule(PAGE_CSS, '.char-group-body[hidden]'), /display:\s*none/);

    const panel = loadPanel(t, { characters: [person('c1', '阿璃', { groupId: 'g1' }), person('c2', '小猫')], groups: GROUPS });
    for (const section of panel.$$('#nd_char_list .char-group')) {
        const header = section.querySelector('.char-group-header');
        const body = section.querySelector('.char-group-body');
        assert.equal(header.parentNode, section);
        assert.equal(body.parentNode, section);
        assert.equal(body.contains(header), false, '分组头在滚动区之外');
    }
    // 未分组区域同样是一个带 body 的分组区
    assert.ok(panel.$('#nd_char_list .char-group[data-group-id=""] .char-group-body .char-card'));
});

test('narrow screens (the page single-column breakpoint) drop the group scroll area', () => {
    const media = PAGE_CSS.match(/@media\s*\(max-width:\s*768px\)\s*\{([\s\S]*?)\n\}/);
    assert.ok(media, '768px 即页面切换为单栏的断点');
    assert.match(media[1], /\.app-sidebar\s*\{\s*display:\s*none/, '前提：这个断点就是页面的窄屏断点');
    const rule = pageRule(`\n${media[1]}`, '.char-group-body');
    assert.match(rule, /max-height:\s*none/);
    assert.match(rule, /overflow-y:\s*visible/);
    assert.ok(PAGE_CSS.indexOf('@media (max-width: 768px)') > PAGE_CSS.indexOf('.char-group-body {'), '断点规则在基础规则之后');
});

function stubScrollIntoView(panel) {
    const calls = [];
    Object.getPrototypeOf(panel.$('#nd_char_list')).scrollIntoView = function scrollIntoView(options) { calls.push({ node: this, options }); };
    return calls;
}

test('a redraw keeps every group scroll position', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃', { groupId: 'g1' }), person('c2', '小猫', { groupId: 'g1' }), person('c3', '路人')],
        groups: GROUPS,
    });
    const bodyOf = id => panel.$(`#nd_char_list .char-group[data-group-id="${id}"] .char-group-body`);
    bodyOf('g1').scrollTop = 220;
    bodyOf('').scrollTop = 35;
    panel.nd.handleGroupAction('toggle-enabled', 'g2', null); // 触发整体重绘
    assert.equal(bodyOf('g1').scrollTop, 220);
    assert.equal(bodyOf('').scrollTop, 35);
    assert.ok(!bodyOf('g2').scrollTop);
});

// 真实浏览器里：display:none 的元素 scrollTop 读出来是 0、写进去也无效（重新显示时才从 0 开始）。
// linkedom 没有这个行为，这里在原型上装一个会“看可见性”的 clientHeight / scrollTop 访问器来模拟。
function simulateHideableScroll(t, panel) {
    const proto = Object.getPrototypeOf(panel.$('#nd_char_list .char-group-body'));
    const stored = new WeakMap();
    const view = { hidden: false };
    Object.defineProperty(proto, 'clientHeight', { configurable: true, get() { return view.hidden ? 0 : 320; } });
    Object.defineProperty(proto, 'scrollTop', {
        configurable: true,
        get() { return view.hidden ? 0 : (stored.get(this) || 0); },
        set(value) { if (!view.hidden) stored.set(this, Number(value) || 0); },
    });
    t.after(() => { delete proto.clientHeight; delete proto.scrollTop; });
    return view;
}

test('a redraw while the characters view is hidden does not lose the group scroll positions', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃', { groupId: 'g1' }), person('c2', '小猫', { groupId: 'g1' }), person('c3', '路人')],
        groups: GROUPS,
    });
    const view = simulateHideableScroll(t, panel);
    const bodyOf = id => panel.$(`#nd_char_list .char-group[data-group-id="${id}"] .char-group-body`);
    bodyOf('g1').scrollTop = 220;
    bodyOf('').scrollTop = 35;
    panel.nd.handleGroupAction('toggle-enabled', 'g2', null); // 可见时的重绘
    assert.equal(bodyOf('g1').scrollTop, 220);

    view.hidden = true; // 切到“图片管理”，角色视图 display:none
    panel.nd.handleGroupAction('toggle-enabled', 'g2', null); // 隐藏期间重绘（例如收到 INIT_DATA）
    panel.initData({ characterTags: panel.state().characterTags, characterGroups: GROUPS });
    panel.nd.handleGroupAction('toggle-enabled', 'g2', null);

    view.hidden = false; // 切回来
    panel.nd.switchView('characters');
    assert.equal(bodyOf('g1').scrollTop, 220, '隐藏期间的重绘没有把位置覆盖成 0');
    assert.equal(bodyOf('').scrollTop, 35);
    assert.ok(!bodyOf('g2').scrollTop);

    // 之后的可见重绘按真实位置更新
    bodyOf('g1').scrollTop = 0;
    panel.nd.handleGroupAction('toggle-enabled', 'g2', null);
    assert.ok(!bodyOf('g1').scrollTop, '可见时用户滚回顶部是真实的 0，不应被旧记录拉回去');
});

test('keyboard moves keep the moved card or group visible; boundaries do not scroll', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃', { groupId: 'g1' }), person('c2', '小猫', { groupId: 'g1' })],
        groups: GROUPS,
    });
    const calls = stubScrollIntoView(panel);
    pressKey(panel, panel.$('[data-drag-char="c2"]'), 'ArrowUp');
    sameJson(idsOfGroup(panel, 'g1'), ['c2', 'c1']);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].node, panel.$('.char-card[data-id="c2"]'));
    assert.deepEqual({ ...calls[0].options }, { block: 'nearest' });

    calls.length = 0;
    pressKey(panel, panel.$('[data-drag-char="c2"]'), 'ArrowUp'); // 已在组首
    assert.equal(calls.length, 0);

    pressKey(panel, panel.$('[data-drag-group="g2"]'), 'ArrowUp');
    sameJson(panel.state().characterGroups.map(group => group.id), ['g2', 'g1']);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].node, panel.$('#nd_char_list .char-group[data-group-id="g2"]'));
    calls.length = 0;
    pressKey(panel, panel.$('[data-drag-group="g2"]'), 'ArrowUp'); // 已在首位
    assert.equal(calls.length, 0);
});

test('editing a card, adding in a group and the add button all bring the editing card into view', (t) => {
    const panel = loadPanel(t, { characters: [person('c1', '阿璃', { groupId: 'g1' })], groups: GROUPS });
    const calls = stubScrollIntoView(panel);
    const editingCalls = () => calls.filter(call => call.node.classList.contains('editing'));

    startEditing(panel, 'c1');
    assert.equal(editingCalls().length, 1, '展开编辑表单后滚入可视区');
    assert.deepEqual({ ...editingCalls()[0].options }, { block: 'nearest' });

    calls.length = 0;
    panel.nd.handleCharAction('cancel', 'c1', null, null);
    panel.nd.handleGroupAction('add', 'g1', null);
    assert.equal(editingCalls().length, 1, '“在本组添加”后新卡滚入可视区');
    assert.equal(editingCalls()[0].node.dataset.id, panel.nd.getEditingCharId());

    calls.length = 0;
    panel.nd.handleCharAction('cancel', panel.nd.getEditingCharId(), null, null);
    panel.click(panel.$('#nd_char_add'));
    assert.equal(editingCalls().length, 1, '顶部“添加角色”后新卡滚入可视区');
});

test('saving or cancelling an edit brings the collapsed card back into view; a discarded draft has nothing to reveal', (t) => {
    const panel = loadPanel(t, { characters: [person('c1', '阿璃', { groupId: 'g1' }), person('c2', '小猫', { groupId: 'g1' })], groups: GROUPS });
    const calls = stubScrollIntoView(panel);
    const cardCalls = id => calls.filter(call => call.node.dataset.id === id && !call.node.classList.contains('editing'));

    let card = startEditing(panel, 'c1');
    calls.length = 0;
    card.querySelector('.char-edit-name').value = '阿璃（改）';
    panel.nd.handleCharAction('save', 'c1', card, null);
    assert.equal(cardCalls('c1').length, 1, '保存后收起的卡片滚回可视区');
    assert.deepEqual({ ...cardCalls('c1')[0].options }, { block: 'nearest' });

    startEditing(panel, 'c2');
    calls.length = 0;
    panel.nd.handleCharAction('cancel', 'c2', null, null);
    assert.equal(cardCalls('c2').length, 1, '取消后同样滚回');
    assert.equal(cardCalls('c2')[0].node.isConnected, true);

    // 保存时顺带换了分组：重绘后在新位置滚回
    card = startEditing(panel, 'c1');
    chooseOption(card.querySelector('.char-edit-group'), 'g2');
    calls.length = 0;
    panel.nd.handleCharAction('save', 'c1', card, null);
    assert.equal(panel.$('.char-group[data-group-id="g2"] .char-card[data-id="c1"]') !== null, true);
    assert.equal(cardCalls('c1').length, 1);

    // 取消一张还没保存的新建草稿：卡片已不存在，不会报错也不滚动
    panel.nd.handleGroupAction('add', 'g1', null);
    const draftId = panel.nd.getEditingCharId();
    calls.length = 0;
    panel.nd.handleCharAction('cancel', draftId, null, null);
    assert.equal(calls.length, 0);
    assert.deepEqual(panel.errors, []);
});

// linkedom 没有布局：给 g1 的 body 造一个 [100, bodyBottom] 的滚动区，卡片按 scrollTop 平移。
function scrollableGroup(panel, { bodyBottom = 290 } = {}) {
    const body = panel.$('#nd_char_list .char-group[data-group-id="g1"] .char-group-body');
    body.testOverflowY = 'auto';
    body.scrollHeight = 2000;
    body.clientHeight = bodyBottom - 100;
    body.scrollTop = 0;
    body.getBoundingClientRect = () => ({ top: 100, bottom: bodyBottom });
    const bases = { c2: 100, c3: 212 };
    for (const [id, base] of Object.entries(bases)) {
        panel.$(`.char-card[data-id="${id}"]`).getBoundingClientRect = () => {
            const top = base - (body.scrollTop || 0);
            return { top, bottom: top + 100, height: 100 };
        };
    }
    return body;
}

function startDragging(panel, handleId, hitNode) {
    const Event = panel.document.defaultView.Event;
    const fire = (target, type, props) => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.assign(event, { button: 0, pointerId: 1, clientX: 20, ...props });
        target.dispatchEvent(event);
    };
    panel.document.elementFromPoint = () => hitNode;
    fire(panel.$(`[data-drag-char="${handleId}"]`), 'pointerdown', { clientY: 5 });
    return fire;
}

test('dragging near the bottom of a group scrolls that group, and the drop mark uses the post-scroll rects', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃'), person('c2', '小猫', { groupId: 'g1' }), person('c3', '路人', { groupId: 'g1' })],
        groups: GROUPS,
    });
    const body = scrollableGroup(panel);
    const c3 = panel.$('.char-card[data-id="c3"]');
    const fire = startDragging(panel, 'c1', c3);
    // y=255 在分组下缘 40px 感应区内（290-40=250）；滚动前 c3 中线 262 → “之前”，滚动 14px 后中线 248 → “之后”
    fire(panel.document, 'pointermove', { clientY: 255 });
    assert.equal(body.scrollTop, 14, '分组内部滚动');
    assert.equal(c3.classList.contains('drop-after'), true);
    assert.equal(c3.classList.contains('drop-before'), false);
    fire(panel.document, 'pointerup', { clientY: 255 });
    sameJson(idsOfGroup(panel, 'g1'), ['c2', 'c3', 'c1']);
    assert.deepEqual(panel.errors, []);
});

test('the drag scrolls the page when the group is already at its end', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃'), person('c2', '小猫', { groupId: 'g1' }), person('c3', '路人', { groupId: 'g1' })],
        groups: GROUPS,
    });
    const body = scrollableGroup(panel, { bodyBottom: 790 }); // 分组下缘接近视口下缘（innerHeight = 800）
    body.scrollTop = body.scrollHeight - body.clientHeight;
    const fire = startDragging(panel, 'c1', panel.$('.char-card[data-id="c3"]'));
    const before = body.scrollTop;
    fire(panel.document, 'pointermove', { clientY: 785 });
    assert.equal(body.scrollTop, before);
    assert.equal(panel.document.documentElement.scrollTop, 14, '分组到底后带动整页');
    fire(panel.document, 'pointercancel', {});
});

test('a group scroll area that starts above the viewport does not hold the page back near the viewport top', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃'), person('c2', '小猫', { groupId: 'g1' }), person('c3', '路人', { groupId: 'g1' })],
        groups: GROUPS,
    });
    const body = scrollableGroup(panel, { bodyBottom: 790 });
    body.getBoundingClientRect = () => ({ top: -20, bottom: 790 }); // 上缘高出视口 20px
    body.scrollTop = 100;
    const page = panel.document.documentElement;
    page.scrollTop = 300;
    const fire = startDragging(panel, 'c1', panel.$('.char-card[data-id="c3"]'));
    fire(panel.document, 'pointermove', { clientY: 10 });
    assert.equal(body.scrollTop, 100, '组内位置不动');
    assert.equal(page.scrollTop, 286, '直接带动整页上滚');
    fire(panel.document, 'pointercancel', {});
});

test('dragging a whole group never scrolls a group body; dragging a card still does', (t) => {
    const panel = loadPanel(t, {
        characters: [person('c1', '阿璃'), person('c2', '小猫', { groupId: 'g1' }), person('c3', '路人', { groupId: 'g1' })],
        groups: GROUPS,
    });
    const body = scrollableGroup(panel);
    const Event = panel.document.defaultView.Event;
    const fire = (target, type, props) => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.assign(event, { button: 0, pointerId: 1, clientX: 20, ...props });
        target.dispatchEvent(event);
    };
    panel.document.elementFromPoint = () => panel.$('.char-card[data-id="c3"]');
    fire(panel.$('[data-drag-group="g2"]'), 'pointerdown', { clientY: 5 });
    fire(panel.document, 'pointermove', { clientY: 255 }); // 与“拖卡片”那条用例同一位置
    assert.equal(body.scrollTop, 0, '拖动分组不滚组内');
    assert.ok(!panel.document.documentElement.scrollTop, '指针不在视口边缘：整页也不滚');
    fire(panel.document, 'pointercancel', {});

    const cardFire = startDragging(panel, 'c1', panel.$('.char-card[data-id="c3"]'));
    cardFire(panel.document, 'pointermove', { clientY: 255 });
    assert.equal(body.scrollTop, 14, '对照：拖动卡片会滚组内');
    cardFire(panel.document, 'pointercancel', {});
});

test('without the scroll module the drag still works (just no auto-scroll)', (t) => {
    const panel = loadPanel(t, { characters: threeInG1(), groups: GROUPS });
    panel.nd.setCS(null);
    dragCharacter(panel, { handleId: 'c1', overId: 'c3', moveY: 290 });
    sameJson(idsOfGroup(panel, 'g1'), ['c2', 'c3', 'c1']);
});

// ── 分组嵌套启用：分组开关 ≠ 角色开关，有效启用 = 分组开 且 角色开 ─────────────────

const groupSection = (panel, id) => panel.$(`#nd_char_list .char-group[data-group-id="${id}"]`);
const groupSwitch = (panel, id) => groupSection(panel, id)?.querySelector('[data-group-action="toggle-enabled"]');
const statusOf = (panel, charId) => panel.$(`#nd_char_list .char-card[data-id="${charId}"] .char-status`).textContent;
const ownEnabledSnapshot = panel => Object.fromEntries(panel.state().characterTags.map(char => [char.id, char.enabled]));

function nestedPanel(t, extra = {}) {
    return loadPanel(t, {
        characters: [
            person('c1', '阿璃', { groupId: 'g1' }),
            person('c2', '小猫', { groupId: 'g1', enabled: false }),
            person('c3', '路人', { groupId: 'g2' }),
            person('c4', '旅人'),
        ],
        groups: GROUPS,
        ...extra,
    });
}

test('the group switch is a two-state toggle button; ungrouped has none; clicking it never touches a character', (t) => {
    const panel = nestedPanel(t);
    const button = groupSwitch(panel, 'g1');
    assert.ok(button);
    assert.equal(button.tagName, 'BUTTON');
    assert.equal(button.getAttribute('aria-pressed'), 'true');
    assert.match(button.getAttribute('title'), /关闭分组：组内角色不再参与出图，各角色自己的开关保持不变/);
    assert.equal(groupSwitch(panel, ''), null, '未分组没有开关');
    assert.equal(groupSwitch(panel, 'g2').getAttribute('aria-pressed'), 'true');
    assert.equal(button.querySelector('[class*="fa-toggle-on"]') !== null, true);

    const ownBefore = ownEnabledSnapshot(panel);
    const tagsBefore = JSON.stringify(panel.state().characterTags);
    panel.click(button);
    assert.equal(groupSwitch(panel, 'g1').getAttribute('aria-pressed'), 'false');
    assert.match(groupSwitch(panel, 'g1').getAttribute('title'), /开启分组/);
    assert.equal(groupSwitch(panel, 'g1').querySelector('[class*="fa-toggle-off"]') !== null, true);
    sameJson(panel.state().characterGroups, [{ id: 'g1', name: '主角', enabled: false }, { id: 'g2', name: '配角' }]);
    assert.equal(JSON.stringify(panel.state().characterTags), tagsBefore, '角色整体没有变化');
    sameJson(ownEnabledSnapshot(panel), ownBefore);
    // 保存通道：分组带 enabled:false 一起存，角色原样
    const saved = panel.lastSave();
    sameJson(saved.characterGroups, [{ id: 'g1', name: '主角', enabled: false }, { id: 'g2', name: '配角' }]);
    assert.equal(JSON.stringify(saved.characterTags), tagsBefore);

    // 再点一次：恢复；角色 1 仍开、角色 2 仍关，分组上不留 enabled 键
    panel.click(groupSwitch(panel, 'g1'));
    assert.equal(groupSwitch(panel, 'g1').getAttribute('aria-pressed'), 'true');
    sameJson(panel.state().characterGroups, GROUPS);
    assert.equal(Object.hasOwn(panel.state().characterGroups[0], 'enabled'), false);
    sameJson(ownEnabledSnapshot(panel), ownBefore);
    assert.deepEqual(panel.errors, []);
});

test('a closed group dims the whole group, labels its cards, and leaves each character own toggle usable', (t) => {
    const panel = nestedPanel(t);
    assert.equal(groupSection(panel, 'g1').classList.contains('group-disabled'), false);
    assert.doesNotMatch(statusOf(panel, 'c1'), /分组已关闭|停用/);
    assert.match(statusOf(panel, 'c2'), /^停用/, '自己关了：停用');

    panel.click(groupSwitch(panel, 'g1'));
    const section = groupSection(panel, 'g1');
    assert.equal(section.classList.contains('group-disabled'), true);
    assert.equal(groupSection(panel, 'g2').classList.contains('group-disabled'), false);
    assert.equal(groupSection(panel, '').classList.contains('group-disabled'), false);
    // 组内两个角色都显示“分组已关闭”；自己关了的 c2 优先显示分组关闭，不再显示“停用”
    assert.match(statusOf(panel, 'c1'), /^分组已关闭/);
    assert.match(statusOf(panel, 'c2'), /^分组已关闭/);
    assert.doesNotMatch(statusOf(panel, 'c2'), /停用/);
    assert.doesNotMatch(statusOf(panel, 'c3'), /分组已关闭/);
    // 角色自己的启用按钮仍然可点，只改该角色，状态文字仍以分组关闭为准
    const c1Toggle = panel.$('#nd_char_list .char-card[data-id="c1"] [data-action="toggle-enabled"]');
    assert.equal(c1Toggle.getAttribute('aria-pressed'), 'true');
    panel.click(c1Toggle);
    assert.equal(panel.state().characterTags.find(char => char.id === 'c1').enabled, false);
    assert.equal(panel.$('#nd_char_list .char-card[data-id="c1"] [data-action="toggle-enabled"]').getAttribute('aria-pressed'), 'false');
    assert.match(statusOf(panel, 'c1'), /^分组已关闭/);
    assert.equal(panel.state().characterTags.find(char => char.id === 'c3').enabled, true);
    // 展开 / 折叠、编辑仍可用
    panel.nd.handleGroupAction('collapse', 'g1', groupSection(panel, 'g1').querySelector('[data-group-action="collapse"]'));
    assert.equal(groupSection(panel, 'g1').classList.contains('collapsed'), true);
    assert.equal(groupSection(panel, 'g1').classList.contains('group-disabled'), true);
    // 重新开启后“分组已关闭”消失，c2 回到“停用”
    panel.click(groupSwitch(panel, 'g1'));
    assert.equal(groupSection(panel, 'g1').classList.contains('group-disabled'), false);
    assert.match(statusOf(panel, 'c2'), /^停用/);
    assert.doesNotMatch(statusOf(panel, 'c1'), /分组已关闭/);
});

test('top stats, the 500 hint and the result count use effective enablement', (t) => {
    const panel = nestedPanel(t);
    const enabledStat = () => panel.$('#nd_char_stat_enabled').textContent;
    assert.equal(enabledStat(), '3', 'c1 c3 c4 开着，c2 自己关了');
    assert.equal(panel.$('#nd_char_result_count').textContent, '4 / 4');
    panel.click(groupSwitch(panel, 'g1'));
    assert.equal(enabledStat(), '2', '关闭 g1 后只剩 c3 c4');
    assert.equal(panel.$('#nd_char_result_count').textContent, '4 / 4', '结果数 x / y 仍是显示数 / 总数');
    panel.click(groupSwitch(panel, 'g2'));
    assert.equal(enabledStat(), '1');
    panel.click(groupSwitch(panel, 'g1'));
    assert.equal(enabledStat(), '2', '重新开启 g1：c1 回来，c2 仍是关的');
    // 卡片上单个开关切换后统计也跟着变
    panel.click(panel.$('#nd_char_list .char-card[data-id="c4"] [data-action="toggle-enabled"]'));
    assert.equal(enabledStat(), '1');
});

test('the 500 limit hint counts only effectively enabled characters', (t) => {
    const many = Array.from({ length: 600 }, (_, index) => person(`m${index}`, `角色${index}`, index < 300 ? { groupId: 'g1' } : {}));
    const panel = loadPanel(t, { characters: many, groups: GROUPS });
    const hint = () => panel.$('#nd_char_limit_hint').classList.contains('hidden');
    assert.equal(panel.$('#nd_char_stat_enabled').textContent, '600');
    assert.equal(hint(), false, '600 个全开：显示警告');
    panel.click(groupSwitch(panel, 'g1'));
    assert.equal(panel.$('#nd_char_stat_enabled').textContent, '300');
    assert.equal(hint(), true, '关闭 300 人的分组后不再超过 500');
    panel.click(groupSwitch(panel, 'g1'));
    assert.equal(hint(), false);
});

test('the status filter: enabled = effectively enabled, disabled = own off or group closed', (t) => {
    const panel = nestedPanel(t);
    const setStatus = (value) => {
        const select = panel.$('#nd_char_filter_status');
        chooseOption(select, value);
        select.dispatchEvent(new panel.document.defaultView.Event('change', { bubbles: true }));
    };
    const shown = () => panel.$$('#nd_char_list .char-card').map(card => card.dataset.id).sort();
    const options = panel.$$('#nd_char_filter_status option').map(option => option.value);
    assert.ok(options.includes('enabled') && options.includes('disabled'));

    setStatus('enabled');
    sameJson(shown(), ['c1', 'c3', 'c4']);
    setStatus('disabled');
    sameJson(shown(), ['c2']);
    panel.click(groupSwitch(panel, 'g1'));
    sameJson(shown(), ['c1', 'c2'], '已停用 = 自己关了或所在分组关了');
    setStatus('enabled');
    sameJson(shown(), ['c3', 'c4']);
    assert.equal(panel.$('#nd_char_result_count').textContent, '2 / 4');
    setStatus('all');
    sameJson(shown(), ['c1', 'c2', 'c3', 'c4']);
});

test('undo fingerprint and snapshot include the group switch', (t) => {
    const panel = nestedPanel(t);
    const before = panel.nd.libraryFingerprint();
    panel.click(groupSwitch(panel, 'g2'));
    assert.notEqual(panel.nd.libraryFingerprint(), before, '分组开关进入指纹');
    panel.click(groupSwitch(panel, 'g2'));
    assert.equal(panel.nd.libraryFingerprint(), before, '开回去后指纹一致');

    // 撤销窗口内切换分组开关 → 快照过期，撤销失效而不是把开关改回去
    panel.nd.deleteCharactersWithUndo(['c4'], '已删除旅人');
    assert.equal(panel.nd.isUndoStale(), false);
    panel.click(groupSwitch(panel, 'g2'));
    assert.equal(panel.nd.isUndoStale(), true);
    panel.nd.performUndo();
    assert.equal(panel.state().characterTags.some(char => char.id === 'c4'), false, '过期的撤销没有回写');
    assert.equal(panel.state().characterGroups.find(group => group.id === 'g2').enabled, false, '分组开关没被撤销覆盖');

    // 快照里带着分组开关：删除角色后撤销，关闭的分组仍是关闭的
    const closed = nestedPanel(t);
    closed.click(groupSwitch(closed, 'g1'));
    closed.nd.deleteCharactersWithUndo(['c1'], '已删除阿璃');
    closed.nd.performUndo();
    assert.equal(closed.state().characterTags.some(char => char.id === 'c1'), true);
    assert.equal(closed.state().characterGroups.find(group => group.id === 'g1').enabled, false);
});

test('a closed group coming from the host keeps its state through INIT_DATA, rename, reorder and deleting another group', (t) => {
    const panel = nestedPanel(t);
    panel.initData({
        characterTags: panel.state().characterTags,
        characterGroups: [{ id: 'g1', name: '主角', enabled: false }, { id: 'g2', name: '配角' }],
    });
    assert.equal(groupSection(panel, 'g1').classList.contains('group-disabled'), true);
    assert.equal(groupSwitch(panel, 'g1').getAttribute('aria-pressed'), 'false');
    panel.answers.prompt.push('新名字');
    panel.nd.handleGroupAction('rename', 'g1', null);
    sameJson(panel.state().characterGroups[0], { id: 'g1', name: '新名字', enabled: false });
    panel.answers.confirm.push(true, false);
    panel.nd.handleGroupAction('delete', 'g2', null);
    sameJson(panel.state().characterGroups, [{ id: 'g1', name: '新名字', enabled: false }]);
    sameJson(panel.lastSave().characterGroups, [{ id: 'g1', name: '新名字', enabled: false }]);
});

test('batch enable/disable stays character-level and ignores the group switch', (t) => {
    const panel = nestedPanel(t);
    panel.click(groupSwitch(panel, 'g1'));
    panel.nd.setSelectMode(true);
    panel.nd.selectedCharIds.add('c1');
    panel.nd.selectedCharIds.add('c2');
    panel.nd.runBatchAction('enable');
    assert.equal(panel.state().characterTags.find(char => char.id === 'c2').enabled, true, '批量启用只改角色自己');
    assert.equal(panel.state().characterGroups.find(group => group.id === 'g1').enabled, false, '分组开关不变');
    panel.nd.runBatchAction('disable');
    assert.equal(panel.state().characterTags.find(char => char.id === 'c1').enabled, false);
    assert.equal(panel.state().characterGroups.find(group => group.id === 'g1').enabled, false);
});

test('the page no longer carries the tri-state group toggle', () => {
    const html = fs.readFileSync(PAGE, 'utf8');
    assert.doesNotMatch(html, /getGroupEnabledState/);
    assert.doesNotMatch(html, /toggleClass|\.partial\b|fa-square-minus/);
    assert.doesNotMatch(html, /停用本组全部角色|启用本组全部角色/);
});

// ── 分组预设（组件挂在角色标签页左栏，数据与保存经宿主）──────────────

const GP_PRESET = {
    id: 'p1', name: '校服', revision: 1, groupStates: { g1: true, g2: false },
    bindings: [{ type: 'character', avatar: 'a.png', name: 'Alice' }],
};
const GP_HOST = [{ avatar: 'a.png', name: 'Alice' }, { avatar: 'b.png', name: 'Bob' }];

function gpInit(panel, extra = {}) {
    panel.initData({
        characterTags: [], characterGroups: GROUPS,
        characterGroupPresets: [GP_PRESET], characterGroupPresetApplied: null,
        hostCharacters: GP_HOST, activeAvatars: [],
        ...extra,
    });
}

const gpRows = panel => panel.$$('#nd_group_preset_root .lwb-gp-item');
const gpButton = (panel, action) => panel.$(`#nd_group_preset_root [data-action="${action}"]`);
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

test('INIT_DATA with presets renders them in the characters view, and GROUP_PRESET_CONTEXT updates the match badge without a full refresh', (t) => {
    const panel = loadPanel(t, { characters: [], groups: GROUPS });
    gpInit(panel);
    assert.equal(gpRows(panel).length, 1);
    assert.match(panel.$('#nd_group_preset_root .lwb-gp-name').textContent, /校服/);
    assert.equal(panel.$$('#nd_group_preset_root .lwb-gp-badge-matched').length, 0);
    assert.match(panel.$('#nd_group_preset_root .lwb-gp-status').textContent, /未命中/);

    panel.send('GROUP_PRESET_CONTEXT', { activeAvatars: ['a.png'] });
    assert.equal(panel.$$('#nd_group_preset_root .lwb-gp-badge-matched').length, 1);
    assert.match(panel.$('#nd_group_preset_root .lwb-gp-status').textContent, /校服/);
    sameJson(panel.state().activeAvatars, ['a.png']);
    assert.equal(panel.state().characterGroups.length, GROUPS.length, 'context message leaves the library state alone');
});

test('"save as preset" posts SAVE_GROUP_PRESETS, a late INIT_DATA does not roll the optimistic list back, and an error status is shown', (t) => {
    const panel = loadPanel(t, { characters: [], groups: GROUPS });
    gpInit(panel, { characterGroupPresets: [] });
    assert.equal(gpRows(panel).length, 0);
    panel.click(gpButton(panel, 'save-open'));
    panel.click(gpButton(panel, 'save-confirm'));
    const saved = panel.posted.filter(message => message.type === 'SAVE_GROUP_PRESETS');
    assert.equal(saved.length, 1);
    assert.equal(saved[0].presets.length, 1);
    sameJson(saved[0].presets[0].groupStates, { g1: true, g2: true });
    assert.ok(saved[0].seq > 0);
    assert.equal(gpRows(panel).length, 1, 'shown right away');

    // 回执前宿主推来的是旧预设：不覆盖页面里刚改的
    gpInit(panel, { characterGroupPresets: [] });
    assert.equal(gpRows(panel).length, 1);

    panel.send('STATUS', { state: 'error', text: '分组预设保存失败：boom', target: 'group-presets', seq: saved[0].seq });
    assert.match(panel.$('#nd_gp_status').textContent, /boom/);
    // 回执之后宿主回推的版本生效（保存失败时即回滚）
    gpInit(panel, { characterGroupPresets: [] });
    assert.equal(gpRows(panel).length, 0);
});

test('the apply button posts APPLY_GROUP_PRESET and the host STATUS reply is what the component reports', async (t) => {
    const panel = loadPanel(t, { characters: [], groups: GROUPS });
    gpInit(panel);
    panel.click(gpButton(panel, 'apply'));
    const request = panel.posted.find(message => message.type === 'APPLY_GROUP_PRESET');
    assert.equal(request.presetId, 'p1');
    assert.ok(request.requestId);

    panel.send('STATUS', {
        state: 'success', text: 'x', target: 'group-presets', requestId: request.requestId,
        result: { status: 'applied', changed: true, changedCount: 2 },
    });
    await tick();
    assert.match(panel.$('#nd_gp_status').textContent, /2 个分组开关变化/);
});

test('save receipt loss: after 15s the pending save is dropped and the page realigns with the last host presets, then INIT_DATA updates apply again', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const panel = loadPanel(t, { characters: [], groups: GROUPS });
    gpInit(panel, { characterGroupPresets: [] });
    panel.click(gpButton(panel, 'save-open'));
    panel.click(gpButton(panel, 'save-confirm'));
    assert.equal(panel.posted.filter(message => message.type === 'SAVE_GROUP_PRESETS').length, 1);
    assert.equal(gpRows(panel).length, 1);

    // 回执前的 INIT_DATA 不覆盖乐观版本；回执一直没来
    gpInit(panel, { characterGroupPresets: [GP_PRESET] });
    assert.equal(gpRows(panel).length, 1);
    t.mock.timers.tick(14999);
    gpInit(panel, { characterGroupPresets: [GP_PRESET] });
    assert.equal(gpRows(panel).length, 1, 'still protected before the timeout');
    t.mock.timers.tick(1);
    // 超时：按宿主最近一次下发的预设对齐（不弹错误）
    assert.equal(gpRows(panel).length, 1);
    assert.match(panel.$('#nd_group_preset_root .lwb-gp-name').textContent, /校服/);
    assert.equal(panel.$('#nd_gp_status').textContent, '');
    // 之后宿主推来的预设重新生效
    gpInit(panel, { characterGroupPresets: [] });
    assert.equal(gpRows(panel).length, 0);
});

test('a successful save receipt carries the normalized presets and the page adopts them; the auto-learn group select marks closed groups', (t) => {
    const panel = loadPanel(t, { characters: [], groups: GROUPS });
    gpInit(panel, { characterGroupPresets: [] });
    panel.click(gpButton(panel, 'save-open'));
    panel.click(gpButton(panel, 'save-confirm'));
    const saved = panel.posted.find(message => message.type === 'SAVE_GROUP_PRESETS');
    const normalized = [{ ...saved.presets[0], name: '宿主规范化后的名字' }];
    panel.send('STATUS', { state: 'success', text: '分组预设已保存', target: 'group-presets', seq: saved.seq, presets: normalized });
    assert.match(panel.$('#nd_group_preset_root .lwb-gp-name').textContent, /宿主规范化后的名字/);
    assert.equal(panel.state().characterGroupPresets[0].name, '宿主规范化后的名字');

    // 自动学习分组下拉：已关闭的分组标注“（已关闭）”，开着的不加
    panel.initData({ characterTags: [], characterGroups: [{ id: 'g1', name: '主角' }, { id: 'g2', name: '配角', enabled: false }] });
    const labels = panel.$$('#nd_auto_learn_group option').map(option => option.textContent);
    assert.deepEqual(labels, ['未分组', '主角', '配角（已关闭）']);
});

// ── 图片管理：分批懒加载 ──────────────────────────────────────────────────

const CHAR = '苍玄界';
const withoutSource = ({ source, requestId, ...message }) => message;
const loadRequests = panel => panel.posted.filter(message => message.type === 'LOAD_CHARACTER_PREVIEWS').map(withoutSource);
const versionRequests = panel => panel.posted.filter(message => message.type === 'LOAD_SLOT_VERSIONS').map(withoutSource);
const bigSummary = (count, extra = {}) => ({
    [CHAR]: { count, totalSize: 100, latestTimestamp: 1000, slots: Object.fromEntries(Array.from({ length: count }, (_, i) => [`s${i + 1}`, { count: 1 }])), ...extra },
});
// 宿主一页：每个图组只带最新一张；versions 指定某组的版本总数。
const slotsPage = (ids, { offset = 0, total, hasMore = false, versions = {} } = {}) => ({
    charName: CHAR,
    slots: Object.fromEntries(ids.map((id, i) => [id, [{ imgId: `${id}-a`, slotId: id, timestamp: 1000 - offset - i, savedUrl: `/img/${id}.png` }]])),
    order: ids,
    slotMeta: Object.fromEntries(ids.map(id => [id, { count: versions[id] || 1, hasSaved: true }])),
    offset, limit: 24, total: total ?? ids.length, hasMore, nextOffset: offset + ids.length,
});
const slotIds = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => `s${from + i}`);
const cardIds = panel => panel.$$('.gallery-slot').map(card => card.dataset.slot);

// 执行真实宿主消息处理器；只替换 iframe 和持久化边界，以控制保存完成的时序。
function librarySaveHost(panel, initial) {
    let stored = initial;
    const pending = [];
    const source = fs.readFileSync(new URL('../../providers/novelai/novel-draw.js', import.meta.url), 'utf8');
    const handler = source.match(/^async function handleFrameMessage\(event\) \{[\s\S]*?^\}/m)[0];
    const context = vm.createContext({
        document: { getElementById: () => ({}) },
        isTrustedMessage: () => true,
        console: { log() {} },
        restoreGroupPresetReferences: GPM.restoreGroupPresetReferences,
        updateSharedSettingsPersistent: mutator => new Promise(resolve => pending.push(ok => {
            if (ok) {
                const next = structuredClone(stored);
                mutator(next);
                stored = normalizeSharedDrawSettings(next);
            }
            panel.send('STATUS', { state: ok ? 'success' : 'error' });
            resolve(ok);
        })),
        sendInitData: async () => panel.initData(structuredClone(stored)),
    });
    vm.runInContext(handler, context);
    return {
        save: () => context.handleFrameMessage({ data: structuredClone(panel.lastSave()) }),
        complete: (ok = true) => pending.shift()(ok),
        stored: () => stored,
    };
}

test('late undo completion cannot overwrite a subsequent group toggle or persist it back on the next edit', async t => {
    const initial = normalizeSharedDrawSettings({ characterGroups: GROUPS,
        characterGroupPresets: [{ id: 'p1', name: 'Preset', revision: 1, groupStates: { g1: false }, bindings: [] }],
    });
    const panel = loadPanel(t);
    panel.initData(initial);
    const host = librarySaveHost(panel, initial);
    panel.nd.handleGroupAction('delete', 'g1', null);
    const deletion = host.save();
    host.complete();
    await deletion;
    panel.nd.performUndo();
    const undo = host.save();
    panel.nd.handleGroupAction('toggle-enabled', 'g2', null);
    const toggle = host.save();
    host.complete();
    await undo;
    assert.equal(panel.state().characterGroups.find(group => group.id === 'g2').enabled, false);
    host.complete();
    await toggle;
    panel.answers.prompt.push('New name');
    panel.nd.handleGroupAction('rename', 'g1', null);
    const rename = host.save();
    host.complete();
    await rename;
    assert.equal(host.stored().characterGroups.find(group => group.id === 'g2').enabled, false);
    assert.equal(host.stored().characterGroups.find(group => group.id === 'g1').name, 'New name');
    assert.deepEqual(host.stored().characterGroupPresets[0].groupStates, { g1: false });
    sameJson(panel.state().characterGroupPresets, host.stored().characterGroupPresets);
});

test('a failed undo still rolls the optimistic group and preset references back together', async t => {
    const initial = normalizeSharedDrawSettings({ characterGroups: GROUPS,
        characterGroupPresets: [{ id: 'p1', name: 'Preset', revision: 1, groupStates: { g1: true }, bindings: [] }],
    });
    const panel = loadPanel(t);
    panel.initData(initial);
    const host = librarySaveHost(panel, initial);
    panel.nd.handleGroupAction('delete', 'g1', null);
    const deletion = host.save();
    host.complete();
    await deletion;
    panel.nd.performUndo();
    const undo = host.save();
    host.complete(false);
    await undo;
    sameJson(panel.state().characterGroups, host.stored().characterGroups);
    sameJson(panel.state().characterGroupPresets, host.stored().characterGroupPresets);
    assert.equal(panel.state().characterGroups.some(group => group.id === 'g1'), false);
    assert.deepEqual(host.stored().characterGroupPresets[0].groupStates, {});
});

test('undoing group deletion persists its preset references without overwriting unrelated preset edits', t => {
    let stored = normalizeSharedDrawSettings({ characterGroups: [{ id: 'g1', name: 'Main' }],
        characterGroupPresets: [
            { id: 'p1', name: 'Preset', revision: 1, groupStates: { g1: false }, bindings: [] },
            { id: 'p2', name: 'Other', revision: 1, groupStates: {}, bindings: [] },
        ],
    });
    const panel = loadPanel(t);
    panel.initData(stored);
    const saveToHost = () => {
        const message = panel.lastSave();
        const presets = message.restorePresetReferences
            ? GPM.restoreGroupPresetReferences(stored.characterGroupPresets, message.restorePresetReferences)
            : stored.characterGroupPresets;
        stored = normalizeSharedDrawSettings({ ...stored, characterGroupPresets: presets,
            characterTags: message.characterTags, characterGroups: message.characterGroups });
        panel.initData(stored);
    };
    panel.nd.handleGroupAction('delete', 'g1', null);
    saveToHost();
    assert.deepEqual(stored.characterGroupPresets[0].groupStates, {});
    stored.characterGroupPresets[0].name = 'Renamed';
    stored.characterGroupPresets[1].bindings = [{ type: 'character', avatar: 'new.png', name: 'New' }];
    stored.characterGroupPresets[1].revision += 1;
    panel.initData(stored);
    panel.nd.performUndo();
    saveToHost();
    assert.equal(stored.characterGroups[0].id, 'g1');
    assert.deepEqual(stored.characterGroupPresets[0].groupStates, { g1: false });
    assert.equal(stored.characterGroupPresets[0].name, 'Renamed');
    assert.equal(stored.characterGroupPresets[0].revision, 2);
    assert.equal(stored.characterGroupPresets[1].bindings[0].avatar, 'new.png');
});

test('editing a referenced preset invalidates group-deletion undo', t => {
    const panel = loadPanel(t);
    panel.initData(normalizeSharedDrawSettings({ characterGroups: [{ id: 'g1', name: 'Main' }],
        characterGroupPresets: [{ id: 'p1', name: 'Preset', revision: 1, groupStates: { g1: true }, bindings: [] }],
    }));
    panel.nd.handleGroupAction('delete', 'g1', null);
    panel.state().characterGroupPresets[0].revision += 1;
    const saves = panel.posted.length;
    panel.nd.performUndo();
    assert.equal(panel.posted.length, saves);
    assert.equal(panel.state().characterGroups.length, 0);
});

test('deleting a latest version reloads ordered pages so no surviving group is skipped', t => {
    const panel = loadPanel(t);
    panel.initData(NO_SETTINGS());
    panel.send('CACHE_DATA', { gallerySummary: bigSummary(5, {
        slots: { s1: { count: 1 }, s2: { count: 2 }, s3: { count: 1 }, s4: { count: 1 } },
    }) });
    panel.click(panel.$('.gallery-char-header'));
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(['s1', 's2', 's3'], { total: 4, hasMore: true, versions: { s2: 2 } }));
    panel.click(panel.$$('.gallery-slot')[1]);
    panel.send('SLOT_VERSIONS_LOADED', { charName: CHAR, slotId: 's2', images: [
        { imgId: 's2-a', slotId: 's2', timestamp: 999, savedUrl: '/s2-a.png' },
        { imgId: 's2-old', slotId: 's2', timestamp: 1, savedUrl: '/s2-old.png' },
    ] });
    panel.posted.length = 0;
    panel.send('GALLERY_IMAGE_DELETED', { imgId: 's2-a' });
    panel.send('CACHE_DATA', { gallerySummary: bigSummary(4) });
    const liveOrder = ['s1', 's3', 's4', 's2'];
    const request = loadRequests(panel).at(-1);
    assert.equal(request.offset, 0);
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(liveOrder.slice(0, request.limit), { total: 4, hasMore: request.limit < 4 }));
    panel.click(panel.$('.gallery-more [data-action="more"]'));
    const more = loadRequests(panel).at(-1);
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(liveOrder.slice(more.offset), { offset: more.offset, total: 4 }));
    sameJson(cardIds(panel), liveOrder);
});

test('a reordered slot outside the refreshed prefix moves the modal to a navigable neighbour, including refresh failure and retry', t => {
    const panel = loadPanel(t);
    expandPaged(panel, 61);
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(slotIds(1, 24), { total: 60, hasMore: true, versions: { s2: 2 } }));
    panel.click(panel.$$('.gallery-slot')[1]);
    panel.send('SLOT_VERSIONS_LOADED', { charName: CHAR, slotId: 's2', images: [
        { imgId: 's2-a', slotId: 's2', timestamp: 999, savedUrl: '/s2-a.png' },
        { imgId: 's2-old', slotId: 's2', timestamp: 1, savedUrl: '/s2-old.png' },
    ] });
    panel.send('GALLERY_IMAGE_DELETED', { imgId: 's2-a' });
    panel.send('CACHE_DATA', { gallerySummary: bigSummary(60) });
    const reload = panel.posted.filter(message => message.type === 'LOAD_CHARACTER_PREVIEWS').at(-1);
    panel.send('CHARACTER_PREVIEWS_FAILED', { charName: CHAR });
    assert.equal(panel.nd.getModalData().images[0].imgId, 's2-old');
    assert.equal(panel.$('#nd_modal_load_status').dataset.state, 'error');
    panel.click(panel.$('#nd_modal_load_status [data-retry="page"]'));
    const retry = panel.posted.filter(message => message.type === 'LOAD_CHARACTER_PREVIEWS').at(-1);
    assert.notEqual(retry.requestId, reload.requestId);
    assert.equal(retry.limit, 24);
    panel.send('CHARACTER_PREVIEWS_LOADED', { ...slotsPage(slotIds(1, 24), { total: 60, hasMore: true }), requestId: reload.requestId });
    assert.equal(panel.nd.getModalData().slotId, 's2');
    panel.send('CHARACTER_PREVIEWS_LOADED', { ...slotsPage(['s1', ...slotIds(3, 25)], { total: 60, hasMore: true }), requestId: retry.requestId });
    assert.equal(panel.nd.getModalData().slotId, 's3');
    assert.equal(panel.$('#nd_modal_img').getAttribute('data-img-id'), 's3-a');
    assert.equal(panel.$('#nd_modal_prev').disabled, false);
    assert.equal(panel.$('#nd_modal_next').disabled, false);
    assert.equal(panel.$('#nd_modal_load_status').hidden, true);
    assert.equal(cardIds(panel).length, 24);
    assert.equal(panel.posted.filter(message => message.type === 'LOAD_CHARACTER_PREVIEWS').at(-1), retry, 'no full-library scan');
    panel.click(panel.$('#nd_modal_next'));
    assert.equal(panel.nd.getModalData().slotId, 's4');
    panel.click(panel.$('#nd_modal_prev'));
    assert.equal(panel.nd.getModalData().slotId, 's3');
});

test('refreshing an open slot adopts its current image and closes the modal if the gallery disappears', t => {
    const panel = loadPanel(t);
    expandPaged(panel, 2);
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(['s1', 's2']));
    panel.click(panel.$('.gallery-slot'));
    panel.send('CACHE_DATA', { gallerySummary: bigSummary(2, { latestTimestamp: 2000 }) });
    const fresh = slotsPage(['s1', 's2']);
    fresh.slots.s1[0].imgId = 's1-new';
    panel.send('CHARACTER_PREVIEWS_LOADED', fresh);
    assert.equal(panel.$('#nd_modal_img').getAttribute('data-img-id'), 's1-new');
    panel.send('CACHE_DATA', { gallerySummary: {} });
    assert.equal(panel.$('#nd_gallery_modal').classList.contains('visible'), false);
    assert.equal(panel.nd.getModalData().slotId, null);
});

for (const failure of ['reply', 'timeout', 'empty']) {
    test(`version loading ${failure} exposes retry without losing the current image; stale replies cannot settle the retry`, t => {
        t.mock.timers.enable({ apis: ['setTimeout'] });
        const panel = loadPanel(t);
        expandPaged(panel, 3);
        panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(['s1', 's2'], { versions: { s1: 3 } }));
        panel.click(panel.$('.gallery-slot'));
        const initial = panel.posted.filter(message => message.type === 'LOAD_SLOT_VERSIONS').at(-1);
        assert.equal(panel.$('#nd_modal_load_status').dataset.state, 'loading');
        if (failure === 'timeout') t.mock.timers.tick(15000);
        else panel.send(failure === 'empty' ? 'SLOT_VERSIONS_LOADED' : 'SLOT_VERSIONS_FAILED', { charName: CHAR, slotId: 's1', images: [] });
        assert.equal(panel.$('#nd_modal_load_status').hidden, false);
        assert.equal(panel.$('#nd_modal_load_status').dataset.state, 'error');
        assert.equal(panel.$('#nd_modal_img').getAttribute('data-img-id'), 's1-a');
        panel.click(panel.$('#nd_modal_load_status [data-retry="versions"]'));
        const retry = panel.posted.filter(message => message.type === 'LOAD_SLOT_VERSIONS').at(-1);
        assert.notEqual(retry.requestId, initial.requestId);
        const obsolete = { charName: CHAR, slotId: 's1', requestId: initial.requestId };
        panel.send('SLOT_VERSIONS_FAILED', obsolete);
        panel.send('SLOT_VERSIONS_LOADED', { ...obsolete, images: [{ imgId: 'obsolete' }] });
        assert.equal(panel.$('#nd_modal_load_status').dataset.state, 'loading');
        panel.send('SLOT_VERSIONS_LOADED', { charName: CHAR, slotId: 's1', requestId: retry.requestId,
            images: ['a', 'b', 'c'].map(suffix => ({ imgId: `s1-${suffix}`, timestamp: 100, savedUrl: `/s1-${suffix}.png` })),
        });
        assert.equal(panel.$('#nd_modal_load_status').hidden, true);
        assert.equal(panel.$$('#nd_modal_thumbs img').length, 3);
        panel.click(panel.$$('#nd_modal_thumbs img')[2]);
        assert.equal(panel.$('#nd_modal_img').getAttribute('data-img-id'), 's1-c');
        t.mock.timers.tick(15000);
        assert.equal(panel.$('#nd_modal_load_status').hidden, true);
    });
}

test('a version failure for the previous slot cannot change the current modal status', t => {
    const panel = loadPanel(t);
    expandPaged(panel, 4);
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(['s1', 's2'], { versions: { s1: 2, s2: 2 } }));
    panel.click(panel.$('.gallery-slot'));
    panel.click(panel.$('#nd_modal_next'));
    panel.send('SLOT_VERSIONS_FAILED', { charName: CHAR, slotId: 's1' });
    assert.equal(panel.$('#nd_modal_load_status').dataset.state, 'loading');
    assert.equal(panel.nd.getModalData().slotId, 's2');
    panel.send('SLOT_VERSIONS_LOADED', { charName: CHAR, slotId: 's2', images: [
        { imgId: 's2-a', timestamp: 100, savedUrl: '/a.png' },
        { imgId: 's2-b', timestamp: 99, savedUrl: '/b.png' },
    ] });
    assert.equal(panel.$('#nd_modal_load_status').hidden, true);
});

test('refreshing over 500 loaded groups retains the visible range until every bounded page arrives', t => {
    const panel = loadPanel(t);
    expandPaged(panel, 528);
    for (let offset = 0; offset < 528; offset += 24) {
        if (offset) panel.click(panel.$('.gallery-more [data-action="more"]'));
        panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(slotIds(offset + 1, offset + 24), { offset, total: 528, hasMore: offset + 24 < 528 }));
    }
    const oldCard = panel.$('.gallery-slot');
    panel.send('CACHE_DATA', { gallerySummary: bigSummary(529) });
    const liveOrder = ['new', ...slotIds(1, 528)];
    for (let offset = 0; offset < 528; offset += 24) {
        const request = loadRequests(panel).at(-1);
        assert.equal(request.offset, offset);
        assert.equal(request.limit, 24);
        assert.equal(panel.$('.gallery-slot'), oldCard);
        panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(liveOrder.slice(offset, offset + 24), { offset, total: 529, hasMore: true }));
        assert.equal(cardIds(panel).length, 528);
    }
    sameJson(cardIds(panel), liveOrder.slice(0, 528));
});

test('failed refresh keeps old cards; obsolete success and failure replies cannot settle the retry', t => {
    const panel = loadPanel(t);
    expandPaged(panel, 30);
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(slotIds(1, 24), { total: 30, hasMore: true }));
    panel.click(panel.$('.gallery-more [data-action="more"]'));
    const oldRequest = panel.posted.at(-1);
    panel.send('CACHE_DATA', { gallerySummary: bigSummary(31) });
    const refresh = panel.posted.at(-1);
    panel.send('CHARACTER_PREVIEWS_FAILED', { charName: CHAR, requestId: refresh.requestId });
    sameJson(cardIds(panel), slotIds(1, 24));
    panel.click(panel.$('.gallery-more [data-action="more"]'));
    const retry = panel.posted.at(-1);
    assert.notEqual(retry.requestId, refresh.requestId);
    panel.send('CHARACTER_PREVIEWS_LOADED', { ...slotsPage(slotIds(25, 30), { offset: 24, total: 30 }), requestId: oldRequest.requestId });
    panel.send('CHARACTER_PREVIEWS_FAILED', { charName: CHAR, requestId: refresh.requestId });
    sameJson(cardIds(panel), slotIds(1, 24));
    panel.send('CHARACTER_PREVIEWS_LOADED', { ...slotsPage(['new', ...slotIds(1, 23)], { total: 31, hasMore: true }), requestId: retry.requestId });
    sameJson(cardIds(panel), ['new', ...slotIds(1, 23)]);
});

function expandPaged(panel, count) {
    panel.initData(NO_SETTINGS());
    panel.send('CACHE_DATA', { cacheStats: { count, sizeMB: 1 }, gallerySummary: bigSummary(count) });
    panel.click(panel.$('.gallery-char-header'));
}

test('expanding a character asks for the first batch only (offset 0, page size), and only once', (t) => {
    const panel = loadPanel(t, { intersection: true });
    expandPaged(panel, 60);
    sameJson(loadRequests(panel), [{ type: 'LOAD_CHARACTER_PREVIEWS', charName: CHAR, offset: 0, limit: 24 }]);
    panel.click(panel.$('.gallery-char-header')); // 请求在途时折叠再展开：不重复要
    panel.click(panel.$('.gallery-char-header'));
    assert.equal(loadRequests(panel).length, 1);
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(slotIds(1, 24), { total: 60, hasMore: true }));
    assert.equal(panel.$$('.gallery-slot').length, 24);
    assert.equal(loadRequests(panel).length, 1, '还没滚到哨兵，不会自己要下一批');
});

test('reaching the sentinel loads the next batch and appends it; old cards stay, and after the last batch the sentinel is gone and the total shows', (t) => {
    const panel = loadPanel(t, { intersection: true });
    expandPaged(panel, 26);
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(slotIds(1, 24), { total: 26, hasMore: true }));
    const oldCards = panel.$$('.gallery-slot');
    const container = panel.$('.gallery-slots');
    assert.ok(panel.$('.gallery-more'), '还有更多：容器末尾有哨兵');
    assert.equal(container.lastElementChild, panel.$('.gallery-more'));
    const observer = panel.observers.filter(item => !item.disconnected).at(-1);
    assert.ok(observer.targets.has(panel.$('.gallery-more')), '哨兵被观察');
    assert.equal(observer.options.rootMargin, '0px 0px 400px 0px', '提前一屏加载');

    observer.trigger(false); // 没进视口不请求
    assert.equal(loadRequests(panel).length, 1);
    observer.trigger(true);
    observer.trigger(true); // 在途时再次触发不重复请求
    sameJson(loadRequests(panel).slice(1), [{ type: 'LOAD_CHARACTER_PREVIEWS', charName: CHAR, offset: 24, limit: 24 }]);
    assert.match(panel.$('.gallery-more').textContent, /加载中/);

    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(slotIds(25, 26), { offset: 24, total: 26, hasMore: false }));
    sameJson(cardIds(panel), slotIds(1, 26));
    oldCards.forEach((card, index) => assert.equal(panel.$$('.gallery-slot')[index], card, '旧卡片节点没有被重建'));
    assert.equal(panel.$('.gallery-slots'), container);
    assert.equal(panel.$('.gallery-more'), null, 'hasMore 为假：哨兵移除');
    assert.match(panel.$('.gallery-end-hint').textContent, /共 26 组/);
    assert.ok(panel.observers.every(item => item.disconnected || item.targets.size === 0));
    assert.equal(loadRequests(panel).length, 2, '没有更多后不再请求');
});

test('without IntersectionObserver the sentinel is a load-more button', (t) => {
    const panel = loadPanel(t);
    expandPaged(panel, 30);
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(slotIds(1, 24), { total: 30, hasMore: true }));
    const button = panel.$('.gallery-more [data-action="more"]');
    assert.ok(button);
    panel.click(button);
    sameJson(loadRequests(panel).at(-1), { type: 'LOAD_CHARACTER_PREVIEWS', charName: CHAR, offset: 24, limit: 24 });
});

test('the modal shows the latest image at once; the version strip is completed by SLOT_VERSIONS_LOADED and requested only once', (t) => {
    const panel = loadPanel(t, { intersection: true });
    expandPaged(panel, 2);
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(['s1', 's2'], { versions: { s1: 3 } }));
    panel.click(panel.$$('.gallery-slot')[1]); // s2 只有一个版本：不请求
    assert.equal(versionRequests(panel).length, 0);
    panel.click(panel.$('#nd_modal_close'));

    panel.click(panel.$$('.gallery-slot')[0]);
    sameJson(versionRequests(panel), [{ type: 'LOAD_SLOT_VERSIONS', charName: CHAR, slotId: 's1' }]);
    assert.equal(panel.$$('#nd_modal_thumbs img').length, 1, '版本到达前只有最新一张');
    assert.equal(panel.$('#nd_modal_img').getAttribute('src'), '/img/s1.png');
    assert.match(panel.$('#nd_modal_info').textContent, /版本 1 \/ 3/, '版本总数来自图组统计');

    panel.send('SLOT_VERSIONS_LOADED', {
        charName: CHAR, slotId: 's1',
        images: [1, 2, 3].map(n => ({ imgId: `s1-${n === 1 ? 'a' : n}`, slotId: 's1', timestamp: 1000 - n, savedUrl: `/img/s1-${n}.png` })),
    });
    assert.equal(panel.$$('#nd_modal_thumbs img').length, 3, '版本条补全');
    assert.equal(panel.nd.getModalData().images.length, 3);
    assert.equal(panel.nd.getModalData().currentIndex, 0);
    assert.equal(panel.$('.gallery-slot-badge.count').textContent, '3 版');

    panel.click(panel.$('#nd_modal_close'));
    panel.click(panel.$$('.gallery-slot')[0]); // 已加载过：不再请求
    assert.equal(versionRequests(panel).length, 1);
    assert.equal(panel.$$('#nd_modal_thumbs img').length, 3);
});

test('stepping the modal to the last loaded slot requests the next batch, and the arrow works once it arrives', (t) => {
    const panel = loadPanel(t, { intersection: true });
    expandPaged(panel, 3);
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(['s1', 's2'], { total: 3, hasMore: true }));
    panel.click(panel.$$('.gallery-slot')[0]);
    assert.equal(loadRequests(panel).length, 1, '还没到已加载的末尾');
    panel.click(panel.$('#nd_modal_next')); // 走到已加载的最后一个 s2
    assert.equal(panel.nd.getModalData().slotId, 's2');
    sameJson(loadRequests(panel).at(-1), { type: 'LOAD_CHARACTER_PREVIEWS', charName: CHAR, offset: 2, limit: 24 });
    assert.equal(panel.$('#nd_modal_next').disabled, true, '等下一批到了才允许继续');
    assert.match(panel.$('#nd_modal_info').textContent, /^图组 2 \/ 3/, '总数来自宿主');

    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(['s3'], { offset: 2, total: 3 }));
    assert.equal(panel.$('#nd_modal_next').disabled, false);
    panel.click(panel.$('#nd_modal_next'));
    assert.equal(panel.nd.getModalData().slotId, 's3');
    assert.equal(panel.$('#nd_modal_next').disabled, true, '真正的最后一个');
});

test('a changed gallery reloads the loaded range in bounded pages and replaces cards only when complete', (t) => {
    const panel = loadPanel(t, { intersection: true });
    expandPaged(panel, 30);
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(slotIds(1, 24), { total: 30, hasMore: true }));
    panel.observers.filter(item => !item.disconnected).at(-1).trigger(true);
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(slotIds(25, 30), { offset: 24, total: 30 }));
    assert.equal(panel.$$('.gallery-slot').length, 30);
    const oldCards = panel.$$('.gallery-slot');
    panel.posted.length = 0;

    panel.send('CACHE_DATA', { cacheStats: { count: 31, sizeMB: 1 }, gallerySummary: bigSummary(31, { latestTimestamp: 2000 }) });
    sameJson(loadRequests(panel), [{ type: 'LOAD_CHARACTER_PREVIEWS', charName: CHAR, offset: 0, limit: 24 }]);
    assert.equal(panel.$('.gallery-loading'), null, '不显示占位');
    assert.equal(panel.$$('.gallery-slot').length, 30);
    assert.equal(panel.$('.gallery-slot'), oldCards[0], '新数据到达前旧节点保留');
    assert.equal(panel.$('.gallery-char-section').classList.contains('collapsed'), false);

    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(['new', ...slotIds(1, 23)], { total: 31, hasMore: true }));
    assert.equal(panel.$('.gallery-slot'), oldCards[0]);
    sameJson(loadRequests(panel).at(-1), { type: 'LOAD_CHARACTER_PREVIEWS', charName: CHAR, offset: 24, limit: 6 });
    panel.send('CHARACTER_PREVIEWS_LOADED', { ...slotsPage(slotIds(24, 29), { offset: 24, total: 31, hasMore: true }), limit: 6 });
    assert.equal(panel.$$('.gallery-slot').length, 30);
    assert.equal(panel.$('.gallery-slot').dataset.slot, 'new');
    assert.notEqual(panel.$('.gallery-slot'), oldCards[0]);
    assert.equal(loadRequests(panel).length, 2);
});

test('deleting a whole slot from the modal removes its card locally, and the matching CACHE_DATA does not trigger a reload', (t) => {
    const panel = loadPanel(t, { intersection: true });
    expandPaged(panel, 3);
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(['s1', 's2'], { total: 3, hasMore: true }));
    const keep = panel.$$('.gallery-slot')[1];
    panel.click(panel.$$('.gallery-slot')[0]);
    panel.posted.length = 0;
    panel.send('GALLERY_IMAGE_DELETED', { imgId: 's1-a' });
    sameJson(cardIds(panel), ['s2']);
    assert.equal(panel.$('.gallery-slot'), keep);
    assert.equal(panel.$('#nd_gallery_modal').classList.contains('visible'), false);
    sameJson(panel.posted, [{ source: 'NovelDraw-Frame', type: 'REFRESH_CACHE_STATS' }]);

    panel.send('CACHE_DATA', { gallerySummary: { [CHAR]: { count: 2, totalSize: 100, latestTimestamp: 1000, slots: { s2: { count: 1 }, s3: { count: 1 } } } } });
    assert.equal(loadRequests(panel).length, 0, '摘要与本地删除结果一致：不整体重载');
    assert.equal(panel.$$('.gallery-slot').length, 1);
});

test('a version reply from before deletion cannot resurrect the deleted image', t => {
    const panel = loadPanel(t);
    expandPaged(panel, 1);
    panel.send('CHARACTER_PREVIEWS_LOADED', slotsPage(['s1'], { versions: { s1: 2 } }));
    panel.click(panel.$('.gallery-slot'));
    const request = panel.posted.at(-1);
    panel.send('GALLERY_IMAGE_DELETED', { imgId: 's1-a' });
    panel.send('SLOT_VERSIONS_LOADED', { charName: CHAR, slotId: 's1', requestId: request.requestId,
        images: [{ imgId: 's1-a' }, { imgId: 's1-old' }] });
    assert.equal(panel.$('#nd_gallery_modal').classList.contains('visible'), false);
    assert.equal(panel.nd.getModalData().images.length, 0);
});

// ───────────── API 配置预设 ─────────────

const API_PRESETS = [
    { id: 'ap1', name: '官方', config: { apiKey: 'pst-official', apiBaseUrl: '', sendMode: 'frontend', useImageBackendJobs: false, insecureTLS: false, timeout: 60000, requestDelay: { min: 15000, max: 30000 } } },
    { id: 'ap2', name: '第三方', config: { apiKey: 'pst-third', apiBaseUrl: 'https://proxy.example', sendMode: 'backend', useImageBackendJobs: true, insecureTLS: true, timeout: 90000, requestDelay: { min: 1000, max: 2000 } } },
];

function loadApiPanel(t, { activeApiPresetId = null, presets = API_PRESETS } = {}) {
    const panel = loadPanel(t);
    panel.initData({
        apiKey: 'pst-official', apiBaseUrl: '', sendMode: 'frontend', useImageBackendJobs: false, insecureTLS: false,
        timeout: 60000, requestDelay: { min: 15000, max: 30000 },
        apiPresets: structuredClone(presets), activeApiPresetId,
    }, { backendCopy: { checking: '检测中' } });
    panel.posted.length = 0;
    const apiPosts = () => panel.posted.filter(message => message.type === 'SAVE_API_PRESETS');
    const reply = (request, extra = {}) => panel.send('STATUS', {
        target: 'api-presets', state: 'success', requestId: request.requestId,
        apiPresets: request.apiPresets, activeApiPresetId: request.activeApiPresetId, config: request.config, ...extra,
    });
    const bar = action => panel.$(`#nd_api_presets [data-action="${action}"]`);
    // linkedom 的 <select> 没有 value setter：用 selected 属性选中（浏览器里等价）。
    const choose = (id) => {
        const select = panel.$('#nd_api_presets select');
        for (const option of select.children) option.removeAttribute('selected');
        Array.from(select.children).find(option => option.getAttribute('value') === id).setAttribute('selected', '');
        select.dispatchEvent(new panel.document.defaultView.Event('change', { bubbles: true }));
    };
    const settle = () => new Promise(resolve => setTimeout(resolve, 0));
    return { panel, apiPosts, reply, bar, choose, settle };
}

test('the API config page shows a preset bar and saving as a new preset sends the whole form config to the host', async (t) => {
    const { panel, apiPosts, reply, bar, settle } = loadApiPanel(t);
    assert.equal(panel.$$('#nd_api_presets option').length, 3, '“未保存为预设” + 2 个预设');
    panel.$('#nd_api_key').value = 'pst-new';
    panel.$('#nd_timeout').value = '120';
    panel.answers.prompt.push('我的新预设');
    panel.click(bar('save-as'));
    const [request] = apiPosts();
    assert.equal(request.reason, 'create');
    assert.equal(request.apiPresets.at(-1).name, '我的新预设');
    assert.equal(request.activeApiPresetId, request.apiPresets.at(-1).id);
    sameJson(request.config, { apiKey: 'pst-new', apiBaseUrl: '', sendMode: 'frontend', useImageBackendJobs: false, insecureTLS: false, timeout: 120000, requestDelay: { min: 15000, max: 30000 } });
    assert.ok(!panel.dialogs.prompts.some(text => text.includes('pst-')), '提示框不含配置内容');
    reply(request);
    await settle();
    assert.equal(panel.$$('#nd_api_presets option').length, 4);
    assert.equal(panel.$('#nd_api_presets select').value, request.activeApiPresetId);
    assert.ok(!panel.$('#nd_api_presets').textContent.includes('pst-'), '预设栏文字不含 API Key');
});

test('switching API presets confirms when the form has unsaved edits, then fills the form from the host reply', async (t) => {
    const { panel, apiPosts, reply, choose, settle } = loadApiPanel(t, { activeApiPresetId: 'ap1' });
    const select = panel.$('#nd_api_presets select');
    panel.$('#nd_api_key').value = 'pst-edited';
    panel.answers.confirm.push(false);
    choose('ap2');
    assert.equal(panel.dialogs.confirms.length, 1);
    assert.equal(apiPosts().length, 0, '取消后不保存');
    assert.equal(select.value, 'ap1');
    assert.equal(panel.$('#nd_api_key').value, 'pst-edited', '取消后表单保持不变');

    panel.answers.confirm.push(true);
    choose('ap2');
    const [request] = apiPosts();
    assert.equal(request.reason, 'select');
    assert.equal(request.activeApiPresetId, 'ap2');
    sameJson(request.config, API_PRESETS[1].config);
    reply(request);
    await settle();
    assert.equal(panel.$('#nd_api_key').value, 'pst-third');
    assert.equal(panel.$('#nd_api_base_url').value, 'https://proxy.example');
    assert.equal(panel.$('#nd_timeout').value, '90');
    assert.equal(panel.$('#nd_delay').value, '1000-2000');
    assert.equal(panel.$('#nd_insecure_tls').checked, true);
    assert.equal(panel.$('#nd_use_backend_jobs').checked, true);
    assert.equal(panel.$('#nd_backend_options').classList.contains('hidden'), false, '后端发送的选项组随之显示');
});

test('the Save button asks the host to sync the active API preset, and the receipt refreshes the bar', (t) => {
    const { panel, bar } = loadApiPanel(t, { activeApiPresetId: 'ap1' });
    assert.equal(bar('overwrite').disabled, false);
    panel.$('#nd_api_key').value = 'pst-rotated';
    panel.click(panel.$('#nd_save_api'));
    const save = panel.posted.find(message => message.type === 'SAVE_API_CONFIG');
    assert.equal(save.syncApiPreset, true);
    assert.equal(save.apiKey, 'pst-rotated');
    const synced = structuredClone(API_PRESETS);
    synced[0].config.apiKey = 'pst-rotated';
    panel.send('STATUS', {
        target: 'api', state: 'success', text: '已保存，并同步到预设「官方」',
        apiPresets: synced, activeApiPresetId: 'ap1', apiConfig: synced[0].config,
    });
    assert.equal(panel.$('#nd_api_status').textContent, '已保存，并同步到预设「官方」');
    assert.match(panel.$('#nd_api_presets .status-text').textContent, /当前预设：官方$/, '表单与预设一致');
});

test('without a selected preset the overwrite, rename and delete buttons are disabled', (t) => {
    const { bar } = loadApiPanel(t);
    for (const action of ['overwrite', 'rename', 'delete']) assert.equal(bar(action).disabled, true, action);
    assert.equal(bar('save-as').disabled, false);
});

// ── 上锁：只保护导入时不被替换，不限制其它操作 ─────────────────────────

const lockToggle = (panel, id) => panel.$(`#nd_char_list .char-card[data-id="${id}"] [data-action="toggle-lock"]`);
const cardMenuButton = (panel, id) => panel.$(`#nd_char_list .char-card[data-id="${id}"] [data-action="menu"]`);
const cardMenuOf = (panel, id) => panel.$(`#nd_char_list .char-card[data-id="${id}"] [role="menu"]`);
const openCardMenu = (panel, id) => { panel.click(cardMenuButton(panel, id)); return cardMenuOf(panel, id); };
const menuIsOpen = (panel, id) => !cardMenuOf(panel, id).hasAttribute('hidden');
const groupLock = (panel, id) => groupSection(panel, id)?.querySelector('[data-group-action="toggle-lock"]');
const groupMenuOf = (panel, id) => groupSection(panel, id)?.querySelector('[role="menu"]');
const openGroupMenu = (panel, id) => { panel.click(groupSection(panel, id).querySelector('[data-group-action="menu"]')); return groupMenuOf(panel, id); };
const groupMenuIsOpen = (panel, id) => !groupMenuOf(panel, id).hasAttribute('hidden');

test('the card lock item lives in the more-actions menu, flips only that card without a redraw and persists', (t) => {
    const panel = nestedPanel(t);
    openCardMenu(panel, 'c1');
    const button = lockToggle(panel, 'c1');
    assert.ok(cardMenuOf(panel, 'c1').contains(button));
    assert.equal(button.classList.contains('char-menu-item'), true);
    assert.equal(button.getAttribute('role'), 'menuitem');
    assert.equal(button.getAttribute('aria-pressed'), 'false');
    assert.equal(button.getAttribute('title'), '上锁：导入时不会被替换');
    assert.equal(button.querySelector('i').getAttribute('class'), 'fa-solid fa-lock-open');
    assert.equal(button.textContent.trim(), '上锁');
    assert.doesNotMatch(statusOf(panel, 'c1'), /已上锁/);

    // 另一张卡正在编辑，里面有尚未保存的输入：点锁不能重绘，输入原样保留
    startEditing(panel, 'c3').querySelector('.char-edit-name').value = '改过的名字（未保存）';
    const sameCard = panel.$('#nd_char_list .char-card[data-id="c1"]');
    panel.posted.length = 0;
    panel.click(lockToggle(panel, 'c1'));
    assert.equal(menuIsOpen(panel, 'c1'), false, '选中菜单项后菜单关闭');
    assert.equal(panel.$('#nd_char_list .char-card[data-id="c1"]'), sameCard, '没有重绘');
    assert.equal(panel.$('.char-card.editing[data-id="c3"] .char-edit-name').value, '改过的名字（未保存）');
    assert.equal(lockToggle(panel, 'c1').getAttribute('aria-pressed'), 'true');
    assert.equal(lockToggle(panel, 'c1').classList.contains('active'), true);
    assert.equal(lockToggle(panel, 'c1').getAttribute('title'), '已上锁：导入时不会被替换（点击解锁）');
    assert.equal(lockToggle(panel, 'c1').querySelector('i').getAttribute('class'), 'fa-solid fa-lock');
    assert.equal(lockToggle(panel, 'c1').textContent.trim(), '解锁', '已上锁时菜单项文字是“解锁”');
    assert.equal(lockToggle(panel, 'c1').getAttribute('aria-label'), '解锁 阿璃');
    assert.match(statusOf(panel, 'c1'), /^已上锁/);
    const ownLabel = panel.$('#nd_char_list .char-card[data-id="c1"] .char-status .char-lock-label');
    assert.equal(ownLabel.textContent, '已上锁', '自己的锁标签包在 span 里，样式里是主文字色');
    assert.equal(panel.$$('#nd_char_list .char-card[data-id="c1"] .char-status .char-lock-label').length, 1);
    assert.equal(panel.state().characterTags.find(char => char.id === 'c1').locked, true);
    assert.equal(panel.state().characterTags.find(char => char.id === 'c3').locked, undefined);
    const saved = panel.lastSave();
    assert.equal(saved.characterTags.find(char => char.id === 'c1').locked, true, '保存通道带着 locked');

    // 上锁不挡住别的操作：启停照常、状态文字顺序稳定（停用在前、上锁紧随）
    panel.click(panel.$('#nd_char_list .char-card[data-id="c1"] [data-action="toggle-enabled"]'));
    assert.equal(panel.state().characterTags.find(char => char.id === 'c1').enabled, false);
    assert.match(statusOf(panel, 'c1'), /^停用 · 已上锁/);
    assert.equal(panel.$$('#nd_char_list .char-card[data-id="c1"] .char-lock-label').length, 1, '启停后锁标签仍在 span 里');
    openCardMenu(panel, 'c1');
    panel.click(lockToggle(panel, 'c1'));
    assert.equal(lockToggle(panel, 'c1').textContent.trim(), '上锁');
    assert.match(statusOf(panel, 'c1'), /^停用/);
    assert.doesNotMatch(statusOf(panel, 'c1'), /已上锁/);
    assert.equal(Object.hasOwn(panel.state().characterTags.find(char => char.id === 'c1'), 'locked'), false, '解锁后不留 locked 键');
    assert.equal(Object.hasOwn(panel.lastSave().characterTags.find(char => char.id === 'c1'), 'locked'), false);
    assert.deepEqual(panel.errors, []);
});

test('the group lock button lives in the group actions, flips only the group and persists with the group switch pattern', (t) => {
    const panel = nestedPanel(t);
    assert.equal(groupLock(panel, ''), null, '未分组没有锁');
    const button = groupLock(panel, 'g1');
    assert.ok(button.closest('.char-group-actions'));
    assert.ok(groupMenuOf(panel, 'g1').contains(button), '分组锁在“…”菜单里');
    assert.equal(button.classList.contains('char-menu-item'), true);
    assert.equal(button.textContent.trim(), '上锁');
    assert.equal(button.getAttribute('aria-pressed'), 'false');
    assert.equal(button.getAttribute('title'), '上锁分组：组内角色导入时不会被替换');

    const tagsBefore = JSON.stringify(panel.state().characterTags);
    panel.click(button);
    assert.equal(groupLock(panel, 'g1').getAttribute('aria-pressed'), 'true');
    assert.equal(groupLock(panel, 'g1').classList.contains('active'), true);
    assert.equal(groupLock(panel, 'g1').getAttribute('title'), '已上锁分组：组内角色导入时不会被替换（点击解锁）');
    assert.equal(groupLock(panel, 'g1').querySelector('i').getAttribute('class'), 'fa-solid fa-lock');
    assert.equal(groupLock(panel, 'g2').getAttribute('aria-pressed'), 'false');
    sameJson(panel.state().characterGroups, [{ id: 'g1', name: '主角', locked: true }, { id: 'g2', name: '配角' }]);
    assert.equal(JSON.stringify(panel.state().characterTags), tagsBefore, '角色整体没有变化');
    sameJson(panel.lastSave().characterGroups, [{ id: 'g1', name: '主角', locked: true }, { id: 'g2', name: '配角' }]);
    assert.equal(groupSection(panel, 'g1').classList.contains('group-disabled'), false, '上锁不等于关闭');

    // 分组开关仍可用，两个开关互相独立；再点锁恢复且不留键
    panel.click(groupSwitch(panel, 'g1'));
    sameJson(panel.state().characterGroups[0], { id: 'g1', name: '主角', enabled: false, locked: true });
    openGroupMenu(panel, 'g1');
    panel.click(groupLock(panel, 'g1'));
    sameJson(panel.state().characterGroups[0], { id: 'g1', name: '主角', enabled: false });
    assert.deepEqual(panel.errors, []);
});

test('characters in a locked group get the group-lock hint while their own lock button stays unpressed', (t) => {
    const panel = nestedPanel(t);
    openGroupMenu(panel, 'g1');
    panel.click(groupLock(panel, 'g1'));
    assert.match(statusOf(panel, 'c1'), /^分组已上锁/);
    assert.match(statusOf(panel, 'c2'), /^停用 · 分组已上锁/, 'c2 自己停用：停用在前，分组上锁紧随');
    assert.doesNotMatch(statusOf(panel, 'c3'), /上锁/, '其他分组的角色不受影响');
    assert.doesNotMatch(statusOf(panel, 'c4'), /上锁/);
    assert.equal(panel.$$('#nd_char_list .char-card[data-id="c1"] .char-lock-label').length, 0, '继承的“分组已上锁”不加亮');
    assert.equal(lockToggle(panel, 'c1').getAttribute('aria-pressed'), 'false', '继承的锁不算角色自己的锁');
    assert.equal(lockToggle(panel, 'c1').classList.contains('active'), false);
    assert.match(lockToggle(panel, 'c1').getAttribute('title'), /上锁：导入时不会被替换.*所在分组已上锁/);
    assert.equal(Object.hasOwn(panel.state().characterTags.find(char => char.id === 'c1'), 'locked'), false, '继承的锁不会写进角色');

    // 给角色自己上锁后，状态文字改为“已上锁”；解锁后回到分组提示
    openCardMenu(panel, 'c1');
    panel.click(lockToggle(panel, 'c1'));
    assert.match(statusOf(panel, 'c1'), /^已上锁/);
    assert.doesNotMatch(statusOf(panel, 'c1'), /分组已上锁/);
    openCardMenu(panel, 'c1');
    panel.click(lockToggle(panel, 'c1'));
    assert.match(statusOf(panel, 'c1'), /^分组已上锁/);
    // 分组解锁后提示消失
    openGroupMenu(panel, 'g1');
    panel.click(groupLock(panel, 'g1'));
    assert.doesNotMatch(statusOf(panel, 'c1'), /上锁/);
});

test('locks survive the save round trip: iframe save, shared settings normalization and the next INIT_DATA', (t) => {
    const panel = nestedPanel(t);
    openCardMenu(panel, 'c3');
    panel.click(lockToggle(panel, 'c3'));
    openGroupMenu(panel, 'g1');
    panel.click(groupLock(panel, 'g1'));
    const saved = panel.lastSave();
    // 宿主按共享设置规范化后写盘（与 SAVE_CHARACTER_TAGS 的处理一致），锁不能被白名单丢掉
    const stored = normalizeSharedDrawSettings({ characterTags: saved.characterTags, characterGroups: saved.characterGroups });
    assert.equal(stored.characterTags.find(char => char.id === 'c3').locked, true);
    assert.equal(stored.characterTags.find(char => char.id === 'c1').locked, undefined);
    sameJson(stored.characterGroups.map(group => [group.id, group.locked === true]), [['g1', true], ['g2', false]]);

    // 宿主把规范化后的库推回来：锁状态原样显示
    panel.initData({ characterTags: stored.characterTags, characterGroups: stored.characterGroups });
    assert.equal(lockToggle(panel, 'c3').getAttribute('aria-pressed'), 'true');
    assert.equal(groupLock(panel, 'g1').getAttribute('aria-pressed'), 'true');
    assert.match(statusOf(panel, 'c3'), /已上锁/);
    assert.match(statusOf(panel, 'c1'), /分组已上锁/);
    // 撤销指纹把锁算进去：撤销窗口内改锁会让撤销失效，而不是被快照抹掉
    panel.nd.deleteCharactersWithUndo(['c4'], '已删除旅人');
    assert.equal(panel.nd.isUndoStale(), false);
    openCardMenu(panel, 'c3');
    panel.click(lockToggle(panel, 'c3'));
    assert.equal(panel.nd.isUndoStale(), true);
});

// ── 角色卡“…”菜单 ─────────────────────────────────────────

test('the card surface shows only the enabled toggle, edit and the more-actions button; the menu holds lock, duplicate and delete', (t) => {
    const panel = nestedPanel(t);
    const actions = panel.$('#nd_char_list .char-card[data-id="c1"] .char-actions');
    const menu = cardMenuOf(panel, 'c1');
    const surface = Array.from(actions.querySelectorAll('button')).filter(node => !menu.contains(node));
    sameJson(surface.map(node => node.dataset.action), ['toggle-enabled', 'edit', 'menu']);
    assert.equal(actions.lastElementChild.contains(surface[2]), true, '“…”在最右');

    const more = cardMenuButton(panel, 'c1');
    assert.equal(more.classList.contains('char-action-button'), true);
    assert.equal(more.getAttribute('aria-haspopup'), 'menu');
    assert.equal(more.getAttribute('aria-expanded'), 'false');
    assert.equal(more.getAttribute('title'), '更多操作');
    assert.equal(more.getAttribute('aria-label'), '更多操作 阿璃');
    assert.equal(more.querySelector('i').getAttribute('class'), 'fa-solid fa-ellipsis');

    assert.equal(menu.getAttribute('role'), 'menu');
    assert.equal(menu.hasAttribute('hidden'), true);
    const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
    sameJson(items.map(item => item.dataset.action), ['toggle-lock', 'duplicate', 'delete']);
    sameJson(items.map(item => item.textContent.trim()), ['上锁', '复制人设', '删除']);
    assert.ok(items.every(item => item.tagName === 'BUTTON' && item.querySelector('i')), '图标加文字的按钮');
    assert.equal(items[2].classList.contains('danger'), true);

    openCardMenu(panel, 'c1');
    assert.equal(menuIsOpen(panel, 'c1'), true);
    assert.equal(more.getAttribute('aria-expanded'), 'true');
    assert.equal(menu.style.position, 'fixed', '用固定定位的浮层，不被分组滚动区裁掉');
});

test('only one card menu is open at a time; Esc, an outside click and a full redraw close it', (t) => {
    const panel = nestedPanel(t);
    openCardMenu(panel, 'c1');
    openCardMenu(panel, 'c3');
    assert.equal(menuIsOpen(panel, 'c1'), false);
    assert.equal(menuIsOpen(panel, 'c3'), true);

    panel.click(panel.$('#nd_char_list .char-card[data-id="c1"] .char-name'));
    assert.equal(menuIsOpen(panel, 'c3'), false, '点菜单外面关闭');

    openCardMenu(panel, 'c3');
    const esc = new panel.document.defaultView.Event('keydown', { bubbles: true, cancelable: true });
    esc.key = 'Escape';
    panel.document.dispatchEvent(esc);
    assert.equal(menuIsOpen(panel, 'c3'), false, 'Esc 关闭');
    assert.equal(cardMenuButton(panel, 'c3').getAttribute('aria-expanded'), 'false');

    openCardMenu(panel, 'c3');
    panel.nd.renderCharList();
    assert.equal(menuIsOpen(panel, 'c3'), false, '整体重绘后不留打开的菜单');
    assert.equal(cardMenuButton(panel, 'c3').getAttribute('aria-expanded'), 'false');
    assert.deepEqual(panel.errors, []);
});

test('choosing duplicate or delete from the menu runs the same action and closes the menu', (t) => {
    const panel = nestedPanel(t);
    const before = panel.state().characterTags.length;
    openCardMenu(panel, 'c1');
    panel.click(panel.$('#nd_char_list .char-card[data-id="c1"] [data-action="duplicate"]'));
    assert.equal(panel.state().characterTags.length, before + 1);
    assert.equal(panel.$$('#nd_char_list .char-menu:not([hidden])').length, 0, '重绘后没有打开的菜单');

    openCardMenu(panel, 'c3');
    panel.click(panel.$('#nd_char_list .char-card[data-id="c3"] [data-action="delete"]'));
    assert.equal(panel.state().characterTags.some(char => char.id === 'c3'), false);
    assert.equal(panel.$$('#nd_char_list .char-menu:not([hidden])').length, 0);
    assert.deepEqual(panel.errors, []);
});

// ── 分组头“…”菜单 ─────────────────────────────────────────

test('the group header surface keeps switch, add and rename; lock and delete live in the more-actions menu', (t) => {
    const panel = nestedPanel(t);
    const actions = groupSection(panel, 'g1').querySelector('.char-group-actions');
    const menu = groupMenuOf(panel, 'g1');
    const surface = Array.from(actions.querySelectorAll('button')).filter(node => !menu.contains(node));
    sameJson(surface.map(node => node.dataset.groupAction), ['toggle-enabled', 'add', 'rename', 'menu']);

    const more = groupSection(panel, 'g1').querySelector('[data-group-action="menu"]');
    assert.equal(more.classList.contains('char-action-button'), true);
    assert.equal(more.getAttribute('aria-haspopup'), 'menu');
    assert.equal(more.getAttribute('aria-expanded'), 'false');
    assert.equal(more.getAttribute('title'), '更多操作');
    assert.equal(more.getAttribute('aria-label'), '更多操作 主角');
    assert.equal(menu.hasAttribute('hidden'), true);
    const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
    sameJson(items.map(item => item.dataset.groupAction), ['toggle-lock', 'delete']);
    sameJson(items.map(item => item.textContent.trim()), ['上锁', '删除分组']);
    assert.ok(items.every(item => item.tagName === 'BUTTON' && item.querySelector('i')));
    assert.equal(items[1].classList.contains('danger'), true);
    assert.equal(groupSection(panel, '').querySelector('[data-group-action="menu"]'), null, '未分组没有“…”菜单');

    openGroupMenu(panel, 'g1');
    assert.equal(groupMenuIsOpen(panel, 'g1'), true);
    assert.equal(more.getAttribute('aria-expanded'), 'true');
    assert.equal(menu.style.position, 'fixed');
});

test('group and card menus share the one-open-at-a-time rule; Esc and outside click close the group menu', (t) => {
    const panel = nestedPanel(t);
    openGroupMenu(panel, 'g1');
    openCardMenu(panel, 'c3');
    assert.equal(groupMenuIsOpen(panel, 'g1'), false);
    assert.equal(menuIsOpen(panel, 'c3'), true);
    openGroupMenu(panel, 'g2');
    assert.equal(menuIsOpen(panel, 'c3'), false);
    assert.equal(groupMenuIsOpen(panel, 'g2'), true);

    panel.click(panel.$('#nd_char_list .char-card[data-id="c1"] .char-name'));
    assert.equal(groupMenuIsOpen(panel, 'g2'), false, '点菜单外面关闭');
    openGroupMenu(panel, 'g1');
    const esc = new panel.document.defaultView.Event('keydown', { bubbles: true, cancelable: true });
    esc.key = 'Escape';
    panel.document.dispatchEvent(esc);
    assert.equal(groupMenuIsOpen(panel, 'g1'), false, 'Esc 关闭');
    assert.equal(groupSection(panel, 'g1').querySelector('[data-group-action="menu"]').getAttribute('aria-expanded'), 'false');
    assert.deepEqual(panel.errors, []);
});

test('choosing lock or delete group from the menu runs the action and closes the menu', (t) => {
    const panel = nestedPanel(t);
    openGroupMenu(panel, 'g1');
    panel.click(groupLock(panel, 'g1'));
    assert.equal(panel.state().characterGroups.find(group => group.id === 'g1').locked, true);
    assert.equal(groupMenuIsOpen(panel, 'g1'), false, '重绘后菜单是关着的');
    assert.equal(groupLock(panel, 'g1').textContent.trim(), '解锁');
    assert.equal(groupLock(panel, 'g1').getAttribute('aria-label'), '解锁分组 主角');

    panel.answers.confirm.push(true, false);
    openGroupMenu(panel, 'g2');
    panel.click(groupSection(panel, 'g2').querySelector('[data-group-action="delete"]'));
    assert.equal(panel.state().characterGroups.some(group => group.id === 'g2'), false);
    assert.equal(panel.$$('#nd_char_list .char-menu:not([hidden])').length, 0);
    assert.deepEqual(panel.errors, []);
});

// ── 绘图参数预设：列表（点选 / “…”菜单 / 拖拽与键盘排序） ─────────────

const paramsPreset = (id, name, extra = {}) => ({ id, name, positivePrefix: `pos-${id}`, negativePrefix: '', params: { model: 'nai-diffusion-4-5-full' }, ...extra });
const threePresets = () => [paramsPreset('p1', '预设一'), paramsPreset('p2', '预设二'), paramsPreset('p3', '预设三')];

// linkedom 的 <select>.value 只读：模型下拉框要先“选中”一项，页面应用预设时才读得到模型名。
const selectModel = panel => chooseOption(panel.$('#nd_model_sel'), 'nai-diffusion-4-5-full');

function showParamsPresets(panel, { selected = 'p1', presets = threePresets() } = {}) {
    selectModel(panel);
    panel.initData({ paramsPresets: presets, selectedParamsPresetId: selected });
    panel.posted.length = 0;
}

const paramsRows = panel => panel.$$('#nd_params_list .preset-row');
const paramsRowIds = panel => paramsRows(panel).map(row => row.dataset.presetId);
const paramsRow = (panel, id) => panel.$(`#nd_params_list .preset-row[data-preset-id="${id}"]`);
const paramsRowName = (panel, id) => paramsRow(panel, id).querySelector('.preset-row-name');
const paramsHandle = (panel, id) => paramsRow(panel, id).querySelector('[data-preset-drag]');
const paramsMenuButton = (panel, id) => paramsRow(panel, id).querySelector('[data-preset-action="menu"]');
const paramsMenu = (panel, id) => paramsRow(panel, id).querySelector('[role="menu"]');
const paramsMenuIsOpen = (panel, id) => !paramsMenu(panel, id).hasAttribute('hidden');
const paramsMenuItem = (panel, id, action) => paramsMenu(panel, id).querySelector(`[data-preset-action="${action}"]`);
const openParamsMenu = (panel, id) => { panel.click(paramsMenuButton(panel, id)); return paramsMenu(panel, id); };
const sentTypes = panel => panel.posted.map(message => message.type);
const sentBodies = panel => panel.posted.map(({ source, ...body }) => body); // 去掉每条消息都带的 source

// linkedom 没有布局：列表里每行给一个固定 100px 高的矩形（自上而下），并让 elementFromPoint 返回指定节点。
function layoutParamsRows(panel) {
    let top = 0;
    for (const row of paramsRows(panel)) {
        const rect = { top, bottom: top + 100, height: 100, left: 0, right: 300, width: 300 };
        row.getBoundingClientRect = () => rect;
        top += 100;
    }
    panel.document.elementFromPoint = () => panel.$('#nd_params_list');
}

function firePointer(panel, target, type, props) {
    const event = new panel.document.defaultView.Event(type, { bubbles: true, cancelable: true });
    Object.assign(event, { button: 0, pointerId: 1, clientX: 20, ...props });
    target.dispatchEvent(event);
    return event;
}

function dragParamsPreset(panel, id, { startY = 10, moveY, endY = moveY }) {
    layoutParamsRows(panel);
    firePointer(panel, paramsHandle(panel, id), 'pointerdown', { clientY: startY });
    firePointer(panel, panel.document, 'pointermove', { clientY: moveY });
    firePointer(panel, panel.document, 'pointerup', { clientY: endY });
}

test('the params preset bar is a list: one row per preset in host order, the selected one marked', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel, { selected: 'p2' });
    sameJson(paramsRowIds(panel), ['p1', 'p2', 'p3']);
    sameJson(paramsRows(panel).map(row => row.querySelector('.preset-row-name').textContent), ['预设一', '预设二', '预设三']);
    sameJson(paramsRows(panel).map(row => row.classList.contains('selected')), [false, true, false]);
    sameJson(paramsRows(panel).map(row => row.querySelector('.preset-row-name').getAttribute('aria-current')), [null, 'true', null]);
    for (const row of paramsRows(panel)) {
        const handle = row.querySelector('[data-preset-drag]');
        assert.equal(handle.classList.contains('char-drag-handle'), true, '复用角色列表的手柄样式');
        assert.equal(handle.getAttribute('role'), 'button');
        assert.equal(handle.getAttribute('tabindex'), '0');
        assert.match(handle.getAttribute('title'), /↑ \/ ↓/);
        assert.match(handle.getAttribute('aria-label'), /拖动调整参数预设/);
        assert.equal(row.querySelector('.preset-row-name').tagName, 'BUTTON');
        assert.equal(row.querySelector('[data-preset-action="menu"]').getAttribute('aria-haspopup'), 'menu');
    }
    // 表单填的是选中的那个
    assert.equal(panel.$('#nd_positive').value, 'pos-p2');
});

test('the old select and its row of buttons are gone; new / cloud / save stay in the card header with the status line', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel);
    for (const id of ['nd_params_preset', 'nd_params_rename', 'nd_params_export', 'nd_params_del', 'nd_params_up', 'nd_params_down']) {
        assert.equal(panel.$(`#${id}`), null, id);
    }
    const header = panel.$('#view-params .preset-list-header');
    assert.match(header.querySelector('.card-title').textContent, /参数预设/);
    sameJson(Array.from(header.querySelectorAll('button')).map(button => button.id), ['nd_params_add', 'nd_params_cloud', 'nd_params_save']);
    assert.ok(panel.$('#nd_params_list'));
    assert.ok(panel.$('#nd_params_status'));
    assert.equal(panel.$$('#view-params select#nd_params_preset').length, 0);
    assert.deepEqual(panel.errors, []);
});

test('preset names are escaped in the list, and a missing selection falls back to the first row like the form does', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel, { selected: 'gone', presets: [paramsPreset('p1', '<b>粗</b>"引号"'), paramsPreset('p2', '预设二')] });
    assert.equal(paramsRowName(panel, 'p1').textContent, '<b>粗</b>"引号"');
    assert.equal(panel.$$('#nd_params_list b').length, 0);
    assert.equal(paramsRow(panel, 'p1').classList.contains('selected'), true);
    assert.equal(panel.$('#nd_positive').value, 'pos-p1');
});

test('clicking a row selects it locally: the form is filled, the highlight moves, and the host is told nothing', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel, { selected: 'p1' });
    selectModel(panel);
    panel.click(paramsRowName(panel, 'p3'));
    assert.equal(panel.state().selectedParamsPresetId, 'p3');
    assert.equal(panel.$('#nd_positive').value, 'pos-p3');
    sameJson(paramsRows(panel).map(row => row.classList.contains('selected')), [false, false, true]);
    assert.equal(paramsRowName(panel, 'p3').getAttribute('aria-current'), 'true');
    assert.equal(paramsRowName(panel, 'p1').hasAttribute('aria-current'), false);
    // 切换会照旧让提示词预览按新模型刷新（GET_PROMPT_CHAIN），但不会保存 / 新建 / 删除 / 排序任何预设
    assert.deepEqual(sentTypes(panel).filter(type => type !== 'GET_PROMPT_CHAIN'), [], '和旧下拉框一样，切换不持久化');
});

test('clicking the row that is already selected does not wipe unsaved edits in the form', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel, { selected: 'p1' });
    panel.$('#nd_positive').value = 'typed but not saved';
    panel.click(paramsRowName(panel, 'p1'));
    assert.equal(panel.$('#nd_positive').value, 'typed but not saved');
});

test('the more-actions menu of a row offers rename, duplicate, export and a danger-styled delete', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel);
    const menu = paramsMenu(panel, 'p2');
    assert.equal(menu.hasAttribute('hidden'), true);
    const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
    sameJson(items.map(item => item.dataset.presetAction), ['rename', 'duplicate', 'export', 'delete']);
    sameJson(items.map(item => item.textContent.trim()), ['重命名', '复制', '导出', '删除']);
    assert.ok(items.every(item => item.tagName === 'BUTTON' && item.classList.contains('char-menu-item') && item.querySelector('i')));
    assert.equal(items[3].classList.contains('danger'), true);

    openParamsMenu(panel, 'p2');
    assert.equal(paramsMenuIsOpen(panel, 'p2'), true);
    assert.equal(paramsMenuButton(panel, 'p2').getAttribute('aria-expanded'), 'true');
    assert.equal(paramsMenu(panel, 'p2').style.position, 'fixed');
    openParamsMenu(panel, 'p3'); // 同一时间只开一个
    assert.equal(paramsMenuIsOpen(panel, 'p2'), false);
    assert.equal(paramsMenuIsOpen(panel, 'p3'), true);
    const esc = new panel.document.defaultView.Event('keydown', { bubbles: true, cancelable: true });
    esc.key = 'Escape';
    panel.document.dispatchEvent(esc);
    assert.equal(paramsMenuIsOpen(panel, 'p3'), false, 'Esc 关闭');
    assert.equal(panel.posted.length, 0, '只开关菜单不发任何消息');
    assert.deepEqual(panel.errors, []);
});

test('rename acts on the row whose menu was used and posts the same save message as before', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel, { selected: 'p1' });
    panel.answers.prompt.push('  新名字  ');
    openParamsMenu(panel, 'p2');
    panel.click(paramsMenuItem(panel, 'p2', 'rename'));
    const message = panel.posted.find(item => item.type === 'SAVE_PARAMS_PRESET');
    assert.equal(message.selectedParamsPresetId, 'p1', '选中项不因为给别的行改名而变');
    sameJson(message.paramsPresets.map(item => [item.id, item.name]), [['p1', '预设一'], ['p2', '新名字'], ['p3', '预设三']]);
    assert.equal(paramsRowName(panel, 'p2').textContent, '新名字', '列表立刻显示新名字');
    assert.equal(paramsMenuIsOpen(panel, 'p2'), false);

    panel.posted.length = 0;
    panel.answers.prompt.push(null); // 取消
    panel.click(paramsMenuItem(panel, 'p3', 'rename'));
    panel.answers.prompt.push('   '); // 空白
    panel.click(paramsMenuItem(panel, 'p3', 'rename'));
    assert.equal(panel.posted.length, 0);
    assert.equal(paramsRowName(panel, 'p3').textContent, '预设三');
});

test('duplicate asks the host for a copy of that row, named "<name> 副本", without changing the selection', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel, { selected: 'p1' });
    openParamsMenu(panel, 'p3');
    panel.click(paramsMenuItem(panel, 'p3', 'duplicate'));
    sameJson(sentBodies(panel), [{ type: 'ADD_PARAMS_PRESET', baseId: 'p3', name: '预设三 副本' }]);
    assert.equal(panel.state().selectedParamsPresetId, 'p1');
    assert.equal(paramsMenuIsOpen(panel, 'p3'), false);
});

test('export sends the id of the row, not the selected one', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel, { selected: 'p1' });
    openParamsMenu(panel, 'p3');
    panel.click(paramsMenuItem(panel, 'p3', 'export'));
    sameJson(sentBodies(panel), [{ type: 'EXPORT_CURRENT_PRESET', presetId: 'p3' }]);
});

test('delete asks for confirmation naming the row and sends the id of the row you clicked, not the selected one', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel, { selected: 'p1' });
    openParamsMenu(panel, 'p3');
    panel.click(paramsMenuItem(panel, 'p3', 'delete'));
    assert.match(panel.dialogs.confirms.at(-1), /确定删除参数预设“预设三”/);
    sameJson(sentBodies(panel), [{ type: 'DEL_PARAMS_PRESET', presetId: 'p3' }]);
});

test('declining the delete confirmation sends nothing and keeps the list', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel);
    panel.answers.confirm.push(false);
    openParamsMenu(panel, 'p2');
    panel.click(paramsMenuItem(panel, 'p2', 'delete'));
    assert.equal(panel.dialogs.confirms.length, 1);
    assert.equal(panel.posted.length, 0);
    sameJson(paramsRowIds(panel), ['p1', 'p2', 'p3']);
});

test('a new params preset is based on the row currently selected in the list', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel, { selected: 'p1' });
    panel.click(paramsRowName(panel, 'p2'));
    panel.posted.length = 0;
    panel.click(panel.$('#nd_params_add'));
    sameJson(sentBodies(panel), [{ type: 'ADD_PARAMS_PRESET', baseId: 'p2' }]);
});

test('the cloud button and the save button keep their behaviour', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel, { selected: 'p1' });
    panel.click(panel.$('#nd_params_cloud'));
    assert.deepEqual(sentTypes(panel), ['OPEN_CLOUD_PRESETS']);

    panel.posted.length = 0;
    panel.click(paramsRowName(panel, 'p2'));
    panel.$('#nd_positive').value = 'edited then saved';
    panel.click(panel.$('#nd_params_save'));
    const save = panel.posted.find(item => item.type === 'SAVE_PARAMS_PRESET');
    assert.equal(save.selectedParamsPresetId, 'p2', '保存时才把页面的选中项告诉宿主');
    assert.equal(save.paramsPresets.find(item => item.id === 'p2').positivePrefix, 'edited then saved', '保存收集表单');
    assert.equal(panel.$('#nd_params_save').classList.contains('saving'), true);
});

test('dragging a row by its handle reorders list and state at once and sends only the new id order', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel, { selected: 'p1' });
    panel.$('#nd_positive').value = 'typed but not saved';
    dragParamsPreset(panel, 'p1', { moveY: 290 });
    sameJson(paramsRowIds(panel), ['p2', 'p3', 'p1']);
    sameJson(panel.state().paramsPresets.map(item => item.id), ['p2', 'p3', 'p1']);
    assert.equal(panel.state().selectedParamsPresetId, 'p1', '选中项跟着走');
    assert.equal(paramsRow(panel, 'p1').classList.contains('selected'), true);
    sameJson(sentBodies(panel), [{ type: 'REORDER_PARAMS_PRESETS', order: ['p2', 'p3', 'p1'] }]);
    assert.equal(panel.$('#nd_positive').value, 'typed but not saved', '重排不重填表单，未保存的编辑还在');
    assert.equal(panel.$$('#nd_params_list .dragging, #nd_params_list .drop-before, #nd_params_list .drop-after').length, 0);
    assert.deepEqual(panel.errors, []);
});

test('dragging another row than the selected one also leaves the selection and the form alone', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel, { selected: 'p2' });
    panel.$('#nd_positive').value = 'typed but not saved';
    dragParamsPreset(panel, 'p3', { startY: 250, moveY: 10 });
    sameJson(paramsRowIds(panel), ['p3', 'p1', 'p2']);
    assert.equal(panel.state().selectedParamsPresetId, 'p2');
    assert.equal(panel.$('#nd_positive').value, 'typed but not saved');
    assert.deepEqual(sentTypes(panel), ['REORDER_PARAMS_PRESETS']);
});

test('while dragging, the row is dimmed and a drop line marks the target; dropping where it started sends nothing', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel);
    layoutParamsRows(panel);
    firePointer(panel, paramsHandle(panel, 'p1'), 'pointerdown', { clientY: 10 });
    assert.equal(paramsRow(panel, 'p1').classList.contains('dragging'), true);
    firePointer(panel, panel.document, 'pointermove', { clientY: 160 });
    assert.equal(paramsRow(panel, 'p3').classList.contains('drop-before'), true);
    firePointer(panel, panel.document, 'pointermove', { clientY: 60 });
    firePointer(panel, panel.document, 'pointerup', { clientY: 60 });
    sameJson(paramsRowIds(panel), ['p1', 'p2', 'p3']);
    assert.equal(panel.posted.length, 0);
    assert.equal(panel.$$('#nd_params_list .dragging, #nd_params_list .drop-before, #nd_params_list .drop-after').length, 0);
});

test('Esc cancels a drag in progress: nothing is sent and the order is unchanged', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel);
    layoutParamsRows(panel);
    firePointer(panel, paramsHandle(panel, 'p1'), 'pointerdown', { clientY: 10 });
    firePointer(panel, panel.document, 'pointermove', { clientY: 290 });
    const esc = new panel.document.defaultView.Event('keydown', { bubbles: true, cancelable: true });
    esc.key = 'Escape';
    panel.document.dispatchEvent(esc);
    firePointer(panel, panel.document, 'pointerup', { clientY: 290 });
    sameJson(paramsRowIds(panel), ['p1', 'p2', 'p3']);
    assert.equal(panel.posted.length, 0);
    assert.equal(panel.$$('#nd_params_list .dragging, #nd_params_list .drop-before, #nd_params_list .drop-after').length, 0);
});

test('keyboard: arrow keys on a handle move the preset one step, keep unsaved edits, and stop at both ends', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel, { selected: 'p1' });
    // linkedom 的 focus() 是空操作：记录哪个手柄被聚焦，验证重绘后焦点还给了同一个手柄。
    const focused = [];
    const proto = Object.getPrototypeOf(paramsHandle(panel, 'p1'));
    proto.focus = function focus() { focused.push(this.dataset.presetDrag); };
    t.after(() => { delete proto.focus; });
    panel.$('#nd_positive').value = 'typed but not saved';

    const down = pressKey(panel, paramsHandle(panel, 'p1'), 'ArrowDown');
    assert.equal(down.defaultPrevented, true);
    sameJson(paramsRowIds(panel), ['p2', 'p1', 'p3']);
    sameJson(panel.state().paramsPresets.map(item => item.id), ['p2', 'p1', 'p3']);
    sameJson(sentBodies(panel), [{ type: 'REORDER_PARAMS_PRESETS', order: ['p2', 'p1', 'p3'] }]);
    sameJson(focused, ['p1']);
    assert.equal(panel.$('#nd_positive').value, 'typed but not saved');
    assert.equal(panel.posted.some(item => item.type === 'SAVE_PARAMS_PRESET'), false, '不把整份预设内容送回宿主');

    pressKey(panel, paramsHandle(panel, 'p1'), 'ArrowUp');
    sameJson(paramsRowIds(panel), ['p1', 'p2', 'p3']);
    panel.posted.length = 0;
    pressKey(panel, paramsHandle(panel, 'p1'), 'ArrowUp'); // 已在最前
    pressKey(panel, paramsHandle(panel, 'p3'), 'ArrowDown'); // 已在最后
    sameJson(paramsRowIds(panel), ['p1', 'p2', 'p3']);
    assert.equal(panel.posted.length, 0, '边界处什么也不发');
    const other = pressKey(panel, paramsHandle(panel, 'p2'), 'a');
    assert.equal(other.defaultPrevented, false);
    assert.deepEqual(panel.errors, []);
});

test('dragging near the bottom edge of a scrolled list scrolls the list itself', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel);
    layoutParamsRows(panel);
    const list = panel.$('#nd_params_list');
    list.testOverflowY = 'auto';
    Object.assign(list, { scrollHeight: 600, clientHeight: 260, scrollTop: 0 });
    list.getBoundingClientRect = () => ({ top: 0, bottom: 260, left: 0, right: 300 });
    panel.document.elementFromPoint = () => paramsRow(panel, 'p2');
    firePointer(panel, paramsHandle(panel, 'p1'), 'pointerdown', { clientY: 10 });
    firePointer(panel, panel.document, 'pointermove', { clientY: 250 });
    assert.equal(list.scrollTop, 14, '指针在列表下缘感应区内：列表自己滚一步');
    firePointer(panel, panel.document, 'pointercancel', {});
    sameJson(paramsRowIds(panel), ['p1', 'p2', 'p3']);
});

test('after a reorder the rows are rebuilt but still draggable and still act on their own ids', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel);
    dragParamsPreset(panel, 'p1', { moveY: 290 });
    panel.posted.length = 0;
    dragParamsPreset(panel, 'p2', { moveY: 290 });
    sameJson(paramsRowIds(panel), ['p3', 'p1', 'p2']);
    sameJson(sentBodies(panel), [{ type: 'REORDER_PARAMS_PRESETS', order: ['p3', 'p1', 'p2'] }]);
    panel.posted.length = 0;
    openParamsMenu(panel, 'p1');
    panel.click(paramsMenuItem(panel, 'p1', 'export'));
    sameJson(sentBodies(panel), [{ type: 'EXPORT_CURRENT_PRESET', presetId: 'p1' }]);
});

test('an INIT_DATA push redraws the list from the host order', (t) => {
    const panel = loadPanel(t);
    showParamsPresets(panel, { selected: 'p1' });
    panel.initData({ paramsPresets: [paramsPreset('p3', '预设三'), paramsPreset('p1', '预设一')], selectedParamsPresetId: 'p3' });
    sameJson(paramsRowIds(panel), ['p3', 'p1']);
    assert.equal(paramsRow(panel, 'p3').classList.contains('selected'), true);
    assert.equal(panel.$('#nd_positive').value, 'pos-p3');
});

test('narrow screens: the preset row wraps, the name keeps a minimum width, and the list scrolls inside the card', () => {
    const rule = selector => pageRule(PAGE_CSS, selector);
    assert.match(rule('.preset-row'), /display:\s*flex/);
    assert.match(rule('.preset-row'), /flex-wrap:\s*wrap/);
    assert.match(rule('.preset-row-name'), /min-width:\s*6em/);
    assert.match(rule('.preset-row-name'), /text-overflow:\s*ellipsis/);
    assert.match(rule('.preset-row .char-menu-wrap'), /margin-left:\s*auto/);
    assert.match(rule('.preset-row.selected'), /var\(--accent\)/);
    assert.match(rule('.preset-row.dragging'), /opacity/);
    assert.match(rule('.preset-list'), /max-height:\s*260px/);
    assert.match(rule('.preset-list'), /overflow-y:\s*auto/);
    assert.match(rule('.preset-list-header'), /flex-wrap:\s*wrap/);

    const media = PAGE_CSS.match(/@media\s*\(max-width:\s*768px\)\s*\{([\s\S]*?)\n\}/);
    assert.ok(media);
    const narrow = selector => pageRule(`\n${media[1]}`, selector);
    assert.match(narrow('.preset-list-card, .preset-list, .preset-row'), /min-width:\s*0/);
    assert.match(narrow('.preset-list-card, .preset-list, .preset-row'), /max-width:\s*100%/);
    assert.match(narrow('.preset-list-header .btn-group'), /flex-wrap:\s*wrap/);
    assert.ok(PAGE_CSS.indexOf('@media (max-width: 768px)') > PAGE_CSS.indexOf('.preset-row {'), '断点规则在基础规则之后');
    // 拖拽期间的光标 / 禁止选中与角色拖拽共用同一条规则
    assert.match(PAGE_CSS, /body\.sortable-dragging \*[^{]*\{[^}]*cursor:\s*grabbing/);
});

test('host source: delete and reorder work from ids the page sends', () => {
    const source = fs.readFileSync(new URL('../../providers/novelai/novel-draw.js', import.meta.url), 'utf8');
    const caseBody = (name) => {
        const start = source.indexOf(`case '${name}'`);
        assert.ok(start >= 0, name);
        return source.slice(start, source.indexOf("\n        case '", start + 1));
    };
    const del = caseBody('DEL_PARAMS_PRESET');
    assert.match(del, /data\.presetId/);
    assert.doesNotMatch(del, /findIndex\(p => p\.id === settings\.selectedParamsPresetId\)/, '不再按宿主记的选中项删除');
    assert.match(del, /pickNeighborAfterRemoval/);
    const reorder = caseBody('REORDER_PARAMS_PRESETS');
    assert.match(reorder, /reorderPresetsByIds/);
    assert.doesNotMatch(reorder, /sendInitData\(/, '只调顺序，不重发整份 INIT_DATA 冲掉表单');
    assert.match(caseBody('ADD_PARAMS_PRESET'), /data\.baseId/);
});

// ── 提示词预设：列表（点选 / “…”菜单 / 拖拽与键盘排序），和参数预设同一套视图 ─────────────

const promptPreset = (id, name, extra = {}) => ({ id, name, topSystem: `sys-${id}`, sceneRules: `rules-${id}`, modelGuideOverrides: {}, ...extra });
const threePrompts = () => [promptPreset('t1', '模板一'), promptPreset('t2', '模板二'), promptPreset('t3', '模板三')];

function showPromptPresets(panel, { selected = 't1', presets = threePrompts() } = {}) {
    selectModel(panel);
    panel.initData({
        paramsPresets: threePresets(),
        selectedParamsPresetId: 'p1',
        promptPresets: presets,
        selectedPromptPresetId: selected,
        modelGuideDefaults: { 'v4.5': 'GUIDE-DEFAULT' },
    });
    panel.posted.length = 0;
}

const promptRows = panel => panel.$$('#nd_prompt_list .preset-row');
const promptRowIds = panel => promptRows(panel).map(row => row.dataset.presetId);
const promptRow = (panel, id) => panel.$(`#nd_prompt_list .preset-row[data-preset-id="${id}"]`);
const promptRowName = (panel, id) => promptRow(panel, id).querySelector('.preset-row-name');
const promptHandle = (panel, id) => promptRow(panel, id).querySelector('[data-preset-drag]');
const promptMenuButton = (panel, id) => promptRow(panel, id).querySelector('[data-preset-action="menu"]');
const promptMenu = (panel, id) => promptRow(panel, id).querySelector('[role="menu"]');
const promptMenuIsOpen = (panel, id) => !promptMenu(panel, id).hasAttribute('hidden');
const promptMenuItem = (panel, id, action) => promptMenu(panel, id).querySelector(`[data-preset-action="${action}"]`);
const openPromptMenu = (panel, id) => { panel.click(promptMenuButton(panel, id)); return promptMenu(panel, id); };
const promptDragMarks = panel => panel.$$('#nd_prompt_list .dragging, #nd_prompt_list .drop-before, #nd_prompt_list .drop-after');
const lastExport = panel => JSON.parse(panel.blobs.at(-1));

// 在文本框里“打字”：改值并发 input 事件，页面会记下这个预设的未保存草稿。
function typeInto(panel, selector, value) {
    const node = panel.$(selector);
    node.value = value;
    node.dispatchEvent(new panel.document.defaultView.Event('input', { bubbles: true }));
}

function layoutPromptRows(panel) {
    let top = 0;
    for (const row of promptRows(panel)) {
        const rect = { top, bottom: top + 100, height: 100, left: 0, right: 300, width: 300 };
        row.getBoundingClientRect = () => rect;
        top += 100;
    }
    panel.document.elementFromPoint = () => panel.$('#nd_prompt_list');
}

function dragPromptPreset(panel, id, { startY = 10, moveY, endY = moveY }) {
    layoutPromptRows(panel);
    firePointer(panel, promptHandle(panel, id), 'pointerdown', { clientY: startY });
    firePointer(panel, panel.document, 'pointermove', { clientY: moveY });
    firePointer(panel, panel.document, 'pointerup', { clientY: endY });
}

test('the prompt preset bar is a list: one row per preset in host order, the selected one marked and its text in the boxes', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel, { selected: 't2' });
    sameJson(promptRowIds(panel), ['t1', 't2', 't3']);
    sameJson(promptRows(panel).map(row => row.querySelector('.preset-row-name').textContent), ['模板一', '模板二', '模板三']);
    sameJson(promptRows(panel).map(row => row.classList.contains('selected')), [false, true, false]);
    sameJson(promptRows(panel).map(row => row.querySelector('.preset-row-name').getAttribute('aria-current')), [null, 'true', null]);
    for (const row of promptRows(panel)) {
        const handle = row.querySelector('[data-preset-drag]');
        assert.equal(handle.classList.contains('char-drag-handle'), true, '复用角色列表的手柄样式');
        assert.equal(handle.getAttribute('role'), 'button');
        assert.equal(handle.getAttribute('tabindex'), '0');
        assert.match(handle.getAttribute('aria-label'), /拖动调整提示词预设/);
        assert.equal(row.querySelector('.preset-row-name').tagName, 'BUTTON');
        assert.equal(row.querySelector('[data-preset-action="menu"]').getAttribute('aria-haspopup'), 'menu');
    }
    assert.equal(panel.$('#nd_prompt_system').value, 'sys-t2');
    assert.equal(panel.$('#nd_prompt_format').value, 'rules-t2');
    assert.deepEqual(panel.errors, []);
});

test('the old prompt select and its buttons are gone; new / import / save sit in the card header above the list and status line', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel);
    for (const id of ['nd_prompt_preset', 'nd_prompt_rename', 'nd_prompt_preset_export', 'nd_prompt_del']) {
        assert.equal(panel.$(`#${id}`), null, id);
    }
    assert.equal(panel.$$('#view-prompts select#nd_prompt_preset').length, 0);
    const card = panel.$('#view-prompts .preset-list-card');
    assert.ok(card);
    const header = card.querySelector('.preset-list-header');
    assert.match(header.querySelector('.card-title').textContent, /提示词预设/);
    sameJson(Array.from(header.querySelectorAll('button, label, input')).map(node => node.id || node.tagName), ['nd_prompt_add', 'LABEL', 'nd_prompt_preset_import', 'nd_prompt_preset_save']);
    assert.equal(header.querySelector('#nd_prompt_preset_import').getAttribute('type'), 'file');
    assert.equal(header.querySelector('label').closest('.btn-group') !== null, true);
    assert.match(header.querySelector('label').textContent, /导入/);
    assert.equal(header.querySelector('#nd_prompt_preset_save').classList.contains('btn-primary'), true);
    // 列表与状态行在同一张卡片里，列表在状态行之前，并且用和参数预设相同的类
    const list = card.querySelector('#nd_prompt_list');
    assert.equal(list.classList.contains('preset-list'), true);
    assert.equal(list.getAttribute('role'), 'list');
    const status = card.querySelector('#nd_prompt_preset_status');
    assert.ok(status);
    assert.equal(Boolean(list.compareDocumentPosition(status) & 4), true, '状态行在列表之后');
    assert.deepEqual(panel.errors, []);
});

test('prompt preset names are escaped, and a missing selection falls back to the first row like the form does', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel, { selected: 'gone', presets: [promptPreset('t1', '<b>粗</b>"引号"'), promptPreset('t2', '模板二')] });
    assert.equal(promptRowName(panel, 't1').textContent, '<b>粗</b>"引号"');
    assert.equal(panel.$$('#nd_prompt_list b').length, 0);
    assert.equal(promptRow(panel, 't1').classList.contains('selected'), true);
    assert.equal(panel.$('#nd_prompt_system').value, 'sys-t1');
    assert.equal(panel.state().selectedPromptPresetId, 't1');
});

test('clicking a prompt row selects it: boxes are filled, the highlight moves, and the host is asked to persist the choice', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel, { selected: 't1' });
    panel.click(promptRowName(panel, 't3'));
    assert.equal(panel.state().selectedPromptPresetId, 't3');
    assert.equal(panel.$('#nd_prompt_system').value, 'sys-t3');
    assert.equal(panel.$('#nd_prompt_format').value, 'rules-t3');
    sameJson(promptRows(panel).map(row => row.classList.contains('selected')), [false, false, true]);
    assert.equal(promptRowName(panel, 't3').getAttribute('aria-current'), 'true');
    assert.equal(promptRowName(panel, 't1').hasAttribute('aria-current'), false);
    sameJson(sentTypes(panel), ['GET_PROMPT_CHAIN', 'SELECT_PROMPT_PRESET']);
    assert.equal(panel.posted[0].promptDraft.topSystem, 'sys-t3', '提示词预览按新预设的文本刷新');
    sameJson(sentBodies(panel).at(-1), { type: 'SELECT_PROMPT_PRESET', id: 't3' });
    assert.deepEqual(panel.errors, []);
});

test('clicking the row that is already selected does nothing: no message, and unsaved text stays', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel, { selected: 't1' });
    panel.$('#nd_prompt_system').value = 'typed but not saved';
    panel.click(promptRowName(panel, 't1'));
    assert.equal(panel.$('#nd_prompt_system').value, 'typed but not saved');
    assert.equal(panel.posted.length, 0);
});

test('unsaved text of each prompt preset survives switching rows back and forth', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel, { selected: 't1' });
    typeInto(panel, '#nd_prompt_system', 'draft for t1');
    panel.click(promptRowName(panel, 't2'));
    assert.equal(panel.$('#nd_prompt_system').value, 'sys-t2');
    panel.click(promptRowName(panel, 't1'));
    assert.equal(panel.$('#nd_prompt_system').value, 'draft for t1');
});

test('the more-actions menu of a prompt row offers rename, duplicate, export and a danger-styled delete', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel);
    const menu = promptMenu(panel, 't2');
    assert.equal(menu.hasAttribute('hidden'), true);
    const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
    sameJson(items.map(item => item.dataset.presetAction), ['rename', 'duplicate', 'export', 'delete']);
    sameJson(items.map(item => item.textContent.trim()), ['重命名', '复制', '导出', '删除']);
    assert.ok(items.every(item => item.tagName === 'BUTTON' && item.classList.contains('char-menu-item') && item.querySelector('i')));
    assert.equal(items[3].classList.contains('danger'), true);

    openPromptMenu(panel, 't2');
    assert.equal(promptMenuIsOpen(panel, 't2'), true);
    assert.equal(promptMenuButton(panel, 't2').getAttribute('aria-expanded'), 'true');
    openPromptMenu(panel, 't3'); // 同一时间只开一个
    assert.equal(promptMenuIsOpen(panel, 't2'), false);
    assert.equal(promptMenuIsOpen(panel, 't3'), true);
    const esc = new panel.document.defaultView.Event('keydown', { bubbles: true, cancelable: true });
    esc.key = 'Escape';
    panel.document.dispatchEvent(esc);
    assert.equal(promptMenuIsOpen(panel, 't3'), false, 'Esc 关闭');
    assert.equal(panel.posted.length, 0, '只开关菜单不发任何消息');
    assert.deepEqual(panel.errors, []);
});

test('the params list and the prompt list share the one-open-menu rule and do not touch each other', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel);
    openParamsMenu(panel, 'p2');
    assert.equal(paramsMenuIsOpen(panel, 'p2'), true);
    openPromptMenu(panel, 't1');
    assert.equal(paramsMenuIsOpen(panel, 'p2'), false);
    assert.equal(promptMenuIsOpen(panel, 't1'), true);
    panel.click(paramsRowName(panel, 'p3'));
    assert.equal(panel.state().selectedPromptPresetId, 't1');
    assert.equal(panel.state().selectedParamsPresetId, 'p3');
    assert.equal(promptMenuIsOpen(panel, 't1'), false, '点别处关闭菜单');
});

test('prompt rename acts on the row whose menu was used and posts RENAME_PROMPT_PRESET with the trimmed name', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel, { selected: 't1' });
    panel.answers.prompt.push('  新名字  ');
    openPromptMenu(panel, 't2');
    panel.click(promptMenuItem(panel, 't2', 'rename'));
    assert.equal(panel.dialogs.prompts.at(-1), '输入新名称：');
    sameJson(sentBodies(panel), [{ type: 'RENAME_PROMPT_PRESET', id: 't2', name: '新名字' }]);
    assert.equal(panel.state().selectedPromptPresetId, 't1', '选中项不因为给别的行改名而变');
    assert.equal(promptMenuIsOpen(panel, 't2'), false);

    panel.posted.length = 0;
    panel.answers.prompt.push(null); // 取消
    panel.click(promptMenuItem(panel, 't3', 'rename'));
    panel.answers.prompt.push('   '); // 空白
    panel.click(promptMenuItem(panel, 't3', 'rename'));
    assert.equal(panel.posted.length, 0);

    // 宿主改名后推来 INIT_DATA，列表随之重绘
    panel.initData({ promptPresets: [promptPreset('t1', '模板一'), promptPreset('t2', '新名字'), promptPreset('t3', '模板三')], selectedPromptPresetId: 't1' });
    assert.equal(promptRowName(panel, 't2').textContent, '新名字');
});

test('prompt duplicate asks the host for a copy of that row, named "<name> 副本"', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel, { selected: 't1' });
    openPromptMenu(panel, 't3');
    panel.click(promptMenuItem(panel, 't3', 'duplicate'));
    sameJson(sentBodies(panel), [{ type: 'ADD_PROMPT_PRESET', sourcePresetId: 't3', name: '模板三 副本' }]);
    assert.equal(promptMenuIsOpen(panel, 't3'), false);
});

test('the header new button is based on the row currently selected', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel, { selected: 't1' });
    panel.click(promptRowName(panel, 't2'));
    panel.posted.length = 0;
    panel.click(panel.$('#nd_prompt_add'));
    sameJson(sentBodies(panel), [{ type: 'ADD_PROMPT_PRESET', sourcePresetId: 't2' }]);
});

test('prompt delete asks for confirmation naming the row and sends the id of the row you clicked, not the selected one', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel, { selected: 't1' });
    openPromptMenu(panel, 't3');
    panel.click(promptMenuItem(panel, 't3', 'delete'));
    assert.match(panel.dialogs.confirms.at(-1), /确定删除提示词预设“模板三”/);
    sameJson(sentBodies(panel), [{ type: 'DEL_PROMPT_PRESET', id: 't3' }]);
});

test('declining the prompt delete confirmation sends nothing and keeps the list', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel);
    panel.answers.confirm.push(false);
    openPromptMenu(panel, 't2');
    panel.click(promptMenuItem(panel, 't2', 'delete'));
    assert.equal(panel.dialogs.confirms.length, 1);
    assert.equal(panel.posted.length, 0);
    sameJson(promptRowIds(panel), ['t1', 't2', 't3']);
});

test('prompt export downloads the row you clicked: the selected one with its unsaved text, another one with its saved text plus its own draft', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel, {
        selected: 't1',
        presets: [promptPreset('t1', '模板一'), promptPreset('t2', '模板二'), promptPreset('t3', '模板三', { modelGuideOverrides: { v5: 'custom v5' } })],
    });
    // t2 留一份未保存草稿，再回到 t1 继续编辑（t1 的编辑不发 input 事件也要被导出，因为它就在表单里）
    panel.click(promptRowName(panel, 't2'));
    typeInto(panel, '#nd_prompt_system', 'draft for t2');
    panel.click(promptRowName(panel, 't1'));
    panel.$('#nd_prompt_system').value = 'unsaved t1';
    panel.$('#nd_prompt_guide').value = 'my guide';
    panel.posted.length = 0;

    openPromptMenu(panel, 't3');
    panel.click(promptMenuItem(panel, 't3', 'export'));
    sameJson(lastExport(panel), { _type: 'novel-draw-prompt-template', _version: 3, name: '模板三', topSystem: 'sys-t3', sceneRules: 'rules-t3', modelGuideOverrides: { v5: 'custom v5' } });
    assert.equal(panel.$('#nd_prompt_system').value, 'unsaved t1', '导出别的行不碰当前表单');

    panel.click(promptMenuItem(panel, 't2', 'export'));
    sameJson(lastExport(panel), { _type: 'novel-draw-prompt-template', _version: 3, name: '模板二', topSystem: 'draft for t2', sceneRules: 'rules-t2', modelGuideOverrides: {} });

    panel.click(promptMenuItem(panel, 't1', 'export'));
    sameJson(lastExport(panel), { _type: 'novel-draw-prompt-template', _version: 3, name: '模板一', topSystem: 'unsaved t1', sceneRules: 'rules-t1', modelGuideOverrides: { 'v4.5': 'my guide' } });
    assert.equal(panel.blobs.length, 3);
    assert.equal(panel.posted.length, 0, '导出完全在页面里完成，不发消息');
    assert.deepEqual(panel.errors, []);
});

test('the header save button keeps its behaviour: saving state, current form text and the prompt-preset status target', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel, { selected: 't1' });
    panel.click(promptRowName(panel, 't2'));
    panel.posted.length = 0;
    panel.$('#nd_prompt_system').value = 'edited then saved';
    panel.click(panel.$('#nd_prompt_preset_save'));
    const save = panel.posted.find(item => item.type === 'SAVE_PROMPT_PRESET');
    assert.equal(save.selectedPromptPresetId, 't2');
    assert.equal(save.promptDraft.topSystem, 'edited then saved');
    assert.equal(save.promptDraft.sceneRules, 'rules-t2');
    assert.equal(save.statusTarget, 'prompt-preset');
    assert.equal(panel.$('#nd_prompt_preset_save').classList.contains('saving'), true);
});

test('importing a template file still posts IMPORT_PROMPT_PRESET, named after the file for the fallback', async (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel);
    const input = panel.$('#nd_prompt_preset_import');
    const payload = { _type: 'novel-draw-prompt-template', topSystem: 'imported' };
    Object.defineProperty(input, 'files', { configurable: true, value: [{ name: '我的模板.json', text: async () => JSON.stringify(payload) }] });
    input.dispatchEvent(new panel.document.defaultView.Event('change', { bubbles: true }));
    await tick();
    // 等待期间 vm 里失败的动态 import 会让页面补发 FRAME_READY，与导入无关
    sameJson(sentBodies(panel).filter(message => message.type !== 'FRAME_READY'), [{ type: 'IMPORT_PROMPT_PRESET', payload, fallbackName: '我的模板' }]);
});

test('the prompt status line still receives the host prompt-preset status', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel);
    panel.send('STATUS', { target: 'prompt-preset', state: 'success', text: '已重命名' });
    assert.equal(panel.$('#nd_prompt_preset_status').textContent, '已重命名');
    assert.match(panel.$('#nd_prompt_preset_status').className, /success/);
    assert.equal(panel.$('#nd_params_status').textContent, '', '参数预设的状态行不受影响');
});

test('dragging a prompt row reorders list and state at once, sends only the new id order, and leaves the boxes alone', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel, { selected: 't1' });
    panel.$('#nd_prompt_system').value = 'typed but not saved'; // 不发 input 事件：若被重填，值会退回 sys-t1
    panel.$('#nd_prompt_format').value = 'rules typed but not saved';
    dragPromptPreset(panel, 't1', { moveY: 290 });
    sameJson(promptRowIds(panel), ['t2', 't3', 't1']);
    sameJson(panel.state().promptPresets.map(item => item.id), ['t2', 't3', 't1']);
    assert.equal(panel.state().selectedPromptPresetId, 't1', '选中项跟着走');
    assert.equal(promptRow(panel, 't1').classList.contains('selected'), true);
    sameJson(sentBodies(panel), [{ type: 'REORDER_PROMPT_PRESETS', order: ['t2', 't3', 't1'] }]);
    assert.equal(panel.$('#nd_prompt_system').value, 'typed but not saved', '重排不重填文本框');
    assert.equal(panel.$('#nd_prompt_format').value, 'rules typed but not saved');
    assert.equal(promptDragMarks(panel).length, 0);
    assert.deepEqual(panel.errors, []);
});

test('dragging another prompt row than the selected one leaves the selection and the boxes alone', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel, { selected: 't2' });
    panel.$('#nd_prompt_system').value = 'typed but not saved';
    dragPromptPreset(panel, 't3', { startY: 250, moveY: 10 });
    sameJson(promptRowIds(panel), ['t3', 't1', 't2']);
    assert.equal(panel.state().selectedPromptPresetId, 't2');
    assert.equal(panel.$('#nd_prompt_system').value, 'typed but not saved');
    sameJson(sentTypes(panel), ['REORDER_PROMPT_PRESETS']);
});

test('dropping a prompt row where it started, or pressing Esc mid-drag, sends nothing and changes nothing', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel);
    layoutPromptRows(panel);
    firePointer(panel, promptHandle(panel, 't1'), 'pointerdown', { clientY: 10 });
    assert.equal(promptRow(panel, 't1').classList.contains('dragging'), true);
    firePointer(panel, panel.document, 'pointermove', { clientY: 160 });
    assert.equal(promptRow(panel, 't3').classList.contains('drop-before'), true);
    firePointer(panel, panel.document, 'pointermove', { clientY: 60 });
    firePointer(panel, panel.document, 'pointerup', { clientY: 60 });
    sameJson(promptRowIds(panel), ['t1', 't2', 't3']);
    assert.equal(panel.posted.length, 0);

    firePointer(panel, promptHandle(panel, 't1'), 'pointerdown', { clientY: 10 });
    firePointer(panel, panel.document, 'pointermove', { clientY: 290 });
    const esc = new panel.document.defaultView.Event('keydown', { bubbles: true, cancelable: true });
    esc.key = 'Escape';
    panel.document.dispatchEvent(esc);
    firePointer(panel, panel.document, 'pointerup', { clientY: 290 });
    sameJson(promptRowIds(panel), ['t1', 't2', 't3']);
    assert.equal(panel.posted.length, 0);
    assert.equal(promptDragMarks(panel).length, 0);
});

test('keyboard: arrow keys on a prompt handle move the preset one step, keep the boxes, and stop at both ends', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel, { selected: 't1' });
    const focused = [];
    const proto = Object.getPrototypeOf(promptHandle(panel, 't1'));
    proto.focus = function focus() { focused.push(this.dataset.presetDrag); };
    t.after(() => { delete proto.focus; });
    panel.$('#nd_prompt_system').value = 'typed but not saved';

    const down = pressKey(panel, promptHandle(panel, 't1'), 'ArrowDown');
    assert.equal(down.defaultPrevented, true);
    sameJson(promptRowIds(panel), ['t2', 't1', 't3']);
    sameJson(panel.state().promptPresets.map(item => item.id), ['t2', 't1', 't3']);
    sameJson(sentBodies(panel), [{ type: 'REORDER_PROMPT_PRESETS', order: ['t2', 't1', 't3'] }]);
    sameJson(focused, ['t1']);
    assert.equal(panel.$('#nd_prompt_system').value, 'typed but not saved');
    assert.equal(panel.posted.some(item => item.type === 'SAVE_PROMPT_PRESET'), false, '不把整份预设内容送回宿主');

    pressKey(panel, promptHandle(panel, 't1'), 'ArrowUp');
    sameJson(promptRowIds(panel), ['t1', 't2', 't3']);
    panel.posted.length = 0;
    pressKey(panel, promptHandle(panel, 't1'), 'ArrowUp'); // 已在最前
    pressKey(panel, promptHandle(panel, 't3'), 'ArrowDown'); // 已在最后
    assert.equal(panel.posted.length, 0, '边界处什么也不发');
    assert.equal(pressKey(panel, promptHandle(panel, 't2'), 'a').defaultPrevented, false);
    assert.deepEqual(panel.errors, []);
});

test('after a prompt reorder the rows are rebuilt but still draggable and still act on their own ids', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel);
    dragPromptPreset(panel, 't1', { moveY: 290 });
    panel.posted.length = 0;
    dragPromptPreset(panel, 't2', { moveY: 290 });
    sameJson(promptRowIds(panel), ['t3', 't1', 't2']);
    sameJson(sentBodies(panel), [{ type: 'REORDER_PROMPT_PRESETS', order: ['t3', 't1', 't2'] }]);
    panel.posted.length = 0;
    openPromptMenu(panel, 't1');
    panel.click(promptMenuItem(panel, 't1', 'delete'));
    sameJson(sentBodies(panel), [{ type: 'DEL_PROMPT_PRESET', id: 't1' }]);
});

test('an INIT_DATA push redraws the prompt list from the host order and selection', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel, { selected: 't1' });
    panel.initData({ promptPresets: [promptPreset('t3', '模板三'), promptPreset('t1', '模板一')], selectedPromptPresetId: 't3' });
    sameJson(promptRowIds(panel), ['t3', 't1']);
    assert.equal(promptRow(panel, 't3').classList.contains('selected'), true);
    assert.equal(panel.$('#nd_prompt_system').value, 'sys-t3');
});

test('the prompt list reuses the params list classes (scrolling list, wrapping rows, same card)', (t) => {
    const panel = loadPanel(t);
    showPromptPresets(panel);
    assert.equal(panel.$('#nd_prompt_list').className, 'preset-list');
    assert.equal(promptRow(panel, 't1').classList.contains('preset-row'), true);
    assert.equal(panel.$('#view-prompts .preset-list-card').classList.contains('card'), true);
    assert.match(pageRule(PAGE_CSS, '.preset-list'), /max-height:\s*260px/);
});

test('host source: prompt reorder persists ids only, delete picks the neighbour, duplicate takes a name', () => {
    const source = fs.readFileSync(new URL('../../providers/novelai/novel-draw.js', import.meta.url), 'utf8');
    const caseBody = (name) => {
        const start = source.indexOf(`case '${name}'`);
        assert.ok(start >= 0, name);
        return source.slice(start, source.indexOf("\n        case '", start + 1));
    };
    const reorder = caseBody('REORDER_PROMPT_PRESETS');
    assert.match(reorder, /reorderPresetsByIds\(settings\.promptPresets/);
    assert.doesNotMatch(reorder, /sendInitData\(/, '只调顺序，不重发整份 INIT_DATA 冲掉文本框');
    assert.doesNotMatch(reorder, /selectedPromptPresetId/, '排序不动选中项');
    const del = caseBody('DEL_PROMPT_PRESET');
    assert.match(del, /data\.id/);
    assert.match(del, /pickNeighborAfterRemoval\(ids, presetId\)/);
    assert.doesNotMatch(del, /promptPresets\[0\]\?\.id/, '不再总是跳回第一个');
    assert.match(del, /wasSelected/, '删的不是选中项时保持选中');
    const add = caseBody('ADD_PROMPT_PRESET');
    assert.match(add, /data\.sourcePresetId/);
    assert.match(add, /data\.name/);
    assert.match(caseBody('RENAME_PROMPT_PRESET'), /data\.id/);
});

// ── 提示词预设：消息布局（共享编辑器接进设置页）─────────────────────────────
// 编辑器本身的行为在 prompt-layout-editor.test.js；这里只验证页面接线：草稿、保存、导出、切换预设、跳转。
// 没有真浏览器：焦点 / 滚动 / 拖拽几何都是 linkedom 里的手写替身。

const LAYOUT_BLOCK_IDS = ['opening', 'frame', 'guide', 'rules', 'tools', 'worldInfo', 'content', 'limits'];

function showLayout(panel, { supported = true, selected = 't1', presets = threePrompts() } = {}) {
    selectModel(panel);
    panel.initData({
        paramsPresets: threePresets(),
        selectedParamsPresetId: 'p1',
        promptPresets: presets,
        selectedPromptPresetId: selected,
        modelGuideDefaults: { 'v4.5': 'GUIDE-DEFAULT' },
        ...(supported ? { promptLayoutSupported: true } : {}),
    });
    panel.posted.length = 0;
}

const layoutRowNodes = panel => panel.$$('#nd_prompt_layout .lwb-ple-row');
const layoutIds = panel => layoutRowNodes(panel).map(row => row.getAttribute('data-block-id'));
const layoutRowOf = (panel, id) => layoutRowNodes(panel).find(row => row.getAttribute('data-block-id') === id);
const layoutFieldOf = (panel, id, field) => Array.from(layoutRowOf(panel, id).querySelectorAll('[data-ple-field]')).find(node => node.getAttribute('data-ple-field') === field);
const layoutAddMessage = panel => panel.click(panel.$('#nd_prompt_layout [data-ple-add]'));
const layoutResetButton = panel => panel.$('#nd_prompt_layout [data-ple-reset]');
const layoutDirtyShown = panel => !panel.$('#nd_prompt_layout [data-ple-dirty]').hasAttribute('hidden');
const layoutCustomIds = panel => layoutIds(panel).filter(id => !LAYOUT_BLOCK_IDS.includes(id));
const layoutDrafts = panel => panel.nd.layoutDraftsByPreset;
const savePayload = (panel, buttonId = 'nd_prompt_preset_save') => {
    panel.posted.length = 0;
    panel.click(panel.$(`#${buttonId}`));
    return panel.posted.find(item => item.type === 'SAVE_PROMPT_PRESET');
};

// 与编辑器测试同款：一条自定义块 + 把 opening 往后挪一格，保证"偏离默认"。
function storedLayout() {
    const block = createCustomBlock({ role: 'system', name: '补充', content: '额外要求' }, [], () => 0.25);
    return moveBlock(addBlock(createDefaultLayout(), block), 'opening', 1);
}

// linkedom 的 focus() 是空操作也没有 activeElement：换成"记录并设置 activeElement"。
function trackFocus(t, panel) {
    const focused = [];
    let proto = Object.getPrototypeOf(panel.$('#nd_prompt_layout'));
    while (proto && !Object.prototype.hasOwnProperty.call(proto, 'focus')) proto = Object.getPrototypeOf(proto);
    const original = proto.focus;
    proto.focus = function focus() {
        focused.push(this.id || this.getAttribute('data-ple-drag') || this.getAttribute('data-ple-field') || this.tagName);
        Object.defineProperty(panel.document, 'activeElement', { configurable: true, value: this });
    };
    t.after(() => { proto.focus = original; });
    return focused;
}

function layoutLayoutRows(panel) {
    let top = 0;
    for (const row of layoutRowNodes(panel)) {
        const rect = { top, bottom: top + 100, height: 100, left: 0, right: 300, width: 300 };
        row.getBoundingClientRect = () => rect;
        top += 100;
    }
    panel.document.elementFromPoint = () => panel.$('#nd_prompt_layout .lwb-ple-list');
}

test('the layout card sits between the preset list and the text cards, shows eight locked blocks in contract order, and says honestly that the structure preview is still the default one', (t) => {
    const panel = loadPanel(t);
    showLayout(panel);
    const card = panel.$('#nd_prompt_layout_card');
    assert.equal(card.classList.contains('card'), true);
    const listCard = panel.$('#view-prompts .preset-list-card');
    const firstTextCard = panel.$('#nd_prompt_system').closest('.card');
    assert.equal(Boolean(listCard.compareDocumentPosition(card) & 4), true, '在提示词预设卡片之后');
    assert.equal(Boolean(card.compareDocumentPosition(firstTextCard) & 4), true, '在三个文本卡片之前');
    sameJson(layoutIds(panel), LAYOUT_BLOCK_IDS);
    assert.equal(layoutRowNodes(panel).every(row => row.getAttribute('data-builtin') === 'true' && row.querySelector('.lwb-ple-lock')), true);
    assert.equal(layoutRowOf(panel, 'guide').querySelector('.lwb-ple-label').textContent, '模型TAG指南');
    assert.match(layoutRowOf(panel, 'opening').querySelector('[data-ple-summary]').textContent, /sys-t1/);
    assert.match(layoutRowOf(panel, 'rules').querySelector('[data-ple-summary]').textContent, /rules-t1/);
    sameJson(LAYOUT_BLOCK_IDS.map(id => layoutFieldOf(panel, id, 'edit').textContent), ['去编辑', '查看', '去编辑', '去编辑', '查看', '去编辑', '去编辑', '去编辑']);
    assert.match(card.querySelector('#nd_prompt_layout_note').textContent, /请求结构.*默认结构/);
    assert.equal(layoutDirtyShown(panel), false);
    assert.match(fs.readFileSync(PAGE, 'utf8'), /<link rel="stylesheet" href="\.\.\/\.\.\/shared\/prompt-layout-editor\.css">/);
    assert.deepEqual(panel.errors, []);
});

test('built-in summaries come from the page state: limits from the current params preset, content from the characters, world info from the switch', (t) => {
    const panel = loadPanel(t);
    selectModel(panel);
    panel.initData({
        paramsPresets: [paramsPreset('p1', '预设一', { maxImages: 3, maxCharactersPerImage: 0 })],
        selectedParamsPresetId: 'p1',
        promptPresets: threePrompts(),
        selectedPromptPresetId: 't1',
        promptLayoutSupported: true,
        useWorldInfo: true,
        characterTags: [person('c1', '阿璃'), person('c2', '小猫', { enabled: false })],
    });
    const summary = id => layoutRowOf(panel, id).querySelector('[data-ple-summary]').textContent;
    assert.match(summary('limits'), /最多 3 张图.*不限/);
    assert.match(summary('content'), /共 2 个角色，启用 1 个/);
    assert.match(summary('worldInfo'), /已开启/);
    assert.match(summary('tools'), /submit_scene_plan/);
});

test('without the host flag the editor is disabled with a refresh hint and saves carry no layout key', (t) => {
    const panel = loadPanel(t);
    showLayout(panel, { supported: false });
    assert.equal(layoutRowNodes(panel).length, 0);
    const notice = panel.$('#nd_prompt_layout [data-ple-notice]');
    assert.equal(notice.hasAttribute('hidden'), false);
    assert.match(notice.textContent, /刷新/);
    assert.equal(panel.$('#nd_prompt_layout [data-ple-add]').hasAttribute('disabled'), true);
    assert.equal('layout' in savePayload(panel).promptDraft, false, '键缺席 = 宿主不动已存的布局');
    assert.equal('layout' in savePayload(panel, 'nd_prompts_save').promptDraft, false);
    // 宿主升级后推来带标记的数据，编辑器随之可用
    panel.initData({ promptLayoutSupported: true });
    assert.equal(layoutRowNodes(panel).length, 8);
    assert.equal(panel.$('#nd_prompt_layout [data-ple-notice]').hasAttribute('hidden'), true);
});

test('if the editor module fails to load nothing breaks: no editor, no layout key on save, and the saved layout still goes into an export', (t) => {
    const panel = loadPanel(t);
    panel.nd.setPLE(null);
    const layout = storedLayout();
    showLayout(panel, { presets: [promptPreset('t1', '模板一', { layout }), promptPreset('t2', '模板二')] });
    assert.equal(layoutRowNodes(panel).length, 0);
    assert.equal('layout' in savePayload(panel).promptDraft, false);
    openPromptMenu(panel, 't1');
    panel.click(promptMenuItem(panel, 't1', 'export'));
    const exported = lastExport(panel);
    assert.equal(exported._version, 4);
    sameJson(exported.layout, layout);
    assert.deepEqual(panel.errors, []);
});

test('adding a message only changes the local draft: the badge shows 未保存, the saved preset is untouched and the host hears nothing', (t) => {
    const panel = loadPanel(t);
    showLayout(panel);
    layoutAddMessage(panel);
    assert.equal(layoutRowNodes(panel).length, 9);
    assert.equal(layoutCustomIds(panel).length, 1);
    assert.equal(layoutDirtyShown(panel), true);
    assert.equal(layoutDrafts(panel).size, 1);
    assert.equal(panel.state().promptPresets[0].layout, undefined);
    assert.equal(panel.posted.length, 0);
    assert.equal(layoutResetButton(panel).hasAttribute('disabled'), false);
});

test('keyboard and drag reordering both end up in the draft that the next save sends', (t) => {
    const panel = loadPanel(t);
    showLayout(panel);
    const focused = trackFocus(t, panel);
    pressKey(panel, layoutFieldOf(panel, 'opening', 'handle'), 'ArrowDown');
    sameJson(layoutIds(panel).slice(0, 2), ['frame', 'opening']);
    assert.equal(focused.at(-1), 'opening', '焦点留在被移动那一行的手柄');
    assert.match(panel.$('#nd_prompt_layout [data-ple-status]').textContent, /已移到第 2 位/);
    assert.equal(layoutDirtyShown(panel), true);

    layoutLayoutRows(panel);
    firePointer(panel, layoutFieldOf(panel, 'limits', 'handle'), 'pointerdown', { clientY: 750 });
    firePointer(panel, panel.document, 'pointermove', { clientY: 10 });
    firePointer(panel, panel.document, 'pointerup', { clientY: 10 });
    assert.equal(layoutIds(panel)[0], 'limits');

    const save = savePayload(panel);
    sameJson(save.promptDraft.layout.blocks.map(block => block.id), ['limits', 'frame', 'opening', 'guide', 'rules', 'tools', 'worldInfo', 'content']);
    assert.equal(save.promptDraft.layout.version, 1);
});

test('typing in a custom message never re-renders: same nodes, focus kept, no host traffic, and the text reaches the save payload', (t) => {
    const panel = loadPanel(t);
    showLayout(panel);
    trackFocus(t, panel);
    layoutAddMessage(panel);
    const [id] = layoutCustomIds(panel);
    const row = layoutRowOf(panel, id);
    const textarea = layoutFieldOf(panel, id, 'content');
    const nameInput = layoutFieldOf(panel, id, 'name');
    Object.defineProperty(panel.document, 'activeElement', { configurable: true, value: textarea });
    panel.posted.length = 0;

    textarea.value = '请保持画面简洁';
    textarea.dispatchEvent(new panel.document.defaultView.Event('input', { bubbles: true }));
    nameInput.value = '风格提示';
    nameInput.dispatchEvent(new panel.document.defaultView.Event('input', { bubbles: true }));
    const select = layoutFieldOf(panel, id, 'role');
    chooseOption(select, 'assistant');
    select.dispatchEvent(new panel.document.defaultView.Event('change', { bubbles: true }));

    assert.equal(layoutRowOf(panel, id), row);
    assert.equal(layoutFieldOf(panel, id, 'content'), textarea);
    assert.equal(panel.document.activeElement, textarea, '焦点还在文本框');
    assert.equal(textarea.value, '请保持画面简洁');
    assert.equal(row.querySelector('[data-ple-title]').textContent, '风格提示');
    assert.equal(panel.posted.length, 0, '输入不触发任何宿主消息');
    const block = savePayload(panel).promptDraft.layout.blocks.find(item => item.id === id);
    sameJson(block, { id, role: 'assistant', name: '风格提示', content: '请保持画面简洁', enabled: true });
});

test('typing in the three prompt boxes refreshes the built-in summaries in place', (t) => {
    const panel = loadPanel(t);
    showLayout(panel);
    const openingRow = layoutRowOf(panel, 'opening');
    typeInto(panel, '#nd_prompt_system', '全新的开场白');
    typeInto(panel, '#nd_prompt_format', '全新的规则');
    typeInto(panel, '#nd_prompt_guide', '全新的指南');
    assert.equal(layoutRowOf(panel, 'opening'), openingRow, '没有重建');
    assert.match(openingRow.querySelector('[data-ple-summary]').textContent, /全新的开场白（共 6 字）/);
    assert.match(layoutRowOf(panel, 'rules').querySelector('[data-ple-summary]').textContent, /全新的规则/);
    assert.match(layoutRowOf(panel, 'guide').querySelector('[data-ple-summary]').textContent, /全新的指南/);
    typeInto(panel, '#nd_prompt_system', '   ');
    assert.match(openingRow.querySelector('[data-ple-summary]').textContent, /当前为空/);
});

test('both save buttons send layout: null for a default layout, the object for a changed one, and the saved object when nothing was touched', (t) => {
    const panel = loadPanel(t);
    showLayout(panel);
    assert.equal(savePayload(panel).promptDraft.layout, null);
    assert.equal(savePayload(panel, 'nd_prompts_save').promptDraft.layout, null);

    layoutAddMessage(panel);
    for (const buttonId of ['nd_prompt_preset_save', 'nd_prompts_save']) {
        const save = savePayload(panel, buttonId);
        assert.equal(save.promptDraft.layout.blocks.length, 9, buttonId);
        assert.equal(save.statusTarget, buttonId === 'nd_prompts_save' ? 'prompts' : 'prompt-preset');
    }

    const saved = storedLayout();
    const second = loadPanel(t);
    showLayout(second, { presets: [promptPreset('t1', '模板一', { layout: saved }), promptPreset('t2', '模板二')] });
    sameJson(savePayload(second).promptDraft.layout, saved);
    assert.equal(layoutDirtyShown(second), false);
});

test('after the host pushes the saved layout back, the draft and the badge disappear; a push that still lacks it (failed save) keeps them', (t) => {
    const panel = loadPanel(t);
    showLayout(panel);
    layoutAddMessage(panel);
    const sent = savePayload(panel).promptDraft.layout;
    assert.equal(layoutDrafts(panel).size, 1);

    // 保存失败：宿主回推的仍是旧数据 -> 草稿保留
    panel.initData({ promptPresets: threePrompts(), selectedPromptPresetId: 't1', promptLayoutSupported: true });
    assert.equal(layoutDrafts(panel).size, 1);
    assert.equal(layoutDirtyShown(panel), true);
    assert.equal(layoutRowNodes(panel).length, 9);

    // 保存成功：回推的预设带着同一份布局 -> 草稿丢弃、徽标消失，列表内容不变
    panel.initData({ promptPresets: [promptPreset('t1', '模板一', { layout: sent }), promptPreset('t2', '模板二'), promptPreset('t3', '模板三')], selectedPromptPresetId: 't1', promptLayoutSupported: true });
    assert.equal(layoutDrafts(panel).size, 0);
    assert.equal(layoutDirtyShown(panel), false);
    assert.equal(layoutRowNodes(panel).length, 9);
});

test('an unrelated INIT_DATA push does not rebuild the layout list while the user is typing in a message', (t) => {
    const panel = loadPanel(t);
    showLayout(panel);
    layoutAddMessage(panel);
    const [id] = layoutCustomIds(panel);
    const textarea = layoutFieldOf(panel, id, 'content');
    textarea.value = 'typing';
    textarea.dispatchEvent(new panel.document.defaultView.Event('input', { bubbles: true }));
    panel.initData({ autoLearnCharacters: true });
    assert.equal(layoutFieldOf(panel, id, 'content'), textarea, '同一个文本框，输入法 / 焦点不受影响');
    assert.equal(textarea.value, 'typing');
});

test('drafts of presets that vanished from the host are dropped', (t) => {
    const panel = loadPanel(t);
    showLayout(panel);
    layoutAddMessage(panel);
    assert.equal(layoutDrafts(panel).has('t1'), true);
    panel.initData({ promptPresets: [promptPreset('t2', '模板二'), promptPreset('t3', '模板三')], selectedPromptPresetId: 't2', promptLayoutSupported: true });
    assert.equal(layoutDrafts(panel).size, 0);
    assert.equal(layoutRowNodes(panel).length, 8);
});

test('switching presets swaps the layout shown, keeps each preset draft, and collapses expanded messages', (t) => {
    const panel = loadPanel(t);
    showLayout(panel, { presets: [promptPreset('t1', '模板一'), promptPreset('t2', '模板二', { layout: storedLayout() }), promptPreset('t3', '模板三')] });
    layoutAddMessage(panel);
    assert.equal(layoutRowNodes(panel).length, 9);
    const [draftId] = layoutCustomIds(panel);
    assert.ok(layoutFieldOf(panel, draftId, 'content'), '新增的块是展开的');

    panel.click(promptRowName(panel, 't2'));
    assert.equal(layoutRowNodes(panel).length, 9, 't2 有自己已保存的布局');
    assert.equal(layoutIds(panel)[0], 'frame', 't2 的布局把 opening 往后挪了');
    assert.equal(layoutDirtyShown(panel), false);
    assert.equal(layoutCustomIds(panel).includes(draftId), false);

    panel.click(promptRowName(panel, 't3'));
    sameJson(layoutIds(panel), LAYOUT_BLOCK_IDS);

    panel.click(promptRowName(panel, 't1'));
    assert.equal(layoutDirtyShown(panel), true, '回到 t1：草稿还在');
    assert.deepEqual(layoutCustomIds(panel), [draftId]);
    assert.equal(layoutFieldOf(panel, draftId, 'content'), undefined, '切换预设后展开项已收起');
    assert.deepEqual(panel.errors, []);
});

test('reset structure: asks before dropping custom messages, declining changes nothing, accepting returns to default (draft only)', (t) => {
    const panel = loadPanel(t);
    showLayout(panel);
    trackFocus(t, panel);
    layoutAddMessage(panel);
    layoutAddMessage(panel);
    panel.answers.confirm.push(false);
    panel.click(layoutResetButton(panel));
    assert.match(panel.dialogs.confirms.at(-1), /2 条自定义消息/);
    assert.equal(layoutCustomIds(panel).length, 2);

    panel.posted.length = 0;
    panel.click(layoutResetButton(panel)); // 默认应答 = 确认
    sameJson(layoutIds(panel), LAYOUT_BLOCK_IDS);
    assert.equal(layoutDrafts(panel).size, 0, '与已保存的默认布局一致，草稿直接丢弃');
    assert.equal(layoutDirtyShown(panel), false);
    assert.equal(panel.posted.length, 0, '只改草稿，不发消息');
});

test('resetting a preset that has a saved custom layout leaves an unsaved default draft, which saves as null', (t) => {
    const panel = loadPanel(t);
    showLayout(panel, { presets: [promptPreset('t1', '模板一', { layout: storedLayout() })] });
    assert.equal(layoutRowNodes(panel).length, 9);
    panel.click(layoutResetButton(panel));
    sameJson(layoutIds(panel), LAYOUT_BLOCK_IDS);
    assert.equal(layoutDirtyShown(panel), true, '相对已保存的是改动');
    assert.equal(savePayload(panel).promptDraft.layout, null);
});

test('"全部恢复默认" also resets the layout draft and its confirm text mentions the structure', (t) => {
    const panel = loadPanel(t);
    showLayout(panel);
    panel.state()._defaultPrompts = { topSystem: 'DEFAULT-TOP', sceneRules: 'DEFAULT-RULES' };
    layoutAddMessage(panel);
    panel.click(panel.$('#nd_prompts_reset_all'));
    assert.match(panel.dialogs.confirms.at(-1), /消息布局/);
    sameJson(layoutIds(panel), LAYOUT_BLOCK_IDS);
    assert.equal(layoutDrafts(panel).size, 0);
    assert.equal(panel.$('#nd_prompt_system').value, 'DEFAULT-TOP');
    assert.equal(savePayload(panel).promptDraft.layout, null);

    // 取消确认：什么都不变
    layoutAddMessage(panel);
    panel.answers.confirm.push(false);
    panel.click(panel.$('#nd_prompts_reset_all'));
    assert.equal(layoutRowNodes(panel).length, 9);
});

test('去编辑 / 查看 jump to where each built-in block is edited', (t) => {
    const panel = loadPanel(t);
    showLayout(panel);
    const focused = trackFocus(t, panel);
    const scrolled = [];
    for (const id of ['nd_prompt_system', 'nd_prompt_guide', 'nd_prompt_format', 'nd_max_images']) {
        panel.$(`#${id}`).scrollIntoView = () => scrolled.push(id);
    }
    const jump = (blockId) => panel.click(layoutFieldOf(panel, blockId, 'edit'));

    jump('opening');
    jump('guide');
    jump('rules');
    sameJson(focused, ['nd_prompt_system', 'nd_prompt_guide', 'nd_prompt_format']);
    sameJson(scrolled, ['nd_prompt_system', 'nd_prompt_guide', 'nd_prompt_format']);

    jump('worldInfo');
    assert.equal(panel.$('#view-worldbook').classList.contains('active'), true);
    jump('content');
    assert.equal(panel.$('#view-characters').classList.contains('active'), true);
    focused.length = 0;
    jump('limits');
    assert.equal(panel.$('#view-params').classList.contains('active'), true);
    sameJson(focused, ['nd_max_images']);

    const details = panel.$('#nd_prompt_chain_details');
    assert.notEqual(details.open, true);
    jump('frame');
    assert.equal(details.open, true, '“请求结构”展开');
    details.open = false;
    jump('tools');
    assert.equal(details.open, true);
    assert.equal(panel.posted.some(item => item.type === 'SAVE_PROMPT_PRESET'), false, '跳转不保存任何东西');
    assert.deepEqual(panel.errors, []);
});

test('export: a default layout is a V3 file without layout; a changed layout (draft or saved) is a V4 file with it, and the version matches the shared helper', (t) => {
    const panel = loadPanel(t);
    showLayout(panel, { presets: [promptPreset('t1', '模板一'), promptPreset('t2', '模板二', { layout: storedLayout() }), promptPreset('t3', '模板三')] });
    const exportRow = (id) => { openPromptMenu(panel, id); panel.click(promptMenuItem(panel, id, 'export')); return lastExport(panel); };

    const plain = exportRow('t1');
    assert.equal(plain._version, 3);
    assert.equal('layout' in plain, false);
    assert.equal(plain._version, promptTemplateExportVersion(createDefaultLayout()));

    const saved = exportRow('t2');
    assert.equal(saved._version, 4);
    sameJson(saved.layout, storedLayout());
    assert.equal(saved._version, promptTemplateExportVersion(saved.layout));

    layoutAddMessage(panel); // 给当前选中的 t1 加一条草稿
    const drafted = exportRow('t1');
    assert.equal(drafted._version, 4);
    assert.equal(drafted.layout.blocks.length, 9);
    assert.equal(drafted._version, promptTemplateExportVersion(drafted.layout));

    // 另一个预设的草稿也算：切到 t3 加一条，再回 t1 导出 t3
    panel.click(promptRowName(panel, 't3'));
    layoutAddMessage(panel);
    panel.click(promptRowName(panel, 't1'));
    assert.equal(exportRow('t3').layout.blocks.length, 9);
    assert.equal(panel.posted.some(item => item.type === 'SAVE_PROMPT_PRESET'), false);
});

test('an exported V4 file imports back to the same layout, and the host strips the repair notes from the preset it stores', (t) => {
    const panel = loadPanel(t);
    showLayout(panel, { presets: [promptPreset('t1', '模板一', { layout: storedLayout() })] });
    openPromptMenu(panel, 't1');
    panel.click(promptMenuItem(panel, 't1', 'export'));
    const exported = lastExport(panel);
    const imported = parseNovelPromptPresetImport(exported);
    sameJson(imported.layout, storedLayout());
    assert.equal('layoutNotes' in imported, false);

    const source = fs.readFileSync(new URL('../../providers/novelai/novel-draw.js', import.meta.url), 'utf8');
    const caseBody = (name) => {
        const start = source.indexOf(`case '${name}'`);
        assert.ok(start >= 0, name);
        return source.slice(start, source.indexOf("\n        case '", start + 1));
    };
    const importCase = caseBody('IMPORT_PROMPT_PRESET');
    assert.match(importCase, /const \{ layoutNotes = \[\], \.\.\.presetFields \} = imported/);
    assert.match(importCase, /\.\.\.presetFields/);
    assert.doesNotMatch(importCase, /\.\.\.imported/, '修复说明不进存储');
    assert.match(importCase, /layoutNotes\.join/, '修复说明出现在完成消息里');
});

test('host source: layout is kept by normalizeSettings, copied by duplicate, saved by SAVE_PROMPT_PRESET, and advertised in INIT_DATA', () => {
    const source = fs.readFileSync(new URL('../../providers/novelai/novel-draw.js', import.meta.url), 'utf8');
    const caseBody = (name) => {
        const start = source.indexOf(`case '${name}'`);
        assert.ok(start >= 0, name);
        return source.slice(start, source.indexOf("\n        case '", start + 1));
    };
    assert.match(source, /import \{ layoutForStorage \} from "\.\.\/\.\.\/shared\/scene-planner-layout\.js";/);
    const rebuild = source.slice(source.indexOf('merged.promptPresets = merged.promptPresets.map('), source.indexOf('// ── 消息过滤规则规范化'));
    assert.match(rebuild, /layoutForStorage\(preset\.layout\)/);
    assert.match(rebuild, /if \(layout\) normalized\.layout = layout/, '默认 / 缺省布局不写字段');

    const add = caseBody('ADD_PROMPT_PRESET');
    assert.match(add, /layoutForStorage\(current\?\.layout\)/);
    assert.match(add, /newPreset\.layout = layout/);

    const save = caseBody('SAVE_PROMPT_PRESET');
    assert.match(save, /'layout' in cp/);
    assert.match(save, /cp\.layout === null[\s\S]*delete current\.layout/, 'null = 删除已存布局');
    assert.match(save, /layoutForStorage\(cp\.layout\)/);
    assert.match(save, /sendInitData\(\)/, '照旧回推 INIT_DATA');

    assert.match(source, /promptLayoutSupported: true/);
    assert.doesNotMatch(source, /CONFIG_VERSION\s*=\s*\d+[\s\S]{0,0}layout/, '不动配置版本');
});
