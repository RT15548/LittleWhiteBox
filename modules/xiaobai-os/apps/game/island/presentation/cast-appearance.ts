import type { PersonId } from '../model.js';

export const APPEARANCE: Record<Exclude<PersonId, 'ye'>, { skin: string; height: number; build: number;
    hair: 'short' | 'bob' | 'tied' | 'wavy'; portrait: readonly [number, number] | null }> = {
    player: { skin: '#c89575', height: 1.76, build: 1, hair: 'short', portrait: null },
    lin: { skin: '#d4a58b', height: 1.65, build: .91, hair: 'bob', portrait: [0, 0] },
    zhou: { skin: '#bc8969', height: 1.81, build: 1.08, hair: 'short', portrait: [1, 0] },
    xu: { skin: '#d0a088', height: 1.68, build: .94, hair: 'tied', portrait: [2, 0] },
    chen: { skin: '#c39376', height: 1.79, build: .97, hair: 'short', portrait: [0, 1] },
    luo: { skin: '#bd8d74', height: 1.75, build: 1.05, hair: 'short', portrait: [2, 1] },
};
