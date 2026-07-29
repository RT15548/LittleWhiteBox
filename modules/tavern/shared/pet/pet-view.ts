import {
    TAVERN_PET_CURIOS,
    tavernPetDisplayName,
    tavernPetSpecimenLabel,
} from './pet-copy';
import {
    getTavernPetPersona,
    tavernPetFaceForEmotion,
} from './pet-personas';
import {
    TAVERN_PET_INTERACTION_COSTS,
    tavernPetInteractionUnavailableReason,
} from './pet-rules';
import {
    TAVERN_PET_INTERACTION_IDS,
    type TavernPetActivityRecord,
    type TavernPetPersonaId,
    type TavernPetStateVersionRecord,
    type TavernPetView,
} from './pet-types';

const EMOTION_LABELS = Object.freeze({
    calm: '平静',
    happy: '高兴',
    aggrieved: '委屈',
    resentful: '记仇',
    excited: '兴奋',
    bored: '无聊',
});

function emptyView(playerBalance: number): TavernPetView {
    return {
        revision: 0,
        versionId: '',
        existence: 'undiscovered',
        dormant: false,
        displayName: '？？？',
        pendingEvolution: false,
        interferenceEnabled: true,
        nest: { coins: 0, curios: [] },
        availableActions: [{
            id: 'lure',
            cost: TAVERN_PET_INTERACTION_COSTS.lure,
            enabled: playerBalance >= TAVERN_PET_INTERACTION_COSTS.lure,
            reason: playerBalance >= TAVERN_PET_INTERACTION_COSTS.lure ? '' : '小白币不足',
        }],
    };
}

function phaseProgressLabel(record: TavernPetStateVersionRecord): string {
    const { state } = record;
    if (state.phase === 'luring') {return '食物少了一点。房间里还是没有东西。';}
    if (state.phase === 'egg') {
        return state.phaseTurnCount <= 4
            ? '蛋壳很安静。贴近一点，能听见里面有很轻的响动。'
            : '裂纹。有什么东西正在用头撞壳。';
    }
    if (state.phase === 'juvenile') {return '它还没有完全长定。';}
    return state.pendingEvolution
        ? '它的轮廓还在慢慢安静下来。'
        : '它正在看你。';
}

function currentFace(record: TavernPetStateVersionRecord): string {
    const { state } = record;
    if (state.phase === 'luring') {return '▓';}
    if (state.phase === 'egg') {return '(🥚)';}
    return tavernPetFaceForEmotion(state.phase, state.personaId, state.emotion);
}

function latestUtterance(
    activity: TavernPetActivityRecord | null,
    face: string,
): TavernPetView['latestUtterance'] {
    if (!activity) {return undefined;}
    const { detail } = activity;
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
    return {
        face,
        text: detail.renderedText,
        motion: detail.motion,
    };
}

function latestActivity(activities: readonly TavernPetActivityRecord[]): TavernPetActivityRecord | null {
    return [...activities].sort((left, right) => (
        right.anchorOrder - left.anchorOrder
        || right.createdAt - left.createdAt
        || right.id.localeCompare(left.id)
    ))[0] || null;
}

export function createTavernPetView(input: {
    record: TavernPetStateVersionRecord | null;
    activities?: readonly TavernPetActivityRecord[];
    currentTurn: number;
    playerBalance: number;
}): TavernPetView {
    if (!input.record) {return emptyView(input.playerBalance);}
    const record = input.record;
    const { state } = record;
    const face = currentFace(record);
    const actions = TAVERN_PET_INTERACTION_IDS.flatMap((interactionId) => {
        const reason = tavernPetInteractionUnavailableReason(
            state,
            interactionId,
            input.currentTurn,
            input.playerBalance,
        );
        const relevant = state.phase === 'luring'
            ? false
            : state.dormant
                ? interactionId === 'wake'
                : state.phase === 'egg'
                    ? ['feed', 'tap-shell', 'play-bgm'].includes(interactionId)
                    : ['feed', 'pat', 'hit', 'toy', 'chat'].includes(interactionId);
        if (!relevant) {return [];}
        return [{
            id: interactionId,
            cost: TAVERN_PET_INTERACTION_COSTS[interactionId],
            enabled: !reason,
            reason,
        }];
    });
    const activity = latestActivity(input.activities || []);
    const persona = state.personaId ? getTavernPetPersona(state.personaId) : null;
    const utterance = latestUtterance(activity, face);
    return {
        revision: record.revision,
        versionId: record.versionId,
        existence: 'present',
        phase: state.phase,
        dormant: state.dormant,
        displayName: state.phase === 'luring' ? '？？？' : state.phase === 'egg' ? '住户' : tavernPetDisplayName(state),
        specimenLabel: tavernPetSpecimenLabel(state.origin.specimenNumber),
        currentFace: face,
        ...(persona ? { persona: { id: persona.id as TavernPetPersonaId, displayName: persona.displayName } } : {}),
        ...(state.phase === 'luring' ? {} : {
            satietyPercent: state.satiety,
            emotionLabel: EMOTION_LABELS[state.emotion],
            phaseProgressLabel: phaseProgressLabel(record),
            storageMb: Math.trunc(state.lifetimeStats.feedCount / 50) + 1,
        }),
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
        ...(utterance ? { latestUtterance: utterance } : {}),
        availableActions: actions,
    };
}
