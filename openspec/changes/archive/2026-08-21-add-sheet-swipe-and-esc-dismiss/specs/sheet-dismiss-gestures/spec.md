## ADDED Requirements

### Requirement: Swipe to Dismiss Sheet
使用者在開啟的 `QuickEntrySheet` 頂部拉桿或標題列進行向下滑動手勢時，系統 SHALL 支援即時下拉拖曳與手勢收起面板。

#### Scenario: 手指下拉超過閥值觸發收起
- **WHEN** 使用者在抽屜頂部區域按住並向下滑動超過 130px 並放開手指
- **THEN** 抽屜面板應觸發關閉事件，面板順暢向下移出視窗

#### Scenario: 手指下拉未達閥值自動回彈
- **WHEN** 使用者在抽屜頂部區域向下滑動小於 130px 後放開手指
- **THEN** 抽屜面板應平滑回彈至原本頂部開啟位置，保持開啟狀態

### Requirement: Escape Key Dismiss
當 `QuickEntrySheet` 處於開啟狀態時，系統 SHALL 監聽鍵盤 `Escape` 鍵輸入並關閉面板。

#### Scenario: 使用者按下 Escape 鍵關閉
- **WHEN** `QuickEntrySheet` 處於開啟狀態且使用者按下鍵盤 `Escape` 鍵
- **THEN** 系統應立即觸發 `close` 事件收起抽屜面板
