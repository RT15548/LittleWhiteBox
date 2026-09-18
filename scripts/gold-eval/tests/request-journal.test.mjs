import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { openRequestJournal, preparedJournalBinding } from '../../story-summary-replay/request-journal.mjs';
import { withPreparedRequestBudget } from '../../story-summary-replay/prepared-config.mjs';
import { withExternalCallTrace, withPreparedRequestScope, assertSuccessfulExternalTrace, createStrictTransportCassette } from '../lib/transport-cassette.mjs';

const api = { url: 'https://fixture.invalid/v1' };
const config = { summaryApi: api, vectorConfig: { l0Api: api, embeddingApi: api, rerankApi: api },
    prepared: { maxRequests: 8 }, requestRecovery: { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 } };
const args = name => [`${api.url}/chat/completions`, { method: 'POST',
    headers: { authorization: 'Bearer never-save-this-credential' }, body: JSON.stringify({ name }) }];
const failureKind = kind => error => error.goldFailure?.kind === kind;

async function approvalFor(options, id) {
    const raw = await fs.readFile(path.join(options.directory, 'request-journal.jsonl'));
    return { id, previousBinding: options.binding, sourceManifestSha256: 'c'.repeat(64),
        journalSha256: createHash('sha256').update(raw).digest('hex') };
}

async function fixture(t, maxRequests = 8) {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'lwb-receipts-'));
    t.after(() => fs.rm(dir, { recursive: true, force: true }));
    return { directory: path.join(dir, 'job'), binding: 'a'.repeat(64), maxRequests };
}

async function execute(options, provider, operation, finish = false) {
    const journal = await openRequestJournal(options);
    const previous = globalThis.fetch;
    globalThis.fetch = provider;
    try {
        const result = await withPreparedRequestBudget(config, operation, { journal });
        if (finish) await journal.finish();
        return result;
    } finally { globalThis.fetch = previous; await journal.close(); }
}

test('reviewed continuation preserves paid bytes, validates receipt-only, then appends only the unpaid suffix', async t => {
    const options = await fixture(t);
    let sent = 0;
    const provider = async () => Response.json({ ordinal: ++sent });
    const scope = operation => withPreparedRequestScope('before-user:3', operation);
    await assert.rejects(() => execute(options, provider, () => scope(async () => {
        await fetch(...args('Summary'));
        throw new Error('product structure rejected');
    })), /product structure rejected/);
    const file = path.join(options.directory, 'request-journal.jsonl');
    const original = await fs.readFile(file, 'utf8');
    const transition = { previousBinding: options.binding, journalSha256: createHash('sha256').update(original).digest('hex'),
        sourceManifestSha256: 'c'.repeat(64), sourceProfileSha256: 'd'.repeat(64), summaryFromFloor: 4 };
    const reviewed = { ...options, binding: 'b'.repeat(64), resume: true, transition };
    const run = () => scope(async () => {
        assert.deepEqual(await (await fetch(...args('Summary'))).json(), { ordinal: 1 });
        return (await fetch(...args('new-vector'))).json();
    });
    await assert.rejects(() => execute({ ...reviewed, readOnly: true }, provider, run), failureKind('replay-boundary'));
    assert.equal(await fs.readFile(file, 'utf8'), original);
    assert.equal(sent, 1);
    assert.deepEqual(await execute(reviewed, provider, run), { ordinal: 2 });
    assert.equal(sent, 2);
    const continued = await fs.readFile(file, 'utf8');
    assert.ok(continued.startsWith(original));
    await assert.rejects(() => openRequestJournal(reviewed), failureKind('continuation-stale'));
    await execute({ ...reviewed, transition: null }, provider, run, true);
    assert.equal(sent, 2);
});

