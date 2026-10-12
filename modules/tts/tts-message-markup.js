// Message syntax shared by display and prose consumers; no playback/DOM state.
export function createTtsDirectiveRegex() {
    return /\[tts:([^\]]*)\]/gi;
}

export function createMessageVoiceRegex() {
    return /\[(?:voice|语音)\s*:([^\]]+)\]/gi;
}

export function replaceMessageVoiceMarkers(value, replace) {
    return String(value || '').replace(createMessageVoiceRegex(), (marker, body) => {
        const separator = body.indexOf(':');
        const emotion = separator < 0 ? '' : body.slice(0, separator).trim().toLowerCase();
        const text = (separator < 0 ? body : body.slice(separator + 1)).trim();
        return text ? replace(text, emotion, marker) : marker;
    });
}
