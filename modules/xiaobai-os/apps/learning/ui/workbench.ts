/** Pure helpers for the workbench views; no Vue, no bridge, so they stay testable. */
import { measureLearningText } from '../../../domains/learning/text.js';

const DAY = 86_400_000;

/** Chinese, Japanese and Korean writing is measured in characters, the rest in words. */
export function learningWritingCount(text: string, language: string): { count: number; unit: '字' | '词' } {
    const size = measureLearningText(text, language);
    return { count: size.count, unit: size.unit === 'characters' ? '字' : '词' };
}

export interface LearningSentenceEdit { id: string; paragraphIndex: number; quote: string; replacement: string }

/**
 * Where each quote sits in one paragraph, in the given order: a quote takes its first occurrence that does not
 * overlap an earlier one, so two notes on the same words find two places. A quote with no free place is left out.
 */
export function locateLearningQuotes(paragraph: string, marks: { id: string; quote: string }[]): Map<string, number> {
    const taken: [number, number][] = [];
    const found = new Map<string, number>();
    for (const mark of marks) {
        if (!mark.quote) { continue; }
        for (let start = paragraph.indexOf(mark.quote); start >= 0; start = paragraph.indexOf(mark.quote, start + 1)) {
            const end = start + mark.quote.length;
            if (taken.some(([from, to]) => start < to && from < end)) { continue; }
            taken.push([start, end]); found.set(mark.id, start); break;
        }
    }
    return found;
}

/**
 * Rewrites the quoted sentences inside the learner's own draft. Paragraph indexes count non-blank lines,
 * the same way annotations do; blank lines and untouched text are kept as they were. Every place is found in
 * the original draft first and the edits go in right to left, so one rewrite never shifts or breaks another.
 * Pass every note of the draft (unchanged ones with their quote as replacement) so places match the marks shown.
 */
export function applyLearningSentenceRevisions(text: string, edits: LearningSentenceEdit[]): { text: string; missing: string[]; applied: string[] } {
    const lines = text.split(/(\r?\n)/u);
    const content: number[] = [];
    lines.forEach((line, index) => { if (index % 2 === 0 && line.trim()) { content.push(index); } });
    const missing: string[] = [];
    const applied: string[] = [];
    const groups = new Map<number, LearningSentenceEdit[]>();
    for (const edit of edits) { groups.set(edit.paragraphIndex, [...groups.get(edit.paragraphIndex) ?? [], edit]); }
    for (const [paragraphIndex, group] of groups) {
        const at = content[paragraphIndex];
        if (at === undefined) { missing.push(...group.map(edit => edit.id)); continue; }
        const places = locateLearningQuotes(lines[at], group);
        const placed = group.filter(edit => places.has(edit.id)).sort((left, right) => places.get(right.id)! - places.get(left.id)!);
        let line = lines[at];
        for (const edit of placed) {
            const start = places.get(edit.id)!;
            line = line.slice(0, start) + edit.replacement + line.slice(start + edit.quote.length);
            if (edit.replacement !== edit.quote) { applied.push(edit.id); }
        }
        lines[at] = line;
        missing.push(...group.filter(edit => !places.has(edit.id)).map(edit => edit.id));
    }
    const order = new Map(edits.map((edit, index) => [edit.id, index]));
    const byInput = (left: string, right: string) => order.get(left)! - order.get(right)!;
    return { text: lines.join(''), missing: missing.sort(byInput), applied: applied.sort(byInput) };
}

/** Splits one answer paragraph around the annotated quotes, placed as locateLearningQuotes places them. */
export function learningAnnotatedSegments(paragraph: string, marks: { id: string; quote: string }[]): { text: string; id?: string }[] {
    const places = locateLearningQuotes(paragraph, marks);
    const found = marks.filter(mark => places.has(mark.id)).map(mark => ({ id: mark.id, start: places.get(mark.id)!, length: mark.quote.length }))
        .sort((left, right) => left.start - right.start);
    const segments: { text: string; id?: string }[] = [];
    let cursor = 0;
    for (const mark of found) {
        if (mark.start > cursor) { segments.push({ text: paragraph.slice(cursor, mark.start) }); }
        segments.push({ text: paragraph.slice(mark.start, mark.start + mark.length), id: mark.id });
        cursor = mark.start + mark.length;
    }
    if (cursor < paragraph.length || !segments.length) { segments.push({ text: paragraph.slice(cursor) }); }
    return segments;
}

/**
 * Remembers which finished units the learner has already seen celebrated, so a finished review folds away and its
 * burst does not replay. Kept in the given storage when it works, otherwise only for this session.
 */
export function createLearningSeenUnits(storage: () => Pick<Storage, 'getItem' | 'setItem'> | null | undefined, key = 'xiaobai-learning-seen-units') {
    const session = new Set<string>();
    const stored = (): string[] => {
        try {
            const value: unknown = JSON.parse(storage()?.getItem(key) ?? '[]');
            return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
        } catch { return []; }
    };
    return {
        has: (id: string) => session.has(id) || stored().includes(id),
        mark(id: string) {
            session.add(id);
            try { storage()?.setItem(key, JSON.stringify([...new Set([...stored(), id])].slice(-50))); } catch { /* session only */ }
        },
    };
}

const browserStorage = () => { try { return globalThis.localStorage; } catch { return null; } };
export const learningSeenUnits = createLearningSeenUnits(browserStorage);

/** The small "N 天后再见" chip under a reviewed item. */
export function learningSeeAgainLabel(dueAt: string, now: string | number = Date.now()): string {
    const due = new Date(dueAt);
    const today = new Date(now);
    const days = Math.round((Date.UTC(due.getFullYear(), due.getMonth(), due.getDate()) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / DAY);
    if (!Number.isFinite(days) || days <= 0) { return '今天复习'; }
    if (days === 1) { return '明天再见'; }
    return `${days} 天后再见`;
}
