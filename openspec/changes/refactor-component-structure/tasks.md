## 1. 核心巨石元件拆解與視圖封裝

- [ ] 1.1 獨立抽離 `src/components/common/CalculatorKeypad.vue`，封裝 5 列小算盤按鍵盤與震動反饋，並重構 `QuickEntrySheet.vue` 串接
- [ ] 1.2 建立 `src/views/LedgerView.vue`，整合收據看板、常用帳戶列與收據清單，並精簡 `src/App.vue` 核心分頁骨架

## 2. 目錄語義化搬移與路徑重構

- [ ] 2.1 建立 `src/views/`、`src/components/sheets/`、`src/components/ledger/` 與 `src/components/common/` 目錄結構，並搬移對應元件
- [ ] 2.2 全面更新各元件、視圖與 `src/App.vue` 之相對 import 路徑，確保模組引用完整正確

## 3. 建置驗證與全站功能確認

- [ ] 3.1 執行型別檢查與專案打包（`npm run build`），確保零 TypeScript 與 Vite 打包錯誤
- [ ] 3.2 驗證三大分頁切換、快速記帳小算盤計算與抽屜開合功能完全正常無迴歸
