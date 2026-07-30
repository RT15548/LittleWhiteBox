export interface DexieTable<T = Record<string, unknown>> {
    put(value: T): Promise<unknown>;
    bulkPut(values: T[]): Promise<unknown>;
    get(key: unknown): Promise<T | undefined>;
    update(key: unknown, changes: Partial<T>): Promise<number>;
    delete(key: unknown): Promise<void>;
    bulkDelete(keys: unknown[]): Promise<void>;
    count(): Promise<number>;
    toArray(): Promise<T[]>;
    orderBy(index: string): { reverse(): { toArray(): Promise<T[]> } };
    where(index: string): {
        equals(value: unknown): {
            first(): Promise<T | undefined>;
            count(): Promise<number>;
            toArray(): Promise<T[]>;
            sortBy(index: string): Promise<T[]>;
        };
    };
}

export default class Dexie {
    constructor(name: string);
    version(version: number): { stores(schema: Record<string, string>): void };
    transaction<T>(mode: string, ...args: unknown[]): Promise<T>;
    delete(): Promise<void>;
    open(): Promise<Dexie>;
}
