import { ulid } from "ulid";
import { db } from "./index";
import type { FinanceNode, FinanceEdge, FinanceTag } from "../types/finance";

export async function seedInitialData(force = false): Promise<void> {
  const nodeCount = await db.nodes.count();
  if (nodeCount > 0 && !force) return;
  if (force)
    await db.transaction("rw", db.nodes, db.edges, db.tags, async () => {
      await db.edges.clear();
      await db.nodes.clear();
      await db.tags.clear();
    });

  const now = Date.now();
  const daysAgo = (days: number) => now - days * 24 * 60 * 60 * 1000;
  const bankId = ulid(),
    walletId = ulid(),
    easyCardId = ulid(),
    employerId = ulid(),
    ramenId = ulid(),
    xiaomingId = ulid();
  const salaryTagId = ulid(),
    diningTagId = ulid(),
    transportTagId = ulid(),
    advanceTagId = ulid();
  const defaultNodes: FinanceNode[] = [
    {
      id: bankId,
      name: "玉山銀行主帳戶",
      owner: "me",
      icon: "landmark",
      color: "#2D6A4F",
      currency: "TWD",
      updated_at: now,
      is_deleted: false,
    },
    {
      id: walletId,
      name: "現金零錢包",
      owner: "me",
      icon: "wallet",
      color: "#111827",
      currency: "TWD",
      updated_at: now,
      is_deleted: false,
    },
    {
      id: easyCardId,
      name: "悠遊卡錢包",
      owner: "me",
      icon: "credit-card",
      color: "#1D4ED8",
      currency: "TWD",
      updated_at: now,
      is_deleted: false,
    },
    {
      id: employerId,
      name: "科技公司",
      owner: "external",
      icon: "briefcase",
      color: "#4B5563",
      currency: "TWD",
      updated_at: now,
      is_deleted: false,
    },
    {
      id: ramenId,
      name: "一蘭拉麵",
      owner: "external",
      icon: "utensils",
      color: "#B45309",
      currency: "TWD",
      updated_at: now,
      is_deleted: false,
    },
    {
      id: xiaomingId,
      name: "小明",
      owner: "external",
      icon: "tag",
      color: "#C2410C",
      currency: "TWD",
      updated_at: now,
      is_deleted: false,
    },
  ];
  const tags: FinanceTag[] = [
    {
      id: salaryTagId,
      name: "薪資",
      normalized_name: "薪資",
      updated_at: now,
      is_deleted: false,
    },
    {
      id: diningTagId,
      name: "餐飲",
      normalized_name: "餐飲",
      updated_at: now,
      is_deleted: false,
    },
    {
      id: transportTagId,
      name: "交通",
      normalized_name: "交通",
      updated_at: now,
      is_deleted: false,
    },
    {
      id: advanceTagId,
      name: "代墊",
      normalized_name: "代墊",
      updated_at: now,
      is_deleted: false,
    },
  ];
  const edge = (
    from: string,
    to: string,
    amount: number,
    executedAt: number | null,
    memo: string,
    tagIds: string[],
  ): FinanceEdge => ({
    id: ulid(),
    from_node_id: from,
    to_node_id: to,
    amount,
    created_at: executedAt || now,
    executed_at: executedAt,
    memo,
    tag_ids: tagIds,
    receipt_no: `RCP-${Math.floor(100 + Math.random() * 900)}`,
    updated_at: now,
    is_deleted: false,
  });
  const edges: FinanceEdge[] = [
    edge(employerId, bankId, 65000, daysAgo(3), "8 月份本薪入帳", [
      salaryTagId,
    ]),
    edge(bankId, walletId, 5000, daysAgo(2), "ATM 提領零用金", []),
    edge(walletId, easyCardId, 500, daysAgo(1), "悠遊卡自動加值", [
      transportTagId,
    ]),
    edge(walletId, ramenId, 290, daysAgo(0), "午餐・一蘭豚骨拉麵", [
      diningTagId,
    ]),
    edge(xiaomingId, bankId, 500, null, "小明待還代墊款", [advanceTagId]),
  ];
  await db.transaction("rw", db.nodes, db.edges, db.tags, async () => {
    await db.nodes.bulkAdd(defaultNodes);
    await db.tags.bulkAdd(tags);
    await db.edges.bulkAdd(edges);
  });
}
