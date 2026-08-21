## ADDED Requirements

### Requirement: Edit Financial Node
系統 SHALL 允許使用者編輯既有節點的屬性（包含名稱、代表 Emoji 圖示與節點類型），並在儲存後即時更新全域圖論數據與餘額看板。

#### Scenario: 點擊節點卡片開啟編輯抽屜
- **WHEN** 使用者在帳戶與分類管理頁面點擊任一節點卡片
- **THEN** 系統應從底部滑出「編輯節點」抽屜面板，並預填該節點既有的名稱、Emoji 與分類類型

#### Scenario: 成功儲存節點修改
- **WHEN** 使用者在編輯抽屜中修改名稱或類型並點擊「儲存修改」
- **THEN** 系統應更新 IndexedDB 中的節點資料，關閉編輯抽屜，並在介面上即時反映最新名稱與圖示

#### Scenario: 節點名稱為空時防呆
- **WHEN** 使用者將節點名稱清空並嘗試點擊儲存
- **THEN** 系統應顯示錯誤提示或阻止送出，不允許空名稱節點存在

### Requirement: Edit Node Sheet Dismissal
「編輯節點」抽屜面板 SHALL 支援向下滑動手勢、Escape 鍵以及點擊遮罩空白處關閉，且開啟時禁止背景頁面滾動。

#### Scenario: 按下 Escape 鍵或下拉手勢關閉
- **WHEN** 編輯節點面板處於開啟狀態，且使用者按下 Escape 鍵或向下拖曳超過閥值放開
- **THEN** 系統應順暢收起編輯面板，且不套用未儲存的變更
