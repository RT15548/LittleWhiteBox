import{n as v}from"./async-errors-C4kfchr9.js";import{Y as Z}from"./gallery-cache-PsTKGcL7.js";import{B as F,R as rt,V as ft,ct as Dt,n as at,st as Pt,t as Ft,u as gt,z as Ot}from"./message-toolbar-gHlwzVQ9.js";import{Ct as mt,xt as p}from"./draw-common-Bp7s5CLL.js";import{a as bt,i as Y,l as xt,o as et,s as D,t as wt,u as zt}from"./novel-draw-B_0sK4Xg.js";import{a as $t,i as Mt,n as vt,o as dt,r as ct,s as ht,t as Ct}from"./draw-run-ui-state-C0cPIQgV.js";import{getContext as I}from"../../../../../extensions.js";var yt="xb_novel_float_pos",U=8e3,Ut="novelai",a={IDLE:"idle",SUBMITTING:"submitting",ACCEPTED:"accepted",UNCERTAIN:"uncertain",QUEUED:"queued",LLM:"llm",GEN:"gen",COOLDOWN:"cooldown",RECONNECTING:"reconnecting",CANCELLING:"cancelling",BACKEND_LEGACY:"backend_legacy",SUCCESS:"success",PARTIAL:"partial",ERROR:"error"},Bt=[{value:"default",label:"跟随预设",width:null,height:null},{value:"832x1216",label:"832 × 1216  竖图",width:832,height:1216},{value:"1216x832",label:"1216 × 832  横图",width:1216,height:832},{value:"1024x1024",label:"1024 × 1024  方图",width:1024,height:1024},{value:"768x1280",label:"768 x 1280  大竖",width:768,height:1280},{value:"1280x768",label:"1280 x 768  大横",width:1280,height:768}],u=new Map,q=new Map,S=null,l=null,g=null,f=a.IDLE,O=null,c={success:0,total:0,error:null,startTime:0},T=null,Q=null,K=0,b={},ut=!1,nt=null,qt=`
:root {
    --nd-h: 34px;
    --nd-bg: rgba(0, 0, 0, 0.55);
    --nd-bg-solid: rgba(24, 24, 28, 0.98);
    --nd-bg-hover: rgba(0, 0, 0, 0.7);
    --nd-bg-active: rgba(255, 255, 255, 0.1);
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
    --nd-radius-md: 10px;
    --nd-radius-lg: 14px;
}

/* ═══════════════════════════════════════════════════════════════════════════
   楼层按钮样式
   ═══════════════════════════════════════════════════════════════════════════ */
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

/* 详情弹窗 - 向下展开（楼层按钮用） */
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

/* 菜单 - 向下展开（楼层按钮用） */
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

.nd-card {
    background: transparent;
    border: none;
    border-radius: 0;
    overflow: visible;
}

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
    padding: 0;
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
    margin: 0;
    box-sizing: border-box;
    outline: none;
    cursor: pointer;
    text-align: center;
    text-align-last: center;
    transition: border-color 0.2s;
    vertical-align: middle;
    -webkit-appearance: none;
    -moz-appearance: none;
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

/* ═══════════════════════════════════════════════════════════════════════════
   悬浮按钮样式（固定定位，可拖拽）
   ═══════════════════════════════════════════════════════════════════════════ */
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

/* 悬浮按钮的详情和菜单向上展开 */
.nd-floating-global .nd-detail {
    top: auto;
    bottom: calc(100% + 10px);
    transform: translateY(4px) scale(0.96);
    transform-origin: bottom right;
}

.nd-floating-global.show-detail .nd-detail {
    transform: translateY(0) scale(1);
}

.nd-floating-global .nd-detail::after {
    content: '';
    position: absolute;
    top: auto;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: rgba(18, 18, 22, 0.98);
    border-bottom-color: transparent;
}

.nd-floating-global .nd-menu {
    top: auto;
    bottom: calc(100% + 10px);
    transform: translateY(6px) scale(0.98);
    transform-origin: bottom right;
}

.nd-floating-global.expanded .nd-menu {
    transform: translateY(0) scale(1);
}

/* 悬浮按钮箭头向上 */
.nd-floating-global .nd-arrow { transform: rotate(180deg); }
.nd-floating-global.expanded .nd-arrow { transform: rotate(0deg); }
`;function it(){if(ut)return;ut=!0;const t=document.createElement("style");t.id="nd-float-styles",t.textContent=qt,document.head.appendChild(t)}function i(t,e,n){const o=document.createElement(t);return e&&(o.className=e),n!==void 0&&(o.textContent=n),o}function Et(t){const e=i("button","nd-btn-menu nd-btn-menu-persist");return e.title="展开菜单",e.appendChild(i("span","nd-arrow",t)),e}function _(t){if(!t)return;const e=D(),n=e.paramsPresets||[],o=e.selectedParamsPresetId;t.replaceChildren(),n.forEach(r=>{const s=document.createElement("option");s.value=r.id,s.textContent=r.name||"未命名",r.id===o&&(s.selected=!0),t.appendChild(s)})}function G(t){if(!t)return;const e=D().overrideSize||"default";t.replaceChildren(),Bt.forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.label,n.value===e&&(o.selected=!0),t.appendChild(o)})}function _t(t){return{messageId:t,root:null,state:a.IDLE,result:{success:0,total:0,error:null,startTime:0},autoResetTimer:null,cooldownRafId:null,cooldownEndTime:0,$cache:{},_cleanup:null}}function Gt(t){const e=D().mode==="auto",n=document.createElement("div");n.className=`nd-float${e?" auto-on":""}`,n.dataset.messageId=t;const o=i("div","nd-capsule"),r=i("div","nd-inner"),s=i("div","nd-layer nd-layer-idle"),d=i("button","nd-btn-draw");d.title="点击生成配图",d.appendChild(i("span","","🎨")),d.appendChild(i("span","nd-auto-dot"));const m=i("div","nd-sep"),x=i("button","nd-btn-menu");x.title="展开菜单",x.appendChild(i("span","nd-arrow","▼")),s.append(d,m,x);const P=i("div","nd-layer nd-layer-active");P.append(i("span","nd-status-icon","⏳"),i("span","nd-status-text",p.analysis)),r.append(s,P),o.append(r,Et("▼"));const $=i("div","nd-detail"),k=i("div","nd-detail-row");k.append(i("span","nd-detail-icon","📊"),i("span","nd-detail-label","结果"),i("span","nd-detail-value nd-result","-"));const L=i("div","nd-detail-row nd-error-row");L.style.display="none",L.append(i("span","nd-detail-icon","💡"),i("span","nd-detail-label","原因"),i("span","nd-detail-value error nd-error","-"));const h=i("div","nd-detail-row");h.append(i("span","nd-detail-icon","⏱"),i("span","nd-detail-label","耗时"),i("span","nd-detail-value nd-time","-")),$.append(k,L,h);const E=i("div","nd-menu"),C=i("div","nd-card"),y=i("div","nd-row");y.appendChild(i("span","nd-label","预设"));const w=i("select","nd-select nd-preset-select");_(w),y.appendChild(w);const H=i("div","nd-inner-sep"),R=i("div","nd-row");R.appendChild(i("span","nd-label","尺寸"));const j=i("select","nd-select size nd-size-select");G(j),R.appendChild(j),C.append(y,H,R);const M=i("div","nd-controls"),W=i("div",`nd-auto${e?" on":""} nd-auto-toggle`);W.append(i("span","nd-dot"),i("span","nd-auto-text","自动配图"));const N=i("button","nd-gear nd-settings-btn","⚙");return N.title="打开设置",M.append(W,N),E.append(C,M),n.append(o,$,E),n}function Yt(t){const e=t.root;e&&(t.$cache={statusIcon:e.querySelector(".nd-status-icon"),statusText:e.querySelector(".nd-status-text"),result:e.querySelector(".nd-result"),errorRow:e.querySelector(".nd-error-row"),error:e.querySelector(".nd-error"),time:e.querySelector(".nd-time"),presetSelect:e.querySelector(".nd-preset-select"),sizeSelect:e.querySelector(".nd-size-select"),autoToggle:e.querySelector(".nd-auto-toggle")})}function B(t,e,n={}){const o=u.get(t);if(!o?.root)return;const r=o.root;o.state=e,o.autoResetTimer&&(clearTimeout(o.autoResetTimer),o.autoResetTimer=null),e!==a.COOLDOWN&&o.cooldownRafId&&(cancelAnimationFrame(o.cooldownRafId),o.cooldownRafId=null,o.cooldownEndTime=0),r.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:s,statusText:d}=o.$cache;switch(d&&(d.className="nd-status-text"),e){case a.IDLE:o.result={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.textContent="↥",s.className="nd-status-icon nd-spin"),d&&(d.textContent=p.submitting);break;case a.ACCEPTED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.textContent=vt(n),s.className="nd-status-icon nd-spin"),d&&(d.textContent=Ct(n));break;case a.UNCERTAIN:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.textContent="↻",s.className="nd-status-icon nd-spin"),d&&(d.textContent=p.uncertain);break;case a.QUEUED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.textContent="⌛",s.className="nd-status-icon"),d&&(d.textContent=p.queued),o.result.total=n.total||o.result.total||0;break;case a.LLM:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.textContent="⏳",s.className="nd-status-icon nd-spin"),d&&(d.textContent=mt(n));break;case a.GEN:r.classList.add("working"),s&&(s.textContent="🎨",s.className="nd-status-icon nd-spin"),d&&(d.textContent=`${n.current||0}/${n.total||0}`),o.result.total=n.total||0;break;case a.COOLDOWN:r.classList.add("cooldown"),s&&(s.textContent="⏳",s.className="nd-status-icon nd-spin"),Qt(o,n);break;case a.RECONNECTING:r.classList.add("working"),s&&(s.textContent="↻",s.className="nd-status-icon nd-spin"),d&&(d.textContent=p.reconnecting);break;case a.CANCELLING:r.classList.add("working"),s&&(s.textContent="⏳",s.className="nd-status-icon nd-spin"),d&&(d.textContent=p.cancelling);break;case a.BACKEND_LEGACY:r.classList.add("working"),s&&(s.textContent="↪",s.className="nd-status-icon"),d&&(d.textContent=p.legacy);break;case a.SUCCESS:r.classList.add("success"),s&&(s.textContent="✓",s.className="nd-status-icon"),d&&(d.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>B(t,a.IDLE),U);break;case a.PARTIAL:r.classList.add("partial"),s&&(s.textContent="⚠",s.className="nd-status-icon"),d&&(d.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>B(t,a.IDLE),U);break;case a.ERROR:r.classList.add("error"),s&&(s.textContent="✗",s.className="nd-status-icon"),d&&(d.textContent=n.unknown?p.unknown:p.error),o.result.error=n.error,o.autoResetTimer=setTimeout(()=>B(t,a.IDLE),U);break}}async function z(t,e={}){const n=et(t);if(n){X(t,n.state,n.data);return}const o=rt(t),r=await Ot(t).catch(()=>null);if(!r||!F(o))return;t=I().chat.indexOf(o.message);const s=et(t);if(s){X(t,s.state,s.data);return}const d=I(),m=String(d?.chatId||""),x=d?.chat?.[Number(t)];if(!m||!x)return;const P=Number.isInteger(x.swipe_id)?x.swipe_id:0,$=Number.isSafeInteger(r.swipeIndex)?r.swipeIndex:P,k=r.provider||e?.provider||Ut,L=r.runId||e?.runId||"",h={chatId:m,messageId:t,swipeIndex:$,provider:k,runId:L},E=Mt({detail:e,pending:r.pending,...h}),C=$t(E,r,h),y=u.get(t);if(y){const w=dt({currentState:y.state,pending:r.pending,detail:C,...h});(w!==y.state||w===a.ACCEPTED&&ct(E))&&B(t,w,C)}if(l&&Number(t)===Y()){const w=dt({currentState:f,pending:r.pending,detail:C,...h});r.pending&&(O=Number(t)),(w!==f||w===a.ACCEPTED&&ct(E))&&A(w,C)}}function Wt(t={}){const e=Pt(t,I());if(!e)return;const n=Y();(u.has(e.messageId)||l&&e.messageId===n)&&v(z(e.messageId,t),{source:import.meta.url,operation:"syncDrawRunActivity"})}function Te(){const t=Y();if(l){const e=t>=0?et(t):null;e?(O=t,A(e.state,e.data)):A(a.IDLE)}t>=0&&v(z(t),{source:import.meta.url,operation:"refreshDrawRunUiState"})}function Tt({cooldownUntil:t,duration:e}={}){const n=Number(t);return Number.isFinite(n)&&n>0?n:Date.now()+Math.max(0,Number(e)||0)}function Qt(t,e){t.cooldownRafId&&cancelAnimationFrame(t.cooldownRafId),t.cooldownEndTime=Tt(e);function n(){if(!t.cooldownEndTime)return;const o=Math.max(0,t.cooldownEndTime-Date.now()),r=t.$cache?.statusText;if(r&&(r.textContent=`${(o/1e3).toFixed(1)}s`,r.className="nd-status-text nd-countdown"),o<=0){t.cooldownRafId=null,t.cooldownEndTime=0;return}t.cooldownRafId=requestAnimationFrame(n)}t.cooldownRafId=requestAnimationFrame(n)}function Ht(t){const e=u.get(t);if(!e?.root)return;const{result:n,errorRow:o,error:r,time:s}=e.$cache,{result:d,state:m}=e,x=d.startTime?((Date.now()-d.startTime)/1e3).toFixed(1):"-";m===a.SUCCESS||m===a.PARTIAL?(n&&(n.textContent=`${d.success}/${d.total} 成功`,n.className=`nd-detail-value ${m===a.SUCCESS?"success":"warning"}`),o&&(o.style.display=m===a.PARTIAL?"flex":"none"),r&&m===a.PARTIAL&&(r.textContent=`${d.total-d.success} 张失败`)):m===a.ERROR&&(n&&(n.textContent=d.error?.label||Z.redrawFailed,n.className="nd-detail-value error"),o&&(o.style.display="flex"),r&&(r.textContent=d.error?.desc||"未知错误")),s&&(s.textContent=`${x}s`)}async function jt(t){const e=u.get(t);if(!(!e||e.state!==a.IDLE))try{await bt({messageId:t,onStateChange:(n,o,r)=>{X(r,n,o)}})}catch(n){if(n.drawTaskReported)return;n instanceof gt||ft(n)?toastr?.info?.(n.message):(console.error(n),toastr?.error?.(n.message))}}async function Kt(t){const e=rt(t);try{await ht({cancel:()=>wt(t,{target:e}),isCurrent:()=>F(e),getState:()=>u.get(I().chat.indexOf(e.message))?.state,setState:n=>B(I().chat.indexOf(e.message),n)})&&F(e)&&toastr?.info?.("正在中止"),F(e)&&await z(I().chat.indexOf(e.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(Z.cancelFailed)}}function Xt(t){const{messageId:e,root:n}=t;n.querySelector(".nd-btn-draw")?.addEventListener("click",r=>{r.stopPropagation(),v(jt(e),{source:import.meta.url,operation:"callback"})}),n.querySelectorAll(".nd-btn-menu").forEach(r=>r.addEventListener("click",s=>{s.stopPropagation(),n.classList.remove("show-detail"),n.classList.contains("expanded")||(Vt(e),Jt(e)),n.classList.toggle("expanded")})),n.querySelector(".nd-layer-active")?.addEventListener("click",r=>{r.stopPropagation();const s=t.state;[a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING,a.BACKEND_LEGACY].includes(s)?v(Kt(e),{source:import.meta.url,operation:"callback"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(s)&&(Ht(e),n.classList.toggle("show-detail"))}),t.$cache.presetSelect?.addEventListener("change",async r=>{await St(r.target.value)}),t.$cache.sizeSelect?.addEventListener("change",async r=>{await kt(r.target.value)}),t.$cache.autoToggle?.addEventListener("click",async()=>{await Lt()}),n.querySelector(".nd-settings-btn")?.addEventListener("click",r=>{r.stopPropagation(),n.classList.remove("expanded"),v(xt(),{source:import.meta.url,operation:"callback"})});const o=r=>{n.contains(r.target)||n.classList.remove("expanded","show-detail")};document.addEventListener("click",o,{passive:!0}),t._cleanup=()=>{document.removeEventListener("click",o),t.autoResetTimer&&clearTimeout(t.autoResetTimer),t.autoResetTimer=null,t.cooldownRafId&&cancelAnimationFrame(t.cooldownRafId),t.cooldownRafId=null,t.cooldownEndTime=null}}function Vt(t){const e=u.get(t)?.$cache?.presetSelect;_(e)}function Jt(t){const e=u.get(t)?.$cache?.sizeSelect;G(e)}async function st(t,e,n){const o=await zt(t,e);return o&&typeof n=="function"&&n(),o}async function St(t){return st(e=>{e.selectedParamsPresetId=t},"预设已切换",At)}async function kt(t){return st(e=>{e.overrideSize=t},"尺寸已切换",me)}async function Lt(){const t=D().mode==="auto"?"manual":"auto";return st(e=>{e.mode=t},t==="auto"?"自动配图已开启":"自动配图已关闭",be)}function ot(t,e){if(u.has(e)){const r=u.get(e);if(r.root?.isConnected)return v(z(e),{source:import.meta.url,operation:"mountFloorPanel"}),r;r._cleanup?.(),u.delete(e)}it();const n=_t(e),o=Gt(e);return n.root=o,Ft(e,o,{position:"right",id:`novel-draw-${e}`})?(Yt(n),Xt(n),u.set(e,n),v(z(e),{source:import.meta.url,operation:"mountFloorPanel"}),n):null}function Zt(){S||(S=new IntersectionObserver(t=>{const e=[];for(const n of t){if(!n.isIntersecting)continue;const o=n.target,r=Number(o.getAttribute("mesid"));q.has(r)&&(e.push({el:o,mid:r}),q.delete(r),S.unobserve(o))}e.length>0&&requestAnimationFrame(()=>{for(const{el:n,mid:o}of e)ot(n,o)})},{rootMargin:"300px"}))}function te(t,e,n={}){if(D().showFloorButton===!1)return null;const{force:o=!1}=n;if(it(),u.has(e)){const s=u.get(e);if(s.root?.isConnected)return s;s._cleanup?.(),u.delete(e)}if(o)return ot(t,e);const r=t.getBoundingClientRect();return r.top<window.innerHeight+500&&r.bottom>-500?ot(t,e):(Zt(),q.set(e,!0),S.observe(t),null)}function Se(t,e){S?.unobserve(t),q.delete(e);const n=u.get(e);!n||!t.contains(n.root)||(n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),at(e,n.root),u.delete(e))}function X(t,e,n={}){let o=u.get(t);if(!o?.root?.isConnected){const r=document.querySelector(`.mes[mesid="${t}"]`);r&&(o=te(r,t,{force:!0}))}o&&B(t,e,n),l&&t===Y()&&(O=t,A(e,n))}function ee(){try{const e=localStorage.getItem(yt);if(e)return JSON.parse(e)}catch(e){console.warn({source:import.meta.url,operation:"getFloatingPosition"},e)}const t=document.getElementById("xiaobaix-debug-mini");if(t){const e=t.getBoundingClientRect();return{left:e.left,top:e.bottom+8}}return{left:window.innerWidth-110,top:window.innerHeight-80}}function ne(){if(!l)return;const t=l.getBoundingClientRect();try{localStorage.setItem(yt,JSON.stringify({left:Math.round(t.left),top:Math.round(t.top)}))}catch(e){console.warn({source:import.meta.url,operation:"saveFloatingPosition"},e)}}var oe=77,re=101;function V(){if(!l)return;const t=ee(),e=f===a.IDLE?oe:re,n=l.offsetHeight||34;l.style.left=`${Math.max(0,Math.min(t.left,window.innerWidth-e))}px`,l.style.top=`${Math.max(0,Math.min(t.top,window.innerHeight-n))}px`}function J(){Q&&(cancelAnimationFrame(Q),Q=null),K=0}function ae(t){J(),K=Tt(t);function e(){if(!K)return;const n=Math.max(0,K-Date.now()),o=b.statusText;if(o&&(o.textContent=`${(n/1e3).toFixed(1)}s`,o.className="nd-status-text nd-countdown"),n<=0){J();return}Q=requestAnimationFrame(e)}Q=requestAnimationFrame(e)}function A(t,e={}){if(!l)return;const n=f===a.IDLE;f=t,n!==(t===a.IDLE)&&V(),T&&(clearTimeout(T),T=null),t!==a.COOLDOWN&&J(),l.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:o,statusText:r}=b;if(!(!o||!r))switch(r.className="nd-status-text",t){case a.IDLE:O=null,c={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:l.classList.add("working"),c.startTime||(c.startTime=Date.now()),o.textContent="↥",o.className="nd-status-icon nd-spin",r.textContent=p.submitting;break;case a.ACCEPTED:l.classList.add("working"),c.startTime||(c.startTime=Date.now()),o.textContent=vt(e),o.className="nd-status-icon nd-spin",r.textContent=Ct(e);break;case a.UNCERTAIN:l.classList.add("working"),c.startTime||(c.startTime=Date.now()),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=p.uncertain;break;case a.QUEUED:l.classList.add("working"),c.startTime||(c.startTime=Date.now()),o.textContent="⌛",o.className="nd-status-icon",r.textContent=p.queued;break;case a.LLM:l.classList.add("working"),c.startTime||(c.startTime=Date.now()),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=mt(e);break;case a.GEN:l.classList.add("working"),o.textContent="🎨",o.className="nd-status-icon nd-spin",r.textContent=`${e.current||0}/${e.total||0}`,c.total=e.total||0;break;case a.COOLDOWN:l.classList.add("cooldown"),o.textContent="⏳",o.className="nd-status-icon nd-spin",ae(e);break;case a.RECONNECTING:l.classList.add("working"),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=p.reconnecting;break;case a.CANCELLING:l.classList.add("working"),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=p.cancelling;break;case a.BACKEND_LEGACY:l.classList.add("working"),o.textContent="↪",o.className="nd-status-icon",r.textContent=p.legacy;break;case a.SUCCESS:l.classList.add("success"),o.textContent="✓",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,c.success=e.success,c.total=e.total,T=setTimeout(()=>A(a.IDLE),U);break;case a.PARTIAL:l.classList.add("partial"),o.textContent="⚠",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,c.success=e.success,c.total=e.total,T=setTimeout(()=>A(a.IDLE),U);break;case a.ERROR:l.classList.add("error"),o.textContent="✗",o.className="nd-status-icon",r.textContent=e.unknown?p.unknown:p.error,c.error=e.error,T=setTimeout(()=>A(a.IDLE),U);break}}function ie(){const{detailResult:t,detailErrorRow:e,detailError:n,detailTime:o}=b;if(!t)return;const r=c.startTime?((Date.now()-c.startTime)/1e3).toFixed(1):"-";f===a.SUCCESS||f===a.PARTIAL?(t.textContent=`${c.success}/${c.total} 成功`,t.className=`nd-detail-value ${f===a.SUCCESS?"success":"warning"}`,e.style.display=f===a.PARTIAL?"flex":"none",f===a.PARTIAL&&(n.textContent=`${c.total-c.success} 张失败`)):f===a.ERROR&&(t.textContent=c.error?.label||Z.redrawFailed,t.className="nd-detail-value error",e.style.display="flex",n.textContent=c.error?.desc||"未知错误"),o.textContent=`${r}s`}function se(t){if(t.button===0){g={startX:t.clientX,startY:t.clientY,startLeft:l.getBoundingClientRect().left,startTop:l.getBoundingClientRect().top,pointerId:t.pointerId,moved:!1,originalTarget:t.target};try{t.currentTarget.setPointerCapture(t.pointerId)}catch(e){console.warn({source:import.meta.url,operation:"onFloatingPointerDown"},e)}t.preventDefault()}}function le(t){if(!g||g.pointerId!==t.pointerId)return;const e=t.clientX-g.startX,n=t.clientY-g.startY;if(!g.moved&&(Math.abs(e)>3||Math.abs(n)>3)&&(g.moved=!0),g.moved){const o=l.offsetWidth||88,r=l.offsetHeight||36;l.style.left=`${Math.max(0,Math.min(g.startLeft+e,window.innerWidth-o))}px`,l.style.top=`${Math.max(0,Math.min(g.startTop+n,window.innerHeight-r))}px`}t.preventDefault()}function pt(t){if(!g||g.pointerId!==t.pointerId)return;const{moved:e,originalTarget:n}=g;try{t.currentTarget.releasePointerCapture(t.pointerId)}catch(o){console.warn({source:import.meta.url,operation:"onFloatingPointerUp"},o)}g=null,e?ne():de(n)}function de(t){t.closest(".nd-btn-draw")?v(ce(),{source:import.meta.url,operation:"routeFloatingClick"}):t.closest(".nd-btn-menu")?(l.classList.remove("show-detail"),l.classList.contains("expanded")||(pe(),fe()),l.classList.toggle("expanded")):t.closest(".nd-layer-active")&&([a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING,a.BACKEND_LEGACY].includes(f)?v(ue(),{source:import.meta.url,operation:"routeFloatingClick"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(f)&&(ie(),l.classList.toggle("show-detail")))}async function ce(){if(f!==a.IDLE)return;const t=Y();if(t<0){toastr?.warning?.("没有可配图的AI消息");return}O=t;try{await bt({messageId:t,onStateChange:(e,n,o)=>{X(o,e,n)}})}catch(e){if(e.drawTaskReported)return;e instanceof gt||ft(e)?toastr?.info?.(e.message):(console.error(e),toastr?.error?.(e.message))}}async function ue(){const t=O,e=rt(t);try{t>=0&&await ht({cancel:()=>wt(t,{target:e}),isCurrent:()=>F(e)&&O===I().chat.indexOf(e.message),getState:()=>f,setState:A})&&F(e)&&toastr?.info?.("正在中止"),t>=0&&F(e)&&await z(I().chat.indexOf(e.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(Z.cancelFailed)}}function pe(){_(b.presetSelect)}function fe(){G(b.sizeSelect)}function ge(){l&&(b={capsule:l.querySelector(".nd-capsule"),statusIcon:l.querySelector(".nd-status-icon"),statusText:l.querySelector(".nd-status-text"),detailResult:l.querySelector(".nd-result"),detailErrorRow:l.querySelector(".nd-error-row"),detailError:l.querySelector(".nd-error"),detailTime:l.querySelector(".nd-time"),presetSelect:l.querySelector(".nd-preset-select"),sizeSelect:l.querySelector(".nd-size-select"),autoToggle:l.querySelector(".nd-auto-toggle")})}function Rt(t){l&&!l.contains(t.target)&&l.classList.remove("expanded","show-detail")}function Nt(){if(l)return;const t=D();if(t.showFloatingButton!==!0)return;it();const e=t.mode==="auto";l=document.createElement("div"),l.className=`nd-float nd-floating-global${e?" auto-on":""}`,l.id="nd-floating-global";const n=i("div","nd-detail"),o=i("div","nd-detail-row");o.append(i("span","nd-detail-icon","📊"),i("span","nd-detail-label","结果"),i("span","nd-detail-value nd-result","-"));const r=i("div","nd-detail-row nd-error-row");r.style.display="none",r.append(i("span","nd-detail-icon","💡"),i("span","nd-detail-label","原因"),i("span","nd-detail-value error nd-error","-"));const s=i("div","nd-detail-row");s.append(i("span","nd-detail-icon","⏱"),i("span","nd-detail-label","耗时"),i("span","nd-detail-value nd-time","-")),n.append(o,r,s);const d=i("div","nd-menu"),m=i("div","nd-card"),x=i("div","nd-row");x.appendChild(i("span","nd-label","预设"));const P=i("select","nd-select nd-preset-select");_(P),x.appendChild(P);const $=i("div","nd-inner-sep"),k=i("div","nd-row");k.appendChild(i("span","nd-label","尺寸"));const L=i("select","nd-select size nd-size-select");G(L),k.appendChild(L),m.append(x,$,k);const h=i("div","nd-controls"),E=i("div",`nd-auto${e?" on":""} nd-auto-toggle`);E.append(i("span","nd-dot"),i("span","nd-auto-text","自动配图"));const C=i("button","nd-gear nd-settings-btn","⚙");C.title="打开设置",h.append(E,C),d.append(m,h);const y=i("div","nd-capsule"),w=i("div","nd-inner"),H=i("div","nd-layer nd-layer-idle"),R=i("button","nd-btn-draw");R.title="点击为最后一条AI消息生成配图",R.appendChild(i("span","","🎨")),R.appendChild(i("span","nd-auto-dot"));const j=i("div","nd-sep"),M=i("button","nd-btn-menu");M.title="展开菜单",M.appendChild(i("span","nd-arrow","▲")),H.append(R,j,M);const W=i("div","nd-layer nd-layer-active");W.append(i("span","nd-status-icon","⏳"),i("span","nd-status-text",p.analysis)),w.append(H,W),y.append(w,Et("▲")),l.append(n,d,y),document.body.appendChild(l),ge(),V();const N=b.capsule;N&&(N.addEventListener("pointerdown",se,{passive:!1}),N.addEventListener("pointermove",le,{passive:!1}),N.addEventListener("pointerup",pt,{passive:!1}),N.addEventListener("pointercancel",pt,{passive:!1})),b.presetSelect?.addEventListener("change",async tt=>{await St(tt.target.value)}),b.sizeSelect?.addEventListener("change",async tt=>{await kt(tt.target.value)}),b.autoToggle?.addEventListener("click",async()=>{await Lt()}),l.querySelector(".nd-settings-btn")?.addEventListener("click",()=>{l.classList.remove("expanded"),v(xt(),{source:import.meta.url,operation:"callback"})}),document.addEventListener("click",Rt,{passive:!0}),window.addEventListener("resize",V);const lt=Y();lt>=0&&v(z(lt),{source:import.meta.url,operation:"createFloatingButton"})}function It(){J(),T&&(clearTimeout(T),T=null),window.removeEventListener("resize",V),document.removeEventListener("click",Rt),l?.remove(),l=null,g=null,f=a.IDLE,b={}}function At(){u.forEach(t=>{_(t.$cache?.presetSelect)}),_(b.presetSelect)}function me(){u.forEach(t=>{G(t.$cache?.sizeSelect)}),G(b.sizeSelect)}function be(){const t=D().mode==="auto";u.forEach(e=>{e.root&&(e.root.classList.toggle("auto-on",t),e.$cache.autoToggle?.classList.toggle("on",t))}),l&&(l.classList.toggle("auto-on",t),b.autoToggle?.classList.toggle("on",t))}function ke(){At()}function Le(t,e){e&&!l?Nt():!e&&l&&It(),t||(u.forEach((n,o)=>{n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),n.root&&at(o,n.root)}),u.clear(),q.clear(),S?.disconnect(),S=null)}function Re(){const t=D();nt??=Dt(Wt),t.showFloatingButton===!0&&Nt()}function Ne(){nt?.(),nt=null,u.forEach((t,e)=>{t.autoResetTimer&&clearTimeout(t.autoResetTimer),t.cooldownRafId&&cancelAnimationFrame(t.cooldownRafId),t._cleanup?.(),t.root&&at(e,t.root)}),u.clear(),q.clear(),S?.disconnect(),S=null,It()}export{a as FloatState,Bt as SIZE_OPTIONS,Nt as createFloatingButton,It as destroyFloatingButton,Ne as destroyFloatingPanel,te as ensureNovelDrawPanel,Re as initFloatingPanel,Te as refreshDrawRunUiState,ke as refreshPresetSelect,ke as refreshPresetSelectAll,Se as releaseNovelDrawPanel,A as setFloatingState,X as setStateForMessage,At as updateAllPresetSelects,me as updateAllSizeSelects,be as updateAutoModeUI,Le as updateButtonVisibility};
