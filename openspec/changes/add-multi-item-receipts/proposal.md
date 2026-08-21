## Why

目前系統的收據（Edge）僅支援「單一來源 ➔ 單一去向 ➔ 單一金額」的一對一架構。然而在日常生活中，超市採購、大賣場購物、綜合帳單往往包含多個不同品項（如食品、日用品、文具），若分開記帳過於繁瑣，若混為一筆則無法精確統計各分類的支出。
透過支援「多品項收據（Multi-item Receipts）」，使用者可在同一張收據內拆分多個商品項目，各別指定支出分類，由系統自動加總並於圖論引擎中精確分流計算。

## What Changes

- **資料模型擴充（Data Model）**：在 [src/types/finance.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/types/finance.ts) 中定義 `ReceiptItem` 型別，並在 `FinanceEdge` 中加入 `items?: ReceiptItem[]` 欄位。
- **圖論運算引擎升級（Graph Engine）**：在 [useGraphEngine.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/composables/useGraphEngine.ts) 中，若收據包含 `items`，自動將出款總額計入來源帳戶，並將各 item 之金額個別計入各子分類節點的流入度（Inflow），確保總資產與各項支出分類 100% 精準平衡。
- **記帳面板支援明細模式（QuickEntrySheet）**：提供快速單筆與多品項明細兩種模式，支援動態「＋ 新增品項」、自訂品項名稱、金額、個別分類選擇與總金額自動計算。
- **擬真收據小票卡片升級（ReceiptCard）**：在首頁收據卡片中支援展開檢視多品項明細清單（品名、分類標籤、單項金額、品項數統計）。

## Capabilities

### New Capabilities
- `multi-item-receipts`: 規範單張收據內多個子品項（Line Items）的建立、編輯、各自分類指派、總額自動加總與圖論出入度分解計算。

### Modified Capabilities
<!-- 無既有 specs 修改 -->

## Impact

- **型別定義**：[src/types/finance.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/types/finance.ts)
- **核心運算**：[src/composables/useGraphEngine.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/composables/useGraphEngine.ts)
- **記帳抽屜**：[src/components/QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/QuickEntrySheet.vue)
- **收據卡片**：[src/components/ReceiptCard.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ReceiptCard.vue)
- **資料庫**：IndexedDB 自動向下相容既有單筆收據。
