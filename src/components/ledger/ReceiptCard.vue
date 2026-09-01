<script setup lang="ts">
import { computed } from "vue";
import { ArrowRight, Trash2, Clock, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-vue-next";
import NodeIcon from "@/components/common/NodeIcon.vue";
import type { FinanceEdge, FinanceNode, FinanceTag } from "@/types/finance";

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
      <span class="card-status-badge">
        <Clock v-if="pending" :size="13" />
        <ArrowDownLeft v-else-if="kind === '收入'" :size="13" />
        <ArrowUpRight v-else-if="kind === '支出'" :size="13" />
        <ArrowLeftRight v-else :size="13" />
        {{ kind }}
      </span>
      <small>{{ pending ? "建立於" : "執行於" }} {{ date }}</small>
    </header>
    <strong>{{
      edge.memo || `${from?.name || "未知"} → ${to?.name || "未知"}`
    }}</strong>
    <div class="flow">
      <span class="flow-node">
        <NodeIcon :name="from?.icon" :color="from?.color" :size="16" />
        <span>{{ from?.name || "未知" }}</span>
      </span>
      <ArrowRight :size="14" class="flow-arrow" />
      <span class="flow-node">
        <NodeIcon :name="to?.icon" :color="to?.color" :size="16" />
        <span>{{ to?.name || "未知" }}</span>
      </span>
    </div>
    <div v-if="tagNames.length" class="tags">
      <span v-for="tag in tagNames" :key="tag">#{{ tag }}</span>
    </div>
    <footer>
      <b :class="kind === '收入' ? 'income' : kind === '支出' ? 'expense' : ''"
        >NT$ {{ new Intl.NumberFormat("zh-TW").format(edge.amount) }}</b
      >
      <div class="card-actions">
        <button v-if="pending" @click="emit('complete', edge.id)">
          標記完成</button
        ><button v-else class="plain" @click="emit('undo', edge.id)">
          撤回完成</button
        ><button class="plain danger btn-icon" title="刪除收據" @click="emit('delete', edge.id)">
          <Trash2 :size="14" />
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
.card-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}
.flow-node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.flow-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
}
.card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
}
</style>
