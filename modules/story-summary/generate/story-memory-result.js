export function selectBestStoryMemoryResult(recallResult, canonicalText = '') {
    const recalledText = String(recallResult?.text || '');
    if (recalledText.trim()) {
        return {
            text: recalledText,
            recallLogText: String(recallResult?.recallLogText || ''),
        };
    }

    const canonical = String(canonicalText || '');
    if (!canonical.trim()) return;
    return { text: canonical, recallLogText: '' };
}
