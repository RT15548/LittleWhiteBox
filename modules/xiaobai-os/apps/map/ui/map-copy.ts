import type { MapBrowseFilter, MapBrowseKind } from './map-browse.js';

export const MAP_VIEW_LABELS = { world: '世界地图', region: '当前地区', scene: '当前场景' } as const;
export const MAP_VISIT_LABELS = { visited: '已到访', unvisited: '未到访' } as const;
export const MAP_BROWSE_COPY = {
    world: { unit: '地区', search: '搜索地区', all: '全部地区', empty: '还没有记录地区', emptyHint: '更新地图后，可根据设定与剧情补充地区。', notFound: '没有找到符合条件的地区' },
    region: { unit: '场景', search: '搜索本地区场景', all: '全部场景', empty: '这个地区还没有记录场景', emptyHint: '可以查看其他地区，或更新地图补充。', notFound: '没有找到符合条件的场景' },
} as const;
export const MAP_NAV_COPY = {
    viewLabel: '地图视图', trailLabel: '当前查看位置',
    unknownRegion: '所属地区待确认', unknownRegionHint: '地图还没有记录当前位置所属的地区。',
    regionMap: '查看地区地图', sceneMap: '查看场景图',
    cancel: '取消', filters: '到访筛选', searchHint: '试试其他名称或筛选条件。',
    update: '更新地图', updating: '正在更新…',
    sceneBrowsing: '正在查看已记录的场景', sceneCurrent: '看看你身边的布局',
    sceneEmpty: '这里的布局还没画出来', unknownLocation: '还不知道你在哪里',
    sceneUpdateHint: '更新地图后，会结合设定与剧情补齐这里的普通布局。', locationUpdateHint: '更新地图后，会根据剧情确认你所在的地方。',
    legend: '世界图展示地区，地区图展示所属场景；场景图展示一个地点的内部布局。地图不按实际比例。',
} as const;

export function mapBrowseCount(kind: MapBrowseKind, count: number): string {
    return `${count} 个${MAP_BROWSE_COPY[kind].unit}`;
}

export function mapBrowseSummary(kind: MapBrowseKind, count: number, unvisited: number): string {
    return `${mapBrowseCount(kind, count)} · ${unvisited} 个${MAP_VISIT_LABELS.unvisited}`;
}

export function mapBrowseAction(kind: MapBrowseKind, filter: MapBrowseFilter): string {
    return `查看${filter === 'all' ? '' : MAP_VISIT_LABELS[filter]}${MAP_BROWSE_COPY[kind].unit}`;
}
