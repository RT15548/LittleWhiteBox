import{n as C}from"./async-errors-C4kfchr9.js";import{ut as te}from"./gallery-cache-Dq4zRh98.js";import{B as Qe,H as ke,V as O,ct as Xe,d as Te,in as Ke,lt as Je,n as ce,t as Ze,z as ue}from"./message-toolbar-Bs4CyevN.js";import{o as Ee}from"./panel-escape-ymarUWxh.js";import{gt as Se,mt as h,vt as I,yt as et}from"./draw-common-DlZJvGJ0.js";import{a as Ie,i as H,l as Le,o as ie,s as w,t as Re,u as Ne}from"./novel-draw-ClVKrAY8.js";import{a as tt,c as Ae,d as nt,f as ot,i as be,l as Pe,m as rt,o as at,p as pe,r as De,s as we,t as Fe,u as it}from"./draw-run-ui-state-CgVERtQP.js";import{getContext as A}from"../../../../../../scripts/extensions.js";var Me="xb_novel_float_pos",B=8e3,st="novelai",i={IDLE:"idle",SUBMITTING:"submitting",ACCEPTED:"accepted",UNCERTAIN:"uncertain",QUEUED:"queued",LLM:"llm",GEN:"gen",COOLDOWN:"cooldown",RECONNECTING:"reconnecting",CANCELLING:"cancelling",BACKEND_LEGACY:"backend_legacy",SUCCESS:"success",PARTIAL:"partial",ERROR:"error"},lt=[{value:"default",label:"跟随预设",width:null,height:null},{value:"auto",label:"AI 自动（按构图）",width:null,height:null},{value:"832x1216",label:"832 × 1216  竖图",width:832,height:1216},{value:"1216x832",label:"1216 × 832  横图",width:1216,height:832},{value:"1024x1024",label:"1024 × 1024  方图",width:1024,height:1024},{value:"768x1280",label:"768 x 1280  大竖",width:768,height:1280},{value:"1280x768",label:"1280 x 768  大横",width:1280,height:768}],p=new Map,W=new Map,L=null,s=null,m=null,x=i.IDLE,$=null,f={success:0,total:0,error:null,startTime:0},S=null,X=null,J=0,g={},ye=!1,se=null,Oe=74,$e=98,dt=`

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
.nd-float.nd-novel.error .nd-capsule { width: ${$e}px; }

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

/* 菜单 - 向下展开（楼层按钮用）；整体限高，预设网格在菜单内部滚动 */
.nd-novel .nd-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 242px;
    display: flex;
    flex-direction: column;
    /* 限高＝屏幕的 1/2~1/3。双声明：TT 的 WebView 会丢弃带 min()/vh 的声明，
       必须先给纯 px 回退（永远生效），现代浏览器再被 min() 覆盖取更小值 */
    max-height: 400px;
    max-height: min(50vh, 400px);
    overflow: hidden;
    background: var(--nd-bg-solid);
    border: 1px solid var(--nd-border);
    border-radius: 12px;
    padding: 10px;
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

/* 菜单默认向下展开；下方空间不足时整体翻到上方（placeMenuToViewport 在展开时测量决定），
   否则手机上悬浮钮靠近屏幕底部时菜单会一直伸到屏幕外，预设网格够不着也滚不了 */
.nd-float.nd-novel.menu-flip .nd-menu {
    top: auto;
    bottom: calc(100% + 8px);
}

.nd-novel .nd-card{
    background: transparent;
    border: none;
    border-radius: 0;
    overflow: visible;
    flex-shrink: 0;
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
${it}
.nd-novel .nd-max-images-input { background: var(--nd-bg-active); }
.nd-novel .nd-max-images-input:hover { border-color: var(--nd-border-hover); }
.nd-novel .nd-max-images-input:focus { border-color: var(--nd-text-muted); }

.nd-novel .nd-inner-sep{ display: none; }

.nd-novel .nd-controls{ display: flex; align-items: center; gap: 8px; margin-top: 10px; flex-shrink: 0; }

/* 尺寸（控制行内，弹性占满）+ 数目并排一行 */
.nd-novel .nd-row-pair{ display: flex; align-items: stretch; gap: 8px; padding: 6px 2px; }
.nd-novel .nd-row-pair .nd-row{ flex: 1; min-width: 0; padding: 0; }
.nd-novel .nd-row-pair .nd-label{ width: auto; padding-right: 2px; }
.nd-novel .nd-controls .nd-row{ flex: 1; min-width: 0; padding: 0; }

.nd-novel .nd-auto{
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 32px;
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
   画师串预设网格
   ═══════════════════════════════════════════════════════════════════════════ */
/* 结构与已验证可用的 nai-preset-switcher 对齐：
   普通 block 卡片（不用 button/flex），缩略图直接是 <img> 本身 */
.nd-preset-grid {
    flex: 1;
    min-height: 0;
    margin-top: 10px;
    display: grid;
    /* 固定 4 列：菜单宽 260px，内容约 240px，每列约 54px（原卡片一半） */
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: max-content;
    align-items: start;
    gap: 6px;
    align-content: start;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
}

.nd-preset-card {
    position: relative;
    border: 1px solid var(--nd-border-subtle);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    overflow: hidden;
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
    transition: border-color 0.15s, background 0.15s, transform 0.1s;
}
.nd-preset-card:hover { border-color: rgba(255, 255, 255, 0.28); background: rgba(255, 255, 255, 0.07); }
.nd-preset-card:active { transform: scale(0.96); }
.nd-preset-card.active {
    border: 1px solid var(--nd-success);
    box-shadow: 0 0 8px rgba(62, 207, 142, 0.35);
    background: rgba(62, 207, 142, 0.08);
}

/* 缩略图固定像素高度：绝不依赖 aspect-ratio 或百分比 padding，
   否则该 WebView 会把高度算成 0，导致卡片被压成细线、全部挤在一起不滚动。
   高度带 !important：楼层/悬浮两种挂载位置命中的宿主页样式不同（聊天消息里的
   img 规则可能更高优先级），不加会被宿主样式拉伸成“随位置填满高度” */
.nd-preset-thumb {
    width: 100% !important;
    height: 75px !important;
    max-height: 75px !important;
    object-fit: cover;
    background: rgba(128, 128, 128, 0.28);
    display: block;
    pointer-events: none;
}
.nd-preset-thumb.empty {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.35);
    font-size: 10px;
    line-height: 1.2;
    text-align: center;
    padding: 2px;
    box-sizing: border-box;
}

.nd-preset-check {
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
.nd-preset-card.active .nd-preset-check { display: flex; }

.nd-preset-name {
    font-size: 10px;
    line-height: 1.25;
    color: var(--nd-text-secondary);
    padding: 3px 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
}
.nd-preset-card.active .nd-preset-name { color: var(--nd-text-primary); }

.nd-preset-empty {
    grid-column: 1 / -1;
    text-align: center;
    color: var(--nd-text-muted);
    font-size: 11px;
    padding: 24px 0;
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

${ot}
@media (prefers-reduced-motion: reduce) {
    .nd-novel, .nd-novel * { transition: none !important; animation: none !important; }
}
`;function fe(){if(et(),ye)return;ye=!0;const e=document.createElement("style");e.id="nd-float-styles",e.textContent=dt,document.head.appendChild(e)}function d(e,t,n){const o=document.createElement(e);return t&&(o.className=t),n!==void 0&&(o.textContent=n),o}function u(e){return I(e==="chevron"?"chevron-down":e,"nd-icon")}function ge(){const e=d("span","nd-arrow");return e.appendChild(u("chevron")),e}function ze(){const e=d("button","nd-btn-menu nd-btn-menu-persist");return e.title="展开菜单",e.appendChild(ge()),e}function Y(e){if(!e)return;const t=w().overrideSize||"default";e.replaceChildren(),lt.forEach(n=>{const o=document.createElement("option");o.value=n.value,o.textContent=n.label,n.value===t&&(o.selected=!0),e.appendChild(o)})}function V(e){if(!e)return;const t=w(),n=t.paramsPresets||[],o=t.selectedParamsPresetId;if(e.replaceChildren(),!n.length){e.appendChild(d("div","nd-preset-empty","暂无画师串预设"));return}n.forEach(r=>{const a=d("div",`nd-preset-card${r.id===o?" active":""}`);a.dataset.presetId=r.id,a.title=r.name||"未命名",a.style.alignSelf="start";const l=()=>{const c=d("div","nd-preset-thumb empty","无预览");return c.style.cssText="width:100% !important;height:75px !important;max-height:75px !important;display:flex;align-items:center;justify-content:center;background:rgba(128,128,128,0.28);color:rgba(255,255,255,0.45);font-size:10px;line-height:1.2;text-align:center;padding:2px;box-sizing:border-box;",c};if(r.thumbnail){const c=document.createElement("img");c.className="nd-preset-thumb",c.alt="",c.loading="lazy",c.decoding="async",c.style.cssText="width:100% !important;height:75px !important;max-height:75px !important;object-fit:cover;display:block;background:rgba(128,128,128,0.28);box-sizing:border-box;",c.src=r.thumbnail,c.addEventListener("error",()=>c.replaceWith(l()),{once:!0}),a.appendChild(c)}else a.appendChild(l());a.appendChild(d("span","nd-preset-check","✓")),a.appendChild(d("div","nd-preset-name",r.name||"未命名")),e.appendChild(a)})}var z=nt({getOverride:()=>w().overrideMaxImages,getPresetMaxImages:()=>{const e=w();return Ke(e.paramsPresets,e.selectedParamsPresetId)},persistOverride:(e,{okText:t})=>Ne(n=>{n.overrideMaxImages=e},t),listInputs:()=>[...p.values()].map(e=>e.$cache?.maxImagesInput).concat(g.maxImagesInput),notify:e=>globalThis.toastr?.warning?.(e)});function ct(e){return{messageId:e,root:null,state:i.IDLE,result:{success:0,total:0,error:null,startTime:0},autoResetTimer:null,cooldownRafId:null,cooldownEndTime:0,$cache:{},_cleanup:null}}function ut(e){const t=w().mode==="auto",n=document.createElement("div");n.className=`nd-float nd-novel lwb-draw-ui${t?" auto-on":""}`,n.dataset.messageId=e;const o=d("div","nd-capsule"),r=d("div","nd-inner"),a=d("div","nd-layer nd-layer-idle"),l=d("button","nd-btn-draw");l.title="点击生成配图",l.appendChild(u("palette")),l.appendChild(d("span","nd-auto-dot"));const c=d("div","nd-sep"),v=d("button","nd-btn-menu");v.title="展开菜单",v.appendChild(ge()),a.append(l,c,v);const D=d("button","nd-layer nd-layer-active");D.append(d("span","nd-status-icon"),d("span","nd-status-text",h.analysis)),r.append(a,D),o.append(r,ze());const F=d("div","nd-detail"),R=d("div","nd-detail-row");R.append(I("images","nd-detail-icon"),d("span","nd-detail-label","结果"),d("span","nd-detail-value nd-result","-"));const N=d("div","nd-detail-row nd-error-row");N.style.display="none",N.append(I("circle-info","nd-detail-icon"),d("span","nd-detail-label","原因"),d("span","nd-detail-value error nd-error","-"));const y=d("div","nd-detail-row");y.append(I("clock","nd-detail-icon"),d("span","nd-detail-label","耗时"),d("span","nd-detail-value nd-time","-")),F.append(R,N,y);const T=d("div","nd-menu"),k=d("div","nd-card"),E=d("div",`nd-auto${t?" on":""} nd-auto-toggle`);E.append(d("span","nd-dot"),d("span","nd-auto-text",t?"自动":"手动"));const b=d("div","nd-row-pair");b.append(E,z.createRow()),k.append(b);const M=d("div","nd-controls"),Q=d("div","nd-row");Q.appendChild(d("span","nd-label","尺寸"));const q=d("select","nd-select size nd-size-select");Y(q),Q.appendChild(q);const G=d("button","nd-gear nd-settings-btn");G.title="打开设置",G.appendChild(I("sliders")),M.append(Q,G);const U=d("div","nd-preset-grid");return V(U),T.append(k,M,U),n.append(o,F,T),n}function pt(e){const t=e.root;t&&(e.$cache={statusIcon:t.querySelector(".nd-status-icon"),statusText:t.querySelector(".nd-status-text"),result:t.querySelector(".nd-result"),errorRow:t.querySelector(".nd-error-row"),error:t.querySelector(".nd-error"),time:t.querySelector(".nd-time"),sizeSelect:t.querySelector(".nd-size-select"),maxImagesInput:t.querySelector(`.${Pe}`),autoToggle:t.querySelector(".nd-auto-toggle"),presetGrid:t.querySelector(".nd-preset-grid")})}function j(e,t,n={}){const o=p.get(e);if(!o?.root)return;const r=o.root;o.state=t,o.autoResetTimer&&(clearTimeout(o.autoResetTimer),o.autoResetTimer=null),t!==i.COOLDOWN&&o.cooldownRafId&&(cancelAnimationFrame(o.cooldownRafId),o.cooldownRafId=null,o.cooldownEndTime=0),r.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:a,statusText:l}=o.$cache;switch(l&&(l.className="nd-status-text"),t){case i.IDLE:o.result={success:0,total:0,error:null,startTime:0};break;case i.SUBMITTING:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),a&&(a.replaceChildren(u("upload")),a.className="nd-status-icon nd-spin"),l&&(l.textContent=h.submitting);break;case i.ACCEPTED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),a&&(a.replaceChildren(u(["analysis","retry"].includes(De(n))?"spinner":"palette")),a.className="nd-status-icon nd-spin"),l&&(l.textContent=Fe(n));break;case i.UNCERTAIN:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),a&&(a.replaceChildren(u("rotate")),a.className="nd-status-icon nd-spin"),l&&(l.textContent=h.uncertain);break;case i.QUEUED:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),a&&(a.replaceChildren(u("clock")),a.className="nd-status-icon"),l&&(l.textContent=h.queued),o.result.total=n.total||o.result.total||0;break;case i.LLM:r.classList.add("working"),o.result.startTime||(o.result.startTime=Date.now()),a&&(a.replaceChildren(u("spinner")),a.className="nd-status-icon nd-spin"),l&&(l.textContent=Se(n));break;case i.GEN:r.classList.add("working"),a&&(a.replaceChildren(u("palette")),a.className="nd-status-icon nd-spin"),l&&(l.textContent=`${n.current||0}/${n.total||0}`),o.result.total=n.total||0;break;case i.COOLDOWN:r.classList.add("cooldown"),a&&(a.replaceChildren(u("spinner")),a.className="nd-status-icon nd-spin"),gt(o,n);break;case i.RECONNECTING:r.classList.add("working"),a&&(a.replaceChildren(u("rotate")),a.className="nd-status-icon nd-spin"),l&&(l.textContent=h.reconnecting);break;case i.CANCELLING:r.classList.add("working"),a&&(a.replaceChildren(u("spinner")),a.className="nd-status-icon nd-spin"),l&&(l.textContent=h.cancelling);break;case i.BACKEND_LEGACY:r.classList.add("working"),a&&(a.replaceChildren(u("share-from-square")),a.className="nd-status-icon"),l&&(l.textContent=h.legacy);break;case i.SUCCESS:r.classList.add("success"),a&&(a.replaceChildren(u("check")),a.className="nd-status-icon"),l&&(l.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>j(e,i.IDLE),B);break;case i.PARTIAL:r.classList.add("partial"),a&&(a.replaceChildren(u("triangle-exclamation")),a.className="nd-status-icon"),l&&(l.textContent=`${n.success}/${n.total}`),o.result.success=n.success,o.result.total=n.total,o.autoResetTimer=setTimeout(()=>j(e,i.IDLE),B);break;case i.ERROR:r.classList.add("error"),a&&(a.replaceChildren(u("xmark")),a.className="nd-status-icon"),l&&(l.textContent=n.unknown?h.unknown:h.error),o.result.error=n.error,o.autoResetTimer=setTimeout(()=>j(e,i.IDLE),B);break}}async function _(e,t={}){const n=ie(e);if(n){Z(e,n.state,n.data);return}const o=ue(e),r=await Qe(e).catch(()=>null);if(!r||!O(o))return;e=A().chat.indexOf(o.message);const a=ie(e);if(a){Z(e,a.state,a.data);return}const l=A(),c=String(l?.chatId||""),v=l?.chat?.[Number(e)];if(!c||!v)return;const D=Number.isInteger(v.swipe_id)?v.swipe_id:0,F=Number.isSafeInteger(r.swipeIndex)?r.swipeIndex:D,R=r.provider||t?.provider||st,N=r.runId||t?.runId||"",y={chatId:c,messageId:e,swipeIndex:F,provider:R,runId:N},T=tt({detail:t,pending:r.pending,...y}),k=at(T,r,y),E=p.get(e);if(E){const b=we({currentState:E.state,pending:r.pending,detail:k,...y});(b!==E.state||b===i.ACCEPTED&&be(T))&&j(e,b,k)}if(s&&Number(e)===H()){const b=we({currentState:x,pending:r.pending,detail:k,...y});r.pending&&($=Number(e)),(b!==x||b===i.ACCEPTED&&be(T))&&P(b,k)}}function ft(e={}){const t=Xe(e,A());if(!t)return;const n=H();(p.has(t.messageId)||s&&t.messageId===n)&&C(_(t.messageId,e),{source:import.meta.url,operation:"syncDrawRunActivity"})}function Xt(){const e=H();if(s){const t=e>=0?ie(e):null;t?($=e,P(t.state,t.data)):P(i.IDLE)}e>=0&&C(_(e),{source:import.meta.url,operation:"refreshDrawRunUiState"})}function _e({cooldownUntil:e,duration:t}={}){const n=Number(e);return Number.isFinite(n)&&n>0?n:Date.now()+Math.max(0,Number(t)||0)}function gt(e,t){e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e.cooldownEndTime=_e(t);function n(){if(!e.cooldownEndTime)return;const o=Math.max(0,e.cooldownEndTime-Date.now()),r=e.$cache?.statusText;if(r&&(r.textContent=`${(o/1e3).toFixed(1)}s`,r.className="nd-status-text nd-countdown"),o<=0){e.cooldownRafId=null,e.cooldownEndTime=0;return}e.cooldownRafId=requestAnimationFrame(n)}e.cooldownRafId=requestAnimationFrame(n)}function mt(e){const t=p.get(e);if(!t?.root)return;const{result:n,errorRow:o,error:r,time:a}=t.$cache,{result:l,state:c}=t,v=l.startTime?((Date.now()-l.startTime)/1e3).toFixed(1):"-";c===i.SUCCESS||c===i.PARTIAL?(n&&(n.textContent=`${l.success}/${l.total} 成功`,n.className=`nd-detail-value ${c===i.SUCCESS?"success":"warning"}`),o&&(o.style.display=c===i.PARTIAL?"flex":"none"),r&&c===i.PARTIAL&&(r.textContent=`${l.total-l.success} 张失败`)):c===i.ERROR&&(n&&(n.textContent=l.error?.label||te.redrawFailed,n.className="nd-detail-value error"),o&&(o.style.display="flex"),r&&(r.textContent=l.error?.desc||"未知错误")),a&&(a.textContent=`${v}s`)}async function vt(e){const t=p.get(e);if(!(!t||t.state!==i.IDLE))try{await Ie({messageId:e,onStateChange:(n,o,r)=>{Z(r,n,o)}})}catch(n){if(n.drawTaskReported)return;n instanceof Te||ke(n)?toastr?.info?.(n.message):(console.error(n),toastr?.error?.(n.message))}}async function ht(e){const t=ue(e);try{await Ae({cancel:()=>Re(e,{target:t}),isCurrent:()=>O(t),getState:()=>p.get(A().chat.indexOf(t.message))?.state,setState:n=>j(A().chat.indexOf(t.message),n)})&&O(t)&&toastr?.info?.("正在中止"),O(t)&&await _(A().chat.indexOf(t.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(te.cancelFailed)}}function xt(e){const{messageId:t,root:n}=e;n.querySelector(".nd-btn-draw")?.addEventListener("click",l=>{l.stopPropagation(),C(vt(t),{source:import.meta.url,operation:"callback"})}),n.querySelectorAll(".nd-btn-menu").forEach(l=>l.addEventListener("click",c=>{c.stopPropagation(),n.classList.remove("show-detail"),n.classList.contains("expanded")||(bt(t),wt(t),yt(t),He(n)),n.classList.toggle("expanded")})),n.querySelector(".nd-layer-active")?.addEventListener("click",l=>{l.stopPropagation();const c=e.state;[i.SUBMITTING,i.ACCEPTED,i.UNCERTAIN,i.QUEUED,i.LLM,i.GEN,i.COOLDOWN,i.RECONNECTING,i.BACKEND_LEGACY].includes(c)?C(ht(t),{source:import.meta.url,operation:"callback"}):[i.SUCCESS,i.PARTIAL,i.ERROR].includes(c)&&(mt(t),n.classList.toggle("show-detail"))}),e.$cache.presetGrid?.addEventListener("click",async l=>{const c=l.target.closest(".nd-preset-card");if(!c)return;l.stopPropagation();const v=c.dataset.presetId;v&&v!==w().selectedParamsPresetId&&await qe(v),n.classList.remove("expanded")}),e.$cache.sizeSelect?.addEventListener("change",async l=>{await Ge(l.target.value)});const o=z.bind(e.$cache.maxImagesInput);e.$cache.autoToggle?.addEventListener("click",async()=>{await Ue()}),n.querySelector(".nd-settings-btn")?.addEventListener("click",l=>{l.stopPropagation(),n.classList.remove("expanded"),C(Le(),{source:import.meta.url,operation:"callback"})});const r=l=>{n.contains(l.target)||n.classList.remove("expanded","show-detail")};document.addEventListener("click",r,{passive:!0});const a=Ee({document,container:n.querySelector(".nd-controls")});e._cleanup=()=>{a?.destroy(),o.destroy(),document.removeEventListener("click",r),e.autoResetTimer&&clearTimeout(e.autoResetTimer),e.autoResetTimer=null,e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e.cooldownRafId=null,e.cooldownEndTime=null}}function bt(e){V(p.get(e)?.$cache?.presetGrid)}function wt(e){const t=p.get(e)?.$cache?.sizeSelect;Y(t)}function yt(e){z.fill(p.get(e)?.$cache?.maxImagesInput)}async function me(e,t,n){const o=await Ne(e,t);return o&&typeof n=="function"&&n(),o}async function qe(e){return me(t=>{t.selectedParamsPresetId=e},"预设已切换",Ve)}async function Ge(e){return me(t=>{t.overrideSize=e},"尺寸已切换",_t)}async function Ue(){const e=w().mode==="auto"?"manual":"auto";return me(t=>{t.mode=e},e==="auto"?"自动配图已开启":"自动配图已关闭",Gt)}function le(e,t){if(p.has(t)){const r=p.get(t);if(r.root?.isConnected)return C(_(t),{source:import.meta.url,operation:"mountFloorPanel"}),r;r._cleanup?.(),p.delete(t)}fe();const n=ct(t),o=ut(t);return n.root=o,Ze(t,o,{position:"right",id:`novel-draw-${t}`})?(pt(n),xt(n),p.set(t,n),C(_(t),{source:import.meta.url,operation:"mountFloorPanel"}),n):null}function Ct(){L||(L=new IntersectionObserver(e=>{const t=[];for(const n of e){if(!n.isIntersecting)continue;const o=n.target,r=Number(o.getAttribute("mesid"));W.has(r)&&(t.push({el:o,mid:r}),W.delete(r),L.unobserve(o))}t.length>0&&requestAnimationFrame(()=>{for(const{el:n,mid:o}of t)le(n,o)})},{rootMargin:"300px"}))}function kt(e,t,n={}){if(w().showFloorButton===!1)return null;const{force:o=!1}=n;if(fe(),p.has(t)){const a=p.get(t);if(a.root?.isConnected)return a;a._cleanup?.(),p.delete(t)}if(o)return le(e,t);const r=e.getBoundingClientRect();return r.top<window.innerHeight+500&&r.bottom>-500?le(e,t):(Ct(),W.set(t,!0),L.observe(e),null)}function Kt(e,t){L?.unobserve(e),W.delete(t);const n=p.get(t);!n||!e.contains(n.root)||(n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),ce(t,n.root),p.delete(t))}function Z(e,t,n={}){let o=p.get(e);if(!o?.root?.isConnected){const r=document.querySelector(`.mes[mesid="${e}"]`);r&&(o=kt(r,e,{force:!0}))}o&&j(e,t,n),s&&e===H()&&($=e,P(t,n))}function Tt(){try{const t=localStorage.getItem(Me);if(t)return JSON.parse(t)}catch(t){console.warn({source:import.meta.url,operation:"getFloatingPosition"},t)}const e=document.getElementById("xiaobaix-debug-mini");if(e){const t=e.getBoundingClientRect();return{left:t.left,top:t.bottom+8}}return{left:window.innerWidth-110,top:window.innerHeight-80}}var ne=null;function oe(e){s&&(ne=e,s.classList.toggle("nd-docked-left",e==="left"),s.classList.toggle("nd-docked-right",e==="right"))}function ve(){if(!s)return;const e=parseFloat(s.style.left)||0,t=parseFloat(s.style.top)||0;try{localStorage.setItem(Me,JSON.stringify({left:Math.round(e),top:Math.round(t),docked:ne||""}))}catch(n){console.warn({source:import.meta.url,operation:"saveFloatingPosition"},n)}}function de(){if(!s)return;const e=Tt(),t=pe(),n=x===i.IDLE?Oe:$e,o=s.offsetHeight||34,r=30,a=e.docked==="left"?t.left:e.docked==="right"?t.right-n:e.left;s.style.left=`${Math.max(t.left,Math.min(a,t.right-n))}px`,s.style.top=`${Math.max(t.top+r,Math.min(e.top,t.bottom-o-r))}px`,oe(e.docked==="left"||e.docked==="right"?e.docked:null)}function ee(){X&&(cancelAnimationFrame(X),X=null),J=0}function Et(e){ee(),J=_e(e);function t(){if(!J)return;const n=Math.max(0,J-Date.now()),o=g.statusText;if(o&&(o.textContent=`${(n/1e3).toFixed(1)}s`,o.className="nd-status-text nd-countdown"),n<=0){ee();return}X=requestAnimationFrame(t)}X=requestAnimationFrame(t)}function P(e,t={}){if(!s)return;const n=x===i.IDLE;x=e,n!==(e===i.IDLE)&&de(),S&&(clearTimeout(S),S=null),e!==i.COOLDOWN&&ee(),s.classList.remove("working","cooldown","success","partial","error","show-detail");const{statusIcon:o,statusText:r}=g;if(!(!o||!r))switch(r.className="nd-status-text",e){case i.IDLE:$=null,f={success:0,total:0,error:null,startTime:0};break;case i.SUBMITTING:s.classList.add("working"),f.startTime||(f.startTime=Date.now()),o.replaceChildren(u("upload")),o.className="nd-status-icon nd-spin",r.textContent=h.submitting;break;case i.ACCEPTED:s.classList.add("working"),f.startTime||(f.startTime=Date.now()),o.replaceChildren(u(["analysis","retry"].includes(De(t))?"spinner":"palette")),o.className="nd-status-icon nd-spin",r.textContent=Fe(t);break;case i.UNCERTAIN:s.classList.add("working"),f.startTime||(f.startTime=Date.now()),o.replaceChildren(u("rotate")),o.className="nd-status-icon nd-spin",r.textContent=h.uncertain;break;case i.QUEUED:s.classList.add("working"),f.startTime||(f.startTime=Date.now()),o.replaceChildren(u("clock")),o.className="nd-status-icon",r.textContent=h.queued;break;case i.LLM:s.classList.add("working"),f.startTime||(f.startTime=Date.now()),o.replaceChildren(u("spinner")),o.className="nd-status-icon nd-spin",r.textContent=Se(t);break;case i.GEN:s.classList.add("working"),o.replaceChildren(u("palette")),o.className="nd-status-icon nd-spin",r.textContent=`${t.current||0}/${t.total||0}`,f.total=t.total||0;break;case i.COOLDOWN:s.classList.add("cooldown"),o.replaceChildren(u("spinner")),o.className="nd-status-icon nd-spin",Et(t);break;case i.RECONNECTING:s.classList.add("working"),o.replaceChildren(u("rotate")),o.className="nd-status-icon nd-spin",r.textContent=h.reconnecting;break;case i.CANCELLING:s.classList.add("working"),o.replaceChildren(u("spinner")),o.className="nd-status-icon nd-spin",r.textContent=h.cancelling;break;case i.BACKEND_LEGACY:s.classList.add("working"),o.replaceChildren(u("share-from-square")),o.className="nd-status-icon",r.textContent=h.legacy;break;case i.SUCCESS:s.classList.add("success"),o.replaceChildren(u("check")),o.className="nd-status-icon",r.textContent=`${t.success}/${t.total}`,f.success=t.success,f.total=t.total,S=setTimeout(()=>P(i.IDLE),B);break;case i.PARTIAL:s.classList.add("partial"),o.replaceChildren(u("triangle-exclamation")),o.className="nd-status-icon",r.textContent=`${t.success}/${t.total}`,f.success=t.success,f.total=t.total,S=setTimeout(()=>P(i.IDLE),B);break;case i.ERROR:s.classList.add("error"),o.replaceChildren(u("xmark")),o.className="nd-status-icon",r.textContent=t.unknown?h.unknown:h.error,f.error=t.error,S=setTimeout(()=>P(i.IDLE),B);break}}function St(){const{detailResult:e,detailErrorRow:t,detailError:n,detailTime:o}=g;if(!e)return;const r=f.startTime?((Date.now()-f.startTime)/1e3).toFixed(1):"-";x===i.SUCCESS||x===i.PARTIAL?(e.textContent=`${f.success}/${f.total} 成功`,e.className=`nd-detail-value ${x===i.SUCCESS?"success":"warning"}`,t.style.display=x===i.PARTIAL?"flex":"none",x===i.PARTIAL&&(n.textContent=`${f.total-f.success} 张失败`)):x===i.ERROR&&(e.textContent=f.error?.label||te.redrawFailed,e.className="nd-detail-value error",t.style.display="flex",n.textContent=f.error?.desc||"未知错误"),o.textContent=`${r}s`}function It(e){if(!(e.button!==0||m||!e.target.closest(".nd-capsule, .nd-img-jump"))){if(ne){oe(null),ve(),e.preventDefault();return}m={startX:e.clientX,startY:e.clientY,startLeft:s.getBoundingClientRect().left,startTop:s.getBoundingClientRect().top,pointerId:e.pointerId,moved:!1,originalTarget:e.target};try{e.currentTarget.setPointerCapture(e.pointerId)}catch(t){console.warn({source:import.meta.url,operation:"onFloatingPointerDown"},t)}e.preventDefault()}}function Lt(e){if(!m||m.pointerId!==e.pointerId)return;const t=e.clientX-m.startX,n=e.clientY-m.startY;if(!m.moved&&(Math.abs(t)>3||Math.abs(n)>3)&&(m.moved=!0),m.moved){const o=pe(),r=s.offsetWidth||88,a=s.offsetHeight||36,l=30;s.style.left=`${Math.max(o.left,Math.min(m.startLeft+t,o.right-r))}px`,s.style.top=`${Math.max(o.top+l,Math.min(m.startTop+n,o.bottom-a-l))}px`}e.preventDefault()}function Rt(e){if(!m||m.pointerId!==e.pointerId)return;const{moved:t,originalTarget:n}=m;if(m=null,e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId),t){const o=parseFloat(s.style.left)||0,r=s.offsetWidth||88,a=28,l=pe();let c=null;o<=l.left+a?c="left":o>=l.right-r-a&&(c="right"),c&&(s.style.left=`${c==="left"?l.left:l.right-r}px`),oe(c),ve()}else Be(n)}function Ce(e){if(!m||m.pointerId!==e.pointerId)return;const{startLeft:t,startTop:n}=m;m=null,s.style.left=`${t}px`,s.style.top=`${n}px`,e.currentTarget.hasPointerCapture(e.pointerId)&&e.currentTarget.releasePointerCapture(e.pointerId)}function Nt(e){if(e.target.closest(".nd-capsule, .nd-img-jump")&&(e.preventDefault(),e.stopPropagation(),e.detail===0)){if(ne){oe(null),ve();return}Be(e.target)}}function At(){return[...document.querySelectorAll("#chat .mes .mes_text .xb-nd-img")].filter(e=>e.offsetHeight>0&&e.offsetWidth>0&&e.querySelector("img"))}function Pt(e){const t=window.innerHeight/2;let n=null,o=1/0;for(const r of At()){const a=r.getBoundingClientRect();if(e<0&&a.bottom<t-1){const l=t-a.bottom;l<o&&(o=l,n=r)}else if(e>0&&a.top>t+1){const l=a.top-t;l<o&&(o=l,n=r)}}n&&n.scrollIntoView({behavior:"smooth",block:"center"})}function Be(e){e.closest(".nd-img-jump")?Pt(e.closest(".nd-img-jump-prev")?-1:1):e.closest(".nd-btn-draw")?C(Dt(),{source:import.meta.url,operation:"routeFloatingClick"}):e.closest(".nd-btn-menu")?(s.classList.remove("show-detail"),s.classList.contains("expanded")||(Mt(),Ot(),$t(),He(s)),s.classList.toggle("expanded")):e.closest(".nd-layer-active")&&([i.SUBMITTING,i.ACCEPTED,i.UNCERTAIN,i.QUEUED,i.LLM,i.GEN,i.COOLDOWN,i.RECONNECTING,i.BACKEND_LEGACY].includes(x)?C(Ft(),{source:import.meta.url,operation:"routeFloatingClick"}):[i.SUCCESS,i.PARTIAL,i.ERROR].includes(x)&&(St(),s.classList.toggle("show-detail")))}async function Dt(){if(x!==i.IDLE)return;const e=H();if(e<0){toastr?.warning?.("没有可配图的AI消息");return}$=e;try{await Ie({messageId:e,onStateChange:(t,n,o)=>{Z(o,t,n)}})}catch(t){if(t.drawTaskReported)return;t instanceof Te||ke(t)?toastr?.info?.(t.message):(console.error(t),toastr?.error?.(t.message))}}async function Ft(){const e=$,t=ue(e);try{e>=0&&await Ae({cancel:()=>Re(e,{target:t}),isCurrent:()=>O(t)&&$===A().chat.indexOf(t.message),getState:()=>x,setState:P})&&O(t)&&toastr?.info?.("正在中止"),e>=0&&O(t)&&await _(A().chat.indexOf(t.message))}catch(n){console.error("[NovelDraw] 中止失败:",n),toastr?.error?.(te.cancelFailed)}}function Mt(){V(g.presetGrid)}function Ot(){Y(g.sizeSelect)}function $t(){z.fill(g.maxImagesInput)}function zt(){s&&(g={capsule:s.querySelector(".nd-capsule"),statusIcon:s.querySelector(".nd-status-icon"),statusText:s.querySelector(".nd-status-text"),detailResult:s.querySelector(".nd-result"),detailErrorRow:s.querySelector(".nd-error-row"),detailError:s.querySelector(".nd-error"),detailTime:s.querySelector(".nd-time"),sizeSelect:s.querySelector(".nd-size-select"),maxImagesInput:s.querySelector(`.${Pe}`),autoToggle:s.querySelector(".nd-auto-toggle"),presetGrid:s.querySelector(".nd-preset-grid")})}function je(e){s&&!s.contains(e.target)&&s.classList.remove("expanded","show-detail")}function We(){if(s)return;const e=w();if(e.showFloatingButton!==!0)return;fe();const t=e.mode==="auto";s=document.createElement("div"),s.className=`nd-float nd-novel lwb-draw-ui nd-floating-global${t?" auto-on":""}`,s.id="nd-floating-global";const n=d("div","nd-detail"),o=d("div","nd-detail-row");o.append(I("images","nd-detail-icon"),d("span","nd-detail-label","结果"),d("span","nd-detail-value nd-result","-"));const r=d("div","nd-detail-row nd-error-row");r.style.display="none",r.append(I("circle-info","nd-detail-icon"),d("span","nd-detail-label","原因"),d("span","nd-detail-value error nd-error","-"));const a=d("div","nd-detail-row");a.append(I("clock","nd-detail-icon"),d("span","nd-detail-label","耗时"),d("span","nd-detail-value nd-time","-")),n.append(o,r,a);const l=d("div","nd-menu"),c=d("div","nd-card"),v=d("div",`nd-auto${t?" on":""} nd-auto-toggle`);v.append(d("span","nd-dot"),d("span","nd-auto-text",t?"自动":"手动"));const D=d("div","nd-row-pair");D.append(v,z.createRow()),c.append(D);const F=d("div","nd-controls"),R=d("div","nd-row");R.appendChild(d("span","nd-label","尺寸"));const N=d("select","nd-select size nd-size-select");Y(N),R.appendChild(N);const y=d("button","nd-gear nd-settings-btn");y.title="打开设置",y.appendChild(I("sliders")),F.append(R,y);const T=d("div","nd-preset-grid");V(T),l.append(c,F,T);const k=d("div","nd-capsule"),E=d("div","nd-inner"),b=d("div","nd-layer nd-layer-idle"),M=d("button","nd-btn-draw");M.title="点击为最后一条AI消息生成配图",M.appendChild(u("palette")),M.appendChild(d("span","nd-auto-dot"));const Q=d("div","nd-sep"),q=d("button","nd-btn-menu");q.title="展开菜单",q.appendChild(ge()),b.append(M,Q,q);const G=d("button","nd-layer nd-layer-active");G.append(d("span","nd-status-icon"),d("span","nd-status-text",h.analysis)),E.append(b,G),k.append(E,ze());const U=d("button","nd-img-jump nd-img-jump-prev");U.appendChild(u("chevron")),U.title="跳到上一张图片";const re=d("button","nd-img-jump nd-img-jump-next");re.appendChild(u("chevron")),re.title="跳到下一张图片",s.append(n,l,U,k,re),document.body.appendChild(s),zt(),de(),s.addEventListener("pointerdown",It,{passive:!1}),s.addEventListener("pointermove",Lt,{passive:!1}),s.addEventListener("pointerup",Rt,{passive:!1}),s.addEventListener("pointercancel",Ce),s.addEventListener("lostpointercapture",Ce),s.addEventListener("click",Nt),g.presetGrid?.addEventListener("click",async K=>{const xe=K.target.closest(".nd-preset-card");if(!xe)return;K.stopPropagation();const ae=xe.dataset.presetId;ae&&ae!==w().selectedParamsPresetId&&await qe(ae),s?.classList.remove("expanded")}),g.sizeSelect?.addEventListener("change",async K=>{await Ge(K.target.value)}),g.maxImagesBinding=z.bind(g.maxImagesInput),g.themeSwitch=Ee({document,container:s.querySelector(".nd-controls")}),g.popovers=rt(s,de),g.autoToggle?.addEventListener("click",async()=>{await Ue()}),s.querySelector(".nd-settings-btn")?.addEventListener("click",()=>{s.classList.remove("expanded"),C(Le(),{source:import.meta.url,operation:"callback"})}),document.addEventListener("click",je,{passive:!0});const he=H();he>=0&&C(_(he),{source:import.meta.url,operation:"createFloatingButton"})}function Ye(){g.popovers?.destroy(),g.themeSwitch?.destroy(),g.maxImagesBinding?.destroy(),ee(),S&&(clearTimeout(S),S=null),document.removeEventListener("click",je),s?.remove(),s=null,m=null,x=i.IDLE,g={}}function Ve(){p.forEach(e=>{V(e?.$cache?.presetGrid)}),V(g.presetGrid),qt()}function _t(){p.forEach(e=>{Y(e.$cache?.sizeSelect)}),Y(g.sizeSelect)}function qt(){z.updateAll()}function He(e){const t=e?.querySelector?.(".nd-menu");if(!t)return;const n=e.ownerDocument?.defaultView||window,o=e.getBoundingClientRect(),r=8,a=n.innerHeight-o.bottom-r,l=o.top-r,c=Math.min((n.innerHeight||800)*.5,400),v=a<Math.min(t.offsetHeight||c,c)&&l>a;e.classList.toggle("menu-flip",v),t.style.maxHeight=`${Math.round(Math.max(240,Math.min(c,v?l:a)))}px`}function Gt(){const e=w().mode==="auto",t=e?"自动":"手动";if(p.forEach(n=>{if(!n.root)return;n.root.classList.toggle("auto-on",e),n.$cache.autoToggle?.classList.toggle("on",e);const o=n.$cache.autoToggle?.querySelector(".nd-auto-text");o&&(o.textContent=t)}),s){s.classList.toggle("auto-on",e),g.autoToggle?.classList.toggle("on",e);const n=g.autoToggle?.querySelector(".nd-auto-text");n&&(n.textContent=t)}}function Jt(){Ve()}function Zt(e,t){t&&!s?We():!t&&s&&Ye(),e||(p.forEach((n,o)=>{n.autoResetTimer&&clearTimeout(n.autoResetTimer),n.cooldownRafId&&cancelAnimationFrame(n.cooldownRafId),n._cleanup?.(),n.root&&ce(o,n.root)}),p.clear(),W.clear(),L?.disconnect(),L=null)}function en(){const e=w();se??=Je(ft),e.showFloatingButton===!0&&We()}function tn(){se?.(),se=null,p.forEach((e,t)=>{e.autoResetTimer&&clearTimeout(e.autoResetTimer),e.cooldownRafId&&cancelAnimationFrame(e.cooldownRafId),e._cleanup?.(),e.root&&ce(t,e.root)}),p.clear(),W.clear(),L?.disconnect(),L=null,Ye()}export{i as FloatState,lt as SIZE_OPTIONS,We as createFloatingButton,Ye as destroyFloatingButton,tn as destroyFloatingPanel,kt as ensureNovelDrawPanel,en as initFloatingPanel,Xt as refreshDrawRunUiState,Jt as refreshPresetSelect,Jt as refreshPresetSelectAll,Kt as releaseNovelDrawPanel,P as setFloatingState,Z as setStateForMessage,qt as updateAllMaxImagesInputs,Ve as updateAllPresetSelects,_t as updateAllSizeSelects,Gt as updateAutoModeUI,Zt as updateButtonVisibility};
