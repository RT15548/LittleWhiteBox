export async function readSseEventsFromResponse(response, onEvent) {
    const reader = response.body?.getReader?.();
    if (!reader) {
        throw new Error('host_chat_completions_stream_missing_body');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    const boundaryPattern = /\r?\n\r?\n/;

    const consume = (rawEvent) => {
        const data = rawEvent
            .split(/\r?\n/)
            .filter((line) => line.startsWith('data:'))
            .map((line) => line.slice(5).trimStart())
            .join('\n')
            .trim();
        if (!data || data === '[DONE]') return;
        onEvent(JSON.parse(data));
    };

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        while (true) {
            const match = buffer.match(boundaryPattern);
            if (!match || typeof match.index !== 'number') break;
            const rawEvent = buffer.slice(0, match.index);
            buffer = buffer.slice(match.index + match[0].length);
            consume(rawEvent);
        }
    }

    const trailing = buffer.trim();
    if (trailing) {
        consume(trailing);
    }
}
