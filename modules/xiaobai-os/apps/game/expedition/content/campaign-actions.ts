import type { CourtyardFact, CourtyardPerson } from './world-types.js';
import { COURTYARD } from './courtyard.js';
import { PERSON_PLACES } from './people-places.js';
import type { PersonLocation } from '../world/people.js';
import { INTERACTION_REACH } from '../world/exploration.js';
import { districtScene } from './living-spaces.js';

interface CampaignAction {
    people: readonly CourtyardPerson[];
    requires: readonly CourtyardFact[];
    fact: CourtyardFact;
    atClinic: boolean;
    meaning: string;
}
/** Confirmed story changes. Everyday interaction lives in the character's dialogue. */
export const CAMPAIGN_ACTIONS = {
    briefing: { atClinic: false, people: ['sanniang', 'laobai'], requires: [], fact: 'briefed',
        meaning: '玩家明确愿意去哨站救人时提交，确认接下救援委托、开放营地外的路线。对白说明正门与旧水道两条路线；是否邀你同行另算，实际救援由探索完成。' },
    receiving: { atClinic: false, people: ['laobai'], requires: [], fact: 'receiving_arranged',
        meaning: '玩家请求或接受担架接应，老白答应安排时提交。牢门、小门打开且玩家回到檐下后，担架队接回仍留在牢房等候的人；已跟随或自行离开的人继续自己的行程。' },
    finish: { atClinic: false, people: ['sanniang'], requires: ['captives_arrived', 'supplies_secured', 'warden_defeated'], fact: 'chapter_completed',
        meaning: '与玩家核对回来的两个人和药材后提交收尾。玩家读完并继续后结算这一章。第二章尚未开放。' },
    clinic: { atClinic: true, people: ['sanniang'], requires: ['captives_arrived', 'supplies_secured'], fact: 'clinic_helped',
        meaning: '玩家帮三娘归置归还的药材、你在对白中回应这次协助时提交。记录共同经历，好感和态度由你另行判断。' },
} satisfies Record<string, CampaignAction>;
export type CampaignChoice = keyof typeof CAMPAIGN_ACTIONS;
export const CAMPAIGN_CHOICES = Object.keys(CAMPAIGN_ACTIONS) as CampaignChoice[];
export function availableChoices(facts: readonly CourtyardFact[], person: CourtyardPerson, location: PersonLocation): CampaignChoice[] {
    if (districtScene(location.scene) !== 'camp') { return []; }
    return CAMPAIGN_CHOICES.filter(id => {
        if (id === 'receiving' && facts.includes('captives_arrived')) { return false; }
        const action: CampaignAction = CAMPAIGN_ACTIONS[id];
        const home = PERSON_PLACES[person].station, point = COURTYARD[home.scene].anchors[home.anchor];
        const atClinic = location.scene === 'clinic_front' || location.scene === home.scene
            && Math.hypot(location.position.x - point.x, location.position.y - point.y) <= INTERACTION_REACH;
        if (action.atClinic && !atClinic) { return false; }
        return action.people.includes(person) && !facts.includes(action.fact) && action.requires.every(f => facts.includes(f));
    });
}
