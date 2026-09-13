import { contactName, messageText, recordKey, renderRecordWindow } from './message-record-content.js';

const PAGE_SIZE = 40;
const WINDOW_SIZE = PAGE_SIZE * 2;
const BOTTOM_TOLERANCE = 24;
interface ReadingAnchor { key: string; offset: number }

/** All paging/scroll state belongs to this DOM instance; nothing is saved to the chat. */
export function createMessageRecordView(doc: Document) {
    const details = doc.createElement('details');
    details.className = 'xb-private-messages';
    details.setAttribute('aria-label', '私人信息');
    const summary = doc.createElement('summary');
    const title = doc.createElement('span');
    title.className = 'xb-private-title';
    const count = doc.createElement('span');
    count.className = 'xb-private-count';
    const action = doc.createElement('span');
    action.className = 'xb-private-toggle';
    action.setAttribute('aria-hidden', 'true');
    const preview = doc.createElement('span');
    preview.className = 'xb-private-preview';
    summary.append(title, count, action, preview);

    const panel = doc.createElement('div');
    panel.className = 'xb-private-panel';
    const body = doc.createElement('div');
    body.className = 'xb-private-body';
    body.tabIndex = 0;
    body.setAttribute('role', 'region');
    body.setAttribute('aria-label', '通讯记录');
    const content = doc.createElement('div');
    content.className = 'xb-private-entries';
    const latest = doc.createElement('button');
    latest.type = 'button';
    latest.className = 'xb-private-latest';
    latest.textContent = '回到最新';
    latest.hidden = true;
    panel.append(body, latest);
    details.append(summary, panel);

    let nodes: Element[] = [];
    let multipleContacts = false;
    let start = 0;
    let end = 0;
    let pinned = true;
    let anchor: ReadingAnchor | null = null;
    let resize: ResizeObserver | null = null;

    function captureAnchor(retained?: Set<string>): ReadingAnchor | null {
        const top = body.getBoundingClientRect().top;
        for (const item of body.querySelectorAll<HTMLElement>('[data-record-index]')) {
            const rect = item.getBoundingClientRect();
            if (rect.bottom > top && (!retained || retained.has(item.dataset.recordKey!))) {
                return { key: item.dataset.recordKey!, offset: rect.top - top };
            }
        }
        return null;
    }

    function isAtLatestBottom(): boolean {
        return end === nodes.length && body.scrollHeight - body.clientHeight - body.scrollTop <= BOTTOM_TOLERANCE;
    }

    function restorePosition(): void {
        if (!details.isConnected || !details.hasAttribute('open') || body.clientHeight <= 0) {return;}
        if (pinned) {
            body.scrollTop = body.scrollHeight;
        } else if (anchor) {
            const item = [...body.querySelectorAll<HTMLElement>('[data-record-key]')].find(item => item.dataset.recordKey === anchor!.key);
            if (item) {
                body.scrollTop += item.getBoundingClientRect().top - body.getBoundingClientRect().top - anchor.offset;
            }
        }
        // Paging can reach the latest bottom without moving scrollTop (and thus without a scroll event).
        pinned = isAtLatestBottom();
        anchor = captureAnchor();
        latest.hidden = pinned || nodes.length === 0;
    }

    function pageButton(label: string, direction: -1 | 1): HTMLButtonElement {
        const button = doc.createElement('button');
        button.type = 'button';
        button.className = 'xb-private-page';
        button.textContent = label;
        button.addEventListener('click', () => {
            anchor = captureAnchor();
            pinned = false;
            if (direction < 0) {
                start = Math.max(0, start - PAGE_SIZE);
                end = Math.min(end, start + WINDOW_SIZE);
            } else {
                end = Math.min(nodes.length, end + PAGE_SIZE);
                start = Math.max(start, end - WINDOW_SIZE);
            }
            paintWindow();
            // The clicked paging button may be removed. Keep keyboard focus inside the record.
            body.focus({ preventScroll: true });
        });
        return button;
    }

    function paintWindow(): void {
        const restoreFocus = body.contains(doc.activeElement);
        const fragment = renderRecordWindow(nodes, start, end, multipleContacts, doc);
        if (start > 0) {fragment.prepend(pageButton('查看更早消息', -1));}
        if (end < nodes.length) {fragment.append(pageButton('查看较新消息', 1));}
        content.replaceChildren(fragment);
        if (content.parentNode !== body) {body.replaceChildren(content);}
        restorePosition();
        if (restoreFocus) {body.focus({ preventScroll: true });}
        const Observer = doc.defaultView?.ResizeObserver;
        if (!resize && Observer) {
            resize = new Observer(() => {
                // A removed floor must not leave a live observer holding its view in memory.
                if (!details.isConnected || !details.hasAttribute('open')) {
                    resize?.disconnect();
                    resize = null;
                } else {restorePosition();}
            });
            resize.observe(body);
            resize.observe(content);
        }
    }

    function clearWindow(): void {
        resize?.disconnect();
        resize = null;
        content.replaceChildren();
        body.replaceChildren();
        anchor = null;
        latest.hidden = true;
    }

    function showLatest(): void {
        end = nodes.length;
        start = Math.max(0, end - PAGE_SIZE);
        pinned = true;
        anchor = null;
        paintWindow();
    }

    details.addEventListener('toggle', () => {
        if (details.hasAttribute('open')) {
            if (!body.hasChildNodes()) {showLatest();}
        } else {
            clearWindow();
        }
    });
    body.addEventListener('scroll', () => {
        if (!details.hasAttribute('open')) {return;}
        pinned = isAtLatestBottom();
        anchor = captureAnchor();
        latest.hidden = pinned;
    }, { passive: true });
    // Image decoding can change bubble height after initial placement. Follow only if already at latest.
    body.addEventListener('load', restorePosition, true);
    latest.addEventListener('click', () => {
        showLatest();
        body.focus({ preventScroll: true });
    });

    return {
        details,
        update(nextNodes: Element[], target: HTMLElement): void {
            const positions = new Map(nextNodes.map((node, index) => [recordKey(node), index]));
            if (details.isConnected && details.hasAttribute('open') && body.clientHeight > 0) {anchor = captureAnchor(new Set(positions.keys()));}
            if (!pinned && nodes.length) {
                const size = end - start;
                const first = nodes.slice(start, end).find(node => positions.has(recordKey(node)));
                const anchorIndex = anchor ? positions.get(anchor.key) : undefined;
                start = first ? positions.get(recordKey(first))! : Math.max(0, Math.min(start, nextNodes.length - PAGE_SIZE));
                if (anchorIndex !== undefined && (anchorIndex < start || anchorIndex >= start + size)) {start = Math.max(0, anchorIndex - Math.floor(size / 2));}
                end = Math.min(nextNodes.length, start + Math.max(PAGE_SIZE, size));
            }
            nodes = nextNodes;
            const messages = nodes.filter(node => node.tagName === '消息');
            const contacts = new Set(messages.map(contactName));
            multipleContacts = contacts.size > 1;
            title.textContent = contacts.size === 1 ? `与${contacts.values().next().value}的通讯` : '私人通讯';
            count.textContent = `${messages.length} 条消息`;
            const last = messages.at(-1);
            const previewText = last ? `${last.getAttribute('发送者') ?? ''}：${messageText(last)}` : '暂无消息';
            const chars = Array.from(previewText.replace(/\s+/gu, ' '));
            preview.textContent = chars.slice(0, 96).join('') + (chars.length > 96 ? '…' : '');
            if (details.parentNode !== target) {target.replaceChildren(details);}
            if (!details.hasAttribute('open')) {
                clearWindow();
            } else if (pinned || start >= nodes.length || !body.hasChildNodes()) {
                showLatest();
            } else {
                end = Math.min(end, nodes.length);
                paintWindow();
            }
        },
    };
}
