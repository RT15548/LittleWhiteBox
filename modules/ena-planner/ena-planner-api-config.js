import { TEXT_API_COPY } from '../text-api/copy.js';

export function assertPlannerPresetReady(preset) {
    if (!String(preset?.apiKey || '').trim()) throw new Error(TEXT_API_COPY.plannerKey);
}
