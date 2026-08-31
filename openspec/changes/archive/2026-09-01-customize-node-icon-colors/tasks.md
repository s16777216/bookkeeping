## 1. 元件擴充與色彩挑選器升級

- [x] 1.1 擴充 `src/components/NodeIcon.vue` 支援 `color?: string` prop 並以純向量線條顏色渲染
- [x] 1.2 在 `src/components/IconPickerSheet.vue` 頂部新增 8 款固定預設色圈，支援色彩切換、5×5 網格即時預覽與雙向綁定

## 2. 節點管理與全站色彩串接

- [x] 2.1 更新 `src/components/NodeFormSheet.vue` 串接色彩挑選、Avatar 預覽與表單狀態，並於 `src/components/NodesView.vue` 確保 IndexedDB 存取一致
- [x] 2.2 在 `src/components/ReceiptCard.vue`、`src/components/QuickNodeBar.vue` 與 `src/components/GraphView.vue` 傳入並呈現節點代表色
- [x] 2.3 更新 `src/db/seeds.ts` 預設示範節點的代表色
- [x] 2.4 執行型別檢查與建置驗證（`npm run build`），確認色彩挑選與全站呈現功能完整且無錯誤
