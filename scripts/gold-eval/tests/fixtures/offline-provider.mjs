/* global process */
// Test-process preload ONLY. No passthrough fetch and no real credentials.
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';

const readFile = fs.readFile.bind(fs);
fs.readFile = async (file, ...rest) => {
    if (String(file).endsWith('story-summary-replay.local.json')) throw new Error('Offline check forbids private credentials');
    if (process.env.LWB_OFFLINE_FORBID_CREDENTIALS && String(file).endsWith('fixture-credentials.json')) {
        throw new Error('Recovery guard opened credentials too early');
    }
    return readFile(file, ...rest);
};

// Interrupt at the durability boundary, including hard exit before caller commit.
const open = fs.open.bind(fs);
fs.open = async (file, ...rest) => {
    const handle = await open(file, ...rest);
    if (!String(file).endsWith('request-journal.jsonl')) return handle;
    const writeFile = handle.writeFile.bind(handle);
    const sync = handle.sync.bind(handle);
    let lastRow;
    handle.writeFile = async (data, ...options) => {
        lastRow = JSON.parse(String(data));
        if (process.env.LWB_OFFLINE_DISK_FAIL === String(lastRow.id) && lastRow.type === 'response') {
            const error = new Error('simulated ENOSPC'); error.code = 'ENOSPC'; throw error;
        }
        return writeFile(data, ...options);
    };
    handle.sync = async () => {
        await sync();
        if (process.env.LWB_OFFLINE_KILL_RECEIPT === String(lastRow.id) && lastRow.type === 'response') process.exit(86);
    };
    return handle;
};

let calls = 0;
const failures = new Set();
globalThis.fetch = async (input, init = {}) => {
    if (new URL(String(input)).origin !== 'https://offline-fixture.invalid') throw new Error('Offline provider rejects every non-fixture URL');
    const body = JSON.parse(init.body);
    const kind = body.model;
    if (!['fixture-summary', 'fixture-l0', 'fixture-embedding', 'fixture-rerank'].includes(kind)) throw new Error('Unexpected fixture model');
    calls++;
    const requestHash = createHash('sha256').update(init.body).digest('hex');
    await fs.appendFile(process.env.LWB_OFFLINE_CALL_LOG, `${JSON.stringify({ kind, requestHash, reasoningEffort: body.reasoning_effort ?? null })}\n`);
    if (process.env.LWB_OFFLINE_KILL_INTENT === String(calls)) process.exit(87);
    if (process.env.LWB_OFFLINE_LOSE_MODEL === kind) throw new TypeError('fixture connection lost', { cause: { code: 'ECONNRESET' } });
    if (process.env.LWB_OFFLINE_FAIL_MODEL === kind && (!failures.has(kind) || process.env.LWB_OFFLINE_PERSISTENT)) {
        failures.add(kind);
        return Response.json({ error: 'fixture limit' }, { status: Number(process.env.LWB_OFFLINE_STATUS || 429),
            headers: { 'retry-after': '0' } });
    }
    if (process.env.LWB_OFFLINE_MALFORMED === kind) return Response.json({ choices: [] });
    if (kind === 'fixture-embedding') return Response.json({ data: body.input.map((_, index) => ({ index, embedding: [1, 0] })) });
    if (kind === 'fixture-rerank') return Response.json({ results: body.documents.map((_, index) => ({ index, relevance_score: 0.9 })) });
    const floor = body.messages.find(message => message.content.startsWith('<新对话内容>'))?.content.match(/^#(\d+) /m)?.[1];
    const content = kind === 'fixture-summary' ? {
        events: [{ title: '保管钥匙', summary: `角色把银色钥匙交给用户，用户将钥匙放进蓝色盒子。 (#${floor})`,
            participants: [], causedBy: [], memoryRole: '具体经历' }],
        keywords: [], newCharacters: [], arcUpdates: [], factUpdates: [],
    } : { anchors: [{ scene: '角色在房间里把银色钥匙交给用户，指着桌上的蓝色盒子解释钥匙的用途，要求用户将盒子收好，用户接过钥匙并答应保管，角色确认盒子已经锁上。',
        edges: [{ s: '角色', t: '用户', r: '交付银色钥匙' }], where: '房间' }] };
    return Response.json({ choices: [{ message: { content: JSON.stringify(content) } }], usage: { total_tokens: 1 } });
};
