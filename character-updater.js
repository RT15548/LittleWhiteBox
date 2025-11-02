/* 公共工具区 */
/* eslint-disable no-console */
import { extension_settings, writeExtensionField } from "../../../extensions.js";
import { eventSource, event_types, characters, this_chid } from "../../../../script.js";
import { getPresetManager } from "../../../preset-manager.js";
import { oai_settings } from "../../../openai.js";

const EXT_ID="LittleWhiteBox", MODULE_NAME="characterUpdater", extensionFolderPath=`scripts/extensions/third-party/${EXT_ID}`;

const SECURITY_CONFIG={
  AUTH_TOKEN:"L15bEs6Nut9b4skgabYC",
  AUTH_HEADER_KEY:"GTpzLYc21yopWLKhjjEQ",
  PASSWORD_SALT:"kXUAjsi8wMa1AM8NJ9uA",
  TRUSTED_DOMAINS:["rentry.org","discord.com","discordapp.net","discordapp.com"]
};
const moduleState={ isInitialized:false, eventHandlers:{}, timers:{}, observers:{} };

const defaultSettings={ enabled:true, showNotifications:true };


/* 统一启用状态检查 */
function isFeatureEnabled(){
  return Settings.get().enabled;
}


const Settings={
  get(){
    const parent=extension_settings[EXT_ID]||{};
    const mod=parent.characterUpdater||{};
    const merged={...defaultSettings,...mod};
    merged.serverUrl=parent.characterUpdater?.serverUrl||"https://db.littlewhitebox.qzz.io";
    merged.enabled = (parent.enabled !== false) && (merged.enabled !== false);
    return merged;
  }
};

const Tools={
  uuid(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==="x"?r:(r&0x3|0x8)).toString(16);});},
  toast(m,t="info",title="角色卡更新"){ if(Settings.get().showNotifications) window.toastr?.[t]?.(m,title); },
  encrypt(pw){ const k=SECURITY_CONFIG.PASSWORD_SALT; let r=""; if(!pw) return ""; for(let i=0;i<pw.length;i++) r+=String.fromCharCode(pw.charCodeAt(i)^k.charCodeAt(i%k.length)); return btoa(r); },
  validUrl(url){ if(!url||typeof url!=="string") return false; try{ const h=new URL(url).hostname.toLowerCase(); return SECURITY_CONFIG.TRUSTED_DOMAINS.some(d=>h===d||h.endsWith("."+d)); }catch{return false;} },
  sanitize(html){ if(!html||typeof html!=="string") return ""; const allowed=new Set(["br","b","strong","i","em","u","p","div","span"]); const div=document.createElement("div"); div.innerHTML=html;
    const walk=n=>{ if(n.nodeType===Node.TEXT_NODE) return n.textContent;
      if(n.nodeType===Node.ELEMENT_NODE){ const t=n.tagName.toLowerCase(); if(!allowed.has(t)) return Array.from(n.childNodes).map(walk).join(""); return `<${t}>${Array.from(n.childNodes).map(walk).join("")}</${t}>`; }
      return "";
    };
    return Array.from(div.childNodes).map(walk).join("");
  },
  nameToServer(input,fallback="Unnamed"){
    let s=String(input??"").replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s\-_().\[\]]/g,"_");
    s=s.replace(/\s+/g," ").trim(); if(!s) s=`${fallback}_${Date.now()}`; if(s.length>300) s=s.slice(0,300); s=s.replace(/^_+|_+$/g,""); return s;
  }
};

const Server={
  async req(endpoint,method="GET",data=null,form=false){
    const { serverUrl }=Settings.get(); if(!serverUrl) throw new Error("服务器地址未配置");
    const auth=new URLSearchParams({ auth:SECURITY_CONFIG.AUTH_TOKEN, key:SECURITY_CONFIG.AUTH_HEADER_KEY, ts:Date.now()+"" });
    const opt={ method, headers:{} };
    if(data){
      if(form){ const body=new URLSearchParams(); body.append("data",JSON.stringify(data)); opt.headers["Content-Type"]="application/x-www-form-urlencoded"; opt.body=body; }
      else { opt.headers["Content-Type"]="application/json"; opt.body=JSON.stringify(data); }
    }
    const res=await fetch(`${serverUrl.replace(/\/$/,"")}${endpoint}?${auth}`,opt);
    if(!res.ok){ const errJson=await res.json().catch(()=>({})); const msg=errJson.error||`服务器错误: ${res.status}`; const e=new Error(msg); e.status=res.status; e.isPasswordError=res.status===401||(""+msg).includes("密码"); throw e; }
    return await res.json();
  },
  create(d){ return Server.req("/create","POST",d,true); },
  update(d){ return Server.req("/update","POST",d,true); },
  batch(chars){ return Server.req("/batch/data","POST",{ characters: chars.map((c,i)=>({ name: c.nameGroup||c.name, uniqueValue: c.uniqueValue, clientId: i })) },true); }
};

const Cache={
  KEY:"character_updater_cache", EXP:24*60*60*1000,
  _all(){ try{return JSON.parse(localStorage.getItem(Cache.KEY)||"{}");}catch{return{};} },
  _save(o){ try{localStorage.setItem(Cache.KEY,JSON.stringify(o));}catch{} },
  set(k,d){ const o=Cache._all(); o[k]={...d,cachedAt:Date.now()}; Cache._save(o); },
  get(k){ const o=Cache._all(); const v=o[k]; if(!v) return null; if(Date.now()-v.cachedAt>Cache.EXP){ delete o[k]; Cache._save(o); return null; } return v; },
  getCloud(k){ return Cache.get(k)?.serverData||null; },
  setBatch(map){ const o=Cache._all(); const t=Date.now(); map.forEach((d,k)=>{ o[k]={...d,cachedAt:t}; }); Cache._save(o); },
  remove(k){ const o=Cache._all(); if(Object.prototype.hasOwnProperty.call(o,k)){ delete o[k]; Cache._save(o);} },
  clear(){ try{ localStorage.removeItem(Cache.KEY);}catch{} }
};

const Cooldown={ active:false,left:0,t:null,
  start(sec=30){ this.active=true; this.left=sec; this.t=setInterval(()=>{ if(--this.left<=0) this.stop(); },1000); },
  stop(){ clearInterval(this.t); this.active=false; this.left=0; this.t=null; },
  check(){ if(this.active){ Tools.toast(`操作冷却中，请等待 ${this.left} 秒`,"warning"); return false; } return true; }
};

