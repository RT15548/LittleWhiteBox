import {
    createBook,
    deleteBook,
    getBook,
    getBookFile,
    getSelectedBookId,
    importBookFromFiles,
    listBookFiles,
    listBooks,
    renameBook,
    setSelectedBookId,
    upsertBookFile,
} from '../shared/ebook-db.js';
import {
    buildEbookPackage,
    collectEbookImageSlotIds,
    makeEbookPackageFileName,
    parseEbookPackage,
} from '../shared/book-package.js';
import { normalizeBookFilePath } from '../shared/book-paths.js';
import {
    EBOOK_BOOK_TRANSFER_REQUEST_TIMEOUT_MS,
    EBOOK_DRAW_REQUEST_TIMEOUT_MS,
    EBOOK_TTS_REQUEST_TIMEOUT_MS,
} from './constants.js';

const DEFAULT_DRAFT_PATH = 'book/chapters/001.md';
const CHAPTER_PATH_REGEX = /^book\/chapters\/.+\.md$/;
const EBOOK_IMAGE_MARKER_REGEX = /\[ebook-image:([a-z0-9\-_]+)\]/gi;
const MARKDOWN_LINK_REGEX = /!?\[([^\]]*)\]\([^)]+\)/g;
const DRAW_COOLDOWN_TICK_MS = 500;
const DRAW_COMPLETION_NOTICE_MS = 5000;
const DRAW_COMPLETION_NOTICE_TEXT = '占位符已插入，请去阅读器查看';

function isChapterPath(path = '') {
    return CHAPTER_PATH_REGEX.test(String(path || ''));
}

function stripEbookImageMarkers(content = '') {
    return String(content || '').replace(EBOOK_IMAGE_MARKER_REGEX, '').trim();
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('file_read_failed'));
        reader.readAsText(file);
    });
}

function downloadTextFile(filename = 'ebook.json', content = '') {
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function waitForPaint() {
    return new Promise((resolve) => {
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => setTimeout(resolve, 0));
            return;
        }
        setTimeout(resolve, 0);
    });
}

