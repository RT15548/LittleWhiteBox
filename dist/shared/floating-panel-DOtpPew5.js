import{n as w}from"./async-errors-C4kfchr9.js";import{Z as rt}from"./gallery-cache-DT1KHF9E.js";import{B as Wt,H as Ct,V as M,ct as jt,d as yt,lt as Ht,n as lt,rn as Xt,t as Qt,z as dt}from"./message-toolbar-ChQ8bj0Q.js";import{ft as f,mt as Et}from"./draw-common-Cmg3CqFl.js";import{a as Tt,i as H,l as kt,o as at,s as E,t as St,u as It}from"./novel-draw-D9-OHf-V.js";import{a as Vt,c as Lt,i as Kt,l as Jt,n as Rt,o as bt,r as vt,s as At,t as Nt,u as Zt}from"./draw-run-ui-state-CJyszYsT.js";import{getContext as A}from"../../../../../extensions.js";var Dt="xb_novel_float_pos",q=8e3,te="novelai",i={IDLE:"idle",SUBMITTING:"submitting",ACCEPTED:"accepted",UNCERTAIN:"uncertain",QUEUED:"queued",LLM:"llm",GEN:"gen",COOLDOWN:"cooldown",RECONNECTING:"reconnecting",CANCELLING:"cancelling",BACKEND_LEGACY:"backend_legacy",SUCCESS:"success",PARTIAL:"partial",ERROR:"error"},ee=[{value:"default",label:"跟随预设",width:null,height:null},{value:"auto",label:"AI 自动（按构图）",width:null,height:null},{value:"832x1216",label:"832 × 1216  竖图",width:832,height:1216},{value:"1216x832",label:"1216 × 832  横图",width:1216,height:832},{value:"1024x1024",label:"1024 × 1024  方图",width:1024,height:1024},{value:"768x1280",label:"768 x 1280  大竖",width:768,height:1280},{value:"1280x768",label:"1280 x 768  大横",width:1280,height:768}],c=new Map,Y=new Map,S=null,l=null,m=null,g=i.IDLE,$=null,u={success:0,total:0,error:null,startTime:0},k=null,V=null,tt=0,p={},xt=!1,it=null,Pt=74,Ft=98,ne=`
.nd-float.nd-novel {
    --nd-h: 34px;
    --nd-bg: var(--SmartThemeBlurTintColor, #25272c);
    --nd-bg-solid: var(--nd-bg);
    --nd-bg-hover: color-mix(in srgb, var(--nd-bg) 94%, var(--nd-text-primary));
    --nd-bg-active: color-mix(in srgb, var(--nd-text-primary) 8%, transparent);
    --nd-border: color-mix(in srgb, var(--nd-text-primary) 14%, transparent);
    --nd-border-hover: color-mix(in srgb, var(--nd-text-primary) 24%, transparent);
    --nd-border-subtle: var(--nd-border);
    --nd-text-primary: var(--SmartThemeBodyColor, #e3e5eb);
    --nd-text-secondary: color-mix(in srgb, var(--nd-text-primary) 80%, transparent);
    --nd-text-muted: color-mix(in srgb, var(--nd-text-primary) 65%, transparent);
    --nd-text-dim: var(--nd-text-muted);
    --nd-success: #3ecf8e;
    --nd-warning: #f0b429;
    --nd-error: #f87171;
    --nd-info: #60a5fa;
    --nd-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.18);
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
    box-sizing: border-box;
    width: ${Pt}px;
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
.nd-float.error .nd-capsule { width: ${Ft}px; }

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
.nd-novel .nd-btn-draw:hover { background: var(--nd-bg-active); }
.nd-btn-draw:active { transform: scale(0.92); }

.nd-novel button { margin: 0; padding: 0; box-shadow: none; }
.nd-novel button:focus-visible { outline: 2px solid var(--nd-text-secondary); outline-offset: -3px; }
.nd-novel .nd-icon { display: block; width: 16px; height: 16px; flex-shrink: 0; pointer-events: none; }
.nd-novel .nd-arrow { display: flex; align-items: center; justify-content: center; }
.nd-novel .nd-arrow .nd-icon { width: 12px; height: 12px; }

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

.nd-novel .nd-btn-menu {
    width: 24px;
    height: 100%;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--nd-text-secondary);
    font-size: 8px;
    opacity: 1;
    transition: opacity 0.25s, transform 0.25s;
}
.nd-float:hover .nd-btn-menu { opacity: 1; }
.nd-novel .nd-btn-menu:hover { background: var(--nd-bg-active); color: var(--nd-text-primary); }

/* 常驻菜单按钮：只在非空闲状态显示（空闲时由 idle 层自己的菜单按钮负责） */
.nd-novel .nd-btn-menu-persist {
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

.nd-novel .nd-layer-active {
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

/* 详情弹窗 - 向下展开（楼层按钮用） */
.nd-novel .nd-detail {
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
.nd-novel .nd-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 190px;
    background: var(--nd-bg-solid);
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

.nd-novel .nd-select {
    flex: 1;
    min-width: 0;
    background: var(--nd-bg-active);
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
.nd-novel .nd-select:hover { border-color: var(--nd-border-hover); }
.nd-novel .nd-select:focus { border-color: var(--nd-text-muted); }
.nd-novel .nd-select option { background: var(--nd-bg-solid); color: var(--nd-text-primary); text-align: left; }
.nd-select.size { font-family: "SF Mono", "Menlo", "Consolas", monospace; font-size: 11px; }
${Jt}
.nd-novel .nd-max-images-input { background: var(--nd-bg-active); color-scheme: normal; }
.nd-novel .nd-max-images-input:hover { border-color: var(--nd-border-hover); }
.nd-novel .nd-max-images-input:focus { border-color: var(--nd-text-muted); }

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
.nd-novel .nd-auto:hover { background: var(--nd-bg-active); }
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
.nd-novel .nd-gear:hover { background: var(--nd-bg-active); color: var(--nd-text-secondary); }

/* ═══════════════════════════════════════════════════════════════════════════
   悬浮按钮样式（固定定位，可拖拽）
   ═══════════════════════════════════════════════════════════════════════════ */
.nd-floating-global {
    position: fixed;
    z-index: 10000;
    user-select: none;
    will-change: transform;
    transition: transform 0.25s ease;
}

/* 貼邊半藏：膠囊一半移出螢幕；吸附時隱藏跳圖鈕 */
.nd-floating-global.nd-docked-left { transform: translateX(-50%); }
.nd-floating-global.nd-docked-right { transform: translateX(50%); }
.nd-floating-global.nd-novel[class*="nd-docked"] .nd-img-jump { display: none; }

.nd-floating-global.nd-novel .nd-capsule {
    background: var(--nd-bg-solid);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
    touch-action: none;
    cursor: grab;
}

/* 跳圖上下鈕：絕對定位在膠囊外，不影響膠囊尺寸與拖曳 */
.nd-floating-global.nd-novel .nd-img-jump {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 34px;
    height: 26px;
    border: none;
    border-radius: 11px;
    background: transparent;
    color: var(--nd-text-muted);
    font-size: 12px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: none;
    z-index: 1;
    padding: 0;
    transition: color 0.15s, background 0.15s;
}
.nd-floating-global .nd-img-jump-prev { bottom: calc(100% + 4px); }
.nd-floating-global .nd-img-jump-next { top: calc(100% + 4px); }
.nd-floating-global.nd-novel .nd-img-jump:hover { color: var(--nd-text-primary); background: var(--nd-bg-active); }
.nd-novel .nd-img-jump-prev .nd-icon { transform: rotate(180deg); }

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

.nd-floating-global.nd-novel .nd-detail::after {
    content: '';
    position: absolute;
    top: auto;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: var(--nd-bg-solid);
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
@media (prefers-reduced-motion: reduce) {
    .nd-novel, .nd-novel * { transition: none !important; animation: none !important; }
}
`;function ct(){if(xt)return;xt=!0;const t=document.createElement("style");t.id="nd-float-styles",t.textContent=ne,document.head.appendChild(t)}function s(t,e,n){const o=document.createElement(t);return e&&(o.className=e),n!==void 0&&(o.textContent=n),o}function O(t){const e=document.createElementNS("http://www.w3.org/2000/svg","svg");e.classList.add("nd-icon"),e.setAttribute("viewBox","0 0 24 24"),e.setAttribute("fill","none"),e.setAttribute("stroke","currentColor"),e.setAttribute("stroke-width","1.7"),e.setAttribute("stroke-linecap","round"),e.setAttribute("stroke-linejoin","round"),e.setAttribute("aria-hidden","true"),e.setAttribute("focusable","false");const n=t==="palette"?["M12 3a9 9 0 1 0 0 18h1.2a2.3 2.3 0 0 0 1.6-3.9 1.4 1.4 0 0 1 1-2.4H18a3 3 0 0 0 3-3C21 6.9 17 3 12 3Z","M7.5 10h.01M10 6.9h.01M14.2 7.1h.01M17.2 10.3h.01"]:["m5 9 7 5 7-5"];for(const[o,r]of n.entries()){const a=document.createElementNS(e.namespaceURI,"path");a.setAttribute("d",r),o===1&&a.setAttribute("stroke-width","2.8"),e.appendChild(a)}return e}function ut(){const t=s("span","nd-arrow");return t.appendChild(O("chevron")),t}function Mt(){const t=s("button","nd-btn-menu nd-btn-menu-persist");return t.title="展开菜单",t.appendChild(ut()),t}function W(t){if(!t)return;const e=E(),n=e.paramsPresets||[],o=e.selectedParamsPresetId;t.replaceChildren(),n.forEach(r=>{const a=document.createElement("option");a.value=r.id,a.textContent=r.name||"未命名",r.id===o&&(a.selected=!0),t.appendChild(a)})}function j(t){if(!t)return;const e=E().overrideSize||"default";t.replaceChildren(),ee.forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.label,n.value===e&&(o.selected=!0),t.appendChild(o)})}var z=Zt({getOverride:()=>E().overrideMaxImages,getPresetMaxImages:()=>{const t=E();return Xt(t.paramsPresets,t.selectedParamsPresetId)},persistOverride:(t,{okText:e})=>It(n=>{n.overrideMaxImages=t},e),listInputs:()=>[...c.values()].map(t=>t.$cache?.maxImagesInput).concat(p.maxImagesInput),notify:t=>globalThis.toastr?.warning?.(t)});function oe(t){return{messageId:t,root:null,state:i.IDLE,result:{success:0,total:0,error:null,startTime:0},autoResetTimer:null,cooldownRafId:null,cooldownEndTime:0,$cache:{},_cleanup:null}}function re(t){const e=E().mode==="auto",n=document.createElement("div");n.className=`nd-float nd-novel${e?" auto-on":""}`,n.dataset.messageId=t;const o=s("div","nd-capsule"),r=s("div","nd-inner"),a=s("div","nd-layer nd-layer-idle"),d=s("button","nd-btn-draw");d.title="点击生成配图",d.appendChild(O("palette")),d.appendChild(s("span","nd-auto-dot"));const b=s("div","nd-sep"),v=s("button","nd-btn-menu");v.title="展开菜单",v.appendChild(ut()),a.append(d,b,v);const D=s("div","nd-layer nd-layer-active");D.append(s("span","nd-status-icon","⏳"),s("span","nd-status-text",f.analysis)),r.append(a,D),o.append(r,Mt());const _=s("div","nd-detail"),I=s("div","nd-detail-row");I.append(s("span","nd-detail-icon","📊"),s("span","nd-detail-label","结果"),s("span","nd-detail-value nd-result","-"));const L=s("div","nd-detail-row nd-error-row");L.style.display="none",L.append(s("span","nd-detail-icon","💡"),s("span","nd-detail-label","原因"),s("span","nd-detail-value error nd-error","-"));const h=s("div","nd-detail-row");h.append(s("span","nd-detail-icon","⏱"),s("span","nd-detail-label","耗时"),s("span","nd-detail-value nd-time","-")),_.append(I,L,h);const T=s("div","nd-menu"),C=s("div","nd-card"),y=s("div","nd-row");y.appendChild(s("span","nd-label","预设"));const x=s("select","nd-select nd-preset-select");W(x),y.appendChild(x);const K=s("div","nd-inner-sep"),R=s("div","nd-row");R.appendChild(s("span","nd-label","尺寸"));const J=s("select","nd-select size nd-size-select");j(J),R.appendChild(J),C.append(y,K,R,z.createRow());const B=s("div","nd-controls"),X=s("div",`nd-auto${e?" on":""} nd-auto-toggle`);X.append(s("span","nd-dot"),s("span","nd-auto-text","自动配图"));const P=s("button","nd-gear nd-settings-btn","⚙");return P.title="打开设置",B.append(X,P),T.append(C,B),n.append(o,_,T),n}function ae(t){const e=t.root;e&&(t.$cache={statusIcon:e.querySelector(".nd-status-icon"),statusText:e.querySelector(".nd-status-text"),result:e.querySelector(".nd-result"),errorRow:e.querySelector(".nd-error-row"),error:e.querySelector(".nd-error"),time:e.querySelector(".nd-time"),presetSelect:e.querySelector(".nd-preset-select"),sizeSelect:e.querySelector(".nd-size-select"),maxImagesInput:e.querySelector(`.${Lt}`),autoToggle:e.querySelector(".nd-auto-toggle")})}function G(t,e,n={}){const o=c.get(t);if(!o?.root)return;const r=o.root;o.state=e,o.autoResetTimer&&(clearTimeout(o.autoResetTimer),o.autoResetTimer=null),e!==i.COOLDOWN&&o.cooldownRafId&&(cancelAnimationFrame(o.cooldownRafId),o.cooldownRafId=null,o.cooldownEndTime=0),r.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:a,statusText:d}=o.$cache;switch(d&&(d.className="nd-status-text"),e){case i.IDLE:o.result={success:0,total:0,error:null,startTime:0};break;case i.SUBMITTING:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),a&&(a.textContent="↥",a.className="nd-status-icon nd-spin"),d&&(d.textContent=f.submitting);break;case i.ACCEPTED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),a&&(a.textContent=Rt(n),a.className="nd-status-icon nd-spin"),d&&(d.textContent=Nt(n));break;case i.UNCERTAIN:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),a&&(a.textContent="↻",a.className="nd-status-icon nd-spin"),d&&(d.textContent=f.uncertain);break;case i.QUEUED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),a&&(a.textContent="⌛",a.className="nd-status-icon"),d&&(d.textContent=f.queued),o.result.total=n.total||o.result.total||0;break;case i.LLM:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),a&&(a.textContent="⏳",a.className="nd-status-icon nd-spin"),d&&(d.textContent=Et(n));break;case i.GEN:r.classList.add("working"),a&&(a.replaceChildren(O("palette")),a.className="nd-status-icon nd-spin"),d&&(d.textContent=`${n.current||0}/${n.total||0}`),o.result.total=n.total||0;break;case i.COOLDOWN:r.classList.add("cooldown"),a&&(a.textContent="⏳",a.className="nd-status-icon nd-spin"),se(o,n);break;case i.RECONNECTING:r.classList.add("working"),a&&(a.textContent="↻",a.className="nd-status-icon nd-spin"),d&&(d.textContent=f.reconnecting);break;case i.CANCELLING:r.classList.add("working"),a&&(a.textContent="⏳",a.className="nd-status-icon nd-spin"),d&&(d.textContent=f.cancelling);break;case i.BACKEND_LEGACY:r.classList.add("working"),a&&(a.textContent="↪",a.className="nd-status-icon"),d&&(d.textContent=f.legacy);break;case i.SUCCESS:r.classList.add("success"),a&&(a.textContent="✓",a.className="nd-status-icon"),d&&(d.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>G(t,i.IDLE),q);break;case i.PARTIAL:r.classList.add("partial"),a&&(a.textContent="⚠",a.className="nd-status-icon"),d&&(d.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>G(t,i.IDLE),q);break;case i.ERROR:r.classList.add("error"),a&&(a.textContent="✗",a.className="nd-status-icon"),d&&(d.textContent=n.unknown?f.unknown:f.error),o.result.error=n.error,o.autoResetTimer=setTimeout(()=>G(t,i.IDLE),q);break}}async function U(t,e={}){const n=at(t);if(n){et(t,n.state,n.data);return}const o=dt(t),r=await Wt(t).catch(()=>null);if(!r||!M(o))return;t=A().chat.indexOf(o.message);const a=at(t);if(a){et(t,a.state,a.data);return}const d=A(),b=String(d?.chatId||""),v=d?.chat?.[Number(t)];if(!b||!v)return;const D=Number.isInteger(v.swipe_id)?v.swipe_id:0,_=Number.isSafeInteger(r.swipeIndex)?r.swipeIndex:D,I=r.provider||e?.provider||te,L=r.runId||e?.runId||"",h={chatId:b,messageId:t,swipeIndex:_,provider:I,runId:L},T=Kt({detail:e,pending:r.pending,...h}),C=Vt(T,r,h),y=c.get(t);if(y){const x=bt({currentState:y.state,pending:r.pending,detail:C,...h});(x!==y.state||x===i.ACCEPTED&&vt(T))&&G(t,x,C)}if(l&&Number(t)===H()){const x=bt({currentState:g,pending:r.pending,detail:C,...h});r.pending&&($=Number(t)),(x!==g||x===i.ACCEPTED&&vt(T))&&N(x,C)}}function ie(t={}){const e=jt(t,A());if(!e)return;const n=H();(c.has(e.messageId)||l&&e.messageId===n)&&w(U(e.messageId,t),{source:import.meta.url,operation:"syncDrawRunActivity"})}function _e(){const t=H();if(l){const e=t>=0?at(t):null;e?($=t,N(e.state,e.data)):N(i.IDLE)}t>=0&&w(U(t),{source:import.meta.url,operation:"refreshDrawRunUiState"})}function Ot({cooldownUntil:t,duration:e}={}){const n=Number(t);return Number.isFinite(n)&&n>0?n:Date.now()+Math.max(0,Number(e)||0)}function se(t,e){t.cooldownRafId&&cancelAnimationFrame(t.cooldownRafId),t.cooldownEndTime=Ot(e);function n(){if(!t.cooldownEndTime)return;const o=Math.max(0,t.cooldownEndTime-Date.now()),r=t.$cache?.statusText;if(r&&(r.textContent=`${(o/1e3).toFixed(1)}s`,r.className="nd-status-text nd-countdown"),o<=0){t.cooldownRafId=null,t.cooldownEndTime=0;return}t.cooldownRafId=requestAnimationFrame(n)}t.cooldownRafId=requestAnimationFrame(n)}function le(t){const e=c.get(t);if(!e?.root)return;const{result:n,errorRow:o,error:r,time:a}=e.$cache,{result:d,state:b}=e,v=d.startTime?((Date.now()-d.startTime)/1e3).toFixed(1):"-";b===i.SUCCESS||b===i.PARTIAL?(n&&(n.textContent=`${d.success}/${d.total} 成功`,n.className=`nd-detail-value ${b===i.SUCCESS?"success":"warning"}`),o&&(o.style.display=b===i.PARTIAL?"flex":"none"),r&&b===i.PARTIAL&&(r.textContent=`${d.total-d.success} 张失败`)):b===i.ERROR&&(n&&(n.textContent=d.error?.label||rt.redrawFailed,n.className="nd-detail-value error"),o&&(o.style.display="flex"),r&&(r.textContent=d.error?.desc||"未知错误")),a&&(a.textContent=`${v}s`)}async function de(t){const e=c.get(t);if(!(!e||e.state!==i.IDLE))try{await Tt({messageId:t,onStateChange:(n,o,r)=>{et(r,n,o)}})}catch(n){if(n.drawTaskReported)return;n instanceof yt||Ct(n)?toastr?.info?.(n.message):(console.error(n),toastr?.error?.(n.message))}}async function ce(t){const e=dt(t);try{await At({cancel:()=>St(t,{target:e}),isCurrent:()=>M(e),getState:()=>c.get(A().chat.indexOf(e.message))?.state,setState:n=>G(A().chat.indexOf(e.message),n)})&&M(e)&&toastr?.info?.("正在中止"),M(e)&&await U(A().chat.indexOf(e.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(rt.cancelFailed)}}function ue(t){const{messageId:e,root:n}=t;n.querySelector(".nd-btn-draw")?.addEventListener("click",a=>{a.stopPropagation(),w(de(e),{source:import.meta.url,operation:"callback"})}),n.querySelectorAll(".nd-btn-menu").forEach(a=>a.addEventListener("click",d=>{d.stopPropagation(),n.classList.remove("show-detail"),n.classList.contains("expanded")||(pe(e),fe(e),ge(e)),n.classList.toggle("expanded")})),n.querySelector(".nd-layer-active")?.addEventListener("click",a=>{a.stopPropagation();const d=t.state;[i.SUBMITTING,i.ACCEPTED,i.UNCERTAIN,i.QUEUED,i.LLM,i.GEN,i.COOLDOWN,i.RECONNECTING,i.BACKEND_LEGACY].includes(d)?w(ce(e),{source:import.meta.url,operation:"callback"}):[i.SUCCESS,i.PARTIAL,i.ERROR].includes(d)&&(le(e),n.classList.toggle("show-detail"))}),t.$cache.presetSelect?.addEventListener("change",async a=>{await $t(a.target.value)}),t.$cache.sizeSelect?.addEventListener("change",async a=>{await zt(a.target.value)});const o=z.bind(t.$cache.maxImagesInput);t.$cache.autoToggle?.addEventListener("click",async()=>{await Ut()}),n.querySelector(".nd-settings-btn")?.addEventListener("click",a=>{a.stopPropagation(),n.classList.remove("expanded"),w(kt(),{source:import.meta.url,operation:"callback"})});const r=a=>{n.contains(a.target)||n.classList.remove("expanded","show-detail")};document.addEventListener("click",r,{passive:!0}),t._cleanup=()=>{o.destroy(),document.removeEventListener("click",r),t.autoResetTimer&&clearTimeout(t.autoResetTimer),t.autoResetTimer=null,t.cooldownRafId&&cancelAnimationFrame(t.cooldownRafId),t.cooldownRafId=null,t.cooldownEndTime=null}}function pe(t){const e=c.get(t)?.$cache?.presetSelect;W(e)}function fe(t){const e=c.get(t)?.$cache?.sizeSelect;j(e)}function ge(t){z.fill(c.get(t)?.$cache?.maxImagesInput)}async function pt(t,e,n){const o=await It(t,e);return o&&typeof n=="function"&&n(),o}async function $t(t){return pt(e=>{e.selectedParamsPresetId=t},"预设已切换",Yt)}async function zt(t){return pt(e=>{e.overrideSize=t},"尺寸已切换",Ae)}async function Ut(){const t=E().mode==="auto"?"manual":"auto";return pt(e=>{e.mode=t},t==="auto"?"自动配图已开启":"自动配图已关闭",De)}function st(t,e){if(c.has(e)){const r=c.get(e);if(r.root?.isConnected)return w(U(e),{source:import.meta.url,operation:"mountFloorPanel"}),r;r._cleanup?.(),c.delete(e)}ct();const n=oe(e),o=re(e);return n.root=o,Qt(e,o,{position:"right",id:`novel-draw-${e}`})?(ae(n),ue(n),c.set(e,n),w(U(e),{source:import.meta.url,operation:"mountFloorPanel"}),n):null}function me(){S||(S=new IntersectionObserver(t=>{const e=[];for(const n of t){if(!n.isIntersecting)continue;const o=n.target,r=Number(o.getAttribute("mesid"));Y.has(r)&&(e.push({el:o,mid:r}),Y.delete(r),S.unobserve(o))}e.length>0&&requestAnimationFrame(()=>{for(const{el:n,mid:o}of e)st(n,o)})},{rootMargin:"300px"}))}function be(t,e,n={}){if(E().showFloorButton===!1)return null;const{force:o=!1}=n;if(ct(),c.has(e)){const a=c.get(e);if(a.root?.isConnected)return a;a._cleanup?.(),c.delete(e)}if(o)return st(t,e);const r=t.getBoundingClientRect();return r.top<window.innerHeight+500&&r.bottom>-500?st(t,e):(me(),Y.set(e,!0),S.observe(t),null)}function Be(t,e){S?.unobserve(t),Y.delete(e);const n=c.get(e);!n||!t.contains(n.root)||(n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),lt(e,n.root),c.delete(e))}function et(t,e,n={}){let o=c.get(t);if(!o?.root?.isConnected){const r=document.querySelector(`.mes[mesid="${t}"]`);r&&(o=be(r,t,{force:!0}))}o&&G(t,e,n),l&&t===H()&&($=t,N(e,n))}function ve(){try{const e=localStorage.getItem(Dt);if(e)return JSON.parse(e)}catch(e){console.warn({source:import.meta.url,operation:"getFloatingPosition"},e)}const t=document.getElementById("xiaobaix-debug-mini");if(t){const e=t.getBoundingClientRect();return{left:e.left,top:e.bottom+8}}return{left:window.innerWidth-110,top:window.innerHeight-80}}var ft=null;function gt(t){l&&(ft=t,l.classList.toggle("nd-docked-left",t==="left"),l.classList.toggle("nd-docked-right",t==="right"))}function _t(){if(!l)return;const t=parseFloat(l.style.left)||0,e=parseFloat(l.style.top)||0;try{localStorage.setItem(Dt,JSON.stringify({left:Math.round(t),top:Math.round(e),docked:ft||""}))}catch(n){console.warn({source:import.meta.url,operation:"saveFloatingPosition"},n)}}function nt(){if(!l)return;const t=ve(),e=g===i.IDLE?Pt:Ft,n=l.offsetHeight||34,o=30,r=t.docked==="left"?0:t.docked==="right"?window.innerWidth-e:t.left;l.style.left=`${Math.max(0,Math.min(r,window.innerWidth-e))}px`,l.style.top=`${Math.max(o,Math.min(t.top,window.innerHeight-n-o))}px`,gt(t.docked==="left"||t.docked==="right"?t.docked:null)}function ot(){V&&(cancelAnimationFrame(V),V=null),tt=0}function xe(t){ot(),tt=Ot(t);function e(){if(!tt)return;const n=Math.max(0,tt-Date.now()),o=p.statusText;if(o&&(o.textContent=`${(n/1e3).toFixed(1)}s`,o.className="nd-status-text nd-countdown"),n<=0){ot();return}V=requestAnimationFrame(e)}V=requestAnimationFrame(e)}function N(t,e={}){if(!l)return;const n=g===i.IDLE;g=t,n!==(t===i.IDLE)&&nt(),k&&(clearTimeout(k),k=null),t!==i.COOLDOWN&&ot(),l.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:o,statusText:r}=p;if(!(!o||!r))switch(r.className="nd-status-text",t){case i.IDLE:$=null,u={success:0,total:0,error:null,startTime:0};break;case i.SUBMITTING:l.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="↥",o.className="nd-status-icon nd-spin",r.textContent=f.submitting;break;case i.ACCEPTED:l.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent=Rt(e),o.className="nd-status-icon nd-spin",r.textContent=Nt(e);break;case i.UNCERTAIN:l.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=f.uncertain;break;case i.QUEUED:l.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="⌛",o.className="nd-status-icon",r.textContent=f.queued;break;case i.LLM:l.classList.add("working"),u.startTime||(u.startTime=Date.now()),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=Et(e);break;case i.GEN:l.classList.add("working"),o.replaceChildren(O("palette")),o.className="nd-status-icon nd-spin",r.textContent=`${e.current||0}/${e.total||0}`,u.total=e.total||0;break;case i.COOLDOWN:l.classList.add("cooldown"),o.textContent="⏳",o.className="nd-status-icon nd-spin",xe(e);break;case i.RECONNECTING:l.classList.add("working"),o.textContent="↻",o.className="nd-status-icon nd-spin",r.textContent=f.reconnecting;break;case i.CANCELLING:l.classList.add("working"),o.textContent="⏳",o.className="nd-status-icon nd-spin",r.textContent=f.cancelling;break;case i.BACKEND_LEGACY:l.classList.add("working"),o.textContent="↪",o.className="nd-status-icon",r.textContent=f.legacy;break;case i.SUCCESS:l.classList.add("success"),o.textContent="✓",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,u.success=e.success,u.total=e.total,k=setTimeout(()=>N(i.IDLE),q);break;case i.PARTIAL:l.classList.add("partial"),o.textContent="⚠",o.className="nd-status-icon",r.textContent=`${e.success}/${e.total}`,u.success=e.success,u.total=e.total,k=setTimeout(()=>N(i.IDLE),q);break;case i.ERROR:l.classList.add("error"),o.textContent="✗",o.className="nd-status-icon",r.textContent=e.unknown?f.unknown:f.error,u.error=e.error,k=setTimeout(()=>N(i.IDLE),q);break}}function we(){const{detailResult:t,detailErrorRow:e,detailError:n,detailTime:o}=p;if(!t)return;const r=u.startTime?((Date.now()-u.startTime)/1e3).toFixed(1):"-";g===i.SUCCESS||g===i.PARTIAL?(t.textContent=`${u.success}/${u.total} 成功`,t.className=`nd-detail-value ${g===i.SUCCESS?"success":"warning"}`,e.style.display=g===i.PARTIAL?"flex":"none",g===i.PARTIAL&&(n.textContent=`${u.total-u.success} 张失败`)):g===i.ERROR&&(t.textContent=u.error?.label||rt.redrawFailed,t.className="nd-detail-value error",e.style.display="flex",n.textContent=u.error?.desc||"未知错误"),o.textContent=`${r}s`}function he(t){if(t.button===0){if(ft){gt(null),_t(),t.preventDefault();return}m={startX:t.clientX,startY:t.clientY,startLeft:l.getBoundingClientRect().left,startTop:l.getBoundingClientRect().top,pointerId:t.pointerId,moved:!1,originalTarget:t.target};try{t.currentTarget.setPointerCapture(t.pointerId)}catch(e){console.warn({source:import.meta.url,operation:"onFloatingPointerDown"},e)}t.preventDefault()}}function Ce(t){if(!m||m.pointerId!==t.pointerId)return;const e=t.clientX-m.startX,n=t.clientY-m.startY;if(!m.moved&&(Math.abs(e)>3||Math.abs(n)>3)&&(m.moved=!0),m.moved){const o=l.offsetWidth||88,r=l.offsetHeight||36,a=30;l.style.left=`${Math.max(0,Math.min(m.startLeft+e,window.innerWidth-o))}px`,l.style.top=`${Math.max(a,Math.min(m.startTop+n,window.innerHeight-r-a))}px`}t.preventDefault()}function wt(t){if(!m||m.pointerId!==t.pointerId)return;const{moved:e,originalTarget:n}=m;try{t.currentTarget.releasePointerCapture(t.pointerId)}catch(o){console.warn({source:import.meta.url,operation:"onFloatingPointerUp"},o)}if(m=null,e){const o=parseFloat(l.style.left)||0,r=l.offsetWidth||88,a=28;let d=null;o<=a?d="left":o>=window.innerWidth-r-a&&(d="right"),d&&(l.style.left=`${d==="left"?0:window.innerWidth-r}px`),gt(d),_t()}else Ee(n)}function ye(){return[...document.querySelectorAll("#chat .mes .mes_text .xb-nd-img")].filter(t=>t.offsetHeight>0&&t.offsetWidth>0&&t.querySelector("img"))}function ht(t){const e=window.innerHeight/2;let n=null,o=1/0;for(const r of ye()){const a=r.getBoundingClientRect();if(t<0&&a.bottom<e-1){const d=e-a.bottom;d<o&&(o=d,n=r)}else if(t>0&&a.top>e+1){const d=a.top-e;d<o&&(o=d,n=r)}}n&&n.scrollIntoView({behavior:"smooth",block:"center"})}function Ee(t){t.closest(".nd-btn-draw")?w(Te(),{source:import.meta.url,operation:"routeFloatingClick"}):t.closest(".nd-btn-menu")?(l.classList.remove("show-detail"),l.classList.contains("expanded")||(Se(),Ie(),Le()),l.classList.toggle("expanded")):t.closest(".nd-layer-active")&&([i.SUBMITTING,i.ACCEPTED,i.UNCERTAIN,i.QUEUED,i.LLM,i.GEN,i.COOLDOWN,i.RECONNECTING,i.BACKEND_LEGACY].includes(g)?w(ke(),{source:import.meta.url,operation:"routeFloatingClick"}):[i.SUCCESS,i.PARTIAL,i.ERROR].includes(g)&&(we(),l.classList.toggle("show-detail")))}async function Te(){if(g!==i.IDLE)return;const t=H();if(t<0){toastr?.warning?.("没有可配图的AI消息");return}$=t;try{await Tt({messageId:t,onStateChange:(e,n,o)=>{et(o,e,n)}})}catch(e){if(e.drawTaskReported)return;e instanceof yt||Ct(e)?toastr?.info?.(e.message):(console.error(e),toastr?.error?.(e.message))}}async function ke(){const t=$,e=dt(t);try{t>=0&&await At({cancel:()=>St(t,{target:e}),isCurrent:()=>M(e)&&$===A().chat.indexOf(e.message),getState:()=>g,setState:N})&&M(e)&&toastr?.info?.("正在中止"),t>=0&&M(e)&&await U(A().chat.indexOf(e.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(rt.cancelFailed)}}function Se(){W(p.presetSelect)}function Ie(){j(p.sizeSelect)}function Le(){z.fill(p.maxImagesInput)}function Re(){l&&(p={capsule:l.querySelector(".nd-capsule"),statusIcon:l.querySelector(".nd-status-icon"),statusText:l.querySelector(".nd-status-text"),detailResult:l.querySelector(".nd-result"),detailErrorRow:l.querySelector(".nd-error-row"),detailError:l.querySelector(".nd-error"),detailTime:l.querySelector(".nd-time"),presetSelect:l.querySelector(".nd-preset-select"),sizeSelect:l.querySelector(".nd-size-select"),maxImagesInput:l.querySelector(`.${Lt}`),autoToggle:l.querySelector(".nd-auto-toggle")})}function Bt(t){l&&!l.contains(t.target)&&l.classList.remove("expanded","show-detail")}function qt(){if(l)return;const t=E();if(t.showFloatingButton!==!0)return;ct();const e=t.mode==="auto";l=document.createElement("div"),l.className=`nd-float nd-novel nd-floating-global${e?" auto-on":""}`,l.id="nd-floating-global";const n=s("div","nd-detail"),o=s("div","nd-detail-row");o.append(s("span","nd-detail-icon","📊"),s("span","nd-detail-label","结果"),s("span","nd-detail-value nd-result","-"));const r=s("div","nd-detail-row nd-error-row");r.style.display="none",r.append(s("span","nd-detail-icon","💡"),s("span","nd-detail-label","原因"),s("span","nd-detail-value error nd-error","-"));const a=s("div","nd-detail-row");a.append(s("span","nd-detail-icon","⏱"),s("span","nd-detail-label","耗时"),s("span","nd-detail-value nd-time","-")),n.append(o,r,a);const d=s("div","nd-menu"),b=s("div","nd-card"),v=s("div","nd-row");v.appendChild(s("span","nd-label","预设"));const D=s("select","nd-select nd-preset-select");W(D),v.appendChild(D);const _=s("div","nd-inner-sep"),I=s("div","nd-row");I.appendChild(s("span","nd-label","尺寸"));const L=s("select","nd-select size nd-size-select");j(L),I.appendChild(L),b.append(v,_,I,z.createRow());const h=s("div","nd-controls"),T=s("div",`nd-auto${e?" on":""} nd-auto-toggle`);T.append(s("span","nd-dot"),s("span","nd-auto-text","自动配图"));const C=s("button","nd-gear nd-settings-btn","⚙");C.title="打开设置",h.append(T,C),d.append(b,h);const y=s("div","nd-capsule"),x=s("div","nd-inner"),K=s("div","nd-layer nd-layer-idle"),R=s("button","nd-btn-draw");R.title="点击为最后一条AI消息生成配图",R.appendChild(O("palette")),R.appendChild(s("span","nd-auto-dot"));const J=s("div","nd-sep"),B=s("button","nd-btn-menu");B.title="展开菜单",B.appendChild(ut()),K.append(R,J,B);const X=s("div","nd-layer nd-layer-active");X.append(s("span","nd-status-icon","⏳"),s("span","nd-status-text",f.analysis)),x.append(K,X),y.append(x,Mt());const P=s("button","nd-img-jump nd-img-jump-prev");P.appendChild(O("chevron")),P.title="跳到上一张图片";const Z=s("button","nd-img-jump nd-img-jump-next");Z.appendChild(O("chevron")),Z.title="跳到下一张图片",P.addEventListener("click",F=>{F.stopPropagation(),ht(-1)}),Z.addEventListener("click",F=>{F.stopPropagation(),ht(1)}),l.append(n,d,P,y,Z),document.body.appendChild(l),Re(),nt();const Q=p.capsule;Q&&(Q.addEventListener("pointerdown",he,{passive:!1}),Q.addEventListener("pointermove",Ce,{passive:!1}),Q.addEventListener("pointerup",wt,{passive:!1}),Q.addEventListener("pointercancel",wt,{passive:!1})),p.presetSelect?.addEventListener("change",async F=>{await $t(F.target.value)}),p.sizeSelect?.addEventListener("change",async F=>{await zt(F.target.value)}),p.maxImagesBinding=z.bind(p.maxImagesInput),p.autoToggle?.addEventListener("click",async()=>{await Ut()}),l.querySelector(".nd-settings-btn")?.addEventListener("click",()=>{l.classList.remove("expanded"),w(kt(),{source:import.meta.url,operation:"callback"})}),document.addEventListener("click",Bt,{passive:!0}),window.addEventListener("resize",nt);const mt=H();mt>=0&&w(U(mt),{source:import.meta.url,operation:"createFloatingButton"})}function Gt(){p.maxImagesBinding?.destroy(),ot(),k&&(clearTimeout(k),k=null),window.removeEventListener("resize",nt),document.removeEventListener("click",Bt),l?.remove(),l=null,m=null,g=i.IDLE,p={}}function Yt(){c.forEach(t=>{W(t.$cache?.presetSelect)}),W(p.presetSelect),Ne()}function Ae(){c.forEach(t=>{j(t.$cache?.sizeSelect)}),j(p.sizeSelect)}function Ne(){z.updateAll()}function De(){const t=E().mode==="auto";c.forEach(e=>{e.root&&(e.root.classList.toggle("auto-on",t),e.$cache.autoToggle?.classList.toggle("on",t))}),l&&(l.classList.toggle("auto-on",t),p.autoToggle?.classList.toggle("on",t))}function qe(){Yt()}function Ge(t,e){e&&!l?qt():!e&&l&&Gt(),t||(c.forEach((n,o)=>{n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),n.root&&lt(o,n.root)}),c.clear(),Y.clear(),S?.disconnect(),S=null)}function Ye(){const t=E();it??=Ht(ie),t.showFloatingButton===!0&&qt()}function We(){it?.(),it=null,c.forEach((t,e)=>{t.autoResetTimer&&clearTimeout(t.autoResetTimer),t.cooldownRafId&&cancelAnimationFrame(t.cooldownRafId),t._cleanup?.(),t.root&&lt(e,t.root)}),c.clear(),Y.clear(),S?.disconnect(),S=null,Gt()}export{i as FloatState,ee as SIZE_OPTIONS,qt as createFloatingButton,Gt as destroyFloatingButton,We as destroyFloatingPanel,be as ensureNovelDrawPanel,Ye as initFloatingPanel,_e as refreshDrawRunUiState,qe as refreshPresetSelect,qe as refreshPresetSelectAll,Be as releaseNovelDrawPanel,N as setFloatingState,et as setStateForMessage,Ne as updateAllMaxImagesInputs,Yt as updateAllPresetSelects,Ae as updateAllSizeSelects,De as updateAutoModeUI,Ge as updateButtonVisibility};
