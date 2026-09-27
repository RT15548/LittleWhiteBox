/** A mounted renderer owns resources; shared geometry/materials are released once. */
export class RenderResources {
    private readonly resources = new Set<{ dispose(): void }>();
    own<T extends { dispose(): void }>(resource: T): T { this.resources.add(resource); return resource; }
    dispose(): void {
        for (const resource of this.resources) { resource.dispose(); }
        this.resources.clear();
    }
}