test('continuation refuses unresolved requests, wrong floors and stale hashes without changing receipts', async t => {
    for (const fault of ['unknown', 'floor', 'hash']) {
        const options = await fixture(t);
        await assert.rejects(() => execute(options, async () => {
            if (fault === 'unknown') throw new TypeError('lost');
            return Response.json({ ok: true });
        }, () => withPreparedRequestScope('before-user:3', async () => {
            await fetch(...args('Summary')); throw new Error('stop');
        })));
        const file = path.join(options.directory, 'request-journal.jsonl');
        const original = await fs.readFile(file, 'utf8');
        const transition = { previousBinding: options.binding,
            journalSha256: fault === 'hash' ? '0'.repeat(64) : createHash('sha256').update(original).digest('hex'),
            sourceManifestSha256: 'c'.repeat(64), sourceProfileSha256: 'd'.repeat(64), summaryFromFloor: fault === 'floor' ? 5 : 4 };
        await assert.rejects(() => openRequestJournal({ ...options, resume: true, binding: 'b'.repeat(64), transition }));
        assert.equal(await fs.readFile(file, 'utf8'), original);
    }
});

test('durable successes survive reopen; only missing suffix dispatches and counters separate reuse', async t => {
    const options = await fixture(t);
    const sent = [];
    const provider = async (_url, init) => {
        const body = JSON.parse(init.body);
        sent.push(body.name);
        return Response.json({ result: body.name }, { headers: { 'set-cookie': 'never-save-cookie' } });
    };
    const runScope = callback => withPreparedRequestScope('floor:0', () => withExternalCallTrace(callback));
    await assert.rejects(() => execute(options, provider, () => runScope(async () => {
        await fetch(...args('L0'));
        // Caller dies AFTER the success receipt, BEFORE the next dispatch.
        throw new Error('caller-interrupted');
    })), /caller-interrupted/);
    const result = await execute({ ...options, resume: true }, provider, () => runScope(async () => {
        assert.deepEqual(await (await fetch(...args('L0'))).json(), { result: 'L0' });
        await fetch(...args('Summary'));
    }), true);
    assert.deepEqual(sent, ['L0', 'Summary']);
    assert.equal(result.calls, 1);
    assert.equal(result.requestCount, 2);
    assert.deepEqual(result.trace.map(row => row.source), ['journal', 'network']);
    assert.equal(result.trace[0].responseBody.result, 'L0');
    const receipts = await fs.readFile(path.join(options.directory, 'request-journal.jsonl'), 'utf8');
    assert.equal(receipts.includes('never-save-'), false);
    await assert.rejects(() => openRequestJournal({ ...options, resume: true }), failureKind('job-complete'));
    await assert.rejects(() => openRequestJournal(options), failureKind('job-already-started'));
});

test('HTTP 429/503 retries do not redispatch a successful sibling after reopen', async t => {
    const options = await fixture(t);
    const sent = [];
    let count = 0;
    const provider = async (_url, init) => {
        const name = JSON.parse(init.body).name;
        sent.push(name);
        if (name === 'failed' && ++count < 3) return Response.json({}, { status: count === 1 ? 429 : 503 });
        return Response.json({ name });
    };
    const run = () => withPreparedRequestScope('concurrent', () => withExternalCallTrace(() =>
        Promise.all([fetch(...args('success')), fetch(...args('failed'))])));
    const first = await execute(options, provider, run);
    assert.equal(first.calls, 4);
    const second = await execute({ ...options, resume: true }, provider, run, true);
    assert.equal(second.calls, 0);
    assert.equal(second.requestCount, 4);
    assert.deepEqual(sent, ['success', 'failed', 'failed', 'failed']);
});

test('identical concurrent occurrences retain distinct responses, not a content cache', async t => {
    const options = await fixture(t);
    let sent = 0;
    const provider = async () => Response.json({ ordinal: ++sent });
    const run = () => withPreparedRequestScope('same', () => withExternalCallTrace(async () =>
        Promise.all([fetch(...args('same')), fetch(...args('same'))]).then(values => Promise.all(values.map(value => value.json())))));
    const first = await execute(options, provider, run);
    const second = await execute({ ...options, resume: true }, provider, run, true);
    assert.deepEqual(first.value, [{ ordinal: 1 }, { ordinal: 2 }]);
    assert.deepEqual(second.value, first.value);
    assert.equal(sent, 2);
});

