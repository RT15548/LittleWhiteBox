import appIds from './app-catalog.json';

/** User-owned order. The catalog owns the default; newly registered APPs follow saved choices. */
export function normalizeAppOrder(value: unknown): string[] {
    if (!Array.isArray(value)) { return []; }
    const known = new Set<string>(appIds);
    return [...new Set(value.filter((id): id is string => typeof id === 'string' && known.has(id)))];
}

export function resolveAppOrder(saved: readonly string[]): string[] {
    return [...new Set([...normalizeAppOrder(saved), ...appIds])];
}

export function orderApps<T extends { id: string }>(apps: readonly T[], saved: readonly string[]): T[] {
    const byId = new Map(apps.map(app => [app.id, app]));
    return resolveAppOrder(saved).flatMap(id => {
        const app = byId.get(id);
        return app ? [app] : [];
    });
}

/** Disabled APPs retain their slots while the visible desktop is rearranged. */
export function mergeVisibleAppOrder(saved: readonly string[], visible: readonly string[]): string[] {
    const moved = new Set(visible);
    let index = 0;
    return resolveAppOrder(saved).map(id => moved.has(id) ? visible[index++] : id);
}
