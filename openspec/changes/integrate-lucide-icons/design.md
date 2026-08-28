## Context

參見 `proposal.md`。目前各元件大量使用硬編碼之 Emoji 字串（如 🧾、🏦、💼 等），導致不同平台上的視覺樣式、大小與顏色難以統一。透過引入 `lucide-vue-next`，將所有靜態 UI 控制圖示與動態節點圖示統一為 SVG 向量線條風格。

## Goals / Non-Goals

**Goals:**
- 導入 `lucide-vue-next` 套件，完全取代主要 UI 控制項的 Emoji。
- 建立 `<NodeIcon :name="iconName" :size="size" />` 共用元件，動態支援常用財務與日常分類圖示，並相容舊有 Emoji。
- 升級 `seeds.ts` 預設節點的 icon 識別碼。
- 在 `NodesView.vue` 提供視覺化圖示挑選網格，提升建立帳戶與分類節點時的體驗。

**Non-Goals:**
- 不引入龐大的全量圖示動態載入解析器（避免將數千個 Lucide 圖示全部打包），改以定義「財務/生活常用圖示清單（約 20~30 個）」進行顯式註冊或對照。

## Decisions

### 1. 動態圖示映射機制 (`NodeIcon.vue`)
- **決策內容**：
  建立常用圖示字典對照表（例如 `landmark: Landmark`, `wallet: Wallet`, `credit-card: CreditCard`, `utensils: Utensils`, `bus: Bus`, `shopping-bag: ShoppingBag`, `coffee: Coffee`, `home: Home`, `briefcase: Briefcase`, `trending-up: TrendingUp` 等）。
- **向下相容**：
  如果傳入的 `name` 在對照表中找不到，且判定為單一文字/Emoji，則直接渲染 `<span>{{ name }}</span>`，若完全為空則使用預設圖示 `Tag`。

### 2. 靜態 UI 圖示直接引用
- 在各個 Vue 單一元件中（如 `BottomNavBar.vue`, `HeaderBar.vue`, `QuickEntrySheet.vue`, `ReceiptCard.vue`），直接具名導入所需的 Lucide 圖示元件（例如 `import { Receipt, Network, Plus, WalletCards } from 'lucide-vue-next'`），充分發揮 Vite / Rollup 的 Tree-shaking 優勢。

### 3. 圖示挑選盤設計
- 在 `NodesView.vue` 中將原先的單行文字輸入框改為預設圖示網格，使用者點擊即可選中，並即時預覽。

## Risks / Trade-offs

- **[Risk] 舊資料庫已有存檔的 Emoji 節點** → Mitigation: `NodeIcon.vue` 提供 fallback 機制，舊資料不會出現破圖或空白。
- **[Risk] 打包體積膨脹** → Mitigation: 使用具名導入（Named imports）與字典映射，僅打包實際使用的幾十個圖示元件。
