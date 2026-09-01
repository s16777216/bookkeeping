<script lang="ts">
export const AVAILABLE_COLORS = [
  { hex: "#111827", label: "極簡墨黑" },
  { hex: "#2D6A4F", label: "常青森綠" },
  { hex: "#1D4ED8", label: "深邃湛藍" },
  { hex: "#B45309", label: "陶土暖棕" },
  { hex: "#C2410C", label: "暖陽磚橘" },
  { hex: "#BE123C", label: "沉穩酒紅" },
  { hex: "#6D28D9", label: "葡萄深紫" },
  { hex: "#4B5563", label: "石墨暖灰" },
];
</script>

<script setup lang="ts">
import { ref, watch } from "vue";
import BaseSheet from "@/components/sheets/BaseSheet.vue";
import NodeIcon, { AVAILABLE_ICON_KEYS } from "@/components/common/NodeIcon.vue";

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    modelValue?: string;
    color?: string;
  }>(),
  {
    modelValue: "tag",
    color: "#111827",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "update:color", value: string): void;
  (e: "close"): void;
}>();

const selectedColor = ref(props.color || "#111827");

watch(
  () => [props.isOpen, props.color],
  ([isOpen, newColor]) => {
    if (isOpen) {
      selectedColor.value = (newColor as string) || "#111827";
    }
  },
  { immediate: true }
);

function selectColor(hex: string) {
  selectedColor.value = hex;
  emit("update:color", hex);
}

function selectIcon(key: string) {
  emit("update:modelValue", key);
  emit("update:color", selectedColor.value);
  emit("close");
}
</script>

<template>
  <BaseSheet
    :is-open="props.isOpen"
    size="sm"
    title="選擇節點圖示與代表色"
    @close="emit('close')"
  >
    <!-- 8 款預設紙質色圈 -->
    <div class="color-swatches">
      <button
        v-for="c in AVAILABLE_COLORS"
        :key="c.hex"
        type="button"
        class="color-swatch-btn"
        :class="{ active: selectedColor === c.hex }"
        :title="c.label"
        :aria-label="c.label"
        :style="{ backgroundColor: c.hex }"
        @click="selectColor(c.hex)"
      >
        <span v-if="selectedColor === c.hex" class="swatch-indicator"></span>
      </button>
    </div>

    <!-- 5×5 圖示網格即時預覽 -->
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
        <NodeIcon :name="key" :size="22" :color="selectedColor" />
      </button>
    </div>
  </BaseSheet>
</template>

<style scoped>
.color-swatches {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 4px 14px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--border-light, #e9ecef);
}

.color-swatch-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  flex-shrink: 0;
}

.color-swatch-btn:hover {
  transform: scale(1.1);
}

.color-swatch-btn.active {
  transform: scale(1.15);
  box-shadow: 0 0 0 2px var(--bg-surface, #fff), 0 0 0 4px var(--text-primary, #111);
}

.swatch-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #ffffff;
}

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
  background-color: var(--bg-container, #f3f4f3);
  border: 1.5px solid var(--border-light, #e9ecef);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}

.icon-grid-item:hover {
  background-color: var(--bg-subtle, #eeeed);
  transform: translateY(-1px);
}

.icon-grid-item:active {
  transform: scale(0.95);
}

.icon-grid-item.active {
  border-color: var(--text-primary, #1a1a1a);
  border-width: 2px;
  background-color: var(--bg-surface, #fff);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.04));
}
</style>
