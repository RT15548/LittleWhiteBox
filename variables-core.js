
/* ============= 模块常量与基础状态区 ============= */
import { getContext, extension_settings } from "../../../extensions.js";
import { updateMessageBlock } from "../../../../script.js";
import { getLocalVariable, setLocalVariable } from "../../../variables.js";

const MODULE_ID = 'variablesCore';
let initialized = false;
let listeners = [];
let origEmitMap = new WeakMap();

const TAG_RE = {
  varevent: /<\s*varevent[^>]*>([\s\S]*?)<\s*\/\s*varevent\s*>/gi,
  xbgetvar: /{{xbgetvar::([^}]+)}}/gi,
  scenario: /<\s*plot-log[^>]*>([\s\S]*?)<\s*\/\s*plot-log\s*>/gi,
};

const OP_ALIASES = {
  set: ['set', '记下', '记录', '录入', 'record'],
  push: ['push', '添入', '增录', '追加', 'append'],
  bump: ['bump', '推移', '变更', '调整', 'adjust'],
  del: ['del', '遗忘', '抹去', '删除', 'erase'],
};
const reEscape = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ALL_OP_WORDS = Object.values(OP_ALIASES).flat();
const OP_WORDS_PATTERN = ALL_OP_WORDS.map(reEscape).sort((a,b)=>b.length-a.length).join('|');
const TOP_OP_RE = new RegExp(`^(${OP_WORDS_PATTERN})\\s*:\\s*$`, 'i');

const OP_MAP = {};
for (const [k, arr] of Object.entries(OP_ALIASES)) for (const a of arr) OP_MAP[a.toLowerCase()] = k;

const json = (v)=>{ try{return JSON.stringify(v)}catch{return ''} };
const parseObj = (raw)=>{
  if(raw==null) return null;
  if(typeof raw==='object') return raw && !Array.isArray(raw) ? raw : null;
  if(typeof raw!=='string') raw = String(raw);
  try{ const v=JSON.parse(raw); return v && typeof v==='object' && !Array.isArray(v) ? v : null; }catch{return null}
};
const on = (t,e,h)=>{ t?.on?.(e,h); listeners.push({target:t,event:e,handler:h}); };
const offAll = ()=>{ for(const {target,event,handler} of listeners){ try{target.off?.(event,handler)}catch{} try{target.removeListener?.(event,handler)}catch{} } listeners=[] };
const asObject = (rec)=>{ if(rec.mode!=='object'){ rec.mode='object'; rec.base={}; rec.next={}; rec.changed=true; delete rec.scalar; } return rec.next??(rec.next={}); };
const debounce=(fn,wait=100)=>{ let t=null; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(null,args),wait); }; };
const splitPathSegments=(path)=> String(path||'').split('.').map(s=>s.trim()).filter(Boolean).map(seg=>(/^\d+$/.test(seg)?Number(seg):seg));
function ensureDeepContainer(root,segs){ let cur=root; for(let i=0;i<segs.length-1;i++){ const key=segs[i]; const nextKey=segs[i+1]; const shouldBeArray= typeof nextKey==='number'; let val=cur?.[key]; if(val===undefined || val===null || typeof val!=='object'){ cur[key]= shouldBeArray ? [] : {}; } cur=cur[key]; } return { parent:cur, lastKey: segs[segs.length-1] }; }
function setDeepValue(root, path, value){ const segs=splitPathSegments(path); if(segs.length===0) return false; const {parent,lastKey}=ensureDeepContainer(root,segs); const prev=parent[lastKey]; if(prev!==value){ parent[lastKey]=value; return true; } return false; }
function pushDeepValue(root, path, values){ const segs=splitPathSegments(path); if(segs.length===0) return false; const {parent,lastKey}=ensureDeepContainer(root,segs); let arr=parent[lastKey]; let changed=false; if(!Array.isArray(arr)) arr = arr===undefined?[]:[arr]; const incoming=Array.isArray(values)?values:[values]; for(const v of incoming){ if(!arr.includes(v)){ arr.push(v); changed=true; } } if(changed){ parent[lastKey]=arr; } return changed; }
function deleteDeepKey(root, path){ const segs=splitPathSegments(path); if(segs.length===0) return false; const {parent,lastKey}=ensureDeepContainer(root,segs); if(Object.prototype.hasOwnProperty.call(parent,lastKey)){ if(Array.isArray(parent) && typeof lastKey==='number' && lastKey>=0 && lastKey<parent.length){ parent.splice(lastKey,1); return true; } delete parent[lastKey]; return true; } return false; }
const getRootAndPath=(name)=>{ const segs=String(name||'').split('.').map(s=>s.trim()).filter(Boolean); if(segs.length<=1) return {root:String(name||'').trim(), subPath:''}; return {root:segs[0], subPath: segs.slice(1).join('.')}; };
const joinPath=(base, more)=> base ? (more ? base + '.' + more : base) : more;

function q(root, selector){ try{ return (root||document).querySelector(selector); }catch{ return null; } }
function qa(root, selector){ try{ return Array.from((root||document).querySelectorAll(selector)); }catch{ return []; } }
function makeEl(tag, className){ const el=document.createElement(tag); if(className) el.className=className; return el; }
function setActive(elements, index){ try{ elements.forEach((el,i)=>el.classList.toggle('active', i===index)); }catch{} }

function stripLeadingHtmlComments(s) {
  let t = String(s ?? '');
  t = t.replace(/^\uFEFF/, '');
  while (true) {
    const m = t.match(/^\s*<!--[\s\S]*?-->\s*/);
    if (!m) break;
    t = t.slice(m[0].length);
  }
  return t;
}

function stripYamlInlineComment(s){
  const text = String(s ?? '');
  if (!text) return '';
  let inSingle = false;
  let inDouble = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inSingle) {
      if (ch === "'") {
        if (text[i + 1] === "'") { i++; continue; }
        inSingle = false;
      }
      continue;
    }
    if (inDouble) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"') { inDouble = false; }
      continue;
    }
    if (ch === "'") { inSingle = true; continue; }
    if (ch === '"') { inDouble = true; continue; }
    if (ch === '#') {
      const prev = i > 0 ? text[i - 1] : '';
      if (i === 0 || /\s/.test(prev)) {
        return text.slice(0, i);
      }
    }
  }
  return text;
}

const LWB_PLOT_APPLIED_KEY = 'LWB_PLOT_APPLIED_KEY';
function getAppliedMap() {
  const meta = getContext()?.chatMetadata || {};
  const m = meta[LWB_PLOT_APPLIED_KEY];
  if (m && typeof m === 'object') return m;
  meta[LWB_PLOT_APPLIED_KEY] = {};
  return meta[LWB_PLOT_APPLIED_KEY];
}
function setAppliedSignature(messageId, sig) {
  const meta = getContext()?.chatMetadata || {};
  const map = getAppliedMap();
  if (sig) map[messageId] = sig; else delete map[messageId];
  getContext()?.saveMetadataDebounced?.();
}
function clearAppliedFrom(messageIdInclusive) {
  const map = getAppliedMap();
  for (const k of Object.keys(map)) {
    const id = Number(k);
    if (!Number.isNaN(id) && id >= messageIdInclusive) delete map[k];
  }
  getContext()?.saveMetadataDebounced?.();
}
function clearAppliedFor(messageId) {
  const map = getAppliedMap();
  delete map[messageId];
  getContext()?.saveMetadataDebounced?.();
}
function computePlotSignatureFromText(text) {
  if (!text || typeof text !== 'string') return '';
  TAG_RE.scenario.lastIndex = 0;
  const chunks = [];
  let m;
  while ((m = TAG_RE.scenario.exec(text)) !== null) {
    chunks.push((m[0] || '').trim());
  }
  if (!chunks.length) return '';
  return chunks.join('\n---\n');
}

