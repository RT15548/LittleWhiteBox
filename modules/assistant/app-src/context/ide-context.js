import { describeMemoryFile, findMemoryFileByPath } from '../memory/memory-files.js';

function trimContextSnippet(text, limit = 600) {
    const value = String(text || '');
    if (!value) return '';
    return value.length > limit ? `${value.slice(0, limit)}…` : value;
}

function normalizeWorkspaceSelectionContext(next = {}) {
    return {
        filePath: String(next.filePath || '').trim(),
        viewerMode: String(next.viewerMode || '').trim(),
        lineStart: String(next.lineStart || '').trim(),
        lineEnd: String(next.lineEnd || '').trim(),
        text: trimContextSnippet(next.text || '', 600),
    };
}

export function buildWorkspaceUserContextTextForState(inputState = {}) {
    const sourceState = inputState || {};
    const isMemoryPanel = sourceState.workspacePanelMode === 'memory';
    const selectedFilePath = isMemoryPanel
        ? String(sourceState.selectedSkillFilePath || '').trim()
        : String(sourceState.selectedFilePath || '').trim();
    const selectedTreePath = isMemoryPanel ? '' : String(sourceState.selectedTreePath || '').trim();
    const selection = normalizeWorkspaceSelectionContext(sourceState.workspaceSelectionContext);

    if (!sourceState.isWorkspaceOpen) return '';
    if (!selectedFilePath && !selectedTreePath) return '';

    const lines = ['[IDE background]'];
    if (selectedTreePath && String(selectedTreePath).endsWith('/') && (!selectedFilePath || selectedTreePath !== selectedFilePath)) {
        lines.push(`用户当前在工作区聚焦了目录：${selectedTreePath}`);
        if (!selectedFilePath) {
            lines.push('用户当前还没有在代码区锁定具体文件。');
        } else {
            lines.push(`代码区当前显示的是：${selectedFilePath}，但树上的当前焦点仍是这个目录。`);
        }
    } else if (selectedFilePath) {
        if (isMemoryPanel) {
            const file = findMemoryFileByPath(sourceState.skillFiles, selectedFilePath);
            const memoryDescriptor = describeMemoryFile(file, selectedFilePath);
            lines.push(`用户当前打开了记忆区${memoryDescriptor.kindLabel}：${memoryDescriptor.displayName}`);
        } else {
            lines.push(`用户当前打开了工作区文件：${selectedFilePath}`);
        }
        if (sourceState.viewerMode) {
            lines.push(`当前查看模式：${String(sourceState.viewerMode || '').trim()}`);
        }
    }

    if (selection.filePath && selection.filePath === selectedFilePath && (selection.text || selection.lineStart)) {
        const file = isMemoryPanel ? findMemoryFileByPath(sourceState.skillFiles, selectedFilePath) : null;
        const memoryDescriptor = isMemoryPanel ? describeMemoryFile(file, selectedFilePath) : null;
        const selectedTargetLabel = isMemoryPanel
            ? `这个${memoryDescriptor.kindLabel}`
            : selection.filePath;
        if (selection.lineStart) {
            lines.push(
                selection.text
                    ? (
                        selection.lineEnd && selection.lineEnd !== selection.lineStart
                            ? `用户当前选中了 ${selectedTargetLabel} 的第 ${selection.lineStart} 到 ${selection.lineEnd} 行：`
                            : `用户当前选中了 ${selectedTargetLabel} 的第 ${selection.lineStart} 行：`
                    )
                    : `用户当前光标定位在 ${selectedTargetLabel} 的第 ${selection.lineStart} 行。`,
            );
        } else if (selection.text) {
            lines.push(`用户当前选中了 ${selectedTargetLabel} 中的一段内容：`);
        }
        if (selection.text) {
            lines.push(selection.text);
        }
    }

    lines.push('');
    lines.push('这些信息可能与当前任务有关，也可能无关，请自然地了解即可。');

    return lines.join('\n').trim();
}
