export const GALLERY_FEEDBACK_COPY = Object.freeze({
    savePolicy: '保存自动清理天数',
    dismiss: '关闭提示',
    refresh: '刷新',
    refreshing: '刷新中',
    refreshed: '图库已刷新',
    refreshFailed: '图库刷新失败，请重试',
    refreshTimedOut: '图库刷新超时，请重试',
});

// Page-owned transient feedback: never occupies toolbar space or persists.
export function createGalleryFeedback(document, send) {
    const notice = document.getElementById('nd_gallery_notice');
    const text = document.getElementById('nd_gallery_status');
    const dismiss = document.getElementById('nd_gallery_notice_close');
    const refresh = document.getElementById('nd_refresh_stats');
    const label = refresh.querySelector('span');
    const icon = refresh.querySelector('i');
    let noticeTimer;
    let refreshTimer;
    let requestId = null;
    let sequence = 0;

    function clear() {
        clearTimeout(noticeTimer);
        notice.hidden = true;
        text.textContent = '';
    }
    function show(kind, message) {
        clear();
        if (!message) return;
        text.textContent = message;
        notice.dataset.state = kind;
        notice.hidden = false;
        if (kind !== 'loading') noticeTimer = setTimeout(clear, kind === 'error' ? 6500 : 3000);
    }
    function settleRefresh() {
        clearTimeout(refreshTimer);
        requestId = null;
        refresh.disabled = false;
        refresh.removeAttribute('aria-busy');
        refresh.removeAttribute('aria-label');
        icon.classList.remove('fa-spin');
    }
    function startRefresh() {
        if (requestId !== null) return;
        requestId = `gallery-refresh-${++sequence}`;
        refresh.disabled = true;
        refresh.setAttribute('aria-busy', 'true');
        refresh.setAttribute('aria-label', GALLERY_FEEDBACK_COPY.refreshing);
        icon.classList.add('fa-spin');
        refreshTimer = setTimeout(() => {
            settleRefresh();
            show('error', GALLERY_FEEDBACK_COPY.refreshTimedOut);
        }, 30000);
        send({ type: 'REFRESH_CACHE_STATS', requestId });
    }
    label.textContent = GALLERY_FEEDBACK_COPY.refresh;
    const save = document.getElementById('nd_save_cache_days');
    save.title = GALLERY_FEEDBACK_COPY.savePolicy;
    save.setAttribute('aria-label', GALLERY_FEEDBACK_COPY.savePolicy);
    dismiss.setAttribute('aria-label', GALLERY_FEEDBACK_COPY.dismiss);
    dismiss.addEventListener('click', clear);
    refresh.addEventListener('click', startRefresh);

    return {
        show, clear,
        receive(data) {
            if (requestId === null || data.requestId !== requestId) return;
            settleRefresh();
            show(data.ok === true ? 'success' : 'error', data.ok === true
                ? GALLERY_FEEDBACK_COPY.refreshed : GALLERY_FEEDBACK_COPY.refreshFailed);
        },
        destroy() {
            clear();
            settleRefresh();
            dismiss.removeEventListener('click', clear);
            refresh.removeEventListener('click', startRefresh);
        },
    };
}
