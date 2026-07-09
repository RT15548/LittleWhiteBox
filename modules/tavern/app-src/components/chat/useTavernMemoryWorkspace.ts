import { nextTick, type ComputedRef, type Ref } from 'vue';
import { getTavernMemoryFile, writeTavernMemoryFile } from '../../../shared/memory-files';
import {
    getLatestTavernUserMessageAtOrBefore,
    type TavernMemoryFileListEntry,
    type TavernMemoryFileRecord,
    type TavernMemoryIndexFileEntry,
} from '../../../shared/session-db';

export interface TavernMemoryWorkspaceOptions {
    memoryEditorBaseContent: Ref<string>;
    memoryEditorDocumentAvailable: ComputedRef<boolean>;
    memoryEditorDraft: Ref<string>;
    memoryEditorDirty: ComputedRef<boolean>;
    memoryEditorLoadedPath: Ref<string>;
    memoryEditorMode: Ref<'preview' | 'edit'>;
    memoryEditorReadOnly: ComputedRef<boolean>;
    memoryEditorStatus: Ref<string>;
    selectedMemoryFileEntry: ComputedRef<TavernMemoryIndexFileEntry | null>;
    selectedMemoryFilePath: Ref<string>;
    selectedMemoryFileRecord: Ref<TavernMemoryFileRecord | null>;
    selectedSessionId: Ref<string>;
    commitUserAcceptedState: (sessionId?: string, userOrder?: number) => Promise<void>;
    confirmDialog: (options: { title?: string; message?: string; confirmText?: string; cancelText?: string; tone?: 'default' | 'danger' | 'warning' } | string) => Promise<boolean>;
    refreshRecords: (sessionId?: string) => Promise<void>;
}

export function useTavernMemoryWorkspace(options: TavernMemoryWorkspaceOptions) {
    let memoryFileLoadToken = 0;

    function memoryFileStatusLabel(status = '') {
        return status === 'stale' ? '过期' : '可用';
    }

    function memoryFileContentLength(file: TavernMemoryFileListEntry | TavernMemoryFileRecord | null | undefined): number {
        if (!file) {return 0;}
        if ('contentLength' in file && Number.isFinite(Number(file.contentLength))) {
            return Math.max(0, Number(file.contentLength) || 0);
        }
        return 'content' in file ? Math.max(0, String(file.content || '').length) : 0;
    }

    function formatMemoryFileMeta(file: TavernMemoryFileListEntry | TavernMemoryFileRecord) {
        return `${memoryFileStatusLabel(file.status)} · ${memoryFileContentLength(file)} 字`;
    }

    function loadMemoryFileIntoEditor(file: TavernMemoryFileRecord | null | undefined) {
        const content = String(file?.content || '');
        options.memoryEditorLoadedPath.value = String(file?.path || '');
        options.memoryEditorBaseContent.value = content;
        options.memoryEditorDraft.value = content;
        options.memoryEditorMode.value = 'preview';
        options.memoryEditorStatus.value = '';
    }

    function invalidateMemoryFileRecordLoad(clearRecord = true) {
        memoryFileLoadToken += 1;
        if (clearRecord) {
            options.selectedMemoryFileRecord.value = null;
        }
    }

    async function loadSelectedMemoryFileRecord(path = '') {
        const sessionId = String(options.selectedSessionId.value || '').trim();
        const nextPath = String(path || '').trim();
        const loadToken = ++memoryFileLoadToken;
        if (!sessionId || !nextPath) {
            invalidateMemoryFileRecordLoad();
            return null;
        }
        const file = await getTavernMemoryFile(sessionId, nextPath);
        if (loadToken !== memoryFileLoadToken) {return null;}
        options.selectedMemoryFileRecord.value = file;
        return file;
    }

    async function selectMemoryFile(path = '') {
        const nextPath = String(path || '').trim();
        if (!nextPath || nextPath === options.selectedMemoryFilePath.value) {return false;}
        if (options.memoryEditorDirty.value && !await options.confirmDialog({
            title: '切换记忆档案',
            message: '当前记忆档案有未保存修改，切换后会放弃这份草稿。继续切换？',
            confirmText: '继续切换',
            tone: 'warning',
        })) {
            return false;
        }
        options.selectedMemoryFilePath.value = nextPath;
        return true;
    }

    async function saveSelectedMemoryFile() {
        const file = options.selectedMemoryFileEntry.value;
        if (!options.selectedSessionId.value || !file || options.memoryEditorReadOnly.value) {return;}
        options.memoryEditorStatus.value = '保存中';
        try {
            const userAcceptedAnchorOrder = (await getLatestTavernUserMessageAtOrBefore(
                options.selectedSessionId.value,
                Number.POSITIVE_INFINITY,
            ))?.order ?? -1;
            const saved = await writeTavernMemoryFile(options.selectedSessionId.value, file.path, options.memoryEditorDraft.value, { source: 'user' });
            await options.commitUserAcceptedState(options.selectedSessionId.value, userAcceptedAnchorOrder);
            await options.refreshRecords(options.selectedSessionId.value);
            options.memoryEditorLoadedPath.value = file.path;
            options.memoryEditorBaseContent.value = saved.content;
            options.memoryEditorDraft.value = saved.content;
            options.memoryEditorMode.value = 'preview';
            options.memoryEditorStatus.value = '';
        } catch (error) {
            options.memoryEditorStatus.value = error instanceof Error ? error.message : String(error || '保存失败');
        }
    }

    function enterMemoryEditMode() {
        if (!options.memoryEditorDocumentAvailable.value || options.memoryEditorReadOnly.value) {return;}
        options.memoryEditorMode.value = 'edit';
        void nextTick(() => {
            const textarea = document.querySelector<HTMLTextAreaElement>('[data-memory-editor-textarea="true"]');
            textarea?.focus();
        });
    }

    function previewMemoryDraft() {
        if (!options.memoryEditorDocumentAvailable.value) {return;}
        options.memoryEditorMode.value = 'preview';
    }

    function discardMemoryDraft() {
        if (!options.memoryEditorDocumentAvailable.value) {return;}
        options.memoryEditorDraft.value = options.memoryEditorBaseContent.value;
        options.memoryEditorMode.value = 'preview';
        options.memoryEditorStatus.value = '';
    }

    return {
        discardMemoryDraft,
        enterMemoryEditMode,
        formatMemoryFileMeta,
        invalidateMemoryFileRecordLoad,
        loadMemoryFileIntoEditor,
        loadSelectedMemoryFileRecord,
        memoryFileStatusLabel,
        previewMemoryDraft,
        saveSelectedMemoryFile,
        selectMemoryFile,
    };
}
