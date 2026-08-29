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
  expression = ref(""),
  isCalculated = ref(false),
  calculatedResult = ref<number | null>(null),
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

// 是否包含加減運算符
const hasOperator = computed(() => {
  return /[0-9]\s*[+\-]/.test(expression.value);
});

// 當前正在輸入的最後一段數字
const currentNumberSegment = computed(() => {
  if (isCalculated.value) return "";
  const parts = expression.value.split(/[+\-]/);
  return parts[parts.length - 1] || "";
});

// --- 算式解析器 ---
function parseExpression(exp: string): number {
  if (!exp) return 0;
  const tokens = exp.match(/([+-]?[^+-]+)/g);
  if (!tokens) return 0;
  let total = 0;
  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed || trimmed === "+" || trimmed === "-") continue;
    const num = parseFloat(trimmed);
    if (!isNaN(num)) {
      total += num;
    }
  }
  return Math.round(total * 10000) / 10000;
}

// 算式格式化（加上空格讓排版更易讀）
function formatExpression(exp: string): string {
  if (!exp) return "";
  return exp.replace(/([+\-])/g, " $1 ");
}

// 上方顯示的算式內容
const displayExpression = computed(() => {
  if (!expression.value) return "";
  const formatted = formatExpression(expression.value);
  if (isCalculated.value) {
    return `${formatted} =`;
  }
  return formatted;
});

// 下方大字體顯示金額
const displayAmount = computed(() => {
  // 1. 已按下 = 結算
  if (isCalculated.value && calculatedResult.value !== null) {
    return calculatedResult.value.toLocaleString("zh-TW", {
      maximumFractionDigits: 4,
    });
  }
  // 2. 算式運算中（包含 + 或 - 但尚未結算）
  if (hasOperator.value) {
    const cur = currentNumberSegment.value;
    return cur ? cur : "...";
  }
  // 3. 純單筆數字輸入
  if (!expression.value) return "0";
  return expression.value;
});