const Press={
  bind($el,onLong,onShort){
    let timer=null, longFired=false;
    const start=(e)=>{ longFired=false; clearTimeout(timer); timer=setTimeout(()=>{ timer=null; longFired=true; onLong?.(e); },3000); };
    const end=()=>{ if(timer){ clearTimeout(timer); timer=null; } };
    $el.on("mousedown touchstart",start);
    $el.on("mouseup mouseleave touchend touchcancel",end);
    $el.on("click",(e)=>{ if(longFired){ e.preventDefault(); e.stopImmediatePropagation?.(); longFired=false; return; } onShort?.(e); });
    $el.on("contextmenu",(e)=>{ if(timer||longFired) e.preventDefault(); });
  }
};

function UpdaterFactory(adapter){
  async function bind(id, form){
    const local=adapter.getLocalData(id);
    const uuid=Tools.uuid(), timestamp=new Date().toISOString();
    const rawName=form?.name?.trim()||adapter.getDisplayName(id)||"Unnamed";
    const nameGroup=Tools.nameToServer(rawName,adapter.fallbackName||"Item");
    try{
      const r=await Server.create({ name:nameGroup, unique_value:uuid, password:Tools.encrypt(form.password), update_notice:form.updateNote||"初始版本", link_address:form.pngUrl||"", timestamp });
      if(!r.success) return { success:false, error:r.error };
      await adapter.setLocalData(id,{ ...(local||{}), nameGroup, uniqueValue:uuid, updateNote:form.updateNote||"初始版本", linkAddress:form.pngUrl||"", timestamp, bindTime:Date.now() });
      return { success:true, nameGroup, uniqueValue:uuid };
    }catch(e){ console.error("[绑定失败]",e); return { success:false, error:e.isPasswordError?"密码错误":(e?.message||"网络连接失败") }; }
  }
  async function update(id, form, silent=false){
    const data=adapter.getLocalData(id);
    if(!adapter.isBound(id)) return { success:false, error:"未绑定" };

    const newPublicTs=new Date().toISOString();

    const base={
      name:data.nameGroup,
      unique_value:data.uniqueValue,
      password:Tools.encrypt(form.password),
      update_notice:form.updateNote||(silent?(data.updateNote||""):"版本更新"),
      link_address:form.pngUrl||data.linkAddress||"",
    };

    const payload=silent ? { ...base, silent:true } : { ...base, timestamp:newPublicTs };

    try{
      const r=await Server.update(payload);
      if(!r.success) return { success:false, error:r.error };

      const newData={
        ...data,
        updateNote:form.updateNote||data.updateNote||"",
        linkAddress:form.pngUrl||data.linkAddress||"",
        timestamp:silent?data.timestamp:newPublicTs,
        [silent?"lastSilentUpdateTime":"lastUpdateTime"]:Date.now(),
      };
      await adapter.setLocalData(id,newData);

      Cache.set(adapter.toCacheKey(id),{
        serverData:{
          timestamp:silent?data.timestamp:newPublicTs,
          update_notice:newData.updateNote,
          link_address:newData.linkAddress,
        },
      });

      return { success:true, timestamp:newData.timestamp };
    }catch(e){
      console.error("[更新失败]",e);
      return { success:false, error:e.isPasswordError?"密码错误":(e?.message||"网络连接失败") };
    }
  }

  async function batchStartupCheck(){
    try{
      const ids=adapter.listAllBoundIds(); if(!ids.length){ adapter.onAnyHasUpdates?.(false); return; }
      const items=[], idxToId=new Map();
      ids.forEach((id,idx)=>{
        const d=adapter.getLocalData(id);
        if(d?.uniqueValue&&d?.nameGroup){
          const localTimestamp=adapter.getLocalTimestampForCompare?.(id) ?? d.timestamp;
          items.push({ nameGroup:d.nameGroup, uniqueValue:d.uniqueValue, clientId:idx, localTimestamp });
          idxToId.set(idx,id);
        }
      });
      if(!items.length){ adapter.onAnyHasUpdates?.(false); return; }
      const resp=await Server.batch(items); if(!(resp?.success&&Array.isArray(resp.results))){ adapter.onAnyHasUpdates?.(false); return; }
      const cacheMap=new Map(), updates=[];
      resp.results.forEach(r=>{
        if(r.found&&r.data){
          const id=idxToId.get(r.clientId), local=adapter.getLocalData(id);
          const localTs=adapter.getLocalTimestampForCompare?.(id) ?? local?.timestamp ?? "";
          cacheMap.set(adapter.toCacheKey(id),{ serverData:r.data });
          if(r.data.timestamp && r.data.timestamp!==localTs){
            updates.push({ id, name:adapter.getDisplayName(id)||"未知", currentTimestamp:localTs, latestTimestamp:r.data.timestamp, updateNote:r.data.update_notice||"无更新说明", linkAddress:r.data.link_address||"", serverData:r.data });
          }
        }
      });
      Cache.setBatch(cacheMap);
      adapter.afterBatch?.(updates); adapter.onAnyHasUpdates?.(updates.length>0);
    }catch(e){ console.error("[云端检查失败]",e); adapter.onAnyHasUpdates?.(false); }
  }
  return { bind, update, batchStartupCheck };
}

/* 角色卡区 */
const CharacterAdapter={
  fallbackName:"Character",
  getCurrentId(){ return this_chid; },
  getLocalData(id){ return characters?.[id]?.data?.extensions?.[MODULE_NAME]||null; },
  async setLocalData(id,data){ try{ await writeExtensionField(id,MODULE_NAME,data); return true; }catch(e){ console.error("保存失败",e); return false; } },
  isBound(id){ const d=this.getLocalData(id); return !!(d?.uniqueValue&&d?.nameGroup); },
  listAllBoundIds(){ return (characters||[]).reduce((a,c,i)=>{ if(c&&this.isBound(i)) a.push(i); return a; },[]); },
  toCacheKey(id){ return id; },
  getDisplayName(id){ return characters?.[id]?.name||"未知角色"; },
  onUpdateIndicator(id,has){ $("#character-updater-edit-button").toggleClass("has-update",!!has); },
  onAddUpdateBadge(id,info){
    const el=$(`#CharID${id}`); const name=el.find(".character_name_block"); if(!name.length) return;
    name.find(".character-update-notification").remove();
    const span=$(`
      <span class="character-update-notification" data-character-id="${id}">
        <i class="fa-solid fa-circle-exclamation"></i>
        <small>有可用更新</small>
      </span>`);
    span.on("click",e=>{ e.stopPropagation(); Popup.showUpdate(info); });
    name.append(span);
  },
  onRemoveUpdateBadge(id){ $(`#CharID${id}`).find(".character-update-notification").remove(); },
  onHeaderBoundState(){
    const $name=$("#current-character-name"), $status=$("#current-character-status"), id=this_chid;
    if(id==null){ $name.text("未选择角色"); $status.removeClass().text(""); CharacterUI.updateButton(false); return; }
    const ch=characters?.[id]; if(!ch) return;
    $name.text(ch.name);
    const bound=this.isBound(id);
    $status.removeClass().addClass(bound?"bound":"unbound").text(bound?"已绑定":"未绑定");
    if(!bound){ CharacterUI.updateButton(false); this.onRemoveUpdateBadge(id); }
  },
  afterBatch(updates){
    $(".character-update-notification").remove();
    updates.forEach(u=>{
      const info={ characterId:u.id, characterName:u.name, currentTimestamp:u.currentTimestamp, latestTimestamp:u.latestTimestamp, updateNote:u.updateNote, linkAddress:u.linkAddress, serverData:u.serverData };
      this.onAddUpdateBadge(u.id,info);
    });
    const cur=this.getCurrentId();
    if(cur!=null){
      const has=updates.some(u=>u.id===cur);
      this.onUpdateIndicator(cur,has);
      if(!has&&this.isBound(cur)) setTimeout(()=>CharacterUI.checkCurrent(),800);
    }
    console.log(`[小白X] 云端检查完成，发现 ${updates.length} 个角色有更新`);
  },
  onAnyHasUpdates(){ }
};
const CharacterUpdater=UpdaterFactory(CharacterAdapter);

