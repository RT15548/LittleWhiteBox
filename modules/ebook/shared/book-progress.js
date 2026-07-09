export function isDraftedChapterFile(file = {}) {
    if (!/^book\/chapters\/.+\.md$/.test(String(file.path || ''))) return false;
    const content = String(file.content || '').trim();
    if (!content) return false;
    return content !== '从这里开始写正文。';
}

export function countDraftedChapterFiles(files = []) {
    return (Array.isArray(files) ? files : []).filter((file) => isDraftedChapterFile(file)).length;
}
