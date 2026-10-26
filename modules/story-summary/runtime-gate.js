export function isXiaobaiMasterEnabled(scope = globalThis) {
    return scope?.window?.isXiaobaixEnabled !== false;
}
