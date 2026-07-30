export function createVariablesPanelRuntime({ createPanel, disposePanel }) {
    let instance = null;
    let initPromise = null;

    async function init() {
        if (initPromise) return initPromise;
        if (instance) return instance;

        const nextInstance = createPanel();
        instance = nextInstance;
        try {
            initPromise = Promise.resolve(nextInstance.init()).then(() => nextInstance);
            return await initPromise;
        } catch (error) {
            if (instance === nextInstance) {
                instance = null;
                try { disposePanel(nextInstance); } catch {}
            }
            throw error;
        } finally {
            initPromise = null;
        }
    }

    function dispose() {
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
