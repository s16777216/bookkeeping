## Why

目前專案中的「新增收據抽屜 (`QuickEntrySheet`)」與「編輯節點抽屜 (`EditNodeSheet`)」分別由不同階段實作，導致在遮罩毛玻璃（blur）、頂部拖曳把手與標題結構、圓角陰影、手勢拖曳關閉門檻以及底層 Stacking Context 的穿透上存在體驗與程式碼的割裂。

透過將成熟的 `EditNodeSheet` 手勢與外殼標準沉澱為通用的 **`BaseSheet.vue`** 基底元件，我們將統一全站底部抽屜的視覺語言與互動手感，並大幅降低後續開發新抽屜（如收據明細、設定選單）時的維護成本。

## What Changes

- **建立通用基底抽屜元件 `BaseSheet.vue`**：
  - 封裝 `<Teleport to="body">`，保證 100% 覆蓋底部導覽列與突破父容器層疊上下文。
  - 內建 `size` 屬性（支援 `'sm'`、`'md'`、`'lg'`、`'auto'` 四種彈性高度規格）。
  - 整合頂部把手與標題拖曳感應熱區，支援下拉超過 120px 自動觸發關閉與平滑回彈。
  - 統一毛玻璃遮罩（`backdrop-filter: blur(2px)`）、20px 圓角與深邃陰影質感。
  - 提供 `#title`、`#default`（可滾動內容）與 `#footer`（固定操作列）插槽。
- **重構 `EditNodeSheet.vue`**：改為基於 `BaseSheet` 實作（使用 `size="md"`），移除重複的遮罩與拖曳手勢程式碼。
- **重構 `QuickEntrySheet.vue`**：改為基於 `BaseSheet` 實作（使用 `size="lg"`），將頂部把手、遮罩、手勢關閉全面升級為標準體驗，內部保留完整的 iOS 小算盤與記帳表單。

## Capabilities

### New Capabilities
- `base-sheet`: 規範專案通用底部滑出抽屜（Bottom Sheet）之標準外殼、手勢拖曳關閉、Teleport 根節點掛載、大中小尺寸規格與插槽架構。

### Modified Capabilities
<!-- 無既有 specs 修改 -->

## Impact

- **新增元件**：`src/components/BaseSheet.vue`。
- **重構元件**：`src/components/EditNodeSheet.vue`、`src/components/QuickEntrySheet.vue`。
- **使用者體驗**：全站所有抽屜操作（新增收據、編輯節點）獲得 100% 一致的原生毛玻璃、圓角與手勢回彈體驗。
