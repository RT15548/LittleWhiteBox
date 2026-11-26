import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { fixture, accepted } from './fixture.js';
import { extensionExample as diceExample, marketToolExample } from '../extensions/example.js';
import { createSettlementService } from '../runtime/service.js';
import { compileDefinition } from '../definition/compile.js';
import { initialize, settle } from '../engine/settle.js';
import { createExtensionRun } from '../extensions/runtime.js';
import { activeTools, extensionPath, TOOL_CALL_LIMIT } from '../extensions/definition.js';
import { inspectInput } from '../engine/input.js';
import { buildUpdateTask } from '../model/prompts.js';
import { projectVariableFiles, variableBundleFromFiles, prepareVariableWrite } from '../definition/card-files.js';
import { diagnostic, reject } from '../engine/diagnostics.js';
import { digest } from '../definition/digest.js';
import { modelSource } from '../definition/stages.js';
import { beforeOutcome, beforeReceipt, beforeFloorOutcome } from '../runtime/before-result.js';
import { mergeAbortSignals } from '../../../../shared/common/abort-utils.js';
import { correctionTask } from '../../updater/correction.js';
import { handoffReceipt } from '../../updater/handoff.js';
import type { Json, Result, ExtensionTrace } from '../types.js';
import type { AgentChatInput, AgentChatResult } from '../../../agent-core/public-api.js';
import { recordResult } from '../runtime/history.js';
import { replayExtension } from '../extensions/replay.js';
import { createFunctionRunner } from '../engine/functions.js';
import { clone } from '../engine/data.js';
import { buildDescriptionView, buildUpdateView } from '../model/views.js';
import { memberRulesExample } from '../skill/references/examples/member-rules.js';

// X1–X8 correspond to the approved acceptance contracts: protocol/cost,
// stable facts, atomicity, one-time effects, context isolation and package loss.
function extensionExample() {
    const bundle = diceExample();
    // Synthetic instrumentation covers the runtime phases without teaching
    // authors to add a redundant tool or script to the dice example.
    bundle.definition.extensions!.tools = {inspect_party:{title:'Fixture',description:'Fixture state read',enabled:true,
        stages:['before','after'],parameters:{type:'object',properties:{},additionalProperties:false}}};
    bundle.tools = {inspect_party:'return run.state.party;'};
    bundle.definition.extensions!.scripts!.calculate={title:'Fixture',description:'Fixture calculation',enabled:true};
    bundle.scripts!.calculate='input => input.submission.some(item => item.action === "march") ? [{op:"inc",path:["party","stamina"],delta:1}] : []';
    return bundle;
}
async function harness() {
    const f = fixture(), bundle = extensionExample();
    const counters = { prepare: 0, after: 0 };
    bundle.scripts!.prepare = 'ctx.prepare++; return {roll: 3};';
    bundle.scripts!.committed = 'ctx.after++; return input;';
    accepted(await f.service.enable(bundle));
    const host = { authorize: async () => {}, context: () => counters, passage: () => 'March.' };
    return { ...f, bundle, counters, host, service: createSettlementService(f.adapter, host) };
}
const march = [{ action: 'march', params: {} }];

