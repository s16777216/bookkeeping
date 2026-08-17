export type NodeType = 'asset' | 'liability' | 'income' | 'expense';

export interface FinanceNode {
  id: string;          // ULID
  name: string;        // 顯示名稱 (如: 玉山銀行, 現金皮夾, 薪資, 餐飲飲食)
  type: NodeType;      // 節點類型
  currency?: string;   // 預設 'TWD'
  icon?: string;       // 圖示 (如: 🏦, 👛, 💳, 🍜, 🚇)
  color?: string;      // 節點標籤色
  updated_at: number;  // 毫秒時間戳記 (LWW)
  is_deleted: boolean; // 軟刪除標記
}

export interface FinanceEdge {
  id: string;          // ULID
  from_node_id: string;// 資金起點 ID
  to_node_id: string;  // 資金終點 ID
  amount: number;      // 交易金額 (正數)
  timestamp: number;   // 交易發生時間
  memo?: string;       // 備註 (如: 午餐排骨便當)
  receipt_no?: string; // 收據編號
  updated_at: number;  // 毫秒時間戳記 (LWW)
  is_deleted: boolean; // 軟刪除標記
}

export interface SummaryMetrics {
  totalAssets: number;
  totalLiabilities: number;
  totalIncome: number;
  totalExpense: number;
  netWorth: number;
}
