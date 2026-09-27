import { parseMapDomain } from './invariants.js';
import type { MapDomainV1, MapLink, MapLinkKind, MapLocation } from './types.js';

export const MAX_MAP_PROMPT_CHARS = 800;

const LINK_KIND_LABELS: Readonly<Record<MapLinkKind, string>> = Object.freeze({
    door: '门',
    stairs: '楼梯',
    elevator: '电梯',
    path: '小径',
    road: '道路',
    portal: '传送门',
    passage: '通道',
});

function codePointLength(value: string): number {
    return Array.from(value).length;
}

/** Escapes XML and prevents a later host macro pass from interpreting map text. */
export function escapeMapPromptText(value: string, maxCharacters = 80): string {
    return Array.from(String(value ?? '')
        .normalize('NFC')
        .replace(/[\u0000-\u001f\u007f-\u009f]/gu, ' ')
        .replace(/\s+/gu, ' ')
        .trim())
        .slice(0, maxCharacters)
        .join('')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/{/g, '&#123;')
        .replace(/}/g, '&#125;');
}

function routeLabel(link: MapLink): string {
    return escapeMapPromptText(link.label || LINK_KIND_LABELS[link.kind], 64);
}

function directDestination(
    link: MapLink,
    currentKey: string,
    locationByKey: ReadonlyMap<string, MapLocation>,
): MapLocation | null {
    if (link.from === currentKey) {return locationByKey.get(link.to) ?? null;}
    if (link.bidirectional && link.to === currentKey) {return locationByKey.get(link.from) ?? null;}
    return null;
}

function directLine(location: MapLocation, link: MapLink): string {
    const oneWay = link.bidirectional ? '' : '，仅可前往';
    return `- ${escapeMapPromptText(location.name, 80)}（经由${routeLabel(link)}${oneWay}）`;
}

function locationOverview(location: MapLocation, locationByKey: ReadonlyMap<string, MapLocation>): string {
    const name = escapeMapPromptText(location.name, 80);
    const parent = location.parent ? locationByKey.get(location.parent) : undefined;
    return parent ? `${name}（属于${escapeMapPromptText(parent.name, 80)}）` : name;
}

function routeOverview(link: MapLink, locationByKey: ReadonlyMap<string, MapLocation>): string {
    const from = locationByKey.get(link.from) as MapLocation;
    const to = locationByKey.get(link.to) as MapLocation;
    const fromName = escapeMapPromptText(from.name, 80);
    const toName = escapeMapPromptText(to.name, 80);
    const via = routeLabel(link);
    return link.bidirectional
        ? `${fromName}与${toName}经由${via}相连`
        : `${fromName}可经由${via}前往${toName}`;
}

/** One bounded world projection for RP and other consumers, including places not yet visited. */
export function buildMapPromptBlock(value: unknown): string {
    let domain: MapDomainV1;
    try {
        domain = parseMapDomain(value);
    } catch {
        return '';
    }
    const player = domain.atlas.actors.find(actor => actor.actorKey === 'player');
    if (!domain.atlas.locations.length) {return '';}
    const locationByKey = new Map(domain.atlas.locations.map(location => [location.key, location]));
    const current = player ? locationByKey.get(player.locationKey) : undefined;

    const closing = '</current_map>';
    const lines = [
        '<current_map>',
        '以下是当前世界地图，包含尚未到访的地点；地点存在不代表人物已到访。后续剧情沿用这些地点与连接。',
        `当前位置：${current ? escapeMapPromptText(current.name, 80) : '尚未确定'}`,
    ];
    const fits = (candidateLines: readonly string[]): boolean => (
        codePointLength([...candidateLines, closing].join('\n')) <= MAX_MAP_PROMPT_CHARS
    );
    const appendLine = (line: string): boolean => {
        if (!fits([...lines, line])) {return false;}
        lines.push(line);
        return true;
    };

    const parent = current?.parent ? locationByKey.get(current.parent) : undefined;
    if (parent) {appendLine(`所属区域：${escapeMapPromptText(parent.name, 80)}`);}
    if (current?.brief) {appendLine(`地点概况：${escapeMapPromptText(current.brief, 120)}`);}

    const direct = new Map<string, { location: MapLocation; link: MapLink }>();
    for (const link of domain.atlas.links) {
        const destination = current ? directDestination(link, current.key, locationByKey) : null;
        if (destination && !direct.has(destination.key)) {direct.set(destination.key, { location: destination, link });}
    }
    const directEntries = Array.from(direct.values()).map(entry => directLine(entry.location, entry.link));
    const selectedDirect: string[] = [];
    for (const entry of directEntries) {
        if (fits([...lines, '可直接到达：', ...selectedDirect, entry])) {selectedDirect.push(entry);}
    }
    if (selectedDirect.length) {lines.push('可直接到达：', ...selectedDirect);}
    else if (current && !directEntries.length) {appendLine('可直接到达：暂无已记录路线。');}

    const appendCompactSection = (prefix: string, entries: readonly string[]): void => {
        const selected: string[] = [];
        for (const entry of entries) {
            const line = `${prefix}${[...selected, entry].join('；')}。`;
            if (fits([...lines, line])) {selected.push(entry);}
        }
        if (selected.length) {lines.push(`${prefix}${selected.join('；')}。`);}
    };
    appendCompactSection(
        '世界地点：',
        domain.atlas.locations.map(location => locationOverview(location, locationByKey)),
    );
    appendCompactSection(
        '世界路线：',
        domain.atlas.links.map(link => routeOverview(link, locationByKey)),
    );

    lines.push(closing);
    return lines.join('\n');
}
