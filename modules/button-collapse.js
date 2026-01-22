let stylesInjected = false;

const SELECTORS = {
  chat: '#chat',
  messages: '.mes',
  mesButtons: '.mes_block .mes_buttons',
  buttons: '.memory-button, .dynamic-prompt-analysis-btn, .mes_history_preview',
  collapse: '.xiaobaix-collapse-btn',
};

const XPOS_KEY = 'xiaobaix_x_btn_position';
const getXBtnPosition = () => {
  try {
    return (
      window?.extension_settings?.LittleWhiteBox-fork?.xBtnPosition ||
      localStorage.getItem(XPOS_KEY) ||
      'name-left'
    );
  } catch {
    return 'name-left';
  }
};

const injectStyles = () => {
  if (stylesInjected) return;
  const css = `
.mes_block .mes_buttons{align-items:center}
.xiaobaix-collapse-btn{
position:relative;display:inline-flex;width:32px;height:32px;justify-content:center;align-items:center;
border-radius:50%;background:var(--SmartThemeBlurTintColor);cursor:pointer;
box-shadow:inset 0 0 15px rgba(0,0,0,.6),0 2px 8px rgba(0,0,0,.2);
transition:opacity .15s ease,transform .15s ease}
.xiaobaix-xstack{position:relative;display:inline-flex;align-items:center;justify-content:center;pointer-events:none}
.xiaobaix-xstack span{
position:absolute;font:italic 900 20px 'Arial Black',sans-serif;letter-spacing:-2px;transform:scaleX(.8);
text-shadow:0 0 10px rgba(255,255,255,.5),0 0 20px rgba(100,200,255,.3);color:#fff}
.xiaobaix-xstack span:nth-child(1){color:rgba(255,255,255,.1);transform:scaleX(.8) translateX(-8px);text-shadow:none}
.xiaobaix-xstack span:nth-child(2){color:rgba(255,255,255,.2);transform:scaleX(.8) translateX(-4px);text-shadow:none}
.xiaobaix-xstack span:nth-child(3){color:rgba(255,255,255,.4);transform:scaleX(.8) translateX(-2px);text-shadow:none}
.xiaobaix-sub-container{display:none;position:absolute;right:38px;border-radius:8px;padding:4px;gap:8px;pointer-events:auto}
.xiaobaix-collapse-btn.open .xiaobaix-sub-container{display:flex;background:var(--SmartThemeBlurTintColor)}
.xiaobaix-collapse-btn.open,.xiaobaix-collapse-btn.open ~ *{pointer-events:auto!important}
.mes_block .mes_buttons.xiaobaix-expanded{width:150px}
.xiaobaix-sub-container,.xiaobaix-sub-container *{pointer-events:auto!important}
.xiaobaix-sub-container .memory-button,.xiaobaix-sub-container .dynamic-prompt-analysis-btn,.xiaobaix-sub-container .mes_history_preview{opacity:1!important;filter:none!important}
.xiaobaix-sub-container.dir-right{left:38px;right:auto;z-index:1000;margin-top:2px}
`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  stylesInjected = true;
};

const createCollapseButton = (dirRight) => {
  injectStyles();
  const btn = document.createElement('div');
  btn.className = 'mes_btn xiaobaix-collapse-btn';
  btn.innerHTML = `
    <div class="xiaobaix-xstack"><span>X</span><span>X</span><span>X</span><span>X</span></div>
    <div class="xiaobaix-sub-container${dirRight ? ' dir-right' : ''}"></div>
  `;
  const sub = btn.lastElementChild;

  ['click','pointerdown','pointerup'].forEach(t => {
    sub.addEventListener(t, e => e.stopPropagation(), { passive: true });
  });

  btn.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    const open = btn.classList.toggle('open');
    const mesButtons = btn.closest(SELECTORS.mesButtons);
    if (mesButtons) mesButtons.classList.toggle('xiaobaix-expanded', open);
  });

  return btn;
};

const findInsertPoint = (messageEl) => {
  return messageEl.querySelector(
    '.ch_name.flex-container.justifySpaceBetween .flex-container.flex1.alignitemscenter,' +
    '.ch_name.flex-container.justifySpaceBetween .flex-container.flex1.alignItemsCenter'
  );
};

const ensureCollapseForMessage = (messageEl, pos) => {
  const mesButtons = messageEl.querySelector(SELECTORS.mesButtons);
  if (!mesButtons) return null;

  let collapseBtn = messageEl.querySelector(SELECTORS.collapse);
  const dirRight = pos === 'edit-right';

  if (!collapseBtn) collapseBtn = createCollapseButton(dirRight);
  else collapseBtn.querySelector('.xiaobaix-sub-container')?.classList.toggle('dir-right', dirRight);

  if (dirRight) {
    const container = findInsertPoint(messageEl);
    if (!container) return null;
    if (collapseBtn.parentNode !== container) container.appendChild(collapseBtn);
  } else {
    if (mesButtons.lastElementChild !== collapseBtn) mesButtons.appendChild(collapseBtn);
  }
  return collapseBtn;
};

