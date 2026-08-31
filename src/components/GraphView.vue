<script setup lang="ts">
import { Network } from "lucide-vue-next";
import NodeIcon from "./NodeIcon.vue";
import type {
  CounterpartyBalance,
  FinanceNode,
  SummaryMetrics,
} from "../types/finance";

defineProps<{
  nodes: FinanceNode[];
  metrics: SummaryMetrics;
  getNodeBalance: (id: string) => number;
  receivables: CounterpartyBalance[];
  payables: CounterpartyBalance[];
}>();
const money = (amount: number) =>
  new Intl.NumberFormat("zh-TW").format(Math.abs(amount));
</script>
<template>
  <div class="graph-view-container animate-fade-in">
    <div class="view-header">
      <div class="view-title">
        <Network :size="18" />
        <span>圖論流向與結餘分析</span>
      </div>
      <div class="view-subtitle">已執行交易與待結算承諾分開計算</div>
    </div>
    <section>
      <h3>我的帳戶結餘</h3>
      <div
        v-for="node in nodes.filter((item) => item.owner === 'me')"
        :key="node.id"
        class="row"
      >
        <span class="node-label-group">
          <NodeIcon :name="node.icon" :color="node.color" :size="16" />
          <span>{{ node.name }}</span>
        </span>
        <b>NT$ {{ money(getNodeBalance(node.id)) }}</b>
      </div>
    </section>
    <section>
      <h3>待收款</h3>
      <div v-for="item in receivables" :key="item.node.id" class="row">
        <span class="node-label-group">
          <NodeIcon :name="item.node.icon" :color="item.node.color" :size="16" />
          <span>{{ item.node.name }}</span>
        </span>
        <b class="income">NT$ {{ money(item.amount) }}</b>
      </div>
      <p v-if="!receivables.length">無待收款</p>
    </section>
    <section>
      <h3>待付款</h3>
      <div v-for="item in payables" :key="item.node.id" class="row">
        <span class="node-label-group">
          <NodeIcon :name="item.node.icon" :color="item.node.color" :size="16" />
          <span>{{ item.node.name }}</span>
        </span>
        <b class="expense">NT$ {{ money(item.amount) }}</b>
      </div>
      <p v-if="!payables.length">無待付款</p>
    </section>
  </div>
</template>
<style scoped>
.graph-view-container {
  padding: 16px 20px 30px;
}
.view-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
}
.node-label-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.view-subtitle,
p {
  font-size: 11px;
  color: var(--text-secondary);
}
section {
  margin-top: 14px;
  padding: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 12px;
}
h3 {
  margin: 0 0 8px;
  font-size: 12px;
}
.row {
  display: flex;
  justify-content: space-between;
  padding: 7px 0;
  border-bottom: 1px dashed var(--border-light);
  font-size: 13px;
}
.row:last-child {
  border: 0;
}
.income {
  color: var(--accent-income);
}
.expense {
  color: var(--accent-expense);
}
</style>
