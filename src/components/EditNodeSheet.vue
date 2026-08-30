<script setup lang="ts">
import { ref, watch } from "vue";
import type { FinanceNode, NodeOwner } from "../types/finance";
import BaseSheet from "./BaseSheet.vue";
import NodeIcon from "./NodeIcon.vue";
import IconPickerSheet from "./IconPickerSheet.vue";

const props = defineProps<{
  isOpen: boolean;
  node: FinanceNode | null;
  onUpdate: (
    id: string,
    updates: Partial<Omit<FinanceNode, "id" | "updated_at">>,
  ) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const name = ref("");
const icon = ref("landmark");
const owner = ref<NodeOwner>("me");
const isPickerOpen = ref(false);
const error = ref("");

function close() {
  emit("close");
}

watch(
  () => props.isOpen,
  (open) => {
    if (open && props.node) {
      name.value = props.node.name;
      icon.value = props.node.icon || "landmark";
      owner.value = props.node.owner;
    }
    error.value = "";
    isPickerOpen.value = false;
  },
);

async function save() {
  if (!props.node) return;
  const trimmedName = name.value.trim();
  if (!trimmedName) {
    error.value = "名稱不可為空白";
    return;
  }
  try {
    await props.onUpdate(props.node.id, {
      name: trimmedName,
      icon: icon.value,
      owner: owner.value,
    });
    close();
  } catch (err: any) {
    error.value = err?.message || "更新失敗";
  }
}

async function archive() {
  if (!props.node) return;
  if (confirm(`確定要封存「${props.node.name}」嗎？歷史交易會被保留。`)) {
    try {
      await props.onArchive(props.node.id);
      close();
    } catch (err: any) {
      error.value = err?.message || "封存失敗";
    }
  }
}
</script>

<template>
  <BaseSheet :is-open="isOpen" title="編輯節點" size="md" @close="close">
    <div class="edit-node-form">
      <p v-if="error" class="error-msg">{{ error }}</p>

      <div class="field-group">
        <label>節點圖示與名稱</label>
        <div class="name-icon-row">
          <button
            type="button"
            class="icon-avatar-trigger"
            title="點擊更換圖示"
            @click="isPickerOpen = true"
          >
            <NodeIcon :name="icon" :size="22" />
          </button>
          <input
            v-model="name"
            class="name-input"
            placeholder="例如：台新銀行、全聯、薪資"
            maxlength="30"
            @keyup.enter="save"
          />
        </div>
      </div>

      <div class="field-group">
        <label>資金主權類型</label>
        <select v-model="owner">
          <option value="me">我的帳戶（資產 / 錢包 / 銀行）</option>
          <option value="external">外部對象（商店 / 客戶 / 費用類）</option>
        </select>
        <small class="hint">更改資金主權會影響圖論中的資產統計與收支歸屬</small>
      </div>
    </div>

    <template #footer>
      <div class="edit-actions">
        <button class="btn primary" @click="save">儲存修改</button>
        <button class="btn danger-outline" @click="archive">封存節點</button>
      </div>
    </template>

    <!-- 圖示挑選抽屜 -->
    <IconPickerSheet
      :is-open="isPickerOpen"
      :model-value="icon"
      @update:model-value="icon = $event"
      @close="isPickerOpen = false"
    />
  </BaseSheet>
</template>

<style scoped>
.edit-node-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-msg {
  color: #e53e3e;
  font-size: 12px;
  margin: 0;
  padding: 8px 12px;
  background: #fff5f5;
  border-radius: 8px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #666);
}

.field-group input,
.field-group select {
  padding: 10px 12px;
  border: 1px solid var(--border-light, #ddd);
  border-radius: 10px;
  font-size: 14px;
  background: var(--bg-main, #fafafa);
  color: var(--text-primary, #111);
  outline: none;
}

.field-group input:focus,
.field-group select:focus {
  border-color: var(--text-primary, #111);
}

.name-icon-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.name-icon-row .icon-avatar-trigger {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-surface-soft, #f8f9fa);
  border: 1px solid var(--border-light, #e9ecef);
  border-radius: 10px;
  color: var(--text-primary);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

.name-icon-row .icon-avatar-trigger:hover {
  background-color: var(--border-light);
  transform: translateY(-1px);
}

.name-icon-row .icon-avatar-trigger:active {
  transform: scale(0.95);
}

.name-icon-row .name-input {
  flex: 1;
  height: 44px;
  box-sizing: border-box;
}

.hint {
  font-size: 11px;
  color: var(--text-secondary, #888);
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s ease;
}

.btn:active {
  opacity: 0.8;
}

.btn.primary {
  background: var(--text-primary, #111);
  color: #fff;
}

.btn.danger-outline {
  background: transparent;
  color: #e53e3e;
  border: 1px solid #fed7d7;
}

.btn.danger-outline:hover {
  background: #fff5f5;
}
</style>
