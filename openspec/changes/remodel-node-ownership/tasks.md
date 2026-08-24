## 1. 資料模型與核心圖論運算引擎重構

- [ ] 1.1 在 [src/types/finance.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/types/finance.ts) 中定義 `NodeOwner` 型別（`'me' | 'external'`），並更新 `FinanceNode` 介面
- [ ] 1.2 在 [src/composables/useGraphEngine.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/composables/useGraphEngine.ts) 中實作歷史資料相容映射，並升級 `refreshData` 運算邏輯（依主權邊界推導淨資產、收入、支出、轉帳與代墊債權）
- [ ] 1.3 在 [src/db/seeds.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/db/seeds.ts) 中更新預設種子資料為實體主權結構（我的帳戶 vs 外部商家/朋友/公司）

## 2. 帳戶與實體管理介面適配 (NodesView)

- [ ] 2.1 在 [src/components/NodesView.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/NodesView.vue) 中按「我的資產帳戶」與「外部對手/商家/他人」分區展示節點
- [ ] 2.2 在 [src/components/NodesView.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/NodesView.vue) 的新增/編輯表單中加入擁有者主權選擇

## 3. 記帳面板與收據卡片適配 (QuickEntrySheet & ReceiptCard)

- [ ] 3.1 在 [src/components/QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/QuickEntrySheet.vue) 中依「我的資金來源」與「去向對象」優化節點選擇邏輯
- [ ] 3.2 在 [src/components/ReceiptCard.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ReceiptCard.vue) 中依主權流向自動標註收入、支出或內部轉帳狀態

## 4. 驗證與建置測試

- [ ] 4.1 執行 `npm run build` 確認 TypeScript 與 Vite 打包無錯誤
- [ ] 4.2 驗證跨邊界支出、收入、內部轉帳與朋友代墊款的數值計算與資產看板平衡
