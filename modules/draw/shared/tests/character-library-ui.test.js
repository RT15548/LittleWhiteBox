import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';

import {
    GROUP_COLLAPSE_STORAGE_KEY,
    createCharacterLibraryUi,
    resolveDragIds,
    resolveInsertion,
} from '../character-library-ui.js';
import { createCharacterEnabledControl, getCharacterEnabledFromCard } from '../character-enabled-control.js';
import { CHARACTER_EXPORT_TYPE } from '../character-library.js';

// ── 测试夹具：用与 SD / ComfyUI 面板相同的卡片结构，验证共享模块与卡片约定 ──

function char(id, name, extra = {}) {
    return { id, enabled: true, name, aliases: [], type: 'girl', appearance: `${name} look`, negativeTags: '', danbooruTag: '', outfits: [], dynamicStates: [], ...extra };
}

function field(document, name, value, multiline = false) {
    const input = document.createElement(multiline ? 'textarea' : 'input');
    input.setAttribute('data-sd-char-field', name);
    if (multiline) input.textContent = value;
    else input.value = value;
    return input;
}

function makeRenderCard(document) {
    return ({ character, ordinal }) => {
        const card = document.createElement('div');
        card.className = 'sd-char-card';
        card.dataset.characterId = String(character.id);
        const header = document.createElement('div');
        header.className = 'sd-char-card-header';
        const title = document.createElement('div');
        title.className = 'sd-char-card-title';
        const span = document.createElement('span');
        span.textContent = `角色 ${ordinal}`;
        title.appendChild(span);
        const actions = document.createElement('div');
        actions.className = 'btn-group';
        actions.appendChild(createCharacterEnabledControl(document, card, { enabled: character.enabled !== false }));
        const del = document.createElement('button');
        del.setAttribute('data-sd-char-delete', character.id);
        del.textContent = '删除';
        actions.appendChild(del);
        header.append(title, actions);
        card.appendChild(header);
        card.appendChild(field(document, 'name', character.name || ''));
        card.appendChild(field(document, 'appearance', character.appearance || '', true));
        return card;
    };
}

function readCardCharacters(document) {
    return ({ keepEmpty = false } = {}) => Array.from(document.querySelectorAll('.sd-char-card'))
        .map(card => ({
            id: card.dataset.characterId,
            enabled: getCharacterEnabledFromCard(card),
            name: card.querySelector('[data-sd-char-field="name"]').value.trim(),
            aliases: [],
            type: 'girl',
            appearance: card.querySelector('[data-sd-char-field="appearance"]').value.trim(),
            negativeTags: '',
            danbooruTag: '',
            outfits: [],
            dynamicStates: [],
        }))
        .filter(item => keepEmpty || item.name || item.appearance);
}

function memoryStorage(initial = {}) {
    const data = { ...initial };
    return {
        data,
        getItem: key => (key in data ? data[key] : null),
        setItem: (key, value) => { data[key] = String(value); },
    };
}

function mount({ library, storage = memoryStorage(), confirms = [], prompts = [], getStorage, rects = new Map(), hitRef = { node: null } } = {}) {
    const { document, window } = parseHTML('<!doctype html><html><body><div id="toolbar"></div><div id="list"></div></body></html>');
    const log = { success: [], warning: [], error: [], downloads: [], changes: [], confirmMessages: [] };
    const confirmQueue = [...confirms];
    const promptQueue = [...prompts];
    const ui = createCharacterLibraryUi({
        document,
        listElement: document.getElementById('list'),
        toolbarElement: document.getElementById('toolbar'),
        readCharacters: readCardCharacters(document),
        renderCard: makeRenderCard(document),
        renderEmpty: () => {
            const empty = document.createElement('div');
            empty.className = 'char-empty sd-char-empty';
            empty.textContent = '暂无角色配置';
            return empty;
        },
        onChange: change => log.changes.push(change.count),
        notify: {
            success: message => log.success.push(message),
            warning: message => log.warning.push(message),
            error: message => log.error.push(message),
        },
        confirm: (message) => { log.confirmMessages.push(message); return confirmQueue.length ? confirmQueue.shift() : true; },
        prompt: () => (promptQueue.length ? promptQueue.shift() : null),
        getStorage: getStorage || (() => storage),
        makeId: prefix => `${prefix}-t${Math.random().toString(36).slice(2, 8)}`,
        hitTest: () => hitRef.node,
        getRect: element => rects.get(element) || { top: 0, bottom: 0 },
        download: (fileName, data) => log.downloads.push({ fileName, data }),
    });
    if (library) ui.render(library);
    const fire = (node, type, init = {}) => {
        const event = new window.Event(type, { bubbles: true, cancelable: true });
        Object.assign(event, init);
        node.dispatchEvent(event);
        return event;
    };
    const click = node => fire(node, 'click');
    const $ = selector => document.querySelector(selector);
    const $$ = selector => Array.from(document.querySelectorAll(selector));
    const cardOf = id => $$('.sd-char-card').find(card => card.dataset.characterId === id);
    const sectionOf = id => $$('.lwb-cl-group').find(section => section.dataset.groupId === id);
    const groupButton = (groupId, action) => sectionOf(groupId).querySelector(`[data-lwb-group-action="${action}"]`);
    const batch = action => click($(`[data-batch="${action}"]`));
    const select = (...ids) => ids.forEach((id) => {
        const box = cardOf(id).querySelector('.lwb-cl-select');
        box.checked = true;
        fire(box, 'change');
    });
    const idsInGroup = groupId => Array.from(sectionOf(groupId).querySelectorAll('.sd-char-card')).map(card => card.dataset.characterId);
    const allIds = () => $$('.sd-char-card').map(card => card.dataset.characterId);
    const type = (id, name, value) => {
        const input = cardOf(id).querySelector(`[data-sd-char-field="${name}"]`);
        if (input.tagName === 'TEXTAREA') input.textContent = value;
        input.value = value;
    };
    return { document, window, ui, log, storage, fire, click, $, $$, cardOf, sectionOf, groupButton, batch, select, idsInGroup, allIds, type, rects, hitRef };
}

function sampleLibrary() {
    return {
        groups: [{ id: 'g1', name: '主线' }, { id: 'g2', name: '宠物' }],
        characters: [
            char('c1', '阿璃'),
            char('c2', '芙蕾雅', { groupId: 'g1' }),
            char('c3', '路人甲', { groupId: 'g1', enabled: false }),
            char('c4', '小猫', { groupId: 'g2' }),
        ],
    };
}

// ── 纯函数 ────────────────────────────────────────────

test('resolveInsertion picks the insertion point by pointer position and ignores dragged items', () => {
    const items = [
        { id: 'a', top: 0, bottom: 100 },
        { id: 'b', top: 112, bottom: 212 },
        { id: 'c', top: 224, bottom: 324 },
    ];
    assert.deepEqual(resolveInsertion(items, 10), { position: 'before', refId: 'a' });
    assert.deepEqual(resolveInsertion(items, 60), { position: 'before', refId: 'b' });
    // 两张卡片之间的空隙：落在下一张之前
    assert.deepEqual(resolveInsertion(items, 106), { position: 'before', refId: 'b' });
    assert.deepEqual(resolveInsertion(items, 300), { position: 'after', refId: 'c' });
    assert.deepEqual(resolveInsertion(items, 999), { position: 'after', refId: 'c' });
    // 悬停在被拖动的卡片自己身上：按其余卡片计算
    assert.deepEqual(resolveInsertion(items, 150, ['b']), { position: 'before', refId: 'c' });
    assert.deepEqual(resolveInsertion(items, 300, ['c']), { position: 'after', refId: 'b' });
    // 容器里只有被拖动的卡片，或根本没有卡片
    assert.deepEqual(resolveInsertion(items, 50, ['a', 'b', 'c']), { position: 'into', refId: '' });
    assert.deepEqual(resolveInsertion([], 50), { position: 'into', refId: '' });
});

test('resolveDragIds moves the whole selection only when dragging a selected item in select mode', () => {
    assert.deepEqual(resolveDragIds({ kind: 'char', id: 'b', selectMode: true, selectedIds: ['a', 'b'] }).sort(), ['a', 'b']);
    assert.deepEqual(resolveDragIds({ kind: 'char', id: 'c', selectMode: true, selectedIds: ['a', 'b'] }), ['c']);
    assert.deepEqual(resolveDragIds({ kind: 'char', id: 'b', selectMode: false, selectedIds: ['a', 'b'] }), ['b']);
    assert.deepEqual(resolveDragIds({ kind: 'char', id: 'b', selectMode: true, selectedIds: ['b'] }), ['b']);
    assert.deepEqual(resolveDragIds({ kind: 'group', id: 'g1', selectMode: true, selectedIds: ['a', 'b'] }), ['g1']);
});

// ── 渲染 ──────────────────────────────────────────────

test('without groups the list stays flat and an empty library shows the placeholder', () => {
    const empty = mount({ library: { characters: [], groups: [] } });
    assert.equal(empty.$('.sd-char-empty').textContent, '暂无角色配置');
    assert.equal(empty.ui.getCardCount(), 0);

    const flat = mount({ library: { characters: [char('c1', '阿璃'), char('c2', '芙蕾雅')], groups: [] } });
    assert.equal(flat.$$('.lwb-cl-group').length, 0);
    assert.deepEqual(flat.allIds(), ['c1', 'c2']);
    assert.equal(flat.$$('.sd-char-card')[1].querySelector('.sd-char-card-title > span:last-child').textContent, '角色 2');
    // 没有分组时不出现“所属分组”下拉，但有拖拽手柄与复制按钮
    assert.equal(flat.$('.lwb-cl-card-group'), null);
    assert.ok(flat.cardOf('c1').querySelector('[data-drag-char="c1"]'));
    const duplicateButton = flat.cardOf('c1').querySelector('[data-lwb-card-action="duplicate"]');
    const actions = flat.cardOf('c1').querySelector('.btn-group');
    assert.equal(duplicateButton.nextElementSibling.hasAttribute('data-sd-char-delete'), true, '复制按钮在删除按钮之前');
    assert.ok(actions.contains(duplicateButton));
});

