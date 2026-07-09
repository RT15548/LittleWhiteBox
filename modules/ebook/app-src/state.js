import { normalizeEbookConfig } from './provider-config.js';

export const EBOOK_THEME_STORAGE_KEY = 'LittleWhiteBox_Ebook_ColorTheme';

function getInitialColorTheme() {
    try {
        const value = globalThis.localStorage?.getItem(EBOOK_THEME_STORAGE_KEY);
        return value === 'light' ? 'light' : 'dark';
    } catch {
        return 'dark';
    }
}

export function createEbookState() {
    return {
        config: normalizeEbookConfig({}),
        configDraft: null,
        books: [],
        book: null,
        files: [],
        selectedPath: '',
        readerPath: '',
        chapterSortDescending: false,
        viewMode: 'library',
        editorContent: '',
        savedContent: '',
        messages: [],
        toolTrace: [],
        liveToolTurn: null,
        openToolTurnKeys: [],
        activeTurnStartIndex: -1,
        openThoughtKeys: [],
        editingMessageIndex: -1,
        messageActionFeedback: {},
        uiMessageWindowLimit: 5,
        historySummary: '',
        archivedTurnCount: 0,
        contextStats: null,
        contextStatsRequestSerial: 0,
        compactionOverlay: null,
        protocolNotice: null,
        isShelfLoading: true,
        shelfLoadError: '',
        isBusy: false,
        isCancellingRun: false,
        activeController: null,
        agentAutoScroll: true,
        agentForceScrollBottomOnce: false,
        agentInputDraft: '',
        drawStatus: {
            provider: 'disabled',
            enabled: false,
            ready: false,
        },
        isDrawingChapter: false,
        drawProgressText: '',
        readerTtsStatus: {
            enabled: false,
            ready: false,
        },
        readerTtsPlayback: {
            status: 'idle',
            playbackId: '',
            chapterPath: '',
            error: '',
        },
        studioLayout: 'balanced',
        colorTheme: getInitialColorTheme(),
        isSettingsOpen: false,
        isDeleteBookOpen: false,
        isBookTransferMenuOpen: false,
        isBookExportOpen: false,
        bookTransferProgress: null,
        configPage: 'main',
        configFormSyncPending: true,
        modelOptionsByProvider: {},
        pullStateByProvider: {},
        configSave: {
            status: 'idle',
            requestId: '',
            error: '',
        },
        status: '正在打开书架...',
        toast: '',
    };
}
