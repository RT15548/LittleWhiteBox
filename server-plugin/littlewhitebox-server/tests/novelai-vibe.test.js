'use strict';
const assert = require('node:assert/strict');
const http = require('node:http');
const { test } = require('node:test');
const { encodeVibe } = require('../../../modules/draw/server/providers/novelai/client.js');

// Acceptance (protocol/paid retry): backend encoding returns exact binary, forwards
// model/info, reports errors without resubmission, and does not accept a JSON error as encoding.
test('Vibe backend transports binary without treating it as an image or retrying failures', async t => {
    const calls = [];
    let mode = 'ok';
    const bytes = Buffer.from([0, 1, 255, 42]);
    const server = http.createServer((req, res) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            calls.push({ auth: req.headers.authorization, body: JSON.parse(Buffer.concat(chunks)) });
            res.setHeader('Content-Type', mode === 'ok' ? 'application/octet-stream' : 'application/json');
            if (mode === 'fail') res.statusCode = 402;
            res.end(mode === 'ok' ? bytes : '{"error":"offline failure"}');
        });
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(() => new Promise(resolve => server.close(resolve)));
    const options = { url: `http://127.0.0.1:${server.address().port}/ai/encode-vibe`,
        key: 'offline-fixture', payload: { image: 'AQID', model: 'nai-diffusion-4-5-full', information_extracted: .65 } };
    const result = await encodeVibe(options);
    assert.equal(result.encoding, bytes.toString('base64'));
    assert.deepEqual(calls[0].body, options.payload);
    assert.equal(calls[0].auth, 'Bearer offline-fixture');
    mode = 'fail';
    assert.equal((await encodeVibe(options)).status, 402);
    assert.equal(calls.length, 2);
    mode = 'bad';
    await assert.rejects(encodeVibe(options));
    assert.equal(calls.length, 3);
});
