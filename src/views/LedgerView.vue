<script setup lang="ts">
import type {
  FinanceEdge,
  FinanceNode,
  FinanceTag,
  SummaryMetrics,
} from "@/types/finance";
import BalanceBanner from "@/components/ledger/BalanceBanner.vue";
import QuickNodeBar from "@/components/ledger/QuickNodeBar.vue";
import ReceiptFeed from "@/components/ledger/ReceiptFeed.vue";

defineProps<{
  metrics: SummaryMetrics;
  nodes: FinanceNode[];
  edges: FinanceEdge[];
  nodeMap: Map<string, FinanceNode>;
  tagMap: Map<string, FinanceTag>;
  getNodeBalance: (id: string) => number;
}>();

const emit = defineEmits<{
  (e: "openEntry", node?: FinanceNode): void;
  (e: "deleteEdge", id: string): void;
  (e: "completeEdge", id: string): void;
  (e: "undoEdge", id: string): void;
}>();
</script>

<template>
  <div class="ledger-view animate-fade-in">
    <!-- 總資產與收支看板 -->
    <BalanceBanner :metrics="metrics" />

    <!-- 常用節點橫向滑動列 -->
    <QuickNodeBar
      :nodes="nodes"
      :get-node-balance="getNodeBalance"
      @select-node="(node) => emit('openEntry', node)"
    />

    <!-- 近期數位收據清單 -->
    <ReceiptFeed
      :edges="edges"
      :node-map="nodeMap"
      :tag-map="tagMap"
      :on-delete-edge="(id) => emit('deleteEdge', id)"
      :on-complete-edge="(id) => emit('completeEdge', id)"
      :on-undo-edge="(id) => emit('undoEdge', id)"
      :on-open-entry="() => emit('openEntry')"
    />
  </div>
</template>

<style scoped>
.ledger-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
