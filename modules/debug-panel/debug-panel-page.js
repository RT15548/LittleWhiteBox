import { DOMPurify } from '../../../../../../lib.js';
// Isolated monitor page; host subscriptions remain in debug-panel.js.
const PARENT_ORIGIN = (() => {
      try { return new URL(document.referrer).origin; } catch { return window.location.origin; }
    })();
    const post = (payload) => {
      try { parent.postMessage({ source: 'LittleWhiteBox-DebugFrame', ...payload }, PARENT_ORIGIN); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "post" }, caughtError); }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 状态
    // ═══════════════════════════════════════════════════════════════════════
    
    const state = {
      logs: [],
      events: [],
      eventStatsDetail: {},
      caches: [],
      performance: {},
      openCacheDetail: null,
      cacheDetails: {},
      openModules: new Set(),
      openLogIds: new Set(),
      pendingData: null,
      mouseDown: false,
    };

    // ═══════════════════════════════════════════════════════════════════════
    // 用户交互检测 - 核心：交互时不刷新
    // ═══════════════════════════════════════════════════════════════════════

    document.addEventListener('mousedown', () => { state.mouseDown = true; });
    document.addEventListener('mouseup', () => { 
      state.mouseDown = false;
      // 鼠标抬起后，如果有待处理数据，延迟一点再应用（让用户完成选择）
      if (state.pendingData) {
        setTimeout(() => {
          if (!isUserInteracting() && state.pendingData) {
            applyData(state.pendingData);
            state.pendingData = null;
          }
        }, 300);
      }
    });

    function isUserInteracting() {
      // 1. 鼠标按下中
      if (state.mouseDown) return true;
      // 2. 有文字被选中
      const sel = document.getSelection();
      if (sel && sel.toString().length > 0) return true;
      // 3. 焦点在输入元素上
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'SELECT' || active.tagName === 'TEXTAREA')) return true;
      return false;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 工具函数
    // ═══════════════════════════════════════════════════════════════════════

    const fmtTime = (ts) => {
      try {
        const d = new Date(Number(ts) || Date.now());
        return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
      } catch { return '--:--:--'; }
    };

    const fmtBytes = (n) => {
      const v = Number(n);
      if (!Number.isFinite(v) || v <= 0) return '-';
      const units = ['B', 'KB', 'MB', 'GB'];
      let idx = 0, x = v;
      while (x >= 1024 && idx < units.length - 1) { x /= 1024; idx++; }
      return `${x.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
    };

    const fmtMB = (bytes) => Number.isFinite(bytes) && bytes > 0 ? (bytes / 1048576).toFixed(0) + 'MB' : '--';
    const escapeHtml = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    // ═══════════════════════════════════════════════════════════════════════
    // 日志渲染
    // ═══════════════════════════════════════════════════════════════════════

    function getLogFilters() {
      return {
        level: document.getElementById('log-level').value,
        module: document.getElementById('log-module').value
      };
    }

    function filteredLogs() {
      const f = getLogFilters();
      return (state.logs || []).filter(l => {
        if (!l) return false;
        if (f.level !== 'all' && l.level !== f.level) return false;
        if (f.module !== 'all' && String(l.module) !== f.module) return false;
        return true;
      });
    }

    function renderLogModuleOptions() {
      const sel = document.getElementById('log-module');
      const current = sel.value || 'all';
      const mods = [...new Set((state.logs || []).map(l => l?.module).filter(Boolean))].sort();
      sel.innerHTML = DOMPurify.sanitize(`<option value="all">全部</option>` + mods.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join(''));
      if ([...sel.options].some(o => o.value === current)) sel.value = current;
    }

    function renderLogs() {
      renderLogModuleOptions();
      const logs = filteredLogs();
      document.getElementById('log-count').textContent = `共 ${logs.length} 条`;
      const list = document.getElementById('log-list');
      
      if (!logs.length) {
        list.innerHTML = `<div class="empty-hint">暂无日志</div>`;
        return;
      }

      // 清理已不存在的ID
      const currentIds = new Set(logs.map(l => l.id));
      for (const id of state.openLogIds) {
        if (!currentIds.has(id)) state.openLogIds.delete(id);
      }

      list.innerHTML = DOMPurify.sanitize(logs.map(l => {
        const lvl = escapeHtml(l.level || 'info');
        const mod = escapeHtml(l.module || 'unknown');
        const msg = escapeHtml(l.message || '');
        const stack = l.stack ? escapeHtml(String(l.stack)) : '';
        const hasStack = !!stack;
        const isOpen = state.openLogIds.has(l.id);
        
        return `<div class="log-item${isOpen ? ' open' : ''}" data-id="${l.id}">
          <div class="log-header">
            <span class="log-toggle${hasStack ? '' : ' empty'}" data-id="${l.id}">▶</span>
            <span class="time">${fmtTime(l.timestamp)}</span>
            <span class="lvl ${lvl}">[${lvl.toUpperCase()}]</span>
            <span class="mod">${mod}</span>
            <span class="msg">${msg}</span>
          </div>
          ${hasStack ? `<div class="stack">${stack}</div>` : ''}
        </div>`;
      }).join(''));

      // 绑定展开事件
      list.querySelectorAll('.log-toggle:not(.empty)').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = Number(toggle.getAttribute('data-id'));
          const item = toggle.closest('.log-item');
          if (state.openLogIds.has(id)) {
            state.openLogIds.delete(id);
            item.classList.remove('open');
          } else {
            state.openLogIds.add(id);
            item.classList.add('open');
          }
        });
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 事件渲染
    // ═══════════════════════════════════════════════════════════════════════

    function renderModuleList() {
      const detail = state.eventStatsDetail || {};
      const modules = Object.keys(detail).sort();
      const container = document.getElementById('module-list');
      const countEl = document.getElementById('module-count');
      const totalListeners = Object.values(detail).reduce((sum, m) => sum + (m.total || 0), 0);
      if (countEl) countEl.textContent = `${modules.length} 模块 · ${totalListeners} 监听器`;
      
      if (!modules.length) {
        container.innerHTML = `<div class="muted" style="padding:10px;">暂无模块监听</div>`;
        return;
      }
      
      container.innerHTML = DOMPurify.sanitize(modules.map(mod => {
        const info = detail[mod] || {};
        const events = info.events || {};
        const isOpen = state.openModules.has(mod);
        const eventTags = Object.keys(events).sort().map(ev => {
          const cnt = events[ev];
          return `<span class="event-tag">${escapeHtml(ev)}${cnt > 1 ? `<span class="dup">×${cnt}</span>` : ''}</span>`;
        }).join('');
        return `<div class="module-section">
          <div class="module-header${isOpen ? ' open' : ''}" data-mod="${escapeHtml(mod)}">
            <span class="arrow">▶</span>
            <span class="name">${escapeHtml(mod)}</span>
            <span class="count">(${info.total || 0})</span>
          </div>
          <div class="module-events">${eventTags || '<span class="muted">无事件</span>'}</div>
        </div>`;
      }).join(''));
      
      container.querySelectorAll('.module-header').forEach(el => {
        el.addEventListener('click', () => {
          const mod = el.getAttribute('data-mod');
          state.openModules.has(mod) ? state.openModules.delete(mod) : state.openModules.add(mod);
          renderModuleList();
        });
      });
    }

    function renderEvents() {
      renderModuleList();
      const list = document.getElementById('event-list');
      const events = state.events || [];
      if (!events.length) {
        list.innerHTML = `<div class="empty-hint">暂无事件历史</div>`;
        return;
      }
      list.innerHTML = DOMPurify.sanitize(events.slice().reverse().map(e => {
        const repeat = (e.repeatCount || 1) > 1 ? `<span class="repeat-badge">×${e.repeatCount}</span>` : '';
        return `<div class="log-item"><div class="log-header">
          <span class="time">${fmtTime(e.timestamp)}</span>
          <span class="pill mono">${escapeHtml(e.type || 'CUSTOM')}</span>
          <span class="mod">${escapeHtml(e.eventName || '')}</span>
          ${repeat}
          <span class="msg">${escapeHtml(e.dataSummary || '')}</span>
        </div></div>`;
      }).join(''));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 缓存渲染
    // ═══════════════════════════════════════════════════════════════════════

    function renderCaches() {
      const caches = state.caches || [];
      document.getElementById('cache-count').textContent = `共 ${caches.length} 项`;
      const tbody = document.getElementById('cache-tbody');
      const emptyHint = document.getElementById('cache-empty');
      const table = tbody.closest('table');
      
      if (!caches.length) {
        table.style.display = 'none';
        emptyHint.style.display = '';
        return;
      }
      table.style.display = '';
      emptyHint.style.display = 'none';
      
      let html = '';
      for (const c of caches) {
        const mid = escapeHtml(c.moduleId);
        const isOpen = state.openCacheDetail === c.moduleId;
        const detailBtn = c.hasDetail ? `<button data-act="detail" data-mid="${mid}">${isOpen ? '收起' : '详情'}</button>` : '';
        html += `<tr>
          <td>${escapeHtml(c.name || c.moduleId)}<div class="muted mono">${mid}</div></td>
          <td>${c.size == null ? '-' : c.size}</td>
          <td>${fmtBytes(c.bytes)}</td>
          <td class="right">${detailBtn}<button data-act="clear" data-mid="${mid}">清理</button></td>
        </tr>`;
        if (isOpen && state.cacheDetails[c.moduleId] !== undefined) {
          html += `<tr class="cache-detail-row open"><td colspan="4"><div class="pre">${escapeHtml(JSON.stringify(state.cacheDetails[c.moduleId], null, 2))}</div></td></tr>`;
        }
      }
      tbody.innerHTML = DOMPurify.sanitize(html);
      
      tbody.querySelectorAll('button[data-act]').forEach(btn => {
        btn.addEventListener('click', e => {
          const act = btn.getAttribute('data-act');
          const mid = btn.getAttribute('data-mid');
          if (act === 'clear') {
            if (confirm(`确定清理缓存：${mid}？`)) post({ type: 'XB_DEBUG_ACTION', action: 'clearCache', moduleId: mid });
          } else if (act === 'detail') {
            state.openCacheDetail = state.openCacheDetail === mid ? null : mid;
            if (state.openCacheDetail) post({ type: 'XB_DEBUG_ACTION', action: 'cacheDetail', moduleId: mid });
            else renderCaches();
          }
        });
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 性能渲染
    // ═══════════════════════════════════════════════════════════════════════

    function renderPerformance() {
      const perf = state.performance || {};
      
      const fps = perf.fps || 0;
      const fpsEl = document.getElementById('perf-fps');
      fpsEl.textContent = fps > 0 ? fps : '--';
      fpsEl.className = 'value' + (fps >= 50 ? ' good' : fps >= 30 ? ' warn' : fps > 0 ? ' bad' : '');
      
      const memEl = document.getElementById('perf-memory');
      const memStat = document.getElementById('perf-memory-stat');
      if (perf.memory) {
        const pct = perf.memory.total > 0 ? (perf.memory.used / perf.memory.total * 100) : 0;
        memEl.textContent = fmtMB(perf.memory.used);
        memEl.className = 'value' + (pct < 60 ? ' good' : pct < 80 ? ' warn' : ' bad');
        memStat.style.display = '';
      } else {
        memStat.style.display = 'none';
      }
      
      const dom = perf.domCount || 0;
      const domEl = document.getElementById('perf-dom');
      domEl.textContent = dom.toLocaleString();
      domEl.className = 'value' + (dom < 3000 ? ' good' : dom < 6000 ? ' warn' : ' bad');
      
      const msg = perf.messageCount || 0;
      document.getElementById('perf-messages').textContent = msg;
      document.getElementById('perf-messages').className = 'value' + (msg < 100 ? ' good' : msg < 300 ? ' warn' : ' bad');
      
      const img = perf.imageCount || 0;
      document.getElementById('perf-images').textContent = img;
      document.getElementById('perf-images').className = 'value' + (img < 50 ? ' good' : img < 100 ? ' warn' : ' bad');
      
      const reqContainer = document.getElementById('perf-requests');
      const requests = perf.requests || [];
      reqContainer.innerHTML = DOMPurify.sanitize(requests.length ? requests.slice().reverse().map(r => {
        const durClass = r.duration >= 2000 ? 'very-slow' : r.duration >= 1000 ? 'slow' : '';
        return `<div class="perf-item"><div class="top"><span class="time">${fmtTime(r.timestamp)}</span><span class="pill mono">${escapeHtml(r.method)}</span><span class="url">${escapeHtml(r.url)}</span><span class="duration ${durClass}">${r.duration}ms</span></div></div>`;
      }).join('') : `<div class="empty-hint">暂无慢请求</div>`);
      
      const taskContainer = document.getElementById('perf-tasks');
      const tasks = perf.longTasks || [];
      taskContainer.innerHTML = DOMPurify.sanitize(tasks.length ? tasks.slice().reverse().map(t => {
        const durClass = t.duration >= 200 ? 'very-slow' : t.duration >= 100 ? 'slow' : '';
        return `<div class="perf-item"><div class="top"><span class="time">${fmtTime(t.timestamp)}</span><span class="duration ${durClass}">${t.duration}ms</span><span class="muted">${escapeHtml(t.source || '未知')}</span></div></div>`;
      }).join('') : `<div class="empty-hint">暂无长任务</div>`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Tab 切换
    // ═══════════════════════════════════════════════════════════════════════

    function switchTab(tab) {
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
      ['logs', 'events', 'caches', 'performance'].forEach(name => {
        document.getElementById(`tab-${name}`).style.display = name === tab ? '' : 'none';
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 数据应用
    // ═══════════════════════════════════════════════════════════════════════

    function applyData(payload) {
      state.logs = payload?.logs || [];
      state.events = payload?.events || [];
      state.eventStatsDetail = payload?.eventStatsDetail || {};
      state.caches = payload?.caches || [];
      state.performance = payload?.performance || {};
      renderLogs();
      renderEvents();
      renderCaches();
      renderPerformance();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 事件绑定
    // ═══════════════════════════════════════════════════════════════════════

    document.getElementById('btn-refresh').addEventListener('click', () => post({ type: 'XB_DEBUG_ACTION', action: 'refresh' }));
    document.getElementById('btn-clear-logs').addEventListener('click', () => {
      if (confirm('确定清空日志？')) {
        state.openLogIds.clear();
        post({ type: 'XB_DEBUG_ACTION', action: 'clearLogs' });
      }
    });
    document.getElementById('btn-clear-events').addEventListener('click', () => {
      if (confirm('确定清空事件历史？')) post({ type: 'XB_DEBUG_ACTION', action: 'clearEvents' });
    });
    document.getElementById('btn-clear-all-caches').addEventListener('click', () => {
      if (confirm('确定清理全部缓存？')) post({ type: 'XB_DEBUG_ACTION', action: 'clearAllCaches' });
    });
    document.getElementById('btn-clear-requests').addEventListener('click', () => post({ type: 'XB_DEBUG_ACTION', action: 'clearRequests' }));
    document.getElementById('btn-clear-tasks').addEventListener('click', () => post({ type: 'XB_DEBUG_ACTION', action: 'clearTasks' }));
    document.getElementById('log-level').addEventListener('change', renderLogs);
    document.getElementById('log-module').addEventListener('change', renderLogs);
    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
    document.getElementById('module-section-header')?.addEventListener('click', function() { this.classList.toggle('open'); });

    // ═══════════════════════════════════════════════════════════════════════
    // 消息监听
    // ═══════════════════════════════════════════════════════════════════════

    // eslint-disable-next-line no-restricted-syntax -- Rejects both foreign origins and windows before reading data.
    window.addEventListener('message', (event) => {
      if (event.origin !== PARENT_ORIGIN || event.source !== parent) return;
      const msg = event?.data;
      if (!msg || msg.source !== 'LittleWhiteBox-DebugHost') return;
      
      if (msg.type === 'XB_DEBUG_DATA') {
        // 核心逻辑：用户交互时暂存数据，不刷新DOM
        if (isUserInteracting()) {
          state.pendingData = msg.payload;
        } else {
          applyData(msg.payload);
          state.pendingData = null;
        }
      }
      if (msg.type === 'XB_DEBUG_CACHE_DETAIL') {
        const mid = msg.payload?.moduleId;
        if (mid) {
          state.cacheDetails[mid] = msg.payload?.detail;
          renderCaches();
        }
      }
    });

    post({ type: 'FRAME_READY' });
