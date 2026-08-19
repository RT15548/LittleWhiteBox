export function claimIframeRuntimes({
    content,
    claims,
    settings,
    shouldRender,
    mountRuntime,
}) {
    if (!settings.enabled || settings.renderEnabled === false) return;

    for (const code of content.querySelectorAll('pre > code')) {
        if (shouldRender(code)) {
            claims.claim(code.parentElement, mountRuntime);
        }
    }
}
