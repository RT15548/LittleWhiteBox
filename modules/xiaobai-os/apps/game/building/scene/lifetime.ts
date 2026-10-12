/** One ownership boundary for successful scenes and partially constructed scenes. */
export function withSceneLifetime<T>(create: (lifetime: {
    own: <R extends { dispose(): void }>(resource: R) => R;
    defer: (release: () => void) => void;
    dispose: () => void;
}) => T): T {
    const releases: (() => void)[] = [];
    function dispose() {
        const errors: unknown[] = [];
        while (releases.length) {
            try { releases.pop()!(); } catch (error) { errors.push(error); }
        }
        if (errors.length) { throw new AggregateError(errors, 'building_scene_dispose'); }
    }
    try {
        return create({
            own(resource) { releases.push(() => resource.dispose()); return resource; },
            defer(release) { releases.push(release); },
            dispose,
        });
    } catch (error) {
        try { dispose(); } catch (cleanupError) { throw new AggregateError([error, cleanupError], 'building_scene_initialization'); }
        throw error;
    }
}
