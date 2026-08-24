<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import type { FinanceNode, FinanceTag } from "../types/finance";

const props = defineProps<{
  isOpen: boolean;
  nodes: FinanceNode[];
  tags: FinanceTag[];
  initialFromNode?: FinanceNode | null;
  onCreateTag: (name: string) => Promise<FinanceTag>;
  onRenameTag: (id: string, name: string) => Promise<void>;
  onArchiveTag: (id: string) => Promise<void>;
}>();
const emit = defineEmits<{
  (e: "close"): void;
  (
    e: "submit",
    payload: {
      from_node_id: string;
      to_node_id: string;
      amount: number;
      memo: string;
      executed_at: number | null;
      tag_ids: string[];
    },
  ): void;
}>();
const fromId = ref(""),
  toId = ref(""),
  amount = ref(""),
  memo = ref(""),
  executed = ref(true),
  selectedTags = ref<string[]>([]),
  tagInput = ref(""),
  managingTags = ref(false),
  error = ref("");
const dragOffset = ref(0),
  isDragging = ref(false);
let touchStartY = 0;
const activeNodes = computed(() => props.nodes);

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
    fromId.value =
      props.initialFromNode?.id ||
      props.nodes.find((node) => node.owner === "me")?.id ||
      "";
    toId.value =
      props.nodes.find((node) => node.owner === "external")?.id ||
      props.nodes.find((node) => node.id !== fromId.value)?.id ||
      "";
    amount.value = "";
    memo.value = "";
    executed.value = true;
    selectedTags.value = [];
    tagInput.value = "";
    error.value = "";
  },
);
function handleAfterLeave() {
  dragOffset.value = 0;
  isDragging.value = false;
}
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});

async function addTag() {
  if (!tagInput.value.trim()) return;
  const tag = await props.onCreateTag(tagInput.value);
  if (!selectedTags.value.includes(tag.id)) selectedTags.value.push(tag.id);
  tagInput.value = "";
}
function submit() {
  const value = Number(amount.value);
  if (
    !fromId.value ||
    !toId.value ||
    fromId.value === toId.value ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    error.value = "請填妥不同的起點、終點與正確金額";
    return;
  }
  emit("submit", {
    from_node_id: fromId.value,
    to_node_id: toId.value,
    amount: value,
    memo: memo.value,
    executed_at: executed.value ? Date.now() : null,
    tag_ids: [...selectedTags.value],
  });
  close();
}
</script>

<template>
  <Transition name="entry-sheet" @after-leave="handleAfterLeave">
    <div v-if="isOpen" class="overlay" @click.self="close">
      <form
        class="sheet"
        :class="{ dragging: isDragging }"
        :style="{
          '--drag-offset': `${dragOffset}px`,
        }"
        @submit.prevent="submit"
      >
        <div
          class="drag-area"
          @touchstart="startDrag"
          @touchmove="moveDrag"
          @touchend="endDrag"
          @touchcancel="endDrag"
        >
          <span class="drag-handle"></span>
        </div>
        <header class="sheet-header">
          <strong>🧾 記一筆資金流向</strong
          ><button type="button" class="plain" @click="close">✕</button>
        </header>
        <p v-if="error" class="error">{{ error }}</p>
        <label
          >從<select v-model="fromId">
            <option v-for="node in activeNodes" :key="node.id" :value="node.id">
              {{ node.icon }} {{ node.name }}
            </option>
          </select></label
        >
        <label
          >到<select v-model="toId">
            <option v-for="node in activeNodes" :key="node.id" :value="node.id">
              {{ node.icon }} {{ node.name }}
            </option>
          </select></label
        >
        <label
          >金額<input v-model="amount" inputmode="decimal" placeholder="0"
        /></label>
        <label
          >備註<input v-model="memo" placeholder="例如：午餐、還款"
        /></label>
        <label class="toggle"
          ><input v-model="executed" type="checkbox" />
          已執行（取消勾選則建立待執行交易）</label
        >
        <div class="tag-box">
          <span>標籤</span>
          <div class="chips">
            <button
              v-for="tag in tags"
              :key="tag.id"
              type="button"
              :class="{ selected: selectedTags.includes(tag.id) }"
              @click="
                selectedTags.includes(tag.id)
                  ? (selectedTags = selectedTags.filter((id) => id !== tag.id))
                  : selectedTags.push(tag.id)
              "
            >
              {{ tag.name }}
            </button>
          </div>
          <div class="row">
            <input
              v-model="tagInput"
              placeholder="搜尋或新增標籤"
              @keyup.enter.prevent="addTag"
            /><button type="button" @click="addTag">新增</button
            ><button
              type="button"
              class="plain"
              @click="managingTags = !managingTags"
            >
              管理
            </button>
          </div>
          <div v-if="managingTags" class="tag-manager">
            <div v-for="tag in tags" :key="tag.id" class="row">
              <input
                :value="tag.name"
                @change="
                  props.onRenameTag(
                    tag.id,
                    ($event.target as HTMLInputElement).value,
                  )
                "
              /><button
                type="button"
                class="plain"
                @click="props.onArchiveTag(tag.id)"
              >
                封存
              </button>
            </div>
          </div>
        </div>
        <button class="submit">
          {{ executed ? "儲存已執行交易" : "建立待執行交易" }}
        </button>
      </form>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: #0006;
  z-index: 600;
  display: flex;
  align-items: end;
  overflow: hidden;
}
.sheet {
  width: 100%;
  height: min(88dvh, 720px);
  max-height: calc(100dvh - env(safe-area-inset-top, 0px));
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  padding: 8px 18px calc(18px + env(safe-area-inset-bottom, 0px));
  background: var(--bg-surface);
  border-radius: 18px 18px 0 0;
  display: grid;
  align-content: start;
  gap: 10px;
  transform: translateY(var(--drag-offset, 0px));
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.sheet.dragging {
  transition: none;
}
.drag-area {
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  touch-action: none;
  cursor: grab;
}
.drag-handle {
  width: 38px;
  height: 4px;
  border-radius: 999px;
  background: var(--border-dashed);
}
.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 30px;
}
.sheet-header strong {
  font-size: 15px;
}
.row,
.chips {
  display: flex;
  gap: 8px;
  align-items: center;
}
.sheet label {
  display: grid;
  gap: 4px;
  font-size: 12px;
}
.sheet input,
.sheet select {
  padding: 9px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-container);
}
button {
  border: 0;
  border-radius: 8px;
  padding: 8px 10px;
  background: var(--text-primary);
  color: white;
  cursor: pointer;
}
.plain {
  background: transparent;
  color: var(--text-secondary);
}
.toggle {
  display: block !important;
}
.tag-box {
  display: grid;
  gap: 6px;
}
.chips {
  flex-wrap: wrap;
}
.chips button {
  background: var(--bg-container);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  padding: 5px 8px;
}
.chips button.selected {
  background: var(--text-primary);
  color: #fff;
}
.tag-manager {
  display: grid;
  gap: 5px;
}
.tag-manager input {
  flex: 1;
}
.submit {
  padding: 11px;
}
.error {
  color: var(--accent-expense);
  margin: 0;
  font-size: 12px;
}
.entry-sheet-enter-active .sheet,
.entry-sheet-leave-active .sheet {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.entry-sheet-enter-from .sheet,
.entry-sheet-leave-to .sheet {
  transform: translateY(100%);
}
.entry-sheet-enter-active,
.entry-sheet-leave-active {
  transition: opacity 0.24s ease;
}
.entry-sheet-enter-from,
.entry-sheet-leave-to {
  opacity: 0;
}
</style>
