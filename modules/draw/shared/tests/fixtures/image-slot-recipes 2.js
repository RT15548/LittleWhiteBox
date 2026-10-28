// Deterministic, non-secret recipes for the isolated provider boundary fixture.
export function imageSlotFixtureRecipe(provider, count) {
    const seeds = Array.from({ length: count }, (_, index) => index + 1);
    if (provider === 'novelai') return {
        apiBaseUrl: 'https://supplier.invalid', apiKey: 'fixture-not-a-key', timeout: 1000,
        requestDelay: { min: 0, max: 0 }, positivePrefix: 'quality', negativePrefix: '',
        autoLearnEnabled: false, autoLearnMode: 'new_only', seeds,
        params: { model: 'nai-diffusion-4-5-full', sampler: 'k_euler_ancestral', scheduler: 'karras',
            steps: 28, scale: 5, width: 832, height: 1216, qualityToggle: true, ucPreset: 0, autoSmea: false, cfg_rescale: 0 },
    };
    return { host: 'https://supplier.invalid', timeout: 1000, delayMs: 0,
        workflowMode: 'builtin', seeds, positivePrefix: 'quality', negativePrefix: '',
        params: { model: 'fixture.safetensors', width: 512, height: 512, steps: 20, cfg_scale: 7,
            sampler_name: 'euler', scheduler: 'normal', seed: 1 } };
}
