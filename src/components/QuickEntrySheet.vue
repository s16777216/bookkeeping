<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { FinanceNode } from '../types/finance';

const props = defineProps<{
  isOpen: boolean;
  nodes: FinanceNode[];
  initialFromNode?: FinanceNode | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: { from_node_id: string; to_node_id: string; amount: number; memo: string }): void;
}>();

const selectedFromId = ref<string>('');
const selectedToId = ref<string>('');
const amountInput = ref<string>('');
const memoInput = ref<string>('');
const errorMessage = ref<string>('');

// 分類節點群組
const fromNodes = computed(() => {
  // 來源可以是：資產 (轉帳/消費) 或 收入 (薪資/獲利)
  return props.nodes.filter((n) => n.type === 'asset' || n.type === 'income');
});

const toNodes = computed(() => {
  // 去向可以是：支出 (消費) 或 資產 (存入/轉帳)
  return props.nodes.filter((n) => n.type === 'expense' || n.type === 'asset');
});

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMessage.value = '';
      amountInput.value = '';
      memoInput.value = '';
      if (props.initialFromNode) {
        selectedFromId.value = props.initialFromNode.id;
      } else if (fromNodes.value.length > 0 && !selectedFromId.value) {
        selectedFromId.value = fromNodes.value[0].id;
      }

      const defaultExpense = toNodes.value.find((n) => n.type === 'expense');
      if (defaultExpense && !selectedToId.value) {
        selectedToId.value = defaultExpense.id;
      }
    }
  }
);

function appendNumber(num: string) {
  if (num === '.' && amountInput.value.includes('.')) return;
  if (amountInput.value === '0' && num !== '.') {
    amountInput.value = num;
  } else {
    amountInput.value += num;
  }
}

function clearNumber() {
  amountInput.value = '';
}

function backspaceNumber() {
  amountInput.value = amountInput.value.slice(0, -1);
}

function handleSubmit() {
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    errorMessage.value = '請輸入大於 0 的有效金額';
    return;
  }
  if (!selectedFromId.value || !selectedToId.value) {
    errorMessage.value = '請選取資金來源與資金終點節點';
    return;
  }
  if (selectedFromId.value === selectedToId.value) {
    errorMessage.value = '來源帳戶與終點帳戶不能相同';
    return;
  }

  emit('submit', {
    from_node_id: selectedFromId.value,
    to_node_id: selectedToId.value,
    amount,
    memo: memoInput.value
  });
  emit('close');
}
</script>

<template>
  <div v-if="props.isOpen" class="sheet-overlay" @click.self="emit('close')">
    <div class="sheet-container animate-slide-up">
      <!-- 頂部拉桿與標題 -->
      <div class="sheet-header">
        <div class="sheet-drag-handle"></div>
        <div class="sheet-title-row">
          <span class="sheet-title">🧾 記一筆款項流向</span>
          <button class="sheet-close-btn" @click="emit('close')">✕</button>
        </div>
      </div>

      <div class="sheet-content">
        <!-- 錯誤提示 -->
        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <!-- 1. 資金起點 (From Node) -->
        <div class="field-group">
          <div class="field-label">1. 資金來源 (從哪裡出款)</div>
          <div class="node-selector-grid">
            <button
              v-for="node in fromNodes"
              :key="node.id"
              type="button"
              class="selector-pill"
              :class="{ selected: selectedFromId === node.id }"
              @click="selectedFromId = node.id"
            >
              <span>{{ node.icon }}</span>
              <span>{{ node.name }}</span>
            </button>
          </div>
        </div>

        <!-- 2. 資金終點 (To Node) -->
        <div class="field-group">
          <div class="field-label">2. 資金去向 (流向何處)</div>
          <div class="node-selector-grid">
            <button
              v-for="node in toNodes"
              :key="node.id"
              type="button"
              class="selector-pill"
              :class="{ selected: selectedToId === node.id }"
              @click="selectedToId = node.id"
            >
              <span>{{ node.icon }}</span>
              <span>{{ node.name }}</span>
            </button>
          </div>
        </div>

        <!-- 3. 金額輸入 (大型顯示 + 數字鍵盤) -->
        <div class="field-group">
          <div class="field-label">3. 金額 (AMOUNT)</div>
          <div class="amount-display-box font-mono">
            <span class="amount-prefix">NT$</span>
            <span class="amount-value">{{ amountInput || '0' }}</span>
          </div>

          <!-- 數字鍵盤 -->
          <div class="keypad-grid font-mono">
            <button type="button" class="key-btn" @click="appendNumber('1')">1</button>
            <button type="button" class="key-btn" @click="appendNumber('2')">2</button>
            <button type="button" class="key-btn" @click="appendNumber('3')">3</button>
            <button type="button" class="key-btn" @click="appendNumber('4')">4</button>
            <button type="button" class="key-btn" @click="appendNumber('5')">5</button>
            <button type="button" class="key-btn" @click="appendNumber('6')">6</button>
            <button type="button" class="key-btn" @click="appendNumber('7')">7</button>
            <button type="button" class="key-btn" @click="appendNumber('8')">8</button>
            <button type="button" class="key-btn" @click="appendNumber('9')">9</button>
            <button type="button" class="key-btn clear-key" @click="clearNumber">C</button>
            <button type="button" class="key-btn" @click="appendNumber('0')">0</button>
            <button type="button" class="key-btn" @click="backspaceNumber">⌫</button>
          </div>
        </div>

        <!-- 4. 備註 (選填) -->
        <div class="field-group">
          <div class="field-label">4. 交易備註 (選填)</div>
          <input
            v-model="memoInput"
            type="text"
            class="memo-input"
            placeholder="如：午餐拉麵、高鐵車票..."
            maxlength="40"
          />
        </div>

        <!-- 提交按鈕 -->
        <button class="submit-action-btn" @click="handleSubmit">
          🧾 開立並保存收據
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.sheet-container {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  background-color: var(--bg-surface);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-float);
  overflow: hidden;
}

.sheet-header {
  padding: 12px 20px 8px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sheet-drag-handle {
  width: 36px;
  height: 4px;
  background-color: var(--border-dashed);
  border-radius: var(--radius-full);
  margin-bottom: 8px;
}

.sheet-title-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sheet-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.sheet-close-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 8px;
}

.sheet-content {
  padding: 16px 20px calc(env(safe-area-inset-bottom, 0px) + 20px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-banner {
  background-color: var(--accent-expense-bg);
  color: var(--accent-expense);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.node-selector-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.selector-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background-color: var(--bg-container);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  font-size: 12px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.selector-pill.selected {
  background-color: var(--text-primary);
  color: #FFFFFF;
  font-weight: 600;
}

.amount-display-box {
  background-color: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 6px;
}

.amount-prefix {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.amount-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.keypad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 4px;
}

.key-btn {
  background-color: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.1s ease;
}

.key-btn:active {
  background-color: var(--border-light);
  transform: scale(0.97);
}

.clear-key {
  color: var(--accent-expense);
}

.memo-input {
  width: 100%;
  background-color: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-size: 13px;
  color: var(--text-primary);
  outline: none;
}

.memo-input:focus {
  border-color: var(--text-primary);
}

.submit-action-btn {
  width: 100%;
  background-color: var(--text-primary);
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-md);
  padding: 14px 0;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 6px;
  box-shadow: var(--shadow-md);
  transition: all 0.2s ease;
}

.submit-action-btn:hover {
  background-color: #333333;
}

.submit-action-btn:active {
  transform: scale(0.98);
}
</style>
