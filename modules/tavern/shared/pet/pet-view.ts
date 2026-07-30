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
    type TavernPetCompanionRecord,
    type TavernPetJournalRecord,
    type TavernPetPersonaId,
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

function phaseProgressLabel(companion: TavernPetCompanionRecord): string {
    const { state } = companion;
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

function currentFace(companion: TavernPetCompanionRecord): string {
    const { state } = companion;
    if (state.phase === 'luring') {return '◌';}
    if (state.phase === 'egg') {return '(🥚)';}
    return tavernPetFaceForEmotion(state.phase, state.personaId, state.emotion);
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
    return {
        face,
        text: detail.renderedText,
        motion: detail.motion,
    };
}

function latestJournal(journal: readonly TavernPetJournalRecord[]): TavernPetJournalRecord | null {
    return [...journal].sort((left, right) => (
        right.petTurn - left.petTurn
        || right.createdAt - left.createdAt
        || right.id.localeCompare(left.id)
    ))[0] || null;
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
    const actions = TAVERN_PET_INTERACTION_IDS.flatMap((interactionId) => {
        const reason = tavernPetInteractionUnavailableReason(
            state,
            interactionId,
            state.petTurn,
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
    const journal = latestJournal(input.journal || []);
    const persona = state.personaId ? getTavernPetPersona(state.personaId) : null;
    const utterance = latestUtterance(journal, face);
    return {
        revision: companion.revision,
        versionId: companion.versionId,
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
            phaseProgressLabel: phaseProgressLabel(companion),
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
