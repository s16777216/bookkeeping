<script setup lang="ts">
import { Receipt, Network, Plus, WalletCards } from "lucide-vue-next";

const props = defineProps<{
  currentTab: "ledger" | "graph" | "nodes";
}>();

const emit = defineEmits<{
  (e: "changeTab", tab: "ledger" | "graph" | "nodes"): void;
  (e: "openEntry"): void;
}>();
</script>

<template>
  <nav class="bottom-nav-bar">
    <button
      class="nav-item"
      :class="{ active: props.currentTab === 'ledger' }"
      @click="emit('changeTab', 'ledger')"
    >
      <span class="nav-icon"><Receipt :size="20" :stroke-width="props.currentTab === 'ledger' ? 2.25 : 1.75" /></span>
      <span class="nav-label">收據帳本</span>
    </button>

    <button
      class="nav-item"
      :class="{ active: props.currentTab === 'graph' }"
      @click="emit('changeTab', 'graph')"
    >
      <span class="nav-icon"><Network :size="20" :stroke-width="props.currentTab === 'graph' ? 2.25 : 1.75" /></span>
      <span class="nav-label">圖論分析</span>
    </button>

    <!-- 中央懸浮主要動作按鈕 -->
    <div class="nav-fab-wrapper">
      <button
        class="nav-fab-btn"
        title="記一筆新收據"
        @click="emit('openEntry')"
      >
        <Plus :size="24" :stroke-width="2.5" />
      </button>
    </div>

    <button
      class="nav-item"
      :class="{ active: props.currentTab === 'nodes' }"
      @click="emit('changeTab', 'nodes')"
    >
      <span class="nav-icon"><WalletCards :size="20" :stroke-width="props.currentTab === 'nodes' ? 2.25 : 1.75" /></span>
      <span class="nav-label">帳戶管理</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-nav-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  min-height: calc(58px + env(safe-area-inset-bottom, 0px));
  background-color: var(--bg-surface);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  padding-top: 8px;
  padding-bottom: max(16px, env(safe-area-inset-bottom, 16px));
  z-index: 500;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  gap: 2px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 12px;
  transition: all 0.15s ease;
}

.nav-item.active {
  color: var(--text-primary);
  font-weight: 600;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
}

.nav-label {
  font-size: 10px;
  letter-spacing: 0.02em;
}

.nav-fab-wrapper {
  transform: translateY(-50%);
}

.nav-fab-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: var(--text-primary);
  color: #ffffff;
  border: 3px solid var(--bg-surface);
  box-shadow: var(--shadow-float);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-fab-btn:hover {
  transform: scale(1.06);
  background-color: #333333;
}

.nav-fab-btn:active {
  transform: scale(0.94);
}
</style>