test('authoring examples resolve external prices and preserve dynamic member rules', async () => {
    const bundle=diceExample();
    bundle.definition.extensions!.tools={market_prices:marketToolExample.declaration};
    bundle.tools={market_prices:marketToolExample.source};
    const quotes={entries:{0:{comment:'Camel',content:'Buy 40; sell 30',disable:false},1:{comment:'Old',content:'obsolete',disable:true}}};
    const run=createExtensionRun(bundle,{state:bundle.definition.initial,target:{floor:0,swipeId:0},assertCurrent(){}},
        {authorize:async()=>{},context:()=>({loadWorldInfo:async(name:string)=>{assert.equal(name,'Market');return quotes;}}),passage:()=>''});
    assert.deepEqual(await run.tool('market_prices',{book:'Market'},'before'),[{name:'Camel',prices:'Buy 40; sell 30'}]);
    const compiled=compileDefinition(memberRulesExample());
    const initial=accepted(await initialize(compiled));
    const joined=accepted(await settle(compiled,initial.state,[
        {op:'set',path:['guild','members','A'],value:{identity:'guard',mood:20}},
        {op:'set',path:['guild','members','B'],value:{identity:'merchant',mood:-20}},
        {op:'inc',path:['guild','reputation'],delta:4},
    ]));
    assert.deepEqual(joined.state,{guild:{members:{A:{identity:'guard',mood:5},B:{identity:'merchant',mood:-5}},reputation:4}});
    const unchanged=accepted(await settle(compiled,joined.state,[{op:'set',path:['guild','reputation'],value:1}]));
    assert.deepEqual(unchanged.state,joined.state);
    assert.equal((await settle(compiled,joined.state,[{op:'set',path:['guild','members','A','identity'],value:'mage'}])).ok,false);
});

test('X2/X3: pure preview, one preparation across correction, identical preflight and commit, compact receipt', async () => {
    const h = await harness();
    const preview = accepted(await h.service.preview(march, { stage: 'before', prepared: { roll: 3 } }));
    assert.deepEqual(h.counters, { prepare: 0, after: 0 });
    const staged = await h.service.stage();
    await staged.prepare(march, 'before');
    assert.equal((await staged.run([{action:'missing',params:{}}], { stage:'before' })).ok, false);
    await staged.prepare(march, 'before');
    const preflight = accepted(await staged.run(march, { stage: 'before', prepared: {roll:3} }));
    const committed = accepted(await staged.run(march, { preview:false, stage:'before', source:'model:before' }));
    assert.deepEqual(committed.state, preflight.state); assert.deepEqual(committed.state, preview.state);
    assert.deepEqual(h.counters, { prepare:1, after:1 });
    assert.deepEqual(committed.actions[0].params, {roll:3});
    assert.deepEqual(committed.extensions!.calls.map(call=>call.kind), ['prepare','calculate','committed']);
    assert.equal('extensions' in h.saved().records[0].entries[0], false);
    assert.deepEqual(h.saved().records[0].entries[0].actions[0], {id:'march',params:{roll:3}});
});

test('X3: calculation bypasses direct switch but retains derived protection, final checks and atomicity', async () => {
    const h = await harness();
    for (const [source, code] of [
        ['() => [{op:"inc",path:["party","stamina"],delta:-100}]','state-schema'],
        ['() => [{op:"set",path:["outside"],value:1}]','unowned-root'],
    ]) {
        h.bundle.scripts!.calculate = source; h.setCard(h.bundle);
        const before = h.saved();
        let result: Result;
        try {result = await h.service.apply([], {stage:'before'});} catch(error) {result={ok:false,diagnostics:[diagnostic(error)]};}
        assert.equal(result.ok,false); assert.equal(result.diagnostics[0].code,'extension-calculation'); assert.equal((result.diagnostics[0].cause as {code:string}).code,code);
        assert.deepEqual(h.saved(),before);
    }
    h.bundle.definition.rules.push({id:'fixed',kind:'derive',path:['party','roll'],value:{literal:0},description:'Fixed die.'});
    h.bundle.scripts!.calculate = '() => [{op:"set",path:["party","roll"],value:2}]'; h.setCard(h.bundle);
    const denied = await h.service.apply([]);
    assert.equal(denied.ok,false); assert.equal(denied.diagnostics[0].code,'extension-calculation'); assert.equal((denied.diagnostics[0].cause as {code:string}).code,'derived-write');
});

