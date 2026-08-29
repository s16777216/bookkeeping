<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import type { FinanceNode, NodeOwner } from "../types/finance";

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
const icon = ref("🏦");
const owner = ref<NodeOwner>("me");
const error = ref("");

const dragOffset = ref(0);
const isDragging = ref(false);
let touchStartY = 0;

const EMOJI_PRESETS = [
  "🏦", "💳", "💵", "🪙", "📱", "💼",
  "🍔", "☕", "🛒", "🏠", "🚗", "🎮", "🏥", "📚", "💡", "✈️"
];

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

    if (props.node) {
      name.value = props.node.name;
      icon.value = props.node.icon || "🏦";
      owner.value = props.node.owner;
    }
    error.value = "";
  }
);

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});

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
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="isOpen" class="sheet-backdrop" @click.self="close">
      <div
        class="sheet-container"
        :style="{
          transform: isDragging || dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.25s ease-out',
        }"
      >
        <!-- 頂部拖曳把手與標題 -->
        <div
          class="sheet-handle-area"
          @touchstart="startDrag"
          @touchmove="moveDrag"
          @touchend="endDrag"
        >
          <div class="sheet-handle"></div>
          <div class="sheet-header-row">
            <h3>編輯節點</h3>
            <button class="close-btn" @click="close">✕</button>
          </div>
        </div>

        <!-- 內容表單區域 -->
        <div class="sheet-body">
          <p v-if="error" class="error-msg">{{ error }}</p>

          <div class="field-group">
            <label>節點名稱</label>
            <input
              v-model="name"
              placeholder="例如：台新銀行、全聯、薪資"
              maxlength="30"
              @keyup.enter="save"
            />
          </div>

          <div class="field-group">
            <label>代表圖標 (Emoji)</label>
            <div class="icon-input-row">
              <input v-model="icon" class="icon-display-input" maxlength="4" />
              <div class="emoji-grid">
                <button
                  v-for="e in EMOJI_PRESETS"
                  type="button"
                  :key="e"
                  class="emoji-chip"
                  :class="{ active: icon === e }"
                  @click="icon = e"
                >
                  {{ e }}
                </button>
              </div>
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

        <!-- 底部固定操作列 -->
        <div class="sheet-footer">
          <button class="btn primary" @click="save">儲存修改</button>
          <button class="btn danger-outline" @click="archive">封存節點</button>
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
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
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
  max-height: 90vh;
  overflow: hidden;
}
.sheet-handle-area {
  padding: 12px 20px 8px;
  cursor: grab;
  user-select: none;
  background: var(--bg-surface, #fff);
  border-bottom: 1px solid var(--border-light, #eee);
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
}
.close-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--text-secondary, #666);
  padding: 4px 8px;
  border-radius: 6px;
}
.close-btn:hover {
  background: var(--border-light, #f0f0f0);
}
.sheet-body {
  padding: 16px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
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
.icon-input-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.icon-display-input {
  width: 56px;
  text-align: center;
  font-size: 20px;
}
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  flex: 1;
}
.emoji-chip {
  background: var(--bg-main, #f5f5f5);
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 18px;
  padding: 6px 0;
  cursor: pointer;
  transition: all 0.15s ease;
}
.emoji-chip:hover {
  background: var(--border-light, #eee);
}
.emoji-chip.active {
  border-color: var(--text-primary, #111);
  background: var(--bg-surface, #fff);
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
.hint {
  font-size: 11px;
  color: var(--text-secondary, #888);
}
.sheet-footer {
  padding: 12px 20px calc(12px + env(safe-area-inset-bottom, 0px));
  background: var(--bg-surface, #fff);
  border-top: 1px solid var(--border-light, #eee);
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

/* Transitions */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}
.sheet-enter-active .sheet-container,
.sheet-leave-active .sheet-container {
  transition: transform 0.25s ease-out;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .sheet-container,
.sheet-leave-to .sheet-container {
  transform: translateY(100%);
}
</style>
