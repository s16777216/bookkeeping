## ADDED Requirements

### Requirement: 統一向量圖示系統 (Lucide Icons)
系統 SHALL 在整體介面使用統一風格之 Lucide 向量圖示（包含底部導覽列、操作控制按鈕、收據卡片流向標記與節點分類標籤），取代原有之彩色系統 Emoji。

#### Scenario: 底部導覽列與操作按鈕呈現向量圖示
- **GIVEN** 使用者瀏覽 App 介面
- **WHEN** 檢視底部導覽列、頂部操作列與記帳抽屜
- **THEN** 系統以 Lucide SVG 向量圖示呈現各項功能圖示（如收據、圖論、帳戶管理、刪除、重置），風格統一且清晰

#### Scenario: 動態節點圖示支援 Lucide 與向下相容
- **GIVEN** 節點圖示設定為 Lucide 圖示名稱（如 `landmark` 或 `utensils`）或舊版 Emoji
- **WHEN** 在首頁收據卡片、帳戶清單或記帳選擇列中顯示
- **THEN** 系統能動態正確渲染對應之 Lucide 向量圖示，若為舊版 Emoji 則正常容錯呈現

#### Scenario: 帳戶管理中透過圖示盤挑選節點圖示
- **GIVEN** 使用者在帳戶管理頁面開啟新增節點表單
- **WHEN** 點選圖示挑選盤中的指定圖示（如 `landmark`）
- **THEN** 該圖示被選取並作為新建立節點之代表向量圖示
