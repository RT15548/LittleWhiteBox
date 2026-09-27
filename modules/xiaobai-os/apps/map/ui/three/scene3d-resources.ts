/** Each rendered scene owns its resources. Shared geometries are released exactly once. */
export class Scene3DResources {
    private readonly resources = new Set<{ dispose(): void }>();
    own<T extends { dispose(): void }>(resource: T): T { this.resources.add(resource); return resource; }
    dispose(): void {
        for (const resource of this.resources) {resource.dispose();}
        this.resources.clear();
    }
}
