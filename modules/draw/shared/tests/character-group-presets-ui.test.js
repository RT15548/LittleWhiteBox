import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import { createGroupPresetPanel, describePresetBadges } from '../character-group-presets-ui.js';

const LIBRARY = {
    groups: [
        { id: 'g1', name: '校服组', enabled: true },
        { id: 'g2', name: '泳装组', enabled: false },
    ],
    characters: [
        { id: 'c1', name: 'A', groupId: 'g1', enabled: true },
        { id: 'c2', name: 'B', groupId: 'g1', enabled: false },
        { id: 'c3', name: 'C', groupId: 'g2', enabled: true },
    ],
};
const HOST = [
    { avatar: 'a.png', name: 'Alice' },
    { avatar: 'b.png', name: 'Bob' },
    { avatar: 'c.png', name: 'Carol' },
];

function preset(id, name, extra = {}) {
    return { id, name, revision: 1, groupStates: {}, bindings: [], ...extra };
}
function binding(avatar, name = '') {
    return { type: 'character', avatar, name };
}

function mount({ presets = [], applied = null, active = [], host = HOST, library = LIBRARY } = {}) {
    const { document, window } = parseHTML('<!doctype html><html><body><div id="box"></div></body></html>');
    const state = { presets, applied, active, changes: [], applies: [], toasts: [] };
    const container = document.getElementById('box');
    const panel = createGroupPresetPanel({
        document,
        container,
        getLibrary: () => library,
        getPresets: () => state.presets,
        getApplied: () => state.applied,
        getActiveAvatars: () => state.active,
        listHostCharacters: () => host,
        onPresetsChange: (next, meta) => { state.changes.push({ next, meta }); state.presets = next; },
        onApply: (id) => { state.applies.push(id); return { status: 'applied', changed: true, changedCount: 2 }; },
        toast: (message, level) => state.toasts.push({ message, level }),
    });
    const $ = selector => container.querySelector(selector);
    const $$ = selector => Array.from(container.querySelectorAll(selector));
    const fire = (node, type, init = {}) => {
        const event = new window.Event(type, { bubbles: true, cancelable: true });
        Object.assign(event, init);
        node.dispatchEvent(event);
    };
    const click = node => fire(node, 'click');
    const act = (action, presetId = '') => {
        const scope = presetId ? $$('[data-preset-id]').find(node => node.getAttribute('data-preset-id') === presetId) : container;
        const node = Array.from(scope.querySelectorAll('[data-action]')).find(item => item.getAttribute('data-action') === action);
        assert.ok(node, `找不到按钮 ${action}`);
        click(node);
    };
    const type = (node, value) => { node.value = value; fire(node, 'input'); };
    return { document, container, panel, state, $, $$, fire, click, act, type };
}

test('空态与有预设时的列表渲染（含优先级文案与绑定数）', () => {
    const empty = mount();
    assert.match(empty.container.textContent, /分组预设/);
    assert.match(empty.container.textContent, /还没有分组预设/);
    assert.equal(empty.$$('[data-preset-id]').length, 0);

    const m = mount({ presets: [preset('p1', '预设甲', { bindings: [binding('a.png'), binding('b.png')] }), preset('p2', '预设乙')] });
    assert.equal(m.$$('[data-preset-id]').length, 2);
    assert.match(m.container.textContent, /靠前优先/);
    assert.match(m.container.textContent, /绑定 2 张角色卡/);
    assert.match(m.$('[role="status"]').textContent, /当前聊天未命中任何预设/);
});

test('“存为预设”用内联输入框：生成 groupStates 与名称，并回调 onPresetsChange', () => {
    const m = mount();
    m.act('save-open');
    const input = m.$('[data-role="save-name"]');
    assert.equal(input.value, '预设 1');
    input.value = '  我的预设  ';
    m.act('save-confirm');
    assert.equal(m.state.changes.length, 1);
    const { next, meta } = m.state.changes[0];
    assert.equal(meta.reason, 'create');
    assert.equal(next[0].name, '我的预设');
    assert.deepEqual(next[0].groupStates, { g1: true, g2: false });
    assert.equal(meta.presetId, next[0].id);
    assert.equal(m.$('[data-role="save-name"]'), null, '保存后输入框关闭');
    assert.ok(m.$('[data-role="rename"]'), '新预设自动展开');
});

