import test from 'node:test';
import assert from 'node:assert/strict';

import {
    normalizeTavernDisplaySettings,
} from '../shared/settings';

test('tavern settings normalize display limits in tavern layer', () => {
    assert.deepEqual(normalizeTavernDisplaySettings({
        hiddenOutsideCount: 0,
        loadBatchSize: 1,
        chatFontSize: 'large',
    }), {
        hiddenOutsideCount: 1,
        loadBatchSize: 1,
        chatFontSize: 'large',
    });

    assert.deepEqual(normalizeTavernDisplaySettings({
        hiddenOutsideCount: 27,
        loadBatchSize: 53,
        chatFontSize: 'medium',
    }), {
        hiddenOutsideCount: 20,
        loadBatchSize: 50,
        chatFontSize: 'medium',
    });
});

test('tavern display settings default chat font size to large for missing or illegal values', () => {
    assert.deepEqual(normalizeTavernDisplaySettings({}), {
        hiddenOutsideCount: 5,
        loadBatchSize: 20,
        chatFontSize: 'large',
    });

    assert.equal(normalizeTavernDisplaySettings().chatFontSize, 'large');
    assert.equal(normalizeTavernDisplaySettings({ chatFontSize: 'huge' }).chatFontSize, 'large');
    assert.equal(normalizeTavernDisplaySettings({ chatFontSize: 2 }).chatFontSize, 'large');
    assert.equal(normalizeTavernDisplaySettings({ chatFontSize: null }).chatFontSize, 'large');
    assert.equal(normalizeTavernDisplaySettings({ chatFontSize: undefined }).chatFontSize, 'large');
    assert.equal(normalizeTavernDisplaySettings({ chatFontSize: 'SMALL' }).chatFontSize, 'large');
});
