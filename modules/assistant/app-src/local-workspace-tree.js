export function buildWorkspaceTree(localSources = [], options = {}) {
    const selectedSourceId = String(options.selectedSourceId || 'all').trim() || 'all';
    const searchQuery = String(options.searchQuery || '').trim().toLowerCase();
    const modifiedOnly = !!options.modifiedOnly;
    const isModifiedFile = typeof options.isModifiedFile === 'function'
        ? options.isModifiedFile
        : (() => false);
    const visibleSources = selectedSourceId === 'all'
        ? localSources
        : localSources.filter((source) => source.sourceId === selectedSourceId);
    const rootNodes = [];
    const visiblePaths = [];
    const visibleNodePaths = [];

    visibleSources.forEach((source) => {
        const root = {
            key: `source:${source.sourceId}`,
            type: 'dir',
            label: source.label,
            sourceId: source.sourceId,
            path: `local/${source.label}/`,
            children: [],
            modified: false,
        };
        visibleNodePaths.push(root.path);
        const dirIndex = new Map([[root.key, root]]);

        source.files.forEach((file) => {
            const modified = isModifiedFile(file);
            if (modifiedOnly && !modified) return;
            const searchText = `${source.label}/${file.relativePath}`.toLowerCase();
            if (searchQuery && !searchText.includes(searchQuery)) return;

            const segments = file.relativePath.split('/').filter(Boolean);
            let parent = root;
            let parentKey = root.key;

            segments.slice(0, -1).forEach((segment, index) => {
                const nextKey = `${parentKey}/dir:${segments.slice(0, index + 1).join('/')}`;
                if (!dirIndex.has(nextKey)) {
                    const nextNode = {
                        key: nextKey,
                        type: 'dir',
                        label: segment,
                        sourceId: source.sourceId,
                        path: `local/${source.label}/${segments.slice(0, index + 1).join('/')}/`,
                        children: [],
                        modified: false,
                    };
                    dirIndex.set(nextKey, nextNode);
                    parent.children.push(nextNode);
                    visibleNodePaths.push(nextNode.path);
                }
                parent = dirIndex.get(nextKey);
                parentKey = nextKey;
            });

            parent.children.push({
                key: `file:${file.path}`,
                type: 'file',
                label: file.name,
                sourceId: source.sourceId,
                path: file.path,
                modified,
                file,
            });
            visiblePaths.push(file.path);
            visibleNodePaths.push(file.path);
        });

        const markModifiedDirs = (node) => {
            if (node.type === 'file') return !!node.modified;
            let nodeModified = false;
            node.children = node.children
                .map((child) => {
                    if (child.type === 'dir') {
                        child.modified = markModifiedDirs(child);
                    }
                    nodeModified = nodeModified || !!child.modified;
                    return child;
                })
                .sort((left, right) => {
                    if (left.type !== right.type) return left.type === 'dir' ? -1 : 1;
                    return String(left.label || '').localeCompare(String(right.label || ''), 'zh-CN');
                });
            return nodeModified;
        };

        root.modified = markModifiedDirs(root);
        if (!root.children.length) return;
        if (selectedSourceId === 'all') {
            rootNodes.push(root);
            return;
        }
        rootNodes.push(...root.children);
    });

    return {
        nodes: rootNodes,
        visiblePaths,
        visibleNodePaths,
        visibleSources,
    };
}

export function collectDirectoryExpansionKeys(nodes = [], result = new Set()) {
    nodes.forEach((node) => {
        if (node.type === 'dir') {
            result.add(node.key);
            collectDirectoryExpansionKeys(node.children || [], result);
        }
    });
    return result;
}
