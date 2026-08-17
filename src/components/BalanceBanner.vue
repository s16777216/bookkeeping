<script setup lang="ts">
import type { SummaryMetrics } from '../types/finance';

const props = defineProps<{
  metrics: SummaryMetrics;
}>();

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('zh-TW').format(amount);
}
</script>

<template>
  <div class="balance-banner">
    <div class="banner-card">
      <div class="balance-label">總資產 TOTAL BALANCE</div>
      <div class="balance-amount font-mono">
        <span class="currency-symbol">$</span>{{ formatAmount(props.metrics.totalAssets) }}
        <span class="currency-unit">TWD</span>
      </div>

      <div class="metrics-divider"></div>

      <div class="metrics-row">
        <div class="metric-item">
          <div class="metric-label">＋ 收入 INFLOW</div>
          <div class="metric-value text-income font-mono">
            +${{ formatAmount(props.metrics.totalIncome) }}
          </div>
        </div>
        <div class="metric-separator"></div>
        <div class="metric-item">
          <div class="metric-label">－ 支出 OUTFLOW</div>
          <div class="metric-value text-expense font-mono">
            -${{ formatAmount(props.metrics.totalExpense) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.balance-banner {
  padding: 16px 20px 8px;
}

.banner-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 20px 18px 16px;
  box-shadow: var(--shadow-sm);
  text-align: center;
  position: relative;
}

.balance-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.balance-amount {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 6px 0 14px;
  letter-spacing: -0.02em;
}

.currency-symbol {
  font-size: 20px;
  font-weight: 500;
  margin-right: 2px;
  color: var(--text-secondary);
}

.currency-unit {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-left: 4px;
}

.metrics-divider {
  height: 1px;
  background-image: linear-gradient(to right, var(--border-dashed) 50%, rgba(255,255,255,0) 0%);
  background-position: top;
  background-size: 8px 1px;
  background-repeat: repeat-x;
  margin: 12px 0 14px;
}

.metrics-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.metric-item {
  flex: 1;
  text-align: center;
}

.metric-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
}

.metric-separator {
  width: 1px;
  height: 24px;
  background-color: var(--border-light);
}
</style>
