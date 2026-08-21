## ADDED Requirements

### Requirement: Multi-Item Line Entry
系統 SHALL 允許使用者在記帳面板中為單張收據建立多筆品項明細（Line Items），每一項目可獨立指定品名、金額與支出/去向分類。

#### Scenario: 成功建立多品項收據
- **WHEN** 使用者在記帳面板切換為多品項模式，新增 2 個以上品項（例如：鮮奶 $90 ➔ 餐飲、抹布 $40 ➔ 日用品）並送出
- **THEN** 系統應自動計算總額為 NT$ 130，建立包含品項清單的收據資料並儲存至 IndexedDB

#### Scenario: 品項金額自動同步總額
- **WHEN** 使用者在明細模式中修改任一品項的金額或增刪品項
- **THEN** 介面上的收據總金額應即時重新加總並反映最新合計

### Requirement: Graph Flow Multi-Branch Calculation
圖論運算引擎 SHALL 正確解析多品項收據，將總金額由出款帳戶扣除，並將各子品項金額個別分配至各自指定的目標節點入度中。

#### Scenario: 多品項分類支出統計精確度
- **WHEN** 存在一筆由信用卡支付、包含餐飲 ($100) 與交通 ($50) 的多品項收據
- **THEN** 信用卡負債應增加 $150，圖論分析中餐飲支出應增加 $100，交通支出應增加 $50

### Requirement: Multi-Item Receipt Card Display
收據卡片清單 SHALL 清楚標示該收據為多品項明細，並提供展開/收合清單以供檢視個別品名、分類與金額。

#### Scenario: 在首頁檢視多品項收據
- **WHEN** 使用者在首頁收據帳本瀏覽包含多品項的收據卡片
- **THEN** 卡片應顯示品項總數標籤，並可展開查閱各購買品名與對應金額
