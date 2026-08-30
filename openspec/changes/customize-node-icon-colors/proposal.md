## Why

目前節點圖示皆為單一預設墨黑色，在擁有多個銀行帳戶、電子票證與各類日常消費對象時，缺乏直觀的視覺層次。藉由在圖示挑選器中提供 8 款精選低飽和紙質預設色圈（Swatches），讓節點的 Lucide 向量圖示能自訂線條顏色，在維持 Paperless Minimalist 極簡黑白克制美學的前提下，大幅提升記帳流向與帳戶看板的快速辨識度。

## What Changes

- **圖示挑選器支援色彩選擇（`IconPickerSheet.vue`）**：
  - 抽屜頂部內置 8 款固定精選預設色圈（墨黑、常青森綠、深邃湛藍、陶土暖棕、暖陽磚橘、沉穩酒紅、葡萄深紫、石墨暖灰）。
  - 使用者點選色圈即時切換當前選中色，5×5 圖示網格即時以該色預覽。點選圖示後同時帶入該圖示與色彩並自動收合抽屜。
- **動態圖示元件支援自訂線條色彩（`NodeIcon.vue`）**：
  - 擴充 `color?: string` prop，以純粹的 Lucide SVG 線條顏色變化（stroke / color）呈現，不使用多餘的底色徽章。
- **節點管理表單與抽屜（`NodesView.vue` / `EditNodeSheet.vue`）**：
  - 新增與編輯節點時支援設定與儲存 `color` 欄位至本地 IndexedDB。
  - 純圖示 Avatar 觸發按鈕即時渲染當前選定的線條顏色。
- **全站節點圖示色彩聯動**：
  - 收據卡片（`ReceiptCard.vue`）：流向中的來源與目標節點圖示帶有專屬色彩。
  - 橫向帳戶列（`QuickNodeBar.vue`）與圖論結餘（`GraphView.vue`）：清單節點圖示同步呈現對應色彩。
  - 預設種子資料（`seeds.ts`）：為玉山銀行、悠遊卡、拉麵等示範節點指定預設代表色。

## Capabilities

### New Capabilities
<!-- 無新增獨立 capability -->

### Modified Capabilities
- `mobile-receipt-ui`: 節點圖示支援挑選並呈現 8 款精選預設色彩。

## Impact

- **Affected Components**:
  - `src/components/IconPickerSheet.vue`
  - `src/components/NodeIcon.vue`
  - `src/components/NodesView.vue`
  - `src/components/EditNodeSheet.vue`
  - `src/components/ReceiptCard.vue`
  - `src/components/QuickNodeBar.vue`
  - `src/components/GraphView.vue`
- **Data & Seed**:
  - `src/db/seeds.ts`: defaultNodes 加入預設 `color`。
- **Dependencies**: 無新增。
