import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import {
    buildCharacterExportFileName,
    defaultGroupNameFromFileName,
    describeExportScopes,
    openCharacterExportDialog,
    openCharacterImportDialog,
} from '../character-library-dialog.js';
import {
    CHARACTER_EXPORT_TYPE,
    parseCharacterImport,
} from '../character-library.js';

function char(id, name, extra = {}) {
    return { id, enabled: true, name, aliases: [], type: 'girl', appearance: `${name} look`, negativeTags: '', danbooruTag: '', outfits: [], dynamicStates: [], ...extra };
}

function fileOf(characters, groups = [], version = 4) {
    return parseCharacterImport({ type: CHARACTER_EXPORT_TYPE, version, groups, characters });
}

function localLibrary() {
    return {
        groups: [{ id: 'g1', name: '主线' }, { id: 'g2', name: '宠物' }],
        characters: [
            char('c1', '阿璃'),
            char('c2', '芙蕾雅', { groupId: 'g1' }),
            char('c3', '小猫', { groupId: 'g2', enabled: false }),
        ],
    };
}

// 文件：c2 已存在（改了外貌），n1/n2 为新角色，n2 属于文件分组“远征队”
function sampleFile() {
    return fileOf(
        [
            char('c2', '芙蕾雅', { appearance: 'updated look', groupId: 'fg' }),
            char('n1', '新人甲'),
            char('n2', '新人乙', { groupId: 'fg' }),
        ],
        [{ id: 'fg', name: '远征队' }],
    );
}