test('groups render ungrouped first, then groups in order, with counts and card ordinals following display order', () => {
    const view = mount({ library: sampleLibrary() });
    const sections = view.$$('.lwb-cl-group');
    assert.deepEqual(sections.map(section => section.dataset.groupId), ['', 'g1', 'g2']);
    assert.equal(sections[0].querySelector('.lwb-cl-group-name').textContent, '未分组');
    // 计数只写“自己开着数/总数”，完整含义在 title 里（窄栏里要把位置让给分组名）
    assert.equal(sections[1].querySelector('[data-role="group-count"]').textContent, '1/2');
    assert.equal(sections[1].querySelector('[data-role="group-count"]').getAttribute('title'), '组内自己开着的角色 1 个，共 2 个');
    assert.equal(sections[1].querySelector('.lwb-cl-group-name').getAttribute('title'), '主线');
    assert.deepEqual(view.idsInGroup('g1'), ['c2', 'c3']);
    assert.deepEqual(view.$$('.sd-char-card').map(card => card.querySelector('.sd-char-card-title > span:last-child').textContent), ['角色 1', '角色 2', '角色 3', '角色 4']);
    // 未分组与分组都有“在本组添加”，只有真实分组有重命名 / 删除 / 拖拽手柄
    assert.ok(view.groupButton('', 'add'));
    assert.equal(view.groupButton('', 'rename'), null);
    assert.equal(sections[0].querySelector('[data-drag-group]'), null);
    assert.ok(sections[1].querySelector('[data-drag-group="g1"]'));
    assert.ok(view.groupButton('g1', 'rename'));
    assert.ok(view.groupButton('g1', 'delete'));
    // 每张卡片带“所属分组”下拉，并选中当前分组
    const picker = view.cardOf('c4').querySelector('.lwb-cl-card-group');
    assert.equal(picker.querySelectorAll('option').length, 3);
    assert.equal(Array.from(picker.querySelectorAll('option')).find(option => option.selected).value, 'g2');
    // 未分组为空时不渲染未分组区
    const noLoose = mount({ library: { groups: [{ id: 'g1', name: '主线' }], characters: [char('c2', '芙蕾雅', { groupId: 'g1' })] } });
    assert.deepEqual(noLoose.$$('.lwb-cl-group').map(section => section.dataset.groupId), ['g1']);
});

test('user text is never interpreted as HTML', () => {
    const evil = '<img src=x onerror="globalThis.__pwned=1"><b>x</b>';
    const view = mount({
        library: {
            groups: [{ id: 'g1', name: evil }],
            characters: [char('c1', evil, { groupId: 'g1' }), char('c2', 'safe')],
        },
    });
    assert.equal(view.$$('img').length, 0);
    assert.equal(view.$$('b').length, 0);
    assert.equal(view.sectionOf('g1').querySelector('.lwb-cl-group-name').textContent, evil);
    assert.equal(view.groupButton('g1', 'rename').getAttribute('aria-label').includes(evil), true);
    assert.equal(view.cardOf('c1').querySelector('[data-drag-char]').getAttribute('aria-label'), `拖动排序 ${evil}`);
    assert.equal(view.cardOf('c1').querySelector('.lwb-cl-card-group option[value="g1"]').textContent, evil);
    // 批量栏的目标分组下拉同样走 textContent
    assert.equal(view.$('[data-role="batch-target"] option[value="g1"]').textContent, evil);
    assert.equal(globalThis.__pwned, undefined);
});

// ── 折叠 ──────────────────────────────────────────────

test('collapsing is DOM-only, keeps unsaved edits in every card and persists through localStorage', () => {
    const storage = memoryStorage();
    const view = mount({ library: sampleLibrary(), storage });
    view.type('c2', 'name', '改过的名字');
    const nameInput = view.cardOf('c2').querySelector('[data-sd-char-field="name"]');

    view.click(view.groupButton('g1', 'collapse'));
    const section = view.sectionOf('g1');
    assert.equal(section.classList.contains('collapsed'), true);
    assert.equal(section.querySelector('.lwb-cl-group-body').hasAttribute('hidden'), true);
    assert.equal(view.groupButton('g1', 'collapse').getAttribute('aria-expanded'), 'false');
    assert.deepEqual(JSON.parse(storage.data[GROUP_COLLAPSE_STORAGE_KEY]), { g1: true });
    // 没有重绘：同一个输入框，值还在，折叠的卡片仍参与草稿读取
    assert.equal(view.cardOf('c2').querySelector('[data-sd-char-field="name"]'), nameInput);
    assert.equal(view.ui.getLibrary().characters.find(item => item.id === 'c2').name, '改过的名字');

    // 之后的重绘沿用折叠状态
    view.ui.rerender();
    assert.equal(view.sectionOf('g1').classList.contains('collapsed'), true);
    assert.equal(view.ui.getLibrary().characters.find(item => item.id === 'c2').name, '改过的名字');

    view.click(view.groupButton('g1', 'collapse'));
    assert.equal(view.sectionOf('g1').classList.contains('collapsed'), false);
    assert.deepEqual(JSON.parse(storage.data[GROUP_COLLAPSE_STORAGE_KEY]), { g1: false });

    // 未分组区同样可折叠，使用独立的键
    view.click(view.groupButton('', 'collapse'));
    assert.equal(JSON.parse(storage.data[GROUP_COLLAPSE_STORAGE_KEY]).__ungrouped__, true);
});

test('initial collapsed state is read from storage and storage failures are ignored', () => {
    const stored = mount({
        library: sampleLibrary(),
        storage: memoryStorage({ [GROUP_COLLAPSE_STORAGE_KEY]: JSON.stringify({ g2: true }) }),
    });
    assert.equal(stored.sectionOf('g2').classList.contains('collapsed'), true);
    assert.equal(stored.sectionOf('g1').classList.contains('collapsed'), false);

    const broken = mount({
        library: sampleLibrary(),
        getStorage: () => { throw new Error('denied'); },
    });
    assert.equal(broken.$$('.lwb-cl-group').length, 3);
    broken.click(broken.groupButton('g1', 'collapse'));
    assert.equal(broken.sectionOf('g1').classList.contains('collapsed'), true);

    const garbage = mount({
        library: sampleLibrary(),
        storage: { getItem: () => '{not json', setItem: () => { throw new Error('quota'); } },
    });
    assert.equal(garbage.sectionOf('g1').classList.contains('collapsed'), false);
    garbage.click(garbage.groupButton('g1', 'collapse'));
    assert.equal(garbage.sectionOf('g1').classList.contains('collapsed'), true);
});

// ── 分组计数跟随卡片自己的开关 ──────────────────────────

test('the group count tracks per-card toggles without redrawing and ignores the group switch', () => {
    const view = mount({ library: sampleLibrary() });
    const count = id => view.sectionOf(id).querySelector('[data-role="group-count"]');
    assert.equal(count('g1').textContent, '1/2');
    const checkbox = view.cardOf('c3').querySelector('[data-character-enabled-control]');
    const sameCard = view.cardOf('c3');
    checkbox.checked = true;
    view.fire(checkbox, 'change');
    assert.equal(view.cardOf('c3'), sameCard);
    assert.equal(count('g1').textContent, '2/2');
    assert.equal(count('g1').getAttribute('title'), '组内自己开着的角色 2 个，共 2 个');
    // 手动取消勾选：计数回落；其他分组不受影响；分组开关始终没动
    checkbox.checked = false;
    view.fire(checkbox, 'change');
    assert.equal(count('g1').textContent, '1/2');
    assert.equal(count('g2').textContent, '1/1');
    assert.equal(view.groupButton('g1', 'toggle-enabled').getAttribute('aria-pressed'), 'true');
    // 关闭分组不改计数
    view.click(view.groupButton('g1', 'toggle-enabled'));
    assert.equal(count('g1').textContent, '1/2');
});

// ── 分组开关（两态，嵌套启用）──────────────────────────────

test('group switch is a two-state toggle: clicking it flips only the group, never a character, and keeps unsaved edits', () => {
    const view = mount({ library: sampleLibrary() });
    const toggle = id => view.groupButton(id, 'toggle-enabled');
    assert.equal(toggle('g1').getAttribute('aria-pressed'), 'true');
    assert.equal(toggle('g1').classList.contains('active'), true);
    assert.equal(toggle('g1').getAttribute('title'), '关闭分组：组内角色不再参与出图，各角色自己的开关保持不变');
    assert.match(toggle('g1').getAttribute('aria-label'), /关闭分组.*主线/);
    assert.equal(toggle('g1').hasAttribute('data-state'), false, '不再有三态 data-state');
    assert.equal(view.groupButton('', 'toggle-enabled'), null, '未分组没有开关');

    view.type('c2', 'name', '改过的名字（未保存）');
    const ownBefore = view.ui.getLibrary().characters.map(item => [item.id, item.enabled]);
    const sameCard = view.cardOf('c2');
    view.click(toggle('g1'));
    assert.equal(toggle('g1').getAttribute('aria-pressed'), 'false');
    assert.equal(toggle('g1').classList.contains('active'), false);
    assert.equal(toggle('g1').getAttribute('title'), '开启分组：组内角色按各自的开关参与出图');
    assert.deepEqual(view.ui.getLibrary().characters.map(item => [item.id, item.enabled]), ownBefore, '角色自己的 enabled 一个都没变');
    assert.deepEqual(view.ui.getLibrary().groups.find(group => group.id === 'g1'), { id: 'g1', name: '主线', enabled: false });
    assert.deepEqual(view.ui.getGroups().find(group => group.id === 'g1'), { id: 'g1', name: '主线', enabled: false }, '保存通道拿到的分组带 enabled:false');
    assert.equal(view.ui.getLibrary().characters.find(item => item.id === 'c2').name, '改过的名字（未保存）', '重绘不丢草稿');
    assert.notEqual(view.cardOf('c2'), sameCard, '切换分组会重绘（与旧行为一致）');
    // 其他分组不受影响
    assert.equal(toggle('g2').getAttribute('aria-pressed'), 'true');
    assert.equal(view.ui.getGroups().find(group => group.id === 'g2').enabled, undefined);

    // 再点一次恢复：组内 c2 仍开、c3 仍关，分组上不留 enabled 键
    view.click(toggle('g1'));
    assert.equal(toggle('g1').getAttribute('aria-pressed'), 'true');
    assert.deepEqual(view.ui.getGroups().find(group => group.id === 'g1'), { id: 'g1', name: '主线' });
    assert.deepEqual(view.ui.getLibrary().characters.map(item => [item.id, item.enabled]), ownBefore);
    assert.equal(view.log.error.length, 0);
});

