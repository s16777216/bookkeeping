<script setup lang="ts">
import type { FinanceEdge, FinanceNode } from '../types/finance';
import ReceiptCard from './ReceiptCard.vue';

const props = defineProps<{
  edges: FinanceEdge[];
  nodeMap: Map<string, FinanceNode>;
  onDeleteEdge: (id: string) => void;
  onOpenEntry: () => void;
}>();
</script>

<template>
  <div class="receipt-feed-container">
    <div class="feed-header-row">
      <div class="feed-title">近期收據明細 RECENT RECEIPTS</div>
      <div class="receipt-count font-mono">{{ props.edges.length }} 筆</div>
    </div>

    <!-- 收據清單 -->
    <div v-if="props.edges.length > 0" class="receipt-list">
      <ReceiptCard
        v-for="edge in props.edges"
        :key="edge.id"
        :edge="edge"
        :node-map="props.nodeMap"
        @delete="props.onDeleteEdge"
      />
    </div>

    <!-- 空狀態 -->
    <div v-else class="empty-state">
      <div class="empty-icon">🧾</div>
      <div class="empty-title">目前尚無收據紀錄</div>
      <div class="empty-subtitle">點擊下方按鈕或頂部帳戶快速記錄第一筆資金流動</div>
      <button class="empty-action-btn" @click="props.onOpenEntry">
        ＋ 記一筆新收據
      </button>
    </div>
  </div>
</template>

<style scoped>
.receipt-feed-container {
  padding: 14px 20px 30px;
  flex: 1;
}

.feed-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.feed-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.receipt-count {
  font-size: 11px;
  color: var(--text-muted);
}

.receipt-list {
  display: flex;
  flex-direction: column;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: var(--bg-surface);
  border: 1px dashed var(--border-dashed);
  border-radius: var(--radius-md);
  text-align: center;
}

.empty-icon {
  font-size: 36px;
  margin-bottom: 12px;
  opacity: 0.8;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.empty-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 18px;
  line-height: 1.5;
}

.empty-action-btn {
  background-color: var(--text-primary);
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-action-btn:hover {
  background-color: #333333;
}

.empty-action-btn:active {
  transform: scale(0.96);
}
</style>
