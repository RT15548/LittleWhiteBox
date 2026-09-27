import type { MapAtlas, MapLink, MapLocation } from '../types.js';
import { isMapRegion, isMapSceneLocation, locationRegion, visitedMapLocationKeys } from '../hierarchy.js';
import { ATLAS_FRAME, createFrameResolver, mapFrameId, transformPoint } from './frames.js';
import { clippedGeometryBounds, geometryBounds, geometryPoints, pointInGeometry, transformGeometry } from './geometry.js';
import type { FrameMapping, MapFeature, SpaceBounds, SpaceGeometry } from './types.js';
import { featureRegion } from './browse.js';
import { atlasOccluders } from './composition.js';

export type MapBrowseKind = 'world' | 'region';
export type MapBrowseFilter = 'all' | 'unvisited' | 'visited';
export interface MapBrowseScope { kind: MapBrowseKind; region?: MapLocation; locations: MapLocation[]; unvisited: number; frame: string }
export type UnlocatedReason = 'position_unknown' | 'mapping_unknown' | 'outside_map';
export interface AtlasMarker { location: MapLocation; x: number; y: number }
export interface AtlasFeatureProjection { source: MapFeature; geometry: SpaceGeometry; mapping: FrameMapping; bounds: SpaceBounds; label: string }
export interface AtlasProjection {
    scope: MapBrowseScope;
    nodes: AtlasMarker[];
    unlocated: Array<{ location: MapLocation; reason: UnlocatedReason }>;
    features: AtlasFeatureProjection[];
    regions: Array<{ location: MapLocation; geometry: SpaceGeometry; bounds: SpaceBounds }>;
    /** External composition dependencies: mask geometry only, never painted. */
    carriers: AtlasFeatureProjection[];
    routes: Array<{ link: MapLink; feature: AtlasFeatureProjection; from: AtlasMarker; to: AtlasMarker; arrow?: 'start' | 'end' }>;
    clip?: SpaceGeometry;
    viewBox: SpaceBounds;
    drawable: boolean;
}

export function mapBrowseScope(atlas: MapAtlas, regionKey: string | null): MapBrowseScope {
    const region = regionKey === null ? undefined : atlas.locations.find(l => l.key === regionKey && isMapRegion(l));
    const visited = visitedMapLocationKeys(atlas);
    const locations = (regionKey === null ? atlas.locations.filter(isMapRegion)
        : region ? atlas.locations.filter(l => isMapSceneLocation(l) && locationRegion(atlas, l.key)?.key === region.key) : [])
        .map(l => visited.has(l.key) ? { ...l, status: 'visited' as const } : l);
    return { kind: regionKey === null ? 'world' : 'region', region, locations, unvisited: locations.filter(l => l.status !== 'visited').length, frame: region ? mapFrameId(region.key) : regionKey === null ? ATLAS_FRAME : '' };
}

