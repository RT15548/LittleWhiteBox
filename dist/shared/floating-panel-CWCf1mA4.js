import{n as y}from"./async-errors-C4kfchr9.js";import{Z as ne}from"./gallery-cache-CymdN9HS.js";import{B as je,H as ye,V as O,ct as We,d as Ce,lt as He,n as ce,rn as Xe,t as Qe,z as ue}from"./message-toolbar-UCyB9nzF.js";import{_t as Ve,ft as g,gt as I,mt as Ee}from"./draw-common-Cj1ZRNJz.js";import{a as ke,i as H,l as Te,o as se,s as k,t as Se,u as Ie}from"./novel-draw-CDDsrKXR.js";import{a as Ke,c as Le,d as Je,i as be,l as Re,o as Ze,r as Ne,s as xe,t as Ae,u as et}from"./draw-run-ui-state-CTNtvAH6.js";import{getContext as D}from"../../../../../extensions.js";var De="xb_novel_float_pos",B=8e3,tt="novelai",i={IDLE:"idle",SUBMITTING:"submitting",ACCEPTED:"accepted",UNCERTAIN:"uncertain",QUEUED:"queued",LLM:"llm",GEN:"gen",COOLDOWN:"cooldown",RECONNECTING:"reconnecting",CANCELLING:"cancelling",BACKEND_LEGACY:"backend_legacy",SUCCESS:"success",PARTIAL:"partial",ERROR:"error"},nt=[{value:"default",label:"跟随预设",width:null,height:null},{value:"auto",label:"AI 自动（按构图）",width:null,height:null},{value:"832x1216",label:"832 × 1216  竖图",width:832,height:1216},{value:"1216x832",label:"1216 × 832  横图",width:1216,height:832},{value:"1024x1024",label:"1024 × 1024  方图",width:1024,height:1024},{value:"768x1280",label:"768 x 1280  大竖",width:768,height:1280},{value:"1280x768",label:"1280 x 768  大横",width:1280,height:768}],u=new Map,Y=new Map,L=null,s=null,f=null,v=i.IDLE,$=null,p={success:0,total:0,error:null,startTime:0},S=null,Q=null,J=0,m={},we=!1,le=null,Pe=74,Fe=98,ot=`
.nd-float.nd-novel {
    --nd-h: 34px;
    --nd-bg: var(--draw-bg-secondary);
    --nd-bg-solid: var(--draw-bg-secondary);
    --nd-bg-hover: var(--draw-bg-tertiary);
    --nd-bg-active: var(--draw-accent-soft);
    --nd-border: var(--draw-border);
    --nd-border-hover: var(--draw-border-focus);
    --nd-border-subtle: var(--draw-border);
    --nd-text-primary: var(--draw-text-primary);
    --nd-text-secondary: var(--draw-text-secondary);
    --nd-text-muted: var(--draw-text-muted);
    --nd-text-dim: var(--draw-text-muted);
    --nd-success: var(--draw-success);
    --nd-warning: var(--draw-warning);
    --nd-error: var(--draw-danger);
    --nd-info: var(--draw-border-focus);
    --nd-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.18);
    --nd-radius-sm: 6px;
    --nd-radius-md: 10px;
    --nd-radius-lg: 14px;
}

/* ═══════════════════════════════════════════════════════════════════════════
   楼层按钮样式
   ═══════════════════════════════════════════════════════════════════════════ */
.nd-float.nd-novel {
    position: relative;
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.nd-novel .nd-capsule{
    box-sizing: border-box;
    width: ${Pe}px;
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

.nd-float.nd-novel:hover .nd-capsule {
    background: var(--nd-bg-hover);
    border-color: var(--nd-border-hover);
}

.nd-float.nd-novel.working .nd-capsule { border-color: var(--nd-warning); }
.nd-float.nd-novel.cooldown .nd-capsule { border-color: var(--nd-info); background: color-mix(in srgb, var(--nd-info) 10%, var(--nd-bg)); }
.nd-float.nd-novel.success .nd-capsule { border-color: var(--nd-success); background: color-mix(in srgb, var(--nd-success) 10%, var(--nd-bg)); }
.nd-float.nd-novel.partial .nd-capsule { border-color: var(--nd-warning); background: color-mix(in srgb, var(--nd-warning) 10%, var(--nd-bg)); }
.nd-float.nd-novel.error .nd-capsule { border-color: var(--nd-error); background: color-mix(in srgb, var(--nd-error) 10%, var(--nd-bg)); }

/* 非空闲状态：胶囊右侧多出 24px，放常驻菜单按钮（生成中也能打开菜单/设置） */
.nd-float.nd-novel.working .nd-capsule,
.nd-float.nd-novel.cooldown .nd-capsule,
.nd-float.nd-novel.success .nd-capsule,
.nd-float.nd-novel.partial .nd-capsule,
.nd-float.nd-novel.error .nd-capsule { width: ${Fe}px; }

.nd-novel .nd-inner{
    display: grid;
    width: 100%;
    height: 100%;
    grid-template-areas: "s";
    grid-template-rows: minmax(0, 1fr);
    grid-template-columns: minmax(0, 1fr);
    pointer-events: none;
}

.nd-novel .nd-layer{
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

.nd-novel .nd-layer-idle{ opacity: 1; visibility: visible; transform: translateY(0); }

.nd-float.nd-novel.working .nd-layer-idle,
.nd-float.nd-novel.cooldown .nd-layer-idle,
.nd-float.nd-novel.success .nd-layer-idle,
.nd-float.nd-novel.partial .nd-layer-idle,
.nd-float.nd-novel.error .nd-layer-idle {
    opacity: 0;
    visibility: hidden;
    transform: translateY(-100%);
    pointer-events: none;
}

.nd-novel .nd-btn-draw{
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
.nd-novel .nd-btn-draw:active{ transform: scale(0.92); }

.nd-novel button { margin: 0; padding: 0; box-shadow: none; }
.nd-novel button:focus-visible { outline: 2px solid var(--nd-text-secondary); outline-offset: -3px; }
.nd-novel .nd-icon { display: block; width: 16px; height: 16px; flex-shrink: 0; pointer-events: none; }
.nd-novel .nd-arrow { display: flex; align-items: center; justify-content: center; }
.nd-novel .nd-arrow .nd-icon { width: 12px; height: 12px; }

.nd-novel .nd-auto-dot{
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
.nd-float.nd-novel.auto-on .nd-auto-dot { opacity: 1; transform: scale(1); }

.nd-novel .nd-sep{ width: 1px; height: 12px; background: var(--nd-border); }

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
.nd-float.nd-novel:hover .nd-btn-menu { opacity: 1; }
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
.nd-float.nd-novel.working .nd-btn-menu-persist,
.nd-float.nd-novel.cooldown .nd-btn-menu-persist,
.nd-float.nd-novel.success .nd-btn-menu-persist,
.nd-float.nd-novel.partial .nd-btn-menu-persist,
.nd-float.nd-novel.error .nd-btn-menu-persist { display: flex; }

.nd-novel .nd-arrow{ transition: transform 0.2s; }
.nd-float.nd-novel.expanded .nd-arrow { transform: rotate(180deg); }

.nd-novel .nd-layer-active {
    box-sizing: border-box;
    border: 0;
    background: transparent;
    padding: 0 6px;
    opacity: 0;
    visibility: hidden;
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

.nd-float.nd-novel.working .nd-layer-active,
.nd-float.nd-novel.cooldown .nd-layer-active,
.nd-float.nd-novel.success .nd-layer-active,
.nd-float.nd-novel.partial .nd-layer-active,
.nd-float.nd-novel.error .nd-layer-active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: auto;
    padding-right: 30px; /* 原 6px + 常驻菜单按钮 24px，文字区宽度保持不变 */
}

.nd-float.nd-novel.cooldown .nd-layer-active { color: var(--nd-info); }
.nd-float.nd-novel.success .nd-layer-active { color: var(--nd-success); }
.nd-float.nd-novel.partial .nd-layer-active { color: var(--nd-warning); }
.nd-float.nd-novel.error .nd-layer-active { color: var(--nd-error); }

.nd-novel .nd-spin{ display: inline-block; animation: nd-spin 1.5s linear infinite; }
.nd-novel .nd-status-icon{ flex-shrink: 0; }
.nd-novel .nd-status-text{ min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@keyframes nd-spin { to { transform: rotate(360deg); } }

.nd-novel .nd-countdown{ font-variant-numeric: tabular-nums; min-width: 36px; text-align: center; }

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

.nd-float.nd-novel.show-detail .nd-detail {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
}

.nd-novel .nd-detail-row{ display: flex; align-items: center; gap: 10px; padding: 3px 0; }
.nd-novel .nd-detail-row + .nd-detail-row{ margin-top: 6px; padding-top: 8px; border-top: 1px solid var(--nd-border-subtle); }
.nd-novel .nd-detail-icon{ opacity: 0.6; font-size: 13px; }
.nd-novel .nd-detail-label{ color: var(--nd-text-muted); }
.nd-novel .nd-detail-value{ margin-left: auto; font-weight: 600; color: var(--nd-text-primary); }
.nd-novel .nd-detail-value.success{ color: var(--nd-success); }
.nd-novel .nd-detail-value.warning{ color: var(--nd-warning); }
.nd-novel .nd-detail-value.error{ color: var(--nd-error); }

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

.nd-float.nd-novel.expanded .nd-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
}

.nd-novel .nd-card{
    background: transparent;
    border: none;
    border-radius: 0;
    overflow: visible;
}

.nd-novel .nd-row{
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 2px;
    min-height: 36px;
}

.nd-novel .nd-label{
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
.nd-novel .nd-select.size{ font-family: "SF Mono", "Menlo", "Consolas", monospace; font-size: 11px; }
${et}
.nd-novel .nd-max-images-input { background: var(--nd-bg-active); color-scheme: normal; }
.nd-novel .nd-max-images-input:hover { border-color: var(--nd-border-hover); }
.nd-novel .nd-max-images-input:focus { border-color: var(--nd-text-muted); }

.nd-novel .nd-inner-sep{ display: none; }

.nd-novel .nd-controls{ display: flex; align-items: center; gap: 8px; margin-top: 10px; }

.nd-novel .nd-auto{
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
.nd-novel .nd-auto:hover { background: var(--nd-bg-active); }
.nd-novel .nd-auto.on{ background: color-mix(in srgb, var(--nd-success) 8%, var(--nd-bg)); border-color: var(--nd-success); }

.nd-novel .nd-dot{
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--nd-text-muted);
    transition: all 0.2s;
}
.nd-novel .nd-auto.on .nd-dot{ background: var(--nd-success); box-shadow: 0 0 8px var(--nd-success); }

.nd-novel .nd-auto-text{ font-size: 12px; color: var(--nd-text-muted); }
.nd-novel .nd-auto:hover .nd-auto-text{ color: var(--nd-text-secondary); }
.nd-novel .nd-auto.on .nd-auto-text{ color: var(--nd-success); }

.nd-novel .nd-gear{
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
.nd-novel .nd-gear:hover { background: var(--nd-bg-active); color: var(--nd-text-secondary); }

/* ═══════════════════════════════════════════════════════════════════════════
   悬浮按钮样式（固定定位，可拖拽）
   ═══════════════════════════════════════════════════════════════════════════ */
.nd-floating-global.nd-novel {
    position: fixed;
    z-index: 10000;
    user-select: none;
    will-change: transform;
    transition: transform 0.25s ease;
}

/* 貼邊半藏：膠囊一半移出螢幕；吸附時隱藏跳圖鈕 */
.nd-floating-global.nd-novel.nd-docked-left { transform: translateX(-50%); }
.nd-floating-global.nd-novel.nd-docked-right { transform: translateX(50%); }
.nd-floating-global.nd-novel[class*="nd-docked"] .nd-img-jump { display: none; }

.nd-floating-global.nd-novel .nd-capsule {
    background: var(--nd-bg-solid);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
    touch-action: none;
    cursor: grab;
}

/* 跳圖上下鈕：絕對定位在膠囊外，不影響膠囊尺寸與拖曳 */
.nd-floating-global.nd-novel .nd-img-jump {
    touch-action: none;
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
.nd-floating-global.nd-novel .nd-img-jump-prev { bottom: calc(100% + 4px); }
.nd-floating-global.nd-novel .nd-img-jump-next { top: calc(100% + 4px); }
.nd-floating-global.nd-novel .nd-img-jump:hover { color: var(--nd-text-primary); background: var(--nd-bg-active); }
.nd-novel .nd-img-jump-prev .nd-icon { transform: rotate(180deg); }

.nd-floating-global.nd-novel .nd-capsule:active { cursor: grabbing; }

/* 悬浮按钮的详情和菜单向上展开 */
.nd-floating-global.nd-novel .nd-detail {
    top: auto;
    bottom: calc(100% + 10px);
    transform: translateY(4px) scale(0.96);
    transform-origin: bottom right;
}

.nd-floating-global.nd-novel.show-detail .nd-detail {
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

.nd-floating-global.nd-novel .nd-menu {
    top: auto;
    bottom: calc(100% + 10px);
    transform: translateY(6px) scale(0.98);
    transform-origin: bottom right;
}

.nd-floating-global.nd-novel.expanded .nd-menu {
    transform: translateY(0) scale(1);
}

/* 悬浮按钮箭头向上 */
.nd-floating-global.nd-novel .nd-arrow { transform: rotate(180deg); }
.nd-floating-global.nd-novel.expanded .nd-arrow { transform: rotate(0deg); }
@media (prefers-reduced-motion: reduce) {
    .nd-novel, .nd-novel * { transition: none !important; animation: none !important; }
}
`;function pe(){if(Ve(),we)return;we=!0;const e=document.createElement("style");e.id="nd-float-styles",e.textContent=ot,document.head.appendChild(e)}function l(e,t,n){const o=document.createElement(e);return t&&(o.className=t),n!==void 0&&(o.textContent=n),o}function c(e){return I(e==="chevron"?"chevron-down":e,"nd-icon")}function fe(){const e=l("span","nd-arrow");return e.appendChild(c("chevron")),e}function Me(){const e=l("button","nd-btn-menu nd-btn-menu-persist");return e.title="展开菜单",e.appendChild(fe()),e}function j(e){if(!e)return;const t=k(),n=t.paramsPresets||[],o=t.selectedParamsPresetId;e.replaceChildren(),n.forEach(r=>{const a=document.createElement("option");a.value=r.id,a.textContent=r.name||"未命名",r.id===o&&(a.selected=!0),e.appendChild(a)})}function W(e){if(!e)return;const t=k().overrideSize||"default";e.replaceChildren(),nt.forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.label,n.value===t&&(o.selected=!0),e.appendChild(o)})}var z=Je({getOverride:()=>k().overrideMaxImages,getPresetMaxImages:()=>{const e=k();return Xe(e.paramsPresets,e.selectedParamsPresetId)},persistOverride:(e,{okText:t})=>Ie(n=>{n.overrideMaxImages=e},t),listInputs:()=>[...u.values()].map(e=>e.$cache?.maxImagesInput).concat(m.maxImagesInput),notify:e=>globalThis.toastr?.warning?.(e)});function rt(e){return{messageId:e,root:null,state:i.IDLE,result:{success:0,total:0,error:null,startTime:0},autoResetTimer:null,cooldownRafId:null,cooldownEndTime:0,$cache:{},_cleanup:null}}function at(e){const t=k().mode==="auto",n=document.createElement("div");n.className=`nd-float nd-novel lwb-draw-ui${t?" auto-on":""}`,n.dataset.messageId=e;const o=l("div","nd-capsule"),r=l("div","nd-inner"),a=l("div","nd-layer nd-layer-idle"),d=l("button","nd-btn-draw");d.title="点击生成配图",d.appendChild(c("palette")),d.appendChild(l("span","nd-auto-dot"));const b=l("div","nd-sep"),x=l("button","nd-btn-menu");x.title="展开菜单",x.appendChild(fe()),a.append(d,b,x);const F=l("button","nd-layer nd-layer-active");F.append(l("span","nd-status-icon"),l("span","nd-status-text",g.analysis)),r.append(a,F),o.append(r,Me());const U=l("div","nd-detail"),R=l("div","nd-detail-row");R.append(I("images","nd-detail-icon"),l("span","nd-detail-label","结果"),l("span","nd-detail-value nd-result","-"));const N=l("div","nd-detail-row nd-error-row");N.style.display="none",N.append(I("circle-info","nd-detail-icon"),l("span","nd-detail-label","原因"),l("span","nd-detail-value error nd-error","-"));const C=l("div","nd-detail-row");C.append(I("clock","nd-detail-icon"),l("span","nd-detail-label","耗时"),l("span","nd-detail-value nd-time","-")),U.append(R,N,C);const T=l("div","nd-menu"),h=l("div","nd-card"),E=l("div","nd-row");E.appendChild(l("span","nd-label","预设"));const w=l("select","nd-select nd-preset-select");j(w),E.appendChild(w);const V=l("div","nd-inner-sep"),A=l("div","nd-row");A.appendChild(l("span","nd-label","尺寸"));const K=l("select","nd-select size nd-size-select");W(K),A.appendChild(K),h.append(E,V,A,z.createRow());const q=l("div","nd-controls"),X=l("div",`nd-auto${t?" on":""} nd-auto-toggle`);X.append(l("span","nd-dot"),l("span","nd-auto-text","自动配图"));const M=l("button","nd-gear nd-settings-btn");return M.title="打开设置",M.appendChild(I("sliders")),q.append(X,M),T.append(h,q),n.append(o,U,T),n}function it(e){const t=e.root;t&&(e.$cache={statusIcon:t.querySelector(".nd-status-icon"),statusText:t.querySelector(".nd-status-text"),result:t.querySelector(".nd-result"),errorRow:t.querySelector(".nd-error-row"),error:t.querySelector(".nd-error"),time:t.querySelector(".nd-time"),presetSelect:t.querySelector(".nd-preset-select"),sizeSelect:t.querySelector(".nd-size-select"),maxImagesInput:t.querySelector(`.${Re}`),autoToggle:t.querySelector(".nd-auto-toggle")})}function G(e,t,n={}){const o=u.get(e);if(!o?.root)return;const r=o.root;o.state=t,o.autoResetTimer&&(clearTimeout(o.autoResetTimer),o.autoResetTimer=null),t!==i.COOLDOWN&&o.cooldownRafId&&(cancelAnimationFrame(o.cooldownRafId),o.cooldownRafId=null,o.cooldownEndTime=0),r.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:a,statusText:d}=o.$cache;switch(d&&(d.className="nd-status-text"),t){case i.IDLE:o.result={success:0,total:0,error:null,startTime:0};break;case i.SUBMITTING:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),a&&(a.replaceChildren(c("upload")),a.className="nd-status-icon nd-spin"),d&&(d.textContent=g.submitting);break;case i.ACCEPTED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),a&&(a.replaceChildren(c(["analysis","retry"].includes(Ne(n))?"spinner":"palette")),a.className="nd-status-icon nd-spin"),d&&(d.textContent=Ae(n));break;case i.UNCERTAIN:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),a&&(a.replaceChildren(c("rotate")),a.className="nd-status-icon nd-spin"),d&&(d.textContent=g.uncertain);break;case i.QUEUED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),a&&(a.replaceChildren(c("clock")),a.className="nd-status-icon"),d&&(d.textContent=g.queued),o.result.total=n.total||o.result.total||0;break;case i.LLM:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),a&&(a.replaceChildren(c("spinner")),a.className="nd-status-icon nd-spin"),d&&(d.textContent=Ee(n));break;case i.GEN:r.classList.add("working"),a&&(a.replaceChildren(c("palette")),a.className="nd-status-icon nd-spin"),d&&(d.textContent=`${n.current||0}/${n.total||0}`),o.result.total=n.total||0;break;case i.COOLDOWN:r.classList.add("cooldown"),a&&(a.replaceChildren(c("spinner")),a.className="nd-status-icon nd-spin"),lt(o,n);break;case i.RECONNECTING:r.classList.add("working"),a&&(a.replaceChildren(c("rotate")),a.className="nd-status-icon nd-spin"),d&&(d.textContent=g.reconnecting);break;case i.CANCELLING:r.classList.add("working"),a&&(a.replaceChildren(c("spinner")),a.className="nd-status-icon nd-spin"),d&&(d.textContent=g.cancelling);break;case i.BACKEND_LEGACY:r.classList.add("working"),a&&(a.replaceChildren(c("share-from-square")),a.className="nd-status-icon"),d&&(d.textContent=g.legacy);break;case i.SUCCESS:r.classList.add("success"),a&&(a.replaceChildren(c("check")),a.className="nd-status-icon"),d&&(d.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>G(e,i.IDLE),B);break;case i.PARTIAL:r.classList.add("partial"),a&&(a.replaceChildren(c("triangle-exclamation")),a.className="nd-status-icon"),d&&(d.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>G(e,i.IDLE),B);break;case i.ERROR:r.classList.add("error"),a&&(a.replaceChildren(c("xmark")),a.className="nd-status-icon"),d&&(d.textContent=n.unknown?g.unknown:g.error),o.result.error=n.error,o.autoResetTimer=setTimeout(()=>G(e,i.IDLE),B);break}}async function _(e,t={}){const n=se(e);if(n){Z(e,n.state,n.data);return}const o=ue(e),r=await je(e).catch(()=>null);if(!r||!O(o))return;e=D().chat.indexOf(o.message);const a=se(e);if(a){Z(e,a.state,a.data);return}const d=D(),b=String(d?.chatId||""),x=d?.chat?.[Number(e)];if(!b||!x)return;const F=Number.isInteger(x.swipe_id)?x.swipe_id:0,U=Number.isSafeInteger(r.swipeIndex)?r.swipeIndex:F,R=r.provider||t?.provider||tt,N=r.runId||t?.runId||"",C={chatId:b,messageId:e,swipeIndex:U,provider:R,runId:N},T=Ke({detail:t,pending:r.pending,...C}),h=Ze(T,r,C),E=u.get(e);if(E){const w=xe({currentState:E.state,pending:r.pending,detail:h,...C});(w!==E.state||w===i.ACCEPTED&&be(T))&&G(e,w,h)}if(s&&Number(e)===H()){const w=xe({currentState:v,pending:r.pending,detail:h,...C});r.pending&&($=Number(e)),(w!==v||w===i.ACCEPTED&&be(T))&&P(w,h)}}function st(e={}){const t=We(e,D());if(!t)return;const n=H();(u.has(t.messageId)||s&&t.messageId===n)&&y(_(t.messageId,e),{source:import.meta.url,operation:"syncDrawRunActivity"})}function Gt(){const e=H();if(s){const t=e>=0?se(e):null;t?($=e,P(t.state,t.data)):P(i.IDLE)}e>=0&&y(_(e),{source:import.meta.url,operation:"refreshDrawRunUiState"})}function Oe({cooldownUntil:e,duration:t}={}){const n=Number(e);return Number.isFinite(n)&&n>0?n:Date.now()+Math.max(0,Number(t)||0)}function lt(e,t){e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e.cooldownEndTime=Oe(t);function n(){if(!e.cooldownEndTime)return;const o=Math.max(0,e.cooldownEndTime-Date.now()),r=e.$cache?.statusText;if(r&&(r.textContent=`${(o/1e3).toFixed(1)}s`,r.className="nd-status-text nd-countdown"),o<=0){e.cooldownRafId=null,e.cooldownEndTime=0;return}e.cooldownRafId=requestAnimationFrame(n)}e.cooldownRafId=requestAnimationFrame(n)}function dt(e){const t=u.get(e);if(!t?.root)return;const{result:n,errorRow:o,error:r,time:a}=t.$cache,{result:d,state:b}=t,x=d.startTime?((Date.now()-d.startTime)/1e3).toFixed(1):"-";b===i.SUCCESS||b===i.PARTIAL?(n&&(n.textContent=`${d.success}/${d.total} 成功`,n.className=`nd-detail-value ${b===i.SUCCESS?"success":"warning"}`),o&&(o.style.display=b===i.PARTIAL?"flex":"none"),r&&b===i.PARTIAL&&(r.textContent=`${d.total-d.success} 张失败`)):b===i.ERROR&&(n&&(n.textContent=d.error?.label||ne.redrawFailed,n.className="nd-detail-value error"),o&&(o.style.display="flex"),r&&(r.textContent=d.error?.desc||"未知错误")),a&&(a.textContent=`${x}s`)}async function ct(e){const t=u.get(e);if(!(!t||t.state!==i.IDLE))try{await ke({messageId:e,onStateChange:(n,o,r)=>{Z(r,n,o)}})}catch(n){if(n.drawTaskReported)return;n instanceof Ce||ye(n)?toastr?.info?.(n.message):(console.error(n),toastr?.error?.(n.message))}}async function ut(e){const t=ue(e);try{await Le({cancel:()=>Se(e,{target:t}),isCurrent:()=>O(t),getState:()=>u.get(D().chat.indexOf(t.message))?.state,setState:n=>G(D().chat.indexOf(t.message),n)})&&O(t)&&toastr?.info?.("正在中止"),O(t)&&await _(D().chat.indexOf(t.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(ne.cancelFailed)}}function pt(e){const{messageId:t,root:n}=e;n.querySelector(".nd-btn-draw")?.addEventListener("click",a=>{a.stopPropagation(),y(ct(t),{source:import.meta.url,operation:"callback"})}),n.querySelectorAll(".nd-btn-menu").forEach(a=>a.addEventListener("click",d=>{d.stopPropagation(),n.classList.remove("show-detail"),n.classList.contains("expanded")||(ft(t),gt(t),mt(t)),n.classList.toggle("expanded")})),n.querySelector(".nd-layer-active")?.addEventListener("click",a=>{a.stopPropagation();const d=e.state;[i.SUBMITTING,i.ACCEPTED,i.UNCERTAIN,i.QUEUED,i.LLM,i.GEN,i.COOLDOWN,i.RECONNECTING,i.BACKEND_LEGACY].includes(d)?y(ut(t),{source:import.meta.url,operation:"callback"}):[i.SUCCESS,i.PARTIAL,i.ERROR].includes(d)&&(dt(t),n.classList.toggle("show-detail"))}),e.$cache.presetSelect?.addEventListener("change",async a=>{await $e(a.target.value)}),e.$cache.sizeSelect?.addEventListener("change",async a=>{await ze(a.target.value)});const o=z.bind(e.$cache.maxImagesInput);e.$cache.autoToggle?.addEventListener("click",async()=>{await _e()}),n.querySelector(".nd-settings-btn")?.addEventListener("click",a=>{a.stopPropagation(),n.classList.remove("expanded"),y(Te(),{source:import.meta.url,operation:"callback"})});const r=a=>{n.contains(a.target)||n.classList.remove("expanded","show-detail")};document.addEventListener("click",r,{passive:!0}),e._cleanup=()=>{o.destroy(),document.removeEventListener("click",r),e.autoResetTimer&&clearTimeout(e.autoResetTimer),e.autoResetTimer=null,e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e.cooldownRafId=null,e.cooldownEndTime=null}}function ft(e){const t=u.get(e)?.$cache?.presetSelect;j(t)}function gt(e){const t=u.get(e)?.$cache?.sizeSelect;W(t)}function mt(e){z.fill(u.get(e)?.$cache?.maxImagesInput)}async function ge(e,t,n){const o=await Ie(e,t);return o&&typeof n=="function"&&n(),o}async function $e(e){return ge(t=>{t.selectedParamsPresetId=e},"预设已切换",Ye)}async function ze(e){return ge(t=>{t.overrideSize=e},"尺寸已切换",Pt)}async function _e(){const e=k().mode==="auto"?"manual":"auto";return ge(t=>{t.mode=e},e==="auto"?"自动配图已开启":"自动配图已关闭",Mt)}function de(e,t){if(u.has(t)){const r=u.get(t);if(r.root?.isConnected)return y(_(t),{source:import.meta.url,operation:"mountFloorPanel"}),r;r._cleanup?.(),u.delete(t)}pe();const n=rt(t),o=at(t);return n.root=o,Qe(t,o,{position:"right",id:`novel-draw-${t}`})?(it(n),pt(n),u.set(t,n),y(_(t),{source:import.meta.url,operation:"mountFloorPanel"}),n):null}function vt(){L||(L=new IntersectionObserver(e=>{const t=[];for(const n of e){if(!n.isIntersecting)continue;const o=n.target,r=Number(o.getAttribute("mesid"));Y.has(r)&&(t.push({el:o,mid:r}),Y.delete(r),L.unobserve(o))}t.length>0&&requestAnimationFrame(()=>{for(const{el:n,mid:o}of t)de(n,o)})},{rootMargin:"300px"}))}function bt(e,t,n={}){if(k().showFloorButton===!1)return null;const{force:o=!1}=n;if(pe(),u.has(t)){const a=u.get(t);if(a.root?.isConnected)return a;a._cleanup?.(),u.delete(t)}if(o)return de(e,t);const r=e.getBoundingClientRect();return r.top<window.innerHeight+500&&r.bottom>-500?de(e,t):(vt(),Y.set(t,!0),L.observe(e),null)}function Yt(e,t){L?.unobserve(e),Y.delete(t);const n=u.get(t);!n||!e.contains(n.root)||(n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),ce(t,n.root),u.delete(t))}function Z(e,t,n={}){let o=u.get(e);if(!o?.root?.isConnected){const r=document.querySelector(`.mes[mesid="${e}"]`);r&&(o=bt(r,e,{force:!0}))}o&&G(e,t,n),s&&e===H()&&($=e,P(t,n))}function xt(){try{const t=localStorage.getItem(De);if(t)return JSON.parse(t)}catch(t){console.warn({source:import.meta.url,operation:"getFloatingPosition"},t)}const e=document.getElementById("xiaobaix-debug-mini");if(e){const t=e.getBoundingClientRect();return{left:t.left,top:t.bottom+8}}return{left:window.innerWidth-110,top:window.innerHeight-80}}var oe=null;function re(e){s&&(oe=e,s.classList.toggle("nd-docked-left",e==="left"),s.classList.toggle("nd-docked-right",e==="right"))}function me(){if(!s)return;const e=parseFloat(s.style.left)||0,t=parseFloat(s.style.top)||0;try{localStorage.setItem(De,JSON.stringify({left:Math.round(e),top:Math.round(t),docked:oe||""}))}catch(n){console.warn({source:import.meta.url,operation:"saveFloatingPosition"},n)}}function ee(){if(!s)return;const e=xt(),t=v===i.IDLE?Pe:Fe,n=s.offsetHeight||34,o=30,r=e.docked==="left"?0:e.docked==="right"?window.innerWidth-t:e.left;s.style.left=`${Math.max(0,Math.min(r,window.innerWidth-t))}px`,s.style.top=`${Math.max(o,Math.min(e.top,window.innerHeight-n-o))}px`,re(e.docked==="left"||e.docked==="right"?e.docked:null)}function te(){Q&&(cancelAnimationFrame(Q),Q=null),J=0}function wt(e){te(),J=Oe(e);function t(){if(!J)return;const n=Math.max(0,J-Date.now()),o=m.statusText;if(o&&(o.textContent=`${(n/1e3).toFixed(1)}s`,o.className="nd-status-text nd-countdown"),n<=0){te();return}Q=requestAnimationFrame(t)}Q=requestAnimationFrame(t)}function P(e,t={}){if(!s)return;const n=v===i.IDLE;v=e,n!==(e===i.IDLE)&&ee(),S&&(clearTimeout(S),S=null),e!==i.COOLDOWN&&te(),s.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:o,statusText:r}=m;if(!(!o||!r))switch(r.className="nd-status-text",e){case i.IDLE:$=null,p={success:0,total:0,error:null,startTime:0};break;case i.SUBMITTING:s.classList.add("working"),p.startTime||(p.startTime=Date.now()),o.replaceChildren(c("upload")),o.className="nd-status-icon nd-spin",r.textContent=g.submitting;break;case i.ACCEPTED:s.classList.add("working"),p.startTime||(p.startTime=Date.now()),o.replaceChildren(c(["analysis","retry"].includes(Ne(t))?"spinner":"palette")),o.className="nd-status-icon nd-spin",r.textContent=Ae(t);break;case i.UNCERTAIN:s.classList.add("working"),p.startTime||(p.startTime=Date.now()),o.replaceChildren(c("rotate")),o.className="nd-status-icon nd-spin",r.textContent=g.uncertain;break;case i.QUEUED:s.classList.add("working"),p.startTime||(p.startTime=Date.now()),o.replaceChildren(c("clock")),o.className="nd-status-icon",r.textContent=g.queued;break;case i.LLM:s.classList.add("working"),p.startTime||(p.startTime=Date.now()),o.replaceChildren(c("spinner")),o.className="nd-status-icon nd-spin",r.textContent=Ee(t);break;case i.GEN:s.classList.add("working"),o.replaceChildren(c("palette")),o.className="nd-status-icon nd-spin",r.textContent=`${t.current||0}/${t.total||0}`,p.total=t.total||0;break;case i.COOLDOWN:s.classList.add("cooldown"),o.replaceChildren(c("spinner")),o.className="nd-status-icon nd-spin",wt(t);break;case i.RECONNECTING:s.classList.add("working"),o.replaceChildren(c("rotate")),o.className="nd-status-icon nd-spin",r.textContent=g.reconnecting;break;case i.CANCELLING:s.classList.add("working"),o.replaceChildren(c("spinner")),o.className="nd-status-icon nd-spin",r.textContent=g.cancelling;break;case i.BACKEND_LEGACY:s.classList.add("working"),o.replaceChildren(c("share-from-square")),o.className="nd-status-icon",r.textContent=g.legacy;break;case i.SUCCESS:s.classList.add("success"),o.replaceChildren(c("check")),o.className="nd-status-icon",r.textContent=`${t.success}/${t.total}`,p.success=t.success,p.total=t.total,S=setTimeout(()=>P(i.IDLE),B);break;case i.PARTIAL:s.classList.add("partial"),o.replaceChildren(c("triangle-exclamation")),o.className="nd-status-icon",r.textContent=`${t.success}/${t.total}`,p.success=t.success,p.total=t.total,S=setTimeout(()=>P(i.IDLE),B);break;case i.ERROR:s.classList.add("error"),o.replaceChildren(c("xmark")),o.className="nd-status-icon",r.textContent=t.unknown?g.unknown:g.error,p.error=t.error,S=setTimeout(()=>P(i.IDLE),B);break}}function ht(){const{detailResult:e,detailErrorRow:t,detailError:n,detailTime:o}=m;if(!e)return;const r=p.startTime?((Date.now()-p.startTime)/1e3).toFixed(1):"-";v===i.SUCCESS||v===i.PARTIAL?(e.textContent=`${p.success}/${p.total} 成功`,e.className=`nd-detail-value ${v===i.SUCCESS?"success":"warning"}`,t.style.display=v===i.PARTIAL?"flex":"none",v===i.PARTIAL&&(n.textContent=`${p.total-p.success} 张失败`)):v===i.ERROR&&(e.textContent=p.error?.label||ne.redrawFailed,e.className="nd-detail-value error",t.style.display="flex",n.textContent=p.error?.desc||"未知错误"),o.textContent=`${r}s`}function yt(e){if(!(e.button!==0||f||!e.target.closest(".nd-capsule, .nd-img-jump"))){if(oe){re(null),me(),e.preventDefault();return}f={startX:e.clientX,startY:e.clientY,startLeft:s.getBoundingClientRect().left,startTop:s.getBoundingClientRect().top,pointerId:e.pointerId,moved:!1,originalTarget:e.target};try{e.currentTarget.setPointerCapture(e.pointerId)}catch(t){console.warn({source:import.meta.url,operation:"onFloatingPointerDown"},t)}e.preventDefault()}}function Ct(e){if(!f||f.pointerId!==e.pointerId)return;const t=e.clientX-f.startX,n=e.clientY-f.startY;if(!f.moved&&(Math.abs(t)>3||Math.abs(n)>3)&&(f.moved=!0),f.moved){const o=s.offsetWidth||88,r=s.offsetHeight||36,a=30;s.style.left=`${Math.max(0,Math.min(f.startLeft+t,window.innerWidth-o))}px`,s.style.top=`${Math.max(a,Math.min(f.startTop+n,window.innerHeight-r-a))}px`}e.preventDefault()}function Et(e){if(!f||f.pointerId!==e.pointerId)return;const{moved:t,originalTarget:n}=f;if(f=null,e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId),t){const o=parseFloat(s.style.left)||0,r=s.offsetWidth||88,a=28;let d=null;o<=a?d="left":o>=window.innerWidth-r-a&&(d="right"),d&&(s.style.left=`${d==="left"?0:window.innerWidth-r}px`),re(d),me()}else Ue(n)}function he(e){if(!f||f.pointerId!==e.pointerId)return;const{startLeft:t,startTop:n}=f;f=null,s.style.left=`${t}px`,s.style.top=`${n}px`,e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId)}function kt(e){if(e.target.closest(".nd-capsule, .nd-img-jump")&&(e.preventDefault(),e.stopPropagation(),e.detail===0)){if(oe){re(null),me();return}Ue(e.target)}}function Tt(){return[...document.querySelectorAll("#chat .mes .mes_text .xb-nd-img")].filter(e=>e.offsetHeight>0&&e.offsetWidth>0&&e.querySelector("img"))}function St(e){const t=window.innerHeight/2;let n=null,o=1/0;for(const r of Tt()){const a=r.getBoundingClientRect();if(e<0&&a.bottom<t-1){const d=t-a.bottom;d<o&&(o=d,n=r)}else if(e>0&&a.top>t+1){const d=a.top-t;d<o&&(o=d,n=r)}}n&&n.scrollIntoView({behavior:"smooth",block:"center"})}function Ue(e){e.closest(".nd-img-jump")?St(e.closest(".nd-img-jump-prev")?-1:1):e.closest(".nd-btn-draw")?y(It(),{source:import.meta.url,operation:"routeFloatingClick"}):e.closest(".nd-btn-menu")?(s.classList.remove("show-detail"),s.classList.contains("expanded")||(Rt(),Nt(),At()),s.classList.toggle("expanded")):e.closest(".nd-layer-active")&&([i.SUBMITTING,i.ACCEPTED,i.UNCERTAIN,i.QUEUED,i.LLM,i.GEN,i.COOLDOWN,i.RECONNECTING,i.BACKEND_LEGACY].includes(v)?y(Lt(),{source:import.meta.url,operation:"routeFloatingClick"}):[i.SUCCESS,i.PARTIAL,i.ERROR].includes(v)&&(ht(),s.classList.toggle("show-detail")))}async function It(){if(v!==i.IDLE)return;const e=H();if(e<0){toastr?.warning?.("没有可配图的AI消息");return}$=e;try{await ke({messageId:e,onStateChange:(t,n,o)=>{Z(o,t,n)}})}catch(t){if(t.drawTaskReported)return;t instanceof Ce||ye(t)?toastr?.info?.(t.message):(console.error(t),toastr?.error?.(t.message))}}async function Lt(){const e=$,t=ue(e);try{e>=0&&await Le({cancel:()=>Se(e,{target:t}),isCurrent:()=>O(t)&&$===D().chat.indexOf(t.message),getState:()=>v,setState:P})&&O(t)&&toastr?.info?.("正在中止"),e>=0&&O(t)&&await _(D().chat.indexOf(t.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(ne.cancelFailed)}}function Rt(){j(m.presetSelect)}function Nt(){W(m.sizeSelect)}function At(){z.fill(m.maxImagesInput)}function Dt(){s&&(m={capsule:s.querySelector(".nd-capsule"),statusIcon:s.querySelector(".nd-status-icon"),statusText:s.querySelector(".nd-status-text"),detailResult:s.querySelector(".nd-result"),detailErrorRow:s.querySelector(".nd-error-row"),detailError:s.querySelector(".nd-error"),detailTime:s.querySelector(".nd-time"),presetSelect:s.querySelector(".nd-preset-select"),sizeSelect:s.querySelector(".nd-size-select"),maxImagesInput:s.querySelector(`.${Re}`),autoToggle:s.querySelector(".nd-auto-toggle")})}function qe(e){s&&!s.contains(e.target)&&s.classList.remove("expanded","show-detail")}function Be(){if(s)return;const e=k();if(e.showFloatingButton!==!0)return;pe();const t=e.mode==="auto";s=document.createElement("div"),s.className=`nd-float nd-novel lwb-draw-ui nd-floating-global${t?" auto-on":""}`,s.id="nd-floating-global";const n=l("div","nd-detail"),o=l("div","nd-detail-row");o.append(I("images","nd-detail-icon"),l("span","nd-detail-label","结果"),l("span","nd-detail-value nd-result","-"));const r=l("div","nd-detail-row nd-error-row");r.style.display="none",r.append(I("circle-info","nd-detail-icon"),l("span","nd-detail-label","原因"),l("span","nd-detail-value error nd-error","-"));const a=l("div","nd-detail-row");a.append(I("clock","nd-detail-icon"),l("span","nd-detail-label","耗时"),l("span","nd-detail-value nd-time","-")),n.append(o,r,a);const d=l("div","nd-menu"),b=l("div","nd-card"),x=l("div","nd-row");x.appendChild(l("span","nd-label","预设"));const F=l("select","nd-select nd-preset-select");j(F),x.appendChild(F);const U=l("div","nd-inner-sep"),R=l("div","nd-row");R.appendChild(l("span","nd-label","尺寸"));const N=l("select","nd-select size nd-size-select");W(N),R.appendChild(N),b.append(x,U,R,z.createRow());const C=l("div","nd-controls"),T=l("div",`nd-auto${t?" on":""} nd-auto-toggle`);T.append(l("span","nd-dot"),l("span","nd-auto-text","自动配图"));const h=l("button","nd-gear nd-settings-btn");h.title="打开设置",h.appendChild(I("sliders")),C.append(T,h),d.append(b,C);const E=l("div","nd-capsule"),w=l("div","nd-inner"),V=l("div","nd-layer nd-layer-idle"),A=l("button","nd-btn-draw");A.title="点击为最后一条AI消息生成配图",A.appendChild(c("palette")),A.appendChild(l("span","nd-auto-dot"));const K=l("div","nd-sep"),q=l("button","nd-btn-menu");q.title="展开菜单",q.appendChild(fe()),V.append(A,K,q);const X=l("button","nd-layer nd-layer-active");X.append(l("span","nd-status-icon"),l("span","nd-status-text",g.analysis)),w.append(V,X),E.append(w,Me());const M=l("button","nd-img-jump nd-img-jump-prev");M.appendChild(c("chevron")),M.title="跳到上一张图片";const ae=l("button","nd-img-jump nd-img-jump-next");ae.appendChild(c("chevron")),ae.title="跳到下一张图片",s.append(n,d,M,E,ae),document.body.appendChild(s),Dt(),ee(),s.addEventListener("pointerdown",yt,{passive:!1}),s.addEventListener("pointermove",Ct,{passive:!1}),s.addEventListener("pointerup",Et,{passive:!1}),s.addEventListener("pointercancel",he),s.addEventListener("lostpointercapture",he),s.addEventListener("click",kt),m.presetSelect?.addEventListener("change",async ie=>{await $e(ie.target.value)}),m.sizeSelect?.addEventListener("change",async ie=>{await ze(ie.target.value)}),m.maxImagesBinding=z.bind(m.maxImagesInput),m.autoToggle?.addEventListener("click",async()=>{await _e()}),s.querySelector(".nd-settings-btn")?.addEventListener("click",()=>{s.classList.remove("expanded"),y(Te(),{source:import.meta.url,operation:"callback"})}),document.addEventListener("click",qe,{passive:!0}),window.addEventListener("resize",ee);const ve=H();ve>=0&&y(_(ve),{source:import.meta.url,operation:"createFloatingButton"})}function Ge(){m.maxImagesBinding?.destroy(),te(),S&&(clearTimeout(S),S=null),window.removeEventListener("resize",ee),document.removeEventListener("click",qe),s?.remove(),s=null,f=null,v=i.IDLE,m={}}function Ye(){u.forEach(e=>{j(e.$cache?.presetSelect)}),j(m.presetSelect),Ft()}function Pt(){u.forEach(e=>{W(e.$cache?.sizeSelect)}),W(m.sizeSelect)}function Ft(){z.updateAll()}function Mt(){const e=k().mode==="auto";u.forEach(t=>{t.root&&(t.root.classList.toggle("auto-on",e),t.$cache.autoToggle?.classList.toggle("on",e))}),s&&(s.classList.toggle("auto-on",e),m.autoToggle?.classList.toggle("on",e))}function jt(){Ye()}function Wt(e,t){t&&!s?Be():!t&&s&&Ge(),e||(u.forEach((n,o)=>{n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),n.root&&ce(o,n.root)}),u.clear(),Y.clear(),L?.disconnect(),L=null)}function Ht(){const e=k();le??=He(st),e.showFloatingButton===!0&&Be()}function Xt(){le?.(),le=null,u.forEach((e,t)=>{e.autoResetTimer&&clearTimeout(e.autoResetTimer),e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e._cleanup?.(),e.root&&ce(t,e.root)}),u.clear(),Y.clear(),L?.disconnect(),L=null,Ge()}export{i as FloatState,nt as SIZE_OPTIONS,Be as createFloatingButton,Ge as destroyFloatingButton,Xt as destroyFloatingPanel,bt as ensureNovelDrawPanel,Ht as initFloatingPanel,Gt as refreshDrawRunUiState,jt as refreshPresetSelect,jt as refreshPresetSelectAll,Yt as releaseNovelDrawPanel,P as setFloatingState,Z as setStateForMessage,Ft as updateAllMaxImagesInputs,Ye as updateAllPresetSelects,Pt as updateAllSizeSelects,Mt as updateAutoModeUI,Wt as updateButtonVisibility};
