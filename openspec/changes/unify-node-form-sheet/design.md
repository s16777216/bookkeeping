## Context

參見 `proposal.md`。目前 `NodesView.vue` 維護一組內嵌新增表單狀態，而 `EditNodeSheet.vue` 則維護一組編輯抽屜狀態，造成表單佈局與邏輯重複。

## Goals / Non-Goals

**Goals:**
- 建立單一通用抽屜元件 `src/components/NodeFormSheet.vue`，同時負責新增與編輯節點。
- 根據傳入之 `node` 是否為 `null` 自動切換標題、預設值與底部動作（新增為「建立節點」，編輯為「儲存修改」+「封存節點」）。
- 重構 `NodesView.vue`，移除內嵌表單相關之 HTML 與狀態變數，保持介面乾淨不擠壓清單。
- 移除既有的 `EditNodeSheet.vue`。

**Non-Goals:**
- 不變更 Dexie 資料庫 schema 或節點資料結構。

## Decisions

### 1. 通用元件介面設計 (`NodeFormSheet.vue`)
- **Props**:
  - `isOpen: boolean`
  - `node: FinanceNode | null`
  - `onCreate: (payload: { name: string; owner: NodeOwner; icon?: string }) => Promise<void>`
  - `onUpdate: (id: string, updates: Partial<Omit<FinanceNode, "id" | "updated_at">>) => Promise<void>`
  - `onArchive: (id: string) => Promise<void>`
- **狀態管理**:
  - `watch(() => props.isOpen)`:
    - 若 `props.node` 為真值（編輯模式）：載入 `props.node.name`、`props.node.icon`、`props.node.owner`。
    - 若 `props.node` 為空（新增模式）：重設為 `name = ""`、`icon = "landmark"`、`owner = "me"`。
- **表單佈局**:
  - 第一列：水平並排「44px 圖示方塊 + 44px 名稱輸入框」。
  - 第二列：資金主權下拉選單。
  - 底部操作列：根據 `isCreateMode` 渲染單一建立按鈕，或儲存修改與封存雙按鈕。

### 2. `NodesView.vue` 呼叫整合
- 僅保留單一抽屜控制狀態：
  ```ts
  const activeNode = ref<FinanceNode | null>(null);
  const isSheetOpen = ref(false);

  function openCreate() {
    activeNode.value = null;
    isSheetOpen.value = true;
  }

  function openEdit(node: FinanceNode) {
    activeNode.value = node;
    isSheetOpen.value = true;
  }
  ```

## Risks / Trade-offs

- **[Risk] 舊元件移除風險** → Mitigation: 檢查全站程式碼，僅 `NodesView.vue` 引用 `EditNodeSheet.vue`，重構後可安全移除該舊檔案。
