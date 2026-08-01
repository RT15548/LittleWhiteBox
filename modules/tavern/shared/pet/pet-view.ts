import {
    getTavernPetMomentCopy,
    TAVERN_PET_CURIOS,
    tavernPetDisplayName,
    tavernPetSpecimenLabel,
} from './pet-copy';
import { getTavernPetPersona, tavernPetFaceForEmotion } from './pet-personas';
import { TAVERN_PET_INTERACTION_COSTS, tavernPetInteractionUnavailableReason } from './pet-rules';
import {
    TAVERN_PET_INTERACTION_IDS,
    type TavernPetCompanionRecord,
    type TavernPetJournalRecord,
    type TavernPetView,
} from './pet-types';

const EMOTION_LABELS = Object.freeze({
    calm: '平静',
    happy: '高兴',
    aggrieved: '委屈',
    resentful: '记着气',
    excited: '来劲',
    bored: '没意思',
});

function appetiteLabel(appetite: number): string {
    if (appetite >= 85) {return '吃撑了';}
    if (appetite >= 55) {return '不饿';}
    if (appetite >= 25) {return '有点饿';}
    return '很饿';
}

function emptyView(playerBalance: number): TavernPetView {
    const cost = TAVERN_PET_INTERACTION_COSTS.lure;
    return {
        revision: 0,
        versionId: '',
        existence: 'undiscovered',
        displayName: '暗室空着',
        guidance: {
            kind: 'arrival',
            text: '角落里有只空碟。放点什么，也许会有东西闻着味道过来。',
        },
        pendingEvolution: false,
        interferenceEnabled: true,
        nest: { coins: 0, curios: [] },
        availableActions: [{
            id: 'lure',
            cost,
            enabled: playerBalance >= cost,
            reason: playerBalance >= cost ? '' : '小白币不足',
        }],
    };
}

function phaseProgressLabel(companion: TavernPetCompanionRecord): string {
    const { state } = companion;
    if (state.phase === 'egg') {return '蛋壳里面有很轻的响动。';}
    if (state.phase === 'juvenile') {return '它正在用自己的方式长大。';}
    return state.pendingEvolution
        ? '它的轮廓正在慢慢安静下来。'
        : '它正在过自己的日子。';
}

function currentFace(companion: TavernPetCompanionRecord): string {
    const { state } = companion;
    return state.phase === 'egg'
        ? '(🥚)'
        : tavernPetFaceForEmotion(state.phase, state.personaId, state.emotion);
}

function currentGuidance(companion: TavernPetCompanionRecord): TavernPetView['guidance'] {
    const { state } = companion;
    if (state.phase === 'egg') {
        return {
            kind: 'egg',
            text: '蛋壳偶尔轻轻一响。外面的故事往前走一步，回来时它也许就醒了。',
        };
    }
    if (state.pendingMoment) {
        return { kind: 'moment', text: '它今天好像有件事没说完。' };
    }
    if (state.lifetimeStats.chatCount === 0) {
        return { kind: 'first-chat', text: '它刚学会认你的声音，正等着你先开口。' };
    }
    if (state.appetite <= 24) {
        return { kind: 'hunger', text: '它看了眼空碟，又假装没看。' };
    }
    return undefined;
}

function latestJournal(journal: readonly TavernPetJournalRecord[]): TavernPetJournalRecord | null {
    return [...journal].sort((left, right) => (
        right.petTurn - left.petTurn
        || right.createdAt - left.createdAt
        || right.id.localeCompare(left.id)
    ))[0] || null;
}

function latestUtterance(
    journal: TavernPetJournalRecord | null,
    face: string,
): TavernPetView['latestUtterance'] {
    if (!journal) {return undefined;}
    const { detail } = journal;
    if (detail.kind === 'event') {
        return { face: detail.face, text: detail.renderedText, motion: detail.motion };
    }
    if (detail.kind === 'chat') {
        return {
            face: detail.face,
            text: detail.petText,
            motion: detail.motion,
            ...(detail.murmur ? { murmur: detail.murmur } : {}),
        };
    }
    return { face, text: detail.renderedText, motion: detail.motion };
}

export function createTavernPetView(input: {
    companion: TavernPetCompanionRecord | null;
    journal?: readonly TavernPetJournalRecord[];
    playerBalance: number;
}): TavernPetView {
    if (!input.companion) {return emptyView(input.playerBalance);}
    const companion = input.companion;
    const { state } = companion;
    const face = currentFace(companion);
    const availableActions = TAVERN_PET_INTERACTION_IDS.flatMap((id) => {
        if (id === 'lure') {return [];}
        if (state.phase === 'egg' && id !== 'feed') {return [];}
        const reason = tavernPetInteractionUnavailableReason(state, id, input.playerBalance);
        return [{ id, cost: TAVERN_PET_INTERACTION_COSTS[id], enabled: !reason, reason }];
    });
    const latest = latestJournal(input.journal || []);
    const guidance = currentGuidance(companion);
    const persona = state.personaId
        ? { id: state.personaId, displayName: getTavernPetPersona(state.personaId).displayName }
        : null;
    const pendingMoment = state.pendingMoment
        ? (() => {
            const moment = getTavernPetMomentCopy(state.pendingMoment.id);
            return {
                id: state.pendingMoment.id,
                prompt: moment.prompt,
                choices: moment.options.map((option) => ({ id: option.id, label: option.label })),
            };
        })()
        : undefined;
    return {
        revision: companion.revision,
        versionId: companion.versionId,
        existence: 'present',
        phase: state.phase,
        displayName: state.phase === 'egg' ? '住户' : tavernPetDisplayName(state),
        specimenLabel: tavernPetSpecimenLabel(state.origin.specimenNumber),
        currentFace: face,
        ...(persona ? { persona } : {}),
        appetiteLabel: appetiteLabel(state.appetite),
        emotionLabel: EMOTION_LABELS[state.emotion],
        phaseProgressLabel: phaseProgressLabel(companion),
        ...(guidance ? { guidance } : {}),
        ...(pendingMoment ? { pendingMoment } : {}),
        pendingEvolution: Boolean(state.pendingEvolution),
        interferenceEnabled: state.interferenceEnabled,
        nest: {
            coins: state.nestCoins,
            curios: state.curios.map((id) => ({
                id,
                label: TAVERN_PET_CURIOS[id].label,
                description: TAVERN_PET_CURIOS[id].description,
            })),
        },
        ...(latestUtterance(latest, face) ? { latestUtterance: latestUtterance(latest, face) } : {}),
        availableActions,
    };
}