test('a closed group looks closed, labels its cards and still lets each character toggle itself', () => {
    const library = sampleLibrary();
    library.groups[0] = { ...library.groups[0], enabled: false };
    const view = mount({ library });
    const noteOf = id => view.cardOf(id).querySelector('.lwb-cl-group-off-note');
    assert.equal(view.sectionOf('g1').classList.contains('lwb-cl-group-disabled'), true);
    assert.equal(view.sectionOf('g2').classList.contains('lwb-cl-group-disabled'), false);
    assert.equal(view.sectionOf('').classList.contains('lwb-cl-group-disabled'), false);
    assert.equal(noteOf('c2').textContent, '分组已关闭');
    assert.equal(noteOf('c3').textContent, '分组已关闭', '自己也关着的角色同样提示分组已关闭');
    assert.match(noteOf('c2').getAttribute('title'), /不参与出图/);
    assert.equal(noteOf('c1'), null);
    assert.equal(noteOf('c4'), null);
    assert.equal(view.groupButton('g1', 'toggle-enabled').getAttribute('aria-pressed'), 'false');

    // 计数仍是“自己开着数/总数”，分组关闭只体现在 title 里
    const count = () => view.sectionOf('g1').querySelector('[data-role="group-count"]');
    assert.equal(count().textContent, '1/2');
    assert.equal(count().getAttribute('title'), '组内自己开着的角色 1 个，共 2 个；分组已关闭，组内角色当前都不参与出图');

    // 角色自己的启用复选框仍可点：不重绘，只刷新计数，分组保持关闭
    const checkbox = view.cardOf('c3').querySelector('[data-character-enabled-control]');
    const sameCard = view.cardOf('c3');
    checkbox.checked = true;
    view.fire(checkbox, 'change');
    assert.equal(view.cardOf('c3'), sameCard);
    assert.equal(count().textContent, '2/2');
    assert.equal(view.sectionOf('g1').classList.contains('lwb-cl-group-disabled'), true);
    assert.equal(view.groupButton('g1', 'toggle-enabled').getAttribute('aria-pressed'), 'false');
    assert.equal(view.ui.getLibrary().characters.find(item => item.id === 'c3').enabled, true);

    // 展开 / 折叠、选择模式、拖拽手柄在关闭的分组里照常存在
    view.click(view.groupButton('g1', 'collapse'));
    assert.equal(view.sectionOf('g1').classList.contains('collapsed'), true);
    assert.equal(view.sectionOf('g1').classList.contains('lwb-cl-group-disabled'), true);
    assert.ok(view.sectionOf('g1').querySelector('[data-drag-group="g1"]'));

    // 开启后提示消失
    view.click(view.groupButton('g1', 'toggle-enabled'));
    assert.equal(view.sectionOf('g1').classList.contains('lwb-cl-group-disabled'), false);
    assert.equal(noteOf('c2'), null);
    assert.equal(view.ui.getGroups().find(group => group.id === 'g1').enabled, undefined);
});

test('the note text is set with textContent and group switch state survives rename, move, delete of another group and batch enable', () => {
    const library = sampleLibrary();
    library.groups[0] = { ...library.groups[0], enabled: false };
    const view = mount({ library, prompts: ['改名后'] });
    view.click(view.groupButton('g1', 'rename'));
    assert.deepEqual(view.ui.getGroups()[0], { id: 'g1', name: '改名后', enabled: false });
    view.fire(view.sectionOf('g2').querySelector('[data-drag-group]'), 'keydown', { key: 'ArrowUp' });
    assert.deepEqual(view.ui.getGroups().map(group => [group.id, group.enabled]), [['g2', undefined], ['g1', false]]);
    // 批量启用 / 停用是角色级：不碰分组开关
    view.ui.render(view.ui.getLibrary());
    view.click(view.$('[data-role="select-toggle"]'));
    view.select('c2', 'c3');
    view.batch('enable');
    assert.deepEqual(view.ui.getLibrary().characters.filter(item => ['c2', 'c3'].includes(item.id)).map(item => item.enabled), [true, true]);
    assert.equal(view.ui.getGroups().find(group => group.id === 'g1').enabled, false);
    view.batch('disable');
    assert.deepEqual(view.ui.getLibrary().characters.filter(item => ['c2', 'c3'].includes(item.id)).map(item => item.enabled), [false, false]);
    assert.equal(view.ui.getGroups().find(group => group.id === 'g1').enabled, false);
    // 删除另一个分组
    view.click(view.groupButton('g2', 'delete'));
    assert.deepEqual(view.ui.getGroups(), [{ id: 'g1', name: '改名后', enabled: false }]);
});

test('exporting from the draft never writes the group switch into the file', () => {
    const library = sampleLibrary();
    library.groups[0] = { ...library.groups[0], enabled: false };
    const view = mount({ library });
    view.click(view.$('[data-role="select-toggle"]'));
    view.select('c2', 'c4');
    view.batch('export');
    const file = view.log.downloads.at(-1).data;
    assert.ok(file.groups.length >= 1);
    assert.equal(JSON.stringify(file.groups).includes('enabled'), false);
});

test('the shared UI no longer carries tri-state code or styles', () => {
    const source = readFileSync(new URL('../character-library-ui.js', import.meta.url), 'utf8');
    assert.doesNotMatch(source, /getGroupEnabledState|fa-square-minus|data-state|'partial'|lwb-cl-enabled-toggle/);
    assert.doesNotMatch(UI_CSS, /\.partial|lwb-cl-enabled-toggle/);
    assert.match(cssRule(UI_CSS, '.lwb-cl-group-disabled'), /border-style:\s*dashed/);
    assert.match(UI_CSS, /\.lwb-cl-group-disabled \.lwb-cl-group-body > \.sd-char-card\s*\{[^}]*opacity/);
    assert.match(cssRule(UI_CSS, '.lwb-cl-group-off-note'), /white-space:\s*nowrap/);
});

// ── 草稿保护 ──────────────────────────────────────────

test('library operations keep unsaved edits, blank new cards and the original array order', () => {
    // 数组顺序：c1(g2) 在 c2(g1) 之前。展示顺序是 g1 在前，但读回来的数组顺序必须不变。
    const view = mount({
        library: {
            groups: [{ id: 'g1', name: '主线' }, { id: 'g2', name: '宠物' }],
            characters: [char('c1', '小猫', { groupId: 'g2' }), char('c2', '芙蕾雅', { groupId: 'g1' }), char('c3', '阿璃')],
        },
        prompts: ['改名后', '新分组'],
    });
    assert.deepEqual(view.ui.getLibrary().characters.map(item => item.id), ['c1', 'c2', 'c3'], '未改动时读回的顺序与载入时一致');

    // 先制造几处未保存的改动：改字段、关掉启用开关、新增一张空白卡
    view.type('c1', 'name', '小猫（已编辑）');
    view.type('c3', 'appearance', 'silver hair, edited');
    const toggleBox = view.cardOf('c2').querySelector('[data-character-enabled-control]');
    toggleBox.checked = false;
    view.fire(toggleBox, 'change');
    const blankId = view.ui.addCharacter({ groupId: 'g1' });
    assert.ok(blankId);

    // 再做一串库操作：重命名、上移分组（手柄 ↑）、新建分组、批量启用
    view.click(view.groupButton('g1', 'rename'));
    view.fire(view.sectionOf('g2').querySelector('[data-drag-group]'), 'keydown', { key: 'ArrowUp' });
    view.click(view.$('[data-role="group-add"]'));
    view.click(view.groupButton('g2', 'toggle-enabled')); // 切换分组开关：不动任何角色

    const library = view.ui.getLibrary();
    assert.deepEqual(library.groups.map(group => group.name), ['宠物', '改名后', '新分组']);
    assert.deepEqual(library.groups.map(group => group.enabled), [false, undefined, undefined], '宠物组被切换为关闭');
    assert.equal(library.characters.find(item => item.id === 'c1').name, '小猫（已编辑）');
    assert.equal(library.characters.find(item => item.id === 'c3').appearance, 'silver hair, edited');
    assert.equal(library.characters.find(item => item.id === 'c2').enabled, false);
    assert.equal(library.characters.find(item => item.id === blankId).groupId, 'g1', '空白新卡片仍在原分组');
    // 数组顺序：原有三项保持相对顺序，新卡片排在其所属分组的末尾
    assert.deepEqual(
        library.characters.filter(item => item.id !== blankId).map(item => item.id),
        ['c1', 'c2', 'c3'],
    );
    // 保存用的读取会丢弃全空的新卡片，库操作用的读取不会
    assert.equal(view.ui.getCharacters().some(item => item.id === blankId), false);
    assert.equal(view.ui.getCharacters({ keepEmpty: true }).some(item => item.id === blankId), true);
    assert.deepEqual(view.log.error, []);
});

test('moving a character through the card group picker keeps edits in other cards', () => {
    const view = mount({ library: sampleLibrary() });
    view.type('c1', 'name', '阿璃（改）');
    view.type('c4', 'appearance', 'edited cat');
    const picker = view.cardOf('c1').querySelector('.lwb-cl-card-group');
    Array.from(picker.querySelectorAll('option')).find(option => option.value === 'g2').selected = true;
    view.fire(picker, 'change');
    assert.deepEqual(view.idsInGroup('g2'), ['c4', 'c1']);
    assert.equal(view.cardOf('c1').querySelector('[data-sd-char-field="name"]').value, '阿璃（改）');
    assert.equal(view.cardOf('c4').querySelector('[data-sd-char-field="appearance"]').value, 'edited cat');
    // 回到未分组
    const back = view.cardOf('c1').querySelector('.lwb-cl-card-group');
    Array.from(back.querySelectorAll('option')).find(option => option.value === '').selected = true;
    view.fire(back, 'change');
    assert.equal(view.ui.getLibrary().characters.find(item => item.id === 'c1').groupId, undefined);
});

