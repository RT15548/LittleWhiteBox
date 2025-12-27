import { extension_settings, getContext } from "../../../../extensions.js";
import { createModuleEvents, event_types } from "../core/event-manager.js";
import { EXT_ID, extensionFolderPath } from "../core/constants.js";
import { xbLog, CacheRegistry } from "../core/debug-core.js";
import { replaceXbGetVarInString } from "./variables/var-commands.js";
import { executeSlashCommand } from "../core/slash-command.js";
import { default_user_avatar, default_avatar } from "../../../../../script.js";

const MODULE_ID = 'iframeRenderer';
const events = createModuleEvents(MODULE_ID);

let isGenerating = false;
const winMap = new Map();
let lastHeights = new WeakMap();
const blobUrls = new WeakMap();
const hashToBlobUrl = new Map();
const hashToBlobBytes = new Map();
const blobLRU = [];
const BLOB_CACHE_LIMIT = 32;
let lastApplyTs = 0;
let pendingHeight = null;
let pendingRec = null;
let hideStyleInjected = false;

CacheRegistry.register(MODULE_ID, {
    name: 'Blob URL 缓存',
    getSize: () => hashToBlobUrl.size,
    getBytes: () => {
        let bytes = 0;
        hashToBlobBytes.forEach(v => { bytes += Number(v) || 0; });
        return bytes;
    },
    clear: () => {
        clearBlobCaches();
        hashToBlobBytes.clear();
    },
    getDetail: () => Array.from(hashToBlobUrl.keys()),
});

function getSettings() {
    return extension_settings[EXT_ID] || {};
}

function ensureHideCodeStyle(enable) {
    const id = 'xiaobaix-hide-code';
    const old = document.getElementById(id);
    if (!enable) {
        old?.remove();
        hideStyleInjected = false;
        return;
    }
    if (old) return;
    const hideCodeStyle = document.createElement('style');
    hideCodeStyle.id = id;
    hideCodeStyle.textContent = `
        .xiaobaix-active .mes_text pre { display: none !important; }
        .xiaobaix-active .mes_text pre.xb-show { display: block !important; }
    `;
    document.head.appendChild(hideCodeStyle);
    hideStyleInjected = true;
}

function setActiveClass(enable) {
    document.body.classList.toggle('xiaobaix-active', !!enable);
}

function djb2(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) + h) ^ str.charCodeAt(i);
    }
    return (h >>> 0).toString(16);
}

function shouldRenderContentByBlock(codeBlock) {
    if (!codeBlock) return false;
    const content = (codeBlock.textContent || '').trim().toLowerCase();
    if (!content) return false;
    return content.includes('<!doctype') || content.includes('<html') || content.includes('<script');
}

