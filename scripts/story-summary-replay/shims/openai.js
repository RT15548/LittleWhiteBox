// Replay-only adapter for the summary module's OpenAI-compatible text stream.
// It intentionally implements only the response shapes exercised by this harness.
export function getStreamingReply(event) {
    const payload = event?.data ?? event;
    if (!payload || payload === '[DONE]') return '';

    let data = payload;
    if (typeof payload === 'string') {
        try {
            data = JSON.parse(payload);
        } catch {
            return payload;
        }
    }
    const choice = data?.choices?.[0] || {};
    return String(
        choice?.delta?.content
        ?? choice?.message?.content
        ?? choice?.text
        ?? '',
    );
}
