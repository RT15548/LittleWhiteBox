<script setup lang="ts">
import { computed, ref, type Component } from 'vue';
import AppNavigationScope from './AppNavigationScope.vue';
import type { XiaobaiOsAppDefinition } from '../../app-catalog.js';
import type { XiaobaiOsFrameBridge } from '../frame-bridge.js';
import AppBoundary from './AppBoundary.vue';
import XiaobaiOsHome from './XiaobaiOsHome.vue';
import XiaobaiOsNavigation from './XiaobaiOsNavigation.vue';
import XiaobaiOsSystemBar from './XiaobaiOsSystemBar.vue';

const props = defineProps<{
    apps: readonly XiaobaiOsAppDefinition[];
    activeApp: XiaobaiOsAppDefinition | null;
    activeComponent: Component | null;
    activeState: unknown;
    appFailure: { message: string; retryable: boolean } | null;
    appLoading: boolean;
    appRenderKey: number;
    bridge: XiaobaiOsFrameBridge;
    characterAvatar: string;
    saveAppOrder: (order: readonly string[] | null) => Promise<void>;
}>();

defineEmits<{
    openApp: [app: XiaobaiOsAppDefinition];
    back: [];
    home: [];
    close: [];
    renderFailed: [error: unknown];
    retry: [];
    reload: [];
}>();

const isHome = computed(() => props.activeApp === null);
const home = ref<InstanceType<typeof XiaobaiOsHome> | null>(null);
const navigation = ref<InstanceType<typeof AppNavigationScope> | null>(null);
defineExpose({
    back: () => {
        if (isHome.value && home.value?.editing) { home.value.finishEditing(); return true; }
        return !props.appLoading && !props.appFailure
            && navigation.value?.owner === `${props.activeApp?.id}:${props.appRenderKey}` && navigation.value.back();
    },
    finishHomeEditing: () => home.value?.finishEditing(),
});
</script>

<template>
    <div class="xiaobai-os-device">
        <span class="xiaobai-os-side-key" aria-hidden="true" />
        <div class="xiaobai-os-glass">
            <XiaobaiOsSystemBar :is-home="isHome" />
            <div class="xiaobai-os-stage" :style="activeApp ? { '--app-accent': activeApp.accent } : null">
                <Transition name="xiaobai-os-route" mode="out-in">
                    <XiaobaiOsHome
                        v-if="isHome"
                        key="home"
                        ref="home"
                        :apps="apps"
                        :character-avatar="characterAvatar"
                        :save-app-order="saveAppOrder"
                        @open-app="$emit('openApp', $event)"
                    />
                    <section v-else-if="appFailure" key="failure" class="xiaobai-os-app-failure" role="alert">
                        <span class="xiaobai-os-app-failure-mark" aria-hidden="true">!</span>
                        <h1>{{ activeApp?.name }}暂时无法打开</h1>
                        <p>{{ appFailure.message }}</p>
                        <div class="xiaobai-os-app-failure-actions">
                            <button v-if="appFailure.retryable" type="button" @click="$emit('retry')">重试</button>
                            <button type="button" @click="$emit('reload')">重新载入 OS</button>
                        </div>
                    </section>
                    <div v-else-if="appLoading" key="loading" class="xiaobai-os-app-loading" role="status">
                        <span aria-hidden="true" />
                        正在打开{{ activeApp?.name }}
                    </div>
                    <AppNavigationScope
                        v-else-if="activeApp && activeComponent"
                        :key="`app:${activeApp.id}:${appRenderKey}`"
                        ref="navigation"
                        :owner="`${activeApp.id}:${appRenderKey}`"
                    >
                        <AppBoundary @failed="$emit('renderFailed', $event)">
                            <component
                                :is="activeComponent"
                                :bridge="bridge"
                                :initial-state="activeState"
                            />
                        </AppBoundary>
                    </AppNavigationScope>
                </Transition>
            </div>
            <XiaobaiOsNavigation
                :is-home="isHome"
                :can-back="!isHome || !!home?.editing"
                @back="$emit('back')"
                @home="$emit('home')"
                @close="$emit('close')"
            />
        </div>
    </div>
</template>
