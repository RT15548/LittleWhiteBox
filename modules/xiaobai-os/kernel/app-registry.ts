import type {
    CapabilityToken,
    PartitionRegistration,
    PartitionStore,
    XiaobaiOsFileControls,
} from './contracts.js';
import type {
    XiaobaiOsAppActivationContext,
    XiaobaiOsAppDescriptor,
    XiaobaiOsAppRuntime,
} from '../types.js';
import type { XiaobaiOsHostFrameMessage } from '../host/frame-bridge.js';
import {
    XiaobaiOsExecutionScope,
    type AppFailure,
    type AppFailurePhase,
    type AppStatus,
} from './execution-scope.js';

export interface AppDataCleanupContext {
    removePartition(key: string): Promise<void>;
}

export interface AppInstallContext {
    ownerId: string;
    partition: PartitionStore<unknown> | null;
    useCapability<C>(token: CapabilityToken<C>): C;
    execution: XiaobaiOsExecutionScope;
    files: XiaobaiOsFileControls;
    storeFor<T>(registration: PartitionRegistration<T>): PartitionStore<T>;
    filesFor(registration: PartitionRegistration<unknown>): XiaobaiOsFileControls;
}

export type AppRegistrationContext = Omit<AppInstallContext, 'execution'>;

export interface XiaobaiOsAppModule {
    descriptor: Readonly<XiaobaiOsAppDescriptor>;
    partition?: PartitionRegistration<unknown>;
    additionalPartitions?: readonly PartitionRegistration<unknown>[];
    fileScope?: 'user';
    capabilities: readonly CapabilityToken<unknown>[];
    /** Lightweight contributions live until registry disposal, independently of the UI runtime. */
    register?(context: AppRegistrationContext): () => void;
    install(context: AppInstallContext): Promise<XiaobaiOsAppRuntime>;
    dispose?(runtime: XiaobaiOsAppRuntime): Promise<void>;
    clearData?(context: AppDataCleanupContext): Promise<void>;
}

export interface AppModuleRegistryOptions {
    createStore(
        registration: PartitionRegistration<unknown>,
        allowedCapabilities: readonly CapabilityToken<unknown>[],
    ): PartitionStore<unknown>;
    hasCapability(token: CapabilityToken<unknown>): boolean;
    requireCapability<C>(token: CapabilityToken<C>): C;
    files: XiaobaiOsFileControls;
    filesFor?(registration?: PartitionRegistration<unknown>, scope?: 'user'): XiaobaiOsFileControls;
}

export interface AppModuleRegistry {
    descriptors(): readonly Readonly<XiaobaiOsAppDescriptor>[];
    statuses(): Readonly<Record<string, AppStatus>>;
    installAll(): Promise<void>;
    retry(appId: string): Promise<void>;
    activate(appId: string, context: XiaobaiOsAppActivationContext): Promise<unknown>;
    deactivate(appId: string, reason: string): Promise<void>;
    handleMessage(appId: string, message: XiaobaiOsHostFrameMessage): Promise<unknown>;
    cancelForeground(reason: string): Promise<void>;
    cancelAll(reason: string): Promise<void>;
    handleWindowOpened(): Promise<void>;
    handleWindowClosed(reason: string): Promise<void>;
    handleChatChanged(): Promise<void>;
    startBackground(): Promise<void>;
    stopBackground(): Promise<void>;
    status(appId: string): AppStatus;
    runtime(appId: string): XiaobaiOsAppRuntime | null;
    subscribe(listener: (appId: string, status: AppStatus) => void): () => void;
    dispose(): Promise<void>;
}

interface InstalledApp {
    module: XiaobaiOsAppModule;
    status: AppStatus;
    runtime: XiaobaiOsAppRuntime | null;
    execution: XiaobaiOsExecutionScope | null;
    installQueue: Promise<void>;
    releaseQueue: Promise<unknown[]>;
    generation: number;
    unregister: (() => void) | null;
}

function appFailure(phase: AppFailurePhase, error: unknown): AppFailure {
    const record = error !== null && typeof error === 'object' ? error as Record<string, unknown> : null;
    return {
        code: typeof record?.code === 'string' ? record.code : `app_${phase}_failed`,
        message: error instanceof Error ? error.message : String(error),
        phase,
        retryable: record?.retryable !== false,
    };
}

