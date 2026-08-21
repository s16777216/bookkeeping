## Why

目前「記一筆收據」的底部抽屜 (`QuickEntrySheet`) 僅支援點擊右上角關閉按鈕與點擊遮罩空白處關閉。在手機單手操作時，頂部關閉按鈕較遠且遮罩空白面積有限；在電腦端操作時缺少 `Escape` 鍵支援。為提供如原生 App 般流暢的互動體驗，需加入下拉拖曳手勢關閉與 `Escape` 快捷鍵支援。

## What Changes

- **Touch 下拉手勢（Swipe to Dismiss）**：在抽屜頂部手把與標題區域支援觸控拖曳，向下拖曳時面板跟隨手指即時下移，當下拉位移超過閾值（如 80px）或速度足夠時觸發關閉；未達閾值時彈性回彈復原。
- **Escape 快捷鍵關閉**：在面板開啟時監聽鍵盤事件，按下 `Esc` 鍵立即關閉面板，並在組件卸載/關閉時清理事件監聽器。

## Capabilities

### New Capabilities
- `sheet-dismiss-gestures`: 規範底部彈出面板的手勢滑動收起 (Swipe to Dismiss) 與鍵盤 Escape 快速退出行為。

### Modified Capabilities
<!-- 無既有 specs 修改 -->

## Impact

- **修改元件**：[src/components/QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/QuickEntrySheet.vue)
- **相依性**：純 Vue 3 SFC 內部實作，不需引入第三方手勢庫，輕量且效能最佳。
