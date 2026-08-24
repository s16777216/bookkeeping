<script setup lang="ts">
import { computed } from "vue";
import type { FinanceNode } from "../types/finance";
const props = defineProps<{
  nodes: FinanceNode[];
  getNodeBalance: (id: string) => number;
}>();
const emit = defineEmits<{ (e: "selectNode", node: FinanceNode): void }>();
const mine = computed(() => props.nodes.filter((node) => node.owner === "me"));
const money = (node: FinanceNode) =>
  `NT$ ${new Intl.NumberFormat("zh-TW").format(Math.abs(props.getNodeBalance(node.id)))}`;
</script>
<template>
  <div class="node-bar-container">
    <div class="section-title-row">
      <span>我的帳戶</span><span>橫向滑動 →</span>
    </div>
    <div class="node-scroll-view">
      <button
        v-for="node in mine"
        :key="node.id"
        class="node-chip"
        @click="emit('selectNode', node)"
      >
        <span>{{ node.icon || "🏦" }}</span
        ><span
          ><b>{{ node.name }}</b
          ><small>{{ money(node) }}</small></span
        >
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
  font-size: 11px;
  color: var(--text-secondary);
}
.node-scroll-view {
  display: flex;
  gap: 8px;
  overflow: auto;
  padding: 8px 0;
}
.node-chip {
  display: flex;
  gap: 8px;
  align-items: center;
  white-space: nowrap;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 8px;
  color: var(--text-primary);
}
.node-chip b,
.node-chip small {
  display: block;
  text-align: left;
  font-size: 11px;
}
.node-chip small {
  color: var(--text-secondary);
}
</style>
