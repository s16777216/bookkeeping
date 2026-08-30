## Context

目前各元件大量使用硬編碼之彩色 Emoji（如 🧾、🏦、💼 等），導致不同平台上的視覺樣式、大小與顏色難以統一。透過引入 `lucide-vue-next`，將所有靜態 UI 控制圖示、頁面裝飾標題與動態節點圖示統一為 Paperless Minimalist 極簡黑白向量線條風格。

## Goals / Non-Goals

**Goals:**
- 導入 `lucide-vue-next` 套件，完全取代全站 UI 控制項、頁面標題與動態節點的 Emoji。
- 建立 `<NodeIcon :name="iconName" :size="size" :stroke-width="strokeWidth" />` 共用元件，集中管理 25 個精選財務與生活圖示。
- 建立 `<IconPickerSheet :isOpen="isOpen" :modelValue="icon" @update:modelValue="..." @close="..." />` 獨立抽屜元件。
- 升級 `seeds.ts` 預設節點的 icon 識別碼。
- 在 `NodesView.vue` 與 `EditNodeSheet.vue` 中提供極簡純圖示 Avatar 觸發器與流暢的抽屜式挑選體驗。

**Non-Goals:**
- **不相容 Emoji**：不支援舊版 Emoji 渲染或混用，未知名稱一律退回預設 `<Tag />`。
- 不進行全量動態圖示動態載入，嚴格限制在 25 個精選圖示內，確保打包體積與 Tree-shaking 最佳化。
- 不寫一次性資料庫遷移腳本（採用靜默 Fallback 策略）。

## Decisions

### 1. 精選 25 個常用圖示清單（5×5 網格）
定義常用圖示字典對照表（`ICONS`）：
- **金融帳戶**：`landmark` (銀行), `wallet` (現金), `credit-card` (信用卡), `coins` (零錢/投資), `banknote` (紙鈔/薪資), `piggy-bank` (儲蓄/備用金)
- **飲食與購物**：`utensils` (餐飲), `coffee` (飲品), `shopping-bag` (購物), `shopping-cart` (超市採買), `apple` (生鮮食材)
- **交通與出行**：`bus` (公車), `car` (汽車), `train` (捷運/火車), `fuel` (加油), `plane` (旅遊/機票)
- **居家與生活**：`home` (房租), `zap` (水電瓦斯), `smartphone` (電信/通訊), `heart-pulse` (醫療/健保), `gift` (送禮/社交)
- **工作與休閒**：`briefcase` (工作/公司), `graduation-cap` (進修), `gamepad-2` (娛樂/遊戲), `tag` (預設標籤)

### 2. 動態圖示元件與 Silent Fallback 機制 (`NodeIcon.vue`)
- `<NodeIcon>` 內部維護上述字典。
- 若傳入的 `name` 命中字典，則渲染對應 Lucide 元件；若查無對應圖示（或為舊 Emoji），直接退回渲染 `<Tag />`，不拋出錯誤。
- 預設樣式：`stroke-width` 設為 1.75 或 2，顏色綁定 `currentColor`。

### 3. 圖示挑選抽屜 (`IconPickerSheet.vue`)
- 底層使用 `<BaseSheet :isOpen="isOpen" size="sm" title="選擇節點圖示" @close="...">`。
- 內部佈局 5×5 向量圖示網格按鈕，選中項目呈現高亮背景（`--text-primary` 反白或加深框線）。
- **互動原則**：使用者點擊任一圖示方格後，立即觸發 `update:modelValue` 並呼叫 `close()`（Select & Auto-Close），極致流暢。

### 4. 觸發按鈕形式 (Icon-only Trigger)
- 在 `NodesView.vue`（新增表單）與 `EditNodeSheet.vue`（編輯抽屜）中，以一個純圖示方塊（如 42×42px 圓角按鈕）作為觸發器，點擊後喚起 `IconPickerSheet`。

### 5. 靜態 UI 與標題圖示替換
- 在各個 Vue 單一元件中（如 `BottomNavBar.vue`, `HeaderBar.vue`, `QuickEntrySheet.vue`, `ReceiptCard.vue`, `NodesView.vue`, `GraphView.vue`），直接具名導入所需的 Lucide 圖示元件（例如 `import { Receipt, Network, Plus, WalletCards, Trash2, RotateCcw, X, ArrowRight, Briefcase } from 'lucide-vue-next'`）。

## Risks / Trade-offs

- **[Trade-off] 舊資料庫已有存檔的 Emoji 節點** → Mitigation: 採用 Silent Fallback，舊節點將統一顯示為 `<Tag />` 圖示，使用者日後點進編輯時即可點選換成新版向量圖示，無需撰寫複雜的資料庫 Migration 邏輯。
- **[Benefit] 打包體積最小化** → 僅打包約 30 個實際使用的圖示元件，Vite / Rollup 能進行最佳 Tree-shaking。
