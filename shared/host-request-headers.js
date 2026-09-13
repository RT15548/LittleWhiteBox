let requestHeadersProvider = null;

/** Registered by the host bridge; read afresh for each request. */
export function setHostRequestHeadersProvider(provider) {
    requestHeadersProvider = typeof provider === 'function' ? provider : null;
}

export async function getHostRequestHeaders() {
    if (!requestHeadersProvider) {
        throw new Error('宿主请求头未注册，无法调用酒馆后端。');
    }
    return await requestHeadersProvider();
}
