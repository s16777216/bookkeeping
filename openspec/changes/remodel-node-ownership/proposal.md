## Why

傳統會計將帳目生硬劃分為「資產、負債、收入、支出」4 種抽象分類，對一般使用者而言概念繁瑣，且難以自然表達現實生活中極為頻繁的「朋友聚餐代墊」、「借還款」、「多方資金流轉」等情境。
在圖論世界中，交易的本質是 **「資金在不同人/實體之間的轉移」**。透過引入 **「節點擁有者主權模型（Node Ownership Model）」**，系統只需標註節點的擁有者（例如：`我的帳戶` vs `外部對象/商家/朋友`），即可自動從資金流動邊界精確推導出總資產、收入、支出與代墊債權，讓記帳回歸最直覺的生活體驗。

## What Changes

- **節點擁有者資料結構（Node Ownership Schema）**：在 [src/types/finance.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/types/finance.ts) 中重構 `FinanceNode`，新增 `owner` 屬性（如 `'me'` 代表我的蓄水池，`'external'` 代表外部商家/公司/他人）。
- **圖論收支與資產自動推導引擎（Graph Derivation Engine）**：在 [src/composables/useGraphEngine.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/composables/useGraphEngine.ts) 中：
  - **我的總身價 (Net Worth)**：自動加總所有 `owner === 'me'` 節點之淨值（`流入 - 流出`）。
  - **總支出 (Expenses)**：自動統計由 `owner: 'me'` 流向 `owner: 'external'` 的跨邊界總額。
  - **總收入 (Income)**：自動統計由 `owner: 'external'` 流向 `owner: 'me'` 的跨邊界總額。
  - **內部流轉 (Transfers)**：在 `owner: 'me'` 之間轉移，總資產恆定不變。
  - **債權與代墊 (Debts / Receivables)**：外部人物節點的餘額若為正數，自動識別為「應收借款/代墊款」。
- **節點管理與記帳選單適配（NodesView & QuickEntrySheet）**：
  - 在節點管理中清楚分組「我的資產帳戶（錢包、銀行、證券）」與「外部對象/交易對手（超商、朋友、公司）」。
  - 記帳時以「從哪裡出款」與「付給誰/哪個對象」進行直覺選擇。

## Capabilities

### New Capabilities
- `node-ownership-ledger`: 規範基於實體擁有權邊界（Ownership Boundary）的圖論資金流動、資產自動結算、跨邊界收支推導與債權代墊模型。

### Modified Capabilities
<!-- 無既有 specs 修改 -->

## Impact

- **型別定義**：[src/types/finance.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/types/finance.ts)
- **運算邏輯**：[src/composables/useGraphEngine.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/composables/useGraphEngine.ts)
- **UI 元件**：[src/components/NodesView.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/NodesView.vue)、[src/components/QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/QuickEntrySheet.vue)、[src/components/GraphView.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/GraphView.vue)
- **預設資料庫種子**：[src/db/seeds.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/db/seeds.ts) 更新為擁有者模型示範資料。
