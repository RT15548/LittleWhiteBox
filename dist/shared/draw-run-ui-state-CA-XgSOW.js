import{$t as T,Qt as G,Zt as g,en as X,nn as q,ot as O,tn as A}from"./message-toolbar-CPPkxdTs.js";import{mt as $,pt as P}from"./draw-common-CrEVriaF.js";var D="nd-max-images-input",z="nd-max-images-reset",b=new WeakSet,J=`
.nd-max-images-field { position: relative; flex: 1; min-width: 0; display: flex; align-items: center; }
.nd-max-images-input {
    flex: 1;
    width: 100%;
    min-width: 0;
    height: auto;
    min-height: 32px;
    margin: 0;
    padding: 6px 8px;
    box-sizing: border-box;
    background: var(--nd-bg-active);
    border: 1px solid var(--nd-border-subtle);
    border-radius: 6px;
    color: var(--nd-text-primary);
    color-scheme: var(--draw-color-scheme);
    font-family: inherit;
    font-size: 11px;
    text-align: center;
    outline: none;
    transition: border-color 0.2s;
}
.nd-max-images-input::placeholder { color: var(--nd-text-muted); opacity: 1; }
.nd-max-images-input:hover { border-color: var(--nd-border-hover); }
.nd-max-images-input:focus { border-color: var(--nd-border-hover); }
.nd-max-images-reset {
    position: absolute;
    top: 50%;
    right: 22px;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--nd-text-muted);
    font-size: 12px;
    line-height: 18px;
    text-align: center;
    cursor: pointer;
}
.nd-max-images-reset:hover { color: var(--nd-text-primary); background: var(--nd-bg-active); }
.nd-max-images-reset[hidden] { display: none; }
`;function B(e=document){const t=e.createElement("div");t.className="nd-row";const r=e.createElement("span");r.className="nd-label",r.textContent=g.label;const s=e.createElement("div");s.className="nd-max-images-field";const n=e.createElement("input");n.className=D,n.setAttribute("type","number"),n.setAttribute("min",String(0)),n.setAttribute("max",String(20)),n.setAttribute("step","1"),n.setAttribute("inputmode","numeric"),n.setAttribute("aria-label",g.accessibleLabel),n.setAttribute("placeholder",g.followPreset),n.setAttribute("title",T(0));const a=e.createElement("button");return a.className=z,a.setAttribute("type","button"),a.setAttribute("title",g.followPreset),a.setAttribute("aria-label",g.followPreset),a.setAttribute("hidden",""),a.textContent="↺",s.append(n,a),t.append(r,s),t}function L(e){return e?.parentNode?.querySelector?.(".nd-max-images-reset")||null}function W(e,{override:t,presetMaxImages:r,force:s=!1}={}){if(!e)return;const n=A(t);if(e.setAttribute("placeholder",g.followPreset),e.setAttribute("title",T(r)),s||!b.has(e)){const c=n==null?"":String(n);e.value!==c&&(e.value=c)}const a=L(e);a&&(n==null?a.setAttribute("hidden",""):a.removeAttribute("hidden"))}function Y(e,{getOverride:t,save:r,refresh:s,notify:n,delayMs:a=350}={}){if(!e)return{flush(){},cancel(){},destroy(){}};const c=L(e);let d=null,o=Promise.resolve(),u=-1,l=0,h=!0;const f=()=>{d!=null&&globalThis.clearTimeout(d),d=null},w=()=>{l+=1,b.add(e)},p=i=>{console.warn("[DrawMaxImages] Save failed:",i),h&&n?.(g.saveFailed)},x=i=>{!h||i!==l||(b.delete(e),s?.(e,!0))},y=i=>{if(u===l)return o;const m=l;return u=m,o=(async()=>{try{(b.has(e)||A(t?.())!==i)&&await r(i),x(m)}catch(U){p(U),x(m)}})(),o},v=({final:i})=>{if(f(),!h)return o;const m=q(e.value,{badInput:e.validity?.badInput===!0});return m.status==="invalid"?(i&&(x(l),n?.(G)),o):m.status==="empty"&&!i?o:y(m.status==="empty"?null:m.value)},I=({final:i})=>{w(),f(),d=globalThis.setTimeout(()=>{d=null,v({final:i}).catch(p)},a)},E=()=>I({final:!1}),S=()=>I({final:!0}),_=()=>{v({final:!0}).catch(p)},M=i=>{i.stopPropagation?.(),i.key==="Enter"&&(i.preventDefault?.(),v({final:!0}).catch(p))},N=i=>{i.stopPropagation?.(),f(),w(),e.value="",y(null).catch(p)};return e.addEventListener("input",E),e.addEventListener("change",S),e.addEventListener("blur",_),e.addEventListener("keydown",M),c?.addEventListener("click",N),{flush:()=>v({final:!0}),cancel:f,destroy(){h=!1,f(),b.delete(e),e.removeEventListener("input",E),e.removeEventListener("change",S),e.removeEventListener("blur",_),e.removeEventListener("keydown",M),c?.removeEventListener("click",N)}}}function ee({getOverride:e,getPresetMaxImages:t,persistOverride:r,listInputs:s,notify:n}){const a=(o,u=!1)=>{W(o,{override:e(),presetMaxImages:t(),force:u})},c=()=>{for(const o of s())a(o)},d=async o=>{const u=A(o),l=await r(u,{okText:X(u)});return c(),l};return{fill:a,updateAll:c,createRow(){const o=B(document);return a(o.querySelector(`.${D}`)),o},bind(o){return Y(o,{getOverride:e,save:d,refresh:a,notify:n})}}}var j=new Set(["submitting","accepted","uncertain","cancelling"]),F=new Set(["idle","accepted","uncertain","cancelling"]),R=new Set(["planning","prompt","config","request","correction","parse"]),H=new Set(["reattaching","delivering","dispatched"]);function K(e){const t=e.run&&typeof e.run=="object"?e.run:null;return String(e.stage||t?.progress?.stage||t?.state||"").toLowerCase()}function te(e={}){const t=k(e);return t==="analysis"||t==="retry"?"⏳":"🎨"}function k(e={}){const t=K(e);return t==="queued"?"queued":t==="retry"||R.has(t)&&(e.retry??e.run?.progress?.retry)?"retry":R.has(t)?"analysis":H.has(t)?"reattaching":t==="compiling"?"preparing":t==="reconnecting"?"reconnecting":t==="cooldown"?"cooldown":"generating"}function re(e={}){const t=k(e);if(t==="retry"){const n=e.retry??e.run?.progress?.retry;return $(n?.current,n?.total)}if(t!=="generating")return P[t];const r=Number(e.current),s=Number(e.total);return Number.isInteger(r)&&r>0&&Number.isInteger(s)&&s>0?`${r}/${s}`:P.generating}function C(e={},t={}){return O(e,t)}function Q(e={}){return!!(e.run&&typeof e.run=="object"||String(e.stage||"").trim()||Number.isInteger(Number(e.current))&&Number.isInteger(Number(e.total)))}function ne({detail:e={},pending:t=!1,chatId:r,messageId:s,swipeIndex:n,provider:a,runId:c}={}){return C(e||{},{chatId:r,messageId:s,swipeIndex:n,provider:a,runId:c})&&!(t&&e.phase==="completed")?e:{}}function ae(e,t,r){const s=t.backendAccepted&&!Q(e)?{...e,stage:"reattaching"}:e;return["cancelling","cancel_failed"].includes(e.phase)?s:t.cancelling?{...s,...r,phase:"cancelling"}:t.backendAccepted?{...s,...r,phase:"active"}:s}async function se({cancel:e,isCurrent:t,getState:r,setState:s}){const n=r();try{const a=e();return t()&&s("cancelling"),await a}catch(a){throw t()&&r()==="cancelling"&&s(n),a}}function oe({currentState:e,pending:t,detail:r={},chatId:s,messageId:n,swipeIndex:a,provider:c,runId:d}={}){const o=C(r,{chatId:s,messageId:n,swipeIndex:a,provider:c,runId:d});if(!t&&o&&r.phase==="completed"&&F.has(e)){const u=Math.max(0,Number(r.success)||0),l=Math.max(0,Number(r.total)||0);return r.aborted===!0&&u===0?"idle":l>0&&u>=l?"success":"partial"}return!t&&e==="submitting"?e:t?o&&r.phase==="cancelling"?"cancelling":o&&r.phase==="cancel_failed"?"accepted":e==="cancelling"?"cancelling":o&&r.phase==="uncertain"?"uncertain":e==="uncertain"&&r.phase==="reconciled"?e:o&&["accepted","active"].includes(r.phase)||e==="accepted"?"accepted":"uncertain":j.has(e)?"idle":e}export{ne as a,se as c,ee as d,Q as i,D as l,te as n,ae as o,k as r,oe as s,re as t,J as u};
