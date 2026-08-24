## ADDED Requirements

### Requirement: Node Ownership Definition
所有財務圖論節點 `FinanceNode` SHALL 具備 `owner`（實體主權）屬性，明確劃分該節點為使用者自有的資金蓄水池（`owner: 'me'`）或外部交易對手/商家/他人（`owner: 'external'`）。

#### Scenario: 建立具有擁有者屬性的新節點
- **WHEN** 使用者在帳戶與實體管理介面建立新節點
- **THEN** 系統應允許選擇該節點為「我的資產帳戶」或「外部對手/商家」，並正確將 `owner` 屬性儲存於 IndexedDB

### Requirement: Dynamic Financial Derivation
圖論運算引擎 SHALL 根據交易邊（Edge）之起點與終點擁有者主權（`fromNode.owner` 與 `toNode.owner`）自動推導該筆交易之財務性質與對總身價之影響。

#### Scenario: 跨邊界支出計算 (Me to External)
- **WHEN** 發生一筆由 `owner: 'me'` 節點（如我的銀行）流向 `owner: 'external'` 節點（如超商）的收據
- **THEN** 系統應自動將該金額計入總支出，並使我的總身價減少對應金額

#### Scenario: 跨邊界收入計算 (External to Me)
- **WHEN** 發生一筆由 `owner: 'external'` 節點（如公司）流向 `owner: 'me'` 節點（如我的錢包）的收據
- **THEN** 系統應自動將該金額計入總收入，並使我的總身價增加對應金額

#### Scenario: 內部轉帳計算 (Me to Me)
- **WHEN** 發生一筆在兩個 `owner: 'me'` 節點之間的流動（如銀行提款至錢包）
- **THEN** 系統應自動視為內部轉帳，起點餘額減少、終點餘額增加，且我的總身價維持恆定不變

### Requirement: Debts and Receivables Tracking
系統 SHALL 支援外部實體節點之結餘計算，當外部對象節點結餘為正數時，自動識別並展示為應收代墊款（或借款債權）。

#### Scenario: 朋友聚餐代墊與還款結算
- **WHEN** 使用者從自己的帳戶付款給外部朋友節點（小明）$500，且隨後小明轉帳歸還 $500
- **THEN** 付款時小明節點結餘應顯示為 +$500（待收代墊款），還款後結餘應平滑歸零

### Requirement: Auto-migration of Legacy Node Types
圖論引擎在載入既有缺少 `owner` 屬性的舊版節點資料時，SHALL 自動平滑映射為新實體主權模型。

#### Scenario: 舊版四分類資料自動相容
- **WHEN** 系統讀取舊有的 `asset` / `liability` / `income` / `expense` 節點
- **THEN** 系統應自動將 `asset` 與 `liability` 映射為 `owner: 'me'`，將 `income` 與 `expense` 映射為 `owner: 'external'`，保證歷史資料完全正常呈現
