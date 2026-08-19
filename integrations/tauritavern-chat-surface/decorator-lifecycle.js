export function mountMessageDecorators({
    element,
    mesid,
    createContainerCleanup,
    decorators,
}) {
    const releases = [createContainerCleanup(element)];
    const release = () => {
        let firstError;
        for (let index = releases.length - 1; index >= 0; index -= 1) {
            try { releases[index]?.(); } catch (error) { firstError ??= error; }
        }
        releases.length = 0;
        if (firstError !== undefined) throw firstError;
    };

    try {
        for (const mount of decorators) {
            releases.push(mount(element, mesid));
        }
    } catch (error) {
        try { release(); } catch (cleanupError) {
            const failure = new Error('LittleWhiteBox managed decorator mount and cleanup failed');
            failure.cause = error;
            failure.cleanupError = cleanupError;
            throw failure;
        }
        throw error;
    }
    return release;
}
