import { createProviderFloatingPanel } from '../../shared/provider-floating-panel.js';
import {
    abortGeneration, generateAndInsertImages, getSettings, openSettings,
    updateSettingsPersistent, findLastAIMessageId, getGenerationState,
} from './sd-draw.js';

export { FloatState, SIZE_OPTIONS } from '../../shared/provider-floating-panel.js';

export const {
    ensureDrawPanel: ensureSdDrawPanel,
    releaseDrawPanel: releaseSdDrawPanel,
    destroyDrawPanels: destroySdDrawPanels,
    setStateForMessage, setFloatingState, refreshDrawRunUiState,
    updateAutoModeUI, refreshPresetSelect, updateButtonVisibility,
    initFloatingPanel, destroyFloatingPanel,
    updateAllPresetSelects, updateAllSizeSelects, updateAllMaxImagesInputs,
    createFloatingButton, destroyFloatingButton,
} = createProviderFloatingPanel({
    provider: 'sd-webui',
    positionKey: 'xb_sd_float_pos',
    styleId: 'xiaobaix-sd-floating-style',
    floatingId: 'nd-floating-global',
    toolbarIdPrefix: 'sd-draw',
    logLabel: 'SdDraw',
    abortGeneration, generateAndInsertImages, getSettings, openSettings,
    updateSettingsPersistent, findLastAIMessageId, getGenerationState,
});