function isFatalRuntimeFailure(error: unknown): boolean {
    if (error instanceof TypeError || error instanceof RangeError || error instanceof ReferenceError || error instanceof SyntaxError) {
        return true;
    }
    if (error === null || typeof error !== 'object') { return false; }
    const record = error as Record<string, unknown>;
    return record.code === 'partition_invalid' || record.appFatal === true;
}

export function createAppModuleRegistry(
    modules: readonly XiaobaiOsAppModule[],
    options: AppModuleRegistryOptions,
): AppModuleRegistry {
    const apps = new Map<string, InstalledApp>();
    const listeners = new Set<(appId: string, status: AppStatus) => void>();
    const descriptors: Readonly<XiaobaiOsAppDescriptor>[] = [];
    let disposed = false;
    let backgroundStarted = false;
    for (const module of modules) {
        const id = String(module?.descriptor?.id || '').trim();
        if (!id || typeof module.install !== 'function' || !Array.isArray(module.capabilities)) {
            throw new TypeError('invalid app module');
        }
        if (apps.has(id)) { throw new Error(`duplicate app module: ${id}`); }
        if (module.partition && module.partition.ownerId !== id) {
            throw new Error(`partition ${module.partition.key} must be owned by app ${id}`);
        }
        const capabilityIds = module.capabilities.map(token => token.id);
        if (new Set(capabilityIds).size !== capabilityIds.length) {
            throw new Error(`app ${id} declares a capability more than once`);
        }
        apps.set(id, {
            module,
            status: { state: 'loading', phase: 'install' },
            runtime: null,
            execution: null,
            installQueue: Promise.resolve(),
            releaseQueue: Promise.resolve([]),
            generation: 0,
            unregister: null,
        });
        descriptors.push(Object.freeze({ ...module.descriptor }));
    }

    function publish(appId: string, status: AppStatus): void {
        const app = apps.get(appId);
        if (!app) { return; }
        app.status = status;
        for (const listener of listeners) {
            try { listener(appId, status); } catch (error) {
                console.error('[LittleWhiteBox] 小白 OS APP 状态监听失败', error);
            }
        }
    }

    function releaseApp(app: InstalledApp, reason: string): Promise<unknown[]> {
        const release = app.releaseQueue.then(async () => {
            const runtime = app.runtime;
            const execution = app.execution;
            app.runtime = null;
            app.execution = null;
            const cleanups: Promise<unknown>[] = [];
            if (runtime) {
                cleanups.push(Promise.resolve().then(() => app.module.dispose?.(runtime)));
            }
            if (execution) { cleanups.push(execution.dispose(reason)); }
            return (await Promise.allSettled(cleanups))
                .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
                .map(result => result.reason as unknown);
        });
        app.releaseQueue = release;
        return release;
    }

    async function installOne(appId: string): Promise<void> {
        const app = apps.get(appId);
        if (!app) { throw new Error(`unknown app module: ${appId}`); }
        const generation = ++app.generation;
        await releaseApp(app, 'app-retry');
        let phase: AppFailurePhase = 'dependency';
        publish(appId, { state: 'loading', phase });
        try {
            const context = registrationContext(app);
            if (app.module.register && !app.unregister) { app.unregister = app.module.register(context); }
            for (const token of app.module.capabilities) {
                if (!options.hasCapability(token)) {
                    throw Object.assign(new Error(`capability is not registered: ${token.id}`), {
                        code: 'capability_unavailable',
                        retryable: false,
                    });
                }
            }
            const noFailure = Symbol('no-background-failure');
            let backgroundFailure: unknown | typeof noFailure = noFailure;
            const execution = new XiaobaiOsExecutionScope((error) => {
                if (app.generation !== generation || app.execution !== execution) { return; }
                backgroundFailure = error;
                publish(appId, { state: 'failed', failure: appFailure('background', error) });
                void releaseApp(app, 'app-background-failed');
            });
            app.execution = execution;
            if (app.module.partition) {
                phase = 'partition';
                publish(appId, { state: 'loading', phase });
            }
            const installContext = { ...context, execution };
            phase = 'install';
            publish(appId, { state: 'loading', phase });
            const runtime = await app.module.install(installContext);
            if (backgroundFailure !== noFailure) {
                app.runtime = runtime;
                await releaseApp(app, 'app-background-failed');
                return;
            }
            app.runtime = runtime;
            if (backgroundStarted) {
                phase = 'background';
                publish(appId, { state: 'loading', phase });
                await runtime.startBackground?.();
            }
            publish(appId, { state: 'ready' });
        } catch (error) {
            await releaseApp(app, 'app-install-failed');
            publish(appId, { state: 'failed', failure: appFailure(phase, error) });
        }
    }

    function registrationContext(app: InstalledApp): AppRegistrationContext {
        const module = app.module;
        const appId = module.descriptor.id;
        return {
            ownerId: appId,
            get partition() { return module.partition ? options.createStore(module.partition, module.capabilities) : null; },
            get files() { return options.filesFor?.(module.partition, module.fileScope) ?? options.files; },
            storeFor<T>(registration: PartitionRegistration<T>) {
                if (registration.ownerId !== appId || !module.additionalPartitions?.includes(registration)) { throw new Error('App partition access was not declared'); }
                return options.createStore(registration, module.capabilities) as PartitionStore<T>;
            },
            filesFor(registration) {
                if (registration.ownerId !== appId || !module.additionalPartitions?.includes(registration)) { throw new Error('App partition access was not declared'); }
                return options.filesFor?.(registration) ?? options.files;
            },
            useCapability<C>(token: CapabilityToken<C>): C {
                if (!module.capabilities.some(allowed => allowed.id === token.id)) {
                    throw Object.assign(new Error(`${appId} did not declare capability ${token.id}`), { code: 'capability_not_authorized', retryable: false });
                }
                return options.requireCapability(token);
            },
        };
    }

    function enqueueInstall(appId: string): Promise<void> {
        if (disposed) { return Promise.reject(new Error('app_registry_disposed')); }
        const app = apps.get(appId);
        if (!app) { return Promise.reject(new Error(`unknown app module: ${appId}`)); }
        const result = app.installQueue.then(() => installOne(appId), () => installOne(appId));
        app.installQueue = result.catch(() => undefined);
        return result;
    }

    async function installAll(): Promise<void> {
        await Promise.all([...apps.keys()].map(enqueueInstall));
    }

    function status(appId: string): AppStatus {
        const app = apps.get(appId);
        if (!app) { throw new Error(`unknown app module: ${appId}`); }
        return app.status;
    }

    function runtime(appId: string): XiaobaiOsAppRuntime | null {
        const app = apps.get(appId);
        return app?.status.state === 'ready' ? app.runtime : null;
    }

    function requireInstalled(appId: string): InstalledApp {
        const app = apps.get(appId);
        if (!app) { throw Object.assign(new Error('app_unavailable'), { code: 'app_unavailable' }); }
        if (app.status.state !== 'ready' || !app.runtime) {
            const failure = app.status.state === 'failed' ? app.status.failure : null;
            throw Object.assign(new Error(failure?.message ?? 'APP is not ready'), {
                code: failure?.code ?? 'app_not_ready',
                phase: failure?.phase ?? (app.status.state === 'loading' ? app.status.phase : 'install'),
                retryable: failure?.retryable ?? true,
            });
        }
        return app;
    }

    async function activate(appId: string, context: XiaobaiOsAppActivationContext): Promise<unknown> {
        const app = requireInstalled(appId);
        const runtime = app.runtime;
        const generation = app.generation;
        try {
            return await runtime?.activate?.(context);
        } catch (error) {
            if (isFatalRuntimeFailure(error) && app.runtime === runtime && app.generation === generation) {
                await releaseApp(app, 'app-activation-failed');
                publish(appId, { state: 'failed', failure: appFailure('activate', error) });
            }
            throw error;
        }
    }

    async function deactivate(appId: string, reason: string): Promise<void> {
        const app = apps.get(appId);
        if (!app?.runtime) { return; }
        try {
            await app.runtime.deactivate?.(reason);
        } catch (error) {
            console.error(`[LittleWhiteBox] 小白 OS APP ${appId} 停用失败`, error);
        }
    }

    async function handleMessage(appId: string, message: XiaobaiOsHostFrameMessage): Promise<unknown> {
        const app = requireInstalled(appId);
        const runtime = app.runtime;
        const generation = app.generation;
        try {
            return await runtime?.handleMessage?.(message);
        } catch (error) {
            if (isFatalRuntimeFailure(error) && app.runtime === runtime && app.generation === generation) {
                await releaseApp(app, 'app-runtime-failed');
                publish(appId, { state: 'failed', failure: appFailure('runtime', error) });
            }
            throw error;
        }
    }

    async function invokeInstalled(
        operationName: keyof XiaobaiOsAppRuntime,
        phase: AppFailurePhase | null,
        operation: (runtime: XiaobaiOsAppRuntime) => void | Promise<void>,
    ): Promise<void> {
        const targets = [...apps.entries()].filter(([, app]) => app.runtime !== null);
        const results = await Promise.allSettled(targets.map(async ([, app]) => operation(app.runtime as XiaobaiOsAppRuntime)));
        const cleanups: Promise<unknown[]>[] = [];
        results.forEach((result, index) => {
            if (result.status !== 'rejected') { return; }
            const [appId] = targets[index];
            console.error(`[LittleWhiteBox] 小白 OS APP ${appId}.${operationName} 失败`, result.reason);
            if (phase) {
                publish(appId, { state: 'failed', failure: appFailure(phase, result.reason) });
                cleanups.push(releaseApp(targets[index][1], `app-${String(operationName)}-failed`));
            }
        });
        await Promise.allSettled(cleanups);
    }

    function statuses(): Readonly<Record<string, AppStatus>> {
        return Object.freeze(Object.fromEntries([...apps].map(([id, app]) => [id, app.status])));
    }

    function subscribe(listener: (appId: string, status: AppStatus) => void): () => void {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    async function retry(appId: string): Promise<void> {
        await enqueueInstall(appId);
        const current = status(appId);
        if (current.state === 'failed') {
            throw Object.assign(new Error(current.failure.message), current.failure);
        }
    }

    async function dispose(): Promise<void> {
        if (disposed) { return; }
        disposed = true;
        await Promise.allSettled([...apps.values()].map(app => app.installQueue));
        const results = await Promise.allSettled([...apps.values()].map(async (app) => {
            app.generation += 1;
            const errors = await releaseApp(app, 'app-registry-disposed');
            try { app.unregister?.(); } catch (error) { errors.push(error); }
            app.unregister = null;
            if (errors.length > 0) { throw new AggregateError(errors, `app ${app.module.descriptor.id} disposal failed`); }
        }));
        const errors = results
            .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
            .map(result => result.reason as unknown);
        if (errors.length > 0) { throw new AggregateError(errors, 'app module disposal failed'); }
    }

    return Object.freeze({
        descriptors: () => Object.freeze([...descriptors]),
        statuses,
        installAll,
        retry,
        activate,
        deactivate,
        handleMessage,
        cancelForeground: (reason: string) => invokeInstalled('cancelForeground', null, runtime => runtime.cancelForeground?.(reason)),
        cancelAll: (reason: string) => invokeInstalled('cancelAll', null, runtime => runtime.cancelAll?.(reason)),
        handleWindowOpened: () => invokeInstalled(
            'handleWindowOpened',
            'background',
            runtime => runtime.handleWindowOpened?.(),
        ),
        handleWindowClosed: (reason: string) => invokeInstalled(
            'handleWindowClosed',
            null,
            runtime => runtime.handleWindowClosed?.(reason),
        ),
        handleChatChanged: () => invokeInstalled(
            'handleChatChanged',
            'background',
            runtime => runtime.handleChatChanged?.(),
        ),
        startBackground: () => {
            backgroundStarted = true;
            return invokeInstalled('startBackground', 'background', runtime => runtime.startBackground?.());
        },
        stopBackground: () => {
            backgroundStarted = false;
            return invokeInstalled('stopBackground', null, runtime => runtime.stopBackground?.());
        },
        status,
        runtime,
        subscribe,
        dispose,
    });
}
