import { ulid } from 'ulid';
import { db } from './index';
import type { FinanceNode, FinanceEdge } from '../types/finance';

export async function seedInitialData(force = false): Promise<void> {
  const nodeCount = await db.nodes.count();
  if (nodeCount > 0 && !force) {
    return;
  }

  if (force) {
    await db.edges.clear();
    await db.nodes.clear();
  }

  const now = Date.now();

  // 1. 預設節點清單
  const salaryNodeId = ulid();
  const bankNodeId = ulid();
  const walletNodeId = ulid();
  const easyCardNodeId = ulid();
  const diningNodeId = ulid();
  const transportNodeId = ulid();
  const shoppingNodeId = ulid();

  const defaultNodes: FinanceNode[] = [
    // 收入
    { id: salaryNodeId, name: '科技公司薪資', type: 'income', icon: '💼', currency: 'TWD', updated_at: now, is_deleted: false },
    // 資產
    { id: bankNodeId, name: '玉山銀行主帳戶', type: 'asset', icon: '🏦', currency: 'TWD', updated_at: now, is_deleted: false },
    { id: walletNodeId, name: '現金零錢包', type: 'asset', icon: '👛', currency: 'TWD', updated_at: now, is_deleted: false },
    { id: easyCardNodeId, name: '悠遊卡錢包', type: 'asset', icon: '💳', currency: 'TWD', updated_at: now, is_deleted: false },
    // 支出
    { id: diningNodeId, name: '餐飲飲食', type: 'expense', icon: '🍜', currency: 'TWD', updated_at: now, is_deleted: false },
    { id: transportNodeId, name: '交通出行', type: 'expense', icon: '🚇', currency: 'TWD', updated_at: now, is_deleted: false },
    { id: shoppingNodeId, name: '日常購物', type: 'expense', icon: '🛍️', currency: 'TWD', updated_at: now, is_deleted: false }
  ];

  await db.nodes.bulkAdd(defaultNodes);

  // 2. 預設示範收據邊 (交易流向)
  const defaultEdges: FinanceEdge[] = [
    {
      id: ulid(),
      from_node_id: salaryNodeId,
      to_node_id: bankNodeId,
      amount: 65000,
      timestamp: now - 3600 * 1000 * 24 * 3, // 3天前
      memo: '8月份本薪入帳',
      receipt_no: 'RCP-801',
      updated_at: now,
      is_deleted: false
    },
    {
      id: ulid(),
      from_node_id: bankNodeId,
      to_node_id: walletNodeId,
      amount: 5000,
      timestamp: now - 3600 * 1000 * 24 * 2, // 2天前 ATM提領
      memo: 'ATM 提領零用金',
      receipt_no: 'RCP-802',
      updated_at: now,
      is_deleted: false
    },
    {
      id: ulid(),
      from_node_id: walletNodeId,
      to_node_id: easyCardNodeId,
      amount: 500,
      timestamp: now - 3600 * 1000 * 12,
      memo: '捷運站悠遊卡自動加值',
      receipt_no: 'RCP-803',
      updated_at: now,
      is_deleted: false
    },
    {
      id: ulid(),
      from_node_id: walletNodeId,
      to_node_id: diningNodeId,
      amount: 290,
      timestamp: now - 3600 * 1000 * 4,
      memo: '午餐・一蘭豚骨拉麵',
      receipt_no: 'RCP-804',
      updated_at: now,
      is_deleted: false
    },
    {
      id: ulid(),
      from_node_id: easyCardNodeId,
      to_node_id: transportNodeId,
      amount: 35,
      timestamp: now - 3600 * 1000 * 2,
      memo: '台北捷運・市政府 ➔ 台北車站',
      receipt_no: 'RCP-805',
      updated_at: now,
      is_deleted: false
    }
  ];

  await db.edges.bulkAdd(defaultEdges);
}