function generateUniqueId() {
    return `xiaobaix-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function setIframeBlobHTML(iframe, fullHTML, codeHash) {
    const existing = hashToBlobUrl.get(codeHash);
    if (existing) {
        iframe.src = existing;
        blobUrls.set(iframe, existing);
        return;
    }
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframe.src = url;
    blobUrls.set(iframe, url);
    hashToBlobUrl.set(codeHash, url);
    try { hashToBlobBytes.set(codeHash, blob.size || 0); } catch {}
    blobLRU.push(codeHash);
    while (blobLRU.length > BLOB_CACHE_LIMIT) {
        const old = blobLRU.shift();
        const u = hashToBlobUrl.get(old);
        hashToBlobUrl.delete(old);
        hashToBlobBytes.delete(old);
        try { URL.revokeObjectURL(u); } catch (e) {}
    }
}

function releaseIframeBlob(iframe) {
    try {
        const url = blobUrls.get(iframe);
        if (url) URL.revokeObjectURL(url);
        blobUrls.delete(iframe);
    } catch (e) {}
}

export function clearBlobCaches() {
    try { xbLog.info(MODULE_ID, '清空 Blob 缓存'); } catch {}
    hashToBlobUrl.forEach(u => { try { URL.revokeObjectURL(u); } catch {} });
    hashToBlobUrl.clear();
    hashToBlobBytes.clear();
    blobLRU.length = 0;
}

function buildResourceHints(html) {
    const urls = Array.from(new Set((html.match(/https?:\/\/[^"'()\s]+/gi) || [])
        .map(u => { try { return new URL(u).origin; } catch { return null; } })
        .filter(Boolean)));
    let hints = "";
    const maxHosts = 6;
    for (let i = 0; i < Math.min(urls.length, maxHosts); i++) {
        const origin = urls[i];
        hints += `<link rel="dns-prefetch" href="${origin}">`;
        hints += `<link rel="preconnect" href="${origin}" crossorigin>`;
    }
    let preload = "";
    const font = (html.match(/https?:\/\/[^"'()\s]+\.(?:woff2|woff|ttf|otf)/i) || [])[0];
    if (font) {
        const type = font.endsWith(".woff2") ? "font/woff2" : font.endsWith(".woff") ? "font/woff" : font.endsWith(".ttf") ? "font/ttf" : "font/otf";
        preload += `<link rel="preload" as="font" href="${font}" type="${type}" crossorigin fetchpriority="high">`;
    }
    const css = (html.match(/https?:\/\/[^"'()\s]+\.css/i) || [])[0];
    if (css) {
        preload += `<link rel="preload" as="style" href="${css}" crossorigin fetchpriority="high">`;
    }
    const img = (html.match(/https?:\/\/[^"'()\s]+\.(?:png|jpg|jpeg|webp|gif|svg)/i) || [])[0];
    if (img) {
        preload += `<link rel="preload" as="image" href="${img}" crossorigin fetchpriority="high">`;
    }
    return hints + preload;
}

function iframeClientScript() {
    return `
(function(){
  function measureVisibleHeight(){
    try{
      var doc = document;
      var target = doc.body;
      if(!target) return 0;
  
      var minTop = Infinity, maxBottom = 0;
      var addRect = function(el){
        try{
          var r = el.getBoundingClientRect();
          if(r && r.height > 0){
            if(minTop > r.top) minTop = r.top;
            if(maxBottom < r.bottom) maxBottom = r.bottom;
          }
        }catch(e){}
      };
  
      addRect(target);
      var children = target.children || [];
      for(var i=0;i<children.length;i++){
        var child = children[i];
        if(!child) continue;
        try{
          var s = window.getComputedStyle(child);
          if(s.display === 'none' || s.visibility === 'hidden') continue;
          if(!child.offsetParent && s.position !== 'fixed') continue;
        }catch(e){}
        addRect(child);
      }
  
      return maxBottom > 0 ? Math.ceil(maxBottom - Math.min(minTop, 0)) : (target.scrollHeight || 0);
    }catch(e){
      return (document.body && document.body.scrollHeight) || 0;
    }
  }
  
  function post(m){ try{ parent.postMessage(m,'*') }catch(e){} }

  var rafPending=false, lastH=0;
  var HYSTERESIS = 2;

  function send(force){
    if(rafPending && !force) return;
    rafPending = true;
    requestAnimationFrame(function(){
      rafPending = false;
      var h = measureVisibleHeight();
      if(force || Math.abs(h - lastH) >= HYSTERESIS){
        lastH = h;
        post({height:h, force:!!force});
      }
    });
  }

  try{ send(true) }catch(e){}
  document.addEventListener('DOMContentLoaded', function(){ send(true) }, {once:true});
  window.addEventListener('load', function(){ send(true) }, {once:true});

  try{
    if(document.fonts){
      document.fonts.ready.then(function(){ send(true) }).catch(function(){});
      if(document.fonts.addEventListener){
        document.fonts.addEventListener('loadingdone', function(){ send(true) });
        document.fonts.addEventListener('loadingerror', function(){ send(true) });
      }
    }
  }catch(e){}

  ['transitionend','animationend'].forEach(function(evt){
    document.addEventListener(evt, function(){ send(false) }, {passive:true, capture:true});
  });

  try{
    var root = document.body || document.documentElement;
    var ro = new ResizeObserver(function(){ send(false) });
    ro.observe(root);
  }catch(e){
    try{
      var rootMO = document.body || document.documentElement;
      new MutationObserver(function(){ send(false) })
        .observe(rootMO, {childList:true, subtree:true, attributes:true, characterData:true});
    }catch(e){}
    window.addEventListener('resize', function(){ send(false) }, {passive:true});
  }

  window.addEventListener('message', function(e){
    var d = e && e.data || {};
    if(d && d.type === 'probe') setTimeout(function(){ send(true) }, 10);
  });

  window.STscript = function(command){
    return new Promise(function(resolve,reject){
      try{
        if(!command){ reject(new Error('empty')); return }
        if(command[0] !== '/') command = '/' + command;
        var id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        function onMessage(e){
          var d = e && e.data || {};
          if(d.source !== 'xiaobaix-host') return;
          if((d.type === 'commandResult' || d.type === 'commandError') && d.id === id){
            try{ window.removeEventListener('message', onMessage) }catch(e){}
            if(d.type === 'commandResult') resolve(d.result);
            else reject(new Error(d.error || 'error'));
          }
        }
        try{ window.addEventListener('message', onMessage) }catch(e){}
        post({type:'runCommand', id, command});
        setTimeout(function(){
          try{ window.removeEventListener('message', onMessage) }catch(e){}
          reject(new Error('Command timeout'))
        }, 180000);
      }catch(e){ reject(e) }
    })
  };
  try{ if(typeof window['stscript'] !== 'function') window['stscript'] = window.STscript }catch(e){}
})();`;
}

function buildWrappedHtml(html) {
    const settings = getSettings();
    const api = `<script>${iframeClientScript()}</script>`;
    const wrapperToggle = settings.wrapperIframe ?? true;
    const origin = typeof location !== 'undefined' && location.origin ? location.origin : '';
    const optWrapperUrl = `${origin}/scripts/extensions/third-party/${EXT_ID}/bridges/wrapper-iframe.js`;
    const optWrapper = wrapperToggle ? `<script src="${optWrapperUrl}"></script>` : "";
    const baseTag = settings.useBlob ? `<base href="${origin}/">` : "";
    const headHints = buildResourceHints(html);
    const vhFix = `<style>html,body{height:auto!important;min-height:0!important;max-height:none!important}.profile-container,[style*="100vh"]{height:auto!important;min-height:600px!important}[style*="height:100%"]{height:auto!important;min-height:100%!important}</style>`;
    
    if (html.includes('<html') && html.includes('</html')) {
        if (html.includes('<head>')) 
            return html.replace('<head>', `<head>${baseTag}${api}${optWrapper}${headHints}${vhFix}`);
        if (html.includes('</head>')) 
            return html.replace('</head>', `${baseTag}${api}${optWrapper}${headHints}${vhFix}</head>`);
        return html.replace('<body', `<head>${baseTag}${api}${optWrapper}${headHints}${vhFix}</head><body`);
    }
    
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${baseTag}
${api}
${optWrapper}
${headHints}
${vhFix}
<style>
  html, body { margin: 0; padding: 0; background: transparent; }
</style>
</head>
<body>${html}</body></html>`;
}

