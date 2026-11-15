// A host rename changes only the saved name. Keep other authored fields and a
// deliberately different draft name; that disagreement still requires merging.
function object(content) {
    try {
        const value = JSON.parse(content);
        return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
    } catch (error) {
        if (error instanceof SyntaxError) return null; // An editor can contain unfinished JSON.
        throw error;
    }
}

export function cardMetadataName(content) {
    return object(content)?.name;
}

export function rebaseCardName(file, name) {
    if (typeof name !== 'string' || typeof file.originalContent !== 'string') return file;
    const original = object(file.originalContent), draft = object(file.content);
    if (!original || !draft || (draft.name !== original.name && draft.name !== name)) return file;
    if (original.name === name && draft.name === name) return file;
    return { ...file, content: JSON.stringify({ ...draft, name }, null, 2),
        originalContent: JSON.stringify({ ...original, name }, null, 2) };
}
