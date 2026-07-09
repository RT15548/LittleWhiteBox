import { normalizeBookFilePath } from './book-paths.js';

export const EBOOK_PACKAGE_TYPE = 'littlewhitebox-ebook-package';
export const EBOOK_PACKAGE_VERSION = 1;

const IMAGE_MARKER_REGEX = /\[ebook-image:([a-z0-9\-_]+)\]/gi;

export function collectEbookImageSlotIds(files = []) {
    const slotIds = new Set();
    (Array.isArray(files) ? files : []).forEach((file) => {
        const content = String(file?.content || '');
        for (const match of content.matchAll(IMAGE_MARKER_REGEX)) {
            const slotId = String(match?.[1] || '').trim();
            if (slotId) slotIds.add(slotId);
        }
    });
    return [...slotIds];
}

export function buildEbookPackage({ book = {}, files = [], images = null } = {}) {
    const normalizedFiles = (Array.isArray(files) ? files : [])
        .map((file) => ({
            path: normalizeBookFilePath(file?.path),
            content: typeof file?.content === 'string' ? file.content : '',
            createdAt: Number(file?.createdAt) || 0,
            updatedAt: Number(file?.updatedAt) || 0,
        }))
        .filter((file) => file.path)
        .sort((left, right) => left.path.localeCompare(right.path, 'zh-CN'));
    return {
        type: EBOOK_PACKAGE_TYPE,
        version: EBOOK_PACKAGE_VERSION,
        exportedAt: Date.now(),
        book: {
            title: String(book?.title || '未命名书稿'),
            createdAt: Number(book?.createdAt) || 0,
            updatedAt: Number(book?.updatedAt) || 0,
        },
        files: normalizedFiles,
        images: images && typeof images === 'object'
            ? {
                slots: Array.isArray(images.slots) ? images.slots : [],
                previews: Array.isArray(images.previews) ? images.previews : [],
                selections: Array.isArray(images.selections) ? images.selections : [],
                skipped: Array.isArray(images.skipped) ? images.skipped : [],
            }
            : {
                slots: collectEbookImageSlotIds(normalizedFiles),
                previews: [],
                selections: [],
                skipped: [],
            },
    };
}

export function parseEbookPackage(rawPackage) {
    const data = rawPackage && typeof rawPackage === 'object' ? rawPackage : {};
    if (data.type !== EBOOK_PACKAGE_TYPE) throw new Error('不是小白电纸书作品包');
    if (Number(data.version) !== EBOOK_PACKAGE_VERSION) throw new Error('作品包版本不支持');
    const files = (Array.isArray(data.files) ? data.files : [])
        .map((file) => ({
            path: normalizeBookFilePath(file?.path),
            content: typeof file?.content === 'string' ? file.content : '',
            createdAt: Number(file?.createdAt) || 0,
            updatedAt: Number(file?.updatedAt) || 0,
        }))
        .filter((file) => file.path);
    if (!files.length) throw new Error('作品包没有书稿文件');
    const images = data.images && typeof data.images === 'object'
        ? {
            slots: Array.isArray(data.images.slots) ? data.images.slots : [],
            previews: Array.isArray(data.images.previews) ? data.images.previews : [],
            selections: Array.isArray(data.images.selections) ? data.images.selections : [],
        }
        : { slots: [], previews: [], selections: [] };
    return {
        title: String(data.book?.title || '导入书稿').trim() || '导入书稿',
        book: data.book && typeof data.book === 'object' ? data.book : {},
        files,
        images,
    };
}

export function makeEbookPackageFileName(title = '') {
    const safeTitle = String(title || 'ebook')
        .trim()
        .replace(/[\\/:*?"<>|]+/g, '_')
        .replace(/\s+/g, '_')
        .slice(0, 80) || 'ebook';
    const date = new Date();
    const stamp = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('');
    return `${safeTitle}-${stamp}.xbebook.json`;
}
