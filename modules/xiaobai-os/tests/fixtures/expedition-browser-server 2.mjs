// Loopback-only production Shell/Host verification. Memory files, no user wallet or model requests.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import process from 'node:process';
import { userEconomyHarness } from '../user-economy-harness.js';
import { createExpeditionService } from '../../apps/game/expedition/service.ts';
import { EXPEDITION_PARTITION } from '../../apps/game/expedition/partition.ts';
import { withExpeditionRuntime } from '../../apps/game/expedition/host.ts';
import { createGameService } from '../../apps/game/application/service.ts';
import { GAME_PARTITION } from '../../apps/game/partition.ts';
import { createGameController } from '../../apps/game/host/controller.ts';
import { campaignDriver } from './campaign-driver.mjs';
import { journey } from './expedition-traveler.js';

let service, game, runtime, harness, events = [];
const identity = 'expedition-browser';
async function reset(weapon = 'blade') {
    await runtime?.stopBackground?.(); game?.dispose();
    harness = await userEconomyHarness(); await harness.economy.ensureOpen();
    service = createExpeditionService(harness.store(EXPEDITION_PARTITION), harness.transactions, harness.economy, { seed: () => 7 });
    game = createGameService(harness.store(GAME_PARTITION), harness.transactions, harness.economy);
    await game.refreshCurrent(); await service.refresh();
    runtime = withExpeditionRuntime(createGameController({ game, economy: harness.economy, getChatIdentity: () => identity,
        isMainGenerationActive: () => false, subscribeGeneration: () => () => {} }), service, () => identity);
    await runtime.startBackground(); await act({ type: 'start', weapon, outfit: 'traveler', ...journey });
}
const act = command => service.act({ actionId: crypto.randomUUID(), revision: service.view().data.revision, command }, () => true);
const activate = () => runtime.activate({ post: (type, payload) => { events.push({ type, payload }); return true; } });
async function prepare(stage, weapon, cue) {
    await reset(weapon);
    const driver = campaignDriver(() => service.view().data.active, act);
    await driver.walk('clinic'); await act({ type: 'choice', id: 'briefing', person: 'sanniang' });
    if (stage === 'roots') { await driver.complete('waterway'); await driver.interact('road'); await driver.interact('roots'); await driver.walk('encounter', false); }
    else {
        await driver.interact('road');
        if (stage === 'cache') {
            await driver.walk('encounter', false);
            while (service.view().data.active.phase === 'battle') { await driver.combatTicks(180); }
            await driver.walk('reward');
        } else {
            await driver.interact('waterway'); await driver.walk('encounter', false);
            await driver.battle();
            if (stage === 'keeper') { await driver.walk('encounter', false); }
            else {
                await driver.interact('sluice'); await driver.interact('cells'); await driver.interact('hall'); await driver.walk('encounter', false);
            }
        }
    }
    if (cue) {
        // Advance only through normal inputs; inspect real attack frames, never fabricate boss state.
        const reached = () => {
            const battle = service.view().data.active.battle;
            return cue === 'ring' ? battle?.hazards.some(h => h.kind === 'ring' && h.gap && h.wait > 20)
                : cue === 'phase3' && battle?.enemies.some(e => e.kind === 'warden' && e.phase === 3);
        };
        for (let tick = 0; tick < 9000 && !reached(); tick++) {
            if (service.view().data.active.phase !== 'battle') { throw new Error('cue_not_reached'); }
            await driver.combatTicks(1);
        }
        if (!reached()) { throw new Error('cue_not_reached'); }
    }
    return activate();
}
await reset();
const root = resolve('.'), dist = resolve(process.env.XIAOBAI_OS_OUT_DIR || 'modules/xiaobai-os/dist');
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>余火隔离验收</title><style>html,body{margin:0;height:100%;background:#edf4f7}iframe{width:100%;height:100%;border:0;display:block}</style></head><body><iframe title="OS" src="/modules/xiaobai-os/shell/xiaobai-os.html"></iframe><script type="module" src="/__expedition/bridge.js"></script></body></html>`;
const bridge = `const frame=document.querySelector('iframe'),source='LittleWhiteBox-XiaobaiOS';let session=null,seq=0;
function send(type,payload,requestId,app=session){frame.contentWindow.postMessage({source,type,payload,requestId,...app},location.origin)}
window.addEventListener('message',async({data:m,origin,source:sender})=>{if(origin!==location.origin||sender!==frame.contentWindow||m?.source!==source)return;
const {type,payload,requestId}=m;if(type==='os/frame-ready'){send('os/init',{theme:'light',apps:[{id:'game'}],chat:{}},undefined,null);return;}
if(type==='app/activate'){session={appId:payload.appId,activationToken:'expedition-preview-'+ ++seq};const r=await(await fetch('/__expedition/activate')).json();send('app/activated',{ok:r.ok,...session,state:r.result},requestId,null);return;}
if(type==='app/deactivate'||type==='os/close'){session=null;await fetch('/__expedition/deactivate');return;}if(!session)return;const active=session;
const r=await(await fetch('/__expedition/action',{method:'POST',body:JSON.stringify({type,payload})})).json();if(active!==session)return;send('reply',r,requestId);for(const e of r.events??[])send(e.type,e.payload);});`;
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
createServer(async (req, res) => {
    try {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname === '/') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(html); return; }
        if (url.pathname === '/__expedition/bridge.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(bridge); return; }
        if (url.pathname.startsWith('/__expedition/')) {
            let result;
            switch (url.pathname.slice('/__expedition/'.length)) {
                case 'activate': result = await activate(); break;
                case 'deactivate': await runtime.deactivate('preview'); break;
                case 'inspect': result = service.view(); break;
                case 'prepare': result = await prepare(url.searchParams.get('stage'), url.searchParams.get('weapon') ?? 'blade', url.searchParams.get('cue')); break;
                case 'action': { let body = ''; for await (const part of req) body += part; result = await runtime.handleMessage(JSON.parse(body)); break; }
                default: throw new Error('unknown_preview_request');
            }
            const outgoing = events; events = []; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ ok: true, result, events: outgoing })); return;
        }
        const prefix = '/modules/xiaobai-os/dist/';
        if (![prefix, '/modules/xiaobai-os/shell/', '/modules/xiaobai-os/docs/expedition-cards/'].some(p => url.pathname.startsWith(p))) throw new Error('outside_preview');
        const base = url.pathname.startsWith(prefix) ? dist : root;
        const path = resolve(base, base === dist ? decodeURIComponent(url.pathname.slice(prefix.length)) : '.' + decodeURIComponent(url.pathname));
        if (!path.startsWith(base + sep)) throw new Error('outside_root');
        res.setHeader('Content-Type', mime[extname(path)] ?? 'application/octet-stream'); res.end(await readFile(path));
    } catch (error) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ ok: false, error: error.code ?? error.message, message: error.message })); }
}).listen(18917, '127.0.0.1', function () { console.log(`Expedition verification: http://127.0.0.1:${this.address().port}/`); });
