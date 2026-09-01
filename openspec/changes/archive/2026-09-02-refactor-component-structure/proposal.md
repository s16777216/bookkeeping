## Why

目前專案所有 13 個元件全數扁平放置於 `src/components/` 根目錄，缺乏語義分層；其中 `App.vue` 直接混合了收據分頁（Ledger）的內部排版與事件轉發，且快速記帳抽屜 `QuickEntrySheet.vue` 膨脹至超過 1000 行的巨石元件（同時包含計算機鍵盤、日期選擇、手勢與表單邏輯）。在即將導入「多品項收據明細（add-multi-item-receipts）」前夕，亟需對元件結構進行模組化重構，以大幅提升程式碼之可讀性、維護性與未來擴充能力。

## What Changes

- **封裝收據分頁視圖（`LedgerView.vue`）**：
  - 將散落於 `App.vue` 內的 `BalanceBanner`、`QuickNodeBar` 與 `ReceiptFeed` 整合封裝為獨立的 `LedgerView.vue`。
  - 精簡 `App.vue` 核心骨架至 40 行以內，形成標準清晰的三大 View 切換（`LedgerView`、`GraphView`、`NodesView`）。
- **拆解巨石元件 `QuickEntrySheet.vue`**：
  - 獨立抽離一體化 `CalculatorKeypad.vue` 元件，完整封裝歷史算式條、主金額螢幕盒、左滑退格手勢、iOS 5 列小算盤鍵盤與內部計算狀態機。
  - 將 `QuickEntrySheet.vue` 專注於表單狀態管理與記帳流程，行數縮減 60% 以上。
- **建立元件語義化目錄架構並導入全站 `@/` 路徑別名**：
  - `src/views/`：收納主分頁視圖（`LedgerView.vue`、`GraphView.vue`、`NodesView.vue`）。
  - `src/components/sheets/`：收納所有 BottomSheet 抽屜（`BaseSheet.vue`、`QuickEntrySheet.vue`、`NodeFormSheet.vue`、`IconPickerSheet.vue`）。
  - `src/components/ledger/`：收納收據與流向領域專用展示元件（`BalanceBanner.vue`、`QuickNodeBar.vue`、`ReceiptFeed.vue`、`ReceiptCard.vue`）。
  - `src/components/common/`：收納全域通用工具與基礎元件（`HeaderBar.vue`、`BottomNavBar.vue`、`NodeIcon.vue`、`CalculatorKeypad.vue`）。
  - 配置 `vite.config.ts` 與 `tsconfig.json` 的 `@/` 別名，全面淘汰跨層級相對路徑。

## Capabilities

### New Capabilities
<!-- 純架構重構，不更動行為規範，由 .openspec.yaml 的 skip_specs: true 聲明 -->

### Modified Capabilities
<!-- 無既有 specs 修改 -->

## Impact

- **受影響目錄與檔案**：
  - `vite.config.ts`、`tsconfig.json` 配置 `@/` 路徑別名
  - 全新建立 `src/views/`、`src/components/sheets/`、`src/components/ledger/`、`src/components/common/`
  - 新增 `src/views/LedgerView.vue`、`src/components/common/CalculatorKeypad.vue`
  - 移動並更新 `src/App.vue` 及各元件之模組引用為 `@/` 別名
- **相依套件與 API**：
  - 零外部相依新增（不引入 router，維持純 Vue 3 + Vite 輕量架構）
  - 全站功能與視覺完全零破壞、零行為變更（Zero behavioral regressions）