/** Lists are semantic membership; markers and surfaces require an actual coordinate path. */
export function projectAtlas(atlas: MapAtlas, scope: MapBrowseScope): AtlasProjection {
    const frame = atlas.frames.find(f => f.id === scope.frame);
    const resolve = createFrameResolver(atlas.frames);
    const clip = frame?.boundary ? atlas.features.find(f => f.id === frame.boundary)?.geometry : undefined;
    const nodes: AtlasMarker[] = [], unlocated: AtlasProjection['unlocated'] = [], features: AtlasFeatureProjection[] = [];
    for (const location of scope.locations) {
        const position = location.position;
        const mapping = position && resolve(position.frame, scope.frame);
        if (!position || !mapping) { unlocated.push({ location, reason: position ? 'mapping_unknown' : 'position_unknown' }); continue; }
        const [x, y] = transformPoint(position.at, mapping);
        if (clip && !pointInGeometry([x, y], clip)) { unlocated.push({ location, reason: 'outside_map' }); continue; }
        nodes.push({ location, x, y });
    }
    for (const source of atlas.features) {
        if (source.role === 'boundary') { continue; }
        const region = featureRegion(atlas, source);
        if (region === undefined || (scope.kind === 'world' ? region !== null : !scope.region || region !== scope.region.key && (region !== null || !clip))) { continue; }
        const mapping = resolve(source.frame, scope.frame);
        if (!mapping) { continue; }
        const geometry = transformGeometry(source.geometry, mapping), bounds = clippedGeometryBounds(geometry, clip);
        if (!bounds) { continue; }
        const label = source.destination ? atlas.locations.find(l => l.key === source.destination)?.name || '' : source.name || '';
        features.push({ source, geometry, mapping, bounds, label });
    }
    nodes.sort((a, b) => a.location.key.localeCompare(b.location.key));
    features.sort((a, b) => a.source.id.localeCompare(b.source.id));
    // A regional view can omit the world-frame surface that carries its features.
    // Mask with the saved support rather than showing them unsupported or not at all.
    const candidates: AtlasFeatureProjection[] = atlas.features.flatMap(source => {
        const region = featureRegion(atlas, source), mapping = resolve(source.frame, scope.frame);
        if (!mapping || source.role === 'boundary' || (region !== null && region !== scope.region?.key)) { return []; }
        const geometry = transformGeometry(source.geometry, mapping);
        return [{ source, geometry, mapping, bounds: geometryBounds(geometry), label: '' }];
    });
    const dependencies = (f: AtlasFeatureProjection) => [f.source.support, ...(f.source.crosses || []), ...atlasOccluders(f, candidates).map(other => other.source.id)];
    const carriers: AtlasFeatureProjection[] = [], known = new Set(features.map(f => f.source.id));
    for (let queue = features.flatMap(dependencies); queue.length;) {
        const id = queue.shift();
        const source = id && !known.has(id) ? atlas.features.find(f => f.id === id) : undefined;
        if (!source) { continue; }
        known.add(source.id);
        const mapping = resolve(source.frame, scope.frame);
        if (!mapping) { continue; }
        const geometry = transformGeometry(source.geometry, mapping);
        const carrier = { source, geometry, mapping, bounds: geometryBounds(geometry), label: '' };
        carriers.push(carrier);
        queue.push(...dependencies(carrier));
    }
    carriers.sort((a, b) => a.source.id.localeCompare(b.source.id));
    const byKey = new Map(nodes.map(n => [n.location.key, n]));
    const routes = atlas.links.flatMap(link => {
        const feature = features.find(f => f.source.id === link.feature), from = byKey.get(link.from), to = byKey.get(link.to);
        if (!feature || !from || !to) { return []; }
        const points = geometryPoints(feature.geometry), first = points[0], last = points[points.length - 1];
        const matches = (point: readonly number[], node: AtlasMarker) => Math.hypot(point[0] - node.x, point[1] - node.y) < 1e-6;
        // A channel may extend beyond its linked destinations. Do not invent an arrow
        // endpoint; retain the connection in details until its geometric direction is known.
        const arrow = link.bidirectional ? undefined : matches(first, from) && matches(last, to) ? 'end' as const : matches(first, to) && matches(last, from) ? 'start' as const : undefined;
        return [{ link, feature, from, to, ...(arrow ? { arrow } : {}) }];
    });
    const regions = scope.kind === 'world' ? scope.locations.flatMap(location => {
        const local = atlas.frames.find(f => f.owner === location.key);
        const boundary = local?.boundary && atlas.features.find(f => f.id === local.boundary);
        const mapping = boundary && resolve(boundary.frame, scope.frame);
        if (!boundary || !mapping) { return []; }
        const geometry = transformGeometry(boundary.geometry, mapping);
        return [{ location, geometry, bounds: geometryBounds(geometry) }];
    }) : [];
    const boxes = [...features.map(f => f.bounds), ...regions.map(r => r.bounds), ...nodes.map(n => [n.x, n.y, 0, 0] as SpaceBounds)];
    let viewBox: SpaceBounds = [0, 0, 800, 600];
    if (boxes.length) {
        const x = Math.min(...boxes.map(b => b[0])), y = Math.min(...boxes.map(b => b[1]));
        const width = Math.max(...boxes.map(b => b[0] + b[2])) - x, height = Math.max(...boxes.map(b => b[1] + b[3])) - y;
        const pad = Math.max(12, Math.max(width, height) * .08);
        viewBox = [x - pad, y - pad, Math.max(width + pad * 2, 120), Math.max(height + pad * 2, 120)];
    }
    return { scope, nodes, unlocated, features, regions, carriers, routes, clip, viewBox, drawable: !!boxes.length };
}
