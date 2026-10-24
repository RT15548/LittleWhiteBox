// SD / ComfyUI 角色库界面：分组名就地改名（没有“重命名分组”按钮和 prompt 弹窗），校验沿用 renameGroup，重名被拒时提示并还原；
// 拖拽落点标记用共享的 drop-before / drop-after / drop-into 类（不再是 lwb-cl-drop-*），移动中出现、取消后清掉。
import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';

import { createCharacterLibraryUi } from '../character-library-ui.js';

function mount(t) {
    const { document, window } = parseHTML('<html><body><div id="tools"></div><div id="list"></div></body></html>');
    const characters = [
        { id: 'c1', name: '甲', groupId: 'g1' },
        { id: 'c2', name: '乙' },
    ];
    const errors = [];
    const env = { hit: null, rects: new Map() }; // 拖拽用：指针命中的元素与各元素的矩形由测试指定
    const ui = createCharacterLibraryUi({
        document,
        listElement: document.getElementById('list'),
        toolbarElement: document.getElementById('tools'),
        readCharacters: () => characters.map(character => ({ ...character })),
        renderCard: ({ character }) => {
            const card = document.createElement('div');
            card.setAttribute('class', 'sd-char-card');
            card.dataset.characterId = character.id;
            card.innerHTML = '<div class="sd-char-card-title"></div>';
            return card;
        },
        renderEmpty: () => document.createElement('div'),
        notify: { error: message => errors.push(message) },
        prompt: () => { throw new Error('不应再弹 prompt'); },
        hitTest: () => env.hit,
        getRect: element => env.rects.get(element) ?? { top: 0, bottom: 20 },
    });
    t.after(() => ui.destroy());
    ui.render({ characters, groups: [{ id: 'g1', name: '组一' }, { id: 'g2', name: '组二' }] });
    const nameInput = id => document.querySelector(`.lwb-cl-group[data-group-id="${id}"] .lwb-cl-group-name`);
    const edit = (input, value) => {
        const fire = type => input.dispatchEvent(new window.Event(type, { bubbles: true, cancelable: true }));
        fire('focusin');
        input.value = value;
        fire('focusout');
    };
    return { document, window, ui, errors, nameInput, edit, env };
}

test('a real group name is an in-place input and the rename icon is gone; the ungrouped name stays plain text', t => {
    const { document, nameInput } = mount(t);
    assert.equal(nameInput('g1').tagName, 'INPUT');
    assert.equal(nameInput('g1').classList.contains('inline-name'), true);
    assert.equal(nameInput('g1').value, '组一');
    assert.equal(document.querySelector('[data-lwb-group-action="rename"]'), null);
    const ungrouped = document.querySelector('.lwb-cl-group[data-group-id=""] .lwb-cl-group-name');
    assert.ok(ungrouped);
    assert.notEqual(ungrouped.tagName, 'INPUT');
});

test('editing a group name renames it in the draft library; a duplicate or empty name is refused and restored', t => {
    const { ui, errors, nameInput, edit } = mount(t);
    edit(nameInput('g1'), '  新组名 ');
    assert.deepEqual(ui.getGroups().map(group => group.name), ['新组名', '组二']);
    assert.equal(nameInput('g1').value, '新组名', '重绘后显示新名字');

    edit(nameInput('g1'), '组二');
    assert.equal(errors.length, 1, '重名由 renameGroup 拒绝并提示');
    assert.deepEqual(ui.getGroups().map(group => group.name), ['新组名', '组二']);
    assert.equal(nameInput('g1').value, '新组名');

    edit(nameInput('g1'), '   ');
    assert.deepEqual(ui.getGroups().map(group => group.name), ['新组名', '组二']);
    assert.equal(nameInput('g1').value, '新组名');
});

test('dragging a card shows the shared drop-before / drop-after / drop-into markers while moving and clears them on release', t => {
    const { document, window, ui, env } = mount(t);
    const handle = document.querySelector('[data-drag-char="c1"]');
    assert.ok(handle);
    const event = (type, init = {}) => Object.assign(new window.Event(type, { bubbles: true, cancelable: true }), { pointerId: 1, button: 0, clientX: 5, clientY: 0, ...init });
    const marked = () => Array.from(document.querySelectorAll('.drop-before, .drop-after, .drop-into'));
    assert.equal(document.querySelector('[class*="lwb-cl-drop"]'), null, '旧的 lwb-cl-drop-* 类名已不存在');

    handle.dispatchEvent(event('pointerdown'));
    assert.equal(marked().length, 0, '没动之前没有落点标记');
    // 指针落到另一个分组的头部：放进该分组（虚线框）
    const header = document.querySelector('.lwb-cl-group[data-group-id="g2"] .lwb-cl-group-header');
    env.hit = header;
    document.dispatchEvent(event('pointermove', { clientY: 40 }));
    assert.deepEqual(marked().map(node => [node, node.classList.contains('drop-into')]), [[header, true]]);
    assert.equal(document.querySelector('.lwb-cl-dragging')?.dataset.characterId, 'c1', '被拖的卡变淡');

    // 指针落到“未分组”里的卡 c2 的下半部分：线画在它下面
    const target = document.querySelector('.sd-char-card[data-character-id="c2"]');
    env.hit = target;
    env.rects.set(target, { top: 100, bottom: 140 });
    document.dispatchEvent(event('pointermove', { clientY: 130 }));
    assert.deepEqual(marked().map(node => [node, node.classList.contains('drop-after')]), [[target, true]], '旧标记换成新的，同时只有一处');

    // 取消（Esc / 系统打断）：标记与淡化都清掉，不改库
    const before = JSON.stringify(ui.getLibrary());
    document.dispatchEvent(event('pointercancel'));
    assert.equal(marked().length, 0);
    assert.equal(document.querySelector('.lwb-cl-dragging'), null);
    assert.equal(JSON.stringify(ui.getLibrary()), before);
});
