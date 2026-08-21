## Why

目前在「帳戶與分類管理（NodesView）」中，使用者只能新增與刪除節點，無法修改現有節點的名稱、代表 Emoji 圖示或節點類型（例如更正錯字、調整分類或更換圖標）。為完善節點生命週期管理並提供與記帳抽屜一致的極簡手機端操作體驗，需實作點擊節點卡片開啟底部編輯抽屜（Edit Node Sheet）的功能。

## What Changes

- **節點編輯底部抽屜（Edit Node Sheet）**：在 [NodesView.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/NodesView.vue) 中點擊任一節點卡片時，由底部滑出編輯抽屜，可修改節點名稱、Emoji 圖示、節點分類，並支援直接刪除節點。
- **支援手勢與快捷鍵退出**：編輯抽屜比照 `QuickEntrySheet` 支援下拉拖曳收起（Swipe to Dismiss）與 `Escape` 鍵關閉。
- **介面資料流通接**：在 [App.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/App.vue) 中將 `useGraphEngine` 的 `updateNode` 傳遞給 `NodesView`。

## Capabilities

### New Capabilities
- `node-management`: 規範財務圖論節點（資產、支出、收入、負債）的瀏覽、建立、欄位修改（名稱、圖示、分類）與軟刪除生命週期。

### Modified Capabilities
<!-- 無既有 specs 修改 -->

## Impact

- **修改元件**：[src/components/NodesView.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/NodesView.vue)
- **修改應用主視圖**：[src/App.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/App.vue)
- **底層相依**：呼叫 `useGraphEngine.ts` 中已實現的 `updateNode` 函式。