/* ============= 第一区：聊天消息变量处理 ============= */
function getActiveCharacter() {
  try {
    const ctx = getContext();
    const id = ctx?.characterId ?? ctx?.this_chid;
    if (id == null) return null;
    const char = ctx?.getCharacter?.(id) ?? (Array.isArray(ctx?.characters) ? ctx.characters[id] : null);
    return char || null;
  } catch { return null; }
}
function readCharExtBumpAliases() {
  try {
    const ctx = getContext();
    const id = ctx?.characterId ?? ctx?.this_chid;
    if (id == null) return {};
    const char = ctx?.getCharacter?.(id) ?? (Array.isArray(ctx?.characters) ? ctx.characters[id] : null);
    const ns = char?.data?.extensions?.[LWB_EXT_ID];
    const vc = ns?.variablesCore;
    const bump = vc?.bumpAliases;
    if (bump && typeof bump === 'object') return bump;
    const legacy = char?.extensions?.[LWB_EXT_ID]?.variablesCore?.bumpAliases;
    if (legacy && typeof legacy === 'object') {
      writeCharExtBumpAliases(legacy);
      return legacy;
    }
    return {};
  } catch { return {}; }
}
async function writeCharExtBumpAliases(newStore) {
  try {
    const ctx = getContext();
    const id = ctx?.characterId ?? ctx?.this_chid;
    if (id == null) return;
    if (typeof ctx?.writeExtensionField === 'function') {
      await ctx.writeExtensionField(id, LWB_EXT_ID, {
        variablesCore: { bumpAliases: structuredClone(newStore || {}) },
      });
      const char = ctx?.getCharacter?.(id) ?? (Array.isArray(ctx?.characters) ? ctx.characters[id] : null);
      if (char) {
        char.data = char.data && typeof char.data === 'object' ? char.data : {};
        char.data.extensions = char.data.extensions && typeof char.data === 'object' ? char.data.extensions : {};
        const ns = (char.data.extensions[LWB_EXT_ID] ||= {});
        ns.variablesCore = ns.variablesCore && typeof ns.variablesCore === 'object' ? ns.variablesCore : {};
        ns.variablesCore.bumpAliases = structuredClone(newStore || {});
      }
      if (typeof ctx?.saveCharacter === 'function') {
        await ctx.saveCharacter();
      } else {
        ctx?.saveCharacterDebounced?.();
      }
      return;
    }
    const char = ctx?.getCharacter?.(id) ?? (Array.isArray(ctx?.characters) ? ctx.characters[id] : null);
    if (char) {
      char.data = char.data && typeof char.data === 'object' ? char.data : {};
      char.data.extensions = char.data.extensions && typeof char.data === 'object' ? char.data.extensions : {};
      const ns = (char.data.extensions[LWB_EXT_ID] ||= {});
      ns.variablesCore = ns.variablesCore && typeof ns.variablesCore === 'object' ? ns.variablesCore : {};
      ns.variablesCore.bumpAliases = structuredClone(newStore || {});
    }
    if (typeof ctx?.saveCharacter === 'function') {
      await ctx.saveCharacter();
    } else {
      ctx?.saveCharacterDebounced?.();
    }
  } catch {}
}
function getBumpAliasStore() {
  return readCharExtBumpAliases();
}
async function setBumpAliasStore(newStore) {
  await writeCharExtBumpAliases(newStore);
}
async function clearBumpAliasStore() {
  await writeCharExtBumpAliases({});
}
function extractVareventBlocks(text) {
  if (!text || typeof text!=='string') return [];
  const out=[]; let m;
  TAG_RE.scenario.lastIndex=0;
  while((m=TAG_RE.scenario.exec(text))!==null){ const inner=m[1]??''; if(inner.trim()) out.push(inner) }
  return out;
}
function getBumpAliasMap() {
  try { return getBumpAliasStore(); } catch { return {}; }
}
function matchAlias(varOrKey, rhs) {
  const map = getBumpAliasMap();
  const scopes = [map._global || {}, map[varOrKey] || {}];
  for (const scope of scopes) {
    for (const [k, v] of Object.entries(scope)) {
      if (k.startsWith('/') && k.lastIndexOf('/') > 0) {
        const last = k.lastIndexOf('/');
        try {
          const re = new RegExp(k.slice(1, last), k.slice(last + 1));
          if (re.test(rhs)) return Number(v);
        } catch {}
      } else {
        if (rhs === k) return Number(v);
      }
    }
  }
  return null;
}
function preprocessBumpAliases(innerText) {
  const lines = String(innerText || '').split(/\r?\n/);
  const out = [];
  let inBump = false;
  const indentOf = (s) => s.length - s.trimStart().length;
  const stack = [];
  let currentVarRoot = '';
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();
    if (!t) { out.push(raw); continue; }
    const ind = indentOf(raw);
    const mTop = TOP_OP_RE.exec(t);
    if (mTop && ind === 0) {
      const opKey = OP_MAP[mTop[1].toLowerCase()] || '';
      inBump = opKey === 'bump';
      stack.length = 0;
      currentVarRoot = '';
      out.push(raw);
      continue;
    }
    if (!inBump) { out.push(raw); continue; }
    while (stack.length && stack[stack.length - 1].indent >= ind) stack.pop();
    const mKV = t.match(/^([^:]+):\s*(.*)$/);
    if (mKV) {
      const key = mKV[1].trim();
      const val = String(stripYamlInlineComment(mKV[2])).trim();
      const parentPath = stack.length ? stack[stack.length - 1].path : '';
      const curPath = parentPath ? `${parentPath}.${key}` : key;
      if (val === '') {
        stack.push({ indent: ind, path: curPath });
        if (!parentPath) currentVarRoot = key;
        out.push(raw);
        continue;
      }
      let rhs = val.replace(/^["']|["']$/g, '');
      const leafKey = key;
      const num = matchAlias(leafKey, rhs) ?? matchAlias(currentVarRoot, rhs) ?? matchAlias('', rhs);
      if (num !== null && Number.isFinite(num)) {
        out.push(raw.replace(/:\s*.*$/, `: ${num}`));
      } else {
        out.push(raw);
      }
      continue;
    }
    const mArr = t.match(/^\-\s*(.+)$/);
    if (mArr) {
      let rhs = String(stripYamlInlineComment(mArr[1])).trim().replace(/^["']|["']$/g, '');
      const leafKey = stack.length ? stack[stack.length - 1].path.split('.').pop() : '';
      const num = matchAlias(leafKey || currentVarRoot, rhs) ?? matchAlias(currentVarRoot, rhs) ?? matchAlias('', rhs);
      if (num !== null && Number.isFinite(num)) {
        out.push(raw.replace(/-\s*.*$/, `- ${num}`));
      } else {
        out.push(raw);
      }
      continue;
    }
    out.push(raw);
  }
  return out.join('\n');
}
function parseBlock(innerText) {
  innerText = preprocessBumpAliases(innerText);
  const textForJsonToml = stripLeadingHtmlComments(innerText);
  const ops = { set: {}, push: {}, bump: {}, del: {} };
  const lines = String(innerText || '').split(/\r?\n/);
  const indentOf = (s) => s.length - s.trimStart().length;
  const stripQ = (s) => { let t = String(s ?? '').trim(); if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) t = t.slice(1, -1); return t; };
  const norm = (p) => String(p || '').replace(/\[(\d+)\]/g, '.$1');
  const guardMap = new Map();
  const recordGuardDirective = (path, directives) => {
    const tokens = Array.isArray(directives) ? directives.map(t => String(t || '').trim()).filter(Boolean) : [];
    if (!tokens.length) return;
    const normalizedPath = norm(path);
    if (!normalizedPath) return;
    let bag = guardMap.get(normalizedPath);
    if (!bag) {
      bag = new Set();
      guardMap.set(normalizedPath, bag);
    }
    for (const tok of tokens) {
      if (tok) bag.add(tok);
    }
  };
  const extractDirectiveInfo = (rawKey) => {
    const text = String(rawKey || '').trim().replace(/:$/, '');
    if (!text) {
      return { directives: [], remainder: '', original: '' };
    }
    const directives = [];
    let idx = 0;
    while (idx < text.length) {
      while (idx < text.length && /\s/.test(text[idx])) idx++;
      if (idx >= text.length) break;
      if (text[idx] !== '$') break;
      const start = idx;
      idx++;
      while (idx < text.length && !/\s/.test(text[idx])) idx++;
      directives.push(text.slice(start, idx));
    }
    const remainder = text.slice(idx).trim();
    const seg = remainder || text;
    return {
      directives,
      remainder: seg,
      original: text,
    };
  };
  const buildPathInfo = (rawKey, parentPath) => {
    const parent = String(parentPath || '').trim();
    const { directives, remainder, original } = extractDirectiveInfo(rawKey);
    const segTrim = String(remainder || original || '').trim();
    const curPathRaw = segTrim ? (parent ? `${parent}.${segTrim}` : segTrim) : parent;
    const guardTargetRaw = directives.length ? (segTrim ? curPathRaw : parent || curPathRaw) : '';
    return {
      directives,
      curPathRaw,
      guardTargetRaw,
      segment: segTrim,
    };
  };
  let curOp = '';
  const stack = [];
  const putSet = (top, path, value) => { (ops.set[top] ||= {}); ops.set[top][path] = value; };
  const putPush = (top, path, value) => { (ops.push[top] ||= {}); const arr = (ops.push[top][path] ||= []); Array.isArray(value) ? arr.push(...value) : arr.push(value); };
  const putBump = (top, path, delta) => { const n = Number(String(delta).replace(/^\+/, '')); if (!Number.isFinite(n)) return; (ops.bump[top] ||= {}); ops.bump[top][path] = (ops.bump[top][path] ?? 0) + n; };
  const putDel = (top, path) => { (ops.del[top] ||= []); ops.del[top].push(path); };
  const finalizeResults = () => {
    const results = [];
    for (const [top, flat] of Object.entries(ops.set)) if (flat && Object.keys(flat).length) results.push({ name: top, operation: 'setObject', data: flat });
    for (const [top, flat] of Object.entries(ops.push)) if (flat && Object.keys(flat).length) results.push({ name: top, operation: 'push', data: flat });
    for (const [top, flat] of Object.entries(ops.bump)) if (flat && Object.keys(flat).length) results.push({ name: top, operation: 'bump', data: flat });
    for (const [top, list] of Object.entries(ops.del)) if (Array.isArray(list) && list.length) results.push({ name: top, operation: 'del', data: list });
    if (guardMap.size) {
      const guardList = [];
      for (const [path, tokenSet] of guardMap.entries()) {
        const directives = Array.from(tokenSet).filter(Boolean);
        if (directives.length) guardList.push({ path, directives });
      }
      if (guardList.length) results.push({ operation: 'guard', data: guardList });
    }
    return results;
  };
  function normalizeOpName(k) {
    if (!k) return null;
    const kl = String(k).toLowerCase().trim();
    return OP_MAP[kl] || null;
  }
  // ========== 统一解析器：JSON/TOML/YAML 统一处理逻辑 ==========
  const decodeKey = (rawKey) => {
    const { directives, remainder, original } = extractDirectiveInfo(rawKey);
    const path = (remainder || original || String(rawKey)).trim();
    if (directives && directives.length) recordGuardDirective(path, directives);
    return path;
  };

  const walkNode = (op, top, node, basePath = '') => {
    if (op === 'set') {
      if (node === null || node === undefined) return;
      if (typeof node !== 'object' || Array.isArray(node)) {
        putSet(top, norm(basePath), node);
        return;
      }
      for (const [rawK, v] of Object.entries(node)) {
        const k = decodeKey(rawK);
        const p = norm(basePath ? `${basePath}.${k}` : k);
        if (Array.isArray(v)) putSet(top, p, v);
        else if (v && typeof v === 'object') walkNode(op, top, v, p);
        else putSet(top, p, v);
      }
    } else if (op === 'push') {
      if (!node || typeof node !== 'object' || Array.isArray(node)) return;
      for (const [rawK, v] of Object.entries(node)) {
        const k = decodeKey(rawK);
        const p = norm(basePath ? `${basePath}.${k}` : k);
        if (Array.isArray(v)) for (const it of v) putPush(top, p, it);
        else if (v && typeof v === 'object') walkNode(op, top, v, p);
        else putPush(top, p, v);
      }
    } else if (op === 'bump') {
      if (!node || typeof node !== 'object' || Array.isArray(node)) return;
      for (const [rawK, v] of Object.entries(node)) {
        const k = decodeKey(rawK);
        const p = norm(basePath ? `${basePath}.${k}` : k);
        if (v && typeof v === 'object' && !Array.isArray(v)) walkNode(op, top, v, p);
        else putBump(top, p, v);
      }
    } else if (op === 'del') {
      const acc = new Set();
      const collect = (n, base = '') => {
        if (Array.isArray(n)) {
          for (const it of n) {
            if (typeof it === 'string') {
              const full = base ? `${base}.${decodeKey(it)}` : decodeKey(it);
              if (full) acc.add(norm(full));
            } else if (it && typeof it === 'object') collect(it, base);
          }
        } else if (n && typeof n === 'object') {
          let hasChild = false;
          for (const [rawK, v] of Object.entries(n)) {
            hasChild = true;
            const k = decodeKey(rawK);
            const nextBase = base ? `${base}.${k}` : k;
            if (v && typeof v === 'object') collect(v, nextBase);
            else if (nextBase) acc.add(norm(nextBase));
          }
          if (!hasChild && base) acc.add(norm(base));
        } else if (base) acc.add(norm(base));
      };
      collect(node, basePath);
      if (acc.size === 0 && !Array.isArray(node) && node && typeof node === 'object' && Object.keys(node).length === 0) {
        const full = norm(basePath || top);
        if (full) acc.add(full);
      }
      for (const p of acc) {
        const std = p.replace(/\[(\d+)\]/g, '.$1');
        const parts = std.split('.').filter(Boolean);
        const t = parts.shift();
        const rel = parts.join('.');
        if (t) putDel(t, rel);
      }
    }
  };

  const processStructuredData = (data) => {
    const process = (d) => {
      if (!d || typeof d !== 'object') return;
      for (const [k, v] of Object.entries(d)) {
        const op = normalizeOpName(k);
        if (!op || v == null) continue;
        if (op === 'del' && Array.isArray(v)) {
          for (const it of v) {
            const std = String(it).replace(/\[(\d+)\]/g, '.$1');
            const parts = std.split('.').filter(Boolean);
            const top = parts.shift();
            const rel = parts.join('.');
            if (top) putDel(top, rel);
          }
          continue;
        }
        if (typeof v !== 'object') continue;
        for (const [rawTop, payload] of Object.entries(v)) {
          const top = decodeKey(rawTop);
		if (op === 'push') {
		  if (Array.isArray(payload)) {
		    for (const it of payload) putPush(top, '', it);
		  } else if (payload && typeof payload === 'object') {
		    walkNode(op, top, payload);
		  } else {
		    putPush(top, '', payload);
		  }
		} else if (op === 'bump' && (typeof payload !== 'object' || Array.isArray(payload))) {
		  putBump(top, '', payload);
		} else if (op === 'del' && (!payload || typeof payload !== 'object')) {
		  const full = norm(top);
		  if (full) {
		    const std = full.replace(/\[(\d+)\]/g, '.$1');
		    const parts = std.split('.').filter(Boolean);
		    const t = parts.shift();
		    const rel = parts.join('.');
		    if (t) putDel(t, rel);
		  }
		} else {
		  walkNode(op, top, payload);
		}
          
        }
      }
    };

    if (Array.isArray(data)) {
      for (const entry of data) {
        if (entry && typeof entry === 'object') process(entry);
      }
    } else {
      process(data);
    }
    return true;
  };

  const tryParseJson = (text) => {
    const s = String(text || '').trim();
    if (!s || (s[0] !== '{' && s[0] !== '[')) return false;

    const relaxJson = (src) => {
      let out = '', i = 0, inStr = false, q = '', esc = false;
      const numRe = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;
      const bareRe = /[A-Za-z_$]|[^\x00-\x7F]/;
      while (i < src.length) {
        const ch = src[i];
        if (inStr) {
          out += ch;
          if (esc) esc = false;
          else if (ch === '\\') esc = true;
          else if (ch === q) { inStr = false; q = ''; }
          i++;
          continue;
        }
        if (ch === '"' || ch === "'") { inStr = true; q = ch; out += ch; i++; continue; }
        if (ch === ':') {
          out += ch; i++;
          let j = i;
          while (j < src.length && /\s/.test(src[j])) { out += src[j]; j++; }
          if (j >= src.length || !bareRe.test(src[j])) { i = j; continue; }
          let k = j;
          while (k < src.length && !/[,}\]\s:]/.test(src[k])) k++;
          const tok = src.slice(j, k), low = tok.toLowerCase();
          if (low === 'true' || low === 'false' || low === 'null' || numRe.test(tok)) out += tok;
          else out += `"${tok.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
          i = k;
          continue;
        }
        out += ch; i++;
      }
      return out;
    };

    const attempt = (src) => {
      try {
        const parsed = JSON.parse(src);
        return processStructuredData(parsed);
      } catch {
        return false;
      }
    };

    if (attempt(s)) return true;
    const relaxed = relaxJson(s);
    return relaxed !== s && attempt(relaxed);
  };

  const tryParseToml = (text) => {
    const src = String(text || '').trim();
    if (!src || !src.includes('[') || !src.includes('=')) return false;
    try {
      const parseVal = (raw) => {
        const v = String(raw ?? '').trim();
        if (v === 'true') return true;
        if (v === 'false') return false;
        if (/^-?\d+$/.test(v)) return parseInt(v, 10);
        if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          const inner = v.slice(1, -1);
          return v.startsWith('"') ? inner.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\') : inner;
        }
        if (v.startsWith('[') && v.endsWith(']')) {
          try { return JSON.parse(v.replace(/'/g, '"')); } catch { return v; }
        }
        return v;
      };

      const L = src.split(/\r?\n/);
      let i = 0, curOp = '';
      while (i < L.length) {
        let line = L[i].trim();
        i++;
        if (!line || line.startsWith('#')) continue;
        const sec = line.match(/\[\s*([^\]]+)\s*\]$/);
        if (sec) { curOp = normalizeOpName(sec[1]) || ''; continue; }
        if (!curOp) continue;
        const kv = line.match(/^([^=]+)=(.*)$/);
        if (!kv) continue;
        const keyRaw = kv[1].trim();
        const rhsRaw = kv[2];
        const hasTriple = rhsRaw.includes('"""') || rhsRaw.includes("'''");
        const rhs = hasTriple ? rhsRaw : stripYamlInlineComment(rhsRaw);
        const cleaned = stripQ(keyRaw);
        const { directives, remainder, original } = extractDirectiveInfo(cleaned);
        const core = remainder || original || cleaned;
        const segs = core.split('.').map(seg => stripQ(String(seg).trim())).filter(Boolean);
        if (!segs.length) continue;
        const top = segs[0];
        const rest = segs.slice(1);
        const relNorm = norm(rest.join('.'));
        if (directives && directives.length) recordGuardDirective(norm(segs.join('.')), directives);
        if (!hasTriple) {
          const value = parseVal(rhs);
          if (curOp === 'set') putSet(top, relNorm, value);
          else if (curOp === 'push') putPush(top, relNorm, value);
          else if (curOp === 'bump') putBump(top, relNorm, value);
          else if (curOp === 'del') putDel(top, relNorm || norm(segs.join('.')));
        }
      }
      return true;
    } catch { return false; }
  };

  if (tryParseJson(textForJsonToml)) return finalizeResults();
  if (tryParseToml(textForJsonToml)) return finalizeResults();
  const readList = (startIndex, parentIndent) => {
    const out = [];
    let i = startIndex;
    for (; i < lines.length; i++) {
      const raw = lines[i];
      const t = raw.trim();
      if (!t) continue;
      const ind = indentOf(raw);
      if (ind <= parentIndent) break;
      const m = t.match(/^-+\s*(.+)$/);
      if (m) out.push(stripQ(stripYamlInlineComment(m[1]))); else break;
    }
    return { arr: out, next: i - 1 };
  };
  const readBlockScalar = (startIndex, parentIndent, ch) => {
    const out = [];
    let i = startIndex;
    for (; i < lines.length; i++) {
      const raw = lines[i];
      const t = raw.trimEnd();
      const tt = raw.trim();
      const ind = indentOf(raw);
      if (!tt) { out.push(''); continue; }
      if (ind <= parentIndent) {
        const isKey = /^[^\s-][^:]*:\s*(?:\||>.*|.*)?$/.test(tt);
        const isListSibling = tt.startsWith('- ');
        const isTopOp = (parentIndent === 0) && TOP_OP_RE.test(tt);
        if (isKey || isListSibling || isTopOp) break;
        out.push(t);
        continue;
      }
      out.push(raw.slice(parentIndent + 2));
    }
    let text = out.join('\n');
    if (text.startsWith('\n')) text = text.slice(1);
    if (ch === '>') text = text.replace(/\n(?!\n)/g, ' ');
    return { text, next: i - 1 };
  };
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();
    if (!t || t.startsWith('#')) continue;
    const ind = indentOf(raw);
    const mTop = TOP_OP_RE.exec(t);
    if (mTop && ind === 0) { curOp = OP_MAP[mTop[1].toLowerCase()] || ''; stack.length = 0; continue; }
    if (!curOp) continue;
    while (stack.length && stack[stack.length - 1].indent >= ind) stack.pop();
    const mKV = t.match(/^([^:]+):\s*(.*)$/);
    if (mKV) {
      const key = mKV[1].trim();
      const rhs = String(stripYamlInlineComment(mKV[2])).trim();
      const parentInfo = stack.length ? stack[stack.length - 1] : null;
      const parentPath = parentInfo ? parentInfo.path : '';
      const inheritedDirs = parentInfo && Array.isArray(parentInfo.directives) ? parentInfo.directives : [];
      const inheritedForChildren = parentInfo && Array.isArray(parentInfo.directivesForChildren) ? parentInfo.directivesForChildren : inheritedDirs;
      const info = buildPathInfo(key, parentPath);
      const combinedDirs = [...inheritedDirs, ...info.directives];
      const nextInherited = info.directives.length ? info.directives : inheritedForChildren;
      const effectiveGuardDirs = info.directives.length ? info.directives : inheritedDirs;
      if (effectiveGuardDirs.length && info.guardTargetRaw) {
        recordGuardDirective(info.guardTargetRaw, effectiveGuardDirs);
      }
      const curPathRaw = info.curPathRaw;
      const curPath = norm(curPathRaw);
      if (!curPath) continue;
      if (rhs && (rhs[0] === '|' || rhs[0] === '>')) {
        const { text, next } = readBlockScalar(i + 1, ind, rhs[0]);
        i = next;
        const [top, ...rest] = curPath.split('.');
        const rel = rest.join('.');
        if (curOp === 'set') putSet(top, rel, text);
        else if (curOp === 'push') putPush(top, rel, text);
        else if (curOp === 'bump') putBump(top, rel, Number(text));
        continue;
      }
      if (rhs === '') {
        stack.push({ indent: ind, path: curPath, directives: combinedDirs, directivesForChildren: nextInherited });
        let j = i + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        let handledList = false;
        if (j < lines.length) {
          const t2 = lines[j].trim();
          const ind2 = indentOf(lines[j]);
          if (ind2 > ind && /^-+\s+/.test(t2)) {
            const { arr, next } = readList(j, ind);
            i = next;
            const [top, ...rest] = curPath.split('.');
            const rel = rest.join('.');
            if (curOp === 'set') putSet(top, rel, arr);
            else if (curOp === 'push') putPush(top, rel, arr);
            else if (curOp === 'del') for (const item of arr) putDel(top, rel ? `${rel}.${item}` : item);
            else if (curOp === 'bump') for (const item of arr) putBump(top, rel, Number(item));
            stack.pop();
            handledList = true;
          }
        }
        if (!handledList && curOp === 'del') {
          const [top, ...rest] = curPath.split('.');
          const rel = rest.join('.');
          putDel(top, rel);
          stack.pop();
        }
        continue;
      }
      const [top, ...rest] = curPath.split('.');
      const rel = rest.join('.');
      if (curOp === 'set') putSet(top, rel, stripQ(rhs));
      else if (curOp === 'push') putPush(top, rel, stripQ(rhs));
      else if (curOp === 'del') putDel(top, rel);
      else if (curOp === 'bump') putBump(top, rel, Number(stripQ(rhs)));
      continue;
    }
    const mArr = t.match(/^-+\s*(.+)$/);
    if (mArr && stack.length === 0 && curOp === 'del') {
      const rawItem = stripQ(stripYamlInlineComment(mArr[1]));
      if (rawItem) {
        const std = (String(rawItem) || '').replace(/\[(\d+)\]/g, '.$1');
        const [top, ...rest] = std.split('.');
        const rel = rest.join('.');
        if (top) putDel(top, rel);
      }
      continue;
    }
    if (mArr && stack.length) {
      const curPath = stack[stack.length - 1].path;
      const [top, ...rest] = curPath.split('.');
      const rel = rest.join('.');
      const val = stripQ(stripYamlInlineComment(mArr[1]));
      if (curOp === 'set') {
        const bucket = (ops.set[top] ||= {});
        const prev = bucket[rel];
        if (Array.isArray(prev)) prev.push(val);
        else if (prev !== undefined) bucket[rel] = [prev, val];
        else bucket[rel] = [val];
      } else if (curOp === 'push') putPush(top, rel, val);
      else if (curOp === 'del') putDel(top, rel ? `${rel}.${val}` : val);
      else if (curOp === 'bump') putBump(top, rel, Number(val));
      continue;
    }
  }
  return finalizeResults();
}
async function applyVariablesForMessage(messageId){
  try{
    const ctx=getContext(); const msg=ctx?.chat?.[messageId]; if(!msg) return;
    const rawKey = (typeof msg?.mes==='string') ? 'mes' : (typeof msg?.content==='string' ? 'content' : null);
    const rawTextForSig = rawKey ? String(msg[rawKey] ?? '') : '';
    const curSig = computePlotSignatureFromText(rawTextForSig);
    if (!curSig) { clearAppliedFor(messageId); return; }
    const appliedMap = getAppliedMap();
    if (appliedMap[messageId] === curSig) return;

    const raw=(typeof msg.mes==='string'?msg.mes:(typeof msg.content==='string'?msg.content:'')) ?? '';
    const blocks=extractVareventBlocks(raw); if(blocks.length===0) { clearAppliedFor(messageId); return; }

    const ops=[]; const delVarNames=new Set();
    blocks.forEach((b,idx)=>{
      const parts=parseBlock(b);
      for(const p of parts){
        if(p.operation==='guard' && Array.isArray(p.data) && p.data.length>0){
          ops.push({operation:'guard',data:p.data});
          continue;
        }
        const name=p.name&&p.name.trim()?p.name.trim():`varevent_${idx+1}`;
        if(p.operation==='setObject' && p.data && Object.keys(p.data).length>0) ops.push({name,operation:'setObject',data:p.data});
        else if(p.operation==='del' && Array.isArray(p.data) && p.data.length>0) ops.push({name,operation:'del',data:p.data});
        else if(p.operation==='push' && p.data && Object.keys(p.data).length>0) ops.push({name,operation:'push',data:p.data});
        else if(p.operation==='bump' && p.data && Object.keys(p.data).length>0) ops.push({name,operation:'bump',data:p.data});
        else if(p.operation==='delVar') delVarNames.add(name);
      }
    });

    if(ops.length===0 && delVarNames.size===0) { setAppliedSignature(messageId, curSig); return; }

    const byName=new Map();
    for(const {name} of ops){
      if (!name || typeof name !== 'string') continue;
      const {root}=getRootAndPath(name);
      if(!byName.has(root)){
        const curRaw=getLocalVariable(root); const obj=parseObj(curRaw);
        if(obj){
          byName.set(root,{mode:'object',base:obj,next:{...obj},changed:false});
        }else{
          byName.set(root,{mode:'scalar', scalar: (curRaw ?? ''), changed:false});
        }
      }
    }

    function bumpAtPath(rec, path, delta){
      const numDelta = Number(delta);
      if (!Number.isFinite(numDelta)) return false;
      if (!path) {
        if (rec.mode === 'scalar') {
          let base = Number(rec.scalar);
          if (!Number.isFinite(base)) base = 0;
          const next = base + numDelta;
          const nextStr = String(next);
          if (rec.scalar !== nextStr) {
            rec.scalar = nextStr;
            rec.changed = true;
            return true;
          }
        }
        return false;
      }
      const obj = asObject(rec);
      const segs = splitPathSegments(path);
      const { parent, lastKey } = ensureDeepContainer(obj, segs);
      const prev = parent?.[lastKey];
      if (Array.isArray(prev)) {
        if (prev.length === 0) {
          prev.push(numDelta);
          rec.changed = true;
          return true;
        }
        let base = Number(prev[0]);
        if (!Number.isFinite(base)) base = 0;
        const next = base + numDelta;
        if (prev[0] !== next) {
          prev[0] = next;
          rec.changed = true;
          return true;
        }
        return false;
      }
      if (prev && typeof prev === 'object') return false;
      let base = Number(prev);
      if (!Number.isFinite(base)) base = 0;
      const next = base + numDelta;
      if (prev !== next) {
        parent[lastKey] = next;
        rec.changed = true;
        return true;
      }
      return false;
    }

    function parseScalarArrayMaybe(str){
      try{
        const v = JSON.parse(String(str??''));
        return Array.isArray(v) ? v : null;
      }catch{ return null; }
    }

    const norm = (p)=> String(p||'').replace(/\[(\d+)\]/g, '.$1');

    for(const op of ops){
      if (op.operation === 'guard') {
        const entries = Array.isArray(op.data) ? op.data : [];
        if (typeof parseDirectivesTokenList === 'function' && typeof applyRuleDelta === 'function') {
          for (const entry of entries) {
            const path = typeof entry?.path === 'string' ? entry.path.trim() : '';
            const tokens = Array.isArray(entry?.directives) ? entry.directives.map(t => String(t || '').trim()).filter(Boolean) : [];
            if (!path || !tokens.length) continue;
            try {
              const delta = parseDirectivesTokenList(tokens);
              if (!delta) continue;
              const normalizedPath = typeof normalizePath === 'function' ? normalizePath(path) : path;
              applyRuleDelta(normalizedPath, delta);
            } catch {}
          }
        }
        try { if (typeof rulesSaveToMeta === 'function') rulesSaveToMeta(); } catch {}
        continue;
      }

      const {root, subPath}=getRootAndPath(op.name);
      const rec=byName.get(root); if(!rec) continue;

      if(op.operation==='setObject'){
        for(const [k,v] of Object.entries(op.data)){
          const localPath=joinPath(subPath,k);
          const absPath = (localPath ? `${root}.${localPath}` : root);
          const stdPath = typeof normalizePath==='function' ? normalizePath(absPath) : absPath;
          let allow = true;
          let newValInit = (typeof _parseValueForSet === 'function') ? _parseValueForSet(v) : v;
          let newVal = newValInit;
          if (typeof guardValidate==='function') {
            const res = guardValidate('set', stdPath, newValInit);
            allow = !!res?.allow;
            if (res && 'value' in res) newVal = res.value;
          }
          if(!allow) continue;

          if(!localPath){
            if(newVal!==null && typeof newVal==='object'){
              rec.mode='object';
              rec.next=structuredClone(newVal);
              rec.changed=true;
            }else{
              rec.mode='scalar';
              rec.scalar=String(newVal ?? '');
              rec.changed=true;
            }
            continue;
          }
          const obj=asObject(rec);
          if(setDeepValue(obj,norm(localPath),newVal)) rec.changed=true;
        }
      }

      else if(op.operation==='del'){
        const obj=asObject(rec);

        const pending = [];
        for(const key of op.data){
          const localPath=joinPath(subPath,key);

          if(!localPath){
            const absRoot = root;
            const stdPath = typeof normalizePath==='function' ? normalizePath(absRoot) : absRoot;
            let allow = true;
            if (typeof guardValidate==='function') {
              const res = guardValidate('delNode', stdPath);
              allow = !!res?.allow;
            }
            if(!allow) continue;

            if(rec.mode==='scalar'){
              if(rec.scalar!==''){ rec.scalar=''; rec.changed=true; }
            }else{
              if(rec.next && (Array.isArray(rec.next) ? rec.next.length>0 : Object.keys(rec.next||{}).length>0)){
                rec.next = Array.isArray(rec.next) ? [] : {};
                rec.changed=true;
              }
            }
            continue;
          }

          const absPath = `${root}.${localPath}`;
          const stdPath = typeof normalizePath==='function' ? normalizePath(absPath) : absPath;
          let allow = true;
          if (typeof guardValidate==='function') {
            const res = guardValidate('delNode', stdPath);
            allow = !!res?.allow;
          }
          if(!allow) continue;

          const normLocal = norm(localPath);
          const segs = splitPathSegments(normLocal);
          const last = segs[segs.length - 1];
          const parentSegs = segs.slice(0, -1);
          const parentKey = parentSegs.join('.');

          pending.push({
            normLocal,
            isIndex: typeof last === 'number',
            parentKey,
            index: typeof last === 'number' ? last : null,
          });
        }

        const arrGroups = new Map();
        const objDeletes = [];

        for (const it of pending) {
          if (it.isIndex) {
            const g = arrGroups.get(it.parentKey) || [];
            g.push(it);
            arrGroups.set(it.parentKey, g);
          } else {
            objDeletes.push(it);
          }
        }

        for (const [parentKey, list] of arrGroups.entries()) {
          list.sort((a, b) => b.index - a.index);
          for (const it of list) {
            if (deleteDeepKey(obj, it.normLocal)) rec.changed = true;
          }
        }

        for (const it of objDeletes) {
          if (deleteDeepKey(obj, it.normLocal)) rec.changed = true;
        }
      }

      else if(op.operation==='push'){
        for(const [k,vals] of Object.entries(op.data)){
          const localPath=joinPath(subPath,k);
          const absPathBase = localPath ? `${root}.${localPath}` : root;
          let incoming = Array.isArray(vals) ? vals : [vals];
          const filtered = [];
          for (const v of incoming) {
            const stdPath = typeof normalizePath==='function' ? normalizePath(absPathBase) : absPathBase;
            let allow = true; let newVal = v;
            if (typeof guardValidate==='function') {
              const res = guardValidate('push', stdPath, v);
              allow = !!res?.allow;
              if (res && 'value' in res) newVal = res.value;
            }
            if (allow) filtered.push(newVal);
          }
          if (filtered.length===0) continue;

          if(!localPath){
            let arrRef=null;
            if(rec.mode==='object'){
              if(Array.isArray(rec.next)){
                arrRef=rec.next;
              }else if(rec.next && typeof rec.next==='object' && Object.keys(rec.next).length===0){
                rec.next=[]; arrRef=rec.next;
              }else if(Array.isArray(rec.base)){
                rec.next = [...rec.base]; arrRef = rec.next;
              }else{
                rec.next = []; arrRef = rec.next;
              }
            }else{
              const parsed = parseScalarArrayMaybe(rec.scalar);
              rec.mode='object';
              rec.next = parsed ?? [];
              arrRef = rec.next;
            }
            let changed=false;
            for(const v of filtered){
              if(!arrRef.includes(v)){ arrRef.push(v); changed=true; }
            }
            if(changed) rec.changed=true;
            continue;
          }

          const obj=asObject(rec);
          if(pushDeepValue(obj,norm(localPath),filtered)) rec.changed=true;
        }
      }

      else if(op.operation==='bump'){
        for(const [k,delta] of Object.entries(op.data)){
          const num=Number(delta); if(!Number.isFinite(num)) continue;
          const localPath=joinPath(subPath,k);
          const absPath = localPath ? `${root}.${localPath}` : root;
          const stdPath = typeof normalizePath==='function' ? normalizePath(absPath) : absPath;
          let allow = true; let useDelta = num;
          if (typeof guardValidate==='function') {
            const res = guardValidate('bump', stdPath, num);
            allow = !!res?.allow;
            if (allow && res && 'value' in res && Number.isFinite(res.value)) {
              let curr = undefined;
              try {
                const pth = (String(localPath||'')).replace(/\[(\d+)\]/g, '.$1');
                if (!pth) {
                  if (rec.mode === 'scalar') curr = Number(rec.scalar);
                } else {
                  const segs = splitPathSegments(pth);
                  const obj = asObject(rec);
                  const { parent, lastKey } = ensureDeepContainer(obj, segs);
                  curr = parent?.[lastKey];
                }
              } catch {}
              const baseNum = Number(curr);
              const targetNum = Number(res.value);
              useDelta = (Number.isFinite(targetNum) ? targetNum : num) - (Number.isFinite(baseNum) ? baseNum : 0);
            }
          }
          if (!allow) continue;
          bumpAtPath(rec, (String(localPath||'')).replace(/\[(\d+)\]/g, '.$1'), useDelta);
        }
      }
    }

    const hasChanges = Array.from(byName.values()).some(rec => rec && rec.changed === true);
    if(!hasChanges && delVarNames.size===0) { setAppliedSignature(messageId, curSig); return; }

    for(const [name,rec] of byName.entries()){
      if(!rec.changed) continue;
      try{
        if(rec.mode==='scalar'){
          setLocalVariable(name, rec.scalar??'');
        }else{
          setLocalVariable(name, json(rec.next??{}));
        }
      }catch(e){}
    }

    if(delVarNames.size>0){
      try{
        for (const v of delVarNames) {
          try { setLocalVariable(v, ''); } catch {}
        }
        const meta=ctx?.chatMetadata;
        if(meta && meta.variables){
          for(const v of delVarNames) delete meta.variables[v];
          ctx?.saveMetadataDebounced?.(); ctx?.saveSettingsDebounced?.();
        }
      }catch(e){}
    }

    setAppliedSignature(messageId, curSig);
  }catch(err){}
}

if (typeof window !== 'undefined') {
  window.getBumpAliasStore = getBumpAliasStore;
  window.setBumpAliasStore = setBumpAliasStore;
  window.clearBumpAliasStore = clearBumpAliasStore;
}
/* ============= 第二区：世界书条件事件系统（最终流就地替换） ============= */
const LWB_VAREVENT_PROMPT_KEY = 'LWB_varevent_display';

function installWIHiddenTagStripper() {
  const ctx = getContext();
  const ext = ctx?.extensionSettings;
  if (!ext) return;
  ext.regex = Array.isArray(ext.regex) ? ext.regex : [];
  ext.regex = ext.regex.filter(r =>
    !['lwb-varevent-stripper', 'lwb-varevent-replacer'].includes(r?.id) &&
    !['LWB_VarEventStripper', 'LWB_VarEventReplacer'].includes(r?.scriptName)
  );
  ctx?.saveSettingsDebounced?.();
}

function enqueuePendingVareventBlock(innerText, sourceInfo) {
  try {
    const ctx = getContext();
    const meta = ctx?.chatMetadata || {};
    const list = (meta.LWB_PENDING_VAREVENT_BLOCKS ||= []);
    list.push({
      inner: String(innerText || ''),
      source: sourceInfo || 'unknown',
      turn: (ctx?.chat?.length ?? 0),
      ts: Date.now(),
    });
    ctx?.saveMetadataDebounced?.();
  } catch (e) {}
}

function drainPendingVareventBlocks() {
  try {
    const ctx = getContext();
    const meta = ctx?.chatMetadata || {};
    const list = Array.isArray(meta.LWB_PENDING_VAREVENT_BLOCKS) ? meta.LWB_PENDING_VAREVENT_BLOCKS.slice() : [];
    meta.LWB_PENDING_VAREVENT_BLOCKS = [];
    ctx?.saveMetadataDebounced?.();
    return list;
  } catch (e) {
    return [];
  }
}

function registerWIEventSystem() {
  const { eventSource, event_types } = getContext() || {};

  if (event_types?.CHAT_COMPLETION_PROMPT_READY) {
    const lateChatReplacementHandler = async (data) => {
      try {
        if (data?.dryRun) {
          return;
        }
        const chat = data?.chat;
        if (!Array.isArray(chat)) {
          return;
        }

        for (const msg of chat) {
          if (typeof msg?.content === 'string' && msg.content.includes('<varevent')) {
            TAG_RE.varevent.lastIndex = 0;
            let mm;
            while ((mm = TAG_RE.varevent.exec(msg.content)) !== null) {
              enqueuePendingVareventBlock(mm[1] ?? '', 'chat.content');
            }
            const replaced = await replaceVareventInString(msg.content, false, false);
            if (replaced !== msg.content) {
              msg.content = replaced;
            }
            if (typeof msg.content === 'string' && msg.content.indexOf('{{xbgetvar::') !== -1) {
              const r2 = replaceXbGetVarInString(msg.content);
              if (r2 !== msg.content) msg.content = r2;
            }
          }
          if (typeof msg?.content === 'string' && msg.content.indexOf('{{xbgetvar::') !== -1) {
            const r3 = replaceXbGetVarInString(msg.content);
            if (r3 !== msg.content) msg.content = r3;
          }
          else if (Array.isArray(msg?.content)) {
            for (const part of msg.content) {
              if (part && part.type === 'text' && typeof part.text === 'string' && part.text.includes('<varevent')) {
                TAG_RE.varevent.lastIndex = 0;
                let mm;
                while ((mm = TAG_RE.varevent.exec(part.text)) !== null) {
                  enqueuePendingVareventBlock(mm[1] ?? '', 'chat.content[].text');
                }
                const replaced = await replaceVareventInString(part.text, false, false);
                if (replaced !== part.text) {
                  part.text = replaced;
                }
                if (typeof part.text === 'string' && part.text.indexOf('{{xbgetvar::') !== -1) {
                  const r2 = replaceXbGetVarInString(part.text);
                  if (r2 !== part.text) part.text = r2;
                }
              }
              if (part && part.type === 'text' && typeof part.text === 'string' && part.text.indexOf('{{xbgetvar::') !== -1) {
                const r3 = replaceXbGetVarInString(part.text);
                if (r3 !== part.text) part.text = r3;
              }
            }
          }
          else if (typeof msg?.mes === 'string' && msg.mes.includes('<varevent')) {
            TAG_RE.varevent.lastIndex = 0;
            let mm;
            while ((mm = TAG_RE.varevent.exec(msg.mes)) !== null) {
              enqueuePendingVareventBlock(mm[1] ?? '', 'chat.mes');
            }
            const replaced = await replaceVareventInString(msg.mes, false, false);
            if (replaced !== msg.mes) {
              msg.mes = replaced;
            }
            if (typeof msg.mes === 'string' && msg.mes.indexOf('{{xbgetvar::') !== -1) {
              const r2 = replaceXbGetVarInString(msg.mes);
              if (r2 !== msg.mes) msg.mes = r2;
            }
          }
          if (typeof msg?.mes === 'string' && msg.mes.indexOf('{{xbgetvar::') !== -1) {
            const r3 = replaceXbGetVarInString(msg.mes);
            if (r3 !== msg.mes) msg.mes = r3;
          }
        }
      } catch (e) {}
    };

    let emitPatched = false;
    try {
      if (eventSource && typeof eventSource.emit === 'function' && !origEmitMap.has(eventSource)) {
        const origEmit = eventSource.emit;
        origEmitMap.set(eventSource, origEmit);
        eventSource.emit = async function (...args) {
          const [ev, ...rest] = args;
          const result = await origEmit.apply(this, args);
          try {
            if (ev === event_types.CHAT_COMPLETION_PROMPT_READY) {
              await lateChatReplacementHandler(rest[0]);
            }
          } catch {}
          return result;
        };
        emitPatched = true;
      }
    } catch {}

    if (!emitPatched) {
      if (typeof eventSource?.makeLast === 'function') {
        eventSource.makeLast(event_types.CHAT_COMPLETION_PROMPT_READY, lateChatReplacementHandler);
        listeners.push({ target: eventSource, event: event_types.CHAT_COMPLETION_PROMPT_READY, handler: lateChatReplacementHandler });
      } else {
        on(eventSource, event_types.CHAT_COMPLETION_PROMPT_READY, lateChatReplacementHandler);
      }
    }
  }

  if (event_types?.GENERATE_AFTER_COMBINE_PROMPTS) {
    on(eventSource, event_types.GENERATE_AFTER_COMBINE_PROMPTS, async (data) => {
      try {
        if (data?.dryRun) {
          return;
        }
        if (typeof data?.prompt === 'string' && data.prompt.includes('<varevent')) {
          TAG_RE.varevent.lastIndex = 0;
          let mm;
          while ((mm = TAG_RE.varevent.exec(data.prompt)) !== null) {
            enqueuePendingVareventBlock(mm[1] ?? '', 'prompt');
          }
          const replaced = await replaceVareventInString(data.prompt, false, false);
          if (replaced !== data.prompt) {
            data.prompt = replaced;
          }
          if (typeof data.prompt === 'string' && data.prompt.indexOf('{{xbgetvar::') !== -1) {
            const r2 = replaceXbGetVarInString(data.prompt);
            if (r2 !== data.prompt) data.prompt = r2;
          }
        }
        if (typeof data?.prompt === 'string' && data.prompt.indexOf('{{xbgetvar::') !== -1) {
          const r3 = replaceXbGetVarInString(data.prompt);
          if (r3 !== data.prompt) data.prompt = r3;
        }
      } catch (e) {}
    });
  }

  if (event_types?.GENERATION_ENDED) {
    on(eventSource, event_types.GENERATION_ENDED, () => {
      try {
        getContext()?.setExtensionPrompt?.(LWB_VAREVENT_PROMPT_KEY, '', 0, 0, false);
      } catch {}
    });
  }
  if (event_types?.CHAT_CHANGED) {
    on(eventSource, event_types.CHAT_CHANGED, () => {
      try {
        getContext()?.setExtensionPrompt?.(LWB_VAREVENT_PROMPT_KEY, '', 0, 0, false);
      } catch {}
    });
  }
}

async function replaceVareventInString(text, _dryRun, executeJs = false) {
  if (!text || text.indexOf('<varevent') === -1) {
    return text;
  }
  const replaceByRegexAsync = async (input, regex, repl) => {
    let out = '';
    let last = 0;
    regex.lastIndex = 0;
    let m;
    while ((m = regex.exec(input))) {
      out += input.slice(last, m.index);
      out += await repl(...m);
      last = regex.lastIndex;
    }
    return out + input.slice(last);
  };
  let result = text;
  result = await replaceByRegexAsync(result, TAG_RE.varevent, (m, inner) => buildVareventReplacement(inner, false, executeJs));
  return result;
}

async function buildVareventReplacement(innerText, dryRun, executeJs = false) {
  try {
    const events = parseVareventEvents(innerText);
    if (!events.length) {
      return '';
    }
    let chosen = null;
    for (let i = events.length - 1; i >= 0; i--) {
      const ev = events[i];
      const condStr = String(ev.condition ?? '').trim();
      const hasCond = !!condStr;
      const condOk = hasCond ? evaluateCondition(condStr) : true;
      const hasDisplay = !!(ev.display && String(ev.display).trim());
      const hasJs = !!(ev.js && String(ev.js).trim());

      if (!(hasDisplay || hasJs)) continue;
      if (condOk) {
        chosen = { ev, hasCond };
        break;
      }
    }
    if (!chosen) {
      return '';
    }
    const ev = chosen.ev;
    let out = ev.display && String(ev.display) ? String(ev.display) : '';
    out = out.replace(/^\n+/, '').replace(/\n+$/, '');
    if (!dryRun && executeJs && ev.js && String(ev.js).trim()) {
      try {
        await runJS(ev.js);
      } catch (jsError) {}
    }

    return out;
  } catch (error) {
    return '';
  }
}

function parseVareventEvents(innerText) {
  const events = [];
  const lines = String(innerText || '').split(/\r?\n/);
  let cur = null;
  const flush = () => { if (cur) { events.push(cur); cur = null; } };
  const isStopLine = (t) => {
    if (!t) return false;
    if (/^\[\s*event\.[^\]]+]\s*$/i.test(t)) return true;
    if (/^(condition|display|js_execute)\s*:/i.test(t)) return true;
    if (/^<\s*\/\s*varevent\s*>/i.test(t)) return true;
    return false;
  };
  const findUnescapedQuote = (str, q) => {
    for (let i = 0; i < str.length; i++) { if (str[i] === q && str[i - 1] !== '\\') return i; }
    return -1;
  };
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) continue;
    const header = /^\[\s*event\.([^\]]+)]\s*$/i.exec(line);
    if (header) { flush(); cur = { id: String(header[1]).trim() }; continue; }
    const m = /^(condition|display|js_execute)\s*:\s*(.*)$/i.exec(line);
    if (m) {
      const key = m[1].toLowerCase();
      let valPart = m[2] ?? '';
      if (!cur) cur = {};
      let value = '';
      const ltrim = valPart.replace(/^\s+/, '');
      const firstCh = ltrim[0];
      if (firstCh === '"' || firstCh === "'") {
        const quote = firstCh;
        let after = ltrim.slice(1);
        let endIdx = findUnescapedQuote(after, quote);
        if (endIdx !== -1) value = after.slice(0, endIdx);
        else {
          value = after + '\n';
          while (++i < lines.length) {
            const ln = lines[i];
            const pos = findUnescapedQuote(ln, quote);
            if (pos !== -1) { value += ln.slice(0, pos); break; }
            value += ln + '\n';
          }
        }
        value = value.replace(/\\"/g, '"').replace(/\\'/g, "'");
      } else {
        value = valPart;
        let j = i + 1;
        while (j < lines.length) {
          const nextTrim = lines[j].trim();
          if (isStopLine(nextTrim)) break;
          value += '\n' + lines[j];
          j++;
        }
        i = j - 1;
      }
      if (key === 'condition') cur.condition = value;
      else if (key === 'display') cur.display = value;
      else if (key === 'js_execute') cur.js = value;
    }
  }
  flush();
  return events;
}

function evaluateCondition(expr) {
  const ctx = getContext();

  const isNumericLike = (v) => {
    if (v == null) return false;
    const s = String(v).trim();
    return /^-?\d+(?:\.\d+)?$/.test(s);
  };

  function VAR(path) {
    try {
      const p = String(path ?? '').replace(/\[(\d+)\]/g, '.$1');
      const seg = p.split('.').map(s => s.trim()).filter(Boolean);
      if (!seg.length) return '';
      const root = ctx?.variables?.local?.get?.(seg[0]);

      if (seg.length === 1) {
        if (root == null) return '';
        if (typeof root === 'object') return JSON.stringify(root);
        return String(root);
      }

      let obj;
      if (typeof root === 'string') {
        try { obj = JSON.parse(root); } catch { return undefined; }
      } else if (root && typeof root === 'object') {
        obj = root;
      } else {
        return undefined;
      }

      let cur = obj;
      for (let i = 1; i < seg.length; i++) {
        const k = /^\d+$/.test(seg[i]) ? Number(seg[i]) : seg[i];
        cur = cur?.[k];
        if (cur === undefined) return undefined;
      }
      if (cur == null) return '';
      return typeof cur === 'object' ? JSON.stringify(cur) : String(cur);
    } catch {
      return undefined;
    }
  }

  const VAL = (t) => String(t ?? '');

  function REL(a, op, b) {
    const bothNumeric = isNumericLike(a) && isNumericLike(b);
    if (bothNumeric) {
      const A = Number(String(a).trim());
      const B = Number(String(b).trim());
      switch (op) {
        case '>':  return A > B;
        case '>=': return A >= B;
        case '<':  return A < B;
        case '<=': return A <= B;
      }
    } else {
      const A = String(a);
      const B = String(b);
      switch (op) {
        case '>':  return A > B;
        case '>=': return A >= B;
        case '<':  return A < B;
        case '<=': return A <= B;
      }
    }
    return false;
  }
  try {
    let processed = expr
      .replace(/var\(`([^`]+)`\)/g, 'VAR("$1")')
      .replace(/val\(`([^`]+)`\)/g, 'VAL("$1")');
    processed = processed.replace(
      /(VAR\(".*?"\)|VAL\(".*?"\))\s*(>=|<=|>|<)\s*(VAR\(".*?"\)|VAL\(".*?"\))/g,
      'REL($1,"$2",$3)'
    );
    return !!eval(processed);
  } catch {
    return false;
  }
}

async function runJS(code) {
  const ctx = getContext();
  try {
    const STscriptProxy = async (command) => {
      try {
        if (!command) return;
        if (command[0] !== '/') command = '/' + command;
        const { executeSlashCommands, substituteParams } = getContext();
        const cmd = substituteParams ? substituteParams(command) : command;
        const result = await executeSlashCommands?.(cmd, true);
        return result;
      } catch (err) {
        throw err;
      }
    };
    const fn = new Function('ctx', 'getVar', 'setVar', 'console', 'STscript', `return (async()=>{ ${code}\n })();`);
    const getVar = (k) => ctx?.variables?.local?.get?.(k);
    const setVar = (k, v) => ctx?.variables?.local?.set?.(k, v);
    const globalST = (typeof window !== 'undefined' && window?.STscript) ? window.STscript : null;
    const ret = await fn(ctx, getVar, setVar, console, globalST || STscriptProxy);
    return ret;
  } catch (jsError) {}
}

const runImmediateVarEventsDebounced = debounce(runImmediateVarEvents, 30);
let _lwbScanRunning = false;

async function runST(code) {
  try {
    if (!code) return;
    if (code[0] !== '/') code = '/' + code;
    const { executeSlashCommands, substituteParams } = getContext() || {};
    const cmd = substituteParams ? substituteParams(code) : code;
    return await executeSlashCommands?.(cmd, true);
  } catch (err) {}
}

function escapeForSlash(s) {
  const t = String(s ?? '').replace(/"/g, '\\"');
  return `"${t}"`;
}

async function runImmediateVarEvents() {
  if (_lwbScanRunning) return;
  _lwbScanRunning = true;
  try {
    const ctx = getContext();
    const wiList = ctx?.world_info || [];
    for (const entry of wiList) {
      const content = String(entry?.content ?? '');
      if (!content || content.indexOf('<varevent') === -1) continue;
      TAG_RE.varevent.lastIndex = 0;
      let m;
      while ((m = TAG_RE.varevent.exec(content)) !== null) {
        const inner = m[1] ?? '';
        const events = parseVareventEvents(inner);
        for (const ev of events) {
          const condStr = String(ev.condition ?? '').trim();
          const ok = condStr ? evaluateCondition(condStr) : true;
          if (!ok) continue;
          const disp = String(ev.display ?? '').trim();
          if (disp) {
            await runST(`/sys ${escapeForSlash(disp)}`);
          }
          const js = String(ev.js ?? '').trim();
          if (js) {
            await runJS(js);
          }
        }
      }
    }
  } catch (e) {
  } finally {
    setTimeout(() => {
      _lwbScanRunning = false;
    }, 0);
  }
}

/* ============= 第三区：条件规则编辑器UI ============= */
(() => {
    const LWBVE = { installed: false, obs: null, cssId: 'lwb-varevent-editor-styles' };

    const U = {
      qa: (root, sel) => Array.from((root || document).querySelectorAll(sel)),
      el: (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; },
      setActive(listLike, idx) { const arr = Array.isArray(listLike) ? listLike : U.qa(document, listLike); arr.forEach((el, i) => el.classList.toggle('active', i === idx)); },
      toast: { ok: (m) => window?.toastr?.success?.(m), warn: (m) => window?.toastr?.warning?.(m), err: (m) => window?.toastr?.error?.(m) },
      getTagRE(){ return { varevent: /<varevent>([\s\S]*?)<\/varevent>/gi }; },
      drag(modal, overlay, header) {
        try { modal.style.position='absolute'; modal.style.left='50%'; modal.style.top='50%'; modal.style.transform='translate(-50%,-50%)'; } catch {}
        let dragging=false,sx=0,sy=0,sl=0,st=0;
        function onDown(e){ if(!(e instanceof PointerEvent)||e.button!==0) return;
          dragging=true;
          const r=modal.getBoundingClientRect(), ro=overlay.getBoundingClientRect();
          modal.style.left=(r.left-ro.left)+'px'; modal.style.top=(r.top-ro.top)+'px'; modal.style.transform='';
          sx=e.clientX; sy=e.clientY; sl=parseFloat(modal.style.left)||0; st=parseFloat(modal.style.top)||0;
          window.addEventListener('pointermove',onMove,{passive:true}); window.addEventListener('pointerup',onUp,{once:true}); e.preventDefault();
        }
        function onMove(e){ if(!dragging) return; const dx=e.clientX-sx, dy=e.clientY-sy;
          let nl=sl+dx, nt=st+dy; const maxLeft=(overlay.clientWidth||overlay.getBoundingClientRect().width)-modal.offsetWidth;
          const maxTop=(overlay.clientHeight||overlay.getBoundingClientRect().height)-modal.offsetHeight;
          nl=Math.max(0,Math.min(maxLeft,nl)); nt=Math.max(0,Math.min(maxTop,nt)); modal.style.left=nl+'px'; modal.style.top=nt+'px';
        }
        function onUp(){ dragging=false; window.removeEventListener('pointermove',onMove); }
        header.addEventListener('pointerdown',onDown);
      },
      mini(innerHTML, title='编辑器') {
        const wrap = U.el('div','lwb-ve-overlay');
        const modal = U.el('div','lwb-ve-modal'); modal.style.maxWidth='720px'; modal.style.pointerEvents='auto'; modal.style.zIndex='10010';
        wrap.appendChild(modal);
        const header = U.el('div','lwb-ve-header',`<span>${title}</span><span class="lwb-ve-close">✕</span>`);
        const body = U.el('div','lwb-ve-body',innerHTML);
        const footer = U.el('div','lwb-ve-footer');
        const btnCancel = U.el('button','lwb-ve-btn','取消');
        const btnOk = U.el('button','lwb-ve-btn primary','生成');
        footer.append(btnCancel,btnOk); modal.append(header,body,footer); U.drag(modal,wrap,header);
        btnCancel.addEventListener('click',()=>wrap.remove()); header.querySelector('.lwb-ve-close')?.addEventListener('click',()=>wrap.remove());
        document.body.appendChild(wrap);
        return { wrap, modal, body, btnOk, btnCancel };
      },
    };

    function injectStyles(){
      if(document.getElementById(LWBVE.cssId)) return;
      const style=document.createElement('style'); style.id=LWBVE.cssId;
      style.textContent=`
  .lwb-ve-overlay{position:fixed;inset:0;background:none;z-index:9999;display:flex;align-items:center;justify-content:center;pointer-events:none}
  .lwb-ve-modal{width:650px;background:var(--SmartThemeBlurTintColor);border:2px solid var(--SmartThemeBorderColor);border-radius:10px;box-shadow:0 8px 16px var(--SmartThemeShadowColor);pointer-events:auto}
  .lwb-ve-header{display:flex;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--SmartThemeBorderColor);font-weight:600;cursor:move}
  .lwb-ve-tabs{display:flex;gap:6px;padding:8px 14px;border-bottom:1px solid var(--SmartThemeBorderColor)}
  .lwb-ve-tab{cursor:pointer;border:1px solid var(--SmartThemeBorderColor);background:var(--SmartThemeBlurTintColor);padding:4px 8px;border-radius:6px;opacity:.8}
  .lwb-ve-tab.active{opacity:1;border-color:var(--crimson70a)}
  .lwb-ve-page{display:none}
  .lwb-ve-page.active{display:block}
  .lwb-ve-body{height:60vh;overflow:auto;padding:10px}
  .lwb-ve-footer{display:flex;gap:8px;justify-content:flex-end;padding:12px 14px;border-top:1px solid var(--SmartThemeBorderColor)}
  .lwb-ve-section{margin:12px 0}
  .lwb-ve-label{font-size:13px;opacity:.7;margin:6px 0}
  .lwb-ve-row{gap:8px;align-items:center;margin:4px 0;padding-bottom:10px;border-bottom:1px dashed var(--SmartThemeBorderColor);display:flex;flex-wrap:wrap}
  .lwb-ve-input,.lwb-ve-text{box-sizing:border-box;background:var(--SmartThemeShadowColor);color:inherit;border:1px solid var(--SmartThemeUserMesBlurTintColor);border-radius:6px;padding:6px 8px}
  .lwb-ve-text{min-height:64px;resize:vertical;width:100%}
  .lwb-ve-input{width:260px}
  .lwb-ve-mini{width:70px!important;margin:0}
  .lwb-ve-op,.lwb-ve-ctype option{text-align:center}
  .lwb-ve-lop{width:70px!important;text-align:center}
  .lwb-ve-btn{cursor:pointer;border:1px solid var(--SmartThemeBorderColor);background:var(--SmartThemeBlurTintColor);padding:6px 10px;border-radius:6px}
  .lwb-ve-btn.primary{background:var(--crimson70a)}
  .lwb-ve-event{border:1px dashed var(--SmartThemeBorderColor);border-radius:8px;padding:10px;margin:10px 0}
  .lwb-ve-event-title{font-weight:600;display:flex;align-items:center;gap:8px}
  .lwb-ve-close{cursor:pointer}
  .lwb-var-editor-button.right_menu_button{display:inline-flex;align-items:center;margin-left:10px;transform:scale(1.5)}
  .lwb-ve-vals,.lwb-ve-varrhs{align-items:center;display:inline-flex;gap:6px}
  .lwb-ve-delval{transform:scale(.5)}
  .lwb-act-type{width:200px!important}
  .lwb-ve-condgroups{display:flex;flex-direction:column;gap:10px}
  .lwb-ve-condgroup{border:1px solid var(--SmartThemeBorderColor);border-radius:8px;padding:8px}
  .lwb-ve-group-title{display:flex;align-items:center;gap:8px;margin-bottom:6px}
  .lwb-ve-group-name{font-weight:600}
  .lwb-ve-group-lop{width:70px!important;text-align:center}
  .lwb-ve-add-group{margin-top:6px}
  @media (max-width:999px){.lwb-ve-overlay{position:absolute;inset:0;align-items:flex-start}.lwb-ve-modal{width:100%;max-height:100%;margin:0;border-radius:10px 10px 0 0}}`;
      document.head.appendChild(style);
    }

    const P = {
      stripOuter(s){ let t=String(s||'').trim(); if(!t.startsWith('(')||!t.endsWith(')')) return t;
        let i=0,d=0,q=null; while(i<t.length){ const c=t[i];
          if(q){ if(c===q&&t[i-1]!=='\\') q=null; i++; continue; }
          if(c==='"'||c==="'"||c==='`'){ q=c; i++; continue; }
          if(c==='(') d++; else if(c===')') d--; i++;
        } return d===0? t.slice(1,-1).trim(): t;
      },
      stripOuterWithFlag(s){ let t=String(s||'').trim(); if(!t.startsWith('(')||!t.endsWith(')')) return {text:t,wrapped:false};
        let i=0,d=0,q=null; while(i<t.length){ const c=t[i];
          if(q){ if(c===q&&t[i-1]!=='\\') q=null; i++; continue; }
          if(c==='"'||c==="'"||c==='`'){ q=c; i++; continue; }
          if(c==='(') d++; else if(c===')') d--; i++;
        } return d===0? {text:t.slice(1,-1).trim(),wrapped:true}: {text:t,wrapped:false};
      },
      splitTopWithOps(s){ const out=[]; let i=0,start=0,d=0,q=null,pendingOp=null;
        while(i<s.length){ const c=s[i];
          if(q){ if(c===q&&s[i-1]!=='\\') q=null; i++; continue; }
          if(c==='"'||c==="'"||c==='`'){ q=c; i++; continue; }
          if(c==='('){ d++; i++; continue; }
          if(c===')'){ d--; i++; continue; }
          if(d===0&&(s.slice(i,i+2)==='&&'||s.slice(i,i+2)==='||')){ const seg=s.slice(start,i).trim(); if(seg) out.push({op:pendingOp,expr:seg}); pendingOp=s.slice(i,i+2); i+=2; start=i; continue; }
          i++;
        }
        const tail=s.slice(start).trim(); if(tail) out.push({op:pendingOp,expr:tail}); return out;
      },
      parseComp(s){ const t=P.stripOuter(s);
        const m=t.match(/^var\(\s*([`'"])([\s\S]*?)\1\s*\)\s*(==|!=|>=|<=|>|<)\s*(val|var)\(\s*([`'"])([\s\S]*?)\5\s*\)$/);
        if(!m) return null; return { lhs:m[2], op:m[3], rhsIsVar:m[4]==='var', rhs:m[6] };
      },
      hasBinary:(s)=>/\|\||&&/.test(s),
      paren:(s)=>(s.startsWith('(')&&s.endsWith(')'))?s:`(${s})`,
      wrapBack(s){ const t=String(s||'').trim(); return /^([`'"]).*\1$/.test(t)? t: '`'+t.replace(/`/g,'\\`')+'`'; },
      buildVar:(name)=>`var(${P.wrapBack(name)})`,
      buildVal(v){ const t=String(v||'').trim(); return /^([`'"]).*\1$/.test(t)? `val(${t})`: `val(${P.wrapBack(t)})`; },
    };

    function parseVareventEvents(inner) {
      const text = String(inner || '');
      const headerRe = /^\s*\[\s*event\.([^\]\s]+)\s*\]\s*$/gim;
      const events = [];
      let m, lastIdx = 0, cur = null;

      const pushCur = () => { if (cur) { events.push(cur); cur = null; } };

      const sections = [];
      while ((m = headerRe.exec(text)) !== null) {
        const id = m[1];
        const start = m.index;
        if (sections.length) sections[sections.length - 1].end = start;
        sections.push({ id, start: m.index, bodyStart: headerRe.lastIndex, end: text.length });
      }
      if (!sections.length) return events;
      for (const sec of sections) {
        const chunk = text.slice(sec.bodyStart, sec.end);
        cur = { id: sec.id, condition: '', display: '', js: '' };

        let i = 0;
        const len = chunk.length;
        const ws = () => { while (i < len && /[ \t]/.test(chunk[i])) i++; };
        const readLine = () => {
          const p = chunk.indexOf('\n', i);
          if (p === -1) { const s = chunk.slice(i); i = len; return s; }
          const s = chunk.slice(i, p); i = p + 1; return s;
        };
        const peekKey = () => {
          const save = i;
          ws();
          const mm = chunk.slice(i).match(/^(condition|display|js_execute)\s*:/i);
          i = save;
          return mm ? mm[1].toLowerCase() : '';
        };
        const readAfterColon = () => {
          const mm = chunk.slice(i).match(/^(condition|display|js_execute)\s*:/i);
          if (!mm) return null;
          i += mm[0].length;
          return mm[1].toLowerCase();
        };
        const readQuoted = () => {
          ws();
          const q = chunk[i];
          if (q !== '"' && q !== "'") return null;
          i++;
          let out = '';
          while (i < len) {
            const c = chunk[i++];
            if (c === '\\') {
              const n = chunk[i++];
              if (n === undefined) break;
              if (n === 'n') out += '\n';
              else if (n === 'r') out += '\r';
              else if (n === 't') out += '\t';
              else out += n;
              continue;
            }
            if (c === q) break;
            out += c;
          }
          return out;
        };

        while (i < len) {
          ws();
          if (chunk[i] === '#' || chunk[i] === ';') { readLine(); continue; }
          if (chunk[i] === '\n' || chunk[i] === '\r') { i++; continue; }
          const key = peekKey();
          if (!key) { readLine(); continue; }
          const realKey = readAfterColon();
          if (realKey === 'condition') {
            const line = readLine();
            cur.condition = String(line || '').trim();
          } else if (realKey === 'display') {
            const val = readQuoted();
            if (val != null) cur.display = String(val || '');
            else {
              const line = readLine();
              cur.display = String(line || '').trim();
            }
          } else if (realKey === 'js_execute') {
            ws();
            if (chunk[i] === '"' || chunk[i] === "'") {
              const val = readQuoted();
              cur.js = String(val || '');
            } else {
              const line = readLine();
              const raw = String(line || '').trim();
              try {
                if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
                  cur.js = JSON.parse(raw.replace(/^'/, '"').replace(/'$/, '"').replace(/([^\\])'/g, '$1"'));
                } else cur.js = raw;
              } catch { cur.js = raw; }
            }
          } else {
            readLine();
          }
        }
        pushCur();
      }
      return events;
    }

    function buildSTscriptFromActions(actionList) {
      const parts = [];
      const jsEsc = (s)=>String(s??'').replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${');
      const plain = (s)=>String(s??'').trim();
      for (const a of actionList||[]) {
        switch(a.type){
          case 'var.set': parts.push(`/setvar key=${plain(a.key)} ${plain(a.value)}`); break;
          case 'var.bump': parts.push(`/addvar key=${plain(a.key)} ${Number(a.delta)||0}`); break;
          case 'var.del': parts.push(`/flushvar ${plain(a.key)}`); break;
          case 'wi.enableUID': parts.push(`/setentryfield file=${plain(a.file)} uid=${plain(a.uid)} field=disable 0`); break;
          case 'wi.disableUID': parts.push(`/setentryfield file=${plain(a.file)} uid=${plain(a.uid)} field=disable 1`); break;
          case 'wi.setContentUID': parts.push(`/setentryfield file=${plain(a.file)} uid=${plain(a.uid)} field=content ${plain(a.content)}`); break;
          case 'wi.createContent':
            if (plain(a.content)) parts.push(`/createentry file=${plain(a.file)} key=${plain(a.key)} ${plain(a.content)}`);
            else parts.push(`/createentry file=${plain(a.file)} key=${plain(a.key)}`);
            parts.push(`/setentryfield file=${plain(a.file)} uid={{pipe}} field=constant 1`);
            break;
          case 'qr.run': parts.push(`/run ${a.preset ? `${plain(a.preset)}.` : ''}${plain(a.label)}`); break;
          case 'custom.st':
            if (a.script) {
              const cmds = a.script.split('\n').map(s=>s.trim()).filter(Boolean).map(c=>c.startsWith('/')?c:'/'+c);
              parts.push(...cmds);
            } break;
        }
      }
      const st = parts.join(' | ');
      return 'STscript(`'+jsEsc(st)+'`)';
    }

    const UI = {
      makeOverlayModal(title='条件规则编辑器'){
        const overlay=U.el('div','lwb-ve-overlay');
        const modal=U.el('div','lwb-ve-modal'); overlay.appendChild(modal);
        modal.style.pointerEvents='auto'; modal.style.zIndex='10010';
        const header=U.el('div','lwb-ve-header',`<span>${title}</span><span class="lwb-ve-close">✕</span>`);
        const tabs=U.el('div','lwb-ve-tabs');
        const tabsCtrl=U.el('div',null); tabsCtrl.style.cssText='margin-left:auto;display:inline-flex;gap:6px;';
        const btnAddTab=U.el('button','lwb-ve-btn','+组'); const btnDelTab=U.el('button','lwb-ve-btn ghost','-组');
        tabs.appendChild(tabsCtrl); tabsCtrl.append(btnAddTab,btnDelTab);
        const body=U.el('div','lwb-ve-body'); const footer=U.el('div','lwb-ve-footer');
        const btnCancel=U.el('button','lwb-ve-btn','取消'); const btnOk=U.el('button','lwb-ve-btn primary','确认');
        footer.append(btnCancel,btnOk); modal.append(header,tabs,body,footer); U.drag(modal,overlay,header);
        header.querySelector('.lwb-ve-close').addEventListener('click',()=>overlay.remove()); btnCancel.addEventListener('click',()=>overlay.remove());
        document.body.appendChild(overlay);
        return { overlay, modal, header, tabs, tabsCtrl, btnAddTab, btnDelTab, body, footer, btnCancel, btnOk };
      },
      getEventBlockHTML(index){
        return `
        <div class="lwb-ve-event-title">事件 #<span class="lwb-ve-idx">${index}</span><span class="lwb-ve-close" title="删除事件" style="margin-left:auto;">✕</span></div>
        <div class="lwb-ve-section">
          <div class="lwb-ve-label">执行条件</div>
          <div class="lwb-ve-condgroups"></div>
          <button type="button" class="lwb-ve-btn lwb-ve-add-group"><i class="fa-solid fa-plus"></i>添加条件小组</button>
        </div>
        <div class="lwb-ve-section">
          <div class="lwb-ve-label">将显示世界书内容（可选）</div>
          <textarea class="lwb-ve-text lwb-ve-display" placeholder="例如：&lt;Info&gt;……&lt;/Info&gt;"></textarea>
        </div>
        <div class="lwb-ve-section">
          <div class="lwb-ve-label">将执行stscript命令或JS代码（可选）</div>
          <textarea class="lwb-ve-text lwb-ve-js" placeholder="stscript:/setvar key=foo 1 | /run SomeQR 或 直接JS"></textarea>
          <div style="margin-top:6px; display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="lwb-ve-btn lwb-ve-gen-st">常用st控制</button>
          </div>
        </div>`;
      },
      getConditionRowHTML(){ return `
        <select class="lwb-ve-input lwb-ve-mini lwb-ve-lop" style="display:none;">
          <option value="||">或</option><option value="&&" selected>和</option>
        </select>
        <select class="lwb-ve-input lwb-ve-mini lwb-ve-ctype">
          <option value="vv">比较值</option><option value="vvv">比较变量</option>
        </select>
        <input class="lwb-ve-input lwb-ve-var" placeholder="变量名称"/>
        <select class="lwb-ve-input lwb-ve-mini lwb-ve-op">
          <option value="==">等于</option><option value="!=">不等于</option>
          <option value=">=">大于或等于</option><option value="<=">小于或等于</option>
          <option value=">">大于</option><option value="<">小于</option>
        </select>
        <span class="lwb-ve-vals"><span class="lwb-ve-valwrap"><input class="lwb-ve-input lwb-ve-val" placeholder="值"/></span></span>
        <span class="lwb-ve-varrhs" style="display:none;"><span class="lwb-ve-valvarwrap"><input class="lwb-ve-input lwb-ve-valvar" placeholder="变量B名称"/></span></span>
        <button type="button" class="lwb-ve-btn ghost lwb-ve-del">删除</button>`; },
      makeConditionGroup(){
        const g=U.el('div','lwb-ve-condgroup',`
          <div class="lwb-ve-group-title">
            <select class="lwb-ve-input lwb-ve-mini lwb-ve-group-lop" style="display:none;"><option value="&&">和</option><option value="||">或</option></select>
            <span class="lwb-ve-group-name">小组</span>
            <span style="flex:1 1 auto;"></span>
            <button type="button" class="lwb-ve-btn ghost lwb-ve-del-group">删除小组</button>
          </div>
          <div class="lwb-ve-conds"></div>
          <button type="button" class="lwb-ve-btn lwb-ve-add-cond"><i class="fa-solid fa-plus"></i>添加条件</button>`);
        const conds=g.querySelector('.lwb-ve-conds');
        g.querySelector('.lwb-ve-add-cond')?.addEventListener('click',()=>{ try{ UI.addConditionRow(conds,{});}catch{} });
        g.querySelector('.lwb-ve-del-group')?.addEventListener('click',()=>g.remove());
        return g;
      },
      refreshLopDisplay(container){
        U.qa(container,'.lwb-ve-row').forEach((r,idx)=>{ const lop=r.querySelector('.lwb-ve-lop'); if(!lop) return;
          lop.style.display = idx===0 ? 'none' : ''; if(idx>0 && !lop.value) lop.value='&&';
        });
      },
      setupConditionRow(row,onRowsChanged){
        row.querySelector('.lwb-ve-del')?.addEventListener('click',()=>{ row.remove(); onRowsChanged?.(); });
        const ctype=row.querySelector('.lwb-ve-ctype'), vals=row.querySelector('.lwb-ve-vals'), rhs=row.querySelector('.lwb-ve-varrhs');
        ctype?.addEventListener('change',()=>{ const m=ctype.value; if(m==='vv'){ vals.style.display='inline-flex'; rhs.style.display='none'; } else { vals.style.display='none'; rhs.style.display='inline-flex'; } });
      },
      createConditionRow(params,onRowsChanged){
        const { lop,lhs,op,rhsIsVar,rhs }=params||{};
        const row=U.el('div','lwb-ve-row',UI.getConditionRowHTML());
        const lopSel=row.querySelector('.lwb-ve-lop'); if(lopSel){ if(lop==null){ lopSel.style.display='none'; lopSel.value='&&'; } else { lopSel.style.display=''; lopSel.value=String(lop||'&&'); } }
        const varInp=row.querySelector('.lwb-ve-var'); if (varInp && lhs!=null) varInp.value=String(lhs);
        const opSel=row.querySelector('.lwb-ve-op'); if (opSel && op!=null) opSel.value=String(op);
        const ctypeSel=row.querySelector('.lwb-ve-ctype'); const valsWrap=row.querySelector('.lwb-ve-vals'); const varRhsWrap=row.querySelector('.lwb-ve-varrhs');
        if(ctypeSel && valsWrap && varRhsWrap && (rhsIsVar!=null || rhs!=null)){
          if(rhsIsVar){ ctypeSel.value='vvv'; valsWrap.style.display='none'; varRhsWrap.style.display='inline-flex';
            const rhsInp=row.querySelector('.lwb-ve-varrhs .lwb-ve-valvar'); if(rhsInp && rhs!=null) rhsInp.value=String(rhs);
          }else{ ctypeSel.value='vv'; valsWrap.style.display='inline-flex'; varRhsWrap.style.display='none';
            const rhsInp=row.querySelector('.lwb-ve-vals .lwb-ve-val'); if(rhsInp && rhs!=null) rhsInp.value=String(rhs);
          }
        }
        UI.setupConditionRow(row,onRowsChanged||null);
        return row;
      },
      addConditionRow(container,params){ const row=UI.createConditionRow(params,()=>UI.refreshLopDisplay(container)); container.appendChild(row); UI.refreshLopDisplay(container); return row; },
      parseConditionIntoUI(block,condStr){
        try{
          const groupWrap=block.querySelector('.lwb-ve-condgroups'); if(!groupWrap) return;
          groupWrap.innerHTML='';
          const top=P.splitTopWithOps(condStr);
          top.forEach((seg,idxSeg)=>{
            const { text }=P.stripOuterWithFlag(seg.expr);
            const g=UI.makeConditionGroup(); groupWrap.appendChild(g);
            const glopSel=g.querySelector('.lwb-ve-group-lop'); if(glopSel){ glopSel.style.display=idxSeg===0?'none':''; if(idxSeg>0) glopSel.value=seg.op||'&&'; }
            const name=g.querySelector('.lwb-ve-group-name'); if(name) name.textContent=( 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[idxSeg] || (idxSeg+1) )+' 小组';
            const rows=P.splitTopWithOps(P.stripOuter(text)); let first=true;
            const cw=g.querySelector('.lwb-ve-conds');
            rows.forEach(r=>{ const comp=P.parseComp(r.expr); if(!comp) return;
              UI.addConditionRow(cw,{ lop:first?null:(r.op||'&&'), lhs:comp.lhs, op:comp.op, rhsIsVar:comp.rhsIsVar, rhs:comp.rhs }); first=false;
            });
          });
        }catch{}
      },
      createEventBlock(index){
        const block=U.el('div','lwb-ve-event',UI.getEventBlockHTML(index));
        block.querySelector('.lwb-ve-event-title .lwb-ve-close')?.addEventListener('click',()=>{ block.remove(); block.dispatchEvent(new CustomEvent('lwb-refresh-idx',{bubbles:true})); });
        const groupWrap=block.querySelector('.lwb-ve-condgroups'); const addGroupBtn=block.querySelector('.lwb-ve-add-group');
        const refreshGroupOpsAndNames=()=>{ U.qa(groupWrap,'.lwb-ve-condgroup').forEach((g,i)=>{ const glop=g.querySelector('.lwb-ve-group-lop');
          if(glop){ glop.style.display=i===0?'none':''; if(i>0 && !glop.value) glop.value='&&'; }
          const name=g.querySelector('.lwb-ve-group-name'); if(name) name.textContent=( 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i] || (i+1) )+' 小组';
        }); };
        const createGroup=()=>{ const g=UI.makeConditionGroup(); const conds=g.querySelector('.lwb-ve-conds'); UI.addConditionRow(conds,{});
          g.querySelector('.lwb-ve-del-group')?.addEventListener('click',()=>{ g.remove(); refreshGroupOpsAndNames(); }); return g; };
        addGroupBtn.addEventListener('click',()=>{ groupWrap.appendChild(createGroup()); refreshGroupOpsAndNames(); });
        groupWrap.appendChild(createGroup()); refreshGroupOpsAndNames();
        block.querySelector('.lwb-ve-gen-st')?.addEventListener('click',()=>LWBVE.openActionBuilder(block));
        return block;
      },
      refreshEventIndices(eventsWrap){
        U.qa(eventsWrap,'.lwb-ve-event').forEach((el,i)=>{ const idxEl=el.querySelector('.lwb-ve-idx'); if(!idxEl) return;
          idxEl.textContent=String(i+1); idxEl.style.cursor='pointer'; idxEl.title='点击修改显示名称';
          if(!idxEl.dataset.clickbound){ idxEl.dataset.clickbound='1'; idxEl.addEventListener('click',()=>{ const cur=idxEl.textContent||''; const name=prompt('输入事件显示名称：',cur)??''; if(name) idxEl.textContent=name; }); }
        });
      },
      processEventBlock(block,idx){
        const displayName=String(block.querySelector('.lwb-ve-idx')?.textContent||'').trim();
        const id=(displayName&&/^\w[\w.-]*$/.test(displayName))?displayName:String(idx+1).padStart(4,'0');
        const lines=[`[event.${id}]`];
        let condStr=''; let hasAny=false;
        const groups=U.qa(block,'.lwb-ve-condgroup');
        for(let gi=0; gi<groups.length; gi++){
          const g=groups[gi]; const rows=U.qa(g,'.lwb-ve-conds .lwb-ve-row'); let groupExpr=''; let groupHas=false;
          for(const r of rows){
            const v=r.querySelector('.lwb-ve-var')?.value?.trim?.()||''; const op=r.querySelector('.lwb-ve-op')?.value||'=='; const ctype=r.querySelector('.lwb-ve-ctype')?.value||'vv'; if(!v) continue;
            let rowExpr='';
            if(ctype==='vv'){ const ins=U.qa(r,'.lwb-ve-vals .lwb-ve-val'); const exprs=[];
              for(const inp of ins){ const val=(inp?.value||'').trim(); if(!val) continue; exprs.push(`${P.buildVar(v)} ${op} ${P.buildVal(val)}`); }
              if(exprs.length===1) rowExpr=exprs[0]; else if(exprs.length>1) rowExpr='('+exprs.join(' || ')+')';
            }else{ const ins=U.qa(r,'.lwb-ve-varrhs .lwb-ve-valvar'); const exprs=[];
              for(const inp of ins){ const rhs=(inp?.value||'').trim(); if(!rhs) continue; exprs.push(`${P.buildVar(v)} ${op} ${P.buildVar(rhs)}`); }
              if(exprs.length===1) rowExpr=exprs[0]; else if(exprs.length>1) rowExpr='('+exprs.join(' || ')+')';
            }
            if(!rowExpr) continue;
            const lop=r.querySelector('.lwb-ve-lop')?.value||'&&';
            if(!groupHas){ groupExpr=rowExpr; groupHas=true; }
            else{
              if(lop==='&&'){ const left=P.hasBinary(groupExpr)?P.paren(groupExpr):groupExpr; const right=P.hasBinary(rowExpr)?P.paren(rowExpr):rowExpr; groupExpr=`${left} && ${right}`; }
              else{ const right=P.hasBinary(rowExpr)?P.paren(rowExpr):rowExpr; groupExpr=`${groupExpr} || ${right}`; }
            }
          }
          if(!groupHas) continue;
          const glop=g.querySelector('.lwb-ve-group-lop')?.value||'&&'; const wrap=P.hasBinary(groupExpr)?P.paren(groupExpr):groupExpr;
          if(!hasAny){ condStr=wrap; hasAny=true; } else { condStr = glop==='&&' ? `${condStr} && ${wrap}` : `${condStr} || ${wrap}`; }
        }
        const disp=block.querySelector('.lwb-ve-display')?.value??''; const js=block.querySelector('.lwb-ve-js')?.value??'';
        const dispCore=String(disp).replace(/^\n+|\n+$/g,'');
        if(!dispCore && !js) return { lines:[] };
        if(condStr) lines.push(`condition: ${condStr}`);
        if(dispCore!==''){ const stored='\n'+dispCore+'\n'; lines.push('display: "'+stored.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"'); }
        if(js!=='') lines.push(`js_execute: ${JSON.stringify(js)}`);
        return { lines };
      },
    };

    function openVarEditor(entryEl, uid){
      const textarea=(uid?document.getElementById(`world_entry_content_${uid}`):null) || entryEl?.querySelector?.('textarea[name="content"]');
      if(!textarea){ U.toast.warn('未找到内容输入框，请先展开该条目的编辑抽屉'); return; }

      const ui=UI.makeOverlayModal('条件规则编辑器');
      const pagesWrap=U.el('div'); ui.body.appendChild(pagesWrap);

      const addEventBtn=U.el('button','lwb-ve-btn','<i class="fa-solid fa-plus"></i> 添加事件'); addEventBtn.type='button';
      addEventBtn.style.cssText='background: var(--SmartThemeBlurTintColor); border: 1px solid var(--SmartThemeBorderColor); cursor: pointer; margin-right: 5px;';
      const bumpBtn=U.el('button','lwb-ve-btn lwb-ve-gen-bump','bump数值映射设置');
      const tools=U.el('div','lwb-ve-toolbar'); tools.append(addEventBtn,bumpBtn); ui.body.appendChild(tools);
      bumpBtn.addEventListener('click',()=>LWBVE.openBumpAliasBuilder(null));
      const makePage=()=>{ const page=U.el('div','lwb-ve-page'); const eventsWrap=U.el('div'); page.appendChild(eventsWrap); return { page, eventsWrap }; };
      addEventBtn.addEventListener('click',()=>{ const active=pagesWrap.querySelector('.lwb-ve-page.active'); const eventsWrap=active?.querySelector(':scope > div'); if(!eventsWrap) return;
        eventsWrap.appendChild(UI.createEventBlock(eventsWrap.children.length+1)); eventsWrap.dispatchEvent(new CustomEvent('lwb-refresh-idx',{bubbles:true}));
      });

      const wi=document.getElementById('WorldInfo'); const wiIcon=document.getElementById('WIDrawerIcon');
      const wasPinned=!!wi?.classList.contains('pinnedOpen'); let tempPinned=false;
      if(wi && !wasPinned){ wi.classList.add('pinnedOpen'); tempPinned=true; } if(wiIcon && !wiIcon.classList.contains('drawerPinnedOpen')) wiIcon.classList.add('drawerPinnedOpen');
      const closeVarEditor=()=>{ try{ const pinChecked=!!(document.getElementById('WI_panel_pin'))?.checked; if(tempPinned && !pinChecked){ wi?.classList.remove('pinnedOpen'); wiIcon?.classList.remove('drawerPinnedOpen'); } }catch{} ui.overlay.remove(); };
      ui.btnCancel.addEventListener('click',closeVarEditor);
      ui.header.querySelector('.lwb-ve-close')?.addEventListener('click',closeVarEditor);

      const TAG_RE=U.getTagRE(); const originalText=String(textarea.value||''); const vareventBlocks=[];
      TAG_RE.varevent.lastIndex=0; let mm;
      while((mm=TAG_RE.varevent.exec(originalText))!==null){ const inner=mm[1]??''; vareventBlocks.push({ inner }); }

      const parseFn = typeof window.parseVareventEvents === 'function' ? window.parseVareventEvents : parseVareventEvents;
      if (typeof window.parseVareventEvents !== 'function') window.parseVareventEvents = parseFn; // 兼容旧调用

      const pageInitialized=new Set();
      const renderPage=(pageIdx)=>{
        const tabs=U.qa(ui.tabs,'.lwb-ve-tab'); U.setActive(tabs,pageIdx);
        const current=vareventBlocks[pageIdx]; const events=(current && typeof current.inner==='string')? (parseFn(current.inner)||[]): [];
        let page=U.qa(pagesWrap,'.lwb-ve-page')[pageIdx];
        if(!page){ page=makePage().page; pagesWrap.appendChild(page); }
        U.qa(pagesWrap,'.lwb-ve-page').forEach(el=>el.classList.remove('active')); page.classList.add('active');
        let eventsWrap=page.querySelector(':scope > div'); if(!eventsWrap){ eventsWrap=U.el('div'); page.appendChild(eventsWrap); }

        const init=()=>{
          eventsWrap.innerHTML='';
          if(!events.length) eventsWrap.appendChild(UI.createEventBlock(1));
          else {
            events.forEach((_ev,i)=>{
              const block=UI.createEventBlock(i+1);
              try{
                const condStr=String(_ev.condition||'').trim(); if(condStr) UI.parseConditionIntoUI(block,condStr);
                const disp=String(_ev.display||''); const dispEl=block.querySelector('.lwb-ve-display'); if(dispEl) dispEl.value=disp.replace(/^\r?\n/,'').replace(/\r?\n$/,'');
                const js=String(_ev.js||''); const jsEl=block.querySelector('.lwb-ve-js'); if(jsEl) jsEl.value=js;
              }catch{}
              eventsWrap.appendChild(block);
            });
          }
          UI.refreshEventIndices(eventsWrap);
          eventsWrap.addEventListener('lwb-refresh-idx',()=>UI.refreshEventIndices(eventsWrap));
        };
        if(!pageInitialized.has(pageIdx)){ init(); pageInitialized.add(pageIdx); }
        else if(!eventsWrap.querySelector('.lwb-ve-event')){ init(); }
      };
      pagesWrap._lwbRenderPage=renderPage;

      if(vareventBlocks.length===0){
        const tab=U.el('div','lwb-ve-tab active','组 1'); ui.tabs.insertBefore(tab,ui.tabsCtrl);
        const { page, eventsWrap }=makePage(); pagesWrap.appendChild(page); page.classList.add('active'); eventsWrap.appendChild(UI.createEventBlock(1)); UI.refreshEventIndices(eventsWrap);
        tab.addEventListener('click',()=>{ U.qa(ui.tabs,'.lwb-ve-tab').forEach(el=>el.classList.remove('active')); tab.classList.add('active'); U.qa(pagesWrap,'.lwb-ve-page').forEach(el=>el.classList.remove('active')); page.classList.add('active'); });
      } else {
        vareventBlocks.forEach((_b,i)=>{ const tab=U.el('div','lwb-ve-tab'+(i===0?' active':''),`组 ${i+1}`); tab.addEventListener('click',()=>renderPage(i)); ui.tabs.insertBefore(tab,ui.tabsCtrl); });
        renderPage(0);
      }

      ui.btnAddTab.addEventListener('click',()=>{ const newIdx=U.qa(ui.tabs,'.lwb-ve-tab').length; vareventBlocks.push({ inner:'' });
        const tab=U.el('div','lwb-ve-tab',`组 ${newIdx+1}`); tab.addEventListener('click',()=>pagesWrap._lwbRenderPage(newIdx)); ui.tabs.insertBefore(tab,ui.tabsCtrl); pagesWrap._lwbRenderPage(newIdx);
      });
      ui.btnDelTab.addEventListener('click',()=>{ const tabEls=U.qa(ui.tabs,'.lwb-ve-tab'); if(tabEls.length<=1){ U.toast.warn('至少保留一组'); return; }
        const activeIdx=tabEls.findIndex(t=>t.classList.contains('active')); const idx=activeIdx>=0?activeIdx:0;
        const pageEls=U.qa(pagesWrap,'.lwb-ve-page'); pageEls[idx]?.remove(); tabEls[idx]?.remove(); vareventBlocks.splice(idx,1);
        const rebind=U.qa(ui.tabs,'.lwb-ve-tab'); rebind.forEach((t,i)=>{ const nt=t.cloneNode(true); nt.textContent=`组 ${i+1}`; nt.addEventListener('click',()=>pagesWrap._lwbRenderPage(i)); ui.tabs.replaceChild(nt,t); });
        const nextIdx=Math.max(0,Math.min(idx,rebind.length-1)); pagesWrap._lwbRenderPage(nextIdx);
      });

      ui.btnOk.addEventListener('click',()=>{
        const pageEls=U.qa(pagesWrap,'.lwb-ve-page'); if(pageEls.length===0){ closeVarEditor(); return; }
        const builtBlocks=[]; const seenIds=new Set();
        pageEls.forEach((p)=>{ 
          const wrap=p.querySelector(':scope > div'); 
          const blks=wrap?U.qa(wrap,'.lwb-ve-event'):[];
          const lines=['<varevent>'];
          let hasEvents = false;
          blks.forEach((b,j)=>{ 
            const r=UI.processEventBlock(b,j);
            if(r.lines.length>0){ 
              const idLine=r.lines[0]; 
              const mm=idLine.match(/^\[\s*event\.([^\]]+)\]/i); 
              const id=mm?mm[1]:`evt_${j+1}`;
              let use=id, k=2; 
              while(seenIds.has(use)) use=`${id}_${k++}`; 
              if(use!==id) r.lines[0]=`[event.${use}]`; 
              seenIds.add(use);
              lines.push(...r.lines);
              hasEvents = true;
            }
          });
          if (hasEvents) {
            lines.push('</varevent>'); 
            builtBlocks.push(lines.join('\n'));
          }
        });
        const oldVal=textarea.value||''; const originals=[]; const RE=U.getTagRE().varevent; RE.lastIndex=0; let m;
        while((m=RE.exec(oldVal))!==null){ originals.push({start:m.index,end:RE.lastIndex}); }
        let acc=''; let pos=0; const minLen=Math.min(originals.length,builtBlocks.length);
        for(let i=0;i<originals.length;i++){ const {start,end}=originals[i]; acc+=oldVal.slice(pos,start); if(i<minLen) acc+=builtBlocks[i]; pos=end; }
        acc+=oldVal.slice(pos);
        if(builtBlocks.length>originals.length){ const extras=builtBlocks.slice(originals.length).join('\n\n'); acc=acc.replace(/\s*$/,''); if(acc && !/(?:\r?\n){2}$/.test(acc)){ acc+=(/\r?\n$/.test(acc)?'':'\n')+'\n'; } acc+=extras; }
        acc=acc.replace(/(?:\r?\n){3,}/g,'\n\n');
        textarea.value=acc; try{ window?.jQuery?.(textarea)?.trigger?.('input'); }catch{}
        U.toast.ok('已更新条件规则到该世界书条目'); closeVarEditor();
      });
    }

    function openActionBuilder(block){
      const html=`<div class="lwb-ve-section"><div class="lwb-ve-label">添加动作</div><div id="lwb-action-list"></div><button type="button" class="lwb-ve-btn" id="lwb-add-action">+动作</button></div>`;
      const ui=U.mini(html,'常用st控制'); const list=ui.body.querySelector('#lwb-action-list'); const addBtn=ui.body.querySelector('#lwb-add-action');
      const TYPES=[
        { value:'var.set',label:'变量: set',template:`<input class="lwb-ve-input" placeholder="变量名 key"/><input class="lwb-ve-input" placeholder="值 value"/>` },
        { value:'var.bump',label:'变量: bump(+/-)',template:`<input class="lwb-ve-input" placeholder="变量名 key"/><input class="lwb-ve-input" placeholder="增量(整数，可负) delta"/>` },
        { value:'var.del',label:'变量: del',template:`<input class="lwb-ve-input" placeholder="变量名 key"/>` },
        { value:'wi.enableUID',label:'世界书: 启用条目(UID)',template:`<input class="lwb-ve-input" placeholder="世界书文件名 file（必填）"/><input class="lwb-ve-input" placeholder="条目UID（必填）"/>` },
        { value:'wi.disableUID',label:'世界书: 禁用条目(UID)',template:`<input class="lwb-ve-input" placeholder="世界书文件名 file（必填）"/><input class="lwb-ve-input" placeholder="条目UID（必填）"/>` },
        { value:'wi.setContentUID',label:'世界书: 设置内容(UID)',template:`<input class="lwb-ve-input" placeholder="世界书文件名 file（必填）"/><input class="lwb-ve-input" placeholder="条目UID（必填）"/><textarea class="lwb-ve-text" rows="3" placeholder="内容 content（可多行）"></textarea>` },
        { value:'wi.createContent',label:'世界书: 新建条目(仅内容)',template:`<input class="lwb-ve-input" placeholder="世界书文件名 file（必填）"/><input class="lwb-ve-input" placeholder="条目 key（建议填写）"/><textarea class="lwb-ve-text" rows="4" placeholder="新条目内容 content（可留空）"></textarea>` },
        { value:'qr.run',label:'快速回复（/run）',template:`<input class="lwb-ve-input" placeholder="预设名（可空） preset"/><input class="lwb-ve-input" placeholder="标签（label，必填）"/>` },
        { value:'custom.st',label:'自定义ST命令',template:`<textarea class="lwb-ve-text" rows="4" placeholder="每行一条斜杠命令"></textarea>` },
      ];
      const addRow=(presetType)=>{
        const row=U.el('div','lwb-ve-row'); row.style.alignItems='flex-start';
        row.innerHTML=`<select class="lwb-ve-input lwb-ve-mini lwb-act-type"></select><div class="lwb-ve-fields" style="flex:1; display:grid; grid-template-columns: 1fr 1fr; gap:6px;"></div><button type="button" class="lwb-ve-btn ghost lwb-ve-del">删除</button>`;
        const typeSel=row.querySelector('.lwb-act-type'); const fields=row.querySelector('.lwb-ve-fields'); row.querySelector('.lwb-ve-del').addEventListener('click',()=>row.remove());
        typeSel.innerHTML=TYPES.map(a=>`<option value="${a.value}">${a.label}</option>`).join('');
        const renderFields=()=>{ const t=typeSel.value; const def=TYPES.find(a=>a.value===t); fields.innerHTML=def?def.template:''; };
        typeSel.addEventListener('change',renderFields); if(presetType) typeSel.value=presetType; renderFields(); list.appendChild(row);
      };
      addBtn.addEventListener('click',()=>addRow()); addRow();
      ui.btnOk.addEventListener('click',()=>{ const rows=U.qa(list,'.lwb-ve-row'); const actions=[];
        for(const r of rows){ const type=r.querySelector('.lwb-act-type')?.value; const inputs=U.qa(r,'.lwb-ve-fields .lwb-ve-input, .lwb-ve-fields .lwb-ve-text').map(i=>i.value);
          if(type==='var.set'&&inputs[0]) actions.push({type,key:inputs[0],value:inputs[1]||''});
          if(type==='var.bump'&&inputs[0]) actions.push({type,key:inputs[0],delta:inputs[1]||'0'});
          if(type==='var.del'&&inputs[0]) actions.push({type,key:inputs[0]});
          if((type==='wi.enableUID'||type==='wi.disableUID')&&inputs[0]&&inputs[1]) actions.push({type,file:inputs[0],uid:inputs[1]});
          if(type==='wi.setContentUID'&&inputs[0]&&inputs[1]) actions.push({type,file:inputs[0],uid:inputs[1],content:inputs[2]||''});
          if(type==='wi.createContent'&&inputs[0]) actions.push({type,file:inputs[0],key:inputs[1]||'',content:inputs[2]||''});
          if(type==='qr.run'&&inputs[1]) actions.push({type,preset:inputs[0]||'',label:inputs[1]});
          if(type==='custom.st'&&inputs[0]){ const cmds=inputs[0].split('\n').map(s=>s.trim()).filter(Boolean).map(c=>c.startsWith('/')?c:'/'+c).join(' | '); if(cmds) actions.push({type,script:cmds}); }
        }
        const jsCode=buildSTscriptFromActions(actions); const jsBox=block?.querySelector?.('.lwb-ve-js'); if(jsCode && jsBox) jsBox.value=jsCode; ui.wrap.remove();
      });
    }

    function openBumpAliasBuilder(block){
      const html=`<div class="lwb-ve-section"><div class="lwb-ve-label">bump数值映射（每行一条：变量名(可空) | 短语或 /regex/flags | 数值）</div><div id="lwb-bump-list"></div><button type="button" class="lwb-ve-btn" id="lwb-add-bump">+映射</button></div>`;
      const ui=U.mini(html,'bump数值映射设置'); const list=ui.body.querySelector('#lwb-bump-list'); const addBtn=ui.body.querySelector('#lwb-add-bump');
      const addRow=(scope='',phrase='',val='1')=>{
        const row=U.el('div','lwb-ve-row',`<input class="lwb-ve-input" placeholder="变量名(可空=全局)" value="${scope}"/><input class="lwb-ve-input" placeholder="短语 或 /regex(例：/她(很)?开心/i)" value="${phrase}"/><input class="lwb-ve-input" placeholder="数值(整数，可负)" value="${val}"/><button type="button" class="lwb-ve-btn ghost lwb-ve-del">删除</button>`);
        row.querySelector('.lwb-ve-del').addEventListener('click',()=>row.remove()); list.appendChild(row);
      };
      addBtn.addEventListener('click',()=>addRow());
      try{
        const store=typeof window.getBumpAliasStore==='function' ? (window.getBumpAliasStore()||{}) : {};
        const addFromBucket=(scope,bucket)=>{ let n=0; for(const [phrase,val] of Object.entries(bucket||{})){ addRow(scope,phrase,String(val)); n++; } return n; };
        let prefilled=0; if(store._global) prefilled+=addFromBucket('',store._global);
        for(const [scope,bucket] of Object.entries(store||{})){ if(scope==='_global') continue; prefilled+=addFromBucket(scope,bucket); }
        if(prefilled===0) addRow();
      }catch{ addRow(); }
      ui.btnOk.addEventListener('click',async ()=>{
        try{
          const rows=U.qa(list,'.lwb-ve-row'); const items=rows.map(r=>{ const ins=U.qa(r,'.lwb-ve-input').map(i=>i.value); return { scope:(ins[0]||'').trim(), phrase:(ins[1]||'').trim(), val:Number(ins[2]||0) }; }).filter(x=>x.phrase);
          const next={}; for(const it of items){ const bucket= it.scope ? (next[it.scope] ||= {}) : (next._global ||= {}); bucket[it.phrase] = Number.isFinite(it.val) ? it.val : 0; }
          if(typeof window.setBumpAliasStore==='function'){ await window.setBumpAliasStore(next); }
          U.toast.ok('Bump 映射已保存到角色卡'); ui.wrap.remove();
        }catch{}
      });
    }

    function tryInjectButtons(root){
      const scope=root.closest?.('#WorldInfo') || document.getElementById('WorldInfo') || root;
      scope.querySelectorAll?.('.world_entry .alignitemscenter.flex-container .editor_maximize')?.forEach((maxBtn)=>{
        const container=maxBtn.parentElement; if(!container || container.querySelector('.lwb-var-editor-button')) return;
        const entry=container.closest('.world_entry'); const uid=entry?.getAttribute('data-uid')||entry?.dataset?.uid||(window?.jQuery?window.jQuery(entry).data('uid'):undefined);
        const btn=U.el('div','right_menu_button interactable lwb-var-editor-button'); btn.title='条件规则编辑器'; btn.innerHTML='<i class="fa-solid fa-pen-ruler"></i>';
        btn.addEventListener('click',()=>LWBVE.openVarEditor(entry||undefined,uid)); container.insertBefore(btn,maxBtn.nextSibling);
      });
    }
    function observeWIEntriesForEditorButton(){
      try{ LWBVE.obs?.disconnect(); LWBVE.obs=null; }catch{}
      const root=document.getElementById('WorldInfo')||document.body;
      const cb=(()=>{ let t=null; return ()=>{ clearTimeout(t); t=setTimeout(()=>{ tryInjectButtons(root); },100); }; })();
      const obs=new MutationObserver(()=>cb()); try{ obs.observe(root,{childList:true,subtree:true}); }catch{} LWBVE.obs=obs;
    }
    function installVarEventEditorUI(){
      if(LWBVE.installed) return; LWBVE.installed=true;
      try{ injectStyles(); }catch{}
      try{ observeWIEntriesForEditorButton(); }catch{}
      try{ setTimeout(()=>tryInjectButtons(document.body),600); }catch{}
      if (typeof window.parseVareventEvents !== 'function') window.parseVareventEvents = parseVareventEvents;
    }

    LWBVE.install=installVarEventEditorUI;
    LWBVE.openVarEditor=openVarEditor;
    LWBVE.openActionBuilder=openActionBuilder;
    LWBVE.openBumpAliasBuilder=openBumpAliasBuilder;
    LWBVE.parseVareventEvents=parseVareventEvents;
    window.LWBVE=LWBVE;
    window.installVarEventEditorUI=installVarEventEditorUI;
    window.openVarEditor=openVarEditor;
    window.openActionBuilder=openActionBuilder;
    window.openBumpAliasBuilder=openBumpAliasBuilder;
    if (typeof window.parseVareventEvents !== 'function') window.parseVareventEvents = parseVareventEvents;
  })();

/* ============= 第四区：xbgetvar 宏与命令 ============= */
function _getMsgKey(msg){ return (typeof msg?.content==='string') ? 'content' : (typeof msg?.mes==='string' ? 'mes' : null); }
function _safeJSONStringify(v){ try{ return JSON.stringify(v); }catch{ return ''; } }
function _maybeParseRootObject(rootRaw){
  if (typeof rootRaw === 'string') {
    try{
      const s = rootRaw.trim();
      return (s && (s[0]==='{' || s[0]==='[')) ? JSON.parse(s) : null;
    }catch{ return null; }
  }
  return (rootRaw && typeof rootRaw==='object') ? rootRaw : null;
}
function _valToOutString(v){
  if (v == null) return '';
  if (typeof v === 'object') return _safeJSONStringify(v) || '';
  return String(v);
}
function _parseValueForSet(value){
  let vParsed = value;
  try{
    const t = String(value ?? '').trim();
    if ((t.startsWith('{') || t.startsWith('['))) {
      try { return JSON.parse(t); } catch {}
    }
    const looksLikeJson = (t[0] === '{' || t[0] === '[') && /[:\],}]/.test(t);
    if (looksLikeJson && !t.includes('"') && t.includes("'")) {
      const safe = t.replace(/'/g, '"');
      try { return JSON.parse(safe); } catch {}
    }
    if (t === 'true' || t === 'false' || t === 'null') return JSON.parse(t);
    if (/^-?\d+(\.\d+)?$/.test(t)) return JSON.parse(t);
    return value;
  } catch {
    return value;
  }
}
function _extractPathFromArgs(namedArgs, unnamedArgs){
  try{
    if (namedArgs && typeof namedArgs.key === 'string' && namedArgs.key.trim()) {
      return String(namedArgs.key).trim();
    }
    const arr = Array.isArray(unnamedArgs) ? unnamedArgs : [unnamedArgs];
    const first = String(arr[0] ?? '').trim();
    const m = /^key\s*=\s*(.+)$/i.exec(first);
    return m ? m[1].trim() : first;
  }catch{ return ''; }
}
function _extractPathAndRestForSet(namedArgs, unnamedArgs){
  const arr = Array.isArray(unnamedArgs) ? unnamedArgs.filter(v=>v!=null).map(v=>String(v)) : [String(unnamedArgs ?? '')];
  let path = '';
  let rest = '';
  if (namedArgs && typeof namedArgs.key === 'string' && namedArgs.key.trim()) {
    path = namedArgs.key.trim();
    rest = arr.slice(0).join(' ').trim();
  } else {
    const first = (arr[0] || '').trim();
    const m = /^key\s*=\s*(.+)$/i.exec(first);
    if (m) {
      path = m[1].trim();
      rest = arr.slice(1).join(' ').trim();
    } else {
      const raw = arr.join(' ').trim();
      const sp = lwbSplitPathAndValue(raw);
      path = sp.path; rest = sp.value;
    }
  }
  return { path, rest };
}
function _hasTopLevelRuleKey(obj){
  try{
    if(!obj || typeof obj!== 'object' || Array.isArray(obj)) return false;
    for(const k of Object.keys(obj)){
      if (String(k).trim().startsWith('$')) return true;
    }
    return false;
  }catch{ return false; }
}
function _setDeepBySegments(target, segs, value){
  let cur = target;
  for(let i=0;i<segs.length;i++){
    const isLast = i===segs.length-1;
    const key = segs[i];
    if(isLast){
      cur[key] = value;
    }else{
      const nxt = cur[key];
      if (typeof nxt === 'object' && nxt && !Array.isArray(nxt)){
        cur = nxt;
      } else {
        const obj = {};
        cur[key] = obj;
        cur = obj;
      }
    }
  }
}
function _ensureAbsTargetPath(basePath, token){
  try{
    const t = String(token||'').trim();
    if(!t) return String(basePath||'');
    const base = String(basePath||'');
    if (t === base || t.startsWith(base + '.')) return t;
    return base ? (base + '.' + t) : t;
  }catch{ return String(basePath||''); }
}
function _segmentsRelativeToBase(absPath, basePath){
  const segs = lwbSplitPathWithBrackets(absPath);
  const baseSegs = lwbSplitPathWithBrackets(basePath);
  if (!segs.length || !baseSegs.length) return segs || [];
  const matches = baseSegs.every((b,i)=>String(segs[i])===String(b));
  return matches ? segs.slice(baseSegs.length) : segs;
}

function expandShorthandRuleObject(basePath, valueObj){
  try{
    const base = String(basePath || '');
    const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
    if (!isObj(valueObj)) return null;

    function stripDollarKeysDeep(val){
      if (Array.isArray(val)) return val.map(stripDollarKeysDeep);
      if (isObj(val)){
        const out = {};
        for (const k in val){
          if (!Object.prototype.hasOwnProperty.call(val, k)) continue;
          if (String(k).trim().startsWith('$')) continue;
          out[k] = stripDollarKeysDeep(val[k]);
        }
        return out;
      }
      return val;
    }

    function formatPathWithBrackets(pathStr){
      const segs = lwbSplitPathWithBrackets(String(pathStr||''));
      let out = '';
      for (const s of segs){
        if (typeof s === 'number') out += `[${s}]`;
        else out += out ? `.${s}` : `${s}`;
      }
      return out;
    }

    function assignDeep(dst, src){
      for (const k in src){
        if (!Object.prototype.hasOwnProperty.call(src, k)) continue;
        const v = src[k];
        if (v && typeof v==='object' && !Array.isArray(v)){
          if (!dst[k] || typeof dst[k] !== 'object' || Array.isArray(dst[k])) dst[k] = {};
          assignDeep(dst[k], v);
        } else {
          dst[k] = v;
        }
      }
    }

    const rulesTop = {};
    const dataTree = {};

    function writeDataAt(relPathStr, val){
      const abs = _ensureAbsTargetPath(base, relPathStr);
      const relSegs = _segmentsRelativeToBase(abs, base);
      if (relSegs.length){
        _setDeepBySegments(dataTree, relSegs, val);
      } else {
        if (val && typeof val==='object' && !Array.isArray(val)) {
          assignDeep(dataTree, val);
        } else {
          dataTree['$root'] = val;
        }
      }
    }

    function walk(node, currentRelPathStr){
      if (Array.isArray(node)){
        const cleanedArr = node.map(stripDollarKeysDeep);
        if (currentRelPathStr) writeDataAt(currentRelPathStr, cleanedArr);
        for (let i=0;i<node.length;i++){
          const el = node[i];
          if (el && typeof el === 'object'){
            const childRel = currentRelPathStr ? `${currentRelPathStr}.${i}` : String(i);
            walk(el, childRel);
          }
        }
        return;
      }

      if (!isObj(node)){
        if (currentRelPathStr) writeDataAt(currentRelPathStr, node);
        return;
      }

      const cleaned = stripDollarKeysDeep(node);
      if (currentRelPathStr) writeDataAt(currentRelPathStr, cleaned);
      else assignDeep(dataTree, cleaned);

      for (const key in node){
        if (!Object.prototype.hasOwnProperty.call(node, key)) continue;
        const v = node[key];
        const keyStr = String(key).trim();
        const isRule = keyStr.startsWith('$');

        if (!isRule){
          const childRel = currentRelPathStr ? `${currentRelPathStr}.${keyStr}` : keyStr;
          if (v && typeof v === 'object') walk(v, childRel);
          continue;
        }

        const rest = keyStr.slice(1).trim();
        if (!rest) continue;
        const parts = rest.split(/\s+/).filter(Boolean);
        if (!parts.length) continue;

        const targetToken = parts.pop();
        const dirs = parts.map(t => String(t).trim().startsWith('$') ? String(t).trim() : ('$' + String(t).trim()));
        const fullRelTarget = currentRelPathStr ? `${currentRelPathStr}.${targetToken}` : targetToken;

        const absTarget = _ensureAbsTargetPath(base, fullRelTarget);
        const absDisplay = formatPathWithBrackets(absTarget);
        const ruleKey = `$ ${dirs.join(' ')} ${absDisplay}`.trim();
        rulesTop[ruleKey] = {};

        if (v !== undefined){
          const cleanedVal = stripDollarKeysDeep(v);
          writeDataAt(fullRelTarget, cleanedVal);
          if (v && typeof v === 'object'){
            walk(v, fullRelTarget);
          }
        }
      }
    }

    walk(valueObj, '');

    const out = {};
    assignDeep(out, rulesTop);
    assignDeep(out, dataTree);
    return out;
  }catch{ return null; }
}

function lwbSplitPathWithBrackets(path){
  const s = String(path || '');
  const segs = [];
  let i = 0, buf = '';
  const flushBuf = ()=>{ if(buf.length){ const pushed = /^\d+$/.test(buf) ? Number(buf) : buf; segs.push(pushed); buf=''; } };
  while(i < s.length){
    const ch = s[i];
    if (ch === '.') { flushBuf(); i++; continue; }
    if (ch === '[') {
      i++;
      while(i < s.length && /\s/.test(s[i])) i++;
      let val;
      if (s[i] === '"' || s[i] === "'") {
        const quote = s[i++]; let str = '', esc = false;
        while(i < s.length){
          const c = s[i++];
          if (esc) { str += c; esc = false; continue; }
          if (c === '\\') { esc = true; continue; }
          if (c === quote) break;
          str += c;
        }
        val = str;
        while(i < s.length && /\s/.test(s[i])) i++;
        if (s[i] === ']') i++;
      } else {
        let raw = '';
        while(i < s.length && s[i] !== ']') raw += s[i++];
        if (s[i] === ']') i++;
        const trimmed = String(raw).trim();
        val = (/^-?\d+$/.test(trimmed)) ? Number(trimmed) : trimmed;
      }
      flushBuf();
      segs.push(val);
      continue;
    }
    buf += ch; i++;
  }
  flushBuf();
  return segs;
}
function lwbSplitPathAndValue(raw){
  const s = String(raw || '');
  let i = 0, depth = 0, inQ = false, qch = '';
  for (; i < s.length; i++) {
    const ch = s[i];
    if (inQ) {
      if (ch === '\\') { i++; continue; }
      if (ch === qch) { inQ = false; qch = ''; }
      continue;
    }
    if (ch === '"' || ch === "'") { inQ = true; qch = ch; continue; }
    if (ch === '[') { depth++; continue; }
    if (ch === ']') { depth = Math.max(0, depth - 1); continue; }
    if (depth === 0 && /\s/.test(ch)) {
      const path = s.slice(0, i).trim();
      const val = s.slice(i + 1).trim();
      return { path, value: val };
    }
  }
  return { path: s.trim(), value: '' };
}
function lwbResolveVarPath(path){
  try{
    const segs = lwbSplitPathWithBrackets(path);
    if(!segs.length) return '';
    const rootName = String(segs[0]);
    const rootRaw = getLocalVariable(rootName);
    if (segs.length===1) return _valToOutString(rootRaw);
    const obj = _maybeParseRootObject(rootRaw);
    if (!obj) return '';
    let cur = obj;
    for (let i = 1; i < segs.length; i++) {
      const k = segs[i];
      cur = cur?.[k];
      if (cur === undefined) return '';
    }
    return _valToOutString(cur);
  }catch{ return ''; }
}
function replaceXbGetVarInString(s){
  s = String(s ?? '');
  if(!s || s.indexOf('{{xbgetvar::')===-1) return s;
  return s.replace(TAG_RE.xbgetvar,(_,p)=>lwbResolveVarPath(p));
}
function replaceXbGetVarInChat(chat){
  if(!Array.isArray(chat)) return;
  for(const msg of chat){
    try{
      const key=_getMsgKey(msg); if(!key) continue;
      const old=String(msg[key]??''); if(old.indexOf('{{xbgetvar::')===-1) continue;
      msg[key]=replaceXbGetVarInString(old);
    }catch{}
  }
}
function applyXbGetVarForMessage(messageId,writeback=true){
  try{
    const ctx=getContext(); const msg=ctx?.chat?.[messageId]; if(!msg) return;
    const key=_getMsgKey(msg); if(!key) return;
    const old=String(msg[key]??''); if(old.indexOf('{{xbgetvar::')===-1) return;
    const out=replaceXbGetVarInString(old); if(writeback && out!==old) msg[key]=out;
  }catch{}
}
function registerXbGetVarSlashCommand(){
  try{
    const ctx = getContext();
    const { SlashCommandParser, SlashCommand, SlashCommandArgument, ARGUMENT_TYPE } = ctx || {};
    if (!SlashCommandParser?.addCommandObject || !SlashCommand?.fromProps || !SlashCommandArgument?.fromProps) return;
    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
      name: 'xbgetvar',
      returns: 'string',
      helpString: '通过点/中括号路径获取嵌套的本地变量值。支持 ["0"] 强制字符串键、[0] 数组索引，也支持 key=路径 的写法。示例: /xbgetvar 人物状态.姓名["0"].时光啊 或 /xbgetvar key=人物状态.姓名["0"].时光啊 | /echo {{pipe}}',
      unnamedArgumentList: [
        SlashCommandArgument.fromProps({
          description: '变量路径，例如 A.B.C 或 A[0].name 或 A["0"].name',
          typeList: [ARGUMENT_TYPE.STRING],
          isRequired: true,
          acceptsMultiple: false,
        }),
      ],
      callback: (namedArgs, unnamedArgs) => {
        try {
          const path = _extractPathFromArgs(namedArgs, unnamedArgs);
          return lwbResolveVarPath(String(path || ''));
        } catch { return ''; }
      },
    }));
  } catch {}
}
function lwbAssignVarPath(path, value){
  try{
    const segs = lwbSplitPathWithBrackets(path);
    if(!segs.length) return '';
    const rootName = String(segs[0]);
    let vParsed = _parseValueForSet(value);
    if (vParsed && typeof vParsed === 'object') {
      try {
        const res = typeof rulesLoadFromTree === 'function' ? rulesLoadFromTree(vParsed, rootName) : null;
        if (res && res.cleanValue !== undefined) vParsed = res.cleanValue;
        if (res && res.rulesDelta && typeof applyRulesDeltaToTable === 'function') {
          applyRulesDeltaToTable(res.rulesDelta);
          if (typeof rulesSaveToMeta === 'function') rulesSaveToMeta();
        }
      } catch {}
    }
    if (segs.length === 1) {
      const abs = typeof normalizePath === 'function' ? normalizePath(rootName) : rootName;
      let guardOk = true, guardVal = vParsed;
      try {
        if (typeof guardValidate === 'function') {
          const g = guardValidate('set', abs, vParsed);
          guardOk = !!g?.allow;
          if ('value' in g) guardVal = g.value;
        }
      } catch {}
      if (!guardOk) return '';
      if (guardVal && typeof guardVal === 'object') {
        setLocalVariable(rootName, _safeJSONStringify(guardVal));
      } else {
        setLocalVariable(rootName, String(guardVal ?? ''));
      }
      return '';
    }
    const rootRaw = getLocalVariable(rootName);
    let obj;
    const parsed = _maybeParseRootObject(rootRaw);
    if (parsed) {
      obj = Array.isArray(parsed) ? parsed.slice() : (typeof structuredClone==='function' ? structuredClone(parsed) : JSON.parse(_safeJSONStringify(parsed)));
    } else {
      obj = {};
    }
    const { parent, lastKey } = ensureDeepContainer(obj, segs.slice(1));
    const absPath = typeof normalizePath === 'function' ? normalizePath(path) : path;
    let guardOk = true, guardVal = vParsed;
    try {
      if (typeof guardValidate === 'function') {
        const g = guardValidate('set', absPath, vParsed);
        guardOk = !!g?.allow;
        if ('value' in g) guardVal = g.value;
      }
    } catch {}
    if (!guardOk) return '';
    parent[lastKey] = guardVal;
    setLocalVariable(rootName, _safeJSONStringify(obj));
    return '';
  }catch{ return ''; }
}
function registerXbSetVarSlashCommand(){
  try{
    const ctx = getContext();
    const { SlashCommandParser, SlashCommand, SlashCommandArgument, ARGUMENT_TYPE } = ctx || {};
    if (!SlashCommandParser?.addCommandObject || !SlashCommand?.fromProps || !SlashCommandArgument?.fromProps) return;

    function joinUnnamed(args){
      if (Array.isArray(args)) return args.filter(v=>v!=null).map(v=>String(v)).join(' ').trim();
      return String(args ?? '').trim();
    }
    function splitTokensBySpace(s){
      return String(s||'').split(/\s+/).filter(Boolean);
    }
    function isDirectiveToken(tok){
      const t = String(tok||'').trim();
      if (!t) return false;
      if (t === '$ro' || t === '$ext' || t === '$prune' || t === '$free' || t === '$grow' || t === '$shrink' || t === '$list') return true;
      if (t.startsWith('$min=') || t.startsWith('$max=') || t.startsWith('$range=') || t.startsWith('$enum=') || t.startsWith('$match=')) return true;
      if (t.startsWith('$step=')) return true;
      if (t === '$clear') return true;
      return false;
    }    
    function parseKeyAndValue(namedArgs, unnamedArgs){
      const unnamedJoined = joinUnnamed(unnamedArgs);
      const hasNamedKey = typeof namedArgs?.key === 'string' && namedArgs.key.trim().length > 0;
      if (hasNamedKey){
        const keyRaw = namedArgs.key.trim();
        const keyParts = splitTokensBySpace(keyRaw);
        if (keyParts.length > 1 && keyParts.every(p => isDirectiveToken(p) || p === keyParts[keyParts.length - 1])) {
          const directives = keyParts.slice(0, -1);
          const realPath = keyParts[keyParts.length - 1];
          return { directives, realPath, valueText: unnamedJoined };
        }
        if (isDirectiveToken(keyRaw)) {
          const rest = unnamedJoined;
          const m = rest.match(/^\S+/);
          const realPath = m ? m[0] : '';
          const valueText = realPath ? rest.slice(realPath.length).trim() : '';
          return { directives:[keyRaw], realPath, valueText };
        }
        return { directives:[], realPath:keyRaw, valueText:unnamedJoined };
      } else {
        const firstRaw = joinUnnamed(unnamedArgs);
        if (!firstRaw) return { directives:[], realPath:'', valueText:'' };
        const sp = lwbSplitPathAndValue(firstRaw);
        let head = String(sp.path||'').trim();
        let rest = String(sp.value||'').trim();
        const parts = splitTokensBySpace(head);
        if (parts.length > 1 && parts.every(p => isDirectiveToken(p) || p === parts[parts.length - 1])) {
          const directives = parts.slice(0, -1);
          const realPath = parts[parts.length - 1];
          return { directives, realPath, valueText: rest };
        }
        if (isDirectiveToken(head)) {
          const m = rest.match(/^\S+/);
          const realPath = m ? m[0] : '';
          const valueText = realPath ? rest.slice(realPath.length).trim() : '';
          return { directives:[head], realPath, valueText };
        }
        return { directives:[], realPath:head, valueText:rest };
      }
    }

    SlashCommandParser.addCommandObject(SlashCommand.fromProps({
      name: 'xbsetvar',
      returns: 'string',
      helpString: '设置嵌套本地变量：/xbsetvar <path> <value> 或 /xbsetvar key=<path> <value>。支持指令前缀，例如：/xbsetvar key=$list 情节小结 ["item1"] 或 /xbsetvar "$list 情节小结" ["item1"]',
      unnamedArgumentList: [
        SlashCommandArgument.fromProps({
          description: '变量路径或(指令 前缀 + 路径)，例如 $list 情节小结 或 A[0].name',
          typeList: [ARGUMENT_TYPE.STRING],
          isRequired: true,
          acceptsMultiple: false,
        }),
        SlashCommandArgument.fromProps({
          description: '要设置的值（数字、布尔、null、JSON、或字符串）',
          typeList: [ARGUMENT_TYPE.STRING],
          isRequired: true,
          acceptsMultiple: false,
        }),
      ],
      callback: (namedArgs, unnamedArgs) => {
        try{
          const parsed = parseKeyAndValue(namedArgs, unnamedArgs);
          const directives = parsed.directives || [];
          const realPath = String(parsed.realPath || '').trim();
          let rest = String(parsed.valueText || '').trim();
          if (!realPath) return '';

          try{ console.log('[LWB:/xbsetvar] 指令:', directives, '真实路径:', realPath, '值:', rest); }catch{}

          if (directives.length > 0) {
            const delta = parseDirectivesTokenList(directives);
            const absPath = normalizePath(realPath);
            applyRuleDelta(absPath, delta);
            rulesSaveToMeta();
          }

          let toSet = rest;
          try{
            const parsedVal = _parseValueForSet(rest);
            if (parsedVal && typeof parsedVal==='object' && !Array.isArray(parsedVal)){
              const expanded = expandShorthandRuleObject(String(realPath||''), parsedVal);
              if (expanded && typeof expanded==='object'){
                const expandedStr = _safeJSONStringify(expanded) || '';
                toSet = expandedStr;
                try { console.log('[LWB:/xbsetvar] 规则展开为:', `/xbsetvar key=${String(realPath||'')} ${expandedStr}`); } catch {}
              } else {
                toSet = rest;
              }
            } else {
              toSet = rest;
            }
          }catch{
            toSet = rest;
          }

          lwbAssignVarPath(realPath, toSet);
          return '';
        }catch{
          return '';
        }
      },
    }));
  } catch {} 
}

/* ============= 第五区：快照/回滚器 ============= */
const SNAP_STORE_KEY = 'LWB_SNAP';
function getMeta() {
  return getContext()?.chatMetadata || {};
}
function getVarDict() {
  const meta = getMeta();
  return structuredClone(meta.variables || {});
}
// 【变量守护·快照】回溯快照需要把守护规则一并备份
function cloneRulesTableForSnapshot() {
  if (typeof rulesGetTable !== 'function') return {};
  try {
    const table = rulesGetTable();
    if (!table || typeof table !== 'object') return {};
    return structuredClone(table);
  } catch {
    try { return JSON.parse(JSON.stringify(rulesGetTable() || {})); } catch { return {}; }
  }
}
// 【变量守护·快照】回放快照时同步守护表并刷新缓存
function applyRulesSnapshot(tableLike) {
  if (typeof rulesSetTable !== 'function') return;
  const safe = (tableLike && typeof tableLike === 'object') ? tableLike : {};
  let cloned = {};
  try {
    cloned = structuredClone(safe);
  } catch {
    try { cloned = JSON.parse(JSON.stringify(safe)); } catch { cloned = {}; }
  }
  rulesSetTable(cloned);
  if (guardianState?.regexCache) guardianState.regexCache = {};
  try {
    for (const [p, node] of Object.entries(guardianState.table || {})) {
      const c = node?.constraints?.regex;
      if (c && c.source) {
        const flags = c.flags || '';
        try { guardianState.regexCache[p] = new RegExp(c.source, flags); } catch {}
      }
    }
  } catch {}
  try { if (typeof rulesSaveToMeta === 'function') rulesSaveToMeta(); } catch {}
}
function normalizeSnapshotRecord(raw) {
  if (!raw || typeof raw !== 'object') return { vars: {}, rules: {} };
  if (Object.prototype.hasOwnProperty.call(raw, 'vars') || Object.prototype.hasOwnProperty.call(raw, 'rules')) {
    const varsPart = (raw.vars && typeof raw.vars === 'object') ? raw.vars : {};
    const rulesPart = (raw.rules && typeof raw.rules === 'object') ? raw.rules : {};
    return { vars: varsPart, rules: rulesPart };
  }
  return { vars: raw, rules: {} };
}
function syncMetaToLocalVariables(dict) {
  try {
    if (typeof guardBypass === 'function') guardBypass(true);
    const ctx = getContext();
    const meta = ctx?.chatMetadata || {};
    const current = meta.variables || {};
    const next = dict || {};
    for (const k of Object.keys(current)) {
      if (!(k in next)) {
        try { delete current[k]; } catch {}
        try { setLocalVariable(k, ''); } catch {}
      }
    }
    for (const [k, v] of Object.entries(next)) {
      let toStore = v;
      if (v && typeof v === 'object') {
        try { toStore = JSON.stringify(v); } catch { toStore = ''; }
      }
      try { setLocalVariable(k, toStore); } catch {}
    }
    meta.variables = structuredClone(next);
    getContext()?.saveMetadataDebounced?.();
  } catch {} finally {
    if (typeof guardBypass === 'function') guardBypass(false);
  }
}
function setVarDict(dict) {
  syncMetaToLocalVariables(dict);
}
function getSnapMap() {
  const meta = getMeta();
  if (!meta[SNAP_STORE_KEY]) meta[SNAP_STORE_KEY] = {};
  return meta[SNAP_STORE_KEY];
}
function setSnapshot(messageId, snapDict) {
  if (messageId == null || messageId < 0) return;
  const snaps = getSnapMap();
  try {
    snaps[messageId] = structuredClone(snapDict || {});
  } catch {
    try { snaps[messageId] = JSON.parse(JSON.stringify(snapDict || {})); } catch { snaps[messageId] = {}; }
  }
  getContext()?.saveMetadataDebounced?.();
}
function getSnapshot(messageId) {
  if (messageId == null || messageId < 0) return undefined;
  const snaps = getSnapMap();
  const snap = snaps[messageId];
  if (!snap) return undefined;
  try { return structuredClone(snap); } catch {
    try { return JSON.parse(JSON.stringify(snap)); } catch { return undefined; }
  }
}
function clearSnapshotsFrom(startIdInclusive) {
  if (startIdInclusive == null) return;
  try {
    if (typeof guardBypass === 'function') guardBypass(true);
    const snaps = getSnapMap();
    for (const k of Object.keys(snaps)) {
      const id = Number(k);
      if (!Number.isNaN(id) && id >= startIdInclusive) {
        delete snaps[k];
      }
    }
    getContext()?.saveMetadataDebounced?.();
  } finally {
    if (typeof guardBypass === 'function') guardBypass(false);
  }
}
function snapshotCurrentLastFloor() {
  try {
    const ctx = getContext();
    const chat = ctx?.chat || [];
    const lastId = chat.length ? chat.length - 1 : -1;
    if (lastId < 0) return;
    const dict = getVarDict();
    const rules = cloneRulesTableForSnapshot();
    setSnapshot(lastId, { vars: dict, rules });
  } catch {}
}
function snapshotPreviousFloor() {
  snapshotCurrentLastFloor();
}
function snapshotForMessageId(currentId) {
  try {
    if (typeof currentId !== 'number' || currentId < 0) return;
    const dict = getVarDict();
    // 【变量守护·快照】同时备份守护规则
    const rules = cloneRulesTableForSnapshot();
    setSnapshot(currentId, { vars: dict, rules });
  } catch {}
}
function rollbackToPreviousOf(messageId) {
  const id = Number(messageId);
  if (Number.isNaN(id)) return;
  const prevId = id - 1;
  if (prevId < 0) return;
  const snap = getSnapshot(prevId);
  if (snap) {
    // 【变量守护·快照】回滚时还原变量 + 守护规则
    const normalized = normalizeSnapshotRecord(snap);
    try {
      if (typeof guardBypass === 'function') guardBypass(true);
      setVarDict(normalized.vars || {});
      applyRulesSnapshot(normalized.rules || {});
    } finally {
      if (typeof guardBypass === 'function') guardBypass(false);
    }
  }
}
async function executeQueuedVareventJsAfterTurn() {
  const blocks = drainPendingVareventBlocks();
  if (!blocks.length) {
    return;
  }
  for (let i = 0; i < blocks.length; i++) {
    const item = blocks[i];
    try {
      const events = parseVareventEvents(item.inner);
      if (!events.length) continue;
      let chosen = null;
      for (let j = events.length - 1; j >= 0; j--) {
        const ev = events[j];
        const condStr = String(ev.condition ?? '').trim();
        const ok = condStr ? evaluateCondition(condStr) : true;
        if (!ok) continue;
        const hasJs = !!(ev.js && String(ev.js).trim());
        if (!hasJs) {
          continue;
        }
        chosen = ev;
        break;
      }
      if (!chosen) {
        continue;
      }
      const js = String(chosen.js ?? '').trim();
      try {
        await runJS(js);
      } catch (e) {}
    } catch (err) {}
  }
}
function rebuildVariablesFromScratch() {
  try {
    setVarDict({});
    const chat = getContext()?.chat || [];
    for (let i = 0; i < chat.length; i++) {
      applyVariablesForMessage(i);
    }
  } catch {}
}
/* ============= 第六区：聊天消息变量缺失补全 ============= */
const LWB_PLOTLOG_BTN_ID = 'lwb_plotlog_top10_btn';
const LWB_EXT_ID = 'LittleWhiteBox';
const LWB_PLOTLOG_SETTINGS_KEY = 'plotlog';

function getPlotlogSettings() {
  try {
    extension_settings[LWB_EXT_ID] = extension_settings[LWB_EXT_ID] || {};
    extension_settings[LWB_EXT_ID].variablesCore = extension_settings[LWB_EXT_ID].variablesCore || {};
    const bucket = extension_settings[LWB_EXT_ID].variablesCore;
    const cfg = bucket[LWB_PLOTLOG_SETTINGS_KEY] || {};
    const out = {
      api: typeof cfg.api === 'string' ? cfg.api : '',
      model: typeof cfg.model === 'string' ? cfg.model : '',
      apiurl: typeof cfg.apiurl === 'string' ? cfg.apiurl : '',
      apipassword: typeof cfg.apipassword === 'string' ? cfg.apipassword : '',
    };
    bucket[LWB_PLOTLOG_SETTINGS_KEY] = out;
    return out;
  } catch { return { api: '', model: '', apiurl: '', apipassword: '' }; }
}

function setPlotlogSettings(next) {
  try {
    extension_settings[LWB_EXT_ID] = extension_settings[LWB_EXT_ID] || {};
    extension_settings[LWB_EXT_ID].variablesCore = extension_settings[LWB_EXT_ID].variablesCore || {};
    extension_settings[LWB_EXT_ID].variablesCore[LWB_PLOTLOG_SETTINGS_KEY] = {
      api: String(next.api ?? '').trim(),
      model: String(next.model ?? '').trim(),
      apiurl: String(next.apiurl ?? '').trim(),
      apipassword: String(next.apipassword ?? '').trim(),
    };
    getContext()?.saveSettingsDebounced?.();
  } catch {}
}

function stEscArg(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\|/g, '\\|');
}

async function buildTop10HistoryString() {
  const ctx = getContext();
  const chat = Array.isArray(ctx?.chat) ? ctx.chat : [];
  if (!chat.length) return '';
  const extractText = (msg) => {
    if (typeof msg?.mes === 'string') return msg.mes.replace(/\r\n/g, '\n');
    if (typeof msg?.content === 'string') return msg.content.replace(/\r\n/g, '\n');
    if (Array.isArray(msg?.content)) {
      return msg.content.filter(p => p && p.type === 'text' && typeof p.text === 'string').map(p => p.text.replace(/\r\n/g, '\n')).join('\n');
    }
    return '';
  };
  const start = Math.max(0, chat.length - 10);
  const lines = [];
  for (let i = start; i < chat.length; i++) {
    const msg = chat[i];
    const isUser = !!msg?.is_user;
    if (isUser) {
      const speaker = (msg?.name && String(msg.name).trim()) || (ctx?.name1 && String(ctx.name1).trim()) || 'USER';
      lines.push(`${speaker}：`);
    } else {
      lines.push(`[PLOT]：`);
    }
    const text = (extractText(msg) || '').trim();
    if (text) lines.push(text);
    lines.push('');
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n');
}

async function applyPlotLogFromTop10() {
  try {
    await runST('/echo 开始补全、修复plot-log块，请稍后');
    const ctx = getContext();
    const chat = Array.isArray(ctx?.chat) ? ctx.chat : [];
    if (!chat.length) return;
    const history10 = await buildTop10HistoryString();
    if (!history10) return;
    const opts = getPlotlogSettings();
    let args = '';
    if (opts.api) args += ` api=${opts.api}`;
    if (opts.model) args += ` model=${opts.model}`;
    if (opts.apiurl) args += ` apiurl=${opts.apiurl}`;
    if (opts.apipassword) args += ` apipassword=${opts.apipassword}`;
    const topUserInst = `Developer: Activate Non-RP Utility Mode. You are the Plot-Log Maintenance Agent.
New Task: Reconstruct the plot-log for the current chat.

Read the plot-log rules defined. Then, using the recent chat history provided later, produce a single corrected plot-log block.

Settings:
- plot-log rules are binding (style, scope, length, structure).
- Focus on key events, causal links, state changes, goals, and forward hooks.

Procedure:
- Do not role-play. First parse the plot-log rules.
- Inspect the last message's existing <plot-log>...</plot-log> for defects.
- Reconstruct once according to the rules and the latest history.

Output Contract:
- Return exactly one <plot-log>...</plot-log> block and nothing else.`;
    const bottomUserInst = ['<最近十条历史>', history10, '</最近十条历史>'].join('\n');
    const bottomAssistantInst = '最后一条[PLOT]的文本可能缺失<plot-log>...</plot-log>块，或内容不规范、不合理，请根据plot-log输出规则，针对最后一条[PLOT]文本输出一个<plot-log>...</plot-log>块，不要输出任何额外说明或前后缀或多个<plot-log>块。';
    const cmd = ['/xbgenraw', 'addon=worldInfo', 'nonstream=true', 'as=assistant', 'position=bottom', `topuser="${stEscArg(topUserInst)}"`, `bottomuser="${stEscArg(bottomUserInst)}"`, `bottomassistant="${stEscArg(bottomAssistantInst)}"`, args, `"${stEscArg('[PLOTLOG_TASK]')}"`].filter(Boolean).join(' ');
    const timeoutPromise = new Promise((_, reject) => { setTimeout(() => reject(new Error('TIMEOUT')), 120000); });
    let raw;
    try {
      raw = await Promise.race([runST(cmd), timeoutPromise]);
    } catch (error) {
      if (error.message === 'TIMEOUT') {
        await runST('/echo 链接超时，请重试');
        return;
      }
      throw error;
    }
    const rawStr = typeof raw === 'string' ? raw : String(raw?.pipe ?? raw?.result ?? raw?.text ?? '');
    const m = rawStr.match(/<\s*plot-log\b[^>]*>[\s\S]*?<\/\s*plot-log\s*>/i);
    const text = m ? m[0].trim() : '';
    if (!text) {
      await runST('/echo 模型输出内容不规范，请重试');
      return;
    }
    const messageId = chat.length - 1;
    const msg = chat[messageId];
    const prev = typeof msg?.mes === 'string' ? msg.mes : (typeof msg?.content === 'string' ? msg.content : '');
    const tagPattern = /<\s*plot-log\b[^>]*>[\s\S]*?<\/\s*plot-log\s*>/gi;
    if (tagPattern.test(prev)) {
      msg.mes = prev.replace(tagPattern, text);
    } else {
      msg.mes = prev ? `${prev}\n\n${text}` : text;
    }
    const { eventSource, event_types } = ctx || {};
    try { await ctx?.saveChat?.(); } catch {}
    try { updateMessageBlock(messageId, msg, { rerenderMessage: true }); } catch {}
    if (eventSource?.emit && event_types?.MESSAGE_EDITED) {
      await eventSource.emit(event_types.MESSAGE_EDITED, messageId);
    }
    await runST('/echo 已补全、修复块');
  } catch {}
}

function registerPlotLogButton() {
  try {
    if (document.getElementById(LWB_PLOTLOG_BTN_ID)) return;
    const menu = document.getElementById('extensionsMenu');
    if (!menu) { setTimeout(registerPlotLogButton, 500); return; }
    const btn = document.createElement('div');
    btn.id = LWB_PLOTLOG_BTN_ID;
    btn.className = 'list-group-item flex-container flexGap5';
    btn.style.cursor = 'pointer';
    btn.innerHTML = '<div class="fa-solid fa-scroll extensionsMenuExtensionButton"></div>plot-log缺失补全';
    let lpTimer = 0; let lpArmed = false; let ignoreClickUntil = 0;
    const armLongPress = () => {
      try { clearTimeout(lpTimer); } catch {}
      lpArmed = true;
      lpTimer = setTimeout(() => {
        lpArmed = false;
        ignoreClickUntil = Date.now() + 600;
        openPlotlogSettingsModal();
      }, 3000);
    };
    const disarmLongPress = () => { try { clearTimeout(lpTimer); } catch {} lpArmed = false; };
    btn.addEventListener('pointerdown', armLongPress);
    btn.addEventListener('pointerup', disarmLongPress);
    btn.addEventListener('pointerleave', disarmLongPress);
    btn.addEventListener('pointercancel', disarmLongPress);
    btn.addEventListener('click', () => {
      if (Date.now() < ignoreClickUntil) return;
      applyPlotLogFromTop10();
    });
    menu.appendChild(btn);
  } catch {}
}

function makeMiniModal(innerHTML, title = '设置') {
  const wrap = document.createElement('div');
  wrap.style.position = 'fixed';
  wrap.style.inset = '0';
  wrap.style.zIndex = '10010';
  wrap.style.display = 'flex';
  wrap.style.alignItems = 'center';
  wrap.style.justifyContent = 'center';
  const modal = document.createElement('div');
  modal.style.minWidth = '420px';
  modal.style.maxWidth = '720px';
  modal.style.maxHeight = '80vh';
  modal.style.overflow = 'hidden';
  modal.style.background = 'var(--SmartThemeBlurTintColor)';
  modal.style.border = '2px solid var(--SmartThemeBorderColor)';
  modal.style.borderRadius = '10px';
  modal.style.boxShadow = '0 8px 16px var(--SmartThemeShadowColor)';
  modal.style.pointerEvents = 'auto';
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.padding = '10px 14px';
  header.style.borderBottom = '1px solid var(--SmartThemeBorderColor)';
  const hTitle = document.createElement('span');
  hTitle.textContent = title;
  const hClose = document.createElement('span');
  hClose.textContent = '✕';
  hClose.style.cursor = 'pointer';
  header.appendChild(hTitle);
  header.appendChild(hClose);
  const body = document.createElement('div');
  body.style.padding = '10px';
  body.style.overflow = 'auto';
  body.style.maxHeight = '60vh';
  body.innerHTML = innerHTML;
  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.gap = '8px';
  footer.style.justifyContent = 'flex-end';
  footer.style.padding = '12px 14px';
  footer.style.borderTop = '1px solid var(--SmartThemeBorderColor)';
  const btnCancel = document.createElement('button');
  btnCancel.textContent = '取消';
  btnCancel.className = 'menu_button';
  const btnOk = document.createElement('button');
  btnOk.textContent = '确认';
  btnOk.className = 'menu_button';
  footer.appendChild(btnCancel);
  footer.appendChild(btnOk);
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  wrap.appendChild(modal);
  document.body.appendChild(wrap);
  const onClose = () => { try { wrap.remove(); } catch {} };
  hClose.addEventListener('click', onClose);
  btnCancel.addEventListener('click', onClose);
  return { wrap, modal, body, btnOk, btnCancel };
}

function openPlotlogSettingsModal() {
  try {
    const cur = getPlotlogSettings();
    const html = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div>
          <div style="opacity:.7;font-size:13px;margin-bottom:6px;">聊天补全来源</div>
          <select id="lwb-plotlog-api" class="menu_button" style="width:100%;">
            <option value="">（不指定）</option>
            <option value="openai">openai</option>
            <option value="claude">claude</option>
            <option value="gemini">gemini</option>
            <option value="cohere">cohere</option>
            <option value="deepseek">deepseek</option>
          </select>
        </div>
        <div>
          <div style="opacity:.7;font-size:13px;margin-bottom:6px;">模型名称</div>
          <input id="lwb-plotlog-model" class="text_pole" style="width:100%;" placeholder="例如：gpt-4o-mini / gemini-2.5-pro" />
        </div>
        <div>
          <div style="opacity:.7;font-size:13px;margin-bottom:6px;">代理地址</div>
          <input id="lwb-plotlog-apiurl" class="text_pole" style="width:100%;" placeholder="例如：claude.aslight.one/v1" />
        </div>
        <div>
          <div style="opacity:.7;font-size:13px;margin-bottom:6px;">代理地址密码</div>
          <input id="lwb-plotlog-apipassword" class="text_pole" type="password" style="width:100%;" placeholder="可留空" />
        </div>
      </div>
    `;
    const ui = makeMiniModal(html, '设置');
    try { if (ui?.body) ui.body.style.height = 'auto'; if (ui?.modal) { ui.modal.style.width = 'auto'; ui.modal.style.maxWidth = 'none'; } } catch {}
    const sel = ui.body.querySelector('#lwb-plotlog-api');
    const model = ui.body.querySelector('#lwb-plotlog-model');
    const apiurl = ui.body.querySelector('#lwb-plotlog-apiurl');
    const apipassword = ui.body.querySelector('#lwb-plotlog-apipassword');
    try { if (sel) sel.value = cur.api || ''; } catch {}
    try { if (model) model.value = cur.model || ''; } catch {}
    try { if (apiurl) apiurl.value = cur.apiurl || ''; } catch {}
    try { if (apipassword) apipassword.value = cur.apipassword || ''; } catch {}
    ui.btnOk.addEventListener('click', () => {
      const next = {
        api: String(sel && sel.value || '').trim(),
        model: String(model && model.value || '').trim(),
        apiurl: String(apiurl && apiurl.value || '').trim(),
        apipassword: String(apipassword && apipassword.value || '').trim(),
      };
      setPlotlogSettings(next);
      try { ui.wrap.remove(); } catch {}
    });
  } catch {}
}
/* ============= 第七区：变量守护与规则集 ============= */
const LWB_RULES_KEY = 'LWB_RULES'
const guardianState = { table: {}, regexCache: {}, bypass: false, origVarApi: null, lastMetaSyncAt: 0 }
function rulesGetTable() { return guardianState.table || {} }
function rulesSetTable(t) { guardianState.table = t || {} }
function rulesClearCache() { guardianState.table = {}; guardianState.regexCache = {} }
function rulesLoadFromMeta() { try { const meta = getContext()?.chatMetadata || {}; const raw = meta[LWB_RULES_KEY]; if (raw && typeof raw === 'object') { rulesSetTable(structuredClone(raw)); try { for (const [p, node] of Object.entries(guardianState.table)) { if (node?.constraints?.regex?.source) { const src = node.constraints.regex.source; const flg = node.constraints.regex.flags || ''; try { guardianState.regexCache[p] = new RegExp(src, flg) } catch {} } } } catch {} } else { rulesSetTable({}) } } catch { rulesSetTable({}) } }
function rulesSaveToMeta() { try { const meta = getContext()?.chatMetadata || {}; meta[LWB_RULES_KEY] = structuredClone(guardianState.table || {}); guardianState.lastMetaSyncAt = Date.now(); getContext()?.saveMetadataDebounced?.() } catch {} }
function guardBypass(on) { guardianState.bypass = !!on }
function normalizePath(path) { try { const segs = lwbSplitPathWithBrackets(path); const parts = []; for (const s of segs) parts.push(String(s)); return parts.join('.') } catch { return String(path || '').trim() } }
function getRootValue(rootName) { try { const raw = getLocalVariable(rootName); if (raw == null) return undefined; if (typeof raw === 'string') { const s = raw.trim(); if (s && (s[0] === '{' || s[0] === '[')) { try { return JSON.parse(s) } catch { return raw } } return raw } return raw } catch { return undefined } }
function getValueAtPath(absPath) { try { const segs = lwbSplitPathWithBrackets(absPath); if (!segs.length) return undefined; const rootName = String(segs[0]); let cur = getRootValue(rootName); if (segs.length === 1) return cur; if (typeof cur === 'string') { const s = cur.trim(); if (s && (s[0] === '{' || s[0] === '[')) { try { cur = JSON.parse(s) } catch { return undefined } } else { return undefined } } for (let i = 1; i < segs.length; i++) { const k = segs[i]; cur = cur?.[k]; if (cur === undefined) return undefined } return cur } catch { return undefined } }
function typeOfValue(v) { if (Array.isArray(v)) return 'array'; const t = typeof v; if (t === 'object' && v !== null) return 'object'; if (t === 'number') return 'number'; if (t === 'string') return 'string'; if (t === 'boolean') return 'boolean'; if (v === null) return 'null'; return 'scalar' }
function ensureRuleNode(path) { const tbl = rulesGetTable(); const p = normalizePath(path); const node = tbl[p] || (tbl[p] = { typeLock: 'unknown', ro: false, objectPolicy: 'none', arrayPolicy: 'lock', constraints: {}, elementConstraints: null }); return node }
function getRuleNode(path) { const tbl = rulesGetTable(); return tbl[normalizePath(path)] }
function setTypeLockIfUnknown(path, v) { const n = ensureRuleNode(path); if (!n.typeLock || n.typeLock === 'unknown') { n.typeLock = typeOfValue(v); rulesSaveToMeta() } }
function parseDirectivesTokenList(tokens) {
  const out = { ro: false, objectPolicy: null, arrayPolicy: null, constraints: {}, clear: false };
  for (const tok of tokens) {
    const t = String(tok || '').trim();
    if (!t) continue;
    if (t === '$ro') { out.ro = true; continue }
    if (t === '$ext') { out.objectPolicy = 'ext'; continue }
    if (t === '$prune') { out.objectPolicy = 'prune'; continue }
    if (t === '$free') { out.objectPolicy = 'free'; continue }
    if (t === '$grow') { out.arrayPolicy = 'grow'; continue }
    if (t === '$shrink') { out.arrayPolicy = 'shrink'; continue }
    if (t === '$list') { out.arrayPolicy = 'list'; continue }
    if (t.startsWith('$min=')) { const num = Number(t.slice(5)); if (Number.isFinite(num)) { out.constraints.min = num } continue }
    if (t.startsWith('$max=')) { const num = Number(t.slice(5)); if (Number.isFinite(num)) { out.constraints.max = num } continue }
    if (t.startsWith('$range=')) {
      const m = t.match(/^\$range=\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]$/);
      if (m) {
        const a = Number(m[1]), b = Number(m[2]);
        if (Number.isFinite(a) && Number.isFinite(b)) {
          out.constraints.min = Math.min(a, b);
          out.constraints.max = Math.max(a, b)
        }
      }
      continue
    }
    if (t.startsWith('$enum=')) {
      const m = t.match(/^\$enum=\{\s*([^}]+)\s*\}$/);
      if (m) {
        const raw = m[1];
        const vals = raw.split(/[;；]/).map(s => s.trim()).filter(Boolean);
        if (vals.length) out.constraints.enum = vals
      }
      continue
    }
    if (t.startsWith('$match=')) {
      const raw = t.slice(7);
      if (raw.startsWith('/') && raw.lastIndexOf('/') > 0) {
        const last = raw.lastIndexOf('/');
        const patternRaw = raw.slice(1, last);
        const flags = raw.slice(last + 1) || '';
        const pattern = patternRaw.replace(/\\\//g, '/');
        out.constraints.regex = { source: pattern, flags }
      }
      continue
    }
    if (t.startsWith('$step=')) { const num = Number(t.slice(6)); if (Number.isFinite(num)) out.constraints.step = Math.max(0, Math.abs(num)); continue }
    if (t === '$clear') { out.clear = true; continue }
  }
  return out
}
function applyRuleDelta(path, delta) {
  const p = normalizePath(path);
  if (delta && delta.clear) {
    try {
      const tbl = rulesGetTable();
      if (tbl && Object.prototype.hasOwnProperty.call(tbl, p)) {
        delete tbl[p];
      }
      if (guardianState?.regexCache) {
        delete guardianState.regexCache[p];
      }
    } catch {}
  }
  const hasOther =
    !!(delta && (
      delta.ro ||
      delta.objectPolicy ||
      delta.arrayPolicy ||
      (delta.constraints && Object.keys(delta.constraints).length)
    ));

  if (hasOther) {
    const node = ensureRuleNode(p);
    if (delta.ro) node.ro = true;
    if (delta.objectPolicy) node.objectPolicy = delta.objectPolicy;
    if (delta.arrayPolicy) node.arrayPolicy = delta.arrayPolicy;
    if (delta.constraints) {
      const c = node.constraints || {};
      if (delta.constraints.min != null) c.min = Number(delta.constraints.min);
      if (delta.constraints.max != null) c.max = Number(delta.constraints.max);
      if (delta.constraints.enum) c.enum = delta.constraints.enum.slice();
      if (delta.constraints.regex) {
        c.regex = { source: delta.constraints.regex.source, flags: delta.constraints.regex.flags || '' };
        try { guardianState.regexCache[p] = new RegExp(c.regex.source, c.regex.flags || ''); } catch {}
      }
      if (delta.constraints.step != null) c.step = Math.max(0, Math.abs(Number(delta.constraints.step)));
      node.constraints = c;
    }
  }
  rulesSaveToMeta();
}
function pathIsAbsolute(path) { const s = String(path || ''); return !!s && !s.startsWith('.') && !s.startsWith('[') }
function rulesLoadFromTree(valueTree, basePath) {
  const clean = {};
  const rulesDelta = {};

  function setCleanAt(obj, key, val) { obj[key] = val }
  function mergeRule(target, p, d) {
    const n = rulesDelta[p] || (rulesDelta[p] = { tokens: [] });
    n.tokens.push(d);
  }

  function walk(obj, curAbs) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    const out = {};

    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('$')) {
        const rest = k.slice(1).trim();
        const parts = rest.split(/\s+/).filter(Boolean);
        if (!parts.length) continue;

        const rulePathToken = parts[parts.length - 1];
        const dirTokens = parts.slice(0, parts.length - 1);

        let targetPath = rulePathToken;
        if (!pathIsAbsolute(targetPath) && curAbs) targetPath = curAbs ? `${curAbs}.${targetPath}` : targetPath;
        if (!pathIsAbsolute(targetPath) && basePath) targetPath = basePath ? `${basePath}.${targetPath}` : targetPath;
        targetPath = normalizePath(targetPath);

        const parsed = parseDirectivesTokenList(dirTokens);
        mergeRule(rulesDelta, targetPath, parsed);

        if (v && typeof v === 'object' && !Array.isArray(v)) {
          const subClean = walk(v, targetPath);
          if (subClean && typeof subClean === 'object' && Object.keys(subClean).length) {
            Object.keys(subClean).forEach(() => {});
          }
        }
      } else {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          const sub = walk(v, curAbs ? `${curAbs}.${k}` : (basePath ? `${basePath}.${k}` : k));
          setCleanAt(out, k, sub || {});
        } else {
          setCleanAt(out, k, v);
        }
      }
    }

    return out;
  }

  const cleaned = walk(valueTree, basePath || '');
  const flatRules = {};
  for (const [p, tokenBag] of Object.entries(rulesDelta)) {
    for (const tok of tokenBag.tokens) {
      const node = flatRules[p] || (flatRules[p] = {});

      if (tok.clear) node.clear = true;
      if (tok.ro) node.ro = true;
      if (tok.objectPolicy) node.objectPolicy = tok.objectPolicy;
      if (tok.arrayPolicy) node.arrayPolicy = tok.arrayPolicy;

      if (tok.constraints) {
        const c = node.constraints || (node.constraints = {});
        if (tok.constraints.min != null) c.min = tok.constraints.min;
        if (tok.constraints.max != null) c.max = tok.constraints.max;
        if (tok.constraints.enum) c.enum = tok.constraints.enum.slice();
        if (tok.constraints.regex) {
          c.regex = {
            source: tok.constraints.regex.source,
            flags: tok.constraints.regex.flags || ''
          };
        }
        if (tok.constraints.step != null) {
          c.step = Math.max(0, Math.abs(Number(tok.constraints.step)));
        }
      }
    }
  }

  return { cleanValue: cleaned, rulesDelta: flatRules };
}
function applyRulesDeltaToTable(delta) { if (!delta || typeof delta !== 'object') return; for (const [p, d] of Object.entries(delta)) { applyRuleDelta(p, d) } rulesSaveToMeta() }
function clampNumberWithConstraints(v, node) { let out = Number(v); if (!Number.isFinite(out)) return { ok: false }; const c = node?.constraints || {}; if (Number.isFinite(c.min)) out = Math.max(out, c.min); if (Number.isFinite(c.max)) out = Math.min(out, c.max); return { ok: true, value: out } }
function checkStringWithConstraints(v, node) { const s = String(v); const c = node?.constraints || {}; if (Array.isArray(c.enum) && c.enum.length) { if (!c.enum.includes(s)) return { ok: false } } if (c.regex && c.regex.source) { let re = guardianState.regexCache[normalizePath(node.__path || '')]; if (!re) { try { re = new RegExp(c.regex.source, c.regex.flags || ''); guardianState.regexCache[normalizePath(node.__path || '')] = re } catch {} } if (re && !re.test(s)) return { ok: false } } return { ok: true, value: s } }
function getParentPath(absPath) { const segs = lwbSplitPathWithBrackets(absPath); if (segs.length <= 1) return ''; return segs.slice(0, -1).map(s => String(s)).join('.') }
function getEffectiveParentNode(p) { let parentPath = getParentPath(p); while (parentPath) { const pNode = getRuleNode(parentPath); if (pNode && (pNode.objectPolicy !== 'none' || pNode.arrayPolicy !== 'lock')) { return pNode; } parentPath = getParentPath(parentPath); } return null; }
function guardValidate(op, absPath, payload) { if (guardianState.bypass) return { allow: true, value: payload }; const p = normalizePath(absPath); const node = getRuleNode(p) || { typeLock: 'unknown', ro: false, objectPolicy: 'none', arrayPolicy: 'lock', constraints: {} }; if (node.ro) return { allow: false, reason: 'ro' }; const parentPath = getParentPath(p); const parentNode = parentPath ? (getEffectiveParentNode(p) || { objectPolicy: 'none', arrayPolicy: 'lock' }) : null; const currentValue = getValueAtPath(p); if (op === 'delNode') { if (!parentPath) return { allow: false, reason: 'no-parent' }; const pp = getRuleNode(parentPath) || { objectPolicy: 'none', arrayPolicy: 'lock' }; const lastSeg = p.split('.').pop() || ''; const isIndex = /^\d+$/.test(lastSeg); if (isIndex) { if (!(pp.arrayPolicy === 'shrink' || pp.arrayPolicy === 'list')) return { allow: false, reason: 'array-no-shrink' }; return { allow: true } } else { if (!(pp.objectPolicy === 'prune' || pp.objectPolicy === 'free')) return { allow: false, reason: 'object-no-prune' }; return { allow: true } } } if (op === 'push') { const arr = getValueAtPath(p); if (arr === undefined) { const lastSeg = p.split('.').pop() || ''; const isIndex = /^\d+$/.test(lastSeg); if (parentPath) { const parentVal = getValueAtPath(parentPath); const pp = parentNode || { objectPolicy: 'none', arrayPolicy: 'lock' }; if (isIndex) { if (!Array.isArray(parentVal)) return { allow: false, reason: 'parent-not-array' }; if (!(pp.arrayPolicy === 'grow' || pp.arrayPolicy === 'list')) return { allow: false, reason: 'array-no-grow' } } else { if (!(pp.objectPolicy === 'ext' || pp.objectPolicy === 'free')) return { allow: false, reason: 'object-no-ext' } } } const nn = ensureRuleNode(p); nn.typeLock = 'array'; rulesSaveToMeta(); return { allow: true, value: payload } } if (!Array.isArray(arr)) { if (node.typeLock !== 'unknown' && node.typeLock !== 'array') return { allow: false, reason: 'type-locked-not-array' }; return { allow: false, reason: 'not-array' } } if (!(node.arrayPolicy === 'grow' || node.arrayPolicy === 'list')) return { allow: false, reason: 'array-no-grow' }; return { allow: true, value: payload } } if (op === 'bump') { let d = Number(payload); if (!Number.isFinite(d)) return { allow: false, reason: 'delta-nan' }; if (currentValue === undefined) { if (parentPath) { const lastSeg = p.split('.').pop() || ''; const isIndex = /^\d+$/.test(lastSeg); if (isIndex) { if (!(parentNode && (parentNode.arrayPolicy === 'grow' || parentNode.arrayPolicy === 'list'))) return { allow: false, reason: 'array-no-grow' } } else { if (!(parentNode && (parentNode.objectPolicy === 'ext' || parentNode.objectPolicy === 'free'))) return { allow: false, reason: 'object-no-ext' } } } } const c = node?.constraints || {}; const step = Number.isFinite(c.step) ? Math.abs(c.step) : Infinity; if (isFinite(step)) { if (d > step) d = step; if (d < -step) d = -step } const cur = Number(currentValue); if (!Number.isFinite(cur)) { const base = 0 + d; const cl = clampNumberWithConstraints(base, node); if (!cl.ok) return { allow: false, reason: 'number-constraint' }; setTypeLockIfUnknown(p, base); return { allow: true, value: cl.value } } const next = cur + d; const clamped = clampNumberWithConstraints(next, node); if (!clamped.ok) return { allow: false, reason: 'number-constraint' }; return { allow: true, value: clamped.value } } if (op === 'set') { const exists = currentValue !== undefined; if (!exists) { if (parentNode) { const lastSeg = p.split('.').pop() || ''; const isIndex = /^\d+$/.test(lastSeg); if (isIndex) { if (!(parentNode.arrayPolicy === 'grow' || parentNode.arrayPolicy === 'list')) return { allow: false, reason: 'array-no-grow' } } else { if (!(parentNode.objectPolicy === 'ext' || parentNode.objectPolicy === 'free')) return { allow: false, reason: 'object-no-ext' } } } } const incomingType = typeOfValue(payload); if (node.typeLock !== 'unknown' && node.typeLock !== incomingType) return { allow: false, reason: 'type-locked-mismatch' }; if (incomingType === 'number') { let incoming = Number(payload); if (!Number.isFinite(incoming)) return { allow: false, reason: 'number-constraint' }; const c = node?.constraints || {}; const step = Number.isFinite(c.step) ? Math.abs(c.step) : Infinity; const curNum = Number(currentValue); const base = Number.isFinite(curNum) ? curNum : 0; if (isFinite(step)) { let diff = incoming - base; if (diff > step) diff = step; if (diff < -step) diff = -step; incoming = base + diff } const clamped = clampNumberWithConstraints(incoming, node); if (!clamped.ok) return { allow: false, reason: 'number-constraint' }; setTypeLockIfUnknown(p, incoming); return { allow: true, value: clamped.value } } if (incomingType === 'string') { const n2 = { ...node, __path: p }; const ok = checkStringWithConstraints(payload, n2); if (!ok.ok) return { allow: false, reason: 'string-constraint' }; setTypeLockIfUnknown(p, payload); return { allow: true, value: ok.value } } setTypeLockIfUnknown(p, payload); return { allow: true, value: payload } } return { allow: true, value: payload } }
function installVariableApiPatch() { try { const ctx = getContext(); const api = ctx?.variables?.local; if (!api || guardianState.origVarApi) return; guardianState.origVarApi = { set: api.set?.bind(api), add: api.add?.bind(api), inc: api.inc?.bind(api), dec: api.dec?.bind(api), del: api.del?.bind(api) }; if (guardianState.origVarApi.set) { api.set = (name, value) => { try { if (guardianState.bypass) return guardianState.origVarApi.set(name, value); let finalValue = value; if (value && typeof value === 'object' && !Array.isArray(value)) { let hasRuleKey = false; for (const k of Object.keys(value)) { if (k.startsWith('$')) { hasRuleKey = true; break } } if (hasRuleKey) { const { cleanValue, rulesDelta } = rulesLoadFromTree(value, normalizePath(name)); finalValue = cleanValue; applyRulesDeltaToTable(rulesDelta) } } const res = guardValidate('set', normalizePath(name), finalValue); if (!res.allow) return; return guardianState.origVarApi.set(name, res.value) } catch { return } } } if (guardianState.origVarApi.add) { api.add = (name, delta) => { try { if (guardianState.bypass) return guardianState.origVarApi.add(name, delta); const res = guardValidate('bump', normalizePath(name), delta); if (!res.allow) return; const cur = Number(getValueAtPath(normalizePath(name))); if (!Number.isFinite(cur)) { return guardianState.origVarApi.set(name, res.value) } const next = res.value; const diff = Number(next) - cur; return guardianState.origVarApi.add(name, diff) } catch { return } } } if (guardianState.origVarApi.inc) { api.inc = (name) => api.add ? api.add(name, 1) : undefined } if (guardianState.origVarApi.dec) { api.dec = (name) => api.add ? api.add(name, -1) : undefined } if (guardianState.origVarApi.del) { api.del = (name) => { try { if (guardianState.bypass) return guardianState.origVarApi.del(name); const res = guardValidate('delNode', normalizePath(name)); if (!res.allow) return; return guardianState.origVarApi.del(name) } catch { return } } } } catch {} }
function uninstallVariableApiPatch() { try { const ctx = getContext(); const api = ctx?.variables?.local; if (!api || !guardianState.origVarApi) return; if (guardianState.origVarApi.set) api.set = guardianState.origVarApi.set; if (guardianState.origVarApi.add) api.add = guardianState.origVarApi.add; if (guardianState.origVarApi.inc) api.inc = guardianState.origVarApi.inc; if (guardianState.origVarApi.dec) api.dec = guardianState.origVarApi.dec; if (guardianState.origVarApi.del) api.del = guardianState.origVarApi.del; guardianState.origVarApi = null } catch {} }
/* ============= 第八区：模块导出/初始化/清理 ============= */
function bindEvents() {
  try {
    const { eventSource, event_types } = getContext() || {};
    if (!eventSource || !event_types) return;
    const onAnyRendered = (data) => {
      try {
        const id = typeof data === 'object' && data !== null ? (data.messageId ?? data.id ?? data) : data;
        if (typeof id !== 'number') return;
        applyVariablesForMessage(id);
        applyXbGetVarForMessage(id, true);
      } catch {}
    };
    if (event_types.USER_MESSAGE_RENDERED) {
      eventSource.on(event_types.USER_MESSAGE_RENDERED, onAnyRendered);
      listeners.push({ target: eventSource, event: event_types.USER_MESSAGE_RENDERED, handler: onAnyRendered });
    }
    if (event_types.CHARACTER_MESSAGE_RENDERED) {
      eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, onAnyRendered);
      listeners.push({ target: eventSource, event: event_types.CHARACTER_MESSAGE_RENDERED, handler: onAnyRendered });
    }
    if (event_types.MESSAGE_UPDATED) {
      eventSource.on(event_types.MESSAGE_UPDATED, onAnyRendered);
      listeners.push({ target: eventSource, event: event_types.MESSAGE_UPDATED, handler: onAnyRendered });
    }
    if (event_types.MESSAGE_EDITED) {
      eventSource.on(event_types.MESSAGE_EDITED, onAnyRendered);
      listeners.push({ target: eventSource, event: event_types.MESSAGE_EDITED, handler: onAnyRendered });
    }
    if (event_types.MESSAGE_SWIPED) {
      eventSource.on(event_types.MESSAGE_SWIPED, onAnyRendered);
      listeners.push({ target: eventSource, event: event_types.MESSAGE_SWIPED, handler: onAnyRendered });
    }
    if (event_types.MESSAGE_DELETED) {
      const onDeleted = (data) => {
        try {
          const id = typeof data === 'object' && data !== null ? (data.messageId ?? data.id ?? data) : data;
          if (typeof id === 'number') clearSnapshotsFrom(id);
        } catch {}
      };
      eventSource.on(event_types.MESSAGE_DELETED, onDeleted);
      listeners.push({ target: eventSource, event: event_types.MESSAGE_DELETED, handler: onDeleted });
    }
    if (event_types.GENERATION_STARTED) {
      const onGenStart = () => { try { snapshotPreviousFloor(); } catch {} };
      eventSource.on(event_types.GENERATION_STARTED, onGenStart);
      listeners.push({ target: eventSource, event: event_types.GENERATION_STARTED, handler: onGenStart });
    }
    if (event_types.GENERATION_ENDED) {
      const onGenEnd = async () => { try { await executeQueuedVareventJsAfterTurn(); } catch {} };
      eventSource.on(event_types.GENERATION_ENDED, onGenEnd);
      listeners.push({ target: eventSource, event: event_types.GENERATION_ENDED, handler: onGenEnd });
    }
    if (event_types.CHAT_CHANGED) {
      const onChatChanged = () => {
        try {
          drainPendingVareventBlocks();
          runImmediateVarEventsDebounced();
          const meta = getContext()?.chatMetadata || {};
          meta[LWB_PLOT_APPLIED_KEY] = {};
          getContext()?.saveMetadataDebounced?.();
        } catch {}
      };
      eventSource.on(event_types.CHAT_CHANGED, onChatChanged);
      listeners.push({ target: eventSource, event: event_types.CHAT_CHANGED, handler: onChatChanged });
    }
    if (event_types.APP_READY) {
      const onReady = () => { try { runImmediateVarEventsDebounced(); } catch {} };
      eventSource.on(event_types.APP_READY, onReady);
      listeners.push({ target: eventSource, event: event_types.APP_READY, handler: onReady });
    }
    const getMsgIdLoose = (payload) => {
      if (payload && typeof payload === 'object') {
        if (typeof payload.messageId === 'number') return payload.messageId;
        if (typeof payload.id === 'number') return payload.id;
      }
      if (typeof payload === 'number') return payload;
      const chat = getContext()?.chat || [];
      return chat.length ? chat.length - 1 : undefined;
    };
    const getMsgIdStrictForDelete = (payload) => {
      if (payload && typeof payload === 'object') {
        if (typeof payload.id === 'number') return payload.id;
        if (typeof payload.messageId === 'number') return payload.messageId;
      }
      if (typeof payload === 'number') return payload;
      return undefined;
    };
    if (event_types.MESSAGE_SENT) {
      on(eventSource, event_types.MESSAGE_SENT, async () => {
        try {
          snapshotCurrentLastFloor();
          const chat = getContext()?.chat || [];
          const id = chat.length ? chat.length - 1 : undefined;
          if (typeof id === 'number') {
            applyVariablesForMessage(id);
            applyXbGetVarForMessage(id, true);
          }
        } catch {}
      });
    }
    if (event_types.MESSAGE_RECEIVED) {
      on(eventSource, event_types.MESSAGE_RECEIVED, async (data) => {
        try {
          const id = getMsgIdLoose(data);
          if (typeof id === 'number') {
            applyVariablesForMessage(id);
            applyXbGetVarForMessage(id, true);
            await executeQueuedVareventJsAfterTurn();
          }
        } catch {}
      });
    }
    if (event_types.USER_MESSAGE_RENDERED) {
      on(eventSource, event_types.USER_MESSAGE_RENDERED, (data) => {
        try {
          const id = getMsgIdLoose(data);
          if (typeof id === 'number') snapshotForMessageId(id);
        } catch {}
      });
    }
    if (event_types.CHARACTER_MESSAGE_RENDERED) {
      on(eventSource, event_types.CHARACTER_MESSAGE_RENDERED, (data) => {
        try {
          const id = getMsgIdLoose(data);
          if (typeof id === 'number') snapshotForMessageId(id);
        } catch {}
      });
    }
    const pendingSwipeApply = new Map();
    let lastSwipedId = undefined;
    if (event_types.GENERATION_STARTED) {
      on(eventSource, event_types.GENERATION_STARTED, (data) => {
        try {
          const t = (typeof data === 'string' ? data : (data?.type || data?.mode || data?.reason || '')).toLowerCase();
          if (t === 'swipe') {
            const id = lastSwipedId;
            const tId = id != null ? pendingSwipeApply.get(id) : undefined;
            if (tId) {
              clearTimeout(tId);
              pendingSwipeApply.delete(id);
            }
          }
        } catch {}
      });
    }
    if (event_types.MESSAGE_SWIPED) {
      on(eventSource, event_types.MESSAGE_SWIPED, (data) => {
        try {
          const id = getMsgIdLoose(data);
          if (typeof id === 'number') {
            lastSwipedId = id;
            clearAppliedFor(id);
            rollbackToPreviousOf(id);
            const tId = setTimeout(async () => {
              pendingSwipeApply.delete(id);
              applyVariablesForMessage(id);
              await executeQueuedVareventJsAfterTurn();
            }, 10);
            pendingSwipeApply.set(id, tId);
          }
        } catch {}
      });
    }
    if (event_types.MESSAGE_DELETED) {
      on(eventSource, event_types.MESSAGE_DELETED, (data) => {
        try {
          const id = getMsgIdStrictForDelete(data);
          if (typeof id === 'number') {
            rollbackToPreviousOf(id);
            clearSnapshotsFrom(id);
            clearAppliedFrom(id);
          }
        } catch {}
      });
    }
    if (event_types.MESSAGE_EDITED) {
      on(eventSource, event_types.MESSAGE_EDITED, async (data) => {
        try {
          const id = getMsgIdLoose(data);
          if (typeof id === 'number') {
            clearAppliedFor(id);
            rollbackToPreviousOf(id);
            setTimeout(async () => {
              applyVariablesForMessage(id);
              applyXbGetVarForMessage(id, true);
              try {
                const ctx = getContext();
                const msg = ctx?.chat?.[id];
                if (msg) updateMessageBlock(id, msg, { rerenderMessage: true });
              } catch {}
              try {
                if (eventSource?.emit && event_types?.MESSAGE_UPDATED) {
                  await eventSource.emit(event_types.MESSAGE_UPDATED, id);
                }
              } catch {}
              await executeQueuedVareventJsAfterTurn();
            }, 10);
          }
        } catch {}
      });
    }
  } catch {}
}
export function initVariablesCore(){
  if(initialized) return; initialized=true;
  bindEvents();
  try{ registerXbGetVarSlashCommand(); }catch(e){}
  try{ registerXbSetVarSlashCommand(); }catch(e){}
  try{ installWIHiddenTagStripper(); }catch(e){}
  try{ registerWIEventSystem(); }catch(e){}
  try{ installVarEventEditorUI(); }catch(e){}
  try{ registerPlotLogButton(); }catch{}
  try{ rulesLoadFromMeta(); }catch{}
  try{ installVariableApiPatch(); }catch{}
  try{
    const { eventSource, event_types } = getContext() || {};
    if (eventSource && event_types?.CHAT_CHANGED) {
      on(eventSource, event_types.CHAT_CHANGED, () => {
        try { rulesClearCache(); rulesLoadFromMeta(); const meta = getContext()?.chatMetadata || {}; meta[LWB_PLOT_APPLIED_KEY] = {}; getContext()?.saveMetadataDebounced?.(); } catch {}
      });
    }
  }catch{}
  try{ if(typeof window?.registerModuleCleanup==='function'){ window.registerModuleCleanup(MODULE_ID, cleanupVariablesCore); } }catch{} }
export function cleanupVariablesCore(){
  try{ offAll(); }catch{}
  try{ qa(document, '.lwb-ve-overlay').forEach(el=>el.remove()); }catch{}
  try{ qa(document, '.lwb-var-editor-button').forEach(el=>el.remove()); }catch{}
  try{ document.getElementById('lwb-varevent-editor-styles')?.remove(); }catch{}
  try{
    const ctx=getContext(); ctx?.setExtensionPrompt?.(LWB_VAREVENT_PROMPT_KEY,'',0,0,false);
    const ext=ctx?.extensionSettings;
    if(ext && Array.isArray(ext.regex)){
      ext.regex=ext.regex.filter(r=>!(r?.id==='lwb-varevent-replacer'||r?.scriptName==='LWB_VarEventReplacer'));
    }
    ctx?.saveSettingsDebounced?.();
  }catch{}
  try{ const { eventSource } = getContext()||{}; const orig = eventSource && origEmitMap && origEmitMap.get(eventSource); if(orig){ eventSource.emit = orig; origEmitMap.delete(eventSource); } }catch{}
  try{ const btn=document.getElementById(LWB_PLOTLOG_BTN_ID); if(btn){ btn.replaceWith(); } }catch{}
  try{ uninstallVariableApiPatch(); }catch{}
  try{ rulesClearCache(); }catch{}
  try{ guardBypass(false); }catch{}
  try{ if (typeof window!=='undefined' && window.LWBVE) window.LWBVE.installed = false; }catch{}
  initialized=false; }
export { replaceXbGetVarInString };