test('the saved record cannot leak a stale groupId back into the draft', () => {
    // 表单读取器可能带着“已保存记录”里的旧 groupId；草稿以卡片所在位置为准
    const view = mount({ library: sampleLibrary() });
    const original = view.ui.getLibrary();
    assert.equal(original.characters.find(item => item.id === 'c2').groupId, 'g1');
    const { document } = view;
    const list = document.getElementById('list');
    const staleReader = createCharacterLibraryUi({
        document,
        listElement: list,
        toolbarElement: document.createElement('div'),
        readCharacters: opts => readCardCharacters(document)(opts).map(item => ({ ...item, groupId: 'g2' })),
        renderCard: makeRenderCard(document),
        renderEmpty: () => document.createElement('div'),
        getStorage: () => memoryStorage(),
    });
    staleReader.render(sampleLibrary());
    assert.equal(staleReader.getLibrary().characters.find(item => item.id === 'c1').groupId, undefined);
    assert.equal(staleReader.getLibrary().characters.find(item => item.id === 'c2').groupId, 'g1');
    staleReader.destroy();
});

// ── 分组操作 ──────────────────────────────────────────

test('group actions: add in group, rename, move, delete (dissolve or with members), invalid names report errors', () => {
    const view = mount({ library: sampleLibrary(), prompts: ['宠物', '科幻'] });

    // 重名 → 提示错误，库不变
    view.click(view.groupButton('g1', 'rename'));
    assert.match(view.log.error.at(-1), /已存在/);
    assert.equal(view.sectionOf('g1').querySelector('.lwb-cl-group-name').textContent, '主线');
    // 新建分组
    view.click(view.$('[data-role="group-add"]'));
    assert.deepEqual(view.ui.getGroups().map(group => group.name), ['主线', '宠物', '科幻']);

    // 在本组添加：折叠的分组会被展开，并新增一张空卡片
    view.click(view.groupButton('g2', 'collapse'));
    assert.equal(view.sectionOf('g2').classList.contains('collapsed'), true);
    view.click(view.groupButton('g2', 'add'));
    assert.equal(view.sectionOf('g2').classList.contains('collapsed'), false);
    assert.equal(view.idsInGroup('g2').length, 2);

    // 上移 / 下移只剩手柄（键盘 ↑ / ↓ 或拖动），边界无效果
    const handleOf = groupId => view.sectionOf(groupId).querySelector('[data-drag-group]');
    view.fire(handleOf('g1'), 'keydown', { key: 'ArrowUp' });
    assert.deepEqual(view.ui.getGroups().map(group => group.id).slice(0, 2), ['g1', 'g2']);
    view.fire(handleOf('g1'), 'keydown', { key: 'ArrowDown' });
    assert.deepEqual(view.ui.getGroups().map(group => group.id).slice(0, 2), ['g2', 'g1']);

    // 删除分组，选择保留角色：成员回到未分组
    view.log.confirmMessages.length = 0;
    const confirmed = mount({ library: sampleLibrary(), confirms: [true, false] });
    confirmed.click(confirmed.groupButton('g1', 'delete'));
    assert.equal(confirmed.sectionOf('g1'), undefined);
    assert.deepEqual(confirmed.idsInGroup(''), ['c1', 'c2', 'c3']);
    assert.match(confirmed.log.confirmMessages[0], /确定删除分组“主线”/);

    // 删除分组并连同角色
    const purge = mount({ library: sampleLibrary(), confirms: [true, true] });
    purge.click(purge.groupButton('g1', 'delete'));
    assert.deepEqual(purge.allIds(), ['c1', 'c4']);

    // 第一次确认就取消：什么也不做
    const abort = mount({ library: sampleLibrary(), confirms: [false] });
    abort.click(abort.groupButton('g1', 'delete'));
    assert.ok(abort.sectionOf('g1'));
});

// ── 批量与复制 ────────────────────────────────────────

test('select mode: checkboxes, group select-all, partial state and the batch bar', () => {
    const view = mount({ library: sampleLibrary() });
    assert.equal(view.$('[data-role="batch-bar"]').hasAttribute('hidden'), true);
    assert.equal(view.$('.lwb-cl-select'), null);
    view.click(view.$('[data-role="select-toggle"]'));
    assert.equal(view.$('[data-role="batch-bar"]').hasAttribute('hidden'), false);
    assert.equal(view.$$('.lwb-cl-select').length, 4);
    assert.equal(view.$('[data-batch="enable"]').hasAttribute('disabled'), true);
    assert.equal(view.$('[data-batch="select-all"]').hasAttribute('disabled'), false);

    view.select('c2');
    const groupBox = view.sectionOf('g1').querySelector('.lwb-cl-group-select');
    assert.equal(groupBox.indeterminate, true);
    assert.equal(view.$('[data-role="batch-count"]').textContent, '已选 1 个');
    assert.equal(view.$('[data-batch="enable"]').hasAttribute('disabled'), false);

    groupBox.checked = true;
    view.fire(groupBox, 'change');
    assert.deepEqual(view.ui.getSelectedIds().sort(), ['c2', 'c3']);
    assert.equal(groupBox.indeterminate, false);

    groupBox.checked = false;
    view.fire(groupBox, 'change');
    assert.deepEqual(view.ui.getSelectedIds(), []);

    view.batch('select-all');
    assert.equal(view.ui.getSelectedIds().length, 4);
    // 重绘后选中状态保留，并回写到复选框
    view.ui.rerender();
    assert.equal(view.$$('.lwb-cl-select').every(box => box.checked), true);

    view.batch('exit');
    assert.equal(view.ui.isSelectMode(), false);
    assert.deepEqual(view.ui.getSelectedIds(), []);
    assert.equal(view.$('.lwb-cl-select'), null);
});

test('batch actions: enable/disable, move, copy-to, copy in place, delete, export selection', () => {
    const view = mount({ library: sampleLibrary(), confirms: [true] });
    view.click(view.$('[data-role="select-toggle"]'));
    view.type('c1', 'name', '阿璃（未保存）');

    view.select('c1', 'c3');
    view.batch('enable');
    assert.equal(view.ui.getLibrary().characters.find(item => item.id === 'c3').enabled, true);
    view.batch('disable');
    const disabled = view.ui.getLibrary().characters;
    assert.equal(disabled.find(item => item.id === 'c1').enabled, false);
    assert.equal(disabled.find(item => item.id === 'c3').enabled, false);
    assert.equal(disabled.find(item => item.id === 'c1').name, '阿璃（未保存）', '批量操作不丢未保存编辑');
    assert.deepEqual(view.ui.getSelectedIds().sort(), ['c1', 'c3'], '批量启停后保持选中');

    // 移到 g2
    const target = view.$('[data-role="batch-target"]');
    Array.from(target.querySelectorAll('option')).find(option => option.value === 'g2').selected = true;
    view.batch('move');
    assert.deepEqual(view.idsInGroup('g2'), ['c4', 'c1', 'c3']);

    // 重绘后批量栏仍记得目标分组；改回“未分组”再复制到：副本成为新的选中项
    const retarget = view.$('[data-role="batch-target"]');
    assert.equal(Array.from(retarget.querySelectorAll('option')).find(option => option.selected).value, 'g2');
    Array.from(retarget.querySelectorAll('option')).find(option => option.value === '').selected = true;
    view.batch('copy-to');
    const afterCopyTo = view.ui.getLibrary();
    assert.equal(afterCopyTo.characters.length, 6);
    const copies = view.ui.getSelectedIds();
    assert.equal(copies.length, 2);
    assert.equal(copies.every(id => !['c1', 'c3'].includes(id)), true);
    assert.deepEqual(view.idsInGroup('').slice(-2), copies);
    assert.equal(afterCopyTo.characters.find(item => item.id === copies[0]).name, '阿璃（未保存） 副本');

    // 就地复制：副本紧跟在原件后
    view.batch('copy');
    assert.equal(view.ui.getLibrary().characters.length, 8);

    // 删除所选（需确认）
    const before = view.allIds().length;
    view.batch('delete');
    assert.match(view.log.confirmMessages.at(-1), /确定删除选中的 2 个角色/);
    assert.equal(view.allIds().length, before - 2);
    assert.deepEqual(view.ui.getSelectedIds(), []);

    // 取消确认：不删除
    const keep = mount({ library: sampleLibrary(), confirms: [false] });
    keep.click(keep.$('[data-role="select-toggle"]'));
    keep.select('c1');
    keep.batch('delete');
    assert.equal(keep.allIds().length, 4);

    // 导出所选（可跨组）：文件内容基于草稿，文件名与 NovelAI 一致
    const exporter = mount({ library: sampleLibrary() });
    exporter.click(exporter.$('[data-role="select-toggle"]'));
    exporter.type('c4', 'name', '小猫（草稿）');
    exporter.select('c4', 'c1');
    exporter.batch('export');
    assert.equal(exporter.log.downloads.length, 1);
    assert.equal(exporter.log.downloads[0].fileName, 'character-tags-selection.json');
    assert.equal(exporter.log.downloads[0].data.type, CHARACTER_EXPORT_TYPE);
    assert.deepEqual(exporter.log.downloads[0].data.characters.map(item => item.id), ['c1', 'c4']);
    assert.equal(exporter.log.downloads[0].data.characters[1].name, '小猫（草稿）');
});

test('card duplicate button copies the draft in place with the NovelAI copy naming', () => {
    const view = mount({ library: sampleLibrary() });
    view.type('c2', 'appearance', 'unsaved look');
    view.click(view.cardOf('c2').querySelector('[data-lwb-card-action="duplicate"]'));
    const ids = view.idsInGroup('g1');
    assert.equal(ids.length, 3);
    assert.equal(ids[0], 'c2');
    const copy = view.ui.getLibrary().characters.find(item => item.id === ids[1]);
    assert.equal(copy.name, '芙蕾雅 副本');
    assert.equal(copy.appearance, 'unsaved look');
    assert.equal(copy.groupId, 'g1');
});

// ── 导出对话框（工具栏“导出”入口）──────────────────────

const dialogOf = view => view.$('[data-role="dialog"]');
const dq = (view, role) => view.$(`[data-role="${role}"]`);
function chooseScope(view, mode) {
    const radio = dq(view, `scope-${mode}`);
    radio.checked = true;
    view.fire(radio, 'change');
}
function chooseGroup(view, groupId) {
    const select = dq(view, 'group-select');
    Array.from(select.querySelectorAll('option')).find(option => option.value === groupId).selected = true;
    view.fire(select, 'change');
}

