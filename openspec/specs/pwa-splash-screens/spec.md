## Purpose

為 PWA 獨立視窗（Standalone）應用提供跨平台開屏畫面（Splash Screens）自動化生成、iOS 精準螢幕解析度適配（含 iPhone 13 mini）與極簡紙本單一米白色調一致性。

## Requirements

### Requirement: iOS 精準解析度開屏畫面適配
系統 SHALL 依據 Apple WebKit 規範，提供符合 iPhone 物理像素解析度與設備像素比（DPR）之靜態開屏畫面，消除點擊桌面圖示啟動時的白屏或黑屏等待。

#### Scenario: iPhone 13 mini 點擊啟動 PWA
- **WHEN** 使用者在 iPhone 13 mini (1080×2340 px, 3x DPR) 上從主畫面點擊 PWA 圖示
- **THEN** 系統立即渲染吻合 375×812 pt 與 3x DPR 之專屬開屏圖，無白屏閃爍，圖示居中呈現

#### Scenario: 其他主流 iPhone 機型適配
- **WHEN** 使用者在 iPhone 12/13/14/15/16 等主流機型上啟動 PWA
- **THEN** 系統依據各機型之媒體查詢（Media Query）載入吻合解析度之專屬開屏圖

### Requirement: 極簡紙本收據配色一致性
開屏畫面 SHALL 與專案整體之極簡紙本收據主題色 `#F3F0DF` 保持一致，採用純圖示居中呈現，維持風格高度純粹。

#### Scenario: 啟動 PWA 呈現紙本開屏圖
- **WHEN** 使用者從手機主畫面點擊圖示啟動 PWA
- **THEN** 開屏畫面背景採用 `#F3F0DF` 底色，中心展示收據圖示，過渡無縫進入主畫面

### Requirement: 離線開屏支援與路徑適配
所有開屏畫面資源 SHALL 納入 Service Worker 快取，並正確相容子路徑部署。

#### Scenario: 飛航或離線狀態啟動
- **WHEN** 使用者在無網路狀態下點擊桌面圖示啟動 PWA
- **THEN** 開屏畫面自本地 Service Worker 快取立即載入，開屏流程不中斷
