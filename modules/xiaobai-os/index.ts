import { createDefaultXiaobaiOsSettings } from './host/settings-normalization.js';
import type { XiaobaiOsBootstrap } from './host/bootstrap.js';
import { createProductionBootstrap } from './host/production-composition.js';
import { createSettingsRepository } from './host/settings-repository.js';
import { createSillyTavernSettingsAdapter } from './host/sillytavern-context.js';

let runtime: XiaobaiOsBootstrap | null = null;
let initPromise: Promise<boolean> | null = null;
let cleanupPromise: Promise<void> = Promise.resolve();
let lifecycleGeneration = 0;
const settingsRepository = createSettingsRepository(createSillyTavernSettingsAdapter());

export async function initXiaobaiOs(): Promise<boolean> {
    if (runtime?.lifecycle.isInitialized()) {
        return true;
    }
    if (initPromise) {
        return initPromise;
    }
    const generation = ++lifecycleGeneration;
    initPromise = Promise.resolve()
        .then(async () => {
            await cleanupPromise;
            const current = await settingsRepository.prepare();
            if (!current.enabled || generation !== lifecycleGeneration) {
                return false;
            }
            const candidate = createProductionBootstrap(settingsRepository);
            runtime = candidate;
            try {
                const initialized = await candidate.init();
                if (generation !== lifecycleGeneration || runtime !== candidate) {
                    await candidate.cleanup();
                    return false;
                }
                return initialized;
            } catch (error) {
                await candidate.cleanup().catch(cleanupError => {
                    console.error('[LittleWhiteBox] 小白 OS 启动失败后的资源释放失败', cleanupError);
                });
                if (runtime === candidate) {
                    runtime = null;
                }
                throw error;
            }
        })
        .finally(() => {
            if (generation === lifecycleGeneration) {
                initPromise = null;
            }
        });
    return initPromise;
}

export function prepareXiaobaiOsSettings() {
    return settingsRepository.prepare().then((current) => {
        try {
            globalThis.localStorage?.removeItem('LittleWhiteBox:fourthWallFloatBtnPos');
        } catch (error) {
            console.warn('[LittleWhiteBox] 小白 OS 旧悬浮按钮位置清理失败', error);
        }
        return current;
    });
}

export async function setXiaobaiOsEnabled(enabled: boolean) {
    await settingsRepository.prepare();
    return settingsRepository.setEnabled(enabled);
}

export async function openXiaobaiOs(): Promise<boolean> {
    if (!runtime?.lifecycle.isInitialized()) {
        const initialized = await initXiaobaiOs();
        if (!initialized) {
            return false;
        }
    }
    return runtime?.lifecycle.isInitialized() ? runtime.lifecycle.open() : false;
}

export function cleanupXiaobaiOs(): void {
    lifecycleGeneration += 1;
    initPromise = null;
    const current = runtime;
    runtime = null;
    if (current) {
        cleanupPromise = cleanupPromise.then(() => current.cleanup()).catch((error) => {
            console.error('[LittleWhiteBox] 小白 OS 清理失败', error);
        });
    }
}

export { createDefaultXiaobaiOsSettings };
export { isDiceContinuationPending } from './apps/dice/application/continuation-state.js';
