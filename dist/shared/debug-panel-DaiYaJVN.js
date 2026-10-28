import{t as v}from"./preload-helper-CBBx94LT.js";import{r as J}from"./constants-RJ4jNr01.js";import{n as V,t as R}from"./async-errors-C4kfchr9.js";import{a as j,o as K}from"./js-yaml-EJVjtdzw.js";var Q=R(_,{source:import.meta.url,operation:"closeDebugPanel"}),X="xiaobaix_debug_panel_pos_v2",z="xiaobaix_debug_panel_minipos_v2",p=!1,b=!1,o=null,a=null,f=null,s=null,T=null,k=0,L=!1,H=!1,P=null,C=!1,h=null,x=null,w=null,I=0,D=0,O=0,d=[],y=[],S=50,Z=500,g=(e,t,n)=>Math.max(t,Math.min(n,e)),E=()=>window.innerWidth<=768,ee=e=>(e||[]).filter(t=>t?.level==="error").length,te=e=>(e||[]).reduce((t,n)=>Math.max(t,Number(n?.id)||0),0);function $(e){try{const t=localStorage.getItem(e);return t?JSON.parse(t):null}catch{return null}}function q(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch(n){console.warn({source:import.meta.url,operation:"writeJSON"},n)}}function ne(){try{return{domCount:document.querySelectorAll("*").length,messageCount:document.querySelectorAll(".mes").length,imageCount:document.querySelectorAll("img").length}}catch{return{domCount:0,messageCount:0,imageCount:0}}}function re(){h||(h=window.fetch,window.fetch=async function(e,t){const n=typeof e=="string"?e:e?.url||"",r=t?.method||"GET",i=performance.now(),l=Date.now();try{const c=await h.apply(this,arguments),m=performance.now()-i;return n.includes("/api/")&&m>=Z&&(d.push({url:n,method:r,duration:Math.round(m),timestamp:l,status:c.status}),d.length>S&&d.shift()),c}catch(c){const m=performance.now()-i;throw d.push({url:n,method:r,duration:Math.round(m),timestamp:l,status:"error"}),d.length>S&&d.shift(),c}})}function oe(){h&&(window.fetch=h,h=null)}function ae(){if(!x)try{if(typeof PerformanceObserver>"u")return;x=new PerformanceObserver(e=>{for(const t of e.getEntries())if(t.duration>=200){let n="主页面";try{const r=t.attribution?.[0];if(r)if(r.containerType==="iframe"){if(n="iframe",r.containerSrc){const i=new URL(r.containerSrc,location.href);n+=`: ${i.pathname.split("/").pop()||i.pathname}`}}else r.containerName&&(n=r.containerName)}catch(r){console.warn({source:import.meta.url,operation:"startLongTaskObserver"},r)}y.push({duration:Math.round(t.duration),timestamp:Date.now(),source:n}),y.length>S&&y.shift()}}),x.observe({entryTypes:["longtask"]})}catch(e){console.warn({source:import.meta.url,operation:"startLongTaskObserver"},e)}}function ie(){if(x){try{x.disconnect()}catch(e){console.warn({source:import.meta.url,operation:"stopLongTaskObserver"},e)}x=null}}function se(){if(w)return;I=performance.now(),D=0;const e=t=>{D++,t-I>=1e3&&(O=D,D=0,I=t),w=requestAnimationFrame(e)};w=requestAnimationFrame(e)}function le(){w&&(cancelAnimationFrame(w),w=null),O=0}function ce(){if(typeof performance>"u"||!performance.memory)return null;const e=performance.memory;return{used:e.usedJSHeapSize,total:e.totalJSHeapSize,limit:e.jsHeapSizeLimit}}function ue(){C||(C=!0,re(),ae(),se())}function de(){C&&(C=!1,oe(),ie(),le(),d.length=0,y.length=0)}function pe(){if(document.getElementById("xiaobaix-debug-style"))return;const e=document.createElement("style");e.id="xiaobaix-debug-style",e.textContent=`
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
`,document.head.appendChild(e)}function N(){const e=document.getElementById("nonQRFormItems");return e?e.getBoundingClientRect():{top:window.innerHeight-60,right:window.innerWidth,left:0,width:window.innerWidth}}function ge(){const e=N(),t=90,n=32,r=8;return{left:e.right-t-r,top:e.top-n-r}}function B(){if(!a)return;const e=$(z),t=ge(),n=e||t,r=a.offsetWidth||90,i=a.offsetHeight||32;a.style.left=`${g(n.left,0,window.innerWidth-r)}px`,a.style.top=`${g(n.top,0,window.innerHeight-i)}px`}function fe(){if(!a)return;const e=a.getBoundingClientRect();q(z,{left:Math.round(e.left),top:Math.round(e.top)})}function Y(){if(!o)return;if(E()){const m=N();o.style.left="0",o.style.top="0",o.style.width="100%",o.style.height=`${m.top}px`;return}const e=$(X),t=480,n=400,r=e?.width>=320?e.width:t,i=e?.height>=260?e.height:n,l=e?.left!=null?g(e.left,0,window.innerWidth-r):20,c=e?.top!=null?g(e.top,0,window.innerHeight-i):80;o.style.left=`${l}px`,o.style.top=`${c}px`,o.style.width=`${r}px`,o.style.height=`${i}px`}function M(){if(!o||E())return;const e=o.getBoundingClientRect();q(X,{left:Math.round(e.left),top:Math.round(e.top),width:Math.round(e.width),height:Math.round(e.height)})}async function be(){const{xbLog:e,CacheRegistry:t}=await v(async()=>{const{xbLog:i,CacheRegistry:l}=await import("./debug-core-Jj2ULU3i.js").then(c=>c.n);return{xbLog:i,CacheRegistry:l}},[],import.meta.url),{EventCenter:n}=await v(async()=>{const{EventCenter:i}=await import("./event-manager-Dya5I6Up.js").then(l=>l.r);return{EventCenter:i}},[],import.meta.url),r=ne();return{logs:e.getAll(),events:n.getEventHistory?.()||[],eventStatsDetail:n.statsDetail?.()||{},caches:t.getStats(),performance:{requests:d.slice(),longTasks:y.slice(),fps:O,memory:ce(),domCount:r.domCount,messageCount:r.messageCount,imageCount:r.imageCount}}}function A(e){try{K(f,{...e},"LittleWhiteBox-DebugHost")}catch(t){console.warn({source:import.meta.url,operation:"postToFrame"},t)}}async function u(){if(!L)return;const e=await be();A({type:"XB_DEBUG_DATA",payload:e}),xe(e.logs)}async function me(e){const{xbLog:t,CacheRegistry:n}=await v(async()=>{const{xbLog:i,CacheRegistry:l}=await import("./debug-core-Jj2ULU3i.js").then(c=>c.n);return{xbLog:i,CacheRegistry:l}},[],import.meta.url),{EventCenter:r}=await v(async()=>{const{EventCenter:i}=await import("./event-manager-Dya5I6Up.js").then(l=>l.r);return{EventCenter:i}},[],import.meta.url);switch(e?.action){case"refresh":await u();break;case"clearLogs":t.clear(),await u();break;case"clearEvents":r.clearHistory?.(),await u();break;case"clearCache":e.moduleId&&n.clear(e.moduleId),await u();break;case"clearAllCaches":n.clearAll(),await u();break;case"clearRequests":d.length=0,await u();break;case"clearTasks":y.length=0,await u();break;case"cacheDetail":A({type:"XB_DEBUG_CACHE_DETAIL",payload:{moduleId:e.moduleId,detail:n.getDetail(e.moduleId)}});break;case"exportLogs":A({type:"XB_DEBUG_EXPORT",payload:{text:t.export()}});break}}function he(){H||(H=!0,window.addEventListener("message",R(async e=>{if(!j(e,f,"LittleWhiteBox-DebugFrame"))return;const t=e?.data;t.type==="FRAME_READY"?(L=!0,await u()):t.type==="XB_DEBUG_ACTION"?await me(t):t.type==="CLOSE_PANEL"&&V(_(),{source:import.meta.url,operation:"bindMessageListener"})},{source:import.meta.url,operation:"callback"})))}function xe(e){if(!a)return;const t=a.querySelector(".badge");if(!t)return;const n=ee(e);t.classList.toggle("hidden",n<=0),t.textContent=n>0?String(n):"";const r=te(e);r>k&&!b&&(a.classList.remove("flash"),a.offsetWidth,a.classList.add("flash")),k=r}function U(){const e=document.querySelector("#xiaobaix-debug-btn .dbg-light");e&&e.classList.toggle("on",p)}function we(e){if(!(e.button!==void 0&&e.button!==0)){s={startX:e.clientX,startY:e.clientY,startLeft:a.getBoundingClientRect().left,startTop:a.getBoundingClientRect().top,pointerId:e.pointerId,moved:!1};try{e.currentTarget.setPointerCapture(e.pointerId)}catch(t){console.warn({source:import.meta.url,operation:"onMiniDown"},t)}e.preventDefault()}}function ye(e){if(!s||s.pointerId!==e.pointerId)return;const t=e.clientX-s.startX,n=e.clientY-s.startY;(Math.abs(t)>3||Math.abs(n)>3)&&(s.moved=!0);const r=a.offsetWidth||90,i=a.offsetHeight||32;a.style.left=`${g(s.startLeft+t,0,window.innerWidth-r)}px`,a.style.top=`${g(s.startTop+n,0,window.innerHeight-i)}px`,e.preventDefault()}function F(e){if(!s||s.pointerId!==e.pointerId)return;const t=s.moved;try{e.currentTarget.releasePointerCapture(e.pointerId)}catch(n){console.warn({source:import.meta.url,operation:"onMiniUp"},n)}s=null,fe(),t||Pe()}function ve(e){if(!E()&&!(e.button!==void 0&&e.button!==0)&&!e.target?.closest?.(".xbdbg-btn")){s={startX:e.clientX,startY:e.clientY,startLeft:o.getBoundingClientRect().left,startTop:o.getBoundingClientRect().top,pointerId:e.pointerId};try{e.currentTarget.setPointerCapture(e.pointerId)}catch(t){console.warn({source:import.meta.url,operation:"onTitleDown"},t)}e.preventDefault()}}function Ee(e){if(!s||E()||s.pointerId!==e.pointerId)return;const t=e.clientX-s.startX,n=e.clientY-s.startY,r=o.offsetWidth,i=o.offsetHeight;o.style.left=`${g(s.startLeft+t,0,window.innerWidth-r)}px`,o.style.top=`${g(s.startTop+n,0,window.innerHeight-i)}px`,e.preventDefault()}function W(e){if(!(!s||E()||s.pointerId!==e.pointerId)){try{e.currentTarget.releasePointerCapture(e.pointerId)}catch(t){console.warn({source:import.meta.url,operation:"onTitleUp"},t)}s=null,M()}}function Le(){G(),T=setInterval(R(async()=>{if(p)try{await u()}catch(e){console.warn({source:import.meta.url,operation:"startPoll"},e)}},{source:import.meta.url,operation:"callback"}),1500)}function G(){T&&(clearInterval(T),T=null)}function _e(){p&&(b?Y():B())}function De(){a||(a=document.createElement("div"),a.id="xiaobaix-debug-mini",a.innerHTML='<span>监控</span><span class="badge hidden"></span>',document.body.appendChild(a),B(),a.addEventListener("pointerdown",we,{passive:!1}),a.addEventListener("pointermove",ye,{passive:!1}),a.addEventListener("pointerup",F,{passive:!1}),a.addEventListener("pointercancel",F,{passive:!1}))}function Te(){a?.remove(),a=null}function Ce(){if(o)return;o=document.createElement("div"),o.id="xiaobaix-debug-panel";const e=document.createElement("div");e.id="xiaobaix-debug-titlebar",e.innerHTML=`
        <div class="left"><span>小白X 监控台</span></div>
        <div class="right">
            <button class="xbdbg-btn" id="xbdbg-min" title="最小化" type="button">—</button>
            <button class="xbdbg-btn" id="xbdbg-close" title="关闭" type="button">×</button>
        </div>
    `,f=document.createElement("iframe"),f.id="xiaobaix-debug-frame",f.src=`${J}/modules/debug-panel/debug-panel.html`,o.appendChild(e),o.appendChild(f),document.body.appendChild(o),Y(),e.addEventListener("pointerdown",ve,{passive:!1}),e.addEventListener("pointermove",Ee,{passive:!1}),e.addEventListener("pointerup",W,{passive:!1}),e.addEventListener("pointercancel",W,{passive:!1}),o.querySelector("#xbdbg-min")?.addEventListener("click",Ie),o.querySelector("#xbdbg-close")?.addEventListener("click",Q),E()||(o.addEventListener("mouseup",M),o.addEventListener("mouseleave",M)),L=!1}function Me(){o?.remove(),o=null,f=null,L=!1}function Pe(){b||(b=!0,a&&(a.style.display="none"),o?o.style.display="":Ce())}function Ie(){b&&(b=!1,M(),o&&(o.style.display="none"),a&&(a.style.display="",B()))}async function ke(){if(p)return;p=!0,pe(),he();const{enableDebugMode:e,enablePersistentDebugLogging:t}=await v(async()=>{const{enableDebugMode:n,enablePersistentDebugLogging:r}=await import("./debug-core-Jj2ULU3i.js").then(i=>i.n);return{enableDebugMode:n,enablePersistentDebugLogging:r}},[],import.meta.url);t(),e(),ue(),De(),Le(),U(),P||(P=_e,window.addEventListener("resize",P));try{window.registerModuleCleanup?.("debugPanel",_)}catch(n){console.warn({source:import.meta.url,operation:"openDebugPanel"},n)}}async function _(){if(p){p=!1,b=!1,G(),de(),L=!1,k=0;try{const{disableDebugMode:e,disablePersistentDebugLogging:t}=await v(async()=>{const{disableDebugMode:n,disablePersistentDebugLogging:r}=await import("./debug-core-Jj2ULU3i.js").then(i=>i.n);return{disableDebugMode:n,disablePersistentDebugLogging:r}},[],import.meta.url);e(),t({clear:!0})}catch(e){console.warn({source:import.meta.url,operation:"closeDebugPanel"},e)}Me(),Te(),U()}}async function Se(){p?await _():await ke()}typeof window<"u"&&(window.xbDebugPanelToggle=Se,window.xbDebugPanelClose=_);export{_ as closeDebugPanelExplicit,ke as openDebugPanelExplicit,Se as toggleDebugPanel};
