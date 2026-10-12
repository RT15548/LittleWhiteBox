import { COPY } from './copy.js';
import { mascotOutfitPortrait } from '../../../brand/mascot/svg.js';
import { BUILDER_OUTFIT } from './outfit.js';
export const BUILDING_GAME = { id: 'building', name: COPY.name, category: COPY.category, tagline: COPY.tagline,
    description: COPY.description, entry: COPY.entry, mark: COPY.mark, tone: 'building', mascotPortrait: mascotOutfitPortrait(BUILDER_OUTFIT) } as const;
