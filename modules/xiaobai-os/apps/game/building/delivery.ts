import { PROJECT_WISH_TARGET, type Blueprint, type Room } from './policy.js';
import { inspect } from './rules.js';
import { memoryOpportunity } from './memories.js';

export type DeliveryWish = 'quietReading' | 'sunTerrace' | 'courtyard';

export function delivery(brief: Blueprint, rooms: Room[]) {
    const inspection = inspect(brief, rooms);
    const minimum = {
        bedroom: inspection.habitable,
        lounge: inspection.spaces.some(s => s.activity === 'relax' && !s.issue),
        outdoor: inspection.spaces.some(s => (s.activity === 'garden' || s.activity === 'sunbathe') && !s.issue),
    };
    const ready = Object.values(minimum).every(Boolean);
    const wishes: { id: DeliveryWish; met: boolean }[] = [
        { id: 'quietReading', met: inspection.spaces.some(s => s.activity === 'read' && !s.issue) },
        { id: 'sunTerrace', met: inspection.spaces.some(s => s.activity === 'sunbathe' && !s.issue) },
        { id: 'courtyard', met: !!memoryOpportunity('courtyard', brief, rooms).part },
    ];
    return { minimum, ready, bonus: ready && wishes.filter(w => w.met).length >= PROJECT_WISH_TARGET, wishes };
}
