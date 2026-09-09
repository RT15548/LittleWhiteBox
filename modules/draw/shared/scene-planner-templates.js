import { extensionFolderPath } from '../../../core/constants.js';

const PROMPTS_DIR = `${extensionFolderPath}/modules/draw/shared/prompts`;

/** Provider-independent editable defaults: opening (normal / POV) and creative scene rules. */
export const SHARED_PROMPT_TEMPLATE_FILES = Object.freeze({
    topSystem: `${PROMPTS_DIR}/opening.md`,
    topSystemPov: `${PROMPTS_DIR}/opening-pov.md`,
    sceneRules: `${PROMPTS_DIR}/scene-rules.md`,
});

/**
 * Fetch every template in `files` ({ key: url }). Returns `{ texts, ok }`; a failed file is
 * logged under `logPrefix` and left out of `texts` so the caller keeps its previous value.
 */
export async function fetchPromptTemplateFiles(files, logPrefix) {
    const results = await Promise.allSettled(
        Object.entries(files).map(async ([key, path]) => {
            const res = await fetch(path, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`${path}: ${res.status} ${res.statusText}`);
            return [key, await res.text()];
        }),
    );
    const texts = {};
    let ok = true;
    for (const result of results) {
        if (result.status === 'fulfilled') {
            texts[result.value[0]] = result.value[1];
        } else {
            ok = false;
            console.error(`${logPrefix} 提示词文件加载失败:`, result.reason);
        }
    }
    return { texts, ok };
}
