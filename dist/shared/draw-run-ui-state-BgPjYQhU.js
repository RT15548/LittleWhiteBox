import{$t as C,Qt as V,Zt as A,en as $,nn as q,ot as B,tn as _}from"./message-toolbar-BtaONFBq.js";import{ht as W,mt as P}from"./draw-common-QmOIAI-g.js";var v=8,S=8,T=(e,t,n)=>Math.max(t,Math.min(e,n));function F(e=window){const t=e.visualViewport,n=t?.offsetLeft??0,a=t?.offsetTop??0,r=t?.width??e.innerWidth,o=t?.height??e.innerHeight;return{left:n,top:a,width:r,height:o,right:n+r,bottom:a+o}}var re=`
.nd-floating-global[data-menu-side].expanded,
.nd-floating-global[data-menu-side].show-detail { transition: none; }
.nd-floating-global[data-menu-side] .nd-menu,
.nd-floating-global[data-menu-side] .nd-detail {
    box-sizing: border-box;
    min-width: 0;
    right: auto;
    bottom: auto;
    overflow: auto;
    overscroll-behavior: contain;
    transform: none;
}
.nd-floating-global[data-menu-side] .nd-detail::after { display: none; }
.nd-floating-global[data-menu-side="down"] .nd-arrow { transform: rotate(0deg); }
.nd-floating-global[data-menu-side="down"].expanded .nd-arrow { transform: rotate(180deg); }
.nd-floating-global[data-menu-side="up"] .nd-arrow { transform: rotate(180deg); }
.nd-floating-global[data-menu-side="up"].expanded .nd-arrow { transform: rotate(0deg); }
`;function ae(e,t){const n=e.ownerDocument.defaultView,a=e.querySelector(".nd-capsule"),r=[...e.querySelectorAll(".nd-menu, .nd-detail")],o=[...e.querySelectorAll(".nd-img-jump")];function c(){const i=F(n),b=e.getBoundingClientRect(),g=a.getBoundingClientRect();let w=g.top,f=g.bottom;for(const d of o){if(!d.offsetHeight)continue;const x=d.getBoundingClientRect();w=Math.min(w,x.top),f=Math.max(f,x.bottom)}const y=Math.max(0,w-i.top-v-S),E=Math.max(0,i.bottom-f-v-S),p=E>=y;e.dataset.menuSide=p?"down":"up";for(const d of r){d.style.maxWidth=`${Math.max(0,i.width-v*2)}px`,d.style.maxHeight=`${Math.max(0,Math.min(i.height-v*2,p?E:y))}px`;const x=T(g.right-d.offsetWidth,i.left+v,i.right-v-d.offsetWidth),M=T(p?f+S:w-S-d.offsetHeight,i.top+v,i.bottom-v-d.offsetHeight);d.style.left=`${x-b.left}px`,d.style.top=`${M-b.top}px`}}function u(){t(),c()}const s=new n.MutationObserver(c);s.observe(e,{attributes:!0,attributeFilter:["class","style"]});const m=new n.ResizeObserver(c);for(const i of[a,...r])m.observe(i);return e.addEventListener("transitionend",c),n.addEventListener("resize",u),n.visualViewport?.addEventListener("resize",u),n.visualViewport?.addEventListener("scroll",u),c(),{destroy(){s.disconnect(),m.disconnect(),e.removeEventListener("transitionend",c),n.removeEventListener("resize",u),n.visualViewport?.removeEventListener("resize",u),n.visualViewport?.removeEventListener("scroll",u)}}}var k="nd-max-images-input",H="nd-max-images-reset",I=new WeakSet,oe=`
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
`;function X(e=document){const t=e.createElement("div");t.className="nd-row";const n=e.createElement("span");n.className="nd-label",n.textContent=A.label;const a=e.createElement("div");a.className="nd-max-images-field";const r=e.createElement("input");r.className=k,r.setAttribute("type","number"),r.setAttribute("min",String(0)),r.setAttribute("max",String(20)),r.setAttribute("step","1"),r.setAttribute("inputmode","numeric"),r.setAttribute("aria-label",A.accessibleLabel),r.setAttribute("placeholder",A.followPreset),r.setAttribute("title",C(0));const o=e.createElement("button");return o.className=H,o.setAttribute("type","button"),o.setAttribute("title",A.followPreset),o.setAttribute("aria-label",A.followPreset),o.setAttribute("hidden",""),o.textContent="↺",a.append(r,o),t.append(n,a),t}function G(e){return e?.parentNode?.querySelector?.(".nd-max-images-reset")||null}function Y(e,{override:t,presetMaxImages:n,force:a=!1}={}){if(!e)return;const r=_(t);if(e.setAttribute("placeholder",A.followPreset),e.setAttribute("title",C(n)),a||!I.has(e)){const c=r==null?"":String(r);e.value!==c&&(e.value=c)}const o=G(e);o&&(r==null?o.setAttribute("hidden",""):o.removeAttribute("hidden"))}function j(e,{getOverride:t,save:n,refresh:a,notify:r,delayMs:o=350}={}){if(!e)return{flush(){},cancel(){},destroy(){}};const c=G(e);let u=null,s=Promise.resolve(),m=-1,i=0,b=!0;const g=()=>{u!=null&&globalThis.clearTimeout(u),u=null},w=()=>{i+=1,I.add(e)},f=l=>{console.warn("[DrawMaxImages] Save failed:",l),b&&r?.(A.saveFailed)},y=l=>{!b||l!==i||(I.delete(e),a?.(e,!0))},E=l=>{if(m===i)return s;const h=i;return m=h,s=(async()=>{try{(I.has(e)||_(t?.())!==l)&&await n(l),y(h)}catch(O){f(O),y(h)}})(),s},p=({final:l})=>{if(g(),!b)return s;const h=q(e.value,{badInput:e.validity?.badInput===!0});return h.status==="invalid"?(l&&(y(i),r?.(V)),s):h.status==="empty"&&!l?s:E(h.status==="empty"?null:h.value)},d=({final:l})=>{w(),g(),u=globalThis.setTimeout(()=>{u=null,p({final:l}).catch(f)},o)},x=()=>d({final:!1}),M=()=>d({final:!0}),R=()=>{p({final:!0}).catch(f)},L=l=>{l.stopPropagation?.(),l.key==="Enter"&&(l.preventDefault?.(),p({final:!0}).catch(f))},N=l=>{l.stopPropagation?.(),g(),w(),e.value="",E(null).catch(f)};return e.addEventListener("input",x),e.addEventListener("change",M),e.addEventListener("blur",R),e.addEventListener("keydown",L),c?.addEventListener("click",N),{flush:()=>p({final:!0}),cancel:g,destroy(){b=!1,g(),I.delete(e),e.removeEventListener("input",x),e.removeEventListener("change",M),e.removeEventListener("blur",R),e.removeEventListener("keydown",L),c?.removeEventListener("click",N)}}}function se({getOverride:e,getPresetMaxImages:t,persistOverride:n,listInputs:a,notify:r}){const o=(s,m=!1)=>{Y(s,{override:e(),presetMaxImages:t(),force:m})},c=()=>{for(const s of a())o(s)},u=async s=>{const m=_(s),i=await n(m,{okText:$(m)});return c(),i};return{fill:o,updateAll:c,createRow(){const s=X(document);return o(s.querySelector(`.${k}`)),s},bind(s){return j(s,{getOverride:e,save:u,refresh:o,notify:r})}}}var K=new Set(["submitting","accepted","uncertain","cancelling"]),Q=new Set(["idle","accepted","uncertain","cancelling"]),D=new Set(["planning","prompt","config","request","correction","parse"]),Z=new Set(["reattaching","delivering","dispatched"]);function J(e){const t=e.run&&typeof e.run=="object"?e.run:null;return String(e.stage||t?.progress?.stage||t?.state||"").toLowerCase()}function ie(e={}){const t=z(e);return t==="analysis"||t==="retry"?"⏳":"🎨"}function z(e={}){const t=J(e);return t==="queued"?"queued":t==="retry"||D.has(t)&&(e.retry??e.run?.progress?.retry)?"retry":D.has(t)?"analysis":Z.has(t)?"reattaching":t==="compiling"?"preparing":t==="reconnecting"?"reconnecting":t==="cooldown"?"cooldown":"generating"}function ce(e={}){const t=z(e);if(t==="retry"){const r=e.retry??e.run?.progress?.retry;return W(r?.current,r?.total)}if(t!=="generating")return P[t];const n=Number(e.current),a=Number(e.total);return Number.isInteger(n)&&n>0&&Number.isInteger(a)&&a>0?`${n}/${a}`:P.generating}function U(e={},t={}){return B(e,t)}function ee(e={}){return!!(e.run&&typeof e.run=="object"||String(e.stage||"").trim()||Number.isInteger(Number(e.current))&&Number.isInteger(Number(e.total)))}function le({detail:e={},pending:t=!1,chatId:n,messageId:a,swipeIndex:r,provider:o,runId:c}={}){return U(e||{},{chatId:n,messageId:a,swipeIndex:r,provider:o,runId:c})&&!(t&&e.phase==="completed")?e:{}}function ue(e,t,n){const a=t.backendAccepted&&!ee(e)?{...e,stage:"reattaching"}:e;return["cancelling","cancel_failed"].includes(e.phase)?a:t.cancelling?{...a,...n,phase:"cancelling"}:t.backendAccepted?{...a,...n,phase:"active"}:a}async function de({cancel:e,isCurrent:t,getState:n,setState:a}){const r=n();try{const o=e();return t()&&a("cancelling"),await o}catch(o){throw t()&&n()==="cancelling"&&a(r),o}}function me({currentState:e,pending:t,detail:n={},chatId:a,messageId:r,swipeIndex:o,provider:c,runId:u}={}){const s=U(n,{chatId:a,messageId:r,swipeIndex:o,provider:c,runId:u});if(!t&&s&&n.phase==="completed"&&Q.has(e)){const m=Math.max(0,Number(n.success)||0),i=Math.max(0,Number(n.total)||0);return n.aborted===!0&&m===0?"idle":i>0&&m>=i?"success":"partial"}return!t&&e==="submitting"?e:t?s&&n.phase==="cancelling"?"cancelling":s&&n.phase==="cancel_failed"?"accepted":e==="cancelling"?"cancelling":s&&n.phase==="uncertain"?"uncertain":e==="uncertain"&&n.phase==="reconciled"?e:s&&["accepted","active"].includes(n.phase)||e==="accepted"?"accepted":"uncertain":K.has(e)?"idle":e}export{le as a,de as c,se as d,re as f,ee as i,k as l,ae as m,ie as n,ue as o,F as p,z as r,me as s,ce as t,oe as u};
