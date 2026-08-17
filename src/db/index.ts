import Dexie, { type Table } from 'dexie';
import type { FinanceNode, FinanceEdge } from '../types/finance';

export class FinanceDatabase extends Dexie {
  nodes!: Table<FinanceNode, string>;
  edges!: Table<FinanceEdge, string>;

  constructor() {
    super('LedgerGraphDatabase');
    this.version(1).stores({
      nodes: 'id, type, updated_at, is_deleted',
      edges: 'id, from_node_id, to_node_id, timestamp, updated_at, is_deleted, [from_node_id+is_deleted], [to_node_id+is_deleted]'
    });
  }
}

export const db = new FinanceDatabase();
