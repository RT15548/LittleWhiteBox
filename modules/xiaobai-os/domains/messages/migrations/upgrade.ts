import { validateMessages as validateV1 } from './v1/invariants.js';
import type { MessagesDomainV2 } from '../types.js';

/**
 * Compatibility: official Messages v1 files. Remove only when v1 import support ends.
 * v1/ is the frozen September 2026 production writer/validator/projection format.
 */
export function upgradeMessagesV1(value: unknown): MessagesDomainV2 {
    validateV1(value);
    return { ...structuredClone(value), version: 2, pendingMutation: null };
}