/* 预设区 - 存储 */
const PresetStore=(()=>{
  const DEFAULT_CHARACTER_ID=100000;
  const BINDING_KEY="binding";

  const deepClone=(obj)=>{
    if(obj==null) return obj;
    try{ return structuredClone(obj); }catch{ try{ return JSON.parse(JSON.stringify(obj)); }catch{ return obj; } }
  };

  const isPlainObject=(value)=>!!value&&typeof value==="object"&&!Array.isArray(value);

  const sanitizeBinding=(raw)=>{
    if(!isPlainObject(raw)) return null;
    const payload={
      uniqueValue:String(raw.uniqueValue||""),
      timestamp:String(raw.timestamp||""),
      nameGroup:String(raw.nameGroup||""),
      linkAddress:String(raw.linkAddress||""),
      updateNote:String(raw.updateNote||""),
    };
    if(!payload.uniqueValue && !payload.timestamp) return null;
    return payload;
  };

  const PM=()=>{ try{return getPresetManager("openai");}catch{return null;} };

  const getPreset=(name)=>{
    const pm=PM();
    if(!pm||!name) return null;
    try{ return pm.getCompletionPresetByName(name)||null; }
    catch{ return null; }
  };

  const ensurePromptOrderEntry=(preset,create=false)=>{
    if(!preset) return null;
    if(!Array.isArray(preset.prompt_order)){
      if(!create) return null;
      preset.prompt_order=[];
    }
    let entry=preset.prompt_order.find(item=>Number(item?.character_id)===DEFAULT_CHARACTER_ID);
    if(!entry && create){
      entry={ character_id:DEFAULT_CHARACTER_ID, order:[] };
      preset.prompt_order.push(entry);
    }
    return entry||null;
  };

  const readExt=(name)=>{
    const preset=getPreset(name);
    if(!preset) return {};
    const entry=ensurePromptOrderEntry(preset,false);
    if(!entry||!isPlainObject(entry.xiaobai_ext)) return {};
    return deepClone(entry.xiaobai_ext);
  };

  const readLegacyBinding=(name)=>{
    try{
      const pm=PM(); if(!pm||!name) return null;
      const extVal=pm.readPresetExtensionField?.({ path:"extensions.presetdetailnfo", name });
      const val=(extVal===undefined||extVal===null)?pm.readPresetExtensionField?.({ path:"presetdetailnfo", name }):extVal;
      return sanitizeBinding(val);
    }catch{return null;}
  };

  const syncTarget=(target,source)=>{
    if(!target||!source) return;
    Object.keys(target).forEach(k=>{ if(!Object.prototype.hasOwnProperty.call(source,k)) delete target[k]; });
    Object.assign(target,source);
  };

  const updateExt=async(name,mutator)=>{
    const pm=PM(); if(!pm||!name) return false;
    const preset=getPreset(name); if(!preset) return false;
    const clone=deepClone(preset);
    const entry=ensurePromptOrderEntry(clone,true);
    entry.xiaobai_ext=isPlainObject(entry.xiaobai_ext)?entry.xiaobai_ext:{};
    const ctx=entry.xiaobai_ext;
    mutator(ctx);
    if(!isPlainObject(ctx)||!Object.keys(ctx).length) delete entry.xiaobai_ext;
    try{
      await pm.savePreset(name,clone,{ skipUpdate:true });
      syncTarget(preset,clone);
      const activeName=PM()?.getSelectedPresetName?.();
      if(activeName&&activeName===name){
        if(Object.prototype.hasOwnProperty.call(clone,'prompt_order')){
          try{ oai_settings.prompt_order=deepClone(clone.prompt_order); }
          catch{ oai_settings.prompt_order=clone.prompt_order; }
        }
        if(Object.prototype.hasOwnProperty.call(clone,'prompts')){
          try{ oai_settings.prompts=deepClone(clone.prompts); }
          catch{ oai_settings.prompts=clone.prompts; }
        }
      }
      return entry.xiaobai_ext?deepClone(entry.xiaobai_ext):null;
    }catch(err){ console.error("[PresetStore] 保存失败",err); throw err; }
  };

  return {
    getPM:PM,
    currentName(){ try{return PM()?.getSelectedPresetName?.()||"";}catch{return"";} },
    read(name){
      const ext=readExt(name);
      return sanitizeBinding(ext[BINDING_KEY])||readLegacyBinding(name);
    },
    readMerged(name){ return this.read(name); },
    readLocal(name){ const ext=readExt(name); return sanitizeBinding(ext[BINDING_KEY]); },
    async write(name,data){
      const payload=sanitizeBinding(data);
      await updateExt(name,ext=>{
        if(payload) ext[BINDING_KEY]=payload;
        else delete ext[BINDING_KEY];
      });
      return true;
    },
    remove(name){ return updateExt(name,ext=>{ delete ext[BINDING_KEY]; }); },
    isBound(name){ const d=this.read(name); return !!(d?.uniqueValue&&d?.timestamp); },
    cleanupOrphans(){ return 0; },
    allBound(){
      try{
        const pm=PM(); const names=pm?.getAllPresets?.()||[];
        return names.filter(n=>n&&this.isBound(n));
      }catch{ return []; }
    },
    updateExt,
    readExt(name){ return readExt(name); },
  };
})();

