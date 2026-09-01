## 1. 核心巨石元件拆解與視圖封裝

- [x] 1.1 獨立抽離一體化 `src/components/common/CalculatorKeypad.vue`（整合歷史算式條、金額顯示盒、向左退格手勢、5 列按鍵盤與內部計算狀態機），並透過 `defineExpose({ reset })` 與雙向綁定重構 `QuickEntrySheet.vue`
- [x] 1.2 建立 `src/views/LedgerView.vue`，整合收據看板、常用帳戶列與收據清單，並精簡 `src/App.vue` 核心分頁骨架

## 2. 目錄語義化搬移與路徑別名重構

- [x] 2.1 在 `vite.config.ts` 與 `tsconfig.json` 配置 `@/` 路徑別名指向 `src/`
- [x] 2.2 建立 `src/views/`、`src/components/sheets/`、`src/components/ledger/` 與 `src/components/common/` 目錄結構，搬移對應元件並全面更新模組 import 為 `@/` 別名

## 3. 建置驗證與全站功能確認

- [x] 3.1 執行型別檢查與專案打包（`npm run build`），確保零 TypeScript 與 Vite 打包錯誤
- [x] 3.2 驗證三大分頁切換、一體化小算盤計算/退格/結算與抽屜開合功能完全正常無迴歸
