// SillyTavern 1.14/1.18 returns /user/images/...; TauriTavern 2.3 returns
// user/images/.... Both name the same host resource, including inside a panel iframe.
// Keep this normalization while both upload response formats are supported.
export function normalizeMediaUrl(path) {
    const raw = String(path ?? '').trim();
    return raw.startsWith('user/images/') ? `/${raw}` : raw;
}