/* 预设区 - 适配器 */
const PresetAdapter={
  fallbackName:"Preset",
  getCurrentId(){ return PresetStore.currentName(); },
  getLocalData(name){ return PresetStore.readMerged(name); },
  async setLocalData(name,data){ return PresetStore.write(name,data); },
  isBound(name){ return PresetStore.isBound(name); },
  listAllBoundIds(){ return PresetStore.allBound(); },
  toCacheKey(name){ return `preset:${name}`; },
  getDisplayName(name){ return name; },
  onUpdateIndicator(name,has){ $("#preset-updater-edit-button").toggleClass("has-update",!!has); },
  onAddUpdateBadge(){}, onRemoveUpdateBadge(){},
  getLocalTimestampForCompare(name){
    try{ return (PresetStore.readLocal(name)?.timestamp)||""; }catch{ return ""; }
  },
  onHeaderBoundState(){
    const $name=$("#prb-current-preset"), $status=$("#current-preset-status"); const name=this.getCurrentId();
    if(!name){ $name.text("未选择预设"); $status.removeClass().text(""); this.onUpdateIndicator(name,false); return; }
    let displayName=name;
    try{
      const local=PresetStore.readMerged(name);
      const ng=local?.nameGroup;
      displayName=ng || (typeof Tools?.nameToServer==="function" ? Tools.nameToServer(name||"","Preset") : name) || name;
    }catch{}
    $name.text(displayName);
    let bound=false; try{ const local=PresetStore.readMerged(name); bound=!!(local?.uniqueValue && local?.timestamp); }catch{}
    $status.removeClass().addClass(bound?"bound":"unbound").text(bound?"已绑定":"未提醒");
    if(!bound) this.onUpdateIndicator(name,false);

  },
  afterBatch(updates){
    try{ cleanPresetDropdown(); }catch{}
    const cur=this.getCurrentId(); const curHas=updates.some(u=>u.id===cur);
    try{ PresetUI.setButton(curHas); }catch{}
    this.onUpdateIndicator(cur,curHas);
    if(cur&&this.isBound(cur)&&!curHas){ setTimeout(()=>PresetUI.checkCurrent(),400); }
  },
  onAnyHasUpdates(){ }
};
const PresetUpdater=UpdaterFactory(PresetAdapter);


/* 预设区 - 弹窗与提示 */
const Popup={
  fmt(ts){ return ts?new Date(ts).toLocaleDateString():"未知"; },
  async showUpdate(info){
    const hasUpdate=info?.latestTimestamp && info.latestTimestamp!==info.currentTimestamp;
    const ann=Tools.sanitize(info?.updateNote||"暂无公告");
    const url=info?.linkAddress||""; const okUrl=url&&Tools.validUrl(url); const urlShow=okUrl?Tools.sanitize(url):"";
    let charBookName=null;
    if(info?.characterId!=null && typeof characters!=="undefined"){ const ch=characters[info.characterId]; charBookName=ch?.data?.character_book?.name||null; }
    const $popup=$('<div class="character-update-popup"></div>');
    const title=$('<h3/>').text(`${info?.characterName||"未知"} 更新信息`);
    $popup.append(title);
    $popup.append(`<div class="update-description"><strong style="color:#666;display:block;text-align:left;">最新更新公告:</strong><div class="announcement-content" style="word-break:break-all;user-select:none;pointer-events:none;text-align:left;">${ann}</div></div>`);
    $popup.append(`<div class="update-description"><strong style="color:#666;display:block;text-align:left;">最新更新地址:</strong><div class="link-content" style="word-break:break-all;text-align:left;">${urlShow||(url?"该链接地址非dc或rentry来源, 不予显示":"无链接地址")}</div></div>`);
    if(info?.characterId!=null){
      $popup.append(`<div class="lorebook-info"><strong style="color:#666;display:block;text-align:left;">角色卡绑定的世界书信息</strong><div style="margin:8px;display:flex;align-items:center;justify-content:space-between;"><span id="xiaobaix-character-book">${charBookName?Tools.sanitize(charBookName):"无"}</span><div style="display:flex;align-items:center;gap:6px;"><input type="checkbox" id="xiaobaix_lorebook_info_delete" style="bottom:-3px;"><label for="xiaobaix_lorebook_info_delete" style="margin-right:10px;">清除世界书</label></div></div></div><hr class="sysHR" style="margin-top:15px;">`);
    }
    $popup.append(`<div class="update-container" style="display:flex;align-items:center;gap:15px;"><div class="update-status" style="flex:1;"><div style="margin-top:20px;" class="status-message ${hasUpdate?"status-update":"status-success"}"><i class="fa-solid ${hasUpdate?"fa-exclamation-circle":"fa-check-circle"}"></i>${hasUpdate?"有可用更新":"已是最新版本"}</div></div>${hasUpdate?`<button class="menu_button" onclick="window.open('${url}','_blank','noopener,noreferrer')" style="margin-top:10px;"><i class="fa-solid fa-external-link-alt"></i> 更新地址</button>`:""}</div><hr class="sysHR" style="margin-bottom:15px;">`);
    $popup.append(`<div class="update-timestamps" style="color:#666;"><div><strong style="color:#666;">上次更新时间:</strong> ${Popup.fmt(info?.currentTimestamp)}</div><div><strong style="color:#666;">最新更新时间:</strong> ${Popup.fmt(info?.latestTimestamp)}</div></div>`);
    const $btns=$(`<div class="xiaobaix-confirm-buttons"><button class="xiaobaix-confirm-yes" style="background-color: var(--crimson70a);">确认</button><button class="xiaobaix-confirm-no">取消</button></div>`);
    $popup.append($btns);
    const $modal=$('<div class="xiaobaix-confirm-modal"></div>').append($('<div class="xiaobaix-confirm-content"></div>').append($popup));
    $("body").append($modal);
    $btns.find(".xiaobaix-confirm-yes").on("click",function(){ $modal.remove(); });
    const close=()=>{ $modal.remove(); $(document).off("keydown.xiaobaixconfirm"); };
    $btns.find(".xiaobaix-confirm-no").on("click",close);
    $modal.on("click",function(e){ if(e.target===this) close(); });
    $(document).on("keydown.xiaobaixconfirm",e=>{ if(e.key==="Escape") close(); });
  }
};

