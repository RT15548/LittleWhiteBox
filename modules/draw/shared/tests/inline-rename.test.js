// 就地改名辅助：linkedom 的真实 DOM，焦点事件手动派发（linkedom 的 blur() 不会触发 focusout）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';

import { bindInlineRename } from '../inline-rename.js';

function setup(onCommit, selector) {
    const { document, Event } = parseHTML('<!doctype html><html><body><div id="box"><input class="inline-name" value="甲"><input class="other" value="x"></div></body></html>');
    const box = document.getElementById('box');
    const input = box.querySelector('.inline-name');
    const off = bindInlineRename(box, { onCommit, selector });
    const fire = (type, target = input, init = {}) => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.assign(event, init);
        target.dispatchEvent(event);
        return event;
    };
    // 用户点进输入框、改字、离开
    const edit = (value) => { fire('focusin'); input.value = value; fire('focusout'); };
    return { document, box, input, fire, edit, off };
}

test('a changed name is committed trimmed on blur with the original name', () => {
    const calls = [];
    const { edit, input } = setup((node, name, from) => { calls.push([node, name, from]); });
    edit('  乙  ');
    assert.deepEqual(calls, [[input, '乙', '甲']]);
    assert.equal(input.value, '乙');
    assert.equal(input.dataset.baseline, undefined, '基线随提交清掉');
});

test('an unchanged or empty name commits nothing and puts the original back', () => {
    const calls = [];
    const { edit, input } = setup((node, name) => { calls.push(name); });
    edit('甲');
    edit('  甲 ');
    assert.equal(input.value, '甲');
    edit('   ');
    assert.equal(input.value, '甲', '空名字还原');
    assert.deepEqual(calls, []);
});

test('a rejected commit (onCommit returns false) restores the original name', () => {
    const { edit, input } = setup(() => false);
    edit('乙');
    assert.equal(input.value, '甲');
    const accepted = setup(() => undefined);
    accepted.edit('乙');
    assert.equal(accepted.input.value, '乙');
});

test('Enter blurs (which commits), Esc restores the value and is consumed, IME composition is ignored', () => {
    const calls = [];
    const { input, fire } = setup((node, name) => { calls.push(name); });
    let blurred = 0;
    input.blur = () => { blurred += 1; };
    fire('focusin');
    input.value = '乙';
    const enter = fire('keydown', input, { key: 'Enter' });
    assert.equal(blurred, 1);
    assert.equal(enter.defaultPrevented, true);
    fire('keydown', input, { key: 'Enter', isComposing: true });
    assert.equal(blurred, 1, '输入法组字中的 Enter 不算确认');

    input.value = '丙';
    const esc = fire('keydown', input, { key: 'Escape' });
    assert.equal(input.value, '甲', 'Esc 还原成聚焦时的名字');
    assert.equal(esc.defaultPrevented, true);
    fire('focusout');
    assert.deepEqual(calls, [], 'Esc 之后失焦不提交');
});

test('only inputs matching the selector inside the container are handled, and off() unbinds', () => {
    const calls = [];
    const { box, fire, edit, off } = setup((node, name) => { calls.push(name); });
    const other = box.querySelector('.other');
    fire('focusin', other);
    other.value = '改';
    fire('focusout', other);
    assert.deepEqual(calls, []);
    edit('乙');
    assert.deepEqual(calls, ['乙']);
    off();
    edit('丙');
    assert.deepEqual(calls, ['乙']);

    const custom = setup((node, name) => { calls.push(`custom:${name}`); }, '.other');
    custom.fire('focusin', custom.box.querySelector('.other'));
    custom.box.querySelector('.other').value = '新';
    custom.fire('focusout', custom.box.querySelector('.other'));
    assert.equal(calls.at(-1), 'custom:新');
});

test('rows that are re-rendered keep working because the listeners live on the container', () => {
    const calls = [];
    const { box, fire } = setup((node, name) => { calls.push(name); });
    box.innerHTML = '<input class="inline-name" value="新行">';
    const fresh = box.querySelector('.inline-name');
    fire('focusin', fresh);
    fresh.value = '改名';
    fire('focusout', fresh);
    assert.deepEqual(calls, ['改名']);
});

test('the in-place name look lives in the shared shell stylesheet: bold text that shows a box on hover and focus', () => {
    const shell = readFileSync(new URL('../settings-shell.css', import.meta.url), 'utf8');
    assert.match(shell, /\.inline-name\s*\{[^}]*border:\s*1px solid transparent/);
    assert.match(shell, /\.inline-name:hover\s*\{[^}]*border-color:\s*var\(--border\)/);
    assert.match(shell, /\.inline-name:focus\s*\{[^}]*border-color:\s*var\(--border-focus\)/);
});

test('the agent settings surface does not box the in-place name inputs with its generic input styling', () => {
    // 事故：.xb-agent-settings-surface .xb-assistant-config input:not(...) 的优先级高于 .inline-name，场景 Agent 预设名被画成带边框的输入框。
    const surface = readFileSync(new URL('../../../agent-core/ui/settings-surface.css', import.meta.url), 'utf8');
    assert.match(surface, /input:not\(\[type="checkbox"\]\):not\(\[type="radio"\]\):not\(\.inline-name\),/);
    assert.match(surface, /input:not\(\.inline-name\):focus,/);
    assert.doesNotMatch(surface, /\.xb-assistant-config input:focus/);
});
