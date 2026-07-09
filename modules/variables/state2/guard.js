import { getContext } from '../../../../../../extensions.js';
import {
    clearAllRules as clearAllCoreRules,
    clearRule as clearCoreRule,
    getParentPath,
    getRuleNode,
    getRulesSnapshot,
    replaceRules,
    setRule,
    validate,
} from './guard-core.js';

const LWB_RULES_V2_KEY = 'LWB_RULES_V2';

export {
    getParentPath,
    getRuleNode,
    setRule,
    validate,
};

export function loadRulesFromMeta() {
    try {
        const meta = getContext()?.chatMetadata || {};
        replaceRules(meta[LWB_RULES_V2_KEY] || {});
    } catch {
        replaceRules({});
    }
}

export function saveRulesToMeta() {
    try {
        const meta = getContext()?.chatMetadata || {};
        meta[LWB_RULES_V2_KEY] = getRulesSnapshot();
        getContext()?.saveMetadataDebounced?.();
    } catch {}
}

export function clearRule(path) {
    clearCoreRule(path);
    saveRulesToMeta();
}

export function clearAllRules() {
    clearAllCoreRules();
    saveRulesToMeta();
}