test('空名 / 重名在组件内显示错误且不回调', () => {
    const m = mount({ presets: [preset('p1', '已有')] });
    m.act('save-open');
    m.$('[data-role="save-name"]').value = '   ';
    m.act('save-confirm');
    assert.match(m.$('[role="alert"]').textContent, /不能为空/);
    m.$('[data-role="save-name"]').value = '已有';
    m.act('save-confirm');
    assert.match(m.$('[role="alert"]').textContent, /已存在/);
    assert.equal(m.$('[data-role="save-name"]').value, '已有', '失败时保留输入');
    assert.equal(m.state.changes.length, 0);
});

test('分组三段选择：开 / 关 / 不管（移除该键）', () => {
    const m = mount({ presets: [preset('p1', 'P', { groupStates: { g1: true } })] });
    m.panel.expand('p1');
    const radios = m.$$('input[data-role="group-state"]');
    assert.equal(radios.length, 6);
    const pick = (groupId, stateText) => radios.find(r => r.getAttribute('data-group-id') === groupId && r.getAttribute('data-state') === stateText);
    assert.equal(pick('g1', 'true').checked, true);
    assert.equal(pick('g2', 'null').checked, true);
    pick('g2', 'false').checked = true;
    m.fire(pick('g2', 'false'), 'change');
    assert.deepEqual(m.state.presets[0].groupStates, { g1: true, g2: false });
    assert.equal(m.state.changes.at(-1).meta.reason, 'group-state');
    const again = m.$$('input[data-role="group-state"]').find(r => r.getAttribute('data-group-id') === 'g1' && r.getAttribute('data-state') === 'null');
    again.checked = true;
    m.fire(again, 'change');
    assert.deepEqual(m.state.presets[0].groupStates, { g2: false });
});

test('绑定：添加（下拉排除已绑定）/ 移除 / 绑定当前角色卡 / 缺失与重复绑定提示', () => {
    const m = mount({
        presets: [
            preset('p1', 'P1', { bindings: [binding('a.png'), binding('gone.png', '旧名')] }),
            preset('p2', 'P2', { bindings: [binding('a.png')] }),
        ],
        active: ['b.png'],
    });
    m.panel.expand('p1');
    const detail = m.$$('[data-preset-id]')[0];
    assert.match(detail.textContent, /另一个预设也绑定了它，靠前的优先/);
    assert.match(detail.textContent, /（角色卡不存在）/);
    assert.match(detail.textContent, /gone\.png/);
    const options = Array.from(detail.querySelectorAll('[data-role="add-select"] option')).map(o => o.getAttribute('value'));
    assert.deepEqual(options, ['b.png', 'c.png']);

    m.act('binding-add', 'p1'); // 默认选中第一项 b.png
    assert.deepEqual(m.state.presets[0].bindings.map(b => b.avatar), ['a.png', 'gone.png', 'b.png']);
    assert.equal(m.state.presets[0].bindings[2].name, 'Bob');
    assert.equal(m.state.changes.at(-1).meta.reason, 'binding-add');

    m.state.active = ['c.png'];
    m.panel.render();
    m.act('bind-active', 'p1'); // 单个未绑定：直接加入
    assert.equal(m.state.presets[0].bindings.at(-1).avatar, 'c.png');

    const remove = m.$$('[data-action="binding-remove"]').find(n => n.getAttribute('data-avatar') === 'gone.png');
    m.click(remove);
    assert.deepEqual(m.state.presets[0].bindings.map(b => b.avatar), ['a.png', 'b.png', 'c.png']);
    assert.equal(m.state.changes.at(-1).meta.reason, 'binding-remove');
});