function handleKeypadPress(key: string) {
  error.value = "";

  // 若剛剛已結算完成
  if (isCalculated.value) {
    if (key >= "0" && key <= "9") {
      // 輸入新數字：開始全新的一筆
      expression.value = key;
      isCalculated.value = false;
      calculatedResult.value = null;
      return;
    } else if (key === ".") {
      expression.value = "0.";
      isCalculated.value = false;
      calculatedResult.value = null;
      return;
    } else if (key === "+" || key === "-") {
      // 接著運算：以結算結果為基礎繼續算
      expression.value = `${calculatedResult.value}${key}`;
      isCalculated.value = false;
      calculatedResult.value = null;
      return;
    } else if (key === "backspace" || key === "⌫") {
      // 撤銷結算狀態，退回算式編輯
      isCalculated.value = false;
      calculatedResult.value = null;
      return;
    } else if (key === "C") {
      expression.value = "";
      isCalculated.value = false;
      calculatedResult.value = null;
      return;
    } else if (key === "=") {
      // 保持結算
      return;
    }
  }

  // 正常輸入中
  if (key >= "0" && key <= "9") {
    if (currentNumberSegment.value === "0") {
      expression.value = expression.value.slice(0, -1) + key;
    } else {
      expression.value += key;
    }
  } else if (key === ".") {
    if (currentNumberSegment.value.includes(".")) return;
    if (!expression.value || /[+-]$/.test(expression.value)) {
      expression.value += "0.";
    } else {
      expression.value += ".";
    }
  } else if (key === "+" || key === "-") {
    if (!expression.value) {
      if (key === "-") expression.value = "-";
      return;
    }
    if (/[+-]$/.test(expression.value)) {
      expression.value = expression.value.slice(0, -1) + key;
    } else {
      expression.value += key;
    }
  } else if (key === "backspace" || key === "⌫") {
    expression.value = expression.value.slice(0, -1);
  } else if (key === "C") {
    expression.value = "";
    isCalculated.value = false;
    calculatedResult.value = null;
  } else if (key === "=") {
    if (!expression.value) return;
    const result = parseExpression(expression.value);
    calculatedResult.value = result;
    isCalculated.value = true;
  }
}

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
    expression.value = "";
    isCalculated.value = false;
    calculatedResult.value = null;
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
  // 若含有運算符號但未按下 = 結算，進行防呆提醒
  if (hasOperator.value && !isCalculated.value) {
    error.value = "請先按下 = 計算最終結果";
    return;
  }

  // 取得最終結算金額
  let value = 0;
  if (isCalculated.value && calculatedResult.value !== null) {
    value = calculatedResult.value;
  } else {
    value = parseFloat(expression.value);
  }

  if (
    !fromId.value ||
    !toId.value ||
    fromId.value === toId.value ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    error.value = "請填妥不同的起點、終點與正確金額（大於 0）";
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
        <!-- 頂部區：手勢條與標題 -->
        <div class="sheet-top-tier">
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
            <strong>🧾 記一筆資金流向</strong>
            <button type="button" class="plain" @click="close">✕</button>
          </header>
          <p v-if="error" class="error">{{ error }}</p>
        </div>

        <!-- 滾動內容區 -->
        <div class="sheet-body">
          <div class="node-selectors">
            <label>
              從
              <select v-model="fromId">
                <option
                  v-for="node in activeNodes"
                  :key="node.id"
                  :value="node.id"
                >
                  {{ node.icon }} {{ node.name }}
                </option>
              </select>
            </label>
            <label>
              到
              <select v-model="toId">
                <option
                  v-for="node in activeNodes"
                  :key="node.id"
                  :value="node.id"
                >
                  {{ node.icon }} {{ node.name }}
                </option>
              </select>
            </label>
          </div>

          <!-- 金額顯示盒與算式預覽 -->
          <div
            class="amount-display-box"
            :class="{ 'need-calc': hasOperator && !isCalculated }"
          >
            <div class="expression-preview">
              {{ displayExpression || "算式計算（按 = 結算）" }}
            </div>
            <div class="amount-value">
              <span class="currency-symbol">$</span>
              <span class="value-number">{{ displayAmount }}</span>
              <span v-if="hasOperator && !isCalculated" class="calc-badge">
                待按 = 結算
              </span>
            </div>
          </div>

          <!-- 4x4 記帳小算盤鍵盤 -->
          <div class="keypad-grid">
            <button
              type="button"
              class="keypad-btn key-num"
              @click="handleKeypadPress('7')"
            >
              7
            </button>
            <button
              type="button"
              class="keypad-btn key-num"
              @click="handleKeypadPress('8')"
            >
              8
            </button>
            <button
              type="button"
              class="keypad-btn key-num"
              @click="handleKeypadPress('9')"
            >
              9
            </button>
            <button
              type="button"
              class="keypad-btn key-op"
              title="退格"
              @click="handleKeypadPress('backspace')"
            >
              ⌫
            </button>

            <button
              type="button"
              class="keypad-btn key-num"
              @click="handleKeypadPress('4')"
            >
              4
            </button>
            <button
              type="button"
              class="keypad-btn key-num"
              @click="handleKeypadPress('5')"
            >
              5
            </button>
            <button
              type="button"
              class="keypad-btn key-num"
              @click="handleKeypadPress('6')"
            >
              6
            </button>
            <button
              type="button"
              class="keypad-btn key-op key-clear"
              title="清除"
              @click="handleKeypadPress('C')"
            >
              C
            </button>

            <button
              type="button"
              class="keypad-btn key-num"
              @click="handleKeypadPress('1')"
            >
              1
            </button>
            <button
              type="button"
              class="keypad-btn key-num"
              @click="handleKeypadPress('2')"
            >
              2
            </button>
            <button
              type="button"
              class="keypad-btn key-num"
              @click="handleKeypadPress('3')"
            >
              3
            </button>
            <button
              type="button"
              class="keypad-btn key-op"
              @click="handleKeypadPress('-')"
            >
              -
            </button>

            <button
              type="button"
              class="keypad-btn key-num"
              @click="handleKeypadPress('.')"
            >
              .
            </button>
            <button
              type="button"
              class="keypad-btn key-num"
              @click="handleKeypadPress('0')"
            >
              0
            </button>
            <button
              type="button"
              class="keypad-btn key-op key-equal"
              :class="{ 'pulse-attention': hasOperator && !isCalculated }"
              title="結算最終結果"
              @click="handleKeypadPress('=')"
            >
              =
            </button>
            <button
              type="button"
              class="keypad-btn key-op"
              @click="handleKeypadPress('+')"
            >
              +
            </button>
          </div>

          <label>
            備註
            <input v-model="memo" placeholder="例如：午餐、還款" />
          </label>

          <label class="toggle">
            <input v-model="executed" type="checkbox" />
            已執行
          </label>

          <!-- 標籤橫向滑動區 -->
          <div class="tag-box">
            <div class="tag-header">
              <span>標籤</span>
              <div class="tag-actions">
                <input
                  v-model="tagInput"
                  placeholder="新增標籤"
                  @keyup.enter.prevent="addTag"
                />
                <button type="button" class="tag-add-btn" @click="addTag">
                  新增
                </button>
                <button
                  type="button"
                  class="plain tag-manage-btn"
                  @click="managingTags = !managingTags"
                >
                  {{ managingTags ? "完成" : "管理" }}
                </button>
              </div>
            </div>

            <div class="chips-scroll">
              <button
                v-for="tag in tags"
                :key="tag.id"
                type="button"
                class="chip-btn"
                :class="{ selected: selectedTags.includes(tag.id) }"
                @click="
                  selectedTags.includes(tag.id)
                    ? (selectedTags = selectedTags.filter(
                        (id) => id !== tag.id,
                      ))
                    : selectedTags.push(tag.id)
                "
              >
                {{ tag.name }}
              </button>
              <span v-if="tags.length === 0" class="empty-hint">尚無標籤</span>
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
                />
                <button
                  type="button"
                  class="plain"
                  @click="props.onArchiveTag(tag.id)"
                >
                  封存
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部固定操作列 -->
        <footer class="sheet-footer">
          <button class="submit" type="submit">儲存</button>
        </footer>
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
  height: min(90dvh, 760px);
  max-height: calc(100dvh - env(safe-area-inset-top, 0px));
  background: var(--bg-surface);
  border-radius: 18px 18px 0 0;
  display: flex;
  flex-direction: column;
  padding: 0;
  transform: translateY(var(--drag-offset, 0px));
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
.sheet.dragging {
  transition: none;
}
.sheet-top-tier {
  flex-shrink: 0;
  padding: 8px 18px 6px;
  background: var(--bg-surface);
}
.drag-area {
  height: 20px;
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
  min-height: 28px;
}
.sheet-header strong {
  font-size: 15px;
}
.error {
  color: var(--accent-expense);
  margin: 4px 0 0;
  font-size: 12px;
}
.sheet-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  padding: 4px 18px 16px;
  display: grid;
  gap: 12px;
  align-content: start;
}
.node-selectors {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.sheet label {
  display: grid;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}
.sheet input,
.sheet select {
  padding: 9px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-container);
  color: var(--text-primary);
  font-size: 14px;
}

