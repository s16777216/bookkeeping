## Why

目前系統在新增收據（Edge）時，僅支援選取資金起點、終點、金額與備註，交易時間（`timestamp`）被強制鎖定為點擊送出的當下時間（`Date.now()`）。當使用者需要「補記過去的消費（如昨天、前天）」或「設定精確的消費時間（時:分）」時無法自訂，限制了記帳資料的真實性與靈活性。

## What Changes

- **新增日期與時分選擇欄位**：在 `QuickEntrySheet` 記帳抽屜中增加日期與時間（時:分）輸入元件（支援 `datetime-local` 原生選擇）。
- **新增時間快捷預設鍵**：提供「⚡ 現在」、「昨天」、「前天」等快速切換按鍵，點擊可立即代入對應時間並保留或微調時分。
- **送出資料帶入自訂時間戳記**：送出記帳表單時將使用者選擇的日期時間轉換為毫秒時間戳記（`timestamp`），傳入 `createEdge` 並保存至 IndexedDB。
- **維持時間倒序排列**：補記歷史帳目後，收據瀑布流清單（`ReceiptFeed`）依舊依照 `timestamp` 正確進行降冪排序呈現。

## Capabilities

### New Capabilities
<!-- 無新增獨立 capability -->

### Modified Capabilities
- `mobile-receipt-ui`: 擴充單手操作快捷記帳底部抽屜，支援自訂交易日期與時間（包含時:分）與快捷時間切換。

## Impact

- **Affected Components**:
  - `src/components/QuickEntrySheet.vue`: 新增日期時間選擇器與快捷標籤狀態、事件處理與樣式。
  - `src/App.vue`: `handleEntrySubmit` 接收 `timestamp` 並傳入 `createEdge`。
- **Data & APIs**:
  - `useGraphEngine.ts` 中 `createEdge` 已支援 `timestamp?: number`，無需破壞性變更。
