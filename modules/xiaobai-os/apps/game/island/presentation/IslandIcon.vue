<script setup lang="ts">
const paths = {
    inventory: 'M8 7V5a4 4 0 0 1 8 0v2M5 7h14l1 14H4L5 7Zm3 5h8v5H8v-5Z',
    craft: 'm4 20 8-8m3-3 5-5M3 4l3-1 14 14-3 3L3 6V4Zm12 1 4 4',
    build: 'm2 12 10-9 10 9M5 10v11h14V10M10 21v-7h4v7',
    body: 'M16 5a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 22v-3a8 8 0 0 1 16 0v3',
    journal: 'M4 3h14a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V3Zm0 14h16M8 7h8M8 11h5',
    people: 'M14 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM3 21v-3a8 8 0 0 1 16 0v3M18 3a3 3 0 0 1 0 6m3 4a7 7 0 0 1 2 5v3',
    places: 'm3 5 6-3 6 3 6-3v17l-6 3-6-3-6 3V5Zm6-3v17m6-14v17',
    chat: 'M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-9l-7 4v-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM7 8h10M7 12h7',
    arrow: 'M4 12h16m-7-7 7 7-7 7',
    back: 'M20 12H4m7-7-7 7 7 7',
    close: 'm5 5 14 14M19 5 5 19',
    up: 'm5 15 7-7 7 7',
    down: 'm5 9 7 7 7-7',
    sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M20 4l-2 2M6 18l-2 2',
    water: 'M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13ZM9 16a3 3 0 0 0 3 3',
    pause: 'M8 5v14M16 5v14',
    play: 'm8 4 12 8-12 8V4Z',
    mark: 'M2 17c3-3 6 3 10 0s7 3 10 0M2 22c3-3 6 3 10 0s7 3 10 0M12 13V3m0 0L5 8h14L12 3Z',
} as const;
defineProps<{ name: keyof typeof paths }>();
</script>
<template><svg class="island-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name]" /></svg></template>
<style scoped>.island-icon{display:block;width:22px;height:22px;flex-shrink:0}</style>
