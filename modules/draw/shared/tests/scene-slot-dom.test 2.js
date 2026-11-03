import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { getRenderedSceneSlotIds, replaceSceneSlotElements } from '../scene-slot-dom.js';

function message(markup) {
    const { document } = parseHTML(`<html><body><div id="message">${markup}</div></body></html>`);
    return document.getElementById('message');
}

function card(slotId, label = 'IMAGE', state = 'preview') {
    return { slotId, html: `<div class="xb-nd-img" data-slot-id="${slotId}" data-state="${state}">${label}</div>` };
}

const layouts = {
    paragraph: '<p>BEFORE[image:slot-a]<br>AFTER</p>',
    wrapper: '<div><p>BEFORE</p>[image:slot-a]<p>AFTER</p></div>',
    quote: '<blockquote><p>BEFORE[image:slot-a]<em>AFTER</em></p></blockquote>',
    inline: '<p><em>BEFORE<span>[image:slot-a]AFTER</span></em></p>',
    list: '<ul><li>BEFORE[image:slot-a]AFTER</li><li>END</li></ul>',
    root: 'BEFORE[image:slot-a]AFTER',
    separate: '<p>BEFORE</p><p>[image:slot-a]</p><p>AFTER</p>',
};

for (const [name, markup] of Object.entries(layouts)) {
    test(`rendering an image in ${name} keeps it between preceding and following prose`, () => {
        const root = message(markup);
        const proseElements = [...root.querySelectorAll('*')];

        const rendered = replaceSceneSlotElements(root, [card('slot-a')]);

        assert.deepEqual([...rendered], ['slot-a']);
        assert.equal(root.textContent, `BEFOREIMAGEAFTER${name === 'list' ? 'END' : ''}`);
        assert.equal(root.querySelectorAll('.xb-nd-img').length, 1);
        for (const element of proseElements) assert.equal(root.contains(element), true);
    });
}

test('multiple images follow their text slots, independent of response order', () => {
    const root = message('<div>A[image:one]B[image:two]<em>C[image:three]D</em></div>');

    replaceSceneSlotElements(root, [card('three', '3'), card('two', '2'), card('one', '1')]);

    assert.equal(root.textContent, 'A1B2C3D');
    assert.deepEqual([...root.querySelectorAll('.xb-nd-img')].map(node => node.dataset.slotId), ['one', 'two', 'three']);
});

test('pending, completed, refreshed and failed cards retain the same location', () => {
    const source = '<div>BEFORE[image:slot-a]AFTER</div>';
    const root = message(source);
    const onlyPending = { shouldReplaceExisting: element => element.dataset.state === 'pending' };
    replaceSceneSlotElements(root, [card('slot-a', 'WAIT', 'pending')], onlyPending);
    assert.equal(root.textContent, 'BEFOREWAITAFTER');
    replaceSceneSlotElements(root, [card('slot-a', 'IMAGE')], onlyPending);
    assert.equal(root.textContent, 'BEFOREIMAGEAFTER');

    const completed = root.querySelector('.xb-nd-img');
    assert.equal(replaceSceneSlotElements(root, [card('slot-a', 'WAIT', 'pending')], onlyPending).size, 0);
    assert.equal(root.querySelector('.xb-nd-img'), completed);

    replaceSceneSlotElements(root, [card('slot-a', 'FAILED', 'failed')]);
    assert.equal(root.textContent, 'BEFOREFAILEDAFTER');
    assert.equal(root.querySelectorAll('.xb-nd-img').length, 1);

    const restored = message(source);
    replaceSceneSlotElements(restored, [card('slot-a')]);
    assert.equal(restored.textContent, 'BEFOREIMAGEAFTER');
});

test('text replacement preserves literal text, attributes and live sibling elements', () => {
    const root = message('<div data-example="[image:attribute]">&lt;em&gt;BEFORE&lt;/em&gt;[image:slot-a]<button>AFTER</button></div>');
    const wrapper = root.firstElementChild;
    const button = root.querySelector('button');
    let clicks = 0;
    button.addEventListener('click', () => { clicks += 1; });

    const rendered = replaceSceneSlotElements(root, [card('slot-a'), card('attribute')]);

    assert.deepEqual([...rendered], ['slot-a']);
    assert.equal(root.textContent, '<em>BEFORE</em>IMAGEAFTER');
    assert.equal(root.querySelector('em'), null);
    assert.equal(root.firstElementChild, wrapper);
    assert.equal(wrapper.dataset.example, '[image:attribute]');
    assert.equal(root.querySelector('button'), button);
    button.click();
    assert.equal(clicks, 1);
});