test('X4/X5: publication executes effect once even if save fails; restore/reopen do not; stale await cannot publish', async () => {
    const h = await harness(); h.failSave();
    const result = accepted(await h.service.apply(march)); assert.equal(result.saved,false);
    assert.equal(h.counters.after,1);
    await h.service.undo(); h.load(h.saved()); await h.service.inspect();
    assert.equal(h.counters.after,1);
    let release!:()=>void;
    const wait = new Promise<void>(resolve=>{release=resolve;});
    h.bundle.scripts!.prepare='await ctx.wait; return {roll:3};'; h.setCard(h.bundle);
    const service=createSettlementService(h.adapter,{...h.host, context:()=>({wait})});
    const pending=service.apply(march); await new Promise(resolve=>setImmediate(resolve));
    h.switch(); const untouched=h.saved(); release();
    const stale=await pending; assert.equal(stale.ok,false); assert.equal(stale.diagnostics[0].code,'stale-target'); assert.deepEqual(h.saved(),untouched);
});

test('X4: after failure reports committed values without repeating the batch', async () => {
    const h=await harness(); h.bundle.scripts!.committed='ctx.after++; throw new Error("speaker disconnected");'; h.setCard(h.bundle);
    const result=accepted(await h.service.apply(march));
    assert.equal(result.committed,true); assert.equal(result.diagnostics[0].code,'extension-after-failed');
    assert.equal(h.counters.after,1); assert.deepEqual(h.saved().state,result.state);
});

test('X3/X4/X5: committed follow-up uses a separate checked receipt and remains bound to its target', async () => {
    const h = await harness();
    h.bundle.scripts!.committed = 'ctx.after++; return await run.apply([{op:"inc",path:["party","stamina"],delta:1}]);';
    h.setCard(h.bundle);
    const result = accepted(await h.service.apply(march));
    assert.equal(result.diagnostics.length, 0);
    assert.deepEqual(result.state, h.saved().state);
    assert.equal(h.saved().records[0].entries.length, 2);
    assert.equal(h.counters.after, 1);
    const committed = result.extensions!.calls.find(call => call.kind === 'committed')!.output as {ok: boolean};
    assert.equal(committed.ok, true);
    accepted(await h.service.undo({ all: true }));
    assert.deepEqual(h.saved().state, h.bundle.definition.initial);
    assert.equal(h.counters.after, 1);
    h.bundle.scripts!.committed = 'ctx.switch(); return await run.apply([]);'; h.setCard(h.bundle);
    const service = createSettlementService(h.adapter, {...h.host, context: () => ({switch: h.switch})});
    const stale = accepted(await service.apply(march));
    assert.equal(stale.diagnostics[0].code, 'extension-after-failed');
    assert.equal(h.saved().records[0].entries.length, 1);
});

// Review contracts: live/prose/reloaded totals agree; cancellation buys no new calls;
// failed tests reuse their true context (wrong story, unintended operations, false assurance).
test('follow-up totals and before ownership survive reload and undo without another script execution', async () => {
    const h = await harness();
    h.bundle.scripts!.committed = 'ctx.after++; if(input.actions.length) return await run.apply([{op:"inc",path:["party","stamina"],delta:5}]); return null;';
    h.bundle.definition.access[0].stages = ['before', 'after'];
    h.setCard(h.bundle);
    const live = accepted(await h.service.apply(march, { source:'model:before', stage:'before', beforeUpdate:{inputDigest:'turn',outcome:'applied',diagnostics:[]} }));
    assert.deepEqual(live.state, h.saved().state);
    const saved = h.saved(); h.load(saved);
    const restored = recordResult(saved.state, saved.records, 0)!;
    assert.deepEqual(restored.changes, live.changes);
    assert.deepEqual(beforeFloorOutcome(h.adapter.capture(), 0)!.changes, live.changes);
    assert.equal(restored.receipt!.beforeUpdate!.outcome,'applied');
    assert.equal(h.counters.after,1);
    accepted(await h.service.undo());
    assert.equal(h.saved().records[0].entries.length,1);
    accepted(await h.service.undo());
    assert.deepEqual(h.saved().state, h.bundle.definition.initial);
    assert.equal(h.counters.after,1);
});

