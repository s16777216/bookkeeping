<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { ulid } from "ulid";
import { Plus, Trash2, Layers, Receipt } from "lucide-vue-next";
import type { FinanceEdge, FinanceNode, FinanceTag, ReceiptItem } from "@/types/finance";
import BaseSheet from "@/components/sheets/BaseSheet.vue";
import CalculatorKeypad from "@/components/common/CalculatorKeypad.vue";

interface DraftItem {
  id: string;
  name: string;
  amount: number;
  quantity: number;
  isEvaluated: boolean;
}

const props = defineProps<{
  isOpen: boolean;
  nodes: FinanceNode[];
  tags: FinanceTag[];
  initialFromNode?: FinanceNode | null;
  initialEdge?: FinanceEdge | null;
  onCreateTag: (name: string) => Promise<FinanceTag>;
  onRenameTag: (id: string, name: string) => Promise<void>;
  onArchiveTag: (id: string) => Promise<void>;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (
    e: "submit",
    payload: {
      id?: string;
      from_node_id: string;
      to_node_id: string;
      amount: number;
      memo: string;
      executed_at: number | null;
      tag_ids: string[];
      items?: ReceiptItem[];
    },
  ): void;
  (e: "delete", id: string): void;
}>();

const isEditMode = computed(() => Boolean(props.initialEdge));
const sheetTitle = computed(() =>
  props.initialEdge
    ? `編輯收據 ${props.initialEdge.receipt_no ? `(${props.initialEdge.receipt_no})` : ""}`
    : "記一筆收據",
);

const fromId = ref("");
const toId = ref("");
const memo = ref("");
const executed = ref(true);
const selectedTags = ref<string[]>([]);
const tagInput = ref("");
const managingTags = ref(false);
const error = ref("");

// 記帳模式：單筆快速記帳 vs 多品項明細模式
const mode = ref<"single" | "items">("single");
const items = ref<DraftItem[]>([]);
const focusedItemIndex = ref(0);

// 計算機狀態由一體化 CalculatorKeypad 管理
const keypadRef = ref<InstanceType<typeof CalculatorKeypad> | null>(null);
const amount = ref(0);
const isEvaluated = ref(false);
const isCalcError = ref(false);

const activeNodes = computed(() => props.nodes);

const totalItemsAmount = computed(() =>
  items.value.reduce((sum, item) => sum + (item.amount || 0), 0),
);

function handleCalculatorChange(payload: {
  amount: number;
  isEvaluated: boolean;
  isError: boolean;
}) {
  error.value = "";
  isCalcError.value = payload.isError;

  if (mode.value === "single") {
    amount.value = payload.amount;
    isEvaluated.value = payload.isEvaluated;
  } else {
    const activeItem = items.value[focusedItemIndex.value];
    if (activeItem) {
      activeItem.amount = payload.amount;
      activeItem.isEvaluated = payload.isEvaluated;
    }
  }
}

function switchMode(newMode: "single" | "items") {
  mode.value = newMode;
  error.value = "";
  if (newMode === "items") {
    if (items.value.length === 0) {
      items.value = [
        {
          id: ulid(),
          name: "",
          amount: amount.value || 0,
          quantity: 1,
          isEvaluated: isEvaluated.value,
        },
      ];
      focusedItemIndex.value = 0;
    }
    nextTick(() => {
      syncKeypadToFocusedItem();
    });
  } else {
    // 切回單筆模式時，若有多品項加總則帶入單筆總額
    if (items.value.length > 0 && totalItemsAmount.value > 0) {
      amount.value = totalItemsAmount.value;
      isEvaluated.value = true;
      nextTick(() => {
        keypadRef.value?.setValue(amount.value, true);
      });
    }
  }
}

function selectItem(index: number) {
  focusedItemIndex.value = index;
  syncKeypadToFocusedItem();
}

function syncKeypadToFocusedItem() {
  const current = items.value[focusedItemIndex.value];
  if (current) {
    keypadRef.value?.setValue(current.amount, current.isEvaluated);
  }
}

