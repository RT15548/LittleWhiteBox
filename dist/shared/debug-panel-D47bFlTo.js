import{t as v}from"./preload-helper-CBBx94LT.js";import{r as U}from"./constants-RJ4jNr01.js";import{a as J,o as V}from"./js-yaml-BpV9YyAB.js";var W="xiaobaix_debug_panel_pos_v2",X="xiaobaix_debug_panel_minipos_v2",p=!1,b=!1,a=null,r=null,g=null,s=null,D=null,S=0,L=!1,O=!1,P=null,M=!1,h=null,x=null,y=null,T=0,C=0,A=0,u=[],w=[],k=50,j=500,f=(e,t,n)=>Math.max(t,Math.min(n,e)),E=()=>window.innerWidth<=768,K=e=>(e||[]).filter(t=>t?.level==="error").length,Q=e=>(e||[]).reduce((t,n)=>Math.max(t,Number(n?.id)||0),0);function z(e){try{const t=localStorage.getItem(e);return t?JSON.parse(t):null}catch{return null}}function $(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function Z(){try{return{domCount:document.querySelectorAll("*").length,messageCount:document.querySelectorAll(".mes").length,imageCount:document.querySelectorAll("img").length}}catch{return{domCount:0,messageCount:0,imageCount:0}}}function ee(){h||(h=window.fetch,window.fetch=async function(e,t){const n=typeof e=="string"?e:e?.url||"",i=t?.method||"GET",o=performance.now(),l=Date.now();try{const d=await h.apply(this,arguments),m=performance.now()-o;return n.includes("/api/")&&m>=j&&(u.push({url:n,method:i,duration:Math.round(m),timestamp:l,status:d.status}),u.length>k&&u.shift()),d}catch(d){const m=performance.now()-o;throw u.push({url:n,method:i,duration:Math.round(m),timestamp:l,status:"error"}),u.length>k&&u.shift(),d}})}function te(){h&&(window.fetch=h,h=null)}function ne(){if(!x)try{if(typeof PerformanceObserver>"u")return;x=new PerformanceObserver(e=>{for(const t of e.getEntries())if(t.duration>=200){let n="主页面";try{const i=t.attribution?.[0];if(i)if(i.containerType==="iframe"){if(n="iframe",i.containerSrc){const o=new URL(i.containerSrc,location.href);n+=`: ${o.pathname.split("/").pop()||o.pathname}`}}else i.containerName&&(n=i.containerName)}catch{}w.push({duration:Math.round(t.duration),timestamp:Date.now(),source:n}),w.length>k&&w.shift()}}),x.observe({entryTypes:["longtask"]})}catch{}}function ie(){if(x){try{x.disconnect()}catch{}x=null}}function ae(){if(y)return;T=performance.now(),C=0;const e=t=>{C++,t-T>=1e3&&(A=C,C=0,T=t),y=requestAnimationFrame(e)};y=requestAnimationFrame(e)}function re(){y&&(cancelAnimationFrame(y),y=null),A=0}function oe(){if(typeof performance>"u"||!performance.memory)return null;const e=performance.memory;return{used:e.usedJSHeapSize,total:e.totalJSHeapSize,limit:e.jsHeapSizeLimit}}function se(){M||(M=!0,ee(),ne(),ae())}function le(){M&&(M=!1,te(),ie(),re(),u.length=0,w.length=0)}function de(){if(document.getElementById("xiaobaix-debug-style"))return;const e=document.createElement("style");e.id="xiaobaix-debug-style",e.textContent=`
#xiaobaix-debug-btn {
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
}
#xiaobaix-debug-btn .dbg-light {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #555;
    flex-shrink: 0;
    transition: background 0.2s, box-shadow 0.2s;
}
#xiaobaix-debug-btn .dbg-light.on {
    background: #4ade80;
    box-shadow: 0 0 6px #4ade80;
}
#xiaobaix-debug-mini {
    position: fixed;
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(28, 28, 32, 0.96);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    color: rgba(255,255,255,0.9);
    font-size: 12px;
    cursor: pointer;
    user-select: none;
    touch-action: none;
    box-shadow: 0 4px 14px rgba(0,0,0,0.35);
    transition: box-shadow 0.2s;
}
#xiaobaix-debug-mini:hover {
    box-shadow: 0 6px 18px rgba(0,0,0,0.45);
}
#xiaobaix-debug-mini .badge {
    padding: 2px 6px;
    border-radius: 999px;
    background: rgba(255,80,80,0.18);
    border: 1px solid rgba(255,80,80,0.35);
    color: #fca5a5;
    font-size: 10px;
}
#xiaobaix-debug-mini .badge.hidden { display: none; }
#xiaobaix-debug-mini.flash {
    animation: xbdbg-flash 0.35s ease-in-out 2;
}
@keyframes xbdbg-flash {
    0%,100% { box-shadow: 0 4px 14px rgba(0,0,0,0.35); }
    50% { box-shadow: 0 0 0 4px rgba(255,80,80,0.4); }
}
#xiaobaix-debug-panel {
    position: fixed;
    z-index: 10001;
    background: rgba(22,22,26,0.97);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 10px;
    box-shadow: 0 12px 36px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
@media (min-width: 769px) {
    #xiaobaix-debug-panel {
        resize: both;
        min-width: 320px;
        min-height: 260px;
    }
}
@media (max-width: 768px) {
    #xiaobaix-debug-panel {
        left: 0 !important;
        right: 0 !important;
        top: 0 !important;
        width: 100% !important;
        border-radius: 0;
        resize: none;
    }
}
#xiaobaix-debug-titlebar {
    user-select: none;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background: rgba(30,30,34,0.98);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    flex-shrink: 0;
}
@media (min-width: 769px) {
    #xiaobaix-debug-titlebar { cursor: move; }
}
#xiaobaix-debug-titlebar .left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: rgba(255,255,255,0.88);
}
#xiaobaix-debug-titlebar .right {
    display: flex;
    align-items: center;
    gap: 6px;
}
.xbdbg-btn {
    width: 28px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.85);
    cursor: pointer;
    font-size: 12px;
    transition: background 0.15s;
}
.xbdbg-btn:hover { background: rgba(255,255,255,0.12); }
#xiaobaix-debug-frame {
    flex: 1;
    border: 0;
    width: 100%;
    background: transparent;
}
`,document.head.appendChild(e)}function q(){const e=document.getElementById("nonQRFormItems");return e?e.getBoundingClientRect():{top:window.innerHeight-60,right:window.innerWidth,left:0,width:window.innerWidth}}function ce(){const e=q(),t=90,n=32,i=8;return{left:e.right-t-i,top:e.top-n-i}}function B(){if(!r)return;const e=z(X),t=ce(),n=e||t,i=r.offsetWidth||90,o=r.offsetHeight||32;r.style.left=`${f(n.left,0,window.innerWidth-i)}px`,r.style.top=`${f(n.top,0,window.innerHeight-o)}px`}function ue(){if(!r)return;const e=r.getBoundingClientRect();$(X,{left:Math.round(e.left),top:Math.round(e.top)})}function N(){if(!a)return;if(E()){const m=q();a.style.left="0",a.style.top="0",a.style.width="100%",a.style.height=`${m.top}px`;return}const e=z(W),t=480,n=400,i=e?.width>=320?e.width:t,o=e?.height>=260?e.height:n,l=e?.left!=null?f(e.left,0,window.innerWidth-i):20,d=e?.top!=null?f(e.top,0,window.innerHeight-o):80;a.style.left=`${l}px`,a.style.top=`${d}px`,a.style.width=`${i}px`,a.style.height=`${o}px`}function I(){if(!a||E())return;const e=a.getBoundingClientRect();$(W,{left:Math.round(e.left),top:Math.round(e.top),width:Math.round(e.width),height:Math.round(e.height)})}async function pe(){const{xbLog:e,CacheRegistry:t}=await v(async()=>{const{xbLog:o,CacheRegistry:l}=await import("./debug-core-CagYs3TN.js").then(d=>d.n);return{xbLog:o,CacheRegistry:l}},[],import.meta.url),{EventCenter:n}=await v(async()=>{const{EventCenter:o}=await import("./event-manager-BOxs6lMF.js").then(l=>l.r);return{EventCenter:o}},[],import.meta.url),i=Z();return{logs:e.getAll(),events:n.getEventHistory?.()||[],eventStatsDetail:n.statsDetail?.()||{},caches:t.getStats(),performance:{requests:u.slice(),longTasks:w.slice(),fps:A,memory:oe(),domCount:i.domCount,messageCount:i.messageCount,imageCount:i.imageCount}}}function R(e){try{V(g,{...e},"LittleWhiteBox-DebugHost")}catch{}}async function c(){if(!L)return;const e=await pe();R({type:"XB_DEBUG_DATA",payload:e}),be(e.logs)}async function fe(e){const{xbLog:t,CacheRegistry:n}=await v(async()=>{const{xbLog:o,CacheRegistry:l}=await import("./debug-core-CagYs3TN.js").then(d=>d.n);return{xbLog:o,CacheRegistry:l}},[],import.meta.url),{EventCenter:i}=await v(async()=>{const{EventCenter:o}=await import("./event-manager-BOxs6lMF.js").then(l=>l.r);return{EventCenter:o}},[],import.meta.url);switch(e?.action){case"refresh":await c();break;case"clearLogs":t.clear(),await c();break;case"clearEvents":i.clearHistory?.(),await c();break;case"clearCache":e.moduleId&&n.clear(e.moduleId),await c();break;case"clearAllCaches":n.clearAll(),await c();break;case"clearRequests":u.length=0,await c();break;case"clearTasks":w.length=0,await c();break;case"cacheDetail":R({type:"XB_DEBUG_CACHE_DETAIL",payload:{moduleId:e.moduleId,detail:n.getDetail(e.moduleId)}});break;case"exportLogs":R({type:"XB_DEBUG_EXPORT",payload:{text:t.export()}});break}}function ge(){O||(O=!0,window.addEventListener("message",async e=>{if(!J(e,g,"LittleWhiteBox-DebugFrame"))return;const t=e?.data;t.type==="FRAME_READY"?(L=!0,await c()):t.type==="XB_DEBUG_ACTION"?await fe(t):t.type==="CLOSE_PANEL"&&_()}))}function be(e){if(!r)return;const t=r.querySelector(".badge");if(!t)return;const n=K(e);t.classList.toggle("hidden",n<=0),t.textContent=n>0?String(n):"";const i=Q(e);i>S&&!b&&(r.classList.remove("flash"),r.offsetWidth,r.classList.add("flash")),S=i}function Y(){const e=document.querySelector("#xiaobaix-debug-btn .dbg-light");e&&e.classList.toggle("on",p)}function me(e){if(!(e.button!==void 0&&e.button!==0)){s={startX:e.clientX,startY:e.clientY,startLeft:r.getBoundingClientRect().left,startTop:r.getBoundingClientRect().top,pointerId:e.pointerId,moved:!1};try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}e.preventDefault()}}function he(e){if(!s||s.pointerId!==e.pointerId)return;const t=e.clientX-s.startX,n=e.clientY-s.startY;(Math.abs(t)>3||Math.abs(n)>3)&&(s.moved=!0);const i=r.offsetWidth||90,o=r.offsetHeight||32;r.style.left=`${f(s.startLeft+t,0,window.innerWidth-i)}px`,r.style.top=`${f(s.startTop+n,0,window.innerHeight-o)}px`,e.preventDefault()}function H(e){if(!s||s.pointerId!==e.pointerId)return;const t=s.moved;try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{}s=null,ue(),t||De()}function xe(e){if(!E()&&!(e.button!==void 0&&e.button!==0)&&!e.target?.closest?.(".xbdbg-btn")){s={startX:e.clientX,startY:e.clientY,startLeft:a.getBoundingClientRect().left,startTop:a.getBoundingClientRect().top,pointerId:e.pointerId};try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}e.preventDefault()}}function ye(e){if(!s||E()||s.pointerId!==e.pointerId)return;const t=e.clientX-s.startX,n=e.clientY-s.startY,i=a.offsetWidth,o=a.offsetHeight;a.style.left=`${f(s.startLeft+t,0,window.innerWidth-i)}px`,a.style.top=`${f(s.startTop+n,0,window.innerHeight-o)}px`,e.preventDefault()}function F(e){if(!(!s||E()||s.pointerId!==e.pointerId)){try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{}s=null,I()}}function we(){G(),D=setInterval(async()=>{if(p)try{await c()}catch{}},1500)}function G(){D&&(clearInterval(D),D=null)}function ve(){p&&(b?N():B())}function Ee(){r||(r=document.createElement("div"),r.id="xiaobaix-debug-mini",r.innerHTML='<span>监控</span><span class="badge hidden"></span>',document.body.appendChild(r),B(),r.addEventListener("pointerdown",me,{passive:!1}),r.addEventListener("pointermove",he,{passive:!1}),r.addEventListener("pointerup",H,{passive:!1}),r.addEventListener("pointercancel",H,{passive:!1}))}function Le(){r?.remove(),r=null}function _e(){if(a)return;a=document.createElement("div"),a.id="xiaobaix-debug-panel";const e=document.createElement("div");e.id="xiaobaix-debug-titlebar",e.innerHTML=`
        <div class="left"><span>小白X 监控台</span></div>
        <div class="right">
            <button class="xbdbg-btn" id="xbdbg-min" title="最小化" type="button">—</button>
            <button class="xbdbg-btn" id="xbdbg-close" title="关闭" type="button">×</button>
        </div>
    `,g=document.createElement("iframe"),g.id="xiaobaix-debug-frame",g.src=`${U}/modules/debug-panel/debug-panel.html`,a.appendChild(e),a.appendChild(g),document.body.appendChild(a),N(),e.addEventListener("pointerdown",xe,{passive:!1}),e.addEventListener("pointermove",ye,{passive:!1}),e.addEventListener("pointerup",F,{passive:!1}),e.addEventListener("pointercancel",F,{passive:!1}),a.querySelector("#xbdbg-min")?.addEventListener("click",Me),a.querySelector("#xbdbg-close")?.addEventListener("click",_),E()||(a.addEventListener("mouseup",I),a.addEventListener("mouseleave",I)),L=!1}function Ce(){a?.remove(),a=null,g=null,L=!1}function De(){b||(b=!0,r&&(r.style.display="none"),a?a.style.display="":_e())}function Me(){b&&(b=!1,I(),a&&(a.style.display="none"),r&&(r.style.display="",B()))}async function Ie(){if(p)return;p=!0,de(),ge();const{enableDebugMode:e,enablePersistentDebugLogging:t}=await v(async()=>{const{enableDebugMode:n,enablePersistentDebugLogging:i}=await import("./debug-core-CagYs3TN.js").then(o=>o.n);return{enableDebugMode:n,enablePersistentDebugLogging:i}},[],import.meta.url);t(),e(),se(),Ee(),we(),Y(),P||(P=ve,window.addEventListener("resize",P));try{window.registerModuleCleanup?.("debugPanel",_)}catch{}}async function _(){if(p){p=!1,b=!1,G(),le(),L=!1,S=0;try{const{disableDebugMode:e,disablePersistentDebugLogging:t}=await v(async()=>{const{disableDebugMode:n,disablePersistentDebugLogging:i}=await import("./debug-core-CagYs3TN.js").then(o=>o.n);return{disableDebugMode:n,disablePersistentDebugLogging:i}},[],import.meta.url);e(),t({clear:!0})}catch{}Ce(),Le(),Y()}}async function Pe(){p?await _():await Ie()}typeof window<"u"&&(window.xbDebugPanelToggle=Pe,window.xbDebugPanelClose=_);export{_ as closeDebugPanelExplicit,Ie as openDebugPanelExplicit,Pe as toggleDebugPanel};
