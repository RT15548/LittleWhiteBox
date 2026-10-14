const PATHS = {
    clear: ['M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5'],
    settings: ['m9 3-.6 2.2-1.5.9-2.2-.6-2 3.5 1.6 1.6v1.8L2.7 14l2 3.5 2.2-.6 1.5.9L9 20h4l.6-2.2 1.5-.9 2.2.6 2-3.5-1.6-1.6v-1.8L19.3 9l-2-3.5-2.2.6-1.5-.9L13 3Z', 'M14 11.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
    collapse: ['m14 6-6 6 6 6'],
    close: ['m6 6 12 12M18 6 6 18'],
    workspace: ['M3 4h18v16H3Z', 'M15 4v16'],
    folder: ['M3 7V4h6l2 3h10v13H3Z'],
    memory: ['M5 3h15v18H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z', 'M7 3v18M11 8h5M11 12h5'],
    file: ['M5 3h9l5 5v13H5Z', 'M14 3v5h5'],
    original: ['M9 3h9v14H9Z', 'M6 7H3v14h9v-1'],
    diff: ['M4 6h7M7.5 2.5v7M14 17h7'],
    filter: ['M4 5h16l-6 7v7l-4 2v-9Z'],
    newFile: ['M5 3h9l5 5v5M5 3v18h6M14 3v5h5', 'M17 15v6M14 18h6'],
    newDirectory: ['M3 7V4h6l2 3h10v6M3 7v13h8', 'M17 15v6M14 18h6'],
    rename: ['m14 5 5 5M4 20l5-1L21 7l-5-5L4 14Z'],
    download: ['M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5'],
    restore: ['M3 3v5h5', 'M3 8a9 9 0 1 1 0 8'],
    save: ['M4 3h12l4 4v14H4Z', 'M8 3v6h7V3M8 21v-7h8v7'],
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
