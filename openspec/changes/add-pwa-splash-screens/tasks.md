## 1. 工具鏈安裝與自動化設定

- [ ] 1.1 安裝 `@vite-pwa/assets-generator` 開發依賴
- [ ] 1.2 建立 `pwa-assets.config.ts` 設定檔，配置精簡手機尺寸清單（特別包含 iPhone 13 mini）、淺色 `#FBFBFA` 與深色 `#1C1C1E` 雙色調與純圖示居中
- [ ] 1.3 在 `package.json` 中配置 `generate-pwa-assets` 腳本

## 2. 靜態開屏圖片生成與快取整合

- [ ] 2.1 執行資源生成腳本，於 `public/` 目錄產生 iPhone 13 mini 及主流機型之深淺雙色 Startup Images
- [ ] 2.2 在 `index.html` 注入對應之 `<link rel="apple-touch-startup-image">` 標籤群，確保子路徑 `/bookkeeping/` 正確加載
- [ ] 2.3 檢查 `vite.config.ts` 中的 Workbox 預快取模式，確保新生成的開屏圖檔納入 Service Worker 離線快取

## 3. 建置驗證與離線測試

- [ ] 3.1 執行 `npm run build` 驗證打包通過，確認 PWA Manifest 與 Service Worker 快取清單包含所有開屏資源
- [ ] 3.2 驗證 `index.html` 之 Apple Startup Images 標籤條件語法，特別確保 iPhone 13 mini (375x812 pt, 3x DPR) 媒體查詢精確無誤
