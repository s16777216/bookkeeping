## 1. 依賴安裝與共用元件封裝

- [x] 1.1 安裝 `lucide-vue-next` npm 依賴套件
- [x] 1.2 建立 `src/components/NodeIcon.vue` 動態圖示元件，定義 25 個常用財務生活圖示字典與 `<Tag />` 靜默 Fallback 邏輯
- [x] 1.3 建立 `src/components/IconPickerSheet.vue` 抽屜元件（基於 `BaseSheet` size="sm"，內置 5×5 圖示網格，支援 Select & Auto-Close）
- [x] 1.4 更新 `src/db/seeds.ts` 預設示範節點的 `icon` 欄位為 Lucide 圖示名稱

## 2. 系統 UI 圖示與節點管理升級

- [x] 2.1 替換 `BottomNavBar.vue`、`HeaderBar.vue` 與 `ReceiptCard.vue` 內的 Emoji 為 Lucide 向量圖示
- [x] 2.2 替換 `QuickEntrySheet.vue`、`QuickNodeBar.vue` 與 `GraphView.vue`（含裝飾標題）內的 Emoji 與節點圖示渲染為 `NodeIcon`
- [x] 2.3 在 `NodesView.vue`（新增）與 `EditNodeSheet.vue`（編輯）中導入純圖示 Avatar 觸發按鈕與 `IconPickerSheet`
- [x] 2.4 執行畫面與功能測試，確認全站視覺風格一致、無舊 Emoji 殘留且建置（`npm run build`）與型別檢查無錯誤