test('lost connection/body blocks automatic retransmission, including subsequent process', async t => {
    for (const bodyFailure of [false, true]) {
        const options = await fixture(t);
        let sent = 0;
        const provider = async () => {
            sent++;
            if (!bodyFailure) throw new TypeError('connection lost');
            return new Response(new ReadableStream({ start(controller) { controller.error(new Error('body lost')); } }));
        };
        await assert.rejects(() => execute(options, provider, () => withPreparedRequestScope('floor:0', () =>
            withExternalCallTrace(() => fetch(...args('L0'))))), error => {
            assert.equal(error.externalCalls, 1);
            return failureKind('unknown-request-outcome')(error);
        });
        assert.equal(sent, 1);
        await assert.rejects(() => openRequestJournal({ ...options, resume: true }), failureKind('unknown-request-outcome'));
    }
});

test('budget is cumulative; reopening neither renews cap nor retries terminal 401/malformed200', async t => {
    const options = await fixture(t, 1);
    let sent = 0;
    const provider = async () => { sent++; return Response.json({ ok: true }); };
    const run = () => withPreparedRequestScope('s', () => withExternalCallTrace(async () => {
        await fetch(...args('paid'));
        await fetch(...args('missing'));
    }));
    await assert.rejects(() => execute(options, provider, run), failureKind('request-budget'));
    await assert.rejects(() => execute({ ...options, resume: true }, provider, run), failureKind('request-budget'));
    assert.equal(sent, 1);
    for (const status of [200, 401]) {
        const item = await fixture(t);
        let attempts = 0;
        const failing = async () => { attempts++; return new Response('not-json', { status }); };
        const read = () => withPreparedRequestScope('parse', () => withExternalCallTrace(async () =>
            (await fetch(...args('bad'))).json()));
        await assert.rejects(() => execute(item, failing, read), SyntaxError);
        await assert.rejects(() => execute({ ...item, resume: true }, failing, read), SyntaxError);
        assert.equal(attempts, 1);
    }
});

test('scope/request changes, unused receipts and corrupt/truncated journals stop before dispatch', async t => {
    for (const fault of ['binding', 'scope', 'request', 'unused', 'corrupt', 'truncated']) {
        const options = await fixture(t);
        let sent = 0;
        const provider = async () => { sent++; return Response.json({ ok: true }); };
        await execute(options, provider, () => withPreparedRequestScope('s', () => fetch(...args('paid'))));
        const journalPath = path.join(options.directory, 'request-journal.jsonl');
        if (fault === 'corrupt') await fs.appendFile(journalPath, '{}\n');
        if (fault === 'truncated') await fs.appendFile(journalPath, '{');
        await assert.rejects(() => execute({ ...options, resume: true,
            ...(fault === 'binding' ? { binding: 'b'.repeat(64) } : {}),
        }, provider, () => withPreparedRequestScope(fault === 'scope' ? 'changed' : 's', async () => {
            if (fault !== 'unused') await fetch(...args(fault === 'request' ? 'changed' : 'paid'));
        })));
        assert.equal(sent, 1, fault);
    }
});

test('single writer is OS-owned; cancelled request reserves no budget', async t => {
    const options = await fixture(t);
    const journal = await openRequestJournal(options);
    try {
        await assert.rejects(() => openRequestJournal({ ...options, resume: true }), failureKind('job-busy-or-port-unavailable'));
        await journal.runScope('cancelled', async () => {
            await assert.rejects(() => journal.dispatch(...args('cancelled').map((arg, index) => index ?
                { ...arg, signal: AbortSignal.abort() } : arg), async () => assert.fail('must not dispatch')), /abort/i);
        });
        assert.equal(journal.usedRequests, 0);
    } finally { await journal.close(); }
    const reopened = await openRequestJournal({ ...options, resume: true });
    await reopened.close();
});

