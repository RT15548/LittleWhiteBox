// Actual production Shell, Host, tools and file transactions; isolated files and a deterministic
// provider fixture. This exercises the transport without making paid GM or embedding requests.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import process from 'node:process';
import { userEconomyHarness } from '../user-economy-harness.js';
import { GAME_PARTITION } from '../../apps/game/partition.ts';
import { createGameService } from '../../apps/game/application/service.ts';
import { createGameController } from '../../apps/game/host/controller.ts';
import { ISLAND_PARTITION } from '../../apps/game/island/partition.ts';
import { createIslandService } from '../../apps/game/island/service.ts';
import { ISLAND_MEMORY_PARTITION, createIslandMemory } from '../../apps/game/island/agent/memory-store.ts';
import { withIslandRuntime } from '../../apps/game/island/host.ts';
import { LANDSCAPE, TIDE } from '../../apps/game/island/content.ts';
import { FOOD, INITIAL_RESOURCES } from '../../apps/game/island/survival-content.ts';
import { createItem } from '../../apps/game/island/inventory.ts';
import { withinReach } from '../../apps/game/island/space.ts';
import { newJourney } from '../../apps/game/island/world.ts';
import { settleDeath } from '../../apps/game/island/mortality.ts';
import { coconutWater, plainWater } from '../../apps/game/island/water.ts';
import { characterReviewWorld, driveCharacterReview } from './island-character-scene.mjs';