function getOrCreateWrapper(preEl) {
    let wrapper = preEl.previousElementSibling;
    if (!wrapper || !wrapper.classList.contains('xiaobaix-iframe-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'xiaobaix-iframe-wrapper';
        wrapper.style.cssText = 'margin:0;';
        preEl.parentNode.insertBefore(wrapper, preEl);
    }
    return wrapper;
}

function registerIframeMapping(iframe, wrapper) {
    const tryMap = () => {
        try {
            if (iframe && iframe.contentWindow) {
                winMap.set(iframe.contentWindow, { iframe, wrapper });
                return true;
            }
        } catch (e) {}
        return false;
    };
    if (tryMap()) return;
    let tries = 0;
    const t = setInterval(() => {
        tries++;
        if (tryMap() || tries > 20) clearInterval(t);
    }, 25);
}

function resolveAvatarUrls() {
    const origin = typeof location !== 'undefined' && location.origin ? location.origin : '';
    const toAbsUrl = (relOrUrl) => {
        if (!relOrUrl) return '';
        const s = String(relOrUrl);
        if (/^(data:|blob:|https?:)/i.test(s)) return s;
        if (s.startsWith('User Avatars/')) {
            return `${origin}/${s}`;
        }
        const encoded = s.split('/').map(seg => encodeURIComponent(seg)).join('/');
        return `${origin}/${encoded.replace(/^\/+/, '')}`;
    };
    const pickSrc = (selectors) => {
        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) {
                const highRes = el.getAttribute('data-izoomify-url');
                if (highRes) return highRes;
                if (el.src) return el.src;
            }
        }
        return '';
    };
    let user = pickSrc([
        '#user_avatar_block img',
        '#avatar_user img',
        '.user_avatar img',
        'img#avatar_user',
        '.st-user-avatar img'
    ]) || default_user_avatar;
    const m = String(user).match(/\/thumbnail\?type=persona&file=([^&]+)/i);
    if (m) {
        user = `User Avatars/${decodeURIComponent(m[1])}`;
    }
    const ctx = getContext?.() || {};
    const chId = ctx.characterId ?? ctx.this_chid;
    const ch = Array.isArray(ctx.characters) ? ctx.characters[chId] : null;
    let char = ch?.avatar || default_avatar;
    if (char && !/^(data:|blob:|https?:)/i.test(char)) {
        char = /[\/]/.test(char) ? char.replace(/^\/+/, '') : `characters/${char}`;
    }
    return { user: toAbsUrl(user), char: toAbsUrl(char) };
}

