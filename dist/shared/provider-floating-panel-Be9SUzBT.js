import{n as w}from"./async-errors-C4kfchr9.js";import{l as Nt}from"./panel-escape-Cs2M9fDW.js";import{At as H,Ft as y,It as Se,zt as ke}from"./gallery-cache-BtPO_egh.js";import{O as Le}from"./settings-model-C_QuyUVr.js";import{bt as Dt,vt as g}from"./draw-common-BXV3PRzN.js";import{F as Ie,P as Re,_ as Pt,g as P,h as Ne,m as lt,t as At}from"./floor-image-job-Burc2Nx9.js";import{n as ct,t as De}from"./message-toolbar-DqDV3oLB.js";import{a as Pe,c as Ft,d as Ae,f as Fe,i as Ot,l as Mt,m as Oe,n as $t,o as Me,p as zt,s as Ut,t as qt,u as $e}from"./draw-run-ui-state-DdW-kmWe.js";import{getContext as I}from"../../../../../extensions.js";var z=8e3,a={IDLE:"idle",SUBMITTING:"submitting",ACCEPTED:"accepted",UNCERTAIN:"uncertain",QUEUED:"queued",LLM:"llm",GEN:"gen",COOLDOWN:"cooldown",RECONNECTING:"reconnecting",CANCELLING:"cancelling",SUCCESS:"success",PARTIAL:"partial",ERROR:"error"},ze=[{value:"default",label:"跟随预设",width:null,height:null},{value:"832x1216",label:"832 × 1216  竖图",width:832,height:1216},{value:"1216x832",label:"1216 × 832  横图",width:1216,height:832},{value:"1024x1024",label:"1024 × 1024  方图",width:1024,height:1024},{value:"768x1280",label:"768 x 1280  大竖",width:768,height:1280},{value:"1280x768",label:"1280 x 768  大横",width:1280,height:768}],Ue=`
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
${$e}
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
    z-index: ${Se.floating};
    user-select: none;
}
.nd-floating-global .nd-capsule {
    background: var(--nd-bg-solid);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    touch-action: none;
    cursor: grab;
}
.nd-floating-global .nd-capsule:active { cursor: grabbing; }
${Fe}
`;function Xe({provider:A,positionKey:dt=`xb_${A}_float_pos`,styleId:ut=`xiaobaix-${A}-floating-style`,floatingId:_t=`nd-${A}-floating-global`,toolbarIdPrefix:Bt=`${A}-draw`,logLabel:X=A,getSettings:h,updateSettingsPersistent:pt,getSizeOptions:Gt=()=>ze,openSettings:ft,generateAndInsertImages:mt,getGenerationState:V,findLastAIMessageId:F,abortGeneration:gt}){const d=new Map,O=new Map;let C=null,s=null,x=null,m=a.IDLE,R=null,u={success:0,total:0,error:null,startTime:0},T=null,U=null,W=0,p={},J=!1,Z=null;function K(){if(ke(),J)return;J=!0;const t=document.createElement("style");t.id=ut,t.textContent=Ue,document.head.appendChild(t)}function c(t,e,n){const o=document.createElement(t);return e&&(o.className=e),n!==void 0&&(o.textContent=n),o}function xt(t){const e=c("button","nd-btn-menu nd-btn-menu-persist");return e.title="展开菜单",e.appendChild(c("span","nd-arrow",t)),e}function q(t){if(!t)return;const e=h(),n=e.presets||[],o=e.selectedPresetId;t.replaceChildren(),n.forEach(r=>{const i=document.createElement("option");i.value=r.id,i.textContent=r.name||"未命名",r.id===o&&(i.selected=!0),t.appendChild(i)})}function _(t){if(!t)return;const e=h().overrideSize||"default";t.replaceChildren(),Gt().forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.label,n.value===e&&(o.selected=!0),t.appendChild(o)})}const M=Ae({getOverride:()=>h().overrideMaxImages,getPresetMaxImages:()=>{const t=h();return Le(t.presets,t.selectedPresetId)},persistOverride:(t,{okText:e})=>pt(n=>{n.overrideMaxImages=t},e),listInputs:()=>[...d.values()].map(t=>t.cache?.maxImagesInput).concat(p.maxImagesInput),notify:t=>y.warning(t)});function Wt(t){return{messageId:t,root:null,state:a.IDLE,result:{success:0,total:0,error:null,startTime:0},autoResetTimer:null,cooldownRafId:null,cooldownEndTime:0,cache:{},_cleanup:null}}function Yt(t){const e=h().mode==="auto",n=document.createElement("div");n.className=`nd-float${e?" auto-on":""}`,n.dataset.messageId=String(t);const o=c("div","nd-capsule"),r=c("div","nd-inner"),i=c("div","nd-layer nd-layer-idle"),l=c("button","nd-btn-draw");l.title="点击生成配图",l.append(c("span","","🎨"),c("span","nd-auto-dot"));const f=c("div","nd-sep"),v=c("button","nd-btn-menu");v.title="展开菜单",v.append(c("span","nd-arrow","▼")),i.append(l,f,v);const b=c("div","nd-layer nd-layer-active");b.append(c("span","nd-status-icon","⏳"),c("span","nd-status-text",g.analysis)),r.append(i,b),o.append(r,xt("▼"));const S=vt(),k=bt(e);return n.append(o,S,k),n}function vt(){const t=c("div","nd-detail"),e=c("div","nd-detail-row");e.append(c("span","nd-detail-icon","📊"),c("span","nd-detail-label","结果"),c("span","nd-detail-value nd-result","-"));const n=c("div","nd-detail-row nd-error-row");n.style.display="none",n.append(c("span","nd-detail-icon","💡"),c("span","nd-detail-label","原因"),c("span","nd-detail-value error nd-error","-"));const o=c("div","nd-detail-row");return o.append(c("span","nd-detail-icon","⏱"),c("span","nd-detail-label","耗时"),c("span","nd-detail-value nd-time","-")),t.append(e,n,o),t}function bt(t=!1){const e=c("div","nd-menu"),n=c("div","nd-card"),o=c("div","nd-row");o.appendChild(c("span","nd-label","预设"));const r=c("select","nd-select nd-preset-select");q(r),o.appendChild(r);const i=c("div","nd-inner-sep"),l=c("div","nd-row");l.appendChild(c("span","nd-label","尺寸"));const f=c("select","nd-select size nd-size-select");_(f),l.appendChild(f),n.append(o,i,l,M.createRow());const v=c("div","nd-controls"),b=c("div",`nd-auto${t?" on":""} nd-auto-toggle`);b.append(c("span","nd-dot"),c("span","nd-auto-text","自动配图"));const S=c("button","nd-gear nd-settings-btn","⚙");return S.title="打开设置",v.append(b,S),e.append(n,v),e}function Qt(t){const e=t.root;e&&(t.cache={statusIcon:e.querySelector(".nd-status-icon"),statusText:e.querySelector(".nd-status-text"),result:e.querySelector(".nd-result"),errorRow:e.querySelector(".nd-error-row"),error:e.querySelector(".nd-error"),time:e.querySelector(".nd-time"),presetSelect:e.querySelector(".nd-preset-select"),sizeSelect:e.querySelector(".nd-size-select"),maxImagesInput:e.querySelector(`.${Mt}`),autoToggle:e.querySelector(".nd-auto-toggle")})}function B(t){t.cooldownRafId&&(cancelAnimationFrame(t.cooldownRafId),t.cooldownRafId=null),t.cooldownEndTime=0}async function N(t,e={}){const n=V(t);if(n){G(t,n.state,n.data);return}const o=lt(t),r=await Ne(t).catch(()=>null);if(!r||!P(o))return;t=I().chat.indexOf(o.message);const i=V(t);if(i){G(t,i.state,i.data);return}const l=I(),f=String(l?.chatId||""),v=l?.chat?.[Number(t)];if(!f||!v)return;const b=Number.isInteger(v.swipe_id)?v.swipe_id:0,S=Number.isSafeInteger(r.swipeIndex)?r.swipeIndex:b,k=r.provider||e?.provider||A,Q=r.runId||e?.runId||"",L={chatId:f,messageId:t,swipeIndex:S,provider:k,runId:Q},st=Pe({detail:e,pending:r.pending,...L}),j=Me(st,r,L),it=d.get(t);if(it){const D=Ut({currentState:it.state,pending:r.pending,detail:j,...L});(D!==it.state||D===a.ACCEPTED&&Ot(st))&&$(t,D,j)}if(s&&Number(t)===F()){const D=Ut({currentState:m,pending:r.pending,detail:j,...L});r.pending&&(R=Number(t)),(D!==m||D===a.ACCEPTED&&Ot(st))&&E(D,j)}}function jt(t={}){const e=Re(t,I());if(!e)return;const n=F();(d.has(e.messageId)||s&&e.messageId===n)&&w(N(e.messageId,t),{source:import.meta.url,operation:"syncDrawRunActivity"})}function Ht(){const t=F();if(s){const e=t>=0?V(t):null;e?(R=t,E(e.state,e.data)):E(a.IDLE)}t>=0&&w(N(t),{source:import.meta.url,operation:"refreshDrawRunUiState"})}function wt({cooldownUntil:t,duration:e}={}){const n=Number(t);return Number.isFinite(n)&&n>0?n:Date.now()+Math.max(0,Number(e)||0)}function Xt(t,e){B(t),t.cooldownEndTime=wt(e);function n(){if(!t.cooldownEndTime)return;const o=Math.max(0,t.cooldownEndTime-Date.now()),r=t.cache?.statusText;if(r&&(r.textContent=`${(o/1e3).toFixed(1)}s`,r.className="nd-status-text nd-countdown"),o<=0){B(t);return}t.cooldownRafId=requestAnimationFrame(n)}t.cooldownRafId=requestAnimationFrame(n)}function $(t,e,n={}){const o=d.get(t);if(!o?.root)return;const r=o.root;o.state=e,o.autoResetTimer&&(clearTimeout(o.autoResetTimer),o.autoResetTimer=null),e!==a.COOLDOWN&&B(o),r.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:i,statusText:l}=o.cache;switch(l&&(l.className="nd-status-text"),e){case a.IDLE:o.result={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="↥",i.className="nd-status-icon nd-spin"),l&&(l.textContent=g.submitting);break;case a.ACCEPTED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent=$t(n),i.className="nd-status-icon nd-spin"),l&&(l.textContent=qt(n));break;case a.UNCERTAIN:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="↻",i.className="nd-status-icon nd-spin"),l&&(l.textContent=g.uncertain);break;case a.QUEUED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="⌛",i.className="nd-status-icon"),l&&(l.textContent=g.queued),o.result.total=n.total||o.result.total||0;break;case a.LLM:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),l&&(l.textContent=Dt(n));break;case a.GEN:r.classList.add("working"),i&&(i.textContent="🎨",i.className="nd-status-icon nd-spin"),l&&(l.textContent=`${n.current||0}/${n.total||0}`),o.result.total=n.total||0;break;case a.COOLDOWN:r.classList.add("cooldown"),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),Xt(o,n);break;case a.RECONNECTING:r.classList.add("working"),i&&(i.textContent="↻",i.className="nd-status-icon nd-spin"),l&&(l.textContent=g.reconnecting);break;case a.CANCELLING:r.classList.add("working"),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),l&&(l.textContent=g.cancelling);break;case a.SUCCESS:r.classList.add("success"),i&&(i.textContent="✓",i.className="nd-status-icon"),l&&(l.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>$(t,a.IDLE),z);break;case a.PARTIAL:r.classList.add("partial"),i&&(i.textContent="⚠",i.className="nd-status-icon"),l&&(l.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>$(t,a.IDLE),z);break;case a.ERROR:r.classList.add("error"),i&&(i.textContent="✗",i.className="nd-status-icon"),l&&(l.textContent=n.unknown?g.unknown:g.error),o.result.error=n.error,o.autoResetTimer=setTimeout(()=>$(t,a.IDLE),z);break}}function Vt(t){const e=d.get(t);if(!e?.root)return;const{result:n,errorRow:o,error:r,time:i}=e.cache,{result:l,state:f}=e,v=l.startTime?((Date.now()-l.startTime)/1e3).toFixed(1):"-";f===a.SUCCESS||f===a.PARTIAL?(n&&(n.textContent=`${l.success}/${l.total} 成功`,n.className=`nd-detail-value ${f===a.SUCCESS?"success":"warning"}`),o&&(o.style.display=f===a.PARTIAL?"flex":"none"),r&&f===a.PARTIAL&&(r.textContent=`${l.total-l.success} 张失败`)):f===a.ERROR&&(n&&(n.textContent=l.error?.label||H.redrawFailed,n.className="nd-detail-value error"),o&&(o.style.display="flex"),r&&(r.textContent=l.error?.desc||"未知错误")),i&&(i.textContent=`${v}s`)}async function Jt(t){const e=d.get(t);if(!e||e.state!==a.IDLE)return;const n=Zt(e)??t;n!==t&&(console.warn(`[${X}] 楼层面板 messageId 与 DOM 不一致，已按 DOM 楼层生成:`,{state:t,dom:n}),d.delete(t),e.messageId=n,e.root.dataset.messageId=String(n),d.set(n,e));try{await mt({messageId:n,onStateChange:(o,r,i)=>{G(i,o,r)}})}catch(o){if(o.drawTaskReported)return;o instanceof At||Pt(o)?y.info(o.message):(console.error(o),y.error(o.message))}}function Zt(t){const e=t?.root?.closest?.(".mes")?.getAttribute?.("mesid"),n=Number(e);return Number.isFinite(n)?n:null}async function Kt(t){const e=lt(t);try{await Ft({cancel:()=>gt(t,{target:e}),isCurrent:()=>P(e),getState:()=>d.get(I().chat.indexOf(e.message))?.state,setState:n=>$(I().chat.indexOf(e.message),n)})&&P(e)&&y.info("正在中止"),P(e)&&await N(I().chat.indexOf(e.message))}catch(n){console.error(`[${X}] 中止失败:`,n),y.error(H.cancelFailed)}}function te(t){const{messageId:e,root:n}=t;n.querySelector(".nd-btn-draw")?.addEventListener("click",l=>{l.stopPropagation(),w(Jt(e),{source:import.meta.url,operation:"callback"})}),n.querySelectorAll(".nd-btn-menu").forEach(l=>l.addEventListener("click",f=>{f.stopPropagation(),n.classList.remove("show-detail"),n.classList.contains("expanded")||(ee(e),ne(e),oe(e)),n.classList.toggle("expanded")})),n.querySelector(".nd-layer-active")?.addEventListener("click",l=>{l.stopPropagation(),[a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING].includes(t.state)?w(Kt(e),{source:import.meta.url,operation:"callback"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(t.state)&&(Vt(e),n.classList.toggle("show-detail"))}),t.cache.presetSelect?.addEventListener("change",async l=>{await ht(l.target.value)}),t.cache.sizeSelect?.addEventListener("change",async l=>{await yt(l.target.value)});const o=M.bind(t.cache.maxImagesInput);t.cache.autoToggle?.addEventListener("click",async()=>{await Ct()}),n.querySelector(".nd-settings-btn")?.addEventListener("click",l=>{l.stopPropagation(),n.classList.remove("expanded"),w(ft(),{source:import.meta.url,operation:"callback"})});const r=l=>{n.contains(l.target)||n.classList.remove("expanded","show-detail")};document.addEventListener("click",r,{passive:!0});const i=Nt({document,container:n.querySelector(".nd-controls")});t._cleanup=()=>{i?.destroy(),o.destroy(),document.removeEventListener("click",r)}}function ee(t){q(d.get(t)?.cache?.presetSelect)}function ne(t){_(d.get(t)?.cache?.sizeSelect)}function oe(t){M.fill(d.get(t)?.cache?.maxImagesInput)}async function tt(t,e,n){const o=await pt(t,n);return o&&typeof e=="function"&&e(),o}async function ht(t){return tt(e=>{e.selectedPresetId=t},at)}async function yt(t){return tt(e=>{e.overrideSize=t},kt)}async function Ct(){const t=h().mode==="auto"?"manual":"auto";return tt(e=>{e.mode=t},It)}function et(t,e){if(d.has(e)){const r=d.get(e);if(r.root?.isConnected)return w(N(e),{source:import.meta.url,operation:"mountFloorPanel"}),r;r._cleanup?.(),d.delete(e)}K();const n=Wt(e),o=Yt(e);return n.root=o,De(e,o,{position:"right",id:`${Bt}-${e}`})?(Qt(n),te(n),d.set(e,n),w(N(e),{source:import.meta.url,operation:"mountFloorPanel"}),n):null}function re(){C||(C=new IntersectionObserver(t=>{const e=[];for(const n of t){if(!n.isIntersecting)continue;const o=n.target,r=Number(o.getAttribute("mesid"));O.has(r)&&(e.push({el:o,mid:r}),O.delete(r),C.unobserve(o))}e.length>0&&requestAnimationFrame(()=>{e.forEach(({el:n,mid:o})=>et(n,o))})},{rootMargin:"300px"}))}function Tt(t,e,n={}){if(h().showFloorButton===!1)return null;const{force:o=!1}=n;if(K(),d.has(e)){const i=d.get(e);if(i.root?.isConnected)return i;i._cleanup?.(),d.delete(e)}if(o)return et(t,e);const r=t.getBoundingClientRect();return r.top<window.innerHeight+500&&r.bottom>-500?et(t,e):(re(),O.set(e,!0),C.observe(t),null)}function ae(t,e){C?.unobserve(t),O.delete(e);const n=d.get(e);!n||!t.contains(n.root)||(n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),ct(e,n.root),d.delete(e))}function G(t,e,n={}){let o=d.get(t);if(!o?.root?.isConnected){const r=document.querySelector(`.mes[mesid="${t}"]`);r&&(o=Tt(r,t,{force:!0}))}o&&$(t,e,n),s&&t===F()&&(R=t,E(e,n))}function se(){try{const e=localStorage.getItem(dt);if(e)return JSON.parse(e)}catch(e){console.warn({source:import.meta.url,operation:"getFloatingPosition"},e)}const t=document.getElementById("xiaobaix-debug-mini");if(t){const e=t.getBoundingClientRect();return{left:e.left,top:e.bottom+8}}return{left:window.innerWidth-110,top:window.innerHeight-80}}function ie(){if(!s)return;const t=s.getBoundingClientRect();try{localStorage.setItem(dt,JSON.stringify({left:Math.round(t.left),top:Math.round(t.top)}))}catch(e){console.warn({source:import.meta.url,operation:"saveFloatingPosition"},e)}}const le=77,ce=101;function nt(){if(!s)return;const t=se(),e=zt(),n=m===a.IDLE?le:ce,o=s.offsetHeight||34;s.style.left=`${Math.max(e.left,Math.min(t.left,e.right-n))}px`,s.style.top=`${Math.max(e.top,Math.min(t.top,e.bottom-o))}px`}function Y(){U&&(cancelAnimationFrame(U),U=null),W=0}function de(t){Y(),W=wt(t);function e(){if(!W)return;const n=Math.max(0,W-Date.now()),o=p.statusText;if(o&&(o.textContent=`${(n/1e3).toFixed(1)}s`,o.className="nd-status-text nd-countdown"),n<=0){Y();return}U=requestAnimationFrame(e)}U=requestAnimationFrame(e)}function E(t,e={}){if(!s)return;const n=m===a.IDLE;m=t,n!==(t===a.IDLE)&&nt(),T&&(clearTimeout(T),T=null),t!==a.COOLDOWN&&Y(),s.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:o,statusText:r}=p;if(!(!o||!r))switch(r.className="nd-status-text",t){case a.IDLE:R=null,u={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:s.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="↥",o.className="nd-status-icon nd-spin",r.textContent=g.submitting;break;case a.ACCEPTED:s.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent=$t(e),o.className="nd-status-icon nd-spin",r.textContent=qt(e);break;case a.UNCERTAIN:s.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=g.uncertain;break;case a.QUEUED:s.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="⌛",o.className="nd-status-icon",r.textContent=g.queued;break;case a.LLM:s.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=Dt(e);break;case a.GEN:s.classList.add("working"),o.textContent="🎨",o.className="nd-status-icon nd-spin",r.textContent=`${e.current||0}/${e.total||0}`,u.total=e.total||0;break;case a.COOLDOWN:s.classList.add("cooldown"),o.textContent="⏳",o.className="nd-status-icon nd-spin",de(e);break;case a.RECONNECTING:s.classList.add("working"),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=g.reconnecting;break;case a.CANCELLING:s.classList.add("working"),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=g.cancelling;break;case a.SUCCESS:s.classList.add("success"),o.textContent="✓",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,u.success=e.success,u.total=e.total,T=setTimeout(()=>E(a.IDLE),z);break;case a.PARTIAL:s.classList.add("partial"),o.textContent="⚠",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,u.success=e.success,u.total=e.total,T=setTimeout(()=>E(a.IDLE),z);break;case a.ERROR:s.classList.add("error"),o.textContent="✗",o.className="nd-status-icon",r.textContent=e.unknown?g.unknown:g.error,u.error=e.error,T=setTimeout(()=>E(a.IDLE),z);break}}function ue(){const{detailResult:t,detailErrorRow:e,detailError:n,detailTime:o}=p;if(!t)return;const r=u.startTime?((Date.now()-u.startTime)/1e3).toFixed(1):"-";m===a.SUCCESS||m===a.PARTIAL?(t.textContent=`${u.success}/${u.total} 成功`,t.className=`nd-detail-value ${m===a.SUCCESS?"success":"warning"}`,e.style.display=m===a.PARTIAL?"flex":"none",m===a.PARTIAL&&(n.textContent=`${u.total-u.success} 张失败`)):m===a.ERROR&&(t.textContent=u.error?.label||H.redrawFailed,t.className="nd-detail-value error",e.style.display="flex",n.textContent=u.error?.desc||"未知错误"),o.textContent=`${r}s`}function pe(t){if(!(t.button!==0||!s)){x={startX:t.clientX,startY:t.clientY,startLeft:s.getBoundingClientRect().left,startTop:s.getBoundingClientRect().top,pointerId:t.pointerId,moved:!1,originalTarget:t.target};try{t.currentTarget.setPointerCapture(t.pointerId)}catch(e){console.warn({source:import.meta.url,operation:"onFloatingPointerDown"},e)}t.preventDefault()}}function fe(t){if(!x||x.pointerId!==t.pointerId||!s)return;const e=t.clientX-x.startX,n=t.clientY-x.startY;if(!x.moved&&(Math.abs(e)>3||Math.abs(n)>3)&&(x.moved=!0),x.moved){const o=zt(),r=s.offsetWidth||88,i=s.offsetHeight||36;s.style.left=`${Math.max(o.left,Math.min(x.startLeft+e,o.right-r))}px`,s.style.top=`${Math.max(o.top,Math.min(x.startTop+n,o.bottom-i))}px`}t.preventDefault()}function Et(t){if(!x||x.pointerId!==t.pointerId)return;const{moved:e,originalTarget:n}=x;try{t.currentTarget.releasePointerCapture(t.pointerId)}catch(o){console.warn({source:import.meta.url,operation:"onFloatingPointerUp"},o)}x=null,e?ie():me(n)}function me(t){t.closest(".nd-btn-draw")?w(ge(),{source:import.meta.url,operation:"routeFloatingClick"}):t.closest(".nd-btn-menu")?(s.classList.remove("show-detail"),s.classList.contains("expanded")||(ve(),be(),we()),s.classList.toggle("expanded")):t.closest(".nd-layer-active")&&([a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING].includes(m)?w(xe(),{source:import.meta.url,operation:"routeFloatingClick"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(m)&&(ue(),s.classList.toggle("show-detail")))}async function ge(){if(m!==a.IDLE)return;const t=F();if(t<0){y.warning("没有可配图的AI消息");return}R=t;try{await mt({messageId:t,onStateChange:(e,n,o)=>{G(o,e,n)}})}catch(e){if(e.drawTaskReported)return;e instanceof At||Pt(e)?y.info(e.message):(console.error(e),y.error(e.message))}}async function xe(){const t=R,e=lt(t);try{t>=0&&await Ft({cancel:()=>gt(t,{target:e}),isCurrent:()=>P(e)&&R===I().chat.indexOf(e.message),getState:()=>m,setState:E})&&P(e)&&y.info("正在中止"),t>=0&&P(e)&&await N(I().chat.indexOf(e.message))}catch(n){console.error(`[${X}] 中止失败:`,n),y.error(H.cancelFailed)}}function ve(){q(p.presetSelect)}function be(){_(p.sizeSelect)}function we(){M.fill(p.maxImagesInput)}function he(){s&&(p={capsule:s.querySelector(".nd-capsule"),statusIcon:s.querySelector(".nd-status-icon"),statusText:s.querySelector(".nd-status-text"),detailResult:s.querySelector(".nd-result"),detailErrorRow:s.querySelector(".nd-error-row"),detailError:s.querySelector(".nd-error"),detailTime:s.querySelector(".nd-time"),presetSelect:s.querySelector(".nd-preset-select"),sizeSelect:s.querySelector(".nd-size-select"),maxImagesInput:s.querySelector(`.${Mt}`),autoToggle:s.querySelector(".nd-auto-toggle")})}function St(t){s&&!s.contains(t.target)&&s.classList.remove("expanded","show-detail")}function ot(){if(s)return;const t=h();if(t.showFloatingButton===!1)return;K();const e=t.mode==="auto";s=document.createElement("div"),s.className=`nd-float nd-floating-global${e?" auto-on":""}`,s.id=_t;const n=vt(),o=bt(e),r=c("div","nd-capsule"),i=c("div","nd-inner"),l=c("div","nd-layer nd-layer-idle"),f=c("button","nd-btn-draw");f.title="点击为最后一条AI消息生成配图",f.append(c("span","","🎨"),c("span","nd-auto-dot"));const v=c("div","nd-sep"),b=c("button","nd-btn-menu");b.title="展开菜单",b.append(c("span","nd-arrow","▼")),l.append(f,v,b);const S=c("div","nd-layer nd-layer-active");S.append(c("span","nd-status-icon","⏳"),c("span","nd-status-text",g.analysis)),i.append(l,S),r.append(i,xt("▼")),s.append(n,o,r),document.body.appendChild(s),he(),nt();const k=p.capsule;k&&(k.addEventListener("pointerdown",pe,{passive:!1}),k.addEventListener("pointermove",fe,{passive:!1}),k.addEventListener("pointerup",Et,{passive:!1}),k.addEventListener("pointercancel",Et,{passive:!1})),p.presetSelect?.addEventListener("change",async L=>{await ht(L.target.value)}),p.sizeSelect?.addEventListener("change",async L=>{await yt(L.target.value)}),p.maxImagesBinding=M.bind(p.maxImagesInput),p.themeSwitch=Nt({document,container:s.querySelector(".nd-controls")}),p.popovers=Oe(s,nt),p.autoToggle?.addEventListener("click",async()=>{await Ct()}),s.querySelector(".nd-settings-btn")?.addEventListener("click",()=>{s.classList.remove("expanded"),w(ft(),{source:import.meta.url,operation:"callback"})}),document.addEventListener("click",St,{passive:!0});const Q=F();Q>=0&&w(N(Q),{source:import.meta.url,operation:"createFloatingButton"})}function rt(){p.popovers?.destroy(),p.themeSwitch?.destroy(),p.maxImagesBinding?.destroy(),Y(),T&&(clearTimeout(T),T=null),document.removeEventListener("click",St),s?.remove(),s=null,x=null,m=a.IDLE,p={}}function at(){d.forEach(t=>q(t.cache?.presetSelect)),q(p.presetSelect),Lt()}function kt(){d.forEach(t=>_(t.cache?.sizeSelect)),_(p.sizeSelect)}function Lt(){M.updateAll()}function It(){const t=h().mode==="auto";d.forEach(e=>{e.root&&(e.root.classList.toggle("auto-on",t),e.cache.autoToggle?.classList.toggle("on",t))}),s&&(s.classList.toggle("auto-on",t),p.autoToggle?.classList.toggle("on",t))}function ye(){at()}function Ce(t,e){e&&!s?ot():!e&&s&&rt(),t||(d.forEach((n,o)=>{n.autoResetTimer&&clearTimeout(n.autoResetTimer),B(n),n._cleanup?.(),n.root&&ct(o,n.root)}),d.clear(),O.clear(),C?.disconnect(),C=null)}function Te(){Z??=Ie(jt),h().showFloatingButton!==!1&&ot()}function Rt(){Z?.(),Z=null,d.forEach((t,e)=>{t.autoResetTimer&&clearTimeout(t.autoResetTimer),B(t),t._cleanup?.(),t.root&&ct(e,t.root)}),d.clear(),O.clear(),C?.disconnect(),C=null,rt()}function Ee(){Rt(),document.getElementById(ut)?.remove(),J=!1}return{FloatState:a,ensureDrawPanel:Tt,releaseDrawPanel:ae,destroyDrawPanels:Ee,setStateForMessage:G,setFloatingState:E,refreshDrawRunUiState:Ht,updateAutoModeUI:It,refreshPresetSelect:ye,updateButtonVisibility:Ce,initFloatingPanel:Te,destroyFloatingPanel:Rt,updateAllPresetSelects:at,updateAllSizeSelects:kt,updateAllMaxImagesInputs:Lt,createFloatingButton:ot,destroyFloatingButton:rt}}export{a as FloatState,ze as SIZE_OPTIONS,Xe as createProviderFloatingPanel};
