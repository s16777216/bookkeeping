## Context

參見 `proposal.md`。目前資料型別 `FinanceNode` 已具備 `color?: string` 欄位，但前端 UI、`NodeIcon.vue` 與 `IconPickerSheet.vue` 尚未串接色彩選擇與渲染。

## Goals / Non-Goals

**Goals:**
- 在 `IconPickerSheet.vue` 頂部整合 8 款固定預設色圈（Swatches），即時驅動下方 5×5 圖示網格之色彩預覽。
- 點選圖示時同時確定「圖示」與「顏色」，並自動關閉抽屜。
- `<NodeIcon :name="icon" :color="color" />` 以純 Lucide 向量線條著色，不使用外圍底色徽章。
- 在 `NodesView.vue`（新增）與 `EditNodeSheet.vue`（編輯）中串接 `color` 狀態並儲存至 Dexie 本地資料庫。
- 在收據流向（`ReceiptCard.vue`）、帳戶列表（`QuickNodeBar.vue`）與圖論結餘（`GraphView.vue`）中呈現節點專屬線條顏色。
- 更新 `seeds.ts` 為預設示範節點設定代表色。

**Non-Goals:**
- 不提供任意 Hex 色碼輸入框或全光譜原生拾色盤，嚴格限制在 8 款低飽和紙質色彩內。
- 不採用彩底徽章（Tinted Badge）視覺模式，堅持 Paperless Minimalist 純線條美學。

## Decisions

### 1. 8 款精選調和紙質色彩表 (`AVAILABLE_COLORS`)
在 `IconPickerSheet.vue` 定義常數陣列：
- `#111827` (極簡墨黑 / 預設)
- `#2D6A4F` (常青森綠 / 銀行、儲蓄)
- `#1D4ED8` (深邃湛藍 / 科技、信用卡)
- `#B45309` (陶土暖棕 / 飲食、咖啡)
- `#C2410C` (暖陽磚橘 / 購物、超市)
- `#BE123C` (沉穩酒紅 / 娛樂、社交)
- `#6D28D9` (葡萄深紫 / 醫療、教育)
- `#4B5563` (石墨暖灰 / 雜項、代墊)

### 2. `IconPickerSheet.vue` 互動模式
- **Props**:
  - `isOpen: boolean`
  - `modelValue?: string` (圖示名稱，預設 'tag')
  - `color?: string` (色彩 Hex，預設 '#111827')
- **Emits**:
  - `update:modelValue`: (icon: string) => void
  - `update:color`: (color: string) => void
  - `close`: () => void
- **互動邏輯**:
  - 點選頂部色圈：僅切換內部選取之色彩，下方 5×5 圖示網格即時反映該色彩。
  - 點選下方圖示方塊：同時 emit `update:modelValue` 與 `update:color`，並觸發 `close` 自動收合。

### 3. `NodeIcon.vue` 純線條色彩渲染
- 接收 `color?: string` prop。
- 直接將 `color` 綁定至 Lucide SVG 元件或樣式 `style="{ color: props.color || 'currentColor' }"`。

## Risks / Trade-offs

- **[Trade-off] 無法自選自訂色碼** → Mitigation: 8 款調和紙質色階足以涵蓋常見資產與日常支出分類，並保障全站極簡視覺調性一致。
- **[Benefit] 資料庫零 Migration 成本** → `FinanceNode.color` 本身為 optional 欄位，未設定色彩之舊節點自動退回預設 `currentColor`。