Popup.showPresetOverview=async function(){
  const cur=PresetAdapter.getCurrentId();
  const names=PresetAdapter.listAllBoundIds()||[];
  const ordered=[cur,...names.filter(n=>n&&n!==cur)];
  const $popup=$('<div class="preset-overview-popup" style="overflow-y:auto; max-height: 600px;"></div>');
  $popup.append("<h3>预设更新总览</h3>");
  ordered.forEach((name,idx)=>{
    if(!name) return;
  const localMerged=PresetAdapter.getLocalData(name)||{};
  /** @type {any} */
  const localDetail=localMerged;
    const localTs=PresetAdapter.getLocalTimestampForCompare(name)||"";
    const cloud=Cache.getCloud(PresetAdapter.toCacheKey(name))||null;
    const hasUpdate=!!(cloud?.timestamp&&cloud.timestamp!==localTs);
  const url=(cloud?.link_address ?? localDetail?.linkAddress) || "";
    const okUrl=url&&Tools.validUrl(url); const urlShow=okUrl?Tools.sanitize(url):"";
  const ann=Tools.sanitize((cloud?.update_notice ?? localDetail?.updateNote) || "");
    const $section=$('<div class="preset-item" style="border-bottom:1px solid var(--SmartThemeBorderColor,var(--SmartThemeBodyColor,#444))"></div>');
    const $header=$(`
      <div class="preset-item-header" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;">
        <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          <b>预设名称：</b><span class="preset-name"></span>
        </div>
        <div class="header-right" style="display:flex;align-items:center;gap:8px;">${hasUpdate?'<small class="preset-update-badge" style="color:#28a745;cursor:pointer;">有可用更新</small>':""}</div>
      </div>`);
    $header.find(".preset-name").text(name);
    const $body=$('<div class="preset-item-body" style="padding:0 0 8px 0; text-align: left;"></div>'); $body.css("display",idx===0?"block":"none");
    $body.append(`<div class="update-description" style="margin:4px 0;"><strong style="color:#666;">公告：</strong><div style="word-break:break-all;white-space:pre-wrap;">${ann||"无"}</div></div>`);
    $body.append(`<div class="update-description" style="margin:4px 0;"><strong style="color:#666;">更新链接：</strong><div style="word-break:break-all;">${urlShow?`<a href="${urlShow}" target="_blank" rel="noopener noreferrer">${urlShow}</a>`:(url?"该链接地址非dc或rentry来源, 不予显示":"无链接地址")}</div></div>`);
    $body.append(`<div class="update-timestamps" style="color:#666;margin:4px 0;"><strong style="color:#666;">版本时间：</strong>上次 ${Popup.fmt(localTs)} | 最新 ${Popup.fmt(cloud?.timestamp||localTs)}</div>`);
    $section.append($header,$body);
    $header.on("click",()=>{ $body.toggle(); });
    $header.find(".preset-update-badge").on("click",(e)=>{ e.stopPropagation(); if(okUrl) window.open(url,"_blank","noopener,noreferrer"); });
    $popup.append($section);
    if(idx===0 && ordered.length>1){ $popup.append('<hr class="sysHR" style="margin:6px 0;">'); $popup.append('<div style="margin:4px 0 8px;font-weight:bold;">其他预设</div>'); }
  });
  const $btns=$('<div class="xiaobaix-confirm-buttons"><button class="xiaobaix-confirm-yes">关闭</button></div>');
  const $modal=$('<div class="xiaobaix-confirm-modal"></div>').append($('<div class="xiaobaix-confirm-content"></div>').append($popup).append($btns));
  $("body").append($modal);
  const close=()=>{ $modal.remove(); $(document).off("keydown.presetOverview"); };
  $btns.find(".xiaobaix-confirm-yes").on("click",close);
  $modal.on("click",function(e){ if(e.target===this) close(); });
  $(document).on("keydown.presetOverview",e=>{ if(e.key==="Escape") close(); });
};

const CharacterUI={
  addButton(){
    if(!isFeatureEnabled()) return;
    if($("#character-updater-edit-button").length) return;
    $(".form_create_bottom_buttons_block").prepend(`<div id="character-updater-edit-button" class="menu_button fa-solid fa-cloud-arrow-down interactable" title="查看角色卡云端公告与更新情况"></div>`);
    $("#character-updater-edit-button").on("click",async ()=>{
      const id=CharacterAdapter.getCurrentId();
      if(id==null) return Tools.toast("未选择角色","warning");
      if(!CharacterAdapter.isBound(id)) return Tools.toast("角色尚未绑定，请长按“当前角色”3秒绑定","info");
      try{
        const local=CharacterAdapter.getLocalData(id);
        const cloud=Cache.getCloud(CharacterAdapter.toCacheKey(id));
        await Popup.showUpdate({
          characterId:id,
          characterName:CharacterAdapter.getDisplayName(id),
          currentTimestamp:local?.timestamp||new Date().toISOString(),
          latestTimestamp:(cloud?.timestamp||local?.timestamp||new Date().toISOString()),
          updateNote:(cloud?.update_notice ?? local?.updateNote ?? ""),
          linkAddress:(cloud?.link_address ?? local?.linkAddress ?? "")
        });
      }catch(e){ console.error("显示角色信息失败",e); Tools.toast("显示角色信息失败","error"); }
    });
  },
  updateButton(has){ $("#character-updater-edit-button").toggleClass("has-update",!!has); },
  async checkCurrent(){
    if(!isFeatureEnabled()) return this.updateButton(false);
    const id=CharacterAdapter.getCurrentId();
    if(id==null||!CharacterAdapter.isBound(id)) return this.updateButton(false);
    const local=CharacterAdapter.getLocalData(id);
    const cloud=Cache.getCloud(CharacterAdapter.toCacheKey(id));
    if(!cloud) return this.updateButton(false);
    const has=cloud.timestamp&&cloud.timestamp!==local?.timestamp;
    this.updateButton(has);
    if(has){
      CharacterAdapter.onAddUpdateBadge(id,{ characterId:id, characterName:CharacterAdapter.getDisplayName(id), currentTimestamp:local?.timestamp, latestTimestamp:cloud.timestamp, updateNote:cloud.update_notice||"无更新说明", linkAddress:cloud.link_address||"", serverData:cloud });
    }else CharacterAdapter.onRemoveUpdateBadge(id);
  }
};

/* 预设区 - UI 控件 */
const PresetUI={
  ensureGreenCSS(){ if(document.getElementById("preset-updater-green-style")) return; const style=document.createElement("style"); style.id="preset-updater-green-style"; style.textContent=`#preset-updater-edit-button.has-update{ color:#28a745 !important; }`; document.head.appendChild(style); },
  addButton(){
    if(!isFeatureEnabled()) return;
    if(document.getElementById("preset-updater-edit-button")) return;
    const $sel=$("#settings_preset_openai"); if(!$sel.length) return;
    const $row=$sel.closest(".flex-container.flexNoGap"); let $c=$row.find(".flex-container.marginLeft5.gap3px").first();
    if(!$c.length){ $c=$(".flex-container.marginLeft5.gap3px").first(); if(!$c.length) return; }
    const btn=$(`<div id="preset-updater-edit-button" class="menu_button fa-solid fa-cloud-arrow-down interactable" title="查看预设云端公告与更新情况"></div>`);
    btn.on("click",async ()=>{
      const name=PresetAdapter.getCurrentId();
      if(!name) return Tools.toast("未选择预设","warning","预设更新");
      if(!PresetAdapter.isBound(name)) return Tools.toast("该预设尚未有更新提醒，请长按“当前预设”3秒绑定","info","预设更新");
      try{ await Popup.showPresetOverview(); }catch(e){ console.error("显示预设信息失败",e); Tools.toast("显示预设信息失败","error","预设更新"); }
    });
    $c.append(btn); this.ensureGreenCSS();
  },
  setButton(has){ $("#preset-updater-edit-button").toggleClass("has-update",!!has); },
  async checkCurrent(){
    let highlight=false;
    if(isFeatureEnabled()){
      const name=PresetAdapter.getCurrentId();
      if(name&&PresetAdapter.isBound(name)){
        const cloud=Cache.getCloud(PresetAdapter.toCacheKey(name));
        if(cloud){
          const localTs=PresetAdapter.getLocalTimestampForCompare(name);
          highlight=!!(cloud.timestamp&&cloud.timestamp!==localTs);
        }
      }
    }
    this.setButton(highlight);

  }
};

