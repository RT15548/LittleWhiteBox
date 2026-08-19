export function createVariablesPanelRuntime({ createPanel, disposePanel }) {
    let instance = null;
    let initPromise = null;
    let lifecycle = 0;

    async function init() {
        if (initPromise) return initPromise;
        if (instance) return instance;

        const initLifecycle = ++lifecycle;
        const nextInstance = createPanel();
        instance = nextInstance;
        const nextInitPromise = Promise.resolve().then(() => nextInstance.init()).then(() => nextInstance);
        initPromise = nextInitPromise;
        try {
            return await nextInitPromise;
        } catch (error) {
            if (lifecycle === initLifecycle && instance === nextInstance) {
                instance = null;
                try { disposePanel(nextInstance); } catch {}
            }
            throw error;
        } finally {
            if (lifecycle === initLifecycle && initPromise === nextInitPromise) {
                initPromise = null;
            }
        }
    }

    function dispose() {
        lifecycle += 1;
        if (!instance) return;
        const currentInstance = instance;
        instance = null;
        initPromise = null;
        disposePanel(currentInstance);
    }

    return Object.freeze({
        init,
        dispose,
        getInstance: () => instance,
        isInitializing: () => initPromise !== null,
    });
}