function addItem() {
  const newItem: DraftItem = {
    id: ulid(),
    name: "",
    amount: 0,
    quantity: 1,
    isEvaluated: false,
  };
  items.value.push(newItem);
  focusedItemIndex.value = items.value.length - 1;
  nextTick(() => {
    keypadRef.value?.reset();
  });
}

function removeItem(index: number) {
  if (items.value.length <= 1) return;
  items.value.splice(index, 1);
  if (focusedItemIndex.value >= items.value.length) {
    focusedItemIndex.value = items.value.length - 1;
  }
  syncKeypadToFocusedItem();
}

function close() {
  emit("close");
}

function handleDelete() {
  if (!props.initialEdge) return;
  if (window.confirm("確定要刪除此筆收據嗎？此操作將會移除這筆紀錄。")) {
    emit("delete", props.initialEdge.id);
    close();
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      error.value = "";
      tagInput.value = "";
      managingTags.value = false;

      if (props.initialEdge) {
        // === 編輯模式 (Edit Mode) ===
        const edge = props.initialEdge;
        fromId.value = edge.from_node_id;
        toId.value = edge.to_node_id;
        memo.value = edge.memo || "";
        executed.value = Boolean(edge.executed_at);
        selectedTags.value = [...(edge.tag_ids || [])];

        if (edge.items && edge.items.length > 0) {
          mode.value = "items";
          items.value = edge.items.map((item) => ({
            id: item.id || ulid(),
            name: item.name,
            amount: item.amount,
            quantity: item.quantity || 1,
            isEvaluated: true,
          }));
          focusedItemIndex.value = 0;
          nextTick(() => {
            syncKeypadToFocusedItem();
          });
        } else {
          mode.value = "single";
          items.value = [];
          amount.value = edge.amount;
          isEvaluated.value = true;
          isCalcError.value = false;
          nextTick(() => {
            keypadRef.value?.setValue(edge.amount, true);
          });
        }
      } else {
        // === 新增模式 (Create Mode) ===
        fromId.value =
          props.initialFromNode?.id ||
          props.nodes.find((node) => node.owner === "me")?.id ||
          "";
        toId.value =
          props.nodes.find((node) => node.owner === "external")?.id ||
          props.nodes.find((node) => node.id !== fromId.value)?.id ||
          "";
        mode.value = "single";
        items.value = [];
        focusedItemIndex.value = 0;
        keypadRef.value?.reset();
        amount.value = 0;
        isEvaluated.value = false;
        isCalcError.value = false;
        memo.value = "";
        executed.value = true;
        selectedTags.value = [];
      }
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
  if (isCalcError.value) {
    error.value = "計算出現錯誤，請先點擊 AC 重置";
    return;
  }

  if (!fromId.value || !toId.value || fromId.value === toId.value) {
    error.value = "請填妥不同的起點與終點帳戶/分類";
    return;
  }

  const executedTimestamp = executed.value
    ? props.initialEdge?.executed_at || Date.now()
    : null;

  if (mode.value === "single") {
    // 單筆模式：必須按下 = 結算確認
    if (!isEvaluated.value) {
      error.value = "請先按下 = 完成結算確認金額";
      return;
    }

    const value = amount.value;
    if (!Number.isFinite(value) || value <= 0) {
      error.value = "請輸入正確的金額（需大於 0）";
      return;
    }

    emit("submit", {
      id: props.initialEdge?.id,
      from_node_id: fromId.value,
      to_node_id: toId.value,
      amount: value,
      memo: memo.value,
      executed_at: executedTimestamp,
      tag_ids: [...selectedTags.value],
    });
  } else {
    // 多品項明細模式：檢驗每一項
    if (items.value.length === 0) {
      error.value = "請至少新增一項商品品項";
      return;
    }

    for (let i = 0; i < items.value.length; i++) {
      const item = items.value[i];
      if (!item.name.trim()) {
        error.value = `請填寫第 ${i + 1} 項的商品名稱`;
        focusedItemIndex.value = i;
        syncKeypadToFocusedItem();
        return;
      }
      if (!item.isEvaluated || item.amount <= 0) {
        error.value = `第 ${i + 1} 項「${item.name}」尚未完成金額結算（需大於 0 且按下 =）`;
        focusedItemIndex.value = i;
        syncKeypadToFocusedItem();
        return;
      }
    }

    const totalVal = totalItemsAmount.value;
    if (!Number.isFinite(totalVal) || totalVal <= 0) {
      error.value = "收據合計金額必須大於 0";
      return;
    }

    emit("submit", {
      id: props.initialEdge?.id,
      from_node_id: fromId.value,
      to_node_id: toId.value,
      amount: totalVal,
      memo: memo.value,
      executed_at: executedTimestamp,
      tag_ids: [...selectedTags.value],
      items: items.value.map((i) => ({
        id: i.id,
        name: i.name.trim(),
        amount: i.amount,
        quantity: i.quantity > 0 ? i.quantity : 1,
      })),
    });
  }

  close();
}
</script>

<template>
  <BaseSheet :is-open="isOpen" :title="sheetTitle" size="lg" @close="close">
    <div class="quick-entry-form">
      <p v-if="error" class="error">{{ error }}</p>

      <!-- 模式切換器 -->
      <div class="mode-switcher">
        <button
          type="button"
          class="mode-btn"
          :class="{ active: mode === 'single' }"
          @click="switchMode('single')"
        >
          <Receipt :size="14" />
          單筆快速記帳
        </button>
        <button
          type="button"
          class="mode-btn"
          :class="{ active: mode === 'items' }"
          @click="switchMode('items')"
        >
          <Layers :size="14" />
          多品項明細 {{ items.length > 0 ? `(${items.length})` : "" }}
        </button>
      </div>

      <!-- 起點與終點帳戶/分類 -->
      <div class="node-selectors">
        <label>
          從
          <select v-model="fromId">
            <option v-for="node in activeNodes" :key="node.id" :value="node.id">
              {{ node.name }}
            </option>
          </select>
        </label>
        <label>
          到
          <select v-model="toId">
            <option v-for="node in activeNodes" :key="node.id" :value="node.id">
              {{ node.name }}
            </option>
          </select>
        </label>
      </div>

      <!-- 多品項明細清單區塊 -->
      <div v-if="mode === 'items'" class="items-editor-box">
        <div class="items-header">
          <span class="items-count-text">
            🧾 商品品項清單（{{ items.length }} 項）
          </span>
          <span class="items-total-badge">
            合計: <b>NT$ {{ totalItemsAmount.toLocaleString("zh-TW") }}</b>
          </span>
        </div>

        <div class="items-list">
          <div
            v-for="(item, index) in items"
            :key="item.id"
            class="item-row"
            :class="{ active: focusedItemIndex === index }"
            @click="selectItem(index)"
          >
            <span class="item-index-badge">{{ index + 1 }}</span>
            <input
              v-model="item.name"
              class="item-name-input"
              placeholder="品名 (例如：鮮奶)"
              @click.stop="selectItem(index)"
            />
            <div class="item-qty-container" title="數量">
              <span class="qty-prefix">x</span>
              <input
                v-model.number="item.quantity"
                type="number"
                min="1"
                class="item-qty-input"
                @click.stop
              />
            </div>
            <button
              type="button"
              class="item-amount-display"
              :class="{
                'need-calc': !item.isEvaluated,
                selected: focusedItemIndex === index,
              }"
              @click.stop="selectItem(index)"
            >
              NT$ {{ item.amount.toLocaleString("zh-TW") }}
            </button>
            <button
              v-if="items.length > 1"
              type="button"
              class="item-remove-btn"
              title="刪除品項"
              @click.stop="removeItem(index)"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </div>

        <div class="items-actions">
          <button type="button" class="add-item-btn" @click="addItem">
            <Plus :size="14" />
            新增商品品項
          </button>
        </div>

        <div class="active-item-hint">
          正在設定第 <b>{{ focusedItemIndex + 1 }}</b> 項「{{
            items[focusedItemIndex]?.name || "未命名商品"
          }}」金額
        </div>
      </div>

      <!-- 一體化 iOS 小算盤計算機元件 -->
      <CalculatorKeypad ref="keypadRef" @change="handleCalculatorChange" />

      <label>
        備註
        <input v-model="memo" placeholder="例如：全聯週末採買、好市多" />
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
              @keyup.enter="addTag"
            />
            <button type="button" class="plain-btn tag-add-btn" @click="addTag">
              + 新增
            </button>
            <button
              type="button"
              class="plain-btn tag-manage-btn"
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
                ? (selectedTags = selectedTags.filter((id) => id !== tag.id))
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
      <div class="sheet-footer-actions">
        <button
          v-if="isEditMode"
          type="button"
          class="delete-btn"
          @click="handleDelete"
        >
          <Trash2 :size="15" />
          刪除收據
        </button>
        <button class="submit" type="button" @click="submit">
          儲存
          {{
            mode === "items" && totalItemsAmount > 0
              ? `(NT$ ${totalItemsAmount.toLocaleString("zh-TW")})`
              : mode === "single" && amount > 0 && isEvaluated
                ? `(NT$ ${amount.toLocaleString("zh-TW")})`
                : ""
          }}
        </button>
      </div>
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

