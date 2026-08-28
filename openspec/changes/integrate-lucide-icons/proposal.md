## Why

目前專案在導覽列、收據卡片、管理介面與節點識別上廣泛使用彩色 Emoji（如 🧾、🏦、🍜、💼、📊）。Emoji 在不同手機與桌面作業系統上的渲染風格與色彩差異極大，且容易破壞極簡黑白收據（Paperless Minimalist）的設計一致性。導入 `lucide-vue-next` 向量圖示庫能提供乾淨、精準、高度一致且可自訂尺寸與顏色的視覺語言。

## What Changes

- **安裝依賴套件**：引入 `lucide-vue-next` 圖示套件。
- **全站系統 UI 圖示替換**：
  - 底部導覽列（`BottomNavBar`）：收據帳本（`Receipt`）、圖論分析（`Network`）、記帳懸浮鈕（`Plus`）、帳戶管理（`WalletCards`）。
  - 頂部導覽列（`HeaderBar`）：重置按鈕（`RotateCcw`）。
  - 記帳抽屜（`QuickEntrySheet`）：關閉（`X`）、退格（`Delete`）、收據標題（`Receipt`）。
  - 收據卡片（`ReceiptCard`）：流向箭頭（`ArrowRight`）、刪除按鈕（`Trash2`）。
  - 帳戶管理（`NodesView`）：刪除（`Trash2`）、新增/取消（`Plus` / `X`）。
- **節點圖示動態元件與圖示庫**：
  - 封裝 `<NodeIcon :name="icon" />` 元件，支援 Lucide 圖示名稱動態渲染，並對既有 Emoji 提供向下相容。
  - 更新預設種子資料（`seeds.ts`）為 Lucide 圖示識別碼（如 `landmark`, `wallet`, `utensils`, `bus` 等）。
  - 在 `NodesView` 新增節點表單中提供精美的圖示挑選盤（Icon Grid Picker），取代手動輸入 Emoji。

## Capabilities

### New Capabilities
<!-- 無新增獨立 capability -->

### Modified Capabilities
- `mobile-receipt-ui`: 將全站 Emoji 替換為統一的 Lucide 向量圖示，並在節點管理提供圖示挑選盤。

## Impact

- **Affected Components**:
  - `src/components/BottomNavBar.vue`
  - `src/components/HeaderBar.vue`
  - `src/components/QuickEntrySheet.vue`
  - `src/components/ReceiptCard.vue`
  - `src/components/NodesView.vue`
  - `src/components/GraphView.vue`
  - `src/components/QuickNodeBar.vue`
  - `src/components/NodeIcon.vue` (新元件)
- **Data & Seed**:
  - `src/db/seeds.ts`: 預設節點 icon 替換為 Lucide 名稱。
- **Dependencies**:
  - 新增 `lucide-vue-next`。
