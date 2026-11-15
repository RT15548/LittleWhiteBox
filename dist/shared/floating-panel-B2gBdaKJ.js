import{n as w}from"./async-errors-C4kfchr9.js";import{l as lt}from"./panel-escape-Cs2M9fDW.js";import{Ct as h,Dt as Pt,vt as H,wt as Ft}from"./gallery-cache-CKCTctC7.js";import{$t as Ot,H as Mt,K as ct,U as N,V as et,ct as Ut,f as dt,n as nt,st as zt,t as $t}from"./message-toolbar-B4r3am-C.js";import{u as M,xt as ut,yt as g}from"./draw-common-Db9aBG_O.js";import{a as X,c as pt,i as ft,l as gt,o as y,t as mt}from"./comfy-draw-B-H7HzID.js";import{a as qt,c as vt,d as _t,f as Bt,i as at,l as xt,m as Gt,n as bt,o as Wt,p as wt,s as st,t as ht,u as Yt}from"./draw-run-ui-state-DzJe8teQ.js";import{getContext as L}from"../../../../../extensions.js";var yt="xb_comfy_float_pos",P=8e3,Qt="comfyui",a={IDLE:"idle",SUBMITTING:"submitting",ACCEPTED:"accepted",UNCERTAIN:"uncertain",QUEUED:"queued",LLM:"llm",GEN:"gen",COOLDOWN:"cooldown",RECONNECTING:"reconnecting",CANCELLING:"cancelling",SUCCESS:"success",PARTIAL:"partial",ERROR:"error"},Ht=[{value:"default",label:"跟随预设",width:null,height:null},{value:"832x1216",label:"832 × 1216  竖图",width:832,height:1216},{value:"1216x832",label:"1216 × 832  横图",width:1216,height:832},{value:"1024x1024",label:"1024 × 1024  方图",width:1024,height:1024},{value:"768x1280",label:"768 x 1280  大竖",width:768,height:1280},{value:"1280x768",label:"1280 x 768  大横",width:1280,height:768}],d=new Map,O=new Map,E=null,s=null,v=null,m=a.IDLE,D=null,u={success:0,total:0,error:null,startTime:0},T=null,z=null,W=0,p={},J=!1,K=null,Vt=`
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
${Yt}
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
    z-index: ${Ft.floating};
    user-select: none;
}
.nd-floating-global .nd-capsule {
    background: var(--nd-bg-solid);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    touch-action: none;
    cursor: grab;
}
.nd-floating-global .nd-capsule:active { cursor: grabbing; }
${Bt}
`;function ot(){if(Pt(),J)return;J=!0;const t=document.createElement("style");t.id="xiaobaix-comfy-floating-style",t.textContent=Vt,document.head.appendChild(t)}function c(t,e,n){const o=document.createElement(t);return e&&(o.className=e),n!==void 0&&(o.textContent=n),o}function Ct(t){const e=c("button","nd-btn-menu nd-btn-menu-persist");return e.title="展开菜单",e.appendChild(c("span","nd-arrow",t)),e}function $(t){if(!t)return;const e=y(),n=e.presets||[],o=e.selectedPresetId;t.replaceChildren(),n.forEach(r=>{const i=document.createElement("option");i.value=r.id,i.textContent=r.name||"未命名",r.id===o&&(i.selected=!0),t.appendChild(i)})}function q(t){if(!t)return;const e=y().overrideSize||"default";t.replaceChildren(),Ht.forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.label,n.value===e&&(o.selected=!0),t.appendChild(o)})}var U=_t({getOverride:()=>y().overrideMaxImages,getPresetMaxImages:()=>{const t=y();return Ot(t.presets,t.selectedPresetId)},persistOverride:(t,{okText:e})=>gt(n=>{n.overrideMaxImages=t},e),listInputs:()=>[...d.values()].map(t=>t.cache?.maxImagesInput).concat(p.maxImagesInput),notify:t=>h.warning(t)});function jt(t){return{messageId:t,root:null,state:a.IDLE,result:{success:0,total:0,error:null,startTime:0},autoResetTimer:null,cooldownRafId:null,cooldownEndTime:0,cache:{},_cleanup:null}}function Xt(t){const e=y().mode==="auto",n=document.createElement("div");n.className=`nd-float${e?" auto-on":""}`,n.dataset.messageId=String(t);const o=c("div","nd-capsule"),r=c("div","nd-inner"),i=c("div","nd-layer nd-layer-idle"),l=c("button","nd-btn-draw");l.title="点击生成配图",l.append(c("span","","🎨"),c("span","nd-auto-dot"));const f=c("div","nd-sep"),x=c("button","nd-btn-menu");x.title="展开菜单",x.append(c("span","nd-arrow","▼")),i.append(l,f,x);const b=c("div","nd-layer nd-layer-active");b.append(c("span","nd-status-icon","⏳"),c("span","nd-status-text",g.analysis)),r.append(i,b),o.append(r,Ct("▼"));const C=St(),S=Tt(e);return n.append(o,C,S),n}function St(){const t=c("div","nd-detail"),e=c("div","nd-detail-row");e.append(c("span","nd-detail-icon","📊"),c("span","nd-detail-label","结果"),c("span","nd-detail-value nd-result","-"));const n=c("div","nd-detail-row nd-error-row");n.style.display="none",n.append(c("span","nd-detail-icon","💡"),c("span","nd-detail-label","原因"),c("span","nd-detail-value error nd-error","-"));const o=c("div","nd-detail-row");return o.append(c("span","nd-detail-icon","⏱"),c("span","nd-detail-label","耗时"),c("span","nd-detail-value nd-time","-")),t.append(e,n,o),t}function Tt(t=!1){const e=c("div","nd-menu"),n=c("div","nd-card"),o=c("div","nd-row");o.appendChild(c("span","nd-label","预设"));const r=c("select","nd-select nd-preset-select");$(r),o.appendChild(r);const i=c("div","nd-inner-sep"),l=c("div","nd-row");l.appendChild(c("span","nd-label","尺寸"));const f=c("select","nd-select size nd-size-select");q(f),l.appendChild(f),n.append(o,i,l,U.createRow());const x=c("div","nd-controls"),b=c("div",`nd-auto${t?" on":""} nd-auto-toggle`);b.append(c("span","nd-dot"),c("span","nd-auto-text","自动配图"));const C=c("button","nd-gear nd-settings-btn","⚙");return C.title="打开设置",x.append(b,C),e.append(n,x),e}function Jt(t){const e=t.root;e&&(t.cache={statusIcon:e.querySelector(".nd-status-icon"),statusText:e.querySelector(".nd-status-text"),result:e.querySelector(".nd-result"),errorRow:e.querySelector(".nd-error-row"),error:e.querySelector(".nd-error"),time:e.querySelector(".nd-time"),presetSelect:e.querySelector(".nd-preset-select"),sizeSelect:e.querySelector(".nd-size-select"),maxImagesInput:e.querySelector(`.${xt}`),autoToggle:e.querySelector(".nd-auto-toggle")})}function _(t){t.cooldownRafId&&(cancelAnimationFrame(t.cooldownRafId),t.cooldownRafId=null),t.cooldownEndTime=0}async function A(t,e={}){const n=X(t);if(n){Y(t,n.state,n.data);return}const o=et(t),r=await Mt(t).catch(()=>null);if(!r||!N(o))return;t=L().chat.indexOf(o.message);const i=X(t);if(i){Y(t,i.state,i.data);return}const l=L(),f=String(l?.chatId||""),x=l?.chat?.[Number(t)];if(!f||!x)return;const b=Number.isInteger(x.swipe_id)?x.swipe_id:0,C=Number.isSafeInteger(r.swipeIndex)?r.swipeIndex:b,S=r.provider||e?.provider||Qt,B=r.runId||e?.runId||"",I={chatId:f,messageId:t,swipeIndex:C,provider:S,runId:B},V=qt({detail:e,pending:r.pending,...I}),G=Wt(V,r,I),j=d.get(t);if(j){const R=st({currentState:j.state,pending:r.pending,detail:G,...I});(R!==j.state||R===a.ACCEPTED&&at(V))&&F(t,R,G)}if(s&&Number(t)===M()){const R=st({currentState:m,pending:r.pending,detail:G,...I});r.pending&&(D=Number(t)),(R!==m||R===a.ACCEPTED&&at(V))&&k(R,G)}}function Kt(t={}){const e=zt(t,L());if(!e)return;const n=M();(d.has(e.messageId)||s&&e.messageId===n)&&w(A(e.messageId,t),{source:import.meta.url,operation:"syncDrawRunActivity"})}function Ue(){const t=M();if(s){const e=t>=0?X(t):null;e?(D=t,k(e.state,e.data)):k(a.IDLE)}t>=0&&w(A(t),{source:import.meta.url,operation:"refreshDrawRunUiState"})}function Et({cooldownUntil:t,duration:e}={}){const n=Number(t);return Number.isFinite(n)&&n>0?n:Date.now()+Math.max(0,Number(e)||0)}function Zt(t,e){_(t),t.cooldownEndTime=Et(e);function n(){if(!t.cooldownEndTime)return;const o=Math.max(0,t.cooldownEndTime-Date.now()),r=t.cache?.statusText;if(r&&(r.textContent=`${(o/1e3).toFixed(1)}s`,r.className="nd-status-text nd-countdown"),o<=0){_(t);return}t.cooldownRafId=requestAnimationFrame(n)}t.cooldownRafId=requestAnimationFrame(n)}function F(t,e,n={}){const o=d.get(t);if(!o?.root)return;const r=o.root;o.state=e,o.autoResetTimer&&(clearTimeout(o.autoResetTimer),o.autoResetTimer=null),e!==a.COOLDOWN&&_(o),r.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:i,statusText:l}=o.cache;switch(l&&(l.className="nd-status-text"),e){case a.IDLE:o.result={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="↥",i.className="nd-status-icon nd-spin"),l&&(l.textContent=g.submitting);break;case a.ACCEPTED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent=bt(n),i.className="nd-status-icon nd-spin"),l&&(l.textContent=ht(n));break;case a.UNCERTAIN:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="↻",i.className="nd-status-icon nd-spin"),l&&(l.textContent=g.uncertain);break;case a.QUEUED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="⌛",i.className="nd-status-icon"),l&&(l.textContent=g.queued),o.result.total=n.total||o.result.total||0;break;case a.LLM:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),l&&(l.textContent=ut(n));break;case a.GEN:r.classList.add("working"),i&&(i.textContent="🎨",i.className="nd-status-icon nd-spin"),l&&(l.textContent=`${n.current||0}/${n.total||0}`),o.result.total=n.total||0;break;case a.COOLDOWN:r.classList.add("cooldown"),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),Zt(o,n);break;case a.RECONNECTING:r.classList.add("working"),i&&(i.textContent="↻",i.className="nd-status-icon nd-spin"),l&&(l.textContent=g.reconnecting);break;case a.CANCELLING:r.classList.add("working"),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),l&&(l.textContent=g.cancelling);break;case a.SUCCESS:r.classList.add("success"),i&&(i.textContent="✓",i.className="nd-status-icon"),l&&(l.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>F(t,a.IDLE),P);break;case a.PARTIAL:r.classList.add("partial"),i&&(i.textContent="⚠",i.className="nd-status-icon"),l&&(l.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>F(t,a.IDLE),P);break;case a.ERROR:r.classList.add("error"),i&&(i.textContent="✗",i.className="nd-status-icon"),l&&(l.textContent=n.unknown?g.unknown:g.error),o.result.error=n.error,o.autoResetTimer=setTimeout(()=>F(t,a.IDLE),P);break}}function te(t){const e=d.get(t);if(!e?.root)return;const{result:n,errorRow:o,error:r,time:i}=e.cache,{result:l,state:f}=e,x=l.startTime?((Date.now()-l.startTime)/1e3).toFixed(1):"-";f===a.SUCCESS||f===a.PARTIAL?(n&&(n.textContent=`${l.success}/${l.total} 成功`,n.className=`nd-detail-value ${f===a.SUCCESS?"success":"warning"}`),o&&(o.style.display=f===a.PARTIAL?"flex":"none"),r&&f===a.PARTIAL&&(r.textContent=`${l.total-l.success} 张失败`)):f===a.ERROR&&(n&&(n.textContent=l.error?.label||H.redrawFailed,n.className="nd-detail-value error"),o&&(o.style.display="flex"),r&&(r.textContent=l.error?.desc||"未知错误")),i&&(i.textContent=`${x}s`)}async function ee(t){const e=d.get(t);if(!e||e.state!==a.IDLE)return;const n=ne(e)??t;n!==t&&(console.warn("[ComfyDraw] 楼层面板 messageId 与 DOM 不一致，已按 DOM 楼层生成:",{state:t,dom:n}),d.delete(t),e.messageId=n,e.root.dataset.messageId=String(n),d.set(n,e));try{await ft({messageId:n,onStateChange:(o,r,i)=>{Y(i,o,r)}})}catch(o){if(o.drawTaskReported)return;o instanceof dt||ct(o)?h.info(o.message):(console.error(o),h.error(o.message))}}function ne(t){const e=t?.root?.closest?.(".mes")?.getAttribute?.("mesid"),n=Number(e);return Number.isFinite(n)?n:null}async function oe(t){const e=et(t);try{await vt({cancel:()=>mt(t,{target:e}),isCurrent:()=>N(e),getState:()=>d.get(L().chat.indexOf(e.message))?.state,setState:n=>F(L().chat.indexOf(e.message),n)})&&N(e)&&h.info("正在中止"),N(e)&&await A(L().chat.indexOf(e.message))}catch(n){console.error("[ComfyDraw] 中止失败:",n),h.error(H.cancelFailed)}}function re(t){const{messageId:e,root:n}=t;n.querySelector(".nd-btn-draw")?.addEventListener("click",l=>{l.stopPropagation(),w(ee(e),{source:import.meta.url,operation:"callback"})}),n.querySelectorAll(".nd-btn-menu").forEach(l=>l.addEventListener("click",f=>{f.stopPropagation(),n.classList.remove("show-detail"),n.classList.contains("expanded")||(ae(e),se(e),ie(e)),n.classList.toggle("expanded")})),n.querySelector(".nd-layer-active")?.addEventListener("click",l=>{l.stopPropagation(),[a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING].includes(t.state)?w(oe(e),{source:import.meta.url,operation:"callback"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(t.state)&&(te(e),n.classList.toggle("show-detail"))}),t.cache.presetSelect?.addEventListener("change",async l=>{await It(l.target.value)}),t.cache.sizeSelect?.addEventListener("change",async l=>{await Lt(l.target.value)});const o=U.bind(t.cache.maxImagesInput);t.cache.autoToggle?.addEventListener("click",async()=>{await kt()}),n.querySelector(".nd-settings-btn")?.addEventListener("click",l=>{l.stopPropagation(),n.classList.remove("expanded"),w(pt(),{source:import.meta.url,operation:"callback"})});const r=l=>{n.contains(l.target)||n.classList.remove("expanded","show-detail")};document.addEventListener("click",r,{passive:!0});const i=lt({document,container:n.querySelector(".nd-controls")});t._cleanup=()=>{i?.destroy(),o.destroy(),document.removeEventListener("click",r)}}function ae(t){$(d.get(t)?.cache?.presetSelect)}function se(t){q(d.get(t)?.cache?.sizeSelect)}function ie(t){U.fill(d.get(t)?.cache?.maxImagesInput)}async function rt(t,e,n){const o=await gt(t,n);return o&&typeof e=="function"&&e(),o}async function It(t){return rt(e=>{e.selectedPresetId=t},At)}async function Lt(t){return rt(e=>{e.overrideSize=t},Ee)}async function kt(){const t=y().mode==="auto"?"manual":"auto";return rt(e=>{e.mode=t},Le)}function Z(t,e){if(d.has(e)){const r=d.get(e);if(r.root?.isConnected)return w(A(e),{source:import.meta.url,operation:"mountFloorPanel"}),r;r._cleanup?.(),d.delete(e)}ot();const n=jt(e),o=Xt(e);return n.root=o,$t(e,o,{position:"right",id:`comfy-draw-${e}`})?(Jt(n),re(n),d.set(e,n),w(A(e),{source:import.meta.url,operation:"mountFloorPanel"}),n):null}function le(){E||(E=new IntersectionObserver(t=>{const e=[];for(const n of t){if(!n.isIntersecting)continue;const o=n.target,r=Number(o.getAttribute("mesid"));O.has(r)&&(e.push({el:o,mid:r}),O.delete(r),E.unobserve(o))}e.length>0&&requestAnimationFrame(()=>{e.forEach(({el:n,mid:o})=>Z(n,o))})},{rootMargin:"300px"}))}function ce(t,e,n={}){if(y().showFloorButton===!1)return null;const{force:o=!1}=n;if(ot(),d.has(e)){const i=d.get(e);if(i.root?.isConnected)return i;i._cleanup?.(),d.delete(e)}if(o)return Z(t,e);const r=t.getBoundingClientRect();return r.top<window.innerHeight+500&&r.bottom>-500?Z(t,e):(le(),O.set(e,!0),E.observe(t),null)}function ze(t,e){E?.unobserve(t),O.delete(e);const n=d.get(e);!n||!t.contains(n.root)||(n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),nt(e,n.root),d.delete(e))}function Y(t,e,n={}){let o=d.get(t);if(!o?.root?.isConnected){const r=document.querySelector(`.mes[mesid="${t}"]`);r&&(o=ce(r,t,{force:!0}))}o&&F(t,e,n),s&&t===M()&&(D=t,k(e,n))}function de(){try{const e=localStorage.getItem(yt);if(e)return JSON.parse(e)}catch(e){console.warn({source:import.meta.url,operation:"getFloatingPosition"},e)}const t=document.getElementById("xiaobaix-debug-mini");if(t){const e=t.getBoundingClientRect();return{left:e.left,top:e.bottom+8}}return{left:window.innerWidth-110,top:window.innerHeight-80}}function ue(){if(!s)return;const t=s.getBoundingClientRect();try{localStorage.setItem(yt,JSON.stringify({left:Math.round(t.left),top:Math.round(t.top)}))}catch(e){console.warn({source:import.meta.url,operation:"saveFloatingPosition"},e)}}var pe=77,fe=101;function tt(){if(!s)return;const t=de(),e=wt(),n=m===a.IDLE?pe:fe,o=s.offsetHeight||34;s.style.left=`${Math.max(e.left,Math.min(t.left,e.right-n))}px`,s.style.top=`${Math.max(e.top,Math.min(t.top,e.bottom-o))}px`}function Q(){z&&(cancelAnimationFrame(z),z=null),W=0}function ge(t){Q(),W=Et(t);function e(){if(!W)return;const n=Math.max(0,W-Date.now()),o=p.statusText;if(o&&(o.textContent=`${(n/1e3).toFixed(1)}s`,o.className="nd-status-text nd-countdown"),n<=0){Q();return}z=requestAnimationFrame(e)}z=requestAnimationFrame(e)}function k(t,e={}){if(!s)return;const n=m===a.IDLE;m=t,n!==(t===a.IDLE)&&tt(),T&&(clearTimeout(T),T=null),t!==a.COOLDOWN&&Q(),s.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:o,statusText:r}=p;if(!(!o||!r))switch(r.className="nd-status-text",t){case a.IDLE:D=null,u={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:s.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="↥",o.className="nd-status-icon nd-spin",r.textContent=g.submitting;break;case a.ACCEPTED:s.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent=bt(e),o.className="nd-status-icon nd-spin",r.textContent=ht(e);break;case a.UNCERTAIN:s.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=g.uncertain;break;case a.QUEUED:s.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="⌛",o.className="nd-status-icon",r.textContent=g.queued;break;case a.LLM:s.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=ut(e);break;case a.GEN:s.classList.add("working"),o.textContent="🎨",o.className="nd-status-icon nd-spin",r.textContent=`${e.current||0}/${e.total||0}`,u.total=e.total||0;break;case a.COOLDOWN:s.classList.add("cooldown"),o.textContent="⏳",o.className="nd-status-icon nd-spin",ge(e);break;case a.RECONNECTING:s.classList.add("working"),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=g.reconnecting;break;case a.CANCELLING:s.classList.add("working"),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=g.cancelling;break;case a.SUCCESS:s.classList.add("success"),o.textContent="✓",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,u.success=e.success,u.total=e.total,T=setTimeout(()=>k(a.IDLE),P);break;case a.PARTIAL:s.classList.add("partial"),o.textContent="⚠",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,u.success=e.success,u.total=e.total,T=setTimeout(()=>k(a.IDLE),P);break;case a.ERROR:s.classList.add("error"),o.textContent="✗",o.className="nd-status-icon",r.textContent=e.unknown?g.unknown:g.error,u.error=e.error,T=setTimeout(()=>k(a.IDLE),P);break}}function me(){const{detailResult:t,detailErrorRow:e,detailError:n,detailTime:o}=p;if(!t)return;const r=u.startTime?((Date.now()-u.startTime)/1e3).toFixed(1):"-";m===a.SUCCESS||m===a.PARTIAL?(t.textContent=`${u.success}/${u.total} 成功`,t.className=`nd-detail-value ${m===a.SUCCESS?"success":"warning"}`,e.style.display=m===a.PARTIAL?"flex":"none",m===a.PARTIAL&&(n.textContent=`${u.total-u.success} 张失败`)):m===a.ERROR&&(t.textContent=u.error?.label||H.redrawFailed,t.className="nd-detail-value error",e.style.display="flex",n.textContent=u.error?.desc||"未知错误"),o.textContent=`${r}s`}function ve(t){if(!(t.button!==0||!s)){v={startX:t.clientX,startY:t.clientY,startLeft:s.getBoundingClientRect().left,startTop:s.getBoundingClientRect().top,pointerId:t.pointerId,moved:!1,originalTarget:t.target};try{t.currentTarget.setPointerCapture(t.pointerId)}catch(e){console.warn({source:import.meta.url,operation:"onFloatingPointerDown"},e)}t.preventDefault()}}function xe(t){if(!v||v.pointerId!==t.pointerId||!s)return;const e=t.clientX-v.startX,n=t.clientY-v.startY;if(!v.moved&&(Math.abs(e)>3||Math.abs(n)>3)&&(v.moved=!0),v.moved){const o=wt(),r=s.offsetWidth||88,i=s.offsetHeight||36;s.style.left=`${Math.max(o.left,Math.min(v.startLeft+e,o.right-r))}px`,s.style.top=`${Math.max(o.top,Math.min(v.startTop+n,o.bottom-i))}px`}t.preventDefault()}function it(t){if(!v||v.pointerId!==t.pointerId)return;const{moved:e,originalTarget:n}=v;try{t.currentTarget.releasePointerCapture(t.pointerId)}catch(o){console.warn({source:import.meta.url,operation:"onFloatingPointerUp"},o)}v=null,e?ue():be(n)}function be(t){t.closest(".nd-btn-draw")?w(we(),{source:import.meta.url,operation:"routeFloatingClick"}):t.closest(".nd-btn-menu")?(s.classList.remove("show-detail"),s.classList.contains("expanded")||(ye(),Ce(),Se()),s.classList.toggle("expanded")):t.closest(".nd-layer-active")&&([a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING].includes(m)?w(he(),{source:import.meta.url,operation:"routeFloatingClick"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(m)&&(me(),s.classList.toggle("show-detail")))}async function we(){if(m!==a.IDLE)return;const t=M();if(t<0){h.warning("没有可配图的AI消息");return}D=t;try{await ft({messageId:t,onStateChange:(e,n,o)=>{Y(o,e,n)}})}catch(e){if(e.drawTaskReported)return;e instanceof dt||ct(e)?h.info(e.message):(console.error(e),h.error(e.message))}}async function he(){const t=D,e=et(t);try{t>=0&&await vt({cancel:()=>mt(t,{target:e}),isCurrent:()=>N(e)&&D===L().chat.indexOf(e.message),getState:()=>m,setState:k})&&N(e)&&h.info("正在中止"),t>=0&&N(e)&&await A(L().chat.indexOf(e.message))}catch(n){console.error("[ComfyDraw] 中止失败:",n),h.error(H.cancelFailed)}}function ye(){$(p.presetSelect)}function Ce(){q(p.sizeSelect)}function Se(){U.fill(p.maxImagesInput)}function Te(){s&&(p={capsule:s.querySelector(".nd-capsule"),statusIcon:s.querySelector(".nd-status-icon"),statusText:s.querySelector(".nd-status-text"),detailResult:s.querySelector(".nd-result"),detailErrorRow:s.querySelector(".nd-error-row"),detailError:s.querySelector(".nd-error"),detailTime:s.querySelector(".nd-time"),presetSelect:s.querySelector(".nd-preset-select"),sizeSelect:s.querySelector(".nd-size-select"),maxImagesInput:s.querySelector(`.${xt}`),autoToggle:s.querySelector(".nd-auto-toggle")})}function Rt(t){s&&!s.contains(t.target)&&s.classList.remove("expanded","show-detail")}function Nt(){if(s)return;const t=y();if(t.showFloatingButton===!1)return;ot();const e=t.mode==="auto";s=document.createElement("div"),s.className=`nd-float nd-floating-global${e?" auto-on":""}`,s.id="nd-comfy-floating-global";const n=St(),o=Tt(e),r=c("div","nd-capsule"),i=c("div","nd-inner"),l=c("div","nd-layer nd-layer-idle"),f=c("button","nd-btn-draw");f.title="点击为最后一条AI消息生成配图",f.append(c("span","","🎨"),c("span","nd-auto-dot"));const x=c("div","nd-sep"),b=c("button","nd-btn-menu");b.title="展开菜单",b.append(c("span","nd-arrow","▼")),l.append(f,x,b);const C=c("div","nd-layer nd-layer-active");C.append(c("span","nd-status-icon","⏳"),c("span","nd-status-text",g.analysis)),i.append(l,C),r.append(i,Ct("▼")),s.append(n,o,r),document.body.appendChild(s),Te(),tt();const S=p.capsule;S&&(S.addEventListener("pointerdown",ve,{passive:!1}),S.addEventListener("pointermove",xe,{passive:!1}),S.addEventListener("pointerup",it,{passive:!1}),S.addEventListener("pointercancel",it,{passive:!1})),p.presetSelect?.addEventListener("change",async I=>{await It(I.target.value)}),p.sizeSelect?.addEventListener("change",async I=>{await Lt(I.target.value)}),p.maxImagesBinding=U.bind(p.maxImagesInput),p.themeSwitch=lt({document,container:s.querySelector(".nd-controls")}),p.popovers=Gt(s,tt),p.autoToggle?.addEventListener("click",async()=>{await kt()}),s.querySelector(".nd-settings-btn")?.addEventListener("click",()=>{s.classList.remove("expanded"),w(pt(),{source:import.meta.url,operation:"callback"})}),document.addEventListener("click",Rt,{passive:!0});const B=M();B>=0&&w(A(B),{source:import.meta.url,operation:"createFloatingButton"})}function Dt(){p.popovers?.destroy(),p.themeSwitch?.destroy(),p.maxImagesBinding?.destroy(),Q(),T&&(clearTimeout(T),T=null),document.removeEventListener("click",Rt),s?.remove(),s=null,v=null,m=a.IDLE,p={}}function At(){d.forEach(t=>$(t.cache?.presetSelect)),$(p.presetSelect),Ie()}function Ee(){d.forEach(t=>q(t.cache?.sizeSelect)),q(p.sizeSelect)}function Ie(){U.updateAll()}function Le(){const t=y().mode==="auto";d.forEach(e=>{e.root&&(e.root.classList.toggle("auto-on",t),e.cache.autoToggle?.classList.toggle("on",t))}),s&&(s.classList.toggle("auto-on",t),p.autoToggle?.classList.toggle("on",t))}function $e(){At()}function qe(t,e){e&&!s?Nt():!e&&s&&Dt(),t||(d.forEach((n,o)=>{n.autoResetTimer&&clearTimeout(n.autoResetTimer),_(n),n._cleanup?.(),n.root&&nt(o,n.root)}),d.clear(),O.clear(),E?.disconnect(),E=null)}function _e(){K??=Ut(Kt),y().showFloatingButton!==!1&&Nt()}function ke(){K?.(),K=null,d.forEach((t,e)=>{t.autoResetTimer&&clearTimeout(t.autoResetTimer),_(t),t._cleanup?.(),t.root&&nt(e,t.root)}),d.clear(),O.clear(),E?.disconnect(),E=null,Dt()}function Be(){ke(),document.getElementById("xiaobaix-comfy-floating-style")?.remove(),J=!1}export{a as FloatState,Ht as SIZE_OPTIONS,Nt as createFloatingButton,Be as destroyComfyDrawPanels,Dt as destroyFloatingButton,ke as destroyFloatingPanel,ce as ensureComfyDrawPanel,_e as initFloatingPanel,Ue as refreshDrawRunUiState,$e as refreshPresetSelect,ze as releaseComfyDrawPanel,k as setFloatingState,Y as setStateForMessage,Ie as updateAllMaxImagesInputs,At as updateAllPresetSelects,Ee as updateAllSizeSelects,Le as updateAutoModeUI,qe as updateButtonVisibility};
