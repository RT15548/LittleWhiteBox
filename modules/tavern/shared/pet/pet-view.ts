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
