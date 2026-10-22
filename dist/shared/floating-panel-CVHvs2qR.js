import{n as v}from"./async-errors-C4kfchr9.js";import{Y as tt}from"./gallery-cache-Cf9Zw4uO.js";import{B as Ot,H as gt,V as F,ct as Mt,d as mt,lt as $t,n as at,rn as zt,t as Ut,z as st}from"./message-toolbar-D6dY6tqo.js";import{Ct as bt,xt as f}from"./draw-common-C5fWPeGE.js";import{a as xt,i as W,l as wt,o as nt,s as E,t as vt,u as ht}from"./novel-draw-CEElmasS.js";import{a as _t,c as Ct,i as Bt,l as qt,n as yt,o as ct,r as ut,s as Et,t as Tt,u as Gt}from"./draw-run-ui-state-DoGaN1tX.js";import{getContext as A}from"../../../../../extensions.js";var St="xb_novel_float_pos",_=8e3,Yt="novelai",a={IDLE:"idle",SUBMITTING:"submitting",ACCEPTED:"accepted",UNCERTAIN:"uncertain",QUEUED:"queued",LLM:"llm",GEN:"gen",COOLDOWN:"cooldown",RECONNECTING:"reconnecting",CANCELLING:"cancelling",BACKEND_LEGACY:"backend_legacy",SUCCESS:"success",PARTIAL:"partial",ERROR:"error"},Wt=[{value:"default",label:"跟随预设",width:null,height:null},{value:"832x1216",label:"832 × 1216  竖图",width:832,height:1216},{value:"1216x832",label:"1216 × 832  横图",width:1216,height:832},{value:"1024x1024",label:"1024 × 1024  方图",width:1024,height:1024},{value:"768x1280",label:"768 x 1280  大竖",width:768,height:1280},{value:"1280x768",label:"1280 x 768  大横",width:1280,height:768}],c=new Map,q=new Map,k=null,l=null,m=null,g=a.IDLE,O=null,u={success:0,total:0,error:null,startTime:0},S=null,Q=null,K=0,p={},pt=!1,ot=null,Ht=`
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
${qt}

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
`;function it(){if(pt)return;pt=!0;const t=document.createElement("style");t.id="nd-float-styles",t.textContent=Ht,document.head.appendChild(t)}function s(t,e,n){const o=document.createElement(t);return e&&(o.className=e),n!==void 0&&(o.textContent=n),o}function kt(t){const e=s("button","nd-btn-menu nd-btn-menu-persist");return e.title="展开菜单",e.appendChild(s("span","nd-arrow",t)),e}function G(t){if(!t)return;const e=E(),n=e.paramsPresets||[],o=e.selectedParamsPresetId;t.replaceChildren(),n.forEach(r=>{const i=document.createElement("option");i.value=r.id,i.textContent=r.name||"未命名",r.id===o&&(i.selected=!0),t.appendChild(i)})}function Y(t){if(!t)return;const e=E().overrideSize||"default";t.replaceChildren(),Wt.forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.label,n.value===e&&(o.selected=!0),t.appendChild(o)})}var M=Gt({getOverride:()=>E().overrideMaxImages,getPresetMaxImages:()=>{const t=E();return zt(t.paramsPresets,t.selectedParamsPresetId)},persistOverride:(t,{okText:e})=>ht(n=>{n.overrideMaxImages=t},e),listInputs:()=>[...c.values()].map(t=>t.$cache?.maxImagesInput).concat(p.maxImagesInput),notify:t=>globalThis.toastr?.warning?.(t)});function Qt(t){return{messageId:t,root:null,state:a.IDLE,result:{success:0,total:0,error:null,startTime:0},autoResetTimer:null,cooldownRafId:null,cooldownEndTime:0,$cache:{},_cleanup:null}}function Xt(t){const e=E().mode==="auto",n=document.createElement("div");n.className=`nd-float${e?" auto-on":""}`,n.dataset.messageId=t;const o=s("div","nd-capsule"),r=s("div","nd-inner"),i=s("div","nd-layer nd-layer-idle"),d=s("button","nd-btn-draw");d.title="点击生成配图",d.appendChild(s("span","","🎨")),d.appendChild(s("span","nd-auto-dot"));const b=s("div","nd-sep"),x=s("button","nd-btn-menu");x.title="展开菜单",x.appendChild(s("span","nd-arrow","▼")),i.append(d,b,x);const P=s("div","nd-layer nd-layer-active");P.append(s("span","nd-status-icon","⏳"),s("span","nd-status-text",f.analysis)),r.append(i,P),o.append(r,kt("▼"));const z=s("div","nd-detail"),I=s("div","nd-detail-row");I.append(s("span","nd-detail-icon","📊"),s("span","nd-detail-label","结果"),s("span","nd-detail-value nd-result","-"));const L=s("div","nd-detail-row nd-error-row");L.style.display="none",L.append(s("span","nd-detail-icon","💡"),s("span","nd-detail-label","原因"),s("span","nd-detail-value error nd-error","-"));const h=s("div","nd-detail-row");h.append(s("span","nd-detail-icon","⏱"),s("span","nd-detail-label","耗时"),s("span","nd-detail-value nd-time","-")),z.append(I,L,h);const T=s("div","nd-menu"),C=s("div","nd-card"),y=s("div","nd-row");y.appendChild(s("span","nd-label","预设"));const w=s("select","nd-select nd-preset-select");G(w),y.appendChild(w);const X=s("div","nd-inner-sep"),R=s("div","nd-row");R.appendChild(s("span","nd-label","尺寸"));const j=s("select","nd-select size nd-size-select");Y(j),R.appendChild(j),C.append(y,X,R,M.createRow());const U=s("div","nd-controls"),H=s("div",`nd-auto${e?" on":""} nd-auto-toggle`);H.append(s("span","nd-dot"),s("span","nd-auto-text","自动配图"));const N=s("button","nd-gear nd-settings-btn","⚙");return N.title="打开设置",U.append(H,N),T.append(C,U),n.append(o,z,T),n}function jt(t){const e=t.root;e&&(t.$cache={statusIcon:e.querySelector(".nd-status-icon"),statusText:e.querySelector(".nd-status-text"),result:e.querySelector(".nd-result"),errorRow:e.querySelector(".nd-error-row"),error:e.querySelector(".nd-error"),time:e.querySelector(".nd-time"),presetSelect:e.querySelector(".nd-preset-select"),sizeSelect:e.querySelector(".nd-size-select"),maxImagesInput:e.querySelector(`.${Ct}`),autoToggle:e.querySelector(".nd-auto-toggle")})}function B(t,e,n={}){const o=c.get(t);if(!o?.root)return;const r=o.root;o.state=e,o.autoResetTimer&&(clearTimeout(o.autoResetTimer),o.autoResetTimer=null),e!==a.COOLDOWN&&o.cooldownRafId&&(cancelAnimationFrame(o.cooldownRafId),o.cooldownRafId=null,o.cooldownEndTime=0),r.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:i,statusText:d}=o.$cache;switch(d&&(d.className="nd-status-text"),e){case a.IDLE:o.result={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="↥",i.className="nd-status-icon nd-spin"),d&&(d.textContent=f.submitting);break;case a.ACCEPTED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent=yt(n),i.className="nd-status-icon nd-spin"),d&&(d.textContent=Tt(n));break;case a.UNCERTAIN:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="↻",i.className="nd-status-icon nd-spin"),d&&(d.textContent=f.uncertain);break;case a.QUEUED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="⌛",i.className="nd-status-icon"),d&&(d.textContent=f.queued),o.result.total=n.total||o.result.total||0;break;case a.LLM:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),d&&(d.textContent=bt(n));break;case a.GEN:r.classList.add("working"),i&&(i.textContent="🎨",i.className="nd-status-icon nd-spin"),d&&(d.textContent=`${n.current||0}/${n.total||0}`),o.result.total=n.total||0;break;case a.COOLDOWN:r.classList.add("cooldown"),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),Vt(o,n);break;case a.RECONNECTING:r.classList.add("working"),i&&(i.textContent="↻",i.className="nd-status-icon nd-spin"),d&&(d.textContent=f.reconnecting);break;case a.CANCELLING:r.classList.add("working"),i&&(i.textContent="⏳",i.className="nd-status-icon nd-spin"),d&&(d.textContent=f.cancelling);break;case a.BACKEND_LEGACY:r.classList.add("working"),i&&(i.textContent="↪",i.className="nd-status-icon"),d&&(d.textContent=f.legacy);break;case a.SUCCESS:r.classList.add("success"),i&&(i.textContent="✓",i.className="nd-status-icon"),d&&(d.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>B(t,a.IDLE),_);break;case a.PARTIAL:r.classList.add("partial"),i&&(i.textContent="⚠",i.className="nd-status-icon"),d&&(d.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>B(t,a.IDLE),_);break;case a.ERROR:r.classList.add("error"),i&&(i.textContent="✗",i.className="nd-status-icon"),d&&(d.textContent=n.unknown?f.unknown:f.error),o.result.error=n.error,o.autoResetTimer=setTimeout(()=>B(t,a.IDLE),_);break}}async function $(t,e={}){const n=nt(t);if(n){V(t,n.state,n.data);return}const o=st(t),r=await Ot(t).catch(()=>null);if(!r||!F(o))return;t=A().chat.indexOf(o.message);const i=nt(t);if(i){V(t,i.state,i.data);return}const d=A(),b=String(d?.chatId||""),x=d?.chat?.[Number(t)];if(!b||!x)return;const P=Number.isInteger(x.swipe_id)?x.swipe_id:0,z=Number.isSafeInteger(r.swipeIndex)?r.swipeIndex:P,I=r.provider||e?.provider||Yt,L=r.runId||e?.runId||"",h={chatId:b,messageId:t,swipeIndex:z,provider:I,runId:L},T=Bt({detail:e,pending:r.pending,...h}),C=_t(T,r,h),y=c.get(t);if(y){const w=ct({currentState:y.state,pending:r.pending,detail:C,...h});(w!==y.state||w===a.ACCEPTED&&ut(T))&&B(t,w,C)}if(l&&Number(t)===W()){const w=ct({currentState:g,pending:r.pending,detail:C,...h});r.pending&&(O=Number(t)),(w!==g||w===a.ACCEPTED&&ut(T))&&D(w,C)}}function Kt(t={}){const e=Mt(t,A());if(!e)return;const n=W();(c.has(e.messageId)||l&&e.messageId===n)&&v($(e.messageId,t),{source:import.meta.url,operation:"syncDrawRunActivity"})}function De(){const t=W();if(l){const e=t>=0?nt(t):null;e?(O=t,D(e.state,e.data)):D(a.IDLE)}t>=0&&v($(t),{source:import.meta.url,operation:"refreshDrawRunUiState"})}function It({cooldownUntil:t,duration:e}={}){const n=Number(t);return Number.isFinite(n)&&n>0?n:Date.now()+Math.max(0,Number(e)||0)}function Vt(t,e){t.cooldownRafId&&cancelAnimationFrame(t.cooldownRafId),t.cooldownEndTime=It(e);function n(){if(!t.cooldownEndTime)return;const o=Math.max(0,t.cooldownEndTime-Date.now()),r=t.$cache?.statusText;if(r&&(r.textContent=`${(o/1e3).toFixed(1)}s`,r.className="nd-status-text nd-countdown"),o<=0){t.cooldownRafId=null,t.cooldownEndTime=0;return}t.cooldownRafId=requestAnimationFrame(n)}t.cooldownRafId=requestAnimationFrame(n)}function Jt(t){const e=c.get(t);if(!e?.root)return;const{result:n,errorRow:o,error:r,time:i}=e.$cache,{result:d,state:b}=e,x=d.startTime?((Date.now()-d.startTime)/1e3).toFixed(1):"-";b===a.SUCCESS||b===a.PARTIAL?(n&&(n.textContent=`${d.success}/${d.total} 成功`,n.className=`nd-detail-value ${b===a.SUCCESS?"success":"warning"}`),o&&(o.style.display=b===a.PARTIAL?"flex":"none"),r&&b===a.PARTIAL&&(r.textContent=`${d.total-d.success} 张失败`)):b===a.ERROR&&(n&&(n.textContent=d.error?.label||tt.redrawFailed,n.className="nd-detail-value error"),o&&(o.style.display="flex"),r&&(r.textContent=d.error?.desc||"未知错误")),i&&(i.textContent=`${x}s`)}async function Zt(t){const e=c.get(t);if(!(!e||e.state!==a.IDLE))try{await xt({messageId:t,onStateChange:(n,o,r)=>{V(r,n,o)}})}catch(n){if(n.drawTaskReported)return;n instanceof mt||gt(n)?toastr?.info?.(n.message):(console.error(n),toastr?.error?.(n.message))}}async function te(t){const e=st(t);try{await Et({cancel:()=>vt(t,{target:e}),isCurrent:()=>F(e),getState:()=>c.get(A().chat.indexOf(e.message))?.state,setState:n=>B(A().chat.indexOf(e.message),n)})&&F(e)&&toastr?.info?.("正在中止"),F(e)&&await $(A().chat.indexOf(e.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(tt.cancelFailed)}}function ee(t){const{messageId:e,root:n}=t;n.querySelector(".nd-btn-draw")?.addEventListener("click",i=>{i.stopPropagation(),v(Zt(e),{source:import.meta.url,operation:"callback"})}),n.querySelectorAll(".nd-btn-menu").forEach(i=>i.addEventListener("click",d=>{d.stopPropagation(),n.classList.remove("show-detail"),n.classList.contains("expanded")||(ne(e),oe(e),re(e)),n.classList.toggle("expanded")})),n.querySelector(".nd-layer-active")?.addEventListener("click",i=>{i.stopPropagation();const d=t.state;[a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING,a.BACKEND_LEGACY].includes(d)?v(te(e),{source:import.meta.url,operation:"callback"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(d)&&(Jt(e),n.classList.toggle("show-detail"))}),t.$cache.presetSelect?.addEventListener("change",async i=>{await Lt(i.target.value)}),t.$cache.sizeSelect?.addEventListener("change",async i=>{await Rt(i.target.value)});const o=M.bind(t.$cache.maxImagesInput);t.$cache.autoToggle?.addEventListener("click",async()=>{await Nt()}),n.querySelector(".nd-settings-btn")?.addEventListener("click",i=>{i.stopPropagation(),n.classList.remove("expanded"),v(wt(),{source:import.meta.url,operation:"callback"})});const r=i=>{n.contains(i.target)||n.classList.remove("expanded","show-detail")};document.addEventListener("click",r,{passive:!0}),t._cleanup=()=>{o.destroy(),document.removeEventListener("click",r),t.autoResetTimer&&clearTimeout(t.autoResetTimer),t.autoResetTimer=null,t.cooldownRafId&&cancelAnimationFrame(t.cooldownRafId),t.cooldownRafId=null,t.cooldownEndTime=null}}function ne(t){const e=c.get(t)?.$cache?.presetSelect;G(e)}function oe(t){const e=c.get(t)?.$cache?.sizeSelect;Y(e)}function re(t){M.fill(c.get(t)?.$cache?.maxImagesInput)}async function lt(t,e,n){const o=await ht(t,e);return o&&typeof n=="function"&&n(),o}async function Lt(t){return lt(e=>{e.selectedParamsPresetId=t},"预设已切换",Ft)}async function Rt(t){return lt(e=>{e.overrideSize=t},"尺寸已切换",ye)}async function Nt(){const t=E().mode==="auto"?"manual":"auto";return lt(e=>{e.mode=t},t==="auto"?"自动配图已开启":"自动配图已关闭",Te)}function rt(t,e){if(c.has(e)){const r=c.get(e);if(r.root?.isConnected)return v($(e),{source:import.meta.url,operation:"mountFloorPanel"}),r;r._cleanup?.(),c.delete(e)}it();const n=Qt(e),o=Xt(e);return n.root=o,Ut(e,o,{position:"right",id:`novel-draw-${e}`})?(jt(n),ee(n),c.set(e,n),v($(e),{source:import.meta.url,operation:"mountFloorPanel"}),n):null}function ae(){k||(k=new IntersectionObserver(t=>{const e=[];for(const n of t){if(!n.isIntersecting)continue;const o=n.target,r=Number(o.getAttribute("mesid"));q.has(r)&&(e.push({el:o,mid:r}),q.delete(r),k.unobserve(o))}e.length>0&&requestAnimationFrame(()=>{for(const{el:n,mid:o}of e)rt(n,o)})},{rootMargin:"300px"}))}function se(t,e,n={}){if(E().showFloorButton===!1)return null;const{force:o=!1}=n;if(it(),c.has(e)){const i=c.get(e);if(i.root?.isConnected)return i;i._cleanup?.(),c.delete(e)}if(o)return rt(t,e);const r=t.getBoundingClientRect();return r.top<window.innerHeight+500&&r.bottom>-500?rt(t,e):(ae(),q.set(e,!0),k.observe(t),null)}function Pe(t,e){k?.unobserve(t),q.delete(e);const n=c.get(e);!n||!t.contains(n.root)||(n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),at(e,n.root),c.delete(e))}function V(t,e,n={}){let o=c.get(t);if(!o?.root?.isConnected){const r=document.querySelector(`.mes[mesid="${t}"]`);r&&(o=se(r,t,{force:!0}))}o&&B(t,e,n),l&&t===W()&&(O=t,D(e,n))}function ie(){try{const e=localStorage.getItem(St);if(e)return JSON.parse(e)}catch(e){console.warn({source:import.meta.url,operation:"getFloatingPosition"},e)}const t=document.getElementById("xiaobaix-debug-mini");if(t){const e=t.getBoundingClientRect();return{left:e.left,top:e.bottom+8}}return{left:window.innerWidth-110,top:window.innerHeight-80}}function le(){if(!l)return;const t=l.getBoundingClientRect();try{localStorage.setItem(St,JSON.stringify({left:Math.round(t.left),top:Math.round(t.top)}))}catch(e){console.warn({source:import.meta.url,operation:"saveFloatingPosition"},e)}}var de=77,ce=101;function J(){if(!l)return;const t=ie(),e=g===a.IDLE?de:ce,n=l.offsetHeight||34;l.style.left=`${Math.max(0,Math.min(t.left,window.innerWidth-e))}px`,l.style.top=`${Math.max(0,Math.min(t.top,window.innerHeight-n))}px`}function Z(){Q&&(cancelAnimationFrame(Q),Q=null),K=0}function ue(t){Z(),K=It(t);function e(){if(!K)return;const n=Math.max(0,K-Date.now()),o=p.statusText;if(o&&(o.textContent=`${(n/1e3).toFixed(1)}s`,o.className="nd-status-text nd-countdown"),n<=0){Z();return}Q=requestAnimationFrame(e)}Q=requestAnimationFrame(e)}function D(t,e={}){if(!l)return;const n=g===a.IDLE;g=t,n!==(t===a.IDLE)&&J(),S&&(clearTimeout(S),S=null),t!==a.COOLDOWN&&Z(),l.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:o,statusText:r}=p;if(!(!o||!r))switch(r.className="nd-status-text",t){case a.IDLE:O=null,u={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:l.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="↥",o.className="nd-status-icon nd-spin",r.textContent=f.submitting;break;case a.ACCEPTED:l.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent=yt(e),o.className="nd-status-icon nd-spin",r.textContent=Tt(e);break;case a.UNCERTAIN:l.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=f.uncertain;break;case a.QUEUED:l.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="⌛",o.className="nd-status-icon",r.textContent=f.queued;break;case a.LLM:l.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=bt(e);break;case a.GEN:l.classList.add("working"),o.textContent="🎨",o.className="nd-status-icon nd-spin",r.textContent=`${e.current||0}/${e.total||0}`,u.total=e.total||0;break;case a.COOLDOWN:l.classList.add("cooldown"),o.textContent="⏳",o.className="nd-status-icon nd-spin",ue(e);break;case a.RECONNECTING:l.classList.add("working"),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=f.reconnecting;break;case a.CANCELLING:l.classList.add("working"),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=f.cancelling;break;case a.BACKEND_LEGACY:l.classList.add("working"),o.textContent="↪",o.className="nd-status-icon",r.textContent=f.legacy;break;case a.SUCCESS:l.classList.add("success"),o.textContent="✓",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,u.success=e.success,u.total=e.total,S=setTimeout(()=>D(a.IDLE),_);break;case a.PARTIAL:l.classList.add("partial"),o.textContent="⚠",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,u.success=e.success,u.total=e.total,S=setTimeout(()=>D(a.IDLE),_);break;case a.ERROR:l.classList.add("error"),o.textContent="✗",o.className="nd-status-icon",r.textContent=e.unknown?f.unknown:f.error,u.error=e.error,S=setTimeout(()=>D(a.IDLE),_);break}}function pe(){const{detailResult:t,detailErrorRow:e,detailError:n,detailTime:o}=p;if(!t)return;const r=u.startTime?((Date.now()-u.startTime)/1e3).toFixed(1):"-";g===a.SUCCESS||g===a.PARTIAL?(t.textContent=`${u.success}/${u.total} 成功`,t.className=`nd-detail-value ${g===a.SUCCESS?"success":"warning"}`,e.style.display=g===a.PARTIAL?"flex":"none",g===a.PARTIAL&&(n.textContent=`${u.total-u.success} 张失败`)):g===a.ERROR&&(t.textContent=u.error?.label||tt.redrawFailed,t.className="nd-detail-value error",e.style.display="flex",n.textContent=u.error?.desc||"未知错误"),o.textContent=`${r}s`}function fe(t){if(t.button===0){m={startX:t.clientX,startY:t.clientY,startLeft:l.getBoundingClientRect().left,startTop:l.getBoundingClientRect().top,pointerId:t.pointerId,moved:!1,originalTarget:t.target};try{t.currentTarget.setPointerCapture(t.pointerId)}catch(e){console.warn({source:import.meta.url,operation:"onFloatingPointerDown"},e)}t.preventDefault()}}function ge(t){if(!m||m.pointerId!==t.pointerId)return;const e=t.clientX-m.startX,n=t.clientY-m.startY;if(!m.moved&&(Math.abs(e)>3||Math.abs(n)>3)&&(m.moved=!0),m.moved){const o=l.offsetWidth||88,r=l.offsetHeight||36;l.style.left=`${Math.max(0,Math.min(m.startLeft+e,window.innerWidth-o))}px`,l.style.top=`${Math.max(0,Math.min(m.startTop+n,window.innerHeight-r))}px`}t.preventDefault()}function ft(t){if(!m||m.pointerId!==t.pointerId)return;const{moved:e,originalTarget:n}=m;try{t.currentTarget.releasePointerCapture(t.pointerId)}catch(o){console.warn({source:import.meta.url,operation:"onFloatingPointerUp"},o)}m=null,e?le():me(n)}function me(t){t.closest(".nd-btn-draw")?v(be(),{source:import.meta.url,operation:"routeFloatingClick"}):t.closest(".nd-btn-menu")?(l.classList.remove("show-detail"),l.classList.contains("expanded")||(we(),ve(),he()),l.classList.toggle("expanded")):t.closest(".nd-layer-active")&&([a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING,a.BACKEND_LEGACY].includes(g)?v(xe(),{source:import.meta.url,operation:"routeFloatingClick"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(g)&&(pe(),l.classList.toggle("show-detail")))}async function be(){if(g!==a.IDLE)return;const t=W();if(t<0){toastr?.warning?.("没有可配图的AI消息");return}O=t;try{await xt({messageId:t,onStateChange:(e,n,o)=>{V(o,e,n)}})}catch(e){if(e.drawTaskReported)return;e instanceof mt||gt(e)?toastr?.info?.(e.message):(console.error(e),toastr?.error?.(e.message))}}async function xe(){const t=O,e=st(t);try{t>=0&&await Et({cancel:()=>vt(t,{target:e}),isCurrent:()=>F(e)&&O===A().chat.indexOf(e.message),getState:()=>g,setState:D})&&F(e)&&toastr?.info?.("正在中止"),t>=0&&F(e)&&await $(A().chat.indexOf(e.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(tt.cancelFailed)}}function we(){G(p.presetSelect)}function ve(){Y(p.sizeSelect)}function he(){M.fill(p.maxImagesInput)}function Ce(){l&&(p={capsule:l.querySelector(".nd-capsule"),statusIcon:l.querySelector(".nd-status-icon"),statusText:l.querySelector(".nd-status-text"),detailResult:l.querySelector(".nd-result"),detailErrorRow:l.querySelector(".nd-error-row"),detailError:l.querySelector(".nd-error"),detailTime:l.querySelector(".nd-time"),presetSelect:l.querySelector(".nd-preset-select"),sizeSelect:l.querySelector(".nd-size-select"),maxImagesInput:l.querySelector(`.${Ct}`),autoToggle:l.querySelector(".nd-auto-toggle")})}function At(t){l&&!l.contains(t.target)&&l.classList.remove("expanded","show-detail")}function Dt(){if(l)return;const t=E();if(t.showFloatingButton!==!0)return;it();const e=t.mode==="auto";l=document.createElement("div"),l.className=`nd-float nd-floating-global${e?" auto-on":""}`,l.id="nd-floating-global";const n=s("div","nd-detail"),o=s("div","nd-detail-row");o.append(s("span","nd-detail-icon","📊"),s("span","nd-detail-label","结果"),s("span","nd-detail-value nd-result","-"));const r=s("div","nd-detail-row nd-error-row");r.style.display="none",r.append(s("span","nd-detail-icon","💡"),s("span","nd-detail-label","原因"),s("span","nd-detail-value error nd-error","-"));const i=s("div","nd-detail-row");i.append(s("span","nd-detail-icon","⏱"),s("span","nd-detail-label","耗时"),s("span","nd-detail-value nd-time","-")),n.append(o,r,i);const d=s("div","nd-menu"),b=s("div","nd-card"),x=s("div","nd-row");x.appendChild(s("span","nd-label","预设"));const P=s("select","nd-select nd-preset-select");G(P),x.appendChild(P);const z=s("div","nd-inner-sep"),I=s("div","nd-row");I.appendChild(s("span","nd-label","尺寸"));const L=s("select","nd-select size nd-size-select");Y(L),I.appendChild(L),b.append(x,z,I,M.createRow());const h=s("div","nd-controls"),T=s("div",`nd-auto${e?" on":""} nd-auto-toggle`);T.append(s("span","nd-dot"),s("span","nd-auto-text","自动配图"));const C=s("button","nd-gear nd-settings-btn","⚙");C.title="打开设置",h.append(T,C),d.append(b,h);const y=s("div","nd-capsule"),w=s("div","nd-inner"),X=s("div","nd-layer nd-layer-idle"),R=s("button","nd-btn-draw");R.title="点击为最后一条AI消息生成配图",R.appendChild(s("span","","🎨")),R.appendChild(s("span","nd-auto-dot"));const j=s("div","nd-sep"),U=s("button","nd-btn-menu");U.title="展开菜单",U.appendChild(s("span","nd-arrow","▲")),X.append(R,j,U);const H=s("div","nd-layer nd-layer-active");H.append(s("span","nd-status-icon","⏳"),s("span","nd-status-text",f.analysis)),w.append(X,H),y.append(w,kt("▲")),l.append(n,d,y),document.body.appendChild(l),Ce(),J();const N=p.capsule;N&&(N.addEventListener("pointerdown",fe,{passive:!1}),N.addEventListener("pointermove",ge,{passive:!1}),N.addEventListener("pointerup",ft,{passive:!1}),N.addEventListener("pointercancel",ft,{passive:!1})),p.presetSelect?.addEventListener("change",async et=>{await Lt(et.target.value)}),p.sizeSelect?.addEventListener("change",async et=>{await Rt(et.target.value)}),p.maxImagesBinding=M.bind(p.maxImagesInput),p.autoToggle?.addEventListener("click",async()=>{await Nt()}),l.querySelector(".nd-settings-btn")?.addEventListener("click",()=>{l.classList.remove("expanded"),v(wt(),{source:import.meta.url,operation:"callback"})}),document.addEventListener("click",At,{passive:!0}),window.addEventListener("resize",J);const dt=W();dt>=0&&v($(dt),{source:import.meta.url,operation:"createFloatingButton"})}function Pt(){p.maxImagesBinding?.destroy(),Z(),S&&(clearTimeout(S),S=null),window.removeEventListener("resize",J),document.removeEventListener("click",At),l?.remove(),l=null,m=null,g=a.IDLE,p={}}function Ft(){c.forEach(t=>{G(t.$cache?.presetSelect)}),G(p.presetSelect),Ee()}function ye(){c.forEach(t=>{Y(t.$cache?.sizeSelect)}),Y(p.sizeSelect)}function Ee(){M.updateAll()}function Te(){const t=E().mode==="auto";c.forEach(e=>{e.root&&(e.root.classList.toggle("auto-on",t),e.$cache.autoToggle?.classList.toggle("on",t))}),l&&(l.classList.toggle("auto-on",t),p.autoToggle?.classList.toggle("on",t))}function Fe(){Ft()}function Oe(t,e){e&&!l?Dt():!e&&l&&Pt(),t||(c.forEach((n,o)=>{n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),n.root&&at(o,n.root)}),c.clear(),q.clear(),k?.disconnect(),k=null)}function Me(){const t=E();ot??=$t(Kt),t.showFloatingButton===!0&&Dt()}function $e(){ot?.(),ot=null,c.forEach((t,e)=>{t.autoResetTimer&&clearTimeout(t.autoResetTimer),t.cooldownRafId&&cancelAnimationFrame(t.cooldownRafId),t._cleanup?.(),t.root&&at(e,t.root)}),c.clear(),q.clear(),k?.disconnect(),k=null,Pt()}export{a as FloatState,Wt as SIZE_OPTIONS,Dt as createFloatingButton,Pt as destroyFloatingButton,$e as destroyFloatingPanel,se as ensureNovelDrawPanel,Me as initFloatingPanel,De as refreshDrawRunUiState,Fe as refreshPresetSelect,Fe as refreshPresetSelectAll,Pe as releaseNovelDrawPanel,D as setFloatingState,V as setStateForMessage,Ee as updateAllMaxImagesInputs,Ft as updateAllPresetSelects,ye as updateAllSizeSelects,Te as updateAutoModeUI,Oe as updateButtonVisibility};
