<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
const props = withDefaults(defineProps<{
    viewBox: readonly [number, number, number, number];
    resetKey?: string;
    label: string;
    focusPoint?: [number, number];
    focusSequence?: number;
}>(), { resetKey: '', focusSequence: 0, focusPoint: undefined });
const svg = ref<SVGSVGElement | null>(null);
const viewport = ref<[number, number, number, number]>([...props.viewBox]);
const size = ref<[number, number]>([0, 0]);
const unitScale = computed(() => size.value[0] && size.value[1] ? Math.max(viewport.value[2] / size.value[0], viewport.value[3] / size.value[1]) : 1);
let resizeObserver: ResizeObserver | undefined;
onMounted(() => {
    resizeObserver = new ResizeObserver(entries => {
        const bounds = entries[0].contentRect;
        size.value = [bounds.width, bounds.height];
    });
    if (svg.value) {resizeObserver.observe(svg.value);}
});
const pointers = new Map<number, [number, number]>();
let dragOrigin: [number, number] | null = null;
let viewOrigin: [number, number] = [0, 0];
let pinchDistance = 0;
let pinchCenter: [number, number] | null = null;
let dragged = false;
let suppressClick = false;
let suppressTimer: ReturnType<typeof setTimeout> | null = null;
const viewBoxText = computed(() => viewport.value.join(' '));

function reset(): void { viewport.value = [...props.viewBox]; }
function screenScale(): number {return unitScale.value;}
function clientToMap(x: number, y: number): [number, number] {
    const bounds = svg.value?.getBoundingClientRect();
    if (!bounds) {return [viewport.value[0], viewport.value[1]];}
    const scale = screenScale();
    return [viewport.value[0] + viewport.value[2] / 2 + (x - bounds.left - bounds.width / 2) * scale,
        viewport.value[1] + viewport.value[3] / 2 + (y - bounds.top - bounds.height / 2) * scale];
}
function zoom(factor: number, center?: [number, number]): void {
    const baseWidth = Math.max(1, props.viewBox[2]);
    const width = Math.min(baseWidth * 3, Math.max(Math.min(baseWidth * .24, 240), viewport.value[2] * factor));
    const ratio = width / viewport.value[2];
    const focus = center || [viewport.value[0] + viewport.value[2] / 2, viewport.value[1] + viewport.value[3] / 2];
    viewport.value = [focus[0] - (focus[0] - viewport.value[0]) * ratio, focus[1] - (focus[1] - viewport.value[1]) * ratio, width, viewport.value[3] * ratio];
}
function focus(): void {
    if (!props.focusPoint) {return;}
    const width = Math.min(viewport.value[2], 620);
    const height = viewport.value[3] * width / viewport.value[2];
    viewport.value = [props.focusPoint[0] - width / 2, props.focusPoint[1] - height / 2, width, height];
}
function startGesture(): void {
    const points = [...pointers.values()];
    if (points.length === 1) {dragOrigin = points[0]; viewOrigin = [viewport.value[0], viewport.value[1]];}
    if (points.length === 2) {
        pinchDistance = Math.hypot(points[1][0] - points[0][0], points[1][1] - points[0][1]);
        pinchCenter = [(points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2];
        dragged = true;
    }
}
function onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 || pointers.size >= 2) {return;}
    if (!pointers.size) {dragged = false;}
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    (event.target as Element).setPointerCapture(event.pointerId);
    startGesture();
}
function onPointerMove(event: PointerEvent): void {
    if (!pointers.has(event.pointerId)) {return;}
    pointers.set(event.pointerId, [event.clientX, event.clientY]);
    const points = [...pointers.values()];
    if (points.length === 2 && pinchCenter) {
        const distance = Math.hypot(points[1][0] - points[0][0], points[1][1] - points[0][1]);
        const center: [number, number] = [(points[0][0] + points[1][0]) / 2, (points[0][1] + points[1][1]) / 2];
        if (distance > 0 && pinchDistance > 0) {zoom(pinchDistance / distance, clientToMap(...pinchCenter));}
        viewport.value[0] -= (center[0] - pinchCenter[0]) * screenScale();
        viewport.value[1] -= (center[1] - pinchCenter[1]) * screenScale();
        pinchDistance = distance;
        pinchCenter = center;
    } else if (dragOrigin) {
        const dx = event.clientX - dragOrigin[0];
        const dy = event.clientY - dragOrigin[1];
        if (Math.abs(dx) + Math.abs(dy) > 4) {dragged = true;}
        viewport.value = [viewOrigin[0] - dx * screenScale(), viewOrigin[1] - dy * screenScale(), viewport.value[2], viewport.value[3]];
    }
}
function finishPointer(event: PointerEvent): void {
    if (!pointers.delete(event.pointerId)) {return;}
    const target = event.target as Element;
    if (target.hasPointerCapture(event.pointerId)) {target.releasePointerCapture(event.pointerId);}
    startGesture();
    if (!pointers.size) {dragOrigin = null; pinchCenter = null;}
    if (dragged) {
        suppressClick = true;
        if (suppressTimer) {clearTimeout(suppressTimer);}
        suppressTimer = setTimeout(() => {suppressClick = false;}, 0);
    }
}
function captureClick(event: MouseEvent): void {
    if (suppressClick) {event.preventDefault(); event.stopPropagation();}
}
watch(() => props.resetKey, reset, { immediate: true });
watch(() => props.focusSequence, focus, { flush: 'post' });
onBeforeUnmount(() => {resizeObserver?.disconnect(); if (suppressTimer) {clearTimeout(suppressTimer);}});
</script>
<template>
    <div class="map-viewport">
        <svg
            ref="svg" class="map-viewport-svg" :viewBox="viewBoxText" preserveAspectRatio="xMidYMid meet" role="group" :aria-label="label"
            @wheel.prevent="zoom($event.deltaY < 0 ? .84 : 1.19, clientToMap($event.clientX, $event.clientY))"
            @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="finishPointer" @pointercancel="finishPointer" @click.capture="captureClick"
        ><slot :unit-scale="unitScale" /></svg>
        <div class="map-viewport-controls" aria-label="地图缩放">
            <button type="button" aria-label="放大地图" @click="zoom(.8)">+</button><button type="button" aria-label="缩小地图" @click="zoom(1.25)">−</button>
            <button type="button" class="map-fit" @click="reset">全图</button>
        </div>
    </div>
</template>
