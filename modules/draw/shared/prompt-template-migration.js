function normalizeLineEndings(value) {
    return String(value || '').replace(/\r\n?/g, '\n');
}

function fnv1a(text, seed) {
    let hash = seed >>> 0;
    for (let index = 0; index < text.length; index++) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}

export function promptTemplateFingerprint(value) {
    const text = normalizeLineEndings(value);
    const reversed = Array.from(text).reverse().join('');
    return `${text.length}:${fnv1a(text, 2166136261)}:${fnv1a(reversed, 2246822507)}`;
}

function matchesReleasedDefault(value, fingerprints) {
    const released = Array.isArray(fingerprints) ? fingerprints : [fingerprints];
    return released.includes(promptTemplateFingerprint(value));
}

/**
 * Refreshes only fields that still equal a shipped default. User-edited fields and
 * non-managed presets stay untouched, while the version advances exactly once.
 */
export function refreshReleasedPromptPresetDefaults(presets, {
    storedVersion = 0,
    targetVersion,
    releasedFingerprints = {},
    getCurrentDefaults,
} = {}) {
    if (!Number.isInteger(targetVersion) || targetVersion <= 0) {
        throw new TypeError('targetVersion is required');
    }
    if (!Array.isArray(presets)) throw new TypeError('presets must be an array');
    if (typeof getCurrentDefaults !== 'function') throw new TypeError('getCurrentDefaults is required');
    if (Number(storedVersion) >= targetVersion) {
        return { presets, templateVersion: Number(storedVersion) || targetVersion, migrated: false };
    }

    let migrated = false;
    const next = presets.map((preset) => {
        if (!preset || typeof preset !== 'object' || Array.isArray(preset)) return preset;
        const fieldFingerprints = releasedFingerprints[preset.name];
        if (!fieldFingerprints) return preset;
        const defaults = getCurrentDefaults(preset.name);
        let copy = preset;
        for (const [field, fingerprints] of Object.entries(fieldFingerprints)) {
            if (!matchesReleasedDefault(preset[field], fingerprints)) continue;
            if (copy === preset) copy = { ...preset };
            copy[field] = defaults[field];
            migrated = true;
        }
        return copy;
    });

    return { presets: next, templateVersion: targetVersion, migrated };
}
