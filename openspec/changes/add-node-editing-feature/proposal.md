## Why

目前在「帳戶與分類管理（NodesView）」中，使用者只能新增與透過卡片上裸露的按鈕刪除/行內修改名稱，無法修改代表 Emoji 圖示或切換節點類型（例如更正錯字、調整分類或更換圖標），且卡片視覺雜亂容易誤觸封存。

為完善節點生命週期管理並提供與記帳抽屜一致的極簡手機端操作體驗，本變更將建立獨立的**節點編輯底部抽屜（`EditNodeSheet.vue`）**，支援點擊節點卡片喚起、Emoji 快速選盤、類型切換、安全封存與下拉手勢收起。

## What Changes

- **獨立節點編輯抽屜（`EditNodeSheet.vue`）**：建立獨立 Bottom Sheet 元件，包含名稱輸入、Emoji 快速選盤、資金主權切換（我的帳戶 / 外部對象）與底部固定操作列。
- **Emoji 快速選盤（Quick Emoji Picker）**：內建常用帳戶與對象分類圖示（如 🏦, 💳, 💵, 🍔, ☕, 🚗, 🛒 等），支援單手一鍵替換圖示。
- **簡化節點卡片視覺**：移除節點卡片上裸露的 `✎` 與 `封存` 按鈕，點擊整張卡片直接開啟編輯抽屜，回歸 Bento 極簡風格。
- **手勢與快捷鍵退出**：比照 `QuickEntrySheet` 支援下拉拖曳收起（Swipe to Dismiss）、`Escape` 鍵關閉與 Body Scroll Lock。
- **安全軟刪除（Soft Delete / Archive）**：在抽屜底部提供二次確認封存按鈕，保護歷史收據外鍵完整性。
- **介面資料流通接**：在 [App.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/App.vue) 中確保 `updateNode` 與 `archiveNode` 正確傳遞給 `NodesView`。

## Capabilities

### New Capabilities
- `node-management`: 規範財務圖論節點（資產、支出、收入、負債）的瀏覽、建立、欄位修改（名稱、圖示、分類）、Emoji 選盤與軟刪除生命週期。

### Modified Capabilities

## Impact

- **新增元件**：[src/components/EditNodeSheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/EditNodeSheet.vue)
- **修改元件**：[src/components/NodesView.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/NodesView.vue)
- **修改主視圖**：[src/App.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/App.vue)
- **底層相依**：呼叫 `useGraphEngine.ts` 中已實現的 `updateNode` 與 `archiveNode` 函式。
