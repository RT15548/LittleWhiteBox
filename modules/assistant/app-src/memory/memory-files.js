export function normalizeMemoryFileRecord(file = {}) {
    const filename = String(file.filename || file.name || '').trim();
    if (!filename) return null;

    const rawPath = String(file.path || `memory/skills/${filename}`).trim().replace(/\\/g, '/');
    const normalizedPath = rawPath.startsWith('memory/')
        ? rawPath
        : rawPath.startsWith('skills/')
            ? `memory/${rawPath}`
            : rawPath.startsWith('notes/')
                ? `memory/${rawPath}`
                : rawPath;
    const relativePath = String(
        file.relativePath
        || (normalizedPath.startsWith('memory/')
            ? normalizedPath.slice('memory/'.length)
            : filename),
    ).trim().replace(/\\/g, '/');
    const content = typeof file.content === 'string' ? file.content : '';
    const originalContent = Object.prototype.hasOwnProperty.call(file, 'originalContent')
        ? (typeof file.originalContent === 'string' ? file.originalContent : file.originalContent === null ? null : content)
        : content;

    return {
        path: normalizedPath,
        relativePath,
        name: String(file.name || relativePath.split('/').pop() || filename).trim(),
        filename,
        id: String(file.id || '').trim(),
        title: String(file.title || '').trim(),
        summary: String(file.summary || '').trim(),
        triggers: Array.isArray(file.triggers) ? file.triggers : [],
        slashTriggers: Array.isArray(file.slashTriggers) ? file.slashTriggers : [],
        enabled: file.enabled !== false,
        updatedAt: String(file.updatedAt || '').trim(),
        content,
        originalContent,
        source: String(file.source || 'assistant-skill-file').trim() || 'assistant-skill-file',
        memorySection: String(file.memorySection || (normalizedPath.includes('/notes/') ? 'notes' : 'skills')).trim() || 'skills',
        noteKind: String(file.noteKind || '').trim(),
    };
}

export function normalizeMemoryFiles(files = []) {
    return Array.isArray(files)
        ? files.map(normalizeMemoryFileRecord).filter(Boolean)
        : [];
}

export function findMemoryFileByPath(files = [], targetPath = '') {
    const normalizedPath = String(targetPath || '').trim().replace(/\\/g, '/');
    if (!normalizedPath) return null;
    return normalizeMemoryFiles(files).find((file) => file.path === normalizedPath) || null;
}

export function describeMemoryFile(file = null, fallbackPath = '') {
    const normalized = file ? normalizeMemoryFileRecord(file) : null;
    const normalizedPath = String(fallbackPath || normalized?.path || '').trim().replace(/\\/g, '/');
    const filename = String(
        normalized?.filename
        || normalized?.name
        || normalizedPath.split('/').pop()
        || '未命名记忆文件',
    ).trim();
    const noteKind = String(normalized?.noteKind || '').trim();
    const memorySection = String(
        normalized?.memorySection
        || (normalizedPath.includes('/notes/') ? 'notes' : normalizedPath.includes('/skills/') ? 'skills' : ''),
    ).trim();

    if (noteKind === 'identity') {
        return { kindLabel: '身份文件', displayName: filename };
    }
    if (noteKind === 'worklog') {
        return { kindLabel: '工作日志文件', displayName: filename };
    }
    if (memorySection === 'skills') {
        return { kindLabel: '技能文件', displayName: filename };
    }
    if (memorySection === 'notes') {
        return { kindLabel: '笔记文件', displayName: filename };
    }
    return { kindLabel: '记忆文件', displayName: filename };
}
