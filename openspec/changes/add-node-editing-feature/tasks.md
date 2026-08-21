## 1. 節點編輯 UI 與資料對接

- [ ] 1.1 在 [src/App.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/App.vue) 中將 `updateNode` 傳遞給 `NodesView` 組件
- [ ] 1.2 在 [src/components/NodesView.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/NodesView.vue) 中加入 `editingNode` 狀態，並在點擊節點卡片時選取該節點
- [ ] 1.3 在 [src/components/NodesView.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/NodesView.vue) 中實作「編輯節點底部抽屜（Edit Node Sheet）」，包含名稱、Emoji、類型編輯表單與儲存/刪除邏輯
- [ ] 1.4 為編輯抽屜加入純滑動過渡動畫、下拉手勢收起（Swipe to Dismiss）、`Escape` 鍵關閉與 Body Scroll Lock

## 2. 驗證與建置測試

- [ ] 2.1 執行 `npm run build` 確認 TypeScript 與 Vite 打包無錯誤
- [ ] 2.2 驗證節點編輯後的資料即時響應、圖譜連動與抽屜手勢關閉表現
