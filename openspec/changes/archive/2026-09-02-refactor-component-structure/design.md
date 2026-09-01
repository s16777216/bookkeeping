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

### 2. `CalculatorKeypad.vue` 一體化介面與職責

經 `/opsx-grill` 壓力測試定案，採 **一體化高內聚封裝**：
- **職責範圍**：
  - 封裝「頂部算式條（`historyExpression`）」、「主金額顯示盒（`amount-display-box`）」、「向左滑動退格手勢（`handleNumberTouchEnd`）」與「5 列 iOS 樣式小算盤鍵盤按鈕」。
  - 完整內聚四則運算狀態機（暫存器、`calculate()`、千分位格式化 `formattedDisplayValue`、運算子高亮與未結算呼吸動畫、除以零錯誤提示）。
- **Props / Emits / Expose**：
  - **Props**:
    - `modelValue?: number` (結算金額)
    - `isEvaluated?: boolean` (結算狀態)
  - **Emits**:
    - `(e: "update:modelValue", val: number): void`
    - `(e: "update:isEvaluated", evaluated: boolean): void`
    - `(e: "change", payload: { amount: number; isEvaluated: boolean }): void`
  - **Expose (`defineExpose`)**:
    - `reset: () => void` (提供父元件 `QuickEntrySheet` 於開啟抽屜時重置計算機狀態)
- **優勢**：
  - `QuickEntrySheet.vue` 徹底擺脫計算機狀態與上百行 CSS，僅需維護節點選擇、備註與送出防呆，行數自 1,025 行縮減至約 300 行。

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
  - 採顯式單向資料流，讓 `App.vue` 大幅簡化，只負責整體容器骨架、資料載入與目前 Tab 切換。

### 4. 模組引用規範：導入全站 `@/` 路徑別名

- 在 `vite.config.ts` 加入 `resolve.alias: { '@': path.resolve(__dirname, './src') }`。
- 在 `tsconfig.json` 加入 `"baseUrl": "."` 與 `"paths": { "@/*": ["src/*"] }`。
- 藉由本次重構全面淘汰 `../../` 深層相對路徑，全站統一使用 `@/views/...`、`@/components/...`、`@/types/...`，維持乾淨整潔的依賴關係。

## Risks / Trade-offs

- **[Risk] 檔案搬移後 import 路徑失效** → Mitigation: 配置 `@/` 別名後統一重構 import 路徑，最後執行 `npm run build` 進行全站 TypeScript 編譯嚴格把關。
- **[Risk] 動畫或樣式 scoped 滲透問題** → Mitigation: 移動時完整保留各元件內部的 `<style scoped>`，不更動 class 名稱與 CSS 變數。

## Migration Plan

1. **第 1 階段**：配置 `vite.config.ts` 與 `tsconfig.json` 之 `@/` 路徑別名支援。
2. **第 2 階段**：獨立抽離一體化 `CalculatorKeypad.vue` 並大幅簡化 `QuickEntrySheet.vue`。
3. **第 3 階段**：獨立封裝 `LedgerView.vue` 並精簡 `App.vue`。
4. **第 4 階段**：建立語義化子目錄，搬移現有元件並全面升級為 `@/` 別名引用。
5. **第 5 階段**：執行 `npm run build`，驗證型別、打包全數正常與全站功能零迴歸。
