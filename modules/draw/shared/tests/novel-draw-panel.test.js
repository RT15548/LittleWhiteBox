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
        sameJson(actions, ['collapse', 'toggle-enabled', 'add', 'rename', 'delete']); // toggle-enabled 是分组自己的开关
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
