import{$t as T,Qt as G,Zt as g,en as X,nn as q,ot as O,tn as A}from"./message-toolbar-D6dY6tqo.js";import{St as $,xt as P}from"./draw-common-C5fWPeGE.js";var D="nd-max-images-input",z="nd-max-images-reset",b=new WeakSet,J=`
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
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--nd-border-subtle);
    border-radius: 6px;
    color: var(--nd-text-primary);
    color-scheme: dark;
    font-family: inherit;
    font-size: 11px;
    text-align: center;
    outline: none;
    transition: border-color 0.2s;
}
.nd-max-images-input::placeholder { color: var(--nd-text-muted); opacity: 1; }
.nd-max-images-input:hover { border-color: rgba(255, 255, 255, 0.2); }
.nd-max-images-input:focus { border-color: rgba(255, 255, 255, 0.3); }
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
.nd-max-images-reset:hover { color: var(--nd-text-primary); background: rgba(255, 255, 255, 0.1); }
.nd-max-images-reset[hidden] { display: none; }
`;function B(e=document){const t=e.createElement("div");t.className="nd-row";const r=e.createElement("span");r.className="nd-label",r.textContent=g.label;const s=e.createElement("div");s.className="nd-max-images-field";const n=e.createElement("input");n.className=D,n.setAttribute("type","number"),n.setAttribute("min",String(0)),n.setAttribute("max",String(20)),n.setAttribute("step","1"),n.setAttribute("inputmode","numeric"),n.setAttribute("aria-label",g.accessibleLabel),n.setAttribute("placeholder",g.followPreset),n.setAttribute("title",T(0));const a=e.createElement("button");return a.className=z,a.setAttribute("type","button"),a.setAttribute("title",g.followPreset),a.setAttribute("aria-label",g.followPreset),a.setAttribute("hidden",""),a.textContent="↺",s.append(n,a),t.append(r,s),t}function L(e){return e?.parentNode?.querySelector?.(".nd-max-images-reset")||null}function W(e,{override:t,presetMaxImages:r,force:s=!1}={}){if(!e)return;const n=A(t);if(e.setAttribute("placeholder",g.followPreset),e.setAttribute("title",T(r)),s||!b.has(e)){const c=n==null?"":String(n);e.value!==c&&(e.value=c)}const a=L(e);a&&(n==null?a.setAttribute("hidden",""):a.removeAttribute("hidden"))}function Y(e,{getOverride:t,save:r,refresh:s,notify:n,delayMs:a=350}={}){if(!e)return{flush(){},cancel(){},destroy(){}};const c=L(e);let m=null,i=Promise.resolve(),u=-1,l=0,h=!0;const f=()=>{m!=null&&globalThis.clearTimeout(m),m=null},w=()=>{l+=1,b.add(e)},p=o=>{console.warn("[DrawMaxImages] Save failed:",o),h&&n?.(g.saveFailed)},x=o=>{!h||o!==l||(b.delete(e),s?.(e,!0))},y=o=>{if(u===l)return i;const d=l;return u=d,i=(async()=>{try{(b.has(e)||A(t?.())!==o)&&await r(o),x(d)}catch(U){p(U),x(d)}})(),i},v=({final:o})=>{if(f(),!h)return i;const d=q(e.value,{badInput:e.validity?.badInput===!0});return d.status==="invalid"?(o&&(x(l),n?.(G)),i):d.status==="empty"&&!o?i:y(d.status==="empty"?null:d.value)},I=({final:o})=>{w(),f(),m=globalThis.setTimeout(()=>{m=null,v({final:o}).catch(p)},a)},E=()=>I({final:!1}),S=()=>I({final:!0}),_=()=>{v({final:!0}).catch(p)},M=o=>{o.stopPropagation?.(),o.key==="Enter"&&(o.preventDefault?.(),v({final:!0}).catch(p))},N=o=>{o.stopPropagation?.(),f(),w(),e.value="",y(null).catch(p)};return e.addEventListener("input",E),e.addEventListener("change",S),e.addEventListener("blur",_),e.addEventListener("keydown",M),c?.addEventListener("click",N),{flush:()=>v({final:!0}),cancel:f,destroy(){h=!1,f(),b.delete(e),e.removeEventListener("input",E),e.removeEventListener("change",S),e.removeEventListener("blur",_),e.removeEventListener("keydown",M),c?.removeEventListener("click",N)}}}function ee({getOverride:e,getPresetMaxImages:t,persistOverride:r,listInputs:s,notify:n}){const a=(i,u=!1)=>{W(i,{override:e(),presetMaxImages:t(),force:u})},c=()=>{for(const i of s())a(i)},m=async i=>{const u=A(i),l=await r(u,{okText:X(u)});return c(),l};return{fill:a,updateAll:c,createRow(){const i=B(document);return a(i.querySelector(`.${D}`)),i},bind(i){return Y(i,{getOverride:e,save:m,refresh:a,notify:n})}}}var j=new Set(["submitting","accepted","uncertain","cancelling"]),F=new Set(["idle","accepted","uncertain","cancelling"]),R=new Set(["planning","prompt","config","request","correction","parse"]),H=new Set(["reattaching","delivering","dispatched"]);function K(e){const t=e.run&&typeof e.run=="object"?e.run:null;return String(e.stage||t?.progress?.stage||t?.state||"").toLowerCase()}function te(e={}){const t=k(e);return t==="analysis"||t==="retry"?"⏳":"🎨"}function k(e={}){const t=K(e);return t==="queued"?"queued":t==="retry"||R.has(t)&&(e.retry??e.run?.progress?.retry)?"retry":R.has(t)?"analysis":H.has(t)?"reattaching":t==="compiling"?"preparing":t==="reconnecting"?"reconnecting":t==="cooldown"?"cooldown":"generating"}function re(e={}){const t=k(e);if(t==="retry"){const n=e.retry??e.run?.progress?.retry;return $(n?.current,n?.total)}if(t!=="generating")return P[t];const r=Number(e.current),s=Number(e.total);return Number.isInteger(r)&&r>0&&Number.isInteger(s)&&s>0?`${r}/${s}`:P.generating}function C(e={},t={}){return O(e,t)}function Q(e={}){return!!(e.run&&typeof e.run=="object"||String(e.stage||"").trim()||Number.isInteger(Number(e.current))&&Number.isInteger(Number(e.total)))}function ne({detail:e={},pending:t=!1,chatId:r,messageId:s,swipeIndex:n,provider:a,runId:c}={}){return C(e||{},{chatId:r,messageId:s,swipeIndex:n,provider:a,runId:c})&&!(t&&e.phase==="completed")?e:{}}function ae(e,t,r){const s=t.backendAccepted&&!Q(e)?{...e,stage:"reattaching"}:e;return["cancelling","cancel_failed"].includes(e.phase)?s:t.cancelling?{...s,...r,phase:"cancelling"}:t.backendAccepted?{...s,...r,phase:"active"}:s}async function se({cancel:e,isCurrent:t,getState:r,setState:s}){const n=r();try{const a=e();return t()&&s("cancelling"),await a}catch(a){throw t()&&r()==="cancelling"&&s(n),a}}function ie({currentState:e,pending:t,detail:r={},chatId:s,messageId:n,swipeIndex:a,provider:c,runId:m}={}){const i=C(r,{chatId:s,messageId:n,swipeIndex:a,provider:c,runId:m});if(!t&&i&&r.phase==="completed"&&F.has(e)){const u=Math.max(0,Number(r.success)||0),l=Math.max(0,Number(r.total)||0);return r.aborted===!0&&u===0?"idle":l>0&&u>=l?"success":"partial"}return!t&&e==="submitting"?e:t?i&&r.phase==="cancelling"?"cancelling":i&&r.phase==="cancel_failed"?"accepted":e==="cancelling"?"cancelling":i&&r.phase==="uncertain"?"uncertain":e==="uncertain"&&r.phase==="reconciled"?e:i&&["accepted","active"].includes(r.phase)||e==="accepted"?"accepted":"uncertain":j.has(e)?"idle":e}export{ae as a,D as c,ne as i,J as l,te as n,ie as o,Q as r,se as s,re as t,ee as u};
