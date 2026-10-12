<script setup lang="ts">
import type { MemoryId } from './memories.js';
defineProps<{ memory: MemoryId }>();
</script>
<template>
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" class="build-keepsake-icon">
        <template v-if="memory === 'gardenWalk'"><path d="M10 23h28c-1 9-8 10-14 10S11 32 10 23Z" fill="#fffdf3" stroke="#789b8c" stroke-width="2" /><path d="M24 33v8m-7 0h14" stroke="#789b8c" stroke-width="3" /><path d="M14 23h20" stroke="#b2d9e6" stroke-width="3" /><ellipse cx="31" cy="15" rx="6" ry="5" fill="#deb3a9" /><path d="m36 15 6 2-6 2" fill="#c49e62" /></template>
        <template v-else-if="memory === 'gardenReading'"><path d="M12 29h24l-3 14H15Z" fill="#d4b99b" /><path d="M24 30V11m0 15L13 18m11 3 10-9" stroke="#789b8c" stroke-width="2" /><ellipse cx="12" cy="16" rx="7" ry="5" fill="#b4d6c4" /><ellipse cx="32" cy="11" rx="7" ry="6" fill="#e8bdb3" /><circle cx="24" cy="8" r="5" fill="#e8bdb3" /></template>
        <template v-else-if="memory === 'gardenTea'"><path d="M5 35h38v5H5Z" fill="#e8bdb3" /><path d="M17 15h14v13c0 7-14 7-14 0Z" fill="#fffdf3" stroke="#789b8c" stroke-width="2" /><path d="M32 18h7l-6 8M15 18c-9-2-9 12 0 8M21 11h6" stroke="#789b8c" stroke-width="2" /><path d="M7 28h8v6H7m28-6h7v6h-7" fill="#b4d6c4" /></template>
        <template v-else-if="memory === 'quietBedroom'"><path d="M9 9h30v30H9Z" fill="#b4d6c4" stroke="#789b8c" stroke-width="2" /><path d="m16 17 4 4-4 4-4-4Zm16 0 4 4-4 4-4-4Z" fill="#fffdf3" /><path d="M10 40v4m7-4v4m7-4v4m7-4v4m7-4v4" stroke="#789b8c" /></template>
        <template v-else><path d="M5 12q19 17 38 0" stroke="#789b8c" stroke-width="2" /><path d="M8 15v7m10-2v7m12-7v7m10-12v7" stroke="#b39c75" /><g fill="#f6d99b"><ellipse cx="8" cy="25" rx="4" ry="5" /><ellipse cx="18" cy="30" rx="4" ry="5" /><ellipse cx="30" cy="30" rx="4" ry="5" /><ellipse cx="40" cy="25" rx="4" ry="5" /></g></template>
    </svg>
</template>
