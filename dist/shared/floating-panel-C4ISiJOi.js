import{n as N}from"./async-errors-C4kfchr9.js";import{vt as re}from"./gallery-cache-DwL-PEz-.js";import{B as he,G as Re,H as q,Qt as tt,V as nt,d as Ne,n as xe,ot,st as rt,t as at}from"./message-toolbar-CbaS44KC.js";import{o as Ae}from"./panel-escape-Dco4Fc14.js";import{Dt as it,Et as $,St as y,wt as Pe}from"./draw-common-DpLm_n65.js";import{a as De,d as Fe,i as Y,o as pe,s as R,t as Oe,u as Me}from"./novel-draw-Ca9Nq1WO.js";import{a as st,c as $e,d as lt,f as dt,i as Te,l as ze,m as ct,o as ut,p as be,r as Ge,s as Se,t as qe,u as pt}from"./draw-run-ui-state-DirVvQ1N.js";import{getContext as z}from"../../../../../../scripts/extensions.js";var ue={empty:"暂无画师串预设",unnamed:"未命名",thumbnailFailed:"画师串预设预览加载失败"},X=64;function ft(e){const t=e.ownerDocument,n=t.defaultView;let o=[],r=null,l=0,a=!1,c;function p(C,k,E){const f=t.createElement(C);return f.className=k,E!==void 0&&(f.textContent=E),f}function L(){r=null;const C=e.clientWidth;if(a||!C||!o.length)return;l=C;const k=e.contains(t.activeElement)?t.activeElement:null,E=e.scrollTop,f=parseFloat(n.getComputedStyle(e).gap),m=n.getComputedStyle(o[0].card),w=parseFloat(m.borderLeftWidth)+parseFloat(m.borderRightWidth),D=I=>I.image.naturalWidth?I.image.naturalWidth/I.image.naturalHeight:1,x=I=>(C-f*(I.length-1)-w*I.length)/I.reduce((M,V)=>M+D(V),0),se=[];let A=[];function le(I){const M=p("div","nd-preset-photo-row"),V=x(A),ce=I&&(A.length===1||V>X*1.25)?Math.min(V,X):V;for(const Q of A)Q.card.style.width=`${D(Q)*ce+w}px`,Q.image.style.setProperty("height",`${ce}px`,"important"),Q.image.style.setProperty("max-height",`${ce}px`,"important"),M.append(Q.card);se.push(M),A=[]}for(const I of o.filter(M=>M.image))A.length>=3&&x([...A,I])<X*.85&&x(A)<=X*1.25&&le(!1),A.push(I),x(A)<=X&&le(!1);A.length&&le(!0);const de=p("div","nd-preset-tags");for(const I of o.filter(M=>!M.image))de.append(I.card);de.childElementCount&&se.push(de),e.replaceChildren(...se),e.scrollTop=E,k?.focus({preventScroll:!0})}function S(){a||r!==null||!o.length||(r=n.requestAnimationFrame(L))}const P=new n.ResizeObserver(()=>{e.clientWidth!==l&&S()});return P.observe(e),{render(C,k){c?.abort(),c=new n.AbortController;const E=e.contains(t.activeElement)?t.activeElement.dataset.presetId:null;o=C.map(f=>{const m=p("div","nd-preset-card");m.classList.toggle("active",f.id===k),m.dataset.presetId=f.id,m.tabIndex=0,m.setAttribute("role","button"),m.setAttribute("aria-pressed",String(f.id===k));const w=f.name||ue.unnamed;m.title=w,m.setAttribute("aria-label",w),m.addEventListener("keydown",x=>{x.key!=="Enter"&&x.key!==" "||(x.preventDefault(),m.click())});const D={card:m,image:null};if(m.classList.toggle("nd-preset-text",!f.thumbnail),f.thumbnail){const x=p("img","nd-preset-thumb");D.image=x,x.alt="",x.loading="lazy",x.decoding="async",x.style.setProperty("width","100%","important"),x.addEventListener("load",S,{signal:c.signal}),x.addEventListener("error",()=>{console.warn(ue.thumbnailFailed,{presetId:f.id}),x.remove(),D.image=null,m.style.removeProperty("width"),m.classList.add("nd-preset-text"),S()},{once:!0,signal:c.signal}),x.src=f.thumbnail,m.append(x)}return m.append(p("span","nd-preset-check","✓"),p("div","nd-preset-name",w)),D}),e.replaceChildren(...o.map(f=>f.card)),o.length||e.append(p("div","nd-preset-empty",ue.empty)),E&&o.find(f=>f.card.dataset.presetId===E)?.card.focus({preventScroll:!0}),S()},destroy(){a=!0,P.disconnect(),c?.abort(),r!==null&&n.cancelAnimationFrame(r),o=[]}}}var _e="xb_novel_float_pos",B=8e3,gt="novelai",K=new WeakMap,i={IDLE:"idle",SUBMITTING:"submitting",ACCEPTED:"accepted",UNCERTAIN:"uncertain",QUEUED:"queued",LLM:"llm",GEN:"gen",COOLDOWN:"cooldown",RECONNECTING:"reconnecting",CANCELLING:"cancelling",BACKEND_LEGACY:"backend_legacy",SUCCESS:"success",PARTIAL:"partial",ERROR:"error"},mt=[{value:"default",label:"跟随预设",width:null,height:null},{value:"auto",label:"AI 自动（按构图）",width:null,height:null},{value:"832x1216",label:"832 × 1216  竖图",width:832,height:1216},{value:"1216x832",label:"1216 × 832  横图",width:1216,height:832},{value:"1024x1024",label:"1024 × 1024  方图",width:1024,height:1024},{value:"768x1280",label:"768 x 1280  大竖",width:768,height:1280},{value:"1280x768",label:"1280 x 768  大横",width:1280,height:768}],g=new Map,j=new Map,O=null,s=null,b=null,T=i.IDLE,_=null,v={success:0,total:0,error:null,startTime:0},F=null,J=null,te=0,h={},Ie=!1,fe=null,Ue=74,Be=98,vt=`

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
    width: ${Ue}px;
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
.nd-float.nd-novel.error .nd-capsule { width: ${Be}px; }

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

/* Content sets the height; only a long preset list scrolls. */
.nd-novel .nd-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    --nd-menu-gap: 8px;
    width: 300px;
    max-width: calc(100vw - 16px);
    display: flex;
    flex-direction: column;
    max-height: 70vh;
    overflow: hidden;
    background: var(--nd-bg-solid);
    border: 1px solid var(--nd-border);
    border-radius: 12px;
    padding: 14px;
    box-sizing: border-box;
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

.nd-novel .nd-quick-controls{
    display: grid;
    grid-template-columns: minmax(0, 1fr) repeat(2, 37px);
    gap: var(--nd-menu-gap);
    flex-shrink: 0;
}
.nd-novel .nd-card, .nd-novel .nd-controls { display: contents; }
.nd-novel .nd-card > .nd-row:last-child { grid-column: 2 / -1; }

.nd-novel .nd-row{
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    min-width: 0;
    margin: 0;
}

.nd-novel .nd-label{
    font-size: 11px;
    color: var(--nd-text-muted);
    flex-shrink: 0;
    padding: 0;
}

.nd-novel .nd-select {
    flex: 1;
    width: 100%;
    min-width: 0;
    background: var(--nd-bg-active);
    border: 1px solid var(--nd-border-subtle);
    color: var(--nd-text-primary);
    font-size: 11px;
    height: 34px;
    min-height: 34px;
    border-radius: 6px;
    padding: 6px 8px;
    margin: 0;
    box-sizing: border-box;
    outline: none;
    cursor: pointer;
    text-align: left;
    text-align-last: left;
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
${pt}
.nd-novel .nd-max-images-input { height: 34px; background: var(--nd-bg-active); text-align: left; }
.nd-novel .nd-max-images-input:hover { border-color: var(--nd-border-hover); }
.nd-novel .nd-max-images-input:focus { border-color: var(--nd-text-muted); }

.nd-novel .nd-auto{
    grid-column: 1;
    min-width: 0;
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--nd-menu-gap);
    height: 34px;
    box-sizing: border-box;
    padding: 0 12px;
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

.nd-novel .nd-gear, .nd-novel .nd-controls .draw-theme-toggle{
    width: 100%;
    min-width: 0;
    height: 34px;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
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
   画师串预设网格
   ═══════════════════════════════════════════════════════════════════════════ */
.nd-novel .nd-preset-grid {
    flex: 0 1 auto;
    min-height: 0;
    max-height: 310px;
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: var(--nd-menu-gap);
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
}
.nd-novel .nd-preset-photo-row, .nd-novel .nd-preset-tags {
    display: flex;
    align-items: flex-start;
    gap: var(--nd-menu-gap);
    flex-shrink: 0;
}
.nd-novel .nd-preset-tags { flex-wrap: wrap; }

.nd-novel .nd-preset-card {
    position: relative;
    flex: 0 0 auto;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--nd-border-subtle);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    overflow: hidden;
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
    transition: border-color 0.15s, background 0.15s, transform 0.1s;
}
.nd-novel .nd-preset-card:hover { border-color: var(--nd-border-hover); background: var(--nd-bg-active); }
.nd-novel .nd-preset-card:focus-visible { outline: 2px solid var(--nd-border-hover); outline-offset: -2px; }
.nd-novel .nd-preset-card:active { transform: scale(0.96); }
.nd-novel .nd-preset-card.active {
    border: 1px solid var(--nd-success);
    background: var(--nd-bg-active);
}

/* Row layout sets explicit pixel heights; keep host chat-image rules out of previews. */
.nd-novel .nd-preset-thumb {
    width: 100% !important;
    height: 64px;
    max-height: none;
    min-height: 0;
    object-fit: contain;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    display: block;
    pointer-events: none;
}

.nd-novel .nd-preset-check {
    position: absolute;
    top: 2px;
    right: 2px;
    z-index: 2;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--nd-success);
    color: #0b1712;
    font-size: 9px;
    font-weight: 700;
    display: none;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}
.nd-novel .nd-preset-card.active .nd-preset-check { display: flex; }

.nd-novel .nd-preset-name {
    font-size: 11px;
    line-height: 1.4;
    color: var(--nd-text-secondary);
    padding: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
}
.nd-novel .nd-preset-card.active .nd-preset-name { color: var(--nd-text-primary); }
.nd-novel .nd-preset-text { min-height: 31px; }
.nd-novel .nd-preset-text .nd-preset-name { padding: 6px 24px 6px 10px; }
.nd-novel .nd-preset-text .nd-preset-check { top: 50%; right: 5px; transform: translateY(-50%); }

.nd-novel .nd-preset-empty {
    text-align: center;
    color: var(--nd-text-muted);
    font-size: 11px;
    padding: 16px 0;
}
@media (max-width: 360px), (pointer: coarse) {
    .nd-novel .nd-card > .nd-row, .nd-novel .nd-card > .nd-row:last-child { grid-column: 1 / -1; }
}
@media (pointer: coarse) {
    .nd-novel .nd-quick-controls { grid-template-columns: minmax(0, 1fr) repeat(2, 44px); }
    .nd-novel .nd-select.size, .nd-novel .nd-max-images-input { height: 44px; min-height: 44px; font-size: 16px; }
    .nd-novel .nd-auto, .nd-novel .nd-gear, .nd-novel .nd-controls .draw-theme-toggle { height: 44px; }
    .nd-novel .nd-preset-text { min-height: 44px; }
    .nd-novel .nd-preset-text .nd-preset-name { padding-top: 13px; padding-bottom: 13px; }
}

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

${dt}
@media (prefers-reduced-motion: reduce) {
    .nd-novel, .nd-novel * { transition: none !important; animation: none !important; }
}
`;function we(){if(it(),Ie)return;Ie=!0;const e=document.createElement("style");e.id="nd-float-styles",e.textContent=vt,document.head.appendChild(e)}function d(e,t,n){const o=document.createElement(e);return t&&(o.className=t),n!==void 0&&(o.textContent=n),o}function u(e){return $(e==="chevron"?"chevron-down":e,"nd-icon")}function ye(){const e=d("span","nd-arrow");return e.appendChild(u("chevron")),e}function We(){const e=d("button","nd-btn-menu nd-btn-menu-persist");return e.title="展开菜单",e.appendChild(ye()),e}function Z(e){if(!e)return;const t=R().overrideSize||"default";e.replaceChildren(),mt.forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.label,n.value===t&&(o.selected=!0),e.appendChild(o)})}function ee(e){if(!e)return;K.has(e)||K.set(e,ft(e));const t=R();K.get(e).render(t.paramsPresets||[],t.selectedParamsPresetId)}function Ce(e){K.get(e)?.destroy(),K.delete(e)}var H=lt({getOverride:()=>R().overrideMaxImages,getPresetMaxImages:()=>{const e=R();return tt(e.paramsPresets,e.selectedParamsPresetId)},persistOverride:(e,{okText:t})=>Fe(n=>{n.overrideMaxImages=e},t),listInputs:()=>[...g.values()].map(e=>e.$cache?.maxImagesInput).concat(h.maxImagesInput),notify:e=>globalThis.toastr?.warning?.(e)});function ge(e,t){e.classList.toggle("on",t),e.setAttribute("aria-pressed",String(t)),e.querySelector(".nd-auto-text").textContent=t?"自动配图":"手动配图"}function je(e){const t=d("div","nd-menu"),n=d("div","nd-card"),o=d("label","nd-row");o.appendChild(d("span","nd-label","尺寸"));const r=d("select","nd-select size nd-size-select");Z(r),o.appendChild(r),n.append(o,H.createRow());const l=d("div","nd-controls"),a=d("button","nd-auto nd-auto-toggle");a.type="button",a.append(d("span","nd-dot"),d("span","nd-auto-text")),ge(a,e);const c=d("button","nd-gear nd-settings-btn");c.type="button",c.title="打开设置",c.appendChild($("sliders")),l.append(a,c);const p=d("div","nd-preset-grid");ee(p);const L=d("div","nd-quick-controls");return L.append(n,l),t.append(L,p),t}function ht(e){return{messageId:e,root:null,state:i.IDLE,result:{success:0,total:0,error:null,startTime:0},autoResetTimer:null,cooldownRafId:null,cooldownEndTime:0,$cache:{},_cleanup:null}}function xt(e){const t=R().mode==="auto",n=document.createElement("div");n.className=`nd-float nd-novel lwb-draw-ui${t?" auto-on":""}`,n.dataset.messageId=e;const o=d("div","nd-capsule"),r=d("div","nd-inner"),l=d("div","nd-layer nd-layer-idle"),a=d("button","nd-btn-draw");a.title="点击生成配图",a.appendChild(u("palette")),a.appendChild(d("span","nd-auto-dot"));const c=d("div","nd-sep"),p=d("button","nd-btn-menu");p.title="展开菜单",p.appendChild(ye()),l.append(a,c,p);const L=d("button","nd-layer nd-layer-active");L.append(d("span","nd-status-icon"),d("span","nd-status-text",y.analysis)),r.append(l,L),o.append(r,We());const S=d("div","nd-detail"),P=d("div","nd-detail-row");P.append($("images","nd-detail-icon"),d("span","nd-detail-label","结果"),d("span","nd-detail-value nd-result","-"));const C=d("div","nd-detail-row nd-error-row");C.style.display="none",C.append($("circle-info","nd-detail-icon"),d("span","nd-detail-label","原因"),d("span","nd-detail-value error nd-error","-"));const k=d("div","nd-detail-row");k.append($("clock","nd-detail-icon"),d("span","nd-detail-label","耗时"),d("span","nd-detail-value nd-time","-")),S.append(P,C,k);const E=je(t);return n.append(o,S,E),n}function bt(e){const t=e.root;t&&(e.$cache={statusIcon:t.querySelector(".nd-status-icon"),statusText:t.querySelector(".nd-status-text"),result:t.querySelector(".nd-result"),errorRow:t.querySelector(".nd-error-row"),error:t.querySelector(".nd-error"),time:t.querySelector(".nd-time"),sizeSelect:t.querySelector(".nd-size-select"),maxImagesInput:t.querySelector(`.${ze}`),autoToggle:t.querySelector(".nd-auto-toggle"),presetGrid:t.querySelector(".nd-preset-grid")})}function W(e,t,n={}){const o=g.get(e);if(!o?.root)return;const r=o.root;o.state=t,o.autoResetTimer&&(clearTimeout(o.autoResetTimer),o.autoResetTimer=null),t!==i.COOLDOWN&&o.cooldownRafId&&(cancelAnimationFrame(o.cooldownRafId),o.cooldownRafId=null,o.cooldownEndTime=0),r.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:l,statusText:a}=o.$cache;switch(a&&(a.className="nd-status-text"),t){case i.IDLE:o.result={success:0,total:0,error:null,startTime:0};break;case i.SUBMITTING:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),l&&(l.replaceChildren(u("upload")),l.className="nd-status-icon nd-spin"),a&&(a.textContent=y.submitting);break;case i.ACCEPTED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),l&&(l.replaceChildren(u(["analysis","retry"].includes(Ge(n))?"spinner":"palette")),l.className="nd-status-icon nd-spin"),a&&(a.textContent=qe(n));break;case i.UNCERTAIN:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),l&&(l.replaceChildren(u("rotate")),l.className="nd-status-icon nd-spin"),a&&(a.textContent=y.uncertain);break;case i.QUEUED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),l&&(l.replaceChildren(u("clock")),l.className="nd-status-icon"),a&&(a.textContent=y.queued),o.result.total=n.total||o.result.total||0;break;case i.LLM:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),l&&(l.replaceChildren(u("spinner")),l.className="nd-status-icon nd-spin"),a&&(a.textContent=Pe(n));break;case i.GEN:r.classList.add("working"),l&&(l.replaceChildren(u("palette")),l.className="nd-status-icon nd-spin"),a&&(a.textContent=`${n.current||0}/${n.total||0}`),o.result.total=n.total||0;break;case i.COOLDOWN:r.classList.add("cooldown"),l&&(l.replaceChildren(u("spinner")),l.className="nd-status-icon nd-spin"),yt(o,n);break;case i.RECONNECTING:r.classList.add("working"),l&&(l.replaceChildren(u("rotate")),l.className="nd-status-icon nd-spin"),a&&(a.textContent=y.reconnecting);break;case i.CANCELLING:r.classList.add("working"),l&&(l.replaceChildren(u("spinner")),l.className="nd-status-icon nd-spin"),a&&(a.textContent=y.cancelling);break;case i.BACKEND_LEGACY:r.classList.add("working"),l&&(l.replaceChildren(u("share-from-square")),l.className="nd-status-icon"),a&&(a.textContent=y.legacy);break;case i.SUCCESS:r.classList.add("success"),l&&(l.replaceChildren(u("check")),l.className="nd-status-icon"),a&&(a.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>W(e,i.IDLE),B);break;case i.PARTIAL:r.classList.add("partial"),l&&(l.replaceChildren(u("triangle-exclamation")),l.className="nd-status-icon"),a&&(a.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>W(e,i.IDLE),B);break;case i.ERROR:r.classList.add("error"),l&&(l.replaceChildren(u("xmark")),l.className="nd-status-icon"),a&&(a.textContent=n.unknown?y.unknown:y.error),o.result.error=n.error,o.autoResetTimer=setTimeout(()=>W(e,i.IDLE),B);break}}async function U(e,t={}){const n=pe(e);if(n){ne(e,n.state,n.data);return}const o=he(e),r=await nt(e).catch(()=>null);if(!r||!q(o))return;e=z().chat.indexOf(o.message);const l=pe(e);if(l){ne(e,l.state,l.data);return}const a=z(),c=String(a?.chatId||""),p=a?.chat?.[Number(e)];if(!c||!p)return;const L=Number.isInteger(p.swipe_id)?p.swipe_id:0,S=Number.isSafeInteger(r.swipeIndex)?r.swipeIndex:L,P=r.provider||t?.provider||gt,C=r.runId||t?.runId||"",k={chatId:c,messageId:e,swipeIndex:S,provider:P,runId:C},E=st({detail:t,pending:r.pending,...k}),f=ut(E,r,k),m=g.get(e);if(m){const w=Se({currentState:m.state,pending:r.pending,detail:f,...k});(w!==m.state||w===i.ACCEPTED&&Te(E))&&W(e,w,f)}if(s&&Number(e)===Y()){const w=Se({currentState:T,pending:r.pending,detail:f,...k});r.pending&&(_=Number(e)),(w!==T||w===i.ACCEPTED&&Te(E))&&G(w,f)}}function wt(e={}){const t=ot(e,z());if(!t)return;const n=Y();(g.has(t.messageId)||s&&t.messageId===n)&&N(U(t.messageId,e),{source:import.meta.url,operation:"syncDrawRunActivity"})}function on(){const e=Y();if(s){const t=e>=0?pe(e):null;t?(_=e,G(t.state,t.data)):G(i.IDLE)}e>=0&&N(U(e),{source:import.meta.url,operation:"refreshDrawRunUiState"})}function Ye({cooldownUntil:e,duration:t}={}){const n=Number(e);return Number.isFinite(n)&&n>0?n:Date.now()+Math.max(0,Number(t)||0)}function yt(e,t){e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e.cooldownEndTime=Ye(t);function n(){if(!e.cooldownEndTime)return;const o=Math.max(0,e.cooldownEndTime-Date.now()),r=e.$cache?.statusText;if(r&&(r.textContent=`${(o/1e3).toFixed(1)}s`,r.className="nd-status-text nd-countdown"),o<=0){e.cooldownRafId=null,e.cooldownEndTime=0;return}e.cooldownRafId=requestAnimationFrame(n)}e.cooldownRafId=requestAnimationFrame(n)}function Ct(e){const t=g.get(e);if(!t?.root)return;const{result:n,errorRow:o,error:r,time:l}=t.$cache,{result:a,state:c}=t,p=a.startTime?((Date.now()-a.startTime)/1e3).toFixed(1):"-";c===i.SUCCESS||c===i.PARTIAL?(n&&(n.textContent=`${a.success}/${a.total} 成功`,n.className=`nd-detail-value ${c===i.SUCCESS?"success":"warning"}`),o&&(o.style.display=c===i.PARTIAL?"flex":"none"),r&&c===i.PARTIAL&&(r.textContent=`${a.total-a.success} 张失败`)):c===i.ERROR&&(n&&(n.textContent=a.error?.label||re.redrawFailed,n.className="nd-detail-value error"),o&&(o.style.display="flex"),r&&(r.textContent=a.error?.desc||"未知错误")),l&&(l.textContent=`${p}s`)}async function kt(e){const t=g.get(e);if(!(!t||t.state!==i.IDLE))try{await De({messageId:e,onStateChange:(n,o,r)=>{ne(r,n,o)}})}catch(n){if(n.drawTaskReported)return;n instanceof Ne||Re(n)?toastr?.info?.(n.message):(console.error(n),toastr?.error?.(n.message))}}async function Et(e){const t=he(e);try{await $e({cancel:()=>Oe(e,{target:t}),isCurrent:()=>q(t),getState:()=>g.get(z().chat.indexOf(t.message))?.state,setState:n=>W(z().chat.indexOf(t.message),n)})&&q(t)&&toastr?.info?.("正在中止"),q(t)&&await U(z().chat.indexOf(t.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(re.cancelFailed)}}function Tt(e){const{messageId:t,root:n}=e;n.querySelector(".nd-btn-draw")?.addEventListener("click",a=>{a.stopPropagation(),N(kt(t),{source:import.meta.url,operation:"callback"})}),n.querySelectorAll(".nd-btn-menu").forEach(a=>a.addEventListener("click",c=>{c.stopPropagation(),n.classList.remove("show-detail"),n.classList.contains("expanded")||(St(t),It(t),Lt(t)),n.classList.toggle("expanded")})),n.querySelector(".nd-layer-active")?.addEventListener("click",a=>{a.stopPropagation();const c=e.state;[i.SUBMITTING,i.ACCEPTED,i.UNCERTAIN,i.QUEUED,i.LLM,i.GEN,i.COOLDOWN,i.RECONNECTING,i.BACKEND_LEGACY].includes(c)?N(Et(t),{source:import.meta.url,operation:"callback"}):[i.SUCCESS,i.PARTIAL,i.ERROR].includes(c)&&(Ct(t),n.classList.toggle("show-detail"))}),e.$cache.presetGrid?.addEventListener("click",async a=>{const c=a.target.closest(".nd-preset-card");if(!c)return;a.stopPropagation();const p=c.dataset.presetId;p&&p!==R().selectedParamsPresetId&&await He(p),n.classList.remove("expanded")}),e.$cache.sizeSelect?.addEventListener("change",async a=>{await Ve(a.target.value)});const o=H.bind(e.$cache.maxImagesInput);e.$cache.autoToggle?.addEventListener("click",async()=>{await Qe()}),n.querySelector(".nd-settings-btn")?.addEventListener("click",a=>{a.stopPropagation(),n.classList.remove("expanded"),N(Me(),{source:import.meta.url,operation:"callback"})});const r=a=>{n.contains(a.target)||n.classList.remove("expanded","show-detail")};document.addEventListener("click",r,{passive:!0});const l=Ae({document,container:n.querySelector(".nd-controls")});e._cleanup=()=>{Ce(e.$cache.presetGrid),l?.destroy(),o.destroy(),document.removeEventListener("click",r),e.autoResetTimer&&clearTimeout(e.autoResetTimer),e.autoResetTimer=null,e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e.cooldownRafId=null,e.cooldownEndTime=null}}function St(e){ee(g.get(e)?.$cache?.presetGrid)}function It(e){const t=g.get(e)?.$cache?.sizeSelect;Z(t)}function Lt(e){H.fill(g.get(e)?.$cache?.maxImagesInput)}async function ke(e,t,n){const o=await Fe(e,t);return o&&typeof n=="function"&&n(),o}async function He(e){return ke(t=>{t.selectedParamsPresetId=e},"预设已切换",et)}async function Ve(e){return ke(t=>{t.overrideSize=e},"尺寸已切换",Yt)}async function Qe(){const e=R().mode==="auto"?"manual":"auto";return ke(t=>{t.mode=e},e==="auto"?"自动配图已开启":"自动配图已关闭",Vt)}function me(e,t){if(g.has(t)){const r=g.get(t);if(r.root?.isConnected)return N(U(t),{source:import.meta.url,operation:"mountFloorPanel"}),r;r._cleanup?.(),g.delete(t)}we();const n=ht(t),o=xt(t);return n.root=o,at(t,o,{position:"right",id:`novel-draw-${t}`})?(bt(n),Tt(n),g.set(t,n),N(U(t),{source:import.meta.url,operation:"mountFloorPanel"}),n):(Ce(o.querySelector(".nd-preset-grid")),null)}function Rt(){O||(O=new IntersectionObserver(e=>{const t=[];for(const n of e){if(!n.isIntersecting)continue;const o=n.target,r=Number(o.getAttribute("mesid"));j.has(r)&&(t.push({el:o,mid:r}),j.delete(r),O.unobserve(o))}t.length>0&&requestAnimationFrame(()=>{for(const{el:n,mid:o}of t)me(n,o)})},{rootMargin:"300px"}))}function Nt(e,t,n={}){if(R().showFloorButton===!1)return null;const{force:o=!1}=n;if(we(),g.has(t)){const l=g.get(t);if(l.root?.isConnected)return l;l._cleanup?.(),g.delete(t)}if(o)return me(e,t);const r=e.getBoundingClientRect();return r.top<window.innerHeight+500&&r.bottom>-500?me(e,t):(Rt(),j.set(t,!0),O.observe(e),null)}function rn(e,t){O?.unobserve(e),j.delete(t);const n=g.get(t);!n||!e.contains(n.root)||(n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),xe(t,n.root),g.delete(t))}function ne(e,t,n={}){let o=g.get(e);if(!o?.root?.isConnected){const r=document.querySelector(`.mes[mesid="${e}"]`);r&&(o=Nt(r,e,{force:!0}))}o&&W(e,t,n),s&&e===Y()&&(_=e,G(t,n))}function At(){try{const t=localStorage.getItem(_e);if(t)return JSON.parse(t)}catch(t){console.warn({source:import.meta.url,operation:"getFloatingPosition"},t)}const e=document.getElementById("xiaobaix-debug-mini");if(e){const t=e.getBoundingClientRect();return{left:t.left,top:t.bottom+8}}return{left:window.innerWidth-110,top:window.innerHeight-80}}var ae=null;function ie(e){s&&(ae=e,s.classList.toggle("nd-docked-left",e==="left"),s.classList.toggle("nd-docked-right",e==="right"))}function Ee(){if(!s)return;const e=parseFloat(s.style.left)||0,t=parseFloat(s.style.top)||0;try{localStorage.setItem(_e,JSON.stringify({left:Math.round(e),top:Math.round(t),docked:ae||""}))}catch(n){console.warn({source:import.meta.url,operation:"saveFloatingPosition"},n)}}function ve(){if(!s)return;const e=At(),t=be(),n=T===i.IDLE?Ue:Be,o=s.offsetHeight||34,r=30,l=e.docked==="left"?t.left:e.docked==="right"?t.right-n:e.left;s.style.left=`${Math.max(t.left,Math.min(l,t.right-n))}px`,s.style.top=`${Math.max(t.top+r,Math.min(e.top,t.bottom-o-r))}px`,ie(e.docked==="left"||e.docked==="right"?e.docked:null)}function oe(){J&&(cancelAnimationFrame(J),J=null),te=0}function Pt(e){oe(),te=Ye(e);function t(){if(!te)return;const n=Math.max(0,te-Date.now()),o=h.statusText;if(o&&(o.textContent=`${(n/1e3).toFixed(1)}s`,o.className="nd-status-text nd-countdown"),n<=0){oe();return}J=requestAnimationFrame(t)}J=requestAnimationFrame(t)}function G(e,t={}){if(!s)return;const n=T===i.IDLE;T=e,n!==(e===i.IDLE)&&ve(),F&&(clearTimeout(F),F=null),e!==i.COOLDOWN&&oe(),s.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:o,statusText:r}=h;if(!(!o||!r))switch(r.className="nd-status-text",e){case i.IDLE:_=null,v={success:0,total:0,error:null,startTime:0};break;case i.SUBMITTING:s.classList.add("working"),v.startTime||(v.startTime=Date.now()),o.replaceChildren(u("upload")),o.className="nd-status-icon nd-spin",r.textContent=y.submitting;break;case i.ACCEPTED:s.classList.add("working"),v.startTime||(v.startTime=Date.now()),o.replaceChildren(u(["analysis","retry"].includes(Ge(t))?"spinner":"palette")),o.className="nd-status-icon nd-spin",r.textContent=qe(t);break;case i.UNCERTAIN:s.classList.add("working"),v.startTime||(v.startTime=Date.now()),o.replaceChildren(u("rotate")),o.className="nd-status-icon nd-spin",r.textContent=y.uncertain;break;case i.QUEUED:s.classList.add("working"),v.startTime||(v.startTime=Date.now()),o.replaceChildren(u("clock")),o.className="nd-status-icon",r.textContent=y.queued;break;case i.LLM:s.classList.add("working"),v.startTime||(v.startTime=Date.now()),o.replaceChildren(u("spinner")),o.className="nd-status-icon nd-spin",r.textContent=Pe(t);break;case i.GEN:s.classList.add("working"),o.replaceChildren(u("palette")),o.className="nd-status-icon nd-spin",r.textContent=`${t.current||0}/${t.total||0}`,v.total=t.total||0;break;case i.COOLDOWN:s.classList.add("cooldown"),o.replaceChildren(u("spinner")),o.className="nd-status-icon nd-spin",Pt(t);break;case i.RECONNECTING:s.classList.add("working"),o.replaceChildren(u("rotate")),o.className="nd-status-icon nd-spin",r.textContent=y.reconnecting;break;case i.CANCELLING:s.classList.add("working"),o.replaceChildren(u("spinner")),o.className="nd-status-icon nd-spin",r.textContent=y.cancelling;break;case i.BACKEND_LEGACY:s.classList.add("working"),o.replaceChildren(u("share-from-square")),o.className="nd-status-icon",r.textContent=y.legacy;break;case i.SUCCESS:s.classList.add("success"),o.replaceChildren(u("check")),o.className="nd-status-icon",r.textContent=`${t.success}/${t.total}`,v.success=t.success,v.total=t.total,F=setTimeout(()=>G(i.IDLE),B);break;case i.PARTIAL:s.classList.add("partial"),o.replaceChildren(u("triangle-exclamation")),o.className="nd-status-icon",r.textContent=`${t.success}/${t.total}`,v.success=t.success,v.total=t.total,F=setTimeout(()=>G(i.IDLE),B);break;case i.ERROR:s.classList.add("error"),o.replaceChildren(u("xmark")),o.className="nd-status-icon",r.textContent=t.unknown?y.unknown:y.error,v.error=t.error,F=setTimeout(()=>G(i.IDLE),B);break}}function Dt(){const{detailResult:e,detailErrorRow:t,detailError:n,detailTime:o}=h;if(!e)return;const r=v.startTime?((Date.now()-v.startTime)/1e3).toFixed(1):"-";T===i.SUCCESS||T===i.PARTIAL?(e.textContent=`${v.success}/${v.total} 成功`,e.className=`nd-detail-value ${T===i.SUCCESS?"success":"warning"}`,t.style.display=T===i.PARTIAL?"flex":"none",T===i.PARTIAL&&(n.textContent=`${v.total-v.success} 张失败`)):T===i.ERROR&&(e.textContent=v.error?.label||re.redrawFailed,e.className="nd-detail-value error",t.style.display="flex",n.textContent=v.error?.desc||"未知错误"),o.textContent=`${r}s`}function Ft(e){if(!(e.button!==0||b||!e.target.closest(".nd-capsule, .nd-img-jump"))){if(ae){ie(null),Ee(),e.preventDefault();return}b={startX:e.clientX,startY:e.clientY,startLeft:s.getBoundingClientRect().left,startTop:s.getBoundingClientRect().top,pointerId:e.pointerId,moved:!1,originalTarget:e.target};try{e.currentTarget.setPointerCapture(e.pointerId)}catch(t){console.warn({source:import.meta.url,operation:"onFloatingPointerDown"},t)}e.preventDefault()}}function Ot(e){if(!b||b.pointerId!==e.pointerId)return;const t=e.clientX-b.startX,n=e.clientY-b.startY;if(!b.moved&&(Math.abs(t)>3||Math.abs(n)>3)&&(b.moved=!0),b.moved){const o=be(),r=s.offsetWidth||88,l=s.offsetHeight||36,a=30;s.style.left=`${Math.max(o.left,Math.min(b.startLeft+t,o.right-r))}px`,s.style.top=`${Math.max(o.top+a,Math.min(b.startTop+n,o.bottom-l-a))}px`}e.preventDefault()}function Mt(e){if(!b||b.pointerId!==e.pointerId)return;const{moved:t,originalTarget:n}=b;if(b=null,e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId),t){const o=parseFloat(s.style.left)||0,r=s.offsetWidth||88,l=28,a=be();let c=null;o<=a.left+l?c="left":o>=a.right-r-l&&(c="right"),c&&(s.style.left=`${c==="left"?a.left:a.right-r}px`),ie(c),Ee()}else Xe(n)}function Le(e){if(!b||b.pointerId!==e.pointerId)return;const{startLeft:t,startTop:n}=b;b=null,s.style.left=`${t}px`,s.style.top=`${n}px`,e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId)}function $t(e){if(e.target.closest(".nd-capsule, .nd-img-jump")&&(e.preventDefault(),e.stopPropagation(),e.detail===0)){if(ae){ie(null),Ee();return}Xe(e.target)}}function zt(){return[...document.querySelectorAll("#chat .mes .mes_text .xb-nd-img")].filter(e=>e.offsetHeight>0&&e.offsetWidth>0&&e.querySelector("img"))}function Gt(e){const t=window.innerHeight/2;let n=null,o=1/0;for(const r of zt()){const l=r.getBoundingClientRect();if(e<0&&l.bottom<t-1){const a=t-l.bottom;a<o&&(o=a,n=r)}else if(e>0&&l.top>t+1){const a=l.top-t;a<o&&(o=a,n=r)}}n&&n.scrollIntoView({behavior:"smooth",block:"center"})}function Xe(e){e.closest(".nd-img-jump")?Gt(e.closest(".nd-img-jump-prev")?-1:1):e.closest(".nd-btn-draw")?N(qt(),{source:import.meta.url,operation:"routeFloatingClick"}):e.closest(".nd-btn-menu")?(s.classList.remove("show-detail"),s.classList.contains("expanded")||(Ut(),Bt(),Wt()),s.classList.toggle("expanded")):e.closest(".nd-layer-active")&&([i.SUBMITTING,i.ACCEPTED,i.UNCERTAIN,i.QUEUED,i.LLM,i.GEN,i.COOLDOWN,i.RECONNECTING,i.BACKEND_LEGACY].includes(T)?N(_t(),{source:import.meta.url,operation:"routeFloatingClick"}):[i.SUCCESS,i.PARTIAL,i.ERROR].includes(T)&&(Dt(),s.classList.toggle("show-detail")))}async function qt(){if(T!==i.IDLE)return;const e=Y();if(e<0){toastr?.warning?.("没有可配图的AI消息");return}_=e;try{await De({messageId:e,onStateChange:(t,n,o)=>{ne(o,t,n)}})}catch(t){if(t.drawTaskReported)return;t instanceof Ne||Re(t)?toastr?.info?.(t.message):(console.error(t),toastr?.error?.(t.message))}}async function _t(){const e=_,t=he(e);try{e>=0&&await $e({cancel:()=>Oe(e,{target:t}),isCurrent:()=>q(t)&&_===z().chat.indexOf(t.message),getState:()=>T,setState:G})&&q(t)&&toastr?.info?.("正在中止"),e>=0&&q(t)&&await U(z().chat.indexOf(t.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(re.cancelFailed)}}function Ut(){ee(h.presetGrid)}function Bt(){Z(h.sizeSelect)}function Wt(){H.fill(h.maxImagesInput)}function jt(){s&&(h={capsule:s.querySelector(".nd-capsule"),statusIcon:s.querySelector(".nd-status-icon"),statusText:s.querySelector(".nd-status-text"),detailResult:s.querySelector(".nd-result"),detailErrorRow:s.querySelector(".nd-error-row"),detailError:s.querySelector(".nd-error"),detailTime:s.querySelector(".nd-time"),sizeSelect:s.querySelector(".nd-size-select"),maxImagesInput:s.querySelector(`.${ze}`),autoToggle:s.querySelector(".nd-auto-toggle"),presetGrid:s.querySelector(".nd-preset-grid")})}function Ke(e){s&&!s.contains(e.target)&&s.classList.remove("expanded","show-detail")}function Je(){if(s)return;const e=R();if(e.showFloatingButton!==!0)return;we();const t=e.mode==="auto";s=document.createElement("div"),s.className=`nd-float nd-novel lwb-draw-ui nd-floating-global${t?" auto-on":""}`,s.id="nd-floating-global";const n=d("div","nd-detail"),o=d("div","nd-detail-row");o.append($("images","nd-detail-icon"),d("span","nd-detail-label","结果"),d("span","nd-detail-value nd-result","-"));const r=d("div","nd-detail-row nd-error-row");r.style.display="none",r.append($("circle-info","nd-detail-icon"),d("span","nd-detail-label","原因"),d("span","nd-detail-value error nd-error","-"));const l=d("div","nd-detail-row");l.append($("clock","nd-detail-icon"),d("span","nd-detail-label","耗时"),d("span","nd-detail-value nd-time","-")),n.append(o,r,l);const a=je(t),c=d("div","nd-capsule"),p=d("div","nd-inner"),L=d("div","nd-layer nd-layer-idle"),S=d("button","nd-btn-draw");S.title="点击为最后一条AI消息生成配图",S.appendChild(u("palette")),S.appendChild(d("span","nd-auto-dot"));const P=d("div","nd-sep"),C=d("button","nd-btn-menu");C.title="展开菜单",C.appendChild(ye()),L.append(S,P,C);const k=d("button","nd-layer nd-layer-active");k.append(d("span","nd-status-icon"),d("span","nd-status-text",y.analysis)),p.append(L,k),c.append(p,We());const E=d("button","nd-img-jump nd-img-jump-prev");E.appendChild(u("chevron")),E.title="跳到上一张图片";const f=d("button","nd-img-jump nd-img-jump-next");f.appendChild(u("chevron")),f.title="跳到下一张图片",s.append(n,a,E,c,f),document.body.appendChild(s),jt(),ve(),s.addEventListener("pointerdown",Ft,{passive:!1}),s.addEventListener("pointermove",Ot,{passive:!1}),s.addEventListener("pointerup",Mt,{passive:!1}),s.addEventListener("pointercancel",Le),s.addEventListener("lostpointercapture",Le),s.addEventListener("click",$t),h.presetGrid?.addEventListener("click",async w=>{const D=w.target.closest(".nd-preset-card");if(!D)return;w.stopPropagation();const x=D.dataset.presetId;x&&x!==R().selectedParamsPresetId&&await He(x),s?.classList.remove("expanded")}),h.sizeSelect?.addEventListener("change",async w=>{await Ve(w.target.value)}),h.maxImagesBinding=H.bind(h.maxImagesInput),h.themeSwitch=Ae({document,container:s.querySelector(".nd-controls")}),h.popovers=ct(s,ve),h.autoToggle?.addEventListener("click",async()=>{await Qe()}),s.querySelector(".nd-settings-btn")?.addEventListener("click",()=>{s.classList.remove("expanded"),N(Me(),{source:import.meta.url,operation:"callback"})}),document.addEventListener("click",Ke,{passive:!0});const m=Y();m>=0&&N(U(m),{source:import.meta.url,operation:"createFloatingButton"})}function Ze(){Ce(h.presetGrid),h.popovers?.destroy(),h.themeSwitch?.destroy(),h.maxImagesBinding?.destroy(),oe(),F&&(clearTimeout(F),F=null),document.removeEventListener("click",Ke),s?.remove(),s=null,b=null,T=i.IDLE,h={}}function et(){g.forEach(e=>{ee(e?.$cache?.presetGrid)}),ee(h.presetGrid),Ht()}function Yt(){g.forEach(e=>{Z(e.$cache?.sizeSelect)}),Z(h.sizeSelect)}function Ht(){H.updateAll()}function Vt(){const e=R().mode==="auto";g.forEach(t=>{t.root&&(t.root.classList.toggle("auto-on",e),t.$cache.autoToggle&&ge(t.$cache.autoToggle,e))}),s&&(s.classList.toggle("auto-on",e),h.autoToggle&&ge(h.autoToggle,e))}function an(){et()}function sn(e,t){t&&!s?Je():!t&&s&&Ze(),e||(g.forEach((n,o)=>{n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),n.root&&xe(o,n.root)}),g.clear(),j.clear(),O?.disconnect(),O=null)}function ln(){const e=R();fe??=rt(wt),e.showFloatingButton===!0&&Je()}function dn(){fe?.(),fe=null,g.forEach((e,t)=>{e.autoResetTimer&&clearTimeout(e.autoResetTimer),e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e._cleanup?.(),e.root&&xe(t,e.root)}),g.clear(),j.clear(),O?.disconnect(),O=null,Ze()}export{i as FloatState,mt as SIZE_OPTIONS,Je as createFloatingButton,Ze as destroyFloatingButton,dn as destroyFloatingPanel,Nt as ensureNovelDrawPanel,ln as initFloatingPanel,on as refreshDrawRunUiState,an as refreshPresetSelect,an as refreshPresetSelectAll,rn as releaseNovelDrawPanel,G as setFloatingState,ne as setStateForMessage,Ht as updateAllMaxImagesInputs,et as updateAllPresetSelects,Yt as updateAllSizeSelects,Vt as updateAutoModeUI,sn as updateButtonVisibility};
