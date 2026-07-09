export interface ElementScrollSnapshot {
    scrollTop: number;
    scrollHeight: number;
    nearBottom: boolean;
    anchorKey: string;
    anchorTopOffset: number;
    anchors: ElementScrollAnchorSnapshot[];
}

export interface ElementScrollAnchorSnapshot {
    key: string;
    topOffset: number;
}

export interface AnchorConfig {
    itemSelector: string;
    datasetKey: string;
}

export function captureElementScrollState(
    node: HTMLElement | null | undefined,
    anchorConfig?: AnchorConfig | null,
): ElementScrollSnapshot | null {
    if (!node) {return null;}
    const distanceToBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
    const containerRect = typeof node.getBoundingClientRect === 'function'
        ? node.getBoundingClientRect()
        : null;
    const anchors = containerRect && anchorConfig
        ? Array.from(node.querySelectorAll<HTMLElement>(anchorConfig.itemSelector))
            .map((item) => ({
                key: item?.dataset?.[anchorConfig.datasetKey] || '',
                rect: typeof item?.getBoundingClientRect === 'function'
                    ? item.getBoundingClientRect()
                    : null,
            }))
            .filter((item) => (
                item.key
                && item.rect
                && item.rect.bottom >= containerRect.top + 1
                && item.rect.top <= containerRect.bottom - 1
            ))
            .map((item) => ({
                key: item.key,
                topOffset: item.rect ? item.rect.top - containerRect.top : 0,
            }))
        : [];
    const anchor = anchors[0] || null;
    return {
        scrollTop: Number(node.scrollTop || 0),
        scrollHeight: Number(node.scrollHeight || 0),
        nearBottom: distanceToBottom < 80,
        anchorKey: anchor?.key || '',
        anchorTopOffset: anchor?.topOffset || 0,
        anchors,
    };
}

export function restoreElementScrollState(
    node: HTMLElement | null | undefined,
    snapshot: ElementScrollSnapshot | null | undefined,
    anchorConfig?: AnchorConfig | null,
    options: {
        forceBottom?: boolean;
        defaultToBottom?: boolean;
        preserveScrollTop?: boolean;
        preserveScrollHeightDelta?: boolean;
    } = {},
) {
    if (!node) {return;}
    if (options.forceBottom) {
        node.scrollTop = node.scrollHeight;
        return;
    }
    if (!snapshot) {
        if (options.defaultToBottom !== false) {
            node.scrollTop = node.scrollHeight;
        }
        return;
    }
    if (options.preserveScrollTop) {
        const scrollHeightDelta = options.preserveScrollHeightDelta
            ? Number(node.scrollHeight || 0) - Number(snapshot.scrollHeight || 0)
            : 0;
        node.scrollTop = Math.min(Math.max(0, snapshot.scrollTop + scrollHeightDelta), node.scrollHeight);
        if (snapshot.anchorKey && anchorConfig) {
            const containerRect = typeof node.getBoundingClientRect === 'function'
                ? node.getBoundingClientRect()
                : null;
            const anchorNode = Array.from(node.querySelectorAll<HTMLElement>(anchorConfig.itemSelector))
                .find((item) => item?.dataset?.[anchorConfig.datasetKey] === snapshot.anchorKey);
            const anchorRect = typeof anchorNode?.getBoundingClientRect === 'function'
                ? anchorNode.getBoundingClientRect()
                : null;
            if (containerRect && anchorRect) {
                const nextOffset = anchorRect.top - containerRect.top;
                node.scrollTop = Math.min(
                    Math.max(0, node.scrollTop + nextOffset - Number(snapshot.anchorTopOffset || 0)),
                    node.scrollHeight,
                );
            }
        }
        return;
    }
    node.scrollTop = snapshot.nearBottom
        ? node.scrollHeight
        : Math.min(snapshot.scrollTop, node.scrollHeight);
}
