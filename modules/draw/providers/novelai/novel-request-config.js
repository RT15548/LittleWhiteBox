export function snapshotNovelRequestConfig(settings, generationConfig, defaultTimeout) {
    const timeout = Number(settings?.timeout);
    return Object.freeze({
        apiBaseUrl: String(settings?.apiBaseUrl || '').trim(),
        apiKey: String(settings?.apiKey || '').trim(),
        sendMode: settings?.sendMode === 'backend' ? 'backend' : 'frontend',
        insecureTLS: settings?.insecureTLS === true,
        timeout: Number.isFinite(timeout) && timeout > 0 ? timeout : defaultTimeout,
        overrideSize: String(generationConfig?.overrideSize ?? settings?.overrideSize ?? 'default'),
    });
}

const DEFAULT_IMAGE_ORIGIN = 'https://image.novelai.net';

export function resolveNovelAIImageApi(baseUrl, transport = 'image') {
    const endpoint = transport === 'msgpack-stream' ? 'generate-image-stream' : 'generate-image';
    const raw = String(baseUrl || '').trim();
    if (!raw) return `${DEFAULT_IMAGE_ORIGIN}/ai/${endpoint}`;
    const suffixIndex = raw.search(/[?#]/);
    const path = (suffixIndex < 0 ? raw : raw.slice(0, suffixIndex)).replace(/\/+$/, '');
    const suffix = suffixIndex < 0 ? '' : raw.slice(suffixIndex);
    const resolvedPath = /\/ai\/generate-image(?:-stream)?$/i.test(path)
        ? path.replace(/\/ai\/generate-image(?:-stream)?$/i, `/ai/${endpoint}`)
        : `${path}/ai/${endpoint}`;
    return `${resolvedPath}${suffix}`;
}