function handleIframeMessage(event) {
    const data = event.data || {};
    let rec = winMap.get(event.source);
    
    if (!rec || !rec.iframe) {
        const iframes = document.querySelectorAll('iframe.xiaobaix-iframe');
        for (const iframe of iframes) {
            if (iframe.contentWindow === event.source) {
                rec = { iframe, wrapper: iframe.parentElement };
                winMap.set(event.source, rec);
                break;
            }
        }
    }
    
    if (rec && rec.iframe && typeof data.height === 'number') {
        const next = Math.max(0, Number(data.height) || 0);
        if (next < 1) return;
        const prev = lastHeights.get(rec.iframe) || 0;
        if (!data.force && Math.abs(next - prev) < 1) return;
        if (data.force) {
            lastHeights.set(rec.iframe, next);
            requestAnimationFrame(() => { rec.iframe.style.height = `${next}px`; });
            return;
        }
        pendingHeight = next;
        pendingRec = rec;
        const now = performance.now();
        const dt = now - lastApplyTs;
        if (dt >= 50) {
            lastApplyTs = now;
            const h = pendingHeight, r = pendingRec;
            pendingHeight = null;
            pendingRec = null;
            lastHeights.set(r.iframe, h);
            requestAnimationFrame(() => { r.iframe.style.height = `${h}px`; });
        } else {
            setTimeout(() => {
                if (pendingRec && pendingHeight != null) {
                    lastApplyTs = performance.now();
                    const h = pendingHeight, r = pendingRec;
                    pendingHeight = null;
                    pendingRec = null;
                    lastHeights.set(r.iframe, h);
                    requestAnimationFrame(() => { r.iframe.style.height = `${h}px`; });
                }
            }, Math.max(0, 50 - dt));
        }
        return;
    }
    
    if (data && data.type === 'runCommand') {
        executeSlashCommand(data.command)
            .then(result => event.source.postMessage({
                source: 'xiaobaix-host',
                type: 'commandResult',
                id: data.id,
                result
            }, '*'))
            .catch(err => event.source.postMessage({
                source: 'xiaobaix-host',
                type: 'commandError',
                id: data.id,
                error: err.message || String(err)
            }, '*'));
        return;
    }
    
    if (data && data.type === 'getAvatars') {
        try {
            const urls = resolveAvatarUrls();
            event.source?.postMessage({ source: 'xiaobaix-host', type: 'avatars', urls }, '*');
        } catch (e) {
            event.source?.postMessage({ source: 'xiaobaix-host', type: 'avatars', urls: { user: '', char: '' } }, '*');
        }
        return;
    }
}