function cleanPresetDropdown(){
  const $sel=$("#settings_preset_openai"); if(!$sel.length) return;
  const $opt0=$sel.find('option[value="0"]').first();
  if($opt0.length){ let txt=$opt0.text(); txt=txt.replace(/\s*\(有可用更新\)\s*$/,""); $opt0.text(txt).removeData("baseText"); }
  $sel.find("option").each(function(){ const $opt=$(this); let t=$opt.text(); t=t.replace(/^🆕/,""); $opt.text(t).removeData("baseText"); });
}

const Menu={
  show(type, forWhat="character"){
    const $menu=$(`#${type}-character-menu`);
    $menu.attr('data-for', forWhat);
    $(".character-menu-overlay").hide();
    this.updateUUID(type, forWhat);
    $menu.show();
  },
  close(type){ $(`#${type}-character-menu`).hide(); $(`#${type}-password,#${type}-update-note,#${type}-png-url,#${type}-name`).val(""); },
  updateUUID(type, forWhat="character"){
    const $menu=$(`#${type}-character-menu`);
    const ctx=$menu.attr('data-for')||forWhat;
    const A= ctx==="preset" ? PresetAdapter : CharacterAdapter;

    const id=A.getCurrentId(); if(id==null) return;
    const d=A.getLocalData(id);

    ({ bind:()=>$("#bind-uuid-display").text("将自动生成"),
       rebind:()=>{ $("#rebind-current-uuid").text(d?.uniqueValue||"未绑定"); $("#rebind-new-uuid").text("将自动生成"); },
       update:()=>$("#update-uuid-display").text(d?.uniqueValue||"未绑定")
    })[type]?.();
  },
  form(type){
    const readValue=(selector)=>{
      const raw=$(selector).val();
      return typeof raw==="string"?raw.trim():"";
    };
    return {
      password: readValue(`#${type}-password`),
      updateNote: readValue(`#${type}-update-note`) || (type==="bind"?"初始版本": type==="rebind"?"重新绑定":"版本更新"),
      pngUrl: readValue(`#${type}-png-url`),
      name: $(`#${type}-name`).length ? readValue(`#${type}-name`) : ""
    };
  },
  validate(type,data){
    const rules=[
      [!data.password||data.password.length<4,"密码至少需要4个字符"],
      [data.pngUrl && !Tools.validUrl(data.pngUrl),"链接地址只能使用受信任的域名(rentry,dc)"],
      [data.updateNote.length>300,"更新公告超过300字限制"],
      [data.pngUrl.length>300,"链接地址超过300字限制"],
    ];
    for(const [cond,msg] of rules){ if(cond) return Tools.toast(msg,"error",$("#current-preset-info-trigger").is(":visible")?"预设更新":"角色卡更新"), false; }
    return true;
  },
  bindCharacterTriggers(){
    const t=$("#current-character-info-trigger"); if(!t.length) return;
    function characterHeader(type){
      $("#bind-character-menu .menu-header h3").text("绑定角色卡");
      $("#rebind-character-menu .menu-header h3").text("重绑定角色卡");
      $("#update-character-menu .menu-header h3").text("更新角色卡");
      $("#bind-character-menu .uuid-display label").text("角色卡UUID:");
      $("#rebind-character-menu .uuid-display").eq(0).find("label").text("当前UUID:");
      $("#rebind-character-menu .uuid-display").eq(1).find("label").text("新UUID:");
      $("#update-character-menu .uuid-display label").text("角色卡UUID:");
      $("#bind-name,#rebind-name").closest(".form-group").remove();
      Menu.show(type,"character");
    }
    Press.bind(t,
      (e)=>{ e.stopPropagation(); const id=CharacterAdapter.getCurrentId(); if(id==null) return Tools.toast("请先选择一个角色","warning"); characterHeader(CharacterAdapter.isBound(id)?"rebind":"bind"); },
      (e)=>{ e.stopPropagation(); const id=CharacterAdapter.getCurrentId(); if(id==null) return Tools.toast("请先选择一个角色","warning"); if(CharacterAdapter.isBound(id)) { characterHeader("update"); } else Tools.toast("角色尚未绑定，请长按3秒进行绑定","info"); }
    );
  },
  bindPresetTriggers(){
    const t=$("#current-preset-info-trigger"); if(!t.length) return;
    function presetHeader(type){
      $("#bind-character-menu .menu-header h3").text("绑定预设");
      $("#rebind-character-menu .menu-header h3").text("重绑定预设");
      $("#update-character-menu .menu-header h3").text("更新预设");
      $("#bind-character-menu .uuid-display label").text("预设UUID:");
      $("#rebind-character-menu .uuid-display").eq(0).find("label").text("当前UUID:");
      $("#rebind-character-menu .uuid-display").eq(1).find("label").text("新UUID:");
      $("#update-character-menu .uuid-display label").text("预设UUID:");
      const name=PresetAdapter.getCurrentId(), data=PresetAdapter.getLocalData(name);
      if(type==="bind"){
        $("#bind-uuid-display").text("将自动生成");
        if(!$("#bind-name").length) $(`<div class="form-group"><label for="bind-name">名称(云端显示):</label><input type="text" id="bind-name" placeholder="输入用于云端显示/校验的名称"></div>`).insertBefore($("#bind-password").closest(".form-group"));
        $("#bind-name").val(Tools.nameToServer(name||"","Preset"));
      }
      if(type==="rebind"){
        $("#rebind-current-uuid").text(data?.uniqueValue||"未绑定");
        $("#rebind-new-uuid").text("将自动生成");
        if(!$("#rebind-name").length) $(`<div class="form-group"><label for="rebind-name">名称(云端显示):</label><input type="text" id="rebind-name" placeholder="输入用于云端显示/校验的名称"></div>`).insertBefore($("#rebind-password").closest(".form-group"));
        $("#rebind-name").val(data?.nameGroup||Tools.nameToServer(name||"","Preset"));
      }
      if(type==="update"){ $("#update-uuid-display").text(data?.uniqueValue||"未绑定"); }
      Menu.show(type,"preset");
    }
    Press.bind(t,
      (e)=>{ e.stopPropagation(); const name=PresetAdapter.getCurrentId(); if(!name) return Tools.toast("未选择预设","warning","预设更新"); presetHeader(PresetAdapter.isBound(name)?"rebind":"bind"); },
      (e)=>{ e.stopPropagation(); const name=PresetAdapter.getCurrentId(); if(!name) return Tools.toast("未选择预设","warning","预设更新"); if(PresetAdapter.isBound(name)) presetHeader("update"); else Tools.toast("预设尚未设置更新提醒，请长按3秒进行绑定设置","info","预设更新"); }
    );

    $(document.body)
    .off("click.preset","#bind-confirm").on("click.preset","#bind-confirm", async (e)=>{
      if(!$("#current-preset-info-trigger").length || !$("#bind-character-menu[data-for='preset']").is(":visible")) return;
      e.stopImmediatePropagation();
      const name=PresetAdapter.getCurrentId(); const form=Menu.form("bind"); if(!Menu.validate("bind",form)) return;
      const $btn=$("#bind-confirm"), old=$btn.text();
      try{
        $btn.prop("disabled",true).text("处理中...");
        const r=await PresetUpdater.bind(name,form);
  if(r.success){ Tools.toast("预设绑定成功！","success","预设更新"); Menu.close("bind"); setTimeout(()=>PresetAdapter.onHeaderBoundState(),300); }
        else Tools.toast(`操作失败: ${r.error}`,"error","预设更新");
      }finally{ $btn.prop("disabled",false).text(old); }
    })
    .off("click.preset","#rebind-confirm").on("click.preset","#rebind-confirm", async (e)=>{
      if(!$("#current-preset-info-trigger").length || !$("#rebind-character-menu[data-for='preset']").is(":visible")) return;
      e.stopImmediatePropagation();
      const name=PresetAdapter.getCurrentId(); const form=Menu.form("rebind"); if(!Menu.validate("rebind",form)) return;
      const $btn=$("#rebind-confirm"), old=$btn.text();
      try{
        $btn.prop("disabled",true).text("处理中...");
        await PresetAdapter.setLocalData(name,{});
        const r=await PresetUpdater.bind(name,form);
  if(r.success){ Tools.toast("预设重新绑定成功！","success","预设更新"); Menu.close("rebind"); setTimeout(()=>PresetAdapter.onHeaderBoundState(),300); }
        else Tools.toast(`操作失败: ${r.error}`,"error","预设更新");
      }finally{ $btn.prop("disabled",false).text(old); }
    })
    .off("click.preset","#update-confirm").on("click.preset","#update-confirm", async (e)=>{
      if(!$("#current-preset-info-trigger").length || !$("#update-character-menu[data-for='preset']").is(":visible")) return;
      e.stopImmediatePropagation();
      const name=PresetAdapter.getCurrentId(); const form=Menu.form("update"); if(!Menu.validate("update",form)) return;
      const $btn=$("#update-confirm"), old=$btn.text();
      try{
        $btn.prop("disabled",true).text("处理中...");
        const r=await PresetUpdater.update(name,form,false);
  if(r.success){ Tools.toast("预设公开更新成功！","success","预设更新"); Menu.close("update"); setTimeout(()=>{ PresetAdapter.onHeaderBoundState(); PresetUI.checkCurrent(); },300); }
        else Tools.toast(`操作失败: ${r.error}`,"error","预设更新");
      }finally{ $btn.prop("disabled",false).text(old); }
    })
    .off("click.preset","#update-silent").on("click.preset","#update-silent", async (e)=>{
      if(!$("#current-preset-info-trigger").length || !$("#update-character-menu[data-for='preset']").is(":visible")) return;
      e.stopImmediatePropagation();
      const name=PresetAdapter.getCurrentId(); const form=Menu.form("update"); if(!Menu.validate("update",form)) return;
      const $btn=$("#update-silent"), old=$btn.text();
      try{
        $btn.prop("disabled",true).text("静默更新中...");
        const r=await PresetUpdater.update(name,form,true);
  if(r.success){ Tools.toast("预设静默更新成功！","success","预设更新"); Menu.close("update"); setTimeout(()=>{ PresetAdapter.onHeaderBoundState(); PresetUI.checkCurrent(); },300); }
        else Tools.toast(`操作失败: ${r.error}`,"error","预设更新");
      }finally{ $btn.prop("disabled",false).text(old); }
    });

    ["bind","rebind","update"].forEach(type=>{
      $(document.body).off("click.presetClose",`#${type}-menu-close, #${type}-cancel`).on("click.presetClose",`#${type}-menu-close, #${type}-cancel`,(e)=>{
        if(!$("#current-preset-info-trigger").length) return; e.stopImmediatePropagation(); Menu.close(type);
      });
    });
  }
};




