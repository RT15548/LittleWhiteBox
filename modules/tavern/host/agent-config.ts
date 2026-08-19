import { getRequestHeaders } from '../../../../../../../script.js';
import { AssistantStorage } from '../../../core/server-storage.js';
import { extensionFolderPath } from '../../../core/constants.js';
import {
    loadSharedAgentSettings,
    saveSharedAgentSettings,
} from '../../agent-core/settings-repository.js';
import { listTavernChatPresetBundles } from './chat-presets.js';
import { loadTavernDisplaySettings } from './display-settings.js';

interface TavernFrameConfigOptions {
    onStartupProgress?: (payload: { percent: number; action: string }) => void;
}

export async function loadTavernAgentConfig(): Promise<Record<string, unknown>> {
    return await loadSharedAgentSettings({ storage: AssistantStorage });
}

export async function loadTavernAgentConfigPayload(): Promise<{
    agentConfig: Record<string, unknown> | null;
    agentConfigLoadError: string;
}> {
    try {
        return {
            agentConfig: await loadTavernAgentConfig(),
            agentConfigLoadError: '',
        };
    } catch (error) {
        return {
            agentConfig: null,
            agentConfigLoadError: `共享 Agent API 配置读取失败：${error instanceof Error ? error.message : String(error || 'unknown_error')}`,
        };
    }
}

export async function saveTavernAgentConfig(patch: Record<string, unknown> = {}, options: {
    silent?: boolean;
} = {}): Promise<{ ok: boolean; conflict?: boolean; config: Record<string, unknown> | null; error?: string }> {
    return await saveSharedAgentSettings(patch, {
        storage: AssistantStorage,
        silent: options.silent !== false,
        source: 'tavern',
    });
}

export async function buildTavernFrameConfig(
    contextPayload: Record<string, unknown> = {},
    options: TavernFrameConfigOptions = {},
): Promise<Record<string, unknown>> {
    options.onStartupProgress?.({ percent: 62, action: 'loadFrameSettings' });
    const [agentConfigPayload, tavernDisplaySettings] = await Promise.all([
        loadTavernAgentConfigPayload(),
        loadTavernDisplaySettings(),
    ]);
    options.onStartupProgress?.({ percent: 68, action: 'buildChatPreset' });
    const chatPresetList = listTavernChatPresetBundles();
    options.onStartupProgress?.({ percent: 74, action: 'attachHostHeaders' });
    const hostRequestHeaders = getRequestHeaders?.() || {};
    options.onStartupProgress?.({ percent: 80, action: 'frameConfigReady' });
    return {
        ...agentConfigPayload,
        tavernDisplaySettings,
        extensionBasePath: `/${extensionFolderPath}`,
        chatPreset: chatPresetList.active,
        chatPresetList,
        hostRequestHeaders,
        ...contextPayload,
    };
}
