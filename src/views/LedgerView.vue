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
  (e: "editEdge", edge: FinanceEdge): void;
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
      :on-select-edge="(edge) => emit('editEdge', edge)"
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
