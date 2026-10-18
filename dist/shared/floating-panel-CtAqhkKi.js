import{Y as J}from"./gallery-cache-Cq4Aw28p.js";import{B as P,R as ot,V as pt,ct as At,n as rt,st as Dt,t as Pt,u as ft,z as Ft}from"./message-toolbar-XEYaRYhb.js";import{Ct as gt,xt as p}from"./draw-common-TXqmHMEF.js";import{a as mt,i as G,l as bt,o as tt,s as A,t as xt,u as Ot}from"./novel-draw-CNZGLWY1.js";import{a as zt,i as $t,n as wt,o as lt,r as dt,s as vt,t as ht}from"./draw-run-ui-state-Dji6k9kS.js";import{getContext as N}from"../../../../../extensions.js";var Ct="xb_novel_float_pos",M=8e3,Mt="novelai",a={IDLE:"idle",SUBMITTING:"submitting",ACCEPTED:"accepted",UNCERTAIN:"uncertain",QUEUED:"queued",LLM:"llm",GEN:"gen",COOLDOWN:"cooldown",RECONNECTING:"reconnecting",CANCELLING:"cancelling",BACKEND_LEGACY:"backend_legacy",SUCCESS:"success",PARTIAL:"partial",ERROR:"error"},Ut=[{value:"default",label:"跟随预设",width:null,height:null},{value:"832x1216",label:"832 × 1216  竖图",width:832,height:1216},{value:"1216x832",label:"1216 × 832  横图",width:1216,height:832},{value:"1024x1024",label:"1024 × 1024  方图",width:1024,height:1024},{value:"768x1280",label:"768 x 1280  大竖",width:768,height:1280},{value:"1280x768",label:"1280 x 768  大横",width:1280,height:768}],u=new Map,q=new Map,T=null,l=null,g=null,f=a.IDLE,F=null,c={success:0,total:0,error:null,startTime:0},E=null,W=null,j=0,b={},ct=!1,et=null,qt=`
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
`;function at(){if(ct)return;ct=!0;const t=document.createElement("style");t.id="nd-float-styles",t.textContent=qt,document.head.appendChild(t)}function s(t,e,n){const o=document.createElement(t);return e&&(o.className=e),n!==void 0&&(o.textContent=n),o}function yt(t){const e=s("button","nd-btn-menu nd-btn-menu-persist");return e.title="展开菜单",e.appendChild(s("span","nd-arrow",t)),e}function _(t){if(!t)return;const e=A(),n=e.paramsPresets||[],o=e.selectedParamsPresetId;t.replaceChildren(),n.forEach(r=>{const i=document.createElement("option");i.value=r.id,i.textContent=r.name||"未命名",r.id===o&&(i.selected=!0),t.appendChild(i)})}function B(t){if(!t)return;const e=A().overrideSize||"default";t.replaceChildren(),Ut.forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.label,n.value===e&&(o.selected=!0),t.appendChild(o)})}function _t(t){return{messageId:t,root:null,state:a.IDLE,result:{success:0,total:0,error:null,startTime:0},autoResetTimer:null,cooldownRafId:null,cooldownEndTime:0,$cache:{},_cleanup:null}}function Bt(t){const e=A().mode==="auto",n=document.createElement("div");n.className=`nd-float${e?" auto-on":""}`,n.dataset.messageId=t;const o=s("div","nd-capsule"),r=s("div","nd-inner"),i=s("div","nd-layer nd-layer-idle"),d=s("button","nd-btn-draw");d.title="点击生成配图",d.appendChild(s("span","","🎨")),d.appendChild(s("span","nd-auto-dot"));const m=s("div","nd-sep"),x=s("button","nd-btn-menu");x.title="展开菜单",x.appendChild(s("span","nd-arrow","▼")),i.append(d,m,x);const D=s("div","nd-layer nd-layer-active");D.append(s("span","nd-status-icon","⏳"),s("span","nd-status-text",p.analysis)),r.append(i,D),o.append(r,yt("▼"));const z=s("div","nd-detail"),S=s("div","nd-detail-row");S.append(s("span","nd-detail-icon","📊"),s("span","nd-detail-label","结果"),s("span","nd-detail-value nd-result","-"));const L=s("div","nd-detail-row nd-error-row");L.style.display="none",L.append(s("span","nd-detail-icon","💡"),s("span","nd-detail-label","原因"),s("span","nd-detail-value error nd-error","-"));const v=s("div","nd-detail-row");v.append(s("span","nd-detail-icon","⏱"),s("span","nd-detail-label","耗时"),s("span","nd-detail-value nd-time","-")),z.append(S,L,v);const y=s("div","nd-menu"),h=s("div","nd-card"),C=s("div","nd-row");C.appendChild(s("span","nd-label","预设"));const w=s("select","nd-select nd-preset-select");_(w),C.appendChild(w);const Q=s("div","nd-inner-sep"),k=s("div","nd-row");k.appendChild(s("span","nd-label","尺寸"));const H=s("select","nd-select size nd-size-select");B(H),k.appendChild(H),h.append(C,Q,k);const $=s("div","nd-controls"),Y=s("div",`nd-auto${e?" on":""} nd-auto-toggle`);Y.append(s("span","nd-dot"),s("span","nd-auto-text","自动配图"));const R=s("button","nd-gear nd-settings-btn","⚙");return R.title="打开设置",$.append(Y,R),y.append(h,$),n.append(o,z,y),n}function Gt(t){const e=t.root;e&&(t.$cache={statusIcon:e.querySelector(".nd-status-icon"),statusText:e.querySelector(".nd-status-text"),result:e.querySelector(".nd-result"),errorRow:e.querySelector(".nd-error-row"),error:e.querySelector(".nd-error"),time:e.querySelector(".nd-time"),presetSelect:e.querySelector(".nd-preset-select"),sizeSelect:e.querySelector(".nd-size-select"),autoToggle:e.querySelector(".nd-auto-toggle")})}function U(t,e,n={}){const o=u.get(t);if(!o?.root)return;const r=o.root;o.state=e,o.autoResetTimer&&(clearTimeout(o.autoResetTimer),o.autoResetTimer=null),e!==a.COOLDOWN&&o.cooldownRafId&&(cancelAnimationFrame(o.cooldownRafId),o.cooldownRafId=null,o.cooldownEndTime=0),r.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:i,statusText:d}=o.$cache;switch(d&&(d.className="nd-status-text"),e){case a.IDLE:o.result={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="↥",i.className="nd-status-icon nd-spin"),d&&(d.textContent=p.submitting);break;case a.ACCEPTED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent=wt(n),i.className="nd-status-icon nd-spin"),d&&(d.textContent=ht(n));break;case a.UNCERTAIN:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="↻",i.className="nd-status-icon nd-spin"),d&&(d.textContent=p.uncertain);break;case a.QUEUED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="⌛",i.className="nd-status-icon"),d&&(d.textContent=p.queued),o.result.total=n.total||o.result.total||0;break;case a.LLM:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),d&&(d.textContent=gt(n));break;case a.GEN:r.classList.add("working"),i&&(i.textContent="🎨",i.className="nd-status-icon nd-spin"),d&&(d.textContent=`${n.current||0}/${n.total||0}`),o.result.total=n.total||0;break;case a.COOLDOWN:r.classList.add("cooldown"),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),Wt(o,n);break;case a.RECONNECTING:r.classList.add("working"),i&&(i.textContent="↻",i.className="nd-status-icon nd-spin"),d&&(d.textContent=p.reconnecting);break;case a.CANCELLING:r.classList.add("working"),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),d&&(d.textContent=p.cancelling);break;case a.BACKEND_LEGACY:r.classList.add("working"),i&&(i.textContent="↪",i.className="nd-status-icon"),d&&(d.textContent=p.legacy);break;case a.SUCCESS:r.classList.add("success"),i&&(i.textContent="✓",i.className="nd-status-icon"),d&&(d.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>U(t,a.IDLE),M);break;case a.PARTIAL:r.classList.add("partial"),i&&(i.textContent="⚠",i.className="nd-status-icon"),d&&(d.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>U(t,a.IDLE),M);break;case a.ERROR:r.classList.add("error"),i&&(i.textContent="✗",i.className="nd-status-icon"),d&&(d.textContent=n.unknown?p.unknown:p.error),o.result.error=n.error,o.autoResetTimer=setTimeout(()=>U(t,a.IDLE),M);break}}async function O(t,e={}){const n=tt(t);if(n){K(t,n.state,n.data);return}const o=ot(t),r=await Ft(t).catch(()=>null);if(!r||!P(o))return;t=N().chat.indexOf(o.message);const i=tt(t);if(i){K(t,i.state,i.data);return}const d=N(),m=String(d?.chatId||""),x=d?.chat?.[Number(t)];if(!m||!x)return;const D=Number.isInteger(x.swipe_id)?x.swipe_id:0,z=Number.isSafeInteger(r.swipeIndex)?r.swipeIndex:D,S=r.provider||e?.provider||Mt,L=r.runId||e?.runId||"",v={chatId:m,messageId:t,swipeIndex:z,provider:S,runId:L},y=$t({detail:e,pending:r.pending,...v}),h=zt(y,r,v),C=u.get(t);if(C){const w=lt({currentState:C.state,pending:r.pending,detail:h,...v});(w!==C.state||w===a.ACCEPTED&&dt(y))&&U(t,w,h)}if(l&&Number(t)===G()){const w=lt({currentState:f,pending:r.pending,detail:h,...v});r.pending&&(F=Number(t)),(w!==f||w===a.ACCEPTED&&dt(y))&&I(w,h)}}function Yt(t={}){const e=Dt(t,N());if(!e)return;const n=G();(u.has(e.messageId)||l&&e.messageId===n)&&O(e.messageId,t)}function ye(){const t=G();if(l){const e=t>=0?tt(t):null;e?(F=t,I(e.state,e.data)):I(a.IDLE)}t>=0&&O(t)}function Et({cooldownUntil:t,duration:e}={}){const n=Number(t);return Number.isFinite(n)&&n>0?n:Date.now()+Math.max(0,Number(e)||0)}function Wt(t,e){t.cooldownRafId&&cancelAnimationFrame(t.cooldownRafId),t.cooldownEndTime=Et(e);function n(){if(!t.cooldownEndTime)return;const o=Math.max(0,t.cooldownEndTime-Date.now()),r=t.$cache?.statusText;if(r&&(r.textContent=`${(o/1e3).toFixed(1)}s`,r.className="nd-status-text nd-countdown"),o<=0){t.cooldownRafId=null,t.cooldownEndTime=0;return}t.cooldownRafId=requestAnimationFrame(n)}t.cooldownRafId=requestAnimationFrame(n)}function Qt(t){const e=u.get(t);if(!e?.root)return;const{result:n,errorRow:o,error:r,time:i}=e.$cache,{result:d,state:m}=e,x=d.startTime?((Date.now()-d.startTime)/1e3).toFixed(1):"-";m===a.SUCCESS||m===a.PARTIAL?(n&&(n.textContent=`${d.success}/${d.total} 成功`,n.className=`nd-detail-value ${m===a.SUCCESS?"success":"warning"}`),o&&(o.style.display=m===a.PARTIAL?"flex":"none"),r&&m===a.PARTIAL&&(r.textContent=`${d.total-d.success} 张失败`)):m===a.ERROR&&(n&&(n.textContent=d.error?.label||J.redrawFailed,n.className="nd-detail-value error"),o&&(o.style.display="flex"),r&&(r.textContent=d.error?.desc||"未知错误")),i&&(i.textContent=`${x}s`)}async function Ht(t){const e=u.get(t);if(!(!e||e.state!==a.IDLE))try{await mt({messageId:t,onStateChange:(n,o,r)=>{K(r,n,o)}})}catch(n){if(n.drawTaskReported)return;n instanceof ft||pt(n)?toastr?.info?.(n.message):(console.error(n),toastr?.error?.(n.message))}}async function jt(t){const e=ot(t);try{await vt({cancel:()=>xt(t,{target:e}),isCurrent:()=>P(e),getState:()=>u.get(N().chat.indexOf(e.message))?.state,setState:n=>U(N().chat.indexOf(e.message),n)})&&P(e)&&toastr?.info?.("正在中止"),P(e)&&await O(N().chat.indexOf(e.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(J.cancelFailed)}}function Kt(t){const{messageId:e,root:n}=t;n.querySelector(".nd-btn-draw")?.addEventListener("click",r=>{r.stopPropagation(),Ht(e)}),n.querySelectorAll(".nd-btn-menu").forEach(r=>r.addEventListener("click",i=>{i.stopPropagation(),n.classList.remove("show-detail"),n.classList.contains("expanded")||(Xt(e),Vt(e)),n.classList.toggle("expanded")})),n.querySelector(".nd-layer-active")?.addEventListener("click",r=>{r.stopPropagation();const i=t.state;[a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING,a.BACKEND_LEGACY].includes(i)?jt(e):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(i)&&(Qt(e),n.classList.toggle("show-detail"))}),t.$cache.presetSelect?.addEventListener("change",async r=>{await Tt(r.target.value)}),t.$cache.sizeSelect?.addEventListener("change",async r=>{await St(r.target.value)}),t.$cache.autoToggle?.addEventListener("click",async()=>{await Lt()}),n.querySelector(".nd-settings-btn")?.addEventListener("click",r=>{r.stopPropagation(),n.classList.remove("expanded"),bt()});const o=r=>{n.contains(r.target)||n.classList.remove("expanded","show-detail")};document.addEventListener("click",o,{passive:!0}),t._cleanup=()=>{document.removeEventListener("click",o),t.autoResetTimer&&clearTimeout(t.autoResetTimer),t.autoResetTimer=null,t.cooldownRafId&&cancelAnimationFrame(t.cooldownRafId),t.cooldownRafId=null,t.cooldownEndTime=null}}function Xt(t){const e=u.get(t)?.$cache?.presetSelect;_(e)}function Vt(t){const e=u.get(t)?.$cache?.sizeSelect;B(e)}async function st(t,e,n){const o=await Ot(t,e);return o&&typeof n=="function"&&n(),o}async function Tt(t){return st(e=>{e.selectedParamsPresetId=t},"预设已切换",It)}async function St(t){return st(e=>{e.overrideSize=t},"尺寸已切换",ge)}async function Lt(){const t=A().mode==="auto"?"manual":"auto";return st(e=>{e.mode=t},t==="auto"?"自动配图已开启":"自动配图已关闭",me)}function nt(t,e){if(u.has(e)){const r=u.get(e);if(r.root?.isConnected)return O(e),r;r._cleanup?.(),u.delete(e)}at();const n=_t(e),o=Bt(e);return n.root=o,Pt(e,o,{position:"right",id:`novel-draw-${e}`})?(Gt(n),Kt(n),u.set(e,n),O(e),n):null}function Jt(){T||(T=new IntersectionObserver(t=>{const e=[];for(const n of t){if(!n.isIntersecting)continue;const o=n.target,r=Number(o.getAttribute("mesid"));q.has(r)&&(e.push({el:o,mid:r}),q.delete(r),T.unobserve(o))}e.length>0&&requestAnimationFrame(()=>{for(const{el:n,mid:o}of e)nt(n,o)})},{rootMargin:"300px"}))}function Zt(t,e,n={}){if(A().showFloorButton===!1)return null;const{force:o=!1}=n;if(at(),u.has(e)){const i=u.get(e);if(i.root?.isConnected)return i;i._cleanup?.(),u.delete(e)}if(o)return nt(t,e);const r=t.getBoundingClientRect();return r.top<window.innerHeight+500&&r.bottom>-500?nt(t,e):(Jt(),q.set(e,!0),T.observe(t),null)}function Ee(t,e){T?.unobserve(t),q.delete(e);const n=u.get(e);!n||!t.contains(n.root)||(n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),rt(e,n.root),u.delete(e))}function K(t,e,n={}){let o=u.get(t);if(!o?.root?.isConnected){const r=document.querySelector(`.mes[mesid="${t}"]`);r&&(o=Zt(r,t,{force:!0}))}o&&U(t,e,n),l&&t===G()&&(F=t,I(e,n))}function te(){try{const e=localStorage.getItem(Ct);if(e)return JSON.parse(e)}catch{}const t=document.getElementById("xiaobaix-debug-mini");if(t){const e=t.getBoundingClientRect();return{left:e.left,top:e.bottom+8}}return{left:window.innerWidth-110,top:window.innerHeight-80}}function ee(){if(!l)return;const t=l.getBoundingClientRect();try{localStorage.setItem(Ct,JSON.stringify({left:Math.round(t.left),top:Math.round(t.top)}))}catch{}}var ne=77,oe=101;function X(){if(!l)return;const t=te(),e=f===a.IDLE?ne:oe,n=l.offsetHeight||34;l.style.left=`${Math.max(0,Math.min(t.left,window.innerWidth-e))}px`,l.style.top=`${Math.max(0,Math.min(t.top,window.innerHeight-n))}px`}function V(){W&&(cancelAnimationFrame(W),W=null),j=0}function re(t){V(),j=Et(t);function e(){if(!j)return;const n=Math.max(0,j-Date.now()),o=b.statusText;if(o&&(o.textContent=`${(n/1e3).toFixed(1)}s`,o.className="nd-status-text nd-countdown"),n<=0){V();return}W=requestAnimationFrame(e)}W=requestAnimationFrame(e)}function I(t,e={}){if(!l)return;const n=f===a.IDLE;f=t,n!==(t===a.IDLE)&&X(),E&&(clearTimeout(E),E=null),t!==a.COOLDOWN&&V(),l.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:o,statusText:r}=b;if(!(!o||!r))switch(r.className="nd-status-text",t){case a.IDLE:F=null,c={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:l.classList.add("working"),c.startTime||(c.startTime=Date.now()),o.textContent="↥",o.className="nd-status-icon nd-spin",r.textContent=p.submitting;break;case a.ACCEPTED:l.classList.add("working"),c.startTime||(c.startTime=Date.now()),o.textContent=wt(e),o.className="nd-status-icon nd-spin",r.textContent=ht(e);break;case a.UNCERTAIN:l.classList.add("working"),c.startTime||(c.startTime=Date.now()),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=p.uncertain;break;case a.QUEUED:l.classList.add("working"),c.startTime||(c.startTime=Date.now()),o.textContent="⌛",o.className="nd-status-icon",r.textContent=p.queued;break;case a.LLM:l.classList.add("working"),c.startTime||(c.startTime=Date.now()),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=gt(e);break;case a.GEN:l.classList.add("working"),o.textContent="🎨",o.className="nd-status-icon nd-spin",r.textContent=`${e.current||0}/${e.total||0}`,c.total=e.total||0;break;case a.COOLDOWN:l.classList.add("cooldown"),o.textContent="⏳",o.className="nd-status-icon nd-spin",re(e);break;case a.RECONNECTING:l.classList.add("working"),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=p.reconnecting;break;case a.CANCELLING:l.classList.add("working"),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=p.cancelling;break;case a.BACKEND_LEGACY:l.classList.add("working"),o.textContent="↪",o.className="nd-status-icon",r.textContent=p.legacy;break;case a.SUCCESS:l.classList.add("success"),o.textContent="✓",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,c.success=e.success,c.total=e.total,E=setTimeout(()=>I(a.IDLE),M);break;case a.PARTIAL:l.classList.add("partial"),o.textContent="⚠",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,c.success=e.success,c.total=e.total,E=setTimeout(()=>I(a.IDLE),M);break;case a.ERROR:l.classList.add("error"),o.textContent="✗",o.className="nd-status-icon",r.textContent=e.unknown?p.unknown:p.error,c.error=e.error,E=setTimeout(()=>I(a.IDLE),M);break}}function ae(){const{detailResult:t,detailErrorRow:e,detailError:n,detailTime:o}=b;if(!t)return;const r=c.startTime?((Date.now()-c.startTime)/1e3).toFixed(1):"-";f===a.SUCCESS||f===a.PARTIAL?(t.textContent=`${c.success}/${c.total} 成功`,t.className=`nd-detail-value ${f===a.SUCCESS?"success":"warning"}`,e.style.display=f===a.PARTIAL?"flex":"none",f===a.PARTIAL&&(n.textContent=`${c.total-c.success} 张失败`)):f===a.ERROR&&(t.textContent=c.error?.label||J.redrawFailed,t.className="nd-detail-value error",e.style.display="flex",n.textContent=c.error?.desc||"未知错误"),o.textContent=`${r}s`}function se(t){if(t.button===0){g={startX:t.clientX,startY:t.clientY,startLeft:l.getBoundingClientRect().left,startTop:l.getBoundingClientRect().top,pointerId:t.pointerId,moved:!1,originalTarget:t.target};try{t.currentTarget.setPointerCapture(t.pointerId)}catch{}t.preventDefault()}}function ie(t){if(!g||g.pointerId!==t.pointerId)return;const e=t.clientX-g.startX,n=t.clientY-g.startY;if(!g.moved&&(Math.abs(e)>3||Math.abs(n)>3)&&(g.moved=!0),g.moved){const o=l.offsetWidth||88,r=l.offsetHeight||36;l.style.left=`${Math.max(0,Math.min(g.startLeft+e,window.innerWidth-o))}px`,l.style.top=`${Math.max(0,Math.min(g.startTop+n,window.innerHeight-r))}px`}t.preventDefault()}function ut(t){if(!g||g.pointerId!==t.pointerId)return;const{moved:e,originalTarget:n}=g;try{t.currentTarget.releasePointerCapture(t.pointerId)}catch{}g=null,e?ee():le(n)}function le(t){t.closest(".nd-btn-draw")?de():t.closest(".nd-btn-menu")?(l.classList.remove("show-detail"),l.classList.contains("expanded")||(ue(),pe()),l.classList.toggle("expanded")):t.closest(".nd-layer-active")&&([a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING,a.BACKEND_LEGACY].includes(f)?ce():[a.SUCCESS,a.PARTIAL,a.ERROR].includes(f)&&(ae(),l.classList.toggle("show-detail")))}async function de(){if(f!==a.IDLE)return;const t=G();if(t<0){toastr?.warning?.("没有可配图的AI消息");return}F=t;try{await mt({messageId:t,onStateChange:(e,n,o)=>{K(o,e,n)}})}catch(e){if(e.drawTaskReported)return;e instanceof ft||pt(e)?toastr?.info?.(e.message):(console.error(e),toastr?.error?.(e.message))}}async function ce(){const t=F,e=ot(t);try{t>=0&&await vt({cancel:()=>xt(t,{target:e}),isCurrent:()=>P(e)&&F===N().chat.indexOf(e.message),getState:()=>f,setState:I})&&P(e)&&toastr?.info?.("正在中止"),t>=0&&P(e)&&await O(N().chat.indexOf(e.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(J.cancelFailed)}}function ue(){_(b.presetSelect)}function pe(){B(b.sizeSelect)}function fe(){l&&(b={capsule:l.querySelector(".nd-capsule"),statusIcon:l.querySelector(".nd-status-icon"),statusText:l.querySelector(".nd-status-text"),detailResult:l.querySelector(".nd-result"),detailErrorRow:l.querySelector(".nd-error-row"),detailError:l.querySelector(".nd-error"),detailTime:l.querySelector(".nd-time"),presetSelect:l.querySelector(".nd-preset-select"),sizeSelect:l.querySelector(".nd-size-select"),autoToggle:l.querySelector(".nd-auto-toggle")})}function kt(t){l&&!l.contains(t.target)&&l.classList.remove("expanded","show-detail")}function Rt(){if(l)return;const t=A();if(t.showFloatingButton!==!0)return;at();const e=t.mode==="auto";l=document.createElement("div"),l.className=`nd-float nd-floating-global${e?" auto-on":""}`,l.id="nd-floating-global";const n=s("div","nd-detail"),o=s("div","nd-detail-row");o.append(s("span","nd-detail-icon","📊"),s("span","nd-detail-label","结果"),s("span","nd-detail-value nd-result","-"));const r=s("div","nd-detail-row nd-error-row");r.style.display="none",r.append(s("span","nd-detail-icon","💡"),s("span","nd-detail-label","原因"),s("span","nd-detail-value error nd-error","-"));const i=s("div","nd-detail-row");i.append(s("span","nd-detail-icon","⏱"),s("span","nd-detail-label","耗时"),s("span","nd-detail-value nd-time","-")),n.append(o,r,i);const d=s("div","nd-menu"),m=s("div","nd-card"),x=s("div","nd-row");x.appendChild(s("span","nd-label","预设"));const D=s("select","nd-select nd-preset-select");_(D),x.appendChild(D);const z=s("div","nd-inner-sep"),S=s("div","nd-row");S.appendChild(s("span","nd-label","尺寸"));const L=s("select","nd-select size nd-size-select");B(L),S.appendChild(L),m.append(x,z,S);const v=s("div","nd-controls"),y=s("div",`nd-auto${e?" on":""} nd-auto-toggle`);y.append(s("span","nd-dot"),s("span","nd-auto-text","自动配图"));const h=s("button","nd-gear nd-settings-btn","⚙");h.title="打开设置",v.append(y,h),d.append(m,v);const C=s("div","nd-capsule"),w=s("div","nd-inner"),Q=s("div","nd-layer nd-layer-idle"),k=s("button","nd-btn-draw");k.title="点击为最后一条AI消息生成配图",k.appendChild(s("span","","🎨")),k.appendChild(s("span","nd-auto-dot"));const H=s("div","nd-sep"),$=s("button","nd-btn-menu");$.title="展开菜单",$.appendChild(s("span","nd-arrow","▲")),Q.append(k,H,$);const Y=s("div","nd-layer nd-layer-active");Y.append(s("span","nd-status-icon","⏳"),s("span","nd-status-text",p.analysis)),w.append(Q,Y),C.append(w,yt("▲")),l.append(n,d,C),document.body.appendChild(l),fe(),X();const R=b.capsule;R&&(R.addEventListener("pointerdown",se,{passive:!1}),R.addEventListener("pointermove",ie,{passive:!1}),R.addEventListener("pointerup",ut,{passive:!1}),R.addEventListener("pointercancel",ut,{passive:!1})),b.presetSelect?.addEventListener("change",async Z=>{await Tt(Z.target.value)}),b.sizeSelect?.addEventListener("change",async Z=>{await St(Z.target.value)}),b.autoToggle?.addEventListener("click",async()=>{await Lt()}),l.querySelector(".nd-settings-btn")?.addEventListener("click",()=>{l.classList.remove("expanded"),bt()}),document.addEventListener("click",kt,{passive:!0}),window.addEventListener("resize",X);const it=G();it>=0&&O(it)}function Nt(){V(),E&&(clearTimeout(E),E=null),window.removeEventListener("resize",X),document.removeEventListener("click",kt),l?.remove(),l=null,g=null,f=a.IDLE,b={}}function It(){u.forEach(t=>{_(t.$cache?.presetSelect)}),_(b.presetSelect)}function ge(){u.forEach(t=>{B(t.$cache?.sizeSelect)}),B(b.sizeSelect)}function me(){const t=A().mode==="auto";u.forEach(e=>{e.root&&(e.root.classList.toggle("auto-on",t),e.$cache.autoToggle?.classList.toggle("on",t))}),l&&(l.classList.toggle("auto-on",t),b.autoToggle?.classList.toggle("on",t))}function Te(){It()}function Se(t,e){e&&!l?Rt():!e&&l&&Nt(),t||(u.forEach((n,o)=>{n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),n.root&&rt(o,n.root)}),u.clear(),q.clear(),T?.disconnect(),T=null)}function Le(){const t=A();et??=At(Yt),t.showFloatingButton===!0&&Rt()}function ke(){et?.(),et=null,u.forEach((t,e)=>{t.autoResetTimer&&clearTimeout(t.autoResetTimer),t.cooldownRafId&&cancelAnimationFrame(t.cooldownRafId),t._cleanup?.(),t.root&&rt(e,t.root)}),u.clear(),q.clear(),T?.disconnect(),T=null,Nt()}export{a as FloatState,Ut as SIZE_OPTIONS,Rt as createFloatingButton,Nt as destroyFloatingButton,ke as destroyFloatingPanel,Zt as ensureNovelDrawPanel,Le as initFloatingPanel,ye as refreshDrawRunUiState,Te as refreshPresetSelect,Te as refreshPresetSelectAll,Ee as releaseNovelDrawPanel,I as setFloatingState,K as setStateForMessage,It as updateAllPresetSelects,ge as updateAllSizeSelects,me as updateAutoModeUI,Se as updateButtonVisibility};
