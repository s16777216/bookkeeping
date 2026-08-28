## 1. 依賴安裝與共用元件封裝

- [ ] 1.1 安裝 `lucide-vue-next` npm 依賴套件
- [ ] 1.2 建立 `src/components/NodeIcon.vue` 動態圖示元件，定義常用財務圖示映射字典與 Emoji 向下相容邏輯
- [ ] 1.3 更新 `src/db/seeds.ts` 預設示範節點的 `icon` 欄位為 Lucide 圖示名稱

## 2. 系統 UI 圖示與節點管理升級

- [ ] 2.1 替換 `BottomNavBar.vue`、`HeaderBar.vue` 與 `ReceiptCard.vue` 內的 Emoji 為 Lucide 圖示
- [ ] 2.2 替換 `QuickEntrySheet.vue`、`QuickNodeBar.vue` 與 `GraphView.vue` 內的 Emoji 與節點圖示渲染為 `NodeIcon`
- [ ] 2.3 在 `NodesView.vue` 中加入圖示挑選盤（Icon Grid Picker），並替換操作按鈕圖示
- [ ] 2.4 執行畫面與功能測試，確認全站視覺風格一致、舊資料相容且無 TypeScript / 建置錯誤
