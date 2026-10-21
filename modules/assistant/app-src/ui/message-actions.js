const COPY = {
    actions: '消息操作',
    copy: { label: '复制', title: '复制整条消息' },
    edit: { label: '编辑', title: '编辑这条消息' },
    reroll: { label: '重答', title: '从这里重新生成后续回复' },
    delete: { label: '删除', title: '删除这条消息' },
    'save-edit': { label: '保存', title: '保存这条消息的修改' },
    'cancel-edit': { label: '取消', title: '取消本次修改' },
    success: { label: '已复制', title: '已复制' },
    error: { label: '复制失败', title: '复制失败' },
};

export function createMessageActions(state) {
    const expanded = new WeakSet();

    return function appendMessageActions(bubble, message, messageIndex, editing) {
        const actions = document.createElement('nav');
        actions.className = 'xb-assistant-message-actions';
        actions.setAttribute('aria-label', COPY.actions);
        const definitions = editing ? ['save-edit', 'cancel-edit'] : ['copy', 'edit', 'reroll', 'delete'];
        for (const action of definitions) {
            const feedback = state.messageActionFeedback?.[`${action}:${messageIndex}`];
            const copy = COPY[feedback] || COPY[action];
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'xb-assistant-message-action';
            button.dataset.messageAction = action;
            button.dataset.messageIndex = String(messageIndex);
            button.textContent = copy.label;
            button.title = copy.title;
            button.setAttribute('aria-label', copy.title);
            actions.appendChild(button);
        }
        bubble.appendChild(actions);
        if (editing) return;

        bubble.classList.add('has-message-actions');
        bubble.tabIndex = 0;
        bubble.setAttribute('role', 'group');
        bubble.setAttribute('aria-label', COPY.actions);
        const setOpen = open => {
            if (open) expanded.add(message);
            else expanded.delete(message);
            actions.hidden = !open;
            bubble.setAttribute('aria-expanded', String(open));
        };
        setOpen(expanded.has(message));
        bubble.addEventListener('click', event => {
            if (event.target.closest('a, button, input, textarea, select, details, iframe, [contenteditable]')) return;
            if (bubble.ownerDocument.getSelection()?.isCollapsed === false) return;
            setOpen(actions.hidden);
        });
        bubble.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !actions.hidden) {
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
                bubble.focus({ preventScroll: true });
            } else if (event.target === bubble && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                setOpen(actions.hidden);
            }
        });
    };
}
