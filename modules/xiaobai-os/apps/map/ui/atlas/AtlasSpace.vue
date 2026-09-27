<script setup lang="ts">
import { computed, useId } from 'vue';
import type { AtlasFeatureProjection, AtlasProjection } from '../../../../domains/map/space/projection.js';
import type { SpaceBounds } from '../../../../domains/map/space/types.js';
import { boundsOverlap, geometryBounds, geometryClosed } from '../../../../domains/map/space/geometry.js';
import { atlasGeometryPath, atlasLineWidth } from './geometry.js';
import { ATLAS_MATERIALS } from './materials.js';
import { atlasDetails } from './details.js';
import { atlasOccluders, atlasPaintOrder } from '../../../../domains/map/space/composition.js';
import AtlasSurface from './AtlasSurface.vue';
import { useAtlasTiles } from './use-atlas-tiles.js';

const props = defineProps<{ projection: AtlasProjection; viewport: SpaceBounds; unitScale: number }>();
const prefix = `atlas-space-${useId()}`;
const clipId = `${prefix}-region`;
const layers = computed(() => {
    const ordered = atlasPaintOrder(props.projection.features), carriers = props.projection.carriers, pool = [...props.projection.features, ...carriers];
    const ids = new Map([...ordered.map((f, i) => [f.source.id, `${prefix}-${i}`] as const), ...carriers.map((f, i) => [f.source.id, `${prefix}-c${i}`] as const)]);
    // A support missing from both lists cannot be mapped here; draw the feature unsupported.
    const base = (f: AtlasFeatureProjection, others: AtlasFeatureProjection[]) => {
        const support = pool.find(other => other.source.id === f.source.support);
        return { id: ids.get(f.source.id)!, support, supportId: support ? `${ids.get(support.source.id)}-base` : '', exclusions: atlasOccluders(f, others) };
    };
    const painted = ordered.map(f => {
        const { scale, offset } = f.mapping;
        return { ...f, ...base(f, props.projection.features), paint: ATLAS_MATERIALS[f.source.material], sourcePath: atlasGeometryPath(f.source.geometry),
            transform: `translate(${offset[0]} ${offset[1]}) scale(${scale})`, closed: geometryClosed(f.source.geometry), width: atlasLineWidth(f.source.geometry), sourceBounds: geometryBounds(f.source.geometry),
        };
    });
    // Carriers only shape base masks; they are never painted.
    return { painted, masks: [...painted, ...carriers.map(f => ({ ...f, ...base(f, pool) }))] };
});
// Textures follow the view; masks above stay for every layer so support relations keep their shape.
const { tiles } = useAtlasTiles(() => layers.value.painted, () => props.viewport, () => props.unitScale);
const accents = computed(() => new Map(layers.value.painted.map(layer => {
    const { scale, offset } = layer.mapping;
    const viewport: SpaceBounds = [(props.viewport[0] - offset[0]) / scale, (props.viewport[1] - offset[1]) / scale, props.viewport[2] / scale, props.viewport[3] / scale];
    return [layer.source.id, ['asteroids', 'nebula'].includes(layer.source.form || '') || layer.source.material === 'vacuum'
        ? atlasDetails(layer.source, viewport, props.unitScale / scale) : []];
})));
</script>
<template>
    <g class="map-atlas-space" aria-hidden="true" :clip-path="projection.clip ? `url(#${clipId})` : undefined">
        <defs>
            <clipPath v-if="projection.clip" :id="clipId" clipPathUnits="userSpaceOnUse"><path :d="atlasGeometryPath(projection.clip)" /></clipPath>
            <linearGradient v-for="layer in layers.painted" :id="`${layer.id}-preview`" :key="`${layer.id}-preview`" x2="75%" y2="100%">
                <stop :stop-color="layer.paint.light" /><stop offset=".4" :stop-color="layer.paint.base" /><stop offset="1" :stop-color="layer.paint.ink" />
            </linearGradient>
            <mask v-for="layer in layers.painted" :id="`${layer.id}-source`" :key="`${layer.id}-source`" maskUnits="userSpaceOnUse" :x="layer.sourceBounds[0] - 2" :y="layer.sourceBounds[1] - 2" :width="layer.sourceBounds[2] + 4" :height="layer.sourceBounds[3] + 4" style="mask-type: luminance"><path :d="layer.sourcePath" :fill="layer.closed ? 'white' : 'none'" :stroke="layer.closed ? 'none' : 'white'" :stroke-width="layer.width" stroke-linecap="round" stroke-linejoin="round" /></mask>
            <mask v-for="layer in layers.masks" :id="`${layer.id}-base`" :key="`${layer.id}-base`" maskUnits="userSpaceOnUse" :x="projection.viewBox[0]" :y="projection.viewBox[1]" :width="projection.viewBox[2]" :height="projection.viewBox[3]" style="mask-type: luminance">
                <rect :x="projection.viewBox[0]" :y="projection.viewBox[1]" :width="projection.viewBox[2]" :height="projection.viewBox[3]" :fill="layer.support ? 'black' : 'white'" />
                <path v-if="layer.support" :d="atlasGeometryPath(layer.support.geometry)" fill="white" :mask="`url(#${layer.supportId})`" />
                <path v-for="other in layer.exclusions" :key="other.source.id" :d="atlasGeometryPath(other.geometry)" :fill="geometryClosed(other.geometry) ? 'black' : 'none'" stroke="black" :stroke-width="atlasLineWidth(other.geometry)" stroke-linecap="round" stroke-linejoin="round" />
            </mask>
        </defs>
        <g v-for="layer in layers.painted" :key="layer.source.id" :data-feature="layer.source.id" :mask="`url(#${layer.id}-base)`" :style="layer.source.role === 'relief' ? { mixBlendMode: 'multiply' } : undefined">
            <path v-if="layer.source.geometry.shape === 'point'" :d="atlasGeometryPath(layer.geometry)" :fill="layer.paint.base" :stroke="layer.paint.ink" :stroke-width="unitScale" />
            <g :transform="layer.transform" :mask="`url(#${layer.id}-source)`">
                <template v-if="layer.source.form !== 'asteroids'">
                    <AtlasSurface v-if="layer.source.geometry.shape !== 'point' && boundsOverlap(layer.bounds, viewport)" :view="tiles.get(layer.source.id)" :bounds="layer.sourceBounds">
                        <path :d="layer.sourcePath" :fill="layer.closed ? `url(#${layer.id}-preview)` : 'none'" :stroke="layer.closed ? 'none' : layer.paint.base" :stroke-width="layer.width" :opacity="layer.source.role === 'environment' ? .35 : 1" stroke-linecap="round" stroke-linejoin="round" />
                    </AtlasSurface>
                    <path v-if="layer.source.role === 'surface' || layer.source.role === 'structure' || (layer.source.material === 'water' && layer.source.role !== 'environment')" :d="layer.sourcePath" fill="none" :stroke="layer.paint.light" :stroke-width="layer.closed ? unitScale / layer.mapping.scale * 2.5 : Math.max(0, layer.width - unitScale / layer.mapping.scale * 2)" :stroke-opacity="layer.closed ? .6 : .12" stroke-linecap="round" stroke-linejoin="round" />
                </template>
                <g v-for="d in accents.get(layer.source.id)" :key="d.id" :transform="`translate(${d.x} ${d.y}) scale(${d.size})`">
                    <g v-if="layer.source.form === 'asteroids'" transform="scale(.3)">
                        <path d="M-.8-.25L-.34-.88.42-.68.86.05.38.67-.51.54Z" :fill="layer.paint.ink" />
                        <path d="M-.8-.25L-.34-.88.42-.68.1-.08-.51.54Z" :fill="layer.paint.light" />
                        <path d="M-.34-.88L.1-.08.86.05.42-.68Z" :fill="layer.paint.base" />
                    </g>
                    <template v-else>
                        <circle :r="d.variant === 0 ? '.047' : '.026'" fill="#eff6ff" :opacity="d.variant === 2 ? '.45' : '.9'" />
                        <path v-if="d.variant === 0" d="M-.12 0H.12M0-.12V.12" stroke="#afcaec" stroke-width=".014" opacity=".55" />
                    </template>
                </g>
            </g>
        </g>
        <g v-for="layer in layers.painted.filter(f => f.label && !f.source.destination)" :key="`${layer.id}-label`" class="map-atlas-label" :transform="`translate(${layer.bounds[0] + layer.bounds[2] / 2} ${layer.bounds[1] + layer.bounds[3] / 2}) scale(${unitScale})`"><text text-anchor="middle" :fill="layer.source.material === 'vacuum' ? '#e4efff' : layer.paint.ink">{{ layer.label }}</text></g>
    </g>
</template>
