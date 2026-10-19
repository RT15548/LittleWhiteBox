import{n as v}from"./async-errors-C4kfchr9.js";import{Y as tt}from"./gallery-cache-C-5qG11N.js";import{$t,B as F,R as it,V as bt,ct as zt,en as Ut,n as lt,st as _t,t as Bt,u as xt,z as qt}from"./message-toolbar-CcMv9NZT.js";import{Ct as wt,xt as f}from"./draw-common-DXzHdqpm.js";import{a as vt,i as W,l as ht,o as ot,s as h,t as Ct,u as Gt}from"./novel-draw-CEWZ_ez7.js";import{a as Yt,c as dt,d as Wt,f as Qt,i as Ht,l as Xt,n as yt,o as pt,r as ft,s as Et,t as Tt,u as jt}from"./draw-run-ui-state-C7w3Qyu8.js";import{getContext as A}from"../../../../../extensions.js";var St="xb_novel_float_pos",U=8e3,Kt="novelai",a={IDLE:"idle",SUBMITTING:"submitting",ACCEPTED:"accepted",UNCERTAIN:"uncertain",QUEUED:"queued",LLM:"llm",GEN:"gen",COOLDOWN:"cooldown",RECONNECTING:"reconnecting",CANCELLING:"cancelling",BACKEND_LEGACY:"backend_legacy",SUCCESS:"success",PARTIAL:"partial",ERROR:"error"},Vt=[{value:"default",label:"跟随预设",width:null,height:null},{value:"832x1216",label:"832 × 1216  竖图",width:832,height:1216},{value:"1216x832",label:"1216 × 832  横图",width:1216,height:832},{value:"1024x1024",label:"1024 × 1024  方图",width:1024,height:1024},{value:"768x1280",label:"768 x 1280  大竖",width:768,height:1280},{value:"1280x768",label:"1280 x 768  大横",width:1280,height:768}],c=new Map,B=new Map,I=null,l=null,m=null,g=a.IDLE,M=null,u={success:0,total:0,error:null,startTime:0},S=null,H=null,K=0,p={},gt=!1,rt=null,Jt=`
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
${Xt}

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
`;function ct(){if(gt)return;gt=!0;const t=document.createElement("style");t.id="nd-float-styles",t.textContent=Jt,document.head.appendChild(t)}function s(t,e,n){const o=document.createElement(t);return e&&(o.className=e),n!==void 0&&(o.textContent=n),o}function It(t){const e=s("button","nd-btn-menu nd-btn-menu-persist");return e.title="展开菜单",e.appendChild(s("span","nd-arrow",t)),e}function q(t){if(!t)return;const e=h(),n=e.paramsPresets||[],o=e.selectedParamsPresetId;t.replaceChildren(),n.forEach(r=>{const i=document.createElement("option");i.value=r.id,i.textContent=r.name||"未命名",r.id===o&&(i.selected=!0),t.appendChild(i)})}function G(t){if(!t)return;const e=h().overrideSize||"default";t.replaceChildren(),Vt.forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.label,n.value===e&&(o.selected=!0),t.appendChild(o)})}function Zt(){const t=h(),e=t.paramsPresets||[];return(e.find(n=>n.id===t.selectedParamsPresetId)||e[0])?.maxImages||0}function Y(t,e=!1){Qt(t,{override:h().overrideMaxImages,presetMaxImages:Zt(),force:e})}function kt(){const t=Wt(document);return Y(t.querySelector(`.${dt}`)),t}function Lt(t){return jt(t,{getOverride:()=>h().overrideMaxImages,save:pe,refresh:Y,notify:e=>globalThis.toastr?.warning?.(e)})}function te(t){return{messageId:t,root:null,state:a.IDLE,result:{success:0,total:0,error:null,startTime:0},autoResetTimer:null,cooldownRafId:null,cooldownEndTime:0,$cache:{},_cleanup:null}}function ee(t){const e=h().mode==="auto",n=document.createElement("div");n.className=`nd-float${e?" auto-on":""}`,n.dataset.messageId=t;const o=s("div","nd-capsule"),r=s("div","nd-inner"),i=s("div","nd-layer nd-layer-idle"),d=s("button","nd-btn-draw");d.title="点击生成配图",d.appendChild(s("span","","🎨")),d.appendChild(s("span","nd-auto-dot"));const b=s("div","nd-sep"),x=s("button","nd-btn-menu");x.title="展开菜单",x.appendChild(s("span","nd-arrow","▼")),i.append(d,b,x);const P=s("div","nd-layer nd-layer-active");P.append(s("span","nd-status-icon","⏳"),s("span","nd-status-text",f.analysis)),r.append(i,P),o.append(r,It("▼"));const $=s("div","nd-detail"),k=s("div","nd-detail-row");k.append(s("span","nd-detail-icon","📊"),s("span","nd-detail-label","结果"),s("span","nd-detail-value nd-result","-"));const L=s("div","nd-detail-row nd-error-row");L.style.display="none",L.append(s("span","nd-detail-icon","💡"),s("span","nd-detail-label","原因"),s("span","nd-detail-value error nd-error","-"));const C=s("div","nd-detail-row");C.append(s("span","nd-detail-icon","⏱"),s("span","nd-detail-label","耗时"),s("span","nd-detail-value nd-time","-")),$.append(k,L,C);const T=s("div","nd-menu"),y=s("div","nd-card"),E=s("div","nd-row");E.appendChild(s("span","nd-label","预设"));const w=s("select","nd-select nd-preset-select");q(w),E.appendChild(w);const X=s("div","nd-inner-sep"),R=s("div","nd-row");R.appendChild(s("span","nd-label","尺寸"));const j=s("select","nd-select size nd-size-select");G(j),R.appendChild(j),y.append(E,X,R,kt());const z=s("div","nd-controls"),Q=s("div",`nd-auto${e?" on":""} nd-auto-toggle`);Q.append(s("span","nd-dot"),s("span","nd-auto-text","自动配图"));const N=s("button","nd-gear nd-settings-btn","⚙");return N.title="打开设置",z.append(Q,N),T.append(y,z),n.append(o,$,T),n}function ne(t){const e=t.root;e&&(t.$cache={statusIcon:e.querySelector(".nd-status-icon"),statusText:e.querySelector(".nd-status-text"),result:e.querySelector(".nd-result"),errorRow:e.querySelector(".nd-error-row"),error:e.querySelector(".nd-error"),time:e.querySelector(".nd-time"),presetSelect:e.querySelector(".nd-preset-select"),sizeSelect:e.querySelector(".nd-size-select"),maxImagesInput:e.querySelector(`.${dt}`),autoToggle:e.querySelector(".nd-auto-toggle")})}function _(t,e,n={}){const o=c.get(t);if(!o?.root)return;const r=o.root;o.state=e,o.autoResetTimer&&(clearTimeout(o.autoResetTimer),o.autoResetTimer=null),e!==a.COOLDOWN&&o.cooldownRafId&&(cancelAnimationFrame(o.cooldownRafId),o.cooldownRafId=null,o.cooldownEndTime=0),r.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:i,statusText:d}=o.$cache;switch(d&&(d.className="nd-status-text"),e){case a.IDLE:o.result={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="↥",i.className="nd-status-icon nd-spin"),d&&(d.textContent=f.submitting);break;case a.ACCEPTED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent=yt(n),i.className="nd-status-icon nd-spin"),d&&(d.textContent=Tt(n));break;case a.UNCERTAIN:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="↻",i.className="nd-status-icon nd-spin"),d&&(d.textContent=f.uncertain);break;case a.QUEUED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="⌛",i.className="nd-status-icon"),d&&(d.textContent=f.queued),o.result.total=n.total||o.result.total||0;break;case a.LLM:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),d&&(d.textContent=wt(n));break;case a.GEN:r.classList.add("working"),i&&(i.textContent="🎨",i.className="nd-status-icon nd-spin"),d&&(d.textContent=`${n.current||0}/${n.total||0}`),o.result.total=n.total||0;break;case a.COOLDOWN:r.classList.add("cooldown"),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),re(o,n);break;case a.RECONNECTING:r.classList.add("working"),i&&(i.textContent="↻",i.className="nd-status-icon nd-spin"),d&&(d.textContent=f.reconnecting);break;case a.CANCELLING:r.classList.add("working"),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),d&&(d.textContent=f.cancelling);break;case a.BACKEND_LEGACY:r.classList.add("working"),i&&(i.textContent="↪",i.className="nd-status-icon"),d&&(d.textContent=f.legacy);break;case a.SUCCESS:r.classList.add("success"),i&&(i.textContent="✓",i.className="nd-status-icon"),d&&(d.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>_(t,a.IDLE),U);break;case a.PARTIAL:r.classList.add("partial"),i&&(i.textContent="⚠",i.className="nd-status-icon"),d&&(d.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>_(t,a.IDLE),U);break;case a.ERROR:r.classList.add("error"),i&&(i.textContent="✗",i.className="nd-status-icon"),d&&(d.textContent=n.unknown?f.unknown:f.error),o.result.error=n.error,o.autoResetTimer=setTimeout(()=>_(t,a.IDLE),U);break}}async function O(t,e={}){const n=ot(t);if(n){V(t,n.state,n.data);return}const o=it(t),r=await qt(t).catch(()=>null);if(!r||!F(o))return;t=A().chat.indexOf(o.message);const i=ot(t);if(i){V(t,i.state,i.data);return}const d=A(),b=String(d?.chatId||""),x=d?.chat?.[Number(t)];if(!b||!x)return;const P=Number.isInteger(x.swipe_id)?x.swipe_id:0,$=Number.isSafeInteger(r.swipeIndex)?r.swipeIndex:P,k=r.provider||e?.provider||Kt,L=r.runId||e?.runId||"",C={chatId:b,messageId:t,swipeIndex:$,provider:k,runId:L},T=Ht({detail:e,pending:r.pending,...C}),y=Yt(T,r,C),E=c.get(t);if(E){const w=pt({currentState:E.state,pending:r.pending,detail:y,...C});(w!==E.state||w===a.ACCEPTED&&ft(T))&&_(t,w,y)}if(l&&Number(t)===W()){const w=pt({currentState:g,pending:r.pending,detail:y,...C});r.pending&&(M=Number(t)),(w!==g||w===a.ACCEPTED&&ft(T))&&D(w,y)}}function oe(t={}){const e=_t(t,A());if(!e)return;const n=W();(c.has(e.messageId)||l&&e.messageId===n)&&v(O(e.messageId,t),{source:import.meta.url,operation:"syncDrawRunActivity"})}function Ue(){const t=W();if(l){const e=t>=0?ot(t):null;e?(M=t,D(e.state,e.data)):D(a.IDLE)}t>=0&&v(O(t),{source:import.meta.url,operation:"refreshDrawRunUiState"})}function Rt({cooldownUntil:t,duration:e}={}){const n=Number(t);return Number.isFinite(n)&&n>0?n:Date.now()+Math.max(0,Number(e)||0)}function re(t,e){t.cooldownRafId&&cancelAnimationFrame(t.cooldownRafId),t.cooldownEndTime=Rt(e);function n(){if(!t.cooldownEndTime)return;const o=Math.max(0,t.cooldownEndTime-Date.now()),r=t.$cache?.statusText;if(r&&(r.textContent=`${(o/1e3).toFixed(1)}s`,r.className="nd-status-text nd-countdown"),o<=0){t.cooldownRafId=null,t.cooldownEndTime=0;return}t.cooldownRafId=requestAnimationFrame(n)}t.cooldownRafId=requestAnimationFrame(n)}function ae(t){const e=c.get(t);if(!e?.root)return;const{result:n,errorRow:o,error:r,time:i}=e.$cache,{result:d,state:b}=e,x=d.startTime?((Date.now()-d.startTime)/1e3).toFixed(1):"-";b===a.SUCCESS||b===a.PARTIAL?(n&&(n.textContent=`${d.success}/${d.total} 成功`,n.className=`nd-detail-value ${b===a.SUCCESS?"success":"warning"}`),o&&(o.style.display=b===a.PARTIAL?"flex":"none"),r&&b===a.PARTIAL&&(r.textContent=`${d.total-d.success} 张失败`)):b===a.ERROR&&(n&&(n.textContent=d.error?.label||tt.redrawFailed,n.className="nd-detail-value error"),o&&(o.style.display="flex"),r&&(r.textContent=d.error?.desc||"未知错误")),i&&(i.textContent=`${x}s`)}async function se(t){const e=c.get(t);if(!(!e||e.state!==a.IDLE))try{await vt({messageId:t,onStateChange:(n,o,r)=>{V(r,n,o)}})}catch(n){if(n.drawTaskReported)return;n instanceof xt||bt(n)?toastr?.info?.(n.message):(console.error(n),toastr?.error?.(n.message))}}async function ie(t){const e=it(t);try{await Et({cancel:()=>Ct(t,{target:e}),isCurrent:()=>F(e),getState:()=>c.get(A().chat.indexOf(e.message))?.state,setState:n=>_(A().chat.indexOf(e.message),n)})&&F(e)&&toastr?.info?.("正在中止"),F(e)&&await O(A().chat.indexOf(e.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(tt.cancelFailed)}}function le(t){const{messageId:e,root:n}=t;n.querySelector(".nd-btn-draw")?.addEventListener("click",i=>{i.stopPropagation(),v(se(e),{source:import.meta.url,operation:"callback"})}),n.querySelectorAll(".nd-btn-menu").forEach(i=>i.addEventListener("click",d=>{d.stopPropagation(),n.classList.remove("show-detail"),n.classList.contains("expanded")||(de(e),ce(e),ue(e)),n.classList.toggle("expanded")})),n.querySelector(".nd-layer-active")?.addEventListener("click",i=>{i.stopPropagation();const d=t.state;[a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING,a.BACKEND_LEGACY].includes(d)?v(ie(e),{source:import.meta.url,operation:"callback"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(d)&&(ae(e),n.classList.toggle("show-detail"))}),t.$cache.presetSelect?.addEventListener("change",async i=>{await Nt(i.target.value)}),t.$cache.sizeSelect?.addEventListener("change",async i=>{await At(i.target.value)});const o=Lt(t.$cache.maxImagesInput);t.$cache.autoToggle?.addEventListener("click",async()=>{await Dt()}),n.querySelector(".nd-settings-btn")?.addEventListener("click",i=>{i.stopPropagation(),n.classList.remove("expanded"),v(ht(),{source:import.meta.url,operation:"callback"})});const r=i=>{n.contains(i.target)||n.classList.remove("expanded","show-detail")};document.addEventListener("click",r,{passive:!0}),t._cleanup=()=>{o.destroy(),document.removeEventListener("click",r),t.autoResetTimer&&clearTimeout(t.autoResetTimer),t.autoResetTimer=null,t.cooldownRafId&&cancelAnimationFrame(t.cooldownRafId),t.cooldownRafId=null,t.cooldownEndTime=null}}function de(t){const e=c.get(t)?.$cache?.presetSelect;q(e)}function ce(t){const e=c.get(t)?.$cache?.sizeSelect;G(e)}function ue(t){Y(c.get(t)?.$cache?.maxImagesInput)}async function et(t,e,n){const o=await Gt(t,e);return o&&typeof n=="function"&&n(),o}async function Nt(t){return et(e=>{e.selectedParamsPresetId=t},"预设已切换",Ot)}async function At(t){return et(e=>{e.overrideSize=t},"尺寸已切换",Ne)}async function pe(t){const e=Ut(t),n=await et(o=>{o.overrideMaxImages=e},$t(e),st);return n||st(),n}async function Dt(){const t=h().mode==="auto"?"manual":"auto";return et(e=>{e.mode=t},t==="auto"?"自动配图已开启":"自动配图已关闭",Ae)}function at(t,e){if(c.has(e)){const r=c.get(e);if(r.root?.isConnected)return v(O(e),{source:import.meta.url,operation:"mountFloorPanel"}),r;r._cleanup?.(),c.delete(e)}ct();const n=te(e),o=ee(e);return n.root=o,Bt(e,o,{position:"right",id:`novel-draw-${e}`})?(ne(n),le(n),c.set(e,n),v(O(e),{source:import.meta.url,operation:"mountFloorPanel"}),n):null}function fe(){I||(I=new IntersectionObserver(t=>{const e=[];for(const n of t){if(!n.isIntersecting)continue;const o=n.target,r=Number(o.getAttribute("mesid"));B.has(r)&&(e.push({el:o,mid:r}),B.delete(r),I.unobserve(o))}e.length>0&&requestAnimationFrame(()=>{for(const{el:n,mid:o}of e)at(n,o)})},{rootMargin:"300px"}))}function ge(t,e,n={}){if(h().showFloorButton===!1)return null;const{force:o=!1}=n;if(ct(),c.has(e)){const i=c.get(e);if(i.root?.isConnected)return i;i._cleanup?.(),c.delete(e)}if(o)return at(t,e);const r=t.getBoundingClientRect();return r.top<window.innerHeight+500&&r.bottom>-500?at(t,e):(fe(),B.set(e,!0),I.observe(t),null)}function _e(t,e){I?.unobserve(t),B.delete(e);const n=c.get(e);!n||!t.contains(n.root)||(n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),lt(e,n.root),c.delete(e))}function V(t,e,n={}){let o=c.get(t);if(!o?.root?.isConnected){const r=document.querySelector(`.mes[mesid="${t}"]`);r&&(o=ge(r,t,{force:!0}))}o&&_(t,e,n),l&&t===W()&&(M=t,D(e,n))}function me(){try{const e=localStorage.getItem(St);if(e)return JSON.parse(e)}catch(e){console.warn({source:import.meta.url,operation:"getFloatingPosition"},e)}const t=document.getElementById("xiaobaix-debug-mini");if(t){const e=t.getBoundingClientRect();return{left:e.left,top:e.bottom+8}}return{left:window.innerWidth-110,top:window.innerHeight-80}}function be(){if(!l)return;const t=l.getBoundingClientRect();try{localStorage.setItem(St,JSON.stringify({left:Math.round(t.left),top:Math.round(t.top)}))}catch(e){console.warn({source:import.meta.url,operation:"saveFloatingPosition"},e)}}var xe=77,we=101;function J(){if(!l)return;const t=me(),e=g===a.IDLE?xe:we,n=l.offsetHeight||34;l.style.left=`${Math.max(0,Math.min(t.left,window.innerWidth-e))}px`,l.style.top=`${Math.max(0,Math.min(t.top,window.innerHeight-n))}px`}function Z(){H&&(cancelAnimationFrame(H),H=null),K=0}function ve(t){Z(),K=Rt(t);function e(){if(!K)return;const n=Math.max(0,K-Date.now()),o=p.statusText;if(o&&(o.textContent=`${(n/1e3).toFixed(1)}s`,o.className="nd-status-text nd-countdown"),n<=0){Z();return}H=requestAnimationFrame(e)}H=requestAnimationFrame(e)}function D(t,e={}){if(!l)return;const n=g===a.IDLE;g=t,n!==(t===a.IDLE)&&J(),S&&(clearTimeout(S),S=null),t!==a.COOLDOWN&&Z(),l.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:o,statusText:r}=p;if(!(!o||!r))switch(r.className="nd-status-text",t){case a.IDLE:M=null,u={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:l.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="↥",o.className="nd-status-icon nd-spin",r.textContent=f.submitting;break;case a.ACCEPTED:l.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent=yt(e),o.className="nd-status-icon nd-spin",r.textContent=Tt(e);break;case a.UNCERTAIN:l.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=f.uncertain;break;case a.QUEUED:l.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="⌛",o.className="nd-status-icon",r.textContent=f.queued;break;case a.LLM:l.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=wt(e);break;case a.GEN:l.classList.add("working"),o.textContent="🎨",o.className="nd-status-icon nd-spin",r.textContent=`${e.current||0}/${e.total||0}`,u.total=e.total||0;break;case a.COOLDOWN:l.classList.add("cooldown"),o.textContent="⏳",o.className="nd-status-icon nd-spin",ve(e);break;case a.RECONNECTING:l.classList.add("working"),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=f.reconnecting;break;case a.CANCELLING:l.classList.add("working"),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=f.cancelling;break;case a.BACKEND_LEGACY:l.classList.add("working"),o.textContent="↪",o.className="nd-status-icon",r.textContent=f.legacy;break;case a.SUCCESS:l.classList.add("success"),o.textContent="✓",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,u.success=e.success,u.total=e.total,S=setTimeout(()=>D(a.IDLE),U);break;case a.PARTIAL:l.classList.add("partial"),o.textContent="⚠",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,u.success=e.success,u.total=e.total,S=setTimeout(()=>D(a.IDLE),U);break;case a.ERROR:l.classList.add("error"),o.textContent="✗",o.className="nd-status-icon",r.textContent=e.unknown?f.unknown:f.error,u.error=e.error,S=setTimeout(()=>D(a.IDLE),U);break}}function he(){const{detailResult:t,detailErrorRow:e,detailError:n,detailTime:o}=p;if(!t)return;const r=u.startTime?((Date.now()-u.startTime)/1e3).toFixed(1):"-";g===a.SUCCESS||g===a.PARTIAL?(t.textContent=`${u.success}/${u.total} 成功`,t.className=`nd-detail-value ${g===a.SUCCESS?"success":"warning"}`,e.style.display=g===a.PARTIAL?"flex":"none",g===a.PARTIAL&&(n.textContent=`${u.total-u.success} 张失败`)):g===a.ERROR&&(t.textContent=u.error?.label||tt.redrawFailed,t.className="nd-detail-value error",e.style.display="flex",n.textContent=u.error?.desc||"未知错误"),o.textContent=`${r}s`}function Ce(t){if(t.button===0){m={startX:t.clientX,startY:t.clientY,startLeft:l.getBoundingClientRect().left,startTop:l.getBoundingClientRect().top,pointerId:t.pointerId,moved:!1,originalTarget:t.target};try{t.currentTarget.setPointerCapture(t.pointerId)}catch(e){console.warn({source:import.meta.url,operation:"onFloatingPointerDown"},e)}t.preventDefault()}}function ye(t){if(!m||m.pointerId!==t.pointerId)return;const e=t.clientX-m.startX,n=t.clientY-m.startY;if(!m.moved&&(Math.abs(e)>3||Math.abs(n)>3)&&(m.moved=!0),m.moved){const o=l.offsetWidth||88,r=l.offsetHeight||36;l.style.left=`${Math.max(0,Math.min(m.startLeft+e,window.innerWidth-o))}px`,l.style.top=`${Math.max(0,Math.min(m.startTop+n,window.innerHeight-r))}px`}t.preventDefault()}function mt(t){if(!m||m.pointerId!==t.pointerId)return;const{moved:e,originalTarget:n}=m;try{t.currentTarget.releasePointerCapture(t.pointerId)}catch(o){console.warn({source:import.meta.url,operation:"onFloatingPointerUp"},o)}m=null,e?be():Ee(n)}function Ee(t){t.closest(".nd-btn-draw")?v(Te(),{source:import.meta.url,operation:"routeFloatingClick"}):t.closest(".nd-btn-menu")?(l.classList.remove("show-detail"),l.classList.contains("expanded")||(Ie(),ke(),Le()),l.classList.toggle("expanded")):t.closest(".nd-layer-active")&&([a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING,a.BACKEND_LEGACY].includes(g)?v(Se(),{source:import.meta.url,operation:"routeFloatingClick"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(g)&&(he(),l.classList.toggle("show-detail")))}async function Te(){if(g!==a.IDLE)return;const t=W();if(t<0){toastr?.warning?.("没有可配图的AI消息");return}M=t;try{await vt({messageId:t,onStateChange:(e,n,o)=>{V(o,e,n)}})}catch(e){if(e.drawTaskReported)return;e instanceof xt||bt(e)?toastr?.info?.(e.message):(console.error(e),toastr?.error?.(e.message))}}async function Se(){const t=M,e=it(t);try{t>=0&&await Et({cancel:()=>Ct(t,{target:e}),isCurrent:()=>F(e)&&M===A().chat.indexOf(e.message),getState:()=>g,setState:D})&&F(e)&&toastr?.info?.("正在中止"),t>=0&&F(e)&&await O(A().chat.indexOf(e.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(tt.cancelFailed)}}function Ie(){q(p.presetSelect)}function ke(){G(p.sizeSelect)}function Le(){Y(p.maxImagesInput)}function Re(){l&&(p={capsule:l.querySelector(".nd-capsule"),statusIcon:l.querySelector(".nd-status-icon"),statusText:l.querySelector(".nd-status-text"),detailResult:l.querySelector(".nd-result"),detailErrorRow:l.querySelector(".nd-error-row"),detailError:l.querySelector(".nd-error"),detailTime:l.querySelector(".nd-time"),presetSelect:l.querySelector(".nd-preset-select"),sizeSelect:l.querySelector(".nd-size-select"),maxImagesInput:l.querySelector(`.${dt}`),autoToggle:l.querySelector(".nd-auto-toggle")})}function Pt(t){l&&!l.contains(t.target)&&l.classList.remove("expanded","show-detail")}function Ft(){if(l)return;const t=h();if(t.showFloatingButton!==!0)return;ct();const e=t.mode==="auto";l=document.createElement("div"),l.className=`nd-float nd-floating-global${e?" auto-on":""}`,l.id="nd-floating-global";const n=s("div","nd-detail"),o=s("div","nd-detail-row");o.append(s("span","nd-detail-icon","📊"),s("span","nd-detail-label","结果"),s("span","nd-detail-value nd-result","-"));const r=s("div","nd-detail-row nd-error-row");r.style.display="none",r.append(s("span","nd-detail-icon","💡"),s("span","nd-detail-label","原因"),s("span","nd-detail-value error nd-error","-"));const i=s("div","nd-detail-row");i.append(s("span","nd-detail-icon","⏱"),s("span","nd-detail-label","耗时"),s("span","nd-detail-value nd-time","-")),n.append(o,r,i);const d=s("div","nd-menu"),b=s("div","nd-card"),x=s("div","nd-row");x.appendChild(s("span","nd-label","预设"));const P=s("select","nd-select nd-preset-select");q(P),x.appendChild(P);const $=s("div","nd-inner-sep"),k=s("div","nd-row");k.appendChild(s("span","nd-label","尺寸"));const L=s("select","nd-select size nd-size-select");G(L),k.appendChild(L),b.append(x,$,k,kt());const C=s("div","nd-controls"),T=s("div",`nd-auto${e?" on":""} nd-auto-toggle`);T.append(s("span","nd-dot"),s("span","nd-auto-text","自动配图"));const y=s("button","nd-gear nd-settings-btn","⚙");y.title="打开设置",C.append(T,y),d.append(b,C);const E=s("div","nd-capsule"),w=s("div","nd-inner"),X=s("div","nd-layer nd-layer-idle"),R=s("button","nd-btn-draw");R.title="点击为最后一条AI消息生成配图",R.appendChild(s("span","","🎨")),R.appendChild(s("span","nd-auto-dot"));const j=s("div","nd-sep"),z=s("button","nd-btn-menu");z.title="展开菜单",z.appendChild(s("span","nd-arrow","▲")),X.append(R,j,z);const Q=s("div","nd-layer nd-layer-active");Q.append(s("span","nd-status-icon","⏳"),s("span","nd-status-text",f.analysis)),w.append(X,Q),E.append(w,It("▲")),l.append(n,d,E),document.body.appendChild(l),Re(),J();const N=p.capsule;N&&(N.addEventListener("pointerdown",Ce,{passive:!1}),N.addEventListener("pointermove",ye,{passive:!1}),N.addEventListener("pointerup",mt,{passive:!1}),N.addEventListener("pointercancel",mt,{passive:!1})),p.presetSelect?.addEventListener("change",async nt=>{await Nt(nt.target.value)}),p.sizeSelect?.addEventListener("change",async nt=>{await At(nt.target.value)}),p.maxImagesBinding=Lt(p.maxImagesInput),p.autoToggle?.addEventListener("click",async()=>{await Dt()}),l.querySelector(".nd-settings-btn")?.addEventListener("click",()=>{l.classList.remove("expanded"),v(ht(),{source:import.meta.url,operation:"callback"})}),document.addEventListener("click",Pt,{passive:!0}),window.addEventListener("resize",J);const ut=W();ut>=0&&v(O(ut),{source:import.meta.url,operation:"createFloatingButton"})}function Mt(){p.maxImagesBinding?.destroy(),Z(),S&&(clearTimeout(S),S=null),window.removeEventListener("resize",J),document.removeEventListener("click",Pt),l?.remove(),l=null,m=null,g=a.IDLE,p={}}function Ot(){c.forEach(t=>{q(t.$cache?.presetSelect)}),q(p.presetSelect),st()}function Ne(){c.forEach(t=>{G(t.$cache?.sizeSelect)}),G(p.sizeSelect)}function st(){c.forEach(t=>{Y(t.$cache?.maxImagesInput)}),Y(p.maxImagesInput)}function Ae(){const t=h().mode==="auto";c.forEach(e=>{e.root&&(e.root.classList.toggle("auto-on",t),e.$cache.autoToggle?.classList.toggle("on",t))}),l&&(l.classList.toggle("auto-on",t),p.autoToggle?.classList.toggle("on",t))}function Be(){Ot()}function qe(t,e){e&&!l?Ft():!e&&l&&Mt(),t||(c.forEach((n,o)=>{n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),n.root&&lt(o,n.root)}),c.clear(),B.clear(),I?.disconnect(),I=null)}function Ge(){const t=h();rt??=zt(oe),t.showFloatingButton===!0&&Ft()}function Ye(){rt?.(),rt=null,c.forEach((t,e)=>{t.autoResetTimer&&clearTimeout(t.autoResetTimer),t.cooldownRafId&&cancelAnimationFrame(t.cooldownRafId),t._cleanup?.(),t.root&&lt(e,t.root)}),c.clear(),B.clear(),I?.disconnect(),I=null,Mt()}export{a as FloatState,Vt as SIZE_OPTIONS,Ft as createFloatingButton,Mt as destroyFloatingButton,Ye as destroyFloatingPanel,ge as ensureNovelDrawPanel,Ge as initFloatingPanel,Ue as refreshDrawRunUiState,Be as refreshPresetSelect,Be as refreshPresetSelectAll,_e as releaseNovelDrawPanel,D as setFloatingState,V as setStateForMessage,st as updateAllMaxImagesInputs,Ot as updateAllPresetSelects,Ne as updateAllSizeSelects,Ae as updateAutoModeUI,qe as updateButtonVisibility};
