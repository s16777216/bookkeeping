## Why

傳統會計將節點劃分為「資產、負債、收入、支出」，使一般使用者必須先理解會計分類，才能記錄生活中的付款、收款、朋友借還款與代墊。這也使「尚未完成的承諾」無法自然表達。

本變更改以圖論的兩個直覺維度記帳：節點的資金主權，以及交易是否已實際執行。主權界定資金是否跨越使用者邊界；執行日期界定資金是否已發生。交易的生活語意（薪資、還款、餐飲、代墊等）則由使用者可管理的標籤表達，而非由系統硬編碼。

## What Changes

- **節點主權模型**：`FinanceNode` 移除舊 `type` 分類，改以 `owner: 'me' | 'external'` 區分我的帳戶與外部對象。舊節點會自動映射為新主權模型。
- **交易執行模型**：`FinanceEdge` 新增 `created_at` 與可空的 `executed_at`。`Boolean(executed_at)` 即為是否已執行；未執行交易代表待結算承諾，而非實際現金流。
- **主權邊界運算**：只有已執行交易影響總資產、收入與支出。未執行的 `external -> me` 與 `me -> external` 分別形成待收與待付，先在同一外部對象內淨額化、再跨對象分開彙總。
- **交易標籤與標籤管理**：新增獨立標籤資料表；交易以 `tag_ids` 關聯可多選標籤。標籤可搜尋、新增、重新命名與封存，且不參與資產或收支計算。
- **介面適配**：節點管理按主權分組並支援封存；快速記帳可建立已執行或待執行交易；帳本將待執行項目置頂並可標記完成或撤回執行；圖論分析改為我的帳戶結餘、待收款與待付款。

## Capabilities

### New Capabilities
- `node-ownership-ledger`: 規範以節點主權、交易執行日期與交易標籤管理財務圖論、現金流與待結算承諾。

### Modified Capabilities
<!-- 無既有 specs 修改 -->

## Impact

- **型別與資料庫**：`src/types/finance.ts`、`src/db/index.ts`、`src/db/seeds.ts`
- **運算邏輯**：`src/composables/useGraphEngine.ts`
- **UI 元件**：`src/components/NodesView.vue`、`src/components/QuickEntrySheet.vue`、`src/components/ReceiptCard.vue`、`src/components/ReceiptFeed.vue`、`src/components/GraphView.vue`、`src/components/BalanceBanner.vue`
- **應用資料流**：`src/App.vue`
- **相依變更協調**：`add-node-editing-feature` 與 `add-multi-item-receipts` 亦修改節點／交易與相關 UI；實作時須依本變更的新資料模型整合。
