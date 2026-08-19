import { getTavernPetPersona, TAVERN_PET_JUVENILE_PROFILE } from '../../../../../shared/pet/pet-personas';
import type {
    TavernPetJournalRecord,
    TavernPetMotion,
    TavernPetView,
} from '../../../../../shared/pet/pet-types';

export const TAVERN_PET_REBUFF_FACE = '(￣ヘ￣)';

const MILESTONE_LABELS = Object.freeze({
    arrival: '它来了',
    hatch: '破壳',
    adulthood: '长成',
    repattern: '变了模样',
});

export interface TavernPetJournalRow {
    id: string;
    kind: 'event' | 'milestone' | 'chat' | 'moment';
    label: string;
    text: string;
    coinDelta: number;
    createdAt: number;
    timeLabel: string;
}

export interface TavernPetUtterancePresentation {
    key: string;
    face: string;
    text: string;
    motion: TavernPetMotion;
    murmur?: string;
}

function journalText(entry: TavernPetJournalRecord): string {
    return entry.detail.kind === 'chat' ? entry.detail.petText : entry.detail.renderedText;
}

function journalLabel(entry: TavernPetJournalRecord): string {
    const { detail } = entry;
    if (detail.kind === 'chat') {return '它回应了';}
    if (detail.kind === 'moment') {return detail.choiceId === 'skip' ? '它收回了心事' : '相处片段';}
    if (detail.kind === 'milestone') {return MILESTONE_LABELS[detail.milestoneId];}
    if (entry.coinDelta > 0) {return `带回 ${entry.coinDelta} 小白币`;}
    if (entry.coinDelta < 0) {return `拿走 ${Math.abs(entry.coinDelta)} 小白币`;}
    return '留下痕迹';
}

function timeLabel(createdAt: number): string {
    const date = new Date(createdAt);
    if (!Number.isFinite(date.getTime())) {return '';}
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function projectTavernPetJournalRows(journal: readonly TavernPetJournalRecord[]): TavernPetJournalRow[] {
    return journal.map((entry) => ({
        id: entry.id,
        kind: entry.detail.kind,
        label: journalLabel(entry),
        text: journalText(entry),
        coinDelta: entry.coinDelta,
        createdAt: entry.createdAt,
        timeLabel: timeLabel(entry.createdAt),
    }));
}

export function tavernPetStageText(view: TavernPetView): string {
    if (view.existence === 'undiscovered') {return '这里什么都没有。\n……角落里好像有什么动了一下。';}
    if (view.latestUtterance?.text) {return view.latestUtterance.text;}
    if (view.phase === 'egg') {return '蛋壳里面轻轻响了一下。';}
    return view.phaseProgressLabel || '它正在过自己的日子。';
}

export function tavernPetReadableState(view: TavernPetView): string {
    if (view.existence === 'undiscovered') {return '暗室里还没有住户。';}
    const phase = view.phase === 'egg' ? '蛋'
        : view.phase === 'juvenile' ? '幼体'
            : view.persona?.displayName || '成年形态';
    return [view.displayName, phase, view.appetiteLabel || '', view.emotionLabel || ''].filter(Boolean).join('，');
}

export function tavernPetThinkingFace(view: TavernPetView): string {
    if (view.phase === 'juvenile') {return TAVERN_PET_JUVENILE_PROFILE.faces.thinking;}
    if (view.phase === 'adult' && view.persona) {return getTavernPetPersona(view.persona.id).faces.thinking;}
    return view.currentFace || '·';
}

export function tavernPetCurrentUtterance(
    view: TavernPetView,
    latestJournalId = '',
): TavernPetUtterancePresentation {
    const latest = view.latestUtterance;
    return {
        key: latestJournalId || view.versionId || view.phase || view.existence,
        face: latest?.face || view.currentFace || (view.existence === 'undiscovered' ? '◌' : '·'),
        text: tavernPetStageText(view),
        motion: latest?.motion || 'none',
        ...(latest?.murmur ? { murmur: latest.murmur } : {}),
    };
}
