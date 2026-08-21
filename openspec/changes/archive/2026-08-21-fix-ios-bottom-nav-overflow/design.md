## Context

在 iOS Safari 與 PWA 全螢幕模式下，底部存在系統專用的 Home Indicator 觸控區域，瀏覽器環境會提供 `env(safe-area-inset-bottom)`（典型值為 34px）。
目前 `BottomNavBar` 的 CSS 為 `height: 64px; padding-bottom: env(safe-area-inset-bottom, 0px);`，在 `box-sizing: border-box` 計算下，內容區高度被壓縮至 `30px`，使得導覽圖示與文字垂直重疊、加號按鈕 (FAB) 位置偏移。此外，`min-height: 100vh` 會在 iOS 工具列動態展開/收起時觸發頁面跳動與捲軸抖動。

## Goals / Non-Goals

**Goals:**
- 保證 `BottomNavBar` 的按鈕內容區域在任何裝置（包含具備 Safe Area Inset 的 iOS 裝置與無安全區的 Android/桌面）皆保有固定 64px 的操作與視覺高度。
- 底部導覽列的高度動態擴展為 `calc(64px + env(safe-area-inset-bottom, 0px))`，並使安全區與底色自然融合。
- 主容器使用現代 `100dvh` (Dynamic Viewport Height)，確保捲動流暢不跳動。
- 全域標準化內容容器底部的 padding，防止最底層的收據卡片或按鈕被導航欄遮蔽。

**Non-Goals:**
- 不重構導覽列的路由機制或分頁結構。
- 不更動 `QuickEntrySheet` 抽屜內部的表單邏輯，僅確保佈局不被底欄破壞。

## Decisions

1. **底欄採用動態計算高度搭配頂部對齊 (Top Alignment)**
   - **決定**：
     ```css
     .bottom-nav-bar {
       min-height: calc(64px + env(safe-area-inset-bottom, 0px));
       height: calc(64px + env(safe-area-inset-bottom, 0px));
       padding-top: 8px;
       padding-bottom: env(safe-area-inset-bottom, 0px);
       align-items: flex-start;
     }
     ```
   - **替代方案**：使用 `height: auto` 搭配 padding。但 `calc()` 可以提供精準的 64px 核心高度控制，讓 FAB 懸浮加號定位更加穩定可靠。

2. **採用 100dvh 替換 100vh**
   - **決定**：在 `main.css` 中將 `.app-container` 的 `min-height: 100vh` 升級為 `min-height: 100dvh`（並提供 `100vh` 作為向下相容 fallback）。
   - **原因**：解決 Safari 網址列縮放造成的畫面重排與高度跳動。

3. **容器底部留白與底欄同步**
   - **決定**：`.app-container` 的 `padding-bottom` 設為 `calc(64px + env(safe-area-inset-bottom, 0px) + 20px)`，確保列表最後一項能完整滾動顯示於底欄之上。

## Risks / Trade-offs

- **[舊版 WebKit 相容性]** → 保留 `constant(safe-area-inset-bottom)` 或預設 `0px` fallback。
- **[桌面版居中對齊]** → 在無 safe area 的環境下，`env()` 為 `0px`，高度維持 `64px`，透過 `padding-top: 8px` 保持視覺水平居中。
