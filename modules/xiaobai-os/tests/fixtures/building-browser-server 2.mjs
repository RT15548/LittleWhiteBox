// Loopback-only production Shell/Host verification. Real transactions, memory storage; never a real wallet.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import process from 'node:process';
import { userEconomyHarness } from '../user-economy-harness.js';
import { createBuildingService } from '../../apps/game/building/service.ts';
import { BUILDING_PARTITION } from '../../apps/game/building/partition.ts';
import { withBuildingRuntime } from '../../apps/game/building/host.ts';
import { constructionPlans } from '../../apps/game/building/generation.ts';
import { drawOffers } from '../../apps/game/building/supply.ts';
import { testOffers } from './building-supply-fixture.mjs';
import { projectBlueprint } from '../../apps/game/building/domain.ts';
import { createMovingService } from '../../apps/game/moving/service.ts';
import { MOVING_PARTITION } from '../../apps/game/moving/partition.ts';
import { withMovingRuntime } from '../../apps/game/moving/host.ts';
import { createGameService } from '../../apps/game/application/service.ts';
import { GAME_PARTITION } from '../../apps/game/partition.ts';
import { createGameController } from '../../apps/game/host/controller.ts';
import { createSettingsRepository } from '../../host/settings-repository.ts';
let harness, building, game, runtime, identity = 'building-preview', events = [], seed = 17;
let scriptedSupply = false;
const settingsRoot = {};
const settings = createSettingsRepository({ getExtensionSettings: () => settingsRoot, saveSettings() {} });
await settings.prepare();
async function reset(files) {
    await runtime?.stopBackground?.(); game?.dispose();
    harness = await userEconomyHarness({ files }); await harness.economy.ensureOpen();
    building = createBuildingService(harness.store(BUILDING_PARTITION), harness.transactions, harness.economy,
        { seed: () => seed++, draw: () => scriptedSupply ? testOffers() : drawOffers(), soundEnabled: () => settings.read().apps.game.buildingSoundEnabled });
    const moving = createMovingService(harness.store(MOVING_PARTITION), harness.transactions, harness.economy,
        { soundEnabled: () => settings.read().apps.game.movingSoundEnabled });
    game = createGameService(harness.store(GAME_PARTITION), harness.transactions, harness.economy);
    await game.refreshCurrent(); await moving.refresh(); await building.refresh();
    runtime = withBuildingRuntime(withMovingRuntime(createGameController({ game, economy: harness.economy, getChatIdentity: () => identity,
        isMainGenerationActive: () => false, subscribeGeneration: () => () => {} }), moving, () => identity, settings), building, () => identity, settings);
    await runtime.startBackground();
}
async function activate() { return runtime.activate({ post: (type, payload) => { events.push({ type, payload }); return true; } }); }
await reset();
// A copied fixture seeds a new isolated preview; it never writes back to the source file.
if (process.env.BUILDING_PREVIEW_FIXTURE) {
    const files = new Map(harness.state.files), filename = [...files.keys()][0];
    if (!filename || files.size !== 1) { throw new Error('preview_fixture_file_identity'); }
    files.set(filename, JSON.parse(await readFile(resolve(process.env.BUILDING_PREVIEW_FIXTURE), 'utf8')));
    await reset(files);
}
const root = resolve('.');
const distRoot = resolve(process.env.XIAOBAI_OS_OUT_DIR || 'modules/xiaobai-os/dist');
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>Building isolated verification</title><style>html,body{margin:0;height:100%;background:#edf4f7}iframe{width:100%;height:100%;border:0;display:block}</style></head><body><iframe title="OS" src="/modules/xiaobai-os/shell/xiaobai-os.html"></iframe><script type="module" src="/__building/bridge.js"></script></body></html>`;
const bridge = `const frame=document.querySelector('iframe'),source='LittleWhiteBox-XiaobaiOS';let session=null,seq=0;const log=[];
function send(type,payload,requestId,app=session){frame.contentWindow.postMessage({source,type,payload,requestId,...app},location.origin)}
window.buildingPreview={log,theme:theme=>send('os/theme-changed',{theme})};
window.addEventListener('message',async({data:m,origin,source:sender})=>{if(origin!==location.origin||sender!==frame.contentWindow||m?.source!==source)return;
const {type,payload,requestId}=m;log.push({type,payload});if(type==='os/frame-ready'){send('os/init',{theme:'light',apps:[{id:'game'}],chat:{}},undefined,null);return;}
if(type==='app/activate'){session={appId:payload.appId,activationToken:'building-preview-'+ ++seq};const r=await(await fetch('/__building/activate')).json();send('app/activated',{ok:r.ok,...session,state:r.result},requestId,null);return;}
if(type==='app/deactivate'||type==='os/close'){session=null;await fetch('/__building/deactivate');return;}if(!session)return;const active=session;
const r=await(await fetch('/__building/action',{method:'POST',body:JSON.stringify({type,payload})})).json();if(active!==session)return;send('reply',r,requestId);for(const e of r.events??[])send(e.type,e.payload);});`;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
createServer(async (req, res) => {
    try {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname === '/') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(html); return; }
        if (url.pathname === '/__building/bridge.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(bridge); return; }
        if (url.pathname.startsWith('/__building/')) {
            let result;
            switch (url.pathname.slice('/__building/'.length)) {
                case 'activate': result = await activate(); break;
                case 'deactivate': await runtime.deactivate('preview'); break;
                case 'reset': identity = 'building-preview'; seed = Number(url.searchParams.get('seed') ?? 17); scriptedSupply = url.searchParams.get('supplies') === 'fixture'; await reset(); result = await activate(); break;
                case 'reload': await reset(harness.state.files); result = await activate(); break;
                case 'chat': identity = url.searchParams.get('id'); harness.switchStory(identity); await runtime.handleChatChanged(); result = await activate(); break;
                case 'mode': harness.state.mode = url.searchParams.get('value'); result = harness.state.mode; break;
                case 'view': result = building.view(); break;
                case 'inspect': result = { view: building.view(), plans: building.view().active ? constructionPlans(projectBlueprint(building.view().active)).map(rooms => ({ rooms })) : null,
                    document: harness.document(), settings: settings.read() }; break;
                case 'action': {
                    let body = ''; for await (const part of req) { body += part; }
                    result = await runtime.handleMessage(JSON.parse(body)); break;
                }
                default: throw new Error('unknown_preview_request');
            }
            const outgoing = events; events = []; res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, result, events: outgoing })); return;
        }
        if (!['/modules/xiaobai-os/dist/', '/modules/xiaobai-os/shell/'].some(p => url.pathname.startsWith(p))) { throw new Error('outside_preview'); }
        const distPrefix = '/modules/xiaobai-os/dist/';
        const base = url.pathname.startsWith(distPrefix) ? distRoot : root;
        const relative = base === distRoot ? decodeURIComponent(url.pathname.slice(distPrefix.length)) : '.' + decodeURIComponent(url.pathname);
        const path = resolve(base, relative); if (!path.startsWith(base + sep)) { throw new Error('outside_root'); }
        res.setHeader('Content-Type', types[extname(path)] ?? 'application/octet-stream'); res.end(await readFile(path));
    } catch (error) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ ok: false, error: error.code ?? error.message, message: error.message })); }
}).listen(Number(process.env.BUILDING_PREVIEW_PORT ?? 18914), '127.0.0.1', function () { console.log(`Building verification: http://127.0.0.1:${this.address().port}/`); });
