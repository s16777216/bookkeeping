## 1. 介面與狀態實作

- [x] 1.1 在 `QuickEntrySheet.vue` 中新增日期時間狀態、生命週期重設邏輯（每次開啟重設為當前時刻）與本地時區 ISO 格式化工具函式
- [x] 1.2 在抽屜表單中（金額鍵盤下方、備註上方）新增「4. 交易時間」欄位，包含快捷按鍵（⚡ 現在、昨天、前天）與 `datetime-local` 輸入框樣式
- [x] 1.3 實作快捷按鍵與日曆挑選器的雙向高亮連動（平移天數保留時分、手動挑選日期反向比對高亮）
- [x] 1.4 調整 `QuickEntrySheet.vue` 的 `handleSubmit` 邏輯，解析自訂日期時間（支援未來與過去時間）並轉為 Unix 毫秒時間戳記（`timestamp`），含 `isNaN` 防呆 fallback

## 2. 應用層整合與驗證

- [x] 2.1 更新 `App.vue` 的 `handleEntrySubmit`，確保接收 `timestamp` 並傳遞給 `useGraphEngine` 的 `createEdge`
- [x] 2.2 執行驗證：確認預設時間、快捷鍵切換、自訂時分、未來日期、抽屜重新開啟重設，皆能正確建立收據並在首頁清單維持時間倒序排列
