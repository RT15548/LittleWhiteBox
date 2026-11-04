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

function normalizeMapPromptText(value: string): string {
    return String(value ?? '')
        .normalize('NFC')
        .replace(/[\u0000-\u001f\u007f-\u009f]/gu, ' ')
        .replace(/\s+/gu, ' ')
        .trim();
}

/** Escapes XML and prevents a later host macro pass from interpreting map text. */
export function escapeMapPromptText(value: string, maxCharacters = 80): string {
    return Array.from(normalizeMapPromptText(value))
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
    const oneWay = link.bidirectional ? '' : '（单向）';
    return `- ${escapeMapPromptText(location.name, 80)}：${routeLabel(link)}${oneWay}`;
}

function briefOverview(value: string): string {
    const maxCharacters = 120;
    const characters = Array.from(normalizeMapPromptText(value));
    if (characters.length <= maxCharacters) {return escapeMapPromptText(characters.join(''), maxCharacters);}
    let commaEnd = 0;
    for (let end = maxCharacters; end > 0; end--) {
        const character = characters[end - 1];
        if (/[。；;]/u.test(character) || (character === '.' && !/\d/u.test(characters[end]))) {
            return escapeMapPromptText(characters.slice(0, end).join(''), maxCharacters);
        }
        if (!commaEnd && /[，,]/u.test(character)) {commaEnd = end;}
    }
    return escapeMapPromptText(characters.slice(0, commaEnd).join(''), maxCharacters);
}

function routeOverview(link: MapLink, locationByKey: ReadonlyMap<string, MapLocation>): string {
    const from = locationByKey.get(link.from) as MapLocation;
    const to = locationByKey.get(link.to) as MapLocation;
    const fromName = escapeMapPromptText(from.name, 80);
    const toName = escapeMapPromptText(to.name, 80);
    const via = routeLabel(link);
    return `- ${fromName} ${link.bidirectional ? '↔' : '→'} ${toName}：${via}`;
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
        '当前世界地图。列出的地点不一定去过；写到这些地方时，沿用这里的名字和走法。',
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
    const sectionAppender = (heading: string): ((line: string) => boolean) => {
        let started = false;
        return line => {
            const additions = started ? [line] : [heading, line];
            if (!fits([...lines, ...additions])) {return false;}
            lines.push(...additions);
            started = true;
            return true;
        };
    };

    const parent = current?.parent ? locationByKey.get(current.parent) : undefined;
    if (parent) {
        const currentLine = `${lines[lines.length - 1]}（${escapeMapPromptText(parent.name, 80)}）`;
        if (fits([...lines.slice(0, -1), currentLine])) {lines[lines.length - 1] = currentLine;}
    }
    const brief = current?.brief ? briefOverview(current.brief) : '';
    if (brief) {appendLine(`概况：${brief}`);}

    const direct = new Map<string, { location: MapLocation; link: MapLink }>();
    for (const link of domain.atlas.links) {
        const destination = current ? directDestination(link, current.key, locationByKey) : null;
        if (destination && !direct.has(destination.key)) {direct.set(destination.key, { location: destination, link });}
    }
    const directHeading = '从这里能去：';
    const appendDirect = sectionAppender(directHeading);
    const shownDirectLinks = new Set<string>();
    for (const { location, link } of direct.values()) {
        if (appendDirect(directLine(location, link))) {shownDirectLinks.add(link.id);}
    }
    if (current && !direct.size) {appendLine(`${directHeading}暂无已记录路线。`);}

    const childrenByParent = new Map<string | undefined, MapLocation[]>();
    for (const location of domain.atlas.locations) {
        const siblings = childrenByParent.get(location.parent) ?? [];
        siblings.push(location);
        childrenByParent.set(location.parent, siblings);
    }
    const appendLocation = sectionAppender('地点：');
    const appendLocationGroup = (location: MapLocation, depth: number): void => {
        const children = childrenByParent.get(location.key) ?? [];
        if (!appendLocation(`${'  '.repeat(depth)}- ${escapeMapPromptText(location.name, 80)}`)) {return;}
        const selected: MapLocation[] = [];
        for (const child of children) {
            const line = `${lines[lines.length - 1]}${selected.length ? '、' : '：'}${escapeMapPromptText(child.name, 80)}`;
            if (fits([...lines.slice(0, -1), line])) {
                lines[lines.length - 1] = line;
                selected.push(child);
            }
        }
        for (const child of selected) {
            if (childrenByParent.has(child.key)) {appendLocationGroup(child, depth + 1);}
        }
    };
    for (const root of childrenByParent.get(undefined) ?? []) {appendLocationGroup(root, 0);}
    const appendRoute = sectionAppender('路线：');
    for (const link of domain.atlas.links) {
        if (!shownDirectLinks.has(link.id)) {appendRoute(routeOverview(link, locationByKey));}
    }

    lines.push(closing);
    return lines.join('\n');
}
