import { ref, computed } from 'vue';
import { ulid } from 'ulid';
import { db } from '../db';
import { seedInitialData } from '../db/seeds';
import type { FinanceNode, FinanceEdge, NodeType, SummaryMetrics } from '../types/finance';

export function useGraphEngine() {
  const nodes = ref<FinanceNode[]>([]);
  const edges = ref<FinanceEdge[]>([]);
  const nodeBalances = ref<Map<string, number>>(new Map());
  const isLoading = ref<boolean>(false);

  // 節點對照表 (Key: node.id)
  const nodeMap = computed(() => {
    const map = new Map<string, FinanceNode>();
    for (const node of nodes.value) {
      map.set(node.id, node);
    }
    return map;
  });

  // 資產類別節點
  const assetNodes = computed(() => nodes.value.filter((n) => n.type === 'asset'));
  // 收入類別節點
  const incomeNodes = computed(() => nodes.value.filter((n) => n.type === 'income'));
  // 支出類別節點
  const expenseNodes = computed(() => nodes.value.filter((n) => n.type === 'expense'));
  // 負債類別節點
  const liabilityNodes = computed(() => nodes.value.filter((n) => n.type === 'liability'));

  // 綜合收支與資產指標計算
  const summaryMetrics = ref<SummaryMetrics>({
    totalAssets: 0,
    totalLiabilities: 0,
    totalIncome: 0,
    totalExpense: 0,
    netWorth: 0
  });

  // 重新計算圖論所有節點之餘額與全域指標
  async function refreshData(): Promise<void> {
    isLoading.value = true;
    try {
      // 1. 撈出所有未軟刪除之節點
      const allNodes = await db.nodes.toArray();
      const activeNodes = allNodes.filter((n) => !n.is_deleted);
      nodes.value = activeNodes;

      // 2. 撈出所有未軟刪除之邊 (依發生時間降冪排序)
      const allEdges = await db.edges.toArray();
      const activeEdges = allEdges
        .filter((e) => !e.is_deleted)
        .sort((a, b) => b.timestamp - a.timestamp);
      edges.value = activeEdges;

      // 3. 計算各節點的入度 (Inflow) 與出度 (Outflow)
      const inflows = new Map<string, number>();
      const outflows = new Map<string, number>();

      let totalExpense = 0;
      let totalIncome = 0;

      for (const edge of activeEdges) {
        // 出度
        outflows.set(edge.from_node_id, (outflows.get(edge.from_node_id) || 0) + edge.amount);
        // 入度
        inflows.set(edge.to_node_id, (inflows.get(edge.to_node_id) || 0) + edge.amount);

        const fromNode = activeNodes.find((n) => n.id === edge.from_node_id);
        const toNode = activeNodes.find((n) => n.id === edge.to_node_id);

        if (fromNode?.type === 'income') {
          totalIncome += edge.amount;
        }
        if (toNode?.type === 'expense') {
          totalExpense += edge.amount;
        }
      }

      // 4. 計算資產與各節點淨餘額
      const balances = new Map<string, number>();
      let totalAssets = 0;
      let totalLiabilities = 0;

      for (const node of activeNodes) {
        const inAmt = inflows.get(node.id) || 0;
        const outAmt = outflows.get(node.id) || 0;

        let balance = 0;
        if (node.type === 'asset') {
          balance = inAmt - outAmt; // 資產：流入 - 流出
          totalAssets += balance;
        } else if (node.type === 'liability') {
          balance = outAmt - inAmt; // 負債：流出借款 - 流入還款
          totalLiabilities += balance;
        } else if (node.type === 'expense') {
          balance = inAmt; // 支出：累計流入
        } else if (node.type === 'income') {
          balance = outAmt; // 收入：累計流出
        }

        balances.set(node.id, balance);
      }

      nodeBalances.value = balances;
      summaryMetrics.value = {
        totalAssets,
        totalLiabilities,
        totalIncome,
        totalExpense,
        netWorth: totalAssets - totalLiabilities
      };
    } finally {
      isLoading.value = false;
    }
  }

  // 取得特定節點之即時餘額
  function getNodeBalance(nodeId: string): number {
    return nodeBalances.value.get(nodeId) || 0;
  }

  // 建立新節點
  async function createNode(payload: { name: string; type: NodeType; icon?: string; currency?: string }): Promise<FinanceNode> {
    const now = Date.now();
    const newNode: FinanceNode = {
      id: ulid(),
      name: payload.name.trim(),
      type: payload.type,
      icon: payload.icon || (payload.type === 'income' ? '💼' : payload.type === 'asset' ? '🏦' : payload.type === 'expense' ? '🍜' : '💳'),
      currency: payload.currency || 'TWD',
      updated_at: now,
      is_deleted: false
    };

    await db.nodes.add(newNode);
    await refreshData();
    return newNode;
  }

  // 更新節點
  async function updateNode(id: string, updates: Partial<Omit<FinanceNode, 'id' | 'updated_at'>>): Promise<void> {
    await db.nodes.update(id, {
      ...updates,
      updated_at: Date.now()
    });
    await refreshData();
  }

  // 軟刪除節點
  async function softDeleteNode(id: string): Promise<void> {
    await db.nodes.update(id, {
      is_deleted: true,
      updated_at: Date.now()
    });
    await refreshData();
  }

  // 建立新交易收據 (Edge)
  async function createEdge(payload: {
    from_node_id: string;
    to_node_id: string;
    amount: number;
    timestamp?: number;
    memo?: string;
  }): Promise<FinanceEdge> {
    const now = Date.now();
    const newEdge: FinanceEdge = {
      id: ulid(),
      from_node_id: payload.from_node_id,
      to_node_id: payload.to_node_id,
      amount: Math.abs(payload.amount),
      timestamp: payload.timestamp || now,
      memo: payload.memo?.trim(),
      receipt_no: `RCP-${Math.floor(100 + Math.random() * 900)}`,
      updated_at: now,
      is_deleted: false
    };

    await db.edges.add(newEdge);
    await refreshData();
    return newEdge;
  }

  // 更新交易收據 (Edge)
  async function updateEdge(id: string, updates: Partial<Omit<FinanceEdge, 'id' | 'updated_at'>>): Promise<void> {
    await db.edges.update(id, {
      ...updates,
      updated_at: Date.now()
    });
    await refreshData();
  }

  // 軟刪除交易收據 (Edge)
  async function softDeleteEdge(id: string): Promise<void> {
    await db.edges.update(id, {
      is_deleted: true,
      updated_at: Date.now()
    });
    await refreshData();
  }

  // 重置為預設示範資料
  async function resetToDefaults(): Promise<void> {
    await seedInitialData(true);
    await refreshData();
  }

  // 初始化載入
  async function init(): Promise<void> {
    await seedInitialData(false);
    await refreshData();
  }

  return {
    nodes,
    edges,
    nodeMap,
    nodeBalances,
    assetNodes,
    incomeNodes,
    expenseNodes,
    liabilityNodes,
    summaryMetrics,
    isLoading,
    init,
    refreshData,
    getNodeBalance,
    createNode,
    updateNode,
    softDeleteNode,
    createEdge,
    updateEdge,
    softDeleteEdge,
    resetToDefaults
  };
}
