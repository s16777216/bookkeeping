## 1. 前端環境與手機 PWA 初始化

- [x] 1.1 初始化 Vite + Vue 3 + TypeScript 專案結構
- [x] 1.2 安裝必要套件（`dexie`, `ulid`, `vite-plugin-pwa`）及型別定義
- [x] 1.3 配置 `vite.config.ts` 中的 PWA Web App Manifest 與 Service Worker 離線快取
- [x] 1.4 配置手機 Viewport、Safe-Area Inset 與 `Paperless Graph Ledger` 主題樣式變數

## 2. 資料模型與 Dexie.js 本地資料庫

- [x] 2.1 建立 `src/types/finance.ts` 定義 `NodeType`, `FinanceNode`, `FinanceEdge`
- [x] 2.2 建立 `src/db/index.ts` 實作 Dexie 資料庫與複合索引結構（`[from_node_id+is_deleted]`, `[to_node_id+is_deleted]`）
- [x] 2.3 實作預設種子資料（薪資、玉山銀行、現金皮夾、悠遊卡、餐飲飲食、交通等預設節點）

## 3. 圖論核心運算引擎 (Graph Engine)

- [x] 3.1 實作節點 CRUD 與軟刪除函式（`createNode`, `updateNode`, `softDeleteNode`）
- [x] 3.2 實作交易邊 CRUD 與軟刪除函式（`createEdge`, `updateEdge`, `softDeleteEdge`）
- [x] 3.3 實作節點入度/出度與餘額計算核心函式（`calculateNodeBalance`）
- [x] 3.4 實作資產總額、收入合計與支出合計統計函式（`getSummaryMetrics`）

## 4. 手機收據記帳介面實作與端到端驗證

- [x] 4.1 實作手機頂部狀態列（HeaderBar）與資產收支看板（BalanceBanner）
- [x] 4.2 實作常用節點橫向滑動晶片列（QuickNodeBar）
- [x] 4.3 實作實體質感「數位收據卡片」（ReceiptCard）與收據瀑布流清單（ReceiptFeed）
- [x] 4.4 實作單手操作「連線記帳底部抽屜」（QuickEntrySheet）與金額輸入介面
- [x] 4.5 實作底部導航列（BottomNavBar）與一鍵載入預設資料按鈕，完成整體手機 PWA 記帳驗證
