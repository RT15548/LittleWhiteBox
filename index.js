import { extension_settings, getContext } from "../../../extensions.js";
import { saveSettingsDebounced, eventSource, event_types, getRequestHeaders } from "../../../../script.js";
import { getUserAvatar } from '../../../personas.js';
import { default_user_avatar, default_avatar } from '../../../../script.js';
import { initTasks } from "./scheduledTasks.js";
import { initScriptAssistant } from "./scriptAssistant.js";
import { initMessagePreview, addHistoryButtonsDebounced } from "./message-preview.js";
import { initImmersiveMode } from "./immersive-mode.js";
import { initTemplateEditor, templateSettings } from "./template-editor.js";
import { initWallhavenBackground } from "./wallhaven-background.js";
import { initCharacterUpdater } from "./character-updater.js";
import { initDynamicPrompt } from "./dynamic-prompt.js";
import { initButtonCollapse } from "./button-collapse.js";
import { initVariablesPanel, getVariablesPanelInstance, cleanupVariablesPanel } from "./variables-panel.js";
import { initStreamingGeneration } from "./streaming-generation.js";
import { initVariablesCore, cleanupVariablesCore, replaceXbGetVarInString } from "./variables-core.js";
import { initControlAudio } from "./control-audio.js";

const EXT_ID = "LittleWhiteBox";
const EXT_NAME = "小白X";
const MODULE_NAME = "xiaobaix-memory";
const extensionFolderPath = `scripts/extensions/third-party/${EXT_ID}`;

extension_settings[EXT_ID] = extension_settings[EXT_ID] || {
    enabled: true,
    sandboxMode: false,
    recorded: { enabled: true },
    templateEditor: { enabled: true, characterBindings: {} },
    tasks: { enabled: true, globalTasks: [], processedMessages: [], character_allowed_tasks: [] },
    scriptAssistant: { enabled: false },
    preview: { enabled: false },
    wallhaven: { enabled: false },
    immersive: { enabled: false },
    characterUpdater: { enabled: true, showNotifications: true, serverUrl: "https://db.littlewhitebox.qzz.io" },
    dynamicPrompt: { enabled: true },
    audio: { enabled: true },
    variablesPanel: { enabled: false },
    variablesCore: { enabled: true },
    useBlob: false,
    wrapperIframe: true,
    renderEnabled: true,
    maxRenderedMessages: 5,
};

const settings = extension_settings[EXT_ID];
let isXiaobaixEnabled = settings.enabled;
let globalEventListeners = [];
let globalTimers = [];
let moduleCleanupFunctions = new Map();
let updateCheckPerformed = false;
let isGenerating = false;

const winMap = new Map();
let lastHeights = new WeakMap();
let resizeRafPending = false;
const blobUrls = new WeakMap();
const hashToBlobUrl = new Map();
const blobLRU = [];
const BLOB_CACHE_LIMIT = 32;

window.isXiaobaixEnabled = isXiaobaixEnabled;
window.testLittleWhiteBoxUpdate = async () => {
    updateCheckPerformed = false;
    await performExtensionUpdateCheck();
};
window.testUpdateUI = () => {
    updateExtensionHeaderWithUpdateNotice();
};
window.testRemoveUpdateUI = () => {
    removeAllUpdateNotices();
};

async function checkLittleWhiteBoxUpdate() {
    try {
        const timestamp = Date.now();
        const localRes = await fetch(`${extensionFolderPath}/manifest.json?t=${timestamp}`, { cache: 'no-cache' });
        if (!localRes.ok) return null;
        const localManifest = await localRes.json();
        const localVersion = localManifest.version;
        const remoteRes = await fetch(`https://api.github.com/repos/RT15548/LittleWhiteBox/contents/manifest.json?t=${timestamp}`, { cache: 'no-cache' });
        if (!remoteRes.ok) return null;
        const remoteData = await remoteRes.json();
        const remoteManifest = JSON.parse(atob(remoteData.content));
        const remoteVersion = remoteManifest.version;
        return localVersion !== remoteVersion ? { isUpToDate: false, localVersion, remoteVersion } : { isUpToDate: true, localVersion, remoteVersion };
    } catch (e) {
        return null;
    }
}

async function updateLittleWhiteBoxExtension() {
    try {
        const response = await fetch('/api/extensions/update', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({ extensionName: 'LittleWhiteBox', global: true }),
        });
        if (!response.ok) {
            const text = await response.text();
            toastr.error(text || response.statusText, '小白X更新失败', { timeOut: 5000 });
            return false;
        }
        const data = await response.json();
        const message = data.isUpToDate ? '小白X已是最新版本' : `小白X已更新`;
        const title = data.isUpToDate ? '' : '请刷新页面以应用更新';
        toastr.success(message, title);
        return true;
    } catch (error) {
        toastr.error('更新过程中发生错误', '小白X更新失败');
        return false;
    }
}

function updateExtensionHeaderWithUpdateNotice() {
    addUpdateTextNotice();
    addUpdateDownloadButton();
}

