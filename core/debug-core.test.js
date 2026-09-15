import assert from 'node:assert/strict';
import test from 'node:test';
import { xbLog } from './debug-core.js';
import { formatErrorDetails } from './error-details.js';

test('disabled logging does not serialize payloads or read error details', () => {
    xbLog.disable({ clear: true });
    let reads = 0;
    const payload = { toJSON() { reads++; return 'expensive payload'; } };
    const error = new Error('failure');
    Object.defineProperty(error, 'stack', { get() { reads++; return 'expensive stack'; } });
    Object.defineProperty(error, 'cause', { get() { reads++; return payload; } });
    xbLog.info('test', payload);
    xbLog.warn('test', payload, error);
    xbLog.error('test', payload, error);
    assert.equal(reads, 0);
    assert.deepEqual(xbLog.getAll(), []);
});

test('warning/export retain native errors and causes without changing capture policy', () => {
    xbLog.disable({ clear: true });
    xbLog.warn('test', 'disabled');
    assert.deepEqual(xbLog.getAll(), []);
    xbLog.enable();
    try {
        const cause = new Error('HTTP 429');
        const error = new Error('request failed', { cause });
        xbLog.warn('test', 'fallback', error, { attempt: 2 });
        xbLog.info('test', 'details', { stage: 'embed' });
        xbLog.error('test', 'failed', error);
        const logs = JSON.parse(xbLog.export()).logs;
        assert.deepEqual(logs, xbLog.getAll());
        assert.match(logs[0].message, /fallback.*request failed/s);
        assert.match(logs[0].message, /Caused by: HTTP 429/);
        assert.match(logs[0].message, /"attempt":2/);
        assert.ok(logs[0].stack.includes(error.stack));
        assert.ok(logs[0].stack.includes(cause.stack));
        assert.match(logs[1].message, /"stage":"embed"/);
        assert.ok(logs[2].stack.includes(cause.stack));
        for (let i = 0; i < 205; i++) xbLog.info('test', String(i));
        assert.equal(xbLog.getAll().length, 200);
    } finally {
        xbLog.disable({ clear: true });
    }
    assert.deepEqual(xbLog.getAll(), []);
});

test('nested and circular error causes remain readable without recursion failure', () => {
    const root = new Error('root');
    const aggregate = new globalThis.AggregateError([root, 'transport'], 'batch failed', { cause: root });
    root.cause = aggregate;
    const text = formatErrorDetails(aggregate, { includeStack: false });
    assert.match(text, /batch failed/);
    assert.match(text, /Caused by: root/);
    assert.match(text, /circular error/);
    assert.match(text, /transport/);
    assert.equal(formatErrorDetails({ status: 503 }), '{"status":503}');
});
