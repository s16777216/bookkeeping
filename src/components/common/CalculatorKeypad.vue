<script setup lang="ts">
import { computed, ref } from "vue";
import { Delete } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    modelValue?: number;
    initialEvaluated?: boolean;
  }>(),
  {
    modelValue: 0,
    initialEvaluated: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", val: number): void;
  (e: "update:isEvaluated", evaluated: boolean): void;
  (
    e: "change",
    payload: { amount: number; isEvaluated: boolean; isError: boolean },
  ): void;
}>();

// --- iOS 計算機暫存器狀態機 ---
const displayValue = ref("0");
const previousValue = ref<number | null>(null);
const activeOperator = ref<"+" | "-" | "×" | "÷" | null>(null);
const waitingForOperand = ref(false);
const isEvaluated = ref(props.initialEvaluated); // 是否剛剛按下 =
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

function syncState() {
  const num = parseFloat(displayValue.value);
  const validAmount = isNaN(num) || isError.value ? 0 : num;
  emit("update:modelValue", validAmount);
  emit("update:isEvaluated", isEvaluated.value);
  emit("change", {
    amount: validAmount,
    isEvaluated: isEvaluated.value,
    isError: isError.value,
  });
}

function handleKeypadPress(key: string) {
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
      displayValue.value = key;
      previousValue.value = null;
      activeOperator.value = null;
      lastOperator.value = null;
      lastOperand.value = null;
      historyExpression.value = "";
      isEvaluated.value = false;
      waitingForOperand.value = false;
      syncState();
      return;
    }

    if (waitingForOperand.value) {
      displayValue.value = key;
      waitingForOperand.value = false;
    } else {
      displayValue.value =
        displayValue.value === "0" ? key : displayValue.value + key;
    }

    if (previousValue.value !== null && activeOperator.value) {
      historyExpression.value = `${previousValue.value} ${activeOperator.value} ${displayValue.value}`;
    }
    syncState();
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
      syncState();
      return;
    }

    if (waitingForOperand.value) {
      displayValue.value = "0.";
      waitingForOperand.value = false;
      syncState();
      return;
    }

    if (!displayValue.value.includes(".")) {
      displayValue.value += ".";
    }
    syncState();
    return;
  }

  // 3. 運算符 (+, -, ×, ÷)
  if (key === "+" || key === "-" || key === "×" || key === "÷") {
    const op = key as "+" | "-" | "×" | "÷";
    isEvaluated.value = false;

    if (activeOperator.value && waitingForOperand.value) {
      activeOperator.value = op;
      historyExpression.value = `${previousValue.value} ${op}`;
      syncState();
      return;
    }

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
        syncState();
        return;
      }
      displayValue.value = String(res);
      previousValue.value = res;
      activeOperator.value = op;
      waitingForOperand.value = true;
      historyExpression.value = `${res} ${op}`;
      syncState();
      return;
    }

    previousValue.value = parseFloat(displayValue.value);
    activeOperator.value = op;
    waitingForOperand.value = true;
    historyExpression.value = `${displayValue.value} ${op}`;
    syncState();
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
      syncState();
    }
    return;
  }

  // 5. 退格 (⌫)
  if (key === "backspace" || key === "⌫") {
    if (activeOperator.value && waitingForOperand.value) {
      activeOperator.value = null;
      waitingForOperand.value = false;
      historyExpression.value = "";
      syncState();
      return;
    }

    if (isEvaluated.value) {
      isEvaluated.value = false;
      syncState();
      return;
    }

    if (displayValue.value.length > 1) {
      displayValue.value = displayValue.value.slice(0, -1);
      if (displayValue.value === "-") displayValue.value = "0";
    } else {
      displayValue.value = "0";
    }

    if (previousValue.value !== null && activeOperator.value) {
      historyExpression.value = `${previousValue.value} ${activeOperator.value} ${displayValue.value}`;
    }
    syncState();
    return;
  }

  // 6. 清除鍵 (AC / C)
  if (key === "AC" || key === "C") {
    if (clearButtonText.value === "C") {
      displayValue.value = "0";
      if (previousValue.value !== null && activeOperator.value) {
        historyExpression.value = `${previousValue.value} ${activeOperator.value}`;
      }
    } else {
      resetAll();
    }
    syncState();
    return;
  }

  // 7. 等號 (=)
  if (key === "=") {
    if (activeOperator.value && previousValue.value !== null) {
      const current = parseFloat(displayValue.value);
      const res = calculate(previousValue.value, current, activeOperator.value);
      if (res === "Error") {
        isError.value = true;
        historyExpression.value = `${previousValue.value} ${activeOperator.value} 0 =`;
        syncState();
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
      syncState();
      return;
    }

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
      syncState();
      return;
    }

    historyExpression.value = `${parseFloat(displayValue.value)} =`;
    isEvaluated.value = true;
    syncState();
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
  syncState();
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
    if (deltaX < -30) {
      handleKeypadPress("⌫");
    }
  }
}

function setValue(num: number, evaluated = true) {
  displayValue.value = String(num);
  previousValue.value = null;
  activeOperator.value = null;
  waitingForOperand.value = false;
  isEvaluated.value = evaluated;
  lastOperator.value = null;
  lastOperand.value = null;
  historyExpression.value = evaluated && num > 0 ? `${num} =` : "";
  isError.value = false;
  syncState();
}

defineExpose({
  reset: resetAll,
  setValue,
  backspace: () => handleKeypadPress("⌫"),
});
</script>

<template>
  <div class="calculator-container">
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
        <span class="value-number" :class="{ 'error-text': isError }">
          {{ formattedDisplayValue }}
        </span>
      </div>
    </div>

    <!-- 標準 iOS 5 列小算盤鍵盤 -->
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
        class="keypad-btn key-func btn-backspace"
        title="退格（亦可於上方數字左滑）"
        @click="handleKeypadPress('⌫')"
      >
        <Delete :size="20" />
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
  </div>
</template>

<style scoped>
.calculator-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

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
.btn-backspace {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
