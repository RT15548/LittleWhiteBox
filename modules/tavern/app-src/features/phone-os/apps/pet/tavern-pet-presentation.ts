import { getTavernPetPersona, TAVERN_PET_JUVENILE_PROFILE } from '../../../../../shared/pet/pet-personas';
import type {
    TavernPetActivityRecord,
    TavernPetAvailableAction,
    TavernPetMotion,
    TavernPetView,
} from '../../../../../shared/pet/pet-types';

export const TAVERN_PET_REBUFF_FACE = '(￣ヘ￣)';

const ACTION_LABELS: Readonly<Record<TavernPetAvailableAction['id'], string>> = Object.freeze({
    lure: '放一点吃的',
    feed: '投喂',
    'tap-shell': '敲壳',
    'play-bgm': '放 BGM',
    pat: '摸头',
    hit: '拍打',
    toy: '玩具',
    chat: '发送',
    wake: '唤醒',
});

const MILESTONE_LABELS = Object.freeze({
    arrival: '到达',
    hatch: '破壳',
    adulthood: '长成',
    repattern: '变形',
});

export interface TavernPetActivityRow {
    id: string;
    kind: 'event' | 'milestone' | 'chat' | 'status';
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

function activityText(activity: TavernPetActivityRecord): string {
    const detail = activity.detail;
    if (detail.kind === 'chat') {return detail.petText;}
    return detail.renderedText;
}

function activityLabel(activity: TavernPetActivityRecord): string {
    const detail = activity.detail;
    if (detail.kind === 'chat') {return '它回应了';}
    if (detail.kind === 'status') {return detail.status === 'woke' ? '重新活动' : '停止活动';}
    if (detail.kind === 'milestone') {return MILESTONE_LABELS[detail.milestoneId];}
    if (activity.coinDelta > 0) {return `带回 ${activity.coinDelta} 小白币`;}
    if (activity.coinDelta < 0) {return `拿走 ${Math.abs(activity.coinDelta)} 小白币`;}
    return '留下痕迹';
}

function timeLabel(createdAt: number): string {
    const date = new Date(createdAt);
    if (!Number.isFinite(date.getTime())) {return '';}
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

export function projectTavernPetActivityRows(
    activities: readonly TavernPetActivityRecord[],
): TavernPetActivityRow[] {
    return activities.map((activity) => ({
        id: activity.id,
        kind: activity.detail.kind,
        label: activityLabel(activity),
        text: activityText(activity),
        coinDelta: activity.coinDelta,
        createdAt: activity.createdAt,
        timeLabel: timeLabel(activity.createdAt),
    }));
}

export function tavernPetActionLabel(actionId: TavernPetAvailableAction['id']): string {
    return ACTION_LABELS[actionId];
}

export function tavernPetStageText(view: TavernPetView): string {
    if (view.existence === 'undiscovered') {
        return '这里什么都没有。\n……角落里好像有什么动了一下。';
    }
    if (view.dormant) {return '它把自己关机了。';}
    if (view.latestUtterance?.text) {return view.latestUtterance.text;}
    return view.phaseProgressLabel || '它正在看你。';
}

export function tavernPetReadableState(view: TavernPetView): string {
    if (view.existence === 'undiscovered') {return '暗室里还没有住户。';}
    if (view.phase === 'luring') {return '食物已经放下，住户尚未出现。';}
    if (view.dormant) {return `${view.displayName}正在休眠。`;}
    const phase = view.phase === 'egg' ? '蛋形态'
        : view.phase === 'juvenile' ? '幼体'
            : view.persona?.displayName || '成年形态';
    return [
        view.displayName,
        phase,
        view.emotionLabel || '',
        Number.isFinite(view.satietyPercent) ? `饱食 ${view.satietyPercent}%` : '',
    ].filter(Boolean).join('，');
}

export function tavernPetThinkingFace(view: TavernPetView): string {
    if (view.phase === 'juvenile') {return TAVERN_PET_JUVENILE_PROFILE.faces.thinking;}
    if (view.phase === 'adult' && view.persona) {
        return getTavernPetPersona(view.persona.id).faces.thinking;
    }
    return view.currentFace || '·';
}

export function tavernPetCurrentUtterance(
    view: TavernPetView,
    latestActivityId = '',
): TavernPetUtterancePresentation {
    const latest = view.latestUtterance;
    return {
        key: latestActivityId || view.versionId || view.phase || view.existence,
        face: latest?.face || view.currentFace || (view.existence === 'undiscovered' ? '▓' : '·'),
        text: tavernPetStageText(view),
        motion: latest?.motion || 'none',
        ...(latest?.murmur ? { murmur: latest.murmur } : {}),
    };
}
