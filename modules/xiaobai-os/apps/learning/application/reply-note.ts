import type { LearningNote, LearningSelection } from '../../../domains/learning/notes.js';

/** Availability and duplicate detection are shared by the note button and the save command. */
export function learningReplyNote(unit: { id: string; exercises: { id: string }[]; notes?: LearningNote[] } | null | undefined,
    reply: { unitId?: string; exerciseId?: string; text: string; selection?: LearningSelection | null } | null) {
    if (!unit || unit.id !== reply?.unitId || !reply.exerciseId || !unit.exercises.some(entry => entry.id === reply.exerciseId)) { return null; }
    const note = { exerciseId: reply.exerciseId, text: reply.text, selection: reply.selection ?? null };
    const saved = unit.notes?.some(entry => entry.exerciseId === note.exerciseId && entry.text === note.text
        && JSON.stringify(entry.selection) === JSON.stringify(note.selection)) ?? false;
    return { note, saved };
}
