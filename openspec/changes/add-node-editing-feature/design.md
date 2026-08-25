# Design: Add Node Editing Bottom Sheet

## Overview

本設計旨在為「帳戶與對象管理（NodesView）」引入一致的底層互動體驗。將現有的陽春行內（Inline）編輯升級為**底部抽屜（Bottom Sheet）**介面，支援修改節點名稱、Emoji 圖標、資金主權類型（`me` / `external`），並提供安全的軟刪除（Archive / Soft Delete）機制，確保圖論引擎的歷史收據（Edges）外鍵完整性。

---

## Architecture & Data Flow

```
                     ┌──────────────────────────┐
                     │       NodesView.vue      │
                     └─────────────┬────────────┘
                                   │ (Click Node Card)
                                   ▼
                     ┌──────────────────────────┐
                     │    EditNodeSheet.vue     │
                     │  • Name Input            │
                     │  • Emoji Picker          │
                     │  • Owner Switch (me/ext) │
                     │  • Archive / Save        │
                     └─────────────┬────────────┘
                                   │
                                   ▼
                     ┌──────────────────────────┐
                     │     useGraphEngine       │
                     │  • updateNode()          │
                     │  • archiveNode()         │
                     └─────────────┬────────────┘
                                   │
                                   ▼
                     ┌──────────────────────────┐
                     │      IndexedDB (Dexie)   │
                     └──────────────────────────┘
```

---

## Key Components & Interactions

### 1. Edit Node Bottom Sheet (`EditNodeSheet.vue`)
- **觸發方式**：點擊 `NodesView` 中的任一節點卡片 (`node-card`)。
- **手勢與互動**：
  - 支援 `Esc` 鍵關閉。
  - 支援點擊遮罩（Backdrop）關閉。
  - 支援行動端常見的下拉拖曳手勢（Swipe to Dismiss）。
  - 自動處理 Body Scroll Lock，防止背景捲動。

### 2. Form Fields & Validation
- **節點名稱 (`name`)**：必填，去前後空白後不可為空。
- **Emoji 圖標 (`icon`)**：選填，預設提供常用帳戶/對象 Emoji 快速選取。
- **資金主權 (`owner`)**：可切換 `me`（我的帳戶）與 `external`（外部對象）。
  - *注意*：切換 owner 會影響圖論總資產與收支分類計算，介面上需適度提示。

### 3. Safety & Deletion (Soft Delete)
- **封存/刪除按鈕**：點擊「刪除/封存節點」時跳出確認框。
- **底層實作**：呼叫 `archiveNode(id)`，即將資料庫中的 `is_deleted` 設為 `true`。
- **外鍵保護**：採用軟刪除而非實體刪除（Hard Delete），確保既有的 `FinanceEdge`（收據）關聯不會產生孤立指標（Orphaned Foreign Keys）。

---

## File Changes

- **New Component**: `src/components/EditNodeSheet.vue` (或整合至 `NodesView.vue` 的子元件)
- **Modified Component**: `src/components/NodesView.vue`
- **Parent Integration**: `src/App.vue` (確保 `updateNode` 與 `archiveNode` 正確傳遞)
