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
