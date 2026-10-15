import type { Campaign } from '../campaign/types.js';
import type { Participant } from '../content/participants.js';
import { INNER_CITY_FACTS, type InnerCityFact } from '../content/inner-city/facts.js';
import { isCityDistrict } from '../content/inner-city/places.js';
import { districtScene } from '../content/living-spaces.js';
import { STORY_PEOPLE } from '../content/inner-city/people.js';
import { CITY_COPY } from '../content/inner-city/copy.js';
import { CITY_THREADS } from '../content/inner-city/progress.js';

/** Present facts, not a quest walkthrough. Private changes reach only their parties or actual witnesses. */
export function citySituation(campaign: Campaign, person: Participant) {
    const facts = new Set(campaign.facts), known = new Set(campaign.knowledge[person]);
    const current: InnerCityFact[] = [];
    const personScene = person in STORY_PEOPLE ? STORY_PEOPLE[person as keyof typeof STORY_PEOPLE].scene
        : person in campaign.people ? campaign.people[person as keyof typeof campaign.people].scene : campaign.location.scene;
    const inCity = isCityDistrict(districtScene(personScene));
    if (facts.has('heat_restored')) { current.push('heat_restored'); }
    else if (known.has('heat_notice_read') || inCity) { current.push('heat_notice_read'); }
    const resolved = CITY_THREADS.flatMap(thread => {
        const latest = thread.resolved.find(fact => facts.has(fact));
        return latest ? [latest as InnerCityFact] : [];
    });
    resolved.push('worker_record_corrected');
    for (const fact of resolved) {
        const ownRecord = person === 'chenhe' && fact === 'worker_record_corrected' && facts.has('worker_result_delivered');
        if (facts.has(fact) && (known.has(fact) || ownRecord)) { current.push(fact); }
    }
    if (person === 'kouzi' && facts.has('kouzi_entered_city')) { current.push('kouzi_entered_city'); }
    if (!facts.has('heat_restored') && known.has('return_flow_tested')) { current.push('return_flow_tested'); }
    return current.map(id => ({ id, situation: id === 'heat_notice_read'
        ? CITY_COPY.heatSituation
        : person === 'chenhe' && id === 'worker_record_corrected' ? CITY_COPY.workerCorrected : INNER_CITY_FACTS[id] }));
}
