import assert from 'node:assert/strict';
import test from 'node:test';
import {
    MAX_IMAGES_INVALID_INPUT_MESSAGE,
    buildMaxImagesSavedMessage,
    buildMaxImagesInputTitle,
    describePresetMaxImages,
    normalizeMaxImagesOverride,
    parseMaxImagesInput,
    resolveEffectiveMaxImages,
} from '../max-images-override.js';

test('normalizeMaxImagesOverride keeps only integers in 0-20 (0 = override to unspecified)', () => {
    for (const value of [0, 1, 3, 20, '0', '4', ' 7 ']) assert.equal(normalizeMaxImagesOverride(value), Number(value));
    assert.equal(Object.is(normalizeMaxImagesOverride(0), 0), true);
    for (const value of [21, -1, 2.5, '2.5', '', '  ', 'abc', '1e1', NaN, Infinity, null, undefined, true, {}, []]) {
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

test('resolveEffectiveMaxImages: 0 is a real override, only null/undefined follows the preset', () => {
    assert.equal(resolveEffectiveMaxImages({ overrideMaxImages: 0 }, { maxImages: 5 }), 0);
    assert.equal(resolveEffectiveMaxImages({ overrideMaxImages: '0' }, { maxImages: 5 }), 0);
    assert.equal(resolveEffectiveMaxImages({ overrideMaxImages: 0 }, undefined), 0);
    assert.equal(resolveEffectiveMaxImages({ overrideMaxImages: null }, { maxImages: 5 }), 5);
    assert.equal(resolveEffectiveMaxImages({}, { maxImages: 5 }), 5);
    assert.equal(resolveEffectiveMaxImages(undefined, { maxImages: 5 }), 5);
    assert.equal(resolveEffectiveMaxImages({ overrideMaxImages: 3 }, { maxImages: 5 }), 3);
    // Out-of-range / junk stored values are not a 0 override: they follow the preset.
    assert.equal(resolveEffectiveMaxImages({ overrideMaxImages: -1 }, { maxImages: 5 }), 5);
    assert.equal(resolveEffectiveMaxImages({ overrideMaxImages: '' }, { maxImages: 5 }), 5);
    assert.equal(resolveEffectiveMaxImages({ overrideMaxImages: false }, { maxImages: 5 }), 5);
});

test('parseMaxImagesInput maps input text to empty / ok / invalid', () => {
    assert.deepEqual(parseMaxImagesInput(''), { status: 'empty' });
    assert.deepEqual(parseMaxImagesInput('   '), { status: 'empty' });
    assert.deepEqual(parseMaxImagesInput(null), { status: 'empty' });
    assert.deepEqual(parseMaxImagesInput('0'), { status: 'ok', value: 0 }, '0 is a valid override, not empty');
    assert.deepEqual(parseMaxImagesInput(' 0 '), { status: 'ok', value: 0 });
    assert.deepEqual(parseMaxImagesInput('０'), { status: 'ok', value: 0 }, 'full-width zero');
    assert.deepEqual(parseMaxImagesInput('1'), { status: 'ok', value: 1 });
    assert.deepEqual(parseMaxImagesInput(' 20 '), { status: 'ok', value: 20 });
    assert.deepEqual(parseMaxImagesInput('１２'), { status: 'ok', value: 12 }, 'full-width digits from an IME');
    for (const bad of ['-1', '21', '25', '2.5', '1e1', 'abc']) {
        assert.deepEqual(parseMaxImagesInput(bad), { status: 'invalid' }, bad);
    }
    // A number input holding unparsable text reports value '' with validity.badInput.
    assert.deepEqual(parseMaxImagesInput('', { badInput: true }), { status: 'invalid' });
});

test('title and message copy', () => {
    assert.equal(describePresetMaxImages(3), '3 张');
    assert.equal(describePresetMaxImages(0), '不指定');
    assert.equal(describePresetMaxImages(undefined), '不指定');
    assert.equal(buildMaxImagesInputTitle(2), '留空 = 跟随预设（当前预设：2 张）；0 = 不指定');
    assert.equal(buildMaxImagesInputTitle(0), '留空 = 跟随预设（当前预设：不指定）；0 = 不指定');
    assert.equal(MAX_IMAGES_INVALID_INPUT_MESSAGE, '出图数目需为 0–20 的整数（0 = 不指定，留空 = 跟随预设）');
    assert.equal(buildMaxImagesSavedMessage(null), '出图数目：跟随预设');
    assert.equal(buildMaxImagesSavedMessage(0), '出图数目已设为 不指定');
    assert.equal(buildMaxImagesSavedMessage(6), '出图数目已设为 6');
});
