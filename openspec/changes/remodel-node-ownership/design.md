## Context

目前 `FinanceNode` 以 `asset`、`liability`、`income`、`expense` 四分類描述節點，`FinanceEdge` 僅有單一 `timestamp`。這讓節點同時承擔「誰擁有資金」與「交易的生活語意」，並且無法表示已建立但尚未完成的收款、付款或轉帳。

本設計將資料語意拆為三個正交維度：節點主權、交易執行狀態與交易標籤。它採現金流觀點：收入／支出代表跨越使用者邊界且已執行的實際資金流；薪資、還款、餐飲等更細的用途由標籤補充。

## Goals / Non-Goals

**Goals:**

- 以 `owner: 'me' | 'external'` 表示節點主權，讓節點只代表帳戶或外部對象。
- 以 `created_at` 與 `executed_at: number | null` 表示交易的建立與實際執行；以 `Boolean(executed_at)` 推導執行狀態。
- 僅用已執行交易推導總資產、收入、支出與我的帳戶結餘。
- 以未執行跨邊界交易推導待結算承諾，並在同一外部對象內淨額化。
- 以獨立標籤表和交易 `tag_ids` 提供可多選、可搜尋、可新增與可封存的語意分類。
- 保留舊資料的金額與時間排序，並將舊交易視為已執行。
- 提供待執行交易的建立、完成與撤回執行操作，以及節點／標籤封存。

**Non-Goals:**

- 不將「薪資」、「還款」、「代墊」等意圖做成會影響計算的硬編碼交易類型。
- 不在本次為多品項收據的每一個品項新增標籤；本次只支援收據層級標籤。
- 不限制外部實體或標籤的數量。

## Decisions

### 1. 資料模型

```typescript
export type NodeOwner = 'me' | 'external';

export interface FinanceNode {
  id: string;
  name: string;
  owner: NodeOwner;
  currency?: string;
  icon?: string;
  color?: string;
  updated_at: number;
  is_deleted: boolean; // 封存節點
}

export interface FinanceTag {
  id: string;
  name: string;
  normalized_name: string;
  updated_at: number;
  is_deleted: boolean; // 封存標籤
}

export interface FinanceEdge {
  id: string;
  from_node_id: string;
  to_node_id: string;
  amount: number;
  created_at: number;
  executed_at: number | null;
  tag_ids?: string[];
  memo?: string;
  receipt_no?: string;
  updated_at: number;
  is_deleted: boolean;
}
```

- `executed_at` 是執行狀態的唯一真實來源；不持久化重複的 `is_executed`。
- `normalized_name` 為去除前後空白並不分大小寫的標籤名稱，用於保證全域唯一。
- `is_deleted` 代表封存。封存資料仍供歷史交易解析與顯示，但不提供給新交易選擇。

### 2. 主權與執行矩陣

| 起點 owner | 終點 owner | 已執行 | 推導結果 |
| :--- | :--- | :--- | :--- |
| `me` | `external` | 是 | 支出；我的資產減少 |
| `external` | `me` | 是 | 收入；我的資產增加 |
| `me` | `me` | 是 | 內部轉帳；我的總資產不變 |
| `external` | `external` | 是 | 外部流轉；不影響我的資產 |
| `external` | `me` | 否 | 待收款 |
| `me` | `external` | 否 | 待付款 |
| 任意 | 任意 | 否 | 可作為待完成交易保存；只有跨越我的邊界者納入待收／待付 |

收入與支出保留直觀名稱，但定義為已執行的跨邊界流入與流出；交易標籤負責薪資、還款、餐飲等語意。

### 3. 應收／應付淨額化

以外部節點為單位，計算其未執行跨邊界承諾：

```text
netPending(counterparty) =
  sum(unexecuted external -> me) - sum(unexecuted me -> external)
```

- 正值顯示為該對象的待收款。
- 負值的絕對值顯示為該對象的待付款。
- 同一對象的待收與待付互相抵銷；不同對象不互相抵銷。
- 待執行交易不影響總資產、收入或支出。標記完成時填入 `executed_at`，其承諾自然離開待結算集合；撤回完成時清除 `executed_at`。

### 4. 遷移與 IndexedDB

- 舊節點：`asset`、`liability` 映射為 `owner: 'me'`；`income`、`expense` 映射為 `owner: 'external'`。`type` 不再作為新模型正式欄位。
- 舊邊：將舊 `timestamp` 同時映射為 `created_at`、`executed_at`，保留金額、備註、收據編號與排序，並視為已執行。
- IndexedDB schema 新增標籤表，並為節點 owner、交易執行日期與標籤必要查詢建立相容索引。

### 5. UI 與生命週期

- **NodesView**：依「我的帳戶」與「外部對象」分區；建立／編輯節點選擇 owner。已被未封存交易引用的節點僅能封存，不能直接刪除。
- **QuickEntrySheet**：新交易預設已執行，提供「建立為待執行」切換。待執行交易的 `executed_at` 為 `null`；交易可搜尋、選取或建立多個標籤。
- **ReceiptFeed / ReceiptCard**：待執行項目置頂，並按待收／待付顯示；已執行項目依 `executed_at` 降冪排序。待執行項目可標記完成（預設填入目前時間）或撤回完成。
- **GraphView / BalanceBanner**：顯示我的帳戶結餘、依外部對象淨額化的待收款與待付款；總資產、收入與支出只包含已執行交易。
- **標籤管理**：交易表單提供管理入口，可新增、重新命名與封存標籤。封存標籤會在歷史交易上解析顯示，但不出現在新交易候選清單。

## Risks / Trade-offs

- **[收入／支出並非傳統損益]**：朋友還款也會是實際收入流入、償還借款也會是實際支出流出；以 tags 讓使用者表達更細語意。
- **[封存節點仍需解析]**：查詢與圖論運算不能只讀未封存節點，否則歷史邊會失去 owner；封存僅影響新交易可選性。
- **[並行變更衝突]**：多品項收據與節點編輯變更共用型別與 UI，實作時需以本設計為共同基線。
