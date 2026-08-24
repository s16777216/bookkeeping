<script setup lang="ts">
import { computed, ref } from "vue";
import type { FinanceNode, NodeOwner } from "../types/finance";

const props = defineProps<{
  nodes: FinanceNode[];
  onCreateNode: (payload: {
    name: string;
    owner: NodeOwner;
    icon?: string;
  }) => Promise<FinanceNode>;
  onUpdateNode: (
    id: string,
    updates: Partial<Omit<FinanceNode, "id" | "updated_at">>,
  ) => Promise<void>;
  onArchiveNode: (id: string) => Promise<void>;
}>();
const isAdding = ref(false),
  name = ref(""),
  icon = ref("🏦"),
  owner = ref<NodeOwner>("me"),
  editingId = ref<string | null>(null);
const mine = computed(() => props.nodes.filter((node) => node.owner === "me"));
const external = computed(() =>
  props.nodes.filter((node) => node.owner === "external"),
);
async function add() {
  if (!name.value.trim()) return;
  await props.onCreateNode({
    name: name.value,
    owner: owner.value,
    icon: icon.value,
  });
  name.value = "";
  isAdding.value = false;
}
async function archive(node: FinanceNode) {
  if (confirm(`封存「${node.name}」？歷史交易會保留。`))
    await props.onArchiveNode(node.id);
}
</script>

<template>
  <div class="nodes-view-container animate-fade-in">
    <div class="view-header">
      <div>
        <div class="view-title">💼 帳戶與對象管理</div>
        <div class="view-subtitle">我的帳戶與外部對象以資金主權區分</div>
      </div>
      <button @click="isAdding = !isAdding">
        {{ isAdding ? "取消" : "＋ 新增" }}
      </button>
    </div>
    <form v-if="isAdding" class="panel" @submit.prevent="add">
      <input
        v-model="name"
        placeholder="名稱，例如：我的銀行、小明、便利商店"
      />
      <div class="row">
        <select v-model="owner">
          <option value="me">我的帳戶</option>
          <option value="external">外部對象</option></select
        ><input v-model="icon" maxlength="4" aria-label="圖示" />
      </div>
      <button>建立節點</button>
    </form>
    <section
      v-for="group in [
        { title: '我的帳戶', items: mine },
        { title: '外部對象', items: external },
      ]"
      :key="group.title"
      class="group"
    >
      <h3>{{ group.title }}</h3>
      <div v-if="group.items.length" class="grid">
        <article v-for="node in group.items" :key="node.id" class="node-card">
          <span>{{ node.icon || "🏷️" }}</span>
          <div v-if="editingId !== node.id" class="grow">
            <strong>{{ node.name }}</strong
            ><small>{{ node.owner === "me" ? "我的帳戶" : "外部對象" }}</small>
          </div>
          <input
            v-else
            v-model="node.name"
            class="grow"
            @keyup.enter="props.onUpdateNode(node.id, { name: node.name })"
          /><button
            class="plain"
            @click="editingId = editingId === node.id ? null : node.id"
          >
            ✎</button
          ><button class="plain danger" @click="archive(node)">封存</button>
        </article>
      </div>
      <p v-else class="empty">尚無{{ group.title }}</p>
    </section>
  </div>
</template>

<style scoped>
.nodes-view-container {
  padding: 16px 20px 30px;
}
.view-header,
.row,
.node-card {
  display: flex;
  align-items: center;
  gap: 8px;
}
.view-header {
  justify-content: space-between;
}
.view-title {
  font-size: 16px;
  font-weight: 700;
}
.view-subtitle,
small,
.empty {
  font-size: 11px;
  color: var(--text-secondary);
}
button {
  border: 0;
  border-radius: 8px;
  padding: 8px 11px;
  background: var(--text-primary);
  color: #fff;
  cursor: pointer;
}
.panel,
.group {
  margin-top: 16px;
}
.panel {
  display: grid;
  gap: 8px;
  padding: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 12px;
}
.panel input,
.panel select,
.node-card input {
  padding: 8px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-container);
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.node-card {
  padding: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 10px;
}
.grow {
  flex: 1;
  min-width: 0;
}
.grow strong,
.grow small {
  display: block;
}
.plain {
  background: transparent;
  color: var(--text-secondary);
  padding: 4px;
}
.danger {
  color: var(--accent-expense);
}
h3 {
  font-size: 12px;
  margin: 0 0 8px;
}
</style>