function addUpdateTextNotice() {
    const selectors = [
        '.inline-drawer-toggle.inline-drawer-header b',
        '.inline-drawer-header b',
        '.littlewhitebox .inline-drawer-header b',
        'div[class*="inline-drawer"] b'
    ];
    let headerElement = null;
    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
            if (element.textContent && element.textContent.includes('小白X')) {
                headerElement = element;
                break;
            }
        }
        if (headerElement) break;
    }
    if (!headerElement) {
        setTimeout(() => addUpdateTextNotice(), 1000);
        return;
    }
    if (headerElement.querySelector('.littlewhitebox-update-text')) return;
    const updateTextSmall = document.createElement('small');
    updateTextSmall.className = 'littlewhitebox-update-text';
    updateTextSmall.textContent = '(有可用更新)';
    headerElement.appendChild(updateTextSmall);
}

function addUpdateDownloadButton() {
    const sectionDividers = document.querySelectorAll('.section-divider');
    let totalSwitchDivider = null;
    for (const divider of sectionDividers) {
        if (divider.textContent && divider.textContent.includes('总开关')) {
            totalSwitchDivider = divider;
            break;
        }
    }
    if (!totalSwitchDivider) {
        setTimeout(() => addUpdateDownloadButton(), 1000);
        return;
    }
    if (document.querySelector('#littlewhitebox-update-extension')) return;
    const updateButton = document.createElement('div');
    updateButton.id = 'littlewhitebox-update-extension';
    updateButton.className = 'menu_button fa-solid fa-cloud-arrow-down interactable has-update';
    updateButton.title = '下载并安装小白x的更新';
    updateButton.tabIndex = 0;
    try {
        totalSwitchDivider.style.display = 'flex';
        totalSwitchDivider.style.alignItems = 'center';
        totalSwitchDivider.style.justifyContent = 'flex-start';
    } catch (e) {}
    totalSwitchDivider.appendChild(updateButton);
    try {
        if (window.setupUpdateButtonInSettings) {
            window.setupUpdateButtonInSettings();
        }
    } catch (e) {}
}

function removeAllUpdateNotices() {
    const textNotice = document.querySelector('.littlewhitebox-update-text');
    const downloadButton = document.querySelector('#littlewhitebox-update-extension');
    if (textNotice) textNotice.remove();
    if (downloadButton) downloadButton.remove();
}

async function performExtensionUpdateCheck() {
    if (updateCheckPerformed) return;
    updateCheckPerformed = true;
    try {
        const versionData = await checkLittleWhiteBoxUpdate();
        if (versionData && versionData.isUpToDate === false) {
            updateExtensionHeaderWithUpdateNotice();
        }
    } catch (error) {}
}

function registerModuleCleanup(moduleName, cleanupFunction) {
    moduleCleanupFunctions.set(moduleName, cleanupFunction);
}

function addGlobalEventListener(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    globalEventListeners.push({ target, event, handler, options });
}

function addGlobalTimer(timerId) {
    globalTimers.push(timerId);
}

function removeSkeletonStyles() {
    try {
        document.querySelectorAll('.xiaobaix-skel').forEach(el => {
            try { el.remove(); } catch (e) {}
        });
        document.getElementById('xiaobaix-skeleton-style')?.remove();
    } catch (e) {}
}

function cleanupAllResources() {
    globalEventListeners.forEach(({ target, event, handler, options, isEventSource }) => {
        try {
            if (isEventSource && target.removeListener) {
                target.removeListener(event, handler);
            } else {
                target.removeEventListener(event, handler, options);
            }
        } catch (e) {}
    });
    globalEventListeners.length = 0;
    globalTimers.forEach(timerId => {
        try {
            clearTimeout(timerId);
            clearInterval(timerId);
        } catch (e) {}
    });
    globalTimers.length = 0;
    moduleCleanupFunctions.forEach((cleanupFn) => {
        try {
            cleanupFn();
        } catch (e) {}
    });
    moduleCleanupFunctions.clear();
    document.querySelectorAll('iframe.xiaobaix-iframe').forEach(ifr => {
        try { ifr.src = 'about:blank'; } catch(e) {}
        releaseIframeBlob(ifr);
    });
    document.querySelectorAll('iframe.xiaobaix-iframe, .xiaobaix-iframe-wrapper').forEach(el => el.remove());
    winMap.clear();
    document.querySelectorAll('.memory-button, .mes_history_preview').forEach(btn => btn.remove());
    document.querySelectorAll('#message_preview_btn').forEach(btn => {
        if (btn instanceof HTMLElement) {
            btn.style.display = 'none';
        }
    });
    document.getElementById('xiaobaix-hide-code')?.remove();
    document.body.classList.remove('xiaobaix-active');
    document.querySelectorAll('pre[data-xiaobaix-bound="true"]').forEach(pre => {
        pre.classList.remove('xb-show');
        pre.removeAttribute('data-xbfinal');
        delete pre.dataset.xbFinal;
        pre.style.display = '';
        delete pre.dataset.xiaobaixBound;
    });
    removeSkeletonStyles();
}

async function waitForElement(selector, root = document, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const element = root.querySelector(selector);
        if (element) return element;
        await new Promise(r => setTimeout(r, 100));
    }
    return null;
}

