## Context

目前 [QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/QuickEntrySheet.vue) 使用原生 `<input inputmode="decimal">` 輸入金額，並將送出按鈕置於整個表單底部。在行動裝置上，原生數字鍵盤會推擠抽屜，且無法直接做加減運算；此外，隨著功能擴充（標籤與待執行開關），儲存按鈕常需要滑動到底部才能點擊。

本設計旨在重構 [QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/QuickEntrySheet.vue) 的佈局架構，引入自製 4x4 記帳小算盤與底部固定操作列。

## Goals / Non-Goals

**Goals:**
- 提供 4×4 數字小算盤（`0~9`, `.`, `+`, `-`, `C`, `⌫`, `=`），支援即時連續加減運算與結算。
- 將金額顯示盒與算式預覽（Expression）分離，點擊數字時不調用系統鍵盤。
- 將記帳抽屜重構為「頂部 Header + 可滾動 Body (`overflow-y: auto`) + 固定底部 Footer (`flex-shrink: 0`)」結構。
- 底部按鈕釘選在螢幕下方，並包含 iOS `safe-area-inset-bottom` 安全區適配。
- 標籤改為單行橫向滑動 Chips，優化手機垂直空間。

**Non-Goals:**
- 不包含複雜科學計算機函數（如括號、乘除、百分比等，記帳場景以加減運算為主）。
- 不影響後端資料庫模型或 Dexie.js Schema。

## Decisions

### 1. 算式解析與狀態管理
- **決策**：在元件內維護 `expression`（算式字串，如 `"85+35"`）與 `evalValue`（即時計算出的數值）。
- **理由**：當使用者輸入運算符時可即時在上方顯示算式，主要金額以大字體即時顯示目前結果，點擊 `=` 或儲存時自動結算。
- **替代方案**：使用第三方 `eval` 函式庫（太重且有安全疑慮，自製簡單的 token-based 加減解析器更輕量安全）。

### 2. 抽屜三段式容器佈局（Three-Tier Sheet Layout）
- **決策**：
  ```
  .sheet (flex column, max-height: 90dvh)
  ├── .sheet-header (flex-shrink: 0)
  ├── .sheet-scrollable-body (flex: 1, overflow-y: auto)
  └── .sheet-fixed-footer (flex-shrink: 0, safe-area-padding)
  ```
- **理由**：徹底分離滾動區域與操作區域，按鈕永遠固定可見，手感最佳。

## Risks / Trade-offs

- **[Risk] 小螢幕手機（如 iPhone SE）垂直空間緊湊** → 將鍵盤按鈕高度控制在 `40~44px`，標籤採用單行水平滾動，確保在小螢幕上主要輸入區一目了然。
- **[Risk] 算式輸入異常（如連續輸入 `++` 或以 `.` 結尾）** → 撰寫嚴謹的按鍵過濾邏輯（Token Validator），防止非法輸入。
