<script setup lang="ts">
import { computed, ref } from "vue";
import { WalletCards, Plus, X, Pencil } from "lucide-vue-next";
import type { FinanceNode, NodeOwner } from "../types/finance";
import EditNodeSheet from "./EditNodeSheet.vue";
import NodeIcon from "./NodeIcon.vue";
import IconPickerSheet from "./IconPickerSheet.vue";

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

const isAdding = ref(false);
const name = ref("");
const icon = ref("landmark");
const owner = ref<NodeOwner>("me");
const isPickerOpen = ref(false);

const selectedNode = ref<FinanceNode | null>(null);
const isEditSheetOpen = ref(false);

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
  icon.value = "landmark";
  isAdding.value = false;
}

function openEditSheet(node: FinanceNode) {
  selectedNode.value = node;
  isEditSheetOpen.value = true;
}
</script>

<template>
  <div class="nodes-view-container animate-fade-in">
    <div class="view-header">
      <div>
        <div class="view-title">
          <WalletCards :size="18" />
          <span>帳戶與對象管理</span>
        </div>
        <div class="view-subtitle">點擊任一節點卡片即可進行編輯或封存</div>
      </div>
      <button class="add-btn" @click="isAdding = !isAdding">
        <component :is="isAdding ? X : Plus" :size="14" />
        <span>{{ isAdding ? "取消" : "新增" }}</span>
      </button>
    </div>

    <form v-if="isAdding" class="panel" @submit.prevent="add">
      <input
        v-model="name"
        placeholder="名稱，例如：我的銀行、小明、便利商店"
        maxlength="30"
      />
      <div class="row">
        <select v-model="owner">
          <option value="me">我的帳戶</option>
          <option value="external">外部對象</option>
        </select>
        <button
          type="button"
          class="icon-avatar-trigger"
          title="選擇節點圖示"
          @click="isPickerOpen = true"
        >
          <NodeIcon :name="icon" :size="20" />
        </button>
      </div>
      <button class="submit-btn">建立節點</button>
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
        <article
          v-for="node in group.items"
          :key="node.id"
          class="node-card"
          @click="openEditSheet(node)"
        >
          <span class="node-icon">
            <NodeIcon :name="node.icon" :size="20" />
          </span>
          <div class="grow">
            <strong>{{ node.name }}</strong>
            <small>{{ node.owner === "me" ? "我的帳戶" : "外部對象" }}</small>
          </div>
          <span class="edit-hint">
            <Pencil :size="13" />
          </span>
        </article>
      </div>
      <p v-else class="empty">尚無{{ group.title }}</p>
    </section>

    <!-- 節點編輯底部抽屜 -->
    <EditNodeSheet
      :is-open="isEditSheetOpen"
      :node="selectedNode"
      :on-update="props.onUpdateNode"
      :on-archive="props.onArchiveNode"
      @close="isEditSheetOpen = false"
    />

    <!-- 新增節點時的圖示挑選抽屜 -->
    <IconPickerSheet
      :is-open="isPickerOpen"
      :model-value="icon"
      @update:model-value="icon = $event"
      @close="isPickerOpen = false"
    />
  </div>
</template>

<style scoped>
.nodes-view-container {
  padding: 16px 20px 30px;
}
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.view-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
}
.view-subtitle,
small,
.empty {
  font-size: 11px;
  color: var(--text-secondary);
}
.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  border-radius: 8px;
  padding: 8px 12px;
  background: var(--text-primary);
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
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
.panel select {
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg-main);
  color: var(--text-primary);
  outline: none;
}
.icon-avatar-trigger {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-surface-soft, #f8f9fa);
  border: 1px solid var(--border-light, #e9ecef);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}
.icon-avatar-trigger:hover {
  background-color: var(--border-light);
  transform: translateY(-1px);
}
.icon-avatar-trigger:active {
  transform: scale(0.95);
}
.row {
  display: flex;
  gap: 8px;
}
.submit-btn {
  background: var(--text-primary);
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.group h3 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}
.node-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.node-card:hover {
  border-color: var(--text-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
.node-icon {
  font-size: 24px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-main);
  border-radius: 8px;
}
.grow {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.grow strong {
  font-size: 14px;
  color: var(--text-primary);
}
.edit-hint {
  font-size: 14px;
  color: var(--text-secondary);
  opacity: 0.5;
}
.node-card:hover .edit-hint {
  opacity: 1;
}
.empty {
  padding: 20px;
  text-align: center;
  background: var(--bg-surface);
  border: 1px dashed var(--border-light);
  border-radius: 12px;
}
</style>
