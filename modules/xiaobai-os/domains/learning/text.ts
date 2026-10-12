/** The same writing measure is used by the counter and reading-material checks. */
export function measureLearningText(text: string, language: string): { count: number; unit: 'characters' | 'words' } {
    if (/^(zh|ja|ko)\b/iu.test(language)) {
        return { count: [...text.replace(/[\s\p{P}\p{S}]/gu, '')].length, unit: 'characters' };
    }
    return { count: text.match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}'’-]*/gu)?.length ?? 0, unit: 'words' };
}
