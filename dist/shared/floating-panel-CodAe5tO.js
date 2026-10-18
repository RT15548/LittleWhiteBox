import{n as v}from"./async-errors-C4kfchr9.js";import{Y as Q}from"./gallery-cache-oKOcW6Zr.js";import{B as N,R as Z,V as st,ct as Lt,n as tt,st as Rt,t as Nt,u as it,z as Dt}from"./message-toolbar-CAFq2U-J.js";import{Ct as lt,u as O,xt as f}from"./draw-common-DCxeLnYw.js";import{a as L,c as It,i as V,r as ct,s as dt,t as ut}from"./sd-draw-DOefsdne.js";import{a as At,i as Pt,n as pt,o as ot,r as rt,s as ft,t as gt}from"./draw-run-ui-state-CyejAntO.js";import{getContext as S}from"../../../../../extensions.js";var mt="xb_sd_float_pos",A=8e3,Ft="sd-webui",a={IDLE:"idle",SUBMITTING:"submitting",ACCEPTED:"accepted",UNCERTAIN:"uncertain",QUEUED:"queued",LLM:"llm",GEN:"gen",COOLDOWN:"cooldown",RECONNECTING:"reconnecting",CANCELLING:"cancelling",SUCCESS:"success",PARTIAL:"partial",ERROR:"error"},Ot=[{value:"default",label:"跟随预设",width:null,height:null},{value:"832x1216",label:"832 × 1216  竖图",width:832,height:1216},{value:"1216x832",label:"1216 × 832  横图",width:1216,height:832},{value:"1024x1024",label:"1024 × 1024  方图",width:1024,height:1024},{value:"768x1280",label:"768 x 1280  大竖",width:768,height:1280},{value:"1280x768",label:"1280 x 768  大横",width:1280,height:768}],d=new Map,F=new Map,E=null,i=null,m=null,g=a.IDLE,D=null,u={success:0,total:0,error:null,startTime:0},y=null,M=null,_=0,x={},X=!1,J=null,Mt=`
:root {
    --nd-h: 34px;
    --nd-bg: rgba(0, 0, 0, 0.55);
    --nd-bg-solid: rgba(24, 24, 28, 0.98);
    --nd-bg-hover: rgba(0, 0, 0, 0.7);
    --nd-border: rgba(255, 255, 255, 0.08);
    --nd-border-hover: rgba(255, 255, 255, 0.2);
    --nd-border-subtle: rgba(255, 255, 255, 0.08);
    --nd-text-primary: rgba(255, 255, 255, 0.85);
    --nd-text-secondary: rgba(255, 255, 255, 0.65);
    --nd-text-muted: rgba(255, 255, 255, 0.45);
    --nd-text-dim: rgba(255, 255, 255, 0.25);
    --nd-success: #3ecf8e;
    --nd-warning: #f0b429;
    --nd-error: #f87171;
    --nd-info: #60a5fa;
    --nd-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
    --nd-radius-sm: 6px;
}
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
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    position: relative;
    overflow: hidden;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.nd-float:hover .nd-capsule {
    background: var(--nd-bg-hover);
    border-color: var(--nd-border-hover);
}
.nd-float.working .nd-capsule { border-color: rgba(240, 180, 41, 0.5); }
.nd-float.cooldown .nd-capsule { border-color: rgba(96, 165, 250, 0.6); background: rgba(96, 165, 250, 0.1); }
.nd-float.success .nd-capsule { border-color: rgba(62, 207, 142, 0.6); background: rgba(62, 207, 142, 0.1); }
.nd-float.partial .nd-capsule { border-color: rgba(240, 180, 41, 0.6); background: rgba(240, 180, 41, 0.1); }
.nd-float.error .nd-capsule { border-color: rgba(248, 113, 113, 0.6); background: rgba(248, 113, 113, 0.1); }

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
.nd-btn-draw:hover { background: rgba(255, 255, 255, 0.12); }
.nd-btn-draw:active { transform: scale(0.92); }
.nd-auto-dot {
    position: absolute;
    top: 7px;
    right: 6px;
    width: 6px;
    height: 6px;
    background: var(--nd-success);
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(62, 207, 142, 0.6);
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
.nd-btn-menu:hover { background: rgba(255, 255, 255, 0.12); color: var(--nd-text-muted); }

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
    color: #fff;
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
    background: rgba(18, 18, 22, 0.98);
    border: 1px solid var(--nd-border);
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 12px;
    color: var(--nd-text-secondary);
    white-space: nowrap;
    box-shadow: var(--nd-shadow-lg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 100;
    transform: translateY(-6px) scale(0.96);
    transform-origin: top right;
}
.nd-float.show-detail .nd-detail {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
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
    width: 190px;
    background: rgba(18, 18, 22, 0.96);
    border: 1px solid var(--nd-border);
    border-radius: 12px;
    padding: 10px;
    box-shadow: var(--nd-shadow-lg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-6px) scale(0.96);
    transform-origin: top right;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 100;
}
.nd-float.expanded .nd-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
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
    background: rgba(255, 255, 255, 0.06);
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
.nd-select:hover { border-color: rgba(255, 255, 255, 0.2); }
.nd-select:focus { border-color: rgba(255, 255, 255, 0.3); }
.nd-select option { background: #1a1a1e; color: #eee; text-align: left; }
.nd-select.size { font-family: "SF Mono", "Menlo", "Consolas", monospace; font-size: 11px; }
.nd-inner-sep { display: none; }
.nd-controls { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.nd-auto {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--nd-border-subtle);
    border-radius: var(--nd-radius-sm);
    cursor: pointer;
    transition: all 0.15s;
}
.nd-auto:hover { background: rgba(255, 255, 255, 0.08); }
.nd-auto.on { background: rgba(62, 207, 142, 0.08); border-color: rgba(62, 207, 142, 0.3); }
.nd-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.2s;
}
.nd-auto.on .nd-dot { background: var(--nd-success); box-shadow: 0 0 8px rgba(62, 207, 142, 0.5); }
.nd-auto-text { font-size: 12px; color: var(--nd-text-muted); }
.nd-auto:hover .nd-auto-text { color: var(--nd-text-secondary); }
.nd-auto.on .nd-auto-text { color: rgba(62, 207, 142, 0.95); }
.nd-gear {
    width: 36px;
    height: 36px;
    border: 1px solid var(--nd-border-subtle);
    border-radius: var(--nd-radius-sm);
    background: rgba(255, 255, 255, 0.03);
    color: var(--nd-text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.15s;
}
.nd-gear:hover { background: rgba(255, 255, 255, 0.08); color: var(--nd-text-secondary); }
.nd-floating-global {
    position: fixed;
    z-index: 10000;
    user-select: none;
    will-change: transform;
}
.nd-floating-global .nd-capsule {
    background: var(--nd-bg-solid);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    touch-action: none;
    cursor: grab;
}
.nd-floating-global .nd-capsule:active { cursor: grabbing; }
.nd-floating-global .nd-detail {
    top: auto;
    bottom: calc(100% + 8px);
    right: 0;
    transform: translateY(6px) scale(0.96);
    transform-origin: bottom right;
}
.nd-floating-global.show-detail .nd-detail {
    transform: translateY(0) scale(1);
}
.nd-floating-global .nd-menu {
    top: auto;
    bottom: calc(100% + 8px);
    right: 0;
    transform: translateY(6px) scale(0.96);
    transform-origin: bottom right;
}
.nd-floating-global.expanded .nd-menu {
    transform: translateY(0) scale(1);
}
.nd-floating-global .nd-arrow { transform: rotate(180deg); }
.nd-floating-global.expanded .nd-arrow { transform: rotate(0deg); }
`;function et(){if(X)return;X=!0;const t=document.createElement("style");t.id="xiaobaix-sd-floating-style",t.textContent=Mt,document.head.appendChild(t)}function l(t,e,n){const o=document.createElement(t);return e&&(o.className=e),n!==void 0&&(o.textContent=n),o}function bt(t){const e=l("button","nd-btn-menu nd-btn-menu-persist");return e.title="展开菜单",e.appendChild(l("span","nd-arrow",t)),e}function z(t){if(!t)return;const e=L(),n=e.presets||[],o=e.selectedPresetId;t.replaceChildren(),n.forEach(r=>{const s=document.createElement("option");s.value=r.id,s.textContent=r.name||"未命名",r.id===o&&(s.selected=!0),t.appendChild(s)})}function U(t){if(!t)return;const e=L().overrideSize||"default";t.replaceChildren(),Ot.forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.label,n.value===e&&(o.selected=!0),t.appendChild(o)})}function zt(t){return{messageId:t,root:null,state:a.IDLE,result:{success:0,total:0,error:null,startTime:0},autoResetTimer:null,cooldownRafId:null,cooldownEndTime:0,cache:{},_cleanup:null}}function Ut(t){const e=L().mode==="auto",n=document.createElement("div");n.className=`nd-float${e?" auto-on":""}`,n.dataset.messageId=String(t);const o=l("div","nd-capsule"),r=l("div","nd-inner"),s=l("div","nd-layer nd-layer-idle"),c=l("button","nd-btn-draw");c.title="点击生成配图",c.append(l("span","","🎨"),l("span","nd-auto-dot"));const p=l("div","nd-sep"),b=l("button","nd-btn-menu");b.title="展开菜单",b.append(l("span","nd-arrow","▼")),s.append(c,p,b);const w=l("div","nd-layer nd-layer-active");w.append(l("span","nd-status-icon","⏳"),l("span","nd-status-text",f.analysis)),r.append(s,w),o.append(r,bt("▼"));const h=xt(),C=wt(e);return n.append(o,h,C),n}function xt(){const t=l("div","nd-detail"),e=l("div","nd-detail-row");e.append(l("span","nd-detail-icon","📊"),l("span","nd-detail-label","结果"),l("span","nd-detail-value nd-result","-"));const n=l("div","nd-detail-row nd-error-row");n.style.display="none",n.append(l("span","nd-detail-icon","💡"),l("span","nd-detail-label","原因"),l("span","nd-detail-value error nd-error","-"));const o=l("div","nd-detail-row");return o.append(l("span","nd-detail-icon","⏱"),l("span","nd-detail-label","耗时"),l("span","nd-detail-value nd-time","-")),t.append(e,n,o),t}function wt(t=!1){const e=l("div","nd-menu"),n=l("div","nd-card"),o=l("div","nd-row");o.appendChild(l("span","nd-label","预设"));const r=l("select","nd-select nd-preset-select");z(r),o.appendChild(r);const s=l("div","nd-inner-sep"),c=l("div","nd-row");c.appendChild(l("span","nd-label","尺寸"));const p=l("select","nd-select size nd-size-select");U(p),c.appendChild(p),n.append(o,s,c);const b=l("div","nd-controls"),w=l("div",`nd-auto${t?" on":""} nd-auto-toggle`);w.append(l("span","nd-dot"),l("span","nd-auto-text","自动配图"));const h=l("button","nd-gear nd-settings-btn","⚙");return h.title="打开设置",b.append(w,h),e.append(n,b),e}function qt(t){const e=t.root;e&&(t.cache={statusIcon:e.querySelector(".nd-status-icon"),statusText:e.querySelector(".nd-status-text"),result:e.querySelector(".nd-result"),errorRow:e.querySelector(".nd-error-row"),error:e.querySelector(".nd-error"),time:e.querySelector(".nd-time"),presetSelect:e.querySelector(".nd-preset-select"),sizeSelect:e.querySelector(".nd-size-select"),autoToggle:e.querySelector(".nd-auto-toggle")})}function q(t){t.cooldownRafId&&(cancelAnimationFrame(t.cooldownRafId),t.cooldownRafId=null),t.cooldownEndTime=0}async function I(t,e={}){const n=V(t);if(n){G(t,n.state,n.data);return}const o=Z(t),r=await Dt(t).catch(()=>null);if(!r||!N(o))return;t=S().chat.indexOf(o.message);const s=V(t);if(s){G(t,s.state,s.data);return}const c=S(),p=String(c?.chatId||""),b=c?.chat?.[Number(t)];if(!p||!b)return;const w=Number.isInteger(b.swipe_id)?b.swipe_id:0,h=Number.isSafeInteger(r.swipeIndex)?r.swipeIndex:w,C=r.provider||e?.provider||Ft,$=r.runId||e?.runId||"",T={chatId:p,messageId:t,swipeIndex:h,provider:C,runId:$},H=Pt({detail:e,pending:r.pending,...T}),B=At(H,r,T),j=d.get(t);if(j){const R=ot({currentState:j.state,pending:r.pending,detail:B,...T});(R!==j.state||R===a.ACCEPTED&&rt(H))&&P(t,R,B)}if(i&&Number(t)===O()){const R=ot({currentState:g,pending:r.pending,detail:B,...T});r.pending&&(D=Number(t)),(R!==g||R===a.ACCEPTED&&rt(H))&&k(R,B)}}function $t(t={}){const e=Rt(t,S());if(!e)return;const n=O();(d.has(e.messageId)||i&&e.messageId===n)&&v(I(e.messageId,t),{source:import.meta.url,operation:"syncDrawRunActivity"})}function Ce(){const t=O();if(i){const e=t>=0?V(t):null;e?(D=t,k(e.state,e.data)):k(a.IDLE)}t>=0&&v(I(t),{source:import.meta.url,operation:"refreshDrawRunUiState"})}function vt({cooldownUntil:t,duration:e}={}){const n=Number(t);return Number.isFinite(n)&&n>0?n:Date.now()+Math.max(0,Number(e)||0)}function Bt(t,e){q(t),t.cooldownEndTime=vt(e);function n(){if(!t.cooldownEndTime)return;const o=Math.max(0,t.cooldownEndTime-Date.now()),r=t.cache?.statusText;if(r&&(r.textContent=`${(o/1e3).toFixed(1)}s`,r.className="nd-status-text nd-countdown"),o<=0){q(t);return}t.cooldownRafId=requestAnimationFrame(n)}t.cooldownRafId=requestAnimationFrame(n)}function P(t,e,n={}){const o=d.get(t);if(!o?.root)return;const r=o.root;o.state=e,o.autoResetTimer&&(clearTimeout(o.autoResetTimer),o.autoResetTimer=null),e!==a.COOLDOWN&&q(o),r.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:s,statusText:c}=o.cache;switch(c&&(c.className="nd-status-text"),e){case a.IDLE:o.result={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.textContent="↥",s.className="nd-status-icon nd-spin"),c&&(c.textContent=f.submitting);break;case a.ACCEPTED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.textContent=pt(n),s.className="nd-status-icon nd-spin"),c&&(c.textContent=gt(n));break;case a.UNCERTAIN:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.textContent="↻",s.className="nd-status-icon nd-spin"),c&&(c.textContent=f.uncertain);break;case a.QUEUED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.textContent="⌛",s.className="nd-status-icon"),c&&(c.textContent=f.queued),o.result.total=n.total||o.result.total||0;break;case a.LLM:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.textContent="⏳",s.className="nd-status-icon nd-spin"),c&&(c.textContent=lt(n));break;case a.GEN:r.classList.add("working"),s&&(s.textContent="🎨",s.className="nd-status-icon nd-spin"),c&&(c.textContent=`${n.current||0}/${n.total||0}`),o.result.total=n.total||0;break;case a.COOLDOWN:r.classList.add("cooldown"),s&&(s.textContent="⏳",s.className="nd-status-icon nd-spin"),Bt(o,n);break;case a.RECONNECTING:r.classList.add("working"),s&&(s.textContent="↻",s.className="nd-status-icon nd-spin"),c&&(c.textContent=f.reconnecting);break;case a.CANCELLING:r.classList.add("working"),s&&(s.textContent="⏳",s.className="nd-status-icon nd-spin"),c&&(c.textContent=f.cancelling);break;case a.SUCCESS:r.classList.add("success"),s&&(s.textContent="✓",s.className="nd-status-icon"),c&&(c.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>P(t,a.IDLE),A);break;case a.PARTIAL:r.classList.add("partial"),s&&(s.textContent="⚠",s.className="nd-status-icon"),c&&(c.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>P(t,a.IDLE),A);break;case a.ERROR:r.classList.add("error"),s&&(s.textContent="✗",s.className="nd-status-icon"),c&&(c.textContent=n.unknown?f.unknown:f.error),o.result.error=n.error,o.autoResetTimer=setTimeout(()=>P(t,a.IDLE),A);break}}function _t(t){const e=d.get(t);if(!e?.root)return;const{result:n,errorRow:o,error:r,time:s}=e.cache,{result:c,state:p}=e,b=c.startTime?((Date.now()-c.startTime)/1e3).toFixed(1):"-";p===a.SUCCESS||p===a.PARTIAL?(n&&(n.textContent=`${c.success}/${c.total} 成功`,n.className=`nd-detail-value ${p===a.SUCCESS?"success":"warning"}`),o&&(o.style.display=p===a.PARTIAL?"flex":"none"),r&&p===a.PARTIAL&&(r.textContent=`${c.total-c.success} 张失败`)):p===a.ERROR&&(n&&(n.textContent=c.error?.label||Q.redrawFailed,n.className="nd-detail-value error"),o&&(o.style.display="flex"),r&&(r.textContent=c.error?.desc||"未知错误")),s&&(s.textContent=`${b}s`)}async function Gt(t){const e=d.get(t);if(!e||e.state!==a.IDLE)return;const n=Yt(e)??t;n!==t&&(console.warn("[SdDraw] 楼层面板 messageId 与 DOM 不一致，已按 DOM 楼层生成:",{state:t,dom:n}),d.delete(t),e.messageId=n,e.root.dataset.messageId=String(n),d.set(n,e));try{await ct({messageId:n,onStateChange:(o,r,s)=>{G(s,o,r)}})}catch(o){if(o.drawTaskReported)return;o instanceof it||st(o)?toastr?.info?.(o.message):(console.error(o),toastr?.error?.(o.message))}}function Yt(t){const e=t?.root?.closest?.(".mes")?.getAttribute?.("mesid"),n=Number(e);return Number.isFinite(n)?n:null}async function Wt(t){const e=Z(t);try{await ft({cancel:()=>ut(t,{target:e}),isCurrent:()=>N(e),getState:()=>d.get(S().chat.indexOf(e.message))?.state,setState:n=>P(S().chat.indexOf(e.message),n)})&&N(e)&&toastr?.info?.("正在中止"),N(e)&&await I(S().chat.indexOf(e.message))}catch(n){console.error("[SdDraw] 中止失败:",n),toastr?.error?.(Q.cancelFailed)}}function Qt(t){const{messageId:e,root:n}=t;n.querySelector(".nd-btn-draw")?.addEventListener("click",r=>{r.stopPropagation(),v(Gt(e),{source:import.meta.url,operation:"callback"})}),n.querySelectorAll(".nd-btn-menu").forEach(r=>r.addEventListener("click",s=>{s.stopPropagation(),n.classList.remove("show-detail"),n.classList.contains("expanded")||(Ht(e),jt(e)),n.classList.toggle("expanded")})),n.querySelector(".nd-layer-active")?.addEventListener("click",r=>{r.stopPropagation(),[a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING].includes(t.state)?v(Wt(e),{source:import.meta.url,operation:"callback"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(t.state)&&(_t(e),n.classList.toggle("show-detail"))}),t.cache.presetSelect?.addEventListener("change",async r=>{await ht(r.target.value)}),t.cache.sizeSelect?.addEventListener("change",async r=>{await Ct(r.target.value)}),t.cache.autoToggle?.addEventListener("click",async()=>{await yt()}),n.querySelector(".nd-settings-btn")?.addEventListener("click",r=>{r.stopPropagation(),n.classList.remove("expanded"),v(dt(),{source:import.meta.url,operation:"callback"})});const o=r=>{n.contains(r.target)||n.classList.remove("expanded","show-detail")};document.addEventListener("click",o,{passive:!0}),t._cleanup=()=>{document.removeEventListener("click",o)}}function Ht(t){z(d.get(t)?.cache?.presetSelect)}function jt(t){U(d.get(t)?.cache?.sizeSelect)}async function nt(t,e){const n=await It(t);return n&&typeof e=="function"&&e(),n}async function ht(t){return nt(e=>{e.selectedPresetId=t},kt)}async function Ct(t){return nt(e=>{e.overrideSize=t},ue)}async function yt(){const t=L().mode==="auto"?"manual":"auto";return nt(e=>{e.mode=t},pe)}function K(t,e){if(d.has(e)){const r=d.get(e);if(r.root?.isConnected)return v(I(e),{source:import.meta.url,operation:"mountFloorPanel"}),r;r._cleanup?.(),d.delete(e)}et();const n=zt(e),o=Ut(e);return n.root=o,Nt(e,o,{position:"right",id:`sd-draw-${e}`})?(qt(n),Qt(n),d.set(e,n),v(I(e),{source:import.meta.url,operation:"mountFloorPanel"}),n):null}function Vt(){E||(E=new IntersectionObserver(t=>{const e=[];for(const n of t){if(!n.isIntersecting)continue;const o=n.target,r=Number(o.getAttribute("mesid"));F.has(r)&&(e.push({el:o,mid:r}),F.delete(r),E.unobserve(o))}e.length>0&&requestAnimationFrame(()=>{e.forEach(({el:n,mid:o})=>K(n,o))})},{rootMargin:"300px"}))}function Xt(t,e,n={}){if(L().showFloorButton===!1)return null;const{force:o=!1}=n;if(et(),d.has(e)){const s=d.get(e);if(s.root?.isConnected)return s;s._cleanup?.(),d.delete(e)}if(o)return K(t,e);const r=t.getBoundingClientRect();return r.top<window.innerHeight+500&&r.bottom>-500?K(t,e):(Vt(),F.set(e,!0),E.observe(t),null)}function ye(t,e){E?.unobserve(t),F.delete(e);const n=d.get(e);!n||!t.contains(n.root)||(n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),tt(e,n.root),d.delete(e))}function G(t,e,n={}){let o=d.get(t);if(!o?.root?.isConnected){const r=document.querySelector(`.mes[mesid="${t}"]`);r&&(o=Xt(r,t,{force:!0}))}o&&P(t,e,n),i&&t===O()&&(D=t,k(e,n))}function Jt(){try{const e=localStorage.getItem(mt);if(e)return JSON.parse(e)}catch(e){console.warn({source:import.meta.url,operation:"getFloatingPosition"},e)}const t=document.getElementById("xiaobaix-debug-mini");if(t){const e=t.getBoundingClientRect();return{left:e.left,top:e.bottom+8}}return{left:window.innerWidth-110,top:window.innerHeight-80}}function Kt(){if(!i)return;const t=i.getBoundingClientRect();try{localStorage.setItem(mt,JSON.stringify({left:Math.round(t.left),top:Math.round(t.top)}))}catch(e){console.warn({source:import.meta.url,operation:"saveFloatingPosition"},e)}}var Zt=77,te=101;function Y(){if(!i)return;const t=Jt(),e=g===a.IDLE?Zt:te,n=i.offsetHeight||34;i.style.left=`${Math.max(0,Math.min(t.left,window.innerWidth-e))}px`,i.style.top=`${Math.max(0,Math.min(t.top,window.innerHeight-n))}px`}function W(){M&&(cancelAnimationFrame(M),M=null),_=0}function ee(t){W(),_=vt(t);function e(){if(!_)return;const n=Math.max(0,_-Date.now()),o=x.statusText;if(o&&(o.textContent=`${(n/1e3).toFixed(1)}s`,o.className="nd-status-text nd-countdown"),n<=0){W();return}M=requestAnimationFrame(e)}M=requestAnimationFrame(e)}function k(t,e={}){if(!i)return;const n=g===a.IDLE;g=t,n!==(t===a.IDLE)&&Y(),y&&(clearTimeout(y),y=null),t!==a.COOLDOWN&&W(),i.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:o,statusText:r}=x;if(!(!o||!r))switch(r.className="nd-status-text",t){case a.IDLE:D=null,u={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:i.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="↥",o.className="nd-status-icon nd-spin",r.textContent=f.submitting;break;case a.ACCEPTED:i.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent=pt(e),o.className="nd-status-icon nd-spin",r.textContent=gt(e);break;case a.UNCERTAIN:i.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=f.uncertain;break;case a.QUEUED:i.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="⌛",o.className="nd-status-icon",r.textContent=f.queued;break;case a.LLM:i.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=lt(e);break;case a.GEN:i.classList.add("working"),o.textContent="🎨",o.className="nd-status-icon nd-spin",r.textContent=`${e.current||0}/${e.total||0}`,u.total=e.total||0;break;case a.COOLDOWN:i.classList.add("cooldown"),o.textContent="⏳",o.className="nd-status-icon nd-spin",ee(e);break;case a.RECONNECTING:i.classList.add("working"),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=f.reconnecting;break;case a.CANCELLING:i.classList.add("working"),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=f.cancelling;break;case a.SUCCESS:i.classList.add("success"),o.textContent="✓",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,u.success=e.success,u.total=e.total,y=setTimeout(()=>k(a.IDLE),A);break;case a.PARTIAL:i.classList.add("partial"),o.textContent="⚠",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,u.success=e.success,u.total=e.total,y=setTimeout(()=>k(a.IDLE),A);break;case a.ERROR:i.classList.add("error"),o.textContent="✗",o.className="nd-status-icon",r.textContent=e.unknown?f.unknown:f.error,u.error=e.error,y=setTimeout(()=>k(a.IDLE),A);break}}function ne(){const{detailResult:t,detailErrorRow:e,detailError:n,detailTime:o}=x;if(!t)return;const r=u.startTime?((Date.now()-u.startTime)/1e3).toFixed(1):"-";g===a.SUCCESS||g===a.PARTIAL?(t.textContent=`${u.success}/${u.total} 成功`,t.className=`nd-detail-value ${g===a.SUCCESS?"success":"warning"}`,e.style.display=g===a.PARTIAL?"flex":"none",g===a.PARTIAL&&(n.textContent=`${u.total-u.success} 张失败`)):g===a.ERROR&&(t.textContent=u.error?.label||Q.redrawFailed,t.className="nd-detail-value error",e.style.display="flex",n.textContent=u.error?.desc||"未知错误"),o.textContent=`${r}s`}function oe(t){if(!(t.button!==0||!i)){m={startX:t.clientX,startY:t.clientY,startLeft:i.getBoundingClientRect().left,startTop:i.getBoundingClientRect().top,pointerId:t.pointerId,moved:!1,originalTarget:t.target};try{t.currentTarget.setPointerCapture(t.pointerId)}catch(e){console.warn({source:import.meta.url,operation:"onFloatingPointerDown"},e)}t.preventDefault()}}function re(t){if(!m||m.pointerId!==t.pointerId||!i)return;const e=t.clientX-m.startX,n=t.clientY-m.startY;if(!m.moved&&(Math.abs(e)>3||Math.abs(n)>3)&&(m.moved=!0),m.moved){const o=i.offsetWidth||88,r=i.offsetHeight||36;i.style.left=`${Math.max(0,Math.min(m.startLeft+e,window.innerWidth-o))}px`,i.style.top=`${Math.max(0,Math.min(m.startTop+n,window.innerHeight-r))}px`}t.preventDefault()}function at(t){if(!m||m.pointerId!==t.pointerId)return;const{moved:e,originalTarget:n}=m;try{t.currentTarget.releasePointerCapture(t.pointerId)}catch(o){console.warn({source:import.meta.url,operation:"onFloatingPointerUp"},o)}m=null,e?Kt():ae(n)}function ae(t){t.closest(".nd-btn-draw")?v(se(),{source:import.meta.url,operation:"routeFloatingClick"}):t.closest(".nd-btn-menu")?(i.classList.remove("show-detail"),i.classList.contains("expanded")||(le(),ce()),i.classList.toggle("expanded")):t.closest(".nd-layer-active")&&([a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING].includes(g)?v(ie(),{source:import.meta.url,operation:"routeFloatingClick"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(g)&&(ne(),i.classList.toggle("show-detail")))}async function se(){if(g!==a.IDLE)return;const t=O();if(t<0){toastr?.warning?.("没有可配图的AI消息");return}D=t;try{await ct({messageId:t,onStateChange:(e,n,o)=>{G(o,e,n)}})}catch(e){if(e.drawTaskReported)return;e instanceof it||st(e)?toastr?.info?.(e.message):(console.error(e),toastr?.error?.(e.message))}}async function ie(){const t=D,e=Z(t);try{t>=0&&await ft({cancel:()=>ut(t,{target:e}),isCurrent:()=>N(e)&&D===S().chat.indexOf(e.message),getState:()=>g,setState:k})&&N(e)&&toastr?.info?.("正在中止"),t>=0&&N(e)&&await I(S().chat.indexOf(e.message))}catch(n){console.error("[SdDraw] 中止失败:",n),toastr?.error?.(Q.cancelFailed)}}function le(){z(x.presetSelect)}function ce(){U(x.sizeSelect)}function de(){i&&(x={capsule:i.querySelector(".nd-capsule"),statusIcon:i.querySelector(".nd-status-icon"),statusText:i.querySelector(".nd-status-text"),detailResult:i.querySelector(".nd-result"),detailErrorRow:i.querySelector(".nd-error-row"),detailError:i.querySelector(".nd-error"),detailTime:i.querySelector(".nd-time"),presetSelect:i.querySelector(".nd-preset-select"),sizeSelect:i.querySelector(".nd-size-select"),autoToggle:i.querySelector(".nd-auto-toggle")})}function Et(t){i&&!i.contains(t.target)&&i.classList.remove("expanded","show-detail")}function Tt(){if(i)return;const t=L();if(t.showFloatingButton===!1)return;et();const e=t.mode==="auto";i=document.createElement("div"),i.className=`nd-float nd-floating-global${e?" auto-on":""}`,i.id="nd-floating-global";const n=xt(),o=wt(e),r=l("div","nd-capsule"),s=l("div","nd-inner"),c=l("div","nd-layer nd-layer-idle"),p=l("button","nd-btn-draw");p.title="点击为最后一条AI消息生成配图",p.append(l("span","","🎨"),l("span","nd-auto-dot"));const b=l("div","nd-sep"),w=l("button","nd-btn-menu");w.title="展开菜单",w.append(l("span","nd-arrow","▲")),c.append(p,b,w);const h=l("div","nd-layer nd-layer-active");h.append(l("span","nd-status-icon","⏳"),l("span","nd-status-text",f.analysis)),s.append(c,h),r.append(s,bt("▲")),i.append(n,o,r),document.body.appendChild(i),de(),Y();const C=x.capsule;C&&(C.addEventListener("pointerdown",oe,{passive:!1}),C.addEventListener("pointermove",re,{passive:!1}),C.addEventListener("pointerup",at,{passive:!1}),C.addEventListener("pointercancel",at,{passive:!1})),x.presetSelect?.addEventListener("change",async T=>{await ht(T.target.value)}),x.sizeSelect?.addEventListener("change",async T=>{await Ct(T.target.value)}),x.autoToggle?.addEventListener("click",async()=>{await yt()}),i.querySelector(".nd-settings-btn")?.addEventListener("click",()=>{i.classList.remove("expanded"),v(dt(),{source:import.meta.url,operation:"callback"})}),document.addEventListener("click",Et,{passive:!0}),window.addEventListener("resize",Y);const $=O();$>=0&&v(I($),{source:import.meta.url,operation:"createFloatingButton"})}function St(){W(),y&&(clearTimeout(y),y=null),window.removeEventListener("resize",Y),document.removeEventListener("click",Et),i?.remove(),i=null,m=null,g=a.IDLE,x={}}function kt(){d.forEach(t=>z(t.cache?.presetSelect)),z(x.presetSelect)}function ue(){d.forEach(t=>U(t.cache?.sizeSelect)),U(x.sizeSelect)}function pe(){const t=L().mode==="auto";d.forEach(e=>{e.root&&(e.root.classList.toggle("auto-on",t),e.cache.autoToggle?.classList.toggle("on",t))}),i&&(i.classList.toggle("auto-on",t),x.autoToggle?.classList.toggle("on",t))}function Ee(){kt()}function Te(t,e){e&&!i?Tt():!e&&i&&St(),t||(d.forEach((n,o)=>{n.autoResetTimer&&clearTimeout(n.autoResetTimer),q(n),n._cleanup?.(),n.root&&tt(o,n.root)}),d.clear(),F.clear(),E?.disconnect(),E=null)}function Se(){J??=Lt($t),L().showFloatingButton!==!1&&Tt()}function fe(){J?.(),J=null,d.forEach((t,e)=>{t.autoResetTimer&&clearTimeout(t.autoResetTimer),q(t),t._cleanup?.(),t.root&&tt(e,t.root)}),d.clear(),F.clear(),E?.disconnect(),E=null,St()}function ke(){fe(),document.getElementById("xiaobaix-sd-floating-style")?.remove(),X=!1}export{a as FloatState,Ot as SIZE_OPTIONS,Tt as createFloatingButton,St as destroyFloatingButton,fe as destroyFloatingPanel,ke as destroySdDrawPanels,Xt as ensureSdDrawPanel,Se as initFloatingPanel,Ce as refreshDrawRunUiState,Ee as refreshPresetSelect,ye as releaseSdDrawPanel,k as setFloatingState,G as setStateForMessage,kt as updateAllPresetSelects,ue as updateAllSizeSelects,pe as updateAutoModeUI,Te as updateButtonVisibility};
