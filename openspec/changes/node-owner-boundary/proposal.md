# Proposal: 節點擁有者與邊界流向模型 (Node Owner Boundary Graph Model)

## Intent

現行圖論模型仍保留傳統會計的 4 種固定分類（asset, liability, income, expense），在表達「退款相抵」、「公私帳分流」與「借貸代墊」時仍受限於單一靜態分類。本變更提出以「邊界理論（Boundary Cut）」與「節點擁有者（`owner`）」為核心的圖論演進模型：節點預設擁有者為 `me`（內部持有帳戶）或 `external`（外部商家/環境），系統自動依據資金穿透邊界的方向動態判定收入、支出與內部轉帳，徹底實現「無模式純粹流動記帳」。

## Scope

### In Scope

- **節點資料模型升級**：
  - 為 `FinanceNode` 擴充 `owner` 屬性（預設值為 `'me'` 或 `'external'`）。
  - 增加 `is_account` 標記（區分是否為有餘額管理需求的實體資產/負債蓄水池）。
- **圖論邊界結算引擎升級**：
  - 動態邊界判定：
    - $From.owner \neq \text{'me'} \land To.owner = \text{'me'} \Rightarrow$ **收入 (Income)**
    - $From.owner = \text{'me'} \land To.owner \neq \text{'me'} \Rightarrow$ **支出 (Expense)**
    - $From.owner = \text{'me'} \land To.owner = \text{'me'} \Rightarrow$ **內部轉帳 (Transfer)**
  - 自動處理退款（商家外部流入內部自動作為支出沖銷/收益增加）。
- **使用者介面適配**：
  - 記帳連線抽屜（QuickEntrySheet）直接呈現所有可用節點，無需手動選擇收支模式。
  - 帳戶管理（NodesView）支援設定節點擁有者（預設為 `me`）。

### Out of Scope

- 複雜多群組權限密碼隔離（後續多租戶階段規劃）。
- 即時匯率外幣轉換（維持單幣別）。

## Capabilities

### Modified Capabilities

- `graph-engine`: 擴充節點 `owner` 屬性與基於邊界跨越的動態收支/轉帳判定計算規則。
- `mobile-receipt-ui`: 連線記帳抽屜與帳戶管理支援 `owner` 屬性展示與無模式流向選取。

## Impact

- **Breaking Changes**: 無破壞性變更，舊有節點資料平滑升級（資產/負債自動設為 `owner: 'me'`, 收入/支出設為 `owner: 'external'`）。
- **Dependencies**: 無新增相依套件。
- **Performance**: 記憶體比對運算時間複雜度維持 $O(E)$，效能維持毫秒級。
