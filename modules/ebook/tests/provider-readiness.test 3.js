import assert from 'node:assert/strict';
import test from 'node:test';
import { renderProviderReadiness } from '../app-src/renderer.js';

test('ebook readiness accepts a keyless endpoint while still requiring its model and URL', () => {
    const config = { provider: 'openai-compatible', model: 'test-model', baseUrl: 'http://localhost:1234/v1', apiKey: '' };
    assert.equal(renderProviderReadiness(config).canRun, true);
    assert.equal(renderProviderReadiness({ ...config, model: '' }).canRun, false);
    assert.equal(renderProviderReadiness({ ...config, baseUrl: '' }).canRun, false);
});