function generateUniqueId() {
    return `xiaobaix-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function shouldRenderContentByBlock(codeBlock) {
    if (!codeBlock) return false;
    const content = (codeBlock.textContent || '').trim().toLowerCase();
    if (!content) return false;
    return content.includes('<!doctype') || content.includes('<html') || content.includes('<script');
}

function djb2(str){let h=5381;for(let i=0;i<str.length;i++){h=((h<<5)+h)^str.charCodeAt(i)}return (h>>>0).toString(16)}

function buildResourceHints(html){
    const urls = Array.from(new Set((html.match(/https?:\/\/[^"'()\s]+/gi)||[]).map(u=>{try{return new URL(u).origin}catch{return null}}).filter(Boolean)));
    let hints = ""; const maxHosts = 6;
    for(let i=0;i<Math.min(urls.length,maxHosts);i++){const origin=urls[i];hints+=`<link rel="dns-prefetch" href="${origin}">`;hints+=`<link rel="preconnect" href="${origin}" crossorigin>`}
    let preload = "";
    const font = (html.match(/https?:\/\/[^"'()\s]+\.(?:woff2|woff|ttf|otf)/i)||[])[0];
    if(font){const type=font.endsWith(".woff2")?"font/woff2":font.endsWith(".woff")?"font/woff":font.endsWith(".ttf")?"font/ttf":"font/otf";preload+=`<link rel="preload" as="font" href="${font}" type="${type}" crossorigin fetchpriority="high">`}
    const css = (html.match(/https?:\/\/[^"'()\s]+\.css/i)||[])[0];
    if(css){preload+=`<link rel="preload" as="style" href="${css}" crossorigin fetchpriority="high">`}
    const img = (html.match(/https?:\/\/[^"'()\s]+\.(?:png|jpg|jpeg|webp|gif|svg)/i)||[])[0];
    if(img){preload+=`<link rel="preload" as="image" href="${img}" crossorigin fetchpriority="high">`}
    return hints+preload;
}

function iframeClientScript(){return `
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
  }  function post(m){ try{ parent.postMessage(m,'*') }catch(e){} }

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
})();` }

function buildWrappedHtml(html){
    const api = `<script>${iframeClientScript()}</script>`;
    const wrapperToggle = settings && settings.wrapperIframe ? true : false;
    const origin = (typeof location !== 'undefined' && location.origin) ? location.origin : '';
    const optWrapperUrl = `${origin}/scripts/extensions/third-party/${EXT_ID}/Wrapperiframe.js`;
    const optWrapper = wrapperToggle ? `<script src="${optWrapperUrl}"></script>` : "";
    const baseTag = settings && settings.useBlob ? `<base href="${origin}/">` : "";
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

async function executeSlashCommand(command) {
    try {
        if (!command) return { error: "命令为空" };
        if (!command.startsWith('/')) command = '/' + command;
        const { executeSlashCommands, substituteParams } = getContext();
        if (typeof executeSlashCommands !== 'function') throw new Error("executeSlashCommands 函数不可用");
        command = substituteParams(command);
        const result = await executeSlashCommands(command, true);
        if (result && typeof result === 'object' && result.pipe !== undefined) {
            const pipeValue = result.pipe;
            if (typeof pipeValue === 'string') {
                try { return JSON.parse(pipeValue); } catch { return pipeValue; }
            }
            return pipeValue;
        }
        if (typeof result === 'string' && result.trim()) {
            try { return JSON.parse(result); } catch { return result; }
        }
        return result === undefined ? "" : result;
    } catch (err) {
        throw err;
    }
}

function getOrCreateWrapper(preEl){
    let wrapper=preEl.previousElementSibling;
    if(!wrapper||!wrapper.classList.contains('xiaobaix-iframe-wrapper')){
        wrapper=document.createElement('div');
        wrapper.className='xiaobaix-iframe-wrapper';
        wrapper.style.cssText='margin:0;';
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
    addGlobalTimer(t);
}

let lastApplyTs = 0;
let pendingHeight = null;
let pendingRec = null;
function resolveAvatarUrls() {
    const origin = (typeof location !== 'undefined' && location.origin) ? location.origin : '';
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
            pendingHeight = null; pendingRec = null;
            lastHeights.set(r.iframe, h);
            requestAnimationFrame(() => { r.iframe.style.height = `${h}px`; });
        } else {
            setTimeout(() => {
                if (pendingRec && pendingHeight != null) {
                    lastApplyTs = performance.now();
                    const h = pendingHeight, r = pendingRec;
                    pendingHeight = null; pendingRec = null;
                    lastHeights.set(r.iframe, h);
                    requestAnimationFrame(() => { r.iframe.style.height = `${h}px`; });
                }
            }, Math.max(0, 50 - dt));
        }
        return;
    }
    if (data && data.type === 'runCommand') {
        executeSlashCommand(data.command)
            .then(result => event.source.postMessage({ source: 'xiaobaix-host', type: 'commandResult', id: data.id, result }, '*'))
            .catch(err => event.source.postMessage({ source: 'xiaobaix-host', type: 'commandError', id: data.id, error: err.message || String(err) }, '*'));
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

function setIframeBlobHTML(iframe, fullHTML, codeHash){
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
    blobLRU.push(codeHash);
    while (blobLRU.length > BLOB_CACHE_LIMIT) {
        const old = blobLRU.shift();
        const u = hashToBlobUrl.get(old);
        hashToBlobUrl.delete(old);
        try { URL.revokeObjectURL(u) } catch(e){}
    }
}

function releaseIframeBlob(iframe){
    try {
        const url = blobUrls.get(iframe);
        if (url) URL.revokeObjectURL(url);
        blobUrls.delete(iframe);
    } catch (e) {}
}

function renderHtmlInIframe(htmlContent, container, preElement) {
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
            try { old.src='about:blank'; } catch(e) {}
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
        return null;
    }
}

function toggleSettingsControls(enabled) {
    const controls = [
        'xiaobaix_sandbox', 'xiaobaix_recorded_enabled', 'xiaobaix_preview_enabled',
        'xiaobaix_script_assistant', 'scheduled_tasks_enabled', 'xiaobaix_template_enabled',
        'wallhaven_enabled', 'wallhaven_bg_mode', 'wallhaven_category',
        'wallhaven_purity', 'wallhaven_opacity',
        'xiaobaix_immersive_enabled', 'character_updater_enabled', 'xiaobaix_dynamic_prompt_enabled',
        'xiaobaix_audio_enabled','xiaobaix_variables_panel_enabled',
        'xiaobaix_use_blob', 'xiaobaix_variables_core_enabled', 'Wrapperiframe', 'xiaobaix_render_enabled',
        'xiaobaix_max_rendered'
    ];
    controls.forEach(id => {
        $(`#${id}`).prop('disabled', !enabled).closest('.flex-container').toggleClass('disabled-control', !enabled);
    });
    const styleId = 'xiaobaix-disabled-style';
    if (!enabled && !document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `.disabled-control, .disabled-control * { opacity: 0.4 !important; pointer-events: none !important; cursor: not-allowed !important; }`;
        document.head.appendChild(style);
    } else if (enabled) {
        document.getElementById(styleId)?.remove();
    }
}

