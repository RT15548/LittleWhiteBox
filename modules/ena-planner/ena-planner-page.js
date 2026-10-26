import { mountTextApiSettings } from '../text-api/settings-ui.js';
import { createIdentifier } from '../../shared/common/identifier.js';
import { DOMPurify } from '../../../../../../lib.js';
const PARENT_ORIGIN = (() => {
      try { return new URL(document.referrer).origin; } catch { return window.location.origin; }
    })();

    const post = (type, payload) => parent.postMessage({ type, payload }, PARENT_ORIGIN);
    const $ = id => document.getElementById(id);
    const $$ = sel => document.querySelectorAll(sel);

    function genId() {
      return createIdentifier();
    }

    let cfg = null;
    let logs = [];
    let pendingSave = null;
    let undoState = null;
    let undoPending = false;

    /* ── Save indicator ── */

    function setSaveIndicator(state, text) {
      const el = $('ep_save_status');
      if (!el) return;
      const span = document.createElement('span');
      if (state === 'saving') {
        span.style.color = 'var(--warn)';
        span.textContent = text || '保存中…';
      } else if (state === 'saved') {
        span.style.color = 'var(--success)';
        span.textContent = text || '已保存';
      } else if (state === 'error') {
        span.style.color = 'var(--error)';
        span.textContent = text || '保存失败';
      } else {
        el.textContent = '就绪';
        return;
      }
      el.replaceChildren(span);
    }

    function startPendingSave(requestId) {
      pendingSave = {
        requestId,
        timer: setTimeout(() => {
          if (!pendingSave || pendingSave.requestId !== requestId) return;
          pendingSave = null;
          setSaveIndicator('error', '保存超时');
        }, 5000)
      };
      setSaveIndicator('saving');
    }

    function resolvePendingSave(requestId) {
      if (!pendingSave || pendingSave.requestId !== requestId) return;
      clearTimeout(pendingSave.timer);
      pendingSave = null;
      setSaveIndicator('saved');
      setTimeout(() => setSaveIndicator(''), 2000);
    }

    function rejectPendingSave(requestId, msg) {
      if (!pendingSave || pendingSave.requestId !== requestId) return;
      clearTimeout(pendingSave.timer);
      pendingSave = null;
      setSaveIndicator('error', msg || '保存失败');
    }

    /* ── Auto-save ── */

    let autoSaveTimer = null;

    function scheduleSave() {
      if (undoPending) return;
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(doSave, 600);
    }

    function doSave() {
      if (pendingSave) return;
      const requestId = `ena_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const patch = collectPatch();
      startPendingSave(requestId);
      post('xb-ena:save-config', { requestId, patch });
    }

    /* ── UI helpers ── */

    function setLocalStatus(elId, text, type) {
      const el = $(elId);
      if (!el) return;
      el.textContent = text || '';
      el.className = 'status-text' + (type ? ' ' + type : '');
    }

    function setBadge(enabled) {
      const badge = $('ep_badge');
      badge.innerHTML = DOMPurify.sanitize(enabled
        ? '<span class="hl">已启用</span>'
        : '<span style="color:var(--txt3)">未启用</span>');
    }

    const textApiEditor = mountTextApiSettings(document.getElementById('planner-text-api'), { feature: 'planner', namespace: 'LittleWhiteBox-EnaFrame' });
    function activateTab(viewId) {
      if (viewId === 'api') void textApiEditor.refresh();
      $$('.nav-item, .mobile-nav-item').forEach(n => {
        n.classList.toggle('active', n.dataset.view === viewId);
      });
      $$('.view').forEach(v => {
        v.classList.toggle('active', v.id === `view-${viewId}`);
      });
      if (viewId === 'debug') post('xb-ena:logs-request');
    }

    /* ── Type conversion ── */

    function toBool(v, fallback = false) {
      if (v === true || v === false) return v;
      if (v === 'true') return true;
      if (v === 'false') return false;
      return fallback;
    }

    function toNum(v, fallback = 0) {
      const n = Number(v);
      return Number.isFinite(n) ? n : fallback;
    }

    function arrToCsv(arr) { return Array.isArray(arr) ? arr.join(', ') : ''; }

    function csvToArr(text) {
      return String(text || '').split(/[,，]/).map(x => x.trim()).filter(Boolean);
    }
    function normalizeKeepTagsInput(text) {
      const src = csvToArr(text);
      const out = [];
      src.forEach(item => {
        const tag = String(item || '').replace(/^<+|>+$/g, '').toLowerCase();
        if (!/^[a-z][a-z0-9_-]*$/.test(tag)) return;
        if (!out.includes(tag)) out.push(tag);
      });
      return out;
    }

    function escapeHtml(str) {
      return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /* ── Prompt blocks ── */

    function createPromptBlockElement(block, idx, total) {
      const wrap = document.createElement('div');
      wrap.className = 'prompt-block';

      const head = document.createElement('div');
      head.className = 'prompt-head';

      const left = document.createElement('div');
      left.className = 'prompt-head-left';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'input';
      nameInput.placeholder = '块名称';
      nameInput.value = block.name || '';
      nameInput.addEventListener('change', () => { block.name = nameInput.value; scheduleSave(); });

      const roleSelect = document.createElement('select');
      roleSelect.className = 'input';
      ['system', 'user'].forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        opt.selected = (block.role || 'system') === r;
        roleSelect.appendChild(opt);
      });
      roleSelect.addEventListener('change', () => { block.role = roleSelect.value; scheduleSave(); });

      left.append(nameInput, roleSelect);

      const right = document.createElement('div');
      right.className = 'prompt-head-right';

      const upBtn = document.createElement('button');
      upBtn.className = 'btn btn-sm';
      upBtn.textContent = '↑';
      upBtn.disabled = idx === 0;
      upBtn.addEventListener('click', () => {
        if (idx === 0) return;
        [cfg.promptBlocks[idx - 1], cfg.promptBlocks[idx]] = [cfg.promptBlocks[idx], cfg.promptBlocks[idx - 1]];
        renderPromptList(); scheduleSave();
      });

      const downBtn = document.createElement('button');
      downBtn.className = 'btn btn-sm';
      downBtn.textContent = '↓';
      downBtn.disabled = idx === total - 1;
      downBtn.addEventListener('click', () => {
        if (idx >= total - 1) return;
        [cfg.promptBlocks[idx], cfg.promptBlocks[idx + 1]] = [cfg.promptBlocks[idx + 1], cfg.promptBlocks[idx]];
        renderPromptList(); scheduleSave();
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-sm btn-del';
      delBtn.textContent = '删除';
      delBtn.addEventListener('click', () => {
        cfg.promptBlocks.splice(idx, 1);
        renderPromptList(); scheduleSave();
      });

      right.append(upBtn, downBtn, delBtn);

      const content = document.createElement('textarea');
      content.className = 'input';
      content.placeholder = '提示词内容...';
      content.value = block.content || '';
      content.addEventListener('change', () => { block.content = content.value; scheduleSave(); });

      head.append(left, right);
      wrap.append(head, content);
      return wrap;
    }

    function renderPromptList() {
      const list = $('ep_prompt_list');
      const empty = $('ep_prompt_empty');
      const blocks = cfg?.promptBlocks || [];
      list.innerHTML = '';
      if (!blocks.length) { empty.style.display = ''; return; }
      empty.style.display = 'none';
      blocks.forEach((block, idx) => {
        list.appendChild(createPromptBlockElement(block, idx, blocks.length));
      });
    }

    function renderTemplateSelect(selected = '') {
      const sel = $('ep_tpl_select');
      sel.innerHTML = '<option value="">-- 选择模板 --</option>';
      const names = Object.keys(cfg?.promptTemplates || {});
      const selectedName = names.includes(selected) ? selected : '';
      names.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        opt.selected = name === selectedName;
        sel.appendChild(opt);
      });
    }

    /* ── Undo ── */

    function showUndoBar(name, blocks) {
      clearUndo();
      undoPending = true;
      undoState = {
        name, blocks,
        timer: setTimeout(() => {
          hideUndoBar(); undoPending = false; scheduleSave();
        }, 5000)
      };
      $('ep_tpl_undo_name').textContent = name;
      $('ep_tpl_undo').classList.remove('hidden');
    }

    function hideUndoBar() {
      $('ep_tpl_undo').classList.add('hidden');
      undoState = null;
    }

    function clearUndo() {
      if (undoState?.timer) clearTimeout(undoState.timer);
      hideUndoBar();
      undoPending = false;
    }

    /* ── Model selector ── */

    /* ── Logs ── */

    function renderLogs() {
      const body = $('ep_log_body');
      if (!Array.isArray(logs) || !logs.length) {
        body.innerHTML = '<div class="log-empty">暂无日志</div>';
        return;
      }
      body.innerHTML = DOMPurify.sanitize(logs.map(item => {
        const time = item.time ? new Date(item.time).toLocaleString() : '-';
        const cls = item.ok ? 'success' : 'error';
        const label = item.ok ? '成功' : '失败';

        // Format request messages: one card per message with role label
        let msgHtml = '';
        if (Array.isArray(item.requestMessages) && item.requestMessages.length) {
          msgHtml = item.requestMessages.map((m, i) => {
            const role = escapeHtml(m.role || 'unknown');
            const roleClass = role === 'system' ? 'msg-system' : role === 'user' ? 'msg-user' : 'msg-assistant';
            const content = escapeHtml(m.content || '');
            return `<div class="msg-card ${roleClass}">
              <div class="msg-role">[${i + 1}] ${role}</div>
              <pre class="msg-content">${content}</pre>
            </div>`;
          }).join('');
        } else {
          msgHtml = '<div class="log-empty">无消息</div>';
        }

        return `
        <div class="log-item">
          <div class="log-meta">
            <span>${escapeHtml(time)} · <span class="${cls}">${label}</span></span>
            <span>${escapeHtml(item.model || '-')}</span>
          </div>
          ${item.error ? `<div class="log-error">${escapeHtml(item.error)}</div>` : ''}
          <details><summary>请求消息 (${(item.requestMessages || []).length} 条)</summary>
            <div class="msg-list">${msgHtml}</div>
          </details>
          <details><summary>原始回复</summary>
            <pre class="log-pre">${escapeHtml(item.rawReply || '')}</pre>
          </details>
          <details open><summary>过滤后回复</summary>
            <pre class="log-pre">${escapeHtml(item.filteredReply || '')}</pre>
          </details>
        </div>`;
      }).join(''));
    }

    /* ── Apply / Collect ── */

    function applyConfig(nextCfg) {
      cfg = nextCfg || {};
      logs = Array.isArray(cfg.logs) ? cfg.logs : [];

      $('ep_enabled').value = String(toBool(cfg.enabled, true));
      $('ep_merge_system_msgs').value = String(toBool(cfg.mergeConsecutiveSystemMessages, false));

      $('ep_keep_tags').value = arrToCsv(cfg.responseKeepTags || ['plot', 'note', 'plot-log', 'state']);

      $('ep_logs_persist').value = String(toBool(cfg.logsPersist, true));
      $('ep_logs_max').value = String(toNum(cfg.logsMax, 20));

      setBadge(toBool(cfg.enabled, true));
      const keepSelectedTemplate = cfg?.activePromptTemplate || $('ep_tpl_select')?.value || '';
      renderTemplateSelect(keepSelectedTemplate);
      renderPromptList();
      renderLogs();
    }

    function collectPatch() {
      const p = {};

      p.enabled = toBool($('ep_enabled').value, true);
      p.mergeConsecutiveSystemMessages = toBool($('ep_merge_system_msgs').value, false);


      p.responseKeepTags = normalizeKeepTagsInput($('ep_keep_tags').value);

      p.logsPersist = toBool($('ep_logs_persist').value, true);
      p.logsMax = Math.max(1, Math.min(200, Math.floor(toNum($('ep_logs_max').value, 20))));

      p.promptBlocks = cfg?.promptBlocks || [];
      p.promptTemplates = cfg?.promptTemplates || {};
      p.activePromptTemplate = $('ep_tpl_select')?.value || '';

      return p;
    }

    /* ── Event bindings ── */

    function bindEvents() {
      $$('.nav-item, .mobile-nav-item').forEach(item => {
        item.addEventListener('click', () => activateTab(item.dataset.view));
      });

      $('ep_close').addEventListener('click', () => post('xb-ena:close'));

      $('ep_enabled').addEventListener('change', () => setBadge(toBool($('ep_enabled').value, true)));

      $('ep_run_test').addEventListener('click', () => {
        post('xb-ena:run-test');
        setLocalStatus('ep_test_status', '测试中…', 'loading');
      });

      $('ep_keep_tags').addEventListener('change', () => {
        const normalized = normalizeKeepTagsInput($('ep_keep_tags').value);
        $('ep_keep_tags').value = normalized.join(', ');
      });

      $('ep_add_prompt').addEventListener('click', () => {
        cfg.promptBlocks = cfg.promptBlocks || [];
        cfg.promptBlocks.push({ id: genId(), role: 'system', name: '新块', content: '' });
        renderPromptList(); scheduleSave();
      });

      $('ep_reset_prompt').addEventListener('click', () => {
        if (!confirm('确定恢复默认提示词块？当前提示词块将被覆盖。')) return;
        if (pendingSave) return;
        const requestId = `ena_reset_${Date.now()}`;
        startPendingSave(requestId);
        post('xb-ena:reset-prompt-default', { requestId });
      });

      $('ep_tpl_select').addEventListener('change', () => {
        const name = $('ep_tpl_select').value;
        cfg.activePromptTemplate = name;
        if (!name) return;
        const blocks = cfg?.promptTemplates?.[name];
        if (!Array.isArray(blocks)) return;
        cfg.promptBlocks = structuredClone(blocks);
        renderPromptList(); scheduleSave();
      });

      $('ep_tpl_save').addEventListener('click', () => {
        const name = $('ep_tpl_select').value;
        if (!name) { setSaveIndicator('error', '请先选择或创建模板'); return; }
        cfg.promptTemplates = cfg.promptTemplates || {};
        cfg.promptTemplates[name] = structuredClone(cfg.promptBlocks || []);
        cfg.activePromptTemplate = name;
        renderTemplateSelect(name); scheduleSave();
      });

      $('ep_tpl_saveas').addEventListener('click', () => {
        const name = prompt('新模板名称');
        if (!name) return;
        cfg.promptTemplates = cfg.promptTemplates || {};
        cfg.promptTemplates[name] = structuredClone(cfg.promptBlocks || []);
        cfg.activePromptTemplate = name;
        renderTemplateSelect(name); scheduleSave();
      });

      $('ep_tpl_delete').addEventListener('click', () => {
        const name = $('ep_tpl_select').value;
        if (!name) return;
        const backup = structuredClone(cfg.promptTemplates[name]);
        delete cfg.promptTemplates[name];
        cfg.activePromptTemplate = '';
        renderTemplateSelect('');
        showUndoBar(name, backup);
      });

      $('ep_tpl_undo_btn').addEventListener('click', () => {
        if (!undoState) return;
        cfg.promptTemplates = cfg.promptTemplates || {};
        cfg.promptTemplates[undoState.name] = undoState.blocks;
        cfg.activePromptTemplate = undoState.name;
        renderTemplateSelect(undoState.name);
        clearUndo(); scheduleSave();
      });

      $('ep_debug_worldbook').addEventListener('click', () => {
        $('ep_debug_output').classList.add('visible');
        $('ep_debug_output').textContent = '诊断中…';
        post('xb-ena:debug-worldbook');
      });
      $('ep_debug_char').addEventListener('click', () => {
        $('ep_debug_output').classList.add('visible');
        $('ep_debug_output').textContent = '诊断中…';
        post('xb-ena:debug-char');
      });
      $('ep_test_planner').addEventListener('click', () => {
        post('xb-ena:run-test');
        $('ep_debug_output').classList.add('visible');
        $('ep_debug_output').textContent = '规划测试中…';
      });

      $('ep_open_logs').addEventListener('click', () => post('xb-ena:logs-request'));
      $('ep_log_clear').addEventListener('click', () => {
        if (!confirm('确定清空所有日志？')) return;
        post('xb-ena:logs-clear');
      });
      $('ep_log_export').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(logs || [], null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `ena-planner-logs-${Date.now()}.json`;
        a.click(); URL.revokeObjectURL(url);
      });

      document.querySelectorAll('.card .input').forEach(el => {
        if (el.closest('.prompt-block')) return;
        el.addEventListener('change', scheduleSave);
      });
    }

    /* ── Message handler ── */

    // eslint-disable-next-line no-restricted-syntax -- Rejects both foreign origins and windows before reading data.
    window.addEventListener('message', ev => {
      if (ev.origin !== PARENT_ORIGIN || ev.source !== parent) return;
      const { type, payload } = ev.data || {};

      switch (type) {
        case 'xb-ena:config':
          applyConfig(payload || {});
          break;
        case 'xb-ena:config-saved':
          applyConfig(payload || {});
          resolvePendingSave(payload?.requestId || '');
          break;
        case 'xb-ena:config-save-error':
          if (payload?.config) applyConfig(payload.config);
          rejectPendingSave(payload?.requestId || '', payload?.message);
          break;
        case 'xb-ena:test-done': {
          setLocalStatus('ep_test_status', '规划测试完成', 'success');
          const d = $('ep_debug_output');
          if (d.classList.contains('visible') && d.textContent.includes('测试中'))
            d.textContent = '测试完成，请查看下方日志';
          break;
        }
        case 'xb-ena:test-error': {
          const msg = payload?.message || '规划测试失败';
          setLocalStatus('ep_test_status', msg, 'error');
          const d = $('ep_debug_output');
          if (d.classList.contains('visible')) d.textContent = '测试失败: ' + msg;
          break;
        }
        case 'xb-ena:logs':
          logs = Array.isArray(payload?.logs) ? payload.logs : [];
          renderLogs();
          break;
        case 'xb-ena:logs-clear-error':
          logs = Array.isArray(payload?.logs) ? payload.logs : [];
          renderLogs();
          setSaveIndicator('error', payload?.message || '日志清空失败');
          break;
        case 'xb-ena:debug-output': {
          const out = $('ep_debug_output');
          out.classList.add('visible');
          out.textContent = String(payload?.output || '');
          break;
        }
      }
    });

    /* ── Init ── */

    bindEvents();
    post('xb-ena:ready');
