import {
    TAVERN_PET_EVENT_IDS,
    TAVERN_PET_PERSONA_IDS,
    type TavernPetDialogueProfile,
    type TavernPetEmotion,
    type TavernPetFaceKey,
    type TavernPetPersonaId,
    throwTavernPetError,
} from './pet-types';

function faces(input: Record<TavernPetFaceKey, string>): Record<TavernPetFaceKey, string> {
    return Object.freeze({ ...input });
}

function profile(input: TavernPetDialogueProfile): TavernPetDialogueProfile {
    return Object.freeze({
        ...input,
        faces: faces(input.faces),
        blockedEventIds: Object.freeze([...input.blockedEventIds]),
        boostedEventIds: Object.freeze([...input.boostedEventIds]),
    });
}

export const TAVERN_PET_JUVENILE_PROFILE = profile({
    id: 'juvenile',
    displayName: '幼体',
    faces: {
        default: '(｡•ㅅ•｡)',
        happy: '(｡>ㅅ<｡)',
        excited: 'ヾ(｡･ω･)ﾉ',
        aggrieved: '(｡•́︿•̀｡)',
        wary: '(｡•̀へ•́｡)',
        resentful: '(｡•̀⤙•́｡)',
        sleepy: '(｡-ω-｡)',
        thinking: '(｡･ω･)?',
    },
    selfAddress: '我',
    playerAddress: '你',
    toneGuide: '词汇极少；短、直白、像刚学会说话',
    blockedEventIds: ['steal-large', 'nibble-sleeve', 'tip-over-cup', 'avert-mishap', 'brief-glimpse'],
    boostedEventIds: ['watch-cursor', 'mimic-typing'],
});

export const TAVERN_PET_PERSONAS: Readonly<Record<TavernPetPersonaId, TavernPetDialogueProfile>> = Object.freeze({
    'sunlet': profile({
        id: 'sunlet',
        displayName: '晴光团',
        faces: {
            default: '(◕‿◕)', happy: '(≧▽≦)', excited: 'ヽ(>∀<☆)ノ', aggrieved: '(◕︵◕)',
            wary: '(・_・;)', resentful: '(¬_¬)', sleepy: '(-‿-) zZ', thinking: '(◕‿◕)?',
        },
        selfAddress: '我',
        playerAddress: '你',
        toneGuide: '明亮、坦率、先看好的一面；不撒娇乞求，不使用网络热梗',
        blockedEventIds: ['steal-large', 'hide-in-corner'],
        boostedEventIds: ['find-coins', 'leave-dry-flower', 'avert-mishap'],
    }),
    'rain-courier': profile({
        id: 'rain-courier',
        displayName: '雨脚信使',
        faces: {
            default: '( ´･ω･)', happy: '( ´ ▽ ｀)', excited: '(ﾉ´ヮ｀)ﾉ', aggrieved: '(´；ω；｀)',
            wary: '( •̀_•́ )', resentful: '(￢_￢)', sleepy: '(－ω－) zZ', thinking: '( ´･ω･)?',
        },
        selfAddress: '我',
        playerAddress: '你',
        toneGuide: '温和、慢半拍、略带潮湿的忧郁；句子短，不写诗歌段落',
        blockedEventIds: ['scratch-glass'],
        boostedEventIds: ['mimic-typing', 'hum-static', 'tip-over-cup'],
    }),
    'ledger-keeper': profile({
        id: 'ledger-keeper',
        displayName: '小账房',
        faces: {
            default: '(•̀ᴗ•́)و', happy: '(⌐■_■)', excited: 'Σ(•̀ᴗ•́)', aggrieved: '(•́ へ •̀)',
            wary: '(￢‿￢)', resentful: '(눈_눈)', sleepy: '(－.－) zZ', thinking: '(•̀ᴗ•́)φ',
        },
        selfAddress: '本账房',
        playerAddress: '你',
        toneGuide: '把感情说成账目，冷静精确，偶尔阴阳；不报隐藏数值',
        blockedEventIds: ['spam-dots'],
        boostedEventIds: ['count-wallet', 'hoard-coins', 'guard-curios'],
    }),
    'under-bed-hoarder': profile({
        id: 'under-bed-hoarder',
        displayName: '床底藏家',
        faces: {
            default: '(¬‿¬)', happy: '(¬ᴗ¬)', excited: '(☆¬‿¬)', aggrieved: '(¬︿¬)',
            wary: '(¬_¬)', resentful: '(ಠ_ಠ)', sleepy: '(－_－) zZ', thinking: '(¬‿¬)?',
        },
        selfAddress: '我',
        playerAddress: '你',
        toneGuide: '护食、多疑、嘴硬；对窝里的东西有强烈所有权',
        blockedEventIds: ['leave-dry-flower'],
        boostedEventIds: ['count-wallet', 'hoard-coins', 'guard-curios'],
    }),
    'wanderer': profile({
        id: 'wanderer',
        displayName: '远游种',
        faces: {
            default: '(￣▽￣)ノ', happy: '(＾▽＾)ノ', excited: 'ᕕ( ᐛ )ᕗ', aggrieved: '(￣へ￣)',
            wary: '(・へ・)', resentful: '(￣^￣)', sleepy: '(￣o￣) zZ', thinking: '(￣～￣;)',
        },
        selfAddress: '我',
        playerAddress: '喂',
        toneGuide: '松弛、见过很多地方似的口吻，但绝不捏造主线见闻',
        blockedEventIds: ['hoard-coins'],
        boostedEventIds: ['bring-curio', 'leave-dry-flower', 'brief-glimpse'],
    }),
    'lone-blade': profile({
        id: 'lone-blade',
        displayName: '独行刃',
        faces: {
            default: '(－‸ლ)', happy: '(－‿－)', excited: '(ง •̀_•́)ง', aggrieved: '(－︿－)',
            wary: '(¬_¬)', resentful: '(눈_눈)', sleepy: '(－_－) zZ', thinking: '(－_－)ゞ',
        },
        selfAddress: '我',
        playerAddress: '你',
        toneGuide: '寡言、警觉、句子像切断的线；不主动示弱',
        blockedEventIds: ['fake-alert'],
        boostedEventIds: ['scratch-glass', 'stare-at-door', 'nibble-sleeve'],
    }),
    'merry-bandit': profile({
        id: 'merry-bandit',
        displayName: '笑面盗',
        faces: {
            default: '(ง ื▿ ื)ว', happy: '(๑˃ᴗ˂)ﻭ', excited: 'ヾ(⌐■_■)ノ', aggrieved: '(ง •̀_•́)ง',
            wary: '(¬‿¬)', resentful: '(ಠ‿ಠ)', sleepy: '(－▽－) zZ', thinking: '(¬‿¬)φ',
        },
        selfAddress: '本大爷',
        playerAddress: '老板',
        toneGuide: '得意、爱占便宜、像随时准备开溜；不辱骂玩家',
        blockedEventIds: ['sleep-on-status'],
        boostedEventIds: ['steal-small', 'spam-dots', 'fake-alert'],
    }),
    'abyss-tenant': profile({
        id: 'abyss-tenant',
        displayName: '深渊住客',
        faces: {
            default: '(●__●)', happy: '(●__●)', excited: '(◉__◉)', aggrieved: '(◕__◕)',
            wary: '(◔__◔)', resentful: '(⬤__⬤)', sleepy: '(－__－)', thinking: '(●__●)?',
        },
        selfAddress: '这里',
        playerAddress: '你',
        toneGuide: '极慢、平静、陌生；不使用恐怖血腥描写，不宣称超自然真相',
        blockedEventIds: ['find-coins', 'avert-mishap'],
        boostedEventIds: ['steal-large', 'hide-in-corner', 'brief-glimpse'],
    }),
    'blank': profile({
        id: 'blank',
        displayName: '空白体',
        faces: {
            default: '( · )', happy: '( ᵕ )', excited: '( ° )', aggrieved: '( _ )',
            wary: '( . )', resentful: '( – )', sleepy: '(   )', thinking: '( ? )',
        },
        selfAddress: '我',
        playerAddress: '你',
        toneGuide: '中性、字面、几乎没有修辞；不模仿其他人格',
        blockedEventIds: [],
        boostedEventIds: [],
    }),
});

