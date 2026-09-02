## Why

日常生活在大賣場、超市或超商購物時，單筆消費往往包含多個商品品項（如鮮奶、抹布、零食）。目前收據僅能記錄單一總金額與備忘，無法紀錄詳細購買明細。
透過支援「多品項收據明細（Multi-Item Receipts）」，使用者可在單筆交易內記錄多個商品品項名稱、金額與數量，並由介面自動計算總額，在收據帳本中完整還原如紙本超商發票小票般的明細查閱體驗。

## What Changes

- **資料模型擴充（Data Model）**：在 [src/types/finance.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/types/finance.ts) 中新增 `ReceiptItem` 介面（包含 `id`, `name`, `amount`, `quantity?`），並在 `FinanceEdge` 中擴充 `items?: ReceiptItem[]`。
- **單一金流架構維持（Single Flow Integrity）**：收據維持嚴格的「單一來源（`from_node_id`）➔ 單一去向（`to_node_id`）」金流方向，圖論記帳引擎保持高效單一邊計算。
- **記帳面板明細模式（QuickEntrySheet）**：在 [src/components/sheets/QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/sheets/QuickEntrySheet.vue) 提供「快速單筆」與「多品項明細」切換，支援逐項編輯品名、金額、數量，並整合下方計算機鍵盤輸入與總額自動加總防呆。
- **擬真收據小票卡片升級（ReceiptCard）**：在 [src/components/ledger/ReceiptCard.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ledger/ReceiptCard.vue) 首頁收據卡片中支援顯示「N 個品項」徽章，並提供點擊展開/收合明細小票清單。

## Capabilities

### New Capabilities
- `multi-item-receipts`: 規範單張收據內多品項內容明細（Line Items）的建立、編輯、總額自動同步與小票折疊展開展示。

### Modified Capabilities
<!-- 無既有 specs 修改 -->

## Impact

- **型別定義**：[src/types/finance.ts](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/types/finance.ts)
- **記帳抽屜**：[src/components/sheets/QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/sheets/QuickEntrySheet.vue)
- **收據卡片**：[src/components/ledger/ReceiptCard.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/ledger/ReceiptCard.vue)
- **資料庫**：IndexedDB 自動向下相容既有單筆收據（`items` 為 optional）。
