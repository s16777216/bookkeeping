## Context

參見 `proposal.md`。目前所有 13 個元件扁平混在 `src/components/` 根目錄，`App.vue` 混合了 Ledger 分頁的組裝與狀態，而 `QuickEntrySheet.vue` 單一檔案長達 1025 行，內含複雜的 iOS 計算機按鍵盤樣式與互動。在即將進行多品項收據功能（`add-multi-item-receipts`）之前，需要重構職責邊界以利長遠維護。

## Goals / Non-Goals

**Goals:**
- 將主分頁視圖統一抽離至 `src/views/`（新增 `LedgerView.vue`，移動 `GraphView.vue` 與 `NodesView.vue`）。
- 抽離 `CalculatorKeypad.vue` 至 `src/components/common/`，將 `QuickEntrySheet.vue` 拆解瘦身。
- 將剩餘元件依領域劃分至 `sheets/`、`ledger/` 與 `common/` 三大目錄。
- 維持既有功能、樣式、PWA 與手勢行為 100% 不變，無任何行為迴歸（Zero Behavioral Regressions）。
- 確保所有相對 import 路徑正確，通過 `npm run build` 型別與打包驗證。

**Non-Goals:**
- 不引入 `vue-router`，維持輕量 `v-if="currentTab"` 狀態驅動。
- 不更改既有業務邏輯、圖論運算或 Dexie 資料模型。

## Decisions

### 1. 目錄分層規範與檔案搬移映射

```
src/
├── views/
│   ├── LedgerView.vue         [NEW] 由 App.vue 抽離組裝
│   ├── GraphView.vue          [MOVE] src/components/GraphView.vue -> src/views/
│   └── NodesView.vue          [MOVE] src/components/NodesView.vue -> src/views/
│
├── components/
│   ├── sheets/
│   │   ├── BaseSheet.vue       [MOVE] src/components/BaseSheet.vue -> sheets/
│   │   ├── QuickEntrySheet.vue [MOVE] src/components/QuickEntrySheet.vue -> sheets/
│   │   ├── NodeFormSheet.vue   [MOVE] src/components/NodeFormSheet.vue -> sheets/
│   │   └── IconPickerSheet.vue [MOVE] src/components/IconPickerSheet.vue -> sheets/
│   │
│   ├── ledger/
│   │   ├── BalanceBanner.vue   [MOVE] src/components/BalanceBanner.vue -> ledger/
│   │   ├── QuickNodeBar.vue    [MOVE] src/components/QuickNodeBar.vue -> ledger/
│   │   ├── ReceiptFeed.vue     [MOVE] src/components/ReceiptFeed.vue -> ledger/
│   │   └── ReceiptCard.vue     [MOVE] src/components/ReceiptCard.vue -> ledger/
│   │
│   └── common/
│       ├── HeaderBar.vue       [MOVE] src/components/HeaderBar.vue -> common/
│       ├── BottomNavBar.vue    [MOVE] src/components/BottomNavBar.vue -> common/
│       ├── NodeIcon.vue        [MOVE] src/components/NodeIcon.vue -> common/
│       └── CalculatorKeypad.vue [NEW] 抽離計算機 5 列按鍵盤
```

### 2. `CalculatorKeypad.vue` 介面與職責
- **Props**:
  - `clearButtonText: string` (例如 "AC" 或 "C")
- **Emits**:
  - `(e: "press", key: string): void`
- **職責**:
  - 封裝 5 列 iOS 樣式小算盤鍵盤按鈕（AC/C、⌫、%、÷、×、-、+、=、0-9、小數點）。
  - 處理按鍵震動回饋（haptic feedback）與按壓觸覺動畫。
  - `QuickEntrySheet.vue` 僅需監聽 `@press="handleKeypadPress"`，省去數百行按鍵 HTML 與 CSS。

### 3. `LedgerView.vue` 介面與職責
- **Props**:
  - `metrics: SummaryMetrics`
  - `nodes: FinanceNode[]`
  - `edges: FinanceEdge[]`
  - `nodeMap: Map<string, FinanceNode>`
  - `tagMap: Map<string, FinanceTag>`
  - `getNodeBalance: (id: string) => number`
- **Emits**:
  - `(e: "openEntry", node?: FinanceNode): void`
  - `(e: "deleteEdge", id: string): void`
  - `(e: "completeEdge", id: string): void`
  - `(e: "undoEdge", id: string): void`
- **職責**:
  - 組裝 `BalanceBanner`、`QuickNodeBar` 與 `ReceiptFeed`。
  - 讓 `App.vue` 大幅簡化，只負責整體容器骨架、資料載入與目前 Tab 切換。

## Risks / Trade-offs

- **[Risk] 檔案搬移後 import 路徑失效** → Mitigation: 依照由內而外（Common/Ledger -> Sheets -> Views -> App.vue）的順序搬移並重整路徑，最後執行 `npm run build` 進行全站 TypeScript 編譯嚴格把關。
- **[Risk] 動畫或樣式 scoped 滲透問題** → Mitigation: 移動時完整保留各元件內部的 `<style scoped>`，不更動 class 名稱與 CSS 變數。

## Migration Plan

1. **第 1 階段**：獨立抽離 `CalculatorKeypad.vue` 並簡化 `QuickEntrySheet.vue`。
2. **第 2 階段**：獨立封裝 `LedgerView.vue` 並精簡 `App.vue`。
3. **第 3 階段**：依結構建立新子目錄，搬移現有元件並更新 import 路徑。
4. **第 4 階段**：執行 `npm run build`，驗證型別與打包全數正常。