/* 模式切換標籤 */
.mode-switcher {
  display: flex;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 3px;
  gap: 4px;
}
.mode-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  border: 0;
  cursor: pointer;
  transition: all 0.15s ease;
}
.mode-btn.active {
  background: var(--bg-container);
  color: var(--text-primary);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
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

/* 多品項明細編輯區 */
.items-editor-box {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  padding-bottom: 6px;
  border-bottom: 1px dashed var(--border-light);
}
.items-count-text {
  font-weight: 600;
  color: var(--text-primary);
}
.items-total-badge {
  font-size: 12px;
  color: var(--text-secondary);
}
.items-total-badge b {
  color: var(--text-primary);
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
}
.items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
}
.item-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 4px 6px;
  transition: all 0.15s ease;
}
.item-row.active {
  border-color: var(--text-primary);
  background: var(--bg-surface);
}
.item-index-badge {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 50%;
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 600;
  flex-shrink: 0;
}
.item-name-input {
  min-width: 0;
  flex: 1;
  padding: 5px 8px !important;
  font-size: 13px !important;
  border: 1px solid transparent !important;
  background: transparent !important;
}
.item-name-input:focus {
  background: var(--bg-container) !important;
  border-color: var(--border-light) !important;
}
.item-qty-container {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  padding: 2px 4px;
}
.qty-prefix {
  font-size: 11px;
  color: var(--text-secondary);
}
.item-qty-input {
  width: 32px;
  padding: 2px 0 !important;
  font-size: 12px !important;
  text-align: center;
  border: none !important;
  background: transparent !important;
}
.item-amount-display {
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
  font-family: "JetBrains Mono", monospace;
  cursor: pointer;
  white-space: nowrap;
}
.item-amount-display.selected {
  border-color: var(--text-primary);
  background: var(--text-primary);
  color: #fff;
}
.item-amount-display.need-calc {
  border-style: dashed;
}
.item-remove-btn {
  background: transparent;
  color: var(--text-secondary);
  border: 0;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
}
.item-remove-btn:hover {
  color: var(--accent-expense);
}
.items-actions {
  display: flex;
  margin-top: 2px;
}
.add-item-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px;
  font-size: 12px;
  background: var(--bg-container);
  color: var(--text-secondary);
  border: 1px dashed var(--border-light);
  border-radius: 6px;
  cursor: pointer;
}
.add-item-btn:hover {
  color: var(--text-primary);
  border-color: var(--text-primary);
}
.active-item-hint {
  font-size: 11px;
  color: var(--text-secondary);
  text-align: center;
  padding: 2px 0;
}

.plain-btn {
  background: none;
  border: 1px dashed var(--border-light);
  color: var(--text-secondary);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
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
.sheet-footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.delete-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px;
  background: transparent;
  color: var(--accent-expense);
  border: 1px solid var(--border-light);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.delete-btn:hover {
  background: rgba(239, 68, 68, 0.08);
  border-color: var(--accent-expense);
}
.submit {
  flex: 1;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  background: var(--text-primary);
  color: #fff;
  border: 0;
  cursor: pointer;
  transition: opacity 0.15s ease;
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