test('群聊里有多个未绑定角色卡时，“绑定当前角色卡”先内联确认', () => {
    const m = mount({ presets: [preset('p1', 'P1')], active: ['a.png', 'b.png'] });
    m.panel.expand('p1');
    m.act('bind-active', 'p1');
    assert.equal(m.state.changes.length, 0);
    assert.match(m.container.textContent, /Alice、Bob/);
    m.act('bind-active-confirm', 'p1');
    assert.deepEqual(m.state.presets[0].bindings.map(b => b.avatar), ['a.png', 'b.png']);
});

test('删除需要二次确认，取消不删除', () => {
    const m = mount({ presets: [preset('p1', 'P1'), preset('p2', 'P2')] });
    m.act('delete', 'p1');
    assert.equal(m.state.changes.length, 0);
    m.act('pending-cancel', 'p1');
    assert.equal(m.$('[data-action="delete-confirm"]'), null);
    m.act('delete', 'p1');
    m.act('delete-confirm', 'p1');
    assert.deepEqual(m.state.presets.map(p => p.id), ['p2']);
    assert.equal(m.state.changes[0].meta.reason, 'delete');
});

test('调整优先级：上移 / 下移，边界按钮禁用', () => {
    const m = mount({ presets: [preset('p1', 'P1'), preset('p2', 'P2')] });
    m.panel.expand('p1');
    m.panel.expand('p2');
    const upOf = id => Array.from(m.$$('[data-preset-id]').find(n => n.getAttribute('data-preset-id') === id).querySelectorAll('[data-action="move-up"]'))[0];
    assert.equal(upOf('p1').hasAttribute('disabled'), true);
    m.act('move-up', 'p2');
    assert.deepEqual(m.state.presets.map(p => p.id), ['p2', 'p1']);
    assert.equal(m.state.changes.at(-1).meta.reason, 'move-up');
    assert.equal(upOf('p2').hasAttribute('disabled'), true);
});

test('徽标：当前命中（只给靠前的命中者）与最近应用', () => {
    const presets = [preset('p1', 'P1', { bindings: [binding('a.png')] }), preset('p2', 'P2', { bindings: [binding('a.png')] })];
    const info = describePresetBadges(presets[0], { activeAvatars: ['a.png'], applied: { presetId: 'p2', revision: 1 }, presets });
    assert.deepEqual(info.labels, ['当前命中']);
    const second = describePresetBadges(presets[1], { activeAvatars: ['a.png'], applied: { presetId: 'p2', revision: 3 }, presets });
    assert.deepEqual(second.labels, ['最近应用']);
    assert.equal(second.appliedStale, true);

    const m = mount({ presets, applied: { presetId: 'p2', revision: 1, appliedAt: 1 }, active: ['a.png'] });
    const badgeTexts = id => Array.from(m.$$('[data-preset-id]').find(n => n.getAttribute('data-preset-id') === id).querySelectorAll('.lwb-gp-badge')).map(n => n.textContent);
    assert.deepEqual(badgeTexts('p1'), ['当前命中']);
    assert.deepEqual(badgeTexts('p2'), ['最近应用']);
    assert.match(m.$('[role="status"]').textContent, /当前聊天命中预设：“P1”/);

    m.act('apply', 'p2');
    assert.deepEqual(m.state.applies, ['p2']);
});

test('XSS：名称 / 分组名 / 角色名只作为文本', () => {
    const evil = '<img src=x onerror="globalThis.__pwned=1">';
    const m = mount({
        presets: [preset('p1', evil, { bindings: [binding('x.png', evil)] })],
        host: [{ avatar: 'x.png', name: evil }],
        library: { groups: [{ id: 'g1', name: evil, enabled: true }], characters: [] },
    });
    m.panel.expand('p1');
    assert.equal(m.$$('img').length, 0);
    assert.ok(m.container.textContent.includes(evil));
    assert.equal(globalThis.__pwned, undefined);
});

test('destroy 清空容器并移除监听', () => {
    const m = mount({ presets: [preset('p1', 'P1')] });
    const button = m.$('[data-action="delete"]');
    m.panel.destroy();
    assert.equal(m.container.childNodes.length, 0);
    m.click(button);
    m.panel.render();
    assert.equal(m.container.childNodes.length, 0);
    assert.equal(m.state.changes.length, 0);
});
