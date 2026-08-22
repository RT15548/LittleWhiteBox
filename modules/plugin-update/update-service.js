export const PLUGIN_UPDATE_STATUS = Object.freeze({
    AVAILABLE: 'available',
    CURRENT: 'current',
    FAILED: 'failed',
    UNKNOWN: 'unknown',
    UPDATED: 'updated',
});

async function readErrorText(response) {
    try {
        return String(await response.text() || response.statusText || '').trim();
    } catch {
        return String(response?.statusText || '').trim();
    }
}

export function createPluginUpdateService({
    extensionFolderId,
    fetchImpl,
    getCachedExtensionType,
    getRequestHeaders,
}) {
    const extensionKey = `third-party/${extensionFolderId}`;
    const nativeExtensionId = `/${extensionFolderId}`;

    async function check() {
        const extensionType = getCachedExtensionType(extensionKey);
        if (extensionType !== 'local' && extensionType !== 'global') {
            return { status: PLUGIN_UPDATE_STATUS.UNKNOWN };
        }

        let response;
        try {
            response = await fetchImpl('/api/extensions/version', {
                method: 'POST',
                headers: getRequestHeaders(),
                body: JSON.stringify({
                    extensionName: nativeExtensionId,
                    global: extensionType === 'global',
                }),
            });
        } catch (error) {
            return {
                status: PLUGIN_UPDATE_STATUS.UNKNOWN,
                errorText: error instanceof Error ? error.message : '更新检查失败',
            };
        }

        if (!response.ok) {
            return {
                status: PLUGIN_UPDATE_STATUS.UNKNOWN,
                errorText: await readErrorText(response),
            };
        }

        try {
            const data = await response.json();
            if (typeof data?.isUpToDate !== 'boolean') {
                return { status: PLUGIN_UPDATE_STATUS.UNKNOWN };
            }
            return {
                status: data.isUpToDate ? PLUGIN_UPDATE_STATUS.CURRENT : PLUGIN_UPDATE_STATUS.AVAILABLE,
                data,
            };
        } catch {
            return { status: PLUGIN_UPDATE_STATUS.UNKNOWN };
        }
    }

    async function install() {
        const extensionType = getCachedExtensionType(extensionKey);
        if (extensionType !== 'local' && extensionType !== 'global') {
            return {
                status: PLUGIN_UPDATE_STATUS.FAILED,
                errorText: '无法确定 LittleWhiteBox 的安装位置',
            };
        }

        let response;
        try {
            response = await fetchImpl('/api/extensions/update', {
                method: 'POST',
                headers: getRequestHeaders(),
                body: JSON.stringify({
                    extensionName: nativeExtensionId,
                    global: extensionType === 'global',
                }),
            });
        } catch (error) {
            return {
                status: PLUGIN_UPDATE_STATUS.FAILED,
                errorText: error instanceof Error ? error.message : '更新请求失败',
            };
        }

        if (!response.ok) {
            return {
                status: PLUGIN_UPDATE_STATUS.FAILED,
                errorText: await readErrorText(response),
            };
        }

        try {
            const data = await response.json();
            if (typeof data?.isUpToDate !== 'boolean') {
                return {
                    status: PLUGIN_UPDATE_STATUS.FAILED,
                    errorText: '酒馆返回了无法识别的更新结果',
                };
            }
            return {
                status: data.isUpToDate ? PLUGIN_UPDATE_STATUS.CURRENT : PLUGIN_UPDATE_STATUS.UPDATED,
                data,
            };
        } catch {
            return {
                status: PLUGIN_UPDATE_STATUS.FAILED,
                errorText: '酒馆返回了无法识别的更新结果',
            };
        }
    }

    return Object.freeze({ check, install });
}
