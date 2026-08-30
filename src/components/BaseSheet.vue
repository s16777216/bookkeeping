<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import { X } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    title?: string;
    size?: "sm" | "md" | "lg" | "auto";
  }>(),
  {
    title: "",
    size: "auto",
  }
);

const emit = defineEmits<{
  (e: "close"): void;
}>();

const dragOffset = ref(0);
const isDragging = ref(false);
let touchStartY = 0;

function close() {
  emit("close");
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.isOpen) close();
}

function startDrag(event: TouchEvent) {
  if (event.touches.length !== 1) return;
  touchStartY = event.touches[0].clientY;
  isDragging.value = true;
}

function moveDrag(event: TouchEvent) {
  if (!isDragging.value) return;
  dragOffset.value = Math.max(0, event.touches[0].clientY - touchStartY);
}

function endDrag() {
  if (!isDragging.value) return;
  isDragging.value = false;
  if (dragOffset.value >= 120) {
    close();
    return;
  }
  dragOffset.value = 0;
}

watch(
  () => props.isOpen,
  (open) => {
    if (!open) {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeydown);
      return;
    }
    dragOffset.value = 0;
    isDragging.value = false;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeydown);
  }
);

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="isOpen" class="sheet-backdrop" @click.self="close">
        <div
          class="sheet-container"
          :class="[`size-${size}`]"
          :style="{
            transform: isDragging || dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
            transition: isDragging ? 'none' : 'transform 0.25s ease-out',
          }"
        >
          <!-- 頂部拖曳把手與標題列 -->
          <div
            class="sheet-handle-area"
            @touchstart="startDrag"
            @touchmove.prevent="moveDrag"
            @touchend="endDrag"
            @touchcancel="endDrag"
          >
            <div class="sheet-handle"></div>
            <slot name="title">
              <div class="sheet-header-row">
                <h3>{{ title }}</h3>
                <button class="close-btn" type="button" @click="close" aria-label="關閉抽屜">
                  <X :size="18" />
                </button>
              </div>
            </slot>
          </div>

          <!-- 可滾動主要內容區 -->
          <div class="sheet-body">
            <slot></slot>
          </div>

          <!-- 底部固定操作列 (若有傳入插槽則渲染) -->
          <div v-if="$slots.footer" class="sheet-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  touch-action: none;
}

.sheet-container {
  width: 100%;
  max-width: 520px;
  background: var(--bg-surface, #fff);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 尺寸定義 */
.size-sm {
  max-height: min(45dvh, 420px);
}

.size-md {
  max-height: min(72dvh, 600px);
}

.size-lg {
  height: min(92dvh, 800px);
  max-height: 92dvh;
}

.size-auto {
  max-height: 90dvh;
}

.sheet-handle-area {
  padding: 12px 20px 8px;
  cursor: grab;
  user-select: none;
  background: var(--bg-surface, #fff);
  border-bottom: 1px solid var(--border-light, #eee);
  flex-shrink: 0;
  touch-action: none;
}

.sheet-handle {
  width: 36px;
  height: 4px;
  background: var(--border-light, #ccc);
  border-radius: 2px;
  margin: 0 auto 10px;
}

.sheet-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sheet-header-row h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary, #111);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--text-secondary, #666);
  padding: 4px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--border-light, #f0f0f0);
}

.sheet-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-y;
}

.sheet-footer {
  padding: 12px 20px;
  padding-bottom: max(16px, env(safe-area-inset-bottom, 16px));
  background: var(--bg-surface, #fff);
  border-top: 1px solid var(--border-light, #eee);
  flex-shrink: 0;
}

/* 抽屜入場與退場動畫 */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease-out;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-active .sheet-container,
.sheet-leave-active .sheet-container {
  transition: transform 0.25s ease-out;
}

.sheet-enter-from .sheet-container,
.sheet-leave-to .sheet-container {
  transform: translateY(100%);
}
</style>