test('export entry opens a scope dialog instead of downloading, and cancelling exports nothing', () => {
    const view = mount({ library: sampleLibrary() });
    view.ui.openExportDialog();
    assert.ok(dialogOf(view), '弹出对话框');
    assert.equal(view.log.downloads.length, 0, '打开对话框本身不下载');
    // 无多选：默认“全部”，“当前已选”不可选
    assert.equal(dq(view, 'scope-all').checked, true);
    assert.match(dq(view, 'scope-all-label').textContent, /全部（4 个角色）/);
    assert.equal(dq(view, 'scope-selection').disabled, true);
    view.click(dq(view, 'cancel'));
    assert.equal(dialogOf(view), null);
    assert.equal(view.log.downloads.length, 0, '取消不导出');

    view.ui.openExportDialog();
    view.fire(view.document, 'keydown', { key: 'Escape' });
    assert.equal(dialogOf(view), null);
    view.ui.openExportDialog();
    view.fire(dq(view, 'overlay'), 'click');
    assert.equal(dialogOf(view), null);
    assert.equal(view.log.downloads.length, 0, 'Esc 与点遮罩都不导出');
});

test('export dialog: all scope downloads the whole draft with the all file name', () => {
    const view = mount({ library: sampleLibrary() });
    view.type('c4', 'name', '小猫（草稿）');
    view.ui.openExportDialog();
    view.click(dq(view, 'confirm'));
    assert.equal(dialogOf(view), null, '导出后对话框关闭');
    assert.equal(view.log.downloads.length, 1);
    const [{ fileName, data }] = view.log.downloads;
    assert.equal(fileName, 'character-tags.json');
    assert.equal(data.type, CHARACTER_EXPORT_TYPE);
    assert.equal(data.scope, 'all');
    assert.equal(data.version, 4);
    assert.deepEqual(data.characters.map(item => item.id), ['c1', 'c2', 'c3', 'c4']);
    assert.equal(data.characters.find(item => item.id === 'c4').name, '小猫（草稿）');
    assert.deepEqual(data.groups.map(group => group.id), ['g1', 'g2']);
});

test('export dialog: a group scope exports only that group and lists per-group counts', () => {
    const library = sampleLibrary();
    library.groups.push({ id: 'g3', name: '空组' });
    const view = mount({ library });
    view.ui.openExportDialog();
    const options = Array.from(dq(view, 'group-select').querySelectorAll('option'));
    assert.deepEqual(options.map(option => option.textContent), ['未分组（1 个）', '主线（2 个）', '宠物（1 个）', '空组（0 个，无可导出）']);
    assert.equal(options[3].hasAttribute('disabled'), true, '没有角色的分组不可选');
    chooseGroup(view, 'g1');
    assert.equal(dq(view, 'scope-group').checked, true, '操作下拉会顺带选中“某个分组”');
    view.click(dq(view, 'confirm'));
    const [{ fileName, data }] = view.log.downloads;
    assert.equal(fileName, 'character-tags-主线.json');
    assert.equal(data.scope, 'group');
    assert.deepEqual(data.characters.map(item => item.id), ['c2', 'c3'], '不含其它分组的角色');
    assert.deepEqual(data.groups.map(group => group.id), ['g1']);

    // 未分组也是一个可选范围
    const loose = mount({ library: sampleLibrary() });
    loose.ui.openExportDialog();
    chooseGroup(loose, '');
    loose.click(dq(loose, 'confirm'));
    assert.deepEqual(loose.log.downloads[0].data.characters.map(item => item.id), ['c1']);
    assert.equal(loose.log.downloads[0].fileName, 'character-tags-未分组.json');
});

test('export dialog: with a multi-selection it defaults to the selection and exports exactly those cards', () => {
    const view = mount({ library: sampleLibrary() });
    view.click(view.$('[data-role="select-toggle"]'));
    view.select('c4', 'c1');
    view.ui.openExportDialog();
    assert.equal(dq(view, 'scope-selection').checked, true, '有多选时默认“当前已选”');
    assert.equal(dq(view, 'scope-selection').disabled, false);
    assert.match(dq(view, 'scope-selection-label').textContent, /当前已选（2 个）/);
    view.click(dq(view, 'confirm'));
    const [{ fileName, data }] = view.log.downloads;
    assert.equal(fileName, 'character-tags-selection.json');
    assert.equal(data.scope, 'selection');
    assert.deepEqual(data.characters.map(item => item.id), ['c1', 'c4']);

    // 改选“全部”也可以
    view.ui.openExportDialog();
    chooseScope(view, 'all');
    view.click(dq(view, 'confirm'));
    assert.equal(view.log.downloads.at(-1).data.characters.length, 4);
});

test('export dialog: an empty library only warns, and blank new cards never reach the file or the counts', () => {
    const empty = mount({ library: { characters: [], groups: [] } });
    empty.ui.openExportDialog();
    assert.equal(dialogOf(empty), null);
    assert.equal(empty.log.downloads.length, 0);
    assert.match(empty.log.warning.at(-1), /没有可导出的角色/);

    const blank = mount({ library: { characters: [char('c1', '阿璃')], groups: [] } });
    blank.ui.addCharacter();
    blank.ui.openExportDialog();
    assert.match(dq(blank, 'scope-all-label').textContent, /全部（1 个角色）/);
    blank.click(dq(blank, 'confirm'));
    assert.deepEqual(blank.log.downloads.at(-1).data.characters.map(item => item.id), ['c1']);
});

