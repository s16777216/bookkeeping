## 1. 手勢與快捷鍵關閉實作

- [x] 1.1 在 [QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/QuickEntrySheet.vue) 中新增 Touch 手勢監聽（`touchstart`, `touchmove`, `touchend`）與即時下拉位移/回彈邏輯
- [x] 1.2 在 [QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/QuickEntrySheet.vue) 中新增全域 `keydown` 事件監聽，支援 `Escape` 鍵關閉面板
- [x] 1.3 確保在組件銷毀與面板關閉時正確移除鍵盤與 Touch 監聽器

## 2. 驗證與建置測試

- [x] 2.1 執行 `npm run build` 確認 TypeScript 與打包無錯誤
- [x] 2.2 驗證電腦端按 `Esc` 鍵關閉，以及行動端下拉拖曳關閉與未達閥值回彈表現
