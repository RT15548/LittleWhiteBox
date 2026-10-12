/** Settings (explanationLanguage, level, goal.exam, goal.targetLevel, interests): null means the product default. */
export interface LearningProfile {
    language: string;
    explanationLanguage: string;
    /** Empty until the learner states it. */
    selfAssessment: string;
    level: string | null;
    interests: string | null;
    goal: {
        /** Empty until the learner states it. */
        description: string;
        exam: string | null;
        targetLevel: string | null;
        targetDate: string | null;
    };
}

export interface LearningTeacherPreference {
    teacher: { name: string; note: string } | null;
}

export class LearningValidationError extends Error {
    constructor(readonly path: string, message: string) { super(`${path}: ${message}`); }
}

export function learningRecord(value: unknown, path: string, keys: readonly string[]): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new LearningValidationError(path, 'Expected an object');
    }
    for (const key of Object.keys(value)) {
        if (!keys.includes(key)) { throw new LearningValidationError(`${path}.${key}`, 'Unsupported field'); }
    }
    return value as Record<string, unknown>;
}

export function learningText(value: unknown, path: string, max: number, allowEmpty = false): string {
    if (typeof value !== 'string' || (!allowEmpty && !value.trim()) || [...value].length > max) {
        throw new LearningValidationError(path, `Expected ${allowEmpty ? '' : 'non-empty '}text, at most ${max} code points`);
    }
    return value;
}

function nullableText(value: unknown, path: string, max: number): string | null {
    return value === null ? null : learningText(value, path, max);
}

export function parseLearningLanguageTag(value: unknown, path: string): string {
    const text = learningText(value, path, 80);
    try { return Intl.getCanonicalLocales(text)[0]; }
    catch { throw new LearningValidationError(path, 'Expected a language tag'); }
}

function targetDate(value: unknown, path: string): string | null {
    if (value === null) { return null; }
    const text = learningText(value, path, 10);
    const date = new Date(`${text}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== text) {
        throw new LearningValidationError(path, 'Expected a calendar date (YYYY-MM-DD)');
    }
    return text;
}

export function parseLearningProfile(value: unknown, path = 'profile'): LearningProfile {
    const item = learningRecord(value, path, ['language', 'explanationLanguage', 'selfAssessment', 'level', 'interests', 'goal']);
    const goal = learningRecord(item.goal, `${path}.goal`, ['description', 'exam', 'targetLevel', 'targetDate']);
    return {
        language: parseLearningLanguageTag(item.language, `${path}.language`),
        explanationLanguage: parseLearningLanguageTag(item.explanationLanguage, `${path}.explanationLanguage`),
        selfAssessment: learningText(item.selfAssessment, `${path}.selfAssessment`, 800, true),
        level: nullableText(item.level, `${path}.level`, 80),
        interests: nullableText(item.interests, `${path}.interests`, 800),
        goal: {
            description: learningText(goal.description, `${path}.goal.description`, 800, true),
            exam: nullableText(goal.exam, `${path}.goal.exam`, 80),
            targetLevel: nullableText(goal.targetLevel, `${path}.goal.targetLevel`, 80),
            targetDate: targetDate(goal.targetDate, `${path}.goal.targetDate`),
        },
    };
}

export const LEARNING_DEFAULT_EXPLANATION_LANGUAGE = 'zh-CN';

export function defaultLearningProfile(language: string): LearningProfile {
    return parseLearningProfile({ language, explanationLanguage: LEARNING_DEFAULT_EXPLANATION_LANGUAGE, selfAssessment: '',
        level: null, interests: null, goal: { description: '', exam: null, targetLevel: null, targetDate: null } });
}

export function parseTeacherPreference(value: unknown): LearningTeacherPreference {
    const item = learningRecord(value, 'learning', ['teacher']);
    if (item.teacher === null) { return { teacher: null }; }
    const teacher = learningRecord(item.teacher, 'teacher', ['name', 'note']);
    return { teacher: {
        name: learningText(teacher.name, 'teacher.name', 80),
        note: learningText(teacher.note, 'teacher.note', 800, true),
    } };
}
