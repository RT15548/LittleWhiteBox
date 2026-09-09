export const SCENE_PLANNER_PRESET_NAMES = Object.freeze({
    normal: '新版-完整规则',
    pov: '新版-第一人称完整规则',
});

export function isPovPromptPreset(name) {
    return name === SCENE_PLANNER_PRESET_NAMES.pov || name === '默认-第一人称完整规则';
}

/** Fresh editable copies; the provider supplies its own guide representation. */
export function createScenePlannerDefaultPresets(defaults) {
    return [false, true].map(pov => ({
        id: `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        name: pov ? SCENE_PLANNER_PRESET_NAMES.pov : SCENE_PLANNER_PRESET_NAMES.normal,
        topSystem: pov ? defaults.topSystemPov : defaults.topSystem,
        sceneRules: defaults.sceneRules,
        ...(typeof defaults.tagGuideContent === 'string'
            ? { tagGuideContent: defaults.tagGuideContent }
            : { modelGuideOverrides: {} }),
    }));
}

/**
 * Configuration-load boundary only. Persist the returned settings as one snapshot so
 * the offered presets and the existing template-version marker commit together.
 * The marker, not preset names or presence, prevents deleted/renamed copies returning.
 */
export function installScenePlannerPresets(settings, defaults, targetVersion) {
    if (!Number.isInteger(targetVersion) || targetVersion <= 0) {
        throw new TypeError('targetVersion is required');
    }
    const source = settings && typeof settings === 'object' && !Array.isArray(settings) ? settings : {};
    if (Number(source._promptTemplateVersion) >= targetVersion) {
        return { settings: source, installed: false };
    }
    for (const key of ['topSystem', 'topSystemPov', 'sceneRules']) {
        if (typeof defaults?.[key] !== 'string' || !defaults[key].trim()) {
            throw new Error(`提示词模板尚未加载：${key}`);
        }
    }
    if (Object.hasOwn(defaults, 'tagGuideContent') && !defaults.tagGuideContent?.trim()) {
        throw new Error('提示词模板尚未加载：tagGuideContent');
    }
    const existing = Array.isArray(source.promptPresets) ? source.promptPresets : [];
    const added = createScenePlannerDefaultPresets(defaults);
    return {
        settings: {
            ...source,
            promptPresets: [...existing, ...added],
            selectedPromptPresetId: existing.some(preset => preset?.id === source.selectedPromptPresetId)
                ? source.selectedPromptPresetId : (existing[0]?.id || added[0].id),
            _promptTemplateVersion: targetVersion,
        },
        installed: true,
    };
}
