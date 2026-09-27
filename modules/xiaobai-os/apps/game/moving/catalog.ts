import { MOVING_COPY } from './copy.js';

export const MOVING_GAME = {
    id: 'moving', name: MOVING_COPY.name, category: MOVING_COPY.category, tagline: MOVING_COPY.tagline,
    description: MOVING_COPY.description, entry: MOVING_COPY.entry, mark: MOVING_COPY.mark, tone: 'moving',
} as const;