function ensureHideCodeStyle(enable) {
    const id = 'xiaobaix-hide-code';
    const old = document.getElementById(id);
    if (!enable) {
        old?.remove();
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
}

function setActiveClass(enable) {
    document.body.classList.toggle('xiaobaix-active', !!enable);
}

function toggleAllFeatures(enabled) {
    if (enabled) {
        if (settings.renderEnabled !== false) {
            ensureHideCodeStyle(true);
            setActiveClass(true);
        }
        toggleSettingsControls(true);
        try { window.XB_applyPrevStates && window.XB_applyPrevStates(); } catch (e) {}
        saveSettingsDebounced();
        processExistingMessages();
        setTimeout(() => processExistingMessages(), 100);
        setupEventListeners();
        const moduleInits = [
            { condition: extension_settings[EXT_ID].tasks?.enabled, init: initTasks },
            { condition: extension_settings[EXT_ID].scriptAssistant?.enabled, init: initScriptAssistant },
            { condition: extension_settings[EXT_ID].immersive?.enabled, init: initImmersiveMode },
            { condition: extension_settings[EXT_ID].templateEditor?.enabled, init: initTemplateEditor },
            { condition: extension_settings[EXT_ID].wallhaven?.enabled, init: initWallhavenBackground },
            { condition: extension_settings[EXT_ID].characterUpdater?.enabled, init: initCharacterUpdater },
            { condition: extension_settings[EXT_ID].dynamicPrompt?.enabled, init: initDynamicPrompt },
            { condition: extension_settings[EXT_ID].variablesPanel?.enabled, init: initVariablesPanel },
            { condition: extension_settings[EXT_ID].variablesCore?.enabled, init: initVariablesCore },
            { condition: true, init: initStreamingGeneration },
            { condition: true, init: initButtonCollapse }
        ];
        moduleInits.forEach(({ condition, init }) => {
            if (condition) init();
        });
        if (extension_settings[EXT_ID].preview?.enabled || extension_settings[EXT_ID].recorded?.enabled) {
            setTimeout(initMessagePreview, 200);
        }
        if (extension_settings[EXT_ID].scriptAssistant?.enabled && window.injectScriptDocs)
            setTimeout(() => window.injectScriptDocs(), 400);
        if (extension_settings[EXT_ID].preview?.enabled)
            setTimeout(() => { document.querySelectorAll('#message_preview_btn').forEach(btn => btn.style.display = ''); }, 500);
        if (extension_settings[EXT_ID].recorded?.enabled)
            setTimeout(() => addHistoryButtonsDebounced(), 600);
        try{if(isXiaobaixEnabled&&settings.wrapperIframe&&!document.getElementById('xb-callgen'))document.head.appendChild(Object.assign(document.createElement('script'),{id:'xb-callgen',type:'module',src:`${extensionFolderPath}/call-generate-service.js`}))}catch(e){}
        try{if(isXiaobaixEnabled&&!document.getElementById('xb-worldbook'))document.head.appendChild(Object.assign(document.createElement('script'),{id:'xb-worldbook',type:'module',src:`${extensionFolderPath}/worldbook-bridge.js`}))}catch(e){}
        document.dispatchEvent(new CustomEvent('xiaobaixEnabledChanged', { detail: { enabled: true } }));
    } else {
        try { window.XB_captureAndStoreStates && window.XB_captureAndStoreStates(); } catch (e) {}
        cleanupAllResources();
        if (window.messagePreviewCleanup) try { window.messagePreviewCleanup(); } catch (e) {}
        if (window.dynamicPromptCleanup) try { window.dynamicPromptCleanup(); } catch (e) {}
        if (window.buttonCollapseCleanup) try { window.buttonCollapseCleanup(); } catch (e) {}
        try { cleanupVariablesPanel(); } catch (e) {}
        try { cleanupVariablesCore(); } catch (e) {}
        try { clearBlobCaches(); } catch (e) {}
        toggleSettingsControls(false);
        document.getElementById('xiaobaix-hide-code')?.remove();
        setActiveClass(false);
        document.querySelectorAll('pre[data-xiaobaix-bound="true"]').forEach(pre => {
            pre.classList.remove('xb-show');
            pre.removeAttribute('data-xbfinal');
            delete pre.dataset.xbFinal;
            pre.style.display = '';
            delete pre.dataset.xiaobaixBound;
        });
        window.removeScriptDocs?.();
        try { window.cleanupWorldbookHostBridge && window.cleanupWorldbookHostBridge(); document.getElementById('xb-worldbook')?.remove(); } catch (e) {}
        try { window.cleanupCallGenerateHostBridge && window.cleanupCallGenerateHostBridge(); document.getElementById('xb-callgen')?.remove(); } catch (e) {}
        document.dispatchEvent(new CustomEvent('xiaobaixEnabledChanged', { detail: { enabled: false } }));
    }
}

function invalidateMessage(messageId){
    const el=document.querySelector(`div.mes[mesid="${messageId}"] .mes_text`);
    if(!el)return;
    el.querySelectorAll('.xiaobaix-iframe-wrapper').forEach(w=>{
        w.querySelectorAll('.xiaobaix-iframe').forEach(ifr=>{try{ifr.src='about:blank'}catch(e){};releaseIframeBlob(ifr)});
        w.remove();
    });
    el.querySelectorAll('pre').forEach(pre=>{
        pre.classList.remove('xb-show');
        pre.removeAttribute('data-xbfinal');
        pre.removeAttribute('data-xbhash');
        delete pre.dataset.xbFinal;
        delete pre.dataset.xbHash;
        pre.style.display='';
        delete pre.dataset.xiaobaixBound;
    });
}

function clearBlobCaches(){
    try{hashToBlobUrl.forEach(u=>{try{URL.revokeObjectURL(u)}catch{}})}catch{}
    hashToBlobUrl.clear();
    blobLRU.length=0;
}

function invalidateAll(){
    document.querySelectorAll('.xiaobaix-iframe-wrapper').forEach(w=>{
        w.querySelectorAll('.xiaobaix-iframe').forEach(ifr=>{try{ifr.src='about:blank'}catch(e){};releaseIframeBlob(ifr)});
        w.remove();
    });
    document.querySelectorAll('.mes_text pre').forEach(pre=>{
        pre.classList.remove('xb-show');
        pre.removeAttribute('data-xbfinal');
        pre.removeAttribute('data-xbhash');
        delete pre.dataset.xbFinal;
        delete pre.dataset.xbHash;
        delete pre.dataset.xiaobaixBound;
        pre.style.display='';
    });
    clearBlobCaches();
    winMap.clear();
    lastHeights = new WeakMap();
}

function shrinkRenderedWindowForLastMessage() {
    if (!settings.enabled || !isXiaobaixEnabled) return;
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
        if (mesId >= keepFrom) {
            break;
        }
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
    if (!settings.enabled || !isXiaobaixEnabled) return;
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
        if (mesId >= keepFrom) {
            continue;
        }
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

function processMessageById(messageId, forceFinal = true) {
    const messageElement = document.querySelector(`div.mes[mesid="${messageId}"] .mes_text`);
    if (!messageElement) return;
    processCodeBlocks(messageElement, forceFinal);
    try { shrinkRenderedWindowForLastMessage(); } catch (e) {}
}

function processCodeBlocks(messageElement, forceFinal=true) {
    if (!settings.enabled || !isXiaobaixEnabled) return;
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
                preElement.style.display='';
            }
            preElement.dataset.xiaobaixBound = 'true';
        });
    } catch (err) {}
}

