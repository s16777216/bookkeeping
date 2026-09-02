<script setup lang="ts">
import { computed, ref } from "vue";
import {
  ArrowRight,
  Trash2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-vue-next";
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

const isExpanded = ref(false);

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
  <article class="card" :class="{ pending }">
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
      <button
        v-if="hasItems"
        type="button"
        class="items-toggle-badge"
        :class="{ active: isExpanded }"
        @click="isExpanded = !isExpanded"
      >
        <Layers :size="12" />
        <span>{{ itemCount }} 項明細</span>
        <ChevronUp v-if="isExpanded" :size="12" />
        <ChevronDown v-else :size="12" />
      </button>
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

    <!-- 擬真超商小票明細展開區 -->
    <div v-if="hasItems && isExpanded" class="receipt-breakdown">
      <div class="receipt-slip-header">
        <span>品項清單</span>
        <span>小計</span>
      </div>
      <div class="receipt-slip-items">
        <div
          v-for="(item, index) in edge.items"
          :key="item.id || index"
          class="receipt-slip-row"
        >
          <div class="slip-item-info">
            <span class="slip-item-name">{{ item.name }}</span>
            <span v-if="item.quantity && item.quantity > 1" class="slip-item-qty">
              x{{ item.quantity }}
            </span>
          </div>
          <span class="slip-item-amount">
            NT$ {{ new Intl.NumberFormat("zh-TW").format(item.amount) }}
          </span>
        </div>
      </div>
      <div class="receipt-slip-footer">
        <span>共 {{ itemCount }} 項</span>
        <span class="slip-total">
          合計 NT$ {{ new Intl.NumberFormat("zh-TW").format(edge.amount) }}
        </span>
      </div>
    </div>

    <div v-if="tagNames.length" class="tags">
      <span v-for="tag in tagNames" :key="tag">#{{ tag }}</span>
    </div>

    <footer>
      <b :class="kind === '收入' ? 'income' : kind === '支出' ? 'expense' : ''">
        NT$ {{ new Intl.NumberFormat("zh-TW").format(edge.amount) }}
      </b>
      <div class="card-actions">
        <button v-if="pending" @click="emit('complete', edge.id)">
          標記完成
        </button>
        <button v-else class="plain" @click="emit('undo', edge.id)">
          撤回完成
        </button>
        <button
          class="plain danger btn-icon"
          title="刪除收據"
          @click="emit('delete', edge.id)"
        >
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
  transition: all 0.2s ease;
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
.items-toggle-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--bg-container);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  cursor: pointer;
  transition: all 0.15s ease;
}
.items-toggle-badge:hover,
.items-toggle-badge.active {
  background: var(--text-primary);
  color: #fff;
  border-color: var(--text-primary);
}
.flow {
  padding: 8px 10px;
  background: var(--bg-container);
  border-radius: 8px;
  font-size: 12px;
}

/* 擬真超商小票明細區 */
.receipt-breakdown {
  margin-top: 10px;
  padding: 10px 12px;
  background: var(--bg-container);
  border: 1px dashed var(--border-dashed);
  border-radius: 8px;
  font-size: 12px;
  animation: slideDown 0.2s ease-out;
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.receipt-slip-header {
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 11px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border-light);
}
.receipt-slip-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 0;
}
.receipt-slip-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.slip-item-info {
  display: flex;
  align-items: center;
  gap: 6px;
}
.slip-item-name {
  color: var(--text-primary);
  font-weight: 500;
}
.slip-item-qty {
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 4px;
  padding: 1px 4px;
}
.slip-item-amount {
  font-family: "JetBrains Mono", monospace;
  font-weight: 600;
  color: var(--text-primary);
}
.receipt-slip-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 6px;
  border-top: 1px dashed var(--border-light);
  font-size: 11px;
  color: var(--text-secondary);
}
.slip-total {
  font-weight: 600;
  color: var(--text-primary);
  font-family: "JetBrains Mono", monospace;
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
