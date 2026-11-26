// Request-only carrier for non-text tool output. A user-role wire message must
// not start a new human turn or discard the current native tool-call envelope.
const toolResultContext = Symbol('toolResultContext');
export function buildToolResultContext(content) {
    return { role: 'user', content, [toolResultContext]: true };
}
export function isToolResultContext(message) {
    return message?.[toolResultContext] === true;
}
