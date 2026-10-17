import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import db, { createTavernSession } from '../shared/session-db';
import { ensureTavernMemoryDefaultsInitialized, getTavernMemoryFile } from '../shared/memory-files';
import { runSharedManagerToolLoop } from '../app-src/runtime/manager';

// Acceptance contract (cost: lost paid output or unintended memory writes):
// The real manager adapter boundary must preserve complete tool execution/replay,
// and cannot lose completion metadata before rejecting cut-off write arguments.
for (const ending of ['length', undefined]) {
    for (const complete of [true, false]) {
        test(`manager real adapter/${ending ?? 'missing completion'}/${complete ? 'complete' : 'cut-off'} arguments`, async t => {
            await db.delete();
            await db.open();
            t.after(async () => { await db.delete(); });
            const session = await createTavernSession({ title: 'Offline completion fixture' });
            await ensureTavernMemoryDefaultsInitialized(session.id);
            const original = await getTavernMemoryFile(session.id, 'memory/state.md');
            const content = '# 会话记忆\n\n门边放着一把银钥匙。';
            const argumentsText = JSON.stringify({ filePath: 'memory/state.md', content });
            const requests: Array<{ messages: Array<Record<string, unknown>> }> = [];
            const server = createServer(async (request, response) => {
                const chunks: Buffer[] = [];
                for await (const chunk of request) { chunks.push(Buffer.from(chunk)); }
                requests.push(JSON.parse(Buffer.concat(chunks).toString()));
                const delta = requests.length === 1
                    ? { role: 'assistant', content: '记下线索。', tool_calls: [{ index: 0, id: 'write-key', type: 'function',
                        function: { name: 'Write', arguments: complete ? argumentsText : argumentsText.slice(0, -2) } }] }
                    : { role: 'assistant', content: '线索已记下。' };
                const reason = requests.length === 1 ? ending : 'stop';
                const events = [{ choices: [{ index: 0, delta }] },
                    ...(reason ? [{ choices: [{ index: 0, delta: {}, finish_reason: reason }] }] : [])];
                response.writeHead(200, { 'Content-Type': 'text/event-stream' });
                response.end(events.map(event => `data: ${JSON.stringify(event)}\n\n`).join(''));
            });
            await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
            t.after(() => new Promise<void>(resolve => { server.close(() => resolve()); server.closeAllConnections(); }));
            const address = server.address();
            assert.ok(address && typeof address !== 'string');
            let writeChecks = 0;
            const run = runSharedManagerToolLoop({
                sessionId: session.id, caller: 'chat',
                agentConfig: { delegateConfigured: true, delegateConfig: {
                    provider: 'openai-compatible', modelConfigs: { 'openai-compatible': {
                        apiKey: 'offline-fixture', model: 'fixture', baseUrl: `http://127.0.0.1:${address.port}/v1`, toolMode: 'native',
                    } },
                } },
                messages: [{ role: 'user', content: '记下线索。' }],
                beforeWriteGuard: () => { writeChecks++; },
            });
            if (complete) {
                const result = await run;
                assert.equal(requests.length, 2, 'Only tool execution and its normal result round are requested');
                assert.equal(writeChecks, 1);
                assert.equal((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content, content);
                assert.deepEqual(result.changedFiles, ['memory/state.md']);
                const replay = requests[1].messages.find(message => Array.isArray(message.tool_calls));
                const call = (replay?.tool_calls as Array<{ function: { arguments: string } }>)[0];
                assert.equal(call.function.arguments, argumentsText);
                assert.ok(requests[1].messages.some(message => message.role === 'tool' && message.tool_call_id === 'write-key'));
            } else {
                await assert.rejects(run, { code: 'AGENT_TOOL_ARGUMENTS_INVALID' });
                assert.equal(requests.length, 1);
                assert.equal(writeChecks, 0);
                assert.deepEqual(await getTavernMemoryFile(session.id, 'memory/state.md'), original);
            }
        });
    }
}
