import { computed, ref } from "vue";
import { ulid } from "ulid";
import { db } from "../db";
import { seedInitialData } from "../db/seeds";
import type {
  CounterpartyBalance,
  FinanceEdge,
  FinanceNode,
  FinanceTag,
  NodeOwner,
  SummaryMetrics,
} from "../types/finance";

const normalizeTagName = (name: string) => name.trim().toLocaleLowerCase();

export function useGraphEngine() {
  const nodes = ref<FinanceNode[]>([]);
  const allNodes = ref<FinanceNode[]>([]);
  const edges = ref<FinanceEdge[]>([]);
  const tags = ref<FinanceTag[]>([]);
  const allTags = ref<FinanceTag[]>([]);
  const nodeBalances = ref<Map<string, number>>(new Map());
  const pendingReceivables = ref<CounterpartyBalance[]>([]);
  const pendingPayables = ref<CounterpartyBalance[]>([]);
  const isLoading = ref(false);

  const nodeMap = computed(
    () => new Map(allNodes.value.map((node) => [node.id, node])),
  );
  const tagMap = computed(
    () => new Map(allTags.value.map((tag) => [tag.id, tag])),
  );
  const myNodes = computed(() =>
    nodes.value.filter((node) => node.owner === "me"),
  );
  const externalNodes = computed(() =>
    nodes.value.filter((node) => node.owner === "external"),
  );
  const summaryMetrics = ref<SummaryMetrics>({
    totalAssets: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalReceivables: 0,
    totalPayables: 0,
  });

  async function refreshData(): Promise<void> {
    isLoading.value = true;
    try {
      allNodes.value = await db.nodes.toArray();
      nodes.value = allNodes.value.filter((node) => !node.is_deleted);
      allTags.value = await db.tags.toArray();
      tags.value = allTags.value
        .filter((tag) => !tag.is_deleted)
        .sort((a, b) => a.name.localeCompare(b.name, "zh-TW"));
      const activeEdges = (await db.edges.toArray()).filter(
        (edge) => !edge.is_deleted,
      );
      edges.value = activeEdges.sort((a, b) => {
        if (Boolean(a.executed_at) !== Boolean(b.executed_at))
          return a.executed_at ? 1 : -1;
        return (
          (b.executed_at || b.created_at) - (a.executed_at || a.created_at)
        );
      });

      const allNodeMap = new Map(allNodes.value.map((node) => [node.id, node]));
      const inflows = new Map<string, number>();
      const outflows = new Map<string, number>();
      const pendingByCounterparty = new Map<string, number>();
      let totalIncome = 0;
      let totalExpense = 0;

      for (const edge of activeEdges) {
        const from = allNodeMap.get(edge.from_node_id);
        const to = allNodeMap.get(edge.to_node_id);
        if (!from || !to) continue;
        if (edge.executed_at) {
          outflows.set(from.id, (outflows.get(from.id) || 0) + edge.amount);
          inflows.set(to.id, (inflows.get(to.id) || 0) + edge.amount);
          if (from.owner === "me" && to.owner === "external")
            totalExpense += edge.amount;
          if (from.owner === "external" && to.owner === "me")
            totalIncome += edge.amount;
        } else if (from.owner === "external" && to.owner === "me") {
          pendingByCounterparty.set(
            from.id,
            (pendingByCounterparty.get(from.id) || 0) + edge.amount,
          );
        } else if (from.owner === "me" && to.owner === "external") {
          pendingByCounterparty.set(
            to.id,
            (pendingByCounterparty.get(to.id) || 0) - edge.amount,
          );
        }
      }

      const balances = new Map<string, number>();
      let totalAssets = 0;
      for (const node of allNodes.value) {
        const balance =
          (inflows.get(node.id) || 0) - (outflows.get(node.id) || 0);
        balances.set(node.id, balance);
        if (node.owner === "me") totalAssets += balance;
      }
      const counterpartyBalances = [...pendingByCounterparty.entries()]
        .map(([id, amount]) => ({ node: allNodeMap.get(id), amount }))
        .filter(
          (entry): entry is { node: FinanceNode; amount: number } =>
            Boolean(entry.node) && entry.amount !== 0,
        );
      pendingReceivables.value = counterpartyBalances
        .filter((entry) => entry.amount > 0)
        .sort((a, b) => b.amount - a.amount);
      pendingPayables.value = counterpartyBalances
        .filter((entry) => entry.amount < 0)
        .map((entry) => ({ ...entry, amount: Math.abs(entry.amount) }))
        .sort((a, b) => b.amount - a.amount);
      nodeBalances.value = balances;
      summaryMetrics.value = {
        totalAssets,
        totalIncome,
        totalExpense,
        totalReceivables: pendingReceivables.value.reduce(
          (sum, item) => sum + item.amount,
          0,
        ),
        totalPayables: pendingPayables.value.reduce(
          (sum, item) => sum + item.amount,
          0,
        ),
      };
    } finally {
      isLoading.value = false;
    }
  }

  function getNodeBalance(nodeId: string): number {
    return nodeBalances.value.get(nodeId) || 0;
  }
  async function createNode(payload: {
    name: string;
    owner: NodeOwner;
    icon?: string;
    currency?: string;
  }): Promise<FinanceNode> {
    const now = Date.now();
    const node: FinanceNode = {
      id: ulid(),
      name: payload.name.trim(),
      owner: payload.owner,
      icon: payload.icon || (payload.owner === "me" ? "🏦" : "🏷️"),
      currency: payload.currency || "TWD",
      updated_at: now,
      is_deleted: false,
    };
    await db.nodes.add(node);
    await refreshData();
    return node;
  }
  async function updateNode(
    id: string,
    updates: Partial<Omit<FinanceNode, "id" | "updated_at">>,
  ): Promise<void> {
    await db.nodes.update(id, { ...updates, updated_at: Date.now() });
    await refreshData();
  }
  async function archiveNode(id: string): Promise<void> {
    await updateNode(id, { is_deleted: true });
  }

  async function createEdge(payload: {
    from_node_id: string;
    to_node_id: string;
    amount: number;
    executed_at?: number | null;
    memo?: string;
    tag_ids?: string[];
  }): Promise<FinanceEdge> {
    const now = Date.now();
    const edge: FinanceEdge = {
      id: ulid(),
      from_node_id: payload.from_node_id,
      to_node_id: payload.to_node_id,
      amount: Math.abs(payload.amount),
      created_at: now,
      executed_at:
        payload.executed_at === undefined ? now : payload.executed_at,
      memo: payload.memo?.trim(),
      tag_ids: [...(payload.tag_ids || [])],
      receipt_no: `RCP-${Math.floor(100 + Math.random() * 900)}`,
      updated_at: now,
      is_deleted: false,
    };
    await db.edges.add(edge);
    await refreshData();
    return edge;
  }
  async function updateEdge(
    id: string,
    updates: Partial<Omit<FinanceEdge, "id" | "updated_at">>,
  ): Promise<void> {
    await db.edges.update(id, { ...updates, updated_at: Date.now() });
    await refreshData();
  }
  async function completeEdge(
    id: string,
    executedAt = Date.now(),
  ): Promise<void> {
    await updateEdge(id, { executed_at: executedAt });
  }
  async function undoCompleteEdge(id: string): Promise<void> {
    await updateEdge(id, { executed_at: null });
  }
  async function softDeleteEdge(id: string): Promise<void> {
    await updateEdge(id, { is_deleted: true });
  }

  async function createTag(name: string): Promise<FinanceTag> {
    const trimmed = name.trim();
    const normalizedName = normalizeTagName(trimmed);
    if (!trimmed) throw new Error("標籤名稱不可為空白");
    const existing = await db.tags
      .where("normalized_name")
      .equals(normalizedName)
      .first();
    if (existing) {
      if (existing.is_deleted) {
        await db.tags.update(existing.id, {
          is_deleted: false,
          updated_at: Date.now(),
        });
        await refreshData();
        return { ...existing, is_deleted: false };
      }
      return existing;
    }
    const tag: FinanceTag = {
      id: ulid(),
      name: trimmed,
      normalized_name: normalizedName,
      updated_at: Date.now(),
      is_deleted: false,
    };
    await db.tags.add(tag);
    await refreshData();
    return tag;
  }
  async function renameTag(id: string, name: string): Promise<void> {
    const trimmed = name.trim();
    const normalizedName = normalizeTagName(trimmed);
    if (!trimmed) throw new Error("標籤名稱不可為空白");
    const conflict = await db.tags
      .where("normalized_name")
      .equals(normalizedName)
      .first();
    if (conflict && conflict.id !== id) throw new Error("已有同名標籤");
    await db.tags.update(id, {
      name: trimmed,
      normalized_name: normalizedName,
      updated_at: Date.now(),
    });
    await refreshData();
  }
  async function archiveTag(id: string): Promise<void> {
    await db.tags.update(id, { is_deleted: true, updated_at: Date.now() });
    await refreshData();
  }

  async function resetToDefaults(): Promise<void> {
    await seedInitialData(true);
    await refreshData();
  }
  async function init(): Promise<void> {
    await seedInitialData(false);
    await refreshData();
  }

  return {
    nodes,
    edges,
    tags,
    nodeMap,
    tagMap,
    nodeBalances,
    myNodes,
    externalNodes,
    pendingReceivables,
    pendingPayables,
    summaryMetrics,
    isLoading,
    init,
    refreshData,
    getNodeBalance,
    createNode,
    updateNode,
    archiveNode,
    createEdge,
    updateEdge,
    completeEdge,
    undoCompleteEdge,
    softDeleteEdge,
    createTag,
    renameTag,
    archiveTag,
    resetToDefaults,
  };
}
