## 1. 元件封裝與重構

- [x] 1.1 建立 `src/components/NodeFormSheet.vue` 通用抽屜元件，支援新增與編輯雙模式、水平並排圖示/名稱佈局與表單驗證
- [x] 1.2 重構 `src/components/NodesView.vue`，移除內嵌 `.panel` 表單，全面改以呼叫 `NodeFormSheet` 處理新增與編輯
- [x] 1.3 移除舊元件 `src/components/EditNodeSheet.vue`

## 2. 驗證與測試

- [x] 2.1 執行建置驗證（`npm run build`），確認 TypeScript 型別檢查通過、抽屜操作流暢且無回退問題
