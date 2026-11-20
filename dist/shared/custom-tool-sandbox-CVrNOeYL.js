import{F as N,I as P,V as x,k as _,nt as k}from"./filter-rule-sort-gy_7ZOlN.js";function D(e){if(!e)return null;const{imgId:r,tags:f,vibeNames:i,positive:t,characterPrompts:n,negativePrompt:c,postPrompt:o}=e;return{imgId:r,tags:f,vibeNames:i,positive:t,characterPrompts:n,negativePrompt:c,postPrompt:o}}var T=Object.freeze({title:"查看提示词",loading:"正在读取提示词…",failed:"提示词读取失败，请重试。",empty:"这张图片没有保存提示词。",character:e=>`角色 ${e+1}`,negative:e=>`负向：${e}`});function U(e){return Array.isArray(e)?e.map((r,f)=>{const i=[r.prompt,r.uc?T.negative(r.uc):""].filter(Boolean);return`${r.name||T.character(f)}: ${i.join(`
`)}`}).join(`

`):""}var w=Object.freeze({apiKey:"",apiBaseUrl:"",sendMode:"frontend",useImageBackendJobs:!1,insecureTLS:!1,timeout:6e4,requestDelay:Object.freeze({min:15e3,max:3e4})}),L=Object.freeze(Object.keys(w));function j(e={}){const r=e&&typeof e=="object"?e:{},f=r.requestDelay||{},i=(c,o)=>Number.isFinite(Number(c))&&Number(c)>0?Number(c):o,t=i(f.min,w.requestDelay.min),n=i(f.max,w.requestDelay.max);return{apiKey:String(r.apiKey||"").trim(),apiBaseUrl:String(r.apiBaseUrl||"").trim(),sendMode:r.sendMode==="backend"?"backend":"frontend",useImageBackendJobs:r.useImageBackendJobs===!0,insecureTLS:r.insecureTLS===!0,timeout:Math.min(6e5,Math.max(1e4,Math.floor(i(r.timeout,w.timeout)))),requestDelay:{min:Math.min(t,n),max:Math.max(t,n)}}}var F=Object.freeze({fields:L,normalizeConfig:j});function q(e){return _(e,F)}var J="novelai-quick-test",I=Object.freeze({generating:"生成中…",generated:"生成完成",saved:"图片已保存",saving:"正在保存图片…",saveFailed:"缓存保存失败，图片已保留",unsaved:"图片已生成，但缓存保存失败。请下载或重试保存，刷新页面会丢失未保存图片。",retry:"重试保存",download:"下载图片",previous:"上一页",next:"下一页",historyFailed:"历史图片读取失败，可重试加载；本次生成的图片仍可下载。",reload:"重新加载历史",image:e=>`图片 ${e}`}),K=class extends Error{constructor(e){super(I.saveFailed,{cause:e}),this.name="QuickTestSaveError"}};function Y({store:e,notify:r,stateChanged:f}){const i=new Map,t=new Map;let n=null;const c={get busy(){return!!n},get records(){return[...i.values()].reverse()},get hasUnsaved(){return i.size>0},save(o){if(t.has(o))return t.get(o);const s=i.get(o);if(!s)return Promise.resolve();s.persistence="saving",r({...s});const E=Promise.resolve().then(()=>e(s)).then(()=>{i.delete(o),r({...s,persistence:"saved"})},b=>{throw s.persistence="unsaved",r({...s}),new K(b)}).finally(()=>t.delete(o));return t.set(o,E),E},generate(o){return n||(n=Promise.resolve().then(o).then(async s=>(i.set(s.imgId,{...s,persistence:"saving"}),await c.save(s.imgId),s.imgId)).finally(()=>{n=null,f(!1)}),f(!0),n)}};return c}var S="xbCustomTool";function $(e){return`(() => {
    const KEY = ${JSON.stringify(S)};
    const TOKEN = ${JSON.stringify(String(e))};
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    let definition = null;
    const reply = (payload) => parent.postMessage({ [KEY]: TOKEN, ...payload }, '*');
    addEventListener('message', async (event) => {
        const message = event.data;
        if (!message || message[KEY] !== TOKEN) return;
        try {
            if (message.type === 'define') {
                const produced = await new AsyncFunction(message.code)();
                if (!produced || typeof produced !== 'object') throw new Error('代码必须 return 一个对象：{ name, description, parameters, action }');
                if (typeof produced.action !== 'function') throw new Error('代码返回的对象里缺少 action 函数');
                definition = produced;
                reply({ id: message.id, ok: true, value: JSON.parse(JSON.stringify({
                    name: produced.name,
                    description: produced.description,
                    parameters: produced.parameters,
                    stealth: produced.stealth === true,
                })) });
            } else if (message.type === 'invoke') {
                if (!definition) throw new Error('工具尚未定义');
                const result = await definition.action(message.args);
                reply({ id: message.id, ok: true, value: typeof result === 'string' || result === undefined ? result : JSON.stringify(result) });
            }
        } catch (error) {
            reply({ id: message.id, ok: false, error: String((error && error.message) || error) });
        }
    });
    reply({ type: 'ready' });
})();`}function z(e=Math.random){return Array.from({length:4},()=>Math.floor(e()*4294967295).toString(36)).join("")}function O(){const e=new Error("已取消");return e.name="AbortError",e}function C(e){return function(f){const i=e.defaultView,t=e.createElement("iframe");t.setAttribute("sandbox","allow-scripts"),t.setAttribute("aria-hidden","true"),t.setAttribute("tabindex","-1"),t.style.display="none",t.srcdoc=f;let n=null;const c=o=>{o.source===t.contentWindow&&n?.(o.data)};return i.addEventListener("message",c),(e.body||e.documentElement).appendChild(t),{post:o=>t.contentWindow?.postMessage(o,"*"),onMessage(o){n=o},dispose(){i.removeEventListener("message",c),n=null,t.remove()}}}}function Q({document:e,createFrame:r=e?C(e):null,timeoutMs:f=N,defineTimeoutMs:i=P,random:t=Math.random}={}){if(typeof r!="function")throw new TypeError("createSandboxToolHost 需要 document 或 createFrame");const n=new Map,c=new Map;let o=0;function s(a){const l=n.get(a);if(l){n.delete(a),l.frame.dispose();for(const d of l.pending.values())d.reject(d.failure||new Error("沙盒已关闭"));l.pending.clear();for(const[d,u]of Array.from(c))u===a&&c.delete(d)}}function E(a){s(a);const l=z(t),d=new Map;let u;const y=new Promise(m=>{u=m}),p=r(`<!doctype html><meta charset="utf-8"><script>${$(l)}<\/script>`),g={frame:p,pending:d,ready:y,token:l};return p.onMessage(m=>{if(!m||m[S]!==l)return;if(m.type==="ready"){u();return}const v=d.get(m.id);v&&(d.delete(m.id),m.ok?v.resolve(m.value):v.reject(new Error(String(m.error||"工具执行失败"))))}),n.set(a,g),g}async function b(a,l,{limitMs:d,signal:u,label:y}){const p=n.get(a);if(!p)throw new Error("沙盒不存在");if(u?.aborted)throw s(a),O();const g=++o;let m=null,v=null;try{return await new Promise((M,A)=>{const h={resolve:M,reject:A};p.pending.set(g,h),m=setTimeout(()=>{h.failure=new Error(`${y}超时（${Math.round(d/1e3)} 秒），已终止这段代码`),s(a)},d),v=()=>{h.failure=O(),s(a)},u?.addEventListener?.("abort",v,{once:!0}),p.ready.then(()=>{p.pending.has(g)&&p.frame.post({[S]:p.token,id:g,...l})})})}finally{clearTimeout(m),u?.removeEventListener?.("abort",v),p.pending.delete(g)}}return{async define(a,l,{signal:d}={}){k(l);const u=String(a);E(u);let y;try{y=await b(u,{type:"define",code:String(l??"")},{limitMs:i,signal:d,label:"读取工具定义"})}catch(p){throw s(u),p}return typeof y?.name=="string"&&y.name.trim()&&c.set(y.name.trim(),u),y},async invoke(a,l,{signal:d}={}){const u=c.get(String(a));if(u===void 0)throw new Error(`没有名为 ${a} 的自定义工具`);return x(await b(u,{type:"invoke",args:l},{limitMs:f,signal:d,label:`工具 ${a} 执行`}))},dispose(){for(const a of Array.from(n.keys()))s(a)}}}export{w as a,j as c,U as d,D as f,Y as i,q as l,I as n,L as o,J as r,F as s,Q as t,T as u};
