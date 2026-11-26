import { createProviderFloatingPanel } from '../../shared/provider-floating-panel.js';
import {
    abortGeneration, generateAndInsertImages, getSettings, openSettings,
    updateSettingsPersistent, findLastAIMessageId, getGenerationState,
} from './comfy-draw.js';

export { FloatState, SIZE_OPTIONS } from '../../shared/provider-floating-panel.js';

export const {
    ensureDrawPanel: ensureComfyDrawPanel,
    releaseDrawPanel: releaseComfyDrawPanel,
    destroyDrawPanels: destroyComfyDrawPanels,
    setStateForMessage, setFloatingState, refreshDrawRunUiState,
    updateAutoModeUI, refreshPresetSelect, updateButtonVisibility,
    initFloatingPanel, destroyFloatingPanel,
    updateAllPresetSelects, updateAllSizeSelects, updateAllMaxImagesInputs,
    createFloatingButton, destroyFloatingButton,
} = createProviderFloatingPanel({
    provider: 'comfyui',
    positionKey: 'xb_comfy_float_pos',
    styleId: 'xiaobaix-comfy-floating-style',
    floatingId: 'nd-comfy-floating-global',
    toolbarIdPrefix: 'comfy-draw',
    logLabel: 'ComfyDraw',
    abortGeneration, generateAndInsertImages, getSettings, openSettings,
    updateSettingsPersistent, findLastAIMessageId, getGenerationState,
});
