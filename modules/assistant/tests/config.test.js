import test from 'node:test';
import assert from 'node:assert/strict';

import {
    DEFAULT_JSAPI_PERMISSION,
    normalizeAssistantConfig,
    normalizeAssistantSettings,
} from '../shared/config.js';

test('assistant settings default jsApiPermission to deny', () => {
    const settings = normalizeAssistantSettings({});
    const config = normalizeAssistantConfig({});

    assert.equal(settings.jsApiPermission, DEFAULT_JSAPI_PERMISSION);
    assert.equal(config.jsApiPermission, DEFAULT_JSAPI_PERMISSION);
});

test('assistant config preserves explicit jsApiPermission', () => {
    const settings = normalizeAssistantSettings({
        jsApiPermission: 'allow',
    });
    const config = normalizeAssistantConfig({
        jsApiPermission: 'allow',
    });

    assert.equal(settings.jsApiPermission, 'allow');
    assert.equal(config.jsApiPermission, 'allow');
});
