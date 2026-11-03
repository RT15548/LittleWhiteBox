// Explicit bounded model acceptance, not a recall experiment. Preflight is the default and performs zero API calls.
import fs from 'node:fs/promises';
import { appendFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import { createAgentAdapter } from '../../agent-core/provider-config.js';
import { resolveActiveProviderConfig } from '../../agent-core/provider-resolution.js';
import { redactRequestSecrets } from '../../agent-core/adapters/request-inspection.js';
import { runMemoryAgent, REVIEW_LIMITS } from '../maintenance/runner.js';
import { commitMemorySession } from '../maintenance/commit.js';
import { createSummaryBaseline } from '../data/summary-history.js';
import { createMemorySession } from '../maintenance/session.js';
import { MEMORY_TOOLS } from '../maintenance/tools.js';
import { MEMORY_MAINTENANCE_PROMPT } from '../maintenance/prompt.js';
import { maintenanceFixture } from './fixtures/memory-maintenance.js';
import { protocolReport, caseReport } from './maintenance-acceptance.js';
import { estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { OPENING_TOKENS } from '../maintenance/limits.js';

const run = process.argv.includes('--run');
const settingsPath = process.argv.find(arg => arg.startsWith('--settings='))?.slice(11);
const presetName = process.argv.find(arg => arg.startsWith('--preset='))?.slice(9);
const direct = process.argv.includes('--direct');
const model = process.argv.find(arg => arg.startsWith('--model='))?.slice(8);
const output = path.resolve(process.argv.find(arg => arg.startsWith('--out='))?.slice(6) || 'output/memory-maintenance-check');
const fixture = maintenanceFixture();
const settings = settingsPath ? JSON.parse(await fs.readFile(settingsPath, 'utf8')).settings : null;
const config = settings ? resolveActiveProviderConfig(settings, { presetName }) : null;
if (direct && config) {
    if (config.provider !== 'sillytavern-openai-compatible') throw new Error('Direct check supports only the configured OpenAI-compatible relay');
    config.provider = 'openai-compatible';
}
if (model && config) config.model = model;
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const implementation = Object.fromEntries(await Promise.all([
    ...['session', 'tools', 'prompt', 'runner', 'domain', 'evidence', 'opening', 'records', 'history', 'errors', 'arguments', 'limits', 'commit', 'scheduler', 'ranges', 'context', 'host'].map(name => `maintenance/${name}.js`),
    ...['memory-policy', 'generation-rules', 'text-filter-rules', 'fact-predicates', 'memory-commit'].map(name => `data/${name}.js`),
    'generate/arc-progress.js', 'tests/maintenance-model-check.mjs', 'tests/maintenance-acceptance.js',
    '../agent-core/runtime/context-tokens.js',
].map(async name => [name, hash(await fs.readFile(new URL(`../${name}`, import.meta.url)))])));
const fixed = { fixture, presetName: presetName || null, direct, model: model || null, prompt: MEMORY_MAINTENANCE_PROMPT, tools: MEMORY_TOOLS,
    implementation, configurationDigest: config ? hash(JSON.stringify(config)) : null,
    opening: createMemorySession(fixture).initial(),
    openingTokenLimit: OPENING_TOKENS,
    limits: REVIEW_LIMITS,
    cases: { summaryErrors: ['f-1', 'f-2', 'f-3', 'f-4'], anchorErrors: ['atom-1-0', 'atom-3-0', 'atom-5-0'],
        correctControls: ['f-5', 'atom-7-0', 'evt-3'], eventJoin: ['evt-1', 'evt-2'], causalRedirect: 'evt-4' },
};
const digest = crypto.createHash('sha256').update(JSON.stringify(fixed)).digest('hex');
const inputTokens = estimateConversationTokens({ messages: [{ role: 'system', content: fixed.prompt },
    { role: 'user', content: JSON.stringify({ ...fixed.opening, callsRemaining: fixed.limits.turns }) }], tools: fixed.tools, providerConfig: config || {} });
const openingInputTokens = estimateConversationTokens({ messages: [
    { role: 'user', content: JSON.stringify({ ...fixed.opening, callsRemaining: fixed.limits.turns }) }], providerConfig: config || {} });
if (inputTokens > fixed.limits.inputTokens || openingInputTokens > fixed.openingTokenLimit
    || fixed.opening.memoryDirectory.some(item => item.next) || fixed.opening.memory.some(item => item.excerpt !== undefined)) {
    throw new Error('Fixed sample must fit in one complete opening before model acceptance');
}
await fs.mkdir(output, { recursive: true });
const manifestPath = path.join(output, 'preflight.json');
if (!run) {
    await fs.writeFile(manifestPath, JSON.stringify({ digest, networkCalls: 0, inputTokens, openingInputTokens, tokenSource: 'estimated', ...fixed }, null, 2), { flag: 'wx' });
    console.log(JSON.stringify({ preflight: 'passed', digest, networkCalls: 0, inputTokens, openingInputTokens, tokenSource: 'estimated', floors: fixture.chat.length, ...fixed.cases }));
} else {
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    if (manifest.digest !== digest) throw new Error('Preflight no longer matches the fixed sample and implementation');
    if (!settingsPath) throw new Error('A shared Agent settings file is required');
    // Exclusive create prevents repurchasing a previous or unknown run.
    const journal = await fs.open(path.join(output, 'requests.jsonl'), 'wx');
    let ordinal = 0;
    const trackAdapter = adapter => ({
        supportsSessionToolLoop: adapter.supportsSessionToolLoop,
        async chat(task) {
            const id = ++ordinal;
            await journal.appendFile(`${JSON.stringify({ id, state: 'started', at: Date.now() })}\n`);
            await fs.writeFile(path.join(output, `request-${id}.json`), JSON.stringify({ ...task, signal: undefined }, null, 2));
            try {
                const result = await adapter.chat(task);
                await fs.writeFile(path.join(output, `response-${id}.json`), JSON.stringify(redactRequestSecrets(result), null, 2));
                await journal.appendFile(`${JSON.stringify({ id, state: 'completed', at: Date.now(), usage: result.usage })}\n`);
                return result;
            } catch (error) {
                await fs.writeFile(path.join(output, `failure-${id}.json`), JSON.stringify(redactRequestSecrets({
                    name: error.name, code: error.code, status: error.status, message: error.message,
                    requestId: error.request_id, requestInspection: error.requestInspection,
                }), null, 2));
                await journal.appendFile(`${JSON.stringify({ id, state: 'failed-or-unknown', at: Date.now(), code: error.code || error.name, status: error.status })}\n`);
                throw error;
            }
        },
    });
    const tracked = trackAdapter(createAgentAdapter(config));
    // One line per model turn: which tools ran and what each returned to the model.
    const turns = [];
    const onCall = ({ call, tools }) => {
        const turn = { turn: call.turn, kind: call.kind, durationMs: call.durationMs, inputTokens: call.inputTokens, tokenSource: call.tokenSource, usage: call.usage,
            tools: tools.map(({ name, response }) => ({ name, status: response.status ?? 'ok', code: response.code, message: response.message,
                changed: response.changed, rejected: response.rejected })) };
        turns.push({ tools });
        appendFileSync(path.join(output, 'turns.jsonl'), `${JSON.stringify(turn)}\n`);
    };
    // Isolated confirmed-state port exercises receipt and undo paths without touching a user chat.
    let current = { ...structuredClone(fixture), store: { json: structuredClone(fixture.json), lastSummarizedMesId: fixture.cutoff,
        summaryHistory: [createSummaryBaseline(fixture.cutoff)] } };
    const ports = { read: () => ({ ...current, json: current.store.json }), commit: async (next, _previous, _impact, validate) => {
        validate();
        current = { ...current, store: next.storySummary, atoms: next.stateAtoms, l0Index: next.l0Index };
        await fs.writeFile(path.join(output, 'confirmed-memory.json'), JSON.stringify(current, null, 2));
    } };
    const save = result => commitMemorySession(result.session, result, ports);
    const session = createMemorySession(ports.read());
    let outcome;
    try {
        const result = await runMemoryAgent(session, { adapter: tracked, createSummaryAdapter: () => trackAdapter(createAgentAdapter(config)),
            config, limits: fixed.limits, onCall, readCurrent: ports.read, onSave: save, onFinish: save });
        await fs.writeFile(path.join(output, 'result.json'), JSON.stringify({ digest, provider: config.provider, model: config.model,
            reasoning: config.reasoning, ...result, operations: session.operations, coverage: session.coverage(), memory: session.memory }, null, 2));
        outcome = { completed: result.status === 'completed', status: result.status, code: result.code };
    } catch (error) {
        outcome = { completed: false, code: error.code || error.name, status: error.status };
    } finally { await journal.close(); }
    const protocol = protocolReport(turns);
    const summary = { digest, provider: config.provider, model: config.model, requests: ordinal, ...outcome,
        executionCompleted: outcome.completed, protocol, cases: caseReport(fixed.cases, session) };
    await fs.writeFile(path.join(output, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify({ ...outcome, requests: ordinal, protocol }));
    if (!summary.executionCompleted) process.exitCode = 1;
}
