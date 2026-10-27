import{n as w}from"./async-errors-C4kfchr9.js";import{lt as Q}from"./gallery-cache-CRDLh0wm.js";import{B as At,H as it,V as R,ct as Pt,d as lt,lt as Ft,n as tt,rn as Ot,t as Mt,z as et}from"./message-toolbar-BtaONFBq.js";import{a as ct}from"./panel-escape-Dd7NxVql.js";import{d as O,gt as dt,mt as g,yt as zt}from"./draw-common-QmOIAI-g.js";import{a as h,c as ut,i as j,r as pt,s as ft,t as gt}from"./sd-draw-BKulUbra.js";import{a as Ut,c as mt,d as qt,f as $t,i as rt,l as vt,m as _t,n as xt,o as Bt,p as bt,s as at,t as wt,u as Gt}from"./draw-run-ui-state-BgPjYQhU.js";import{getContext as I}from"../../../../../extensions.js";var ht="xb_sd_float_pos",A=8e3,Wt="sd-webui",a={IDLE:"idle",SUBMITTING:"submitting",ACCEPTED:"accepted",UNCERTAIN:"uncertain",QUEUED:"queued",LLM:"llm",GEN:"gen",COOLDOWN:"cooldown",RECONNECTING:"reconnecting",CANCELLING:"cancelling",SUCCESS:"success",PARTIAL:"partial",ERROR:"error"},Yt=[{value:"default",label:"跟随预设",width:null,height:null},{value:"832x1216",label:"832 × 1216  竖图",width:832,height:1216},{value:"1216x832",label:"1216 × 832  横图",width:1216,height:832},{value:"1024x1024",label:"1024 × 1024  方图",width:1024,height:1024},{value:"768x1280",label:"768 x 1280  大竖",width:768,height:1280},{value:"1280x768",label:"1280 x 768  大横",width:1280,height:768}],d=new Map,F=new Map,T=null,s=null,v=null,m=a.IDLE,N=null,u={success:0,total:0,error:null,startTime:0},S=null,z=null,G=0,p={},X=!1,J=null,Qt=`
.nd-float {
    position: relative;
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.nd-capsule {
    width: 74px;
    height: var(--nd-h);
    background: var(--nd-bg);
    border: 1px solid var(--nd-border);
    border-radius: 17px;
    position: relative;
    overflow: hidden;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.nd-float:hover .nd-capsule {
    background: var(--nd-bg-hover);
    border-color: var(--nd-border-hover);
}
.nd-float.working .nd-capsule { border-color: var(--nd-warning); }
.nd-float.cooldown .nd-capsule { border-color: var(--nd-info); background: color-mix(in srgb, var(--nd-info) 10%, var(--nd-bg)); }
.nd-float.success .nd-capsule { border-color: var(--nd-success); background: color-mix(in srgb, var(--nd-success) 10%, var(--nd-bg)); }
.nd-float.partial .nd-capsule { border-color: var(--nd-warning); background: color-mix(in srgb, var(--nd-warning) 10%, var(--nd-bg)); }
.nd-float.error .nd-capsule { border-color: var(--nd-error); background: color-mix(in srgb, var(--nd-error) 10%, var(--nd-bg)); }

/* 非空闲状态：胶囊右侧多出 24px，放常驻菜单按钮（生成中也能打开菜单/设置） */
.nd-float.working .nd-capsule,
.nd-float.cooldown .nd-capsule,
.nd-float.success .nd-capsule,
.nd-float.partial .nd-capsule,
.nd-float.error .nd-capsule { width: 98px; }
.nd-inner {
    display: grid;
    width: 100%;
    height: 100%;
    grid-template-areas: "s";
    grid-template-rows: minmax(0, 1fr);
    grid-template-columns: minmax(0, 1fr);
    pointer-events: none;
}
.nd-layer {
    grid-area: s;
    min-width: 0;
    min-height: 0;
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    transition: opacity 0.2s, transform 0.2s;
    pointer-events: auto;
}
.nd-layer-idle { opacity: 1; transform: translateY(0); }
.nd-float.working .nd-layer-idle,
.nd-float.cooldown .nd-layer-idle,
.nd-float.success .nd-layer-idle,
.nd-float.partial .nd-layer-idle,
.nd-float.error .nd-layer-idle {
    opacity: 0;
    transform: translateY(-100%);
    pointer-events: none;
}
.nd-btn-draw {
    flex: 1;
    height: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    color: var(--nd-text-primary);
    transition: background 0.15s;
    font-size: 16px;
}
.nd-btn-draw:hover { background: var(--nd-bg-active); }
.nd-btn-draw:active { transform: scale(0.92); }
.nd-auto-dot {
    position: absolute;
    top: 7px;
    right: 6px;
    width: 6px;
    height: 6px;
    background: var(--nd-success);
    border-radius: 50%;
    box-shadow: 0 0 6px var(--nd-success);
    opacity: 0;
    transform: scale(0);
    transition: all 0.2s;
}
.nd-float.auto-on .nd-auto-dot { opacity: 1; transform: scale(1); }
.nd-sep { width: 1px; height: 12px; background: var(--nd-border); }
.nd-btn-menu {
    width: 24px;
    height: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--nd-text-dim);
    font-size: 8px;
    opacity: 0.6;
    transition: opacity 0.25s, transform 0.25s;
}
.nd-float:hover .nd-btn-menu { opacity: 1; }
.nd-btn-menu:hover { background: var(--nd-bg-active); color: var(--nd-text-muted); }

/* 常驻菜单按钮：只在非空闲状态显示（空闲时由 idle 层自己的菜单按钮负责） */
.nd-btn-menu-persist {
    display: none;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    box-sizing: border-box;
    border-left: 1px solid var(--nd-border);
}
.nd-float.working .nd-btn-menu-persist,
.nd-float.cooldown .nd-btn-menu-persist,
.nd-float.success .nd-btn-menu-persist,
.nd-float.partial .nd-btn-menu-persist,
.nd-float.error .nd-btn-menu-persist { display: flex; }
.nd-arrow { transition: transform 0.2s; }
.nd-float.expanded .nd-arrow { transform: rotate(180deg); }
.nd-layer-active {
    box-sizing: border-box;
    padding: 0 6px;
    opacity: 0;
    transform: translateY(100%);
    justify-content: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: var(--nd-text-primary);
    cursor: pointer;
    pointer-events: none;
    transition: opacity 0.2s, transform 0.2s, padding-right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.nd-float.working .nd-layer-active,
.nd-float.cooldown .nd-layer-active,
.nd-float.success .nd-layer-active,
.nd-float.partial .nd-layer-active,
.nd-float.error .nd-layer-active {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
    padding-right: 30px; /* 原 6px + 常驻菜单按钮 24px，文字区宽度保持不变 */
}
.nd-float.cooldown .nd-layer-active { color: var(--nd-info); }
.nd-float.success .nd-layer-active { color: var(--nd-success); }
.nd-float.partial .nd-layer-active { color: var(--nd-warning); }
.nd-float.error .nd-layer-active { color: var(--nd-error); }
.nd-spin { display: inline-block; animation: nd-spin 1.5s linear infinite; }
.nd-status-icon { flex-shrink: 0; }
.nd-status-text { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@keyframes nd-spin { to { transform: rotate(360deg); } }
.nd-countdown { font-variant-numeric: tabular-nums; min-width: 36px; text-align: center; }
.nd-detail {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--nd-bg-solid);
    border: 1px solid var(--nd-border);
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 12px;
    color: var(--nd-text-secondary);
    white-space: nowrap;
    box-shadow: var(--nd-shadow-lg);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s ease, visibility 0.15s;
    z-index: 100;
}
.nd-float.show-detail .nd-detail {
    opacity: 1;
    visibility: visible;
    transform: none;
}
.nd-detail-row { display: flex; align-items: center; gap: 10px; padding: 3px 0; }
.nd-detail-row + .nd-detail-row { margin-top: 6px; padding-top: 8px; border-top: 1px solid var(--nd-border-subtle); }
.nd-detail-icon { opacity: 0.6; font-size: 13px; }
.nd-detail-label { color: var(--nd-text-muted); }
.nd-detail-value { margin-left: auto; font-weight: 600; color: var(--nd-text-primary); }
.nd-detail-value.success { color: var(--nd-success); }
.nd-detail-value.warning { color: var(--nd-warning); }
.nd-detail-value.error { color: var(--nd-error); }
.nd-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 220px;
    background: var(--nd-bg-solid);
    border: 1px solid var(--nd-border);
    border-radius: 12px;
    padding: 10px;
    box-shadow: var(--nd-shadow-lg);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s ease, visibility 0.15s;
    z-index: 100;
}
.nd-float.expanded .nd-menu {
    opacity: 1;
    visibility: visible;
    transform: none;
}
.nd-card { background: transparent; border: none; border-radius: 0; overflow: visible; }
.nd-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 2px;
    min-height: 36px;
}
.nd-label {
    font-size: 11px;
    color: var(--nd-text-muted);
    width: 32px;
    flex-shrink: 0;
}
.nd-select {
    flex: 1;
    min-width: 0;
    background: var(--nd-bg-active);
    border: 1px solid var(--nd-border-subtle);
    color: var(--nd-text-primary);
    font-size: 11px;
    min-height: 32px;
    border-radius: 6px;
    padding: 6px 8px;
    box-sizing: border-box;
    outline: none;
    cursor: pointer;
    text-align: center;
    text-align-last: center;
    transition: border-color 0.2s;
    appearance: none;
}
.nd-select:hover { border-color: var(--nd-border-hover); }
.nd-select:focus { border-color: var(--nd-border-hover); }
.nd-select option { background: var(--nd-bg-solid); color: var(--nd-text-primary); text-align: left; }
.nd-select.size { font-family: "SF Mono", "Menlo", "Consolas", monospace; font-size: 11px; }
${Gt}
.nd-inner-sep { display: none; }
.nd-controls { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.nd-auto {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    background: var(--nd-bg-active);
    border: 1px solid var(--nd-border-subtle);
    border-radius: var(--nd-radius-sm);
    cursor: pointer;
    transition: all 0.15s;
}
.nd-auto:hover { background: var(--nd-bg-active); }
.nd-auto.on { background: color-mix(in srgb, var(--nd-success) 8%, var(--nd-bg)); border-color: var(--nd-success); }
.nd-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--nd-border-hover);
    transition: all 0.2s;
}
.nd-auto.on .nd-dot { background: var(--nd-success); box-shadow: 0 0 8px var(--nd-success); }
.nd-auto-text { font-size: 12px; color: var(--nd-text-muted); }
.nd-auto:hover .nd-auto-text { color: var(--nd-text-secondary); }
.nd-auto.on .nd-auto-text { color: var(--nd-success); }
.nd-gear {
    width: 36px;
    height: 36px;
    border: 1px solid var(--nd-border-subtle);
    border-radius: var(--nd-radius-sm);
    background: var(--nd-bg-active);
    color: var(--nd-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.15s;
}
.nd-gear:hover { background: var(--nd-bg-active); color: var(--nd-text-secondary); }
.nd-floating-global {
    position: fixed;
    z-index: 10000;
    user-select: none;
}
.nd-floating-global .nd-capsule {
    background: var(--nd-bg-solid);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    touch-action: none;
    cursor: grab;
}
.nd-floating-global .nd-capsule:active { cursor: grabbing; }
${$t}
`;function nt(){if(zt(),X)return;X=!0;const t=document.createElement("style");t.id="xiaobaix-sd-floating-style",t.textContent=Qt,document.head.appendChild(t)}function c(t,e,n){const o=document.createElement(t);return e&&(o.className=e),n!==void 0&&(o.textContent=n),o}function yt(t){const e=c("button","nd-btn-menu nd-btn-menu-persist");return e.title="展开菜单",e.appendChild(c("span","nd-arrow",t)),e}function U(t){if(!t)return;const e=h(),n=e.presets||[],o=e.selectedPresetId;t.replaceChildren(),n.forEach(r=>{const i=document.createElement("option");i.value=r.id,i.textContent=r.name||"未命名",r.id===o&&(i.selected=!0),t.appendChild(i)})}function q(t){if(!t)return;const e=h().overrideSize||"default";t.replaceChildren(),Yt.forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.label,n.value===e&&(o.selected=!0),t.appendChild(o)})}var M=qt({getOverride:()=>h().overrideMaxImages,getPresetMaxImages:()=>{const t=h();return Ot(t.presets,t.selectedPresetId)},persistOverride:(t,{okText:e})=>ut(n=>{n.overrideMaxImages=t},e),listInputs:()=>[...d.values()].map(t=>t.cache?.maxImagesInput).concat(p.maxImagesInput),notify:t=>globalThis.toastr?.warning?.(t)});function Ht(t){return{messageId:t,root:null,state:a.IDLE,result:{success:0,total:0,error:null,startTime:0},autoResetTimer:null,cooldownRafId:null,cooldownEndTime:0,cache:{},_cleanup:null}}function Vt(t){const e=h().mode==="auto",n=document.createElement("div");n.className=`nd-float${e?" auto-on":""}`,n.dataset.messageId=String(t);const o=c("div","nd-capsule"),r=c("div","nd-inner"),i=c("div","nd-layer nd-layer-idle"),l=c("button","nd-btn-draw");l.title="点击生成配图",l.append(c("span","","🎨"),c("span","nd-auto-dot"));const f=c("div","nd-sep"),x=c("button","nd-btn-menu");x.title="展开菜单",x.append(c("span","nd-arrow","▼")),i.append(l,f,x);const b=c("div","nd-layer nd-layer-active");b.append(c("span","nd-status-icon","⏳"),c("span","nd-status-text",g.analysis)),r.append(i,b),o.append(r,yt("▼"));const y=Ct(),C=St(e);return n.append(o,y,C),n}function Ct(){const t=c("div","nd-detail"),e=c("div","nd-detail-row");e.append(c("span","nd-detail-icon","📊"),c("span","nd-detail-label","结果"),c("span","nd-detail-value nd-result","-"));const n=c("div","nd-detail-row nd-error-row");n.style.display="none",n.append(c("span","nd-detail-icon","💡"),c("span","nd-detail-label","原因"),c("span","nd-detail-value error nd-error","-"));const o=c("div","nd-detail-row");return o.append(c("span","nd-detail-icon","⏱"),c("span","nd-detail-label","耗时"),c("span","nd-detail-value nd-time","-")),t.append(e,n,o),t}function St(t=!1){const e=c("div","nd-menu"),n=c("div","nd-card"),o=c("div","nd-row");o.appendChild(c("span","nd-label","预设"));const r=c("select","nd-select nd-preset-select");U(r),o.appendChild(r);const i=c("div","nd-inner-sep"),l=c("div","nd-row");l.appendChild(c("span","nd-label","尺寸"));const f=c("select","nd-select size nd-size-select");q(f),l.appendChild(f),n.append(o,i,l,M.createRow());const x=c("div","nd-controls"),b=c("div",`nd-auto${t?" on":""} nd-auto-toggle`);b.append(c("span","nd-dot"),c("span","nd-auto-text","自动配图"));const y=c("button","nd-gear nd-settings-btn","⚙");return y.title="打开设置",x.append(b,y),e.append(n,x),e}function jt(t){const e=t.root;e&&(t.cache={statusIcon:e.querySelector(".nd-status-icon"),statusText:e.querySelector(".nd-status-text"),result:e.querySelector(".nd-result"),errorRow:e.querySelector(".nd-error-row"),error:e.querySelector(".nd-error"),time:e.querySelector(".nd-time"),presetSelect:e.querySelector(".nd-preset-select"),sizeSelect:e.querySelector(".nd-size-select"),maxImagesInput:e.querySelector(`.${vt}`),autoToggle:e.querySelector(".nd-auto-toggle")})}function $(t){t.cooldownRafId&&(cancelAnimationFrame(t.cooldownRafId),t.cooldownRafId=null),t.cooldownEndTime=0}async function D(t,e={}){const n=j(t);if(n){W(t,n.state,n.data);return}const o=et(t),r=await At(t).catch(()=>null);if(!r||!R(o))return;t=I().chat.indexOf(o.message);const i=j(t);if(i){W(t,i.state,i.data);return}const l=I(),f=String(l?.chatId||""),x=l?.chat?.[Number(t)];if(!f||!x)return;const b=Number.isInteger(x.swipe_id)?x.swipe_id:0,y=Number.isSafeInteger(r.swipeIndex)?r.swipeIndex:b,C=r.provider||e?.provider||Wt,_=r.runId||e?.runId||"",E={chatId:f,messageId:t,swipeIndex:y,provider:C,runId:_},H=Ut({detail:e,pending:r.pending,...E}),B=Bt(H,r,E),V=d.get(t);if(V){const k=at({currentState:V.state,pending:r.pending,detail:B,...E});(k!==V.state||k===a.ACCEPTED&&rt(H))&&P(t,k,B)}if(s&&Number(t)===O()){const k=at({currentState:m,pending:r.pending,detail:B,...E});r.pending&&(N=Number(t)),(k!==m||k===a.ACCEPTED&&rt(H))&&L(k,B)}}function Xt(t={}){const e=Pt(t,I());if(!e)return;const n=O();(d.has(e.messageId)||s&&e.messageId===n)&&w(D(e.messageId,t),{source:import.meta.url,operation:"syncDrawRunActivity"})}function Oe(){const t=O();if(s){const e=t>=0?j(t):null;e?(N=t,L(e.state,e.data)):L(a.IDLE)}t>=0&&w(D(t),{source:import.meta.url,operation:"refreshDrawRunUiState"})}function Tt({cooldownUntil:t,duration:e}={}){const n=Number(t);return Number.isFinite(n)&&n>0?n:Date.now()+Math.max(0,Number(e)||0)}function Jt(t,e){$(t),t.cooldownEndTime=Tt(e);function n(){if(!t.cooldownEndTime)return;const o=Math.max(0,t.cooldownEndTime-Date.now()),r=t.cache?.statusText;if(r&&(r.textContent=`${(o/1e3).toFixed(1)}s`,r.className="nd-status-text nd-countdown"),o<=0){$(t);return}t.cooldownRafId=requestAnimationFrame(n)}t.cooldownRafId=requestAnimationFrame(n)}function P(t,e,n={}){const o=d.get(t);if(!o?.root)return;const r=o.root;o.state=e,o.autoResetTimer&&(clearTimeout(o.autoResetTimer),o.autoResetTimer=null),e!==a.COOLDOWN&&$(o),r.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:i,statusText:l}=o.cache;switch(l&&(l.className="nd-status-text"),e){case a.IDLE:o.result={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="↥",i.className="nd-status-icon nd-spin"),l&&(l.textContent=g.submitting);break;case a.ACCEPTED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent=xt(n),i.className="nd-status-icon nd-spin"),l&&(l.textContent=wt(n));break;case a.UNCERTAIN:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="↻",i.className="nd-status-icon nd-spin"),l&&(l.textContent=g.uncertain);break;case a.QUEUED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="⌛",i.className="nd-status-icon"),l&&(l.textContent=g.queued),o.result.total=n.total||o.result.total||0;break;case a.LLM:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),l&&(l.textContent=dt(n));break;case a.GEN:r.classList.add("working"),i&&(i.textContent="🎨",i.className="nd-status-icon nd-spin"),l&&(l.textContent=`${n.current||0}/${n.total||0}`),o.result.total=n.total||0;break;case a.COOLDOWN:r.classList.add("cooldown"),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),Jt(o,n);break;case a.RECONNECTING:r.classList.add("working"),i&&(i.textContent="↻",i.className="nd-status-icon nd-spin"),l&&(l.textContent=g.reconnecting);break;case a.CANCELLING:r.classList.add("working"),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),l&&(l.textContent=g.cancelling);break;case a.SUCCESS:r.classList.add("success"),i&&(i.textContent="✓",i.className="nd-status-icon"),l&&(l.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>P(t,a.IDLE),A);break;case a.PARTIAL:r.classList.add("partial"),i&&(i.textContent="⚠",i.className="nd-status-icon"),l&&(l.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>P(t,a.IDLE),A);break;case a.ERROR:r.classList.add("error"),i&&(i.textContent="✗",i.className="nd-status-icon"),l&&(l.textContent=n.unknown?g.unknown:g.error),o.result.error=n.error,o.autoResetTimer=setTimeout(()=>P(t,a.IDLE),A);break}}function Kt(t){const e=d.get(t);if(!e?.root)return;const{result:n,errorRow:o,error:r,time:i}=e.cache,{result:l,state:f}=e,x=l.startTime?((Date.now()-l.startTime)/1e3).toFixed(1):"-";f===a.SUCCESS||f===a.PARTIAL?(n&&(n.textContent=`${l.success}/${l.total} 成功`,n.className=`nd-detail-value ${f===a.SUCCESS?"success":"warning"}`),o&&(o.style.display=f===a.PARTIAL?"flex":"none"),r&&f===a.PARTIAL&&(r.textContent=`${l.total-l.success} 张失败`)):f===a.ERROR&&(n&&(n.textContent=l.error?.label||Q.redrawFailed,n.className="nd-detail-value error"),o&&(o.style.display="flex"),r&&(r.textContent=l.error?.desc||"未知错误")),i&&(i.textContent=`${x}s`)}async function Zt(t){const e=d.get(t);if(!e||e.state!==a.IDLE)return;const n=te(e)??t;n!==t&&(console.warn("[SdDraw] 楼层面板 messageId 与 DOM 不一致，已按 DOM 楼层生成:",{state:t,dom:n}),d.delete(t),e.messageId=n,e.root.dataset.messageId=String(n),d.set(n,e));try{await pt({messageId:n,onStateChange:(o,r,i)=>{W(i,o,r)}})}catch(o){if(o.drawTaskReported)return;o instanceof lt||it(o)?toastr?.info?.(o.message):(console.error(o),toastr?.error?.(o.message))}}function te(t){const e=t?.root?.closest?.(".mes")?.getAttribute?.("mesid"),n=Number(e);return Number.isFinite(n)?n:null}async function ee(t){const e=et(t);try{await mt({cancel:()=>gt(t,{target:e}),isCurrent:()=>R(e),getState:()=>d.get(I().chat.indexOf(e.message))?.state,setState:n=>P(I().chat.indexOf(e.message),n)})&&R(e)&&toastr?.info?.("正在中止"),R(e)&&await D(I().chat.indexOf(e.message))}catch(n){console.error("[SdDraw] 中止失败:",n),toastr?.error?.(Q.cancelFailed)}}function ne(t){const{messageId:e,root:n}=t;n.querySelector(".nd-btn-draw")?.addEventListener("click",l=>{l.stopPropagation(),w(Zt(e),{source:import.meta.url,operation:"callback"})}),n.querySelectorAll(".nd-btn-menu").forEach(l=>l.addEventListener("click",f=>{f.stopPropagation(),n.classList.remove("show-detail"),n.classList.contains("expanded")||(oe(e),re(e),ae(e)),n.classList.toggle("expanded")})),n.querySelector(".nd-layer-active")?.addEventListener("click",l=>{l.stopPropagation(),[a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING].includes(t.state)?w(ee(e),{source:import.meta.url,operation:"callback"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(t.state)&&(Kt(e),n.classList.toggle("show-detail"))}),t.cache.presetSelect?.addEventListener("change",async l=>{await Et(l.target.value)}),t.cache.sizeSelect?.addEventListener("change",async l=>{await It(l.target.value)});const o=M.bind(t.cache.maxImagesInput);t.cache.autoToggle?.addEventListener("click",async()=>{await Lt()}),n.querySelector(".nd-settings-btn")?.addEventListener("click",l=>{l.stopPropagation(),n.classList.remove("expanded"),w(ft(),{source:import.meta.url,operation:"callback"})});const r=l=>{n.contains(l.target)||n.classList.remove("expanded","show-detail")};document.addEventListener("click",r,{passive:!0});const i=ct({document,container:n.querySelector(".nd-controls")});t._cleanup=()=>{i?.destroy(),o.destroy(),document.removeEventListener("click",r)}}function oe(t){U(d.get(t)?.cache?.presetSelect)}function re(t){q(d.get(t)?.cache?.sizeSelect)}function ae(t){M.fill(d.get(t)?.cache?.maxImagesInput)}async function ot(t,e,n){const o=await ut(t,n);return o&&typeof e=="function"&&e(),o}async function Et(t){return ot(e=>{e.selectedPresetId=t},Dt)}async function It(t){return ot(e=>{e.overrideSize=t},Se)}async function Lt(){const t=h().mode==="auto"?"manual":"auto";return ot(e=>{e.mode=t},Ee)}function K(t,e){if(d.has(e)){const r=d.get(e);if(r.root?.isConnected)return w(D(e),{source:import.meta.url,operation:"mountFloorPanel"}),r;r._cleanup?.(),d.delete(e)}nt();const n=Ht(e),o=Vt(e);return n.root=o,Mt(e,o,{position:"right",id:`sd-draw-${e}`})?(jt(n),ne(n),d.set(e,n),w(D(e),{source:import.meta.url,operation:"mountFloorPanel"}),n):null}function se(){T||(T=new IntersectionObserver(t=>{const e=[];for(const n of t){if(!n.isIntersecting)continue;const o=n.target,r=Number(o.getAttribute("mesid"));F.has(r)&&(e.push({el:o,mid:r}),F.delete(r),T.unobserve(o))}e.length>0&&requestAnimationFrame(()=>{e.forEach(({el:n,mid:o})=>K(n,o))})},{rootMargin:"300px"}))}function ie(t,e,n={}){if(h().showFloorButton===!1)return null;const{force:o=!1}=n;if(nt(),d.has(e)){const i=d.get(e);if(i.root?.isConnected)return i;i._cleanup?.(),d.delete(e)}if(o)return K(t,e);const r=t.getBoundingClientRect();return r.top<window.innerHeight+500&&r.bottom>-500?K(t,e):(se(),F.set(e,!0),T.observe(t),null)}function Me(t,e){T?.unobserve(t),F.delete(e);const n=d.get(e);!n||!t.contains(n.root)||(n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),tt(e,n.root),d.delete(e))}function W(t,e,n={}){let o=d.get(t);if(!o?.root?.isConnected){const r=document.querySelector(`.mes[mesid="${t}"]`);r&&(o=ie(r,t,{force:!0}))}o&&P(t,e,n),s&&t===O()&&(N=t,L(e,n))}function le(){try{const e=localStorage.getItem(ht);if(e)return JSON.parse(e)}catch(e){console.warn({source:import.meta.url,operation:"getFloatingPosition"},e)}const t=document.getElementById("xiaobaix-debug-mini");if(t){const e=t.getBoundingClientRect();return{left:e.left,top:e.bottom+8}}return{left:window.innerWidth-110,top:window.innerHeight-80}}function ce(){if(!s)return;const t=s.getBoundingClientRect();try{localStorage.setItem(ht,JSON.stringify({left:Math.round(t.left),top:Math.round(t.top)}))}catch(e){console.warn({source:import.meta.url,operation:"saveFloatingPosition"},e)}}var de=77,ue=101;function Z(){if(!s)return;const t=le(),e=bt(),n=m===a.IDLE?de:ue,o=s.offsetHeight||34;s.style.left=`${Math.max(e.left,Math.min(t.left,e.right-n))}px`,s.style.top=`${Math.max(e.top,Math.min(t.top,e.bottom-o))}px`}function Y(){z&&(cancelAnimationFrame(z),z=null),G=0}function pe(t){Y(),G=Tt(t);function e(){if(!G)return;const n=Math.max(0,G-Date.now()),o=p.statusText;if(o&&(o.textContent=`${(n/1e3).toFixed(1)}s`,o.className="nd-status-text nd-countdown"),n<=0){Y();return}z=requestAnimationFrame(e)}z=requestAnimationFrame(e)}function L(t,e={}){if(!s)return;const n=m===a.IDLE;m=t,n!==(t===a.IDLE)&&Z(),S&&(clearTimeout(S),S=null),t!==a.COOLDOWN&&Y(),s.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:o,statusText:r}=p;if(!(!o||!r))switch(r.className="nd-status-text",t){case a.IDLE:N=null,u={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:s.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="↥",o.className="nd-status-icon nd-spin",r.textContent=g.submitting;break;case a.ACCEPTED:s.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent=xt(e),o.className="nd-status-icon nd-spin",r.textContent=wt(e);break;case a.UNCERTAIN:s.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=g.uncertain;break;case a.QUEUED:s.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="⌛",o.className="nd-status-icon",r.textContent=g.queued;break;case a.LLM:s.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=dt(e);break;case a.GEN:s.classList.add("working"),o.textContent="🎨",o.className="nd-status-icon nd-spin",r.textContent=`${e.current||0}/${e.total||0}`,u.total=e.total||0;break;case a.COOLDOWN:s.classList.add("cooldown"),o.textContent="⏳",o.className="nd-status-icon nd-spin",pe(e);break;case a.RECONNECTING:s.classList.add("working"),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=g.reconnecting;break;case a.CANCELLING:s.classList.add("working"),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=g.cancelling;break;case a.SUCCESS:s.classList.add("success"),o.textContent="✓",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,u.success=e.success,u.total=e.total,S=setTimeout(()=>L(a.IDLE),A);break;case a.PARTIAL:s.classList.add("partial"),o.textContent="⚠",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,u.success=e.success,u.total=e.total,S=setTimeout(()=>L(a.IDLE),A);break;case a.ERROR:s.classList.add("error"),o.textContent="✗",o.className="nd-status-icon",r.textContent=e.unknown?g.unknown:g.error,u.error=e.error,S=setTimeout(()=>L(a.IDLE),A);break}}function fe(){const{detailResult:t,detailErrorRow:e,detailError:n,detailTime:o}=p;if(!t)return;const r=u.startTime?((Date.now()-u.startTime)/1e3).toFixed(1):"-";m===a.SUCCESS||m===a.PARTIAL?(t.textContent=`${u.success}/${u.total} 成功`,t.className=`nd-detail-value ${m===a.SUCCESS?"success":"warning"}`,e.style.display=m===a.PARTIAL?"flex":"none",m===a.PARTIAL&&(n.textContent=`${u.total-u.success} 张失败`)):m===a.ERROR&&(t.textContent=u.error?.label||Q.redrawFailed,t.className="nd-detail-value error",e.style.display="flex",n.textContent=u.error?.desc||"未知错误"),o.textContent=`${r}s`}function ge(t){if(!(t.button!==0||!s)){v={startX:t.clientX,startY:t.clientY,startLeft:s.getBoundingClientRect().left,startTop:s.getBoundingClientRect().top,pointerId:t.pointerId,moved:!1,originalTarget:t.target};try{t.currentTarget.setPointerCapture(t.pointerId)}catch(e){console.warn({source:import.meta.url,operation:"onFloatingPointerDown"},e)}t.preventDefault()}}function me(t){if(!v||v.pointerId!==t.pointerId||!s)return;const e=t.clientX-v.startX,n=t.clientY-v.startY;if(!v.moved&&(Math.abs(e)>3||Math.abs(n)>3)&&(v.moved=!0),v.moved){const o=bt(),r=s.offsetWidth||88,i=s.offsetHeight||36;s.style.left=`${Math.max(o.left,Math.min(v.startLeft+e,o.right-r))}px`,s.style.top=`${Math.max(o.top,Math.min(v.startTop+n,o.bottom-i))}px`}t.preventDefault()}function st(t){if(!v||v.pointerId!==t.pointerId)return;const{moved:e,originalTarget:n}=v;try{t.currentTarget.releasePointerCapture(t.pointerId)}catch(o){console.warn({source:import.meta.url,operation:"onFloatingPointerUp"},o)}v=null,e?ce():ve(n)}function ve(t){t.closest(".nd-btn-draw")?w(xe(),{source:import.meta.url,operation:"routeFloatingClick"}):t.closest(".nd-btn-menu")?(s.classList.remove("show-detail"),s.classList.contains("expanded")||(we(),he(),ye()),s.classList.toggle("expanded")):t.closest(".nd-layer-active")&&([a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING].includes(m)?w(be(),{source:import.meta.url,operation:"routeFloatingClick"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(m)&&(fe(),s.classList.toggle("show-detail")))}async function xe(){if(m!==a.IDLE)return;const t=O();if(t<0){toastr?.warning?.("没有可配图的AI消息");return}N=t;try{await pt({messageId:t,onStateChange:(e,n,o)=>{W(o,e,n)}})}catch(e){if(e.drawTaskReported)return;e instanceof lt||it(e)?toastr?.info?.(e.message):(console.error(e),toastr?.error?.(e.message))}}async function be(){const t=N,e=et(t);try{t>=0&&await mt({cancel:()=>gt(t,{target:e}),isCurrent:()=>R(e)&&N===I().chat.indexOf(e.message),getState:()=>m,setState:L})&&R(e)&&toastr?.info?.("正在中止"),t>=0&&R(e)&&await D(I().chat.indexOf(e.message))}catch(n){console.error("[SdDraw] 中止失败:",n),toastr?.error?.(Q.cancelFailed)}}function we(){U(p.presetSelect)}function he(){q(p.sizeSelect)}function ye(){M.fill(p.maxImagesInput)}function Ce(){s&&(p={capsule:s.querySelector(".nd-capsule"),statusIcon:s.querySelector(".nd-status-icon"),statusText:s.querySelector(".nd-status-text"),detailResult:s.querySelector(".nd-result"),detailErrorRow:s.querySelector(".nd-error-row"),detailError:s.querySelector(".nd-error"),detailTime:s.querySelector(".nd-time"),presetSelect:s.querySelector(".nd-preset-select"),sizeSelect:s.querySelector(".nd-size-select"),maxImagesInput:s.querySelector(`.${vt}`),autoToggle:s.querySelector(".nd-auto-toggle")})}function kt(t){s&&!s.contains(t.target)&&s.classList.remove("expanded","show-detail")}function Rt(){if(s)return;const t=h();if(t.showFloatingButton===!1)return;nt();const e=t.mode==="auto";s=document.createElement("div"),s.className=`nd-float nd-floating-global${e?" auto-on":""}`,s.id="nd-floating-global";const n=Ct(),o=St(e),r=c("div","nd-capsule"),i=c("div","nd-inner"),l=c("div","nd-layer nd-layer-idle"),f=c("button","nd-btn-draw");f.title="点击为最后一条AI消息生成配图",f.append(c("span","","🎨"),c("span","nd-auto-dot"));const x=c("div","nd-sep"),b=c("button","nd-btn-menu");b.title="展开菜单",b.append(c("span","nd-arrow","▼")),l.append(f,x,b);const y=c("div","nd-layer nd-layer-active");y.append(c("span","nd-status-icon","⏳"),c("span","nd-status-text",g.analysis)),i.append(l,y),r.append(i,yt("▼")),s.append(n,o,r),document.body.appendChild(s),Ce(),Z();const C=p.capsule;C&&(C.addEventListener("pointerdown",ge,{passive:!1}),C.addEventListener("pointermove",me,{passive:!1}),C.addEventListener("pointerup",st,{passive:!1}),C.addEventListener("pointercancel",st,{passive:!1})),p.presetSelect?.addEventListener("change",async E=>{await Et(E.target.value)}),p.sizeSelect?.addEventListener("change",async E=>{await It(E.target.value)}),p.maxImagesBinding=M.bind(p.maxImagesInput),p.themeSwitch=ct({document,container:s.querySelector(".nd-controls")}),p.popovers=_t(s,Z),p.autoToggle?.addEventListener("click",async()=>{await Lt()}),s.querySelector(".nd-settings-btn")?.addEventListener("click",()=>{s.classList.remove("expanded"),w(ft(),{source:import.meta.url,operation:"callback"})}),document.addEventListener("click",kt,{passive:!0});const _=O();_>=0&&w(D(_),{source:import.meta.url,operation:"createFloatingButton"})}function Nt(){p.popovers?.destroy(),p.themeSwitch?.destroy(),p.maxImagesBinding?.destroy(),Y(),S&&(clearTimeout(S),S=null),document.removeEventListener("click",kt),s?.remove(),s=null,v=null,m=a.IDLE,p={}}function Dt(){d.forEach(t=>U(t.cache?.presetSelect)),U(p.presetSelect),Te()}function Se(){d.forEach(t=>q(t.cache?.sizeSelect)),q(p.sizeSelect)}function Te(){M.updateAll()}function Ee(){const t=h().mode==="auto";d.forEach(e=>{e.root&&(e.root.classList.toggle("auto-on",t),e.cache.autoToggle?.classList.toggle("on",t))}),s&&(s.classList.toggle("auto-on",t),p.autoToggle?.classList.toggle("on",t))}function ze(){Dt()}function Ue(t,e){e&&!s?Rt():!e&&s&&Nt(),t||(d.forEach((n,o)=>{n.autoResetTimer&&clearTimeout(n.autoResetTimer),$(n),n._cleanup?.(),n.root&&tt(o,n.root)}),d.clear(),F.clear(),T?.disconnect(),T=null)}function qe(){J??=Ft(Xt),h().showFloatingButton!==!1&&Rt()}function Ie(){J?.(),J=null,d.forEach((t,e)=>{t.autoResetTimer&&clearTimeout(t.autoResetTimer),$(t),t._cleanup?.(),t.root&&tt(e,t.root)}),d.clear(),F.clear(),T?.disconnect(),T=null,Nt()}function $e(){Ie(),document.getElementById("xiaobaix-sd-floating-style")?.remove(),X=!1}export{a as FloatState,Yt as SIZE_OPTIONS,Rt as createFloatingButton,Nt as destroyFloatingButton,Ie as destroyFloatingPanel,$e as destroySdDrawPanels,ie as ensureSdDrawPanel,qe as initFloatingPanel,Oe as refreshDrawRunUiState,ze as refreshPresetSelect,Me as releaseSdDrawPanel,L as setFloatingState,W as setStateForMessage,Te as updateAllMaxImagesInputs,Dt as updateAllPresetSelects,Se as updateAllSizeSelects,Ee as updateAutoModeUI,Ue as updateButtonVisibility};
