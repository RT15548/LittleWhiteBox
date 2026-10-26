/** Filter a complete reply or a growing stream without displaying hidden reasoning. */
export function filterPlannerResponse(raw, tags = [], { partial = false } = {}) {
    let text = String(raw ?? '').replace(/<(think|thinking)\b[^>]*>[\s\S]*?(?:<\/\1>|$)/gi, '');
    if (partial) text = text.replace(/<[^>]*$/, '');
    const names = [...new Set(tags.map(tag => String(tag).toLowerCase()).filter(tag => /^[a-z][a-z0-9_-]*$/.test(tag)))];
    if (!names.length) return text.trim();
    const complete = new RegExp(`<(${names.join('|')})(?=\\s|>)[^>]*>[\\s\\S]*?<\\/\\1>`, 'gi');
    if (!partial) return (text.match(complete) || []).join('\n\n').trim() || text.trim();
    const growing = new RegExp(`<(${names.join('|')})(?=\\s|>)[^>]*>[\\s\\S]*?(?:<\\/\\1>|$)`, 'gi');
    return (text.match(growing) || []).join('\n\n').trim();
}
