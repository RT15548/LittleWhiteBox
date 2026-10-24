// SD / ComfyUI 角色库界面：分组名就地改名（没有“重命名分组”按钮和 prompt 弹窗），校验沿用 renameGroup，重名被拒时提示并还原。
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
    return { document, ui, errors, nameInput, edit };
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
