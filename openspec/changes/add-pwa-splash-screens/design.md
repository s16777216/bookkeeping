## Context

目前專案使用 `vite-plugin-pwa` 進行離線快取配置，但針對 iOS Safari standalone 模式的啟動開屏畫面，尚未配置相應的 `apple-touch-startup-image`。

為確保包含使用者主力設備 **iPhone 13 mini** 在內的主流手機啟動無白屏，本設計規劃利用 `@vite-pwa/assets-generator` 自動化工具鏈，生成高品質且體積受控之 PWA 開屏畫面與標籤系統。

## Goals / Non-Goals

**Goals:**
- 整合 `@vite-pwa/assets-generator` 開發工具，建立可重複執行的開屏資源生成腳本。
- **精簡手機優先策略**：聚焦 iPhone 12~16 主流機型，特別涵蓋 iPhone 13 mini (1080×2340 px, 3x DPR)。
- **深淺雙模式**：淺色採用 `#FBFBFA` 紙本底色，深色採用 `#1C1C1E`，純圖示居中，維持極簡紙本風格。
- 產出之圖檔（約 14 張）納入 `public/` 與 Git 追蹤，並在 `index.html` 注入精確的 Media Query 標籤。
- 適配專案的 GitHub Pages 子路徑 `base: '/bookkeeping/'`。

**Non-Goals:**
- 不生成 iPad 全系列開屏圖（大幅節省儲存庫體積）。
- 不動態生成含文字之開屏圖，維持純圖示極簡視覺。

## Decisions

### 1. 工具鏈與設定 (`pwa-assets.config.ts`)
- **決策**：使用 `@vite-pwa/assets-generator` 的 `combinePresetAndAppleSplashScreens`，並透過自訂裝置過濾或精簡清單產出圖片。
- **理由**：相較於手動裁切圖片或老舊的 `pwa-asset-generator`，Vite PWA 官方工具鏈能完美契合 Vite 與 TypeScript 生態。
- **替代方案**：純 CSS in-app 骨架屏（無法解決 OS 啟動瞬間的白屏問題）。

### 2. 涵蓋設備清單與解析度
- **決策**：
  1. iPhone 13 mini / 12 mini：`375 × 812 pt` (1080 × 2340 px, 3x) 🌟 主力機
  2. iPhone 12 / 13 / 13 Pro / 14：`390 × 844 pt` (1170 × 2532 px, 3x)
  3. iPhone 13 Pro Max / 14 Plus：`428 × 926 pt` (1284 × 2778 px, 3x)
  4. iPhone 14 Pro / 15 / 15 Pro / 16：`393 × 852 pt` (1179 × 2556 px, 3x)
  5. iPhone 14 Pro Max / 15 Pro Max / 16 Plus：`430 × 932 pt` (1290 × 2796 px, 3x)
  6. iPhone 16 Pro：`402 × 874 pt` (1206 × 2622 px, 3x)
  7. iPhone 16 Pro Max：`440 × 956 pt` (1320 × 2868 px, 3x)
- **理由**：7 款核心解析度 $\times 2$（淺/深色）= 14 張圖片，體積控制在約 1 MB 內，效益最高。

### 3. HTML 標籤注入與路徑
- **決策**：在 `index.html` 中注入帶有 `/bookkeeping/` 前綴與完整 media 條件之 `<link rel="apple-touch-startup-image">`。

## Risks / Trade-offs

- **[Risk] 非清單內的冷門舊款設備（如 iPhone 8）開啟時仍會有一瞬白屏** → 透過在 `index.html` 的 `theme-color` 與 body 背景底色設為 `#FBFBFA` 減緩視覺落差；主流用戶已涵蓋 95% 以上。
- **[Risk] 靜態圖片增加 repo 體積** → 經由精簡策略控制在 14 張，壓縮後總大小約 1MB，影響微乎其微。
