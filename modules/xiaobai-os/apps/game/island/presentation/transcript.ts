import type { ExperienceView } from '../cooperation.js';

export interface TranscriptRow { event: ExperienceView; repetitions: number }

// Presentation only. Original event boundaries and audiences remain in the journal and memory.
export function transcriptRows(events: readonly ExperienceView[]): TranscriptRow[] {
    const rows: TranscriptRow[] = [];
    for (const event of events) {
        if (event.payload.kind === 'started') { continue; }
        const last = rows.at(-1), previous = last?.event.payload, current = event.payload;
        if (last && previous?.kind === 'worked' && current.kind === 'worked'
            && previous.task === 'gather' && current.task === 'gather'
            && previous.actor === current.actor && previous.target === current.target) { last.repetitions++; }
        else { rows.push({ event, repetitions: 1 }); }
    }
    return rows;
}
