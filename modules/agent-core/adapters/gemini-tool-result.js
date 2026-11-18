function hasReferenceKey(value) {
    if (!value || typeof value !== 'object') return false;
    return Object.hasOwn(value, '$ref') || Object.values(value).some(hasReferenceKey);
}

// Gemini treats $ref keys in structured results as multimodal part names.
// Keep application data as original text when it uses the same key.
export function encodeGeminiToolResponse(response, originalText) {
    return hasReferenceKey(response)
        ? { output: typeof originalText === 'string' ? originalText : JSON.stringify(response) }
        : response;
}

export function encodeGeminiToolResultText(text) {
    if (typeof text !== 'string') return text;
    let parsed;
    try { parsed = JSON.parse(text); }
    catch (error) { if (!(error instanceof SyntaxError)) throw error; return text; }
    const encoded = encodeGeminiToolResponse(parsed, text);
    return encoded === parsed ? text : JSON.stringify(encoded);
}
