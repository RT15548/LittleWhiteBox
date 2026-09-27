<script setup lang="ts">
import type { ItemKind } from './types.js';
import { ITEM_COLORS } from './scene/items.js';
defineProps<{ kind: ItemKind }>();
</script>
<template>
    <svg viewBox="0 0 48 48" aria-hidden="true" :style="{ color: ITEM_COLORS[kind] }" class="moving-item-icon">
        <g v-if="kind === 'cat'" fill="currentColor">
            <path d="M11 23 10 6 22 15 29 14 39 6 38 26Z" />
            <ellipse cx="24" cy="31" rx="14" ry="12" /><ellipse cx="24" cy="23" rx="17" ry="13" />
            <path d="M38 33q10 5 3 10" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
            <g fill="#354353"><circle cx="18" cy="23" r="1.6" /><circle cx="30" cy="23" r="1.6" /></g>
            <path d="m22 27 2 2 2-2" fill="#ce778a" />
        </g>
        <g v-else-if="kind === 'toast'">
            <path d="M9 17C1 2 47 2 39 17v24H9Z" fill="currentColor" />
            <path d="M14 19C8 8 40 8 34 19v17H14Z" fill="#ffe9b9" />
            <rect x="19" y="18" width="12" height="9" rx="2" fill="#f8ca54" transform="rotate(10 25 22)" />
            <g fill="#354353"><circle cx="19" cy="31" r="1.5" /><circle cx="29" cy="31" r="1.5" /></g>
        </g>
        <g v-else-if="kind === 'ufo'">
            <ellipse cx="24" cy="29" rx="22" ry="8" fill="currentColor" />
            <path d="M12 27v-5a12 12 0 0 1 24 0v5Z" fill="#b0e4e8" />
            <path d="M5 28q19 10 38 0" stroke="#eee4a6" stroke-width="3" fill="none" />
            <g fill="#354353"><circle cx="20" cy="23" r="1.5" /><circle cx="28" cy="23" r="1.5" /></g>
        </g>
        <g v-else-if="kind === 'cup'">
            <path d="M33 17h5c11 0 9 16-4 16" fill="none" stroke="currentColor" stroke-width="5" />
            <path d="M7 13h29l-3 24q-12 8-23 0Z" fill="currentColor" />
            <ellipse cx="21.5" cy="13" rx="14.5" ry="5" fill="#e7d9fb" /><ellipse cx="21.5" cy="13" rx="10" ry="3" fill="#806254" />
            <g fill="#354353"><circle cx="16" cy="27" r="1.5" /><circle cx="26" cy="27" r="1.5" /></g>
        </g>
        <g v-else-if="kind === 'duck'">
            <ellipse cx="24" cy="32" rx="18" ry="11" fill="currentColor" /><circle cx="25" cy="17" r="12" fill="currentColor" />
            <ellipse cx="26" cy="23" rx="8" ry="4" fill="#f49c44" />
            <g fill="#354353"><circle cx="20" cy="16" r="1.5" /><circle cx="30" cy="16" r="1.5" /></g>
            <path d="M11 30q3 8 9 4" fill="none" stroke="#eba93b" stroke-width="2" />
        </g>
        <g v-else-if="kind === 'plant'">
            <path d="M24 33V10" stroke="currentColor" stroke-width="3" />
            <path d="M23 23C4 22 7 5 23 18 18 1 36 0 27 17 43 4 45 25 26 26Z" fill="currentColor" />
            <path d="m12 29 3 15h19l3-15Z" fill="#efa08e" /><rect x="10" y="27" width="28" height="6" rx="2" fill="#ffc1ac" />
        </g>
        <g v-else-if="kind === 'potion'">
            <path d="M19 9h10v10c19 14 8 25-5 25S0 33 19 19Z" fill="currentColor" />
            <rect x="18" y="4" width="12" height="8" rx="2" fill="#cfa678" />
            <rect x="17" y="26" width="15" height="11" rx="3" fill="#fff0bc" transform="rotate(10 24 31)" />
            <path d="m15 23-3 6" stroke="#e1c8ff" stroke-width="3" stroke-linecap="round" />
        </g>
        <g v-else>
            <path d="m24 2 7 14 15 3-11 12 2 15-13-7-13 7 2-15L2 19l15-3Z" fill="currentColor" stroke="#eab655" stroke-width="1" stroke-linejoin="round" />
            <g fill="#354353"><circle cx="19" cy="25" r="1.6" /><circle cx="29" cy="25" r="1.6" /></g>
        </g>
    </svg>
</template>
