import{n as y}from"./async-errors-C4kfchr9.js";import{lt as te}from"./gallery-cache-CRDLh0wm.js";import{B as Ve,H as Ce,V as M,ct as He,d as Ee,lt as Qe,n as ce,rn as Xe,t as Ke,z as ue}from"./message-toolbar-BtaONFBq.js";import{a as Te}from"./panel-escape-Dd7NxVql.js";import{gt as Se,mt as v,vt as I,yt as Je}from"./draw-common-QmOIAI-g.js";import{a as ke,i as V,l as Ie,o as ie,s as T,t as Le,u as Re}from"./novel-draw-gW0SDLkF.js";import{a as Ze,c as Ne,d as et,f as tt,i as be,l as Ae,m as nt,o as ot,p as pe,r as De,s as xe,t as Pe,u as rt}from"./draw-run-ui-state-BgPjYQhU.js";import{getContext as D}from"../../../../../extensions.js";var Fe="xb_novel_float_pos",B=8e3,at="novelai",a={IDLE:"idle",SUBMITTING:"submitting",ACCEPTED:"accepted",UNCERTAIN:"uncertain",QUEUED:"queued",LLM:"llm",GEN:"gen",COOLDOWN:"cooldown",RECONNECTING:"reconnecting",CANCELLING:"cancelling",BACKEND_LEGACY:"backend_legacy",SUCCESS:"success",PARTIAL:"partial",ERROR:"error"},it=[{value:"default",label:"跟随预设",width:null,height:null},{value:"auto",label:"AI 自动（按构图）",width:null,height:null},{value:"832x1216",label:"832 × 1216  竖图",width:832,height:1216},{value:"1216x832",label:"1216 × 832  横图",width:1216,height:832},{value:"1024x1024",label:"1024 × 1024  方图",width:1024,height:1024},{value:"768x1280",label:"768 x 1280  大竖",width:768,height:1280},{value:"1280x768",label:"1280 x 768  大横",width:1280,height:768}],u=new Map,j=new Map,L=null,i=null,m=null,h=a.IDLE,$=null,f={success:0,total:0,error:null,startTime:0},k=null,Q=null,J=0,g={},we=!1,se=null,Oe=74,Me=98,st=`

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
    width: ${Oe}px;
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
${rt}
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

${tt}
@media (prefers-reduced-motion: reduce) {
    .nd-novel, .nd-novel * { transition: none !important; animation: none !important; }
}
`;function fe(){if(Je(),we)return;we=!0;const e=document.createElement("style");e.id="nd-float-styles",e.textContent=st,document.head.appendChild(e)}function d(e,t,n){const o=document.createElement(e);return t&&(o.className=t),n!==void 0&&(o.textContent=n),o}function c(e){return I(e==="chevron"?"chevron-down":e,"nd-icon")}function ge(){const e=d("span","nd-arrow");return e.appendChild(c("chevron")),e}function $e(){const e=d("button","nd-btn-menu nd-btn-menu-persist");return e.title="展开菜单",e.appendChild(ge()),e}function Y(e){if(!e)return;const t=T(),n=t.paramsPresets||[],o=t.selectedParamsPresetId;e.replaceChildren(),n.forEach(r=>{const s=document.createElement("option");s.value=r.id,s.textContent=r.name||"未命名",r.id===o&&(s.selected=!0),e.appendChild(s)})}function W(e){if(!e)return;const t=T().overrideSize||"default";e.replaceChildren(),it.forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.label,n.value===t&&(o.selected=!0),e.appendChild(o)})}var z=et({getOverride:()=>T().overrideMaxImages,getPresetMaxImages:()=>{const e=T();return Xe(e.paramsPresets,e.selectedParamsPresetId)},persistOverride:(e,{okText:t})=>Re(n=>{n.overrideMaxImages=e},t),listInputs:()=>[...u.values()].map(e=>e.$cache?.maxImagesInput).concat(g.maxImagesInput),notify:e=>globalThis.toastr?.warning?.(e)});function lt(e){return{messageId:e,root:null,state:a.IDLE,result:{success:0,total:0,error:null,startTime:0},autoResetTimer:null,cooldownRafId:null,cooldownEndTime:0,$cache:{},_cleanup:null}}function dt(e){const t=T().mode==="auto",n=document.createElement("div");n.className=`nd-float nd-novel lwb-draw-ui${t?" auto-on":""}`,n.dataset.messageId=e;const o=d("div","nd-capsule"),r=d("div","nd-inner"),s=d("div","nd-layer nd-layer-idle"),l=d("button","nd-btn-draw");l.title="点击生成配图",l.appendChild(c("palette")),l.appendChild(d("span","nd-auto-dot"));const p=d("div","nd-sep"),b=d("button","nd-btn-menu");b.title="展开菜单",b.appendChild(ge()),s.append(l,p,b);const F=d("button","nd-layer nd-layer-active");F.append(d("span","nd-status-icon"),d("span","nd-status-text",v.analysis)),r.append(s,F),o.append(r,$e());const U=d("div","nd-detail"),R=d("div","nd-detail-row");R.append(I("images","nd-detail-icon"),d("span","nd-detail-label","结果"),d("span","nd-detail-value nd-result","-"));const N=d("div","nd-detail-row nd-error-row");N.style.display="none",N.append(I("circle-info","nd-detail-icon"),d("span","nd-detail-label","原因"),d("span","nd-detail-value error nd-error","-"));const C=d("div","nd-detail-row");C.append(I("clock","nd-detail-icon"),d("span","nd-detail-label","耗时"),d("span","nd-detail-value nd-time","-")),U.append(R,N,C);const S=d("div","nd-menu"),w=d("div","nd-card"),E=d("div","nd-row");E.appendChild(d("span","nd-label","预设"));const x=d("select","nd-select nd-preset-select");Y(x),E.appendChild(x);const X=d("div","nd-inner-sep"),A=d("div","nd-row");A.appendChild(d("span","nd-label","尺寸"));const K=d("select","nd-select size nd-size-select");W(K),A.appendChild(K),w.append(E,X,A,z.createRow());const q=d("div","nd-controls"),H=d("div",`nd-auto${t?" on":""} nd-auto-toggle`);H.append(d("span","nd-dot"),d("span","nd-auto-text","自动配图"));const O=d("button","nd-gear nd-settings-btn");return O.title="打开设置",O.appendChild(I("sliders")),q.append(H,O),S.append(w,q),n.append(o,U,S),n}function ct(e){const t=e.root;t&&(e.$cache={statusIcon:t.querySelector(".nd-status-icon"),statusText:t.querySelector(".nd-status-text"),result:t.querySelector(".nd-result"),errorRow:t.querySelector(".nd-error-row"),error:t.querySelector(".nd-error"),time:t.querySelector(".nd-time"),presetSelect:t.querySelector(".nd-preset-select"),sizeSelect:t.querySelector(".nd-size-select"),maxImagesInput:t.querySelector(`.${Ae}`),autoToggle:t.querySelector(".nd-auto-toggle")})}function G(e,t,n={}){const o=u.get(e);if(!o?.root)return;const r=o.root;o.state=t,o.autoResetTimer&&(clearTimeout(o.autoResetTimer),o.autoResetTimer=null),t!==a.COOLDOWN&&o.cooldownRafId&&(cancelAnimationFrame(o.cooldownRafId),o.cooldownRafId=null,o.cooldownEndTime=0),r.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:s,statusText:l}=o.$cache;switch(l&&(l.className="nd-status-text"),t){case a.IDLE:o.result={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.replaceChildren(c("upload")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=v.submitting);break;case a.ACCEPTED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.replaceChildren(c(["analysis","retry"].includes(De(n))?"spinner":"palette")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=Pe(n));break;case a.UNCERTAIN:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.replaceChildren(c("rotate")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=v.uncertain);break;case a.QUEUED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.replaceChildren(c("clock")),s.className="nd-status-icon"),l&&(l.textContent=v.queued),o.result.total=n.total||o.result.total||0;break;case a.LLM:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),s&&(s.replaceChildren(c("spinner")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=Se(n));break;case a.GEN:r.classList.add("working"),s&&(s.replaceChildren(c("palette")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=`${n.current||0}/${n.total||0}`),o.result.total=n.total||0;break;case a.COOLDOWN:r.classList.add("cooldown"),s&&(s.replaceChildren(c("spinner")),s.className="nd-status-icon nd-spin"),pt(o,n);break;case a.RECONNECTING:r.classList.add("working"),s&&(s.replaceChildren(c("rotate")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=v.reconnecting);break;case a.CANCELLING:r.classList.add("working"),s&&(s.replaceChildren(c("spinner")),s.className="nd-status-icon nd-spin"),l&&(l.textContent=v.cancelling);break;case a.BACKEND_LEGACY:r.classList.add("working"),s&&(s.replaceChildren(c("share-from-square")),s.className="nd-status-icon"),l&&(l.textContent=v.legacy);break;case a.SUCCESS:r.classList.add("success"),s&&(s.replaceChildren(c("check")),s.className="nd-status-icon"),l&&(l.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>G(e,a.IDLE),B);break;case a.PARTIAL:r.classList.add("partial"),s&&(s.replaceChildren(c("triangle-exclamation")),s.className="nd-status-icon"),l&&(l.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>G(e,a.IDLE),B);break;case a.ERROR:r.classList.add("error"),s&&(s.replaceChildren(c("xmark")),s.className="nd-status-icon"),l&&(l.textContent=n.unknown?v.unknown:v.error),o.result.error=n.error,o.autoResetTimer=setTimeout(()=>G(e,a.IDLE),B);break}}async function _(e,t={}){const n=ie(e);if(n){Z(e,n.state,n.data);return}const o=ue(e),r=await Ve(e).catch(()=>null);if(!r||!M(o))return;e=D().chat.indexOf(o.message);const s=ie(e);if(s){Z(e,s.state,s.data);return}const l=D(),p=String(l?.chatId||""),b=l?.chat?.[Number(e)];if(!p||!b)return;const F=Number.isInteger(b.swipe_id)?b.swipe_id:0,U=Number.isSafeInteger(r.swipeIndex)?r.swipeIndex:F,R=r.provider||t?.provider||at,N=r.runId||t?.runId||"",C={chatId:p,messageId:e,swipeIndex:U,provider:R,runId:N},S=Ze({detail:t,pending:r.pending,...C}),w=ot(S,r,C),E=u.get(e);if(E){const x=xe({currentState:E.state,pending:r.pending,detail:w,...C});(x!==E.state||x===a.ACCEPTED&&be(S))&&G(e,x,w)}if(i&&Number(e)===V()){const x=xe({currentState:h,pending:r.pending,detail:w,...C});r.pending&&($=Number(e)),(x!==h||x===a.ACCEPTED&&be(S))&&P(x,w)}}function ut(e={}){const t=He(e,D());if(!t)return;const n=V();(u.has(t.messageId)||i&&t.messageId===n)&&y(_(t.messageId,e),{source:import.meta.url,operation:"syncDrawRunActivity"})}function Ht(){const e=V();if(i){const t=e>=0?ie(e):null;t?($=e,P(t.state,t.data)):P(a.IDLE)}e>=0&&y(_(e),{source:import.meta.url,operation:"refreshDrawRunUiState"})}function ze({cooldownUntil:e,duration:t}={}){const n=Number(e);return Number.isFinite(n)&&n>0?n:Date.now()+Math.max(0,Number(t)||0)}function pt(e,t){e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e.cooldownEndTime=ze(t);function n(){if(!e.cooldownEndTime)return;const o=Math.max(0,e.cooldownEndTime-Date.now()),r=e.$cache?.statusText;if(r&&(r.textContent=`${(o/1e3).toFixed(1)}s`,r.className="nd-status-text nd-countdown"),o<=0){e.cooldownRafId=null,e.cooldownEndTime=0;return}e.cooldownRafId=requestAnimationFrame(n)}e.cooldownRafId=requestAnimationFrame(n)}function ft(e){const t=u.get(e);if(!t?.root)return;const{result:n,errorRow:o,error:r,time:s}=t.$cache,{result:l,state:p}=t,b=l.startTime?((Date.now()-l.startTime)/1e3).toFixed(1):"-";p===a.SUCCESS||p===a.PARTIAL?(n&&(n.textContent=`${l.success}/${l.total} 成功`,n.className=`nd-detail-value ${p===a.SUCCESS?"success":"warning"}`),o&&(o.style.display=p===a.PARTIAL?"flex":"none"),r&&p===a.PARTIAL&&(r.textContent=`${l.total-l.success} 张失败`)):p===a.ERROR&&(n&&(n.textContent=l.error?.label||te.redrawFailed,n.className="nd-detail-value error"),o&&(o.style.display="flex"),r&&(r.textContent=l.error?.desc||"未知错误")),s&&(s.textContent=`${b}s`)}async function gt(e){const t=u.get(e);if(!(!t||t.state!==a.IDLE))try{await ke({messageId:e,onStateChange:(n,o,r)=>{Z(r,n,o)}})}catch(n){if(n.drawTaskReported)return;n instanceof Ee||Ce(n)?toastr?.info?.(n.message):(console.error(n),toastr?.error?.(n.message))}}async function mt(e){const t=ue(e);try{await Ne({cancel:()=>Le(e,{target:t}),isCurrent:()=>M(t),getState:()=>u.get(D().chat.indexOf(t.message))?.state,setState:n=>G(D().chat.indexOf(t.message),n)})&&M(t)&&toastr?.info?.("正在中止"),M(t)&&await _(D().chat.indexOf(t.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(te.cancelFailed)}}function vt(e){const{messageId:t,root:n}=e;n.querySelector(".nd-btn-draw")?.addEventListener("click",l=>{l.stopPropagation(),y(gt(t),{source:import.meta.url,operation:"callback"})}),n.querySelectorAll(".nd-btn-menu").forEach(l=>l.addEventListener("click",p=>{p.stopPropagation(),n.classList.remove("show-detail"),n.classList.contains("expanded")||(ht(t),bt(t),xt(t)),n.classList.toggle("expanded")})),n.querySelector(".nd-layer-active")?.addEventListener("click",l=>{l.stopPropagation();const p=e.state;[a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING,a.BACKEND_LEGACY].includes(p)?y(mt(t),{source:import.meta.url,operation:"callback"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(p)&&(ft(t),n.classList.toggle("show-detail"))}),e.$cache.presetSelect?.addEventListener("change",async l=>{await _e(l.target.value)}),e.$cache.sizeSelect?.addEventListener("change",async l=>{await Ue(l.target.value)});const o=z.bind(e.$cache.maxImagesInput);e.$cache.autoToggle?.addEventListener("click",async()=>{await qe()}),n.querySelector(".nd-settings-btn")?.addEventListener("click",l=>{l.stopPropagation(),n.classList.remove("expanded"),y(Ie(),{source:import.meta.url,operation:"callback"})});const r=l=>{n.contains(l.target)||n.classList.remove("expanded","show-detail")};document.addEventListener("click",r,{passive:!0});const s=Te({document,container:n.querySelector(".nd-controls")});e._cleanup=()=>{s?.destroy(),o.destroy(),document.removeEventListener("click",r),e.autoResetTimer&&clearTimeout(e.autoResetTimer),e.autoResetTimer=null,e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e.cooldownRafId=null,e.cooldownEndTime=null}}function ht(e){const t=u.get(e)?.$cache?.presetSelect;Y(t)}function bt(e){const t=u.get(e)?.$cache?.sizeSelect;W(t)}function xt(e){z.fill(u.get(e)?.$cache?.maxImagesInput)}async function me(e,t,n){const o=await Re(e,t);return o&&typeof n=="function"&&n(),o}async function _e(e){return me(t=>{t.selectedParamsPresetId=e},"预设已切换",We)}async function Ue(e){return me(t=>{t.overrideSize=e},"尺寸已切换",$t)}async function qe(){const e=T().mode==="auto"?"manual":"auto";return me(t=>{t.mode=e},e==="auto"?"自动配图已开启":"自动配图已关闭",_t)}function le(e,t){if(u.has(t)){const r=u.get(t);if(r.root?.isConnected)return y(_(t),{source:import.meta.url,operation:"mountFloorPanel"}),r;r._cleanup?.(),u.delete(t)}fe();const n=lt(t),o=dt(t);return n.root=o,Ke(t,o,{position:"right",id:`novel-draw-${t}`})?(ct(n),vt(n),u.set(t,n),y(_(t),{source:import.meta.url,operation:"mountFloorPanel"}),n):null}function wt(){L||(L=new IntersectionObserver(e=>{const t=[];for(const n of e){if(!n.isIntersecting)continue;const o=n.target,r=Number(o.getAttribute("mesid"));j.has(r)&&(t.push({el:o,mid:r}),j.delete(r),L.unobserve(o))}t.length>0&&requestAnimationFrame(()=>{for(const{el:n,mid:o}of t)le(n,o)})},{rootMargin:"300px"}))}function yt(e,t,n={}){if(T().showFloorButton===!1)return null;const{force:o=!1}=n;if(fe(),u.has(t)){const s=u.get(t);if(s.root?.isConnected)return s;s._cleanup?.(),u.delete(t)}if(o)return le(e,t);const r=e.getBoundingClientRect();return r.top<window.innerHeight+500&&r.bottom>-500?le(e,t):(wt(),j.set(t,!0),L.observe(e),null)}function Qt(e,t){L?.unobserve(e),j.delete(t);const n=u.get(t);!n||!e.contains(n.root)||(n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),ce(t,n.root),u.delete(t))}function Z(e,t,n={}){let o=u.get(e);if(!o?.root?.isConnected){const r=document.querySelector(`.mes[mesid="${e}"]`);r&&(o=yt(r,e,{force:!0}))}o&&G(e,t,n),i&&e===V()&&($=e,P(t,n))}function Ct(){try{const t=localStorage.getItem(Fe);if(t)return JSON.parse(t)}catch(t){console.warn({source:import.meta.url,operation:"getFloatingPosition"},t)}const e=document.getElementById("xiaobaix-debug-mini");if(e){const t=e.getBoundingClientRect();return{left:t.left,top:t.bottom+8}}return{left:window.innerWidth-110,top:window.innerHeight-80}}var ne=null;function oe(e){i&&(ne=e,i.classList.toggle("nd-docked-left",e==="left"),i.classList.toggle("nd-docked-right",e==="right"))}function ve(){if(!i)return;const e=parseFloat(i.style.left)||0,t=parseFloat(i.style.top)||0;try{localStorage.setItem(Fe,JSON.stringify({left:Math.round(e),top:Math.round(t),docked:ne||""}))}catch(n){console.warn({source:import.meta.url,operation:"saveFloatingPosition"},n)}}function de(){if(!i)return;const e=Ct(),t=pe(),n=h===a.IDLE?Oe:Me,o=i.offsetHeight||34,r=30,s=e.docked==="left"?t.left:e.docked==="right"?t.right-n:e.left;i.style.left=`${Math.max(t.left,Math.min(s,t.right-n))}px`,i.style.top=`${Math.max(t.top+r,Math.min(e.top,t.bottom-o-r))}px`,oe(e.docked==="left"||e.docked==="right"?e.docked:null)}function ee(){Q&&(cancelAnimationFrame(Q),Q=null),J=0}function Et(e){ee(),J=ze(e);function t(){if(!J)return;const n=Math.max(0,J-Date.now()),o=g.statusText;if(o&&(o.textContent=`${(n/1e3).toFixed(1)}s`,o.className="nd-status-text nd-countdown"),n<=0){ee();return}Q=requestAnimationFrame(t)}Q=requestAnimationFrame(t)}function P(e,t={}){if(!i)return;const n=h===a.IDLE;h=e,n!==(e===a.IDLE)&&de(),k&&(clearTimeout(k),k=null),e!==a.COOLDOWN&&ee(),i.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:o,statusText:r}=g;if(!(!o||!r))switch(r.className="nd-status-text",e){case a.IDLE:$=null,f={success:0,total:0,error:null,startTime:0};break;case a.SUBMITTING:i.classList.add("working"),f.startTime||(f.startTime=Date.now()),o.replaceChildren(c("upload")),o.className="nd-status-icon nd-spin",r.textContent=v.submitting;break;case a.ACCEPTED:i.classList.add("working"),f.startTime||(f.startTime=Date.now()),o.replaceChildren(c(["analysis","retry"].includes(De(t))?"spinner":"palette")),o.className="nd-status-icon nd-spin",r.textContent=Pe(t);break;case a.UNCERTAIN:i.classList.add("working"),f.startTime||(f.startTime=Date.now()),o.replaceChildren(c("rotate")),o.className="nd-status-icon nd-spin",r.textContent=v.uncertain;break;case a.QUEUED:i.classList.add("working"),f.startTime||(f.startTime=Date.now()),o.replaceChildren(c("clock")),o.className="nd-status-icon",r.textContent=v.queued;break;case a.LLM:i.classList.add("working"),f.startTime||(f.startTime=Date.now()),o.replaceChildren(c("spinner")),o.className="nd-status-icon nd-spin",r.textContent=Se(t);break;case a.GEN:i.classList.add("working"),o.replaceChildren(c("palette")),o.className="nd-status-icon nd-spin",r.textContent=`${t.current||0}/${t.total||0}`,f.total=t.total||0;break;case a.COOLDOWN:i.classList.add("cooldown"),o.replaceChildren(c("spinner")),o.className="nd-status-icon nd-spin",Et(t);break;case a.RECONNECTING:i.classList.add("working"),o.replaceChildren(c("rotate")),o.className="nd-status-icon nd-spin",r.textContent=v.reconnecting;break;case a.CANCELLING:i.classList.add("working"),o.replaceChildren(c("spinner")),o.className="nd-status-icon nd-spin",r.textContent=v.cancelling;break;case a.BACKEND_LEGACY:i.classList.add("working"),o.replaceChildren(c("share-from-square")),o.className="nd-status-icon",r.textContent=v.legacy;break;case a.SUCCESS:i.classList.add("success"),o.replaceChildren(c("check")),o.className="nd-status-icon",r.textContent=`${t.success}/${t.total}`,f.success=t.success,f.total=t.total,k=setTimeout(()=>P(a.IDLE),B);break;case a.PARTIAL:i.classList.add("partial"),o.replaceChildren(c("triangle-exclamation")),o.className="nd-status-icon",r.textContent=`${t.success}/${t.total}`,f.success=t.success,f.total=t.total,k=setTimeout(()=>P(a.IDLE),B);break;case a.ERROR:i.classList.add("error"),o.replaceChildren(c("xmark")),o.className="nd-status-icon",r.textContent=t.unknown?v.unknown:v.error,f.error=t.error,k=setTimeout(()=>P(a.IDLE),B);break}}function Tt(){const{detailResult:e,detailErrorRow:t,detailError:n,detailTime:o}=g;if(!e)return;const r=f.startTime?((Date.now()-f.startTime)/1e3).toFixed(1):"-";h===a.SUCCESS||h===a.PARTIAL?(e.textContent=`${f.success}/${f.total} 成功`,e.className=`nd-detail-value ${h===a.SUCCESS?"success":"warning"}`,t.style.display=h===a.PARTIAL?"flex":"none",h===a.PARTIAL&&(n.textContent=`${f.total-f.success} 张失败`)):h===a.ERROR&&(e.textContent=f.error?.label||te.redrawFailed,e.className="nd-detail-value error",t.style.display="flex",n.textContent=f.error?.desc||"未知错误"),o.textContent=`${r}s`}function St(e){if(!(e.button!==0||m||!e.target.closest(".nd-capsule, .nd-img-jump"))){if(ne){oe(null),ve(),e.preventDefault();return}m={startX:e.clientX,startY:e.clientY,startLeft:i.getBoundingClientRect().left,startTop:i.getBoundingClientRect().top,pointerId:e.pointerId,moved:!1,originalTarget:e.target};try{e.currentTarget.setPointerCapture(e.pointerId)}catch(t){console.warn({source:import.meta.url,operation:"onFloatingPointerDown"},t)}e.preventDefault()}}function kt(e){if(!m||m.pointerId!==e.pointerId)return;const t=e.clientX-m.startX,n=e.clientY-m.startY;if(!m.moved&&(Math.abs(t)>3||Math.abs(n)>3)&&(m.moved=!0),m.moved){const o=pe(),r=i.offsetWidth||88,s=i.offsetHeight||36,l=30;i.style.left=`${Math.max(o.left,Math.min(m.startLeft+t,o.right-r))}px`,i.style.top=`${Math.max(o.top+l,Math.min(m.startTop+n,o.bottom-s-l))}px`}e.preventDefault()}function It(e){if(!m||m.pointerId!==e.pointerId)return;const{moved:t,originalTarget:n}=m;if(m=null,e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId),t){const o=parseFloat(i.style.left)||0,r=i.offsetWidth||88,s=28,l=pe();let p=null;o<=l.left+s?p="left":o>=l.right-r-s&&(p="right"),p&&(i.style.left=`${p==="left"?l.left:l.right-r}px`),oe(p),ve()}else Be(n)}function ye(e){if(!m||m.pointerId!==e.pointerId)return;const{startLeft:t,startTop:n}=m;m=null,i.style.left=`${t}px`,i.style.top=`${n}px`,e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId)}function Lt(e){if(e.target.closest(".nd-capsule, .nd-img-jump")&&(e.preventDefault(),e.stopPropagation(),e.detail===0)){if(ne){oe(null),ve();return}Be(e.target)}}function Rt(){return[...document.querySelectorAll("#chat .mes .mes_text .xb-nd-img")].filter(e=>e.offsetHeight>0&&e.offsetWidth>0&&e.querySelector("img"))}function Nt(e){const t=window.innerHeight/2;let n=null,o=1/0;for(const r of Rt()){const s=r.getBoundingClientRect();if(e<0&&s.bottom<t-1){const l=t-s.bottom;l<o&&(o=l,n=r)}else if(e>0&&s.top>t+1){const l=s.top-t;l<o&&(o=l,n=r)}}n&&n.scrollIntoView({behavior:"smooth",block:"center"})}function Be(e){e.closest(".nd-img-jump")?Nt(e.closest(".nd-img-jump-prev")?-1:1):e.closest(".nd-btn-draw")?y(At(),{source:import.meta.url,operation:"routeFloatingClick"}):e.closest(".nd-btn-menu")?(i.classList.remove("show-detail"),i.classList.contains("expanded")||(Pt(),Ft(),Ot()),i.classList.toggle("expanded")):e.closest(".nd-layer-active")&&([a.SUBMITTING,a.ACCEPTED,a.UNCERTAIN,a.QUEUED,a.LLM,a.GEN,a.COOLDOWN,a.RECONNECTING,a.BACKEND_LEGACY].includes(h)?y(Dt(),{source:import.meta.url,operation:"routeFloatingClick"}):[a.SUCCESS,a.PARTIAL,a.ERROR].includes(h)&&(Tt(),i.classList.toggle("show-detail")))}async function At(){if(h!==a.IDLE)return;const e=V();if(e<0){toastr?.warning?.("没有可配图的AI消息");return}$=e;try{await ke({messageId:e,onStateChange:(t,n,o)=>{Z(o,t,n)}})}catch(t){if(t.drawTaskReported)return;t instanceof Ee||Ce(t)?toastr?.info?.(t.message):(console.error(t),toastr?.error?.(t.message))}}async function Dt(){const e=$,t=ue(e);try{e>=0&&await Ne({cancel:()=>Le(e,{target:t}),isCurrent:()=>M(t)&&$===D().chat.indexOf(t.message),getState:()=>h,setState:P})&&M(t)&&toastr?.info?.("正在中止"),e>=0&&M(t)&&await _(D().chat.indexOf(t.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(te.cancelFailed)}}function Pt(){Y(g.presetSelect)}function Ft(){W(g.sizeSelect)}function Ot(){z.fill(g.maxImagesInput)}function Mt(){i&&(g={capsule:i.querySelector(".nd-capsule"),statusIcon:i.querySelector(".nd-status-icon"),statusText:i.querySelector(".nd-status-text"),detailResult:i.querySelector(".nd-result"),detailErrorRow:i.querySelector(".nd-error-row"),detailError:i.querySelector(".nd-error"),detailTime:i.querySelector(".nd-time"),presetSelect:i.querySelector(".nd-preset-select"),sizeSelect:i.querySelector(".nd-size-select"),maxImagesInput:i.querySelector(`.${Ae}`),autoToggle:i.querySelector(".nd-auto-toggle")})}function Ge(e){i&&!i.contains(e.target)&&i.classList.remove("expanded","show-detail")}function je(){if(i)return;const e=T();if(e.showFloatingButton!==!0)return;fe();const t=e.mode==="auto";i=document.createElement("div"),i.className=`nd-float nd-novel lwb-draw-ui nd-floating-global${t?" auto-on":""}`,i.id="nd-floating-global";const n=d("div","nd-detail"),o=d("div","nd-detail-row");o.append(I("images","nd-detail-icon"),d("span","nd-detail-label","结果"),d("span","nd-detail-value nd-result","-"));const r=d("div","nd-detail-row nd-error-row");r.style.display="none",r.append(I("circle-info","nd-detail-icon"),d("span","nd-detail-label","原因"),d("span","nd-detail-value error nd-error","-"));const s=d("div","nd-detail-row");s.append(I("clock","nd-detail-icon"),d("span","nd-detail-label","耗时"),d("span","nd-detail-value nd-time","-")),n.append(o,r,s);const l=d("div","nd-menu"),p=d("div","nd-card"),b=d("div","nd-row");b.appendChild(d("span","nd-label","预设"));const F=d("select","nd-select nd-preset-select");Y(F),b.appendChild(F);const U=d("div","nd-inner-sep"),R=d("div","nd-row");R.appendChild(d("span","nd-label","尺寸"));const N=d("select","nd-select size nd-size-select");W(N),R.appendChild(N),p.append(b,U,R,z.createRow());const C=d("div","nd-controls"),S=d("div",`nd-auto${t?" on":""} nd-auto-toggle`);S.append(d("span","nd-dot"),d("span","nd-auto-text","自动配图"));const w=d("button","nd-gear nd-settings-btn");w.title="打开设置",w.appendChild(I("sliders")),C.append(S,w),l.append(p,C);const E=d("div","nd-capsule"),x=d("div","nd-inner"),X=d("div","nd-layer nd-layer-idle"),A=d("button","nd-btn-draw");A.title="点击为最后一条AI消息生成配图",A.appendChild(c("palette")),A.appendChild(d("span","nd-auto-dot"));const K=d("div","nd-sep"),q=d("button","nd-btn-menu");q.title="展开菜单",q.appendChild(ge()),X.append(A,K,q);const H=d("button","nd-layer nd-layer-active");H.append(d("span","nd-status-icon"),d("span","nd-status-text",v.analysis)),x.append(X,H),E.append(x,$e());const O=d("button","nd-img-jump nd-img-jump-prev");O.appendChild(c("chevron")),O.title="跳到上一张图片";const re=d("button","nd-img-jump nd-img-jump-next");re.appendChild(c("chevron")),re.title="跳到下一张图片",i.append(n,l,O,E,re),document.body.appendChild(i),Mt(),de(),i.addEventListener("pointerdown",St,{passive:!1}),i.addEventListener("pointermove",kt,{passive:!1}),i.addEventListener("pointerup",It,{passive:!1}),i.addEventListener("pointercancel",ye),i.addEventListener("lostpointercapture",ye),i.addEventListener("click",Lt),g.presetSelect?.addEventListener("change",async ae=>{await _e(ae.target.value)}),g.sizeSelect?.addEventListener("change",async ae=>{await Ue(ae.target.value)}),g.maxImagesBinding=z.bind(g.maxImagesInput),g.themeSwitch=Te({document,container:i.querySelector(".nd-controls")}),g.popovers=nt(i,de),g.autoToggle?.addEventListener("click",async()=>{await qe()}),i.querySelector(".nd-settings-btn")?.addEventListener("click",()=>{i.classList.remove("expanded"),y(Ie(),{source:import.meta.url,operation:"callback"})}),document.addEventListener("click",Ge,{passive:!0});const he=V();he>=0&&y(_(he),{source:import.meta.url,operation:"createFloatingButton"})}function Ye(){g.popovers?.destroy(),g.themeSwitch?.destroy(),g.maxImagesBinding?.destroy(),ee(),k&&(clearTimeout(k),k=null),document.removeEventListener("click",Ge),i?.remove(),i=null,m=null,h=a.IDLE,g={}}function We(){u.forEach(e=>{Y(e.$cache?.presetSelect)}),Y(g.presetSelect),zt()}function $t(){u.forEach(e=>{W(e.$cache?.sizeSelect)}),W(g.sizeSelect)}function zt(){z.updateAll()}function _t(){const e=T().mode==="auto";u.forEach(t=>{t.root&&(t.root.classList.toggle("auto-on",e),t.$cache.autoToggle?.classList.toggle("on",e))}),i&&(i.classList.toggle("auto-on",e),g.autoToggle?.classList.toggle("on",e))}function Xt(){We()}function Kt(e,t){t&&!i?je():!t&&i&&Ye(),e||(u.forEach((n,o)=>{n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),n.root&&ce(o,n.root)}),u.clear(),j.clear(),L?.disconnect(),L=null)}function Jt(){const e=T();se??=Qe(ut),e.showFloatingButton===!0&&je()}function Zt(){se?.(),se=null,u.forEach((e,t)=>{e.autoResetTimer&&clearTimeout(e.autoResetTimer),e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e._cleanup?.(),e.root&&ce(t,e.root)}),u.clear(),j.clear(),L?.disconnect(),L=null,Ye()}export{a as FloatState,it as SIZE_OPTIONS,je as createFloatingButton,Ye as destroyFloatingButton,Zt as destroyFloatingPanel,yt as ensureNovelDrawPanel,Jt as initFloatingPanel,Ht as refreshDrawRunUiState,Xt as refreshPresetSelect,Xt as refreshPresetSelectAll,Qt as releaseNovelDrawPanel,P as setFloatingState,Z as setStateForMessage,zt as updateAllMaxImagesInputs,We as updateAllPresetSelects,$t as updateAllSizeSelects,_t as updateAutoModeUI,Kt as updateButtonVisibility};
