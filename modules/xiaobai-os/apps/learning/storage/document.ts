import { parseLearningData } from '../../../domains/learning/data.js';
import { learningRecord, learningText, LearningValidationError } from '../../../domains/learning/profile.js';
import { learningScheduleAt } from '../../../domains/learning/schedule.js';
import type { LearningData } from '../../../domains/learning/types.js';
import { learningArray, learningTimestamp } from '../../../domains/learning/validation.js';

export const LEARNING_FILENAME = 'LittleWhiteBox_Learning.json';
export const MAX_LEARNING_WRITE_BYTES = 8 * 1024 * 1024;

export interface LearningDocument {
    schemaVersion: 2;
    revision: number;
    commitId: string;
    data: LearningData;
}

/**
 * v1 had no reading-writing, review or memory schedule. Keep settings and the grammar and vocabulary books with
 * their evidence, each starting a fresh schedule due now; the old unit, other skills' items and completions go.
 */
function upgradeV1(data: unknown, now: string): unknown {
    const value = learningRecord(data, 'learning', ['profiles']);
    return { profiles: learningArray(value.profiles, 'profiles', (raw, path) => {
        const { unit: _unit, completions: _completions, items, ...profile } = learningRecord(raw, path, ['language', 'explanationLanguage', 'selfAssessment', 'goal', 'unit', 'items', 'completions', 'voice']);
        const { voice, ...settings } = profile;
        return { ...settings, level: null, interests: null, unit: null, review: null,
            items: learningArray(items, `${path}.items`, (entry, p) => learningRecord(entry, p, ['id', 'label', 'scope', 'skill', 'evidence']))
                .filter(item => item.skill === 'grammar' || item.skill === 'vocabulary').map(item => ({ ...item, schedule: learningScheduleAt(now) })),
            completions: [], ...(voice === undefined ? {} : { voice }) };
    }) };
}

/** `now` stamps a one-time v1 upgrade; pass a stable clock so rereading the same file parses the same way. */
export function parseLearningDocument(value: unknown, now: () => string = () => new Date().toISOString()): LearningDocument {
    const item = learningRecord(value, 'document', ['schemaVersion', 'revision', 'commitId', 'data']);
    if ((item.schemaVersion !== 1 && item.schemaVersion !== 2) || !Number.isSafeInteger(item.revision) || (item.revision as number) < 1) {
        throw new LearningValidationError('document', 'Expected current schema and a positive safe revision');
    }
    const data = item.schemaVersion === 1 ? upgradeV1(item.data, learningTimestamp(now(), 'upgradedAt')) : item.data;
    return { schemaVersion: 2, revision: item.revision as number,
        commitId: learningText(item.commitId, 'commitId', 128), data: parseLearningData(data) };
}

export function sameLearningDocument(left: LearningDocument | null, right: LearningDocument | null): boolean {
    // Parsed documents have canonical key order; compare content as well as identity.
    return JSON.stringify(left) === JSON.stringify(right);
}
