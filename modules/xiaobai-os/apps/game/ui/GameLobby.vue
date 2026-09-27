<script setup lang="ts">
import { computed, ref } from 'vue';
import type { GameActiveGameView } from '../types.js';
import { GAME_ENTRIES, gameRoom, type GameEntryId } from './room-catalog.js';
defineProps<{ activeGame: GameActiveGameView | null }>();
defineEmits<{ open: [kind: GameEntryId] }>();
const search = ref('');
const category = ref('全部');
const categories = ['全部', ...new Set(GAME_ENTRIES.map((room) => room.category))];
const visible = computed(() =>
    GAME_ENTRIES.filter(
        (room) =>
            (category.value === '全部' || room.category === category.value) &&
            (room.name + room.tagline + room.category).includes(search.value.trim()),
    ),
);
</script>
<template>
    <section class="game-lobby">
        <button v-if="activeGame" type="button" class="game-continue" @click="$emit('open', activeGame.kind)">
            <img :src="gameRoom(activeGame.kind).artwork" alt=""><span><small>进行中</small><strong>{{ gameRoom(activeGame.kind).name }}</strong></span><b>继续 →</b>
        </button>
        <label class="game-search"><svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 4 4" /></svg><input v-model="search" type="search" placeholder="找个游戏" aria-label="搜索游戏"></label>
        <nav class="game-categories" aria-label="游戏分类">
            <button
                v-for="item in categories"
                :key="item"
                type="button"
                :aria-pressed="category === item"
                @click="category = item"
            >
                {{ item }}
            </button>
        </nav>
        <div class="game-shelf">
            <button
                v-for="room in visible"
                :key="room.id"
                type="button"
                class="game-tile"
                :class="'tone-' + room.tone"
                @click="$emit('open', room.id)"
            >
                <div class="game-tile-art">
                    <img :src="room.artwork" alt="" loading="lazy">
                </div>
                <div class="game-tile-copy">
                    <h3>{{ room.name }}</h3>
                    <span>{{ room.entry }} <i aria-hidden="true">↗</i></span>
                </div>
            </button>
        </div>
        <div v-if="!visible.length" class="game-empty">
            <h3>没找到这个游戏</h3>
            <p>换个名字，或者看看其他分类。</p>
            <button
                type="button"
                @click="
                    search = '';
                    category = '全部';
                "
            >
                查看全部
            </button>
        </div>
    </section>
</template>
