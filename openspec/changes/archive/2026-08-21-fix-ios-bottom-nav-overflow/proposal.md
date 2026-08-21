## Why

在 iOS Safari 與 PWA 模式下（具備 Home Indicator 的機型，如 iPhone X 及後續機型），固定高度 `64px` 的底部導覽列在疊加 `env(safe-area-inset-bottom)` 的 `padding-bottom` 時，會因 `box-sizing: border-box` 將內部可用高度壓縮至僅剩約 30px，導致導覽按鈕文字被壓扁、圖標重疊、懸浮加號 (FAB) 跑版。此變更旨在建立標準的安全區適配機制與動態視口高度處理。

## What Changes

- **動態安全區高度計算**：將 `BottomNavBar` 的高度調整為基礎高度（64px）加上底部安全區域邊距（`env(safe-area-inset-bottom)`），並確保對齊基準靠上以保持視覺留白。
- **iOS 視口高度穩定化**：將應用容器（`.app-container`）由 `100vh` 升級為 `100dvh`，防止 Safari 網址列/工具列收合時產生的視口跳動。
- **全域安全區變數標準化**：在全域樣式與主視圖容器中規範統一的底部留白計算，避免列表末端內容被底部導覽列遮擋。

## Capabilities

### New Capabilities
- `ios-viewport-layout`: 規範應用程式在行動裝置（特別是 iOS 平台與 PWA 環境）中的 Safe Area Inset 適配、Viewport 動態高度規範以及底部導航欄的防擠壓佈局。

### Modified Capabilities
<!-- 無既有 specs 修改 -->

## Impact

- **修改元件**：[src/components/BottomNavBar.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/BottomNavBar.vue)
- **修改樣式**：[src/styles/main.css](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/styles/main.css)
- **相依與相容性**：支援現代瀏覽器 `100dvh` 與 `env(safe-area-inset-bottom)`，並向下相容 `constant(safe-area-inset-bottom)`。
