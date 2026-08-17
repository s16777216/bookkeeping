<script setup lang="ts">
import type { FinanceNode } from '../types/finance';

const props = defineProps<{
  nodes: FinanceNode[];
  getNodeBalance: (id: string) => number;
}>();

const emit = defineEmits<{
  (e: 'selectNode', node: FinanceNode): void;
}>();

function formatNodeBalance(node: FinanceNode): string {
  const balance = props.getNodeBalance(node.id);
  const formatted = new Intl.NumberFormat('zh-TW').format(Math.abs(balance));
  if (node.type === 'asset') {
    return `$${formatted}`;
  } else if (node.type === 'expense') {
    return `$${formatted}`;
  } else if (node.type === 'income') {
    return `+$${formatted}`;
  }
  return `$${formatted}`;
}
</script>

<template>
  <div class="node-bar-container">
    <div class="section-title-row">
      <span class="section-title">常用帳戶與分類</span>
      <span class="scroll-hint">橫向滑動 ➔</span>
    </div>
    <div class="node-scroll-view">
      <button
        v-for="node in props.nodes"
        :key="node.id"
        class="node-chip"
        :class="`type-${node.type}`"
        @click="emit('selectNode', node)"
      >
        <span class="node-icon">{{ node.icon || '📌' }}</span>
        <div class="node-info">
          <span class="node-name">{{ node.name }}</span>
          <span class="node-balance font-mono">{{ formatNodeBalance(node) }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.node-bar-container {
  padding: 12px 20px 6px;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.scroll-hint {
  font-size: 10px;
  color: var(--text-muted);
}

.node-scroll-view {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.node-scroll-view::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.node-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  min-width: fit-content;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.15s ease;
  white-space: nowrap;
}

.node-chip:hover {
  border-color: var(--border-dashed);
  background-color: #FAFAFA;
}

.node-chip:active {
  transform: scale(0.96);
}

.node-icon {
  font-size: 16px;
}

.node-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.node-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.node-balance {
  font-size: 11px;
  color: var(--text-secondary);
}

.type-asset .node-balance {
  color: var(--text-primary);
  font-weight: 600;
}

.type-income .node-balance {
  color: var(--accent-income);
}

.type-expense .node-balance {
  color: var(--text-secondary);
}
</style>
