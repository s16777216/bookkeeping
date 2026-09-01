<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { FinanceNode, FinanceTag } from "@/types/finance";
import BaseSheet from "@/components/sheets/BaseSheet.vue";
import CalculatorKeypad from "@/components/common/CalculatorKeypad.vue";

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

const fromId = ref("");
const toId = ref("");
const memo = ref("");
const executed = ref(true);
const selectedTags = ref<string[]>([]);
const tagInput = ref("");
const managingTags = ref(false);
const error = ref("");

// 計算機狀態由一體化 CalculatorKeypad 管理
const keypadRef = ref<InstanceType<typeof CalculatorKeypad> | null>(null);
const amount = ref(0);
const isEvaluated = ref(false);
const isCalcError = ref(false);

const activeNodes = computed(() => props.nodes);

function handleCalculatorChange(payload: {
  amount: number;
  isEvaluated: boolean;
  isError: boolean;
}) {
  error.value = "";
  amount.value = payload.amount;
  isEvaluated.value = payload.isEvaluated;
  isCalcError.value = payload.isError;
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
      keypadRef.value?.reset();
      amount.value = 0;
      isEvaluated.value = false;
      isCalcError.value = false;
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
  if (isCalcError.value) {
    error.value = "計算出現錯誤，請先點擊 AC 重置";
    return;
  }

  // Q1 Grill 定案：一律必須按下 = 結算確認
  if (!isEvaluated.value) {
    error.value = "請先按下 = 完成結算確認金額";
    return;
  }

  const value = amount.value;

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
  <BaseSheet :is-open="isOpen" title="記一筆收據" size="lg" @close="close">
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
              {{ node.name }}
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
              {{ node.name }}
            </option>
          </select>
        </label>
      </div>

      <!-- 一體化 iOS 小算盤計算機元件（整合顯示螢幕、歷史算式條與鍵盤按鍵） -->
      <CalculatorKeypad
        ref="keypadRef"
        @change="handleCalculatorChange"
      />

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
              @keyup.enter="addTag"
            />
            <button
              type="button"
              class="plain-btn tag-add-btn"
              @click="addTag"
            >
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
