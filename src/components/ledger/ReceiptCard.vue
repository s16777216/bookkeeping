<script setup lang="ts">
import { computed } from "vue";
import {
  ArrowRight,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Layers,
  CheckCircle2,
} from "lucide-vue-next";
import NodeIcon from "@/components/common/NodeIcon.vue";
import type { FinanceEdge, FinanceNode, FinanceTag } from "@/types/finance";

const props = defineProps<{
  edge: FinanceEdge;
  nodeMap: Map<string, FinanceNode>;
  tagMap: Map<string, FinanceTag>;
}>();

const emit = defineEmits<{
  (e: "select", edge: FinanceEdge): void;
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

const hasItems = computed(
  () => Boolean(props.edge.items && props.edge.items.length > 0),
);
const itemCount = computed(() => props.edge.items?.length || 0);

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
  <article
    class="card"
    :class="{ pending }"
    @click="emit('select', edge)"
  >
    <header>
      <span class="card-status-badge">
        <Clock v-if="pending" :size="13" />
        <ArrowDownLeft v-else-if="kind === '收入'" :size="13" />
        <ArrowUpRight v-else-if="kind === '支出'" :size="13" />
        <ArrowLeftRight v-else :size="13" />
        {{ kind }}
      </span>
      <div class="header-right">
        <span v-if="edge.receipt_no" class="receipt-no">{{ edge.receipt_no }}</span>
        <small>{{ pending ? "建立於" : "執行於" }} {{ date }}</small>
      </div>
    </header>

    <div class="card-title-row">
      <strong>{{
        edge.memo || `${from?.name || "未知"} → ${to?.name || "未知"}`
      }}</strong>
      <span v-if="hasItems" class="items-count-badge">
        <Layers :size="12" />
        <span>{{ itemCount }} 項明細</span>
      </span>
    </div>

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
      <b :class="kind === '收入' ? 'income' : kind === '支出' ? 'expense' : ''">
        NT$ {{ new Intl.NumberFormat("zh-TW").format(edge.amount) }}
      </b>
      <div class="execution-badge" :class="{ 'is-pending': pending }">
        <Clock v-if="pending" :size="12" />
        <CheckCircle2 v-else :size="12" />
        <span>{{ pending ? "未執行" : "已完成" }}</span>
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
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  -webkit-user-select: none;
}
.card:hover {
  border-color: var(--border-dashed);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}
.card:active {
  transform: scale(0.99);
  background: var(--bg-container);
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
.header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}
.receipt-no {
  font-size: 10px;
  font-family: "JetBrains Mono", monospace;
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: 4px;
  padding: 1px 4px;
  color: var(--text-secondary);
}
.card header,
small {
  font-size: 11px;
  color: var(--text-secondary);
}
.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
}
strong {
  font-size: 14px;
  color: var(--text-primary);
}
.items-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--bg-container);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}
.flow {
  padding: 8px 10px;
  background: var(--bg-container);
  border-radius: 8px;
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
.execution-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--bg-container);
  color: var(--accent-income);
  font-weight: 500;
}
.execution-badge.is-pending {
  color: var(--text-secondary);
}
</style>