export function renderHtmlInIframe(htmlContent, container, preElement) {
    const settings = getSettings();
    try {
        const originalHash = djb2(htmlContent);
        
        if (settings.variablesCore?.enabled && typeof replaceXbGetVarInString === 'function') {
            try {
                htmlContent = replaceXbGetVarInString(htmlContent);
            } catch (e) {
                console.warn('xbgetvar 宏替换失败:', e);
            }
        }
        
        const iframe = document.createElement('iframe');
        iframe.id = generateUniqueId();
        iframe.className = 'xiaobaix-iframe';
        iframe.style.cssText = 'width:100%;border:none;background:transparent;overflow:hidden;height:0;margin:0;padding:0;display:block;contain:layout paint style;will-change:height;min-height:50px';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('scrolling', 'no');
        iframe.loading = 'eager';
        
        if (settings.sandboxMode) {
            iframe.setAttribute('sandbox', 'allow-scripts');
        }
        
        const wrapper = getOrCreateWrapper(preElement);
        wrapper.querySelectorAll('.xiaobaix-iframe').forEach(old => {
            try { old.src = 'about:blank'; } catch (e) {}
            releaseIframeBlob(old);
            old.remove();
        });
        
        const codeHash = djb2(htmlContent);
        const full = buildWrappedHtml(htmlContent);
        
        if (settings.useBlob) {
            setIframeBlobHTML(iframe, full, codeHash);
        } else {
            iframe.srcdoc = full;
        }
        
        wrapper.appendChild(iframe);
        preElement.classList.remove('xb-show');
        preElement.style.display = 'none';
        registerIframeMapping(iframe, wrapper);
        
        try { iframe.contentWindow?.postMessage({ type: 'probe' }, '*'); } catch (e) {}
        preElement.dataset.xbFinal = 'true';
        preElement.dataset.xbHash = originalHash;
        
        return iframe;
    } catch (err) {
        console.error('[iframeRenderer] 渲染失败:', err);
        return null;
    }
}

export function processCodeBlocks(messageElement, forceFinal = true) {
    const settings = getSettings();
    if (!settings.enabled) return;
    if (settings.renderEnabled === false) return;
    
    try {
        const codeBlocks = messageElement.querySelectorAll('pre > code');
        const ctx = getContext();
        const lastId = ctx.chat?.length - 1;
        const mesEl = messageElement.closest('.mes');
        const mesId = mesEl ? Number(mesEl.getAttribute('mesid')) : null;
        
        if (isGenerating && mesId === lastId && !forceFinal) return;
        
        codeBlocks.forEach(codeBlock => {
            const preElement = codeBlock.parentElement;
            const should = shouldRenderContentByBlock(codeBlock);
            const html = codeBlock.textContent || '';
            const hash = djb2(html);
            const isFinal = preElement.dataset.xbFinal === 'true';
            const same = preElement.dataset.xbHash === hash;
            
            if (isFinal && same) return;
            
            if (should) {
                renderHtmlInIframe(html, preElement.parentNode, preElement);
            } else {
                preElement.classList.add('xb-show');
                preElement.removeAttribute('data-xbfinal');
                preElement.removeAttribute('data-xbhash');
                preElement.style.display = '';
            }
            preElement.dataset.xiaobaixBound = 'true';
        });
    } catch (err) {
        console.error('[iframeRenderer] processCodeBlocks 失败:', err);
    }
}

export function processExistingMessages() {
    const settings = getSettings();
    if (!settings.enabled) return;
    document.querySelectorAll('.mes_text').forEach(el => processCodeBlocks(el, true));
    try { shrinkRenderedWindowFull(); } catch (e) {}
}

export function processMessageById(messageId, forceFinal = true) {
    const messageElement = document.querySelector(`div.mes[mesid="${messageId}"] .mes_text`);
    if (!messageElement) return;
    processCodeBlocks(messageElement, forceFinal);
    try { shrinkRenderedWindowForLastMessage(); } catch (e) {}
}

export function invalidateMessage(messageId) {
    const el = document.querySelector(`div.mes[mesid="${messageId}"] .mes_text`);
    if (!el) return;
    el.querySelectorAll('.xiaobaix-iframe-wrapper').forEach(w => {
        w.querySelectorAll('.xiaobaix-iframe').forEach(ifr => {
            try { ifr.src = 'about:blank'; } catch (e) {}
            releaseIframeBlob(ifr);
        });
        w.remove();
    });
    el.querySelectorAll('pre').forEach(pre => {
        pre.classList.remove('xb-show');
        pre.removeAttribute('data-xbfinal');
        pre.removeAttribute('data-xbhash');
        delete pre.dataset.xbFinal;
        delete pre.dataset.xbHash;
        pre.style.display = '';
        delete pre.dataset.xiaobaixBound;
    });
}