/* 金額顯示盒 */
.amount-display-box {
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 8px 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-height: 60px;
  transition: border-color 0.2s ease;
}
.amount-display-box.need-calc {
  border-color: var(--border-dashed);
}
.expression-preview {
  font-size: 13px;
  color: var(--text-secondary);
  min-height: 18px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  white-space: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  max-width: 100%;
}
.expression-preview::-webkit-scrollbar {
  display: none;
}
.amount-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.currency-symbol {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
}
.calc-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--bg-surface);
  border: 1px solid var(--border-dashed);
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

/* 4x4 數字算盤 */
.keypad-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.keypad-btn {
  height: 42px;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
  user-select: none;
  -webkit-user-select: none;
}
.key-num {
  background: var(--bg-container);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}
.key-num:active {
  background: var(--border-light);
  transform: scale(0.97);
}
.key-op {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-dashed);
  font-size: 17px;
}
.key-op:active {
  background: var(--border-light);
  transform: scale(0.97);
}
.key-clear {
  color: var(--accent-expense);
  font-weight: 700;
}
.key-equal {
  background: var(--text-primary);
  color: #fff;
  border: 0;
  font-weight: 700;
  transition: all 0.15s ease;
}
.key-equal:active {
  opacity: 0.9;
  transform: scale(0.97);
}
.key-equal.pulse-attention {
  background: var(--text-primary);
  color: #fff;
  box-shadow: 0 0 0 2px var(--bg-surface), 0 0 0 4px var(--text-primary);
  animation: pulse-ring 1.8s infinite;
}
@keyframes pulse-ring {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.96);
  }
  100% {
    transform: scale(1);
  }
}

/* 標籤滑動與管理 */
.tag-box {
  display: grid;
  gap: 6px;
}
.tag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-secondary);
}
.tag-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}
.tag-actions input {
  padding: 4px 8px;
  font-size: 12px;
  width: 110px;
}
.tag-add-btn {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 6px;
}
.tag-manage-btn {
  font-size: 12px;
  padding: 4px 6px;
}
.chips-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 4px 0 6px;
  scrollbar-width: none;
}
.chips-scroll::-webkit-scrollbar {
  display: none;
}
.chip-btn {
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--bg-container);
  color: var(--text-secondary);
  padding: 5px 12px;
  font-size: 12px;
  transition: all 0.15s ease;
}
.chip-btn.selected {
  background: var(--text-primary);
  color: #fff;
  border-color: var(--text-primary);
}
.empty-hint {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 4px 0;
}
.tag-manager {
  display: grid;
  gap: 5px;
  margin-top: 4px;
}
.tag-manager .row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.tag-manager input {
  flex: 1;
}

/* 底部固定操作列 */
.sheet-footer {
  flex-shrink: 0;
  padding: 10px 18px calc(12px + env(safe-area-inset-bottom, 0px));
  background: var(--bg-surface);
  border-top: 1px solid var(--border-light);
}
.submit {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  background: var(--text-primary);
  color: #fff;
  border: 0;
  cursor: pointer;
}
.submit:active {
  opacity: 0.92;
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

/* 動畫過渡 */
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
