<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useGraphEngine } from "@/composables/useGraphEngine";
import type { FinanceNode } from "@/types/finance";

import HeaderBar from "@/components/common/HeaderBar.vue";
import LedgerView from "@/views/LedgerView.vue";
import GraphView from "@/views/GraphView.vue";
import NodesView from "@/views/NodesView.vue";
import QuickEntrySheet from "@/components/sheets/QuickEntrySheet.vue";
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
  completeEdge,
  undoCompleteEdge,
  softDeleteEdge,
  createTag,
  renameTag,
  archiveTag,
} = useGraphEngine();

const currentTab = ref<"ledger" | "graph" | "nodes">("ledger");
const isQuickEntryOpen = ref<boolean>(false);
const initialFromNode = ref<FinanceNode | null>(null);

onMounted(async () => {
  await init();
});

function handleOpenEntry(node?: FinanceNode) {
  initialFromNode.value = node || null;
  isQuickEntryOpen.value = true;
}

async function handleEntrySubmit(payload: {
  from_node_id: string;
  to_node_id: string;
  amount: number;
  memo: string;
  executed_at: number | null;
  tag_ids: string[];
}) {
  await createEdge(payload);
}

async function handleDeleteEdge(id: string) {
  await softDeleteEdge(id);
}

async function handleCompleteEdge(id: string) {
  await completeEdge(id);
}
async function handleUndoEdge(id: string) {
  await undoCompleteEdge(id);
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
        @delete-edge="handleDeleteEdge"
        @complete-edge="handleCompleteEdge"
        @undo-edge="handleUndoEdge"
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

    <!-- 快速連線記帳底部抽屜 -->
    <QuickEntrySheet
      :is-open="isQuickEntryOpen"
      :nodes="nodes"
      :tags="tags"
      :initial-from-node="initialFromNode"
      :on-create-tag="createTag"
      :on-rename-tag="renameTag"
      :on-archive-tag="archiveTag"
      @close="isQuickEntryOpen = false"
      @submit="handleEntrySubmit"
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
