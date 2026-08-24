## Context

目前的圖論模型中，[FinanceNode](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/types/finance.ts) 採用傳統會計的四分法（`asset`、`liability`、`income`、`expense`）。這導致面對「朋友聚餐代墊」、「借還款」、「多方流轉」時，必須在「資產」與「支出」之間勉強切換。
重構後的模型將節點劃分為 **「實體主權（Ownership）」**，明確定義哪些節點是「我的資金蓄水池（`owner: 'me'`）」，哪些是「外部對手方/商家/他人（`owner: 'external'`）」。

## Goals / Non-Goals

**Goals:**
- **節點資料模型升級**：在 `FinanceNode` 中引入 `owner: 'me' | 'external'`（可搭配 `owner_name` 自訂對象名）。
- **圖論收支與資產運算重構**：
  - **總資產 (Net Worth)**：所有 `owner === 'me'` 的節點淨值（`流入 - 流出`）加總。
  - **總支出 (Expenses)**：所有從 `me ➔ external` 的跨邊界資金流動。
  - **總收入 (Income)**：所有從 `external ➔ me` 的跨邊界資金流動。
  - **內部轉帳 (Transfers)**：`me ➔ me` 之間的流動（總資產不變）。
  - **應收/應付代墊 (Receivables/Payables)**：`external` 人物節點之淨值（正值代表對方欠我錢，負值代表我欠對方錢）。
- **向下相容性**：自動將既有資料平滑映射至新主權模型（`asset/liability ➔ me`，`income/expense ➔ external`）。
- **UI 視圖適配**：更新 `NodesView`（分組管理我的帳戶與外部對手）、`QuickEntrySheet`（從我出款 ➔ 給誰）與 `GraphView`。

**Non-Goals:**
- 不在此階段強制限制外部實體的數量上限。

## Decisions

1. **實體主權矩陣（Ownership Flow Matrix）**
   - **決定**：透過交易邊的 `fromNode.owner` 與 `toNode.owner` 組合自動判定交易性質：
     | 起點擁有者 (`from`) | 終點擁有者 (`to`) | 交易性質 | 對資產看板的影響 |
     | :--- | :--- | :--- | :--- |
     | `me` | `external` | **支出 (Expense)** | 我的總資產減少 |
     | `external` | `me` | **收入 (Income)** | 我的總資產增加 |
     | `me` | `me` | **轉帳 (Transfer)** | 我的總資產不變 |
     | `external` | `external` | **外部流轉** | 不影響我的資產（純記錄） |

2. **節點型別定義（TypeScript Schema）**
   - **決定**：
     ```typescript
     export type NodeOwner = 'me' | 'external';
     
     export interface FinanceNode {
       id: string;
       name: string;
       owner: NodeOwner;          // 擁有者主權
       sub_type?: string;         // 輔助標籤（如：銀行、錢包、商家、朋友、公司）
       icon?: string;
       color?: string;
       currency?: string;
       updated_at: number;
       is_deleted: boolean;
     }
     ```

3. **既有資料自動無痛遷移（Auto-migration Strategy）**
   - **決定**：在 `useGraphEngine.ts` 載入時，若發現舊節點缺少 `owner` 欄位：
     - 若 `type === 'asset' || type === 'liability'` ➔ 自動賦予 `owner = 'me'`。
     - 若 `type === 'income' || type === 'expense'` ➔ 自動賦予 `owner = 'external'`。

## Risks / Trade-offs

- **[舊組件型別相容]** → 保留 `sub_type` 輔助分類，讓 UI 標籤能平滑過渡。
- **[代墊款與支出統計的邊界]** → 當付錢給「朋友小明」時，可選擇該筆交易是「純消費（請客）」還是「待還款（代墊）」，透過外部節點的累計結餘一目了然。
