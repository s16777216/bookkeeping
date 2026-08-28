# Proposal: 手機優先 PWA 圖論收據記帳前端核心 (Mobile PWA Graph Receipt Bookkeeper)

## Intent

傳統記帳軟體多基於固定分類或複式簿記的嚴格借貸表單，難以直觀呈現資金流轉與靈活擴展。本變更旨在建立以「圖論（Graph Theory）」為核心的 **手機優先（Mobile-First）Local-first PWA 記帳應用**，使用 Dexie.js (IndexedDB) 實作本地極速儲存與即時餘額計算引擎，並以「數位收據（Paperless Receipt）」美學打造單手操作的手機版操作體驗，支援完全離線運行與 PWA 安裝。

## Scope

### In Scope

- **手機優先 PWA 基礎架構**：
  - 初始化 Vite + Vue 3 + TypeScript 專案。
  - 整合 `vite-plugin-pwa`，配置 Web App Manifest、離線 Service Worker 與 Standalone 獨立應用模式。
  - 適配行動裝置 Viewport 與 iOS / Android Safe Area Insets（瀏海與底部橫條）。
- **本地圖資料庫 Schema 設計**：使用 Dexie.js 建立 `nodes` 與 `edges` 表，支援 ULID 主鍵、時間戳與軟刪除（Tombstone）。
- **圖論核心運算引擎 (Graph Engine)**：
  - 節點管理（帳戶/分類 CRUD 與軟刪除）。
  - 款項流動管理（交易邊 CRUD 與軟刪除）。
  - 入度（In-degree）與出度（Out-degree）動態計算。
  - 資產餘額、支出合計、收入合計即時查詢。
- **手機收據風格介面 (Mobile Receipt UI)**：
  - 頂部資產看板與即時收支卡片。
  - 觸控友善的「從哪裡 ➔ 到哪裡」連線記帳底部抽屜（Bottom Sheet）與數字鍵盤。
  - 質感數位收據瀑布流清單（撕紙虛線、條碼裝飾、ULID 編號）。

### Out of Scope

- 跨幣別轉換與點數折抵系統（後續階段延伸）。
- 多人拆帳與群組帳本關聯（後續階段延伸）。
- Rust / Axum 後端服務與雲端 LWW 同步（階段二規劃）。
- D3.js 動態桑基圖（Sankey Diagram）深度視覺化（階段四規劃）。

## Capabilities

### New Capabilities

- `graph-engine`: 本地圖論記帳資料模型（Nodes & Edges）、Dexie.js 儲存層與餘額統計計算引擎。
- `mobile-receipt-ui`: 手機優先 PWA 介面、收據卡片流、連線記帳底部抽屜與即時看板。

### Modified Capabilities

- 無（本專案初始建立）。

## Impact

- **Breaking Changes**: 無。
- **Dependencies**: Vue 3, Vite, TypeScript, Dexie, `ulid`, `vite-plugin-pwa`。
- **Performance**: 100% 本地 IndexedDB 讀寫與記憶體聚合運算，PWA 離線秒開，零網路延遲。
- **Security**: 資料 100% 留存在本地行動裝置 IndexedDB，無隱私外洩風險。
