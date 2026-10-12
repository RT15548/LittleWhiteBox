<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { COPY as c, PART_NAMES } from './copy.js';
import { STOCK_KINDS, type StockKind } from './supply.js';
import PartIcon from './PartIcon.vue';
defineProps<{ packs: StockKind[][]; round: number; disabled: boolean }>();
defineEmits<{ choose: [index: number] }>();
const heading = ref<HTMLElement | null>(null);
onMounted(() => heading.value?.focus({ preventScroll: true }));
</script>
<template>
    <section class="build-supply" :aria-label="c.supplies" :data-build-batch="round">
        <header><strong ref="heading" tabindex="-1" role="heading" aria-level="2">{{ c.batch(round) }}</strong></header>
        <p>{{ c.pickTerms }}</p>
        <div class="build-supply-packs">
            <button v-for="(pack, index) in packs" :key="index" type="button" :data-build-pack="index" :disabled="disabled" @click="$emit('choose', index)">
                <span v-for="kind in STOCK_KINDS.filter(k => pack.includes(k))" :key="kind"><PartIcon :kind="kind" /><span>{{ PART_NAMES[kind] }} ×{{ pack.filter(k => k === kind).length }}</span></span>
                <strong>{{ c.takePack }}</strong>
            </button>
        </div>
    </section>
</template>
