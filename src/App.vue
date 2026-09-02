<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useGraphEngine } from "@/composables/useGraphEngine";
import type { FinanceEdge, FinanceNode, ReceiptItem } from "@/types/finance";

import HeaderBar from "@/components/common/HeaderBar.vue";
import LedgerView from "@/views/LedgerView.vue";
import GraphView from "@/views/GraphView.vue";
import NodesView from "@/views/NodesView.vue";
import ReceiptFormSheet from "@/components/sheets/ReceiptFormSheet.vue";
import BottomNavBar from "@/components/common/BottomNavBar.vue";

const {
  nodes,
  edges,
  nodeMap,
  tagMap,
  summaryMetrics,
  pendingReceivables,
  pendingPayables,
  tags,
  init,
  getNodeBalance,
  createNode,
  updateNode,
  archiveNode,
  createEdge,
  updateEdge,
  softDeleteEdge,
  createTag,
  renameTag,
  archiveTag,
} = useGraphEngine();

const currentTab = ref<"ledger" | "graph" | "nodes">("ledger");
const isReceiptFormOpen = ref<boolean>(false);
const initialFromNode = ref<FinanceNode | null>(null);
const selectedEdge = ref<FinanceEdge | null>(null);

onMounted(async () => {
  await init();
});

function handleOpenEntry(node?: FinanceNode) {
  selectedEdge.value = null;
  initialFromNode.value = node || null;
  isReceiptFormOpen.value = true;
}

function handleEditEdge(edge: FinanceEdge) {
  selectedEdge.value = edge;
  initialFromNode.value = null;
  isReceiptFormOpen.value = true;
}

async function handleReceiptSubmit(payload: {
  id?: string;
  from_node_id: string;
  to_node_id: string;
  amount: number;
  memo: string;
  executed_at: number | null;
  tag_ids: string[];
  items?: ReceiptItem[];
}) {
  if (payload.id) {
    await updateEdge(payload.id, {
      from_node_id: payload.from_node_id,
      to_node_id: payload.to_node_id,
      amount: payload.amount,
      memo: payload.memo,
      executed_at: payload.executed_at,
      tag_ids: payload.tag_ids,
      items: payload.items,
    });
  } else {
    await createEdge(payload);
  }
}

async function handleReceiptDelete(id: string) {
  await softDeleteEdge(id);
}
</script>

<template>
  <div class="app-container">
    <!-- 頂部狀態列 -->
    <HeaderBar />

    <!-- 1. 收據帳本分頁 (Ledger Tab) -->
    <main v-if="currentTab === 'ledger'" class="tab-content">
      <LedgerView
        :metrics="summaryMetrics"
        :nodes="nodes"
        :edges="edges"
        :node-map="nodeMap"
        :tag-map="tagMap"
        :get-node-balance="getNodeBalance"
        @open-entry="handleOpenEntry"
        @edit-edge="handleEditEdge"
      />
    </main>

    <!-- 2. 圖論分析分頁 (Graph Tab) -->
    <main v-else-if="currentTab === 'graph'" class="tab-content">
      <GraphView
        :nodes="nodes"
        :metrics="summaryMetrics"
        :get-node-balance="getNodeBalance"
        :receivables="pendingReceivables"
        :payables="pendingPayables"
      />
    </main>

    <!-- 3. 帳戶與分類管理 (Nodes Tab) -->
    <main v-else-if="currentTab === 'nodes'" class="tab-content">
      <NodesView
        :nodes="nodes"
        :on-create-node="createNode"
        :on-update-node="updateNode"
        :on-archive-node="archiveNode"
      />
    </main>

    <!-- 通用收據表單抽屜（支援建立與編輯） -->
    <ReceiptFormSheet
      :is-open="isReceiptFormOpen"
      :nodes="nodes"
      :tags="tags"
      :initial-from-node="initialFromNode"
      :initial-edge="selectedEdge"
      :on-create-tag="createTag"
      :on-rename-tag="renameTag"
      :on-archive-tag="archiveTag"
      @close="isReceiptFormOpen = false"
      @submit="handleReceiptSubmit"
      @delete="handleReceiptDelete"
    />

    <!-- 底部導航與懸浮記帳按鈕 -->
    <BottomNavBar
      :current-tab="currentTab"
      @change-tab="(tab) => (currentTab = tab)"
      @open-entry="() => handleOpenEntry()"
    />
  </div>
</template>

<style scoped>
.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
