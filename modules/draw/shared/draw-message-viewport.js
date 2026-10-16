// One admission boundary for tag controls and image hydration. Registration only
// observes message roots; it never reads chat text or walks a message's contents.
// All state is view-local and disappears when the last consumer disconnects.
export function createDrawMessageViewport() {
    const entries = new Map();
    const listeners = new Set();
    const pending = new Set();
    const active = new Set();
    let root, mutations, intersections, frame, latest;
    let writeDepth = 0;

    const messageId = entry => Number(entry.content.closest('.mes')?.getAttribute('mesid') ?? entry.messageId);
    const admitted = entry => entry === latest || entry.near;

    function schedule(entry) {
        entry.dirty = true;
        if (!admitted(entry)) return;
        pending.add(entry);
        if (frame === undefined) frame = requestAnimationFrame(flush);
    }

    function flush() {
        frame = undefined;
        const started = performance.now();
        const batch = [...pending].sort((a, b) => messageId(b) - messageId(a));
        for (const entry of batch) {
            pending.delete(entry);
            if (!entry.content.isConnected) { remove(entry); continue; }
            if (!admitted(entry) || !entry.dirty) continue;
            entry.dirty = false;
            for (const listener of listeners) listener.refresh(entry.content, messageId(entry));
            // Yield between floors instead of holding a low-end phone's UI thread.
            if (performance.now() - started >= 6) break;
        }
        if (pending.size && frame === undefined) frame = requestAnimationFrame(flush);
    }

    function setLatest(entry) {
        const previous = latest;
        latest = entry;
        if (previous && !previous.near) active.delete(previous.content);
        if (entry) {
            active.add(entry.content);
            if (entry.dirty) schedule(entry);
        }
    }

    function add(content, id) {
        let entry = entries.get(content);
        if (entry) return entry;
        entry = { content, messageId: id, near: false, dirty: true };
        entries.set(content, entry);
        intersections?.observe(content);
        if (!latest || messageId(entry) >= messageId(latest)) setLatest(entry);
        return entry;
    }

    function findLatest() {
        let next;
        for (const candidate of entries.values()) {
            if (!next || messageId(candidate) > messageId(next)) next = candidate;
        }
        setLatest(next);
    }

    function remove(entry, updateLatest = true) {
        intersections?.unobserve(entry.content);
        entries.delete(entry.content);
        active.delete(entry.content);
        pending.delete(entry);
        for (const listener of listeners) listener.release?.(entry.content);
        if (latest === entry) {
            latest = undefined;
            if (updateLatest) findLatest();
        }
    }

    function contents(node) {
        if (node.nodeType !== 1) return [];
        if (node.matches('.mes_text')) return [node];
        return [...node.querySelectorAll('.mes .mes_text')];
    }

    function changed(records) {
        for (const record of records) {
            const element = record.target.nodeType === 1 ? record.target : record.target.parentElement;
            // Draw-owned progress, menus and image decoding are not host repaints.
            if (element?.closest('.xb-nd-img')) continue;
            const content = element?.closest('.mes_text');
            if (content) { schedule(add(content)); continue; }
            if (record.type === 'attributes') {
                const body = element?.querySelector('.mes_text');
                if (body) schedule(add(body));
            }
            for (const node of record.removedNodes || []) {
                for (const body of contents(node)) {
                    const entry = entries.get(body);
                    if (entry && !body.isConnected) remove(entry, false);
                }
            }
            for (const node of record.addedNodes || []) {
                for (const body of contents(node).reverse()) add(body);
            }
        }
        if (!latest && entries.size) findLatest();
    }

    function observeMutations() {
        if (root) mutations?.observe(root, { childList: true, subtree: true, characterData: true,
            attributes: true, attributeFilter: ['mesid'] });
    }

    function refresh() {
        const nextRoot = document.getElementById('chat');
        if (root !== nextRoot) {
            mutations?.disconnect();
            intersections?.disconnect();
            for (const entry of [...entries.values()]) remove(entry, false);
            root = nextRoot;
            intersections = new IntersectionObserver(changes => {
                for (const change of changes) {
                    const entry = entries.get(change.target);
                    if (!entry) continue;
                    entry.near = change.isIntersecting;
                    if (admitted(entry)) {
                        active.add(entry.content);
                        if (entry.dirty) schedule(entry);
                    } else active.delete(entry.content);
                }
            }, { root, rootMargin: '600px 0px', threshold: 0 });
            observeMutations();
        }
        // Only roots are enumerated, newest first. No source/slot/tag parsing here.
        for (const content of [...(root?.querySelectorAll('.mes .mes_text') || [])].reverse()) add(content);
        for (const entry of [...entries.values()]) if (!entry.content.isConnected) remove(entry, false);
        if (!latest && entries.size) findLatest();
        return active;
    }

    function stop() {
        mutations?.disconnect(); intersections?.disconnect();
        if (frame !== undefined) cancelAnimationFrame(frame);
        frame = undefined;
        entries.clear(); active.clear(); pending.clear();
        root = mutations = intersections = latest = undefined;
    }

    return {
        subscribe(listener) {
            listeners.add(listener);
            mutations ??= new MutationObserver(changed);
            refresh();
            for (const entry of entries.values()) schedule(entry);
            return () => {
                if (!listeners.delete(listener)) return;
                for (const content of entries.keys()) listener.release?.(content);
                if (!listeners.size) stop();
            };
        },
        refresh,
        activeContents: () => active,
        mount(content, id) {
            const entry = add(content, id);
            const owner = entry.owner = {};
            return () => { if (entries.get(content) === entry && entry.owner === owner) remove(entry); };
        },
        invalidate(content) { if (content) schedule(add(content)); },
        invalidateAll() { for (const entry of entries.values()) schedule(entry); },
        isActive(content) {
            // Direct callers before runtime startup still use the same viewport
            // boundary, checking only their explicitly addressed message.
            if (!listeners.size) {
                const rect = content.getBoundingClientRect();
                const bounds = document.getElementById('chat')?.getBoundingClientRect()
                    ?? { top: 0, bottom: window.innerHeight };
                return rect.bottom >= bounds.top - 600 && rect.top <= bounds.bottom + 600;
            }
            return admitted(add(content));
        },
        write(operation) {
            // Preserve already queued host mutations, but don't observe our own
            // synchronous tag/slot replacements as another host text update.
            if (writeDepth) return operation();
            writeDepth++;
            try {
                if (mutations) changed(mutations.takeRecords());
                mutations?.disconnect();
                return operation();
            }
            finally { writeDepth--; observeMutations(); }
        },
    };
}

export const drawMessageViewport = createDrawMessageViewport();
