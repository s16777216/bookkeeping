# Design: Add Node Editing Bottom Sheet

## Overview

本設計旨在為「帳戶與對象管理（NodesView）」引入一致的極簡手機端互動體驗。將既有的陽春行內（Inline）修改升級為獨立的**底部抽屜（`EditNodeSheet.vue`）**，支援修改節點名稱、Emoji 快速選盤、資金主權類型（`me` / `external`），並提供安全的軟刪除（Archive / Soft Delete）機制，確保圖論引擎的歷史收據（Edges）外鍵完整性。

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
                     │  • Emoji Picker (Grid)   │
                     │  • Owner Switch (me/ext) │
                     │  • Swipe-to-Dismiss      │
                     │  • Fixed Footer Actions  │
                     └─────────────┬────────────┘
                                   │ (Save / Archive)
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
  - 支援 `Escape` 鍵關閉。
  - 支援點擊遮罩（Backdrop）關閉。
  - 支援行動端下拉拖曳手勢（Swipe to Dismiss，閥值 120px）。
  - 自動處理 Body Scroll Lock，防止背景捲動。
- **佈局結構**：
  - Header（標題 + 關閉鈕 + 拖曳 Handle）
  - Scrollable Body（表單欄位 + Emoji 選盤）
  - Fixed Footer（「儲存修改」按鈕與「封存節點」次要按鈕，適配 `safe-area-inset-bottom`）

### 2. Form Fields & Emoji Picker
- **節點名稱 (`name`)**：必填，去除前後空白後不可為空。
- **Emoji 快速選盤 (`icon`)**：
  - 內建兩組快速點選 Chips/Grid：
    - **帳戶類**：🏦（銀行）、💳（信用卡）、💵（現金）、🪙（投資）、📱（行動支付）、💼（薪資）
    - **對象/分類類**：🍔（餐飲）、☕（飲品）、🛒（購物）、🏠（房租/日用）、🚗（交通）、🎮（娛樂）、🏥（醫療）
  - 支援自訂輸入其他 Emoji。
- **資金主權 (`owner`)**：可切換 `me`（我的帳戶 / 資產負債）與 `external`（外部對象 / 收入支出）。
  - 介面提供輕量文字提示，說明主權對圖論統計的影響。

### 3. Safety & Deletion (Soft Delete)
- **封存按鈕**：位於抽屜底部的次要操作區，點擊跳出確認視窗。
- **底層實作**：呼叫 `archiveNode(id)`，將資料庫中的 `is_deleted` 設為 `true`。
- **外鍵保護**：採用軟刪除而非實體刪除（Hard Delete），確保既有的 `FinanceEdge`（收據）關聯不會產生孤立指標（Orphaned Foreign Keys）。

---

## File Changes

- **New Component**: `src/components/EditNodeSheet.vue`
- **Modified Component**: `src/components/NodesView.vue`
- **Parent Integration**: `src/App.vue` (確保 `updateNode` 與 `archiveNode` 正確傳遞)
