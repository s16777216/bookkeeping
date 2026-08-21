## 1. 資料模型與核心運算引擎升級

- [ ] 1.1 在 [src/types/finance.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/types/finance.ts) 中新增 `ReceiptItem` 介面，並擴充 `FinanceEdge` 支援 `items?: ReceiptItem[]`
- [ ] 1.2 在 [src/composables/useGraphEngine.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/composables/useGraphEngine.ts) 中升級 `refreshData` 運算演算法，支援多品項子項目的各別入度累加與分類統計
- [ ] 1.3 在 [src/composables/useGraphEngine.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/composables/useGraphEngine.ts) 中更新 `createEdge` 支援接收 `items` 參數

## 2. 記帳面板多品項明細介面實作

- [ ] 2.1 在 [src/components/QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/QuickEntrySheet.vue) 中加入「快速單筆 / 多品項明細」模式切換開關
- [ ] 2.2 在 [src/components/QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/QuickEntrySheet.vue) 中實作多品項動態列表，支援新增品項、刪除品項、設定品名、金額與目標分類
- [ ] 2.3 實作多品項金額自動加總與送出防呆校驗

## 3. 收據卡片展示與多品項展開

- [ ] 3.1 在 [src/components/ReceiptCard.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ReceiptCard.vue) 中支援多品項清單展示、品項數量徽章與明細展開/收合互動

## 4. 驗證與建置測試

- [ ] 4.1 執行 `npm run build` 確認 TypeScript 型別與打包通過
- [ ] 4.2 測試單筆多品項記帳流程，驗證圖論分析中各分類支出統計的精確性