async function addMenusHTML(){
  try{ const res=await fetch(`${extensionFolderPath}/character-updater-menus.html`); if(res.ok) $("body").append(await res.text()); }
  catch(e){ console.error("[小白X-角色更新] 加载菜单HTML失败:",e); }
}

function startupCacheCleanup(){
  try{
    const pm=PresetStore.getPM(); const validPresets=new Set(pm?.getAllPresets?.()||[]); const all=Cache._all();
    Object.keys(all).forEach(k=>{
      if(k.startsWith("preset:")){ const name=k.slice(7); if(!validPresets.has(name)) Cache.remove(k); }
      else { const id=Number(k); if(!Number.isInteger(id)||!characters?.[id]) Cache.remove(k); }
    });
  }catch(e){ console.warn("[小白X] 启动清理缓存失败",e); }
}

function wireCharacter(){
  const action=(type, silent=false)=>async ()=>{
    if(!Cooldown.check()) return;
    const id=CharacterAdapter.getCurrentId(); if(id==null) return Tools.toast("请先选择一个角色","error");
    const form=Menu.form(type); if(!Menu.validate(type,form)) return;
    const btnId= type==="bind" ? "#bind-confirm" : type==="rebind" ? "#rebind-confirm" : silent ? "#update-silent" : "#update-confirm";
    const $btn=$(btnId), old=$btn.text();
    try{
      $btn.prop("disabled",true).text(silent? "静默更新中..." : "处理中...");
      if(type==="bind"||type==="rebind"){
        if(type==="rebind") await CharacterAdapter.setLocalData(id,{});
        const r=await CharacterUpdater.bind(id,form);
        if(r.success){ Tools.toast(type==="bind"?"角色绑定成功！":"角色重新绑定成功！","success"); Cooldown.start(30); Menu.close(type); setTimeout(()=>CharacterAdapter.onHeaderBoundState(),500); }
        else Tools.toast(`操作失败: ${r.error}`,"error");
      }else{
        const r=await CharacterUpdater.update(id,form, silent);
        if(r.success){ Tools.toast(silent?"角色静默更新成功！":"角色更新成功！","success"); Cooldown.start(30); Menu.close("update"); setTimeout(()=>{ CharacterAdapter.onHeaderBoundState(); CharacterUI.checkCurrent(); },500); }
        else Tools.toast(`操作失败: ${r.error}`,"error");
      }
    }catch(e){
      console.error(`${type}失败`,e);
      Tools.toast(e.isPasswordError?"密码错误，请检查密码":"操作失败，请检查网络连接","error");
    }finally{ $btn.prop("disabled",false).text(old); }
  };

  $(document.body)
  .off("click.cu","#bind-confirm").on("click.cu","#bind-confirm",action("bind"))
  .off("click.cu","#rebind-confirm").on("click.cu","#rebind-confirm",action("rebind"))
  .off("click.cu","#update-confirm").on("click.cu","#update-confirm",action("update",false))
  .off("click.cu","#update-silent").on("click.cu","#update-silent",action("update",true));

  ["bind","rebind","update"].forEach(type=>{
    $(document.body).off("click.cuClose",`#${type}-menu-close, #${type}-cancel`).on("click.cuClose",`#${type}-menu-close, #${type}-cancel`,()=>Menu.close(type));
  });

  $(document.body)
    .off("click.cuOverlay")
    .on("click.cuOverlay",".character-menu-overlay",function(e){ if(e.target===this){ e.stopPropagation(); } })
    .on("mousedown.cuOverlay",".character-menu-overlay",function(e){ if(e.target===this){ e.stopPropagation(); } })
    .on("click.cuContent",".character-menu-content",function(e){ e.stopPropagation(); })
    .on("mousedown.cuContent",".character-menu-content",function(e){ e.stopPropagation(); });
}

