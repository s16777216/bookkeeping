## Why

目前首頁收據卡片（ReceiptCard）包含多個分散的操作按鈕（標記完成、撤回完成、刪除）以及向下展開小票的折疊區塊，導致清單串流長度過長且互動繁雜。同時，既有的 `QuickEntrySheet` 僅支援新增收據，若使用者想修改既有收據的金額、品項、分類或備忘時缺乏編輯入口。

為了解決此問題並對標 `NodeFormSheet`（統一節點新增與編輯）的設計規範，本提案將：
1. 將收據卡片改造為純狀態檢視卡片，移除獨立操作按鈕與向下展開，整張卡片為一體化點擊熱區，點擊一律喚起編輯抽屜。
2. 將 `QuickEntrySheet.vue` 升級重構為通用 **`ReceiptFormSheet.vue`**，統一支援新增收據與編輯既有收據（包含起迄節點、單筆/多品項金額、計算機輸入、備忘、標籤、已執行開關與刪除收據）。

## What Changes

- **收據卡片互動簡化（ReceiptCard）**：
  - 在 [src/components/ledger/ReceiptCard.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ledger/ReceiptCard.vue) 中移除卡片上的獨立按鈕（標記完成、撤回完成、刪除）與向下展開明細折疊區。
  - 將右下角改為純狀態徽章展示（如「待執行」/「已完成」），整張卡片支援 hover/active 點擊效果，點擊整張卡片觸發開啟編輯抽屜。
- **通用收據抽屜元件重構（ReceiptFormSheet）**：
  - 將 `src/components/sheets/QuickEntrySheet.vue` 重命名並升級為 [src/components/sheets/ReceiptFormSheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/sheets/ReceiptFormSheet.vue)。
  - 支援 `initialEdge?: FinanceEdge | null` 屬性：
    - 若為 `null`：呈現「記一筆收據」新增模式，預設清空表單。
    - 若提供 `initialEdge`：呈現「編輯收據 (RCP-xxx)」編輯模式，自動預填起迄節點、金額、多品項清單、備忘、標籤與已執行狀態。
  - 編輯模式下在抽屜 footer 左側提供「🗑️ 刪除收據」危險操作（具備二次確認防呆），右側提供「儲存」按鈕。
  - 「☑ 已執行」開關整合至表單中，點擊「儲存」時一併提交更新。
- **視圖層連動（LedgerView & App.vue）**：
  - 在 [src/views/LedgerView.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/views/LedgerView.vue) 與 [src/components/ledger/ReceiptFeed.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ledger/ReceiptFeed.vue) 中新增 `@edit-edge` 事件。
  - 在 [src/App.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/App.vue) 中維護 `selectedEdge` 狀態，點擊卡片開啟抽屜，儲存時調用 `updateEdge`，刪除時調用 `softDeleteEdge`。

## Capabilities

### New Capabilities
- `receipt-form-sheet`: 規範通用收據表單抽屜（ReceiptFormSheet）的雙模式運作（新增與編輯）、表單預填、多品項明細管理、計算機整合、執行狀態切換與刪除防呆流程。

### Modified Capabilities
- `multi-item-receipts`: 修改多品項展示規範，由「卡片內向下展開」調整為「點擊卡片開啟通用抽屜進行檢視與編輯」。

## Impact

- **組件重命名與升級**：`src/components/sheets/QuickEntrySheet.vue` ➔ [src/components/sheets/ReceiptFormSheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/sheets/ReceiptFormSheet.vue)
- **收據卡片**：[src/components/ledger/ReceiptCard.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ledger/ReceiptCard.vue)
- **收據串流**：[src/components/ledger/ReceiptFeed.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ledger/ReceiptFeed.vue)
- **帳本視圖**：[src/views/LedgerView.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/views/LedgerView.vue)
- **主應用容器**：[src/App.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/App.vue)
- **規格文件**：[openspec/specs/multi-item-receipts/spec.md](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/openspec/specs/multi-item-receipts/spec.md)
