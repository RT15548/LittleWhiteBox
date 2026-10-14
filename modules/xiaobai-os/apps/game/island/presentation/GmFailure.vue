<script setup lang="ts">
import { COPY as c } from '../copy.js';
defineProps<{ error: string; busy: boolean; disabled: boolean }>();
defineEmits<{ retry: []; settings: [] }>();
</script>

<template>
    <section class="island-gm-failure" role="alert">
        <strong>{{ c.gmFailed }}</strong>
        <details><summary>{{ c.errorDetails }}</summary><p>{{ error }}</p><p>{{ c.gmFailureDetail }}</p></details>
        <div><button :disabled="disabled" @click="$emit('retry')">{{ c.retryGm }}</button><button :disabled="busy" @click="$emit('settings')">{{ c.modelSettings }}</button></div>
    </section>
</template>

<style scoped>
.island-gm-failure{flex-shrink:0;max-height:45%;overflow:auto;overscroll-behavior:contain;padding:10px 14px;background:#fff8e9;border-top:1px solid #dcc6a0;color:#765b3f;font-size:12px}
strong{display:block;font-size:13px}details{margin-top:4px}summary{cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.island-gm-failure p{overflow-wrap:anywhere;margin-top:6px}
div{display:flex;gap:8px;margin-top:8px}.island-gm-failure button{background:transparent;min-height:34px;padding:5px 9px;font-size:12px}
</style>
