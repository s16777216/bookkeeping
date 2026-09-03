## 1. 調整專案配置與路徑

- [x] 1.1 修改 [vite.config.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/vite.config.ts) 將 `base` 及 PWA manifest 的 `start_url`、`scope`、`id` 改為 `/bookeeping/`
- [x] 1.2 修改 [index.html](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/index.html) 加入 `<meta name="mobile-web-app-capable" content="yes" />`，並將所有圖示與開屏圖前綴替換為 `/bookeeping/`
- [x] 1.3 修改 [pwa-assets.config.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/pwa-assets.config.ts) 將 `basePath` 改為 `/bookeeping/`

## 2. 驗證與建置測試

- [x] 2.1 執行 `npm run build` 確認打包成功，並檢查 `dist/index.html` 中的資源路徑已正確指向 `/bookeeping/`
