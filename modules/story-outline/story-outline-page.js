import { DOMPurify } from '../../../../../../lib.js';
import { tryParseJson } from '../../shared/common/json-candidate.js';
const D = { stage: 0, deviationScore: 0, simulationTarget: 5, meta: { truth: null, onion_layers: null, timeline: null, user_guide: null }, world: {}, maps: { outdoor: { nodes: [] }, indoor: null }, sceneSetup: null, contacts: { strangers: [], contacts: [{ name: "{{characterName}}", avatar: "", color: "#555", location: "在线", info: "", online: true, worldbookUid: "__CHARACTER_CARD__", messages: [], summarizedCount: 0 }] } };
let charSmsHistory = { messages: [], summarizedCount: 0, summaries: {} };
const $ = (t) => document.getElementById(t), $$ = (t) => document.querySelectorAll(t), isMob = () => innerWidth <= 550, escHtml = (t) => t.replace(/[&<>"']/g, ((t2) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t2])), h = (t) => escHtml(String(t ?? "")), stripXml = (t) => t ? t.replace(/<(\w+)[^>]*>[\s\S]*?<\/\1>/g, "").replace(/<[^>]+\/?>/g, "").trim() : "", parseLinks = (t) => h(t).replace(/\*\*([^*]+)\*\*/g, '<span class="loc-lk" data-loc="$1">$1</span>'), PARENT_ORIGIN = (() => {
  try {
    return new URL(document.referrer).origin;
  } catch {
    return window.location.origin;
  }
})(), post = (t, e = {}) => parent.postMessage({ source: "LittleWhiteBox-OutlineFrame", type: t, ...e }, PARENT_ORIGIN), syncSimDueUI = () => {
  const t = (Number(D.simulationTarget) || 0) <= 0;
  $("btn-simulate")?.classList.toggle("btn-due", t), $("world-sim-ok")?.classList.toggle("btn-due", t);
}, BtnState = { load: (t, e) => {
  t.disabled = true, t._o = t.innerHTML, t.innerHTML = DOMPurify.sanitize(`<i class="fa-solid fa-spinner fa-spin"></i> ${e}`);
}, reset: (t, e) => {
  t.disabled = false, t.innerHTML = DOMPurify.sanitize(e || t._o);
} }, Req = { _p: {}, _id: 0, create(t) {
  const e = t + "_" + ++this._id;
  return this._p[t] = { id: e }, e;
}, get(t) {
  return this._p[t];
}, match(t) {
  const e = t?.split("_")[0];
  return this._p[e]?.id === t ? this._p[e] : null;
}, set(t, e) {
  Object.assign(this._p[t] || {}, e);
}, clear(t) {
  delete this._p[t];
} }, openM = (t) => $(t).classList.add("act"), closeM = (t) => $(t).classList.remove("act"), dirMap = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0], northeast: [1, -1], northwest: [-1, -1], southeast: [1, 1], southwest: [-1, 1] };
let playerLocation = "未知", curNode = null, drag = false, scale = 1, offX = 0, offY = 0, seed = 123456789, nodes = [], lines = [], anim = false, chatTgt = null, invTgt = null, selLoc = null, smsGen = false, selectedMapValue = "current";
const inner = $("inner"), svg = $("lines"), mapWrap = $("mapWrap"), popup = $("mob-pop"), chat = $("chat"), sidePop = $("side-pop"), rand = () => (seed = (9301 * seed + 49297) % 233280) / 233280, getCurInside = () => D.maps?.indoor?.[playerLocation] || null, snaps = () => [$("pop-hd")?.offsetHeight || 0, 0.3 * innerHeight, 0.65 * innerHeight];
let popH = 0, popDrag = false, popSY = 0, popSH = 0, popLv = 1;
const getStoredTheme = () => localStorage.getItem("lwb-theme") || "light", setTheme = (t) => {
  document.documentElement.setAttribute("data-theme", t), localStorage.setItem("lwb-theme", t);
}, toggleTheme = () => {
  const t = "dark" === getStoredTheme() ? "light" : "dark";
  setTheme(t);
};
(() => {
  const t = getStoredTheme();
  "dark" === t && setTheme("dark");
})();
$("btn-theme")?.addEventListener("click", toggleTheme);
const inds = popup.querySelectorAll(".pop-h-ind span"), setPopH = (t) => {
  const e = snaps();
  popH = Math.max(e[0], Math.min(0.85 * innerHeight, t)), popup.style.height = popH + "px", popLv = e.map(((t2, e2) => [e2, Math.abs(popH - t2)])).sort(((t2, e2) => t2[1] - e2[1]))[0][0], inds.forEach(((t2, e2) => t2.classList.toggle("act", e2 === popLv)));
}, snapTo = (t) => {
  popLv = Math.max(0, Math.min(2, t)), setPopH(snaps()[popLv]);
}, openPop = (t = 1) => {
  popup.classList.add("act"), snapTo(t);
};
$("side-pop-handle").onclick = () => sidePop.classList.toggle("act"), $("pop-hd").onmousedown = (t) => {
  popDrag = true, popSY = t.clientY, popSH = popH || snaps()[1], popup.classList.add("drag"), t.preventDefault();
}, $("pop-hd").ontouchstart = (t) => {
  t.preventDefault(), popDrag = true, popSY = t.touches[0].clientY, popSH = popH || snaps()[1], popup.classList.add("drag");
}, document.onmousemove = (t) => {
  popDrag && setPopH(popSH + popSY - t.clientY);
}, document.ontouchmove = (t) => {
  popDrag && t.touches.length && (t.preventDefault(), setPopH(popSH + popSY - t.touches[0].clientY));
};
const endDrag = () => {
  popDrag && (popDrag = false, popup.classList.remove("drag"), snapTo(popLv));
};
document.onmouseup = endDrag, document.ontouchend = endDrag, document.ontouchcancel = endDrag;
const bindLinks = (t) => t.querySelectorAll(".loc-lk").forEach(((t2) => t2.onclick = (e) => {
  e.stopPropagation();
  const s = t2.dataset.loc, o = nodes.find(((t3) => t3.name === s));
  if (o) return panTo(o), void showInfo(o);
  const a = getCurInside(), n = a?.nodes?.find(((t3) => t3.name === s));
  n && ($("info-t").textContent = n.name, $("info-c").textContent = n.info || "暂无信息...", $("tip").classList.add("show"), $("btn-goto").classList.remove("show"), isMob() && ($("mob-info-t").textContent = n.name, $("mob-info-c").textContent = n.info || "暂无信息...", popup.classList.contains("act") || openPop(1)));
})), bindFold = (t) => t.querySelector(".fold-h").onclick = () => t.classList.toggle("exp");
$$(".modal-bd,.modal-x,.m-cancel").forEach(((t) => t.onclick = () => t.closest(".modal").classList.remove("act")));
const openChat = (t) => {
  chatTgt = t, $("chat-av").textContent = t.avatar, $("chat-av").style.background = t.color, $("chat-nm").textContent = t.name, $("chat-st").textContent = t.online ? "● 在线" : t.location, !t.worldbookUid || t.messages && t.messages.length ? renderMsgs() : post("LOAD_SMS_HISTORY", { worldbookUid: t.worldbookUid }), chat.classList.add("act"), $("chat-in").focus();
}, closeChat = () => {
  chat.classList.remove("act"), chatTgt = null, smsGen = false;
}, renderMsgs = () => {
  if (!chatTgt) return;
  const t = chatTgt.messages || [], e = chatTgt.summarizedCount || 0;
  let s = "";
  t.length ? t.forEach(((t2, o) => {
    e > 0 && o === e && (s += '<div class="chat-divider">—— 以上为已总结消息 ——</div>'), s += `<div class="chat-msg ${"sent" === t2.type ? "sent" : "recv"}${t2.typing ? " typing" : ""}"><div>${escHtml(stripXml(t2.text))}</div></div>`;
  })) : s = '<div class="chat-emp">暂无消息，开始聊天吧</div>', $("chat-msgs").innerHTML = DOMPurify.sanitize(s), $("chat-msgs").scrollTop = $("chat-msgs").scrollHeight, $("chat-compress").disabled = t.length - e < 2 || smsGen, $("chat-back").disabled = !t.length || smsGen;
}, sendMsg = () => {
  const t = $("chat-in").value.trim();
  if (!t || !chatTgt || smsGen) return;
  chatTgt.messages = chatTgt.messages || [], chatTgt.messages.push({ type: "sent", text: t }), $("chat-in").value = "", renderMsgs(), smsGen = true, $("chat-in").disabled = $("chat-send").disabled = $("chat-back").disabled = true, chatTgt.messages.push({ type: "received", text: "正在输入...", typing: true }), renderMsgs();
  const e = Req.create("sms");
  Req.set("sms", { tgt: chatTgt }), post("SEND_SMS", { requestId: e, contactName: chatTgt.name, worldbookUid: chatTgt.worldbookUid, userMessage: t, chatHistory: chatTgt.messages.filter(((t2) => !t2.typing)).slice(-20), summarizedCount: chatTgt.summarizedCount || 0 });
}, isCharCardContact = (t) => "__CHARACTER_CARD__" === t?.worldbookUid, contactsForSave = () => (D.contacts.contacts || []).filter(((t) => !isCharCardContact(t))), saveCt = () => post("SAVE_CONTACTS", { contacts: contactsForSave(), strangers: D.contacts.strangers }), saveChat = (t) => post("SAVE_SMS_HISTORY", { worldbookUid: t.worldbookUid, contactName: t.name, messages: t.messages.filter(((t2) => !t2.typing)), summarizedCount: t.summarizedCount || 0 });
$("chat-x").onclick = closeChat, $("chat-back").onclick = () => {
  if (!chatTgt || smsGen) return;
  const t = chatTgt.messages || [];
  if (t.length) {
    for (t.pop(); t[t.length - 1]?.typing; ) t.pop();
    chatTgt.summarizedCount = Math.min(chatTgt.summarizedCount || 0, t.length), renderMsgs(), saveCt(), chatTgt.worldbookUid && saveChat(chatTgt);
  }
}, $("chat-clr").onclick = () => {
  chatTgt && confirm(`确定要清空与 ${chatTgt.name} 的所有聊天记录吗？`) && (chatTgt.messages = [], chatTgt.summarizedCount = 0, renderMsgs(), saveCt(), chatTgt.worldbookUid && saveChat(chatTgt));
}, $("chat-compress").onclick = () => {
  if (!chatTgt || smsGen) return;
  const t = chatTgt.messages || [], e = chatTgt.summarizedCount || 0, s = t.slice(e);
  if (s.length < 2) return void alert("至少需要2条未总结的消息才能压缩");
  if (!confirm(`确定要压缩总结 ${s.length} 条消息吗？`)) return;
  smsGen = true, $("chat-compress").disabled = $("chat-in").disabled = $("chat-send").disabled = $("chat-back").disabled = true;
  const o = Req.create("compress");
  Req.set("compress", { tgt: chatTgt }), post("COMPRESS_SMS", { requestId: o, contactName: chatTgt.name, worldbookUid: chatTgt.worldbookUid, messages: t.filter(((t2) => !t2.typing)), summarizedCount: e });
}, $("chat-send").onclick = sendMsg;
const chatIn = $("chat-in");
["keydown", "keypress", "keyup"].forEach(((t) => chatIn.addEventListener(t, ((t2) => t2.stopPropagation())))), chatIn.addEventListener("keydown", ((t) => {
  "Enter" !== t.key || t.shiftKey || (t.preventDefault(), sendMsg());
}));
const openInv = (t) => {
  invTgt = t, selLoc = null, $("inv-t").textContent = `邀请：${t.name}`, $("loc-list").innerHTML = DOMPurify.sanitize(D.maps.outdoor.nodes.map(((t2) => `<div class="loc-i" data-n="${h(t2.name)}"><div class="loc-i-nm">${h(t2.name)}</div><div class="loc-i-info">${h(t2.info || "")}</div></div>`)).join("")), $$("#loc-list .loc-i").forEach(((t2) => t2.onclick = () => {
    $$("#loc-list .loc-i").forEach(((t3) => t3.classList.remove("sel"))), t2.classList.add("sel"), selLoc = t2.dataset.n;
  })), openM("m-invite");
};
$("inv-ok").onclick = () => {
  if (!selLoc || !invTgt) return;
  const t = $("inv-ok");
  BtnState.load(t, "询问中...");
  const e = Req.create("invite"), s = canonicalLoc(selLoc);
  Req.set("invite", { contact: invTgt, loc: s, btn: t }), post("SEND_INVITE", { requestId: e, contactName: invTgt.name, contactUid: invTgt.worldbookUid, targetLocation: s, smsHistory: (invTgt.messages || []).map(((t2) => "sent" === t2.type ? `{{user}}: ${t2.text}` : `${invTgt.name}: ${t2.text}`)).join("\n") });
};
let addCtState = { uid: "", name: "", keys: [] };
const resetAddCt = () => {
  addCtState = { uid: "", name: "", keys: [] }, $("add-uid").value = "", $("add-name").value = "", $("add-name").innerHTML = '<option value="">-- 请选择 --</option>', $("name-select-group").style.display = "none", $("uid-check-err").classList.remove("vis"), $("add-ct-ok").disabled = true, BtnState.reset($("btn-check-uid"), '<i class="fa-solid fa-search"></i> 检查');
}, showUidErr = (t) => {
  $("uid-check-err").textContent = t, $("uid-check-err").classList.add("vis");
};
$("btn-check-uid").onclick = () => {
  const t = $("add-uid").value.trim();
  t ? ($("uid-check-err").classList.remove("vis"), BtnState.load($("btn-check-uid"), "检查中"), $("name-select-group").style.display = "none", $("add-ct-ok").disabled = true, addCtState.uid = t, post("CHECK_WORLDBOOK_UID", { uid: t, requestId: Req.create("uidck") })) : showUidErr("请输入UID");
}, $("btn-add-ct").onclick = () => {
  resetAddCt(), openM("m-add-ct");
}, $("add-ct-ok").onclick = () => {
  const t = addCtState.uid || $("add-uid").value.trim(), e = addCtState.name || $("add-name").value.trim();
  t && e && (D.contacts.contacts.some(((e2) => e2.worldbookUid === t)) ? showUidErr("该联络人已存在") : (D.contacts.contacts.push({ name: e, avatar: e[0], color: "#" + Math.floor(16777215 * Math.random()).toString(16).padStart(6, "0"), location: "未知", worldbookUid: t, messages: [] }), saveCt(), closeM("m-add-ct"), render()));
};
const genAddCt = (t, e, s, npcType = "npc") => {
  BtnState.load(s, "检查中");
  const o = Req.create("stgwb");
  Req.set("stgwb", { name: t, info: e, btn: s, npcType }), post("CHECK_STRANGER_WORLDBOOK", { requestId: o, strangerName: t });
};
function canonicalLoc(t) {
  return String(t || "").trim().replace(/^\u90ae\u8f6e/, "");
}
$("btn-refresh-strangers").onclick = () => {
  const t = $("btn-refresh-strangers");
  BtnState.load(t, "");
  const e = Req.create("extract");
  Req.set("extract", { btn: t }), post("EXTRACT_STRANGERS", { requestId: e, existingContacts: D.contacts.contacts, existingStrangers: D.contacts.strangers });
}, $("world-gen-ok").onclick = () => {
  const t = $("world-gen-ok"), e = $("world-gen-status");
  BtnState.load(t, "生成中"), e.style.display = "block", e.textContent = "正在生成世界数据，请稍候...", post("GENERATE_WORLD", { requestId: Req.create("wgen"), playerRequests: $("world-gen-req").value.trim() });
}, $("world-sim-ok").onclick = () => {
  if (!D.meta && !D.timeline && !D.maps?.outdoor) return void alert("请先生成世界数据，再进行推演");
  const t = $("world-sim-ok"), e = $("world-sim-status");
  BtnState.load(t, "推演中"), e.style.display = "block", e.style.color = "var(--ok)", e.textContent = "正在分析玩家行为并推演世界变化...", post("SIMULATE_WORLD", { requestId: Req.create("wsim"), currentData: JSON.stringify({ meta: D.meta, timeline: D.timeline, world: D.world, maps: D.maps }, null, 2) });
}, $("btn-deduce").onclick = () => openM("m-world-gen"), $("btn-simulate").onclick = () => openM("m-world-sim"), $("btn-side-menu-toggle").onclick = () => {
  const t = $("side-menu-panel"), e = $("btn-side-menu-toggle");
  t.classList.toggle("show"), e.classList.toggle("act", t.classList.contains("show"));
}, document.addEventListener("click", ((t) => {
  t.target.closest(".side-menu") || ($("side-menu-panel")?.classList.remove("show"), $("btn-side-menu-toggle")?.classList.remove("act"));
}));
const getWaitingContacts = (t) => {
  const e = canonicalLoc(t);
  return e ? (D.contacts.contacts || []).filter(((t2) => t2?.waitingAt && canonicalLoc(t2.waitingAt) === e)) : [];
}, finishTravel = (t, e) => {
  playerLocation = t, selectedMapValue = "current";
  const s = getWaitingContacts(t);
  s.forEach(((t2) => delete t2.waitingAt)), saveAll(), render(), hideInfo();
  const o = $("goto-task")?.value;
  let a = `{{user}}离开了${e || "上一地点"}，来到${t}。${o ? "意图：" + o : ""}`;
  s.length && (a += ` ${s.map(((t2) => t2.name)).join("、")}已经在这里等你了。`), post("EXECUTE_SLASH_COMMAND", { command: `/sendas name="剧情任务" ${a}` });
};
$("goto-ok").onclick = () => {
  if (!curNode) return;
  const t = $("goto-ok"), e = D.maps?.outdoor?.nodes?.find(((t2) => t2.name === playerLocation)), s = { name: playerLocation, info: e?.info || "" }, o = curNode.name, a = D.maps?.indoor?.[o];
  if (a?.description) return BtnState.reset(t, "确认前往"), closeM("m-goto"), finishTravel(o, s.name), void switchMapView("current");
  let n = "main" === curNode.type ? "main" : "home" === curNode.type ? "home" : "sub";
  const r = Req.create("scene");
  Req.set("scene", { node: curNode, prev: s.name }), BtnState.load(t, "生成中"), post("SCENE_SWITCH", { requestId: r, prevLocationName: s.name, prevLocationInfo: s.info, targetLocationName: curNode.name, targetLocationType: n, targetLocationInfo: curNode.data?.info || "", playerAction: $("goto-task").value || "" });
}, $("btn-gen-local-map").onclick = () => {
  const t = $("btn-gen-local-map");
  BtnState.load(t, "生成中");
  const e = Req.create("localmap");
  Req.set("localmap", { btn: t }), post("GENERATE_LOCAL_MAP", { requestId: e, outdoorDescription: D.maps?.outdoor?.description || "" });
}, $("btn-refresh-local-map").onclick = () => {
  if (!playerLocation) return void showResultModal("提示", "请先生成世界数据", true);
  const t = $("btn-refresh-local-map"), e = D.maps?.indoor?.[playerLocation], s = e;
  if (!s) return void showResultModal("提示", "当前区域没有局部地图，请先生成", true);
  BtnState.load(t, "刷新中");
  const o = Req.create("localmaprf");
  Req.set("localmaprf", { btn: t, loc: playerLocation }), post("REFRESH_LOCAL_MAP", { requestId: o, locationName: playerLocation, currentLocalMap: s, outdoorDescription: D.maps?.outdoor?.description || "" });
}, $("btn-gen-local-scene").onclick = () => {
  if (!playerLocation || "未知" === playerLocation) return void showResultModal("提示", "请先生成世界数据", true);
  const t = $("btn-gen-local-scene");
  BtnState.load(t, "生成中");
  const e = D.maps?.outdoor?.nodes?.find(((t2) => t2.name === playerLocation)), s = D.maps?.indoor?.[playerLocation], o = s?.description || e?.info || e?.data?.info || "", a = Req.create("localscene");
  Req.set("localscene", { btn: t, loc: playerLocation }), post("GENERATE_LOCAL_SCENE", { requestId: a, locationName: playerLocation, locationInfo: o });
}, $("btn-refresh-world-news").onclick = () => {
  const t = $("btn-refresh-world-news");
  if (!t) return;
  t.disabled = true, t._o = t._o ?? t.innerHTML, t.innerHTML = '<i class="fa-solid fa-rotate fa-spin"></i>';
  const e = Req.create("newsrf");
  Req.set("newsrf", { btn: t }), post("REFRESH_WORLD_NEWS", { requestId: e });
};
const saveAll = () => post("SAVE_ALL_DATA", { allData: { meta: D.meta, world: D.world, outdoor: D.maps.outdoor, indoor: D.maps.indoor, sceneSetup: D.sceneSetup, strangers: D.contacts.strangers, contacts: contactsForSave() }, playerLocation }), dataKeys = [["meta", "大纲", "核心真相、洋葱结构、时间线、用户指南", () => D.meta, (t) => D.meta = t], ["world", "世界资讯", "世界新闻等信息", () => D.world, (t) => D.world = t], ["outdoor", "大地图", "室外区域的地点和路线", () => D.maps.outdoor, (t) => D.maps.outdoor = t], ["indoor", "局部地图", "隐藏的室内/局部场景地图", () => D.maps.indoor, (t) => D.maps.indoor = t], ["sceneSetup", "区域剧情", "当前区域的 Side Story", () => D.sceneSetup, (t) => D.sceneSetup = t], ["characterContactSms", "角色卡短信", "角色卡联络人的短信记录", () => ({ messages: charSmsHistory?.messages || [], summarizedCount: charSmsHistory?.summarizedCount || 0, summaries: charSmsHistory?.summaries || {} }), (t) => {
  t && "object" == typeof t && (charSmsHistory = { messages: charSmsHistory?.messages || [], summarizedCount: charSmsHistory?.summarizedCount || 0, ...t || {} });
}], ["strangers", "陌路人", "已遇见但未建立联系的角色", () => D.contacts.strangers, (t) => D.contacts.strangers = t], ["contacts", "联络人", "已添加的联系人", () => contactsForSave(), (t) => {
  const e = (D.contacts.contacts || []).find(isCharCardContact);
  D.contacts.contacts = (e ? [e] : []).concat(Array.isArray(t) ? t : []);
}]];
let gSet = { apiUrl: "", apiKey: "", model: "", mode: "assist" }, dataCk = {}, editCtx = null, commSet = { historyCount: 50, npcPosition: 0, npcOrder: 100, stream: false }, promptDefaults = { jsonTemplates: {}, promptSources: {} }, promptStores = { global: { jsonTemplates: {}, promptSources: {} }, character: { jsonTemplates: {}, promptSources: {} } };
const reqSet = () => post("GET_SETTINGS"), renderDataList = () => {
  $("data-list").innerHTML = DOMPurify.sanitize(dataKeys.map((([t, e, s]) => `<div class="data-item ${dataCk[t] ? "sel" : ""}" data-k="${t}"><div class="data-ck"><i class="fa-solid fa-check"></i></div><div class="data-info"><div class="data-nm">${e}</div><div class="data-desc">${s}</div></div><button class="data-edit" data-k="${t}" title="编辑"><i class="fa-solid fa-pen"></i></button></div>`)).join("")), $$("#data-list .data-item").forEach(((t) => t.onclick = (e) => {
    if (e.target.closest(".data-edit")) return;
    const s = t.dataset.k;
    dataCk[s] = !dataCk[s], t.classList.toggle("sel", dataCk[s]);
  })), $$("#data-list .data-edit").forEach(((t) => t.onclick = (e) => {
    e.stopPropagation(), openDataEdit(t.dataset.k);
  }));
}, ADV_PROMPT_ITEMS = [["sms", "短信回复"], ["invite", "邀请回复"], ["npc", "NPC 生成"], ["importantNpc", "重要NPC生成"], ["stranger", "提取陌路人"], ["worldGenStep1", "大纲生成"], ["worldGenStep2", "世界生成"], ["worldSim", "世界推演（故事模式）"], ["worldSimAssist", "世界推演（辅助模式）"], ["worldNewsRefresh", "世界新闻刷新"], ["sceneSwitch", "场景切换"], ["localMapGen", "局部地图生成"], ["localMapRefresh", "局部地图刷新"], ["localSceneGen", "局部剧情生成"], ["summary", "总结压缩"]], advHasJsonTemplate = (t) => {
  const e = promptDefaults?.jsonTemplates || {};
  return Object.prototype.hasOwnProperty.call(e, t);
}, advGetScope = () => "global" === $("adv-scope")?.value ? "global" : "character", advStoreHasKey = (t, e) => {
  const s = ("global" === t ? promptStores.global : promptStores.character) || {};
  return !(!Object.prototype.hasOwnProperty.call(s?.promptSources || {}, e) && !Object.prototype.hasOwnProperty.call(s?.jsonTemplates || {}, e));
}, advGetPromptObj = (t, e = "character") => {
  const s = promptDefaults?.promptSources || {}, o = promptStores?.global?.promptSources || {}, a = promptStores?.character?.promptSources || {}, n = ("global" === e ? o[t] || s[t] : a[t] || o[t] || s[t]) || {};
  return { u1: "string" == typeof n.u1 ? n.u1 : "", a1: "string" == typeof n.a1 ? n.a1 : "", u2: "string" == typeof n.u2 ? n.u2 : "", a2: "string" == typeof n.a2 ? n.a2 : "" };
}, advNormalizeDisplayText = (t) => {
  let e = String(t ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return !e.includes("\n") && e.includes("\\n") && (e = e.replaceAll("\\n", "\n")), e.includes("\\t") && (e = e.replaceAll("\\t", "	")), e.includes("\\`") && (e = e.replaceAll("\\`", "`")), e;
}, advNormalizeSaveText = (t) => String(t ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n"), advGetJsonTemplate = (t, e = "character") => {
  const s = promptDefaults?.jsonTemplates || {}, o = promptStores?.global?.jsonTemplates || {}, a = promptStores?.character?.jsonTemplates || {};
  if (!(advHasJsonTemplate(t) || Object.prototype.hasOwnProperty.call(o, t) || Object.prototype.hasOwnProperty.call(a, t))) return "";
  const n = "global" === e ? Object.prototype.hasOwnProperty.call(o, t) ? o[t] : s[t] : Object.prototype.hasOwnProperty.call(a, t) ? a[t] : Object.prototype.hasOwnProperty.call(o, t) ? o[t] : s[t];
  return "string" == typeof n ? n : "";
}, advApplyToUI = (t, e = "character") => {
  const s = advGetPromptObj(t, e), o = (t2, e2) => {
    const s2 = $(t2);
    s2 && (s2.value = advNormalizeDisplayText(e2));
  };
  o("adv-u1", s.u1), o("adv-a1", s.a1), o("adv-u2", s.u2), o("adv-a2", s.a2), $("adv-json-wrap").style.display = "";
  const a = advGetJsonTemplate(t, e), n = $("adv-json");
  n && (n.value = String(a ?? "")), advUpdateVarHelp(t);
  const _n = $("adv-attr-notice");
  _n && (_n.style.display = t === "importantNpc" ? "" : "none");
}, advUpdateVarHelp = (t) => {
  $$(".adv-vars-group").forEach(((e) => {
    const s = String(e.dataset.advFor || "").split(",").map(((t2) => t2.trim())).filter(Boolean);
    e.style.display = !s.length || s.includes(t) ? "" : "none";
  }));
}, advBuildEdits = () => {
  const t = (t2) => advNormalizeSaveText($(t2)?.value ?? "");
  return { prompt: { u1: t("adv-u1"), a1: t("adv-a1"), u2: t("adv-u2"), a2: t("adv-a2") }, jsonTemplate: advNormalizeSaveText($("adv-json")?.value ?? "") };
}, advInit = () => {
  const t = $("adv-key");
  if (!t || t._inited) return;
  t._inited = true, t.innerHTML = DOMPurify.sanitize(ADV_PROMPT_ITEMS.map((([t2, e2]) => `<option value="${t2}">${e2} (${t2})</option>`)).join("")), t.onchange = () => advApplyToUI(t.value, advGetScope());
  const e = $("adv-scope");
  e && !e._inited && (e._inited = true, e.onchange = () => {
    const t2 = $("adv-key")?.value;
    t2 && advApplyToUI(t2, advGetScope());
  });
}, advOpen = () => {
  advInit();
  const t = $("adv-key"), e = t?.value || ADV_PROMPT_ITEMS[0]?.[0];
  if (e) {
    const t2 = $("adv-scope");
    t2 && (t2.value = advStoreHasKey("character", e) ? "character" : "global"), advApplyToUI(e, advGetScope());
  }
  openM("m-adv-prompts");
}, advSaveTo = (t) => {
  advInit();
  const e = $("adv-key")?.value;
  if (!e) return;
  const { prompt: s, jsonTemplate: o } = advBuildEdits();
  post("SAVE_PROMPTS", { scope: t, key: e, prompt: s, jsonTemplate: o }), closeM("m-adv-prompts");
}, advReset = () => {
  advInit();
  const t = $("adv-key")?.value;
  t && (post("SAVE_PROMPTS", { scope: advGetScope(), key: t, reset: true }), closeM("m-adv-prompts"));
}, parseJsonLoose = (t) => {
  const e = String(t ?? "").trim();
  if (!e) throw new Error("空内容");
  const candidate = tryParseJson(e);
  if (candidate.ok) return candidate.value;
  const s = e.match(/```[^\n]*\n([\s\S]*?)\n```/);
  if (s?.[1]) {
    const t2 = s[1].trim();
    const candidate = tryParseJson(t2);
    if (candidate.ok) return candidate.value;
  }
  const o = (t2, s2) => {
    const o2 = e.indexOf(t2), a2 = e.lastIndexOf(s2);
    return -1 === o2 || -1 === a2 || a2 <= o2 ? null : e.slice(o2, a2 + 1);
  }, a = o("{", "}") ?? o("[", "]");
  return a ? JSON.parse(a) : JSON.parse(e);
}, updateEditPreview = () => {
  const t = $("data-edit-preview");
  t && (t.style.display = "none", t.textContent = "");
}, setEditContent = (t, e) => {
  $("data-edit-title").textContent = t, $("data-edit-ta").value = e, $("data-edit-err").classList.remove("vis"), updateEditPreview(), openM("m-data-edit");
}, openDataEdit = (t) => {
  const e = dataKeys.find((([e2]) => e2 === t));
  e && (editCtx = { type: "characterContactSms" === t ? "charSms" : "data", key: t }, setEditContent(`编辑 - ${e[1]}`, JSON.stringify(e[3](), null, 2)));
};
$("data-edit-save").onclick = () => {
  if (editCtx) try {
    const t = parseJsonLoose($("data-edit-ta").value);
    if ("data" === editCtx.type) {
      const e = dataKeys.find((([t2]) => t2 === editCtx.key));
      if (!e) return;
      e[4](t), render(), saveAll();
    } else if ("charSms" === editCtx.type) {
      const e = t?.summaries ?? t;
      if (!e || "object" != typeof e || Array.isArray(e)) throw new Error("需要 summaries 对象");
      charSmsHistory.summaries = e, post("SAVE_CHAR_SMS_HISTORY", { summaries: e });
    }
    closeM("m-data-edit"), editCtx = null;
  } catch (t) {
    $("data-edit-err").textContent = `JSON错误: ${t.message}`, $("data-edit-err").classList.add("vis");
  }
}, $("data-edit-ta").addEventListener("input", updateEditPreview);
const showTestRes = (t, e) => {
  const s = $("test-res");
  s.textContent = e, s.className = "set-test-res " + (t ? "ok" : "err");
}, showResultModal = (t, e, s = false, o = null) => {
  $("res-title").textContent = t, $("res-title").style.color = s ? "var(--err)" : "", $("res-msg").textContent = e;
  const a = $("res-record-box"), n = $("res-record");
  o ? (a.style.display = "block", n.textContent = "object" == typeof o ? JSON.stringify(o, null, 2) : String(o)) : (a.style.display = "none", n.textContent = "");
  const r = $("res-action");
  r.style.display = "none", r.textContent = "", r.onclick = null, openM("m-result");
};
function render() {
  const t = D.world?.news || [];
  $("news-list").innerHTML = DOMPurify.sanitize(t.length ? t.map(((t2) => `<div class="fold"><div class="fold-h"><div><div class="news-t">${h(t2.title)}</div><div class="news-time">${h(t2.time || "")}</div></div><i class="fa-solid fa-chevron-down fold-a"></i></div><div class="fold-b news-b"><p>${h(t2.content)}</p></div></div>`)).join("") : '<div class="empty">暂无新闻</div>'), $$("#news-list .fold").forEach(bindFold);
  const e = D.meta?.user_guide;
  e && ($("ug-state").textContent = e.current_state || "未知状态", $("ug-actions").innerHTML = DOMPurify.sanitize((e.guides || []).map(((t2, e2) => `<div class="user-guide-action" data-idx="${e2}">${e2 + 1}. ${h(t2)}</div>`)).join("") || '<div class="user-guide-action">暂无行动指南</div>'));
  const s = (t2, e2) => (t2 || []).length ? t2.map(((t3) => `<div class="fold" data-name="${h(t3.name || "")}" data-info="${h(t3.info || "")}" data-uid="${h(t3.worldbookUid || "")}"><div class="fold-h ct-hd fc"><div class="ct-av" style="background:${h(t3.color || "")}">${h(t3.avatar || "")}</div><div class="ct-info"><div class="ct-name">${h(t3.name || "")}</div><div class="ct-st">${t3.online ? "● 在线" : h(t3.location)}</div></div><i class="fa-solid fa-chevron-down fold-a"></i></div><div class="fold-b"><div class="ct-det">${t3.info ? `<div class="ct-info-text">${h(t3.info)}</div>` : ""}<div class="ct-acts">${e2 ? `<button class="btn btn-s btn-p fc add-btn" data-name="${h(t3.name || "")}" data-info="${h(t3.info || "")}" data-npctype="importantNpc"><i class="fa-solid fa-star"></i> 重要</button><button class="btn btn-s fc add-btn" data-name="${h(t3.name || "")}" data-info="${h(t3.info || "")}" data-npctype="npc"><i class="fa-solid fa-user-plus"></i> 背景板</button><button class="btn btn-s fc ignore-btn" data-name="${h(t3.name || "")}"><i class="fa-solid fa-eye-slash"></i> 忽略</button>` : `<button class="btn btn-s fc msg-btn" data-uid="${h(t3.worldbookUid || "")}"><i class="fa-solid fa-message"></i> 短信</button><button class="btn btn-s btn-p fc inv-btn" data-uid="${h(t3.worldbookUid || "")}"><i class="fa-solid fa-paper-plane"></i> 邀请</button>`}</div></div></div></div>`)).join("") : '<div class="empty">暂无</div>';
  if ($("sec-stranger").innerHTML = DOMPurify.sanitize(s(D.contacts.strangers, true)), $("sec-contact").innerHTML = DOMPurify.sanitize(s(D.contacts.contacts, false)), $$(".comm-sec .fold").forEach(bindFold), $$(".add-btn").forEach(((t2) => t2.onclick = (e2) => {
    e2.stopPropagation(), genAddCt(t2.dataset.name, t2.dataset.info || "", t2, t2.dataset.npctype || "npc");
  })), $$(".ignore-btn").forEach(((t2) => t2.onclick = (e2) => {
    e2.stopPropagation();
    const s2 = D.contacts.strangers.findIndex(((e3) => e3.name === t2.dataset.name));
    s2 > -1 && (D.contacts.strangers.splice(s2, 1), saveCt(), render());
  })), $$(".msg-btn").forEach(((t2) => t2.onclick = (e2) => {
    e2.stopPropagation();
    const s2 = D.contacts.contacts.find(((e3) => e3.worldbookUid === t2.dataset.uid));
    s2 && openChat(s2);
  })), $$(".inv-btn").forEach(((t2) => t2.onclick = (e2) => {
    e2.stopPropagation();
    const s2 = D.contacts.contacts.find(((e3) => e3.worldbookUid === t2.dataset.uid));
    s2 && openInv(s2);
  })), "current" === selectedMapValue) {
    const t2 = getCurInside();
    $("side-desc").innerHTML = DOMPurify.sanitize(t2?.description ? `<div class="local-map-title">📍 ${h(playerLocation)}</div>` + parseLinks(t2.description) : parseLinks(D.maps?.outdoor?.description || ""));
  } else $("side-desc").innerHTML = DOMPurify.sanitize(parseLinks(D.maps?.outdoor?.description || ""));
  bindLinks($("side-desc")), $("mob-desc").innerHTML = "", renderMapSelector(), renderMap();
}
function renderMap() {
  const t = D.maps?.outdoor;
  if (seed = 123456789, inner.querySelectorAll(".item").forEach(((t2) => t2.remove())), svg.innerHTML = "", nodes = [], lines = [], !t?.nodes?.length) return;
  t.nodes.forEach(((t2, e2) => {
    const s2 = dirMap[t2.position] || [0, 0], o2 = Math.hypot(s2[0], s2[1]) || 1, a = 120 * (t2.distant || 1);
    nodes.push({ id: "n" + e2, name: t2.name, type: t2.type || "sub", pos: t2.position, distant: t2.distant || 1, x: s2[0] / o2 * a, y: s2[1] / o2 * a, data: t2 });
  }));
  const e = {};
  nodes.forEach(((t2) => (e[t2.pos] = e[t2.pos] || []).push(t2)));
  for (let t2 in e) {
    const s2 = e[t2];
    if (s2.length <= 1) continue;
    const o2 = dirMap[t2] || [0, 0], a = Math.hypot(o2[0], o2[1]) || 1, n = -o2[1] / a, r = o2[0] / a, i = (s2.length - 1) / 2;
    s2.sort(((t3, e2) => t3.distant - e2.distant)).forEach(((t3, e2) => {
      t3.x += n * (e2 - i) * 50, t3.y += r * (e2 - i) * 50;
    }));
  }
  for (let t2 = 0; t2 < 15; t2++) for (let t3 = 0; t3 < nodes.length; t3++) for (let e2 = t3 + 1; e2 < nodes.length; e2++) {
    const s2 = nodes[t3], o2 = nodes[e2], a = s2.x - o2.x, n = s2.y - o2.y, r = Math.hypot(a, n);
    if (r < 80 && r > 0) {
      const t4 = (80 - r) / r * 0.5;
      s2.x += a * t4, s2.y += n * t4, o2.x -= a * t4, o2.y -= n * t4;
    }
  }
  nodes.forEach(((t2) => {
    const e2 = document.createElement("div");
    e2.className = `item node-${t2.type}`, e2.id = t2.id, e2.textContent = "home" === t2.type ? "🏠 " + t2.name : t2.name, e2.style.cssText = `left:${t2.x + 2e3}px;top:${t2.y + 2e3}px`, e2.onclick = (e3) => {
      e3.stopPropagation(), curNode?.id === t2.id ? hideInfo() : showInfo(t2);
    }, inner.appendChild(e2);
  }));
  for (let t2 in e) {
    const s2 = e[t2].sort(((t3, e2) => t3.distant - e2.distant));
    for (let t3 = 0; t3 < s2.length - 1; t3++) lines.push([s2[t3], s2[t3 + 1]]);
  }
  const s = Object.values(e).map(((t2) => t2.sort(((t3, e2) => t3.distant - e2.distant))[0])).sort(((t2, e2) => Math.atan2(t2.y, t2.x) - Math.atan2(e2.y, e2.x)));
  s.forEach(((t2, e2) => lines.push([t2, s[(e2 + 1) % s.length]])));
  const o = (t2, e2) => lines.some((([s2, o2]) => s2 === t2 && o2 === e2 || s2 === e2 && o2 === t2));
  for (let t2 = 0, e2 = 0; e2 < Math.floor(nodes.length / 5) && t2 < 200; t2++) {
    const t3 = nodes[Math.floor(rand() * nodes.length)], s2 = nodes[Math.floor(rand() * nodes.length)];
    t3 === s2 || o(t3, s2) || (lines.push([t3, s2]), e2++);
  }
  drawLines();
}
function drawLines() {
  svg.innerHTML = "";
  const t = mapWrap.getBoundingClientRect();
  lines.forEach((([e, s]) => {
    const o = $(e.id), a = $(s.id);
    if (!o || !a) return;
    const n = o.getBoundingClientRect(), r = a.getBoundingClientRect(), i = document.createElementNS("http://www.w3.org/2000/svg", "line");
    i.setAttribute("x1", (n.left + n.width / 2 - t.left) / scale - offX / scale), i.setAttribute("y1", (n.top + n.height / 2 - t.top) / scale - offY / scale), i.setAttribute("x2", (r.left + r.width / 2 - t.left) / scale - offX / scale), i.setAttribute("y2", (r.top + r.height / 2 - t.top) / scale - offY / scale);
    const c = "main" === e.type && "main" === s.type || "home" === e.type || "home" === s.type;
    i.setAttribute("stroke", c ? "var(--c)" : "var(--c4)"), i.setAttribute("stroke-width", c ? "2" : "1"), c || i.setAttribute("stroke-dasharray", "4 3"), svg.appendChild(i);
  }));
}
$("btn-settings").onclick = () => {
  reqSet(), $("set-api-url").value = gSet.apiUrl || "", $("set-api-key").value = gSet.apiKey || "", $("set-model").value = gSet.model || "", $("set-model-list").style.display = "none", $("test-res").className = "set-test-res", $("set-stage").value = D.stage || 0, $("set-deviation").value = D.deviationScore || 0, $("set-sim-target").value = D.simulationTarget ?? 5, $("set-mode").value = gSet.mode || "story", $("set-history-count").value = commSet.historyCount || 50, $("set-use-stream").checked = !!commSet.stream, $("set-npc-position").value = commSet.npcPosition || 0, $("set-npc-order").value = commSet.npcOrder || 100, renderDataList(), syncSimDueUI(), openM("m-settings");
}, $("btn-adv-prompts").onclick = () => advOpen(), $("adv-save-global").onclick = () => advSaveTo("global"), $("adv-save-char").onclick = () => advSaveTo("character"), $("adv-reset").onclick = () => advReset(), $("btn-fetch-models").onclick = () => {
  BtnState.load($("btn-fetch-models"), "加载"), post("FETCH_MODELS", { apiUrl: $("set-api-url").value.trim(), apiKey: $("set-api-key").value.trim() });
}, $("btn-test-conn").onclick = () => {
  $("test-res").className = "set-test-res", BtnState.load($("btn-test-conn"), "测试"), post("TEST_CONNECTION", { apiUrl: $("set-api-url").value.trim(), apiKey: $("set-api-key").value.trim(), model: $("set-model").value.trim() });
}, $("set-save").onclick = () => {
  gSet = { apiUrl: $("set-api-url").value.trim(), apiKey: $("set-api-key").value.trim(), model: $("set-model").value.trim(), mode: $("set-mode").value || "story" }, D.stage = Math.max(0, Math.min(10, parseInt($("set-stage").value, 10) || 0)), D.deviationScore = Math.max(0, Math.min(100, parseInt($("set-deviation").value, 10) || 0)), D.simulationTarget = parseInt($("set-sim-target").value, 10), Number.isNaN(D.simulationTarget) && (D.simulationTarget = 5), commSet = { historyCount: Math.max(0, Math.min(200, parseInt($("set-history-count").value, 10) || 50)), stream: !!$("set-use-stream").checked, npcPosition: parseInt($("set-npc-position").value, 10) || 0, npcOrder: Math.max(0, Math.min(1e3, parseInt($("set-npc-order").value, 10) || 100)) };
  const t = {};
  dataKeys.forEach((([e, , , s]) => {
    dataCk[e] && (t[e] = s());
  })), syncSimDueUI(), post("SAVE_SETTINGS", { globalSettings: gSet, commSettings: commSet, stage: D.stage, deviationScore: D.deviationScore, simulationTarget: D.simulationTarget, playerLocation, dataChecked: dataCk, outlineData: t, allData: { meta: D.meta, timeline: D.timeline, world: D.world, outdoor: D.maps.outdoor, indoor: D.maps.indoor, strangers: D.contacts.strangers, contacts: contactsForSave() } }), closeM("m-settings");
}, $("btn-close").onclick = () => post("CLOSE_PANEL");
// eslint-disable-next-line no-restricted-syntax -- Rejects both foreign origins and windows before reading data.
window.addEventListener("message", ((t) => {
  if (t.origin !== PARENT_ORIGIN || t.source !== parent) return;
  if ("LittleWhiteBox" !== t.data?.source) return;
  const e = t.data, s = e.type;
  if ("LOAD_SETTINGS" === s) {
    if (e.globalSettings && (gSet = e.globalSettings), void 0 !== e.stage && (D.stage = e.stage), void 0 !== e.deviationScore && (D.deviationScore = e.deviationScore), void 0 !== e.simulationTarget && (D.simulationTarget = e.simulationTarget), e.playerLocation && (playerLocation = e.playerLocation), e.commSettings && (commSet = { historyCount: e.commSettings.historyCount ?? 50, npcPosition: e.commSettings.npcPosition ?? 0, npcOrder: e.commSettings.npcOrder ?? 100, stream: !!e.commSettings.stream }), e.dataChecked && (dataCk = e.dataChecked), e.promptConfig && (promptDefaults = e.promptConfig.defaults || promptDefaults, e.promptConfig.stores ? (promptStores.global = e.promptConfig.stores.global || { jsonTemplates: {}, promptSources: {} }, promptStores.character = e.promptConfig.stores.character || { jsonTemplates: {}, promptSources: {} }) : (promptStores.global = e.promptConfig.current || { jsonTemplates: {}, promptSources: {} }, promptStores.character = promptStores.character || { jsonTemplates: {}, promptSources: {} })), e.outlineData) {
      const t3 = e.outlineData;
      t3.meta && (D.meta = t3.meta), t3.world && (D.world = t3.world), t3.outdoor && (D.maps.outdoor = t3.outdoor), t3.indoor && (D.maps.indoor = t3.indoor), t3.sceneSetup && (D.sceneSetup = t3.sceneSetup), t3.strangers && (D.contacts.strangers = t3.strangers), t3.contacts && (D.contacts.contacts = t3.contacts);
    }
    {
      const t3 = e.characterContactSmsHistory || {};
      charSmsHistory = { messages: Array.isArray(t3.messages) ? t3.messages : [], summarizedCount: t3.summarizedCount || 0, summaries: t3.summaries || {} };
    }
    let t2 = D.contacts.contacts.find(((t3) => "__CHARACTER_CARD__" === t3.worldbookUid));
    t2 || (t2 = D.contacts.contacts.find(((t3) => !t3.worldbookUid && "炒饭智能" === t3.name)), t2 ? (t2.worldbookUid = "__CHARACTER_CARD__", t2.info = "角色卡联络人", t2.location = "在线", t2.online = true) : (D.contacts.contacts.unshift({ name: e.characterCardName || "{{characterName}}", avatar: "", color: "#555", location: "在线", info: "角色卡联络人", online: true, worldbookUid: "__CHARACTER_CARD__", messages: [], summarizedCount: 0 }), t2 = D.contacts.contacts[0])), t2 && e.characterCardName && (t2.name = e.characterCardName, t2.avatar = (e.characterCardName || "")[0] || t2.avatar || ""), render(), syncSimDueUI(), $("m-settings").classList.contains("act") && ($("set-api-url").value = gSet.apiUrl || "", $("set-api-key").value = gSet.apiKey || "", $("set-model").value = gSet.model || "", $("set-stage").value = D.stage, $("set-deviation").value = D.deviationScore, $("set-sim-target").value = D.simulationTarget ?? 5, $("set-mode").value = gSet.mode || "story", $("set-history-count").value = commSet.historyCount, $("set-use-stream").checked = !!commSet.stream, $("set-npc-position").value = commSet.npcPosition, $("set-npc-order").value = commSet.npcOrder, renderDataList());
  } else if ("PROMPT_CONFIG_UPDATED" === s) {
    if (e.promptConfig && (promptDefaults = e.promptConfig.defaults || promptDefaults, e.promptConfig.stores ? (promptStores.global = e.promptConfig.stores.global || { jsonTemplates: {}, promptSources: {} }, promptStores.character = e.promptConfig.stores.character || { jsonTemplates: {}, promptSources: {} }) : (promptStores.global = e.promptConfig.current || { jsonTemplates: {}, promptSources: {} }, promptStores.character = promptStores.character || { jsonTemplates: {}, promptSources: {} }), $("m-adv-prompts").classList.contains("act"))) {
      const t2 = $("adv-key")?.value;
      t2 && advApplyToUI(t2, advGetScope());
    }
  } else if ("FETCH_MODELS_RESULT" === s) {
    BtnState.reset($("btn-fetch-models"), "获取");
    const t2 = $("set-model-list");
    if (e.error) return t2.style.display = "none", void showTestRes(false, "获取模型失败: " + e.error);
    if (!e.models?.length) return t2.style.display = "none", void showTestRes(false, "未找到可用模型");
    t2.innerHTML = DOMPurify.sanitize('<option value="">-- 选择模型 --</option>' + e.models.map(((t3) => `<option value="${t3}">${t3}</option>`)).join("")), t2.style.display = "block", t2.onchange = () => {
      t2.value && ($("set-model").value = t2.value);
    }, showTestRes(true, `找到 ${e.models.length} 个模型`);
  } else if ("TEST_CONN_RESULT" === s) BtnState.reset($("btn-test-conn"), "测试连接"), showTestRes(e.success, e.message);
  else if ("CHECK_WORLDBOOK_UID_RESULT" === s) {
    if (BtnState.reset($("btn-check-uid"), '<i class="fa-solid fa-search"></i> 检查'), !Req.match(e.requestId)) return;
    if (e.error) return void showUidErr(e.error);
    if (!e.primaryKeys?.length) return void showUidErr("该条目没有主要关键字");
    addCtState.keys = e.primaryKeys;
    const t2 = $("add-name");
    t2.innerHTML = DOMPurify.sanitize('<option value="">-- 请选择 --</option>' + e.primaryKeys.map(((t3) => `<option value="${t3}">${t3}</option>`)).join("")), t2.onchange = () => {
      addCtState.name = t2.value, $("add-ct-ok").disabled = !t2.value;
    }, $("name-select-group").style.display = "block", 1 === e.primaryKeys.length && (addCtState.name = e.primaryKeys[0], t2.value = addCtState.name, $("add-ct-ok").disabled = false);
  } else if ("SMS_RESULT" === s) {
    const t2 = Req.get("sms");
    if (!t2 || t2.id !== e.requestId) return;
    if (Req.clear("sms"), smsGen = false, $("chat-in").disabled = $("chat-send").disabled = $("chat-back").disabled = false, !chatTgt) return;
    chatTgt.messages = chatTgt.messages.filter(((t3) => !t3.typing)), e.error ? chatTgt.messages.push({ type: "received", text: `[错误] ${e.error}` }) : e.reply && chatTgt.messages.push({ type: "received", text: stripXml(e.reply) }), renderMsgs(), saveCt(), chatTgt.worldbookUid && saveChat(chatTgt);
  } else if ("SMS_STREAM" === s) {
    const t2 = Req.get("sms");
    if (!t2 || t2.id !== e.requestId || !chatTgt) return;
    const s2 = chatTgt.messages.find(((t3) => t3.typing));
    s2 && e.text && (s2.text = e.text, renderMsgs());
  } else if ("LOAD_SMS_HISTORY_RESULT" === s) {
    if (!chatTgt || chatTgt.worldbookUid !== e.worldbookUid) return;
    e.messages?.length && (chatTgt.messages = e.messages, chatTgt.summarizedCount = e.summarizedCount || 0, saveCt()), renderMsgs();
  } else if ("COMPRESS_SMS_RESULT" === s) {
    const t2 = Req.get("compress");
    if (!t2 || t2.id !== e.requestId) return;
    if (Req.clear("compress"), smsGen = false, $("chat-compress").disabled = $("chat-in").disabled = $("chat-send").disabled = $("chat-back").disabled = false, !chatTgt) return;
    if (e.error) return void alert(`压缩失败: ${e.error}`);
    void 0 !== e.newSummarizedCount && (chatTgt.summarizedCount = e.newSummarizedCount, renderMsgs(), saveCt());
  } else if ("CHECK_STRANGER_WORLDBOOK_RESULT" === s) {
    const t2 = Req.get("stgwb");
    if (!t2 || t2.id !== e.requestId) return;
    const { name: s2, info: o, btn: a, npcType: nt } = t2;
    if (Req.clear("stgwb"), e.found && e.worldbookUid) {
      BtnState.reset(a, nt === "importantNpc" ? '<i class="fa-solid fa-star"></i> 重要' : '<i class="fa-solid fa-user-plus"></i> 背景板');
      const t3 = D.contacts.strangers.findIndex(((t4) => t4.name === s2));
      if (t3 > -1) {
        const s3 = D.contacts.strangers.splice(t3, 1)[0];
        D.contacts.contacts.push({ name: s3.name, avatar: s3.avatar || s3.name[0], color: s3.color || "#" + Math.floor(16777215 * Math.random()).toString(16).padStart(6, "0"), location: s3.location || "未知", info: s3.info || "", worldbookUid: e.worldbookUid, messages: [] }), saveCt(), render();
      }
    } else {
      BtnState.load(a, "生成中");
      const t3 = Req.create("npcgen");
      Req.set("npcgen", { name: s2, info: o, btn: a, npcType: nt }), post("GENERATE_NPC", { requestId: t3, strangerName: s2, strangerInfo: o, npcType: nt });
    }
  } else if ("GENERATE_NPC_RESULT" === s) {
    const t2 = Req.get("npcgen");
    if (!t2 || t2.id !== e.requestId) return;
    const { name: s2, btn: o, npcType: nt } = t2;
    const _resetLbl = nt === "importantNpc" ? '<i class="fa-solid fa-star"></i> 重要' : '<i class="fa-solid fa-user-plus"></i> 背景板';
    if (Req.clear("npcgen"), BtnState.reset(o, _resetLbl), e.error) return void showResultModal("生成角色失败", "生成 NPC 失败", true, e.error);
    if (e.success && e.worldbookUid) {
      const t3 = D.contacts.strangers.findIndex(((t4) => t4.name === s2));
      if (t3 > -1) {
        const o2 = D.contacts.strangers.splice(t3, 1)[0], a = e.npcData || {};
        D.contacts.contacts.push({ name: a.name || o2.name, avatar: (a.name || o2.name)[0], color: o2.color || "#" + Math.floor(16777215 * Math.random()).toString(16).padStart(6, "0"), location: o2.location || "未知", info: a.intro || o2.info || "", worldbookUid: e.worldbookUid, messages: [] }), saveCt(), render(), showResultModal("生成成功", `NPC ${s2} 已生成并添加到联络人`, false, e.npcData);
      }
    }
  } else if ("EXTRACT_STRANGERS_RESULT" === s) {
    const t2 = Req.get("extract");
    if (!t2 || t2.id !== e.requestId) return;
    const { btn: s2 } = t2;
    if (Req.clear("extract"), BtnState.reset(s2, '<i class="fa-solid fa-rotate"></i>'), e.error) return void showResultModal("提取失败", "提取陌路人失败", true, e.error);
    if (e.success && Array.isArray(e.strangers)) {
      if (!e.strangers.length) return void showResultModal("提取结果", "没有发现新的陌路人");
      const t3 = [...D.contacts.contacts.map(((t4) => t4.name)), ...D.contacts.strangers.map(((t4) => t4.name))], s3 = e.strangers.filter(((e2) => !t3.includes(e2.name)));
      if (!s3.length) return void showResultModal("提取结果", "提取到的角色都已存在");
      D.contacts.strangers = D.contacts.strangers.concat(s3), saveCt(), render(), showResultModal("提取成功", `成功提取 ${s3.length} 个新陌路人`, false, s3);
    }
  } else if ("GENERATE_WORLD_STATUS" === s) {
    if (!Req.match(e.requestId)) return;
    const t2 = $("world-gen-status");
    t2.style.display = "block", t2.style.color = "var(--ok)", t2.textContent = e.message;
  } else if ("GENERATE_WORLD_RESULT" === s) {
    if (!Req.match(e.requestId)) return;
    Req.clear("wgen");
    const t2 = $("world-gen-ok"), s2 = $("world-gen-status");
    if (BtnState.reset(t2, '<i class="fa-solid fa-wand-magic-sparkles"></i> 开始生成'), e.error) {
      if (s2.style.display = "none", showResultModal("生成失败", "世界生成失败", true, e.error), String(e.error || "").includes("Step 2")) {
        const e2 = $("res-action");
        e2.style.display = "inline-block", e2.textContent = "重试 Step2", e2.onclick = () => {
          closeM("m-result");
          const e3 = Req.create("wgen");
          BtnState.load(t2, "重试中"), s2.style.display = "block", s2.style.color = "var(--ok)", s2.textContent = "准备重试 Step 2/2...", post("RETRY_WORLD_GEN_STEP2", { requestId: e3 });
        };
      }
      return;
    }
    if (e.success && e.worldData) {
      s2.style.color = "var(--ok)", s2.textContent = "生成成功！正在应用数据...";
      const t3 = e.worldData;
      if (t3.meta && (D.meta = t3.meta), t3.world && (D.world = t3.world), t3.maps?.outdoor && (D.maps.outdoor = t3.maps.outdoor), D.stage = 0, D.deviationScore = 0, t3.playerLocation) playerLocation = t3.playerLocation;
      else {
        const t4 = D.maps?.outdoor?.nodes?.find(((t5) => "home" === t5.type));
        playerLocation = t4?.name || D.maps?.outdoor?.nodes?.[0]?.name || "未知";
      }
      t3.maps?.inside && playerLocation && (D.maps.indoor = D.maps.indoor || {}, D.maps.indoor[playerLocation] = t3.maps.inside), selectedMapValue = "current", saveAll(), render(), setTimeout((() => {
        closeM("m-world-gen"), s2.style.display = "none", $("world-gen-req").value = "", showResultModal("生成成功", "世界数据生成完成！Stage 和 Deviation 已重置为 0", false, e.worldData);
      }), 500);
    }
  } else if ("SIMULATE_WORLD_RESULT" === s) {
    if (!e.isAuto && !Req.match(e.requestId)) return;
    if (!e.isAuto) {
      Req.clear("wsim");
      const t2 = $("world-sim-ok"), s2 = $("world-sim-status");
      if (BtnState.reset(t2, '<i class="fa-solid fa-rotate"></i> 开始推演'), e.error) return s2.style.display = "none", void showResultModal("推演失败", "世界推演失败", true, e.error);
    }
    if (e.success && e.simData) {
      if (!e.isAuto) {
        const t3 = $("world-sim-status");
        t3.style.color = "var(--ok)", t3.textContent = "推演成功！正在应用数据...";
      }
      const t2 = e.simData;
      t2.meta && (D.meta = t2.meta), t2.world && (D.world = t2.world), t2.maps?.outdoor && (D.maps.outdoor = t2.maps.outdoor), D.stage = (D.stage || 0) + 1, saveAll(), render(), e.isAuto || setTimeout((() => {
        closeM("m-world-sim"), $("world-sim-status").style.display = "none", showResultModal("推演成功", `世界推演完成！Stage 已推进到 ${D.stage}`, false, e.simData);
      }), 500);
    }
  } else if ("REFRESH_WORLD_NEWS_RESULT" === s) {
    const t2 = Req.get("newsrf");
    if (!t2 || t2.id !== e.requestId) return;
    const { btn: s2 } = t2;
    if (Req.clear("newsrf"), s2 && (s2.disabled = false, s2.innerHTML = DOMPurify.sanitize(s2._o ?? '<i class="fa-solid fa-rotate"></i>')), e.error) return void showResultModal("刷新失败", "世界新闻刷新失败", true, e.error);
    e.success && Array.isArray(e.news) && (D.world = D.world || {}, D.world.news = e.news, saveAll(), render(), showResultModal("刷新成功", `已更新世界新闻（${e.news.length} 条）`, false, e.news));
  } else if ("SCENE_SWITCH_RESULT" === s) {
    const t2 = Req.get("scene");
    if (!t2 || t2.id !== e.requestId) return;
    const { node: s2, prev: o } = t2;
    if (Req.clear("scene"), BtnState.reset($("goto-ok"), "确认前往"), closeM("m-goto"), e.error) return void showResultModal("切换失败", "场景切换失败", true, e.error);
    if (e.success && e.sceneData) {
      const t3 = e.sceneData;
      if ("number" == typeof t3.newScore && (D.deviationScore = t3.newScore), t3.localMap && (D.maps.indoor = D.maps.indoor || {}, D.maps.indoor[s2.name] = t3.localMap), t3.strangers?.length) {
        const e2 = new Set((D.contacts.strangers || []).map(((t4) => t4.name))), s3 = t3.strangers.filter(((t4) => !e2.has(t4.name)));
        D.contacts.strangers = [...D.contacts.strangers || [], ...s3];
      }
      finishTravel(s2.name, o), 0 !== t3.scoreDelta && showResultModal("切换成功", `场景切换完成！
偏差值变化: ${t3.scoreDelta > 0 ? "+" : ""}${t3.scoreDelta} (当前: ${t3.newScore})`, false, e.sceneData);
    }
  } else if ("REFRESH_LOCAL_MAP_RESULT" === s) {
    const t2 = Req.get("localmaprf");
    if (!t2 || t2.id !== e.requestId) return;
    const { btn: s2, loc: o } = t2;
    if (Req.clear("localmaprf"), BtnState.reset(s2, '<i class="fa-solid fa-rotate-right"></i>刷新'), e.error) return void showResultModal("刷新失败", "刷新局部地图失败", true, e.error);
    if (e.success && e.localMapData) {
      const t3 = e.localMapData, s3 = t3.name || o || playerLocation || "当前位置";
      D.maps.indoor = D.maps.indoor || {}, D.maps.indoor[s3] = t3, playerLocation = s3, selectedMapValue = "current", saveAll(), render(), t3.description && ($("side-desc").innerHTML = DOMPurify.sanitize(`<div class="local-map-title">📍 ${h(s3)}</div>` + parseLinks(t3.description)), bindLinks($("side-desc"))), showResultModal("刷新成功", `局部地图已刷新！当前位置: ${s3}`, false, e.localMapData);
    }
  } else if ("GENERATE_LOCAL_SCENE_RESULT" === s) {
    const t2 = Req.get("localscene");
    if (!t2 || t2.id !== e.requestId) return;
    const { btn: s2, loc: o } = t2;
    if (Req.clear("localscene"), BtnState.reset(s2, '<i class="fa-solid fa-feather-pointed"></i>局部剧情'), e.error) return void showResultModal("生成失败", "局部剧情生成失败", true, e.error);
    if (e.success && e.sceneSetup) {
      D.sceneSetup = { ...D.sceneSetup || {}, ...e.sceneSetup || {} }, saveAll(), render();
      const t3 = String(e.introduce || "").replace(/^\s*(?:\/?\s*(?:sendas|as)\s+name\s*=\s*(?:"[^"]*"|'[^']*'|\S+)\s+)/i, "").replace(/\s+/g, " ").trim();
      t3 && post("EXECUTE_SLASH_COMMAND", { command: `/sendas name="剧情任务" ${t3}` }), showResultModal("生成成功", `局部剧情已生成：${o || playerLocation}`, false, e.sceneSetup);
    }
  } else if ("SEND_INVITE_RESULT" === s) {
    const t2 = Req.get("invite");
    if (!t2 || t2.id !== e.requestId) return;
    const { contact: s2, loc: o, btn: a } = t2;
    if (Req.clear("invite"), BtnState.reset(a, "发送邀请"), e.error) return void showResultModal("邀请失败", "邀请发送失败", true, e.error);
    if (e.success && e.inviteData) {
      const t3 = e.inviteData, a2 = canonicalLoc(t3.targetLocation || o || ""), n = D.contacts.contacts.find(((t4) => t4 && s2 && t4.worldbookUid && s2.worldbookUid && t4.worldbookUid === s2.worldbookUid)) || D.contacts.contacts.find(((t4) => t4 && s2 && t4.name === s2.name)) || s2;
      if (n.messages = n.messages || [], n.messages.push({ type: "sent", text: `我邀请你前往「${a2}」` }), n.messages.push({ type: "received", text: t3.reply }), t3.accepted) {
        const e2 = canonicalLoc(playerLocation);
        n.location = a2, e2 && a2 && e2 === a2 ? (delete n.waitingAt, post("EXECUTE_SLASH_COMMAND", { command: `/sendas name="剧情任务" ${n.name}过来了。` })) : n.waitingAt = a2, showResultModal("邀请成功", `${n.name} 接受了邀请！
回复: ${t3.reply}`, false, t3);
      } else showResultModal("邀请被拒", `${n.name} 拒绝了邀请。
回复: ${t3.reply}`, false, t3);
      saveAll(), n.worldbookUid && saveChat(n), closeM("m-invite"), render(), openChat(n);
    }
  } else if ("GENERATE_LOCAL_MAP_RESULT" === s) {
    const t2 = Req.get("localmap");
    if (!t2 || t2.id !== e.requestId) return;
    const { btn: s2 } = t2;
    if (Req.clear("localmap"), BtnState.reset(s2, '<i class="fa-solid fa-plus"></i>局部地图'), e.error) return void showResultModal("生成失败", "局部地图生成失败", true, e.error);
    if (e.success && e.localMapData) {
      const t3 = e.localMapData, s3 = t3.name || "当前位置";
      D.sceneSetup = null, D.maps.indoor = D.maps.indoor || {}, D.maps.indoor[s3] = t3, playerLocation = s3, selectedMapValue = "current", saveAll(), render(), t3.description && ($("side-desc").innerHTML = DOMPurify.sanitize(`<div class="local-map-title">📍 ${h(s3)}</div>` + parseLinks(t3.description)), bindLinks($("side-desc"))), showResultModal("生成成功", `局部地图生成完成！当前位置: ${s3}`, false, t3);
    }
  }
}));
const updateTf = () => {
  inner.style.transform = `translate(${offX}px,${offY}px) scale(${scale})`, $("zoom-ind").textContent = Math.round(100 * scale) + "%", requestAnimationFrame(drawLines);
}, initPos = () => {
  offX = mapWrap.clientWidth / 2 - 2e3, offY = mapWrap.clientHeight / 2 - 2e3, scale = 1, updateTf();
};
function panTo(t, e = 350) {
  if (!t || anim) return;
  if (!$(t.id)) return;
  const s = -(t.x + 2e3) * scale + mapWrap.clientWidth / 2, o = -(t.y + 2e3) * scale + 0.25 * mapWrap.clientHeight, a = offX, n = offY, r = performance.now();
  anim = true, (function t2(i) {
    const c = Math.min((i - r) / e, 1), l = 1 - Math.pow(1 - c, 3);
    offX = a + (s - a) * l, offY = n + (o - n) * l, updateTf(), c < 1 ? requestAnimationFrame(t2) : anim = false;
  })(r);
}
function showInfo(t) {
  if (!t?.data) return;
  curNode = t, inner.querySelectorAll(".item").forEach(((t2) => t2.classList.remove("hl"))), $(t.id)?.classList.add("hl");
  const e = t.name === playerLocation;
  $("btn-goto").classList.toggle("show", !e), e || ($("goto-t").textContent = `前往 ${t.name}`);
  const s = D.maps?.indoor?.[t.name];
  e && s?.description ? ($("side-desc").innerHTML = DOMPurify.sanitize(`<div class="local-map-title">📍 ${h(t.name)}</div>` + parseLinks(s.description)), bindLinks($("side-desc"))) : ($("side-desc").innerHTML = DOMPurify.sanitize(parseLinks(D.maps?.outdoor?.description || "")), bindLinks($("side-desc"))), isMob() ? ($("mob-info-t").textContent = t.name, $("mob-info-c").textContent = e ? s?.description || t.data.info || "暂无信息..." : t.data.info || "暂无信息...", popup.classList.contains("act") || openPop(1)) : ($("info-t").textContent = t.name, $("info-c").textContent = t.data.info || "暂无信息...", $("tip").classList.add("show"));
}
const hideInfo = () => {
  curNode = null, inner.querySelectorAll(".item").forEach(((t) => t.classList.remove("hl"))), $("btn-goto").classList.remove("show"), $("tip").classList.remove("show");
};
function renderMapSelector() {
  const t = $("map-lbl-select");
  t.innerHTML = '<option value="overview">🗺️ 大地图</option>';
  const e = D.maps?.outdoor?.nodes?.findIndex(((t2) => t2.name === playerLocation)), s = D.maps?.indoor && D.maps.indoor[playerLocation];
  if ((e >= 0 || s) && (t.innerHTML += DOMPurify.sanitize(`<option value="current">📍 ${h(playerLocation)}（你）</option>`)), t.innerHTML += "<option disabled>──────────</option>", D.maps?.outdoor?.nodes?.length && D.maps.outdoor.nodes.forEach(((e2, s2) => {
    e2.name !== playerLocation && (t.innerHTML += DOMPurify.sanitize(`<option value="node:${s2}">${h(e2.name)}</option>`));
  })), D.maps?.indoor) {
    const e2 = Object.keys(D.maps.indoor).filter(((t2) => t2 !== playerLocation && !D.maps?.outdoor?.nodes?.some(((e3) => e3.name === t2))));
    e2.length && (t.innerHTML += "<option disabled>── 隐藏地图 ──</option>", e2.forEach(((e3) => t.innerHTML += DOMPurify.sanitize(`<option value="indoor:${h(e3)}">🏠 ${h(e3)}</option>`))));
  }
  t.value = selectedMapValue, updateMapLabel();
}
function updateMapLabel() {
  const t = $("map-lbl-select").value;
  if ("overview" === t) $("map-lbl-t").textContent = "大地图";
  else if ("current" === t) $("map-lbl-t").textContent = playerLocation + "（你）";
  else if (t.startsWith("node:")) {
    const e = parseInt(t.split(":")[1]);
    $("map-lbl-t").textContent = D.maps?.outdoor?.nodes?.[e]?.name || "未知";
  } else t.startsWith("indoor:") && ($("map-lbl-t").textContent = t.replace("indoor:", ""));
}
function switchMapView(t) {
  if (selectedMapValue = t, hideInfo(), "overview" === t) $("btn-goto").classList.remove("show"), $("side-desc").innerHTML = DOMPurify.sanitize(parseLinks(D.maps?.outdoor?.description || "")), bindLinks($("side-desc")), initPos();
  else if ("current" === t) {
    $("btn-goto").classList.remove("show");
    const t2 = getCurInside();
    t2?.description ? ($("side-desc").innerHTML = DOMPurify.sanitize(`<div class="local-map-title">📍 ${h(playerLocation)}</div>` + parseLinks(t2.description)), bindLinks($("side-desc"))) : ($("side-desc").innerHTML = DOMPurify.sanitize(parseLinks(D.maps?.outdoor?.description || "")), bindLinks($("side-desc")));
    const e = nodes.find(((t3) => t3.name === playerLocation));
    e && (panTo(e), showInfo(e));
  } else if (t.startsWith("node:")) {
    const e = parseInt(t.split(":")[1]), s = D.maps?.outdoor?.nodes?.[e];
    $("side-desc").innerHTML = DOMPurify.sanitize(parseLinks(D.maps?.outdoor?.description || "")), bindLinks($("side-desc"));
    const o = nodes.find(((t2) => t2.name === s?.name));
    o && (panTo(o), showInfo(o));
  } else if (t.startsWith("indoor:")) {
    const e = t.replace("indoor:", ""), s = D.maps?.indoor?.[e];
    e !== playerLocation ? ($("side-desc").innerHTML = DOMPurify.sanitize(parseLinks(D.maps?.outdoor?.description || "")), bindLinks($("side-desc")), curNode = { name: e, type: "sub", data: { info: stripXml(s?.description || "") }, isIndoor: true }, $("btn-goto").classList.add("show"), $("goto-t").textContent = `前往 ${e}`) : ($("btn-goto").classList.remove("show"), s?.description && ($("side-desc").innerHTML = DOMPurify.sanitize(`<div class="local-map-title">🏠 ${h(e)}</div>` + parseLinks(s.description)), bindLinks($("side-desc"))));
  }
  updateMapLabel();
}
$("info-bk").onclick = hideInfo, $("mob-info-bk").onclick = () => popup.classList.remove("act"), $("map-lbl-select").onchange = (t) => switchMapView(t.target.value);
let sx, sy, lastDist = 0, lastCX = 0, lastCY = 0;
mapWrap.onmousedown = (t) => {
  anim || t.target.closest(".map-act,.map-lbl") || (t.target.classList.contains("item") || hideInfo(), drag = true, sx = t.clientX, sy = t.clientY, mapWrap.style.cursor = "grabbing");
}, mapWrap.onmousemove = (t) => {
  drag && (offX += t.clientX - sx, offY += t.clientY - sy, sx = t.clientX, sy = t.clientY, updateTf());
}, mapWrap.onmouseup = mapWrap.onmouseleave = () => {
  drag = false, mapWrap.style.cursor = "grab";
}, mapWrap.onwheel = (t) => {
  if (anim) return;
  t.preventDefault();
  const e = Math.max(0.3, Math.min(3, scale + (t.deltaY > 0 ? -0.1 : 0.1))), s = mapWrap.getBoundingClientRect(), o = t.clientX - s.left, a = t.clientY - s.top, n = e / scale;
  offX = o - (o - offX) * n, offY = a - (a - offY) * n, scale = e, updateTf();
}, mapWrap.ontouchstart = (t) => {
  if (anim || t.target.closest(".map-act,.map-lbl")) return;
  const e = t.target.closest(".item");
  e ? e._ts = { x: t.touches[0].clientX, y: t.touches[0].clientY, t: Date.now() } : (hideInfo(), 1 === t.touches.length ? (drag = true, sx = t.touches[0].clientX, sy = t.touches[0].clientY) : 2 === t.touches.length && (drag = false, lastDist = Math.hypot(t.touches[0].clientX - t.touches[1].clientX, t.touches[0].clientY - t.touches[1].clientY), lastCX = (t.touches[0].clientX + t.touches[1].clientX) / 2, lastCY = (t.touches[0].clientY + t.touches[1].clientY) / 2));
}, mapWrap.ontouchmove = (t) => {
  const e = t.target.closest(".item");
  if (e && e._ts) Math.hypot(t.touches[0].clientX - e._ts.x, t.touches[0].clientY - e._ts.y) > 10 && (delete e._ts, drag = true, sx = t.touches[0].clientX, sy = t.touches[0].clientY);
  else if (1 === t.touches.length && drag) t.preventDefault(), offX += t.touches[0].clientX - sx, offY += t.touches[0].clientY - sy, sx = t.touches[0].clientX, sy = t.touches[0].clientY, updateTf();
  else if (2 === t.touches.length) {
    t.preventDefault();
    const e2 = Math.hypot(t.touches[0].clientX - t.touches[1].clientX, t.touches[0].clientY - t.touches[1].clientY), s = (t.touches[0].clientX + t.touches[1].clientX) / 2, o = (t.touches[0].clientY + t.touches[1].clientY) / 2, a = Math.max(0.3, Math.min(3, scale * (e2 / lastDist))), n = mapWrap.getBoundingClientRect(), r = s - n.left, i = o - n.top, c = a / scale;
    offX = r - (r - offX) * c, offY = i - (i - offY) * c, offX += s - lastCX, offY += o - lastCY, scale = a, lastDist = e2, lastCX = s, lastCY = o, updateTf();
  }
}, mapWrap.ontouchend = (t) => {
  const e = t.target.closest(".item");
  if (e && e._ts) {
    const s = Date.now() - e._ts.t;
    if (delete e._ts, s < 300) {
      const s2 = nodes.find(((t2) => t2.id === e.id));
      s2 && (t.preventDefault(), curNode?.id === s2.id ? hideInfo() : showInfo(s2));
    }
  }
  drag = false;
}, $$(".nav-i").forEach(((t) => t.onclick = () => {
  $$(".nav-i").forEach(((t2) => t2.classList.remove("act"))), $$(".page").forEach(((t2) => t2.classList.remove("act"))), t.classList.add("act"), $(`page-${t.dataset.p}`).classList.add("act");
  const e = "map" === t.dataset.p;
  sidePop.classList.toggle("show", e), isMob() && (e ? openPop(1) : popup.classList.remove("act")), e && setTimeout((() => {
    initPos(), drawLines();
  }), 50);
})), $$(".comm-tab").forEach(((t) => t.onclick = () => {
  $$(".comm-tab").forEach(((t2) => t2.classList.remove("act"))), $$(".comm-sec").forEach(((t2) => t2.classList.remove("act"))), t.classList.add("act"), $(`sec-${t.dataset.t}`).classList.add("act");
})), $("btn-goto").onclick = (t) => {
  t.stopPropagation(), curNode && ($("goto-d").textContent = `目的地：${curNode.name}`, $("goto-task").value = "", openM("m-goto"));
}, addEventListener("resize", (() => requestAnimationFrame(drawLines))), window.clickTab = (t, e) => {
  const s = t.closest(".settings-modal");
  if (!s) return;
  s.querySelectorAll(".set-nav-item").forEach(((t2) => t2.classList.remove("act"))), t.classList.add("act"), s.querySelectorAll(".set-tab-page").forEach(((t2) => t2.classList.remove("act")));
  const o = document.getElementById(e);
  o && (o.classList.add("act"), o.style.animation = "none", o.offsetHeight, o.style.animation = null);
};
function initializePage() {
  render(), initPos(), sidePop.classList.add("show"), sidePop.classList.add("act"), isMob() && openPop(1), post("FRAME_READY"), setTimeout((() => {
    "current" === selectedMapValue && switchMapView("current");
  }), 100);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializePage, { once: true });
else initializePage();
