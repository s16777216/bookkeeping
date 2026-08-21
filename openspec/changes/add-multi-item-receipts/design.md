## Context

目前 [FinanceEdge](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/types/finance.ts) 僅包含單一 `to_node_id` 與 `amount`。當使用者在單次消費中涵蓋不同品類（如全聯、好市多購物）時，只能將全部金額歸於單一分類，造成財務分析失真。

## Goals / Non-Goals

**Goals:**
- 在不破壞既有單筆收據結構的前提下，擴充 `items?: ReceiptItem[]` 支援多品項明細。
- 在 `useGraphEngine.ts` 中支援多品項的圖論分流運算：來源帳戶扣除總額，各子品項金額精確流入各自的目標節點。
- 記帳面板提供無縫切換的「多品項明細編輯器」，支援品名、金額、子分類指派與自動加總。
- 在 `ReceiptCard.vue` 收據小票卡片中支援多品項展開展示與分類標籤。

**Non-Goals:**
- 不引入跨多個出款帳戶（多個來源）的混合支付，維持一張收據單一資金來源帳戶。

## Decisions

1. **內嵌集合式資料模型（Embedded Collection）**
   - **決定**：
     ```typescript
     export interface ReceiptItem {
       id: string;
       name: string;
       amount: number;
       to_node_id: string;
     }
     ```
   - **原因**：IndexedDB 直接支援儲存巢狀物件陣列，無需進行複雜的多表關聯查詢，讀取與快照效能最優。

2. **圖論出入度分流計算**
   - **決定**：在計算 `inflows` 與各分類累計時，若 `edge.items` 存在且長度 > 0，則依各 `item.to_node_id` 分別累加其 `item.amount`；來源 `from_node_id` 則一次性累加整張單據的 `edge.amount`。
   - **原因**：數學上嚴格滿足流入總和 = 流出總和，資產看板 100% 平衡。

3. **漸進式 UI 輸入體驗**
   - **決定**：保持預設的快速單筆輸入，使用者點擊「📋 拆分為多個品項」後即時展開明細表格，支援逐項增刪與自動連動總額。

## Risks / Trade-offs

- **[舊資料相容性]** → `items` 為 optional（可選欄位），既有資料在未提供 items 時維持原有一對一邏輯，保證零遷移成本與 100% 向下相容。