function processExistingMessages() {
    if (!settings.enabled || !isXiaobaixEnabled) return;
    document.querySelectorAll('.mes_text').forEach(el=>processCodeBlocks(el,true));
    try { shrinkRenderedWindowFull(); } catch (e) {}
}

async function setupSettings() {
    try {
        const settingsContainer = await waitForElement("#extensions_settings");
        if (!settingsContainer) return;
        const response = await fetch(`${extensionFolderPath}/settings.html`);
        const settingsHtml = await response.text();
        $(settingsContainer).append(settingsHtml);
        $("#xiaobaix_enabled").prop("checked", settings.enabled).on("change", function () {
            const wasEnabled = settings.enabled;
            settings.enabled = $(this).prop("checked");
            isXiaobaixEnabled = settings.enabled;
            window.isXiaobaixEnabled = isXiaobaixEnabled;
            saveSettingsDebounced();
            if (settings.enabled !== wasEnabled) {
                toggleAllFeatures(settings.enabled);
            }
        });
        if (!settings.enabled) toggleSettingsControls(false);
        $("#xiaobaix_sandbox").prop("checked", settings.sandboxMode).on("change", function () {
            if (!isXiaobaixEnabled) return;
            settings.sandboxMode = $(this).prop("checked");
            saveSettingsDebounced();
        });
        const moduleConfigs = [
            { id: 'xiaobaix_recorded_enabled', key: 'recorded' },
            { id: 'xiaobaix_immersive_enabled', key: 'immersive', init: initImmersiveMode },
            { id: 'xiaobaix_preview_enabled', key: 'preview', init: initMessagePreview },
            { id: 'xiaobaix_script_assistant', key: 'scriptAssistant', init: initScriptAssistant },
            { id: 'scheduled_tasks_enabled', key: 'tasks', init: initTasks },
            { id: 'xiaobaix_template_enabled', key: 'templateEditor', init: initTemplateEditor },
            { id: 'wallhaven_enabled', key: 'wallhaven', init: initWallhavenBackground },
            { id: 'character_updater_enabled', key: 'characterUpdater', init: initCharacterUpdater },
            { id: 'xiaobaix_dynamic_prompt_enabled', key: 'dynamicPrompt', init: initDynamicPrompt },
            { id: 'xiaobaix_variables_panel_enabled', key: 'variablesPanel', init: initVariablesPanel },
            { id: 'xiaobaix_variables_core_enabled', key: 'variablesCore', init: initVariablesCore }
        ];
        moduleConfigs.forEach(({ id, key, init }) => {
            $(`#${id}`).prop("checked", settings[key]?.enabled || false).on("change", function () {
                if (!isXiaobaixEnabled) return;
                const enabled = $(this).prop('checked');
                settings[key] = extension_settings[EXT_ID][key] || {};
                settings[key].enabled = enabled;
                if (key === 'characterUpdater') {
                    settings[key].showNotifications = enabled;
                }
                extension_settings[EXT_ID][key] = settings[key];
                saveSettingsDebounced();
                if (moduleCleanupFunctions.has(key)) {
                    moduleCleanupFunctions.get(key)();
                    moduleCleanupFunctions.delete(key);
                }
                if (enabled && init) init();
            });
        });
        $("#xiaobaix_use_blob").prop("checked", !!settings.useBlob).on("change", function () {
            if (!isXiaobaixEnabled) return;
            settings.useBlob = $(this).prop("checked");
            saveSettingsDebounced();
        });
        $("#Wrapperiframe").prop("checked", !!settings.wrapperIframe).on("change", function () {
            if (!isXiaobaixEnabled) return;
            settings.wrapperIframe = $(this).prop("checked");
            saveSettingsDebounced();
            try{settings.wrapperIframe?(!document.getElementById('xb-callgen')&&document.head.appendChild(Object.assign(document.createElement('script'),{id:'xb-callgen',type:'module',src:`${extensionFolderPath}/call-generate-service.js`}))):(window.cleanupCallGenerateHostBridge&&window.cleanupCallGenerateHostBridge(),document.getElementById('xb-callgen')?.remove())}catch(e){}
        });
        $("#xiaobaix_render_enabled").prop("checked", settings.renderEnabled !== false).on("change", function () {
            if (!isXiaobaixEnabled) return;
            const wasEnabled = settings.renderEnabled !== false;
            settings.renderEnabled = $(this).prop("checked");
            saveSettingsDebounced();
            if (!settings.renderEnabled && wasEnabled) {
                document.getElementById('xiaobaix-hide-code')?.remove();
                document.body.classList.remove('xiaobaix-active');
                invalidateAll();
            } else if (settings.renderEnabled && !wasEnabled) {
                ensureHideCodeStyle(true);
                document.body.classList.add('xiaobaix-active');
                setTimeout(() => processExistingMessages(), 100);
            }
        });

        const normalizeMaxRendered = (raw) => {
            let v = parseInt(raw, 10);
            if (!Number.isFinite(v) || v < 1) v = 1;
            if (v > 9999) v = 9999;
            return v;
        };
        $("#xiaobaix_max_rendered")
            .val(Number.isFinite(settings.maxRenderedMessages) ? settings.maxRenderedMessages : 5)
            .on("input change", function () {
                if (!isXiaobaixEnabled) return;
                const v = normalizeMaxRendered($(this).val());
                $(this).val(v);
                settings.maxRenderedMessages = v;
                saveSettingsDebounced();
                try { shrinkRenderedWindowFull(); } catch (e) {}
            });
        
        $(document).off('click.xbreset', '#xiaobaix_reset_btn').on('click.xbreset', '#xiaobaix_reset_btn', function(e){
            e.preventDefault(); e.stopPropagation();
            const MAP={recorded:'xiaobaix_recorded_enabled',immersive:'xiaobaix_immersive_enabled',preview:'xiaobaix_preview_enabled',scriptAssistant:'xiaobaix_script_assistant',tasks:'scheduled_tasks_enabled',templateEditor:'xiaobaix_template_enabled',wallhaven:'wallhaven_enabled',characterUpdater:'character_updater_enabled',dynamicPrompt:'xiaobaix_dynamic_prompt_enabled',variablesPanel:'xiaobaix_variables_panel_enabled',variablesCore:'xiaobaix_variables_core_enabled'};
            const ON=['templateEditor','tasks','dynamicPrompt','variablesCore','characterUpdater'];
            const OFF=['recorded','preview','scriptAssistant','immersive','wallhaven','variablesPanel'];
            function setChecked(id,val){ const el=document.getElementById(id); if(el){ el.checked=!!val; try{ $(el).trigger('change') }catch{}} }
            ON.forEach(k=>setChecked(MAP[k],true));
            OFF.forEach(k=>setChecked(MAP[k],false));
            setChecked('xiaobaix_sandbox',false);
            setChecked('xiaobaix_use_blob',false);
            setChecked('Wrapperiframe',true);
            try{ saveSettingsDebounced() }catch(e){}
        });
    } catch (err) {}
}

