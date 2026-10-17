<script setup lang="ts">
import { COPY as c } from '../copy.js';
import IslandIcon from './IslandIcon.vue';
defineProps<{ error: string; busy: boolean; disabled: boolean }>();
defineEmits<{ retry: []; settings: []; dismiss: [] }>();
</script>

<template>
    <section class="island-gm-failure" role="alert">
        <header><strong>{{ c.gmFailed }}</strong><button class="island-gm-failure-close" :aria-label="c.close" @click="$emit('dismiss')"><IslandIcon name="close" /></button></header>
        <details><summary>{{ c.errorDetails }}</summary><p>{{ error }}</p><p>{{ c.gmFailureDetail }}</p></details>
        <div class="island-gm-failure-actions"><button :disabled="disabled" @click="$emit('retry')">{{ c.retryGm }}</button><button :disabled="busy" @click="$emit('settings')">{{ c.modelSettings }}</button></div>
    </section>
</template>

<style scoped>
.island-gm-failure{padding:8px 14px 10px;font-size:12px;background:#fff6eb;color:#835738;border-block:1px solid #edceaa}
header{display:flex;align-items:center;justify-content:space-between;gap:8px}strong{font-size:13px}
.island-gm-failure .island-gm-failure-close{display:grid;place-items:center;flex-shrink:0;width:40px;height:40px;padding:0;border:0;background:transparent}
.island-gm-failure-close .island-icon{width:18px;height:18px}
details{margin-top:4px}summary{cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.island-gm-failure p{overflow-wrap:anywhere;margin-top:6px}
.island-gm-failure-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.island-gm-failure-actions button{background:transparent;min-height:34px;padding:5px 9px;font-size:12px}
</style>
