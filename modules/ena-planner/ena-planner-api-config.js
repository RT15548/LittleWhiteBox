import { TEXT_API_COPY } from '../text-api/copy.js';
import { HOST_PROVIDER } from '../text-api/model.js';
import { PLANNER_COPY } from './ena-planner-copy.js';

export function assertPlannerPresetReady(preset) {
    if (preset?.provider === HOST_PROVIDER) throw new Error(PLANNER_COPY.independentApi);
    if (!String(preset?.apiKey || '').trim()) throw new Error(TEXT_API_COPY.plannerKey);
}
