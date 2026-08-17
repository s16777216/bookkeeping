<script setup lang="ts">
import { ref } from 'vue';
import type { FinanceNode, NodeType } from '../types/finance';

const props = defineProps<{
  nodes: FinanceNode[];
  onCreateNode: (payload: { name: string; type: NodeType; icon?: string }) => Promise<FinanceNode>;
  onDeleteNode: (id: string) => Promise<void>;
}>();

const isAdding = ref(false);
const newName = ref('');
const newType = ref<NodeType>('expense');
const newIcon = ref('🏷️');

const typeOptions: { label: string; value: NodeType }[] = [
  { label: '資產 (銀行/錢包)', value: 'asset' },
  { label: '支出分類', value: 'expense' },
  { label: '收入來源', value: 'income' },
  { label: '負債 (信用卡/借貸)', value: 'liability' }
];

async function handleAdd() {
  if (!newName.value.trim()) return;
  await props.onCreateNode({
    name: newName.value.trim(),
    type: newType.value,
    icon: newIcon.value
  });
  newName.value = '';
  isAdding.value = false;
}
</script>

<template>
  <div class="nodes-view-container animate-fade-in">
    <div class="view-header">
      <div>
        <div class="view-title">💼 帳戶與分類管理</div>
        <div class="view-subtitle">自訂資金起點（資產/收入）與終點（支出/負債）</div>
      </div>
      <button class="add-node-btn" @click="isAdding = !isAdding">
        {{ isAdding ? '取消' : '＋ 新增節點' }}
      </button>
    </div>

    <!-- 新增節點表單 -->
    <div v-if="isAdding" class="add-form-card">
      <div class="form-title">新增圖論節點</div>
      <div class="form-row">
        <label>節點名稱</label>
        <input v-model="newName" type="text" placeholder="如：聯邦信用卡、星巴克咖啡..." />
      </div>
      <div class="form-row">
        <label>節點類型</label>
        <select v-model="newType">
          <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div class="form-row">
        <label>代表 Emoji 圖示</label>
        <input v-model="newIcon" type="text" maxlength="4" style="width: 60px; text-align: center;" />
      </div>
      <button class="save-node-btn" @click="handleAdd">確認建立節點</button>
    </div>

    <!-- 現有節點清單 -->
    <div class="nodes-list">
      <div v-for="node in props.nodes" :key="node.id" class="node-card">
        <div class="node-left">
          <span class="node-icon">{{ node.icon || '🏷️' }}</span>
          <div class="node-texts">
            <span class="node-name">{{ node.name }}</span>
            <span class="node-type-tag" :class="`tag-${node.type}`">{{ node.type }}</span>
          </div>
        </div>
        <button class="node-del-btn" title="軟刪除節點" @click="props.onDeleteNode(node.id)">
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nodes-view-container {
  padding: 16px 20px 30px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.view-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.view-subtitle {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.add-node-btn {
  background-color: var(--text-primary);
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.add-form-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: var(--shadow-sm);
}

.form-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-row label {
  font-size: 11px;
  color: var(--text-secondary);
}

.form-row input,
.form-row select {
  background-color: var(--bg-container);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  font-size: 13px;
  outline: none;
}

.save-node-btn {
  background-color: var(--text-primary);
  color: #FFFFFF;
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
}

.nodes-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.node-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
}

.node-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-icon {
  font-size: 18px;
}

.node-texts {
  display: flex;
  flex-direction: column;
}

.node-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.node-type-tag {
  font-size: 9px;
  text-transform: uppercase;
  color: var(--text-muted);
}

.tag-asset { color: var(--text-primary); font-weight: 600; }
.tag-income { color: var(--accent-income); font-weight: 600; }
.tag-expense { color: var(--accent-expense); }

.node-del-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  padding: 4px;
}

.node-del-btn:hover {
  color: var(--accent-expense);
}
</style>
