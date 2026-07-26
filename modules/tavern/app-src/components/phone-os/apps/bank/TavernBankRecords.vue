<script setup lang="ts">
import { computed, watch } from 'vue';
import { useTavernPhoneContext, useTavernSessionContext } from '../../../tavern-app-context';
import { useTavernEphemeralDisclosureScope } from '../../../useTavernEphemeralDisclosureScope';
import { projectTavernBankRecordsSummary } from '../../../../features/phone-os/apps/bank/tavern-bank-presentation';

const phone = useTavernPhoneContext();
const session = useTavernSessionContext();
const recordDisclosure = useTavernEphemeralDisclosureScope();

const rows = computed(() => phone.bank.activities.value);
const summary = computed(() => projectTavernBankRecordsSummary(rows.value));

watch(session.selectedSessionId, recordDisclosure.reset);
</script>

<template>
  <div class="tavern-bank-scroll">
    <div
      v-if="phone.bank.loadError.value"
      class="tavern-bank-notice"
    >
      <strong>记录读取失败</strong>
      <p>{{ phone.bank.loadError.value }}</p>
      <button
        type="button"
        @click="phone.bank.refreshBank"
      >
        重试
      </button>
    </div>

    <template v-else>
      <section class="tavern-bank-records-summary">
        <div
          class="tavern-bank-records-net"
          :class="{ 'is-positive': summary.netTotal > 0, 'is-negative': summary.netTotal < 0 }"
        >
          <small>近 {{ rows.length }} 笔盈亏</small>
          <strong>{{ summary.netTotalLabel }}</strong>
          <span>币</span>
        </div>
        <div class="tavern-bank-records-win">
          <small>游戏胜局</small>
          <strong>{{ summary.winCount }} / {{ summary.gameCount }}</strong>
          <span>胜率 {{ summary.winRatioLabel }}</span>
        </div>
      </section>

      <p
        v-if="!rows.length"
        class="tavern-bank-empty-copy"
      >
        还没有任何银行流水。存单到期、理财结算与牌局收尾都会记在这里。
      </p>

      <ol
        v-else
        class="tavern-bank-records-list"
      >
        <li
          v-for="row in rows"
          :key="row.record.id"
          class="tavern-bank-record"
        >
          <div class="tavern-bank-record-body">
            <strong>{{ row.title }}</strong>
            <span>{{ row.outcomeLabel }}</span>
          </div>
          <b
            class="tavern-bank-record-net"
            :class="{ 'is-positive': row.positive, 'is-negative': row.negative }"
          >
            {{ row.netLabel }}
          </b>
          <details
            class="tavern-bank-record-detail"
            :open="recordDisclosure.isOpen(row.record.id)"
            @toggle="recordDisclosure.setOpenFromEvent(row.record.id, $event)"
          >
            <summary>查看结算凭证</summary>
            <dl v-if="recordDisclosure.isOpen(row.record.id)">
              <div
                v-for="detail in row.detailRows"
                :key="detail.label"
              >
                <dt>{{ detail.label }}</dt>
                <dd>{{ detail.value }}</dd>
              </div>
            </dl>
          </details>
        </li>
      </ol>
    </template>
  </div>
</template>
