import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import {
    MAX_IMAGES_INVALID_INPUT_MESSAGE,
    fillMaxImagesSelect,
    getMaxImagesSelectOptions,
    normalizeMaxImagesOverride,
    parseCustomMaxImagesInput,
    resolveEffectiveMaxImages,
    resolveMaxImagesChange,
} from '../max-images-override.js';

test('normalizeMaxImagesOverride keeps only integers in 1-20', () => {
    for (const value of [1, 3, 20, '4', ' 7 ']) assert.equal(normalizeMaxImagesOverride(value), Number(value));
    for (const value of [0, 21, -1, 2.5, '2.5', '', '  ', 'abc', '1e1', NaN, Infinity, null, undefined, true, {}, []]) {
        assert.equal(normalizeMaxImagesOverride(value), null, String(value));
    }
});

test('resolveEffectiveMaxImages prefers a valid override and otherwise follows the preset', () => {
    assert.equal(resolveEffectiveMaxImages({ overrideMaxImages: 5 }, { maxImages: 2 }), 5);
    assert.equal(resolveEffectiveMaxImages({ overrideMaxImages: null }, { maxImages: 2 }), 2);
    assert.equal(resolveEffectiveMaxImages({}, { maxImages: 0 }), 0);
    assert.equal(resolveEffectiveMaxImages({ overrideMaxImages: 99 }, { maxImages: 4 }), 4);
    assert.equal(resolveEffectiveMaxImages(undefined, undefined), 0);
});

test('select options mirror the override value', () => {
    const labels = (override) => getMaxImagesSelectOptions(override).map(o => `${o.selected ? '*' : ''}${o.label}`);
    assert.deepEqual(labels(null), ['*跟随预设', '3', '5', '7', '自定义…']);
    assert.deepEqual(labels(5), ['跟随预设', '3', '*5', '7', '自定义…']);
    assert.deepEqual(labels(4), ['跟随预设', '3', '5', '7', '*自定义（4）', '自定义…']);
    assert.deepEqual(labels('bad'), ['*跟随预设', '3', '5', '7', '自定义…']);
});

test('fillMaxImagesSelect rebuilds options and selection', () => {
    const { document } = parseHTML('<html><body><select></select></body></html>');
    const select = document.querySelector('select');
    fillMaxImagesSelect(select, 7);
    assert.equal(select.value, '7');
    fillMaxImagesSelect(select, null);
    assert.equal(select.value, 'default');
    assert.equal(select.querySelectorAll('option').length, 5);
});

test('custom input parsing accepts 1-20 integers, including full-width digits', () => {
    assert.deepEqual(parseCustomMaxImagesInput(null), { status: 'cancel' });
    assert.deepEqual(parseCustomMaxImagesInput('4'), { status: 'ok', value: 4 });
    assert.deepEqual(parseCustomMaxImagesInput('１２'), { status: 'ok', value: 12 });
    for (const bad of ['', '0', '21', '3.5', 'x']) assert.deepEqual(parseCustomMaxImagesInput(bad), { status: 'invalid' });
});

test('resolveMaxImagesChange maps selections to override writes', () => {
    assert.deepEqual(resolveMaxImagesChange('default', 5), { type: 'set', value: null });
    assert.deepEqual(resolveMaxImagesChange('5', null), { type: 'set', value: 5 });
    assert.deepEqual(resolveMaxImagesChange('garbage', 5), { type: 'keep' });

    const notices = [];
    const notify = (m) => notices.push(m);
    assert.deepEqual(resolveMaxImagesChange('custom', 3, { prompt: () => '9', notify }), { type: 'set', value: 9 });
    assert.deepEqual(resolveMaxImagesChange('custom', 3, { prompt: () => null, notify }), { type: 'keep' });
    assert.deepEqual(notices, []);
    assert.deepEqual(resolveMaxImagesChange('custom', 3, { prompt: () => '99', notify }), { type: 'keep' });
    assert.deepEqual(notices, [MAX_IMAGES_INVALID_INPUT_MESSAGE]);
    // Prompt receives the current value as the default text.
    let seen;
    resolveMaxImagesChange('custom', 4, { prompt: (_m, fallback) => { seen = fallback; return null; } });
    assert.equal(seen, '4');
    // No prompt available: keep and tell the user.
    assert.deepEqual(resolveMaxImagesChange('custom', null, { notify }), { type: 'keep' });
    assert.equal(notices.length, 2);
});
