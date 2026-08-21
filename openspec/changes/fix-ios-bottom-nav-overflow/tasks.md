## 1. 底部導航欄 Safe Area 樣式重構

- [ ] 1.1 修改 [BottomNavBar.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/BottomNavBar.vue) 中的 `.bottom-nav-bar` 高度為 `calc(64px + env(safe-area-inset-bottom, 0px))` 並支援相容性語法
- [ ] 1.2 調整 `.bottom-nav-bar` 的對齊為 `align-items: flex-start` 並加上適當的頂部 padding (`padding-top: 8px`)，避免文字被壓扁
- [ ] 1.3 調整 FAB 加號按鈕 (`.nav-fab-wrapper`) 與 `.nav-item` 的間距與垂直置中表現

## 2. 全域視口與滾動容器適配

- [ ] 2.1 修改 [src/styles/main.css](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/styles/main.css) 中的 `.app-container`，將 `min-height: 100vh` 升級為 `min-height: 100dvh`
- [ ] 2.2 同步更新 `.app-container` 的 `padding-bottom` 為 `calc(64px + env(safe-area-inset-bottom, 0px) + 20px)`，確保列表滾動到底部時不被遮擋

## 3. 建置與多端佈局驗證

- [ ] 3.1 執行專案編譯檢查 (`npm run build`)，確保 TypeScript 與 Vite 建置成功
- [ ] 3.2 驗證無安全區（桌面端）與有安全區（iOS 模擬）下的導航欄顯示與文字佈局