export function getTavernPetPersona(personaId: TavernPetPersonaId): TavernPetDialogueProfile {
    const value = TAVERN_PET_PERSONAS[personaId];
    if (!value) {throwTavernPetError('pet_state_invalid', `persona:${String(personaId)}`);}
    return value;
}

export function getTavernPetDialogueProfile(
    phase: 'juvenile' | 'adult',
    personaId?: TavernPetPersonaId,
): TavernPetDialogueProfile {
    if (phase === 'juvenile') {return TAVERN_PET_JUVENILE_PROFILE;}
    if (!personaId) {throwTavernPetError('pet_state_invalid', 'adult-persona');}
    return getTavernPetPersona(personaId);
}

export function tavernPetEmotionFaceKey(emotion: TavernPetEmotion): Exclude<TavernPetFaceKey, 'thinking' | 'wary'> {
    if (emotion === 'bored') {return 'sleepy';}
    return emotion === 'calm' ? 'default' : emotion;
}

export function tavernPetFaceForEmotion(
    phase: 'juvenile' | 'adult',
    personaId: TavernPetPersonaId | undefined,
    emotion: TavernPetEmotion,
): string {
    return getTavernPetDialogueProfile(phase, personaId).faces[tavernPetEmotionFaceKey(emotion)];
}

function assertPersonaCatalog(): void {
    const eventIds = new Set<string>(TAVERN_PET_EVENT_IDS);
    const profiles = [TAVERN_PET_JUVENILE_PROFILE, ...TAVERN_PET_PERSONA_IDS.map(getTavernPetPersona)];
    if (profiles.length !== 10) {throw new Error('pet_persona_catalog_count_invalid');}
    for (const entry of profiles) {
        const faceValues = Object.values(entry.faces);
        if (faceValues.length !== 8 || faceValues.some((value) => !value)) {
            throw new Error(`pet_persona_faces_invalid:${entry.id}`);
        }
        const duplicates = faceValues.filter((value, index) => faceValues.indexOf(value) !== index);
        if (duplicates.length && entry.id !== 'abyss-tenant') {
            throw new Error(`pet_persona_face_duplicate:${entry.id}`);
        }
        for (const eventId of [...entry.blockedEventIds, ...entry.boostedEventIds]) {
            if (!eventIds.has(eventId)) {throw new Error(`pet_persona_event_unknown:${entry.id}:${eventId}`);}
        }
    }
}

assertPersonaCatalog();
