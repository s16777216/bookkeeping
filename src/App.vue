<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGraphEngine } from './composables/useGraphEngine';
import type { FinanceNode } from './types/finance';

import HeaderBar from './components/HeaderBar.vue';
import BalanceBanner from './components/BalanceBanner.vue';
import QuickNodeBar from './components/QuickNodeBar.vue';
import ReceiptFeed from './components/ReceiptFeed.vue';
import QuickEntrySheet from './components/QuickEntrySheet.vue';
import BottomNavBar from './components/BottomNavBar.vue';
import GraphView from './components/GraphView.vue';
import NodesView from './components/NodesView.vue';

const {
  nodes,
  edges,
  nodeMap,
  summaryMetrics,
  init,
  getNodeBalance,
  createNode,
  softDeleteNode,
  createEdge,
  softDeleteEdge,
  resetToDefaults
} = useGraphEngine();

const currentTab = ref<'ledger' | 'graph' | 'nodes'>('ledger');
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
  timestamp?: number;
}) {
  await createEdge(payload);
}

async function handleDeleteEdge(id: string) {
  await softDeleteEdge(id);
}

async function handleResetData() {
  if (window.confirm('確定要將資料庫重置為預設示範資料嗎？')) {
    await resetToDefaults();
  }
}
</script>

<template>
  <div class="app-container">
    <!-- 頂部狀態列 -->
    <HeaderBar :on-reset-data="handleResetData" />

    <!-- 1. 收據帳本分頁 (Ledger Tab) -->
    <main v-if="currentTab === 'ledger'" class="tab-content animate-fade-in">
      <!-- 總資產與收支看板 -->
      <BalanceBanner :metrics="summaryMetrics" />

      <!-- 常用節點橫向滑動列 -->
      <QuickNodeBar
        :nodes="nodes"
        :get-node-balance="getNodeBalance"
        @select-node="handleOpenEntry"
      />

      <!-- 近期數位收據清單 -->
      <ReceiptFeed
        :edges="edges"
        :node-map="nodeMap"
        :on-delete-edge="handleDeleteEdge"
        :on-open-entry="() => handleOpenEntry()"
      />
    </main>

    <!-- 2. 圖論分析分頁 (Graph Tab) -->
    <main v-else-if="currentTab === 'graph'" class="tab-content">
      <GraphView
        :nodes="nodes"
        :metrics="summaryMetrics"
        :get-node-balance="getNodeBalance"
      />
    </main>

    <!-- 3. 帳戶與分類管理 (Nodes Tab) -->
    <main v-else-if="currentTab === 'nodes'" class="tab-content">
      <NodesView
        :nodes="nodes"
        :on-create-node="createNode"
        :on-delete-node="softDeleteNode"
      />
    </main>

    <!-- 底部導航與懸浮記帳按鈕 -->
    <BottomNavBar
      :current-tab="currentTab"
      @change-tab="(tab) => currentTab = tab"
      @open-entry="() => handleOpenEntry()"
    />

    <!-- 快速連線記帳底部抽屜 -->
    <QuickEntrySheet
      :is-open="isQuickEntryOpen"
      :nodes="nodes"
      :initial-from-node="initialFromNode"
      @close="isQuickEntryOpen = false"
      @submit="handleEntrySubmit"
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
