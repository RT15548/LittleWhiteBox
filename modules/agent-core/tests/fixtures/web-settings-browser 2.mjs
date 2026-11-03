// Real settings UI and cross-origin transport; fake credentials and deterministic provider responses.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const requests = [];
const api = createServer(async (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'content-type,x-api-key,authorization');
    if (request.method === 'OPTIONS') { response.writeHead(204); response.end(); return; }
    let text = '';
    for await (const chunk of request) text += chunk;
    const body = JSON.parse(text);
    const provider = request.url.split('/')[1];
    const authenticated = provider === 'exa' ? request.headers['x-api-key'] === 'exa-fixture'
        : body.api_key === 'tavily-fixture' || request.headers.authorization === 'Bearer tavily-fixture';
    requests.push({ provider, endpoint: request.url, authenticated });
    response.writeHead(authenticated ? 200 : 401, { 'Content-Type': 'application/json' });
    const url = 'https://example.org/article';
    response.end(JSON.stringify(!authenticated ? { error: 'fixture auth failed' } : request.url.endsWith('/search')
        ? { results: [{ title: 'Browser reference', url, content: 'Excerpt', highlights: ['Excerpt'] }] }
        : { results: [{ url, text: 'Page body', raw_content: 'Page body' }], statuses: [{ id: url, status: 'success' }] }));
});
await new Promise(resolve => api.listen(0, '127.0.0.1', resolve));
const apiUrl = `http://127.0.0.1:${api.address().port}`;
const root = fileURLToPath(new URL('../../', import.meta.url));
const script = `
import { normalizeAgentConfig } from './config.js';
import { buildAgentSettingsPanelMarkup } from './ui/settings-markup.js';
import { createAgentSettingsPanel } from './ui/settings-panel.js';
import { runWebSearchTool, runWebFetchTool } from './web/tools.js';
let saved = normalizeAgentConfig({ tavilyApiKey: 'tavily-fixture',
    tavilyBaseUrl: '${apiUrl}/tavily', exaBaseUrl: '${apiUrl}/exa' });
const root = document.querySelector('#panel');
const state = { config: saved, configPage: 'main', configDraft: null, modelOptionsByProvider: {}, pullStateByProvider: {} };
const panel = createAgentSettingsPanel({ state, render, saveConfig(request) { saved = normalizeAgentConfig(request.payload); } });
function render() {
    root.innerHTML = buildAgentSettingsPanelMarkup({ showAssistantPermissions: false, showWebSettings: true, showDelegateSettings: false });
    panel.syncConfigToForm(root); panel.bindSettingsPanelEvents(root);
}
render();
window.webSettingsFixture = {
    selection: () => ({ provider: saved.webProvider, exaConfigured: Boolean(saved.exaApiKey), tavilyConfigured: Boolean(saved.tavilyApiKey) }),
    reload() { state.config = saved; state.configDraft = null; state.configFormSyncPending = true; render(); },
    theme(dark) { document.body.classList.toggle('theme-dark', dark); },
    async verify() {
        const search = await runWebSearchTool(saved, { query: 'reference' });
        if (!search.ok || search.results[0]?.content !== 'Excerpt') throw new Error(JSON.stringify(search));
        const contents = await runWebFetchTool(saved, { urls: [search.results[0].url] });
        if (!contents.ok || contents.results[0]?.text !== 'Page body') throw new Error(JSON.stringify(contents));
        return { provider: saved.webProvider, search: search.ok, contents: contents.ok, requests: await (await fetch('/requests')).json() };
    },
};`;
const bundle = await build({ stdin: { contents: script, resolveDir: root, sourcefile: 'web-settings-browser.js' },
    bundle: true, write: false, format: 'esm', platform: 'browser', logLevel: 'silent' });
const css = await Promise.all([
    new URL('../../ui/settings-surface.css', import.meta.url),
    new URL('../../../xiaobai-os/apps/agent-api/ui/agent-api.css', import.meta.url),
].map(url => readFile(url, 'utf8')));
const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Agent web settings verification</title><style>
*{box-sizing:border-box}html,body{margin:0;height:100%}body{container-type:inline-size;container-name:os-stage}
.agent-api-app{--os-status-height:0px}.agent-api-scroll{padding-top:16px}
${css.join('\n')}
</style></head><body class="xiaobai-os-shell"><main class="agent-api-app"><div class="agent-api-scroll">
<div class="agent-api-content"><div id="panel" class="agent-api-panel xb-agent-settings-surface"></div></div>
</div></main><script type="module" src="/app.js"></script></body></html>`;
const page = createServer((request, response) => {
    if (request.url.endsWith('/shared/server-plugin/installation-guide.css')) {
        readFile(new URL('../../../../shared/server-plugin/installation-guide.css', import.meta.url), 'utf8').then(css => {
            response.writeHead(200, { 'Content-Type': 'text/css' });
            response.end(css);
        }).catch(error => { console.error(error); response.writeHead(500).end(); });
        return;
    }
    if (request.url.endsWith('/modules/agent-core/ui/web-settings.css')) {
        readFile(new URL('../../ui/web-settings.css', import.meta.url), 'utf8').then(css => {
            response.writeHead(200, { 'Content-Type': 'text/css' });
            response.end(css);
        }).catch(error => { console.error(error); response.writeHead(500).end(); });
        return;
    }
    const script = request.url === '/app.js', receipts = request.url === '/requests';
    response.writeHead(200, { 'Content-Type': script ? 'text/javascript' : receipts ? 'application/json' : 'text/html; charset=utf-8' });
    response.end(script ? bundle.outputFiles[0].text : receipts ? JSON.stringify(requests) : html);
});
await new Promise(resolve => page.listen(0, '127.0.0.1', resolve));
console.log(`Web settings browser fixture: http://127.0.0.1:${page.address().port}`);
