import{Qt as M,Xt as g,Zt as C,at as U,en as D,tn as G}from"./message-toolbar-DcSXObYk.js";import{St as X,xt as N}from"./draw-common-Bct8fPy9.js";var q="nd-max-images-input",O="nd-max-images-reset",h=new WeakSet,H=`
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
`;function K(e=document){const t=e.createElement("div");t.className="nd-row";const r=e.createElement("span");r.className="nd-label",r.textContent=g.label;const a=e.createElement("div");a.className="nd-max-images-field";const n=e.createElement("input");n.className=q,n.setAttribute("type","number"),n.setAttribute("min",String(0)),n.setAttribute("max",String(20)),n.setAttribute("step","1"),n.setAttribute("inputmode","numeric"),n.setAttribute("aria-label",g.accessibleLabel),n.setAttribute("placeholder",g.followPreset),n.setAttribute("title",M(0));const s=e.createElement("button");return s.className=O,s.setAttribute("type","button"),s.setAttribute("title",g.followPreset),s.setAttribute("aria-label",g.followPreset),s.setAttribute("hidden",""),s.textContent="↺",a.append(n,s),t.append(r,a),t}function R(e){return e?.parentNode?.querySelector?.(".nd-max-images-reset")||null}function Q(e,{override:t,presetMaxImages:r,force:a=!1}={}){if(!e)return;const n=D(t);if(e.setAttribute("placeholder",g.followPreset),e.setAttribute("title",M(r)),a||!h.has(e)){const c=n==null?"":String(n);e.value!==c&&(e.value=c)}const s=R(e);s&&(n==null?s.setAttribute("hidden",""):s.removeAttribute("hidden"))}function V(e,{getOverride:t,save:r,refresh:a,notify:n,delayMs:s=350}={}){if(!e)return{flush(){},cancel(){},destroy(){}};const c=R(e);let l=null,o=Promise.resolve(),m=0,u=!0;const f=()=>{l!=null&&globalThis.clearTimeout(l),l=null},A=()=>{m+=1,h.add(e)},p=i=>{console.warn("[DrawMaxImages] Save failed:",i),u&&n?.(g.saveFailed)},v=i=>{!u||i!==m||(h.delete(e),a?.(e,!0))},x=i=>{const d=m;return o=o.then(async()=>{u&&(D(t?.())!==i&&await r(i),v(d))}).catch(k=>{p(k),v(d)}),o},b=({final:i})=>{if(f(),!u)return o;const d=G(e.value,{badInput:e.validity?.badInput===!0});return d.status==="invalid"?(i&&(v(m),n?.(C)),o):d.status==="empty"&&!i?o:x(d.status==="empty"?null:d.value)},w=({final:i})=>{A(),f(),l=globalThis.setTimeout(()=>{l=null,b({final:i}).catch(p)},s)},y=()=>w({final:!1}),E=()=>w({final:!0}),I=()=>{b({final:!0}).catch(p)},_=i=>{i.stopPropagation?.(),i.key==="Enter"&&(i.preventDefault?.(),b({final:!0}).catch(p))},S=i=>{i.stopPropagation?.(),f(),A(),e.value="",x(null).catch(p)};return e.addEventListener("input",y),e.addEventListener("change",E),e.addEventListener("blur",I),e.addEventListener("keydown",_),c?.addEventListener("click",S),{flush:()=>b({final:!0}),cancel:f,destroy(){u=!1,f(),h.delete(e),e.removeEventListener("input",y),e.removeEventListener("change",E),e.removeEventListener("blur",I),e.removeEventListener("keydown",_),c?.removeEventListener("click",S)}}}var z=new Set(["submitting","accepted","uncertain","cancelling"]),B=new Set(["idle","accepted","uncertain","cancelling"]),P=new Set(["planning","prompt","config","request","correction","parse"]),W=new Set(["reattaching","delivering","dispatched"]);function Y(e){const t=e.run&&typeof e.run=="object"?e.run:null;return String(e.stage||t?.progress?.stage||t?.state||"").toLowerCase()}function Z(e={}){const t=T(e);return t==="analysis"||t==="retry"?"⏳":"🎨"}function T(e={}){const t=Y(e);return t==="queued"?"queued":t==="retry"||P.has(t)&&(e.retry??e.run?.progress?.retry)?"retry":P.has(t)?"analysis":W.has(t)?"reattaching":t==="compiling"?"preparing":t==="reconnecting"?"reconnecting":t==="cooldown"?"cooldown":"generating"}function J(e={}){const t=T(e);if(t==="retry"){const n=e.retry??e.run?.progress?.retry;return X(n?.current,n?.total)}if(t!=="generating")return N[t];const r=Number(e.current),a=Number(e.total);return Number.isInteger(r)&&r>0&&Number.isInteger(a)&&a>0?`${r}/${a}`:N.generating}function L(e={},t={}){return U(e,t)}function $(e={}){return!!(e.run&&typeof e.run=="object"||String(e.stage||"").trim()||Number.isInteger(Number(e.current))&&Number.isInteger(Number(e.total)))}function ee({detail:e={},pending:t=!1,chatId:r,messageId:a,swipeIndex:n,provider:s,runId:c}={}){return L(e||{},{chatId:r,messageId:a,swipeIndex:n,provider:s,runId:c})&&!(t&&e.phase==="completed")?e:{}}function te(e,t,r){const a=t.backendAccepted&&!$(e)?{...e,stage:"reattaching"}:e;return["cancelling","cancel_failed"].includes(e.phase)?a:t.cancelling?{...a,...r,phase:"cancelling"}:t.backendAccepted?{...a,...r,phase:"active"}:a}async function re({cancel:e,isCurrent:t,getState:r,setState:a}){const n=r();try{const s=e();return t()&&a("cancelling"),await s}catch(s){throw t()&&r()==="cancelling"&&a(n),s}}function ne({currentState:e,pending:t,detail:r={},chatId:a,messageId:n,swipeIndex:s,provider:c,runId:l}={}){const o=L(r,{chatId:a,messageId:n,swipeIndex:s,provider:c,runId:l});if(!t&&o&&r.phase==="completed"&&B.has(e)){const m=Math.max(0,Number(r.success)||0),u=Math.max(0,Number(r.total)||0);return r.aborted===!0&&m===0?"idle":u>0&&m>=u?"success":"partial"}return!t&&e==="submitting"?e:t?o&&r.phase==="cancelling"?"cancelling":o&&r.phase==="cancel_failed"?"accepted":e==="cancelling"?"cancelling":o&&r.phase==="uncertain"?"uncertain":e==="uncertain"&&r.phase==="reconciled"?e:o&&["accepted","active"].includes(r.phase)||e==="accepted"?"accepted":"uncertain":z.has(e)?"idle":e}export{te as a,q as c,K as d,Q as f,ee as i,H as l,Z as n,ne as o,$ as r,re as s,J as t,V as u};