test('the SD and ComfyUI pages wire their export button to the scope dialog, not to a direct download', () => {
    for (const file of ['../../providers/sd-webui/sd-draw.js', '../../providers/comfyui/comfy-draw.js']) {
        const source = readFileSync(new URL(file, import.meta.url), 'utf8');
        assert.match(source, /ensureCharacterLibraryUi\(\)\?\.openExportDialog\(\)/, file);
        assert.doesNotMatch(source, /\.exportAll\(/, file);
    }
});

test('deleting characters and clearing keep groups and unsaved edits of the survivors', () => {
    const view = mount({ library: sampleLibrary() });
    view.type('c4', 'name', '小猫（草稿）');
    view.ui.deleteCharacters(['c1']);
    assert.deepEqual(view.allIds(), ['c2', 'c3', 'c4']);
    assert.equal(view.ui.getLibrary().characters.find(item => item.id === 'c4').name, '小猫（草稿）');
    view.ui.clearCharacters();
    assert.deepEqual(view.allIds(), []);
    assert.deepEqual(view.ui.getGroups().map(group => group.id), ['g1', 'g2']);
    assert.ok(view.sectionOf('g1').textContent.includes('本组暂无角色'));
    assert.equal(view.ui.getCardCount(), 0);
    assert.equal(view.log.changes.at(-1), 0);
});

// ── 拖拽 ──────────────────────────────────────────────

// 给所有卡片和分组假造一个纵向布局，并提供 hitTest
function layout(view) {
    let y = 0;
    for (const section of view.$$('.lwb-cl-group')) {
        const top = y;
        view.rects.set(section.querySelector('.lwb-cl-group-header'), { top: y, bottom: y + 30 });
        y += 40;
        for (const card of section.querySelectorAll('.sd-char-card')) {
            view.rects.set(card, { top: y, bottom: y + 100 });
            y += 112;
        }
        view.rects.set(section, { top, bottom: y });
        y += 10;
    }
    return view;
}

function dragFrom(view, handle, steps) {
    const pointerId = 7;
    view.fire(handle, 'pointerdown', { button: 0, pointerId, clientX: 5, clientY: 5 });
    for (const step of steps) {
        view.hitRef.node = step.hit;
        view.fire(view.document, 'pointermove', { pointerId, clientX: 5, clientY: step.y });
        if (step.mark) {
            assert.equal(step.mark.node.classList.contains(step.mark.name), true, `落点标记 ${step.mark.name}`);
        }
    }
    view.fire(view.document, 'pointerup', { pointerId });
}

function topOf(view, node) {
    return view.rects.get(node).top;
}

test('dragging a card before another card in a group moves it there and keeps unsaved edits', () => {
    const view = mount({ library: sampleLibrary() });
    view.type('c1', 'name', '阿璃（未保存）');
    layout(view);
    const c2 = view.cardOf('c2');
    const handle = view.cardOf('c1').querySelector('[data-drag-char]');
    // 指针在 c2 的上半部分 → 放到 c2 之前，并加入 g1
    dragFrom(view, handle, [{ hit: c2, y: topOf(view, c2) + 10, mark: { node: c2, name: 'lwb-cl-drop-before' } }]);
    assert.deepEqual(view.idsInGroup('g1'), ['c1', 'c2', 'c3']);
    assert.equal(view.cardOf('c1').querySelector('[data-sd-char-field="name"]').value, '阿璃（未保存）');
    assert.equal(view.ui.getLibrary().characters.find(item => item.id === 'c1').groupId, 'g1');
    assert.equal(view.$('.lwb-cl-drop-before'), null, '拖拽结束后清除标记');
    assert.equal(view.document.body.classList.contains('lwb-cl-is-dragging'), false);
});

test('dragging below the last card of a group drops at the end of that group, even across a gap', () => {
    const view = mount({ library: sampleLibrary() });
    layout(view);
    const c3 = view.cardOf('c3');
    const body = view.sectionOf('g1').querySelector('.lwb-cl-group-body');
    const handle = view.cardOf('c4').querySelector('[data-drag-char]');
    // 指针落在 g1 的 body 空白处（不在任何卡片上），位置低于 c3 的中线
    dragFrom(view, handle, [{ hit: body, y: topOf(view, c3) + 90, mark: { node: c3, name: 'lwb-cl-drop-after' } }]);
    assert.deepEqual(view.idsInGroup('g1'), ['c2', 'c3', 'c4']);
    assert.deepEqual(view.idsInGroup('g2'), []);
});

test('dropping on the list itself (the gap between groups) cancels the drop instead of ungrouping', () => {
    const view = mount({ library: sampleLibrary() });
    layout(view);
    const before = view.ui.getLibrary();
    const handle = view.cardOf('c4').querySelector('[data-drag-char]');
    // 指针落在分组之间的缝隙：命中的是列表容器本身，不在任何 section 内
    dragFrom(view, handle, [{ hit: view.$('#list'), y: 60 }]);
    assert.equal(view.$('.lwb-cl-drop-before, .lwb-cl-drop-after, .lwb-cl-drop-into'), null, '没有落点标记');
    assert.deepEqual(view.idsInGroup('g2'), ['c4'], 'c4 仍在原分组');
    assert.deepEqual(view.ui.getLibrary(), before, '库内容不变');
});

test('dragging onto a group header drops into the end of that group', () => {
    const view = mount({ library: sampleLibrary() });
    layout(view);
    const header = view.sectionOf('g2').querySelector('.lwb-cl-group-header');
    const handle = view.cardOf('c1').querySelector('[data-drag-char]');
    dragFrom(view, handle, [{ hit: header, y: 40, mark: { node: header, name: 'lwb-cl-drop-into' } }]);
    assert.deepEqual(view.idsInGroup('g2'), ['c4', 'c1']);
    assert.equal(view.sectionOf(''), undefined, '未分组已空，不再渲染');
});

test('hovering the dragged card itself or a tiny movement does not change anything', () => {
    const view = mount({ library: sampleLibrary() });
    layout(view);
    const c2 = view.cardOf('c2');
    const handle = c2.querySelector('[data-drag-char]');
    // 悬停在自己身上：按其余卡片 (c3) 计算，位置在 c3 之前 → 实际顺序不变
    dragFrom(view, handle, [{ hit: c2, y: topOf(view, c2) + 20 }]);
    assert.deepEqual(view.idsInGroup('g1'), ['c2', 'c3']);
    // 没有移动超过阈值：不触发
    const before = view.ui.getLibrary();
    view.fire(handle, 'pointerdown', { button: 0, pointerId: 1, clientX: 5, clientY: 5 });
    view.hitRef.node = view.cardOf('c4');
    view.fire(view.document, 'pointerup', { pointerId: 1 });
    assert.deepEqual(view.ui.getLibrary(), before);
    // 非左键不开始拖拽；指针取消不落点
    view.fire(handle, 'pointerdown', { button: 2, pointerId: 2, clientX: 5, clientY: 5 });
    assert.equal(view.document.body.classList.contains('lwb-cl-is-dragging'), false);
    view.fire(handle, 'pointerdown', { button: 0, pointerId: 3, clientX: 5, clientY: 5 });
    view.hitRef.node = view.cardOf('c4');
    view.fire(view.document, 'pointermove', { pointerId: 3, clientX: 5, clientY: 400 });
    view.fire(view.document, 'pointercancel', { pointerId: 3 });
    assert.deepEqual(view.idsInGroup('g1'), ['c2', 'c3']);
    assert.equal(view.document.body.classList.contains('lwb-cl-is-dragging'), false);
});

test('dragging a selected card in select mode moves the whole selection; an unselected one moves alone', () => {
    const view = mount({ library: sampleLibrary() });
    view.click(view.$('[data-role="select-toggle"]'));
    view.select('c1', 'c4');
    layout(view);
    const c3 = view.cardOf('c3');
    dragFrom(view, view.cardOf('c4').querySelector('[data-drag-char]'), [{ hit: c3, y: topOf(view, c3) + 10 }]);
    assert.deepEqual(view.idsInGroup('g1'), ['c2', 'c1', 'c4', 'c3'], '已选项保持相对顺序整体移动');
    assert.deepEqual(view.ui.getSelectedIds().sort(), ['c1', 'c4']);

    layout(view);
    const header = view.sectionOf('g2').querySelector('.lwb-cl-group-header');
    dragFrom(view, view.cardOf('c2').querySelector('[data-drag-char]'), [{ hit: header, y: 40 }]);
    assert.deepEqual(view.idsInGroup('g2'), ['c2']);
    assert.deepEqual(view.idsInGroup('g1'), ['c1', 'c4', 'c3']);
});

test('dragging a group handle reorders groups; it cannot be dropped as a card', () => {
    const view = mount({ library: sampleLibrary() });
    layout(view);
    const g1 = view.sectionOf('g1');
    const g2 = view.sectionOf('g2');
    // 拖 g2 到 g1 上半部分之前
    dragFrom(view, g2.querySelector('[data-drag-group]'), [{ hit: g1.querySelector('.lwb-cl-group-header'), y: topOf(view, g1) + 5, mark: { node: g1, name: 'lwb-cl-drop-before' } }]);
    assert.deepEqual(view.ui.getGroups().map(group => group.id), ['g2', 'g1']);
    assert.deepEqual(view.$$('.lwb-cl-group').map(section => section.dataset.groupId), ['', 'g2', 'g1']);

    // 拖 g2 到最下方 → 放到末尾
    layout(view);
    const last = view.sectionOf('g1');
    dragFrom(view, view.sectionOf('g2').querySelector('[data-drag-group]'), [{ hit: last.querySelector('.sd-char-card'), y: view.rects.get(last).bottom - 2 }]);
    assert.deepEqual(view.ui.getGroups().map(group => group.id), ['g1', 'g2']);
    // 角色未受影响
    assert.deepEqual(view.idsInGroup('g1'), ['c2', 'c3']);
});

test('without groups cards can still be reordered by dragging (flat list)', () => {
    const view = mount({ library: { characters: [char('a', 'A'), char('b', 'B'), char('c', 'C')], groups: [] } });
    let y = 0;
    for (const card of view.$$('.sd-char-card')) { view.rects.set(card, { top: y, bottom: y + 100 }); y += 112; }
    const cardC = view.cardOf('c');
    const cardA = view.cardOf('a');
    dragFrom(view, cardC.querySelector('[data-drag-char]'), [{ hit: cardA, y: 10, mark: { node: cardA, name: 'lwb-cl-drop-before' } }]);
    assert.deepEqual(view.allIds(), ['c', 'a', 'b']);
    assert.deepEqual(view.ui.getLibrary().characters.map(item => item.id), ['c', 'a', 'b']);
});

test('keyboard: arrow keys on the handle reorder within the group and keep focus on the handle', () => {
    const view = mount({ library: sampleLibrary() });
    view.type('c3', 'name', '路人甲（未保存）');
    const handle = view.cardOf('c3').querySelector('[data-drag-char]');
    const event = view.fire(handle, 'keydown', { key: 'ArrowUp' });
    assert.equal(event.defaultPrevented, true);
    assert.deepEqual(view.idsInGroup('g1'), ['c3', 'c2']);
    assert.equal(view.cardOf('c3').querySelector('[data-sd-char-field="name"]').value, '路人甲（未保存）');
    // 已在边界：无变化
    view.fire(view.cardOf('c3').querySelector('[data-drag-char]'), 'keydown', { key: 'ArrowUp' });
    assert.deepEqual(view.idsInGroup('g1'), ['c3', 'c2']);
    view.fire(view.cardOf('c3').querySelector('[data-drag-char]'), 'keydown', { key: 'ArrowDown' });
    assert.deepEqual(view.idsInGroup('g1'), ['c2', 'c3']);
    // 其他按键不拦截
    const other = view.fire(view.cardOf('c3').querySelector('[data-drag-char]'), 'keydown', { key: 'a' });
    assert.equal(other.defaultPrevented, false);
});

test('group header has no up/down/export buttons; the handle is a focusable button instead', () => {
    const view = mount({ library: sampleLibrary() });
    for (const groupId of ['g1', 'g2']) {
        for (const action of ['up', 'down', 'export']) {
            assert.equal(view.groupButton(groupId, action), null, `${groupId}/${action}`);
        }
        const actions = Array.from(view.sectionOf(groupId).querySelectorAll('[data-lwb-group-action]')).map(node => node.dataset.lwbGroupAction);
        assert.deepEqual(actions, ['collapse', 'toggle-enabled', 'add', 'rename', 'delete']);
        const handle = view.sectionOf(groupId).querySelector('[data-drag-group]');
        assert.equal(handle.getAttribute('role'), 'button');
        assert.equal(handle.getAttribute('tabindex'), '0');
    }
    // 未分组没有手柄、没有开关，也没有管理按钮
    assert.deepEqual(
        Array.from(view.sectionOf('').querySelectorAll('[data-lwb-group-action]')).map(node => node.dataset.lwbGroupAction),
        ['collapse', 'add'],
    );
});

test('keyboard: arrow keys on a group handle move the group, stop at the edges and leave characters alone', () => {
    const library = sampleLibrary();
    library.groups.push({ id: 'g3', name: '科幻' });
    const view = mount({ library });
    view.type('c2', 'name', '芙蕾雅（未保存）');
    const handleOf = id => view.sectionOf(id).querySelector('[data-drag-group]');
    const order = () => view.ui.getGroups().map(group => group.id);
    assert.deepEqual(order(), ['g1', 'g2', 'g3']);

    const up = view.fire(handleOf('g2'), 'keydown', { key: 'ArrowUp' });
    assert.equal(up.defaultPrevented, true);
    assert.deepEqual(order(), ['g2', 'g1', 'g3']);
    // 重绘后分组区顺序也变了，未保存的编辑与成员保持
    assert.deepEqual(view.$$('.lwb-cl-group').map(section => section.dataset.groupId), ['', 'g2', 'g1', 'g3']);
    assert.equal(view.cardOf('c2').querySelector('[data-sd-char-field="name"]').value, '芙蕾雅（未保存）');
    assert.deepEqual(view.idsInGroup('g1'), ['c2', 'c3']);

    // 已在顶部再按 ↑：不动
    view.fire(handleOf('g2'), 'keydown', { key: 'ArrowUp' });
    assert.deepEqual(order(), ['g2', 'g1', 'g3']);
    // ↓ 到底再按 ↓：不动
    view.fire(handleOf('g1'), 'keydown', { key: 'ArrowDown' });
    assert.deepEqual(order(), ['g2', 'g3', 'g1']);
    view.fire(handleOf('g1'), 'keydown', { key: 'ArrowDown' });
    assert.deepEqual(order(), ['g2', 'g3', 'g1']);
    // 其他按键不拦截
    const other = view.fire(handleOf('g1'), 'keydown', { key: 'a' });
    assert.equal(other.defaultPrevented, false);
    assert.deepEqual(order(), ['g2', 'g3', 'g1']);
});

// ── 导入 ──────────────────────────────────────────────

function fakeFile(name, payload, size) {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return { name, size: size ?? text.length, text: async () => text };
}

test('import opens the shared dialog, applies to the draft only and reminds the user to save', async () => {
    const view = mount({ library: sampleLibrary() });
    view.type('c1', 'name', '阿璃（未保存）');
    await view.ui.importFile(fakeFile('队伍.json', {
        type: CHARACTER_EXPORT_TYPE,
        version: 4,
        groups: [{ id: 'fg', name: '远征队' }],
        characters: [
            char('c2', '芙蕾雅', { appearance: 'from file', groupId: 'fg' }),
            char('n1', '新人甲', { groupId: 'fg' }),
        ],
    }));
    const dialog = view.$('[data-role="dialog"]');
    assert.ok(dialog, '导入对话框已打开');
    assert.equal(view.$('[data-meta="file"]').textContent, '队伍.json');
    // 对话框打开期间草稿不变
    assert.equal(view.allIds().includes('n1'), false);
    view.click(view.$('[data-role="confirm"]'));
    assert.equal(view.$('[data-role="dialog"]'), null);

    const library = view.ui.getLibrary();
    assert.equal(library.characters.find(item => item.id === 'c2').appearance, 'from file', '按 id 替换');
    assert.equal(library.characters.find(item => item.id === 'c2').groupId, 'g1', '自动模式保留本地分组');
    const imported = library.characters.find(item => item.id === 'n1');
    assert.ok(imported.groupId, '新角色按文件分组名归位到新建分组');
    assert.equal(library.groups.find(group => group.id === imported.groupId).name, '远征队');
    assert.equal(library.characters.find(item => item.id === 'c1').name, '阿璃（未保存）', '导入不丢未保存编辑');
    assert.match(view.log.success.at(-1), /新增 1.*替换 1/);
    assert.match(view.log.success.at(-1), /保存角色/);
});

test('import rejects oversized, non-JSON and foreign files without opening the dialog', async () => {
    const view = mount({ library: sampleLibrary() });
    await view.ui.importFile(fakeFile('big.json', '{}', 6 * 1024 * 1024));
    assert.match(view.log.error.at(-1), /文件过大/);
    await view.ui.importFile(fakeFile('bad.json', '{not json'));
    assert.match(view.log.error.at(-1), /不是有效的 JSON/);
    await view.ui.importFile(fakeFile('other.json', { type: 'something-else', characters: [] }));
    assert.match(view.log.error.at(-1), /不是角色标签文件/);
    assert.equal(view.$('[data-role="dialog"]'), null);
    assert.equal(view.log.error.length, 3);
    await view.ui.importFile(null);
    assert.equal(view.log.error.length, 3);
});

test('destroy removes document-level listeners and closes an open dialog', async () => {
    const view = mount({ library: sampleLibrary() });
    layout(view);
    const handle = view.cardOf('c1').querySelector('[data-drag-char]');
    view.fire(handle, 'pointerdown', { button: 0, pointerId: 1, clientX: 5, clientY: 5 });
    assert.equal(view.document.body.classList.contains('lwb-cl-is-dragging'), true);
    view.ui.destroy();
    assert.equal(view.document.body.classList.contains('lwb-cl-is-dragging'), false);
    const before = view.ui.getLibrary();
    view.hitRef.node = view.cardOf('c4');
    view.fire(view.document, 'pointermove', { pointerId: 1, clientX: 5, clientY: 400 });
    view.fire(view.document, 'pointerup', { pointerId: 1 });
    assert.deepEqual(view.ui.getLibrary(), before);
    view.ui.destroy();
});

// ── 分组内部滚动（每个展开的分组自带滚动区，分组头留在外面）──────────────

const UI_CSS = readFileSync(new URL('../character-library-ui.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''); // 去掉注释，只看真正生效的规则
const cssRule = (css, selector) => css.match(new RegExp(`(?:^|\\n)[ \\t]*${selector.replace(/[.]/g, '\\.')}\\s*\\{([^}]*)\\}`))?.[1] ?? '';

test('group body scrolls on its own: max-height + overflow-y, no overscroll containment, header stays outside', () => {
    const rule = cssRule(UI_CSS, '.lwb-cl-group-body');
    assert.match(rule, /max-height:\s*max\(320px,\s*60vh\)/);
    assert.match(rule, /overflow-y:\s*auto/);
    assert.doesNotMatch(UI_CSS, /overscroll-behavior/, '滚到头要能带动整页');
    assert.match(cssRule(UI_CSS, '.lwb-cl-group-body > \\*'), /flex-shrink:\s*0/);

    const view = mount({ library: sampleLibrary() });
    for (const section of view.$$('.lwb-cl-group')) {
        const header = section.querySelector('.lwb-cl-group-header');
        const body = section.querySelector('.lwb-cl-group-body');
        assert.equal(header.parentNode, section);
        assert.equal(body.parentNode, section);
        assert.equal(body.contains(header), false, '分组头在滚动区之外，滚动时始终可见');
        assert.equal(header.querySelector('.sd-char-card'), null);
        assert.ok(body.querySelector('.sd-char-card'), '卡片都在滚动区内');
    }
});

test('narrow screens drop the group scroll area and keep whole-page scrolling', () => {
    const media = UI_CSS.match(/@media\s*\(max-width:\s*768px\)\s*\{([\s\S]*?)\n\}/);
    assert.ok(media, '768px 断点（与宿主页面单栏断点一致）');
    assert.match(cssRule(`\n${media[1]}`, '.lwb-cl-group-body'), /max-height:\s*none/);
    assert.match(cssRule(`\n${media[1]}`, '.lwb-cl-group-body'), /overflow-y:\s*visible/);
    // 断点规则位于基础规则之后，才能覆盖它
    assert.ok(UI_CSS.indexOf('@media (max-width: 768px)') > UI_CSS.indexOf('.lwb-cl-group-body {'));
});

test('narrow screens let character card rows wrap and let containers shrink instead of scrolling the page sideways', () => {
    const media = `\n${UI_CSS.match(/@media\s*\(max-width:\s*768px\)\s*\{([\s\S]*?)\n\}/)[1]}`;
    assert.match(cssRule(media, '.lwb-cl-group-body .sd-char-card-header'), /flex-wrap:\s*wrap/);
    assert.match(cssRule(media, '.lwb-cl-group-body .sd-char-card-title'), /min-width:\s*0/);
    assert.match(media, /\.lwb-cl-group-body > \.sd-char-card\s*\{[^}]*min-width:\s*0/);
    assert.match(cssRule(media, '.lwb-cl-group-actions'), /flex-wrap:\s*wrap/);

    for (const file of [
        '../../providers/novelai/novel-draw.html',
        '../../providers/sd-webui/sd-draw.html',
        '../../providers/comfyui/comfy-draw.html',
    ]) {
        const html = readFileSync(new URL(file, import.meta.url), 'utf8');
        const narrow = html.match(/@media \(max-width: 768px\) \{([\s\S]*?)\n\}/)[1];
        assert.match(narrow, /\.char-management-layout \{ grid-template-columns: minmax\(0, 1fr\); \}/, `${file}: 单栏网格必须能收缩`);
    }
    const nai = readFileSync(new URL('../../providers/novelai/novel-draw.html', import.meta.url), 'utf8');
    const naiNarrow = nai.match(/@media \(max-width: 768px\) \{([\s\S]*?)\n\}/)[1];
    assert.match(naiNarrow, /\.char-card-summary \{ flex-wrap: wrap; min-width: 0; \}/);
    assert.match(naiNarrow, /\.char-status \{ order: 3; flex: 1 1 0; min-width: 0;/);
    assert.match(naiNarrow, /\.char-actions \{ order: 3; flex-wrap: wrap;/);
});

function stubScrollIntoView(view) {
    const calls = [];
    const proto = Object.getPrototypeOf(view.$('#list'));
    proto.scrollIntoView = function scrollIntoView(options) { calls.push({ node: this, options }); };
    return calls;
}

test('a redraw keeps each group scroll position instead of jumping back to the top', () => {
    const view = mount({ library: sampleLibrary() });
    const bodyOf = id => view.sectionOf(id).querySelector('.lwb-cl-group-body');
    bodyOf('g1').scrollTop = 120;
    bodyOf('').scrollTop = 40;
    view.click(view.groupButton('g2', 'toggle-enabled')); // 整体重绘
    assert.equal(bodyOf('g1').scrollTop, 120);
    assert.equal(bodyOf('').scrollTop, 40);
    assert.ok(!bodyOf('g2').scrollTop, '没滚动过的分组仍在顶部');
});

test('keyboard moves keep the moved card (or group) inside the visible area, and boundaries do not scroll', () => {
    const view = mount({ library: sampleLibrary() });
    const calls = stubScrollIntoView(view);
    view.fire(view.cardOf('c3').querySelector('[data-drag-char]'), 'keydown', { key: 'ArrowUp' });
    assert.deepEqual(view.idsInGroup('g1'), ['c3', 'c2']);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].node, view.cardOf('c3'));
    assert.deepEqual({ ...calls[0].options }, { block: 'nearest' });

    // 已在顶部：不动，也不滚动
    calls.length = 0;
    view.fire(view.cardOf('c3').querySelector('[data-drag-char]'), 'keydown', { key: 'ArrowUp' });
    assert.equal(calls.length, 0);

    // 分组手柄
    view.fire(view.sectionOf('g2').querySelector('[data-drag-group]'), 'keydown', { key: 'ArrowUp' });
    assert.deepEqual(view.ui.getGroups().map(group => group.id), ['g2', 'g1']);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].node, view.sectionOf('g2'));
    assert.deepEqual({ ...calls[0].options }, { block: 'nearest' });
    calls.length = 0;
    view.fire(view.sectionOf('g2').querySelector('[data-drag-group]'), 'keydown', { key: 'ArrowUp' });
    assert.equal(calls.length, 0);
});

test('adding a character in a group expands it and scrolls the new card into view', () => {
    const view = mount({ library: sampleLibrary() });
    view.click(view.groupButton('g1', 'collapse')); // 先折叠
    const calls = stubScrollIntoView(view);
    view.click(view.groupButton('g1', 'add'));
    const ids = view.idsInGroup('g1');
    const newId = ids.at(-1);
    assert.equal(ids.length, 3);
    assert.equal(view.sectionOf('g1').classList.contains('collapsed'), false, '加入前已展开，新卡才可见');
    const reveal = calls.find(call => call.node === view.cardOf(newId));
    assert.ok(reveal, '新卡被滚入可视区');
    assert.deepEqual({ ...reveal.options }, { block: 'nearest' });
});

// 给“一个有滚动区的分组”造假的几何：g1 的 body 在 [100, bodyBottom]，卡片按 body.scrollTop 平移；
// 同时让 getComputedStyle 认出它是可滚动容器。
function scrollableLayout(view, rects, { bodyBottom = 290 } = {}) {
    const body = view.sectionOf('g1').querySelector('.lwb-cl-group-body');
    body.scrollHeight = 2000;
    body.clientHeight = bodyBottom - 100;
    body.scrollTop = 0;
    view.window.getComputedStyle = element => ({ overflowY: element === body ? 'auto' : 'visible' });
    view.window.innerHeight = 600;
    const bases = new Map([[view.cardOf('c2'), 100], [view.cardOf('c3'), 212]]);
    rects.get = (element) => {
        if (element === body) return { top: 100, bottom: bodyBottom };
        if (bases.has(element)) {
            const top = bases.get(element) - (body.scrollTop || 0);
            return { top, bottom: top + 100 };
        }
        return { top: 0, bottom: 0 };
    };
    return body;
}

const dynamicRects = () => ({ get: () => ({ top: 0, bottom: 0 }), set: () => {} });

test('dragging near the bottom edge of a group scrolls that group, and the drop point uses the post-scroll rects', () => {
    const rects = dynamicRects();
    const view = mount({ library: sampleLibrary(), rects });
    const body = scrollableLayout(view, rects);
    const c3 = view.cardOf('c3');
    const handle = view.cardOf('c4').querySelector('[data-drag-char]');
    const pointerId = 3;
    view.fire(handle, 'pointerdown', { button: 0, pointerId, clientX: 5, clientY: 5 });
    view.hitRef.node = c3;
    // y=255：在分组下缘 40px 感应区内（290-40=250）。滚动前 c3 中线 262 → “之前”；滚动 14px 后中线 248 → “之后”
    view.fire(view.document, 'pointermove', { pointerId, clientX: 5, clientY: 255 });
    assert.equal(body.scrollTop, 14, '分组内部滚动了一步');
    assert.equal(view.document.documentElement.scrollTop || 0, 0, '没有带动整页');
    assert.equal(c3.classList.contains('lwb-cl-drop-after'), true, '落点按滚动后的实时位置计算');
    assert.equal(c3.classList.contains('lwb-cl-drop-before'), false);
    view.fire(view.document, 'pointerup', { pointerId });
    assert.deepEqual(view.idsInGroup('g1'), ['c2', 'c3', 'c4']);
});

test('dragging near the top edge scrolls the group back up; in the middle nothing scrolls', () => {
    const rects = dynamicRects();
    const view = mount({ library: sampleLibrary(), rects });
    const body = scrollableLayout(view, rects);
    body.scrollTop = 100;
    const handle = view.cardOf('c4').querySelector('[data-drag-char]');
    const pointerId = 4;
    view.fire(handle, 'pointerdown', { button: 0, pointerId, clientX: 5, clientY: 5 });
    view.hitRef.node = view.cardOf('c2');
    view.fire(view.document, 'pointermove', { pointerId, clientX: 5, clientY: 120 });
    assert.equal(body.scrollTop, 86);
    view.fire(view.document, 'pointermove', { pointerId, clientX: 5, clientY: 190 }); // 中间
    assert.equal(body.scrollTop, 86);
    view.fire(view.document, 'pointercancel', { pointerId });
});

test('when the group is already scrolled to its end, the drag falls back to scrolling the page', () => {
    const rects = dynamicRects();
    const view = mount({ library: sampleLibrary(), rects });
    const body = scrollableLayout(view, rects, { bodyBottom: 590 });
    body.scrollTop = body.scrollHeight - body.clientHeight; // 已到底
    const handle = view.cardOf('c4').querySelector('[data-drag-char]');
    const pointerId = 5;
    view.fire(handle, 'pointerdown', { button: 0, pointerId, clientX: 5, clientY: 5 });
    view.hitRef.node = view.cardOf('c3');
    const before = body.scrollTop;
    view.fire(view.document, 'pointermove', { pointerId, clientX: 5, clientY: 585 }); // 分组下缘也是视口下缘
    assert.equal(body.scrollTop, before, '分组已到底，不再滚');
    const pageScroller = view.document.scrollingElement || view.document.documentElement;
    assert.equal(pageScroller.scrollTop, 14, '改为带动整页');
    view.fire(view.document, 'pointercancel', { pointerId });
});

test('a group scroll area that starts above the viewport does not hold the page back near the viewport top', () => {
    const rects = dynamicRects();
    const view = mount({ library: sampleLibrary(), rects });
    const body = scrollableLayout(view, rects, { bodyBottom: 590 });
    const baseGet = rects.get;
    rects.get = element => (element === body ? { top: -20, bottom: 590 } : baseGet(element));
    body.scrollTop = 100;
    const pageScroller = view.document.scrollingElement || view.document.documentElement;
    pageScroller.scrollTop = 300;
    const handle = view.cardOf('c4').querySelector('[data-drag-char]');
    const pointerId = 6;
    view.fire(handle, 'pointerdown', { button: 0, pointerId, clientX: 5, clientY: 5 });
    view.hitRef.node = view.cardOf('c3');
    view.fire(view.document, 'pointermove', { pointerId, clientX: 5, clientY: 10 });
    assert.equal(body.scrollTop, 100, '组内位置不动');
    assert.equal(pageScroller.scrollTop, 286, '直接带动整页上滚');
    view.fire(view.document, 'pointercancel', { pointerId });
});

test('dragging a whole group never scrolls a group body', () => {
    const rects = dynamicRects();
    const view = mount({ library: sampleLibrary(), rects });
    const body = scrollableLayout(view, rects);
    const handle = view.sectionOf('g2').querySelector('[data-drag-group]');
    const pointerId = 7;
    view.fire(handle, 'pointerdown', { button: 0, pointerId, clientX: 5, clientY: 5 });
    view.hitRef.node = view.cardOf('c3');
    view.fire(view.document, 'pointermove', { pointerId, clientX: 5, clientY: 255 }); // 与“拖卡片”那条用例同一位置
    assert.equal(body.scrollTop, 0, '拖动分组不滚组内');
    view.fire(view.document, 'pointercancel', { pointerId });
});

test('the SD and ComfyUI pages load the shared stylesheet that defines the group scroll area', () => {
    for (const file of ['../../providers/sd-webui/sd-draw.html', '../../providers/comfyui/comfy-draw.html']) {
        const html = readFileSync(new URL(file, import.meta.url), 'utf8');
        assert.match(html, /href="\.\.\/\.\.\/shared\/character-library-ui\.css"/, file);
    }
});

test('the group header keeps a minimum name width and wraps the buttons instead of squeezing the name out', () => {
    assert.match(cssRule(UI_CSS, '.lwb-cl-group-name'), /min-width:\s*6em/);
    assert.match(cssRule(UI_CSS, '.lwb-cl-group-name'), /text-overflow:\s*ellipsis/);
    assert.match(cssRule(UI_CSS, '.lwb-cl-group-header'), /flex-wrap:\s*wrap/);
    assert.match(cssRule(UI_CSS, '.lwb-cl-group-actions'), /margin-left:\s*auto/);
    assert.match(cssRule(UI_CSS, '.lwb-cl-group-count'), /flex-shrink:\s*0/);
    // 计数写成紧凑的“启用/总数”，完整含义放在 title 里（重绘与单卡切换后都一样）
    const view = mount({ library: sampleLibrary() });
    const count = id => view.sectionOf(id).querySelector('[data-role="group-count"]');
    assert.equal(count('g1').textContent, '1/2');
    assert.equal(count('g1').getAttribute('title'), '组内自己开着的角色 1 个，共 2 个');
    view.click(view.groupButton('g1', 'toggle-enabled'));
    assert.equal(count('g1').textContent, '1/2', '分组开关不改变“自己开着数”');
    assert.equal(count('g1').getAttribute('title'), '组内自己开着的角色 1 个，共 2 个；分组已关闭，组内角色当前都不参与出图');
});

test('syncGroupEnabled turns the given group switches to the latest values and keeps every other draft edit', () => {
    const view = mount({ library: sampleLibrary() });
    view.type('c1', 'name', '改过的名字'); // 未保存的草稿编辑
    view.click(view.groupButton('g2', 'toggle-enabled')); // 用户在草稿里自己关掉了 g2（未保存）
    assert.equal(view.ui.getGroups().find(group => group.id === 'g2').enabled, false);

    // 预设在面板外把 g1 关掉：只同步 g1，g2 的草稿开关不动
    const changed = view.ui.syncGroupEnabled([{ id: 'g1', name: '主线', enabled: false }, { id: 'g2', name: '宠物' }], ['g1']);
    assert.equal(changed, true);
    assert.deepEqual(view.ui.getGroups(), [{ id: 'g1', name: '主线', enabled: false }, { id: 'g2', name: '宠物', enabled: false }]);
    assert.ok(view.sectionOf('g1').classList.contains('lwb-cl-group-disabled'), 'group header redrawn');
    const draft = view.ui.getLibrary().characters;
    assert.equal(draft.find(item => item.id === 'c1').name, '改过的名字', 'draft edit survives');
    assert.equal(view.allIds().length, 4, 'no card is lost');

    // 没有实际变化：返回 false，也不重绘
    assert.equal(view.ui.syncGroupEnabled([{ id: 'g1', name: '主线', enabled: false }], ['g1']), false);
    // 缺省同步全部同 id 分组
    assert.equal(view.ui.syncGroupEnabled([{ id: 'g1', name: '主线' }, { id: 'g2', name: '宠物' }]), true);
    assert.deepEqual(view.ui.getGroups(), [{ id: 'g1', name: '主线' }, { id: 'g2', name: '宠物' }]);
});
