// Model IDs are opaque. Only a Google resource name has a removable models/ prefix.
export function extractModelListIds(payload) {
    if (Array.isArray(payload?.data)) {
        return payload.data.map(item => String(item?.id || item?.name || '').trim()).filter(Boolean);
    }
    if (Array.isArray(payload?.models)) {
        return payload.models.map(item => item?.id
            ? String(item.id).trim()
            : String(item?.name || '').trim().replace(/^models\//, '')).filter(Boolean);
    }
    return [];
}
