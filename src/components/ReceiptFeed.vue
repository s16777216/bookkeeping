<script setup lang="ts">
import { computed } from "vue";
import type { FinanceEdge, FinanceNode, FinanceTag } from "../types/finance";
import ReceiptCard from "./ReceiptCard.vue";
const props = defineProps<{
  edges: FinanceEdge[];
  nodeMap: Map<string, FinanceNode>;
  tagMap: Map<string, FinanceTag>;
  onDeleteEdge: (id: string) => void;
  onCompleteEdge: (id: string) => void;
  onUndoEdge: (id: string) => void;
  onOpenEntry: () => void;
}>();
const pending = computed(() => props.edges.filter((edge) => !edge.executed_at));
const executed = computed(() => props.edges.filter((edge) => edge.executed_at));
</script>
<template>
  <div class="receipt-feed-container">
    <div class="feed-header-row">
      <b>收據</b><button @click="props.onOpenEntry">＋</button>
    </div>
    <section v-if="pending.length">
      <h3>待執行（應收／應付）</h3>
      <ReceiptCard
        v-for="edge in pending"
        :key="edge.id"
        :edge="edge"
        :node-map="nodeMap"
        :tag-map="tagMap"
        @delete="props.onDeleteEdge"
        @complete="props.onCompleteEdge"
        @undo="props.onUndoEdge"
      />
    </section>
    <section>
      <h3>已執行交易</h3>
      <ReceiptCard
        v-for="edge in executed"
        :key="edge.id"
        :edge="edge"
        :node-map="nodeMap"
        :tag-map="tagMap"
        @delete="props.onDeleteEdge"
        @complete="props.onCompleteEdge"
        @undo="props.onUndoEdge"
      />
      <p v-if="!edges.length" class="empty">尚無交易，開始記一筆吧。</p>
    </section>
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
}
.feed-header-row button {
  border: 0;
  border-radius: 8px;
  padding: 8px 10px;
  background: var(--text-primary);
  color: #fff;
}
h3 {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 18px 0 8px;
}
.empty {
  color: var(--text-secondary);
  font-size: 12px;
}
</style>
