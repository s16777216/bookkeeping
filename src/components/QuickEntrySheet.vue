<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { FinanceNode, FinanceTag } from "../types/finance";
import BaseSheet from "./BaseSheet.vue";

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
  memo = ref(""),
  executed = ref(true),
  selectedTags = ref<string[]>([]),
  tagInput = ref(""),
  managingTags = ref(false),
  error = ref("");
const activeNodes = computed(() => props.nodes);

// --- iOS 計算機暫存器狀態機 ---
const displayValue = ref("0");
const previousValue = ref<number | null>(null);
const activeOperator = ref<"+" | "-" | "×" | "÷" | null>(null);
const waitingForOperand = ref(false);
const isEvaluated = ref(false); // 是否剛剛按下 =
const lastOperator = ref<"+" | "-" | "×" | "÷" | null>(null); // 連續按 = 記憶
const lastOperand = ref<number | null>(null); // 連續按 = 記憶
const historyExpression = ref(""); // 頂部算式條
const isError = ref(false); // 錯誤狀態（如除以零）

// AC / C 按鈕動態文字
const clearButtonText = computed(() => {
  if (isError.value) return "AC";
  if (displayValue.value !== "0" && !waitingForOperand.value) return "C";
  return "AC";
});

// 四則運算核心計算器
function calculate(
  a: number,
  b: number,
  op: "+" | "-" | "×" | "÷",
): number | "Error" {
  let res = 0;
  switch (op) {
    case "+":
      res = a + b;
      break;
    case "-":
      res = a - b;
      break;
    case "×":
      res = a * b;
      break;
    case "÷":
      if (b === 0) return "Error";
      res = a / b;
      break;
  }
  return Math.round(res * 100000000) / 100000000;
}

// 格式化主螢幕數字（加上千分位，若是純輸入中保留小數點輸入狀態）
const formattedDisplayValue = computed(() => {
  if (isError.value) return "錯誤";
  if (displayValue.value === "0" && waitingForOperand.value) return "0";
  // 若以小數點結尾或包含未完成小數，保留原字串
  if (displayValue.value.endsWith(".") || displayValue.value.includes(".")) {
    const [intPart, decPart] = displayValue.value.split(".");
    const numInt = parseFloat(intPart);
    const formattedInt = isNaN(numInt) ? "0" : numInt.toLocaleString("zh-TW");
    return `${formattedInt}.${decPart}`;
  }
  const num = parseFloat(displayValue.value);
  if (isNaN(num)) return displayValue.value;
  return num.toLocaleString("zh-TW");
});

