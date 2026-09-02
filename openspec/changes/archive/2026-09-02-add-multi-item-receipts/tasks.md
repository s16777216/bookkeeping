## 1. 資料模型與核心狀態

- [x] 1.1 在 [src/types/finance.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/types/finance.ts) 中定義 `ReceiptItem` 介面（`id`, `name`, `amount`, `quantity?`），並在 `FinanceEdge` 擴充 `items?: ReceiptItem[]`
- [x] 1.2 在 [src/composables/useGraphEngine.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/composables/useGraphEngine.ts) 中更新 `createEdge` 與 `updateEdge` 支援接收與儲存 `items`

## 2. 記帳面板多品項明細與計算機整合

- [x] 2.1 在 [src/components/sheets/QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/sheets/QuickEntrySheet.vue) 中實作「單筆 / 多品項明細」切換按鈕
- [x] 2.2 在 [src/components/sheets/QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/sheets/QuickEntrySheet.vue) 中實作品項動態列表（新增/刪除品項、品名與數量輸入）
- [x] 2.3 整合計算機鍵盤（點選品項金額時綁定下方 CalculatorKeypad，按 `=` 結算該項金額並自動即時加總總額）
- [x] 2.4 實作多品項模式送出防呆校驗（各品項名稱非空、金額大於 0）

## 3. 收據卡片展示與擬真小票展開

- [x] 3.1 在 [src/components/ledger/ReceiptCard.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ledger/ReceiptCard.vue) 中支援品項數量徽章（例如：📦 3 個品項）
- [x] 3.2 在 [src/components/ledger/ReceiptCard.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ledger/ReceiptCard.vue) 實作小票展開/收合折疊區塊，條列品名、數量與金額明細

## 4. 驗證與測試

- [x] 4.1 執行 `npm run build` 確認 TypeScript 型別與打包正確無誤
- [x] 4.2 測試單筆多品項建立、品項增刪、計算機連動加總與收據小票展開展示
