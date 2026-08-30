## Why

目前專案在導覽列、收據卡片、管理介面、頁面標題與節點識別上廣泛使用彩色 Emoji（如 🧾、🏦、🍜、💼、📊）。Emoji 在不同手機與桌面作業系統上的渲染風格與色彩差異極大，破壞極簡黑白收據（Paperless Minimalist）的設計一致性。導入 `lucide-vue-next` 向量圖示庫能提供乾淨、精準、高度一致且可自訂尺寸與線寬的視覺語言。

## What Changes

- **安裝依賴套件**：引入 `lucide-vue-next` 圖示套件。
- **全站系統 UI 與標題圖示替換**：
  - 底部導覽列（`BottomNavBar`）：收據帳本（`Receipt`）、圖論分析（`Network`）、記帳懸浮鈕（`Plus`）、帳戶管理（`WalletCards`）。
  - 頂部導覽列（`HeaderBar`）：重置按鈕（`RotateCcw`）。
  - 記帳抽屜（`QuickEntrySheet`）：關閉（`X`）、退格（`Delete`）、收據標題（`Receipt`）。
  - 收據卡片（`ReceiptCard`）：流向箭頭（`ArrowRight`）、刪除按鈕（`Trash2`）。
  - 帳戶管理（`NodesView`）：標題（`Briefcase`）、刪除（`Trash2`）、新增/取消（`Plus` / `X`）。
  - 圖論分析（`GraphView`）：標題（`Network`）。
  - 橫向滑動列（`QuickNodeBar`）：節點圖示全面改由 `NodeIcon` 渲染。
- **節點圖示動態元件（`NodeIcon.vue`）**：
  - 封裝 `<NodeIcon :name="icon" :size="size" />` 元件，動態渲染 25 個精選財務生活圖示。
  - **不相容 Emoji**：若傳入未定義名稱或舊 Emoji，靜默退回預設 `<Tag />` 圖示（Silent Fallback），無需執行資料庫遷移。
- **抽屜式圖示挑選器（`IconPickerSheet.vue`）**：
  - 基於 `BaseSheet` (size="sm") 封裝獨立的圖示挑選抽屜，展示 5×5 精巧網格。
  - **互動體驗**：點選任一圖示立即更新並自動收合抽屜（Select & Auto-Close）。
  - **觸發入口**：在 `NodesView.vue`（新增）與 `EditNodeSheet.vue`（編輯）中使用純圖示 Avatar 方塊按鈕喚起。
- **種子資料升級**：
  - 更新預設種子資料（`seeds.ts`）為 Lucide 圖示識別碼（如 `landmark`, `wallet`, `utensils`, `bus` 等）。

## Capabilities

### New Capabilities
<!-- 無新增獨立 capability -->

### Modified Capabilities
- `mobile-receipt-ui`: 將全站系統控制項、頁面標題與節點圖示替換為統一的 Lucide 向量圖示，並在節點管理提供 `IconPickerSheet` 抽屜挑選體驗。

## Impact

- **Affected Components**:
  - `src/components/BottomNavBar.vue`
  - `src/components/HeaderBar.vue`
  - `src/components/QuickEntrySheet.vue`
  - `src/components/ReceiptCard.vue`
  - `src/components/NodesView.vue`
  - `src/components/EditNodeSheet.vue`
  - `src/components/GraphView.vue`
  - `src/components/QuickNodeBar.vue`
  - `src/components/NodeIcon.vue` (新元件)
  - `src/components/IconPickerSheet.vue` (新元件)
- **Data & Seed**:
  - `src/db/seeds.ts`: 預設節點 icon 替換為 Lucide 名稱。
- **Dependencies**:
  - 新增 `lucide-vue-next`。
