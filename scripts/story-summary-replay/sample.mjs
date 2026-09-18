// Preserve native message identity, floor numbering, whitespace and host flags.
// Foreign role/content exports are adapted once at this import boundary.
function normalizeMessage(raw, index, names) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new Error(`Invalid chat message at floor ${index}`);
    }
    if (typeof raw.mes === 'string' && typeof raw.is_user === 'boolean') return raw;
    const text = raw.mes ?? raw.message ?? raw.content ?? raw.text;
    if (typeof text !== 'string') throw new Error(`Missing message text at floor ${index}`);
    const isUser = raw.is_user ?? raw.isUser ?? (String(raw.role || '').toLowerCase() === 'user');
    return { ...raw, mes: text, is_user: !!isUser, name: raw.name || (isUser ? names.name1 : names.name2) };
}

function parsePayload(raw) {
    try { return JSON.parse(raw); } catch { /* Native JSONL export. */ }
    const records = String(raw).split(/\r?\n/).flatMap((line, index) => {
        if (!line.trim()) return [];
        try { return [JSON.parse(line)]; } catch (error) {
            throw new Error(`JSONL parse failed at line ${index + 1}: ${error.message}`);
        }
    });
    const header = records[0];
    const hasHeader = header && typeof header === 'object' && !Array.isArray(header)
        && !('mes' in header) && !('message' in header)
        && ('chat_metadata' in header || 'user_name' in header || 'character_name' in header);
    return hasHeader ? { ...header, chat: records.slice(1) } : { chat: records };
}

export function parseReplaySample(raw, config = {}) {
    const payload = parsePayload(raw);
    const names = {
        name1: String(config.name1 || payload?.name1 || payload?.user_name || payload?.userName
            || payload?.metadata?.name1 || '用户'),
        name2: String(config.name2 || payload?.name2 || payload?.character_name || payload?.characterName
            || payload?.metadata?.name2 || '角色'),
    };
    const records = Array.isArray(payload) ? payload
        : payload?.chat ?? payload?.messages ?? payload?.data?.chat ?? payload?.data?.messages;
    if (!Array.isArray(records)) throw new Error('Sample has no chat message array');
    const allMessages = records.map((message, index) => normalizeMessage(message, index, names));
    const maxFloors = config.maxFloors == null ? allMessages.length : Number(config.maxFloors);
    if (!Number.isInteger(maxFloors) || maxFloors < 1) throw new Error('maxFloors must be a positive integer');
    return { payload, names, messages: allMessages.slice(0, maxFloors), totalSampleMessages: allMessages.length };
}
