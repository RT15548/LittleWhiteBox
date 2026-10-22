
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';
import { IDBFactory } from 'fake-indexeddb';
import { createIdentifier } from '../../../../../shared/common/identifier.js';
import { Buffer } from 'node:buffer';
import { setImmediate as yieldLoop } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

export async function fixture(sources, options = {}) {
 const {window,document} = parseHTML('<html><head></head><body><div id="chat"></div></body></html>');
 const frames = new Map(), observers = [], counters = {saves:0,requests:[],reads:[],warnings:[],errors:[]};
 const nativeConsoleError=console.error; console.error=(...values)=>counters.errors.push(values.map(v=>v?.message??String(v)));
 let frameId = 0;
 for (let id=0;id<sources.length;id++) { const floor=document.createElement('div');floor.className='mes';floor.setAttribute('mesid',id); const content=document.createElement('div');content.className='mes_text';content.textContent=sources[id];floor.append(content);document.getElementById('chat').append(floor); }
 const messages=sources.map(mes=>({mes,name:'review',swipe_id:0,swipes:[mes]}));
 const ctx={chatId:'journey-'+createIdentifier(),groupId:'review',chat:messages,chatMetadata:options.metadata??{},characters:[],getRequestHeaders:()=>({})};
 let persisted=structuredClone(ctx.chat),mode=options.save??'ok',releaseRequest,releaseSave;
 ctx.saveChat=async()=>{ counters.saves++;if(mode==='hold') await new Promise(resolve=>{releaseSave=resolve}); if(mode==='ok') persisted=structuredClone(ctx.chat); };
 const events=new Map();
 const host={ctx,counters,uuid:createIdentifier,events,window};
 globalThis.__drawJourneyReview=host;
 const idb=new IDBFactory();
 Object.assign(globalThis,{window,document,indexedDB:idb,BroadcastChannel:undefined,requestAnimationFrame:callback=>{frames.set(++frameId,callback);return frameId},cancelAnimationFrame:id=>frames.delete(id),MutationObserver:class{observe(){}disconnect(){}takeRecords(){return[]}},IntersectionObserver:class{constructor(callback){this.callback=callback;observers.push(this)}observe(){}unobserve(){}disconnect(){}},getComputedStyle:()=>({getPropertyValue:()=>''}),fetch:async()=>{if(mode==='read-fail')throw Error('read failed');return{ok:true,json:async()=>structuredClone(persisted)}},toastr:{error:(...v)=>counters.errors.push(v),warning:(...v)=>counters.warnings.push(v),info:()=>{}}});
 globalThis.Image=class{set src(v){this.value=v;queueMicrotask(()=>this.onload?.())}get src(){return this.value}decode(){return Promise.resolve()}};
 window.HTMLImageElement.prototype.decode=async()=>{};
 window.xiaobaixDraw={getStatus:()=>({ready:true,enabled:true}),getProvider:()=> 'review-provider'};
 const stubs={
 'user.js':'export const getCurrentUserHandle=()=>globalThis.__drawJourneyReview.user??"review-user";',
 'extensions.js':'export const getContext=()=>globalThis.__drawJourneyReview.ctx;',
 'utils.js':'export const uuidv4=()=>globalThis.__drawJourneyReview.uuid();export const saveBase64AsFile=async()=>"";',
 'event-manager.js':'export const event_types=new Proxy({}, {get:(_,key)=>key});export const createModuleEvents=()=>{const own=[];return{on(key,fn){const map=globalThis.__drawJourneyReview.events;const all=map.get(key)||[];all.push(fn);map.set(key,all);own.push([key,fn]);},cleanup(){const map=globalThis.__drawJourneyReview.events;for(const [key,fn]of own)map.set(key,(map.get(key)||[]).filter(f=>f!==fn));}}};',
 'debug-core.js':'export const xbLog={error:(...a)=>globalThis.__drawJourneyReview.counters.errors.push(a)};',
 'generate-interceptor.js':'export const GENERATE_INTERCEPTOR_ORDER={};export function registerGenerateInterceptor(){}export function unregisterGenerateInterceptor(){}',
 'viewport.js':'export const getSafeViewportStyles=()=>"";export const observeViewport=()=>()=>{};',
 'pending-image-jobs.js':'export const PendingJobState={CANCELLING:"cancelling"};export const getPendingImageJobSlots=async()=>new Map();export const discardPendingImageSlot=async()=>{};',
 'recoverable-image-jobs.js':'export const isPendingJobLeaseLost=()=>false;',
 'script.js':'export const messageFormatting=(text)=>text;'
 };
 const result=await build({stdin:{contents:[
 'draw-common.js','chat-message-images.js','chat-image-tag-migration.js','chat-image-persistence.js','chat-message-image-markup.js','gallery-cache.js','image-record.js','prepared-chat-images.js','image-card-actions.js','card-tag-editor.js','draw-action-feedback.js','draw-message-viewport.js','generated-image-runtime.js','confirmable-chat-save.js'
 ].map(f=>'export * from "./'+f+'";').join('\n'),resolveDir:fileURLToPath(new URL('../../', import.meta.url))},bundle:true,write:false,platform:'node',format:'esm',plugins:[{name:'host-boundary',setup(b){b.onResolve({filter:/\.js$/},({path:p})=>{const name=p.split('/').at(-1);return Object.hasOwn(stubs,name)?{path:name,namespace:'host'}:null});b.onLoad({filter:/.*/,namespace:'host'},({path:p})=>({contents:stubs[p]}));}}]});
 // eslint-disable-next-line no-unsanitized/method -- Only locally bundled source and fixed test stubs enter this module.
 const api=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text+'\n//# sourceURL=draw-journey-review-'+createIdentifier()+'.mjs').toString('base64'));
 api.registerPreparedImageProvider('review-provider', input=>api.submitPreparedChatImages({...input,metadata:input.tasks.map(t=>({tags:t.scene,positive:t.scene})),backend:false,run:async handlers=>{for(let index=0;index<input.tasks.length;index++){if(await handlers.onItemStarting({index})===false)continue;counters.requests.push({messageId:input.messageId,tags:input.tasks[index].scene});if(options.holdRequest)await new Promise(resolve=>{releaseRequest=resolve});await handlers.onItemReady({index,base64:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN3sAAAAASUVORK5CYII='});}}}));
 const body=id=>document.querySelector('.mes[mesid="'+id+'"] .mes_text');
 const settle=async(rounds=24)=>{for(let i=0;i<rounds;i++)await yieldLoop();};
 const pump=async(n=1)=>{for(let i=0;i<n;i++){const batch=[...frames.values()];frames.clear();for(const frame of batch)frame(performance.now());await settle();}return frames.size};
 const start=()=>{api.startSharedDrawPreviewRuntime();api.initChatMessageImages();};
 const stop=()=>{api.cleanupChatMessageImages();api.stopSharedDrawPreviewRuntime();console.error=nativeConsoleError;};
 const emit=async(type,...args)=>{for(const fn of events.get(type)||[])await fn(...args);};
 return{api,ctx,messages,counters,idb,start,stop,frames,pump,settle,body,emit,observers,setMode:value=>{mode=value},releaseRequest:()=>releaseRequest?.(),releaseSave:()=>releaseSave?.(),persisted:()=>persisted};
}
