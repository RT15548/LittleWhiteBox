// One provider's existing handlers, installed once in each mounted document.
// Leases own event wiring only; releasing a view never touches drawing jobs.
const documents = new Map();
let handlers = null;

function listen(document, method) {
    for (const [type, listener, options] of handlers || []) document[method](type, listener, options);
}

export function retainImageCardDocument(document) {
    let entry = documents.get(document);
    if (!entry) {
        entry = { refs: 0 };
        documents.set(document, entry);
        listen(document, 'addEventListener');
    }
    entry.refs++;
    let released = false;
    return () => {
        if (released) return;
        released = true;
        if (--entry.refs) return;
        listen(document, 'removeEventListener');
        documents.delete(document);
    };
}

export function bindImageCardEvents(next) {
    for (const document of documents.keys()) listen(document, 'removeEventListener');
    handlers = next;
    for (const document of documents.keys()) listen(document, 'addEventListener');
    const releaseHost = retainImageCardDocument(document);
    return () => {
        releaseHost();
        if (handlers !== next) return;
        for (const document of documents.keys()) listen(document, 'removeEventListener');
        handlers = null;
    };
}
