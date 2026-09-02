## Context

日常消費（如超市、賣場）通常包含多項商品。目前 [FinanceEdge](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/types/finance.ts) 僅有單一總金額與備忘，缺乏品項明細紀錄。

經過 `/opsx-grill` 探討，確認收據（Edge）維持「單一來源（`from_node_id`）➔ 單一去向（`to_node_id`）」的單向金流本質，子品項（Line Items）為交易內容明細，不具備獨立方向性。

## Goals / Non-Goals

**Goals:**
- 在不破壞既有單筆收據結構的前提下，擴充 `items?: ReceiptItem[]` 支援商品明細儲存。
- 記帳面板提供切換「多品項明細模式」，支援品名、數量、金額與即時自動加總。
- 整合現有一體化 `CalculatorKeypad`，支援選中品項金額時透過計算機結算確認輸入。
- 在 [ReceiptCard.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ledger/ReceiptCard.vue) 收據小票卡片中支援顯示品項徽章與點擊展開擬真紙本小票明細。

**Non-Goals:**
- 不進行多目標節點分支分流（子品項無獨立方向性，收據去向單一）。
- 不引入跨多個出款帳戶的混合支付。

## Decisions

1. **內嵌集合式資料模型（Embedded Collection）**
   - **決定**：
     ```typescript
     export interface ReceiptItem {
       id: string;
       name: string;
       amount: number;
       quantity?: number;
     }
     ```
   - **原因**：無方向性的純商品明細直接內嵌於 `FinanceEdge.items`，IndexedDB 天然支援巢狀物件陣列，保持讀取效能且無需多表關聯。

2. **嚴格金額加總連動（Strict Sum Calculation）**
   - **決定**：在多品項明細模式下，收據的總金額 `edge.amount` 嚴格由 `sum(items.map(i => i.amount))` 即時計算，確保明細與總帳完全一致。

3. **計算機鍵盤整合（Keypad Interaction）**
   - **決定**：選中特定品項的金額欄位時，由下方共用 `CalculatorKeypad` 輸入，點擊 `=` 完成該項金額結算。

4. **收據小票折疊展開展示（Receipt Breakdown Display）**
   - **決定**：卡片標註「N 個品項」徽章，點擊卡片展開擬真小票清單（條列品名、數量與金額小計）。

## Risks / Trade-offs

- **[舊資料相容性]** → `items` 為 optional 欄位，既有單筆收據在未提供 items 時完全不受影響，100% 向下相容。