let processed = new WeakSet();
let io = null;
let mo = null;
let queue = [];
let rafScheduled = false;

const processOneMessage = (message) => {
  if (!message || processed.has(message)) return;

  const mesButtons = message.querySelector(SELECTORS.mesButtons);
  if (!mesButtons) { processed.add(message); return; }

  const pos = getXBtnPosition();
  if (pos === 'edit-right' && !findInsertPoint(message)) { processed.add(message); return; }

  const targetBtns = mesButtons.querySelectorAll(SELECTORS.buttons);
  if (!targetBtns.length) { processed.add(message); return; }

  const collapseBtn = ensureCollapseForMessage(message, pos);
  if (!collapseBtn) { processed.add(message); return; }

  const sub = collapseBtn.querySelector('.xiaobaix-sub-container');
  const frag = document.createDocumentFragment();
  targetBtns.forEach(b => frag.appendChild(b));
  sub.appendChild(frag);

  processed.add(message);
};

const ensureIO = () => {
  if (io) return io;
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      processOneMessage(e.target);
      io.unobserve(e.target);
    }
  }, {
    root: document.querySelector(SELECTORS.chat) || null,
    rootMargin: '200px 0px',
    threshold: 0
  });
  return io;
};

const observeVisibility = (nodes) => {
  const obs = ensureIO();
  nodes.forEach(n => { if (n && !processed.has(n)) obs.observe(n); });
};

const hookMutations = () => {
  const chat = document.querySelector(SELECTORS.chat);
  if (!chat) return;

  if (!mo) {
    mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes && m.addedNodes.forEach(n => {
          if (n.nodeType !== 1) return;
          const el = n;
          if (el.matches?.(SELECTORS.messages)) queue.push(el);
          else el.querySelectorAll?.(SELECTORS.messages)?.forEach(mes => queue.push(mes));
        });
      }
      if (!rafScheduled && queue.length) {
        rafScheduled = true;
        requestAnimationFrame(() => {
          observeVisibility(queue);
          queue = [];
          rafScheduled = false;
        });
      }
    });
  }
  mo.observe(chat, { childList: true, subtree: true });
};

const processExistingVisible = () => {
  const all = document.querySelectorAll(`${SELECTORS.chat} ${SELECTORS.messages}`);
  if (!all.length) return;
  const unprocessed = [];
  all.forEach(n => { if (!processed.has(n)) unprocessed.push(n); });
  if (unprocessed.length) observeVisibility(unprocessed);
};

const initButtonCollapse = () => {
  injectStyles();
  hookMutations();
  processExistingVisible();
  if (window && window['registerModuleCleanup']) {
    try { window['registerModuleCleanup']('buttonCollapse', cleanup); } catch {}
  }
};

const processButtonCollapse = () => {
  processExistingVisible();
};

const registerButtonToSubContainer = (messageId, buttonEl) => {
  if (!buttonEl) return false;
  const message = document.querySelector(`${SELECTORS.chat} ${SELECTORS.messages}[mesid="${messageId}"]`);
  if (!message) return false;

  processOneMessage(message);

  const pos = getXBtnPosition();
  const collapseBtn = message.querySelector(SELECTORS.collapse) || ensureCollapseForMessage(message, pos);
  if (!collapseBtn) return false;

  const sub = collapseBtn.querySelector('.xiaobaix-sub-container');
  sub.appendChild(buttonEl);
  buttonEl.style.pointerEvents = 'auto';
  buttonEl.style.opacity = '1';
  return true;
};

const cleanup = () => {
  io?.disconnect(); io = null;
  mo?.disconnect(); mo = null;
  queue = [];
  rafScheduled = false;

  document.querySelectorAll(SELECTORS.collapse).forEach(btn => {
    const sub = btn.querySelector('.xiaobaix-sub-container');
    const message = btn.closest(SELECTORS.messages) || btn.closest('.mes');
    const mesButtons = message?.querySelector(SELECTORS.mesButtons) || message?.querySelector('.mes_buttons');
    if (sub && mesButtons) {
      mesButtons.classList.remove('xiaobaix-expanded');
      const frag = document.createDocumentFragment();
      while (sub.firstChild) frag.appendChild(sub.firstChild);
      mesButtons.appendChild(frag);
    }
    btn.remove();
  });

  processed = new WeakSet();
};

if (typeof window !== 'undefined') {
  Object.assign(window, {
    initButtonCollapse,
    cleanupButtonCollapse: cleanup,
    registerButtonToSubContainer,
    processButtonCollapse,
  });

  document.addEventListener('xiaobaixEnabledChanged', (e) => {
    const en = e && e.detail && e.detail.enabled;
    if (!en) cleanup();
  });
}

export { initButtonCollapse, cleanup, registerButtonToSubContainer, processButtonCollapse };
