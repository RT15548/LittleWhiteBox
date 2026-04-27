export const PUBLIC_TEXT_FILE_EXTENSIONS = new Set([
    '.js',
    '.jsx',
    '.mjs',
    '.cjs',
    '.ts',
    '.tsx',
    '.html',
    '.css',
    '.scss',
    '.sass',
    '.less',
    '.json',
    '.json5',
    '.yaml',
    '.yml',
    '.md',
    '.txt',
    '.py',
    '.toml',
    '.ini',
    '.cfg',
    '.sh',
]);

export function getPathExtension(pathText = '') {
    const normalized = String(pathText || '');
    const lastDot = normalized.lastIndexOf('.');
    const lastSlash = Math.max(normalized.lastIndexOf('/'), normalized.lastIndexOf('\\'));
    if (lastDot === -1 || lastDot < lastSlash) return '';
    return normalized.slice(lastDot).toLowerCase();
}

export function isSupportedPublicTextPath(pathText = '') {
    return PUBLIC_TEXT_FILE_EXTENSIONS.has(getPathExtension(pathText));
}
