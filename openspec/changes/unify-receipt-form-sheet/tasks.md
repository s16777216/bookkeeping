## 1. 元件重構與 ReceiptFormSheet 雙模式支援

- [ ] 1.1 將 `src/components/sheets/QuickEntrySheet.vue` 重構/重命名為 [src/components/sheets/ReceiptFormSheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/sheets/ReceiptFormSheet.vue)
- [ ] 1.2 在 `ReceiptFormSheet.vue` 中支援 `initialEdge?: FinanceEdge | null` 屬性，實作編輯模式表單預填（來源、去向、單筆金額/多品項清單、計算機對齊、備忘、標籤、已執行開關）
- [ ] 1.3 在 `ReceiptFormSheet.vue` 中實作動態標題（新增 vs 編輯）與 footer 左側「🗑️ 刪除收據」按鈕（含二次確認防呆）
- [ ] 1.4 在 `ReceiptFormSheet.vue` 中將底部按鈕文字統一為「儲存」，並處理新增、編輯與刪除的 emit 事件

## 2. 收據卡片與清單互動改造

- [ ] 2.1 在 [src/components/ledger/ReceiptCard.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ledger/ReceiptCard.vue) 中移除操作按鈕與向下展開折疊區，右下角改為純狀態徽章，卡片支援點擊並 emit `select` 事件
- [ ] 2.2 在 [src/components/ledger/ReceiptFeed.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ledger/ReceiptFeed.vue) 與 [src/views/LedgerView.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/views/LedgerView.vue) 中傳遞 `@select-edge` 事件

## 3. 主應用層與狀態整合

- [ ] 3.1 在 [src/App.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/App.vue) 中引入 `ReceiptFormSheet`，維護 `selectedEdge` 狀態，並串接 `createEdge`、`updateEdge` 與 `softDeleteEdge`

## 4. 驗證與測試

- [ ] 4.1 執行 `npm run build` 確認 TypeScript 型別與 Vite 打包無誤
- [ ] 4.2 測試新增收據、點擊卡片開啟編輯預填、修改多品項明細與金額儲存、切換已執行狀態及抽屜內刪除收據
