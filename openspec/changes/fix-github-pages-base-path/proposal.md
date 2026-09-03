## Why

專案部署至 GitHub Pages 時，因遠端倉庫名稱為 `bookeeping`（單個 `k`），而專案配置中的靜態資源路徑設定為 `/bookkeeping/`（雙 `k`），導致 GitHub Pages 發布後所有 JS、CSS、PWA manifest、圖示與開屏圖請求皆發生 404 Not Found 錯誤。此外，瀏覽器亦提示 `<meta name="apple-mobile-web-app-capable">` 已過時的警告。

為了解決 404 資源載入失敗與控制台警告，本變更將所有路徑統一調整為符合倉庫名稱的 `/bookeeping/`，並加入現代標準 `<meta name="mobile-web-app-capable" content="yes" />`。

## What Changes

- **修正 Vite 與 PWA Base 路徑（`vite.config.ts`）**：
  - 將 `base` 由 `/bookkeeping/` 修改為 `/bookeeping/`。
  - 將 PWA manifest 中的 `start_url`、`scope`、`id` 同步調整為 `/bookeeping/`。
- **修正 HTML 資源與 Meta 標籤（`index.html`）**：
  - 將 `icon.png`、`apple-touch-icon.png` 以及所有 Apple PWA Splash Screens 開屏畫面路徑前綴由 `/bookkeeping/` 替換為 `/bookeeping/`。
  - 新增 `<meta name="mobile-web-app-capable" content="yes" />` 以消除瀏覽器過時警告。
- **修正 PWA 開屏圖配置（`pwa-assets.config.ts`）**：
  - 將 `basePath` 由 `/bookkeeping/` 修改為 `/bookeeping/`。

## Capabilities

### New Capabilities
<!-- 工具鏈與靜態資源路徑修復，不增減業務規範，由 skip_specs: true 聲明 -->

### Modified Capabilities
<!-- 無既有 specs 修改 -->

## Impact

- **Affected Files**:
  - `vite.config.ts` [MODIFY]
  - `index.html` [MODIFY]
  - `pwa-assets.config.ts` [MODIFY]
- **系統影響**:
  - 解決 GitHub Pages 上所有資源 404 錯誤，確保網站與 PWA 正常運作。
  - 本地開發（`npm run dev`）與建置（`npm run build`）完全相容。
