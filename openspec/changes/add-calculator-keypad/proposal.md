## Why

在記帳流程中，輸入金額使用手機原生軟鍵盤容易推擠畫面、彈出收合延遲，且無法直接進行連續算式計算（例如外食合算 `85 + 35`）。同時，隨著記帳抽屜欄位增加（標籤、待執行切換），送出按鈕若置於可滾動內容底部，會導致使用者每次都需滾動至最下方才能儲存。

導入「自製記帳小算盤鍵盤」並將「儲存按鈕固定於抽屜底部」，能夠大幅提升單手記帳流暢度與專業手感。

## What Changes

- **自製小算盤金額輸入（Calculator Keypad）**：在 [QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/QuickEntrySheet.vue) 導入 4×4 數字鍵盤（包含 `0~9`、`.`、`+`、`-`、`C`、`⌫`、`=`），支援算式即時解析與運算。
- **金額顯示盒（Amount Display Box）**：顯示算式預覽（Expression）與大字體金額（JetBrains Mono），點擊不觸發系統軟鍵盤。
- **底部固定操作列（Fixed / Sticky Footer）**：將儲存按鈕獨立固定於抽屜底部（不受上方表單與鍵盤滾動影響），並自動適配手機底部安全區 `safe-area-inset-bottom`。
- **空間與排版優化**：標籤採用單行水平滑動（Horizontal Scroll Chips），保持畫面俐落簡潔。

## Capabilities

### New Capabilities
- `calculator-keypad-entry`: 在記帳抽屜中提供自製數字小算盤輸入、算式即時計算，以及底部固定操作按鈕。

### Modified Capabilities

## Impact

- **前端元件**：[src/components/QuickEntrySheet.vue](file:///c:/Users/l1597/OneDrive/桌面/bookkeeping/src/components/QuickEntrySheet.vue)
- **依賴與 API**：無新增外部依賴，純前端 Vue 3 + CSS 變數與 Touch 手勢相容。
