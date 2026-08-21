export const PLUGIN_UPDATE_STATUS = Object.freeze({
    AVAILABLE: 'available',
    CURRENT: 'current',
    FAILED: 'failed',
    UNCONFIRMED: 'unconfirmed',
    UNKNOWN: 'unknown',
    UPDATED: 'updated',
});

const DIRECTORY_ERROR_PATTERN = /Directory does not exist/i;
const PERMISSION_ERROR_PATTERN = /Forbidden|permission/i;

function getScopeOrder(detectedGlobal) {
    return detectedGlobal === null ? [false, true] : [detectedGlobal, !detectedGlobal];
}

function describeRequestError(error) {
    return error instanceof Error && error.message ? error.message : '更新请求失败';
}

async function readResponseText(response) {
    try {
        const text = String(await response.text() || '').trim();
        return text || String(response.statusText || '').trim() || `HTTP ${response.status}`;
    } catch {
        return String(response.statusText || '').trim() || `HTTP ${response.status}`;
    }
}

async function readVersionResponse(response) {
    if (!response?.ok) return null;

    try {
        const data = await response.json();
        return typeof data?.isUpToDate === 'boolean' ? data : null;
    } catch {
        return null;
    }
}

export function createPluginUpdateService({
    extensionFolderId,
    fetchImpl,
    getCachedExtensionType,
    getRequestHeaders,
}) {
    const extensionKey = `third-party/${extensionFolderId}`;

    async function detectGlobalScope() {
        try {
            const response = await fetchImpl('/api/extensions/discover', {
                method: 'GET',
                headers: getRequestHeaders(),
            });
            if (response.ok) {
                const extensions = await response.json();
                const match = Array.isArray(extensions)
                    ? extensions.find(extension => extension?.name === extensionKey)
                    : null;
                if (match?.type === 'global') return true;
                if (match?.type === 'local') return false;
            }
        } catch {}

        const cachedType = getCachedExtensionType(extensionKey);
        if (cachedType === 'global') return true;
        if (cachedType === 'local') return false;
        return null;
    }

    function requestUpdate(globalFlag) {
        return fetchImpl('/api/extensions/update', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({ extensionName: extensionFolderId, global: globalFlag }),
        });
    }

    function requestVersion(globalFlag) {
        return fetchImpl('/api/extensions/version', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({ extensionName: extensionFolderId, global: globalFlag }),
        });
    }

    async function requestAtInstalledScope(request) {
        const detectedGlobal = await detectGlobalScope();
        const order = getScopeOrder(detectedGlobal);

        for (let index = 0; index < order.length; index++) {
            const globalFlag = order[index];
            let response;
            try {
                response = await request(globalFlag);
            } catch (error) {
                return {
                    response: null,
                    globalFlag,
                    errorText: describeRequestError(error),
                };
            }

            if (response.ok) return { response, globalFlag, errorText: '' };

            const errorText = await readResponseText(response);
            const mayBeWrongScope = index === 0 && (
                response.status === 404
                || DIRECTORY_ERROR_PATTERN.test(errorText)
                || (detectedGlobal === null && (
                    response.status === 403
                    || PERMISSION_ERROR_PATTERN.test(errorText)
                ))
            );
            if (!mayBeWrongScope) return { response, globalFlag, errorText };
        }

        return {
            response: null,
            globalFlag: order[order.length - 1],
            errorText: '找不到 LittleWhiteBox 扩展目录',
        };
    }

    async function verifyCurrentVersion(globalFlag) {
        if (typeof globalFlag !== 'boolean') return { status: PLUGIN_UPDATE_STATUS.UNKNOWN };

        try {
            const data = await readVersionResponse(await requestVersion(globalFlag));
            if (!data) return { status: PLUGIN_UPDATE_STATUS.UNKNOWN };
            return {
                status: data.isUpToDate ? PLUGIN_UPDATE_STATUS.CURRENT : PLUGIN_UPDATE_STATUS.AVAILABLE,
                data,
            };
        } catch {
            return { status: PLUGIN_UPDATE_STATUS.UNKNOWN };
        }
    }

    async function check() {
        const result = await requestAtInstalledScope(requestVersion);
        const data = await readVersionResponse(result.response);
        if (!data) {
            return {
                status: PLUGIN_UPDATE_STATUS.UNKNOWN,
                errorText: result.errorText,
            };
        }
        return {
            status: data.isUpToDate ? PLUGIN_UPDATE_STATUS.CURRENT : PLUGIN_UPDATE_STATUS.AVAILABLE,
            data,
        };
    }

    async function install() {
        const result = await requestAtInstalledScope(requestUpdate);
        if (result.response?.ok) {
            try {
                const data = await result.response.json();
                if (typeof data?.isUpToDate === 'boolean') {
                    return {
                        status: data.isUpToDate ? PLUGIN_UPDATE_STATUS.CURRENT : PLUGIN_UPDATE_STATUS.UPDATED,
                        reloadRequired: data.isUpToDate === false,
                        data,
                    };
                }
            } catch {}
        }

        const verification = await verifyCurrentVersion(result.globalFlag);
        if (verification.status === PLUGIN_UPDATE_STATUS.CURRENT) {
            return {
                status: PLUGIN_UPDATE_STATUS.CURRENT,
                reloadRequired: true,
                data: verification.data,
            };
        }
        if (verification.status === PLUGIN_UPDATE_STATUS.AVAILABLE) {
            return {
                status: PLUGIN_UPDATE_STATUS.FAILED,
                reloadRequired: false,
                errorText: result.errorText,
            };
        }

        const statusCode = result.response?.status;
        const isDefinitiveClientError = Number.isInteger(statusCode)
            && statusCode >= 400
            && statusCode < 500;
        return {
            status: isDefinitiveClientError
                ? PLUGIN_UPDATE_STATUS.FAILED
                : PLUGIN_UPDATE_STATUS.UNCONFIRMED,
            reloadRequired: !isDefinitiveClientError,
            errorText: result.errorText,
        };
    }

    return Object.freeze({ check, install });
}
