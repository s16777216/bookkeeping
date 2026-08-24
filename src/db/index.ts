import Dexie, { type Table } from "dexie";
import type {
  FinanceNode,
  FinanceEdge,
  FinanceTag,
  LegacyNodeType,
  NodeOwner,
} from "../types/finance";

type LegacyNode = Partial<FinanceNode> & { id: string; type?: LegacyNodeType };
type LegacyEdge = Partial<FinanceEdge> & { id: string; timestamp?: number };

function ownerFromLegacyType(type?: LegacyNodeType): NodeOwner {
  return type === "income" || type === "expense" ? "external" : "me";
}

export class FinanceDatabase extends Dexie {
  nodes!: Table<FinanceNode, string>;
  edges!: Table<FinanceEdge, string>;
  tags!: Table<FinanceTag, string>;

  constructor() {
    super("LedgerGraphDatabase");
    this.version(1).stores({
      nodes: "id, type, updated_at, is_deleted",
      edges:
        "id, from_node_id, to_node_id, timestamp, updated_at, is_deleted, [from_node_id+is_deleted], [to_node_id+is_deleted]",
    });
    this.version(2)
      .stores({
        nodes: "id, owner, updated_at, is_deleted",
        edges:
          "id, from_node_id, to_node_id, created_at, executed_at, updated_at, is_deleted, [from_node_id+is_deleted], [to_node_id+is_deleted]",
        tags: "id, &normalized_name, is_deleted, updated_at",
      })
      .upgrade(async (transaction) => {
        const now = Date.now();
        await transaction
          .table("nodes")
          .toCollection()
          .modify((node: LegacyNode) => {
            node.owner ||= ownerFromLegacyType(node.type);
            delete node.type;
          });
        await transaction
          .table("edges")
          .toCollection()
          .modify((edge: LegacyEdge) => {
            const timestamp = edge.timestamp || now;
            edge.created_at ||= timestamp;
            if (edge.executed_at === undefined) edge.executed_at = timestamp;
            delete edge.timestamp;
          });
      });
  }
}

export const db = new FinanceDatabase();
