import { getContext } from '../../../../../../extensions.js';
import { getRequestHeaders } from '../../../../../../../script.js';

function normalizeInlineText(value = '', limit = 4000) {
    const text = String(value || '').trim();
    return text.length > limit ? `${text.slice(0, limit)}\n\n[内容过长，已截断]` : text;
}

function safeJson(value) {
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value || '');
    }
}

function getCurrentCharacter() {
    const ctx = getContext?.() || {};
    const id = ctx.characterId ?? ctx.this_chid;
    if (ctx.getCharacter && id !== undefined && id !== null) {
        try {
            const character = ctx.getCharacter(id);
            if (character) return character;
        } catch (caughtError) { console.warn({ source: import.meta.url, operation: "getCurrentCharacter" }, caughtError); }
    }
    if (Array.isArray(ctx.characters) && id !== undefined && id !== null) {
        return ctx.characters[id] || null;
    }
    return null;
}

function formatChatSource() {
    const ctx = getContext?.() || {};
    const chat = Array.isArray(ctx.chat) ? ctx.chat : [];
    if (!chat.length) return '# 当前聊天\n\n暂无可导入聊天。';
    const lines = ['# 当前聊天', ''];
    chat.forEach((message, index) => {
        const role = message?.is_user ? '{{user}}' : (message?.name || '{{char}}');
        const text = String(message?.mes || message?.message || '').trim();
        if (!text) return;
        lines.push(`## ${index}. ${role}`);
        lines.push(text);
        lines.push('');
    });
    return lines.join('\n').trim();
}

function formatCharacterSource() {
    const character = getCurrentCharacter();
    if (!character) return '# 角色信息\n\n当前没有选中角色。';
    const data = character.data || character;
    const fields = {
        name: character.name || data.name || '',
        description: data.description || character.description || '',
        personality: data.personality || character.personality || '',
        scenario: data.scenario || character.scenario || '',
        first_mes: data.first_mes || character.first_mes || '',
        mes_example: data.mes_example || character.mes_example || '',
        creator_notes: data.creator_notes || character.creator_notes || '',
        tags: data.tags || character.tags || [],
    };
    return [
        '# 角色信息',
        '',
        `角色名：${fields.name || '未知'}`,
        '',
        '```json',
        safeJson(fields),
        '```',
    ].join('\n');
}

async function formatSummarySource() {
    try {
        const module = await import('../../story-summary/story-summary.js');
        const text = module.getStorySummaryMemoryText?.() || module.getStorySummaryForEna?.() || '';
        return [
            '# 剧情总结',
            '',
            normalizeInlineText(text || '当前剧情总结为空。', 80000),
        ].join('\n');
    } catch (error) {
        return `# 剧情总结\n\n读取剧情总结失败：${error?.message || error}`;
    }
}

function getCharacterWorldbookNames() {
    const ctx = getContext?.() || {};
    const character = getCurrentCharacter();
    const names = [];
    [
        character?.data?.extensions?.world,
        character?.world,
        character?.data?.character_book?.name,
    ].forEach((name) => {
        if (name && !names.includes(name)) names.push(name);
    });
    if (Array.isArray(ctx.worldNames)) {
        ctx.worldNames.forEach((name) => {
            if (name && !names.includes(name)) names.push(name);
        });
    }
    if (typeof window.selected_world_info === 'string' && window.selected_world_info) {
        if (!names.includes(window.selected_world_info)) names.push(window.selected_world_info);
    }
    return names.filter(Boolean);
}

async function fetchWorldbook(name = '') {
    const response = await fetch('/api/worldinfo/get', {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error(`worldbook_http_${response.status}`);
    const data = await response.json();
    let entries = data?.entries;
    if (entries && !Array.isArray(entries)) entries = Object.values(entries);
    return {
        name,
        entries: Array.isArray(entries) ? entries : [],
    };
}

async function formatWorldbookSource() {
    const names = getCharacterWorldbookNames();
    if (!names.length) return '# 世界书\n\n当前没有发现可导入的角色/聊天关联世界书。';
    const books = await Promise.all(names.map(async (name) => {
        try {
            return await fetchWorldbook(name);
        } catch (error) {
            return { name, error: error?.message || String(error || 'worldbook_failed'), entries: [] };
        }
    }));
    const lines = ['# 世界书', ''];
    books.forEach((book) => {
        lines.push(`## ${book.name}`);
        if (book.error) {
            lines.push(`读取失败：${book.error}`, '');
            return;
        }
        const entries = book.entries.filter((entry) => entry && !entry.disable && !entry.disabled);
        if (!entries.length) {
            lines.push('无启用条目。', '');
            return;
        }
        entries.forEach((entry, index) => {
            const title = entry.comment || entry.name || entry.title || `Entry ${index + 1}`;
            const keys = Array.isArray(entry.key) ? entry.key.filter(Boolean).join(', ') : '';
            lines.push(`### ${title}`);
            if (keys) lines.push(`触发词：${keys}`);
            lines.push(String(entry.content || '').trim() || '[空内容]');
            lines.push('');
        });
    });
    return normalizeInlineText(lines.join('\n').trim(), 120000);
}

export async function buildImportMaterial(kind = '') {
    switch (kind) {
        case 'chat':
            return { path: 'book/sources/chat.md', label: '当前聊天', content: formatChatSource() };
        case 'character':
            return { path: 'book/sources/character.md', label: '角色信息', content: formatCharacterSource() };
        case 'summary':
            return { path: 'book/sources/story-summary.md', label: '剧情总结', content: await formatSummarySource() };
        case 'worldbook':
            return { path: 'book/sources/worldbook.md', label: '世界书', content: await formatWorldbookSource() };
        default:
            throw new Error('unknown_import_kind');
    }
}
