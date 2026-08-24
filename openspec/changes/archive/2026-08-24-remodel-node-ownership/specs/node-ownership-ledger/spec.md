## ADDED Requirements

### Requirement: Node Ownership Definition
所有財務圖論節點 `FinanceNode` SHALL 具備 `owner` 屬性，值為 `me` 或 `external`。新模型 SHALL 不再將舊 `type` 作為節點的正式分類欄位。

#### Scenario: 建立主權節點
- **WHEN** 使用者在帳戶與實體管理介面建立節點
- **THEN** 系統應允許選擇「我的帳戶」或「外部對象」，並將對應 `owner` 儲存於 IndexedDB

#### Scenario: 封存被引用節點
- **WHEN** 使用者嘗試刪除仍被未封存交易引用的節點
- **THEN** 系統應封存該節點，使其不再可用於新交易，但歷史與待執行交易仍可解析及顯示

### Requirement: Executed Transaction Derivation
圖論引擎 SHALL 使用 `executed_at` 是否為空值判斷交易是否已執行。只有已執行交易 SHALL 影響總資產、收入、支出與我的帳戶結餘。

#### Scenario: 已執行跨邊界支出
- **WHEN** 一筆具有 `executed_at` 的交易由 `owner: 'me'` 節點流向 `owner: 'external'` 節點
- **THEN** 系統應將該金額計入支出，並使我的總資產減少對應金額

#### Scenario: 已執行跨邊界收入
- **WHEN** 一筆具有 `executed_at` 的交易由 `owner: 'external'` 節點流向 `owner: 'me'` 節點
- **THEN** 系統應將該金額計入收入，並使我的總資產增加對應金額

#### Scenario: 已執行內部轉帳
- **WHEN** 一筆具有 `executed_at` 的交易在兩個 `owner: 'me'` 節點間流動
- **THEN** 系統應更新兩個帳戶結餘，且我的總資產維持不變

### Requirement: Pending Settlement Tracking
系統 SHALL 將未執行的跨邊界交易視為待結算承諾，且不得將它們計入總資產、收入或支出。

#### Scenario: 待收款與待付款淨額化
- **WHEN** 同一外部對象存在未執行的 `external -> me` $500 與 `me -> external` $200
- **THEN** 系統應顯示該對象待收款 $300，而非兩筆毛額

#### Scenario: 不同對象不互相抵銷
- **WHEN** 小明有待收款 $500，且小華有待付款 $200
- **THEN** 系統應分別顯示待收款 $500 與待付款 $200，且不得合併為單一淨額

#### Scenario: 完成待執行交易
- **WHEN** 使用者將待執行交易標記完成
- **THEN** 系統應預設以目前時間寫入 `executed_at`，將交易自待結算清單移除，並立即以該交易重新計算收入、支出與總資產

#### Scenario: 撤回完成交易
- **WHEN** 使用者撤回一筆已執行交易的完成狀態
- **THEN** 系統應清除 `executed_at`，使交易回到待結算清單，且不再影響收入、支出與總資產

### Requirement: Transaction Tagging
系統 SHALL 提供獨立標籤資料表；交易可透過 `tag_ids` 關聯零個或多個標籤。標籤 SHALL 僅表達交易語意，且不得影響圖論財務計算。

#### Scenario: 搜尋或建立標籤
- **WHEN** 使用者在交易表單輸入標籤名稱
- **THEN** 系統應先搜尋未封存的既有標籤；未找到時應允許建立名稱正規化後全域唯一的新標籤

#### Scenario: 封存標籤仍顯示於歷史交易
- **WHEN** 使用者封存一個已被交易引用的標籤
- **THEN** 新交易不得再選擇該標籤，但既有交易仍應顯示該標籤名稱

### Requirement: Legacy Data Migration
系統 SHALL 平滑遷移舊版四分類節點與舊版交易，保留既有帳務結果。

#### Scenario: 舊節點主權映射
- **WHEN** 系統讀取缺少 `owner` 的舊節點
- **THEN** `asset` 與 `liability` 應映射為 `owner: 'me'`，`income` 與 `expense` 應映射為 `owner: 'external'`

#### Scenario: 舊交易執行日期映射
- **WHEN** 系統讀取只有 `timestamp` 的舊交易
- **THEN** 系統應將該時間同時作為 `created_at` 與 `executed_at`，並將交易視為已執行
