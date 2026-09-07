<script setup lang="ts">
import AppDialog from '../../../shell/app-src/components/AppDialog.vue';

import MapIcon from './MapIcon.vue';
defineProps<{ autoMaintenance: boolean; busy: boolean; refreshDisabled: boolean; autoToggleBusy: boolean; disabledReason: string; hasMap: boolean; status: string; maintenanceMessage: string; maintenanceError: boolean; notice: string; noticeError: boolean }>();
defineEmits<{ close: []; setAuto: [enabled: boolean]; update: []; rebuild: []; refresh: [] }>();
</script>
<template>
    <AppDialog class="map-dialog map-settings" aria-labelledby="map-settings-title" @close="$emit('close')">
        <header class="map-dialog-header"><div><small>让地图跟上你的故事</small><h2 id="map-settings-title">地图设置</h2></div><button type="button" class="map-round-button" aria-label="关闭地图设置" @click="$emit('close')"><MapIcon name="close" /></button></header>
        <section v-if="status || notice || maintenanceMessage" class="map-settings-feedback" :class="{ 'is-error': notice ? noticeError : maintenanceError }" role="status">
            <strong>{{ notice ? (notice === maintenanceMessage ? '最近一次更新' : '操作提示') : status || '最近一次更新' }}</strong>
            <p v-if="notice || maintenanceMessage">{{ notice || maintenanceMessage }}</p>
        </section>
        <div class="map-settings-content">
            <section class="map-auto-setting"><div><h3>随对话自动更新</h3><p>你发送下一条消息时，根据上一轮对话更新地图。适用于所有普通聊天。</p></div><button type="button" class="map-switch" role="switch" :aria-checked="autoMaintenance" aria-label="随对话自动更新" :disabled="autoToggleBusy" @click="$emit('setAuto', !autoMaintenance)"><span /></button></section>
            <section class="map-settings-section"><MapIcon name="refresh" /><h3>补充最近的变化</h3><p>根据最近一轮对话更新位置和地点，并补全当前区域尚缺少的探索去处。</p><button type="button" class="map-primary-button" :disabled="busy || Boolean(disabledReason) || !hasMap" @click="$emit('update')">{{ busy ? status || '请稍候…' : '更新地图' }}</button><small v-if="!hasMap">请先建立世界地图</small></section>
            <section class="map-settings-section"><MapIcon name="globe" /><h3>{{ hasMap ? '重新绘制世界' : '建立世界地图' }}</h3><p>依据角色与世界设定建立地图；设定未写明的地方，会合理补全。结合当前聊天保留已发生的故事。</p><p v-if="hasMap">新地图保存成功后替换原图；失败时保留原图。</p><button type="button" class="map-secondary-button" :disabled="busy || Boolean(disabledReason)" @click="$emit('rebuild')">{{ busy ? status || '请稍候…' : hasMap ? '重新绘制' : '绘制世界地图' }}</button></section>
            <p v-if="disabledReason" class="map-setting-note" role="status">{{ disabledReason }}</p>
            <button type="button" class="map-sync-button" :disabled="busy || refreshDisabled" @click="$emit('refresh')"><MapIcon name="refresh" />同步已保存的地图</button><p class="map-setting-note">同步只读取保存结果，不会重新生成地图。绘制或更新开始后，可以离开此页面。</p>
        </div>
    </AppDialog>
</template>
