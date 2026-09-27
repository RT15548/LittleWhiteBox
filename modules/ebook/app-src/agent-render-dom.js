// Keyed updates for ebook's conversation and process rounds. Narration and tool
// statuses are separate units so tool progress cannot replace text being read.
function buildElement(container, html) {
    const template = container.ownerDocument.createElement('template');
    // Dynamic values are escaped by the ebook renderer.
    // eslint-disable-next-line no-unsanitized/property
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}

function childHost(node) {
    return node.matches('[data-agent-unit-children]')
        ? node
        : node.querySelector('[data-agent-unit-children]');
}

export function adoptAgentRenderUnits(container, units) {
    return units.map((unit, index) => {
        const node = container.children[index];
        return {
            key: unit.key,
            signature: unit.shellSignature ?? unit.signature,
            node,
            children: unit.children?.length
                ? adoptAgentRenderUnits(childHost(node), unit.children)
                : [],
        };
    });
}

export function applyAgentRenderUnits(container, previousUnits = [], units = [], enhanceNode = () => {}) {
    const previousByKey = new Map(previousUnits.map((unit) => [unit.key, unit]));
    const nextKeys = new Set(units.map((unit) => unit.key));
    previousUnits.forEach((unit) => {
        if (!nextKeys.has(unit.key)) unit.node.remove();
    });
    const nextUnits = units.map((unit, index) => {
        const previous = previousByKey.get(unit.key);
        const signature = unit.shellSignature ?? unit.signature;
        const reused = previous?.signature === signature;
        const node = reused ? previous.node : buildElement(container, unit.scaffoldHtml ?? unit.html);
        const children = unit.children?.length
            ? applyAgentRenderUnits(childHost(node), previous?.children, unit.children, enhanceNode)
            : [];
        const current = container.children[index] || null;
        if (current !== node) container.insertBefore(node, current);
        // Remove a replaced sibling immediately. Leaving it until the end would
        // move every following node, clearing browser text selections in them.
        if (!reused) previous?.node.remove();
        node.dataset.agentUnitKey = unit.key;
        if (!reused && !unit.children) enhanceNode(node);
        return { key: unit.key, signature, node, children };
    });
    const retained = new Set(nextUnits.map((unit) => unit.node));
    Array.from(container.childNodes).forEach((node) => {
        if (!retained.has(node)) node.remove();
    });
    return nextUnits;
}
