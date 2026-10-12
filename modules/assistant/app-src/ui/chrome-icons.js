const PATHS = {
    clear: ['M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5'],
    settings: ['m9 3-.6 2.2-1.5.9-2.2-.6-2 3.5 1.6 1.6v1.8L2.7 14l2 3.5 2.2-.6 1.5.9L9 20h4l.6-2.2 1.5-.9 2.2.6 2-3.5-1.6-1.6v-1.8L19.3 9l-2-3.5-2.2.6-1.5-.9L13 3Z', 'M14 11.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
    collapse: ['m14 6-6 6 6 6'],
    close: ['m6 6 12 12M18 6 6 18'],
};

export function chromeIcon(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${PATHS[name].map(d => `<path d="${d}"/>`).join('')}</svg>`;
}

export function updateChromeIcon(button, name) {
    if (button.dataset.icon === name) return;
    const document = button.ownerDocument;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    for (const d of PATHS[name]) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        svg.append(path);
    }
    button.replaceChildren(svg);
    button.dataset.icon = name;
}
