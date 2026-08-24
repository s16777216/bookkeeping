## 1. 資料模型、資料庫與遷移

- [ ] 1.1 在 `src/types/finance.ts` 定義 `NodeOwner`、`FinanceTag`，並將 `FinanceNode` 改為 owner 模型；將 `FinanceEdge.timestamp` 改為 `created_at`、`executed_at` 與可選 `tag_ids`
- [ ] 1.2 在 `src/db/index.ts` 升級 Dexie schema，新增 tags table 與 owner、executed_at、標籤查詢所需索引
- [ ] 1.3 實作舊節點 `type` 到 owner、舊邊 `timestamp` 到 created_at/executed_at 的相容讀取或一次性遷移，且保留舊資料的帳務結果
- [ ] 1.4 更新 `src/db/seeds.ts`，提供我的帳戶、外部對象、已執行交易、待收／待付款與交易標籤的示範資料

## 2. 圖論引擎與資料生命週期

- [ ] 2.1 重構 `useGraphEngine.ts`，僅以 `executed_at` 非空的邊計算帳戶結餘、總資產、收入、支出與內部轉帳
- [ ] 2.2 實作按外部對象淨額化的待收／待付計算；同一對象互相抵銷，不同對象維持分開彙總
- [ ] 2.3 新增建立待執行交易、標記執行、撤回執行與依 executed_at 排序的引擎介面
- [ ] 2.4 新增標籤搜尋、正規化去重、建立、重新命名與封存的資料操作；確保封存標籤可解析歷史交易
- [ ] 2.5 調整節點刪除為封存語意，避免被未封存交易引用的節點失去主權解析能力

## 3. 節點、交易與標籤介面

- [ ] 3.1 更新 `NodesView.vue`，依「我的帳戶」與「外部對象」分組，建立／編輯時選擇 owner，並提供封存操作
- [ ] 3.2 更新 `QuickEntrySheet.vue`，預設建立已執行交易，提供建立為待執行的切換，以及多標籤搜尋／新增與管理入口
- [ ] 3.3 在交易表單加入標籤管理介面，支援新增、重新命名、封存標籤並排除封存標籤的新增交易候選
- [ ] 3.4 更新 `ReceiptFeed.vue` 與 `ReceiptCard.vue`，將待執行交易置頂、按待收／待付呈現，並提供標記完成及撤回完成操作
- [ ] 3.5 更新 `GraphView.vue` 與 `BalanceBanner.vue`，呈現我的帳戶結餘、依對象淨額化的待收／待付款，以及僅含已執行交易的資產、收入與支出
- [ ] 3.6 更新 `App.vue` 的 props、事件與資料流，以串接節點封存、交易執行狀態與標籤管理

## 4. 與既有變更整合及驗證

- [ ] 4.1 對齊 `add-node-editing-feature` 的節點編輯抽屜，使其編輯 owner 與封存狀態而非舊 type
- [ ] 4.2 對齊 `add-multi-item-receipts`：本變更僅在收據層級持有 tag_ids，且其圖論計算遵守 executed_at 規則
- [ ] 4.3 為已執行收入、支出、內部轉帳、待收／待付款淨額化、完成／撤回完成、標籤封存與舊資料遷移加入或更新測試
- [ ] 4.4 執行 `npm run build`，並手動驗證新交易、待執行完成、撤回、節點封存、標籤封存與看板／圖論數值
