## 1. 數字算盤與即時計算引擎

- [ ] 1.1 在 [src/components/QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/QuickEntrySheet.vue) 實作算式狀態（`expression`）、即時解析邏輯與按鍵處理（`0~9`, `.`, `+`, `-`, `C`, `⌫`, `=`）
- [ ] 1.2 在 [src/components/QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/QuickEntrySheet.vue) 建立 4×4 Bento 風格數字鍵盤與算式/大字體金額顯示盒

## 2. 抽屜佈局重構與底部固定操作列

- [ ] 2.1 重構 [src/components/QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/QuickEntrySheet.vue) 的容器為 Header、Scrollable Body（`overflow-y: auto`）、Fixed Footer（`flex-shrink: 0`）三段式佈局
- [ ] 2.2 將「儲存交易 / 開立收據」按鈕移至 Fixed Footer，並加入 `env(safe-area-inset-bottom)` 安全區適配

## 3. 標籤橫向滑動與整體驗證

- [ ] 3.1 將標籤清單改為單行水平滑動（Horizontal Scroll Chips），並優化備註輸入框與已執行切換開關佈局
- [ ] 3.2 執行 `npm run build` 進行型別與 PWA 建置驗證，並測試算盤輸入、連續加減運算與滾動固定按鈕行為
