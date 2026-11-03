import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServiceTests } from '../vector/service-tests.js';

for (const target of ['l0', 'rerank']) test(`${target}: cancel settles promptly, old success/error cannot finish a newer request`, async () => {
    for (const fail of [false, true]) {
        const pending = [];
        const statuses = [];
        const owner = createServiceTests({
            probes: { [target]: (_config, { signal }) => new Promise((resolve, reject) => pending.push({ signal, resolve, reject })) },
            onStatus: (_target, status) => statuses.push(status),
        });
        const old = owner.test(target, {});
        const rejected = assert.rejects(old, { name: 'AbortError' });
        owner.cancel();
        await rejected;
        assert.equal(pending[0].signal.aborted, true);
        assert.equal(owner.getStatus(target).status, 'idle');
        const next = owner.test(target, {});
        if (fail) pending[0].reject(new Error('late'));
        else pending[0].resolve({ message: 'old' });
        await Promise.resolve();
        assert.equal(owner.getStatus(target).status, 'downloading');
        pending[1].resolve({ message: 'new' });
        await next;
        assert.equal(statuses.at(-1).status, 'success');
    }
});
