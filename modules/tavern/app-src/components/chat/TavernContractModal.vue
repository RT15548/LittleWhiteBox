<script setup lang="ts">
import { computed } from 'vue';
import {
    countActiveTavernSessionContract,
    TAVERN_CONTRACT_MANDATES,
    TAVERN_CONTRACT_TIER_LABELS,
    type TavernContractMandateDefinition,
    type TavernContractPermissionKey,
    type TavernContractTier,
    type TavernSessionContract,
} from '../../../shared/session-contract';

const props = defineProps<{
    draftContract: TavernSessionContract;
    dirty: boolean;
    saving: boolean;
    canSave: boolean;
    errorText?: string;
}>();

const emit = defineEmits<{
    (event: 'close'): void;
    (event: 'toggle', key: TavernContractPermissionKey): void;
    (event: 'save'): void;
}>();

const groupedMandates = computed(() => {
    const groups = new Map<TavernContractTier, TavernContractMandateDefinition[]>();
    TAVERN_CONTRACT_MANDATES.forEach((mandate) => {
        const current = groups.get(mandate.tier) || [];
        current.push(mandate);
        groups.set(mandate.tier, current);
    });
    return Array.from(groups.entries()).map(([tier, mandates]) => ({ tier, mandates }));
});

const activeCount = computed(() => countActiveTavernSessionContract(props.draftContract));
</script>

<template>
  <div
    class="tavern-contract-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="tavern-contract-title"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
  >
    <section
      class="tavern-contract-modal"
      tabindex="-1"
    >
      <header class="tavern-contract-head">
        <div class="tavern-contract-heading">
          <h2 id="tavern-contract-title">
            契约
          </h2>
          <p class="eyebrow">
            玩家 — 代理人誓约
          </p>
        </div>
        <button
          type="button"
          class="tavern-contract-close"
          aria-label="关闭契约"
          @click="$emit('close')"
        >
          ×
        </button>
      </header>

      <div class="tavern-contract-body">
        <p class="tavern-contract-preamble">
          在故事里，定义你的代理人被允许做什么。
          每一条封印的授权赋予一项特定权限。
          别忘记添加可执行工具的分身模型。
        </p>

        <section
          v-for="group in groupedMandates"
          :key="group.tier"
          class="tavern-contract-tier"
        >
          <div class="tavern-contract-tier-bar">
            <span>{{ TAVERN_CONTRACT_TIER_LABELS[group.tier] }}</span>
          </div>

          <article
            v-for="mandate in group.mandates"
            :key="mandate.key"
            class="tavern-contract-mandate"
            :class="{ 'is-off': !draftContract[mandate.key] }"
          >
            <button
              type="button"
              class="tavern-contract-seal"
              :class="{ active: draftContract[mandate.key] }"
              :aria-pressed="draftContract[mandate.key] ? 'true' : 'false'"
              @click="$emit('toggle', mandate.key)"
            >
              <span>{{ mandate.icon }}</span>
            </button>

            <div class="tavern-contract-copy">
              <h3>{{ mandate.title }}</h3>
              <p class="tavern-contract-description">
                {{ mandate.description }}
              </p>
            </div>
          </article>
        </section>
      </div>

      <footer class="tavern-contract-foot">
        <button
          type="button"
          class="tavern-contract-save"
          :disabled="saving || !canSave"
          @click="$emit('save')"
        >
          {{ saving ? '封印中...' : '封存誓约' }}
        </button>
        <p class="tavern-contract-note">
          {{ activeCount }} / {{ TAVERN_CONTRACT_MANDATES.length }} 项授权已启用
        </p>
        <p
          v-if="errorText"
          class="tavern-contract-error"
        >
          {{ errorText }}
        </p>
      </footer>
    </section>
  </div>
</template>
