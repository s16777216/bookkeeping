## Context

先前的實作在 [ReceiptCard.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ledger/ReceiptCard.vue) 中內嵌了向下展開的明細折疊區以及標記完成/刪除按鈕。經過 `/opsx-grill` 探討，決定將收據卡片精簡為純狀態檢視，並將點擊行為統一導向通用編輯抽屜 **`ReceiptFormSheet.vue`**。

## Goals / Non-Goals

**Goals:**
- 將 `QuickEntrySheet.vue` 正式重命名並升級為 `ReceiptFormSheet.vue`，統一管理新增與編輯兩種模式。
- `ReceiptFormSheet.vue` 支援接收 `initialEdge`，自動預填來源、去向、金額/品項清單、備忘、標籤與已執行開關。
- 編輯模式下在抽屜 footer 左側提供「🗑️ 刪除收據」按鈕（附帶 `window.confirm` 確認對話框）。
- 底部送出按鈕統一文字為「儲存」。
- [ReceiptCard.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ledger/ReceiptCard.vue) 移除所有按鈕樣式與向下展開邏輯，改為整張一體化可點擊卡片（hover/active 效果），右下角保留純文字狀態徽章。

**Non-Goals:**
- 不變更圖論引擎底層資料儲存結構（仍使用既有的 `createEdge`, `updateEdge`, `softDeleteEdge`）。

## Decisions

1. **元件命名與架構統一（ReceiptFormSheet）**
   - **決定**：升級重命名為 `ReceiptFormSheet.vue`，與 `NodeFormSheet.vue` 保持相同架構哲學。
   - **原因**：單一職責、邏輯集中且消除「新增與編輯分開」的維護負擔。

2. **表單預填與狀態管理**
   - **決定**：
     - 若 `initialEdge` 存在且包含 `items`（長度 > 0），自動進入多品項明細模式並預填商品陣列，將計算機對準第 1 個品項。
     - 若 `initialEdge` 存在但無 `items`，進入單筆模式並預填總額。
     - 「☑ 已執行」開關直接連動表單狀態，點擊「儲存」時一併更新至資料庫。

3. **抽屜內刪除與防呆操作**
   - **決定**：在 `ReceiptFormSheet` 的 footer 左側設置紅色危險按鈕「刪除收據」，點擊時觸發二次確認防呆；確認後 emit `delete` 事件並關閉抽屜。

4. **卡片純檢視與手勢優化**
   - **決定**：[ReceiptCard.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ledger/ReceiptCard.vue) 游標設為 pointer，加入 hover 浮起與點擊微縮放反饋，移除內部按鈕與折疊展開。

## Risks / Trade-offs

- **[元件引入路徑變更]** → 從 `QuickEntrySheet.vue` 改名為 `ReceiptFormSheet.vue`，需同步更新 [src/App.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/App.vue) 等引入處。