function handleKeypadPress(key: string) {
  error.value = "";

  // 錯誤狀態下，僅允許點擊 AC 重置
  if (isError.value) {
    if (key === "AC" || key === "C") {
      resetAll();
    }
    return;
  }

  // 1. 數字輸入 (0 ~ 9)
  if (key >= "0" && key <= "9") {
    if (isEvaluated.value) {
      // 剛剛按下 = 結算後，按數字開始全新一輪
      displayValue.value = key;
      previousValue.value = null;
      activeOperator.value = null;
      lastOperator.value = null;
      lastOperand.value = null;
      historyExpression.value = "";
      isEvaluated.value = false;
      waitingForOperand.value = false;
      return;
    }

    if (waitingForOperand.value) {
      // 正在等待第二操作數：覆蓋顯示
      displayValue.value = key;
      waitingForOperand.value = false;
    } else {
      // 正常追加數字
      displayValue.value =
        displayValue.value === "0" ? key : displayValue.value + key;
    }

    // 實時更新歷史算式條
    if (previousValue.value !== null && activeOperator.value) {
      historyExpression.value = `${previousValue.value} ${activeOperator.value} ${displayValue.value}`;
    }
    return;
  }

  // 2. 小數點 (.)
  if (key === ".") {
    if (isEvaluated.value) {
      displayValue.value = "0.";
      previousValue.value = null;
      activeOperator.value = null;
      historyExpression.value = "";
      isEvaluated.value = false;
      waitingForOperand.value = false;
      return;
    }

    if (waitingForOperand.value) {
      displayValue.value = "0.";
      waitingForOperand.value = false;
      return;
    }

    if (!displayValue.value.includes(".")) {
      displayValue.value += ".";
    }
    return;
  }

  // 3. 運算符 (+, -, ×, ÷)
  if (key === "+" || key === "-" || key === "×" || key === "÷") {
    const op = key as "+" | "-" | "×" | "÷";
    isEvaluated.value = false;

    // 若使用者已經選了運算符但還沒輸入下個數字，切換運算符
    if (activeOperator.value && waitingForOperand.value) {
      activeOperator.value = op;
      historyExpression.value = `${previousValue.value} ${op}`;
      return;
    }

    // 鏈式計算 (Chaining)：若之前已有運算符與前操作數，立刻先算上一輪
    if (
      previousValue.value !== null &&
      activeOperator.value &&
      !waitingForOperand.value
    ) {
      const current = parseFloat(displayValue.value);
      const res = calculate(previousValue.value, current, activeOperator.value);
      if (res === "Error") {
        isError.value = true;
        historyExpression.value = `${previousValue.value} ${activeOperator.value} 0 =`;
        return;
      }
      displayValue.value = String(res);
      previousValue.value = res;
      activeOperator.value = op;
      waitingForOperand.value = true;
      historyExpression.value = `${res} ${op}`;
      return;
    }

    // 首次輸入運算符
    previousValue.value = parseFloat(displayValue.value);
    activeOperator.value = op;
    waitingForOperand.value = true;
    historyExpression.value = `${displayValue.value} ${op}`;
    return;
  }

  // 4. 百分比 (%)
  if (key === "%") {
    const current = parseFloat(displayValue.value);
    if (!isNaN(current)) {
      const res = Math.round((current / 100) * 100000000) / 100000000;
      displayValue.value = String(res);
      if (isEvaluated.value) {
        historyExpression.value = `${res}`;
      }
    }
    return;
  }

  // 5. 退格 (⌫)
  if (key === "backspace" || key === "⌫") {
    // Q4 Grill 定案：若運算符處於高亮等待輸入時，點退格撤銷運算符狀態
    if (activeOperator.value && waitingForOperand.value) {
      activeOperator.value = null;
      waitingForOperand.value = false;
      historyExpression.value = "";
      return;
    }

    // 若剛按過等號，退格直接撤銷等號結算
    if (isEvaluated.value) {
      isEvaluated.value = false;
      return;
    }

    // 正常退格
    if (displayValue.value.length > 1) {
      displayValue.value = displayValue.value.slice(0, -1);
      // 若只剩負號也變回 0
      if (displayValue.value === "-") displayValue.value = "0";
    } else {
      displayValue.value = "0";
    }

    if (previousValue.value !== null && activeOperator.value) {
      historyExpression.value = `${previousValue.value} ${activeOperator.value} ${displayValue.value}`;
    }
    return;
  }

  // 6. 清除鍵 (AC / C)
  if (key === "AC" || key === "C") {
    if (clearButtonText.value === "C") {
      // 僅清除目前螢幕輸入
      displayValue.value = "0";
      if (previousValue.value !== null && activeOperator.value) {
        historyExpression.value = `${previousValue.value} ${activeOperator.value}`;
      }
    } else {
      // 全清重置
      resetAll();
    }
    return;
  }

  // 7. 等號 (=)
  if (key === "=") {
    // 運算結算
    if (activeOperator.value && previousValue.value !== null) {
      const current = parseFloat(displayValue.value);
      const res = calculate(previousValue.value, current, activeOperator.value);
      if (res === "Error") {
        isError.value = true;
        historyExpression.value = `${previousValue.value} ${activeOperator.value} 0 =`;
        return;
      }
      lastOperator.value = activeOperator.value;
      lastOperand.value = current;
      historyExpression.value = `${previousValue.value} ${activeOperator.value} ${current} =`;
      displayValue.value = String(res);
      previousValue.value = res;
      activeOperator.value = null;
      waitingForOperand.value = false;
      isEvaluated.value = true;
      return;
    }

    // 連續按 = 重複上一輪運算 (iOS 經典特性)
    if (
      isEvaluated.value &&
      lastOperator.value &&
      lastOperand.value !== null
    ) {
      const current = parseFloat(displayValue.value);
      const res = calculate(current, lastOperand.value, lastOperator.value);
      if (res !== "Error") {
        historyExpression.value = `${current} ${lastOperator.value} ${lastOperand.value} =`;
        displayValue.value = String(res);
        previousValue.value = res;
      }
      return;
    }

    // 單純確認結算單一數值
    historyExpression.value = `${parseFloat(displayValue.value)} =`;
    isEvaluated.value = true;
    return;
  }
}

function resetAll() {
  displayValue.value = "0";
  previousValue.value = null;
  activeOperator.value = null;
  waitingForOperand.value = false;
  isEvaluated.value = false;
  lastOperator.value = null;
  lastOperand.value = null;
  historyExpression.value = "";
  isError.value = false;
}

// 主數字區域向左滑動刪除末位手勢 (Swipe to Backspace)
let numberTouchStartX = 0;
function handleNumberTouchStart(event: TouchEvent) {
  if (event.touches.length === 1) {
    numberTouchStartX = event.touches[0].clientX;
  }
}
function handleNumberTouchEnd(event: TouchEvent) {
  if (event.changedTouches.length === 1) {
    const deltaX = event.changedTouches[0].clientX - numberTouchStartX;
    // 向左滑動超過 30px
    if (deltaX < -30) {
      handleKeypadPress("⌫");
    }
  }
}

function close() {
  emit("close");
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      fromId.value =
        props.initialFromNode?.id ||
        props.nodes.find((node) => node.owner === "me")?.id ||
        "";
      toId.value =
        props.nodes.find((node) => node.owner === "external")?.id ||
        props.nodes.find((node) => node.id !== fromId.value)?.id ||
        "";
      resetAll();
      memo.value = "";
      executed.value = true;
      selectedTags.value = [];
      tagInput.value = "";
      error.value = "";
    }
  },
);

