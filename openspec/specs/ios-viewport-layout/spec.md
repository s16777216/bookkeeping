# ios-viewport-layout Specification

## Purpose
TBD - created by archiving change fix-ios-bottom-nav-overflow. Update Purpose after archive.
## Requirements
### Requirement: iOS Safe Area Navigation Bar Layout
系統的底部導航欄 `BottomNavBar` SHALL 動態計算 iOS 安全區底部邊距（Safe Area Inset Bottom），使按鈕與文字可視區域始終維持至少 64px 的操作高度，不得因 `safe-area-inset-bottom` 導致內容被擠壓變形或重疊。

#### Scenario: iOS 設備具備 Home Indicator 安全區時的底欄佈局
- **WHEN** 使用者在具有底部安全區邊距的 iOS Safari 或 PWA 模式開啟應用程式
- **THEN** 底部導航欄的高度應自動延展為 `64px + env(safe-area-inset-bottom)`，且導航按鈕項目與文字應垂直靠上對齊，Home Indicator 區域維持乾淨背景。

#### Scenario: 桌面端或無安全區裝置的底欄佈局
- **WHEN** 使用者在不具備安全區邊距的桌面瀏覽器或 Android 裝置開啟應用程式
- **THEN** 底部導航欄的高度應維持標準 64px，按鈕項目應正確置中顯示。

### Requirement: Viewport Height Stability
應用程式主容器 `.app-container` SHALL 使用動態視口高度 `100dvh`，避免 iOS Safari 網址列展開或收合時產生視口跳動與滾動條錯誤。

#### Scenario: iOS 滾動觸發網址列伸縮時的容器高度穩定
- **WHEN** 使用者在 iOS Safari 滾動頁面導致頂部或底部工具列縮小/展開
- **THEN** 主容器高度應平滑適應動態視口，不得產生內容溢出或多重滾動條。

### Requirement: Scrollable Content Bottom Clearance
應用程式主視圖容器底部 SHALL 保留充足的 padding 空間，確保所有列表（如收據清單）滾動至底時不被固定底欄遮擋。

#### Scenario: 收據列表滾動至最底部
- **WHEN** 使用者在收據帳本頁面滾動至清單最底端
- **THEN** 最後一張收據卡片及相關操作按鈕應完整顯示於底部導覽欄上方，且有至少 16px 的額外邊距。