export function invalidateAll() {
    document.querySelectorAll('.xiaobaix-iframe-wrapper').forEach(w => {
        w.querySelectorAll('.xiaobaix-iframe').forEach(ifr => {
            try { ifr.src = 'about:blank'; } catch (e) {}
            releaseIframeBlob(ifr);
        });
        w.remove();
    });
    document.querySelectorAll('.mes_text pre').forEach(pre => {
        pre.classList.remove('xb-show');
        pre.removeAttribute('data-xbfinal');
        pre.removeAttribute('data-xbhash');
        delete pre.dataset.xbFinal;
        delete pre.dataset.xbHash;
        delete pre.dataset.xiaobaixBound;
        pre.style.display = '';
    });
    clearBlobCaches();
    winMap.clear();
    lastHeights = new WeakMap();
}

function shrinkRenderedWindowForLastMessage() {
    const settings = getSettings();
    if (!settings.enabled) return;
    if (settings.renderEnabled === false) return;
    const max = Number.isFinite(settings.maxRenderedMessages) && settings.maxRenderedMessages > 0
        ? settings.maxRenderedMessages
        : 0;
    if (max <= 0) return;
    const ctx = getContext?.();
    const chatArr = ctx?.chat;
    if (!Array.isArray(chatArr) || chatArr.length === 0) return;
    const lastId = chatArr.length - 1;
    if (lastId < 0) return;
    const keepFrom = Math.max(0, lastId - max + 1);
    const mesList = document.querySelectorAll('div.mes');
    for (const mes of mesList) {
        const mesIdAttr = mes.getAttribute('mesid');
        if (mesIdAttr == null) continue;
        const mesId = Number(mesIdAttr);
        if (!Number.isFinite(mesId)) continue;
        if (mesId >= keepFrom) break;
        const mesText = mes.querySelector('.mes_text');
        if (!mesText) continue;
        mesText.querySelectorAll('.xiaobaix-iframe-wrapper').forEach(w => {
            w.querySelectorAll('.xiaobaix-iframe').forEach(ifr => {
                try { ifr.src = 'about:blank'; } catch (e) {}
                releaseIframeBlob(ifr);
            });
            w.remove();
        });
        mesText.querySelectorAll('pre[data-xiaobaix-bound="true"]').forEach(pre => {
            pre.classList.remove('xb-show');
            pre.removeAttribute('data-xbfinal');
            pre.removeAttribute('data-xbhash');
            delete pre.dataset.xbFinal;
            delete pre.dataset.xbHash;
            delete pre.dataset.xiaobaixBound;
            pre.style.display = '';
        });
    }
}

function shrinkRenderedWindowFull() {
    const settings = getSettings();
    if (!settings.enabled) return;
    if (settings.renderEnabled === false) return;
    const max = Number.isFinite(settings.maxRenderedMessages) && settings.maxRenderedMessages > 0
        ? settings.maxRenderedMessages
        : 0;
    if (max <= 0) return;
    const ctx = getContext?.();
    const chatArr = ctx?.chat;
    if (!Array.isArray(chatArr) || chatArr.length === 0) return;
    const lastId = chatArr.length - 1;
    const keepFrom = Math.max(0, lastId - max + 1);
    const mesList = document.querySelectorAll('div.mes');
    for (const mes of mesList) {
        const mesIdAttr = mes.getAttribute('mesid');
        if (mesIdAttr == null) continue;
        const mesId = Number(mesIdAttr);
        if (!Number.isFinite(mesId)) continue;
        if (mesId >= keepFrom) continue;
        const mesText = mes.querySelector('.mes_text');
        if (!mesText) continue;
        mesText.querySelectorAll('.xiaobaix-iframe-wrapper').forEach(w => {
            w.querySelectorAll('.xiaobaix-iframe').forEach(ifr => {
                try { ifr.src = 'about:blank'; } catch (e) {}
                releaseIframeBlob(ifr);
            });
            w.remove();
        });
        mesText.querySelectorAll('pre[data-xiaobaix-bound="true"]').forEach(pre => {
            pre.classList.remove('xb-show');
            pre.removeAttribute('data-xbfinal');
            pre.removeAttribute('data-xbhash');
            delete pre.dataset.xbFinal;
            delete pre.dataset.xbHash;
            delete pre.dataset.xiaobaixBound;
            pre.style.display = '';
        });
    }
}