function wireEvents(){
  const handlers={
    [event_types.APP_READY]: async ()=>{
      if(!isFeatureEnabled()) return;
      try{ PresetStore.cleanupOrphans?.(); }catch{}
      try{ startupCacheCleanup(); }catch{}
      await CharacterUpdater.batchStartupCheck();
      await PresetUpdater.batchStartupCheck();
      try{ cleanPresetDropdown(); }catch{}

    },
    [event_types.CHAT_CHANGED]: async ()=>{
      if(!isFeatureEnabled()) return;
      CharacterAdapter.onHeaderBoundState();
      if(CharacterAdapter.getCurrentId()!=null && CharacterAdapter.isBound(CharacterAdapter.getCurrentId())) await CharacterUI.checkCurrent();

    },
    [event_types.CHARACTER_EDITED]: ()=>{ if(isFeatureEnabled()) CharacterAdapter.onHeaderBoundState(); },
    [event_types.CHARACTER_PAGE_LOADED]: async ()=>{
      if(!isFeatureEnabled()) return;
      const ids=CharacterAdapter.listAllBoundIds();
      ids.forEach(id=>{
        const d=CharacterAdapter.getLocalData(id); const c=Cache.getCloud(CharacterAdapter.toCacheKey(id));
        if(d&&c&&c.timestamp&&c.timestamp!==d.timestamp){
          CharacterAdapter.onAddUpdateBadge(id,{ characterId:id, characterName:CharacterAdapter.getDisplayName(id), currentTimestamp:d.timestamp, latestTimestamp:c.timestamp, updateNote:c.update_notice||"无更新说明", linkAddress:c.link_address||"", serverData:c });
        }
      });
    },
    [event_types.SETTINGS_UPDATED]: async ()=>{
      if(!isFeatureEnabled()) {
        cleanup();
        return;
      }

      try{ PresetUI.addButton(); }catch{}
      try{ cleanPresetDropdown(); }catch{}
      PresetAdapter.onHeaderBoundState();
      await PresetUI.checkCurrent();

    },

  };
  Object.entries(handlers).forEach(([evt,fn])=>{ moduleState.eventHandlers[evt]=fn; eventSource.on(evt,fn); });
}

async function addMenusAndBind(){
  if(!isFeatureEnabled()) {
    cleanup();
    return;
  }
  await addMenusHTML();
  CharacterUI.addButton(); PresetUI.addButton();
  Menu.bindCharacterTriggers(); Menu.bindPresetTriggers();
  CharacterAdapter.onHeaderBoundState(); PresetAdapter.onHeaderBoundState();
  wireCharacter(); wireEvents();
  try{ cleanPresetDropdown(); }catch{}

}

function cleanup(){
  try{
    const emitter=/** @type {any} */(eventSource);
    Object.entries(moduleState.eventHandlers).forEach(([evt,fn])=>{
      try{
        if(typeof emitter.off==="function") emitter.off(evt,fn);
        else if(typeof emitter.removeListener==="function") emitter.removeListener(evt,fn);
        else emitter.removeEventListener?.(evt,fn);
      }catch{}
    });
  }catch{}
  moduleState.eventHandlers={};
  try{ $(document.body).off(".cu").off(".cuClose").off(".cuOverlay").off(".cuContent").off(".preset").off(".presetClose"); }catch{}
  try{ $(document).off(".lwbPreset"); }catch{}
  try{ if(moduleState.observers?.presetButton){ try{ moduleState.observers.presetButton.disconnect(); }catch{} moduleState.observers.presetButton=null; } }catch{}
  try{ if(moduleState.timers?.presetAddButtonTimer){ clearTimeout(moduleState.timers.presetAddButtonTimer); moduleState.timers.presetAddButtonTimer=null; } }catch{}
  try{ if(typeof Cooldown?.stop==="function") Cooldown.stop(); }catch{}
  try{ $(".character-menu-overlay, #character-updater-edit-button, .character-update-notification, .xiaobaix-confirm-modal").remove(); }catch{}
  try{ $("#preset-updater-edit-button, #preset-updater-green-style").remove(); }catch{}
  try{ cleanPresetDropdown(); }catch{}

  try{ Cache.clear(); }catch{}
  moduleState.isInitialized=false;
}

async function initCharacterUpdater(){
  if(!isFeatureEnabled()) {
    cleanup();
    return;
  }

  if(moduleState.isInitialized) return;
  try{
    const registrar=/** @type {any} */ (globalThis).registerModuleCleanup;
    if(typeof registrar==="function") registrar(MODULE_NAME,cleanup);
  }catch{}
  await addMenusAndBind();
  moduleState.isInitialized=true;
}

export { initCharacterUpdater };
