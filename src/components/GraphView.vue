<script setup lang="ts">
import { computed } from 'vue';
import type { FinanceNode, SummaryMetrics } from '../types/finance';

const props = defineProps<{
  nodes: FinanceNode[];
  metrics: SummaryMetrics;
  getNodeBalance: (id: string) => number;
}>();

function formatAmount(amt: number): string {
  return new Intl.NumberFormat('zh-TW').format(Math.abs(amt));
}

const assetList = computed(() => props.nodes.filter((n) => n.type === 'asset'));
const expenseList = computed(() => props.nodes.filter((n) => n.type === 'expense'));
const incomeList = computed(() => props.nodes.filter((n) => n.type === 'income'));
</script>

<template>
  <div class="graph-view-container animate-fade-in">
    <div class="view-header">
      <div class="view-title">📊 圖論流向與結餘分析</div>
      <div class="view-subtitle">基於入度 (In-degree) 與出度 (Out-degree) 運算結果</div>
    </div>

    <!-- 1. 資產結餘 (Inflow - Outflow) -->
    <div class="analysis-section">
      <div class="section-badge">資產節點 ASSETS (淨流入結餘)</div>
      <div class="node-table">
        <div v-for="node in assetList" :key="node.id" class="table-row">
          <div class="row-left">
            <span class="row-icon">{{ node.icon }}</span>
            <span class="row-name">{{ node.name }}</span>
          </div>
          <div class="row-value font-mono">
            ${{ formatAmount(props.getNodeBalance(node.id)) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 支出累計 (Total Inflow) -->
    <div class="analysis-section">
      <div class="section-badge">支出類別 EXPENSES (累計流入)</div>
      <div class="node-table">
        <div v-for="node in expenseList" :key="node.id" class="table-row">
          <div class="row-left">
            <span class="row-icon">{{ node.icon }}</span>
            <span class="row-name">{{ node.name }}</span>
          </div>
          <div class="row-value text-expense font-mono">
            -${{ formatAmount(props.getNodeBalance(node.id)) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 收入累計 (Total Outflow) -->
    <div class="analysis-section">
      <div class="section-badge">收入來源 INCOME (累計流出)</div>
      <div class="node-table">
        <div v-for="node in incomeList" :key="node.id" class="table-row">
          <div class="row-left">
            <span class="row-icon">{{ node.icon }}</span>
            <span class="row-name">{{ node.name }}</span>
          </div>
          <div class="row-value text-income font-mono">
            +${{ formatAmount(props.getNodeBalance(node.id)) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.graph-view-container {
  padding: 16px 20px 30px;
}

.view-header {
  margin-bottom: 16px;
}

.view-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.view-subtitle {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.analysis-section {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 14px;
  box-shadow: var(--shadow-sm);
}

.section-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.node-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed var(--border-light);
}

.table-row:last-child {
  border-bottom: none;
}

.row-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-icon {
  font-size: 14px;
}

.row-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.row-value {
  font-size: 14px;
  font-weight: 600;
}
</style>