let messageListenerBound = false;

export function initRenderer() {
    const settings = getSettings();
    if (!settings.enabled) return;
    
    try { xbLog.info(MODULE_ID, 'initRenderer'); } catch {}
    
    if (settings.renderEnabled !== false) {
        ensureHideCodeStyle(true);
        setActiveClass(true);
    }
    
    events.on(event_types.GENERATION_STARTED, () => {
        isGenerating = true;
    });
    
    events.on(event_types.GENERATION_ENDED, () => {
        isGenerating = false;
        const ctx = getContext();
        const lastId = ctx.chat?.length - 1;
        if (lastId != null && lastId >= 0) {
            setTimeout(() => {
                processMessageById(lastId, true);
            }, 60);
        }
    });
    
    events.on(event_types.MESSAGE_RECEIVED, (data) => {
        setTimeout(() => {
            const messageId = typeof data === 'object' ? data.messageId : data;
            if (messageId != null) {
                processMessageById(messageId, true);
            }
        }, 300);
    });
    
    events.on(event_types.MESSAGE_UPDATED, (data) => {
        const messageId = typeof data === 'object' ? data.messageId : data;
        if (messageId != null) {
            processMessageById(messageId, true);
        }
    });
    
    events.on(event_types.MESSAGE_EDITED, (data) => {
        const messageId = typeof data === 'object' ? data.messageId : data;
        if (messageId != null) {
            processMessageById(messageId, true);
        }
    });
    
    events.on(event_types.MESSAGE_DELETED, (data) => {
        const messageId = typeof data === 'object' ? data.messageId : data;
        if (messageId != null) {
            invalidateMessage(messageId);
        }
    });
    
    events.on(event_types.MESSAGE_SWIPED, (data) => {
        setTimeout(() => {
            const messageId = typeof data === 'object' ? data.messageId : data;
            if (messageId != null) {
                processMessageById(messageId, true);
            }
        }, 10);
    });
    
    events.on(event_types.USER_MESSAGE_RENDERED, (data) => {
        setTimeout(() => {
            const messageId = typeof data === 'object' ? data.messageId : data;
            if (messageId != null) {
                processMessageById(messageId, true);
            }
        }, 10);
    });
    
    events.on(event_types.CHARACTER_MESSAGE_RENDERED, (data) => {
        setTimeout(() => {
            const messageId = typeof data === 'object' ? data.messageId : data;
            if (messageId != null) {
                processMessageById(messageId, true);
            }
        }, 10);
    });
    
    events.on(event_types.CHAT_CHANGED, () => {
        isGenerating = false;
        invalidateAll();
        setTimeout(() => {
            processExistingMessages();
        }, 100);
    });
    
    if (!messageListenerBound) {
        window.addEventListener('message', handleIframeMessage);
        messageListenerBound = true;
    }
    
    setTimeout(processExistingMessages, 100);
}

export function cleanupRenderer() {
    try { xbLog.info(MODULE_ID, 'cleanupRenderer'); } catch {}
    events.cleanup();
    if (messageListenerBound) {
        window.removeEventListener('message', handleIframeMessage);
        messageListenerBound = false;
    }
    
    ensureHideCodeStyle(false);
    setActiveClass(false);
    
    document.querySelectorAll('pre[data-xiaobaix-bound="true"]').forEach(pre => {
        pre.classList.remove('xb-show');
        pre.removeAttribute('data-xbfinal');
        pre.removeAttribute('data-xbhash');
        delete pre.dataset.xbFinal;
        delete pre.dataset.xbHash;
        pre.style.display = '';
        delete pre.dataset.xiaobaixBound;
    });
    
    invalidateAll();
    isGenerating = false;
    pendingHeight = null;
    pendingRec = null;
    lastApplyTs = 0;
}

export function isCurrentlyGenerating() {
    return isGenerating;
}

export { shrinkRenderedWindowFull, shrinkRenderedWindowForLastMessage };