function cleanReaderTtsText(content = '') {
    return String(content || '')
        .replace(EBOOK_IMAGE_MARKER_REGEX, '\n')
        .replace(/```[\s\S]*?```/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(MARKDOWN_LINK_REGEX, '$1')
        .replace(/^\s{0,3}#{1,6}\s+/gm, '')
        .replace(/^\s{0,3}>\s?/gm, '')
        .replace(/[*_`~]+/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function normalizeReaderTtsHeadingText(text = '') {
    return String(text || '')
        .replace(/[*_`~]/g, '')
        .replace(/[《》「」『』“”"'\s]/g, '')
        .trim();
}

function stripDuplicateReaderTtsHeading(content = '', chapterTitle = '') {
    const normalizedTitle = normalizeReaderTtsHeadingText(chapterTitle);
    const text = String(content || '');
    if (!normalizedTitle) return text;
    return text.replace(/^\s{0,3}(?:\r?\n\s{0,3})*#{1,6}\s+(.+?)\s*#*\s*(?:\r?\n|$)/, (full, heading) => {
        if (normalizeReaderTtsHeadingText(heading) !== normalizedTitle) return full;
        return '';
    });
}

function formatChapterTitle(path = '') {
    const match = String(path || '').match(/^book\/chapters\/(.+)\.md$/);
    if (!match) return String(path || '章节');
    const raw = match[1];
    if (/^\d+$/.test(raw)) return `第 ${Number(raw)} 章`;
    return raw || '章节';
}

function findAnchorPosition(content = '', anchor = '') {
    const text = String(content || '');
    const value = String(anchor || '').trim();
    if (!text || !value) return -1;
    let index = text.indexOf(value);
    if (index !== -1) return index + value.length;
    if (value.length > 8) {
        const short = value.slice(-10);
        index = text.indexOf(short);
        if (index !== -1) return index + short.length;
    }

    const normalize = (input) => String(input || '').replace(/[\s，。！？、""''：；…\-\n\r]/g, '');
    const normalizedText = normalize(text);
    const normalizedAnchor = normalize(value);
    if (normalizedAnchor.length < 4) return -1;
    const key = normalizedAnchor.slice(-6);
    const normalizedIndex = normalizedText.indexOf(key);
    if (normalizedIndex === -1) return -1;
    let originalIndex = 0;
    let walkIndex = 0;
    while (originalIndex < text.length && walkIndex < normalizedIndex + key.length) {
        if (normalize(text[originalIndex]) === normalizedText[walkIndex]) walkIndex += 1;
        originalIndex += 1;
    }
    return originalIndex;
}

function findNearestSentenceEnd(content = '', startPos = -1) {
    const text = String(content || '');
    if (startPos < 0 || !text) return startPos;
    if (startPos >= text.length) return text.length;

    const maxLookAhead = 80;
    const endLimit = Math.min(text.length, startPos + maxLookAhead);
    const basicEnders = new Set(['。', '！', '？', '!', '?', '…']);
    const closingMarks = new Set(['”', '“', '’', '‘', '」', '』', '】', '）', ')', '"', "'", '*', '~', '～', ']']);
    const eatClosingMarks = (position) => {
        let next = position;
        while (next < text.length && closingMarks.has(text[next])) next += 1;
        return next;
    };

    if (startPos > 0 && basicEnders.has(text[startPos - 1])) return eatClosingMarks(startPos);
    for (let offset = 0; offset < maxLookAhead && startPos + offset < endLimit; offset += 1) {
        const position = startPos + offset;
        const char = text[position];
        if (char === '\n') return position + 1;
        if (basicEnders.has(char)) return eatClosingMarks(position + 1);
        if (char === '.' && text.slice(position, position + 3) === '...') return eatClosingMarks(position + 3);
    }
    return startPos;
}

function insertEbookImageMarker(content = '', image = {}) {
    const slotId = String(image?.slotId || '').trim();
    if (!slotId) return { content, inserted: false, appended: false };
    const marker = `[ebook-image:${slotId}]`;
    const text = String(content || '');
    if (text.includes(marker)) return { content: text, inserted: false, appended: false };

    let position = findAnchorPosition(text, image.anchor || '');
    if (position >= 0) position = findNearestSentenceEnd(text, position);
    if (position >= 0) {
        const before = text.slice(0, position);
        const after = text.slice(position);
        let insertText = marker;
        if (before.length > 0 && !before.endsWith('\n')) insertText = `\n${insertText}`;
        if (after.length > 0 && !after.startsWith('\n')) insertText = `${insertText}\n`;
        return {
            content: `${before}${insertText}${after}`,
            inserted: true,
            appended: false,
        };
    }

    const needNewline = text.length > 0 && !text.endsWith('\n');
    return {
        content: `${text}${needNewline ? '\n' : ''}${marker}`,
        inserted: true,
        appended: true,
    };
}

function insertEbookImageMarkers(content = '', images = []) {
    let nextContent = String(content || '');
    let inserted = 0;
    let appended = 0;
    (Array.isArray(images) ? images : []).forEach((image) => {
        if (!image?.slotId || image.success === false) return;
        const result = insertEbookImageMarker(nextContent, image);
        nextContent = result.content;
        if (result.inserted) inserted += 1;
        if (result.appended) appended += 1;
    });
    return {
        content: nextContent,
        inserted,
        appended,
    };
}

export function formatDrawProgress(stateName = '', data = {}) {
    const current = Number(data.current) || 0;
    const total = Number(data.total) || 0;
    const countText = total ? ` ${current}/${total}` : '';
    switch (stateName) {
        case 'llm':
            return '正在分析章节画面...';
        case 'gen':
            return total ? `准备生成配图，共 ${total} 张` : '准备生成配图...';
        case 'queued':
            return data.ahead > 0 ? `画图排队中，前方 ${data.ahead} 个任务` : `画图排队中${countText}`;
        case 'progress':
            return `正在生成配图${countText}`;
        case 'cooldown': {
            const remainingMs = Number.isFinite(Number(data.remainingMs))
                ? Number(data.remainingMs)
                : Number(data.duration);
            const remainingText = remainingMs > 0 ? `，剩余 ${(remainingMs / 1000).toFixed(1)}s` : '';
            return `等待下一张配图${total ? ` ${data.nextIndex || current}/${total}` : ''}${remainingText}`;
        }
        case 'success':
            return `配图完成 ${Number(data.success) || 0}/${total || Number(data.success) || 0}`;
        default:
            return '正在配图...';
    }
}

function suggestNextChapterPath(files = []) {
    const usedNumbers = new Set((Array.isArray(files) ? files : [])
        .map((file) => String(file?.path || '').match(/^book\/chapters\/(\d+)\.md$/))
        .filter(Boolean)
        .map((match) => Number(match[1]))
        .filter((number) => Number.isFinite(number) && number > 0));
    let next = 1;
    while (usedNumbers.has(next)) next += 1;
    return `book/chapters/${String(next).padStart(3, '0')}.md`;
}

export function createBookController(deps = {}) {
    const {
        state,
        render,
        renderStudioSurface,
        renderFilesSurface,
        requestHost,
        showToast,
        conversationStore,
    } = deps;
    const renderDrawSurface = typeof renderStudioSurface === 'function'
        ? () => {
            if (!renderStudioSurface()) render();
        }
        : render;
    let drawCooldownTimer = null;
    let drawCompletionNoticeTimer = null;
    let drawAbortController = null;

    function clearDrawCooldownTimer() {
        if (drawCooldownTimer) {
            clearInterval(drawCooldownTimer);
            drawCooldownTimer = null;
        }
    }

    function clearDrawCompletionNoticeTimer() {
        if (drawCompletionNoticeTimer) {
            clearTimeout(drawCompletionNoticeTimer);
            drawCompletionNoticeTimer = null;
        }
    }

    function showTemporaryDrawNotice(message = DRAW_COMPLETION_NOTICE_TEXT) {
        clearDrawCompletionNoticeTimer();
        state.drawProgressText = message;
        drawCompletionNoticeTimer = setTimeout(() => {
            drawCompletionNoticeTimer = null;
            if (!state.isDrawingChapter && state.drawProgressText === message) {
                state.drawProgressText = '';
                renderDrawSurface();
            }
        }, DRAW_COMPLETION_NOTICE_MS);
        drawCompletionNoticeTimer?.unref?.();
        renderDrawSurface();
    }

    function startDrawCooldownCountdown(data = {}) {
        clearDrawCooldownTimer();
        const duration = Math.max(0, Number(data.duration) || 0);
        const endsAt = Date.now() + duration;
        const updateCountdown = () => {
            const remainingMs = Math.max(0, endsAt - Date.now());
            state.drawProgressText = formatDrawProgress('cooldown', {
                ...data,
                remainingMs,
            });
            renderDrawSurface();
            if (remainingMs <= 0) {
                clearDrawCooldownTimer();
            }
        };
        updateCountdown();
        if (duration > 0) {
            drawCooldownTimer = setInterval(updateCountdown, DRAW_COOLDOWN_TICK_MS);
            drawCooldownTimer?.unref?.();
        }
    }

    async function refreshBooksAndFiles() {
        state.books = await listBooks();
        if (!state.books.length) {
            state.book = null;
            state.files = [];
            state.selectedPath = '';
            state.readerPath = '';
            state.editorContent = '';
            state.savedContent = '';
            state.isDeleteBookOpen = false;
            state.viewMode = 'library';
            return;
        }
        const selectedBookId = await getSelectedBookId();
        if (state.book?.id) {
            state.book = state.books.find((book) => book.id === state.book.id) || null;
        }
        if (!state.book) {
            state.book = state.books.find((book) => book.id === selectedBookId) || state.books[0];
        }
        if (state.book?.id && state.book.id !== selectedBookId) {
            await setSelectedBookId(state.book.id);
        }
        state.files = await listBookFiles(state.book.id);
        if (!state.selectedPath || !state.files.some((file) => file.path === state.selectedPath)) {
            state.selectedPath = state.files.find((file) => file.path === DEFAULT_DRAFT_PATH)?.path
                || state.files.find((file) => file.path === 'book/outline.md')?.path
                || state.files[0]?.path
                || '';
        }
        if (!state.readerPath || !state.files.some((file) => file.path === state.readerPath)) {
            state.readerPath = state.files.find((file) => /^book\/chapters\/.+\.md$/.test(file.path))?.path
                || '';
        }
        const selected = state.files.find((file) => file.path === state.selectedPath);
        state.editorContent = selected?.content || '';
        state.savedContent = state.editorContent;
    }

    function isEditorDirty() {
        return state.editorContent !== state.savedContent;
    }

    function getActiveReaderChapter() {
        const chapters = state.files.filter((file) => CHAPTER_PATH_REGEX.test(String(file?.path || '')));
        if (!chapters.length) return null;
        return chapters.find((file) => file.path === state.readerPath) || chapters[0] || null;
    }

    function isReaderTtsActive() {
        return ['loading', 'playing'].includes(String(state.readerTtsPlayback?.status || ''));
    }

    function toggleChapterSortOrder() {
        state.chapterSortDescending = !state.chapterSortDescending;
        if (typeof renderFilesSurface === 'function' && renderFilesSurface()) return;
        render();
    }

    function resetReaderTtsPlayback(status = 'idle') {
        state.readerTtsPlayback = {
            status,
            playbackId: '',
            chapterPath: '',
            error: '',
        };
    }

    function createReaderTtsPlaybackId() {
        return `ebook-tts-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    async function refreshTtsStatus(options = {}) {
        try {
            const result = await requestHost('xb-ebook:tts-status', {});
            state.readerTtsStatus = {
                enabled: !!result?.enabled,
                ready: !!result?.ready,
            };
        } catch {
            state.readerTtsStatus = {
                enabled: false,
                ready: false,
            };
        }
        if (options.renderAfter) render();
        return state.readerTtsStatus;
    }

    async function stopReaderTts(options = {}) {
        const { renderAfter = true, silent = true } = options;
        const playbackId = state.readerTtsPlayback?.playbackId || '';
        if (!playbackId && !isReaderTtsActive()) return false;
        resetReaderTtsPlayback('idle');
        if (renderAfter) render();
        await requestHost('xb-ebook:tts-stop', { playbackId }, {
            timeoutMs: EBOOK_TTS_REQUEST_TIMEOUT_MS,
        }).catch((error) => {
            if (!silent) showToast?.(`停止朗读失败：${error?.message || error}`);
        });
        return true;
    }

    function handleTtsState(payload = {}) {
        const playbackId = String(payload.playbackId || '');
        if (playbackId && state.readerTtsPlayback?.playbackId && playbackId !== state.readerTtsPlayback.playbackId) {
            return;
        }
        const status = String(payload.state || '');
        if (status === 'loading' || status === 'playing') {
            state.readerTtsPlayback = {
                ...state.readerTtsPlayback,
                status,
                error: '',
            };
            render();
            return;
        }
        if (status === 'error') {
            const message = payload.message || payload.info?.message || '朗读失败';
            resetReaderTtsPlayback('idle');
            showToast?.(`朗读失败：${message}`);
            render();
            return;
        }
        if (['ended', 'stopped', 'blocked'].includes(status)) {
            resetReaderTtsPlayback('idle');
            if (status === 'blocked') showToast?.('朗读被浏览器阻止，请再点一次播放');
            render();
        }
    }

    async function selectBook(bookId = '') {
        if (state.isShelfLoading || state.shelfLoadError || state.isBusy) return;
        const book = await getBook(bookId);
        if (!book) return;
        if (isEditorDirty() && !confirm('当前文件还没保存，确定切换书籍吗？')) return;
        void stopReaderTts({ renderAfter: false });
        await setSelectedBookId(book.id);
        state.book = book;
        state.selectedPath = '';
        state.readerPath = '';
        state.viewMode = 'book-entry';
        await refreshBooksAndFiles();
        await conversationStore?.restoreConversation?.(book.id);
        render();
    }

    async function selectFile(path = '') {
        if (isEditorDirty() && !confirm('当前文件还没保存，确定切换文件吗？')) return;
        const file = state.files.find((item) => item.path === path);
        if (!file) return;
        void stopReaderTts({ renderAfter: false });
        const wasStudio = state.viewMode === 'studio';
        state.selectedPath = file.path;
        state.viewMode = 'studio';
        state.editorContent = file.content;
        state.savedContent = file.content;
        if (wasStudio) {
            // Already in studio — only patch the editor surfaces + file selection state. A full
            // render() here would rebuild the whole shell (including the .xb-sidebar/.xb-files
            // scroll container) and snap the sidebar to the top. If either surface can't patch
            // (e.g. the shell node is unexpectedly missing), fall back to a full render.
            const filesOk = typeof renderFilesSurface === 'function' && renderFilesSurface();
            const studioOk = typeof renderStudioSurface === 'function' && renderStudioSurface();
            if (filesOk && studioOk) return;
        }
        render();
    }

    async function showBookEntry() {
        if (!state.book) return;
        if (isEditorDirty() && !confirm('当前文件还没保存，确定回到书本入口吗？')) return;
        void stopReaderTts({ renderAfter: false });
        state.viewMode = 'book-entry';
        render();
    }

    async function showStudio() {
        if (!state.book) return;
        if (isEditorDirty() && state.viewMode !== 'studio' && !confirm('当前文件还没保存，确定进入创作台吗？')) return;
        void stopReaderTts({ renderAfter: false });
        state.viewMode = 'studio';
        render();
    }

    async function showReader() {
        if (!state.book) return;
        if (isEditorDirty() && !confirm('当前文件还没保存，确定进入阅读器吗？')) return;
        const chapter = state.files.find((file) => /^book\/chapters\/.+\.md$/.test(file.path));
        if (!state.readerPath && chapter) {
            state.readerPath = chapter.path;
        }
        state.viewMode = 'reader';
        render();
        void refreshTtsStatus({ renderAfter: true });
    }

    async function selectReaderChapter(path = '') {
        const chapter = state.files.find((file) => file.path === path && /^book\/chapters\/.+\.md$/.test(file.path));
        if (!chapter) return;
        void stopReaderTts({ renderAfter: false });
        state.readerPath = chapter.path;
        state.viewMode = 'reader';
        render();
    }

    async function showLibrary() {
        if (isEditorDirty() && !confirm('当前文件还没保存，确定回到书架吗？')) return;
        void stopReaderTts({ renderAfter: false });
        state.viewMode = 'library';
        render();
    }

    async function saveCurrentFile() {
        if (!state.book || !state.selectedPath || state.isBusy) return;
        await upsertBookFile(state.book.id, state.selectedPath, state.editorContent);
        await refreshBooksAndFiles();
        showToast('已保存');
    }

    async function refreshDrawStatus(options = {}) {
        try {
            const result = await requestHost('xb-ebook:draw-status', {});
            state.drawStatus = {
                provider: result?.provider || 'disabled',
                enabled: !!result?.enabled,
                ready: !!result?.ready,
            };
        } catch {
            state.drawStatus = {
                provider: 'disabled',
                enabled: false,
                ready: false,
            };
        }
        if (options.renderAfter) render();
        return state.drawStatus;
    }

    async function toggleReaderTts() {
        if (isReaderTtsActive()) {
            await stopReaderTts({ renderAfter: true, silent: false });
            return;
        }
        if (!state.book) return;
        const chapter = getActiveReaderChapter();
        if (!chapter) {
            showToast?.('还没有可朗读章节');
            return;
        }
        const status = await refreshTtsStatus();
        if (!status.enabled || !status.ready) {
            showToast?.('TTS 语音模块未启用');
            render();
            return;
        }
        const chapterTitle = formatChapterTitle(chapter.path);
        const text = cleanReaderTtsText(stripDuplicateReaderTtsHeading(chapter.content, chapterTitle));
        if (!text) {
            showToast?.('当前章节没有可朗读正文');
            return;
        }
        const playbackId = createReaderTtsPlaybackId();
        state.readerTtsPlayback = {
            status: 'loading',
            playbackId,
            chapterPath: chapter.path,
            error: '',
        };
        render();
        try {
            const result = await requestHost('xb-ebook:tts-play', {
                playbackId,
                text,
                bookId: state.book.id,
                bookTitle: state.book.title || '未命名书稿',
                chapterPath: chapter.path,
                chapterTitle,
            }, {
                timeoutMs: EBOOK_TTS_REQUEST_TIMEOUT_MS,
            });
            if (result?.ok === false) throw new Error(result?.error || 'tts_failed');
        } catch (error) {
            if (state.readerTtsPlayback?.playbackId === playbackId) {
                resetReaderTtsPlayback('idle');
                showToast?.(`朗读失败：${error?.message || error}`);
                render();
            }
        }
    }

    function handleDrawProgress(payload = {}) {
        if (!state.isDrawingChapter) return;
        clearDrawCompletionNoticeTimer();
        if (payload.state === 'cooldown') {
            startDrawCooldownCountdown(payload.data || {});
            return;
        }
        clearDrawCooldownTimer();
        state.drawProgressText = formatDrawProgress(payload.state, payload.data || {});
        renderDrawSurface();
    }

    function cancelCurrentChapterDraw() {
        if (!state.isDrawingChapter || !drawAbortController) return false;
        drawAbortController.abort();
        clearDrawCooldownTimer();
        clearDrawCompletionNoticeTimer();
        state.drawProgressText = '正在停止配图...';
        renderDrawSurface();
        return true;
    }

    async function drawCurrentChapter() {
        if (state.isDrawingChapter) {
            cancelCurrentChapterDraw();
            return;
        }
        if (!state.book || state.isBusy) return;
        if (!isChapterPath(state.selectedPath)) {
            showToast?.('只有正文章节可以配图');
            return;
        }
        if (!stripEbookImageMarkers(state.editorContent)) {
            showToast?.('当前章节没有正文');
            return;
        }

        const status = await refreshDrawStatus();
        if (!status.enabled || !status.ready) {
            showToast?.('画图后端未启用');
            render();
            return;
        }

        const drawBookId = state.book.id;
        const drawBookTitle = state.book.title || '未命名书稿';
        const drawChapterPath = state.selectedPath;
        const drawChapterTitle = formatChapterTitle(drawChapterPath);
        const drawSourceText = state.editorContent;
        let completionNotice = '';

        clearDrawCooldownTimer();
        clearDrawCompletionNoticeTimer();
        drawAbortController = new AbortController();
        const activeDrawController = drawAbortController;
        state.isDrawingChapter = true;
        state.drawProgressText = '正在准备章节配图...';
        renderDrawSurface();

        try {
            const result = await requestHost('xb-ebook:draw-generate', {
                source: 'ebook',
                text: drawSourceText,
                title: drawChapterTitle,
                bookId: drawBookId,
                bookTitle: drawBookTitle,
                chapterPath: drawChapterPath,
                chapterTitle: drawChapterTitle,
            }, {
                timeoutMs: EBOOK_DRAW_REQUEST_TIMEOUT_MS,
                signal: activeDrawController.signal,
            });
            if (activeDrawController.signal.aborted || result?.aborted) {
                showToast?.('配图已取消');
                return;
            }
            const stillEditingTarget = state.book?.id === drawBookId && state.selectedPath === drawChapterPath;
            const storedTarget = stillEditingTarget ? null : await getBookFile(drawBookId, drawChapterPath);
            const targetContent = stillEditingTarget
                ? state.editorContent
                : (storedTarget?.content ?? drawSourceText);
            const insertion = insertEbookImageMarkers(targetContent, result?.images || []);
            if (!insertion.inserted) {
                showToast?.(`配图完成，但没有成功图片可插入（${result?.success || 0}/${result?.total || 0}）`);
                return;
            }
            const targetBook = await getBook(drawBookId);
            if (!targetBook) {
                showToast?.('配图完成，但原书已删除，未写入');
                return;
            }
            await upsertBookFile(drawBookId, drawChapterPath, insertion.content);
            if (state.book?.id === drawBookId) {
                const activePath = state.selectedPath;
                const activeEditorContent = state.editorContent;
                const activeSavedContent = state.savedContent;
                state.files = await listBookFiles(drawBookId);
                state.selectedPath = activePath;
                if (stillEditingTarget) {
                    state.editorContent = insertion.content;
                    state.savedContent = insertion.content;
                } else {
                    state.editorContent = activeEditorContent;
                    state.savedContent = activeSavedContent;
                }
            }
            state.drawProgressText = '';
            const fallbackText = insertion.appended ? `，${insertion.appended} 张追加到章末` : '';
            completionNotice = DRAW_COMPLETION_NOTICE_TEXT;
            showToast?.(`${DRAW_COMPLETION_NOTICE_TEXT}${fallbackText}`);
        } catch (error) {
            if (activeDrawController.signal.aborted || /已取消|abort/i.test(String(error?.message || error || ''))) {
                showToast?.('配图已取消');
            } else {
                showToast?.(`配图失败：${error?.message || error}`);
            }
        } finally {
            if (drawAbortController === activeDrawController) {
                drawAbortController = null;
            }
            clearDrawCooldownTimer();
            state.isDrawingChapter = false;
            if (completionNotice) {
                showTemporaryDrawNotice(completionNotice);
            } else {
                state.drawProgressText = '';
                renderDrawSurface();
            }
        }
    }

    async function getDrawImage(slotId = '') {
        return requestHost('xb-ebook:draw-image', { slotId });
    }

    async function createNewBook() {
        if (state.isShelfLoading || state.shelfLoadError || state.isBusy) return;
        const title = prompt('新书名', '新书稿');
        if (title === null) return;
        if (isEditorDirty() && !confirm('当前文件还没保存，确定新建书籍吗？')) return;
        void stopReaderTts({ renderAfter: false });
        state.book = await createBook(title);
        state.selectedPath = DEFAULT_DRAFT_PATH;
        state.readerPath = DEFAULT_DRAFT_PATH;
        state.viewMode = 'book-entry';
        await refreshBooksAndFiles();
        await conversationStore?.restoreConversation?.(state.book.id);
        render();
    }

    async function renameCurrentBook() {
        if (!state.book || state.isBusy) return;
        const title = prompt('书名', state.book.title || '未命名书稿');
        if (title === null) return;
        try {
            state.book = await renameBook(state.book.id, title);
            await refreshBooksAndFiles();
            showToast('书名已更新');
            render();
        } catch (error) {
            showToast(`改名失败：${error?.message || error}`);
        }
    }

    function openExportDialog() {
        if (state.isShelfLoading || state.shelfLoadError || state.isBusy || state.bookTransferProgress) return;
        state.isBookTransferMenuOpen = false;
        state.isBookExportOpen = true;
        render();
    }

    function closeExportDialog() {
        if (state.bookTransferProgress) return;
        state.isBookExportOpen = false;
        render();
    }

    async function showBookTransferProgress(mode = 'export', title = '', detail = '') {
        state.bookTransferProgress = {
            mode,
            title: String(title || '').trim(),
            detail: String(detail || '').trim(),
            startedAt: Date.now(),
        };
        state.status = detail || (mode === 'import' ? '正在导入作品包...' : '正在导出作品包...');
        render();
        await waitForPaint();
    }

    function clearBookTransferProgress() {
        state.bookTransferProgress = null;
        state.status = '就绪';
    }

    async function exportBookPackage(bookId = '') {
        if (state.isShelfLoading || state.shelfLoadError || state.isBusy || state.bookTransferProgress) return;
        const id = String(bookId || '').trim();
        if (!id) return;
        const book = state.books.find((item) => item.id === id) || await getBook(id);
        if (!book) {
            showToast?.('没有找到这本书');
            return;
        }
        if (!confirm(`导出《${book.title || '未命名书稿'}》？`)) return;
        await showBookTransferProgress('export', book.title || '未命名书稿', '正在读取书稿文件...');
        try {
            const files = await listBookFiles(id);
            const slotIds = collectEbookImageSlotIds(files);
            await showBookTransferProgress(
                'export',
                book.title || '未命名书稿',
                slotIds.length ? `正在打包 ${slotIds.length} 个阅读器配图...` : '正在生成作品包...',
            );
            const imageResult = slotIds.length
                ? await requestHost('xb-ebook:export-images', { slotIds }, { timeoutMs: EBOOK_BOOK_TRANSFER_REQUEST_TIMEOUT_MS })
                : { images: { slots: [], previews: [], selections: [], skipped: [] } };
            await showBookTransferProgress('export', book.title || '未命名书稿', '正在生成下载文件...');
            const pkg = buildEbookPackage({
                book,
                files,
                images: imageResult?.images || null,
            });
            downloadTextFile(
                makeEbookPackageFileName(book.title || 'ebook'),
                JSON.stringify(pkg, null, 2),
            );
            const skipped = pkg.images?.skipped?.length || 0;
            state.isBookExportOpen = false;
            showToast?.(skipped ? `已导出，${skipped} 张图片未找到数据` : '作品包已导出');
        } catch (error) {
            showToast?.(`导出失败：${error?.message || error}`);
        } finally {
            clearBookTransferProgress();
            render();
        }
    }

    async function importBookPackageFile(file) {
        if (state.isShelfLoading || state.shelfLoadError || state.isBusy || state.bookTransferProgress || !file) return;
        await showBookTransferProgress('import', file.name || '作品包', '正在读取作品包...');
        try {
            const text = await readFileAsText(file);
            await showBookTransferProgress('import', file.name || '作品包', '正在解析作品包...');
            const pkg = parseEbookPackage(JSON.parse(text));
            await showBookTransferProgress('import', pkg.title || file.name || '作品包', '正在写入书稿文件...');
            const importedBook = await importBookFromFiles(pkg.title, pkg.files);
            let imageImportWarning = '';
            if (pkg.images?.previews?.length || pkg.images?.selections?.length) {
                try {
                    await showBookTransferProgress(
                        'import',
                        importedBook.title || pkg.title,
                        `正在导入 ${pkg.images.previews?.length || 0} 张阅读器配图...`,
                    );
                    await requestHost('xb-ebook:import-images', {
                        images: pkg.images,
                        bookId: importedBook.id,
                        bookTitle: importedBook.title,
                    }, {
                        timeoutMs: EBOOK_BOOK_TRANSFER_REQUEST_TIMEOUT_MS,
                    });
                } catch (error) {
                    imageImportWarning = error?.message || String(error || 'image_import_failed');
                }
            }
            await refreshBooksAndFiles();
            state.isBookExportOpen = false;
            showToast?.(imageImportWarning
                ? `已导入：${importedBook.title || pkg.title}，但图片导入失败：${imageImportWarning}`
                : `已导入：${importedBook.title || pkg.title}`);
        } catch (error) {
            showToast?.(`导入失败：${error?.message || error}`);
        } finally {
            clearBookTransferProgress();
            render();
        }
    }

    async function createNewFile() {
        if (!state.book || state.isBusy) return;
        if (isEditorDirty() && !confirm('当前文件还没保存，确定新建章节吗？')) return;
        const path = prompt('新章节路径（必须放在 book/chapters/ 下）', suggestNextChapterPath(state.files));
        if (path === null) return;
        try {
            const normalizedPath = normalizeBookFilePath(path);
            if (!normalizedPath || !normalizedPath.startsWith('book/chapters/')) {
                throw new Error('chapter_path_required');
            }
            if (state.files.some((file) => file.path === normalizedPath)) {
                throw new Error('chapter_already_exists');
            }
            await upsertBookFile(state.book.id, normalizedPath, '');
            await refreshBooksAndFiles();
            state.selectedPath = normalizedPath;
            state.viewMode = 'studio';
            await refreshBooksAndFiles();
            render();
        } catch (error) {
            showToast(`新建失败：${error?.message || error}`);
        }
    }

    async function importMaterial(kind = '') {
        if (!state.book || state.isBusy) return;
        if (isEditorDirty() && !confirm('当前文件还没保存，导入资料会切换到资料文件并放弃未保存修改，确定继续吗？')) return;
        state.status = '正在导入资料...';
        render();
        try {
            const result = await requestHost('xb-ebook:import-material', {
                kind,
                bookId: state.book.id,
            });
            if (!result?.ok) throw new Error(result?.error || 'import_failed');
            await upsertBookFile(state.book.id, result.path, result.content || '');
            await refreshBooksAndFiles();
            state.selectedPath = result.path;
            state.viewMode = 'studio';
            await refreshBooksAndFiles();
            showToast(`已导入：${result.label || result.path}`);
        } catch (error) {
            showToast(`导入失败：${error?.message || error}`);
        } finally {
            state.status = '就绪';
            render();
        }
    }

    async function initializeBook() {
        await refreshBooksAndFiles();
        await conversationStore?.restoreConversation?.(state.book?.id);
    }

    async function removeBook(bookId = '') {
        if (state.isBusy) return;
        const id = String(bookId || '').trim();
        if (!id) return;
        if (!confirm('确定要删除这本书吗？所有书稿内容和写作记录都将被清除，无法恢复。')) return;
        const activeBookId = state.book?.id || '';
        const deletingActiveBook = activeBookId === id;
        try {
            if (deletingActiveBook) {
                void stopReaderTts({ renderAfter: false });
            }
            await deleteBook(id);
            if (deletingActiveBook) {
                state.book = null;
                state.selectedPath = '';
                state.readerPath = '';
            }
            await refreshBooksAndFiles();
            state.isDeleteBookOpen = false;
            state.viewMode = 'library';
            const nextActiveBookId = state.book?.id || '';
            if (deletingActiveBook || !activeBookId || nextActiveBookId !== activeBookId) {
                await conversationStore?.restoreConversation?.(nextActiveBookId);
            }
            showToast('书籍已删除');
            render();
        } catch (error) {
            showToast(`删除失败：${error?.message || error}`);
        }
    }

    return {
        cancelCurrentChapterDraw,
        createNewBook,
        createNewFile,
        drawCurrentChapter,
        closeExportDialog,
        exportBookPackage,
        getDrawImage,
        handleDrawProgress,
        handleTtsState,
        importBookPackageFile,
        importMaterial,
        initializeBook,
        isEditorDirty,
        refreshBooksAndFiles,
        refreshDrawStatus,
        refreshTtsStatus,
        removeBook,
        renameCurrentBook,
        openExportDialog,
        saveCurrentFile,
        selectBook,
        selectFile,
        selectReaderChapter,
        showBookEntry,
        showLibrary,
        showReader,
        showStudio,
        stopReaderTts,
        toggleChapterSortOrder,
        toggleReaderTts,
    };
}
