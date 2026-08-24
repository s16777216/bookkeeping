<script setup lang="ts">
import { computed } from "vue";
import type { FinanceEdge, FinanceNode, FinanceTag } from "../types/finance";
const props = defineProps<{
  edge: FinanceEdge;
  nodeMap: Map<string, FinanceNode>;
  tagMap: Map<string, FinanceTag>;
}>();
const emit = defineEmits<{
  (e: "delete", id: string): void;
  (e: "complete", id: string): void;
  (e: "undo", id: string): void;
}>();
const from = computed(() => props.nodeMap.get(props.edge.from_node_id));
const to = computed(() => props.nodeMap.get(props.edge.to_node_id));
const pending = computed(() => !props.edge.executed_at);
const kind = computed(() =>
  pending.value
    ? from.value?.owner === "external"
      ? "待收款"
      : to.value?.owner === "external"
        ? "待付款"
        : "待執行"
    : from.value?.owner === "external" && to.value?.owner === "me"
      ? "收入"
      : from.value?.owner === "me" && to.value?.owner === "external"
        ? "支出"
        : "轉帳",
);
const tagNames = computed(() =>
  (props.edge.tag_ids || [])
    .map((id) => props.tagMap.get(id)?.name)
    .filter(Boolean),
);
const date = computed(() =>
  new Date(props.edge.executed_at || props.edge.created_at).toLocaleString(
    "zh-TW",
    { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" },
  ),
);
</script>
<template>
  <article class="card" :class="{ pending }">
    <header>
      <span
        >{{ pending ? "⏳" : kind === "收入" ? "💰" : "🧾" }} {{ kind }}</span
      ><small>{{ pending ? "建立於" : "執行於" }} {{ date }}</small>
    </header>
    <strong>{{
      edge.memo || `${from?.name || "未知"} → ${to?.name || "未知"}`
    }}</strong>
    <div class="flow">
      <span>{{ from?.icon }} {{ from?.name || "未知" }}</span
      ><b>→</b><span>{{ to?.icon }} {{ to?.name || "未知" }}</span>
    </div>
    <div v-if="tagNames.length" class="tags">
      <span v-for="tag in tagNames" :key="tag">#{{ tag }}</span>
    </div>
    <footer>
      <b :class="kind === '收入' ? 'income' : kind === '支出' ? 'expense' : ''"
        >NT$ {{ new Intl.NumberFormat("zh-TW").format(edge.amount) }}</b
      >
      <div>
        <button v-if="pending" @click="emit('complete', edge.id)">
          標記完成</button
        ><button v-else class="plain" @click="emit('undo', edge.id)">
          撤回完成</button
        ><button class="plain danger" @click="emit('delete', edge.id)">
          ✕
        </button>
      </div>
    </footer>
  </article>
</template>
<style scoped>
.card {
  padding: 14px;
  margin-bottom: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 12px;
}
.card.pending {
  border-style: dashed;
}
.card header,
.flow,
footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.card header,
small {
  font-size: 11px;
  color: var(--text-secondary);
}
strong {
  display: block;
  margin: 8px 0;
  font-size: 14px;
}
.flow {
  padding: 8px;
  background: var(--bg-container);
  font-size: 12px;
}
.tags {
  display: flex;
  gap: 5px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.tags span {
  font-size: 10px;
  background: var(--bg-container);
  padding: 3px 6px;
  border-radius: 6px;
}
footer {
  margin-top: 10px;
}
.income {
  color: var(--accent-income);
}
.expense,
.danger {
  color: var(--accent-expense);
}
button {
  border: 0;
  border-radius: 7px;
  padding: 6px 8px;
  background: var(--text-primary);
  color: #fff;
  cursor: pointer;
}
.plain {
  background: transparent;
  color: var(--text-secondary);
}
</style>
