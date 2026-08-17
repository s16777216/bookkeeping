<script setup lang="ts">
import { computed } from 'vue';
import type { FinanceEdge, FinanceNode } from '../types/finance';

const props = defineProps<{
  edge: FinanceEdge;
  nodeMap: Map<string, FinanceNode>;
}>();

const emit = defineEmits<{
  (e: 'delete', id: string): void;
}>();

const fromNode = computed(() => props.nodeMap.get(props.edge.from_node_id));
const toNode = computed(() => props.nodeMap.get(props.edge.to_node_id));

const isIncome = computed(() => fromNode.value?.type === 'income');

const formattedTime = computed(() => {
  const date = new Date(props.edge.timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
});

const formattedDate = computed(() => {
  const date = new Date(props.edge.timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
});

const formattedAmount = computed(() => {
  const amt = new Intl.NumberFormat('zh-TW').format(props.edge.amount);
  return isIncome.value ? `+NT$ ${amt}` : `NT$ ${amt}`;
});

const displayMemo = computed(() => {
  if (props.edge.memo && props.edge.memo.trim()) {
    return props.edge.memo;
  }
  return `${fromNode.value?.name || '未知'} ➔ ${toNode.value?.name || '未知'}`;
});
</script>

<template>
  <div class="receipt-card animate-fade-in" :class="{ 'income-receipt': isIncome }">
    <!-- 撕紙鋸齒頂部邊緣視覺 -->
    <div class="receipt-serration-top"></div>

    <div class="receipt-header">
      <div class="receipt-title-group">
        <span class="receipt-icon">{{ isIncome ? '💼' : '🧾' }}</span>
        <span class="receipt-title">{{ displayMemo }}</span>
      </div>
      <div class="receipt-timestamp font-mono">
        {{ formattedDate }} {{ formattedTime }}
      </div>
    </div>

    <!-- 資金流動路徑 (Graph Flow) -->
    <div class="graph-flow-row">
      <div class="node-badge">
        <span class="badge-icon">{{ fromNode?.icon || '📦' }}</span>
        <span class="badge-name">{{ fromNode?.name || '未知起點' }}</span>
      </div>
      <span class="flow-arrow font-mono">➔</span>
      <div class="node-badge">
        <span class="badge-icon">{{ toNode?.icon || '📦' }}</span>
        <span class="badge-name">{{ toNode?.name || '未知終點' }}</span>
      </div>
    </div>

    <!-- 虛線裁切線 -->
    <div class="receipt-cut-line"></div>

    <!-- 收據底部資訊 (金額與條碼) -->
    <div class="receipt-footer">
      <div class="receipt-code-group">
        <span class="receipt-id font-mono">#{{ edge.id.slice(-8) }}</span>
        <!-- 精緻裝飾條碼 -->
        <div class="barcode-graphic" aria-hidden="true">
          <span class="bar b1"></span>
          <span class="bar b2"></span>
          <span class="bar b1"></span>
          <span class="bar b3"></span>
          <span class="bar b2"></span>
          <span class="bar b1"></span>
          <span class="bar b2"></span>
          <span class="bar b3"></span>
          <span class="bar b1"></span>
        </div>
      </div>

      <div class="receipt-amount-group">
        <div class="receipt-amount font-mono" :class="isIncome ? 'text-income' : 'text-primary'">
          {{ formattedAmount }}
        </div>
        <button class="delete-btn" title="刪除此筆收據" @click.stop="emit('delete', edge.id)">
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.receipt-card {
  position: relative;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 16px 16px 14px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.receipt-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-dashed);
}

.receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.receipt-title-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.receipt-icon {
  font-size: 15px;
}

.receipt-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.receipt-timestamp {
  font-size: 11px;
  color: var(--text-muted);
}

/* 圖論流向 */
.graph-flow-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--bg-container);
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.node-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.badge-icon {
  font-size: 13px;
}

.flow-arrow {
  color: var(--text-muted);
  font-size: 13px;
}

/* 虛線裁切線 */
.receipt-cut-line {
  height: 1px;
  background-image: linear-gradient(to right, var(--border-dashed) 50%, rgba(255,255,255,0) 0%);
  background-position: top;
  background-size: 6px 1px;
  background-repeat: repeat-x;
  margin: 10px 0 12px;
}

/* 底部金額與條碼 */
.receipt-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.receipt-code-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.receipt-id {
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.barcode-graphic {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
}

.bar {
  background-color: var(--text-muted);
  opacity: 0.6;
}

.b1 { width: 1.5px; height: 100%; }
.b2 { width: 3px; height: 80%; }
.b3 { width: 2px; height: 90%; }

.receipt-amount-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.receipt-amount {
  font-size: 18px;
  font-weight: 700;
}

.text-primary {
  color: var(--text-primary);
}

.delete-btn {
  background: none;
  border: none;
  font-size: 13px;
  color: var(--text-muted);
  padding: 4px 6px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.delete-btn:hover {
  background-color: var(--accent-expense-bg);
  color: var(--accent-expense);
}
</style>