test('binding covers config and executable code but excludes invocation bookkeeping', () => {
    const code = { bundleHash: 'bundle', supportHash: 'support' };
    const original = preparedJournalBinding(config, code);
    assert.equal(preparedJournalBinding({ ...config, __command: 'resume' }, code), original);
    assert.notEqual(preparedJournalBinding({ ...config, summaryApi: { ...api, model: 'different' } }, code), original);
    assert.notEqual(preparedJournalBinding(config, { ...code, supportHash: 'changed' }), original);
});

test('a failing concurrent request does not discard a later successful sibling receipt', async t => {
    const options = await fixture(t);
    const journal = await openRequestJournal(options);
    try {
        await assert.rejects(() => journal.runScope('siblings', () => Promise.all([
            journal.dispatch(...args('lost'), async () => { throw new TypeError('lost'); }),
            journal.dispatch(...args('saved'), async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                return Response.json({ result: 'retained' });
            }),
        ])), failureKind('unknown-request-outcome'));
    } finally { await journal.close(); }
    const records = (await fs.readFile(path.join(options.directory, 'request-journal.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
    assert.deepEqual(records.filter(row => row.type === 'response').map(row => row.id), [2]);
    await assert.rejects(() => openRequestJournal({ ...options, resume: true }), failureKind('unknown-request-outcome'));
});

test('a caught scope failure cannot start an in-process whole-scope retry', async t => {
    const journal = await openRequestJournal(await fixture(t));
    let sent = 0;
    const work = () => journal.dispatch(...args('saved'), async () => { sent++; return Response.json({ ok: true }); });
    try {
        await assert.rejects(() => journal.runScope('s', async () => { await work(); throw new Error('caller failed'); }), /caller failed/);
        await assert.rejects(() => journal.runScope('s', work), failureKind('scope-failed'));
        assert.equal(sent, 1);
    } finally { await journal.close(); }
});

test('equal-content successful calls are occurrences, not excessive retries; cassette preserves each', async () => {
    const previous = globalThis.fetch;
    globalThis.fetch = async () => Response.json({ data: [{ embedding: [1, 0] }] });
    try {
        const { trace } = await withExternalCallTrace(async () => {
            for (let i = 0; i < 4; i++) await fetch(`${api.url}/embeddings`);
        });
        assert.doesNotThrow(() => assertSuccessfulExternalTrace(trace));
        const cassette = createStrictTransportCassette(trace);
        assert.equal(cassette.sourceRequestCount, 4);
        for (const row of trace) cassette.consume(row);
        cassette.assertFullyConsumed();
        const failed = { ...trace[0], status: 429, responseBody: null };
        assert.throws(() => assertSuccessfulExternalTrace([failed, failed, failed, trace[0]], {
            allowRecoveredTransient: true,
        }), failureKind('excessive-retry'));
    } finally { globalThis.fetch = previous; }
});

test('explicit unknown retry preserves the prefix and counts a new attempt; reopening buys no saved result', async t => {
    const options = await fixture(t);
    const sent = [];
    const work = () => withPreparedRequestScope('s', () => withExternalCallTrace(async () => {
        await fetch(...args('saved'));
        await fetch(...args('unknown'));
    }));
    await assert.rejects(() => execute(options, async (_url, init) => {
        const name = JSON.parse(init.body).name; sent.push(name);
        if (name === 'unknown') throw new TypeError('lost');
        return Response.json({ ok: true });
    }, work), failureKind('unknown-request-outcome'));
    const journalPath = path.join(options.directory, 'request-journal.jsonl');
    const prefix = await fs.readFile(journalPath, 'utf8');
    const retryUnknown = await approvalFor(options, 2);
    const current = { ...options, binding: 'b'.repeat(64), resume: true };
    const first = await execute({ ...current, retryUnknown }, async (_url, init) => {
        sent.push(JSON.parse(init.body).name); return Response.json({ repaired: true });
    }, work);
    assert.deepEqual(first.trace.map(row => row.source), ['journal', 'network']);
    const next = await execute(current, async () => assert.fail('saved success bought again'), work, true);
    assert.equal(next.calls, 0);
    assert.deepEqual(sent, ['saved', 'unknown', 'unknown']);
    const raw = await fs.readFile(journalPath, 'utf8');
    assert.ok(raw.startsWith(prefix), 'historical bytes stay immutable');
    const records = raw.trim().split('\n').map(JSON.parse);
    assert.deepEqual(records.filter(row => row.type === 'intent').map(row => [row.id, row.retryOf]), [[1, undefined], [2, undefined], [3, 2]]);
    assert.deepEqual(records.filter(row => row.type === 'response').map(row => row.id), [1, 3]);
});

test('authorization survives exit before dispatch; another unknown or any second buy is forbidden', async t => {
    for (const failure of ['unknown', 'http', 'parse']) {
        const options = await fixture(t);
        const work = () => withPreparedRequestScope('s', () => withExternalCallTrace(async () => {
            const response = await fetch(...args('unknown'));
            if (failure === 'parse') await response.json();
        }));
        await assert.rejects(() => execute(options, async () => { throw new TypeError('lost'); }, work));
        const approved = await openRequestJournal({ ...options, resume: true, retryUnknown: await approvalFor(options, 1) });
        await approved.close();
        let attempts = 0;
        await assert.rejects(() => execute({ ...options, resume: true }, async () => {
            attempts++;
            if (failure === 'unknown') throw new TypeError('lost again');
            return new Response('invalid-json', { status: failure === 'http' ? 429 : 200 });
        }, work));
        assert.equal(attempts, 1, failure);
        await assert.rejects(() => execute({ ...options, resume: true }, async () => { attempts++; throw new Error('must not send'); }, work));
        assert.equal(attempts, 1, `${failure} must not reset its allowance`);
    }
});

test('unknown approval rejects saved/wrong targets, stale hashes, other unknowns and budget exhaustion without writing', async t => {
    for (const fault of ['saved', 'absent', 'hash', 'binding', 'other', 'budget']) {
        const options = await fixture(t, fault === 'budget' ? 2 : 8);
        await assert.rejects(() => execute(options, async (_url, init) => {
            if (JSON.parse(init.body).name !== 'saved') throw new TypeError('lost');
            return Response.json({ ok: true });
        }, () => withPreparedRequestScope('s', async () => {
            await fetch(...args('saved'));
            await Promise.all([fetch(...args('lost')), ...(fault === 'other' ? [fetch(...args('other'))] : [])]);
        })));
        const file = path.join(options.directory, 'request-journal.jsonl');
        const before = await fs.readFile(file, 'utf8');
        const retryUnknown = await approvalFor(options, fault === 'saved' ? 1 : fault === 'absent' ? 99 : 2);
        if (fault === 'hash') retryUnknown.journalSha256 = 'f'.repeat(64);
        if (fault === 'binding') retryUnknown.previousBinding = 'f'.repeat(64);
        await assert.rejects(() => openRequestJournal({ ...options, resume: true, retryUnknown }));
        assert.equal(await fs.readFile(file, 'utf8'), before, fault);
    }
});

test('swallowed product failure retains failed-scope counts and safe cause at scope boundary', async t => {
    const options = await fixture(t);
    await assert.rejects(() => execute(options, async (_url, init) => {
        if (JSON.parse(init.body).name === 'failed') throw new TypeError('do-not-log-credential', { cause: { code: 'ECONNRESET' } });
        return Response.json({ ok: true });
    }, () => withPreparedRequestScope('after-ai:58', async () => {
        const result = await withExternalCallTrace(async () => {
            await fetch(...args('saved'));
            try { await fetch(...args('failed')); } catch { /* product records floor failure */ }
        });
        return { externalCalls: result.calls, externalRequests: result.requestCount, transportTrace: result.trace };
    })), error => {
        assert.equal(error.externalCalls, 2);
        assert.equal(error.externalTrace.length, 2);
        assert.equal(error.goldFailure.requestId, 2);
        assert.equal(error.goldFailure.transmitted, true);
        assert.equal(error.goldFailure.transportCode, 'ECONNRESET');
        assert.equal(JSON.stringify(error.goldFailure).includes('do-not-log-credential'), false);
        return true;
    });
});
