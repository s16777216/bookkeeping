## Why

目前 PWA 在 iOS Safari「加入主畫面」後點擊開啟時，由於缺乏專屬的 `apple-touch-startup-image` 配置，會出現約 0.5~1.5 秒的死白或黑屏空白等待期，嚴重破壞了極簡收據風格的原生感與沉浸體驗。

透過導入 `@vite-pwa/assets-generator` 自動化工具鏈，本變更將為專案建構專屬的 PWA 開屏畫面（Splash Screens），以極簡紙本收據圖示置中、採用純淨紙本底色 (`#FBFBFA`)，並精確適配包含使用者主力機 **iPhone 13 mini** 在內的主流 iPhone 機型，達成媲美原生 Native App 的秒開手感。

## What Changes

- **導入 PWA 資源自動產生器**：在開發依賴中引入 `@vite-pwa/assets-generator`，並配置 `pwa-assets.config.ts`。
- **精簡手機開屏圖示生成策略**：
  - 以現有 `public/icon.png` 為核心向量來源，搭配 `#FBFBFA` 極簡紙本底色，採用純圖示置中排版。
  - 鎖定主流 iPhone 尺寸（涵蓋 iPhone 13 mini、12/13/14、14 Pro/15/16、Pro Max 等），產出符合 Apple WebKit 規格之 Startup Images。
- **HTML 標籤注入與路徑適配**：
  - 在 `index.html` 中注入各機型精準之 `<link rel="apple-touch-startup-image">` Media Query 標籤。
  - 正確適配 GitHub Pages 子路徑 `/bookkeeping/`。
- **Service Worker 預快取納入**：
  - 確保生成的 Splash Screen 圖片納入 Workbox 快取清單，實現 100% 離線秒開。

## Capabilities

### New Capabilities
- `pwa-splash-screens`: 規範 iOS 與 Android PWA 自動化開屏畫面生成、精準螢幕解析度匹配（含 iPhone 13 mini）、極簡紙本單一配色與離線快取支援。

### Modified Capabilities
<!-- 無既有 specs 修改 -->

## Impact

- **依賴與工具**：新增開發依賴 `@vite-pwa/assets-generator`，新增 `pwa-assets.config.ts`。
- **靜態資源**：在 `public/` 目錄下生成各 iPhone 尺寸之深淺色開屏圖片（約 14 張）與各尺寸 icon。
- **入口頁面**：更新 `index.html` 注入 `apple-touch-startup-image` 標籤群。
- **打包配置**：更新 `package.json` 加入 `generate-pwa-assets` 腳本，更新 `vite.config.ts` Workbox 快取匹配。
