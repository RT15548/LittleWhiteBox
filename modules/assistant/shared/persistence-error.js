export function describePersistenceError(error) {
    const message = String(error?.message || error || 'unknown_error').trim();
    const lowered = message.toLowerCase();
    if (error?.name === 'QuotaExceededError' || lowered.includes('quota')
        || lowered.includes('insufficient space') || lowered.includes('disk full')) {
        return '浏览器存储空间不足';
    }
    return message || 'unknown_error';
}