test('stage cancellation stops preparation/tools and permission denial ends the updater session', async () => {
    const h=await harness(), controller=new AbortController();
    const staged=await h.service.stage({signal:controller.signal}); controller.abort();
    assert.equal((await staged.prepare(march,'before')).ok,false);
    await assert.rejects(staged.extensions.tool('inspect_party',{},'before'));
    assert.deepEqual(h.counters,{prepare:0,after:0});
    const denied=await updaterHarness('before',[response([tool]),response([write(march)])]);
    denied.host.authorize=async()=>{reject('extension-untrusted');};
    const result=await denied.updater.update({stage:'before',index:0});
    assert.equal(result.ok,false); assert.equal(result.diagnostics[0].code,'extension-untrusted');
    assert.equal(denied.tasks.length,0); assert.deepEqual(denied.counters,{prepare:0,after:0});
});

test('single-entry retries preserve phase, text, prepared data, tools and both calculation states', async () => {
    const bundle=extensionExample(), state={party:{stamina:4,roll:2}}, target={floor:8,swipeId:2};
    const tools=[{name:'earlier',input:{},output:7}];
    bundle.tools!.inspect_party='return {state:run.state,stage:run.stage,text:run.text,target:run.target,prepared:run.prepared,tools:run.tools};';
    const host={authorize:async()=>{},context:()=>({}),passage:()=> 'Current story'};
    const run=createExtensionRun(bundle,{state,target,tools,assertCurrent(){}},host,{roll:6});
    const actual=await run.tool('inspect_party',{},'after');
    const source=ts.transpileModule(readFileSync(new URL('../extensions/testing.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
    const testExtension=runInNewContext(source+'\ntestDraftExtension',{compileDefinition,draftBundle:()=>bundle,initialize,settle,inspectInput,createFunctionRunner,clone,diagnostic,reject,createExtensionRun,extensionPath});
    const retested=await testExtension({},replayExtension(run.calls[0]),{},host,()=>{});
    assert.equal(retested.ok,true); assert.deepEqual(retested.output,actual);
    bundle.scripts!.calculate='(input,{get,before}) => [{op:"inc",path:["party","stamina"],delta:before(["party","stamina"])-get(["party","stamina"])}]';
    const result=accepted(await settle(compileDefinition(bundle),bundle.definition.initial,march,{prepared:{roll:3},stage:'before'}));
    const call=result.extensions!.calls[0];
    const calculation=await testExtension({},replayExtension(call),{},host,()=>{});
    assert.equal(calculation.ok,true); assert.deepEqual(calculation.output,call.output);
    assert.notDeepEqual(call.context!.state,call.context!.beforeState);
    // A committed test's follow-up batch settles the draft from the test state and never publishes.
    bundle.scripts!.prepare='return {roll:3};'; bundle.scripts!.calculate='() => []';
    bundle.scripts!.committed='const first=await run.apply([{action:"march",params:{}}]); const second=await run.apply([{action:"march",params:{}}]); return {committed:first.committed,first:first.state.party.stamina,second:second.state.party.stamina};';
    const followUp=await testExtension({},{kind:'committed',input:{},stage:'before'},{},host,()=>{});
    assert.equal(followUp.ok,true);
    assert.deepEqual(followUp.output,{committed:false,first:7,second:4});
    assert.deepEqual(followUp.extensions.calls.filter((entry:ExtensionTrace)=>entry.kind==='prepare').length,2);
});

test('enabled script descriptions reach updater and prose from the same definitions', () => {
    const bundle=extensionExample(), compiled=compileDefinition(bundle);
    const expected=Object.entries(bundle.definition.extensions!.scripts!).filter(([,entry])=>entry.enabled).map(([phase,entry])=>({phase,description:entry.description}));
    assert.deepEqual(buildUpdateView(compiled,bundle.definition.initial,'before').scripts,expected);
    assert.deepEqual(buildDescriptionView(compiled).scripts,expected);
    bundle.definition.extensions!.scripts!.calculate!.enabled=false;
    assert.equal(buildUpdateView(compileDefinition(bundle),bundle.definition.initial).scripts!.some(entry=>entry.phase==='calculate'),false);
});

test('X6/X7: local authorization follows card and source digest; revoke and deletion clear it', async () => {
    const bundle = extensionExample(), settings: {state3ExtensionTrust?: Record<string,string>} = {};
    const characters = [{avatar:'one.png',name:'One'},{avatar:'two.png',name:'Two'}];
    let characterId = 0, confirmations = 0;
    const source = ts.transpileModule(readFileSync(new URL('../extensions/trust.ts', import.meta.url), 'utf8'),
        {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
    const trust = runInNewContext(source+'\n({authorizeExtensions,revokeExtensionTrust,assertExtensionTrust,extensionTrust})', {
        extension_settings:{LittleWhiteBox:settings}, getContext:()=>({characters,characterId}), saveSettingsDebounced(){},
        digest,reject,requestExtensionConsent:async()=>{confirmations++;return true;},
    });
    await Promise.all([trust.authorizeExtensions(bundle), trust.authorizeExtensions(bundle)]);
    assert.equal(confirmations,1);
    bundle.scripts!.calculate='() => []'; await trust.authorizeExtensions(bundle); assert.equal(confirmations,1);
    const previous = [...characters]; characters.length=0;
    assert.ok(settings.state3ExtensionTrust?.['one.png']); characters.push(...previous);
    bundle.scripts!.prepare='return {roll:4};'; await trust.authorizeExtensions(bundle); assert.equal(confirmations,2);
    characterId=1; await trust.authorizeExtensions(bundle); assert.equal(confirmations,3);
    trust.revokeExtensionTrust(); assert.equal(settings.state3ExtensionTrust?.['two.png'],undefined);
    characters.splice(0,1); trust.revokeExtensionTrust('one.png'); assert.equal(settings.state3ExtensionTrust,undefined);
});

test('X5/X6: cancelled host code stops at await and the example executes using its real inputs', async t => {
    const bundle=extensionExample(), controller=new AbortController();
    let effects=0, release!:()=>void;
    const pending=new Promise<void>(resolve=>{release=resolve;});
    const host={authorize:async()=>{},context:()=>({pending,effect(){effects++;}}),passage:()=>''};
    bundle.tools!.inspect_party='await ctx.pending; ctx.effect(); return null;';
    const run=createExtensionRun(bundle,{state:bundle.definition.initial,target:{floor:0,swipeId:0},assertCurrent(){}},host);
    const call=run.tool('inspect_party',{},'before',controller.signal); await new Promise(resolve=>setImmediate(resolve));
    controller.abort(); release(); await assert.rejects(call); assert.equal(effects,0);
    const example=diceExample();
    const originalDocument=globalThis.document, originalEvent=globalThis.CustomEvent;
    globalThis.document={dispatchEvent(){effects++;return true;}} as unknown as Document;
    globalThis.CustomEvent=class { constructor(public type:string,public options:unknown){} } as unknown as typeof CustomEvent;
    t.after(()=>{globalThis.document=originalDocument;globalThis.CustomEvent=originalEvent;});
    const active=createExtensionRun(example,{state:example.definition.initial,target:{floor:0,swipeId:0},assertCurrent(){}},host);
    const prepared=await active.prepare(march); assert.ok((prepared as {roll:number}).roll>=1);
    const result=accepted(await settle(compileDefinition(example),example.definition.initial,march,{prepared}));
    await active.committed(result); assert.equal(effects,1);
});

test('X7: complete package round trip, disabled sources and deletion preserve conflict identity', () => {
    const bundle=extensionExample(), root='local/cards/example.png/';
    bundle.definition.extensions!.tools!.inspect_party.enabled=false;
    const files=projectVariableFiles(root,bundle);
    assert.deepEqual(variableBundleFromFiles(root,files),bundle);
    delete bundle.definition.extensions!.tools!.inspect_party; delete bundle.tools!.inspect_party;
    delete bundle.tools;
    const edited=files.filter(file=>!file.path.includes('/tools/')).map(file=>file.path.endsWith('/definition.json')?{...file,content:JSON.stringify(bundle.definition)}:file);
    const original=extensionExample(); original.definition.extensions!.tools!.inspect_party.enabled=false;
    assert.deepEqual(prepareVariableWrite(root,edited,original).bundle,bundle);
    const remote=extensionExample(); remote.scripts!.prepare='return {roll:6};';
    assert.throws(()=>prepareVariableWrite(root,edited,remote));
});

async function updaterHarness(stage:'before'|'after', answers:AgentChatResult[]) {
    const h=await harness(), tasks:AgentChatInput[]=[];
    const ctx={chat:[{mes:'March.',is_user:stage==='before'}]};
    const source=ts.transpileModule(readFileSync(new URL('../model/updater.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
    const factory=runInNewContext(source+'\ncreateState3Updater',{
        getContext:()=>ctx, latestUserIndex:()=>0, captureContext:async()=>({}), exposeVariableReads:()=>()=>{}, passageText:(text:string)=>text,
        compileDefinition,buildUpdateTask,SUBMIT_TOOL:'write',readSettings:()=>({source:'main'}),reject,diagnostic,digest,modelSource,beforeOutcome,beforeReceipt,beforeFloorOutcome,
        mergeAbortSignals,activeTools,TOOL_CALL_LIMIT,correctionTask,handoffReceipt,AbortController,structuredClone,
        window:{xiaobaixAgent:{openSession:async()=>({chat:async(task:AgentChatInput)=>{tasks.push(task);return answers.shift();},
            toolResult:(call:{id:string},value:Json)=>({role:'tool',tool_call_id:call.id,content:JSON.stringify(value)}),dispose(){}})}},
    });
    const updater=factory({service:h.service,adapter:{...h.adapter,submissionBasis:()=>digest(h.saved())},available(){}});
    return {...h,tasks,updater};
}
const response=(calls:{name:string;arguments:string;id?:string}[]):AgentChatResult=>({completion:'complete',truncated:false,text:'',toolCalls:calls,
    reply:{role:'assistant',content:'',tool_calls:calls.map((call,index)=>({id:call.id||String(index),type:'function',function:{name:call.name,arguments:call.arguments}}))},usage:{}} as AgentChatResult);
const write=(input:unknown)=>({name:'write',arguments:JSON.stringify({state:input})});
const tool={name:'inspect_party',id:'lookup',arguments:'{}'};

test('X1/X2: both stages use same-session tools, one correction and one preparation; mixed submission executes nothing', async () => {
    for(const stage of ['before','after'] as const){
        const replies=[response([tool]),response([write(stage==='before'?[{action:'march',params:{}}]:[]),tool]),response([write(stage==='before'?march:[])])];
        const h=await updaterHarness(stage,replies);
        const result=accepted(await h.updater.update({stage,index:0}));
        assert.equal(h.tasks.length,3); assert.equal(result.extensions!.modelRequests,3);
        assert.deepEqual(h.counters,{prepare:1,after:1});
        assert.equal(result.extensions!.calls.filter((call:ExtensionTrace)=>call.kind==='tool').length,1);
        assert.equal(h.tasks[1].messages.at(-1)!.role,'tool');
        assert.equal(h.tasks[1].messages.at(-2)!.role,'assistant');
    }
});

// Declared handoff tools must not become rejected submissions (lost updates / wasted correction).
test('X1: a repeated handoff call receives its receipt without running card code, then write settles', async () => {
    const repeat={name:'read_work_requirements',id:'again',arguments:'{}'};
    const h=await updaterHarness('before',[response([repeat]),response([write(march)])]);
    const result=accepted(await h.updater.update({stage:'before',index:0}));
    assert.equal(h.tasks.length,2); assert.equal(result.extensions!.calls.filter((call:ExtensionTrace)=>call.kind==='tool').length,0);
    assert.deepEqual(JSON.parse(String(h.tasks[1].messages.at(-1)!.content)),handoffReceipt('read_work_requirements'));
});
test('X1: sixth tool call stops without publication and no-extension cards retain one request',async()=>{
    const h=await updaterHarness('before',Array.from({length:6},()=>response([tool])));
    const before=h.saved(); const result=await h.updater.update({stage:'before',index:0});
    assert.equal(result.ok,false); assert.equal(result.diagnostics[0].code,'extension-limit'); assert.deepEqual(h.saved(),before);
    assert.equal(h.tasks.length,6); assert.equal(result.extensions.calls.length,5);
    const plain=await updaterHarness('after',[response([write([])])]);
    delete plain.bundle.definition.extensions; delete plain.bundle.scripts; delete plain.bundle.tools;
    plain.bundle.definition.actions[0].conversions=[]; plain.setCard(plain.bundle);
    accepted(await plain.updater.update({stage:'after',index:0})); assert.equal(plain.tasks.length,1); assert.deepEqual(plain.counters,{prepare:0,after:0});
});

// Technical faults must not buy a correction request; scripted follow-ups cannot
// bypass stage rules or repeat their host operation (cost / corrupted state).
test('calculation faults stop after one model request; follow-ups retain their phase', async () => {
    for (const code of ['() => [{op:"inc",path:["party","stamina"],delta:"bad"}]',
        '() => [{op:"inc",path:["party","stamina"],delta:-100}]', '() => [{op:"set",path:["outside"],value:1}]']) {
        const h=await updaterHarness('before',[response([write(march)]),response([write(march)])]);
        h.bundle.scripts!.calculate=code; h.setCard(h.bundle);
        const initial=h.saved(), result=await h.updater.update({stage:'before',index:0});
        assert.equal(result.ok,false); assert.equal(result.diagnostics[0].code,'extension-calculation');
        assert.equal(h.tasks.length,1); assert.deepEqual(h.saved(),initial);
    }
    const corrected=await updaterHarness('after',[response([write([{op:'inc',path:['party','stamina'],delta:-100}])]),response([write([])])]);
    corrected.bundle.scripts!.calculate='() => [{op:"set",path:["party","roll"],value:2}]'; corrected.setCard(corrected.bundle);
    const correctedResult=accepted(await corrected.updater.update({stage:'after',index:0}));
    assert.equal(corrected.tasks.length,2); assert.deepEqual(correctedResult.state,{party:{stamina:10,roll:2}});
    const h=await harness();
    h.bundle.scripts!.committed='ctx.after++; return await run.apply([{op:"inc",path:["party","stamina"],delta:1}]);'; h.setCard(h.bundle);
    const result=accepted(await h.service.apply(march,{stage:'before'}));
    const nested=result.extensions!.calls.find(call=>call.kind==='committed')!.output as unknown as Result;
    assert.equal(nested.ok,false); assert.equal(nested.diagnostics[0].code,'direct-other-stage');
    assert.equal(h.counters.after,1); assert.equal(h.saved().records[0].entries.length,1);
});

test('missing preparation is rejected before save and simulated facts cannot enter a real commit', async () => {
    const h=await harness();
    h.bundle.definition.extensions!.scripts!.prepare!.enabled=false;
    assert.throws(()=>compileDefinition(h.bundle),error=>diagnostic(error).code==='prepared-unavailable');
    h.bundle.definition.extensions!.scripts!.prepare!.enabled=true;
    const before=h.saved();
    await assert.rejects(h.service.apply(march,{prepared:{roll:6}}),error=>diagnostic(error).code==='prepared-preview-only');
    assert.deepEqual(h.saved(),before); assert.deepEqual(h.counters,{prepare:0,after:0});
    accepted(await h.service.preview(march,{prepared:{roll:6}}));
    assert.deepEqual(h.counters,{prepare:0,after:0});
});