function setupMenuTabs() {
    $(document).on('click', '.menu-tab', function () {
        const targetId = $(this).attr('data-target');
        $('.menu-tab').removeClass('active');
        $('.settings-section').hide();
        $(this).addClass('active');
        $('.' + targetId).show();
    });
    setTimeout(() => {
        $('.js-memory').show();
        $('.task, .instructions').hide();
        $('.menu-tab[data-target="js-memory"]').addClass('active');
        $('.menu-tab[data-target="task"], .menu-tab[data-target="instructions"]').removeClass('active');
    }, 300);
}

let scanTimer = 0;
let scanningActive = false;
let skeletonPlacedForMsg = new Map();

function scheduleScanForStreaming() { return; }
function startStreamingScan() { return; }
function stopStreamingScan() {
    scanningActive = false;
    clearTimeout(scanTimer);
    scanTimer = 0;
    skeletonPlacedForMsg.clear();
}

function setupEventListeners() {
    if (!isXiaobaixEnabled) return;
    const { eventSource, event_types } = getContext();
    const handleMessage = async (data, isReceived = false) => {
        if (!settings.enabled || !isXiaobaixEnabled) return;
        setTimeout(async () => {
            const messageId = typeof data === 'object' ? data.messageId : data;
            if (!messageId && messageId !== 0) return;
            const messageElement = document.querySelector(`div.mes[mesid="${messageId}"] .mes_text`);
            if (!messageElement) return;
            processCodeBlocks(messageElement, true);
            try { shrinkRenderedWindowForLastMessage(); } catch (e) {}
        }, isReceived ? 300 : 10);
    };
    const onMessageReceived = (data) => handleMessage(data, true);
    const onMessageUpdated = (data) => {
        if (!isXiaobaixEnabled) return;
        const messageId = typeof data === 'object' ? data.messageId : data;
        if (messageId == null) return;
        processMessageById(messageId, true);
    };
    const onMessageEdited = onMessageUpdated;
    const onMessageDeleted = (data) => {
        const messageId = typeof data === 'object' ? data.messageId : data;
        if (messageId == null) return;
        invalidateMessage(messageId);
    };
    const onMessageSwiped = handleMessage;
    if (event_types.MESSAGE_RECEIVED) {
        eventSource.on(event_types.MESSAGE_RECEIVED, onMessageReceived);
        globalEventListeners.push({ target: eventSource, event: event_types.MESSAGE_RECEIVED, handler: onMessageReceived, isEventSource: true });
    }
    if (event_types.MESSAGE_UPDATED) {
        eventSource.on(event_types.MESSAGE_UPDATED, onMessageUpdated);
        globalEventListeners.push({ target: eventSource, event: event_types.MESSAGE_UPDATED, handler: onMessageUpdated, isEventSource: true });
    }
    if (event_types.MESSAGE_EDITED) {
        eventSource.on(event_types.MESSAGE_EDITED, onMessageEdited);
        globalEventListeners.push({ target: eventSource, event: event_types.MESSAGE_EDITED, handler: onMessageEdited, isEventSource: true });
    }
    if (event_types.MESSAGE_DELETED) {
        eventSource.on(event_types.MESSAGE_DELETED, onMessageDeleted);
        globalEventListeners.push({ target: eventSource, event: event_types.MESSAGE_DELETED, handler: onMessageDeleted, isEventSource: true });
    }
    if (event_types.MESSAGE_SWIPED) {
        eventSource.on(event_types.MESSAGE_SWIPED, onMessageSwiped);
        globalEventListeners.push({ target: eventSource, event: event_types.MESSAGE_SWIPED, handler: onMessageSwiped, isEventSource: true });
    }
    if (event_types.USER_MESSAGE_RENDERED) {
        eventSource.on(event_types.USER_MESSAGE_RENDERED, handleMessage);
        globalEventListeners.push({ target: eventSource, event: event_types.USER_MESSAGE_RENDERED, handler: handleMessage, isEventSource: true });
    }
    if (event_types.CHARACTER_MESSAGE_RENDERED) {
        eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, handleMessage);
        globalEventListeners.push({ target: eventSource, event: event_types.CHARACTER_MESSAGE_RENDERED, handler: handleMessage, isEventSource: true });
    }
    const chatChanged = () => {
        isGenerating = false;
        invalidateAll();
        setTimeout(() => {
            processExistingMessages();
        }, 100);
    };
    const CHAT_LOADED_EVENT = event_types.CHAT_CHANGED;
    if (CHAT_LOADED_EVENT) {
        eventSource.on(CHAT_LOADED_EVENT, chatChanged);
        globalEventListeners.push({ target: eventSource, event: CHAT_LOADED_EVENT, handler: chatChanged, isEventSource: true });
    }
    if (event_types.GENERATION_STARTED) {
        const onGenStart = () => { if (isXiaobaixEnabled) isGenerating = true; };
        eventSource.on(event_types.GENERATION_STARTED, onGenStart);
        globalEventListeners.push({ target: eventSource, event: event_types.GENERATION_STARTED, handler: onGenStart, isEventSource: true });
    }
    if (event_types.GENERATION_ENDED) {
        const onGenEnd = () => {
            isGenerating = false;
            const ctx = getContext();
            const lastId = ctx.chat?.length - 1;
            if (lastId != null && lastId >= 0) {
                setTimeout(() => {
                    processMessageById(lastId, true);
                    try { shrinkRenderedWindowForLastMessage(); } catch (e) {}
                }, 60);
            }
            stopStreamingScan();
        };
        eventSource.on(event_types.GENERATION_ENDED, onGenEnd);
        globalEventListeners.push({ target: eventSource, event: event_types.GENERATION_ENDED, handler: onGenEnd, isEventSource: true });
    }
    addGlobalEventListener(window, 'message', handleIframeMessage);
}

