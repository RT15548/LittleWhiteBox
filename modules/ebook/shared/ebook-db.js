import Dexie from '../../../libs/dexie.mjs';
import { normalizeBookDirectoryPath, normalizeBookFilePath } from './book-paths.js';
import { countDraftedChapterFiles } from './book-progress.js';
import { DEFAULT_BOOK_FILES } from './book-templates.js';

const db = new Dexie('LittleWhiteBox_Ebook');

db.version(1).stores({
    books: 'id, updatedAt, title',
    files: '[bookId+path], bookId, path, updatedAt',
    meta: 'key',
    plans: '[sessionId+id], sessionId, status, owner, priority, updatedAt, completedAt',
});

db.version(2).stores({
    books: 'id, updatedAt, title',
    files: '[bookId+path], bookId, path, updatedAt',
    meta: 'key',
    plans: '[sessionId+id], sessionId, status, owner, priority, updatedAt, completedAt',
    sessions: 'bookId, updatedAt',
    messages: '[bookId+order], bookId, order',
});

export const booksTable = db.books;
export const filesTable = db.files;
export const metaTable = db.meta;
export const ebookPlansTable = db.plans;
export const ebookSessionsTable = db.sessions;
export const ebookMessagesTable = db.messages;

function createId(prefix = 'book') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now() {
    return Date.now();
}

function normalizeTitle(value = '', fallback = '未命名书稿') {
    const normalized = String(value || '').trim();
    return normalized.slice(0, 120) || fallback;
}

function cloneBook(book = {}) {
    return {
        id: String(book.id || ''),
        title: String(book.title || ''),
        createdAt: Number(book.createdAt) || 0,
        updatedAt: Number(book.updatedAt) || 0,
        chapterCount: Math.max(0, Number(book.chapterCount) || 0),
    };
}

function cloneFile(file = {}) {
    return {
        bookId: String(file.bookId || ''),
        path: String(file.path || ''),
        content: typeof file.content === 'string' ? file.content : '',
        createdAt: Number(file.createdAt) || 0,
        updatedAt: Number(file.updatedAt) || 0,
    };
}

export async function listBooks() {
    const books = await booksTable.orderBy('updatedAt').reverse().toArray();
    const normalizedBooks = books.map(cloneBook).filter((book) => book.id);
    const chapterCounts = await Promise.all(normalizedBooks.map(async (book) => {
        const files = await filesTable.where('bookId').equals(book.id).toArray();
        return countDraftedChapterFiles(files);
    }));
    return normalizedBooks.map((book, index) => ({
        ...book,
        chapterCount: chapterCounts[index] || 0,
    }));
}

export async function getSelectedBookId() {
    const entry = await metaTable.get('selectedBookId');
    return String(entry?.value || '').trim();
}

export async function setSelectedBookId(bookId = '') {
    const value = String(bookId || '').trim();
    await metaTable.put({ key: 'selectedBookId', value, updatedAt: now() });
    return value;
}

export async function createBook(title = '') {
    const timestamp = now();
    const book = {
        id: createId('book'),
        title: normalizeTitle(title, '新书稿'),
        createdAt: timestamp,
        updatedAt: timestamp,
    };
    await booksTable.put(book);
    await Promise.all(DEFAULT_BOOK_FILES.map((file) => upsertBookFile(book.id, file.path, file.content, {
        createdAt: timestamp,
        updatedAt: timestamp,
        touchBook: false,
    })));
    await setSelectedBookId(book.id);
    return cloneBook(book);
}

export async function importBookFromFiles(title = '', nextFiles = []) {
    const timestamp = now();
    const book = {
        id: createId('book'),
        title: normalizeTitle(title, '导入书稿'),
        createdAt: timestamp,
        updatedAt: timestamp,
    };
    const files = (Array.isArray(nextFiles) ? nextFiles : [])
        .map((file) => ({
            path: normalizeBookFilePath(file?.path),
            content: typeof file?.content === 'string' ? file.content : '',
            createdAt: Number(file?.createdAt) || timestamp,
            updatedAt: Number(file?.updatedAt) || timestamp,
        }))
        .filter((file) => file.path);
    if (!files.length) throw new Error('ebook_package_has_no_files');

    await db.transaction('rw', booksTable, filesTable, async () => {
        await booksTable.put(book);
        await Promise.all(files.map((file) => filesTable.put({
            bookId: book.id,
            path: file.path,
            content: file.content,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
        })));
    });
    return cloneBook(book);
}

export async function getBook(bookId = '') {
    const book = await booksTable.get(String(bookId || '').trim());
    return book ? cloneBook(book) : null;
}