test('missing slots and invalid card markup neither remove text nor append an image', () => {
    const root = message('BEFORE[image:slot-a]AFTER');

    const rendered = replaceSceneSlotElements(root, [card('absent'), { slotId: 'slot-a', html: 'not an element' }]);

    assert.equal(rendered.size, 0);
    assert.equal(root.textContent, 'BEFORE[image:slot-a]AFTER');
    assert.equal(root.querySelector('.xb-nd-img'), null);
});

test('slot syntax uses the existing marker contract and skips text inside image cards', () => {
    const root = message('<div class="xb-nd-img" data-slot-id="existing">[image:nested]</div>BEFORE[IMAGE : slot-a]AFTER');

    const rendered = replaceSceneSlotElements(root, [card('nested'), card('slot-a')]);

    assert.deepEqual([...rendered], ['slot-a']);
    assert.equal(root.textContent, '[image:nested]BEFOREIMAGEAFTER');
    assert.equal(root.querySelectorAll('.xb-nd-img').length, 2);
});

test('markers split by line breaks and inline wrappers preserve outside breaks and live elements', () => {
    const root = message('<p>BEFORE<br id="before">[im<span>age\t<br>:<br>slot-a</span>]<br id="after"><button>AFTER</button></p>');
    const wrapper = root.querySelector('span');
    const before = root.querySelector('#before');
    const after = root.querySelector('#after');
    const button = root.querySelector('button');
    let clicks = 0;
    button.addEventListener('click', () => { clicks += 1; });

    assert.deepEqual([...getRenderedSceneSlotIds(root)], ['slot-a']);
    assert.deepEqual([...replaceSceneSlotElements(root, [card('slot-a')])], ['slot-a']);

    assert.equal(root.textContent, 'BEFOREIMAGEAFTER');
    assert.deepEqual([...root.querySelectorAll('br')], [before, after]);
    assert.equal(root.contains(wrapper), true);
    assert.equal(root.querySelector('button'), button);
    button.click();
    assert.equal(clicks, 1);
    assert.deepEqual([...getRenderedSceneSlotIds(root)], ['slot-a']);
});

test('multiple split markers sharing text nodes retain order and replace only the first occurrence', () => {
    const root = message('A[image:<br>one]B[image:<br>two]C[image:three]D[image:one]E');

    replaceSceneSlotElements(root, [card('three', '3'), card('two', '2'), card('one', '1')]);

    assert.equal(root.textContent, 'A1B2C3D[image:one]E');
    assert.equal(root.querySelectorAll('br').length, 0);
    assert.deepEqual([...root.querySelectorAll('.xb-nd-img')].map(node => node.dataset.slotId), ['one', 'two', 'three']);
});

test('paragraph boundaries are whitespace, not missing characters within marker names or ids', () => {
    const root = message('<p>BEFORE[image</p><p>: slot-a]AFTER</p><p>[im</p><p>age:wrong]</p><p>[image:bad</p><p>-id]</p>');
    const paragraphs = [...root.querySelectorAll('p')];

    assert.deepEqual([...getRenderedSceneSlotIds(root)], ['slot-a']);
    assert.deepEqual([...replaceSceneSlotElements(root, [card('slot-a'), card('wrong'), card('bad-id')])], ['slot-a']);
    assert.deepEqual([...root.querySelectorAll('p')], paragraphs);
    assert.equal(root.textContent, 'BEFOREIMAGEAFTER[image:wrong][image:bad-id]');
});

test('cards, controls and media are opaque boundaries for both detection and replacement', () => {
    const root = message('<p>[image:<button></button>button-gap]</p><p>[image:<img src="local.png">image-gap]</p><p>[image:<div class="xb-nd-img" data-slot-id="existing">[image:nested]</div>card-gap]</p><button>[image:button-label]</button><textarea>[image:editor]</textarea><div data-marker="[image:attribute]"></div>');
    const markup = root.innerHTML;

    assert.deepEqual([...getRenderedSceneSlotIds(root)], ['existing']);
    const candidates = ['button-gap', 'image-gap', 'card-gap', 'nested', 'button-label', 'editor', 'attribute'];
    assert.equal(replaceSceneSlotElements(root, candidates.map(slotId => card(slotId))).size, 0);
    assert.equal(root.innerHTML, markup);
});
