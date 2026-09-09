/**
 * What the image backend can actually consume from a scene plan. Providers own their profile;
 * the planner prompt, the Tool schema and the request preview are all rendered from it so the
 * model is never taught a field the compiler will drop.
 */
const CENTER_MODES = new Set(['none', 'grid', 'normalized']);
const INTERACT_SYNTAXES = new Set(['plain', 'directional']);
const UC_SCOPES = new Set(['global', 'character']);

const DEFAULT_PROFILE = Object.freeze({
    imageModelName: '图像模型',
    centerMode: 'none',
    interactSyntax: 'plain',
    ucScope: 'global',
});

export function normalizeScenePlannerProfile(profile) {
    const source = profile && typeof profile === 'object' ? profile : {};
    const imageModelName = String(source.imageModelName || '').trim() || DEFAULT_PROFILE.imageModelName;
    return Object.freeze({
        imageModelName,
        centerMode: CENTER_MODES.has(source.centerMode) ? source.centerMode : DEFAULT_PROFILE.centerMode,
        interactSyntax: INTERACT_SYNTAXES.has(source.interactSyntax)
            ? source.interactSyntax
            : DEFAULT_PROFILE.interactSyntax,
        ucScope: UC_SCOPES.has(source.ucScope) ? source.ucScope : DEFAULT_PROFILE.ucScope,
    });
}
