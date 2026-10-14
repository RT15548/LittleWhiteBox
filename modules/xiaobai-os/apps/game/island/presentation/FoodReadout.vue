<script setup lang="ts">
import type { ObservedWater } from '../water.js';
import type { FoodObservation } from '../food.js';
import { COPY as c } from '../copy.js';
defineProps<{ water: ObservedWater | null; food: FoodObservation | null }>();
</script>
<template>
    <small v-if="water">{{ Math.floor(water.millilitres) }} ml · {{ c[water.quality] }}</small>
    <small v-if="food && food !== water?.food" :class="{'island-food-warning':food==='off_odor'}">{{ c.foodCondition[food] }}</small>
    <small v-if="water?.food" :class="{'island-food-warning':water.food==='off_odor'}">{{ food === water.food ? c.foodAndLiquid : c.liquid }} · {{ c.foodCondition[water.food] }}</small>
</template>
<style scoped>small{display:block;line-height:1.6;margin-top:3px}.island-food-warning{color:#8a5b31}</style>
