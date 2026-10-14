import type { CourtyardFact, CourtyardScene } from './world-types.js';
import { isPerson, isStoryPerson, type Participant } from './participants.js';
import { STORY_PEOPLE } from './inner-city/people.js';
import { COURTYARD } from './courtyard.js';
import { PERSON_PLACES } from './people-places.js';
import type { Campaign } from '../campaign/types.js';
import { INTERACTION_REACH } from '../world/exploration.js';
import { districtScene } from './living-spaces.js';
import { CITY_ACTIONS } from './inner-city/actions.js';
import { RESCUE_COMPLETE } from './chapters.js';

export interface CampaignAction {
    people: readonly Participant[];
    requires: readonly CourtyardFact[];
    fact: CourtyardFact;
    atClinic?: boolean;
    district?: CourtyardScene;
    scenes?: readonly CourtyardScene[];
    excludes?: readonly CourtyardFact[];
    minPeak?: number;
    confirm?: boolean;
    escort?: boolean;
    present?: readonly Participant[];
    witnesses?: readonly Participant[];
    meaning: string;
    feedback?: { pending: string; applied: string };
}
/** Confirmed story changes. Everyday interaction lives in the character's dialogue. */
export const CAMPAIGN_ACTIONS = {
    ...CITY_ACTIONS,
    briefing: { district: 'camp', atClinic: false, people: ['sanniang', 'laobai'], requires: [], fact: 'briefed',
        meaning: '玩家明确愿意去哨站救人时提交，确认接下救援委托、开放营地外的路线。对白说明正门与旧水道两条路线；是否邀你同行另算，实际救援由探索完成。' },
    receiving: { district: 'camp', atClinic: false, people: ['laobai'], requires: [], fact: 'receiving_arranged',
        meaning: '玩家请求或接受担架接应，老白答应安排时提交。牢门、小门打开且玩家回到檐下后，担架队接回仍留在牢房等候的人；已跟随或自行离开的人继续自己的行程。' },
    finish: { district: 'camp', confirm: true, atClinic: false, people: ['sanniang'], requires: RESCUE_COMPLETE, fact: 'chapter_completed',
        meaning: '与玩家核对回来的两个人和药材后提交收尾。玩家读完并继续后确认救援结束，内堡门厅以北通往南街。' },
    clinic: { district: 'camp', atClinic: true, people: ['sanniang'], requires: ['captives_arrived', 'supplies_secured'], fact: 'clinic_helped',
        meaning: '玩家帮三娘归置归还的药材、你在对白中回应这次协助时提交。记录共同经历，好感和态度由你另行判断。' },
} satisfies Record<string, CampaignAction>;
export type CampaignChoice = keyof typeof CAMPAIGN_ACTIONS;
export const CAMPAIGN_CHOICES = Object.keys(CAMPAIGN_ACTIONS) as CampaignChoice[];
export function campaignAction(id: string | null): CampaignAction | undefined {
    return id && Object.hasOwn(CAMPAIGN_ACTIONS, id) ? CAMPAIGN_ACTIONS[id as CampaignChoice] : undefined;
}
export function availableChoices(campaign: Campaign, person: Participant): CampaignChoice[] {
    if (!isPerson(person) && !isStoryPerson(person)) { return []; }
    const { facts } = campaign, scene = isPerson(person) ? campaign.people[person].scene : STORY_PEOPLE[person].scene;
    return CAMPAIGN_CHOICES.filter(id => {
        if (id === 'receiving' && facts.includes('captives_arrived')) { return false; }
        const action: CampaignAction = CAMPAIGN_ACTIONS[id];
        if (action.district && districtScene(scene) !== action.district
            || action.scenes && !action.scenes.includes(scene)
            || action.excludes?.some(fact => facts.includes(fact))
            || action.minPeak !== undefined && (!isPerson(person) || campaign.relationships[person].highestBand < action.minPeak)
            || action.present?.some(id => (isPerson(id) ? campaign.people[id].scene : isStoryPerson(id) ? STORY_PEOPLE[id].scene : null) !== scene)) { return false; }
        if (action.atClinic) {
            if (!isPerson(person)) { return false; }
            const location = campaign.people[person], home = PERSON_PLACES[person].station, point = COURTYARD[home.scene].anchors[home.anchor];
            if (scene !== 'clinic_front' && !(scene === home.scene && Math.hypot(location.position.x - point.x, location.position.y - point.y) <= INTERACTION_REACH)) { return false; }
        }
        return action.people.includes(person) && !facts.includes(action.fact) && action.requires.every(f => facts.includes(f));
    });
}