window.processExistingMessages = processExistingMessages;
window.renderHtmlInIframe = renderHtmlInIframe;
window.registerModuleCleanup = registerModuleCleanup;
window.addGlobalEventListener = addGlobalEventListener;
window.addGlobalTimer = addGlobalTimer;
window.updateLittleWhiteBoxExtension = updateLittleWhiteBoxExtension;
window.removeAllUpdateNotices = removeAllUpdateNotices;

jQuery(async () => {
    try {
        isXiaobaixEnabled = settings.enabled;
        window.isXiaobaixEnabled = isXiaobaixEnabled;
        if (isXiaobaixEnabled && settings.renderEnabled !== false) {
            ensureHideCodeStyle(true);
            setActiveClass(true);
        }
        if (!document.getElementById('xiaobaix-skeleton-style')) {
            const skelStyle = document.createElement('style');
            skelStyle.id = 'xiaobaix-skeleton-style';
            skelStyle.textContent = `
              .xiaobaix-iframe-wrapper{position:relative}
            `;
            document.head.appendChild(skelStyle);
        }
        const response = await fetch(`${extensionFolderPath}/style.css`);
        const styleElement = document.createElement('style');
        styleElement.textContent = await response.text();
        document.head.appendChild(styleElement);
        await setupSettings();
        try { initControlAudio(); } catch (e) {}
        if (isXiaobaixEnabled) setupEventListeners();
        try{if(isXiaobaixEnabled&&settings.wrapperIframe&&!document.getElementById('xb-callgen'))document.head.appendChild(Object.assign(document.createElement('script'),{id:'xb-callgen',type:'module',src:`${extensionFolderPath}/call-generate-service.js`}))}catch(e){}
        try{if(isXiaobaixEnabled&&!document.getElementById('xb-worldbook'))document.head.appendChild(Object.assign(document.createElement('script'),{id:'xb-worldbook',type:'module',src:`${extensionFolderPath}/worldbook-bridge.js`}))}catch(e){}
        eventSource.on(event_types.APP_READY, () => {
            setTimeout(performExtensionUpdateCheck, 2000);
        });
        if (isXiaobaixEnabled) {
            const moduleInits = [
                { condition: settings.tasks?.enabled, init: initTasks },
                { condition: settings.scriptAssistant?.enabled, init: initScriptAssistant },
                { condition: settings.immersive?.enabled, init: initImmersiveMode },
                { condition: settings.templateEditor?.enabled, init: initTemplateEditor },
                { condition: settings.wallhaven?.enabled, init: initWallhavenBackground },
                { condition: settings.characterUpdater?.enabled, init: initCharacterUpdater },
                { condition: settings.dynamicPrompt?.enabled, init: initDynamicPrompt },
                { condition: settings.variablesPanel?.enabled, init: initVariablesPanel },
                { condition: settings.variablesCore?.enabled, init: initVariablesCore },
                { condition: true, init: initStreamingGeneration },
                { condition: true, init: initButtonCollapse }
            ];
            moduleInits.forEach(({ condition, init }) => { if (condition) init(); });
            if (settings.preview?.enabled || settings.recorded?.enabled) {
                const timer2 = setTimeout(initMessagePreview, 1500);
                addGlobalTimer(timer2);
            }
        }
        const timer1 = setTimeout(setupMenuTabs, 500);
        addGlobalTimer(timer1);
        addGlobalTimer(setTimeout(() => {
            if (window.messagePreviewCleanup) {
                registerModuleCleanup('messagePreview', window.messagePreviewCleanup);
            }
        }, 2000));
        const intervalId = setInterval(() => {
            if (isXiaobaixEnabled) processExistingMessages();
        }, 30000);
        addGlobalTimer(intervalId);
    } catch (err) {}
});

export { executeSlashCommand };