function mount(overrides = {}) {
    const { document, window } = parseHTML('<!doctype html><html><body></body></html>');
    const calls = { confirm: [], closed: 0 };
    const library = overrides.library ?? localLibrary();
    const handle = openCharacterImportDialog({
        document,
        library,
        parsed: overrides.parsed ?? sampleFile(),
        fileName: overrides.fileName ?? 'character-tags-test.json',
        onConfirm: overrides.onConfirm ?? ((result) => { calls.confirm.push(result); }),
        onClose: () => { calls.closed += 1; },
        makeId: (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`,
    });
    const q = (role) => document.querySelector(`[data-role="${role}"]`);
    const fire = (node, type, init) => {
        const event = new window.Event(type, { bubbles: true, cancelable: true });
        Object.assign(event, init);
        node.dispatchEvent(event);
        return event;
    };
    const chooseMode = (mode) => {
        const radio = q(`mode-${mode}`);
        radio.checked = true;
        fire(radio, 'change');
    };
    const summaryText = (key) => document.querySelector(`[data-summary="${key}"]`)?.textContent ?? null;
    const setSelect = (select, value) => {
        // 只对目标项赋 true：linkedom 里把任意 option.selected 设为 false 会清空整个下拉的选中项
        Array.from(select.querySelectorAll('option')).find(option => option.value === value).selected = true;
        fire(select, 'change');
    };
    const typeName = (value) => {
        const input = q('new-group-name');
        input.value = value;
        fire(input, 'input');
    };
    const toggleDisabledBox = (checked) => {
        const box = q('import-disabled');
        box.checked = checked;
        fire(box, 'change');
    };
    return { document, window, handle, calls, library, q, fire, chooseMode, summaryText, setSelect, typeName, toggleDisabledBox };
}

test('默认选中自动模式并显示文件信息与预览摘要', () => {
    const ui = mount();
    assert.equal(ui.q('mode-auto').checked, true);
    assert.equal(ui.q('mode-existing-group').checked, false);
    assert.equal(ui.q('mode-new-group').checked, false);
    assert.equal(ui.document.querySelector('[data-meta="file"]').textContent, 'character-tags-test.json');
    assert.equal(ui.document.querySelector('[data-meta="version"]').textContent, 'v4');
    assert.equal(ui.document.querySelector('[data-meta="characters"]').textContent, '3');
    assert.equal(ui.document.querySelector('[data-meta="groups"]').textContent, '1');
    assert.equal(ui.document.querySelector('[data-meta="skipped"]').textContent, '0');

    assert.equal(ui.summaryText('added'), '新增 2');
    assert.equal(ui.summaryText('replaced'), '替换 1');
    assert.equal(ui.summaryText('skipped'), '跳过 0');
    // 自动模式会按文件分组名新建“远征队”
    assert.equal(ui.summaryText('groupsCreated'), '新建分组 1');
    assert.equal(ui.summaryText('keptBoth'), null);

    assert.equal(ui.q('policy-select').disabled, true);
    assert.match(ui.q('policy-hint').textContent, /保留本地的启用状态、分组和位置/);
    assert.ok(!ui.q('import-disabled').checked);
    assert.equal(ui.q('confirm').disabled, false);
    assert.match(ui.document.body.textContent, /建议先导出全部再导入/);
    assert.equal(ui.q('new-group-name').value, 'character-tags-test');
    assert.equal(ui.q('dialog').getAttribute('aria-modal'), 'true');
});

test('切换目标位置和相同 id 策略后预览摘要随之变化', () => {
    const ui = mount();

    ui.chooseMode('existing-group');
    assert.equal(ui.q('policy-select').disabled, false);
    assert.equal(ui.summaryText('added'), '新增 2');
    assert.equal(ui.summaryText('replaced'), '替换 1');
    assert.equal(ui.summaryText('groupsCreated'), null);

    ui.setSelect(ui.q('policy-select'), 'keep-both');
    assert.equal(ui.summaryText('added'), '新增 2');
    assert.equal(ui.summaryText('replaced'), '替换 0');
    assert.equal(ui.summaryText('keptBoth'), '保留两者 1');

    ui.setSelect(ui.q('policy-select'), 'skip');
    assert.equal(ui.summaryText('replaced'), '替换 0');
    assert.equal(ui.summaryText('skipped'), '跳过 1');
    assert.equal(ui.summaryText('keptBoth'), null);

    ui.chooseMode('new-group');
    assert.equal(ui.summaryText('groupsCreated'), '新建分组 1');

    ui.chooseMode('auto');
    assert.equal(ui.q('policy-select').disabled, true);
    assert.equal(ui.summaryText('replaced'), '替换 1');
});

test('操作子控件会自动选中对应模式', () => {
    const ui = mount();
    ui.setSelect(ui.q('group-select'), 'g2');
    assert.equal(ui.q('mode-existing-group').checked, true);
    assert.equal(ui.q('mode-auto').checked, false);
    ui.typeName('冒险团');
    assert.equal(ui.q('mode-new-group').checked, true);
});

test('导入到已有分组时点击导入得到落入该分组的结果', () => {
    const ui = mount();
    ui.chooseMode('existing-group');
    ui.setSelect(ui.q('group-select'), 'g2');
    ui.q('confirm').click();

    assert.equal(ui.calls.confirm.length, 1);
    const { plan, options } = ui.calls.confirm[0];
    assert.equal(options.mode, 'existing-group');
    assert.equal(options.groupId, 'g2');
    const byId = Object.fromEntries(plan.library.characters.map(item => [item.id, item]));
    assert.equal(byId.c2.groupId, 'g2');
    assert.equal(byId.c2.appearance, 'updated look');
    const added = plan.library.characters.filter(item => ['新人甲', '新人乙'].includes(item.name));
    assert.equal(added.length, 2);
    assert.ok(added.every(item => item.groupId === 'g2'));
    assert.equal(plan.library.groups.length, 2);
    assert.equal(ui.calls.closed, 1);
    assert.equal(ui.document.querySelector('[data-role="overlay"]'), null);
});

test('新分组名称与现有分组重名时在对话框内报错并禁用导入', () => {
    const ui = mount();
    ui.chooseMode('new-group');
    assert.equal(ui.q('confirm').disabled, false);

    ui.typeName('主线');
    assert.equal(ui.q('confirm').disabled, true);
    assert.equal(ui.q('error').hasAttribute('hidden'), false);
    assert.match(ui.q('error').textContent, /已存在/);
    assert.equal(ui.q('new-group-name').getAttribute('aria-invalid'), 'true');
    assert.equal(ui.summaryText('added'), null);

    // 点击被禁用的按钮不会触发回调，对话框也不会关闭
    ui.q('confirm').click();
    assert.equal(ui.calls.confirm.length, 0);
    assert.ok(ui.document.querySelector('[data-role="overlay"]'));

    ui.typeName('   ');
    assert.match(ui.q('error').textContent, /不能为空/);
    assert.equal(ui.q('confirm').disabled, true);

    ui.typeName('未分组');
    assert.match(ui.q('error').textContent, /保留名称/);

    ui.typeName('新的分组');
    assert.equal(ui.q('error').hasAttribute('hidden'), true);
    assert.equal(ui.q('confirm').disabled, false);
    assert.equal(ui.q('new-group-name').getAttribute('aria-invalid'), 'false');
});

test('没有任何分组时禁用“导入到已有分组”', () => {
    const ui = mount({ library: { groups: [], characters: [char('c1', '阿璃')] } });
    assert.equal(ui.q('mode-existing-group').disabled, true);
    assert.equal(ui.q('group-select').disabled, true);
    assert.equal(ui.q('existing-empty-hint').hasAttribute('hidden'), false);

    // 即使事件被强行触发也不会进入该模式
    ui.chooseMode('existing-group');
    assert.equal(ui.q('mode-auto').checked, true);
    assert.equal(ui.q('mode-existing-group').checked, false);
});

test('有分组时不显示“没有分组”提示', () => {
    const ui = mount();
    assert.equal(ui.q('mode-existing-group').disabled, false);
    assert.equal(ui.q('existing-empty-hint').hasAttribute('hidden'), true);
});

test('勾选“新增的角色导入为停用”会影响导入后启用数，且不影响已有角色的替换', () => {
    const ui = mount();
    assert.match(ui.q('total').textContent, /共 5 个角色，已启用 4 个/);

    ui.toggleDisabledBox(true);
    assert.match(ui.q('total').textContent, /共 5 个角色，已启用 2 个/);
    assert.equal(ui.summaryText('replaced'), '替换 1');

    ui.q('confirm').click();
    const { plan } = ui.calls.confirm[0];
    const byName = Object.fromEntries(plan.library.characters.map(item => [item.name, item]));
    assert.equal(byName['新人甲'].enabled, false);
    assert.equal(byName['新人乙'].enabled, false);
    assert.equal(byName['芙蕾雅'].enabled, true);
});

test('导入后已启用角色超过 500 时显示醒目警告，但仍可导入', () => {
    const characters = Array.from({ length: 499 }, (_, index) => char(`l${index}`, `本地${index}`));
    const library = { groups: [], characters };
    const parsed = fileOf([char('n1', '新甲'), char('n2', '新乙'), char('n3', '新丙')]);
    const ui = mount({ library, parsed });

    const warning = ui.q('limit-warning');
    assert.equal(warning.hasAttribute('hidden'), false);
    assert.match(warning.textContent, /导入后已启用角色 502 个，超过 500/);
    assert.match(warning.textContent, /后台出图/);
    assert.equal(ui.q('confirm').disabled, false);

    ui.toggleDisabledBox(true);
    assert.equal(warning.hasAttribute('hidden'), true);
    assert.equal(warning.textContent, '');

    ui.toggleDisabledBox(false);
    assert.equal(warning.hasAttribute('hidden'), false);
    ui.q('confirm').click();
    assert.equal(ui.calls.confirm.length, 1);
    assert.equal(ui.calls.confirm[0].plan.summary.enabledAfter, 502);
});

test('刚好 500 个已启用角色不触发警告', () => {
    const characters = Array.from({ length: 499 }, (_, index) => char(`l${index}`, `本地${index}`));
    const ui = mount({ library: { groups: [], characters }, parsed: fileOf([char('n1', '新甲')]) });
    assert.equal(ui.q('limit-warning').hasAttribute('hidden'), true);
});

test('plan 返回的警告逐条展示（同名冲突、文件内重复 id、版本更新）', () => {
    const parsed = fileOf(
        [char('x1', '阿璃'), char('dup', '甲'), char('dup', '乙')],
        [],
        9,
    );
    const ui = mount({ parsed });
    const items = Array.from(ui.document.querySelectorAll('[data-warning]'));
    const codes = items.map(item => item.getAttribute('data-warning'));
    assert.ok(codes.includes('newer-version'));
    assert.ok(codes.includes('duplicate-id'));
    assert.ok(codes.includes('name-conflict'));
    const conflict = items.find(item => item.getAttribute('data-warning') === 'name-conflict');
    assert.match(conflict.textContent, /阿璃/);
});

test('点击导入拿到的 plan.library 正确，且不修改传入的本地库', () => {
    const library = localLibrary();
    const before = JSON.stringify(library);
    const ui = mount({ library });
    ui.q('confirm').click();

    assert.equal(JSON.stringify(library), before);
    const { plan, options } = ui.calls.confirm[0];
    assert.equal(options.mode, 'auto');
    assert.equal(plan.summary.added, 2);
    assert.equal(plan.summary.replaced, 1);
    assert.equal(plan.library.characters.length, 5);
    const groupNames = plan.library.groups.map(group => group.name);
    assert.deepEqual(groupNames, ['主线', '宠物', '远征队']);
    const newcomer = plan.library.characters.find(item => item.name === '新人乙');
    assert.equal(plan.library.groups.find(group => group.id === newcomer.groupId).name, '远征队');
    // 自动模式替换：保留本地分组与启用状态
    assert.equal(plan.library.characters.find(item => item.id === 'c2').groupId, 'g1');
    assert.equal(ui.calls.closed, 1);
});

test('library 可以是函数：点击导入时按最新的库重算', () => {
    let current = localLibrary();
    const { document } = parseHTML('<!doctype html><html><body></body></html>');
    const confirmed = [];
    openCharacterImportDialog({
        document,
        library: () => current,
        parsed: sampleFile(),
        fileName: 'a.json',
        onConfirm: result => confirmed.push(result),
    });
    // 对话框打开后本地多了一个角色
    current = { ...current, characters: [...current.characters, char('late', '后来者')] };
    document.querySelector('[data-role="confirm"]').click();
    assert.equal(confirmed[0].plan.library.characters.some(item => item.id === 'late'), true);
});

test('onConfirm 抛错时对话框保持打开并显示错误', () => {
    const ui = mount({ onConfirm: () => { throw new TypeError('保存失败了'); } });
    ui.q('confirm').click();
    assert.ok(ui.document.querySelector('[data-role="overlay"]'));
    assert.equal(ui.calls.closed, 0);
    assert.match(ui.q('error').textContent, /保存失败了/);
});

test('按 Esc 关闭对话框并移除键盘监听，点遮罩与其他按键不关闭', () => {
    const ui = mount();
    ui.fire(ui.q('overlay'), 'click');
    ui.fire(ui.document, 'keydown', { key: 'Enter' });
    assert.ok(ui.document.querySelector('[data-role="overlay"]'));
    assert.equal(ui.calls.closed, 0);

    ui.fire(ui.document, 'keydown', { key: 'Escape' });
    assert.equal(ui.document.querySelector('[data-role="overlay"]'), null);
    assert.equal(ui.calls.closed, 1);
    assert.equal(ui.calls.confirm.length, 0);

    // 关闭后再按 Esc 不会重复触发 onClose
    ui.fire(ui.document, 'keydown', { key: 'Escape' });
    assert.equal(ui.calls.closed, 1);
});

test('取消按钮与 close() 都只关闭一次', () => {
    const ui = mount();
    ui.q('cancel').click();
    assert.equal(ui.document.querySelector('[data-role="overlay"]'), null);
    ui.handle.close();
    assert.equal(ui.calls.closed, 1);
    assert.equal(ui.calls.confirm.length, 0);
});

test('用户文本（文件名、分组名、角色名、警告文案）不会被当作 HTML', () => {
    const evil = '<img src=x onerror="globalThis.__pwned=1">';
    const parsed = fileOf(
        [char('c2', '芙蕾雅'), char('e1', evil, { groupId: 'fg' }), char('e2', evil)],
        [{ id: 'fg', name: evil }],
    );
    const library = {
        groups: [{ id: 'g1', name: evil }],
        characters: [char('c1', evil, { groupId: 'g1' }), char('c2', '芙蕾雅')],
    };
    const ui = mount({ parsed, library, fileName: `${evil}.json` });

    assert.equal(ui.document.querySelectorAll('img').length, 0);
    assert.equal(ui.document.querySelector('[data-meta="file"]').textContent, `${evil}.json`);
    // 分组下拉里的名字是文本
    const option = ui.q('group-select').querySelector('option');
    assert.equal(option.textContent, evil);
    // 新分组默认名来自文件名，同样只是 input 的 value
    ui.chooseMode('new-group');
    assert.equal(ui.document.querySelectorAll('img').length, 0);
    assert.equal(ui.q('new-group-name').value.includes('<img'), true);
    // 与现有启用角色同名的警告会带上角色名，仍然是文本
    assert.equal(ui.document.querySelectorAll('img').length, 0);
    const conflict = ui.document.querySelector('[data-warning="name-conflict"]');
    assert.ok(conflict);
    assert.equal(conflict.textContent.includes(evil), true);
    assert.equal(conflict.children.length, 0);
    assert.equal(globalThis.__pwned, undefined);
});

test('文件里没有任何可导入的角色时禁用导入', () => {
    const ui = mount({ parsed: fileOf([{ id: 'bad' }]) });
    assert.equal(ui.summaryText('skipped'), '跳过 1');
    assert.equal(ui.q('confirm').disabled, true);
    assert.match(ui.q('error').textContent, /没有可导入/);
});

test('缺少 document 或解析结果时抛 TypeError', () => {
    assert.throws(() => openCharacterImportDialog({ parsed: sampleFile() }), TypeError);
    const { document } = parseHTML('<!doctype html><html><body></body></html>');
    assert.throws(() => openCharacterImportDialog({ document, library: localLibrary() }), TypeError);
});

test('导出文件名：三种范围与分组名的安全处理', () => {
    assert.equal(buildCharacterExportFileName({ scope: 'all' }), 'character-tags.json');
    assert.equal(buildCharacterExportFileName({ scope: 'selection' }), 'character-tags-selection.json');
    assert.equal(buildCharacterExportFileName({ scope: 'group', groupName: '主线角色' }), 'character-tags-主线角色.json');
    assert.equal(buildCharacterExportFileName({ scope: 'group', groupName: 'a/b\\c:d*e?f"g<h>i|j' }), 'character-tags-abcdefghij.json');
    assert.equal(buildCharacterExportFileName({ scope: 'group', groupName: 'x\u0000y\u001fz\u007f' }), 'character-tags-xyz.json');
    assert.equal(buildCharacterExportFileName({ scope: 'group', groupName: '///' }), 'character-tags-group.json');
    assert.equal(buildCharacterExportFileName({ scope: 'group', groupName: '' }), 'character-tags-group.json');
    assert.equal(buildCharacterExportFileName({ scope: 'group' }), 'character-tags-group.json');
    assert.equal(buildCharacterExportFileName({ scope: 'group', groupName: '名字.. ' }), 'character-tags-名字.json');
    assert.ok(buildCharacterExportFileName({ scope: 'group', groupName: 'a'.repeat(200) }).length < 100);
});

test('新分组默认名：去扩展名、截断、空则回退', () => {
    assert.equal(defaultGroupNameFromFileName('character-tags-主线.json'), 'character-tags-主线');
    assert.equal(defaultGroupNameFromFileName('备份.JSON'), '备份');
    assert.equal(defaultGroupNameFromFileName('无扩展名'), '无扩展名');
    assert.equal(defaultGroupNameFromFileName('.json'), '导入的角色');
    assert.equal(defaultGroupNameFromFileName(''), '导入的角色');
    assert.equal(Array.from(defaultGroupNameFromFileName(`${'长'.repeat(50)}.json`)).length, 32);
});

// ── 导出对话框 ─────────────────────────────────────────

function exportLibrary() {
    return {
        groups: [{ id: 'g1', name: '主线' }, { id: 'g2', name: '宠物' }, { id: 'g3', name: '空组' }],
        characters: [
            char('c1', '阿璃'),
            char('c2', '芙蕾雅', { groupId: 'g1' }),
            char('c3', '路人甲', { groupId: 'g1' }),
            char('c4', '小猫', { groupId: 'g2' }),
        ],
    };
}

function mountExport({ library = exportLibrary(), selectedIds, onConfirm } = {}) {
    const { document, window } = parseHTML('<!doctype html><html><body><button id="opener">导出</button></body></html>');
    const calls = { confirm: [], closed: 0 };
    // linkedom 的 focus() 是空操作、没有 activeElement：补一个最小实现，才能验证焦点管理。
    let active = null;
    Object.defineProperty(document, 'activeElement', { get: () => active, configurable: true });
    window.HTMLElement.prototype.focus = function focus() { active = this; };
    document.getElementById('opener').focus();
    const handle = openCharacterExportDialog({
        document,
        library,
        selectedIds,
        onConfirm: onConfirm ?? ((choice) => { calls.confirm.push(choice); }),
        onClose: () => { calls.closed += 1; },
    });
    const q = role => document.querySelector(`[data-role="${role}"]`);
    const fire = (node, type, init) => {
        const event = new window.Event(type, { bubbles: true, cancelable: true });
        Object.assign(event, init);
        node.dispatchEvent(event);
        return event;
    };
    const choose = (mode) => {
        const radio = q(`scope-${mode}`);
        radio.checked = true;
        fire(radio, 'change');
    };
    const pickGroup = (groupId) => {
        const select = q('group-select');
        Array.from(select.querySelectorAll('option')).find(option => option.value === groupId).selected = true;
        fire(select, 'change');
    };
    const optionTexts = () => Array.from(q('group-select').querySelectorAll('option')).map(option => option.textContent);
    return { document, window, handle, calls, q, fire, choose, pickGroup, optionTexts };
}

test('导出对话框：没有多选时默认“全部”，“当前已选”禁用并给出原因', () => {
    const ui = mountExport();
    assert.equal(ui.q('scope-all').checked, true);
    assert.equal(ui.q('scope-group').checked, false);
    assert.equal(ui.q('scope-selection').checked, false);
    assert.equal(ui.q('scope-selection').disabled, true);
    assert.equal(ui.q('scope-all-label').textContent, '全部（4 个角色）');
    assert.equal(ui.q('scope-selection-label').textContent, '当前已选（0 个）');
    assert.equal(ui.q('scope-selection-hint').hasAttribute('hidden'), false);
    assert.equal(ui.q('scope-all-hint').hasAttribute('hidden'), true);
    assert.equal(ui.q('confirm').disabled, false);
    assert.equal(ui.q('dialog').getAttribute('role'), 'dialog');
    assert.equal(ui.q('dialog').getAttribute('aria-modal'), 'true');
});

test('导出对话框：有多选时默认“当前已选”，数量只算库里存在的 id 并去重', () => {
    const ui = mountExport({ selectedIds: ['c1', 'c4', 'c4', 'ghost'] });
    assert.equal(ui.q('scope-selection').checked, true);
    assert.equal(ui.q('scope-all').checked, false);
    assert.equal(ui.q('scope-selection').disabled, false);
    assert.equal(ui.q('scope-selection-label').textContent, '当前已选（2 个）');
    ui.q('confirm').click();
    assert.equal(ui.calls.confirm.length, 1);
    assert.deepEqual(ui.calls.confirm[0].request, { scope: 'selection', ids: ['c1', 'c4'] });
    assert.equal(ui.calls.confirm[0].scope, 'selection');
    assert.equal(ui.calls.confirm[0].count, 2);
    assert.equal(ui.calls.closed, 1, '确认后关闭');
    assert.equal(ui.document.querySelector('[data-role="overlay"]'), null);
});

test('导出对话框：selectedIds 和 library 都可以传函数，并在打开时读取', () => {
    let reads = 0;
    const ui = mountExport({
        library: () => { reads += 1; return exportLibrary(); },
        selectedIds: () => ['c2'],
    });
    assert.equal(reads, 1);
    assert.equal(ui.q('scope-selection-label').textContent, '当前已选（1 个）');
});

test('导出对话框：“全部”提交 { scope: all }', () => {
    const ui = mountExport();
    ui.q('confirm').click();
    assert.deepEqual(ui.calls.confirm[0].request, { scope: 'all' });
    assert.equal(ui.calls.confirm[0].count, 4);
});

test('导出对话框：分组下拉列出每个分组及其角色数，未分组有角色才出现，空分组禁用', () => {
    const ui = mountExport();
    assert.deepEqual(ui.optionTexts(), ['未分组（1 个）', '主线（2 个）', '宠物（1 个）', '空组（0 个，无可导出）']);
    const options = Array.from(ui.q('group-select').querySelectorAll('option'));
    assert.deepEqual(options.map(option => option.hasAttribute('disabled')), [false, false, false, true]);
    // 默认指向第一个有角色的项
    assert.equal(options.find(option => option.selected).value, '');
    assert.equal(ui.q('group-select').disabled, false);

    // 未分组为空时不列出
    const noLoose = exportLibrary();
    noLoose.characters = noLoose.characters.filter(item => item.id !== 'c1');
    const second = mountExport({ library: noLoose });
    assert.deepEqual(second.optionTexts(), ['主线（2 个）', '宠物（1 个）', '空组（0 个，无可导出）']);
    assert.equal(Array.from(second.q('group-select').querySelectorAll('option')).find(option => option.selected).value, 'g1');
});

test('导出对话框：选择分组提交该分组的范围，操作下拉会顺带选中“某个分组”', () => {
    const ui = mountExport();
    ui.pickGroup('g2');
    assert.equal(ui.q('scope-group').checked, true);
    assert.equal(ui.q('scope-all').checked, false);
    ui.q('confirm').click();
    const [choice] = ui.calls.confirm;
    assert.deepEqual(choice.request, { scope: 'group', groupId: 'g2' });
    assert.equal(choice.groupName, '宠物');
    assert.equal(choice.count, 1);

    // 未分组 = 空串 id
    const loose = mountExport();
    loose.pickGroup('');
    loose.q('confirm').click();
    assert.deepEqual(loose.calls.confirm[0].request, { scope: 'group', groupId: '' });
    assert.equal(loose.calls.confirm[0].groupName, '未分组');
});

test('导出对话框：没有分组（或所有分组都是空的）时“某个分组”不可用', () => {
    const flat = mountExport({ library: { groups: [], characters: [char('c1', '阿璃')] } });
    assert.equal(flat.q('scope-group').disabled, true);
    assert.equal(flat.q('group-select').disabled, true);
    assert.equal(flat.q('scope-group-hint').hasAttribute('hidden'), false);

    const allEmpty = mountExport({ library: { groups: [{ id: 'g1', name: '空组' }], characters: [char('c1', '阿璃')] } });
    assert.equal(allEmpty.q('scope-group').disabled, true, '只有未分组有角色、另一个分组是空的：可选项只剩“未分组”，与“全部”等价，不开放');
    assert.equal(allEmpty.q('group-select').disabled, true);
    assert.equal(allEmpty.q('scope-group-hint').hasAttribute('hidden'), false);

    const mixed = mountExport({ library: { groups: [{ id: 'g1', name: '主线' }], characters: [char('c1', '阿璃'), char('c2', '小猫', { groupId: 'g1' })] } });
    assert.equal(mixed.q('scope-group').disabled, false, '未分组有角色且另有含角色的分组：开放');

    const onlyGroup = mountExport({ library: { groups: [{ id: 'g1', name: '主线' }], characters: [char('c1', '阿璃', { groupId: 'g1' })] } });
    assert.equal(onlyGroup.q('scope-group').disabled, false, '全部角色都在一个分组里：该分组是真正的分组，仍可单选');

    const onlyEmptyGroups = mountExport({ library: { groups: [{ id: 'g1', name: '空组' }], characters: [] } });
    assert.equal(onlyEmptyGroups.q('scope-group').disabled, true);
    assert.equal(onlyEmptyGroups.q('scope-all').disabled, true);
    assert.equal(onlyEmptyGroups.q('confirm').disabled, true, '一个角色都没有时不能导出');
    onlyEmptyGroups.q('confirm').click();
    assert.equal(onlyEmptyGroups.calls.confirm.length, 0);
});

test('导出对话框：被禁用的单选框不能被强行选中', () => {
    const ui = mountExport();
    ui.choose('selection');
    assert.equal(ui.q('scope-selection').checked, false, '无多选时点“当前已选”被恢复');
    assert.equal(ui.q('scope-all').checked, true);
    ui.q('confirm').click();
    assert.deepEqual(ui.calls.confirm[0].request, { scope: 'all' });
});

test('导出对话框：取消、Esc、点遮罩都不会触发导出，且只关闭一次', () => {
    const cancel = mountExport();
    cancel.q('cancel').click();
    assert.equal(cancel.calls.confirm.length, 0);
    assert.equal(cancel.calls.closed, 1);
    assert.equal(cancel.document.querySelector('[data-role="overlay"]'), null);

    const esc = mountExport();
    esc.fire(esc.document, 'keydown', { key: 'Escape' });
    assert.equal(esc.calls.confirm.length, 0);
    assert.equal(esc.calls.closed, 1);
    esc.fire(esc.document, 'keydown', { key: 'Escape' });
    assert.equal(esc.calls.closed, 1, '关闭后不会重复触发');

    const backdrop = mountExport();
    backdrop.fire(backdrop.q('dialog'), 'click');
    assert.ok(backdrop.q('overlay'), '点在面板内部不关闭');
    backdrop.fire(backdrop.q('overlay'), 'click');
    assert.equal(backdrop.q('overlay'), null);
    assert.equal(backdrop.calls.confirm.length, 0);
    assert.equal(backdrop.calls.closed, 1);
});

test('导出对话框：onConfirm 抛错时保持打开并显示错误，下次成功才关闭', () => {
    let fail = true;
    const ui = mountExport({
        onConfirm: () => { if (fail) throw new TypeError('没有可导出的角色'); },
    });
    ui.q('confirm').click();
    assert.ok(ui.q('overlay'));
    assert.equal(ui.q('error').hasAttribute('hidden'), false);
    assert.match(ui.q('error').textContent, /没有可导出的角色/);
    assert.equal(ui.handle.element.isConnected, true);
    fail = false;
    ui.q('confirm').click();
    assert.equal(ui.q('overlay'), null);
});

test('导出对话框：焦点进入对话框，关闭后还给原来的元素；Tab 在对话框内循环', () => {
    const ui = mountExport();
    const opener = ui.document.getElementById('opener');
    assert.equal(ui.document.activeElement, ui.q('scope-all'));
    ui.q('confirm').focus();
    const forward = ui.fire(ui.document, 'keydown', { key: 'Tab' });
    assert.equal(forward.defaultPrevented, true, '最后一个控件按 Tab 回到第一个');
    assert.equal(ui.document.activeElement, ui.q('scope-all'));
    ui.q('scope-all').focus();
    ui.fire(ui.document, 'keydown', { key: 'Tab', shiftKey: true });
    assert.equal(ui.document.activeElement, ui.q('confirm'));
    ui.q('cancel').click();
    assert.equal(ui.document.activeElement, opener);
});

test('导出对话框：用户文本只作文本，不会被当作 HTML', () => {
    const evil = '<img src=x onerror="globalThis.__pwned=1">';
    const ui = mountExport({
        library: { groups: [{ id: 'g1', name: evil }], characters: [char('c1', evil, { groupId: 'g1' })] },
    });
    assert.equal(ui.document.querySelectorAll('img').length, 0);
    assert.equal(ui.optionTexts()[0], `${evil}（1 个）`);
    assert.equal(globalThis.__pwned, undefined);
});

test('导出对话框：缺少 document 时抛 TypeError；重复打开互不影响', () => {
    assert.throws(() => openCharacterExportDialog({ library: exportLibrary() }), TypeError);
    const first = mountExport();
    const second = mountExport();
    first.q('cancel').click();
    assert.ok(second.q('overlay'));
});

test('describeExportScopes：各范围的数量', () => {
    const info = describeExportScopes(exportLibrary(), ['c1', 'c1', 'nope', 'c3']);
    assert.equal(info.total, 4);
    assert.deepEqual(info.selected, ['c1', 'c3']);
    assert.deepEqual(info.groups, [
        { id: '', name: '未分组', count: 1 },
        { id: 'g1', name: '主线', count: 2 },
        { id: 'g2', name: '宠物', count: 1 },
        { id: 'g3', name: '空组', count: 0 },
    ]);
    // 指向不存在分组的角色按未分组统计（与 getGroupedView 一致）
    const orphan = describeExportScopes({ groups: [], characters: [char('x', '孤儿', { groupId: 'gone' })] });
    assert.deepEqual(orphan.groups, [{ id: '', name: '未分组', count: 1 }]);
    assert.deepEqual(describeExportScopes(null), { total: 0, groups: [], selected: [] });
});

test('导入预览里的“已启用”和 500 警告按有效启用计：已关闭分组里的角色不计入', () => {
    const characters = Array.from({ length: 600 }, (_, index) => char(`l${index}`, `本地${index}`, { groupId: 'big' }));
    const library = { groups: [{ id: 'big', name: '大组', enabled: false }], characters };
    const parsed = fileOf([char('n1', '新甲'), char('n2', '新乙')]);
    const ui = mount({ library, parsed });
    assert.match(ui.q('total').textContent, /共 602 个角色，已启用 2 个/, '600 个本地角色在已关闭分组里，不计入');
    assert.equal(ui.q('limit-warning').hasAttribute('hidden'), true);

    // 分组是开的时候同样的库会超过 500
    const open = mount({ library: { groups: [{ id: 'big', name: '大组' }], characters }, parsed });
    assert.match(open.q('total').textContent, /已启用 602 个/);
    assert.equal(open.q('limit-warning').hasAttribute('hidden'), false);
});
