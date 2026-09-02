export type NodeOwner = "me" | "external";
export type LegacyNodeType = "asset" | "liability" | "income" | "expense";

export interface FinanceNode {
  id: string;
  name: string;
  owner: NodeOwner;
  currency?: string;
  icon?: string;
  color?: string;
  updated_at: number;
  is_deleted: boolean;
}

export interface FinanceTag {
  id: string;
  name: string;
  normalized_name: string;
  updated_at: number;
  is_deleted: boolean;
}

export interface ReceiptItem {
  id: string;
  name: string;
  amount: number;
  quantity?: number;
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
  items?: ReceiptItem[];
  updated_at: number;
  is_deleted: boolean;
}

export interface SummaryMetrics {
  totalAssets: number;
  totalIncome: number;
  totalExpense: number;
  totalReceivables: number;
  totalPayables: number;
}

export interface CounterpartyBalance {
  node: FinanceNode;
  amount: number;
}
