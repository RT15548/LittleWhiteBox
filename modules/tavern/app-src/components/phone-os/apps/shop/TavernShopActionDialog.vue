<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import type { TavernShopItem } from '../../../../../shared/shop/shop-types';
import type { TavernShopActionIntent } from '../../../../features/phone-os/apps/shop/useTavernShopController';

const props = defineProps<{
    intent: TavernShopActionIntent;
    item: TavernShopItem;
    parameters: Record<string, string>;
    knownTargetNames: string[];
    permanentConfirm: boolean;
    busy: boolean;
    error: string;
}>();

const emit = defineEmits<{
    (event: 'update:parameters', parameters: Record<string, string>): void;
    (event: 'confirm'): void;
    (event: 'cancel'): void;
}>();

const cancelRef = ref<HTMLButtonElement | null>(null);
let returnFocus: HTMLElement | null = null;
const title = computed(() => {
    if (props.intent.kind === 'purchase') {return `购入「${props.item.name}」？`;}
    if (props.intent.kind === 'deactivate') {return `关闭「${props.item.name}」？`;}
    if (props.permanentConfirm) {return '最后确认：永久封契';}
    return `启用「${props.item.name}」？`;
});
const message = computed(() => {
    if (props.intent.kind === 'purchase') {
        return `将支付 ${props.item.price} 小白币。购买只会放入背包，不会立刻改变剧情。`;
    }
    if (props.intent.kind === 'deactivate') {
        return '关闭后，从下一次模型请求开始不再注入这条规则。已经生成的内容不会被改写。';
    }
    if (props.permanentConfirm) {
        return '这条规则一旦生效便没有关闭按钮，只能回滚到激活前的剧情位置或删除会话解除。';
    }
    return props.item.inputs.length
        ? '填写规则作用的数据。它只会进入人工审核过的契约模板。'
        : '确认后，这条规则会从下一次叙事请求开始生效。';
});
const confirmText = computed(() => {
    if (props.busy) {return '正在落契';}
    if (props.intent.kind === 'purchase') {return `支付 ${props.item.price} 币`;}
    if (props.intent.kind === 'deactivate') {return '确认关闭';}
    if (props.item.duration.kind === 'permanent' && !props.permanentConfirm) {return '继续确认';}
    if (props.permanentConfirm) {return '永久生效';}
    return '确认启用';
});

function updateParameter(key: string, value: string) {
    emit('update:parameters', { ...props.parameters, [key]: value });
}

function handleEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape' || props.busy) {return;}
    event.preventDefault();
    event.stopImmediatePropagation();
    emit('cancel');
}

onMounted(async () => {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.addEventListener('keydown', handleEscape, true);
    await nextTick();
    const firstInput = document.querySelector<HTMLInputElement>('[data-tavern-phone-modal="shop-action"] input');
    (firstInput || cancelRef.value)?.focus({ preventScroll: true });
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleEscape, true);
    if (returnFocus?.isConnected) {
        try {returnFocus.focus({ preventScroll: true });} catch {returnFocus.focus();}
    }
});
</script>

<template>
  <Teleport to="body">
    <div
      class="tavern-shop-dialog-backdrop"
      data-tavern-phone-modal="shop-action"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="tavern-shop-dialog-title"
      @click.self="!busy && emit('cancel')"
    >
      <form
        class="tavern-shop-dialog"
        :class="{ 'is-permanent': permanentConfirm }"
        @submit.prevent="emit('confirm')"
      >
        <header>
          <span>{{ permanentConfirm ? '朱印不可撤' : '规则契约' }}</span>
          <strong id="tavern-shop-dialog-title">{{ title }}</strong>
        </header>
        <p>{{ message }}</p>
        <div
          v-if="intent.kind === 'activate' && !permanentConfirm && item.inputs.length"
          class="tavern-shop-dialog-fields"
        >
          <label
            v-for="input in item.inputs"
            :key="input.key"
          >
            <span>{{ input.label }}</span>
            <input
              :value="parameters[input.key] || ''"
              type="text"
              :required="input.required"
              :maxlength="input.maxLength"
              :placeholder="input.placeholder"
              :list="input.key === 'targetName' ? `shop-targets-${item.id}` : undefined"
              autocomplete="off"
              @input="updateParameter(input.key, ($event.target as HTMLInputElement).value)"
            >
          </label>
          <datalist
            v-if="item.inputs.some((input) => input.key === 'targetName')"
            :id="`shop-targets-${item.id}`"
          >
            <option
              v-for="name in knownTargetNames"
              :key="name"
              :value="name"
            />
          </datalist>
        </div>
        <dl class="tavern-shop-dialog-receipt">
          <div>
            <dt>契约</dt>
            <dd>{{ item.name }}</dd>
          </div>
          <div>
            <dt>{{ intent.kind === 'purchase' ? '价格' : '期限' }}</dt>
            <dd>
              {{ intent.kind === 'purchase'
                ? `${item.price} 小白币`
                : item.duration.kind === 'turns'
                  ? `${item.duration.rounds} 个主回合`
                  : item.duration.kind === 'manual' ? '持续至手动关闭' : '永久' }}
            </dd>
          </div>
          <div
            v-for="input in intent.kind === 'activate' ? item.inputs : []"
            :key="input.key"
          >
            <dt>{{ input.label }}</dt>
            <dd>{{ parameters[input.key] || '尚未填写' }}</dd>
          </div>
        </dl>
        <div
          v-if="error"
          class="tavern-shop-dialog-error"
          role="status"
        >
          {{ error }}
        </div>
        <footer>
          <button
            ref="cancelRef"
            type="button"
            :disabled="busy"
            @click="emit('cancel')"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="busy"
          >
            {{ confirmText }}
          </button>
        </footer>
      </form>
    </div>
  </Teleport>
</template>
