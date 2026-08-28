# Design: 手機優先 PWA 圖論收據記帳前端核心 (Mobile PWA Graph Receipt Bookkeeper)

## Context

專案定位為 **手機優先 (Mobile-First)** 的 Local-first 圖論記帳應用程式。
透過將記帳行為抽象為 **節點 (Nodes)** 與 **有向邊 (Edges)**，並以實體質感的 **數位收據 (Digital Receipt)** 形式展現每筆交易，讓使用者在手機上享受極致直觀、極速且具備儀式感的記帳體驗。

此變更打造第一階段前端核心架構：利用 Vue 3 + TypeScript 建立專案骨幹，整合 `vite-plugin-pwa` 實現 PWA 獨立視窗與離線快取，使用 Dexie.js (IndexedDB) 提供本地持久化與索引查詢，並以 Stitch 產出的 `Paperless Graph Ledger` 設計系統建構手機端收據記帳介面。

## Goals / Non-Goals

### Goals
- 建立 Vite + Vue 3 + TypeScript 專案架構，整合 `vite-plugin-pwa` 支援手機 PWA 安裝與完全離線運作。
- 手機 Viewport 與 Safe Area 最佳化適配（支援 iOS 底部橫條與瀏海螢幕）。
- 使用 Dexie.js 定義 `FinanceDatabase`，包含 `nodes` 與 `edges` 表及其複合索引（Compound Indexes）。
- 封裝 `useGraphEngine` Composable，提供節點與交易邊的完整 CRUD、軟刪除（Tombstones）及實時餘額計算。
- 依據 `Paperless Graph Ledger` 設計系統實作手機收據首頁、數位收據卡片流、以及單手操作的連線記帳底部抽屜（Bottom Sheet）。

### Non-Goals
- 跨幣別轉換、即時匯率計算或多幣別混用。
- 多人拆帳、群組帳本與多租戶權限控制。
- 實作遠端 Rust 後端或執行 `POST /api/sync` 雲端同步。
- 引入 D3.js 完整桑基圖（此為階段四目標，本階段專注於手機收據記帳與圖論核心）。

## Decisions

### 1. 手機優先 PWA 架構 (Mobile-First PWA)
- **Decision**: 採用 `vite-plugin-pwa` 配置 Service Worker 與 Web Manifest (`display: standalone`, `theme_color: #FBFBFA`)。
- **Rationale**: 讓手機使用者能直接將網頁「加到主畫面」作為原生 App 使用，免去應用程式商店審核，且即使處於飛航模式也能秒開記帳。
- **Alternatives considered**: 純 Web 響應式網頁（缺乏原生 App 視窗沈浸感與強大的離線快取保障）。

### 2. 數位收據設計語言 (Paperless Receipt UI)
- **Decision**: 採用 Stitch 建立的 `Paperless Graph Ledger` 設計規範：
  - 底色：米白紙感 `#FBFBFA`。
  - 字體：`Inter` (介面標籤) + `JetBrains Mono` (金額、時間、ULID 編號)。
  - 卡片：微陰影、虛線分隔、撕紙邊緣細節、條碼裝飾。
- **Rationale**: 將枯燥的記帳轉換為有溫度的生活收據收集體驗，視覺清晰且具備極佳的掃視效率。

### 3. ULID 唯一識別碼與 Dexie 本地圖資料庫
- **Decision**: 使用 `ulid` 生成 ID，並在 Dexie.js 中建立 `[from_node_id+is_deleted]` 與 `[to_node_id+is_deleted]` 複合索引。
- **Rationale**: 保證毫秒級時間排序與分散式唯一性，並確保餘額計算時索引快速過濾有效交易。

## Technical Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Mobile PWA Viewport                  │
│       (Max-width 480px, Centered, Safe-Area Padded)    │
├────────────────────────────────────────────────────────┤
│                      UI Layer                          │
│   - HeaderBar (Sync status, Date, Title)               │
│   - BalanceBanner (Total Assets, Income, Expense)      │
│   - QuickNodeBar (Horizontal Scroll Node Chips)        │
│   - ReceiptFeed (Virtual/Responsive Receipt Cards)     │
│   - QuickEntrySheet (Bottom Sheet for From->To Entry)  │
│   - BottomNavBar (Home, Analytics, Nodes, Settings)    │
└───────────────────────────┬────────────────────────────┘
                            │ reactive state / composable
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Composable Layer                     │
│                  (useGraphEngine.ts)                   │
│   - loadDefaultData()                                  │
│   - createNode() / softDeleteNode()                    │
│   - createEdge() / softDeleteEdge()                    │
│   - calculateNodeBalance(nodeId)                       │
│   - getSummaryMetrics()                                │
└───────────────────────────┬────────────────────────────┘
                            │ async DB queries
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Storage Layer (Dexie)                 │
│   - Table<FinanceNode, string>                         │
│   - Table<FinanceEdge, string>                         │
└────────────────────────────────────────────────────────┘
```

## Data Models

```typescript
export type NodeType = 'asset' | 'liability' | 'income' | 'expense';

export interface FinanceNode {
  id: string;          // ULID
  name: string;        // 帳戶或分類名稱
  type: NodeType;      // 節點類型
  currency?: string;   // 預設 'TWD'
  updated_at: number;  // 毫秒時間戳記 (LWW)
  is_deleted: boolean; // 軟刪除標記
}

export interface FinanceEdge {
  id: string;          // ULID
  from_node_id: string;// 資金來源節點 ID
  to_node_id: string;  // 資金目標節點 ID
  amount: number;      // 金額 (正數)
  timestamp: number;   // 交易發生時間戳記
  memo?: string;       // 備註
  updated_at: number;  // 毫秒時間戳記 (LWW)
  is_deleted: boolean; // 軟刪除標記
}
```

## Risks & Mitigations

- **Risk**: 手機瀏覽器底部導航列（Home bar）或瀏海可能遮擋介面元件。
  - **Mitigation**: 在 CSS 中全域套用 `env(safe-area-inset-top)` 與 `env(safe-area-inset-bottom)`。
- **Risk**: 首次離線加載時快取失效。
  - **Mitigation**: 使用 `vite-plugin-pwa` 的 `generateSW` 模式，預先快取所有 HTML, JS, CSS 與靜態圖示資源。
