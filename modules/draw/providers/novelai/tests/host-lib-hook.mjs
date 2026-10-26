// Test-only module resolution hook: the SillyTavern host exports (lib.js) do not exist outside the host, so give the page a pass-through DOMPurify.
const STUB = 'data:text/javascript,' + encodeURIComponent('export const DOMPurify = { sanitize: (html) => String(html) };');

export async function resolve(specifier, context, next) {
    if (/\/lib\.js$/.test(specifier)) return { url: STUB, shortCircuit: true };
    return next(specifier, context);
}