async function addTag() {
  if (!tagInput.value.trim()) return;
  const tag = await props.onCreateTag(tagInput.value);
  if (!selectedTags.value.includes(tag.id)) selectedTags.value.push(tag.id);
  tagInput.value = "";
}
function submit() {
  if (isError.value) {
    error.value = "計算出現錯誤，請先點擊 AC 重置";
    return;
  }

  // Q1 Grill 定案：一律必須按下 = 結算確認
  if (!isEvaluated.value) {
    error.value = "請先按下 = 完成結算確認金額";
    return;
  }

  const value = parseFloat(displayValue.value);

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
  <BaseSheet :is-open="isOpen" title="🧾 記一筆資金流向" size="lg" @close="close">
    <div class="quick-entry-form">
      <p v-if="error" class="error">{{ error }}</p>
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

          <!-- 金額顯示盒與 iOS 18 歷史算式條 -->
          <div
            class="amount-display-box"
            :class="{ 'need-calc': !isEvaluated }"
            @touchstart="handleNumberTouchStart"
            @touchend="handleNumberTouchEnd"
          >
            <div class="expression-preview">
              {{ historyExpression }}
            </div>
            <div class="amount-value">
              <span class="currency-symbol">$</span>
              <span
                class="value-number"
                :class="{ 'error-text': isError }"
              >
                {{ formattedDisplayValue }}
              </span>
            </div>
          </div>

          <!-- 標準 iOS 5 列小算盤鍵盤（維持黑白極簡風格） -->
          <div class="keypad-grid ios-5-rows">
            <!-- Row 1: AC/C, ⌫, %, ÷ -->
            <button
              type="button"
              class="keypad-btn key-func"
              :class="{ 'key-c': clearButtonText === 'C' }"
              @click="handleKeypadPress(clearButtonText)"
            >
              {{ clearButtonText }}
            </button>
            <button
              type="button"
              class="keypad-btn key-func"
              title="退格（亦可於上方數字左滑）"
              @click="handleKeypadPress('⌫')"
            >
              ⌫
            </button>
            <button
              type="button"
              class="keypad-btn key-func"
              title="百分比"
              @click="handleKeypadPress('%')"
            >
              %
            </button>
            <button
              type="button"
              class="keypad-btn key-op"
              :class="{ active: activeOperator === '÷' && waitingForOperand }"
              @click="handleKeypadPress('÷')"
            >
              ÷
            </button>

            <!-- Row 2: 7, 8, 9, × -->
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
              :class="{ active: activeOperator === '×' && waitingForOperand }"
              @click="handleKeypadPress('×')"
            >
              ×
            </button>

            <!-- Row 3: 4, 5, 6, - -->
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
              class="keypad-btn key-op"
              :class="{ active: activeOperator === '-' && waitingForOperand }"
              @click="handleKeypadPress('-')"
            >
              -
            </button>

            <!-- Row 4: 1, 2, 3, + -->
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
              :class="{ active: activeOperator === '+' && waitingForOperand }"
              @click="handleKeypadPress('+')"
            >
              +
            </button>

            <!-- Row 5: 0 (跨雙格), ., = -->
            <button
              type="button"
              class="keypad-btn key-num key-zero"
              @click="handleKeypadPress('0')"
            >
              0
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
              class="keypad-btn key-op key-equal"
              :class="{ 'pulse-attention': !isEvaluated }"
              title="結算金額"
              @click="handleKeypadPress('=')"
            >
              =
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

    <template #footer>
      <button class="submit" type="button" @click="submit">儲存</button>
    </template>
  </BaseSheet>
</template>

<style scoped>
.quick-entry-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error {
  color: var(--accent-expense);
  margin: 4px 0 0;
  font-size: 12px;
}

.node-selectors {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.quick-entry-form label {
  display: grid;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.quick-entry-form input,
.quick-entry-form select {
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
  padding: 6px 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-height: 56px;
  transition: border-color 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;
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
.value-number.error-text {
  color: var(--accent-expense) !important;
  font-size: 20px;
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

/* 標準 iOS 5 列小算盤鍵盤 */
.keypad-grid.ios-5-rows {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}
.keypad-btn {
  height: 38px;
  border-radius: 8px;
  font-size: 16px;
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
.key-zero {
  grid-column: span 2;
  justify-content: flex-start;
  padding-left: 22px;
}
.key-func {
  background: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  font-size: 15px;
}
.key-func:active {
  background: var(--border-light);
  transform: scale(0.97);
}
.key-func.key-c {
  color: var(--text-primary);
  font-weight: 700;
}
.key-op {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-dashed);
  font-size: 18px;
}
.key-op:active {
  background: var(--border-light);
  transform: scale(0.97);
}
/* 運算符選中反色高亮 (Active Operator Highlight) */
.key-op.active {
  background: var(--text-primary) !important;
  color: var(--bg-surface) !important;
  border-color: var(--text-primary) !important;
  box-shadow: 0 0 0 2px var(--bg-surface), 0 0 0 3px var(--text-primary);
}
.key-equal {
  background: var(--text-primary);
  color: #fff;
  border: 0;
  font-size: 18px;
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
</style>
