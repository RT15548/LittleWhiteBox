import{n as y}from"./async-errors-C4kfchr9.js";import{ut as ne}from"./gallery-cache-kDq4bK5f.js";import{B as Ye,H as ye,V as O,ct as He,d as Ce,lt as Xe,n as ce,rn as Qe,t as Ve,z as ue}from"./message-toolbar-CPPkxdTs.js";import{a as Ee}from"./panel-escape-Dd7NxVql.js";import{_t as I,ht as Te,pt as v,vt as Ke}from"./draw-common-CrEVriaF.js";import{a as Se,i as H,l as ke,o as se,s as T,t as Ie,u as Le}from"./novel-draw-Xz0_5W2M.js";import{a as Je,c as Re,d as Ze,i as be,l as Ne,o as et,r as Ae,s as he,t as De,u as tt}from"./draw-run-ui-state-CA-XgSOW.js";import{getContext as D}from"../../../../../extensions.js";var Pe="xb_novel_float_pos",B=8e3,nt="novelai",a={IDLE:"idle",SUBMITTING:"submitting",ACCEPTED:"accepted",UNCERTAIN:"uncertain",QUEUED:"queued",LLM:"llm",GEN:"gen",COOLDOWN:"cooldown",RECONNECTING:"reconnecting",CANCELLING:"cancelling",BACKEND_LEGACY:"backend_legacy",SUCCESS:"success",PARTIAL:"partial",ERROR:"error"},ot=[{value:"default",label:"跟随预设",width:null,height:null},{value:"auto",label:"AI 自动（按构图）",width:null,height:null},{value:"832x1216",label:"832 × 1216  竖图",width:832,height:1216},{value:"1216x832",label:"1216 × 832  横图",width:1216,height:832},{value:"1024x1024",label:"1024 × 1024  方图",width:1024,height:1024},{value:"768x1280",label:"768 x 1280  大竖",width:768,height:1280},{value:"1280x768",label:"1280 x 768  大横",width:1280,height:768}],u=new Map,j=new Map,L=null,i=null,f=null,b=a.IDLE,$=null,p={success:0,total:0,error:null,startTime:0},k=null,Q=null,J=0,g={},we=!1,le=null,Fe=74,Me=98,rt=`

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
    width: ${Fe}px;
    height: var(--nd-h);
    background: var(--nd-bg);
    border: 1px solid var(--nd-border);
    border-radius: 17px;
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
.nd-float.nd-novel.error .nd-capsule { width: ${Me}px; }

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
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s ease, visibility 0.15s;
    z-index: 100;
}

.nd-float.nd-novel.show-detail .nd-detail {
    opacity: 1;
    visibility: visible;
    transform: none;
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

.nd-float.nd-novel.expanded .nd-menu {
    opacity: 1;
    visibility: visible;
    transform: none;
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
${tt}
.nd-novel .nd-max-images-input { background: var(--nd-bg-active); }
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
}

.nd-floating-global.nd-novel.show-detail .nd-detail {
    transform: none;
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
}

.nd-floating-global.nd-novel.expanded .nd-menu {
    transform: none;
}

/* 悬浮按钮箭头向上 */
.nd-floating-global.nd-novel .nd-arrow { transform: rotate(180deg); }
.nd-floating-global.nd-novel.expanded .nd-arrow { transform: rotate(0deg); }
@media (prefers-reduced-motion: reduce) {
    .nd-novel, .nd-novel * { transition: none !important; animation: none !important; }
}
`;function pe(){if(Ke(),we)return;we=!0;const e=document.createElement("style");e.id="nd-float-styles",e.textContent=rt,document.head.appendChild(e)}function d(e,t,n){const o=document.createElement(e);return t&&(o.className=t),n!==void 0&&(o.textContent=n),o}function c(e){return I(e==="chevron"?"chevron-down":e,"nd-icon")}function fe(){const e=d("span","nd-arrow");return e.appendChild(c("chevron")),e}function Oe(){const e=d("button","nd-btn-menu nd-btn-menu-persist");return e.title="展开菜单",e.appendChild(fe()),e}function W(e){if(!e)return;const t=T(),n=t.paramsPresets||[],o=t.selectedParamsPresetId;e.replaceChildren(),n.forEach(r=>{const s=document.createElement("option");s.value=r.id,s.textContent=r.name||"未命名",r.id===o&&(s.selected=!0),e.appendChild(s)})}function Y(e){if(!e)return;const t=T().overrideSize||"default";e.replaceChildren(),ot.forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.label,n.value===t&&(o.selected=!0),e.appendChild(o)})}var z=Ze({getOverride:()=>T().overrideMaxImages,getPresetMaxImages:()=>{const e=T();return Qe(e.paramsPresets,e.selectedParamsPresetId)},persistOverride:(e,{okText:t})=>Le(n=>{n.overrideMaxImages=e},t),listInputs:()=>[...u.values()].map(e=>e.$cache?.maxImagesInput).concat(g.maxImagesInput),notify:e=>globalThis.toastr?.warning?.(e)});function at(e){return{messageId:e,root:null,state:a.IDLE,result:{success:0,total:0,error:null,startTime:0},autoResetTimer:null,cooldownRafId:null,cooldownEndTime:0,$cache:{},_cleanup:null}}function it(e){const t=T().mode==="auto",n=document.createElement("div");n.className=`nd-float nd-novel lwb-draw-ui${t?" auto-on":""}`,n.dataset.messageId=e;const o=d("div","nd-capsule"),r=d("div","nd-inner"),s=d("div","nd-layer nd-layer-idle"),l=d("button","nd-btn-draw");l.title="点击生成配图",l.appendChild(c("palette")),l.appendChild(d("span","nd-auto-dot"));const m=d("div","nd-sep"),h=d("button","nd-btn-menu");h.title="展开菜单",h.appendChild(fe()),s.append(l,m,h);const F=d("button","nd-layer nd-layer-active");F.append(d("span","nd-status-icon"),d("span","nd-status-text",v.analysis)),r.append(s,F),o.append(r,Oe());const U=d("div","nd-detail"),R=d("div","nd-detail-row");R.append(I("images","nd-detail-icon"),d("span","nd-detail-label","结果"),d("span","nd-detail-value nd-result","-"));const N=d("div","nd-detail-row nd-error-row");N.style.display="none",N.append(I("circle-info","nd-detail-icon"),d("span","nd-detail-label","原因"),d("span","nd-detail-value error nd-error","-"));const C=d("div","nd-detail-row");C.append(I("clock","nd-detail-icon"),d("span","nd-detail-label","耗时"),d("span","nd-detail-value nd-time","-")),U.append(R,N,C);const S=d("div","nd-menu"),x=d("div","nd-card"),E=d("div","nd-row");E.appendChild(d("span","nd-label","预设"));const w=d("select","nd-select nd-preset-select");W(w),E.appendChild(w);const V=d("div","nd-inner-sep"),A=d("div","nd-row");A.appendChild(d("span","nd-label","尺寸"));const K=d("select","nd-select size nd-size-select");Y(K),A.appendChild(K),x.append(E,V,A,z.createRow());const q=d("div","nd-controls"),X=d("div",`nd-auto${t?" on":""} nd-auto-toggle`);X.append(d("span","nd-dot"),d("span","nd-auto-text","自动配图"));const M=d("button","nd-gear nd-settings-btn");return M.title="打开设置",M.appendChild(I("sliders")),q.append(X,M),S.append(x,q),n.append(o,U,S),n}function st(e){const t=e.root;t&&(e.$cache={statusIcon:t.querySelector(".nd-status-icon"),statusText:t.querySelector(".nd-status-text"),result:t.querySelector(".nd-result"),errorRow:t.querySelector(".nd-error-row"),error:t.querySelector(".nd-error"),time:t.querySelector(".nd-time"),presetSelect:t.querySelector(".nd-preset-select"),sizeSelect:t.querySelector(".nd-size-select"),maxImagesInput:t.querySelector(`.${Ne}`),autoToggle:t.querySelector(".nd-auto-toggle")})}function G(e,t,n={}){const o=u.get(e);if(!o?.root)return;const r=o.root;o.state=t,o.autoResetTimer&&(clearTimeout(o.autoResetTimer),o.autoResetTimer=null),t!==a.COOLDOWN&&o.cooldownRafId&&(cancelAnimationFrame(o.cooldownRafId),o.cooldownRafId=null,o.cooldownEndTime=0),r.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:s,statusText:l}=o.$cache;switch(l&&(l.className="nd-status-text"),t){case a.IDLE:o.result={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.replaceChildren(c("upload")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=v.submitting);break;case a.ACCEPTED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.replaceChildren(c(["analysis","retry"].includes(Ae(n))?"spinner":"palette")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=De(n));break;case a.UNCERTAIN:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.replaceChildren(c("rotate")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=v.uncertain);break;case a.QUEUED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.replaceChildren(c("clock")),s.className="nd-status-icon"),l&&(l.textContent=v.queued),o.result.total=n.total||o.result.total||0;break;case a.LLM:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.replaceChildren(c("spinner")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=Te(n));break;case a.GEN:r.classList.add("working"),s&&(s.replaceChildren(c("palette")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=`${n.current||0}/${n.total||0}`),o.result.total=n.total||0;break;case a.COOLDOWN:r.classList.add("cooldown"),s&&(s.replaceChildren(c("spinner")),s.className="nd-status-icon nd-spin"),dt(o,n);break;case a.RECONNECTING:r.classList.add("working"),s&&(s.replaceChildren(c("rotate")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=v.reconnecting);break;case a.CANCELLING:r.classList.add("working"),s&&(s.replaceChildren(c("spinner")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=v.cancelling);break;case a.BACKEND_LEGACY:r.classList.add("working"),s&&(s.replaceChildren(c("share-from-square")),s.className="nd-status-icon"),l&&(l.textContent=v.legacy);break;case a.SUCCESS:r.classList.add("success"),s&&(s.replaceChildren(c("check")),s.className="nd-status-icon"),l&&(l.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>G(e,a.IDLE),B);break;case a.PARTIAL:r.classList.add("partial"),s&&(s.replaceChildren(c("triangle-exclamation")),s.className="nd-status-icon"),l&&(l.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>G(e,a.IDLE),B);break;case a.ERROR:r.classList.add("error"),s&&(s.replaceChildren(c("xmark")),s.className="nd-status-icon"),l&&(l.textContent=n.unknown?v.unknown:v.error),o.result.error=n.error,o.autoResetTimer=setTimeout(()=>G(e,a.IDLE),B);break}}async function _(e,t={}){const n=se(e);if(n){Z(e,n.state,n.data);return}const o=ue(e),r=await Ye(e).catch(()=>null);if(!r||!O(o))return;e=D().chat.indexOf(o.message);const s=se(e);if(s){Z(e,s.state,s.data);return}const l=D(),m=String(l?.chatId||""),h=l?.chat?.[Number(e)];if(!m||!h)return;const F=Number.isInteger(h.swipe_id)?h.swipe_id:0,U=Number.isSafeInteger(r.swipeIndex)?r.swipeIndex:F,R=r.provider||t?.provider||nt,N=r.runId||t?.runId||"",C={chatId:m,messageId:e,swipeIndex:U,provider:R,runId:N},S=Je({detail:t,pending:r.pending,...C}),x=et(S,r,C),E=u.get(e);if(E){const w=he({currentState:E.state,pending:r.pending,detail:x,...C});(w!==E.state||w===a.ACCEPTED&&be(S))&&G(e,w,x)}if(i&&Number(e)===H()){const w=he({currentState:b,pending:r.pending,detail:x,...C});r.pending&&($=Number(e)),(w!==b||w===a.ACCEPTED&&be(S))&&P(w,x)}}function lt(e={}){const t=He(e,D());if(!t)return;const n=H();(u.has(t.messageId)||i&&t.messageId===n)&&y(_(t.messageId,e),{source:import.meta.url,operation:"syncDrawRunActivity"})}function Wt(){const e=H();if(i){const t=e>=0?se(e):null;t?($=e,P(t.state,t.data)):P(a.IDLE)}e>=0&&y(_(e),{source:import.meta.url,operation:"refreshDrawRunUiState"})}function $e({cooldownUntil:e,duration:t}={}){const n=Number(e);return Number.isFinite(n)&&n>0?n:Date.now()+Math.max(0,Number(t)||0)}function dt(e,t){e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e.cooldownEndTime=$e(t);function n(){if(!e.cooldownEndTime)return;const o=Math.max(0,e.cooldownEndTime-Date.now()),r=e.$cache?.statusText;if(r&&(r.textContent=`${(o/1e3).toFixed(1)}s`,r.className="nd-status-text nd-countdown"),o<=0){e.cooldownRafId=null,e.cooldownEndTime=0;return}e.cooldownRafId=requestAnimationFrame(n)}e.cooldownRafId=requestAnimationFrame(n)}function ct(e){const t=u.get(e);if(!t?.root)return;const{result:n,errorRow:o,error:r,time:s}=t.$cache,{result:l,state:m}=t,h=l.startTime?((Date.now()-l.startTime)/1e3).toFixed(1):"-";m===a.SUCCESS||m===a.PARTIAL?(n&&(n.textContent=`${l.success}/${l.total} 成功`,n.className=`nd-detail-value ${m===a.SUCCESS?"success":"warning"}`),o&&(o.style.display=m===a.PARTIAL?"flex":"none"),r&&m===a.PARTIAL&&(r.textContent=`${l.total-l.success} 张失败`)):m===a.ERROR&&(n&&(n.textContent=l.error?.label||ne.redrawFailed,n.className="nd-detail-value error"),o&&(o.style.display="flex"),r&&(r.textContent=l.error?.desc||"未知错误")),s&&(s.textContent=`${h}s`)}async function ut(e){const t=u.get(e);if(!(!t||t.state!==a.IDLE))try{await Se({messageId:e,onStateChange:(n,o,r)=>{Z(r,n,o)}})}catch(n){if(n.drawTaskReported)return;n instanceof Ce||ye(n)?toastr?.info?.(n.message):(console.error(n),toastr?.error?.(n.message))}}async function pt(e){const t=ue(e);try{await Re({cancel:()=>Ie(e,{target:t}),isCurrent:()=>O(t),getState:()=>u.get(D().chat.indexOf(t.message))?.state,setState:n=>G(D().chat.indexOf(t.message),n)})&&O(t)&&toastr?.info?.("正在中止"),O(t)&&await _(D().chat.indexOf(t.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(ne.cancelFailed)}}function ft(e){const{messageId:t,root:n}=e;n.querySelector(".nd-btn-draw")?.addEventListener("click",l=>{l.stopPropagation(),y(ut(t),{source:import.meta.url,operation:"callback"})}),n.querySelectorAll(".nd-btn-menu").forEach(l=>l.addEventListener("click",m=>{m.stopPropagation(),n.classList.remove("show-detail"),n.classList.contains("expanded")||(gt(t),mt(t),vt(t)),n.classList.toggle("expanded")})),n.querySelector(".nd-layer-active")?.addEventListener("click",l=>{l.stopPropagation();const m=e.state;[a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING,a.BACKEND_LEGACY].includes(m)?y(pt(t),{source:import.meta.url,operation:"callback"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(m)&&(ct(t),n.classList.toggle("show-detail"))}),e.$cache.presetSelect?.addEventListener("change",async l=>{await ze(l.target.value)}),e.$cache.sizeSelect?.addEventListener("change",async l=>{await _e(l.target.value)});const o=z.bind(e.$cache.maxImagesInput);e.$cache.autoToggle?.addEventListener("click",async()=>{await Ue()}),n.querySelector(".nd-settings-btn")?.addEventListener("click",l=>{l.stopPropagation(),n.classList.remove("expanded"),y(ke(),{source:import.meta.url,operation:"callback"})});const r=l=>{n.contains(l.target)||n.classList.remove("expanded","show-detail")};document.addEventListener("click",r,{passive:!0});const s=Ee({document,container:n.querySelector(".nd-controls")});e._cleanup=()=>{s?.destroy(),o.destroy(),document.removeEventListener("click",r),e.autoResetTimer&&clearTimeout(e.autoResetTimer),e.autoResetTimer=null,e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e.cooldownRafId=null,e.cooldownEndTime=null}}function gt(e){const t=u.get(e)?.$cache?.presetSelect;W(t)}function mt(e){const t=u.get(e)?.$cache?.sizeSelect;Y(t)}function vt(e){z.fill(u.get(e)?.$cache?.maxImagesInput)}async function ge(e,t,n){const o=await Le(e,t);return o&&typeof n=="function"&&n(),o}async function ze(e){return ge(t=>{t.selectedParamsPresetId=e},"预设已切换",We)}async function _e(e){return ge(t=>{t.overrideSize=e},"尺寸已切换",Ft)}async function Ue(){const e=T().mode==="auto"?"manual":"auto";return ge(t=>{t.mode=e},e==="auto"?"自动配图已开启":"自动配图已关闭",Ot)}function de(e,t){if(u.has(t)){const r=u.get(t);if(r.root?.isConnected)return y(_(t),{source:import.meta.url,operation:"mountFloorPanel"}),r;r._cleanup?.(),u.delete(t)}pe();const n=at(t),o=it(t);return n.root=o,Ve(t,o,{position:"right",id:`novel-draw-${t}`})?(st(n),ft(n),u.set(t,n),y(_(t),{source:import.meta.url,operation:"mountFloorPanel"}),n):null}function bt(){L||(L=new IntersectionObserver(e=>{const t=[];for(const n of e){if(!n.isIntersecting)continue;const o=n.target,r=Number(o.getAttribute("mesid"));j.has(r)&&(t.push({el:o,mid:r}),j.delete(r),L.unobserve(o))}t.length>0&&requestAnimationFrame(()=>{for(const{el:n,mid:o}of t)de(n,o)})},{rootMargin:"300px"}))}function ht(e,t,n={}){if(T().showFloorButton===!1)return null;const{force:o=!1}=n;if(pe(),u.has(t)){const s=u.get(t);if(s.root?.isConnected)return s;s._cleanup?.(),u.delete(t)}if(o)return de(e,t);const r=e.getBoundingClientRect();return r.top<window.innerHeight+500&&r.bottom>-500?de(e,t):(bt(),j.set(t,!0),L.observe(e),null)}function Yt(e,t){L?.unobserve(e),j.delete(t);const n=u.get(t);!n||!e.contains(n.root)||(n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),ce(t,n.root),u.delete(t))}function Z(e,t,n={}){let o=u.get(e);if(!o?.root?.isConnected){const r=document.querySelector(`.mes[mesid="${e}"]`);r&&(o=ht(r,e,{force:!0}))}o&&G(e,t,n),i&&e===H()&&($=e,P(t,n))}function wt(){try{const t=localStorage.getItem(Pe);if(t)return JSON.parse(t)}catch(t){console.warn({source:import.meta.url,operation:"getFloatingPosition"},t)}const e=document.getElementById("xiaobaix-debug-mini");if(e){const t=e.getBoundingClientRect();return{left:t.left,top:t.bottom+8}}return{left:window.innerWidth-110,top:window.innerHeight-80}}var oe=null;function re(e){i&&(oe=e,i.classList.toggle("nd-docked-left",e==="left"),i.classList.toggle("nd-docked-right",e==="right"))}function me(){if(!i)return;const e=parseFloat(i.style.left)||0,t=parseFloat(i.style.top)||0;try{localStorage.setItem(Pe,JSON.stringify({left:Math.round(e),top:Math.round(t),docked:oe||""}))}catch(n){console.warn({source:import.meta.url,operation:"saveFloatingPosition"},n)}}function ee(){if(!i)return;const e=wt(),t=b===a.IDLE?Fe:Me,n=i.offsetHeight||34,o=30,r=e.docked==="left"?0:e.docked==="right"?window.innerWidth-t:e.left;i.style.left=`${Math.max(0,Math.min(r,window.innerWidth-t))}px`,i.style.top=`${Math.max(o,Math.min(e.top,window.innerHeight-n-o))}px`,re(e.docked==="left"||e.docked==="right"?e.docked:null)}function te(){Q&&(cancelAnimationFrame(Q),Q=null),J=0}function xt(e){te(),J=$e(e);function t(){if(!J)return;const n=Math.max(0,J-Date.now()),o=g.statusText;if(o&&(o.textContent=`${(n/1e3).toFixed(1)}s`,o.className="nd-status-text nd-countdown"),n<=0){te();return}Q=requestAnimationFrame(t)}Q=requestAnimationFrame(t)}function P(e,t={}){if(!i)return;const n=b===a.IDLE;b=e,n!==(e===a.IDLE)&&ee(),k&&(clearTimeout(k),k=null),e!==a.COOLDOWN&&te(),i.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:o,statusText:r}=g;if(!(!o||!r))switch(r.className="nd-status-text",e){case a.IDLE:$=null,p={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:i.classList.add("working"),p.startTime||(p.startTime=Date.now()),o.replaceChildren(c("upload")),o.className="nd-status-icon nd-spin",r.textContent=v.submitting;break;case a.ACCEPTED:i.classList.add("working"),p.startTime||(p.startTime=Date.now()),o.replaceChildren(c(["analysis","retry"].includes(Ae(t))?"spinner":"palette")),o.className="nd-status-icon nd-spin",r.textContent=De(t);break;case a.UNCERTAIN:i.classList.add("working"),p.startTime||(p.startTime=Date.now()),o.replaceChildren(c("rotate")),o.className="nd-status-icon nd-spin",r.textContent=v.uncertain;break;case a.QUEUED:i.classList.add("working"),p.startTime||(p.startTime=Date.now()),o.replaceChildren(c("clock")),o.className="nd-status-icon",r.textContent=v.queued;break;case a.LLM:i.classList.add("working"),p.startTime||(p.startTime=Date.now()),o.replaceChildren(c("spinner")),o.className="nd-status-icon nd-spin",r.textContent=Te(t);break;case a.GEN:i.classList.add("working"),o.replaceChildren(c("palette")),o.className="nd-status-icon nd-spin",r.textContent=`${t.current||0}/${t.total||0}`,p.total=t.total||0;break;case a.COOLDOWN:i.classList.add("cooldown"),o.replaceChildren(c("spinner")),o.className="nd-status-icon nd-spin",xt(t);break;case a.RECONNECTING:i.classList.add("working"),o.replaceChildren(c("rotate")),o.className="nd-status-icon nd-spin",r.textContent=v.reconnecting;break;case a.CANCELLING:i.classList.add("working"),o.replaceChildren(c("spinner")),o.className="nd-status-icon nd-spin",r.textContent=v.cancelling;break;case a.BACKEND_LEGACY:i.classList.add("working"),o.replaceChildren(c("share-from-square")),o.className="nd-status-icon",r.textContent=v.legacy;break;case a.SUCCESS:i.classList.add("success"),o.replaceChildren(c("check")),o.className="nd-status-icon",r.textContent=`${t.success}/${t.total}`,p.success=t.success,p.total=t.total,k=setTimeout(()=>P(a.IDLE),B);break;case a.PARTIAL:i.classList.add("partial"),o.replaceChildren(c("triangle-exclamation")),o.className="nd-status-icon",r.textContent=`${t.success}/${t.total}`,p.success=t.success,p.total=t.total,k=setTimeout(()=>P(a.IDLE),B);break;case a.ERROR:i.classList.add("error"),o.replaceChildren(c("xmark")),o.className="nd-status-icon",r.textContent=t.unknown?v.unknown:v.error,p.error=t.error,k=setTimeout(()=>P(a.IDLE),B);break}}function yt(){const{detailResult:e,detailErrorRow:t,detailError:n,detailTime:o}=g;if(!e)return;const r=p.startTime?((Date.now()-p.startTime)/1e3).toFixed(1):"-";b===a.SUCCESS||b===a.PARTIAL?(e.textContent=`${p.success}/${p.total} 成功`,e.className=`nd-detail-value ${b===a.SUCCESS?"success":"warning"}`,t.style.display=b===a.PARTIAL?"flex":"none",b===a.PARTIAL&&(n.textContent=`${p.total-p.success} 张失败`)):b===a.ERROR&&(e.textContent=p.error?.label||ne.redrawFailed,e.className="nd-detail-value error",t.style.display="flex",n.textContent=p.error?.desc||"未知错误"),o.textContent=`${r}s`}function Ct(e){if(!(e.button!==0||f||!e.target.closest(".nd-capsule, .nd-img-jump"))){if(oe){re(null),me(),e.preventDefault();return}f={startX:e.clientX,startY:e.clientY,startLeft:i.getBoundingClientRect().left,startTop:i.getBoundingClientRect().top,pointerId:e.pointerId,moved:!1,originalTarget:e.target};try{e.currentTarget.setPointerCapture(e.pointerId)}catch(t){console.warn({source:import.meta.url,operation:"onFloatingPointerDown"},t)}e.preventDefault()}}function Et(e){if(!f||f.pointerId!==e.pointerId)return;const t=e.clientX-f.startX,n=e.clientY-f.startY;if(!f.moved&&(Math.abs(t)>3||Math.abs(n)>3)&&(f.moved=!0),f.moved){const o=i.offsetWidth||88,r=i.offsetHeight||36,s=30;i.style.left=`${Math.max(0,Math.min(f.startLeft+t,window.innerWidth-o))}px`,i.style.top=`${Math.max(s,Math.min(f.startTop+n,window.innerHeight-r-s))}px`}e.preventDefault()}function Tt(e){if(!f||f.pointerId!==e.pointerId)return;const{moved:t,originalTarget:n}=f;if(f=null,e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId),t){const o=parseFloat(i.style.left)||0,r=i.offsetWidth||88,s=28;let l=null;o<=s?l="left":o>=window.innerWidth-r-s&&(l="right"),l&&(i.style.left=`${l==="left"?0:window.innerWidth-r}px`),re(l),me()}else qe(n)}function xe(e){if(!f||f.pointerId!==e.pointerId)return;const{startLeft:t,startTop:n}=f;f=null,i.style.left=`${t}px`,i.style.top=`${n}px`,e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId)}function St(e){if(e.target.closest(".nd-capsule, .nd-img-jump")&&(e.preventDefault(),e.stopPropagation(),e.detail===0)){if(oe){re(null),me();return}qe(e.target)}}function kt(){return[...document.querySelectorAll("#chat .mes .mes_text .xb-nd-img")].filter(e=>e.offsetHeight>0&&e.offsetWidth>0&&e.querySelector("img"))}function It(e){const t=window.innerHeight/2;let n=null,o=1/0;for(const r of kt()){const s=r.getBoundingClientRect();if(e<0&&s.bottom<t-1){const l=t-s.bottom;l<o&&(o=l,n=r)}else if(e>0&&s.top>t+1){const l=s.top-t;l<o&&(o=l,n=r)}}n&&n.scrollIntoView({behavior:"smooth",block:"center"})}function qe(e){e.closest(".nd-img-jump")?It(e.closest(".nd-img-jump-prev")?-1:1):e.closest(".nd-btn-draw")?y(Lt(),{source:import.meta.url,operation:"routeFloatingClick"}):e.closest(".nd-btn-menu")?(i.classList.remove("show-detail"),i.classList.contains("expanded")||(Nt(),At(),Dt()),i.classList.toggle("expanded")):e.closest(".nd-layer-active")&&([a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING,a.BACKEND_LEGACY].includes(b)?y(Rt(),{source:import.meta.url,operation:"routeFloatingClick"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(b)&&(yt(),i.classList.toggle("show-detail")))}async function Lt(){if(b!==a.IDLE)return;const e=H();if(e<0){toastr?.warning?.("没有可配图的AI消息");return}$=e;try{await Se({messageId:e,onStateChange:(t,n,o)=>{Z(o,t,n)}})}catch(t){if(t.drawTaskReported)return;t instanceof Ce||ye(t)?toastr?.info?.(t.message):(console.error(t),toastr?.error?.(t.message))}}async function Rt(){const e=$,t=ue(e);try{e>=0&&await Re({cancel:()=>Ie(e,{target:t}),isCurrent:()=>O(t)&&$===D().chat.indexOf(t.message),getState:()=>b,setState:P})&&O(t)&&toastr?.info?.("正在中止"),e>=0&&O(t)&&await _(D().chat.indexOf(t.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(ne.cancelFailed)}}function Nt(){W(g.presetSelect)}function At(){Y(g.sizeSelect)}function Dt(){z.fill(g.maxImagesInput)}function Pt(){i&&(g={capsule:i.querySelector(".nd-capsule"),statusIcon:i.querySelector(".nd-status-icon"),statusText:i.querySelector(".nd-status-text"),detailResult:i.querySelector(".nd-result"),detailErrorRow:i.querySelector(".nd-error-row"),detailError:i.querySelector(".nd-error"),detailTime:i.querySelector(".nd-time"),presetSelect:i.querySelector(".nd-preset-select"),sizeSelect:i.querySelector(".nd-size-select"),maxImagesInput:i.querySelector(`.${Ne}`),autoToggle:i.querySelector(".nd-auto-toggle")})}function Be(e){i&&!i.contains(e.target)&&i.classList.remove("expanded","show-detail")}function Ge(){if(i)return;const e=T();if(e.showFloatingButton!==!0)return;pe();const t=e.mode==="auto";i=document.createElement("div"),i.className=`nd-float nd-novel lwb-draw-ui nd-floating-global${t?" auto-on":""}`,i.id="nd-floating-global";const n=d("div","nd-detail"),o=d("div","nd-detail-row");o.append(I("images","nd-detail-icon"),d("span","nd-detail-label","结果"),d("span","nd-detail-value nd-result","-"));const r=d("div","nd-detail-row nd-error-row");r.style.display="none",r.append(I("circle-info","nd-detail-icon"),d("span","nd-detail-label","原因"),d("span","nd-detail-value error nd-error","-"));const s=d("div","nd-detail-row");s.append(I("clock","nd-detail-icon"),d("span","nd-detail-label","耗时"),d("span","nd-detail-value nd-time","-")),n.append(o,r,s);const l=d("div","nd-menu"),m=d("div","nd-card"),h=d("div","nd-row");h.appendChild(d("span","nd-label","预设"));const F=d("select","nd-select nd-preset-select");W(F),h.appendChild(F);const U=d("div","nd-inner-sep"),R=d("div","nd-row");R.appendChild(d("span","nd-label","尺寸"));const N=d("select","nd-select size nd-size-select");Y(N),R.appendChild(N),m.append(h,U,R,z.createRow());const C=d("div","nd-controls"),S=d("div",`nd-auto${t?" on":""} nd-auto-toggle`);S.append(d("span","nd-dot"),d("span","nd-auto-text","自动配图"));const x=d("button","nd-gear nd-settings-btn");x.title="打开设置",x.appendChild(I("sliders")),C.append(S,x),l.append(m,C);const E=d("div","nd-capsule"),w=d("div","nd-inner"),V=d("div","nd-layer nd-layer-idle"),A=d("button","nd-btn-draw");A.title="点击为最后一条AI消息生成配图",A.appendChild(c("palette")),A.appendChild(d("span","nd-auto-dot"));const K=d("div","nd-sep"),q=d("button","nd-btn-menu");q.title="展开菜单",q.appendChild(fe()),V.append(A,K,q);const X=d("button","nd-layer nd-layer-active");X.append(d("span","nd-status-icon"),d("span","nd-status-text",v.analysis)),w.append(V,X),E.append(w,Oe());const M=d("button","nd-img-jump nd-img-jump-prev");M.appendChild(c("chevron")),M.title="跳到上一张图片";const ae=d("button","nd-img-jump nd-img-jump-next");ae.appendChild(c("chevron")),ae.title="跳到下一张图片",i.append(n,l,M,E,ae),document.body.appendChild(i),Pt(),ee(),i.addEventListener("pointerdown",Ct,{passive:!1}),i.addEventListener("pointermove",Et,{passive:!1}),i.addEventListener("pointerup",Tt,{passive:!1}),i.addEventListener("pointercancel",xe),i.addEventListener("lostpointercapture",xe),i.addEventListener("click",St),g.presetSelect?.addEventListener("change",async ie=>{await ze(ie.target.value)}),g.sizeSelect?.addEventListener("change",async ie=>{await _e(ie.target.value)}),g.maxImagesBinding=z.bind(g.maxImagesInput),g.themeSwitch=Ee({document,container:i.querySelector(".nd-controls")}),g.autoToggle?.addEventListener("click",async()=>{await Ue()}),i.querySelector(".nd-settings-btn")?.addEventListener("click",()=>{i.classList.remove("expanded"),y(ke(),{source:import.meta.url,operation:"callback"})}),document.addEventListener("click",Be,{passive:!0}),window.addEventListener("resize",ee);const ve=H();ve>=0&&y(_(ve),{source:import.meta.url,operation:"createFloatingButton"})}function je(){g.themeSwitch?.destroy(),g.maxImagesBinding?.destroy(),te(),k&&(clearTimeout(k),k=null),window.removeEventListener("resize",ee),document.removeEventListener("click",Be),i?.remove(),i=null,f=null,b=a.IDLE,g={}}function We(){u.forEach(e=>{W(e.$cache?.presetSelect)}),W(g.presetSelect),Mt()}function Ft(){u.forEach(e=>{Y(e.$cache?.sizeSelect)}),Y(g.sizeSelect)}function Mt(){z.updateAll()}function Ot(){const e=T().mode==="auto";u.forEach(t=>{t.root&&(t.root.classList.toggle("auto-on",e),t.$cache.autoToggle?.classList.toggle("on",e))}),i&&(i.classList.toggle("auto-on",e),g.autoToggle?.classList.toggle("on",e))}function Ht(){We()}function Xt(e,t){t&&!i?Ge():!t&&i&&je(),e||(u.forEach((n,o)=>{n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),n.root&&ce(o,n.root)}),u.clear(),j.clear(),L?.disconnect(),L=null)}function Qt(){const e=T();le??=Xe(lt),e.showFloatingButton===!0&&Ge()}function Vt(){le?.(),le=null,u.forEach((e,t)=>{e.autoResetTimer&&clearTimeout(e.autoResetTimer),e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e._cleanup?.(),e.root&&ce(t,e.root)}),u.clear(),j.clear(),L?.disconnect(),L=null,je()}export{a as FloatState,ot as SIZE_OPTIONS,Ge as createFloatingButton,je as destroyFloatingButton,Vt as destroyFloatingPanel,ht as ensureNovelDrawPanel,Qt as initFloatingPanel,Wt as refreshDrawRunUiState,Ht as refreshPresetSelect,Ht as refreshPresetSelectAll,Yt as releaseNovelDrawPanel,P as setFloatingState,Z as setStateForMessage,Mt as updateAllMaxImagesInputs,We as updateAllPresetSelects,Ft as updateAllSizeSelects,Ot as updateAutoModeUI,Xt as updateButtonVisibility};