export async function renameBook(bookId = '', title = '') {
    const id = String(bookId || '').trim();
    if (!id) throw new Error('book_required');
    const nextTitle = normalizeTitle(title, '未命名书稿');
    const updatedAt = now();
    const changed = await booksTable.update(id, {
        title: nextTitle,
        updatedAt,
    });
    if (!changed) throw new Error('book_not_found');
    return cloneBook(await booksTable.get(id));
}

export async function touchBook(bookId = '') {
    const id = String(bookId || '').trim();
    if (!id) return;
    await booksTable.update(id, { updatedAt: now() });
}

export async function listBookFiles(bookId = '') {
    const id = String(bookId || '').trim();
    if (!id) return [];
    const files = await filesTable.where('bookId').equals(id).toArray();
    return files
        .map(cloneFile)
        .filter((file) => file.path)
        .sort((left, right) => left.path.localeCompare(right.path, 'zh-CN'));
}

export async function getBookFile(bookId = '', path = '') {
    const id = String(bookId || '').trim();
    const normalizedPath = normalizeBookFilePath(path);
    if (!id || !normalizedPath) return null;
    const file = await filesTable.get([id, normalizedPath]);
    return file ? cloneFile(file) : null;
}

export async function upsertBookFile(bookId = '', path = '', content = '', options = {}) {
    const id = String(bookId || '').trim();
    const normalizedPath = normalizeBookFilePath(path);
    if (!id || !normalizedPath) throw new Error('book_path_required');
    const previous = await filesTable.get([id, normalizedPath]);
    const timestamp = Number(options.updatedAt) || now();
    const file = {
        bookId: id,
        path: normalizedPath,
        content: typeof content === 'string' ? content : String(content ?? ''),
        createdAt: Number(previous?.createdAt || options.createdAt) || timestamp,
        updatedAt: timestamp,
    };
    await filesTable.put(file);
    if (options.touchBook !== false) {
        await touchBook(id);
    }
    return cloneFile(file);
}

export async function deleteBookPath(bookId = '', path = '') {
    const id = String(bookId || '').trim();
    if (!id) throw new Error('bookId_required');
    const rawPath = String(path || '').trim();
    const isDirectory = rawPath.endsWith('/');
    const normalizedPath = isDirectory
        ? normalizeBookDirectoryPath(rawPath)
        : normalizeBookFilePath(rawPath);
    if (!normalizedPath) throw new Error('invalid_path');
    if (normalizedPath === 'book/') throw new Error('book_root_delete_forbidden');

    let deletedCount = 0;
    await db.transaction('rw', filesTable, booksTable, async () => {
        if (isDirectory) {
            const keys = await filesTable
                .where('bookId')
                .equals(id)
                .filter((file) => String(file?.path || '').startsWith(normalizedPath))
                .primaryKeys();
            if (!keys.length) throw new Error('book_path_not_found');
            await filesTable.bulkDelete(keys);
            deletedCount = keys.length;
        } else {
            const existing = await filesTable.get([id, normalizedPath]);
            if (!existing) throw new Error('book_path_not_found');
            await filesTable.delete([id, normalizedPath]);
            deletedCount = 1;
        }
        await booksTable.update(id, { updatedAt: now() });
    });

    return {
        path: normalizedPath,
        deletedCount,
        directory: isDirectory,
    };
}

export async function deleteBook(bookId = '') {
    const id = String(bookId || '').trim();
    if (!id) throw new Error('bookId_required');
    await db.transaction(
        'rw',
        booksTable,
        filesTable,
        metaTable,
        ebookPlansTable,
        ebookSessionsTable,
        ebookMessagesTable,
        async () => {
            await filesTable.where('bookId').equals(id).delete();
            await ebookPlansTable.where('sessionId').equals(id).delete();
            await ebookSessionsTable.where('bookId').equals(id).delete();
            await ebookMessagesTable.where('bookId').equals(id).delete();
            await booksTable.delete(id);
            const selectedId = String((await metaTable.get('selectedBookId'))?.value || '').trim();
            if (selectedId === id) {
                await metaTable.delete('selectedBookId');
            }
        },
    );
}

export async function replaceBookFiles(bookId = '', nextFiles = []) {
    const id = String(bookId || '').trim();
    if (!id) throw new Error('book_required');
    const timestamp = now();
    await db.transaction('rw', filesTable, booksTable, async () => {
        await filesTable.where('bookId').equals(id).delete();
        await Promise.all((Array.isArray(nextFiles) ? nextFiles : []).map(async (file) => {
            const normalizedPath = normalizeBookFilePath(file?.path);
            if (!normalizedPath) return;
            await filesTable.put({
                bookId: id,
                path: normalizedPath,
                content: typeof file.content === 'string' ? file.content : '',
                createdAt: Number(file.createdAt) || timestamp,
                updatedAt: timestamp,
            });
        }));
        await booksTable.update(id, { updatedAt: timestamp });
    });
}

export default db;
