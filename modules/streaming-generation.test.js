import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Acceptance contracts (cost: wrong provider or silently changed generation):
// - Following Vertex preserves the host model, authentication, region and proxy.
// - Google AI Studio and Vertex inherit the host's actual sampling fields.
// - Explicit values, including zero, override the host; __unset__ omits the field.
// - Web search uses the host switch without injecting tool declarations (cost: rejected request).
const sources = { OPENAI: 'openai', CLAUDE: 'claude', MAKERSUITE: 'makersuite',
    VERTEXAI: 'vertexai', COHERE: 'cohere', DEEPSEEK: 'deepseek', CUSTOM: 'custom' };
const stubs = {
    'script.js': `export const eventSource={},event_types={},chat=[],name1='User';
        export const activateSendButtons=()=>{},deactivateSendButtons=()=>{},substituteParams=value=>value;`,
    'openai.js': `export const chat_completion_sources=__fixture.sources,oai_settings=__fixture.settings,promptManager={};
        export const getChatCompletionModel=()=>oai_settings.vertexai_model;`,
    'custom-request.js': 'export const ChatCompletionService=__fixture.service;',
    'st-context.js': 'export const getContext=()=>({});',
    'SlashCommandParser.js': 'export const SlashCommandParser={};',
    'SlashCommand.js': 'export const SlashCommand={};',
    'SlashCommandArgument.js': 'export const ARGUMENT_TYPE={},SlashCommandArgument={},SlashCommandNamedArgument={};',
    'power-user.js': 'export const power_user={};',
    'world-info.js': 'export const world_info={};',
    'debug-core.js': 'export const xbLog={isEnabled:()=>false},CacheRegistry={register(){}};',
    'iframe-messaging.js': `export const getTrustedOrigin=()=>'http://localhost';`,
    'var-commands.js': 'export const replaceXbGetVarInString=value=>value,replaceXbGetVarYamlInString=value=>value;',
};
const built = await build({
    entryPoints: [fileURLToPath(new URL('./streaming-generation.js', import.meta.url))],
    bundle: true, write: false, format: 'cjs', platform: 'node', logLevel: 'silent',
    plugins: [{ name: 'streaming-host-boundary', setup(api) {
        api.onResolve({ filter: /\.js$/ }, ({ path }) => {
            const name = path.split('/').at(-1);
            return Object.hasOwn(stubs, name) ? { path: name, namespace: 'host' } : null;
        });
        api.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path] }));
    } }],
});

function fixture(source = sources.VERTEXAI) {
    const settings = { chat_completion_source: source, vertexai_model: 'fixture-model',
        vertexai_auth_mode: 'express', vertexai_region: 'global', vertexai_express_project_id: 'fixture-project',
        temp_openai: 0.6, top_p_openai: 0.42, top_k_openai: 37, openai_max_tokens: 512 };
    const requests = [];
    const service = {
        createRequestData: body => JSON.parse(JSON.stringify(body)),
        async sendRequest(payload) {
            requests.push(payload);
            if (payload.stream) return async function* () { yield { text: 'OK' }; };
            return { choices: [{ message: { content: 'OK' } }] };
        },
    };
    const box = { __fixture: { settings, sources, service }, module: { exports: {} }, console };
    runInNewContext(built.outputFiles[0].text, box);
    return { settings, requests, async generate(options = {}, stream = false) {
        const result = await box.module.exports.streamingGeneration.callAPI({
            messages: [{ role: 'user', content: 'fixture' }], apiOptions: options,
        }, undefined, stream);
        if (stream) for await (const text of result) assert.equal(text, 'OK');
        else assert.equal(result, 'OK');
        return requests.at(-1);
    } };
}

test('following Vertex retains host routing and authentication for streamed and complete replies', async () => {
    for (const mode of ['express', 'full', 'proxy']) for (const stream of [false, true]) {
        const f = fixture();
        f.settings.vertexai_auth_mode = mode === 'proxy' ? 'express' : mode;
        if (mode === 'proxy') Object.assign(f.settings, { reverse_proxy: 'https://fixture.invalid/', proxy_password: 'fixture-key' });
        const payload = await f.generate({}, stream);
        assert.equal(f.requests.length, 1);
        assert.equal(payload.chat_completion_source, sources.VERTEXAI);
        assert.equal(payload.model, f.settings.vertexai_model);
        assert.equal(payload.vertexai_auth_mode, f.settings.vertexai_auth_mode);
        assert.equal(payload.vertexai_region, f.settings.vertexai_region);
        assert.equal(payload.vertexai_express_project_id, f.settings.vertexai_express_project_id);
        assert.equal(payload.reverse_proxy, mode === 'proxy' ? 'https://fixture.invalid' : undefined);
        assert.equal(payload.proxy_password, f.settings.proxy_password);
    }
});

test('Google routes inherit current host sampling values without changing settings', async () => {
    for (const source of [sources.MAKERSUITE, sources.VERTEXAI]) for (const stream of [false, true]) {
        const f = fixture(source);
        for (const [topP, topK] of [[0.42, 37], [0, 0], [0.81, 19]]) {
            Object.assign(f.settings, { top_p_openai: topP, top_k_openai: topK });
            const before = structuredClone(f.settings);
            const payload = await f.generate({}, stream);
            assert.equal(payload.top_p, f.settings.top_p_openai);
            assert.equal(payload.top_k, f.settings.top_k_openai);
            assert.deepEqual(f.settings, before);
        }
    }
});

test('Google sampling honors per-call values and explicit omission over host defaults', async () => {
    for (const source of [sources.MAKERSUITE, sources.VERTEXAI]) for (const stream of [false, true]) {
        const f = fixture(source);
        for (const options of [{ top_p: 0.25, top_k: 12 }, { top_p: 0, top_k: 0 }]) {
            const payload = await f.generate(options, stream);
            assert.equal(payload.top_p, options.top_p);
            assert.equal(payload.top_k, options.top_k);
        }
        const omitted = await f.generate({ top_p: '__unset__', top_k: '__unset__' }, stream);
        assert.equal(Object.hasOwn(omitted, 'top_p'), false);
        assert.equal(Object.hasOwn(omitted, 'top_k'), false);
    }
});

test('web search delegates tool construction to the Google host routes without leaking between calls', async () => {
    for (const source of [sources.MAKERSUITE, sources.VERTEXAI, sources.OPENAI]) for (const stream of [false, true]) {
        const f = fixture(source);
        for (const enableNet of [true, false, undefined, true]) {
            const payload = await f.generate({ enableNet }, stream);
            const enabled = source !== sources.OPENAI && enableNet === true;
            assert.equal(payload.enable_web_search, enabled ? true : undefined);
            assert.equal(Object.hasOwn(payload, 'tools'), false);
        }
    }
});
