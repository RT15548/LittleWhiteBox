import { sha256 } from 'js-sha256';
import { readDiceChecksV1 } from './records-v1.js';
import { readDiceChecksV3, type CheckV3 } from './records-v3.js';

function upgradeCheck(record: CheckV3) {
    const resolution = record.rule === 'coc7' ? record.resolution : undefined;
    // Preserve the identity used by paid reroll receipts before renaming request data.
    const basis = sha256(JSON.stringify([record.rule, Object.keys(record.request).sort().map(key =>
        [key, record.request[key as keyof typeof record.request]]),
        record.rule === 'd20' ? record.dc : [record.result.value, record.result.threshold,
            resolution ? [resolution.kind, resolution.kind === 'mapped' ? resolution.input : resolution.reason] : null]]));
    const { stakes, ...request } = record.request;
    return { ...record, request, ...(stakes === undefined ? {} : { context: stakes, basis }) };
}

/** Only the saved-data entry point accepts frozen formats; prose is never guessed into branches. */
export function upgradeDiceChecks(value: Record<string, unknown>) {
    return (value.schemaVersion === 1 ? readDiceChecksV1(value) : readDiceChecksV3(value)).map(upgradeCheck);
}
