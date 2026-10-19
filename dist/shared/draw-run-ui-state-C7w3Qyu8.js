import{Qt as R,Xt as d,Zt as U,at as G,en as D,tn as X}from"./message-toolbar-CcMv9NZT.js";import{St as O,xt as P}from"./draw-common-DXzHdqpm.js";var q="nd-max-images-input",z="nd-max-images-reset",b=new WeakSet,K=`
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
`;function Q(e=document){const t=e.createElement("div");t.className="nd-row";const r=e.createElement("span");r.className="nd-label",r.textContent=d.label;const a=e.createElement("div");a.className="nd-max-images-field";const n=e.createElement("input");n.className=q,n.setAttribute("type","number"),n.setAttribute("min",String(0)),n.setAttribute("max",String(20)),n.setAttribute("step","1"),n.setAttribute("inputmode","numeric"),n.setAttribute("aria-label",d.accessibleLabel),n.setAttribute("placeholder",d.followPreset),n.setAttribute("title",R(0));const s=e.createElement("button");return s.className=z,s.setAttribute("type","button"),s.setAttribute("title",d.followPreset),s.setAttribute("aria-label",d.followPreset),s.setAttribute("hidden",""),s.textContent="↺",a.append(n,s),t.append(r,a),t}function T(e){return e?.parentNode?.querySelector?.(".nd-max-images-reset")||null}function V(e,{override:t,presetMaxImages:r,force:a=!1}={}){if(!e)return;const n=D(t);if(e.setAttribute("placeholder",d.followPreset),e.setAttribute("title",R(r)),a||!b.has(e)){const c=n==null?"":String(n);e.value!==c&&(e.value=c)}const s=T(e);s&&(n==null?s.setAttribute("hidden",""):s.removeAttribute("hidden"))}function Z(e,{getOverride:t,save:r,refresh:a,notify:n,delayMs:s=350}={}){if(!e)return{flush(){},cancel(){},destroy(){}};const c=T(e);let m=null,o=Promise.resolve(),g=-1,u=0,h=!0;const f=()=>{m!=null&&globalThis.clearTimeout(m),m=null},x=()=>{u+=1,b.add(e)},p=i=>{console.warn("[DrawMaxImages] Save failed:",i),h&&n?.(d.saveFailed)},A=i=>{!h||i!==u||(b.delete(e),a?.(e,!0))},y=i=>{if(g===u)return o;const l=u;return g=l,o=(async()=>{try{(b.has(e)||D(t?.())!==i)&&await r(i),A(l)}catch(C){p(C),A(l)}})(),o},v=({final:i})=>{if(f(),!h)return o;const l=X(e.value,{badInput:e.validity?.badInput===!0});return l.status==="invalid"?(i&&(A(u),n?.(U)),o):l.status==="empty"&&!i?o:y(l.status==="empty"?null:l.value)},w=({final:i})=>{x(),f(),m=globalThis.setTimeout(()=>{m=null,v({final:i}).catch(p)},s)},E=()=>w({final:!1}),I=()=>w({final:!0}),_=()=>{v({final:!0}).catch(p)},S=i=>{i.stopPropagation?.(),i.key==="Enter"&&(i.preventDefault?.(),v({final:!0}).catch(p))},N=i=>{i.stopPropagation?.(),f(),x(),e.value="",y(null).catch(p)};return e.addEventListener("input",E),e.addEventListener("change",I),e.addEventListener("blur",_),e.addEventListener("keydown",S),c?.addEventListener("click",N),{flush:()=>v({final:!0}),cancel:f,destroy(){h=!1,f(),b.delete(e),e.removeEventListener("input",E),e.removeEventListener("change",I),e.removeEventListener("blur",_),e.removeEventListener("keydown",S),c?.removeEventListener("click",N)}}}var B=new Set(["submitting","accepted","uncertain","cancelling"]),W=new Set(["idle","accepted","uncertain","cancelling"]),M=new Set(["planning","prompt","config","request","correction","parse"]),Y=new Set(["reattaching","delivering","dispatched"]);function $(e){const t=e.run&&typeof e.run=="object"?e.run:null;return String(e.stage||t?.progress?.stage||t?.state||"").toLowerCase()}function J(e={}){const t=L(e);return t==="analysis"||t==="retry"?"⏳":"🎨"}function L(e={}){const t=$(e);return t==="queued"?"queued":t==="retry"||M.has(t)&&(e.retry??e.run?.progress?.retry)?"retry":M.has(t)?"analysis":Y.has(t)?"reattaching":t==="compiling"?"preparing":t==="reconnecting"?"reconnecting":t==="cooldown"?"cooldown":"generating"}function ee(e={}){const t=L(e);if(t==="retry"){const n=e.retry??e.run?.progress?.retry;return O(n?.current,n?.total)}if(t!=="generating")return P[t];const r=Number(e.current),a=Number(e.total);return Number.isInteger(r)&&r>0&&Number.isInteger(a)&&a>0?`${r}/${a}`:P.generating}function k(e={},t={}){return G(e,t)}function j(e={}){return!!(e.run&&typeof e.run=="object"||String(e.stage||"").trim()||Number.isInteger(Number(e.current))&&Number.isInteger(Number(e.total)))}function te({detail:e={},pending:t=!1,chatId:r,messageId:a,swipeIndex:n,provider:s,runId:c}={}){return k(e||{},{chatId:r,messageId:a,swipeIndex:n,provider:s,runId:c})&&!(t&&e.phase==="completed")?e:{}}function re(e,t,r){const a=t.backendAccepted&&!j(e)?{...e,stage:"reattaching"}:e;return["cancelling","cancel_failed"].includes(e.phase)?a:t.cancelling?{...a,...r,phase:"cancelling"}:t.backendAccepted?{...a,...r,phase:"active"}:a}async function ne({cancel:e,isCurrent:t,getState:r,setState:a}){const n=r();try{const s=e();return t()&&a("cancelling"),await s}catch(s){throw t()&&r()==="cancelling"&&a(n),s}}function ae({currentState:e,pending:t,detail:r={},chatId:a,messageId:n,swipeIndex:s,provider:c,runId:m}={}){const o=k(r,{chatId:a,messageId:n,swipeIndex:s,provider:c,runId:m});if(!t&&o&&r.phase==="completed"&&W.has(e)){const g=Math.max(0,Number(r.success)||0),u=Math.max(0,Number(r.total)||0);return r.aborted===!0&&g===0?"idle":u>0&&g>=u?"success":"partial"}return!t&&e==="submitting"?e:t?o&&r.phase==="cancelling"?"cancelling":o&&r.phase==="cancel_failed"?"accepted":e==="cancelling"?"cancelling":o&&r.phase==="uncertain"?"uncertain":e==="uncertain"&&r.phase==="reconciled"?e:o&&["accepted","active"].includes(r.phase)||e==="accepted"?"accepted":"uncertain":B.has(e)?"idle":e}export{re as a,q as c,Q as d,V as f,te as i,K as l,J as n,ae as o,j as r,ne as s,ee as t,Z as u};
