<script setup lang="ts">
defineProps<{ name: string }>();
const paths: Record<string, string> = {
    home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
    book: 'M12 5v16M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 2-3-2-5-3-9-2Z',
    records: 'M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2ZM9 8h6M9 12h6M9 16h3',
    reward: 'm12 3 3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1Z',
    arrow: 'M4 12h16m-6-6 6 6-6 6', send: 'M12 20V4m-6 6 6-6 6 6', back: 'm14 5-7 7 7 7', check: 'm5 12 4 4L19 6',
    play: 'm8 4 12 8-12 8Z', pause: 'M8 5v14M16 5v14', stop: 'M6 6h12v12H6Z',
    sound: 'm11 4-6 5H2v6h3l6 5ZM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
    chat: 'M5 3h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-6 4V5a2 2 0 0 1 2-2ZM7 8h10M7 12h6',
    more: 'M5 12h.01M12 12h.01M19 12h.01', close: 'm6 6 12 12M6 18 18 6',
    globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z',
};
</script>

<template>
    <svg class="learning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="name === 'more' ? 3.5 : 1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name]" /></svg>
</template>
