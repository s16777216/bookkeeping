## 1. 建立 EditNodeSheet 元件與互動邏輯

- [x] 1.1 建立 [src/components/EditNodeSheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/EditNodeSheet.vue) 元件，包含名稱輸入、Emoji 快速選盤、資金主權切換（我的帳戶 / 外部對象）表單
- [x] 1.2 在 [src/components/EditNodeSheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/EditNodeSheet.vue) 實作向下滑動收起手勢（Swipe to Dismiss）、Escape 鍵監聽、點擊遮罩關閉與 Body Scroll Lock
- [x] 1.3 在 [src/components/EditNodeSheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/EditNodeSheet.vue) 加入底部固定操作列（「儲存修改」主按鈕與「封存節點」安全次要按鈕），並適配 `safe-area-inset-bottom`

## 2. NodesView 與 App.vue 資料通接與卡片清理

- [x] 2.1 修改 [src/components/NodesView.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/NodesView.vue)，移除卡片上舊的行內編輯與裸露按鈕，點擊整張卡片喚起 `EditNodeSheet`
- [x] 2.2 在 [src/App.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/App.vue) 確保 `updateNode` 與 `archiveNode` 正確傳遞給 `NodesView`

## 3. 驗證與建置測試

- [x] 3.1 執行 `npm run build` 驗證 TypeScript 型別與 Vite PWA 建置無錯誤
- [x] 3.2 驗證節點編輯後的資料即時響應、圖譜連動、Emoji 替換與抽屜手勢關閉表現
