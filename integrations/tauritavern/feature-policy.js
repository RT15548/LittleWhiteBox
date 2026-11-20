import { TAURITAVERN_ERROR_CODES, TAURITAVERN_MESSAGES } from './diagnostics.js';

// For the host targeted in README.md, supported governs startup admission; mutable governs settings
// changes after managed ownership is frozen. Neither implies the other.
// Keep each feature's controls and admission rule together; do not add a second
// blacklist in the participant, settings UI or documentation.
const MANAGED_FEATURES = [
    {
        id: 'extension', supported: true, mutable: true,
        controls: ['xiaobaix_enabled'],
    },
    {
        id: 'reset', supported: true, mutable: true,
        controls: ['xiaobaix_reset_btn'],
    },
    {
        id: 'recorded', supported: true, mutable: true,
        controls: ['xiaobaix_recorded_enabled'],
    },
    {
        id: 'variablesPanel', supported: true, mutable: true,
        controls: ['xiaobaix_variables_panel_enabled'],
    },
    {
        id: 'storySummary', supported: true, mutable: true,
        controls: ['xiaobaix_story_summary_enabled'],
    },
    {
        id: 'iframeRenderer', supported: true, mutable: true,
        controls: ['xiaobaix_render_enabled', 'xiaobaix_max_rendered'],
    },
    {
        id: 'buttonCollapse', supported: true, mutable: true,
        controls: ['xiaobaix_xposition_btn'],
    },
    {
        id: 'immersive', supported: false, mutable: false,
        label: 'immersive mode',
        controls: ['xiaobaix_immersive_enabled'],
        isActive: ({ settings }) => settings.immersive?.enabled,
    },
    {
        id: 'preview', supported: false, mutable: false,
        label: 'message preview/purge',
        controls: ['xiaobaix_preview_enabled'],
        isActive: ({ settings }) => settings.preview?.enabled,
    },
    {
        id: 'storyOutline', supported: true, mutable: true,
        label: 'story-outline floor tools',
        controls: ['xiaobaix_story_outline_enabled'],
        isActive: ({ settings }) => settings.storyOutline?.enabled,
    },
    {
        id: 'tts', supported: true, mutable: true,
        label: 'TTS floor tools',
        controls: ['xiaobaix_tts_enabled', 'xiaobaix_tts_open_settings'],
        isActive: ({ settings }) => settings.tts?.enabled,
    },
    {
        id: 'xiaobaiOs', supported: true, mutable: true,
        label: 'Xiaobai OS',
        controls: ['xiaobaix_os_enabled'],
        isActive: ({ settings }) => settings.xiaobaiOs?.enabled,
    },
    {
        id: 'draw', supported: true, mutable: true,
        label: 'draw provider',
        controls: ['xiaobaix_draw_provider', 'xiaobaix_draw_open_settings'],
        isActive: ({ isDrawProviderActive }) => isDrawProviderActive(),
    },
    {
        id: 'customTemplate', supported: false, mutable: false,
        label: 'custom template iframe',
        controls: ['xiaobaix_template_enabled'],
        isActive: ({ hasActiveCustomTemplate }) => hasActiveCustomTemplate(),
    },
];

export function getUnsupportedManagedFeatures(context) {
    if (!context.settings.enabled) return [];
    return MANAGED_FEATURES.filter(feature => !feature.supported && feature.isActive(context)).map(feature => feature.id);
}

export function assertManagedFeaturesSupported(context) {
    const unsupported = getUnsupportedManagedFeatures(context);
    if (!unsupported.length) return;
    const labels = MANAGED_FEATURES.filter(feature => unsupported.includes(feature.id)).map(feature => feature.label);
    const error = new Error(TAURITAVERN_MESSAGES.unsupportedFeatures(labels));
    error.code = TAURITAVERN_ERROR_CODES.unsupportedFeatures;
    error.featureIds = unsupported;
    throw error;
}

export function getManagedLockedControlIds() {
    return MANAGED_FEATURES.filter(feature => !feature.mutable).flatMap(feature => feature.controls);
}
