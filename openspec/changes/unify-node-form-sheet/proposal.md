## Why

目前在帳戶管理（`NodesView.vue`）中，新增節點採用頁面內嵌展開表單（Inline Panel），展開時會垂直向下推擠既有節點清單；而編輯節點則採用獨立由底部滑出的抽屜（Bottom Sheet），兩者的視覺佈局、操作動線與驗證邏輯不一致。將新增與編輯統一收斂為單一通用抽屜（`NodeFormSheet.vue`），能消除重複程式碼，並帶來一致且流暢的單手操作體驗。

## What Changes

- **建立通用節點表單抽屜（`NodeFormSheet.vue`）**：
  - 整合新增與編輯行為：透過傳入之 `node: FinanceNode | null` 動態切換模式。
  - **新增模式**：標題顯示「新增節點」，預設空名稱與 `landmark` 圖示，底部提供「建立節點」主要動作按鈕。
  - **編輯模式**：標題顯示「編輯節點」，帶入原有節點數據，底部提供「儲存修改」與「封存節點」操作按鈕。
  - 統一採用高度對齊的「[圖示按鈕] [名稱輸入框]」並排設計，並整合 `IconPickerSheet`。
  - 取代原有的 `EditNodeSheet.vue`。
- **簡化節點管理頁面（`NodesView.vue`）**：
  - 移除頂部內嵌表單（`.panel`）、`isAdding` 展開狀態與重複的輸入暫存變數。
  - 點擊頂部「＋ 新增」按鈕以新增模式開啟 `NodeFormSheet`；點擊清單卡片以編輯模式開啟。

## Capabilities

### New Capabilities
<!-- 無新增獨立 capability -->

### Modified Capabilities
- `mobile-receipt-ui`: 統一新增與編輯節點的底部抽屜行為與佈局。

## Impact

- **Affected Components**:
  - `src/components/NodeFormSheet.vue` (新元件，取代 EditNodeSheet)
  - `src/components/EditNodeSheet.vue` (移除或導向通用元件)
  - `src/components/NodesView.vue` (簡化移除內嵌表單)
