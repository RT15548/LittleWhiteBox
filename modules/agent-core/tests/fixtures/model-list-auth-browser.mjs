// Run with Node, then use Playwright CLI on the printed URL.
// The two origins deliberately allow only one auth header each: Node fetch mocks
// cannot detect the browser preflight regression caused by sending both headers.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../../', import.meta.url));
const requests = [];
const api = createServer((request, response) => {
    const mode = request.url.split('/')[1];
    const bearer = mode === 'bearer';
    requests.push({ method: request.method, mode, url: request.url });
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', `anthropic-version, ${bearer ? 'authorization' : 'x-api-key'}`);
    if (request.method === 'OPTIONS') { response.writeHead(204); response.end(); return; }
    const authenticated = bearer
        ? request.headers.authorization === 'Bearer browser-fixture-key' && !request.headers['x-api-key']
        : request.headers['x-api-key'] === 'browser-fixture-key' && !request.headers.authorization;
    response.writeHead(authenticated ? 200 : 401, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(authenticated
        ? { data: [{ id: 'claude-browser-fixture' }] }
        : { error: { type: 'authentication_error', message: 'fixture authentication failed' } }));
});
await new Promise(resolve => api.listen(0, '127.0.0.1', resolve));
const apiUrl = `http://127.0.0.1:${api.address().port}`;
const script = `
import { normalizeAgentConfig } from './config.js';
import { buildAgentSettingsPanelMarkup } from './ui/settings-markup.js';
import { createAgentSettingsPanel, pullModelsForProvider } from './ui/settings-panel.js';
const apiUrl = ${JSON.stringify(apiUrl)};
const preset = { provider: 'anthropic', modelConfigs: { anthropic: {
    baseUrl: apiUrl + '/x-api-key', apiKey: 'browser-fixture-key', model: 'claude-browser-fixture',
} } };
let saved = normalizeAgentConfig({ currentPresetName: 'fixture', presets: { fixture: preset } });
const root = document.querySelector('#panel');
const state = { config: saved, configPage: 'main', configDraft: null, modelOptionsByProvider: {}, pullStateByProvider: {} };
const panel = createAgentSettingsPanel({ state, render,
    saveConfig(request) { saved = normalizeAgentConfig(request.payload); },
});
function render() {
    root.innerHTML = buildAgentSettingsPanelMarkup({ showAssistantPermissions: false, showWebSettings: false,
        activePage: state.configPage, showDelegateSettings: true });
    panel.syncConfigToForm(root);
    panel.bindSettingsPanelEvents(root);
}
render();
window.modelListAuthFixture = {
    saved: () => structuredClone(saved),
    reload() { state.config = saved; state.configDraft = null; render(); },
    theme(dark) { document.body.classList.toggle('theme-dark', dark); },
    async verifyCors() {
        const results = [];
        for (const provider of ['anthropic', 'sillytavern-claude']) {
            for (const modelListAuth of [undefined, 'x-api-key', 'bearer']) {
                const mode = modelListAuth || 'x-api-key';
                const models = await pullModelsForProvider({ provider, modelListAuth,
                    baseUrl: apiUrl + '/' + mode + '/' + provider + '/' + String(modelListAuth), apiKey: 'browser-fixture-key',
                }, { signal: AbortSignal.timeout(5000) });
                if (models.length !== 1 || models[0] !== 'claude-browser-fixture') throw new Error('wrong models');
                results.push({ provider, modelListAuth: mode, ok: true });
            }
        }
        return { results, requests: await (await fetch('/requests')).json() };
    },
};`;
const bundle = await build({ stdin: { contents: script, resolveDir: root, sourcefile: 'model-list-auth-browser.js' },
    bundle: true, write: false, format: 'esm', platform: 'browser', logLevel: 'silent' });
const css = await Promise.all([
    new URL('../../ui/settings-surface.css', import.meta.url),
    new URL('../../../xiaobai-os/apps/agent-api/ui/agent-api.css', import.meta.url),
].map(url => readFile(url, 'utf8')));
const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Agent model-list auth verification</title><style>
*{box-sizing:border-box}html,body{margin:0;height:100%}body{container-type:inline-size;container-name:os-stage}
.agent-api-app{--os-status-height:0px}.agent-api-scroll{padding-top:16px}
${css.join('\n')}
</style></head><body class="xiaobai-os-shell"><main class="agent-api-app"><div class="agent-api-scroll">
<div class="agent-api-content"><div id="panel" class="agent-api-panel xb-agent-settings-surface"></div></div>
</div></main><script type="module" src="/app.js"></script></body></html>`;
const page = createServer((request, response) => {
    if (request.url === '/app.js') {
        response.writeHead(200, { 'Content-Type': 'text/javascript' });
        response.end(bundle.outputFiles[0].text);
    } else if (request.url === '/requests') {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(requests));
    } else {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(html);
    }
});
await new Promise(resolve => page.listen(0, '127.0.0.1', resolve));
console.log(`Model-list auth browser fixture: http://127.0.0.1:${page.address().port}`);
