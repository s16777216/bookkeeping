## 1. iOS 暫存器狀態機核心與四則運算

- [x] 1.1 在 [src/components/QuickEntrySheet.vue](file:///e:/works/記帳/src/components/QuickEntrySheet.vue) 實作標準暫存器狀態機（`displayValue`, `previousValue`, `activeOperator`, `waitingForOperand`, `isEvaluated`）與四則運算（`+`, `-`, `×`, `÷`, `%`）
- [x] 1.2 實作連續鏈式運算（Chaining）與重複按等號邏輯
- [x] 1.3 實作 `AC` 與 `C` 動態切換邏輯與數字區向左滑動退格手勢

## 2. 標準 iOS 5 列佈局與黑白極簡樣式

- [x] 2.1 在 [src/components/QuickEntrySheet.vue](file:///e:/works/記帳/src/components/QuickEntrySheet.vue) 重構鍵盤網格為標準 iOS 5 列排版（包含 `0` 鍵跨兩欄寬度、`AC/C`、`⌫`、`%`、`÷`、`×`、`-`、`+`、`=`）
- [x] 2.2 實作運算符按鍵選中時的反色高亮（Active Operator Highlight）與切換視覺
- [x] 2.3 控制 5 列按鍵高度（38~40px），確保在 Scrollable Body 中緊湊舒適

## 3. 歷史算式條保留可見與送出防呆驗證

- [x] 3.1 升級金額顯示盒，頂部展示精緻淡色歷史算式條（輸入時顯示算式進度，按 `=` 後保留顯示 `${prev} ${op} ${curr} =`）
- [x] 3.2 實作未結算防呆校驗（有運算符且未按 `=` 時禁止送出）與建置測試（`npm run build`）
