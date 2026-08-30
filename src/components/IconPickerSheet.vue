<script setup lang="ts">
import BaseSheet from "./BaseSheet.vue";
import NodeIcon, { AVAILABLE_ICON_KEYS } from "./NodeIcon.vue";

const props = defineProps<{
  isOpen: boolean;
  modelValue?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "close"): void;
}>();

function selectIcon(key: string) {
  emit("update:modelValue", key);
  emit("close");
}
</script>

<template>
  <BaseSheet
    :isOpen="props.isOpen"
    size="sm"
    title="選擇節點圖示"
    @close="emit('close')"
  >
    <div class="icon-grid">
      <button
        v-for="key in AVAILABLE_ICON_KEYS"
        :key="key"
        type="button"
        class="icon-grid-item"
        :class="{ active: props.modelValue === key }"
        :title="key"
        @click="selectIcon(key)"
      >
        <NodeIcon :name="key" :size="22" />
      </button>
    </div>
  </BaseSheet>
</template>

<style scoped>
.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  padding: 4px 0 16px;
}

.icon-grid-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-surface-soft, #f8f9fa);
  border: 1px solid var(--border-light, #e9ecef);
  border-radius: 10px;
  color: var(--text-secondary, #495057);
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}

.icon-grid-item:hover {
  background-color: var(--border-light, #e9ecef);
  color: var(--text-primary, #111);
  transform: translateY(-1px);
}

.icon-grid-item:active {
  transform: scale(0.95);
}

.icon-grid-item.active {
  background-color: var(--text-primary, #111);
  border-color: var(--text-primary, #111);
  color: var(--bg-surface, #fff);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