let events = [], harness, runtime, island, game;
const identity = 'island-browser';
const agent = { async loadConfig() { return {}; }, async openSession() {
    let round = 0;
    return { providerConfig: {}, supportsSessionToolLoop: false, async run(request) {
        if (round++) return { text: 'complete' };
        const data = JSON.parse(request.messages[0].content), calls = [];
        if (Object.hasOwn(data, 'intent')) {
            const operation = { kind: 'unwear', item: 'player-lifejacket' };
            const result = data.clarifications.length || data.intent === '脱下救生衣'
                ? { name: 'ProposeAction', args: { operation } }
                : { name: 'AskPlayer', args: { text: '要脱下哪件衣物？' } };
            return { toolCalls: [{ id: 'fixture-intent', name: result.name, arguments: JSON.stringify(result.args) }] };
        }
        for (const obs of data.observations) if (!obs.self.activity) calls.push({ actor: obs.observer, operation: { kind: 'rest', seconds: 3600 } });
        else if (data.due.includes(obs.observer)) calls.push({ actor: obs.observer, operation: { kind: 'intend', text: '先继续眼前的事，留意靠近的人。' } });
        for (const obs of data.observations) {
            const handover = obs.offers.find(o => o.to === obs.observer && o.from === 'player');
            if (handover) calls.push({ actor: obs.observer, operation: { kind: 'accept', from: handover.from } });
        }
        const lin = data.observations.find(o => o.observer === 'lin');
        const player = lin?.people.find(p => p.id === 'player');
        const returnItem = lin?.items.find(i => i.id === 'player-lifejacket' && i.location.kind === 'carried' && i.location.person === 'lin');
        const returning = returnItem && player && data.recent.entries.at(-1)?.payload.kind === 'speech'
            && data.recent.entries.at(-1).payload.actor === 'player'
            && withinReach(player.position, lin.self.position);
        const proposal = lin?.agreements.find(a => !a.commitments.some(c => c.actor === 'lin'));
        if (returning) {
            calls.push({ actor: 'lin', operation: { kind: 'cancel' } },
                { actor: 'lin', operation: { kind: 'offer', item: returnItem.id, units: 1, to: 'player' } },
                { actor: 'lin', operation: { kind: 'say', text: '我把救生衣还给你，接稳。' } });
        } else if (proposal) calls.push({ actor: 'lin', operation: { kind: 'declare', text: '我愿意，先按这个分工试一试。', choice: { kind: 'response', proposal: proposal.proposal, stance: 'accept' } } });
        else if (lin) calls.push({ actor: 'lin', operation: { kind: 'say', text: '林遥擦了一下脸上的海水。「先看看附近有没有能接水的东西吧。我缓一口气。」' } });
        return { toolCalls: calls.map((args, i) => ({ id: `fixture-${i}`, name: 'Act', arguments: JSON.stringify(args) })) };
    } };
} };
async function reset(files) {
    await runtime?.stopBackground?.(); game?.dispose();
    harness = await userEconomyHarness({ files, additionalPartitions: [ISLAND_PARTITION, ISLAND_MEMORY_PARTITION] });
    await harness.economy.ensureOpen();
    if (!files && process.env.ISLAND_REVIEW_SCENE === 'character') {
        await harness.store(ISLAND_PARTITION).transact(tx => tx.replace({ formatVersion: 1, revision: 1, active: characterReviewWorld(),
            last: { id: 'character-browser', fingerprint: '0'.repeat(64) } }));
    }
    if (!files && process.env.ISLAND_REVIEW_SCENE === 'remains') {
        let world = newJourney('remains-browser');
        world.people.lin.position = { x: world.people.player.position.x + 1, y: world.people.player.position.y };
        world = settleDeath(world, 'lin', 'trauma', LANDSCAPE);
        await harness.store(ISLAND_PARTITION).transact(tx => tx.replace({ formatVersion: 1, revision: 1, active: world,
            last: { id: 'remains-browser', fingerprint: '0'.repeat(64) } }));
    }
    const vantage = {
        camp: { x: -706, y: 0 }, hygiene: { x: -701, y: 5 }, water: { x: -706, y: 0 }, people: { x: -706, y: 0 }, food: { x: -706, y: 0 }, forest: { x: -620, y: 30 },
        reef: INITIAL_RESOURCES.east_pools.position, reef_high: INITIAL_RESOURCES.east_pools.position,
        reef_low: INITIAL_RESOURCES.east_pools.position, mangrove: { x: -70, y: 350 },
    }[process.env.ISLAND_REVIEW_SCENE];
    if (!files && vantage) {
        // Synthetic visual-review viewpoints, not a completed gameplay or model-quality run.
        let world = newJourney('landscape-browser'); world.people.player.position = { ...vantage };
        if (process.env.ISLAND_REVIEW_SCENE === 'reef_high') { world.clock = Math.round(TIDE.periodSeconds / 4); }
        if (process.env.ISLAND_REVIEW_SCENE === 'reef_low') { world.clock = Math.round(TIDE.periodSeconds * 1.75); }
        if (process.env.ISLAND_REVIEW_SCENE === 'food') {
            world.clock = FOOD.odorAfterSeconds + 1;
            createItem(world, 'player', 'fish', 2);
            const old = createItem(world, 'player', 'fish', 2); world.items[old].foodSince = 0;
            world.people.lin.position = { x: vantage.x + 1, y: vantage.y };
            const offered = createItem(world, 'lin', 'cooked_fish', 1); world.items[offered].foodSince = 0;
            world.people.lin.activity = { kind: 'offer', item: offered, to: 'player', units: 1 };
        }
        if (['camp', 'food', 'people', 'water', 'hygiene'].includes(process.env.ISLAND_REVIEW_SCENE)) {
            const site = (kind, x, y, workLeft = 0) => ({ kind, position: { x, y }, builder: 'player', workLeft, water: null, fuelSeconds: 0, burning: false });
            world.structures = {
                roof: site('shelter', -709, -5), frame: site('shelter', -700, -6, 1800),
                screen: site('latrine', -701, 5),
                fire: { ...site('firepit', -709, 1), fuelSeconds: 4200, burning: true },
                rain: { ...site('raincatcher', -700, 0), water: { millilitres: 1800, quality: 'untreated', coconut: null } },
            };
        }
        if (process.env.ISLAND_REVIEW_SCENE === 'hygiene') {
            world.people.player.body.needs.soiling = .65;
            world.people.player.body.needs.bowel = 180;
            world.structures.rain.position = { x: vantage.x + 1, y: vantage.y };
        }
        if (process.env.ISLAND_REVIEW_SCENE === 'water') {
            world.clock = FOOD.odorAfterSeconds + 1;
            const coconut = createItem(world, 'player', 'coconut_open', 1);
            world.items[coconut].foodSince = 0; world.items[coconut].water = coconutWater(300, 0);
            createItem(world, 'player', 'metal_cup', 1);
            const bottle = createItem(world, 'player', 'bottle', 1); world.items[bottle].water = plainWater(100, 'treated');
            world.people.lin.position = { x: vantage.x + 1, y: vantage.y };
            const shell = createItem(world, 'lin', 'shell', 1); world.items[shell].water = coconutWater(200, 0);
            world.people.lin.activity = { kind: 'offer', item: shell, units: 1, to: 'player' };
        }
        if (process.env.ISLAND_REVIEW_SCENE === 'people') {
            // Deliberately staged poses. Subsequent actions use the production domain rules.
            world.people.lin.position = { x: -707, y: -.5 };
            world.people.zhou.position = { x: -703, y: -1 };
            world.people.chen.position = { x: -709, y: 3 };
            world.people.xu.position = { x: -704, y: 1 };
            world.people.ye.position = { x: -701, y: -6 };
            world.people.luo.position = { x: -710, y: -1 };
            world.people.zhou.activity = { kind: 'rest', until: 3600 };
            world.people.chen.activity = { kind: 'rest', until: 3600 };
            world.people.ye.activity = { kind: 'construct', site: 'frame' };
            const branch = createItem(world, 'luo', 'branch', 1);
            world.items[branch].location = { kind: 'ground', position: { ...world.people.luo.position } };
            world.people.luo.activity = { kind: 'take', item: branch, until: 30 };
            world.items['lin-lifejacket'].location = { kind: 'carried', person: 'lin' };
            world.people.lin.activity = { kind: 'offer', item: 'lin-lifejacket', to: 'player', units: 1 };
            world = settleDeath(world, 'xu', 'trauma', LANDSCAPE);
            createItem(world, 'player', 'palm_leaf', 2);
        }
        await harness.store(ISLAND_PARTITION).transact(tx => tx.replace({ formatVersion: 1, revision: 1, active: world,
            last: { id: 'landscape-browser', fingerprint: '0'.repeat(64) } }));
    }
    game = createGameService(harness.store(GAME_PARTITION), harness.transactions, harness.economy);
    island = createIslandService(harness.store(ISLAND_PARTITION), harness.transactions);
    const memory = createIslandMemory(harness.store(ISLAND_MEMORY_PARTITION), harness.transactions);
    await game.refreshCurrent(); await island.refresh();
    runtime = withIslandRuntime(createGameController({ game, economy: harness.economy, getChatIdentity: () => identity,
        isMainGenerationActive: () => false, subscribeGeneration: () => () => {} }), island, memory, agent, () => identity, () => true);
}
const activate = () => runtime.activate({ post: (type, payload) => { events.push({ type, payload }); return true; } });
await reset();
const dist = resolve(process.env.XIAOBAI_OS_OUT_DIR), root = resolve('.');
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>Island isolated production verification</title><style>html,body{margin:0;height:100%;background:#edf4f7}iframe{width:100%;height:100%;border:0;display:block}</style></head><body><iframe title="OS" src="/modules/xiaobai-os/shell/xiaobai-os.html"></iframe><script type="module" src="/__island/bridge.js"></script></body></html>`;
const bridge = `const frame=document.querySelector('iframe'),source='LittleWhiteBox-XiaobaiOS';let session=null,seq=0;
function send(type,payload,requestId,app=session){frame.contentWindow.postMessage({source,type,payload,requestId,...app},location.origin)}
window.islandReview=async input=>{const r=await(await fetch('/__island/character',{method:'POST',body:JSON.stringify(input)})).json();if(!r.ok)throw Error(r.message);for(const e of r.events??[])send(e.type,e.payload);return r.result;};
window.addEventListener('message',async({data:m,origin,source:sender})=>{if(origin!==location.origin||sender!==frame.contentWindow||m?.source!==source)return;
const {type,payload,requestId}=m;if(type==='os/frame-ready'){send('os/init',{theme:'light',apps:[{id:'game'}],chat:{}},undefined,null);return;}
if(type==='app/activate'){session={appId:payload.appId,activationToken:'island-'+ ++seq};const r=await(await fetch('/__island/activate')).json();send('app/activated',{ok:r.ok,...session,state:r.result},requestId,null);return;}
if(type==='app/deactivate'||type==='os/close'){session=null;await fetch('/__island/deactivate');return;}if(!session)return;const active=session;
const r=await(await fetch('/__island/action',{method:'POST',body:JSON.stringify({type,payload})})).json();if(active!==session)return;send('reply',r,requestId);for(const e of r.events??[])send(e.type,e.payload);});`;
createServer(async (req, res) => {
    try {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname === '/') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(html); return; }
        if (url.pathname === '/__island/bridge.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(bridge); return; }
        if (url.pathname.startsWith('/__island/')) {
            let result;
            switch (url.pathname.slice(10)) {
                case 'activate': result = await activate(); break;
                case 'deactivate': await runtime.deactivate('preview'); break;
                case 'view': result = island.view(); break;
                case 'reset': await reset(); result = await activate(); break;
                case 'reload': await reset(harness.state.files); result = await activate(); break;
                case 'mode': harness.state.mode = url.searchParams.get('value'); result = harness.state.mode; break;
                case 'character': {
                    if (process.env.ISLAND_REVIEW_SCENE !== 'character') { throw new Error('character_review_disabled'); }
                    let body = ''; for await (const part of req) body += part;
                    const input = JSON.parse(body);
                    if (input.kind === 'fatal-scene') {
                        const store = harness.store(ISLAND_PARTITION);
                        await store.transact(tx => {
                            const data = tx.currentOrInitial();
                            tx.replace({ ...data, revision: data.revision + 1, active: settleDeath(data.active, 'ye', 'trauma', LANDSCAPE),
                                last: { id: `character-fatal-${data.revision}`, fingerprint: '0'.repeat(64) } });
                        });
                        result = await island.refresh();
                    } else { result = await driveCharacterReview(island, input); }
                    events.push({ type: 'game/island/state', payload: { chatIdentity: identity, state: { ...result, thinking: false, interpreting: false, memoryPending: false } } });
                    break;
                }
                case 'action': { let body = ''; for await (const part of req) body += part; result = await runtime.handleMessage(JSON.parse(body)); break; }
                default: throw new Error('preview_unknown');
            }
            const outgoing = events; events = []; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ ok: true, result, events: outgoing })); return;
        }
        const prefix = '/modules/xiaobai-os/dist/';
        if (!url.pathname.startsWith(prefix) && url.pathname !== '/modules/xiaobai-os/shell/xiaobai-os.html') throw new Error('preview_path');
        const base = url.pathname.startsWith(prefix) ? dist : root;
        const path = resolve(base, base === dist ? decodeURIComponent(url.pathname.slice(prefix.length)) : '.' + url.pathname);
        if (!path.startsWith(base + sep)) throw new Error('preview_path');
        res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' })[extname(path)] ?? 'application/octet-stream'); res.end(await readFile(path));
    } catch (error) {
        const outgoing = events; events = [];
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: false, error: error.code ?? error.message, message: error.message, events: outgoing }));
    }
}).listen(Number(process.env.ISLAND_REVIEW_PORT ?? 18929), '127.0.0.1', function () { console.log(`Island verification: http://127.0.0.1:${this.address().port}/`); });
